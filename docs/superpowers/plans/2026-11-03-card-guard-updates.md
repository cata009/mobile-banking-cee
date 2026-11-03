# Card guard Follow-up Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Card guard explain unsettled payments, request card blocking explicitly, reserve disputes for booked payments, and offer a post-submission virtual-card choice.

**Architecture:** Keep fraud policy in the feature reducer and canonical screen contracts. Use presentation-only properties for the shared Native transaction preview, and invoke the existing virtual-card issue composition only from this BA Card guard demo route.

**Tech Stack:** TypeScript, React, React Native Web, Vitest, Jest.

**Spec:** `docs/superpowers/specs/2026-11-03-card-guard-updates-design.md`

## Global Constraints

- Preserve Flow ID, existing screen IDs and scenario order.
- Do not freeze an active card without the explicit customer choice and successful submission.
- Do not offer a dispute for pending or declined activity.
- Keep normal baseline transaction presentation unchanged outside Card guard.
- Do not route the Card limits row to security controls; keep its label and behavior separate.
- The Card guard security sub-screen is Native baseline composition controlled by a typed preview event; ordinary baseline routes remain unchanged.
- Retain all pre-existing user edits and do not stage or commit unrelated changes.

## Review Focus

1. A failed report or a back navigation must leave an active card active; verify in the feature reducer test.
2. A declined attempt or pending authorisation must not reveal `Open dispute`; both stay on the report path from the shared next-step screen.
3. The booked-payment dispute step must preserve the selected transaction into review; verify end-to-end in the flow test.
4. Choosing `Not now` on the receipt must preserve case tracking; verify in the flow test.
5. The Card guard-only settlement override must not change ordinary Native transaction screens; verify in Native preview tests.

---

### Task 1: Explicit card-block choice

**Files:**
- Modify: `src/features/cards/fraud/model.ts`
- Test: `tests/features/ba-card-fraud-model.test.ts`

**Interfaces:**
- `FraudAction.report` carries an explicit `blockCardOnSubmit` boolean.
- `FraudSession` records that choice until submission completes or the intent is replaced.

- [x] Add tests that reporting without the explicit choice does not freeze, choosing it freezes only after successful submission, and a failed submission leaves the card active.
- [x] Run `npm.cmd test -- tests/features/ba-card-fraud-model.test.ts`; confirm the new assertions fail on unconditional freezing.
- [x] Implement the reducer change without changing closed-card behavior.
- [x] Run the same test file and confirm it passes.

### Task 2: Settlement copy and booked-only dispute step

**Files:**
- Modify: `src/flows/ba/card-fraud/definition.ts`, `src/flows/ba/card-fraud/screenContracts.ts`, `src/flows/ba/card-fraud/FraudActivityList.tsx`, `src/flows/ba/card-fraud/FraudBaselineScreen.tsx`, `src/flows/ba/card-fraud/FraudScreens.tsx`
- Modify: `src/features/demo-native/transactionPresentation.ts`, `native-spike/src/experiences/pi/current/baseline/Transaction.tsx`
- Test: `tests/flows/ba-card-fraud.test.tsx`, `native-spike/__tests__/pi-native-transaction-preview.test.tsx`

**Interfaces:**
- `NativeTransactionPresentation` adds optional flow-scoped status label and explanation values.
- `FraudScreen` adds `fraud-dispute-intro`; it follows the explicit card-block action for all statuses, but displays `Open dispute` only when the selected payment is booked.

- [x] Add UI tests for settlement copy, explicit block wording, the booked `Open dispute` action, and the absence of that action for pending/declined activity.
- [x] Run the focused tests and confirm failures on the current UI.
- [x] Add the presentation override and screen contracts, preserving the default Native `Pending` output for unrelated routes.
- [x] Run focused root and Native tests.

### Task 3: Native Card security composition

**Files:**
- Create: `native-spike/src/experiences/pi/current/baseline/CardSecurity.tsx`
- Modify: `native-spike/src/experiences/pi/current/baseline/CardOptions.tsx`, `native-spike/src/experiences/pi/current/banking/Cards.tsx`, `native-spike/src/experiences/pi/current/NativeCurrentApp.tsx`, `native-spike/src/experiences/pi/current/contracts.ts`, `src/features/demo-native/bankingPresentation.ts`, `src/features/demo-native/contracts.ts`, `src/app/components/demo/NativeScreenPreview.tsx`, `src/flows/ba/card-fraud/FraudBaselineScreen.tsx`, `src/flows/ba/card-fraud/FraudJourney.tsx`, `src/flows/ba/card-fraud/FraudScreens.tsx`, `src/flows/ba/card-fraud/screenContracts.ts`
- Test: `native-spike/__tests__/card-guard-security.test.tsx`, `tests/flows/ba-card-fraud.test.tsx`

**Interfaces:**
- Plain `NativeCardSecurityPresentation` carries channel, country-protection and card-state values without importing fraud policy into Native UI.
- `NativeDemoEvents.onCardSecuritySettingChange` carries typed user changes back to the feature reducer.

- [x] Add tests that Card security uses baseline rows and that control changes reach the feature reducer; assert Card options has no extra security row.
- [x] Run focused tests and confirm they fail before implementation.
- [x] Render the security sub-screen from the card-level Block Card route and remove only the duplicate Card options row.
- [x] Run focused root and Native tests.

### Task 4: Post-submission virtual-card choice

**Files:**
- Modify: `src/flows/ba/card-fraud/FraudScreens.tsx`, `src/flows/ba/card-fraud/FraudJourney.tsx`, `src/flows/ba/card-fraud/definition.ts`, `src/flows/ba/card-fraud/screenContracts.ts`
- Modify: `src/features/cards/virtual-card/model.ts`, `native-spike/src/experiences/pi/current/baseline/offers/Detail.tsx`, `native-spike/src/experiences/pi/current/baseline/virtual-card/VirtualCardFlow.tsx`, `native-spike/src/experiences/pi/current/banking/virtualCardStore.ts`, `native-spike/src/experiences/pi/current/NativeCurrentApp.tsx`, `native-spike/src/experiences/pi/current/contracts.ts`
- Test: `tests/flows/ba-card-fraud.test.tsx`, `tests/features/ro-virtual-card.test.ts`, `native-spike/__tests__/ro-virtual-card-flow.test.tsx`

- [x] Add tests for both receipt choices, case tracking after `Not now`, and the scoped BA issue route.
- [x] Run focused tests and confirm they fail before implementation.
- [x] Connect the explicit BA Card guard demo route to the existing Native issue flow using a preview-only BAM account policy; leave normal RO issue eligibility unchanged.
- [x] Run focused tests.

## Final verification

- [x] Run affected root and Native tests.
- [x] Run the integration-owner gate `npm.cmd run verify` on the combined checkout after all editors finish.
- [x] Review only this task's exact file delta against the ownership record; stage and commit only this task's paths.

The combined checkout verification completed with 4,119 tests passing and one unrelated Flow Library scroll-position test failing. The pre-existing `FlowLibraryScreen.tsx` edit replaces the outer scroll container that this test queries; those Flow Library edits remain outside this Card guard commit. Card guard tests pass after the final copy and back-navigation updates, and root typecheck, format check, and module-boundary audit pass.
