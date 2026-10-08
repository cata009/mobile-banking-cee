# Complete Refactor Program Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development for bounded independent domains and requesting-code-review for independent verification. Steps use checkbox syntax. The coordinator executes shared integration and quality work inline.

**Goal:** Complete the approved maintainability program, independent module ownership and strict quality checks while preserving the latest approved banking screens and behaviors.

**Architecture:** Existing React providers, typed navigation and feature resolution remain canonical. App becomes provider boot plus stable shell/router and typed feature coordinators. Executable feature models, experience composition and Flow specification/preview entries have separate owners and validated public contracts.

**Tech Stack:** Existing React 18, TypeScript 5, Vite 6, Vitest 3 and ESLint 9; no new state/router dependencies.

**Spec:** docs/superpowers/specs/2026-08-30-code-quality-refactor-program-design.md plus the user's approved independent ownership proposal and current operator changes.

## Global Constraints

- Work directly in the existing main checkout; do not create a worktree or switch/reset/stash branches.
- Preserve all current normal DOM, copy, SVGs, assets, callbacks, country formatting and approved transitions. The frozen current input supersedes older presentation expectations.
- Preserve App, NavigationProvider, Screen, NavigationRoute, navigateTo, public hooks, Flow IDs/scenarios and source/ZIP APIs through compatibility exports.
- No new runtime state-machine/router dependencies, asset deletion/conversion or broad formatting sweep. The user's later explicit instruction authorizes final Vercel production publication after all checks; the source snapshot/ref needed for that publication is included; unrelated remote writes remain outside scope.
- Keep strict compiler/audits and coverage thresholds: statements/lines/branches 80%, functions 62%. Fix defects and add meaningful tests; no threshold reduction or blanket suppressions.
- One active editor per file. Workers own explicit paths and report their exact delta. Only the coordinator manages the Git index; do not commit pending operator work as an input snapshot.
- Add RED/GREEN proof for behavior changes; characterize approved behavior before pure extraction. Update stale tests with explicit current expected outcomes, preserving their business assertions.
- Initial input is `.codex-temp/full-refactor-2026-10-07/input`, with hashes and pending status in input-manifest.json; HEAD efe26b6 alone does not contain the evaluated code.

## Review Focus

- Healthy screens retain component/state lifetime across theme, privacy, release, country and platform switches; failed boundaries still recover.
- Chat actions keep their intentional navigation/filter behavior and validate stale entities; investment requests and credit offers cannot leak contexts.
- CZ Robo preserves fresh quit/resume, empty goal creation, pending top-up order semantics, executed sell updates, settings/basket labels and current/injected civil-clock policy.
- Source wrappers do not produce empty exports; source slicing and ZIP handoff include all extracted dependencies with stable filenames and IDs.
- Runtime support is inferred from actual implemented dispatch, not placeholder metadata; unimplemented/retired contexts stay honest and cannot become accidentally enabled.

## Task 0: Protected final input and reevaluation

**Owner:** coordinator. **Files:** input snapshot, manifest, lint JSON, runtime dependency graph, baseline logs, ledger.
- [x] Record HEAD/branch, all pending changes and hashes; freeze tracked and non-ignored operator files without Git mutation.
- [x] Inspect fresh CZ Robo changes and map App/module/state dependencies before editing application code.
- [x] Run baseline verification, lint JSON and coverage; classify failures instead of reverting approved input.
- [x] Record exact migration interfaces/ownership and baseline defect rulings in the ledger.

## Task 1: Application composition and typed feature coordinators

**Owner:** App worker. **Files:** src/app/App.tsx, new AppShell.tsx/AppScreenRouter.tsx, src/app/coordinators/**, feature coordinator directories accounts-payments/investments/analytics/flow-library/chat/cz/products, NavigationContext.tsx and explicitly allocated navigation/App/chat-architecture tests.
**Interfaces:** Existing provider nesting/default App export, module-scope lazy screen identities/specifiers, unkeyed healthy boundaries, optional typed route payloads with legacy string navigation fallback. Coordinators expose focused view/actions; cross-feature commands are discriminated and validated.
- [x] Characterize healthy subtree identity, existing cross-feature requests and chat navigation/filter semantics.
- [x] Extract stable shell and typed screen router with identical markup and screen prop wiring.
- [x] Move account/payment/credit, investment, analytics entry, Flow, product and CZ chat orchestration into focused feature hooks; retain full AppContent lifetime.
- [x] Introduce route-owned restorable feature selections and typed application commands with explicit back/stale-event regressions.
- [x] Run App/navigation/context/deep-link/payment/chat handoff suites and typecheck; independent review of exact delta.

## Task 2: CZ Robo state and presentation extraction

**Owner:** Robo worker. **Files:** CzFutureRoboAdvisorFlow.tsx, czFutureRoboAdvisorModel.ts, roboAdvisorFlowState.ts, CzInvestmentGoalsScreen.tsx, new screens/investments/robo/** and features/investments/robo/**, allocated Robo model/state/DOM and funding-clock tests.
**Interfaces:** Existing default export/props, model exports, actual current/injected civil-day clock, goal update and security callbacks. Separate creation, goal detail/management and pending order/top-up state; preserve intentionally retained creation draft through quit/resume.
- [x] Pin fresh approved creation, top-up/pending order, sell/history, settings and quit/resume behavior; reconcile affected legacy test assertions from observed current output.
- [x] Extract pure fixture/types/selectors/projection/validation and tested typed reducer transitions, guarding impossible stale events.
- [x] Move presentational sections and carousel/measurement concerns into focused files, preserving exact JSX/copy/styles through compatibility entry points.
- [x] Run all Robo model/state/DOM, relevant goal routing and clock tests; independent review and visual comparison.

## Task 3: Experience and Flow ownership migration

**Owner:** modules worker. **Files:** src/experiences/**, src/flows/**, remaining flow definitions/previews and affected raw-source/handoff compatibility registration; dedicated ownership/composition/export tests.
**Interfaces:** Separate FlowDefinition vs runtime FlowMeta contracts; metadata has no React imports. Existing feature resolver remains behavior authority. Implemented PI baseline/future and Kids experiences own composition adapters; prepared placeholders remain explicit.
- [x] Validate actual product/country/release matrix, including implemented Kids RO, against actual screen dispatch.
- [x] Migrate remaining Flow Library definitions/renderers into owned public modules with old path wrappers, source slicing and complete dependency export.
- [x] Catalogue supported baseline/future experience modules and connect executable composition adapters through existing context/router interfaces without cloning screens or adding another feature gate.
- [x] Add duplicate/reference/source-path/unsupported-context and all-country/export regressions; run Flow/package/platform suites and module/template audits.

## Task 4: Analytics and HU Kids state models

**Owner:** allocated after Task 1 integration; separate worker or coordinator. **Files:** Evo2027AnalyticsScreen.tsx, evoAnalyticsState.ts, features/analytics/**, HU Kids goal screens/state and features/kids/hu/goals/**.
**Interfaces:** Reducer-owned period/scope/split/bucket/drill-down and HU overview/detail/create/schedule/add-money state; pure selectors, stable exports and UI geometry hooks.
- [x] Characterize existing selection/back/privacy and HU scheduling/add-money behaviors.
- [x] Extract pure selectors and guarded typed reducers; move presentation sections without altering current UI.
- [x] Verify transition/selector tests and all current Analytics/PFM/HU DOM suites; independent review and browser smoke.

## Task 5: CZ chat domain handler completion

**Owner:** allocated separate chat worker. **Files:** czChatOrchestration.ts, src/app/chat/cz/**, focused chat model/handlers and tests; no App coordinator edits without its owner.
**Interfaces:** buildCzChatSmartReplyResolver, existing NLU and ordered no-match fallback, normalized immutable context and canonical reply/action shapes.
- [x] Pin canonical/ambiguous prompts and reply rich blocks/actions/follow-ups.
- [x] Complete domain-owned accounts/transactions, cards/limits, savings/deposits, investments/goals, documents/messages/payments and Prime/support handlers with explicit precedence.
- [x] Run all chat/NLU and relevant App handoff tests; independent review of behavior equivalence.

## Task 6: Pure product derivation and declarative composition

**Owner:** coordinator; explicit registry/icon worker after Task 3. **Files:** useProducts.ts, features/products/**, component/template/screen/icon registries and domain aggregation, translations if remaining gaps; dedicated pure selector and registry tests.
**Interfaces:** useProducts becomes memoized React adapter; existing configuration/export APIs and stable IDs/copy/override precedence remain intact.
- [x] Pin product count/clone/balance/CZ fixtures/transform outputs across supported contexts, then extract pure selectors/fixtures.
- [x] Split handwritten registry/icon surfaces by actual domain ownership, retaining declarative payloads when splitting would not help; add uniqueness/reference/schema tests.
- [x] Verify existing shared English baseline/market override completeness; finish any remaining coupling without changing resolved copy.
- [x] Run product/registry/icon/translation suites, all audits and typecheck; independent review.

## Task 7: Strict zero-warning verification and meaningful coverage

**Owner:** coordinator plus explicitly allocated disjoint lint/test worker files. **Files:** 42 current lint sites (reserved worker-owned files excluded until their task finishes), test setup/runtime, meaningful uncovered feature suites, package/CI configuration only after measured passing evidence, exact asset baseline.
**Interfaces:** Existing thresholds remain or ratchet upward. Deterministic ResizeObserver/positive chart geometry/cleanup remove unexplained chart warnings; no console suppression or global timeout increase.
- [x] Reconcile the new referenced Robo quit SVG in the asset audit without modifying its bytes.
- [x] Resolve all active lint findings with semantic keyboard/label/ARIA/hook corrections that preserve pixels and intended actions; no blanket exclusions.
- [x] Correct browser test geometry and ownership cleanup with regressions; separate Node/jsdom setup where useful.
- [x] Add meaningful coverage for uncovered actual behavior until all four existing thresholds pass on the full suite.
- [x] Ratchet lint to zero warnings and add strict measured coverage to CI/full verification once passing.

## Task 8: Final independent review, full checks and delivery

**Owner:** coordinator/reviewer. **Files:** final report, ledger and current checkout.
- [x] Run final typecheck, lint, targeted format, full tests/coverage, every audit, build and delta whitespace checks.
- [x] Compare representative current-input and refactored screens and exercise critical routes/quit/resume/privacy/requests/back/share; inspect browser errors.
- [x] Independently review the full delta against the protected input and resolve important findings with RED/GREEN proof.
- [x] Confirm operator assets/edits remain intact, document all completed acceptance criteria and leave current checkout ready for development, then perform the explicitly authorized production publication.
- [x] Publish the verified source to the existing correctly linked Vercel production project and verify deployment readiness, asset delivery and representative live routes. No extra confirmation is required: the user explicitly authorized overnight completion and publication.

## Preflight rulings

- User explicitly authorized completing the whole program after the other agent finished, in the existing checkout. Worktree/approval defaults in skills are overridden by that instruction.
- Windows-native ledger/snapshot tools replace Bash workspace scripts; evidence and ownership are preserved.
- Existing source has 16 failed tests in five files after approved Robo edits; input is a characterization target. Current quit/resume, top-up/order and clock policy win over stale expectations.
- The local Graphify Python executable is invalid for this OS. TypeScript-emitted static import analysis is available; record its limits instead of altering the user's Python installation.
- Task 1 and Task 3 share composition only: modules worker publishes adapters, App worker/Root integrates them serially. Task 2 and Task 1 share type-only investment callbacks, retaining compatibility. Lint edits never run concurrently on an owned App/Robo/Flow file.

## Final completion evidence

All tasks completed, 7/8 October 2026. Combined verify: 175 files, 2,079 tests, coverage 81.86/80.38/66.06, zero lint warnings, strict thresholds unchanged, all seven audits and build pass. Full independent source/specification/quality review passes. Protected input visual comparisons and critical local/live flows are recorded in docs/architecture/COMPLETE_REFACTOR_RESULT_2026-10-07.md. All 311 protected image files retain their raw hashes.

Vercel production dpl_A7vZc19Xx8y8fPhdKuhv1MwWy1zg is READY; mobile-banking-cee.vercel.app points to source a9a1d904c130c489d07b9366102747f52be7796b, exact tree 8effef74eb9d075593fc4779f915bcf57b7f07c4. Existing local branch/index and operator files are preserved. Anonymous access remains unauthenticated. Raw Windows/Linux bundle byte identity is not assumed; source identity and deployment/browser evidence are documented.
