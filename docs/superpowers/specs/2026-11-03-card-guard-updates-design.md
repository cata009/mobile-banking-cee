# Card guard follow-up design

## Intent

Update the BA Card guard demo from stakeholder feedback so customers understand an authorised payment that is awaiting settlement, explicitly choose card blocking, see a dispute action only for a booked payment, and can choose whether to start a virtual-card flow after a successful fraud report.

## Scope and constraints

- Keep the existing `ba-card-fraud` Flow ID, existing screen IDs, scenario IDs and scenario order. Add a status-aware transaction next-step screen and the post-submission virtual-card entry/issue screens.
- Keep executable rules in `src/features/cards/fraud/model.ts`; Flow metadata remains UI-runtime-free.
- Keep `Pending` semantics in the transaction model. Replace the ambiguous display copy in this flow with settlement language and an explanatory sentence; do not change unrelated transaction screens.
- Freeze the card only after successful submission when the customer explicitly chose the combined unrecognised-payment/block-card action. Failed submission and navigation do not freeze it.
- Offer `Open dispute` only when the selected payment is booked. Pending and declined activity stays on the fraud-report path.
- Ask about a virtual card only after a successful submission. The yes path reuses the existing Native virtual-card issue flow in this deterministic demo; bank availability and eligibility by country remain production questions.
- Remove the extra `Card security` row added to Card options while preserving its existing Block Card and replacement routes.
- The current checkout has no navigable destination behind its `CARD LIMITS` row. The user left the UI choice to the implementer. Use a dedicated Native Card security sub-screen composed from existing baseline rows, toggles and page shell; enter it from the card-level Block Card action and the flow's protection action. Remove the added Card security row from Card options and leave the unrelated Card limits row unchanged.
- Preserve existing operator edits, Native DOM/layout contracts, normal baseline behavior, source exports and ZIP exports. No deployment or publication.

## Chosen approach

Make flow-scoped presentation changes through the existing Native preview contracts, and keep fraud/report/dispute/block behavior in the fraud feature model. Compose the Card security sub-screen with approved Native baseline primitives and connect its controls to the fraud feature model through a typed preview event. Reuse the existing virtual-card issue composition through an explicit Card guard preview route. This keeps normal baseline screens unchanged and keeps the cross-country product uncertainty visible in the flow specification.

## Interface sources

- Canonical Design System library: `FKbbStgBIP9bFAMl3DPKHF`.
- Native implementations used: `native-spike/src/universal/BaselineNavigationRow.tsx`, `native-spike/src/universal/BaselineSectionDivider.tsx`, `native-spike/src/universal/ToggleButton.tsx`, and the existing page shell in `native-spike/src/experiences/pi/current/baseline/CardInfo.tsx`.
- The toggle's verified source nodes are checked `1027:2244` and unchecked `1026:6765`, as recorded in `src/app/components/contracts/toggleButton.ts`.
- The checkout has no standalone Card security screen mapping behind Card Limits; this sub-screen is a composition of the Native baseline implementations above, not a claim that a separate Figma screen/component already exists.

## Acceptance

1. The activity list and transaction details explain that an authorised payment is waiting for merchant settlement and that settlement debits the account.
2. The Card guard report action states that it also blocks the card; the card remains active until submission succeeds.
3. All explicit block choices open a status-aware next-step screen. A booked transaction offers `Open dispute`; pending and declined activity show `Continue report` and never show `Open dispute`.
4. The successful receipt asks whether the customer wants a virtual card, with working yes/no choices and a separate route to track the case.
5. Card options no longer displays the additional Card security entry introduced for this flow; the original card protection action remains available.
6. The extra Card security row is removed from Card options; the Native Card security sub-screen remains reachable from the card-level protection action and stays controlled by the fraud feature model.

## Market questions retained in the specification

The BA demo's virtual-card issue route is illustrative. Confirm product availability, eligibility and behavior while the physical card is frozen with the Bosnia product owner before treating the concept as production policy.
