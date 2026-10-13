# PI Italy Mobile First securities and markets

Owner: `/root/investment_securities`. Checkout: `C:\Users\mihai\Desktop\Mobile Banking - CEE`. Base: `538360ead4a6da9ae889f142f8d00e333f99412b`. Initial changes and exact allocated paths are recorded in `pi-italy-mobile-first-investments-securities-ownership.json`. All edits are new securities-owned files. No shared App, Home, registry, package, index or branch changes were made.

Source: Figma `d2TyUaQNN6YsgznQaWymIR`, INVESTMENTS page `24262:641750`. The parent inventory records the whole page. The page-level context request failed; concrete frames and sparse response child batches provided design code and screenshots. Angular `ActionableItemComponent` is absent from this React project. Native controls and the shared InvestmentPage/Amount/Button/Rows/Tabs compose the implementation.

## Runnable family coverage

| Source section / anchors | Native entry | Behavior and source states |
| --- | --- | --- |
| 661842; 662029, 661886 → children 661899/661918/661923 | portfolio (embedded), position, deposit | Deposit/subdeposit selection; collapsed categories; base/advanced positions; position details; buy/sell/AUCAP access; zero holdings/no deposit; amount masking. |
| 662924; 663052, 663177, 662935 | orders | Orders/movements, pending/executed/cancelled records, detail, security-sheet link, cause/status/date filters and reset, cancellation confirmation/success, empty results. New signed transactions create history entries. |
| 664278; 664307 → 664322/664334/664343/664356/664362/664373; 664699 | markets, indices, index-detail, composition, news, news-detail, calendar | Index carousel/regions, index detail and composition, themes/search, watchlist, auctions, news/Apple article, dividends/month selection, commodity/rate/currency details, unavailable chart/retry. |
| 665125; 665178, 665484, 665552, 666397, 665714, 665795, 665988, 666033 | security | Equity overview/analyst valuations/news/book/company; bond details/statistics; ETF and certificate details; market choice, period controls, advanced chart, watchlist/virtual entry; loading/partial/error/retry. Source logos/charts/dividers remain local assets. |
| 668031; 669489, 669776, 669843 | transaction, buy/sell | Deposit, execution market, quotes/book levels, quantity, limit/market price, quantity condition, expiry, conditional trigger; quantity/liquidity/price/date validation; document acknowledgements; detailed review; Mobile Code/error; success/history; close confirmation. |
| 670531; 670532, 670914, 670958, 671039, 671077, 671102 | search | Description/symbol/ISIN search, recent searches/delete/reset, asset class, base/advanced results; market/ESG/yield/performance/maturity/underlying/distribution/strike/call-put/consensus/sort filters; invalid ranges and empty results; funds handoff. |
| 673289; 673292, 673399, 673499 | virtual | Portfolio create/rename/delete confirmation, holdings and transaction tabs, instrument search, selected-portfolio purchase/sale, current/manual price, quantity/holdings validation, weighted cost and transaction records. Virtual trades do not create bank orders. |
| 674116; 674272, 674288, 674523, 674615, 674645 | transaction action aucap | Eligibility acknowledgement, remaining rights, positive/integer/multiple-of-12/remaining-rights guards, expected shares/value, review/documents/signing, sent result/history. |
| 674680; 674710, 675041 | watchlist | List create/rename/delete, instrument add/remove/duplicate confirmation, empty states, ten-list/twenty-instrument limits, selection from a security sheet. Names and valid nested structures are validated before saved state is restored. |
| 779711; 779767, 779850 | auctions | Auction cards, documents, empty/retry, nominal amount/minimum/multiple-of-1000/liquidity guards, subscription review and signing/history. |
| 779975; 779978, 780094 | assembly | Source companies/venues/dates, owned-share limits, convocation selection, review warning, Mobile Code/error, request success and ticket counts. Zero holdings has no eligible assemblies. |
| 675785; 675786, 675864, 675943, 676022, 676100, 676179 | transaction buy; deposit/subdeposit selection | Registered-security notice, joint subdeposit block with exact source warning/icon, closed-popup correction, eligible individual subdeposit notice, fresh document acknowledgements after any payload change, validation again before signing. TradeDraft and new order records carry the selected deposit/subdeposit. |

The source page’s variants are represented by parameterized interactive states, not 673 independent exported screens. This document does not assert per-frame pixel parity or that every source datum has been separately reproduced. The reused chart assets are fixed source snapshots; changing period/year selects the native state but does not fetch new market data. Non-Apple company descriptions and non-Apple news article bodies are concise local fixture content. All flows are local simulations, with demo Mobile Code `123456`; there is no live trading backend, production legal PDF delivery or banking signature provider. Deposit opening is a source-supported selector plus `services/advisory` handoff; no new deposit onboarding was invented.

## Contract and corner-state access

Default export `MobileFirstInvestmentSecurities({view,instrument?,action?,embedded?,onNavigate,onClose})`. `instrument` accepts canonical ID, exact name or ISIN, including advisory Enel `IT0003153852`. Cross-area navigation uses `{area:'funds',view:'search'|'catalog'}` and `{area:'services',view:'advisory'}`. Internal route/back history keeps the parent portfolio context. Virtual purchases receive the selected portfolio ID.

Root views: `portfolio`, `deposit`, `position`, `security`, `markets`, `search`, `orders`, `watchlist`, `virtual`, `auctions`, `assembly`, `transaction`. Actions for transaction: `buy`, `sell`, `auction`, `aucap`, `virtual-buy`, `virtual-sell`. `action='empty'` initializes empty lists/history or renders no auctions. `watchlist` supports `limit-lists`, `limit-instruments`; instrument adds use `action='add'`. `markets/index-detail` support `chart-unavailable`; `security` supports `loading`, `partial`, `error`, each with retry. Demo investment count zero follows the shared feature holdings policy and renders no holding/deposit state.

Persistence: versioned localStorage key `mf-it-securities-v1`; full nested shape, finite values, allowed enums, known security IDs, uniqueness and list bounds are checked. Corrupt or stale data falls back to a fresh demo. Storage denial leaves working session state.

## Verification

- `npx vitest run tests/screens/mobile-first-investments-securities.test.tsx --maxWorkers=1`: 21/21 passed, including chart privacy, held-position valuation, three payload-change acknowledgement cases and blocked/eligible registered-security purchase.
- `npx tsc --noEmit --project docs/tasks/pi-italy-mobile-first-investments-securities-tsconfig.json`: passed. This config inherits the repository’s strict compiler settings and checks owned files plus transitive dependencies.
- Scoped ESLint with `--max-warnings 0`: passed.
- `npm run audit:modules`: passed (232 files at run time).
- All 25 provided assets downloaded non-empty with recorded SHA-256/root dimensions. All are referenced by native source slots; SVG root geometry is not overridden. The new warning icon retains its 40×40 SVG geometry. Chart privacy masks numeric labels while keeping graph asset geometry. Provenance and verification metadata are in the securities asset JSON files.
- Repository-wide typecheck was attempted during concurrent edits and failed in unrelated in-progress profile files. Integration owner runs final `npm run verify` after all editors finish.
- Parent owns final browser/combined visual QA. The worker has inspected Figma reference screenshots and asset geometry; this does not substitute for the parent’s final rendered browser comparison of every affected representative screen.
