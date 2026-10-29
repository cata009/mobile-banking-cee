# Cloud recovery and local editor integration

> For agentic workers: execute inline with superpowers:executing-plans; preserve the existing checkout per AGENTS.md.

**Goal:** Recover the original 22–28 October Cloud work and integrate it with the existing local editor and email builder.

**Architecture:** Retain the local Tiptap editor, assets, history, exports and storage records. Import the original Cloud authentication, per-flow permissions, discussions, full-text search and deferred previews. Adapt the overlapping specification boundary so the rendered document, its history and authorization describe one document rather than parallel independent copies.

**Tech stack:** Existing React 18, TypeScript, Vite, Tiptap and Vercel Blob; original Cloud server stack to be inspected from its recovered commit.

**Spec:** User requests on 2026-10-28 and docs/flow-spec-editor.md; recovered Cloud design/spec documents supply the original feature contracts.

## Global constraints
- Existing main checkout C:/Users/mihai/Desktop/Mobile Banking - CEE. Do not switch branches, stash, reset, clean or overwrite the shared index.
- Preserve all 88 initial pending paths, marketing email builder, original image bytes and persisted specification data. Backup: the calling workspace _recovery/2026-10-28-cloud-integration/local-pending-and-spec-store.zip.
- Cloud base 3cec8b33cda330260f39fe52eaf3f2a5c842a396; local base 745956e19c87f52bfc84267fa328c48479ccf24e. Committed trees were identical at initial audit.
- User explicitly authorized requesting Cloud export and publishing only its recovery branch. No merge/push to main or deployment.
- Import original source; do not reconstruct missing Cloud functionality from memory.
- Use the approved shared controls and semantic tokens already used by the recovered and local components. No Figma or asset changes.
- Keep strict types, audit assertions and coverage thresholds. Sequential combined verification.

## Review focus
- A viewer or revoked editor must not save, upload or restore by calling the API directly.
- Existing document revisions and original image bytes must survive integration and remain exportable.
- Failed saves, authorization changes and simultaneous edits must preserve the draft.
- Auth/session failures must not silently grant edit rights or show another user's recovered draft.
- Search-to-passage and lazy previews must coexist with the rich editor, screenshot capture and complete export.

## Tasks
### Task 1: Recover original Cloud source
- [x] Back up initial pending work and specification store, with SHA-256 inventory.
- [x] Send explicitly authorized export request to original Mobile cee chat.
- [x] Fetch exported recovery branch; record commit/base, 59-file inventory and patch hash.
- [x] Compare original Cloud and local paths; save untouched recovered source outside the active source tree.

### Task 2: Import original functionality while preserving local work
Files: exact recovered paths recorded in docs/tasks/2026-10-28-cloud-recovery.json; overlap expected in package.json, vite.config.ts, FlowDetail.tsx, flowExport.ts.
Interfaces: consume original recovered server/session/discussion contracts; retain createSpecRepository(), useSpecWorkspace(), rich editor and existing media/export contracts.
- [x] Import new Cloud modules/tests/docs unchanged where possible; merge existing files against the shared base and resolve each conflict explicitly.
- [x] Merge scripts and dependencies without removing local editor/email packages; install original server dependencies.
- [x] Run recovered server and UI tests, plus local editor/email/export tests.

### Task 3: Connect permissions to the existing rich editor and persistence
Files: local flow-spec client/hook/editor/HTTP boundary and minimal recovered server/UI adapters, exact list recorded before edits.
Interfaces: preserve SpecRepository and stored SpecDocument/assets/revisions; derive author and access from the verified personal session when Cloud collaboration is enabled.
- [x] Inspect recovered document/storage contract and choose the smallest adapter preserving existing data; record the decision.
- [x] Write failing integration tests for viewer/editor/admin, direct API denial, save/history/assets continuity and draft preservation on revocation.
- [x] Implement the adapter and UI capability checks; retain recovery, editor formatting and export behavior.
- [x] Run affected server/UI/editor tests and real-host smoke checks.

### Task 4: Verify and hand off combined state
- [x] Run final npm run verify and any original server checks not included in it; inspect outcomes.
- [x] Review the combined delta against backup and original recovered commit; run explicit combined scope check and git diff --check.
- [x] Record recovered source, integration decisions, verification and next operational step. No deployment or main publication.

## Execution decisions
The user has explicitly requested recovery and integration after the previous integration outline, so proceed without repeating design/plan approval. AGENTS.md overrides worktree and branch-switch defaults. Native execution is used in this chat; the original Cloud chat only exports its original work. The recovery audit branch from 7 October is excluded because it predates the requested window and has 152 conflicts in simulation.

## Final evidence

Final `npm run verify` exited 0:4,074 app tests/359 files and25 API tests, strict typecheck/lint/format, all audits and production build. Review fixes covered with RED→GREEN regressions. Browser Admin/Edit/View checks and persistence passed; actual Word export includes all47 expected captures and current editor text. Original operator spec store and email builder sources remain byte-identical. Combined scope/diff checks passed. No local commit/index mutations, main publication or deployment. The account/preview fixture was stopped after verification.
