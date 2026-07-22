# CZ Basket Funds Design

## Scope

Implement the Figma `FUND BASKET` section (`10738:58235`) inside the Investments securities catalogue only when `country === "CZ"`. The capability must be release-agnostic so current and future releases receive the same CZ behavior. Every non-CZ country keeps the existing catalogue unchanged.

## Catalogue experience

The CZ catalogue changes its large title to `Buy securities` and adds the Figma two-tab control: `All products` and `Regular Plan`. Search and the existing filters continue to operate on the securities list. Above `ALL SECURITIES`, render `BASKET FUNDS` with the correct count, a native horizontally scrollable/snap carousel of 260px cards, and `SEE ALL BASKET FUNDS`. Cards use the existing UniCredit `BrandLogo`, real buttons, and native scrolling so dragging never fires a card selection accidentally.

`All products` shows the one-off basket set and all matching securities. `Regular Plan` shows regular-investment baskets and recurrent securities. Search filters both the basket carousel and securities. Empty results use the existing catalogue empty state.

## Basket Funds page

Selecting a basket card or `SEE ALL BASKET FUNDS` opens a local `Basket Funds` page. It uses the shared PageHeader and Figma introductory copy, then groups the deterministic 20-item CZ catalogue into `ONE OFF INVESTMENT BASKETS` (6) and `REGULAR INVESTMENT BASKETS` (14). Each group initially shows four rows and has an independent `SEE MORE` / `SEE LESS` control. Back returns to the catalogue with its search/tab state preserved.

## Data and boundaries

Basket definitions live in a focused CZ-only config module and contain stable IDs, names, descriptions, contribution type, and logo ID. They are presentation data and do not create holdings, advice, suitability results, or executable orders. No dependencies or new assets are required.

## Verification

Automated coverage must prove CZ-only gating, current/future release independence through the country-only contract, tab/search behavior, carousel navigation, exact group counts, independent expansion, and Back restoration. Browser verification must cover CZ catalogue -> carousel -> Basket Funds -> expand/collapse -> Back and a non-CZ absence check.
