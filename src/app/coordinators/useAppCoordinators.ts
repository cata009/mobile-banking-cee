import { resolveExperienceComposition } from '@/experiences/composition'
import { isFutureGainAvailable } from '@/features/investments/future-gain/model'

import { useEffect } from 'react'
import { useNavigationContext } from '@/app/contexts/NavigationContext'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { useDemo } from '@/app/state/demoStore'
import { isFeatureActive } from '@/app/state/featureResolver'
import { isCoAppingAvailable } from '@/app/utils/coAppingAvailability'
import { ROUTE_POLICY, isRouteEligibleForProductContext } from '@/app/navigation/routePolicy'
import { isDesignSystemHash } from '@/app/navigation/initialNavigation'
import { useProducts } from '@/hooks/useProducts'
import { parseDeepLinkFromUrl } from '@/app/utils/deepLink'
import { isInvestmentsPortfolioAvailable } from '@/app/utils/investmentsAvailability'
import { type CzChatLauncherVariant } from '@/app/chat/czChatOrchestration'
import { isKidsHomeCountry } from '@/data/kidsMarketHomeConcepts'
import { useDeepLinkUrlSync } from '@/hooks/useDeepLinkUrlSync'
import { useAccountsPaymentsCoordinator } from '@/features/accounts-payments/coordinator/useAccountsPaymentsCoordinator'
import { useInvestmentsCoordinator } from '@/features/investments/coordinator/useInvestmentsCoordinator'
import { useAnalyticsCoordinator } from '@/features/analytics/coordinator/useAnalyticsCoordinator'
import { useFlowLibraryCoordinator } from '@/features/flow-library/coordinator/useFlowLibraryCoordinator'
import { useProductsCoordinator } from '@/features/products/coordinator/useProductsCoordinator'
import { useCzChatCoordinator } from '@/features/chat/cz/coordinator/useCzChatCoordinator'
import type { AppCommand } from './contracts'
export function useAppCoordinators({
  parsedDeepLink,
  deviceMode,
}: {
  parsedDeepLink: ReturnType<typeof parseDeepLinkFromUrl>
  deviceMode: boolean
}) {
  const {
    currentScreen,
    currentRoute,
    isCoAppingActive,
    navigateTo,
    navigateToAndReset,
    goBack,
    setCoAppingActive,
    ...navigationHistory
  } = useNavigationContext()

  const demoState = useDemo()
  const {
    product,
    country,
    scenario,
    designSystem,
    themeMode,
    release,
    bankingScenario,
    productCounts,
    amountsHidden,
  } = demoState
  const { language } = useLanguage()
  const { categories } = useProducts()
  const experienceComposition = resolveExperienceComposition(demoState)
  const coAppingAvailable = isCoAppingAvailable(country)
  const isCzCoAppingChatbotPreviewActive =
    experienceComposition?.smartAssistant ?? isFeatureActive(demoState, 'fx_czCoAppingSmartAssistant')
  const isCzRoboAdvisorPreviewActive =
    experienceComposition?.roboAdvisor ?? isFeatureActive(demoState, 'fx_czRoboAdvisor')
  const myBankerAvailable = isFeatureActive(demoState, 'fx_rsMyBanker')
  const futureGainSmartInvestmentAvailable = experienceComposition?.futureGain ?? isFutureGainAvailable(demoState)
  const currentRoutePolicy = ROUTE_POLICY[currentScreen]
  const isInAppScreen = currentRoutePolicy.surface === 'app'
  const czChatLauncherVariant: CzChatLauncherVariant = 'edge-tab'
  const isMarketKidsRuntimeContext = product === 'KIDS_PI' && designSystem === 'current' && isKidsHomeCountry(country)
  const isKidsRuntimeContext = isMarketKidsRuntimeContext
  const isSupportedRuntimeContext =
    isRouteEligibleForProductContext(currentScreen, {
      product,
      country,
      designSystem,
      release,
      scenario,
    }) &&
    (currentScreen !== 'smart-investment' || futureGainSmartInvestmentAvailable)
  const investmentsPortfolioAvailable = isInvestmentsPortfolioAvailable(product, country)

  const input = {
    demoState,
    navigation: {
      currentScreen,
      currentRoute,
      isCoAppingActive,
      navigateTo,
      navigateToAndReset,
      goBack,
      setCoAppingActive,
      ...navigationHistory,
    },
    categories,
    parsedDeepLink,
  }
  const accounts = useAccountsPaymentsCoordinator(input)
  const investments = useInvestmentsCoordinator({
    ...input,
    investmentsPortfolioAvailable,
    isCzRoboAdvisorPreviewActive,
  })
  const analytics = useAnalyticsCoordinator({ ...input, accounts })
  const products = useProductsCoordinator(input)
  const flowLibrary = useFlowLibraryCoordinator(input)
  const dispatch = (command: AppCommand) => {
    switch (command.type) {
      case 'navigate':
        navigateTo(command.destination)
        break
      case 'investmentFunds':
        investments.actions.requestFunds(command.collectionId)
        break
      case 'investmentBuy':
        investments.actions.requestBuy(command.securityId, command.draft)
        break
      case 'creditOffer':
        accounts.actions.openCreditOffer(command.cardId)
        break
      case 'opportunityCard':
        accounts.actions.openOpportunityCard(command.cardId)
        break
      case 'productDetail':
        products.actions.handleProductDetailOpen(command.selection)
        break
      case 'productsFocus':
        products.actions.focusShelf(command.cardId)
        break
    }
  }
  const chat = useCzChatCoordinator({ ...input, accounts, investments, dispatch })
  const { selectedAccountId, selectedCardId } = accounts.view
  const { flowLibraryEntryView, selectedFlowPreviewId } = flowLibrary.view
  useEffect(() => {
    const syncDesignSystemHash = () => {
      const hashSection = window.location.hash.replace(/^#/, '')
      if (isDesignSystemHash(hashSection) && currentScreen !== 'design-system') {
        navigateTo('design-system')
      }
    }

    syncDesignSystemHash()
    window.addEventListener('hashchange', syncDesignSystemHash)
    return () => window.removeEventListener('hashchange', syncDesignSystemHash)
  }, [currentScreen, navigateTo])

  // Keep the browser URL a live deep link (refresh/bookmark/Share work everywhere).
  useDeepLinkUrlSync({
    product,
    country,
    scenario,
    designSystem,
    release,
    bankingScenario,
    themeMode,
    amountsHidden,
    productCounts,
    language,
    screen: currentScreen,
    flowId:
      currentRoutePolicy.deepLink.payload === 'flow' && flowLibraryEntryView === 'detail'
        ? selectedFlowPreviewId
        : null,
    accountId: selectedAccountId,
    cardId: selectedCardId,
    transactionSource: currentRoute.screen === 'transaction-detail' ? currentRoute.source : undefined,
    deviceMode,
  })

  return {
    context: {
      experienceComposition,
      currentScreen,
      currentRoute,
      isCoAppingActive,
      navigateTo,
      navigateToAndReset,
      goBack,
      setCoAppingActive,
      demoState,
      product,
      country,
      scenario,
      designSystem,
      themeMode,
      release,
      bankingScenario,
      productCounts,
      amountsHidden,
      coAppingAvailable,
      isCzCoAppingChatbotPreviewActive,
      isCzRoboAdvisorPreviewActive,
      myBankerAvailable,
      futureGainSmartInvestmentAvailable,
      currentRoutePolicy,
      isInAppScreen,
      czChatLauncherVariant,
      isKidsRuntimeContext,
      isSupportedRuntimeContext,
      investmentsPortfolioAvailable,
      parsedDeepLink,
    },
    accounts,
    investments,
    analytics,
    products,
    flowLibrary,
    chat,
  }
}
export type AppCoordinators = ReturnType<typeof useAppCoordinators>
