import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import type { NativeScreenPreviewProps } from '@/app/components/demo/NativeScreenPreview'
import type { NativeDemoRoute } from '@/features/demo-native/contracts'
import { getPfmCategorySelection, type PfmCategoryName, type PfmCategorySelection } from '@/data/pfmCategories'
import type { SpendingAnalyticsTimeline, SpendingAnalyticsTransaction } from '@/data/spendingAnalytics'

export interface PfmCategoryDetailScreenProps {
  category: PfmCategoryName
  direction: 'out' | 'in'
  timeline: SpendingAnalyticsTimeline
  activePeriodKey: string
  onPeriodChange: (periodKey: string) => void
  onBack: () => void
  onTransactionClick?: (transaction: SpendingAnalyticsTransaction) => void
}

function categoryOverridesFromTimeline(
  timeline: SpendingAnalyticsTimeline,
): Readonly<Record<string, PfmCategorySelection>> {
  const overrides: Record<string, PfmCategorySelection> = {}
  for (const summary of Object.values(timeline.summariesByPeriodKey)) {
    for (const transaction of summary.sourceTransactions) {
      const selection = getPfmCategorySelection(transaction.category, transaction.pfmSubcategory)
      overrides[transaction.id] = {
        ...selection,
        groupLabel: transaction.category,
        category: transaction.pfmCategory,
        subcategory: transaction.pfmSubcategory ?? selection.subcategory,
      }
    }
  }
  return overrides
}

export default function PfmCategoryDetailScreen({
  category,
  direction,
  timeline,
  activePeriodKey,
  onPeriodChange,
  onBack,
  onTransactionClick,
}: PfmCategoryDetailScreenProps) {
  const route: NativeDemoRoute = {
    screen: 'pfm',
    params: {
      category,
      direction,
      periodKey: activePeriodKey,
      externalDetail: 'true',
    },
  }
  const snapshot: NativeScreenPreviewProps['snapshot'] = {
    bankingPresentation: {
      analyticsTimeline: timeline,
      transactionCategoryOverrides: categoryOverridesFromTimeline(timeline),
    },
  }
  const transactions = new Map<string, SpendingAnalyticsTransaction>()
  for (const summary of Object.values(timeline.summariesByPeriodKey)) {
    for (const transaction of summary.sourceTransactions) {
      transactions.set(`${transaction.sourceProductId}:${transaction.id}`, transaction)
    }
  }

  return (
    <NativeScreenPreview
      route={route}
      snapshot={snapshot}
      events={{
        ...(onTransactionClick
          ? {
              onTransactionSelected: (selection) =>
                onTransactionClick(selection.transaction as SpendingAnalyticsTransaction),
            }
          : {}),
        onAnalyticsPeriodChange: onPeriodChange,
      }}
      onNavigate={(nextRoute, _action) => {
        if (nextRoute.screen === 'pfm' && nextRoute.params?.intent === 'period-change') {
          const nextPeriodKey = nextRoute.params.periodKey
          if (nextPeriodKey) onPeriodChange(nextPeriodKey)
          return true
        }
        if (nextRoute.screen === 'transaction' && onTransactionClick) {
          const transactionId = nextRoute.params?.transactionId
          const productId = nextRoute.params?.productId ?? nextRoute.params?.accountId
          const transaction = transactionId && productId ? transactions.get(`${productId}:${transactionId}`) : undefined
          if (transaction) {
            onTransactionClick(transaction)
            return true
          }
        }
        return false
      }}
      onBack={onBack}
    />
  )
}
