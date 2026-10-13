# PI Italia Mobile First — financial reconciliation

Owner: root integration. Checkout: `C:\Users\mihai\Desktop\Mobile Banking - CEE`. Base: `538360ead4a6da9ae889f142f8d00e333f99412b`.

This is a reconciled **demo ledger**, dated 28 February 2025. No live bank feed, market feed, or external statement was supplied. Illustrative Figma amounts are replaced by the ledger's derived amounts while retaining the design and flow identities. The change applies to the PI Italy Mobile First composition.

## Money contracts

- All postings, holds, plan rows, fees and positions use integer cents. Formatting happens at the UI boundary.
- Account book = opening balance + settled postings. Availability = book + overdraft − pending debit holds − other unavailable amounts.
- Debit purchases have one economic event shared with the funding account, so PFM counts the expense once.
- Credit debt, pending authorizations and remaining installment fees determine available credit. Prepaid cash remains an asset even when the card is blocked; suspended credit remains a liability.
- Recharge and credit repayment move equal amounts between ledgers and do not create PFM expenses. A repeated transaction key does not debit again.
- Category splits conserve the original cents; exclusions and recategorization propagate to account/card details, search, charts and exports.
- PFM uses the same selected relationships, reference period and canonical events as Home. The complete eight-card hub portfolio is included when enabled. Imported accounts are included independently of homepage favorites.
- Budget targets and manual wealth are user plans, separate from observed transactions. They are validated and persisted.
- Investment purchase cash includes the actual modeled commission. Cancellation releases the exact hold; execution updates cash and positions once. Expired reference orders cannot reserve/execute, including migration of two obsolete preview holds.
- Position values derive from quantity × quote/NAV. Unknown acquisition cost/PMC/P&L remains unavailable; provided and executed acquisition costs are retained.
- Loan remaining capital and repayment charts use the amortization schedule. Insurance premiums use the sum of modules in the same payment period; insured coverage capital is not added to cash or wealth.

## Reference checks

| Record | Book | Available |
| --- | ---: | ---: |
| Primary account 000012345 | €53,640.27 | €53,550.27 |
| Joint account 000067890 | €18,100.00 | €18,050.00 |
| Genius prepaid 7878 | €6,534.00 | €6,304.00 |
| Flexia credit 5678 | Debt €1,246.98 | Credit €3,523.02 |

Default Home/PFM February expenses are €1,341.00: primary €630 + joint €235 + Flexia €400 + Etica €10 + Genius €66. The linked debit purchases are already included in the account expenses. Pending movements and internal funding are excluded. A test posting of €12.34 produces €1,353.34 in both Home and PFM and €53,537.93 primary availability in Home and account detail.

## Verification evidence

- Canonical ledger: 11 regression tests, including full/partial repayment, exact holds/fees, migration and reload.
- Account/card adapters: 10 financial regressions plus 75 affected tests before final integration.
- PFM: 8 feature tests plus screen coverage for scoped periods, conserved totals, full portfolio, targets and persistence.
- Home: 19 tests, including cross-screen financial updates and exact insurance search navigation.
- Search movement entry: 18 tests; global search model: 17 tests.
- Investments/loans final affected run: 114 tests. Independent read-only review found no remaining P1/P2; 21 repayment scenarios and order/cost/period/reload checks passed.
- Actual browser: Home and detail availability €53,550.27; PFM/Home expenses €1,341.00; categories smoothly center with a 0.01px center difference while input focus remains active. Search uses visible tinted glyphs and current ledger figures.

Combined scope and final global verification results are recorded by the root integration owner. Existing operator changes and concurrent Android/native work are preserved separately in `pi-italy-mobile-first-combined-scope.json`.

## Final combined gate

`npm run verify` completed with exit code 0 on 12 October 2026. TypeScript, zero-warning ESLint, Prettier, all 227 suites / 2,665 tests, every audit and production build passed. Coverage: statements/lines 82.92%, branches 81.58%, functions 63.94%; all existing thresholds remain unchanged. Asset audit checks 1,139 exact path/blob entries (864 scoped Italy additions and all 275 prior assets preserved). The two pre-existing operator photography edits remain intact. The source module audit passed. Build completed in 10.19 seconds; its existing large-chunk advisory remains informational.

Detailed terminal evidence: `.codex-temp/pi-italy-mobile-first-verify-complete.log`. No commit, branch switch, deployment, image deletion or image conversion was performed.
