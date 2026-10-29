# Marketing email studio

Open **Tools → Marketing email builder**. The interface and starter content are in English. This is a local authoring tool; it does not send campaigns or publish assets.

## Working in the studio

1. Choose a starter in **Library → Templates**, or insert blocks from **Blocks**. A template replaces the composition and can be undone.
2. Add a one- or two-column section under **Layouts**. Choose an insertion column, then click a block or drag it into place.
3. Select a block to edit it in the **Inspector**. On smaller viewports this opens as a non-modal side panel. **Settings** opens document configuration. Numeric fields apply on blur or Enter, allowing incomplete values while typing.
4. Set the subject, language, brand, sender postal address, approved legal copy and unsubscribe destination. Defaults are illustrative draft copy, not approved marketing material.
5. Use **Preview** for desktop/mobile, designed light/dark appearance and images-off review. Preview links cannot navigate. Preview is a sandboxed, script-free iframe with a restrictive CSP.
6. Use **Review** to locate errors by block. Errors block final HTML, text and ZIP exports. Warnings require review; they are not client certification.
7. **Export ZIP** produces `email.html`, `email.txt`, `document.json` and `report.json`. Individual HTML/text exports are in Preview. Editable JSON and local-save/import actions are under **File**.

Block ordering supports pointer dragging, Space/arrow keys/Space on the handle, Escape to cancel, and explicit **Move up / Move down** buttons. Dragging can cross columns, including empty columns. Section ordering has explicit controls. Undo/redo covers document edits, insertions, deletions, ordering, imports and template replacement. History keeps the last 50 document snapshots for the current editor session.

## Reusable content and recovery

Save a selected block or section from the Inspector, or save the entire document as a template from **Saved**. Library entries are versioned snapshots. Insertions receive fresh node IDs and retain the entry ID/version as provenance; later edits never propagate into existing insertions.

The draft autosaves after 500 ms, flushes on tool unmount/pagehide, and can be saved explicitly. The library writes immediately. Storage keys are `cee.marketing-email.draft.v1` and `cee.marketing-email.library.v1`. No private browsing, cross-browser or multiuser persistence is promised. Export JSON for durable handoff.

Invalid, unsupported or corrupt saved data pauses replacement. Original bytes can be downloaded before the user explicitly chooses to replace them. Quota/access errors are shown. Import validates before replacing the current composition, and the previous composition remains in undo history. Documents and libraries have a 1 MB editable-format limit. Documents support 40 sections, one/two columns and 250 total blocks; arbitrary nesting and raw HTML imports are rejected.

## Design system icons and customization

The icon block now unifies the existing canonical Figma index, DS `ICON_INVENTORY` and PFM category registry. The collection has **211 distinct icon implementations/families and 344 variants**: 29 canonical families / 143 variants, 163 application implementations after deduplicating two canonical aliases, and 19 PFM categories with glyph/circle variants. The full application index contains 165 icons (134 custom SVG and 31 registered Lucide wrappers). Source labels distinguish Canonical Figma, Application SVG, Registered Lucide and PFM category; inclusion in the application inventory is not presented as a separate verified Figma component mapping.

The canonical Brand Logos group, documentation-only examples and previously excluded raster company marks remain excluded. Compatibility aliases are hidden from discovery to avoid duplicate tiles, while six legacy Education IDs remain resolvable for saved documents. Original SVG bytes, source geometry, colors, badges, clipping and layer transforms are preserved. Canonical FAQ/info mappings reuse `AppIcon`; application and PFM entries use their actual shared renderers. The picker groups states under one tile per implementation, supports multi-term full-inventory search, source/collection/appearance filters, 60-at-a-time rendering, 16/24/32/48/64 px presets and custom 12–128 px sizes. Source-theme icons remain visible under light/dark filters. A Figma link is shown only for a real canonical node; other entries identify their actual implementation file.

`appIconMetadata.ts` is a pure generated facts index, keeping React/UI out of validation and worker compilation. Run `node scripts/generate-email-icon-metadata.mjs` after changing the shared application registry, and `node scripts/generate-email-icon-metadata.mjs --check` to detect drift. The generator disables dependency discovery, uses a dedicated cache and does not mutate the source registry or assets. Regression tests compare the metadata against the live inventory.

Canvas artwork is an executable shared renderer or a composition of the original SVG layers at authored offsets. It is not a screen capture or reconstructed control. Old numeric Figma variant references remain valid; new application and PFM references use explicit `app:` and `pfm:` namespaces. Changing an icon clears its previous image URLs; resizing preserves custom descriptions and URLs. Colors come from source variants/renderers rather than recoloring original artwork.

For email delivery, configure a **public HTTPS image URL for the complete source icon canvas**, plus an optional dark asset. The picker does not host, rasterize or upload the DS artwork. Final export is blocked while that URL is missing/local. The actual email preview uses the compiled channel image, so it honestly shows a placeholder until an exportable resource is configured. This distinction avoids presenting browser SVG support as email-client coverage.

Other blocks expose content, image dimensions, light/dark backgrounds/text/accent/button text, section padding and spacing as appropriate. Logo/co-branding blocks support an optional partner logo with its own description and dimensions. Country, language, brand, legal copy and unsubscribe are configuration, not duplicated experience policies.

## Channel contracts

- Source of truth: version 1 `marketing-email` JSON, with stable document/section/column/block IDs. Model and transformations have no UI imports.
- Compiler: `mjml-browser@4.18.0`, loaded on demand in a module worker. A same-thread fallback supports hosts without Worker. There is no unimplemented backend dependency.
- MJML 5.4.1 was probed first; its UMD package required undeclared `cheerio`. Version 4.18.0 passed the local compilation probe and is pinned. `mj-include`, arbitrary MJML and custom code are not exposed.
- Vite requires `worker: { format: 'es' }` for the dynamic MJML worker chunk. This change was requested from and applied by the concurrent owner of `vite.config.ts`.
- Preview and export share one compiled HTML result. Preview only injects deterministic theme overrides/CSP and removes image sources when requested. Export retains the actual media-query theme rules, not a forced preview mode.
- Compilation carries both revision and exact serialized source identity. The editor ignores late worker replies. Export checks identity/revision and revalidates the current document, including compiler errors.
- Content is escaped. No user script, HTML, CSS or event-handler input is interpreted. Style values are constrained hex colors and bounded integers. URL policies accept HTTPS public destinations and valid contact schemes; local/private/reserved literal hosts are rejected. DNS reachability and remote resource availability are not fetched or certified.
- Unsubscribe must be HTTPS or a whole explicitly declared `{{name}}` variable. Simple declared variables remain literal. Unsupported platform syntax is rejected. No tracking parameters, unsubscribe endpoint or platform integration is invented.
- HTML uses responsive email tables, inline styles and MJML's conditional Outlook markup, with explicit image dimensions/alt text, designed dark colors and light/dark image rules. Conservative whitespace optimization preserves conditional comments, text spacing and template variables.
- Report includes compiler/version, revision, HTML bytes, resources, variables, issues, tracking note and `realClientTests: "not-run"`. A size warning appears above 95 KB. Resource byte sizes/availability are unknown; only the HTML size is measured.

## DS references and actual coverage

Canonical file: [UniCredit Design System](https://www.figma.com/design/FKbbStgBIP9bFAMl3DPKHF).

| Reuse | Canonical identity | Implementation/source |
| --- | --- | --- |
| Primary/secondary CTA | Button set `715:6238`, primary `715:6237`; key `c3c43d308a20d773f769e67de6f6b982604a601d` | `src/app/components/PrimaryButton.tsx`, `contracts/primaryButton*.ts` |
| Text fields | `10183:68496`, focus `10183:68497`; key `eb505afeab704def3f70073348918b0a7f3b11c9` | `src/app/components/TextField.tsx`, `contracts/textField*.ts` |
| Icon source art | Source-specific IDs/keys in `CANONICAL_ICONS`, e.g. Children `10183:65552` | `src/app/components/contracts/canonicalIcons.ts`, original `src/assets/design-system/icons/*.svg`; existing native reference `native-spike/src/universal/BaselineCanonicalIcon.tsx` |
| Editor chrome icons | Existing application registry | `src/app/components/icons/AppIcon.tsx` and `ICON_REGISTRY` |

Button/text-field contracts were checked against live Figma/source. Native number/select/textarea/file elements provide host semantics; they are not advertised as an implemented DS Dropdown. Workbench panels are tool composition, not new promoted DS components. The email renderer implements the email channel separately from web controls.

## Validation evidence and limits

Focused test command: `npx vitest run tests/features/marketing-email.test.ts tests/screens/marketing-email-builder.test.tsx tests/screens/tools-screen.test.tsx --maxWorkers=1`.

The tests cover parsing/future versions/duplicate IDs/nesting/size; ordering/identity/history; copied libraries/storage failures; URL and variable validation; public icon asset rules; escaping/responsive/dark markup; image dimensions; final export blocking; real ZIP contents; typing partial numeric/language/variable inputs; autosave/corrupt recovery/import failure; and deliberately late worker replies.

Real-host QA on 2026-10-22 used the actual Tools route on an ephemeral localhost Vite server. Verified pointer reordering, keyboard reordering with rendered-frame settling, icon search/selection/size, mobile/desktop light/dark/images-off preview, sandbox attributes, narrow viewport reflow with no horizontal page overflow (805 px viewport), and an actual ZIP download. The sampled export was 10,887 HTML bytes, exactly matching the report, at document revision 13, with zero errors and `realClientTests: "not-run"`. Its editable JSON was then reimported through the real File chooser and returned to zero errors at revision 15. Original screenshots are in `.codex-temp/marketing-email-builder/`.

Production Vite build passed. The built module worker was loaded through an isolated local static host and returned PASS (revision 13, 10,887 bytes, zero errors). Measured worker entry: 102,765 bytes / 20,183 gzip; separate MJML chunk: 1,199,730 bytes / 360,634 gzip. The lazy editor chunk was approximately 380 KB / 84 KB gzip. Existing application chunks trigger Vite's size warning; thresholds were not changed.

No Gmail, Outlook, Apple Mail, ESP substitution, delivery/unsubscribe operation, screen-reader audit or 200% text-enlargement certification was performed. The dark preview is the authored appearance, not an emulation of client-specific forced inversion. Final combined repository checks passed, including 348 files / 4,015 tests; see the execution ledger for the exact command sequence and asset-baseline correction.

## Exact contribution

Owner/base/initial pending changes are recorded in `docs/tasks/2026-10-22-marketing-email-builder.json`. Own files:

- Added `src/features/marketing-email/{model,catalog,transforms,validation,iconCatalog,compiler,compiler.worker,compileClient,storage,export}.ts` and `mjml-browser.d.ts`.
- Added `src/app/screens/tools/MarketingEmailBuilderTool.tsx` and `email-builder/{Canvas,CatalogPanel,IconPicker,PropertiesPanel,fields}.tsx`, `{blockIcons,dragDrop}.ts`, `editor.css`.
- Modified `src/app/screens/tools/ToolsScreen.tsx` to add one lazy tool card/dispatch, and `tests/screens/tools-screen.test.tsx` to assert eight cards and the new card.
- Added `tests/features/marketing-email.test.ts` and `tests/screens/marketing-email-builder.test.tsx`.
- Added this guide, the task record and `docs/superpowers/plans/2026-10-22-marketing-email-builder.md`.
- Own package/lock delta: only `@dnd-kit/core@6.3.1`, `@dnd-kit/sortable@10.0.0`, `mjml-browser@4.18.0` and their lock entries. Concurrent Tiptap additions belong to Card guard.
- Coordinated shared change: Vite `worker.format: 'es'`, applied by the Card guard owner on request. The other Vite/storage changes are not this feature's delta.
- Updated the ignored cooperative `.agent-task.json` by adding the email/Card guard scopes and recording the initial FlowImplementationPanel path as preserved. This does not attribute other contributors' changes to this feature.

The initial `FlowImplementationPanel.tsx` changes and concurrent flow-spec/Bosnia edits were preserved. No staging, commits, worktrees, deployment, source-image deletion/conversion or Figma publication was performed.

## Icon expansion follow-up, 2026-10-22

Ownership and initial pending changes: `docs/tasks/2026-10-22-marketing-email-icons.json`; plan/ledger: `docs/superpowers/plans/2026-10-22-marketing-email-icons.md`.

Exact follow-up delta: modified `iconCatalog.ts`, `IconPicker.tsx`, the Canvas import and scoped editor CSS; added `appIconMetadata.ts`, `IconArtwork.tsx` and `scripts/generate-email-icon-metadata.mjs`; extended the existing feature/UI tests and this documentation. No package, Vite, shared renderer, canonical metadata or original asset edits.

The earlier global attempt was stopped for the new Card guard redesign. A subsequent combined test run passed **4,015 tests in 348 files**, with all coverage thresholds met. Typecheck, lint and formatting passed. After a proved correction of the pre-existing two-image asset inventory omission, the strict asset audit, remaining audits and complete production build also passed. No runtime edits followed the passing test run. Logs and the precise sequence are recorded in the icon expansion plan; this is not a claim that the initially interrupted `npm run verify` invocation itself returned zero.

The icon expansion's **50 focused tests** and metadata check also pass. The built worker compiled new application/PFM references with zero errors (13,024 HTML bytes). Real-host checks verified application/PFM/composite rendering, size/variants, source search, and pagination from 60 to 120 items.
