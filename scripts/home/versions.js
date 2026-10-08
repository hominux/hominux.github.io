'use strict'

const VERSION_DIR_RX = /^(next|\d+(\.\d+)*\.x)$/

const rank = (version) => (version === 'next' ? [Infinity] : version.replace(/\.x$/, '').split('.').map(Number))

const compareDesc = (a, b) => {
  const [ra, rb] = [rank(a), rank(b)]
  const i = ra.findIndex((part, idx) => part !== (rb[idx] ?? -1))
  return i === -1 ? rb.length - ra.length : (rb[i] ?? -1) - ra[i]
}

const sortVersions = (versions) => [...versions].sort(compareDesc)

const documentedVersions = (readdir, docsDir, component) =>
  sortVersions(readdir(`${docsDir}/${component}`).filter((name) => VERSION_DIR_RX.test(name)))

module.exports = { sortVersions, documentedVersions }
