const DEFAULT_ACCEPT = 'application/vnd.github+json'
const USER_AGENT = 'dsh-issue-reporter'

export class GitHubApiError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.name = 'GitHubApiError'
    this.status = status
    this.payload = payload
  }
}

function apiUrl(baseUrl, path) {
  const base = new URL(baseUrl)
  if (!['https:', 'http:'].includes(base.protocol)) throw new Error('GitHub API base URL must use HTTP or HTTPS')
  return new URL(path.replace(/^\//, ''), base.toString().replace(/\/$/, '') + '/').toString()
}

async function request(fetchImpl, baseUrl, path, options = {}) {
  const headers = {
    Accept: DEFAULT_ACCEPT,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': USER_AGENT,
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.token ? { Authorization: 'Bearer ' + options.token } : {}),
    ...(options.headers || {}),
  }
  const response = await fetchImpl(apiUrl(baseUrl, path), {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })
  const raw = await response.text()
  let payload
  try { payload = raw ? JSON.parse(raw) : undefined } catch { payload = { message: raw } }
  if (!response.ok) {
    const message = typeof payload?.message === 'string' ? payload.message : 'GitHub API request failed'
    throw new GitHubApiError(message, response.status, payload)
  }
  return payload
}

export function createGitHubClient({ fetchImpl = globalThis.fetch, baseUrl = 'https://api.github.com', token = '', signal } = {}) {
  if (typeof fetchImpl !== 'function') throw new TypeError('fetch implementation is required')
  return {
    deviceCode(clientId) {
      return request(fetchImpl, baseUrl, '/login/device/code', {
        method: 'POST',
        body: { client_id: clientId },
        headers: { Accept: 'application/json' },
        signal,
      })
    },
    accessToken(clientId, deviceCode) {
      return request(fetchImpl, baseUrl, '/login/oauth/access_token', {
        method: 'POST',
        body: { client_id: clientId, device_code: deviceCode, grant_type: 'urn:ietf:params:oauth:grant-type:device_code' },
        headers: { Accept: 'application/json' },
        signal,
      })
    },
    refreshToken(clientId, refreshToken) {
      return request(fetchImpl, baseUrl, '/login/oauth/access_token', {
        method: 'POST',
        body: { client_id: clientId, refresh_token: refreshToken, grant_type: 'refresh_token' },
        headers: { Accept: 'application/json' },
        signal,
      })
    },
    currentUser() {
      return request(fetchImpl, baseUrl, '/user', { token, signal })
    },
    searchIssues(owner, repo, query) {
      const params = new URLSearchParams({ q: (query || '') + ' repo:' + owner + '/' + repo, per_page: '10' })
      return request(fetchImpl, baseUrl, '/search/issues?' + params, { token, signal })
    },
    createIssue(owner, repo, issue) {
      return request(fetchImpl, baseUrl, '/repos/' + encodeURIComponent(owner) + '/' + encodeURIComponent(repo) + '/issues', {
        method: 'POST',
        body: { title: issue.title, body: issue.body, ...(issue.labels?.length ? { labels: issue.labels } : {}) },
        token,
        signal,
      })
    },
  }
}
