# Funds implementation ownership

Owner: `/root/investment_funds`. Base: `538360ead4a6da9ae889f142f8d00e333f99412b`.
Checkout: `C:\Users\mihai\Desktop\Mobile Banking - CEE`. Existing main checkout, no index or branch mutations.
Initial pending changes are recorded in `pi-italy-mobile-first-investments-funds-initial-status.txt`; these include unrelated operator and agent work and are preserved.

Owned paths: new `src/experiences/pi/it/mobile-first/MobileFirstInvestmentFunds*.tsx`, `investmentsFunds*.ts`, `mobile-first-investments-funds.css`; `src/features/investments/mobileFirstFunds*.ts`; `src/assets/mobile-first/it/investments/funds/**`; `tests/screens/mobile-first-investments-funds*.test.*`; `docs/tasks/pi-italy-mobile-first-investments-funds*`.

Plan: adapt source portfolio/card/fund data; searchable catalogue and filters; feature-owned transaction and plan validation; back-preserving multi-step operations, document consent and Mobile Code; signed local orders and lifecycle status; regression and scoped checks. Parent owns integration and final combined verification.
