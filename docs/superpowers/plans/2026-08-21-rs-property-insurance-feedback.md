# RS Property Insurance Browser Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply all ten browser comments to the Serbian property-insurance prototype, including the insurance-sheet entry, step order, package carousel, policyholder/payment data, and success copy.

**Architecture:** Keep the existing deterministic Flow Library prototype and shared design-system atoms. Centralize changed labels and synthetic payment values in `demoData.ts`, update the flow map so the user-visible step order and back/forward paths agree, and keep the payment account selector behavior shared between policyholder preview and payment create preview.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, Testing Library, Tailwind utility classes.

**Spec:** User-provided browser comments 1–10 in the current task.

## Global Constraints

- Keep all changes scoped to `rs-property-insurance` and its existing Flow Library tests.
- Reuse existing `TextField`, `NavigationRow`, `ReviewRow`, `PrimaryButton`, and `StandardSuccessScreen` components.
- Keep synthetic demo data deterministic; use the exact requested values `160-468202-30` and `260`.
- Preserve the existing account picker interaction pattern from `PaymentCreatePreview`.
- Do not add a separate payment-method step; the payer account remains selectable where payment data is reviewed.

---

### Task 1: Lock the requested browser behavior in failing tests

**Files:**
- Modify: `tests/screens/rs-property-insurance.test.tsx`
- Inspect: `src/app/screens/flow-library/components/rsPropertyInsurancePreviews.tsx`
- Inspect: `src/app/screens/flow-library/flows/rsPropertyInsurance.ts`
- Inspect: `src/app/screens/flow-library/flows/demoData.ts`

**Interfaces:**
- Consumes: Existing `renderPrototype()` helper and Flow Library screen titles.
- Produces: Regression coverage for insurance-sheet content and navigation, centered carousel setup, reordered insured-property/policyholder screens, policyholder account option, phone formatting, payment labels/values, review rows, and minimal success content.

- [ ] **Step 1: Add focused assertions for the insurance sheet and entry navigation.**
  - Assert `Life insurance` appears immediately after `Property insurance`.
  - Click `Property insurance`, then assert the product-cover heading is rendered.
- [ ] **Step 2: Add focused assertions for the cover and carousel changes.**
  - Assert the cover screen no longer renders the `From` price block.
  - Assert the package carousel initializes with the middle card visible/active and retains a visible neighboring card through its scroll padding and gap markers.
- [ ] **Step 3: Add focused assertions for step order and policyholder data.**
  - Assert the main steps list places `Policyholder` before `Insured property`.
  - Assert the policyholder screen contains the account selector and the payer account option, and the insured-property screen follows it via `Continue`.
  - Assert the phone field shows a separate `+381` prefix affordance and a cleaner local-number value.
- [ ] **Step 4: Add focused assertions for payment and confirmation copy.**
  - Assert `Purpose code` renders with `260` in payment create and review.
  - Assert the Generali beneficiary account is `160-468202-30` in payment create and review.
  - Assert the success screen keeps the delivery paragraph but removes policy number, premium, cover period, and policy status rows.
- [ ] **Step 5: Run only the focused test file and confirm the new assertions fail for missing behavior.**

### Task 2: Update flow data and navigation contracts

**Files:**
- Modify: `src/app/screens/flow-library/flows/demoData.ts`
- Modify: `src/app/screens/flow-library/flows/rsPropertyInsurance.ts`

**Interfaces:**
- Consumes: Existing `FLOW_DEMO.rsPropertyInsurance` data shape and `FlowDefinition.steps` navigation map.
- Produces: Exact payment labels/values, updated policyholder copy, reordered primary steps, and consistent forward/back navigation.

- [ ] **Step 1: Change the payment demo values and labels.**
  - Set `payment.beneficiaryAccount` to `160-468202-30`.
  - Set `payment.paymentCode` to `260`.
  - Set `paymentScreens.paymentCodeLabel` to `Purpose code`.
- [ ] **Step 2: Update policyholder copy to describe account selection and the requested phone UX.**
  - Replace the email helper text with copy that introduces the account selector below it.
  - Add stable copy/labels for the `+381` prefix and local mobile number if the existing data contract needs them.
- [ ] **Step 3: Swap the main flow step entries for `Insured property` and `Policyholder`.**
  - Keep the IDs stable but place `policyholder` before `object` in the main steps list.
  - Change `rs-pi-duration-premium` to continue to `rs-pi-policyholder`.
  - Change policyholder forward/back targets to `rs-pi-insured-object` and duration premium respectively.
  - Change insured-property forward/back targets to review/policyholder consistently with the new order.
  - Update abandon-confirm continuation to return to the policyholder step.
- [ ] **Step 4: Run the focused tests and verify data/map failures now narrow to rendering details.**

### Task 3: Implement the preview UI changes

**Files:**
- Modify: `src/app/screens/flow-library/components/rsPropertyInsurancePreviews.tsx`

**Interfaces:**
- Consumes: Updated `RS.payment`, `RS.paymentScreens`, and flow navigation map.
- Produces: Insurance-sheet ordering and click behavior, centered carousel, policyholder account/phone UI, updated payment review, and trimmed success screen.

- [ ] **Step 1: Add the `Life insurance` row after `Property insurance` and keep it inert.**
  - Build the options array from the existing travel row, property row, and a life row in that order.
  - Keep only the property row connected to `nav.primary`.
- [ ] **Step 2: Remove the cover-page `From` price card.**
  - Delete the price block from `ProductCoverPreview` without removing the benefits, exclusions, or CTA.
- [ ] **Step 3: Center the package carousel on the middle card by default.**
  - Use `useEffect` after mount to scroll to `PACKAGE_CARD_STEP` once the carousel ref exists.
  - Set initial visible index to `1`, retain the existing 24px page gutters, and preserve 12px card gaps plus the trailing gutter.
  - Add a stable data attribute for the carousel's default centered state so the test checks behavior rather than pixel coordinates.
- [ ] **Step 4: Reorder the actual preview route behavior.**
  - Make `PolicyholderPreview` render before `InsuredObjectPreview` in the user path while leaving the switch cases stable.
  - Make the policyholder `Continue` navigate to insured property and the insured property `Continue` navigate to review through the flow map.
- [ ] **Step 5: Add the account selector to Policyholder using the payment account presentation.**
  - Add an account row after the email block with the same account number, account type, available balance, chevron, and activation behavior as payment create.
  - Show the payer account as the selected option and expose the Generali account number as the requested selectable option without changing the beneficiary semantics of the payment flow.
  - Keep the selector deterministic and accessible with a named button/field.
- [ ] **Step 6: Improve phone formatting.**
  - Render `+381` as a separate prefix element/field and use the local digits in the editable field.
  - Keep the existing validation state/error scenario intact.
- [ ] **Step 7: Update payment create/review and success rendering.**
  - Use the new `Purpose code` label/value and beneficiary account from `demoData.ts` automatically through existing bindings.
  - Remove the four summary rows from `PaymentSuccessPreview` and retain only the success body plus email-delivery paragraph.
- [ ] **Step 8: Run the focused tests and fix only implementation failures.**

### Task 4: Full verification

**Files:**
- Inspect: `tests/screens/rs-property-insurance.test.tsx`
- Inspect: `src/app/screens/flow-library/components/rsPropertyInsurancePreviews.tsx`
- Inspect: `src/app/screens/flow-library/flows/demoData.ts`
- Inspect: `src/app/screens/flow-library/flows/rsPropertyInsurance.ts`

- [ ] **Step 1: Run `npm test -- --run tests/screens/rs-property-insurance.test.tsx`.**
- [ ] **Step 2: Run `npm run typecheck`.**
- [ ] **Step 3: Run `npm run lint`.**
- [ ] **Step 4: Run `npm run build`.**
- [ ] **Step 5: Re-check `http://127.0.0.1:4004/` with an HTTP request and report the exact verification results.**

## Execution Results

All planned steps are complete. The focused flow suite passes with 48 tests, the full Vitest suite passes with 938 tests across 89 files, typecheck and lint pass, the production build passes, and the dev server on port 4004 responds with HTTP 200.

Follow-up polish completed: the payment-rejected screen was replaced by a separate pre-package balance-check state, Generali unavailability now has a friendly retry-later state, primary CTAs keep equal content padding, package cards share the tallest height, and all changes are covered by the expanded 48-test property-insurance suite.
