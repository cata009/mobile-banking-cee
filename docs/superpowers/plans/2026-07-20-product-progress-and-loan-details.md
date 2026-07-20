# Mobile PI Product Progress and Loan Details Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect Term Deposit, Personal Loan, and Mortgage progress cards to the authoritative detail data and add the requested loan/mortgage Account Details fields.

**Architecture:** Extend the focused `accountProductDetails` model with deterministic date and repayment calculations. Pass its outputs through the existing account carousel into an optional reusable progressbar and branch Account Details into saving, term-deposit, loan/mortgage, and generic compositions.

**Tech Stack:** React, TypeScript, Tailwind utilities, Vitest, Testing Library

## Global Constraints

- Keep behavior global for Mobile PI through product-type branching.
- Do not add dependencies, routes, backend behavior, or persistence.
- Preserve all non-target account/card behavior.
- Follow the supplied field order and production screenshots.
- Leave changes uncommitted unless the user explicitly requests a commit.

---

### Task 1: Connected product-detail model

**Files:**
- Modify: `src/data/accountProductDetails.ts`
- Create: `tests/data/account-product-details.test.ts`

**Interfaces:**
- Produces: `getTermDepositDetails(product, currentAccountNumber)` with `progress`.
- Produces: `getLoanDetails(product)` for `Loan | Mortgage` with card and Details values.
- Produces: `calculateProgress(completed, total)` with clamped output.

- [x] **Step 1: Write failing data tests**

Assert the term-deposit elapsed-time ratio, clamping at both boundaries, Personal Loan repayment progress, Mortgage repayment progress, and the identity `ownedAmount + paidAmount = originalAmount`.

- [x] **Step 2: Verify RED**

Run `npm test -- tests/data/account-product-details.test.ts`. Expected: fail because the new exports/properties do not exist.

- [x] **Step 3: Implement the minimal model**

Use ISO date-only values parsed through `parseIsoDateOnly`, round currency to two decimals, and return display-ready dates/rates plus numeric amounts/progress.

- [x] **Step 4: Verify GREEN**

Run `npm test -- tests/data/account-product-details.test.ts`. Expected: all model tests pass.

### Task 2: Progress cards and product-specific Details

**Files:**
- Modify: `src/app/components/accounts/AccountBalanceCard.tsx`
- Modify: `src/app/screens/accounts/AccountDetailScreen.tsx`
- Modify: `src/app/screens/accounts/AccountDetailsInfoScreen.tsx`
- Modify: `src/translations/types.ts`
- Modify: `src/translations/shared.ts`
- Modify: `tests/screens/account-details-info.test.tsx`

**Interfaces:**
- Consumes: `getTermDepositDetails(product, currentAccountNumber)` and `getLoanDetails(product)`.
- Produces: optional `progress` and `progressLabel` props on `AccountBalanceCard`.

- [x] **Step 1: Write failing screen tests**

Assert three accessible progressbars, Term Deposit maturity-date identity, exact Personal Loan and Mortgage field order, absence of generic rows, and equal card/detail next-installment and remaining/owned amounts.

- [x] **Step 2: Verify RED**

Run `npm test -- tests/screens/account-details-info.test.tsx`. Expected: fail because progressbars and loan-specific details are missing.

- [x] **Step 3: Implement the card and detail compositions**

Render the progress track only for target products, use the model for all target amounts/dates, and render the 12 named loan fields in order.

- [x] **Step 4: Verify GREEN**

Run `npm test -- tests/data/account-product-details.test.ts tests/screens/account-details-info.test.tsx`. Expected: both suites pass.

### Task 3: Repository and browser verification

**Files:**
- Modify: `docs/handoff/current-session.md`
- Modify: `docs/handoff/state-of-the-world.md`
- Modify: `docs/platform-capability-map/README.md`

**Interfaces:**
- Consumes: completed behavior from Tasks 1-2.
- Produces: current handoff and capability evidence.

- [x] **Step 1: Run full verification**

Run `npm run verify`. Expected: typecheck, lint, all tests, audits, and build pass with only documented baseline warnings.

- [x] **Step 2: Browser-smoke all three target products**

Verify Term Deposit maturity date/progress, Personal Loan and Mortgage repayment progress, exact Details fields, connected values, and empty warning/error logs.

- [x] **Step 3: Record evidence**

Update handoff and capability documents with files, decisions, commands, results, mock limitations, and safe-to-resume status.
