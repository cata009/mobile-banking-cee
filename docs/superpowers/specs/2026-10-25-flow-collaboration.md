# Flows collaboration — approved implementation scope

User approval: “Aprob toate continua să faci implementarea”, 2026-10-25, following the five recommendations in the conversation. Continue implementation without another approval loop. Existing React/Vite, Better Auth and SQL are reused; no deployment, push, merge or external provisioning.

## Product behavior

1. Extend current title/category/country search to Specs paragraphs, business rules, fields and scenario steps. Results show matched excerpts and open the corresponding Specification section or Journey step. Search applies existing filters, tolerates Romanian diacritics/case, and renders plain text safely.
2. Named users can discuss a paragraph or step. Viewer comment permission is a separate per-flow grant. Shared-password visitors retain reading access and sign in personally before viewing team discussions. Threads retain quoted text, code-owned anchor and source snapshot; source changes show a stale-context warning, never attach silently elsewhere. Editors/admins resolve/reopen threads; messages cannot be forged or removed by a viewer.
3. Questions use the same anchored threads, with an active named responsible person, open/resolved state and a nonempty final decision before resolution. Replies, assignment and decisions are persisted and audited. Updates use optimistic version checks; errors preserve drafts.
4. Admin manages individual View/Edit and comment overrides per flow, creates/disables users and resets passwords through the existing API. Global user role supplies defaults, an explicit flow override replaces the default View/Edit role, and global Admin always retains administration. No flow grant can confer Admin. All protected APIs, including existing Specs write/history, use effective per-flow rights inside the SQL transaction. Temporary-password/disabled/revoked accounts remain restricted.
5. Preview modules load on demand by family with accessible loading/error/retry states. Keep screen IDs, business logic, scenario order and source exports intact. Preserve original assets; reuse the existing lossless build optimizer rather than creating another conversion pipeline. Verify build chunk separation and deferred preview loading.

## Integration and constraints

Personal login, forced password change, logout and Admin UI are added in the library. Local Vite proxies only `/api/platform` to the loopback API. Offline/unconfigured API must preserve existing reading and search with an honest unavailable state for collaboration. No credentials in browser storage. Canonical document editing still awaits the owner's local Confluence-like editor; this work adds collaboration around the existing read-only specification and does not substitute an editor.

The source-owned search/anchor catalog is generated from current FlowDefinition metadata into ignored local JSON before API startup. It is not an editable document format. Stable paragraph IDs plus source snapshot/quote identify context; registrations are validated server-side. Existing questions are available as source context, not silently treated as new team decisions.

Reuse existing PrimaryButton and semantic tokens (canonical Button `715:6238`, key `c3c43d308a20d773f769e67de6f6b982604a601d`, verified via Figma metadata); field source is existing TextField/HTML native password and multiline controls, retaining supported behavior and accessible labels. Do not claim new Figma components or edit the library.

## Validation

Real auth/PostgreSQL integration tests for grants, viewer comments, tampering, stale contexts, cross-flow operations, optimistic conflicts, decisions, revocation, transactions and persistence. UI tests cover search-to-fragment, login/password errors, permissions, replies/decisions and preserved drafts. Real local browser smoke covers two identities. Server types/tests and affected root tests first, one combined `npm run verify` after final edits. Existing asset-baseline mismatch at base `3cec8b3` is reported without weakening its checks; remaining gates are run separately if it stops verification.

## Implementation decisions

Extend the approved local backend instead of adding another service. Store collaboration separately from immutable Specs revisions to preserve editorial history and the future editor's schema. Keep the approved global editing defaults, with explicit per-flow overrides; do not invent confidential flows or change shared-reader scope. Use code-owned text indexes instead of introducing a hosted search provider for seven flows.
