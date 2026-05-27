# Platform Capability Map

Status legend: `implemented` / `partial` / `missing` / `placeholder` / `mock-driven` / `legacy` / `archived` / `inferred`

Scope: this map is based only on repository source and existing docs. No production behavior was changed. Evidence links point to repo files.

## 1. Executive Summary

- Platform maturity score: `42/100`
- Total verified capability areas: `14`
- Capability status counts:
  - `implemented`: 6
  - `partial`: 4
  - `mock-driven`: 3
  - `legacy/dormant`: 1
- Active page/state coverage mapped: `8/8` screen states in navigation registry
- API handler coverage mapped: `0/0` handlers found
- Feature/domain folder coverage represented: `100%` of visible app folders under [`src/app`](../../src/app), plus [`src/translations`](../../src/translations), [`src/data`](../../src/data), [`src/hooks`](../../src/hooks), and [`src/imports`](../../src/imports)

What this platform actually is:

This repository is a `Vite + React` single-page demo shell for showcasing a UniCredit CEE mobile banking experience across product, country, language, scenario, release, design-system, and feature-flag combinations. It behaves like an interactive prototype with stateful screen transitions, localized copy, static mock data, country-gated visual flows, and honest planned-state placeholders, not like a production banking platform with real APIs, persistence, authentication, audit, or automation. Evidence: [`package.json`](../../package.json), [`src/main.tsx`](../../src/main.tsx), [`src/app/App.tsx`](../../src/app/App.tsx), [`src/app/state/demoStore.tsx`](../../src/app/state/demoStore.tsx).

Top 5 strengths:

1. Strong demo control plane for country/scenario/release/feature combinations. Evidence: [`src/app/components/demo/DemoTopBar.tsx`](../../src/app/components/demo/DemoTopBar.tsx), [`src/app/components/demo/DemoFeatureSidePanel.tsx`](../../src/app/components/demo/DemoFeatureSidePanel.tsx), [`src/app/registry/demoConfig.ts`](../../src/app/registry/demoConfig.ts), [`src/app/registry/releaseRegistry.ts`](../../src/app/registry/releaseRegistry.ts).
2. Clear state-driven navigation model with explicit screen registry. Evidence: [`src/app/contexts/NavigationContext.tsx`](../../src/app/contexts/NavigationContext.tsx), [`src/app/App.tsx`](../../src/app/App.tsx).
3. Per-country translation architecture with separate English/local variants. Evidence: [`src/translations/index.ts`](../../src/translations/index.ts), [`src/translations/README.md`](../../src/translations/README.md), [`src/app/contexts/LanguageContext.tsx`](../../src/app/contexts/LanguageContext.tsx).
4. Country-specific capability gating for Co-Apping and More cards is centralized and readable. Evidence: [`src/app/utils/coAppingAvailability.ts`](../../src/app/utils/coAppingAvailability.ts), [`src/app/config/moreCardsConfig.ts`](../../src/app/config/moreCardsConfig.ts).
5. Mobile demo shell is reusable and visually coherent across screens. Evidence: [`src/app/components/MobileFrame.tsx`](../../src/app/components/MobileFrame.tsx), [`src/app/components/StatusBar.tsx`](../../src/app/components/StatusBar.tsx), [`src/app/components/DynamicIsland.tsx`](../../src/app/components/DynamicIsland.tsx).

Top 5 risks:

1. No backend, API handlers, or persistence layer are present, so all flows are front-end only. Evidence: [`package.json`](../../package.json), [`src/main.tsx`](../../src/main.tsx), [`src/app`](../../src/app).
2. Most business data is mock/static, including products, transactions, advisor details, contacts, and card counts. Evidence: [`src/data/products.ts`](../../src/data/products.ts), [`src/app/screens/home/TransactionsPreview.tsx`](../../src/app/screens/home/TransactionsPreview.tsx), [`src/translations/RO/en.ts`](../../src/translations/RO/en.ts), [`src/app/screens/contacts/ContactsScreen.tsx`](../../src/app/screens/contacts/ContactsScreen.tsx), [`src/app/screens/more/MoreScreen.tsx`](../../src/app/screens/more/MoreScreen.tsx).
3. Existing docs conflict with active code in several places, especially navigation and product accordion scope. Evidence: [`README_NAVIGARE.md`](../../README_NAVIGARE.md), [`src/app/App.tsx`](../../src/app/App.tsx), [`src/app/components/PreLoginScreen.tsx`](../../src/app/components/PreLoginScreen.tsx), [`src/app/config/productConfig.ts`](../../src/app/config/productConfig.ts), [`src/translations/README.md`](../../src/translations/README.md).
4. Translation governance is documented as mandatory, but many active screens still hardcode English strings. Evidence: [`guidelines.md`](../../guidelines.md), [`src/app/screens/home/HomeScreen.tsx`](../../src/app/screens/home/HomeScreen.tsx), [`src/app/screens/contacts/ContactsScreen.tsx`](../../src/app/screens/contacts/ContactsScreen.tsx), [`src/app/components/LogoutConfirmDialog.tsx`](../../src/app/components/LogoutConfirmDialog.tsx), [`src/app/screens/more/MoreHeader.tsx`](../../src/app/screens/more/MoreHeader.tsx).
5. Large parts of the feature-flag story are configured but not rendered by active screens. Evidence: [`src/app/registry/featureUI.ts`](../../src/app/registry/featureUI.ts), [`src/app/state/featureHelpers.ts`](../../src/app/state/featureHelpers.ts), [`src/app/screens/home/HomeScreen.tsx`](../../src/app/screens/home/HomeScreen.tsx), [`src/app/screens/home/QuickActions.tsx`](../../src/app/screens/home/QuickActions.tsx), [`src/app/screens/home/TransactionsPreview.tsx`](../../src/app/screens/home/TransactionsPreview.tsx).

Top 5 product gaps:

1. No real login/auth/session authority beyond screen state. Evidence: [`src/app/components/PreLoginActiveScreen.tsx`](../../src/app/components/PreLoginActiveScreen.tsx), [`src/app/App.tsx`](../../src/app/App.tsx).
2. No transaction, payments, analytics, or messages backend despite visible navigation affordances. Evidence: [`src/app/components/BottomNavigation.tsx`](../../src/app/components/BottomNavigation.tsx), [`src/app/screens/home/HomeScreen.tsx`](../../src/app/screens/home/HomeScreen.tsx).
3. No product export, backend handoff, audit history, or approval workflows. A source-level AI catalog now exists for contributor/tooling use, but it is not a runtime product export. Evidence: [`src/app`](../../src/app), [`src/app/registry/aiCatalog.ts`](../../src/app/registry/aiCatalog.ts), [`package.json`](../../package.json).
4. No tenant, permission, or user-profile model. Evidence: [`src/app/state/demoTypes.ts`](../../src/app/state/demoTypes.ts), [`src/data/products.ts`](../../src/data/products.ts).
5. No automation, notifications, or recovery flows beyond local UI toggles. Evidence: [`src/app/components/demo/DemoFeatureSidePanel.tsx`](../../src/app/components/demo/DemoFeatureSidePanel.tsx), [`src/app/screens/more/MoreScreen.tsx`](../../src/app/screens/more/MoreScreen.tsx).

## 2. Main Product Narrative

Primary end-to-end flow:

1. Intent/input: the operator chooses a product, country, app scenario, release preview, design system, optional language, and optional feature flags from the demo shell. Evidence: [`src/app/components/demo/DemoTopBar.tsx`](../../src/app/components/demo/DemoTopBar.tsx), [`src/app/components/demo/DemoFeatureSidePanel.tsx`](../../src/app/components/demo/DemoFeatureSidePanel.tsx), [`src/app/components/LanguageSelector.tsx`](../../src/app/components/LanguageSelector.tsx).
2. Workspace/context: `DemoProvider` holds product/country/scenario/design-system/baseline/release/flags, `NavigationProvider` holds the current screen state, and `LanguageProvider` resolves localized copy. Evidence: [`src/app/state/demoStore.tsx`](../../src/app/state/demoStore.tsx), [`src/app/contexts/NavigationContext.tsx`](../../src/app/contexts/NavigationContext.tsx), [`src/app/contexts/LanguageContext.tsx`](../../src/app/contexts/LanguageContext.tsx).
3. Core action: the user moves through pre-login, optional Co-Apping, home, prime, more, and contacts screens inside the mobile frame. Evidence: [`src/app/App.tsx`](../../src/app/App.tsx), [`src/app/components/MobileFrame.tsx`](../../src/app/components/MobileFrame.tsx).
4. Review/validation: validation is visual and state-based only: disabled buttons, country gating, feature-gate resolution, and screen transitions. Evidence: [`src/app/components/CoAppingSessionScreen.tsx`](../../src/app/components/CoAppingSessionScreen.tsx), [`src/app/state/featureResolver.ts`](../../src/app/state/featureResolver.ts), [`src/app/utils/coAppingAvailability.ts`](../../src/app/utils/coAppingAvailability.ts).
5. Export/handoff/output: there is no runtime product export or backend handoff. Output is the rendered on-screen demo state, plus a source-level AI catalog for future training/integration workflows. Evidence: [`package.json`](../../package.json), [`src/app`](../../src/app), [`src/app/registry/aiCatalog.ts`](../../src/app/registry/aiCatalog.ts).

Supporting domains and how they connect:

- Country registry drives currencies, locale, language pair, More cards, and Co-Apping availability. Evidence: [`src/app/registry/countryConfig.ts`](../../src/app/registry/countryConfig.ts), [`src/app/registry/languageByCountry.ts`](../../src/app/registry/languageByCountry.ts), [`src/app/config/moreCardsConfig.ts`](../../src/app/config/moreCardsConfig.ts), [`src/app/utils/coAppingAvailability.ts`](../../src/app/utils/coAppingAvailability.ts).
- Feature metadata and resolver drive demo-only release and unplanned toggles, but only some flags reach the active UI. Evidence: [`src/app/registry/demoConfig.ts`](../../src/app/registry/demoConfig.ts), [`src/app/state/featureResolver.ts`](../../src/app/state/featureResolver.ts), [`src/app/screens/home/HomeScreen.tsx`](../../src/app/screens/home/HomeScreen.tsx).
- Static data models feed the home summary and product accordions. Evidence: [`src/data/products.ts`](../../src/data/products.ts), [`src/hooks/useProducts.tsx`](../../src/hooks/useProducts.tsx), [`src/app/config/productConfig.ts`](../../src/app/config/productConfig.ts).
- Figma-generated assets and wrappers provide most visual composition. Evidence: [`vite.config.ts`](../../vite.config.ts), [`src/vite-env.d.ts`](../../src/vite-env.d.ts), [`src/imports`](../../src/imports), [`src/assets`](../../src/assets).

## 3. Complete Functional Inventory

### Demo control plane

| Function | Description | User value | Status | Evidence |
| --- | --- | --- | --- | --- |
| Product selector | Switches between Mobile PI and Mobile SME contexts | Makes multi-application scope explicit | `implemented` | [`src/app/components/demo/DemoTopBar.tsx`](../../src/app/components/demo/DemoTopBar.tsx), [`src/app/registry/projectModel.ts`](../../src/app/registry/projectModel.ts), [`src/app/components/UnsupportedContextScreen.tsx`](../../src/app/components/UnsupportedContextScreen.tsx) |
| Country selector | Switches demo market context across 7 countries | Lets stakeholders compare regional differences | `implemented` | [`src/app/components/demo/DemoTopBar.tsx`](../../src/app/components/demo/DemoTopBar.tsx), [`src/app/registry/demoConfig.ts`](../../src/app/registry/demoConfig.ts) |
| Scenario selector | Toggles active/inactive app mode | Simulates pre-login vs active app posture | `implemented` | [`src/app/components/demo/DemoTopBar.tsx`](../../src/app/components/demo/DemoTopBar.tsx), [`src/app/state/demoTypes.ts`](../../src/app/state/demoTypes.ts) |
| Release selector | Chooses legacy `current`, `v1`-`v4` as explicit release previews | Demonstrates release bundles while preserving runtime compatibility | `implemented` | [`src/app/components/demo/DemoTopBar.tsx`](../../src/app/components/demo/DemoTopBar.tsx), [`src/app/registry/demoConfig.ts`](../../src/app/registry/demoConfig.ts), [`src/app/registry/releaseRegistry.ts`](../../src/app/registry/releaseRegistry.ts) |
| Control panel | Shows context, release/baseline, feature flags, lifecycle, and coverage metadata | Supports controlled demo storytelling and prevents blind toggles | `implemented` | [`src/app/components/demo/DemoFeatureSidePanel.tsx`](../../src/app/components/demo/DemoFeatureSidePanel.tsx), [`src/app/state/featureResolver.ts`](../../src/app/state/featureResolver.ts), [`src/app/registry/projectModel.ts`](../../src/app/registry/projectModel.ts) |
| Design-system selector | Switches between current and next design-system contexts | Makes future DS migration explicit without false coverage | `implemented` | [`src/app/components/demo/DemoFeatureSidePanel.tsx`](../../src/app/components/demo/DemoFeatureSidePanel.tsx), [`src/app/registry/projectModel.ts`](../../src/app/registry/projectModel.ts), [`src/app/components/UnsupportedContextScreen.tsx`](../../src/app/components/UnsupportedContextScreen.tsx) |
| Demo reset | Returns to prelogin and clears Co-Apping active state | Fast reset between demonstrations | `implemented` | [`src/app/components/demo/DemoTopBar.tsx`](../../src/app/components/demo/DemoTopBar.tsx), [`src/app/contexts/NavigationContext.tsx`](../../src/app/contexts/NavigationContext.tsx) |

### Localization and country policy

| Function | Description | User value | Status | Evidence |
| --- | --- | --- | --- | --- |
| Per-country translation registry | Separate local + English translation sets per country | Supports country-specific wording and branding | `implemented` | [`src/translations/index.ts`](../../src/translations/index.ts), [`src/translations/README.md`](../../src/translations/README.md) |
| Language selector | Switches between local language and English for the current country | Preview localized experiences | `implemented` | [`src/app/components/LanguageSelector.tsx`](../../src/app/components/LanguageSelector.tsx), [`src/app/registry/languageByCountry.ts`](../../src/app/registry/languageByCountry.ts) |
| Country-specific Co-Apping gating | Restricts Co-Apping to CZ/SK | Keeps unsupported markets clean | `implemented` | [`src/app/utils/coAppingAvailability.ts`](../../src/app/utils/coAppingAvailability.ts), [`README_CO_APPING_AVAILABILITY.md`](../../README_CO_APPING_AVAILABILITY.md) |
| Country-specific More card matrix | Changes available More tiles by country | Demonstrates market-specific product menus | `implemented` | [`src/app/config/moreCardsConfig.ts`](../../src/app/config/moreCardsConfig.ts), [`src/app/screens/more/MoreScreen.tsx`](../../src/app/screens/more/MoreScreen.tsx) |

### Navigation and screen shell

| Function | Description | User value | Status | Evidence |
| --- | --- | --- | --- | --- |
| Screen-state navigation | Manages the 8 screen states without URL routing | Simple deterministic demo flow | `implemented` | [`src/app/contexts/NavigationContext.tsx`](../../src/app/contexts/NavigationContext.tsx), [`src/app/App.tsx`](../../src/app/App.tsx) |
| Demo state sync to navigation | Resets screen when demo controls change | Prevents stale context during demos | `implemented` | [`src/app/components/demo/DemoNavigationSync.tsx`](../../src/app/components/demo/DemoNavigationSync.tsx) |
| Mobile frame shell | Renders phone frame, status bar, dynamic island, overlays, and glow | Creates a consistent device-like viewport | `implemented` | [`src/app/components/MobileFrame.tsx`](../../src/app/components/MobileFrame.tsx), [`src/app/components/StatusBar.tsx`](../../src/app/components/StatusBar.tsx), [`src/app/components/DynamicIsland.tsx`](../../src/app/components/DynamicIsland.tsx) |

### Pre-login and Co-Apping

| Function | Description | User value | Status | Evidence |
| --- | --- | --- | --- | --- |
| Pre-login inactive screen | Shows localized welcome and country product accordion | Demonstrates pre-login acquisition/marketing surface | `partial` | [`src/app/components/PreLoginScreen.tsx`](../../src/app/components/PreLoginScreen.tsx), [`src/app/config/productConfig.ts`](../../src/app/config/productConfig.ts) |
| Pre-login active screen | Simulates active app login start with Face ID animation | Demonstrates activated-app entry | `partial` | [`src/app/components/PreLoginActiveScreen.tsx`](../../src/app/components/PreLoginActiveScreen.tsx), [`src/app/components/FaceIdAnimation.tsx`](../../src/app/components/FaceIdAnimation.tsx) |
| Other panel overlay | Opens localized menu overlay with country-aware options | Gives access to Co-Apping start and static menu items | `implemented` | [`src/app/components/PanelOverlay.tsx`](../../src/app/components/PanelOverlay.tsx), [`src/app/components/PanelWithTranslations.tsx`](../../src/app/components/PanelWithTranslations.tsx), [`src/app/components/PanelWithoutCoAppingTranslations.tsx`](../../src/app/components/PanelWithoutCoAppingTranslations.tsx) |
| Co-Apping session entry | Accepts a local code and enables session state | Simulates banker-assisted screen-sharing entry | `partial` | [`src/app/components/CoAppingSessionScreen.tsx`](../../src/app/components/CoAppingSessionScreen.tsx), [`src/app/utils/coAppingAvailability.ts`](../../src/app/utils/coAppingAvailability.ts) |
| Co-Apping active controls | Shows floating action, glow, termination popup, and loading animation | Simulates an active assisted session | `partial` | [`src/app/components/FloatingCoAppingButton.tsx`](../../src/app/components/FloatingCoAppingButton.tsx), [`src/app/components/TerminateSessionPopup.tsx`](../../src/app/components/TerminateSessionPopup.tsx), [`src/app/components/EdgeLoadingAnimation.tsx`](../../src/app/components/EdgeLoadingAnimation.tsx), [`src/app/App.tsx`](../../src/app/App.tsx) |

### Home and data presentation

| Function | Description | User value | Status | Evidence |
| --- | --- | --- | --- | --- |
| Account summary | Shows total available, total owed, and categorized products | Primary banking snapshot in the demo | `mock-driven` | [`src/app/screens/home/AccountSummary.tsx`](../../src/app/screens/home/AccountSummary.tsx), [`src/hooks/useProducts.tsx`](../../src/hooks/useProducts.tsx), [`src/data/products.ts`](../../src/data/products.ts) |
| Cards redesign flag | Changes home account summary styling | Demonstrates feature-flagged visual variance | `implemented` | [`src/app/screens/home/HomeScreen.tsx`](../../src/app/screens/home/HomeScreen.tsx), [`src/app/state/featureHelpers.ts`](../../src/app/state/featureHelpers.ts) |
| Unplanned banner flag | Shows a maintenance-style banner | Demonstrates a country-specific unplanned feature | `implemented` | [`src/app/screens/home/HomeScreen.tsx`](../../src/app/screens/home/HomeScreen.tsx), [`src/app/screens/home/UnplannedBanner.tsx`](../../src/app/screens/home/UnplannedBanner.tsx) |
| Quick actions | Intended action grid with payments hub and redesign support | Would surface actions from home | `legacy` | [`src/app/screens/home/QuickActions.tsx`](../../src/app/screens/home/QuickActions.tsx), [`src/app/screens/home/HomeScreen.tsx`](../../src/app/screens/home/HomeScreen.tsx) |
| Transactions preview | Intended recent transactions list with optional filters | Would surface transaction discovery | `legacy` | [`src/app/screens/home/TransactionsPreview.tsx`](../../src/app/screens/home/TransactionsPreview.tsx), [`src/app/screens/home/HomeScreen.tsx`](../../src/app/screens/home/HomeScreen.tsx) |
| Inactive home placeholder | Locks the home page when demo scenario is inactive | Simple inactive-state explanation | `placeholder` | [`src/app/screens/home/InactiveState.tsx`](../../src/app/screens/home/InactiveState.tsx) |

### Prime, More, and Contacts

| Function | Description | User value | Status | Evidence |
| --- | --- | --- | --- | --- |
| Prime experience | Two-tab Prime view for advisor and benefits | Demonstrates premium-banking storytelling | `partial` | [`src/app/screens/prime/PrimeScreen.tsx`](../../src/app/screens/prime/PrimeScreen.tsx), [`src/app/screens/prime/YourAdvisorTab.tsx`](../../src/app/screens/prime/YourAdvisorTab.tsx), [`src/app/screens/prime/YourBenefitsTab.tsx`](../../src/app/screens/prime/YourBenefitsTab.tsx) |
| More section | Country-specific tile grid plus logout modal | Demonstrates service-discovery menu | `partial` | [`src/app/screens/more/MoreScreen.tsx`](../../src/app/screens/more/MoreScreen.tsx), [`src/app/config/moreCardsConfig.ts`](../../src/app/config/moreCardsConfig.ts), [`src/app/components/LogoutConfirmDialog.tsx`](../../src/app/components/LogoutConfirmDialog.tsx) |
| Contacts directory | Displays bank contacts, social links, and Prime advisor shortcut | Demonstrates support/contact discovery | `partial` | [`src/app/screens/contacts/ContactsScreen.tsx`](../../src/app/screens/contacts/ContactsScreen.tsx), [`src/app/screens/contacts/ContactsNavigationCard.tsx`](../../src/app/screens/contacts/ContactsNavigationCard.tsx) |

## 4. Capability Profiles

### 4.1 Demo Control Plane

- Description: sticky desktop shell for selecting country, scenario, release preview, flags, and resetting state.
- User value: makes the repo useful as a stakeholder-facing walkthrough tool.
- UI entry points: top bar country selector, scenario segmented control, version selector, settings icon, reset icon.
- Routes/pages: global shell surrounding every screen state.
- API endpoints: none found.
- Key files/services/functions: [`src/app/components/demo/DemoTopBar.tsx`](../../src/app/components/demo/DemoTopBar.tsx), [`src/app/components/demo/DemoFeatureSidePanel.tsx`](../../src/app/components/demo/DemoFeatureSidePanel.tsx), [`src/app/state/demoStore.tsx`](../../src/app/state/demoStore.tsx), [`src/app/registry/demoConfig.ts`](../../src/app/registry/demoConfig.ts).
- Schemas/models: [`src/app/state/demoTypes.ts`](../../src/app/state/demoTypes.ts).
- DS components: mostly bespoke top-bar markup plus Lucide `X` icon in feature panel. Evidence: [`src/app/components/demo/DemoFeatureSidePanel.tsx`](../../src/app/components/demo/DemoFeatureSidePanel.tsx).
- AI involvement: none found.
- Dependencies: navigation context, feature resolver, registry metadata, translations indirectly.
- Maturity: `implemented`
- Risk: `medium`
- Evidence: [`src/app/components/demo/DemoShell.tsx`](../../src/app/components/demo/DemoShell.tsx), [`src/app/components/demo/DemoNavigationSync.tsx`](../../src/app/components/demo/DemoNavigationSync.tsx).
- Open questions:
  - Should demo state become URL-addressable for shareable review links?
  - Should feature-flag controls live only in desktop shell or also in mobile demo mode?

### 4.2 Navigation and Mobile Shell

- Description: state-driven screen navigation inside a single mobile frame.
- User value: lets reviewers move through a realistic phone-like flow without router complexity.
- UI entry points: all screen transition handlers in [`src/app/App.tsx`](../../src/app/App.tsx).
- Routes/pages: `prelogin-inactive`, `prelogin-active`, `language-selector`, `co-apping-session`, `homepage`, `prime`, `more`, `contacts`. Evidence: [`src/app/contexts/NavigationContext.tsx`](../../src/app/contexts/NavigationContext.tsx).
- API endpoints: none found.
- Key files/services/functions: [`src/app/App.tsx`](../../src/app/App.tsx), [`src/app/contexts/NavigationContext.tsx`](../../src/app/contexts/NavigationContext.tsx), [`src/app/components/MobileFrame.tsx`](../../src/app/components/MobileFrame.tsx).
- Schemas/models: `Screen`, `NavigationState`. Evidence: [`src/app/contexts/NavigationContext.tsx`](../../src/app/contexts/NavigationContext.tsx).
- DS components: bespoke shell, custom status bar, dynamic island, glow overlay.
- AI involvement: none found.
- Dependencies: demo store decides initial state; shell overlays depend on Co-Apping and modal components.
- Maturity: `implemented`
- Risk: `medium`
- Evidence: [`src/app/components/StatusBar.tsx`](../../src/app/components/StatusBar.tsx), [`src/app/components/DynamicIsland.tsx`](../../src/app/components/DynamicIsland.tsx), [`src/app/components/ShareScreenGlow.tsx`](../../src/app/components/ShareScreenGlow.tsx).
- Open questions:
  - Is browser URL routing intentionally out of scope?
  - Should overlays be normalized through `overlay` portal instead of inline rendering?

### 4.3 Localization and Country Policy

- Description: per-country translations, two-language support per country, and country-specific feature/presentation rules.
- User value: aligns the same demo shell to 7 regional variants.
- UI entry points: language selector, country dropdown, screen copy throughout the app.
- Routes/pages: all pages consume this capability.
- API endpoints: none found.
- Key files/services/functions: [`src/app/contexts/LanguageContext.tsx`](../../src/app/contexts/LanguageContext.tsx), [`src/translations/index.ts`](../../src/translations/index.ts), [`src/app/registry/languageByCountry.ts`](../../src/app/registry/languageByCountry.ts), [`src/app/registry/countryConfig.ts`](../../src/app/registry/countryConfig.ts).
- Schemas/models: [`src/translations/types.ts`](../../src/translations/types.ts), [`src/app/state/demoTypes.ts`](../../src/app/state/demoTypes.ts).
- DS components: [`src/app/components/LanguageSelector.tsx`](../../src/app/components/LanguageSelector.tsx), [`src/app/components/ui/LanguageSelectorButton.tsx`](../../src/app/components/ui/LanguageSelectorButton.tsx).
- AI involvement: none found.
- Dependencies: demo store country, translation registry, local-language mapping.
- Maturity: `implemented`, with `partial` governance compliance.
- Risk: `high`
- Evidence: [`guidelines.md`](../../guidelines.md), [`src/app/screens/contacts/ContactsScreen.tsx`](../../src/app/screens/contacts/ContactsScreen.tsx), [`src/app/screens/more/MoreHeader.tsx`](../../src/app/screens/more/MoreHeader.tsx), [`src/app/components/LogoutConfirmDialog.tsx`](../../src/app/components/LogoutConfirmDialog.tsx).
- Open questions:
  - Is hardcoded English in active screens temporary, or is the translation mandate no longer enforced?
  - Should `t()` accept typed keys instead of plain `string` to catch drift?

### 4.4 Pre-Login and Product Acquisition

- Description: pre-login screens, language switching, and a country-specific product accordion.
- User value: demonstrates acquisition-oriented entry surfaces before login.
- UI entry points: initial app load, language button, bottom nav links, "OTHER" panel trigger.
- Routes/pages: `prelogin-inactive`, `prelogin-active`, `language-selector`.
- API endpoints: none found.
- Key files/services/functions: [`src/app/components/PreLoginScreen.tsx`](../../src/app/components/PreLoginScreen.tsx), [`src/app/components/PreLoginActiveScreen.tsx`](../../src/app/components/PreLoginActiveScreen.tsx), [`src/app/config/productConfig.ts`](../../src/app/config/productConfig.ts), [`src/app/components/ProductAccordionAnimated.tsx`](../../src/app/components/ProductAccordionAnimated.tsx).
- Schemas/models: `Product` acquisition config in [`src/app/config/productConfig.ts`](../../src/app/config/productConfig.ts).
- DS components: custom `LanguageSelectorButton`, `PreLoginHeading`, `NavigationLink`, and white `ui/PrimaryButton`. Evidence: [`src/app/components/ui`](../../src/app/components/ui).
- AI involvement: none found.
- Dependencies: translations, country registry, demo scenario, product config.
- Maturity: `partial`
- Risk: `medium`
- Evidence: [`src/app/components/FaceIdAnimation.tsx`](../../src/app/components/FaceIdAnimation.tsx), [`src/app/components/PanelOverlay.tsx`](../../src/app/components/PanelOverlay.tsx).
- Open questions:
  - `src/translations/README.md` says product accordion is RS-only, but config enables all countries. Which is authoritative? Evidence: [`src/translations/README.md`](../../src/translations/README.md), [`src/app/config/productConfig.ts`](../../src/app/config/productConfig.ts).

### 4.5 Co-Apping

- Description: country-gated assisted-session demo with code entry, activation animation, floating affordance, and termination.
- User value: demonstrates collaborative banker-assisted support for CZ/SK.
- UI entry points: "OTHER" panel -> "START CO-APPING SESSION", active session floating button.
- Routes/pages: `co-apping-session`; overlays on prelogin/home.
- API endpoints: none found.
- Key files/services/functions: [`src/app/components/CoAppingSessionScreen.tsx`](../../src/app/components/CoAppingSessionScreen.tsx), [`src/app/utils/coAppingAvailability.ts`](../../src/app/utils/coAppingAvailability.ts), [`src/app/components/FloatingCoAppingButton.tsx`](../../src/app/components/FloatingCoAppingButton.tsx), [`src/app/components/TerminateSessionPopup.tsx`](../../src/app/components/TerminateSessionPopup.tsx), [`src/app/components/EdgeLoadingAnimation.tsx`](../../src/app/components/EdgeLoadingAnimation.tsx), [`src/app/App.tsx`](../../src/app/App.tsx).
- Schemas/models: no session schema beyond local boolean and screen state. Evidence: [`src/app/contexts/NavigationContext.tsx`](../../src/app/contexts/NavigationContext.tsx).
- DS components: bespoke overlays and translated Figma-derived panel wrappers.
- AI involvement: none found.
- Dependencies: country policy, navigation, translations, demo scenario.
- Maturity: `partial`
- Risk: `high`
- Evidence: [`README_CO_APPING_AVAILABILITY.md`](../../README_CO_APPING_AVAILABILITY.md).
- Open questions:
  - The border animation path uses CSS-like `calc()` inside SVG `d`, which may not be valid SVG path data. This is a source-based risk, not a verified runtime failure. Evidence: [`src/app/components/EdgeLoadingAnimation.tsx`](../../src/app/components/EdgeLoadingAnimation.tsx).

### 4.6 Home Dashboard and Feature Flags

- Description: localized home screen with account summary plus a small subset of feature-flagged variants.
- User value: gives the main banking snapshot for the demo.
- UI entry points: login completion, active scenario, home tab.
- Routes/pages: `homepage`
- API endpoints: none found.
- Key files/services/functions: [`src/app/screens/home/HomeScreen.tsx`](../../src/app/screens/home/HomeScreen.tsx), [`src/app/screens/home/AccountSummary.tsx`](../../src/app/screens/home/AccountSummary.tsx), [`src/hooks/useProducts.tsx`](../../src/hooks/useProducts.tsx), [`src/app/state/featureHelpers.ts`](../../src/app/state/featureHelpers.ts), [`src/app/state/featureResolver.ts`](../../src/app/state/featureResolver.ts).
- Schemas/models: [`src/data/products.ts`](../../src/data/products.ts), [`src/app/state/demoTypes.ts`](../../src/app/state/demoTypes.ts).
- DS components: custom bottom navigation, accordions, product cards.
- AI involvement: none found.
- Dependencies: mock products, country currency formatter, demo flags.
- Maturity: `mock-driven`
- Risk: `high`
- Evidence: [`src/app/registry/featureUI.ts`](../../src/app/registry/featureUI.ts), [`src/app/screens/home/QuickActions.tsx`](../../src/app/screens/home/QuickActions.tsx), [`src/app/screens/home/TransactionsPreview.tsx`](../../src/app/screens/home/TransactionsPreview.tsx).
- Open questions:
  - Are `QuickActions`, `TransactionsPreview`, and `HomeHeader` meant to be remounted into `HomeScreen`, or are they retained only as dormant experiments?

### 4.7 Prime and Contacts

- Description: premium advisor/benefits storytelling and static contact discovery.
- User value: demonstrates premium service and support channels.
- UI entry points: Prime badge from home, More -> Contacts, Contacts -> My Prime Advisor.
- Routes/pages: `prime`, `contacts`
- API endpoints: none found.
- Key files/services/functions: [`src/app/screens/prime/PrimeScreen.tsx`](../../src/app/screens/prime/PrimeScreen.tsx), [`src/app/screens/prime/YourAdvisorTab.tsx`](../../src/app/screens/prime/YourAdvisorTab.tsx), [`src/app/screens/prime/YourBenefitsTab.tsx`](../../src/app/screens/prime/YourBenefitsTab.tsx), [`src/app/screens/contacts/ContactsScreen.tsx`](../../src/app/screens/contacts/ContactsScreen.tsx).
- Schemas/models: copy is mostly translation-driven for Prime and hardcoded for Contacts.
- DS components: `PrimeLabelValue`, `PrimeIconLabelValue`, `ContactsNavigationCard`. Evidence: [`src/app/components/prime`](../../src/app/components/prime), [`src/app/screens/contacts/ContactsNavigationCard.tsx`](../../src/app/screens/contacts/ContactsNavigationCard.tsx).
- AI involvement: none found.
- Dependencies: translations, static assets, navigation callbacks.
- Maturity: `partial`
- Risk: `medium`
- Evidence: [`src/translations/types.ts`](../../src/translations/types.ts), [`src/translations/RO/en.ts`](../../src/translations/RO/en.ts).
- Open questions:
  - Should Contacts also become translation-driven and country-specific, like Prime already is?

### 4.8 More Menu and Service Discovery

- Description: country-dependent tile grid for secondary service areas plus logout confirmation.
- User value: demonstrates how service discovery changes per market.
- UI entry points: bottom navigation `More`, tiles, logout icon.
- Routes/pages: `more`
- API endpoints: none found.
- Key files/services/functions: [`src/app/screens/more/MoreScreen.tsx`](../../src/app/screens/more/MoreScreen.tsx), [`src/app/config/moreCardsConfig.ts`](../../src/app/config/moreCardsConfig.ts), [`src/app/screens/more/cards`](../../src/app/screens/more/cards), [`src/app/components/LogoutConfirmDialog.tsx`](../../src/app/components/LogoutConfirmDialog.tsx).
- Schemas/models: `MoreCardType` and country matrix. Evidence: [`src/app/config/moreCardsConfig.ts`](../../src/app/config/moreCardsConfig.ts).
- DS components: `MoreCardBase`, custom header, bottom navigation.
- AI involvement: none found.
- Dependencies: country code, card assets, navigation callbacks.
- Maturity: `partial`
- Risk: `medium`
- Evidence: [`src/app/screens/more/MoreHeader.tsx`](../../src/app/screens/more/MoreHeader.tsx), [`src/app/screens/more/cards/ContactsCard.tsx`](../../src/app/screens/more/cards/ContactsCard.tsx), [`src/app/screens/more/cards/MoreCardBase.tsx`](../../src/app/screens/more/cards/MoreCardBase.tsx).
- Open questions:
  - The active More cards hardcode titles in English while guidelines require translations. Is there a migration plan?

## 5. Routes / Pages Map

Note: these are app screen states, not browser URL routes. The repo does not use React Router. Evidence: [`src/app/contexts/NavigationContext.tsx`](../../src/app/contexts/NavigationContext.tsx), [`src/main.tsx`](../../src/main.tsx).

| Screen/page | Purpose | Owning capability | Maturity | Risk | Core/demo/legacy | Source files | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `prelogin-inactive` | Inactive pre-login entry | Pre-login and product acquisition | `partial` | `medium` | `core demo` | [`src/app/components/PreLoginScreen.tsx`](../../src/app/components/PreLoginScreen.tsx) | Product accordion is country-driven |
| `prelogin-active` | Activated pre-login with Face ID | Pre-login and product acquisition | `partial` | `medium` | `core demo` | [`src/app/components/PreLoginActiveScreen.tsx`](../../src/app/components/PreLoginActiveScreen.tsx) | No real auth |
| `language-selector` | Change current display language | Localization and country policy | `implemented` | `low` | `supporting` | [`src/app/components/LanguageSelector.tsx`](../../src/app/components/LanguageSelector.tsx) | Saves back into context only |
| `co-apping-session` | Enter assisted-session code | Co-Apping | `partial` | `high` | `core demo` | [`src/app/components/CoAppingSessionScreen.tsx`](../../src/app/components/CoAppingSessionScreen.tsx) | Rendered only for CZ/SK |
| `homepage` | Main banking summary | Home dashboard and feature flags | `mock-driven` | `high` | `core demo` | [`src/app/screens/home/HomeScreen.tsx`](../../src/app/screens/home/HomeScreen.tsx), [`src/app/screens/home/AccountSummary.tsx`](../../src/app/screens/home/AccountSummary.tsx) | Feature flags mostly dormant |
| `prime` | Premium-banking story | Prime and contacts | `partial` | `medium` | `supporting` | [`src/app/screens/prime/PrimeScreen.tsx`](../../src/app/screens/prime/PrimeScreen.tsx) | Static actions, localized content |
| `more` | Service-discovery menu | More menu and service discovery | `partial` | `medium` | `supporting` | [`src/app/screens/more/MoreScreen.tsx`](../../src/app/screens/more/MoreScreen.tsx) | Country-specific card matrix |
| `contacts` | Bank/support contact directory | Prime and contacts | `partial` | `medium` | `supporting` | [`src/app/screens/contacts/ContactsScreen.tsx`](../../src/app/screens/contacts/ContactsScreen.tsx) | Mostly hardcoded copy |

Overlay/modal states attached to pages:

- Other menu panel: [`src/app/components/PanelOverlay.tsx`](../../src/app/components/PanelOverlay.tsx)
- Co-Apping terminate popup: [`src/app/components/TerminateSessionPopup.tsx`](../../src/app/components/TerminateSessionPopup.tsx)
- More logout dialog: [`src/app/components/LogoutConfirmDialog.tsx`](../../src/app/components/LogoutConfirmDialog.tsx)

## 6. API Endpoint Map

No API handlers or server routes were found in the repository.

| Method | Path | Purpose | Capability | Schemas | Persistence touched | Auth/tenant assumptions | Maturity | Risk | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| none | none | Front-end-only Vite app | Whole platform | none | none | none visible | `missing` | `high` | [`package.json`](../../package.json), [`vite.config.ts`](../../vite.config.ts), [`src/main.tsx`](../../src/main.tsx) |

## 7. User Journey Map

| Journey | Entry point | Steps | UI | APIs/services | Capabilities used | Maturity | Missing pieces | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1. Switch country | Demo top bar | Open country dropdown -> choose market -> navigation resets | Demo shell | local React state only | Demo control plane, localization | `implemented` | no persistence/share link | [`src/app/components/demo/DemoTopBar.tsx`](../../src/app/components/demo/DemoTopBar.tsx), [`src/app/components/demo/DemoNavigationSync.tsx`](../../src/app/components/demo/DemoNavigationSync.tsx) |
| 2. Switch scenario | Demo top bar | Toggle Active/Inactive -> screen resets | Demo shell | local React state only | Demo control plane, navigation | `implemented` | no history/audit | [`src/app/components/demo/DemoTopBar.tsx`](../../src/app/components/demo/DemoTopBar.tsx) |
| 3. Switch release preview | Demo top bar | Open release selector -> choose release preview -> home visuals may change | Demo shell | feature resolver + release registry | Demo control plane, feature flags | `implemented` | some release features are configured but not mounted | [`src/app/registry/demoConfig.ts`](../../src/app/registry/demoConfig.ts), [`src/app/registry/releaseRegistry.ts`](../../src/app/registry/releaseRegistry.ts), [`src/app/screens/home/HomeScreen.tsx`](../../src/app/screens/home/HomeScreen.tsx) |
| 4. Toggle unplanned feature | Control panel | Open settings/control panel -> check flag -> app resets | Side panel | feature resolver | Demo control plane, feature flags | `implemented` | no backend, no persistence | [`src/app/components/demo/DemoFeatureSidePanel.tsx`](../../src/app/components/demo/DemoFeatureSidePanel.tsx) |
| 5. Change language | Language selector button | Open selector -> choose language -> save -> go back | `language-selector` | translation lookup | Localization | `implemented` | no typed key safety in runtime usage | [`src/app/components/LanguageSelector.tsx`](../../src/app/components/LanguageSelector.tsx), [`src/app/contexts/LanguageContext.tsx`](../../src/app/contexts/LanguageContext.tsx) |
| 6. Open Other panel | Pre-login footer | Tap `OTHER` -> open translated menu -> close or select item | Panel overlay | none | Pre-login, Co-Apping policy | `implemented` | static items do nothing | [`src/app/components/PreLoginScreen.tsx`](../../src/app/components/PreLoginScreen.tsx), [`src/app/components/PanelOverlay.tsx`](../../src/app/components/PanelOverlay.tsx) |
| 7. Start Co-Apping in CZ/SK | Other panel | Tap `START CO-APPING SESSION` -> enter code -> continue -> session activates | Panel + session page | local state only | Co-Apping | `partial` | no real session validation or remote connection | [`src/app/components/PanelWithTranslations.tsx`](../../src/app/components/PanelWithTranslations.tsx), [`src/app/components/CoAppingSessionScreen.tsx`](../../src/app/components/CoAppingSessionScreen.tsx), [`src/app/App.tsx`](../../src/app/App.tsx) |
| 8. Terminate Co-Apping | Floating green button | Tap FAB -> confirm terminate -> state resets | Home overlay | local state only | Co-Apping | `partial` | no remote session teardown | [`src/app/components/FloatingCoAppingButton.tsx`](../../src/app/components/FloatingCoAppingButton.tsx), [`src/app/components/TerminateSessionPopup.tsx`](../../src/app/components/TerminateSessionPopup.tsx) |
| 9. Login to home | Active pre-login | Tap `Log in` -> Face ID animation -> navigate home | Pre-login active | local callback only | Pre-login, home | `partial` | no auth, no error handling | [`src/app/components/PreLoginActiveScreen.tsx`](../../src/app/components/PreLoginActiveScreen.tsx) |
| 10. Explore Prime | Home badge or Contacts card | Tap Prime -> switch tabs -> inspect advisor/benefits | Prime | localized static content | Prime and contacts | `partial` | no outbound actions enabled | [`src/app/screens/prime/PrimeScreen.tsx`](../../src/app/screens/prime/PrimeScreen.tsx), [`src/app/screens/prime/YourAdvisorTab.tsx`](../../src/app/screens/prime/YourAdvisorTab.tsx) |
| 11. Explore More/Contacts | Home nav -> More -> Contacts | Open More -> tap Contacts -> optional jump to Prime advisor | More + Contacts | local callbacks | More menu, contacts | `partial` | most cards do not navigate anywhere yet | [`src/app/screens/more/MoreScreen.tsx`](../../src/app/screens/more/MoreScreen.tsx), [`src/app/screens/contacts/ContactsScreen.tsx`](../../src/app/screens/contacts/ContactsScreen.tsx) |
| 12. Logout confirmation | More header logout | Tap logout icon -> confirm dialog -> callback to pre-login-active | More | local callback only | More menu | `partial` | no session termination or auth clear | [`src/app/components/LogoutConfirmDialog.tsx`](../../src/app/components/LogoutConfirmDialog.tsx), [`src/app/App.tsx`](../../src/app/App.tsx) |

## 8. Capability Heatmap

| Capability | Strategic role | Maturity | Risk | Criticality | Owner/authority | Evidence | Main gaps |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Demo control plane | `control-plane` | `implemented` | `medium` | `critical` | `demoStore` + demo registries | [`src/app/state/demoStore.tsx`](../../src/app/state/demoStore.tsx), [`src/app/registry/demoConfig.ts`](../../src/app/registry/demoConfig.ts) | No shareable URLs, audit, or persistence |
| Navigation/mobile shell | `core` | `implemented` | `medium` | `critical` | `NavigationContext` + `App` | [`src/app/contexts/NavigationContext.tsx`](../../src/app/contexts/NavigationContext.tsx), [`src/app/App.tsx`](../../src/app/App.tsx) | No browser route model |
| Localization/country policy | `core` | `implemented` | `high` | `critical` | translation registry + country registries | [`src/translations/index.ts`](../../src/translations/index.ts), [`src/app/registry/languageByCountry.ts`](../../src/app/registry/languageByCountry.ts) | Hardcoded text and schema drift |
| Pre-login/product acquisition | `core` | `partial` | `medium` | `high` | pre-login components + product config | [`src/app/components/PreLoginScreen.tsx`](../../src/app/components/PreLoginScreen.tsx), [`src/app/config/productConfig.ts`](../../src/app/config/productConfig.ts) | Docs conflict on accordion scope; no real actions |
| Co-Apping | `demo-only` | `partial` | `high` | `high` | `App` + co-apping availability + overlays | [`src/app/utils/coAppingAvailability.ts`](../../src/app/utils/coAppingAvailability.ts), [`src/app/components/CoAppingSessionScreen.tsx`](../../src/app/components/CoAppingSessionScreen.tsx) | No real session backend |
| Home dashboard | `core` | `mock-driven` | `high` | `critical` | static product dataset + feature helpers | [`src/data/products.ts`](../../src/data/products.ts), [`src/app/screens/home/HomeScreen.tsx`](../../src/app/screens/home/HomeScreen.tsx) | No APIs; many feature surfaces unmounted |
| Prime | `supporting` | `partial` | `medium` | `medium` | Prime screen + translations | [`src/app/screens/prime/PrimeScreen.tsx`](../../src/app/screens/prime/PrimeScreen.tsx), [`src/translations/RO/en.ts`](../../src/translations/RO/en.ts) | Static advisor/actions |
| More service discovery | `supporting` | `partial` | `medium` | `medium` | More config + card components | [`src/app/config/moreCardsConfig.ts`](../../src/app/config/moreCardsConfig.ts), [`src/app/screens/more/MoreScreen.tsx`](../../src/app/screens/more/MoreScreen.tsx) | Most cards are non-functional |
| Contacts directory | `supporting` | `partial` | `medium` | `medium` | Contacts screen | [`src/app/screens/contacts/ContactsScreen.tsx`](../../src/app/screens/contacts/ContactsScreen.tsx) | Hardcoded, not market-aware |
| Generic UI library | `transitional` | `partial` | `medium` | `low` | `src/app/components/ui` | [`src/app/components/ui`](../../src/app/components/ui), [`src/app/components/ui/button.tsx`](../../src/app/components/ui/button.tsx) | Large unused surface; drift from active screens |

## 9. Truth Ownership Map

| Domain | Source of truth | Runtime authority | Persistence authority | Validation authority | Risk of drift | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Demo state | `DemoProvider` state | `useDemo()` | none; ephemeral React state | TS types in [`demoTypes`](../../src/app/state/demoTypes.ts) | `medium` | [`src/app/state/demoStore.tsx`](../../src/app/state/demoStore.tsx) |
| Screen navigation | `NavigationProvider` state | `useNavigationContext()` | none | `Screen` union type | `low` | [`src/app/contexts/NavigationContext.tsx`](../../src/app/contexts/NavigationContext.tsx) |
| Translation copy | per-country translation files | `LanguageProvider.t()` | static TS source files | [`src/translations/types.ts`](../../src/translations/types.ts) plus runtime fallback | `high` | [`src/translations/index.ts`](../../src/translations/index.ts), [`src/app/contexts/LanguageContext.tsx`](../../src/app/contexts/LanguageContext.tsx) |
| Country behavior | registry/config files | consuming screens/hooks | static TS source files | TS unions and records | `medium` | [`src/app/registry/countryConfig.ts`](../../src/app/registry/countryConfig.ts), [`src/app/config/moreCardsConfig.ts`](../../src/app/config/moreCardsConfig.ts), [`src/app/utils/coAppingAvailability.ts`](../../src/app/utils/coAppingAvailability.ts) |
| Feature flags | demo registry + state | `featureResolver` | ephemeral `flagsByContext` in memory | TS unions + metadata | `high` | [`src/app/registry/demoConfig.ts`](../../src/app/registry/demoConfig.ts), [`src/app/state/featureResolver.ts`](../../src/app/state/featureResolver.ts) |
| Banking product data | `mockProducts` | `useProducts()` | static TS source file | TS product union types | `medium` | [`src/data/products.ts`](../../src/data/products.ts), [`src/hooks/useProducts.tsx`](../../src/hooks/useProducts.tsx) |
| Prime advisor content | translation files | Prime screens | static TS source files | translation interface only | `medium` | [`src/translations/RO/en.ts`](../../src/translations/RO/en.ts), [`src/app/screens/prime/YourAdvisorTab.tsx`](../../src/app/screens/prime/YourAdvisorTab.tsx) |
| Contacts details | hardcoded component copy | Contacts screen | static component code | none visible | `high` | [`src/app/screens/contacts/ContactsScreen.tsx`](../../src/app/screens/contacts/ContactsScreen.tsx) |

## 10. Integration Matrix

| Capability A | Depends on | API/service/file | Risk if broken | Evidence |
| --- | --- | --- | --- | --- |
| Demo shell | Demo store | [`src/app/state/demoStore.tsx`](../../src/app/state/demoStore.tsx) | All screen context becomes unreliable | [`src/app/components/demo/DemoTopBar.tsx`](../../src/app/components/demo/DemoTopBar.tsx) |
| Navigation | Demo sync | [`src/app/components/demo/DemoNavigationSync.tsx`](../../src/app/components/demo/DemoNavigationSync.tsx) | Screen resets stop matching shell state | [`src/app/App.tsx`](../../src/app/App.tsx) |
| Pre-login | Localization | [`src/app/contexts/LanguageContext.tsx`](../../src/app/contexts/LanguageContext.tsx) | User-facing copy degrades to raw keys | [`src/app/components/PreLoginScreen.tsx`](../../src/app/components/PreLoginScreen.tsx) |
| Pre-login | Product config | [`src/app/config/productConfig.ts`](../../src/app/config/productConfig.ts) | Accordion content disappears or drifts | [`src/app/components/PreLoginScreen.tsx`](../../src/app/components/PreLoginScreen.tsx) |
| Co-Apping | Country availability | [`src/app/utils/coAppingAvailability.ts`](../../src/app/utils/coAppingAvailability.ts) | Unsupported countries may show invalid flows | [`src/app/App.tsx`](../../src/app/App.tsx) |
| Home dashboard | Product mock dataset | [`src/data/products.ts`](../../src/data/products.ts) | Main financial view collapses | [`src/hooks/useProducts.tsx`](../../src/hooks/useProducts.tsx) |
| Home dashboard | Feature resolver | [`src/app/state/featureResolver.ts`](../../src/app/state/featureResolver.ts) | Release/flag storytelling breaks | [`src/app/screens/home/HomeScreen.tsx`](../../src/app/screens/home/HomeScreen.tsx) |
| More section | Country card config | [`src/app/config/moreCardsConfig.ts`](../../src/app/config/moreCardsConfig.ts) | Market-specific menus drift | [`src/app/screens/more/MoreScreen.tsx`](../../src/app/screens/more/MoreScreen.tsx) |
| Contacts -> Prime | callback linkage | [`src/app/App.tsx`](../../src/app/App.tsx) | Cross-screen advisor journey breaks | [`src/app/screens/contacts/ContactsScreen.tsx`](../../src/app/screens/contacts/ContactsScreen.tsx) |
| Visual system | Figma asset resolver | [`vite.config.ts`](../../vite.config.ts), [`src/vite-env.d.ts`](../../src/vite-env.d.ts) | Screens lose rendered images/assets | [`src/assets`](../../src/assets), [`src/imports`](../../src/imports) |

Highlighted bottlenecks and drift:

- Duplicate truth authorities: translation policy lives in [`guidelines.md`](../../guidelines.md), but active text still lives directly in components such as [`src/app/screens/contacts/ContactsScreen.tsx`](../../src/app/screens/contacts/ContactsScreen.tsx).
- Orphaned/dormant areas: [`src/app/screens/home/QuickActions.tsx`](../../src/app/screens/home/QuickActions.tsx), [`src/app/screens/home/TransactionsPreview.tsx`](../../src/app/screens/home/TransactionsPreview.tsx), [`src/app/components/CoAppingHomePage.tsx`](../../src/app/components/CoAppingHomePage.tsx), and much of [`src/imports`](../../src/imports) are not wired into the active path.
- Fixed previous type bottleneck: [`src/app/config/moreCardsConfig.ts`](../../src/app/config/moreCardsConfig.ts) now uses the official `CountryId` taxonomy alias from [`src/app/state/demoTypes.ts`](../../src/app/state/demoTypes.ts).

## 11. Data & Persistence Map

| Data object | Stored where | Class | Tenant scoped? | Exported? | Snapshot/versioned? | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Demo state (`product`, `country`, `scenario`, `designSystem`, `baseline`, `release`, `flagsByContext`) | React state in `DemoProvider` | `ephemeral` | full demo-context scoped | no | git only | [`src/app/state/demoStore.tsx`](../../src/app/state/demoStore.tsx) |
| Navigation state (`currentScreen`, history, co-apping active) | React state in `NavigationProvider` | `ephemeral` | no | no | git only | [`src/app/contexts/NavigationContext.tsx`](../../src/app/contexts/NavigationContext.tsx) |
| Translation catalog | static TS files under `src/translations` | `persistent source artifact` | country + language scoped | no runtime export | git versioned | [`src/translations`](../../src/translations) |
| Country config and currency rules | static TS registries | `persistent source artifact` | country scoped | no | git versioned | [`src/app/registry/countryConfig.ts`](../../src/app/registry/countryConfig.ts) |
| Feature metadata and release bundles | static TS registries + in-memory toggles | `mixed persistent + ephemeral` | product/country/design-system/release scoped | no | git + runtime only | [`src/app/registry/demoConfig.ts`](../../src/app/registry/demoConfig.ts), [`src/app/registry/releaseRegistry.ts`](../../src/app/registry/releaseRegistry.ts), [`src/app/state/demoStore.tsx`](../../src/app/state/demoStore.tsx) |
| Product catalog | `mockProducts` in source | `mock-driven persistent source artifact` | indirectly country-scoped after currency conversion | no | git versioned | [`src/data/products.ts`](../../src/data/products.ts), [`src/hooks/useProducts.tsx`](../../src/hooks/useProducts.tsx) |
| Transaction preview list | component-local const | `mock-driven ephemeral in module` | no | no | git versioned | [`src/app/screens/home/TransactionsPreview.tsx`](../../src/app/screens/home/TransactionsPreview.tsx) |
| Prime advisor details | translations | `placeholder persistent source artifact` | country/language scoped | no | git versioned | [`src/translations/RO/en.ts`](../../src/translations/RO/en.ts), [`src/translations/CZ/en.ts`](../../src/translations/CZ/en.ts) |
| Contacts details | component hardcoded strings | `persistent source artifact` | not really; currently mixed-country | no | git versioned | [`src/app/screens/contacts/ContactsScreen.tsx`](../../src/app/screens/contacts/ContactsScreen.tsx) |

## 12. AI/LLM Touchpoints

No AI/LLM integrations were found.

- No provider SDKs or AI-oriented scripts are declared in [`package.json`](../../package.json).
- No AI services, prompt builders, model configuration, streaming handlers, or tool-call abstractions were found under [`src`](../../src).

Status: `missing`

## 13. Design-System Usage

Observed design-system layers:

1. Tailwind CSS v4 and theme tokens. Evidence: [`src/styles/theme.css`](../../src/styles/theme.css), [`src/styles/index.css`](../../src/styles/index.css), [`postcss.config.mjs`](../../postcss.config.mjs).
2. Radix + CVA + shadcn-style primitives in [`src/app/components/ui`](../../src/app/components/ui). Evidence: [`package.json`](../../package.json), [`src/app/components/ui/button.tsx`](../../src/app/components/ui/button.tsx).
3. Bespoke app-level primitives for the actual rendered experience. Evidence: [`src/app/components/PageHeader.tsx`](../../src/app/components/PageHeader.tsx), [`src/app/components/PrimaryButton.tsx`](../../src/app/components/PrimaryButton.tsx), [`src/app/components/ui/PrimaryButton.tsx`](../../src/app/components/ui/PrimaryButton.tsx), [`src/app/components/ui/NavigationLink.tsx`](../../src/app/components/ui/NavigationLink.tsx).
4. Figma-generated SVG/image wrappers and asset imports. Evidence: [`vite.config.ts`](../../vite.config.ts), [`src/vite-env.d.ts`](../../src/vite-env.d.ts), [`src/imports`](../../src/imports).

DS drift risks:

- `button` exists both as generic [`src/app/components/ui/button.tsx`](../../src/app/components/ui/button.tsx) and as bespoke [`src/app/components/PrimaryButton.tsx`](../../src/app/components/PrimaryButton.tsx) / [`src/app/components/ui/PrimaryButton.tsx`](../../src/app/components/ui/PrimaryButton.tsx).
- Active app screens use only a tiny subset of the generic `ui/` directory; most active surfaces bypass the richer component library. Evidence: [`src/app/components/PreLoginScreen.tsx`](../../src/app/components/PreLoginScreen.tsx), [`src/app/components/PreLoginActiveScreen.tsx`](../../src/app/components/PreLoginActiveScreen.tsx), [`src/app/screens/home/HomeScreen.tsx`](../../src/app/screens/home/HomeScreen.tsx), [`src/app/screens/more/MoreScreen.tsx`](../../src/app/screens/more/MoreScreen.tsx), [`src/app/screens/contacts/ContactsScreen.tsx`](../../src/app/screens/contacts/ContactsScreen.tsx).
- Many screens hardcode typography, spacing, and SVGs inline, which weakens registry-level consistency. Evidence: [`src/app/screens/prime/PrimeScreen.tsx`](../../src/app/screens/prime/PrimeScreen.tsx), [`src/app/screens/contacts/ContactsScreen.tsx`](../../src/app/screens/contacts/ContactsScreen.tsx), [`src/app/screens/more/MoreHeader.tsx`](../../src/app/screens/more/MoreHeader.tsx).
- More cards and contacts are not translation-driven, so DS and content governance drift together. Evidence: [`src/app/screens/more/cards/ContactsCard.tsx`](../../src/app/screens/more/cards/ContactsCard.tsx), [`src/app/screens/contacts/ContactsScreen.tsx`](../../src/app/screens/contacts/ContactsScreen.tsx).

Pages/components bypassing the generic DS:

- Home, Prime, More, Contacts, PageHeader, logout dialog, terminate popup, and most panel wrappers. Evidence: [`src/app/screens`](../../src/app/screens), [`src/app/components`](../../src/app/components).

## 14. Lifecycle Completeness Audit

Legend: `I` implemented, `P` partial, `M` missing, `N/A` not meaningful for this demo object.

| Domain/object | Create | Read | Update | Delete/archive | Restore | Compare/diff | History/audit | Rollback/replay | Approval/review | Export/import | Permissions | Notifications | Automation | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Demo configuration | `I` | `I` | `I` | `P` reset only | `M` | `M` | `P` in-memory history for navigation only | `M` | `M` | `M` | `M` | `M` | `M` | [`src/app/state/demoStore.tsx`](../../src/app/state/demoStore.tsx), [`src/app/components/demo/DemoTopBar.tsx`](../../src/app/components/demo/DemoTopBar.tsx) |
| Navigation/screen state | `I` | `I` | `I` | `P` back/reset | `M` | `M` | `P` local history stack | `M` | `M` | `M` | `M` | `M` | `M` | [`src/app/contexts/NavigationContext.tsx`](../../src/app/contexts/NavigationContext.tsx) |
| Co-Apping session | `P` local code entry | `P` active flag only | `M` | `I` terminate flag | `M` | `M` | `M` | `M` | `M` | `M` | `M` | `M` | `M` | [`src/app/components/CoAppingSessionScreen.tsx`](../../src/app/components/CoAppingSessionScreen.tsx), [`src/app/components/TerminateSessionPopup.tsx`](../../src/app/components/TerminateSessionPopup.tsx) |
| Product/account objects | `M` | `I` | `M` | `M` | `M` | `M` | `M` | `M` | `M` | `M` | `M` | `M` | `M` | [`src/data/products.ts`](../../src/data/products.ts), [`src/hooks/useProducts.tsx`](../../src/hooks/useProducts.tsx) |
| More cards | `M` | `I` | `P` by country config only | `M` | `M` | `M` | `M` | `M` | `M` | `M` | `M` | `M` | `M` | [`src/app/config/moreCardsConfig.ts`](../../src/app/config/moreCardsConfig.ts), [`src/app/screens/more/MoreScreen.tsx`](../../src/app/screens/more/MoreScreen.tsx) |
| Contacts entries | `M` | `I` | `M` | `M` | `M` | `M` | `M` | `M` | `M` | `M` | `M` | `M` | `M` | [`src/app/screens/contacts/ContactsScreen.tsx`](../../src/app/screens/contacts/ContactsScreen.tsx) |
| Prime advisor/benefits | `M` | `I` | `M` | `M` | `M` | `M` | `M` | `M` | `M` | `M` | `M` | `M` | `M` | [`src/app/screens/prime/YourAdvisorTab.tsx`](../../src/app/screens/prime/YourAdvisorTab.tsx), [`src/app/screens/prime/YourBenefitsTab.tsx`](../../src/app/screens/prime/YourBenefitsTab.tsx) |

Critical lifecycle gaps:

- No domain object has persistence-backed history, permissions, export/import, or automation.
- Co-Apping has only UI-state lifecycle, not session lifecycle.
- Product, transaction, message, and contact domains are read-only mock surfaces.

## 15. Gap Analysis vs Target Platform

| Capability | Current | Target | Gap type | Gap size | Evidence | Next action |
| --- | --- | --- | --- | --- | --- | --- |
| Data layer | Static source mocks and in-memory demo state | real backend-backed domain data | `critical` | `large` | [`src/data/products.ts`](../../src/data/products.ts), [`src/app/state/demoStore.tsx`](../../src/app/state/demoStore.tsx) | Define API contracts and persistence boundaries |
| Authentication/session | Face ID animation and screen jump only | authenticated session with failure/recovery | `critical` | `large` | [`src/app/components/PreLoginActiveScreen.tsx`](../../src/app/components/PreLoginActiveScreen.tsx) | Introduce auth model and API/auth adapters |
| Feature rollout | Rich metadata, limited UI consumers | registry and UI fully aligned | `scaling` | `medium` | [`src/app/registry/featureUI.ts`](../../src/app/registry/featureUI.ts), [`src/app/screens/home/HomeScreen.tsx`](../../src/app/screens/home/HomeScreen.tsx) | Either wire dormant features or retire them |
| Localization governance | Good registry, mixed enforcement | typed, universal localization compliance | `governance` | `medium` | [`guidelines.md`](../../guidelines.md), [`src/app/screens/contacts/ContactsScreen.tsx`](../../src/app/screens/contacts/ContactsScreen.tsx) | Audit and migrate hardcoded strings |
| Routes/deep linking | internal screen state only | URL-addressable pages and shareable states | `UX` | `medium` | [`src/app/contexts/NavigationContext.tsx`](../../src/app/contexts/NavigationContext.tsx) | Decide whether to stay demo-only or add router |
| Co-Apping | country-gated UI simulation | validated collaborative workflow | `operational` | `large` | [`src/app/components/CoAppingSessionScreen.tsx`](../../src/app/components/CoAppingSessionScreen.tsx) | Define backend/session contract or mark explicitly as prototype |
| Testing and CI | build only, no lint/typecheck/test scripts | contract, component, and visual regression suite | `critical` | `large` | [`package.json`](../../package.json) | Add scripts and baseline tests |
| Design system | dual system: generic `ui/` plus bespoke/Figma wrappers | single authoritative DS | `UX` | `medium` | [`src/app/components/ui/button.tsx`](../../src/app/components/ui/button.tsx), [`src/app/components/PrimaryButton.tsx`](../../src/app/components/PrimaryButton.tsx) | Consolidate active components |
| Documentation | several stale README claims | code-aligned living architecture docs | `governance` | `medium` | [`README_NAVIGARE.md`](../../README_NAVIGARE.md), [`src/translations/README.md`](../../src/translations/README.md) | Retire or update stale docs alongside this map |

## 16. Technical Debt Register

| Debt | Area | Severity | Impact | Evidence | Suggested next action |
| --- | --- | --- | --- | --- | --- |
| Navigation docs reference inactive/old files | Docs | `high` | Misleads future contributors about active screens | [`README_NAVIGARE.md`](../../README_NAVIGARE.md), [`src/app/App.tsx`](../../src/app/App.tsx) | Rewrite old flow docs around active screen files |
| Translation README says product accordion is RS-only, code enables all countries | Docs/config drift | `high` | Product behavior and documentation disagree | [`src/translations/README.md`](../../src/translations/README.md), [`src/app/config/productConfig.ts`](../../src/app/config/productConfig.ts) | Choose the real scope and update one side |
| Translation schema drift: active home components reference keys absent from `TranslationKeys` | Typing | `high` | Typed contract no longer matches intended usage | [`src/translations/types.ts`](../../src/translations/types.ts), [`src/app/screens/home/QuickActions.tsx`](../../src/app/screens/home/QuickActions.tsx), [`src/app/screens/home/TransactionsPreview.tsx`](../../src/app/screens/home/TransactionsPreview.tsx) | Regenerate or tighten translation types |
| Generic UI library is largely unused by active screens | Design system | `medium` | DS drift and duplication | [`src/app/components/ui`](../../src/app/components/ui), [`src/app/components/PrimaryButton.tsx`](../../src/app/components/PrimaryButton.tsx) | Inventory active components and retire or adopt the generic library |
| Hardcoded English in active screens conflicts with mandatory translation rule | Localization | `high` | Country/language drift and compliance erosion | [`guidelines.md`](../../guidelines.md), [`src/app/screens/more/MoreHeader.tsx`](../../src/app/screens/more/MoreHeader.tsx), [`src/app/screens/contacts/ContactsScreen.tsx`](../../src/app/screens/contacts/ContactsScreen.tsx), [`src/app/components/LogoutConfirmDialog.tsx`](../../src/app/components/LogoutConfirmDialog.tsx) | Migrate visible strings into translation files |
| Dormant home modules and helper comments describe features not on the live page | Product/code drift | `medium` | Stakeholders may assume unsupported flows exist | [`src/app/screens/home/QuickActions.tsx`](../../src/app/screens/home/QuickActions.tsx), [`src/app/screens/home/TransactionsPreview.tsx`](../../src/app/screens/home/TransactionsPreview.tsx), [`src/app/screens/home/HomeScreen.tsx`](../../src/app/screens/home/HomeScreen.tsx) | Either wire them into home or archive them |
| Contacts content mixes country-specific data with hardcoded Czech/Romanian strings | Content | `medium` | Market correctness is weak | [`src/app/screens/contacts/ContactsScreen.tsx`](../../src/app/screens/contacts/ContactsScreen.tsx) | Move contacts to country-aware config/translation source |
| Co-Apping edge animation uses likely invalid SVG path syntax | UX | `medium` | Animation may not render consistently | [`src/app/components/EdgeLoadingAnimation.tsx`](../../src/app/components/EdgeLoadingAnimation.tsx) | Replace with valid SVG path or CSS border animation |
| No automated tests, lint, or typecheck scripts | Quality | `high` | Regressions are hard to catch | [`package.json`](../../package.json) | Add scripts before expanding scope |

## 17. Test & Evidence Coverage

| Capability | Existing tests/docs/scripts | Missing coverage | Recommended next checks | Evidence |
| --- | --- | --- | --- | --- |
| Demo control plane | Build + browser verification for control panel | no unit/integration coverage | component tests for country/scenario/release resets | [`package.json`](../../package.json), [`README.md`](../../README.md), [`src/app/components/demo/DemoFeatureSidePanel.tsx`](../../src/app/components/demo/DemoFeatureSidePanel.tsx) |
| Navigation shell | Build only | no route-state regression tests | state-machine tests for screen transitions and back stack | [`src/app/contexts/NavigationContext.tsx`](../../src/app/contexts/NavigationContext.tsx) |
| Localization | Translation docs and runtime fallback | no key completeness or hardcoded-text audit | typed key coverage and locale smoke tests | [`src/translations/README.md`](../../src/translations/README.md), [`src/app/contexts/LanguageContext.tsx`](../../src/app/contexts/LanguageContext.tsx) |
| Co-Apping | README availability doc + manual UI logic | no country gating or modal-flow tests | CZ/SK vs non-CZ/SK component tests and visual regression | [`README_CO_APPING_AVAILABILITY.md`](../../README_CO_APPING_AVAILABILITY.md), [`src/app/utils/coAppingAvailability.ts`](../../src/app/utils/coAppingAvailability.ts) |
| Home dashboard | Build only | no feature-flag contract coverage | tests for `featureResolver`, `useProducts`, and home rendering by release preview | [`src/app/state/featureResolver.ts`](../../src/app/state/featureResolver.ts), [`src/hooks/useProducts.tsx`](../../src/hooks/useProducts.tsx) |
| Prime | Translation-backed data only | no content validity or CTA behavior tests | snapshot tests for advisor/benefits tabs | [`src/app/screens/prime/PrimeScreen.tsx`](../../src/app/screens/prime/PrimeScreen.tsx) |
| More/Contacts | Build only | no card-matrix or contact-flow tests | tests per country card matrix and logout flow | [`src/app/config/moreCardsConfig.ts`](../../src/app/config/moreCardsConfig.ts), [`src/app/screens/contacts/ContactsScreen.tsx`](../../src/app/screens/contacts/ContactsScreen.tsx) |
| Design system | Theme tokens and generic ui files | no usage audit or visual consistency checks | component inventory plus screenshot coverage | [`src/styles/theme.css`](../../src/styles/theme.css), [`src/app/components/ui`](../../src/app/components/ui) |

Commands run and results during this audit:

```bash
npm run build
# passed

npm run
# only dev / build / preview scripts are available

npm ls typescript
# no top-level TypeScript CLI installed
```

Unavailable checks:

- `typecheck`: no script and no top-level `typescript` package were present. Evidence: [`package.json`](../../package.json).
- `lint`: no script present. Evidence: [`package.json`](../../package.json).
- `test`: no script or test suite present. Evidence: [`package.json`](../../package.json).

## 18. Final Diagnostic Summary

Production-like:

- The front-end shell, demo control plane, navigation state, and localized screen composition are production-like as a prototype surface. Evidence: [`src/app/App.tsx`](../../src/app/App.tsx), [`src/app/components/demo/DemoTopBar.tsx`](../../src/app/components/demo/DemoTopBar.tsx), [`src/translations/index.ts`](../../src/translations/index.ts).

Mock/demo-driven:

- Home financial data, contacts, Prime advisor details, logout/session state, and most feature flags are mock/demo-driven. Evidence: [`src/data/products.ts`](../../src/data/products.ts), [`src/app/screens/contacts/ContactsScreen.tsx`](../../src/app/screens/contacts/ContactsScreen.tsx), [`src/translations/RO/en.ts`](../../src/translations/RO/en.ts), [`src/app/screens/home/HomeScreen.tsx`](../../src/app/screens/home/HomeScreen.tsx).

Strategically core:

- Demo control plane
- Localization/country policy
- Navigation/mobile frame
- Pre-login/Co-Apping walkthrough
- Home financial summary shell

Fix first:

1. Decide whether this repo remains an interactive prototype or grows into a real platform.
2. Align docs with active code paths.
3. Reconcile translation policy with actual hardcoded strings.
4. Either mount or retire dormant home features.
5. Add minimal automated checks.

Document next:

1. Feature-flag truth table: configured vs actually rendered.
2. Country matrix: all page-level differences across RO/CZ/SK/HU/RS/BA/SI.
3. Static data ownership: which placeholders are approved for demo use.
4. Active vs archived Figma export inventory.
5. Expected lifecycle if the app graduates from demo to product.

Recommended next 5 goals:

1. Add `typecheck`, `lint`, and `test` scripts.
2. Replace or archive stale docs (`README_NAVIGARE.md`, translation migration notes).
3. Move active hardcoded strings into the translation registry.
4. Create a single active home composition and remove dormant modules or wire them in.
5. Define whether APIs/persistence will be added; if not, label the repo explicitly as demo-only in the root README.
