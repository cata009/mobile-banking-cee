import { useRoboCarousels } from '@/app/screens/investments/robo/useRoboCarousels'
import { applyRoboTopUp } from '@/features/investments/robo/goalActions'
import { createRoboTradeEventId } from '@/features/investments/robo/operationContext'
import { hydrateRoboGoal } from '@/features/investments/robo/goalHydration'
import { CreationReviewScreen } from '@/app/screens/investments/robo/CreationReviewScreen'
import { CreationPortfolioScreen } from '@/app/screens/investments/robo/CreationPortfolioScreens'
import { CreationProjectionScreen } from '@/app/screens/investments/robo/CreationProjectionScreen'
import { CreationStrategyScreen } from '@/app/screens/investments/robo/CreationPortfolioScreens'
import { CreationFundingSetupScreen } from '@/app/screens/investments/robo/FundingSetupScreen'
import { CreationGoalNameScreen } from '@/app/screens/investments/robo/OnboardingCreationScreens'
import { CreationGoalTypeScreen } from '@/app/screens/investments/robo/OnboardingCreationScreens'
import { createRoboState, roboReducer, getRoboFlowView } from '@/features/investments/robo/flowState'
import {
  getPreviousManagementMode,
  getRoboAdvisorBackStep,
  type RoboAdvisorCreationStep as CreationStep,
  type RoboAdvisorManagementMode as ManagementMode,
} from '@/features/investments/robo/legacyFlowState'
import { type InvestmentBasketFund, type InvestmentBasketFundHolding } from '@/app/config/investmentBasketFundsConfig'
import type { InvestmentHistoryTransaction } from '@/app/config/investmentsPortfolioConfig'
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { BottomSheet } from '@/app/components/BottomSheet'
import StandardSignScreen from '@/app/components/flow/StandardSignScreen'
import { CreationSuccessScreen } from '@/app/screens/investments/robo/CreationSuccessScreen'
import InvestmentBasketFundDetailScreen from '@/app/screens/investments/InvestmentBasketFundDetailScreen'
import { InvestmentSecurityDetailScreen } from '@/app/screens/investments/InvestmentSecurityScreens'
import { getCurrentRoboDemoClock, type RoboDemoClock } from '@/features/investments/robo/demoClock'
import type { CountryId } from '@/app/state/demoTypes'
import type { CurrentAccount } from '@/data/products'
import { roundMoney } from '@/data/exchangeRates'
import { type InvestmentCatalogSecurity } from '@/app/config/investmentsPortfolioConfig'
import { ROBO_STRATEGIES } from '@/features/investments/robo/catalog'
import {
  formatCzkInteger,
  formatCzkInput,
  getFundingFieldVisibility,
  getPortfoliosForStrategy,
  getRoboPortfolioForGoal,
} from '@/features/investments/robo/model'
import {
  type RoboFundingMethod,
  type RoboExistingGoal,
  type RoboInvestorProfileStatus,
  type RoboPortfolio,
  type RoboStrategy,
} from '@/features/investments/robo/types'
import { DEFAULT_ROBO_CASH_ACCOUNT, DEFAULT_ROBO_STRATEGY } from '@/features/investments/robo/presentationData'
import { isValidRoboHorizon } from '@/features/investments/robo/validation'
import {
  getRoboGoalEndDate,
  localizeRoboBasketInstrument,
  buildRoboBasketPosition,
  formatRoboGoalDate,
  parseRoboCalendarDate,
  getRoboGoalEndDateFromStart,
} from '@/features/investments/robo/goalPositions'
import { getRoboGoalCurrentValue, buildInitialRoboGoal } from '@/features/investments/robo/goalModel'
import {
  QuitConfirmationScreen,
  IntroScreen,
  InvestorProfileScreen,
} from '@/app/screens/investments/robo/OnboardingScreens'
import { GoalPlanScreen } from '@/app/screens/investments/robo/GoalPlanScreen'
import { ManagementScreen } from '@/app/screens/investments/robo/ManagementScreen'
import { GoalDetail } from '@/app/screens/investments/robo/GoalDetail'
import { PersonalDataConfirmationScreen } from '@/app/screens/investments/robo/PersonalDataConfirmationScreen'

interface CzFutureRoboAdvisorFlowProps {
  demoClock?: RoboDemoClock
  currentAccounts?: readonly CurrentAccount[]
  securityCatalog?: readonly InvestmentCatalogSecurity[]
  transactions?: readonly InvestmentHistoryTransaction[]
  country?: CountryId
  amountsHidden?: boolean
  onBack: () => void
  onExit: () => void
  onOpenSecurity?: (selection: {
    securityId: string
    productId?: string
    localValue: number
    performancePercent: number
    hideBuyAction?: boolean
    securityOverride?: InvestmentCatalogSecurity
  }) => void
  initialGoal?: RoboExistingGoal
  onGoalUpdated?: (goal: RoboExistingGoal) => void
  profileStatus?: RoboInvestorProfileStatus
  requiresContactValidation?: boolean
  availableStrategyCount?: 1 | 2 | 3
}

interface SelectedBasketHolding {
  basketTitle: string
  holding: InvestmentBasketFundHolding
  security: InvestmentCatalogSecurity | null
}

export default function CzFutureRoboAdvisorFlow({
  currentAccounts = [DEFAULT_ROBO_CASH_ACCOUNT],
  securityCatalog = [],
  transactions = [],
  country = 'CZ',
  amountsHidden = false,
  onBack,
  onExit,
  onOpenSecurity,
  initialGoal,
  onGoalUpdated,
  profileStatus = 'valid',
  availableStrategyCount = 3,
  demoClock: demoClockOverride,
}: CzFutureRoboAdvisorFlowProps) {
  const [demoClock] = useState<RoboDemoClock>(() => demoClockOverride ?? getCurrentRoboDemoClock())
  const chartReferenceDate = useMemo(
    () => new Date(Date.UTC(demoClock.referenceDay.year, demoClock.referenceDay.month - 1, demoClock.referenceDay.day)),
    [demoClock],
  )
  const [state, dispatchFlow] = useReducer(roboReducer, initialGoal, (goal) => createRoboState(goal, demoClock))
  if (
    (state.kind === 'detail' || state.kind === 'management') &&
    state.goalSource === 'incoming' &&
    initialGoal &&
    state.goal !== initialGoal
  ) {
    dispatchFlow({ type: 'incoming-goal-changed', goal: initialGoal })
  }
  const flowState = getRoboFlowView(state)
  const workingGoal = state.kind === 'creation' ? state.publishedGoal : state.goalSource === 'local' ? state.goal : null
  const setWorkingGoal = (goal: RoboExistingGoal) => dispatchFlow({ type: 'goal-updated', goal })
  const [basketDetailsToOpen, setBasketDetailsToOpen] = useState<InvestmentBasketFund | null>(null)
  const [selectedBasketHolding, setSelectedBasketHolding] = useState<SelectedBasketHolding | null>(null)
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false)
  const [cashAccountSheetOpen, setCashAccountSheetOpen] = useState(false)
  const [termsSheetOpen, setTermsSheetOpen] = useState(false)
  const quitConfirmationOpen = state.kind === 'creation' && state.quitOpen
  const setQuitConfirmationOpen = (open: boolean) => dispatchFlow({ type: open ? 'quit-requested' : 'quit-resumed' })
  const [selectedCashAccountId, setSelectedCashAccountId] = useState(currentAccounts[0]?.id ?? '')
  const {
    step,
    goalType,
    goalName,
    targetAmount,
    horizonYears,
    manualHorizon,
    fundingMethod,
    initialAmount,
    monthlyContribution,
    startDate,
    selectedStrategyId,
    selectedPortfolio,
    termsAccepted,
    managementMode,
  } = flowState
  const setStep = (value: CreationStep) => dispatchFlow({ type: 'navigate', to: value })
  const setGoalType = (value: string) => dispatchFlow({ type: 'draft-changed', field: 'goalType', value })
  const setGoalName = (value: string) => dispatchFlow({ type: 'draft-changed', field: 'goalName', value })
  const setTargetAmount = (value: string) => dispatchFlow({ type: 'draft-changed', field: 'targetAmount', value })
  const selectHorizon = (years: number) => dispatchFlow({ type: 'select-horizon', years })
  const setManualHorizonValue = (value: string) => dispatchFlow({ type: 'set-manual-horizon', value })
  const setFundingMethod = (value: RoboFundingMethod | null) =>
    dispatchFlow({ type: 'draft-changed', field: 'fundingMethod', value })
  const setInitialAmount = (value: string) => dispatchFlow({ type: 'draft-changed', field: 'initialAmount', value })
  const setMonthlyContribution = (value: string) =>
    dispatchFlow({ type: 'draft-changed', field: 'monthlyContribution', value })
  const setStartDate = (value: string) => dispatchFlow({ type: 'draft-changed', field: 'startDate', value })
  const setSelectedStrategyId = (value: RoboStrategy['id']) =>
    dispatchFlow({ type: 'draft-changed', field: 'selectedStrategyId', value })
  const setSelectedPortfolio = (value: RoboPortfolio | null) =>
    dispatchFlow({ type: 'portfolio-selected', portfolio: value })
  const setTermsAccepted = (value: boolean) => dispatchFlow({ type: 'terms-toggled', accepted: value })
  const setManagementMode = (value: ManagementMode) => dispatchFlow({ type: 'management-opened', mode: value })
  const requestExit = () => {
    if (initialGoal || workingGoal) {
      onExit()
      return
    }
    setQuitConfirmationOpen(true)
  }
  const activeGoal = workingGoal ?? initialGoal
  const activePortfolio = activeGoal ? (getRoboPortfolioForGoal(activeGoal) ?? selectedPortfolio) : selectedPortfolio
  const publishGoalUpdate = (goal: RoboExistingGoal) => {
    setWorkingGoal(goal)
    onGoalUpdated?.(goal)
  }
  const saveGoalPlan = (nextTargetAmount: string, nextHorizonYears: number) => {
    const targetDigits = nextTargetAmount.replace(/\D/g, '')
    if (!targetDigits || !isValidRoboHorizon(String(nextHorizonYears))) return

    setTargetAmount(targetDigits)
    if ([3, 5, 7, 10].includes(nextHorizonYears)) selectHorizon(nextHorizonYears)
    else setManualHorizonValue(String(nextHorizonYears))

    if (activeGoal) {
      const targetInteger = formatCzkInteger(targetDigits)
      publishGoalUpdate({
        ...activeGoal,
        targetInteger,
        targetDecimals: ',00 CZK',
        horizonYears: nextHorizonYears,
        endDate: getRoboGoalEndDate(activeGoal, nextHorizonYears),
      })
    }
    setManagementMode('menu')
  }
  const selectedCashAccount = currentAccounts.find((account) => account.id === selectedCashAccountId) ?? null
  const openBasketHolding = (
    basket: InvestmentBasketFund,
    holding: InvestmentBasketFundHolding,
    currentValue?: number,
  ) => {
    const normalizedTitle = holding.title.trim().toLowerCase()
    const security =
      securityCatalog.find(
        (candidate) =>
          (holding.productId && (candidate.productId === holding.productId || candidate.id === holding.productId)) ||
          candidate.title.trim().toLowerCase() === normalizedTitle,
      ) ?? null
    const localizedSecurity = security
      ? currentValue === undefined
        ? localizeRoboBasketInstrument(security, country, { title: holding.title, productId: holding.productId })
        : buildRoboBasketPosition(
            security,
            roundMoney((currentValue * (holding.percent ?? 100 / Math.max(basket.holdings?.length ?? 0, 1))) / 100),
            country,
            { title: holding.title, productId: holding.productId },
          )
      : null
    setSelectedBasketHolding({ basketTitle: basket.title, holding, security: localizedSecurity })
  }

  const strategies = useMemo(() => ROBO_STRATEGIES.slice(0, availableStrategyCount), [availableStrategyCount])
  const selectedStrategy: RoboStrategy =
    strategies.find((strategy) => strategy.id === selectedStrategyId) ?? strategies[0] ?? DEFAULT_ROBO_STRATEGY
  const portfolios = getPortfoliosForStrategy(selectedStrategy.id, 'moderate-v2')
  const basketPortfolios = portfolios.filter((candidate) => candidate.basketFund)
  const selectedBasketPortfolio =
    basketPortfolios.find((candidate) => candidate.id === selectedPortfolio?.id) ?? basketPortfolios[0] ?? null
  const fundingFields = fundingMethod ? getFundingFieldVisibility(fundingMethod) : null
  const resolvedHorizon = horizonYears || Number(manualHorizon) || 10
  const hydratedGoalIdsRef = useRef(new Set<string>())

  useEffect(() => {
    const goal = workingGoal ?? initialGoal
    const basket = activePortfolio?.basketFund
    if (!goal || !basket || hydratedGoalIdsRef.current.has(goal.id)) return

    const reconciledGoal = hydrateRoboGoal(goal, basket, country, securityCatalog)
    hydratedGoalIdsRef.current.add(goal.id)
    if (reconciledGoal === goal) return
    dispatchFlow({ type: 'goal-updated', goal: reconciledGoal })
    onGoalUpdated?.(reconciledGoal)
  }, [activePortfolio, country, initialGoal, onGoalUpdated, securityCatalog, workingGoal])

  const createGoalFromSelection = () => {
    if (!selectedPortfolio?.basketFund) return
    const initialInvestment = 0
    const start = formatRoboGoalDate(parseRoboCalendarDate(startDate))
    const createdGoal = buildInitialRoboGoal(
      selectedPortfolio,
      {
        id: `goal-${createRoboTradeEventId()}`,
        name: goalName.trim() || selectedPortfolio.name,
        purpose: goalType || 'General build-up wealth',
        currentInteger: '0',
        currentDecimals: ',00 CZK',
        returnLabel: '0 total return',
        returnTone: 'neutral',
        targetInteger: formatCzkInteger(targetAmount || '0'),
        targetDecimals: ',00 CZK',
        horizonYears: resolvedHorizon,
        startDate: start,
        endDate: getRoboGoalEndDateFromStart(start, resolvedHorizon),
      },
      initialInvestment,
      country,
      securityCatalog,
      { date: new Date().toISOString() },
    )
    publishGoalUpdate(createdGoal)
  }

  const {
    strategyCarouselRef,
    portfolioCarouselRef,
    strategyDragHandlers,
    portfolioDragHandlers,
    isStrategyDragging,
    isPortfolioDragging,
  } = useRoboCarousels(
    strategies,
    basketPortfolios,
    selectedBasketPortfolio,
    step,
    selectedStrategy.id,
    setSelectedStrategyId,
    setSelectedPortfolio,
  )

  useEffect(() => {
    if (step !== 'processing') return
    const timeout = window.setTimeout(() => dispatchFlow({ type: 'processing-completed' }), 900)
    return () => window.clearTimeout(timeout)
  }, [step])

  const goBackByStep = () => {
    const destination = getRoboAdvisorBackStep(flowState, true)
    if (destination) setStep(destination)
    else onBack()
  }

  const selectedBasketHoldingOverlay = selectedBasketHolding ? (
    <BottomSheet
      title={selectedBasketHolding.holding.title}
      onClose={() => setSelectedBasketHolding(null)}
      closeLabel={`Close ${selectedBasketHolding.holding.title} details`}
      fillHeight
      className="!p-0"
      headerClassName="mx-[16px] mt-[16px] !mb-[8px]"
      bodyClassName="min-h-0 flex-1"
    >
      <InvestmentSecurityDetailScreen
        security={selectedBasketHolding.security ?? undefined}
        transactions={transactions}
        basketHoldingDetail={
          selectedBasketHolding.security
            ? undefined
            : {
                title: selectedBasketHolding.holding.title,
                productId: selectedBasketHolding.holding.productId,
                basketTitle: selectedBasketHolding.basketTitle,
                allocationPercent: selectedBasketHolding.holding.percent,
              }
        }
        country={country}
        amountsHidden={amountsHidden}
        onBack={() => setSelectedBasketHolding(null)}
        czRoboProductDetail
        inBottomSheet
        hideOrderActions
      />
    </BottomSheet>
  ) : undefined

  if (quitConfirmationOpen) {
    return <QuitConfirmationScreen onResume={() => setQuitConfirmationOpen(false)} onQuit={onExit} />
  }

  if (basketDetailsToOpen) {
    return (
      <InvestmentBasketFundDetailScreen
        basket={basketDetailsToOpen}
        securityCatalog={securityCatalog}
        country="CZ"
        amountsHidden={false}
        czRoboProductDetail
        onOpenHolding={(holding) => openBasketHolding(basketDetailsToOpen, holding, 0)}
        overlay={selectedBasketHoldingOverlay}
        footerActionLabel="Select"
        onFooterAction={() => {
          const basketPortfolio = basketPortfolios.find(
            (candidate) => candidate.basketFund?.id === basketDetailsToOpen.id,
          )
          if (!basketPortfolio) return
          setSelectedPortfolio(basketPortfolio)
          setBasketDetailsToOpen(null)
          setStep('review')
        }}
        onBack={() => setBasketDetailsToOpen(null)}
      />
    )
  }

  if (step === 'intro') {
    return (
      <IntroScreen onExit={requestExit} onCreate={() => setStep('contact')} />
    )
  }

  if (step === 'contact') {
    return <PersonalDataConfirmationScreen onBack={goBackByStep} onConfirm={() => setStep('profile')} />
  }

  if (step === 'profile') {
    return (
      <InvestorProfileScreen
        status={profileStatus}
        onBack={goBackByStep}
        onExit={requestExit}
        onContinue={() => setStep('goal-type')}
      />
    )
  }

  if (step === 'goal-type') {
    return (
      <CreationGoalTypeScreen
        goBackByStep={goBackByStep}
        requestExit={requestExit}
        goalType={goalType}
        setStep={setStep}
        setGoalType={setGoalType}
      />
    )
  }

  if (step === 'goal-name') {
    return (
      <CreationGoalNameScreen
        goBackByStep={goBackByStep}
        requestExit={requestExit}
        goalName={goalName}
        setStep={setStep}
        setGoalName={setGoalName}
        goalType={goalType}
      />
    )
  }

  if (step === 'target') {
    return (
      <GoalPlanScreen
        dataScreen="target-and-horizon"
        targetAmount={targetAmount}
        onTargetAmountChange={setTargetAmount}
        horizonYears={horizonYears}
        manualHorizon={manualHorizon}
        onSelectHorizon={selectHorizon}
        onManualHorizonChange={setManualHorizonValue}
        onBack={goBackByStep}
        onClose={requestExit}
        onContinue={() => dispatchFlow({ type: 'open-portfolio', from: 'target' })}
      />
    )
  }

  if (step === 'funding-setup') {
    return (
      <CreationFundingSetupScreen
        fundingMethod={fundingMethod}
        fundingFields={fundingFields}
        selectedCashAccount={selectedCashAccount}
        initialAmount={initialAmount}
        monthlyContribution={monthlyContribution}
        startDate={startDate}
        demoClock={demoClock}
        goBackByStep={goBackByStep}
        requestExit={requestExit}
        startDatePickerOpen={startDatePickerOpen}
        setStartDatePickerOpen={setStartDatePickerOpen}
        setStartDate={setStartDate}
        cashAccountSheetOpen={cashAccountSheetOpen}
        currentAccounts={currentAccounts}
        country={country}
        amountsHidden={amountsHidden}
        selectedCashAccountId={selectedCashAccountId}
        setCashAccountSheetOpen={setCashAccountSheetOpen}
        setSelectedCashAccountId={setSelectedCashAccountId}
        dispatchFlow={dispatchFlow}
        setFundingMethod={setFundingMethod}
        setInitialAmount={setInitialAmount}
        setMonthlyContribution={setMonthlyContribution}
      />
    )
  }

  if (step === 'strategy') {
    return (
      <CreationStrategyScreen
        strategies={strategies}
        goBackByStep={goBackByStep}
        requestExit={requestExit}
        dispatchFlow={dispatchFlow}
        selectedStrategy={selectedStrategy}
        strategyCarouselRef={strategyCarouselRef}
        strategyDragHandlers={strategyDragHandlers}
        setSelectedStrategyId={setSelectedStrategyId}
        isStrategyDragging={isStrategyDragging}
      />
    )
  }

  if (step === 'projection') {
    return (
      <CreationProjectionScreen
        initialAmount={initialAmount}
        monthlyContribution={monthlyContribution}
        selectedStrategy={selectedStrategy}
        resolvedHorizon={resolvedHorizon}
        goBackByStep={goBackByStep}
        requestExit={requestExit}
        setInitialAmount={setInitialAmount}
        setMonthlyContribution={setMonthlyContribution}
        dispatchFlow={dispatchFlow}
      />
    )
  }

  if (step === 'portfolio') {
    return (
      <CreationPortfolioScreen
        goBackByStep={goBackByStep}
        requestExit={requestExit}
        selectedBasketHoldingOverlay={selectedBasketHoldingOverlay}
        selectedBasketPortfolio={selectedBasketPortfolio}
        setSelectedPortfolio={setSelectedPortfolio}
        setStep={setStep}
        portfolioCarouselRef={portfolioCarouselRef}
        portfolioDragHandlers={portfolioDragHandlers}
        basketPortfolios={basketPortfolios}
        isPortfolioDragging={isPortfolioDragging}
        setBasketDetailsToOpen={setBasketDetailsToOpen}
        openBasketHolding={openBasketHolding}
      />
    )
  }

  if (step === 'review' && selectedPortfolio) {
    return (
      <CreationReviewScreen
        goalType={goalType}
        goalName={goalName}
        targetAmount={targetAmount}
        selectedPortfolio={selectedPortfolio}
        resolvedHorizon={resolvedHorizon}
        goBackByStep={goBackByStep}
        requestExit={requestExit}
        termsSheetOpen={termsSheetOpen}
        setTermsSheetOpen={setTermsSheetOpen}
        setTermsAccepted={setTermsAccepted}
        termsAccepted={termsAccepted}
        setStep={setStep}
      />
    )
  }

  if (step === 'sign') {
    return (
      <StandardSignScreen
        title="Sign goal"
        pinLabel="Security code"
        pinHelper="Confirm securely to open your goal. You can place the first basket top-up after the goal is ready."
        actionLabel="Sign goal"
        onBack={goBackByStep}
        onSign={() => {
          createGoalFromSelection()
          setStep('processing')
        }}
      />
    )
  }

  if (step === 'processing') {
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center bg-[var(--uc-surface)] px-[34px] text-center"
        data-robo-screen="processing"
      >
        <div className="size-[72px] animate-spin rounded-full border-[5px] border-[var(--uc-border)] border-t-[var(--uc-action)]" />
        <h1 className="uc-type-h1 mt-[34px] text-[var(--uc-text)]">We’re setting up your goal</h1>
        <p className="uc-type-n4 mt-[14px] leading-[21px] text-[var(--uc-text)]">
          We’re opening the investment account and setting up your empty goal. Basket investments can be added once it
          is ready.
        </p>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <CreationSuccessScreen
        goalName={goalName || 'My investment goal'}
        targetAmount={formatCzkInput(targetAmount)}
        basketName={selectedPortfolio?.basketFund?.title ?? selectedPortfolio?.name ?? ''}
        onAddMoney={() => {
          setStep('goal-detail')
          setManagementMode('add-money')
        }}
        onOpenGoal={() => setStep('goal-detail')}
      />
    )
  }

  if (step === 'goal-detail' && activePortfolio) {
    if (managementMode !== 'menu') {
      return (
        <ManagementScreen
          mode={managementMode}
          goalName={goalName}
          portfolio={activePortfolio}
          currentValue={getRoboGoalCurrentValue(activeGoal)}
          country={country}
          amountsHidden={amountsHidden}
          securityCatalog={securityCatalog}
          basketDetailsOverlay={selectedBasketHoldingOverlay}
          onOpenBasketHolding={(holding) => {
            const basket = activePortfolio.basketFund
            if (basket) openBasketHolding(basket, holding, getRoboGoalCurrentValue(activeGoal))
          }}
          targetAmount={targetAmount}
          onTargetAmountChange={setTargetAmount}
          horizonYears={horizonYears}
          manualHorizon={manualHorizon}
          onSelectHorizon={selectHorizon}
          onManualHorizonChange={setManualHorizonValue}
          onBack={() => {
            setManagementMode(getPreviousManagementMode(managementMode))
          }}
          onClose={requestExit}
          onMode={setManagementMode}
          currentAccounts={currentAccounts}
          selectedCashAccountId={selectedCashAccountId}
          onCashAccountChange={setSelectedCashAccountId}
          existingGoal={activeGoal}
          onGoalUpdated={publishGoalUpdate}
          defaultStartDate={startDate}
          demoClock={demoClock}
          onAddMoney={(contribution) => {
            const basket = activePortfolio.basketFund
            if (!activeGoal || !basket) return
            const nextGoal = applyRoboTopUp(activeGoal, activePortfolio, contribution, country, securityCatalog, {
              id: contribution.initialAmount > 0 ? createRoboTradeEventId() : '',
              date: new Date().toISOString(),
            })
            publishGoalUpdate(nextGoal)
          }}
          onRename={(name) => {
            setGoalName(name)
            if (activeGoal) publishGoalUpdate({ ...activeGoal, name })
          }}
          onSaveGoalPlan={saveGoalPlan}
        />
      )
    }
    return (
      <GoalDetail
        chartReferenceDate={chartReferenceDate}
        goalName={goalName}
        targetAmount={targetAmount}
        portfolio={activePortfolio}
        country={country}
        amountsHidden={amountsHidden}
        securityCatalog={securityCatalog}
        horizonYears={resolvedHorizon}
        existingGoal={activeGoal}
        onBack={requestExit}
        onClose={requestExit}
        onAction={setManagementMode}
        onOpenSecurity={onOpenSecurity}
      />
    )
  }

  return null
}
