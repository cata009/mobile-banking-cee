# Italy Mobile First detail header repair

Owner: `/root/italy_sticky_headers_repair`.
Checkout: `C:\Users\mihai\Desktop\Mobile Banking - CEE`.
Base: `538360ead4a6da9ae889f142f8d00e333f99412b`.
Ownership and initial shared pending changes are recorded in `pi-italy-sticky-headers-ownership.json`.

## Cause and scope

The account header was an absolute sibling of its body scroller at logical y=56, while `.mf-home::before` reserves an opaque 70-pixel system bar. Its upper 14 pixels were covered. Browser inspection confirmed the account page and outer wrapper do not scroll or transform: only the preview ancestor scales the entire canvas. The header stayed at y=56 with body scrollTop=0 and 745.5. Raising z-index would paint app navigation over the reserved system bar instead of correcting the offset.

Insurance used the same 56-pixel offset and 56-pixel full-page toolbar padding. PFM and loan headers already used y=70 but had 85% white surfaces, allowing scrolling body content to bleed through. The profile hub's sticky top=0 allowed its header to move behind the system bar.

Account and insurance navigation now starts at y=70, with body and compact-summary spacing moved down by the same 14 pixels. Their full-page toolbar controls reserve 70 pixels. Account, insurance, PFM and loan headers now use opaque white. The profile hub uses sticky top=70, margin-top=70 and zero scroller top padding. Browser testing caught that retaining 70-pixel scroller padding with sticky top=70 doubled the offset to y=140; moving the initial flow spacing to the header margin retains y=70 before and after scrolling.

Card and profile detail headers already have opaque surfaces at y=70. Investment pages already place their nonshrinking toolbar outside the independently scrolling body, with controls at y=70. These navigation implementations were audited and regression guarded.

The user's subsequent primary-title requirement exposed a second problem: primary page headings were ordinary body content. In Profile > Impostazioni, the title moved from y=120 to y=-128 when scrollTop reached 248. Settings also overrode its navigation to y=56 and explicitly hid its back button; services carried the same 56-pixel navigation override.

Canonical primary page heading selectors now stick within their existing independent body scrollers with opaque surfaces and opaque extensions over the surrounding spacing. This covers profile light pages, PFM inner pages, card pages with a primary title, loan subpages, account full-page overlays, insurance full-page headings and investment page headings. Section headings, card names and account/product identity blocks within summary sections remain normal content. ProfilePage exposes its existing chrome choice as a data attribute so dark result/receipt/login screens retain their title treatment. Light settings/services navigation uses y=70 and body padding=134; the Settings back button is visible. Source dark header overrides and logout behavior were preserved.

## Browser evidence

Inspected the local PI Italy Mobile First active demo on port 4004 using a dedicated background CUA IAB tab. The user browser was neither resized nor modified. Geometry was normalized from the scaled preview to the 393-pixel app canvas. Real `PageDown` keyboard actions scrolled the actual body regions; read-only DOM measurements followed the settled UI snapshots.

| Surface | Body scrollTop before → after | Header/control logical y before → after | Surface and click coverage |
| --- | --- | --- | --- |
| Account, before repair | 0 → 745.5 | 56 → 56 | 14 pixels inside reserved system bar; translucent |
| Account, repaired | 0 → 745.5 | 70–110 → 70–110 | Opaque white; back/profile hit tests pass |
| PFM | 0 → 682 | 70–110 → 70–110 | Opaque white; back/profile hit tests pass |
| Mortgage/loan | 0 → 745.5 | 70–110 → 70–110 | Opaque white; all navigation hit tests pass |
| Insurance | 0 → 654 | 70–110 → 70–110 | Opaque white; back/privacy/help/profile hit tests pass |
| Card | 0 → 745.5 | 70–110 → 70–110 | Existing opaque white; navigation hit tests pass |
| Profile hub | 0 → 745.5 | 70–136 → 70–136 | Opaque gray; profile/logout/close hit tests pass |
| Profile data detail | 0 → 745.5 | 70–110 → 70–110 | Existing opaque white; back/close hit tests pass |
| Investment profile toolbar | 0 → 642 | Controls 70 → 70 | Body excludes toolbar; back hit test passes |

Primary-title checks used actual `End`/`Home` keyboard scrolling and the app's device picker/Rotate preview controls. The browser viewport was not resized. All visible navigation controls passed hit tests; every pinned title surface was opaque white.

| Primary page title | Body scrollTop start → end | Logical title y start → end |
| --- | --- | --- |
| Impostazioni, iPhone portrait | 0 → 262 | 134–170 → 134–170 |
| I tuoi dati | 0 → 1486 | 134–170 → 134–170 |
| Supporto (two-line heading) | 0 → 1261 | 134–206 → 134–206 |
| PFM Utenze | 0 → 156 | 134–174 → 134–174 |
| Carte | 0 → 1140 | 126–162 → 126–162 |
| Loan information | 0 → 200 | 134–170 → 134–170 |
| Gestione Conto | 0 → 437 | 134–202 → 134–202 |
| Profilo investimenti | 0 → 1080 | 134–170 → 134–170 |
| Tutte le polizze, 848×600 preview | 0 → 801 | 134–170 → 134–170 |
| Tutte le polizze, rotated 600×848 preview | 0 → 553 | 134–170 → 134–170 |
| Impostazioni, 848×600 preview | 0 → 498 | 134–170 → 134–170 |
| Impostazioni, rotated 600×848 preview | 0 → 250 | 134–170 → 134–170 |

The Settings section heading moved from y=210 to y=-52 while its primary title stayed pinned, proving section headings remain scrolling content. Back and X remained at y=70–110 at both boundaries and both passed hit tests.

## Verification

Follow-up main-context navigation repair: the integration owner's actual browser QA confirmed that PFM's main title is the `Sezioni PFM` navigation rail rather than an h1; its static rail scrolled away. The account's `Conto` / `Altro conto` rail had the same static pattern. Both rails now use sticky top=0 within their existing scrollers, opaque white, minimum height=56 and z-index=16 beneath the fixed navigation's z-index=20. At the existing 134-pixel body inset, their expected logical band is y=134–190. Account's pre-existing compact summary moves to y=190 so it follows the rail; compact-search mode still hides the rail and restores the summary to y=134. Account's existing opaque header extension covers y=110–134; PFM now has the same 24-pixel opaque extension. Account identity blocks remain normal body content.

Three new main-rail regressions failed before this follow-up repair and pass afterward. Fresh targeted verification: 4 test files / 62 tests passed (header regression now 26, account flows 14, PFM 14 and account 8). New test ESLint passed with zero warnings and Prettier check passed. The integration owner performs the actual before/after rail and gap hit tests in its active IAB; resumed subagent IAB was unavailable, so no user Chrome tabs were touched for this follow-up. Reclaimed paths are frozen for that browser check and the combined final gate.

The new header regression suite first failed seven assertions for the confirmed unsafe offsets/translucency, then passed after the repairs. Further failing assertions guarded the profile sticky inset correction, primary-title layouts and light settings/services overrides. It parses real CSS rules and validates safe-area offsets, opaque detail header surfaces, reserved body spacing, full-page toolbar spacing, primary-only title selectors, Settings back-button visibility, preservation of dark profile titles and the header/body DOM boundary after scrolling.

Final affected suite: 11 files, 177 tests passed (header, account, card, PFM, loan, insurance, profile, settings, data, services and investment primitives). One subsequently added dark-title preservation guard was included in a fresh header-only run: all 23 tests passed. Owned TSX and test ESLint passes with zero warnings and Prettier formatting was applied. The initial PFM failures from concurrent category updates were reported to the integration owner and pass in the final affected run. Final combined `npm run verify` belongs to the integration owner after all editors freeze.

## Exact owned delta

Follow-up ownership recorded before editing the main navigation strips: owner `/root/italy_sticky_headers_repair`, same absolute checkout and base commit recorded above. Reclaimed paths are only `mobile-first-account.css`, `mobile-first-pfm.css`, the new header regression test and this document. Initial pending state for all four paths is untracked (`??`), because the entire Italy implementation predates this repair as operator work. Other production paths remain frozen.

Modified nine existing stylesheets:

- `src/experiences/pi/it/mobile-first/mobile-first-account.css`: header offset/opacity, scroll and compact spacing, full-page toolbar spacing, primary overlay heading and pinned main navigation strip with compact-summary spacing.
- `src/experiences/pi/it/mobile-first/mobile-first-pfm.css`: header opacity, inner-page primary heading, pinned main navigation strip and opaque gap extension.
- `src/experiences/pi/it/mobile-first/mobile-first-loans.css`: header opacity and direct subpage primary heading.
- `src/experiences/pi/it/mobile-first/mobile-first-insurance.css`: reserved system-bar height, header offset/opacity, scroll and compact spacing, full-page toolbar spacing and primary heading.
- `src/experiences/pi/it/mobile-first/mobile-first-profile.css`: profile hub sticky offset and initial flow spacing, light primary page heading.
- `src/experiences/pi/it/mobile-first/mobile-first-profile-settings.css`: light safe-area overrides and Settings back visibility.
- `src/experiences/pi/it/mobile-first/mobile-first-profile-services.css`: light safe-area overrides.
- `src/experiences/pi/it/mobile-first/mobile-first-cards.css`: canonical primary page heading.
- `src/experiences/pi/it/mobile-first/mobile-first-investments.css`: canonical primary page heading.

Modified `src/experiences/pi/it/mobile-first/MobileFirstProfilePrimitives.tsx` only to expose the already-selected chrome choice as `data-profile-page-chrome`.

Added `tests/screens/italy-mobile-first-detail-headers.test.tsx`, this verification document and `docs/tasks/pi-italy-sticky-headers-ownership.json`. No shared stylesheet, existing tests, assets, Git index or branch state were edited by this owner. The temporary private Vite session on port 5187 was stopped; verification used the integration owner's existing server on port 4004. All production paths are frozen for combined verification.
