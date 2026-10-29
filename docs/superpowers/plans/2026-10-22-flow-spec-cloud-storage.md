# Shared specification storage implementation plan

> **For agentic workers:** Use superpowers:executing-plans inline. The user explicitly authorized end-to-end storage implementation; no Git publication or deploy.

**Goal:** Persistent shared Card guard autosave, original images and history on the published Vercel application.

**Architecture:** Private Blob objects plus an ETag-protected manifest. Retain the local adapter. Authenticated API streams registered assets; the client hydrates them for the unchanged document model and exports.

**Tech Stack:** Node 24, pinned @vercel/blob, React 18, Vitest.

**Spec:** docs/superpowers/specs/2026-10-22-flow-spec-cloud-storage.md

## Constraints

- Main checkout; owner/scope: docs/tasks/2026-10-22-flow-spec-cloud-storage.json.
- Preserve all initial pending changes and the approved editor. No commit, push, deployment, public storage, image deletion or conversion.
- Keep authentication, same-origin writes, document/image validation and optimistic revision checks.
- One final combined verification, no overlapping coverage.

## Review focus

- A simultaneous first save must have one winner and no overwritten revision.
- Asset registration racing a document save must preserve both changes.
- Lost network responses and stale sessions must preserve recoverable drafts.
- Raw image bytes must stay private and outside manifest JSON/payload limits.
- A failed revision write/commit must not create a visible history entry.

## Tasks

### 1. Cloud repository and provisioning

Files: scripts/flow-spec/{blob-store,validation}.mjs, existing store.mjs, package/lock; tests/tooling/flow-spec-cloud.test.mjs.

- [x] Add failing shared adapter tests: durable fresh instance, first-save race, stale/restore, asset/document race, validation and commit failure.
- [x] Extract shared image validation without changing local behavior; implement private immutable revisions and manifest CAS.
- [x] Provision/connect a private store to the explicit existing project; credentials remain ignored/server-only.
- [x] Run adapter/local tests green and exercise actual remote writes under an isolated verification namespace.

### 2. API and client transport

Files: server.mjs/server.d.mts, src/features/flow-spec/{client,types}.ts; tests/features/flow-spec-client.test.ts and tooling cloud/store tests.

- [x] Observe failing tests for serverless driver selection, authenticated image streaming, scoped upload grants and hydration; verify direct original-image uploads against real storage.
- [x] Add cloud selection, safe image transport/direct upload and generic error responses without exposing credentials.
- [x] Keep existing local transport compatible and verify both paths.

### 3. Shared refresh and operations

Files: useSpecWorkspace.ts, editor integration tests, scripts/flow-spec/backup.mjs, .env.example, docs/flow-spec-editor.md.

- [x] Observe failing tests for clean refresh and edits arriving while a refresh is pending.
- [x] Add safe focus/visibility/poll refresh; preserve pending work and conflict behavior.
- [x] Provide non-overwriting backup/import commands and exact project configuration/rollout notes.
- [x] Review entire delta, run affected checks and sequential combined verification; do not publish.

## Ledger

- Ownership recorded before implementation at base 745956e19c87f52bfc84267fa328c48479ccf24e. Existing 67 pending files preserved.
- Ruling: use Blob conditional writes and consistent private reads rather than introduce a separate database for this bounded document workspace. Immutable versions and one conditional manifest provide an atomic visible history. Official current SDK behavior was verified before selection.
- Vercel connector administration returned 403. The explicitly scoped CLI fallback authenticated and listed existing production gate variables; no storage was previously configured. Continue using that CLI, preserving existing environment variables.
- Provisioned `mobile-banking-cee-specs`, ID `store_9SPAxRKbHKsAWfBC`, private access, Frankfurt/fra1; connected only to Production on existing project `prj_Yx0dsy6aQME7XJGZdF3DepMTSNPp`. Existing gate credentials preserved. CLI added `.env*` protection to `.gitignore`; retained it and explicitly kept `.env.example` trackable. Pulled verification credentials only into ignored `.codex-temp/flow-spec-cloud/.env.production`; no values in source or logs.
- Remote proof `.codex-temp/flow-spec-cloud/remote-proof.json`: independent instances, exactly one concurrent-save winner, stale 409, append-only restore to revision 3 and the original 1,970,689-byte PNG matching SHA-256. Production namespace remains empty; first actual editor will seed canonical revision 1.
- Browser proof used local port 4105 with the real cloud adapter and an isolated namespace: original BA seed, text autosave and direct original PNG upload; a separately opened tab read the same revision 3 and loaded image. That tab restored the source by appending revision 4; marker removed from current content, history/assets retained. No code was deployed to the public URL.
- Real backup exported 3 revisions + 1 original image, imported to a new namespace, then re-read and compared exact document history metadata and image bytes. `.codex-temp/flow-spec-cloud/backup-proof.json` records the verified result. No existing namespace or backup file was overwritten.
- Independent review reproduced a stale mounted-editor overwrite caused by background refresh advancing workspace revision while Tiptap retained initial content. The actual mounted-editor integration regression failed RED, then passed after a layout-effect editor-active gate; in-flight refresh also rechecks the gate. Read-only reviewer confirmed no remaining material findings.
- Real large-document QA reproduced `get()` returning a weak `W/` ETag under Brotli compression while `head()` returned the strong equivalent. Added a large-manifest regression (RED 503/GREEN), request identity encoding alongside consistent reads and verified actual remote retry and browser saves. No CAS assertions were weakened.
- All 90 affected tests in 7 files passed after these fixes; scoped ESLint passed. Sequential `npm run verify` completed with exit 0 in `.codex-temp/flow-spec-cloud/verify.log`; no overlapping coverage or runtime edits.
- Large transport proof: direct upload and authenticated chunked streaming of a 4,900,000-byte PNG fixture against real private storage, with exact SHA-256 equality; anonymous access to its private URL returned 403. The verification API host was local Node, not an undisclosed public deployment. Evidence: `.codex-temp/flow-spec-cloud/large-image-proof.json`.
- The cloud extension's exact delta is 19 files in `.codex-temp/flow-spec-cloud/owned-delta.json`. Combined cooperative scope check passes for 77 pending files; initial flow/experience/DS and email-builder work remain intact.
- Final combined gate: 4,029 tests in 350 files passed; statements/lines 84.71%, branches 82.80%, functions 64.09%, all existing thresholds preserved. Typecheck, zero-warning lint, formatting, all audits and production build passed. Strict asset inventory: 1,479 unchanged assets. Module boundaries: 349 files. No partial/resumed gate in this run.
- `npm audit --omit=dev` reported zero production dependency advisories. Remote browser state was re-read from a fresh Node process after stopping the local verification server: revision4, four history entries and one retained original image; Production remains empty. Evidence: `.codex-temp/flow-spec-cloud/browser-proof.json` and `history-proof.png`. Temporary browser tabs/server were closed; the user's original tab/server were preserved.
- Deployment remains deliberately unperformed. Connected Production credentials will activate the new API on the next authorized deployment of this checkout; live-host smoke testing therefore belongs to that deployment. No commit, push or publication was performed.
