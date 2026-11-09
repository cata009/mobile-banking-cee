# Component consumption

The React Native library (`native-spike/src/universal`, driven by the shared contracts in
`src/app/components/contracts`) is the single definition of every component. The Demo, the phone
previews in Flows and the component testers in Tools consume it. This folder tracks how well that holds.

## The rule

A screen must not hand-roll a component that the library already provides. Use the library component,
or add a variant or prop to it. A local component that composes a library component of the same family
(an adapter, for example `MailboxTabs` over `BaselineMailboxTabs`) is fine.

## Measure and guard

```bash
node scripts/audit-component-consumption.mjs --list-standalone
```

Reports, per family and per area, library uses versus local look-alikes, and lists the standalone ones.
Flows and Tools use web copies of the components, so their uses are reported as "web-copy uses", never as
library uses. Evo 2027 and Italy are out of scope until scheduled (`--include-evo`, `--include-it`).

```bash
npm run audit:consumption
```

Part of `npm run audit:all`. It is a ratchet: `baseline.json` lists the standalone look-alikes accepted
today, and the check fails when a new one appears in the native demo or the phone-preview flows. Removing
entries is encouraged; after aligning components, refresh the file with
`node scripts/audit-component-consumption.mjs --write-baseline`. Flow Library chrome and Tools are admin
interfaces: reported, not enforced.

The classifier is name based, so it can be wrong. A false positive is resolved by composing the library
component, not by editing the baseline.

## Aligned so far

| Component | Now |
| --- | --- |
| Profile `Button` | library `PrimaryButton` (Figma Button: 48 high, radius 4, #007A91, Bold 18) |
| Profile `MailboxTabs` | adapter over `BaselineMailboxTabs` |
| Banking `Toggle` | library `ToggleButton` (replaces the platform `Switch`) |
| Appointment `FormCheckbox` | library `BaselineCheckbox` with `presentation="canonical"`, dark aware |
| Appointment `AppointmentSheet` (also `SelectionSheet`, `CalendarSheet`, `AccountSelectionSheet`) | library `BaselineBottomSheet` |
| `RoBaselineCategorySheet` (change category) | library `BaselineBottomSheet` with the new `fixedHeight` option (full-height panel, scrolling list, pinned action) |
| `BankingSheet` (internal transfer, schedule) | adapter over `BaselineBottomSheet`; keeps the original 16 px inset until the banking forms are reviewed |
| `BankingButton` | library `PrimaryButton` (same 48 / radius 4 / action-strong, 0.3 opacity and 18 px label when disabled) |
| Romanian profile `ConsentToggle` | library `ToggleButton`, row keeps the press and the accessible name |
| `SourceOfferCard` | adapter over `BaselineProductOfferCard` (which gained optional `testID` and `accessibilityLabel`) |
| RS property insurance `SecondaryAction` (Flows) | `PrimaryButton variant="secondary"` |

## Open gaps: proposals, not approved

Proposals follow `AGENTS.md`: genuinely unmapped components go to a `De aprobat / <source>` page in the
Design System Figma file and need individual approval before promotion. Nothing has been written to Figma.

1. **Inline text link.** Sentence case, 14 px Bold, colour `--uc-action-strong`, no chevron, 44 px touch
   target. Used as a plain text action inside flows. It is not the Figma "Text button / Primary" (uppercase,
   trailing 16 px chevron; implemented as `BaselineNavigationLink`, web `NavigationLink`, `LinkActionButton`).
   Seen at `src/flows/ro/genius-my-car/geniusMyCarPurchase.tsx` (4 places),
   `src/flows/shared/investments-bulk-approval/investmentsBulkApprovalPreviews.tsx` (2),
   `src/flows/rs/property-insurance/rsPropertyInsurancePreviews.tsx` (2).
2. **Product menu card with responsive width.** `SourceMenuCard` takes a `width` (full or half row);
   `BaselineProductMenuCard` is fixed size. Needs a decision: a width-fill variant, or fixed width everywhere.
3. **Reviewed and kept on purpose.**
   - Legacy `current/profile/BottomSheet.tsx`: its callers pass `panelStyle` and `headerStyle`, which the library sheet
     does not offer, and tests pin its `current-bottom-sheet` test id.
   - Genius Protect rows (`ToggleRow`, `InfoRow`, `DataRow`, `CheckRow` in `GeniusProtectFlow.tsx`): left alone while
     that flow is being edited elsewhere in the working tree.
   - `BaselinePeriodIndicator` and `SourcePeriodIndicator` already read the shared `analyticsIndicator` contract.
   - `HistoryHomeIndicator` is the phone home bar, and `FutureGainBanner` is already an adapter.
   - `BankingCopyToast` is the native renderer of the web `CopyToast` (a transient "copied" pill with its own hook),
     not a copy of `BaselineToast`, which is the icon/dot message toast.
   - `DepositDivider` uses an 18 px title with a rule; the library section divider only has 14 px and 20 px variants.
     Aligning it would change the size, so it needs a design decision (an 18 px variant or a 14 px title).
   - `PrimeEntryButton` is the Prime header control (pill with a glyph, overlay variant); there is no library
     counterpart.
4. **Selectable pill button with icon** (Kids `Button`) and the **pill-shaped action button** used by Evo 2027
   (`ActionButton`, radius 32). Deferred with Kids and Evo.
5. **Tabs role.** Appointment `MeetingTabs` exposes `button`; `BaselineMailboxTabs` exposes `tab`. Moving it
   changes an accessibility role that a test in the Evo area asserts, so it waits for Evo.
6. **Web `PrimaryButton` default label size.** The web wrapper defaults to 16, Figma and the native button to
   18; only 18 of 142 call sites pass the size explicitly.

## Not yet reviewed individually

The remaining entries in `baseline.json` (rows such as `DatedRow`, `DocumentRow`, `ServiceDatedRow`,
`AppointmentListRow`, `DataRow`, `FilterRow`, `CzRoboSecurityRow`, `OfferRow`; cards `BalanceCard` and
`BaselineSensitiveCard`; `DesignCarousel`, `BaselineProductsTabs`, `BaselinePfmPeriodCarousel`; `Chips`;
`FilterDivider`; `BaselineInvestmentField`; `Logo`) are screen-specific compositions that have not been compared
with their library counterparts yet. They are accepted by the ratchet so that no new ones appear, not because they
were judged correct. Align them family by family and then refresh the baseline.
