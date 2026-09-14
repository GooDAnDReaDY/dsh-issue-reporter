import assert from 'node:assert/strict'
import test from 'node:test'
import { clearGitHubCredential } from '../lib/auth.js'

test('clears the configured GitHub credential for logout', async () => {
  let calls = 0
  let received
  await clearGitHubCredential({
    unset: async (ref) => {
      calls += 1
      received = ref
    },
  }, 'credential-ref')
  assert.equal(calls, 1)
  assert.equal(received, 'credential-ref')
})

test('rejects logout when the credentials service cannot unset values', async () => {
  await assert.rejects(
    () => clearGitHubCredential({}, 'credential-ref'),
    /credentials service cannot remove GitHub authorization/,
  )
})
