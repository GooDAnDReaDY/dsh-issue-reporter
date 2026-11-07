export function matchTargetColumn({
  availableColumns = [],
  preferredColumns = ['Needs Triage', 'Inbox', 'To Do', 'Backlog'],
} = {}) {
  const cols = Array.isArray(availableColumns) ? availableColumns : []
  if (cols.length === 0) return null

  for (const pref of preferredColumns) {
    const prefNorm = pref.toLowerCase().trim()
    const found = cols.find((c) => {
      const name = typeof c === 'string' ? c : c?.title || c?.name || ''
      return name.toLowerCase().trim() === prefNorm || name.toLowerCase().includes(prefNorm)
    })
    if (found) return found
  }

  // Fallback to first column if no preferred match
  return cols[0] || null
}

export function buildGiteaProjectIssuePayload({ columnId, issueNumber } = {}) {
  if (!columnId || !issueNumber) {
    throw new Error('columnId and issueNumber are required for Gitea project placement')
  }
  return {
    columnId: Number(columnId),
    issues: [Number(issueNumber)],
  }
}

export function buildGitHubProjectItemPayload({ projectId, contentId, contentType = 'Issue' } = {}) {
  if (!projectId || !contentId) {
    throw new Error('projectId and contentId are required for GitHub project placement')
  }
  return {
    query: `mutation AddProjectItem($projectId: ID!, $contentId: ID!) {
      addProjectV2ItemById(input: {projectId: $projectId, contentId: $contentId}) {
        item {
          id
        }
      }
    }`,
    variables: {
      projectId: String(projectId),
      contentId: String(contentId),
      contentType,
    },
  }
}

export function formatBoardPlacementMarkdown({
  boardTitle = 'Kanban Board',
  columnName = 'Inbox',
  issueNumber,
  projectUrl,
} = {}) {
  const lines = [
    '### 📋 Project Board Placement',
    `- **Board**: ${projectUrl ? `[${boardTitle}](${projectUrl})` : `\`${boardTitle}\``}`,
    `- **Target Column**: \`${columnName}\``,
  ]
  if (issueNumber) {
    lines.push(`- **Issue**: #${issueNumber}`)
  }
  return lines.join('\n')
}

export function resolveProjectPlacement({
  boards = [],
  preferredColumns = ['Needs Triage', 'Inbox', 'To Do', 'Backlog'],
} = {}) {
  const availableBoards = Array.isArray(boards) ? boards : []
  if (availableBoards.length === 0) {
    return { attached: false, reason: 'no_boards_available' }
  }

  const primaryBoard = availableBoards[0]
  const columns = primaryBoard.columns || []
  const matchedCol = matchTargetColumn({
    availableColumns: columns,
    preferredColumns,
  })

  if (!matchedCol) {
    return {
      attached: false,
      boardId: primaryBoard.id,
      boardTitle: primaryBoard.title || primaryBoard.name,
      reason: 'no_matching_columns',
    }
  }

  const colId = typeof matchedCol === 'object' ? (matchedCol.id || matchedCol.title) : matchedCol
  const colName = typeof matchedCol === 'object' ? (matchedCol.title || matchedCol.name) : matchedCol

  return {
    attached: true,
    boardId: primaryBoard.id,
    boardTitle: primaryBoard.title || primaryBoard.name || 'Project Board',
    projectUrl: primaryBoard.html_url || primaryBoard.url,
    columnId: colId,
    columnName: colName,
  }
}
