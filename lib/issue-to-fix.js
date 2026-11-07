import path from 'node:path'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'

export function sanitizeBranchName(name = '') {
  return String(name)
    .replace(/^@/, '')
    .replace(/[\/\\]/g, '-')
    .replace(/[^a-zA-Z0-9_.-]/g, '')
    .slice(0, 50)
}

export function prepareFixWorktree({
  pluginName = '',
  issueNumber = 0,
  repoPath = '',
  baseDir = '',
  errorContext = '',
} = {}) {
  const safePlugin = sanitizeBranchName(pluginName)
  const branchName = `fix/issue-${issueNumber || 'temp'}-${safePlugin}`
  const targetDir = baseDir
    ? path.join(baseDir, `.worktrees/${branchName}`)
    : (repoPath ? path.join(repoPath, `.worktrees/${branchName}`) : '')

  const taskPayload = {
    issueNumber,
    pluginName,
    branchName,
    worktreePath: targetDir,
    createdAt: Date.now(),
    goal: `Investigate and fix issue #${issueNumber} in ${pluginName}`,
    errorContext: String(errorContext || '').slice(0, 1000),
    instructions: [
      '1. Review the reproducer and error context.',
      '2. Implement a failing regression test (Red Test).',
      '3. Fix the underlying root cause in source files.',
      '4. Verify all tests pass (Green Test) and preflight passes.',
      '5. Submit PR referencing the original issue.',
    ],
  }

  let prepared = false
  if (targetDir && existsSync(repoPath)) {
    try {
      mkdirSync(path.dirname(targetDir), { recursive: true })
      const metaPath = path.join(path.dirname(targetDir), `task-${issueNumber || 'temp'}.json`)
      writeFileSync(metaPath, JSON.stringify(taskPayload, null, 2), 'utf-8')
      prepared = true
    } catch (err) {
      void err
    }
  }

  return {
    prepared,
    branchName,
    worktreePath: targetDir,
    taskPayload,
  }
}

export function formatIssueToFixMarkdown({
  branchName = '',
  worktreePath = '',
  issueNumber = 0,
  pluginName = '',
} = {}) {
  return [
    '### Agent Fix Delegation (Issue-to-Fix)',
    `- **Target Plugin:** \`${pluginName || 'unknown'}\``,
    `- **Target Issue:** #${issueNumber}`,
    `- **Dedicated Branch:** \`${branchName}\``,
    `- **Isolated Worktree:** \`${worktreePath || 'in-memory workspace'}\``,
    '',
    '**Agent Execution Checklist:**',
    '1. Checkout isolated task worktree.',
    '2. Execute canary test to reproduce the failure.',
    '3. Apply atomic code changes and run verification gates.',
    '4. Create pull request with link to this issue.',
  ].join('\n')
}
