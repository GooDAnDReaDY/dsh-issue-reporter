import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildAiOptimizationPrompt,
  parseAiOptimizedResponse,
  formatLogSnippet,
  parseIssueState,
  recommendLabels,
  composeIssueDraft,
} from '../lib/domain.js'

test('AI optimization prompt builder and parser extract structured draft', () => {
  const prompt = buildAiOptimizationPrompt({
    observed: 'Plugin crashed when clicking save',
    reproduction: '1. open tab 2. click save',
    expected: 'Should save successfully',
    pluginName: '@goodandready/dsh-voice',
  })
  assert.ok(prompt.includes('Observed Behavior'))
  assert.ok(prompt.includes('@goodandready/dsh-voice'))

  const validJsonResp = 'Here is the result:\n```json\n{"title": "Fix: Save button crash", "observed": "Detailed crash", "reproduction": "Step 1", "expected": "Save ok"}\n```'
  const parsed = parseAiOptimizedResponse(validJsonResp)
  assert.equal(parsed.title, 'Fix: Save button crash')
  assert.equal(parsed.observed, 'Detailed crash')
  assert.equal(parsed.reproduction, 'Step 1')
  assert.equal(parsed.expected, 'Save ok')
})

test('formatLogSnippet formats and truncates entries safely', () => {
  const snippet = formatLogSnippet([
    { timestamp: '2026-09-14T20:00:00Z', message: 'User password=secret123 logged in' },
    { timestamp: '2026-09-14T20:01:00Z', message: 'Loaded module' },
  ])
  assert.ok(snippet.includes('[2026-09-14T20:00:00Z]'))
  assert.ok(snippet.includes('[redacted credential]'))
  assert.equal(snippet.includes('secret123'), false)
})

test('parseIssueState extracts state and comments', () => {
  const openIssue = parseIssueState({ number: 42, title: 'Bug', state: 'open', comments: 3 })
  assert.equal(openIssue.number, 42)
  assert.equal(openIssue.state, 'open')
  assert.equal(openIssue.comments, 3)

  const closedIssue = parseIssueState({ number: 43, state: 'closed' })
  assert.equal(closedIssue.state, 'closed')
})

test('recommendLabels suggests relevant labels based on keywords', () => {
  const available = [
    { name: 'bug', color: 'ee0701' },
    { name: 'ui', color: '1d76db' },
    { name: 'enhancement', color: '0e8a16' },
  ]
  const rec = recommendLabels({
    pluginName: 'dsh-voice',
    description: 'UI button failed with error crash',
    errorStack: 'TypeError: button is null',
    availableLabels: available,
  })
  assert.ok(rec.includes('bug'))
  assert.ok(rec.includes('ui'))
})

test('composeIssueDraft includes labels and redacts sensitive data', () => {
  const draft = composeIssueDraft({
    title: 'Secret key sk-12345678901234567890 leak',
    observed: 'Saw secret token',
    labels: ['bug', 'security'],
  })
  assert.equal(draft.labels.length, 2)
  assert.ok(draft.labels.includes('bug'))
  assert.ok(draft.labels.includes('security'))
  assert.equal(draft.title.includes('sk-12345678901234567890'), false)
})

test('composeIssueDraft redacts LAN IP and JWT in issue body', () => {
  const draft = composeIssueDraft({
    title: 'Connection error to 10.23.45.67',
    observed: 'Failed to contact host at 10.0.1.25 with token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlF2r1_6',
  })
  assert.equal(draft.title.includes('10.23.45.67'), false)
  assert.equal(draft.body.includes('10.0.1.25'), false)
  assert.equal(draft.body.includes('eyJhbGci'), false)
  assert.ok(draft.redactions.includes('ip'))
  assert.ok(draft.redactions.includes('token'))
})

test('buildAiOptimizationPrompt redacts sensitive tokens, credentials, paths and LAN IPs', () => {
  const prompt = buildAiOptimizationPrompt({
    title: 'Secret leak sk-12345678901234567890 in service',
    observed: 'Contacted https://admin:supersecret@example.com with token ghp_12345678901234567890abcdef',
    reproduction: 'curl http://10.0.0.1/api with password=secret_pw',
    expected: 'Should connect securely without token',
    pluginName: 'dsh-voice',
    errorStack: 'Error at /home/alice/project/index.js:42',
    diagnostics: { host: '172.16.0.5', apiKey: 'sk-98765432109876543210', path: '/opt/app/logs' },
    environment: 'Node v22 on 10.23.45.67',
  })
  assert.equal(prompt.includes('sk-12345678901234567890'), false)
  assert.equal(prompt.includes('ghp_12345678901234567890abcdef'), false)
  assert.equal(prompt.includes('admin:supersecret'), false)
  assert.equal(prompt.includes('secret_pw'), false)
  assert.equal(prompt.includes('10.0.0.1'), false)
  assert.equal(prompt.includes('10.23.45.67'), false)
  assert.equal(prompt.includes('172.16.0.5'), false)
  assert.equal(prompt.includes('/home/alice'), false)
  assert.equal(prompt.includes('/opt/app'), false)
  assert.equal(prompt.includes('sk-98765432109876543210'), false)
  assert.ok(prompt.includes('[redacted token]'))
  assert.ok(prompt.includes('[redacted path]'))
  assert.ok(prompt.includes('[redacted IP]'))
  assert.ok(prompt.includes('[redacted URL]'))
  assert.ok(prompt.includes('[redacted credential]'))
})

