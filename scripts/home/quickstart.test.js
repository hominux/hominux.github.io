const test = require('node:test')
const assert = require('node:assert/strict')
const { fillInstall } = require('./quickstart')

const install = [{ label: 'Maven', lang: 'xml', template: '<version>{{version}}</version>' }]

test('substitutes the release tag without the leading v', () => {
  assert.equal(fillInstall(install, { tag: 'v5.0.0' })[0].code, '<version>5.0.0</version>')
})

test('uses VERSION when no release exists', () => {
  assert.equal(fillInstall(install)[0].code, '<version>VERSION</version>')
})
