import type { ExpenseSplitMode } from './state'
import type { ExpenseBreakdownRow } from './types'

const SPLIT_MODE_NOUNS: Record<ExpenseSplitMode, string> = {
  categories: 'categories',
  merchants: 'merchants',
  currencies: 'currencies',
}

export function selectExpenseSelectionLabels(
  rows: readonly ExpenseBreakdownRow[],
  selection: ReadonlySet<string>,
  primaryKeys: ReadonlySet<string>,
  mode: ExpenseSplitMode,
) {
  const labels = Array.from(selection).map((key) =>
    key === 'Other' ? 'Other' : (rows.find((row) => row.key === key)?.label ?? key),
  )
  const foldedOtherCount = Math.max(0, rows.length - primaryKeys.size)
  const count = Array.from(selection).reduce((total, key) => total + (key === 'Other' ? foldedOtherCount : 1), 0)
  return {
    labels,
    count,
    singleLabel: labels.length === 1 && count === 1 ? labels[0] : null,
    countedLabel: count > 0 ? `${count} ${SPLIT_MODE_NOUNS[mode]}` : null,
  }
}
