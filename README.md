# dsh-issue-reporter

Create actionable GitHub issues from DeepSeek Harness with user-owned context and privacy controls.

The settings card discovers installed plugins from the current DSH composition and separates them into two independently collapsible groups:

- Native DSH plugins with the @deepseek-ai/ package scope.
- Third-party plugins from every other package scope.

Users choose a supported plugin, complete a report, review the redacted preview and possible duplicates, and explicitly confirm before an issue is created. GitHub authorization is started from a single "Sign in with GitHub" action. The technical Device Flow client id, credential reference and API URL are installation configuration, not user-facing form fields.

Without a configured GitHub App client id, the plugin explains that sign-in is unavailable. Without an authorized account, it keeps the prefilled issue-form fallback available.

## Documentation

- [Design contract](docs/design/DESIGN.md)
- [Issue #1 implementation plan](docs/plans/issue-1-github-issue-reporter.md)
- [Issue #3 UX/auth/grouping plan](docs/plans/issue-3-ux-auth-plugin-groups.md)
- [Chinese documentation](README.zh.md)
- [Russian documentation](README.ru.md)

## Development

Run the deterministic test suite with:

    npm test

GitHub App registration, publication and production deployment require separate owner approval.
