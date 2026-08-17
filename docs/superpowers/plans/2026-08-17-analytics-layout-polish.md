# Evo 2027 Analytics Layout Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved two-part layout polish to the Evo 2027 spending analytics overview.

**Architecture:** Keep the change local to the existing `SpendingHero` and `SpendingTopCategories` components. Reuse the existing scope trigger and preserve all state, callbacks, accessibility labels, and navigation behavior.

**Tech Stack:** React, TypeScript, Tailwind utility classes, Vitest, Vite.

## Global Constraints

- Do not change analytics data, labels, navigation callbacks, or scope-selection behavior.
- Category rows remain accessible buttons labeled `Open {category} transactions`.
- The scope trigger remains an accessible button with `aria-haspopup="dialog"`.

---

### Task 1: Update the spending hero and category row layout

**Files:**
- Modify: `src/app/screens/analytics/Evo2027AnalyticsScreen.tsx:873-943` (`SpendingHero`)
- Modify: `src/app/screens/analytics/Evo2027AnalyticsScreen.tsx:1024-1067` (`SpendingTopCategories`)

**Interfaces:**
- Consumes: Existing `SpendingHero` props, `ExpenseBreakdownRow` data, and existing callbacks.
- Produces: The same rendered controls and callbacks with the requested visual ordering and width usage.

- [ ] **Step 1: Move the scope trigger above the spending headline**

  In `SpendingHero`, place the existing `data-evo-analytics-scope-trigger` button as the first element inside the hero's `relative z-10 max-w-[calc(100%-108px)]` content wrapper. Keep its `onOpenScope`, `aria-haspopup`, text, and dropdown `AppIcon` unchanged. Remove the old copy of the button below the income/net grid so there is only one trigger.

- [ ] **Step 2: Remove trailing category chevrons and their reserved space**

  In `SpendingTopCategories`, change each row button's class from `flex w-full items-start gap-[12px] ...` to a layout without the trailing-column gap, preserving the icon-to-content spacing by adding the needed gap only between the leading category icon and the content span if required. Remove the trailing `AppIcon name="chevron-link"` element. Keep the row button's `aria-label`, `onClick`, borders, padding, and focus ring unchanged.

- [ ] **Step 3: Run focused tests**

  Run:

  ```powershell
  npm test -- --run tests/screens/evo-2027-analytics.test.tsx
  ```

  Expected: PASS, including scope-trigger and category-row interaction coverage.

- [ ] **Step 4: Run validation/build**

  Run:

  ```powershell
  npm run build
  ```

  Expected: PASS with no TypeScript or bundler errors.

- [ ] **Step 5: Inspect the changed diff**

  Run:

  ```powershell
  git diff -- src/app/screens/analytics/Evo2027AnalyticsScreen.tsx
  ```

  Confirm the diff only moves the existing scope trigger and removes the category-row trailing chevron/spacing; do not revert unrelated user changes in the dirty worktree.
