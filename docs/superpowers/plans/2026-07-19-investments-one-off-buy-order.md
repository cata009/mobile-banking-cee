# Investments One-Off Buy Order Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use completion checkboxes for tracking.

**Goal:** Add the complete one-off Investments buy-order journey for all eight Mobile PI countries.

**Architecture:** Keep the flow local to Investments, isolate calculations in a pure model, compose the four UI steps in a dedicated coordinator, and extract reusable standard Sign/Success presentation without changing payment routes.

**Tech Stack:** React 18, TypeScript 5.9, Tailwind CSS 4, Vitest 3, Testing Library, Vite 6.

**Status:** Completed and verified on 2026-07-19. Portfolio-level entry was verified through the in-app browser; focused component tests cover the local coordinator and product-detail Buy action.

## Global Constraints

- Scope is one-off BUY only; recurring and SELL flows are excluded.
- Reuse existing components and CSS variables; add no dependency.
- Support `RO`, `CZ`, `SK`, `HU`, `RS`, `BA`, `BA_BL`, and `SI` through shared code.
- Keep execution mock-only and non-persistent.
- Do not create a Git commit without explicit operator approval.

---

### Task 1: Quote And Validation Model

**Files:**
- Create: `src/app/screens/investments/investmentBuyOrderModel.ts`
- Test: `tests/screens/investment-buy-order-model.test.ts`

**Interfaces:**
- Consumes: `InvestmentCatalogSecurity`, `CurrentAccount`, `CountryId`, `convertCurrency`, `roundMoney`.
- Produces: `parseInvestmentOrderQuantity(value)`, `buildInvestmentBuyOrderQuote(security, account, quantity)`, and `getInvestmentBuyOrderValidation(quote, account)`.

- [x] Write failing tests for positive whole-number parsing, invalid values, direct-currency quotes, FX quotes, insufficient balance, and all country currencies.
- [x] Run `npm test -- tests/screens/investment-buy-order-model.test.ts` and confirm failure because the model does not exist.
- [x] Implement the typed model with the existing exchange-rate authority and deterministic rounding.
- [x] Run the targeted test and confirm all model cases pass.

### Task 2: Standard Sign And Success Components

**Files:**
- Create: `src/app/components/flow/StandardSignScreen.tsx`
- Create: `src/app/components/flow/StandardSuccessScreen.tsx`
- Modify: `src/app/screens/payments/DomesticPaymentFlowScreens.tsx`
- Test: `tests/screens/standard-flow-screens.test.tsx`

**Interfaces:**
- Produces: `StandardSignScreen({ title, pinLabel, pinHelper, actionLabel, onBack, onSign })` and `StandardSuccessScreen({ title, body, actionLabel, onDone })`.
- Payment wrappers preserve their existing exported signatures.

- [x] Write failing component tests for customizable investment copy and unchanged payment-wrapper copy.
- [x] Run `npm test -- tests/screens/standard-flow-screens.test.tsx` and confirm failure.
- [x] Extract the existing Sign and Success layouts into the focused shared components.
- [x] Replace payment implementations with thin wrappers and run the targeted tests.

### Task 3: Investment Buy Order Flow UI

**Files:**
- Create: `src/app/screens/investments/InvestmentBuyOrderFlow.tsx`
- Test: `tests/screens/investment-buy-order-flow.test.tsx`

**Interfaces:**
- Consumes: selected `InvestmentCatalogSecurity`, available `CurrentAccount[]`, `CountryId`, `amountsHidden`, `onBack`, and `onComplete`.
- Produces: the local `order-data -> review -> sign -> success` coordinator.

- [x] Write a failing end-to-end component test that enters quantity, reviews computed values, accepts terms, signs, reaches Success, and completes.
- [x] Add cases for invalid quantity, insufficient funds, terms gating, cash-account selection, and Back transitions.
- [x] Run `npm test -- tests/screens/investment-buy-order-flow.test.tsx` and confirm failure.
- [x] Implement the order-data screen with existing headers, dividers, fields, bottom sheet, and primary CTA.
- [x] Implement Review Data, purchase-information rows, terms gating, shared Sign, and shared Success.
- [x] Run the targeted component tests and confirm they pass.

### Task 4: Investments Integration

**Files:**
- Modify: `src/app/screens/investments/InvestmentSecurityScreens.tsx`
- Modify: `src/app/screens/investments/InvestmentsPortfolioScreen.tsx`
- Test: `tests/screens/investment-buy-order-flow.test.tsx`

**Interfaces:**
- `InvestmentSecurityDetailScreen` adds `onBuyClick?: () => void`.
- `InvestmentsPortfolioScreen` collects current accounts from its existing product snapshot and owns buy-flow open/close state.

- [x] Cover the product-detail Buy entry in a focused integration test and the full Invest -> security -> Buy entry in the in-app browser.
- [x] Wire the Buy action and local flow ownership without adding global routes.
- [x] Ensure completion returns to the portfolio and Back returns to the selected product.
- [x] Run Investments screen tests and the integration test.

### Task 5: Capability Evidence And Full Verification

**Files:**
- Modify: `docs/handoff/current-session.md`
- Modify: `docs/platform-capability-map/README.md`

**Interfaces:**
- Records files changed, decisions, commands, limitations, and country coverage.

- [x] Update capability and handoff evidence for the visible Investments behavior.
- [x] Run `npm run typecheck`, `npm run lint`, targeted tests, `npm run audit:investments`, `npm run audit:templates`, `npm run audit:platform`, and `npm run build`.
- [x] Run `git diff --check` and triage any new warning or limitation.
- [x] Smoke the full flow in the in-app browser on `http://127.0.0.1:4004/` and inspect browser warnings/errors.
