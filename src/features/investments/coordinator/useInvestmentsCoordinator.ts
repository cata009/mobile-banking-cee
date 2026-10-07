import { useCallback, useEffect, useRef, useState } from 'react'
import type { InvestmentCatalogSecurity } from '@/app/config/investmentsPortfolioConfig'
import type {
  InvestmentBuyRequest,
  InvestmentFundsRequest,
  InvestmentSecurityDetailRequest,
} from '@/app/screens/investments/InvestmentsPortfolioScreen'
import type { FutureGainFundSimulatorState } from '@/app/screens/investments/FutureGainInvestmentSimulatorScreen'
import type { CoordinatorInput } from '@/app/coordinators/contracts'
export function useInvestmentsCoordinator({
  navigation,
  investmentsPortfolioAvailable,
  isCzRoboAdvisorPreviewActive,
}: Pick<CoordinatorInput, 'navigation'> & {
  investmentsPortfolioAvailable: boolean
  isCzRoboAdvisorPreviewActive: boolean
}) {
  const { currentRoute, navigateTo, navigateToAndReset, goBack } = navigation
  const [selectedInvestmentSecurity, setSelectedInvestmentSecurity] = useState<InvestmentCatalogSecurity | null>(null)
  const [investmentBuyRequest, setInvestmentBuyRequest] = useState<InvestmentBuyRequest | null>(null)
  const investmentBuyRequestSequenceRef = useRef(0)
  const [investmentFundsRequest, setInvestmentFundsRequest] = useState<InvestmentFundsRequest | null>(null)
  const investmentFundsRequestSequenceRef = useRef(0)
  const [investmentSecurityDetailRequest, setInvestmentSecurityDetailRequest] =
    useState<InvestmentSecurityDetailRequest | null>(null)
  const investmentSecurityDetailRequestSequenceRef = useRef(0)
  const [futureGainFundSimulatorResumeState, setFutureGainFundSimulatorResumeState] =
    useState<FutureGainFundSimulatorState | null>(null)
  const [historyFilterByTitle, setHistoryFilterByTitle] = useState<string | null>(null)
  const [investmentsInitialView, setInvestmentsInitialView] = useState<'portfolio' | 'goals' | undefined>()

  useEffect(() => {
    if (currentRoute.screen === 'investments' && currentRoute.initialView !== undefined)
      setInvestmentsInitialView(currentRoute.initialView)
    if (currentRoute.screen === 'investments-history' && currentRoute.filterByTitle !== undefined)
      setHistoryFilterByTitle(currentRoute.filterByTitle)
  }, [currentRoute])
  const handleSelectedInvestmentSecurityChange = useCallback((security: InvestmentCatalogSecurity | null) => {
    setSelectedInvestmentSecurity(security)
  }, [])

  const handleInvestmentBuyRequestConsumed = useCallback((requestId: number) => {
    setInvestmentBuyRequest((currentRequest) => (currentRequest?.requestId === requestId ? null : currentRequest))
  }, [])

  const handleInvestmentsClick = () => {
    if (!investmentsPortfolioAvailable) return

    setInvestmentsInitialView('portfolio')
    navigateTo({ screen: 'investments', initialView: 'portfolio' })
  }

  const handleFutureGainInvestmentFundsClick = (simulatorState: FutureGainFundSimulatorState) => {
    if (!investmentsPortfolioAvailable) return

    investmentSecurityDetailRequestSequenceRef.current += 1
    setInvestmentSecurityDetailRequest({
      requestId: investmentSecurityDetailRequestSequenceRef.current,
      securityId: simulatorState.securityId,
      futureGainSimulatorState: simulatorState,
    })
    setInvestmentsInitialView('portfolio')
    navigateTo({ screen: 'investments', initialView: 'portfolio' })
  }

  const handleReturnToFutureGainSimulator = (simulatorState: FutureGainFundSimulatorState) => {
    setFutureGainFundSimulatorResumeState(simulatorState)
    navigateTo('smart-investment')
  }

  const handleSmartInvestmentBack = () => {
    if (futureGainFundSimulatorResumeState) {
      setFutureGainFundSimulatorResumeState(null)
      navigateToAndReset('homepage')
      return
    }

    goBack()
  }

  const handleInvestmentGoalsClick = () => {
    if (!investmentsPortfolioAvailable || !isCzRoboAdvisorPreviewActive) return

    setInvestmentsInitialView('goals')
    navigateTo({ screen: 'investments', initialView: 'goals' })
  }

  const handleInvestmentsHistoryClick = (filterByTitle?: string) => {
    if (!investmentsPortfolioAvailable) return

    setHistoryFilterByTitle(filterByTitle ?? null)
    navigateTo({ screen: 'investments-history', filterByTitle: filterByTitle ?? null })
  }

  const handleOrdersToApproveClick = () => {
    if (!investmentsPortfolioAvailable) return
    navigateTo('investment-orders-to-approve')
  }

  const requestFunds = (collectionId?: InvestmentFundsRequest['collectionId']) => {
    investmentFundsRequestSequenceRef.current += 1
    setInvestmentFundsRequest({ requestId: investmentFundsRequestSequenceRef.current, collectionId })
    navigateTo('investments')
  }
  const requestBuy = (securityId: string, draft?: InvestmentBuyRequest['draft']) => {
    investmentBuyRequestSequenceRef.current += 1
    setInvestmentBuyRequest({ requestId: investmentBuyRequestSequenceRef.current, securityId, draft })
    navigateTo('investments')
  }
  return {
    view: {
      selectedInvestmentSecurity,
      investmentBuyRequest,
      investmentFundsRequest,
      investmentSecurityDetailRequest,
      futureGainFundSimulatorResumeState,
      historyFilterByTitle:
        currentRoute.screen === 'investments-history' && currentRoute.filterByTitle !== undefined
          ? currentRoute.filterByTitle
          : historyFilterByTitle,
      investmentsInitialView:
        currentRoute.screen === 'investments' && currentRoute.initialView !== undefined
          ? currentRoute.initialView
          : investmentsInitialView,
    },
    actions: {
      handleSelectedInvestmentSecurityChange,
      handleInvestmentBuyRequestConsumed,
      handleInvestmentsClick,
      handleFutureGainInvestmentFundsClick,
      handleReturnToFutureGainSimulator,
      handleSmartInvestmentBack,
      handleInvestmentGoalsClick,
      handleInvestmentsHistoryClick,
      handleOrdersToApproveClick,
      requestFunds,
      requestBuy,
    },
  }
}
