# dsh-issue-reporter design contract

## Product promise

The plugin turns a discovered DSH plugin defect into a reviewable issue draft for GitHub or Gitea/Forgejo. It never sends external data silently: the user sees the selected repository, sanitized draft, duplicate candidates, selected screenshots, recommended labels, and the final confirmation before an upstream write. When invoked by an autonomous agent through `ctx.tools`, it produces a reviewable draft and prefilled link for human review, never publishing upstream automatically.

## Surfaces

- Settings card: discover the current DSH plugin composition and show native `@deepseek-ai/*` and third-party plugins in independent collapsible groups. Includes an in-place version check and 1-click update banner when a newer release is published on the registry.
- Navigation tabs:
  - **Catalog**: searchable plugin inventory with failure badges and quick-reporting actions.
  - **Report Editor**: dual-mode `Write` and `Preview` panes, AI-assisted draft optimization button, session log snippet selector, auto-labeling chips, screenshot dropzone with clipboard paste, redaction summary, duplicate issues list, and explicit submission confirmation.
  - **My Reports**: session and local history with batch status refresh tracking open/closed state and comment counts.
  - **Authorization**: GitHub OAuth App Device Flow sign-in, switch account / sign out, and Gitea credential status.
- Autonomous Tool Surface: `report_issue` tool registered in Cordis `ctx.tools` enabling agents to prepare sanitized bug report drafts with prefilled review URLs for failing plugins during automated workflows without direct external writes.

## Data flow

1. The browser reads the point-in-time composition through `ctx.remote.pluginInventory.list()`.
2. The host enriches module names from package metadata, categorizes package names, and returns only validated GitHub or Gitea repository targets.
3. Device Flow runs against a GitHub OAuth App without a client secret and requests the repo scope: code and token requests use the GitHub web OAuth host (`github.com`), while repository and user API calls use the configured REST API host (`api.github.com` by default). The host stores returned OAuth material in DSH Credentials under the installation-configured reference.
4. Draft text is redacted and composed locally/host-side. Duplicate search is read-only.
5. AI Optimization (`/dsh-issue-reporter/ai/optimize`) redacts all user-supplied input fields (observed, reproduction, expected, environment, error stacks, diagnostics) before constructing prompts, invokes `ctx.llm` with sanitized messages, and ensures returned model responses are sanitized before delivery, with a fully redacted heuristic fallback.
6. Session Logs (`/dsh-issue-reporter/logs`) extracts sanitized lines from the harness session log service.
7. Issue Watcher (`/dsh-issue-reporter/issues/batch-status`) queries repository issues in batch and updates ticket states.
8. One-click updater (`/dsh-issue-reporter/update`) runs safely on loopback with `x-dsh-plugin-update: 1` header, installing the exact npm package version via `dsh plugin add`.

## Trust boundaries

- Route authorization fails closed with HTTP 503 when the DSH connection service is missing or cannot evaluate the request. Connection service resolution employs defensive fallbacks (`ctx.reflect?.get('connection')` -> `ctx.get('connection')` -> `ctx.connection`) to guard against host context differences without exposing unprotected endpoints.
- Plugin metadata is untrusted input and is validated before rendering.
- Report text can contain secrets, private paths, URLs with credentials, personal data, LAN IPs, and session tokens; redaction is mandatory before preview, logs inspection, prompt assembly, and API calls. Hardened redaction captures token/secret suffixes (`*_token=`, `*_secret=`, `*_password=`, `*_key=`), camelCase keys (`accessToken`, `clientSecret`), Basic and Bearer auth headers, all POSIX absolute filesystem roots (`/etc`, `/var`, `/tmp`, `/root`, `/usr`, etc.), and Windows UNC/drive paths without corrupting standard web URLs.
- AI draft optimization (`/dsh-issue-reporter/ai/optimize`) must never send raw credentials, tokens, filesystem paths, internal LAN IPs, or user data to external LLM providers; prompt construction enforces host-side redaction across all parameters.
- In-progress report drafts are saved to `sessionStorage` and cleared upon confirmed issue submission to prevent accidental data loss.
- GitHub and Gitea tokens never enter React state, settings snapshots, logs, URLs, or issue bodies.
- Same-origin and loopback checks protect state-changing local routes and updater operations.
- Autonomous agent tool calls (`report_issue`) never publish externally; they always return a sanitized draft and prefilled URL for human review. Upstream issue creation requires interactive browser-based review and explicit confirmation via `/dsh-issue-reporter/create`.
- Screenshot files are validated by extension, MIME type, count, and size before upload. They are not written to DSH storage or logs; temporary upload files are removed after the GitHub CLI process finishes.

## Implementation boundaries

- The settings-card client is authored as ordered modules in `src/client/`. `scripts/build-client.mjs` assembles them into the single-loader runtime entry at `lib/client.js`; tests and package prepack rebuild that artifact. Keep module responsibilities separated and avoid hand-editing the generated bundle.
- Server routes are split by responsibility under `lib/routes/` and registered by `lib/index.js`. Write routes validate the request origin and method before changing state; route modules retain explicit HTTP method registration.
- UI styles are installed once per plugin using the stable `data-dsh-plugin` marker, DSH theme tokens, and the core chevron primitive when available with a small SVG fallback. Locale changes subscribe to LocaleFace snapshots; do not call undocumented locale methods.
- User-facing labels use localized text and DSH primitives rather than decorative emoji.
- Every referenced DSH theme token must exist in the supported core theme-token set; tests scan the generated client bundle for unknown token names.
- Errors are only converted into empty results for documented optional cases (for example, optional telemetry logs). Authorization, credentials, and remote API failures remain visible to the caller and are logged where a safe fallback is intentionally used.
- Updater failures distinguish network errors from HTTP responses, preserving the localized message and showing the HTTP status when the server returned a non-success response.
- Development work occurs only in dedicated worktrees under `.worktrees/<branch>`; completed task worktrees are verified as ancestors of `origin/main` and pruned promptly to maintain a clean repository tree.
- Host configuration conforms to DSH 0.2: `Config` defines `.volatile()` for editable non-secret properties (`appClientId`, `apiBaseUrl`, `giteaBaseUrl`, `timeoutMs`, `ghPath`), while credential references retain `role('credential-ref')`. The host settings service uses safe opt-out (`settings.configure({ auto: false }, ctx.fiber)`) without calling deprecated `settings.register()` or `scope.watch()`. Dynamic configuration updates are listened via `loader/volatile-update`, `config`, and `settings/document-updated` to support zero-downtime hot reload.

## Localization

English is the source locale. Chinese (zh) is required. User-facing Russian strings are intentionally not present in plugin runtime code; Russian localization belongs to the separate language plugin. Full documentation is provided in English, Russian, and Chinese.
