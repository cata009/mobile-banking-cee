# PFM Spending Category Details Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a connected, production-reference-derived drill-down for every Money Out and Money In PFM category and unify it with session recategorization.

**Architecture:** Keep the analytics route and timeline as the coordinator. Extend the pure analytics data layer with override-aware collection and a category-detail selector, then render a dedicated domain screen using existing banking components plus one new proportional bubble chart.

**Tech Stack:** React 18, TypeScript, Tailwind v4 token utilities, Vitest, Testing Library.

## Global Constraints

- Reuse existing Design System components and `--uc-*` tokens before creating anything new.
- All new visible copy must use `runtime.analytics` translation keys.
- No new dependency, backend call, persistence layer, ledger mutation, or route family.
- Recategorization remains session-local but must immediately affect Spending calculations.
- Preserve all existing Analytics overview behavior and navigation.

---

### Task 1: Connected analytics detail model

**Files:**
- Modify: `src/data/spendingAnalytics.ts`
- Test: `tests/data/spending-analytics.test.ts`

**Interfaces:**
- Consumes: `PfmCategorySelection`, `SpendingAnalyticsSummary`, `AccountTransaction`.
- Produces: `SpendingSubcategorySummary`, `SpendingCategoryDetail`, `createSpendingCategoryDetail(summary, category, direction)`, and optional overrides on `createSpendingAnalyticsTimeline` / `createSpendingAnalytics`.

- [x] Write tests proving an override moves a transaction between category totals and detail selectors reconcile totals and subcategories.
- [x] Run `npm test -- tests/data/spending-analytics.test.ts` and confirm the new assertions fail for missing exports/behavior.
- [x] Apply overrides while collecting transactions and implement category-detail aggregation with deterministic sort order.
- [x] Re-run the focused data test and confirm it passes.

### Task 2: Category-details UI

**Files:**
- Create: `src/app/components/pfm/PfmCategoryBubbleChart.tsx`
- Create: `src/app/screens/analytics/PfmCategoryDetailScreen.tsx`
- Modify: `src/translations/types.ts`
- Modify: `src/translations/shared.ts`
- Test: `tests/screens/pfm-spending-category-details.test.tsx`

**Interfaces:**
- Consumes: analytics timeline, selected category/direction/period, `onBack`, `onPeriodChange`, and `onTransactionClick`.
- Produces: full-height detail surface with bubbles, action, divider, transaction rows, and Uncategorized helper.

- [x] Write screen tests for title/total/bubbles, income detail, transaction callback, back, and dismissible Uncategorized helper.
- [x] Run the new screen test and confirm it fails because the detail component does not exist.
- [x] Implement the token-based bubble chart and compose the detail screen from shared PageHeader/action/divider/row/helper components.
- [x] Add typed shared translations for new copy and run the screen tests to green.

### Task 3: Analytics integration

**Files:**
- Modify: `src/app/screens/analytics/AnalyticsScreen.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/app/registry/componentRegistry.ts`
- Modify: `src/app/state/demoTypes.ts`
- Test: `tests/screens/pfm-spending-category-details.test.tsx`

**Interfaces:**
- Consumes: `transactionCategoryOverrides` and `onTransactionClick` from App.
- Produces: semantic category buttons that switch between overview and detail while preserving selected period.

- [x] Add integration tests proving Money Out/Money In rows open the correct direction and a detail row opens Transaction Details.
- [x] Run the focused test and confirm it fails on the non-interactive category rows.
- [x] Add optional Analytics props, detail state, callbacks, and component registry/type entries.
- [x] Run focused data/screen tests, typecheck, and lint to green.

### Task 4: Production bubble feedback

**Files:**
- Modify: `src/app/components/pfm/PfmCategoryBubbleChart.tsx`
- Modify: `src/app/screens/analytics/PfmCategoryDetailScreen.tsx`
- Modify: `src/data/spendingAnalytics.ts`
- Test: focused data/screen suites

- [x] Reproduce the overlapping/cropped Financial bubbles and missing tap behavior.
- [x] Replace absolute geometry with bounded proportional wrapping.
- [x] Make bubbles semantic exclusion buttons and recalculate the detail selector from remaining subcategories.
- [x] Prove Shopping exclusion changes `599,21 RON` to `208,99 RON` and removes the matching transaction.

### Task 5: Verification, documentation, and unified commit

**Files:**
- Modify: `docs/platform-capability-map/README.md`
- Include: `To do/**/*.jpeg` (nine PFM implementation references plus four Payments reference-only captures)

**Interfaces:**
- Produces: verified handoff evidence, triaged limitations, and one clean unifying commit.

- [x] Review changed TSX files against React/a11y best practices and fix only task-related issues.
- [x] Run `npm run verify` and `git diff --check`; record exact outcomes.
- [x] Smoke the full Money Out -> detail -> transaction and Money In -> detail flows at 375px, checking browser logs.
- [x] Stage every intended source, test, doc, skill/reference capture change; inspect the staged diff; commit with a scoped message; confirm `git status --short` is empty.
