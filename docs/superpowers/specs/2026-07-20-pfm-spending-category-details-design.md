# PFM Spending Category Details Design

## Goal

Turn every Money Out and Money In category row in Mobile PI Spending into a connected category-details experience matching the supplied production captures. The implementation must work for every PFM category and every month/year period already present in the analytics timeline, not only Financial, Shopping, Uncategorized expenses, and Income.

## Product behavior

- Selecting a Money Out or Money In category opens a full-height detail surface inside Spending.
- Back returns to the same Spending period and scroll context without changing the bottom-navigation route.
- The detail header uses the selected category's semantic PFM color and the existing analytics display label.
- The hero shows `Showing data for`, the current month/year, the category total, a collision-free proportional bubble visualization grouped by PFM subcategory, and the existing centered period indicator.
- Each removable bubble is a semantic exclusion control. Tapping it filters that subcategory out of the bubble set, transaction list, hero total, and divider total. The last remaining bubble is protected, and exclusions reset on period/category change or re-entry.
- The category detail can move across the same month/year timeline used by Spending. Period totals, subcategory bubbles, divider totals, and transactions are derived from the selected period.
- `Add Transaction` is presentational, matching the production reference and reusing the shared action bar.
- The transaction list contains only movements matching category and direction. Month periods use the month label; year periods use the year label. Rows reuse the shared PFM transaction row and open the existing Transaction Details route.
- Uncategorized expense detail shows the dismissible shared helper after the first transaction. Dismissal lasts only while the detail surface remains mounted.
- A confirmed session recategorization updates Account Detail, Transaction Details, Spending totals, and category drill-down data from the same override map.

## Data model

`createSpendingAnalyticsTimeline` accepts an optional read-only transaction-category override map. Overrides are applied before period aggregation. A new pure `createSpendingCategoryDetail` selector receives one period summary, a canonical category, and `out`/`in`; it returns the matching signed transactions, absolute total, and subcategory summaries sorted by total.

Expense subcategory names are normalized through the existing 18-group/103-subcategory taxonomy. Income remains outside the expense recategorization taxonomy and uses the transaction's supplied subcategory, with `INCOME (OTHER)` as the fallback. This prevents income from being mislabeled as Uncategorized.

## Design-system decisions

- Reuse `PageHeader`, `AccountActionBar`, `AccountTransactionMonthDivider`, `AccountTransactionRow`, `HelperCard`, `PfmCategoryIcon`, PFM semantic tokens, and the existing money formatter.
- Extract/reuse the existing analytics period-indicator and carousel interaction without changing overview behavior.
- Create `PfmCategoryBubbleChart` because the proportional subcategory bubble composition does not exist in the registry.
- Create `PfmCategoryDetailScreen` as a domain screen component because the reference is a complete, stateful analytics sub-surface.
- All new user-facing copy is added to `runtime.analytics` translations and inherited by country overrides through `EN_RUNTIME.analytics`.

## Accessibility and failure states

- Category overview rows become semantic buttons with category, direction, and formatted amount in their accessible name.
- Bubble controls expose full subcategory labels through accessible text and amounts through their title metadata even when visible labels are shortened to fit.
- Empty category periods render the existing no-transactions copy with zero bubbles and no transaction rows.
- The helper close control uses translated accessible text.

## Verification

- Pure-data tests cover connected overrides, direction filtering, total reconciliation, income labeling, and deterministic ordering.
- Screen tests cover Money Out and Money In entry, back behavior, period/category content, transaction navigation, dismissible Uncategorized helper behavior, and bubble exclusion with recalculated totals/rows.
- Repository `npm run verify`, `git diff --check`, React quality review, and an in-app browser smoke at 375px verify the final integration.

## Scope boundary

This remains a deterministic front-end demo. Add Transaction does not create ledger entries; category changes are not persisted across reloads; no API, dependency, migration, release, push, or deployment is introduced.
