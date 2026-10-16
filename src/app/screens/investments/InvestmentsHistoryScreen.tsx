import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import type {
  InvestmentHistoryOrder,
  InvestmentHistoryTabId,
  InvestmentHistoryTransaction,
} from '@/app/config/investmentsPortfolioConfig'
import type { NativeInvestmentHistoryOverrides } from '@/features/demo-native/contracts'

interface InvestmentsHistoryScreenProps {
  onBack: () => void
  closeModuleButton?: boolean
  titleOverride?: string
  initialTab?: InvestmentHistoryTabId
  approvalCount?: number
  onToApproveClick?: () => void
  includeCzRoboHistoricalTransactions?: boolean
  allDatesByDefault?: boolean
  hideCurrencyFilter?: boolean
  hideAllTimeDateOption?: boolean
  transactionsOverride?: readonly InvestmentHistoryTransaction[]
  ordersOverride?: readonly InvestmentHistoryOrder[]
  onTabChange?: (tab: InvestmentHistoryTabId) => void
  historyFilterByTitle?: string | null
  historyFilterBySecurityId?: string | null
}

export default function InvestmentsHistoryScreen({
  onBack,
  closeModuleButton,
  titleOverride,
  initialTab,
  approvalCount,
  onToApproveClick,
  includeCzRoboHistoricalTransactions,
  allDatesByDefault,
  hideCurrencyFilter,
  hideAllTimeDateOption,
  transactionsOverride,
  ordersOverride,
  onTabChange,
  historyFilterByTitle,
  historyFilterBySecurityId,
}: InvestmentsHistoryScreenProps) {
  const historyOverrides: NativeInvestmentHistoryOverrides = {
    ...(transactionsOverride !== undefined ? { transactions: transactionsOverride } : {}),
    ...(ordersOverride !== undefined ? { orders: ordersOverride } : {}),
    ...(hideAllTimeDateOption !== undefined ? { hideAllTimeDateOption } : {}),
    ...(hideCurrencyFilter !== undefined ? { hideCurrencyFilter } : {}),
    ...(initialTab !== undefined ? { initialTab } : {}),
    ...(closeModuleButton !== undefined ? { closeModuleButton } : {}),
    ...(titleOverride !== undefined ? { titleOverride } : {}),
    ...(approvalCount !== undefined ? { approvalCount } : {}),
    ...(includeCzRoboHistoricalTransactions !== undefined ? { includeCzRoboHistoricalTransactions } : {}),
    ...(allDatesByDefault !== undefined ? { allDatesByDefault } : {}),
    ...(historyFilterByTitle !== undefined ? { historyFilterByTitle } : {}),
    ...(historyFilterBySecurityId !== undefined ? { historyFilterBySecurityId } : {}),
  }

  return (
    <NativeScreenPreview
      route={{
        screen: 'investments',
        params: {
          entry: 'history',
          tab: initialTab ?? 'transactions',
          ...(historyFilterByTitle ? { filterByTitle: historyFilterByTitle } : {}),
          ...(historyFilterBySecurityId ? { filterBySecurityId: historyFilterBySecurityId } : {}),
          ...(allDatesByDefault ? { allDatesByDefault: 'true' } : {}),
          ...(titleOverride ? { titleOverride } : {}),
          ...(closeModuleButton ? { closeModuleButton: 'true' } : {}),
        },
      }}
      snapshot={{
        investmentHistoryOverrides: historyOverrides,
        primaryNavigationVisible: false,
      }}
      events={{
        onInvestmentHistoryTabChange: onTabChange,
        onInvestmentHistoryToApprove: onToApproveClick,
      }}
      onNavigate={(nextRoute, action) => {
        if (
          action === 'push' &&
          nextRoute.screen === 'investments' &&
          nextRoute.params?.entry === 'approvals' &&
          onToApproveClick
        ) {
          onToApproveClick()
          return true
        }
        return false
      }}
      onBack={onBack}
    />
  )
}
