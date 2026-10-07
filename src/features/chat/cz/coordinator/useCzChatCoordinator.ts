import { useMemo, useState } from 'react'
import {
  buildCreditCardOpportunities,
  buildCzChatHelpContext,
  buildCzChatScreenContext,
  buildCzChatSmartReplyResolver,
  getCzSavingsProductDetailSelection,
  getProductsShelfFocusCardId,
  type CzChatHelpArea,
} from '@/app/chat/czChatOrchestration'
import {
  type CoAppingChatAction,
  type CoAppingAssistantMode,
  type CoAppingChatContext,
  type CoAppingReplyResolver,
} from '../../../../../package/mobile-pi-coapping-chat-package/src'
import type { CoordinatorInput } from '@/app/coordinators/contracts'
import type { AppCommand } from '@/app/coordinators/contracts'
import type { useAccountsPaymentsCoordinator } from '@/features/accounts-payments/coordinator/useAccountsPaymentsCoordinator'
import type { useInvestmentsCoordinator } from '@/features/investments/coordinator/useInvestmentsCoordinator'
export function useCzChatCoordinator({
  demoState,
  navigation,
  categories,
  accounts,
  investments,
  dispatch,
}: Pick<CoordinatorInput, 'demoState' | 'navigation' | 'categories'> & {
  accounts: ReturnType<typeof useAccountsPaymentsCoordinator>
  investments: ReturnType<typeof useInvestmentsCoordinator>
  dispatch: (command: AppCommand) => void
}) {
  const { country } = demoState
  const { currentScreen } = navigation
  const { selectedAccountProduct, selectedCardProduct, creditCardForOpportunity } = accounts.view
  const { selectedInvestmentSecurity } = investments.view
  const [czChatOpen, setCzChatOpen] = useState(false)
  const [czChatContext, setCzChatContext] = useState<CoAppingChatContext | null>(null)
  const [czChatInitialMode, setCzChatInitialMode] = useState<CoAppingAssistantMode>('chat')

  const czChatOpportunities = buildCreditCardOpportunities(creditCardForOpportunity, country, currentScreen)
  const czChatReplyResolver = useMemo<CoAppingReplyResolver>(
    () =>
      buildCzChatSmartReplyResolver({
        country,
        categories,
        selectedAccountProduct,
        selectedCardProduct,
        creditCardForOpportunity,
        selectedInvestmentSecurity,
      }),
    [
      categories,
      country,
      creditCardForOpportunity,
      selectedAccountProduct,
      selectedCardProduct,
      selectedInvestmentSecurity,
    ],
  )

  const openCzChatHelp = (area: CzChatHelpArea) => {
    setCzChatInitialMode('chat')
    setCzChatContext(buildCzChatHelpContext(area, `${area}-${Date.now()}`))
    setCzChatOpen(true)
  }

  const handleCzChatLauncherOpen = () => {
    setCzChatInitialMode('chat')
    setCzChatContext(
      buildCzChatScreenContext(
        currentScreen,
        `${currentScreen}-${Date.now()}`,
        selectedAccountProduct,
        selectedInvestmentSecurity,
      ),
    )
  }

  const openCzChatForYou = () => {
    setCzChatInitialMode('for-you')
    setCzChatContext(
      buildCzChatScreenContext(
        currentScreen,
        `${currentScreen}-${Date.now()}`,
        selectedAccountProduct,
        selectedInvestmentSecurity,
      ),
    )
    setCzChatOpen(true)
  }

  const handleCzChatAction = (action: CoAppingChatAction) => {
    if (action.type !== 'navigate' || !action.target) return

    switch (action.target) {
      case 'investment-funds':
        setCzChatOpen(false)
        dispatch({ type: 'investmentFunds', collectionId: action.investmentFundCollectionId })
        break
      case 'investment-buy':
        if (!action.securityId) break
        setCzChatOpen(false)
        dispatch({ type: 'investmentBuy', securityId: action.securityId, draft: action.investmentBuyDraft })
        break
      case 'card-detail':
        setCzChatOpen(false)
        dispatch({ type: 'opportunityCard', cardId: creditCardForOpportunity?.id })
        break
      case 'credit-limit-review':
        if (!creditCardForOpportunity) break
        setCzChatOpen(false)
        dispatch({ type: 'creditOffer', cardId: creditCardForOpportunity.id })
        break
      case 'product-detail': {
        const selection = getCzSavingsProductDetailSelection(action.id, country)
        if (!selection) break
        setCzChatOpen(false)
        dispatch({ type: 'productDetail', selection })
        break
      }
      case 'products': {
        const cardId = getProductsShelfFocusCardId(action.id)
        if (cardId !== undefined) {
          setCzChatOpen(false)
          dispatch({ type: 'productsFocus', cardId })
        } else dispatch({ type: 'navigate', destination: 'products' })
        break
      }
      case 'account-detail':
        dispatch({
          type: 'navigate',
          destination: selectedAccountProduct
            ? { screen: 'account-detail', accountId: selectedAccountProduct.id }
            : 'account-detail',
        })
        break
      case 'investments':
      case 'investments-history':
      case 'analytics':
      case 'payments':
      case 'documents':
      case 'messages':
      case 'settings':
      case 'contacts':
      case 'prime':
        dispatch({ type: 'navigate', destination: action.target })
        break
    }
  }

  const openChanged = (open: boolean) => setCzChatOpen(open)
  return {
    view: { czChatOpen, czChatContext, czChatInitialMode, czChatOpportunities, czChatReplyResolver },
    actions: { openCzChatHelp, handleCzChatLauncherOpen, openCzChatForYou, handleCzChatAction, openChanged },
  }
}
