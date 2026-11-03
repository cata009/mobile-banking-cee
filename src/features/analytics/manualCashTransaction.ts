import type { AccountTransaction } from '@/data/accountDetails'
import { roundMoney } from '@/data/exchangeRates'
import { PFM_CATEGORY_GROUPS, type PfmCategoryName } from '@/data/pfmCategories'
import type { Currency } from '@/data/products'
import type { SpendingAnalyticsTransaction } from '@/data/spendingAnalytics'

export interface ManualCashTransactionDraft {
  amount: string
  date: string
  description: string
  categoryId: string
}

export interface ManualCashTransactionCategory {
  id: string
  label: string
  categoryLabel: string
  pfmCategory: PfmCategoryName
  pfmSubcategory: string
}

const CATEGORY_GROUPS = [
  { id: 'household', label: 'Household' },
  { id: 'utilities', label: 'Utilities' },
  { id: 'cars-transportation', label: 'Cars & Transportation' },
  { id: 'children', label: 'Children' },
  { id: 'health-beauty', label: 'Health & Beauty' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'leisure', label: 'Leisure' },
  { id: 'education', label: 'Education' },
  { id: 'vacation-travel', label: 'Vacation & Travel' },
  { id: 'uncategorized-expenses', label: 'Uncategorized expenses' },
  { id: 'groceries', label: 'Groceries' },
] as const

const groupsById = new Map(PFM_CATEGORY_GROUPS.map((group) => [group.id, group]))

export const MANUAL_CASH_TRANSACTION_CATEGORIES: readonly ManualCashTransactionCategory[] = [
  {
    id: 'income',
    label: 'Income',
    categoryLabel: 'INCOME',
    pfmCategory: 'Income',
    pfmSubcategory: 'INCOME (OTHER)',
  },
  ...CATEGORY_GROUPS.map(({ id, label }) => {
    const group = groupsById.get(id)
    if (!group) throw new Error(`Missing PFM category group: ${id}`)
    return {
      id,
      label,
      categoryLabel: group.label,
      pfmCategory: group.category,
      pfmSubcategory: group.subcategories[0] ?? group.label,
    }
  }),
]

const MONTH_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'] as const

export function createInitialManualCashTransactionDraft(now = new Date()): ManualCashTransactionDraft {
  return {
    amount: '',
    date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
    description: '',
    categoryId: '',
  }
}

export function parseManualCashTransactionAmount(value: string): number | null {
  let normalized = value.trim().replace(/\s/g, '')
  if (!normalized) return null

  const comma = normalized.lastIndexOf(',')
  const dot = normalized.lastIndexOf('.')
  if (comma >= 0 && dot >= 0) {
    normalized = comma > dot ? normalized.replace(/\./g, '').replace(',', '.') : normalized.replace(/,/g, '')
  } else if (comma >= 0) {
    normalized = normalized.replace(',', '.')
  }

  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null
  const amount = Number(normalized)
  return Number.isFinite(amount) && amount > 0 ? roundMoney(amount) : null
}

export function isValidManualCashTransactionDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function isValidManualCashTransactionDraft(draft: ManualCashTransactionDraft) {
  return Boolean(
    parseManualCashTransactionAmount(draft.amount) &&
    isValidManualCashTransactionDate(draft.date) &&
    MANUAL_CASH_TRANSACTION_CATEGORIES.some((category) => category.id === draft.categoryId),
  )
}

export function createManualCashTransaction(
  draft: ManualCashTransactionDraft,
  id: string,
  currency: Currency,
): SpendingAnalyticsTransaction | null {
  const amount = parseManualCashTransactionAmount(draft.amount)
  const category = MANUAL_CASH_TRANSACTION_CATEGORIES.find((option) => option.id === draft.categoryId)
  if (!amount || !category || !isValidManualCashTransactionDate(draft.date)) return null

  const year = draft.date.slice(0, 4)
  const monthNumber = Number(draft.date.slice(5, 7))
  const day = draft.date.slice(8, 10)
  const monthName = new Intl.DateTimeFormat('en-GB', { month: 'long' })
    .format(new Date(`${draft.date}T12:00:00`))
    .toLocaleUpperCase('en-GB')
  const signedAmount = category.pfmCategory === 'Income' ? amount : -amount
  const description = draft.description.trim()

  const transaction: AccountTransaction = {
    id,
    day,
    month: MONTH_SHORT[monthNumber - 1]!,
    monthKey: `${year}-${String(monthNumber).padStart(2, '0')}`,
    monthTitle: `${monthName} ${year}`,
    label: description || category.label,
    ...(description ? { details: description } : {}),
    currency,
    amount: signedAmount,
    type: signedAmount < 0 ? 'debit' : 'credit',
    category: category.categoryLabel,
    pfmCategory: category.pfmCategory,
    pfmSubcategory: category.pfmSubcategory,
    status: 'Booked',
    source: 'account',
  }

  return {
    ...transaction,
    sourceProductId: 'cash-transaction',
    sourceProductName: 'Cash transaction',
  }
}
