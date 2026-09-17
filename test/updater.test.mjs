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
    socket: { remoteAddress: '10.23.45.67' },
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

test('fixtures and sources do not contain internal LAN IPs or development paths', async () => {
  const fs = await import('node:fs/promises')
  const path = await import('node:path')
  const root = path.resolve(new URL('..', import.meta.url).pathname)
  const lanIpPattern = /\b192\.168\.\d{1,3}\.\d{1,3}\b/
  const devPathPattern = /\/mnt\/external\/[^\s'"]+/

  for (const dir of ['lib', 'test']) {
    const dirPath = path.join(root, dir)
    const files = await fs.readdir(dirPath)
    for (const file of files) {
      if (!file.endsWith('.js') && !file.endsWith('.mjs')) continue
      const text = await fs.readFile(path.join(dirPath, file), 'utf-8')
      assert.equal(
        lanIpPattern.test(text),
        false,
        `File ${dir}/${file} contains an internal 192.168.x.x LAN IP address`,
      )
      assert.equal(
        devPathPattern.test(text),
        false,
        `File ${dir}/${file} contains internal /mnt/external development path`,
      )
    }
  }
})
