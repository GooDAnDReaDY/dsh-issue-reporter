const DEFAULT_ACCEPT = 'application/vnd.github+json'
const DEFAULT_OAUTH_BASE_URL = 'https://github.com'
const USER_AGENT = 'dsh-issue-reporter'

export class GitHubApiError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.name = 'GitHubApiError'
    this.status = status
    this.payload = payload
  }
}

function apiUrl(baseUrl, path, query) {
  const base = new URL(baseUrl)
  if (!['https:', 'http:'].includes(base.protocol)) throw new Error('GitHub API base URL must use HTTP or HTTPS')
  const url = new URL(path.replace(/^\//, ''), base.toString().replace(/\/$/, '') + '/')
  for (const [key, value] of Object.entries(query || {})) url.searchParams.set(key, value)
  return url.toString()
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
  const response = await fetchImpl(apiUrl(baseUrl, path, options.query), {
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

export function createGitHubClient({
  fetchImpl = globalThis.fetch,
  baseUrl = 'https://api.github.com',
  oauthBaseUrl = DEFAULT_OAUTH_BASE_URL,
  token = '',
  signal,
} = {}) {
  if (typeof fetchImpl !== 'function') throw new TypeError('fetch implementation is required')
  return {
    deviceCode(clientId, scope = 'repo') {
      return request(fetchImpl, oauthBaseUrl, '/login/device/code', {
        method: 'POST',
        query: { client_id: clientId, ...(scope ? { scope } : {}) },
        headers: { Accept: 'application/json' },
        signal,
      })
    },
    accessToken(clientId, deviceCode) {
      return request(fetchImpl, oauthBaseUrl, '/login/oauth/access_token', {
        method: 'POST',
        query: { client_id: clientId, device_code: deviceCode, grant_type: 'urn:ietf:params:oauth:grant-type:device_code' },
        headers: { Accept: 'application/json' },
        signal,
      })
    },
    refreshToken(clientId, refreshToken) {
      return request(fetchImpl, oauthBaseUrl, '/login/oauth/access_token', {
        method: 'POST',
        query: { client_id: clientId, refresh_token: refreshToken, grant_type: 'refresh_token' },
        headers: { Accept: 'application/json' },
        signal,
      })
    },
    currentUser() {
      return request(fetchImpl, baseUrl, '/user', { token, signal })
    },
    searchIssues(owner, repo, query, state = 'open') {
      const stateQualifier = state === 'all' ? '' : (state === 'closed' ? ' is:closed' : ' is:open')
      const params = new URLSearchParams({ q: (query || '') + ' repo:' + owner + '/' + repo + stateQualifier, per_page: '10' })
      return request(fetchImpl, baseUrl, '/search/issues?' + params, { token, signal })
    },
    getIssue(owner, repo, number) {
      return request(fetchImpl, baseUrl, '/repos/' + encodeURIComponent(owner) + '/' + encodeURIComponent(repo) + '/issues/' + encodeURIComponent(number), { token, signal })
    },
    listLabels(owner, repo) {
      return request(fetchImpl, baseUrl, '/repos/' + encodeURIComponent(owner) + '/' + encodeURIComponent(repo) + '/labels?per_page=100', { token, signal })
        .catch(() => [])
    },
    fetchIssueTemplates(owner, repo) {
      return request(fetchImpl, baseUrl, '/repos/' + encodeURIComponent(owner) + '/' + encodeURIComponent(repo) + '/contents/.github/ISSUE_TEMPLATE', { token, signal })
        .catch(() => [])
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

export function createGiteaClient({
  fetchImpl = globalThis.fetch,
  baseUrl,
  token = '',
  signal,
} = {}) {
  if (typeof fetchImpl !== 'function') throw new TypeError('fetch implementation is required')
  const cleanBase = (baseUrl || '').replace(/\/$/, '')
  async function giteaRequest(path, options = {}) {
    const url = new URL(path.replace(/^\//, ''), cleanBase + '/')
    for (const [key, value] of Object.entries(options.query || {})) url.searchParams.set(key, value)
    const headers = {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: 'token ' + token } : {}),
      ...(options.headers || {}),
    }
    const res = await fetchImpl(url.toString(), {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal,
    })
    const raw = await res.text()
    let payload
    try { payload = raw ? JSON.parse(raw) : undefined } catch { payload = { message: raw } }
    if (!res.ok) {
      throw new GitHubApiError(payload?.message || 'Gitea API request failed', res.status, payload)
    }
    return payload
  }
  return {
    currentUser() {
      return giteaRequest('/api/v1/user')
    },
    searchIssues(owner, repo, query, state = 'open') {
      return giteaRequest('/api/v1/repos/' + encodeURIComponent(owner) + '/' + encodeURIComponent(repo) + '/issues', {
        query: { q: query || '', state: state === 'all' ? 'all' : (state === 'closed' ? 'closed' : 'open'), limit: 10 },
      })
    },
    createIssue(owner, repo, issue) {
      return giteaRequest('/api/v1/repos/' + encodeURIComponent(owner) + '/' + encodeURIComponent(repo) + '/issues', {
        method: 'POST',
        body: { title: issue.title, body: issue.body, ...(issue.labels?.length ? { labels: issue.labels } : {}) },
      })
    },
    getIssue(owner, repo, number) {
      return giteaRequest('/api/v1/repos/' + encodeURIComponent(owner) + '/' + encodeURIComponent(repo) + '/issues/' + encodeURIComponent(number))
    },
    listLabels(owner, repo) {
      return giteaRequest('/api/v1/repos/' + encodeURIComponent(owner) + '/' + encodeURIComponent(repo) + '/labels', {
        query: { limit: 100 },
      }).catch(() => [])
    },
  }
}
