# PI Native-only retirement implementation plan

> **For agentic workers:** Use the existing authorized parallel conversations with disjoint file ownership. Root executes integration and combined verification. Steps use checkbox tracking; no extra worktree or automatic commit is permitted.

**Goal:** Retire the old PI customer renderer in scope, complete missing Native experiences and repair regressions in the canonical implementation.

**Architecture:** Source registries select experience and canonical business policies; Native owns customer UI for Web and Android. Former PI views move to a separate verified reference artifact and leave the normal production build graph. Failure states do not fall back to them.

**Tech stack:** Existing TypeScript, React Native, React Native Web, Vite, Vitest/Jest and Android build tooling; no new dependency is assumed.

**Spec:** `docs/superpowers/specs/2026-10-15-pi-native-only-retirement-design.md`

## Final Web closeout — 2026-10-16

The amended Web mandate is closed. Final `npm run verify` exited 0: 3,569 tests in 313 files, existing coverage thresholds, all audits and both production builds passed. Native checks passed 2,017 tests in 221 suites and TypeScript; lint has zero errors and 51 style/naming warnings with unchanged configuration. The final production artifact passed four browser smoke cases without page errors, including `renderer=reference` still rendering Native.

The strict graph guard reports zero reachable retired PI UI. The separate Source archive passed 2,983 file hash/size checks. All PI scope/exclusions remain as amended below. Raw raster pairs retain 22/13 differing pixels in the Prime/Offers SVG comparisons; this is explicit and is not bitwise raster equivalence. APK and Android device acceptance are deferred. No commit, push or deployment was performed.

Evidence: `.codex-temp/pi-wide-migration/root/resume-20261016/final-delivery.json`, the shared report at `#delivery-now`, and `docs/tasks/pi-baseline-single-source-editing.md`. The checklist below records Web integration; Android bullets are superseded by the user deferral.

## Global constraints

- Existing shared checkout; one active editor per file; owner/base/pending/before hashes before edits.
- No Source reference UI changes during migration. Archive before approved PI-only deletion.
- KIDS and PI Italia excluded; preserve SME/platform owners and shared consumers.
- Reuse Source data/policies; preserve route IDs, flow IDs, scenarios, exports and strict gates.
- No automatic return to the legacy PI renderer; no screenshot masks or assertion weakening.
- No Git index/commit/publication, Kotlin changes, dependency installation or image conversion implied.

## Review focus

1. A module-load error must show controlled failure rather than a former PI screen.
2. Manual flags, inactive scenes and Future routes must use actual effective context, not a Baseline approximation.
3. A Back/return hop must preserve the selected entity, complete draft and originating experience.
4. A supposedly retired file may still serve KIDS/Italy/SME, a flow preview or a source/ZIP export.
5. Reference-only assets and legacy chunks must not leak into the normal production bundle.

## Task 1 — Inventory and protected baseline

**Owners:** Luna 4, 14, 15, 20; Root consolidates.

**Files / evidence:**

- Read `src/experiences/registry.ts`, `src/app/registry/{projectModel,projectPackRegistry,releaseRegistry}.ts`, `src/app/navigation/routePolicy.ts`, `src/app/AppScreenRouter.tsx`.
- Create `.codex-temp/pi-wide-migration/{luna-4,luna-14,luna-15,luna-20}/` evidence and `tests/features/pi-wide-native-closure.test.ts`.
- Root owns `.codex-temp/pi-wide-migration/progress.json`, the existing report, and the combined task manifest.

- [x] Derive the valid customer context/route matrix from actual registries and handlers; identify the three CZ entries precisely.
- [x] Record immutable Source UI/assets plus excluded Native KIDS/Italy checksums; classify seven existing bridge exceptions separately.
- [x] Map each Source customer entry to its Native owner and each old view to consumers, replacement and archive requirement.
- [x] Add a closure guard that fails for valid routes with missing Native owners or unexplained fallback. Do not count metadata-only cells as completed flows.

**Exit:** A named route/experience backlog with exact owners and a protected reference snapshot.

## Task 2 — Close raster and missing Android scenarios

**Owners:** Luna 1, 8, 11, 13, 17; Root owns shared primitive changes and artifact builds.

**Owned UI:**

- `native-spike/src/experiences/pi/current/investments/baseline/overview/PortfolioChart.tsx`
- `native-spike/src/experiences/pi/current/investments/baseline/flows/ExAnteDisclosure.tsx`
- Root-reviewed shared SVG backend / `native-spike/src/universal/sourceLinearGradient.ts` if a confirmed cause requires it.
- Associated focused regression tests and `.codex-temp/pi-wide-migration/` captures.

- [x] Characterize remaining Prime/Offers/chart/bullet/NEGATIVE differences at identical state, fonts, geometry and settled animation.
- [x] Add failing regressions for confirmed defects, repair the actual primitive/layout and capture unmasked pairs on a stable build.
- Deferred by the user: Android login/logout, Co-Apping and simulated Buy device journeys; APK work is outside Web closure.
- [x] Record any unsupported exact native interpolation explicitly; do not call a sampled gradient exact.

**Exit:** Raster defect ledger resolved or explicitly evidenced platform constraint, and previously missing Android journeys exercised with values/Back outcomes.

## Task 3 — Complete CZ Future and Evo 2027

**Owners:** Luna 5/6/9/10/16/19, disjoint UI groups; Root owns adapters, host contracts and navigation integration.

**Existing modules:**

- `native-spike/src/experiences/pi/cz/evo-2027/{home,accounts,cards,payments,investments,profile}/`
- `native-spike/src/experiences/pi/current/{RoboHome.tsx,coapping/,investments/RoboSession.ts}`
- Source policies/handlers remain canonical read-only authorities unless a pure extraction is explicitly allocated.

- [x] Characterize and allocate exact UI deltas, then extend affected tests before fixes. Reuse existing Native screens where faithful.
- [x] Preserve chatbot typed actions and context: investment buy drafts, fund collections, offers, product focus, selected investment and Co-Apping continuation.
- [x] Preserve Robo goals, service activation, drafts, returning selection and persisted session state.
- [x] Add controlled Web hosting for Evo without duplicating `NativeCzechApp` screen implementations or linking React runtimes.
- [x] Verify Home/accounts/cards/transactions/payments, PFM/offers/profile and investment branches with matching Source values and actions.

**Exit:** Real CZ Co-Apping/Robo/Evo routes and behaviors use canonical Native UI; no generic substitute is accepted.

## Task 4 — Complete RS Future Gain and inactive entry paths

**Owners:** Luna 3/7 for Future Gain, Luna 18 for entry inventory; Root allocates any additional UI editors after disjoint review.

**Existing modules:**

- `native-spike/src/experiences/pi/current/future-gain/{model,SmartInvestment,PeerInsights,Simulator,PeerSimulator,TermDeposit}.tsx` (`model.ts` where applicable).
- `native-spike/src/experiences/pi/current/{profile/,baseline/auth/}` and existing registered onboarding modules.

- [x] Reuse canonical Future Gain calculations and presets; test rates, time horizons, empty/invalid values and account balances.
- [x] Wire `smart-investment` / `future-gain-peer-insights`, complete return-to-simulator state and `investmentRequests.detail` consumption.
- [x] Cover actual inactive/login/onboarding contexts from Source; do not invent screens from planned metadata.
- [x] Compare Web UI, financial values and lifecycle outcomes; representative Android branches are deferred by the user.

**Exit:** All valid RS Future Gain and PI entry journeys in scope have one Native UI owner and usable state transitions.

## Task 5 — Canonical host and Native-only decision

**Root-owned files:**

- `src/features/demo-native/{policy,contracts,baselineEligibility,investmentIntents,paymentIntents,transactionIntents}.ts`
- New pure `src/features/demo-native/piExperiencePolicy.ts` / `piRouteIntents.ts` only if the existing boundaries need them.
- `src/app/{AppShell,AppScreenRouter}.tsx`, `src/app/components/demo/NativeDemoSurface.tsx`
- `native-spike/src/web/currentHost.tsx`, `native-spike/src/app/CurrentApplication.tsx`
- `native-spike/src/experiences/pi/current/{NativeCurrentApp,contracts}.tsx` / `.ts` as applicable, and `native-spike/src/experiences/pi/cz/evo-2027/NativeCzechApp.tsx`.

- [x] Add typed plain-data context and intents for the inventoried experiences; preserve optional standalone behavior and retired-event guards.
- [x] Extend current and Evo hosts using composition, not duplicate layouts.
- [x] Introduce an explicit renderer decision: in-scope PI → Native/loading/controlled failure; excluded/platform → declared existing owner.
- [x] Test unavailable module, invalid payload, stale event, manual flags and Back without silently selecting Source UI.
- [x] Promote only verified screen/flow cells and show remaining exceptions in the same report.

**Exit:** Every valid customer route in scope has Native ownership; an error has diagnosable recovery, not a legacy bank screen.

## Task 6 — Archive reference, split imports, retire old PI UI

**Root-owned integration:**

- `src/app/AppScreenRouter.tsx` and its product-specific router boundaries.
- `scripts/native-spike/` reference-build/archive tooling and build configuration only as needed.
- New `src/features/demo-native/legacyPiRetirementManifest.ts` and retirement guard tests if a dedicated manifest is required by the dependency inventory.
- Exact deletions are generated from Task 1 consumer evidence; no guessed folder-wide deletion is authorized by this file list.

- [x] Produce a private runnable reference build/archive from the actual working tree, with hashes and comparison instructions; exclude secrets, signing keys and dependencies.
- [x] Verify archived visual/data reference before removal. Keep it outside normal production imports and publishing paths.
- [x] Split excluded/platform routing from PI customer routing; remove PI-only old lazy imports and old renderer branches.
- [x] Migrate flow previews and source/ZIP references to canonical Native entries while preserving IDs, scenarios and exports.
- [x] Retire PI-only renderer paths from the active graph and remove only approved unique entries. Preserve shared excluded UI and dormant reference/export material with its declared owner; no blanket folder deletion.
- [x] Reject production `renderer=reference` access for in-scope PI; reference comparison uses only the separate archive.
- [x] Add import/build-graph tests that fail if a retired PI module or legacy-only chunk becomes reachable again.

**Exit:** Old PI screens are absent from the normal runtime and production build graph; no second maintained UI remains in scope.

## Task 7 — Final combined evidence and editing contract

**Root integrates sequentially after owners freeze.**

- [x] Review exact agent deltas, preserved initial pending work and excluded checksums.
- [x] Run affected tests, then `npm run verify`, strict Native checks, full Native tests, build-graph/closure guards and Web builds.
- Deferred by the user's later scope clarification: APK signing, installation and Android device checks do not block this Web delivery.
- [x] Keep raw captures, exact values, context/build IDs and branch outcomes; repair Native regressions until mandatory gates pass.
- [x] Update the same report and `docs/tasks/pi-baseline-single-source-editing.md` for all accepted PI experiences and archive-only reference use.
- [x] Report implementation completeness, strict raster status and Android coverage separately. No percentage is inferred solely from tests or context counts.

**Final acceptance, amended by the user:** One active Native Web UI per in-scope PI screen/flow; zero silent legacy fallback; zero production imports to retired PI-only views; preserved excluded experiences and canonical policies; verified Web artifacts and an independently inspectable archive. All PI countries/releases remain in scope except PI Italia; SME and KIDS are excluded. APK delivery and Android checks are deferred and do not block completion.
