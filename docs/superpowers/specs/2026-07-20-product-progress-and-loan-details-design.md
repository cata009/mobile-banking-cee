# Mobile PI Product Progress and Loan Details Design

## Goal

Make Term Deposit, Personal Loan, and Mortgage cards show meaningful progress derived from the same authoritative mock details displayed on their Account Details pages.

## Approved direction

The user's supplied production screenshots define the visual contract: a teal progress fill inside the existing divider position, a maturity-date identity line for Term Deposit, and repayment progress for loans and mortgages. The explicit instruction to execute without another confirmation is treated as approval of this focused design.

## Data authority

`src/data/accountProductDetails.ts` remains the detail authority and gains:

- a reusable clamped progress calculation;
- Term Deposit start, maturity, and reference dates, with progress calculated as elapsed time divided by total term;
- separate deterministic Personal Loan and Mortgage profiles;
- loan progress calculated as `(original amount - owned amount) / original amount`;
- the exact loan detail values required by the user.

The demo reference date remains fixed at `2026-07-20`, matching the existing 2026 transaction timeline and keeping screenshots/tests deterministic. Term Deposit runs from `2025-09-20` to `2026-09-20`. Personal Loan and Mortgage use amount/date pairs whose repayment proportions are internally consistent at the reference date.

## Card composition

`AccountBalanceCard` accepts optional progress data. When supplied, its one-pixel divider becomes a four-pixel neutral track with a teal fill, clamped to 0-100 and exposed as an accessible progressbar.

- Term Deposit replaces the IBAN line with `Maturity date 20.09.2026`, hides the irrelevant copy action, and uses temporal maturity progress.
- Personal Loan and Mortgage retain their IBAN line and show repayment progress.
- Remaining loan amount becomes a positive amount sourced from the loan detail model.
- Next installment is sourced from the same detail model used by Account Details.
- Other account cards retain the existing divider and behavior.

## Details composition

Personal Loan and Mortgage render exactly these fields in order:

1. Next installment
2. Next installment date
3. Interest rate
4. Overdue amount
5. Overdue interest rate
6. Owned amount
7. Original amount
8. Account title
9. IBAN
10. Account owner
11. Start date
12. Final payment

The supplied list contains 12 fields, although it was described as 13; the implementation follows every named field exactly once and does not invent a thirteenth field. Generic Available funds, Current balance, blocked/reserved amount, overdraft, offer, Show less, and Connected cards content is absent from loan/mortgage details.

## Testing

- Data tests prove date progress, repayment progress, clamping, and card/detail value coherence.
- Screen tests prove exact field order for both loan types, absence of generic content, positive remaining balances, connected next-installment values, maturity-date copy, and accessible progressbars.
- Repository verification and an in-app browser smoke cover the complete user-visible path.

## Scope

No new route, dependency, backend, persistence, transaction mutation, payment schedule engine, early-repayment flow, or localization expansion beyond the new English fallback keys.
