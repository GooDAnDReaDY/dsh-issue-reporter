# Agent guide

## Product / Purpose

- Project: dsh-issue-reporter
- DEV: /mnt/external/Project/DEV/dhsplugins/dsh-issue-reporter
- Purpose: preview and submit actionable GitHub bug reports from DeepSeek Harness.
- Primary users: DSH users who installed plugins backed by public GitHub repositories.
- Current status: active development for Gitea issue #1.

## Package identity

Keep all three package identity sites aligned as @goodandready/dsh-issue-reporter:

1. package.json package name
2. cordis.patch.yml loader name
3. lib/client.js loader id

The short Cordis patch id remains dsh-issue-reporter.

## Workflow

- All development happens in the assigned Git worktree; the DEV root is read-only.
- Use /home/vadim/.ssh/bin/git-codex for every Git operation.
- Commit one coherent logical result at a time and reference Gitea issue #1.
- Do not publish to GitHub or npm and do not deploy to production without explicit approval.
- Never commit tokens, credentials, private keys, real user data, internal addresses, or worktree paths.

## Security and product constraints

- GitHub user access is OAuth Device Flow for a GitHub OAuth App; no shared bot token and no client secret in the plugin.
- Store OAuth material only through DSH Credentials; settings may contain only the credential reference.
- External writes require a visible preview and strict explicit confirmation.
- Redact secrets, tokens, private paths, and likely personal data before a draft is created.
- English is canonical and Chinese is mandatory; Russian product strings are not allowed.
- The plugin must remain useful without credentials by offering a safe prefilled issues/new link.

## Testing

- npm test is required before each behavior commit.
- Tests must use deterministic fixtures and injected fetch implementations; no live GitHub calls.
- Before release, install the exact package candidate on the isolated MiniPC DSH profile and run the full plugin smoke checklist.

## Documentation gate

Keep docs/design/DESIGN.md, docs/plans/issue-1-github-issue-reporter.md, index.md, and the README navigation current with the implementation. Record durable decisions and verified results in Memory Brain.
