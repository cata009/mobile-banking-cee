# PI Italy Mobile First funds coverage

Owner `/root/investment_funds`; checkout and initial preservation record: `pi-italy-mobile-first-investments-funds-ownership.md`. Base commit `538360ead4a6da9ae889f142f8d00e333f99412b`. Only new funds-owned paths were changed. No branch, index, commit, Home, router or shared primitive edits.

Source: Figma file `d2TyUaQNN6YsgznQaWymIR`, page `24262:641750`. The parent index contains 673 source frames. The funds slice has **257 source frames in 12 section families**. These are source inventory counts, not a claim of 257 separately verified pixel-identical screens.

| Source family | Frames | Runtime representation |
|---|---:|---|
| Vetrina Fondi | 9 | Catalogue, source Novità/Idee/PAC offer lists, search entry and advanced filters |
| Fondi Ricerca | 13 | Name/ISIN search, populated/empty results and manager/type/category/distribution filters |
| Schede fondo | 7 | Scheda, Performance, Composizione expansion, Commissioni, Documenti |
| Posizione fondo PIC | 5 | Position, detail, additional data and last orders tabs |
| Posizione fondo PAC | 12 | Position tabs plus editable accumulation-plan parameters/status |
| Posizione fondo CASO PIR | 2 | PIR deposit selection and three source plafond progress summaries |
| Posizione fondo Conto gestito | 6 | Position tabs and managed account parameters |
| Posizione fondo Risparmia e investi | 7 | Two source holdings, position tabs and service operations |
| Gestione ordini | 7 | Order list, filters, pending/executed detail, cancel confirmation and result |
| Dispositive fondi PIC | 51 | Quote/amount reimbursements, additional investments, subscription and switch with proventi, summary, documents, signature, wrong code and result |
| Dispositive fondi PAC | 89 | PAC subscriptions/insurance, reimbursement/switch, advance, modify, suspend, reactivate and revoke flows |
| Funzionalità Risparmia e investi | 49 | Eligible funds, activation, parameters, source help overlays, summary/documents, modify, suspend, resume, revoke and signed results |

High-fidelity reference contexts were fetched for the portfolio card/allocation/eight holding cards; catalogue and three offer details; PIC/PAC positions; savings/managed position tabs; five sheet tabs; PIR; order list/filter/detail/cancel; PIC/PAC operation entry/amount/summary/documents/signature/code/success and savings lifecycle forms/help. Sparse section responses were used to discover children, never as implementation code. Portfolio screenshot is saved beside this ledger. Every runtime image uses a local source asset; SVG intrinsic dimensions are preserved.

Route API: `portfolio` (embedded), `catalog`, `search`, `fund`, `sheet`, `orders`, `savings-plan`, `pir`, `operation`. Operations accept `subscribe`, `add`, `refund`/`redeem`, `switch`, `activate`, `modify`, `advance`, `suspend`, `reactivate`, `revoke`; source exceptional subscription routes also support `subscribe-inadequate` and `subscribe-restricted`. The advisory instrument `IT0005418741` retains its exact source name/ISIN; an unavailable quote is shown as N.D., never replaced with another instrument.

Executable amount/PAC/savings/signature rules live in features. Signed orders, cancellations and per-instrument plan parameters/status persist in validated local storage. Legacy v1 single-contract state is migrated into its selected instrument record on read; updating another instrument preserves it. The code gate accepts only demo `123456`; a wrong six-digit code leaves storage and plan status unchanged. Returning to edit a payload clears document acknowledgements and code. Zero investment products show empty holdings/orders. All balance/quote/card values and chart scale/min-max labels honor global amount privacy.

Validation: **24 scoped tests pass** (16 UI, 4 policy, 4 storage); scoped ESLint with zero warnings passes; scoped Prettier check passes. Parent owns final combined `npm run verify` and browser QA. The review regressions cover wrong six-digit code, chart privacy, distribution filters, independent savings contracts after reopen, legacy state migration and revised-payload consent.

Practical limits: this is the existing local banking preview, with local transaction outcomes. Figma provides an illustrative NAV graph and a FACSIMILE document image, not authoritative historical price series or downloadable legal PDF payloads. Period selection retains the supplied graph rather than fabricating additional market data. Document viewers preserve identity and consent behavior; no genuine financial-document download is claimed. Native input focus/keyboard behavior and shared page chrome represent keyboard/header siblings; all 257 sibling screenshots have not received separate browser pixel comparison. Offer/thematic links use the available source lists/search; a full asset-manager directory was not provided in this slice. These limitations must stay visible in the parent completion report rather than being counted as separately implemented reference screens.
