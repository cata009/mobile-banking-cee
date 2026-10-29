# Card guard specification editor implementation plan

> **For agentic workers:** Use superpowers:executing-plans in this session. User explicitly authorized continuous implementation. Preserve the shared checkout and do not commit.

**Goal:** Editable Card guard BA document with durable autosave, history and complete Word handoff.

**Architecture:** A pure rich-document feature owns validation, seed conversion, asset references and safe serialization. The platform adapter owns persistence and revision conflicts. A Tiptap workspace uses existing design tokens and buttons. Existing handoff AST adds a rich block without changing legacy blocks.

**Tech Stack:** React 18, Tiptap 3 (MIT), TypeScript, Node file storage, Vitest.

**Spec:** docs/superpowers/specs/2026-10-22-card-guard-spec-editor.md

## Global constraints

- Scope and preservation: docs/tasks/2026-10-22-card-guard-spec-editor.json.
- No flow/DS definitions, branch changes, publication or Git index mutation.
- Local durable storage works out of the box; deployed service requires persistent disk configuration and authenticates the existing access cookie.
- Never weaken strict TypeScript, audits, warnings or coverage.

## Review focus

- Edits made during an in-flight save must be saved next, including on exit/export.
- Conflicting revisions must preserve local work and never overwrite the remote draft.
- Rich text and every referenced image must survive reload and Word serialization.
- Malicious, oversized or structurally invalid documents/images must be rejected by the server.
- Other flows keep the exact existing BA rendering/export path.

### Task 1: Document model and persistence

Files: src/features/flow-spec/{types,document,client}.ts, scripts/flow-spec/{store,server}.mjs, api/flow-spec.js, vite.config.ts. Tests: tests/features/flow-spec.test.ts, tests/tooling/flow-spec-store.test.mjs.

- [x] Write and run failing tests for seeded content, safe rich serialization, revision CAS, append-only restore, image validation and durable reload.
- [x] Implement schema validation and persistent API with document GET, revision save POST and asset upload POST. Return 409 with latest state on conflict and 503 for unavailable deployment storage.
- [x] Run tests green.

### Task 2: Shared rich handoff

Files: handoff/{documentModel,docx,confluenceClipboard,richDocx}. Tests: tests/screens/flow-handoff.test.ts.

- [x] Write and run failing tests for marks, links, nested lists, tables and multiple original image bytes in OOXML.
- [x] Add rich AST block and safe HTML/wiki/OOXML serializers, preserving existing screen media and legacy exports.
- [x] Run handoff tests green.

### Task 3: Editor and autosave integration

Files: spec-editor/**, minimal FlowDetail integration, package/lock. Test: tests/screens/flow-spec-editor.test.tsx.

- [x] Pin compatible Tiptap packages and port the all-in-one editor's patterns with provenance.
- [x] Write/run failing tests for edits, serialized/debounced autosave, in-flight flush, conflict recovery, history and image insertion.
- [x] Add read/edit workspace, accessible toolbar, outline, attachment insertion, history restore and local recovery. Keep the hook above tab unmounts and flush latest content before Word/copy exports.
- [x] Run focused tests, typecheck/lint and module audit.

### Task 4: Host verification and delivery

- [x] Inspect and exercise Card guard in the real browser, including reload and Word export.
- [x] Review the exact owned delta and address defects with regression tests.
- [x] Run the combined verification sequentially, repair the exact pre-existing asset inventory mismatch and complete all remaining checks. Document deployment storage, usage, provenance and actual verification/remaining host limits.

## Execution ledger

- Initial ownership recorded. Existing marketing email work preserved. User's blanket approval covers the written spec and this execution plan; continue inline without another approval round.

- Review: independent read-only reviewer confirmed the restore-race, HTML-alignment, asset-flush and crash-lock findings are resolved. The actual Tiptap integration caught `align: null` in cells; boundary validation now accepts and preserves it. Browser QA caught selected-image replacement; the regression was observed RED and GREEN with a real ProseMirror node selection.
- Browser: source baseline retained as revision 1; real text editing, autosave, two original image uploads and current-screen insertion verified. Reload retained all three referenced images. History restore appended revision 6 and returned the current document to the source baseline; the QA note is not left in the current document. Image assets and all prior revisions are retained.
- Word: browser downloaded a 6,058,989-byte DOCX with 50 media entries and 50 drawings. Every XML/relationship part parsed; both original uploaded image SHA-256 hashes matched bytes inside the package. Screens include every distinct scenario screen/parameter state.
- Render limit: bundled render_docx.py could not render because LibreOffice soffice.exe is unavailable on this host. OOXML/media integrity and in-browser images were verified; no claim of pixel-level Word layout or successful import on a live Confluence instance.
- Initial proof: .codex-temp/flow-spec/editor-proof.png, superseded by the Confluence presentation below. Earlier logs are retained as history. No coverage overlap, index mutation, commits or deployment.
- Final preservation check: unmodified source exports remain available when storage is offline; unsaved drafts still block export. Regression observed RED/GREEN. The in-progress combined gate was stopped before the runtime fix and restarted on the final state; no concurrent coverage remained. Own exact file delta: .codex-temp/flow-spec/owned-delta.json (34 files; shared package/Vite contributions and the exact asset inventory repair explicitly identified).

## User-directed Confluence presentation correction

- The user rejected the initial embedded-card presentation and explicitly requested the style of the supplied all-in-one editor. That direction supersedes the first visual layout; the functional document/persistence contract remains unchanged.
- Replaced it with a dedicated writing dialog, source-like compact icon toolbar and grouped menus, title context strip, floating slash/insert menu, Close/Update and a quiet save footer. Read mode has a document header/byline and no duplicated nested card title. Author settings moved out of the canvas.
- Added source-like text color with strict hex allowlisting and preserved it in HTML, wiki markup and OOXML. The initial UI tests observed missing dedicated dialog/color export RED; all 76 affected tests then passed GREEN.
- Browser verified Update, persisted text color, version restore, Insert toggle and Escape staying inside the editor. Restored revision 6 by appending revision 9, removing QA color from the current document. New proof: .codex-temp/flow-spec/confluence-editor-proof.png.
- Independent redesign review found focus restoration missing on controlled dialogs. Reproduced BODY focus in a failing integration test, added explicit invoker focus restoration and verified GREEN. Reviewer confirmed the finding resolved with no remaining material findings.
- Previous combined gates were stopped for the user-directed visual correction and this focus regression; neither is reported as a completed global pass. Final verification uses .codex-temp/flow-spec/verify-confluence.log after both Card guard and email-icon deltas stabilized.

## Final combined verification

- `npm run verify` completed typecheck, zero-warning lint, formatting, all 4,015 tests in 348 files, coverage thresholds and audits through platform. Coverage: statements 84.70%, branches 82.77%, functions 64.03%, lines 84.69%. Log: `.codex-temp/flow-spec/verify-confluence.log`.
- That command then exited 1 at the strict asset inventory: 1,477 expected versus 1,479 actual. The two extra assets were already committed, user-approved Card guard PNGs from `c2899b2`; that earlier release explicitly deferred the full gate. No image files were dirty or untracked. Excluding exactly those two assets reproduced the entire prior Git-normalized SHA-256 aggregate. The exact preservation proof is `docs/tasks/2026-10-22-card-guard-asset-baseline.json`.
- Corrected only that inventory, preserving all original bytes, audit assertions and approved retirements. Independent read-only review confirmed the repair. The strict `npm run audit:assets` rerun exited 0 with 1,479 assets and aggregate `132f40b242fc59295ab0d7014951f9ad3cd17abcae2d0007e6f61e5f060c7c19`. Log: `.codex-temp/flow-spec/verify-assets-final.log`.
- Completed the remaining `audit:modules`, `audit:retired-pi` and production build, exit 0. Module audit: 349 files. Log: `.codex-temp/flow-spec/verify-remaining.log`. The passing runtime test suite was not repeated for this JSON inventory-only repair; the complete single-command run is not represented as exit 0.
- Scope check passed for all 67 combined pending files. The task's own exact delta is 34 files. Flow definitions, experiences and design-system registry remain unchanged. No stage/commit, deployment or asset deletion/conversion.
