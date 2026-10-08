const test = require('node:test')
const assert = require('node:assert/strict')
const { sortVersions, documentedVersions } = require('./versions')

test('next first then newest line first', () => {
  assert.deepEqual(sortVersions(['2.x', 'next', '10.x', '5.x', '0.1.x']), ['next', '10.x', '5.x', '2.x', '0.1.x'])
})

test('component documenting only next', () => {
  const readdir = () => ['next']
  assert.deepEqual(documentedVersions(readdir, 'build/site/docs', 'x'), ['next'])
})

test('ignores the latest alias dir and files', () => {
  const readdir = () => ['latest', '5.x', 'next', 'index.html']
  assert.deepEqual(documentedVersions(readdir, 'build/site/docs', 'x'), ['next', '5.x'])
})
