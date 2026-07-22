# Investment Goal and Credit Limit Completion Design

Date: 2026-07-22
Status: approved

## Objective

Complete the two CZ Future chatbot journeys that currently stop at informational copy:

1. `Start an investment goal` becomes a stateful planning path that hands the customer directly to the matching existing Funds collection and then to the existing fund-detail and BUY flow.
2. `New credit limit for you` becomes a complete mock authenticated review, sign, and success flow that updates the selected credit card for the current demo session.

Both journeys must consume selected actions, avoid semantic duplicates and circular branches, offer an explicit exit, and remain honest about mock/session-only behavior.

## Investment Goal Journey

The conversation collects one value per step:

1. Purpose: grow savings, future purchase, or long-term reserve.
2. Horizon: 3–5 years, 5–10 years, or undecided.
3. Starting amount: 5,000 CZK, 10,000 CZK, or undecided.
4. Monthly contribution: 500 CZK, 1,000 CZK, or none for now.
5. Risk comfort: prefer less movement, balanced, or accept more movement.

Visible labels may stay concise, but prompts must be context-qualified (`Set investment goal horizon to ...`, `Set investment goal starting amount to ...`) so identical phrases such as `Not sure yet` cannot be routed to the wrong step.

The resolver derives the current goal draft from user-message history. It must preserve prior answers and render a final `Your goal plan` recap containing all five selections. The illustrative projection must be generated from the selected starting amount, monthly contribution, and horizon rather than always claiming 10,000 CZK plus 1,000 CZK monthly. Undecided values produce an honest range/next-step explanation instead of invented inputs.

The final primary action is `Explore matching funds`. It closes chat and opens the existing collection that matches the selected comfort label: `Prefer less movement` -> `Conservative funds`, `Balanced` -> `Balanced funds`, and `Accept more movement` -> `Equity funds`. The generic `Our funds selection` storefront remains the portfolio discovery banner's destination, but is intentionally bypassed here because the goal flow already collected matching context. The existing collection, security detail, BUY, Review Data, Sign, and Success path remains the only transactional authority. A terminal `I'm done` action closes the conversational graph without creating or persisting a goal.

## Credit Limit Journey

The `I'm interested` action opens a short explanation with three outcomes:

- `Check repayment impact` provides decision support once.
- `Review offer` hands off to the authenticated mock flow.
- `Not now` ends the conversation without changing the card.

The authenticated mock flow reuses the existing standard banking-flow composition:

1. Review: selected credit card, current limit, proposed limit, increase amount, important conditions, and a terms-acceptance toggle.
2. Sign: standard PIN authorization screen.
3. Success: confirmation receipt and return to Card Detail.

Only successful signing applies the limit. Back, close, or cancellation leaves the card unchanged. On success, the current-session product view adds the approved increase to both credit limit and available credit, preserving the card’s utilized amount. The Card Detail nudge and the `For you` credit-limit opportunity disappear for that card during the session. Reload restores source mock data and may show the opportunity again.

## Navigation and State

Extend the portable action target contract with:

- `investment-funds`: opens either a requested Funds collection or, when no collection metadata is supplied, the generic Funds storefront inside Investments.
- `credit-limit-review`: starts the local credit-limit flow for the current credit card.

Investment goal state remains conversation-derived and does not create a new application store. Credit-limit acceptance is application-owned session state because it changes the card view after chat closes. The portable chat package remains independent of application screens and data stores.

## Consumption and Loop Prevention

- Every semantic choice has one stable action ID across the whole journey.
- Alternative surfaces reuse that same ID instead of minting suffix variants for the same action.
- Successful stationary selection consumes the action globally for the active conversation.
- Dragging or merely displaying an action never consumes it.
- Informational branches converge on the unconsumed primary continuation or terminal exit.
- Completed flows expose no follow-up that returns to a completed step.
- New conversations reset conversational consumption; an accepted session-level credit offer stays unavailable until reload.

## Error and Boundary Handling

- If no credit card is available, the offer cannot start and the assistant explains that no eligible card is in context.
- If the investment catalogue is empty, `Explore matching funds` falls back to the Investments overview rather than showing a broken route.
- The comfort-to-collection mapping is deterministic demo routing, not a suitability or recommendation decision.
- The projection is illustrative, not advice or a guarantee.
- No persisted goal, credit decision, backend eligibility check, document archive, or real authorization is claimed.

## Verification

- Resolver RED/GREEN tests cover the complete investment-goal sequence, ambiguous `Not sure yet`, selected-value recap, dynamic projection, and terminal actions.
- Assistant integration tests prove semantic actions are consumed and do not reappear.
- App/screen RED/GREEN tests cover both navigation handoffs, credit-limit review gating, cancellation, signing, success, session update, and opportunity removal.
- Existing Investments BUY and chatbot tests remain green.
- Browser smoke on port 4001 walks both journeys through their implemented endpoints and checks for runtime errors.
- Final workspace gate is `git diff --check && npm run verify`.

## Explicit Non-Goals

- No production recommendation engine or suitability decision.
- No persisted investment goal.
- No backend credit underwriting or permanent limit change.
- No new fund recommendation ranking or suitability engine.
- No unrelated chatbot or card-settings redesign.
