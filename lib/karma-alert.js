export function extractChangelogFixEntry({
  changelogText = '',
  ticketNumber,
  targetVersion,
} = {}) {
  const text = String(changelogText || '')
  if (!text) return null

  const lines = text.split('\n')
  const numStr = ticketNumber ? `#${ticketNumber}` : ''

  // Look for matching line with issue number
  if (numStr) {
    const matchedLines = []
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(numStr)) {
        matchedLines.push(lines[i].trim().replace(/^[-*]\s*/, ''))
      }
    }
    if (matchedLines.length > 0) {
      return matchedLines.join('; ')
    }
  }

  // Look for version header if targetVersion is given
  if (targetVersion) {
    const cleanVer = String(targetVersion).replace(/^v/, '')
    const verIdx = lines.findIndex((l) => l.includes(`## ${cleanVer}`) || l.includes(`[${cleanVer}]`))
    if (verIdx !== -1) {
      const excerpt = []
      for (let j = verIdx + 1; j < Math.min(lines.length, verIdx + 12); j++) {
        if (lines[j].startsWith('## ')) break
        if (lines[j].trim()) excerpt.push(lines[j].trim())
      }
      if (excerpt.length > 0) return excerpt.join(' ')
    }
  }

  return null
}

export function buildKarmaCelebrationPayload({
  ticketNumber,
  pluginName = 'plugin',
  targetVersion = 'latest',
  changelogSnippet = '',
  reporterName = 'Bug Hunter',
} = {}) {
  const safeName = String(pluginName)
  const safeNum = ticketNumber || '?'
  const cleanVer = String(targetVersion).replace(/^v/, '')

  const title = `🌟 Issue #${safeNum} Resolved in ${safeName}@${cleanVer}!`
  const message = `Your report #${safeNum} helped identify and eliminate a defect. Maintainers included the fix in release v${cleanVer}.`

  return {
    type: 'karma_celebration',
    badge: '🌟 Bug Hunter Karma',
    karmaPoints: 50,
    ticketNumber: safeNum,
    pluginName: safeName,
    targetVersion: cleanVer,
    title,
    message,
    changelogSnippet: String(changelogSnippet || '').slice(0, 300),
    timestamp: new Date().toISOString(),
  }
}

export function formatKarmaCelebrationMarkdown(payload = {}) {
  const {
    badge = '🌟 Bug Hunter Karma',
    title = 'Issue Resolved!',
    pluginName = 'plugin',
    targetVersion = 'latest',
    ticketNumber = '?',
    changelogSnippet,
  } = payload

  const lines = [
    `### ${badge}: \`${pluginName}\` (v${targetVersion})`,
    `> **${title}**`,
    '',
    `- **Resolved Issue**: #${ticketNumber}`,
    `- **Fixed in Release**: \`v${targetVersion}\``,
  ]

  if (changelogSnippet) {
    lines.push('', '**Changelog Highlight:**', `> ${changelogSnippet}`)
  }

  lines.push('', '🎉 *Thank you for contributing to the DeepSeek Harness ecosystem!*')
  return lines.join('\n')
}
