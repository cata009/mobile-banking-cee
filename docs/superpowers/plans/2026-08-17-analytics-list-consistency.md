# Analytics List Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make analytics category lists and CTAs visually consistent with the homepage and remove the disabled next-period affordance.

**Architecture:** Keep all changes in the existing Evo analytics screen. Reuse the homepage CTA utility classes and the existing `AppIcon` chevron glyph; do not change analytics data or navigation state.

**Tech Stack:** React, TypeScript, Tailwind utility classes, Vitest, ESLint, Vite.

## Global Constraints

- Preserve existing analytics data, callbacks, labels, and accessibility names.
- Keep every category row a clickable button that opens its breakdown.
- Do not hide categories from the full analysis list; only the overview remains limited to its top categories.

---

### Task 1: Align category containers, CTA, and period navigation

**Files:**
- Modify: `src/app/screens/analytics/Evo2027AnalyticsScreen.tsx:93-116,299-390,1024-1085,650-704`
- Modify: `tests/screens/evo-2027-analytics.test.tsx`

**Interfaces:**
- Consumes: Existing `SpendingTopCategories`, `ExpenseBreakdownList`, and `ExpensePeriodNavigator` props and callbacks.
- Produces: Homepage-consistent CTA/container markup and conditional next-period control with unchanged behavior.

- [ ] **Step 1: Hide the next-period button when no next period exists**

  In `ExpensePeriodNavigator`, keep the previous arrow behavior unchanged. Render `IntervalArrowButton` for `direction="next"` only when `nextPeriod` is present; otherwise render a non-interactive `span` with the same `size-[32px]` and `shrink-0` classes so the month title does not jump horizontally.

- [ ] **Step 2: Put the overview category block in one white card**

  Keep the existing rounded white wrapper around the category rows, but move the investment note and “See all categories” CTA inside that wrapper. Add bottom spacing to the wrapper and remove the CTA’s full-width layout in favor of a centered, content-width button.

- [ ] **Step 3: Match the homepage CTA treatment**

  Give the “See all categories” button the same compact uppercase typography, action color, rounded hit target, spacing, focus ring, active state, and trailing `AppIcon name="chevron-link" size={16}` used by `App2027Activity`’s “See more transactions” button. Preserve `data-evo-analytics-see-all` and `onSeeAll`.

- [ ] **Step 4: Wrap the full analysis breakdown list in a white card**

  In `ExpenseBreakdownList`, keep `ExpenseSplitSelector` outside the card. Wrap the complete `rows.map(...)` list (including the empty state) in a rounded, overflow-hidden `bg-[var(--uc-surface)]` container with the existing dividers, ensuring every supplied row remains rendered.

- [ ] **Step 5: Add regression assertions**

  Extend `tests/screens/evo-2027-analytics.test.tsx` to assert that the overview CTA contains a `svg` chevron and that the latest-period overview has no button named `Show next monthly interval`. Keep the existing scope-order assertion.

- [ ] **Step 6: Run focused verification**

  ```powershell
  npm test -- --run tests/screens/evo-2027-analytics.test.tsx
  npx eslint src/app/screens/analytics/Evo2027AnalyticsScreen.tsx tests/screens/evo-2027-analytics.test.tsx
  npm run build
  ```

  Expected: all focused tests pass, ESLint exits 0, and Vite build exits 0.
