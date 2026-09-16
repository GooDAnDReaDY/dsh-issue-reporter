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
}
