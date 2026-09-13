# dsh-issue-reporter design contract

## Product promise

The plugin turns a discovered DSH plugin defect into a reviewable GitHub issue
draft. It never sends external data silently: the user sees the selected
repository, sanitized draft, duplicate candidates, and the final confirmation
before a GitHub write.

## Surfaces

- Settings slot: configure the public GitHub App client id, API base URL, and
  credential reference name.
- Settings card: list the current DSH plugin composition, mark unsupported
  entries, start Device Flow, and open a report editor.
- Report editor: title, observed behavior, reproduction, expected behavior,
  optional DSH/plugin context, redaction summary, duplicate search, preview,
  explicit create action, and prefilled-link fallback.

Every surface has loading, empty, success, error, disabled, and confirmation
states. The create action is disabled until a supported repository and valid
draft exist.

## Data flow

1. The browser reads the point-in-time composition through
   ctx.remote.pluginInventory.list().
2. The host enriches module names from package metadata and returns only
   validated GitHub repository targets.
3. Device Flow runs against GitHub without a client secret. The host stores
   returned OAuth material in DSH Credentials under the configured reference.
4. Draft text is redacted and composed locally/host-side. Duplicate search is
   read-only. Issue creation is a confirmed POST to GitHub REST.

## Trust boundaries

- Plugin metadata is untrusted input and is validated before rendering.
- Report text can contain secrets, private paths, URLs with credentials, and
  personal data; redaction is mandatory before preview and API calls.
- GitHub tokens never enter React state, settings snapshots, logs, URLs, or
  issue bodies.
- Same-origin checks protect state-changing local routes.

## Localization

English is the source locale. Chinese (zh) is required. User-facing Russian
strings are intentionally not present; Russian localization belongs to the
separate language plugin.

## Non-goals for issue #1

Automatic issue creation, conversation/screenshot uploads, plugin mutation,
full Issue Forms execution through REST, GitHub App registration, GitHub/npm
publication, and production deployment.
