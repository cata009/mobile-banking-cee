# Reference Platform Phase 1

Last updated: 2026-06-02

This document records the reduced industrialization pass requested for the stakeholder-ready banking demo.

The goal is not to turn the prototype into a production banking app. The goal is to make the React demo structurally mature enough that bank stakeholders and future developers can understand how the app grows through releases, scenarios, product variants, countries, and mocked data without hidden hardcoding.

## Implemented Scope

### 1. Release And Baseline OS

Implemented source contracts:

- `src/app/registry/baselineRegistry.ts`
- `src/app/registry/releaseRegistry.ts`
- `src/app/registry/featureManifestRegistry.ts`

The release model now has:

- a baseline ledger;
- R1/R2/R3/R4 promotion targets;
- release diffs;
- promotion readiness checks;
- flag retirement candidates;
- feature manifests with scope, affected screens, authority level, and target baseline.

Runtime IDs remain backward-compatible (`release-v1`, `release-v2`, `release-v3`, `release-v4`), while labels now present the bank-facing language (`Release R1`, `Release R2`, etc.).

### 2. Banking Scenario And Entitlements Engine

Implemented source contracts:

- `src/app/platform/banking/bankingScenarioRegistry.ts`
- `src/app/platform/effectiveAppContext.ts`

The scenario engine now models:

- prospects without products;
- retail users with one account;
- retail users with multiple accounts and cards;
- retail users with deposits, investments, and loans;
- payment-restricted users;
- prepared SME owner scenarios for every country;
- prepared Kids child scenarios for every country.

Each scenario declares:

- product scope;
- country scope;
- holdings;
- entitlements;
- limits;
- authority level;
- readiness state.

The action resolver explains disabled actions with explicit reasons, such as missing holdings, disabled entitlements, unavailable limits, product mismatch, country mismatch, or inactive release features.

### 3. Contract-Ready Mock Data Layer

Implemented source contract:

- `src/app/platform/data/bankingRepositories.ts`

The repository layer exposes:

- `accountsRepository`
- `cardsRepository`
- `paymentsRepository`
- `productsRepository`
- `entitlementsRepository`
- `scenarioRepository`

These repositories read governed mock scenario data today. They are shaped so an API adapter can replace the mock source later without rewriting the control panel or future consuming screens.

### 4. Project Packs For All Applications And Countries

Implemented source contract:

- `src/app/registry/projectPackRegistry.ts`

Project packs are generated for all `3 x 8 = 24` product/country combinations:

- `PI`
- `SME`
- `KIDS_PI`

across:

- `RO`
- `CZ`
- `SK`
- `HU`
- `RS`
- `BA`
- `BA_BL`
- `SI`

PI packs are runtime implemented. SME packs are prepared metadata variants. Kids packs are prepared for every country, while Romania keeps the current mock runtime.

### 5. Control Panel Integration

Implemented source contract:

- `src/app/components/demo/DemoFeatureSidePanel.tsx`

The control panel now exposes:

- current context;
- release diff and promotion readiness;
- banking scenario selector;
- holdings snapshot;
- limits;
- rights summary;
- disabled-action reasons;
- project-pack readiness;
- knowledge-source authority.

Payments primary cards now consume the effective context minimally: payment actions are disabled when the selected mock banking profile lacks the required entitlement, holding, limit, product scope, country scope, or release feature.

## Effective App Context

The resolved context is produced by `resolveEffectiveAppContext(state)` and contains:

```ts
{
  baseline,
  releasePreview,
  releaseDiff,
  promotionReadiness,
  activeFeatures,
  userScenario,
  holdings,
  entitlements,
  limits,
  visibleScreens,
  visibleProducts,
  enabledActions,
  disabledActions,
  dataSnapshot,
  projectPack
}
```

This is the main handoff object future developers should use before adding more scenario-aware UI behavior.

## Deliberately Deferred

The following were intentionally not implemented in this phase:

- Native Boundary
- full Security Model
- enterprise Test & Evidence System
- real backend
- real database
- auth/session authority
- audit trail
- production payment execution
- production Kids consent/legal workflow

They remain next maturity layers, not hidden assumptions.

## Verification

Added:

- `npm run audit:platform`

The audit checks the new release OS, feature manifests, project-pack coverage, banking scenarios, repositories, and control-panel sections.
