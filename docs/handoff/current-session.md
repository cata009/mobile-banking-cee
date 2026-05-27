# Current Session

Last updated: 2026-05-27

## Current Focus

Close out the Design System Colors inventory, app-wide color-token mapping, and Light/Dark appearance mode, then commit and publish the finished batch.

## Last Meaningful Change

Latest Design System Colors and Light/Dark implementation:

- `src/app/registry/colorRegistry.ts` was added as the canonical source-level color registry derived from `screenshots/Colors.svg`, with palette groups, source token names, light/dark hex pairs, usage notes, CSS-variable names, and an app color audit map.
- `src/app/screens/design-system/DesignSystemPage.tsx` now has a top-level `Colors` tab next to `Components`, `Templates`, and `Icons`.
- The `Colors` tab renders compact palette filters, source counts, light/dark swatches, copy-hex buttons with visible `Copied` feedback, and an app color map showing how legacy/runtime colors map into the DS palette.
- `src/styles/theme.css` now defines light/dark UniCredit theme variables under `data-uc-theme`, including app background, surfaces, text, icons, borders, action teal, brand red, overlay, shadow, and static black/white tokens.
- `src/app/state/demoTypes.ts` and `src/app/state/demoStore.tsx` now carry `themeMode`, `setThemeMode`, and `toggleThemeMode`, defaulting to light.
- `src/app/App.tsx` applies `data-uc-theme` to the app shell and switches normal active-app status-bar treatment for dark theme.
- `src/app/components/demo/DemoTopBar.tsx` and `src/app/components/demo/DemoFeatureSidePanel.tsx` now expose a Light/Dark appearance switch so theme mode can be changed from both the top control plane and settings panel.
- Active app screens and shared components were tokenized away from raw runtime colors; reusable app color styling now resolves through DS CSS variables, with images/photos treated as asset exceptions.
- `npm run build` passed after the color registry, Colors tab, and dark theme implementation on 2026-05-27; Vite still emits the known chunk-size warning.
- Color audits passed: no raw hex remains under `src/app` outside `src/app/registry/colorRegistry.ts`, no direct numeric `rgb()` / `rgba()` remains under `src/app` or `src/styles`, and Tailwind color-class audit no longer reports palette classes beyond non-color layout utility matches.
- In-app browser smoke verification passed on `http://localhost:5175`: opened Design System Inventory, selected `Colors`, confirmed the color map renders, confirmed copy-button feedback changes to `Copied`, switched to `Dark`, and confirmed `data-uc-theme="dark"` plus dark CSS variables on the live root.

Latest Analytics / My Spendings implementation:

- `src/app/screens/analytics/AnalyticsScreen.tsx` was added as the bottom-nav `Spending` tab screen, modeled after the supplied `screenshots/Analytics.jpg` reference.
- `src/app/App.tsx`, `NavigationContext`, `useNavigation`, Home, Payments, Products, and More now route the bottom-nav Analytics/Spending tab to the new screen.
- The Analytics header now uses the same shared `HeaderActionRail` / `HeaderActionButton` pattern as Payments and Products, with aligned 28px top title typography.
- `Card Transaction` now reuses the existing `add-money` `AppIcon` family from Account Details instead of a hand-drawn plus.
- The cash prompt now reuses `NewPaymentDiscoverBanner`, with a configurable margin so the Payments bottom-sheet banner and Analytics banner share the same component.
- `AccountTransactionRow` now supports `showDate={false}`; Analytics uses that same transaction-row component for the `Money Out` row instead of a custom icon/amount layout.
- `TOTAL CASH WITHDRAWAL` now reuses `AccountTransactionMonthDivider`, matching Account Detail transaction separators.
- Analytics typography was aligned to the supplied contracts: `Data For` 16px, `March 2025` 28px, chart labels/values 14px, and `Money Out` 24px.
- Analytics spacing now keeps `16px` between the `TOTAL CASH WITHDRAWAL` divider line and `Money Out`, and `16px` between `Money Out` and the `Transaction Details` row.
- Analytics month selector now keeps a `4px` gap between `Data For` and the `March 2025` row.
- Analytics chart labels were refined: the old `Credit card payments` split was removed, `Booked transactions` was replaced by `Outflow`, the black spendings bar is filled to its rounded top, the inflow amount block is left-aligned above the dashed line, `INCOMES` right-aligns to the blue bar, and `SPENDINGS` left-aligns to the black bar.
- Analytics chart label spacing now keeps `16px` logical distance from the dashed baseline to `INCOMES` / `SPENDINGS`, and `8px` logical distance from those labels to the swipe indicator dots.
- `src/app/state/demoTypes.ts`, `screenRegistry.ts`, `flowRegistry.ts`, `componentRegistry.ts`, and `demoConfig.ts` now catalog `pi.analytics.overview`, `analytics.spendings`, and `pi.home-to-analytics`.
- Bottom navigation English labels now render the Analytics tab as `Spending`, matching the supplied reference.
- `npm run build` passed after the Analytics implementation on 2026-05-27; Vite still emits the known chunk-size warning.
- In-app browser smoke verification passed on `http://localhost:5175`: login -> `Spending` opens `My Spendings`; header actions are present; the reused cash banner renders; the reused transaction row renders `Transaction Details` / `- 405.000,00 RON` without the date column; computed styles confirm the requested 4px month-selector gap, 16px/28px/14px/24px typography, the reused divider component, the `Outflow` chart label, left-aligned inflow amount, the requested `INCOMES` / `SPENDINGS` bar alignment, `16px` logical label distance from the dashed chart baseline, and `8px` logical distance from the labels to the swipe indicator dots.

Latest Products carousel and spacing fix:

- `src/app/screens/products/ProductsScreen.tsx` now gives the Products offers carousel the same interaction model as the Account Detail carousel: pointer/mouse drag, click suppression during drag, nearest-card snapping, edge-aware snap math, and a trailing spacer for the final peek.
- Products vertical spacing is now normalized to `16px` between the top tab and `OFFERS FOR YOU`, between the `OFFERS FOR YOU` divider and the carousel card, between the carousel and `OUR PRODUCTS`, and between the `OUR PRODUCTS` divider and product card grid.
- Product menu card grid spacing now uses a consistent `16px` horizontal and vertical gap across all rows.
- ShopSmart content uses the same Products carousel and spacing rules as Banking.

Latest icon registry and Design System Inventory implementation:

- `src/app/components/icons/AppIcon.tsx` and `src/app/components/icons/index.ts` now define the single platform icon repository.
- `AppIcon` is the canonical runtime component for reusable UI icons; duplicate SVGs were consolidated into one named icon entry.
- Design System Inventory now has a top-level `Icons` tab next to `Components` and `Templates`.
- The Icons tab renders all mapped icons with name, category, source, default size, viewBox/source, usage, and deduplication notes.
- The Icons tab also documents explicit audit boundaries for SVGs that intentionally remain outside the icon registry: brand logos, status/device chrome, decorative motion/texture/shadow SVGs, and vendored UI primitives.
- Reusable icons in headers, navigation, payments, products, account/search/actions, contacts, panels, Prime, Co-Apping, demo topbar controls, and radio controls now route through `AppIcon`.
- Direct app-level `lucide-react` usage is centralized behind `AppIcon`; remaining direct lucide imports are limited to vendored `src/app/components/ui/**` primitives.

Latest Products offer card component fix:

- `src/app/components/products/ProductOfferCard.tsx` was added as the reusable Products offer carousel card.
- `src/app/screens/products/ProductsScreen.tsx` now renders offers through `ProductOfferCard` instead of keeping the offer card inline.
- The offer card now matches the requested contract: `327px` width, `157px` height, white title `24px` bold `700`, white subtitle `16px` regular `400`, and a `206px` flex column text stack with `8px` gap.
- `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts` now include `products.offer-card` for AI catalog continuity.
- `src/app/screens/design-system/DesignSystemPage.tsx` now includes a Products offer card specimen in the component inventory.

Latest Design System Templates inventory implementation:

- `src/app/registry/templateRegistry.ts` was added as the explicit source-level template registry for all screenshots in `screenshots/`.
- The registry currently represents all 30 screenshot files with template id, name, source path, dimensions, format, imported image URL, and related reusable components.
- `src/app/screens/design-system/DesignSystemPage.tsx` now has a top-level `Components` / `Templates` tab switch.
- The `Templates` tab renders selectable screenshot cards and a selected-template preview panel with source path, size, format, registry id, and reusable component badges.
- The existing component inventory remains under the `Components` tab.
- The Design System overview count now includes `Screenshot templates`.

Latest New payment bottom-sheet component refinement:

- `src/app/components/payments/NewPaymentActionListItem.tsx` was added as the reusable New payment action row component.
- The row component now owns the supplied Domestic payment, Foreign payment, Templates, and right-chevron SVGs.
- Each action row now has a logical `80px` height and renders rows one after another with no vertical gap.
- The action title now matches the requested UniCredit `18px`, bold `700`, `0.3px` letter-spacing, `#262626`, and `liga` / `clig` off contract.
- The action subtitle now matches the requested UniCredit `14px`, regular `400`, `#262626` contract.
- `src/app/components/payments/NewPaymentDiscoverBanner.tsx` was added as the reusable teal Discover banner component.
- The banner now owns the supplied white 20x20 info icon and 12x12 close icon SVGs.
- The banner title now uses UniCredit `18px`, bold `700`, white; the banner subtitle uses UniCredit `18px`, regular `400`, white.
- `src/app/components/BottomSheet.tsx` now gives the title/header block a `24px` gap to the first New payment action row.
- `src/app/screens/payments/PaymentsScreen.tsx` now composes the New payment sheet from the reusable action-row and Discover-banner components.
- `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts` now include `payments.new-payment-action` and `payments.new-payment-discover-banner` for AI catalog continuity.

Latest top-level header action alignment fix:

- `src/app/components/HeaderActionIcons.tsx` now exposes `HeaderActionRail`, a shared fixed 32px action row used by top-level app headers.
- The shared header action icon set now includes `logout`, so More no longer keeps a separate inline logout/profile/messages implementation.
- Home now renders the amount visibility toggle first, then `Profile`, then `Messages`, matching the Home-specific header order.
- Payments, Products, and More now render their header actions through `HeaderActionRail`.
- Browser verification confirmed fixed top action slots per page; Home uses `Hide/Show amounts`, `Profile`, `Messages`, while Payments/Products/More keep their page-specific header actions inside the same rail.

Latest Payments `OTHER` shortcut component implementation:

- `src/app/components/payments/PaymentOtherShortcut.tsx` was added as the reusable single shortcut action used by the Payments `OTHER` section.
- The component now owns the supplied SVGs for `CREATE QR CODE`, `TEMPLATES`, `CARD REPAYMENT`, and `EXCHANGE RATES`.
- Each shortcut icon is rendered inside a stable `32px` by `32px` non-shrinking icon slot; the QR icon keeps its supplied `22px` by `28px` SVG size, and the other three icons keep `32px` by `32px`.
- The shortcut labels now match the supplied contract: UniCredit, `14px`, bold `700`, centered, `#262626`, normal line-height, `1px` letter spacing, and `liga` / `clig` disabled.
- `src/app/screens/payments/PaymentsScreen.tsx` now renders `PaymentOtherShortcut` for all configured country menu items instead of keeping shortcut icon layout inline.
- `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts` now include `payments.other-shortcut` for AI catalog continuity.

Latest Transaction Detail and Domestic Payment flow implementation:

- `src/data/paymentFlow.ts` was added as the mock adapter for Transaction Detail data, blank domestic-payment drafts, redo-payment drafts, country bank names/codes, and formatted payment amounts.
- `src/app/screens/payments/DomesticPaymentFlowScreens.tsx` was added with five screenshot-inspired runtime screens: Transaction Detail, Domestic payment create, Review data, Sign, and Successful payment.
- `src/app/components/accounts/AccountTransactionRow.tsx` now supports click handling, and `src/app/screens/accounts/AccountDetailScreen.tsx` sends the selected transaction/product into the new flow.
- Transaction rows now open Transaction Detail; the `Redo payment` action creates a domestic-payment draft prefilled from the selected transaction.
- `src/app/screens/payments/PaymentsScreen.tsx` now turns the New payment bottom-sheet `DOMESTIC PAYMENT` action into a real entry point instead of a placeholder.
- Payments/New payment/Domestic payment opens the Domestic payment create screen with empty beneficiary/payment fields and the selected payer account context.
- Domestic payment now continues through Review data, Sign, and Successful payment; the success confirmation returns to Payments.
- `src/app/App.tsx`, navigation types, screen registry, component registry, flow registry, and feature metadata now include the new transaction/payment screens and the `pi.new-domestic-payment` / `pi.transaction-redo-payment` flows.
- The supplied screenshots are cataloged in `src/app/registry/screenRegistry.ts`: `Transaction detail.png`, `Payment.png`, `Review.png`, `Language Selection.png` for Sign, and `Transfer to new phone.png` for Successful payment.

Latest Dynamic Island visual fix:

- `src/app/components/DynamicIsland.tsx` no longer applies a drop shadow to the black Dynamic Island shape.
- The component keeps the same size, position, radius, and sensor layout, but now matches the real device treatment more closely.

Latest transaction search implementation:

- `src/app/components/accounts/AccountSearchBar.tsx` is now an interactive search input while preserving the existing 36px search-bar contract.
- Typing a query replaces the right-side filters icon with the supplied 20x20 clear-results icon.
- Clicking clear resets the query and restores the filters icon.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now filters the current account's mock transactions by label, details, category, status, date/month, and formatted amount.
- Activating the search input scrolls the Account Detail page so the sticky search area moves to the top-list position under the collapsed account header.
- `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts` now include `accounts.transaction-search` for AI catalog continuity.
- `src/app/screens/design-system/DesignSystemPage.tsx` now documents both empty and active search-bar states.

Latest amount visibility implementation:

- `src/app/components/AmountVisibilityButton.tsx` was added as the reusable hide/show button; visible state keeps the existing hide icon, hidden state renders the supplied 20x20 show icon.
- `src/app/state/demoTypes.ts` and `src/app/state/demoStore.tsx` now carry `amountsHidden`, `toggleAmountsHidden`, and `setAmountsHidden`, defaulting to visible amounts.
- `src/app/utils/amountPrivacy.ts` centralizes masking to `****` / `.**` or `,**` while preserving currency display.
- Homepage totals and product-category account/card/product amounts now mask when `amountsHidden` is enabled.
- Account Detail balance carousel and Account Details info money fields now keep the same hidden state while navigating.
- Transaction rows and transaction monthly totals remain visible intentionally; amount privacy applies to account/card/product balances, not transaction history.
- `src/app/registry/componentRegistry.ts` now includes `home.amount-visibility-toggle` for AI catalog continuity.

Recent Products card component fix:

- `src/app/components/products/ProductMenuCard.tsx` was added as the reusable Products menu card component.
- The Account, Cards, Mortgages and loans, Insurance, and Investments and savings cards now share the same component and differ only by config-driven text, background color, and illustration.
- The card component now matches the supplied contract: `display: flex`, `width: 164px`, `height: 120px`, `padding: 16px`, `align-items: flex-start`, `gap: 10px`.
- The card label now matches the supplied text contract: UniCredit font, white, `18px`, bold `700`, normal line-height.
- `src/app/screens/products/ProductsScreen.tsx` now renders Products and ShopSmart grids through `ProductMenuCard` instead of inline card/layout code.
- `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts` now include `products.product-card` for AI catalog continuity.

Recent New payment bottom sheet implementation:

- `src/app/components/BottomSheet.tsx` was added as a reusable phone-frame modal shell with dim overlay, outside-tap close, Escape close, rounded white panel, and header close action.
- `src/app/config/paymentsMenuConfig.ts` now includes `newPaymentSheet` metadata with three actions: `DOMESTIC PAYMENT`, `FOREIGN PAYMENT`, and `TEMPLATES AND BENEFICIARIES`.
- Domestic-payment helper text is country-scoped in config; CZ renders the supplied example text `Send payment in CZK in CR`.
- `src/app/screens/payments/PaymentsScreen.tsx` now opens the New payment bottom sheet from the `New payment` hero card and renders the payment help banner with dismiss action.
- `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts` now include the reusable bottom-sheet shell and New payment sheet component entries for AI catalog continuity.

Recent Products implementation:

- `src/app/config/productsMenuConfig.ts` was added as the country-scoped Products menu configuration.
- RO, CZ, SK, and HU now show the `Banking` / `ShopSmart` tab row; RS, BA, and SI render the same Products page without the tab split.
- `src/app/screens/products/ProductsScreen.tsx` was added with the `Products` header, offers carousel, banking product grid, other-solutions card, optional ShopSmart tab, and active Products bottom navigation.
- `src/app/App.tsx`, `src/app/contexts/NavigationContext.tsx`, `src/app/hooks/useNavigation.ts`, `src/app/screens/home/HomeScreen.tsx`, `src/app/screens/payments/PaymentsScreen.tsx`, and `src/app/screens/more/MoreScreen.tsx` now route the bottom-nav Products tab to the new screen.
- `src/app/state/demoTypes.ts`, `src/app/registry/screenRegistry.ts`, `src/app/registry/componentRegistry.ts`, and `src/app/registry/flowRegistry.ts` now include the Products screen/component/flow entries for the AI catalog.

Recent Payments implementation:

- `src/app/config/paymentsMenuConfig.ts` was added as the country-scoped Payments menu configuration; all countries currently share the same baseline labels and action set.
- `src/app/screens/payments/PaymentsScreen.tsx` was added with the `Payments` header, four primary payment cards, `OTHER` shortcuts, and active Payments bottom navigation.
- `src/app/App.tsx`, `src/app/contexts/NavigationContext.tsx`, `src/app/screens/home/HomeScreen.tsx`, and `src/app/screens/more/MoreScreen.tsx` now route the bottom-nav Payments tab to the new screen.
- `src/app/state/demoTypes.ts`, `src/app/registry/screenRegistry.ts`, `src/app/registry/componentRegistry.ts`, and `src/app/registry/flowRegistry.ts` now include the Payments screen/component/flow entries for the AI catalog.
- `fx_newPaymentsHub` coverage now includes the Payments screen.

The `Details` action from Account Detail now opens a dedicated account details information screen modeled after the supplied screenshot.

Implementation change:

- `src/app/components/accounts/AccountActionBar.tsx` now accepts `onDetailsClick` and wires the `Details` action instead of rendering it as a dead button.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now sends the currently active carousel product to the `Details` action, so details follow the selected card.
- `src/app/screens/accounts/AccountDetailsInfoScreen.tsx` was added with an account details layout: account number, balances, blocked/reserved amount, overdraft, account title, offer, show-less action, connected card row, copy icon, share icon, and scroll-driven header collapse.
- `src/app/components/PageHeader.tsx` now supports a custom right-side action icon, safe-area ownership, and scroll progress for the centered collapsed title used by Account Details.
- `src/app/App.tsx` and the navigation/screen/component/flow registries now include the new `account-details-info` runtime screen.
- `src/data/products.ts` now exposes `isAccountDetailProduct`, the shared product filter for homepage-to-account-detail navigation.
- `src/app/screens/home/AccountSummary.tsx` now opens Account Detail for current accounts, saving accounts, term deposits, loans, and mortgages, while cards/investments remain outside this Account Detail path.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now builds its carousel from the homepage product categories instead of using only the first three account-like products.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now renders product names and account numbers from the product catalog in the carousel, preserving the existing card layout and hiding sub-account metadata.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now uses a `16px` carousel top padding so the rendered gap from the large `Accounts` title to the account card is `24px` logical.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now makes the search bar wrapper sticky below the `102px` account header, with `24px` top padding to preserve the requested header-to-search gap during scroll.
- `src/app/components/accounts/AccountBalanceCard.tsx` now renders the `Current balance` label and value in the same compact row with a `4px` logical gap.
- `src/app/components/accounts/AccountBalanceCard.tsx` now supports optional sub-account rendering; when shown, the IBAN-to-sub-account gap is `0`, and the metadata group has a `16px` logical gap to the balance group.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now disables sub-account metadata for `current_account` and `saving_account` cards.
- `src/app/screens/design-system/DesignSystemPage.tsx` now documents sub-account as optional and hides it in the current-account specimen.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now calculates snap positions per card index instead of relying on native `snap-start` alignment.
- middle account cards use centered scroll positions; first and last account cards use edge-aligned scroll positions.
- the carousel uses a trailing invisible spacer to give the browser enough real scroll width for the final right-side gutter.
- `src/app/screens/accounts/AccountOptionsScreen.tsx` now applies `scrollbar-hide` to its internal `overflow-y-auto` content area.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now gives the carousel explicit card sizing constants, 16px start gutter, snap padding, and drag state for pointer + desktop mouse interactions.
- account-card drag is handled on the card wrapper while the visual card content ignores pointer events, so dragging from the visible card surface works instead of being swallowed by inner text/card elements.
- `src/app/components/accounts/AccountBalanceCard.tsx` now uses a softer layered shadow and keeps optional click accessibility through `role="button"` + Enter/Space when reused as an interactive card.
- `src/app/screens/design-system/DesignSystemPage.tsx` now documents the softer account-card shadow in the component inventory.
- `src/app/components/demo/DemoShell.tsx` now uses a fixed viewport shell (`h-screen overflow-hidden`) and gives the remaining space to the preview surface.
- `src/app/components/MobileFrame.tsx` now measures its available container with `ResizeObserver`, computes a bounded fit scale, and reserves the scaled phone dimensions in layout before applying `transform`.
- `src/app/screens/design-system/DesignSystemPage.tsx` now owns its internal scroll area so the inventory page still works inside the fixed demo shell.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now keeps the collapsing `Accounts` header as a top-level sticky child of the account-detail scroll container, instead of nesting it inside the finite gray account-card section.
- the empty account-detail fallback no longer double-applies the top safe-area padding before rendering the same sticky header.

Previous architecture foundation remains in place:

- root operating contract in `agents.md`;
- handoff mode rules under `docs/handoff/`;
- architecture foundation in `docs/architecture/PROJECT_MODEL.md`;
- typed project model in `src/app/registry/projectModel.ts`;
- release mapping in `src/app/registry/releaseRegistry.ts`;
- screen catalog in `src/app/registry/screenRegistry.ts`;
- flow catalog in `src/app/registry/flowRegistry.ts`;
- feature metadata expanded in `src/app/state/demoTypes.ts` and `src/app/registry/demoConfig.ts`;
- demo side panel upgraded from feature-only settings to a Control Panel in `src/app/components/demo/DemoFeatureSidePanel.tsx`;
- top bar label changed from `Version` to `Release` in `src/app/components/demo/DemoTopBar.tsx`;
- runtime store now uses explicit `product`, `designSystem`, `baseline`, and `release` state instead of a release-like `variant` field;
- `CountryId` exists as the official project alias for country taxonomy;
- product selector supports `PI` and `SME`;
- design-system selector supports `current` and `next`;
- unsupported product/design-system combinations render an honest planned-state placeholder instead of PI screens;
- component registry and AI catalog export were added;
- root `README.md` now points to the operating docs.

## Active Scope

Approved direction from the user:

1. Add AI Contributor Operating System.
2. Document the project organization before major implementation.
3. Continue with the previously agreed architecture direction:
   - official taxonomy;
   - release/baseline model;
   - screen and flow registries;
   - feature metadata expansion;
   - project model documentation;
   - gradual refactor strategy.
4. Fix screenshot-level and desktop-shell UX bugs inside the existing Mobile PI/current-design-system runtime without broadening product scope.
5. Add the Payments menu foundation for all countries before country-specific copy refinements.
6. Add the Products menu foundation for all countries, with ShopSmart tab visibility country-scoped before label/content fine tuning.
7. Add the New payment bottom sheet foundation for all countries before implementing payment-type flows.
8. Keep Products menu card layout as a reusable component contract shared across all countries.
9. Hide/show account, card, and product balances globally from the homepage toggle while leaving transactions visible.
10. Make Account Detail transaction search usable, including query filtering, clear action, and search activation scroll behavior.
11. Keep the MobileFrame system area visually faithful by removing non-device shadows from the Dynamic Island.
12. Add the Transaction Detail and Domestic Payment flow screens supplied by screenshot, with entry from both Transaction Detail `Redo payment` and Payments/New payment/Domestic payment.
13. Keep the Payments `OTHER` shortcut action as a reusable component with supplied SVGs and a stable icon/label styling contract shared across countries.
14. Keep top-level header action slots stable inside each page header rail; Home is intentionally ordered `Hide/Show amounts`, `Profile`, `Messages`.
15. Keep New payment bottom-sheet rows and help banner as reusable component contracts with supplied icons and typography.
16. Keep every screenshot in `screenshots/` represented in the Design System Inventory `Templates` tab as a selectable template, with related existing components called out where the mapping is clear.
17. Keep Products offer carousel cards as a reusable component contract matching the supplied 327x157 offer-card typography/layout spec.
18. Keep Design System Inventory as the visible control surface for components, templates, icons, and colors.
19. Keep reusable app colors centralized in `colorRegistry.ts` and `theme.css`, with Light/Dark controlled through demo state rather than scattered local styling.

## Blocked By

- Full SME and next-design-system screen implementations remain future product work, but they are no longer hidden leftovers: selecting them now produces an explicit planned-state runtime.
- No automated visual regression suite exists yet for safe-area/header/desktop viewport/account-carousel behavior; verification for these bugs was manual browser smoke testing plus production build.

## Next Recommended Action

Continue with product evolution work:

1. Fill SME screen registry entries when actual SME screens are imported or designed.
2. Fill next-design-system screen/component mappings before visual migration.
3. Keep `src/app/registry/templateRegistry.ts` updated whenever new screenshot templates are added to `screenshots/`.
4. Expand AI catalog metadata as new screenshots and components are added.
5. Add automated tests for product/release/design-system switching.
6. Add visual regression coverage for account-detail sticky header, safe-area behavior, account-card carousel drag/snap, all-products carousel coverage, account-details info screen layout, desktop preview auto-fit behavior, and Design System template-card selection.
7. Replace default Payments placeholder labels with country-specific titles and labels when copy is provided.
8. Fine tune Products labels, imagery, ShopSmart content, and per-country copy once the country-specific source copy and final assets are provided.
9. Fine tune New payment bottom sheet labels per country and implement the remaining Foreign/SEPA and Templates/Beneficiaries flows when those screens are supplied.
10. Add automated coverage for amount visibility persistence across navigation and transaction-row exclusion.
11. Add automated coverage for Account Detail transaction search, clear reset, and activation scroll behavior.
12. Fine tune Transaction Detail and Domestic Payment create/review/sign/success spacing, labels, and per-country copy against final screenshot references.
13. Add an automated color-token audit that fails on raw app hex/rgb/Tailwind palette classes outside approved registry/asset boundaries.
14. Add visual regression coverage for Light/Dark mode across Home, Payments, Products, Analytics, More, and Design System Inventory.

## Commands / Verification

- GitHub repository created: `https://github.com/cata009/mobile-banking-cee`.
- Initial commit pushed to `origin/main`: `2767060` (`Initial mobile banking demo platform`).
- `npm run build` passed on 2026-05-27.
- Vite emitted a chunk-size warning because the bundle and image assets are large; this is recorded in `known-bananas.md`.
- Browser verification passed on fresh dev server `http://localhost:5174`: Control Panel opens, shows Mobile PI/current design system context, and displays feature lifecycle/coverage statuses.
- `npm run build` passed again after removing runtime `variant` state and adding product/design-system selectors.
- `npm run build` passed again after adding `CountryId`, component registry, AI catalog export, and planned-state placeholders.
- Browser verification passed on fresh dev server `http://localhost:5175`: Mobile PI loads, Mobile SME selection shows the planned-context placeholder, and next design-system selection shows the planned-context placeholder.
- `npx tsc --noEmit` could not run because the workspace does not include a local `typescript` package or `typecheck` script; this is recorded in `known-bananas.md`.
- `npm run build` passed after the account-detail sticky-header/safe-area fix on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on fresh dev server `http://127.0.0.1:5176`: opened Mobile PI, logged in, opened Accounts, entered account detail, scrolled transactions, and confirmed `Dante International` / `Carrefour` rows stay below the sticky `Accounts` header instead of under Dynamic Island.
- `npm run build` passed after the desktop preview auto-fit/page-scroll fix on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: after reload, `bodyCanScrollX` and `bodyCanScrollY` were both `false`; the shell height matched the viewport; internal phone scrolling still worked on the homepage while `window.scrollY` stayed `0`.
- `npm run build` passed after the account-carousel gutter/shadow/drag fix on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: account carousel reset to account 1 with `scrollLeft: 0`, first card logical offset `16`, `scrollPaddingLeft: 16px`, softened layered shadow, and drag from the visible card surface snapped to account 2 with `scrollLeft: 327`.
- `npm run build` passed after hiding the Account options scrollbar on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: Account options content area has `scrollbar-hide` / `scrollbarWidth: none`, and internal `scrollTop` still changes on scroll.
- `npm run build` passed after the account-carousel edge-peek fix on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: first card remains at `scrollLeft: 0`; middle card snaps to `scrollLeft: 311` with previous and next peeks visible; last card snaps to `scrollLeft: 622` with the right margin preserved.
- `npm run build` passed after the AccountBalanceCard sub-account visibility/spacing fix on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: Account Detail rendered three account cards with no visible `SUB ACCOUNT` text, no sub-account value nodes, and a measured `16px` logical metadata-to-balance gap at the current phone-frame scale.
- `npm run build` passed after the AccountBalanceCard current-balance row gap fix on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: first account card rendered `Current balance` and `534,98 RON` in a row with class `gap-[4px]`; measured visual gap was `4px` logical at the current phone-frame scale.
- `npm run build` passed after the Account Detail title-card spacing and sticky-search fix on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: at `scrollTop: 0`, the large `Accounts` title-to-card gap measured `24px` logical; after scrolling to `scrollTop: 520`, the search bar stayed sticky with a `24px` logical gap below the top header.
- `npm run build` passed after the Account Detail all-products carousel fix on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: clicked `Personal Loan` from homepage, Account Detail rendered six carousel cards (`Primary Account`, `Savings Account`, `Emergency Fund`, `12-Month Term Deposit`, `Personal Loan`, `Home Mortgage`), and desktop drag reached the final `Home Mortgage` card.
- `npm run build` passed after adding the Account Details info screen on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: logged in, opened `Primary Account`, clicked the `Details` action, and confirmed the new `Account Details` screen renders with the share header action, account-number/copy row, balance fields, `Show less`, and connected-card row.
- `npm run build` passed after fixing Account Details to reuse the existing `PageHeader` collapse behavior on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: logged in, opened `Primary Account`, clicked `Details`, confirmed the large `Account Details` title at the top state, scrolled the page, and confirmed the sticky header stays visible with `Account Details` centered between Back and Share.
- `npm run build` passed after adding the Payments menu screen on 2026-05-27; Vite still emits the known chunk-size warning.
- Chrome headless/CDP smoke verification passed on `http://127.0.0.1:5176`: logged in, opened Payments from bottom navigation, and confirmed `Payments`, `New payment`, `Between my accounts`, `Recurrent payments`, `Scan & pay`, `OTHER`, `CREATE QR CODE`, `TEMPLATES`, `CARD REPAYMENT`, and `EXCHANGE RATES` are visible/reachable.
- `npm run build` passed after wiring the Products menu screen on 2026-05-27; Vite still emits the known chunk-size warning.
- Chrome headless/CDP smoke verification passed on `http://127.0.0.1:5176`: logged in, opened Products from bottom navigation, confirmed RO shows `Banking` and `ShopSmart`, confirmed the Offers/Products/Other Solutions content, and confirmed the first offer card text does not clip.
- Chrome headless/CDP smoke verification passed on the user's active dev-server port `http://127.0.0.1:5175`: RO shows the `ShopSmart` tab and RS/Serbia hides `ShopSmart` while keeping the Products page content.
- `npm run build` passed after adding the New payment bottom sheet on 2026-05-27; Vite still emits the known chunk-size warning.
- Chrome headless/CDP smoke verification passed on the user's active dev-server port `http://127.0.0.1:5175`: logged in, opened Payments, clicked `New payment`, confirmed the bottom sheet contains the three payment actions, help banner, and bottom anchoring, and confirmed both header X and outside-tap close dismiss the sheet.
- Chrome headless/CDP smoke verification passed on `http://127.0.0.1:5175` for CZ: after switching to Czech Republic, the New payment sheet renders `Send payment in CZK in CR`.
- `npm run build` passed after adding the reusable Products menu card component on 2026-05-27; Vite still emits the known chunk-size warning.
- Chrome headless/CDP smoke verification passed on `http://127.0.0.1:5175`: logged in, opened Products, and confirmed the five core product cards (`Account`, `Cards`, `Mortgages and loans`, `Insurance`, `Investments and savings`) compute to `164px` width, `120px` height, `16px` padding, `flex-start` alignment, `10px` gap, and `18px`/`700`/white UniCredit text.
- `npm run build` passed after adding global amount visibility on 2026-05-27; Vite still emits the known chunk-size warning.
- Chrome headless/CDP smoke verification passed on `http://127.0.0.1:5175`: default homepage amounts are visible; clicking the hide icon masks homepage balances, switches to the supplied 20x20 show icon, keeps masks across Account Detail and Account Details navigation, and leaves a transaction row amount visible (`+ 6.225,00 RON`).
- Chrome headless/CDP smoke verification passed on `http://127.0.0.1:5175`: clicking the show icon restores visible homepage amounts and returns the hide icon.
- `npm run build` passed after adding Account Detail transaction search on 2026-05-27; Vite still emits the known chunk-size warning.
- In-app browser smoke verification passed on `http://localhost:5175`: opened Account Detail, focused the search input, confirmed the page scrolls to the search sticky target (`scrollTop: 394`), searched `Carrefour`, confirmed `Dante International` is filtered out, confirmed the supplied 20x20 clear-results icon replaces Filters, and confirmed clear restores the full list and Filters icon.
- `npm run build` passed after removing the Dynamic Island drop shadow on 2026-05-27; Vite still emits the known chunk-size warning.
- In-app browser smoke verification passed on `http://localhost:5175`: the Dynamic Island element resolves with `boxShadow: none` while keeping the same class contract for size and radius.
- `npm run build` passed after adding the Transaction Detail and Domestic Payment flow on 2026-05-27; Vite still emits the known chunk-size warning.
- In-app browser smoke verification passed on `http://localhost:5175`: Payments -> New payment -> Domestic payment opened a blank Domestic payment form, continued through Review data, Sign, Successful payment, and returned to Payments.
- In-app browser smoke verification passed on `http://localhost:5175`: Account Detail transaction row -> Transaction Detail -> Redo payment opened Domestic payment with beneficiary/account/amount fields prefilled from the selected transaction.
- `npm run build` passed after adding the reusable Payments `OTHER` shortcut component on 2026-05-27; Vite still emits the known chunk-size warning.
- `git diff --check` returned no whitespace errors after the Payments `OTHER` shortcut change; it only reported the existing LF-to-CRLF normalization warnings.
- In-app browser smoke verification passed on `http://localhost:5175`: Payments `OTHER` renders all four shortcut actions, the QR SVG computes to `22x28`, the other three SVGs compute to `32x32`, each icon slot computes to `32px` by `32px` with `flex-shrink: 0`, and each label computes to `14px`, `700`, `1px` letter spacing, centered `#262626`, with `liga` / `clig` disabled.
- `npm run build` passed after the top-level header action alignment fix on 2026-05-27; Vite still emits the known chunk-size warning.
- In-app browser smoke verification passed on `http://localhost:5175`: after navigating Home -> Payments -> Products -> More, top header actions stayed in fixed rail slots; Home now uses the requested `Hide/Show amounts`, `Profile`, `Messages` order.
- `npm run build` passed after adding the reusable New payment action rows and Discover banner on 2026-05-27; Vite still emits the known chunk-size warning.
- In-app browser smoke verification passed on `http://localhost:5175`: New payment bottom-sheet rows compute to logical `80px` height, stack with `0` visual gap, keep a `24px` logical gap from the title/header block, render Domestic icon as `19x20`, Foreign/Templates/Chevron as `32x32`, and render the Discover banner info icon as `20x20`, close icon as `12x12`, title as `18px/700/white`, and subtitle as `18px/400/white`.
- `npm run build` passed after adding the Design System Inventory `Templates` tab on 2026-05-27; Vite still emits the known chunk-size warning.
- Screenshot-to-template coverage check passed: `screenshots=30 registry=30`, with no differences between the `screenshots/` folder and `src/app/registry/templateRegistry.ts`.
- In-app browser smoke verification passed on `http://localhost:5175`: opened Design System Inventory, selected `Templates`, confirmed the active tab is `Templates`, confirmed 30 selectable template cards, confirmed the selected preview image loads, and confirmed selecting `Transaction detail` changes the selected card and preview to `screenshots/Transaction detail.png` at `375 x 1855`.
- `npm run build` passed after adding the reusable Products offer card on 2026-05-27; Vite still emits the known chunk-size warning.
- In-app browser smoke verification passed on `http://localhost:5175`: opened Products and confirmed the first offer card computes to `327px` width, `157px` height, text stack `display:flex`, `width:206px`, `flex-direction:column`, `align-items:flex-start`, `gap:8px`, title `24px`/`700`/white/normal line-height/stretch, and subtitle `16px`/`400`/white/normal line-height/stretch.
- `npm run build` passed after centralizing the app icon registry and adding the Design System Inventory `Icons` tab on 2026-05-27; Vite still emits the known chunk-size warning.
- Icon audit passed with reusable UI icons routed through `AppIcon`; remaining `<svg>` occurrences are limited to `AppIcon`, brand logos, status/device chrome, decorative motion/texture/shadow SVGs, Prime background texture SVGs, and the Floating Co-Apping background shape.
- In-app browser smoke verification passed on `http://localhost:5175`: opened Design System Inventory, selected `Icons`, confirmed the tab renders `Icon registry`, `Mapped icons`, `Custom SVG`, `Lucide wrappers`, `Deduplicated`, category sections including `Header`, `Payments`, and `Prime`, plus `Icon audit boundaries`; 84 icon cards rendered.
- `npm run build` passed after the Products offer carousel drag/snap and spacing fix on 2026-05-27; Vite still emits the known chunk-size warning.
- In-app browser smoke verification passed on `http://localhost:5175`: Products spacing measured `16px` for tab-to-offers, offers divider-to-carousel, carousel-to-our-products, our-products divider-to-grid, product column gap, and product row gap; dragging the offer carousel snapped to the second card at `scrollLeft=339`.
- `npm run build` passed after the Design System Colors inventory, app-wide color tokenization, and Light/Dark appearance mode on 2026-05-27; Vite still emits the known chunk-size warning.
- Raw hex audit passed: `rg -n "#[0-9A-Fa-f]{3,8}" src/app -g "*.tsx" -g "*.ts" -g "*.css" -g "!src/app/registry/colorRegistry.ts"` returned no matches.
- Numeric RGB audit passed: `rg -n "rgba\(|rgb\([0-9]" src/app src/styles -g "*.tsx" -g "*.ts" -g "*.css"` returned no matches.
- Tailwind palette audit passed: app code no longer reports color palette classes; remaining matches are non-color layout utilities such as `focus:ring-offset-*` and border-width helpers.
- In-app browser smoke verification passed on `http://localhost:5175`: Design System Inventory `Colors` tab renders, color copy feedback changes to `Copied`, Light/Dark switches from the control plane, and the dark root exposes `--uc-app-bg: #262626`, `--uc-surface: #454545`, and `--uc-text: #FFFFFF`.
- `git diff --check` passed after final whitespace cleanup; Git only reported existing LF-to-CRLF normalization warnings.

## Decisions

- Runtime release selection is now explicit: `DemoState.release` + `DemoState.baseline`.
- `CountryId` is the official taxonomy alias; legacy `Country` remains as the underlying union for compatibility.
- `baseline` and `release` become explicit concepts.
- AI handoff docs are repo-level operating docs, not product features.
- The new registries are mostly non-invasive, except the control panel now reads release and feature metadata visibly.
- The platform capability map was updated for the visible control-panel/release wording change.
- SME and next design system can be selected, but show planned-state placeholders until actual flows exist.
- Account-detail sticky headers must live at the scroll-container level if they are responsible for protecting the device safe area while lower content scrolls.
- Desktop preview scaling must reserve scaled layout dimensions, not only use CSS `transform`, otherwise the visual phone shrinks while the page still scrolls as if it were full size.
- Account-detail card snap positions must use both physical gutter padding and matching `scroll-padding`; otherwise the browser can auto-snap to `scrollLeft: 16` and visually erase the default side margin.
- The account card visual should not receive pointer events inside the carousel; the interactive wrapper owns click, keyboard, and drag so desktop mouse dragging works from the whole visible card.
- Account carousel edge cards and middle cards need different snap math: middle cards center to reveal both neighbors, while first/last cards preserve their outer gutters.
- Account options should keep scroll local to the phone screen without showing a desktop-style scrollbar.
- Current and savings account detail cards should not expose sub-account metadata, even though the reusable card component still supports that optional field for other product contexts.
- Current-balance row value should stay inline next to its label with a `4px` logical gap, not be pushed to the far right edge of the card.
- Account Detail search should stick inside the phone scroll container below the top account header, preserving a `24px` logical gap while transactions scroll underneath.
- Account Detail should reuse homepage product categories for current accounts, saving accounts, term deposits, loans, and mortgages; cards and investments stay out of this carousel unless explicitly requested later.
- Account Details info is a separate runtime screen opened from the `Details` action; it uses the product currently active in the Account Detail carousel.
- Shared header collapse must live in `PageHeader`, with the screen providing scroll progress, so detail screens do not fork their own top bars.
- Payments copy is centralized in `paymentsMenuConfig.ts` by `CountryId`; current labels are intentionally shared across all countries until localized/country-specific wording is provided.
- New payment sheet content lives inside `paymentsMenuConfig.ts`; the sheet shell is generic and reusable, while payment action copy remains country-scoped.
- Products copy and tab availability are centralized in `productsMenuConfig.ts` by `CountryId`; only RO, CZ, SK, and HU show the `Banking` / `ShopSmart` split.
- Products menu card layout lives in `ProductMenuCard`; country-specific differences should stay in `productsMenuConfig.ts` unless the design system itself changes.
- Amount visibility is an in-app demo state, not a feature flag; it persists while navigating screens and resets to visible on a full demo reset/reload.
- Transaction amounts are excluded from amount masking by design.
- Account Detail transaction search is local to the currently selected account/product transaction list; it filters the mock profile in memory and does not introduce backend search or saved search state.
- Dynamic Island should not carry an artificial drop shadow; the phone-frame outer shell can keep its desktop preview shadow, but the system cutout itself stays flat black.
- Transaction Detail is a front-end mock detail screen derived from the selected static transaction and selected account product.
- Domestic payment has two supported entry modes: blank from Payments/New payment/Domestic payment and prefilled from Transaction Detail/Redo payment.
- Domestic payment success returns to Payments, because there is no real account ledger update or transaction creation behind the demo flow yet.
- Payments `OTHER` shortcut visuals live in `PaymentOtherShortcut`; item identity and country menu membership remain in `paymentsMenuConfig.ts`.
- Top-level page headers use fixed header action rails; Home intentionally orders `Hide/Show amounts`, `Profile`, `Messages`, while other top-level pages keep page-specific action sets in the same fixed rail.
- New payment bottom-sheet action rows and Discover banner live as reusable components under `src/app/components/payments`; country-specific action text remains in `paymentsMenuConfig.ts`.
- Screenshot templates live in `src/app/registry/templateRegistry.ts`; the Design System page consumes that registry so screenshot coverage can be audited separately from the long component inventory JSX.
- Products offer carousel visuals live in `ProductOfferCard`; offer identity and country/product menu membership remain in `productsMenuConfig.ts`.
- Reusable UI icons live in `src/app/components/icons/AppIcon.tsx`; product code should consume icons through `AppIcon` so a registry SVG change propagates to every usage.
- Remaining raw SVGs outside `AppIcon` are treated as brand/logo, device chrome, or decorative effect assets unless explicitly promoted into the icon registry later.
- Products offer carousel behavior lives in `ProductsScreen` for now, matching the Account Detail drag/snap interaction without introducing a broader carousel abstraction yet.
- Products page section and grid spacing should stay on the `16px` rhythm unless a later screenshot-level correction explicitly changes it.
- Reusable DS colors live in `src/app/registry/colorRegistry.ts`; runtime styling consumes `src/styles/theme.css` variables so palette changes propagate through CSS tokens.
- Dark mode is a demo appearance mode, not a separate design-system id; `current` / `next` design-system selection remains about DS generation, while Light/Dark is a theme state within the selected DS.
- Raw colors are allowed in the color registry and source assets/screenshots only; active app styling should use CSS variables or registry-driven values.

## Limitations

- Local Git repository is initialized on `main` with remote `origin` set to `https://github.com/cata009/mobile-banking-cee.git`.
- SME and next design system have runtime selectors and planned-state placeholders, but not real product screens yet.
- Screen and flow registry entries are first-pass foundations and should be refined as more screenshots/components are cataloged.
- Existing dev servers on ports `6000`/`6001` may be stale; `5174` and `5175` were started fresh for verification.
- Typecheck, lint, and test cannot be run yet because the package only defines `dev`, `build`, and `preview` scripts.
- Fresh dev server `http://127.0.0.1:5176` was started for this visual check.
- Extremely short desktop viewport heights may still hit the minimum preview scale; add automated viewport-size regression tests before changing the scale bounds further.
- Carousel drag behavior is currently verified manually in the browser; add automated pointer/mouse drag coverage before changing the account carousel interaction model.
- Transaction rows remain mock-profile driven for the expanded product carousel; term deposits, loans, and mortgages reuse existing account transaction profiles until product-specific transaction data is defined.
- Account Details info values are mock-derived from the selected product and should receive screenshot-level spacing/copy refinements in follow-up fixes.
- Payments menu actions are mostly navigational placeholders; Domestic payment now has a mock create/review/sign/success flow, but there is still no real payment execution, QR generation, template management, repayment, or exchange-rate detail flow.
- Payments menu labels are shared English placeholders across all countries until country-specific title/label updates are requested.
- New payment sheet Domestic now opens the mock Domestic payment flow; Foreign/SEPA and Templates/Beneficiaries remain menu placeholders until their target screens are supplied.
- Domestic payment values are static/mock-driven and do not update balances, transaction lists, or backend state after success.
- The screenshot filenames for Sign and Successful payment are currently source-supplied names (`Language Selection.png` and `Transfer to new phone.png`), while the registry maps them to the actual payment screens they represent.
- Products menu cards are navigational placeholders only; product detail, ShopSmart purchasing, offer detail, and additional-services detail flows do not exist yet.
- Products menu labels, imagery, and ShopSmart content are shared placeholders until country-specific copy and final assets are supplied.
- Products offer carousel drag/snap is manually browser-verified only; add automated pointer/visual regression coverage before changing carousel math again.
- Amount visibility is not persisted to local storage; this satisfies navigation persistence but not browser reload persistence.
- Transaction search uses the current static mock transaction profile only; term deposits, loans, and mortgages still reuse the existing mock transaction profiles until product-specific transaction data is defined.
- `templateRegistry.ts` is intentionally explicit, so adding or renaming files in `screenshots/` requires updating the registry entry in the same session.
- `AppIcon.tsx` is intentionally explicit, so adding a reusable UI icon requires a registry entry with usage metadata in the same session.
- SVG audit still allows brand logos, device chrome, decorative textures/effects, and vendored `ui/` primitives outside `AppIcon`; these boundaries are documented in the Design System Inventory Icons tab.
- `colorRegistry.ts` and `theme.css` are intentionally explicit, so adding a reusable color or app semantic color requires updating the registry/theme in the same session.
- Color-token compliance is currently enforced by manual `rg` audits and browser smoke checks; no automated test fails the build yet if a future contributor introduces raw app colors.
- The Browser virtual clipboard cannot read back copied values in this environment, so copy-hex verification used visible `Copied` UI feedback rather than clipboard-read confirmation.

## Constitutional Check

constitutional check:
- scope preserved: yes
- docs updated: yes
- verification recorded: yes
- bananas triaged: yes
- safe to resume: yes

safe to resume: yes, Design System Colors inventory, Light/Dark appearance switching, app-wide color tokenization, color audits, build verification, browser smoke verification, and prior Payments/Products/Analytics/account-detail/demo-foundation work are complete; remaining work is follow-up automation and screenshot-level fine tuning, not a blocker.
