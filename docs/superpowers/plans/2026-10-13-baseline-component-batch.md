# Baseline component contracts implementation plan

> For workers: execute disjoint family tasks in the existing main checkout; preserve other edits. No approval pauses between families: user explicitly authorized the complete continuation and final review.

**Goal:** Complete the baseline family contract pass and review evidence, keeping current demo visuals except the explicitly requested normalization of blue Prime toggles to the common baseline styling.

**Architecture:** Platform-independent family contracts, exact compatibility Web bindings and retained legacy exports; isolated Native primitive renderers. Existing compositions/controllers remain owners of data, navigation and business decisions. A central catalog records canonical imports, variants, state coverage and native/device acceptance boundaries.

**Spec:** User approved Primary/Radio/Toggle preservation reports and now requests common toggle styling/colors, then autonomous completion of remaining baseline components with final approval. First baseline is PI/RO/current/release-current. Other experiences remain outside targeted visual changes.

## Constraints

- Existing main checkout; no branch reset/stash/clean/index mutations, worktree, publication or APK delivery.
- One active editor per file. Workers own explicitly named family files and their tests, fixtures, assets/docs and private evidence folders. Shared package/registry/theme/manifest changes belong to Root.
- Record initial pending changes/base/path and exact deltas. Read before edits; do not revert existing work.
- Characterize real Source, not stale DS metadata. Preserve DOM, styles, assets, callbacks and interaction differences through explicit variants.
- Prime toggle normalization is an intentional visual change; report its nonzero before/after pixels and verify baseline remains unchanged. Other confirmed variants retain their visuals.
- Observed shared dark-toggle white-on-white contrast is repaired within the approved toggle-color normalization: the track uses the common theme surface instead of fixed static white. Light baseline pixels remain unchanged; dark track differences are intentionally reported, with geometry and owner behavior preserved.
- Pure metadata/contracts have no UI imports. Never weaken TypeScript, coverage, warning or audit gates.

## Tasks

- [x] Root: normalize Prime toggle alias/owner to baseline style and colors, update Native matching mode and tests. Keep existing Prime preference payload and persistence owner. Archive accepted historical reports; create new intentional-change evidence.
- [x] Forms worker: TextField, AmountField and SearchBar contracts, compatibility exports, state/keyboard/validation evidence and isolated Native leaf renderers.
- [x] Navigation worker: PageHeader, BottomNavigation, BackButton contracts and variants. Preserve country/release composition and header geometry/focus behavior; isolated Native leaf evidence.
- [x] Rows worker: Divider/section and month divider, NavigationRow/NavigationLink and related leaf contracts, exact variants, tests and Native leaf evidence.
- [x] Follow-on controls/compositions: audit remaining checkbox/selection, tabs/indicators, card/list/accordion, sheet/panel/alerts and total/amount/icon families from the existing baseline inventory. Extract confirmed canonical contracts with preserved controllers; do not relabel DS-only controls as active-baseline coverage.
- [x] Root: central catalog/index covers every inventoried family with canonical implementation, explicit state/variant evidence, completed/unverified scope and Native acceptance boundary. No family is silently omitted or declared migrated by static inventory alone.
- [x] Review editor deltas sequentially; repair concrete defects within assigned ownership. Run affected tests, then final combined `npm run verify` and module audit. Consolidate visual before/after evidence and intentional toggle change separately.

## Review focus

Disabled/static semantics, class overrides and typography; controlled inputs/focus/keyboard/cursor; safe-area/sticky headers and narrow/landscape layout; callback/persistence/navigation continuity; theme/country/release variants; generated React IDs and motion timing; original SVG/assets; business totals and amounts remain from existing feature models.

## Final evidence

All editors frozen; independent sequential review found no actionable defects. Final combined `npm run verify` exited 0: strict TypeScript, lint with zero warnings, required formatting, 3,246 tests with coverage, all audits (including module boundaries: 288 files) and production build. Existing large-chunk build warnings remain in the log; thresholds were not changed. An earlier gallery-test type diagnostic was fixed by narrowing the captured string, not by weakening strict types.

Isolated Native family batch: 92 tests in 13 suites passed; Native strict typecheck and scoped lint with zero warnings passed. These do not certify the complete Native application or device fidelity.

The central report contains 1,414 independent Source preservation pairs with zero pixel differences, plus 72 toggle-normalization cases with intentional changes separated (24 light baseline cases remain pixel-identical). The separate indicator pointer proof passes eight real-click cases after repair; four were incorrect in the frozen version. The 74 Design System inventory entries are all classified in the pure catalog, including compositions, DS/other-context controls, foundations, documentation and preview host responsibilities.

Report: `.codex-temp/baseline-component-batch/report.html`. Final checks, raw logs, per-family deltas and preserved initial ownership records are linked from the same evidence folder. No deployment, APK build, branch/index mutation or asset conversion was performed.
