# Marketing email builder implementation plan

**Goal:** A local, usable marketing email editor under Tools, with structured content, reusable copies, accessible ordering, safe preview and revision-bound exports.

**Architecture:** `src/features/marketing-email` owns versioned documents, transformations, validation, persistence and email compilation. Tools composes existing DS controls and loads the editor on demand. Preview and ZIP use the same compiled HTML. No server, campaign sending or image publishing.

**Tech stack:** React 18, strict TypeScript, Vite, Vitest, fflate; evaluate MJML browser in a worker and dnd-kit's stable React-compatible sortable API before adoption.

**Spec:** Approved architecture in the delegated user request; usage and final implementation contract in `docs/features/marketing-email-builder.md`.

## Constraints and ownership

Existing main checkout only. Owner/base/initial pending changes/exact owned scopes: `docs/tasks/2026-10-22-marketing-email-builder.json`. Preserve the initial FlowImplementationPanel change. No staging, commits, deployment, image conversion or publication. Sequential editing and verification.

## Review focus

- Imported JSON with duplicate IDs, unsupported nesting, excessive size or a future version must fail without losing the current draft.
- A compilation completed after a later edit must never become an exportable result.
- Storage failure/corruption must be visible and must not overwrite recoverable saved work.
- Template variables must remain literal and explicitly declared; unsafe URLs and local resources block final exports.
- Keyboard reordering, deletion focus, narrow layouts and light/dark/image-off preview must work in the actual host.

## Tasks

- [x] 1. Verify DS source contracts and compile a browser MJML probe; measure worker bundle. Record dependency decisions and local-only fallback if necessary.
- [x] 2. Write failing feature tests, implement `model.ts`, `catalog.ts`, `validation.ts`, `transforms.ts`: bounded document → sections → columns → blocks, unique stable IDs, versioned copied library entries, immutable edits/history.
- [x] 3. Write compiler/export tests, implement `compiler.ts`, `compiler.worker.ts`, `compileClient.ts`, `export.ts`: escaped text, validated URLs, responsive HTML, plain text, dark palettes, report, revision guard, ZIP.
- [x] 4. Write persistence/import tests, implement `storage.ts`: validated versioned local draft/library, recoverable errors, no silent data replacement.
- [x] 5. Write interaction tests, implement Tools editor and properties/catalog/canvas/preview panels with real pointer and keyboard drag, move up/down, undo/redo, local saves, JSON/library, validation and exports. Update Tools card regression.
- [x] 6. Run affected tests and module audit, inspect the real browser host, review exact own delta, document measured outcomes, limits and using the editor.
- [x] 7. Combined repository verification completed by Card guard's integration owner: 4,015/4,015 tests, coverage thresholds, typecheck/lint/format and all audits/build passed. The command sequence and asset-baseline repair are recorded in the icon expansion plan's final result.

Execution is explicitly authorized, sequential and inline. The user has already approved the architecture; no repeated design approval gate. Do not generate extra independent subsystems or a new design system.

## Accepted interface refinements

- User requested a premium creative-tool workbench, with all interface details in English (2026-10-22).
- Reuse the canonical DS icon library for a searchable content icon picker. Preserve source variant identity, support size presets/custom sizes and editable source references. Email artwork requires a public HTTPS URL; selecting local DS artwork does not imply hosting or universal SVG email support.
- Refine existing components/layout; preserve the approved DS typography, semantic palette and accessible control implementations. No Adobe assets or imitation branding.

## Execution ledger

- Owner/base/checkout/pending scope recorded before edits. No commits or index mutations.
- Tasks 1–5: implemented with failing tests first; final focused run passed 40/40 (19 feature, 8 editor, 13 existing Tools tests).
- Probe: MJML 5.4.1 required undeclared cheerio. Pinned autonomous browser distribution 4.18.0. Stable dnd-kit core 6.3.1/sortable 10.0.0 support React 18 and keyboard sensors.
- Independent data/compiler review returned two Important findings (local/reserved host bypass and uppercase MAILTO unsubscribe). Both fixed with RED→GREEN tests. Divider dark accent was treated as an in-scope functional theme defect and fixed with a regression test.
- Independent UI review: no Important or Critical findings. Data/compiler fixes were verified by regression tests, not repeated review.
- Self-review/QA fixes with RED→GREEN: partial language/variable/numeric entry, image height attributes, editable-format size bound, footer font attribute, preserving icon descriptions on resize, no-op edits avoiding extra undo entries, late worker response rejection, keyboard collision targeting, and stripping active link destinations only from sandbox preview.
- Fresh checks: focused tests 40/40, ESLint max-warnings 0, Prettier check, TypeScript check, audit:modules and git diff whitespace check passed. Task-scope validation passed with an explicitly combined scope and separately recorded preserved initial path.
- Production `vite build --outDir .codex-temp/marketing-email-builder/build` passed. Existing unrelated chunk/dynamic-import warnings retained; no thresholds changed. Built ES worker was then loaded from a local static probe and returned PASS, revision 13, 10,887 bytes, zero errors, compiler mjml-browser@4.18.0.
- Real Tools host: pointer and keyboard reorder, icon selection/variants/sizing, responsive non-modal inspector, mobile/desktop light/dark/image-off iframe and real ZIP download verified. No real email-client or ESP integration testing claimed.
- Actual document round trip: reimported the ZIP's document JSON through the real File chooser; preview/export returned to zero errors at revision 15. Original icon picker screenshot saved without image modification.
- User explicitly authorized cross-chat verification coordination. Card guard integration owner accepted the final combined verify after its editor integration stabilizes; no test:coverage/verify was started by this feature.
- Latest combined scope snapshot flags Card guard's subsequently added `flowExport.ts`, outside its initial manifest. Its owner was asked to register that additional shared-file scope; the email delta is unchanged and stays separately attributable.
- Final integration: all combined checks completed successfully, including the icon expansion. Full test run passed 348 files / 4,015 tests; following a proved asset inventory correction, the strict asset audit and remaining audits/build passed. No runtime changes followed the test run. See `2026-10-22-marketing-email-icons.md` for precise logs/sequence.
