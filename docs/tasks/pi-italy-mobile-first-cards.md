# PI Italy · Carte / Card details

Owner: codex-pi-it-cards. Main checkout: `C:\Users\mihai\Desktop\Mobile Banking - CEE`. Base commit: `538360ead4a6da9ae889f142f8d00e333f99412b`. Initial pending changes and exact allocated paths are recorded in `pi-italy-mobile-first-cards-ownership.json`. No branch/index/commit changes were made.

## Source and scope

Figma file `d2TyUaQNN6YsgznQaWymIR`, page `23122:529133` (CARDS AREA). The supplied node `24262:373993` is an empty background frame. Implemented from its adjacent flow sections and high fidelity design contexts: card detail `24262:453953`; debit/prepaid `24262:453926` / `24262:453985`; hub `24262:460197` and visible child frames; personalization `24262:453549`; management `24262:457076` and its section children; card info `24262:457210`; PIN `24262:457459` / `24262:457482`; number/CVV `24262:456835`; movement detail `24262:454223`; filters `24262:459159`; split `24262:455110`; sharing `24262:455480`; problems `24262:458319`; activation `24262:456174`; plafond `24262:458432` / `24262:458492`; installments `24262:458606` / `24262:458621`; premium `24262:455920`; wallet `24262:459631` / `24262:459667`; replacement `24262:457558`; repayment `24262:457716` / `24262:458059` / `24262:457621`.

Banking actions and authorization are demo simulations. Mobile Code accepts five digits and Face ID reuses the existing demo animation. No real banking API, device biometric access, Apple/Google wallet provisioning, contract signing, or external support call is invoked. PIN/CVV appear only after demo authorization, expire after 15 seconds, hide on document visibility change, and are excluded from the persistent snapshot.

The management menu exposes inferred demonstration continuations for geography, shop/channel controls, debit date, repayment amount, card-image preference, renewal, parental controls, physical-card/duplicate requests, ISEE and missions where the source shows an entry but lacks complete executable policy. These are distinguishable from production capabilities; all selections are local demo state. The installment cost/rate copy and dates are design fixtures, not live loan quotations. Home/PFM/Conti and other countries retain their own implementation owners.

## Integration contract

`MobileFirstCards`: `onClose`, optional `initialCardId` (`flexia` / `my-one` for Home entry), `initialView` (`hub` / `detail` / `pin`), `onOperations`, `externalOverlayOpen`, `initialSnapshot`, `onSnapshot`. `ItalyCardsSnapshot` lives in `cardsContent.ts` and contains cards plus movements keyed by card ID. Home retains this snapshot across closing/reopening. Secret values and authorizations never enter it. Favorites/name/status/plans/settings and note/category/exclusion/split edits survive re-entry when Home supplies the snapshot.

`selectHomepageCards` in the feature module respects configured debit/credit/prepaid counts, favorite order, and blocked/suspended status, returning at most two Home cards. The integration owner owns `MobileFirstHome.tsx`, `MobileFirstCategoryPanel.tsx`, the common scope manifest and combined verification. Cards has no direct edits to these files.

## Delivered behavior

- Hub: favorite stack, owner tabs, operative/blocked/delivery sections, hide/show inactive cards, accessible favorite reordering and renaming.
- Detail: source artwork layers and dimensions, stacked cards, privacy toggle, capability-specific quick actions, movements and pending/preauthorization badges, shared operations entry.
- Movement: text/date/absolute-amount search, empty state, filters reset, notes, category/subcategory, inclusion/exclusion, validated split with cent-preserving remainder. Selected movements export actual XLSX or PDF; hidden amounts remain hidden in exports. Monthly statements export PDF.
- Management: card info, authorization-gated and timed PIN/CVV, suspend/resume/permanent block, received-card activation, duplicate/physical-card request, credit limit selection/signature/authorization, installment selection/plan/duration/authorization, premium plan list, repayment changes and debt reimbursement, wallet authorization.
- Escape returns through the current flow step and does not close the underlying card while an external operations overlay is open. Modal background is hidden from accessibility queries during authorization.

## Verification

Affected tests: `tests/features/mobile-first-cards.test.ts` and `tests/screens/italy-mobile-first-cards.test.tsx` (36 tests), plus the existing `card-detail-boundaries.test.tsx` (17 tests): 53 passed. Targeted ESLint and Prettier checks pass. `npm run audit:modules` passes. Independent review findings were repaired with regression proof: holder identity stays separate from nickname, allocated expenses cannot be rateized twice or exceed remaining capacity, both split categories survive reopening, prepaid recharge updates available and ledger balances, blocked cards cannot report suspension, saved artwork/installment amount are consumed, and checkbox selections can be cleared.

Primary credit detail, management and masked PIN were inspected in the localhost browser against the reference screenshots. A separate ignored QA harness (`.codex-temp/pi-italy-cards-qa.html`) isolates Cards from concurrent shared Home/Profile edits. Artwork layering was verified there, with zero broken image elements. Static SVG dimensions are retained and all asset files are local. `.codex-temp/pi-italy-card-details-final.jpg` contains the isolated card preview.

At the last global typecheck snapshot, errors were confined to concurrently edited Profile files (`MobileFirstProfile.tsx`: unused useContext / missing Promotions and Branches; `MobileFirstProfileHub.tsx`: replaceAll target). Shared Vite restarts, stylesheet HMR failures and a transient `MobileFirstInvestments.tsx:141` syntax overlay interrupted manual continuations; the appropriate owners were notified. Home snapshot wiring is confirmed in source and in the actual browser: rename the card to Viaggi, return to Home, reopen Flexia, and the Viaggi heading remains visible. Home tile/favorite composition is owned by integration. Global `npm run verify` must be run by that owner after the relevant editors have finished. This task does not claim a combined green gate.
