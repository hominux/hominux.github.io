'use strict'

const { fetchRepo } = require('./github')

const mergeLive = (config, live) => config.map((project, i) => ({ ...project, ...live[i] }))

const mergeSnapshot = (config, snapshot) =>
  config.map((project) => ({ ...snapshot.find((s) => s.slug === project.slug), ...project }))

const loadProjects = async ({ config, fetchFn, token, readSnapshot, writeSnapshot }) => {
  try {
    const live = await Promise.all(config.map((p) => fetchRepo(fetchFn, p.slug, token)))
    const projects = mergeLive(config, live)
    await writeSnapshot(projects)
    return { projects, source: 'live' }
  } catch (err) {
    const snapshot = await readSnapshot()
    if (!snapshot) throw new Error(`GitHub fetch failed (${err.message}) and no snapshot exists`)
    return { projects: mergeSnapshot(config, snapshot), source: 'snapshot', reason: err.message }
  }
}

module.exports = { loadProjects }
