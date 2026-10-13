import {
  INVESTMENT_HISTORY_TRANSACTION_TYPES,
  type InvestmentHistoryTransaction,
  type InvestmentHistoryOrder,
  type InvestmentHistoryFilterState,
  type InvestmentHistoryTabId,
} from '@/app/config/investmentsPortfolioConfig'
import { parseIsoDateOnly } from '@/app/utils/dateOnly'

export function historyRowMatchesSearch(
  item: InvestmentHistoryTransaction | InvestmentHistoryOrder,
  searchQuery: string,
) {
  const normalized = searchQuery.trim().toLowerCase()
  if (!normalized) return true

  const fields =
    'type' in item ? [item.title, item.type, item.currency] : [item.title, item.orderType, item.status, item.currency]
  return fields.some((field) => String(field).toLowerCase().includes(normalized))
}

export function historyRowMatchesDate(itemDate: string, filters: InvestmentHistoryFilterState, latestDate: Date) {
  if (filters.datePreset === 'all-time') return true

  if (filters.datePreset === 'define') {
    const start = parseIsoDateOnly(filters.customStartDate).getTime()
    const endDate = parseIsoDateOnly(filters.customEndDate)
    endDate.setHours(23, 59, 59, 999)
    const end = endDate.getTime()
    const current = new Date(itemDate).getTime()
    return current >= start && current <= end
  }

  const days = filters.datePreset === 'last-month' ? 31 : filters.datePreset === 'last-6-months' ? 183 : 366
  const cutoff = new Date(latestDate)
  cutoff.setUTCDate(cutoff.getUTCDate() - days)
  return new Date(itemDate).getTime() >= cutoff.getTime()
}

export function getHistoryTypesForTab(tab: InvestmentHistoryTabId) {
  return tab === 'orders' ? (['BUY', 'SELL'] as const) : INVESTMENT_HISTORY_TRANSACTION_TYPES
}

export function normalizeFiltersForTab(
  filters: InvestmentHistoryFilterState,
  tab: InvestmentHistoryTabId,
): InvestmentHistoryFilterState {
  const availableTypes = getHistoryTypesForTab(tab)
  const selectedTypes = filters.selectedTypes.filter((type) => availableTypes.includes(type))

  return {
    ...filters,
    selectedTypes,
  }
}

export function resetFilterTypesForTab(
  filters: InvestmentHistoryFilterState,
  tab: InvestmentHistoryTabId,
): InvestmentHistoryFilterState {
  return {
    ...filters,
    selectedTypes: [...getHistoryTypesForTab(tab)],
  }
}

export function latestInvestmentHistoryDate(rows: readonly { date: string }[], fallback = new Date()): Date {
  return rows.length ? new Date(Math.max(...rows.map((item) => new Date(item.date).getTime()))) : fallback
}
export function selectInvestmentHistoryRows({
  transactions,
  orders,
  filters,
  searchQuery = '',
  securityId,
}: {
  transactions: readonly InvestmentHistoryTransaction[]
  orders: readonly InvestmentHistoryOrder[]
  filters: InvestmentHistoryFilterState
  searchQuery?: string
  securityId?: string | null
}) {
  const latestTransactionDate = latestInvestmentHistoryDate(transactions),
    latestOrderDate = latestInvestmentHistoryDate(orders)
  const filteredTransactions = transactions.filter(
    (item) =>
      (!securityId || item.securityId === securityId) &&
      historyRowMatchesSearch(item, searchQuery) &&
      historyRowMatchesDate(item.date, filters, latestTransactionDate) &&
      filters.selectedTypes.includes(item.type) &&
      filters.selectedCurrencies.includes(item.currency),
  )
  const filteredOrders = orders.filter(
    (item) =>
      (!securityId || item.securityId === securityId) &&
      historyRowMatchesSearch(item, searchQuery) &&
      historyRowMatchesDate(item.date, filters, latestOrderDate) &&
      filters.selectedTypes.includes(item.orderType) &&
      filters.selectedCurrencies.includes(item.currency) &&
      filters.selectedStatuses.includes(item.status),
  )
  return { transactions: filteredTransactions, orders: filteredOrders, latestTransactionDate, latestOrderDate }
}
