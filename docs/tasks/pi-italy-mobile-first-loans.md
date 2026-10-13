# PI Italy — Mutui e Prestiti implementation

Owner: `codex-pi-it-mutui-prestiti`. Existing checkout: `C:\Users\mihai\Desktop\Mobile Banking - CEE`. Base commit: `538360ead4a6da9ae889f142f8d00e333f99412b`. Initial pending changes and allocated scope are recorded in `pi-italy-mobile-first-loans-ownership.json`. No branch, index, commit or existing unrelated file changes were made by this owner.

## Integration contract

`MobileFirstLoans` accepts `initialLoanId?: string`, `initialView?: 'detail' | 'list' | 'simulations'`, and `onClose: () => void`. The canonical initial IDs are `mortgage-milano` and `loan-auto`.

`MobileFirstLoansPanel` accepts `onOpen: (loanId?: string, initialView?: LoansInitialView) => void`. The panel derives holdings from the Italy demo portfolio counts and respects amount visibility. The Home owner connected this through the existing CategoryPanel slot. The legacy CategoryPanel sheet callbacks remain available for other callers and existing tests. Home, CategoryPanel and all shared infrastructure changes belong to the integration owner.

## Implemented journeys

- Portfolio counts: empty, single, exactly two, and larger loan/mortgage mixes; direct switching between two products and the full list for larger portfolios.
- Selected loan detail, capital information, annual installments and individual installment details. Year selection changes dates and installment references. Negozio Mutuo retains its separate repayment/installment fixture.
- Favorite selection, ordering, name changes, restore default name, cancel/save and persistence after reopening.
- Interest certificate preview and downloadable PDF of the demo data. Native file sharing is available where supported; browser download is the fallback. Amount privacy is applied at export time as well as on-screen.
- Mortgage simulation introduction; purpose, first-home choice, property value, requested amount, birth date and duration; four selectable quote types; recalculation, save naming, success/failure and retry, restored saved simulations and the expired simulation example.
- Validation follows the design's minimum age18 and maximum maturity age80, checks finite positive amounts, and explains invalid entries inline. Hidden mode also masks editable amount/date fields. Invalid edits never reach the payment calculation.
- Product promotions and the local product catalog; FAQ/contact entry points retain the selected product context.

Business rules, catalog selection, repayments, calculation, validation and restored-simulation schema live in `src/features/credit/mobileFirstLoans.ts`. The experience composes the UI and sourced copy. Versioned browser storage is scoped to this Italy credit demo.

## Design evidence

Figma file: `d2TyUaQNN6YsgznQaWymIR`, page `23122:492377` (CREDITS AREA). The supplied node `24262:582989` is the empty background. High-fidelity design context and screenshots were retrieved for the actual experience frames, including:

| Journey | Reference nodes |
| --- | --- |
| Detail and product-count variants | `24262:583137`, `24262:583194`, `24262:583201`, `24262:583247`, `24262:583293`, `24262:583346`, `24262:583353`, `24262:583360` |
| Full list and personalization | `24262:583408`, `24262:583598`, `24262:583898` |
| Information, installment, document, help | `24262:584088`, `24262:584215`, `24262:584291`, `24262:584534`, `24262:585774` |
| Calculator and save outcomes | `24262:584584`, `24262:584592`, `24262:584659`, `24262:584693`, `24262:584727`, `24262:585229`, `24262:585258`, `24262:584761`, `24262:584797`, `24262:584833`, `24262:585193`, `24262:584869`, `24262:584906`, `24262:584943`, `24262:585000`, `24262:585068`, `24262:585367`, `24262:585377` |
| Saved and expired simulation | `24262:585482`, `24262:585288`, `24262:585556`, `24262:585599` |

All newly used static images/SVGs were downloaded into `src/assets/mobile-first/it/loans/`, with source provenance in `pi-italy-mobile-first-loans-assets.json`. Existing exact shared images and the original loan promotion photos are reused. Source images were not deleted or converted. SVG root dimensions are retained. The connected Angular `unicredit-logo.component.ts` referenced by two Figma yes/no controls does not exist in this React repository; those controls use accessible text choices.

The capital information screen preserves the explicitly inconsistent Figma fixture (12.500/2.000/10.500 with8%/92%) without silently changing it. Quote amounts are calculated from the displayed TAN, principal and duration; the CAP benchmark can differ by one cent from the rounded design snapshot. Annual dates follow the chosen year instead of repeating the prototype's placeholder date on every row.

## Verification and handoff

`npx vitest run tests/features/mobile-first-loans.test.ts tests/screens/italy-mobile-first-loans.test.tsx --maxWorkers=1`:17tests passed (6feature,11UI). Tests cover selection, context preservation, installment years, favorites/name persistence, exact count variants, privacy, the full calculator/save/reload journey, malformed stored data, PDF cross-reference offsets and recovery after a storage failure.

Scoped ESLint passes with zero warnings; scoped Prettier checks pass. `npm run audit:modules` passed. Independent review findings were reproduced and fixed, including same-kind/cross-kind help navigation, unreachable validation errors, masked-field exposure, malformed persistence and non-finite edits.

Browser checks confirmed the actual Home→credit detail entry, information and full-list layouts, and all six calculator steps through quotes. Concurrent editors repeatedly triggered HMR during longer browser sequences; save/reload/error paths are proven by the automated UI tests. A393×852 browser harness is available at `http://localhost:4004/docs/tasks/pi-italy-mobile-first-loans-qa.html?view=simulations`; it uses the production components. The preview screenshot is `pi-italy-mobile-first-loans-preview.png`.

This remains a banking demo: documents, quotes and persistence use the supplied sample data and local storage, and contact sheets are informational. No live banking, consultant message or remote publication is implied.

The integration owner must run `npm run verify` on the final combined state after all allocated editors finish. Intermediate global typechecks encountered errors in other actively edited account/profile/investment files; no owned Loans errors were reported. Shared files and unrelated pending changes were left intact.
