export function detectForgeType(repoUrl = '') {
  const url = String(repoUrl).toLowerCase()
  if (!url) return { forgeType: 'unknown', isSupported: false }

  if (url.includes('github.com')) {
    return { forgeType: 'github', isSupported: true, apiType: 'rest_v3' }
  }
  if (url.includes('gitlab.com') || url.includes('gitlab.')) {
    return { forgeType: 'gitlab', isSupported: true, apiType: 'rest_v4' }
  }
  if (url.includes('codeberg.org')) {
    return { forgeType: 'forgejo', isSupported: true, apiType: 'gitea_v1' }
  }
  if (url.includes('forgejo') || url.includes('gitea')) {
    return { forgeType: 'gitea', isSupported: true, apiType: 'gitea_v1' }
  }

  return { forgeType: 'generic_git', isSupported: true, apiType: 'unspecified' }
}

export function parseMultiForgeRepository(repoUrl = '') {
  const detection = detectForgeType(repoUrl)
  const cleanUrl = String(repoUrl).replace(/\.git$/, '').trim()
  const match = cleanUrl.match(/^(?:https?:\/\/[^\/]+\/|git@[^:]+:)?([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/)

  if (!match) {
    return {
      isValid: false,
      forgeType: detection.forgeType,
      owner: '',
      repo: '',
      fullSlug: '',
    }
  }

  return {
    isValid: true,
    forgeType: detection.forgeType,
    apiType: detection.apiType,
    owner: match[1],
    repo: match[2],
    fullSlug: `${match[1]}/${match[2]}`,
    rawUrl: cleanUrl,
  }
}

export function formatTrackerReportMarkdown({
  forgeType = 'github',
  fullSlug = '',
  apiType = 'rest_v3',
} = {}) {
  const label = forgeType === 'forgejo' ? 'Forgejo / Codeberg' : forgeType === 'gitlab' ? 'GitLab' : forgeType === 'gitea' ? 'Gitea' : 'GitHub'
  return [
    '### Multi-Forge Tracker Target',
    `- **Platform:** ${label}`,
    `- **API Adapter:** \`${apiType}\``,
    `- **Target Repository:** \`${fullSlug || 'unspecified'}\``,
  ].join('\n')
}
