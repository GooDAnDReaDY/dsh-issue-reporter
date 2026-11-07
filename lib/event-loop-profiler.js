import { monitorEventLoopDelay } from 'node:perf_hooks'

let histogram = null
let monitoringStarted = false

export function startEventLoopMonitoring(resolution = 20) {
  if (monitoringStarted && histogram) return histogram
  try {
    if (typeof monitorEventLoopDelay === 'function') {
      histogram = monitorEventLoopDelay({ resolution })
      histogram.enable()
      monitoringStarted = true
    }
  } catch {
    histogram = null
  }
  return histogram
}

export function stopEventLoopMonitoring() {
  if (histogram && typeof histogram.disable === 'function') {
    try { histogram.disable() } catch (err) { void err }
  }
  monitoringStarted = false
}

export function getMemorySnapshot() {
  if (typeof process === 'undefined' || typeof process.memoryUsage !== 'function') {
    return { heapUsedMb: 0, heapTotalMb: 0, rssMb: 0, externalMb: 0 }
  }
  const mem = process.memoryUsage()
  const toMb = (bytes) => (Number.isFinite(bytes) ? Math.round((bytes / 1024 / 1024) * 10) / 10 : 0)
  return {
    heapUsedMb: toMb(mem.heapUsed),
    heapTotalMb: toMb(mem.heapTotal),
    rssMb: toMb(mem.rss),
    externalMb: toMb(mem.external),
  }
}

export function collectPerformanceProfile() {
  startEventLoopMonitoring()
  const mem = getMemorySnapshot()

  let p50Ms = 0
  let p90Ms = 0
  let p99Ms = 0
  let maxMs = 0
  let meanMs = 0

  if (histogram) {
    const toMs = (ns) => (Number.isFinite(ns) ? Math.round((ns / 1e6) * 100) / 100 : 0)
    p50Ms = toMs(histogram.percentile(50))
    p90Ms = toMs(histogram.percentile(90))
    p99Ms = toMs(histogram.percentile(99))
    maxMs = toMs(histogram.max)
    meanMs = toMs(histogram.mean)
  }

  let status = 'normal'
  if (p99Ms > 100 || maxMs > 500) {
    status = 'stalled'
  } else if (p99Ms > 35 || maxMs > 100) {
    status = 'lagging'
  }

  return {
    status,
    eventLoopLag: {
      p50Ms,
      p90Ms,
      p99Ms,
      maxMs,
      meanMs,
    },
    memory: mem,
    timestamp: Date.now(),
  }
}

export function formatPerfProfileMarkdown(profile = {}) {
  const p = profile.eventLoopLag || {}
  const m = profile.memory || {}
  const statusLabel = profile.status === 'stalled' ? 'Status: Stalled (>100ms lag)' : profile.status === 'lagging' ? 'Status: Lagging (>35ms lag)' : 'Status: Normal'

  return [
    '### Event Loop & Memory Performance Profile',
    `- **Status:** ${statusLabel}`,
    `- **Event Loop Lag:** P50: ${p.p50Ms || 0}ms | P90: ${p.p90Ms || 0}ms | P99: ${p.p99Ms || 0}ms | Max: ${p.maxMs || 0}ms`,
    `- **Memory Heap:** ${m.heapUsedMb || 0} MB used / ${m.heapTotalMb || 0} MB total (RSS: ${m.rssMb || 0} MB)`,
  ].join('\n')
}
