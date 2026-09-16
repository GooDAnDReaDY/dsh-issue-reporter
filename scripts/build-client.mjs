import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceFiles = [
  'locales.js',
  'styles.js',
  'shared.js',
  'catalog.js',
  'attachments.js',
  'issue-form.js',
  'reports-auth.js',
  'settings-card.js',
]
const prefix = `window.__ModuleLoader__.load({\n  id: '@goodandready/dsh-issue-reporter',\n  factory: (require) => {\n    var module = { exports: {} }\n    var exports = module.exports\n    const React = require('react')\n    const h = React.createElement\n    const NS = 'dsh-issue-reporter'\n\n`
const suffix = `  },\n})\n`
const contents = sourceFiles.map((file) => readFileSync(path.join(root, 'src/client', file), 'utf8').trimEnd())
const bundle = (prefix + contents.join('\n\n') + '\n\n' + suffix).replace(/\r\n/g, '\n').replace(/\n/g, '\r\n')
writeFileSync(path.join(root, 'lib/client.js'), bundle)
