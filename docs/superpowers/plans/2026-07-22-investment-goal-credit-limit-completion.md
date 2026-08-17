# Investment Goal and Credit Limit Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the CZ Future investment-goal and credit-limit chatbot journeys through real existing or mock-authenticated endpoints without repeated options or circular branches.

**Architecture:** Investment goal values are derived from conversation history in a focused CZ chat helper and handed to the matching existing Funds collection through a typed chat action. Credit-limit discovery stays in chat, while review/sign/success and accepted-card session state stay in the application layer. The portable package remains independent from app screens and stores.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, Testing Library, existing Co-Apping chat package, existing standard flow components.

## Global Constraints

- Reuse the existing Funds storefront for generic discovery and the existing collection detail, security detail, BUY, Review Data, Sign, and Success path for the matched goal handoff.
- Credit-limit acceptance is session-only mock state and applies only after successful signing.
- Every semantic action has one stable ID; display and drag do not consume it, stationary selection does.
- No new dependency, backend, persisted goal, recommendation ranking, underwriting, or real authorization.
- Use test-first RED/GREEN for every behavior change.
- Do not commit unless the operator explicitly requests a Git closeout.

---

### Task 1: Investment Goal Draft and Dynamic Projection

**Files:**
- Create: `src/app/chat/cz/investmentGoal.ts`
- Modify: `src/app/chat/czChatOrchestration.ts`
- Test: `tests/chat/cz-chat-app-orchestration.test.ts`

**Interfaces:**
- Consumes: `CoAppingChatMessage[]` and the current user prompt.
- Produces: `InvestmentGoalDraft`, `extractInvestmentGoalDraft(messages)`, `getInvestmentGoalNextStep(draft)`, and `buildInvestmentGoalProjectionBlock(draft, country)`.

- [ ] **Step 1: Write failing resolver tests for unambiguous ordered steps**

Add a complete walkthrough whose visible labels include both undecided choices but whose prompts are qualified:

```ts
const purpose = await resolveReply("Set investment goal purpose to future purchase.", history);
expect(purpose.followUps).toEqual(expect.arrayContaining([
  expect.objectContaining({ id: "cz-goal-horizon-3-5", prompt: "Set investment goal horizon to 3-5 years." }),
]));

const horizon = await resolveReply("Set investment goal horizon to not sure yet.", history);
expect(horizon.text).toContain("Starting amount");
```

- [ ] **Step 2: Run the focused resolver suite and verify RED**

Run: `npm test -- --run tests/chat/cz-chat-app-orchestration.test.ts`

Expected: FAIL because goal prompts are generic and `Not sure yet` hits the wrong branch.

- [ ] **Step 3: Add the focused draft parser**

Implement exact prompt-prefix parsing rather than free-text overlap:

```ts
export type InvestmentGoalDraft = {
  purpose: "grow-savings" | "future-purchase" | "long-term-reserve" | null;
  horizon: "3-5" | "5-10" | "undecided" | null;
  startingAmount: 5000 | 10000 | null;
  startingAmountUndecided: boolean;
  monthlyContribution: 0 | 500 | 1000 | null;
  riskComfort: "calm" | "balanced" | "growth" | null;
};
```

`extractInvestmentGoalDraft` scans user messages once, recognizes only the stable qualified prompts, and lets the latest answer for a field win.

- [ ] **Step 4: Replace the overlapping goal branches with a step-driven resolver**

Use one set of stable IDs and qualified prompts:

```ts
buildCzChatFollowUp("cz-goal-purpose-future-purchase", "Future purchase", "Set investment goal purpose to future purchase.")
buildCzChatFollowUp("cz-goal-horizon-undecided", "Not sure yet", "Set investment goal horizon to not sure yet.")
buildCzChatFollowUp("cz-goal-risk-balanced", "Balanced", "Set investment goal risk comfort to balanced.")
```

After the risk answer, render `### Your goal plan` with all five captured values.

- [ ] **Step 5: Build projection values from the draft**

Use deterministic illustrative annual paths and contributions:

```ts
const years = draft.horizon === "3-5" ? 4 : draft.horizon === "5-10" ? 7 : 5;
const principal = (draft.startingAmount ?? 0) + (draft.monthlyContribution ?? 0) * years * 12;
const scenarioRates = draft.riskComfort === "calm" ? [0.01, 0.025, 0.04]
  : draft.riskComfort === "growth" ? [-0.01, 0.05, 0.09]
  : [0, 0.04, 0.07];
```

Format lower/expected/higher values as CZK and keep the explicit illustrative/non-guaranteed copy. If amount or horizon is undecided, show a `Complete later` summary and do not invent a numeric projection.

- [ ] **Step 6: Run the focused suite and verify GREEN**

Run: `npm test -- --run tests/chat/cz-chat-app-orchestration.test.ts`

Expected: PASS with the complete ordered goal journey and dynamic recap.

### Task 2: Investment Goal Handoff to the Matching Funds Collection

**Files:**
- Modify: `package/mobile-pi-coapping-chat-package/src/types.ts`
- Modify: `src/app/chat/czChatOrchestration.ts`
- Modify: `src/app/App.tsx`
- Modify: `src/app/screens/investments/InvestmentsPortfolioScreen.tsx`
- Test: `tests/screens/investment-product-chat-context.test.tsx`

**Interfaces:**
- Produces: action target `investment-funds`, optional `investmentFundCollectionId`, and `InvestmentFundsRequest { requestId, collectionId? }`.
- Consumes: the existing collection-detail screens and current Investments route. An omitted collection ID still opens `InvestmentFundsSelectionScreen` for generic discovery callers.

- [ ] **Step 1: Write the failing Funds request test**

```tsx
render(<InvestmentsPortfolioScreen onBack={() => undefined} fundsWindowRequest={{ requestId: 7, collectionId: "balanced" }} />, { wrapper: AppProviders });
expect(await screen.findByTestId("investment-fund-collection-balanced")).toBeInTheDocument();
expect(screen.queryByTestId("investment-funds-selection")).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the screen suite and verify RED**

Run: `npm test -- --run tests/screens/investment-product-chat-context.test.tsx`

Expected: FAIL because the prop and action target do not exist.

- [ ] **Step 3: Add the typed handoff**

Extend the `investment-funds` action with optional collection metadata. In `App`, increment a request sequence, close chat, and navigate to Investments. In `InvestmentsPortfolioScreen`, an effect keyed by the correlated request clears prior sub-screen state and opens the requested collection exactly once, falling back to the storefront only when no collection is supplied.

- [ ] **Step 4: Add final goal actions**

The goal summary exposes exactly:

```ts
buildCzNavigateFollowUp("cz-goal-explore-funds", "Explore matching funds", "investment-funds", {
  investmentFundCollectionId: getInvestmentGoalFundCollectionId(investmentGoalDraft.riskComfort),
})
buildCzChatFollowUp("cz-goal-done", "I'm done", "Finish this investment goal conversation.")
```

The terminal reply is `### Goal plan complete` with no follow-ups.

- [ ] **Step 5: Verify GREEN**

Run: `npm test -- --run tests/chat/cz-chat-app-orchestration.test.ts tests/screens/investment-product-chat-context.test.tsx`

Expected: PASS and the balanced request opens `investment-fund-collection-balanced` without rendering `investment-funds-selection`.

### Task 3: Credit-Limit Conversation Convergence

**Files:**
- Modify: `package/mobile-pi-coapping-chat-package/src/types.ts`
- Modify: `src/app/chat/czChatOrchestration.ts`
- Test: `tests/chat/cz-chat-app-orchestration.test.ts`
- Test: `tests/chat/co-apping-chat-assistant.test.tsx`

**Interfaces:**
- Produces: action target `credit-limit-review`.
- Consumes: `creditCardForOpportunity` and the shared consumed-action registry.

- [ ] **Step 1: Write failing tests for the convergent graph**

Assert the entry actions are the stable set below and that informational selection cannot recreate itself:

```ts
expect(entry.followUps).toEqual([
  expect.objectContaining({ id: "cz-limit-impact", label: "Check repayment impact" }),
  expect.objectContaining({ id: "cz-limit-review", action: expect.objectContaining({ target: "credit-limit-review" }) }),
  expect.objectContaining({ id: "cz-limit-not-now", label: "Not now" }),
]);
```

After `Check repayment impact`, only the same `cz-limit-review` and `cz-limit-not-now` actions may remain. `Not now` returns a terminal reply with no follow-ups.

- [ ] **Step 2: Run RED**

Run: `npm test -- --run tests/chat/cz-chat-app-orchestration.test.ts tests/chat/co-apping-chat-assistant.test.tsx`

Expected: FAIL because the current graph uses duplicate `Continue`, `Accept`, `Sign now`, and `After acceptance` loops and has no navigation target.

- [ ] **Step 3: Replace the loop with three stable actions**

Delete the prose-only confirmation/sign branches. Use one informational branch, one navigate action, and one terminal branch. If no credit card exists, return `### Offer unavailable` with no review action.

- [ ] **Step 4: Verify GREEN**

Run the same focused command and require all tests to pass.

### Task 4: Authenticated Mock Credit-Limit Flow

**Files:**
- Create: `src/app/screens/cards/CreditLimitOfferFlow.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/app/screens/cards/CardDetailScreen.tsx`
- Test: `tests/screens/credit-limit-offer-flow.test.tsx`

**Interfaces:**
- `CreditLimitOfferFlow({ card, country, onCancel, onComplete })`.
- `onComplete(cardId, newLimit)` is called only after signing.
- `CardDetailScreen` consumes `creditLimitOverrides?: Readonly<Record<string, number>>`.

- [ ] **Step 1: Write failing review/sign/success tests**

Cover:

```tsx
expect(screen.getByText("Review credit limit")).toBeInTheDocument();
expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
fireEvent.click(screen.getByRole("switch", { name: "Accept credit limit terms" }));
fireEvent.click(screen.getByRole("button", { name: "Continue" }));
expect(screen.getByText("Sign limit change")).toBeInTheDocument();
```

Enter the standard mock PIN, sign, assert `Limit updated`, then assert `onComplete("card-credit-1", 15000)`. A Back/cancel test asserts zero completion calls.

- [ ] **Step 2: Run RED**

Run: `npm test -- --run tests/screens/credit-limit-offer-flow.test.tsx`

Expected: FAIL because the flow does not exist.

- [ ] **Step 3: Implement the review screen**

Compose shared `PageHeader`, `SectionHeadingDivider`, `ToggleButton`, and `PrimaryButton`. Show card identity, current limit, new limit, increase amount, and the explicit mock conditions. Continue remains disabled until terms are accepted.

- [ ] **Step 4: Reuse standard sign and success screens**

Use `StandardSignScreen` and `StandardSuccessScreen`. The success callback is the only path that invokes `onComplete`.

- [ ] **Step 5: Apply session overrides in App**

Store accepted limits as:

```ts
const [creditLimitOverrides, setCreditLimitOverrides] = useState<Record<string, number>>({});
```

For Card Detail, preserve utilization:

```ts
const increase = overriddenLimit - card.creditLimit;
const effectiveAvailableCredit = card.availableCredit + increase;
```

Hide the Card Detail nudge and filter the `For you` opportunity when an override exists. The flow’s cancel returns to Card Detail unchanged; success applies the override and returns to Card Detail.

- [ ] **Step 6: Verify GREEN**

Run: `npm test -- --run tests/screens/credit-limit-offer-flow.test.tsx tests/chat/cz-chat-app-orchestration.test.ts`

Expected: PASS.

### Task 5: Integrated Consumption and Regression Coverage

**Files:**
- Modify: `tests/chat/co-apping-chat-assistant.test.tsx`
- Modify: `tests/screens/investment-product-chat-context.test.tsx`
- Modify: `tests/screens/credit-limit-offer-flow.test.tsx`

**Interfaces:**
- Consumes: public Co-Apping component behavior and screen callbacks only.
- Produces: regression evidence for stationary selection, semantic consumption, terminal branches, and handoffs.

- [ ] **Step 1: Add the investment-goal integrated walkthrough**

Click through all five steps with `typingDelayMs={0}`, assert every selected label disappears permanently, assert `Your goal plan`, then click `Explore matching funds` and verify the action callback target.

- [ ] **Step 2: Add the credit-limit integrated walkthrough**

Open the opportunity, select repayment impact, assert the impact action does not return, click Review offer, and verify exactly one `credit-limit-review` navigate action.

- [ ] **Step 3: Run all focused suites**

Run:

```powershell
npm test -- --run tests/chat/cz-chat-app-orchestration.test.ts tests/chat/co-apping-chat-assistant.test.tsx tests/screens/investment-product-chat-context.test.tsx tests/screens/credit-limit-offer-flow.test.tsx
```

Expected: all focused tests PASS with zero failures.

### Task 6: Browser Verification and Handoff Documentation

**Files:**
- Modify: `docs/platform-capability-map/README.md`

**Interfaces:**
- Produces: current behavior, evidence, and limitations.

- [ ] **Step 1: Verify investment goal on port 4001**

Walk `Start an investment goal` through all five choices, confirm the recap reflects exact choices, selected actions do not return, and `Explore matching funds` opens the collection matching the selected risk comfort without rendering `Our funds selection` first.

- [ ] **Step 2: Verify credit limit on port 4001**

Walk `I'm interested` → repayment impact → Review offer → terms → PIN/sign → success → Card Detail. Confirm the offer and nudge disappear and Free to Spend increases by 5,000 CZK for the session.

- [ ] **Step 3: Update handoff and capability docs**

Record changed files, design decisions, exact commands/results, mock/session boundary, browser evidence, and remaining warnings. Add no new banana unless verification reveals one.

- [ ] **Step 4: Run the final gate**

Run: `git diff --check && npm run verify`

Expected: exit code 0; TypeScript, ESLint, all tests, six audits, and production build pass. Existing documented Recharts jsdom and chunk-size warnings may remain.
