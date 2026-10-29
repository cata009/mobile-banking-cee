# Card guard specification editor

## Use

Open **Flows → Card guard → Specification → Business analysis → Edit specification**. The source BA document is retained as the first revision before editing starts. Read mode is a continuous document page with a contents outline. Edit opens a dedicated Confluence-style writing surface, adapted from the supplied all-in-one toolbar and page shell: Close/Update actions, an icon formatting bar, floating insert menus and a wide document canvas. Secondary author settings are in More actions.

The editor supports heading levels 1–4, bold/italic/underline/strike/highlight/text color, links, quotes, nested lists, resizable tables (rows, columns, merge/split), status labels, information/warning panels and expandable sections. Use **Insert**, or `/` in an empty paragraph. PNG/JPEG files can be uploaded, pasted or dropped. **Insert current screen** captures the selected scenario screen using the existing phone renderer. Image captions and display width are editable; original bytes are preserved.

Edits autosave after 1500 ms. **Update / Close**, Confluence copy and Word/PDF export flush the latest draft first, including pending image operations. Failed writes remain visibly unsaved. Browser recovery is a fallback; the server is the shared source of truth. History now uses the verified personal account name; payload author labels cannot impersonate another user.

**Version history** previews a saved document. Restoring appends a new revision and preserves the previous history. Concurrent stale saves are rejected with HTTP 409. Download the recovery draft before loading the latest remote document and merging conflicting work. Restoring cannot silently replace keystrokes made while its response was pending.

## Word and Confluence

The existing Word button downloads a real `.docx`. For Card guard it includes the latest edited BA document, all referenced user images, canonical flow/screen specifications, and captures of every distinct screen/parameter state across all flow scenarios, in first-occurrence scenario order. Duplicate identical screen states are captured once. Other flows retain their existing export path.

Text remains editable. Bold/italic/underline/strike/highlight, links, heading levels, lists (including nesting and start numbers), tables, merged cells and image aspect ratios are serialized as OOXML. Panels/statuses and expanded content are represented using ordinary Word content rather than proprietary Confluence macros. Missing referenced images or incomplete screen captures fail the export instead of silently omitting content.

In Confluence Data Center, use **More options → Import Word Document** when the Office Connector is enabled. The destination instance still needs an acceptance test: this repository cannot prove a particular Confluence version/importer configuration without access to it. No Confluence API connection or publication was added.

**Copy for Confluence** transfers formatted text/tables as HTML with wiki markup fallback. Inserted images become descriptive markers; screenshots are not placed on the clipboard. The success message explicitly directs users to Word export for all images. PDF uses the same edited BA content.

## Persistence and deployment

`/api/flow-spec?flow=ba-card-fraud` provides document read, revision read, save, restore and image upload. Only Card guard is enabled. Source definitions, feature policies, screen/flow IDs and the canonical design-system catalog are never written by the editor.

In local Vite development/preview, the service stores data under `.codex-temp/flow-spec-store/ba-card-fraud/`:

- `state.json`: current document, revision metadata and image asset records;
- `revision-N.json`: immutable document snapshots containing stable asset IDs, without repeated image bytes;
- `.write-lock/`: heartbeat-backed process lock with stale-crash recovery (`proper-lockfile`).

Data survives reloads and server restarts. Writes use optimistic revision checks, process locking and atomic rename. Image bytes are base64 encoded once in the asset registry; no image deletion or conversion is performed. Limits: 500,000 JSON characters / 10,000 nodes / depth 20 per document; PNG/JPEG up to 5 MB each; at most 50 assets / approximately 20 MB original bytes; 1,000 revisions. Back up the directory if the documents are valuable; `.codex-temp` is ignored by Git.

The published application uses a **private Vercel Blob store**, independent of Function disk and deployment lifetime. The store `mobile-banking-cee-specs` (`store_9SPAxRKbHKsAWfBC`, Frankfurt / `fra1`) has been created and connected to project `mobile-banking-cee` for Production. Vercel injects the server-only `BLOB_READ_WRITE_TOKEN` credential; the API selects Blob automatically. Existing access credentials are preserved. No code has been committed, pushed or deployed by this storage task: the new API becomes active with the next authorized deployment of this checkout.

Production access validates the existing signed `mb_access` cookie using `ACCESS_COOKIE_SECRET`, and mutations require same-origin JSON. Everyone admitted by that workspace gate can read the same current Card guard document. Personal Edit is required for saving, image uploads and private history; Admin is required for restoration. The existing accounts API verifies every operation. Readers receive only images referenced by the current document; historical and unpublished originals stay in storage behind history permission. Keep the API on the application origin; do not expose storage credentials through `VITE_` variables.

Cloud objects live under `flow-spec/production/ba-card-fraud/`: one small current manifest, immutable revision JSON and original private image objects. Consistent reads bypass cache, and the manifest is committed with `ifMatch` / ETag. Reads request identity encoding so compressed CDN responses do not turn the validator into a weak ETag. Simultaneous stale document saves return 409. Asset-only races retry against the current manifest. Only committed revision references appear in history; failed commits cannot overwrite existing revisions.

Image bytes are omitted from document JSON. A short-lived signed PUT URL allows one generated private image pathname, the selected PNG/JPEG type and declared size (maximum 5 MB). Finalization revalidates actual bytes, dimensions, SHA-256 identity and workspace quotas. Browser image reads stream through the authenticated API and are hydrated for the existing editor and Word export. Original bytes are never converted. Interrupted uploads or losing immutable revision writes may leave private unreferenced objects; no automatic asset/history deletion was added.

Read mode refreshes on focus/visibility and every 30 seconds while visible and clean. The mounted editor is excluded from background replacement so its visible document and base revision cannot diverge. Edits started against an older version receive 409 and retain recovery, rather than overwriting a newer saved document. This is shared versioned authoring; it does not merge simultaneous keystrokes.

`FLOW_SPEC_STORAGE_NAMESPACE` can explicitly choose a namespace. Default Production is `production`; Preview uses an isolated hash of the branch/deployment. Only Production is currently connected to the store; connect Preview separately before using shared authoring there. Local Vite continues using files unless `FLOW_SPEC_STORAGE_DRIVER=blob` and cloud credentials are explicitly provided, defaulting to a separate `development` namespace. A non-serverless Node host can still use `FLOW_SPEC_STORAGE_DIR` on a persistent writable volume. An unconfigured serverless host returns 503. Vite development middleware is not a production authentication host.

Read-only exports of the unmodified source remain available when storage is offline; an unsaved edited draft is never silently substituted. Existing local history and QA documents have not been copied into Production. The first actual editor creates the canonical source baseline as revision 1.

## Backup and migration

The backup command includes all committed revisions, original image bytes and original history metadata. It fails rather than overwrite an existing output file. Protect backups as workspace content and store them outside Git. The importer accepts only a valid archive and an empty cloud namespace, then publishes the complete imported history with one conditional manifest commit. It preserves original timestamps and authors; it never replaces an existing shared document.

```powershell
# Export an existing local workspace.
node scripts/flow-spec/backup.mjs export --local-root ".codex-temp/flow-spec-store/ba-card-fraud" --output "C:/private-backups/card-guard-local.json"

# Supply server credentials through an ignored environment file, never command arguments.
node --env-file=.env.storage scripts/flow-spec/backup.mjs export --namespace production --output "C:/private-backups/card-guard-production.json"

# Restore/migrate into a new empty namespace; use production only before first use.
node --env-file=.env.storage scripts/flow-spec/backup.mjs import --namespace restored-workspace --input "C:/private-backups/card-guard-production.json"
```

After validating a restored namespace, select it using `FLOW_SPEC_STORAGE_NAMESPACE` on a future deployment. No automatic migration or scheduled backup was enabled. The store and authentication setup follow the [official Blob SDK](https://vercel.com/docs/vercel-blob/using-blob-sdk) and [consistent private reads](https://vercel.com/changelog/vercel-blob-now-supports-consistent-reads-on-private-storage).

## Reuse and design contracts

Adapted from `C:/Users/mihai/Desktop/all in one/All-in-one/app/projects/[id]/specs/_components/`: SpecRichTextEditor, its toolbar patterns, SpecPanelNode, SpecExpandNode, SpecStatusLozengeNode, ImageWithAttachmentRef, and useWysiwygAutosave. Next.js server actions, router dependencies and project-specific stores were replaced with host callbacks. Tiptap 3.32.0 is pinned and supports the host's React 18; it is loaded only when entering edit mode.

The interface reuses the existing PrimaryButton/TextField implementations and UniCredit semantic tokens. Canonical Button family `715:6238` in Figma file `FKbbStgBIP9bFAMl3DPKHF` was checked against current metadata; the approved family and its variants were not edited. Native selects and editor formatting commands are described as such, not represented as an implemented DS Dropdown.

## Verification

Focused tests cover seed preservation, safe serialization, actual Tiptap command JSON, multiple-image insertion with node selection, in-flight autosave/asset/restore races, append-only history, stale-write conflicts, original media packaging, numbering, HTTP auth/origin boundaries and crash-lock recovery. Browser QA and final combined gate results are recorded in the implementation plan ledger.

Earlier editor/presentation checks: 4,015 tests / 348 files passed; coverage thresholds passed (84.70% statements, 82.77% branches, 64.03% functions, 84.69% lines). Typecheck, lint, formatting, all audits and production build passed. The combined command stopped at a pre-existing asset inventory omission; after proving preservation of all 1,477 prior path/blob pairs, the inventory was corrected for exactly two already-approved Card guard PNGs and the failed/remaining checks completed successfully. The ledger records the separate command outcomes and logs without claiming a single uninterrupted green run. Browser proof: `.codex-temp/flow-spec/confluence-editor-proof.png`.

Cloud extension: 90 affected tests passed, including actual editor refresh integration, conditional-commit races, private image transport, and non-overwriting archive import. Real storage verified independent instances, conflict 409, original image hashes, and full backup/import equality. Two actual browser sessions shared revision 3 plus an image; restoration appended revision 4. A 4.9 MB direct-upload/streaming probe passed and anonymous private-file access returned 403. The final uninterrupted `npm run verify` exited 0: **4,029 tests / 350 files**, all coverage thresholds, typecheck, lint, formatting, audits and production build passed. Coverage: statements/lines 84.71%, branches 82.80%, functions 64.09%. Exact evidence is in `docs/superpowers/plans/2026-10-22-flow-spec-cloud-storage.md` and `.codex-temp/flow-spec-cloud/verify.log`; browser proof: `.codex-temp/flow-spec-cloud/history-proof.png`. No public deployment smoke test is claimed because deployment was not performed.

## Exact task delta

New: `src/features/flow-spec/**`, `src/app/screens/flow-library/spec-editor/**`, `scripts/flow-spec/**`, `api/flow-spec.js`, `src/app/screens/flow-library/handoff/richDocx.ts`, the three dedicated feature/editor/store test files, this guide, the task manifest and the Card guard spec/plan.

Modified: `FlowDetail.tsx`, `flowExport.ts`, handoff `documentModel.ts`, `confluenceClipboard.ts`, `docx.ts`, `tests/screens/flow-handoff.test.ts`, `vite.config.ts`, and package/lock files. The Vite `worker.format = 'es'` line is an explicitly coordinated integration for the email builder. Existing marketing email dependencies and all other-agent edits were preserved. No Git index mutations or commits.

Final integration additionally repairs `scripts/asset-baseline.json` for the two previously committed Card guard originals. Exact preservation/provenance: `docs/tasks/2026-10-22-card-guard-asset-baseline.json`. Audit code and assertions are unchanged. The own delta is 34 files.

The subsequent cloud-storage extension edits/creates exactly 19 files relative to the previously pending editor/email work. It adds Blob/validation/backup adapters, two dedicated test files, its spec/plan/task record; modifies the server, local validation reuse, client hydration, safe read-mode refresh, the editor-active bridge, editor tests, environment example/ignore rules, package/lock and this guide. Exact list: `.codex-temp/flow-spec-cloud/owned-delta.json`. No commit, push or deployment.

## Cloud recovery integration — 28 October 2026

The original Cloud account/collaboration work has been recovered and merged locally without replacing this editor. See [account API setup](../server/README.md) and [recovery record](cloud-recovery-2026-10-28.md). Both local services must run for personal editing (`npm run dev:platform`, then `npm run dev`). The existing file/Blob store stays canonical; no document/history migration is needed. Pending drafts are scoped to the personal account, and mutations include an expected actor ID so another tab changing accounts cannot save an old draft under a new identity.

For a future hosted deployment, configure same-origin account routing and the account authority (`PLATFORM_API_URL`, `PLATFORM_ORIGIN`); a missing authority refuses writes. No deployment has been performed.
