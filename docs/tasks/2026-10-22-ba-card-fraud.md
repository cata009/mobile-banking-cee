# Bosnia baseline · Card protection and disputes

Owner and integration owner: `/root`. Base: `700c23395e1481225e0bc594d2b56ff8f50c6000`.
Checkout: `C:\Users\mihai\Desktop\Mobile Banking - CEE`.
Initial 918 pending paths and shared integration hashes are preserved in `.codex-temp/ba-card-fraud/ownership-before.json`.

## Approved intent

The user approved execution on 22 October 2026 after the conversational design review.
Create an English-language, Bosnia and Herzegovina / Banja Luka baseline demonstration in Flow Library, with a polished conceptual presentation in a modal like PRIME. No production banking service or publication is implied.

The journey begins on a photographic lock screen with the approved Bosnia app icon and lowercase `m-ba` notification. Tapping it plays the existing Face ID animation before opening suspicious activity. The default inbox has exactly three items: pending Carrefour POS, declined ATM cash withdrawal, and pending YouTube Premium online payment. The explicit after-posting scenario demonstrates a booked payment separately.

A recognised item moves under Reviewed without filing a dispute. Opening the Tell us what happened form creates an editable report intent and leaves the card unchanged. The customer can return and change their mind. The form collects reason, an optional statement of up to 1000 characters and optional photos, followed by review and explicit declaration. Only successful submission commits the report, moves the activity under Reviewed and temporarily freezes the card. A failed submission retains the draft without freezing an active card; an already closed card stays closed. The frozen-card message appears on the Report submitted success screen. Pending/declined events create fraud-report cases; booked payments create disputes. No standalone Activity reported page interrupts this path. The legacy screen ID aliases the form. No physical-card-possession checkbox or duplicate fixed reason remains. Photo evidence supports up to three JPEG/PNG/WebP files of at most 5 MB each, with local preview, removal and review. Retries do not create duplicates or lose entered information.

The transaction retains its linked case, submission date, current status, last update, next action, illustrative next-update and resolution dates. A case can need more information or end with an explained decision. Estimated dates are explicitly demo assumptions, never a claimed legal SLA or guaranteed refund.

Card replacement is separately confirmed and tracked. Confirmation permanently closes the compromised card; channel controls cannot reactivate it. ATM, internet and POS controls are independent. Country protection uses a simulated phone-country signal for physical POS/ATM only, never claims to locate plastic, and has explicit unavailable-permission/stale-location handling. No real location permission is requested.

## Source composition

Reuse `MiniPhone`, `PageHeader`, `PrimaryButton`, `NavigationRow`, `ToggleButton`, `TextField`, `TextAreaField`, `BottomSheet`, baseline transaction rows . Home, Cards, Card options and transaction details mount the actual Native baseline through `NativeScreenPreview`. Metadata remains UI-free. Canonical library: `FKbbStgBIP9bFAMl3DPKHF`; Toggle `1027:2244` was checked live against its existing contract. No Figma pages or components are authored or published.

The user explicitly requested a new generated wallpaper and selected the exact `m-ba` icon. Original PNG bytes are preserved in `src/assets/ba/card-fraud/`; provenance and hashes are recorded beside them. No rasterised executable controls or image conversion is used. The ATM reference `sQcjbRC5p4CmldGUqh0mrn/3751:10275` maps to the existing Finance category-circle glyph in both list and details. The Pending Action reference `zbvM791krgVgCQ8Xhq4ChV/1518:3742` maps to the existing Native pending banner.

Home uses that security banner as the first summary carousel card, with Total available second, adjacent-card peek, mouse drag/swipe and the existing clickable dots. The gap to Accounts is reduced. There is no extra footer under primary navigation or on Cards. Suspicious activity uses the existing baseline rows without extra horizontal padding or inter-row lines, grouped by count-bearing To review / Reviewed section dividers. Reviewed rows have no Reported or Confirmed by you label. The fixed Back to Home action is primary and has no separator above it.

Transaction details retain merchant logos, Pending/Declined status, date and time, and the same Debit Mastercard ending 5601 / Iacob Mihai identity as the inbox. POS/ATM show their location; online has no map. Spending Insights, payment shortcuts, Show more/less and the additional Transaction date are hidden through optional presentation contracts, preserving baseline defaults. Approved CTAs are Report unrecognised payment / I recognise this payment. The protection message is centered and neutral. Phone scrollbars are hidden while scrolling remains functional. Presentation market selectors, baseline labels and generic helper/disclaimer copy are removed as requested.

Card security is an executable existing NavigationRow under Card options → General settings. It contains ATM, Internet, In-store and inline Country protection. The original Block Card action also opens it. Reissue Card opens a full replacement page with toggle consent, one primary action and header Back. Duplicate replacement/status footers and Cancel are removed. The submission-scenario selector is removed from the presentation; the error scenario remains in Flow Library. Review has one primary Sign report/dispute action and the declaration toggle; editing uses header Back. Signing plays the existing FaceIdAnimation as a demo signature confirmation, then submits. Submission and freezing wait for completion; failure retains the draft and allows signing again. Read-only information uses stacked labels/values without row separator lines.

Submitted transaction details use the existing Native `BaselineBanner` helper variant, verified against Figma `zbvM791krgVgCQ8Xhq4ChV/715:6936` and its shared banner contract. The full card opens the linked report/dispute and sits below the gray summary, above Transaction details. The former bottom status CTA is removed. Sign report/dispute explicitly uses the same 18px label size in disabled and enabled states.

## Ownership

New: `src/features/cards/fraud/`, `src/flows/ba/card-fraud/`, `src/assets/ba/card-fraud/`, `tests/features/ba-card-fraud-model.test.ts`, `tests/flows/ba-card-fraud.test.tsx`, this document and the corresponding implementation plan.
Integration: flow types/index, FlowDetail, flowPreviews, screenSources, AccountTransactionRow, demo-native banking/transaction presentation contracts, Native baseline Body/Transaction/Card/CardOptions, and the two flow-module-ownership inventory tests. Pre-edit hashes for each shared path are recorded in the ownership file. Preserve existing edits, IDs, source exports and default baseline behavior. No package or branch changes. The user authorised the final commit and Vercel publication.

## Release verification

Journey and Specification consume the final canonical screen contracts. The presentation includes optional notes, Face ID signing, freeze after successful submission, generic success copy, a linked-case Helpers card, inline country protection, plain replacement explanations and one replacement completion action.

The demo card is Debit Mastercard · 5601, held by Iacob Mihai. Home shows the remaining unreviewed count and restores the original Total available summary once all activities have been reviewed. Restart starts a fresh demo session.

Only focused model, flow and source-inventory checks plus real-browser review and the required deployment build are included in this release. The full verify/coverage gate and additional validations are explicitly deferred at the user’s request.
