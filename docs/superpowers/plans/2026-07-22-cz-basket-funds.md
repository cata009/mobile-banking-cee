# CZ Basket Funds Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Figma Basket Funds catalogue and detail experience to Investments for Czech Republic only, across current and future releases.

**Architecture:** A CZ-only typed basket config feeds two focused reusable screens/components. `InvestmentSecurityListScreen` owns tab/search state and opens the basket detail page locally; `InvestmentsPortfolioScreen` remains the route coordinator and activates the feature through the existing `country` prop.

**Tech Stack:** React, TypeScript, Tailwind utility classes already present in the repo, Vitest, Testing Library.

## Global Constraints

- Gate only on `country === "CZ"`; do not inspect release IDs.
- Reuse PageHeader, AccountSearchBar, MessagesMailboxTabs, SectionHeadingDivider, BrandLogo, and existing design tokens.
- Use native horizontal scrolling and scroll snap; do not add drag-to-click behavior or dependencies.
- Keep basket data deterministic and mock-only.
- Do not commit unless the user separately authorizes a commit.

---

### Task 1: CZ basket data contract

**Files:**
- Create: `src/app/config/investmentBasketFundsConfig.ts`
- Test: `tests/screens/investment-basket-funds.test.tsx`

**Interfaces:**
- Produces `InvestmentBasketFund`, `CZ_INVESTMENT_BASKETS`, and `getInvestmentBaskets(contributionType?)`.

- [ ] Write a failing test asserting 20 stable entries split into 6 one-off and 14 recurrent baskets.
- [ ] Run `npx vitest run tests/screens/investment-basket-funds.test.tsx` and confirm the missing module failure.
- [ ] Implement the typed immutable config and selectors.
- [ ] Re-run the focused test and confirm the data contract passes.

### Task 2: Catalogue carousel and CZ-only behavior

**Files:**
- Create: `src/app/components/investments/InvestmentBasketFundCard.tsx`
- Modify: `src/app/screens/investments/InvestmentSecurityScreens.tsx`
- Test: `tests/screens/investment-basket-funds.test.tsx`

**Interfaces:**
- `InvestmentSecurityListScreen` keeps its existing props and derives availability from `country`.
- The card receives one `InvestmentBasketFund` and `onSelect`.

- [ ] Add failing tests proving CZ renders Buy securities, tabs, Basket Funds count/carousel/CTA, while RO retains List of securities with no basket UI.
- [ ] Run the focused test and confirm the expected missing-UI failures.
- [ ] Reuse shared tabs/search/divider/logo components and add the native scroll-snap carousel.
- [ ] Filter recurrent securities and baskets under `Regular Plan`; apply search to both basket and security results.
- [ ] Re-run the focused test and confirm catalogue behaviors pass.

### Task 3: Basket Funds grouped page

**Files:**
- Create: `src/app/screens/investments/InvestmentBasketFundsScreen.tsx`
- Modify: `src/app/screens/investments/InvestmentSecurityScreens.tsx`
- Test: `tests/screens/investment-basket-funds.test.tsx`

**Interfaces:**
- `InvestmentBasketFundsScreen({ baskets, onBack })` renders Figma groups and independent expansion.
- Catalogue state switches locally between list and Basket Funds, preserving tab/search values.

- [ ] Add failing tests for exact group counts, initial four-row limits, independent See more/less controls, card/CTA navigation, and Back restoration.
- [ ] Run the focused test and confirm the grouped page is absent.
- [ ] Implement the shared-header grouped page and wire both entry points.
- [ ] Re-run focused catalogue/integration tests and confirm all pass.
- [ ] Run focused ESLint, Investments audit, production build, and interactive browser checks for CZ and a non-CZ country.
- [ ] Update handoff, state-of-world, capability-map, and next-task evidence without committing.
