const PACKAGE_NAME = /^[a-z0-9][a-z0-9._-]*$/i
const SCOPED_PACKAGE = /^@[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*$/i
const MAX_FIELD = 12000
const MAX_BODY = 60000

function text(value, max = MAX_FIELD) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function packageName(value) {
  const candidate = text(value, 240)
  return PACKAGE_NAME.test(candidate) || SCOPED_PACKAGE.test(candidate)
}

export function parseGitHubRepository(value) {
  const raw = typeof value === 'string'
    ? value
    : value && typeof value === 'object'
      ? value.url || value.web || value.html_url || ''
      : ''
  let candidate = text(raw, 1000)
  if (!candidate) return undefined
  if (!candidate.includes('://')) candidate = 'https://' + candidate
  if (candidate.startsWith('git+')) candidate = candidate.slice(4)
  let url
  try { url = new URL(candidate) } catch { return undefined }
  if (!['github.com', 'www.github.com'].includes(url.hostname.toLowerCase())) return undefined
  const parts = url.pathname.split('/').filter(Boolean)
  if (parts.length !== 2) return undefined
  const owner = parts[0]
  const repo = parts[1].replace(/\.git$/, '')
  if (!owner || !repo || !/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repo)) return undefined
  const fullName = owner + '/' + repo
  return {
    owner,
    repo,
    fullName,
    url: 'https://github.com/' + fullName,
    issuesUrl: 'https://github.com/' + fullName + '/issues',
  }
}

export function parseForgeRepository(value) {
  const gh = parseGitHubRepository(value)
  if (gh) return { ...gh, forge: 'github' }
  const raw = typeof value === 'string'
    ? value
    : value && typeof value === 'object'
      ? value.url || value.web || value.html_url || ''
      : ''
  let candidate = text(raw, 1000)
  if (!candidate) return undefined
  if (!candidate.includes('://')) candidate = 'https://' + candidate
  if (candidate.startsWith('git+')) candidate = candidate.slice(4)
  let url
  try { url = new URL(candidate) } catch { return undefined }
  const parts = url.pathname.split('/').filter(Boolean)
  if (parts.length < 2) return undefined
  const owner = parts[parts.length - 2]
  const repo = parts[parts.length - 1].replace(/\.git$/, '')
  if (!owner || !repo || !/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repo)) return undefined
  const fullName = owner + '/' + repo
  const origin = url.origin
  return {
    forge: 'gitea',
    owner,
    repo,
    fullName,
    host: url.host,
    url: `${origin}/${fullName}`,
    issuesUrl: `${origin}/${fullName}/issues`,
  }
}

export function metadataRepository(metadata) {
  if (!metadata || typeof metadata !== 'object') return undefined
  return parseForgeRepository(metadata.repository) || parseGitHubRepository(metadata.repository)
}

function moduleSpecifier(value) {
  const candidate = text(value, 240)
  return packageName(candidate) ? candidate : ''
}

export function pluginCategory(moduleName) {
  return moduleSpecifier(moduleName).startsWith('@deepseek-ai/') ? 'native' : 'third-party'
}

export function buildPluginCatalog(snapshot, metadataByModule = {}) {
  const sourceRows = []
  const add = (row, presetId = undefined) => {
    if (!row || typeof row !== 'object') return
    const moduleName = moduleSpecifier(row.moduleName)
    if (!moduleName) return
    sourceRows.push({
      entryId: text(row.entryId, 240) || undefined,
      moduleName,
      enabled: row.enabled !== false,
      fiberPhase: text(row.fiberPhase, 32) || null,
      fiberError: text(row.fiberError, 1000) || undefined,
      presetId: text(presetId, 120) || undefined,
    })
  }
  for (const row of Array.isArray(snapshot?.entries) ? snapshot.entries : []) add(row)
  for (const preset of Array.isArray(snapshot?.agentPresets) ? snapshot.agentPresets : []) {
    for (const row of Array.isArray(preset?.rows) ? preset.rows : []) add(row, preset.id)
  }
  const seen = new Set()
  return sourceRows.filter((row) => {
    const key = row.moduleName + ':' + (row.presetId || '')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).map((row) => {
    const metadata = metadataByModule[row.moduleName]
    const repository = metadataRepository(metadata)
    return {
      ...row,
      category: pluginCategory(row.moduleName),
      displayName: text(metadata?.displayName || metadata?.name || row.moduleName, 160),
      version: text(metadata?.version, 80) || undefined,
      description: text(metadata?.description, 500) || undefined,
      repository,
      supported: repository !== undefined,
      reason: repository ? undefined : 'No supported repository metadata was found.',
    }
  })
}

const REDACTIONS = [
  { kind: 'token', pattern: /\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{20,}|xox[baprs]-[A-Za-z0-9-]{12,}|AIzaSy[A-Za-z0-9_-]{20,}|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})\b/g, replacement: '[redacted token]' },
  { kind: 'credential', pattern: /\b(?:bearer\s+|(?:bearer|token|password|passwd|secret|api[-_ ]?key)\s*[:=]\s*)[^\s,;"]+/gi, replacement: '[redacted credential]' },
  { kind: 'url-credential', pattern: /\bhttps?:\/\/[^\s/@]+:[^\s/@]+@[^\s]+/gi, replacement: '[redacted URL]' },
  { kind: 'path', pattern: /(?:[A-Za-z]:\\|\\\\|\/home\/|\/Users\/|\/mnt\/|\/opt\/)[^\s"'<>]+/g, replacement: '[redacted path]' },
  { kind: 'ip', pattern: /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})\b/g, replacement: '[redacted IP]' },
  { kind: 'email', pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, replacement: '[redacted email]' },
]

function normalizeRedactInput(value, max = MAX_FIELD) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value.trim().slice(0, max)
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2).slice(0, max)
    } catch {
      return String(value).slice(0, max)
    }
  }
  return String(value).slice(0, max)
}

export function redactText(value, max = MAX_FIELD) {
  let output = normalizeRedactInput(value, max)
  const found = []
  for (const rule of REDACTIONS) {
    const before = output
    output = output.replace(rule.pattern, rule.replacement)
    if (output !== before) found.push(rule.kind)
  }
  return { text: output, redactions: [...new Set(found)] }
}

function section(title, value) {
  const safe = redactText(value).text
  return safe ? '## ' + title + '\n\n' + safe : ''
}

export function composeIssueDraft(input = {}) {
  const title = redactText(input.title || 'Bug report').text.slice(0, 240)
  const envParts = []
  if (input.environment) envParts.push(redactText(input.environment).text)
  if (input.diagnostics) {
    const diagText = redactText(input.diagnostics).text.trim()
    if (diagText) envParts.push('Diagnostics:\n```text\n' + diagText + '\n```')
  }
  const envText = envParts.filter(Boolean).join('\n\n')

  const sections = [
    section('Observed behavior', input.observed),
    section('Steps to reproduce', input.reproduction),
    section('Expected behavior', input.expected),
    section('Environment', envText),
    section('DSH plugin context', input.pluginContext),
    input.errorStack ? section('Error stack / details', '```text\n' + redactText(input.errorStack).text.trim() + '\n```') : '',
  ].filter(Boolean)
  const body = sections.join('\n\n').slice(0, MAX_BODY)
  const redactions = [...new Set([
    ...redactText(input.title).redactions,
    ...Object.values(input).flatMap((value) => redactText(value).redactions),
  ])]
  return { title, body, redactions, labels: Array.isArray(input.labels) ? input.labels : [] }
}

export function prefilledIssueUrl(repository, draft) {
  const repo = parseForgeRepository(repository) || parseGitHubRepository(repository)
  if (!repo) return ''
  const url = new URL(repo.issuesUrl + '/new')
  url.searchParams.set('title', text(draft?.title, 240))
  url.searchParams.set('body', text(draft?.body, MAX_BODY))
  return url.toString()
}

function words(value) {
  return new Set((text(value, MAX_BODY).toLowerCase().match(/[a-z0-9][a-z0-9_-]{2,}/g) || []))
}

export function findDuplicateIssues(issues, draft, limit = 5) {
  const target = words((draft?.title || '') + ' ' + (draft?.body || ''))
  return (Array.isArray(issues) ? issues : []).map((issue) => {
    const candidate = words((issue?.title || '') + ' ' + (issue?.body || ''))
    let overlap = 0
    for (const word of target) if (candidate.has(word)) overlap++
    const score = target.size ? overlap / target.size : 0
    return {
      number: issue.number,
      title: text(issue.title, 240),
      url: text(issue.html_url || issue.url, 1000),
      state: issue.state === 'closed' ? 'closed' : 'open',
      score,
    }
  }).filter((issue) => issue.number !== undefined && issue.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export function createDeviceFlowState(now = Date.now(), ttlMs = 15 * 60 * 1000) {
  return { createdAt: now, expiresAt: now + ttlMs, nextPollAt: now, intervalMs: 5000 }
}

export function isDeviceFlowExpired(state, now = Date.now()) {
  return !state || !Number.isFinite(state.expiresAt) || now >= state.expiresAt
}

export function nextDevicePoll(state, response, now = Date.now()) {
  if (!state || isDeviceFlowExpired(state, now)) return { ...state, expired: true }
  const error = response?.error
  if (error === 'slow_down') state.intervalMs = Math.min(state.intervalMs + 5000, 30000)
  state.nextPollAt = now + state.intervalMs
  return { ...state, pending: error === 'authorization_pending' || error === 'slow_down' }
}

export function parseCredential(value) {
  if (typeof value !== 'string' || !value) return undefined
  let parsed
  try {
    parsed = JSON.parse(value)
  } catch {
    parsed = undefined // A raw personal access token is also a valid credential representation.
  }
  if (parsed && typeof parsed.access_token === 'string' && parsed.access_token) return parsed
  return { access_token: value }
}

export function serializeCredential(value) {
  return JSON.stringify({
    access_token: text(value?.access_token, 500),
    refresh_token: text(value?.refresh_token, 500) || undefined,
    expires_at: Number.isFinite(value?.expires_at) ? value.expires_at : undefined,
    token_type: text(value?.token_type, 40) || 'bearer',
  })
}

export function explicitConfirmation(value) {
  return value === true
}

export function buildAiOptimizationPrompt({ title, observed, reproduction, expected, pluginName, errorStack, diagnostics, environment } = {}) {
  const safeTitle = redactText(title).text
  const safeObserved = redactText(observed).text
  const safeReproduction = redactText(reproduction).text
  const safeExpected = redactText(expected).text
  const safePlugin = redactText(pluginName).text
  const safeErrorStack = redactText(errorStack).text
  const safeDiagnostics = redactText(diagnostics).text
  const safeEnvironment = redactText(environment).text

  const parts = [
    'You are a software engineer refining a bug report for DeepSeek Harness.',
    'Format the bug report into clean, professional GitHub issue Markdown with the following sections:',
    '## Observed Behavior',
    '## Steps to Reproduce',
    '## Expected Behavior',
    '## Error Details / Stack Trace',
    '',
    `Target Plugin: ${safePlugin || 'Unknown'}`,
    `Raw Title: ${safeTitle || ''}`,
    `Raw Observed: ${safeObserved || ''}`,
    `Raw Reproduction: ${safeReproduction || ''}`,
    `Raw Expected: ${safeExpected || ''}`,
  ]
  if (safeEnvironment) parts.push(`Environment:\n\`\`\`\n${safeEnvironment}\n\`\`\``)
  if (safeErrorStack) parts.push(`Error Stack:\n\`\`\`\n${safeErrorStack}\n\`\`\``)
  if (safeDiagnostics) parts.push(`Environment Diagnostics:\n\`\`\`\n${safeDiagnostics}\n\`\`\``)
  parts.push('', 'Provide an actionable, polished issue title on the first line prefixed with "Title: ", followed by the markdown body.')
  return parts.join('\n')
}

export function parseAiOptimizedResponse(responseContent) {
  if (typeof responseContent !== 'string' || !responseContent.trim()) {
    return { title: '', body: '' }
  }
  const trimmed = responseContent.trim()
  const jsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, trimmed]
  let parsed
  try {
    parsed = JSON.parse(jsonMatch[1])
  } catch {
    parsed = undefined // Invalid JSON falls through to the plain-text response parser.
  }
  if (parsed && typeof parsed === 'object') {
    return {
      title: redactText(parsed.title || '').text,
      body: redactText(parsed.body || '').text,
      observed: redactText(parsed.observed || '').text,
      reproduction: redactText(parsed.reproduction || '').text,
      expected: redactText(parsed.expected || '').text,
    }
  }

  const lines = trimmed.split('\n')
  let title = ''
  let bodyStartIndex = 0
  if (lines[0].toLowerCase().startsWith('title:')) {
    title = lines[0].replace(/^title:\s*/i, '').trim()
    bodyStartIndex = 1
  }
  const body = lines.slice(bodyStartIndex).join('\n').trim()
  return {
    title: redactText(title).text,
    body: redactText(body).text,
  }
}

export function formatLogSnippet(lines = [], maxLines = 50) {
  if (!Array.isArray(lines)) return ''
  const selected = lines.slice(-maxLines).map((line) => {
    const ts = typeof line === 'object' && line?.timestamp ? `[${line.timestamp}] ` : ''
    const raw = typeof line === 'string' ? line : (line?.message || JSON.stringify(line))
    return redactText(`${ts}${raw}`).text
  }).filter(Boolean)
  if (!selected.length) return ''
  return [
    '<details>',
    '<summary>Relevant Session Logs (' + selected.length + ' lines)</summary>',
    '',
    '```text',
    ...selected,
    '```',
    '</details>',
  ].join('\n')
}

export function parseIssueState(issue) {
  if (!issue || typeof issue !== 'object') return { state: 'unknown', comments: 0 }
  return {
    number: issue.number,
    title: text(issue.title, 240),
    state: issue.state === 'closed' ? 'closed' : 'open',
    url: text(issue.html_url || issue.url, 1000),
    comments: Number.isFinite(issue.comments) ? issue.comments : 0,
    updatedAt: text(issue.updated_at, 40) || undefined,
    closedAt: text(issue.closed_at, 40) || null,
  }
}

export function recommendLabels({ pluginName, description, errorStack, availableLabels = [] } = {}) {
  const haystack = `${pluginName || ''} ${description || ''} ${errorStack || ''}`.toLowerCase()
  const recommended = new Set()
  const labelNames = (Array.isArray(availableLabels) ? availableLabels : []).map(l => typeof l === 'string' ? l : l?.name).filter(Boolean)

  const patterns = [
    { label: 'bug', test: /error|exception|fail|crash|bug|rejection/i },
    { label: 'ui', test: /ui|button|modal|tab|render|display|view|client|style|css/i },
    { label: 'frontend', test: /ui|client|dom|react|component/i },
    { label: 'backend', test: /server|host|cordis|service|api|route|express/i },
    { label: 'auth', test: /auth|token|login|logout|device|oauth|credential/i },
    { label: 'performance', test: /slow|leak|timeout|lag|freeze|memory/i },
  ]

  for (const pat of patterns) {
    if (pat.test.test(haystack)) {
      const match = labelNames.find(name => name.toLowerCase() === pat.label || name.toLowerCase().includes(pat.label))
      if (match) recommended.add(match)
    }
  }

  return [...recommended]
}
