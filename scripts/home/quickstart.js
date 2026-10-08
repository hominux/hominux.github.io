'use strict'

const PLACEHOLDER = 'VERSION'

const versionOf = (release) => release?.tag.replace(/^v/, '') ?? PLACEHOLDER

const fillInstall = (install, release) =>
  install.map(({ label, lang, template }) => ({ label, lang, code: template.replaceAll('{{version}}', versionOf(release)) }))

module.exports = { fillInstall }
