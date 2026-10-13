# Native Italy profile

`ProfileScreen` implements the native `SearchTarget` profile destinations with the shared `ItalyNativeScreenProps` contract. It prefers `target.id`; while the canonical web search index omits profile IDs, it also accepts the host's validated `searchEntry.id` for settings actions, branches, and support topics.

The screen stack keeps underlying profile routes mounted and hidden, preserves drafts when returning from contextual help, and enables Android hardware back handling only for the active route. Closing returns through the host's `onBack` callback, including a preserved search route. Product links go through canonical host destinations.

Canonical profile feature stores and validators provide personal data, contacts, identity document validation, questionnaire eligibility, appointment management, document and communication actions, Mobile Code and PIN authorization, limits, notification preferences, consents, and digital signature state. Content and original artwork come from the Italy source composition. No banking, login, email, or transaction API is invoked.

Native text inputs and scoped modal portals implement fields and choices. PDF sharing uses canonical PDF bytes with the native file-sharing port. Clipboard and native biometric authorization use the shared platform ports; cancellation, unavailability, inactive screens, and canonical lockout never authorize an operation. Unsupported devices offer an explicitly labeled Face ID simulation without setting the biometric activation preference. Mobile Code and phone OTP mount separate authorization instances, so the password is never reused in an unmasked OTP field.

## Verification

- `npx jest --runInBand __tests__/italy-profile.test.tsx`: 84 passing cases after integration review and the document, advisor, practice, security export, chrome fidelity batches, and the actual React Native sticky-header regression.
- Scoped ESLint with `--max-warnings 0`: clean.
- `npx tsc --noEmit --pretty false`: clean at the final handoff.
- Browser verification: native hub and personal data against the source reference, and actual Search → Face ID → close → preserved search results.

The integration owner runs the final combined native/build checks and repository `npm run verify` after other editors finish.

## Remaining fidelity and hardware work

This is broad native coverage, not a claim of complete pixel parity for every source state. Camera, gallery, document photography, and NFC follow the source's fixture-based demonstration stages; real device capture and NFC reading are not connected here. Owned typography now consumes Core's source-aligned 1.125 text scale. Core connected the screenshot preference to Android `FLAG_SECURE`; final device verification remains with the integration owner.

The source-state ledger in `FIDELITY.md` records implemented document presets, sharing confirmations, paper/cards, and the implemented advisor variants, certificate/delivery steps, guarded practice upload/interview states, filtered history export, and top-inset-aware full receipt heroes. Remaining work is the per-state visual audit, sticky titles, installed picker verification, and the remaining device checks. Original image bytes and source files remain unchanged.



Overdraft document controls open Core’s filtered OS picker and retain only the selected filename in the local draft. Cancellation preserves the previous selection; invalid files, inactive results, and readonly practices are guarded. The practice stays incomplete and nothing is uploaded. An explicitly labeled fixture is offered only when the platform port is unavailable, including older base APKs. Root verified the corrected Hub header and dirty family draft preservation on installed Android API28 via local OTA; the new picker requires the next base APK and still needs installed verification.


Settings rows follow the source by context: main-menu rows hide generic chevrons, use original natural SVG sizes inside24px icon frames and48px rows; Security uses original16px edit/forth assets, bold14/18 action labels and canonical status badges. Source Mobile Code opens its Creazione/Modifica submenu. General and other ordinary rows preserve the source literal ›, and explicit custom action text is retained. Settings menu and Security were compared in browser1; installed Android verification of these latest row changes remains with Core.


