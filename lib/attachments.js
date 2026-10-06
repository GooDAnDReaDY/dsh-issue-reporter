import { execFile } from 'node:child_process'
import { access, chmod, constants, mkdtemp, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, extname, isAbsolute, join } from 'node:path'
import { promisify } from 'node:util'
import { redactText } from './domain.js'

const execFileAsync = promisify(execFile)

export const MAX_ATTACHMENTS = 5
export const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024
export const MAX_ATTACHMENT_TOTAL_BYTES = 20 * 1024 * 1024

const IMAGE_TYPES = new Map([
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.gif', 'image/gif'],
  ['.webp', 'image/webp'],
])

function safeName(value, fallback) {
  const name = basename(typeof value === 'string' ? value : '')
    .replace(/[^A-Za-z0-9._-]+/g, '_')
    .slice(0, 120)
  return name || fallback
}

function decode(value) {
  if (
    typeof value !== 'string' ||
    !value ||
    value.length % 4 !== 0 ||
    !/^[A-Za-z0-9+/]*={0,2}$/.test(value)
  ) {
    throw new Error('Invalid screenshot data')
  }
  return Buffer.from(value, 'base64')
}

export function normalizeAttachments(input) {
  if (!Array.isArray(input) || input.length === 0) return []
  if (input.length > MAX_ATTACHMENTS) {
    throw new Error('Up to ' + MAX_ATTACHMENTS + ' screenshots can be attached')
  }

  let total = 0
  return input.map((item, index) => {
    const name = safeName(item?.name, 'screenshot-' + (index + 1) + '.png')
    const ext = extname(name).toLowerCase()
    const expectedMime = IMAGE_TYPES.get(ext)

    if (!expectedMime || (item?.mime && item.mime !== expectedMime)) {
      throw new Error('Only PNG, JPG, GIF, and WebP screenshots are supported')
    }

    const data = decode(item?.data)
    if (data.length === 0 || data.length > MAX_ATTACHMENT_BYTES) {
      throw new Error('Each screenshot must be 8 MB or smaller')
    }

    total += data.length
    if (total > MAX_ATTACHMENT_TOTAL_BYTES) {
      throw new Error('Screenshot attachments are limited to 20 MB in total')
    }

    return { name, mime: expectedMime, data }
  })
}

export function validateAttachmentToken(token) {
  if (typeof token !== 'string' || !token) {
    throw new Error('GitHub authentication is not configured')
  }
  if (/^(?:ghu|ghs)_/i.test(token)) {
    throw new Error(
      'Screenshot uploads require a GitHub OAuth App token or personal access token; GitHub App tokens are not supported',
    )
  }
}

export function buildSafeEnv(token) {
  const env = {
    PATH: process.env.PATH || '',
    HOME: process.env.HOME || '',
    USERPROFILE: process.env.USERPROFILE || '',
    SYSTEMROOT: process.env.SystemRoot || process.env.SYSTEMROOT || '',
    WINDIR: process.env.windir || process.env.WINDIR || '',
    TMPDIR: process.env.TMPDIR || process.env.TMP || process.env.TEMP || '',
    GH_TOKEN: typeof token === 'string' ? token : '',
  }
  if (process.env.GH_HOST) env.GH_HOST = process.env.GH_HOST
  if (process.env.HTTPS_PROXY) env.HTTPS_PROXY = process.env.HTTPS_PROXY
  if (process.env.HTTP_PROXY) env.HTTP_PROXY = process.env.HTTP_PROXY
  if (process.env.ALL_PROXY) env.ALL_PROXY = process.env.ALL_PROXY
  if (process.env.NO_PROXY) env.NO_PROXY = process.env.NO_PROXY
  return env
}

export async function validateGhPath(ghPath = 'gh') {
  if (typeof ghPath !== 'string' || !ghPath.trim()) {
    throw new Error('Configured ghPath must be a non-empty string')
  }
  const target = ghPath.trim()
  if (!target.includes('/') && !target.includes('\\')) {
    if (!/^[A-Za-z0-9._-]+$/.test(target)) {
      throw new Error(`Invalid GitHub CLI command name: "${target}"`)
    }
    return target
  }
  if (!isAbsolute(target)) {
    throw new Error(`Configured ghPath with path separators must be an absolute path: "${target}"`)
  }
  try {
    const st = await stat(target)
    if (!st.isFile()) {
      throw new Error(`Configured ghPath is not a regular file: "${target}"`)
    }
    await access(target, constants.X_OK)
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error(`Configured ghPath binary does not exist: "${target}"`)
    }
    if (error?.code === 'EACCES') {
      throw new Error(`Configured ghPath binary is not executable: "${target}"`)
    }
    throw error
  }
  return target
}

function issueUrl(output) {
  return (
    String(output || '').match(
      /https:\/\/github\.com\/[^\/\s]+\/[^\/\s]+\/issues\/\d+/,
    )?.[0] || ''
  )
}

export async function createIssueWithAttachments({
  ghPath = 'gh',
  repository,
  draft,
  token,
  attachments,
  timeoutMs = 30000,
  exec = execFileAsync,
}) {
  const files = normalizeAttachments(attachments)
  if (!files.length) {
    throw new Error('At least one screenshot is required for attachment upload')
  }

  validateAttachmentToken(token)
  const binaryPath = await validateGhPath(ghPath)
  const workDir = await mkdtemp(join(tmpdir(), 'dsh-issue-reporter-'))
  await chmod(workDir, 0o700).catch((err) => { void err })
  try {
    const bodyPath = join(workDir, 'issue.md')
    await writeFile(bodyPath, draft.body || '', { encoding: 'utf8', mode: 0o600 })
    await chmod(bodyPath, 0o600).catch((err) => { void err })

    const args = [
      'issue',
      'create',
      '--repo',
      repository.fullName,
      '--title',
      draft.title,
      '--body-file',
      bodyPath,
    ]

    for (const [index, file] of files.entries()) {
      const filePath = join(
        workDir,
        'attachment-' + (index + 1) + extname(file.name).toLowerCase(),
      )
      await writeFile(filePath, file.data, { mode: 0o600 })
      await chmod(filePath, 0o600).catch((err) => { void err })
      args.push('--attach', filePath + '#' + file.name)
    }

    try {
      const result = await exec(binaryPath, args, {
        env: buildSafeEnv(token),
        timeout: Math.max(1000, Number(timeoutMs) || 30000),
        maxBuffer: 1024 * 1024,
        windowsHide: true,
      })
      const url = issueUrl(result.stdout) || issueUrl(result.stderr)
      if (!url) {
        throw new Error('GitHub CLI did not return the created issue URL')
      }
      return { url, number: Number(url.split('/').pop()) }
    } catch (error) {
      const output = [error?.stdout, error?.stderr, error?.message]
        .filter(Boolean)
        .join('\n')
      if (error?.code === 'ENOENT') {
        throw new Error('GitHub CLI 2.99 or newer is required for screenshot attachments')
      }
      if (/unknown flag.*attach|unknown shorthand flag.*attach/i.test(output)) {
        throw new Error('GitHub CLI 2.99 or newer is required for screenshot attachments')
      }
      if (/GitHub App tokens? (are )?unsupported/i.test(output)) {
        throw new Error(
          'This GitHub authorization cannot upload screenshots; use a GitHub OAuth or personal access token',
        )
      }
      const scrubbed = redactText(typeof token === 'string' && token ? output.replaceAll(token, '[redacted token]') : output).text
      throw new Error(scrubbed.slice(-1000) || 'Could not upload screenshots to GitHub')
    }
  } finally {
    await rm(workDir, { recursive: true }).catch((error) => {
      if (error?.code !== 'ENOENT') process.emitWarning('Could not clean temporary screenshot files', { code: 'DSH_ISSUE_REPORTER_CLEANUP' })
    })
  }
}
