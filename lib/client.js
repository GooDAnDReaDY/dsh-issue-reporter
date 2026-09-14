window.__ModuleLoader__.load({
  id: '@goodandready/dsh-issue-reporter',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    const React = require('react')
    const h = React.createElement
    const NS = 'dsh-issue-reporter'

    const en = {
      title: 'Issue Reporter',
      description: 'Turn a DSH plugin problem into a reviewable issue with automated diagnostics and previews.',
      refresh: 'Refresh inventory',
      loading: 'Loading inventory & status…',
      empty: 'No installed plugins were found.',
      unsupported: 'No public repository metadata',
      report: 'Report',
      close: 'Close',
      observed: 'What happened?',
      reproduction: 'Steps to reproduce',
      expected: 'What did you expect?',
      titleField: 'Issue title',
      environment: 'Environment details (optional)',
      preview: 'Build safe preview',
      previewTitle: 'Sanitized Issue Preview',
      redactions: 'Redactions applied',
      duplicates: 'Possible duplicate issues',
      noDuplicates: 'No similar open issues found.',
      auth: 'Authentication & Services',
      appClientId: 'GitHub OAuth App client id',
      tokenEnv: 'Credential reference',
      apiBaseUrl: 'GitHub API base URL',
      save: 'Save settings',
      saved: 'Settings saved',
      authorize: 'Authorize GitHub',
      code: 'Enter this code at GitHub',
      openVerification: 'Open GitHub verification',
      waiting: 'Waiting for authorization…',
      connected: 'GitHub Connected',
      authFailed: 'Authorization failed',
      authRequired: 'Connect GitHub to search duplicates or create issues directly.',
      authHelp: 'Sign in with a GitHub OAuth App to enable automatic issue creation. Credentials stay securely stored in DSH Credentials.',
      signIn: 'Sign in with GitHub',
      signInAgain: 'Switch Account',
      signOut: 'Sign out',
      signedOut: 'Signed out',
      authUnavailable: 'GitHub sign-in is not configured for this installation.',
      nativePlugins: 'Native DSH Plugins',
      thirdPartyPlugins: 'Third-party Plugins',
      noNativePlugins: 'No native DSH plugins are installed.',
      noThirdPartyPlugins: 'No third-party plugins are installed.',
      review: 'I have reviewed the sanitized preview and confirm submission.',
      create: 'Create Issue',
      created: 'Issue created successfully!',
      fallback: 'Open prefilled issue form in browser',
      error: 'Error',
      cancel: 'Cancel',
      enabled: 'enabled',
      disabled: 'disabled',
      attachments: 'Screenshots',
      attachmentsHelp: 'Add up to 5 PNG, JPG, GIF, or WebP screenshots (max 8 MB each, 20 MB total). They are uploaded only after final confirmation.',
      removeAttachment: 'Remove',
      attachmentTooMany: 'Maximum 5 screenshots allowed.',
      attachmentTooLarge: 'Each screenshot must be 8 MB or smaller; total limit is 20 MB.',
      attachmentReadError: 'Could not read image file.',
      tabCatalog: 'Catalog',
      tabEditor: 'Report Editor',
      tabReports: 'My Reports',
      tabAuth: 'Authorization',
      search: 'Search installed plugins…',
      noSearchResults: 'No plugins match your search query.',
      dropzonePrompt: 'Drag & drop screenshots here, click to browse, or press Ctrl+V to paste from clipboard',
      copyCode: 'Copy Code',
      copied: 'Copied!',
      writeTab: 'Write',
      previewTab: 'Preview',
      myReportsEmpty: 'No issues submitted from this session yet.',
      myReportsRefresh: 'Refresh Status',
      statusOpen: 'Open',
      statusClosed: 'Closed',
      includeClosed: 'Include closed issues in duplicate search',
      quickReport: 'Report Crash',
      failedBanner: 'Plugin encountered runtime failure.',
      sysInfo: 'System diagnostics',
    }

    const zh = {
      title: '问题报告器',
      description: '将 DSH 插件问题整理成带有自动诊断与脱敏预览的高质量 issue。',
      refresh: '刷新插件列表',
      loading: '正在加载插件列表与状态…',
      empty: '未找到已安装的插件。',
      unsupported: '没有公开的仓库信息',
      report: '反馈问题',
      close: '关闭',
      observed: '发生了什么？',
      reproduction: '复现步骤',
      expected: '预期行为',
      titleField: '问题标题',
      environment: '环境信息（可选）',
      preview: '生成安全预览',
      previewTitle: '已脱敏的 Issue 预览',
      redactions: '已脱敏内容',
      duplicates: '可能重复的 issue',
      noDuplicates: '未发现相似的开放 issue。',
      auth: '授权与服务',
      appClientId: 'GitHub OAuth App 客户端 ID',
      tokenEnv: '凭据引用',
      apiBaseUrl: 'GitHub API 地址',
      save: '保存设置',
      saved: '设置已保存',
      authorize: '授权 GitHub',
      code: '在 GitHub 输入此代码',
      openVerification: '打开 GitHub 验证页',
      waiting: '等待授权中…',
      connected: 'GitHub 已连接',
      authFailed: '授权失败',
      authRequired: '连接 GitHub 后即可搜索重复项并直接创建 issue。',
      authHelp: '使用 GitHub OAuth App 登录以启用自动 issue 创建。凭据安全保存在 DSH Credentials 中。',
      signIn: '使用 GitHub 登录',
      signInAgain: '切换账号',
      signOut: '退出登录',
      signedOut: '已退出登录',
      authUnavailable: '此 DSH 安装未配置 GitHub 客户端 ID。',
      nativePlugins: '原生 DSH 插件',
      thirdPartyPlugins: '第三方插件',
      noNativePlugins: '未安装原生 DSH 插件。',
      noThirdPartyPlugins: '未安装第三方插件。',
      review: '我已检查安全预览并确认提交。',
      create: '创建 Issue',
      created: 'Issue 创建成功！',
      fallback: '在浏览器中打开预填充表单',
      error: '发生错误',
      cancel: '取消',
      enabled: '已启用',
      disabled: '已禁用',
      attachments: '截图附件',
      attachmentsHelp: '最多可添加 5 张 PNG、JPG、GIF 或 WebP 截图（单张最大 8 MB，总计上限 20 MB）。仅在最终确认后上传。',
      removeAttachment: '移除',
      attachmentTooMany: '最多只能添加 5 张截图。',
      attachmentTooLarge: '单张截图不可超过 8 MB，总大小不可超过 20 MB。',
      attachmentReadError: '无法读取图片文件。',
      tabCatalog: '插件目录',
      tabEditor: '问题编辑器',
      tabReports: '我的报告',
      tabAuth: '授权设置',
      search: '搜索已安装的插件…',
      noSearchResults: '未找到匹配的插件。',
      dropzonePrompt: '拖放截图至此，点击浏览，或按 Ctrl+V 粘贴剪贴板截图',
      copyCode: '复制代码',
      copied: '已复制！',
      writeTab: '编辑',
      previewTab: '预览',
      myReportsEmpty: '当前尚未提交任何 issue。',
      myReportsRefresh: '刷新状态',
      statusOpen: '开启中',
      statusClosed: '已关闭',
      includeClosed: '在重复搜索中包含已关闭的 issue',
      quickReport: '反馈故障',
      failedBanner: '此插件在运行时遇到了错误。',
      sysInfo: '系统诊断信息',
    }

    function useLocale(ctx) {
      return React.useSyncExternalStore(
        React.useMemo(() => (cb) => ctx.locale?.subscribe?.(cb) || (() => {}), [ctx]),
        React.useCallback(() => ctx.locale?.getSnapshot?.().active || 'en', [ctx]),
      )
    }

    function ensureCss() {
      if (typeof document === 'undefined') return
      if (document.getElementById('dsh-issue-reporter-full-css')) return
      const style = document.createElement('style')
      style.id = 'dsh-issue-reporter-full-css'
      style.dataset.dshPlugin = NS
      style.textContent = `
.ir-page { display: flex; flex-direction: column; gap: 14px; padding: 4px 0 20px; width: 100%; box-sizing: border-box; }
.ir-header { display: flex; flex-direction: column; gap: 8px; padding-bottom: 12px; border-bottom: 1px solid var(--dsw-alias-border-l2); }
.ir-title { font-size: 18px; font-weight: 700; color: var(--dsw-alias-label-primary); display: flex; align-items: center; gap: 8px; margin: 0; }
.ir-sub { font-size: 13px; color: var(--dsw-alias-label-secondary); line-height: 1.4; margin: 0; }

.ir-badges-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 4px; }
.ir-badge { font-size: 12px; padding: 3px 10px; border-radius: 999px; border: 1px solid var(--dsw-alias-border-l2); display: inline-flex; align-items: center; gap: 5px; font-weight: 500; }
.ir-badge-ok { border-color: var(--dsw-alias-state-success-primary); color: var(--dsw-alias-state-success-primary); background: rgba(16,185,129,0.08); }
.ir-badge-warn { border-color: var(--dsw-alias-state-warning-primary); color: var(--dsw-alias-state-warning-primary); background: rgba(245,158,11,0.08); }
.ir-badge-bad { border-color: var(--dsw-alias-state-error-primary); color: var(--dsw-alias-state-error-primary); background: rgba(239,68,68,0.08); }
.ir-badge-neutral { border-color: var(--dsw-alias-border-l2); color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-bg-layer-2); }

.ir-nav-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--dsw-alias-border-l2); padding-bottom: 0; margin-top: 6px; }
.ir-tab-btn { appearance: none; background: transparent; border: none; border-bottom: 2px solid transparent; padding: 8px 14px; font-size: 13px; font-weight: 500; color: var(--dsw-alias-label-secondary); cursor: pointer; transition: all .15s ease; }
.ir-tab-btn:hover { color: var(--dsw-alias-label-primary); }
.ir-tab-btn.active { color: var(--dsw-alias-label-primary); border-bottom-color: var(--dsw-alias-state-brand-primary, var(--dsw-alias-label-primary)); font-weight: 600; }

.ir-section-card { border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-3); border-radius: 12px; padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; }
.ir-section-title { font-size: 15px; font-weight: 600; color: var(--dsw-alias-label-primary); display: flex; align-items: center; justify-content: space-between; margin: 0; }
.ir-section-desc { font-size: 13px; color: var(--dsw-alias-label-secondary); margin-top: -4px; line-height: 1.4; }

.ir-input { height: 36px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); border-radius: 8px; padding: 0 12px; font-size: 13px; width: 100%; box-sizing: border-box; }
.ir-input:focus { outline: none; border-color: var(--dsw-alias-state-brand-primary, var(--dsw-alias-label-primary)); }
.ir-textarea { border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); border-radius: 8px; padding: 8px 12px; font-size: 13px; width: 100%; box-sizing: border-box; resize: vertical; font-family: inherit; }
.ir-textarea:focus { outline: none; border-color: var(--dsw-alias-state-brand-primary, var(--dsw-alias-label-primary)); }

.ir-btn { appearance: none; font: inherit; cursor: pointer; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; padding: 7px 14px; font-size: 13px; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); font-weight: 500; display: inline-flex; align-items: center; justify-content: center; gap: 6px; transition: all .15s ease; text-decoration: none; }
.ir-btn:hover:not(:disabled) { background: var(--dsw-alias-bg-layer-4, var(--dsw-alias-bg-layer-2)); border-color: var(--dsw-alias-label-dimmed, var(--dsw-alias-border-l2)); }
.ir-btn-primary { background: var(--dsw-alias-label-primary); color: var(--dsw-alias-bg-layer-3); border-color: transparent; font-weight: 600; }
.ir-btn-primary:hover:not(:disabled) { opacity: 0.88; }
.ir-btn-danger { color: var(--dsw-alias-state-error-primary); border-color: rgba(239,68,68,0.3); }
.ir-btn-danger:hover:not(:disabled) { background: rgba(239,68,68,0.12); }
.ir-btn-sm { padding: 4px 10px; font-size: 12px; border-radius: 6px; }
.ir-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.ir-dropzone { border: 2px dashed var(--dsw-alias-border-l2); border-radius: 10px; padding: 18px; text-align: center; background: var(--dsw-alias-bg-layer-2); cursor: pointer; transition: all .2s ease; }
.ir-dropzone-active { border-color: var(--dsw-alias-state-brand-primary, var(--dsw-alias-label-primary)); background: rgba(16,185,129,0.06); }
.ir-dropzone-text { font-size: 13px; color: var(--dsw-alias-label-secondary); }

.ir-thumbs-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
.ir-thumb-card { position: relative; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; overflow: hidden; background: var(--dsw-alias-bg-layer-1); width: 100px; height: 75px; display: flex; align-items: center; justify-content: center; }
.ir-thumb-img { max-width: 100%; max-height: 100%; object-fit: cover; }
.ir-thumb-del { position: absolute; top: 4px; right: 4px; width: 20px; height: 20px; border-radius: 50%; background: rgba(0,0,0,0.65); color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; line-height: 1; }
.ir-thumb-meta { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.65); color: #fff; font-size: 10px; padding: 2px 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center; }

.ir-alert-ok { padding: 10px 14px; border-radius: 8px; background: rgba(16,185,129,0.1); color: var(--dsw-alias-state-success-primary); font-size: 13px; }
.ir-alert-bad { padding: 10px 14px; border-radius: 8px; background: rgba(239,68,68,0.1); color: var(--dsw-alias-state-error-primary); font-size: 13px; }
.ir-alert-warn { padding: 10px 14px; border-radius: 8px; background: rgba(245,158,11,0.12); color: var(--dsw-alias-state-warning-primary); font-size: 13px; }

.ir-preview { padding: 12px; border-radius: 8px; background: var(--dsw-alias-bg-layer-2); font-family: monospace; font-size: 12px; white-space: pre-wrap; word-break: break-all; border: 1px solid var(--dsw-alias-border-l2); max-height: 350px; overflow-y: auto; }

.ir-plugin-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l1); width: 100%; box-sizing: border-box; text-align: left; background: var(--dsw-alias-bg-layer-2); cursor: pointer; transition: all .15s ease; color: inherit; font: inherit; margin-bottom: 6px; }
.ir-plugin-row:hover { border-color: var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-4, var(--dsw-alias-bg-layer-2)); }
.ir-plugin-row-disabled { cursor: default; opacity: 0.65; }
.ir-plugin-row-disabled:hover { border-color: var(--dsw-alias-border-l1); }

.ir-report-card { border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; padding: 12px 14px; background: var(--dsw-alias-bg-layer-2); display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 8px; }
`
      document.head.appendChild(style)
    }

    function createErrorBoundary() {
      if (!React || typeof React.Component !== 'function') {
        return function NoopBoundary(props) { return props?.children || null }
      }
      return class ErrorBoundary extends React.Component {
        constructor(props) {
          super(props)
          this.state = { hasError: false, error: null }
        }
        static getDerivedStateFromError(error) {
          return { hasError: true, error }
        }
        componentDidCatch(error, errorInfo) {
          console.error('[dsh-issue-reporter] React Error:', error, errorInfo)
        }
        render() {
          if (this.state.hasError) {
            return React.createElement(
              'div',
              { className: 'ir-alert-bad', style: { margin: '12px 0' } },
              React.createElement('div', { style: { fontWeight: 600, marginBottom: 4 } }, '⚠️ Issue Reporter UI Error:'),
              React.createElement('div', { style: { fontSize: 12, wordBreak: 'break-all' } }, String(this.state.error?.message || this.state.error)),
              React.createElement(
                'button',
                {
                  type: 'button',
                  className: 'ir-btn ir-btn-sm',
                  style: { marginTop: 8 },
                  onClick: () => this.setState({ hasError: false, error: null }),
                },
                'Retry'
              )
            )
          }
          return this.props?.children || null
        }
      }
    }
    const ErrorBoundary = createErrorBoundary()

    async function jsonRequest(path, options) {
      const response = await fetch(path, {
        ...options,
        headers: { 'content-type': 'application/json', ...(options?.headers || {}) },
      })
      const body = await response.json().catch(() => ({}))
      if (response.status === 429 && body.pending) return body
      if (!response.ok) throw new Error(body.error || 'Request failed')
      return body
    }

    const MAX_ATTACHMENTS = 5
    const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024
    const MAX_ATTACHMENT_TOTAL_BYTES = 20 * 1024 * 1024

    function readAttachment(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const raw = String(reader.result || '')
          const data = raw.includes(',') ? raw.slice(raw.indexOf(',') + 1) : ''
          resolve({ name: file.name, mime: file.type, data, size: file.size, previewUrl: raw })
        }
        reader.onerror = () => reject(new Error('read'))
        reader.readAsDataURL(file)
      })
    }

    async function loadRemoteInventory(ctx, timeoutMs = 1500) {
      const inventory = ctx.remote?.pluginInventory
      if (typeof inventory?.list !== 'function') return undefined
      const request = Promise.resolve().then(() => inventory.list()).catch(() => undefined)
      const timeout = new Promise((resolve) => setTimeout(() => resolve(undefined), timeoutMs))
      return Promise.race([request, timeout])
    }

    function Field({ label, value, onChange, multiline = false, placeholder = '' }) {
      const props = {
        value: value || '',
        onChange: (event) => onChange(event.currentTarget.value),
        placeholder,
        className: multiline ? 'ir-textarea' : 'ir-input',
      }
      return h('label', { style: { display: 'block', marginTop: 8 } },
        h('span', { style: { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 } }, label),
        multiline ? h('textarea', { ...props, rows: 4 }) : h('input', props)
      )
    }

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
      const [draft, setDraft] = React.useState({ title: '', observed: '', reproduction: '', expected: '', environment: '', errorStack: '' })
      const [preview, setPreview] = React.useState(null)
      const [duplicates, setDuplicates] = React.useState([])
      const [includeClosed, setIncludeClosed] = React.useState(false)
      const [busy, setBusy] = React.useState(false)
      const [reviewed, setReviewed] = React.useState(false)
      const [auth, setAuth] = React.useState(null)
      const [copied, setCopied] = React.useState(false)
      const [attachments, setAttachments] = React.useState([])
      const [isDragging, setIsDragging] = React.useState(false)
      const [submittedReports, setSubmittedReports] = React.useState(() => {
        try {
          const raw = localStorage.getItem('dsh_issue_reporter_history')
          return raw ? JSON.parse(raw) : []
        } catch { return [] }
      })
      const pollTimer = React.useRef(null)
      const fileInputRef = React.useRef(null)

      const saveReports = (items) => {
        setSubmittedReports(items)
        try { localStorage.setItem('dsh_issue_reporter_history', JSON.stringify(items.slice(0, 50))) } catch {}
      }

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
      React.useEffect(() => { if (open) load() }, [open, load])

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

      const copyCode = () => {
        if (!auth?.userCode) return
        try {
          navigator.clipboard.writeText(auth.userCode)
          setCopied(true)
          setTimeout(() => setCopied(false), 2500)
        } catch {}
      }

      const openReport = (plugin) => {
        setEditor(plugin)
        setPreview(null)
        setDuplicates([])
        setReviewed(false)
        setAttachments([])
        setEditorMode('write')
        setActiveTab('editor')
        const isFailed = plugin.fiberPhase === 'failed' || Boolean(plugin.fiberError)
        setDraft({
          title: (isFailed ? 'Crash in ' : 'Bug in ') + plugin.displayName,
          observed: isFailed ? 'Plugin failed during execution.\\n' + (plugin.fiberError || '') : '',
          reproduction: '',
          expected: '',
          environment: status?.diagnostics
            ? 'Node.js ' + status.diagnostics.node + ' (' + status.diagnostics.platform + ' ' + status.diagnostics.arch + ')'
            : '',
          errorStack: plugin.fiberError || '',
        })
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
              attachments,
            }),
          })
          setAuth((current) => ({ ...(current || {}), result }))
          if (result?.issue) {
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
        } catch {}
      }

      const q = searchQuery.trim().toLowerCase()
      const matchesSearch = (p) => !q || p.displayName.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q) || (p.moduleName || '').toLowerCase().includes(q)
      const nativePlugins = plugins.filter((p) => p.category === 'native' && matchesSearch(p))
      const thirdPartyPlugins = plugins.filter((p) => p.category !== 'native' && matchesSearch(p))

      const isConnected = Boolean(status?.config?.tokenConfigured)
      const badges = h('div', { className: 'ir-badges-row' }, [
        isConnected
          ? h('span', { className: 'ir-badge ir-badge-ok' }, '✓ ' + t.connected)
          : h('span', { className: 'ir-badge ir-badge-warn' }, status?.config?.signInConfigured ? t.authRequired : t.authUnavailable),
        h('span', { className: 'ir-badge ir-badge-neutral' }, plugins.length + ' ' + (locale.startsWith('zh') ? '个插件' : 'plugins')),
        status?.diagnostics ? h('span', { className: 'ir-badge ir-badge-neutral' }, 'Node ' + status.diagnostics.node) : null,
      ])

      const renderPluginRow = (plugin) => {
        const isFailed = plugin.fiberPhase === 'failed' || Boolean(plugin.fiberError)
        return h('div', {
          key: plugin.moduleName + (plugin.presetId || ''),
          className: 'ir-plugin-row' + (plugin.supported ? '' : ' ir-plugin-row-disabled'),
          onClick: plugin.supported ? () => openReport(plugin) : undefined,
        }, [
          h('div', { style: { flex: '1 1 auto', minWidth: 0 } }, [
            h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' } }, [
              h('strong', null, plugin.displayName),
              plugin.version ? h('span', { style: { fontSize: 11, color: 'var(--dsw-alias-label-secondary)' } }, 'v' + plugin.version) : null,
              isFailed ? h('span', { className: 'ir-badge ir-badge-bad', style: { padding: '1px 6px', fontSize: 11 } }, 'failed') : null,
            ]),
            h('small', { style: { display: 'block', color: 'var(--dsw-alias-label-secondary)', marginTop: 2 } },
              plugin.repository ? plugin.repository.fullName : t.unsupported
            ),
          ]),
          plugin.supported
            ? h('button', {
                type: 'button',
                className: 'ir-btn ir-btn-sm' + (isFailed ? ' ir-btn-danger' : ' ir-btn-primary'),
                onClick: (e) => { e.stopPropagation(); openReport(plugin) },
              }, isFailed ? t.quickReport : t.report)
            : h('span', { style: { fontSize: 12, color: 'var(--dsw-alias-label-secondary)' } }, plugin.enabled ? t.enabled : t.disabled),
        ])
      }

      const catalogContent = h('div', null, [
        h('div', { style: { display: 'flex', gap: 8, marginBottom: 12 } }, [
          h('input', {
            className: 'ir-input',
            placeholder: t.search,
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.currentTarget.value),
          }),
          h('button', { type: 'button', className: 'ir-btn', onClick: load, disabled: busy }, t.refresh),
        ]),
        plugins.length === 0 && !error
          ? h('p', { style: { color: 'var(--dsw-alias-label-secondary)' } }, t.loading)
          : h('div', null, [
              h('details', { open: true, style: { marginBottom: 12 } }, [
                h('summary', { style: { cursor: 'pointer', fontWeight: 600, fontSize: 14, marginBottom: 8 } }, t.nativePlugins + ' (' + nativePlugins.length + ')'),
                nativePlugins.length ? nativePlugins.map(renderPluginRow) : h('p', { style: { color: 'var(--dsw-alias-label-secondary)', fontSize: 13 } }, t.noNativePlugins),
              ]),
              h('details', { open: true }, [
                h('summary', { style: { cursor: 'pointer', fontWeight: 600, fontSize: 14, marginBottom: 8 } }, t.thirdPartyPlugins + ' (' + thirdPartyPlugins.length + ')'),
                thirdPartyPlugins.length ? thirdPartyPlugins.map(renderPluginRow) : h('p', { style: { color: 'var(--dsw-alias-label-secondary)', fontSize: 13 } }, t.noThirdPartyPlugins),
              ]),
            ]),
      ])

      const dropzone = h('div', {
        className: 'ir-dropzone' + (isDragging ? ' ir-dropzone-active' : ''),
        onDragOver: (e) => { e.preventDefault(); setIsDragging(true) },
        onDragLeave: (e) => { e.preventDefault(); setIsDragging(false) },
        onDrop: (e) => {
          e.preventDefault(); setIsDragging(false)
          const files = Array.from(e.dataTransfer?.files || []).filter((f) => f.type.startsWith('image/'))
          if (files.length) addFiles(files)
        },
        onClick: () => fileInputRef.current?.click(),
      }, [
        h('input', {
          ref: fileInputRef,
          type: 'file',
          accept: 'image/png,image/jpeg,image/gif,image/webp',
          multiple: true,
          style: { display: 'none' },
          onChange: async (e) => {
            const files = Array.from(e.currentTarget.files || [])
            e.currentTarget.value = ''
            if (files.length) await addFiles(files)
          },
        }),
        h('div', { className: 'ir-dropzone-text' }, [
          h('strong', { style: { display: 'block', marginBottom: 4 } }, '📸 ' + t.attachments),
          h('span', null, t.dropzonePrompt),
        ]),
        attachments.length ? h('div', { className: 'ir-thumbs-grid', onClick: (e) => e.stopPropagation() },
          attachments.map((att, idx) => h('div', { key: att.name + '-' + idx, className: 'ir-thumb-card' }, [
            att.previewUrl ? h('img', { src: att.previewUrl, alt: att.name, className: 'ir-thumb-img' }) : null,
            h('button', {
              type: 'button',
              className: 'ir-thumb-del',
              title: t.removeAttachment,
              onClick: () => setAttachments(attachments.filter((_, i) => i !== idx)),
            }, '×'),
            h('span', { className: 'ir-thumb-meta' }, Math.round(att.size / 1024) + ' KB'),
          ]))
        ) : null,
      ])

      const editorContent = editor ? h('div', { className: 'ir-section-card' }, [
        h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--dsw-alias-border-l2)', paddingBottom: 10 } }, [
          h('div', null, [
            h('h3', { className: 'ir-section-title' }, t.tabEditor + ': ' + editor.displayName),
            h('small', { className: 'ir-section-desc' }, editor.repository ? editor.repository.fullName : ''),
          ]),
          h('div', { style: { display: 'flex', gap: 6 } }, [
            h('button', {
              type: 'button',
              className: 'ir-btn ir-btn-sm' + (editorMode === 'write' ? ' ir-btn-primary' : ''),
              onClick: () => setEditorMode('write'),
            }, t.writeTab),
            h('button', {
              type: 'button',
              className: 'ir-btn ir-btn-sm' + (editorMode === 'preview' ? ' ir-btn-primary' : ''),
              onClick: buildPreview,
              disabled: busy || !draft.title.trim(),
            }, t.previewTab),
            h('button', { type: 'button', className: 'ir-btn ir-btn-sm', onClick: () => { setEditor(null); setActiveTab('catalog') } }, t.close),
          ]),
        ]),

        editorMode === 'write'
          ? h('div', null, [
              h(Field, { label: t.titleField, value: draft.title, onChange: (v) => setDraft({ ...draft, title: v }) }),
              h(Field, { label: t.observed, value: draft.observed, onChange: (v) => setDraft({ ...draft, observed: v }), multiline: true }),
              h(Field, { label: t.reproduction, value: draft.reproduction, onChange: (v) => setDraft({ ...draft, reproduction: v }), multiline: true }),
              h(Field, { label: t.expected, value: draft.expected, onChange: (v) => setDraft({ ...draft, expected: v }), multiline: true }),
              h(Field, { label: t.environment, value: draft.environment, onChange: (v) => setDraft({ ...draft, environment: v }), multiline: true }),
              draft.errorStack ? h(Field, { label: 'Captured Stack Trace', value: draft.errorStack, onChange: (v) => setDraft({ ...draft, errorStack: v }), multiline: true }) : null,
              h('div', { style: { marginTop: 12 } }, dropzone),
              h('div', { style: { marginTop: 14, display: 'flex', justifyContent: 'flex-end', gap: 8 } }, [
                h('button', { type: 'button', className: 'ir-btn ir-btn-primary', onClick: buildPreview, disabled: busy || !draft.title.trim() }, t.preview),
              ]),
            ])
          : h('div', null, [
              preview ? h('div', null, [
                h('h4', { style: { margin: '8px 0', fontSize: 16 } }, preview.draft.title),
                h('pre', { className: 'ir-preview' }, preview.draft.body || '-'),
                preview.draft.redactions.length
                  ? h('div', { style: { marginTop: 8, fontSize: 12, color: 'var(--dsw-alias-state-warning-primary)' } }, '🛡️ ' + t.redactions + ': ' + preview.draft.redactions.join(', '))
                  : null,
                attachments.length
                  ? h('p', { style: { fontSize: 13, marginTop: 6 } }, t.attachments + ': ' + attachments.map((a) => a.name).join(', '))
                  : null,

                h('div', { style: { marginTop: 14, borderTop: '1px solid var(--dsw-alias-border-l2)', paddingTop: 10 } }, [
                  h('strong', { style: { fontSize: 14 } }, t.duplicates),
                  h('label', { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginTop: 4, cursor: 'pointer', color: 'var(--dsw-alias-label-secondary)' } }, [
                    h('input', {
                      type: 'checkbox',
                      checked: includeClosed,
                      onChange: (e) => {
                        setIncludeClosed(e.currentTarget.checked)
                        setTimeout(buildPreview, 100)
                      },
                    }),
                    t.includeClosed,
                  ]),
                  duplicates.length
                    ? h('ul', { style: { marginTop: 6, paddingLeft: 20 } }, duplicates.map((item) => h('li', { key: item.number, style: { marginBottom: 4 } }, [
                        h('a', { href: item.html_url, target: '_blank', rel: 'noopener noreferrer' }, '#' + item.number + ' ' + item.title),
                        item.state === 'closed' ? h('span', { className: 'ir-badge ir-badge-bad', style: { marginLeft: 6, fontSize: 10, padding: '0 5px' } }, t.statusClosed) : null,
                      ])))
                    : h('p', { style: { color: 'var(--dsw-alias-label-secondary)', fontSize: 13, marginTop: 4 } }, t.noDuplicates),
                ]),

                status?.config?.tokenConfigured
                  ? h('label', { style: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, cursor: 'pointer', fontWeight: 500 } }, [
                      h('input', { type: 'checkbox', checked: reviewed, onChange: (e) => setReviewed(e.currentTarget.checked) }),
                      t.review,
                    ])
                  : null,

                h('div', { style: { display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' } }, [
                  h('button', {
                    type: 'button',
                    className: 'ir-btn ir-btn-primary',
                    onClick: createIssue,
                    disabled: busy || !reviewed || !status?.config?.tokenConfigured,
                  }, t.create),
                  h('a', { className: 'ir-btn', href: preview.prefilledUrl, target: '_blank', rel: 'noopener noreferrer' }, t.fallback),
                ]),
              ]) : h('p', { style: { color: 'var(--dsw-alias-label-secondary)' } }, t.loading),
            ]),
      ]) : h('div', { className: 'ir-section-card' }, [
        h('p', { style: { color: 'var(--dsw-alias-label-secondary)', textAlign: 'center', padding: 20 } },
          locale.startsWith('zh') ? '请先在插件目录中选择一个插件以反馈问题。' : 'Please select a plugin from the Catalog tab to start reporting.'
        ),
      ])

      const reportsContent = h('div', null, [
        h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 } }, [
          h('h4', { style: { margin: 0 } }, t.tabReports),
          h('button', {
            type: 'button',
            className: 'ir-btn ir-btn-sm',
            onClick: () => submittedReports.forEach((r, idx) => refreshIssueStatus(r, idx)),
          }, t.myReportsRefresh),
        ]),
        submittedReports.length === 0
          ? h('p', { style: { color: 'var(--dsw-alias-label-secondary)', textAlign: 'center', padding: 20 } }, t.myReportsEmpty)
          : h('div', null, submittedReports.map((item, idx) => h('div', { key: item.id || idx, className: 'ir-report-card' }, [
              h('div', null, [
                h('a', { href: item.url, target: '_blank', rel: 'noopener noreferrer', style: { fontWeight: 600, fontSize: 14 } }, '#' + item.number + ' ' + item.title),
                h('div', { style: { fontSize: 12, color: 'var(--dsw-alias-label-secondary)', marginTop: 2 } }, item.repo + ' · ' + (item.createdAt || '')),
              ]),
              h('div', { style: { display: 'flex', gap: 6, alignItems: 'center' } }, [
                h('span', { className: 'ir-badge ' + (item.state === 'closed' ? 'ir-badge-bad' : 'ir-badge-ok') }, item.state === 'closed' ? t.statusClosed : t.statusOpen),
                h('button', { type: 'button', className: 'ir-btn ir-btn-sm', onClick: () => refreshIssueStatus(item, idx) }, '↻'),
              ]),
            ]))),
      ])

      const authContent = h('div', { className: 'ir-section-card' }, [
        h('h3', { className: 'ir-section-title' }, t.auth),
        h('p', { className: 'ir-section-desc' }, t.authHelp),
        status?.config?.tokenConfigured
          ? h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 } }, [
              h('button', { type: 'button', className: 'ir-btn', onClick: startAuth, disabled: busy }, t.signInAgain),
              h('button', { type: 'button', className: 'ir-btn ir-btn-danger', onClick: signOut, disabled: busy }, t.signOut),
            ])
          : status?.config?.signInConfigured
            ? h('button', { type: 'button', className: 'ir-btn ir-btn-primary', onClick: startAuth, disabled: busy }, t.signIn)
            : h('p', { className: 'ir-alert-warn' }, t.authUnavailable),

        auth?.userCode ? h('div', { className: 'ir-alert-ok', style: { marginTop: 12 } }, [
          h('p', { style: { margin: '0 0 6px' } }, t.code + ': '),
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } }, [
            h('strong', { style: { fontSize: 18, letterSpacing: 1 } }, auth.userCode),
            h('button', { type: 'button', className: 'ir-btn ir-btn-sm', onClick: copyCode }, copied ? t.copied : t.copyCode),
            h('a', { className: 'ir-btn ir-btn-sm ir-btn-primary', href: auth.verificationUri, target: '_blank', rel: 'noopener noreferrer' }, t.openVerification),
          ]),
          h('p', { style: { margin: '8px 0 0', fontSize: 12, color: 'var(--dsw-alias-label-secondary)' } }, t.waiting),
        ]) : null,
        auth?.connected ? h('div', { className: 'ir-alert-ok', style: { marginTop: 10 } }, t.connected) : null,
        auth?.signedOut ? h('div', { className: 'ir-alert-ok', style: { marginTop: 10 } }, t.signedOut) : null,
        auth?.result?.issue?.url ? h('div', { className: 'ir-alert-ok', style: { marginTop: 10 } }, [
          t.created + ' ',
          h('a', { href: auth.result.issue.url, target: '_blank', rel: 'noopener noreferrer' }, auth.result.issue.url),
        ]) : null,
      ])

      const body = open ? h('div', { className: 'ir-page' }, [
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
            h('h2', { className: 'ir-title' }, '🐛 ' + t.title),
            h('p', { className: 'ir-sub' }, t.description),
            badges,
          ]),
          h('span', { style: { fontSize: 18, color: 'var(--dsw-alias-label-secondary)' }, 'aria-hidden': 'true' }, open ? '⌃' : '⌄'),
        ]),
        body ? h('div', { id: cardBodyId, style: { marginTop: 12 } }, body) : null
      )
    }

    function SettingsCard(props) {
      return h(ErrorBoundary, null, h(SettingsCardInner, props))
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
