# Profile data implementation verification

Owner: profile_data. Checkout: C:/Users/mihai/Desktop/Mobile Banking - CEE. Base: 538360ead4a6da9ae889f142f8d00e333f99412b. Initial pending changes and full ownership are recorded in pi-italy-mobile-first-profile-data-ownership.json.

The canonical ledger maps all 108 personal-data, 61 contact and 31 identity source frames to reusable forms and explicit state families. Filled, empty, error, selection, authorization, OTP, retry and confirmation variants share their family's component and policy. Frame IDs, source names and source-content anomalies are retained in the ledger and original section inventories.

Implemented personal data includes email, phone/operator/prefix, SMS verification, residence, correspondence per account, family with child dates, education, vehicle plates, image consent/camera/gallery/crop/removal, portability PDF and authorization. The four-step AML questionnaire validates professional information, PEP status and source of funds, account purposes, declarations and Mobile Code. It blocks on expired identity cards.

Contacts support search, domestic/foreign account details, prepaid and mobile relationships, optional anagraphic fields, create/edit/remove, multiple relationships, quick-operation enable/disable, merge review and merged-detail editing, authorization and confirmation. Foreign-account combinations are restricted and Italian IBAN checksums are validated.

Identity renewal includes document-type selection, source document images, front/back capture simulation, preview/retry, field and date validation, NFC progress/error/retry/fallback, Mobile Code and a local appointment alternative. Every external action is simulated. Saved demo changes persist across navigation for the current application session.

Verification:

- 29 tests pass: 19 screen interaction regressions plus 10 feature tests.
- Scoped ESLint passes without warnings.
- Final TypeScript check passes on the shared checkout, including the address additions.
- Module-boundary audit passes.
- All downloaded assets are non-empty local files; code uses no temporary Figma URLs. The browser rendered the personal, contacts and identity representatives. Identity image slots measured 90 × 56 pixels, matching the source. Main card spacing, source text-button weight and heading focus were repaired after this inspection.

The isolated browser harness is pi-italy-mobile-first-profile-data-preview.html and accepts entry=personal, entry=contacts or entry=identity. It imports production components and production styles. All 200 frame variants were not individually screenshot-tested. Native date fields represent operating-system date entry. Camera/gallery, NFC, OTP, appointments and document signing are prototype state. The NFC illustration's checkerboard appearance is present in the original Figma PNG and is preserved.

Global npm run verify belongs to the integration owner after all shared-checkout editors finish. This task did not stage, commit, switch branches, create a worktree, deploy, publish, delete or convert assets, or modify another owner's files.

Review corrections: Mobile Code authorization now uses the shared canonical Settings store and authorization component, including the current changed code and 6–10 digit values. OTP has a separate six-digit policy; phase keys and resets prevent retained codes/errors. Pair changes and cancellation discard merge drafts, the feature rejects drafts from another pair, canceled contact edits restore persisted values, and foreign-account fields are required only on the current foreign relationship. All review defects were reproduced by failing regressions before repair.

Selected document routing: each personal-document VISUALIZZA action passes its stable document ID through the data composition into the identity detail entry. GESTISCI DOCUMENTI passes no ID and opens the list. A regression covers both Patente and Carta d’identità detail selection, back navigation, and the management list. The test failed with the original discarded selection and passes with the handoff.

Operator fixtures are documented here rather than displayed in product screens. The default Mobile Code is 12345678 and follows the Settings store if changed. The independent OTP fixture is 123456. For NFC failure QA, add profile_nfc=chip-error or profile_nfc=position-error to the isolated preview URL. The first reading attempt displays the corresponding source error; Riprova allows the next attempt to succeed. Camera/gallery, SMS and appointments remain entirely local prototype state. Product copy uses the source actions without demo instructions or error-simulation buttons.

Integrated review QA used a separate Chrome tab on localhost:4004: avatar → I tuoi dati → phone edit → operator selection → canonical Mobile Code → empty OTP field with disabled confirmation → independent OTP → success → persisted phone/operator. The accessibility snapshot confirmed the complete path. Screenshot capture after the transition was stale and then timed out; no new screenshot-based pixel claim is made for that path.
