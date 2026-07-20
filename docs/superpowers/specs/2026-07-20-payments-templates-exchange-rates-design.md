# Payments Templates and Exchange Rates Design

## Scope

Implement the two Romania Payments shortcuts represented by the four production-reference captures in `To do/Payments`:

- `My Templates` opens a searchable Templates page.
- `Exchange Rates` opens a connected currency calculator and currency-selection bottom sheet.

The visual structure follows the captures, while all names, account identifiers, amounts, and rate values come from deterministic demo data that is different from the supplied personal reference data.

## Design-system mapping

| Reference element | Repository match | Decision |
|---|---|---|
| Large title, back, help | `PageHeader` | Reuse |
| Search control | `AccountSearchBar` | Reuse |
| Section rule/title | `SectionHeadingDivider` | Reuse |
| Currency chooser | `BottomSheet`, `RadioButton`, `PrimaryButton` | Compose |
| Payments shortcut entry | `PaymentOtherShortcut` | Reuse with callback wiring |
| Template/beneficiary row | No matching domain row | Create Payments-specific row |
| Currency-rate row | No matching domain row | Create Payments-specific row |

## Templates behavior

- Show saved templates first and saved beneficiaries second.
- Search filters both collections by display name, beneficiary name, and account number.
- Selecting a template opens the existing Domestic Payment form with beneficiary, account, bank, amount, currency, and payment note prefilled.
- Selecting a beneficiary opens the same form with beneficiary/account/bank prefilled and amount empty.
- Use clearly fictional demo data rather than reproducing any names, IBANs, or amounts from the captures.

## Exchange Rates behavior

- Default the source currency to the active country's currency.
- Keep the existing `EUR_REFERENCE_RATES` table as the single rate authority.
- Accept a positive decimal amount and calculate every supported target currency from that amount.
- The currency field opens a bottom sheet with a single radio selection. `OK` applies the draft selection; closing the sheet discards it.
- Changing source currency immediately recalculates the unit relationship and converted result for every row.
- Rate data is deterministic demo/reference data, not a live trading quote or executable FX offer.

## Navigation and state

Both pages are local Payments child views so Back returns to the Payments overview without introducing a duplicate global navigation stack. Template selection hands a typed selection to `App`, which creates the existing `DomesticPaymentDraft` and navigates through the established payment flow.

## Acceptance criteria

- Both shortcut buttons open the correct child view.
- Templates search and selection work and never expose the supplied reference identities.
- Template and beneficiary selections create the correct distinct prefilled drafts.
- Currency selection opens collapsed over the current page, applies only on `OK`, and recalculates results.
- All copy uses runtime translations, all controls are keyboard-accessible, and shared component behavior remains backward-compatible.
