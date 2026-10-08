'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { loadProjects } = require('./home/data')
const { documentedVersions } = require('./home/versions')
const { fillInstall } = require('./home/quickstart')
const { renderPage } = require('./home/render')

const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'build/site')
const SNAPSHOT = path.join(ROOT, 'data/snapshot.json')

const readSnapshot = async () => (fs.existsSync(SNAPSHOT) ? JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')) : undefined)
const writeSnapshot = async (projects) => fs.writeFileSync(SNAPSHOT, `${JSON.stringify(projects, null, 2)}\n`)
const readdir = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir) : [])

const withPageData = (project) => ({
  ...project,
  versions: documentedVersions(readdir, path.join(OUT, 'docs'), project.slug),
  snippets: fillInstall(project.install, project.releases[0]),
})

const feedOf = (projects) =>
  projects
    .flatMap((p) => p.releases.map((r) => ({ ...r, project: p.name })))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8)

const main = async () => {
  const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/projects.json'), 'utf8'))
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN
  const fetchFn = globalThis.fetch
  const { projects, source, reason } = await loadProjects({ config, fetchFn, token, readSnapshot, writeSnapshot })
  if (reason) console.warn(`landing page: using snapshot (${reason})`)
  const model = { projects: projects.map(withPageData), feed: feedOf(projects), year: new Date().getFullYear() }
  fs.mkdirSync(OUT, { recursive: true })
  fs.cpSync(path.join(ROOT, 'home'), OUT, { recursive: true })
  fs.writeFileSync(path.join(OUT, 'index.html'), renderPage(model))
  console.log(`landing page built from ${source} data`)
}

main().catch((err) => { console.error(err.message); process.exit(1) })
