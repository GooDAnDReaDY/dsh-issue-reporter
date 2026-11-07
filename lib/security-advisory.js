export function detectSecurityRisk({
  title = '',
  body = '',
  error = '',
  stack = '',
} = {}) {
  const content = `${title} ${body} ${error} ${stack}`
  const risks = []

  if (/\b(?:child_process|execSync|eval\(|Function\()\b/i.test(content) || /(?:;\s*rm\s+-rf|\|\s*(?:bash|sh)\b)/i.test(content)) {
    risks.push({ type: 'RCE / Command Injection', severity: 'critical' })
  }

  if (/(?:\.\.\/|\.\.\\|%2e%2e)/i.test(content)) {
    risks.push({ type: 'Path Traversal (CWE-22)', severity: 'high' })
  }

  if (/(?:169\.254\.169\.254|metadata\.google\.internal)/i.test(content)) {
    risks.push({ type: 'SSRF Cloud Metadata Exfiltration', severity: 'critical' })
  }

  if (/\b(?:ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{40,}|sk-[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16})\b/.test(content)) {
    risks.push({ type: 'Exposed Cloud / API Credentials', severity: 'high' })
  }

  const isVulnerability = risks.length > 0
  const maxSeverity = risks.some((r) => r.severity === 'critical') ? 'critical' : (isVulnerability ? 'high' : 'none')

  return {
    isVulnerability,
    severity: maxSeverity,
    risks,
    advisoryModeRecommended: isVulnerability,
    recommendation: isVulnerability
      ? 'Do NOT post this report publicly. Route through GitHub Security Advisory (GHSA) or private security contact.'
      : 'Safe for standard public issue tracker submission.',
  }
}

export function resolveSecurityContact({
  pluginName = '',
  packageJson = {},
} = {}) {
  if (typeof packageJson?.security === 'string') {
    return { contact: packageJson.security, channel: 'email' }
  }
  if (typeof packageJson?.bugs?.email === 'string') {
    return { contact: packageJson.bugs.email, channel: 'email' }
  }
  if (typeof packageJson?.author?.email === 'string') {
    return { contact: packageJson.author.email, channel: 'author_email' }
  }

  return {
    contact: `https://github.com/GooDAnDReaDY/${String(pluginName).replace(/^@goodandready\//, '')}/security/advisories/new`,
    channel: 'ghsa',
  }
}

export function formatSecurityAdvisoryMarkdown({
  pluginName = '',
  securityCheck = {},
  contact = {},
} = {}) {
  const risks = securityCheck.risks || []
  const riskList = risks.map((r) => `- [!] **${r.type}** (Severity: \`${r.severity}\`)`).join('\n')

  return [
    '### Private Security Advisory (Confidential Disclosure)',
    `- **Target Plugin:** \`${pluginName || 'unknown'}\``,
    `- **Overall Severity:** \`${securityCheck.severity || 'high'}\``,
    `- **Recommended Contact Channel:** \`${contact.contact || 'Private Security Advisory'}\` (${contact.channel || 'direct'})`,
    '',
    '**Detected Risk Vectors:**',
    riskList || '- Security anomaly detected requiring confidential triage.',
    '',
    '**Notice:** Public tracking of this issue is restricted to prevent exploitation before a patch is published.',
  ].join('\n')
}
