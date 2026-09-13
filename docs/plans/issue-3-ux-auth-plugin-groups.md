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

## Post-acceptance follow-up

- The collapsed reporter card opens and closes when its full header row is clicked; no separate top-level report/close button is rendered.
- A supported installed plugin is selected by clicking its full inventory row; no trailing Report a bug button is rendered.
- GitHub Device Flow requests use github.com/login/...; GitHub REST calls continue to use the configured API base URL.
- The Device Flow tests cover both the code request and authorization polling host.
