import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { apply, Config, name, inject } from '../lib/index.js'

const indexSource = readFileSync(new URL('../lib/index.js', import.meta.url), 'utf8')

test('#71 #72 #73 #77 #78 — lib/index.js never calls removed settings.register or scope.watch', () => {
  assert.ok(!/settings\s*\.\s*register\s*\(/.test(indexSource), 'lib/index.js must not call settings.register')
  assert.ok(!/settings\s*\.\s*get\s*\(/.test(indexSource), 'lib/index.js must not call settings.get')
  assert.ok(!/scope\s*\.\s*watch\s*\(/.test(indexSource), 'lib/index.js must not call scope.watch')
  assert.ok(!/settings\s*\.\s*watch\s*\(/.test(indexSource), 'lib/index.js must not call settings.watch')
})

test('Config schema marks editable fields as volatile and credential refs with role credential-ref', () => {
  assert.equal(Config.dict.appClientId.meta?.volatile, true, 'appClientId must be volatile')
  assert.equal(Config.dict.apiBaseUrl.meta?.volatile, true, 'apiBaseUrl must be volatile')
  assert.equal(Config.dict.giteaBaseUrl.meta?.volatile, true, 'giteaBaseUrl must be volatile')
  assert.equal(Config.dict.timeoutMs.meta?.volatile, true, 'timeoutMs must be volatile')
  assert.equal(Config.dict.ghPath.meta?.volatile, true, 'ghPath must be volatile')

  assert.equal(Config.dict.tokenEnv.meta?.volatile, undefined, 'tokenEnv must not be volatile')
  assert.equal(Config.dict.giteaTokenEnv.meta?.volatile, undefined, 'giteaTokenEnv must not be volatile')
  assert.equal(Config.dict.tokenEnv.meta?.role, 'credential-ref')
  assert.equal(Config.dict.giteaTokenEnv.meta?.role, 'credential-ref')
})

test('apply integrates with DSH 0.2 settings service without register and responds to live updates', () => {
  const listeners = new Map()
  let configuredOpts = null
  let configuredFiber = null

  const mockSettings = {
    configure(opts, fiber) {
      configuredOpts = opts
      configuredFiber = fiber
    },
    describe() {
      return [
        {
          ns: 'dsh-issue-reporter',
          status: 'ready',
          value: {
            appClientId: 'saved-client-id',
            timeoutMs: 45000,
          },
        },
      ]
    },
  }

  const mockFiber = { id: 'fiber-issue-reporter' }
  const mockCtx = {
    fiber: mockFiber,
    logger: {
      debug() {},
      warn() {},
      info() {},
      error() {},
    },
    inject(deps, cb) {
      if (deps.includes('settings')) {
        cb({
          settings: mockSettings,
          effect(fn) { return fn() },
        })
      }
    },
    effect(fn) { return typeof fn === 'function' ? fn() : undefined },
    on(event, handler) {
      listeners.set(event, handler)
    },
    off(event) {
      listeners.delete(event)
    },
    webServer: { register() {} },
  }

  const config = {
    appClientId: 'initial-id',
    tokenEnv: 'GITHUB_ISSUE_REPORTER_TOKEN',
    apiBaseUrl: 'https://api.github.com',
    giteaBaseUrl: '',
    giteaTokenEnv: 'GITEA_ISSUE_REPORTER_TOKEN',
    timeoutMs: 30000,
    ghPath: 'gh',
  }

  assert.doesNotThrow(() => {
    apply(mockCtx, config)
  })

  // DSH 0.2 configure opt-out check
  assert.deepEqual(configuredOpts, { auto: false })
  assert.equal(configuredFiber, mockFiber)

  // Served settings from describe() must be applied
  assert.equal(config.appClientId, 'saved-client-id')
  assert.equal(config.timeoutMs, 45000)

  // Test loader/volatile-update live update
  const volatileHandler = listeners.get('loader/volatile-update')
  assert.ok(typeof volatileHandler === 'function', 'loader/volatile-update listener must be registered')
  volatileHandler({ 'dsh-issue-reporter': { timeoutMs: 50000, ghPath: '/usr/local/bin/gh' } })
  assert.equal(config.timeoutMs, 50000)
  assert.equal(config.ghPath, '/usr/local/bin/gh')

  // Test config event live update
  const configHandler = listeners.get('config')
  assert.ok(typeof configHandler === 'function', 'config listener must be registered')
  configHandler({ giteaBaseUrl: 'https://gitea.example.com' })
  assert.equal(config.giteaBaseUrl, 'https://gitea.example.com')
})

test('apply handles missing settings service gracefully', () => {
  const mockCtx = {
    fiber: { id: 'test' },
    logger: { debug() {}, warn() {}, info() {}, error() {} },
    inject() {},
    effect(fn) { return typeof fn === 'function' ? fn() : undefined },
    on() {},
    off() {},
    webServer: { register() {} },
  }

  const config = { appClientId: 'initial' }
  assert.doesNotThrow(() => {
    apply(mockCtx, config)
  })
  assert.equal(config.appClientId, 'initial')
})
