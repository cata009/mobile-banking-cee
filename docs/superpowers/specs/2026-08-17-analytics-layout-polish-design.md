# Evo 2027 Analytics Layout Polish Design

## Goal

Improve the Evo 2027 spending overview so the category cards use their full width and the account scope label sits before the monthly spending headline.

## Approved behavior

- The category rows in the “Where it went” card remain full-width buttons and keep their existing click behavior, but the trailing chevron icon and the width reserved for it are removed.
- The “All accounts · N transactions” scope trigger remains clickable and keeps its dropdown chevron, but moves to the top of the spending hero before “Money out in {period}”.
- No data, copy, navigation, or other analytics behavior changes.

## Implementation

Both changes live in `src/app/screens/analytics/Evo2027AnalyticsScreen.tsx`:

1. In `SpendingTopCategories`, remove the trailing `AppIcon` from each row and remove the row-level `gap` that only supported that trailing column. The content span remains `flex-1`, so its amount and progress bar can use the freed width.
2. In `SpendingHero`, render the existing scope button first inside the hero content stack, then render the period headline, metric, sparkline, divider, and income/net metrics. Preserve the existing button semantics and focus styling.

## Verification

- Run the focused Evo analytics test suite.
- Run the TypeScript/Vite build or the repository's relevant validation command.
- Visually inspect the analytics screen at the supplied route to confirm category rows no longer reserve trailing chevron space and the scope label precedes the spending headline.
