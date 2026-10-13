# Universal demo migration implementation plan

> For execution: use superpowers:executing-plans, implement inline with TDD and one independent review of the combined delta. The user explicitly authorized execution after preparing the plan; proceed without a second approval round. Work in the existing main checkout; do not commit, publish or modify other editors' work.

**Goal:** establish the global migration foundation, then deliver a faithful PI Italy Home → Search journey with real results and their complete navigation dependencies, using reusable controls and password-free native entry.

**Architecture:** consume the existing registries, feature policies and experience metadata. Add platform-independent context/catalog/navigation contracts and platform adapters. React Native controls are shared across experience variants; data and design-system parameters select differences, not separate country copies of each control.

**Tech stack:** existing strict TypeScript/Vitest; React Native and React Native Web host; Expo updates subject to runtime compatibility proof. No dependencies change in the root web project in the foundation task.

**Spec:** `docs/tasks/2026-10-12-global-demo-architecture.md`, supplemented by the user's priorities: Italy Home and header Search, reusable frontend controls, every result must navigate correctly, no APK entry password.

## Global constraints

- Preserve all country/product/design-system/baseline/release IDs, feature policies, demo scenarios, counts, translations and themes. CZ Evo uses `current`; BA_BL stays distinct.
- Existing web screens remain the visual and behavior authority until their replacement is accepted.
- Feature policies stay in features; experiences select composition and parameters. Metadata never imports UI runtime.
- A shared Select, SearchField, Tabs, NavigationRow, Header and Modal accepts typed items/state and visual tokens. Country or product data is supplied by the caller. No per-screen country dropdown implementations.
- No WebView, iframe or Chrome fallback for native destination screens.
- No fabricated results, silent omission of unmigrated search categories or generic placeholder destinations presented as equivalent.
- Public demo native entry requires no website/admin password and no embedded shared password/token. Existing portal authentication remains intact.
- No branch/index mutation, asset conversion/deletion, dependency threshold relaxation or external publication. Record ownership and exact task delta.

## Review focus

1. A future release selected in the wrong market must not inherit another country's screens.
2. Prepared SME/next/unsupported Kids entries must stay distinguishable from implemented experiences.
3. Search results that refer to stale or absent account/card/movement IDs must not open a different object.
4. Return from account/card/loan/insurance/PFM/profile search destinations must match current query and return semantics; payment/category/investments retain their existing different return behavior.
5. OTA must not apply an incompatible package or reload a dirty form; native entry never depends on a portal password.

## Ownership and baseline

Owner: /root, integration owner of this delta. Base `538360ead4a6da9ae889f142f8d00e333f99412b`. Checkout `C:\Users\mihai\Desktop\Mobile Banking - CEE`. Initial pending changes and owned paths: `.codex-temp/universal-demo/ownership.json`. Preserve the existing `.agent-task.json`; it belongs to the earlier Italy integration.

Baseline evidence: experience metadata/composition/Italy platform tests, 20 tests passed before edits. The architectural inventory currently has 16 manifests; registry counts are measured rather than duplicated in production code.

## Task 1 — Global inventory and migration catalog

Files: create `src/universal/catalog.ts`, `tests/universal/catalog.test.ts`, `scripts/universal-demo/report.mjs`.

Interfaces: `buildUniversalCatalog()` returns experience metadata, supported manifest release contexts, source references and native migration status. It also lists prepared project packs and uncatalogued runtime routes separately. No entry is accepted by default. Native availability is not inferred from web status.

- [ ] RED: assert all canonical manifests/releases appear exactly once; reject duplicate keys; preserve IT Mobile First, RO baseline, CZ Evo/current, BA vs BA_BL and Kids. Planned SME/next must not appear as ready native demos.
- [ ] GREEN: derive rows from `EXPERIENCE_MANIFESTS`, `SCREEN_REGISTRY`, `PROJECT_PACKS`, `ROUTE_POLICY`; no independent country allowlist.
- [ ] Verify: `npm run test -- tests/universal/catalog.test.ts`; expected PASS.
- [ ] Generate a JSON/HTML report into `.codex-temp/universal-demo/` through Vite SSR (no browser port or root dependency changes). Include explicit inventory gaps for intra-screen states and legacy contexts.

## Task 2 — Reusable search navigation contract and complete dependency closure

Files: create `src/universal/navigation/italySearchJourney.ts`, `tests/universal/italy-search-journey.test.ts`.

Interfaces: `resolveItalySearchDestination(entry, currentEntries)` returns a typed destination preserving the canonical SearchTarget payload and back policy, or an invalid/stale result. `getItalySearchDependencies(entries)` derives the unique destination inventory from actual entries. `getSearchMigrationReadiness(entries, implementedDestinations)` reports every missing route; never silently filters results.

- [ ] RED: characterize all nine SearchTarget kinds against `MobileFirstHome.selectSearchResult`; account/card movement payloads, profile IDs, investment action/instrument/view, PFM tab, payment label and category stay intact.
- [ ] RED: stale search result IDs and changed target payloads are rejected; duplicate IDs are reported; a migration with one missing destination cannot be marked ready.
- [ ] GREEN: reuse SearchTarget and the existing search matching/index, add only navigation and readiness contracts. Do not change ranking/aliases/data policies.
- [ ] Verify: new tests plus `tests/features/mobile-first-search.test.ts` and current Search entry/navigation regressions; expected PASS.
- [ ] Export the real Italy index/dependency report via the report tool and identify the smallest correct order of destination ports. Source assets remain source references, not fabricated index fixtures.

## Task 3 — Shared controls and first native candidate

Files: new `native-spike/src/universal/controls.tsx`, `native-spike/src/universal/tokens.ts`, `native-spike/__tests__/universal-controls.test.tsx`; later integration in the owned `native-spike/App.tsx` and `metro.config.js`.

Interfaces: a generic typed Select receives items/value/onChange; SearchField receives query/onChange/onSubmit/onClear; Tabs/NavigationRow/Header share focus/accessibility and layout tokens. Platform typography/icon adapters retain original assets and SVG proportions. No country-specific copies.

- [ ] RED: generic selector works with country and non-country data, disabled options stay disabled, selected option is exposed; SearchField clear and submit work with real TextInput; row selection carries the exact typed payload.
- [ ] GREEN: implement generic controls in the RN host, passing tokens and data from the experience adapter. Avoid importing RN runtime into root pure metadata.
- [ ] Verify native TypeScript, Jest, lint and browser build; expected PASS. Test keyboard and safe area in release Android build when the candidate is integrated.

## Task 4 — Faithful Italy Home and Search with destination ports

Target files: new `native-spike/src/experiences/pi/it/Home.tsx`, `Search.tsx`, `searchAdapter.ts`, `navigation.ts`, destination modules under the same experience; reuse existing `src/features/search/mobileFirstSearch.ts` and `src/experiences/pi/it/mobile-first/searchContent.ts`.

- [ ] Capture current Home/Search/reference destinations with the exact provided context, fonts, counts and seeded state. Consult existing agent source/provenance/Figma when implementation assets do not establish geometry.
- [ ] Preserve all Home header controls, carousels, categories, amounts and canonical data. Header Cerca opens native Search and focuses the system keyboard.
- [ ] Use the complete existing Italy search index, ranking, group counts, category filters, suggestions, highlighted terms and no-result behavior.
- [ ] Port every destination required by the Task 2 report before accepting Search: accounts/movements, cards/movements, loans, insurance, operations, category hubs, investments/securities/funds/services, PFM tabs and profile subsections.
- [ ] Verify each result opens the correct object and initial state, mutations refresh the index, and Back restores the current canonical behavior. Never substitute an alert for an existing destination.
- [ ] Native entry/cold start/relaunch/update opens demo without portal password. Keep portal AccessGate/admin auth untouched.
- [ ] Compare web/RN Web/Android captures per screen/state and publish only a locally reviewable candidate APK. No parity claim before coverage and visual evidence are complete.

Task 4 is split into destination-sized execution steps after the real dependency report exists. It is intentionally not represented as a single search-input edit. Existing Account/Cards/etc. owners remain authoritative; extracting policies requires characterization and coordinated ownership.

## Task 5 — Native OTA proof and global validation

- [ ] Verify Expo/RN version compatibility; integrate a supported signed OTA client into the base APK. SDK57/RN0.86 vs current RN0.87.1 mismatch identified; Hot Updater1.0.1 is the local candidate, pending actual Release APK delivery/rollback proof.
- [ ] Configure signed preview/stable updates, runtime compatibility and one release identity for web/OTA; test download/apply/rollback without replacing the installed base APK and preserve active drafts.
- [ ] External service setup/publication remains outside the earlier locally approved APK scope until there is a concrete release to review. Continue local implementation and tests independently of publishing credentials.
- [ ] Validate early slices of RO baseline and CZ Evo/current using the same controls/contracts; retain their own data and appearance.
- [ ] Run affected tests, module audit and combined `npm run verify` after relevant edits. Review exact owned delta; never fix unrelated dirty files just to obtain a green gate.

## Self-review and execution decisions

- The user requested execution with a plan first: write and self-review this plan, then execute inline without asking for another approval.
- Foundation Task 1 feeds the migration report; Task 2 feeds Task 4's destination coverage gate. Task 3 controls consume experience tokens/data, not country policy.
- Search returns are not uniform: match the existing source for each target kind. This revises the earlier broad assumption that every destination returns directly to Search.
- Full global migration remains the roadmap in the approved architecture. First execution priority is Italy Home/Search and their dependencies; unrelated countries are not claimed converted by adding metadata.
- No commits: preserve the shared index and all current pending changes. Track test evidence and progress in `docs/tasks/2026-10-12-universal-demo-progress.md`.
