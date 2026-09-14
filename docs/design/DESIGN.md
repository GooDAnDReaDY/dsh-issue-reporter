# dsh-issue-reporter design contract

## Product promise

The plugin turns a discovered DSH plugin defect into a reviewable GitHub issue draft. It never sends external data silently: the user sees the selected repository, sanitized draft, duplicate candidates, selected screenshots, and the final confirmation before a GitHub write.

## Surfaces

- Settings card: discover the current DSH plugin composition and show native @deepseek-ai/* and third-party plugins in independent collapsible groups.
- GitHub authorization: show a short explanation and one "Sign in with GitHub" action. Installation-only values (public Device Flow client id, credential reference and API base URL) stay out of the normal user form.

- Changed in 2026-09-14: when an account is configured, the authorization section also offers Sign out. It clears the stored OAuth material and lets the user authorize a different GitHub account.
- Report editor: title, observed behavior, reproduction, expected behavior, optional DSH/plugin context, optional bounded screenshot attachments, redaction summary, duplicate search, preview, explicit create action, and prefilled-link fallback.

The card has one top-level open/report action; the collapsed state does not repeat that action inside the body. Changed in the post-issue-3 UX follow-up: the whole card header row opens and closes the card, and each supported plugin row opens its report editor, so neither action is represented by a separate trailing button. Every surface has loading, empty, success, error, disabled, and confirmation states. The create action is disabled until a supported repository and valid draft exist.

## Data flow

1. The browser reads the point-in-time composition through ctx.remote.pluginInventory.list().
2. The host enriches module names from package metadata, categorizes package names, and returns only validated GitHub repository targets.
3. Device Flow runs against a GitHub OAuth App without a client secret and requests the repo scope: code and token requests use the GitHub web OAuth host (github.com), while repository and user API calls use the configured REST API host (api.github.com by default). The host stores returned OAuth material in DSH Credentials under the installation-configured reference.
4. Draft text is redacted and composed locally/host-side. Duplicate search is read-only. Selected screenshots stay in browser memory until confirmation. A report without screenshots is created through GitHub REST; a report with screenshots is created through the official GitHub CLI attachment flow in a bounded temporary directory, which is deleted after the command exits.

## Trust boundaries

- Plugin metadata is untrusted input and is validated before rendering.
- Report text can contain secrets, private paths, URLs with credentials, and personal data; redaction is mandatory before preview and API calls.
- GitHub tokens never enter React state, settings snapshots, logs, URLs, or issue bodies.
- Same-origin checks protect state-changing local routes.

- Screenshot files are validated by extension, MIME type, count, and size before upload. They are not written to DSH storage or logs; temporary upload files are removed after the GitHub CLI process finishes.

## Localization

English is the source locale. Chinese (zh) is required. User-facing Russian strings are intentionally not present; Russian localization belongs to the separate language plugin.

## Attachment limitation

Screenshot uploads require GitHub CLI 2.99 or newer on the DSH host and GitHub.com or GitHub Enterprise Cloud support for gh issue create --attach. GitHub App tokens are not supported by this GitHub CLI attachment flow, so users must use a GitHub OAuth App token or a personal access token for reports that include screenshots. Plain issue creation remains available with the existing OAuth App Device Flow token.

## Non-goals for issue #3

GitHub OAuth App registration, automatic token refresh, account profile display, video uploads, plugin mutation, GitHub/npm publication, and production deployment.

## Release candidate addendum — 2026-09-14

The implementation is being prepared as version `0.1.0` under the public package identity `@goodandready/dsh-issue-reporter`. The candidate includes the complete issue-1 workflow and the issue-3 interaction changes described above: OAuth App Device Flow, account switching, native/third-party plugin groups, full-row interaction, privacy-safe drafting, duplicate search, explicit confirmation, and bounded screenshot attachments.

The package allowlist includes runtime files, localized READMEs, the design contract, and release metadata. Internal agent instructions, inventory indexes, and implementation plans remain repository documentation and are excluded from the published npm package.

Publication is intentionally a separate controlled step. The candidate passed the deterministic test suite, npm pack inspection, isolated MiniPC install/smoke/cleanup, and final repository review; the owner has approved publication of this version.

## Design System & Usability Addendum — 2026-09-14 (v0.1.1)

- **dsh-clinebot Design Alignment**: central CSS injection via `ensureCss()` using standard DSH theme variables (`--dsw-alias-bg-layer-*`, `--dsw-alias-border-*`, `--dsw-alias-label-*`, `--dsw-alias-state-*`). Top header displays status capsule badges (`.ir-badge`) for GitHub connectivity, plugin inventory counts, and Node.js runtime.
- **ErrorBoundary**: the settings card root is protected with an ErrorBoundary component to isolate rendering failures and offer in-place retry.
- **Navigation Tabs**: four logical tabs (`Catalog`, `Report Editor`, `My Reports`, `Authorization`) keep the card compact and task-focused.
- **Search & Filtering**: real-time filter input above plugin lists allows instant location by name, module, or description.
- **Clipboard Paste & Dropzone**: screenshot attachments support `Ctrl+V` clipboard paste from screenshot utilities and drag-and-drop file zones with thumbnail cards, size badges, and deletion controls.
- **Dual-mode Editor**: `Write` and `Preview` sub-views provide side-by-side editing and formatted Markdown inspection before confirmation.
- **Automated Diagnostics**: system runtime context (Node.js, OS, architecture) is automatically gathered and safely redacted into the Environment section. Plugins with runtime failures offer a one-click Quick Report with captured stack traces.
- **Multi-Forge Architecture**: targets expand to include local and self-hosted Gitea/Forgejo instances alongside GitHub repositories.
- **Issue Tracking**: submitted issues are preserved in local storage and displayed in the 'My Reports' tab with live status checks (`Open`/`Closed`).
