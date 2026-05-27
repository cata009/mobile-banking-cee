# State Of The World

Last updated: 2026-05-27

## What This Project Is

This project is a standalone `Vite + React` interactive demo platform for UniCredit CEE mobile banking experiences.

Current runtime supports:

- country switching across CEE markets;
- active/inactive app scenario;
- explicit release preview and baseline state through the `Release` control;
- Light/Dark appearance switching from the demo top bar and control panel, driven by UniCredit design-system theme tokens;
- product switching between `PI` and `SME`, with honest planned-state placeholder for SME;
- design-system switching between `current` and `next`, with honest planned-state placeholder for next DS;
- feature side panel for release and unplanned flags;
- localized translation infrastructure by country;
- mobile frame demo shell;
- PI-like mobile banking screens, including Home, Analytics / My Spendings, Account Detail, Account Details, Payments, Products, Prime, More, and Contacts.
- Design System Inventory with `Components`, `Templates`, `Icons`, and `Colors` tabs; `Templates` currently covers all 30 files in `screenshots/` as selectable screenshot templates, `Icons` maps reusable app icons, and `Colors` maps `screenshots/Colors.svg` into palette swatches, copyable hex values, Light/Dark variants, and app color audit entries.
- in-app hide/show amount privacy for account/card/product balances, with transactions intentionally left visible.
- Account Detail transaction search for the current account/product mock transaction profile, including clear reset and activation scroll behavior.
- Transaction Detail and Domestic payment mock flow, entered either from Account Detail transaction row -> Redo payment or Payments -> New payment -> Domestic payment.
- Analytics / My Spendings mock screen for the Spending bottom-nav tab, built from shared app header, banner, transaction-divider, and transaction-row components.

## What This Project Is Not Yet

It is not yet:

- a full SME implementation with real SME screens;
- a fully implemented next-design-system mobile experience;
- a backend-integrated banking application;
- a real payment-execution, ledger, or transaction-posting application;
- a persistent audit/release management system;
- a fully enriched AI training catalog with every target screen semantically mapped, though the current `screenshots/` folder is now covered by a structured template registry.

## Current Architectural Direction

The project should evolve into:

```text
demo platform + product catalog + screen/flow registry + release/baseline engine
```

The architecture must support:

- `PI` and `SME`;
- all target CEE countries;
- current and future design systems;
- baseline/UAT states;
- release evolution;
- structured AI catalog export;
- AI-assisted flow construction from known screens and components;
- centralized icon and color registries that let AI reuse known DS assets instead of inventing local variants;
- eventual integration into a larger project platform.
