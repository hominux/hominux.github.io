'use strict'

const { fetchRepo } = require('./github')

const DEFAULTS = { releases: [], topics: [], stars: 0, openIssues: 0 }

const mergeLive = (config, live) => config.map((project, i) => ({ ...live[i], ...project }))

const mergeSnapshot = (config, snapshot) =>
  config.map((project) => ({ ...DEFAULTS, ...snapshot.find((s) => s.slug === project.slug), ...project }))

const fromSnapshot = (config, snapshot, err) => {
  if (!snapshot) throw new Error(`GitHub fetch failed (${err.message}) and no snapshot exists`)
  return { projects: mergeSnapshot(config, snapshot), source: 'snapshot', reason: err.message }
}

const fetchAll = (config, fetchFn, token) =>
  Promise.all(config.map((p) => fetchRepo(fetchFn, p.slug, token))).then((live) => ({ live }), (error) => ({ error }))

const loadProjects = async ({ config, fetchFn, token, readSnapshot, writeSnapshot }) => {
  const { live, error } = await fetchAll(config, fetchFn, token)
  if (error) return fromSnapshot(config, await readSnapshot(), error)
  const projects = mergeLive(config, live)
  await writeSnapshot(projects)
  return { projects, source: 'live' }
}

module.exports = { loadProjects }
