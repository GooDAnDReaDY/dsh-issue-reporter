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
        } catch (error) { return 'en' }
      }
      const [locale, setLocale] = React.useState(readLocale)
      React.useEffect(() => {
        if (typeof ctx?.locale?.subscribe !== 'function') return undefined
        const update = () => setLocale(readLocale())
        try {
          update()
          return ctx.locale.subscribe(update)
        } catch (error) { return undefined }
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
      if (!res.ok) throw new Error(data.error || 'HTTP ' + res.status)
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
