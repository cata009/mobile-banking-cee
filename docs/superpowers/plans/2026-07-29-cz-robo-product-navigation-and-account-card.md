# CZ Robo Product Navigation and Account Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the corrected Future CZ account card in Design System with and without quick actions, use the supplied New payment glyph, and let users open the existing investment product detail from every Robo goal holding.

**Architecture:** Keep `ProductCard` and `InvestmentSecurityDetailScreen` as the only visual implementations. Add a reusable Future CZ account-action fixture for Homepage and Design System, enrich the shared security catalogue with the Robo holdings, reference those securities by stable ID from the Robo model, and let `InvestmentsPortfolioScreen` temporarily render the existing product-detail route while preserving the selected goal underneath.

**Tech Stack:** React, TypeScript, Tailwind CSS, Vitest, Testing Library.

## Global Constraints

- Apply only to `PI / CZ / release-future-cz-robo` unless the component is explicitly shown in Design System.
- Do not create a second product-detail screen.
- Preserve Buy and Sell behavior from the existing security-detail experience.
- Back from product detail must return to the same goal detail.
- Use the exact supplied 24×24 New payment SVG.
- Preserve unrelated dirty-worktree changes.

---

### Task 1: Future CZ account-card component variants and exact icon

**Files:**
- Modify: `src/app/components/icons/customIcons.tsx`
- Create: `src/app/components/productCardFixtures.tsx`
- Modify: `src/app/screens/home/AccountSummary.tsx`
- Modify: `src/app/screens/design-system/specimenShell.tsx`
- Modify: `src/app/screens/design-system/specimens/fieldSpecimens.tsx`
- Modify: `src/app/screens/design-system/DesignSystemPage.tsx`
- Modify: `src/app/screens/design-system/componentStatePreviews.tsx`
- Test: `tests/screens/home-account-summary-evolution.test.tsx`
- Test: `tests/screens/design-system-specimens.test.tsx`

**Interfaces:**
- Produces: `FUTURE_CZ_ACCOUNT_CARD_ACTIONS` as a reusable action-definition fixture with `id`, `iconName`, `iconSize`, `label`, and `ariaLabel`.
- Produces: Design System variant `pi-account-actions`, showing one account card with quick actions followed by the same card without actions.

- [ ] **Step 1: Write failing Homepage icon assertions**

Assert that the visible New payment action uses a `24×24` SVG with `viewBox="0 0 24 24"` and the first supplied path:

```tsx
expect(newPaymentIcon).toHaveAttribute("viewBox", "0 0 24 24")
expect(newPaymentIcon?.querySelector("path")).toHaveAttribute(
  "d",
  "M10.9248 5.125C10.9248 6.85062 9.58194 8.25 7.92473 8.25C6.26812 8.25 4.92471 6.85062 4.92471 5.125C4.92471 3.39875 6.26812 2 7.92473 2C9.58194 2 10.9248 3.39875 10.9248 5.125Z",
)
```

- [ ] **Step 2: Write failing Design System assertions**

Select `pi-account-actions`, then assert the specimen contains exactly two evolution cards, the first has four action buttons, the second has no action container, and the supplied New payment glyph appears.

- [ ] **Step 3: Run focused tests and verify RED**

Run:

```powershell
npx vitest run tests/screens/home-account-summary-evolution.test.tsx tests/screens/design-system-specimens.test.tsx
```

Expected: failure because `pi-account-actions` and the supplied glyph are not registered.

- [ ] **Step 4: Implement the shared action fixture and DS specimen**

Register `payment-new` in `CUSTOM_ICONS`, map the shared Future CZ action definitions into `ProductCardAction[]` in Homepage and Design System, add the dedicated selector variant, and render labeled With quick actions / Without quick actions examples.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run:

```powershell
npx vitest run tests/screens/home-account-summary-evolution.test.tsx tests/screens/design-system-specimens.test.tsx
```

Expected: both files pass.

### Task 2: Shared Robo holding catalogue and product-detail routing

**Files:**
- Modify: `src/app/config/investmentsPortfolioConfig.ts`
- Modify: `src/app/screens/investments/czFutureRoboAdvisorModel.ts`
- Modify: `src/app/screens/investments/CzFutureRoboAdvisorFlow.tsx`
- Modify: `src/app/screens/investments/InvestmentsPortfolioScreen.tsx`
- Test: `tests/screens/cz-future-robo-advisor-model.test.ts`
- Test: `tests/screens/home-investment-goals-routing.test.tsx`

**Interfaces:**
- Produces: `RoboPortfolioProduct.securityId: string`.
- Consumes: `onOpenSecurity(securityId: string)` in `CzFutureRoboAdvisorFlow`.
- Reuses: `InvestmentSecurityDetailScreen` and the existing Buy/Sell callbacks in `InvestmentsPortfolioScreen`.

- [ ] **Step 1: Write failing model coverage**

Assert every product in `ROBO_PORTFOLIO_PRESENTATIONS` has a non-empty `securityId`, and every unique ID resolves from `buildInvestmentSecurityCatalog`.

- [ ] **Step 2: Write failing integration navigation test**

Open Build long-term wealth, click `Open Apple product details`, assert the existing security detail shows Apple and Buy/Sell, click Back, and assert the same goal detail is restored.

- [ ] **Step 3: Run focused tests and verify RED**

Run:

```powershell
npx vitest run tests/screens/cz-future-robo-advisor-model.test.ts tests/screens/home-investment-goals-routing.test.tsx
```

Expected: failure because products have no security IDs and holding rows are not buttons.

- [ ] **Step 4: Add shared catalogue entries for all Robo holdings**

Add deterministic catalogue seeds for the unique Robo securities, including title, currency, product type, asset class, market price, performance, and logo. Assign the matching stable `securityId` to every Robo product.

- [ ] **Step 5: Connect the existing detail route**

Render each holding as a full-width button with `aria-label="Open <name> product details"`. Pass the security ID to `InvestmentsPortfolioScreen`, resolve it from `securityCatalog`, prioritize the selected-security route above the Robo route, and clear only `selectedSecurity` on Back so the goal state remains mounted logically.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run:

```powershell
npx vitest run tests/screens/cz-future-robo-advisor-model.test.ts tests/screens/home-investment-goals-routing.test.tsx
```

Expected: both files pass.

### Task 3: Regression verification and handoff evidence

**Files:**
- Modify: `docs/platform-capability-map/README.md`

**Interfaces:**
- Consumes: completed account-card and goal-product navigation behaviors.
- Produces: current-session evidence and resume-safe next steps.

- [ ] **Step 1: Run the combined focused suite**

```powershell
npx vitest run tests/screens/home-account-summary-evolution.test.tsx tests/screens/design-system-specimens.test.tsx tests/screens/cz-future-robo-advisor-model.test.ts tests/screens/home-investment-goals-routing.test.tsx
```

- [ ] **Step 2: Run TypeScript/build verification**

```powershell
npm run build
```

- [ ] **Step 3: Inspect the live demo**

Verify on port `4001`:

1. Homepage New payment uses the supplied icon.
2. Design System shows the two account-card variants.
3. Apple opens the existing product detail.
4. Buy/Sell are available.
5. Back restores Build long-term wealth.

- [ ] **Step 4: Update handoff and capability evidence**

Record exact files changed, commands, results, assumptions, and remaining limitations.
