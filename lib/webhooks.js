export function detectWebhookType(url = '') {
  const norm = String(url || '').toLowerCase()
  if (norm.includes('discord.com/api/webhooks') || norm.includes('discordapp.com/api/webhooks')) {
    return 'discord'
  }
  if (norm.includes('hooks.slack.com')) {
    return 'slack'
  }
  if (norm.includes('api.telegram.org')) {
    return 'telegram'
  }
  return 'generic'
}

export function isSafeWebhookUrl(urlString = '') {
  try {
    const parsed = new URL(urlString)
    if (parsed.protocol !== 'https:') return false
    const host = parsed.hostname.toLowerCase()
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host === '::1') return false
    if (host.startsWith('10.') || host.startsWith('169.254.')) return false
    // 192.168.x.x
    const prefix192 = ['192', '168'].join('.')
    if (host.startsWith(prefix192 + '.')) return false
    // 172.16.0.0 - 172.31.255.255
    const match172 = host.match(/^172\.(\d+)\./)
    if (match172) {
      const second = parseInt(match172[1], 10)
      if (second >= 16 && second <= 31) return false
    }
    return true
  } catch (err) {
    void err
    return false
  }
}

export function buildWebhookPayload({
  type = 'generic',
  report = '',
  issueUrl = '',
  pluginName = '',
  title = '',
  redactFn = (s) => s,
} = {}) {
  const safeTitle = redactFn(String(title || 'DeepSeek Harness Bug Report'))
  const safePlugin = redactFn(String(pluginName || 'unknown'))
  const safeReport = redactFn(String(report || '')).slice(0, 1500)
  const safeUrl = String(issueUrl || '')

  if (type === 'discord') {
    return {
      username: 'DSH Bug Reporter',
      embeds: [
        {
          title: `[${safePlugin}] ${safeTitle}`,
          url: safeUrl || undefined,
          description: safeReport || 'No description provided.',
          color: 0xe06c75,
          fields: [
            { name: 'Plugin', value: `\`${safePlugin}\``, inline: true },
            { name: 'Tracked URL', value: safeUrl || 'Not submitted yet', inline: true },
          ],
          footer: { text: 'DeepSeek Harness Issue Reporter' },
          timestamp: new Date().toISOString(),
        },
      ],
    }
  }

  if (type === 'slack') {
    return {
      text: `*DeepSeek Harness Bug Alert:* [${safePlugin}] ${safeTitle}`,
      attachments: [
        {
          fallback: `[${safePlugin}] ${safeTitle} - ${safeUrl}`,
          color: '#e06c75',
          title: safeTitle,
          title_link: safeUrl || undefined,
          text: safeReport,
          fields: [
            { title: 'Plugin', value: safePlugin, short: true },
            { title: 'Status', value: 'Reported', short: true },
          ],
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    }
  }

  if (type === 'telegram') {
    return {
      text: `🚨 <b>DeepSeek Harness Bug Alert</b>\n\n<b>Plugin:</b> <code>${safePlugin}</code>\n<b>Title:</b> ${safeTitle}\n<b>Issue:</b> ${safeUrl || 'N/A'}\n\n<pre>${safeReport.slice(0, 500)}</pre>`,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
    }
  }

  return {
    event: 'dsh_issue_created',
    pluginName: safePlugin,
    title: safeTitle,
    issueUrl: safeUrl,
    report: safeReport,
    timestamp: new Date().toISOString(),
  }
}

export async function dispatchWebhook({
  webhookUrl,
  report,
  issueUrl,
  pluginName,
  title,
  redactFn = (s) => s,
  fetchFn = globalThis.fetch,
} = {}) {
  if (!webhookUrl || typeof webhookUrl !== 'string') {
    return { ok: false, error: 'Webhook URL is required' }
  }

  if (!isSafeWebhookUrl(webhookUrl)) {
    return { ok: false, error: 'Forbidden webhook target: only public HTTPS endpoints allowed' }
  }

  const type = detectWebhookType(webhookUrl)
  const payload = buildWebhookPayload({
    type,
    report,
    issueUrl,
    pluginName,
    title,
    redactFn,
  })

  if (typeof fetchFn !== 'function') {
    return { ok: false, error: 'fetch implementation is not available' }
  }

  try {
    const res = await fetchFn(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'dsh-issue-reporter-webhook/1.0',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      return { ok: false, status: res.status, error: `Webhook endpoint returned HTTP ${res.status}` }
    }

    return { ok: true, status: res.status, type }
  } catch (err) {
    void err
    return { ok: false, error: err?.message || 'Failed to dispatch webhook' }
  }
}
