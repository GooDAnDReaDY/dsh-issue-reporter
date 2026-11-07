export function parseSemverParts(version = '') {
  const clean = String(version || '').replace(/^v/, '').trim()
  const [core] = clean.split('-')
  const parts = core.split('.').map((p) => {
    const num = parseInt(p, 10)
    return Number.isFinite(num) ? num : 0
  })
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0]
}

export function compareSemver(v1, v2) {
  const p1 = parseSemverParts(v1)
  const p2 = parseSemverParts(v2)
  for (let i = 0; i < 3; i++) {
    if (p1[i] > p2[i]) return 1
    if (p1[i] < p2[i]) return -1
  }
  return 0
}

export function detectFixAvailable({
  pluginName = '',
  currentVersion = '0.0.0',
  ticketState = 'open',
  latestVersion = '0.0.0',
  releaseNotes = '',
  closedAt = null,
} = {}) {
  const isClosed = String(ticketState || '').toLowerCase() === 'closed'
  const isNewer = compareSemver(latestVersion, currentVersion) > 0

  return {
    fixAvailable: isClosed && isNewer,
    pluginName,
    currentVersion,
    fixVersion: latestVersion,
    ticketState: String(ticketState || '').toLowerCase(),
    releaseNotes: String(releaseNotes || '').slice(0, 500),
    closedAt,
    action: isClosed && isNewer ? 'ready_to_update' : 'none',
  }
}

export function formatFixNotificationMarkdown({
  pluginName,
  currentVersion,
  fixVersion,
  ticketNumber,
  releaseNotes,
} = {}) {
  const lines = [
    `### 🚀 Fix Available: \`${pluginName || 'plugin'}\``,
    `- **Issue**: Resolved in ticket #${ticketNumber || '?'}`,
    `- **Current Version**: \`v${currentVersion || '?'}\``,
    `- **Fixed Version**: \`v${fixVersion || '?'}\``,
  ]

  if (releaseNotes) {
    lines.push('', '**Changelog / Release Note:**', `> ${releaseNotes}`)
  }

  lines.push('', '👉 *Click "1-Click Update" to safely update this plugin now.*')
  return lines.join('\n')
}

export function prepareFixUpdatePayload({ pluginName, fixVersion } = {}) {
  if (!pluginName || !fixVersion) {
    throw new Error('pluginName and fixVersion are required to prepare fix update')
  }
  return {
    pluginName,
    targetVersion: String(fixVersion).replace(/^v/, ''),
    source: 'issue-fix-updater',
    timestamp: new Date().toISOString(),
  }
}
