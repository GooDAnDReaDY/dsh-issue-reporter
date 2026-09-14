import assert from 'node:assert/strict'
import test from 'node:test'
import {
  MAX_ATTACHMENT_BYTES,
  MAX_ATTACHMENTS,
  normalizeAttachments,
  validateAttachmentToken,
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
