# Changelog

## 0.1.5

### English
- **Settings reachable again**: the card registered into `settings.plugin.item`, a
  slot the current DSH core (0.1.6-alpha.2) no longer renders, so the settings were
  unreachable. The surface now registers into the Plugins page row seat
  `plugins.row.config`, keyed `@goodandready/dsh-issue-reporter#dsh-issue-reporter`
  (`rowConfigKey(package, rowId)`): the row gains a configure control whose page is
  the settings form (`view: 'page'`, without our card chrome and header — the host
  page draws the title, icon, crumb and padding) plus a one-line state for
  `view: 'summary'`. The legacy seat stays registered as a fallback for older cores.

## 0.1.4

### English
- Fixed native DSH theme-token compatibility and plugin inventory interactions.
- Fixed report-editor session-log loading and improved updater error diagnostics.
- Added regression coverage for plugin-card behavior, theme styling, session logs, and updater failures.

### 中文
- 修复原生 DSH 主题令牌兼容性及插件清单交互问题。
- 修复报告编辑器的会话日志加载，并改进更新器错误诊断。
- 增加回归测试，覆盖插件卡片、主题样式、会话日志和更新失败处理。

### Русский
- Исправлена совместимость с токенами темы DSH и взаимодействие с каталогом плагинов.
- Исправлена загрузка журналов сессии в редакторе отчёта и улучшена диагностика ошибок обновления.
- Добавлены регрессионные проверки карточки плагина, темы, журналов сессии и ошибок обновления.

## 0.1.3

- Hardened privacy redaction and report-draft persistence.
- Failed closed when the DSH authorization guard is unavailable.
- Fixed plugin settings, route error handling, and native DSH styling.
- Refactored client and server routes into testable modules without changing the runtime bundle entry point.
- Excluded internal planning and design files from the published package.

## 0.1.2

- Registered autonomous `report_issue` tool in Cordis `ctx.tools` for agent-driven error triage and safe drafting (Refs: #28).
- Added AI-assisted draft optimization via `ctx.llm` / `/dsh-issue-reporter/ai/optimize` for reproduction steps and titles (Refs: #29).
- Added live session log snippet selector via `/dsh-issue-reporter/logs` with automated redaction (Refs: #30).
- Added issue watcher with batch status polling via `/dsh-issue-reporter/issues/batch-status` (Refs: #31).
- Added smart auto-labeling and component detection via `/dsh-issue-reporter/labels` (Refs: #32).
- Added canonical one-click plugin updater in settings card from npm registry with loopback validation (Refs: #33).

- Added stable plugin style marker, theme-token styling, native chevron fallback, and reactive LocaleFace subscription (Refs: #42, #43, #44, #46).
- Split client source and server route handlers into maintainable modules while preserving the single-loader runtime bundle (Ref: #45).
- Surface authorization and upstream failures instead of silently reporting empty labels, templates, or credentials; reserve fallback behavior for documented optional cases (Ref: #47).

## 0.1.1

- Brought reporter UI design and styling to the `dsh-clinebot` standard with `ensureCss()` and native DSH design tokens (Refs: #24).
- Added top header status capsule badges for GitHub auth, inventory count, and Node.js runtime (Refs: #24).
- Protected settings card with an isolated `ErrorBoundary` component (Refs: #24).
- Added navigation tabs: Catalog, Report Editor, My Reports, and Authorization (Refs: #25).
- Added real-time instant search and filter input across installed plugins (Refs: #25).
- Added dual-mode `Write` / `Preview` views for formatted markdown inspection (Refs: #25).
- Added Device Flow 1-click `Copy Code` action with confirmation feedback (Refs: #25).
- Added screenshot attachment via `Ctrl+V` clipboard paste and interactive drag-and-drop zone with thumbnail gallery (Refs: #19).
- Added automatic environment diagnostics collection and quick-reporting for failed plugins with captured stack traces (Refs: #20).
- Added closed issues search option for duplicate detection and GitHub Issue Templates inspection (Refs: #21).
- Added persistent tracking of submitted issues with live status checks in the 'My Reports' tab (Refs: #22).
- Added multi-forge support for local and self-hosted Gitea / Forgejo repositories (Refs: #23).

## 0.1.0

- Initial public-ready development baseline for Gitea issue #1.

### 0.1.0 release candidate

- Added a DSH settings card that discovers installed plugins and separates native `@deepseek-ai/*` packages from third-party packages.
- Made the full reporter header row and supported plugin rows clickable, without duplicate trailing action buttons.
- Added GitHub OAuth App Device Flow sign-in, refresh-token handling, connected-account state, and sign-out for account switching.
- Corrected Device Flow host and query-parameter handling so OAuth requests go to `github.com` instead of the REST API host.
- Added bounded redaction for tokens, credentials, private paths, credential-bearing URLs, and email addresses.
- Added structured report drafting, preview, duplicate search, explicit confirmation, and prefilled issue-form fallback.
- Added PNG, JPG, GIF, and WebP screenshots with count, per-file, total-size, MIME, extension, base64, temporary-file, and cleanup checks.
- Added the GitHub CLI attachment path for `gh` 2.99 or newer; screenshot reports require a GitHub OAuth App token or personal access token, while reports without screenshots use the GitHub REST API.
- Added typed GitHub API errors, same-origin route protection, sanitized status responses, and no-store responses.
- Publication is owner-approved; this entry describes the candidate for the public GitHub and npm release.
