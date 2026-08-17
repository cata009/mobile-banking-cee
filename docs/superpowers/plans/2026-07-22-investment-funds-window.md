# Investment Funds Window Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the exact Figma fund-selection and fund-collection journey from the Investments portfolio banner.

**Architecture:** The new journey remains local to `InvestmentsPortfolioScreen`, reuses existing screen primitives and canonical investment data, and extends the registered `InvestmentsFundBanner` rather than creating a competing banner component. Exact Figma assets are stored locally under Investments assets.

**Tech Stack:** React, TypeScript, Tailwind utilities, Vitest, Testing Library, existing UniCredit design-system primitives.

## Global Constraints

- Use only the image bytes exported from Figma nodes `12673:55537` and `12673:56763`.
- Reuse `PageHeader` and `InvestmentsFundBanner`.
- No new dependencies, backend claims, product recommendation engine, or invented financial values.
- Every collection fund row must open the existing fund detail path.

---

### Task 1: Lock the fund-window behavior with a failing test

**Files:**
- Create: `tests/screens/investment-funds-window.test.tsx`

**Interfaces:**
- Consumes: `InvestmentFundsSelectionScreen`, `InvestmentFundCollectionScreen`, `InvestmentFundCollectionId`.
- Produces: executable behavior contract for six banners and fund selection.

- [ ] Write a test that renders the selection page, asserts all six exact titles, clicks `Our Onemarket funds`, and expects `onSelectCollection("onemarket")`.
- [ ] Write a test that renders the Onemarket collection with canonical catalogue securities, asserts grouped section counts, clicks the first fund, and expects `onSelectSecurity` with that security.
- [ ] Run `npm test -- tests/screens/investment-funds-window.test.tsx` and confirm failure because the new module does not exist.

### Task 2: Add exact Figma assets and banner variants

**Files:**
- Add: `src/assets/investments/funds/*.png`
- Modify: `src/app/components/investments/InvestmentsFundBanner.tsx`
- Modify: `src/app/screens/design-system/specimens/cardSpecimens.tsx`
- Modify: `src/app/screens/design-system/DesignSystemPage.tsx`

**Interfaces:**
- Produces: `InvestmentFundBannerVariantId`, `INVESTMENT_FUND_BANNER_VARIANTS`, and a `variant` prop on `InvestmentsFundBanner`.

- [ ] Copy the exact Figma-exported PNG bytes into the investments asset directory.
- [ ] Add named variant metadata for `discovery`, `onemarket`, `selection-plus`, `featured`, `equity`, `balanced`, and `conservative`.
- [ ] Preserve the existing discovery appearance; render collection variants at the Figma card height with the exact exported background image.
- [ ] Update the Design System specimen to show every variant and describe the seven-variant contract.

### Task 3: Implement selection and collection screens

**Files:**
- Create: `src/app/config/investmentFundCollections.ts`
- Create: `src/app/screens/investments/InvestmentFundsWindowScreens.tsx`

**Interfaces:**
- Produces: `InvestmentFundCollectionId`, `getInvestmentFundCollection`, `getInvestmentFundCollectionSecurities`, `InvestmentFundsSelectionScreen`, `InvestmentFundCollectionScreen`.

- [ ] Define the six collection records with exact Figma titles/subtitles and deterministic security ordering/filtering.
- [ ] Implement the selection screen with shared `PageHeader`, search action, and six banner variants.
- [ ] Implement the collection hero, explanatory copy, one-off/regular grouped sections, exact Amundi asset, risk disclaimer, and clickable rows.
- [ ] Run the focused test and confirm it passes.

### Task 4: Wire the journey into Investments

**Files:**
- Modify: `src/app/screens/investments/InvestmentsPortfolioScreen.tsx`

**Interfaces:**
- Consumes: both fund-window screens and canonical `securityCatalog`.
- Produces: banner -> selection -> collection -> existing detail navigation.

- [ ] Add local selection/collection state alongside the existing investment sub-screen state.
- [ ] Wire the existing portfolio banner `onClick` to the selection screen.
- [ ] Wire collection selection, search, Back behavior, and security selection to `selectSecurity`.
- [ ] Add the fund-window state to the portfolio-home reset predicate.
- [ ] Run focused Investments and navigation tests.

### Task 5: Document and verify

**Files:**
- Modify: `docs/platform-capability-map/README.md`

**Interfaces:**
- Produces: current behavior/evidence record.

- [ ] Record the exact Figma sources, assets, component variants, navigation contract, tests, and limitations.
- [ ] Run `git diff --check`.
- [ ] Run `npm run verify` and require exit code 0.
- [ ] Verify live on `http://localhost:4001`: portfolio banner opens selection, all six images render, a collection opens, a fund opens its existing detail screen, and Back restores each parent.
