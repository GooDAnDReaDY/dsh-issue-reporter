import { accessSync, constants, existsSync } from 'node:fs'
import net from 'node:net'
import os from 'node:os'

export async function checkPortAvailability(port, host = '127.0.0.1', timeoutMs = 400) {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    let status = 'available'

    socket.setTimeout(timeoutMs)
    socket.once('connect', () => {
      status = 'in_use'
      socket.destroy()
      resolve({ port, status })
    })

    socket.once('timeout', () => {
      socket.destroy()
      resolve({ port, status: 'available' })
    })

    socket.once('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        resolve({ port, status: 'available' })
      } else {
        resolve({ port, status: 'in_use', error: err.code })
      }
    })

    socket.connect(port, host)
  })
}

export function verifyPathWritable(targetPath) {
  if (!targetPath) return { path: '', writable: false, reason: 'Empty path' }
  try {
    if (!existsSync(targetPath)) {
      return { path: targetPath, writable: false, reason: 'Path does not exist' }
    }
    accessSync(targetPath, constants.W_OK)
    return { path: targetPath, writable: true }
  } catch (err) {
    return { path: targetPath, writable: false, reason: err.code || 'Permission denied (EACCES)' }
  }
}

export function detectContainerContext() {
  const isDocker = existsSync('/.dockerenv')
  const isLxc = existsSync('/proc/1/environ')
  let containerType = 'bare_metal'
  if (isDocker) containerType = 'docker'
  else if (isLxc) containerType = 'container'

  const uid = typeof process !== 'undefined' && typeof process.getuid === 'function' ? process.getuid() : -1
  const isRoot = uid === 0

  return {
    containerType,
    isRoot,
    uid,
    platform: os.platform(),
    arch: os.arch(),
    totalMemMb: Math.round(os.totalmem() / 1024 / 1024),
    freeMemMb: Math.round(os.freemem() / 1024 / 1024),
  }
}

export async function verifyHostEnvironment({ checkPaths = ['/tmp', process.cwd()], checkPorts = [] } = {}) {
  const paths = checkPaths.map(verifyPathWritable)
  const ports = await Promise.all(checkPorts.map((p) => checkPortAvailability(p)))
  const container = detectContainerContext()

  const permissionFailures = paths.filter((p) => !p.writable)
  const portCollisions = ports.filter((p) => p.status === 'in_use')

  const hasIssues = permissionFailures.length > 0 || portCollisions.length > 0
  let verdict = 'healthy'
  if (permissionFailures.length > 0) verdict = 'permission_issues'
  else if (portCollisions.length > 0) verdict = 'port_collisions'

  return {
    verdict,
    hasIssues,
    container,
    paths,
    ports,
    permissionFailures,
    portCollisions,
    checkedAt: Date.now(),
  }
}

export function formatEnvVerificationMarkdown(verification = {}) {
  const c = verification.container || {}
  const statusBadge = verification.verdict === 'healthy' ? 'Status: Environment Healthy' : verification.verdict === 'permission_issues' ? 'Status: OS Permission Restriction (EACCES)' : 'Status: Port Collision Detected (EADDRINUSE)'

  const lines = [
    '### Host OS Permissions & Environment Verification',
    `- **Status:** ${statusBadge}`,
    `- **Runtime Privilege:** ${c.isRoot ? 'Root (UID 0)' : `Non-root (UID ${c.uid})`} | **Container Context:** \`${c.containerType || 'unknown'}\``,
    `- **System Memory:** ${c.freeMemMb || 0} MB free / ${c.totalMemMb || 0} MB total`,
  ]

  if (verification.permissionFailures && verification.permissionFailures.length > 0) {
    lines.push('', '**File Permission Warnings:**')
    verification.permissionFailures.forEach((f) => {
      lines.push(`- [!] \`${f.path}\`: ${f.reason}`)
    })
  }

  if (verification.portCollisions && verification.portCollisions.length > 0) {
    lines.push('', '**Port Collisions:**')
    verification.portCollisions.forEach((p) => {
      lines.push(`- [!] Port ${p.port} is currently bound/in-use.`)
    })
  }

  return lines.join('\n')
}
