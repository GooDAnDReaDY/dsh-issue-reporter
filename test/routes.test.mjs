import assert from 'node:assert/strict'
import test from 'node:test'
import { GitHubApiError } from '../lib/github.js'
import { registerRoutes as registerCoreRoutes } from '../lib/routes/core.js'
import { registerRoutes as registerReportRoutes, _clearIssueStatusCache } from '../lib/routes/reports.js'
import { registerRoutes as registerCreateRoute } from '../lib/routes/create.js'
import { registerRoutes as registerAgentTool } from '../lib/routes/agent-tool.js'
import { buildAiOptimizationPrompt, parseAiOptimizedResponse, redactText, composeIssueDraft } from '../lib/domain.js'

function setup(services = {}) {
  const routes = new Map()
  const tools = []
  const servicesMap = new Map()
  const ctx = {
    effect(callback) { return callback() },
    webServer: {
      register(route) { routes.set(route.path, route); return () => {} },
    },
    inject(_keys, register) {
      return register({ tools: { register(tool) { tools.push(tool); return () => {} } } })
    },
    reflect: {
      get(name) { return servicesMap.get(name) },
      set(name, value) { servicesMap.set(name, value) },
    },
  }
  return { ctx, routes, tools, servicesMap, config: { tokenEnv: 'TOKEN', giteaTokenEnv: 'GITEA_TOKEN', apiBaseUrl: 'https://api.github.com' }, services }
}

function serviceDefaults(overrides = {}) {
  return {
    authorizeRequest: () => true,
    writeJson(res, status, payload) { res.status = status; res.payload = payload },
    readJson: async () => ({ repository: 'https://github.com/example/plugin' }),
    parseForgeRepository: () => ({ forge: 'github', owner: 'example', repo: 'plugin' }),
    parseGitHubRepository: () => undefined,
    credentialValue: async () => ({ access_token: 'token' }),
    apiFor: () => ({}),
    forgeError: (error) => ({ status: error.status || 502, error: error.message }),
    logOptionalFailure() {},
    buildAiOptimizationPrompt,
    parseAiOptimizedResponse,
    redactText,
    composeIssueDraft,
    ...overrides,
  }
}

function response() { return { writeHead() {}, end() {} } }

test('route modules preserve all HTTP endpoints and the optional agent tool', () => {
  const fixture = setup(serviceDefaults())
  registerCoreRoutes(fixture.ctx, fixture.config, fixture.services)
  registerReportRoutes(fixture.ctx, fixture.config, fixture.services)
  registerCreateRoute(fixture.ctx, fixture.config, fixture.services)
  registerAgentTool(fixture.ctx, fixture.config, fixture.services)

  assert.deepEqual([...fixture.routes.keys()].sort(), [
    '/dsh-issue-reporter/ai/optimize',
    '/dsh-issue-reporter/create',
    '/dsh-issue-reporter/device/logout',
    '/dsh-issue-reporter/device/poll',
    '/dsh-issue-reporter/device/start',
    '/dsh-issue-reporter/draft',
    '/dsh-issue-reporter/duplicates',
    '/dsh-issue-reporter/issue/status',
    '/dsh-issue-reporter/issues/batch-status',
    '/dsh-issue-reporter/labels',
    '/dsh-issue-reporter/logs',
    '/dsh-issue-reporter/status',
  ])
  assert.deepEqual(fixture.tools.map((tool) => tool.name), ['report_issue'])
})

test('label lookup surfaces remote authorization errors instead of disguising them as no labels', async () => {
  const fixture = setup(serviceDefaults({
    apiFor: () => ({ listLabels: async () => { throw new GitHubApiError('Bad credentials', 401, {}) } }),
  }))
  registerReportRoutes(fixture.ctx, fixture.config, fixture.services)
  const res = response()
  await fixture.routes.get('/dsh-issue-reporter/labels').handler({ method: 'POST' }, res)
  assert.equal(res.status, 401)
  assert.equal(res.payload.ok, false)
  assert.equal(res.payload.error, 'Bad credentials')
})


test('batch-status throttles concurrency and returns issue statuses in order', async () => {
  _clearIssueStatusCache()
  let activeCalls = 0
  let maxConcurrent = 0
  const items = Array.from({ length: 9 }, (_, i) => ({
    repository: 'https://github.com/acme/widget',
    number: i + 1,
  }))
  const fixture = setup(serviceDefaults({
    readJson: async () => ({ items }),
    parseForgeRepository: () => ({ forge: 'github', owner: 'acme', repo: 'widget' }),
    parseIssueState: (data) => data,
    apiFor: () => ({
      getIssue: async (_owner, _repo, number) => {
        activeCalls += 1
        if (activeCalls > maxConcurrent) maxConcurrent = activeCalls
        await new Promise((r) => setTimeout(r, 10))
        activeCalls -= 1
        return { number, state: 'open', comments: 0 }
      },
    }),
  }))
  registerReportRoutes(fixture.ctx, fixture.config, fixture.services)
  const res = response()
  await fixture.routes.get('/dsh-issue-reporter/issues/batch-status').handler({ method: 'POST' }, res)

  assert.equal(res.status, 200)
  assert.equal(res.payload.ok, true)
  assert.equal(res.payload.statuses.length, 9)
  assert.equal(res.payload.statuses[0].number, 1)
  assert.equal(res.payload.statuses[8].number, 9)
  assert.ok(maxConcurrent <= 4, `Expected max concurrency <= 4, got ${maxConcurrent}`)
})

test('batch-status caches issue status results within TTL', async () => {
  _clearIssueStatusCache()
  let networkCalls = 0
  const items = [{ repository: 'https://github.com/acme/widget', number: 42 }]
  const fixture = setup(serviceDefaults({
    readJson: async () => ({ items }),
    parseForgeRepository: () => ({ forge: 'github', owner: 'acme', repo: 'widget' }),
    parseIssueState: (data) => data,
    apiFor: () => ({
      getIssue: async (_owner, _repo, number) => {
        networkCalls += 1
        return { number, state: 'closed', comments: 3 }
      },
    }),
  }))
  registerReportRoutes(fixture.ctx, fixture.config, fixture.services)

  const res1 = response()
  await fixture.routes.get('/dsh-issue-reporter/issues/batch-status').handler({ method: 'POST' }, res1)
  assert.equal(res1.status, 200)
  assert.equal(networkCalls, 1)
  assert.equal(res1.payload.statuses[0].state, 'closed')

  const res2 = response()
  await fixture.routes.get('/dsh-issue-reporter/issues/batch-status').handler({ method: 'POST' }, res2)
  assert.equal(res2.status, 200)
  assert.equal(networkCalls, 1) // Cached!
  assert.equal(res2.payload.statuses[0].state, 'closed')
})

test('ai/optimize redacts credentials, paths, and LAN IPs before calling LLM stream', async () => {
  let capturedStreamArgs = null
  const mockLlm = {
    stream: (args) => {
      capturedStreamArgs = args
      return (async function* () {
        yield { type: 'text-delta', text: 'Title: [Bug] Fixed Title\n\nObserved: Clean observed\nExpected: Clean expected' }
      })()
    },
  }

  const sensitiveInput = {
    title: 'Crash with token ghp_12345678901234567890abcdef',
    observed: 'User password=super_secret logged in from 10.23.45.67 and hit /home/alice/project/file.js',
    reproduction: 'Visit https://admin:pass@example.com/api',
    expected: 'No crash at 172.16.0.99',
    errorStack: 'Error at /opt/dsh/core.js:10\nAPI Key: sk-abcdef12345678901234567890',
    diagnostics: {
      localHost: '10.0.0.1',
      secretHeader: 'bearer secret_token_xyz',
      configPath: 'C:\\Users\\alice\\AppData\\secret.json',
    },
    provider: 'test-provider',
    model: 'test-model',
  }

  const fixture = setup(serviceDefaults({
    readJson: async () => sensitiveInput,
  }))
  fixture.servicesMap.set('llm', mockLlm)
  registerReportRoutes(fixture.ctx, fixture.config, fixture.services)

  const res = response()
  await fixture.routes.get('/dsh-issue-reporter/ai/optimize').handler({ method: 'POST' }, res)

  assert.equal(res.status, 200)
  assert.equal(res.payload.ok, true)
  assert.ok(capturedStreamArgs, 'llm.stream should have been called')
  assert.equal(capturedStreamArgs.provider, 'test-provider')
  assert.equal(capturedStreamArgs.model, 'test-model')

  const promptText = capturedStreamArgs.messages[0].content[0].text

  // Assert none of the sensitive values leaked into outgoing LLM messages
  assert.equal(promptText.includes('ghp_12345678901234567890abcdef'), false)
  assert.equal(promptText.includes('super_secret'), false)
  assert.equal(promptText.includes('10.23.45.67'), false)
  assert.equal(promptText.includes('/home/alice'), false)
  assert.equal(promptText.includes('admin:pass'), false)
  assert.equal(promptText.includes('172.16.0.99'), false)
  assert.equal(promptText.includes('/opt/dsh'), false)
  assert.equal(promptText.includes('sk-abcdef12345678901234567890'), false)
  assert.equal(promptText.includes('10.0.0.1'), false)
  assert.equal(promptText.includes('secret_token_xyz'), false)
  assert.equal(promptText.includes('C:\\Users\\alice'), false)

  // Assert standard redactions are present
  assert.ok(promptText.includes('[redacted token]'))
  assert.ok(promptText.includes('[redacted credential]'))
  assert.ok(promptText.includes('[redacted IP]'))
  assert.ok(promptText.includes('[redacted path]'))
  assert.ok(promptText.includes('[redacted URL]'))
})

test('ai/optimize fallback redacts all fields when LLM is unavailable', async () => {
  const sensitiveInput = {
    title: 'Crash with token ghp_12345678901234567890abcdef',
    observed: 'Observed leak at 10.23.45.67 with /home/alice/secret',
    reproduction: 'Visit password=admin_secret',
    expected: 'Safe behavior',
    errorStack: 'Stack in /opt/app.js',
    diagnostics: { host: '172.16.0.10' },
  }

  const fixture = setup(serviceDefaults({
    readJson: async () => sensitiveInput,
  }))
  // No LLM service configured
  registerReportRoutes(fixture.ctx, fixture.config, fixture.services)

  const res = response()
  await fixture.routes.get('/dsh-issue-reporter/ai/optimize').handler({ method: 'POST' }, res)

  assert.equal(res.status, 200)
  assert.equal(res.payload.ok, true)
  assert.ok(res.payload.title)
  assert.ok(res.payload.body)

  const output = res.payload.title + '\n' + res.payload.body
  assert.equal(output.includes('ghp_12345678901234567890abcdef'), false)
  assert.equal(output.includes('10.23.45.67'), false)
  assert.equal(output.includes('/home/alice'), false)
  assert.equal(output.includes('admin_secret'), false)
  assert.equal(output.includes('/opt/app.js'), false)
  assert.equal(output.includes('172.16.0.10'), false)

  assert.ok(output.includes('[redacted token]'))
  assert.ok(output.includes('[redacted IP]'))
  assert.ok(output.includes('[redacted path]'))
  assert.ok(output.includes('[redacted credential]'))
})

