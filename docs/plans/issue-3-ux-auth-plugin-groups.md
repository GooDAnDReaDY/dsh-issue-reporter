# Issue #3 implementation plan

## Scope

- Remove the duplicate top-level report action from the collapsed card body.
- Replace raw client id, credential reference and API URL inputs with a user-facing GitHub sign-in action.
- Keep installation-only authentication configuration on the host and expose only sign-in availability and connection state to the browser.
- Categorize installed packages as native when their name starts with @deepseek-ai/; all other valid package names are third-party.
- Render both groups as independently collapsible lists.
- Preserve same-origin checks, redaction, duplicate search, explicit confirmation and the prefilled-link fallback.
- Keep English canonical and Chinese required; do not add Russian UI strings.

## Acceptance

- The card has exactly one action that opens the report surface.
- The normal settings surface contains no manual auth configuration fields.
- Native and third-party groups can be opened and collapsed separately.
- A missing installation client id produces a clear unavailable state.
- Existing report, redaction, duplicate and confirmation behavior remains intact.
- Unit, static and isolated MiniPC checks pass before any publication or production replacement.
