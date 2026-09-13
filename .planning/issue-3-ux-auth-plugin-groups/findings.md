# Issue #3 findings

- Native classification is package-name based: @deepseek-ai/ is native; every other valid package name is third-party.
- The browser must not receive the Device Flow client id, credential reference or API base URL as editable settings.
- Device Flow still requires an installation-configured public GitHub App client id. If it is absent, the UI reports that sign-in is unavailable.
- The existing prefilled issue-form fallback remains usable without OAuth.
