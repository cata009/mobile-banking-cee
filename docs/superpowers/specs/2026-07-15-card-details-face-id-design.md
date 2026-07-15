# Mobile PI Card Details — Face ID and Figma Alignment

Date: 2026-07-15

## Scope

Apply one Card Details experience to every Mobile PI debit and credit card for RO, CZ, SK, HU, RS, BA, BA_BL, and SI.

## Reference

- Figma file: `FKbbStgBIP9bFAMl3DPKHF`
- Node: `7375:10660` — Card details

## Behaviour

1. Selecting `SHOW CARD DETAILS` or the `Card Details` quick action starts the existing shared Face ID scan.
2. Only after the scan completes, the app opens the selected card's Card Details page.
3. The existing platform `PageHeader` is reused and the page maps four fields: Card number, Card CVV2/CVC2, Card holder, and Card validity.
4. Card number uses the system clipboard and the shared bottom copy toast.

## Data Contract

`DebitCard` and `CreditCard` expose mock `cardHolderName` and `securityCode` data. Product-count generated cards receive deterministic values too, so all global Mobile PI variants remain complete.

## Boundaries

- Face ID is a visual demo gate, not a biometric or SCA implementation.
- Card/CVC values are front-end mock data only; no secure-card API or persistence is implied.
- No Kids-specific card flow changed.

## Verification

- `npm run audit:card-details`
- `npm run build`
- `npm run audit:templates`
- `npm run audit:platform`
- `git diff --check`
