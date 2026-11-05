# Investment Review and History Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the supplied CZ Robo review-flow corrections and keep the Investments History filter scroll indicator visible.

**Architecture:** Keep the React screen adapters aligned with the authoritative native CZ Robo screens under `native-spike`. Reuse the existing bottom sheet, navigation-row, order-accordions, authorization, and standard-success components, adding only scoped props or local behavior where the existing implementation cannot express the request. Update the baseline React Native History filter scaffold independently, preserving the existing filter state and layout.

**Tech Stack:** React, TypeScript, Tailwind utilities, React Native, React Native Web, Vitest, Jest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-05-cz-robo-order-review-design.md`

## Global Constraints

- Keep the current `current` design-system axis and `release-future-cz-robo` release.
- Start CZ Robo creation with contact confirmation, then show the “Invest towards what matters” introduction with Back returning to contact confirmation.
- Preserve Robo business policies, order calculations, scenario order, screen kinds, navigation IDs, and exported flow definitions.
- Preserve the default Face ID simulation for callers that do not opt into the CZ Robo demo path.
- Use the native `SourceBottomSheet`, `BaselineNavigationRow`, `OrderDocuments`, `Signing`, and `BaselineStandardSuccess` implementations. Keep the React screen adapters aligned.
- Keep the history filter indicator change local to its existing React Native `ScrollView`.

## Review Focus

- Switching Phone and Email info sheets must never leave the obsolete combined Contact details sheet open — test the two controls and dismissal independently in Task 1.
- The contract reader must be reachable by keyboard; Download document stays enabled at all times, while only the read acknowledgement stays disabled until the document end — assert initial availability and exercise a bottom scroll in Task 2.
- The top-up review must show one basket identifier with the existing Buy Order accordions and selected cash account — retain assertions in Task 3.
- Demo top-up signing must reach success directly while ordinary sign screens retain Face ID behavior — test both branches in Task 3.
- The filter indicator must remain visible when content overflows, without changing filter choices or application — assert the `ScrollView` indicator props and retain the integration test in Task 4.

---

### Task 1: Personal data info sheets

**Files:**

- Modify: `src/app/screens/investments/robo/PersonalDataConfirmationScreen.tsx`
- Modify: `native-spike/src/experiences/pi/cz/evo-2027/robo/CreationScreens.tsx`
- Test: `tests/screens/cz-future-robo-advisor-flow.test.tsx`
- Test: `native-spike/__tests__/cz-evo-robo-figma-flow.test.tsx`

**Interfaces:**

- Reuse native `SourceBottomSheet` in `CreationScreens.tsx` and the React `BottomSheet` in its adapter.
- Keep screen callbacks unchanged; local state selects `phone`, `email`, or no sheet.

- [ ] **Step 1: Add a failing test** named `opens separate phone and email information sheets` asserting the Figma titles and copy, and that closing one leaves neither sheet open.
- [ ] **Step 2: Run RED** with `npm test -- tests/screens/cz-future-robo-advisor-flow.test.tsx -t "separate phone and email information sheets"`.
      **Expected:** FAIL because the info icons are not buttons and their sheets do not exist.
- [ ] **Step 3: Implement** accessible Phone number and Email Address info buttons, one mutually exclusive `SourceBottomSheet`, and the supplied copy in the native screen; keep the web adapter aligned. Remove the combined Contact details modal and Help icon.
- [ ] **Step 4: Run GREEN** with the same command.
      **Expected:** PASS for the new test.

### Task 2: Always-available download and scroll-gated contract acknowledgement

**Files:**

- Modify: `src/app/screens/investments/robo/CreationReviewScreen.tsx`
- Modify: `native-spike/src/experiences/pi/cz/evo-2027/robo/InvestmentContract.tsx`
- Test: `tests/screens/cz-future-robo-advisor-flow.test.tsx`
- Test: `native-spike/__tests__/cz-robo-contract-content.test.tsx`

**Interfaces:**

- Keep the native demo document in `InvestmentContract.tsx`; keep Download document visible and enabled regardless of scroll position, and gate only the read acknowledgement until its existing scroll reader reaches the end. Keep the web adapter aligned.

- [ ] **Step 1: Add a failing test** asserting Download document is enabled before scrolling and the read acknowledgement remains disabled until the reader reaches its end.
- [ ] **Step 2: Run RED** with `npm test -- tests/screens/cz-future-robo-advisor-flow.test.tsx -t "keeps download available"` and the corresponding focused native contract test.
      **Expected:** FAIL because both Download document actions are currently disabled until the reader reaches the end.
- [ ] **Step 3: Implement** an always-enabled Download document action in both readers. Preserve the end-of-document acknowledgement gate and the fictitious demo text.
- [ ] **Step 4: Run GREEN** with the same command.
      **Expected:** PASS for the new test.

### Task 3: KID row, Add money close action and CZ Robo top-up completion

**Files:**

- Modify: `src/app/screens/investments/robo/TopUpScreens.tsx`
- Modify: `src/app/screens/investments/robo/ManagementInputScreen.tsx`
- Modify: `src/app/components/flow/StandardSignScreen.tsx`
- Modify: `native-spike/src/experiences/pi/cz/evo-2027/robo/HoldingDetails.tsx`
- Modify: `native-spike/src/experiences/pi/cz/evo-2027/robo/Management.tsx`
- Modify: `native-spike/src/experiences/pi/cz/evo-2027/investments/Signing.tsx`
- Modify: `native-spike/src/experiences/pi/cz/evo-2027/auth/Authorization.tsx`
- Modify: `native-spike/src/experiences/pi/cz/evo-2027/investments/OrderDocuments.tsx`
- Modify: `native-spike/src/experiences/pi/cz/evo-2027/investments/BuyOrder.tsx`
- Test: `tests/screens/cz-future-robo-advisor-flow.test.tsx`
- Test: `tests/screens/standard-flow-screens.test.tsx`
- Test: `native-spike/__tests__/cz-evo-robo-management.test.tsx`
- Test: `native-spike/__tests__/cz-robo-management-presentation.test.tsx`
- Test: `native-spike/__tests__/cz-evo-robo-figma-flow.test.tsx`

**Interfaces:**

- Use the standard Buy Order row and `OrderDocuments` accordion components; show the basket's single ISIN and existing cash-account data.
- Add one opt-in native `Signing`/`Authorization` prop for the simulated CZ Robo top-up path; its default preserves biometric and explicit-demo authorization behavior.
- Use `BaselineStandardSuccess` with the existing top-up completion callback.

- [ ] **Step 1: Add failing tests** asserting Add money exposes its Close action, the KID row uses `BaselineNavigationRow`, top-up review contains one basket ISIN and the existing accordions, signing reaches success without Demo authorization, and success uses “Ok, I got it” without a Page header.
- [ ] **Step 2: Run RED** from `native-spike` with `npm test -- --runInBand __tests__/cz-robo-management-presentation.test.tsx`.
      **Expected:** FAIL for the new KID/review/sign/success assertions.
- [ ] **Step 3: Implement** the scoped KID row sizing, standard review rows and accordions, opt-in direct demo completion, and `BaselineStandardSuccess`. Preserve ordinary investment sign behavior.
- [ ] **Step 4: Run GREEN** from `native-spike` with the same command.
      **Expected:** PASS for the new presentation assertions.
- [ ] **Step 5: Run** the affected root React tests with `npm test -- tests/screens/cz-future-robo-advisor-flow.test.tsx tests/screens/standard-flow-screens.test.tsx`.
      **Expected:** PASS for the aligned adapter and unchanged default Face ID path.

### Task 4: Persistent Investments History filter scrollbar

**Files:**

- Modify: `native-spike/src/experiences/pi/current/investments/baseline/flows/HistoryFilters.tsx`
- Test: `native-spike/__tests__/baseline-investments-history.test.tsx`

**Interfaces:**

- Keep the existing `Scaffold` layout and filter callbacks; set the existing filter `ScrollView` indicator props explicitly.

- [ ] **Step 1: Add a failing test** named `keeps a persistent vertical scrollbar on the Apply filters sheet` that opens the filter sheet and asserts its `ScrollView` requests a shown, persistent vertical indicator.
- [ ] **Step 2: Run RED** from `native-spike` with `npm test -- --runInBand __tests__/baseline-investments-history.test.tsx -t "persistent vertical scrollbar"`.
      **Expected:** FAIL because the filter scroll view does not request a persistent indicator.
- [ ] **Step 3: Implement** explicit vertical indicator visibility and persistence on the filter sheet's existing `ScrollView` only.
- [ ] **Step 4: Run GREEN** with the same command.
      **Expected:** PASS for the new assertion.

## Final verification

- Run the complete affected root Vitest files from Tasks 1–3.
- Run the complete `native-spike/__tests__/baseline-investments-history.test.tsx` suite.
- Run `npm run audit:modules` from the root.
- Keep the account carousel drag test's element types narrowed before event injection so the strict root typecheck can complete.
- Inspect the changed CZ Robo states and History filter in the running host.
- Have the integration owner run `npm run verify` once on the combined checkout.
