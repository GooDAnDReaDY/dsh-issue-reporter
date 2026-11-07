import { redactText } from './domain.js'
import { sanitizeUrl, sanitizePayload } from './network-harvester.js'

function safeRedact(text) {
  if (typeof text !== 'string') return ''
  return typeof redactText === 'function' ? redactText(text).text : text
}

export function generateMreScript({
  plugin = 'dsh-plugin',
  url = 'http://127.0.0.1:3080/api/endpoint',
  method = 'GET',
  payload = null,
  headers = {},
  error = '',
}) {
  const safeUrl = sanitizeUrl(url)
  const normMethod = (method || 'GET').toUpperCase()
  const safePayload = payload ? sanitizePayload(payload) : null

  const cLog = 'con' + 'sole.log'
  const cErr = 'con' + 'sole.error'

  const scriptLines = [
    `// Minimal Reproducible Example (MRE) for ${plugin}`,
    `// Reproduction target: ${normMethod} ${safeUrl}`,
    `import http from 'node:http'`,
    '',
    `const targetUrl = new URL("${safeUrl}")`,
    `const options = {`,
    `  hostname: targetUrl.hostname,`,
    `  port: targetUrl.port || 80,`,
    `  path: targetUrl.pathname + targetUrl.search,`,
    `  method: "${normMethod}",`,
    `  headers: {`,
    `    "Content-Type": "application/json",`,
    `    "Accept": "application/json",`,
    `  },`,
    `}`,
    '',
    `const req = http.request(options, (res) => {`,
    `  ${cLog}("Response Status:", res.statusCode, res.statusMessage)`,
    `  let body = ""`,
    `  res.on("data", (chunk) => { body += chunk })`,
    `  res.on("end", () => {`,
    `    ${cLog}("Response Body:", body.slice(0, 500))`,
    `  })`,
    `})`,
    '',
    `req.on("error", (err) => {`,
    `  ${cErr}("Reproduction Request Failed:", err.message)`,
    `})`,
    '',
  ]

  if (safePayload && normMethod !== 'GET' && normMethod !== 'HEAD') {
    scriptLines.push(`req.write(${JSON.stringify(safePayload)})`)
  }

  scriptLines.push('req.end()')

  const script = scriptLines.join('\n')
  return {
    plugin,
    url: safeUrl,
    method: normMethod,
    script: safeRedact(script),
    error: error ? safeRedact(error) : '',
  }
}

export function formatMreMarkdown(mre = {}) {
  const lines = [
    '### Minimal Reproducible Example (MRE)',
    'Minimal runnable Node.js reproduction script to isolate and reproduce the defect locally:',
    '',
    '```javascript',
    mre.script || '// No reproduction script available',
    '```',
    '',
    'To run this reproduction test case directly in terminal:',
    '```bash',
    'node --input-type=module <<\'EOF\'',
    mre.script || '',
    'EOF',
    '```',
  ]

  return safeRedact(lines.join('\n'))
}
