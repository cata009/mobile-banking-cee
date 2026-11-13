# PI Romania Baseline Payments Completion Design

## Task record

- Owner and integration owner: `/root`
- Base commit: `04dc35bd11e9069a372b01f34ff44a3df6de8ff0`
- Checkout: `C:\Users\mihai\Desktop\Mobile Banking - CEE`
- Initial pending change to preserve: `native-spike/src/experiences/pi/current/baseline/Account.tsx` hides the mCash action on Romanian loan products.
- Owned scope: `native-spike/src/experiences/pi/current/NativeCurrentApp.tsx`; `native-spike/src/experiences/pi/current/baseline/Account.tsx`; `native-spike/src/experiences/pi/current/baseline/payments/hub/Payments.tsx`; new `native-spike/src/experiences/pi/current/baseline/payments/forms/**`; `src/features/accounts-payments/currentPaymentPolicy.ts`; `src/data/paymentsHub.ts`; affected tests in `native-spike/__tests__`, `tests/features`, and `tests/data`; this design and its implementation plan. No new image assets or fixtures are planned.

## Intent

Complete the PI Romania current-baseline payment journeys shown in the supplied screenshots and keep the selected account stable when a user opens account details or options. The screens are part of the interactive banking demo, so they must use the actual Native baseline components and remain connected to the existing navigation and demo payment-sign flow.

## Goals

- Fix Romanian account selection so a Details/Options round trip returns to the product currently selected in the carousel.
- Keep Details in the same horizontal action slot as the current-account layout when loan-only actions are hidden.
- Make the following flows reachable and interactive from the Romanian Payments hub: Foreign Payment, Currency Exchange, Treasury Payment, Transfer Between Your Own Accounts, Standing Order, and Direct Debit.
- Implement the Direct Debit path from the Payments sheet through an empty mandate list, utility-provider list, and provider-specific mandate form.
- Support the fields, selectors, toggles, date picking, validation, and review/sign/success sequence shown in the references.
- Save completed Standing Order and Direct Debit records locally so they remain visible when their lists are reopened.

## Non-goals and anti-goals

- Do not connect these demo flows to real banking or execute real transfers.
- Do not change CZ Evo, RS, BA, or other country/release behavior.
- Do not implement New Bill Payment or Scan Paycode forms; the supplied references cover the Direct Debit option and do not show those form flows.
- Do not create parallel web-only forms, screenshots, flattened controls, or duplicate payment catalogs.
- Do not remove or overwrite the existing pending mCash change; preserve its intent while retaining the action-bar slot.

## Constraints

- Keep the existing `payment-create` Domestic Payment route and its Source/native flow behavior intact.
- Add the new forms to the PI Romania Native baseline Payments experience and reuse approved Native primitives, account/date sheets, and the existing payment sign/success screens.
- Put validation, quote calculations, address/sweeping policies, provider data, and recurrent-record conversion in feature/data modules, not in metadata or composition files.
- Preserve the existing PI/current design-system and release axes; changes are explicitly gated to `country === 'RO'` where shared code is involved.
- Currency Exchange uses the supplied Romanian baseline demo quote of `1 EUR = 5.4200 RON`; it is a demo quote, not a live market feed.
- Review → Sign → Success remains a demonstration flow. Only recurring-payment records persist locally.

## Approach

The user directed that Domestic Payments be the implementation model. Extend the existing Native baseline Payments hub and its local view state, adding a typed Romanian payment-form feature model and focused form components. Reuse the current native fields, account selector, payment sheet, date UI, and payment sign/success components. Keep Domestic Payment routed exactly as it is today.

Implementation note: extend the existing feature-owned `currentPaymentPolicy.ts` with the typed Romanian payment policy API instead of adding a parallel policy module; keep view/rendering code under the Native baseline payments folder.

Two alternatives were considered and rejected: rebuilding these screens in the Source web layer would duplicate the visible Native baseline and diverge from the references; adding Flow Library prototypes would not make the Payments hub actions work. The existing Native baseline route is the correct implementation surface.

## Screen and behavior map

| Entry point | Flow | Completion |
|---|---|---|
| Payment to account → Foreign Payments | Beneficiary name/IBAN, optional address with unstructured/hybrid/structured modes, amount/currency, payment date, optional details | Review → Sign → Success |
| Currency Exchange hero | From/to current or savings accounts, amount, exchange quote, processing date, details | Review → Sign → Success |
| Payment to account → Treasury Payment | Beneficiary, amount/date, urgent toggle, fiscal code, E2E/order and ANAF references, optional details | Review → Sign → Success |
| Payment to account → Transfer Between Your Own Accounts | Same-currency source/destination accounts, amount/date/details, instant-payment toggle | Review → Sign → Success |
| Recurrent Payments shortcut → Standing Order | Beneficiary, source account, sweeping mode, amount/frequency, start/optional end date, CNP and references. With sweeping enabled, Amount is the minimum balance retained; only the balance above it is transferred. | Review → Sign → Success; save the recurring record locally |
| Bills & Direct Debit → Direct Debit → Create Direct Debit | Empty list → searchable provider/category list → provider-prefilled mandate fields, limit and start date, subscriber data, terms agreement | Review → Sign → Success; save locally and show the mandate in the Direct Debit list |

Account navigation changes carry the selected product into the parent account route before Details/Options is pushed. For Romanian loans, mCash remains hidden but its slot stays in the four-position action rail so Details does not shift.

## Validation and acceptance

- Each form keeps a controlled draft while its create, review, sign, and success views change.
- Next stays disabled until that form's required fields and policy checks pass; Direct Debit also requires accepting its terms.
- Standing Order sweeping mode changes Amount from a fixed payment amount to the minimum balance to retain, and the review describes the transfer as the available surplus.
- Address-type selection switches the beneficiary address controls without clearing unrelated draft data.
- Currency Exchange rejects identical currencies; own-account transfer offers only same-currency destination accounts.
- Direct Debit list starts empty, supports searching/grouped providers, and displays a locally saved mandate after completion.
- Standing Order and Direct Debit local records survive reopening their corresponding list/view.
- Tests cover the route round trip, action-slot alignment, each form's required validation and state transitions, provider/address choices, same-currency transfer, and local recurring-record persistence.
- Final checks include affected Native tests, `npm run audit:modules`, and the repository's combined `npm run verify` after the integration owner confirms all editors are done.
