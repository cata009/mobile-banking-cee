# Analytics Figma Control Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Match the Evo 2027 expense chart controls and navigation icons to the approved Figma reference.

**Architecture:** Keep the existing analytics component boundaries and behavior. Update only the control geometry/icon choices in `Evo2027AnalyticsScreen.tsx` and the fallback Other marker presentation in `ExpenseDonutChart.tsx`, protected by focused render tests.

**Tech Stack:** React 18, TypeScript, Tailwind CSS utilities, Vitest, Testing Library.

## Global Constraints

- Preserve all chart switching, period navigation, and category filtering behavior.
- Reuse the existing `AppIcon` registry; add no dependencies or hand-authored assets.
- Match the Figma segmented control: 4px horizontal and 2px vertical outer padding, 2px gap, 40×24px items, 16px glyphs.
- Make the right interval arrow the mirrored counterpart of the left arrow.
- Give the Other marker the same 28px roundel and orbit spacing as category markers, with explicit contrast.

---

### Task 1: Add regression coverage

**Files:**
- Test: `tests/screens/evo-2027-analytics.test.tsx`

**Interfaces:**
- Consumes: rendered expense drill-down controls and donut marker DOM.
- Produces: regression assertions for control geometry, arrow symmetry, and Other marker styling.

- [ ] **Step 1: Write failing tests**

Add assertions that the chart group uses `gap-[2px] px-[4px] py-[2px]`, each chart button uses `h-[24px] w-[40px]`, both arrow SVGs share the same viewBox with the next arrow rotated 180 degrees, and the Other marker exposes its 28px contrasting roundel.

- [ ] **Step 2: Run the focused tests to verify RED**

Run: `npm test -- tests/screens/evo-2027-analytics.test.tsx`

Expected: the new assertions fail against the current 32px chart buttons, `chevron-link`, and unstyled Other glyph.

- [ ] **Step 3: Commit**

No automatic commit; the shared worktree already contains user-owned changes.

### Task 2: Implement the Figma-aligned controls

**Files:**
- Modify: `src/app/screens/analytics/Evo2027AnalyticsScreen.tsx`
- Modify: `src/app/components/analytics/ExpenseDonutChart.tsx`

**Interfaces:**
- Consumes: existing `AppIcon`, chart mode state, period navigation callbacks, and donut arc geometry.
- Produces: unchanged interactions with corrected visual structure.

- [ ] **Step 1: Implement minimal control changes**

Use `chevron-left` for both arrows and rotate only the next glyph; give the segmented control Figma geometry; wrap the Other glyph in a 28px neutral roundel and keep it on the shared orbit.

- [ ] **Step 2: Run the focused test to verify GREEN**

Run: `npm test -- tests/screens/evo-2027-analytics.test.tsx`

Expected: all focused analytics tests pass.

- [ ] **Step 3: Run type/build verification**

Run: `npm run typecheck` and `npm run build`.

Expected: both commands exit 0.

- [ ] **Step 4: Visually verify the supplied analytics route**

Reload the local page, open the expense breakdown, and inspect the chart selector, both interval arrows, and Other marker at the target viewport.

- [ ] **Step 5: Commit**

No automatic commit; hand the focused diff back to the user.
