# Flows Collaboration Implementation Plan

> Execute inline with superpowers:executing-plans. User explicitly approved the five features and continuing implementation. No new approval needed. No commits/branches/remote writes per existing checkout and no-publication constraints.

**Goal:** Deliver full-text Specs search, anchored discussions/questions, per-flow permissions and deferred previews with usable local login/Admin UI.
**Architecture:** React feature module consumes `/api/platform`; SQL owns grants/threads/messages. Code-owned catalog validates anchors; document editing remains in the owner's absent local editor.
**Tech Stack:** TypeScript, React, Better Auth, Kysely/PostgreSQL, Vite.
**Spec:** `docs/superpowers/specs/2026-10-25-flow-collaboration.md`.

## Global constraints
- No Vercel publishing, remote writes, branch/index changes, source image changes or replacement editor.
- Preserve existing shared reading, flow IDs/scenario order and source exports.
- Permission/identity checked on server inside serialized transactions; grants cannot confer Admin.
- No hidden draft loss on errors/conflicts, no raw HTML rendering or fake saved status.

## Review focus
- A grant changed while a write waits must be rechecked; existing Specs endpoints must not bypass it.
- A quote/snapshot from another flow or changed source cannot masquerade as the current context.
- Old UI requests after switching flows/users must not expose or apply previous state.
- Preview failure/retry and export capture must retain the actual interactive renderer.
- API unavailable preserves reading/search while collaboration errors remain explicit.

### Task 1: Per-flow permission API
Files: `server/src/flow-access.ts`, `server/src/database.ts`, `server/src/app.ts`, `server/src/specifications.ts`, `server/tests/flow-access.test.ts`.
Interfaces: FlowRegistration contains flowId/title/sourceSnapshot/anchors. `effectiveAccess(db,user,flowId)` returns canEdit/canComment; Admin overrides all. `/flows/:id/access` is Admin read/write; `/flows/:id/permissions` is personal effective access. Existing save/history use same authorization.
- [x] RED: admin caps an editor to View on one flow while another stays editable; viewer comment grant never grants Specs editing; forged/cross-origin/temp/disabled users denied; grant revocation affects current session.
- [x] Implement additive tables/catalog validation and transactional grants with audit.
- [x] GREEN: server tests/typecheck.

### Task 2: Anchored discussions and decisions
Files: `server/src/discussions.ts`, migrations/router, `server/tests/discussions.test.ts`.
Interfaces: `/flows/:id/threads` GET/POST; `/threads/:id/replies` POST; `/threads/:id` PATCH `{expectedVersion,status?,ownerId?,decision?}`; thread includes kind, anchorId, quote, sourceSnapshot, messages, version and stale context. `collaborators` endpoint only editors/admins for assignments.
- [x] RED: real commenter creates/replies; viewer denied writes; only editor resolves; questions require final decision; forged author/anchor/cross-flow thread denied; concurrent changes conflict; reopen retains decision history; restart retains data.
- [x] Implement atomic state/message/audit writes and bounded strict validation.
- [x] GREEN: full server suite/typecheck.

### Task 3: Search and source catalog
Files: `src/features/flow-collaboration/search.ts`, `scripts/generate-flow-catalog.ts`, library index/shell/detail; `tests/flows/flow-search.test.ts`.
Interfaces: `buildFlowSearchEntries(flow)` supplies code-owned anchorId/section/text/optional scenarioId and stepId; `searchFlows(flows,query)` returns flow and matching excerpts; generator serializes validated registrations to ignored local file. No editor schema.
- [x] RED: text only in a rule/paragraph/step is found, diacritics normalize, existing facets apply, excerpt opens actual matching tab/section/step, HTML stays plain text.
- [x] Implement search results/navigation and catalog; verify affected library tests and types.

### Task 4: Local account and per-flow Admin UI
Files: feature API/account/Admin components, `vite.config.ts`, root scripts, server dev/catalog loader; `tests/screens/flow-account.test.tsx`.
- [x] RED: login/forced password change/logout, Admin-only controls, grant settings sent to correct flow, failures preserve input and temporary password shown once.
- [x] Implement using existing controls, cookies and origin-checked API; local proxy and catalog startup; no credentials in localStorage.
- [x] GREEN: UI tests/types and actual loopback API smoke.

### Task 5: Discussion/question UI
Files: feature collaboration panel, library Spec wrapper; `tests/screens/flow-collaboration.test.tsx`.
- [x] RED: anchor selection/quote, commenter posts/replies, editor assigns/resolves with decision, View controls absent, stale conflict/draft preservation and switching flows safely.
- [x] Implement list/detail/form, current-context warnings and keyboard/error/loading states.
- [x] GREEN: UI and server tests; real browser with two accounts.

### Task 6: Deferred previews and final validation
Files: `components/flowPreviews.tsx`, feature async preview renderer; `tests/flows/flow-preview-loading.test.tsx`.
- [x] RED: importing metadata does not load preview families; loading a screen requests only its family, failed load can retry and screenshot/export consumers wait for ready renderer.
- [x] Implement lazy renderer preserving context and existing synchronous exports; reuse current image optimization pipeline.
- [x] Validation: all app/API tests, coverage, types/lint/format passed; remaining module/retired audits and build passed; seven preview chunks and separate presentations confirmed. Root verify exception: unchanged asset baseline1477vs1479, explicitly reported.
- [x] Fresh independent final review; fix important findings with regression evidence, record limits and exact file delta.

## Current validation

Server24/24, frontend review regression13/13 plus direct-entry tests, and affected library/Prime/fraud72/72 passed; root types/lint passed. Real Chromium smoke passed three-account decision/comment/grant/revocation/search and mobile reflow, plus a real ready-Native PNG download. Four Important independent review findings were reproduced and fixed in one pass; drafts retain full context/base version and session responses are sequenced. Combined root verify is now running. Existing baseline1477vs1479 remains an expected pre-existing issue, not an authorized baseline update. Production activation and canonical local editor integration remain excluded/pending respectively.

Final result: 3,973 app tests/347 files and24 API tests passed, coverage thresholds passed. Three pre-existing synchronous-render test suites adapted and82/82 passed; all domain assertions retained. Module/retired audits and build passed independently after the known asset-baseline failure. Built artifacts contain preview.js through preview7.js and separate Prime/Fraud presentation chunks. Browser fixtures stopped and their disposable database removed. No remote publication or production account creation.
