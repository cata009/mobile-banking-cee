# Payments Templates and Exchange Rates Implementation Plan

> **For agentic workers:** Execute inline in this session. The repository's `design-system-ui` skill requires a single agent and targeted lookups, so no subagent workflow is permitted for this plan.

**Goal:** Add connected My Templates and Exchange Rates child views to the Payments hub using fictional demo data and the existing domestic-payment and FX authorities.

**Architecture:** `PaymentsScreen` owns local overview/templates/exchange-rates view state. Focused domain screens consume typed data helpers; `App` remains the authority that creates a payment draft and enters the global domestic-payment flow.

**Tech Stack:** React 18, TypeScript, Tailwind token utilities, Vitest, Testing Library.

## Global Constraints

- Use the `design-system-ui` decision ladder and do not change shared defaults.
- No dependency, backend, persistence, push, deployment, or live FX service.
- All user-facing copy uses `runtime.payments` translations.
- Test first and observe the expected failure before production changes.

---

### Task 1: Connected data contracts

**Files:**
- Create: `src/data/paymentTemplates.ts`
- Modify: `src/data/paymentFlow.ts`
- Modify: `src/data/exchangeRates.ts`
- Test: `tests/data/payment-shortcuts.test.ts`

**Interfaces:**
- Produces: `PaymentTemplateSelection`, `getPaymentTemplates(country)`, `getSavedBeneficiaries(country)`, `createTemplateDomesticPaymentDraft(selection, country, product)`, `getExchangeRateRows(amount, sourceCurrency)`.

- [x] Write tests proving fictional template data, template-versus-beneficiary draft prefill, and currency recalculation.
- [x] Run `npm test -- tests/data/payment-shortcuts.test.ts` and confirm failures are caused by missing contracts.
- [x] Implement the smallest typed helpers using the existing `createEmptyDomesticPaymentDraft` and `EUR_REFERENCE_RATES` authorities.
- [x] Re-run the focused data test and confirm green.

### Task 2: Templates screen

**Files:**
- Create: `src/app/screens/payments/PaymentTemplatesScreen.tsx`
- Test: `tests/screens/payment-shortcuts.test.tsx`

**Interfaces:**
- Consumes: `PaymentTemplateSelection`, `AccountSearchBar`, `SectionHeadingDivider`, `PageHeader`.
- Produces: `PaymentTemplatesScreen({ onBack, onSelect })`.

- [x] Write screen tests for rendering, cross-section search, empty search state, template selection, and beneficiary selection.
- [x] Run `npm test -- tests/screens/payment-shortcuts.test.tsx` and confirm the missing screen failure.
- [x] Implement semantic list rows and the screenshot-aligned two-section layout.
- [x] Re-run the focused screen test and confirm the Templates cases pass.

### Task 3: Exchange Rates screen

**Files:**
- Create: `src/app/screens/payments/ExchangeRatesScreen.tsx`
- Test: `tests/screens/payment-shortcuts.test.tsx`

**Interfaces:**
- Consumes: `getExchangeRateRows`, `BottomSheet`, `RadioButton`, `PrimaryButton`, `PageHeader`.
- Produces: `ExchangeRatesScreen({ onBack })`.

- [x] Add screen tests for the default source currency, amount recalculation, opening the chooser, draft radio selection, applying with `OK`, and closing without applying.
- [x] Run the focused screen test and confirm the expected missing component/behavior failures.
- [x] Implement the calculator, rate rows, and radio bottom sheet.
- [x] Re-run the focused screen test and confirm all Exchange Rates cases pass.

### Task 4: Payments/App wiring and registries

**Files:**
- Modify: `src/app/screens/payments/PaymentsScreen.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/translations/types.ts`
- Modify: `src/translations/shared.ts`
- Modify: `src/app/registry/componentRegistry.ts`
- Modify: `src/app/state/demoTypes.ts`
- Test: `tests/screens/payment-shortcuts.test.tsx`

**Interfaces:**
- `PaymentsScreen.onTemplateSelect?: (selection: PaymentTemplateSelection) => void` is optional and backward-compatible.
- Local child views return to Payments; selection enters the existing global domestic-payment route.

- [x] Add integration assertions that both existing shortcut labels open the correct view and that Back restores the Payments overview.
- [x] Run the focused test and confirm it fails on the still-unwired shortcuts.
- [x] Wire the callbacks, translations, and registry evidence without changing default shared component behavior.
- [x] Run focused data/screen tests, typecheck, and lint.

### Task 5: Verification and handoff

**Files:**
- Modify: `docs/handoff/current-session.md`
- Modify: `docs/handoff/next-tasks.md`
- Modify: `docs/handoff/banana-log.md`
- Modify: `docs/handoff/known-bananas.md`
- Modify: `docs/handoff/state-of-the-world.md`
- Modify: `docs/platform-capability-map/README.md`

- [x] Run `npm run verify` and record exact results and baseline-only notices.
- [x] Smoke-test both shortcuts at the 375px phone baseline, including search, prefill handoff, currency chooser, and recalculation.
- [x] Review TSX changes against React/accessibility best practices.
- [x] Update capability/handoff evidence, run Banana Loop and Constitutional Check, and leave the completed changes uncommitted unless the user explicitly requests a commit.
