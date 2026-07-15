# Investments Portfolio Consistency Design

## Goal

Make the Mobile PI Investments portfolio internally consistent in every supported country: the same mocked owned positions must drive the Performance list, total value, return, distribution tabs, category drill-down, product detail and generated history.

## Scope

- Applies to the Mobile PI Investments experience for every supported country configuration.
- Replaces the current five-position portfolio seed with twelve owned securities: ten active positions and two inactive legacy positions.
- Preserves the existing UI layout, navigation and catalogue-only products. No APIs, persistence or dependencies are added.

## Canonical portfolio model

`investmentsPortfolioConfig.ts` owns one canonical portfolio seed. Each seed contains its display status, portfolio allocation weight, instrument currency, product type, asset class, securities account, market price, contribution type and performance percentage.

The ten active positions carry all of the financial value. Their type allocation is fixed and sums to 100%:

| Product type | Active positions | Portfolio allocation |
| --- | ---: | ---: |
| Fund | 4 | 38% |
| Bond | 2 | 22% |
| Stock | 2 | 16% |
| ETF | 1 | 14% |
| Money market | 1 | 10% |

The two inactive positions are closed/demo holdings. Their local portfolio value and performance amount are zero; they remain visible in `INACTIVE SECURITIES` and the owned catalogue, but never contribute to financial aggregates.

## Derived values

For each country:

1. Read the existing investment-account balance as the portfolio total and its country currency.
2. Allocate that total among active positions by their weights, with the final active position receiving the rounding remainder.
3. Convert each local position value to its instrument currency.
4. Calculate quantity as `instrument value / market price`; the product detail therefore maintains `market price × quantity = instrument value` within two-decimal display precision.
5. Calculate performance amount as `local value × performance percentage`.

`Total value`, `Performance` and the portfolio chart use active positions only. The weighted performance percentage is derived from the same active local values and performance amounts.

## Distributions and drill-down

All distribution tabs group the active positions only:

- Product type: four Funds, two Bonds, two Stocks, one ETF and one Money market.
- Currency: grouped by the actual instrument currencies assigned to those positions.
- Asset class: grouped by the seed asset-class values.
- Account list: grouped by the assigned securities account IDs and names.

Every item value is the sum of the matching active position values, and the display percentage is normalized to the same active portfolio total. Clicking a donut item continues to open the existing category detail screen; it lists exactly the active positions that generated that item and shows a matching total.

## Screens that reuse the model

- Performance renders ten active cards and two inactive cards; the `ALL PRODUCTS` count is twelve.
- The investment catalogue reuses all twelve owned securities for the owned list/details, then keeps the existing catalogue-only offers as non-owned products.
- Product detail uses the canonical market price, quantity, instrument value, local portfolio value, return, account and update date.
- Generated investment history uses active positions only, avoiding transactions for closed zero-balance demo holdings.

## Verification

The implementation will add a no-dependency portfolio-consistency audit script. It will build representative country portfolios and assert:

- exactly ten active and two inactive owned securities;
- active local values equal the source investment total;
- inactive local values and performance amounts equal zero;
- each distribution tab sums to the active total and 100%;
- every active instrument value equals market price multiplied by quantity at display precision;
- category grouping counts are 4/2/2/1/1 for Funds/Bonds/Stocks/ETF/Money market.

The normal build, template audit, platform audit and diff check remain required.

## Decisions

- `12 products in total` means 10 active owned positions plus 2 inactive owned demo positions.
- Inactive products are deliberately excluded from all financial aggregates so the dashboard remains truthful to the active portfolio.
- Country differences are limited to locale and portfolio currency conversion; product taxonomy and the portfolio story remain stable across Mobile PI countries.
