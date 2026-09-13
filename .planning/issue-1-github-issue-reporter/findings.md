# Findings

- DSH exposes current composition through the read-only pluginInventory/list
  Remote; rows contain the module specifier but not package metadata.
- Package metadata can be resolved by the host from the installed module and
  must be treated as untrusted input.
- GitHub App user access tokens support Device Flow and act on behalf of the
  user; no client secret belongs in a desktop/server plugin.
- GitHub REST issue creation needs repository Issues write permission.
- GitHub Issue Forms are repository files and are not executed by REST issue
  creation; the MVP therefore produces a compatible Markdown body.
- Existing DSH plugins store only credential references in settings and use
  ctx.credentials.resolve/set/unset.
