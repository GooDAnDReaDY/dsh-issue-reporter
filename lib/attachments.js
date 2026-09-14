import { execFile } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, extname, join } from 'node:path'
import { promisify } from 'node:util'

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
}) {
  const files = normalizeAttachments(attachments)
  if (!files.length) {
    throw new Error('At least one screenshot is required for attachment upload')
  }

  const workDir = await mkdtemp(join(tmpdir(), 'dsh-issue-reporter-'))
  try {
    const bodyPath = join(workDir, 'issue.md')
    await writeFile(bodyPath, draft.body || '', 'utf8')

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
      await writeFile(filePath, file.data)
      args.push('--attach', filePath + '#' + file.name)
    }

    try {
      const result = await execFileAsync(ghPath, args, {
        env: { ...process.env, GH_TOKEN: token },
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
      throw new Error(output.slice(-1000) || 'Could not upload screenshots to GitHub')
    }
  } finally {
    await rm(workDir, { recursive: true }).catch(() => {})
  }
}
