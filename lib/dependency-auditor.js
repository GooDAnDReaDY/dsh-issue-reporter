import { redactText } from './domain.js'

function safeRedact(text) {
  if (typeof text !== 'string') return ''
  return typeof redactText === 'function' ? redactText(text).text : text
}

export const SINGLETON_PACKAGES = new Set([
  'react',
  'react-dom',
  '@cordisjs/core',
  'cordis',
  '@deepseek-ai/schemastery',
])

export function scanDependencyDuplicates(packages = []) {
  const map = new Map()

  if (Array.isArray(packages)) {
    for (const pkg of packages) {
      if (!pkg || !pkg.name) continue
      const name = pkg.name.trim()
      const version = pkg.version ? String(pkg.version).trim() : 'unknown'
      const loc = pkg.path ? String(pkg.path).trim() : ''

      if (!map.has(name)) {
        map.set(name, new Map())
      }
      const versionMap = map.get(name)
      if (!versionMap.has(version)) {
        versionMap.set(version, [])
      }
      if (loc) versionMap.get(version).push(loc)
    }
  }

  const duplicates = []
  let hookConflictRisk = false

  for (const [name, versionMap] of map.entries()) {
    if (versionMap.size > 1) {
      const versions = Array.from(versionMap.keys())
      const locations = []
      for (const locs of versionMap.values()) {
        locations.push(...locs)
      }

      duplicates.push({
        name,
        versions,
        locations,
        isSingleton: SINGLETON_PACKAGES.has(name),
      })

      if (name === 'react' || name === 'react-dom') {
        hookConflictRisk = true
      }
    }
  }

  return {
    hasDuplicates: duplicates.length > 0,
    hookConflictRisk,
    duplicates,
  }
}

export function auditDependencies(options = {}) {
  const { packages = [], profileDir = null } = options
  const scan = scanDependencyDuplicates(packages)
  const recommendations = []

  if (scan.hookConflictRisk) {
    recommendations.push(
      'Critical: Multiple copies of React/ReactDOM detected in dependency tree. This triggers "Invalid hook call" errors during plugin slot rendering. Run "pnpm dedupe" in the profile directory or ensure plugins declare React under peerDependencies.'
    )
  } else if (scan.hasDuplicates) {
    recommendations.push(
      'Warning: Duplicate library versions found. Run "pnpm dedupe" to consolidate singleton packages.'
    )
  }

  return {
    ...scan,
    profileDir: profileDir || null,
    recommendations,
  }
}

export function formatDependencyAuditMarkdown(auditResult = {}) {
  const { hasDuplicates, hookConflictRisk, duplicates = [], recommendations = [] } = auditResult

  const lines = [
    '### Dependency & Hook Conflict Audit',
    '',
  ]

  if (!hasDuplicates) {
    lines.push('No conflicting duplicate singleton libraries detected in the active profile.')
  } else {
    lines.push('Detected conflicting duplicate packages installed across plugins or profile dependencies:')
    lines.push('')
    lines.push('| Package | Installed Versions | Singleton / Risk |')
    lines.push('| :--- | :--- | :--- |')
    for (const d of duplicates) {
      const risk = d.name === 'react' || d.name === 'react-dom'
        ? '**High Risk** (Invalid Hook Call)'
        : d.isSingleton
          ? 'Medium Risk (Singleton drift)'
          : 'Low'
      lines.push(`| \`${d.name}\` | \`${d.versions.join('`, `')}\` | ${risk} |`)
    }
    lines.push('')
  }

  if (hookConflictRisk) {
    lines.push('> [!CAUTION]')
    lines.push('> Duplicate React instances break React Hook state and context injection across microfrontends. Microfrontend components from affected plugins will fail when invoking useState, useEffect, or useContext.')
    lines.push('')
  }

  if (recommendations.length > 0) {
    lines.push('#### Recommendations:')
    for (const rec of recommendations) {
      lines.push(`- ${rec}`)
    }
    lines.push('')
  }

  return safeRedact(lines.join('\n'))
}
