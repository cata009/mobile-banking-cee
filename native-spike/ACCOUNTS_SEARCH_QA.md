# Search → accounts/cards/payments QA

Owner: `native_italy_accounts_cards/read_only_qa` · base `538360ead4a6da9ae889f142f8d00e333f99412b` · checkout `C:\Users\mihai\Desktop\Mobile Banking - CEE`.

Compared actual RNWeb at `http://localhost:4006/italy-native.html?frame=0` with canonical **Reference Search** and existing DOM destinations at `http://localhost:4006/italy-migration.html?frame=0`. Dedicated Chrome tabs were created after the connector rejected hidden-tab visibility; the integration owner authorized this fallback. Existing user tabs were preserved. No ADB/emulator access, production edits, financial submissions, or exports occurred during this audit.

## Verified behavior

- `Andrea` produces the same 33 results, category counts, grouping, account/card category glyphs, clear-field affordance, row chevrons, and highlighted text. Empty-state clear restores the same three suggestion chips and focuses the field.
- Selecting `Andrea Rossini e Flavia Bianchini` opens account `000067890`, with book balance €18,100 and available balance €18,050. Back returns to the original `Andrea` query.
- Selecting the Edison movement opens the account `000012345` movement for €120 on 28/02/2025, with category Utenze/Energia. Closing/back returns to that account, then to the original Search query.
- The three duplicate `UniCredit My One` titles remain distinct targets. Selecting the `1234` suffix opens **Sofia Rossini**, not Andrea's `5678` or the delivered `8899` card. Back preserves `my one`.
- `Bonifico` produces the same three payment results. The first result opens the same account chooser. Choosing the second account opens account `000067890` in both implementations. This audit did not submit a payment or claim transfer-form completion.

## Confirmed defects before fixes

| Priority | Defect | Evidence / correction |
| --- | --- | --- |
| P2 | After opening account `000067890`, tapping Altro conto and then Conto leaves native on `000012345`; source restores `000067890`. | Preserve the original entry account separately from the current selection. Full accessibility states are in `accounts-search-qa-tab-return.json`. |
| P2 | Native account tabs expose no selected state and omit the source selected dot. | Native Conto `aria-selected` is absent; reference is `true`. Set selected semantics and source marker according to the selected account. |
| P2 | Detail amounts use one size/weight and omit grouping of four-digit values. | Native `+2000,00 €` versus source `+2.000,00 €`; restore `useGrouping: 'always'` and integer/decimal hierarchy. |
| P2 | Native movement marks are pastel 40px rounded boxes; source uses 32px colored circles. | Use source category colors, shape, and glyph size. Incoming amounts should use source green. |
| P2 | Native account summary starts earlier, back glyph is smaller, and Operazioni is centered/small. | Source has its header/content offset and right floating action with 172px outer width, 72px account height, white/bloom surround. Normalize browser screenshots by the phone scale before comparing. |
| P2 | Native card detail lacks the header privacy eye and source stacked favorite card. | Source minor card shows the Flexia favorite underneath, with card masks/shades. Native has one highly saturated card. |
| P2 | Native TUTTE LE CARTE is an outlined pill and adds a Google Pay row absent from source detail. | Restore the text-and-chevron action and exact source composition. Wallet remains reachable through management. |
| P2 | Native card pending movements are hidden behind a collapsed row and monthly spending bands are absent. | Source minor card immediately shows €50 pending e-commerce, then February spending total €15 and the settled books movement. Preserve canonical chronological rows/status. |
| P2 | Native cards use a full-width fixed footer for Operazioni. | Source uses the right floating pill and leaves the list scrollable beneath it. |

Search geometry is broadly faithful after accounting for preview wrapper scale. Native Search and source reference phone shells scale slightly differently in the desktop viewport; absolute page coordinates alone are insufficient to label a spacing defect.

## Evidence

All screenshots/state evidence are under `.codex-temp/universal-demo/accounts-search-qa-*`:

- `native-empty.png` / `source-empty.png`
- `native-results.png` / `source-results.png`
- `native-account.png` / `source-account.png`
- `native-movement.png` / `source-movement.png`
- `native-card.png` / `source-card.png`
- `native-payment.png` / `source-payment.png` (account chooser)
- `native-payment-form.png` / `source-payment-form.png` (the selected account destination; filenames retained as captured)
- `tab-return.json`

The integration owner subsequently authorized a native-only correction band for these findings. The report records the observed pre-fix state; later verification must append results rather than erase the original evidence.

## Bounded fidelity checkpoint

Production edits were atomically frozen for the integration owner's OTA packaging after 32 owned tests passed across six suites and scoped ESLint passed with zero warnings. The latest combined TypeScript command was blocked by an unrelated syntax error in `investments/Fiscal.tsx:11` (`ServiceLink as ServiceLink as Link`). The prior complete typecheck before the final formatter/style-only adjustment passed. This parse error also brought up Vite's error overlay on both QA tabs, preventing the remaining card screenshot comparison.

Changes at the checkpoint: original-account tab restoration; explicit selected tab semantics/marker; four-digit grouping and separate integer/decimal typography; source 32px category circles/colors; shared-shadow floating actions; source-sized layered card artwork/gradient shading and stacked favorites; card privacy eye; text-and-chevron all-cards action; pending rows visible on entry with dates/status; canonical monthly spending bands. The extra Google Pay row was removed from detail; wallet remains in management.

Normalized account measurements at 393 logical pixels, saved in `accounts-search-qa-account-normalized-after.json`:

| Element | Native | Source |
| --- | --- | --- |
| Tabs top / height | 134 / 56 | 134 / 56 |
| Summary top | 198 | 198 |
| Floating x / y | 205 / 746 | 205 / 746 |
| Floating width / height | 172 / 72 | 172 / 72 |

The first measured native summary was 10px taller than source (364.5 versus 354.5). The checkpoint removes the two 4px gaps from the book-balance column and corrects the amount's outer font baseline; adds the source 8px margin before movements. Re-measure after the Vite error is cleared. `native-account-after.png` records the first post-fix view before this final spacing adjustment.

Remaining inspection: final normalized card stack/artwork, pending row and month-band geometry, details footer bloom on Android, account partner banner/alphabet index, and secondary detail surfaces. These have not been labelled pixel-perfect or device verified by this agent. The integration owner controls the emulator; this agent has never used ADB.

The Fiscal owner subsequently repaired the import, and a fresh native full typecheck passed. The production freeze continues. Post-checkpoint card accessibility states confirm the correct minor card, stacked Flexia favorite, privacy eye, visible pending e-commerce, and February spending band. Screenshot capture was interrupted by a full Vite reload at 00:34:42 UTC while `NativeItalyApp.tsx` changed (`NATIVE_ITALY_REGISTERED_KINDS` Fast Refresh export invalidation). Those Home captures are intentionally labelled `*-card-interrupted-hmr.png`; they are not card fidelity evidence. Re-capture once integration packaging/edits settle.

## Final vector/detail checkpoint (36 tests)

Fresh owned Jest: **36/36 across six suites**. Scoped ESLint: **zero warnings**. Whole native TypeScript: **passed**. Root confirmed the Android SVG-as-bitmap failure (`RNSVG fetchDecodedImage failed`, unknown image format); CardArt now uses the Home owner's shared `VectorArtworkLayer` for original XML, preserving source dimensions and namespacing local definitions. The gradient SVG is explicitly absolute, preserving the source paint order on web and native. No source images were converted or modified.

The detail band also restores account/card partner content and account alphabetical controls/grouping. Stable evidence is `native-card-final.png`, `source-card-final.png`, and `card-normalized-final.json`. Normalized main card geometry agrees within 0.008 logical pixels:

| Element | Native | Source |
| --- | --- | --- |
| Heading top / height | 126 / 50 | 126 / 50 |
| Stack top / height | 192 / 279 | 192 / 279.008 |
| Active card top / height | 244 / 227 | 244.008 / 227 |
| All-cards top / height | 495 / 24 | 495.008 / 24 |
| Quick actions top / height | 559 / 104 | 559.008 / 104 |
| Movement section top | 695 | 695.008 |
| Floating x / y / width / height | 205 / 772 / 172 / 64 | 205 / 772 / 172 / 64 |

`account-normalized-final.json` shows tabs and floating geometry still matching. Summary top matches at 198; height is 354 native versus 354.5 source. The native account movement section starts at 560 versus source 560.5, but its full height is **730 versus 662** for the joint account. That remaining spacing defect is isolated to uniform row/group spacing; record order/IDs and amounts are unchanged.

Source computed spacing is saved in `ledger-spacing.json`: first/last rows remove the corresponding 16px top/bottom padding, single-row groups are 44px high with the divider hidden, adjacent groups have 40px top margin, dated group headings have 24px bottom margin, section heading has 16px bottom margin, pending container has 32px top margin and a 56px button (18px bold / 24px line, 16px vertical padding), section bottom padding is 40px. The native counterpart currently retains 16px row padding/bottom borders, 16px group gap/bottom margin and section gap, 64px pending row, and 16px section bottom padding. A separate bounded spacing repair was requested after the seventh artifact's assets are copied; production is held until root releases it.

Reference-only caveat: the source card heading is partly occluded by its overlay header's white extension, while native uses the flow header and remains readable. Main geometry above describes the underlying elements. Secondary detail surfaces and device-native bloom/bitmap behavior remain the integration owner's final verification responsibility; this report does not claim complete pixel identity.

## Bounded ledger spacing checkpoint (37 tests)

After root copied artifact 351, the released correction band changed only `accounts/AccountScreen.tsx` and `__tests__/italy-accounts.test.tsx`. The native account ledger now applies the source first/last-row padding and divider rules, 40px group margin, 26px dated heading with 24px bottom margin, 16px heading margin, 32px pending margin, 56px pending button, and 40px section bottom padding. The pending button uses the original source chevron and explicit expanded state.

Fresh paired browser measurements in `accounts-search-qa-account-spacing-final.json` give **661.99982 native versus 662.00003 source logical pixels** for the joint-account ledger. Single-row groups measure 44px, dated groups 94px, and the pending button 56px on both renderers. The previous 68px excess is resolved. Matched screenshots are `accounts-search-qa-native-account-spacing-final.png` and `accounts-search-qa-source-account-spacing-final.png`; both retain the selected joint account and collapsed pending list.

All six owned Jest suites pass **37/37**, scoped ESLint passes with zero warnings, and whole native TypeScript passes. The added regression compares the exact settled movement ID order to the canonical ledger, opens its exact pending movement, returns with expansion preserved, and verifies no mutation callback occurred. Financial data, source order, IDs, and pending amounts were not changed. The earlier 0.5px summary-height difference remains outside this bounded ledger band; device verification is still root's responsibility. Production is frozen again after this checkpoint.

## Advanced filter checkpoint (42 tests)

Source inspection confirmed that the former native five-field column omitted the period controls and account disclosures, used raw ISO labels instead of date controls, and differed in footer copy and amount/date placement. New owned `accounts/AccountFilters.tsx` and `cards/CardFilters.tsx` consume the shared native `DateField` and `FormField`, original calendar/search/down glyphs, canonical `accountPeriod` and `accountFilterError`. Dates display day/month/year and emit canonical ISO values; decimal commas normalize before canonical validation. No extra date bounds were added because the source fields have none. Account custom dates and amount ranges expand on demand; cards retain visible Dal/Al and amount pairs. Footer labels/order are Rimuovi Filtri and Applica.

Filter drafts now live separately from applied state and are discarded when their form closes. Account clear restores the source search/compact state. Applied account filters display source filter-summary copy, and sharing respects hidden/empty results. Hidden account/card amount fields are blank and disabled; account range-summary values are masked. The shared flow header composition remains Back/Profile, whereas source filters expose Help/Close, and the source account overlay title remains sticky on scroll. Those header/scroll-title differences were reported to root and are outside this body/date-control band. Shared primitives and frozen CardArt/Home geometry were not edited.

Paired normalized browser proof, at 393 logical pixels:

| Element | Native | Source |
| --- | --- | --- |
| Account section top / height: Tag | 80 / 90 | 80 / 90 |
| Account section top / height: Data | 202 / 232 | 202 / 232 |
| Account section top / height: Importo | 466 / 124 | 466 / 124 |
| Expanded account dates: top / width / height | 486 / 172.5 / 58 | 486 / 172.5 / 58 |
| Expanded account amounts: top / width / height | 744 / 172.5 / 58 | 744 / 172.5 / 58 |
| Card date fields relative to title: top / width / height | 468 / 176.5 / 56 | 468 / 176.5 / 56 |
| Card amount fields relative to title: top / width / height | 664 / 176.5 / 56 | 664 / 176.5 / 56 |
| Account footer buttons: width / height | 176.5 / 58 | 176.5 / 58 |

JSON evidence: `accounts-search-qa-account-filter-final.json`, `accounts-search-qa-expanded-filter-final.json`, and `accounts-search-qa-card-filter-final.json`. Expanded account source y coordinates include its 92px scroll offset; native measurements use its content container. Matched screenshots: `accounts-search-qa-{native,source}-{account,card}-filter-final.png`.

Fresh six-suite Jest passes **42/42**, scoped account/card ESLint passes with zero warnings, and whole native TypeScript passes. New regressions cover ISO/date display, period reference dates, comma decimals, reversed ranges, cancelled drafts, hidden values, exact canonical filtered movement IDs, detail/back identity, and absence of mutation callbacks. Ownership and exact delta are recorded in `accounts-search-qa-filter-ownership.json`. This filter-only band is frozen for integration.

## Filter header and account sticky-title checkpoint (44 tests)

Root extended ownership to the private `accounts/Primitives.tsx` Page composition for an opt-in filter header. Shared `DetailHeader` remains unchanged. Accounts expose Source Aiuto/Chiudi with no back/profile action; cards expose Indietro/Aiuto/Chiudi. Original account help/close SVGs occupy source 24px extents within 44px controls. Account Aiuto expands the exact source paragraph inline and announces expanded state; card Aiuto opens its actual source content in a bottom sheet. Closing or accepting help preserves the filter; hardware Back dismisses the card help sheet independently. No payment/profile destination is added.

Both headers measure control top70, Help x289, Close x341, each44×44; card Back is x8. Account title text measures x16/y134, width361/height36 before and after focusing lower expanded amount fields (native scroll192, source194). The source retains a 20px inset at its sticky scroll edge; the native sticky title band now retains that same inset without shifting the form's normal geometry. Account expanded help text matches x16/y194, width361/height48 and exact source copy.

Card help sheet proof also matches: panel x0/y576, width393/height276; title x16/y592,height36; close x345/y592,32×32; paragraph x16/y676,width361/height72; Ok x16/y780,width361/height56. The original 12px top radius, white background, 40% dimming, source spacing and bottom placement are retained. Browser dismissal confirms the same Dal/Al fields remain present after the help sheet closes.

Evidence: `accounts-search-qa-account-header-before-scroll.json`, `accounts-search-qa-account-header-scrolled-final.json`, `accounts-search-qa-account-help-final.json`, `accounts-search-qa-card-header-final.json`, and `accounts-search-qa-card-help-sheet-final.json`; paired screenshots use `*-account-sticky-final.png`, `*-card-header-final.png`, and `*-card-help-final.png`. The previous header/account-title residual in the 42-test checkpoint is resolved by this authorized band.

Fresh owned six-suite Jest passes **44/44**, scoped ESLint has zero warnings, and whole native TypeScript passes. Exact production delta for this band: `accounts/Primitives.tsx`, `accounts/AccountFilters.tsx`, `cards/CardFilters.tsx`. Existing account/card test files and this report are updated; ownership is recorded in `accounts-search-qa-header-ownership.json`. Default Page behavior, frozen detail geometry, Source code, shared header, financial data and policies remain intact. Production is frozen again for integration; Android rendering remains root's device-verification responsibility.
