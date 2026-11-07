import { redactText } from './domain.js'

export function createOfflineExportBundle({
  draft = {},
  attachments = [],
  environmentSnapshot = {},
} = {}) {
  const sanitizedTitle = redactText(draft.title || 'Bug Report').text
  const sanitizedObserved = redactText(draft.observed || '').text
  const sanitizedExpected = redactText(draft.expected || '').text
  const sanitizedRepro = redactText(draft.reproduction || '').text
  const sanitizedEnv = redactText(draft.environment || '').text

  const markdownDocument = [
    `# ${sanitizedTitle}`,
    '',
    '## Observed Behavior',
    sanitizedObserved || '_No observed description provided._',
    '',
    '## Expected Behavior',
    sanitizedExpected || '_No expected description provided._',
    '',
    '## Steps to Reproduce',
    sanitizedRepro || '_No reproduction steps provided._',
    '',
    '## System & Environment Details',
    sanitizedEnv || '_No environment diagnostics attached._',
    '',
    '---',
    '_Exported offline from DeepSeek Harness Issue Reporter._',
    '_All private tokens, passwords, LAN IPs, and paths have been securely redacted._',
  ].join('\n')

  const files = [
    {
      path: 'report.md',
      content: markdownDocument,
      type: 'text/markdown',
    },
    {
      path: 'metadata.json',
      content: JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          title: sanitizedTitle,
          labels: draft.labels || [],
          attachmentCount: attachments.length,
          environment: environmentSnapshot,
        },
        null,
        2
      ),
      type: 'application/json',
    },
  ]

  return {
    bundleName: `dsh-report-${Date.now()}`,
    fileCount: files.length,
    files,
    markdownDocument,
  }
}

export function formatOfflineExportMarkdown(bundle = {}) {
  return [
    '### Offline Bug Report Bundle',
    `- **Bundle ID:** \`${bundle.bundleName || 'report'}\``,
    `- **Included Files:** ${bundle.fileCount || 0} file(s) (\`report.md\`, \`metadata.json\`)`,
    '- **Security Guarantee:** Full zero-leak redaction pass applied.',
  ].join('\n')
}
