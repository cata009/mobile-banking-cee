# Investments Portfolio Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the same twelve mocked owned securities drive all Mobile PI Investments totals, returns, distribution tabs, drill-downs, history and product details.

**Architecture:** `investmentsPortfolioConfig.ts` remains the canonical source. Ten active seeds allocate the existing investment-account balance and derive instrument values, quantities and returns; two inactive zero-balance seeds are displayed only as legacy demo products. The screen consumes active financial positions for every aggregate.

**Tech Stack:** React 18, TypeScript, Vite 6, existing exchange-rate helpers; no new dependencies.

## Global Constraints

- Support each existing Mobile PI country through `CountryId`, locale and country-currency conversion.
- Preserve the current UI composition and navigation.
- Keep exactly 10 active and 2 inactive owned securities.
- Add no APIs, persistence or packages.

---

### Task 1: Add a portfolio consistency audit

**Files:**
- Create: `scripts/audit-investments-portfolio.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: Vite SSR loading `buildInvestmentSecurities`, `buildInvestmentDistributionItems` and `calculateInvestmentProductsTotalValue`.
- Produces: `npm run audit:investments`, which fails if the mock financial contract diverges.

- [x] **Step 1: Write the failing audit**

Create a Vite SSR script that creates one source investment product with `balance: 10000`, then asserts `securities.length === 12`, `active.length === 10` and `inactive.length === 2`. Add this script command:

```json
"audit:investments": "node scripts/audit-investments-portfolio.mjs"
```

- [x] **Step 2: Verify RED**

Run: `npm run audit:investments`

Expected: exit non-zero with `expected 12 owned securities`, because the previous seed contains five positions.

- [x] **Step 3: Add reconciliation assertions**

The audit must assert that active local values equal the source balance, inactive local values/performance are zero, product-type active counts are `Fund=4`, `Bond=2`, `Stock=2`, `ETF=1`, `Money market=1`, every non-Performance distribution sums to the active total and 100%, and `abs(marketPrice * quantity - value) <= 0.01` for each active security.

### Task 2: Expand and derive the canonical portfolio

**Files:**
- Modify: `src/app/config/investmentsPortfolioConfig.ts`

**Interfaces:**
- Consumes: source investment-account `Product[]` and `CountryId`.
- Produces: `InvestmentSecurity[]` with canonical market price, quantity, local value, instrument value and return.

- [x] **Step 1: Extend the seed contract**

Add `marketPrice` to `InvestmentSecuritySeed` and `InvestmentSecurity`. Replace the five seeds with ten active seeds with weights `13, 10, 8, 7, 12, 10, 9, 7, 14, 10` and two inactive legacy seeds with weight `0`. Use four Funds, two Bonds, two Stocks, one ETF and one Money market across the active positions.

- [x] **Step 2: Implement active-only allocation**

Allocate the source total only across `seed.status === "active"`. Give every inactive seed `localValue: 0`, `value: 0`, `quantity: 0` and `performanceAmount: 0`; let the final active seed absorb rounding. Derive active quantity from `value / marketPrice` and return the seed market price unchanged.

- [x] **Step 3: Remove competing detail facts**

Change `enrichCatalogSecurity` to retain the derived `marketPrice` and `quantity` rather than inventing replacements. Filter to active non-zero positions in distribution and history builders.

- [x] **Step 4: Verify GREEN**

Run: `npm run audit:investments`

Expected: exit `0` with `investment portfolio consistency audit ok`.

### Task 3: Use financial positions for screen aggregates and drill-downs

**Files:**
- Modify: `src/app/screens/investments/InvestmentsPortfolioScreen.tsx`

**Interfaces:**
- Consumes: twelve canonical `InvestmentSecurity` items.
- Produces: summary/chart/distribution/category values derived from the same ten active securities while retaining a two-item inactive section.

- [x] **Step 1: Derive the financial collection**

Keep the investment-account sum only as input to `buildInvestmentSecurities`. Define `financialSecurities` as active positions with positive local value and use it for total value, performance amount, performance percentage, chart points and distributions.

- [x] **Step 2: Preserve complete portfolio display**

Keep Performance lists split into 10 active and 2 inactive cards, set `ALL PRODUCTS` to 12, and pass `financialSecurities` to `DistributionCategoryDetailScreen`. A Product Type > Fund drill-down therefore renders the four active Funds that create that slice.

- [x] **Step 3: Verify integration**

Run: `npm run audit:investments && npm run build`

Expected: both commands exit `0`.

### Task 4: Document and verify the cross-country mock contract

**Files:**
- Modify: `docs/platform-capability-map/README.md`

**Interfaces:**
- Consumes: successful audit/build output.
- Produces: a resumable handoff with ownership, evidence and known constraints.

- [x] **Step 1: Record the contract**

Document the canonical 10-active/2-inactive rule, active-only financial aggregation, all-country scope and audit command.

- [x] **Step 2: Run full verification**

Run `npm run audit:investments`, `npm run build`, `npm run audit:templates`, `npm run audit:platform`, and `git diff --check`. Every command must exit `0`; only already-triaged Vite chunk warnings may remain.

- [ ] **Step 3: Browser smoke (blocked by local URL policy; no workaround used)**

On RO Investments, confirm 10 active/2 inactive cards, four Fund rows in Product Type > Fund, totals aligned across every distribution tab, and market-price/quantity coherence in active product detail. Repeat aggregate checks for a second country currency.
