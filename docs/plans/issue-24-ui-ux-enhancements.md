# Issue #24, #25, #19, #20, #21, #22, #23 Implementation Plan

## Scope
- Bring reporter UI design and styling to the dsh-clinebot standard (ensureCss, scoped classes, theme variables, ErrorBoundary).
- Enhance usability with tabs (Catalog, Editor/Preview, My Reports, Auth), real-time plugin search filter, and write/preview toggle.
- Support screenshot attachments via Ctrl+V clipboard paste and visual dropzone with image thumbnails.
- Add automated environment diagnostics and quick-reporting for failed plugins with strict redaction.
- Support search in closed duplicates and detect upstream GitHub Issue Templates.
- Support multi-forge repository reporting for local Gitea / Forgejo instances.
- Implement persistent tracking of submitted issues with live status check.

## Slices
1. Phase 1: Design System & UX (Issues #24, #25, #19)
2. Phase 2: Diagnostics & Smart Context (Issue #20)
3. Phase 3: Upstream Compatibility & Multi-Forge (Issues #21, #23)
4. Phase 4: Issue History & Tracking (Issue #22)
5. Phase 5: Verification, Documentation & Standards Compliance
