# Flow Specs platform API — local implementation

This package implements named username/password sessions, View/Edit/Admin permissions, per-flow grants, user administration, anchored team discussions/questions and versioned specification storage. The web app now includes personal entry, account management, collaboration and full-text Specs search. No deployment is included.

**Integration dependency:** the owner's Confluence-like Specs editor is on their local disk and has not been supplied. No replacement editor or guessed rich-text schema is included. The dev server deliberately registers no Specs documents until that editor's schema is inspected. The complete save/read/history/restore service is exercised using a strictly validated test document format.

## Run locally

Requires Node 22.11–24. Run from `server/`:

```sh
npm ci
cp .env.example .env.local
```

Set `PLATFORM_AUTH_SECRET` in the ignored `.env.local` to a fresh random secret of at least 32 characters. Do not reuse the shared gate's cookie secret. Set `PLATFORM_ORIGIN` to the frontend origin. Start with the default embedded PostgreSQL, or provide a local `DATABASE_URL` for regular PostgreSQL. Do not point local bootstrap/migrations at a production database.

```sh
npm run bootstrap
# Return to the repository root:
cd ..
npm run dev:platform
# In another terminal, from the root:
npm run dev
```

Run bootstrap **before** the dev server: embedded PostgreSQL owns one local data directory and must not be opened by two processes at once. Bootstrap asks for the Admin username, display name and a hidden password; it refuses to run a second time on a nonempty user table. It does not print or store plaintext passwords. Generated temporary passwords are returned once by authenticated Admin API operations, for individual delivery to the intended user.

The API binds only `127.0.0.1:8787`. Root `npm run dev:platform` first generates the code-owned read-only anchor catalog, then starts the API. Root Vite proxies `/api/platform` to that loopback service. Both root and server dependencies must be installed (`npm ci` and `npm --prefix server ci` from the root). Use personal sign-in on the access page; temporary-password accounts must choose a new password before entry. The existing shared reading option remains. Cookies stay same-origin; credentials and secrets are never stored in browser storage. Root `npm run verify` and CI include server tests/types.

Library Admin controls manage default user roles and separate flow overrides. View/Edit overrides replace defaults for one flow; global Admin always retains access. Editors can comment, and View users can separately receive comment permission. Shared visitors see reading/search but require a personal account to see team discussions. The catalog is source metadata, not an editor document format. Original assets and technical IDs are preserved.

Discussion APIs use `/flows/:flowId/permissions`, `/access` (Admin GET/PUT/DELETE), `/catalog`, `/collaborators`, `/threads` (GET/POST), `/threads/:id` (GET/PATCH), and `/threads/:id/replies` (POST), under `/api/platform`. Thread edits/replies require `expectedVersion`; a final decision is required to resolve a question. Paginated lists return `nextCursor`. Unknown/forged context, source changes, unauthorized grants and cross-flow IDs are rejected.

Unsent drafts are retained in session memory by identity, flow and thread. Their kind, quote, source context and base version stay attached across tabs and temporary session recovery. Closing/reloading shows an unsaved warning; drafts are not advertised as permanently saved. A refreshed decision cannot advance a dirty draft's version silently: compare and explicitly reapply before saving. Duplicate selected text requires a specific context. Preview modules load by family; capture waits for module/Native readiness, and background export copies mount only during export. Existing lossless build optimization is reused.

## Endpoints

All endpoints use `/api/platform`. Mutations require an exact approved Origin and JSON body. Responses use `private, no-store`.

| Method/path | Body | Access |
| --- | --- | --- |
| POST `/login` | `{ username, password }` | Personal login, rate limited |
| GET `/session` | — | `{ user: null }` or current personal identity/role |
| POST `/logout` | `{}` | Revokes personal session |
| POST `/password` | `{ currentPassword, newPassword }` | Personal session, including temporary-password users; requires sign-in again |
| GET `/users` | — | Admin |
| POST `/users` | `{ username, name, role }` | Admin; returns identity and one-time temporary password |
| PATCH `/users/:id` | `{ role?, disabled? }` | Admin; revokes target sessions; protects last active Admin |
| POST `/users/:id/reset-password` | `{}` | Admin; returns temporary password, revokes sessions |
| GET `/specifications/:flowId` | — | Named user or valid existing shared-reader cookie |
| PUT `/specifications/:flowId` | `{ expectedRevision, document }` | Edit/Admin after temporary password change |
| GET `/specifications/:flowId/history` | — | Edit/Admin; latest 100 metadata entries |
| GET `/specifications/:flowId/history/:revisionId` | — | Edit/Admin; immutable revision |
| POST `/specifications/:flowId/restore` | `{ expectedRevision, revisionId }` | Admin; creates a new version |

Roles are `viewer`, `editor`, `admin` in the API. Ordinary viewers and shared-password readers cannot inspect private history or user administration. A personal session does not become privileged from payload roles, browser storage or the simulated banking customer. Raw Better Auth HTTP endpoints are not mounted, including signup and administration.

Temporary-password accounts may read the current document and change their password; they cannot write or administer. Every protected write rechecks session, current role and status within the same serialized transaction as the write. Role changes and password resets revoke existing sessions. Sessions expire after eight hours; logout revokes them. Usernames are case-insensitive and stable in this version.

Login credential checks and session creation share that transaction boundary, so an in-flight login using an old password cannot escape a concurrent password change/reset. The global lock deliberately favors simple, consistent permissions for a small editing team; higher traffic would require more granular locking and edge rate limiting before password hashing.

## Connect the existing editor

Create code-owned `SpecificationRegistration` entries using the actual local document schema. Each registration supplies a stable `flowId`, format/schema version, source snapshot identity, the initial document and a **strict** `parse(unknown)` validator. The parser must allow only editorial content and safe formatting/URLs supported by the real editor, including sanitization at rendering/export boundaries. Never use an identity function or accept an arbitrary `FlowDefinition`.

Pass the registrations to `createPlatform`/`openRuntime`. Run migration/seeding explicitly (`migrate: true`) during local setup. Production request handlers must use `migrate: false`; migration is an operator task, never a request from a reader/editor. Initial import is idempotent and never replaces existing revisions. Schema/format changes require an explicit data migration.

Wire the existing editor to GET/PUT using `revisionId` as `expectedRevision`. On HTTP 409 `REVISION_CONFLICT`, keep the unsaved text and load the current document for comparison. Do not silently retry over the new revision. Only show “Saved” after a successful response. PDF/Word/Confluence/ZIP consumers must use that same resolved revision. The ZIP must identify both the current document revision and the actual code snapshot, including uncommitted local editor sources when applicable.

New revisions, the current pointer and their audit event commit atomically. Restore appends a revision and does not delete history. The server retains author ID, timestamp, base revision and source snapshot. Historical metadata can be read by ID even after falling outside the latest-100 list. An Admin audit-list UI/pagination can be added with the frontend; raw credential material is never part of audit details.

## Verification and boundaries

```sh
npm test
npm run typecheck
```

Tests use actual Better Auth password/session handling and embedded PostgreSQL, including restart persistence, concurrent saves, rollback after an audit failure, role revocation, temporary-password handling, last-Admin protection, legacy-cookie validation and loopback HTTP. No live identity service, Vercel project or cloud database is used.

Previous backend milestone (2026-10-25): **18/18 server tests passed**, server TypeScript passed, and interactive bootstrap/login/Admin/logout passed with a disposable database. Independent review findings were reproduced and fixed. The existing app's **3,953 tests across 343 files passed**, along with its type, lint and formatting checks. Root `npm run verify` stops at an existing asset-baseline mismatch: baseline expects 1,477 images, while both unchanged Git HEAD `3cec8b3` and the working tree have 1,479 (aggregate `132f40b242fc59295ab0d7014951f9ad3cd17abcae2d0007e6f61e5f060c7c19`). The asset baseline is preserved; this is not reported as a fully passing root gate.

The remaining module/retired-PI audits and standalone `npm run build` passed separately. The build produced only local artifacts; nothing was deployed. New code and documentation pass the repository's task-scope check.

Production is designed to use the `pg` connection pool and PostgreSQL through `DATABASE_URL`, never a serverless local file. That adapter and a future Vercel route must be verified against the chosen managed database before deployment. No Vercel route is mounted by this package today. No production account or secret is created.

Still pending the user's local editor: document-editing controls/conflict UI, the real document registration/migration and exports using edited content. Personal login/Admin/collaboration UI now operates around the existing read-only source Specs. Production database connectivity and activation remain outside this local implementation.

## Collaboration validation — 2026-10-25

Final combined run: 24/24 server integration tests and types passed; 3,973/3,973 app tests across 347 files passed; root types/lint/format passed. Coverage: 86.50% statements/lines, 82.93% branches, 65.22% functions, all above the unchanged thresholds. Root gate then stops only at the pre-existing asset-baseline mismatch described above; current image aggregate matches unchanged HEAD. No source images were changed. Independent review findings were reproduced and fixed; actual browser tests verified direct personal entry, three identities, cross-user decisions, grants/revocation, search navigation, mobile reflow and a populated Native PNG export. Remaining module/retired-PI audits and standalone build passed. Built output contains seven deferred preview chunks and separate Prime/Fraud presentation chunks. Disposable browser fixtures were shut down and removed; no production accounts were created.
