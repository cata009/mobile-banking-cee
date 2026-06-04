# State Of The World

Last updated: 2026-06-04

## What This Project Is

This project is a standalone `Vite + React` interactive demo platform for UniCredit CEE mobile banking experiences.

Current runtime supports:

- country switching across CEE markets, now including separate `BA` Bosnia and `BA_BL` Bosnia Banja Luka application variants;
- active/inactive app scenario;
- explicit release preview and baseline state through the `Release` control;
- Phase 1 release/baseline operating system with a baseline ledger, feature manifests, R1/R2/R3/R4 promotion targets, release diffs, promotion readiness checks, and flag-retirement candidates;
- Phase 1 project-pack registry covering all 24 product/country combinations across `PI`, `SME`, and `Mobile PI Kids` for `RO`, `CZ`, `SK`, `HU`, `RS`, `BA`, `BA_BL`, and `SI`;
- Phase 1 banking scenario control with mock holdings, entitlements, limits, enabled actions, disabled-action reasons, and a resolved `effectiveAppContext`;
- contract-ready mock banking repositories for accounts, cards, payments, products, entitlements, and scenarios; these still read mocked scenario data today but are shaped for future API adapters;
- Light/Dark appearance switching from the demo top bar and control panel, driven by UniCredit design-system theme tokens;
- Light/Dark exact-match token remapping for shared DS colors such as key neutrals, teal actions, status colors, and banner tones, using only approved dark partners from the supplied reference DS table;
- The remaining previously-unmatched active DS colors now also use explicit manual dark-mode pairs supplied during this session, and pure black has been normalized out of the active DS tokens in favor of `#262626`.
- product switching between `PI`, `SME`, and `Mobile PI Kids`, with an honest planned-state placeholder for SME;
- `Mobile PI Kids` now renders a Romania-only, current-design-system RO Kids prototype; non-RO Kids contexts and future-design-system Kids contexts still render the honest planned-state placeholder until separate concepts are implemented;
- design-system switching between `current` and `next`, with honest planned-state placeholder for next DS;
- feature side panel for release and unplanned flags;
- localized translation infrastructure by country;
- More screen title and card labels are now translation-backed across every country/language pair; CZ/SK use the updated English labels `Consent to third parties`, `Digital activity record`, `My applications`, and `Tutorials`, plus local-language equivalents. BA and BA_BL now expose `Tutorials` and `My applications` after `Settings`, and their More/Products/Payments headers use the Bosnia-specific `Contact phone` + `Messages` action pair.
- mobile frame demo shell, including a top-bar icon-only screenshot dropdown placed after Settings / Control Panel that can download PNG captures of either the visible 375x812 phone viewport or an expanded full-height phone screen; the same dropdown can copy code-derived Figma-ready `build-ui.screen.v1` JSON layer trees for visible or full-height screen modes, without embedding a full-screen screenshot image; those JSON exports use an unscaled phone clone, app-content background instead of phone-shell black, numeric bounds, Figma paints/effects/text specs, assets, text safety width, designer-friendlier layer names, conservative Auto Layout intent for editable Figma import, app-side generated JSON validation, source metadata, and top-level quality warnings where needed; JSON delivery uses async clipboard writes with `.json` download fallback when browser permissions block copying; full-height exports preserve L1 bottom navigation at the bottom of the exported output when present, and the control is visible but disabled in the Design System Inventory route;
- PI-like mobile banking screens, including Home, Analytics / My Spendings, Messages, Documents, Account Detail, Account Details, Payments, Products, Investments Portfolio, Prime, More, Settings, and Contacts.
- Investments Portfolio is now reachable from the Home `Investment Portfolio` product card for Mobile PI Retail contexts in `RO`, `CZ`, `SK`, `HU`, `RS`, and `SI`; `BA` and `BA_BL` intentionally do not route into the Investments screen. The screen uses reusable components for the top tabs, value/performance chart, period chips, Investments action bar, `ALL PRODUCTS` counter divider, sorting chips, active/inactive securities accordions, product cards, fund-suggestion banner, and portfolio distribution chart. Its `Total value` is calculated from the owned `investment_account` products returned by `useProducts()`, so it follows country currency conversion and amount privacy masking instead of using a static figure. The portfolio tabs are now interactive: `Performance` shows the existing value chart, while `Product Type`, `Currency`, `Asset Class`, and `Account List` show donut/list distributions grouped from the same mock security holdings. Mock securities can belong to multiple security accounts and instrument currencies, including local-currency, EUR, USD, and GBP accounts.
- More `Documents` card badge now derives from the country-scoped Documents grouped-list config, so it reflects the actual number of document rows for every supported country instead of a hardcoded count. The Documents list helper also normalizes display order for every country: newest groups and newest rows are shown first, with older documents moving downward. Documents rows now model current-ish June 2026 dates, a single newest `NEW` badge, legal/non-legal status, a trailing 3-dot actions control, swipe-left reveal for `DELETE`, deletion confirmation for non-legal files, and a legal-file Info modal that prevents deletion.
- RO Kids mock screens and flows, including Kid Home, onboarding, parent activation, request money, parent approval, send money approval, My Card, card customization, saving goals, allowance, chores, Learn, What Parent Can See, Parent Dashboard, Parent Approvals, Parent Controls, and chore/allowance management.
- Payments `OTHER` / market-specific shortcut headings now use the shared `SectionHeadingDivider` component for title/divider rendering and a horizontally scrollable shortcut rail; each shortcut uses a reusable `PaymentOtherShortcutIconBubble` with 8px padding around a centered 32x32 icon slot, and its label uses the supplied 14px UniCredit bold centered N5 treatment.
- Payments primary hero cards now render through a reusable `PaymentHeroCard` with 9 screenshot-backed artwork variants (`payments1.png` ... `payments9.png`), a 120px card height, 24px title that respects supplied line breaks, 14px subtitle, and dedicated `heroSheets` overlay configuration per card. Romania now has four country-specific primary Payments cards (`Payment to account`, `RoPay`, `Currency exchange`, `Bills & Direct Debit`) and a `SHORTCUTS` rail; BA and BA_BL have five country-specific primary Payments cards and five `OTHER` shortcuts; the remaining non-RO/non-Bosnia countries still use the previous shared baseline.
- Products offer banners now render through a chevron-based reusable card layout with a fixed right image column and clamped title/subtitle copy.
- The Products offer-banner component now supports dropdown-selectable color families with `normal` and `light` tone variants in the Design System inventory.
- Products banking and ShopSmart commercial banners are now country-specific in both copy and color tone, and the offer rails can also vary in banner count by market, so switching country changes the Products storytelling instead of reusing one shared offer set everywhere.
- Products `OUR PRODUCTS` runtime cards now reuse the standard `ProductMenuCard` artwork support with the supplied product images, while preserving the existing country product card list.
- Products `OTHER SOLUTIONS FOR YOU` / `Additional services` is now visible only for Czech Republic and Slovakia; Serbia remains a direct Products page without Banking/ShopSmart tabs. BA, BA_BL, and SI are cards-only Products pages with no offer rail/headings and no Insurance card; BA/BA_BL use `Accounts`, `Cards`, `Loans`, and `Savings`.
- Design System Inventory with `Components`, `Templates`, `Icons`, and `Colors` tabs; `Templates` currently covers all 30 files in `screenshots/` as selectable screenshot-backed templates, adds 20 code-only templates derived from active runtime patterns, and renders all 50 as real JSX code previews with PNG/JPG source comparison only where a source asset exists. Every template now has a typed AI reuse contract with `ComponentId`, `ScreenId`, `FlowId`, screen family, runtime screen links where available, standalone page/state intent, reuse rules, and do-not-invent rules, guarded by `npm run audit:templates`. `Icons` maps reusable app icons, has removed lucide wrappers that already had custom SVG equivalents, centralizes remaining lucide-alone glyphs behind `AppIcon`, and records raw-SVG audit boundaries. `Colors` maps `screenshots/Colors.svg` into palette swatches, copyable hex values, Light/Dark variants, and app color audit entries.
- Local Figma handoff via `figma-plugins/screen-json-importer`, now named `UniCredit Build UI Bridge`, and the synced `screenshots/FIgma plugins/Component-E` variant named `Component-E Build UI Bridge`: the plugin builds editable Figma layers from `build-ui.screen.v1`, normalizes legacy Build-UI / Component-E-compatible JSON plus inline SVG/PNG/JPEG assets into the same schema, runs preflight diagnostics before creating Figma nodes, shows an English Diagnostics panel with build/extract warnings and companion metadata, and extracts selected Figma frames/components/groups/layers back into the same schema with assets, Figma styles, root frame styling, Auto Layout, text segments, source metadata, warnings, safe wrapping for single-layer selections, `components[]` / `variantSets[]` companions, style refs, component props, bound variables, and optional PNG 2x snapshots. `npm run audit:figma-bridge` provides the repeatable local static, VM smoke, manual smoke fixture import, preflight diagnostics, Diagnostics panel guard, and extracted-JSON re-import round-trip gate for both plugin copies.
- The Design System Inventory `Components` tab now groups multi-variant component families under selector-driven specimens instead of listing each variant as a separate long block, keeping the audit page shorter without changing the components themselves.
- The Design System color inventory now also catalogs the active PFM semantic category colors used by Spending and Account Detail, not just the original screenshot-extracted core palette; PFM dark-mode partners now preserve each light category hue/chroma with an OKLCH perceptual lightness lift, so Spending category rows and icons remain colorful and readable in dark mode.
- in-app hide/show amount privacy for account/card/product balances, with transactions intentionally left visible.
- Account Detail transaction search for the current account/product mock transaction profile, including clear reset and activation scroll behavior; current accounts now use country-specific merchant/counterparty transaction profiles across all 23 PFM categories, while saving accounts and term deposits intentionally show only own-account transfer in/out activity.
- Account Details info fields are now rendered through a reusable `AccountDetailsInfoField` component with a default title/subtitle variant and a trailing-icon variant for rows such as account number/copy.
- Messages mock Inbox/Outbox screen reconstructed from template 52, accessible from top-level header Messages icons across all PI countries, using the shared `PageHeader` and extended mock rows so Inbox/Outbox scrolling can be tested inside the phone frame.
- Contacts now uses the shared `PageHeader` collapsed-title behavior and shared `SectionHeadingDivider` section separators, aligning it with the other scrollable detail/list pages.
- Transaction Detail and Domestic payment mock flow, entered either from Account Detail transaction row -> Redo payment or Payments -> New payment -> Domestic payment; Transaction Detail now displays its top category pill from the normalized PFM category taxonomy and shared PFM icon component.
- Analytics / My Spendings mock screen for the Spending bottom-nav tab, now deriving inflow/outflow and Money Out / Money In PFM category summaries from the same enriched account transaction profiles used by Account Detail, with static demo FX conversion into each country's local currency, internal own-account transfers excluded from PFM spend/income totals, and a swipeable top hero that slides between monthly and yearly periods over the last two years.

## What This Project Is Not Yet

It is not yet:

- a full SME implementation with real SME screens;
- a fully implemented next-design-system mobile experience;
- a multi-country Kids implementation; the current Kids work is Romania-only and mock-driven;
- a backend-integrated Kids product, with real activation, legal consent, wallet/card operations, ledger posting, notifications, persistence, or audit trails;
- a backend-integrated banking application;
- a backend-integrated investments, trading, suitability, or fund-advisory application;
- a real payment-execution, ledger, or transaction-posting application;
- a persistent audit/release management system;
- a real release publication workflow with persisted baseline promotion history; Phase 1 models the ledger and readiness checks in source only;
- a real permission/entitlement backend; Phase 1 models mock rights and limits for stakeholder demos only;
- an automatic AI screen generator/compiler; the AI catalog, code-derived Figma JSON export, and local bidirectional `UniCredit Build UI Bridge` plugin support handoff/reuse workflows, but the app does not yet generate or mount new runtime screens from prompts by itself.

## Current Architectural Direction

The project should evolve into:

```text
demo platform + product catalog + screen/flow registry + release/baseline engine
```

The architecture must support:

- `PI`, `SME`, and `Mobile PI Kids`;
- all target CEE countries;
- current and future design systems;
- baseline/UAT states;
- release evolution;
- structured AI catalog export;
- AI-assisted flow construction from known screens and components;
- progressive conversion of screenshot templates into reusable code-backed screen primitives;
- typed template contracts that make every reusable template a standalone app page/state pattern with explicit component, screen, flow, data-source, and do-not-invent guidance;
- centralized icon and color registries that let AI reuse known DS assets instead of inventing local variants; active product screens should not import `lucide-react` directly outside the `AppIcon` boundary;
- eventual integration into a larger project platform.
