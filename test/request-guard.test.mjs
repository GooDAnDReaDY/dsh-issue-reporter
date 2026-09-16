import assert from 'node:assert/strict'
import test from 'node:test'
import { authorizeRequest } from '../lib/routes/shared.js'

function response() {
  return {
    status: undefined,
    headers: undefined,
    payload: undefined,
    writeHead(status, headers) {
      this.status = status
      this.headers = headers
    },
    end(body) {
      this.payload = JSON.parse(body)
    },
  }
}

test('fails closed with 503 when the connection service is missing and warns once', () => {
  let warnings = 0
  const ctx = {
    reflect: { get: () => undefined },
    logger: { warn: () => { warnings += 1 } },
  }
  const first = response()
  const second = response()

  assert.equal(authorizeRequest(ctx, {}, first), false)
  assert.equal(authorizeRequest(ctx, {}, second), false)
  assert.equal(warnings, 1)
  assert.equal(first.status, 503)
  assert.equal(first.payload.error, 'DSH browser authentication is unavailable')
})

test('fails closed when the connection service cannot check requests', () => {
  const res = response()

  assert.equal(authorizeRequest({ reflect: { get: () => ({}) } }, {}, res), false)
  assert.equal(res.status, 503)
})

test('returns the connection service rejection without allowing the request', () => {
  for (const [rejection, status] of [[401, 401], [403, 403]]) {
    const res = response()
    const ctx = { reflect: { get: () => ({ requestRejection: () => rejection }) } }

    assert.equal(authorizeRequest(ctx, {}, res), false)
    assert.equal(res.status, status)
  }
})

test('allows only when requestRejection explicitly returns undefined', () => {
  let lookups = 0
  const ctx = {
    reflect: {
      get: (name) => {
        lookups += 1
        assert.equal(name, 'connection')
        return { requestRejection: () => undefined }
      },
    },
    get: () => { throw new Error('legacy lookup must not be used') },
  }
  const res = response()

  assert.equal(authorizeRequest(ctx, {}, res), true)
  assert.equal(lookups, 1)
  assert.equal(res.status, undefined)
})

test('fails closed when connection authorization throws', () => {
  const res = response()
  const ctx = {
    reflect: { get: () => ({ requestRejection: () => { throw new Error('internal') } }) },
  }

  assert.equal(authorizeRequest(ctx, {}, res), false)
  assert.equal(res.status, 503)
  assert.equal(res.payload.error, 'DSH browser authentication is unavailable')
})
