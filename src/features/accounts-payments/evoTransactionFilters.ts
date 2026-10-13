import type { AccountTransaction } from '@/data/accountDetails'
import { formatEvo2027Number } from '@/app/utils/evo2027Formatting'

export type AccountTransactionDateFilter = 'none' | 'last-week' | 'last-month' | 'last-3-months' | 'custom'

export interface AccountTransactionFilterState {
  keyword: string
  accountNumber: string
  variableCode: string
  datePreset: AccountTransactionDateFilter
  amountFrom: string
  amountTo: string
  status: 'All transactions' | 'Booked' | 'Pending'
  transactionType: 'All transactions' | 'Incoming' | 'Outgoing'
  category: string
}

export const EMPTY_ACCOUNT_TRANSACTION_FILTERS: AccountTransactionFilterState = {
  keyword: '',
  accountNumber: '',
  variableCode: '',
  datePreset: 'none',
  amountFrom: '',
  amountTo: '',
  status: 'All transactions',
  transactionType: 'All transactions',
  category: 'All categories',
}

export function hasAccountTransactionFilters(filters: AccountTransactionFilterState) {
  return (
    filters.keyword.trim().length > 0 ||
    filters.accountNumber.trim().length > 0 ||
    filters.variableCode.trim().length > 0 ||
    filters.datePreset !== 'none' ||
    filters.amountFrom.trim().length > 0 ||
    filters.amountTo.trim().length > 0 ||
    filters.status !== 'All transactions' ||
    filters.transactionType !== 'All transactions' ||
    filters.category !== 'All categories'
  )
}

export type EvoTransactionFilters = AccountTransactionFilterState
export const EMPTY_EVO_TRANSACTION_FILTERS = EMPTY_ACCOUNT_TRANSACTION_FILTERS
/** datePreset is an existing Source no-op and is deliberately preserved. */
export function filterEvoTransactions({
  transactions,
  search,
  filters,
  accountNumber,
  currency,
}: {
  transactions: readonly AccountTransaction[]
  search: string
  filters: EvoTransactionFilters
  accountNumber?: string
  currency: string
}): AccountTransaction[] {
  const normalizedTransactionSearch = search.trim().toLowerCase()
  return transactions.filter((transaction) => {
    const formattedAmount = `${transaction.amount < 0 ? '-' : '+'} ${formatEvo2027Number(Math.abs(transaction.amount))} ${currency}`
    const searchableText = [
      transaction.label,
      transaction.details,
      transaction.category,
      transaction.status,
      transaction.day,
      transaction.month,
      transaction.monthTitle,
      formattedAmount,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const searchMatches = normalizedTransactionSearch ? searchableText.includes(normalizedTransactionSearch) : true
    const keywordMatches = filters.keyword.trim() ? searchableText.includes(filters.keyword.trim().toLowerCase()) : true
    const accountMatches = filters.accountNumber.trim()
      ? accountNumber?.toLowerCase().includes(filters.accountNumber.trim().toLowerCase())
      : true
    const variableMatches = filters.variableCode.trim()
      ? transaction.id.toLowerCase().includes(filters.variableCode.trim().toLowerCase())
      : true
    const amountFrom = Number.parseFloat(filters.amountFrom.replace(',', '.'))
    const amountTo = Number.parseFloat(filters.amountTo.replace(',', '.'))
    const absoluteAmount = Math.abs(transaction.amount)
    const amountFromMatches = Number.isFinite(amountFrom) ? absoluteAmount >= amountFrom : true
    const amountToMatches = Number.isFinite(amountTo) ? absoluteAmount <= amountTo : true
    const statusMatches = filters.status === 'All transactions' ? true : transaction.status === filters.status
    const typeMatches =
      filters.transactionType === 'All transactions'
        ? true
        : filters.transactionType === 'Incoming'
          ? transaction.type === 'credit'
          : transaction.type === 'debit'
    const categoryMatches = filters.category === 'All categories' ? true : transaction.category === filters.category

    return (
      searchMatches &&
      keywordMatches &&
      accountMatches &&
      variableMatches &&
      amountFromMatches &&
      amountToMatches &&
      statusMatches &&
      typeMatches &&
      categoryMatches
    )
  })
}
