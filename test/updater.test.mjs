import test from 'node:test'
import assert from 'node:assert/strict'
import { isTrustedUpdateRequest, isNewerVersion } from '../lib/plugin-updater.js'

test('isTrustedUpdateRequest validates headers and loopback origin', () => {
  assert.equal(isTrustedUpdateRequest({
    headers: {
      'x-dsh-plugin-update': '1',
      'sec-fetch-site': 'same-origin',
      origin: 'http://localhost:3080',
      host: 'localhost:3080',
    },
    socket: { remoteAddress: '127.0.0.1' },
  }), true)

  // Rejects missing update header
  assert.equal(isTrustedUpdateRequest({
    headers: {
      'sec-fetch-site': 'same-origin',
      origin: 'http://localhost:3080',
      host: 'localhost:3080',
    },
    socket: { remoteAddress: '127.0.0.1' },
  }), false)

  // Rejects cross-origin
  assert.equal(isTrustedUpdateRequest({
    headers: {
      'x-dsh-plugin-update': '1',
      'sec-fetch-site': 'cross-site',
      origin: 'http://evil.com',
      host: 'localhost:3080',
    },
    socket: { remoteAddress: '127.0.0.1' },
  }), false)

  // Rejects non-loopback IP
  assert.equal(isTrustedUpdateRequest({
    headers: {
      'x-dsh-plugin-update': '1',
      'sec-fetch-site': 'same-origin',
      origin: 'http://localhost:3080',
      host: 'localhost:3080',
    },
    socket: { remoteAddress: '192.168.1.50' },
  }), false)
})

test('isNewerVersion compares semver and prereleases correctly', () => {
  assert.equal(isNewerVersion('0.1.1', '0.1.2'), true)
  assert.equal(isNewerVersion('0.1.1', '0.2.0'), true)
  assert.equal(isNewerVersion('0.1.1', '1.0.0'), true)
  assert.equal(isNewerVersion('0.1.2', '0.1.1'), false)
  assert.equal(isNewerVersion('0.1.1', '0.1.1'), false)
  assert.equal(isNewerVersion('0.1.1', '0.1.1-alpha.1'), false)
  assert.equal(isNewerVersion('0.1.1-alpha.1', '0.1.1'), true)
})
