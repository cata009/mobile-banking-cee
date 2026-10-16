# PI/RO/current Native Home body

Owner `/root/baseline_rows_contracts/native-home-body`; integration owner Root. Main checkout `C:/Users/mihai/Desktop/Mobile Banking - CEE`, base `d338f7cfb92435bb8edc8817afbdd47031fb18e3`. Owner/base/initial pending changes and exact allocation were recorded before editing in `.codex-temp/native-baseline-home-body/ownership.json`.

Owned production path: `native-spike/src/experiences/pi/current/baseline/Body.tsx`. Owned test: `native-spike/__tests__/baseline-home-body.test.tsx`. Root owns Home dispatch, baseline Home/Header wrappers, ScrollView/title/navigation, integration tests, live preview and combined report. No Source/Web4004 files, public assets, dependencies, lockfiles, global configuration, existing other-market Native implementations or shared Native leaves were edited.

## Scope and canonical owners

The component exports `BaselineHomeBody({host})` and renders only the active PI/RO/current/release-current AccountSummary body. It adds no scroll view, title, header, bottom bar, quick actions, recent transactions or product carousel. Source HomeScreen mounts AccountSummary and an optional unplanned banner; QuickActions and TransactionsPreview are separate unused baseline components. Root explicitly bounded this body to default AccountSummary without adding manual feature policy.

Categories and products come from the existing `createCurrentProducts` wrapper over Source `deriveProductCategories`/`createProductFormatters`. No balances, totals, product counts, identity numbers or exchange rates are hardcoded. Source preserves its current-account demo uplift, debit linked-account behavior, credit available-credit display, category filtering and release formatting. The same existing helpers `maskAmountParts`, `getCurrencySymbol`, `getProductIcon`, `isAccountDetailProduct` and `isInvestmentsPortfolioAvailable` are used.

Default visible mix is accounts 2, debit cards 2, credit cards 1, meal cards 0, savings 1, deposits 1, loans 1, mortgages 1 and investments 1. This produces Accounts(2), Cards(3), Savings(2), Loans(2), Investment(1). Defaults are not inferred from the banking-scenario label: full visible overrides remain authoritative. Scenario reset and raw-to-resolved counts remain outside the body.

## Source geometry and interaction

Summary gutter 24; full-width clipped radius 8; Source `--uc-teal-soft` background; info padding 24 and block gap 4. Available integer/decimals preserve 30/20 sizes with 30/20 line heights and baseline gap 2. Owed integer/decimals preserve 20/14 bold with 20/14 line heights and no gap. Labels are 14 bold with normal metrics; available label uses the existing translator, while `Total Owed` deliberately remains Source's literal English. Separator is 205×0.25. Original lighthouse PNG is 193×481 and is displayed at width 96, top 24, right 0 with intrinsic aspect; no estimated fixed height or summary min-height is added.

Each category preserves top padding 24 and delegates to common BaselineAccordion → BaselineProductsList → BaselineProductCard. DefaultOpen is false. A single product stays fully visible with inert heading/no chevron/no total. Multi-product sections keep their hidden descendants mounted and delegate the original 300ms collapse/stack/total geometry to common contracts. Category titles bind `category.title` exactly; no expanded attributes are invented. Card categories never show a total; other multi-product totals use canonical calculateTotal and caller privacy.

The original product SVGs are passed through SourceVector at 32px. Account/detail products route with productId/accountId, debit/credit cards with productId/cardId, investments to the existing investments screen. Meal cards stay inert, matching Source's optional onClick semantics. The parent owns the route stack and persistence. No business mapping or data policy is copied into a new model.

## Proof and limits

Red: the new Native test suite initially failed because the allocated Body module did not exist. Green: seven tests cover canonical figures/numbers/privacy, count 0/1/2 and cloned isOpen semantics, singleton inert heading/total suppression, multi-product non-card total payloads, account/card/investment IDs and meal-card inertness, translated available label/literal owed label and original lighthouse dimensions. Test assertions do not equate mounted descendant count with visible product count.

Scoped strict Native lint and TypeScript are checked without weakening settings. An initial hook-dependency lint error was repaired by passing explicit model context fields; an unowned integration test mock typing diagnostic was reported to Root rather than edited here. Root owns final combined verification and Source-vs-Native browser/full-wrapper evidence.

No Android/iOS device or complete-route acceptance is claimed. Source manual unplanned flags are an explicit integration gap: Native CurrentScreenProps does not expose flagsByContext and currentFeature resolves release features only. Root approved omission in this bounded default composition. Other countries, future releases, redesigned cards, future investment banners, app safe areas/scroll/nav hosting, system text scaling and platform font/accessibility/shadow/crop acceptance remain outside this body's proof. Expanded legacy-total baseline alignment in the shared BaselineTotalRow was flagged to Root for browser assessment; this worker did not change that shared leaf.
