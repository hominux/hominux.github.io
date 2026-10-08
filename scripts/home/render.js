'use strict'

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
const esc = (text = '') => String(text).replace(/[&<>"']/g, (c) => ESCAPES[c])

const DESCRIPTION = 'Small, focused open-source libraries and tooling for Java and contract testing.'
const MISSION = "Every tool here exists because I needed it and it wasn't there. Hominux builds those missing tools so the next developer doesn't have to struggle through the same gap."

const docsUrl = (project, version) => `/docs/${project.slug}/${version}/`
const repoUrl = (project) => `https://github.com/hominux/${esc(project.slug)}`
const dateOf = (iso) => iso.slice(0, 10)
const latestOf = (project) => project.releases[0]

const versionBadge = (project) =>
  latestOf(project) ? `<span class="badge version">${esc(latestOf(project).tag)}</span>` : ''

const metaLine = (project) =>
  [project.language, project.license, `★ ${project.stars}`].filter(Boolean).map(esc).join(' · ')

const card = (project) => `
<article class="card">
  <img class="card-logo" src="/assets/${esc(project.logo)}" alt="">
  <h3>${esc(project.name)} ${versionBadge(project)}</h3>
  <p>${esc(project.tagline)}</p>
  <p class="meta">${metaLine(project)}</p>
  <p><a href="${esc(project.docsPath)}">Documentation</a> · <a href="${repoUrl(project)}">Source</a></p>
</article>`

const versionLinks = (project) =>
  project.versions.map((v) => `<a href="${docsUrl(project, v)}">${esc(v)}</a>`).join(' ')

const detail = (project) => `
<section class="detail" id="${esc(project.slug)}">
  <h3>${esc(project.name)}</h3>
  <p>${esc(project.description ?? project.tagline)}</p>
  <p class="versions">Documented versions: ${versionLinks(project)}</p>
  <p><a href="${repoUrl(project)}/issues">Issues (${esc(project.openIssues ?? 0)})</a> ·
     <a href="${repoUrl(project)}/releases">Releases</a></p>
</section>`

const snippet = (s) =>
  `<figure class="snippet"><figcaption>${esc(s.label)}</figcaption><pre><code class="language-${esc(s.lang)}">${esc(s.code)}</code></pre></figure>`

const quickstart = (project) => `
<div class="quickstart" data-tabs>
  <h3>${esc(project.name)}</h3>
  ${project.snippets.map(snippet).join('')}
</div>`

const feedItem = (item) => `
<li><strong>${esc(item.project)} ${esc(item.tag)}</strong> <time datetime="${esc(item.date)}">${esc(dateOf(item.date))}</time>
  <p>${esc(item.excerpt)}</p><a href="${esc(item.url)}">Release notes</a></li>`

const COMMUNITY = [
  ['Contribute', 'https://github.com/hominux/.github/blob/main/CONTRIBUTING.md'],
  ['Security policy', 'https://github.com/hominux/.github/blob/main/SECURITY.md'],
  ['Code of conduct', 'https://github.com/hominux/.github/blob/main/CODE_OF_CONDUCT.md'],
  ['Support', 'https://github.com/hominux/.github/blob/main/SUPPORT.md'],
]

const communityLink = ([title, url]) => `<li><a href="${url}">${esc(title)}</a></li>`

const community = () => `<ul class="links">${COMMUNITY.map(communityLink).join('')}</ul>`

const head = () => `<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hominux</title><meta name="description" content="${DESCRIPTION}">
<link rel="canonical" href="https://hominux.com/">
<script>try{var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>
<link rel="icon" href="/assets/favicon.ico"><link rel="stylesheet" href="/assets/home.css"></head>`

const nav = () => `<nav><a href="#projects">Projects</a><a href="/docs/">Docs</a><a href="#releases">Releases</a><a href="#community">Community</a><a href="https://github.com/hominux">GitHub</a></nav>`

const header = () => `
<header class="site-header"><a class="brand" href="/"><img src="/assets/hominux-logo.png" alt=""><span>Hominux</span></a>
${nav()}<button type="button" id="theme-toggle" class="theme-toggle" aria-label="Toggle dark mode" hidden>◐</button></header>`

const footer = (year) => `<footer class="site-footer"><p>Copyright © ${esc(year)} Hominux.</p></footer>`

const heroSection = () => `
<section id="hero"><h1>Small tools that fill real gaps</h1><p class="lead">Open-source libraries and tooling for Java and contract testing.</p>
<p class="mission">${esc(MISSION)}</p>
<p><a class="button" href="#projects">Browse projects</a> <a class="button secondary" href="/docs/">Read the docs</a></p></section>`

const projectsSection = (projects) =>
  `<section id="projects"><h2>Projects</h2><div class="cards">${projects.map(card).join('')}</div>${projects.map(detail).join('')}</section>`

const quickstartSection = (projects) =>
  `<section id="quickstart"><h2>Quickstart</h2>${projects.map(quickstart).join('')}</section>`

const releasesSection = (feed) =>
  `<section id="releases"><h2>Latest releases</h2><ul class="feed">${feed.map(feedItem).join('')}</ul></section>`

const communitySection = () =>
  `<section id="community"><h2>Community and support</h2>${community()}</section>`

const mainContent = ({ projects, feed }) =>
  `<main>${heroSection()}${projectsSection(projects)}${quickstartSection(projects)}${releasesSection(feed)}${communitySection()}</main>`

const renderPage = (model) => `<!doctype html>
<html lang="en">${head()}
<body>${header()}${mainContent(model)}${footer(model.year)}<script src="/assets/home.js" defer></script></body></html>`

module.exports = { renderPage, esc }
