    function SettingsCardInner({ ctx }) {
      ensureCss()
      const locale = useLocale(ctx)
      const t = locale.startsWith('zh') ? zh : en
      const [status, setStatus] = React.useState(null)
      const [error, setError] = React.useState('')
      const [open, setOpen] = React.useState(false)
      const [plugins, setPlugins] = React.useState([])
      const [editor, setEditor] = React.useState(null)
      const [activeTab, setActiveTab] = React.useState('catalog')
      const [editorMode, setEditorMode] = React.useState('write')
      const [searchQuery, setSearchQuery] = React.useState('')
      const [draft, setDraft] = React.useState(() => {
        try {
          const saved = sessionStorage.getItem('dsh_issue_reporter_draft')
          if (saved) return JSON.parse(saved)
        } catch {
          ignoreOptionalFailure(ctx, 'Saved draft restore')
        }
        return { title: '', observed: '', reproduction: '', expected: '', environment: '', errorStack: '' }
      })

      React.useEffect(() => {
        try {
          const hasContent = Object.values(draft).some((v) => typeof v === 'string' && v.trim().length > 0)
          if (hasContent) {
            sessionStorage.setItem('dsh_issue_reporter_draft', JSON.stringify(draft))
          } else {
            sessionStorage.removeItem('dsh_issue_reporter_draft')
          }
        } catch {
          ignoreOptionalFailure(ctx, 'Saved draft persistence')
        }
      }, [draft])
      const [preview, setPreview] = React.useState(null)
      const [duplicates, setDuplicates] = React.useState([])
      const [includeClosed, setIncludeClosed] = React.useState(false)
      const [busy, setBusy] = React.useState(false)
      const [reviewed, setReviewed] = React.useState(false)
      const [auth, setAuth] = React.useState(null)
      const [copied, setCopied] = React.useState(false)
      const [attachments, setAttachments] = React.useState([])
      const [isDragging, setIsDragging] = React.useState(false)

      // Roadmap & Updater state
      const [updater, setUpdater] = React.useState(null)
      const [updating, setUpdating] = React.useState(false)
      const [updateNotice, setUpdateNotice] = React.useState('')
      const [updateNoticeError, setUpdateNoticeError] = React.useState(false)
      const [aiBusy, setAiBusy] = React.useState(false)
      const [aiNotice, setAiNotice] = React.useState('')
      const [logsOpen, setLogsOpen] = React.useState(false)
      const [logsLoading, setLogsLoading] = React.useState(false)
      const [availableLogs, setAvailableLogs] = React.useState([])
      const [selectedLogs, setSelectedLogs] = React.useState([])
      const [availableLabels, setAvailableLabels] = React.useState([])
      const [selectedLabels, setSelectedLabels] = React.useState([])

      const [submittedReports, setSubmittedReports] = React.useState(() => {
        try {
          const raw = localStorage.getItem('dsh_issue_reporter_history')
          return raw ? JSON.parse(raw) : []
        } catch {
          ignoreOptionalFailure(ctx, 'Submitted report history restore')
          return []
        }
      })
      const pollTimer = React.useRef(null)
      const fileInputRef = React.useRef(null)

      const saveReports = (items) => {
        setSubmittedReports(items)
        try { localStorage.setItem('dsh_issue_reporter_history', JSON.stringify(items.slice(0, 50))) } catch {
          ignoreOptionalFailure(ctx, 'Submitted report history persistence')
        }
      }

      const checkUpdater = React.useCallback(async () => {
        try {
          const res = await jsonRequest('/dsh-issue-reporter/update')
          if (res) setUpdater(res)
        } catch (reason) {
          setUpdateNotice(Number.isInteger(reason?.status)
            ? t.updateCheckFailed + ' (HTTP ' + reason.status + ')'
            : t.updateCheckFailed)
          setUpdateNoticeError(true)
        }
      }, [t])

      const load = React.useCallback(async () => {
        setError('')
        try {
          const result = await jsonRequest('/dsh-issue-reporter/status')
          const remoteSnapshot = await loadRemoteInventory(ctx)
          const remoteRows = new Map((remoteSnapshot?.entries || []).map((row) => [row.moduleName, row]))
          const merged = (result.plugins || []).map((plugin) => ({ ...plugin, ...(remoteRows.get(plugin.moduleName) || {}) }))
          setStatus(result)
          setPlugins(merged)
        } catch (reason) { setError(reason.message) }
      }, [ctx])

      React.useEffect(() => () => { if (pollTimer.current) clearTimeout(pollTimer.current) }, [])
      React.useEffect(() => {
        checkUpdater()
        if (open) load()
      }, [open, load, checkUpdater])

      const triggerUpdate = async () => {
        if (updating || !updater?.updateAvailable) return
        setUpdating(true)
        setUpdateNotice('')
        setUpdateNoticeError(false)
        try {
          const res = await jsonRequest('/dsh-issue-reporter/update', {
            method: 'POST',
            headers: { 'x-dsh-plugin-update': '1', 'content-type': 'application/json' },
          })
          if (res?.restartRequired) {
            setUpdateNotice(t.updateSuccess)
            setUpdateNoticeError(false)
            setUpdater((prev) => ({ ...prev, currentVersion: res.updatedVersion, updateAvailable: false }))
          } else {
            setUpdateNotice(res?.error || t.updateFailed)
            setUpdateNoticeError(true)
          }
        } catch (err) {
          setUpdateNotice(err?.message || t.updateFailed)
          setUpdateNoticeError(true)
        } finally {
          setUpdating(false)
        }
      }

      const handleAiOptimize = async () => {
        if (aiBusy) return
        setAiBusy(true)
        setAiNotice('')
        try {
          const res = await jsonRequest('/dsh-issue-reporter/ai/optimize', {
            method: 'POST',
            body: JSON.stringify({
              observed: draft.observed,
              reproduction: draft.reproduction,
              expected: draft.expected,
              environment: draft.environment,
              errorStack: draft.errorStack,
              pluginName: editor?.displayName,
            }),
          })
          if (res?.optimized) {
            setDraft((prev) => ({
              ...prev,
              title: res.optimized.title || prev.title,
              observed: res.optimized.observed || prev.observed,
              reproduction: res.optimized.reproduction || prev.reproduction,
              expected: res.optimized.expected || prev.expected,
            }))
            setAiNotice(t.aiOptimized)
          }
        } catch (err) {
          setAiNotice(t.aiOptimizeError + ': ' + (err?.message || ''))
        } finally {
          setAiBusy(false)
        }
      }

      const fetchLogs = async () => {
        setLogsOpen(true)
        setLogsLoading(true)
        try {
          const res = await jsonRequest('/dsh-issue-reporter/logs?limit=20')
          if (res?.logs) setAvailableLogs(res.logs)
          if (res?.unavailable) setError(t.logsUnavailable)
        } catch {
          setAvailableLogs([])
          setError(t.logsUnavailable)
        } finally {
          setLogsLoading(false)
        }
      }

      const insertSelectedLogs = () => {
        const lines = selectedLogs.map((idx) => availableLogs[idx]).filter(Boolean).map((l) => l.message).join('\n')
        if (lines) {
          setDraft((prev) => ({
            ...prev,
            environment: (prev.environment ? prev.environment + '\n\nRecent logs:\n```text\n' + lines + '\n```' : 'Recent logs:\n```text\n' + lines + '\n```'),
          }))
          setLogsOpen(false)
          setSelectedLogs([])
        }
      }

      const refreshAllStatuses = async () => {
        if (!submittedReports.length) return
        setBusy(true)
        try {
          const res = await jsonRequest('/dsh-issue-reporter/issues/batch-status', {
            method: 'POST',
            body: JSON.stringify({
              items: submittedReports.map((r) => ({ repository: r.repo, number: r.number })),
            }),
          })
          if (res?.statuses) {
            const statusMap = new Map(res.statuses.map((s) => [s.number, s]))
            const updated = submittedReports.map((r) => {
              const match = statusMap.get(r.number)
              return match ? { ...r, state: match.state, comments: match.comments } : r
            })
            saveReports(updated)
          }
        } catch {
          setError(t.statusesRefreshFailed)
        } finally {
          setBusy(false)
        }
      }

      const addFiles = async (filesToAdd) => {
        const combined = [...attachments]
        for (const file of filesToAdd) {
          if (combined.length >= MAX_ATTACHMENTS) {
            setError(t.attachmentTooMany)
            break
          }
          if (file.size > MAX_ATTACHMENT_BYTES) {
            setError(t.attachmentTooLarge)
            continue
          }
          try {
            const parsed = await readAttachment(file)
            combined.push(parsed)
          } catch {
            setError(t.attachmentReadError)
          }
        }
        const total = combined.reduce((sum, item) => sum + item.size, 0)
        if (total > MAX_ATTACHMENT_TOTAL_BYTES) {
          setError(t.attachmentTooLarge)
          return
        }
        setAttachments(combined)
        setError('')
      }

      React.useEffect(() => {
        if (!editor || activeTab !== 'editor') return
        const onPaste = async (event) => {
          const items = event.clipboardData?.items
          if (!items) return
          const imageFiles = []
          for (const item of items) {
            if (item.kind === 'file' && item.type.startsWith('image/')) {
              const file = item.getAsFile()
              if (file) {
                const ext = file.type.split('/')[1] || 'png'
                const namedFile = new File([file], 'pasted-screenshot-' + Date.now() + '.' + ext, { type: file.type })
                imageFiles.push(namedFile)
              }
            }
          }
          if (imageFiles.length) {
            event.preventDefault()
            await addFiles(imageFiles)
          }
        }
        window.addEventListener('paste', onPaste)
        return () => window.removeEventListener('paste', onPaste)
      }, [editor, activeTab, attachments])

      const startAuth = async () => {
        setBusy(true); setError('')
        try {
          const result = await jsonRequest('/dsh-issue-reporter/device/start', { method: 'POST', body: '{}' })
          setAuth({ ...result, error: '' })
          const poll = async () => {
            try {
              const next = await jsonRequest('/dsh-issue-reporter/device/poll', { method: 'POST', body: JSON.stringify({ flowId: result.flowId }) })
              if (next.authenticated) {
                setAuth({ connected: true, error: '' })
                setBusy(false)
                await load()
                return
              }
              pollTimer.current = setTimeout(poll, Math.max(3000, next.retryAfterMs || 5000))
            } catch (reason) {
              const message = reason instanceof Error ? reason.message : String(reason)
              setAuth((current) => ({ ...(current || {}), error: message }))
              setError(message)
              setBusy(false)
            }
          }
          pollTimer.current = setTimeout(poll, Math.max(3000, result.interval ? result.interval * 1000 : 5000))
        } catch (reason) {
          const message = reason instanceof Error ? reason.message : String(reason)
          setAuth({ error: message })
          setError(message)
          setBusy(false)
        }
      }

      const signOut = async () => {
        if (pollTimer.current) {
          clearTimeout(pollTimer.current)
          pollTimer.current = null
        }
        setBusy(true); setError('')
        try {
          await jsonRequest('/dsh-issue-reporter/device/logout', { method: 'POST', body: '{}' })
          setAuth({ signedOut: true, error: '' })
          setDuplicates([])
          setReviewed(false)
          await load()
        } catch (reason) {
          const message = reason instanceof Error ? reason.message : String(reason)
          setAuth((current) => ({ ...(current || {}), error: message }))
          setError(message)
        }
        setBusy(false)
      }

      const copyCode = async () => {
        if (!auth?.userCode) return
        try {
          await navigator.clipboard.writeText(auth.userCode)
          setCopied(true)
          setTimeout(() => setCopied(false), 2500)
        } catch {
          setError(t.copyCodeFailed)
        }
      }

      const openReport = (plugin) => {
        setEditor(plugin)
        setPreview(null)
        setDuplicates([])
        setReviewed(false)
        setAttachments([])
        setEditorMode('write')
        setActiveTab('editor')
        setAiNotice('')
        setLogsOpen(false)
        setSelectedLogs([])
        const isFailed = plugin.fiberPhase === 'failed' || Boolean(plugin.fiberError)
        setDraft({
          title: (isFailed ? 'Crash in ' : 'Bug in ') + plugin.displayName,
          observed: isFailed ? 'Plugin failed during execution.\n' + (plugin.fiberError || '') : '',
          reproduction: '',
          expected: '',
          environment: status?.diagnostics
            ? 'Node.js ' + status.diagnostics.node + ' (' + status.diagnostics.platform + ' ' + status.diagnostics.arch + ')'
            : '',
          errorStack: plugin.fiberError || '',
        })

        // Fetch suggested labels
        jsonRequest('/dsh-issue-reporter/labels', {
          method: 'POST',
          body: JSON.stringify({
            repository: plugin.repository,
            pluginName: plugin.displayName,
            description: plugin.fiberError || '',
            errorStack: plugin.fiberError || '',
          }),
        }).then((res) => {
          if (res?.labels) {
            setAvailableLabels(res.labels)
            setSelectedLabels(res.recommended || [])
          }
        }).catch(() => {
          setAvailableLabels([])
          setSelectedLabels([])
          setError(t.labelsUnavailable)
        })
      }

      const buildPreview = async () => {
        setBusy(true); setError('')
        try {
          const result = await jsonRequest('/dsh-issue-reporter/draft', {
            method: 'POST',
            body: JSON.stringify({
              repository: editor.repository,
              draft: { ...draft, labels: selectedLabels, pluginContext: editor.displayName + (editor.version ? ' ' + editor.version : '') },
            }),
          })
          setPreview(result)
          setReviewed(false)
          setEditorMode('preview')
          try {
            const duplicateResult = await jsonRequest('/dsh-issue-reporter/duplicates', {
              method: 'POST',
              body: JSON.stringify({
                repository: editor.repository,
                includeClosed,
                draft: { ...draft, pluginContext: editor.displayName + (editor.version ? ' ' + editor.version : '') },
              }),
            })
            setDuplicates(duplicateResult.items || [])
          } catch {
            setDuplicates([])
            setError(t.duplicateLookupFailed)
          }
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
              draft: { ...draft, labels: selectedLabels, pluginContext: editor.displayName + (editor.version ? ' ' + editor.version : '') },
              attachments,
            }),
          })
          setAuth((current) => ({ ...(current || {}), result }))
          if (result?.issue) {
            try { sessionStorage.removeItem('dsh_issue_reporter_draft') } catch {
              ignoreOptionalFailure(ctx, 'Submitted draft cleanup')
            }
            setDraft({ title: '', observed: '', reproduction: '', expected: '', environment: '', errorStack: '' })
            setAttachments([])
            setSelectedLabels([])
            setSelectedLogs([])
            setPreview(null)
            const newRecord = {
              id: Date.now().toString(),
              number: result.issue.number,
              title: result.issue.title,
              url: result.issue.url,
              repo: editor.repository.fullName,
              createdAt: new Date().toLocaleDateString(),
              state: 'open',
            }
            saveReports([newRecord, ...submittedReports])
          }
        } catch (reason) { setError(reason.message) }
        setBusy(false)
      }

      const refreshIssueStatus = async (item, index) => {
        try {
          const res = await jsonRequest('/dsh-issue-reporter/issue/status', {
            method: 'POST',
            body: JSON.stringify({ repository: item.repo, number: item.number }),
          })
          if (res?.state) {
            const updated = [...submittedReports]
            updated[index] = { ...item, state: res.state, comments: res.comments }
            saveReports(updated)
          }
        } catch {
          setError(t.issueStatusFailed)
        }
      }

      const { content: catalogContent, badges } = renderPluginCatalog({ h, plugins, searchQuery, setSearchQuery, busy, load, t, openReport, status, updater, locale, error })

      const dropzone = renderAttachmentDropzone({ h, t, isDragging, setIsDragging, addFiles, fileInputRef, attachments, setAttachments })

      const editorContent = renderIssueEditor({ h, Field, t, editor, editorMode, setEditorMode, draft, setDraft, availableLabels, selectedLabels, setSelectedLabels, logsOpen, insertSelectedLogs, logsLoading, availableLogs, selectedLogs, setSelectedLogs, aiNotice, dropzone, handleAiOptimize, aiBusy, busy, buildPreview, preview, reviewed, setReviewed, includeClosed, setIncludeClosed, duplicates, status, createIssue, attachments, locale })

      const reportsContent = renderReports({ h, t, refreshAllStatuses, busy, submittedReports, refreshIssueStatus })

      const authContent = renderAuthorization({ h, t, status, startAuth, busy, auth, copyCode, copied, signOut })

      const body = open ? h('div', { className: 'ir-page' }, [
        // One-click update banner
        updater?.updateAvailable ? h('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            background: 'color-mix(in srgb, var(--dsw-alias-state-warn-primary) 12%, transparent)',
            border: '1px solid var(--dsw-alias-state-warn-primary)',
            borderRadius: 8,
            marginBottom: 12,
            fontSize: 13,
          }
        }, [
          h('div', null, [
            h('strong', null, t.updateAvailable + ': '),
            ' v' + updater.currentVersion + ' → v' + updater.latestVersion,
          ]),
          h('button', {
            type: 'button',
            className: 'ir-btn ir-btn-sm ir-btn-primary',
            onClick: triggerUpdate,
            disabled: updating,
          }, updating ? t.updating : (t.updatePlugin + ' v' + updater.latestVersion)),
        ]) : null,

        updateNotice ? h('div', {
          className: updateNoticeError ? 'ir-alert-bad' : 'ir-alert-ok',
          style: { marginBottom: 12 },
        }, updateNotice) : null,

        h('nav', { className: 'ir-nav-tabs' }, [
          h('button', { type: 'button', className: 'ir-tab-btn' + (activeTab === 'catalog' ? ' active' : ''), onClick: () => setActiveTab('catalog') }, t.tabCatalog),
          h('button', { type: 'button', className: 'ir-tab-btn' + (activeTab === 'editor' ? ' active' : ''), onClick: () => setActiveTab('editor') }, t.tabEditor + (editor ? ' (' + editor.displayName + ')' : '')),
          h('button', { type: 'button', className: 'ir-tab-btn' + (activeTab === 'reports' ? ' active' : ''), onClick: () => setActiveTab('reports') }, t.tabReports + (submittedReports.length ? ' (' + submittedReports.length + ')' : '')),
          h('button', { type: 'button', className: 'ir-tab-btn' + (activeTab === 'auth' ? ' active' : ''), onClick: () => setActiveTab('auth') }, t.tabAuth),
        ]),

        error ? h('div', { className: 'ir-alert-bad' }, t.error + ': ' + error) : null,

        activeTab === 'catalog' ? catalogContent : null,
        activeTab === 'editor' ? editorContent : null,
        activeTab === 'reports' ? reportsContent : null,
        activeTab === 'auth' ? authContent : null,
      ]) : null

      const cardBodyId = NS + '-body'
      return h('li', { style: { listStyle: 'none', padding: 14, borderRadius: 12, border: '1px solid var(--dsw-alias-border-l1)', background: 'var(--dsw-alias-bg-layer-2)', marginBottom: 12 } },
        h('button', {
          type: 'button',
          onClick: () => setOpen(!open),
          'aria-expanded': open,
          'aria-controls': cardBodyId,
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
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
          h('div', null, [
            h('h2', { className: 'ir-title' }, t.title),
            h('p', { className: 'ir-sub' }, t.description),
            badges,
          ]),
          h('span', { className: 'ir-chevron' + (open ? ' ir-chevron-open' : ''), 'aria-hidden': 'true' },
            h(Chevron)
          ),
        ]),
        body ? h('div', { id: cardBodyId, style: { marginTop: 12 } }, body) : null
      )
    }

    function SettingsCard(props) {
      return h(ErrorBoundary, null, h(SettingsCardInner, props))
    }

    function apply(ctx) {
      ctx.effect(() => {
        try { ctx.locale?.register?.(NS, { en, zh }) } catch {
          ignoreOptionalFailure(ctx, 'Locale dictionary registration')
        }
        return () => {}
      }, 'dsh-issue-reporter: dictionaries')
      ctx.slots.inject('settings.plugin.item', () => ctx.slots.register({
          name: 'settings.plugin.item',
          key: NS,
          locale: NS,
          inject: () => ({ ctx }),
        }, (props) => h(SettingsCard, { ...props, ctx })))
    }

    module.exports = { apply, inject: ['slots', 'locale', 'remote', 'remote.pluginInventory'] }
    return module.exports
