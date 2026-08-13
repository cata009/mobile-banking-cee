# App 2027 Mobile PI Homepage - Design Specification

## Objective

Create a global Mobile PI `App 2027` future preview by inheriting the existing `CZ - Robo` preview and changing only the authenticated Homepage. The Homepage must cover the consolidated CEE Home requirements without rendering one permanent card per requirement, preserve the existing CZ Robo journey in Czech context, support light/dark semantic theming, and demonstrate true adaptive recomposition across compact, regular, fold-open portrait, and fold-open landscape viewports.

## Product principles

1. **Money now comes first.** Show available balance, clearly labelled wealth, privacy control, and owned products before commercial content.
2. **Order complexity instead of hiding it.** A single ranked feed replaces stacks of country banners: security/service, action required, financial insight, owned-product status, then commercial relevance.
3. **One useful commercial moment.** Cross-sell uses one eligible, contextual, dismissible slot with a clear benefit and deep link.
4. **Personalisation belongs to the client.** Bank defaults apply until the client reorders modules or favourites; `Reset to default` is the only way to restore them.
5. **Global shell, local availability.** Country, customer holdings, eligibility, currency, copy, and services determine what appears.
6. **Adaptive, not scaled.** Compact view reduces structural space and visible candidates, never touch target or essential text size. Wide layouts recompose to two panes.

## Information architecture

### 1. Compact identity rail

- Contextual greeting and customer name; release/version metadata stays in the stakeholder toolbar, never in customer UI.
- Amount privacy, inbox, and profile remain accessible through 44px targets.
- On compact-height displays, the greeting descriptor collapses but the customer's name remains. There is no duplicated large title.

### 2. Financial overview

- `Available now`: liquid balance used for day-to-day decisions.
- `Total wealth`: owned assets including Investments, explicitly separated from available balance and debt.
- `Investments`: separately labelled so Hungary's wealth requirement and Romania's non-investment financial view are both unambiguous.
- Amount privacy masks all three plus monetary values surfaced in contextual obligations.

### 3. Quick actions

- Four visible 44–48px actions: New payment, Scan & pay, Transfer, and a configurable fourth default.
- `Edit` entry demonstrates customer control; country/product eligibility governs the catalogue.
- This unifies CZ/SK customisation, Hungary's prominent configurable action, and Serbia's Quick Menu.

### 4. Today

A maximum of three high-value items in the feed:

- upcoming payment or account obligation;
- spending/cash-flow insight with an explanation and Analytics deep link;
- action required such as a requested document or mortgage status.

Security and service alerts render in a dedicated priority layer and never compete with marketing. Compact-height mode exposes one complete highest-priority item and progressively discloses the remainder.

### 5. Products

- Compact owned-product groups for Accounts, Cards, Savings, Loans/Mortgages, and Investments.
- Product rows use real country-aware holdings and product names; sensitive identifiers are not introduced on Home.
- The existing Czech Investment goals entry remains available in Czech `App 2027`; it is not globalised.

### 6. Next for you

- A single contextual offer/reward/referral card.
- Must support eligibility, consent, frequency capping, dismissal, and a useful explanation.
- Never appears above security or an action-required item.

### 7. Services

- Compact lower-page Government services module in eligible markets.
- Common help entry supports chatbot/advisor/co-apping states without multiple launchers.

## Adaptive compositions

| Preview | Logical viewport | Composition |
|---|---:|---|
| iPhone 17 Pro Max | 430 × 932 | One column, comfortable spacing, 4 favourites, full high-priority feed. |
| Galaxy Z Fold8 - closed | 390 × 624 | Official 10:16 reference. Short, wide, one-column composition with touch-safe actions and a strict first-scroll information budget. |
| Galaxy Z Fold8 - open | 840 × 630 | Official 4:3 reference. Two-pane 60/40: money/products left; priorities/insight/offer right. |
| Galaxy Z Fold8 - rotated | 630 × 840 | Same real viewport rotated; returns to a narrow/medium composition without state loss. |
| Apple passport concept - closed | 390 × 573 | Research-derived short/wide ratio, clearly marked concept; most demanding closed-state height. |
| Apple passport concept - open | 848 × 600 | Research-derived passport ratio; two-pane composition and controlled widths. |

The selector changes the actual logical viewport. Rotation swaps width and height; it is not a CSS transform. Fold8 uses Samsung's official 10:16 closed and 4:3 open proportions. Apple passport profiles are explicitly labelled concept because Apple has not announced the device. Only App 2027 Homepage is adaptively recomposed and verified in this slice; no completeness claim is made for legacy screens shown under the simulator.

## Theme and accessibility contract

- Use semantic design tokens only for foregrounds, backgrounds, borders, states, and charts.
- In light mode, Home uses the same neutral structural canvas as the App 2027 Spending, Payments, Products, and More destinations. A Home theme may provide only low-opacity decorative atmosphere above that canvas; it must not introduce a warm/yellow page background or change navigation material.
- Light/dark are deliberate palettes; optional visual themes may change decorative accents but not financial/status semantics.
- Touch targets remain at least 44px; keyboard focus and visible focus rings remain intact.
- Layout must tolerate large text and avoid horizontal overflow.
- Balance privacy and screen-sharing sensitivity remain visible product requirements.

## Benchmark synthesis

- Adopt Revolut's clear money overview, quick access, and configurable widgets without reproducing its visual language or product sprawl.
- Adopt Monzo's client-controlled Home ordering, unified activity, upcoming payments, and concise spotlights; avoid overwhelming initial concepts and preserve core banking jobs.
- Adopt N26's at-a-glance budgeting/goal cues, but keep deep analytics in Analytics rather than turning Home into a report.
- Adopt mature-bank trust patterns: explicit labels, next-best-action guidance, advisor/help access, and strong security/service hierarchy.
- UniCredit differentiation: `Quiet Confidence` - cold-neutral surfaces, graphite typography, one controlled red primary moment, transparent balance semantics, a governed commercial slot, and graceful multi-country/foldable composition.

Primary benchmark references:

- Revolut 10: https://www.revolut.com/blog/post/revolut-10/
- Revolut 10 launch: https://www.revolut.com/news/revolut_launches_revolut_10_as_it_targets_primary_accounts_and_passes_35m_customers_worldwide/
- Monzo new Home: https://monzo.com/blog/the-new-and-improved-home-screen
- Monzo unified activity: https://monzo.com/blog/how-we-unified-our-customers-activity-on-the-new-home-screen
- N26 product overview: https://n26.com/en-eu/
- N26 controls: https://n26.com/en-eu/blog/new-in-n26-more-control
- Bank of America Erica: https://info.bankofamerica.com/en/digital-banking/erica
- Android window size classes: https://developer.android.com/develop/adaptive-apps/guides/use-window-size-classes
- Apple layout guidance: https://developer.apple.com/design/human-interface-guidelines/layout

## Release isolation

- New release: `release-future-app-2027`, label `App 2027`.
- New global PI/current-DS feature: `fx_app2027Homepage`.
- Bundle preserves `fx_czRoboAdvisor`; its country scope remains CZ.
- Baseline, CZ Chatbot, and original CZ Robo appearances remain unchanged.
- Only `HomeScreen` branches to the new composition; other L1 and detailed journeys are unchanged.

## Verification

- Unit/registry tests for release selection and isolation.
- Home tests for financial labels, privacy, favourites, priority ordering, all-country currency data, dark mode token usage, and adaptive DOM contract.
- Mobile-frame tests for each logical viewport and rotation.
- Browser QA at regular, passport closed, passport open, rotated, and dark states, checking overflow, touch sizes, visible hierarchy, and continuity.

## Compact contextual carousel refinement

- Position the contextual carousel directly after quick actions and before owned-product groups in the compact Home sequence.
- Render each item as one fully clickable compact card, approximately 104--112px high on standard phones. The card does not expose a separate `Review payment`, `View spending`, or equivalent textual CTA; its existing destination is activated by pressing the item itself.
- Keep data-driven ordering, horizontal swipe, snap behavior, visible adjacent-card affordance, dismiss control, keyboard focus, and direct existing destinations.
- Do not auto-advance financial context. Carousel progression is deliberate through swipe, drag, keyboard scroll, or a direct press on the current item.
- Cards contain only: compact semantic label, one-line decision title, optional single-line supporting text when height permits, and a right-aligned status/signal. Decorative cover/orbit treatments are removed.

## Known non-goals for this slice

- No global L1 navigation taxonomy change, despite the CZ/SK request for a dedicated Investments tab.
- No full personalisation persistence backend.
- No server-driven CRM, eligibility, or frequency-capping backend; the prototype demonstrates their governed UI contract.
- No separate Kids Homepage redesign.
- No claim that an Apple foldable or `iPhone Ultra` is announced hardware; the selector labels it as a foldable concept.
