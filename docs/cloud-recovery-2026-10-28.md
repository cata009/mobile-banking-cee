# Cloud recovery and integration — 28 October 2026

## Source and preservation

Working checkout: `C:/Users/mihai/Desktop/Mobile Banking - CEE`. Initial local HEAD: `745956e19c87f52bfc84267fa328c48479ccf24e`; committed tree identical to Cloud base `3cec8b33cda330260f39fe52eaf3f2a5c842a396`.

Original Cloud work was recovered from the original **Mobile cee** chat and published, with explicit user authorization, to [`codex/recover-mobile-cee-cloud-2026-10-28`](https://github.com/cata009/mobile-banking-cee/tree/codex/recover-mobile-cee-cloud-2026-10-28), commit `8a7a5a4c9969f9d56711e995872612c24b5d7c6e`. Its 59 files are all present locally: 49 match the original bytes after line-ending normalization; 10 are explicitly adapted for integration. The original binary patch SHA-256 is `20dbae6c20bd14d4a3b181a358b07c5814310e45920086b6c616e0f76243402b`.

Before editing, 100 files were backed up, including all 88 initial pending paths, the untouched prior ownership manifest and the existing specification store. Backup/evidence folder: `C:/Users/mihai/Documents/ChatGPT/Mobile Banking UniCredit/_recovery/2026-10-28-cloud-integration`. No backed-up file is missing; the operator specification store and marketing email builder sources remain byte-identical. No branch switch, reset, stash, clean, index changes or local commits were made.

## Integrated behavior

- Personal View/Edit/Admin accounts, temporary-password handling and user administration from the original Cloud implementation.
- Global roles plus separate per-flow View/Edit and comment grants; questions with owners, decisions and optimistic conflict handling.
- Source-owned full-text search and passage navigation; the original source catalog remains distinct from rich-editor drafts.
- Existing Tiptap editor, image handling, numeric immutable revisions, recovery and Word/PDF/Confluence exports retained.
- File/Blob storage remains the canonical Card guard document. PostgreSQL provides accounts, roles and discussions; no duplicate Card guard document is seeded there.
- Each editor mutation checks current server permissions and binds its expected actor ID to the authenticated account. Author labels come from that account. View/shared readers receive only current-document images; historical/unpublished originals stay internally preserved behind history permission.
- Personal drafts are scoped by account. Switching identity unmounts the old document workspace and stops delayed mutations; an account changed in another tab cannot save another account's pending draft.
- Deferred prototype families and presentations retained. Export/editor captures mount background copies on demand and await all executable screens.
- The original Cloud PGlite adapter was corrected for Windows in-memory tests; filesystem persistence remains available for local account setup.

The pasted conversation supplied later confirms the intended local pilot and the restriction against publishing to Vercel. Recommendations in that conversation are not presented as implemented work: managed online account storage, notification features, side-by-side document comparison, broader editor coverage and Adaptive Elements remain separate future choices.

## Verification evidence

- 25 API tests plus server typecheck pass.
- 65 affected integration/UI tests passed before final review fixes.
-A fresh independent read-only review found two Important issues (cross-account delayed saves and historical image disclosure). Both were reproduced with failing tests and corrected; 25 focused regression tests pass afterwards.
- Real browser: Admin edits and saves; View sees the same saved document with edit/history disabled; Edit reads old versions with restoration disabled; document and team comment survive reload. No new console errors after the final reload.
- Actual Word export contains the current editor text and all 47 expected unique screen/parameter captures. ZIP integrity is valid; 47 media entries and 47 drawings. Evidence: `browser-export-proof.docx` and `browser-export-check.json` in the evidence folder.
- Combined source scope validation passes, and `git diff --check` passes.
- Final uninterrupted `npm run verify` exited 0: 4,074 application tests across 359 files and 25 API tests pass; TypeScript, lint, formatting, all audits and production build pass. Coverage: 84.55% statements/lines, 82.59% branches, 64.14% functions. The first attempt was intentionally stopped before completion to apply review fixes; it is not claimed as a passing gate.

## Run and next steps

Install root and server dependencies, configure `server/.env.local` using [server setup](../server/README.md), and bootstrap the real local Admin interactively. Run `npm run dev:platform` and `npm run dev` in separate terminals. No real user account is created by the browser smoke fixture; its accounts/database/specification store are disposable and separate from operator data.

Next, review/commit the combined pending work through one integration owner. Hosted activation later needs persistent PostgreSQL, same-origin `/api/platform` routing and the server-side account authority (`PLATFORM_API_URL`, `PLATFORM_ORIGIN`) alongside the existing private Blob store. Then verify a preview with real accounts before any authorized production deployment. Missing account authorization refuses specification writes. No main publication, hosted account migration or Vercel deployment was performed by this task.
