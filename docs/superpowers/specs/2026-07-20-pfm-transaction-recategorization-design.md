# PFM Transaction Recategorization Design

## Goal

Reconstruct the production `Change category` bottom sheet from the 24 supplied screenshots, expose it from a transaction's PFM icon and from the existing Transaction Details action, and keep the chosen category connected across both surfaces for the current demo session.

## Source evidence

- `To do/PFM categs/` contains 24 screenshots of the production sheet.
- The screenshots define 18 expense category groups and 103 subcategories.
- The initial state has every group collapsed. Multiple groups may be expanded, one subcategory may be selected, and the confirmation action is disabled until the selection differs from the transaction's current categorization.
- Search filters group and subcategory labels. Matching subcategories remain reachable without changing the underlying taxonomy.

## Design-system mapping

| Production element | Repository match | Decision |
|---|---|---|
| Overlay, focus trap, sheet geometry | `BottomSheet` | Extend with optional drag-handle and close-button controls; defaults preserve every existing usage. |
| Group glyph and color | `PfmCategoryIcon` | Reuse. Group definitions carry a separate icon category where production labels and internal canonical names differ. |
| Expandable group list | `ui/accordion` primitives and registered chevrons | Compose in the PFM domain component. |
| Search field | `AccountSearchBar` | Reuse without the filters action. |
| Confirm action | `PrimaryButton` | Reuse in a sticky sheet footer. |
| Transaction entry point | `AccountTransactionRow` | Extend with an optional category-icon callback. Without it the current one-button row remains unchanged. |
| Transaction Details action | `AccountActionBar` | Reuse and attach the same category sheet. |

## Taxonomy and data flow

`src/data/pfmCategories.ts` remains the authority for PFM presentation and gains a production category-group registry. Each group contains a stable id, production label, canonical `PfmCategoryName`, icon category, and its exact ordered subcategory tuple.

`App.tsx` owns in-memory overrides keyed by the deterministic transaction id. It applies the override before opening Transaction Details and passes the same callback to Account Details and Transaction Details. Recategorization updates `category`, `pfmCategory`, and `pfmSubcategory` together so list icons, detail pills, and detail labels cannot diverge.

This is demo-session state only. It does not imply backend persistence and does not change analytics aggregation in this scope.

## Interaction contract

1. Selecting the PFM icon opens `Change category` without navigating away.
2. Selecting the rest of the row keeps the existing Transaction Details navigation.
3. The sheet opens with all group accordions collapsed.
4. The recommendation identifies the transaction's closest mapped production subcategory.
5. A radio selection is unique. The confirm button remains disabled for an unchanged selection.
6. Confirming updates the transaction and closes the sheet.
7. Closing via backdrop, drag-header close affordance, explicit close action, or Escape discards the draft selection.
8. The existing Transaction Details `Change category` action opens the same component and shares the same update path.

## Accessibility and responsive behavior

- The sheet keeps `dialog`, focus trapping, Escape handling, and focus restoration from `BottomSheet`.
- Group triggers expose `aria-expanded`; subcategories use a named radio group; the category icon has a specific accessible name.
- The body is independently scrollable and the confirmation footer remains visible at the 375 px phone baseline.

## Verification

- Data tests lock the 18 groups, 103 unique subcategories, exact group counts, and canonical mappings.
- Component tests lock collapsed initial state, expansion, search, selection, disabled/enabled confirmation, and callback payload.
- Screen tests lock the split icon/detail interactions and the Transaction Details action.
- Run focused Vitest suites, then `npm run verify`, then perform a 375 px browser smoke with console review.

## Scope boundary

No dependency, route, release, backend, database, analytics recalculation, permanent storage, or unrelated PFM redesign is added. No commit is created without an explicit user request.
