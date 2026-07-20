# Investment Product Chat Context Design

## Scope

Extend the isolated Czech Republic Future chatbot so opening it from an Investments security detail page gives the assistant the exact selected product context. The assistant must explain the product and the customer's visible position, discuss performance, risk, liquidity, and decision factors, and remain grounded in the deterministic demo data.

This is decision support, not regulated investment advice, suitability assessment, price prediction, or order execution.

## Context architecture

`InvestmentsPortfolioScreen` remains the owner of its local product-detail navigation. It exposes the current `InvestmentCatalogSecurity` through a new optional callback. `App` stores that typed snapshot and passes it to both existing CZ chat entry-context and smart-reply builders.

The investment configuration remains the single data authority:

```text
investmentsPortfolioConfig
        -> InvestmentsPortfolioScreen selected security
        -> App selected investment context
        -> CZ chat context + reply resolver
```

When no security is selected, the existing portfolio-level Investments suggestions and replies remain unchanged. Leaving the detail clears the selected context.

Rejected alternatives:

- Inferring the product from the rendered DOM is brittle and inaccessible to the orchestration layer.
- Looking up a second selected product inside the chatbot duplicates navigation state and can drift from the visible screen.

## Design-system mapping

| Required experience | Repository match | Decision |
|---|---|---|
| Right-edge chatbot launcher | `CoAppingChatLauncher` | Reuse |
| New-conversation contextual title/topics | `CoAppingChatContext` + current topic cards | Extend data only |
| Product answers and follow-ups | Existing smart-reply resolver and follow-up chips | Extend data only |
| Investment product source | `InvestmentCatalogSecurity` | Reuse canonical model |
| Product-specific chat card | Existing `investment-summary` rich block + shared `BrandLogo` | Extend backward-compatibly with optional logo/stack layout; no new component |

## Product-aware conversation

The detail context offers two focused entry points:

- explain the selected product;
- review the visible holding and performance;

Risk, liquidity, documents, portfolio fit, and decision checks remain available as contextual follow-ups after an answer instead of crowding the first screen. The two entry routes must render different product-grounded responses.

Answers reference the selected product name, ownership state, value, quantity, performance, market price, instrument currency, asset class, product type, risk level, liquidity, and last-update date where available. Catalogue-only products omit holding language and quantity.

Opinion-style questions receive a balanced decision framework tied to those facts. The assistant does not say buy, sell, or hold; it explains the evidence, uncertainty, official-document checks, and advisor/suitability boundary.

## Acceptance criteria

- Opening chat from an owned security detail shows exactly the product explanation and holding-performance suggested topics.
- The two entry topics resolve to visibly different, product-grounded answers.
- Explain defines the product structure, diversification, principal risks, dealing model, and official-document boundary without repeating the customer's value, units, performance, or market price; those facts belong to Review performance.
- Responses name the exact visible security and use its current canonical values.
- Product summary cards reuse the Product Detail logo at `32x32`, omit the redundant eyebrow/navigation CTA, and render metrics as full-width stacked rows.
- The selected-product card appears only on the first answer that introduces that canonical product in a conversation; later follow-ups do not duplicate it.
- `Review performance`, `Review risk`, and `What documents matter?` each send their own product prompt and return a different scenario.
- Opinion/risk questions include a clear non-recommendation boundary and useful product-specific factors.
- Catalogue-only products are described without pretending the customer owns them.
- Returning to the portfolio restores existing portfolio-level chat behavior.
- Existing account/card/savings/loan/mortgage and Investments portfolio chatbot behavior remains backward-compatible.
