# Investment Chat Performance UX and Buy Handoff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the selected-investment performance response card-first and non-duplicative, then connect a product-aware `Buy`/`Buy more` chat action to the existing one-off Investments BUY flow.

**Architecture:** Extend the portable chat contracts with optional message layout and action identity fields while preserving defaults. The CZ resolver owns product-specific copy and action labels. `App` converts the typed action into a one-shot request that `InvestmentsPortfolioScreen` resolves against its canonical catalogue before opening the existing `InvestmentBuyOrderFlow`.

**Tech Stack:** React 18, TypeScript, Vitest, Testing Library, Vite, existing mobile PI Co-Apping package and Investments screen coordinator.

## Global Constraints

- Reuse the existing `investment-summary` block, `BrandLogo`, follow-up shelf, canonical Investments catalogue, quote model, and `InvestmentBuyOrderFlow`.
- Keep current text-first rendering as the default for every existing chat response.
- Do not restore an action button inside the product card.
- Do not repeat holding value, units, performance, market price, or update date in the performance interpretation.
- Use `Buy more` only for an owned security with positive quantity; otherwise use `Buy`.
- The action opens Order Data for the exact canonical security and never pre-fills quantity, accepts terms, signs, or submits.
- No new dependency, backend, live quote, persistence, suitability decision, or personalized recommendation.

## Approved Conversational BUY Extension

The operator rejected the immediate Order Data redirect after `Buy` / `Buy more`. The approved correction collects variable order data in chat, then opens the existing BUY coordinator directly on Review Data. Tasks 1-4 below describe the already implemented baseline; Task 5 is the active extension.

---

### Task 1: Optional Card-First Agent Message Layout

**Files:**
- Modify: `package/mobile-pi-coapping-chat-package/src/types.ts`
- Modify: `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx`
- Test: `tests/chat/co-apping-chat-assistant.test.tsx`

**Interfaces:**
- Consumes: existing `CoAppingChatMessage`, `CoAppingReplyResult`, `BubbleMessage`, and `RichBlocks`.
- Produces: `richBlocksPosition?: "before-text" | "after-text"` on agent messages/replies; default is `after-text`.

- [ ] **Step 1: Write failing renderer-order tests**

Add a resolver response with `richBlocksPosition: "before-text"`, one `investment-summary` block titled `Card first product`, and text `Interpretation after card`. Assert with `compareDocumentPosition` that the card precedes the formatted text. Add a default response and assert text still precedes its card.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- tests/chat/co-apping-chat-assistant.test.tsx`

Expected: TypeScript/test failure because `richBlocksPosition` is not accepted and `BubbleMessage` always renders text before blocks.

- [ ] **Step 3: Implement the optional layout contract**

Add the property to `CoAppingChatMessage` and include it in `CoAppingReplyResult`. In `BubbleMessage`, build the text and rich-block nodes once, then render them in the requested order only for `before-text`; all other messages retain the existing order. Ensure reply normalization/message creation carries the property through.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- tests/chat/co-apping-chat-assistant.test.tsx`

Expected: all assistant tests pass and the default-order regression remains green.

### Task 2: Non-Duplicative Performance Reply and Product-Aware BUY Action

**Files:**
- Modify: `package/mobile-pi-coapping-chat-package/src/types.ts`
- Modify: `src/app/chat/czChatOrchestration.ts`
- Test: `tests/chat/cz-chat-app-orchestration.test.ts`

**Interfaces:**
- Consumes: canonical `InvestmentCatalogSecurity`, `buildCzChatFollowUp`, `showSelectedInvestmentCardOnce`, and `richBlocksPosition` from Task 1.
- Produces: action target `investment-buy`, optional `securityId`, and a purchase follow-up for the exact selected security.

- [ ] **Step 1: Write failing owned and catalogue-only resolver tests**

For the owned fixture, assert the performance result uses `before-text`, card data remains present, text omits the formatted holding value, quantity, percentage, market price, and update date, and a `Buy more` navigate action carries `target: "investment-buy"` plus the security ID. Clone the fixture with `owned: false`, `quantity: 0`, and zero local value; assert `Buy` and the same exact identity handoff.

- [ ] **Step 2: Run the orchestration test and verify RED**

Run: `npm test -- tests/chat/cz-chat-app-orchestration.test.ts`

Expected: failures for duplicated figures, missing card-first layout, missing target, missing security identity, and missing ownership-aware labels.

- [ ] **Step 3: Implement the minimal resolver/action changes**

Extend `CoAppingChatActionTarget` with `investment-buy` and add `securityId?: string` to `CoAppingChatAction`. Build the purchase follow-up as a navigate action whose label is `Buy more` only when `owned && quantity > 0`. Rewrite the performance text to contain only interpretation and the non-advice boundary, set `richBlocksPosition: "before-text"`, and preserve `showSelectedInvestmentCardOnce(selectedInvestmentProductBlock)`.

- [ ] **Step 4: Run orchestration and assistant suites and verify GREEN**

Run: `npm test -- tests/chat/cz-chat-app-orchestration.test.ts tests/chat/co-apping-chat-assistant.test.tsx`

Expected: all selected-product and portable renderer tests pass.

### Task 3: One-Shot Chat-to-BUY Handoff

**Files:**
- Modify: `src/app/App.tsx`
- Modify: `src/app/screens/investments/InvestmentsPortfolioScreen.tsx`
- Test: `tests/screens/investment-product-chat-context.test.tsx`
- Test: `tests/screens/investment-buy-order-flow.test.tsx`

**Interfaces:**
- Consumes: `CoAppingChatAction.securityId`, canonical `securityCatalog`, existing `selectSecurity`, `buyOrderOpen`, and `InvestmentBuyOrderFlow`.
- Produces: `InvestmentBuyRequest { requestId: number; securityId: string }`, optional screen props `buyRequest` and `onBuyRequestConsumed`.

- [ ] **Step 1: Write failing screen integration tests**

Render `InvestmentsPortfolioScreen` with a buy request for a known active security and assert `Order Data` plus the exact product title appears. Add a catalogue-only security request and assert the same. Add an unknown ID and assert no Order Data and one consumption acknowledgement.

- [ ] **Step 2: Run the screen tests and verify RED**

Run: `npm test -- tests/screens/investment-product-chat-context.test.tsx tests/screens/investment-buy-order-flow.test.tsx`

Expected: prop/type failures because the screen cannot consume an external BUY request.

- [ ] **Step 3: Implement the screen request consumer**

Export `InvestmentBuyRequest`. Add optional `buyRequest` and `onBuyRequestConsumed` props. In an effect keyed by `requestId`, find `securityId` in `securityCatalog`; when found, call `selectSecurity(security)` and `setBuyOrderOpen(true)`. Always acknowledge once, including unknown IDs, and keep a ref to prevent replays.

- [ ] **Step 4: Connect `App` to the request**

Store the one-shot request in `App`. In `handleCzChatAction`, handle `investment-buy` before generic navigation: require `securityId`, close chat, create a monotonically unique request, and navigate to Investments. Pass the request and a clearing callback into `InvestmentsPortfolioScreen`.

- [ ] **Step 5: Run the screen tests and verify GREEN**

Run: `npm test -- tests/screens/investment-product-chat-context.test.tsx tests/screens/investment-buy-order-flow.test.tsx`

Expected: known held/unheld requests open the correct Order Data; unknown/replayed requests do not open the wrong product.

### Task 4: Documentation and End-to-End Verification

**Files:**
- Modify: `docs/handoff/current-session.md`
- Modify: `docs/handoff/next-tasks.md`
- Modify: `docs/handoff/banana-log.md`
- Modify: `docs/handoff/state-of-the-world.md`
- Modify: `docs/platform-capability-map/README.md`

**Interfaces:**
- Consumes: verified implementation and test evidence from Tasks 1-3.
- Produces: current behavior, limitation, commands, Banana Loop, and Constitutional Check evidence.

- [ ] **Step 1: Run focused verification**

Run: `npm test -- tests/chat/co-apping-chat-assistant.test.tsx tests/chat/cz-chat-app-orchestration.test.ts tests/screens/investment-product-chat-context.test.tsx tests/screens/investment-buy-order-flow.test.tsx`

Expected: all focused tests pass.

- [ ] **Step 2: Run static and production gates**

Run: `npm run typecheck`, `npm run lint`, `npm run audit:all`, `npm run build`, and `git diff --check`.

Expected: zero command failures; only already-triaged baseline notices may remain.

- [ ] **Step 3: Verify the visible flow in browser**

On CZ Future, open an owned Product Detail, launch chat, choose performance, assert card-before-text and no duplicated figures, click `Buy more`, and assert Order Data shows the exact product. Repeat with a catalogue-only product and `Buy`. Confirm no new warning/error logs.

- [ ] **Step 4: Update handoff and capability documentation**

Record files changed, the root cause, the optional compatible contracts, RED/GREEN commands, browser evidence, deterministic front-end limitation, Banana Loop outcome, and `safe to resume` status. Do not commit or publish implementation unless the operator requests closeout.

### Task 5: Collect BUY Data in Chat and Enter Review Directly

**Files:**
- Modify: `package/mobile-pi-coapping-chat-package/src/types.ts`
- Modify: `src/app/chat/czChatOrchestration.ts`
- Modify: `src/app/App.tsx`
- Modify: `src/app/screens/investments/InvestmentsPortfolioScreen.tsx`
- Modify: `src/app/screens/investments/InvestmentBuyOrderFlow.tsx`
- Test: `tests/chat/cz-chat-app-orchestration.test.ts`
- Test: `tests/screens/investment-product-chat-context.test.tsx`
- Test: `tests/screens/investment-buy-order-flow.test.tsx`

**Interfaces:**
- Produces: `CoAppingInvestmentBuyDraft { quantity; accountId; frequency: "one-off"; executionTiming: "today" | "next-business-day" }`.
- Extends: `CoAppingChatAction.investmentBuyDraft?` and `InvestmentBuyRequest.draft?`.
- Consumes: canonical current accounts plus `buildInvestmentBuyOrderQuote` for the same FX/balance calculation used by Review Data.

- [ ] **Step 1: Write failing orchestration tests**

Assert `Buy more` is a `send-message` action. Resolve its prompt and assert quantity choices with no navigate action; resolve `5 PCS` and assert account choices; resolve a canonical account choice and assert `Today` / `Next business day` navigate actions carrying the exact typed draft. Cover invalid quantity and insufficient balance without navigation.

- [ ] **Step 2: Verify orchestration RED**

Run: `npm test -- tests/chat/cz-chat-app-orchestration.test.ts`

Expected: failures because `Buy more` still navigates immediately and no typed draft or collection sequence exists.

- [ ] **Step 3: Implement conversational collection**

Change the initial purchase chip to `send-message`. Add narrowly ordered resolver branches for start, quantity, and canonical cash-account selection. Use natural visible prompts, allow a positive whole number typed after the quantity question, reuse the shared quote builder for balance validation, and make only the timing choices navigate with a complete typed draft.

- [ ] **Step 4: Write failing direct-review tests**

Pass a complete draft through `InvestmentBuyRequest` and assert `Review Data` opens immediately with the exact product, quantity, cash account, execution timing, and estimated amount. Assert an invalid account/draft falls back to Order Data and never substitutes a different account while claiming Review.

- [ ] **Step 5: Verify screen RED**

Run: `npm test -- tests/screens/investment-product-chat-context.test.tsx tests/screens/investment-buy-order-flow.test.tsx`

Expected: failures because buy requests cannot carry a draft and the coordinator always starts on Order Data.

- [ ] **Step 6: Implement typed draft handoff and review initialization**

Forward the optional draft through `App` and the one-shot request. Validate it against the current canonical accounts in `InvestmentBuyOrderFlow`; initialize quantity, account, frequency, timing, quote, and `review` only when valid. Add execution timing to Review Data. Keep terms acceptance false and preserve the existing Review -> Sign -> Success transition.

- [ ] **Step 7: Verify GREEN and regressions**

Run: `npm test -- tests/chat/cz-chat-app-orchestration.test.ts tests/screens/investment-product-chat-context.test.tsx tests/screens/investment-buy-order-flow.test.tsx tests/chat/co-apping-chat-assistant.test.tsx`

Expected: all tests pass, the first purchase action stays in chat, final timing enters Review Data, and legacy Product Detail BUY still opens Order Data.

- [ ] **Step 8: Verify and document**

Run TypeScript, ESLint, focused tests, full `npm run verify`, and `git diff --check`; then update handoff/capability evidence and browser-smoke the complete Product Detail -> Chat -> Quantity -> Account -> Timing -> Review -> Sign -> Success path.
