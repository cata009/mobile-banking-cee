# RO Contract Withdrawal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing Romania-only Contract withdrawal card open a complete Figma-aligned demo journey.

**Architecture:** Keep the journey inside the current More screen overlay and keep branch/validation behavior in a plain feature model. Native presentation composes existing DS components. The final PIN and request receipt are local demo behavior because no bank submission API exists in this checkout.

**Tech Stack:** TypeScript, React, React Native Web, Vitest, Jest.

**Spec:** `docs/superpowers/specs/2026-11-03-ro-contract-withdrawal-design.md`

## Global Constraints

- Only `RO` exposes and enters the flow.
- Preserve the existing More card artwork and all current country navigation.
- Use existing Native DS components and the local Figma source photo; remove all temporary Figma URLs from runtime code.
- Validate required fields and consent, but do not decide legal eligibility from the contract date alone.
- The request submission is simulated locally; no bank service is called.
- Preserve all pre-existing worktree edits and never stage/commit unrelated files.
- Do not trigger a deployment; the user asked to batch changes instead of deploying each update.

## Review Focus

1. RO route gate: clicking the card opens the intro only in RO; non-RO screens retain their current behavior.
2. Branch integrity: UCB single, UCB package, and UCFIN selections land on the correct detail form and keep the selected source/product in review.
3. Required input: product/date/channel/email are validated; optional reference may be blank; Back retains form values.
4. Consent/PDF order: request review requires the declaration, document acceptance is retained, and the final review must precede PIN.
5. Demo boundary: six-digit PIN produces a local receipt only, without a network submission or fabricated eligibility decision.

---

### Task 1: Withdrawal flow state model

**Files:**
- Create: `src/features/contract-withdrawal/model.ts`
- Test: `tests/features/contract-withdrawal-model.test.ts`

**Interfaces:**
- `ContractWithdrawalState` stores branch selection, product details, contact data, declaration/PDF acceptance, PIN, and current step.
- `contractWithdrawalReducer(state, action)` handles form updates, branch transitions, Back, PDF acceptance, and local sign completion.
- `canContinueContractWithdrawal(state)` validates the active step; `isContractWithdrawalAvailable(country)` returns true only for `RO`.

- [x] Write tests for the RO gate, all three branch paths, required/optional fields, Back, consent/PDF order, and six-digit demo PIN.
- [x] Run the focused model tests and confirm they fail before implementation.
- [x] Implement the pure model and keep legal eligibility out of client validation.
- [x] Run the focused model tests.

### Task 2: RO More entry and intro

**Files:**
- Modify: `native-spike/src/experiences/pi/current/baseline/more/More.tsx`
- Create: `native-spike/src/experiences/pi/current/baseline/more/ContractWithdrawalFlow.tsx`
- Create: `src/assets/pi/ro/contract-withdrawal/intro.png`
- Modify: `native-spike/__tests__/ro-baseline-more-main.test.tsx`

**Interfaces:**
- `ContractWithdrawalFlow` receives `CurrentScreenProps`, an exit callback, and a back-handler registration callback; it starts at the Figma intro sheet.
- More opens it only for the existing `my-requests` card in `RO` and hides primary navigation while the flow is active.

- [x] Add a More test proving the RO card opens the intro and the flow is unavailable outside RO.
- [x] Run the focused More test and confirm it fails before implementation.
- [x] Download the original `image 126` asset from the Figma source and record its Figma node provenance.
- [x] Wire the local overlay and match the intro content, close, and start action using existing DS components.
- [x] Run the focused More/intro tests.

### Task 3: Provider and product branches

**Files:**
- Modify: `native-spike/src/experiences/pi/current/baseline/more/ContractWithdrawalFlow.tsx`
- Test: `native-spike/__tests__/ro-baseline-more-main.test.tsx`

**Interfaces:**
- UCB branches to Single product or Package; Single product opens the UCB product list; Package opens package details.
- UCFIN opens its Credit card, Cash loan, or Credit life insurance list.

- [x] Add tests for each source/kind/product branch and Back navigation.
- [x] Run the focused flow tests and confirm they fail on the intro-only implementation.
- [x] Compose branch screens from `BaselinePageHeader`, `BaselineSectionDivider`, `BaselineNavigationRow`, and `BaselineDropdownField`.
- [x] Run the focused flow tests.

### Task 4: Details, contact, review, PDF, sign and receipt

**Files:**
- Modify: `native-spike/src/experiences/pi/current/baseline/more/ContractWithdrawalFlow.tsx`
- Modify: `native-spike/src/universal/DateField.tsx` (optional backwards-compatible dot separator)
- Modify: `src/translations/types.ts`, `src/translations/shared.ts`
- Create: `src/translations/contractWithdrawal.ts`
- Test: `native-spike/__tests__/universal-date-field.test.tsx`
- Test: `tests/features/contract-withdrawal-model.test.ts`
- Test: `native-spike/__tests__/ro-baseline-more-main.test.tsx`

**Interfaces:**
- Detail forms use `BaselineTextField`, `BaselineDropdownField`, and `DateField`; contact and review use the same selected data.
- Product identifiers use RO mock banking products where available and deterministic demo choices for package/UCFIN cases.
- The card detail branch shows the Figma card-information banner.
- The PDF step is a document placeholder; agreement returns to final review; PIN is a six-digit local demo input; success exits to More.

- [x] Add tests for detail validation, optional reference, contact validation, review contents, declaration/PDF/sign ordering, and successful receipt.
- [x] Implement the screens with existing Native DS components and localized flow copy.
- [x] Keep the request local and avoid a date-only legal entitlement check.
- [x] Run focused root and Native tests.

## Final verification

- [x] Run affected root and Native tests.
- [x] Run `npm.cmd run audit:modules`.
- [x] Run the integration-owner `npm.cmd run verify` on the combined checkout; it reached coverage and reported three failures outside this flow.
- [x] Review the exact owned delta against `.codex-temp/ro-contract-withdrawal/ownership-before.json`; do not deploy or commit unrelated changes.
