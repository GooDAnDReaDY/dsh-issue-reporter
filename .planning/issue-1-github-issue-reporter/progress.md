# Progress

## 2026-09-13

- Repository goodandready/dsh-issue-reporter created privately in Gitea.
- Issue #1 created with the agreed MVP, risks, out-of-scope boundaries, and
  acceptance criteria.
- Canonical checkout and branch feat/issue-1-github-issue-reporter created from fresh origin/main.
- Implementation worktree is the only writable project location.

- Added a live settings watcher so host routes use the current UI configuration.

- Host endpoints now use the DSH connection browser-auth and same-origin
  rejection policy; unauthenticated, cross-site, and wrong-method probes were
  tested on the isolated MiniPC service.
- npm test: 9 passed, 0 failed. Node syntax checks, package allowlist,
  git diff --check, and clean publishable-file scans passed.
- Candidate package installed on the isolated MiniPC web profile. DSH loaded
  @goodandready/dsh-issue-reporter as an active plugin and exposed the
  client bundle reference.
- Final candidate from commit 11b9efb passed the same MiniPC smoke suite:
  status 200 with a browser cookie, unauthenticated 401, wrong method 405,
  cross-site 403, draft and duplicate routes 200, and create guard 400.
- Checked package and candidate artifact were removed; only permanent lanmode
