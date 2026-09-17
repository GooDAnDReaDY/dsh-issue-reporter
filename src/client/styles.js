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
      .ir-btn:hover:not(:disabled) { background: var(--dsw-alias-bg-layer-4); }
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
