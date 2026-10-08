const test = require('node:test')
const assert = require('node:assert/strict')
const { loadProjects } = require('./data')

const config = [{ slug: 'a', name: 'A' }]
const live = { stars: 1, releases: [] }

test('returns live data and writes the snapshot', async () => {
  let written
  const fetchFn = async (url) => ({ ok: true, status: 200, json: async () => (url.includes('/releases') ? [] : { stargazers_count: 1, topics: [] }) })
  const result = await loadProjects({ config, fetchFn, readSnapshot: async () => undefined, writeSnapshot: async (p) => { written = p } })
  assert.equal(result.source, 'live')
  assert.equal(written[0].slug, 'a')
})

test('falls back to the snapshot on API failure', async () => {
  const fetchFn = async () => ({ ok: false, status: 403, json: async () => ({}) })
  const snapshot = [{ slug: 'a', name: 'old name', ...live }]
  const result = await loadProjects({ config, fetchFn, readSnapshot: async () => snapshot, writeSnapshot: async () => {} })
  assert.equal(result.source, 'snapshot')
  assert.equal(result.projects[0].name, 'A')
  assert.equal(result.projects[0].stars, 1)
  assert.match(result.reason, /403/)
})

test('fails when both the API and the snapshot are unavailable', async () => {
  const fetchFn = async () => { throw new Error('offline') }
  await assert.rejects(loadProjects({ config, fetchFn, readSnapshot: async () => undefined, writeSnapshot: async () => {} }), /no snapshot/)
})
