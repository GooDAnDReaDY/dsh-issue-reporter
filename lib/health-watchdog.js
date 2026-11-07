export function calculatePluginHealthScore({
  crashCount = 0,
  warningCount = 0,
  uptimeDays = 7,
} = {}) {
  const crashes = Number.isFinite(crashCount) ? Math.max(0, crashCount) : 0
  const warnings = Number.isFinite(warningCount) ? Math.max(0, warningCount) : 0
  const score = Math.max(0, 100 - crashes * 25 - warnings * 5)

  let status = 'healthy'
  let badge = '🟢 Stable'
  if (score < 60) {
    status = 'critical'
    badge = '🔴 High crash rate'
  } else if (score < 90) {
    status = 'warning'
    badge = '🟡 Warning'
  }

  return {
    score,
    status,
    badge,
    crashes,
    warnings,
    uptimeDays,
  }
}

export function aggregatePluginHealth(pluginName = '', incidents = []) {
  const safeName = String(pluginName || 'unknown')
  const list = Array.isArray(incidents) ? incidents : []

  let crashes = 0
  let warnings = 0
  const recentErrors = []

  for (const inc of list) {
    const level = String(inc?.level || inc?.type || 'error').toLowerCase()
    if (level === 'fatal' || level === 'crash' || level === 'error') {
      crashes += 1
    } else {
      warnings += 1
    }
    if (recentErrors.length < 5 && inc?.message) {
      recentErrors.push(String(inc.message).slice(0, 160))
    }
  }

  const assessment = calculatePluginHealthScore({ crashCount: crashes, warningCount: warnings })

  return {
    pluginName: safeName,
    ...assessment,
    recentErrors,
    timestamp: new Date().toISOString(),
  }
}

export function formatPluginHealthMarkdown(report = {}) {
  const {
    pluginName = 'unknown',
    badge = '🟢 Stable',
    score = 100,
    crashes = 0,
    warnings = 0,
    recentErrors = [],
  } = report

  const lines = [
    `### Plugin Health: \`${pluginName}\` — ${badge}`,
    `- **Stability Score**: ${score} / 100`,
    `- **Crash Count**: ${crashes}`,
    `- **Warning Count**: ${warnings}`,
  ]

  if (recentErrors.length > 0) {
    lines.push('', '**Recent Caught Incidents:**')
    for (const err of recentErrors) {
      lines.push(`- \`${err}\``)
    }
  }

  return lines.join('\n')
}

export class PluginHealthRegistry {
  constructor(options = {}) {
    this.history = new Map()
    this.maxIncidentsPerPlugin = options.maxIncidents || 30
  }

  recordIncident(pluginName, incident = {}) {
    const key = String(pluginName || 'unknown')
    if (!this.history.has(key)) {
      this.history.set(key, [])
    }
    const list = this.history.get(key)
    list.unshift({
      ...incident,
      timestamp: incident.timestamp || new Date().toISOString(),
    })
    if (list.length > this.maxIncidentsPerPlugin) {
      list.length = this.maxIncidentsPerPlugin
    }
  }

  getPluginHealth(pluginName) {
    const key = String(pluginName || 'unknown')
    const list = this.history.get(key) || []
    return aggregatePluginHealth(key, list)
  }

  getAllHealthReports() {
    const reports = []
    for (const [key, list] of this.history.entries()) {
      reports.push(aggregatePluginHealth(key, list))
    }
    return reports
  }

  clearPlugin(pluginName) {
    return this.history.delete(String(pluginName || 'unknown'))
  }
}
