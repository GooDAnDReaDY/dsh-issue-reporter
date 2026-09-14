# Changelog

## Unreleased

- Added explicit GitHub sign-out to clear the stored account credential and support switching accounts.

- Prevented a slow remote inventory adapter from blocking the local plugin catalog and GitHub sign-in status.

- Fixed GitHub App Device Flow requests to use the GitHub OAuth host instead of the REST API host.
- Sent Device Flow parameters as query parameters required by GitHub OAuth endpoints.
- Made the reporter card header and supported plugin inventory rows the clickable actions, removing trailing duplicate action buttons.

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
- Publication remains pending explicit owner approval; this entry describes the candidate and does not publish GitHub or npm artifacts.
