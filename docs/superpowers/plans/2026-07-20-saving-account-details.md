# Mobile PI Saving Account Details Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show only Account number, Account title, and Current balance on Mobile PI saving-account details while preserving other account types.

**Architecture:** Keep the shared `AccountDetailsInfoScreen` and branch only its field composition by `product.type`. Reuse all current formatting, translation, copy, header, and sharing behavior.

**Tech Stack:** React 18, TypeScript, Vitest, Testing Library, Vite.

## Global Constraints

- Do not add dependencies, routes, screens, or product capabilities.
- Apply globally to Mobile PI saving accounts for every supported country and language.
- Preserve all non-saving Account Details behavior.
- Preserve unrelated uncommitted workspace changes.

---

### Task 1: Lock the saving-account details contract

**Files:**
- Create: `tests/screens/account-details-info.test.tsx`
- Modify: `src/app/screens/accounts/AccountDetailsInfoScreen.tsx`
- Modify: `docs/platform-capability-map/README.md`

**Interfaces:**
- Consumes: `AccountDetailsInfoScreen({ selectedProductId, onBack })` and product type `saving_account`.
- Produces: a saving-account-specific three-field rendering contract without changing the component API.

- [x] **Step 1: Write the failing rendering test**

Render the real screen with controlled demo, language, and products hooks. Assert that the ordered `[data-account-details-info-field]` labels are `Account number`, `Account title`, and `Current balance`; assert removed copy and the connected-card section are absent. Render a current account and assert the existing extended fields remain.

- [x] **Step 2: Run the focused test and verify RED**

Run: `npm test -- tests/screens/account-details-info.test.tsx`

Expected: the saving-account case fails because the current screen still renders seven fields plus the `Show less` and `Connected cards` content.

- [x] **Step 3: Implement the minimal conditional composition**

In `AccountDetailsInfoScreen.tsx`, derive `const isSavingAccount = product.type === "saving_account"`. Keep Account number first. Render Account title immediately after it only for saving accounts, render Current balance third, and omit the remaining extended sections for saving accounts. For non-saving products, preserve the existing order and sections exactly.

- [x] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- tests/screens/account-details-info.test.tsx`

Expected: both saving and non-saving cases pass.

- [x] **Step 5: Record the behavior and verify the repository**

Update the three existing behavior/capability documents with files, decision, tests, limitations, and next action. Run `npm run verify`, then smoke-test the supplied Mobile PI Romania saving-account URL and inspect browser errors.

- [x] **Step 6: Leave changes uncommitted**

Do not stage or commit; report only the scoped files and fresh verification evidence.

### Task 2: Align balances, add term-deposit details, and rename the carousel page

**Files:**
- Create: `src/data/accountProductDetails.ts`
- Modify: `src/app/screens/accounts/AccountDetailsInfoScreen.tsx`
- Modify: `src/app/screens/accounts/AccountDetailScreen.tsx`
- Modify: `src/translations/types.ts`
- Modify: `src/translations/shared.ts`
- Modify: `tests/screens/account-details-info.test.tsx`
- Modify: `docs/platform-capability-map/README.md`

**Interfaces:**
- Consumes: the selected `Product`, country formatting, amount privacy, and the first current-account number.
- Produces: `getTermDepositDetails(product, currentAccountNumber)` and `getTermDepositMaturityAmount(product)` plus three product-aware Account Details compositions.

- [x] **Step 1: Extend the focused test before production changes**

Assert that savings Current balance equals the carousel balance, the account-carousel headings say `My Products`, and term deposits expose the exact 13 labels in the supplied order while generic account rows/sections are absent.

- [x] **Step 2: Run the focused test and verify RED**

Run: `npm test -- tests/screens/account-details-info.test.tsx`

Expected: failures show the old discounted savings balance, `Accounts` page title, and generic seven-field term-deposit composition.

- [x] **Step 3: Implement the detail model and product-aware compositions**

Add deterministic 12-month term-deposit mock details with 3.50% annual interest. Use the shared maturity calculation on the carousel card and Details page. Add translation keys for `My Products` and all term-deposit labels, then render savings, term deposit, and generic field groups separately.

- [x] **Step 4: Run focused and full verification**

Run `npm test -- tests/screens/account-details-info.test.tsx`, then `npm run verify`. Expected: all focused and repository checks pass with only documented baseline warnings.

- [x] **Step 5: Update evidence and browser-smoke both affected products**

Record the finalized behavior in handoff/capability docs. In the in-app browser, verify `My Products`, savings balance equality, the exact term-deposit row order, and an empty warning/error log. Leave changes uncommitted.
