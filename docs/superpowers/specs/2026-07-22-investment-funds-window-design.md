# Investment Funds Window Design

## Goal

Turn the Investments portfolio fund-discovery banner into a complete, Figma-faithful browsing path: portfolio banner -> `Our funds selection` -> selected fund collection -> existing security detail.

## Figma authority

- Selection page: file `Lteu53v7vtyt7UqM64HuMq`, node `12673:55537`.
- Collection page: file `Lteu53v7vtyt7UqM64HuMq`, node `12673:56763`.
- Every decorative image is downloaded from the asset URLs returned by those nodes. No generated, stock, or visually similar substitutes are permitted.

## Architecture

- Keep both new pages inside `InvestmentsPortfolioScreen`, matching the existing local sub-screen model used by the securities catalogue, security detail, distribution detail, and buy order.
- Extend `InvestmentsFundBanner` with named Figma variants while preserving the current discovery banner as its default contract.
- Store the six collection definitions and deterministic catalogue selection logic in a focused investments configuration module.
- Reuse `PageHeader`, `AppIcon`, `BrandLogo`, the country formatter, the canonical investment catalogue, and the existing security detail/buy flow.

## Selection page

- Reuse `PageHeader` with title `Our funds selection`, Back, and Help.
- Render the Figma search action card and six `InvestmentsFundBanner` variants in this order: `Our Onemarket funds`, `Selection+ portfolios`, `Featured this month`, `Equity funds`, `Balanced funds`, `Conservative funds`.
- Each banner uses its exact Figma image and opens its own collection page.
- `Search funds` opens the existing full securities catalogue rather than a non-functional control.

## Collection page

- Reuse `PageHeader` over the Figma hero treatment.
- Show the selected collection title, subtitle, exact image, explanatory introduction, grouped `One-off investment` and `Regular investment` sections, counts, and clickable fund rows.
- Funds come from the existing country-aware investment security catalogue and are selected deterministically per collection. No new prices, IDs, or portfolio holdings are invented.
- Clicking a fund opens the existing `InvestmentSecurityDetailScreen`; its existing Buy/Review/terms/signing behavior stays authoritative.
- Keep the informational investment-risk disclaimer at the bottom.

## Design-system contract

- `InvestmentsFundBanner` owns all seven visual variants: the existing portfolio discovery version plus the six Figma collection versions.
- The Design System specimen renders the variant family, so every image/title combination can be inspected in one place.
- The existing component registry ID and component detail entry remain stable.

## Verification

- TDD regression for the six selection options, correct collection opening, grouped fund rows, and row-to-detail callback.
- Existing component/registry and investment tests remain green.
- Full `npm run verify` and live browser smoke on port `4001`.
