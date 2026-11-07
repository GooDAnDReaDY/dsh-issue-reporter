import { redactText } from './domain.js'

function safeRedact(text) {
  if (typeof text !== 'string') return ''
  return typeof redactText === 'function' ? redactText(text).text : text
}

export const ROOT_CAUSE_PATTERNS = [
  {
    regex: /settings\.register|scope\.watch/i,
    category: 'deprecated_api',
    confidence: 'high',
    hypothesis: 'Calling deprecated or removed DSH settings API (settings.register / scope.watch). DSH 0.2 manages settings through cordis settings service schema declarations without imperative register.',
    suggestedFix: 'Remove ctx.settings.register and scope.watch calls; export Config schema instead.',
  },
  {
    regex: /Invalid hook call|useState.*only be called|useContext.*only be called/i,
    category: 'react_hook_conflict',
    confidence: 'high',
    hypothesis: 'React microfrontend conflict: Multiple copies of React/ReactDOM detected in plugin bundle or dependency tree, breaking React Hooks singleton guarantee.',
    suggestedFix: 'Mark react and react-dom as peerDependencies and run "pnpm dedupe" in the profile.',
  },
  {
    regex: /ENOENT|no such file or directory/i,
    category: 'missing_file',
    confidence: 'high',
    hypothesis: 'Missing path or configuration file: The plugin attempted to read or open a file that does not exist on disk.',
    suggestedFix: 'Ensure path exists or add default fallback with fs.existsSync before reading.',
  },
  {
    regex: /EACCES|EPERM|permission denied/i,
    category: 'permission_denied',
    confidence: 'high',
    hypothesis: 'Filesystem permission error: Process lacks necessary read/write permissions for the target path.',
    suggestedFix: 'Check filesystem permissions and user ownership of configuration or data directory.',
  },
  {
    regex: /ECONNREFUSED|ETIMEDOUT|ENOTFOUND/i,
    category: 'network_unreachable',
    confidence: 'high',
    hypothesis: 'Network connection failure: Remote API or local loopback service is down or unreachable.',
    suggestedFix: 'Verify service host, port, loopback bindings, and network connectivity.',
  },
  {
    regex: /Unexpected token.*JSON|SyntaxError.*JSON\.parse/i,
    category: 'corrupt_data',
    confidence: 'medium',
    hypothesis: 'Malformed payload or corrupted configuration: JSON parse failed on incoming response or file.',
    suggestedFix: 'Wrap JSON.parse in try/catch and validate payload format before parsing.',
  },
  {
    regex: /ctx\.log|locale\.current|locale\.get\(/i,
    category: 'deprecated_context',
    confidence: 'high',
    hypothesis: 'Deprecated Cordis context property: Plugin attempted to invoke a non-existent member on ctx or locale.',
    suggestedFix: 'Use ctx.logger or standard console methods; use LocaleFace reactive methods.',
  },
]

export function classifyRootCause({ errorStack = '', observed = '', logs = '' }) {
  const haystack = `${errorStack}\n${observed}\n${logs}`

  for (const rule of ROOT_CAUSE_PATTERNS) {
    if (rule.regex.test(haystack)) {
      return {
        category: rule.category,
        confidence: rule.confidence,
        hypothesis: rule.hypothesis,
        suggestedFix: rule.suggestedFix,
      }
    }
  }

  return {
    category: 'runtime_exception',
    confidence: 'low',
    hypothesis: 'Generic runtime exception: Unhandled error thrown during plugin execution.',
    suggestedFix: 'Review error stack trace and reproduce with minimal input parameters.',
  }
}

export function formatRootCauseMarkdown(attribution = {}) {
  const lines = [
    '### Root-Cause Attribution',
    `- **Category**: \`${attribution.category || 'unknown'}\``,
    `- **Confidence**: \`${attribution.confidence || 'low'}\``,
    `- **Hypothesis**: ${attribution.hypothesis || 'None identified'}`,
  ]

  if (attribution.suggestedFix) {
    lines.push(`- **Suggested Fix Direction**: ${attribution.suggestedFix}`)
  }

  return safeRedact(lines.join('\n'))
}
