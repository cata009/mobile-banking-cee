# PI Romania Baseline Payments Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the screenshot-referenced PI Romania payment flows and keep the selected account stable and aligned through account detail navigation.

**Architecture:** Extend the existing Native PI current-baseline Payments hub with local Romanian form views. Keep form policy and demo-provider data in a Romanian payments feature model, save recurring entries through the existing recurrent-payment data store, and reuse Native account/date/amount controls plus the existing sign/success screens. Preserve the Domestic Payment route and gate shared navigation behavior to the requested RO baseline.

**Tech Stack:** React Native/Web, TypeScript, existing Native design-system primitives, Jest tests in `native-spike`, and Vitest tests in `tests`.

**Spec:** `docs/superpowers/specs/2026-11-12-pi-ro-payments-completion-design.md`

## Global Constraints

- PI Romania current baseline only; do not change CZ Evo, RS, BA, or other country/release behavior.
- Preserve the existing Domestic Payment route and the current Native sign/success flow.
- Use approved executable Native controls and tokens; do not use screenshot/flattened UI or add assets/dependencies.
- Keep validation and payment calculations in `src/features`; keep provider and saved-record data in the data/feature boundary.
- Demo forms do not call a real banking API or execute real transfers.
- Sweeping mode means Amount is the minimum balance retained; transfer only the surplus above it.
- Currency Exchange displays the screenshot's demo quote `1 EUR = 5.4200 RON`.
- The existing uncommitted `Account.tsx` mCash change is preserved and refined to keep its hidden action slot.

## Review Focus

- Selecting a different account by mouse drag and then opening Details/Options must keep that selected product after Back; test the last carousel item, not only the first two.
- Hiding mCash on a Romanian loan must keep the four action slots and leave Details in the same position; test the hidden item and the rendered action bar.
- Foreign Payment address modes must preserve entered data while changing between unstructured, hybrid, and structured fields; test each mode and switching back.
- Own-account transfer must reject different-currency account pairs while Currency Exchange requires different currencies and uses the selected quote; test both boundaries.
- Direct Debit requires agreement and valid provider data; Standing Order sweeping mode treats Amount as a retained-balance floor and saves the resulting recurring entry; test the consent and threshold boundaries.

---

### Task 1: Preserve the selected Romanian account across Details and Back

**Files:**
- Modify: `native-spike/src/experiences/pi/current/baseline/Account.tsx`
- Modify: `native-spike/src/experiences/pi/current/NativeCurrentApp.tsx`
- Test: `native-spike/__tests__/ro-baseline-account-details.test.tsx`
- Test: `native-spike/__tests__/parity-navigation.test.tsx`

**Interfaces:**
- `Account.tsx` passes the currently displayed `product.id` to Romanian Details/Options while preserving the existing route-owner behavior for other countries.
- When a Romanian current-baseline account route opens `account-info` or `account-options`, `NativeCurrentApp` carries that selected `productId` into the parent account route so Back restores it.

- [ ] **Step 1: Write the failing route round-trip test**
  - Add `returns to the last carousel-selected Romanian product after Details and Back` to `ro-baseline-account-details.test.tsx`; select product 6, open Details, press Back, and assert the active card is product 6.
  - Add `carries the selected current account into Options` to the same file; start on `acc-1`, select `acc-2`, and assert `onNavigate` receives `acc-2`.
  - Update the controller-level parity navigation assertion to expect `acc-2` after Back.
- [ ] **Step 2: Run the focused tests and verify the expected failure**
  - Run: `npm --prefix native-spike test -- --runInBand --testNamePattern="options uses the selected current account|actual controller retains the selected account|last carousel product remains selected|Source RO info and Back retain" __tests__/ro-baseline-account-details.test.tsx __tests__/parity-navigation.test.tsx`
  - Expected: controller tests return to the route's initial product instead of the selected product; the Options test navigates to the route owner instead of `acc-2`.
- [ ] **Step 3: Implement the smallest RO-scoped route carry**
  - Use the selected card's `product.id` for Options.
  - Update the parent account route only for RO current-baseline transitions to account info/options.
  - Preserve classic route behavior for all other countries and releases.
- [ ] **Step 4: Run the focused tests and verify they pass**
  - Run the Step 2 command.
  - Expected: all five selected-product route tests pass; existing non-RO route behavior remains unchanged.

### Task 2: Keep the Details action aligned when loan actions are hidden

**Files:**
- Modify: `native-spike/src/experiences/pi/current/baseline/Account.tsx`
- Test: `native-spike/__tests__/ro-baseline-account-details.test.tsx`

**Interfaces:**
- A Romanian loan keeps the existing mCash/reimbursement action in the four-slot action array with `hidden: true`; the action bar retains its grid position.

- [ ] **Step 1: Write the failing action-slot test**
  - Add `hides Romanian loan reimbursement without moving the Details action slot` to `ro-baseline-account-details.test.tsx`.
  - Assert the loan action array still has four items, `Details` remains item 0, and `mCash` has `hidden: true` while preserving its label.
- [ ] **Step 2: Run the focused test and verify it fails**
  - Run: `npm --prefix native-spike test -- --runInBand --testNamePattern="hides Romanian loan reimbursement|deposit suppresses ledger and copy" __tests__/ro-baseline-account-details.test.tsx`
  - Expected: the pending filter removes mCash from the array and the test observes only three slots.
- [ ] **Step 3: Preserve the action while marking it hidden**
  - Replace the list filter with a `hidden` condition on the RO loan action.
  - Keep accessibility disabled/hidden behavior from `BaselineAccountActionBar`.
- [ ] **Step 4: Run the focused account test and verify it passes**
  - Run the Step 2 command.
  - Expected: mCash is not visible or actionable, and Details retains its first-slot position.

### Task 3: Add the PI Romania payment form feature model and recurring-record access

**Files:**
- Modify: `src/features/accounts-payments/currentPaymentPolicy.ts`
- Modify: `src/data/paymentsHub.ts`
- Test: `tests/features/ro-baseline-payment-forms.test.ts`
- Test: `tests/data/ro-baseline-recurrent-payments.test.ts`

**Interfaces:**
- `RoBaselinePaymentKind` covers `foreign-payment`, `currency-exchange`, `treasury-payment`, `own-account-transfer`, `standing-order`, and `direct-debit`.
- `currentPaymentPolicy.ts` owns typed draft creation, validation, currency/address/sweeping policies, review rows, and recurring-record conversion for these current PI flows.
- The data module exposes only locally created recurring records for the Romanian baseline Direct Debit list while preserving existing seeded Source/Recurrent Payment queries.
- Exact feature API: `createRoBaselinePaymentDraft(kind, accounts, { today, providerId? }) -> RoBaselinePaymentDraft`; `isRoBaselinePaymentDraftValid(draft, accounts) -> boolean`; `setRoBaselineAddressMode(draft, mode) -> RoBaselinePaymentDraft`; `getRoBaselineExchangeRate(fromCurrency, toCurrency) -> number | null`; `calculateRoBaselineSweepTransfer(balance, retainedFloor) -> number`; `getRoBaselinePaymentReviewRows(draft, accounts) -> readonly [label, value][]`; `toRoBaselineRecurrentPayment(draft, accounts) -> RecurrentPayment | null`; and `getCreatedRecurrentPayments(country, kind) -> RecurrentPayment[]`.

- [ ] **Step 1: Write failing feature-model tests**
  - Add tests named `creates screenshot-shaped RO drafts from the selected accounts`, `requires a positive amount and beneficiary for beneficiary payments`, `preserves address parts when address mode changes`, `requires different currencies for Currency Exchange`, and `rejects a cross-currency own-account transfer`.
  - Add `treats sweeping amount as the retained balance floor` and assert transferable surplus is `max(balance - floor, 0)`.
  - Add `requires Direct Debit terms consent and builds a local recurring record`.
- [ ] **Step 2: Run the focused Vitest files and verify expected failures**
  - Run: `npm test -- tests/features/ro-baseline-payment-forms.test.ts tests/data/ro-baseline-recurrent-payments.test.ts`
  - Expected: new feature functions/accessor do not exist yet.
- [ ] **Step 3: Implement the typed RO feature policy and created-record accessor**
  - Extend the existing feature-owned `currentPaymentPolicy.ts` and use account/currency data already available from `bankingProducts` and the payment data layer.
  - Keep default Direct Debit data empty for the baseline list; append entries only after successful local demo signing.
- [ ] **Step 4: Run the focused feature/data tests and verify they pass**
  - Run the same command.
  - Expected: all validation, quote, recurrence, and persistence expectations pass.

### Task 4: Wire the PI Romania Payments hub and shared form flow

**Files:**
- Modify: `native-spike/src/experiences/pi/current/baseline/payments/hub/Payments.tsx`
- Create/modify: `native-spike/src/experiences/pi/current/baseline/payments/forms/**`
- Test: `native-spike/__tests__/ro-baseline-payments-hub.test.tsx`
- Test: `native-spike/__tests__/ro-baseline-payment-forms.test.tsx`

**Interfaces:**
- The hub chooses a typed form kind and owns transitions between overview, Direct Debit list, provider picker, and the selected form.
- `RoBaselinePaymentFormFlow` receives `host`, a `RoBaselinePaymentKind`, optional provider data, and `onBack`/`onComplete` callbacks.
- New forms use the existing Native sign/success components and return locally to the hub without changing other route registrations.

- [ ] **Step 1: Write failing hub-routing tests**
  - Add `routes each Romanian payment entry to its matching form kind` and assert Currency Exchange, Foreign, Treasury, own-account, and Standing Order entries select the expected kind.
  - Add `keeps Domestic Payment on payment-create` and assert it still calls `host.onNavigate({screen:'payment-create'})`.
  - Add `opens Direct Debit list, providers, and a selected provider form in order`; assert the initial list is empty and Back returns to the previous view.
- [ ] **Step 2: Run the focused hub tests and verify they fail**
  - Run: `npm --prefix native-spike test -- --runInBand __tests__/ro-baseline-payments-hub.test.tsx __tests__/ro-baseline-payment-forms.test.tsx`
  - Expected: selected non-domestic actions do not navigate or show the requested view.
- [ ] **Step 3: Add the local hub/form coordinator and reuse approved primitives**
  - Keep Domestic Payment on its existing route.
  - Register one Back handler at a time for the active hub view or form.
  - Hide primary navigation while a full-screen form or picker is active.
- [ ] **Step 4: Run the focused hub tests and verify they pass**
  - Run the same command.
  - Expected: each requested entry point opens the correct PI Romania view and preserves Back behavior.

### Task 5: Implement Foreign Payment, Currency Exchange, Treasury Payment, and own-account transfer

**Files:**
- Create/modify: `native-spike/src/experiences/pi/current/baseline/payments/forms/**`
- Modify: `native-spike/__tests__/ro-baseline-payment-forms.test.tsx`

- [ ] **Step 1: Add failing tests for Foreign Payment**
  - Add `foreign payment collects beneficiary, address mode, amount, currency and date`; assert all three address modes render their matching fields and preserve values after switching.
  - Add `foreign payment moves from a valid draft through review, sign and success`; assert invalid required fields keep Next disabled.
- [ ] **Step 2: Run the Foreign Payment tests and verify expected failures**
  - Run: `npm --prefix native-spike test -- --runInBand __tests__/ro-baseline-payment-forms.test.tsx`
  - Expected: the form kind renders no fields or cannot advance.
- [ ] **Step 3: Implement the Foreign Payment form with the feature policy**
  - Use `BaselineTextField`, `BaselineAmountField`, `DateField`, `AccountSelectionSheet`, and an accessible address-mode sheet.
- [ ] **Step 4: Add failing tests for Currency Exchange, Treasury Payment, and own-account transfer**
  - Add `currency exchange displays the RO 5.4200 quote for the selected account pair` and assert the date and details remain editable.
  - Add `treasury payment toggles urgent and expands optional fiscal/payment references`.
  - Add `own-account transfer defaults Instant Payment on and only offers same-currency destinations`.
  - Assert each valid draft advances through Review → Sign → Success and each invalid draft keeps Next disabled.
- [ ] **Step 5: Run the tests and verify expected failures**
  - Run the same focused Native payment form test.
- [ ] **Step 6: Implement the three forms using the model and shared Native controls**
  - Keep form-specific validation and review values in the feature model.
- [ ] **Step 7: Run the focused form tests and verify they pass**
  - Run: `npm --prefix native-spike test -- --runInBand __tests__/ro-baseline-payment-forms.test.tsx`

### Task 6: Implement Standing Order and Direct Debit end-to-end

**Files:**
- Create/modify: `native-spike/src/experiences/pi/current/baseline/payments/forms/**`
- Modify: `src/data/paymentsHub.ts`
- Modify: `native-spike/__tests__/ro-baseline-payment-forms.test.tsx`
- Test: `tests/data/ro-baseline-recurrent-payments.test.ts`

- [ ] **Step 1: Add failing Standing Order tests**
  - Add `standing order defaults Monthly and accepts an optional end date`; assert the source and beneficiary values remain in the draft.
  - Add `sweeping Standing Order retains the entered balance floor and saves locally`; assert only the surplus is shown in Review and the saved record reappears after reopening the list.
- [ ] **Step 2: Add failing Direct Debit tests**
  - Add `provider search filters the grouped Romanian Direct Debit list` and assert selecting Orange fills the account, address, and fiscal code from the provided reference.
  - Add `Direct Debit requires terms, signs, and appears in the list after return`; test No Limit/custom limit and start date.
- [ ] **Step 3: Run the focused tests and verify expected failures**
  - Run: `npm --prefix native-spike test -- --runInBand __tests__/ro-baseline-payment-forms.test.tsx __tests__/ro-baseline-payments-hub.test.tsx`
  - Run: `npm test -- tests/data/ro-baseline-recurrent-payments.test.ts`
- [ ] **Step 4: Implement the recurring flows and local save callbacks**
  - Use the exact Orange Romania provider data shown in the reference and keep all other biller entries as demo data.
  - After signing, create local Standing Order/Direct Debit records; never call a real payment API.
- [ ] **Step 5: Run the focused tests and verify they pass**
  - Run the same Native and data tests.

### Task 7: Combined verification and review

**Files:**
- Review all task deltas; do not modify unrelated or pre-existing files.

- [ ] Run affected Native tests and affected feature/data tests after all editors finish.
- [ ] Run `npm run audit:modules`.
- [ ] Run `npm run agent:scope -- --task .agent-task.json` and confirm all changed paths are owned.
- [ ] Run `npm run verify` once on the combined final state; report the complete output, including any unrelated pre-existing failures, without weakening gates.
- [ ] Re-read the final diff and confirm the initial `Account.tsx` mCash change is preserved.
