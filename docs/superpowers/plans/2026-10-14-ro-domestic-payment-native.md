# Romanian baseline domestic payment

Owner: `/root/ro_domestic_payment`. Base: `d338f7cfb92435bb8edc8817afbdd47031fb18e3`. Checkout: `C:\Users\mihai\Desktop\Mobile Banking - CEE`.

Scope: new `native-spike/src/experiences/pi/current/baseline/payments/domestic/**`, `native-spike/__tests__/ro-baseline-domestic-payment.test.tsx`, this document, and private `.codex-temp/ro-baseline-domestic-payment/**`. Full initial pending state is recorded privately in `ownership.json`; owned paths did not exist initially. Source files, shared leaves, controller, adapter and preview are read-only for this worker.

Source authority: `DomesticPaymentFlowScreens.tsx`, `StandardSignScreen.tsx`, `StandardSuccessScreen.tsx`, `usePaymentFlow.ts`, `paymentFlow.ts`, and `currentPaymentPolicy.ts`.

1. Characterize empty/redo/template draft, Source-only RO validation and inert controls with failing native renderer tests.
2. Render the Source create/review/sign/success composition using Native baseline leaves and canonical data/helpers. Preserve Source editable payer, static balance, nonempty prefix eligibility, whitespace-only amount normalization, local template toggle and 840ms FaceID completion.
3. Integrator routes `payment-create` to the default screen. Capture actual Source4004 and actual Native4006 at 375×812; compare geometry, inputs, text and pixels without masks or tolerance, repair scoped composition or request shared-leaf changes.
4. Run affected tests, ESLint with zero warnings and TypeScript. Report exact owned delta and frozen state for combined integrator verification.

Source RO omissions are preserved: payer dropdown, camera and optional-symbol chevron have no handlers; no in-form beneficiary picker, due-date editing, express editing, real backend submission or saved-template persistence.

Implementation: `RoBaselinePaymentCreateScreen` renders create/review and consumes the separately owned confirmation module. All draft creation, redo amount/date/note, template values and review formatting call canonical Source helpers; eligibility calls the shared Source policy. Completion clears the local draft and pushes Payments, matching Source navigation semantics. The optional integration-host Back handler consumes review/sign/success transitions and unregisters on unmount. Review's local save-template toggle resets when review is remounted.

Verification: four meaningful renderer tests were observed red before implementation and then green. The actual Source4004 and actual `CurrentApplication`4006 were compared at 375×812 in 12 cases: create, scrolled create and review for English/Romanian and light/dark. Every screenshot has **zero differing pixels**, without masks or tolerance. Private evidence is `pixel-results.json`, `screen-results.json`, `images/`, `capture-all.cjs` and `compare.py` under the task directory.

Geometry follows actual computed Source styles: its `uc-type-n4-strong` review values and `uc-type-n5` hint override their Tailwind leading classes to normal. Native web scroll disables React Native Web's default compositor transform to retain Source text rasterization; native device rendering is unaffected. Source's optional chevron uses its 20px authored dimensions.

Integration verification and final combined `npm run verify` belong to the root integration owner. No Source file, shared leaf, package, lockfile, configuration, asset or Git index was edited by this worker.
