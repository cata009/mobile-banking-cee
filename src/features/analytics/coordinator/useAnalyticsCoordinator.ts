import { useEffect, useState } from 'react'
import { getCardMerchantEnrichment } from '@/app/components/merchants/merchantEnrichment'
import type { SpendingAnalyticsTransaction } from '@/data/spendingAnalytics'
import type { CoordinatorInput } from '@/app/coordinators/contracts'
import type { useAccountsPaymentsCoordinator } from '@/features/accounts-payments/coordinator/useAccountsPaymentsCoordinator'
export function useAnalyticsCoordinator({
  navigation,
  demoState,
  accounts,
}: Pick<CoordinatorInput, 'navigation' | 'demoState'> & {
  accounts: ReturnType<typeof useAccountsPaymentsCoordinator>
}) {
  const { currentRoute, navigateTo } = navigation
  const { country } = demoState
  const { selectedAccountId, accountProducts } = accounts.view
  const { handleTransactionClick } = accounts.actions
  const [analyticsInitialScopeId, setAnalyticsInitialScopeId] = useState<string | null>(null)
  const [analyticsInitialDirection, setAnalyticsInitialDirection] = useState<'expense' | 'income' | null>(null)

  useEffect(() => {
    if (currentRoute.screen !== 'analytics') return
    if (currentRoute.scopeId !== undefined) setAnalyticsInitialScopeId(currentRoute.scopeId)
    if (currentRoute.direction !== undefined) setAnalyticsInitialDirection(currentRoute.direction)
  }, [currentRoute])
  const handleAnalyticsClick = () => {
    setAnalyticsInitialScopeId(null)
    setAnalyticsInitialDirection(null)
    navigateTo({ screen: 'analytics', scopeId: null, direction: null })
  }

  const handleAccountAnalyticsClick = (direction: 'expense' | 'income') => {
    setAnalyticsInitialScopeId(selectedAccountId)
    setAnalyticsInitialDirection(direction)
    navigateTo({ screen: 'analytics', scopeId: selectedAccountId, direction })
  }

  const handleAnalyticsTransactionClick = (transaction: SpendingAnalyticsTransaction) => {
    const sourceProduct = accountProducts.find((productItem) => productItem.id === transaction.sourceProductId)
    if (sourceProduct) {
      handleTransactionClick(transaction, sourceProduct, getCardMerchantEnrichment(transaction, country))
    }
  }

  return {
    view: {
      analyticsInitialScopeId:
        currentRoute.screen === 'analytics' && currentRoute.scopeId !== undefined
          ? currentRoute.scopeId
          : analyticsInitialScopeId,
      analyticsInitialDirection:
        currentRoute.screen === 'analytics' && currentRoute.direction !== undefined
          ? currentRoute.direction
          : analyticsInitialDirection,
    },
    actions: { handleAnalyticsClick, handleAccountAnalyticsClick, handleAnalyticsTransactionClick },
  }
}
