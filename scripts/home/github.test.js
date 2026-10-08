const test = require('node:test')
const assert = require('node:assert/strict')
const { fetchRepo } = require('./github')

const ok = (body) => ({ ok: true, status: 200, json: async () => body })
const repo = { description: 'd', language: 'Java', license: { spdx_id: 'Apache-2.0' }, stargazers_count: 15, open_issues_count: 3, topics: ['java'], default_branch: 'main' }
const notFound = { ok: false, status: 404, json: async () => ({}) }
const route = ({ list = [], latest = notFound } = {}) => async (url) => {
  if (url.endsWith('/releases/latest')) return latest
  return url.includes('/releases') ? ok(list) : ok(repo)
}
const rel = (tag, extra = {}) => ({ tag_name: tag, published_at: '2026-10-06T00:00:00Z', html_url: `u/${tag}`, body: '## Notes\n**fix** thing', draft: false, prerelease: false, ...extra })

test('maps repo fields and skips drafts and prereleases', async () => {
  const fetchFn = route({ list: [rel('v2', { draft: true }), rel('v1.1', { prerelease: true }), rel('v1')] })
  const data = await fetchRepo(fetchFn, 'compress4j')
  assert.equal(data.stars, 15)
  assert.equal(data.license, 'Apache-2.0')
  assert.deepEqual(data.releases.map((r) => r.tag), ['v1'])
  assert.equal(data.releases[0].excerpt, 'Notes fix thing')
})

test('repo without releases yields an empty list', async () => {
  assert.deepEqual((await fetchRepo(route(), 'x')).releases, [])
})

test('sends the token as a bearer header', async () => {
  const seen = []
  const inner = route()
  const fetchFn = async (url, init) => (seen.push(init.headers.authorization), inner(url))
  await fetchRepo(fetchFn, 'x', 'T')
  assert.deepEqual(seen, ['Bearer T', 'Bearer T', 'Bearer T'])
})

test('throws on a non-ok response', async () => {
  const fetchFn = async () => ({ ok: false, status: 403, json: async () => ({}) })
  await assert.rejects(fetchRepo(fetchFn, 'x'), /403/)
})

test('maps null description and language to undefined', async () => {
  const fetchFn = async (url) => (url.includes('/releases') ? (url.endsWith('/latest') ? notFound : ok([])) : ok({ ...repo, description: null, language: null }))
  const data = await fetchRepo(fetchFn, 'x')
  assert.equal(data.description, undefined)
  assert.equal(data.language, undefined)
})

const excerptOf = async (body) => {
  const fetchFn = route({ list: [rel('v1', { body })] })
  return (await fetchRepo(fetchFn, 'x')).releases[0].excerpt
}

test('excerpt replaces markdown links with their text', async () => {
  assert.equal(await excerptOf('fix [abc1234](https://x.test/c/abc1234) thing'), 'fix abc1234 thing')
})

test('excerpt drops bare URLs', async () => {
  assert.equal(await excerptOf('see https://x.test/long/path?a=1 now'), 'see now')
})

test('excerpt stays linear on unclosed brackets', async () => {
  assert.ok((await excerptOf('['.repeat(100000))).length <= 200)
})

test('a backport listed first does not become the latest release', async () => {
  const fetchFn = route({ list: [rel('v4.0.3'), rel('v5.0.0'), rel('v4.0.2')], latest: ok(rel('v5.0.0')) })
  const data = await fetchRepo(fetchFn, 'x')
  assert.deepEqual(data.releases.map((r) => r.tag), ['v5.0.0', 'v4.0.3', 'v4.0.2'])
})

test('without a latest release the first published release leads', async () => {
  const fetchFn = route({ list: [rel('v2', { draft: true }), rel('v1')] })
  assert.deepEqual((await fetchRepo(fetchFn, 'x')).releases.map((r) => r.tag), ['v1'])
})

test('a non-404 failure on latest still throws with the status', async () => {
  const fetchFn = route({ latest: { ok: false, status: 500, json: async () => ({}) } })
  await assert.rejects(fetchRepo(fetchFn, 'x'), /500/)
})

test('every request carries an abort signal', async () => {
  const signals = []
  const inner = route()
  const fetchFn = async (url, init) => (signals.push(init.signal), inner(url))
  await fetchRepo(fetchFn, 'x')
  assert.equal(signals.length, 3)
  assert.ok(signals.every((s) => s instanceof AbortSignal))
})
