import { redactText } from './domain.js'

function safeRedact(text) {
  if (typeof text !== 'string') return ''
  return typeof redactText === 'function' ? redactText(text).text : text
}

const MAX_FAILURES = 10
const FAILURE_RING_BUFFER = []

const SENSITIVE_QUERY_REGEX = /([?&](?:token|access_token|refresh_token|secret|api_key|password|auth|key)=)([^&#\s]+)/gi
const SENSITIVE_HEADER_KEYS = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'x-auth-token',
  'x-token',
  'proxy-authorization',
  'x-api-key',
  'x-dsh-auth',
])

export function sanitizeUrl(rawUrl = '') {
  if (typeof rawUrl !== 'string') return ''
  let sanitized = rawUrl.replace(SENSITIVE_QUERY_REGEX, '$1[REDACTED]')
  return safeRedact(sanitized)
}

export function sanitizeHeaders(headers = {}) {
  const result = {}
  if (!headers || typeof headers !== 'object') return result

  const entries = headers instanceof Map || typeof headers.entries === 'function'
    ? headers.entries()
    : Object.entries(headers)

  for (const [key, val] of entries) {
    if (!key || typeof key !== 'string') continue
    const lowerKey = key.toLowerCase()
    if (SENSITIVE_HEADER_KEYS.has(lowerKey)) {
      result[key] = '[REDACTED]'
    } else {
      result[key] = safeRedact(String(val))
    }
  }
  return result
}

const SENSITIVE_BODY_KEYS_REGEX = /"(password|passwd|secret|token|api_key|apiKey|access_token|client_secret)":\s*"[^"]*"/gi

export function sanitizePayload(body) {
  if (!body) return ''
  let str = typeof body === 'string' ? body : JSON.stringify(body)
  str = str.replace(SENSITIVE_BODY_KEYS_REGEX, '"$1":"[REDACTED]"')
  return safeRedact(str)
}

export function generateCurlCommand({ url = '', method = 'GET', headers = {}, requestBody = null }) {
  const safeUrl = sanitizeUrl(url)
  const normMethod = (method || 'GET').toUpperCase()
  const safeHdrs = sanitizeHeaders(headers)

  const parts = ['curl', '-s', '-S', '-X', normMethod, `"${safeUrl}"`]

  for (const [key, val] of Object.entries(safeHdrs)) {
    parts.push(`-H "${key}: ${val}"`)
  }

  if (requestBody && normMethod !== 'GET' && normMethod !== 'HEAD') {
    const bodyStr = sanitizePayload(requestBody)
    const escapedBody = bodyStr.replace(/'/g, `'\\''`)
    parts.push(`--data '${escapedBody}'`)
  }

  return parts.join(' ')
}

export function recordNetworkFailure({
  url = '',
  method = 'GET',
  status = 0,
  statusText = '',
  headers = {},
  requestBody = null,
  responseBody = null,
}) {
  const safeUrl = sanitizeUrl(url)
  const safeHeaders = sanitizeHeaders(headers)
  const safeReqBody = requestBody ? sanitizePayload(requestBody) : null
  const safeRespBody = responseBody ? sanitizePayload(responseBody) : null

  const curlCmd = generateCurlCommand({
    url: safeUrl,
    method,
    headers: safeHeaders,
    requestBody: safeReqBody,
  })

  const record = {
    timestamp: new Date().toISOString(),
    url: safeUrl,
    method: (method || 'GET').toUpperCase(),
    status: Number(status) || 0,
    statusText: statusText || (status === 0 ? 'Network / CORS Error' : ''),
    headers: safeHeaders,
    requestBody: safeReqBody,
    responseBody: safeRespBody,
    curlCmd,
  }

  FAILURE_RING_BUFFER.push(record)
  if (FAILURE_RING_BUFFER.length > MAX_FAILURES) {
    FAILURE_RING_BUFFER.shift()
  }

  return record
}

export function getRecentNetworkFailures() {
  return [...FAILURE_RING_BUFFER]
}

export function clearNetworkFailures() {
  FAILURE_RING_BUFFER.length = 0
}

export function formatCurlDump(record = {}) {
  if (!record || !record.url) return ''

  const lines = [
    '#### Failed Network Request',
    `- **Endpoint**: \`${record.method || 'GET'} ${record.url}\``,
    `- **Status**: \`${record.status} ${record.statusText || ''}\`.trim()`,
    `- **Timestamp**: \`${record.timestamp || new Date().toISOString()}\``,
    '',
    '- **Reproduction Curl**:',
    '```bash',
    record.curlCmd || `curl "${record.url}"`,
    '```',
  ]

  if (record.responseBody) {
    lines.push('')
    lines.push('- **Response Body Preview**:')
    lines.push('```json')
    lines.push(record.responseBody.slice(0, 1000))
    lines.push('```')
  }

  return safeRedact(lines.join('\n'))
}
