# Investment Chat Performance UX and Buy Handoff Design

Date: 2026-07-20
Status: Approved for implementation

## Goal

Improve the selected-investment performance answer so the product snapshot is primarily visual and the explanatory copy does not repeat the same holding value, quantity, performance, market price, or update date. Add a neutral, explicit handoff from that answer into the existing one-off Investments BUY flow for the exact product being discussed.

## UX Composition

The first selected-product performance answer that introduces the product uses this order:

1. The existing `investment-summary` card, including the canonical 32x32 product logo.
2. A short interpretation below the card.
3. The existing response-feedback controls.
4. Follow-up chips, including the purchase handoff.

The card remains the sole authority for the product snapshot:

- an owned position shows holding value and quantity, performance, and market price/update date;
- a catalogue-only product shows market price/update date, performance, and `Not held` ownership state.

The interpretation below the card must not repeat those figures. It explains only how to read the snapshot: the displayed return is period-specific, costs and currency movement can affect the customer's result, official documents remain authoritative, and the answer is not a personalized buy, sell, or hold recommendation.

The existing one-card-per-canonical-product conversation rule remains active. If the product card has already appeared earlier in the same conversation, later performance answers render only the non-duplicative interpretation and follow-ups.

## Purchase Action

The performance answer includes one purchase chip alongside the relevant risk/document/portfolio follow-ups:

- `Buy more` when the selected security is currently held with a positive quantity;
- `Buy` when the security is not held or has no positive position.

The purchase control stays in the follow-up shelf. It does not restore the previously rejected button inside the selected-product card and it does not describe the action as a recommendation.

Selecting the chip starts a short, deterministic conversation instead of leaving chat immediately:

1. the assistant confirms the canonical product and asks for a positive whole-unit quantity, with quick choices and free-text numeric entry;
2. after quantity validation, it lists the customer's canonical current accounts with currency and available balance and asks which cash account to debit;
3. after account and balance validation, it asks whether the one-off order should execute today or on the next business day;
4. the final timing choice closes chat and opens the existing `InvestmentBuyOrderFlow` directly on `Review Data`, prefilled with the exact security, quantity, cash account, one-off frequency, and execution timing;
5. terms acceptance, signing, success confirmation, and exit remain owned by the existing BUY flow.

Static data already known from Product Detail (product ID, security account, product type, asset class, market price, risk, and liquidity) is not asked again. The review screen remains the authoritative final summary and shows the collected execution timing alongside the existing product, quote, quantity, and account fields.

### Considered approaches

- **Recommended and selected: conversational collection plus typed draft handoff.** Reuses follow-up chips, free-text input, canonical product/account data, the quote model, and the existing Review/Sign/Success screens without introducing a second form.
- **Rich form embedded inside chat.** More visually compact, but would duplicate `TextField`, account sheet, validation, and order-state logic inside the portable assistant.
- **Immediate redirect with an empty or default draft.** Smallest implementation, but it is the behavior explicitly rejected because the assistant does not gather the customer's choices.

## Component and Contract Changes

The portable chat message contract gains an optional rich-block placement value. Its default remains the current text-first behavior, while the selected-product performance reply opts into card-first rendering. This keeps all existing assistant responses backward-compatible.

The chat action contract gains an Investments BUY target plus the canonical security identifier and an optional typed order draft required for a stable handoff. Existing navigation actions remain valid without those fields.

`App` translates only the final timing action into a one-shot Investments buy request and closes chat. `InvestmentsPortfolioScreen` consumes that request against its canonical security catalogue and current-account list, opens the selected product and BUY coordinator directly on Review Data, and acknowledges the request so it cannot replay on subsequent renders.

No duplicate BUY route, order model, or purchase component is created.

## Error and Edge Handling

- If the supplied security ID is absent from the current country catalogue, the app closes chat and returns to Investments without opening an incorrect product or BUY flow.
- Invalid, fractional, zero, or negative quantity input stays in chat and asks for a valid positive whole number.
- An unknown cash account or an account with insufficient converted balance stays in chat and offers the valid account/quantity choices again.
- The typed draft is accepted for direct Review only when quantity, cash-account ID, frequency, and execution timing are valid; otherwise the existing Order Data step opens safely instead of inventing replacements.
- Repeated clicks on the same consumed request do not reopen or reset an active order.
- A held security with zero quantity uses `Buy`, not `Buy more`.
- Named-product replies recovered from conversation history use the same canonical security ID as the live Product Detail context.
- Leaving Product Detail still clears volatile screen context; the action payload is sufficient for the one-shot handoff.

## Testing

Implementation follows RED-GREEN-REFACTOR and covers:

1. Renderer order: an opted-in message renders the investment card before formatted text, while a default message remains text-first.
2. Copy ownership: performance text does not repeat the card's holding value, quantity, performance, market price, or update date.
3. Action labels: positive owned quantity produces `Buy more`; catalogue-only/zero quantity produces `Buy`.
4. Action identity: the purchase chip carries the exact canonical security ID.
5. Conversation sequence: the purchase chip asks quantity, then cash account, then timing, with no navigation before the final answer.
6. Draft identity: the final timing action carries exact security, quantity, account ID, one-off frequency, and timing.
7. Integrated handoff: the final timing choice closes chat and opens Review Data for the correct held or catalogue-only product with the collected fields.
8. Safety: invalid quantity/account/balance/draft or an unknown security ID never opens another product or silently substitutes customer choices.
9. Regression: the selected-product card still appears only once per canonical product and existing product follow-ups remain distinct.

Focused chat and Investments suites run first, followed by TypeScript, ESLint, relevant audits, production build, and browser verification of the visible order and BUY transition.

## Scope Boundaries

This is a deterministic front-end demo handoff. It adds no personalized recommendation engine, suitability decision, live pricing, persistence, backend order execution, recurring investment order, or changes to the BUY flow's authorization boundary.
