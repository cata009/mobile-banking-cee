# PFM Transaction Recategorization Implementation Plan

**Goal:** Add the production-derived PFM category picker and connect a chosen subcategory to the transaction list and Transaction Details.

**Architecture:** Keep the complete category hierarchy in `pfmCategories.ts`, render it through one reusable domain bottom sheet, and keep demo-session overrides at the existing App coordinator. Extend shared components only with optional props whose defaults preserve current consumers.

**Tech Stack:** React 18, TypeScript, Radix accordion primitives, Tailwind utilities, Vitest, Testing Library.

## Global Constraints

- Preserve all existing `BottomSheet` and `AccountTransactionRow` renderings unless their new optional props are supplied.
- Use the exact ordered 18-group / 103-subcategory taxonomy captured in `To do/PFM categs/`.
- All groups are collapsed when the sheet opens.
- No backend or durable persistence capability is implied.
- Do not create a Git commit without an explicit user request.

---

### Task 1: Lock the taxonomy

**Files:**
- Modify: `tests/data/account-pfm.test.ts`
- Modify: `src/data/pfmCategories.ts`

- [ ] Add failing assertions for exact group order, exact subcategory counts, the total of 103, uniqueness, and canonical/icon mappings.
- [ ] Run `npm test -- tests/data/account-pfm.test.ts` and confirm RED because the group registry is absent.
- [ ] Add typed group and selection definitions plus the complete production registry.
- [ ] Re-run the focused test and confirm GREEN.

### Task 2: Build the reusable category sheet

**Files:**
- Create: `tests/components/pfm-category-change-sheet.test.tsx`
- Create: `src/app/components/pfm/PfmCategoryChangeSheet.tsx`
- Modify: `src/app/components/BottomSheet.tsx`
- Modify: `src/translations/shared.ts`

- [ ] Add failing interaction tests for the collapsed initial state, multiple expansion, search, unique selection, unchanged disabled state, confirm payload, and close-without-save.
- [ ] Run the component test and confirm RED because the sheet is absent.
- [ ] Extend `BottomSheet` with opt-in production-sheet chrome.
- [ ] Compose the sheet from `BottomSheet`, `AccountSearchBar`, `PfmCategoryIcon`, accordion primitives, `AppIcon`, and `PrimaryButton`.
- [ ] Re-run the component test and shared primitive tests and confirm GREEN.

### Task 3: Connect account rows and Transaction Details

**Files:**
- Create: `tests/screens/pfm-transaction-recategorization.test.tsx`
- Modify: `src/app/components/accounts/AccountTransactionRow.tsx`
- Modify: `src/app/screens/accounts/AccountDetailScreen.tsx`
- Modify: `src/app/screens/payments/DomesticPaymentFlowScreens.tsx`
- Modify: `src/app/App.tsx`

- [ ] Add failing tests proving the icon opens the picker without invoking row navigation, the rest of the row still navigates, and Transaction Details exposes the same picker.
- [ ] Run the screen test and confirm RED on the missing interaction.
- [ ] Add the optional icon callback and wire the reusable sheet into both screens.
- [ ] Add App-owned session overrides and keep the selected Transaction Details model synchronized.
- [ ] Re-run focused tests and confirm GREEN.

### Task 4: Register, document, and verify

**Files:**
- Modify: `src/app/state/demoTypes.ts`
- Modify: `src/app/registry/componentRegistry.ts`
- Modify: `docs/platform-capability-map/README.md`

- [ ] Register the reusable PFM category sheet and its screen usage.
- [ ] Run `npm run verify` and resolve only regressions caused by this work.
- [ ] Smoke the list-icon and Transaction Details flows at the 375 px baseline and inspect browser warnings/errors.
- [ ] Record changed files, tests, limitations, and next action in the handoff/capability documents.
