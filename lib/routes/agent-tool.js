export function registerRoutes(ctx, config, services) {
  const {
    logOptionalFailure, authorizeRequest, writeJson, readJson, catalogFromLoader, credentialConfigured, credentialValue, publicConfig,
    credentialRef, clearGitHubCredential, createGitHubClient, randomUUID, createDeviceFlowState, deviceFlows,
    forgeError, isDeviceFlowExpired, nextDevicePoll, serializeCredential, parseForgeRepository, parseGitHubRepository,
    composeIssueDraft, prefilledIssueUrl, giteaApiFor, withGitHubCredential, apiFor, findDuplicateIssues,
    buildAiOptimizationPrompt, parseAiOptimizedResponse, redactText, recommendLabels, parseIssueState,
    formatLogSnippet, explicitConfirmation, createIssueWithAttachments,
  } = services
  // Register autonomous report_issue tool for agents (#28)
  try {
    ctx.inject(['tools'], (scopedCtx) => {
    scopedCtx.tools.register({
      name: 'report_issue',
      description: 'Prepare a reviewable bug report draft for an installed DeepSeek Harness plugin when an unexpected error, crash or incompatibility occurs. Returns a draft and prefilled URL for human review.',
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
      },
      execute: async (args) => {
        try {
          const catalog = (await catalogFromLoader(ctx.loader)) || []
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
              submitted: false,
              error: `No public repository found for plugin ${args?.plugin_name || 'unknown'}`,
              draft,
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
  } catch {
    logOptionalFailure(ctx, 'Optional autonomous report_issue tool registration')
  }
}
