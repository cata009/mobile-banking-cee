# RO baseline Spending / PFM native integration

Approved continuation: PI / RO / current / release-current / active Spending must match original4004 UI, interactions and canonical figures. Same existing checkout and report; Source/public/fonts/assets/config/package/lock read-only. Root before-edit owner/base/absolutecheckout/fullinitialpending/paths/hashes are recorded in `.codex-temp/native-ro-pfm-integration/ownership.json`; separate2,105-path original snapshot is immutable. No worktree, Git index/branch changes, APK or publication.

## Source scope

Source current resolves LegacyAnalyticsScreen, not Evo. Overview has hard-coded54px reserve, inert Profile/Help/Card Transaction, active Messages, a period carousel and sorted Money out/in categories. No account/date/settings/report overlays, tabbed breakdown or transaction creation are exposed. Source overview amounts remain visible under privacy; category detail masks hero/divider/rows and bubble tooltip totals.

Category detail shares selected period; local Back retains it. Bubbles keep complete layout while filtered totals/transactions use excluded subcategories. At least one subcategory remains active. Exclusions reset on period/category/direction; Uncategorized helper dismissal lasts only for the mounted detail. Transaction handoff passes the full reporting-currency converted analytics row plus product identity. Returning from transaction route remounts PFM at overview/latest period; do not preserve the old category page.

All math uses `src/data/spendingAnalytics.ts` and shared category/money/privacy/indicator helpers: Booked rows, profile deduplication, currency conversion/rounding, category overrides, own-transfer/investment/excluded-category removal. Live default seed totals differ by0.01 from some old mocked fixture numbers; screenshots must use the actual Source seed, never hard-code financial replacements.

## Disjoint ownership and execution

- Main owner: new `baseline/spending/PfmScreen.tsx`, `Overview.tsx`, `PeriodCarousel.tsx`, own tests/docs/private evidence. Timeline/controller/composition/overview/local Back/footer and reusable carousel.
- Charts owner: new `baseline/spending/charts/**`, own tests/docs/private evidence. Cash flow, indicator, bubbles and exact fractional category tint/width helpers from canonical metadata.
- Detail owner: new `baseline/spending/details/**`, own tests/docs/private evidence. Category page, exclusions/tip lifecycle and transaction callbacks; reuse existing transaction primitives.
- Root: conditional `analytics/Pfm.tsx` wrapper, analytics transaction route/resolver, baseline Transaction payload integration, preview/report/scope/tests, confirmed shared-leaf corrections allocated before changes.

## Required evidence

- [x] Source/Native read-only inventory and ownership recorded.
- [x] Implement/review canonical native composition with no Source edits or extra Evo journeys.
- [x] Actual375×812 Source/currentApplication comparisons: light/dark, EN/RO query, privacy, periods/year, category/out/in, exclusions, empty/count changes, scrolling and helper dismissal. Include values/placeholders/geometry; strict pixels, no masks/tolerance.
- [x] Real controller navigation: Home→Spending, period/category/bubble filtering, local Back, transaction handoff/category override→Back resets overview. Guard unsupported contexts and preserve full converted payload.
- [x] Affected Native tests/types/owned lint zero warnings/build/bundle; final Source verify on combined final state; preserve original snapshot, sequential deltas/scope and same report. Device and existing RS teardown/CZ test restants are separate from accepted UI snapshots.

## Final evidence and adjudicated findings

31 actual Source/registered Native captures:17 strict zero matches; remaining12–145 pixels are footer SVG, pill contours and Shopping circles/cart glyph raster. No masks/tolerances; all text, figures and input signatures match. Main chart/header/category geometry is exact after actual Source computed metrics, native scroll paint context, fractional browser color-mix bypass and original inline-flex baseline mechanics. Source authored tracking/line-height utilities are overridden by .uc-type; computed normal values were used. Source actual glyph dimensions are rounded; an early fraction inference was disproved live, so shared avatar metadata remained unchanged.

13 controller navigation states match Source, including exclude/reinclude, tip dismiss/reset, Source remount on transaction Back and Home return. Three actual pointer-swipe/year states agree, preserving the selected period on local Back. A complete category-change test moves Apple to HOME SERVICES and proves matching transaction detail, updated PFM overview totals and next Shopping list. Payload preservation is also carried into Redo payment; Source factories remain canonical. Read-only integration review found no concrete break in supported Source-generated payload paths.

Native affected385 tests in39 suites pass, strict TypeScript, owned ESLint16 files zero warnings, Web build and Android JS bundle226 assets pass. Full Native audit:1,022 passes and4 existing Czech failures in2 suites. Existing renderer-identity tests were migrated to the new Source-faithful leaves while their behavior/privacy assertions stayed intact. Actual Account/Card14 and Payments20 navigation states were regressed and remain equal after payload integration.

Final Source `npm run verify` exits0:3,246 tests in273 suites, types/lint/format, audits and build. The earlier RS Face ID teardown error from Payments did not reproduce in this run; this task did not change Source to suppress it. Original SHA inventory2,105 Source/public files remains unchanged with no additions. Git HEAD unchanged. Same report exposes strict deltas and device/APK acceptance still pending.
