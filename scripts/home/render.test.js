const test = require('node:test')
const assert = require('node:assert/strict')
const { renderPage, esc } = require('./render')

const project = (over = {}) => ({
  slug: 'compress4j', name: 'Compress4J', tagline: 'tag', logo: 'compress4j-logo.png', docsPath: '/docs/compress4j/latest/',
  language: 'Java', license: 'Apache-2.0', stars: 15, openIssues: 3, topics: [], releases: [], versions: ['next', '5.x'], snippets: [{ label: 'Maven', lang: 'xml', code: '<v>1</v>' }], ...over,
})

test('escapes html in text', () => {
  assert.equal(esc('<script>"&'), '&lt;script&gt;&quot;&amp;')
})

test('renders every section and each project', () => {
  const html = renderPage({ projects: [project()], feed: [], year: 2026 })
  for (const id of ['hero', 'projects', 'quickstart', 'releases', 'community']) assert.match(html, new RegExp(`id="${id}"`))
  assert.match(html, /Compress4J/)
  assert.match(html, /href="\/docs\/compress4j\/5\.x\/"/)
})

test('escapes release notes from GitHub', () => {
  const feed = [{ project: 'Compress4J', tag: 'v1', date: '2026-10-06T00:00:00Z', url: 'u', excerpt: '<script>alert(1)</script>' }]
  const html = renderPage({ projects: [project()], feed, year: 2026 })
  assert.doesNotMatch(html, /<script>alert/)
  assert.match(html, /&lt;script&gt;alert/)
})

test('project without a release shows no version badge', () => {
  const html = renderPage({ projects: [project({ releases: [] })], feed: [], year: 2026 })
  assert.doesNotMatch(html, /class="badge version"/)
})

test('project documenting only next lists just that version', () => {
  const html = renderPage({ projects: [project({ versions: ['next'] })], feed: [], year: 2026 })
  assert.match(html, /\/docs\/compress4j\/next\//)
  assert.doesNotMatch(html, /\/docs\/compress4j\/5\.x\//)
})

test('hero keeps the mission and head has a canonical link', () => {
  const html = renderPage({ projects: [project()], feed: [], year: 2026 })
  assert.match(html, /<p class="mission">Every tool here exists because I needed it and it wasn&#39;t there\./)
  assert.match(html, /<link rel="canonical" href="https:\/\/hominux\.com\/">/)
})

test('no releases and no description still render, detail falls back to tagline', () => {
  const html = renderPage({ projects: [project({ releases: [], description: undefined })], feed: [], year: 2026 })
  assert.match(html, /<section class="detail" id="compress4j">[\s\S]*<p>tag<\/p>/)
  assert.match(html, /id="releases"/)
})
