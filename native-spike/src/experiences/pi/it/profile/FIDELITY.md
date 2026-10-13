# Italy profile source-state ledger

Source authority: `src/experiences/pi/it/mobile-first/MobileFirstProfile*.tsx`, the corresponding profile CSS and content modules, and canonical `src/features/profile` policies. Native implementation lives only in this directory. The source reference is `http://localhost:4006/italy-migration.html?frame=0`; the native reference is `http://localhost:4006/italy-native.html?frame=0`.

“Covered” means the stated content/actions/state transitions are implemented and the listed evidence was checked. It does not imply pixel parity for unobserved branches. The system safe area belongs to the host. Original source artwork is imported unchanged.

## Current verified batches: documents, advisors, practices, security, and chrome

| Source file/state | Native state | Coverage and evidence | Remaining work |
|---|---|---|---|
| ServicesDocuments / list | list | Source five tabs, certificate calls to action, title-side settings/filter toolbar, date/category/reference cards, unread styling; source/native browser comparison | Recheck final spacing after title/grid adjustment; sticky heading during scroll |
| ServicesDocuments / filters | filters | 3M/6M/12M preset fields, original category/owner labels, uploaded repository and report subtype controls; Jest date and depth tests | Native date-picker refinement belongs to shared controls |
| ServicesDocuments / applied filters | list | Applied period/category/owner summary; canonical maximum depth validation; keyword results | None identified in this batch |
| ServicesDocuments / read selection | list, read mode | Select-visible-only, exact ID mutation; hidden card record unchanged in Jest | None identified in this batch |
| ServicesDocuments / sharing selection | list, share mode | Exact selected IDs; explicit confirmation; cancellation has no platform action in Jest | None identified in this batch |
| ServicesDocuments / preview | preview | Original paper header, category, rapport/reference, watermark and horizontal lines; exact ID entry | Browser comparison of paper body pending |
| ServicesDocuments / share-confirm | share-confirm | Source warning text, selection count, Prosegui/Annulla; native file/clipboard untouched until user chooses an action | Browser comparison pending |
| ServicesDocuments / share | share | PDF filename, Scarica PDF, Copia riepilogo; selected title copied; real shared byte-file port tested | Source PDF generation returns Blob; exact PDF-byte parity is separate from native paper rendering |
| ServicesDocuments / archive/restore | list/preview | Canonical archive/restore by selected ID and source tabs reset | Browser archive styling pending |
| ServicesDocuments / delete | delete | Canonical uploaded-only deletion eligibility; source warning wording and return-to-list | Browser confirmation presentation pending |
| ServicesDocuments / certificate | certificate | ISEE and Titolarità conto entry, select-all versus single relationship radio cards, canonical fixture metadata | Source/native browser comparison pending |
| ServicesDocuments / certificate-options | certificate-options | Separate type step, Saldo/Giacenza media, original 2020–2024 year tabs; selected2023/type preserved in Jest | Browser comparison pending |
| ServicesDocuments / generating | generating | Source circular67% demonstration and preview transition | Browser comparison pending |
| ServicesDocuments / settings/code/saved | delivery/auth/saved | Canonical8digit authorization, per-relationship radios, masked email edit, history, private advisor condition; biometric bypass disabled | Installed file sharing and final visual audit |

## Remaining ordered batches

| Source group/states | Existing native coverage | Next concrete work |
|---|---|---|
| ServicesBank / home, advisor, branch | Branch/remote/private/cfe variants, source quick actions, hours, branch details and active/closed appointment groups;7 Jest variant cases | Per-state browser comparison |
| ServicesBank / booking, notes, slots, booked | Canonical validation and booking, draft preservation, shared PDF | Exact labels/date-slot grids, source success grouping and advisor composition parameters |
| ServicesBank / appointment, manage, cancel | Exact appointment ID, canonical management cutoff and cancellation | Presentation audit of each state |
| ServicesBank / phone, email, chat | Source-safe demo phone, draft-only email, source chat intro/bubbles, advisor-specific action availability; remote/cfe/private regression cases | Final bubble spacing comparison |
| ServicesCommunications / list, filters, detail | Exact IDs, canonical filtering/read/archive, source service cards, tag/date presets, applied filter summary and visible selection | Browser comparison and filter spacing |
| ServicesCommunications / practice, interview, signature, success, cancel | Canonical servicePracticeInteraction gates: exact MIFID signature, overdraft upload, advice-to-MIFID link and readonly states; source interview paper and contacts; filtered OS metadata picker, cancellation/invalid/stale guards and explicit unavailable-only fixture; regressions prove overdraft remains incomplete | Installed OS-picker verification on new base APK; remaining result spacing |
| SettingsSecurity / security, credential | Canonical PIN/Mobile Code rules and authorization | Source action layout and rule presentation |
| SettingsSecurity / create-contacts, create-contact, contact-code, create-card | Canonical verification/code creation and original Genius Card artwork | Contact screen layout audit |
| SettingsSecurity / signature-menu, signature-doc | Effective signature state, source certificate acknowledgement through canAcceptProfileDocument, original warning actions | Menu spacing audit |
| SettingsSecurity / accesses, filters, export/send | Separate date/channel filter, applied summary, source access rows, hide/show email, contact verification return, filtered real byte-file export and explicitly simulated delivery;4 filtered row bytes tested | Installed share-sheet proof and per-state layout audit |
| Notifications / login, approve-transfer, approve-card, master, slave | Exact request IDs and decisions; canonical Mobile Code | Dark authorization, teal/yellow results with original40px icon before title and Chiudi, scoped chrome reset; remaining exact request group audit |
| Notifications / debit-info, bank-access, transfer-info | Original fullwidth213px heroes,55% shade, actual host top inset, white controls and72px bottom-aligned title; browser debit receipt compared | Preview status glyph color/installed hero inset, actionable info number |
| Settings / general, devices, checkup | Canonical preferences/devices/missions; original articles/assets | Remaining per-state visual audit |
| SettingsCommunications / notifications, newsletter, privacy | Canonical draft/authorization/consent flows | Original source document images at1654/2339 aspect; canonical privacy PDF acknowledgement; remaining state layout audit |
| SettingsBank / limits, dispositions, relationships, quick, third-party, withdrawal | Canonical validators, expiration, consents and authorization | Remaining source intermediate pages and presentation audit |
| DataPersonal / personal, contact edits, correspondence, portability, questionnaire | Source grouped default view; canonical policies; separate Mobile Code and OTP instances | Portability document and remaining form presentation |
| DataContacts / list, detail, edit, merge, quick, delete | Original grouped list/quick icons and canonical relationship/merge rules | Remaining edit and merge-review visual audit |
| DataIdentity / list, detail, capture, preview, form, NFC | Canonical validation; original document and demonstration assets | Fixture camera/NFC stages remain explicitly demonstrative; physical APIs not in this area’s scope |
| ProfileHub / notifications, messages, practices, Altro, offers | Original icons, badges, cards, carousel assets; exact routes | Remaining full-scroll comparison |
| Extras / personas, token, apps, promotions, partners | Canonical persona/token/promotion state, source app grid and partner cards | Original promotion consent/share overlays and remaining carousel spacing |
| Support / home, topics, articles, tutorials, guides, phone, chat | Exact searched topics, original quick actions/tutorial content and contextual routes | Remaining per-state visual audit |

## Preserved integration review regressions

- Personal Mobile Code and phone OTP have distinct component keys. The OTP starts empty and cannot reveal a reused password.
- Unavailable biometrics do not activate the canonical biometric preference. An explicit simulation is labeled as a simulation and leaves actual activation disabled; cancellation never activates it.
- Header and Android hardware back from photo deletion return to image choices.
- Contextual help retains form drafts and only the active profile route registers an Android back handler.

## Shared Core integration

Owned profile text now consumes `universal/Typography` so the canonical `profileSettingsStore.textSize` preference applies the source scale **1.125** while preserving system font scaling. Core has connected the screenshot preference to Android `FLAG_SECURE`; actual device checks remain with Core and the final APK verification. No shared files, source files, build scripts or original assets were edited for this batch.

## Latest verification checkpoint

84 focused Jest cases pass; native TypeScript passes. Scoped ESLint is checked with zero warnings required. Browser receipt placement was compared with the source. Root owns installed APK/runtime/style-generation and status bar evidence. Android diagnostic evidence confirmed that RN0.87 ScrollViewStickyHeader transferred the style of its direct row child to the wrapper and reset the inner child to flex:1. A plain outer sticky View now protects the unchanged nested header row. The actual RN component regression failed before this fix and passes afterward; Root verified the fix on installed Android API28 via local OTA: name bounds[42,73][786,168], Logout[797,63][912,179], Close[923,63][1038,179], with horizontal source geometry restored and diagnostics absent. Temporary diagnostics were removed. Hub is the only owned profile sticky-header site. No full pixel-parity claim is made.



## Installed Android evidence and picker boundary

Root’s native-profile-header-fixed.png captures the corrected Hub on Android API28. Root also verified that the Famiglia con figli draft remained checked through background/resume and a pending OTA; the update applied only after closing to Home at the safe point. This evidence covers those states and does not establish other profile state parity.

Overdraft selection now calls platform/filePicker.pickLocalDocument(false). It stores/display names only; no URI persistence, byte read, bank upload or signature completion. PDF/PNG/JPEG selection is checked, cancellation retains the previous name, duplicate taps and inactive/stale results are ignored, and readonly practices have no picker action. The explicit fixture is available only for the port-unavailable error; operational errors and invalid files do not expose it. The native port requires Root’s next base APK; installed picker evidence is pending. Camera, gallery/photo persistence and NFC remain separate fixture stages.


## Settings row affordance audit

Source ProfileRow intentionally renders › at32/32 for ordinary rows, including General. This remains native text. Main Settings CSS hides that affordance and uses48px rows,8px spacing,40px groups,24px icon frames and natural original SVG sizes (for example Devices14x22). Source Security suppresses the generic arrow and uses MODIFICA with edit.svg, GESTISCI/VISUALIZZA with forth.svg, both16x16, and bold14/18 teal action text; screenshot/signature badges use regular14/18 and canonical state colors. These contexts are now composed separately without changing the generic row default or explicit custom action labels. Security row order and Mobile Code Creazione/Modifica submenu match the source, with min56px rows, zero inter-row gap,40px title spacing and no last-row divider.

Browser1 screenshots/DOM measurements compared both menus. Source PIN row label/action fonts were18px/14px; source width311.55,height49.19 and native width318.97,height50.36 reflect their different frame scales and the same57px composed row. Source/natural asset geometry was read from the original SVG roots. Three added tests reproduce the menu/security affordance defects, assert vector sizing and preserve the ordinary-arrow quirk. Installed Android row verification remains pending with Core; this is not a full profile parity claim.


## Bottom safe-area colour callback

Page now passes navigationBackgroundColor equal to its existing page background. Approved results supply teal007a91, warnings supply yellowf3c200, and authorization supplies454545. Receipt heroes continue using status background151515 while their bottom area stays white. The final focused regression covers all four states and restoration; the84-case profile suite passed. Core owns the separate host bottom-inset painting and installed Android15 verification. Scoped profile lint passes; the latest global native TypeScript run was temporarily blocked only by an unrelated PFM NumberFormat test cast, with no profile errors.


## Root installed checkpoint: frozen Italy0.3 CB08

Root installed the final frozen native review APK on Android API28 and35. API35 final-api35-settings.png shows original Settings glyphs and the arrow-free main menu. final-api35-receipt.png proves the teal result now fills the gesture navigation inset; status and bottom page surface use the separate approved chrome fields. Earlier API35 native biometric dialog/cancellation/success evidence used an enrolled emulator fingerprint, not physical face recognition. Physical-phone and all-leaf-state pixel acceptance remain pending; these captures establish only the shown states. Private OS document picker selection was exercised in the earlier base checkpoint; current every-state acceptance remains separate.