import assert from 'node:assert/strict'
import test from 'node:test'
import { stat } from 'node:fs/promises'
import {
  MAX_ATTACHMENT_BYTES,
  MAX_ATTACHMENTS,
  normalizeAttachments,
  validateAttachmentToken,
  buildSafeEnv,
  validateGhPath,
  createIssueWithAttachments,
} from '../lib/attachments.js'

const png = Buffer.from('png').toString('base64')

test('normalizes supported screenshots and sanitizes names', () => {
  const [attachment] = normalizeAttachments([
    { name: '../browser capture.png', mime: 'image/png', data: png },
  ])
  assert.equal(attachment.name, 'browser_capture.png')
  assert.equal(attachment.mime, 'image/png')
  assert.deepEqual(attachment.data, Buffer.from('png'))
})

test('rejects unsupported screenshot types and mismatched MIME', () => {
  assert.throws(
    () => normalizeAttachments([{ name: 'capture.exe', mime: 'application/octet-stream', data: png }]),
    /Only PNG/,
  )
  assert.throws(
    () => normalizeAttachments([{ name: 'capture.png', mime: 'image/jpeg', data: png }]),
    /Only PNG/,
  )
})

test('enforces screenshot count and size limits', () => {
  const tooMany = Array.from({ length: MAX_ATTACHMENTS + 1 }, (_, index) => ({
    name: 'capture-' + index + '.png',
    mime: 'image/png',
    data: png,
  }))
  assert.throws(() => normalizeAttachments(tooMany), /Up to/)

  const oversized = Buffer.alloc(MAX_ATTACHMENT_BYTES + 1).toString('base64')
  assert.throws(
    () => normalizeAttachments([{ name: 'large.png', mime: 'image/png', data: oversized }]),
    /8 MB/,
  )
})

test('rejects GitHub App tokens for screenshot uploads', () => {
  assert.throws(
    () => validateAttachmentToken('ghu_user-access-token'),
    /GitHub App tokens are not supported/,
  )
  assert.doesNotThrow(() => validateAttachmentToken('gho_oauth-token'))
  assert.doesNotThrow(() => validateAttachmentToken('github_pat_fine-grained-token'))
})



test('#81 — buildSafeEnv isolates process.env from host secrets', () => {
  const originalDeepseek = process.env.DEEPSEEK_API_KEY
  const originalGitea = process.env.GITEA_TOKEN
  try {
    process.env.DEEPSEEK_API_KEY = 'secret-deepseek-key'
    process.env.GITEA_TOKEN = 'secret-gitea-token'
    const safe = buildSafeEnv('gho_test_token')
    assert.equal(safe.GH_TOKEN, 'gho_test_token')
    assert.equal(safe.DEEPSEEK_API_KEY, undefined)
    assert.equal(safe.GITEA_TOKEN, undefined)
  } finally {
    if (originalDeepseek !== undefined) process.env.DEEPSEEK_API_KEY = originalDeepseek
    else delete process.env.DEEPSEEK_API_KEY
    if (originalGitea !== undefined) process.env.GITEA_TOKEN = originalGitea
    else delete process.env.GITEA_TOKEN
  }
})

test('#81 — validateGhPath enforces executable path safety', async () => {
  assert.equal(await validateGhPath('gh'), 'gh')
  assert.equal(await validateGhPath('gh.exe'), 'gh.exe')

  await assert.rejects(
    () => validateGhPath('../relative/gh'),
    /must be an absolute path/,
  )
  await assert.rejects(
    () => validateGhPath('./relative/gh'),
    /must be an absolute path/,
  )
  await assert.rejects(
    () => validateGhPath(''),
    /non-empty string/,
  )
  await assert.rejects(
    () => validateGhPath('/non/existent/executable/gh-binary'),
    /does not exist/,
  )
  assert.equal(await validateGhPath(process.execPath), process.execPath)
})

test('#81 — createIssueWithAttachments enforces 0700 directory, 0600 file modes and isolated env', async () => {
  let executedEnv = null
  let inspectedDirMode = null
  let inspectedBodyMode = null
  let inspectedAttachMode = null

  const mockExec = async (binary, args, options) => {
    executedEnv = options.env
    // args[7] is --body-file <path>
    const bodyIdx = args.indexOf('--body-file')
    const bodyPath = args[bodyIdx + 1]
    const workDir = bodyPath.replace(/\/[^\/]+$/, '')

    const dirStat = await stat(workDir)
    inspectedDirMode = dirStat.mode & 0o777

    const bodyStat = await stat(bodyPath)
    inspectedBodyMode = bodyStat.mode & 0o777

    const attachIdx = args.indexOf('--attach')
    const attachPath = args[attachIdx + 1].split('#')[0]
    const attachStat = await stat(attachPath)
    inspectedAttachMode = attachStat.mode & 0o777

    return { stdout: 'https://github.com/goodandready/dsh-test/issues/42\n', stderr: '' }
  }

  const result = await createIssueWithAttachments({
    ghPath: 'gh',
    repository: { fullName: 'goodandready/dsh-test' },
    draft: { title: 'Test issue', body: 'Sensitive body' },
    token: 'gho_secret_token_val',
    attachments: [{ name: 'screen.png', mime: 'image/png', data: png }],
    exec: mockExec,
  })

  assert.equal(result.number, 42)
  assert.equal(result.url, 'https://github.com/goodandready/dsh-test/issues/42')
  assert.equal(executedEnv.GH_TOKEN, 'gho_secret_token_val')
  assert.equal(executedEnv.DEEPSEEK_API_KEY, undefined)

  if (process.platform !== 'win32') {
    assert.equal(inspectedDirMode, 0o700, 'workDir mode must be 0700')
    assert.equal(inspectedBodyMode, 0o600, 'bodyPath mode must be 0600')
    assert.equal(inspectedAttachMode, 0o600, 'attachment mode must be 0600')
  }
})

test('#75 — createIssueWithAttachments redacts tokens and sensitive data in re-thrown CLI errors', async () => {
  const secretToken = 'ghp_secretTokenValue12345678901234567890'
  const mockExec = async () => {
    const error = new Error('Execution failed')
    error.stderr = `gh: request failed with Authorization: Bearer ${secretToken} at /tmp/secret_file`
    throw error
  }

  await assert.rejects(
    () => createIssueWithAttachments({
      ghPath: 'gh',
      repository: { fullName: 'goodandready/dsh-test' },
      draft: { title: 'Test issue', body: 'Body' },
      token: secretToken,
      attachments: [{ name: 'screen.png', mime: 'image/png', data: png }],
      exec: mockExec,
    }),
    (err) => {
      assert.equal(err.message.includes(secretToken), false, 'token must not be echoed in error')
      assert.ok(err.message.includes('[redacted token]') || err.message.includes('[redacted credential]'), 'redacted placeholder must be present')
      assert.ok(err.message.includes('[redacted path]'), 'path must be redacted')
      return true
    },
  )
})
