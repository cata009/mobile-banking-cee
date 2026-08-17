# Investment Chat Chart Periods Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the CZ investment-chat product explanation card with the canonical portfolio chart, five interactive time periods, responsive mobile layout, and product-correct data.

**Architecture:** The chat reply carries a typed, presentation-ready chart model containing currency, default period, and canonical point series for every supported period. The chat package renders that model with the same `InvestmentPortfolioChart` and `InvestmentPeriodChips` components used by investment product detail, keeping period selection local to the rich card. The integration remains backward-compatible because the chart is optional.

**Tech Stack:** React, TypeScript, Recharts, Vitest, Testing Library, existing UniCredit design-system components and tokens.

## Global Constraints

- Reuse the existing investment chart and period-selector components.
- Supported chat periods are exactly `1 M`, `3 M`, `1 Y`, `3 Y`, and `ALL`; default is `3 Y`.
- Chart values use the selected security market price and instrument currency.
- Do not add dependencies or change unrelated product behavior.
- Preserve all concurrent uncommitted work and commit the unified workspace only after verification.

---

### Task 1: Typed chart contract and orchestration

**Files:**
- Modify: `package/mobile-pi-coapping-chat-package/src/types.ts`
- Modify: `src/app/chat/czChatOrchestration.ts`
- Test: `tests/chat/cz-chat-app-orchestration.test.ts`

**Interfaces:**
- Produces: `CoAppingInvestmentChart`, containing `currency`, `defaultPeriod`, and complete point series keyed by `1m | 3m | 1y | 3y | max`.
- Consumes: `buildInvestmentChartPoints(baseValue, periodId)` and the selected security's `marketPrice` and `instrumentCurrency`.

- [ ] Add a failing orchestration assertion for the typed five-period chart model and `3y` default.
- [ ] Run `npx vitest run tests/chat/cz-chat-app-orchestration.test.ts` and confirm the new assertion fails.
- [ ] Replace the temporary `unknown[]` chart payload with the typed chart model generated from the selected security.
- [ ] Re-run the focused orchestration test and confirm it passes.

### Task 2: Interactive shared chart composition

**Files:**
- Modify: `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx`
- Modify: `package/mobile-pi-coapping-chat-package/src/coapping.css`
- Test: `tests/chat/co-apping-chat-assistant.test.tsx`

**Interfaces:**
- Consumes: the optional `CoAppingInvestmentChart` from Task 1.
- Produces: a reusable rich-card chart section that renders `InvestmentPortfolioChart` and `InvestmentPeriodChips`, with local period state.

- [ ] Add a failing UI test that verifies all five chips, the `3 Y` default, and a working change to `1 M`.
- [ ] Run `npx vitest run tests/chat/co-apping-chat-assistant.test.tsx` and confirm the new assertion fails.
- [ ] Render the canonical chart and selector, remove casts/hardcoded currency, and style the section for the narrow chat card.
- [ ] Re-run the focused UI test and confirm it passes.

### Task 3: Verification, handoff, publishing

**Files:**

**Interfaces:**
- Consumes: completed chart feature and the entire unified working tree.
- Produces: verified repository state, Git history on `origin/main`, and a Production Vercel deployment.

- [ ] Run focused tests, typecheck/lint, and the repository verification command.
- [ ] Verify the investment chat visually in the local in-app browser, including period switching.
- [ ] Commit all workspace changes, push `main`, deploy to Vercel Production, and smoke-test the immutable and canonical URLs.
