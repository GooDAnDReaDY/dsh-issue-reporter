import { redactText } from './domain.js'
import { sanitizePayload } from './network-harvester.js'

function safeRedact(text) {
  if (typeof text !== 'string') return ''
  return typeof redactText === 'function' ? redactText(text).text : text
}

const MAX_TOOL_CALLS = 10
const AGENT_TOOL_CALL_BUFFER = []

export function recordAgentToolCall({
  toolName = 'unknown_tool',
  args = {},
  result = null,
  error = null,
  durationMs = 0,
}) {
  let cleanArgs = args
  if (args && typeof args === 'object') {
    try {
      const sanitizedStr = sanitizePayload(JSON.stringify(args))
      cleanArgs = JSON.parse(sanitizedStr)
    } catch {
      cleanArgs = sanitizePayload(String(args))
    }
  }

  let cleanResult = result ? (typeof result === 'string' ? safeRedact(result) : safeRedact(JSON.stringify(result))) : null
  let cleanError = error ? (typeof error === 'string' ? safeRedact(error) : (error.message ? safeRedact(error.message) : 'Error')) : null

  const entry = {
    timestamp: new Date().toISOString(),
    toolName: String(toolName).slice(0, 60),
    args: cleanArgs,
    result: cleanResult,
    error: cleanError,
    durationMs: Number(durationMs) || 0,
  }

  AGENT_TOOL_CALL_BUFFER.push(entry)
  if (AGENT_TOOL_CALL_BUFFER.length > MAX_TOOL_CALLS) {
    AGENT_TOOL_CALL_BUFFER.shift()
  }

  return entry
}

export function getRecentAgentToolCalls() {
  return [...AGENT_TOOL_CALL_BUFFER]
}

export function clearAgentToolCalls() {
  AGENT_TOOL_CALL_BUFFER.length = 0
}

export function formatAgentReplayMarkdown(calls = []) {
  if (!Array.isArray(calls) || calls.length === 0) {
    return '### Agent Tool Workflow Replay\n\nNo agent tool executions captured.'
  }

  const lines = [
    '### Agent Tool Workflow Replay',
    'Recent autonomous agent tool executions leading up to defect:',
    '',
  ]

  calls.forEach((c, idx) => {
    const status = c.error ? '❌ Failed' : '✓ Succeeded'
    lines.push(`${idx + 1}. **Tool**: \`${c.toolName}\` (${status}, duration: ${c.durationMs}ms)`)
    if (c.args) {
      const argsStr = typeof c.args === 'object' ? JSON.stringify(c.args) : String(c.args)
      lines.push(`   - **Arguments**: \`${argsStr}\``)
    }
    if (c.error) {
      lines.push(`   - **Error**: \`${c.error}\``)
    }
    lines.push('')
  })

  return safeRedact(lines.join('\n'))
}
