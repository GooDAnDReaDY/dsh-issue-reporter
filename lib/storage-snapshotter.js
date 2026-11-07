import { existsSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

export function sanitizeStorageName(pluginName = '') {
  return String(pluginName).replace(/^@/, '').replace(/[\/\\]/g, '-').replace(/[^a-zA-Z0-9_.-]/g, '')
}

export function inspectPluginStorage({ pluginName = '', baseDir = '' } = {}) {
  const safeName = sanitizeStorageName(pluginName)
  if (!safeName) return { exists: false, pluginName: '', totalBytes: 0, files: [] }

  const root = baseDir || (typeof process !== 'undefined' && process.env.HOME ? path.join(process.env.HOME, '.dsh/data') : '')
  if (!root || !existsSync(root)) {
    return { exists: false, pluginName, targetDir: root, totalBytes: 0, files: [] }
  }

  const targetDir = path.join(root, safeName)
  if (!existsSync(targetDir)) {
    return { exists: false, pluginName, targetDir, totalBytes: 0, files: [] }
  }

  try {
    const fileNames = readdirSync(targetDir)
    let totalBytes = 0
    const files = []

    for (const name of fileNames) {
      const fullPath = path.join(targetDir, name)
      try {
        const stat = statSync(fullPath)
        if (stat.isFile()) {
          totalBytes += stat.size
          const ext = path.extname(name).toLowerCase()
          const isDb = ['.db', '.sqlite', '.sqlite3', '.leveldb', '.json'].includes(ext)
          files.push({
            name,
            sizeBytes: stat.size,
            sizeKb: Math.round((stat.size / 1024) * 10) / 10,
            isDatabase: isDb,
            extension: ext,
            modifiedAt: stat.mtimeMs,
          })
        }
      } catch {
        // ignore unreadable file
      }
    }

    return {
      exists: true,
      pluginName,
      targetDir,
      totalBytes,
      totalMb: Math.round((totalBytes / 1024 / 1024) * 100) / 100,
      fileCount: files.length,
      files,
    }
  } catch (error) {
    return {
      exists: false,
      pluginName,
      targetDir,
      error: error?.message || 'Access error',
      totalBytes: 0,
      files: [],
    }
  }
}

export function formatStorageSnapshotMarkdown(snapshot = {}) {
  if (!snapshot.exists) {
    return `### Local Storage Status\n- **Target Plugin:** \`${snapshot.pluginName || 'unknown'}\`\n- **Status:** No local persistent data directory found (clean in-memory state).`
  }

  const lines = [
    '### Local Storage & DB Snapshot',
    `- **Target Plugin:** \`${snapshot.pluginName}\``,
    `- **Storage Directory:** \`${snapshot.targetDir}\``,
    `- **Total Footprint:** ${snapshot.totalMb} MB across ${snapshot.fileCount} file(s)`,
  ]

  if (snapshot.files && snapshot.files.length > 0) {
    lines.push('', '| File Name | Size (KB) | Type |', '| :--- | :--- | :--- |')
    snapshot.files.forEach((f) => {
      lines.push(`| \`${f.name}\` | ${f.sizeKb} KB | ${f.isDatabase ? 'Database / Schema' : 'Data File'} |`)
    })
  }

  return lines.join('\n')
}
