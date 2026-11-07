import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { redactText } from './domain.js'

export function parsePatchStats(patchText = '') {
  const lines = patchText.split('\n')
  let additions = 0
  let deletions = 0
  const files = new Set()

  for (const line of lines) {
    if (line.startsWith('+++ b/')) {
      files.add(line.slice(6))
    } else if (line.startsWith('+') && !line.startsWith('+++')) {
      additions += 1
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      deletions += 1
    }
  }

  return {
    additions,
    deletions,
    filesChanged: files.size,
    files: Array.from(files),
  }
}

export function generateGitPatch({
  repoPath = '',
  rawDiff = '',
} = {}) {
  let diffContent = rawDiff

  if (!diffContent && repoPath && existsSync(repoPath)) {
    try {
      diffContent = execSync('git diff HEAD', {
        cwd: repoPath,
        encoding: 'utf-8',
        timeout: 5000,
        maxBuffer: 1024 * 512,
      })
    } catch (err) {
      void err
      diffContent = ''
    }
  }

  if (!diffContent || !diffContent.trim()) {
    return {
      hasPatch: false,
      patchText: '',
      stats: { additions: 0, deletions: 0, filesChanged: 0, files: [] },
    }
  }

  const sanitized = redactText(diffContent).text
  const stats = parsePatchStats(sanitized)

  return {
    hasPatch: true,
    patchText: sanitized,
    stats,
  }
}

export function formatGitPatchMarkdown({
  patchText = '',
  pluginName = '',
  stats = {},
} = {}) {
  if (!patchText || !patchText.trim()) {
    return '### Proposed Patch\n- **Status:** Working directory is clean. No uncommitted local modifications.'
  }

  return [
    '### Proposed Local Patch',
    `- **Target Plugin:** \`${pluginName || 'unknown'}\``,
    `- **Changes:** +${stats.additions || 0} / -${stats.deletions || 0} across ${stats.filesChanged || 0} file(s)`,
    '',
    '<details>',
    '<summary>Click to view unified git patch</summary>',
    '',
    '```diff',
    patchText.trim(),
    '```',
    '',
    '**How to apply:**',
    '```bash',
    'git apply << \'EOF\'',
    patchText.trim(),
    'EOF',
    '```',
    '</details>',
  ].join('\n')
}
