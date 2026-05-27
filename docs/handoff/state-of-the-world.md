# State Of The World

Last updated: 2026-05-27

## What This Project Is

This project is a standalone `Vite + React` interactive demo platform for UniCredit CEE mobile banking experiences.

Current runtime supports:

- country switching across CEE markets;
- active/inactive app scenario;
- explicit release preview and baseline state through the `Release` control;
- product switching between `PI` and `SME`, with honest planned-state placeholder for SME;
- design-system switching between `current` and `next`, with honest planned-state placeholder for next DS;
- feature side panel for release and unplanned flags;
- localized translation infrastructure by country;
- mobile frame demo shell;
- PI-like mobile banking screens.

## What This Project Is Not Yet

It is not yet:

- a full SME implementation with real SME screens;
- a fully implemented next-design-system mobile experience;
- a backend-integrated banking application;
- a persistent audit/release management system;
- an exportable AI training catalog, though the architecture now points toward that.

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
- eventual integration into a larger project platform.
