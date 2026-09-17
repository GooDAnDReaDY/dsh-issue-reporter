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
import { authorizeRequest, logOptionalFailure } from './routes/shared.js'
import { registerRoutes as registerCoreRoutes } from './routes/core.js'
import { registerRoutes as registerReportRoutes } from './routes/reports.js'
import { registerRoutes as registerAgentTool } from './routes/agent-tool.js'
import { registerRoutes as registerIssueCreateRoute } from './routes/create.js'

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
  } catch (error) {
    if (error?.code === 'MODULE_NOT_FOUND' || error?.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED') return undefined
    throw error
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
  } catch (error) {
    const failure = new Error('DSH credential service is unavailable', { cause: error })
    failure.code = 'DSH_CREDENTIALS_UNAVAILABLE'
    throw failure
  }
}

async function credentialConfigured(ctx, refName) {
  if (!refName) return false
  try {
    if (typeof ctx.credentials?.describe === 'function') {
      const described = await ctx.credentials.describe(credentialRef(refName))
      return !!described?.configured
    }
  } catch {
    logOptionalFailure(ctx, 'Credential description')
  }
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

    const refreshed = await createGitHubClient({ baseUrl: config.apiBaseUrl }).refreshToken(config.appClientId, stored.refresh_token)
    if (!refreshed?.access_token) {
      if (['bad_credentials', 'bad_verification_code', 'invalid_grant'].includes(refreshed?.error)) {
        throw new Error('GitHub authorization expired or was revoked; sign in again')
      }
      throw new Error(refreshed?.error_description || 'GitHub token refresh did not return an access token')
    }

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
  if (error?.code === 'DSH_CREDENTIALS_UNAVAILABLE') {
    return { status: 503, error: 'DSH credential service is unavailable' }
  }
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

  const services = {
    authorizeRequest, logOptionalFailure, writeJson, readJson, catalogFromLoader, credentialConfigured, credentialValue, publicConfig,
    credentialRef, clearGitHubCredential, createGitHubClient, randomUUID, createDeviceFlowState, deviceFlows,
    forgeError, isDeviceFlowExpired, nextDevicePoll, serializeCredential, parseForgeRepository, parseGitHubRepository,
    composeIssueDraft, prefilledIssueUrl, giteaApiFor, withGitHubCredential, apiFor, findDuplicateIssues,
    buildAiOptimizationPrompt, parseAiOptimizedResponse, redactText, recommendLabels, parseIssueState,
    formatLogSnippet, explicitConfirmation, createIssueWithAttachments,
  }
  registerCoreRoutes(ctx, config, services)
  registerReportRoutes(ctx, config, services)
  registerAgentTool(ctx, config, services)
  registerIssueCreateRoute(ctx, config, services)

  ctx.effect(() => registerPluginUpdater(ctx, {
    endpoint: '/dsh-issue-reporter/update',
    packageName: '@goodandready/dsh-issue-reporter',
    manifestUrl: new URL('../package.json', import.meta.url),
  }), 'dsh-issue-reporter: updater')
}
