import z from '@deepseek-ai/schemastery'
import { credentialRef } from '@deepseek-ai/dsh-credentials'
import { createRequire } from 'node:module'
import { readFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import {
  buildPluginCatalog,
  composeIssueDraft,
  createDeviceFlowState,
  explicitConfirmation,
  findDuplicateIssues,
  isDeviceFlowExpired,
  metadataRepository,
  nextDevicePoll,
  parseCredential,
  parseGitHubRepository,
  prefilledIssueUrl,
  serializeCredential,
} from './domain.js'
import { createGitHubClient, GitHubApiError } from './github.js'
import { createIssueWithAttachments } from './attachments.js'

export const name = '@goodandready/dsh-issue-reporter'
export const inject = ['settings', 'webServer', 'credentials', 'loader', 'connection']

const NS = 'dsh-issue-reporter'
const require = createRequire(import.meta.url)

export const Config = z.object({
  appClientId: z.string().default('').description('Public GitHub App client id for Device Flow.'),
  tokenEnv: z.string().role('credential-ref').default('GITHUB_ISSUE_REPORTER_TOKEN').description('DSH credential reference for the user GitHub token.'),
  apiBaseUrl: z.string().default('https://api.github.com').description('GitHub API base URL.'),
  timeoutMs: z.number().default(30000).description('GitHub request timeout in milliseconds.'),
  ghPath: z.string().default('gh').description('GitHub CLI executable used for screenshot attachments.'),
})

function writeJson(res, status, payload) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(JSON.stringify(payload))
}

function authorizeRequest(ctx, req, res) {
  const rejection = ctx.connection.requestRejection(req)
  if (rejection === undefined) return true
  writeJson(res, rejection, {
    ok: false,
    error: rejection === 401 ? 'DSH browser authentication is required' : 'Trusted same-origin request required',
  })
  return false
}

function readJson(req, maxBytes = 512 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > maxBytes) {
        reject(new Error('request body too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')) }
      catch { reject(new Error('invalid JSON')) }
    })
    req.on('error', reject)
  })
}

function validModuleName(value) {
  return typeof value === 'string' && /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/i.test(value)
}

async function packageMetadata(moduleName) {
  if (!validModuleName(moduleName)) return undefined
  try {
    const packagePath = require.resolve(moduleName + '/package.json')
    return JSON.parse(await readFile(packagePath, 'utf8'))
  } catch {
    return undefined
  }
}

async function catalogFromLoader(loader) {
  const entries = []
  for (const entry of loader.entries()) {
    if (entry.options?.group) continue
    entries.push({
      entryId: entry.id,
      moduleName: entry.options?.name,
      enabled: !entry.disabled,
      fiberPhase: entry.fiber ? ({ 0: 'pending', 1: 'loading', 2: 'active', 3: 'failed', 4: null, 5: 'unloading' }[entry.fiber.state] || null) : null,
    })
  }
  const metadata = Object.fromEntries(await Promise.all(entries.map(async (entry) => [
    entry.moduleName,
    await packageMetadata(entry.moduleName),
  ])))
  return buildPluginCatalog({ entries }, metadata)
}

async function credentialValue(ctx, refName) {
  if (!refName || !ctx.credentials?.resolve) return undefined
  try {
    const resolved = await ctx.credentials.resolve(credentialRef(refName))
    return parseCredential(resolved?.value)
  } catch {
    return undefined
  }
}

async function credentialConfigured(ctx, refName) {
  if (!refName) return false
  try {
    if (typeof ctx.credentials?.describe === 'function') {
      const described = await ctx.credentials.describe(credentialRef(refName))
      return !!described?.configured
    }
  } catch {}
  return !!(await credentialValue(ctx, refName))
}

function publicConfig(config, tokenConfigured) {
  return {
    signInConfigured: Boolean(config.appClientId),
    tokenConfigured,
  }
}

function apiFor(config, token) {
  return createGitHubClient({
    baseUrl: config.apiBaseUrl,
    token,
    signal: AbortSignal.timeout(Math.max(1000, Number(config.timeoutMs) || 30000)),
  })
}

async function withGitHubCredential(ctx, config, operation) {
  const stored = await credentialValue(ctx, config.tokenEnv)
  if (!stored?.access_token) throw new Error('GitHub authentication is not configured')

  try {
    return await operation(stored.access_token)
  } catch (error) {
    const authFailure = (error instanceof GitHubApiError && error.status === 401) || /bad credentials|authentication failed|unauthorized|HTTP 401/i.test(error?.message || '')
    if (!authFailure || !stored.refresh_token || !config.appClientId) throw error

    let refreshed
    try {
      refreshed = await createGitHubClient({ baseUrl: config.apiBaseUrl }).refreshToken(config.appClientId, stored.refresh_token)
    } catch {
      throw new Error('GitHub authorization expired or was revoked; sign in again')
    }
    if (!refreshed?.access_token) throw new Error('GitHub authorization expired or was revoked; sign in again')

    const replacement = {
      ...refreshed,
      refresh_token: refreshed.refresh_token || stored.refresh_token,
    }
    await ctx.credentials.set(credentialRef(config.tokenEnv), serializeCredential(replacement))
    try {
      return await operation(replacement.access_token)
    } catch (retryError) {
      if (retryError instanceof GitHubApiError && retryError.status === 401) {
        throw new Error('GitHub authorization is invalid; sign in again')
      }
      throw retryError
    }
  }
}

function githubError(error) {
  if (error instanceof GitHubApiError) {
    if (error.status === 401) return { status: 401, error: 'GitHub authorization is invalid or expired; sign in again' }
    return { status: error.status || 502, error: error.message }
  }
  const message = error?.message || 'GitHub request failed'
  if (/bad credentials|github authorization/i.test(message)) return { status: 401, error: message }
  return { status: 502, error: message }
}

export function apply(ctx, config) {
  ctx.inject(['settings'], (sctx) => {
    const scope = sctx.settings.register(NS, Config, { base: config })
    Object.assign(config, scope.get() || {})
    const stop = scope.watch((next) => Object.assign(config, next || {}))
    sctx.effect(() => () => stop(), 'dsh-issue-reporter: settings')
  })
  const deviceFlows = new Map()

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-issue-reporter/status',
    handler: async (req, res) => {
      if (req.method !== 'GET' || !authorizeRequest(ctx, req, res)) return
      try {
        const [catalog, tokenConfigured] = await Promise.all([
          catalogFromLoader(ctx.loader),
          credentialConfigured(ctx, config.tokenEnv),
        ])
        writeJson(res, 200, { ok: true, config: publicConfig(config, tokenConfigured), plugins: catalog })
      } catch (error) {
        writeJson(res, 500, { ok: false, error: error?.message || 'Could not read DSH plugin inventory' })
      }
    },
  }), 'dsh-issue-reporter: status')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-issue-reporter/device/start',
    handler: async (req, res) => {
      if (req.method !== 'POST') { writeJson(res, 405, { ok: false, error: 'method not allowed' }); return }
      if (!authorizeRequest(ctx, req, res)) return
      if (!config.appClientId) { writeJson(res, 400, { ok: false, error: 'GitHub App client id is not configured' }); return }
      try {
        const result = await createGitHubClient({ baseUrl: config.apiBaseUrl }).deviceCode(config.appClientId)
        if (!result?.device_code || !result?.user_code || !result?.verification_uri) throw new Error('GitHub did not return a valid Device Flow response')
        const id = randomUUID()
        deviceFlows.set(id, {
          ...createDeviceFlowState(),
          clientId: config.appClientId,
          deviceCode: result.device_code,
        })
        writeJson(res, 200, {
          ok: true,
          flowId: id,
          userCode: result.user_code,
          verificationUri: result.verification_uri,
          expiresIn: result.expires_in,
          interval: result.interval,
        })
      } catch (error) {
        const failure = githubError(error)
        writeJson(res, failure.status, { ok: false, error: failure.error })
      }
    },
  }), 'dsh-issue-reporter: device start')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-issue-reporter/device/poll',
    handler: async (req, res) => {
      if (req.method !== 'POST') { writeJson(res, 405, { ok: false, error: 'method not allowed' }); return }
      if (!authorizeRequest(ctx, req, res)) return
      try {
        const body = await readJson(req, 16 * 1024)
        const flow = deviceFlows.get(typeof body.flowId === 'string' ? body.flowId : '')
        if (!flow || isDeviceFlowExpired(flow)) { writeJson(res, 410, { ok: false, error: 'Device Flow expired' }); return }
        const now = Date.now()
        if (now < flow.nextPollAt) { writeJson(res, 429, { ok: false, pending: true, retryAfterMs: flow.nextPollAt - now }); return }
        const result = await createGitHubClient({ baseUrl: config.apiBaseUrl }).accessToken(flow.clientId, flow.deviceCode)
        const state = nextDevicePoll(flow, result)
        deviceFlows.set(body.flowId, state)
        if (result?.error === 'authorization_pending' || result?.error === 'slow_down') {
          writeJson(res, 200, { ok: true, pending: true, retryAfterMs: state.intervalMs })
          return
        }
        if (!result?.access_token) {
          deviceFlows.delete(body.flowId)
          writeJson(res, 401, { ok: false, error: result?.error_description || result?.error || 'GitHub authorization failed' })
          return
        }
        await createGitHubClient({ baseUrl: config.apiBaseUrl, token: result.access_token }).currentUser()
        await ctx.credentials.set(credentialRef(config.tokenEnv), serializeCredential(result))
        deviceFlows.delete(body.flowId)
        writeJson(res, 200, { ok: true, authenticated: true })
      } catch (error) {
        const failure = githubError(error)
        writeJson(res, failure.status, { ok: false, error: failure.error })
      }
    },
  }), 'dsh-issue-reporter: device poll')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-issue-reporter/draft',
    handler: async (req, res) => {
      if (req.method !== 'POST') { writeJson(res, 405, { ok: false, error: 'method not allowed' }); return }
      if (!authorizeRequest(ctx, req, res)) return
      try {
        const body = await readJson(req)
        const repository = parseGitHubRepository(body.repository)
        if (!repository) { writeJson(res, 400, { ok: false, error: 'A supported GitHub repository is required' }); return }
        const draft = composeIssueDraft(body.draft)
        writeJson(res, 200, { ok: true, repository, draft, prefilledUrl: prefilledIssueUrl(repository, draft) })
      } catch (error) {
        writeJson(res, 400, { ok: false, error: error?.message || 'Could not compose draft' })
      }
    },
  }), 'dsh-issue-reporter: draft')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-issue-reporter/duplicates',
    handler: async (req, res) => {
      if (req.method !== 'POST') { writeJson(res, 405, { ok: false, error: 'method not allowed' }); return }
      if (!authorizeRequest(ctx, req, res)) return
      try {
        const body = await readJson(req)
        const repository = parseGitHubRepository(body.repository)
        const draft = composeIssueDraft(body.draft)
        if (!repository) { writeJson(res, 400, { ok: false, error: 'A supported GitHub repository is required' }); return }
        const stored = await credentialValue(ctx, config.tokenEnv)
        if (!stored?.access_token) { writeJson(res, 200, { ok: true, configured: false, items: [] }); return }
        const issues = await withGitHubCredential(ctx, config, (token) => apiFor(config, token).searchIssues(repository.owner, repository.repo, draft.title))
        const items = findDuplicateIssues(issues?.items || issues || [], draft).map((issue) => ({
          number: issue.number,
          title: issue.title,
          html_url: issue.url,
        }))
        writeJson(res, 200, { ok: true, configured: true, items })
      } catch (error) {
        const failure = githubError(error)
        writeJson(res, failure.status, { ok: false, error: failure.error })
      }
    },
  }), 'dsh-issue-reporter: duplicates')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-issue-reporter/create',
    handler: async (req, res) => {
      if (req.method !== 'POST') { writeJson(res, 405, { ok: false, error: 'method not allowed' }); return }
      if (!authorizeRequest(ctx, req, res)) return
      try {
        const body = await readJson(req, 32 * 1024 * 1024)
        if (!explicitConfirmation(body.confirm)) { writeJson(res, 400, { ok: false, error: 'Explicit confirmation is required before creating a GitHub issue' }); return }
        const repository = parseGitHubRepository(body.repository)
        if (!repository) { writeJson(res, 400, { ok: false, error: 'A supported GitHub repository is required' }); return }
        const draft = composeIssueDraft(body.draft)
        const stored = await credentialValue(ctx, config.tokenEnv)
        const fallback = prefilledIssueUrl(repository, draft)
        if (!stored?.access_token) { writeJson(res, 401, { ok: false, error: 'GitHub authentication is not configured', prefilledUrl: fallback }); return }
        const attachmentInput = Array.isArray(body.attachments) ? body.attachments : []
        const issue = attachmentInput.length
          ? await withGitHubCredential(ctx, config, (token) => createIssueWithAttachments({
              ghPath: config.ghPath,
              repository,
              draft,
              token,
              attachments: attachmentInput,
              timeoutMs: config.timeoutMs,
            }))
          : await withGitHubCredential(ctx, config, (token) => apiFor(config, token).createIssue(repository.owner, repository.repo, draft))
        writeJson(res, 200, {
          ok: true,
          issue: { number: issue.number, title: issue.title || draft.title, url: issue.url || issue.html_url },
          prefilledUrl: fallback,
        })
      } catch (error) {
        const failure = githubError(error)
        writeJson(res, failure.status, { ok: false, error: failure.error })
      }
    },
  }), 'dsh-issue-reporter: create')
}
