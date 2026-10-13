# PI Italia Conti implementation

Owner: codex-pi-it-conti. Existing checkout, base 538360ead4a6da9ae889f142f8d00e333f99412b. Scope is recorded in pi-italy-mobile-first-conti-ownership.json.

Reference: Figma d2TyUaQNN6YsgznQaWymIR, page 23122:529199. The supplied 24262:147492 is a blank background behind the actual Conti sections. Use its sibling account screens as canonical references.

- [x] Characterize existing account behavior; add regression tests for settings, saved names, filters, notes and account personalization.
- [x] Introduce account-only feature policies for date/amount search, validated names, favorites and transaction splitting.
- [x] Implement full-height account overlays using existing accessible BottomSheet; reuse current assets and download exact new Figma assets.
- [x] Implement account list/personalization, settings and details, movement management and search/results/export.
- [x] Complete local account import/consent, BANCOMAT Pay and chequebook reference screens.
- [x] Verify affected tests, scoped lint/format, module audit, isolated build and visual checks. Full-project TypeScript/verification is handed to the integration owner after concurrent editors finish.

Preserve Home/PFM/Card/Loan edits. No shared navigation, package, metadata or Git index mutations. Combined npm run verify belongs to the integration owner after relevant editors finish. No real bank submission, mail delivery, remote consent or publication is part of this demo.

## Validation and integration handoff

25 Conti tests pass: 8 existing account tests, 12 flow/regression tests and 5 policy/export tests. Scoped ESLint has zero warnings, scoped Prettier passes and module audit passes. Independent read-only review initially found privacy, persistence, search-return and service-state defects; fixes have regression tests and the follow-up reported no unresolved important findings.

Browser checks confirm Info conto, filter form, account list, exact local icon geometry and non-empty assets. Downloaded PDF/XLSX contain only Spotify for the Spotify filter, with amount -10 EUR; neither contains Edison. A dedicated static QA build was used because concurrent HMR repeatedly reset the main checkout preview. Its output is ignored under .codex-temp/pi-it-conti-qa; the helper server is stopped after checking.

The intermediate whole-suite run had 2389 passing tests and two failing files: italy-mobile-first-profile.test.tsx (Profile module still under construction), and the Conti consent test before its fix was loaded by that run. The consent regression now passes in the affected rerun. The final combined npm run verify remains required from the integration owner.

Compatible account props: account, onClose, onOperations, externalOverlayOpen; new initialView: detail | accounts. Pure preference API: getAccountPreferences, subscribeAccountMovementChanges and selectHomeAccounts in mobileFirstAccounts.ts. Home owns consumption of saved names/favorite order. Movement overrides use explicit account number + stable fixture movement ID. PFM's separate January 2026 snapshot has no invented identity aliases to Conti's February 2025 snapshot.

Ruling: Figma hidden-state 24251:145602 keeps the name and account number visible and masks only amounts, preserving grouping and masked decimals. Info/exports/amount inputs retain their own privacy guards. listBalance is an explicit reference presentation value where the Figma list snapshot differs from the detail snapshot.
