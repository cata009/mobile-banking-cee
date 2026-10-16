# PI Baseline Investments Native implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Preserve the approved existing architecture and follow recorded disjoint ownership.

**Goal:** Make existing PI Baseline investment screens, values and interactions use the shared Web/Android implementation with actual localhost4004 reference parity.

**Architecture:** Keep Source UI as the comparator and pure Source financial authorities canonical. Add baseline presentations under current/investments/baseline; the existing Native entry selects them only for audited Baseline contexts. Integrate the existing plain-data bridge for portfolio, history, approval and coordinator requests; preserve every other experience and renderer.

**Tech Stack:** TypeScript, React Native 0.87, React Native Web, react-native-svg; existing React18/19 isolated-root boundary.

**Spec:** .codex-temp/native-baseline-investments/brief.md (approved user mandate and constraints).

## Global constraints

- Countries RO, HU, RS, SI, CZ, SK, BA, BA_BL; active/current DS; current and v1-v4 releases.
- Original Source UI, source exports/data, Evo, Italy and Kids are preserved.
- Investments-specific coverage does not enable the held redesigned Homepage variants.
- Exact labels, inert actions, defaults, Back and financial calculations follow Source.
- Main checkout only; no Git index changes, commits, remote release, Kotlin UI or new dependencies.
- Workers record fresh ownership/base/pending/before hashes and exact final file deltas.

## Review focus

- A blank/zero portfolio must remain usable with no invented holdings or order account.
- Locale, currency, privacy and product counts must use resolved Source authorities.
- Explicit external buy/funds/security/history intent is consumed once, survives valid Back transitions and never replays stale requests.
- Source inert Documents/report/sign/reject controls remain inert, without adding financial execution.
- Independent React roots, resize and overlays preserve current navigation/session behavior.

### Task 1: Reference characterization

- [x] Capture all40 Source baseline initial contexts with explicit renderer=reference.
- [ ] Characterize representative nested portfolio/catalog/instrument/order/history/approval states and record expected strings/fields/defaults.
- [ ] Save exact route/intent and country model matrix; retain raw artifacts.

### Task 2: Portfolio and distribution (common_home_details)

Files: NEW native-spike/src/experiences/pi/current/investments/baseline/overview/** and baseline-investments-overview tests.
Interface: baseline/contracts.ts exports BaselineInvestmentOverviewProps and BaselineInvestmentDistributionProps; root owns controller state and callbacks.

- [ ] Write and observe failing Source-default/state/interaction tests.
- [ ] Implement exact Source layout, charts, tabs, sorting, accordions and inert distribution rows.
- [ ] Run focused tests, TypeScript and lint; publish exact delta and sample browser comparisons.

### Task 3: Instrument, orders and history (common_payments_pfm)

Files: NEW baseline/flows/** and baseline/Frame.tsx; new baseline-investments flow tests.
Interface: host+Source security/accounts/history; explicit onBack/onComplete/onHistory(title). Shared Frame is owned by this worker.

- [ ] Characterize and test quantity1, account/security-account selection, amount/FX/price dates, review, document/sign/success and Source inert actions.
- [ ] Implement Source-faithful Instrument, BuyOrder, SellOrder, History and PendingOrders without modifying Evo views.
- [ ] Run focused tests, TypeScript and lint; publish exact delta.

### Task 4: Catalog, funds and baskets (common_offers_more)

Files: NEW baseline/catalog/** and new baseline-investments-catalog tests.
Interface: host+Source catalog; onBack/onSelect/onSelectBasket; Funds includes initialCollection; Basket includes Source basket.

- [ ] Pin Source search/tab/filter/selection/Back/remount and empty states with failing tests.
- [ ] Implement exact baseline views with existing Source assets and shared Native primitives.
- [ ] Run focused tests, TypeScript and lint; publish exact delta.

### Task 5: Route/controller/intent integration (root)

Files: investments/Investments.tsx and new baseline controller/contracts; Source demo-native policy/contracts/eligibility and host surface/AppShell only as required.

- [ ] Add failing40-context policy, route round-trip and request-consumption tests.
- [ ] Compose new baseline views from canonical snapshot; preserve Source outer-history versus local-detail Back/remount.
- [ ] Bridge portfolio/history/approval and supported coordinator requests without enabling other held routes or feature variants.
- [ ] Verify model equality, external drafts, unknown flags/releases and legacy boundaries.

### Task 6: Actual browser and Android verification

- [ ] Compare reference and shared renderer on40 initial country/release contexts.
- [ ] Compare representative nested functional states with values/inputs/Back and raw screenshots, including locale, privacy, counts/empty and frames/Fold.
- [ ] Review failures and raw residuals honestly; do not mask or silently replace captures.
- [ ] Build signed private APK and verify investment entry and representative flow on emulator; physical-device pixel acceptance stays explicit.

### Task 7: Combined gate and same report

- [ ] Freeze production editors; review exact per-owner deltas sequentially.
- [ ] Run affected tests, Native strict TypeScript/lint/full tests and fidelity guards.
- [ ] Integration owner runs npm run verify on final combined state.
- [ ] Update existing native-baseline-home-integration/report.html and progress.json with the Investments before/after matrix and remaining scope.
- [ ] Verify Source reference preservation and combined cooperative scope; publish no remote changes.
