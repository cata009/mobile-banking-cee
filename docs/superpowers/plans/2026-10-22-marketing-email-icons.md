# Expand the existing DS icon collection in Email Studio

**Request:** Check the combined verification and substantially enrich the email icon library from icons already available in the Design System. Keep the interface in English.

**Ownership:** `docs/tasks/2026-10-22-marketing-email-icons.json`. Same checkout/base, preserve all current email/Card guard/operator changes. No package, Vite, canonical renderer, source asset, branch or index changes.

## Source audit

- Existing email picker: approximately 25 canonical families. It excludes composite artwork and hides source-theme icons under the default light filter.
- Current DS application inventory: 165 executable AppIcon entries (134 custom SVG and 31 registered Lucide wrappers), across Actions, Header, Navigation, Accounts, System, Payments, Prime, Contacts and External Lucide.
- Current DS PFM inventory: 19 category definitions; only actual SVG-backed glyphs are eligible. Text-initial fallbacks must not be advertised as implemented icons.
- Canonical Figma index: 166 variants, including 16 brand-logo variants and a documentation-only source. Brand/company marks and compatibility aliases remain excluded; actual supported category/system/service compositions can be reused by reference.

## Design

Reuse `AppIcon` and `PfmCategoryIcon` directly for their respective families. Extend the existing canonical source-art composition to preserve original layers, source transforms/clipping, shapes and existing AppIcon mappings. Do not redraw SVG paths or duplicate source assets. Show one tile per implementation/family, with real variants in the existing variant selector.

Add a pure generated metadata index for the application inventory so document validation and the worker never import UI runtime. The generator consumes the real registry through a local, isolated Vite SSR loader with dependency discovery disabled; a parity check detects drift. Keep canonical numeric variant IDs valid, and give new references explicit `app:` and `pfm:` namespaces. Preserve descriptions/URLs on size-only changes and clear them on actual source changes.

Make the larger collection usable with full-catalog search, collection/source filtering, truthful source labels, unique-family/variant counts and incremental rendering. Source-theme variants must remain discoverable under light/dark filters. Continue to require a public email image URL; adding a source to the authoring library does not publish or rasterize it.

## Sequence and checks

- [x] Audit actual DS inventories and record initial pending changes/ownership.
- [x] Add regression tests for metadata parity, inclusion of application/PFM/composite sources, no text fallbacks, source-theme discovery, preserved old IDs, variant grouping/search and round-trip/export validation.
- [x] Run the new tests RED after the owner stopped the previous combined gate; implement metadata adapter and renderer/picker changes; run GREEN.
- [x] Inspect the actual host for representative application, PFM and composite sources; verify size/variants/search and import/export persistence.
- [x] Run affected tests, typecheck, ESLint, module audit and production build, without concurrent verification/coverage. Record the earlier gate's snapshot and coordinate the final integration result.
- [x] Combined final verification completed after Card guard stabilized: full tests/coverage and initial audits passed; after the strict asset inventory repair, asset audit, remaining audits and production build passed. See final result below for the exact command sequence.

## Coordination

At the start of this request, the Card guard owner is still running the combined `npm run verify`; coverage has no reported failures, but there is no final green result. Do not overlap test/coverage runs or claim that gate covers runtime changes made later. Source/design preparation proceeds while that gate runs.

## Execution ledger

- The Card guard owner subsequently stopped that gate for a new user-requested Confluence-style redesign. No FAIL was reported before interruption; there is no completed global verdict.
- Audited the current source inventory: 165 application icons (134 custom SVG, 31 Lucide wrappers), 19 SVG-backed PFM categories, and canonical category/system/service sources including compositions. Two direct AppIcon mappings are deduplicated from the application tiles.
- Final collection count from the pure adapter: 211 families / 344 variants. No synthetic extra icons, copied assets or image conversion.
- Regression tests observed RED for missing multi-source collection, then GREEN: 44/44 focused email/UI/Tools tests. A test assumption about SVG filename URLs was corrected to compare the actual imported original resource URL because Vite can inline SVG assets.
- Metadata `--check`, ESLint max-warnings 0, Prettier and module audit pass. Typecheck passed before the concurrent Card guard syntax edit. No coverage was run here.
- Actual Tools host verified application QR icon, PFM Income glyph/circle and canonical Travel Plus at 64px. Subsequent full-host/build attempt encountered the concurrent owner's temporary syntax error in `SpecWorkspacePanel.tsx:138`; its owner was notified, and the file was preserved.
- That owner repaired the JSX checkpoint. Vite production build then passed, and the built module worker compiled a document containing new `app:` and `pfm:` icon references: PASS, zero errors, two declared HTTPS resources, 13,024 HTML bytes.
- Independent review identified six legacy Education compatibility IDs that should remain resolvable even when not discoverable as duplicate picker tiles. Added six failing regressions, separated legacy resolution from discovery and verified GREEN. Final affected run: 50/50 tests (26 feature, 11 editor, 13 Tools).
- Final metadata check, lint, format, typecheck, module audit and whitespace checks passed. Global scope was extended cooperatively with this exact contribution; other task deltas remain separately owned.
- Browser QA also confirmed pagination 60→120, source/collection search, stable selection, actual AppIcon/PFM rendering and composed source badge geometry. Only the newly created QA block was removed afterwards; the user's existing draft blocks were preserved. Screenshot: `.codex-temp/marketing-email-builder/icons-expanded.png`.

## Final combined result

The Card guard integration owner completed verification on the final runtime including the expanded icons: **348 test files / 4,015 tests passed**. Coverage: 84.70% statements, 82.77% branches, 64.03% functions, 84.69% lines. Typecheck, lint and formatting passed.

The literal `npm run verify` command initially stopped at the pre-existing 1,477→1,479 asset inventory omission. The owner proved that all prior Git-normalized path/blob hashes were preserved and the two additions matched approved Card guard originals, then updated only the asset baseline. Independent review confirmed the repair. Strict `audit:assets` was rerun successfully, followed by successful remaining module/retired audits and the complete production build. Audit assertions and coverage thresholds were unchanged. There were no runtime edits after the passing test run, so coverage was not repeated.

Evidence: `.codex-temp/flow-spec/verify-confluence.log`, `verify-assets-final.log`, `verify-remaining.log`; provenance/preservation proof `docs/tasks/2026-10-22-card-guard-asset-baseline.json`. These final logs were inspected in the email chat. Verification ownership is released; no commit or deployment was performed.
