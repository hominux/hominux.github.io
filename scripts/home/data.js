'use strict'

const { fetchRepo } = require('./github')

const mergeLive = (config, live) => config.map((project, i) => ({ ...live[i], ...project }))

const mergeSnapshot = (config, snapshot) =>
  config.map((project) => ({ ...snapshot.find((s) => s.slug === project.slug), ...project }))

const fromSnapshot = (config, snapshot, err) => {
  if (!snapshot) throw new Error(`GitHub fetch failed (${err.message}) and no snapshot exists`)
  return { projects: mergeSnapshot(config, snapshot), source: 'snapshot', reason: err.message }
}

const loadProjects = async ({ config, fetchFn, token, readSnapshot, writeSnapshot }) => {
  let live
  try {
    live = await Promise.all(config.map((p) => fetchRepo(fetchFn, p.slug, token)))
  } catch (err) {
    return fromSnapshot(config, await readSnapshot(), err)
  }
  const projects = mergeLive(config, live)
  await writeSnapshot(projects)
  return { projects, source: 'live' }
}

module.exports = { loadProjects }
