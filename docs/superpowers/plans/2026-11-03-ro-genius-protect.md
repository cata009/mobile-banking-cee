# Romania Genius Protect flow

## Objective

Implement the RO PI Genius Protect application from the existing Products → Insurances sheet, using the full Figma section `Request insurance DBN flow` in file `bM3r8YmHuaIDXFFgsPhvDY`, starting at node `27207:48707`.

## Figma journey and states

1. Reuse the current Genius Protect product option route; show the product detail, benefits, cover amounts and monthly price.
2. Present the application steps and require agreement before starting.
3. Confirm the customer’s personal data from the existing RO profile.
4. Collect the UniCredit, Allianz-Țiriac and Trans Sped information notices.
5. Capture CNAS eligibility, protection needs and the no-advice declaration.
6. Select a RON current account and read the automatic debit mandate.
7. Read the pre-contract documents and confirm the early-disclosure choice.
8. Review contract documents and sign with the demo OTP.
9. Show processing and success, while supporting no-account, existing-policy, resumable-draft, invalid-OTP and cancellation states.

## Implementation

- Add insurance business rules and resumable request state to `src/features/insurance/geniusProtect.ts`.
- Add a RO Baseline flow component under `native-spike/src/experiences/pi/current/baseline/offers/` and select it only for the existing `product-detail` route with `optionId: 'genius-protect'`.
- Reuse the existing product sheet, shared Baseline page header, text fields, toggles, radio buttons, primary buttons, bottom sheet and the RO personal profile data.
- Use the original Figma hero photo (`27207:48748`), preserving its PNG source bytes and provenance.
- Keep external account opening, camera capture and insurer/signature services outside this local demo; represent those steps in the existing mock flow.

## Acceptance checks

- Feature tests cover account/policy gates, required consents, eligibility, payment selection, contract review, OTP and draft lifecycle.
- Native tests cover the existing insurance sheet route and the complete valid application path.
- Run targeted tests, Native TypeScript, `npm run audit:modules`, `npm run audit:assets`, and the combined verification after implementation.
