export function triageIssueLabels({
  category = 'bug',
  availableLabels = [],
  errorContext = '',
} = {}) {
  const normCategory = String(category).toLowerCase()
  const context = `${normCategory} ${String(errorContext).toLowerCase()}`
  const selectedLabels = new Set()
  const available = Array.isArray(availableLabels) ? availableLabels : []

  // Check matching rules
  const hasLabel = (name) => available.some((l) => (typeof l === 'string' ? l : l.name) === name)

  if (context.includes('crash') || context.includes('exception') || context.includes('fatal')) {
    if (hasLabel('kind/bug')) selectedLabels.add('kind/bug')
    else if (hasLabel('bug')) selectedLabels.add('bug')
    if (hasLabel('severity/critical')) selectedLabels.add('severity/critical')
  }

  if (context.includes('ui') || context.includes('style') || context.includes('render')) {
    if (hasLabel('area/ui')) selectedLabels.add('area/ui')
    else if (hasLabel('ui')) selectedLabels.add('ui')
  }

  if (context.includes('security') || context.includes('vulnerability') || context.includes('rce')) {
    if (hasLabel('security')) selectedLabels.add('security')
    if (hasLabel('severity/critical')) selectedLabels.add('severity/critical')
  }

  if (context.includes('perf') || context.includes('leak') || context.includes('memory') || context.includes('lag')) {
    if (hasLabel('area/performance')) selectedLabels.add('area/performance')
    else if (hasLabel('performance')) selectedLabels.add('performance')
  }

  if (hasLabel('triage')) selectedLabels.add('triage')
  if (selectedLabels.size === 0) {
    if (hasLabel('bug')) selectedLabels.add('bug')
    else if (hasLabel('kind/bug')) selectedLabels.add('kind/bug')
  }

  return {
    category,
    selectedLabels: Array.from(selectedLabels),
    matchCount: selectedLabels.size,
  }
}

export function formatTriageSummaryMarkdown(triage = {}) {
  const labels = (triage.selectedLabels || []).map((l) => `\`${l}\``).join(', ')
  return [
    '### Smart Label Auto-Triage',
    `- **Inferred Category:** \`${triage.category || 'general'}\``,
    `- **Assigned Labels:** ${labels || '_No matching target labels found._'}`,
  ].join('\n')
}
