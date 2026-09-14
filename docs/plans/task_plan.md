# Implementation Plan: Issues #28-#32 (Autonomous Features & Intelligence)

## Issues Covered
- **#28**: H: [Core/Agent] Register report_issue tool for autonomous agent-driven reporting
- **#29**: M: [UI/AI] AI Summary & Repro Step Generator via ctx.llm integration
- **#30**: M: [Diagnostics] Live Telemetry & Log Snippet Selector from session ledger
- **#31**: M: [History] Issue Watcher & Live Status Badge tracking open/closed ticket state
- **#32**: M: [Triage] Smart Auto-Labeling and Component Detection for issue filing

## Architecture & Module Breakdown

### 1. `lib/domain.js`
- Add AI Prompt Generator helper: `buildAiOptimizationPrompt({ title, description, errorStack, pluginName, diagnostics })`.
- Add Issue Status parser helper: `parseIssueState(remoteIssueData)` returning `{ state: 'open'|'closed', commentsCount: number, updatedAt: string, closedAt: string|null }`.
- Add Component / Label Recommender helper: `recommendLabels({ pluginName, description, errorStack, availableLabels })`.
- Add Log Redaction & Snippet Formatter: `formatLogSnippet(selectedLines)`.

### 2. `lib/index.js` (Host / Cordis Server)
- Tool declaration: Register `report_issue` tool on Cordis context (`ctx.tools.register(...)` or equivalent DSH tool API) with parameters:
  - `pluginName` (string)
  - `title` (string)
  - `description` (string)
  - `errorStack` (optional string)
  - `severity` (optional string: low/medium/high/critical)
  - `includeDiagnostics` (optional boolean, default true)
- Add route `POST /dsh-issue-reporter/ai/optimize`:
  - Calls `ctx.llm` if available or structured heuristic builder.
  - Returns `{ ok: true, optimizedTitle, structuredBody }`.
- Add route `GET /dsh-issue-reporter/logs`:
  - Fetches recent trajectory/log entries from DSH session manager or safe host logs.
  - Returns list of timestamped log entries for the active session.
- Add route `POST /dsh-issue-reporter/issues/status`:
  - Batches query for issue URLs/identifiers against GitHub or Gitea API.
  - Returns current state, comment counts, and latest update timestamps.
- Add route `GET /dsh-issue-reporter/labels`:
  - Queries target repository labels and returns recommended labels.

### 3. `lib/client.js` (Web UI)
- **AI Summary Button in Compose Tab**:
  - "✨ AI Optimize": sends current draft to `/dsh-issue-reporter/ai/optimize`, smoothly streams or replaces draft with clean Reproduction Steps, Expected vs Actual Behavior, and formatted code blocks.
- **Diagnostics Tab - Session Logs Section**:
  - Live log table with checkboxes and search filter.
  - "Attach Selected Logs to Draft" button.
- **History Tab - Issue Watcher**:
  - "↻ Check Status" button.
  - Badges for `Open` (emerald), `Closed` (purple), and `💬 N comments`.
  - Polling or on-demand check updating `localStorage`.
- **Compose Tab - Auto-Label Selector**:
  - Tag pill list showing available repository labels with intelligent recommended labels highlighted.

### 4. Tests (`test/*.test.mjs`)
- Unit tests for AI prompt generator and response parser.
- Unit tests for log snippet redaction and formatting.
- Unit tests for issue watcher state parsing.
- Unit tests for auto-labeling recommendation engine.
- Integration tests for `report_issue` tool invocation.

### 5. Documentation & Release Gate
- Update `docs/design/DESIGN.md`.
- Update `README.md`, `README.ru.md`, `README.zh.md`.
- Keep package size strictly < 256 KiB.
