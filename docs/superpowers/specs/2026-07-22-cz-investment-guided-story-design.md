# CZ Investment Chat Guided Story Design

Date: 2026-07-22
Status: implemented and fine-tuned

## Objective

Turn the selected-investment `Explain this product` conversation into a management-demo story that proves three things in sequence:

1. the assistant explains a financial product in plain language;
2. it connects the explanation to the customer's actual holding and portfolio;
3. after providing value, it offers a natural commercial next step without presenting personalized investment advice.

The approved narrative is `Understand -> Evaluate -> Act`. The assistant informs first and earns the right to sell.

## Scope

This iteration changes the CZ Future chatbot conversation for a selected Investments security. It preserves the two existing entry choices on Product Detail:

- `Explain this product`
- `Review my performance`

It redesigns the answer and follow-up graph reached through those choices. It does not add a PDF viewer, a new screen, a new route, persistence, or a real document download. Existing buy review, terms, and signing boundaries remain unchanged.

## Explain-product response

The response must be grounded in the canonical selected security rather than assuming every security is a balanced fund. It uses the security description, asset class, product type, instrument currency, liquidity, local currency, and ownership state.

The final response structure is intentionally compact:

1. heading: `A quick look at <product name>`;
2. one-line asset-class, product-type, and instrument-currency explanation;
3. `Why it may fit` plus a short capital/liquidity caution;
4. one personalized currency sentence when instrument and local currencies differ;
5. the existing product summary and chart, rendered once per conversation;
6. one compact information-only boundary.

The three follow-ups become:

| Label | Prompt intent | Destination |
| --- | --- | --- |
| `How is it doing for me?` | Interpret the current holding snapshot | Performance branch |
| `What could affect my return?` | Explain market, currency, liquidity, and cost drivers | Risk branch |
| `Show me the essentials` | Summarize the important product-document facts inside chat | Essentials branch |

Legacy labels and prompts remain recognized so existing conversations and tests do not fall into the generic resolver.

## Performance branch

Heading: `Your position at a glance` for an owned security, otherwise `Product snapshot`.

The existing card remains before the explanatory copy and owns the exact holding value, quantity, performance, market price, and update date. The copy interprets those facts:

- whether the current snapshot is positive, negative, or flat;
- the position's approximate share of the current investment portfolio when available;
- instrument-currency versus local-currency exposure;
- no order is placed without review and signing.

Follow-ups for an owned product:

- `Explore adding more` -> existing conversational buy flow;
- `See portfolio fit` -> existing portfolio-context branch;
- `What could affect my return?` -> risk branch;
- `I'm done` -> terminal closeout response.

For a catalogue-only product, the commercial label is `Explore investing` and the assistant must not invent holding facts.

## Risk branch

Heading: `What can move your return`.

The reply translates technical dimensions into customer impact:

- `Markets`: the investments inside the product can rise or fall;
- `Currency`: instrument/local-currency movement can change the displayed result when currencies differ;
- `Access to money`: the canonical liquidity attribute and redemption rules determine timing;
- `Costs`: entry, ongoing, and exit costs reduce the customer's result.

It states that a summary risk label does not mean no loss and keeps the non-advisory boundary.

Follow-ups:

- `See portfolio fit`;
- `Summarize the key document`;
- `Explore adding more` or `Explore investing`;
- `I'm done`.

## Essentials branch

The user-facing entry label is `Show me the essentials`; subsequent references use `Summarize the key document`.

Heading: `Check these 3 things`.

The reply answers three customer questions instead of listing document types:

1. `Potential gain or loss` -> KID/KIID risk level and scenarios;
2. `Total cost` -> entry, ongoing, and exit charges;
3. `Access to money` -> canonical liquidity timing.

For an owned holding, it also mentions the trade confirmation and account statement as the sources for quantity and booked-value checks.

The existing non-interactive rich card becomes a friendly summary card:

- section title: `Key information at a glance`;
- document title: `<product name> — KID/KIID`;
- subtitle: `Risk, scenarios, costs and access`;
- metadata: `Summary in chat · Source document`.

It must not claim to open or download a document because no selected-product document route exists.

Follow-ups:

- `Explore adding more` or `Explore investing`;
- `See portfolio fit`;
- `Back to product overview` -> explain-product response;
- `I'm done`.

## Portfolio-fit branch

The existing portfolio calculation remains authoritative. Its copy continues to use holding share, largest holding, currency mix, and asset-class mix when available. Its follow-ups adopt the guided-story labels:

- `Explore adding more` or `Explore investing`;
- `What could affect my return?`;
- `Summarize the key document`;
- `I'm done`.

The legacy review-checklist prompt remains resolvable but is no longer surfaced as a primary guided-story option.

## Conversation closeout

`I'm done` sends a product-specific prompt and returns one terminal assistant answer with no follow-up chips:

- heading: `All set`;
- confirms that the user reviewed the product, return drivers, and essential facts;
- states that no order or product change was made;
- explains that the user can return to Product Detail or reopen the assistant later.

The assistant itself stays open so the standard close control remains predictable. Removing follow-up chips is the explicit end of the guided flow.

## Consumed-option behavior

Within one conversation, a selected branch is consumed and removed from all later suggestion shelves. The resolver derives visited topics from user-message history, so no new global state or persistence is required. `Back to product overview` returns only unvisited primary branches, while `I'm done` remains the terminal exit. Opening a new conversation resets the graph and restores all valid entry choices.

Consumption means selected, not merely displayed: an option remains available until the user chooses it.

## Global chatbot consumption contract

The shared chatbot component enforces consumption for every scenario, not only the selected-investment resolver. When the user explicitly selects a follow-up or action, its stable action ID (falling back to the suggestion ID) is consumed before the prompt or navigation is dispatched. Every later follow-up shelf in that conversation filters consumed IDs automatically, even if a resolver accidentally returns the same option again.

Dragging or merely displaying an option never consumes it. Manual free-text input does not impersonate an option selection. Starting a new conversation, entering a new contextual conversation, or opening a saved conversation creates a fresh consumption scope. This UI-level guard complements scenario-specific routing logic and prevents accidental infinite loops without coupling the reusable package to Czech investment copy.

## Buy-flow pre-review bridge

Selecting `Today` or `Next business day` must not navigate directly to Review Data. Both timing chips send a message back into the deterministic resolver. The assistant then renders a compact `Ready to review` confirmation containing the canonical product, whole-unit quantity, masked cash-account identity, selected execution timing, and estimated debit.

The confirmation exposes four actions:

- `Review order` -> the only navigate action; carries the same validated `investmentBuyDraft` into the existing Investments Review Data screen;
- `Change timing` -> returns to the timing choice for the same product, quantity, and account;
- `Change account` -> returns to cash-account selection while preserving product and quantity;
- `Change quantity` -> restarts quantity selection for the same product.

No order is placed from this confirmation. Review Data, terms acceptance, and signing remain unchanged. The bridge must work identically for `Today` and `Next business day`, including canonical balance validation before the confirmation is produced.

## Copy-density contract

The guided replies are client-oriented and deliberately short. Exact metrics remain in the rich card rather than being repeated in prose. Automated tests cap Explain at 650 characters, Performance and Risk at 550 each, and Essentials at 700. Portfolio fit, checklist, generic opinion, and closeout use the same benefit/impact/next-step voice and one compact information-only boundary.

## Compatibility and routing

New prompt phrases are added to the deterministic resolver without deleting legacy phrases. `Back to product overview` resolves through an explicit product-overview phrase. Commercial actions reuse the existing `Start a buy order for <product>` prompt and downstream quantity/account/timing/review flow.

No new navigation action or package boundary is introduced.

## Testing

Automated orchestration tests must prove:

- the explain response exposes exactly the three new primary labels;
- every new prompt resolves to its intended distinct heading;
- performance exposes the earned commercial CTA and no longer exposes the old checklist label;
- risk and essentials expose the approved guided-story actions;
- catalogue-only products use `Explore investing` and never claim a holding;
- `Back to product overview` returns the explanation branch;
- selected branches disappear from later suggestions inside the same conversation and reset in a new conversation;
- the four primary replies stay within their copy-density limits;
- `I'm done` returns `All set`, has no follow-ups, and says no action was taken;
- legacy prompt phrases still resolve correctly;
- the existing buy flow still begins with the selected product.
- timing selection stays in chat and produces `Ready to review` rather than navigating;
- only `Review order` carries the validated draft to Review Data;
- timing, account, and quantity can each be revised before navigation.

Browser verification must cover Product Detail -> `Explain this product`, all three primary branches, terminal closeout, and one commercial handoff into the existing buy flow.

## Non-goals

- personalized buy, sell, or hold advice;
- automated recommendations based on suitability;
- an actual KID/KIID PDF or preview screen;
- global Documents routing for product-specific documents;
- changes to the Investments product-detail UI outside the chat;
- changes to order review, terms, signing, or persistence.
