# State Of The World

Last updated: 2026-06-01

## What This Project Is

This project is a standalone `Vite + React` interactive demo platform for UniCredit CEE mobile banking experiences.

Current runtime supports:

- country switching across CEE markets;
- active/inactive app scenario;
- explicit release preview and baseline state through the `Release` control;
- Light/Dark appearance switching from the demo top bar and control panel, driven by UniCredit design-system theme tokens;
- Light/Dark exact-match token remapping for shared DS colors such as key neutrals, teal actions, status colors, and banner tones, using only approved dark partners from the supplied reference DS table;
- The remaining previously-unmatched active DS colors now also use explicit manual dark-mode pairs supplied during this session, and pure black has been normalized out of the active DS tokens in favor of `#262626`.
- product switching between `PI`, `SME`, and `Mobile PI Kids`, with an honest planned-state placeholder for SME;
- `Mobile PI Kids` now renders a Romania-only, current-design-system RO Kids prototype; non-RO Kids contexts and future-design-system Kids contexts still render the honest planned-state placeholder until separate concepts are implemented;
- design-system switching between `current` and `next`, with honest planned-state placeholder for next DS;
- feature side panel for release and unplanned flags;
- localized translation infrastructure by country;
- mobile frame demo shell;
- PI-like mobile banking screens, including Home, Analytics / My Spendings, Messages, Documents, Account Detail, Account Details, Payments, Products, Prime, More, Settings, and Contacts.
- RO Kids mock screens and flows, including Kid Home, onboarding, parent activation, request money, parent approval, send money approval, My Card, card customization, saving goals, allowance, chores, Learn, What Parent Can See, Parent Dashboard, Parent Approvals, Parent Controls, and chore/allowance management.
- Payments `OTHER` shortcuts now render as a horizontally scrollable shortcut rail, with each shortcut label constrained to a maximum of 2 text rows.
- Products offer banners now render through a chevron-based reusable card layout with a fixed right image column and clamped title/subtitle copy.
- The Products offer-banner component now supports dropdown-selectable color families with `normal` and `light` tone variants in the Design System inventory.
- Design System Inventory with `Components`, `Templates`, `Icons`, and `Colors` tabs; `Templates` currently covers all 30 files in `screenshots/` as selectable screenshot-backed templates, adds 20 code-only templates derived from active runtime patterns, and renders all 50 as real JSX code previews with PNG/JPG source comparison only where a source asset exists. `Icons` maps reusable app icons, has removed lucide wrappers that already had custom SVG equivalents, centralizes remaining lucide-alone glyphs behind `AppIcon`, and records raw-SVG audit boundaries. `Colors` maps `screenshots/Colors.svg` into palette swatches, copyable hex values, Light/Dark variants, and app color audit entries.
- The Design System color inventory now also catalogs the active PFM semantic category colors used by Spending and Account Detail, not just the original screenshot-extracted core palette.
- in-app hide/show amount privacy for account/card/product balances, with transactions intentionally left visible.
- Account Detail transaction search for the current account/product mock transaction profile, including clear reset and activation scroll behavior; current accounts now use country-specific merchant/counterparty transaction profiles across all 23 PFM categories, while saving accounts and term deposits intentionally show only own-account transfer in/out activity.
- Account Details info fields are now rendered through a reusable `AccountDetailsInfoField` component with a default title/subtitle variant and a trailing-icon variant for rows such as account number/copy.
- Messages mock Inbox/Outbox screen reconstructed from template 52, accessible from top-level header Messages icons across all PI countries, using the shared `PageHeader` and extended mock rows so Inbox/Outbox scrolling can be tested inside the phone frame.
- Transaction Detail and Domestic payment mock flow, entered either from Account Detail transaction row -> Redo payment or Payments -> New payment -> Domestic payment; Transaction Detail now displays its top category pill from the normalized PFM category taxonomy and shared PFM icon component.
- Analytics / My Spendings mock screen for the Spending bottom-nav tab, now deriving inflow/outflow and Money Out / Money In PFM category summaries from the same enriched account transaction profiles used by Account Detail, with static demo FX conversion into each country's local currency, internal own-account transfers excluded from PFM spend/income totals, and a swipeable top hero that slides between monthly and yearly periods over the last two years.

## What This Project Is Not Yet

It is not yet:

- a full SME implementation with real SME screens;
- a fully implemented next-design-system mobile experience;
- a multi-country Kids implementation; the current Kids work is Romania-only and mock-driven;
- a backend-integrated Kids product, with real activation, legal consent, wallet/card operations, ledger posting, notifications, persistence, or audit trails;
- a backend-integrated banking application;
- a real payment-execution, ledger, or transaction-posting application;
- a persistent audit/release management system;
- a fully enriched AI training catalog with automated semantic validation, though the current `screenshots/` folder is covered by a structured template registry, all 30 screenshot templates have reusable code previews, and 20 additional active-pattern templates are now code-only entries.

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
- centralized icon and color registries that let AI reuse known DS assets instead of inventing local variants; active product screens should not import `lucide-react` directly outside the `AppIcon` boundary;
- eventual integration into a larger project platform.
