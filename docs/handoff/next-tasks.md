# Next Tasks

Status legend: `todo` / `in_progress` / `done` / `blocked`

## Active

| Status | Task | Evidence / Notes |
| --- | --- | --- |
| done | Install AI Contributor Operating System docs | `agents.md`, `docs/handoff/*` |
| done | Add project architecture model | `docs/architecture/PROJECT_MODEL.md` |
| done | Add typed taxonomy and registries | `src/app/registry/projectModel.ts`, `screenRegistry.ts`, `flowRegistry.ts`, `releaseRegistry.ts` |
| done | Run verification | `npm run build` passed on 2026-05-27; browser smoke passed on fresh dev server `5175`; typecheck is blocked by missing local TypeScript CLI |

## Upcoming

| Status | Task | Evidence / Notes |
| --- | --- | --- |
| done | Refactor visible topbar wording from `Version` to `Release` | Runtime state now uses explicit `release` |
| done | Wire `releaseRegistry` into the control panel | `DemoTopBar` and `DemoFeatureSidePanel` use release metadata |
| done | Add product selector for `PI` / `SME` | SME is selectable and renders planned-state placeholder |
| done | Add design-system selector for `current` / `next` | Next DS is selectable and renders planned-state placeholder |
| done | Build initial control panel view for feature lifecycle and coverage | Shows lifecycle/coverage badges from feature metadata |
| done | Add screen/component catalog export for AI training and larger-platform integration | `componentRegistry.ts` and `aiCatalog.ts` |
| done | Update platform capability map after runtime architecture changes | Updated release/control-panel wording |
| done | Add Payments menu for all countries | `PaymentsScreen`, `paymentsMenuConfig`, navigation, screen/component/flow registry entries |
| done | Add Products menu for all countries | `ProductsScreen`, `productsMenuConfig`, navigation, screen/component/flow registry entries; ShopSmart tabs enabled for RO/CZ/SK/HU only |
| done | Add Analytics / My Spendings tab | `AnalyticsScreen`, navigation wiring, screen/component/flow registry entries; reused shared header actions, New payment banner, Account Detail divider, and AccountTransactionRow; build and in-app browser computed-style smoke passed on `5175` |
| done | Add New payment bottom sheet for all countries | `BottomSheet`, `PaymentsScreen`, `paymentsMenuConfig`; verified on `5175`, including CZ domestic subtitle |
| done | Componentize and fix Products menu cards | `ProductMenuCard` is shared by the core product cards; verified `164x120`, `16px` padding, `10px` gap, and `18px` bold white labels on `5175` |
| done | Add homepage hide/show amounts | Global `amountsHidden` state masks account/card/product balances across navigation; transaction amounts remain visible; verified hide/show on `5175` |
| done | Add Account Detail transaction search | `AccountSearchBar` is interactive, filters current-account transactions, swaps Filters for the supplied clear-results icon, and scrolls to the sticky search position on activation; verified on `5175` |
| done | Add Transaction Detail and Domestic payment flow | Transaction rows open Transaction Detail; `Redo payment` prefills Domestic payment; Payments/New payment/Domestic opens a blank form; create/review/sign/success flow is registered and build-verified |
| done | Add Design System Inventory Templates tab | `templateRegistry.ts` represents all 30 files in `screenshots/`; `DesignSystemPage` renders selectable template cards and a selected-preview panel; build and in-app browser smoke passed on `5175` |
| done | Componentize and fix Products offer cards | `ProductOfferCard` renders the Products offer carousel card at `327x157`, with a `206px` text stack, `8px` gap, `24px` bold title, and `16px` regular subtitle; build and in-app browser computed-style verification passed on `5175` |
| done | Add centralized AppIcon registry and Design System Icons tab | `AppIcon.tsx` is the single reusable UI icon repository; app icon consumers were routed through `AppIcon`; `DesignSystemPage` renders the `Icons` tab with 84 mapped icon cards and audit boundaries; build and in-app browser smoke passed on `5175` |
| done | Fix Products offer carousel drag/snap and Products spacing | Offers carousel now supports Account Detail-style drag/snap; Products page spacing measured at `16px` for tab/offers/carousel/products/grid gaps; build and in-app browser smoke passed on `5175` |
| done | Add Design System Colors tab and Light/Dark appearance mode | `colorRegistry.ts` maps `screenshots/Colors.svg` into DS palettes and app color audit entries; `theme.css`, `demoStore`, `DemoTopBar`, `DemoFeatureSidePanel`, and `DesignSystemPage` implement color inventory, copy feedback, and Light/Dark switching; build, browser smoke, raw hex/rgb, and Tailwind palette audits passed on `5175` |

## Future Product Work

| Status | Task | Evidence / Notes |
| --- | --- | --- |
| todo | Import or build actual SME screens | Selector exists; runtime placeholder prevents false coverage |
| todo | Implement actual next design-system screens/components | Selector exists; runtime placeholder prevents false coverage |
| todo | Add tests for product/release/design-system switching | Build passes, but no automated UI tests yet |
| todo | Add visual regression coverage for account-detail safe-area, title-card spacing, sticky search, account-card metadata/spacing, account carousel edge-peek/drag/snap, all-products carousel coverage, account-details info screen layout, and desktop preview auto-fit behavior | Manual browser verification caught the Dynamic Island overlap regression, page-level scroll regression, account-card metadata/spacing regression, sticky-search spacing regression, account-card carousel gutter/drag/edge-peek regression, all-products account carousel coverage, and Account Details info navigation; no automated guard exists yet |
| todo | Replace shared Payments placeholder labels with country-specific copy | Current Payments config is country-scoped but all countries intentionally reuse the same baseline English labels |
| todo | Fine tune Products copy, imagery, ShopSmart content, and per-country labels | Current Products config is country-scoped and the core card component contract is fixed; copy/assets are still shared placeholders |
| todo | Fine tune Analytics chart spacing and real data behavior | Current Analytics screen is screenshot-inspired and mock-driven; shared components and typography contracts are wired, but chart data/interaction and exact visual spacing still need final tuning |
| todo | Fine tune Domestic payment flow screens | Mock flow exists from both New payment and Redo payment, but needs screenshot-level copy/spacing/country refinements |
| todo | Implement remaining New payment action flows | Domestic is implemented as a mock flow; Foreign/SEPA and Templates/Beneficiaries remain placeholders until target screens are supplied |
| todo | Add automated tests for hide/show amounts | Build and Chrome smoke passed; no automated regression test exists yet for account/card masking and transaction exclusion |
| todo | Add automated tests for Account Detail transaction search | Build and in-app browser smoke passed; no automated regression test exists yet for search filtering, clear reset, and activation scroll |
| todo | Add automated tests for Transaction Detail and Domestic payment navigation | Build and in-app browser smoke passed; no automated regression test exists yet for New payment -> Domestic and Transaction Detail -> Redo payment paths |
| todo | Add automated tests for Design System template coverage and selection | Build, folder/registry comparison, and in-app browser smoke passed; no automated regression test exists yet for `screenshots/` coverage or template-card selection |
| todo | Add automated visual/style coverage for Products offer cards | Build and in-app browser smoke passed; no automated regression test exists yet for the `327x157` offer-card contract, Products `16px` spacing rhythm, or offer carousel drag/snap behavior |
| todo | Add automated icon registry audit | Build and in-app browser smoke passed; no automated regression test exists yet to fail when a reusable app icon is added as raw inline SVG instead of through `AppIcon` |
| todo | Add automated color-token audit | Manual `rg` audits passed, but no automated regression test fails if raw app hex/rgb/Tailwind palette classes are reintroduced outside `colorRegistry.ts` / asset boundaries |
| todo | Add dark-mode visual regression coverage | Light/Dark browser smoke passed for the Colors inventory and theme root vars, but no visual regression suite covers every screen in both themes yet |
