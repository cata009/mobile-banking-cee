# Mobile Banking CEE Component Implementation Handoff

Last updated: 2026-06-29

This document exists so a future Codex session can recreate the local Mobile Banking CEE component system without going back through Figma. It is intentionally specific. When a value is listed here, treat it as a contract, not a suggestion.

## Scope

Included: all Design System Inventory component families and registry components except the explicit exclusions below.

Excluded by request:

- Status Bar
- Floating Co-Apping
- Button registry variants
- Generic UI controls
- Home content modules
- Logout confirmation dialog

## Source Of Truth Order

1. Real component source files in `src/app/components/**`.
2. Demo specimens in `src/app/screens/design-system/DesignSystemPage.tsx`.
3. Component metadata in `src/app/registry/componentRegistry.ts`.
4. Type IDs in `src/app/state/demoTypes.ts`.
5. Config/data files referenced by the component, for example `src/app/config/productsMenuConfig.ts`.

Do not use screenshot eyeballing as the first source. Screenshots are useful only after the component contract is already implemented.

## Global Implementation Rules

- Phone canvas is generally `375px` wide.
- Standard page content inset is `16px`.
- Common card widths:
  - `327px` = 375 - 24 - 24 or historical Figma card width.
  - `343px` = 375 - 16 - 16.
  - `311px` = account carousel card width.
- Use CSS variables, not hardcoded colors, unless the component source already hardcodes a Figma extraction value.
- Use `AppIcon` from `src/app/components/icons/AppIcon.tsx` for platform icons.
- Use UniCredit typography utility classes already defined by the app: `uc-type-n1`, `uc-type-n2`, `uc-type-n2-strong`, `uc-type-n4`, `uc-type-n4-strong`, `uc-type-n5`, `uc-type-n5-strong`, `uc-type-h1`, `uc-type-h2`, `uc-type-p1`, `uc-type-p2`, `uc-type-l1`.
- Interactive components must keep focus-visible rings and accessible labels where the source component has them.
- Do not invent new radii/shadows/gaps for a component that already has a local component file.

## Copy Dependencies Checklist

When moving components to another project, copy or recreate these foundations first:

- `src/app/components/icons/AppIcon.tsx` and `src/app/components/icons/index.ts`
- `src/app/components/ui/utils.ts`
- typography/font CSS from `src/styles/fonts.css`
- design tokens from the global CSS files that define `--uc-*` and `--pi-*`
- any image imports referenced by product cards and banners, especially assets under `screenshots/` and `figma:asset/...`
- data types from `src/app/state/demoTypes.ts` when registry IDs are reused

## Registry Map

The local component registry currently documents these included component IDs and implementation paths:

| Component ID | Label | Source |
| --- | --- | --- |
| `shell.mobile-frame` | Mobile frame | `src/app/components/MobileFrame.tsx` |
| `shell.page-header` | Page header | `src/app/components/PageHeader.tsx` |
| `shell.bottom-navigation` | Bottom navigation | `src/app/components/BottomNavigation.tsx` |
| `shell.bottom-sheet` | Bottom sheet shell | `src/app/components/BottomSheet.tsx` |
| `icons.app-icon` | App icon registry | `src/app/components/icons/AppIcon.tsx` |
| `brand.unicredit-logo` | UniCredit logo | `src/app/components/UniCreditLogo.tsx` |
| `ui.primary-button` | Primary button | `src/app/components/PrimaryButton.tsx` |
| `ui.text-field` | Text field | `src/app/components/TextField.tsx` |
| `ui.amount-field` | Amount field | `src/app/components/AmountField.tsx` |
| `ui.link-button` | Link button | `src/app/components/ui/LinkButton.tsx` |
| `ui.pill` | Pill | `src/app/components/ui/Pill.tsx` |
| `ui.wallet-button` | Wallet buttons | `src/app/components/ui/WalletButton.tsx` |
| `ui.bar` | Bar | `src/app/components/ui/Bar.tsx` |
| `ui.date-filter` | Date filter | `src/app/components/ui/DateFilter.tsx` |
| `ui.pill-sorting` | Pill sorting | `src/app/components/ui/PillSorting.tsx` |
| `ui.code-field` | Code field | `src/app/components/CodeField.tsx` |
| `ui.toast-message` | Toast message | `src/app/components/ui/ToastMessage.tsx` |
| `ui.profile-avatar` | Profile avatar | `src/app/components/ProfileAvatar.tsx` |
| `ui.navigation-row` | Navigation row | `src/app/components/NavigationRow.tsx` |
| `ui.toggle-button` | Toggle button | `src/app/components/ToggleButton.tsx` |
| `ui.radio-button` | Radio button | `src/app/components/common/RadioButton.tsx` |
| `ui.section-heading-divider` | Divider | `src/app/components/SectionHeadingDivider.tsx` |
| `prelogin.inactive` | Pre-login inactive composition | `src/app/components/PreLoginScreen.tsx` |
| `prelogin.active` | Pre-login active composition | `src/app/components/PreLoginActiveScreen.tsx` |
| `prelogin.language-selector` | Language selector | `src/app/components/LanguageSelector.tsx` |
| `prelogin.other-panel` | Other panel menu | `src/app/components/PanelWithTranslations.tsx` |
| `co-apping.session-entry` | Co-Apping session entry | `src/app/components/CoAppingSessionScreen.tsx` |
| `home.amount-visibility-toggle` | Amount visibility toggle | `src/app/components/AmountVisibilityButton.tsx` |
| `home.account-balance-card` | Account balance card | `src/app/components/accounts/AccountBalanceCard.tsx` |
| `analytics.spendings` | Analytics spendings overview | `src/app/screens/analytics/AnalyticsScreen.tsx` |
| `pfm.category-icon` | PFM category icon | `src/app/components/pfm/PfmCategoryIcon.tsx` |
| `messages.mailbox-tabs` | Messages mailbox tabs | `src/app/components/messages/MessagesMailboxTabs.tsx` |
| `messages.inbox-list` | Messages inbox and outbox list | `src/app/screens/messages/MessagesScreen.tsx` |
| `accounts.action-bar` | Account action bar | `src/app/components/accounts/AccountActionBar.tsx` |
| `accounts.details-info` | Account details information screen | `src/app/screens/accounts/AccountDetailsInfoScreen.tsx` |
| `accounts.details-info-field` | Account details info field | `src/app/components/accounts/AccountDetailsInfoField.tsx` |
| `accounts.transaction-search` | Account transaction search | `src/app/components/accounts/AccountSearchBar.tsx` |
| `accounts.transaction-row` | Account transaction row | `src/app/components/accounts/AccountTransactionRow.tsx` |
| `transactions.detail` | Transaction detail screen | `src/app/screens/payments/DomesticPaymentFlowScreens.tsx` |
| `payments.menu` | Payments menu | `src/app/screens/payments/PaymentsScreen.tsx` |
| `payments.hero-card` | Payments hero card | `src/app/components/payments/PaymentHeroCard.tsx` |
| `payments.other-shortcut` | Payments Other shortcut | `src/app/components/payments/PaymentOtherShortcut.tsx` |
| `payments.other-shortcut-icon-bubble` | Payments Other shortcut icon bubble | `src/app/components/payments/PaymentOtherShortcut.tsx` |
| `payments.new-payment-sheet` | New payment bottom sheet | `src/app/screens/payments/PaymentsScreen.tsx` |
| `payments.new-payment-action` | New payment action row | `src/app/components/payments/NewPaymentActionListItem.tsx` |
| `payments.new-payment-discover-banner` | New payment discover banner | `src/app/components/payments/NewPaymentDiscoverBanner.tsx` |
| `payments.domestic-flow` | Domestic payment flow | `src/app/screens/payments/DomesticPaymentFlowScreens.tsx` |
| `investments.portfolio-tabs` | Investments portfolio tabs | `src/app/components/investments/InvestmentPortfolioTabs.tsx` |
| `investments.portfolio-chart` | Investments portfolio chart | `src/app/components/investments/InvestmentPortfolioChart.tsx` |
| `investments.distribution-chart` | Investments distribution chart | `src/app/components/investments/InvestmentDistributionChart.tsx` |
| `investments.period-chips` | Investments period chips | `src/app/components/investments/InvestmentPeriodChips.tsx` |
| `investments.action-bar` | Investments action bar | `src/app/components/investments/InvestmentActionBar.tsx` |
| `investments.filter-chips` | Investments filter chips | `src/app/components/investments/InvestmentFilterChips.tsx` |
| `investments.products-accordion` | Investments products accordion | `src/app/components/investments/InvestmentProductsAccordion.tsx` |
| `investments.product-card` | Investment product card | `src/app/components/investments/InvestmentProductCard.tsx` |
| `investments.fund-banner` | Investments fund suggestion banner | `src/app/components/investments/InvestmentsFundBanner.tsx` |
| `templates.reconstructed-code` | Reconstructed code templates | `src/app/components/templates/TemplateCodePreviews.tsx` |
| `products.menu` | Products menu | `src/app/screens/products/ProductsScreen.tsx` |
| `products.offer-card` | Products offer card | `src/app/components/products/ProductOfferCard.tsx` |
| `products.product-card` | Products menu card | `src/app/components/products/ProductMenuCard.tsx` |
| `products.product-card-list-total` | Product card / list / total row - evolution | `src/app/components/ProductCard.tsx + src/app/components/ProductsList.tsx + src/app/components/TotalRow.tsx` |
| `cards.card` | Card | `src/app/components/cards/Card.tsx` |
| `cards.ghost-banner` | Ghost Banner | `src/app/components/cards/GhostBanner.tsx` |
| `cards.info-banner` | Info Banner | `src/app/components/cards/InfoBanner.tsx` |
| `cards.user-event-card` | User Event Card | `src/app/components/cards/UserEventCard.tsx` |
| `cards.helper-card` | Helper Card | `src/app/components/cards/HelperCard.tsx` |
| `cards.pending-action-card` | Pending Action Card | `src/app/components/cards/PendingActionCard.tsx` |
| `cards.card-component` | Card Component | `src/app/components/cards/CardComponent.tsx` |
| `more.card-grid` | More service card grid | `src/app/screens/more/MoreScreen.tsx` |
| `contacts.navigation-card` | Contacts navigation card | `src/app/screens/contacts/ContactsNavigationCard.tsx` |
| `prime.advisor-tab` | Prime advisor tab | `src/app/screens/prime/YourAdvisorTab.tsx` |
| `prime.benefits-tab` | Prime benefits tab | `src/app/screens/prime/YourBenefitsTab.tsx` |
| `kids.ro-prototype` | RO Kids prototype module | `src/app/screens/kids/RoKidsApp.tsx` |
| `kids.market-home-concepts` | Kids market homepage concepts | `src/app/screens/kids/KidsMarketHomeApp.tsx` |

## Deep Dive: Products Offer Card

Source files:

- `src/app/components/products/ProductOfferCard.tsx`
- `src/app/config/productBannerVariants.ts`
- `src/app/config/productsMenuConfig.ts`

Why this component often fails visually: it is not a generic promo card. It is a fixed 327x157 banner with a two-layer color treatment, a fixed 100px image strip, and a chevron-shaped SVG background that sits behind the text.

Contract:

- Root is a `button`.
- Size: `w-[327px]`, `h-[157px]`, `shrink-0`.
- Radius: `8px`.
- Overflow: hidden.
- Text alignment: left.
- Background color comes from `getProductBannerTone(colorFamily, lightVersion)`.
- Right image: absolute, `right-0 top-0 h-full w-[100px] object-cover object-center`.
- Chevron SVG: absolute, `left-[-14px] top-1/2 h-[157px] w-[161px] -translate-y-1/2`.
- Text wrapper: `pl-[20px] pr-[116px]`, vertically centered.
- Text-to-image gutter is therefore 16px: right padding 116px = 100px image + 16px gap.
- Inner text stack gap: `8px`.
- Title: 22px bold UniCredit, normal line-height, max 2 lines, preserves newlines.
- Description: `uc-type-p1`, max 3 lines, preserves newlines.
- Variants are not arbitrary colors: `green`, `yellow`, `orange`, `pink`, `red`, `blue`, `grey`, each with `normal` and `light`.

Authoritative tone source:

```ts
export type ProductBannerColorFamily =
  | "green"
  | "yellow"
  | "orange"
  | "pink"
  | "red"
  | "blue"
  | "grey";

export function getProductBannerTone(
  family: ProductBannerColorFamily,
  lightVersion: boolean,
): ProductBannerTone
```

Copy pattern:

```tsx
<ProductOfferCard
  offer={{
    id: "offer-1",
    title: "Premium current\naccount offer",
    description: "Enjoy zero monthly fee\nand smart everyday\nbanking benefits.",
    colorFamily: "green",
    lightVersion: false,
  }}
  colorFamily="green"
  lightVersion={false}
/>
```

Common mistakes to avoid:

- Do not make the card responsive wider unless the design specifically asks; this component is fixed at 327px.
- Do not move the image into normal flex layout; it must be absolute and 100px wide.
- Do not remove the chevron SVG; the card loses the original Figma identity.
- Do not use generic theme text colors. Use `tone.textColor`, because yellow/pink/grey light variants need static black while green/red/orange/blue variants need static white.

## Deep Dive: AccountBalanceCard / All Countries

Source files:

- `src/app/components/accounts/AccountBalanceCard.tsx`
- `src/app/screens/accounts/AccountDetailScreen.tsx`
- `src/data/accountDetails.ts`

Contract:

- Root is a `div`; it becomes keyboard/click accessible only when `onClick` is supplied.
- Size: `w-[311px]`, `h-[197px]`.
- Layout: vertical flex, `items-start`, `gap-[16px]`.
- Radius: `6px`.
- Surface: `bg-[var(--uc-surface)]`.
- Padding: `16px`.
- Shadow:

```css
0 16px 32px rgb(var(--uc-shadow-rgb) / 0.08),
0 3px 10px rgb(var(--uc-shadow-rgb) / 0.05)
```

- Title: `uc-type-n2-strong`, action color, effectively 20px.
- IBAN row: top margin 8px, height 32px, copy icon slot 32x32.
- IBAN text: `uc-type-n4-strong`, max width 235px, truncated, muted.
- Optional sub-account row: `uc-type-n5-strong`, muted label plus default text value.
- Balance block height: 80px, gap 8px.
- Available label: `uc-type-n5-strong`, muted.
- Available amount: integer `uc-type-n1`, decimals/currency `uc-type-n2`.
- Divider: `w-[279px]`, `h-[1px]`, `bg-[var(--uc-border)]`.
- Current balance row: horizontal flex with `gap-[4px]`.

Copy pattern:

```tsx
<AccountBalanceCard
  account={{
    accountName: "Current Account",
    accountNumber: "RO20BACX0000000010351312",
    subAccount: undefined,
  }}
  availableInteger="25.902"
  availableDecimals=",92"
  currency="RON"
  currentBalance="23.902,92"
  showSubAccount={false}
/>
```

Common mistakes to avoid:

- Do not stretch this to 327px. The carousel card is 311px.
- Do not replace the shadow with generic `shadow-sm`; it loses the soft layered look.
- Do not merge integer and decimals into one text style. Integer and decimals intentionally use different typography.
- Do not remove the 4px gap in the current balance line.
- Do not use hardcoded blue/teal for the title; use `var(--uc-action)`.

## Product Menu Card

Source files:

- `src/app/components/products/ProductMenuCard.tsx`
- `src/app/config/productsMenuConfig.ts`

Contract:

- Root is a `button`.
- Width: `164px`.
- Standard height: `120px`.
- Compact height: `72px`.
- Radius: `8px`.
- Standard padding: `16px`; compact padding: `12px`.
- Title uses `uc-type-h2` for standard, `uc-type-n4-strong` for compact.
- Card background is config-driven through `ProductsCard.background`.
- Text color defaults to `var(--uc-text-inverse)` but can be themed by `--pi-product-card-fg`.
- Image placement is per card ID. Do not use a single generic image class for all product cards.

Common mistakes:

- Using one image placement for all product cards.
- Replacing config backgrounds with one theme color.
- Letting title text wrap unpredictably instead of preserving intentional `\n` line breaks.

## AccountActionBar

Source: `src/app/components/accounts/AccountActionBar.tsx`

Contract:

- Container padding: `px-[16px] py-[8px]`.
- Supports 1 to 4 items.
- Alignment modes: `start`, `center`, `end`, `between`.
- In `between`, each item is `min-w-0 flex-1`; otherwise each item is `w-[82px]`.
- Item vertical gap: `4px`.
- Icon slot: `32x32`.
- Label: `uc-type-p2`, centered, line-height `15px`, preserves newlines.
- Uses `AppIcon` names from the registry.

## LinkButton

Source: `src/app/components/ui/LinkButton.tsx`

Contract:

- `flex w-fit items-center justify-center`.
- Text-chevron gap is `0`.
- Label is 13px bold uppercase, `line-height: 16px`, no letter spacing.
- Default icon is `chevron-link`, size 24.
- Color is `var(--uc-action)`.
- Used for "SEE MORE..." style buttons. If the text and chevron are visually too far apart, check this component first.

## PageHeader

Source: `src/app/components/PageHeader.tsx`

Contract:

- Sticky top header with 48px control row.
- Grid columns: `40px 1fr 40px`.
- Back/right buttons are `40x40` with internal padding around 8px.
- Supports `collapsedTitleProgress` from 0 to 1.
- Compact title fades/slides in as progress increases.
- Large title fades out as progress increases.
- Variants: `light`, `dark`, `transparent`, `gray`.
- Use this for pages that need standard scroll-collapse behavior. Do not hand-roll a header if `PageHeader` can be used.

## NavigationRow

Source: `src/app/components/NavigationRow.tsx`

Contract:

- Width: full row, usually inside 375px screen.
- Heights: 64px or 80px.
- Main gap: 16px.
- Leading icon/visual: 32px slot unless special visual is supplied.
- Title: `uc-type-n4-strong`.
- Description: `uc-type-n4`, margin-top 4px.
- Link label: `uc-type-n5-strong`, action color, margin-top 4px.
- Trailing: none, chevron, toggle, or custom.
- Rows with leading icon use left padding 16px and right padding 12px.
- Rows without leading icon use left padding 24px and right padding 12px.
- Centered special rows use 24px horizontal padding.

Mapped Meniga source group: `1515:1995` with 18 cases. Keep one component family; do not split these cases into unrelated row components.

## Divider / SectionHeadingDivider

Source: `src/app/components/SectionHeadingDivider.tsx`

Contract:

- Shared divider family that keeps legacy runtime section usage and exposes Meniga divider states.
- Source Meniga node: `1058:22303`.
- States include small/medium/large title, title+data, counter, action/date, name/action, checkbox action/date, and Light Restyle variants.
- Use the explicit variant props/states in the source component instead of restyling ad hoc text rows.

## Account Rows And Account Detail Helpers

Sources:

- `src/app/components/accounts/AccountTransactionRow.tsx`
- `src/app/components/accounts/AccountTransactionMonthDivider.tsx`
- `src/app/components/accounts/AccountSearchBar.tsx`
- `src/app/components/accounts/AccountDetailsInfoField.tsx`
- `src/app/components/accounts/AccountCarouselIndicator.tsx`

Transaction row contract:

- Root button: `375x80`.
- Padding: `20px 16px`.
- Date block: day `uc-type-h2` with 20px line, month `uc-type-n5-strong` with 15px line, 2px gap.
- Date-to-icon gap: 16px.
- Icon box: 32px and uses `PfmCategoryIcon`.
- Right detail column: width 247px, align end, gap 4px.
- Label: `uc-type-n4`, 18px line.
- Amount: integer `uc-type-n2-strong`, decimals/currency `uc-type-n5`.
- Credit color: `var(--uc-action)`. Debit/default color: `var(--uc-text)`.

Search bar contract:

- Implement through `AccountSearchBar`, including active/remove-filters variant.
- Do not recreate the search/filter row manually for account/investment history screens.

Details info field:

- Height 80px.
- Title 16px regular.
- Subtitle 16px bold.
- Title-to-subtitle gap 4px.

## Card Primitives

Sources under `src/app/components/cards/`.

### GhostBanner

- Width 327px, height around 92px in Figma base.
- Dashed 1px border using `var(--uc-text)`.
- Radius 8px.
- Padding 16px.
- Leading icon box 32px.
- Icon-to-text gap 8px.
- Title `uc-type-h2`, 20px line.
- Description `uc-type-n4`, 18px line.
- Renders as `button` when `onClick` exists.

### InfoBanner

- Width 327px, height around 153px in Figma base.
- Solid 1px border using `var(--uc-text)`.
- Radius 8px.
- Padding 16px.
- Icon box 32px.
- Text stack gap 8px.
- Title-description gap 4px.
- Optional action is a 14px bold teal text action.

### UserEventCard

- Width 343px.
- White surface.
- Radius 8px.
- Shadow `0 4px 16px rgba(0,0,0,0.08)`.
- Padding 16px.
- Avatar 48x48 teal circle with white 24px glyph.
- Avatar-to-text gap 8px.
- Title and description are 14px, title bold.
- Optional action label and optional 32px overflow control.

### HelperCard

- Width 343px.
- Solid `var(--uc-action)` surface.
- Radius 4px.
- Padding 16px.
- Icon box 32px.
- Title 18px bold white.
- Description 18px regular white.
- Optional white action link and close control.

### PendingActionCard

- Width 327px, height 157px.
- Radius 8px.
- Padding 24px.
- Background `linear-gradient(90deg, #007A91 0%, #44909E 100%)`.
- Title 24px bold white.
- Body 18px regular white.
- Optional white tag pill with teal warning icon and 12px uppercase label.

### Card / CardComponent

- `cards.card` is the official payment-card artwork family. It maps Meniga Mastercard card references into one selector-driven `Card` component with debit, credit, and virtual color variants.
- `src/app/components/cards/DebitCard.tsx` remains only as a compatibility alias for older imports.
- Do not replace the card family with PNG screenshots; keep it as reusable SVG/vector artwork and extend the `CARD_VARIANTS` registry when new card designs are approved.
- The card edge is a single outer container mask. Keep the SVG at `preserveAspectRatio="none"`, avoid internal `clipPath` card masks, and keep the card background/gradient on the outer container so scaled slots such as `219x138` do not reveal white corners or letterbox gaps.

## Payments Components

Sources:

- `src/app/screens/payments/PaymentsScreen.tsx`
- `src/app/components/payments/PaymentHeroCard.tsx`
- `src/app/components/payments/PaymentOtherShortcut.tsx`
- `src/app/components/payments/NewPaymentActionListItem.tsx`
- `src/app/components/payments/NewPaymentDiscoverBanner.tsx`
- `src/app/screens/payments/DomesticPaymentFlowScreens.tsx`

Contracts:

- Payments hero card: 327x120, 8px radius, 24px title, 14px description, screenshot-backed image variants.
- Other shortcut icon bubble: keep the normalized atom; bubble and icon sizes must be read from `PaymentOtherShortcut.tsx`.
- New payment action rows: 80px rows with action icon, title, subtitle, and chevron.
- New payment sheet uses shared `BottomSheet`.
- Domestic flow reuses shared primitives: PageHeader, AccountActionBar, TextField/AmountField, PrimaryButton.

Important: if a payments item opens a modal panel, prefer `BottomSheet` instead of custom fixed panels.

## Investments Components

Sources:

- `src/app/components/investments/InvestmentPortfolioTabs.tsx`
- `src/app/components/investments/InvestmentPortfolioChart.tsx`
- `src/app/components/investments/InvestmentDistributionChart.tsx`
- `src/app/components/investments/InvestmentPeriodChips.tsx`
- `src/app/components/investments/InvestmentActionBar.tsx`
- `src/app/components/investments/InvestmentFilterChips.tsx`
- `src/app/components/investments/InvestmentProductsAccordion.tsx`
- `src/app/components/investments/InvestmentProductCard.tsx`
- `src/app/components/investments/InvestmentsFundBanner.tsx`

Current important contracts:

- Investment product rows use Figma-aligned 95px row height direction, 16px top/left/bottom padding and 24px right padding, 4px vertical text rhythm.
- Positive performance color is `#3D7D43`.
- Negative performance color is `#E2001A`.
- Distribution chart uses an SVG donut with external labels and guide lines; it is not the older center-label donut.
- Fund banner is full-width inside the 16px container inset, height 157px, `#F5F5F5` surface, right-side plant image, 24px title, 18px description, 14px CTA, CTA icon gap 4px.
- Investment action bar should appear only where the tab/flow requires it; do not leak it into distribution tabs unless explicitly requested.

## Meniga UI Primitives

Sources:

- `src/app/components/CodeField.tsx`
- `src/app/components/ui/Pill.tsx`
- `src/app/components/ui/WalletButton.tsx`
- `src/app/components/ui/Bar.tsx`
- `src/app/components/ui/DateFilter.tsx`
- `src/app/components/ui/PillSorting.tsx`
- `src/app/components/ui/ToastMessage.tsx`

Contracts:

- CodeField: 327px wrapper, centered 224px slot row, four 44x64 slots, 16px gap, 8px radius, 1px neutral/error border, 30px bold digits.
- Pill: 120x36, 18px radius, 8px horizontal padding, 14px bold label, 16px icons, 8px icon-label gap.
- WalletButton: 48px height, supports Google Wallet, Apple Wallet, Click to Pay, condensed and long sizes.
- Bar: 375x8 states plus 279x1 thin state.
- DateFilter: 238x24 wrapper, 4 or 5 chips, 35x22 chips, 15px gaps.
- PillSorting: 375x40 rail, 8px gap, 24px chip height, selected black chip with bold white label.
- ToastMessage: message capsule, 16px radius, 14px bold text, 327x32 icon variants or 174x35 Google Pay hug variant.

## Shell And Composition Components

Use these to compose screens:

- `MobileFrame` for phone shell.
- `PageHeader` for back/title/help/action pages.
- `BottomNavigation` for tabbed PI screens.
- `BottomSheet` for modal action/details sheets.
- `MessagesMailboxTabs` for two-tab content areas and investment tab wrapper.
- `NavigationRow` for settings/contact/list navigation rows.
- `PrimaryButton`, `TextField`, `AmountField`, `CodeField` for form flows.

Composition rule: build screens from these primitives before adding new one-off layout code.

## Design System Inventory Page

Source: `src/app/screens/design-system/DesignSystemPage.tsx`

This page is the visual catalog. It contains specimen wrappers and variant selectors. If a component looks wrong in another project, compare it against the specimen block in this file.

Important specimen names included in this package:

- PageHeader
- BottomNavigation / all active states
- LanguageSelectorButton
- NavigationLink
- Prelogin
- RadioButton
- Primary button
- Link button
- Pill
- Dropdown
- Text field
- Code field
- Products offer card
- Products menu card
- AccountBalanceCard / all countries
- AccountActionBar
- Ghost Banner
- Info Banner
- User Event Card
- Helper Card
- Pending Action Card
- Card
- Card Component
- Carousel Indicator
- AccountDetailsInfoField
- MessagesMailboxTabs
- AccountTransactionRow
- Payments hero card
- More cards / all concrete card components
- Contacts navigation cards / all icons
- ProductAccordion / all countries
- ProductAccordionAnimated / all countries
- PanelWithTranslations
- PanelWithoutCoAppingTranslations

Excluded specimen names are intentionally omitted from implementation guidance.

## Accessibility Rules

- Use `button` for clickable cards when the source component uses a button.
- If a static `div` becomes clickable, add `role="button"`, `tabIndex={0}`, and Enter/Space keyboard handling, like `AccountBalanceCard`.
- Decorative images must have `alt=""`.
- Icon-only buttons need `aria-label`.
- Preserve focus-visible ring styles from source.
- Do not hide text by relying on image-only communication.

## Visual QA Checklist

For every recreated component:

1. Inspect computed width/height.
2. Inspect padding and internal gaps.
3. Inspect radius.
4. Inspect background and foreground color tokens.
5. Inspect font size, weight, line-height, and text clamping.
6. Inspect icon slot size separately from icon glyph size.
7. Check light and dark mode if the component uses tokens.
8. Verify keyboard focus and accessible labels.
9. Compare against the Design System Inventory specimen, not against memory.

## High-Risk Failure Patterns

- Replacing token colors with close-looking hardcoded colors.
- Converting fixed-size mobile components into fluid desktop cards.
- Using generic `shadow-sm` instead of source shadow.
- Using lucide icons directly instead of `AppIcon`.
- Ignoring text clamping on offer/banner cards.
- Merging amount integer/decimal typography.
- Reusing one image placement for all product menu cards.
- Building custom modal panels instead of the shared `BottomSheet`.
- Hand-rolling collapsing headers instead of using `PageHeader`.
