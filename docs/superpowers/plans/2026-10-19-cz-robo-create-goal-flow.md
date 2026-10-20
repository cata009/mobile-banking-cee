# CZ Robo Create Goal Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan inline. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the Czech PI Robo goal creation journey into line with the supplied Figma flow while keeping the current React Native experience and feature model.

**Architecture:** Keep the existing `CzRoboFlow`, reducer, and Native primitives. Correct composition, content, controls, and callbacks in place; keep navigation and business rules in the existing feature flow. Use local presentation state only for transient editors and detail pages.

**Tech Stack:** React Native 0.87, TypeScript, React Native Animated/Pressable, Jest with `react-test-renderer`, Vitest screen integration tests.

**Spec:** [Figma SBL-XXXX CZ Robo Advisor](https://www.figma.com/design/Lteu53v7vtyt7UqM64HuMq/Investments---CEE---DBN?node-id=9073-396971&t=N0Wk9An1nT2TSGeE-1), including Start `12928:236953`, contact `14832:60408`, risk profiles `14207:90269`, `14207:90401`, `14207:102978`, goal purpose `12928:237105`, plan `12928:238885`, portfolio `14832:65592`, basket `14832:68696`, review `14225:8249`, sign `12928:238850`, processing `12928:238874`, success `12928:238858`, and failure `12928:238866`.

## Global Constraints

- Keep PI Czech future as an experience on design system `current`.
- Keep the React Native screen and existing feature reducer; do not duplicate investment eligibility or signing rules in the UI.
- Preserve current navigation, demo authorization, goal persistence, and source data.
- Use the native animation driver only for properties it supports; keep layout height animation on the JS driver.
- Keep all existing user changes in the shared checkout; do not switch branches, reset, stash, clean, stage, or commit shared changes.

## Review Focus

- Edit data and Update now must invoke the existing host Profile route; without a host callback, show an actionable local editor/information panel.
- Expired and missing MiFID profiles must remain blocked, while Continue stays visible and disabled.
- All five goal types and all four preset horizons plus a custom horizon must be selectable and validated.
- Portfolio details must be a page with a working Select action; selected card, dots, holdings, and back navigation must remain synchronized.
- Contract acceptance must be an accessible switch and gate Continue to sign; PIN fields and actions must match Figma labels.

---

### Task 1: Goal choice and horizon model

**Files:**

- Modify: `src/features/investments/robo/catalog.ts`
- Modify: `src/app/screens/investments/robo/OnboardingScreens.tsx`
- Modify: `native-spike/src/experiences/pi/cz/evo-2027/robo/CreationScreens.tsx`
- Test: `native-spike/__tests__/cz-evo-robo-figma-flow.test.tsx`
- Test: `tests/screens/cz-future-robo-advisor-flow.test.tsx`

**Interfaces:**

- Keep `ROBO_GOAL_TYPES` as the source of goal labels and IDs; add the inflation purpose and matching name suggestions.
- Keep `RoboAdvisorFlowState` and its existing `select-horizon` / `set-manual-horizon` events; the custom option selects the existing manual horizon field.

- [x] Write a failing test for five goal choices including “Protection for inflation”.
- [x] Run the test and confirm it fails because the option is absent.
- [x] Write a failing test for the 25,000 / 50,000 / 100,000 CZK presets and custom horizon selection/validation.
- [x] Run the test and confirm the current amounts and always-visible manual field fail the assertions.
- [x] Implement the goal and horizon controls using the existing catalog and reducer actions.
- [x] Run the targeted Native Jest file and confirm both behaviors pass.

### Task 2: Screen layout and navigation

**Files:**

- Modify: `native-spike/src/experiences/pi/cz/evo-2027/robo/CreationScreens.tsx`
- Modify: `native-spike/src/experiences/pi/cz/evo-2027/investments/Primitives.tsx`
- Modify: `native-spike/src/experiences/pi/cz/evo-2027/robo/RoboFlow.tsx`
- Modify: `native-spike/src/experiences/pi/cz/evo-2027/investments/InvestmentsScreen.tsx`
- Test: `native-spike/__tests__/cz-evo-robo-figma-flow.test.tsx`
- Test: `native-spike/__tests__/cz-evo-robo.test.tsx`
- Test: `tests/screens/cz-future-robo-advisor-flow.test.tsx`

**Interfaces:**

- Pass the host's `onProfile` callback through `InvestmentsScreen` to the contact and investor-profile actions.
- Keep basket selection as a local screen state until the user presses Select; return to the portfolio page with that basket selected.

- [x] Write failing tests for the intro close control, host profile actions/fallback, risk profile card/status, full-page basket details/Select, grouped review/toggle, and page scroll reset.
- [x] Run the tests and confirm they expose the current missing or inert behavior.
- [x] Update the existing screens and callback wiring to match those assertions without replacing the page primitives.
- [x] Run the targeted Native Jest file and the Czech Robo screen integration test.

### Task 3: Sign and completion states

**Files:**

- Modify: `native-spike/src/experiences/pi/cz/evo-2027/robo/RoboFlow.tsx`
- Modify: `native-spike/src/experiences/pi/cz/evo-2027/auth/Authorization.tsx`
- Modify: `src/features/investments/robo/flowState.ts`
- Modify: `src/features/investments/robo/legacyFlowState.ts`
- Modify: `scripts/asset-baseline.json`
- Create: `src/assets/investments/robo/goal-created-illustration.svg`
- Create: `src/assets/investments/robo/goal-creation-failure.svg`
- Test: `native-spike/__tests__/cz-evo-robo-figma-flow.test.tsx`

**Interfaces:**

- Preserve shared signing defaults for investment orders; allow the goal-signing screen to set its Figma-specific top spacing.
- Keep the current demo authorization lifecycle and goal publishing callback; route failed goal submission to the Figma error state and retain the draft for retry.

- [x] Write a failing test for the goal sign title, PIN label/helper, button label, and field placement override.
- [x] Run the test and confirm the old labels and spacing fail.
- [x] Write a failing test for processing failure, “Review and try again”, and retention of the reviewed goal draft.
- [x] Run the test and confirm failure submission currently has no visible recovery path.
- [x] Implement goal-specific signing, processing, success, and failure states using the local Figma SVGs and retryable draft.
- [x] Run the targeted Native Jest file and the affected Czech Robo screen integration test.

### Final verification

- [x] Run affected Native Jest tests and the affected root Vitest screen tests.
- [x] Run `npm run verify` on the combined workspace.
- [x] Review only this task's paths and report unrelated pre-existing changes untouched.
