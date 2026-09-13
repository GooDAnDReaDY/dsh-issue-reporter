window.__ModuleLoader__.load({
  id: '@goodandready/dsh-issue-reporter',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    const React = require('react')
    const h = React.createElement
    const NS = 'dsh-issue-reporter'

    const en = {
      title: 'GitHub issue reporter',
      description: 'Turn a DSH plugin problem into a reviewable GitHub issue.',
      refresh: 'Refresh inventory',
      loading: 'Loading...',
      empty: 'No installed plugins were found.',
      unsupported: 'No public GitHub repository metadata',
      report: 'Report a bug',
      close: 'Close',
      observed: 'What happened?',
      reproduction: 'Steps to reproduce',
      expected: 'What did you expect?',
      titleField: 'Issue title',
      environment: 'Environment (optional)',
      preview: 'Build safe preview',
      previewTitle: 'Preview',
      redactions: 'Redactions',
      duplicates: 'Possible duplicates',
      noDuplicates: 'No similar open issues found.',
      auth: 'GitHub authorization',
      appClientId: 'GitHub App client id',
      tokenEnv: 'Credential reference',
      apiBaseUrl: 'GitHub API base URL',
      save: 'Save settings',
      saved: 'Settings saved',
      authorize: 'Authorize GitHub',
      code: 'Enter this code at GitHub',
      openVerification: 'Open GitHub verification',
      waiting: 'Waiting for authorization...',
      connected: 'GitHub connected',
      authRequired: 'Connect GitHub to search duplicates or create an issue.',
      authHelp: 'Sign in to search duplicates and create issues. Your token stays in DSH Credentials.',
      signIn: 'Sign in with GitHub',
      authUnavailable: 'GitHub sign-in is not configured for this installation.',
      nativePlugins: 'Native DSH plugins',
      thirdPartyPlugins: 'Third-party plugins',
      noNativePlugins: 'No native DSH plugins are installed.',
      noThirdPartyPlugins: 'No third-party plugins are installed.',
      review: 'I reviewed the sanitized preview.',
      create: 'Create GitHub issue',
      created: 'Issue created',
      fallback: 'Open prefilled issue form',
      error: 'Something went wrong',
      cancel: 'Cancel',
      enabled: 'enabled',
      disabled: 'disabled',
    }
const zh = {
      title: '\u95ee\u9898\u62a5\u544a',
      description: '\u5c06 DSH \u63d2\u4ef6\u95ee\u9898\u6574\u7406\u6210\u53ef\u5ba1\u6838\u7684 GitHub issue\u3002',
      refresh: '\u5237\u65b0\u63d2\u4ef6\u5217\u8868',
      loading: '\u52a0\u8f7d\u4e2d\u2026',
      empty: '\u672a\u627e\u5230\u5df2\u5b89\u88c5\u7684\u63d2\u4ef6\u3002',
      unsupported: '\u6ca1\u6709\u516c\u5f00\u7684 GitHub \u4ed3\u5e93\u4fe1\u606f',
      report: '\u62a5\u544a\u95ee\u9898',
      close: '\u5173\u95ed',
      observed: '\u53d1\u751f\u4e86\u4ec0\u4e48\uff1f',
      reproduction: '\u590d\u73b0\u6b65\u9aa4',
      expected: '\u9884\u671f\u884c\u4e3a',
      titleField: '\u95ee\u9898\u6807\u9898',
      environment: '\u73af\u5883\u4fe1\u606f\uff08\u53ef\u9009\uff09',
      preview: '\u751f\u6210\u5b89\u5168\u9884\u89c8',
      previewTitle: '\u9884\u89c8',
      redactions: '\u5df2\u9690\u85cf\u5185\u5bb9',
      duplicates: '\u53ef\u80fd\u7684\u91cd\u590d issue',
      noDuplicates: '\u6ca1\u6709\u627e\u5230\u76f8\u4f3c\u7684\u5f00\u653e issue\u3002',
      auth: 'GitHub \u6388\u6743',
      appClientId: 'GitHub App \u5ba2\u6237\u7aef ID',
      tokenEnv: '\u51ed\u636e\u5f15\u7528',
      apiBaseUrl: 'GitHub API \u5730\u5740',
      save: '\u4fdd\u5b58\u8bbe\u7f6e',
      saved: '\u8bbe\u7f6e\u5df2\u4fdd\u5b58',
      authorize: '\u6388\u6743 GitHub',
      code: '\u5728 GitHub \u8f93\u5165\u6b64\u4ee3\u7801',
      openVerification: '\u6253\u5f00 GitHub \u9a8c\u8bc1\u9875',
      waiting: '\u7b49\u5f85\u6388\u6743\u2026',
      connected: 'GitHub \u5df2\u8fde\u63a5',
      authRequired: '\u8fde\u63a5 GitHub \u540e\u624d\u80fd\u641c\u7d22\u91cd\u590d\u9879\u6216\u521b\u5efa issue\u3002',
      authHelp: '\u767b\u5f55\u540e\u53ef\u641c\u7d22\u91cd\u590d\u9879\u5e76\u521b\u5efa issue\u3002\u4ee4\u724c\u4fdd\u5b58\u5728 DSH Credentials \u4e2d\u3002',
      signIn: '\u4f7f\u7528 GitHub \u767b\u5f55',
      authUnavailable: '\u6b64 DSH \u5b89\u88c5\u672a\u914d\u7f6e GitHub \u767b\u5f55\u3002',
      nativePlugins: '\u539f\u751f DSH \u63d2\u4ef6',
      thirdPartyPlugins: '\u7b2c\u4e09\u65b9 DSH \u63d2\u4ef6',
      noNativePlugins: '\u672a\u5b89\u88c5\u539f\u751f DSH \u63d2\u4ef6\u3002',
      noThirdPartyPlugins: '\u672a\u5b89\u88c5\u7b2c\u4e09\u65b9 DSH \u63d2\u4ef6\u3002',
      review: '\u6211\u5df2\u68c0\u67e5\u5b89\u5168\u9884\u89c8\u3002',
      create: '\u521b\u5efa GitHub issue',
      created: 'issue \u5df2\u521b\u5efa',
      fallback: '\u6253\u5f00\u9884\u586b\u5145\u7684 issue \u8868\u5355',
      error: '\u53d1\u751f\u9519\u8bef',
      cancel: '\u53d6\u6d88',
      enabled: '\u5df2\u542f\u7528',
      disabled: '\u5df2\u7981\u7528',
    }

    function useLocale(ctx) {
      return React.useSyncExternalStore(
        React.useMemo(() => (cb) => ctx.locale?.subscribe?.(cb) || (() => {}), [ctx]),
        React.useCallback(() => ctx.locale?.getSnapshot?.().active || 'en', [ctx]),
      )
    }

    async function jsonRequest(path, options) {
      const response = await fetch(path, {
        ...options,
        headers: { 'content-type': 'application/json', ...(options?.headers || {}) },
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.error || 'Request failed')
      return body
    }

    function Field({ label, value, onChange, multiline = false }) {
      const props = { value: value || '', onChange: (event) => onChange(event.currentTarget.value), style: { display: 'block', width: '100%', boxSizing: 'border-box', marginTop: 4, padding: '7px 8px', borderRadius: 6, border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-1)', color: 'inherit' } }
      return h('label', { style: { display: 'block', marginTop: 8 } }, label, multiline ? h('textarea', { ...props, rows: 4 }) : h('input', { ...props }))
    }

    function SettingsCard({ ctx }) {
      const locale = useLocale(ctx)
      const t = locale.startsWith('zh') ? zh : en
      const [status, setStatus] = React.useState(null)
      const [error, setError] = React.useState('')
      const [open, setOpen] = React.useState(false)
      const [plugins, setPlugins] = React.useState([])
      const [editor, setEditor] = React.useState(null)
      const [draft, setDraft] = React.useState({ title: '', observed: '', reproduction: '', expected: '', environment: '' })
      const [preview, setPreview] = React.useState(null)
      const [duplicates, setDuplicates] = React.useState([])
      const [busy, setBusy] = React.useState(false)
      const [reviewed, setReviewed] = React.useState(false)
      const [auth, setAuth] = React.useState(null)
      const pollTimer = React.useRef(null)

      const load = React.useCallback(async () => {
        setError('')
        try {
          const result = await jsonRequest('/dsh-issue-reporter/status')
          let remoteSnapshot
          try { remoteSnapshot = await ctx.remote?.pluginInventory?.list?.() } catch {}
          const remoteRows = new Map((remoteSnapshot?.entries || []).map((row) => [row.moduleName, row]))
          const merged = (result.plugins || []).map((plugin) => ({ ...plugin, ...(remoteRows.get(plugin.moduleName) || {}) }))
          setStatus(result)
          setPlugins(merged)
        } catch (reason) { setError(reason.message) }
      }, [ctx])

      React.useEffect(() => () => { if (pollTimer.current) clearTimeout(pollTimer.current) }, [])
      React.useEffect(() => { if (open) load() }, [open, load])

      const startAuth = async () => {
        setBusy(true); setError('')
        try {
          const result = await jsonRequest('/dsh-issue-reporter/device/start', { method: 'POST', body: '{}' })
          setAuth(result)
          const poll = async () => {
            try {
              const next = await jsonRequest('/dsh-issue-reporter/device/poll', { method: 'POST', body: JSON.stringify({ flowId: result.flowId }) })
              if (next.authenticated) { setAuth({ connected: true }); await load(); setBusy(false); return }
              pollTimer.current = setTimeout(poll, Math.max(3000, next.retryAfterMs || 5000))
            } catch (reason) { setError(reason.message); setBusy(false) }
          }
          pollTimer.current = setTimeout(poll, Math.max(3000, result.interval ? result.interval * 1000 : 5000))
        } catch (reason) { setError(reason.message); setBusy(false) }
      }

      const openReport = (plugin) => {
        setEditor(plugin)
        setPreview(null)
        setDuplicates([])
        setReviewed(false)
        setDraft({ title: 'Bug in ' + plugin.displayName, observed: '', reproduction: '', expected: '', environment: '' })
      }

      const buildPreview = async () => {
        setBusy(true); setError('')
        try {
          const result = await jsonRequest('/dsh-issue-reporter/draft', {
            method: 'POST',
            body: JSON.stringify({
              repository: editor.repository,
              draft: { ...draft, pluginContext: editor.displayName + (editor.version ? ' ' + editor.version : '') },
            }),
          })
          setPreview(result)
          setReviewed(false)
          try {
            const duplicateResult = await jsonRequest('/dsh-issue-reporter/duplicates', {
              method: 'POST',
              body: JSON.stringify({
                repository: editor.repository,
                draft: { ...draft, pluginContext: editor.displayName + (editor.version ? ' ' + editor.version : '') },
              }),
            })
            setDuplicates(duplicateResult.items || [])
          } catch {}
        } catch (reason) { setError(reason.message) }
        setBusy(false)
      }

      const createIssue = async () => {
        if (!preview || !reviewed) return
        setBusy(true); setError('')
        try {
          const result = await jsonRequest('/dsh-issue-reporter/create', {
            method: 'POST',
            body: JSON.stringify({
              confirm: true,
              repository: editor.repository,
              draft: { ...draft, pluginContext: editor.displayName + (editor.version ? ' ' + editor.version : '') },
            }),
          })
          setAuth((current) => ({ ...(current || {}), result }))
        } catch (reason) { setError(reason.message) }
        setBusy(false)
      }

      const previewPanel = preview ? h('div', { style: { marginTop: 10, padding: 10, borderRadius: 8, background: 'var(--dsw-alias-bg-layer-2)' } }, [
        h('strong', null, t.previewTitle),
        h('h4', { style: { margin: '8px 0' } }, preview.draft.title),
        h('pre', { style: { whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 } }, preview.draft.body || '-'),
        h('p', null, t.redactions + ': ' + (preview.draft.redactions.length ? preview.draft.redactions.join(', ') : 'none')),
        h('strong', null, t.duplicates),
        duplicates.length
          ? h('ul', null, duplicates.map((item) => h('li', { key: item.number }, h('a', { href: item.html_url, target: '_blank', rel: 'noopener noreferrer' }, '#' + item.number + ' ' + item.title))))
          : h('p', null, t.noDuplicates),
        status?.config?.tokenConfigured
          ? h('label', { style: { display: 'block', marginTop: 8 } }, [
              h('input', { type: 'checkbox', checked: reviewed, onChange: (event) => setReviewed(event.currentTarget.checked) }),
              ' ' + t.review,
            ])
          : null,
        h('div', { style: { display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' } }, [
          h('button', { type: 'button', onClick: createIssue, disabled: busy || !reviewed || !status?.config?.tokenConfigured }, t.create),
          h('a', { href: preview.prefilledUrl, target: '_blank', rel: 'noopener noreferrer' }, t.fallback),
        ]),
      ]) : null

      const editorPanel = editor ? h('section', { style: { marginTop: 14, paddingTop: 10, borderTop: '2px solid var(--dsw-alias-border-l1)' } }, [
        h('div', { style: { display: 'flex', justifyContent: 'space-between' } }, [
          h('strong', null, t.report + ': ' + editor.displayName),
          h('button', { type: 'button', onClick: () => setEditor(null) }, t.close),
        ]),
        h(Field, { label: t.titleField, value: draft.title, onChange: (value) => setDraft({ ...draft, title: value }) }),
        h(Field, { label: t.observed, value: draft.observed, onChange: (value) => setDraft({ ...draft, observed: value }), multiline: true }),
        h(Field, { label: t.reproduction, value: draft.reproduction, onChange: (value) => setDraft({ ...draft, reproduction: value }), multiline: true }),
        h(Field, { label: t.expected, value: draft.expected, onChange: (value) => setDraft({ ...draft, expected: value }), multiline: true }),
        h(Field, { label: t.environment, value: draft.environment, onChange: (value) => setDraft({ ...draft, environment: value }), multiline: true }),
        h('button', { type: 'button', onClick: buildPreview, disabled: busy || !draft.title.trim() }, t.preview),
        previewPanel,
        error ? h('p', { role: 'alert', style: { color: 'var(--dsw-alias-state-error-primary)' } }, t.error + ': ' + error) : null,
      ]) : null

      const renderPlugin = (plugin) => {
        const rowStyle = {
          display: 'flex',
          justifyContent: 'space-between',
          gap: 8,
          alignItems: 'center',
          padding: '8px 0',
          borderBottom: '1px solid var(--dsw-alias-border-l1)',
          width: '100%',
          boxSizing: 'border-box',
          textAlign: 'left',
          font: 'inherit',
          color: 'inherit',
          background: 'transparent',
          borderTop: 0,
          borderLeft: 0,
          borderRight: 0,
          cursor: plugin.supported && !busy ? 'pointer' : 'default',
        }
        const content = [
          h('div', null, [
            h('strong', null, plugin.displayName),
            h('small', { style: { display: 'block', color: 'var(--dsw-alias-label-secondary)' } }, plugin.repository ? plugin.repository.fullName : t.unsupported),
          ]),
          plugin.supported
            ? null
            : h('span', null, plugin.enabled ? t.enabled : t.disabled),
        ]
        return plugin.supported
          ? h('button', {
              key: plugin.moduleName + (plugin.presetId || ''),
              type: 'button',
              onClick: () => openReport(plugin),
              disabled: busy,
              title: t.report,
              'aria-label': t.report + ': ' + plugin.displayName,
              style: rowStyle,
            }, content)
          : h('div', { key: plugin.moduleName + (plugin.presetId || ''), style: rowStyle }, content)
      }

      const renderGroup = (title, emptyLabel, items) => h('details', { open: true, style: { marginTop: 10 } }, [
        h('summary', { style: { cursor: 'pointer', fontWeight: 600 } }, title + ' (' + items.length + ')'),
        items.length ? items.map(renderPlugin) : h('p', { style: { color: 'var(--dsw-alias-label-secondary)' } }, emptyLabel),
      ])

      const nativePlugins = plugins.filter((plugin) => plugin.category === 'native')
      const thirdPartyPlugins = plugins.filter((plugin) => plugin.category !== 'native')

      const body = open
        ? h('div', null, [
            h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' } }, [
              h('button', { type: 'button', onClick: load, disabled: busy }, t.refresh),
              status?.config?.tokenConfigured
                ? h('span', null, '* ' + t.connected)
                : h('span', null, status?.config?.signInConfigured ? t.authRequired : t.authUnavailable),
            ]),
            h('section', { style: { marginTop: 12, paddingTop: 8, borderTop: '1px solid var(--dsw-alias-border-l1)' } }, [
              h('strong', null, t.auth),
              h('p', { style: { color: 'var(--dsw-alias-label-secondary)' } }, t.authHelp),
              status?.config?.tokenConfigured
                ? h('p', null, t.connected)
                : status?.config?.signInConfigured
                  ? h('button', { type: 'button', onClick: startAuth, disabled: busy }, t.signIn)
                  : h('p', null, t.authUnavailable),
              auth?.userCode ? h('p', null, [
                t.code + ': ',
                h('strong', null, auth.userCode),
                ' ',
                h('a', { href: auth.verificationUri, target: '_blank', rel: 'noopener noreferrer' }, t.openVerification),
                h('br'),
                t.waiting,
              ]) : null,
              auth?.connected ? h('p', null, t.connected) : null,
              auth?.result?.issue?.url ? h('p', null, [t.created + ' ', h('a', { href: auth.result.issue.url, target: '_blank', rel: 'noopener noreferrer' }, auth.result.issue.url)]) : null,
            ]),
            h('section', { style: { marginTop: 12 } }, status === null && !error ? h('p', null, t.loading) : plugins.length === 0
              ? h('p', null, t.empty)
              : [
                renderGroup(t.nativePlugins, t.noNativePlugins, nativePlugins),
                renderGroup(t.thirdPartyPlugins, t.noThirdPartyPlugins, thirdPartyPlugins),
              ],
            ),
            editorPanel,
            error && !editor ? h('p', { role: 'alert', style: { color: 'var(--dsw-alias-state-error-primary)' } }, t.error + ': ' + error) : null,
          ]) : null

      const cardBodyId = NS + '-body'
      return h('li', { style: { listStyle: 'none', padding: 12, borderRadius: 10, border: '1px solid var(--dsw-alias-border-l1)' } },
        h('button', {
          type: 'button',
          onClick: () => setOpen(!open),
          'aria-expanded': open,
          'aria-controls': cardBodyId,
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            gap: 8,
            alignItems: 'center',
            width: '100%',
            padding: 0,
            textAlign: 'left',
            font: 'inherit',
            color: 'inherit',
            background: 'transparent',
            border: 0,
            cursor: 'pointer',
          },
        }, [
          h('span', null, [
            h('strong', null, t.title),
            h('small', { style: { display: 'block', marginTop: 4, color: 'var(--dsw-alias-label-secondary)' } }, t.description),
          ]),
          h('span', { 'aria-hidden': 'true' }, open ? '⌃' : '⌄'),
        ]),
        body ? h('div', { id: cardBodyId }, body) : null)
    }

    function apply(ctx) {
      ctx.effect(() => {
        try { ctx.locale?.register?.(NS, { en, zh }) } catch {}
        return () => {}
      }, 'dsh-issue-reporter: dictionaries')
      try {
        ctx.slots.inject('settings.plugin.item', () => ctx.slots.register({
          name: 'settings.plugin.item',
          key: NS,
          locale: NS,
          inject: () => ({ ctx }),
        }, (props) => h(SettingsCard, { ...props, ctx })))
      } catch {}
    }

    module.exports = { apply, inject: ['slots', 'locale', 'remote', 'remote.pluginInventory'] }
    return module.exports
  },
})
