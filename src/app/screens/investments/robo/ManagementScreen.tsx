import { ManageAddMoneyBasketScreen, ManageGoalPlanScreen } from '@/app/screens/investments/robo/GoalSettingsScreens'
import { ManageFullWithdrawalScreen } from '@/app/screens/investments/robo/WithdrawalScreens'
import { ManagementInputScreen } from '@/app/screens/investments/robo/ManagementInputScreen'
import { ManageCloseScreen } from '@/app/screens/investments/robo/GoalSettingsScreens'
import { ManageWithdrawScreen } from '@/app/screens/investments/robo/WithdrawalScreens'
import { ManageSettingsScreen } from '@/app/screens/investments/robo/GoalSettingsScreens'
import { TopUpReviewScreen } from '@/app/screens/investments/robo/TopUpScreens'
import { ManageHistoryScreen } from '@/app/screens/investments/robo/GoalSettingsScreens'

import { TopUpSuccessScreen } from '@/app/screens/investments/robo/TopUpScreens'
import { TopUpSignScreen } from '@/app/screens/investments/robo/TopUpScreens'
import { WithdrawalSaleScreen } from '@/app/screens/investments/robo/WithdrawalScreens'
import { canReviewRoboTopUp } from '@/features/investments/robo/flowSelectors'
import { createRoboManagementState, roboManagementReducer } from '@/features/investments/robo/managementState'
import { useMemo, useReducer, type ReactNode } from 'react'
import InvestmentProductCard from '@/app/components/investments/InvestmentProductCard'
import { isRoboFundingDateAllowed, type RoboDemoClock } from '@/features/investments/robo/demoClock'
import { formatInvestmentAmountParts } from '@/app/utils/investmentAmountFormatting'
import type { CountryId } from '@/app/state/demoTypes'
import type { CurrentAccount } from '@/data/products'
import { type InvestmentCatalogSecurity } from '@/app/config/investmentsPortfolioConfig'
import { type InvestmentBasketFundHolding } from '@/app/config/investmentBasketFundsConfig'
import { getFundingFieldVisibility, getRoboPortfolioForGoal } from '@/features/investments/robo/model'
import { type RoboFundingMethod, type RoboExistingGoal, type RoboPortfolio } from '@/features/investments/robo/types'
import { type RoboAdvisorManagementMode as ManagementMode } from '@/app/screens/investments/roboAdvisorFlowState'
import { getRoboWithdrawalProducts, RoboWithdrawalProduct } from '@/features/investments/robo/goalModel'

export function ManagementScreen({
  mode,
  goalName,
  portfolio,
  currentValue,
  country,
  amountsHidden,
  securityCatalog,
  basketDetailsOverlay,
  onOpenBasketHolding,
  targetAmount,
  onTargetAmountChange,
  horizonYears,
  manualHorizon,
  onSelectHorizon,
  onManualHorizonChange,
  onBack,
  onClose,
  onMode,
  currentAccounts,
  selectedCashAccountId,
  onCashAccountChange,
  existingGoal,
  onGoalUpdated,
  onAddMoney,
  defaultStartDate,
  demoClock,
  onRename,
  onSaveGoalPlan,
}: {
  mode: ManagementMode
  goalName: string
  portfolio: RoboPortfolio
  currentValue: number
  country: CountryId
  amountsHidden: boolean
  securityCatalog: readonly InvestmentCatalogSecurity[]
  basketDetailsOverlay?: ReactNode
  onOpenBasketHolding?: (holding: InvestmentBasketFundHolding) => void
  targetAmount: string
  onTargetAmountChange: (value: string) => void
  horizonYears: number
  manualHorizon: string
  onSelectHorizon: (years: number) => void
  onManualHorizonChange: (value: string) => void
  onBack: () => void
  onClose: () => void
  onMode: (mode: ManagementMode) => void
  currentAccounts: readonly CurrentAccount[]
  selectedCashAccountId: string
  onCashAccountChange: (accountId: string) => void
  existingGoal?: RoboExistingGoal
  onGoalUpdated: (goal: RoboExistingGoal) => void
  onAddMoney: (contribution: {
    method: RoboFundingMethod
    initialAmount: number
    monthlyAmount: number
    startDate: string
    cashAccountId: string
  }) => void
  defaultStartDate: string
  demoClock: RoboDemoClock
  onRename: (name: string) => void
  onSaveGoalPlan: (targetAmount: string, horizonYears: number) => void
}) {
  const savedRecurringStartDate = existingGoal?.recurringContribution?.startDate
  const initialFundingDate =
    savedRecurringStartDate && isRoboFundingDateAllowed(savedRecurringStartDate, demoClock)
      ? savedRecurringStartDate
      : defaultStartDate
  const [management, dispatchManagement] = useReducer(
    roboManagementReducer,
    { mode, name: goalName, date: initialFundingDate, goal: existingGoal },
    createRoboManagementState,
  )
  if (management.mode !== mode || management.initialFundingDate !== initialFundingDate) {
    dispatchManagement({
      type: 'mode-entered',
      seed: { mode, name: goalName, date: initialFundingDate, goal: existingGoal },
    })
  }
  const { amount, monthlyAmount, method: topUpMethod, kind: addMoneyStep, date } = management.topUp
  const {
    renameName,
    historyTab,
    recurringDatePickerOpen,
    cashAccountSheetOpen: topUpCashAccountSheetOpen,
  } = management
  const selectedWithdrawalProductId = management.withdrawal.productId
  const selectedWithdrawalOrderSecurity =
    management.withdrawal.kind === 'selling' ? management.withdrawal.security : null
  const setAmount = (value: string) => dispatchManagement({ type: 'amount-changed', value })
  const setMonthlyAmount = (value: string) => dispatchManagement({ type: 'monthly-amount-changed', value })
  const setDate = (value: string) => dispatchManagement({ type: 'date-changed', value })
  const setRenameName = (value: string) => dispatchManagement({ type: 'rename-changed', value })
  const setTopUpMethod = (method: RoboFundingMethod) => dispatchManagement({ type: 'method-changed', method })
  const setHistoryTab = (tab: 'transactions' | 'orders') => dispatchManagement({ type: 'history-tab-changed', tab })
  const setRecurringDatePickerOpen = (open: boolean) => dispatchManagement({ type: 'date-picker-toggled', open })
  const setTopUpCashAccountSheetOpen = (open: boolean) => dispatchManagement({ type: 'account-sheet-toggled', open })
  const basket = portfolio.basketFund ?? (existingGoal ? getRoboPortfolioForGoal(existingGoal)?.basketFund : undefined)
  const selectedTopUpCashAccount = currentAccounts.find((account) => account.id === selectedCashAccountId) ?? null
  const addMoneyAmount = Number(amount.replace(/[^\d]/g, ''))
  const monthlyContributionAmount = Number(monthlyAmount.replace(/[^\d]/g, ''))
  const topUpFields = getFundingFieldVisibility(topUpMethod)
  const initialTopUpAmount = topUpFields.initialAmount ? addMoneyAmount : 0
  const canReviewTopUp = canReviewRoboTopUp(
    topUpMethod,
    initialTopUpAmount,
    monthlyContributionAmount,
    date,
    Boolean(selectedTopUpCashAccount),
    demoClock,
  )
  const withdrawalProducts = useMemo(
    () => getRoboWithdrawalProducts(portfolio, currentValue, country, securityCatalog, existingGoal?.positions),
    [country, currentValue, existingGoal?.positions, portfolio, securityCatalog],
  )
  const goalTransactions = existingGoal?.transactions ?? []
  const goalOrders = existingGoal?.orders ?? []
  const withdrawableProducts = withdrawalProducts.filter((product) => product.localValue > 0)
  const selectedWithdrawalProducts = withdrawalProducts.filter((product) => product.id === selectedWithdrawalProductId)
  const selectedWithdrawalValue = selectedWithdrawalProducts.reduce((total, product) => total + product.localValue, 0)
  const openWithdrawalProduct = (product: RoboWithdrawalProduct) => {
    if (!product.security) return
    dispatchManagement({ type: 'sale-opened', productId: product.id, security: product.security })
  }

  const renderSelectedWithdrawalProducts = () => (
    <div className="mt-[20px]">
      {selectedWithdrawalProducts.map((product) => {
        if (!product.security) return null
        const security = product.security
        return (
          <InvestmentProductCard
            key={product.id}
            security={security}
            valueParts={formatInvestmentAmountParts(security.value, country, security.currency, amountsHidden)}
            performanceParts={formatInvestmentAmountParts(
              security.performanceAmount,
              country,
              security.localCurrency,
              amountsHidden,
              true,
            )}
            valueLabel="Value"
            performanceLabel="Performance"
            czRoboAmountStyle
            amountsHidden={amountsHidden}
            currentPriceParts={formatInvestmentAmountParts(
              security.marketPrice,
              country,
              security.instrumentCurrency,
              amountsHidden,
            )}
            portfolioValueParts={formatInvestmentAmountParts(
              security.localValue,
              country,
              security.localCurrency,
              amountsHidden,
            )}
          />
        )
      })}
    </div>
  )

  if (selectedWithdrawalOrderSecurity) {
    return (
      <WithdrawalSaleScreen
        selectedWithdrawalOrderSecurity={selectedWithdrawalOrderSecurity}
        currentAccounts={currentAccounts}
        country={country}
        amountsHidden={amountsHidden}
        dispatchManagement={dispatchManagement}
        existingGoal={existingGoal}
        portfolio={portfolio}
        currentValue={currentValue}
        securityCatalog={securityCatalog}
        selectedWithdrawalProductId={selectedWithdrawalProductId}
        onGoalUpdated={onGoalUpdated}
        onMode={onMode}
      />
    )
  }

  if (mode === 'add-money' && addMoneyStep === 'sign') {
    return (
      <TopUpSignScreen
        dispatchManagement={dispatchManagement}
        onAddMoney={onAddMoney}
        topUpMethod={topUpMethod}
        initialTopUpAmount={initialTopUpAmount}
        topUpFields={topUpFields}
        monthlyContributionAmount={monthlyContributionAmount}
        date={date}
        selectedTopUpCashAccount={selectedTopUpCashAccount}
      />
    )
  }

  if (mode === 'add-money' && addMoneyStep === 'success') {
    return <TopUpSuccessScreen topUpMethod={topUpMethod} onMode={onMode} />
  }

  if (mode === 'add-money-basket') {
    return (
      <ManageAddMoneyBasketScreen
        basket={basket}
        securityCatalog={securityCatalog}
        country={country}
        amountsHidden={amountsHidden}
        onBack={onBack}
        onOpenBasketHolding={onOpenBasketHolding}
        basketDetailsOverlay={basketDetailsOverlay}
        onMode={onMode}
      />
    )
  }

  if (mode === 'goal-plan') {
    return (
      <ManageGoalPlanScreen
        targetAmount={targetAmount}
        onTargetAmountChange={onTargetAmountChange}
        horizonYears={horizonYears}
        manualHorizon={manualHorizon}
        onSelectHorizon={onSelectHorizon}
        onManualHorizonChange={onManualHorizonChange}
        onBack={onBack}
        onClose={onClose}
        onSaveGoalPlan={onSaveGoalPlan}
      />
    )
  }

  if (mode === 'history') {
    return (
      <ManageHistoryScreen
        onBack={onBack}
        historyTab={historyTab}
        goalTransactions={goalTransactions}
        goalOrders={goalOrders}
        setHistoryTab={setHistoryTab}
      />
    )
  }

  if (mode === 'add-money' && addMoneyStep === 'review') {
    return (
      <TopUpReviewScreen
        topUpFields={topUpFields}
        basket={basket}
        existingGoal={existingGoal}
        initialTopUpAmount={initialTopUpAmount}
        country={country}
        amountsHidden={amountsHidden}
        monthlyContributionAmount={monthlyContributionAmount}
        date={date}
        selectedTopUpCashAccount={selectedTopUpCashAccount}
        dispatchManagement={dispatchManagement}
        canReviewTopUp={canReviewTopUp}
      />
    )
  }

  if (mode === 'settings') {
    return <ManageSettingsScreen onBack={onBack} onClose={onClose} onMode={onMode} />
  }

  if (mode === 'withdraw') {
    return (
      <ManageWithdrawScreen
        onBack={onBack}
        onClose={onClose}
        withdrawableProducts={withdrawableProducts}
        country={country}
        amountsHidden={amountsHidden}
        openWithdrawalProduct={openWithdrawalProduct}
      />
    )
  }

  if (mode === 'full-withdrawal') {
    return (
      <ManageFullWithdrawalScreen
        onBack={onBack}
        onClose={onClose}
        selectedWithdrawalValue={selectedWithdrawalValue}
        renderSelectedWithdrawalProducts={renderSelectedWithdrawalProducts}
      />
    )
  }

  if (mode === 'close') {
    return <ManageCloseScreen onBack={onBack} onClose={onClose} />
  }

  return (
    <ManagementInputScreen
      mode={mode}
      onBack={onBack}
      onClose={onClose}
      recurringDatePickerOpen={recurringDatePickerOpen}
      setRecurringDatePickerOpen={setRecurringDatePickerOpen}
      demoClock={demoClock}
      date={date}
      setDate={setDate}
      topUpCashAccountSheetOpen={topUpCashAccountSheetOpen}
      currentAccounts={currentAccounts}
      country={country}
      amountsHidden={amountsHidden}
      selectedCashAccountId={selectedCashAccountId}
      setTopUpCashAccountSheetOpen={setTopUpCashAccountSheetOpen}
      onCashAccountChange={onCashAccountChange}
      renameName={renameName}
      canReviewTopUp={canReviewTopUp}
      onRename={onRename}
      onMode={onMode}
      dispatchManagement={dispatchManagement}
      renderSelectedWithdrawalProducts={renderSelectedWithdrawalProducts}
      topUpMethod={topUpMethod}
      setTopUpMethod={setTopUpMethod}
      topUpFields={topUpFields}
      amount={amount}
      setAmount={setAmount}
      monthlyAmount={monthlyAmount}
      setMonthlyAmount={setMonthlyAmount}
      setRenameName={setRenameName}
      selectedTopUpCashAccount={selectedTopUpCashAccount}
    />
  )
}
