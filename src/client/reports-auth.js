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
