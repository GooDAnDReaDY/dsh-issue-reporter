const bootTimings = new Map()

export function recordPluginBootTiming(pluginName, { syncDurationMs = 0, asyncDurationMs = 0, totalDurationMs = 0, phase = 'apply' } = {}) {
  if (!pluginName) return null
  const total = totalDurationMs || (syncDurationMs + asyncDurationMs)
  const entry = {
    pluginName,
    syncDurationMs: Math.round(syncDurationMs * 100) / 100,
    asyncDurationMs: Math.round(asyncDurationMs * 100) / 100,
    totalDurationMs: Math.round(total * 100) / 100,
    phase,
    recordedAt: Date.now(),
  }
  bootTimings.set(pluginName, entry)
  return entry
}

export function getBootTimings() {
  return Array.from(bootTimings.values()).sort((a, b) => b.totalDurationMs - a.totalDurationMs)
}

export function clearBootTimings() {
  bootTimings.clear()
}

export function detectBootBlockers(thresholdMs = 800) {
  return getBootTimings().filter((t) => t.totalDurationMs >= thresholdMs)
}

export function formatBootProfileMarkdown(timings = getBootTimings(), thresholdMs = 800) {
  const items = Array.isArray(timings) ? timings : []
  const blockers = items.filter((t) => t.totalDurationMs >= thresholdMs)

  const lines = [
    '### Plugin Boot Time Profile',
    `- **Profiled Plugins:** ${items.length}`,
    `- **Threshold Limit:** ${thresholdMs}ms`,
  ]

  if (blockers.length > 0) {
    lines.push(`- **Cold Start Warning:** ${blockers.length} plugin(s) exceeded the ${thresholdMs}ms startup threshold:`)
    blockers.forEach((b) => {
      lines.push(`  - \`${b.pluginName}\`: **${b.totalDurationMs}ms** (sync: ${b.syncDurationMs}ms, async: ${b.asyncDurationMs}ms)`)
    })
  } else {
    lines.push('- **Cold Start Status:** All plugins initialized cleanly within safe operational boundaries.')
  }

  if (items.length > 0) {
    lines.push('', '| Plugin | Sync (ms) | Async (ms) | Total (ms) |', '| :--- | :--- | :--- | :--- |')
    items.slice(0, 10).forEach((t) => {
      lines.push(`| \`${t.pluginName}\` | ${t.syncDurationMs} | ${t.asyncDurationMs} | ${t.totalDurationMs} |`)
    })
  }

  return lines.join('\n')
}
