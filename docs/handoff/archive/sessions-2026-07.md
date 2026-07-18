# Session Archive 2026-07

Sessions moved out of `current-session.md` to keep the active handoff file readable.
135 sessions, newest first. Nothing was edited; entries are verbatim.

## 2026-07-13 Demo Header Play Icon Alignment

- Latest request handled: replace the demo header Play control with the supplied 24x24 circular SVG glyph and expose the same icon through the Design System inventory.
- Runtime changes: `AppIcon` now owns the custom `play` path with the supplied `0 0 24 24` viewBox, and `DemoTopBar` renders it at its native 24px size while preserving the shared 36px button slot.
- Files changed: `src/app/components/icons/AppIcon.tsx`, `src/app/components/demo/DemoTopBar.tsx`, handoff docs.
- Verification: `npm run build`, `npm run audit:templates`, `npm run audit:platform`, and `git diff --check`; browser smoke should confirm the header glyph and Design System inventory entry.
- safe to resume: yes

## 2026-07-13 Investments Negative-State Color Unification

- Latest request handled: make every negative/red value in Investments use the exact design-system red `#CF3524`.
- Runtime changes: Investments History transaction and order amounts now use `#CF3524` for negative states, matching the existing negative performance values, sell glyphs, and product-card negative percentages.
- Files changed: `src/app/screens/investments/InvestmentsHistoryScreen.tsx`, handoff/capability docs.
- Verification: `npm run build`, `npm run audit:templates`, `npm run audit:platform`, and `git diff --check`; browser smoke should confirm negative transaction/order values render with the exact RGB value.
- safe to resume: yes

## 2026-07-13 Investments Product Detail System-Bar Clearance

- Latest request handled: prevent the collapsed owned-product detail title from overlapping the phone system/status bar while scrolling.
- Runtime changes: `PageHeader` keeps the original initial layout, anchors the sticky header at `top: 0`, and reserves the phone safe area inside the header; the Investments product-detail header remains sticky below the status bar at deep scroll. The initial hero title remains visible and the compact title stays hidden until scroll collapse.
- Files changed: `src/app/components/PageHeader.tsx`, `src/app/screens/investments/InvestmentSecurityScreens.tsx`, handoff/capability docs.
- Verification: `npm run build`, `npm run audit:templates`, `npm run audit:platform`, and `git diff --check` passed. In-app browser smoke confirmed the sticky title remains below the status-bar bottom at deep scroll and no runtime errors were reported.
- safe to resume: yes

## 2026-07-13 Investments Catalogue Visual Consistency Fixes

- Latest request handled: make security-list logos true `32x32`, standardize positive Investments values to `#3D7D43`, and restore the catalogue header's large left-aligned initial state before scroll collapse.
- Runtime changes: `BrandLogo` now scales its authored SVG to the requested wrapper size; catalogue, detail, and chart positive values use the exact same green; the security list owns its scroll state so the shared `PageHeader` transitions from the large left title to the centered compact title.
- Files changed: `src/app/components/brand-logo/BrandLogo.tsx`, `src/app/screens/investments/InvestmentSecurityScreens.tsx`, `src/app/components/investments/InvestmentPortfolioChart.tsx`, handoff/capability docs.
- Verification: `npm run build`, `npm run audit:templates`, `npm run audit:platform`, and `git diff --check` passed. In-app browser smoke confirmed the initial 24px large left title, the centered 16px sticky title after scroll, exact `rgb(61, 125, 67)` positive text, and the scaled 32px logo wrapper (rendered at the phone's fit scale); no runtime errors were reported.
- safe to resume: yes

## 2026-07-13 Investments Distribution and History Overlay Fixes

- Latest request handled: remove the extra short leader segment from each distribution label, repair the custom interval calendar selectors, and keep the Apply filters sheet visible beneath the calendar overlay.
- Runtime changes: donut leaders now stop at the side rail before the label; calendar rows/cells/buttons use an explicit seven-column fixed grid with stable sizing and visible day text; `Select interval` is rendered as a layered overlay above `Apply filters` with a translucent backdrop.
- Files changed: `src/app/components/investments/InvestmentDistributionChart.tsx`, `src/app/screens/investments/InvestmentsHistoryScreen.tsx`, handoff/capability docs.
- Verification: `npm run build`, `npm run audit:templates`, `npm run audit:platform`, and `git diff --check` passed. In-app browser smoke confirmed clean donut leaders, visible September 2025 day selectors including selected day 15, the Apply filters sheet visible behind the calendar, and no runtime console errors.
- safe to resume: yes

## 2026-07-13 Investments Product Detail Data Corrections

- Latest request handled: remove the detail Help icon, replace the hardcoded hero date with the security's generated last-update date, and align the owned-detail hero amount with the client-portfolio value shown in `MY SECURITY`.
- Runtime changes: product detail passes `showHelp={false}` to the shared PageHeader; the hero now renders `(last update ...)` from `security.lastUpdate`; owned products display `localValue`/`localCurrency` in the hero while catalogue-only products retain their instrument amount/currency.
- Files changed: `src/app/screens/investments/InvestmentSecurityScreens.tsx`, handoff/capability docs.
- Verification: `npm run build`, `npm run audit:templates`, `npm run audit:platform`, and `git diff --check` passed. In-app browser smoke confirmed no visible Help action, generated `last update 03.01.2026`, and an owned hero value of `3.116,77 RON` matching `MY SECURITY`.
- safe to resume: yes

## 2026-07-13 Investments Visual Feedback Fixes

- Latest request handled: refine Investments charts and product-detail visual behavior from browser comments without changing the overall design.
- Runtime changes: Performance chart data now has dense intermediate historical points rendered with a monotone curve; intermediate points remain tooltip-selectable while only the six anchor dates show dots/labels. Trade glyphs render at native 32px, Buy uses `#007A91`, Sell remains black, and the detail action bar is followed by a 24px spacer. Product detail now suppresses the duplicate PageHeader large title, keeps the large hero title at the top, and exposes the centered small title only as the scroll collapse progresses.
- Files changed: `src/app/config/investmentsPortfolioConfig.ts`, `src/app/components/investments/InvestmentPortfolioChart.tsx`, `src/app/components/icons/AppIcon.tsx`, `src/app/components/PageHeader.tsx`, `src/app/screens/investments/InvestmentSecurityScreens.tsx`, handoff/capability docs.
- Verification: `npm run build` and `git diff --check` passed. In-app browser verification confirmed the initial product detail has one visible hero title and a hidden sticky title at scrollTop 0; the browser session was also reconnected and the RO Investments route rendered successfully.
- Limitations: browser scroll automation was intermittent after the detail transition; no backend trade execution or data persistence was added.
- safe to resume: yes

## 2026-07-10 Investments Chart Visual Cleanup

- Latest request handled: remove the visually broken auxiliary lines from all Investments charts after browser review.
- Runtime changes: distribution tabs retain their donut labels and colored leader paths, now routed from the donut's outer edge onto side rails and stopped before the text so they neither cross the donut nor overlap labels; the Performance chart no longer renders a dotted horizontal grid, while preserving its curve, points, axes, and tooltip interaction. Its mock historical series now includes moderate gains and pullbacks across every period instead of a near-linear climb; the displayed current value and layout stay unchanged.
- Files changed: `src/app/components/investments/InvestmentDistributionChart.tsx`, `src/app/components/investments/InvestmentPortfolioChart.tsx`, capability/handoff docs.
- Verification: `npm run build`, `npm run audit:templates` (`templates=47 codePreviews=47 components=79 screens=27 flows=14`), `npm run audit:platform`, and `git diff --check` passed. Known empty `react-vendor`, chunk-size, and normal Windows LF/CRLF warnings remain.
- safe to resume: yes

## 2026-07-10 Investments History Advanced Filters

- Latest request handled: complete the Investments History filter behavior from Figma node `9264:14637`, including custom date selection, calendar behavior, secondary selectors, applied-filter state, and Orders-specific status filtering.
- Runtime changes:
  - `Apply filters` now uses radio-style date presets for Last Month, Last 6 Months, Last year, and Define;
  - `Define` opens a `Select interval` sheet backed by the shared calendar component, with month navigation, range selection, localized start/end dates, Today, Reset, and Confirm;
  - custom date filtering now uses the selected inclusive interval instead of the former hardcoded range, with local date serialization to avoid CEE timezone day shifts;
  - transaction/order type and currency selectors use square checkbox rows with SELECT ALL, CLEAR, and Apply; currencies follow the Figma local/EUR/USD/Other currencies grouping while filtering the actual underlying currency values;
  - Orders adds a dedicated status selector for EXECUTED, PENDING, and REJECTED and filters the order rows accordingly;
  - the main filter sheet shows selected names instead of generic counts, and the Orders sheet exposes Type, Status, and Currency;
  - applied filters render only effective filter chips, each with its own remove action, plus REMOVE FILTERS; removing the final effective difference returns the screen to its default unfiltered state;
  - empty selections are preserved and correctly produce an empty result instead of silently reverting to Select All.
- Files changed: `src/app/screens/investments/InvestmentsHistoryScreen.tsx`, `src/app/config/investmentsPortfolioConfig.ts`, capability/handoff docs.
- Verification: `npm run build`, `npm run audit:templates`, `npm run audit:platform`, and `git diff --check` passed; known empty `react-vendor`, chunk-size, and normal Windows LF/CRLF warnings remain.
- Browser limitation remains unchanged: authenticated runtime click-through requires the access password and an available browser-control bridge; no credentials were inspected or bypassed.
- safe to resume: yes

## 2026-07-10 Investments Security Catalogue And Product Detail

- Latest request handled: enrich Mobile PI Investments for every CEE country from the supplied Figma security-list and owned/not-owned product-detail sources, including compatibility with the CZ Future chatbot overlay.
- Runtime changes:
  - the Performance `Invest` action now opens a searchable/filterable `List of securities` catalogue;
  - portfolio security cards open an owned-product detail, while catalogue-only products open the not-owned detail variant;
  - both variants reuse shared PageHeader, AccountSearchBar, BottomSheet, AccountActionBar, BrandLogo, chart, period-chip, and section-divider components;
  - owned detail adds `MY SECURITY` portfolio value and quantity; both variants expose the Figma-derived hero, performance, History/Documents/Sell/Buy action bar, market price chart, Product ID, fund type, meaningful description, last update, and purchase options;
  - catalogue values, currencies, identifiers, dates, and ownership are deterministic and resolve for RO/CZ/SK/HU/RS/BA/BA_BL/SI through the shared PI Investments screen;
  - CZ Future remains on the same `investments` runtime route, so the existing contextual chatbot launcher/topics and rich portfolio/history replies remain available on the enriched flow.
- Files changed: `src/app/config/investmentsPortfolioConfig.ts`, `src/app/components/investments/InvestmentProductCard.tsx`, `src/app/screens/investments/InvestmentsPortfolioScreen.tsx`, `src/app/screens/investments/InvestmentSecurityScreens.tsx`, capability/handoff docs.
- Verification:
  - `npm run build` passed; known empty `react-vendor` and chunk-size warnings remain;
  - `npm run audit:templates` passed: `templates=47 codePreviews=47 components=79 screens=27 flows=14`;
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`;
  - `git diff --check` passed with normal Windows LF/CRLF warnings only;
  - local Vite server returned HTTP 200 on `http://127.0.0.1:4173/`;
  - visual browser automation was unavailable because neither the bundled `agent-browser` CLI nor the browser-control execution bridge was exposed in this runtime; isolated Chrome headless reached the local app but correctly stopped at `Enter password to continue`, so no credentials were inspected or bypassed; an authenticated click-through remains recorded as follow-up evidence, not silently claimed as passed.
- Limitations: catalogue/order values remain mock-driven; Buy/Sell/Documents actions are presentational in this supplied screen scope and do not execute trades, suitability checks, document retrieval, signatures, or backend changes.
- safe to resume: yes

## 2026-07-08 Investments Logo And Distribution Chart Deploy Closeout

- Latest request handled: user asked to commit everything still uncommitted and publish to Vercel.
- Workspace scope:
  - `main` already contained local commit `e2cda65` ahead of `origin/main`.
  - A new set of local edits appeared after that commit and is intentionally included in this closeout, per user request to commit everything.
- Commit scope:
  - Investments distribution donut chart leader lines now use dynamic geometry based on each slice midpoint, with per-slice colors and side-aware label placement instead of fixed connector lines.
  - Investments data now carries a mocked brand-logo id, expands history transactions/orders, adds brand logos in detail headers, and uses improved title casing.
  - Added shared `BrandLogo` rendering backed by `src/app/config/brandLogos.ts` and shared `NavigationCardArt` for reusable card thumbnails.
  - Portfolio/history UI polish includes recurring contribution icon, chart ticks, filter chip width behavior, summary performance color/sign handling, fund banner positioning, account-details card art reuse, ShopSmart typography tuning, and Products header title sizing.
  - Included `.zcode/plans/plan-sess_c1feec4c-9fc0-4d9d-a40e-d30419c7535a.md` as the working plan for the donut leader-line repair.
- Verification before commit:
  - `npm run build` passed on 2026-07-08; known Vite warnings remain for empty `react-vendor` and chunks above 500 kB.
  - `npm run audit:templates` passed: `template-contract ok: templates=47 codePreviews=47 components=79 screens=27 flows=14`.
  - `npm run audit:platform` passed: `reference-platform audit ok products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- Banana Loop result:
  - fixed/triaged: the second wave of local Investments/brand-logo/Design System edits is being committed together instead of remaining hidden workspace drift.
  - already known: Vite empty `react-vendor`, chunk-size warnings, oversized assets, missing typecheck/lint/test scripts, and git loose-object housekeeping remain known bananas.
  - preserved: Investments remain mock-driven UI/data; no trading, suitability, portfolio backend, real brand-rights workflow, or order execution was added.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes after commit, push, and Vercel production deploy complete.
- safe to resume: yes after commit, push, and Vercel production deploy complete.

## 2026-07-08 Investments And Design System Unification Commit

- Latest request handled: user asked to commit everything currently uncommitted so the workspace is unified.
- Workspace scope:
  - `C:\Users\mihai\Desktop\Mobile Banking - CEE` is the active Git repository on `main`; all current modified files are included in this closeout.
  - `C:\Users\mihai\Desktop\Creator` was checked and is not a Git repository, so there is nothing to commit there from Git.
- Commit scope:
  - Investments Portfolio / History polish: neutral performance color/sign display, adjusted distribution spacing, cleaner history/order rows, custom trade/order-detail/ex-ante icons, refined detail header collapse, local detail rows, and simplified order detail content.
  - Investment mock data polish: local seed performance values adjusted to avoid negative display in the reviewed examples.
  - Design System cleanup: removed three obsolete code-only template previews (`Account details info`, `Prime advisor`, `Account search results`) and matching registry entries; current template audit now expects `47` templates/code previews.
  - Design System visual specimen polish: removed extra specimen background wrappers and swapped the mini product icon to the new `accounts-coins` app icon.
- Verification before commit:
  - `npm run build` passed on 2026-07-08; known Vite warnings remain for empty `react-vendor` and chunks above 500 kB.
  - `npm run audit:templates` passed: `template-contract ok: templates=47 codePreviews=47 components=79 screens=27 flows=14`.
  - `npm run audit:platform` passed: `reference-platform audit ok products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- Banana Loop result:
  - fixed/triaged: the current local Investments/Design System edits are being committed together instead of remaining hidden workspace drift.
  - documented: the Design System current template/code-preview count is now `47`, not the older `50` figure from previous sessions.
  - already known: Vite empty `react-vendor`, chunk-size warnings, oversized assets, missing typecheck/lint/test scripts, and git loose-object housekeeping remain known bananas.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes after commit completes.
- safe to resume: yes after commit completes.

## 2026-07-07 Full Workspace Closeout For CZ Chatbot And Product Detail Deploy

- Latest request handled: user asked to commit everything currently in the workspace and publish the result to Vercel after the latest CZ Chatbot savings-interest polish.
- Commit scope:
  - Full current workspace state is intentionally included, per user request to commit everything.
  - Scope includes CZ Chatbot Home savings/product-shelf/credit-limit polish, savings interest preview calculations, Product detail page and product-sheet routing, active Kids cleanup after deleting RO/RS runtime apps, related registries, product assets, capability-map updates, and handoff docs.
- Verification before commit:
  - `npm run audit:templates` passed: `template-contract ok: templates=50 codePreviews=50 components=79 screens=27 flows=14`.
  - `npm run audit:platform` passed: `reference-platform audit ok products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `npm run build` passed; known Vite warnings remain for empty `react-vendor` and chunks above 500 kB.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- Banana Loop result:
  - fixed/triaged: all currently modified and untracked product/runtime/docs files are being closed out together instead of remaining hidden local work.
  - already known: Vite empty `react-vendor`, chunk-size warnings, oversized image assets, and missing local typecheck/lint/test scripts remain documented known bananas.
  - preserved: the deployed app remains a mock-driven stakeholder demo; chatbot savings/product/card flows do not perform real banking execution, eligibility, regulated advice, SCA, signature capture, or backend state changes.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes after commit, push, and Vercel production deploy complete.
- safe to resume: yes after commit, push, and Vercel production deploy complete.

## 2026-07-07 CZ Chatbot Saving Capacity Detail Handoff Polish

- Latest request handled: user asked to refine the Home `How much can I save?` response: reuse existing colored Spending/PFM icons, remove bold emphasis from the `How to save it` explanatory copy, add a linking question before the follow-up chips, make the saving product cards presentation-only, and route final `Open now` to the new Saving account product detail page.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` now renders rich metric/product icons through the existing `PfmCategoryIcon` registry instead of local/recreated SVG glyphs.
  - Savings-capacity metrics use PFM categories `Income`, `Shopping`, and `Finance`; the saving product cards use `Wallet` and `Investments`.
  - Product rich cards now support `interactive: false` and `footer`; the `How to save it` saving-option cards render as static presentation cards, while the selectable actions remain only in the follow-up chip shelf.
  - `src/app/App.tsx` now adds the connector question `Choose your preferred saving type.` and routes final saving `Open now` actions to `product-detail` with the selected `Saving account` / `Term deposit` option instead of reopening the Products shelf bottom sheet.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` sets product-card explanatory body copy to normal weight and styles static product cards/icons/footer.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and chunks above 500 kB.
  - In-app browser smoke on the local CZ Future Chatbot Home URL confirmed the first topic `How much can I save?` renders PFM icons `Income`, `Shopping`, `Finance`, `Wallet`, and `Investments`, the `How to save it` body is `font-weight: 400`, the saving product cards are static non-button cards, `Choose your preferred saving type.` appears under the product cards, and no lowercase `demo` copy appears.
  - In-app browser smoke clicked `Saving account`, confirmed no repeated `Monthly saving capacity` card after selection, clicked through to final `Ready to open`, then clicked the follow-up `Open now`; chat closed and the phone showed the `Saving account` Product detail page with no Products bottom sheet, header `Saving account`, heading `Keep money aside while staying flexible`, and CTA `Find out more`.
- Banana Loop result:
  - fixed: saving option cards no longer create duplicate click paths.
  - fixed: final saving handoff now opens the product detail page instead of the category shelf.
  - preserved: this remains a front-end simulation; no real product opening, eligibility, legal-rate quote, documents, or backend confirmation was added.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 Products Product Detail Page And Sheet Cleanup

- Latest request handled: user asked to repair the Design System `Product` template header, globally open a Level 1 Product detail page from Products `OUR PRODUCTS` bottom-sheet rows, populate the new pages with Figma illustrations from Meniga Harmonization Icons, move the `Find out more` CTA lower like Domestic payment, replace lorem ipsum with meaningful product copy, and remove invalid product options.
- Runtime changes:
  - Added shared `src/app/screens/products/ProductDetailScreen.tsx` using the standard `PageHeader`, Figma-sourced `327x160` illustrations, product-aware heading/body copy keyed by `optionId`/`cardId`, and a bottom footer CTA (`Find out more`) aligned to the lower phone area.
  - Added shared `src/app/components/products/ProductCardBottomSheet.tsx`; Products bottom-sheet rows now close the sheet and open the Product detail page with the selected row title, e.g. `Current account`.
  - Wired `product-detail` navigation through `src/app/App.tsx`, `NavigationContext`, deep-link normalization, Design System template preview, registries, project packs, and the Products flow metadata.
  - Wired the same shared Product bottom sheet/detail path into the HU Kids PI-shaped Products page without broadening other Kids surfaces.
  - Downloaded the supplied Meniga Harmonization Icons `Pictures` node illustrations into `src/assets/products/detail/` and mapped them across the Product detail options.
  - Cleaned Products bottom-sheet option lists globally: `Account package`, `Switch account`, `Digital wallets`, `Refinance loan`, and `Loan calculator` were removed; `Round Up` now appears only in Romania's `Saving and investing` sheet.
  - Removed the visible `Account package` option from the reconstructed Product selection template and removed `Current account packages` from the old BA/BA_BL pre-login product accordion.
  - Removed the refinancing tutorial from `More -> Tutorials` so no visible app surface keeps a refinance-loan entry after the Products cleanup.
  - Removed the simulated OS home-indicator bar from Domestic payment create/review/sign/success and preserved the intended CTA vertical position with footer padding; Product detail uses the same no-bar footer position.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and chunks above 500 kB.
  - `npm run audit:templates` passed: `template-contract ok: templates=50 codePreviews=50 components=79 screens=27 flows=14`.
  - `npm run audit:platform` passed: `reference-platform audit ok products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - In-app browser smoke on Design System Templates selected `Product` and confirmed the preview uses `ProductDetailScreen`, standard Back/Help header actions, and a loaded `327x160` Figma illustration.
  - Static Products config audit confirmed the removed option labels are absent from `productsMenuConfig.ts`, default Saving options are `Term deposit`, `Saving account`, `Mutual funds`, and Romania keeps exactly one `Round Up`.
  - `rg` confirmed no `Account package`, `Switch account`, `Digital wallets`, `Loan calculator`, `Refinance loan`, `Refinancing`, `current-account-packages`, `account-package`, `switch-account`, `digital-wallets`, `loan-calculator`, or `refinance-loan` references remain in `src/app`, `src/data`, or `src/translations`.
- Banana Loop result:
  - fixed: Product template no longer uses the broken bottom-sheet-style header.
  - fixed: Product sheet row titles now become detail page titles instead of generic `Product name` in runtime flows.
  - fixed: invalid Products sheet options were removed globally, and `Round Up` is Romania-only.
  - fixed: the Product detail and Domestic payment fixed CTA area no longer depends on a visible simulated OS bottom bar.
  - preserved: Product detail pages remain mock-driven; no real eligibility, pricing, application submission, legal documents, or backend product opening was added.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 Delete Romania/Serbia Kids Apps

- Latest request handled: user explicitly approved deleting the Serbia Kids app and Romania Kids app because they do not produce value, then clarified this must be deletion, not hiding.
- Runtime changes:
  - Deleted `src/app/screens/kids/RoKidsApp.tsx`, `src/data/roKidsBanking.ts`, and the temporary `src/app/screens/kids/rs/` Serbia Kids extraction files.
  - Added `src/data/huKidsBanking.ts` so HU Kids Saving/Learn uses HU-owned mock data instead of importing `RO_KIDS_*` data.
  - Updated `src/app/App.tsx` so Mobile PI Kids runtime is active only for supported Kids concept countries from `kidsMarketHomeConcepts` (`SK`, `HU`). RO/RS Kids now fall through to the honest planned-state placeholder.
  - Removed `kids.ro.*`, `kids.rs.*`, and `kids.ro-prototype` IDs from demo types, screen/component/flow registries, project-pack runtime coverage, and capability references.
  - Removed Serbia Kids concept data and RS-specific CSS motion hooks.
  - Updated `docs/handoff/state-of-the-world.md`, `docs/handoff/next-tasks.md`, `docs/platform-capability-map/README.md`, and `docs/architecture/PROJECT_MODEL.md` so active Kids coverage is SK/HU only and RO/RS are documented as retired/deleted.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and chunks above 500 kB.
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `npm run audit:templates` passed: `templates=50 codePreviews=50 components=79 screens=26 flows=14`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - `rg` over `src` found no `RoKidsApp`, `roKidsBanking`, `RO_KIDS`, `kids.ro`, `kids.rs`, `rs-safe-spend-coach`, or `rs-kids` references.
- Banana Loop result:
  - fixed: RO/RS Kids were deleted from source/runtime/registries/docs instead of hidden behind flags.
  - fixed: HU Kids no longer depends on a Romania-named data file.
  - preserved: unrelated pre-existing workspace changes outside this scope were not reverted.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot Home Saving Capacity Five-Topic Flow

- Latest request handled: user asked to add and then polish the first Home CZ Chatbot option around `How much money can I save`: calculate monthly saving capacity from expenses, income, and current-account cash; ask how the user wants to save; offer Saving account / Term deposit with realistic illustrative rates; ask how much to save now; then show `Open now`.
- Runtime changes:
  - `src/app/App.tsx` now includes `How much can I save?` as the first Home CZ Chatbot topic.
  - The structured reply calculates a cautious monthly target from the current mock Spending timeline and current-account balances, then presents Saving account at `3.5% p.a.` and Term deposit at `5% p.a.`.
  - The initial savings answer now places the monthly-capacity card between the money-signal paragraphs and the `How to save it` product-choice card; the capacity card uses vertical icon rows with right-aligned amounts, while the saving product cards use compact two-column sizing and product glyphs.
  - Savings/chatbot visible copy now uses `simulation` instead of `demo` so the flow does not read as an internal prototype script.
  - The savings-capacity card no longer has an `Open Spending` action, and the initial savings answer no longer offers an `Open Spending` follow-up chip.
  - After the user selects Saving account or Term deposit, the bot asks for an amount directly and no longer repeats the monthly-capacity card.
  - The flow continues through product choice, amount chips, a final `Ready to open` response, and `Open now` navigation into Products focused on `Investments and savings` / `Saving and investing`.
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` now allows up to five visible suggested topics so the existing Home topics remain visible instead of dropping `Spot unusual spending`.
  - Chat streaming now preserves the user's reading position when they have scrolled away from the bottom; auto-scroll continues only while the user is already at the bottom or sends a new message/action.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and chunks above 500 kB.
  - In-app browser smoke on the local CZ Future Chatbot Home URL confirmed five visible topics in order: `How much can I save?`, `Review today's money snapshot`, `What products can I open`, `Review latest 5 transactions`, and `Spot unusual spending`.
  - In-app browser smoke clicked `How much can I save?` and confirmed the reply includes `3.5% p.a.` for Saving account, `5% p.a.` for Term deposit, no `70% plan` / `30% plan`, no `Open Spending` text, and zero rich-card actions.
  - Follow-up in-app browser smoke confirmed no visible chatbot `demo` copy, `simulation` copy present, `Monthly saving capacity` metric subtitle text at `14px`, three vertical icon metric rows with right-aligned amounts, compact saving product cards with icons, and no horizontal overflow in the two-card product row.
  - In-app browser smoke clicked `Saving account` and confirmed the latest bot reply no longer repeats the `Monthly saving capacity` card and instead shows amount chips `1 000,00 CZK`, `2 000,00 CZK`, and `3 000,00 CZK`.
  - In-app browser smoke clicked `2 000,00 CZK` and confirmed `Ready to open`; the completed chat remained away from the bottom with `distanceFromBottom=260` and the `Scroll to latest message` button visible, so stream completion did not force the user's reading position to the bottom.
  - In-app browser console error log was empty after the savings flow smoke.
- Banana Loop result:
  - fixed: adding the new first Home topic no longer hides the existing fifth Home topic because the visible-topic cap is now five.
  - preserved: this is still a mock-driven savings guidance demo; no real product opening, eligibility, interest-rate quote, documents, or backend persistence was added.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot For You Carousel Click Repair

- Latest request handled: user reported that `For you` carousel cards, including `Grow your money` and `Next best conversations`, no longer opened conversations on click and asked to fix, commit, and deploy.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` now delays pointer capture in the shared `HorizontalDragScroller` until a real horizontal drag starts.
  - Simple taps/clicks on carousel card buttons remain owned by the button, so their `send-message` action opens the conversation as before.
  - Real horizontal drags still capture the pointer, disable card pointer events while dragging, move the rail, and suppress the accidental click that follows a drag.
  - Commit scope also includes the already-present local `src/app/App.tsx` CZ Home saving-capacity work: `How much can I save?` appears as a Home topic and resolves into monthly saving capacity, saving-account / term-deposit choice, amount follow-ups, and `Open now` handoff.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and chunks above 500 kB.
  - In-app browser smoke on `screen=homepage` opened CZ Chatbot -> `For you`, clicked `Make idle money grow`, and confirmed a chat opened with the user prompt plus structured `Savings planning` reply.
  - In-app browser smoke clicked `Travel with card controls ready` from `Next best conversations` using the real promo-card button and confirmed a chat opened with the card-control prompt plus structured `Card check` reply.
  - In-app browser drag smoke moved the `Grow your money` rail from `scrollLeft 0` to `327` without creating a chat message.
  - After the drag, clicking the now-visible `Keep the right cash buffer` hero card opened the expected safety-reserve conversation.
  - Browser console error log was empty after the carousel click/drag checks.
- Banana Loop result:
  - fixed: `For you` cards again behave as conversation starters on click.
  - fixed: swipe/drag remains available and no longer steals simple taps.
  - preserved: all `For you` content remains mock-driven conversation guidance; no product execution, order placement, or backend CRM integration was added.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot Investment Follow-Up Click Fix

- Latest request handled: user reported that the Investments suggested next actions (`Grow my savings`, `Future purchase`, `Long-term reserve`) could not be clicked and asked to fix and deploy to Vercel.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` now captures follow-up shelf pointer gestures on the chip element when a gesture starts on a chip, instead of forcing the parent shelf to own the whole pointer lifecycle.
  - Follow-up chips now handle simple pointer taps on `pointerup` and keep the existing `click` path for keyboard/accessibility, with a short guard to prevent duplicate sends.
  - Drag suppression still blocks accidental chip activation after a real horizontal drag.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and chunks above 500 kB.
  - In-app browser smoke on `screen=investments` opened CZ Chatbot, clicked `Start an investment goal`, clicked `Grow my savings`, and confirmed the user message plus `Goal selected` reply appeared.
  - The same browser smoke clicked `In 3-5 years` and confirmed the flow advanced to `Time horizon captured` with amount chips `5,000 CZK`, `10,000 CZK`, and `I'm not sure yet`.
  - Browser console error log was empty after the follow-up click checks.
- Banana Loop result:
  - fixed: Investments goal follow-up chips are tappable/clickable again while preserving drag-scroll behavior.
  - preserved: no investment execution, suitability, trading, or backend behavior was added.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot Investments Closeout And Production Deploy

- Latest request handled: user asked to resume and finish the unfinished Investments chatbot task, then commit everything and publish to Vercel.
- Closeout:
  - Final product code changes for Investments goal suggestions were already in place and verified before closeout; this closeout only added handoff evidence after the deploy completed.
  - Commit `6a41c72` recorded the Investments goal-suggestion verification and next-task update.
  - Production deploy completed on Vercel as `Ready`; the stable production alias is `https://mobile-banking-cee.vercel.app`. Vercel also creates a fresh immutable deployment URL on each publish, so inspect the project when an exact deployment URL is needed.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and chunks above 500 kB.
  - `git diff --check` passed on 2026-07-07 with only normal Windows LF/CRLF warnings.
  - `npx vercel --prod --yes` completed a production deployment.
  - `npx vercel inspect <deployment-url>` confirmed target `production` and status `Ready`.
  - `npx vercel logs <deployment-url>` returned `No logs found`, so no runtime error logs were reported immediately after deploy.
- Banana Loop result:
  - fixed: the previously unfinished Investments goal-suggestion smoke sweep is documented and committed.
  - fixed: production Vercel publication is confirmed and recorded with the deployment URL.
  - already known: Vite chunk-size and empty `react-vendor` warnings remain non-blocking known bananas.
  - already known: Git reports too many unreachable loose objects during auto-packing; repository cleanup is deferred as intentional maintenance.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot Home Product Shelf Topic

- Latest request handled: user asked urgently to replace Home topic `Find newest bank documents` with `What products can I open`, move it to position 2, and make the click answer show products from the Products shelf with a link to the shelf.
- Runtime changes:
  - `src/app/App.tsx` now orders Home CZ Chatbot topics as `Review today's money snapshot`, `What products can I open`, `Review latest 5 transactions`, and `Spot unusual spending`.
  - The `What products can I open` intent uses `getProductsMenuForCountry(country)` plus `getProductCardSheetConfig(...)`, so it summarizes the same `Products > OUR PRODUCTS` shelf categories and bottom-sheet options shown by the Products screen.
  - The reply includes a rich `Product shelf` card row and an `Open Products` follow-up/action that navigates to `screen=products`.
  - Product shelf rich cards now act as real shortcuts: selecting Account/Cards/Borrowing/Insurance/Investments closes chat, navigates to Products, selects the Banking tab, scrolls to `OUR PRODUCTS`, and opens the matching Products bottom sheet.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser smoke on the active CZ Future Chatbot Home URL confirmed visible topics are exactly `Review today's money snapshot`, `What products can I open`, `Review latest 5 transactions`, and `Spot unusual spending`; `Find newest bank documents` is absent.
  - Click smoke confirmed `What products can I open` replies with `Products you can open`, references `Products > OUR PRODUCTS`, lists Account, Cards, Mortgages and loans, Insurance, and Investments and savings with their sheet options, renders Product shelf cards, and shows follow-ups `Open Products`, `Explain savings options`, and `Review borrowing options`.
  - Click smoke on `Open Products` confirmed navigation to `screen=products` and the `OUR PRODUCTS` shelf is visible.
  - Click smoke on the `Account` rich card confirmed chat closes, URL becomes `screen=products`, Banking / `OUR PRODUCTS` is visible, and the Account bottom sheet opens with `Current account` and `Account package`.
  - Follow-up full sweep confirmed all five rich cards (`Account`, `Cards`, `Mortgages and loans`, `Insurance`, `Investments and savings`) close chat, navigate to `screen=products`, keep Banking / `OUR PRODUCTS` visible, and open the matching bottom sheet with the expected first options; browser console errors stayed empty.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- Banana Loop result:
  - fixed: Home no longer suggests document search as topic 4.
  - fixed: the new product-opening topic is position 2 and grounded in the Products shelf config, not a static chat-only list.
  - fixed: product cards inside the assistant answer now redirect into the real Products shelf and open the selected product category instead of behaving like inert cards.
  - preserved: this is still mock/demo catalogue discovery; no eligibility, application, document signing, or product-opening backend was added.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot Investments Goal Suggestions Repair

- Latest request handled: user said the Investments goal suggestions (`Grow my savings`, etc.) did not continue the already-built options flow.
- Runtime changes:
  - `src/app/App.tsx` now owns the Investments goal follow-up chain in the CZ smart resolver: goal type -> horizon -> starting amount -> monthly contribution -> portfolio preview -> projection / explanation.
  - The flow reuses current CZ mock investment facts for portfolio value, return, asset-class mix, currency mix, and largest holding.
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` clears drag-click suppression shortly after a swipe, so a real chip click after dragging is not swallowed.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - `git diff --check` passed on 2026-07-07 with only normal Windows LF/CRLF warnings.
  - In-app browser smoke on `screen=investments` confirmed `Grow my savings` returns `Goal selected` with `In 3-5 years`, `In 5-10 years`, `Not sure yet`; horizon returns amount chips; amount returns monthly chips; monthly returns `Model portfolio preview`; `See projection` returns `Projection preview` and `Goal simulation`.
  - Resume verification completed the missing sweep: `Future purchase` and `Long-term reserve` also return `Goal selected` with horizon chips and no generic fallback; `Long-term reserve` was tested after dragging the follow-up shelf first, confirming real clicks after swipe are no longer swallowed.
- safe to resume: yes

## 2026-07-07 CZ Chatbot For You Carousel Swipe Fix

- Latest request handled: user reported that the newly added `For you` carousels did not swipe/drag in the demo.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` adds a shared `HorizontalDragScroller` wrapper for the `Grow your money` hero rail and `Next best conversations` card rail.
  - The wrapper handles pointer drag for mouse/touch, ignores tiny tap movement, releases back to vertical feed scrolling when the user moves vertically, and suppresses accidental card clicks after a horizontal drag.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` adds carousel grab/grabbing states, mobile touch handling, native momentum scrolling, and disables scroll snap while actively dragging so the card moves immediately.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - `git diff --check` passed on 2026-07-07 with only normal Windows LF/CRLF warnings.
  - In-app browser smoke on the active CZ Future Chatbot homepage opened `For you`, dragged the `Grow your money` hero carousel from right to left and confirmed `scrollLeft` moved to `327`.
  - The same smoke dragged the `Next best conversations` promo carousel from right to left and confirmed `scrollLeft` moved from `0` to `176`, while `For you` remained open and no conversation was accidentally launched.
  - Browser console error log was empty after the carousel drag checks.
- Banana Loop result:
  - fixed: the carousels now demonstrate real hidden-behind content through mouse/touch-style horizontal drag, not only static overflow.
  - preserved: card tap actions remain available; drag no longer fires a topic click.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot Home Transaction Topic Refinement

- Latest request handled: user rejected Home suggested topics 2 and 3 (`Explain what I can use`, `Pick my next best step`) as weak/generic and asked for a stronger transaction-focused topic, specifically latest 5 transactions with the account they came from, plus another more useful Home topic.
- Runtime changes:
  - `src/app/App.tsx` replaces Home topic 2 with `Review latest 5 transactions`, prompting a reply that lists the five latest visible transactions across the Home profile, including signed amount, date, status when pending, and source account/product.
  - `src/app/App.tsx` replaces Home topic 3 with `Spot unusual spending`, prompting a reply that calls out the largest recent outgoing transaction, the heaviest money-out category, pending movements, and source account/product.
  - The Home overview follow-up chips now point to `Review latest 5` and `Spot unusual spending` instead of the previous available-money / next-action wording.
  - The old `next best step` prompt path now returns a concrete recent-activity answer if triggered from stale chat state, avoiding the previous generic next-action copy.
  - The resolver reuses `createSpendingAnalyticsTimeline(...)` so transaction answers are grounded in the same account transaction model used by Account Detail and Spending.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser smoke on `screen=homepage` confirmed the visible Home topics are `Review today's money snapshot`, `Review latest 5 transactions`, `Spot unusual spending`, and `Find newest bank documents`; old labels `Explain what I can use` and `Pick my next best step` are absent.
  - In-app browser click smoke confirmed `Review latest 5 transactions` replies with `Latest 5 transactions`, real mock transactions such as `ATM UniCredit`, `Seznam.cz`, `Cash deposit`, source accounts such as `Primary Account 1` / `Primary Account 2`, a rich `Latest transaction readout` card, and follow-ups `Spot unusual spending`, `Open Account`, `Open Spending`.
  - In-app browser click smoke confirmed `Spot unusual spending` replies with `Unusual spending check`, largest debit (`CPI Byty`), top money-out category, pending item (`Alza.cz`), source account, rich `Spending signals` card, and no old `Suggested next action` / `next best step` copy.
- Banana Loop result:
  - fixed: Home topic 2 is no longer a vague available-money explanation; it now shows concrete recent transactions and source account.
  - fixed: Home topic 3 is no longer a generic next-best-step prompt; it now highlights concrete transaction signals.
  - preserved: transaction data remains mock/demo-driven and uses existing account/spending data builders; no new banking backend or execution capability was introduced.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot Investments Goal Flow Polish

- Latest request handled: user reviewed the Investments `Start an investment goal` reply and asked to remove the `Open Investments` button from that flow, remove the confusing `Next move planner` card because it duplicated the suggestions below, and fix mouse drag/swipe on the follow-up chips.
- Coordination:
  - Scope stayed inside `screen=investments` goal-flow behavior plus the shared follow-up shelf gesture handling.
  - Home/non-Investments topic ownership from the parallel thread was not changed.
- Runtime changes:
  - `src/app/App.tsx` now uses a no-action `Portfolio context` rich block for `Start an investment goal`, so the goal setup reply no longer shows the `Open Investments` CTA.
  - `Start an investment goal` now renders only the portfolio context card plus the three follow-up chips `Grow my savings`, `Future purchase`, and `Long-term reserve`; the `Next move planner` rich card remains available only in the broader next-move investment conversation.
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` makes follow-up chip shelves drag-scroll with mouse pointer capture, lower movement threshold, click suppression after drag, and explicit dragging state.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` switches the follow-up shelf to custom horizontal drag behavior, disables scroll snap while dragging, and shows a grabbing cursor during the gesture.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - `git diff --check` passed on 2026-07-07 with only normal Windows LF/CRLF warnings.
  - In-app browser smoke on `screen=investments` opened CZ Chatbot, clicked `Start an investment goal`, and confirmed the final reply has one `Portfolio context` rich card, no `Open Investments` text, no `Next move planner` text, and follow-up chips `Grow my savings`, `Future purchase`, and `Long-term reserve`.
  - In-app browser drag smoke on the follow-up shelf confirmed horizontal mouse drag changed `scrollLeft` from `2` to `45` without sending a chip message; message count stayed at `2`.
- Banana Loop result:
  - fixed: goal setup no longer offers an out-of-place navigation CTA.
  - fixed: goal setup no longer presents two competing next-step systems.
  - fixed: follow-up chips can be mouse-dragged/swiped when they overflow.
  - preserved: no trading/order execution, suitability, or backend integration was introduced.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot For You Carousel And Spacing Polish

- Latest request handled: user reviewed the CZ Chatbot `For you` management-demo surface and asked for more breathing room around the primary CTA, a one-line credit-limit body, tighter/right-aligned related-card chevron, a carousel behind the `Grow your money` banner with two extra topics, a horizontally scrollable `Next best conversations` carousel with two extra topics, and two additional `Decide with confidence` topics.
- Runtime changes:
  - `src/app/App.tsx` shortens the primary opportunity body to `Limit offer: 10 000,00 to 15 000,00 CZK.` so it fits on one line in the current phone width.
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` defines mapped `For you` hero, promo, and article topic lists instead of the previous hardcoded single banner / two-card / two-article blocks.
  - `Grow your money` now renders a 3-item horizontal carousel: `Make idle money grow`, `Keep the right cash buffer`, and `Check risk before buying`.
  - `Next best conversations` now renders a 4-item horizontal carousel: `Travel with card controls ready`, `Find subscriptions before they renew`, `Make payments predictable`, and `Move spare cash smarter`.
  - `Decide with confidence` now shows four article topics, adding `When does a higher card limit make sense?` and `A monthly money check before choosing products`.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` adds scroll-snap carousel styling, visible next-card peeking, more CTA margin, a little extra primary-card bottom space, and moves the related-card chevron closer to the right edge while keeping it inside the row.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser DOM smoke on `screen=homepage` opened CZ Chatbot -> `For you` and confirmed: offer body line approximation is `1`, hero carousel has `3` items with `scrollWidth 969 > clientWidth 343`, promo carousel has `4` items with `scrollWidth 692 > clientWidth 343`, article list has `4` rows, all six newly added topic titles are present, CTA margins are `6px` / `4px`, and related chevron right gap is `2px`.
  - Browser console error log was empty after the smoke check.
  - `git diff --check` passed on 2026-07-07 with only normal Windows LF/CRLF warnings.
- Banana Loop result:
  - fixed: the main CTA no longer feels as cramped vertically.
  - fixed: the credit-limit body no longer wraps in the reviewed viewport.
  - fixed: `For you` now visibly demonstrates deeper carousel content behind the first banner/card set instead of looking like a static feed.
  - preserved: all new carousel topics remain mock front-end conversation starters; no product execution or backend campaign logic was introduced.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot Investments Topic Upgrade

- Latest request handled: user asked for the Investments chatbot entry to show four topics, with `Start an investment goal` first, replace weak `Explain history filters` with `Review my orders`, and replace `Compare risk and currency` with a smarter investment conversation that has useful suggestions and multiple answer paths.
- Coordination:
  - Parallel Home/non-Investments work owns the shared structured `resolveReply` contract and Home suggested-topic replies.
  - This entry owns only `screen=investments` topic labels and investment-specific reply intents.
- Runtime changes:
  - `src/app/App.tsx` now sets the Investments new-conversation topics to `Start an investment goal`, `Review portfolio context`, `Review my orders`, and `Plan next investment move`.
  - The Investments topic prompts now route into the structured CZ smart reply resolver instead of generic fallback copy.
  - The resolver builds Investments facts from the same mock portfolio model used by the runtime screen: holdings, currency/asset-class distributions, portfolio value/performance, and mock order statuses from `buildInvestmentSecurities`, `buildInvestmentDistributionItems`, and `buildInvestmentHistoryOrders`.
  - `Start an investment goal` starts a goal setup conversation with portfolio context, a next-move planner card, and follow-up chips for goal type.
  - `Review portfolio context` now returns a portfolio review conversation that includes performance, concentration, currency/asset exposure, order activity, rich cards, and follow-ups.
  - `Review my orders` now discusses executed/pending/rejected investment orders and points to Investments History as the evidence surface.
  - `Plan next investment move` now combines portfolio shape, orders, risk/currency exposure, and next-step choices rather than only comparing risk and currency.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - `git diff --check` passed on 2026-07-07 with only normal Windows LF/CRLF warnings.
  - In-app browser DOM smoke on `screen=investments` opened CZ Chatbot and confirmed the four visible topics are exactly `Start an investment goal`, `Review portfolio context`, `Review my orders`, and `Plan next investment move`; old labels `Explain history filters` and `Compare risk and currency` were absent.
  - In-app browser smoke clicked `Start an investment goal` and confirmed the `Investment goal setup` reply, two rich cards (`Portfolio context`, `Next move planner`), and follow-ups `Grow my savings`, `Future purchase`, and `Long-term reserve`.
  - In-app browser smoke clicked `Review portfolio context` and confirmed portfolio performance/activity copy, two rich cards, and follow-ups `Review my orders`, `Plan next move`, and `Open Investments`.
  - In-app browser smoke clicked `Review my orders` and confirmed the `Investment orders` reply, executed/pending/rejected status summary, rich `Investment order activity` card, and follow-ups `Pending orders`, `Rejected orders`, and `Open History`.
  - In-app browser smoke clicked `Plan next investment move` and confirmed portfolio/exposure/orders copy, three rich cards, and follow-ups `Start a goal`, `Review orders`, and `Open Investments`.
  - Browser console error log was empty after the Investments chatbot smoke checks.
- Banana Loop result:
  - fixed: Investments entry no longer has only three topics.
  - fixed: `Start an investment goal` is available as the first topic on the Investments page and uses the already-developed goal flow.
  - fixed: weak history-filter wording is replaced with an order-focused conversation grounded in mock order status data.
  - fixed: the old risk/currency topic is replaced with a broader next-investment-step conversation with richer suggestions.
  - preserved: this remains mock/demo-driven; no trading/order execution, suitability, or backend integration was introduced.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot Home Suggested Topic Real Replies

- Latest request handled: user asked to make the Home CZ Chatbot suggested-topic clicks feel realistic and intelligent instead of returning the same generic assistant answer; user also asked to coordinate with the parallel `Review comment selections` thread so Investments topic work is not overwritten.
- Coordination:
  - The parallel thread `Review comment selections` owns `screen=investments` topic labels and investment-specific reply intents.
  - This session owns Home/non-Investments CZ reply behavior and the shared package resolver contract needed for structured replies.
  - A coordination note was sent to the parallel thread before verification; Investments branches already present in `src/app/App.tsx` were left intact.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/types.ts` extends `CoAppingReplyResolver` so hosts can return either a plain string or a structured `{ text, richBlocks, followUps }` reply.
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` preserves legacy string resolver behavior through the existing contextual enhancement path, while structured resolver results now render directly with rich cards and follow-up chips.
  - `src/app/App.tsx` passes a CZ smart resolver into the Co-Apping launcher and handles additional navigation targets used by reply actions (`payments`, `documents`, `messages`, `settings`, `contacts`, `prime`, and `account-detail`).
  - Home suggested topics now read `Review today's money snapshot`, `Explain what I can use`, `Pick my next best step`, and `Find newest bank documents`; their prompts map to page-aware Home replies rather than the package fallback.
- Verification:
  - `npm run build` passed on 2026-07-07 after the final workspace check; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - `git diff --check` passed on 2026-07-07 with only normal Windows LF/CRLF warnings.
  - In-app browser smoke on `screen=homepage` confirmed the four new Home topic labels render after opening `CZ - Chatbot`.
  - In-app browser click smoke confirmed all four Home topics return specific headings (`Your Home overview`, `Available money, not just balance`, `Suggested next action`, `Recent documents`), contextual CZ amounts/documents, rich cards/follow-up chips, and no `I can help with Accounts and balance explanations...` generic fallback text.
- Banana Loop result:
  - fixed: Home suggested-topic clicks no longer collapse into the one-size-fits-all default answer.
  - fixed: the package integration contract now documents a structured reply path instead of requiring host apps to squeeze rich answers through plain text.
  - triaged: Investments topic changes are intentionally owned by the active parallel thread and are not closed out here.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot For You Offer Category Copy

- Latest request handled: user asked to make the CZ Chatbot `For you` surface clearer for a management demo: rename the main section to `Personalized offers for you`, add a `Grow your money` category above the investment banner, and replace generic editorial headings with smarter titles that communicate sales-oriented conversation starters.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` now titles the primary sales area `Personalized offers for you` with subcopy `Offers and conversation starters matched to this moment`.
  - The discovery/offer support area now starts with a `Grow your money` section heading before the investment banner.
  - The old `Recommended next` heading is now `Next best conversations`, with subcopy `Prompts that can turn into product actions`.
  - The old `Useful reads` heading is now `Decide with confidence`, with subcopy `Short guidance before choosing a next step`.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` adds a first-section heading spacing override so the new `Grow your money` category sits cleanly above the banner.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - `git diff --check` passed on 2026-07-07 with only normal Windows LF/CRLF warnings.
  - In-app browser DOM smoke on `http://127.0.0.1:3001/?product=PI&country=CZ&scenario=active&ds=current&release=release-future-cz-coapping&bank=retail-single-account&theme=light&lang=en&screen=homepage` opened CZ Chatbot -> `For you` and confirmed the headings `Personalized offers for you`, `Grow your money`, `Next best conversations`, and `Decide with confidence`; old labels `Recommended next`, `Useful reads`, `Banking prompts and product stories`, and `Contextual options matched to this moment` were absent from the feed.
- Banana Loop result:
  - fixed: the `For you` support content no longer reads like a generic editorial feed; it now communicates offer categories and conversation starters more clearly for management demo review.
  - preserved: the primary credit-limit offer, investment banner, promo cards, and article actions remain mock-driven front-end conversation starters.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot For You Credit Card Closeout And Share Rename

- Latest request handled: user asked to finish the CZ Chatbot `For you` credit-card sales execution, shorten the editorial banner copy, remove the gradient-looking treatment from the primary opportunity card, add a card-identification row inside the offer, rename the shared/default platform title from `UniCredit Mobile Banking - Co-Apping` to `Mobile Banking CEE`, then polish the primary offer copy, artwork, stroke, and CTA alignment.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` now renders an opportunity-related card row inside the primary `For you` offer, using the shared Meniga-mapped `Card` component (`mc-credit-partner-standard`), card name, masked card number, and existing `ForwardIcon` chevron action back to Card Detail.
  - `src/app/App.tsx` now feeds that related card row from the active mock credit card and keeps the sales copy explicit about the proposed plafon change from `10 000,00 CZK` to `15 000,00 CZK`, under the more commercial title `New credit limit for you`.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` removes the primary opportunity card gradient/stroke and keeps it on a clean white surface with the new related-card row styling.
  - The primary opportunity CTA now uses the shared `LinkButton`, is labeled `I'm interested`, and is centered in the card container instead of left-aligned.
  - Follow-up polish replaced the temporary arrow on the related card row with the shared DS chevron path and removed the metric-card indentation so `Current limit` / `New limit` align to the same left axis as the offer title and body copy.
  - The Discovery-style hero below the primary opportunity now uses shorter copy: `Invest smarter`, `Make idle money grow`, and `Risk checks first. Start when ready.`
  - `index.html` and `public/manifest.webmanifest` now expose `Mobile Banking CEE` as the browser/share/PWA title instead of the previous Co-Apping-specific name.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - `git diff --check` passed on 2026-07-07 with only normal Windows LF/CRLF warnings.
  - In-app browser smoke on `screen=card-detail&card=card-credit-1` confirmed the page title is `Mobile Banking CEE`, no `App boot error` appears after reload, `FIND OUT MORE` opens `For you`, the primary opportunity background image is `none`, the related card row renders `Credit Card` plus `5173 **** **** 4301`, the old `Featured for Czech customers` copy is absent, and the new hero copy is present.
  - Follow-up in-app browser bounding-box smoke confirmed the offer title/body, related-card row, and `Current limit` / `New limit` metrics share the same left coordinate, metric padding is `0px`, and the related-card chevron path matches the shared DS `chevron-link` path.
  - Follow-up in-app browser DOM/layout smoke confirmed the primary opportunity title is `New credit limit for you`, body is trimmed to the plafon move only, the CTA text is `I'm interested`, the old `Check options` copy is absent, the primary border is transparent, the related card uses `data-card-variant="mc-credit-partner-standard"`, and the CTA center offset inside the card is `0px`.
- Banana Loop result:
  - fixed: `For you` no longer crashes due to the stray `ChevronRightIcon` reference.
  - fixed: the primary offer now identifies the exact credit card before pushing the limit-review CTA.
  - fixed: share/browser naming no longer overfits the platform to Co-Apping.
  - triaged: the real CRM campaign engine, suppression rules, eligibility API, and multi-product ranking remain the existing future task.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot Conversation Detail Header Simplification

- Latest request handled: user asked to remove the assistant mode toggle from conversation detail because it does not yet add enough value there; the toggle should remain available only on new conversation / non-detail assistant entry.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` now renders the `Chat` / `For you` segment only for new conversation and `For you` states.
  - Conversation detail now keeps the center header area as a passive spacer, leaving only the conversation-list button on the left and `More options` plus close on the right.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - `git diff --check` passed on 2026-07-07; only existing LF/CRLF warnings were reported.
  - In-app browser smoke confirmed new chat still shows one `.mpc-mode-segment`; after starting a conversation, conversation detail shows zero `.mpc-mode-segment` nodes and header buttons `Back to conversations`, `More options`, and `Close assistant`.
- Banana Loop result:
  - fixed: conversation detail no longer exposes a low-value mode toggle.
  - preserved: new conversation still exposes the segment where mode choice is useful.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot Scroll Button Offset Tuning

- Latest request handled: user asked to move the conversation-list scroll-to-latest button and chat scroll-to-bottom button slightly lower, while still keeping the message scroll button safely above follow-up suggestions when suggestion chips are visible.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` lowers `.mpc-conversation-floating-actions` from `126px` to `108px`.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` lowers the default `.mpc-chat-scroll-bottom-button` offset from `118px` to `104px`.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` lowers the follow-up-aware scroll offset from `168px` to `150px`, preserving extra clearance above suggestion chips.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - `git diff --check` passed on 2026-07-07; only existing LF/CRLF warnings were reported.
  - In-app browser stylesheet inspection confirmed the active CSS rules now use `108px`, `104px`, and `150px`.
- Banana Loop result:
  - fixed: scroll buttons no longer sit with an oversized visual gap from the composer/search area.
  - preserved: the follow-up suggestion variant still reserves extra vertical space to avoid overlap.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot Credit Card Nudge Commercial Copy

- Latest request handled: user asked to rewrite the Card Detail proactive credit-limit nudge copy to be more commercial while keeping the `FIND OUT MORE` action unchanged and ideally mentioning the proposed new limit.
- Runtime changes:
  - `src/app/App.tsx` now titles the dismissible credit-card nudge `Upgrade your credit limit to 15 000 CZK`.
  - The nudge body now frames the message as a personalized offer that can be reviewed first, with no change unless the client continues.
  - CTA remains `FIND OUT MORE`.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - In-app browser DOM check on `screen=card-detail&card=card-credit-1` confirmed the new title/body render, the old generic nudge copy is absent, and `FIND OUT MORE` remains present.
- Banana Loop result:
  - fixed: the previous generic support-like copy no longer undersells the credit-limit sales opportunity.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot For You Segment Indicator Refinement

- Latest request handled: user rejected the red dot on the floating AI launcher, asked to move that attention cue into the assistant segment switch, then rejected the first segment-dot styling as visually ugly; follow-ups replaced the `For you` segment glyph with the user-provided 24x24 tag/opportunity icon, balanced it visually at `17px`, restored old editorial banners below the primary contextual credit-card opportunity, removed the internal `Why this appears` CRM explanation, and changed the credit-limit metrics to current/new plafon.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatLauncher.tsx` no longer supports or renders launcher notification badges.
  - `src/app/App.tsx` now opens the assistant launcher into clean `Chat` mode even when contextual opportunities exist.
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` renders a small red indicator on the `For you` segment button when opportunities are available and the assistant is currently in `Chat`.
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` now renders `For you` as a hybrid surface: the primary CRM credit-limit-review card remains at the top, while old Discovery-style banner/read content returns below it.
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` no longer renders the client-facing `Why this appears` block on opportunity cards.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` removes launcher-badge styling and now uses a controlled `14px` segment-dot without the previous halo/glow, keeping the cue visible without returning to the oversized blob effect on the mode switch.
  - `package/mobile-pi-coapping-chat-package/src/icons.tsx` now renders the `For you` mode icon from the supplied SVG path with `currentColor`; `coapping.css` renders it at a balanced `17px` inside the segment switch so its filled visual weight aligns with the outline chat icon.
  - `src/app/App.tsx` no longer generates the weak secondary credit-card opportunities `Review card protection` and `Set a repayment reminder`; the primary card now shows `Current limit` and `New limit` rather than available credit.
  - `src/data/products.ts` sets the mock credit-card plafon to `10 000 CZK` while retaining `3 200 CZK` available credit, so the proposed `New limit` can credibly show `15 000 CZK`.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser smoke on `screen=card-detail&card=card-credit-1` confirmed the floating launcher has no `.mpc-chat-launcher-badge`, opens clean `Chat`, and shows card-support topics rather than the sales feed.
  - In-app browser smoke confirmed the `For you` segment button carries one `.mpc-mode-button-badge` while `Chat` is active and opportunities exist, then removes that badge once `For you` is opened.
  - In-app browser smoke confirmed `FIND OUT MORE` on the card opportunity still opens `For you` directly without reintroducing a launcher badge.
  - Follow-up badge/icon polish: `npm run build` passed and `git diff --check` passed on 2026-07-07; in-app browser automation timed out during the follow-up visual read, so final badge/icon polish still needs human visual acceptance on the already-open Products chat screen.
  - Follow-up For you content fix: `npm run build` passed and `git diff --check` passed on 2026-07-07; in-app browser DOM check confirmed one primary opportunity card, zero `Review card protection`, zero `Set a repayment reminder`, one Discovery hero, two promo banners, and two useful-read rows.
  - Follow-up plafon copy fix: `npm run build` passed and `git diff --check` passed on 2026-07-07; in-app browser DOM check confirmed no `Why this appears`, no `Available credit` metric, and metrics labeled `Current limit` / `New limit` with values `10 000,00 CZK` / `15 000,00 CZK`.
- Banana Loop result:
  - fixed: the unattractive launcher-level red dot and its open-to-offers behavior were removed.
  - fixed: the attention cue now lives inside the assistant mode switch, closer to the destination surface, and the first oversized segment-dot treatment was reduced to a subtle dot.
  - fixed: weak secondary sales cards were removed from `For you`; the area now uses the primary CRM card plus broader banner/read content.
  - fixed: client-facing opportunity copy no longer exposes internal CRM trigger language and no longer confuses available credit with credit-card plafon.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot For You Credit Card Sales Surface

- Latest request handled: user asked to turn the universal second CZ Chatbot tab into a non-aggressive contextual sales surface, starting from Credit Card Detail with `3 200 CZK` available credit and a proactive credit-limit-review opportunity.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` replaces the old static Discovery feed rendering with a `For you` opportunity surface fed by structured opportunities.
  - `package/mobile-pi-coapping-chat-package/src/types.ts` adds `CoAppingOpportunity` contracts; `CoAppingChatLauncher.tsx` adds a notification badge; `icons.tsx` adds the `For you` mode icon.
  - `src/app/App.tsx` now builds a CZ credit-card opportunity set from the active mock credit card (`availableCredit` / `creditLimit`), passes it into the chatbot, and distinguishes clean support entry (`Chat`) from opportunity entry (`For you`).
  - `src/app/screens/cards/CardDetailScreen.tsx` now shows a dismissible Teodora nudge above the transactions/search area for eligible credit cards; its CTA opens the assistant directly in `For you`.
  - The `For you` primary credit card opportunity starts a guarded conversational sales flow: it explains credit-limit review inputs and keeps final changes inside the authenticated card flow.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser smoke on `screen=card-detail&card=card-credit-1` confirmed: assistant is initially closed, the proactive nudge renders, launcher badge renders, old `.mpc-discovery-feed` is absent, and `See options` opens `For you`.
  - In-app browser smoke confirmed `For you` shows `Credit limit review available`, `Available credit 3 200,00 CZK`, `Current limit 5 000,00 CZK`, and supporting opportunities.
  - In-app browser smoke confirmed `Check options` switches to `Chat` and starts the credit-limit-review conversation with follow-ups; the Card Detail Help button still opens clean card-support topics without showing `For you`.
- Banana Loop result:
  - fixed: the second chatbot tab is no longer a universal Czech editorial Discovery feed unrelated to the current card context.
  - fixed: credit-card sales is separated from support; Help opens `Chat`, while nudge/badge opens `For you`.
  - triaged: this is still a mock CRM/opportunity catalog with one credit-card scenario; a real campaign engine, suppression rules, eligibility API, and full multi-product ranking remain future work.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot Contextual New-Conversation Topics

- Latest request handled: user asked for the four new-chat suggested topics to be contextual by entry page, instead of Home, Spending, Payments, Products, and More all showing the same generic prompts; deeper product contexts such as accounts, cards, savings, loans, and mortgages also needed product-aware topics.
- Runtime changes:
  - `src/app/App.tsx` now builds explicit CZ Chatbot entry contexts for Level 1 pages: Home, Spending/Analytics, Payments, Products, and More.
  - Account-detail chatbot context now resolves by selected product type: current accounts keep account topics, saving accounts/term deposits get savings topics, loans get loan topics, and mortgages get mortgage topics.
  - The Account Detail help action now uses the same selected-product resolver, so opening help from `loan-1` or `mort-1` no longer falls back to current-account copy.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser smoke confirmed distinct four-topic sets for `homepage`, `analytics`, `payments`, `products`, and `more`.
  - In-app browser smoke confirmed `account-detail&account=loan-1` shows loan topics, `account-detail&account=sav-1` shows savings topics, and `account-detail&account=mort-1` shows mortgage topics.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- Banana Loop result:
  - fixed: Level 1 chatbot entry no longer reuses the same generic topic list.
  - fixed: loan and mortgage detail contexts no longer receive current-account suggested topics.
  - triaged: follow-up chip behavior after selecting these new entry topics still depends on the existing mocked reply resolver coverage.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 CZ Chatbot Conversation Navigation Header

- Latest request handled: user asked to polish CZ Chatbot navigation between new chat, conversation list, and conversation detail.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` now tracks the conversation-list return target (`new`, `conversation`, or `discovery`) and the active conversation id.
  - Conversation list opened from new chat shows `OneAI` in the top-left header, a forward/right arrow in the top-right, and no selected conversation row.
  - Conversation list opened from a selected conversation highlights that conversation with a neutral gray background and the top-right forward/right arrow returns to that conversation.
  - Conversation detail keeps the conversation-list two-line icon on the top-left and now renders two top-right actions: `More options` followed by `Close assistant`.
  - `package/mobile-pi-coapping-chat-package/src/icons.tsx` adds a `ForwardIcon`; `package/mobile-pi-coapping-chat-package/src/coapping.css` centers the header using a three-column grid and styles the active conversation row.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser smoke on `screen=homepage` confirmed: new-chat header remains unchanged with 4 topics; list opened from new chat shows `OneAI`, one return-to-new arrow, and 0 active rows; selecting `How do payments work?` opens detail with conversation-list button plus `more` and `X`; reopening list from detail shows 1 active row with `aria-current="true"` and the return arrow restores detail.
- Banana Loop result:
  - fixed: conversation list no longer acts like a close-only surface and now preserves navigation context from either new chat or selected conversation.
  - triaged: visual drawer direction remains the existing right-to-left/list transition and was not otherwise changed.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 CZ Chatbot Conversation Detail List Icon

- Latest request handled: user asked to replace the conversation-detail top-left back arrow with the conversation-list icon made of two lines, while keeping the same return-to-conversations behavior.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` now renders `ConversationsIcon` for the `isConversationDetailOpen` top-left control; the handler remains `openConversationList`, so the drawer/list behavior is unchanged.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- Banana Loop result:
  - fixed: conversation detail no longer shows a back arrow for the conversation-list action.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 CZ Chatbot New Message Glow Removed

- Latest request handled: user rejected the Gemini-inspired new-message glow because it washed the whole chat surface blue and asked to remove it if it could not match the Gemini reference cleanly.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` no longer applies the `mpc-chat-assistant-home-glow` class on default new-conversation states.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` removes the home-glow pseudo-element and its animation, returning the new-message surface to the clean white assistant background.
  - The previous cap of 4 visible suggested topics remains in place.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - `git diff --check -- package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx package/mobile-pi-coapping-chat-package/src/coapping.css docs/handoff/current-session.md docs/handoff/state-of-the-world.md docs/platform-capability-map/README.md` passed with only normal Windows LF/CRLF warnings.
  - In-app browser smoke on `screen=homepage` confirmed the open assistant class is only `mpc-chat-assistant`, `mpc-chat-assistant-home-glow` is absent, `::before` has no content/background, the assistant background is `rgb(255, 255, 255)`, and exactly 4 default topics render.
- Banana Loop result:
  - fixed: the large blue wash can no longer appear on the new-message state.
  - triaged: a future Gemini-style bottom gradient should be treated as a fresh isolated design task rather than reusing the removed class.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 Account And Debit Card Balance Linking

- Latest request handled: user flagged that generated current accounts shared the same visible balance and asked for Debit Card 1 / Debit Card 2 to reflect Current Account 1 / Current Account 2 respectively, globally for PI country contexts.
- Runtime changes:
  - `src/hooks/useProducts.tsx` now gives generated current accounts deterministic per-index balances instead of cloning the same amount for every account.
  - Generated debit and meal cards now link by index to generated accounts (`acc-1`, `acc-2`, etc.), and the product conversion pass resolves linked balances from the generated product list before falling back to static mock data.
  - `src/data/products.ts` now gives the static fallback second account a distinct CZK balance and links the second static debit card to `acc-2`.
- Verification:
  - In-app browser smoke on CZ Future Home confirmed `Primary Account 1` and `Debit Card 1` both show `2 850.50 CZK`, while `Primary Account 2` and `Debit Card 2` both show `2 052.36 CZK`, with Accounts total recalculated to `4 902.86 CZK`.
  - In-app browser smoke on `screen=card-detail&card=card-debit-2` confirmed Card Detail `Free To Spend` renders `2 052,36 CZK`.
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - `npm run audit:templates` passed: `template-contract ok: templates=50 codePreviews=50 components=80 screens=28 flows=15`.
  - `npm run audit:platform` passed: `reference-platform audit ok products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- Banana Loop result:
  - fixed: generated debit-card balances no longer all mirror the first current account.
  - triaged: card detail transaction lists remain shared mock card transactions and were not expanded into account-specific transaction histories in this change.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 CZ Chatbot Conversation Month Groups

- Latest request handled: user asked for the CZ Chatbot conversation-list title to read as secondary gray text, for conversations to be grouped by month (`Jun 2026`, `May 2026`, `Apr 2026` style), and for the old item separator lines to be removed.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` now derives a month group from each conversation date/subtitle and renders grouped conversation sections.
  - Older mocked conversation histories now span May and April so the demo list visibly demonstrates multiple month groups.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` styles the list title and month labels with muted gray text and removes per-item separator borders.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - `git diff --check -- package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx package/mobile-pi-coapping-chat-package/src/coapping.css` passed with only normal Windows LF/CRLF warnings.
  - In-app browser computed-style check confirmed month labels `Jul 2026`, `Jun 2026`, `May 2026`, and `Apr 2026`, muted title color `rgb(102, 102, 102)`, 16 conversation items, and first item `border-bottom-width: 0px`.
- Banana Loop result:
  - fixed: conversation list no longer relies on thin row dividers for scanning and now has month-level anchors.
  - triaged: no new follow-up banana introduced; existing chunk-size warning remains known.
- safe to resume: yes

## 2026-07-06 Card Corner Fill Correction

- Latest request handled: user flagged white-looking corner artifacts on the credit card artwork in Card Detail, caused by the SVG card art not covering the rounded slot cleanly.
- Runtime changes:
  - `src/app/components/cards/Card.tsx` now uses the outer card container as the single clipping mask, removes the internal SVG `clipPath`, gives the container the card background/gradient, and sets the SVG to `preserveAspectRatio="none"` so non-64:40 runtime slots such as `219x138` are fully filled.
  - This applies globally anywhere the shared `Card` component renders: Card Detail, Card Component, Design System specimens, and Flow Library previews.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser smoke on `screen=card-detail&card=card-credit-1` confirmed the active `mc-credit-partner-standard` card has `preserveAspectRatio="none"`, `clipPath=0`, `clippedGroups=0`, container gradient background, `overflow:hidden`, and `borderRadius=5.67px`.
  - In-app browser smoke on Design System `#cards` confirmed the `Card Component` `219x138` credit-card specimen has `preserveAspectRatio="none"`, `clipPath=0`, `clippedGroups=0`, `slotBorder=0px`, and the expected gradient background.
  - `npm run audit:templates` passed: `template-contract ok: templates=50 codePreviews=50 components=80 screens=28 flows=15`.
  - `npm run audit:platform` passed: `reference-platform audit ok products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- Banana Loop result:
  - fixed: scaled card slots no longer rely on two separate rounded masks or aspect-ratio-preserving SVG letterboxing.
  - triaged: existing Vite chunk-size warnings remain known and unrelated.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 Credit Card Display Balance Correlation

- Latest request handled: user flagged that the Home credit-card row showed `0 .00 CZK` while Card Detail showed a real `Free To Spend` amount; this needed a global data fix, not a CZ/Future-only visual patch.
- Runtime changes:
  - `src/data/products.ts` now gives the static credit-card fallback complete card fields plus a real `availableCredit` / `creditLimit` pair in CZK, and static debit cards now carry explicit card metadata.
  - `src/hooks/useProducts.tsx` now treats credit-card `availableCredit` as the product display balance, converts `availableCredit` and `creditLimit` into the active country currency, and uses the same display amount for product-row formatting and card-category totals.
  - Debit and meal cards still mirror their linked current account balance.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser smoke on CZ Future Home confirmed the Cards section shows `Credit Card ... 3 200 .00 CZK`, followed by the two debit cards, and no `0 .00 CZK` remains in that card section.
  - In-app browser smoke on `screen=card-detail&card=card-credit-1` confirmed `Free To Spend` renders `3 200,00 CZK`, matching the Home credit-card value.
  - `npm run audit:templates` passed: `template-contract ok: templates=50 codePreviews=50 components=80 screens=28 flows=15`.
  - `npm run audit:platform` passed: `reference-platform audit ok products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- Banana Loop result:
  - fixed: Home and Card Detail now derive credit-card display value from the same available-credit source.
  - triaged: dedicated credit-card business logic for used/available/limit remains a later product task, as requested by the user.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 Card Component Asset Cleanup And Second Debit Card

- Latest request handled: user flagged visible card outline/radius mismatch, asked for `Card Component` to use the shared `Card` component artwork instead of the old card image, asked for the old card image to disappear from code, and asked to add one more debit card globally.
- Runtime changes:
  - `src/app/components/cards/Card.tsx` now clips card artwork with the source 4px corner radius, aligning the SVG clip with the component radius contract.
  - `src/app/screens/cards/CardDetailScreen.tsx` removed the outside card border and maps the second generated/static debit card to `mc-debit-standard`; the carousel now shows credit first, then `mc-debit-gold`, then `mc-debit-standard`.
  - `src/app/components/cards/CardComponent.tsx` now renders shared `Card` variants directly and no longer renders `img` card artwork or exposes `imageSrc` for card art.
  - `src/app/screens/flow-library/FlowLibraryScreen.tsx` now uses the same shared `Card` component for RO Card PIN previews instead of the removed card SVG assets.
  - `src/app/state/demoStore.tsx` now defaults to two debit cards globally; `src/data/products.ts` adds a static `Debit Card Plus` fallback after the credit card and first debit card.
  - Removed the old card artwork files `src/assets/design-system/card.svg` and `src/assets/design-system/debit-card-mc-gold.svg`.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser smoke on Card Detail confirmed 3 rendered `Card` instances: `mc-credit-partner-standard`, `mc-debit-gold`, and `mc-debit-standard`; parent slot border width is `0px` and Apple Wallet text is absent.
  - In-app browser smoke on Design System `Card Component` confirmed `imgCountInsideCardComponent=0`, two rendered shared `Card` instances, and slot border width `0px`.
  - In-app browser smoke on Home confirmed the Cards section shows `Credit Card`, `Debit Card 1`, and `Debit Card 2` in that order.
- Banana Loop result:
  - fixed: the card image asset can no longer leak back into Card Component or Flow Library.
  - fixed: card slots no longer draw the extra outside border that created the visible stroke/radius mismatch.
  - fixed: default mock product data now includes the extra debit card requested globally.
  - triaged: existing Vite chunk-size warnings remain known and unrelated.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 CZ Chatbot Conversation Search Rail Height

- Latest request handled: user asked to align the conversation-list bottom search rail and adjacent new-conversation plus button with the default new-message composer height so transitions between states do not visually jump.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` sets `.mpc-conversation-search-row` to the same `46px` height and `24px` radius as the default `.mpc-input-row`.
  - `.mpc-conversation-new-button` now uses a matching `46px` square hitbox, while the normal new-message composer still keeps its growing multi-line behavior.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser computed-style check confirmed the conversation search row, new-conversation button, and default new-message composer all resolve to matching `46px` CSS height / `41.98px` scaled rendered height, with the search row and plus button sharing the same vertical center.
- safe to resume: yes

## 2026-07-06 Global Card Ordering And Detail Artwork

- Latest request handled: user clarified that the credit/debit card ordering and Card Detail artwork change is global across Baseline/Future and all countries, not only the CZ Future Chatbot preview.
- Runtime changes:
  - `src/hooks/useProducts.tsx` now generates credit-card products before debit-card products globally, so generated product lists put credit cards first on Home and detail flows.
  - `src/data/products.ts` now keeps the static mock card fallback in the same credit-before-debit order for direct category consumers.
  - `src/app/screens/cards/CardDetailScreen.tsx` now renders carousel artwork through the shared Design System `Card` component; credit cards use `mc-credit-partner-standard` and debit cards use `mc-debit-gold`.
  - Card Detail no longer renders the `Add to Apple wallet` CTA.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser smoke on Home confirmed the Cards section renders `Credit Card` before `Debit Card`.
  - In-app browser smoke on `screen=card-detail&card=card-credit-1` confirmed no Apple Wallet text is present and the first carousel artwork is `data-card-variant="mc-credit-partner-standard"` from Figma node `3039:8064`, followed by the debit card artwork.
- Banana Loop result:
  - fixed: credit card ordering no longer depends on the CZ Future preview route.
  - fixed: Card Detail no longer uses the old generic card artwork for credit cards.
  - triaged: existing Vite chunk-size warnings remain known and unrelated.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 CZ Chatbot Home Glow and Hidden Home Indicator

- Latest request handled: user asked to remove the visible system/home indicator bar under the CZ Chatbot composer while keeping natural bottom spacing, and to add a Gemini-like elegant moving bottom gradient on the assistant Home/new-conversation state.
- Superseded: the Gemini-like gradient was later removed because the live result made the entire assistant surface look blue instead of clean white. The hidden home-indicator spacing remains.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` now adds `mpc-chat-assistant-home-glow` only when the assistant is in the default new-conversation/home state, not in contextual entry states or existing conversations.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` adds a soft animated blue/white bottom gradient behind the Home/new-conversation composer and topic list.
  - The internal `.mpc-home-indicator` keeps its bottom spacing, but the visible black pill is hidden with `opacity: 0`.
  - The gradient respects `prefers-reduced-motion` by disabling the animation when reduced motion is requested.
- Verification:
  - `npm run build` passed on 2026-07-06; the known Vite `App` chunk-size warning remains.
  - In-app browser computed-style check on `screen=homepage` confirmed the assistant class is `mpc-chat-assistant mpc-chat-assistant-home-glow`, the `::before` gradient uses `mpcHomeGradientDrift`, composer background is transparent over the glow, and the home-indicator pill remains in layout but has `opacity: 0`.
- Banana Loop result:
  - fixed: the black internal system bar is no longer visible under the composer.
  - fixed: the default assistant Home now has a subtle moving bottom glow without applying it to contextual/detail chat states.
  - triaged: no new follow-up banana introduced; existing chunk-size warning remains known.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 Design System Card Logo Polish

- Latest request handled: user flagged that the new Design System `Card` artwork had an incorrect UniCredit logo and oversized `debit` / `credit` labels under the Mastercard mark.
- Runtime changes:
  - `src/app/components/cards/Card.tsx` now reuses the real UniCredit SVG path data from the stakeholder header import (`src/imports/svg-pn3y56bdut.ts`) for the card logo instead of the temporary circle plus Arial text approximation.
  - Card `debit` / `credit` labels were reduced from `3.6` to `2.55` SVG font size with tighter letter spacing, so they read closer to the Meniga card references.
- Figma sources inspected:
  - Logo reference node `3039:8612` (`buddy_logo`) in Meniga Harmonization Icons confirmed the red UniCredit mark and white wordmark path structure.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser smoke on `#cards` confirmed the selected `MC Credit Premium Gold` card maps to Figma node `3039:7485`, the logo renders as 12 SVG paths, and the `credit` label renders with `font-size="2.55"` and `letter-spacing="0.18"`.
- Banana Loop result:
  - fixed: Card no longer approximates the UniCredit logo with custom text.
  - fixed: Card debit/credit labels are no longer visually oversized versus the Mastercard mark.
- safe to resume: yes

## 2026-07-06 CZ Chatbot Composer Alignment and Scroll Button Offset

- Latest request handled: user flagged that the composer add/mic/send controls were not vertically aligned in the default composer state, and that the `Scroll to latest message` button could overlap the contextual suggestion chips.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` now gives the composer row balanced vertical padding and centers the add, microphone, and send/voice controls with explicit grid centering and zero native button padding.
  - The microphone button now uses the same `32px` hitbox as the add/send controls while keeping a `16px` icon, so the default composer controls share the same visual axis.
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` adds a modifier class to the scroll-to-bottom button whenever follow-up suggestions are active.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` raises the scroll-to-bottom offset from the default `118px` to `168px` in the follow-up state, placing it above the suggestion shelf instead of on top of it.
- Verification:
  - `npm run build` passed on 2026-07-06; the known Vite `App` chunk-size warning remains.
  - In-app browser computed-style check confirmed the default composer add/mic/send controls all render as `display: grid`, `padding: 0`, with matching `32px` CSS hitboxes and less than `1px` center delta from the composer row center.
  - In-app browser computed-style check with a multi-line composer confirmed the textarea grows while all three controls keep the same bottom gap inside the composer row.
- Banana Loop result:
  - fixed: default composer icon alignment no longer depends on native button padding or mismatched mic hitbox size.
  - fixed: scroll-to-bottom now has a separate follow-up-aware offset.
  - triaged: no new follow-up banana introduced; existing chunk-size warning remains known.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 Design System Card Variants

- Latest request handled: user asked to rename the Design System `Debit Card` component to `Card` and enrich it with additional Mastercard card variants from Meniga Harmonization Icons Figma nodes.
- Runtime changes:
  - `src/app/components/cards/Card.tsx` now owns the payment-card artwork family with a `CARD_VARIANTS` registry and selector-ready variants: MC Debit Gold, MC Credit Premium Gold, MC Credit Partner Standard, MC Debit Standard, MC Virtual Standard Electric Violet, and MC Virtual Standard Vibrant Orange.
  - `src/app/screens/design-system/DesignSystemPage.tsx` now exposes these variants under the existing `Card` specimen; the separate visible `Debit Card` specimen was removed.
  - `src/app/components/cards/DebitCard.tsx` remains as a compatibility alias for older imports, while `cards.card` is the official component registry entry.
  - `src/app/registry/componentRegistry.ts`, `src/app/state/demoTypes.ts`, `docs/design-system/component-implementation-handoff/components-handoff.md`, `docs/handoff/state-of-the-world.md`, and `docs/platform-capability-map/README.md` were updated for the new Card family mapping.
- Figma sources inspected:
  - Existing small card source `3039:30713`.
  - New requested nodes `3039:7485`, `3039:8064`, `4161:9198`, `3039:12315`, and `3039:12380`.
  - Figma screenshots were sampled for the core palettes: credit red/gold, credit red, debit white/red, electric violet, and vibrant orange.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser smoke passed at `http://127.0.0.1:3001/?product=PI&country=CZ&scenario=active&ds=current&release=release-future-cz-coapping&bank=retail-single-account&theme=light&lang=en&screen=design-system#cards`: the visible specimen is `Card`, no separate `Debit Card` specimen is exposed, `#card-variant-select` has 6 options, and selecting `MC Virtual Standard Vibrant Orange` renders 3 card sizes mapped to Figma node `3039:12380`.
  - `npm run audit:templates` passed: `template-contract ok: templates=50 codePreviews=50 components=80 screens=28 flows=15`.
  - `npm run audit:platform` passed: `reference-platform audit ok products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed for touched runtime/docs files; Git reported only existing LF-to-CRLF normalization warnings.
- Banana Loop result:
  - fixed: Design System no longer exposes a `Debit Card` component name for the card artwork family.
  - fixed: the Card dropdown is no longer single-value and now includes the requested debit, credit, and virtual variants.
  - triaged: no new follow-up banana introduced; existing Vite chunk warnings remain known.
- safe to resume: yes

## 2026-07-06 CZ Chatbot Personalized Context Titles

- Latest request handled: user asked for contextual CZ Chatbot entry copy to address the user by name, using `Teodora`, and to make the section prompts shorter and smarter than generic `How can I help you with this account?` copy.
- Runtime changes:
  - `src/app/App.tsx` now centralizes the CZ Chatbot demo user name in `CZ_CHAT_USER_NAME`.
  - Contextual Level 2/3 assistant entry titles now use `Teodora, ...` phrasing for Documents, Account Detail, Card Detail, Payments, Investments, Messages, Prime, Settings, Contacts, and the fallback context.
  - Example account entry copy is now `Teodora, what should we check on this account?`; card and investment entries use similarly short contextual prompts.
- Verification:
  - Source check confirmed all contextual titles pass through `buildCzChatTitle(...)` and no old generic `How can I help you with ...` / `How can I help on this screen ...` copy remains in `src/app/App.tsx`.
  - `npm run build` passed on 2026-07-06; the known Vite `App` chunk-size warning remains.
- Banana Loop result:
  - fixed: contextual chatbot openings no longer feel anonymous on deeper app screens.
  - triaged: no new follow-up banana introduced; existing chunk-size warning remains known.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 CZ Chatbot Conversation Drawer Controls

- Latest request handled: user asked to move the conversation-list `Start new conversation` action from the top-right header into the bottom search rail, replace the list top-right action with an X that closes the assistant, and keep the new-conversation/contextual header aligned with `Open conversations` on the left and `Close assistant` on the right.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` now uses a dedicated `openConversationList()` handler so the left header control opens the conversation drawer from new/discovery/contextual entry states.
  - Conversation-list header now keeps `Back to new conversation` on the left and uses `Close assistant` on the right; `Start new conversation` moved into the bottom search composer as an icon-only button beside a slightly narrower search rail.
  - The conversation drawer animation now opens and closes from the left (`translateX(-36px)` / `translateX(-30px)`) so its motion matches the new left-side `Open conversations` trigger.
  - Starting a new conversation from the moved bottom icon also clears the conversation search query.
- Verification:
  - `npm run build` passed twice on 2026-07-06; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser smoke confirmed the new-chat header exposes `Open conversations` on the left and `Close assistant` on the right, with no browser console errors.
  - In-app browser smoke opened the conversation list and confirmed the header exposes `Back to new conversation` plus `Close assistant`, the bottom rail contains `.mpc-conversation-search-actions`, the search row is narrowed to make room for `Start new conversation`, and no old floating `New+` button remains.
  - In-app browser smoke clicked the moved bottom `Start new conversation` button and confirmed the assistant returned to the new-conversation greeting with `Open conversations` / `Close assistant` header controls.
  - CSS/source check confirmed `mpcConversationDrawerIn` now starts at `translateX(-36px)` and `mpcConversationDrawerOut` exits to `translateX(-30px)`.
  - Production deploy was published with `npx vercel deploy --prod --yes`: deployment `dpl_6qwASFsympHox8AJZz1twjRgTMVG`, production URL `https://mobile-banking-7b9cnpyv1-imc-uci.vercel.app`, alias `https://mobile-banking-cee.vercel.app`, Vercel status `Ready`.
  - Post-deploy quick check confirmed `https://mobile-banking-cee.vercel.app/` returns HTTP `200`; `vercel inspect` confirmed target `production`, status `Ready`, and the remote build produced `assets/App-DmkHPm9A.js` at `516.06 kB`.
- Banana Loop result:
  - fixed: the top-right plus no longer conflicts with close semantics; conversation creation now lives near search where the user requested it.
  - fixed: the drawer direction now follows the moved left-side trigger.
  - triaged: existing Vite chunk warnings remain in `known-bananas.md`.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 Phone Chrome Status Bar Alignment

- Latest request handled: user asked to fix the global top phone system bar because the time/network/battery cluster looked vertically too low versus the Dynamic Island notch, and to make the notch slightly less tall.
- Runtime changes:
  - `src/app/components/StatusBar.tsx` removes the small internal top padding on the time and levels clusters and shifts the shared status bar row upward by reducing top padding from `21px` to `14px`.
  - `src/app/components/DynamicIsland.tsx` reduces the notch from `110x30` to `106x28`, moves it to `top: 11px`, and scales the two internal sensor dots from `6px` to `5.5px`.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser computed-style smoke on CZ Future Home confirmed the time cluster, right-side levels cluster, and Dynamic Island all center at `22.8px` relative to the phone screen top after scaling.
- Banana Loop result:
  - fixed: phone system chrome is now vertically aligned around the notch center instead of visually sitting low.
  - triaged: no new follow-up banana introduced; existing Vite chunk warnings remain known.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 CZ Chatbot Edge Overlay and Portal Animation

- Latest request handled: user asked to keep the CZ Chatbot right-edge launcher visible/accessibility-safe at `32px`, lower it further on the phone edge, remove the white seam/clipping line, keep the rest of the screen clickable, and make opening/closing feel like the chat expands from and collapses back into that edge tab.
- Runtime changes:
  - `src/app/App.tsx` mounts the CZ Chatbot launcher through the phone-frame `overlay` slot instead of inside scrollable screen content, so the tab is no longer clipped by Account/Card/Document scroll regions.
  - `src/app/components/MobileFrame.tsx` and `src/app/components/FramelessDeviceFrame.tsx` keep the overlay wrapper `pointer-events: none`; `coapping.css` restores `pointer-events: auto` only on the launcher and assistant, so normal screen controls remain clickable.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` sets `.mpc-chat-launcher-edge-tab` to `32px` wide and `top: 604px`, keeps the SVG shape extended past the phone edge to avoid the seam, and scales the inner AI mark to stay centered inside the black shape.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` replaces the simple chat mount animation with `mpcChatSheetIn` / `mpcChatSheetOut`: the assistant now clips, scales, blurs, and expands from the right-edge tab origin, with a short portal glow overlay during entry and collapse.
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` extends the close-unmount delay to match the new `0.48s` collapse animation instead of removing the chat immediately.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and `App` chunk above 500 kB.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - In-app browser computed-style smoke confirmed the overlay wrapper is non-intercepting (`pointer-events: none`), the launcher remains clickable (`pointer-events: auto`), underlying screen elements receive hit tests outside the launcher, and the launcher CSS is `width: 32px`, `height: 108px`, `top: 548px` before the final requested lower placement.
  - Final placement patch lowers the same edge tab to `top: 604px`; no logic or hit-testing behavior changed after that placement-only edit.
  - In-app browser animation smoke confirmed opening uses `mpcChatSheetIn` / `mpcChatPortalGlowIn` at `0.54s`; closing applies `mpc-chat-assistant-closing` with `mpcChatSheetOut` at `0.48s` before returning to the launcher.
- Banana Loop result:
  - fixed: the overlay no longer blocks unrelated page clicks.
  - fixed: the tab is rendered in frame overlay space so scrollable content no longer cuts it with a visible seam.
  - triaged: the Vite `react-vendor` empty chunk and `App` chunk-size warnings remain known performance bananas.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 CZ Chatbot Edge Tab Narrowing

- Latest request handled: user asked to make the CZ Chatbot right-edge launcher narrower and lower so it consumes less lateral space and sits closer to thumb reach.
- Superseded by the later `CZ Chatbot Portal Open/Close Animation` pass: the current launcher width is `32px`, not `28px`.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` narrows the edge tab from `34px` to `28px`, lowers it from `top: 432px` to `top: 492px`, and slightly tightens the gradient glow.
  - The tab keeps `right: -2px`, so the SVG still overlaps the phone edge and avoids the white seam.
- Verification:
  - In-app browser computed-style smoke on CZ Documents confirmed `.mpc-chat-launcher-edge-tab` renders with `cssWidth=28px`, `cssHeight=108px`, `cssTop=492px`, SVG shape, about `26px x 99px` scaled size, `13px` icon, active gradient pseudo-shadow, and `parentGap=-2`.
- safe to resume: yes

## 2026-07-06 CZ Chatbot Unified Edge Launcher

- Latest request handled: user approved the black side-tab launcher shape and asked to reuse it on Home and all Level 1 pages, add a more AI-like gradient shadow, and remove the tiny white seam on the right edge.
- Runtime changes:
  - `src/app/App.tsx` now renders the CZ Chatbot launcher as `edge-tab` on every in-app screen where the chatbot is mounted, including Home, Analytics/Spending, Payments, Products, and More.
  - The Level 1 screen set is still used for conversation context only: opening the tab from Home/Level 1 clears contextual help and starts the default new-conversation experience.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` moves the edge tab to `right: -2px`, widens the SVG background slightly to overlap the phone edge, and adds a cyan/blue/purple blurred glow under the black tab.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and `App` chunk above 500 kB.
  - In-app browser computed-style smoke confirmed Home, Analytics/Spending, Payments, Products, More, and Card Detail all render `.mpc-chat-launcher-edge-tab`; no `.mpc-chat-launcher:not(.mpc-chat-launcher-edge-tab)` bubble remains on Level 1, each Level 1 tab has `parentGap=-2`, and the SVG shape plus gradient pseudo-shadow are active.
  - In-app browser click smoke on Home confirmed the edge tab opens the default new-conversation state with `Good afternoon, Teodora`, six generic topics, and no contextual `How can I help you with ...` title.
- safe to resume: yes

## 2026-07-06 CZ Chatbot Level 2 Edge Tab Shape

- Latest request handled: user asked to restyle the Level 2 CZ Chatbot right-edge launcher so it matches the existing co-apping side-tab language more closely: narrower, black, smoother, and with a nicer shadow instead of the previous broad notch-like shape.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatLauncher.tsx` now renders the edge-tab background as the same SVG curve used by the existing co-apping side tab, while keeping the normal Level 1 bubble on the previous span/background implementation.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` scales the edge tab to a narrower black `32px x 113px` source size, centers a smaller `15px` AI mark in the visible tab area, and applies a subtle blue/black drop shadow.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and `App` chunk above 500 kB.
  - In-app browser computed-style smoke on CZ Future Card Detail confirmed `.mpc-chat-launcher-edge-tab` is present, uses an SVG shape (`shapeTag=svg`), renders black (`pathFill=rgb(16,16,16)`), scales to about `29px x 103px` in the phone frame, and the inner AI icon scales to about `14px x 14px`.
  - In-app browser computed-style smoke on CZ Future Home confirmed the Level 1 launcher remains the bubble variant at about `40px x 40px` in the scaled phone frame with the existing blue background.
- safe to resume: yes

## 2026-07-06 Stakeholder Header Context Row

- Latest request handled: user asked to move the combined `PI - Czech Republic` app/country selector out of the platform row and into the second header row before `Baseline App` / `Future App`, because product/country context should not sit beside `Flows` and `Design system`.
- Runtime changes:
  - `src/app/components/demo/DemoTopBar.tsx` now keeps row one focused on the UniCredit logo, `Demo` / `Flows` / `Design system`, profile, and logout.
  - The second row now starts with the combined app/country selector, followed by `Baseline App` / `Future App`, then either `Active app` / `Inactive app` for baseline or the compatible future-feature selector for future.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and `App` chunk above 500 kB.
  - In-app browser smoke on CZ Future Home confirmed row one contains only `Open demo`, `Demo`, `Flows`, `Design system`, profile, and logout; row two starts with `PI - Czech Republic`, then `Future App`, then `CZ - Chatbot`.
  - In-app browser smoke on Flow Library confirmed the header remains one row and does not show app/country or release controls.
- safe to resume: yes

## 2026-07-06 CZ Chatbot L1 Launcher Position

- Latest request handled: user asked to lower the default Level 1 CZ Chatbot floating launcher on Home because it felt too high above the bottom navigation.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` lowers the bubble launcher from `bottom: 98px` to `bottom: 76px`.
  - The Level 2 `edge-tab` launcher remains unchanged because it overrides `bottom` with `bottom: auto`.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and `App` chunk above 500 kB.
  - In-app browser computed-style smoke confirmed the Home launcher renders at `bottom: 76px`, `44px x 44px`, while the Level 2 launcher remains the `edge-tab` variant with `top: 428px`.
- safe to resume: yes

## 2026-07-06 CZ Chatbot Rich Investment Responses

- Latest request handled: user asked to implement the next CZ Chatbot phase inspired by Poly.ai / Hey George: richer assistant replies plus contextual follow-up suggestions above the composer, only for relevant topics instead of globally.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/types.ts` extends chat messages with optional rich blocks, follow-up suggestions, and lightweight chat actions.
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` now renders rich assistant cards for investment portfolio summary, model allocation, projection scenarios, product surfaces, card controls, and spending/subscription insight.
  - The assistant now attaches contextual follow-up chips above the composer for selected flows such as savings planning, investment goal setup, portfolio review, performance, top-up, card security, and subscription insight; chips disappear outside eligible latest agent replies.
  - Generated investment replies now support a Poly-like guided path: start goal -> goal type -> horizon -> starting amount -> monthly amount -> model allocation -> projection/review.
  - Existing mocked conversations are enriched too, especially `Investment advice for my savings`, card security, and subscription discovery.
  - `src/app/App.tsx` wires rich-card navigation actions so `Open Investments`, `Open History`, `Open Spending`, and `Open card details` route to the relevant app screens instead of acting as decorative CTAs.
  - Follow-up polish keeps the phone's existing `StatusBar` / `DynamicIsland` chrome above the CZ Chatbot overlay instead of drawing a duplicate in the chat package.
  - Follow-up suggestions are horizontally scrollable/draggable above the composer with more bottom breathing room, and rich product cards no longer render placeholder image/art strips.
  - Follow-up chip taps are protected from the custom drag-scroll handler, so a normal tap on `Start an investment goal` triggers the guided reply instead of being treated as a shelf drag.
  - Composer input is now an auto-growing textarea: it starts as a compact one-line composer, grows with wrapped or multi-line text up to five visible rows, then scrolls internally while the attachment, mic, and send controls stay bottom-aligned.
  - Discovery feed polish removed the overlapping `Investments` pill from the hero image and aligned the Discovery hero plus `Recommended next` cards to an 8px radius.
- Verification:
  - `npm run build` passed on 2026-07-06; Vite still emits the known empty `react-vendor` warning and now reports the `App` chunk at `515.95 kB`, so the chunk-size warning remains a known performance banana.
  - Follow-up tap regression build also passed on 2026-07-06; Vite still emits the known empty `react-vendor` warning and reports `assets/App-DRGM5jmK.js` at `516.00 kB`.
  - Local dev server on `http://127.0.0.1:3001/` returned HTTP 200.
  - In-app browser smoke opened CZ Future Chatbot on Home, clicked `Help me plan my savings`, and confirmed a formatted `Savings planning` reply, one investment rich card, and follow-up chips `Start an investment goal`, `Review my portfolio`, and `Learn how it works` above the composer.
  - In-app browser smoke clicked `Start an investment goal` and confirmed the next contextual chips changed to `Grow my savings`, `Future purchase`, and `Long-term reserve`.
  - In-app browser smoke clicked a `Portfolio` rich card CTA and confirmed the URL changed to `screen=investments` while the assistant remained open.
  - Follow-up in-app browser smoke on `screen=investments` clicked `Review portfolio context` and confirmed `.mpc-follow-up-shelf` can scroll (`scrollWidth=458`, `clientWidth=343`, `overflow-x: auto`, `touch-action: pan-x`, `padding-bottom: 14px`), investment product cards have no `.mpc-product-card-art`, and the real phone chrome stays above the overlay (`StatusBar z=50`, `DynamicIsland z=45`, chat overlay z=43).
  - Follow-up in-app browser smoke filled the composer with a long message and confirmed the input is now a `TEXTAREA`, grows to the five-row cap (`height=122px`, `max-height=122px`), switches to internal scrolling (`scrollHeight=166`, `overflow-y: auto`), and keeps plus/send bottom-aligned (`bottomDelta=0`).
  - Quick in-app browser smoke after final polish confirmed follow-up chips have no drop shadow (`box-shadow: none`), the first mode-segment icon is now the chat bubble instead of search, investment product cards render without action captions (`PortfolioValue, performance, allocation` / `HistoryOrders and confirmations`, `smallCount=0`), and browser console errors were empty.
  - Browser console error log after the smoke was empty.
  - Regression smoke after the follow-up tap fix clicked `Help me plan my savings`, confirmed chips `Start an investment goal`, `Review my portfolio`, and `Learn how it works`, clicked `Start an investment goal`, and confirmed the next chips changed to `Grow my savings`, `Future purchase`, and `Long-term reserve`; browser console errors were empty.
  - Latest production deploy was published with `npx vercel deploy --prod --yes`: deployment `dpl_2VmVegfLWXffrvogeVcxv6gtuxQf`, production URL `https://mobile-banking-n0x0l7ph1-imc-uci.vercel.app`, alias `https://mobile-banking-cee.vercel.app`, Vercel status `Ready`.
  - Post-deploy quick check confirmed `https://mobile-banking-cee.vercel.app/` returns HTTP `200`; `vercel inspect` confirmed target `production`, status `Ready`, and the remote build produced `assets/App-B8BTVFce.js` at `516.00 kB`.
  - The Discovery 8px-radius micro-fix and follow-up chip tap regression fix are included in this latest production deploy.
- Banana Loop result:
  - fixed: investment/card/spending replies no longer rely only on flat formatted text; they can now carry product-like interactive surfaces and contextual next steps.
  - triaged: rich-card content is still mock/demo data and not financial advice or backend execution.
  - triaged: App chunk returned above 500 kB after this feature and remains in the known performance banana queue.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 Stakeholder Header Scenario Dropdown

- Latest request handled: user asked to remove the centered `Active` / `Inactive` segmented scenario control from the stakeholder header, hide scenario selection entirely in `Future App`, and expose `Active app` / `Inactive app` as a dropdown only when `Baseline App` is selected.
- Runtime changes:
  - `src/app/components/demo/DemoTopBar.tsx` now renders the scenario control as a compact dropdown beside `Baseline App`.
  - `Future App` mode now hides the scenario dropdown and keeps the compatible future-feature selector beside the release selector.
  - Selecting `Future App` forces the app scenario back to `active`, preventing an invisible `inactive` state from remaining behind a future-feature preview.
  - Selecting `Active app` or `Inactive app` from the baseline dropdown resets the phone to the matching scenario entry screen.
- Verification:
  - `npm run build` passed on 2026-07-06; known warnings remain for empty `react-vendor` and `App` chunk above 500 kB.
  - In-app browser smoke on CZ Future with `scenario=inactive` confirmed the URL normalizes to `scenario=active`, the header shows `Future App` and `CZ - Chatbot`, and no `Active app`, `Inactive app`, or old `Scenario mode` segment is present.
  - In-app browser smoke on CZ Baseline confirmed the header shows `Baseline App` plus `Active app`, opening `Active app` reveals both `Active app` and `Inactive app`, and the old centered scenario segment is absent.
  - In-app browser smoke selected `Inactive app` and confirmed the URL changes to `scenario=inactive&release=release-current&screen=prelogin-inactive`, then switching back to `Future App` restores `scenario=active` and hides the scenario dropdown.
- safe to resume: yes

## 2026-07-06 Stakeholder Header App/Country Consolidation

- Latest request handled: user asked to merge the `PI App` / `SME App` / `Kids App` selector with the country selector, so the first-row label reads like `PI - Czech Republic`, `Kids - Hungary`, or `SME - Serbia`, and to move `Baseline` / `Future` into the old country-control position as `Baseline App` / `Future App`.
- Runtime changes:
  - `src/app/components/demo/DemoTopBar.tsx` now displays a combined app/country selector in row one, using compact labels `PI`, `SME`, and `Kids` plus the selected country name.
  - The combined selector dropdown now contains two sections, `App` and `Country`, so app level can be selected first and country can be selected from the same open menu.
  - The old standalone row-two country dropdown was removed.
  - The release selector now occupies the left side of row two and displays `Baseline App` or `Future App`.
  - The future-feature selector remains immediately next to the release selector when `Future App` is active.
- Verification:
  - `npm run build` passed on 2026-07-06 after the header/docs update; the known empty `react-vendor` chunk warning remains.
  - In-app browser smoke on CZ Account Detail confirmed header buttons `PI - Czech Republic`, `Future App`, and `CZ - Chatbot`, with no standalone `Czech Republic` selector button.
  - In-app browser smoke opened the combined selector and confirmed `App`, `Country`, `PI App`, `SME App`, `Kids App`, and `Hungary` are present.
  - In-app browser smoke selected `Kids App` then `Hungary` from the same dropdown and confirmed the header changed to `Kids - Hungary`, the URL changed to `product=KIDS_PI&country=HU`, and no standalone country button appeared.
- Banana Loop result:
  - fixed: duplicate app/country header controls were consolidated into one selector, reducing header clutter without changing the underlying product/country state model.
  - triaged: no new follow-up banana was introduced; existing automated two-line-header regression coverage remains a next task.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 Level 2 Back Navigation Fallbacks

- Latest request handled: user reported that many Level 2 Back buttons looked broken and did not return to the page they came from, especially when opening a deep-linked account-detail URL.
- Runtime changes:
  - `src/app/contexts/NavigationContext.tsx` now defines deterministic fallback parents for direct-entry screens when the navigation stack has no previous screen.
  - Account and Card detail fallback to Home; Account info/options/transaction detail fallback to Account Detail; Documents/Settings/Contacts fallback to More; Payments flow steps fallback through their logical parent screens; Investments History fallback to Investments.
  - `canGoBack` now reports true for screens with a deterministic fallback, not only for screens with a populated in-memory stack.
- Verification:
  - `npm run build` passed on 2026-07-06; the known empty `react-vendor` chunk warning remains.
  - In-app browser smoke on direct CZ Account Detail URL `screen=account-detail&account=sav-1` confirmed one Back button and Back changes the URL to `screen=homepage`.
  - In-app browser smoke on direct CZ Documents URL confirmed Back changes the URL to `screen=more`.
  - In-app browser smoke on direct CZ Account Details Info URL `screen=account-details-info&account=sav-1` confirmed Back changes the URL to `screen=account-detail&account=sav-1`.
- safe to resume: yes

## 2026-07-06 Stakeholder Header More Menu And Focus Preview

- Latest request handled: user asked to consolidate the top-right stakeholder controls into a `More` menu containing `Settings`, `Screenshots`, and `Light mode`, and to add a Play icon before Share that opens the demo in a large modal-style preview.
- Runtime changes:
  - `src/app/components/demo/DemoTopBar.tsx` now keeps the right-side action row focused as `Refresh`, `Open large demo`, `Share`, and `More actions`.
  - `Settings`, screenshot/JSON export, and the current Light/Dark appearance control now live inside the `More actions` dropdown; screenshot options are exposed through a `Screenshots` submenu and reuse the existing PNG/Figma JSON export implementation.
  - `src/app/components/demo/DemoShell.tsx` now supports a large focus preview mode triggered by the Play icon. It repositions the existing demo frame into a fixed dialog-like overlay, preserves the active app state, supports close and Escape, and removes the double stakeholder header from the demo viewing area.
  - `src/app/components/demo/DemoShell.tsx` now also stretches the normal preview body as a real flex column, so `MobileFrame` receives the full available desktop height instead of collapsing to its content height; Account Detail and other Level 2 screens no longer leave a large empty band under the phone and the phone frame scales larger.
  - `src/app/components/icons/AppIcon.tsx` adds a centralized `play` icon entry so the topbar does not import lucide directly.
- Verification:
  - `npm run build` passed on 2026-07-06 after the focus-preview/layout fix; the known empty `react-vendor` chunk warning remains.
  - In-app browser smoke on `http://127.0.0.1:3001/` confirmed the header buttons expose `Refresh`, `Open large demo`, `Share`, and `More actions`, with no separate Screenshot, Light/Dark, or Settings buttons.
  - In-app browser smoke confirmed `More actions` opens a menu with `Settings`, `Screenshots`, and `Light mode`; hovering `Screenshots` opens the existing `Capture entire screen`, `Capture visible screen`, `Generate visible JSON`, and `Generate entire screen JSON` actions.
  - In-app browser smoke confirmed Play opens `[data-demo-focus-mode="true"]` as an aria-modal dialog with a visible close control and the phone demo inside, and Close returns to the normal two-line header layout.
  - In-app browser geometry check on CZ Account Detail confirmed the preview container now fills the full available area (`795px` tall), the phone screen scales to `741px` tall, and top/bottom gaps are balanced at `27px` instead of leaving the large empty bottom region.
- safe to resume: yes

## 2026-07-06 CZ Chatbot Header/Floating Actions

- Latest request handled: user asked for the conversation-list open/close transition to feel slower and smoother instead of snapping cheaply.
- Runtime changes:
  - Renamed the visible future feature from `CZ Co-Apping Chatbot` to `CZ - Chatbot` in the stakeholder Future dropdown and current registries.
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` now treats the conversation-list header as a local chat-history page: left Back returns to the new-conversation home, the center Search/Discovery segment is hidden, and the right-side Close/X is replaced by a spacer.
  - Discovery/Explore mode now keeps the same top controls as new chat: Back on the left, Search/Discovery toggle centered, and Conversations on the right.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` now positions conversation-list floating actions across the full assistant width: scroll-to-latest/top is centered on the phone, while `New+` stays right-aligned and raised above the search bar.
  - Chat header controls and composer action buttons were tightened to 32x32 controls with 18px icons, and the composer row was reduced to a 44px minimum height so the phone UI no longer reads oversized.
  - The conversation-list trigger now uses a cleaner two-line drawer icon, and the conversation list opens with a right-to-left drawer-style transition that respects reduced-motion preferences.
  - The Search/Discovery segment was tightened further to a compact 112x30 control with 15px icons and a neutral hover treatment, while the drawer transition remains slowed/smoothed, back-to-chat content eases in, and suggested topic rows keep the added vertical spacing.
  - Agent replies in existing and newly generated CZ chatbot conversations now render with a richer AI-response format: bold section headings, tighter paragraphs, inline emphasis, bullet rows, and numbered steps instead of a flat text block.
  - The chat scroll-to-latest affordance was raised above the composer so it keeps a visible gap instead of sitting directly on the input rail.
  - Agent response typography was tuned to 16px headings and 14px minimum body/list text, with neutral gray bullets/number badges and a neutral gray scroll-to-latest affordance instead of teal emphasis.
  - The conversation `More` menu now matches the attachment menu pattern by adding icons for Share, Rename conversation, and Delete conversation, while keeping Delete in the same neutral text treatment as the rest of the menu.
  - Conversation-list `New+` was removed from the floating bottom action area and replaced with an icon-only `Start new conversation` control in the top-right header, keeping the bottom area dedicated to search and optional scroll-to-top only.
  - New outgoing mocked CZ chatbot messages now show a semantic working state before the reply resolves, replacing the generic three-dot typing pill with contextual status copy such as `Checking payment options and account limits...` or `Reviewing savings and investment context...`.
  - `package/mobile-pi-coapping-chat-package/src/icons.tsx` adds a small sparkle status icon and `package/mobile-pi-coapping-chat-package/src/coapping.css` styles the working state as a neutral 14px inline row with reduced-motion support.
  - The supplied `export-icon.svg` mark is now implemented as `ExportIcon` with mono/color variants: mono renders white inside the level-1 floating launcher, while the new-conversation empty state uses a non-teal purple/pink/blue/orange gradient variant.
  - The level-1 floating launcher is a smaller 44px statusless bubble with a proportional 24px white mono `ExportIcon`; the old green online-status dot no longer renders.
  - The new-conversation assistant screen now centers the color `ExportIcon` above a time-aware greeting for `Teodora`; the greeting uses morning/afternoon/evening copy based on the current browser time.
  - Default suggested topics now contain six banking prompts, adding savings planning and document search, with matching mocked formatted replies.
  - New-conversation suggested topics now use one generic document-style icon for every row instead of topic-specific icons; Discovery article icons remain variant-specific.
  - The empty-state AI mark has a subtle float/glow/sparkle animation and respects reduced-motion preferences; the mark, title, and topics disappear as soon as the user sends the first message.
  - Conversation detail now uses a continuous white assistant/chat/composer surface, removes the header bottom separator/shadow, and renders user bubbles as neutral gray `#f1f2f2` with no extra shadow.
  - New-conversation topic rows now render at 16px with 21px line height and an 18px grid gap so the six suggested topics read less cramped.
  - Newly generated mocked agent replies now stream into the conversation word-by-word at a fast AI-like cadence; feedback controls and the final timestamp appear only after the response finishes composing.
  - Chat messages now support optional `createdAt` timestamps; generated user/agent messages stamp the current date, mocked history derives dates from conversation subtitles, and rendered labels show `Today HH:mm`, `Yesterday HH:mm`, or `D Mon HH:mm` as appropriate.
  - New-conversation generic topic icons now use a thinner custom SVG stroke and softer neutral color; composer send, attachment menu, and More-menu action icons were reduced to lighter 16-17px glyphs with neutral 28px icon wells.
  - The empty-state `ExportIcon` color variant now ties the main star to the audio-button family through cyan/green-blue/blue stops, while the small accent star uses the blue chat/send entrypoint palette.
  - Conversation list now uses `overscroll-behavior: contain` and a smaller `92px` bottom padding, reducing the empty space that appeared above the fixed search rail at the end of the list.
  - The conversation-list scroll-to-top button now uses the same neutral white/gray treatment as the header controls instead of teal.
  - Discovery mode now preserves the conversation `More options` action on the right whenever an active conversation exists, instead of swapping to `Open conversations`.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` now defines dark-mode `--mpc-*` tokens under `[data-uc-theme="dark"]` and routes the chatbot surface, controls, menus, composer, conversation list, and formatted reply colors through theme-aware variables.
  - Documents, Account Detail, and Card Detail Help icons now open the CZ chatbot directly into a contextual new-conversation state with page-specific titles and suggested topics.
  - `CoAppingChatLauncher` now supports controlled open state, a contextual `entryContext`, and `bubble` / `edge-tab` launcher variants; normal level-1 bubble opens clear context so the default chat remains unchanged, while non-L1 in-app screens render a slim right-edge tab using the same `ExportIcon`.
  - CZ Chatbot launcher classification treats Home, Spending/Analytics, Payments, Products, and More as Level 1 bubble screens; every other in-app screen where the launcher is mounted uses the edge tab and opens with contextual topics where available.
  - The chatbot reply resolver now includes an account-help branch and keeps card-specific prompts ahead of generic transaction matching so Card Detail topics return card guidance.
  - New-conversation suggested-topic shelf now uses asymmetric margins so its topic icons align with the composer `+` control instead of reading as a centered floating block.
  - Conversation-list open/close now uses a real drawer lifecycle: the list enters from the right over `0.56s`, remains mounted during a `0.52s` exit animation with `mpc-conversation-list-exiting`, and only then returns to the new-conversation/chat surface.
- Verification:
  - `npm run build` passed twenty-nine times on 2026-07-06; the known empty `react-vendor` chunk warning remains.
  - In-app browser on `http://127.0.0.1:3001/?product=PI&country=CZ&scenario=active&ds=current&release=release-future-cz-coapping&bank=retail-single-account&theme=light&lang=en&screen=homepage` confirmed conversation-list header has Back to new conversation, no Close assistant button, and no mode segment.
  - Browser geometry check after scrolling confirmed assistant center `x=611`, scroll button center `x=611`, `New+` raised above search (`New+ bottom=769`, search top=802), and Back returns to the new-chat home.
  - Browser reload cleared a hot-reload-only boot error and confirmed the Future dropdown label is `CZ - Chatbot`; opening Explore confirmed assistant aria label `CZ chatbot`, Back on the left, Discovery active in the centered toggle, Conversations on the right, and no Close assistant button.
  - Browser measurement on the conversation detail confirmed header buttons and composer buttons compute to 32x32 CSS pixels, rendering about 29x29 in the scaled phone frame, with no boot error.
  - Browser DOM check confirmed the conversation trigger SVG has exactly two rounded-line paths and opening it mounts the list with `mpcConversationDrawerIn`.
  - Browser DOM check after the compact polish confirmed the segment computes to 132x34 CSS pixels (about 120x31 in the scaled phone), mode icons are 16px, suggested-topic gap is 22px, conversation drawer animation is `0.36s`, and back-to-chat content animation is `0.32s`.
  - Static coverage check confirmed all 35 existing mock agent messages have polished formatted-response replacements (`missing=[]`).
  - In-app browser smoke opened the existing `Investment advice for my savings` conversation and confirmed 7 formatted agent headings, 13 bullet rows, 10 numbered steps, and 12 paragraphs; the scroll-to-latest button computed to `bottom: 118px` with a 22px gap above the composer.
  - Browser computed-style check confirmed headings render at `16px`, paragraphs/list rows at `14px`, bullet markers use neutral `rgb(118, 118, 118)`, number badges use neutral gray on `#f1f2f2`, the scroll-to-latest button uses neutral gray text/border, and all three `More` menu rows have one icon each with neutral text including Delete.
  - Browser DOM/geometry check on the conversation list confirmed `Start new conversation` renders as a top-right 32px header icon, `New+` no longer appears (`oldNewCount=0`), and the search row remains unobstructed at the bottom.
  - In-app browser smoke on the new-message path confirmed the assistant shows `Checking payment options and account limits...` immediately after `How do payments work?`, with 14px neutral gray status text and a muted status icon, then removes the working state once the formatted `Payment route` reply appears.
  - In-app browser style/DOM check confirmed the launcher renders as a scaled 44px CSS button with a statusless 24px white mono `ExportIcon`, the empty-state mark is centered on the assistant x-axis, and the mark is absent immediately after the first suggested-topic message is sent.
  - Browser DOM/style check confirmed the new-conversation title is `Good morning, Teodora`, the color mark uses voice/send-aligned gradient stops with `mpcAiMarkFloat` / `mpcAiMarkSparkle` animations, six topic rows render, all topic icons are the same generic SVG (`uniqueTopicIconCount=1`), and topic layout computes to `15px` gap with `15px` row text.
  - Browser computed-style check after sending `How do payments work?` confirmed assistant/header/chat/composer backgrounds are all white, header `box-shadow` is `none`, header bottom border is `0px`, the user bubble background is `rgb(241, 242, 242)`, user bubble shadow is `none`, and the mocked `Payment route` reply still resolves after the thinking state.
  - Browser computed-style check on the new-conversation topic list confirmed `topicCount=6`, `rowFontSize=16px`, `rowLineHeight=21px`, `listGap=18px`, and a remaining 13px gap above the composer.
  - Browser computed-style check on the level-1 launcher confirmed `launcherWidth=44px`, `launcherHeight=44px`, `svgWidth=24px`, `svgHeight=24px`, and `.mpc-chat-launcher-status` count `0`.
  - Browser streaming check sent `How do payments work?` from a fresh new conversation and confirmed the generated agent reply had partial text plus streaming cursor and no meta at the first sample, longer partial text after 260ms, then final text with `streamingCount=0`, `cursorCount=0`, one meta row, and two feedback buttons.
  - Browser check after the timestamp/segment update confirmed the Search/Discovery segment uses `flex-basis: 112px`, measured about `102x27px` inside the scaled phone, and the `How do payments work?` historical conversation rendered contextual labels `Yesterday 17:41`, `Yesterday 17:42`, `Yesterday 17:44`, and `Yesterday 17:45`.
  - Browser style check after icon polish confirmed topic icons render about `18.25px` in the scaled phone with `rgba(38, 38, 38, 0.68)`, send/attachment/more SVGs render about `14.6px`, menu icon wells render about `25.5px`, and the empty-state mark keeps explicit SVG gradient stops.
  - Browser conversation-list check confirmed `paddingBottom=92px`, `overscrollBehavior=contain`, max/actual scroll both `660`, last-item-to-search gap about `91px`, and scroll-to-top button colors `rgba(255,255,255,0.96)` / `rgba(38,38,38,0.72)` with neutral border.
  - Browser empty-state check confirmed the hero is present, the main `ExportIcon` star uses `#00a7b3`, `#008c95`, `#0072ce` to match the voice button family, and the small accent star uses `#004f95`, `#0072ce` to match the blue chat/send entrypoint family.
  - Browser dark-mode check on `theme=dark` confirmed assistant/header/control/promo surfaces compute to dark tokens (`assistantBg=rgb(23,23,23)`, `assistantColor=rgb(245,245,245)`, `controlBg=rgb(36,36,36)`) and active-conversation Discovery shows `rightButtonAria="More options"` with zero `Open conversations` buttons.
  - Browser coordinate-click smoke confirmed the dark conversation list can still mount from the header (`Back to new conversation` / `Start new conversation`, `theme=dark`) after the theme-token changes.
  - Browser smoke on direct Level 2 URLs confirmed Documents Help opens `How can I help you with Documents?` with four document topics in dark mode, Account Detail Help opens `How can I help you with this account?` with four account topics, and Card Detail Help opens `How can I help you with this card?` with four card topics.
  - Browser L1/L2 launcher smoke confirmed Home renders the compact bubble launcher, Account Detail renders `.mpc-chat-launcher-edge-tab` as a right-edge black tab and opens `How can I help you with this account?`, and Messages renders the same edge tab with `How can I help you with Messages?` fallback topics.
  - Browser geometry check on the new-conversation screen confirmed `.mpc-topic-shelf` computes to `margin-left: 28px` and `margin-right: 16px`; the first topic icon center and composer `+` center align exactly (`delta=0`).
  - Browser topic smoke confirmed `Review card transactions` sends the prompt, hides suggested topics, streams a formatted reply, and resolves to `Card and security checks` with feedback buttons.
  - Browser transition check confirmed conversation-list enter uses `mpcConversationDrawerIn` at `0.56s` with `cubic-bezier(0.16, 1, 0.3, 1)`, Back applies `mpc-conversation-list-exiting` with `mpcConversationDrawerOut` at `0.52s`, and after exit the list is unmounted while the new-conversation hero/topics return.
- Limitations:
  - Interactive product cards/CTAs remain intentionally deferred for follow-up discussion.
  - Adaptive L1/L2+ launcher behavior and contextual Level 2 Help are wired for the CZ Future chatbot preview only; non-CZ/non-Future contexts keep their existing behavior.
  - No committed visual regression test exists for the Co-Apping package yet; this remains covered by build plus browser smoke.
- safe to resume: yes

## 2026-07-06 CZ Chatbot And Preview Commit Closeout

- Latest request handled: user asked to fix the empty bottom space under the phone on CZ Account Detail and then commit all uncommitted work locally, without publishing to Vercel.
- Commit scope:
  - all currently modified project files are intended to be staged and committed in one local closeout package.
  - scope includes the CZ chatbot UI/interaction polish, contextual Level 2 Help entry points, adaptive L1/L2 launcher behavior, stakeholder top-bar More/Play preview changes, the normal preview-height fix, and updated handoff/capability docs.
  - no Vercel deploy/publish action is part of this closeout.
- Verification:
  - `npm run build` passed on 2026-07-06; the known empty `react-vendor` chunk warning remains.
  - `npm run audit:templates` passed: `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - In-app browser geometry check on CZ Account Detail confirmed the preview container now fills the available desktop area (`795px` tall), phone screen height is `741px`, and top/bottom gaps are balanced at `27px`.
- Banana Loop result:
  - fixed: the normal desktop preview body no longer collapses under Level 2 screens, removing the blank bottom band and letting the phone frame scale larger.
  - triaged: no automated visual regression exists yet for desktop preview auto-fit; this remains covered by existing next-task visual-regression work.
  - already known: oversized image assets and empty `react-vendor` chunk remain non-blocking known bananas.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-05 Full Workspace Commit Closeout

- Latest request handled: user asked to commit everything currently uncommitted so the workspace is clean.
- Commit scope:
  - all currently modified and untracked project files are intended to be staged and committed in one closeout package.
  - scope includes the recent Baseline/Future selector and CZ Co-Apping preview package, HU Kids polish carried in the working tree, performance refactor (`manualChunks`, `React.lazy`, DemoStore memo/split), Kids split Phase 0, handoff docs, capability-map updates, and the new HU sun asset.
  - `package/mobile-pi-coapping-chat-package/` is intentionally included in Git as part of this closeout, resolving the earlier untracked-package deployment risk.
- Verification before commit:
  - `npm run build` passed on 2026-07-05. Output confirms App chunk at `472.35 kB` with lazy screen/vendor chunks; Vite also reports `Generated an empty chunk: "react-vendor"` as a non-blocking follow-up observation.
  - `npm run audit:templates` passed: `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- Banana Loop result:
  - fixed: the CZ Co-Apping package is no longer left as hidden/untracked runtime work once this commit is created.
  - triaged: oversized source/runtime assets remain the next high-ROI cleanup; several referenced Figma PNG assets are still multi-MB and are now tracked in `known-bananas.md` / `next-tasks.md`.
  - triaged: the empty `react-vendor` manual chunk is non-blocking but should be reviewed in a follow-up chunking pass.
  - already known: no local `typecheck`, `lint`, or full automated test scripts exist yet; build plus audits remain the repeatable verification gates for this repo.
  - already known: HU theme contrast on Payments/More still needs visual verification from a stable browser session or the user.
- Constitutional Check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes after commit succeeds

## 2026-07-05 Critical Refactor — Bundle + DemoStore + Kids split Phase 0

- Latest request handled: user asked to resolve the 3 most critical maintainability risks identified in the architecture audit (god file, monolithic bundle, unstable DemoStore).
- Approved plan: 6 steps (rising risk, declining immediate value). Completed 5/6. Step 6 (Rs extract) deferred to a dedicated Kids session.
- Changes delivered:

### PASUL 1 — `manualChunks` in `vite.config.ts` (zero-risk config)
- Added `build.rollupOptions.output.manualChunks` block splitting the monolithic ~2 MB App chunk into 9 stable vendor groups: `react-vendor`, `radix`, `motion`, `charts` (recharts), `icons` (lucide), `date`, `overlays`, `forms`, `utils`.
- Pure chunking change — no runtime behavior affected.

### PASUL 2 — `React.lazy` for 23 screens in `src/app/App.tsx`
- Converted all 23 screen imports from static to `React.lazy(() => import(...))`.
- Added two `<Suspense>` boundaries with a lightweight inline `ScreenFallback` (spinner on `--uc-surface`).
- `DomesticPaymentFlowScreens` (5 named exports in one module) kept as static import — they already share one emitted chunk.
- `MobileFrame`, `FramelessDeviceFrame`, `DemoShell`, `DemoNavigationSync`, `useProducts` stay eager (frame/shell/infra).

### PASUL 3 — DemoStore minimal fix (`src/app/state/demoStore.tsx`)
- Wrapped all 15 setters in `useCallback` (stable identity).
- Wrapped `value` object in `useMemo([state, ...stable setters])`.
- Fixed latent correctness issue: `setFlag` / `resetFlags` now read `getContextKey(prev)` inside the updater instead of closing over `state` at render time — more correct AND stable.

### PASUL 4 — DemoStore targeted split (useCountry + useProductData)
- Added two narrow sub-contexts (`CountryContext`, `ProductDataContext`) with memoized slice values.
- Added two selector hooks: `useCountry()`, `useProductData()`.
- Migrated `useProducts.tsx` to `useProductData()` (highest value — stops product re-derivation on theme/flag toggle).
- Migrated 11 country-only consumers to `useCountry()`: InteractivePreLoginActive, LanguageSelector, PanelOverlay, PreLoginScreen, LanguageContext, AnalyticsScreen, DocumentsScreen, MessagesScreen, MoreScreen, ProductsScreen (2 sites), PaymentsScreen (1 of 2 sites).
- `useDemo()` unchanged for demo chrome that legitimately needs everything (DemoTopBar, AppShell, DemoFeatureSidePanel, DemoNavigationSync).

### PASUL 5 — Kids split Phase 0: extract `shared/money.ts`
- Created `src/app/screens/kids/shared/money.ts` with: `formatKidsMoney`, `formatSignedKidsMoney`, `resolveIconName`, `TONE_CLASSES`.
- Removed the definitions from `KidsMarketHomeApp.tsx` and replaced with an import.
- First file of the kids modular split structure. Folder layout prepared for Phase 1+ (rs/, sk/, hu/, shared/).

- Verification:
  - `npx vite build` passed after each of the 5 steps (last build 3.4s, clean).
  - App chunk: **2.058 kB → 472 kB (77% reduction)**. Lazy per-screen chunks emitted (DesignSystemPage 310 kB, KidsMarketHomeApp 224 kB, RoKidsApp 65 kB, etc.).
  - `value` identity churn stopped (memoized). Setters stable. `useProducts` + 11 consumers no longer re-render on theme/flag toggle.
- Limitations:
  - PASUL 6 (Rs extract, ~880 lines) not done — deferred to dedicated Kids session per user decision. Next steps: Phase 1 Rs → Phase 2 Sk → Phase 3 Hu (sub-phased) → Phase 4 slim dispatcher.
  - HU theme contrast issues on Payments/More (from earlier this session) still need visual verification by the user.
- safe to resume: yes

## 2026-07-04 CZ Co-Apping Full-Page Assistant

- Latest request handled: user approved converting the Czech Republic Future `CZ Co-Apping Chatbot` from a bottom-sheet assistant into a full-page assistant surface.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` now makes the assistant fill the phone viewport, hides the sheet grabber, removes the bottom-sheet radius/shadow, and uses a full-page horizontal enter/exit transition.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` now reserves a simulated iPhone status-bar safe area so the assistant header controls sit below the dynamic island instead of overlapping it.
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` updates assistant header navigation: a new chat uses Back to return to the app and the right-side conversations button opens history; conversation detail keeps Back to conversations plus More; list/discovery can close the assistant.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- Limitations:
  - Conversation history still opens in-place; the lateral drawer animation remains a future polish item.
  - `package/mobile-pi-coapping-chat-package/` remains untracked in Git; add it before any Git-based deploy that should include the CZ Co-Apping runtime.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Chat Scroll Feedback

- Latest request handled: user asked for Czech Republic Future `CZ Co-Apping Chatbot` conversation detail to open at the latest message, show a scroll-to-bottom affordance after scrolling upward, and add AI response feedback controls.
- Runtime changes:
  - Added a dedicated chat transcript ref and scroll tracking in `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx`.
  - Conversation detail now snaps to the newest message on open/message updates and shows a centered down-arrow button when the user scrolls away from the bottom.
  - Added thumbs up/down feedback controls before AI response timestamps.
  - Styled the scroll affordance and feedback buttons in `package/mobile-pi-coapping-chat-package/src/coapping.css`.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- Limitations:
  - Feedback controls are UI-only and do not yet persist or call telemetry/API.
  - `package/mobile-pi-coapping-chat-package/` remains untracked in Git; add it before any Git-based deploy that should include the CZ Co-Apping runtime.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Conversation Typography Tuning

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` conversation copy to be reduced because 16px felt too large in the chat detail.
- Runtime changes:
  - Tuned `.mpc-agent-copy` and `.mpc-bubble` in `package/mobile-pi-coapping-chat-package/src/coapping.css` to 14px font size with 16px line-height.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- Limitation:
  - `package/mobile-pi-coapping-chat-package/` remains untracked in Git; add it before any Git-based deploy that should include the CZ Co-Apping runtime.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Conversation List Scroll Depth

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` conversation list to include enough mock history for scroll testing, keep `New+` fixed, show a scroll-to-top affordance when scrolled, and remove `Last conversation` copy from row subtitles.
- Runtime changes:
  - Added 10 more mocked conversation histories in `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx`, each with internal message content.
  - Added conversation-list scroll tracking, a fixed floating action rail, and a scroll-to-top button next to `New+`.
  - Cleaned conversation subtitles to date/time only.
  - Updated `package/mobile-pi-coapping-chat-package/src/coapping.css` so the floating controls sit outside the scrollable list and the list keeps enough bottom clearance.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- Limitation:
  - `package/mobile-pi-coapping-chat-package/` remains untracked in Git; add it before any Git-based deploy that should include the CZ Co-Apping runtime.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Chat Detail Polish

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` investment-advice conversation to contain much more text for scroll testing, and for the conversation detail `More` menu to expose `Share`, `Rename conversation`, and `Delete conversation`.
- Runtime changes:
  - Extended the mocked `investment-advice` conversation in `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` with longer investment guidance, follow-up questions, fee/recurrent-order context, and a future Investments deep-link placeholder.
  - Added `isMoreMenuOpen` state and a detail-only More popover in `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx`.
  - Added compact popover styling in `package/mobile-pi-coapping-chat-package/src/coapping.css`, including a danger treatment for `Delete conversation`.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- Limitations:
  - `Share`, `Rename conversation`, and `Delete conversation` are staged UI actions only; they do not yet mutate or persist conversation state.
  - `package/mobile-pi-coapping-chat-package/` remains untracked in Git; add it before any Git-based deploy that should include the CZ Co-Apping runtime.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping New Chat Close Control

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` empty/new conversation screen to show the `X` close button in the top-right.
- Runtime changes:
  - Updated `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` so the right-side header action renders `Close` for new/list/discovery states and keeps `More` only for an active conversation detail.
  - Kept the left-side contextual behavior intact: new chat opens the conversation list, and conversation detail uses Back.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- Limitation:
  - `package/mobile-pi-coapping-chat-package/` remains untracked in Git; add it before any Git-based deploy that should include the CZ Co-Apping runtime.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Contextual Chat Header

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` header controls to be contextual: empty/new chat opens the conversation list from the left button, conversation detail shows Back on the left, and More only appears once an actual conversation is open.
- Runtime changes:
  - Updated `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` so conversation detail is defined only when there are active messages.
  - Empty/new conversation state now shows the conversations-list control on the left and hides the right-side More action.
  - Conversation detail keeps Back on the left and More on the right; list/discovery states keep their existing close behavior.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- Limitation:
  - `package/mobile-pi-coapping-chat-package/` remains untracked in Git; add it before any Git-based deploy that should include the CZ Co-Apping runtime.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Discovery Feed

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` second header segment to stop acting like another conversation state and instead show a Perplexity-style discovery surface with banking promos, product prompts, articles, and real imagery.
- Runtime changes:
  - Updated `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` so `Discovery` is a separate assistant mode that hides the conversation list, chat messages, suggested-topic empty state, and composer.
  - Added a discovery hero story for investments, two product promo cards, and useful-read rows with reusable topic icons.
  - Updated `package/mobile-pi-coapping-chat-package/src/coapping.css` with the discovery feed layout, image hero, promo-card grid, article rows, and scroll-hidden feed behavior.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- Limitations:
  - Discovery imagery currently uses remote static Unsplash demo URLs until official banking/CMS assets are provided.
  - Discovery cards are mock-driven and do not deep link yet.
  - `package/mobile-pi-coapping-chat-package/` remains untracked in Git; add it before any Git-based deploy that should include the CZ Co-Apping runtime.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Composer Attachment Menu

- Latest request handled: user asked for the `+` button in the Czech Republic Future `CZ Co-Apping Chatbot` composer to expose attachment choices for Camera, Photos, and Files.
- Runtime changes:
  - Added a compact attachment menu anchored to the composer `+` button in `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx`.
  - Added hidden native file inputs so `Camera` triggers image capture, `Photos` opens an image picker, and `Files` opens a generic file picker.
  - Added `CameraIcon`, `PhotosIcon`, and `FileAttachmentIcon` in `package/mobile-pi-coapping-chat-package/src/icons.tsx`.
  - Added attachment-menu styling in `package/mobile-pi-coapping-chat-package/src/coapping.css`.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `git diff --check -- docs/handoff/current-session.md package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx package/mobile-pi-coapping-chat-package/src/icons.tsx package/mobile-pi-coapping-chat-package/src/coapping.css` passed with only the normal Windows LF/CRLF warning for the handoff file.
  - `git status --short` confirms the edited co-apping package files are still untracked (`??`), so Git diff/check coverage for those files remains limited until they are added.
- Limitation:
  - Attachment selection currently opens the native picker only; selected files are not yet rendered as previews, persisted, uploaded, or sent into the assistant conversation.
  - `package/mobile-pi-coapping-chat-package/` remains untracked in Git; add it before any Git-based deploy that should include the CZ Co-Apping runtime.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Investment Advice Conversation

- Latest request handled: user asked for one mocked Czech Republic Future `CZ Co-Apping Chatbot` conversation to contain a longer investment-advice exchange where the user asks for guidance and the AI points toward the Investments area.
- Runtime changes:
  - Replaced the old `Show me product offers` mock conversation in `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` with `Investment advice for my savings`.
  - Added a longer multi-message exchange covering investment goal, time horizon, risk framing, emergency reserve, portfolio/product review, and an `Open Investments` / `Go to Investments` placeholder action.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `git diff --check -- docs/handoff/current-session.md package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` passed with only the normal Windows LF/CRLF warning for the handoff file.
- Limitation:
  - The Investments redirect is still text-only placeholder content; the real deep-link/action should be wired later when the destination contract is defined.
  - `package/mobile-pi-coapping-chat-package/` remains untracked in Git; add it before any Git-based deploy that should include the CZ Co-Apping runtime.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Conversation Title Size

- Latest request handled: user asked for the `Conversations` title inside the CZ Co-Apping conversation list to be smaller.
- Runtime changes:
  - Updated `package/mobile-pi-coapping-chat-package/src/coapping.css` so `.mpc-conversation-title` renders at 14px with an 18px line height.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `git diff --check -- docs/handoff/current-session.md package/mobile-pi-coapping-chat-package/src/coapping.css` passed with only the normal Windows LF/CRLF warning for the handoff file.
- Limitation:
  - `package/mobile-pi-coapping-chat-package/` remains untracked in Git; add it before any Git-based deploy that should include the CZ Co-Apping runtime.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Conversation Search

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` conversation list to include 5 richer mocked conversations and for the bottom search to filter the list, show no results, and provide a clear `X`.
- Runtime changes:
  - Added 5 mocked conversation histories in `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx`, each with multi-message user/assistant content.
  - Extended conversation search so it matches title, subtitle, and full message history text.
  - Added a `No results` state plus a clear-search button in the conversation search bar.
  - Updated `package/mobile-pi-coapping-chat-package/src/coapping.css` for the empty state and search clear affordance.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `git diff --check -- docs/handoff/current-session.md package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx package/mobile-pi-coapping-chat-package/src/coapping.css` passed with only the normal Windows LF/CRLF warning for the handoff file.
- Limitation:
  - `package/mobile-pi-coapping-chat-package/` remains untracked in Git; add it before any Git-based deploy that should include the CZ Co-Apping runtime.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Suggested Topics Plain Rows

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` default suggested topics to stop rendering as a framed container with pill rows and instead match the simple ChatGPT-style icon + text prompt list.
- Runtime changes:
  - Updated `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` so suggested topics render as plain rows with leading icons instead of chip buttons.
  - Added reusable `SuggestedTopicIcon` variants in `package/mobile-pi-coapping-chat-package/src/icons.tsx` for payments, offers, security, and insights.
  - Updated `package/mobile-pi-coapping-chat-package/src/coapping.css` to remove the visible suggested-topics shelf/card styling and per-topic pill styling.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `git diff --check -- docs/handoff/current-session.md package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx package/mobile-pi-coapping-chat-package/src/coapping.css package/mobile-pi-coapping-chat-package/src/icons.tsx` passed with only the normal Windows LF/CRLF warning for the handoff file.
- Limitation:
  - `package/mobile-pi-coapping-chat-package/` remains untracked in Git; add it before any Git-based deploy that should include the CZ Co-Apping runtime.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Conversation List Header Cleanup

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` conversation-list header to show no left-side control for now.
- Runtime changes:
  - Updated `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` so the left header slot renders a non-interactive spacer while the conversation list is open.
  - Detail mode still renders Back -> conversation list on the left, and More options on the right.
  - Added `mpc-chat-control-spacer` in `package/mobile-pi-coapping-chat-package/src/coapping.css` to preserve header alignment without a visible or focusable button.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `git diff --check -- docs/handoff/current-session.md package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx package/mobile-pi-coapping-chat-package/src/coapping.css package/mobile-pi-coapping-chat-package/src/icons.tsx` passed.
- Limitation:
  - `package/mobile-pi-coapping-chat-package/` remains untracked in Git; add it before any Git-based deploy that should include the CZ Co-Apping runtime.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Detail Header Controls

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` conversation detail header to show a Back control on the left and a More / 3-dots control on the right.
- Runtime changes:
  - Updated `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` so conversation detail mode renders Back -> conversation list on the left and More options on the right.
  - Preserved list mode behavior: the left control remains the conversations toggle and the right control still closes the assistant while the conversation list is open.
  - Added reusable `MoreIcon` in `package/mobile-pi-coapping-chat-package/src/icons.tsx`; reused the existing `BackIcon`.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `git diff --check -- package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx package/mobile-pi-coapping-chat-package/src/icons.tsx` passed.
- Limitation:
  - `package/mobile-pi-coapping-chat-package/` is currently untracked in Git. Local build uses it, but a future commit/deploy must explicitly add the package if this runtime should be published from Git.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Conversation List Polish

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` conversation list to remove card-like borders, use simple title/subtitle rows, move `New+` into a floating action, and replace the message composer with conversation search while the list is open.
- Runtime changes:
  - Updated `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` so conversation rows derive their title from the first user prompt when available and show the latest conversation time as the subtitle.
  - Removed `New conversation` from the list body and added a floating `New+` action that resets to a blank conversation with suggested topics.
  - Replaced the normal chat composer with a bottom `Search conversations` bar whenever the conversation list is open.
  - Updated `package/mobile-pi-coapping-chat-package/src/coapping.css` so conversation list rows are plain text rows with separators instead of card boxes.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `git diff --check -- package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx package/mobile-pi-coapping-chat-package/src/coapping.css` passed.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping New Conversation Default

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` sheet to open slightly lower, align the Search/Discovery segmented control with the surrounding header buttons, and default to a new conversation instead of showing the existing assistant intro.
- Runtime changes:
  - Updated `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` so the default chat state is empty and shows vertical suggested topics above the composer, outside the composer container.
  - Added a conversation-list mode behind the top-left conversations button, with actions for `New conversation` and the saved `Smart Assistant intro` conversation.
  - Kept the previous assistant intro as a recoverable conversation instead of showing it by default.
  - Updated `package/mobile-pi-coapping-chat-package/src/coapping.css` so the bottom sheet starts lower under the simulated system bar, the segmented Search/Discovery buttons share the calm light control treatment, and suggested topics are stacked vertically.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings in already-modified files.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Composer Voice Options

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` composer to always expose a small microphone action next to the primary action, so the customer can record a voice message from the start or use the larger voice-conversation action.
- Runtime changes:
  - Updated `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` to render a persistent `mpc-mic-button` between the input and the primary send/voice button.
  - The primary button now remains the large voice conversation action while the input is empty, and switches to send when text is typed.
  - Added an active visual state for the small microphone button in `package/mobile-pi-coapping-chat-package/src/coapping.css`.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings in already-modified files.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Header Identity Cleanup

- Latest request handled: user asked to remove the redundant `Smart Assistant / Online now` identity row from the Czech Republic Future `CZ Co-Apping Chatbot` sheet.
- Runtime changes:
  - Updated `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` to remove the assistant identity row from the sheet header.
  - Removed now-unused identity-row/title/presence CSS from `package/mobile-pi-coapping-chat-package/src/coapping.css`.
  - Kept the top control row with conversations, Search/Discovery segment, and close action.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings in already-modified files.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Launcher Scope

- Latest request handled: user reported that the `CZ Co-Apping Chatbot` floating launcher was visible on `prelogin-active`, but the future assistant should be visible only inside the app experience.
- Runtime changes:
  - Updated `src/app/App.tsx` to derive `isPreloginScreen` / `isInAppScreen` from `currentScreen`.
  - Gated the future `CoAppingChatLauncher` behind `isInAppScreen`, so it no longer renders on `prelogin-active`, `prelogin-inactive`, `flow-library`, or `design-system`, while remaining available on actual Mobile PI app screens for the CZ future feature.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings in already-modified files.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Chat Empty State Topics

- Latest request handled: user clarified that `Suggested topics` should be the default empty chat state, shown above the composer when the chat opens, not something that remains visible after the model/user has already written messages.
- Runtime changes:
  - Updated `package/mobile-pi-coapping-chat-package/src/defaults.ts` so the chat opens with no initial assistant messages.
  - Updated `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` so suggested topics render only while the conversation is empty and disappear after the first sent message / reply cycle starts.
  - Kept the suggested topics outside the composer, directly above it.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Chat Bottom Sheet Direction

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` chat to move away from the full-screen WhatsApp-like treatment and become a bottom-sheet style AI assistant with pull-down close, cleaner header controls, no visible chat scrollbar, AI-style full-width assistant responses, and a composer that defaults to voice mode until the user types.
- Runtime changes:
  - Updated `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` so the assistant opens as a draggable bottom sheet, closes through a pull-down gesture or the top-right X, and keeps suggested topics outside the composer.
  - Updated the chat header to use a compact two-segment Search/Discovery control, a conversations button on the left, and a close button on the right, while preserving assistant identity/status below.
  - Changed assistant messages from avatar + colored bubble to full-width AI response copy with timestamp; user messages remain compact and timestamped.
  - Updated the composer so the primary action is voice mode when the input is empty, switches to send when text is typed, and visually marks active listening mode.
  - Updated `package/mobile-pi-coapping-chat-package/src/icons.tsx` and `src/coapping.css` for the new close, conversations, Search/Discovery, voice-mode controls, bottom-sheet animation, and hidden chat scrollbars.
- Versioning note:
  - The reusable Co-Apping package lives under currently untracked `package/`; these runtime files are present in the workspace and used by the build, but they must be explicitly added if this work is committed.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings in already-modified files.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Chat Composer Polish

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` composer to feel closer to a modern AI chat composer: default placeholder `Ask me anything`, a small microphone control beside Send, and suggested topics placed above the composer instead of inside it.
- Runtime changes:
  - Updated `package/mobile-pi-coapping-chat-package/src/defaults.ts` and `src/types.ts` so the default input placeholder is `Ask me anything` and the microphone button has its own accessible label.
  - Updated `package/mobile-pi-coapping-chat-package/src/icons.tsx` and `src/CoAppingChatAssistant.tsx` to add a compact `MicrophoneIcon` button between the text input and send button.
  - Updated `package/mobile-pi-coapping-chat-package/src/coapping.css` so suggested topics render as a separate shelf above the composer, while the composer itself stays focused on add/input/mic/send and the mobile home indicator.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - Targeted source check found the expected `Ask me anything`, `recordVoiceLabel`, `mpc-topic-shelf`, `mpc-mic-button`, and `MicrophoneIcon` entries in the portable Co-Apping package.
  - Browser automation was not available in this turn because the expected `node_repl` browser control tool was not exposed; verification is code/build-level.
- safe to resume: yes

## 2026-07-02 HU Kids Earning Education Entry Point

- Latest request handled: user asked for the HU Kids Earning level-1 Education card to use the normal white card surface, and for `Show more` to navigate to the Learn level-2 page instead of expanding the card inline.
- Runtime changes:
  - Updated `src/app/screens/kids/KidsMarketHomeApp.tsx` so the Earning Education card uses a white `--uc-surface` card with standard border/shadow instead of the themed translucent learn surface.
  - Removed the local `showAllEducationTopics` expansion state from Earning; the card now always previews the first two topics.
  - Replaced the custom `SHOW MORE` button with shared `LinkButton` styling, matching the `SEE MORE TRANSACTIONS` chevron spacing/behavior.
  - Wired `SHOW MORE` to `handleOpenLearn`, which now explicitly keeps the bottom navigation on Earning and opens the Learn level-2 page.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- safe to resume: yes

## 2026-07-02 HU Kids Dynamic Card And Spend Model

- Latest request handled: user clarified that the HU Kids card detail artwork must not bake card text/logos into a PNG; the card should use the Figma cat background with dynamic overlay data, real UniCredit/Mastercard marks, a `Your cards` header, and a coherent spend model linking Home available spend with the weekly spending card.
- Runtime changes:
  - Updated `src/app/screens/kids/KidsMarketHomeApp.tsx` so the HU Kids card detail front now uses the clean cat background image plus live overlay text for holder name, masked digits, available spend, UniCredit logo, Mastercard mark, and product name.
  - Replaced the temporary Mastercard mark with the exact SVG supplied from Figma by the user; UniCredit continues to use the repository logo component rather than a fake asset.
  - Renamed the card detail page header from `Cards` to `Your cards`.
  - Added a single HU Kids spend model: `availableToSpend = min(totalMoney, weeklyLimit - weeklySpent)`. Home hero, card overlay, Spending this week, and All your money now derive from that shared model.
- Figma/resource notes:
  - Figma metadata access for the referenced Kids App nodes was unreliable in-session (`INVALID_ARGUMENT` / timeout), so the implementation uses the repo-exported Figma cat background plus the user-provided Mastercard SVG instead of inventing brand marks.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- safe to resume: yes

## 2026-07-02 HU Kids Learn Education Card Cleanup

- Latest request handled: user asked to remove the HU Kids Learn top `Financial education / Money lessons / topics done` block and align the education card to the supplied Kids App Figma reference by showing two lesson/topic rows plus `Show more`.
- Runtime changes:
  - Updated `src/app/screens/kids/KidsMarketHomeApp.tsx` so `HuKidsLearnPage` no longer renders the separate `Financial education` summary block, `New` heading, featured card, or `All topics` grid.
  - Added a compact `HuLearnEducationCard` with a header, two visible topic rows, 80x80 artwork, progress text/bar, and a `Show more` / `Show less` control that expands the remaining topics without breaking topic navigation.
  - Kept existing topic and lesson detail routing intact; each row still opens the selected education topic.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- safe to resume: yes

## 2026-07-02 HU Kids Welcome Sun Accent

- Latest request handled: user asked to add the Figma sun image after `Welcome back` on the HU Kids Home hero.
- Runtime changes:
  - Exported the supplied Kids App Figma node `9146:53524` (`fluent-emoji-flat:sun`, 20x20) as `src/assets/kids/figma/hu-sun-emoji.png`.
  - Updated `src/app/screens/kids/KidsMarketHomeApp.tsx` so `HuLightBalance` renders the sun image inline after `Welcome back Alexandra`.
  - Marked the sun image decorative with empty `alt` and `aria-hidden` so screen readers keep the greeting clean.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- safe to resume: yes

## 2026-07-02 HU Kids Home More And Send Money Cleanup

- Latest request handled: user asked to remove the HU Kids More `Product applications and cancellations` card, remove the Send money result/status card, replace `Grandma` with `More contacts`, and move Home `Your cards` above `Your recent transactions`.
- Runtime changes:
  - Updated `src/app/screens/kids/KidsMarketHomeApp.tsx` so HU Kids More filters out `my-requests`; Contacts, Documents, settings, and Tutorials remain.
  - Updated HU Kids Send money contact chips from `Anna / David / Grandma` to `Anna / David / More contacts`.
  - Removed the initial/latest transfer result card from HU Kids Send money so the form no longer shows the `Money sent / Approved / Back to home` card under the submit button.
  - Reordered HU Kids Home so `Your cards` now renders above `Your recent transactions`.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

## 2026-07-02 HU Kids Figma Cat Card Mapping

- Latest request handled: user asked to map the HU Kids small `Your cards` card and card-details hero 1:1 from the supplied Kids App Figma nodes `9146:18133`, `9146:18040`, and `9146:18567`.
- Runtime changes:
  - Added local Figma-derived card assets under `src/assets/kids/figma/`: `hu-card-home-cat.png`, `hu-card-detail-cat.png`, and `hu-card-bg-cat.png`.
  - Updated `src/app/screens/kids/KidsMarketHomeApp.tsx` so the HU Kids `Your cards` thumbnail uses the Figma cat card artwork instead of the generic debit-card component.
  - Updated the HU Kids card-details hero so the front side uses the Figma cat card with top information, while the revealed/back side uses the clean cat background asset beneath the existing copyable card-detail fields.
  - Aligned the local HU Kids card mock metadata to the Figma card ending `5678` and holder `ALEXANDRA ALBON`.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed for the touched Kids screen and new PNG assets with only normal Windows LF/CRLF warnings.
  - In-app browser smoke on `http://127.0.0.1:4001/?product=KIDS_PI&country=HU&scenario=active&ds=current&release=release-current&bank=kids-child-preview&theme=light&lang=en&screen=homepage` confirmed the Home card uses `/src/assets/kids/figma/hu-card-home-cat.png`, shows `*5678`, and clicking it opens card details with `/src/assets/kids/figma/hu-card-detail-cat.png` plus `/src/assets/kids/figma/hu-card-bg-cat.png`.
- safe to resume: yes

## 2026-07-02 HU Kids Tasks Payments And Goal Icons

- Latest request handled: user asked to make task statuses clearer, remove several HU Kids Payments entries, and diversify Saving goals icons.
- Runtime changes:
  - Updated `src/app/screens/kids/KidsMarketHomeApp.tsx` so HU task rows now show the recurrence plus an explicit status pill: `Pending`, `Waiting parent`, or `Approved`.
  - Filtered the HU Kids Payments page so `Recurrent payments` is removed from the primary cards, while `Card repayment` and `Exchange rates` are removed from the bottom shortcuts.
  - Kept the Payments filtering scoped to `HuKidsPaymentsPage`; `RsKidsPaymentsPage` remains on the unfiltered shared menu.
  - Added `getHuKidsGoalIcon` so `New bike`, `Headphones`, and `School trip` render different icons instead of all using `trophy`.
- Verification:
  - Static inspection confirmed the HU payment filters are applied only inside `HuKidsPaymentsPage`, not `RsKidsPaymentsPage`.
  - Static scan confirmed `Pending`, `getHuKidsGoalIcon`, and the HU hidden payment id sets are present in `KidsMarketHomeApp.tsx`.
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
- safe to resume: yes

## 2026-07-02 HU Kids Tasks Add Button Removal

- Latest request handled: user asked to remove the `ADD NEW TASK` button from the HU Kids homepage Tasks card.
- Runtime changes:
  - Updated `src/app/screens/kids/KidsMarketHomeApp.tsx` so `HuTasksCard` no longer renders the footer action for adding a new task.
  - Removed the whole footer wrapper, not only the label, so no empty spacing or inaccessible hidden control remains.
- Verification:
  - Static scan confirmed `ADD NEW TASK`, `Add new task`, and `add new task` no longer exist in `KidsMarketHomeApp.tsx`.
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
- safe to resume: yes

## 2026-07-02 HU Kids Card Action Icons

- Latest request handled: user asked for the HU Kids `Cards` detail action rail to use the supplied show/details icon for `Card details` and the supplied lock/block icon for `Block card`.
- Runtime changes:
  - Added `show-card-details` as a custom 24x24 SVG icon in `src/app/components/icons/AppIcon.tsx`.
  - Replaced the existing `block-card` custom icon path with the supplied 24x24 lock/block SVG and registered it for the HU Kids card action rail.
  - Updated `src/app/screens/kids/KidsMarketHomeApp.tsx` so the card detail rail uses `show-card-details` for `Card details` and `block-card` for `Block card` instead of the generic `eye` and `lock` glyphs.
- Verification:
  - Static scan confirmed `show-card-details` is registered and used by `KidsMarketHomeApp.tsx`.
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
- safe to resume: yes

## 2026-07-02 HU Kids More Options Sheet Cleanup

- Latest request handled: user flagged that the HU Kids homepage `More options` sheet still showed unnecessary explanatory copy and secondary options.
- Runtime changes:
  - Updated `src/app/screens/kids/KidsMarketHomeApp.tsx` so `HuMoreOptionsSheet` no longer renders the top description `Personalize Alexandra's home...`.
  - Removed the `Standard active` theme meta badge by dropping the unused `currentTheme` prop from the sheet.
  - Removed the secondary `Card controls` and `Safety limits` action buttons from the sheet.
  - Kept the `Themes` row as the only visible action in this specific HU Kids `More options` sheet.
- Verification:
  - Static scan confirmed `Personalize Alexandra`, `Standard active`, `Card controls`, `Safety limits`, `currentTheme={appliedTheme}`, and `currentTheme` no longer exist in `KidsMarketHomeApp.tsx`.
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
- safe to resume: yes

## 2026-07-01 Design System Specimen Background And Shopsmart Layout

- Latest request handled: user flagged that several component specimens showed an unnecessary grey/blue preview background, that the Shopsmart examples were stacked vertically and too large, and that the `Country coverage` overview block was not useful.
- Runtime changes:
  - Updated `src/app/screens/design-system/DesignSystemPage.tsx` so standard Design System Inventory specimens no longer paint an automatic preview background; only explicit dark specimens keep the dark canvas needed for contrast.
  - Removed the extra grey background wrapper from the Pill specimen so the 120x36 pill is presented on the clean card surface.
  - Reworked the Shopsmart specimen into two compact side-by-side previews at approximately 255px width each, preserving the real `ShopsmartOfferCard` runtime component unchanged.
  - Removed the `Country coverage` section and the `Countries` sidebar link from the Design System Inventory component tab.
  - Updated stale/unknown component hashes, including old `#countries`, to fall back to the first remaining component section: `Headers`.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check -- src/app/screens/design-system/DesignSystemPage.tsx` passed with only normal Windows LF/CRLF warnings.
  - Static scan confirmed `Country coverage`, `Markets currently represented`, `CountryCoverageSummary`, and the `Countries` sidebar link no longer exist in `DesignSystemPage.tsx`.
  - In-app browser smoke confirmed Shopsmart renders two cards side by side at about `255x207`, and the Pill specimen preview plus inner wrapper have transparent backgrounds while the pill remains `120x36`.
- safe to resume: yes

## 2026-07-01 Editable Product Mix Control Panel

- Latest request handled: user asked to replace the static `Data Snapshot` grid with editable product-count controls, remove `Goals`, and remove the noisy `Project Pack` section from the Control Panel.
- Runtime changes:
  - Added typed `productCounts` state to `src/app/state/demoTypes.ts` and `src/app/state/demoStore.tsx`.
  - Updated `src/app/components/demo/DemoFeatureSidePanel.tsx` so `Data Snapshot` now exposes editable numeric controls for `Accounts`, `Debit cards`, `Credit cards`, `Meal cards`, `Deposits`, `Savings accounts`, `Loans`, `Mortgages`, and `Investments`.
  - Removed the visible `Project Pack` section from the Control Panel.
  - Updated `src/hooks/useProducts.tsx` so product-count edits rebuild the actual mock product categories used by the mobile demo. `0` removes that product type/category from Home; values above existing mock data generate distinct cloned rows with stable ids, names, and account/card numbers.
  - Added `meal_card` to `src/data/products.ts` so meal cards can be represented separately from debit and credit cards in the product mix.
  - Updated `scripts/audit-reference-platform.mjs` to guard the new editable product-count panel contract and the removed Project Pack panel copy.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check -- src/app/state/demoTypes.ts src/app/state/demoStore.tsx src/data/products.ts src/hooks/useProducts.tsx src/app/components/demo/DemoFeatureSidePanel.tsx src/app/screens/accounts/AccountDetailsInfoScreen.tsx scripts/audit-reference-platform.mjs` passed with only normal Windows LF/CRLF warnings.
  - In-app browser smoke on `http://127.0.0.1:5002/?product=PI&country=RO&scenario=active&ds=current&release=release-current&bank=retail-single-account&theme=light&lang=en&screen=homepage` confirmed the panel shows the nine editable product counts, `Project Pack` is not visible, setting `Accounts=0` removes the visible Accounts section, and setting `Debit cards=3` renders three debit-card rows.
- safe to resume: yes

## 2026-07-01 Control Panel Simplification

- Latest request handled: user flagged the Settings / Control Panel drawer as too noisy and asked to remove the duplicate context, release, product, design-system, appearance, SME/Kids preview, and scenario metadata blocks.
- Runtime changes:
  - Updated `src/app/components/demo/DemoFeatureSidePanel.tsx` so the drawer now starts directly with `Banking Scenario`.
  - Removed the visible `Current Context`, `Release`, `Product`, `Design System`, and `Appearance` sections from the drawer.
  - Removed `SME / owner preview` and `Kids / child preview` from the Banking Scenario picker while leaving those scenario registry entries intact for URL/state compatibility.
  - Removed the Banking Scenario metadata rows `Segment`, `Authority`, `Limit`, and `Daily`.
  - Kept the useful lower sections: `Data Snapshot`, `Rights`, `Project Pack`, `Release Features`, and `Unplanned Features`.
  - Updated `scripts/audit-reference-platform.mjs` so the platform audit now guards the simplified drawer contract and fails if the removed noisy panel copy comes back.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check -- src/app/components/demo/DemoFeatureSidePanel.tsx scripts/audit-reference-platform.mjs docs/handoff/current-session.md docs/handoff/state-of-the-world.md docs/platform-capability-map/README.md` passed with only normal Windows LF/CRLF warnings.
  - In-app browser smoke after reload confirmed the drawer is open, removed labels are absent, and the visible panel starts with the simplified scenario/data/rights/project-pack/feature structure.
- safe to resume: yes

## 2026-07-01 Flow Library Demo Preview Caption Cleanup

- Latest request handled: user flagged the redundant title/description under the Flow Library `Demo` phone preview, e.g. `Card options` / `The change action branches...`.
- Runtime changes:
  - Updated `src/app/screens/flow-library/FlowLibraryScreen.tsx` so the large demo preview renders only the selected phone screen.
  - Step title and description remain available in the left-side interactive step list, where they are useful for navigation.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check -- src/app/screens/flow-library/FlowLibraryScreen.tsx docs/handoff/current-session.md` passed with only normal Windows LF/CRLF warnings.
  - Targeted static scan confirmed the removed preview-caption bindings `activeStep.title`, `activeStep.description`, and `mt-[38px]` no longer exist in `FlowLibraryScreen.tsx`.
- safe to resume: yes

## 2026-07-01 Design System Colors Cleanup

- Latest request handled: user flagged that the `Colors` inventory cards were too tall/noisy, that source token pills and dark-mode notes were not useful, and that `App color map` status tags such as `mapped` should not exist.
- Runtime changes:
  - Compact `ColorCard` specimens by reducing swatch height, padding, metadata font size, and spacing.
  - Removed visible source-token pills such as `Primary / 100`, `Primary / 600`, and `Copy 2-5`.
  - Removed visible dark-note helper text such as `Dark surfaces move to Primary 900...`.
  - Removed the color inventory stats strip, including `Mapped app colors`.
  - Reworked `App color map` rows into the same compact two-column card grid language as the palette cards.
  - Removed visible status tags from `App color map` rows.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check -- src/app/screens/design-system/DesignSystemPage.tsx docs/handoff/current-session.md docs/handoff/state-of-the-world.md docs/platform-capability-map/README.md` passed with only normal Windows LF/CRLF warnings.
  - Targeted static scan confirmed removed color UI artifacts are no longer rendered from `DesignSystemPage.tsx`: status-tag renderer, `Mapped app colors`, source-token pills, visible `item.status`, and the dark-note helper copy.
- safe to resume: yes

## 2026-07-01 Design System Inventory Cleanup

- Latest request handled: user flagged several noisy or visually broken Design System Inventory specimens and asked for cleanup in Overview/Countries, Forms, and Cards.
- Runtime changes:
  - Removed the `Coverage summary` overview section from the Design System Inventory.
  - Simplified `Country coverage` so it no longer renders the country dropdown, `No Co-Apping` badge, `RO · RON` label, or the languages/products/more-cards detail grid.
  - Fixed the `Date filter` specimen chip sizing/centering and aligned its source metadata to the rendered 286px / 24px control.
  - Swapped the ProfileAvatar photo specimen to a normal static PNG photo.
  - Updated the Helper Card specimen to English copy and disabled the visible close control for this card variant.
  - Removed the raw Home content module specimen that exposed translation keys such as `home.quick.actions.title` and `home.transactions.title`.
  - Replaced the product evolution placeholder `UC` badge with the shared account-details AppIcon.
- Verification:
  - Static scan passed for removed strings/selectors: `Coverage summary`, `country-coverage-select`, `No Co-Apping`, `RO · RON`, `Română, English`, `Home content modules`, `home.quick`, `home.transactions`, old Helper Card copy, and `>UC<` no longer appear in the Design System Inventory source.
  - Targeted source scan confirmed the new DateFilter dimensions, static PNG avatar sample, English Helper Card copy, and `account-details` icon usage.
- safe to resume: yes

## 2026-07-01 Platform Surface Header Simplification

- Latest request handled: user flagged that the second stakeholder-header row with country, baseline, active/inactive, and demo actions is not useful on `Flows` and `Design system`, and that the Flow Library dropdown is too wide.
- Runtime changes:
  - Updated `src/app/components/demo/DemoTopBar.tsx` so `Flows` and `Design system` render only the first stakeholder-header row: logo/product selector, centered platform tabs, profile initials, and logout.
  - Demo/mobile app screens keep the second header row with country, baseline, scenario, screenshot, refresh, share, theme, and settings controls.
  - Updated `src/app/screens/flow-library/FlowLibraryScreen.tsx` so the flow-select dropdown uses a 280px desktop column instead of the previous 420px-wide layout.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check -- src/app/components/demo/DemoTopBar.tsx src/app/screens/flow-library/FlowLibraryScreen.tsx` passed with only normal Windows LF/CRLF warnings.
  - In-app browser smoke confirmed Flow Library header has one row, no `Romania / Current baseline / Active` row, and `#flow-library-select` width is `280px`.
  - In-app browser smoke confirmed Design System header also has one row and no context-control row.
- safe to resume: yes

## 2026-07-01 Flow Library Tabs And BA Spec

- Latest request handled: user asked to remove the bordered/titled `Flows` card, improve the flow dropdown styling, expand the UX spec copy for BA use, and split Flow Library into `Overview`, `Demo`, `Spec`, and `Flow` tabs.
- Runtime changes:
  - Updated `src/app/screens/flow-library/FlowLibraryScreen.tsx` so the flow search and flow select controls sit naked at the top, without the old `Flows` panel title/card chrome.
  - Added local `Overview`, `Demo`, `Spec`, and `Flow` tabs for the Flow Library surface.
  - `Overview` now contains the flow summary, source badges/link, and local country scope selector.
  - `Demo` now provides an interactive preview mode: scenario chips and step buttons drive a single larger phone preview so reviewers can click through states without scrolling a storyboard.
  - `Spec` now contains longer BA-readable narrative sections for RO Round Up and RO Card PIN, including purpose, entry points, eligibility/account logic, signing/feedback, fallback, and governance notes.
  - `Flow` preserves the connected journey storyboard with downloadable preview frames.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check -- src/app/screens/flow-library/FlowLibraryScreen.tsx` passed with only normal Windows LF/CRLF warnings.
  - In-app browser smoke on `http://127.0.0.1:5002/?product=PI&country=RO&scenario=active&ds=current&release=release-current&bank=retail-single-account&theme=light&lang=en&screen=flow-library&flow=ro-round-up` confirmed the old `Flows` section title is gone, the local tabs render, the flow select remains populated, the `Spec` tab shows the expanded Round Up narrative, and the local `Demo` tab can switch to the `Set up Round Up` preview state.
- Limitation:
  - The `Demo` tab is still a mock-driven interactive preview inside Flow Library, not a promoted live Mobile PI runtime flow. Real app execution requires a separate product decision and routing implementation.
- safe to resume: yes

## 2026-07-01 Header Icon Micro-Polish

- Latest request handled: user flagged that the screenshot-options header action must use the supplied camera SVG and that the country/release dropdown chevrons looked too large.
- Runtime changes:
  - Updated `src/app/components/demo/PhoneScreenshotControl.tsx` to render the supplied 24x24 camera SVG inline with `currentColor` instead of the previous lucide camera glyph.
  - Updated `src/app/components/demo/DemoTopBar.tsx` so context dropdown chevrons use a quieter 16px slot and 14px glyph for product, country, and release selectors.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - In-app browser check on Card Detail confirmed the screenshot button renders a `24x24` SVG with `viewBox="0 0 24 24"` and two paths, while `Romania` / `Current baseline` chevrons render as `14x14` SVGs in `16x16` slots.
- safe to resume: yes

## 2026-07-01 More Asset Preload And Header Hover

- Latest request handled: user reported visible image-loading delay when switching to the PI More section and requested header hover states to use teal `#007A91` instead of red.
- Runtime changes:
  - Added `src/app/config/moreCardAssets.ts` as the central registry for all PI More menu card artwork.
  - Added `preloadMoreCardImages`, which warms the browser image cache once per source with async decoding.
  - `AppContent` preloads all More card assets on application boot, and `MoreScreen` preloads the country-specific card set when mounted.
  - More menu cards now consume the shared asset registry and mark inline images as eager/async decoded to reduce visible late-load flicker during section switching.
  - Header interactive hover/active states in `DemoTopBar` and `PhoneScreenshotControl` now use `--uc-action` teal rather than `--uc-brand` red, while the UniCredit logo remains brand red by design.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
- safe to resume: yes

## 2026-07-01 ShopSmart Search Normalization

- Latest request handled: user flagged that the Products / ShopSmart search bar did not behave like Account Details search; after typing, the filter icon stayed visible instead of switching to the clear-search X.
- Runtime changes:
  - Replaced the local `ShopSmartSearchBar` duplicate in `src/app/screens/products/ProductsScreen.tsx` with the shared `AccountSearchBar`.
  - Added stateful ShopSmart offer search, filtering by merchant, title, status, pill/tag, and distance.
  - The right-side search action now follows the shared DS contract: filter icon when empty, `clear-results` X when text exists, and focus remains in the input after clearing.
  - Added a small empty state for searches with no matching offers.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - In-app browser smoke on Products / ShopSmart confirmed typing `5555` changes the right action to `Clear search results` / `Clear results icon 32x32`, clicking it empties the input, restores `Filters` / `Filter icon 32x32`, and the Valentino offer returns.
- safe to resume: yes

## 2026-07-01 Romania Product Sheet Options

- Latest request handled: user flagged that Romania Products bottom sheets showed extra generic product options.
- Runtime changes:
  - Added country-specific product-card sheet overrides in `src/app/config/productsMenuConfig.ts`.
  - Romania `Account` now shows only `Current account` and `Overdraft`.
  - Romania `Cards` now removes `Digital wallets` and renames credit card to `Credit card UniCredit Consumer Financing`, keeping Debit, renamed Credit, and Virtual card.
  - Romania `Borrowing` now shows only `Personal loan` then `Mortgage loan`.
  - Romania `Insurances` now shows `Genius Protect`, `Home insurance`, `Travel`, `My Car`, `Umbrella`, and `Start invest`.
  - Romania product card order now places `Investments and savings` in position 4 and `Insurance` in position 5.
  - Other countries keep the existing shared product-sheet option lists.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - Static config assertion passed: `RO insurance sheet and product order ok`.
- safe to resume: yes

## 2026-07-01 QR Mobile Fullscreen Polish

- Latest request handled: user flagged that QR/mobile opening still shows duplicated top system UI, because the real phone/browser chrome appears above the app while the frameless app still rendered its simulated StatusBar and Dynamic Island.
- Runtime changes:
  - Updated `src/app/components/FramelessDeviceFrame.tsx` so QR/device links (`frame=0`) no longer render the simulated `StatusBar`, `DynamicIsland`, or theme top system-bar wash. Desktop `MobileFrame` remains unchanged.
  - Follow-up mobile polish: replaced the aggressive 54px frameless crop with a `--uc-phone-top-reserve` token. Desktop phone mock keeps the 54px reserve, while QR/device mode uses a smaller 12px top reserve so content is not glued to the browser chrome and is not clipped.
  - Updated `src/app/App.tsx` so device mode uses a `min-h-[100dvh]` shell instead of a forced `h-screen` desktop shell.
  - Added a small mobile browser chrome-collapse helper in `FramelessDeviceFrame`, using a 1px taller document surface and initial scroll nudge where the browser allows it.
  - Added PWA/standalone metadata in `index.html` and `public/manifest.webmanifest` so stakeholders can add/open the demo as an app-like standalone surface instead of a normal browser tab.
  - Stabilized the font fallback stack and font rendering in `src/styles/fonts.css`.
- Font audit:
  - The import chain is present: `src/main.tsx` imports `src/styles/index.css`, which imports `src/styles/fonts.css`.
  - No `.woff`, `.woff2`, `.ttf`, or `.otf` UniCredit font files are currently bundled in the repo; the current `@font-face` rules resolve only from locally installed fonts and otherwise fall back to system fonts.
  - For exact UniCredit typography on mobile devices, a licensed UniCredit webfont asset should be added and referenced explicitly.
- Limitation:
  - A normal Chrome/Safari tab opened from QR cannot be forced by web code to hide the browser URL bar and bottom toolbar permanently. The best app-like result is the new standalone/PWA path; direct browser tabs can only avoid the duplicated in-app status area and opportunistically collapse browser chrome.
- Verification:
  - Static scan passed: `src/app/components/FramelessDeviceFrame.tsx` no longer contains `StatusBar`, `DynamicIsland`, or `uc-phone-system-bar-bg`.
  - Static font scan confirmed there are no bundled `.woff`, `.woff2`, `.ttf`, or `.otf` files in the repo.
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - Build output contains `dist/manifest.webmanifest`.
- safe to resume: yes

## 2026-07-01 QR Share Access Token

- Latest request handled: user asked that opening a Share QR URL on mobile should not force stakeholders to enter the demo password every time.
- Runtime/security changes:
  - Updated `api/access.js` so authenticated desktop sessions can request a short-lived server-signed share token through `GET /api/access?mode=share-token`.
  - Updated `api/access.js` so `POST /api/access` can consume a valid `shareToken`, set the normal 6-month signed HTTP-only access cookie, and clear failed-attempt cookies without requiring the password on that device.
  - Updated `src/app/components/demo/DemoTopBar.tsx` so the QR/device URL gets `frame=0` plus `access_token=...`; the copied desktop link stays clean and does not include the token.
  - Updated `src/app/components/security/AccessGate.tsx` so `access_token` is consumed before the app boots, exchanged for access, and removed from the address bar via `history.replaceState`.
  - Added a strict local-dev-only QR fallback token because Vite dev does not execute `/api/access`; production uses the server-signed token path.
- Verification:
  - `node --check api/access.js` passed.
  - API simulation passed: unauthenticated token issuance returns `401`; authenticated desktop login can issue a share token; a fresh request with only that token receives access; subsequent status check authenticates from the new cookie.
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - In-app browser smoke on `http://127.0.0.1:5002/` opened a local-dev QR-style URL with `frame=0&access_token=local-dev-share-access`; AccessGate removed `access_token`, did not show the password screen, and rendered the demo content.
- Limitations:
  - Localhost QR links still only resolve on the same machine unless the demo is opened through a LAN/IP or deployed URL. Production QR bypass depends on the deployed `/api/access` endpoint being available.
- safe to resume: yes

## 2026-07-01 Header Product Selector Restore

- Latest request handled: user flagged that the application-type selector disappeared from next to the UniCredit logo and asked to restore a clean selector for `PI App`, `SME App`, and `Kids App`.
- Runtime changes:
  - Updated `src/app/components/demo/DemoTopBar.tsx` so the first header row keeps the UniCredit logo and adds a compact product selector beside it.
  - The selector uses the canonical `PRODUCT_ORDER` product registry and displays stakeholder-friendly labels: `PI App`, `SME App`, and `Kids App`.
  - Selecting a product closes open header dropdowns, leaves platform-only surfaces, resets Co-Apping state, applies the product through `setProduct`, and navigates back to the scenario entry screen for the selected app context.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - In-app browser check on `http://127.0.0.1:5002/?product=PI&country=RO&scenario=active&ds=current&release=release-current&bank=retail-single-account&theme=light&lang=en&screen=prelogin-active` confirmed the header exposes `PI App`, opens `Kids App`, changes the URL to `product=KIDS_PI` with the Kids banking scenario, and can switch back to `PI App`.
- safe to resume: yes

## 2026-07-01 Header Action Order Polish

- Latest request handled: user asked to reorder the right-side second-row header actions as Take a photo, Refresh, Share, Light/Dark, Settings, and to hide Take a photo when it is unavailable.
- Runtime changes:
  - Updated `src/app/components/demo/DemoTopBar.tsx` so `PhoneScreenshotControl` renders first only on normal demo screens.
  - Design System Inventory and Flow Library no longer show a disabled screenshot/camera action; the control is omitted entirely there.
  - Reordered remaining header actions to `Refresh`, `Share`, `Light/Dark`, then `Settings`.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - In-app browser check confirmed Design System actions are `Refresh -> Share -> Switch to dark mode -> Settings` with no screenshot/camera button.
  - In-app browser check confirmed Homepage actions are `Screenshot options -> Refresh -> Share -> Switch to dark mode -> Settings`.
- safe to resume: yes

## 2026-07-01 Flow Library Layout Polish

- Latest request handled: user asked to remove the narrow Flow Library sidebar pattern, move the flow selector above the flow summary, widen UX spec and Countries, and place Countries above UX spec.
- Runtime changes:
  - Reworked `src/app/screens/flow-library/FlowLibraryScreen.tsx` from a two-column `Flows` sidebar plus main content layout into a single full-width content stack.
  - New order is `Flows` selector/search, `Countries`, `UX spec`, flow summary header, then `Journey`.
  - Countries and UX spec now use the same full-width page container as Journey instead of the former narrower main-column width.
  - The Round Up / Card PIN flow summary header now sits below UX spec so the operational details lead the page.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - In-app browser check on `http://127.0.0.1:5002/?product=PI&country=RO&scenario=active&ds=current&release=release-current&bank=retail-single-account&theme=light&lang=en&screen=flow-library&flow=ro-round-up` confirmed visible section order `Flows -> Countries -> UX spec -> Round Up -> Journey`, all at `1226px` width.
- safe to resume: yes

## 2026-07-01 Two-Line Stakeholder Header

- Latest request handled: user asked to rebuild the desktop platform header after a LinkedIn-like model, split across two rows so more stakeholder actions remain visible.
- Follow-up request handled: user flagged that the country/release dropdowns were clipped, a scrollbar appeared in the header, and the top search/Notifications tab should be removed for now.
- Latest follow-up handled: user flagged the Demo and Light/Dark icons as visually wrong and asked for the `Active` / `Inactive` controller to sit in the middle of the second header row.
- Runtime changes:
  - Reworked `src/app/components/demo/DemoTopBar.tsx` into a two-line sticky header.
  - First row now contains the UniCredit logo, the restored product selector, centered primary platform tabs (`Demo`, `Flows`, `Design system`), and right-side profile/logout controls with `IM` initials.
  - Second row now contains the country dropdown, current baseline/release dropdown, `Active` / `Inactive` switch, and right-side actions for Settings, Share, Screenshot/JSON export, Light/Dark mode, and Refresh.
  - `Flows` now opens the full-width Flow Library and explicitly selects the first flow preview from `FLOW_PREVIEW_ORDER`.
  - `Design system` opens the current Design System Inventory.
  - Removed header search and the temporary `Notifications` tab until that surface is intentionally added later.
  - Removed header `overflow-x-auto` usage so the header no longer shows an unwanted scrollbar and the country/release dropdowns are not clipped by their row container.
  - Replaced the Demo tab and Light/Dark action with local explicit SVG glyphs instead of invalid `AppIcon` names, preventing the fallback question/help icon from appearing in the stakeholder header.
  - Split the second header row into left context controls, centered `Active` / `Inactive` scenario switch, and right-side action controls.
  - Product switching is again available in the top header next to the logo and remains available in the Settings / control-panel surface.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check -- src/app/components/demo/DemoTopBar.tsx` passed with only normal Windows LF/CRLF warnings.
  - Static header scan confirmed no remaining `searchQuery`, `platform-search`, `Notifications`, `notifications`, or `overflow-x-auto` usage in `DemoTopBar.tsx`.
  - Static header scan confirmed no remaining invalid `icon="home"`, `icon={themeMode}`, `"sun"`, or `"moon"` icon-registry references in `DemoTopBar.tsx`.
  - In-app browser check on `http://127.0.0.1:5002/?product=PI&country=RO&scenario=active&ds=current&release=release-current&bank=retail-single-account&theme=light&lang=en&screen=homepage` confirmed the Demo and Light/Dark buttons render custom SVGs, the header has no horizontal overflow (`scrollWidth == clientWidth == 1306`), and the scenario switch center matches the viewport center (`653px`).
  - Local server `http://127.0.0.1:5002/` returned HTTP `200`.
- Limitation:
  - Automated Playwright browser smoke could not run because the local Playwright Chromium executable is not installed; verification is build/audit/static plus the live Vite server.
- safe to resume: yes

## 2026-07-01 RO Card PIN Flow Library Preview

- Follow-up polish after browser comments:
  - Replaced the Flow Library side-card list with a search field plus native dropdown only, so long flow catalogs are selected from one compact control instead of repeated cards.
  - Moved the local Countries selector out of the narrow sidebar and into the main content column under UX spec, spanning the same central width as the spec panel.
  - Replaced the large card-style UX spec layout with compact paragraph-style sections to reduce wasted horizontal space.
  - Added a Flow Library search input and native flow dropdown above the selectable flow list, anticipating a long future flow catalog.
  - Changed journey previews to render as real `375x812` screen capture frames scaled down to `180x390`, so more screens fit horizontally while downloads preserve the full screen dimensions.
  - Added a visible download icon button on every journey screen card; each button exports that screen frame as a standalone PNG.
  - Reworked the RO Card PIN `Cards` preview to use real shared runtime primitives/assets: Design System card artwork, `AccountActionBar`, `AccountSearchBar`, and `AppIcon` action glyphs instead of placeholder squares.
  - Resized Card options, Face ID, PIN reveal, Set PIN, Sign, success, and fallback popup states to mobile-screen proportions with larger headers, rows, PIN boxes, and 48px bottom CTAs.
- Latest request handled: user supplied RO Enablers node `2247:16744` and asked for this additional RO PI flow to be mapped as another selectable Flow Library preview.
- Figma source inspected:
  - RO Enablers `SBL-439479 - VIEW / RESET PIN` section node `2247:16744`, covering `VIEW CREDIT CARD DETAILS`, `VIEW DEBIT CARD DETAILS`, `CREDIT CARD CHANGE PIN`, and `DEBIT CARD CHANGE PIN`.
  - Key observed states: Cards entry, Card options, Face ID modal, hidden PIN sheet, visible PIN sheet, Set PIN empty/filled, Sign, PIN saved success, and `Set up your card PIN` fallback popup.
- Runtime changes:
  - Extended `src/app/registry/flowPreviewRegistry.ts` with `ro-card-pin`, scoped to Romania and marked as a future-release preview.
  - Reworked `src/app/screens/flow-library/FlowLibraryScreen.tsx` into a data-driven preview renderer so `RO Round Up` and `RO Card PIN` share the same Flow Library shell while keeping separate UX specs, scenario tabs, and journey screens.
  - Added RO Card PIN preview scenarios: `View credit card PIN`, `View debit card PIN`, `Change credit card PIN`, and `Change debit card PIN`.
  - Updated `src/app/App.tsx` and `src/app/components/demo/DemoTopBar.tsx` so the `Flows` menu and deep link state can switch between multiple flow previews, including `screen=flow-library&flow=ro-card-pin`.
- Placement:
  - Use `http://127.0.0.1:5002/?product=PI&country=RO&scenario=active&ds=current&release=release-current&bank=retail-single-account&theme=light&lang=en&screen=flow-library&flow=ro-card-pin`.
  - In the desktop demo shell, use top bar `Flows` -> `RO Card PIN`; the side selector in Flow Library also switches between `RO Round Up` and `RO Card PIN`.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - Local dev server is running on `http://127.0.0.1:5002/`.
  - In-app browser visual smoke confirmed the `View / Reset PIN` page renders the flow selector, RO-only country scope, English UX spec, four scenario tabs, connected journey cards, Face ID overlay, hidden/revealed PIN states, Set PIN fields, Sign screen, success confirmation, and fallback popup. Horizontal journey scroll was checked for the later success/fallback states.
  - Follow-up in-app browser visual smoke confirmed compact UX spec paragraphs, search/dropdown flow selector, 5 visible `375x812` capture frames displayed at `180x390`, visible per-screen download buttons, successful click on `Download Cards screen`, and empty browser console errors/warnings.
  - Latest Flow Library selector cleanup is code- and `git diff --check`-verified. Browser/build verification is currently blocked because `src/app/components/demo/DemoTopBar.tsx` is already deleted in the working tree, causing Vite to fail resolving `./DemoTopBar` from `DemoShell.tsx`.
- Limitations:
  - This is a separated future-flow preview, not wired into the live Cards/Card options runtime as an executable feature.
  - The journey screens are now component-built 375x812 preview frames using shared runtime assets/primitives where available. They are not imported Figma instances and the PIN-specific states are still preview-only until executable Card options routing is approved.
- safe to resume: yes

## 2026-07-01 RO Round Up Flow Library Preview

- Latest request handled: user supplied RO Enablers node `2344:10093` and asked for the future RO-only Round Up flow to be reproduced as a separated flow page with English UX spec and a journey diagram of connected app screens.
- Figma source inspected:
  - RO Enablers `Round UP` section node `2344:10093`. Full design-context extraction timed out because the section is very large, so the implementation used Figma metadata, screenshots, and targeted node inspection. The visible branches are `ENTRY`, `CREATE ROUND UP - NO SAVING ACCOUNT AVAILABLE`, `CREATE ROUND UP - EXISTING ACCOUNT`, `UPDATE ROUND UP`, and `DEACTIVATE ROUND UP`.
- Runtime changes:
  - Added `src/app/registry/flowPreviewRegistry.ts` with the first preview entry `ro-round-up`, scoped to Romania and marked as a future-release preview.
  - Added `src/app/screens/flow-library/FlowLibraryScreen.tsx`, a full-width Flow Library surface with flow selection, local country chips, English UX spec cards, and scenario-selectable journey diagrams with connected phone-screen previews.
  - Updated `src/app/components/demo/DemoTopBar.tsx` with a dedicated `Flows` menu, separate from country/baseline selection. Selecting `RO Round Up` opens the Flow Library instead of changing the active runtime country.
  - Updated `src/app/App.tsx`, `NavigationContext`, `DemoNavigationSync`, `deepLink.ts`, `demoTypes.ts`, and `screenRegistry.ts` so `screen=flow-library&flow=ro-round-up` is deep-linkable, restorable, and visible in audits as `platform.flow-library`.
- Placement:
  - Use `http://127.0.0.1:5002/?product=PI&country=RO&scenario=active&ds=current&release=release-current&bank=retail-single-account&theme=light&lang=en&screen=flow-library&flow=ro-round-up`.
  - In the desktop demo shell, use top bar `Flows` -> `RO Round Up`. Country chips inside the Flow Library are local to the preview and do not mutate the normal app country selector.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - Local dev server is running on `http://127.0.0.1:5002/`.
  - In-app browser visual/DOM smoke confirmed the Flow Library renders the RO Round Up header, future-release badges, flow selector, country selector, five UX spec cards, scenario tabs, and connected phone-screen journey cards with arrows. Layout was adjusted after visual inspection so the UX spec and Journey areas fit better on the browser viewport.
- Limitations:
  - The Round Up page is a mock/future-flow preview, not wired into Products `Round Up` as an executable banking feature yet.
  - RO is the only enabled country for this preview. The multi-country picker exists for future flows once product specs identify country scope and differences.
- safe to resume: yes

## 2026-07-01 Account Transaction Filter Sheet

- Latest request handled: user supplied CZ Daily Banking in Mobile node `6999:7260` and asked for the Account Detail search filter button to open the referenced filter bottom sheet.
- Figma source inspected:
  - CZ Daily Banking in Mobile Account Detail filter sheet node `6999:7260`, including `Apply filters`, search-by-detail fields, date radio rows, amount rows with currency, status/category selectors, disabled `Apply`, and close action.
- Runtime changes:
  - Added `src/app/screens/accounts/AccountTransactionFiltersSheet.tsx` as a reusable Account Detail filter sheet using the shared `BottomSheet`, `TextField`, `PrimaryButton`, and `AppIcon` primitives.
  - Updated `src/app/screens/accounts/AccountDetailScreen.tsx` so the existing `AccountSearchBar` filter icon opens the sheet, stores applied filters, shows the active remove-filters state, and applies keyword/account/variable-code/amount/status/type/category filtering to the current product transactions.
  - The implementation is available through the existing Account Detail route for every Mobile PI country because it sits in the shared account detail screen and uses the country currency from runtime config.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - Local dev server is running on `http://127.0.0.1:5002/`.
  - In-app browser smoke on `http://127.0.0.1:5002/` opened Mobile PI Romania -> Home -> Primary Account -> filter button and confirmed the sheet renders at the Figma-style top offset, full phone width, title `Apply filters`, five expected sections, disabled `Apply` button, 31px close/filter icon slots, and fixed bottom apply area.
- Limitations:
  - Selector rows for status, transaction type, and category currently render the Figma field shape with default values; dedicated option sub-sheets are not implemented yet.
  - Date presets enable Apply but do not yet perform date-window filtering; amount/text/status/type/category filters do affect the mock transaction list.
- safe to resume: yes

## 2026-07-01 ShopSmart Cards And Products Tab

- Latest request handled: user asked to define the two Meniga Design System ShopSmart card types as reusable DS components, use the correct Figma images, and reproduce the RO Enablers Products / ShopSmart tab area with the new component.
- Figma sources inspected:
  - Meniga Harmonization Design System `Shopsmart` source area under node `0:6964`, with card variants `Type=Offers 1` (`9185:16470`) and `Type=Offers 2` (`9185:16260`).
  - RO Enablers `Products / ShopSmart` node `2843:35520`, including selected tab state, activated-offers summary, `ALL OFFERS` divider, search/filter strip, and three offer cards.
- Runtime and DS changes:
  - Added `src/app/components/shopsmart/ShopsmartOfferCard.tsx` as the reusable `Shopsmart` component, covering CTA pill, active pill, orange tag, image overlay, footer metadata, optional distance, and website/partner trailing icons.
  - Downloaded and locally optimized Figma images under `src/assets/shopsmart/` so runtime does not depend on expiring MCP asset URLs.
  - Added RO Enablers ShopSmart offer-card data and summary to `src/app/config/productsMenuConfig.ts`; the same temporary values are shared by current ShopSmart-tab countries until country-specific specs arrive.
  - Rebuilt `ShopSmartContent` in `src/app/screens/products/ProductsScreen.tsx` to match the Figma structure instead of the old product-offer carousel/category grid.
  - Updated `ProductsTabs` to the 48px Figma tab treatment with a 3px selected underline and no persistent focus outline after mouse click.
  - Added the `Shopsmart` specimen to Design System Inventory `Cards and content blocks`, and registered `products.shopsmart-offer-card` in `demoTypes.ts` and `componentRegistry.ts`.
  - Updated the Products ShopSmart code template metadata to point at `products.shopsmart-offer-card`.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=27 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - In-app browser visual/DOM smoke on `http://127.0.0.1:4001/` opened Mobile PI Romania Products -> ShopSmart and verified: selected tab has only a 3px bottom border, summary renders `ACTIVATED OFFERS:4`, `ALL OFFERS` is 18px with 2px letter spacing, search strip is 36px-ish with search/filter icons, and three `ShopsmartOfferCard` instances render with local image assets and correct pill states.
- Limitations:
  - ShopSmart offer values are still mock/shared values from the RO Enablers reference. Final merchant lists, localization, per-country availability, click-through behavior, and activation state rules are pending product specs.
- safe to resume: yes

## 2026-07-01 Products Card Bottom Sheet

- Latest request handled: user supplied RO Enablers node `2634:12018` and asked for the Products card tap behavior to show the same bottom-sheet pattern across all Mobile PI countries, with current values applied everywhere until per-country specs arrive.
- Figma source inspected:
  - RO Enablers `MB Products` node `2634:12018`.
  - The referenced sheet is a dimmed Products screen with a 12px-radius bottom sheet, 28px bold title, 32px close icon, and 80px `Navigation` rows with 24px left / 16px right padding, 18px bold labels, and 32px chevrons.
- Runtime changes:
  - Extended `src/app/components/BottomSheet.tsx` with optional `className`, `headerClassName`, and `bodyClassName` hooks while preserving existing default behavior.
  - Extended `src/app/components/NavigationRow.tsx` with an optional `titleStyle` override so Figma-specific row typography can be applied without forking the component.
  - Added generic product-card sheet config to `src/app/config/productsMenuConfig.ts`; `Saving and investing` uses the Figma values `Term deposit`, `Saving account`, `Round Up`, and `Mutual funds`, and the same temporary config model applies across all countries.
  - Updated `src/app/screens/products/ProductsScreen.tsx` so tapping Banking, ShopSmart, and additional-service `ProductMenuCard` items opens the standard bottom sheet with full-width `NavigationRow` options and close/dim-dismiss support.
- Verification:
  - Figma context confirmed the visual contract and values above.
  - In-app browser visual/DOM smoke on `http://127.0.0.1:4001/` opened Mobile PI Romania Products and clicked `Investments and savings`; the sheet rendered with title `Saving and investing`, 12px top radius, 24px sheet top padding, 32px close icon slot, full-width rows, 24px left / 16px right row padding, and the four expected row labels. A follow-up recheck after the 18px text-size fix was attempted, but the in-app browser connection timed out/reset.
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=80 screens=27 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- Limitations:
  - Product-card sheet options are front-end/mock values; final per-country product option lists, local-language labels, and destination flows are still pending user-provided specs.
  - The in-app browser became unstable during the post-fix visual recheck, so the final 18px row typography is build-verified and code-verified but not re-measured visually after the last style override.
- safe to resume: yes

## 2026-07-01 Apple Wallet Button Icon Alignment

- Latest request handled: user flagged the `Wallet buttons` Apple Wallet icon as visibly fake against the Meniga Design System node `7464:1881`.
- Figma sources inspected:
  - Meniga Harmonization Design System `Apple wallet` component node `7464:1858`.
  - Apple Wallet mark/icon node `7464:1881`.
  - Figma design context confirmed variants: `Property 1=small` is `163x48`, `Property 1=Big` is `327x48`, and the wallet mark renders at about `36.876x27.558`.
- Runtime changes:
  - Updated `src/app/components/ui/WalletButton.tsx` to replace the local fake Apple Wallet mark with a Figma-aligned inline SVG wallet-app mark: white rounded tile, stacked colored cards, grey lower card area, subtle separators, and real Figma icon dimensions.
  - Added `appleWalletIcon: "7464:1881"` to `WALLET_BUTTON_SOURCE`.
  - Set the Apple Wallet condensed button to the Figma `163px` width and kept the long variant at `327px`.
  - Updated `src/app/screens/cards/CardDetailScreen.tsx` so its Apple Wallet affordance reuses the shared `WalletButton` instead of maintaining a separate fake local SVG.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - In-app browser DOM smoke on `http://127.0.0.1:4001/#buttons` set `wallet-button-kind-select=apple-wallet` and verified:
    - condensed button `163x48`;
    - long button `327x48`;
    - Apple Wallet SVG mark `36.875x27.555`;
    - long label `Add to Apple wallet`.
- Limitations:
  - The mark is a durable local vector approximation of the Figma asset, not a remote expiring image asset.
- safe to resume: yes

## 2026-07-01 Full Workspace Commit / Vercel Closeout

- Latest request handled: user asked to commit everything currently uncommitted so the repository is clean, push it, and publish the latest version to Vercel.
- Commit scope:
  - all currently modified and untracked project files are intended to be staged and committed in one closeout package.
  - scope includes the accumulated platform work since the last commit: two-line stakeholder header, restored product selector, Flow Library layout and preview plumbing, QR share access token bypass, ShopSmart/product/account-filter/tutorial/runtime component additions, Kids and Investments refinements, registry/capability-map updates, and handoff documentation.
- Verification before commit:
  - `node --check api/access.js` passed.
  - QR access API simulation passed for unauthenticated issuance, authenticated token issuance, token exchange, and cookie-authenticated status.
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- Banana Loop result:
  - fixed/triaged: untracked runtime files such as `src/app/utils/deepLink.ts`, Flow Library files, ShopSmart assets, account-filter sheet, tutorials config, and the favicon are intentionally part of this closeout instead of remaining hidden local work.
  - already known: Vite chunk-size warning remains a non-blocking known banana.
  - already known: no local `typecheck`, `lint`, or full automated test scripts exist yet; build plus audits remain the repeatable verification gates for this repo.
  - follow-up: add automated regression coverage for QR share access, Flow Library deep links, and the new header action/product selector behavior.
- safe to resume: yes after the commit, push, and Vercel deploy complete.

## 2026-07-02 HU Kids L1 Header Unification

- Latest request handled: user asked for HU Kids top in-app header to stop showing the UniCredit logo on the main child app tabs and instead show the current page title on the left, while preserving the existing Home right-side controls across Home, Earning, Saving, Payments, and More.
- Implementation:
  - `src/app/screens/kids/KidsMarketHomeApp.tsx` now maps HU Kids bottom-nav tabs to page titles: `Home`, `Earning`, `Saving`, `Payments`, and `More`.
  - `HuLightHeader` now renders the page title instead of the UniCredit logo and keeps the existing amount visibility, messages, and profile avatar controls on the right.
  - `HuKidsPiMenuFrame` uses the same header contract for PI-style menu pages, so Payments and More now share the same L1 header model as Home/Earning/Saving.
  - `HuKidsPaymentsPage` and `HuKidsMorePage` receive and propagate `showAmounts` / `onToggleAmounts`, keeping the amount visibility control consistent across the main tabs.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - Attempted headless browser smoke through both project Node and bundled Codex Node, but Playwright was unavailable/mispackaged locally (`playwright` missing in project; bundled `playwright` missing `playwright-core`). No browser automation verification was completed for this small UI change.
- safe to resume: yes.

## 2026-07-02 HU Kids Earning Education Placement Correction

- Latest request handled: user clarified that the compact `Education` card with two visible learning items and `Show more` belongs on the Earning Level 1 area, not inside the Level 2 Learn detail page.
- Implementation:
  - `src/app/screens/kids/KidsMarketHomeApp.tsx` now renders the compact `HuLearnEducationCard` inside `HuEarningContent`, after Allowance and Tasks.
  - The Earning Level 1 education card shows two topics by default, expands with `Show more`, and each row opens the selected Learn topic directly.
  - `HuKidsLearnPage` was restored to the original `New` featured card plus `All topics` two-column topic grid, while keeping the removed top intro block (`Financial education / Money lessons / topics done`) out of the page.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- safe to resume: yes.

## 2026-07-03 Baseline / Future Feature Selector

- Latest request handled: user approved the simplified release model where stakeholder UI exposes only `Baseline` and `Future`, with `Future` opening isolated future-feature previews instead of composing multiple pending releases together.
- Runtime changes:
  - Updated `src/app/components/demo/DemoTopBar.tsx` so the top release selector now shows only `Baseline` and `Future`; old `Release R1/R2/R3/R4 preview` options are hidden from the stakeholder header.
  - Added a second dropdown that appears only when `Future` is selected and lists compatible future features for the current product/country/design-system context.
  - Added the first future feature, `CZ Co-Apping Chatbot`, available only for `PI` + `CZ` + current design system.
  - Imported the portable `mobile-pi-coapping-chat-package` launcher and CSS, then mounted it only when `fx_czCoAppingSmartAssistant` resolves active.
  - Normalized legacy/deep-linked release ids that are not visible future previews back to `release-current`, preventing hidden old release features from masquerading as Baseline.
  - Updated release readiness and feature manifests so Future features are treated as pinned previews without promotion targets until explicitly rebased or promoted.
- Product decision:
  - `Baseline` remains the official current truth.
  - `Future` means one isolated feature preview based on the baseline captured when that feature was created.
  - Future features are not auto-composed and are not continuously rebased; when a future feature becomes official, it is removed from Future and promoted into Baseline explicitly.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- safe to resume: yes.

## 2026-07-03 CZ Future Co-Apping Voice Capture

- Latest request handled: user asked for the CZ Future Co-Apping chatbot record button to support actual audio capture, parse the voice input, and send it as a voice-derived message.
- Implementation:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` now uses browser microphone capture through `MediaRecorder` and browser speech recognition through `SpeechRecognition` / `webkitSpeechRecognition` when available.
  - The small microphone button starts/stops dictation, updates the composer draft with interim transcript text, and sends the transcript as a user message when recognition ends or the user stops recording.
  - The large voice action remains available for voice-mode entry; once transcript/text exists, it behaves as the send action.
  - Unsupported or empty captures fail honestly with draft fallback copy instead of pretending a transcript was produced.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` adds a compact voice-status line for `Listening...` / `Parsing voice...`.
- Limitations:
  - This is browser-API based. Real transcription depends on microphone permission and browser support; Chrome-like browsers generally expose `webkitSpeechRecognition`, while support may vary on iOS/Safari.
  - The captured audio blob is not uploaded to a backend yet because the current CZ Co-Apping feature remains a front-end future-preview mock. The sent message is the parsed transcript.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- safe to resume: yes.

## 2026-07-07 CZ Chatbot Credit-Limit Offer Polish

- Latest request handled: user asked to tighten CZ Chatbot empty-state title wrapping and polish the Card Detail / For You credit-limit offer flow.
- Implementation:
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` constrains the new-conversation hero/title width so longer greetings wrap earlier and do not sit against the phone edges.
  - `src/app/App.tsx` rewrites the Card Detail `For you` primary offer copy to a more commercial limit-increase message and replaces the `ceiling` helper with `Your current card limit`.
  - The `For you` related credit-card row now closes the assistant when navigating back to Card Detail, so the card page is visible after the click.
  - Chat rich credit-limit cards no longer show the redundant `For Credit Card...` body or an internal `Open card details` button.
  - The final confirmation and post-acceptance credit-limit replies no longer repeat the rich offer card; the acceptance reply now says the offer was accepted in chat but the new limit is not active until final terms, strong customer authentication, and the user's signature are completed.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - In-app browser smoke on `http://127.0.0.1:3001/?product=PI&country=CZ&scenario=active&ds=current&release=release-future-cz-coapping&bank=retail-single-account&theme=light&lang=en&screen=homepage` confirmed the empty-state title has `max-width: 280px`, `text-wrap: balance`, and the expected Home topics.
  - In-app browser smoke on Card Detail / For You confirmed the offer text is `Increase your card limit from 10 000,00 CZK to 15 000,00 CZK...`, the current-limit helper is `Your current card limit`, the related credit-card row is a clickable button, clicking it closes the assistant and leaves the user on `screen=card-detail&card=card-credit-1`.
  - In-app browser smoke through `I'm interested` -> `What changes if I accept?` -> `Continue to confirmation` -> `Accept new limit` confirmed no redundant rich card appears on the final confirmation or accepted states, no `prototype` copy appears, and the accepted state says `Signature required`, `not active yet`, and mentions signature.
- Limitation:
  - This remains a front-end simulation conversation; it does not perform real card-limit eligibility, signing, SCA, or limit update.
- safe to resume: yes.

## 2026-07-07 CZ Chatbot Savings Card Polish

- Latest request handled: user asked for the CZ Chatbot savings-capacity rich cards to use normal-weight descriptive text, move the `Choose your preferred saving type.` connector question outside the card, and prevent the final Term deposit/Saving account product card from being clickable.
- Implementation:
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` changes rich-card descriptive spans and the card footer text to normal font weight.
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` now renders `product-cards` footer text outside the bordered card, as a separate paragraph under the card.
  - `src/app/App.tsx` marks the final `Ready to open` product card as presentation-only (`interactive: false`), leaving only the follow-up chips (`Open now`, `Adjust amount`, `Compare products`) actionable.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `git diff --check` passed for the touched app/chat/CSS files with only normal Windows LF/CRLF warnings.
  - In-app browser smoke on CZ Future Chatbot Home confirmed the savings card head descriptions compute to `font-weight: 400`, the `Choose your preferred saving type.` paragraph is outside `.mpc-rich-card`, and the final Term deposit card renders as a static `DIV` with `cursor: default`, no rich action button, and only the lower chips actionable.
  - Browser warning/error logs were empty after the smoke.
- safe to resume: yes.

## 2026-07-07 CZ Chatbot Credit-Limit Sign Follow-Up Polish

- Latest request handled: user asked to keep the post-acceptance `After acceptance` option, add `Sign now`, and make the `After acceptance` explanation offer `Sign now` again.
- Implementation:
  - `src/app/App.tsx` now replaces the old single `What happens next?` chip after `Accept new limit` with `After acceptance` and `Sign now`.
  - The `After acceptance` response now explains final terms, strong customer authentication, signature, and receipt/update behavior, then leaves a single `Sign now` chip.
  - The new `Sign now` response tells the user to open the secure signing step, review final terms, confirm with strong customer authentication, and sign before the limit becomes active.
- Verification:
  - `npm run build` passed; the known Vite empty `react-vendor` and chunk-size warnings remain.
  - In-app browser smoke on the CZ Future Chatbot Card Detail URL clicked `For you` -> `I'm interested` -> `What changes if I accept?` -> `Continue to confirmation` -> `Accept new limit` and confirmed follow-up chips `After acceptance` and `Sign now`, with no `What happens next?`.
  - The same smoke clicked `After acceptance` and confirmed the next follow-up shelf contains exactly `Sign now`, then clicked `Sign now` and confirmed the secure signing/final terms/SCA/signature copy appears.
  - Browser warning/error logs were empty after the smoke.
- Limitation:
  - This remains a front-end simulation conversation; it does not perform real card-limit eligibility, SCA, signature capture, or limit activation.
- safe to resume: yes.

## 2026-07-07 CZ Chatbot Savings Interest Preview Polish

- Latest request handled: user asked for the final savings `Ready to open` answer to connect the selected amount with the previously selected product interest rate, so the customer sees what the money could earn.
- Implementation:
  - `src/app/App.tsx` now keeps numeric rates for Saving account (`3.5% p.a.`) and Term deposit (`5% p.a.`) in the CZ Chatbot savings resolver.
  - The final selected-amount branch calculates an approximate interest preview from the chosen amount and product: Saving account shows monthly interest, while Term deposit shows annual interest.
  - The same preview is repeated in the final presentation card body/subtitle, while the final card remains non-clickable and only the lower chips act.
- Verification:
  - `npm run build` passed; the known Vite empty `react-vendor` and chunk-size warnings remain.
  - In-app browser smoke on the CZ Future Chatbot Home URL clicked `How much can I save?` -> `Saving account` -> `3 000,00 CZK` and confirmed the final answer/card show `3.5% p.a.` plus approx. `8,75 CZK per month`.
  - The same smoke reloaded and clicked `How much can I save?` -> `Term deposit` -> `3 000,00 CZK`, confirming `5% p.a.` plus approx. `150,00 CZK per year`.
  - Browser warning/error logs were empty after the smoke.
- Limitation:
  - This remains a front-end simulation preview before tax/fees; it does not perform real savings/deposit eligibility, pricing, opening, or regulated advice.
- safe to resume: yes.

## Constitutional Check

constitutional check:
- scope preserved: yes
- docs updated: yes
- verification recorded: yes
- bananas triaged: yes
- safe to resume: yes

safe to resume: yes, the latest closeout scope is documented and the remaining work is future product/regression coverage as outlined in `docs/handoff/next-tasks.md`.

## 2026-07-14 HU Kids Photographic Card Frost

- Latest request handled: replace the cartoon-like procedural freeze polygons with a realistic frozen-surface treatment, keep the final frost layer at the user-approved `40%` opacity, and make the animation resolve from behind the card toward the viewer instead of moving left-to-right or bottom-to-top.
- Implementation:
  - `src/app/screens/kids/KidsMarketHomeApp.tsx` now renders a licensed photographic window-frost layer rather than generated SVG facets/crack paths.
  - The front-card available-to-spend amount and its label fade out while frozen and return after Unblock; holder, last digits, logo, card type, and Mastercard mark remain visible.
  - `src/styles/theme.css` makes the frost emerge across the full card from a smaller, blurred depth state, then sharpen and settle at `opacity: 0.4`; the original card artwork, identity, and Mastercard branding remain readable underneath while the available-to-spend amount stays hidden until Unblock.
  - `src/assets/kids/hu-card-frost-window-cc0.jpg` is the local raster frost source and `src/assets/kids/hu-card-frost-window-cc0.LICENSE.txt` records its CC0 source/author/license.
- Verification:
  - `npm run build` passed; the existing empty `react-vendor` and chunk-size warnings remain.
  - In-app browser smoke on the Hungary Kids `Your cards` detail verified Block -> Unblock behavior, the full-surface depth animation, the photographic frost film, and preserved card readability; the final requested opacity was then raised to 40%.
- Limitation:
  - This remains local mock state; Block/Unblock is not connected to a card backend or persisted after reload.
- safe to resume: yes.
