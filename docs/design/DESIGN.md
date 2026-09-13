# dsh-issue-reporter design contract

## Product promise

The plugin turns a discovered DSH plugin defect into a reviewable GitHub issue draft. It never sends external data silently: the user sees the selected repository, sanitized draft, duplicate candidates, and the final confirmation before a GitHub write.

## Surfaces

- Settings card: discover the current DSH plugin composition and show native @deepseek-ai/* and third-party plugins in independent collapsible groups.
- GitHub authorization: show a short explanation and one "Sign in with GitHub" action. Installation-only values (public Device Flow client id, credential reference and API base URL) stay out of the normal user form.
- Report editor: title, observed behavior, reproduction, expected behavior, optional DSH/plugin context, redaction summary, duplicate search, preview, explicit create action, and prefilled-link fallback.

The card has one top-level open/report action; the collapsed state does not repeat that action inside the body. Every surface has loading, empty, success, error, disabled, and confirmation states. The create action is disabled until a supported repository and valid draft exist.

## Data flow

1. The browser reads the point-in-time composition through ctx.remote.pluginInventory.list().
2. The host enriches module names from package metadata, categorizes package names, and returns only validated GitHub repository targets.
3. Device Flow runs against GitHub without a client secret. The host stores returned OAuth material in DSH Credentials under the installation-configured reference.
4. Draft text is redacted and composed locally/host-side. Duplicate search is read-only. Issue creation is a confirmed POST to GitHub REST.

## Trust boundaries

- Plugin metadata is untrusted input and is validated before rendering.
- Report text can contain secrets, private paths, URLs with credentials, and personal data; redaction is mandatory before preview and API calls.
- GitHub tokens never enter React state, settings snapshots, logs, URLs, or issue bodies.
- Same-origin checks protect state-changing local routes.

## Localization

English is the source locale. Chinese (zh) is required. User-facing Russian strings are intentionally not present; Russian localization belongs to the separate language plugin.

## Non-goals for issue #3

GitHub App registration, automatic token refresh, account profile display, screenshots/uploads, plugin mutation, GitHub/npm publication, and production deployment.
