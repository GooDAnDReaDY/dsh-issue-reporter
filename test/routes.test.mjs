import assert from 'node:assert/strict'
import test from 'node:test'
import { GitHubApiError } from '../lib/github.js'
import { registerRoutes as registerCoreRoutes } from '../lib/routes/core.js'
import { registerRoutes as registerReportRoutes } from '../lib/routes/reports.js'
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
    '/dsh-issue-reporter/templates',
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

test('missing issue templates stay an empty optional result, while other failures remain visible', async () => {
  const fixture = setup(serviceDefaults({
    apiFor: () => ({ fetchIssueTemplates: async () => { throw new GitHubApiError('Not Found', 404, {}) } }),
  }))
  registerCoreRoutes(fixture.ctx, fixture.config, fixture.services)
  const res = response()
  await fixture.routes.get('/dsh-issue-reporter/templates').handler({ method: 'POST' }, res)
  assert.equal(res.status, 200)
  assert.deepEqual(res.payload.templates, [])

  const forbiddenFixture = setup(serviceDefaults({
    apiFor: () => ({ fetchIssueTemplates: async () => { throw new GitHubApiError('Forbidden', 403, {}) } }),
  }))
  registerCoreRoutes(forbiddenFixture.ctx, forbiddenFixture.config, forbiddenFixture.services)
  const failed = response()
  await forbiddenFixture.routes.get('/dsh-issue-reporter/templates').handler({ method: 'POST' }, failed)
  assert.equal(failed.status, 403)
  assert.equal(failed.payload.ok, false)
})
