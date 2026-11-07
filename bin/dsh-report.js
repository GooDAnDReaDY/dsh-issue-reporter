#!/usr/bin/env node

import { getEnvironmentSnapshot, formatEnvironmentMarkdown, composeIssueDraft, redactText } from '../lib/domain.js'

function parseArgs(argv) {
  const options = {
    plugin: '',
    title: '',
    observed: '',
    expected: '',
    dryRun: false,
    json: false,
    help: false,
  }

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--help' || arg === '-h') {
      options.help = true
    } else if (arg === '--dry-run') {
      options.dryRun = true
    } else if (arg === '--json') {
      options.json = true
    } else if (arg === '--plugin' && argv[i + 1]) {
      options.plugin = argv[++i]
    } else if (arg === '--title' && argv[i + 1]) {
      options.title = argv[++i]
    } else if (arg === '--observed' && argv[i + 1]) {
      options.observed = argv[++i]
    } else if (arg === '--expected' && argv[i + 1]) {
      options.expected = argv[++i]
    }
  }

  return options
}

export async function runCli(argv = process.argv) {
  const options = parseArgs(argv)

  if (options.help) {
    const helpText = [
      'dsh-report — Headless CLI Bug Reporter for DeepSeek Harness',
      '',
      'Usage:',
      '  dsh-report [options]',
      '',
      'Options:',
      '  --plugin <name>    Target plugin name (e.g. dsh-cron)',
      '  --title <text>     Issue title',
      '  --observed <text>  Observed faulty behavior',
      '  --expected <text>  Expected normal behavior',
      '  --dry-run          Assemble and validate draft without submitting',
      '  --json             Output structured JSON instead of Markdown',
      '  --help, -h         Show this help message',
    ].join('\n')
    process.stdout.write(helpText + '\n')
    return 0
  }

  const envSnapshot = getEnvironmentSnapshot()
  const envMarkdown = formatEnvironmentMarkdown(envSnapshot)

  const draft = composeIssueDraft({
    title: options.title || `[Bug] Unhandled failure in ${options.plugin || 'DSH'}`,
    observed: options.observed || 'Failure observed in headless environment',
    expected: options.expected || 'Operation completes successfully',
    environmentSnapshot: envSnapshot,
    environmentMarkdown: envMarkdown,
  })

  if (options.json) {
    process.stdout.write(JSON.stringify(draft, null, 2) + '\n')
  } else {
    process.stdout.write('=== DSH Bug Report Draft ===\n\n' + draft.body + '\n')
  }

  return 0
}

if (process.argv[1] && process.argv[1].endsWith('dsh-report.js')) {
  runCli(process.argv).catch((err) => {
    process.stderr.write(`Error: ${err?.message || err}\n`)
    process.exit(1)
  })
}
