import test from 'node:test'
import assert from 'node:assert/strict'
import { createGitHubClient, GitHubApiError } from '../lib/github.js'

function response(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(payload),
  }
}

test('uses GitHub headers and search endpoint without leaking token into urls', async () => {
  const calls = []
  const client = createGitHubClient({
    baseUrl: 'https://api.github.com',
    token: 'opaque-token',
    fetchImpl: async (url, options) => {
      calls.push({ url, options })
      return response(200, { items: [] })
    },
  })
  await client.searchIssues('acme', 'widget', 'Crash after login')
  assert.match(calls[0].url, /\/search\/issues\?/)
  assert.match(calls[0].url, /repo%3Aacme%2Fwidget/)
  assert.equal(calls[0].options.headers.Authorization, 'Bearer opaque-token')
  assert.equal(calls[0].url.includes('opaque-token'), false)
})

test('creates issues only with the given safe payload', async () => {
  let call
  const client = createGitHubClient({
    baseUrl: 'https://api.github.com',
    token: 'opaque-token',
    fetchImpl: async (url, options) => {
      call = { url, options }
      return response(201, { number: 7, title: 'Safe', html_url: 'https://github.com/acme/widget/issues/7' })
    },
  })
  const result = await client.createIssue('acme', 'widget', { title: 'Safe', body: 'Body' })
  assert.equal(result.number, 7)
  assert.deepEqual(JSON.parse(call.options.body), { title: 'Safe', body: 'Body' })
})

test('surfaces GitHub API failures as typed errors', async () => {
  const client = createGitHubClient({
    fetchImpl: async () => response(403, { message: 'Forbidden' }),
  })
  await assert.rejects(() => client.currentUser(), (error) => {
    assert.ok(error instanceof GitHubApiError)
    assert.equal(error.status, 403)
    return true
  })
})
