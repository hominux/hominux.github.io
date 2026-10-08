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

const okRepo = async (url) => ({ ok: true, status: 200, json: async () => (url.includes('/releases') ? [] : { description: 'gh desc', topics: [] }) })

test('config values win over live GitHub values', async () => {
  const withDesc = [{ slug: 'a', description: 'cfg desc' }]
  const result = await loadProjects({ config: withDesc, fetchFn: okRepo, readSnapshot: async () => undefined, writeSnapshot: async () => {} })
  assert.equal(result.projects[0].description, 'cfg desc')
})

test('surfaces a snapshot write error instead of falling back', async () => {
  await assert.rejects(
    loadProjects({ config, fetchFn: okRepo, readSnapshot: async () => [{ slug: 'a', ...live }], writeSnapshot: async () => { throw new Error('disk full') } }),
    /disk full/,
  )
})
