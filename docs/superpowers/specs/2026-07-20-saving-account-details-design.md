# Mobile PI Account and Term Deposit Details Design

## Goal

Simplify Account Details globally in Mobile PI when the selected product is a saving account.

Extend the same product-aware composition to term deposits and rename the account-carousel page to `My Products`.

## Approved behavior

- Keep the page title `Account Details`.
- Render exactly three detail fields, in this order: `Account number`, `Account title`, `Current balance`.
- Preserve the existing account-number copy action and the existing balance calculation, currency formatting, amount masking, translations, page header, and sharing action.
- Remove `Available funds`, `Blocked/reserved amount`, `Overdraft`, `Offer`, `Show less`, and `Connected cards` from saving-account details.
- Keep the existing Account Details layout unchanged for every non-saving account type.
- Apply the behavior through the shared Mobile PI screen for every supported country and language.
- The saving-account Current balance must equal the balance shown for that saving account on the preceding carousel card.
- Rename both expanded and collapsed account-carousel headings from `Accounts` to `My Products`; do not rename the Home dashboard Accounts section.
- For a term deposit, replace the generic account composition with exactly these rows in order: `Maturity amount`, `Interest amount before tax`, `Maturity date`, `Rollover`, `Account title`, `Account owner`, `Deposit Amount`, `Start/Value Date`, `Maturity period`, `Interest rate/year`, `Current account number`, `Decrease amount by`, `Reinvest the interest`.
- Term-deposit amount/date/rate/instruction values remain deterministic mock data. Maturity amount equals deposit amount plus interest before tax and is reused on the preceding carousel card.
- Term deposits do not show the generic account-number row, Available funds, Current balance, blocked/reserved amount, overdraft, Offer, Show less, or Connected cards.

## Architecture and data flow

`AccountDetailsInfoScreen` already receives the selected product and owns the detail-field composition. It will select one of three compositions: saving account, term deposit, or the existing generic account details. A focused `accountProductDetails` model will own deterministic term-deposit values and the shared maturity calculation used by the term-deposit carousel card and Details screen. `AccountDetailScreen` will use a dedicated translation key for `My Products` without changing the Home section title.

## Error handling

The existing missing-product fallback remains unchanged. No new user input, network call, or error state is introduced.

## Testing

Focused rendering tests will prove saving balance consistency, the exact term-deposit field order, the `My Products` page title, and preservation of the current-account extended composition. The focused tests must fail before production code changes and pass afterward; final verification includes the full repository verification command and in-app browser smoke checks for savings and term deposit.
