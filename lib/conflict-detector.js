import { redactText } from './domain.js'

function safeRedact(text) {
  if (typeof text !== 'string') return ''
  return typeof redactText === 'function' ? redactText(text).text : text
}

export function detectRouteConflicts(routes = []) {
  const conflicts = []
  if (!Array.isArray(routes)) return conflicts

  const map = new Map()
  for (const r of routes) {
    if (!r || typeof r.path !== 'string') continue
    const normPath = r.path.trim().toLowerCase()
    const normMethod = (r.method || 'ALL').toUpperCase()
    const plugin = r.plugin || 'unknown'
    const key = `${normMethod}:${normPath}`

    if (!map.has(key)) {
      map.set(key, { path: r.path, method: r.method || 'ALL', plugins: new Set([plugin]) })
    } else {
      const entry = map.get(key)
      entry.plugins.add(plugin)
    }
  }

  for (const entry of map.values()) {
    if (entry.plugins.size > 1) {
      const pluginList = Array.from(entry.plugins)
      conflicts.push({
        type: 'route',
        path: entry.path,
        method: entry.method,
        plugins: pluginList,
        details: `Route collision on ${entry.method} ${entry.path} between plugins: ${pluginList.join(', ')}`,
      })
    }
  }

  return conflicts
}

export function detectServiceConflicts(services = []) {
  const conflicts = []
  if (!Array.isArray(services)) return conflicts

  const map = new Map()
  for (const s of services) {
    if (!s || typeof s.name !== 'string') continue
    const name = s.name.trim()
    const provider = s.provider || s.plugin || 'unknown'

    if (!map.has(name)) {
      map.set(name, { name, providers: new Set([provider]) })
    } else {
      map.get(name).providers.add(provider)
    }
  }

  for (const entry of map.values()) {
    if (entry.providers.size > 1) {
      const providerList = Array.from(entry.providers)
      conflicts.push({
        type: 'service',
        service: entry.name,
        plugins: providerList,
        details: `Duplicate Cordis service provider for "${entry.name}" registered by: ${providerList.join(', ')}`,
      })
    }
  }

  return conflicts
}

export function detectSlotConflicts(slots = []) {
  const conflicts = []
  if (!Array.isArray(slots)) return conflicts

  const map = new Map()
  for (const s of slots) {
    if (!s || typeof s.slot !== 'string') continue
    const slotId = s.slot.trim()
    const plugin = s.plugin || 'unknown'

    if (!map.has(slotId)) {
      map.set(slotId, { slot: slotId, plugins: new Set([plugin]) })
    } else {
      map.get(slotId).plugins.add(plugin)
    }
  }

  for (const entry of map.values()) {
    if (entry.plugins.size > 1) {
      const pluginList = Array.from(entry.plugins)
      conflicts.push({
        type: 'slot',
        slot: entry.slot,
        plugins: pluginList,
        details: `UI Slot collision on "${entry.slot}" claimed by: ${pluginList.join(', ')}`,
      })
    }
  }

  return conflicts
}

export function detectAllConflicts(ctx = {}) {
  const routeList = []
  const serviceList = []
  const slotList = []

  // Extract from webServer if accessible
  try {
    const ws = ctx.webServer
    if (ws && Array.isArray(ws.routes)) {
      for (const r of ws.routes) {
        routeList.push({ path: r.path, method: r.method, plugin: r.plugin || r.owner })
      }
    }
  } catch (err) {
    // defensive fallback
  }

  // Extract from Cordis registry if accessible
  try {
    const reg = ctx.registry || (ctx.app && ctx.app.registry)
    if (reg && typeof reg.entries === 'function') {
      for (const [, plugin] of reg.entries()) {
        const name = plugin?.name || plugin?.id
        if (plugin?.services && Array.isArray(plugin.services)) {
          for (const s of plugin.services) {
            serviceList.push({ name: s, provider: name })
          }
        }
      }
    }
  } catch (err) {
    // defensive fallback
  }

  const conflicts = [
    ...detectRouteConflicts(routeList),
    ...detectServiceConflicts(serviceList),
    ...detectSlotConflicts(slotList),
  ]

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
  }
}

export function formatConflictMarkdown(conflicts = [], repoFinder = null) {
  if (!Array.isArray(conflicts) || conflicts.length === 0) {
    return '### Cross-Plugin Conflict Report\n\nNo route, service, or slot collisions detected between installed plugins.'
  }

  const lines = [
    '### Cross-Plugin Conflict Report',
    '',
    'The following conflicts were detected between installed plugins in the active DSH environment:',
    '',
  ]

  for (const c of conflicts) {
    const pluginsFormatted = c.plugins.map((p) => {
      const repoUrl = typeof repoFinder === 'function' ? repoFinder(p) : null
      return repoUrl ? `[${p}](${repoUrl})` : `\`${p}\``
    }).join(' and ')

    lines.push(`- **Collision Type**: \`${c.type}\``)
    if (c.path) lines.push(`  - **Endpoint**: \`${c.method || 'ALL'} ${c.path}\``)
    if (c.service) lines.push(`  - **Service**: \`${c.service}\``)
    if (c.slot) lines.push(`  - **Slot**: \`${c.slot}\``)
    lines.push(`  - **Conflicting Plugins**: ${pluginsFormatted}`)
    lines.push(`  - **Details**: ${c.details}`)
    lines.push('')
  }

  lines.push('> [!WARNING]')
  lines.push('> Route or service collisions can cause intermittent 404/500 errors, broken API requests, or silent plugin feature override. Authors of both plugins should coordinate endpoint paths or service identifiers.')

  return safeRedact(lines.join('\n'))
}
