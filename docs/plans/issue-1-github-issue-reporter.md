# Issue #1 implementation plan

## Definition of Ready

- Expected result: a public-ready DSH plugin that discovers GitHub-backed
  plugins, composes a sanitized report, searches duplicates, and creates an
  issue only after confirmation.
- Components: package manifest, Cordis patch, host routes, pure domain logic,
  browser settings card, locales, unit tests, documentation.
- Risks: OAuth expiry/revocation, GitHub permissions/rate limits, sensitive
  report context, stale composition snapshots, and REST/Issue Form mismatch.
- Reuse-first: DSH pluginInventory/list, @deepseek-ai/dsh-api-remotes,
  DSH Credentials, native fetch, and the existing settings slot.
- Blast radius: isolated new package; no existing plugin or Hermes config is
  changed.
- Verification: deterministic unit tests, static package checks, isolated
  MiniPC install/smoke test before publication.

## Delivery slices


## Account switching

When an account is configured, the authorization section exposes a Sign out action. It removes the OAuth material from DSH Credentials and clears in-memory Device Flow state, so the next Sign in action can authorize a different GitHub account.

1. Package identity, design contract, domain validation/redaction/composition,
   and fixtures.
2. Host GitHub client, Device Flow, credential storage, catalog and issue
   routes with same-origin and confirmation guards.
3. Browser settings card with inventory, editor, preview, duplicate results,
   auth and fallback states in English and Chinese.
4. Documentation gate, tests, package candidate, isolated DSH test, and cleanup.

## Definition of Done

- [ ] Implementation committed and pushed to the issue branch.
- [ ] npm test and static checks pass.
- [ ] No secrets or local infrastructure details in publishable files.
- [ ] Isolated MiniPC plugin install and smoke checks pass.
- [ ] Gitea issue has evidence and remains open until the complete workflow.
- [ ] Publication/deploy wait for explicit owner approval.

## Release preparation addendum — 2026-09-14

- The complete implementation is present on the release candidate branch from the merged `origin/main` baseline.
- User-facing documentation has been expanded in English, Chinese, and Russian; the design contract, changelog, and project index now describe the final feature set and the publication boundary.
- The npm package allowlist is restricted to runtime/public documentation files and excludes internal plans from the published artifact.
- The previously installed production candidate was manually accepted by the owner for issue creation both with and without a screenshot; no new external issue should be created by automated checks.
- Remaining release gates are the final deterministic tests, exact package dry-run, isolated MiniPC package cycle, repository review/merge, and explicit owner approval before GitHub/npm publication.
