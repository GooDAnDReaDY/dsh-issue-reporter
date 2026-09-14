# Changelog

## Unreleased

- Added explicit GitHub sign-out to clear the stored account credential and support switching accounts.

- Prevented a slow remote inventory adapter from blocking the local plugin catalog and GitHub sign-in status.

- Fixed GitHub App Device Flow requests to use the GitHub OAuth host instead of the REST API host.
- Sent Device Flow parameters as query parameters required by GitHub OAuth endpoints.
- Made the reporter card header and supported plugin inventory rows the clickable actions, removing trailing duplicate action buttons.

## 0.1.0

- Initial public-ready development baseline for Gitea issue #1.
