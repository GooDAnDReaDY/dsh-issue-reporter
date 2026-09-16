    function renderPluginCatalog({ h, plugins, searchQuery, setSearchQuery, busy, load, t, openReport, status, updater, locale, error }) {
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch = (p) => !q || p.displayName.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q) || (p.moduleName || '').toLowerCase().includes(q)
    const nativePlugins = plugins.filter((p) => p.category === 'native' && matchesSearch(p))
    const thirdPartyPlugins = plugins.filter((p) => p.category !== 'native' && matchesSearch(p))

    const isConnected = Boolean(status?.config?.tokenConfigured)
    const badges = h('div', { className: 'ir-badges-row' }, [
      updater?.currentVersion ? h('span', { className: 'ir-badge ir-badge-neutral' }, 'v' + updater.currentVersion) : null,
      updater?.updateAvailable ? h('span', { className: 'ir-badge ir-badge-warn' }, '⬆ v' + updater.latestVersion) : null,
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
