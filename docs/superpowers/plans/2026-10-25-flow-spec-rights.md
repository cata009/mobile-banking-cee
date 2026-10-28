# Flow Specs rights implementation plan

> Execute with superpowers:executing-plans. Approval: user, 2026-10-25. No publication.

**Goal:** Preserve shared-password read access and add personal View/Edit/Admin identities, durable versioned Specs storage and integration with the user's existing local editor.
**Architecture:** Existing React/Vite UI consumes a platform API. Better Auth owns passwords/sessions; SQL owns role grants and immutable Specs revisions. Browser content uses an explicit editor codec; code-owned flow structure cannot be written through the API.
**Tech Stack:** TypeScript, Better Auth, Kysely, PostgreSQL; embedded PostgreSQL for isolated local tests.
**Spec:** `docs/superpowers/specs/2026-10-25-flow-spec-rights.md` (approved proposal copied from `/workspace/plan-drepturi-flows.md`).

## Constraints and review focus
- No push, PR, merge, deployment, cloud provisioning or production-account creation.
- Preserve local editor changes; its location/format is pending from user. Do not reconstruct the editor from older Git code.
- Work in existing checkout per AGENTS.md. No branch/index mutation; initial checkout clean at 3cec8b3.
- Personal role/status must be checked server-side on every operation, including concurrent revocation.
- Shared/mobile cookies and forged payload roles never confer Edit/Admin.
- Temporary-password users cannot edit/admin until password changed; last admin cannot be disabled/demoted.
- Concurrent save/version restore must be atomic and retain authorship; rollback never deletes history.
- Specs are data. Registered flow IDs and technical definitions cannot be changed via saved content.

## Task 1: Individual identity and authorization
Files: `server/src/auth.ts`, `server/src/database.ts`, `server/src/app.ts`, `server/tests/identity.test.ts`.
- [x] Write API integration tests using real auth and PostgreSQL for login, disabled signup, roles, temporary passwords, revoked/expired sessions and cross-origin mutations; observe RED.
- [x] Implement auth factory, SQL migrations and API permission boundary; test GREEN.
- [x] Add Admin-only user creation, role/disable/reset and last-admin guard, with audit and regression tests.

## Task 2: Versioned Specs API
Files: `server/src/specifications.ts`, `server/tests/specifications.test.ts`.
Consumes: authenticated user identity; produces read/save/history/restore endpoints with `revisionId` and optimistic concurrency.
- [x] Write tests for reader denial, injected author/role, concurrent saves, failed transactions and restart persistence; observe RED.
- [x] Implement transactional revisions/audit and registered-document validation. Codec is injected until local editor format is inspected; no generic arbitrary FlowDefinition writes.
- [x] Verify complete server suite and types.

## Task 3: Local runtime and account bootstrap
Files: `server/src/dev.ts`, `server/src/bootstrap.ts`, `server/.env.example`, `server/README.md`.
- [x] Add loopback local API runner, explicit local storage path, migrations and one-time Admin bootstrap with secret input outside logs.
- [x] Exercise real HTTP login/write/logout and reopening persistent local database.

## Task 4: Existing editor integration (requires user's local editor)
Files: determined after inspecting local editor; update scope before edits.
- [ ] Capture local pending changes and document schema.
- [ ] Connect personal login, role-aware controls, Admin users, editor save/conflict/history and consistent exports.
- [ ] Preserve shared reading, preview graph and existing IDs; write behavioral UI/API regressions.
- [ ] Run server checks and repository `npm run verify`, real-browser roles and independent final review.

No task is complete until its checks pass. Missing editor is a dependency, not permission to substitute a new editor.

## Implementation status — local backend milestone

Tasks 1–3 are implemented locally. Independent review identified a credential-change/login race and valid dotted usernames failing internal email validation. Both were reproduced with failing tests, then fixed by serializing login with credential updates and generating opaque internal email identifiers. Full final server verification and root verification are recorded in the local ledger.

Task 4 remains blocked on access to the owner's actual local editor; its location was requested. The existing UI, root package and Vercel routing are unchanged. No end-to-end browser/editor/export validation is claimed. Production PostgreSQL connectivity, cloud backups and deployment configuration remain outside this local milestone.
