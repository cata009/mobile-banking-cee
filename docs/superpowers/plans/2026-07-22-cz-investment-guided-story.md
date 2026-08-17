# CZ Investment Guided Story Implementation Plan

Status: executed on 2026-07-22. Fine-tuning after the initial pass added per-conversation consumed-option filtering and compressed, client-oriented copy. The final headings and density limits in the approved design spec supersede the illustrative strings below.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the selected-investment chat's circular, technical follow-ups with an informative, personalized, commercially useful guided story that has an explicit terminal closeout.

**Architecture:** Keep deterministic routing inside `buildCzChatSmartReplyResolver`. Add new user-facing phrases as aliases while retaining legacy phrases, reuse the current investment cards and buy prompt, and model closeout as a final assistant reply with no follow-ups.

**Tech Stack:** TypeScript, React chat message contracts, Vitest.

## Global Constraints

- Preserve Product Detail choices `Explain this product` and `Review my performance`.
- Inform first, personalize second, expose the commercial action after useful context.
- Do not add a PDF viewer, route, dependency, or fake document-opening action.
- Preserve catalogue-only behavior, the non-advisory boundary, and the existing buy review, terms, and signing flow.
- Do not commit unless the user explicitly requests it; use diff checkpoints instead.

---

### Task 1: Lock the guided-story contract with failing tests

**Files:**
- Modify: `tests/chat/cz-chat-app-orchestration.test.ts`

**Interfaces:**
- Consumes: `buildCzChatSmartReplyResolver(...)` and `InvestmentCatalogSecurity`.
- Produces: executable expectations for labels, headings, closeout, and compatibility.

- [ ] **Step 1: Replace the old explain-follow-up expectation**

```ts
expect(explanation.followUps?.map((item) => item.label)).toEqual([
  "How is it doing for me?",
  "What could affect my return?",
  "Show me the essentials",
]);
```

Map those labels to `### Your position at a glance`, `### What can move your return`, and `### Check these 3 things`.

- [ ] **Step 2: Add closeout and overview-return tests**

```ts
const closeout = await resolveReply("I have what I need for UniCredit Balanced Income Fund.", []);
expect(closeout.text).toContain("### All set");
expect(closeout.text).toContain("Nothing was ordered or changed");
expect(closeout.followUps).toBeUndefined();

const overview = await resolveReply("Give me the product overview for UniCredit Balanced Income Fund.", []);
expect(overview.text).toContain("### A quick look at UniCredit Balanced Income Fund");
```

- [ ] **Step 3: Add owned/catalogue commercial-label tests**

For owned products expect `Explore adding more`; for catalogue-only products expect `Explore investing`. Both retain the exact `Start a buy order for <product>` action prompt.

- [ ] **Step 4: Run the focused tests and confirm RED**

Run `npm test -- tests/chat/cz-chat-app-orchestration.test.ts -t "selected investment"`.

Expected: failures showing old labels/headings and missing closeout.

---

### Task 2: Implement guided copy, aliases, actions, and closeout

**Files:**
- Modify: `src/app/chat/czChatOrchestration.ts`
- Test: `tests/chat/cz-chat-app-orchestration.test.ts`

**Interfaces:**
- Consumes: selected-security fields, `buildCzChatFollowUp`, `showSelectedInvestmentCardOnce`, and the existing buy prompt.
- Produces: the guided-story graph without a new message type.

- [ ] **Step 1: Make the explanation canonical and generic**

Use `assetClass`, `productType`, `instrumentCurrency`, `localCurrency`, and `liquidity`; remove the balanced-fund assumption. Use heading:

```ts
`### A quick look at ${selectedInvestmentSecurity.title}\n`
```

Keep the current explanation card/chart and expose only the three approved labels.

- [ ] **Step 2: Rewrite performance**

Use owned heading `### Your position at a glance`, retain `richBlocksPosition: "before-text"`, interpret direction/portfolio share/currency, and return:

```ts
[
  commercialFollowUp,
  buildCzChatFollowUp("cz-investment-product-portfolio", "See portfolio fit", portfolioPrompt),
  buildCzChatFollowUp("cz-investment-product-risk", "What could affect my return?", riskPrompt),
  buildCzChatFollowUp("cz-investment-product-done", "I'm done", donePrompt),
]
```

- [ ] **Step 3: Rewrite risk in customer-impact language**

Use `### What can move your return` and four bold dimensions: `Markets`, `Currency`, `Access`, and `Costs`. Follow with portfolio fit, key-document summary, commercial action, and closeout.

- [ ] **Step 4: Replace the document inventory with essentials**

Recognize new and legacy document phrases. Use `### Check these 3 things` and cover `Potential gain or loss`, `Total cost`, and `Access to money`.

```ts
{
  type: "product-cards",
  title: "Key information at a glance",
  body: "",
  variant: "compact",
  interactive: false,
  products: [{
    id: "kid-kiid",
    title: `${selectedInvestmentSecurity.title} — KID/KIID`,
    subtitle: "Risk, scenarios, costs and access",
    meta: "Summary in chat · Source document",
    tone: "neutral",
    icon: "app:account-option-statement",
  }],
}
```

- [ ] **Step 5: Add overview and closeout routing before the generic catch-all**

Recognize `product overview for` in the explain branch and return this terminal reply for the product-specific done prompt:

```ts
{
  text:
    `### All set\n` +
    `You covered the product, its performance, key risks, and essential facts. Nothing was ordered or changed.`,
}
```

- [ ] **Step 6: Align portfolio, checklist, and generic follow-ups**

Keep legacy prompts resolvable, but stop surfacing `What should I consider?`, `Review risk`, and `What documents matter?` from the guided graph.

- [ ] **Step 7: Run focused GREEN**

Run `npm test -- tests/chat/cz-chat-app-orchestration.test.ts`.

Expected: all orchestration tests pass.

---

### Task 3: Align UI contract tests, docs, and evidence

**Files:**
- Modify: `tests/chat/co-apping-chat-assistant.test.tsx`
- Modify: `docs/platform-capability-map/README.md`

**Interfaces:**
- Consumes: new labels/prompts from Task 2.
- Produces: UI regression coverage and repository handoff evidence.

- [ ] **Step 1: Update component click cases**

```ts
[
  ["How is it doing for me?", "How is UniCredit Balanced Income Fund doing for me?"],
  ["What could affect my return?", "What could affect my return from UniCredit Balanced Income Fund?"],
  ["Show me the essentials", "Show me the essential information I should check for UniCredit Balanced Income Fund."],
]
```

Keep all pointer-drag regressions unchanged.

- [ ] **Step 2: Run both chat suites**

Run `npm test -- tests/chat/cz-chat-app-orchestration.test.ts tests/chat/co-apping-chat-assistant.test.tsx`.

Expected: both pass with only already-triaged Recharts jsdom warnings.

- [ ] **Step 3: Update handoff and capability docs**

Record `Understand -> Evaluate -> Act`, exact labels, terminal closeout, legacy compatibility, tests, browser evidence, and the non-goal of a fake document route.

- [ ] **Step 4: Run full verification**

Run `npm run verify`.

Expected: typecheck, lint, all Vitest files, six audits, and the production build pass.

- [ ] **Step 5: Verify the live demo on port 4001**

Exercise `Product Detail -> Explain this product -> all three branches -> Back to product overview -> I'm done`, then reopen and use `Explore adding more`.

Expected: distinct answers, no dead options, closeout with no chips, and a handoff into the existing buy flow.

- [ ] **Step 6: Review the diff without committing**

```bash
git diff --check
git status --short
git diff -- src/app/chat/czChatOrchestration.ts tests/chat/cz-chat-app-orchestration.test.ts tests/chat/co-apping-chat-assistant.test.tsx docs/platform-capability-map/README.md
```

Expected: only intended guided-story changes plus previously existing unrelated workspace edits.

---

### Task 4: Add an explicit pre-review confirmation

**Files:**
- Modify: `tests/chat/cz-chat-app-orchestration.test.ts`
- Modify: `src/app/chat/czChatOrchestration.ts`
- Modify: `docs/platform-capability-map/README.md`

**Interfaces:**
- Consumes: the existing selected security, quantity/account parsers, `buildInvestmentBuyOrderQuote`, `getInvestmentBuyOrderValidation`, and `CoAppingFollowUpSuggestion` action contract.
- Produces: send-message timing choices and a `Ready to review` reply whose `Review order` action is the only `investment-buy` navigation.

- [ ] **Step 1: Rewrite the orchestration expectation to require a bridge**

For both timing values, assert that the timing chip is `send-message`, its resolver reply starts with `### Ready to review`, the summary contains product, quantity, masked account, timing, and estimated debit, and its actions are exactly `Review order`, `Change timing`, `Change account`, and `Change quantity`. Assert that only `Review order` is a navigate action carrying the exact validated draft.

- [ ] **Step 2: Run the focused test and confirm RED**

Run `npm test -- tests/chat/cz-chat-app-orchestration.test.ts -t "pre-review confirmation"`.

Expected: failure because the current timing chips navigate directly and no `Ready to review` reply exists.

- [ ] **Step 3: Implement the minimal resolver bridge**

Replace each timing navigate action with a send-message prompt that preserves timing, quantity, product title, and compact account identity. Recognize that prompt before the existing account-selection branch, rebuild and validate the quote, then return the confirmation and four actions. Reuse the existing navigate draft without changing `App.tsx` or the Investments coordinator.

- [ ] **Step 4: Run focused GREEN and the complete orchestration suite**

Run `npm test -- tests/chat/cz-chat-app-orchestration.test.ts`.

Expected: every orchestration test passes for both timing options.

- [ ] **Step 5: Verify live behavior and repository health**

Exercise both `Today` and `Next business day` on port 4001. Each must remain in chat until `Review order`; each change action must return to its corresponding step. Run `npm run verify`, update behavior docs with evidence, and finish with `git diff --check` without committing.

---

### Task 5: Enforce option consumption in the shared chatbot

**Files:**
- Modify: `tests/chat/co-apping-chat-assistant.test.tsx`
- Modify: `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx`
- Modify: `docs/platform-capability-map/README.md`

**Interfaces:**
- Consumes: stable `CoAppingChatAction.id` values and `CoAppingFollowUpSuggestion.id` fallbacks.
- Produces: a conversation-scoped consumed-ID set that filters every later follow-up shelf before rendering.

- [ ] **Step 1: Add a component regression that deliberately repeats an action ID**

Return the selected action again in the next resolver response together with a new action. Assert that the selected option is absent and the new one remains available.

- [ ] **Step 2: Run the focused test and confirm RED**

Run `npm test -- tests/chat/co-apping-chat-assistant.test.tsx -t "consumes selected options globally"`.

Expected: the repeated action is still rendered by the current component.

- [ ] **Step 3: Implement conversation-scoped consumption**

Consume an option before dispatch, filter `activeFollowUps` by action ID with suggestion-ID fallback, and reset the set for new, contextual, and saved conversations. Navigation actions use the same guard. Dragging remains non-consuming.

- [ ] **Step 4: Run focused and full verification**

Run both chat suites, `npm run verify`, live browser verification on port 4001, and `git diff --check`. Record evidence in the handoff and capability docs without committing.
