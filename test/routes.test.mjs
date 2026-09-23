import assert from 'node:assert/strict'
import test from 'node:test'
import { GitHubApiError } from '../lib/github.js'
import { registerRoutes as registerCoreRoutes } from '../lib/routes/core.js'
import { registerRoutes as registerReportRoutes, _clearIssueStatusCache } from '../lib/routes/reports.js'
import { registerRoutes as registerCreateRoute } from '../lib/routes/create.js'
import { registerRoutes as registerAgentTool } from '../lib/routes/agent-tool.js'

function setup(services = {}) {
  const routes = new Map()
  const tools = []
  const ctx = {
    effect(callback) { return callback() },
    webServer: {
      register(route) { routes.set(route.path, route); return () => {} },
    },
    inject(_keys, register) {
      return register({ tools: { register(tool) { tools.push(tool); return () => {} } } })
    },
  }
  return { ctx, routes, tools, config: { tokenEnv: 'TOKEN', giteaTokenEnv: 'GITEA_TOKEN', apiBaseUrl: 'https://api.github.com' }, services }
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
