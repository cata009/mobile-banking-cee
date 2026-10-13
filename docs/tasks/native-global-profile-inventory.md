# Native global profile, settings and support inventory

First priority: PI/CZ/current/baseline-current/release-future-evo-2027. Italy mobile-first APK0.3 is frozen reference, not a substitute for CZ appearance or policies. Other demos below are extension plans, not native readiness claims.

## Canonical Source inventory

| Surface | Canonical Source | Behavior / variation to preserve |
| --- | --- | --- |
| More | `src/app/screens/more/MoreScreen.tsx`, `moreCardsConfig.ts` | Ordered market grid; avatar is inert; Messages active; logout confirm; tutorial sheet. CZ has 7 cards. Consent/digital/requests placeholders remain inert. |
| Global selector | `src/app/components/demo/DemoTopBar.tsx`, `src/app/state/demoTypes.ts`, country/design-system/release/scenario/project registries | One selector owns Source axes and supported combinations; native Core owns its single global selector/host and availability metadata. Do not build one country selector inside each profile. Inactive/native-unimplemented contexts remain unavailable, without country or design-system fallbacks. |
| Settings | `src/app/screens/settings/SettingsScreen.tsx`, `settingsConfig.ts` | Shared two sections/eight rows. Appearance/language active; remaining rows inert. No fake notification/security forms. |
| Language | `src/app/components/LanguageSelector.tsx`, `languageByCountry.ts` | CS/en for CZ, local/en for other markets; temporary language previews copy, Save applies, Back discards. |
| Appearance | `src/app/screens/home/App2027ThemePicker.tsx` | Ten named themes; wallpaper draft/apply/cancel; mode light/dark/system changes immediately and persists. Current Source phone preview uses native-code-equivalent CSS art; requires dedicated parity proof. |
| Documents | `src/app/screens/documents/DocumentsScreen.tsx`, `documentsConfig.ts` | Eight canonical rows, descending grouped date order; localized search across year/date/title/description/badge; one swipe action; confirm/cancel; legal deletion shows info and preserves item; deletion session-local and country-keyed. No document detail/download in this Source. |
| Messages | `src/app/screens/messages/MessagesScreen.tsx`, `messagesConfig.ts` | Inbox 16/outbox 10; sticky tabs/search; local search; vertical more-menu inert. No message composer in this Source. |
| Contact hub | `src/app/screens/contacts/ContactsScreen.tsx` | Original building image; bank/social rows; CZ phone/website plus Source hardcoded Romanian email preserved. Prime advisor route active; remaining contact rows and help inert. |
| Advisor actions | `src/app/screens/prime/PrimeScreen.tsx`, `PrimeContactActionFlow.tsx`, `YourAdvisorTab.tsx` | Demo call confirm/connected/timer/controls/keypad/end; mail chooser/preference/draft/send confirmation, no external sending; appointment/callback navigation. |
| Callback | `src/app/screens/appointments/RequestCallScreen.tsx`, `appointmentModel.ts` | form → notes → review → success; multi-select sheets commit/cancel; reason change clears details; date/interval/phone required; phone 7–15 digits; Back preserves draft. CZ +420/602123456. |
| Appointments | `src/app/screens/appointments/AppointmentScreen.tsx`, `appointmentModel.ts`, `features/profile/evoAppointments.ts` | Booking/location/date/slots/notes/review/success; country-keyed saved records; Active/Past; detail/map/delete; low-rating feedback requirements and readable saved reasons. Source success CTA returns to Active. |
| Tutorials | `src/app/screens/more/tutorials/TutorialsFlow.tsx`, `tutorialsConfig.ts` | Ordered per-country list/slide kinds/step index; previous/dots/next/done, reset on close. |
| Internal authorization | `src/app/components/flow/StandardSignScreen.tsx`, `FaceIdAnimation.tsx` | Source demonstration accepts masked initial PIN and completes simulated Face ID. Native real biometrics only through existing CeeDemoDevice port; explicit demo alternative when unavailable. No portal-password gate at APK entry. |

## Market variation and extension order

| Source market | More cards (Source order) | Languages | Extension status |
| --- | --- | --- | --- |
| CZ Evo2027 | contacts, documents, settings, third-party-consent, digital-activities, my-requests, tutorial | cs/en | First migration scope; completion requires Core host and evidence. |
| CZ baseline/coapping/robo, SK | same seven | CZ cs/en; SK sk/en | Later composition adapters; preserve different release/Co-Apping availability. |
| RO baseline | contacts, documents, settings, gdpr-consent, tutorial | ro/en | Next priority; consent variation retained. |
| SI | contacts, documents, settings, third-party-consent, my-requests, tutorial | sl/en | Planned. |
| HU | contacts, documents, settings, third-party-consent, tutorial, my-requests | hu/en | Planned. |
| RS baseline/Future Gain | contacts, documents, settings, third-party-consent, my-requests, tutorial | sr/en | Planned, distinct release contexts. |
| BA/BA_BL | contacts, documents, settings, tutorial, my-requests | bs/en | Planned; contact/messages header, no logout action in More header. |
| IT mobile-first | separate personal hub/data/settings/services, no legacy More cards | it/en | Frozen existing implementation; consume without edits. |
| Kids SK/HU/RO and prepared SME packs | separate product manifests / composition | market-specific | Inventory and future plan only. Never substitute PI screens or claim ready. |

## Proposed shared composition for Core

Keep one global context selector and one screen navigation host. Experiences provide country/release identity, native adapter, Source card order/config, language options, source assets and ControlTokens; policies remain feature-owned. Provide shared current PageHeader (48px nav, 28px large title, 64px collapse threshold), source typography roles, card/section/dated-list slots, multi-select sheet with draft/Select semantics and tab variants. Reuse existing native Select, DateField, NavigationRow, ModalPanel, SearchField, Typography and platform privacy/storage/biometric/document ports. Tokenize spacing/colors/typography instead of copying dropdown/header implementations.

Do not unify Italy mobile-first geometry into current or overwrite BA actions, RO consent, CZ release or market copy. Extract currently component-local policies only through their Source/Core owner, preserving legacy exports and DOM; native composition may adapt state transitions, not introduce new business rules.

## Evidence and remaining work

Implementation/test/visual evidence will be recorded in `.codex-temp/native-global/cz-evo-profile-freeze.md`. This inventory is Source-backed and does not imply converted routes, pixel fidelity, real calls/mail, camera/NFC or full global migration.

The current CZ owner adapter registers profile/More, Settings, Language, Documents, Messages, Contacts, Support (advisor/tutorial subviews), call-request, appointments and activated demo login. Reusable internal Authorization calls the existing device biometric port, with explicit simulated continuation only when unavailable. Source data, Source callback/appointment validation, Source theme metadata and original vector/bitmap assets are reused. Back/draft/legal deletion/cancellation/privacy proofs accompany the migration. Inactive activation/Co-Apping baseline and other market rows remain extension plans.

Measured at375×812: Settings Source h1 y110/h31, small section labels y169/h15.5/14px, first80px row y209.5, second y289.5, Bank label y713.5; native composition was corrected against those computed values. Documents now matches Source search x56/y175/w271/h32/font14 and row tops279/359/439, with the original idle filter glyph. Paired delete alerts match270px width, radius14 and horizontal44px actions; native lacks Source backdrop blur/shadow. Messages input width/height matches but shared mailbox tabs remain compact44px rather than Source equal-width48px with22px top margin/new-item dot: native search y207 versus Source227, first row293 versus313. Prime/call, tutorial/theme miniature art, calendar/map, full dark screenshots and device parity remain fidelity work recorded in the freeze. This is migration evidence, not acceptance of complete pixel parity.

Fresh final checks:4 owned native suites/24 tests and4 affected Source suites/21 tests pass; whole native strict TypeScript and owned ESLint with0 warnings pass; `npm run audit:modules` passes (278 files). Independent review accepted the three regression repairs. Core's combined final `npm run verify`, assembled-host checks and device validation remain required after all groups finish.
