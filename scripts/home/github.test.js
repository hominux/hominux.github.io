const test = require('node:test')
const assert = require('node:assert/strict')
const { fetchRepo } = require('./github')

const ok = (body) => ({ ok: true, status: 200, json: async () => body })
const repo = { description: 'd', language: 'Java', license: { spdx_id: 'Apache-2.0' }, stargazers_count: 15, open_issues_count: 3, topics: ['java'], default_branch: 'main' }
const rel = (tag, extra = {}) => ({ tag_name: tag, published_at: '2026-10-06T00:00:00Z', html_url: `u/${tag}`, body: '## Notes\n**fix** thing', draft: false, prerelease: false, ...extra })

test('maps repo fields and skips drafts and prereleases', async () => {
  const fetchFn = async (url) => (url.endsWith('/releases?per_page=5') ? ok([rel('v2', { draft: true }), rel('v1.1', { prerelease: true }), rel('v1')]) : ok(repo))
  const data = await fetchRepo(fetchFn, 'compress4j')
  assert.equal(data.stars, 15)
  assert.equal(data.license, 'Apache-2.0')
  assert.deepEqual(data.releases.map((r) => r.tag), ['v1'])
  assert.equal(data.releases[0].excerpt, 'Notes fix thing')
})

test('repo without releases yields an empty list', async () => {
  const fetchFn = async (url) => (url.includes('/releases') ? ok([]) : ok(repo))
  assert.deepEqual((await fetchRepo(fetchFn, 'x')).releases, [])
})

test('sends the token as a bearer header', async () => {
  const seen = []
  const fetchFn = async (url, init) => (seen.push(init.headers.authorization), url.includes('/releases') ? ok([]) : ok(repo))
  await fetchRepo(fetchFn, 'x', 'T')
  assert.deepEqual(seen, ['Bearer T', 'Bearer T'])
})

test('throws on a non-ok response', async () => {
  const fetchFn = async () => ({ ok: false, status: 403, json: async () => ({}) })
  await assert.rejects(fetchRepo(fetchFn, 'x'), /403/)
})
