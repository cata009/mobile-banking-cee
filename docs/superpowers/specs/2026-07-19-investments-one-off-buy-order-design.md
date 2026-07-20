# Investments One-Off Buy Order Design

Date: 2026-07-19
Status: approved for implementation
Figma source: `Investments - CEE - DBN`, file `Lteu53v7vtyt7UqM64HuMq`, BUY section `9266:51340`

## Goal

Complete the Mobile PI Investments purchase journey for a one-off buy order in every supported country: Romania, Czechia, Slovakia, Hungary, Serbia, Bosnia and Herzegovina, Bosnia and Herzegovina BL, and Slovenia.

The customer journey is:

`Investment portfolio -> Invest -> Security list -> Product detail -> Buy order -> Review data -> Sign -> Success -> Investment portfolio`

## Figma Mapping

- Product detail: `9267:26417`; already represented by `InvestmentSecurityDetailScreen`.
- One-off buy order: `9267:83349`; new runtime screen.
- Review data references: `9267:65237` and `9266:51453`; consolidate their shared one-off content and reuse the current design-system patterns.
- Sign: reuse the standard Sign screen already used by payment flows.
- Success: reuse the standard Success pattern with investment-specific copy.
- Recurring investment screens and the legacy monthly examples in the Figma section are outside this scope.

## Architecture

The buy journey remains inside the Investments feature instead of adding global application routes. `InvestmentsPortfolioScreen` keeps the selected security and owns whether the buy flow is open. A focused `InvestmentBuyOrderFlow` component coordinates `order-data`, `review`, `sign`, and `success` steps.

Pure quote and validation logic lives in `investmentBuyOrderModel.ts`. The UI consumes this model and does not recalculate currency or validation rules inline.

The payment Sign and Success screens are generalized behind shared standard flow components. Existing payment exports remain wrappers, so payment behavior and route contracts do not change.

## Data Model

An `InvestmentBuyOrderDraft` contains:

- selected security id;
- security account id and label from the selected security;
- selected cash account id;
- quantity as the editable string and parsed positive integer;
- price type `MARKET`;
- frequency `ONE_OFF`;
- terms acceptance.

An `InvestmentBuyOrderQuote` contains:

- market price and product currency;
- quantity;
- estimated product amount;
- selected account currency;
- estimated debit amount converted with the existing exchange-rate authority;
- sufficient-balance result.

Cash-account candidates come from the current Mobile PI product snapshot. The first current account is selected by default. If its currency differs from the instrument currency, the review shows both the product amount and the estimated debit in the account currency. This keeps the flow usable for every country and security without inventing foreign-currency accounts.

## Screen Behavior

### Product Detail

The existing Buy action becomes interactive. Back behavior and the other action-bar items remain unchanged.

### One-Off Buy Order

The screen reuses `PageHeader`, `SectionHeadingDivider`, existing field typography, account selection through `BottomSheet`, and the standard primary button.

It shows:

- product evaluation and target-market status;
- product id, product type, indicative market price, and last update;
- fixed security account;
- selectable cash account;
- fixed price type `Market price`;
- editable quantity;
- frequency `One Off`;
- estimated order value and, when currencies differ, estimated debit value.

`Next` is enabled only when the quantity is a positive whole number and the selected account has sufficient balance.

### Review Data

The review screen shows the complete immutable order summary and the Figma purchase-information rows: Ex-Ante Costs, Documents, Important Information, and Disclaimer. Those rows are presentational entry points in this prototype. The Terms & Conditions toggle is mandatory before Buy becomes enabled.

### Sign

The standard PIN signing screen is reused. The mock flow accepts the existing masked PIN behavior and does not claim real strong-customer authentication.

### Success

The standard success layout displays investment-specific confirmation text: the order was accepted and can be reviewed from Investments History. The final CTA clears the local flow and returns to the Investments portfolio.

## Validation And Error Handling

- Empty, fractional, negative, zero, and non-numeric quantity values are rejected.
- Missing cash-account data disables progression and shows an inline explanation.
- Insufficient balance disables progression and shows the estimated debit required.
- Country and currency formatting uses `countryConfig` and the existing exchange-rate helpers.
- No backend call, persistence, balance mutation, or new History row is implied.

## Country Coverage

The implementation consumes the existing `CountryId`, country locale, local currency, product catalogue, and current-account data. No country-specific screen fork is introduced. Automated model coverage runs against `RO`, `CZ`, `SK`, `HU`, `RS`, `BA`, `BA_BL`, and `SI`.

## Testing

- Unit tests cover quantity parsing, quote calculation, FX conversion, insufficient funds, and all eight countries.
- Component tests cover Buy entry, validation, account selection, review, mandatory terms, Sign, Success, Back, and completion.
- Existing payment tests and verification gates must remain green after standard Sign/Success extraction.
- Browser smoke verifies the real path from Investments through Success on port 4004 with no warning or error logs.

## Documentation

Update the current-session handoff and capability map because the change adds visible Mobile PI Investments behavior. Record the mock-only and non-persistent limitations.

## Out Of Scope

- recurring investments;
- sell orders;
- backend order execution or persistence;
- real documents, suitability services, SCA, or balance mutation;
- new global routes or deep links;
- changes to the deterministic Investments History dataset.
