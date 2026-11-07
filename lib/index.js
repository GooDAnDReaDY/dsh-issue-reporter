import {
  detectForgeType,
  parseMultiForgeRepository,
  formatTrackerReportMarkdown,
} from './trackers/multi-forge.js'
import {
  createOfflineExportBundle,
  formatOfflineExportMarkdown,
} from './offline-export.js'
import {
  calculateBisectionRange,
  formatBisectionMarkdown,
} from './bisect-helper.js'
import {
  triageIssueLabels,
  formatTriageSummaryMarkdown,
} from './label-triage.js'
import {
  prepareFixWorktree,
  formatIssueToFixMarkdown,
  sanitizeBranchName,
} from './issue-to-fix.js'
import {
  generateCanaryTest,
  formatCanaryTestMarkdown,
} from './canary-test-generator.js'
import {
  emergencyDisablePlugin,
  formatSafeModeStatusMarkdown,
} from './safe-mode.js'
import {
  detectSecurityRisk,
  resolveSecurityContact,
  formatSecurityAdvisoryMarkdown,
} from './security-advisory.js'
import {
  generateGitPatch,
  formatGitPatchMarkdown,
  parsePatchStats,
} from './git-patch.js'
import {
  collectPerformanceProfile,
  formatPerfProfileMarkdown,
  getMemorySnapshot,
  startEventLoopMonitoring,
  stopEventLoopMonitoring,
} from './event-loop-profiler.js'
import {
  recordAggregatedError,
  getAggregatedErrors,
  clearAggregatedErrors,
  formatErrorAggregationMarkdown,
} from './error-aggregator.js'
import {
  recordPluginBootTiming,
  getBootTimings,
  clearBootTimings,
  detectBootBlockers,
  formatBootProfileMarkdown,
} from './boot-profiler.js'
import {
  inspectPluginStorage,
  formatStorageSnapshotMarkdown,
  sanitizeStorageName,
} from './storage-snapshotter.js'
import {
  verifyHostEnvironment,
  formatEnvVerificationMarkdown,
  checkPortAvailability,
  verifyPathWritable,
  detectContainerContext,
} from './env-verifier.js'
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
  getEnvironmentSnapshot,
  formatEnvironmentMarkdown,
  serializeCredential,
  auditRedactions,
} from './domain.js'
import { ISSUE_TEMPLATES, getIssueTemplate, applyTemplateToDraft } from './templates.js'
import { evaluateReportQuality } from './quality-gate.js'
import { createGitHubClient, createGiteaClient, GitHubApiError } from './github.js'
import { createIssueWithAttachments } from './attachments.js'
import { clearGitHubCredential } from './auth.js'
import { registerPluginUpdater } from './plugin-updater.js'
import { authorizeRequest, logOptionalFailure } from './routes/shared.js'
import { registerRoutes as registerCoreRoutes } from './routes/core.js'
import { registerRoutes as registerReportRoutes, _clearIssueStatusCache } from './routes/reports.js'
import { registerRoutes as registerAgentTool } from './routes/agent-tool.js'
import { registerRoutes as registerIssueCreateRoute } from './routes/create.js'
import {
  detectRouteConflicts,
  detectServiceConflicts,
  detectSlotConflicts,
  detectAllConflicts,
  formatConflictMarkdown,
} from './conflict-detector.js'
import {
  recordNetworkFailure,
  getRecentNetworkFailures,
  clearNetworkFailures,
  formatCurlDump,
  generateCurlCommand,
} from './network-harvester.js'
import {
  lintPluginConfig,
  formatConfigLintMarkdown,
} from './config-linter.js'
import {
  scanDependencyDuplicates,
  auditDependencies,
  formatDependencyAuditMarkdown,
} from './dependency-auditor.js'
import {
  classifyRootCause,
  formatRootCauseMarkdown,
} from './root-cause.js'
import {
  generateBilingualDraft,
  formatBilingualMarkdown,
} from './bilingual.js'
import {
  generateMreScript,
  formatMreMarkdown,
} from './mre-generator.js'
import {
  recordAgentToolCall,
  getRecentAgentToolCalls,
  clearAgentToolCalls,
  formatAgentReplayMarkdown,
} from './agent-replayer.js'

export {
  detectRouteConflicts,
  detectServiceConflicts,
  detectSlotConflicts,
  detectAllConflicts,
  formatConflictMarkdown,
  recordNetworkFailure,
  getRecentNetworkFailures,
  clearNetworkFailures,
  formatCurlDump,
  generateCurlCommand,
  lintPluginConfig,
  formatConfigLintMarkdown,
  scanDependencyDuplicates,
  auditDependencies,
  formatDependencyAuditMarkdown,
  classifyRootCause,
  formatRootCauseMarkdown,
  generateBilingualDraft,
  formatBilingualMarkdown,
  generateMreScript,
  formatMreMarkdown,
  recordAgentToolCall,
  getRecentAgentToolCalls,
  clearAgentToolCalls,
  formatAgentReplayMarkdown,
  ISSUE_TEMPLATES,
  getIssueTemplate,
  applyTemplateToDraft,
  evaluateReportQuality,
  auditRedactions,
  prepareFixWorktree,
  formatIssueToFixMarkdown,
  sanitizeBranchName,
  generateCanaryTest,
  formatCanaryTestMarkdown,
  emergencyDisablePlugin,
  formatSafeModeStatusMarkdown,
  detectSecurityRisk,
  resolveSecurityContact,
  formatSecurityAdvisoryMarkdown,
  generateGitPatch,
  formatGitPatchMarkdown,
  parsePatchStats,
  detectForgeType,
  parseMultiForgeRepository,
  formatTrackerReportMarkdown,
  createOfflineExportBundle,
  formatOfflineExportMarkdown,
  calculateBisectionRange,
  formatBisectionMarkdown,
  triageIssueLabels,
  formatTriageSummaryMarkdown,
  collectPerformanceProfile,
  formatPerfProfileMarkdown,
  getMemorySnapshot,
  startEventLoopMonitoring,
  stopEventLoopMonitoring,
  recordAggregatedError,
  getAggregatedErrors,
  clearAggregatedErrors,
  formatErrorAggregationMarkdown,
  recordPluginBootTiming,
  getBootTimings,
  clearBootTimings,
  detectBootBlockers,
  formatBootProfileMarkdown,
  inspectPluginStorage,
  formatStorageSnapshotMarkdown,
  sanitizeStorageName,
  verifyHostEnvironment,
  formatEnvVerificationMarkdown,
  checkPortAvailability,
  verifyPathWritable,
  detectContainerContext,
}

export const name = '@goodandready/dsh-issue-reporter'
export const inject = ['settings', 'webServer', 'credentials', 'loader']

const NS = 'dsh-issue-reporter'
const require = createRequire(import.meta.url)

// Ensure .volatile() helper exists on Schemastery schema prototype
try {
  const schemaProto = Object.getPrototypeOf(z.boolean())
  if (schemaProto && typeof schemaProto.volatile !== 'function') {
    schemaProto.volatile = function () {
      return typeof this.extra === 'function' ? this.extra('volatile', true) : this
    }
  }
} catch {
  // safe fallback
}

export const Config = z.object({
  appClientId: z.string().default('').description('Public GitHub OAuth App client id for Device Flow.').volatile(),
  tokenEnv: z.string().role('credential-ref').default('GITHUB_ISSUE_REPORTER_TOKEN').description('DSH credential reference for the user GitHub OAuth token.'),
  apiBaseUrl: z.string().default('https://api.github.com').description('GitHub API base URL.').volatile(),
  giteaBaseUrl: z.string().default('').description('Optional local Gitea / Forgejo base URL.').volatile(),
  giteaTokenEnv: z.string().role('credential-ref').default('GITEA_ISSUE_REPORTER_TOKEN').description('DSH credential reference for Gitea token.'),
  timeoutMs: z.number().default(30000).description('GitHub request timeout in milliseconds.').volatile(),
  ghPath: z.string().default('gh').description('GitHub CLI executable used for screenshot attachments.').volatile(),
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
      catch (err) { reject(new Error('invalid JSON: ' + (err?.message || 'parse error'))) }
    })
    req.on('error', reject)
  })
}

function validModuleName(value) {
  return typeof value === 'string' && /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/i.test(value)
}

const METADATA_CACHE = new Map()
const METADATA_CACHE_TTL_MS = 60_000

export function clearMetadataCache() {
  METADATA_CACHE.clear()
}

export function getMetadataCache() {
  return METADATA_CACHE
}

export async function packageMetadata(moduleName) {
  if (!validModuleName(moduleName)) return undefined
  const now = Date.now()
  const cached = METADATA_CACHE.get(moduleName)
  if (cached && (now - cached.timestamp < METADATA_CACHE_TTL_MS)) {
    return cached.value
  }
  try {
    const packagePath = require.resolve(moduleName + '/package.json')
    const value = JSON.parse(await readFile(packagePath, 'utf8'))
    METADATA_CACHE.set(moduleName, { value, timestamp: now })
    return value
  } catch (error) {
    if (error?.code === 'MODULE_NOT_FOUND' || error?.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED') {
      METADATA_CACHE.set(moduleName, { value: undefined, timestamp: now })
      return undefined
    }
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
  let settingsSvc = null
  const describeRow = () => {
    if (typeof settingsSvc?.describe !== 'function') return null
    try {
      return settingsSvc.describe().find((r) => r && r.ns === NS) || null
    } catch (err) {
      logOptionalFailure(ctx, 'Settings describe', err)
      return null
    }
  }

  ctx.inject(['settings'], (sctx) => {
    try {
      settingsSvc = sctx.settings ?? null
      if (typeof sctx.settings?.configure === 'function') {
        sctx.effect(() => {
          try {
            sctx.settings?.configure?.({ auto: false }, ctx.fiber)
          } catch (err) {
            logOptionalFailure(ctx, 'Settings configure', err)
          }
        }, 'dsh-issue-reporter: settings')
      }
      const served = describeRow()
      if (served?.value) {
        Object.assign(config, served.value)
      }
      if (typeof sctx.effect === 'function') {
        sctx.effect(() => () => { settingsSvc = null })
      }
    } catch (err) {
      logOptionalFailure(ctx, 'Settings injection', err)
    }
  })

  const applyPatch = (updated) => {
    clearMetadataCache()
    if (updated && typeof updated === 'object') {
      if (NS in updated && typeof updated[NS] === 'object' && updated[NS] !== null) {
        try {
          Object.assign(config, updated[NS])
        } catch (err) {
          logOptionalFailure(ctx, 'Config patch apply', err)
        }
        return
      }
      if (updated.ns === NS && typeof updated.value === 'object' && updated.value !== null) {
        try {
          Object.assign(config, updated.value)
        } catch (err) {
          logOptionalFailure(ctx, 'Config patch apply', err)
        }
        return
      }
      const knownKeys = ['appClientId', 'apiBaseUrl', 'giteaBaseUrl', 'timeoutMs', 'ghPath']
      const hasKnownKey = knownKeys.some((k) => k in updated)
      if (hasKnownKey) {
        for (const k of knownKeys) {
          if (k in updated && updated[k] !== undefined) {
            config[k] = updated[k]
          }
        }
        return
      }
    }
    const served = describeRow()
    if (served?.value && typeof served.value === 'object') {
      try {
        Object.assign(config, served.value)
      } catch (err) {
        logOptionalFailure(ctx, 'Config refresh from describe', err)
      }
    }
  }

  if (typeof ctx?.on === 'function') {
    const bindEvents = () => {
      ctx.on('loader/volatile-update', applyPatch)
      ctx.on('settings/document-updated', applyPatch)
      return () => {
        ctx.off?.('loader/volatile-update', applyPatch)
        ctx.off?.('settings/document-updated', applyPatch)
      }
    }
    if (typeof ctx.effect === 'function') {
      ctx.effect(bindEvents, 'dsh-issue-reporter: settings change listener')
    } else {
      bindEvents()
    }
  }

  const deviceFlows = new Map()

  const services = {
    authorizeRequest, logOptionalFailure, writeJson, readJson, catalogFromLoader, credentialConfigured, credentialValue, publicConfig,
    credentialRef, clearGitHubCredential, createGitHubClient, randomUUID, createDeviceFlowState, deviceFlows,
    forgeError, isDeviceFlowExpired, nextDevicePoll, serializeCredential, parseForgeRepository, parseGitHubRepository,
    composeIssueDraft, prefilledIssueUrl, giteaApiFor, withGitHubCredential, apiFor, findDuplicateIssues,
    buildAiOptimizationPrompt, parseAiOptimizedResponse, redactText, recommendLabels, parseIssueState,
    formatLogSnippet, explicitConfirmation, createIssueWithAttachments, getEnvironmentSnapshot, formatEnvironmentMarkdown,
    getMetadataCache, _clearIssueStatusCache,
    detectAllConflicts, formatConflictMarkdown,
    lintPluginConfig, formatConfigLintMarkdown,
    auditDependencies, formatDependencyAuditMarkdown,
    recordNetworkFailure, getRecentNetworkFailures, formatCurlDump,
    classifyRootCause, formatRootCauseMarkdown,
    generateBilingualDraft, formatBilingualMarkdown,
    generateMreScript, formatMreMarkdown,
    recordAgentToolCall, getRecentAgentToolCalls, clearAgentToolCalls, formatAgentReplayMarkdown,
    ISSUE_TEMPLATES, getIssueTemplate, applyTemplateToDraft, evaluateReportQuality, auditRedactions,
    collectPerformanceProfile, formatPerfProfileMarkdown, getMemorySnapshot, startEventLoopMonitoring, stopEventLoopMonitoring,
    recordAggregatedError, getAggregatedErrors, clearAggregatedErrors, formatErrorAggregationMarkdown,
    recordPluginBootTiming, getBootTimings, clearBootTimings, detectBootBlockers, formatBootProfileMarkdown,
    inspectPluginStorage, formatStorageSnapshotMarkdown, sanitizeStorageName,
    verifyHostEnvironment, formatEnvVerificationMarkdown, checkPortAvailability, verifyPathWritable, detectContainerContext,
    prepareFixWorktree, formatIssueToFixMarkdown, sanitizeBranchName,
    generateCanaryTest, formatCanaryTestMarkdown,
    emergencyDisablePlugin, formatSafeModeStatusMarkdown,
    detectSecurityRisk, resolveSecurityContact, formatSecurityAdvisoryMarkdown,
    generateGitPatch, formatGitPatchMarkdown, parsePatchStats,
    detectForgeType, parseMultiForgeRepository, formatTrackerReportMarkdown,
    createOfflineExportBundle, formatOfflineExportMarkdown,
    calculateBisectionRange, formatBisectionMarkdown,
    triageIssueLabels, formatTriageSummaryMarkdown,
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
