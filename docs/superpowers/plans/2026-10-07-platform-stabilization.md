# Platform Stabilization and Independent Ownership Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for the coordinator's work and superpowers:dispatching-parallel-agents for independent investigation. Follow test-driven-development for corrections; requesting-code-review provides independent review before integration. Steps use checkbox syntax.

**Goal:** Stabilize the current demo and introduce validated ownership boundaries for Flows, PI Romania baseline, and PI Czech future experiences without redesigning approved screens.

**Architecture:** Extend effectiveAppContext and ROUTE_POLICY. Feature modules own reusable behavior; experiences select composition; Flow Library keeps its separate specification/prototype contract. Typed module aggregation precedes any generator. Preserve compatibility entry points during extraction.

**Tech Stack:** Existing React 18, TypeScript 5, Vite 6, Vitest 3 and mock repositories. No new routing/state-management dependencies.

**Spec:** docs/superpowers/specs/2026-08-30-code-quality-refactor-program-design.md, the approved revised proposal, and .codex-temp/technical-reassessment-2026-10-07-v3 in the original checkout.

## Global Constraints

- Preserve all stakeholder-visible banking behavior and approved layouts.
- Preserve the existing App entry point, NavigationProvider, Screen, NavigationRoute, and navigateTo compatibility surface.
- Do not introduce a new runtime state-machine or routing dependency. Typed reducers and existing React primitives are sufficient.
- Do not weaken strict TypeScript flags, existing audits, or current behavioral assertions.
- Add a failing characterization or regression test before every production-code behavior change.
- Pure extractions must demonstrate behavioral equivalence with existing fixtures before callers move.
- Existing uncommitted work belongs to the operator and must not be reverted, reformatted wholesale, or overwritten.
- Generated and declarative content is split only when the split improves ownership, validation, or loading. File size alone is not a reason to fragment data.
- No deployment, remote mutation, asset deletion, or image conversion is included.
- Reconcile stale tests with observed approved behavior rather than rolling back recent UI changes to satisfy old selectors.
- Integrate only our delta over input commit 5baf673; preserve concurrent source-checkout changes through comparison/three-way merging.

## Review Focus

- Switching market after an approved credit limit must not reinterpret a CZK mutation as RON; returning to a valid original context must retain intentional state.
- Deep links and back navigation must preserve supported contexts and transaction account/card provenance; unsupported destinations must have a defined outcome.
- A local render/async failure must retain operator controls and usable recovery; malformed API/storage values must reach a terminal access state.
- Hidden amounts must remain masked in chart text and tooltips; demo dates must use one explicit clock contract without changing accepted fixture presentation.
- Ownership/extraction must preserve Flow IDs, scenario order, raw-source and ZIP exports, existing releases and country formatting; shared integration remains explicit.

## Task 0: Final evaluation and protected input

**Files:** Original checkout .codex-temp/technical-reassessment-2026-10-07-v3; isolated input commit 5baf673.

- [x] Freeze HEAD efe26b6 plus the 13 local source/test changes into a SHA-256 manifest and copy.
- [x] Run all verification components independently; confirm current defects with existing orchestration probes.
- [x] Seed the managed worktree with this exact source and preserve it in a separate input commit.
- [x] Record full fresh results and migration rulings in the ledger before application edits.

## Task 1: Deterministic test foundation and HMR

**Files:** tests/setup.ts; tests/tooling/browser-test-runtime.test.ts; src/app/screens/flow-library/components/geniusMyCarContext.ts; a focused context-cache helper/test if required; tests/helpers as needed.

**Interfaces:** Preserve MyCarSessionContext provider/consumer identity when hot data exists. Browser shims implement the standard matchMedia contract and may be overridden by behavior-specific tests.

- [x] Reproduce the HMR suite-loading failure and Escape-close matchMedia failure before editing.
- [x] Add tests for context creation without hot data, reuse with hot data, and reduced-motion close behavior.
- [x] Guard both reads and writes of HMR data, with no production session reset.
- [x] Add a shared deterministic matchMedia shim without removing existing geometry/pointer setup.
- [x] Run Flow Library, bulk approval, RS insurance, shared primitives and browser-runtime tests; typecheck.
- [x] Review the delta and commit only this task's files.

## Task 2: Access input and storage boundaries

**Files:** api/access.js; src/app/components/security/AccessGate.tsx; accessGatePolicy.ts; tests/security/access.test.ts; new access-gate component tests.

**Interfaces:** Preserve endpoint methods, response shapes, configured passwords/tokens and existing gate layout. Local access persistence is optional; denial/corruption must not leave checking/submitting indefinitely.

- [x] Add failing cases for JSON null/array/invalid payload, malformed/non-object server JSON, storage null/corruption/read/write rejection, and IPv6 loopback.
- [x] Validate unknown values before field reads; handle initialization/submission failures with existing locked/error states.
- [x] Preserve authentication checks and do not introduce credentials or alter protected-deployment configuration.
- [x] Run all security tests and gate DOM tests; typecheck/lint the touched files.
- [x] Produce a report with RED/GREEN evidence; coordinator reviews and commits this isolated domain.

## Task 3: Scoped credit mutations and route provenance

**Files:** src/app/App.tsx; NavigationContext.tsx; navigation/initialNavigation.ts; routePolicy.ts; components/demo/DemoNavigationSync.tsx; utils/deepLink.ts; new features/cards/credit-limit module; navigation/state regression tests.

**Interfaces:** Add transaction-route provenance compatibly to NavigationRoute. Credit overrides are read/write through an explicit product/country/data scope while CardDetailScreen still receives the current per-card map. Existing routes and URL parameters remain compatible.

- [x] Promote the three audit orchestration scenarios into regression tests expecting valid RO fallback, isolated CZ/RO limits and correct account/card share parent.
- [x] Implement a scoped credit state module with pure selectors and a React adapter; invalidate only pending operations whose entity/context has changed.
- [x] Extend current route eligibility for the feature-gated My Banker destination using existing feature resolution; retain honest unsupported outcomes for incomplete product/design-system contexts.
- [x] Derive transaction share provenance from the active route, retaining the intentional stable-parent restoration policy.
- [x] Test CZ → RO → CZ, preview/baseline switches, card/account navigation and initial deep links; run the navigation suite and App-related integration tests.
- [x] Review compatibility and commit.

## Task 4: Local recovery inside the shell

**Files:** src/main.tsx; app/platform/runtimeErrors.ts; app/components/ScreenErrorBoundary.tsx; App.tsx; components/CodeBlock.tsx; error-boundary/runtime recovery tests.

**Interfaces:** Boot failures retain diagnostic output. Once React is mounted, global listeners report errors without replacing the DOM. ScreenErrorBoundary offers retry/back within the existing shell and resets on destination/context identity. CodeBlock preserves a readable plain-code fallback on highlighter failure.

- [x] Add failing tests for post-mount global errors retaining root controls, destination failures retaining shell, and failed highlighting without an unhandled rejection.
- [x] Implement scoped recovery and bounded retry with the existing visual primitives; preserve normal-screen output.
- [x] Verify route/context changes recover from a failed destination and cleanup does not leak listeners.
- [x] Run recovery/component/App tests and browser smoke of affected destinations; commit.

## Task 5: Analytics selectors/privacy and consistent Robo clock

**Files:** screens/analytics/Evo2027AnalyticsScreen.tsx; components/pfm/PfmCategoryBubbleChart.tsx; feature-owned analytics selector module; screens/investments/roboAdvisorFlowState.ts; CzFutureRoboAdvisorFlow.tsx; explicit demo-clock/date helpers; relevant tests.

**Interfaces:** Other availability derives from generated segments. amountsHidden defaults false and covers chart text/tooltips. Preserve the seeded Robo demo date and inject one declared reference clock into both calendar restriction and semantic funding validation; do not silently apply machine time to fixed demo fixtures.

- [x] Add RED cases for 95/5 Other selection, masked bubble labels/tooltips, invalid/earlier funding dates and a valid seeded date independent of machine clock.
- [x] Extract the smallest pure selection/validation modules; keep chart geometry, copy and state transitions otherwise identical.
- [x] Pass existing privacy state to the bubble chart and use the established masking presentation.
- [x] Align Robo date initialization/calendar/guard around the explicit demo clock; preserve new goal/portfolio changes from the input commit.
- [x] Run Analytics, PFM, Robo model/state/DOM and investment routing tests; verify visible normal-state output; commit.

## Task 6: Restore the full quality gate without UI rollback

**Files:** Failing test files identified in v3/test-report.json; scripts/audit-investments-portfolio.mjs; scripts/asset-baseline.json and asset-audit reporting; legacy lint sites; checked formatting files; package.json/vitest.config.ts/verify.yml only after reliable coverage evidence.

**Interfaces:** Keep supported product/market UI behavior and strict compiler/audit guarantees. Update intentional taxonomy/assets together with validated counts/references; old UI labels/classes must not dictate reverting current layouts.

- [x] Classify each failure as production defect, stale expectation, data/time nondeterminism or test-runtime gap; record the cause.
- [x] Correct deterministic fixtures/behavior assertions and confirmed defects with regression proof; no test deletion or blanket suppression.
- [x] Reconcile Fund/Stock/Bond taxonomy and intentional tracked assets; report the exact delta and verify references.
- [x] Correct the recommended ESLint rule conversion; keep active rules/options and the warning allowance. Record the 104 remaining pre-existing warnings for follow-up rather than changing approved markup in this stabilization.
- [x] Run full tests, typecheck, lint, format, all audits and build. Run coverage after tests stabilize; retain enforced thresholds and add CI coverage only with measured passing evidence.
- [x] Commit reviewable groups with their test evidence.

## Task 7: Independent ownership pilot and experience manifests

**Files:** src/flows/shared/investments-bulk-approval/; its legacy compatibility exports; flow-library/components/screenSources.ts and handoff/referencePackage.ts as required; src/experiences/pi/ro/baseline/manifest.ts; src/experiences/pi/cz/evo-2027/manifest.ts; typed experience contracts/aggregation; effectiveAppContext.ts; module ownership docs/AGENTS and ownership validation script/tests.

**Interfaces:** Existing FlowDefinition/FlowPreviewId remain separate from runtime FlowMeta/FlowId. Experiences declare existing product/country/designSystem/release axes and composition metadata; active feature behavior still derives through the existing resolver. New source exports include every extracted runtime dependency.

- [x] Characterize existing bulk approval scenarios, selection/signing behavior, raw source/ZIP contents and Flow restoration before moves.
- [x] Introduce a public Flow entry point and feature-owned selection/session model behind compatibility re-exports, with stable IDs and unchanged presentation.
- [x] Add typed RO baseline and CZ Evo manifests selecting existing contracts; effectiveAppContext consumes this metadata without introducing a competing availability engine.
- [x] Add duplicate/reference validation and import boundaries for new modules; repair the three confirmed cycles through leaf helpers rather than moving whole screens.
- [x] Define path ownership including tests, fixtures, assets, docs and shared integration responsibility. Provide an executable task-scope/diff check for worktree-based tasks; distinguish detection from physical locks.
- [x] Test export dependencies, all-country preview formatting, unchanged baseline/CZ/Evo navigation and scope enforcement for added/deleted/renamed files.
- [x] Run full gate and visual comparison; review and commit.

## Task 8: Final review, visual verification and integration

**Files:** Final report and migration/ownership documentation; original checkout receives only verified changes.

- [x] Run the full quality gate on the finished branch and independent whole-branch review against input commit 5baf673.
- [x] Verify baseline PI RO, CZ Evo/Robo portfolio, RS Future Gain, Flow Library signing and privacy in browser; compare representative normal screens against the unchanged input build. Back/share and recovery have real-App regression coverage; no complete manual traversal of every possible screen is claimed.
- [x] Resolve important review findings with RED/GREEN tests; record any limited or unverified area explicitly.
- [x] Compare the original checkout with the input manifest; three-way integrate only our changed files, preserving concurrent edits.
- [x] Run the gate again on the integrated result; leave reviewable commits/artifacts and no deployment.

## Preflight rulings

- The user explicitly approved execution and worktree isolation; no additional plan/worktree approval is required.
- Native Windows execution replaces Bash-only ledger helpers where necessary; the same briefs, evidence and task ledger are preserved.
- The input has pre-existing failed checks. Stabilization is explicitly approved, so failures are investigation inputs rather than an approval stop.
- No broad router rewrite, universal context remount, app-per-country copies or generator framework is included.
