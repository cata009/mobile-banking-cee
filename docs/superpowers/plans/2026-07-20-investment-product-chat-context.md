# Investment Product Chat Context Implementation Plan

> **For agentic workers:** Execute inline in this session. The repository's `design-system-ui` skill requires a single agent and targeted lookups, so no subagent workflow is permitted for this plan.

**Goal:** Ground the CZ Future chatbot in the exact Investments security detail currently visible to the user.

**Architecture:** The Investments coordinator exposes its selected canonical `InvestmentCatalogSecurity` through an optional callback. `App` owns the cross-surface chat snapshot and supplies it to existing context/reply builders. The package UI remains unchanged.

**Tech Stack:** React 18, TypeScript, existing Co-Apping chat package, Vitest, Testing Library.

## Global constraints

- Preserve unrelated local Investments/Buy changes.
- No dependency, backend, live market feed, persistence, execution, suitability decision, or personalized buy/sell recommendation.
- Reuse the existing chat UI and canonical investment model.
- Test first and observe the expected feature failure before production changes.

---

### Task 1: Product-aware CZ chat contracts

**Files:**
- Modify: `src/app/chat/cz/helpers.ts`
- Modify: `src/app/chat/cz/context.ts`
- Modify: `src/app/chat/czChatOrchestration.ts`
- Test: `tests/chat/cz-chat-app-orchestration.test.ts`

- [x] Add failing tests for the exact two product-specific entry topics, distinct Explain/Performance answers, product facts, catalogue-only language, and advice boundaries.
- [x] Run the focused chat test and confirm failures are caused by the missing product context.
- [x] Extend the builders with an optional selected security and implement bounded product replies.
- [x] Re-run the focused chat test and confirm green.

### Task 2: Selected-security handoff

**Files:**
- Modify: `src/app/screens/investments/InvestmentsPortfolioScreen.tsx`
- Modify: `src/app/App.tsx`
- Test: `tests/screens/investment-product-chat-context.test.tsx`

- [x] Add a failing integration test proving selection and Back emit the correct context transitions.
- [x] Run the focused screen test and confirm the optional callback is missing.
- [x] Add a backward-compatible optional callback and wire App state into chat context/resolver creation.
- [x] Re-run the focused screen test and confirm green.

### Task 3: Verification and evidence

**Files:**
- Modify: `docs/platform-capability-map/README.md`

- [x] Run focused tests, typecheck, lint, and full verification (recording the unrelated pre-existing Buy-test mismatch).
- [x] Verify the CZ Future owned-product flow at the 375px phone baseline in the browser.
- [x] Verify returning to the portfolio restores portfolio-level topics.
- [x] Leave changes uncommitted unless the user explicitly requests a commit.
