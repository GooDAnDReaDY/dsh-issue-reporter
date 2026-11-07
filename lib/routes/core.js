export function registerRoutes(ctx, config, services) {
  const {
    logOptionalFailure, authorizeRequest, writeJson, readJson, catalogFromLoader, credentialConfigured, credentialValue, publicConfig,
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
    generateMreScript, formatMreMarkdown,
    recordAgentToolCall, getRecentAgentToolCalls, formatAgentReplayMarkdown,
  } = services

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-issue-reporter/environment',
    handler: async (req, res) => {
      if (req.method !== 'GET' || !authorizeRequest(ctx, req, res)) return
      try {
        const snapshot = typeof getEnvironmentSnapshot === 'function'
          ? getEnvironmentSnapshot(ctx)
          : { node: process.version, platform: process.platform, arch: process.arch }
        const markdown = typeof formatEnvironmentMarkdown === 'function'
          ? formatEnvironmentMarkdown(snapshot)
          : ''
        writeJson(res, 200, { ok: true, snapshot, markdown })
      } catch (error) {
        writeJson(res, 500, { ok: false, error: error?.message || 'Could not assemble environment snapshot' })
      }
    },
  }), 'dsh-issue-reporter: environment snapshot')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-issue-reporter/conflicts',
    handler: async (req, res) => {
      if (req.method !== 'GET' || !authorizeRequest(ctx, req, res)) return
      try {
        const result = typeof detectAllConflicts === 'function'
          ? detectAllConflicts(ctx)
          : { hasConflicts: false, conflicts: [] }
        const markdown = typeof formatConflictMarkdown === 'function'
          ? formatConflictMarkdown(result.conflicts)
          : ''
        writeJson(res, 200, { ok: true, ...result, markdown })
      } catch (error) {
        writeJson(res, 500, { ok: false, error: error?.message || 'Could not detect conflicts' })
      }
    },
  }), 'dsh-issue-reporter: conflict detector')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-issue-reporter/config-lint',
    handler: async (req, res) => {
      if (req.method !== 'GET' || !authorizeRequest(ctx, req, res)) return
      try {
        const urlObj = new URL(req.url, 'http://127.0.0.1:3080')
        const pluginName = urlObj.searchParams.get('plugin') || ''
        const pluginConfig = ctx.config?.[pluginName] || {}
        let schemaDef = null
        try {
          const entry = ctx.registry?.get(pluginName)
          schemaDef = entry?.schema || entry?.Config || null
        } catch (err) {
          logOptionalFailure(ctx, 'Resolve plugin schema', err)
        }
        const result = typeof lintPluginConfig === 'function'
          ? lintPluginConfig(pluginName, pluginConfig, schemaDef)
          : { ok: true, errors: [], warnings: [], diff: [] }
        const markdown = typeof formatConfigLintMarkdown === 'function'
          ? formatConfigLintMarkdown(pluginName, result)
          : ''
        writeJson(res, 200, { ok: true, lint: result, markdown })
      } catch (error) {
        writeJson(res, 500, { ok: false, error: error?.message || 'Could not lint plugin config' })
      }
    },
  }), 'dsh-issue-reporter: config lint')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-issue-reporter/dependency-audit',
    handler: async (req, res) => {
      if (req.method !== 'GET' || !authorizeRequest(ctx, req, res)) return
      try {
        const result = typeof auditDependencies === 'function'
          ? auditDependencies({ profileDir: process.cwd() })
          : { hasDuplicates: false, hookConflictRisk: false, duplicates: [], recommendations: [] }
        const markdown = typeof formatDependencyAuditMarkdown === 'function'
          ? formatDependencyAuditMarkdown(result)
          : ''
        writeJson(res, 200, { ok: true, audit: result, markdown })
      } catch (error) {
        writeJson(res, 500, { ok: false, error: error?.message || 'Could not audit dependencies' })
      }
    },
  }), 'dsh-issue-reporter: dependency audit')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-issue-reporter/agent-replay',
    handler: async (req, res) => {
      if (req.method !== 'GET' || !authorizeRequest(ctx, req, res)) return
      try {
        const calls = typeof getRecentAgentToolCalls === 'function' ? getRecentAgentToolCalls() : []
        const markdown = typeof formatAgentReplayMarkdown === 'function' ? formatAgentReplayMarkdown(calls) : ''
        writeJson(res, 200, { ok: true, calls, markdown })
      } catch (error) {
        writeJson(res, 500, { ok: false, error: error?.message || 'Could not fetch agent replay' })
      }
    },
  }), 'dsh-issue-reporter: agent replay')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-issue-reporter/mre',
    handler: async (req, res) => {
      if (req.method !== 'POST') { writeJson(res, 405, { ok: false, error: 'method not allowed' }); return }
      if (!authorizeRequest(ctx, req, res)) return
      try {
        const body = await readJson(req)
        const mre = typeof generateMreScript === 'function'
          ? generateMreScript(body)
          : { script: '' }
        const markdown = typeof formatMreMarkdown === 'function'
          ? formatMreMarkdown(mre)
          : ''
        writeJson(res, 200, { ok: true, mre, markdown })
      } catch (error) {
        writeJson(res, 500, { ok: false, error: error?.message || 'Could not generate MRE' })
      }
    },
  }), 'dsh-issue-reporter: mre generator')

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
        const diagnostics = typeof getEnvironmentSnapshot === 'function'
          ? getEnvironmentSnapshot(ctx)
          : {
              node: process.version,
              platform: process.platform,
              arch: process.arch,
            }
        const metaCacheCount = typeof getMetadataCache === 'function' ? getMetadataCache().size : 0
        const conflictsSummary = typeof detectAllConflicts === 'function' ? detectAllConflicts(ctx).conflicts.length : 0
        const depSummary = typeof auditDependencies === 'function' ? auditDependencies() : { hookConflictRisk: false }
        writeJson(res, 200, {
          ok: true,
          config: publicConfig(config, tokenConfigured, giteaConfigured),
          plugins: catalog,
          diagnostics: {
            ...diagnostics,
            metadataCacheEntries: metaCacheCount,
            detectedConflicts: conflictsSummary,
            hookConflictRisk: depSummary.hookConflictRisk,
          },
        })
      } catch (error) {
        const statusCode = error?.code === 'DSH_CREDENTIALS_UNAVAILABLE' ? 503 : 500
        writeJson(res, statusCode, { ok: false, error: error?.message || 'Could not read DSH plugin inventory' })
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
        if (typeof _clearIssueStatusCache === 'function') _clearIssueStatusCache()
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
          verificationUri: result.verification_uri,
          userCode: result.user_code,
          expiresIn: result.expires_in,
          interval: result.interval,
        })
      } catch (error) {
        writeJson(res, 502, { ok: false, error: error?.message || 'GitHub Device Flow could not be started' })
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
        const body = await readJson(req)
        const state = deviceFlows.get(body.flowId)
        if (!state) { writeJson(res, 404, { ok: false, error: 'Device Flow session not found' }); return }
        if (isDeviceFlowExpired(state)) {
          deviceFlows.delete(body.flowId)
          writeJson(res, 410, { ok: false, error: 'Device code expired; request a new code' })
          return
        }
        if (Date.now() < state.nextPollAt) {
          writeJson(res, 200, { ok: true, status: 'slow_down', interval: state.interval })
          return
        }
        const client = createGitHubClient({ baseUrl: config.apiBaseUrl })
        const tokenResult = await client.deviceToken(state.clientId, state.deviceCode)
        if (tokenResult?.error === 'authorization_pending') {
          nextDevicePoll(state)
          writeJson(res, 200, { ok: true, status: 'pending', interval: state.interval })
          return
        }
        if (tokenResult?.error === 'slow_down') {
          nextDevicePoll(state, 5)
          writeJson(res, 200, { ok: true, status: 'slow_down', interval: state.interval })
          return
        }
        if (tokenResult?.access_token) {
          deviceFlows.delete(body.flowId)
          await ctx.credentials.set(
            credentialRef(config.tokenEnv),
            serializeCredential(tokenResult.access_token, tokenResult.token_type || 'bearer'),
          )
          writeJson(res, 200, { ok: true, status: 'granted' })
          return
        }
        deviceFlows.delete(body.flowId)
        writeJson(res, 400, { ok: false, error: tokenResult?.error_description || tokenResult?.error || 'Authorization failed' })
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
    path: '/dsh-issue-reporter/quality-gate',
    handler: async (req, res) => {
      if (req.method !== 'POST') { writeJson(res, 405, { ok: false, error: 'method not allowed' }); return }
      if (!authorizeRequest(ctx, req, res)) return
      try {
        const body = await readJson(req)
        const quality = typeof services.evaluateReportQuality === 'function'
          ? services.evaluateReportQuality(body?.draft)
          : { score: 100, status: 'ready', checks: [], warnings: [], isReady: true }
        writeJson(res, 200, { ok: true, ...quality })
      } catch (error) {
        writeJson(res, 500, { ok: false, error: error?.message || 'Failed to evaluate quality' })
      }
    },
  }), 'dsh-issue-reporter: quality gate')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-issue-reporter/redaction-audit',
    handler: async (req, res) => {
      if (req.method !== 'POST') { writeJson(res, 405, { ok: false, error: 'method not allowed' }); return }
      if (!authorizeRequest(ctx, req, res)) return
      try {
        const body = await readJson(req)
        const textToAudit = body?.text || ''
        const result = typeof services.auditRedactions === 'function'
          ? services.auditRedactions(textToAudit)
          : { totalRedactions: 0, kinds: [], summary: [], items: [], safeText: textToAudit }
        writeJson(res, 200, { ok: true, ...result })
      } catch (error) {
        writeJson(res, 500, { ok: false, error: error?.message || 'Failed to audit redactions' })
      }
    },
  }), 'dsh-issue-reporter: redaction audit')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-issue-reporter/templates',
    handler: async (req, res) => {
      if (req.method !== 'GET') { writeJson(res, 405, { ok: false, error: 'method not allowed' }); return }
      if (!authorizeRequest(ctx, req, res)) return
      try {
        const templates = services.ISSUE_TEMPLATES || []
        writeJson(res, 200, { ok: true, templates })
      } catch (error) {
        writeJson(res, 500, { ok: false, error: error?.message || 'Failed to list templates' })
      }
    },
  }), 'dsh-issue-reporter: templates')
}

