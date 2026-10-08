'use strict'

const API = 'https://api.github.com'
const EXCERPT_MAX = 200

const headersFor = (token) => ({
  accept: 'application/vnd.github+json',
  'user-agent': 'hominux-site-build',
  ...(token ? { authorization: `Bearer ${token}` } : {}),
})

const getJson = async (fetchFn, url, token) => {
  const res = await fetchFn(url, { headers: headersFor(token) })
  if (!res.ok) throw new Error(`${url} -> ${res.status}`)
  return res.json()
}

const excerpt = (body = '') => {
  const text = body
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[#*`>[\]]/g, '').replace(/\s+/g, ' ').trim()
  return text.length > EXCERPT_MAX ? `${text.slice(0, EXCERPT_MAX - 1).trimEnd()}…` : text
}

const toRelease = (r) => ({ tag: r.tag_name, date: r.published_at, url: r.html_url, excerpt: excerpt(r.body) })

const isPublished = (r) => !r.draft && !r.prerelease

const fetchRepo = async (fetchFn, slug, token) => {
  const base = `${API}/repos/hominux/${slug}`
  const [repo, releases] = await Promise.all([
    getJson(fetchFn, base, token),
    getJson(fetchFn, `${base}/releases?per_page=5`, token),
  ])
  return {
    description: repo.description ?? undefined,
    language: repo.language ?? undefined,
    license: repo.license?.spdx_id ?? undefined,
    stars: repo.stargazers_count,
    openIssues: repo.open_issues_count,
    topics: repo.topics ?? [],
    defaultBranch: repo.default_branch,
    releases: releases.filter(isPublished).map(toRelease),
  }
}

module.exports = { fetchRepo }
