import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

export function emergencyDisablePlugin({
  pluginName = '',
  profileDir = '',
  manifestPath = '',
  dryRun = false,
} = {}) {
  if (!pluginName) {
    return { success: false, reason: 'Missing plugin name', wasBundled: false }
  }

  const pPath = manifestPath || (profileDir ? path.join(profileDir, 'package.json') : '')
  if (!pPath || !existsSync(pPath)) {
    return { success: false, reason: 'Profile package.json not found', wasBundled: false }
  }

  try {
    const raw = readFileSync(pPath, 'utf-8')
    const pkg = JSON.parse(raw)
    const bundles = pkg?.dsh?.profile?.bundles

    if (!Array.isArray(bundles)) {
      return { success: false, reason: 'No dsh.profile.bundles found in package.json', wasBundled: false }
    }

    const index = bundles.indexOf(pluginName)
    if (index === -1) {
      return { success: true, pluginName, wasBundled: false, message: 'Plugin was not in active bundles list' }
    }

    const updatedBundles = bundles.filter((b) => b !== pluginName)
    pkg.dsh.profile.bundles = updatedBundles

    if (!dryRun) {
      writeFileSync(pPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8')
    }

    return {
      success: true,
      pluginName,
      wasBundled: true,
      dryRun,
      remainingCount: updatedBundles.length,
      message: `Plugin ${pluginName} successfully removed from active bundles`,
    }
  } catch (err) {
    return {
      success: false,
      reason: err?.message || 'Failed to update manifest',
      wasBundled: false,
    }
  }
}

export function formatSafeModeStatusMarkdown({
  pluginName = '',
  success = false,
  wasBundled = false,
  message = '',
} = {}) {
  const status = success ? 'Plugin Deactivated' : 'Deactivation Failed'
  return [
    '### Safe Mode Panic Deactivation',
    `- **Status:** ${status}`,
    `- **Target Plugin:** \`${pluginName}\``,
    `- **Action Taken:** ${wasBundled ? 'Removed from active profile bundles' : 'Not present in active bundle list'}`,
    `- **Details:** ${message}`,
  ].join('\n')
}
