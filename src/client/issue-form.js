    function renderIssueEditor({ h, Field, t, editor, editorMode, setEditorMode, draft, setDraft, availableLabels, selectedLabels, setSelectedLabels, logsOpen, insertSelectedLogs, logsLoading, availableLogs, selectedLogs, setSelectedLogs, aiNotice, dropzone, handleAiOptimize, aiBusy, busy, buildPreview, preview, reviewed, setReviewed, includeClosed, setIncludeClosed, duplicates, status, createIssue, attachments, locale }) {
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
