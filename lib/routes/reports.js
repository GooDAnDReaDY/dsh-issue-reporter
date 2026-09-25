const STATUS_CACHE_TTL_MS = 60_000
const STATUS_CACHE_MAX_ENTRIES = 100
const BATCH_CONCURRENCY = 4
const issueStatusCache = new Map()

export function _clearIssueStatusCache() {
  issueStatusCache.clear()
}

function getCachedIssueStatus(cacheKey) {
  const entry = issueStatusCache.get(cacheKey)
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    issueStatusCache.delete(cacheKey)
    return undefined
  }
  return entry.value
}

function setCachedIssueStatus(cacheKey, value) {
  if (issueStatusCache.size >= STATUS_CACHE_MAX_ENTRIES) {
    const oldestKey = issueStatusCache.keys().next().value
    if (oldestKey) issueStatusCache.delete(oldestKey)
  }
  issueStatusCache.set(cacheKey, { value, expiresAt: Date.now() + STATUS_CACHE_TTL_MS })
}

export function registerRoutes(ctx, config, services) {
  const {
    logOptionalFailure, authorizeRequest, writeJson, readJson, catalogFromLoader, credentialConfigured, credentialValue, publicConfig,
    credentialRef, clearGitHubCredential, createGitHubClient, randomUUID, createDeviceFlowState, deviceFlows,
    forgeError, isDeviceFlowExpired, nextDevicePoll, serializeCredential, parseForgeRepository, parseGitHubRepository,
    composeIssueDraft, prefilledIssueUrl, giteaApiFor, withGitHubCredential, apiFor, findDuplicateIssues,
    buildAiOptimizationPrompt, parseAiOptimizedResponse, redactText, recommendLabels, parseIssueState,
    formatLogSnippet, explicitConfirmation, createIssueWithAttachments,
  } = services
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-issue-reporter/ai/optimize',
    handler: async (req, res) => {
      if (req.method !== 'POST') { writeJson(res, 405, { ok: false, error: 'method not allowed' }); return }
      if (!authorizeRequest(ctx, req, res)) return
      try {
        const body = await readJson(req)
        const safeInput = {
          title: redactText(body.title).text,
          observed: redactText(body.observed).text,
          reproduction: redactText(body.reproduction).text,
          expected: redactText(body.expected).text,
          pluginName: redactText(body.pluginName).text,
          errorStack: redactText(body.errorStack).text,
          diagnostics: redactText(body.diagnostics).text,
          environment: redactText(body.environment).text,
        }
        const prompt = buildAiOptimizationPrompt(safeInput)

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
            logOptionalFailure(ctx, 'AI draft optimization')
            aiResult = null
          }
        }

        if (!aiResult || !aiResult.body) {
          // Heuristic fallback
          const draft = composeIssueDraft({
            title: safeInput.title ? `[Bug] ${safeInput.title}` : 'Bug report',
            observed: safeInput.observed,
            reproduction: safeInput.reproduction,
            expected: safeInput.expected,
            environment: safeInput.environment,
            diagnostics: safeInput.diagnostics,
            errorStack: safeInput.errorStack,
            pluginContext: safeInput.pluginName ? `Plugin: ${safeInput.pluginName}` : undefined,
          })
          aiResult = { title: draft.title, body: draft.body }
        } else {
          aiResult = {
            title: redactText(aiResult.title).text,
            body: redactText(aiResult.body).text,
          }
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
          } catch {
            logOptionalFailure(ctx, 'Session log retrieval')
          }
        }

        writeJson(res, 200, { ok: true, logs, unavailable: logs.length === 0 && Boolean(sessionLog) })
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
      } catch (error) {
        const failure = forgeError(error)
        writeJson(res, failure.status, { ok: false, error: failure.error, labels: [], recommended: [] })
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
        const slice = items.slice(0, 20)
        const results = []
        for (let i = 0; i < slice.length; i += BATCH_CONCURRENCY) {
          const chunk = slice.slice(i, i + BATCH_CONCURRENCY)
          const chunkResults = await Promise.all(chunk.map(async (item) => {
            const repository = parseForgeRepository(item.repository) || parseGitHubRepository(item.repository)
            if (!repository || !item.number) return { number: item.number, state: 'unknown' }
            const cacheKey = `${repository.forge || 'github'}:${repository.owner}/${repository.repo}#${item.number}`
            const cached = getCachedIssueStatus(cacheKey)
            if (cached) return cached

            try {
              const isGitea = repository.forge === 'gitea'
              const tokenRef = isGitea ? config.giteaTokenEnv : config.tokenEnv
              const stored = await credentialValue(ctx, tokenRef)
              let data
              if (isGitea) {
                data = await giteaApiFor(config, stored?.access_token || '').getIssue(repository.owner, repository.repo, item.number)
              } else {
                data = await apiFor(config, stored?.access_token || '').getIssue(repository.owner, repository.repo, item.number)
              }
              const parsed = parseIssueState(data)
              setCachedIssueStatus(cacheKey, parsed)
              return parsed
            } catch {
              logOptionalFailure(ctx, 'Issue status lookup')
              return { number: item.number, state: 'unknown' }
            }
          }))
          results.push(...chunkResults)
        }
        writeJson(res, 200, { ok: true, statuses: results })
      } catch (err) {
        writeJson(res, 500, { ok: false, error: err?.message || 'Failed to check issue statuses' })
      }
    },
  }), 'dsh-issue-reporter: batch-status')
}
