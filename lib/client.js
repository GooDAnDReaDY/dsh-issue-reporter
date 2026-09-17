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
      copyCodeFailed: 'Could not copy the verification code.',
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
      // Roadmap & Updater strings
      aiOptimize: 'Optimize with AI',
      aiOptimizing: 'Optimizing draft…',
      aiOptimized: 'Draft enhanced with AI suggestions.',
      aiOptimizeError: 'AI optimization failed',
      recentLogs: 'Session Logs',
      fetchLogs: 'Fetch Logs',
      insertLogs: 'Insert selected logs',
      loadingLogs: 'Loading session logs…',
      noLogsFound: 'No recent log entries found.',
      logsUnavailable: 'Session logs are unavailable right now.',
      labels: 'Labels',
      suggestedLabels: 'Suggested labels',
      updatePlugin: 'Update to',
      checkingUpdate: 'Checking for updates…',
      updateAvailable: 'Update available',
      upToDate: 'Up to date',
      updating: 'Updating plugin…',
      updateSuccess: 'Updated successfully! Restart DSH to apply changes.',
      updateFailed: 'Update failed. See server logs.',
      updateCheckFailed: 'Could not check for plugin updates.',
      duplicateLookupFailed: 'The report preview is ready, but duplicate lookup failed.',
      labelsUnavailable: 'Suggested labels are unavailable; you can still write the report.',
      statusesRefreshFailed: 'Could not refresh report statuses.',
      issueStatusFailed: 'Could not refresh this issue status.',
      refreshAllStatus: 'Refresh All',
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
      previewTitle: '脱敏问题预览',
      redactions: '已应用的脱敏规则',
      duplicates: '可能重复的问题',
      noDuplicates: '未发现相似的开启状态 issue。',
      auth: '认证与服务',
      appClientId: 'GitHub OAuth App Client ID',
      tokenEnv: '凭证引用',
      apiBaseUrl: 'GitHub API 基准地址',
      save: '保存设置',
      saved: '设置已保存',
      authorize: '授权 GitHub',
      code: '在 GitHub 中输入该验证码',
      openVerification: '打开 GitHub 验证页面',
      waiting: '正在等待用户授权…',
      connected: 'GitHub 已连接',
      authFailed: '授权失败',
      authRequired: '请先连接 GitHub 以检索重复项或直接创建 issue。',
      authHelp: '通过 GitHub OAuth App 登录即可支持自动创建 issue。凭据安全保存在 DSH Credentials 中。',
      signIn: '使用 GitHub 登录',
      signInAgain: '切换账号',
      signOut: '退出登录',
      signedOut: '已退出登录',
      authUnavailable: '当前环境未配置 GitHub 登录。',
      nativePlugins: 'DSH 原生插件',
      thirdPartyPlugins: '第三方插件',
      noNativePlugins: '未安装原生 DSH 插件。',
      noThirdPartyPlugins: '未安装第三方插件。',
      review: '我已仔细核对脱敏预览内容，确认提交。',
      create: '创建 Issue',
      created: 'Issue 创建成功！',
      fallback: '在浏览器中打开预填表单',
      error: '错误',
      cancel: '取消',
      enabled: '已启用',
      disabled: '已禁用',
      attachments: '截图附件',
      attachmentsHelp: '最多可添加 5 张 PNG、JPG、GIF 或 WebP 截图（单张最大 8 MB，总计最大 20 MB）。仅在最终确认后才会上传。',
      removeAttachment: '移除',
      attachmentTooMany: '最多只允许上传 5 张截图。',
      attachmentTooLarge: '每张截图必须在 8 MB 以内，总大小不可超过 20 MB。',
      attachmentReadError: '无法读取图片文件。',
      tabCatalog: '插件目录',
      tabEditor: '问题编辑',
      tabReports: '我的报告',
      tabAuth: '账号授权',
      search: '搜索已安装插件…',
      noSearchResults: '没有找到符合条件的插件。',
      dropzonePrompt: '拖拽截图至此处，点击浏览，或直接按 Ctrl+V 粘贴剪贴板图片',
      copyCode: '复制代码',
      copyCodeFailed: '无法复制验证码。',
      copied: '已复制！',
      writeTab: '编辑',
      previewTab: '预览',
      myReportsEmpty: '本次会话尚未提交任何 issue。',
      myReportsRefresh: '刷新状态',
      statusOpen: '开启中',
      statusClosed: '已关闭',
      includeClosed: '在查重时包含已关闭的问题',
      quickReport: '快速反馈异常',
      failedBanner: '该插件运行时出现异常。',
      sysInfo: '系统诊断信息',
      // Roadmap & Updater strings
      aiOptimize: 'AI 优化草稿',
      aiOptimizing: '正在优化草稿…',
      aiOptimized: '已应用 AI 优化建议。',
      aiOptimizeError: 'AI 优化失败',
      recentLogs: '会话日志',
      fetchLogs: '获取日志',
      insertLogs: '插入所选日志',
      loadingLogs: '正在加载会话日志…',
      noLogsFound: '未找到近期日志。',
      logsUnavailable: '当前无法读取会话日志。',
      labels: '标签',
      suggestedLabels: '推荐标签',
      updatePlugin: '更新至',
      checkingUpdate: '正在检查更新…',
      updateAvailable: '发现新版本',
      upToDate: '已是最新版本',
      updating: '正在更新插件…',
      updateSuccess: '更新成功！请重启 DSH 使更改生效。',
      updateFailed: '更新失败，请查看服务端日志。',
      updateCheckFailed: '无法检查插件更新。',
      duplicateLookupFailed: '报告预览已生成，但查重失败。',
      labelsUnavailable: '暂时无法获取推荐标签，仍可继续填写报告。',
      statusesRefreshFailed: '无法刷新报告状态。',
      issueStatusFailed: '无法刷新此 issue 的状态。',
      refreshAllStatus: '全部刷新',
    }

    const CSS = `
      .ir-title { font-size: 16px; font-weight: 600; margin: 0; color: var(--dsw-alias-label-primary); }
      .ir-sub { font-size: 13px; color: var(--dsw-alias-label-secondary); margin: 4px 0 8px; }
      .ir-badges-row { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
      .ir-badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: 500; }
      .ir-badge-ok { background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 15%, transparent); color: var(--dsw-alias-state-success-primary); }
      .ir-badge-warn { background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 15%, transparent); color: var(--dsw-alias-state-warn-label); }
      .ir-badge-bad { background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 15%, transparent); color: var(--dsw-alias-state-error-primary); }
      .ir-badge-neutral { background: var(--dsw-alias-bg-layer-3); color: var(--dsw-alias-label-secondary); }
      .ir-page { margin-top: 14px; border-top: 1px solid var(--dsw-alias-border-l1); padding-top: 14px; }
      .ir-nav-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--dsw-alias-border-l2); margin-bottom: 14px; }
      .ir-tab-btn { padding: 6px 14px; background: transparent; border: 0; border-bottom: 2px solid transparent; color: var(--dsw-alias-label-secondary); font-size: 13px; font-weight: 500; cursor: pointer; }
      .ir-tab-btn.active { color: var(--dsw-alias-label-primary); border-bottom-color: var(--dsw-alias-state-business-primary); font-weight: 600; }
      .ir-btn { display: inline-flex; align-items: center; justify-content: center; padding: 6px 14px; font-size: 13px; font-weight: 500; border-radius: 6px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-3); color: var(--dsw-alias-label-primary); cursor: pointer; text-decoration: none; transition: background-color 0.15s; }
      .ir-btn:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); }
      .ir-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      .ir-btn-primary { background: var(--dsw-alias-state-business-primary); color: var(--dsw-alias-label-primary-inverted); border-color: transparent; }
      .ir-btn-primary:hover:not(:disabled) { background: color-mix(in srgb, var(--dsw-alias-state-business-primary) 88%, var(--dsw-alias-label-primary)); }
      .ir-btn-danger { background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 15%, transparent); color: var(--dsw-alias-state-error-primary); border-color: transparent; }
      .ir-btn-danger:hover:not(:disabled) { background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 25%, transparent); }
      .ir-btn-sm { padding: 3px 8px; font-size: 12px; border-radius: 4px; }
      .ir-input { width: 100%; box-sizing: border-box; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); font-size: 13px; }
      .ir-textarea { width: 100%; box-sizing: border-box; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); font-size: 13px; font-family: inherit; resize: vertical; }
      .ir-plugin-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--dsw-alias-border-l2); margin-bottom: 6px; background: var(--dsw-alias-bg-layer-1); cursor: pointer; }
      .ir-plugin-row:hover { background: var(--dsw-alias-bg-layer-2); }
      .ir-plugin-row-disabled { opacity: 0.6; cursor: default; }
      .ir-section-card { padding: 12px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-1); margin-bottom: 12px; }
      .ir-section-title { font-size: 14px; font-weight: 600; margin: 0 0 4px; }
      .ir-section-desc { font-size: 12px; color: var(--dsw-alias-label-secondary); margin: 0 0 10px; }
      .ir-alert-ok { padding: 8px 12px; border-radius: 6px; background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 15%, transparent); color: var(--dsw-alias-state-success-primary); font-size: 13px; }
      .ir-alert-warn { padding: 8px 12px; border-radius: 6px; background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 15%, transparent); color: var(--dsw-alias-state-warn-label); font-size: 13px; }
      .ir-alert-bad { padding: 8px 12px; border-radius: 6px; background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 15%, transparent); color: var(--dsw-alias-state-error-primary); font-size: 13px; }
      .ir-preview { background: var(--dsw-alias-bg-layer-3); padding: 10px; border-radius: 6px; font-family: monospace; font-size: 12px; white-space: pre-wrap; word-break: break-all; max-height: 280px; overflow-y: auto; }
      .ir-dropzone { border: 2px dashed var(--dsw-alias-border-l1); border-radius: 8px; padding: 14px; text-align: center; cursor: pointer; transition: all 0.2s; background: var(--dsw-alias-bg-layer-1); }
      .ir-dropzone-active { border-color: var(--dsw-alias-state-business-primary); background: color-mix(in srgb, var(--dsw-alias-state-business-primary) 8%, transparent); }
      .ir-dropzone-text { color: var(--dsw-alias-label-secondary); font-size: 12px; }
      .ir-chevron { display: inline-flex; align-items: center; justify-content: center; transition: transform .16s ease; color: var(--dsw-alias-label-tertiary); }
      .ir-chevron-open { transform: rotate(180deg); }
      .ir-thumbs-grid { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
      .ir-thumb-card { position: relative; width: 72px; height: 72px; border-radius: 6px; border: 1px solid var(--dsw-alias-border-l2); overflow: hidden; background: var(--dsw-alias-bg-layer-3); }
      .ir-thumb-img { width: 100%; height: 100%; object-fit: cover; }
      .ir-thumb-del { position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; border-radius: 9999px; background: var(--dsw-alias-bg-mask-1); color: var(--dsw-alias-label-primary-inverted); border: 0; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
      .ir-thumb-meta { position: absolute; bottom: 2px; left: 2px; font-size: 9px; background: var(--dsw-alias-bg-mask-1); color: var(--dsw-alias-label-primary-inverted); padding: 1px 3px; border-radius: 3px; }
      .ir-report-card { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: 6px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-1); margin-bottom: 8px; }
    `

    function ensureCss() {
      if (typeof document === 'undefined' || document.getElementById(NS + '-styles')) return
      const style = document.createElement('style')
      style.id = NS + '-styles'
      style.dataset.dshPlugin = NS
      style.textContent = CSS
      document.head.appendChild(style)
    }

    function FallbackChevron() {
      return h('svg', { width: 14, height: 14, viewBox: '0 0 14 14', fill: 'none', 'aria-hidden': true },
        h('path', { d: 'M3.5 5.25L7 8.75L10.5 5.25', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' })
      )
    }

    let ChevronIcon = null
    try {
      const primitives = require('@deepseek-ai/dsh-client-ui-primitives')
      ChevronIcon = primitives?.IconChevronDownOutline14 || null
    } catch (error) {
      ChevronIcon = null
    }
    const Chevron = ChevronIcon || FallbackChevron

    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
      }
      static getDerivedStateFromError(error) {
        return { hasError: true, error }
      }
      componentDidCatch(error, errorInfo) {
        console.error('[dsh-issue-reporter:client]', error, errorInfo)
      }
      render() {
        if (this.state.hasError) {
          return h('div', { className: 'ir-alert-bad', style: { margin: 8 } },
            'dsh-issue-reporter UI error: ' + (this.state.error?.message || 'Component failed')
          )
        }
        return this.props.children
      }
    }

    function useLocale(ctx) {
      const readLocale = () => {
        try {
          const snapshot = ctx?.locale?.getSnapshot?.()
          const current = snapshot?.active || ctx?.locale?.getLocale?.()
          return typeof current === 'string' ? current : 'en'
        } catch (error) {
          ignoreOptionalFailure(ctx, 'Locale snapshot lookup')
          return 'en'
        }
      }
      const [locale, setLocale] = React.useState(readLocale)
      React.useEffect(() => {
        if (typeof ctx?.locale?.subscribe !== 'function') return undefined
        const update = () => setLocale(readLocale())
        try {
          update()
          return ctx.locale.subscribe(update)
        } catch (error) {
          ignoreOptionalFailure(ctx, 'Locale subscription')
          return undefined
        }
      }, [ctx])
      return locale
    }

    function ignoreOptionalFailure(ctx, operation) {
      ctx?.logger?.debug?.('[dsh-issue-reporter] ' + operation + ' unavailable; continuing with fallback')
    }

    async function jsonRequest(path, options = {}) {
      const res = await fetch(path, {
        headers: {
          'content-type': 'application/json',
          ...(options.headers || {}),
        },
        ...options,
      })
      const data = await res.json().catch(() => {
        if (res.ok) throw new Error('Server returned invalid JSON')
        return {}
      })
      if (!res.ok) {
        const error = new Error(data.error || 'HTTP ' + res.status)
        error.status = res.status
        throw error
      }
      return data
    }

    const MAX_ATTACHMENTS = 5
    const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024
    const MAX_ATTACHMENT_TOTAL_BYTES = 20 * 1024 * 1024

    async function readAttachment(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const raw = String(reader.result || '')
          const commaIdx = raw.indexOf(',')
          const data = commaIdx >= 0 ? raw.slice(commaIdx + 1) : raw
          resolve({ name: file.name, mime: file.type, data, size: file.size, previewUrl: raw })
        }
        reader.onerror = () => reject(new Error('read'))
        reader.readAsDataURL(file)
      })
    }

    async function loadRemoteInventory(ctx, timeoutMs = 1500) {
      const inventory = ctx.remote?.pluginInventory
      if (typeof inventory?.list !== 'function') return undefined
      const request = Promise.resolve().then(() => inventory.list()).catch(() => {
        ignoreOptionalFailure(ctx, 'Core plugin inventory snapshot')
        return undefined
      })
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

    function renderPluginCatalog({ h, plugins, searchQuery, setSearchQuery, busy, load, t, openReport, status, updater, locale, error }) {
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch = (p) => !q || p.displayName.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q) || (p.moduleName || '').toLowerCase().includes(q)
    const nativePlugins = plugins.filter((p) => p.category === 'native' && matchesSearch(p))
    const thirdPartyPlugins = plugins.filter((p) => p.category !== 'native' && matchesSearch(p))

    const isConnected = Boolean(status?.config?.tokenConfigured)
    const badges = h('div', { className: 'ir-badges-row' }, [
      updater?.currentVersion ? h('span', { className: 'ir-badge ir-badge-neutral' }, 'v' + updater.currentVersion) : null,
      updater?.updateAvailable ? h('span', { className: 'ir-badge ir-badge-warn' }, 'v' + updater.latestVersion) : null,
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
      return { content: catalogContent, badges }
    }

    function renderAttachmentDropzone({ h, t, isDragging, setIsDragging, addFiles, fileInputRef, attachments, setAttachments }) {
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
        h('strong', { style: { display: 'block', marginBottom: 4 } }, t.attachments),
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
      return dropzone
    }

    function renderIssueEditor({ h, Field, t, editor, editorMode, setEditorMode, draft, setDraft, availableLabels, selectedLabels, setSelectedLabels, logsOpen, fetchLogs, insertSelectedLogs, logsLoading, availableLogs, selectedLogs, setSelectedLogs, aiNotice, dropzone, handleAiOptimize, aiBusy, busy, buildPreview, preview, reviewed, setReviewed, includeClosed, setIncludeClosed, duplicates, status, createIssue, attachments, locale }) {
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

            // Auto-label selector
            availableLabels.length ? h('div', { style: { marginTop: 10, marginBottom: 8 } }, [
              h('label', { style: { display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--dsw-alias-label-secondary)' } }, t.labels),
              h('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } }, availableLabels.map((l) => {
                const isSelected = selectedLabels.includes(l.name)
                const labelColor = typeof l.color === 'string' && /^[a-f0-9]{6}$/i.test(l.color) ? '#' + l.color : undefined
                return h('button', {
                  key: l.name,
                  type: 'button',
                  onClick: () => {
                    setSelectedLabels(isSelected ? selectedLabels.filter((x) => x !== l.name) : [...selectedLabels, l.name])
                  },
                  style: {
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: 11,
                    border: '1px solid ' + (labelColor || 'var(--dsw-alias-border-l1)'),
                    background: isSelected ? (labelColor || 'var(--dsw-alias-state-business-primary)') : 'transparent',
                    color: isSelected ? 'var(--dsw-alias-label-primary-inverted)' : 'var(--dsw-alias-label-primary)',
                    cursor: 'pointer',
                    fontWeight: isSelected ? 600 : 400,
                  },
                }, (isSelected ? '✓ ' : '+ ') + l.name)
              })),
            ]) : null,

            h(Field, { label: t.observed, value: draft.observed, onChange: (v) => setDraft({ ...draft, observed: v }), multiline: true }),
            h(Field, { label: t.reproduction, value: draft.reproduction, onChange: (v) => setDraft({ ...draft, reproduction: v }), multiline: true }),
            h(Field, { label: t.expected, value: draft.expected, onChange: (v) => setDraft({ ...draft, expected: v }), multiline: true }),
            h(Field, { label: t.environment, value: draft.environment, onChange: (v) => setDraft({ ...draft, environment: v }), multiline: true }),
            draft.errorStack ? h(Field, { label: 'Captured Stack Trace', value: draft.errorStack, onChange: (v) => setDraft({ ...draft, errorStack: v }), multiline: true }) : null,

            // Logs selector section
            logsOpen ? h('div', {
              style: {
                marginTop: 12,
                padding: 10,
                borderRadius: 8,
                border: '1px solid var(--dsw-alias-border-l2)',
                background: 'var(--dsw-alias-bg-layer-2)',
              }
            }, [
              h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 } }, [
                h('strong', { style: { fontSize: 13 } }, t.recentLogs),
                h('div', { style: { display: 'flex', gap: 6 } }, [
                  h('button', {
                    type: 'button',
                    className: 'ir-btn ir-btn-sm ir-btn-primary',
                    onClick: insertSelectedLogs,
                    disabled: !selectedLogs.length,
                  }, t.insertLogs + ' (' + selectedLogs.length + ')'),
                  h('button', {
                    type: 'button',
                    className: 'ir-btn ir-btn-sm',
                    onClick: () => setLogsOpen(false),
                  }, t.close),
                ]),
              ]),
              logsLoading ? h('p', { style: { fontSize: 12, color: 'var(--dsw-alias-label-secondary)' } }, t.loadingLogs) : null,
              !logsLoading && availableLogs.length === 0 ? h('p', { style: { fontSize: 12, color: 'var(--dsw-alias-label-secondary)' } }, t.noLogsFound) : null,
              h('div', { style: { maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 } }, availableLogs.map((log, idx) => {
                const isChecked = selectedLogs.includes(idx)
                return h('label', {
                  key: idx,
                  style: {
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 6,
                    fontSize: 11,
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    padding: '3px 6px',
                    borderRadius: 4,
                    background: isChecked ? 'color-mix(in srgb, var(--dsw-alias-state-business-primary) 15%, transparent)' : 'transparent',
                  }
                }, [
                  h('input', {
                    type: 'checkbox',
                    checked: isChecked,
                    onChange: () => {
                      setSelectedLogs(isChecked ? selectedLogs.filter((i) => i !== idx) : [...selectedLogs, idx])
                    },
                  }),
                  h('span', { style: { wordBreak: 'break-all' } }, log.message),
                ])
              })),
            ]) : null,

            aiNotice ? h('div', {
              className: aiNotice.startsWith(t.aiOptimizeError) ? 'ir-alert-bad' : 'ir-alert-ok',
              style: { marginTop: 10 }
            }, aiNotice) : null,

            h('div', { style: { marginTop: 12 } }, dropzone),

            h('div', { style: { marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' } }, [
              h('div', { style: { display: 'flex', gap: 8 } }, [
                h('button', {
                  type: 'button',
                  className: 'ir-btn',
                  onClick: handleAiOptimize,
                  disabled: busy || aiBusy || (!draft.observed.trim() && !draft.reproduction.trim()),
                }, aiBusy ? t.aiOptimizing : t.aiOptimize),
                h('button', {
                  type: 'button',
                  className: 'ir-btn',
                  onClick: fetchLogs,
                  disabled: busy,
                }, t.fetchLogs),
              ]),
              h('button', {
                type: 'button',
                className: 'ir-btn ir-btn-primary',
                onClick: buildPreview,
                disabled: busy || !draft.title.trim(),
              }, t.preview),
            ]),
          ])
        : h('div', null, [
            preview ? h('div', null, [
              h('h4', { style: { margin: '8px 0', fontSize: 16 } }, preview.draft.title),
              h('pre', { className: 'ir-preview' }, preview.draft.body || '-'),
              preview.draft.redactions.length
                ? h('div', { style: { marginTop: 8, fontSize: 12, color: 'var(--dsw-alias-state-warn-primary)' } }, t.redactions + ': ' + preview.draft.redactions.join(', '))
                : null,
              selectedLabels.length
                ? h('p', { style: { fontSize: 13, marginTop: 6 } }, t.labels + ': ' + selectedLabels.join(', '))
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
      return editorContent
    }

    function renderReports({ h, t, refreshAllStatuses, busy, submittedReports, refreshIssueStatus }) {
    const reportsContent = h('div', null, [
      h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 } }, [
        h('h4', { style: { margin: 0 } }, t.tabReports),
        h('button', {
          type: 'button',
          className: 'ir-btn ir-btn-sm',
          onClick: refreshAllStatuses,
          disabled: busy,
        }, t.refreshAllStatus),
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
      return reportsContent
    }

    function renderAuthorization({ h, t, status, startAuth, busy, auth, copyCode, copied, signOut }) {
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
      return authContent
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

      const editorContent = renderIssueEditor({ h, Field, t, editor, editorMode, setEditorMode, draft, setDraft, availableLabels, selectedLabels, setSelectedLabels, logsOpen, fetchLogs, insertSelectedLogs, logsLoading, availableLogs, selectedLogs, setSelectedLogs, aiNotice, dropzone, handleAiOptimize, aiBusy, busy, buildPreview, preview, reviewed, setReviewed, includeClosed, setIncludeClosed, duplicates, status, createIssue, attachments, locale })

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

  },
})
