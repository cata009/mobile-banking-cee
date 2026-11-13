# Component Map — quick orientation

Snapshot 2026-07-20, directory-level pointers. The authoritative, always-current list is `src/app/registry/componentRegistry.ts` (component → file path + `usedByScreens`) and the live in-app inventory (`src/app/screens/design-system/`). If this map and the registry disagree, trust the registry.

## Tokens & global styles — `src/styles/`

- `theme.css` — all design tokens as CSS custom properties, light/dark via `[data-uc-theme]`:
  - colors: `--uc-neutral-*`, `--uc-teal-*`, `--uc-red-*`, `--uc-green-*`, `--uc-orange-*`, `--uc-product-*`, plus semantic tokens (`--uc-surface`, `--uc-text`, …)
  - typography: `--uc-type-{h1,h2,l1,l2,l3,p1,p2,n1..n5}-{size,weight}`, consumed via `uc-type-*` utility classes (e.g. `className="uc-type-h1"`)
- `fonts.css` — UniCredit font faces; `tailwind.css` / `index.css` — Tailwind setup

Styling idiom used across the app: Tailwind arbitrary values bound to tokens — `bg-[var(--uc-surface)]`, `text-[var(--uc-text)]`, `border-[var(--uc-green-olive)]`, explicit pixel spacing like `px-[24px]`.

## Shell & chrome — `src/app/components/` (root)

`MobileFrame`, `StatusBar`, `DynamicIsland`, `PageHeader`, `BottomNavigation`, `BottomSheet`, `PanelOverlay`, `SectionHeadingDivider`, `HeaderActionIcons`, `ProfileAvatar`, `UniCreditLogo`

## Forms & inputs (root + `common/`)

`TextField`, `AmountField`, `CodeField`, `ToggleButton`, `PrimaryButton`, `common/RadioButton`, `common/BackButton`, `LanguageSelector`, `AmountVisibilityButton`

## Lists, rows, product blocks (root)

`NavigationRow`, `TotalRow`, `ProductsList`, `ProductCard`, `ProductAccordion`, `ProductAccordionAnimated`, `AccordionSection`

## Domain components — `src/app/components/<domain>/`

- `accounts/` — `AccountBalanceCard`, `AccountActionBar`, `AccountTransactionRow`, `AccountTransactionMonthDivider`, `AccountDetailsInfoField`, `AccountSearchBar`, `AccountCarouselIndicator`, `CopyToast`
- `investments/` — `InvestmentProductCard`, `InvestmentPortfolioChart`, `InvestmentDistributionChart`, `InvestmentDetailField`, `InvestmentFilterChips`, `InvestmentPeriodChips`, `InvestmentPortfolioTabs`, `InvestmentActionBar`, `InvestmentsFundBanner`, `InvestmentProductsAccordion`
- `payments/` — `PaymentHeroCard`, `NewPaymentActionListItem`, `NewPaymentDiscoverBanner`, `PaymentOtherShortcut`
- `cards/` — `Card`, `CardComponent`, `DebitCard`, `InfoBanner`, `GhostBanner`, `HelperCard`, `UserEventCard`, `PendingActionCard`, `NavigationCardArt`
- `products/` — `ProductMenuCard`, `ProductOfferCard`, `ProductCardBottomSheet`
- `flow/` — `StandardSignScreen`, `StandardSuccessScreen`: reusable steps for multi-step flows (sign + success). Use these for any new flow before building custom step screens.
- `icons/` — `AppIcon` + `ICON_INVENTORY` registry (`customIcons` + `lucideIcons`). Add new icons here, not inline in screens.
- also: `messages/`, `pfm/`, `prime/`, `security/`, `shopsmart/`, `brand-logo/`, `templates/` (template screens/flows/primitives), `demo/`, `figma/ImageWithFallback`

## Primitives — `src/app/components/ui/`

The shadcn/ui set (`button`, `card`, `dialog`, `drawer`, `sheet`, `tabs`, `select`, `accordion`, …) plus custom primitives: `LinkButton`, `Pill`, `PillSorting`, `NavigationLink`, `ToastMessage`, `Bar`, `ChevronIcon`, `DateFilter`, `WalletButton`, `PreLoginHeading`.
Screens mostly compose the banking components above; reach for raw shadcn primitives only when no banking component covers the need.

## Screens — `src/app/screens/<domain>/`

`home`, `accounts`, `payments`, `investments`, `cards`, `products`, `messages`, `analytics`, `contacts`, `documents`, `settings`, `more` (cards, tutorials), `prime`, `kids` (hu/sk/shared), `flow-library`, `design-system` (live inventory: specimens, inventories, inspect)

## Registries — `src/app/registry/`

`componentRegistry.ts` (authoritative component catalog), `screenRegistry.ts`, `flowRegistry.ts`, `templateRegistry.ts`, `colorRegistry.ts`, `typographyRegistry.ts`, `aiCatalog.ts` (aggregated AI export), `countryConfig.ts`, `languageByCountry.ts`

## Data, config, translations

- `src/data/` — demo data (accounts, products, payments, pfm, analytics, …)
- `src/app/config/` — per-feature config (`productConfig`, `paymentsMenuConfig`, `investmentsPortfolioConfig`, …)
- `src/translations/` — `types.ts` (key interfaces), `shared.ts` (shared runtime strings with per-language overrides), per-country folders `BA/ CZ/ HU/ RO/ RS/ SI/ SK/` (local language + en)

## Docs worth opening when relevant

- `docs/design-system/component-implementation-handoff/components-handoff.md` — exact visual contracts, per-component deep dives, high-risk failure patterns
- `docs/design-system/platform-icons-svg-catalog.md` — icon SVG catalog
- `guidelines.md` — mandatory translation workflow and dev rules
- `agents.md` — repo AI operating contract (handoff docs to read at session start)

## Baseline geometry

375px phone width; content cards 327px/343px; 16px page inset rhythm; screens render inside `MobileFrame`.
