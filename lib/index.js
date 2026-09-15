import z from '@deepseek-ai/schemastery'
import { credentialRef } from '@deepseek-ai/dsh-credentials'
import { createRequire } from 'node:module'
import { readFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import {
  buildAiOptimizationPrompt,
  buildPluginCatalog,
  composeIssueDraft,
  createDeviceFlowState,
  explicitConfirmation,
  findDuplicateIssues,
  formatLogSnippet,
  isDeviceFlowExpired,
  metadataRepository,
  nextDevicePoll,
  parseAiOptimizedResponse,
  parseCredential,
  parseForgeRepository,
  parseGitHubRepository,
  parseIssueState,
  prefilledIssueUrl,
  recommendLabels,
  redactText,
  serializeCredential,
} from './domain.js'
import { createGitHubClient, createGiteaClient, GitHubApiError } from './github.js'
import { createIssueWithAttachments } from './attachments.js'
import { clearGitHubCredential } from './auth.js'
import { registerPluginUpdater } from './plugin-updater.js'

export const name = '@goodandready/dsh-issue-reporter'
export const inject = ['settings', 'webServer', 'credentials', 'loader']

const NS = 'dsh-issue-reporter'
const require = createRequire(import.meta.url)

export const Config = z.object({
  appClientId: z.string().default('').description('Public GitHub OAuth App client id for Device Flow.'),
  tokenEnv: z.string().role('credential-ref').default('GITHUB_ISSUE_REPORTER_TOKEN').description('DSH credential reference for the user GitHub OAuth token.'),
  apiBaseUrl: z.string().default('https://api.github.com').description('GitHub API base URL.'),
  giteaBaseUrl: z.string().default('').description('Optional local Gitea / Forgejo base URL.'),
  giteaTokenEnv: z.string().role('credential-ref').default('GITEA_ISSUE_REPORTER_TOKEN').description('DSH credential reference for Gitea token.'),
  timeoutMs: z.number().default(30000).description('GitHub request timeout in milliseconds.'),
  ghPath: z.string().default('gh').description('GitHub CLI executable used for screenshot attachments.'),
})

function writeJson(res, status, payload) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(JSON.stringify(payload))
}

function authorizeRequest(ctx, req, res) {
  const conn = ctx.reflect?.get?.('connection') || ctx.get?.('connection') || ctx.connection
  if (conn && typeof conn.requestRejection === 'function') {
    const rejection = conn.requestRejection(req)
    if (rejection !== undefined) {
      writeJson(res, rejection, {
        ok: false,
        error: rejection === 401 ? 'DSH browser authentication is required' : 'Trusted same-origin request required',
      })
      return false
    }
  }
  return true
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
    const state = entry.fiber?.state
    const fiberPhase = entry.fiber ? ({ 0: 'pending', 1: 'loading', 2: 'active', 3: 'failed', 4: null, 5: 'unloading' }[state] || null) : null
    const fiberError = entry.fiber?.error?.message || entry.error?.message || (state === 3 ? 'Plugin failed during runtime execution' : undefined)
    entries.push({
      entryId: entry.id,
      moduleName: entry.options?.name,
      enabled: !entry.disabled,
      fiberPhase,
      fiberError,
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

function publicConfig(config, tokenConfigured, giteaConfigured = false) {
  return {
    signInConfigured: Boolean(config.appClientId),
    tokenConfigured,
    giteaConfigured,
    giteaBaseUrl: config.giteaBaseUrl || '',
  }
}

function apiFor(config, token) {
  return createGitHubClient({
    baseUrl: config.apiBaseUrl,
    token,
    signal: AbortSignal.timeout(Math.max(1000, Number(config.timeoutMs) || 30000)),
  })
}

function giteaApiFor(config, token) {
  return createGiteaClient({
    baseUrl: config.giteaBaseUrl,
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
      const retryAuthFailure = (retryError instanceof GitHubApiError && retryError.status === 401) ||
        /bad credentials|authentication failed|unauthorized|HTTP 401/i.test(retryError?.message || '')
      if (retryAuthFailure) {
        throw new Error('GitHub authorization is invalid; sign in again')
      }
      throw retryError
    }
  }
}

function forgeError(error) {
  if (error instanceof GitHubApiError) {
    if (error.status === 401) return { status: 401, error: 'Authorization is invalid or expired; sign in again' }
    return { status: error.status || 502, error: error.message }
  }
  const message = error?.message || 'Remote request failed'
  if (/bad credentials|authorization/i.test(message)) return { status: 401, error: message }
  if (/GitHub App tokens? are not supported|OAuth App token or personal access token/i.test(message)) {
    return { status: 400, error: message }
  }
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
        const [catalog, tokenConfigured, giteaConfigured] = await Promise.all([
          catalogFromLoader(ctx.loader),
          credentialConfigured(ctx, config.tokenEnv),
          credentialConfigured(ctx, config.giteaTokenEnv),
        ])
        const diagnostics = {
          node: process.version,
          platform: process.platform,
          arch: process.arch,
        }
        writeJson(res, 200, {
          ok: true,
          config: publicConfig(config, tokenConfigured, giteaConfigured),
          plugins: catalog,
          diagnostics,
        })
      } catch (error) {
        writeJson(res, 500, { ok: false, error: error?.message || 'Could not read DSH plugin inventory' })
      }
    },
  }), 'dsh-issue-reporter: status')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-issue-reporter/device/logout',
    handler: async (req, res) => {
      if (req.method !== 'POST') { writeJson(res, 405, { ok: false, error: 'method not allowed' }); return }
      if (!authorizeRequest(ctx, req, res)) return
      try {
        await clearGitHubCredential(ctx.credentials, credentialRef(config.tokenEnv))
        deviceFlows.clear()
        writeJson(res, 200, { ok: true, authenticated: false })
      } catch (error) {
        writeJson(res, 503, {
          ok: false,
          error: error?.message || 'GitHub authorization could not be removed',
        })
      }
    },
  }), 'dsh-issue-reporter: device logout')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-issue-reporter/device/start',
    handler: async (req, res) => {
      if (req.method !== 'POST') { writeJson(res, 405, { ok: false, error: 'method not allowed' }); return }
      if (!authorizeRequest(ctx, req, res)) return
      if (!config.appClientId) { writeJson(res, 400, { ok: false, error: 'GitHub OAuth App client id is not configured' }); return }
      try {
        const result = await createGitHubClient({ baseUrl: config.apiBaseUrl }).deviceCode(config.appClientId, 'repo')
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
        const failure = forgeError(error)
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
        const failure = forgeError(error)
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
        const repository = parseForgeRepository(body.repository) || parseGitHubRepository(body.repository)
        if (!repository) { writeJson(res, 400, { ok: false, error: 'A supported repository is required' }); return }
        const draft = composeIssueDraft({ ...body.draft, labels: body.labels || body.draft?.labels })
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
        const repository = parseForgeRepository(body.repository) || parseGitHubRepository(body.repository)
        const draft = composeIssueDraft(body.draft)
        if (!repository) { writeJson(res, 400, { ok: false, error: 'A supported repository is required' }); return }
        const isGitea = repository.forge === 'gitea'
        const tokenRef = isGitea ? config.giteaTokenEnv : config.tokenEnv
        const stored = await credentialValue(ctx, tokenRef)
        if (!stored?.access_token) { writeJson(res, 200, { ok: true, configured: false, items: [] }); return }
        const searchState = body.includeClosed ? 'all' : 'open'
        let rawIssues
        if (isGitea) {
          const client = giteaApiFor(config, stored.access_token)
          rawIssues = await client.searchIssues(repository.owner, repository.repo, draft.title, searchState)
        } else {
          rawIssues = await withGitHubCredential(ctx, config, (token) => apiFor(config, token).searchIssues(repository.owner, repository.repo, draft.title, searchState))
        }
        const issueList = rawIssues?.items || (Array.isArray(rawIssues) ? rawIssues : [])
        const items = findDuplicateIssues(issueList, draft).map((issue) => ({
          number: issue.number,
          title: issue.title,
          html_url: issue.url,
          state: issue.state,
        }))
        writeJson(res, 200, { ok: true, configured: true, items })
      } catch (error) {
        const failure = forgeError(error)
        writeJson(res, failure.status, { ok: false, error: failure.error })
      }
    },
  }), 'dsh-issue-reporter: duplicates')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-issue-reporter/templates',
    handler: async (req, res) => {
      if (req.method !== 'POST') { writeJson(res, 405, { ok: false, error: 'method not allowed' }); return }
      if (!authorizeRequest(ctx, req, res)) return
      try {
        const body = await readJson(req)
        const repository = parseForgeRepository(body.repository) || parseGitHubRepository(body.repository)
        if (!repository) { writeJson(res, 400, { ok: false, error: 'A supported repository is required' }); return }
        if (repository.forge === 'gitea') {
          writeJson(res, 200, { ok: true, templates: [] })
          return
        }
        const stored = await credentialValue(ctx, config.tokenEnv)
        const client = apiFor(config, stored?.access_token || '')
        const templates = await client.fetchIssueTemplates(repository.owner, repository.repo)
        const items = (Array.isArray(templates) ? templates : [])
          .filter(t => t.name && (t.name.endsWith('.yml') || t.name.endsWith('.yaml') || t.name.endsWith('.md')))
          .map(t => ({ name: t.name, path: t.path, download_url: t.download_url }))
        writeJson(res, 200, { ok: true, templates: items })
      } catch {
        writeJson(res, 200, { ok: true, templates: [] })
      }
    },
  }), 'dsh-issue-reporter: templates')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-issue-reporter/issue/status',
    handler: async (req, res) => {
      if (req.method !== 'POST') { writeJson(res, 405, { ok: false, error: 'method not allowed' }); return }
      if (!authorizeRequest(ctx, req, res)) return
      try {
        const body = await readJson(req)
        const repository = parseForgeRepository(body.repository) || parseGitHubRepository(body.repository)
        if (!repository || !body.number) { writeJson(res, 400, { ok: false, error: 'Repository and issue number are required' }); return }
        const isGitea = repository.forge === 'gitea'
        const tokenRef = isGitea ? config.giteaTokenEnv : config.tokenEnv
        const stored = await credentialValue(ctx, tokenRef)
        if (!stored?.access_token) { writeJson(res, 401, { ok: false, error: 'Authentication not configured' }); return }
        let issueData
        if (isGitea) {
          issueData = await giteaApiFor(config, stored.access_token).getIssue(repository.owner, repository.repo, body.number)
        } else {
          issueData = await withGitHubCredential(ctx, config, (token) => apiFor(config, token).getIssue(repository.owner, repository.repo, body.number))
        }
        writeJson(res, 200, {
          ok: true,
          number: issueData.number,
          state: issueData.state,
          title: issueData.title,
          url: issueData.html_url || issueData.url,
          comments: issueData.comments || 0,
        })
      } catch (error) {
        const failure = forgeError(error)
        writeJson(res, failure.status, { ok: false, error: failure.error })
      }
    },
  }), 'dsh-issue-reporter: issue status')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-issue-reporter/ai/optimize',
    handler: async (req, res) => {
      if (req.method !== 'POST') { writeJson(res, 405, { ok: false, error: 'method not allowed' }); return }
      if (!authorizeRequest(ctx, req, res)) return
      try {
        const body = await readJson(req)
        const prompt = buildAiOptimizationPrompt({
          title: body.title,
          observed: body.observed,
          reproduction: body.reproduction,
          expected: body.expected,
          pluginName: body.pluginName,
          errorStack: body.errorStack,
          diagnostics: body.diagnostics,
        })

        // Check if LLM stream is available via ctx.llm or fallback
        const llm = ctx.reflect?.get?.('llm')
        let aiResult = null
        if (llm && typeof llm.stream === 'function') {
          try {
            const defaultSelection = ctx.reflect?.get?.('agentDefaultModel')?.currentSelection?.()
            const provider = body.provider || defaultSelection?.provider
            const model = body.model || defaultSelection?.model
            if (provider && model) {
              const stream = llm.stream({
                provider,
                model,
                messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
                maxTokens: 1200,
              })
              let fullText = ''
              for await (const chunk of stream) {
                if (chunk?.type === 'text-delta' && chunk.text) fullText += chunk.text
              }
              if (fullText.trim()) {
                aiResult = parseAiOptimizedResponse(fullText)
              }
            }
          } catch {
            aiResult = null
          }
        }

        if (!aiResult || !aiResult.body) {
          // Heuristic fallback
          const draft = composeIssueDraft({
            title: body.title ? `[Bug] ${body.title}` : 'Bug report',
            observed: body.observed,
            reproduction: body.reproduction,
            expected: body.expected,
            environment: body.environment,
            diagnostics: body.diagnostics,
            errorStack: body.errorStack,
            pluginContext: body.pluginName ? `Plugin: ${body.pluginName}` : undefined,
          })
          aiResult = { title: draft.title, body: draft.body }
        }

        writeJson(res, 200, { ok: true, ...aiResult })
      } catch (err) {
        writeJson(res, 500, { ok: false, error: err?.message || 'Failed to optimize issue with AI' })
      }
    },
  }), 'dsh-issue-reporter: ai optimize')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-issue-reporter/logs',
    handler: async (req, res) => {
      if (req.method !== 'GET') { writeJson(res, 405, { ok: false, error: 'method not allowed' }); return }
      if (!authorizeRequest(ctx, req, res)) return
      try {
        const url = new URL(req.url, 'http://127.0.0.1')
        const filter = url.searchParams.get('filter') || ''
        const limit = Math.min(Number(url.searchParams.get('limit')) || 30, 100)

        const logs = []
        // Gather logs from session log / trajectory if accessible
        const sessionLog = ctx.reflect?.get?.('sessionLog') || ctx.reflect?.get?.('session-log')
        if (sessionLog && typeof sessionLog.recent === 'function') {
          try {
            const rawLogs = await sessionLog.recent(limit * 2)
            for (const item of Array.isArray(rawLogs) ? rawLogs : []) {
              const textLine = typeof item === 'string' ? item : item?.message || item?.text || JSON.stringify(item)
              if (!filter || textLine.toLowerCase().includes(filter.toLowerCase())) {
                logs.push({
                  timestamp: item?.timestamp || new Date().toISOString(),
                  message: redactText(textLine).text,
                })
              }
              if (logs.length >= limit) break
            }
          } catch {}
        }

        writeJson(res, 200, { ok: true, logs })
      } catch (err) {
        writeJson(res, 500, { ok: false, error: err?.message || 'Failed to fetch session logs' })
      }
    },
  }), 'dsh-issue-reporter: logs')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-issue-reporter/labels',
    handler: async (req, res) => {
      if (req.method !== 'POST') { writeJson(res, 405, { ok: false, error: 'method not allowed' }); return }
      if (!authorizeRequest(ctx, req, res)) return
      try {
        const body = await readJson(req)
        const repository = parseForgeRepository(body.repository) || parseGitHubRepository(body.repository)
        if (!repository) { writeJson(res, 400, { ok: false, error: 'Valid repository is required' }); return }
        const isGitea = repository.forge === 'gitea'
        const tokenRef = isGitea ? config.giteaTokenEnv : config.tokenEnv
        const stored = await credentialValue(ctx, tokenRef)

        let rawLabels = []
        if (isGitea) {
          rawLabels = await giteaApiFor(config, stored?.access_token || '').listLabels(repository.owner, repository.repo)
        } else {
          rawLabels = await apiFor(config, stored?.access_token || '').listLabels(repository.owner, repository.repo)
        }

        const labels = (Array.isArray(rawLabels) ? rawLabels : []).map((l) => ({
          name: l.name,
          color: l.color || 'cccccc',
          description: l.description || '',
        }))

        const recommended = recommendLabels({
          pluginName: body.pluginName,
          description: body.description,
          errorStack: body.errorStack,
          availableLabels: labels,
        })

        writeJson(res, 200, { ok: true, labels, recommended })
      } catch {
        writeJson(res, 200, { ok: true, labels: [], recommended: [] })
      }
    },
  }), 'dsh-issue-reporter: labels')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-issue-reporter/issues/batch-status',
    handler: async (req, res) => {
      if (req.method !== 'POST') { writeJson(res, 405, { ok: false, error: 'method not allowed' }); return }
      if (!authorizeRequest(ctx, req, res)) return
      try {
        const body = await readJson(req)
        const items = Array.isArray(body.items) ? body.items : []
        const results = await Promise.all(items.slice(0, 20).map(async (item) => {
          try {
            const repository = parseForgeRepository(item.repository) || parseGitHubRepository(item.repository)
            if (!repository || !item.number) return { number: item.number, state: 'unknown' }
            const isGitea = repository.forge === 'gitea'
            const tokenRef = isGitea ? config.giteaTokenEnv : config.tokenEnv
            const stored = await credentialValue(ctx, tokenRef)
            let data
            if (isGitea) {
              data = await giteaApiFor(config, stored?.access_token || '').getIssue(repository.owner, repository.repo, item.number)
            } else {
              data = await apiFor(config, stored?.access_token || '').getIssue(repository.owner, repository.repo, item.number)
            }
            return parseIssueState(data)
          } catch {
            return { number: item.number, state: 'unknown' }
          }
        }))
        writeJson(res, 200, { ok: true, statuses: results })
      } catch (err) {
        writeJson(res, 500, { ok: false, error: err?.message || 'Failed to check issue statuses' })
      }
    },
  }), 'dsh-issue-reporter: batch-status')

  // Register autonomous report_issue tool for agents (#28)
  try {
    ctx.inject(['tools'], (scopedCtx) => {
    scopedCtx.tools.register({
      name: 'report_issue',
      description: 'Prepare or file an upstream bug report for an installed DeepSeek Harness plugin when an unexpected error, crash or incompatibility occurs.',
      parameters: {
        plugin_name: {
          type: 'string',
          required: true,
          description: 'Package or module name of the affected plugin (e.g. @goodandready/dsh-voice or native @deepseek-ai/* module).',
        },
        title: {
          type: 'string',
          required: true,
          description: 'Brief, actionable title summarizing the failure.',
        },
        description: {
          type: 'string',
          required: true,
          description: 'Detailed description of observed behavior and reproduction context.',
        },
        error_stack: {
          type: 'string',
          description: 'Optional error stack trace or exception output.',
        },
        severity: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'critical'],
          description: 'Optional perceived severity of the problem.',
        },
        confirm_submit: {
          type: 'boolean',
          description: 'Set to true to directly submit the issue if authorization is configured; false to only produce a sanitized draft and URL.',
        },
      },
      execute: async (args) => {
        try {
          let catalog = []
          try {
            catalog = (await catalogFromLoader(ctx.loader)) || []
          } catch {
            catalog = []
          }
          const target = catalog.find((p) => p.moduleName === args?.plugin_name || p.displayName === args?.plugin_name)
          const repository = target?.repository
          const draft = composeIssueDraft({
            title: `[${(args?.severity || 'bug').toUpperCase()}] ${args?.title || 'Defect report'}`,
            observed: args?.description || '',
            reproduction: 'Encountered during autonomous agent workflow',
            expected: 'Normal execution without unexpected errors',
            pluginContext: target ? `Plugin: ${target.displayName} (${target.version || 'unknown'})\nModule: ${target.moduleName}` : `Target: ${args?.plugin_name || 'unknown'}`,
            errorStack: args?.error_stack,
            diagnostics: `Node: ${process.version}\nOS: ${process.platform} (${process.arch})`,
          })

          const prefilled = repository ? prefilledIssueUrl(repository, draft) : ''
          if (!repository) {
            return {
              ok: false,
              error: `No public repository found for plugin ${args?.plugin_name || 'unknown'}`,
              draft,
            }
          }

          if (args?.confirm_submit === true) {
            const isGitea = repository.forge === 'gitea'
            const tokenRef = isGitea ? config.giteaTokenEnv : config.tokenEnv
            const stored = await credentialValue(ctx, tokenRef)
            if (stored?.access_token) {
              try {
                let issue
                if (isGitea) {
                  issue = await giteaApiFor(config, stored.access_token).createIssue(repository.owner, repository.repo, draft)
                } else {
                  issue = await withGitHubCredential(ctx, config, (token) => apiFor(config, token).createIssue(repository.owner, repository.repo, draft))
                }
                return {
                  ok: true,
                  submitted: true,
                  issueNumber: issue.number,
                  issueUrl: issue.url || issue.html_url,
                  draft,
                }
              } catch (submitErr) {
                return {
                  ok: false,
                  submitted: false,
                  error: submitErr?.message || 'Failed to submit issue to remote forge',
                  prefilledUrl: prefilled,
                  draft,
                }
              }
            }
          }

          return {
            ok: true,
            submitted: false,
            prefilledUrl: prefilled,
            draft,
            message: 'Draft prepared. Review and submit via the issue reporter UI or prefilled URL.',
          }
        } catch (err) {
          return {
            ok: false,
            error: err?.message || 'Failed to process issue report',
          }
        }
      },
    })
    })
  } catch {}

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-issue-reporter/create',
    handler: async (req, res) => {
      if (req.method !== 'POST') { writeJson(res, 405, { ok: false, error: 'method not allowed' }); return }
      if (!authorizeRequest(ctx, req, res)) return
      try {
        const body = await readJson(req, 32 * 1024 * 1024)
        if (!explicitConfirmation(body.confirm)) { writeJson(res, 400, { ok: false, error: 'Explicit confirmation is required before creating an issue' }); return }
        const repository = parseForgeRepository(body.repository) || parseGitHubRepository(body.repository)
        if (!repository) { writeJson(res, 400, { ok: false, error: 'A supported repository is required' }); return }
        const draft = composeIssueDraft(body.draft)
        const isGitea = repository.forge === 'gitea'
        const tokenRef = isGitea ? config.giteaTokenEnv : config.tokenEnv
        const stored = await credentialValue(ctx, tokenRef)
        const fallback = prefilledIssueUrl(repository, draft)
        if (!stored?.access_token) { writeJson(res, 401, { ok: false, error: 'Authentication is not configured', prefilledUrl: fallback }); return }
        const attachmentInput = Array.isArray(body.attachments) ? body.attachments : []
        let issue
        if (isGitea) {
          issue = await giteaApiFor(config, stored.access_token).createIssue(repository.owner, repository.repo, draft)
        } else if (attachmentInput.length) {
          issue = await withGitHubCredential(ctx, config, (token) => createIssueWithAttachments({
            ghPath: config.ghPath,
            repository,
            draft,
            token,
            attachments: attachmentInput,
            timeoutMs: config.timeoutMs,
          }))
        } else {
          issue = await withGitHubCredential(ctx, config, (token) => apiFor(config, token).createIssue(repository.owner, repository.repo, draft))
        }
        writeJson(res, 200, {
          ok: true,
          issue: { number: issue.number, title: issue.title || draft.title, url: issue.url || issue.html_url },
          prefilledUrl: fallback,
        })
      } catch (error) {
        const failure = forgeError(error)
        writeJson(res, failure.status, { ok: false, error: failure.error })
      }
    },
  }), 'dsh-issue-reporter: create')

  ctx.effect(() => registerPluginUpdater(ctx, {
    endpoint: '/dsh-issue-reporter/update',
    packageName: '@goodandready/dsh-issue-reporter',
    manifestUrl: new URL('../package.json', import.meta.url),
  }), 'dsh-issue-reporter: updater')
}
