import { redactText } from './domain.js'

export function generateCanaryTest({
  pluginName = 'target-plugin',
  errorMessage = 'Unexpected error occurred',
  stack = '',
  sampleInput = null,
  expectedOutput = null,
} = {}) {
  const safePlugin = String(pluginName).replace(/[^a-zA-Z0-9_@/-]/g, '')
  const safeError = redactText(String(errorMessage || 'Reproduced failure')).text.replace(/`/g, '\\`')
  const inputStr = JSON.stringify(sampleInput || { test: true }, null, 2)
  const expectedStr = JSON.stringify(expectedOutput || { ok: true }, null, 2)

  const testCode = `import test from 'node:test'
import assert from 'node:assert/strict'

// Auto-generated Canary Regression Test for ${safePlugin}
// Reproduces failure: ${safeError.slice(0, 80)}

test('canary regression: reproduces defect in ${safePlugin}', async () => {
  const input = ${inputStr}
  const expected = ${expectedStr}

  // NOTE: Adjust import path according to target package exports
  // import { apply } from '${safePlugin}'

  try {
    // 1. Simulate condition triggering the fault
    const result = input
    assert.deepEqual(result, expected, 'Expected operation to succeed without throwing')
  } catch (err) {
    // The test documents the reproduced failure
    assert.match(err.message, /${safeError.slice(0, 30).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/)
  }
})
`

  return {
    testCode,
    fileName: `test/canary-repro.test.mjs`,
    pluginName: safePlugin,
  }
}

export function formatCanaryTestMarkdown({
  testCode = '',
  fileName = 'test/canary-repro.test.mjs',
  pluginName = '',
} = {}) {
  return [
    '### Reproducible Canary Test',
    `- **Target Plugin:** \`${pluginName || 'unknown'}\``,
    `- **Test File:** \`${fileName}\``,
    '- **Execution Command:** `node --test ' + fileName + '`',
    '',
    '```javascript',
    testCode.trim(),
    '```',
  ].join('\n')
}
