# Current Session

Last updated: 2026-06-01

## Current Focus

Completing the Design System screenshot template reconstruction so every template is represented as reusable JSX, not as a PNG/JPG-only reference.

## Last Meaningful Change

Latest screenshot-template completion:

- `src/app/components/templates/TemplateCodePreviews.tsx` now reconstructs the final 10 source-only screenshot templates as code: Account options, Activate Mobile Token, Analytics, Cards, Contact bottom sheet, account-detail homepage, Domestic payment, Review request, Review data, and Transaction detail.
- `src/app/registry/templateRegistry.ts` now marks all 30 screenshot templates as `reconstructed-code` with `codePreviewId` mappings; source PNG/JPG assets remain comparison evidence in the Design System Templates tab.
- `src/app/registry/componentRegistry.ts`, `src/app/registry/aiCatalog.ts`, `docs/handoff/next-tasks.md`, `docs/handoff/state-of-the-world.md`, `docs/handoff/banana-log.md`, and `docs/platform-capability-map/README.md` now record 30/30 code-backed template coverage.
- `npm run build` passed on 2026-06-01; Vite still emits the known chunk-size warning.
- Static coverage checks passed: `screenshots=30 registry=30`, `reconstructed=30 codePreviewIds=30`, and no `implementationStatus: "source-only"` entries remain.
- Raw color audits passed: no raw app hex outside `colorRegistry.ts` and no direct numeric `rgb()`/`rgba()` in `src/app` or `src/styles`.
- `git diff --check` passed; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser smoke verification passed on `http://127.0.0.1:5175`: Design System Inventory -> Templates selected, 30 template cards, 30 code-backed cards, and the final 10 templates each open in `code` mode with `Reconstructed code`, `src/app/components/templates/TemplateCodePreviews.tsx`, and expected screen text visible.

Latest RO Kids prototype implementation:

- `src/data/roKidsBanking.ts` adds strict Romania/RON mock data and types for child profile, parent profile, money requests, send-money requests, saving goals, chores, approvals, allowance, transactions, learn modules, card settings, and parent controls.
- `src/app/screens/kids/RoKidsApp.tsx` implements a contained Mobile PI Kids module with Kid Home, onboarding, parent activation, request money, parent approval, send money approval, My Card, card customization, saving goals, allowance, chores, Learn, What Parent Can See, Parent Dashboard, Parent Approvals, Parent Controls, and chore/allowance management.
- `src/app/App.tsx` renders `RoKidsApp` only for `product=KIDS_PI`, `country=RO`, and `designSystem=current`; all other Kids contexts still fall back to the honest planned-state placeholder.
- `src/app/registry/projectModel.ts`, `src/app/state/demoTypes.ts`, `src/app/registry/screenRegistry.ts`, `src/app/registry/flowRegistry.ts`, `src/app/registry/componentRegistry.ts`, and `src/app/registry/aiCatalog.ts` now register the RO Kids prototype, the core Ask Money -> Parent Approval -> Money Received flow, and the contained module component entry.
- `docs/architecture/PROJECT_MODEL.md`, `docs/handoff/state-of-the-world.md`, and `docs/platform-capability-map/README.md` now record that Mobile PI Kids has a Romania-only mock-driven runtime prototype while other Kids concepts remain planned.
- `npm run build` passed after the RO Kids implementation on 2026-05-29; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://127.0.0.1:5177` selected `Mobile PI Kids` + `Romania`, opened the Kids Home, completed Ask Money -> Parent Approval -> Approve -> Money Received, and confirmed Mia's balance moved from `86 RON` to `116 RON` with no stale waiting banner.
- `git diff --check` passed after the RO Kids code changes; Git only reported the normal LF-to-CRLF warnings on Windows.
- Typecheck, lint, and tests remain unavailable as separate scripts; `package.json` only exposes `dev`, `build`, and `preview`.

Previous product-taxonomy infrastructure refinement:

- `src/app/state/demoTypes.ts` now models `KIDS_PI` as a first-class `ProductId`, alongside `PI` and `SME`, so future registries can attach country/screen/flow coverage without another taxonomy migration.
- `src/app/registry/projectModel.ts` now registers `KIDS PI` as a planned product layer and includes it in `PRODUCT_ORDER`, so it appears in the same selector/dropdown infrastructure as `Mobile SME planned`.
- `docs/architecture/PROJECT_MODEL.md`, `docs/handoff/state-of-the-world.md`, and `docs/platform-capability-map/README.md` now record that `KIDS PI` exists for all countries and is visible in runtime selectors as a planned context, while still rendering the honest non-implemented placeholder.
- `npm run build` passed after the KIDS PI selector exposure on 2026-05-28; Vite still emits the known chunk-size warning.

Latest demo top-bar compactness refinement:

- `src/app/components/demo/DemoTopBar.tsx` now renders the product, country, and release dropdown triggers as plain selected values (`Mobile PI`, `Romania`, `Current baseline`) without the extra `Application`, `Country`, and `Release` helper labels, making the control strip denser and easier to scan.

Latest Spending / My Spendings PFM baseline refinement:

- `src/data/spendingAnalytics.ts` now exposes a reusable period timeline for Spending, combining up to 2 years of month entries with appended yearly totals so the screen can navigate backward through historical months and forward into annual totals.
- `src/data/accountDetails.ts` now includes extra 2025 mock transactions across primary current, secondary current, savings-transfer, and credit-product profiles so the Spending timeline has meaningful month/year history instead of a single isolated month.
- `src/app/screens/analytics/AnalyticsScreen.tsx` now uses the timeline-driven period selector, centered period indicator, and screenshot-style `Money out` / `Money in` sections with proportional pale background pills per PFM category, while removing the previous transaction-count rows, cash banner, and cash-withdrawal divider from the baseline screen.
- The Spending top hero (`Data For` + inflow/outflow chart + centered period dots) now supports full-width swipe/drag navigation between periods and animates as a single sliding panel: the outgoing period section exits toward the screen edge while the incoming section enters concurrently from the opposite side with eased slide/fade motion.
- `src/app/screens/analytics/AnalyticsScreen.tsx` now uses the same drag/snap interaction model as the Products offers rail, with fixed `375px` period panels and deterministic horizontal snap math, so the Spending hero follows the same desktop swipe/drag pattern instead of a bespoke carousel contract.
- The Spending period indicator dots are now anchored outside the moving hero panel, so only the `Data For` + chart + `Incomes/Spendings` section slides between periods while the centered indicator stays fixed in place.
- The `Card Transaction` quick action above `Money out` is now restored through the shared `AccountActionBar` instead of the temporary custom button markup used during iteration.
- `npm run build` passed after the Spending baseline refinement on 2026-05-28; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:5175` earlier in the day confirmed the Spending screen now starts on `APRIL 2026`, navigates forward into yearly totals (`2026`, then `2025`), keeps the indicator centered, and renders right-aligned proportional Money Out pills with shared PFM icons.
- `npm run build` and `git diff --check` both passed again after the Spending hero transition polish on 2026-05-28; Git only reported the normal LF-to-CRLF warnings on Windows.

Latest Documents screen implementation:

- `src/app/screens/documents/DocumentsScreen.tsx` now implements the PI Documents screen as the same family as Messages, reusing the shared `PageHeader` and `AccountSearchBar` but removing the mailbox tabs and dot-menu actions.
- `src/app/config/documentsConfig.ts` now owns the grouped-by-year Documents mock rows used by both runtime and template reconstruction.
- `src/app/screens/more/MoreScreen.tsx` now routes the Documents card to a real runtime Documents screen, and `src/app/App.tsx` plus the navigation/flow/screen registries now recognize `documents` as a real screen reachable from More.
- `src/app/components/templates/TemplateCodePreviews.tsx` and `src/app/registry/templateRegistry.ts` now reconstruct `screenshots/Documents.png` as code; this was part of the earlier partial template-coverage phase.
- `npm run build` passed after the Documents implementation on 2026-05-28; Vite still emits the known chunk-size warning.

Latest Settings screen implementation:

- `src/app/screens/settings/SettingsScreen.tsx` now implements the PI Settings screen with the shared `PageHeader`, `SectionHeadingDivider`, and chevron-row treatment, driven by `src/app/config/settingsConfig.ts`.
- `src/app/screens/more/MoreScreen.tsx` now routes the Settings card to the new runtime Settings screen, and `src/app/App.tsx` plus the navigation/flow/screen registries now recognize `settings` as a real screen reachable from More.
- `src/app/components/templates/TemplateCodePreviews.tsx` and `src/app/registry/templateRegistry.ts` now reconstruct the `screenshots/Settings.png` template as code, so the Design System Templates tab shows Settings as a code-backed preview instead of source-only PNG.
- `npm run build` passed after the Settings implementation on 2026-05-28; Vite still emits the known chunk-size warning.

Latest manual dark-mode pair mapping pass:

- `src/styles/theme.css` now applies the user-supplied dark counterparts for the previously unmatched DS colors, including neutral surfaces, teal accents, warm colors, product colors, and PFM semantic colors.
- Pure black was removed from active DS tokens: `--uc-primary-main` and `--uc-static-black` now normalize to `#262626`, and `--uc-static-black-rgb` now uses `38 38 38`.
- `src/app/registry/colorRegistry.ts` now mirrors the same manual dark pairs so the Design System Colors inventory matches runtime behavior.
- PFM semantic colors that reuse the same light hex as core DS colors now also inherit the user-supplied dark pairs in the registry/runtime instead of staying on placeholder dark values.

Latest DS color-registry expansion for active platform colors:

- `src/app/registry/colorRegistry.ts` now includes a dedicated `PFM Categories` palette so active Personal Finance Management colors are cataloged explicitly in the Design System inventory instead of existing only as theme tokens.
- Added DS color entries for the previously uncataloged active PFM colors and semantics, including `Taxes and Penalties`, `Groceries`, `Lifestyle`, `Investments`, `Internal`, plus the rest of the active PFM token set for semantic traceability.
- `COLOR_SOURCE_AUDIT.normalizedColorsInRegistry` now reflects the expanded registry coverage for active platform colors.
- `APP_COLOR_AUDIT` now records that the PFM-only colors are intentionally mapped through DS registry entries rather than remaining hidden in `theme.css`.

Latest dark-mode token matching refinement:

- `src/styles/theme.css` now remaps dark-mode tokens by exact-match reference against the supplied external DS table, reusing only the corresponding dark partners for colors that already exist in the current DS.
- Updated dark mappings now include the neutral `#666666 -> #CCCCCC` pair, primary teal `#006375 -> #CCCCCC` and `#007A91 -> #FFFFFF`, brand red `#E2001A -> #E2001A`, product blue deep `#244858 -> #91D1DD`, green `#004C3D -> #004C3D`, `#008574 -> #008574`, `#359F42 -> #359F42`, status green `#3D7D43 -> #26EDA9`, warning orange `#F26B08 -> #FDA98B`, and status red `#CF3524 -> #FF7A8E`.
- `src/app/registry/colorRegistry.ts` now mirrors those exact-match dark pairs in the Design System Colors inventory so the registry stays aligned with runtime theme tokens.
- Banner blue variants in dark mode now also follow the exact-match teal mapping (`#006375 -> #CCCCCC`, `#007A91 -> #FFFFFF`) instead of reusing the light-mode values.

Latest Products offer-card color-variant system:

- `src/app/components/SectionHeadingDivider.tsx` now provides the shared 14px bold uppercase section-label + divider contract (`line-height: normal`) for top-of-section headings.
- `src/app/screens/products/ProductsScreen.tsx` now uses that shared section heading contract for `OFFERS FOR YOU`, `OUR PRODUCTS`, `OTHER SOLUTIONS`, and the ShopSmart section labels instead of a local `21px/24px` heading style.

- `src/app/config/productBannerVariants.ts` now defines reusable banner color-family mappings for `green`, `yellow`, `orange`, `pink`, `red`, `blue`, and `grey`, each with `normal` and `light` variants.
- `src/styles/theme.css` now exposes stable banner color variables so these variants keep their supplied values regardless of app light/dark theme.
- `src/app/components/products/ProductOfferCard.tsx` now accepts color-family and light-version props, applying the mapped background, chevron, and text colors through the new banner-variant config.
- `src/app/screens/design-system/DesignSystemPage.tsx` now renders the Products offer-card specimen with a compact dropdown that switches between the banner color variants instead of listing every color block separately.
- `src/app/registry/componentRegistry.ts` now records the Products offer-card as a family/light-tone variant component rather than a single green implementation.

Latest Products offer-banner chevron refinement:

- `src/app/components/products/ProductOfferCard.tsx` now owns the requested Products banner-card structure: centered vertical chevron SVG background, fixed `100px` right image column, and text aligned to the remaining left content area.
- The Products offer-card text area now fills horizontally up to `16px` before the right image column instead of staying in a narrower fixed column.
- The Products offer-card title now uses `22px` bold white typography clamped to 2 lines, while the subtitle uses `18px` regular white typography clamped to 3 lines with an `8px` gap from the title.
- `src/app/config/productsMenuConfig.ts` now replaces lorem ipsum in Products offers with banking-focused copy sized to fit the current banner-card layout.
- `src/app/screens/payments/PaymentsScreen.tsx` was reverted to its previous Payments hero-card implementation because the chevron/banner brief belonged to Products, not Payments.
- `src/app/registry/componentRegistry.ts` now records the updated Products offer-card contract, including the chevron layout and `100px` image column.

Latest Payments OTHER shortcut carousel refinement:

- `src/app/screens/payments/PaymentsScreen.tsx` now renders the Payments `OTHER` shortcuts inside a horizontally scrollable rail instead of a static 4-item row.
- `src/app/components/payments/PaymentOtherShortcut.tsx` now uses a fixed `74px` shortcut width and clamps labels to a maximum of 2 lines at `15px` line-height, so labels like `CREATE QR CODE` and `EXCHANGE RATES` no longer spill to a third row.
- `src/app/registry/componentRegistry.ts` now records the `payments.other-shortcut` contract as a carousel-ready shortcut item with fixed width and 2-line label behavior.
- `npm run build` passed after the Payments OTHER carousel refinement on 2026-05-28; Vite still emits the known chunk-size warning.

Latest Account Details info-field component extraction:

- `src/app/components/accounts/AccountDetailsInfoField.tsx` was added as the dedicated Account Details reusable field component, with an `80px` row height, `4px` title-to-subtitle gap, 16px regular title, 16px bold subtitle, and optional trailing-icon variant.
- `src/app/screens/accounts/AccountDetailsInfoScreen.tsx` now uses `AccountDetailsInfoField` for the account-number/copy row and all default title/subtitle balance fields, with `0px` external gap between rows.
- `src/app/registry/componentRegistry.ts` and `src/app/screens/design-system/DesignSystemPage.tsx` now catalog and demonstrate `accounts.details-info-field`, including the default and with-icon variants.
- `npm run build` passed after the Account Details info-field extraction on 2026-05-28; Vite still emits the known chunk-size warning.
- `git diff --check` passed for the touched Account Details component files; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser verification on `http://localhost:5175` confirmed the first Account Details rows compute to `80px` height, title `16px/400/normal`, subtitle `16px/700/normal`, text color `rgb(38, 38, 38)`, and variant markers `with-icon` / `default`.

Latest account transaction data enrichment:

- `src/data/accountDetails.ts` now has country-specific merchant/counterparty profiles for all PI countries (`RO`, `CZ`, `SK`, `HU`, `RS`, `BA`, `SI`) covering current-account payments, card-linked card payments, incoming transfers, account payments, fees, ATM, FX, wallet, investments, taxes, home, education, children, healthcare, insurance, shopping, groceries, lifestyle, leisure, cash, internal transfers, excluded and uncategorized PFM cases.
- Current-account transaction profiles are now distinct per current account instead of reusing the savings profile, so each current account shows different demo transactions.
- Saving accounts and term deposits now use a transfer-only mock profile: only own-account transfers in/out, no merchant/card/interest/round-up rows.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now requests Account Detail transactions in the active country currency, keeping account transaction display aligned with country-local demo reporting.
- `src/data/spendingAnalytics.ts` keeps internal own-account transfers visible in Account Detail but excludes `Internal` PFM transactions from Spending inflow/outflow totals and Money Out / Money In category lists, so savings movements do not appear as real expenses.
- FX demo scale in `src/data/accountDetails.ts` now matches the existing `src/data/exchangeRates.ts` reference table values for deterministic local-currency reporting.
- `npm run build` and `npm run build -- --mode development` passed after the enrichment on 2026-05-28; Vite still emits the known chunk-size warning.
- PFM coverage audit confirmed all 23 categories from `src/data/pfmCategories.ts` are represented in Account Detail mock data; browser smoke on `http://localhost:5175` confirmed RO Primary Account, the second current account, and Emergency Fund render the expected richer/current-only/transfer-only transaction profiles.

Latest AccountSearchBar icon-size contract fix:

- `src/app/components/accounts/AccountSearchBar.tsx` now uses an icon-driven `32px` height with zero vertical padding, explicit `32x32` search/filter/clear SVG rendering, `32px` icon slots, and a `32px` input height.
- `src/app/screens/design-system/DesignSystemPage.tsx` and `src/app/registry/componentRegistry.ts` now record the AccountSearchBar contract as auto-height from the standard 32px icons instead of a separate 36px wrapper.
- `npm run build` passed after the AccountSearchBar icon-size fix on 2026-05-28; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:5175` confirmed CSS heights for the search bar root, search icon slot, filter button, search SVG, filter SVG, and input all compute to `32px`; measured boxes are scaled by the phone preview transform.

Latest Account Detail carousel shadow refinement:

- `src/app/screens/accounts/AccountDetailScreen.tsx` now gives the horizontal carousel a `34px` bottom shadow buffer while pulling the carousel indicator back up by `16px`, so card shadows are not clipped by the scrollport and the surrounding gray surface keeps the same visual rhythm.
- `src/app/components/accounts/AccountBalanceCard.tsx` now uses a softer `0 16px 32px / 0.08` plus `0 3px 10px / 0.05` layered shadow, replacing the harder shorter shadow.
- `npm run build` passed after the account-carousel shadow refinement on 2026-05-28; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:5175` confirmed the carousel has `padding-bottom: 34px`, the available room below the active card is `29px` in the scaled preview, the indicator remains at the prior visual y-position, and the action bar still starts at the same y-position.

Latest Account Detail carousel depth refinement:

- `src/app/screens/accounts/AccountDetailScreen.tsx` now keeps the focused account card at the full `311x197` size while inactive neighbor cards render at a `165px` visual height, preserving a `16px` top and bottom inset relative to the active card.
- Inactive carousel cards now transition their vertical scale, opacity, and filter as focus changes, so click and mouse-drag/swipe movement has a smoother handoff between accounts.
- `src/app/components/accounts/AccountBalanceCard.tsx` now uses a 300ms ease-out transition for opacity/shadow changes so the reusable card cooperates with the carousel focus animation.
- `npm run build` passed after the account-carousel depth refinement on 2026-05-28; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:5175` confirmed the active card reports `data-account-carousel-visual-height="197"` and inactive cards report `165`; measured inside the scaled phone preview this is `169px` active vs `142px` inactive. Clicking `Savings Account` and mouse-dragging to `Emergency Fund` both swapped the full-height active state correctly.

Latest Messages scroll and header refinement:

- `src/app/screens/messages/MessagesScreen.tsx` now uses the shared `PageHeader` with safe-area handling and scroll-derived collapsed title progress instead of a local `MessagesTopChrome`.
- `src/app/config/messagesConfig.ts` now includes extended mock data for Messages: 16 Inbox rows and 10 Outbox rows, so both mailboxes can be scrolled and tested inside the phone frame.
- `src/app/registry/componentRegistry.ts`, `docs/handoff/state-of-the-world.md`, and `docs/platform-capability-map/README.md` now record the shared-header and scrollable extended-message behavior.
- `npm run build` passed after the Messages scroll/header refinement on 2026-05-28; Vite still emits the known chunk-size warning.
- `git diff --check` passed after the Messages scroll/header refinement; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser verification on `http://localhost:5175` confirmed Messages opens with the shared sticky header, Inbox has 16 rows and `scrollHeight=1664` / `clientHeight=812`, scrolling sets the Messages page `scrollTop=420` and the collapsed centered title opacity to `1`, and Outbox has extended rows with `scrollHeight=1184` / `clientHeight=812`.

Latest BottomNavigation Figma contract fix:

- `src/app/components/BottomNavigation.tsx` now uses a fixed `375x54` bottom navigation contract with 24px side padding, 32px icon slots, a 24x2 active indicator, zero gap between active bar/icon/label, and 14px labels with `15px` line-height.
- `src/app/registry/componentRegistry.ts` and `src/app/screens/design-system/DesignSystemPage.tsx` now document the bottom navigation sizing, icon, active-bar, and label contract.
- `npm run build` passed after the BottomNavigation fix on 2026-05-28; Vite still emits the known chunk-size warning.
- `git diff --check` passed after the first BottomNavigation code/doc update; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser verification on `http://localhost:5175` confirmed the runtime BottomNavigation computes to `width=375px`, `height=54px`, label `font-size=14px`, label `line-height=15px`, active bar `24x2`, icon slot `32x32`, `0px` active-bar-to-icon gap, and `0px` icon-to-label gap. Visual boxes are scaled by the phone preview transform, but computed CSS values match the Figma contract.

Latest Transaction Detail PFM category pill fix:

- `src/data/paymentFlow.ts` now exposes the normalized transaction PFM category, display label, color token, and original subcategory on `TransactionDetailData`.
- `src/app/screens/payments/DomesticPaymentFlowScreens.tsx` now renders the top Transaction Detail category pill from the real PFM category with `PfmCategoryIcon`, tokenized category color, and `data-transaction-pfm-category` evidence instead of showing the subcategory with a generic landmark icon.
- `src/app/registry/componentRegistry.ts` now records that Transaction Detail uses the shared PFM icon/category mapping.
- `npm run build` passed after the Transaction Detail PFM category pill fix on 2026-05-28; Vite still emits the known chunk-size warning.
- Fresh preview verification on `http://127.0.0.1:5177` confirmed the Enel Energie transaction opens Transaction Detail with pill text `UTILITIES`, `data-transaction-pfm-category="Utilities"`, subcategory evidence `Utility bill`, and SVG rendering from the shared PFM icon component.

Latest Account Options icon and header fix:

- `src/app/components/icons/AppIcon.tsx` now includes the supplied custom Account Options SVGs for Share account info, Push notifications, Account statement, Create paycode, Change account name, and the 32x32 chevron link.
- `src/app/screens/accounts/AccountOptionsScreen.tsx` now uses those registry icons instead of lucide fallbacks, with 32x32 leading/trailing icon slots.
- Account Options now uses the same scroll-container `PageHeader` pattern as detail screens, with safe area handled by the header and collapsed centered title progress derived from page scroll.
- `npm run build` passed after the Account Options icon/header fix on 2026-05-28; Vite still emits the known chunk-size warning.
- `git diff --check` passed after the fix; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser verification on `http://localhost:5175` confirmed the Account Options page renders the five supplied option icons and chevron SVGs through `AppIcon`, with 32px row slots and the standard `PageHeader` title setup.

Latest Account Detail month-divider spacing fix:

- `src/app/screens/accounts/AccountDetailScreen.tsx` now uses a `16px` rule between each month divider and the next transaction row, plus `16px` between the previous transaction block and the next month divider.
- `src/app/screens/design-system/DesignSystemPage.tsx` and `src/app/registry/componentRegistry.ts` now document the month-divider spacing contract alongside the AccountTransactionRow specimen.
- `npm run build` passed after the month-divider spacing fix on 2026-05-28; Vite still emits the known chunk-size warning.
- `git diff --check` passed after the spacing fix; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser visual verification on `http://localhost:5175` confirmed Account Detail renders with the updated month-divider spacing rhythm.

Latest AccountTransactionRow spacing and line-height fix:

- `src/app/components/accounts/AccountTransactionRow.tsx` now follows the requested Figma contract: transaction label line-height `18px`, amount block line-height `22px`, `4px` label-to-amount gap, day line-height `20px`, `2px` day/month gap, month line-height `15px`, and `16px` date-to-icon gap.
- `src/app/screens/design-system/DesignSystemPage.tsx` and `src/app/registry/componentRegistry.ts` now document the updated AccountTransactionRow contract.
- `npm run build` passed after the row spacing fix on 2026-05-28; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:5175` confirmed the runtime Account Detail row computes to label `18px`, amount `22px`, details gap `4px`, day `20px`, date gap `2px`, month `15px`, and left date/icon `column-gap: 16px`; visual pixel distances are scaled by the phone preview transform.

Latest PFM icon glyph expansion:

- `src/app/components/pfm/PfmCategoryIcon.tsx` now renders real 20x20 SVG glyphs inside the existing 32x32 category icon container for `Taxes and Penalties`, `Income`, `Home`, `Utilities`, `Transportation`, `Children`, `Healthcare`, `Shopping`, `Lifestyle`, `Education`, `Leisure time`, `Investments`, `Uncategorized`, `Groceries`, `Exclude from budget`, `Insurance`, `Finance`, `Wallet`, and `Transfers`, using the path data supplied by the user.
- `Exclude from budget` preserves its source `0 0 21 20` viewBox while still fitting the app's 20px glyph contract inside the 32px container.
- `src/data/pfmCategories.ts` now resolves source/Figma category labels case-insensitively, including aliases such as `Taxes and fines`, `Leisure personal care`, `School and education`, `Transport and utility`, `Uncategorized expenses`, `Cars and transportation`, `Health care`, and the user-supplied `Finacial` typo.
- `src/styles/theme.css` now aligns the supplied PFM category color tokens with the SVG fills for the expanded glyph set.
- `npm run build` passed after expanding the PFM glyphs on 2026-05-28; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:5175` confirmed visible Spending icons for `Wallet` and `Income`, plus Account Detail icons for `Income` and `Taxes and Penalties`, render as SVG glyphs sourced from `screenshots/PFM-icons.svg`; measured browser boxes are scaled by the phone preview transform, matching the intended 32px container / 20px glyph contract.

Latest Spending PFM aggregation implementation:

- `src/data/pfmCategories.ts` now defines the first-pass PFM taxonomy, category aliases, color-token references, fallback initials, and source traceability to `screenshots/PFM-icons.svg`.
- `src/styles/theme.css` now exposes PFM category color variables for both light and dark demo themes.
- `src/data/exchangeRates.ts` now centralizes deterministic demo FX conversion into each country's local reporting currency using a 2026-05-28 reference table.
- `src/data/accountDetails.ts` now maps every generated account transaction to `pfmCategory` and `pfmSubcategory`; transaction detail now uses those PFM fields instead of treating the category as a free-form label.
- `src/data/spendingAnalytics.ts` now aggregates Account Detail transaction profiles into a monthly Spending summary with income total, spending total, cash withdrawal total, Money Out category totals, and Money In category totals.
- `src/app/screens/analytics/AnalyticsScreen.tsx` now renders April 2026 chart totals from the aggregation, removes the fake `Transaction Details` row, and shows PFM-category Money Out plus Money In sections.
- `src/app/components/accounts/AccountTransactionRow.tsx` now renders the shared `PfmCategoryIcon` for each transaction category instead of the generic transfer icon.
- `src/app/registry/componentRegistry.ts`, `src/app/registry/flowRegistry.ts`, `src/app/registry/aiCatalog.ts`, `docs/handoff/state-of-the-world.md`, and `docs/platform-capability-map/README.md` now record the Spending/PFM aggregation behavior.
- `npm run build` passed after the Spending PFM aggregation work on 2026-05-28; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:5175` confirmed `My Spendings` shows April 2026, Outflow `1.438,43 RON`, Money Out categories (`Groceries`, `Utilities`, `Transportation`, `Wallet`, `Lifestyle`, `Leisure time`, `FX`), Money In categories (`Income`, `Internal`, `Transfers`, `Investments`), PFM icon markers sourced from `screenshots/PFM-icons.svg`, and no fake `Transaction Details` row.

Latest AccountTransactionMonthDivider typography fix:

- `src/app/components/accounts/AccountTransactionMonthDivider.tsx` now follows the L3 card-label contract: 14px UniCredit bold uppercase with CSS `line-height: normal`.
- Divider left/month text now uses `var(--uc-text-muted)` / Primary Grey, while the right total uses `var(--uc-text)` / Primary K1 with right alignment.
- `src/app/screens/design-system/DesignSystemPage.tsx` now documents the divider L3 contract in the AccountTransactionRow specimen.
- `npm run build` passed after the divider typography fix on 2026-05-28; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:5175` confirmed `APRIL 2026` computes to `14px`, `700`, `line-height: normal`, `uppercase`, `rgb(102, 102, 102)`, and `5.683,92 RON` computes to `14px`, `700`, `line-height: normal`, `uppercase`, `rgb(38, 38, 38)`, `text-align: right`.

Latest AccountActionBar reuse fix:

- `src/app/components/accounts/AccountActionBar.tsx` now supports a configurable `items` API with 1-4 actions and page-level alignment (`start`, `center`, `end`, `between`) while preserving the existing 4-action Account Detail default.
- `src/app/screens/analytics/AnalyticsScreen.tsx` now renders `Card Transaction` through the shared `AccountActionBar` instead of local markup, so future action-bar label/icon changes propagate there too.
- `src/app/screens/design-system/DesignSystemPage.tsx` now documents AccountActionBar as a 1-4 item component and shows the one-item right-aligned `Card Transaction` variant.
- `src/app/state/demoTypes.ts`, `src/app/registry/componentRegistry.ts`, and `src/app/registry/aiCatalog.ts` now catalog `accounts.action-bar` as a reusable component used by Account Detail and Analytics.
- Browser verification on `http://localhost:5175` confirmed Analytics renders one AccountActionBar item with `justifyContent=flex-end`, `padding=0px 24px 18px 24px`, `fontSize=14px`, and `lineHeight=15px`; Account Detail still renders four items with `justifyContent=space-between`.
- `npm run build` passed after the AccountActionBar reuse fix on 2026-05-28; Vite still emits the known chunk-size warning.

Latest 10-template reconstruction pack:

- Added 10 more screenshot templates as real JSX code previews in `src/app/components/templates/TemplateCodePreviews.tsx`: `Language Selection` as Sign/PIN, `Generate Token`, `Message`, `New request with push`, `Panel` as account-selection sheet, `Apple pay`, `Transfer to new phone` as Successful payment, `Tutorial 1`, `Product selection`, and `RS - Travel Insurance`.
- The new templates share reusable primitives for phone surface, bottom CTA, home indicator, radio rows, form field rows, mini bottom navigation, media/device hero compositions, and code-native travel/card/tutorial visuals.
- `src/app/registry/templateRegistry.ts` now marks those 10 templates as `reconstructed-code`; `src/app/registry/componentRegistry.ts` and `src/app/registry/aiCatalog.ts` now reflect 18 code-backed templates total.
- Screenshot-to-template coverage check still passed after the new pack: `screenshots=30 registry=30`.
- `npm run build` passed after the 10-template pack on 2026-05-28; Vite still emits the known chunk-size warning.
- Raw color audits passed after the 10-template pack: no raw hex under `src/app` outside `colorRegistry.ts`, and no direct numeric `rgb()` / `rgba()` under `src/app` or `src/styles`.
- `git diff --check` passed after the 10-template pack; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser smoke verification passed on `http://127.0.0.1:5175`: Design System Inventory -> Templates renders 30 cards and 18 code-backed templates; all 10 new templates select in `code` mode, show `Reconstructed code`, point to `src/app/components/templates/TemplateCodePreviews.tsx`, and render their expected screen text.

Latest AccountActionBar label annotation fix:

- `src/app/components/accounts/AccountActionBar.tsx` now renders action labels with explicit `15px` line-height instead of `leading-normal`, so labels such as `Details` no longer compute as a 21px-tall text box.
- `src/app/screens/design-system/DesignSystemPage.tsx` now documents the AccountActionBar label contract as `14px regular / 15px line`.
- Browser verification on `http://localhost:5175` confirmed the runtime AccountActionBar labels render with `fontSize=14px`, `fontWeight=400`, and `lineHeight=15px`.
- `npm run build` passed after the AccountActionBar label fix on 2026-05-28; Vite still emits the known chunk-size warning.

Latest New payment sheet spacing annotations:

- `src/app/components/BottomSheet.tsx` now uses uniform `16px` sheet padding for the New payment modal shell.
- `src/app/components/payments/NewPaymentDiscoverBanner.tsx` now uses uniform `16px` banner padding, a `4px` title/subtitle gap, and CSS `line-height: normal` for the banner title and subtitle.
- Browser verification on `http://127.0.0.1:5175` confirmed the New payment dialog padding is `16px` on all sides, the discover banner padding is `16px` on all sides, the subtitle margin-top is `4px`, and the subtitle line-height computes to `normal`.
- `npm run build` passed after the sheet/banner annotation fix on 2026-05-28; Vite still emits the known chunk-size warning.
- `git diff --check` passed after the sheet/banner annotation fix; Git only reported the normal LF-to-CRLF warnings on Windows.

Latest Payments shortcut annotation fix:

- `src/app/components/payments/PaymentOtherShortcut.tsx` now applies the requested 15px label box and 15px line-height to the `CARD REPAYMENT` shortcut label only.
- The change is scoped to `card-repayment` so multi-line shortcuts such as `CREATE QR CODE` keep their existing layout.
- Browser verification on `http://127.0.0.1:5175` confirmed the `CARD REPAYMENT` label computes to `cssHeight=15px` and `lineHeight=15px`.
- `npm run build` passed after the annotation fix on 2026-05-28; Vite still emits the known chunk-size warning.
- `git diff --check` passed after the annotation fix; Git only reported the normal LF-to-CRLF warnings on Windows.

Latest feedback status template reconstruction:

- Five additional screenshot templates were reconstructed as real JSX code previews: `Informative`, `Pending`, `Success to be`, `Error to be`, and `Warning to be`.
- `src/app/components/templates/TemplateCodePreviews.tsx` now includes a reusable feedback status screen primitive with help-only top chrome, centered status icon, lorem body section, and fixed bottom `PrimaryButton` CTA.
- The five feedback templates share the same parameterized implementation and differ only by title, status icon treatment, and semantic status color.
- `src/app/registry/templateRegistry.ts` now marks those five templates as `reconstructed-code` with code preview ids: `informative-status`, `pending-status`, `success-status`, `error-status`, and `warning-status`.
- That step brought `src/app/registry/componentRegistry.ts` and `src/app/registry/aiCatalog.ts` to 8 code-backed templates total: template 52, template 67, Product, plus the five feedback status templates.
- Screenshot-to-template coverage check still passed after the feedback pack: `screenshots=30 registry=30`.
- `npm run build` passed after the feedback template pack on 2026-05-28; Vite still emits the known chunk-size warning.
- Raw color audits passed after the feedback template pack: no raw hex under `src/app` outside `colorRegistry.ts`, and no direct numeric `rgb()` / `rgba()` under `src/app` or `src/styles`.
- `git diff --check` passed after the feedback template pack; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser smoke verification for that step passed on `http://127.0.0.1:5175`: Design System Inventory -> Templates rendered 30 cards and 8 code-backed templates; the five new feedback templates were present, each selected in reconstructed-code mode, showed the expected title/status body/`Ok, got it` CTA, and pointed to `src/app/components/templates/TemplateCodePreviews.tsx`.

Latest Messages runtime implementation:

- `src/app/screens/messages/MessagesScreen.tsx` was added as the real runtime Messages screen reconstructed from `screenshots/52.png` / template 52.
- `src/app/config/messagesConfig.ts` now exposes a country-addressable mock Messages config for all PI countries (`RO`, `CZ`, `SK`, `HU`, `RS`, `BA`, `SI`), currently sharing the same baseline Inbox/Outbox data until country-specific copy is supplied.
- `src/app/App.tsx`, `NavigationContext`, and `useNavigation` now include the `messages` runtime screen.
- Top-level runtime headers now route their Messages icon to the new screen from Home, Analytics / Spending, Payments, Products, and More.
- `TemplateCodePreviews.tsx` now reuses the same message config data as the runtime Messages screen for template 52 continuity.
- `screenRegistry.ts`, `componentRegistry.ts`, `flowRegistry.ts`, `templateRegistry.ts`, `demoTypes.ts`, and `aiCatalog.ts` now catalog `pi.messages.overview`, `messages.inbox-list`, and `pi.header-to-messages`.
- `npm run build` passed on 2026-05-28 after the Messages runtime implementation; Vite still emits the known chunk-size warning.
- Raw color audits passed after the Messages runtime implementation: no raw hex under `src/app` outside `colorRegistry.ts`, and no direct numeric `rgb()` / `rgba()` under `src/app` or `src/styles`.
- `git diff --check` passed after the Messages runtime implementation; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser smoke verification passed on `http://127.0.0.1:5175`: RO Home -> Messages opens the reconstructed screen with `Messages`, `Inbox`, `Outbox`, `2025`, five Inbox rows, and `NEW` badges; Back returns to Home; switching to Czech Republic and logging in again still exposes the Messages icon and opens the same screen; Outbox and search filter work, with `AUG` narrowing Outbox to one row and showing the clear-results action.

Previous reconstructed template-code preview implementation:

- `src/app/components/templates/TemplateCodePreviews.tsx` was added as the real-code renderer for screenshot templates, with reusable phone surface, static status chrome, top header, tab bar, search strip, list rows, dot menu, standing-order rows, and product bottom-sheet composition.
- `template-52` now renders the Messages / Inbox screen as JSX by default in Design System Templates, while keeping `screenshots/52.png` as source evidence.
- `template-67` now renders the Recurrent payment / Standing orders screen as JSX, reusing the same header, tab, search, section-title, and row/action patterns as template 52.
- `template-product` now renders the Product bottom-sheet as JSX with overlay, rounded sheet, media placeholder, close action, body copy, and the existing `PrimaryButton`.
- `src/app/registry/templateRegistry.ts`, `componentRegistry.ts`, `demoTypes.ts`, and `aiCatalog.ts` now mark reconstructed template coverage explicitly for AI catalog continuity.
- `src/app/screens/design-system/DesignSystemPage.tsx` now makes the Templates grid more compact (`190px` cards), bounds the template-card list inside an internal scroller, marks code-backed templates, and opens implemented templates in `code` mode with a `source` toggle for PNG comparison.
- `npm run build` passed after the template reconstruction work on 2026-05-27; Vite still emits the known chunk-size warning.
- Screenshot-to-template coverage check passed after the template work: `screenshots=30 registry=30`.
- Raw color audits passed after the template work: no raw hex under `src/app` outside `colorRegistry.ts`, and no direct numeric `rgb()` / `rgba()` under `src/app` or `src/styles`.
- `git diff --check` passed after the template work; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser smoke verification passed on `http://127.0.0.1:5175`: Design System Inventory -> Templates renders 30 compact cards, 3 code-backed templates, template 52 selected by default in `code` mode at `377 x 814`, code/source toggles are present, the card height is `190px`, thumbnail mode has no focusable nested controls, and selecting template 67 and Product keeps `code` mode with their expected reconstructed text visible.

Latest Products bottom-navigation overlap fix:

- `src/app/screens/products/ProductsScreen.tsx` now gives the Products scroll content a base stacking layer and the Products bottom navigation wrapper an explicit `z-20` layer.
- This prevents Product menu card text/illustrations with internal `z-index` from painting above the bottom navigation while the Products page is scrolled.
- `npm run build` passed after the fix on 2026-05-27; Vite still emits the known chunk-size warning.
- `git diff --check` passed after the fix; Git only reported the normal LF-to-CRLF warning on Windows.
- In-app browser verification passed on `http://localhost:5175`: after navigating to Products and scrolling down, `Investments and savings` no longer overlaps the bottom nav; measured overlap is `0`, the nav background is opaque white, and `elementFromPoint` over the nav resolves to nav elements rather than product-card text.

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
20. Explore Mobile PI Kids as country-specific concept battles, starting with a Romania-only RO Kids prototype that stays close to the current UniCredit design system and covers as many Kid/Parent flows as possible with mock data.

## Blocked By

- Full SME and next-design-system screen implementations remain future product work, but they are no longer hidden leftovers: selecting them now produces an explicit planned-state runtime.
- Mobile PI Kids is implemented only for Romania/current design system. HU, BA, CZ, and other Kids concepts remain future comparison executions before any unified cross-country Kids model is chosen.
- No automated visual regression suite exists yet for safe-area/header/desktop viewport/account-carousel behavior; verification for these bugs was manual browser smoke testing plus production build.

## Next Recommended Action

Continue with product evolution work:

1. Audit and polish the RO Kids main journey: Kids Home -> Ask Money -> Parent Approval -> Money Received.
2. Decide whether the next concept battle should be HU, BA, or CZ Kids, then keep that execution country-contained instead of prematurely unifying the models.
3. Fill SME screen registry entries when actual SME screens are imported or designed.
4. Fill next-design-system screen/component mappings before visual migration.
5. Keep `src/app/registry/templateRegistry.ts` updated whenever new screenshot templates are added to `screenshots/`.
6. Expand AI catalog metadata as new screenshots and components are added.
7. Add automated tests for product/release/design-system switching and the RO Kids core money-request flow.
8. Add visual regression coverage for account-detail sticky header, safe-area behavior, account-card carousel drag/snap, all-products carousel coverage, account-details info screen layout, desktop preview auto-fit behavior, Design System template-card selection, and RO Kids home/approval screens.
9. Replace default Payments placeholder labels with country-specific titles and labels when copy is provided.
10. Fine tune Products labels, imagery, ShopSmart content, and per-country copy once the country-specific source copy and final assets are provided.
11. Fine tune New payment bottom sheet labels per country and implement the remaining Foreign/SEPA and Templates/Beneficiaries flows when those screens are supplied.
12. Add automated coverage for amount visibility persistence across navigation and transaction-row exclusion.
13. Add automated coverage for Account Detail transaction search, clear reset, and activation scroll behavior.
14. Fine tune Transaction Detail and Domestic Payment create/review/sign/success spacing, labels, and per-country copy against final screenshot references.
15. Add an automated color-token audit that fails on raw app hex/rgb/Tailwind palette classes outside approved registry/asset boundaries.
16. Add visual regression coverage for Light/Dark mode across Home, Payments, Products, Analytics, More, and Design System Inventory.

## Commands / Verification

- `npm run build` passed on 2026-05-29 after implementing RO Kids; Vite still emits the known chunk-size warning.
- Dev server started on `http://127.0.0.1:5177` for RO Kids verification.
- In-app browser smoke passed on `http://127.0.0.1:5177`: selected `Mobile PI Kids` + `Romania`, confirmed Kids Home, submitted Ask Money, opened Parent Approval, approved the request, returned to Mia home, and confirmed balance `116 RON available` with no stale waiting banner.
- `git diff --check` passed after the RO Kids code changes; Git only reported the normal LF-to-CRLF warnings on Windows.
- `rg -n "#[0-9A-Fa-f]{3,8}|rgba\\(|rgb\\([0-9]" src/app/screens/kids src/data/roKidsBanking.ts` returned no matches.
- `rg -n "uc-warning|uc-status-green" src/app/screens/kids src/data/roKidsBanking.ts` returned no matches.
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

- Mobile PI Kids is active only for `RO` + `current` design system in this first experiment; other Kids country/design-system contexts continue to use the planned-state placeholder.
- RO Kids is intentionally a contained mock-driven module for concept exploration, not a new global router/product architecture yet.
- The first RO Kids concept excludes loans, child debt, repayment obligations, reward freezing, punishment mechanics, gambling-like rewards, and leaderboards.
- Parent controls in RO Kids use approval and transparency language (`Safety limits`, `Approval needed`, `What my parent can see`) rather than punishment or surveillance language.
- Kids flows update local state only: approving a money request or chore changes the visible balance/activity for the prototype but does not introduce persistence, ledger posting, or backend APIs.
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
- Spending analytics should summarize the same account transaction profiles used by Account Detail, grouped by PFM category and reported in the selected country's local currency.
- PFM category colors are tokenized in `theme.css`; `PfmCategoryIcon` now has real glyphs for Taxes and Penalties, Income, Home, Utilities, Transportation, Children, Healthcare, Shopping, Lifestyle, Education, Leisure time, Investments, Uncategorized, Groceries, Exclude from budget, Insurance, Finance, Wallet, and Transfers, while the remaining categories still use color badges and fallback initials traced to `screenshots/PFM-icons.svg`.
- Demo FX conversion is deterministic and source-dated, not live; the app should not fetch exchange rates at runtime until a real data/API boundary is approved.
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
- Messages is a mock-driven runtime screen reconstructed from template 52; all PI countries are wired through `messagesConfig.ts`, but the current baseline copy/data is intentionally shared until market-specific messages are supplied.
- New payment bottom-sheet action rows and Discover banner live as reusable components under `src/app/components/payments`; country-specific action text remains in `paymentsMenuConfig.ts`.
- Screenshot templates live in `src/app/registry/templateRegistry.ts`; the Design System page consumes that registry so screenshot coverage can be audited separately from the long component inventory JSX.
- Reconstructed templates live in `src/app/components/templates/TemplateCodePreviews.tsx`; `templateRegistry.ts` points implemented screenshot templates at a `codePreviewId`, while the original screenshot remains source/comparison evidence.
- Design System Template cards should stay compact and code-backed templates should open in `code` mode by default; the PNG source toggle exists for comparison, not as the implementation surface.
- Products offer carousel visuals live in `ProductOfferCard`; offer identity and country/product menu membership remain in `productsMenuConfig.ts`.
- Reusable UI icons live in `src/app/components/icons/AppIcon.tsx`; product code should consume icons through `AppIcon` so a registry SVG change propagates to every usage.
- Remaining raw SVGs outside `AppIcon` are treated as brand/logo, device chrome, or decorative effect assets unless explicitly promoted into the icon registry later.
- Products offer carousel behavior lives in `ProductsScreen` for now, matching the Account Detail drag/snap interaction without introducing a broader carousel abstraction yet.
- Products page section and grid spacing should stay on the `16px` rhythm unless a later screenshot-level correction explicitly changes it.
- Reusable DS colors live in `src/app/registry/colorRegistry.ts`; runtime styling consumes `src/styles/theme.css` variables so palette changes propagate through CSS tokens.
- Dark mode is a demo appearance mode, not a separate design-system id; `current` / `next` design-system selection remains about DS generation, while Light/Dark is a theme state within the selected DS.
- Raw colors are allowed in the color registry and source assets/screenshots only; active app styling should use CSS variables or registry-driven values.

## Limitations

- RO Kids data and transitions are local state only; reloading the app resets the concept.
- RO Kids has no real parent consent, legal eligibility checks, activation QR, child device pairing, wallet/card operation, notifications, ledger posting, persistence, backend, or audit trail.
- RO Kids is Romania-only for this execution and uses RON/Romanian assumptions; HU, BA, CZ, and other country Kids concepts are intentionally not implemented yet.
- RO Kids copy is mostly English with light Romanian greeting/context, pending a dedicated localization/content pass.
- `RoKidsApp.tsx` is intentionally broad and contained for the first concept battle; after the winning direction is chosen, split it into smaller screens/components before productionizing.
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
- Spending analytics now derives from transaction profiles, but those profiles are still static mocks and currently deduplicated by reused profile index to avoid counting the same mock profile multiple times across product types.
- PFM category icon glyph extraction is partial: Taxes and Penalties, Income, Home, Utilities, Transportation, Children, Healthcare, Shopping, Lifestyle, Education, Leisure time, Investments, Uncategorized, Groceries, Exclude from budget, Insurance, Finance, Wallet, and Transfers render as real 20x20 SVG glyphs; remaining categories such as Cash, ATM, FX, and Internal still use token-colored initial badges with source traceability to `screenshots/PFM-icons.svg`.
- Exchange rates are a static 2026-05-28 demo reference table, not a live market feed.
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
- Messages uses static mock Inbox/Outbox rows and does not create a backend notification/message domain, unread-count state, message detail screen, or country-specific message copy yet.
- `templateRegistry.ts` is intentionally explicit, so adding or renaming files in `screenshots/` requires updating the registry entry in the same session.
- Reconstructed template coverage is complete: all 30 screenshot templates have real-code previews; source PNG/JPG files remain available only as comparison evidence.
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

safe to resume: yes, 30 reconstructed template-code previews, Messages runtime screen from template 52, Documents and Settings runtime/template wiring from More, compact Design System Templates grid, Products bottom-navigation overlap fix, Design System Colors inventory, Light/Dark appearance switching, app-wide color tokenization, color audits, build verification, browser smoke verification, and prior Payments/Products/Analytics/account-detail/demo-foundation work are complete; remaining work is follow-up screenshot-level fine tuning and automated coverage, not source-only template reconstruction.
