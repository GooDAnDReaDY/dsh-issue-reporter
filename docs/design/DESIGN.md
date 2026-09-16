# dsh-issue-reporter design contract

## Product promise

The plugin turns a discovered DSH plugin defect into a reviewable issue draft for GitHub or Gitea/Forgejo. It never sends external data silently: the user sees the selected repository, sanitized draft, duplicate candidates, selected screenshots, recommended labels, and the final confirmation before an upstream write. When invoked by an autonomous agent through `ctx.tools`, it produces a reviewable draft by default, or safely files with explicit confirmation.

## Surfaces

- Settings card: discover the current DSH plugin composition and show native `@deepseek-ai/*` and third-party plugins in independent collapsible groups. Includes an in-place version check and 1-click update banner when a newer release is published on the registry.
- Navigation tabs:
  - **Catalog**: searchable plugin inventory with failure badges and quick-reporting actions.
  - **Report Editor**: dual-mode `Write` and `Preview` panes, AI-assisted draft optimization button, session log snippet selector, auto-labeling chips, screenshot dropzone with clipboard paste, redaction summary, duplicate issues list, and explicit submission confirmation.
  - **My Reports**: session and local history with batch status refresh tracking open/closed state and comment counts.
  - **Authorization**: GitHub OAuth App Device Flow sign-in, switch account / sign out, and Gitea credential status.
- Autonomous Tool Surface: `report_issue` tool registered in Cordis `ctx.tools` enabling agents to draft or file structured bug reports for failing plugins during automated workflows.

## Data flow

1. The browser reads the point-in-time composition through `ctx.remote.pluginInventory.list()`.
2. The host enriches module names from package metadata, categorizes package names, and returns only validated GitHub or Gitea repository targets.
3. Device Flow runs against a GitHub OAuth App without a client secret and requests the repo scope: code and token requests use the GitHub web OAuth host (`github.com`), while repository and user API calls use the configured REST API host (`api.github.com` by default). The host stores returned OAuth material in DSH Credentials under the installation-configured reference.
4. Draft text is redacted and composed locally/host-side. Duplicate search is read-only.
5. AI Optimization (`/dsh-issue-reporter/ai/optimize`) integrates with `ctx.llm` when available or formats structured Markdown drafts.
6. Session Logs (`/dsh-issue-reporter/logs`) extracts sanitized lines from the harness session log service.
7. Issue Watcher (`/dsh-issue-reporter/issues/batch-status`) queries repository issues in batch and updates ticket states.
8. One-click updater (`/dsh-issue-reporter/update`) runs safely on loopback with `x-dsh-plugin-update: 1` header, installing the exact npm package version via `dsh plugin add`.

## Trust boundaries

- Route authorization fails closed with HTTP 503 when the DSH connection service is missing or cannot evaluate the request.
- Plugin metadata is untrusted input and is validated before rendering.
- Report text can contain secrets, private paths, URLs with credentials, personal data, LAN IPs, and session tokens; redaction is mandatory before preview and API calls.
- In-progress report drafts are saved to `sessionStorage` and cleared upon confirmed issue submission to prevent accidental data loss.
- GitHub and Gitea tokens never enter React state, settings snapshots, logs, URLs, or issue bodies.
- Same-origin and loopback checks protect state-changing local routes and updater operations.
- Autonomous agent tool calls cannot publish externally without `confirm_submit: true` and configured credentials.
- Screenshot files are validated by extension, MIME type, count, and size before upload. They are not written to DSH storage or logs; temporary upload files are removed after the GitHub CLI process finishes.

## Localization

English is the source locale. Chinese (zh) is required. User-facing Russian strings are intentionally not present in plugin runtime code; Russian localization belongs to the separate language plugin. Full documentation is provided in English, Russian, and Chinese.
