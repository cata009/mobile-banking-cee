# Type Safety Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development`. Execute one batch at a time, with a fresh implementer and review before the next batch.

**Goal:** Bring the strict TypeScript and ESLint gates from the audited baseline of 261 TypeScript diagnostics in 40 files and 7 ESLint errors to zero without weakening compiler rules or changing stakeholder-visible behavior accidentally.

**Architecture:** Repair contracts from the center outward: state and data first, then shared UI, feature subsystems, large surfaces, and finally App/CZ Chat. Each behavior-sensitive correction receives characterization coverage before source changes. Every batch is a separately revertible commit.

**Baseline:** `npm run typecheck` = 261 diagnostics; `npm run lint` = 7 errors after commit `850602f`.

## Global constraints

- Keep `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`, and `noUnusedParameters` enabled.
- Do not use `as any`, chains of non-null assertions, broad file exclusions, or domain-field optionalization as cleanup shortcuts.
- Preserve existing product values; do not invent IBANs, rates, dates, balances, or copy.
- Use invariant helpers and explicit empty-state handling where static collections are expected to be non-empty.
- Start every behavior-sensitive source change with a failing characterization test.
- After each batch run targeted tests, TypeScript, ESLint, the relevant audit, and `git diff --check`.
- Run the build after batches 3, 5, 7, 9, and 10.

## Sequential batches

### Batch 1 — Core state, registries, and navigation (7 TS)

Files: `demoStore.tsx`, `featureUI.ts`, `componentRegistry.ts`, `useNavigation.ts`.

- Model runtime-sparse feature overrides as `Partial<Record<FeatureId, boolean>>`.
- Repair the CZ assistant mapping and HU Kids screen identifier.
- Guard empty navigation history without deleting the legacy hook yet.
- Characterize context isolation, release/manual flag precedence, reset, and root back-navigation.

### Batch 2 — Translation contracts (15 TS, 1 ESLint)

Files: `translations/shared.ts`, `LanguageContext.tsx`.

- Merge `DeepPartial` values while explicitly ignoring `undefined` leaves.
- Traverse translation keys through `unknown` plus type guards, never `any`.
- Test every supported country/language, English fallback preservation, and missing keys.

### Batch 3 — Product/account/PFM data (14 TS)

Files: `products.ts`, `useProducts.tsx`, `accountDetails.ts`, `pfmCategories.ts`, `spendingAnalytics.ts`, focused `App.tsx` PFM filter.

- Preserve required discriminator fields and existing mock values.
- Add explicit invariants for non-empty sources.
- Characterize 0–9 generated products and every country.
- Exclude internal transfers using raw category evidence before normalization.

### Batch 4 — Shared UI and small screens (38 TS, 3 ESLint)

Sub-batch A: shared components (`AccountActionBar`, `BottomSheet`, `CoAppingHomePage`, `DemoFeatureSidePanel`, `DemoTopBar`, `AppIcon`, pre-login, language selector, product accordions).

Sub-batch B: Account Detail, Analytics, Card Detail, More, Tutorials, Domestic Payment, Payments, Products.

- Characterize empty/single/multiple products, focus trapping, empty analytics, invalid selected IDs, absent payment hero, and tutorial boundaries.
- Prefer explicit union metadata and guarded tuple access.

### Batch 5 — Investments (38 TS, 1 ESLint)

Sub-batches: builders/config, charts, History.

- Use explicit palette/security invariants.
- Narrow history items by `kind` at the use site.
- Type Recharts pointer/touch contracts without `any`.
- Preserve the investments audit and add 0/1/4 distribution, selection, country-reset, and transaction/order coverage.
- Add pinned `eslint-plugin-react-hooks` and enable `rules-of-hooks` plus `exhaustive-deps` as part of the verification contract; repair any newly exposed source issues.

### Batch 6 — Templates and Flow Library (13 TS, 1 ESLint)

Files: `TemplateCodePreviews.tsx`, `FlowLibraryScreen.tsx`, affected audit regex.

- Remove dead parameters/imports, guard invalid country/scenario selections, and use valid icon identifiers.
- Preserve template and reference-platform audits.

### Batch 7 — Figma phone screenshot exporter (23 TS)

File: `phoneScreenshot.ts`.

- First characterize JSON export from DOM containing text, SVG, image/background, shadow, auto-layout, and scroll.
- Preserve source/clone index alignment, asset references, bounds, and layer order.
- Do not bind a source node to a different clone as a fallback.

### Batch 8 — Design System (50 TS)

Two commits: specimen/selector typing; then inventory/hash/palette/scroll logic.

- Characterize default render, variant/country/palette changes, invalid hash, and zero/multiple sections.
- Run template audit after each commit.

### Batch 9 — HU Kids (42 TS)

Three commits: default theme/card/pocket invariants; unused cleanup; preview callbacks/icon mapping.

- Characterize every theme ID, default theme, Home preview, transaction click, and concepts without pockets.
- Run the HU theme contrast audit.

### Batch 10 — CZ Chat and App shell (21 TS)

Files: `CoAppingChatAssistant.tsx`, remaining `App.tsx` diagnostics.

- Characterize unsupported/empty/success voice input, timer cleanup, empty/last-message selection, panel close/start, and deep-link smoke.
- Use browser timer types and explicit empty-state guards.

## Acceptance

- `npm run typecheck` exits 0 with the original strict flags intact.
- `npm run lint` exits 0 with React Hooks rules enabled.
- Targeted characterizations and existing audits pass.
- `npm run build` passes.
- Every batch has a focused commit and review record so it can be reverted independently.
