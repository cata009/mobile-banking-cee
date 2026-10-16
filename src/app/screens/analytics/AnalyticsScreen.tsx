import { useMemo } from 'react'
import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import type { NativeScreenPreviewProps } from '@/app/components/demo/NativeScreenPreview'
import { useCountry, useDemo } from '@/app/state/demoStore'
import { useProducts } from '@/hooks/useProducts'
import type { NativeDemoRoute as Route } from '@/features/demo-native/contracts'
import type { PfmCategorySelection } from '@/data/pfmCategories'
import { createSpendingAnalyticsTimeline, type SpendingAnalyticsTransaction } from '@/data/spendingAnalytics'

export interface AnalyticsScreenProps {
  onHomeClick?: () => void
  onMessagesClick?: () => void
  onPaymentsClick?: () => void
  onProductsClick?: () => void
  onInvestmentsClick?: () => void
  onMoreClick?: () => void
  transactionCategoryOverrides?: Readonly<Record<string, PfmCategorySelection>>
  onTransactionClick?: (transaction: SpendingAnalyticsTransaction) => void
  onAddTransaction?: () => void
  initialScopeId?: string
  initialDirection?: 'expense' | 'income'
}

/** Retained analytics header region; customer screen content is rendered by Native PFM. */
export function AnalyticsHeader({ onMessagesClick }: { onMessagesClick?: () => void }) {
  return (
    <NativeScreenPreview
      route={{ screen: 'pfm' }}
      snapshot={{
        componentPreview: { kind: 'analytics-header' },
        screenTopInset: 0,
      }}
      onNavigate={(route, _action) => {
        if (route.screen !== 'messages') return false
        onMessagesClick?.()
        return true
      }}
    />
  )
}

function handleNativeRoute(
  route: Route,
  props: AnalyticsScreenProps,
  transactions: ReadonlyMap<string, SpendingAnalyticsTransaction>,
): boolean {
  if (route.screen === 'pfm' && route.params?.intent === 'add-transaction') {
    props.onAddTransaction?.()
    return true
  }
  if (route.screen === 'transaction' && props.onTransactionClick) {
    const transaction = resolveNativeAnalyticsTransaction(route, transactions)
    if (transaction) {
      props.onTransactionClick(transaction)
      return true
    }
  }

  const callbacks: Partial<Record<Route['screen'], (() => void) | undefined>> = {
    home: props.onHomeClick,
    messages: props.onMessagesClick,
    payments: props.onPaymentsClick,
    products: props.onProductsClick,
    investments: props.onInvestmentsClick,
    profile: props.onMoreClick,
  }
  const callback = callbacks[route.screen]
  if (!callback) return false
  callback()
  return true
}

function resolveNativeAnalyticsTransaction(
  route: Route,
  transactions: ReadonlyMap<string, SpendingAnalyticsTransaction>,
): SpendingAnalyticsTransaction | undefined {
  const params = route.params
  if (!params?.transactionId) return undefined
  if (params.analyticsTransaction) {
    try {
      const productId = params.productId ?? params.accountId
      const candidate = JSON.parse(params.analyticsTransaction) as Partial<SpendingAnalyticsTransaction>
      if (
        candidate.id === params.transactionId &&
        (!productId || candidate.sourceProductId === productId) &&
        typeof candidate.amount === 'number' &&
        Number.isFinite(candidate.amount) &&
        typeof candidate.month === 'string' &&
        typeof candidate.label === 'string' &&
        candidate.status === 'Booked'
      ) {
        return candidate as SpendingAnalyticsTransaction
      }
    } catch {
      return undefined
    }
  }
  const productId = params.productId ?? params.accountId
  return productId ? transactions.get(`${productId}:${params.transactionId}`) : undefined
}

export default function AnalyticsScreen(props: AnalyticsScreenProps) {
  const { release } = useDemo()
  const country = useCountry()
  const { categories } = useProducts()
  const products = useMemo(() => categories.flatMap((category) => category.products), [categories])
  const transactions = useMemo(() => {
    const timeline = createSpendingAnalyticsTimeline(country, products, props.transactionCategoryOverrides)
    const result = new Map<string, SpendingAnalyticsTransaction>()
    for (const summary of Object.values(timeline.summariesByPeriodKey)) {
      for (const transaction of summary.sourceTransactions) {
        result.set(`${transaction.sourceProductId}:${transaction.id}`, transaction)
      }
    }
    return result
  }, [country, products, props.transactionCategoryOverrides])
  const isEvo = release === 'release-future-evo-2027'
  const params = isEvo
    ? {
        ...(props.initialScopeId ? { scopeId: props.initialScopeId } : {}),
        ...(props.initialDirection ? { direction: props.initialDirection } : {}),
      }
    : undefined
  const route: Route = {
    screen: 'pfm',
    ...(params && Object.keys(params).length > 0 ? { params } : {}),
  }
  const snapshot: NativeScreenPreviewProps['snapshot'] = {
        bankingPresentation: {
          productCategories: categories,
          transactionCategoryOverrides: props.transactionCategoryOverrides,
        },
      }

  return (
    <NativeScreenPreview
      route={route}
      snapshot={snapshot}
      events={{
        ...(props.onTransactionClick
          ? {
              onTransactionSelected: (selection) =>
                props.onTransactionClick?.(selection.transaction as SpendingAnalyticsTransaction),
            }
          : {}),
        ...(props.onAddTransaction
          ? { onAddTransaction: props.onAddTransaction }
          : {}),
      }}
      onNavigate={(nextRoute, _action) => handleNativeRoute(nextRoute, props, transactions)}
    />
  )
}
