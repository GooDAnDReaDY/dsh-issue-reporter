export function buildSubagentInvestigationTask({
  pluginName = 'unknown',
  errorStack = '',
  errorDump = '',
  diagnostics = {},
} = {}) {
  const taskId = `task-inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  const safeName = String(pluginName)
  const safeStack = String(errorStack).slice(0, 3000)

  const prompt = [
    `Investigate defect in plugin \`${safeName}\`.`,
    `Review stack trace and pinpoint the root cause:`,
    '```',
    safeStack || 'No stack trace available',
    '```',
    'Instructions:',
    '1. Locate problematic file and line number.',
    '2. Explain failure mechanism.',
    '3. Provide minimal drop-in patch recommendation.',
  ].join('\n')

  return {
    taskId,
    pluginName: safeName,
    prompt,
    role: 'Defect Investigator',
    environmentContext: {
      diagnostics: diagnostics || {},
      hasStack: Boolean(errorStack),
      timestamp: new Date().toISOString(),
    },
  }
}

export function parseSubagentInvestigationResult(rawContent = '') {
  const text = String(rawContent || '').trim()
  if (!text) {
    return {
      success: false,
      summary: 'No investigation result returned by subagent',
      file: null,
      line: null,
      rootCause: 'Unknown',
      confidence: 'low',
    }
  }

  const fileMatch = text.match(/(?:file|location|path)[:\s]+([a-zA-Z0-9_./\\-]+)/i)
  const lineMatch = text.match(/(?:line|L)[:\s]+(\d+)/i)
  const patchMatch = text.match(/```(?:diff|javascript|js)?([\s\S]*?)```/)

  return {
    success: true,
    summary: text.slice(0, 300),
    file: fileMatch ? fileMatch[1] : null,
    line: lineMatch ? parseInt(lineMatch[1], 10) : null,
    suggestedPatch: patchMatch ? patchMatch[1].trim() : null,
    confidence: fileMatch && lineMatch ? 'high' : 'medium',
    rawOutput: text,
  }
}

export function formatSubagentInvestigationMarkdown(result = {}) {
  const {
    pluginName = 'plugin',
    file,
    line,
    summary = 'Investigation complete',
    confidence = 'medium',
    suggestedPatch,
  } = result

  const lines = [
    `### 🤖 Subagent Investigation: \`${pluginName}\``,
    `- **Confidence**: \`${confidence}\``,
    file ? `- **Suspect File**: \`${file}\`${line ? ` (line ${line})` : ''}` : '- **Suspect File**: Not pinpointed',
    `- **Diagnosis**: ${summary}`,
  ]

  if (suggestedPatch) {
    lines.push('', '**Suggested Patch:**', '```javascript', suggestedPatch, '```')
  }

  return lines.join('\n')
}
