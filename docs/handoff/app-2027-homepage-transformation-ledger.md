# App 2027 Homepage - Transformation Ledger

Status: implemented prototype; focused verification green, full gate pending
Baseline: `PI / CZ / current DS / release-future-cz-robo / homepage`
Target: `PI / all supported CEE countries / current DS / release-future-app-2027 / homepage`

This file records the transformation while it is being built. It will be restructured into the stakeholder template supplied later. It is not the final stakeholder document.

## Traceability contract

Every material transformation records:

- baseline and target state;
- original requirement IDs/countries;
- benchmark or research rationale;
- reused versus newly introduced data;
- interaction/component behavior;
- country, eligibility, viewport, orientation, and theme rules;
- accessibility and privacy implications;
- prototype versus production-service responsibility;
- implementation files and verification evidence.

## Decision ledger

### T-011 - Transformation visual and interaction refinement

- Target: preserve the Future App shell while correcting only Home content between product tabs and the glass bottom navigation.
- Change: exact Figma cactus, house, and umbrella art replace summary glyph substitutes. Their bounded right-side artwork slots retain left-aligned text with no clipping. For your interest and ShopSmart now use the shared drag/snap carousel mechanism with active keyboard-selectable pagination.
- Interaction: QR actions enter existing Payments; Card Details and Card Options enter matching routes. Block/PIN retain the existing Card Options entry until dedicated flows exist.
- Theme/privacy: additions use the existing semantic theme tokens; deposit and loan amounts use the shared privacy renderer.
- Evidence: typecheck, focused App 2027 tests (`6/6`), targeted ESLint, and localhost HTTP `200` pass on 2026-08-13.
- Limitation: in-app browser automation could not reload localhost because its URL policy rejected the request. Repeat the light/dark/narrow visual smoke in a permitted browser session before sign-off.

### T-001 - Isolated global future release

- Baseline: `CZ - Robo` is a Czech-only future preview. Some existing Home and Investments behaviors were coupled to its exact release ID.
- Target: a separate global PI/current-DS release, `App 2027`, with a dedicated Homepage feature. The Czech Robo capability is inherited only where its existing CZ eligibility remains true.
- Why: the common Home shell must roll out across CEE without leaking Czech Robo fixtures or behavior into another market.
- Configuration: new `release-future-app-2027` and `fx_app2027Homepage`; no new customer data.
- Isolation: baseline, CZ Chatbot, and original CZ Robo retain their existing Home composition.
- Status: implemented and covered by registry/top-bar tests.

### T-002 - From product accordion to decision-oriented Home

- Baseline: duplicated Home title/header, a large total available/owed block, then product-category accordions. Favourites, a ranked context feed, an upcoming obligation, and a governed offer surface were not mounted.
- Target: compact identity rail; clearly separated `Available now`, `Total wealth`, and `Investments`; editable quick actions; ranked `Today`; direct owned-product access; and one commercial moment after client utility.
- Requirements: #2 CZ+SK; #15 HU; Homepage fragments of #18 HU and #29 RO; #61 RS. Conditional inputs include #5, #6, #12/#23/#52, #14/#51, #17/#34/#62/#68/#85, #31/#59, #32, #44/#79, #60/#64.
- Conflict resolution: Hungary's wealth including Investments and Romania's non-investment financial view are expressed as separately labelled values, not one ambiguous universal total.
- Status: implemented; the first presentation treatment was rejected and replaced under T-007.

### T-003 - One personalization model

- Baseline: category accordions keep local expanded state; there is no Home-level favourites/order model.
- Target: bank-supplied default quick actions with a visible `Edit` affordance. `Edit` opens a real `Personalise Home` bottom sheet; each action can move forward in the order and `Save changes` closes the sheet with the new session order retained.
- Requirements unified: #2 CZ+SK, #18 HU, #61 RS.
- Prototype boundary: deterministic defaults and an interactive session-level reorder are demonstrated. A complete action catalogue, persistence across reload/device, reset governance, and server-driven country eligibility remain production responsibilities.
- Status: functional in the prototype; durable persistence deliberately not invented.

### T-004 - Ranked content and cross-sell governance

- Baseline: an optional generic unplanned banner can appear after account sections; explicit competition rules do not exist.
- Target order: `security/service > action required > financial insight > owned-product status > commercial`.
- Requirements unified: CRM #1/#9/#63; offers/rewards #17/#34/#62/#68/#85; fraud #32; documents #31/#59; PFM #6/#44/#79.
- Commercial contract: exactly one contextual, dismissible offer slot after client utility content. It never competes with balance, security, or a due task.
- New content: deterministic prototype items. Real eligibility, consent, frequency capping, dismissal persistence, and attribution require services/configuration.
- Today consistency: mortgage due, spending insight, and savings progress use the same `ContextRow` geometry, label/title hierarchy, 44px icon well, divider, chevron, and full-row action. Difference is expressed only through content and priority semantics, not three unrelated card styles.
- Status: ordering and one-slot constraint implemented.

### T-005 - True adaptive device preview

- Baseline: the desktop preview always authored at 375x812 and changed only visual scale.
- Target: the selector changes the real logical viewport. Rotate swaps logical width/height; it does not rotate a screenshot or scale a 375px canvas.
- Profiles:
  - iPhone 17 Pro Max: 430x932, official Apple device reference;
  - Galaxy Z Fold8 closed: 390x624, official Samsung 10:16 display ratio reference;
  - Galaxy Z Fold8 open: 840x630, official Samsung 4:3 display ratio reference;
  - Apple passport concept closed: 390x573, research-derived stress profile, explicitly non-official;
  - Apple passport concept open: 848x600, research-derived stress profile, explicitly non-official.
- Correction: the earlier 345x750 exploratory fold profile was rejected because it represented a tall Ultra-like phone, not the short/passport scenario requested.
- User evidence: the supplied research reports repeated 5.3-5.5-inch outer and 7.7-7.8-inch inner ranges, physical estimates around 120.6x85-86 mm closed and 120.6x167.6 mm open, and a short viewport estimate near 390x585. These support a stress-test concept but are not treated as Apple facts.
- Compact-height rule: at 650px high or below and below the wide breakpoint, Home removes structural labels/detail and reduces gaps, not type or touch targets. Order becomes financial ribbon, four actions, one complete priority, then the start of Products.
- Wide rule: at 600px or wider, Home recomposes into true panes. The normal open composition is 60/40: left contains money, actions, and products; right contains Today and the governed offer.
- Transitional rule: 600-679px uses a dedicated 1.15/0.85 two-pane composition with 16px gutters/gap and 20px vertical rhythm. This prevents a rotated/open foldable around 600px wide from falling back to one elongated feed or forcing the full-width proportions into an undersized canvas.
- Scope note: selected dimensions apply to the shared simulator. Only App 2027 Homepage is intentionally recomposed and browser-QA'd in this slice; other screens must not be reported as adaptively complete.
- Status: implemented and inspected closed, open, rotated, and regular.

### T-006 - Theme-ready semantic styling

- Baseline: global light/dark tokens already exist; the existing Home also contains fixed visual compositions and decorative imagery.
- Target: the new Home consumes semantic theme tokens for surfaces, borders, foregrounds, states, and brand accent. Optional future themes may change decoration, never financial or status meaning.
- Requirement: #4 CZ+SK plus the explicit user direction for dark mode/theme readiness.
- Status: implemented and inspected in light/dark; dark QA covers hierarchy, borders, modal sheets, icons, navigation, and semantic red usage rather than an automatic colour inversion claim.

### T-007 - Visual reset after stakeholder rejection

- Rejected state: the first implementation used a dark financial hero, red/teal decorative circles, three elevated pastel priority cards, nested white containers, heavy shadows, filled custom glyphs, and a visible `APP 2027` prototype label. On the Apple passport closed profile, almost the entire first viewport was container chrome. Two metrics also inherited dark text on the dark hero, producing a real contrast defect.
- Feedback: the information logic was not rejected. The visual result was described as monstrous, sinister, and impossible to present. The stakeholder explicitly requested severe polish and systematic consistency across spacing, buttons, type hierarchy, and repeated elements.
- Decision: discard the presentation shell instead of cosmetically restyling it. Preserve release/configuration, data derivation, routing callbacks, priority logic, country rules, and adaptive architecture.
- Replacement direction: `UniCredit Quiet Confidence`. Cold-neutral surfaces, graphite typography, one controlled UniCredit-red accent, almost-flat elevation, one compact financial ribbon, one outline icon family, sparse dividers, and progressive disclosure for short viewports.
- Header: removed release metadata and the prototype diamond from customer UI. Replaced three 32px filled glyphs with two 44px outline utilities and one 44px initials target. Compact-height hides only the greeting descriptor; customer name remains.
- Financial area: replaced the black promotional-looking hero with a semantic surface, a 1px border, an 18px signature radius, one 3px UniCredit-red balance marker, a 30px tabular amount, and a divided secondary wealth/investment row. No decorative blob, gradient, glow, or section-level theme inversion remains.
- Iconography: the accepted implementation uses the project's UniCredit `AppIcon` registry, including navigation, QR, transfer, amount visibility, message, information, chevron, close, and product-specific assets. Direct one-off Lucide imports were removed from the Homepage so visual language and future DS replacement remain centrally governable.
- Quick actions: four equal actions use registered UniCredit glyphs. Only `New payment` receives the red primary 48px circle. Other targets use identical 48px bordered circles. Every label shares 12px/700 styling.
- Today: passport closed renders one complete `Due tomorrow` item. Spending and goal items remain in the scroll flow on regular phones and in the supporting pane on wide screens. Repeated items use one component and one hierarchy.
- Products: replaced card-per-category tiles with one quiet list surface, 44px icon wells, and sparse hairlines. Each owned product opens its real product/account/investment destination directly. `Show all N products` expands the list in place and changes to `Show fewer products`; it does not redirect to the acquisition-oriented Product shelf. Czech `Investment goals` remains gated by CZ plus an owned investment product.
- Cross-sell: replaced a saturated banner with one low-chroma native slot after utility content. It has one action, one dismiss control, and never appears above a due item.
- Simulator control: moved the device selector from a floating grey-canvas overlay into the stakeholder top bar because visual QA at a 1021px desktop width found the control could overlap the physical device frame.
- Status: implemented after rejection and reviewed in light, dark, closed, open, and rotated states.

### T-008 - Interaction integrity before decorative breadth

- `Everyday money` is now a plain context label, not a false dropdown. The adjacent registered information action opens `Your financial picture`, which explains `Available now`, `Total wealth`, and `Investments` in one bottom sheet.
- `Edit` is not a dead link: it opens the functional session-level personalisation sheet described in T-003.
- Every visible Today row has one meaningful destination: mortgage to its product, Spending to Analytics, and Savings goal to its owned saving product.
- Every visible product row opens that product directly. The only list-level control expands/collapses the owned-product list in place.
- Bottom navigation keeps the existing Level 1 destinations; Home remains selected and the other four tabs call their existing routes.
- Status: implemented and covered by the focused interaction/routing set.

### T-009 - Services withheld until a real journey exists

- Earlier concept notes proposed a lower `Services` block for Government services and help/advisor/co-apping entry points.
- Decision: remove the block from the current Homepage because no approved end-to-end destination and eligibility contract was available. A visually complete dead-end launcher would overstate capability and repeat the exact failure mode identified in stakeholder review.
- Re-entry condition: add a service only when its country eligibility, label, destination, Back behavior, unavailable/error state, and analytics ownership are defined and demonstrable.
- Status: intentionally absent; tracked as future product work, not a missing polish item.

### T-010 - Neutral light canvas and compact direct-action context rail

- Baseline: light Home defined a separate warm `#f3efea` canvas and warm navigation material, while App 2027 Spending/Payments/Products/More use the shared neutral light palette. The contextual rail followed product groups and used 206px decorative cards with a second text CTA such as `Review payment`.
- Target: Home light mode inherits the same neutral `--uc-neutral-100` canvas and `--uc-neutral-white` surface/navigation base as its L1 siblings. Optional Home themes remain only a low-opacity atmosphere; they do not recolor the structural page or navigation background.
- Context rail: the data-driven, manually swiped rail appears immediately after quick actions and before owned product groups. Cards are 104px logical-height direct-action surfaces with label, decision title, and a compact supporting line; the whole card opens its established destination. The dismiss target remains separate and at least 44px.
- Interaction correction: mouse pointer-down no longer cancels the following click. Dragging beyond the existing movement threshold still suppresses navigation, while a normal desktop click, touch press, or keyboard activation reaches the card's native button.
- Evidence: focused Home regression test `11/11`; focused ESLint; browser on port `4004` confirmed the neutral Home/Spending `rgb(245,245,245)` canvas, card height/placement, absence of `Review payment`, next-card affordance, and direct navigation to the existing mortgage detail.
- Limitation: context ranking, payment due, offers, and dismissals remain deterministic prototype state; production needs schedule, eligibility, consent, frequency, persistence, and analytics contracts.

### T-011 - HP transformation tabs and fixed shell

- Source of truth: Figma HP frames `2027 - transformation 1` through `4` (`23968:242772`, `23968:245630`, `23968:247589`, `23968:255157`).
- Decision: keep the existing Evo/App 2027 global header and glass navigation untouched. Replace only the content beginning with the product chips.
- Result: Accounts reuses Baseline-style expandable headings plus CZ Robo account/cards; Savings/Credits/Insurance have dedicated summaries and ordered owned-product sections. Missing holdings use the shared `GhostBanner` acquisition pattern. The existing data model remains authoritative for owned product totals and privacy masking.
- Prototype boundary: insurance policies and term/loan lifecycle fields are deterministic presentation metadata. Existing card actions currently enter the established card detail journey rather than inventing new card-management routes.

## Visual grammar

| Role | Contract | Reason |
|---|---|---|
| Spacing | 4px base; main rhythm 4 / 8 / 12 / 16 / 20 / 24 | 1-2px is reserved for optical alignment inside a component, never section spacing. |
| Page gutter | 16px compact, fluid to 24px | Header and scroll content share the same gutter. |
| Touch target | 44px minimum | Compact height never reduces interaction size. |
| Quick-action visual | 48px circle | All four actions share geometry and baseline. |
| Primary surface | 16px radius | Context, product list, commercial, services. |
| Financial surface | 18px radius | Deliberately unique because it is the top-level financial canvas. |
| Icon well | 44px with 12px radius | Shared by context, product, and service patterns. |
| Registered icon | 19-21px for utilities/actions; product artwork may use 28px | Every Homepage glyph resolves through `AppIcon` or the existing product-icon authority; no page-local icon set. |
| Metadata | 12px regular / 15px line | Balance labels, due date, product count. |
| Action text | 12-13px bold | 12px for quick actions; 13px for text controls. |
| Product row title | 14px bold | Browse-level information. |
| Context row title | 15px bold | Higher decision priority. |
| Section title | 18px / 22px / 700 | One shared `SectionTitle` implementation owns every instance. |
| Customer name | 22px / 25px / 700; 20px compact | Descriptor may collapse, identity does not. |
| Primary amount | 30px / 34px / 700, tabular; 26px compact | Largest customer datum, never decorative display type. |
| Motion | 180-240ms transform/color feedback | No bounce, perpetual motion, parallax, or decorative animation. |

Repeated hierarchy is structurally enforced through `SectionTitle`, `IconButton`, `Favourite`, `ContextRow`, `ProductRow`, `ServiceButton`, and `App2027BottomNavigation`. This avoids local one-off styling drift.

## Data inventory

| Data | Authority | Target use | Prototype/production status |
|---|---|---|---|
| Country, currency, product counts | Existing DemoState and registries | All financial/product modules | Reused demo source of truth |
| Amount privacy | Existing DemoState | Available, wealth, investments, mortgage sample | Reused functional global state |
| Available balance | Existing `useProducts` calculation | Primary financial amount | Reused/derived |
| Wealth | Existing owned-product balances | Secondary labelled metric | UI-derived; inclusion formula needs business sign-off |
| Investments | Existing investment product balances | Secondary labelled metric | Reused/derived |
| Quick actions | Deterministic default + component session state | Four Home actions and interactive reorder sheet | Prototype; production catalogue/durable persistence required |
| Mortgage due | Deterministic sample | First `Today` item | Mock; production planned-payment source required |
| Spending insight | Deterministic sample | Secondary `Today` item | Mock; Meniga/PFM source required |
| Savings goal | Deterministic sample | Secondary `Today` item | Mock; saving-goal source required |
| Offer | Deterministic sample | One commercial slot | Mock; CRM eligibility/consent/frequency required |
| Government services | Consolidated requirement register only | Not rendered until a real journey exists | Explicitly withheld; eligibility/destination/backend required |

## Implementation map

- Release and feature sources: `src/app/state/demoTypes.ts`, `src/app/state/featureHelpers.ts`, `src/app/registry/demoConfig.ts`, `src/app/registry/releaseRegistry.ts`, related manifest/project/UI registries, `src/app/components/demo/DemoTopBar.tsx`.
- Homepage branch: `src/app/screens/home/HomeScreen.tsx`.
- App 2027 presentation/data derivation: `src/app/screens/home/App2027HomeScreen.tsx`.
- Logical simulator: `src/app/components/demo/DevicePreview.tsx`, `src/app/components/demo/DemoShell.tsx`, `src/app/components/MobileFrame.tsx`.
- Responsive rules: `src/styles/index.css`.
- Czech Robo flag correctness: `src/app/screens/investments/InvestmentsPortfolioScreen.tsx`.
- Automated evidence: `tests/screens/app-2027-homepage.test.tsx`, `tests/screens/app-2027-home-routing.test.tsx`, `tests/components/device-preview.test.tsx`, `tests/components/demo-top-bar.test.tsx`, `tests/registry/core-registry-contracts.test.ts`.

## Verification evidence

- Focused Home verification is green after T-010: `npm test -- tests/screens/app-2027-homepage.test.tsx` passes `11/11`, and focused ESLint passes for the changed Home screen/test.
- `npm run typecheck` was attempted on 2026-08-12 and is currently blocked by existing errors in `AccountDetailScreen.tsx`, `App2027ProductAccordions.tsx`, and `App2027ThemePicker.tsx`; no App2027HomeScreen error remains in that output.
- Focused verification is green: `16/16` for the current App 2027 release/Home/device and interaction contract. This includes functional balance/personalisation sheets, uniform Today rows, in-place product expansion/direct routing, registered icon usage, and adaptive composition boundaries.
- Live local browser QA covers regular, Fold8/Apple concept closed, open, rotate, and dark states. The wide view uses two panes; the 600-679px transitional composition and compact-height progressive disclosure are intentional, separate modes.
- Browser screenshots were inspected from the authenticated live Vite app, not a standalone mock.
- Full `npm run verify` remains pending. No full-suite/lint/audit/build success is claimed here until that command completes.

## Current limitations

- `Edit` reorders the four demonstrated actions in the current session, but does not yet expose the final country-aware catalogue or persist across reload/device.
- Mortgage, spending, savings-goal, and offer content are deterministic samples. Currency and owned-product metrics use the existing model.
- Cross-sell eligibility, consent, attribution, frequency, and persisted dismissal require production services.
- The balance explanation sheet describes the current prototype formula; inclusion rules, debt treatment, FX valuation time, and market-specific terminology require Business/Legal sign-off.
- Government/help/advisor service launchers are intentionally absent until real journeys and country eligibility are specified.
- Apple passport dimensions are labelled concept and must not be presented as Apple specifications.
- The simulator can apply a logical viewport to any screen, but only App 2027 Homepage has been intentionally recomposed and visually validated here.
- Full-suite, lint, audits, build, final console, and final overflow evidence are appended only after the final verification pass; no success is claimed in advance.
