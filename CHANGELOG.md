# Changelog

## 0.1.2

- Registered autonomous `report_issue` tool in Cordis `ctx.tools` for agent-driven error triage and safe drafting (Refs: #28).
- Added AI-assisted draft optimization via `ctx.llm` / `/dsh-issue-reporter/ai/optimize` for reproduction steps and titles (Refs: #29).
- Added live session log snippet selector via `/dsh-issue-reporter/logs` with automated redaction (Refs: #30).
- Added issue watcher with batch status polling via `/dsh-issue-reporter/issues/batch-status` (Refs: #31).
- Added smart auto-labeling and component detection via `/dsh-issue-reporter/labels` (Refs: #32).
- Added canonical one-click plugin updater in settings card from npm registry with loopback validation (Refs: #33).

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
