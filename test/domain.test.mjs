import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildPluginCatalog,
  pluginCategory,
  composeIssueDraft,
  createDeviceFlowState,
  explicitConfirmation,
  findDuplicateIssues,
  isDeviceFlowExpired,
  nextDevicePoll,
  parseGitHubRepository,
  prefilledIssueUrl,
  redactText,
  serializeCredential,
} from '../lib/domain.js'

test('parses only public github repository metadata', () => {
  assert.deepEqual(parseGitHubRepository('git+https://github.com/acme/widget.git'), {
    owner: 'acme',
    repo: 'widget',
    fullName: 'acme/widget',
    url: 'https://github.com/acme/widget',
    issuesUrl: 'https://github.com/acme/widget/issues',
  })
  assert.equal(parseGitHubRepository('https://gitlab.com/acme/widget'), undefined)
  assert.equal(parseGitHubRepository('https://github.com/acme/widget/issues/4'), undefined)
})

test('builds supported and unsupported catalog rows from inventory and metadata', () => {
  const catalog = buildPluginCatalog({
    entries: [
      { entryId: 'one', moduleName: '@acme/widget', enabled: true, fiberPhase: 'active' },
      { entryId: 'two', moduleName: '@acme/local', enabled: false, fiberPhase: 'failed' },
    ],
  }, {
    '@acme/widget': {
      name: '@acme/widget',
      version: '1.2.3',
      repository: { type: 'git', url: 'git+https://github.com/acme/widget.git' },
    },
  })
  assert.equal(catalog[0].supported, true)
  assert.equal(catalog[0].category, 'third-party')
  assert.equal(catalog[0].repository.fullName, 'acme/widget')
  assert.equal(catalog[1].supported, false)
  assert.equal(catalog[1].enabled, false)
})

test('categorizes native and third-party plugin packages', () => {
  assert.equal(pluginCategory('@deepseek-ai/dsh-base'), 'native')
  assert.equal(pluginCategory('@goodandready/dsh-issue-reporter'), 'third-party')
  assert.equal(pluginCategory('dsh-plugins-store'), 'third-party')
})

test('redacts credentials, private paths, urls and email addresses', () => {
  const value = 'token: abc123 password=secret https://user:pass@example.test /home/alice/project a@b.example'
  const result = redactText(value)
  assert.equal(result.text.includes('secret'), false)
  assert.equal(result.text.includes('/home/alice'), false)
  assert.equal(result.text.includes('user:pass'), false)
  assert.equal(result.text.includes('a@b.example'), false)
  assert.ok(result.redactions.length >= 3)
})

test('composes a safe draft and prefilled issue link', () => {
  const draft = composeIssueDraft({
    title: 'Crash after login',
    observed: 'The plugin crashes with token: abc123',
    reproduction: 'Open the settings page',
    expected: 'The page should remain available',
  })
  assert.equal(draft.title, 'Crash after login')
  assert.equal(draft.body.includes('abc123'), false)
  const url = prefilledIssueUrl('https://github.com/acme/widget', draft)
  assert.match(url, /^https:\/\/github\.com\/acme\/widget\/issues\/new\?/)
  assert.equal(explicitConfirmation(true), true)
  assert.equal(explicitConfirmation('true'), false)
})

test('ranks duplicate issues by overlapping words', () => {
  const result = findDuplicateIssues([
    { number: 2, title: 'Crash after login', body: 'settings page unavailable', html_url: 'https://github.com/acme/widget/issues/2' },
    { number: 3, title: 'Unrelated problem', body: 'network', html_url: 'https://github.com/acme/widget/issues/3' },
  ], { title: 'Crash after login', body: 'settings page' })
  assert.equal(result[0].number, 2)
  assert.ok(result[0].score > 0.5)
})

test('advances and expires device flow safely', () => {
  const state = createDeviceFlowState(1000, 10000)
  const pending = nextDevicePoll(state, { error: 'authorization_pending' }, 2000)
  assert.equal(pending.pending, true)
  const slower = nextDevicePoll(pending, { error: 'slow_down' }, 8000)
  assert.equal(slower.intervalMs, 10000)
  assert.equal(isDeviceFlowExpired(slower, 11001), true)
  assert.match(serializeCredential({ access_token: 'opaque', refresh_token: 'refresh' }), /opaque/)
})
