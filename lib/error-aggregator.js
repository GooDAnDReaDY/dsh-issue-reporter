import { createHash } from 'node:crypto'

export function normalizeErrorSignature(message = '', stack = '') {
  const combined = `${message}\n${stack}`
  const normalized = combined
    .replace(/:\d+:\d+/g, ':0:0')
    .replace(/\b0x[a-fA-F0-9]+\b/g, '0x0')
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '00000000-0000-0000-0000-000000000000')
    .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?/g, 'TIMESTAMP')
    .replace(/\s+/g, ' ')
    .trim()

  return createHash('sha256').update(normalized).digest('hex').slice(0, 16)
}

const errorMap = new Map()
const MAX_AGGREGATED = 50

export function recordAggregatedError({ message = '', stack = '', pluginName = '' } = {}) {
  const signature = normalizeErrorSignature(message, stack)
  const now = Date.now()

  let entry = errorMap.get(signature)
  if (entry) {
    entry.count += 1
    entry.lastSeen = now
    if (pluginName && !entry.pluginName) entry.pluginName = pluginName
  } else {
    if (errorMap.size >= MAX_AGGREGATED) {
      const oldestKey = errorMap.keys().next().value
      errorMap.delete(oldestKey)
    }
    entry = {
      signature,
      message: String(message || '').slice(0, 300),
      stackSnippet: String(stack || '').split('\n').slice(0, 4).join('\n'),
      pluginName: pluginName || undefined,
      count: 1,
      firstSeen: now,
      lastSeen: now,
    }
    errorMap.set(signature, entry)
  }

  return { ...entry }
}

export function getAggregatedErrors() {
  return Array.from(errorMap.values()).sort((a, b) => b.lastSeen - a.lastSeen)
}

export function clearAggregatedErrors() {
  errorMap.clear()
}

export function formatErrorAggregationMarkdown(entry = {}) {
  if (!entry || !entry.count) return ''
  const first = new Date(entry.firstSeen || Date.now()).toISOString().replace('T', ' ').slice(0, 19)
  const last = new Date(entry.lastSeen || Date.now()).toISOString().replace('T', ' ').slice(0, 19)
  const spanMs = (entry.lastSeen || Date.now()) - (entry.firstSeen || Date.now())
  const spanMinutes = Math.max(1, Math.round(spanMs / (1000 * 60)))
  const spanHuman = spanMinutes >= 60 ? `${Math.floor(spanMinutes / 60)}h ${spanMinutes % 60}m` : `${spanMinutes}m`

  return [
    '### Error Recurrence Summary',
    `- **Reproduction Count:** Occurred ${entry.count} time(s)`,
    `- **Timeline:** First seen at \`${first}\`, last seen at \`${last}\` (${spanHuman} window)`,
    `- **Deduplication Signature:** \`${entry.signature || 'unknown'}\``,
  ].join('\n')
}
