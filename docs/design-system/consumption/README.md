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
component, not by editing the baseline. In the native demo a look-alike is judged against the React Native
library (`native-spike/src/universal`); in Flows it is judged against the web components in
`src/app/components`, which the web previews consume. A local component that renders an already-aligned local
adapter counts as aligned.

## Aligned so far

| Component                                                                                                                   | Now                                                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Profile `Button`                                                                                                            | library `PrimaryButton` (Figma Button: 48 high, radius 4, #007A91, Bold 18)                                                                                                                                                                                                |
| Profile `MailboxTabs`                                                                                                       | adapter over `BaselineMailboxTabs`                                                                                                                                                                                                                                         |
| Banking `Toggle`                                                                                                            | library `ToggleButton` (replaces the platform `Switch`)                                                                                                                                                                                                                    |
| Appointment `FormCheckbox`                                                                                                  | library `BaselineCheckbox` with `presentation="canonical"`, dark aware                                                                                                                                                                                                     |
| Appointment `AppointmentSheet` (also `SelectionSheet`, `CalendarSheet`, `AccountSelectionSheet`)                            | library `BaselineBottomSheet`                                                                                                                                                                                                                                              |
| `RoBaselineCategorySheet` (change category)                                                                                 | library `BaselineBottomSheet` with the new `fixedHeight` option (full-height panel, scrolling list, pinned action)                                                                                                                                                         |
| `BankingSheet` (internal transfer, schedule)                                                                                | adapter over `BaselineBottomSheet`; keeps the original 16 px inset until the banking forms are reviewed                                                                                                                                                                    |
| Offers `BaselineProductsTabs` (Banking / ShopSmart)                                                                         | adapter over `BaselineMailboxTabs`: 18 px labels like every other tab strip (decision: tabs are 18 px everywhere; they were 20 px here)                                                                                                                                    |
| `FilterDivider` (investment history filters) and `DepositDivider` (Future Gain deposit)                                     | library `BaselineSectionDivider` `medium-title`: 14 px title, text inset 24, rule across the width (decision: section titles with a rule are 14 px; they were 18 px)                                                                                                       |
| `BankingButton`                                                                                                             | library `PrimaryButton` (same 48 / radius 4 / action-strong, 0.3 opacity and 18 px label when disabled)                                                                                                                                                                    |
| Romanian profile `ConsentToggle`                                                                                            | library `ToggleButton`, row keeps the press and the accessible name                                                                                                                                                                                                        |
| `SourceOfferCard`                                                                                                           | adapter over `BaselineProductOfferCard` (which gained optional `testID` and `accessibilityLabel`)                                                                                                                                                                          |
| RS property insurance `SecondaryAction` (Flows)                                                                             | `PrimaryButton variant="secondary"`                                                                                                                                                                                                                                        |
| RS property insurance `OpenDocumentButton` (Flows)                                                                          | `LinkActionButton` (the Design System text button: uppercase 14 Bold, 16 px chevron, 4 px gap, 44 px target)                                                                                                                                                               |
| `DatedRow` (profile) and `ServiceDatedRow` (baseline More), the same row written twice                                      | new library component `BaselineDatedRow`; both are now adapters. Candidate DS entry "Dated list row" (not yet in Figma)                                                                                                                                                    |
| Investments catalog `Logo`                                                                                                  | new library component `BaselineBrandLogo`; `Logo` is an adapter. The web twin is `components/brand-logo/BrandLogo.tsx`                                                                                                                                                     |
| Inline text actions in Flows (Genius My Car x2, investments bulk approval x2, RS property insurance "Edit")                 | new component `TextLink` (web `src/app/components/TextLink.tsx`, native `BaselineTextLink`), one contract `contracts/textLink.ts`: sentence case, 14 Bold, `--uc-action`, no chevron, 44 px target                                                                         |
| Label and value rows: native `OfferRow`; Flows `DataRow` (Genius My Car), `SummaryRow`, `ReviewRow` (RS property insurance) | new component `KeyValueRow` (web `src/app/components/KeyValueRow.tsx`, native `BaselineKeyValueRow`), one contract `contracts/keyValueRow.ts`: inline (muted label, bold value, rule) or stacked (bold uppercase label over a muted value), compact 14 px or regular 16 px |
| Web `PrimaryButton` default label size                                                                                      | now 18, like Figma and the native button                                                                                                                                                                                                                                   |

## Open gaps: proposals, not approved

Proposals follow `AGENTS.md`: genuinely unmapped components go to a `De aprobat / <source>` page in the
Design System Figma file and need individual approval before promotion. Nothing has been written to Figma.

1. **Inline text link: built as `TextLink`.** It is not the Figma "Text button / Primary" (uppercase, trailing 16 px
   chevron; implemented as `BaselineNavigationLink`, web `NavigationLink`, `LinkActionButton`). Still a proposal for
   Figma ("Text link").
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
   - `PrimeEntryButton` is the Prime header control (pill with a glyph, overlay variant); there is no library
     counterpart.
   - **Key-value rows**: built as `KeyValueRow` (see above; still a proposal for Figma). Not yet moved onto it: the
     Romanian profile `DataRow` and Genius Protect `DataRow` (the second is left alone while that flow is edited).
   - `AppointmentListRow` (date, meeting-type icon, three lines), `FilterRow` (muted title over a bold value, chevron
     or calendar glyph) and `CzRoboSecurityRow` (logo, quantity, prices, performance) are domain list items, not
     copies of `BaselineNavigationRow` or `BaselineDatedRow`.
   - Future Gain `Chips`: built as `BaselineChoiceChip` / `BaselineChoiceChips` (contract `contracts/choiceChip.ts`, action fill when chosen, 14 Bold, scrolling row). `Chips` is now an adapter. `BaselinePill` selected is black and `BaselineAmountSuggestionChip` is 13 px action-strong, so neither fits. Still a proposal for Figma ("Choice chip").
   - `BaselineInvestmentField` adds multiline, a secondary value and a `product-detail` variant on top of what
     `BaselineAccountInfoField` offers; extend the library field before replacing it.
   - `BalanceCard` is an Evo 2027 card (out of scope), and `BaselineSensitiveCard` is a whole card-details screen
     named like a card, so it is a false positive of the name-based classifier.
4. **Selectable pill button with icon** (Kids `Button`) and the **pill-shaped action button** used by Evo 2027
   (`ActionButton`, radius 32). Deferred with Kids and Evo.
5. **Tabs role.** Appointment `MeetingTabs` exposes `button`; `BaselineMailboxTabs` exposes `tab`. Moving it
   changes an accessibility role that a test in the Evo area asserts, so it waits for Evo.
6. **Web `PrimaryButton` default label size**: resolved, the web default is now 18.

## Not yet reviewed individually

Every entry in `baseline.json` has now been reviewed. The ones that remain are kept for a stated reason, listed above
and below, and each one either needs a Design System decision or is domain-specific. The ratchet accepts them so that
no new ones appear.

Native, also kept:

- `DesignCarousel` (virtual card design picker with mouse-drag paging) and `BaselinePfmPeriodCarousel` (a paging rail
  for the Spending periods, web and native variants) are behaviour components; the library only has the dots
  (`BaselineCarouselIndicator`), not a paging rail. A library "paged rail" would be a new component.

Flows (web, judged against `src/app/components`, which the web previews consume):

- Presentation chrome, not product UI: `FraudPresentationDialog`, `PrimePresentationDialog`.
- Flow-specific cards and carousels: `ChoiceCard`, `PackageCard`, `PackageCarousel`, `MyCarVehicleCard`,
  `AddVehicleCard`, `InfoPanel`.
- Summary rows `BenefitRow`, `CoveredWorkRow`, `ConsentRow`, `VehiclePolicyRow`: they carry an icon, a check or a
  toggle next to the text, so they are not plain key-value rows. `SummaryRow`, `ReviewRow` and `DataRow` already use
  `KeyValueRow`.
- `PolicyStatusBadge` (status tag with tones) has no web Design System tag; `StepProgress` is a four-step stepper;
  `VehicleBrandLogo` renders car make logos in a white pill, not the brand registry; `BottomCta` and `Field` are
  layout wrappers.
- `FlowBulkSelectionCheckbox`: there is no canonical web checkbox (the shadcn `ui/checkbox` is a generic 16 px
  one), so a web counterpart of `BaselineCheckbox presentation="canonical"` is missing.
- `GroupHeader` already composes the web `SectionHeadingDivider`; the name-based family rule cannot see that.
