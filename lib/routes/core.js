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
      } catch (error) {
        const failure = forgeError(error)
        if (failure.status === 404) {
          writeJson(res, 200, { ok: true, templates: [] })
          return
        }
        writeJson(res, failure.status, { ok: false, error: failure.error, templates: [] })
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
}
