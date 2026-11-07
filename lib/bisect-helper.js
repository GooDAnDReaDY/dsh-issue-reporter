export function calculateBisectionRange({
  currentVersion = '',
  lastKnownGoodVersion = '',
  versionHistory = [],
} = {}) {
  const versions = Array.isArray(versionHistory) ? [...versionHistory] : []

  if (!versions.includes(currentVersion) && currentVersion) {
    versions.push(currentVersion)
  }
  if (!versions.includes(lastKnownGoodVersion) && lastKnownGoodVersion) {
    versions.push(lastKnownGoodVersion)
  }

  // Find index bounds
  const goodIndex = versions.indexOf(lastKnownGoodVersion)
  const badIndex = versions.indexOf(currentVersion)

  let intermediateVersions = []
  if (goodIndex !== -1 && badIndex !== -1) {
    const start = Math.min(goodIndex, badIndex)
    const end = Math.max(goodIndex, badIndex)
    intermediateVersions = versions.slice(start, end + 1)
  }

  return {
    currentVersion,
    lastKnownGoodVersion,
    intermediateCount: intermediateVersions.length,
    intermediateVersions,
    regressionRange: `${lastKnownGoodVersion || 'unknown'}..${currentVersion || 'current'}`,
    recommendation: intermediateVersions.length > 2
      ? `Regression detected across ${intermediateVersions.length} versions. Run git bisect start ${currentVersion} ${lastKnownGoodVersion}`
      : `Direct regression between ${lastKnownGoodVersion} and ${currentVersion}.`,
  }
}

export function formatBisectionMarkdown(range = {}) {
  return [
    '### Regression Bisection Range',
    `- **Known Good Version:** \`${range.lastKnownGoodVersion || 'unspecified'}\``,
    `- **Broken Current Version:** \`${range.currentVersion || 'current'}\``,
    `- **Regression Window:** \`${range.regressionRange}\` (${range.intermediateCount || 0} candidate releases)`,
    `- **Bisect Recommendation:** ${range.recommendation}`,
  ].join('\n')
}
