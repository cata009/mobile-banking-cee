import type { InvestmentBasketFund } from '@/app/config/investmentBasketFundsConfig'
import type { InvestmentHistoryOrder, InvestmentHistoryTransaction } from '@/app/config/investmentsPortfolioConfig'
import { useState, type ReactNode } from 'react'
import PrimaryButton from '@/app/components/PrimaryButton'
import NavigationRow from '@/app/components/NavigationRow'
import InvestmentBasketFundDetailScreen from '@/app/screens/investments/InvestmentBasketFundDetailScreen'
import InvestmentsHistoryScreen from '@/app/screens/investments/InvestmentsHistoryScreen'
import type { CountryId } from '@/app/state/demoTypes'
import { type InvestmentCatalogSecurity } from '@/app/config/investmentsPortfolioConfig'
import { type InvestmentBasketFundHolding } from '@/app/config/investmentBasketFundsConfig'
import { type RoboAdvisorManagementMode as ManagementMode } from '@/app/screens/investments/roboAdvisorFlowState'
import { GoalPlanScreen } from '@/app/screens/investments/robo/GoalPlanScreen'
import { RoboScreen } from '@/app/screens/investments/robo/RoboScreen'

export function ManageAddMoneyBasketScreen({
  basket,
  securityCatalog,
  country,
  amountsHidden,
  onBack,
  onOpenBasketHolding,
  basketDetailsOverlay,
  onMode,
}: {
  basket: InvestmentBasketFund | undefined
  securityCatalog: readonly InvestmentCatalogSecurity[]
  country: CountryId
  amountsHidden: boolean
  onBack: () => void
  onOpenBasketHolding: ((holding: InvestmentBasketFundHolding) => void) | undefined
  basketDetailsOverlay: ReactNode
  onMode: (mode: ManagementMode) => void
}) {
  if (!basket) return null

  return (
    <InvestmentBasketFundDetailScreen
      basket={basket}
      securityCatalog={securityCatalog}
      country={country}
      amountsHidden={amountsHidden}
      onBack={onBack}
      czRoboProductDetail
      onOpenHolding={onOpenBasketHolding}
      overlay={basketDetailsOverlay}
      footerActionLabel="Buy"
      onFooterAction={() => onMode('add-money')}
    />
  )
}

export function ManageGoalPlanScreen({
  targetAmount,
  onTargetAmountChange,
  horizonYears,
  manualHorizon,
  onSelectHorizon,
  onManualHorizonChange,
  onBack,
  onClose,
  onSaveGoalPlan,
}: {
  targetAmount: string
  onTargetAmountChange: (value: string) => void
  horizonYears: number
  manualHorizon: string
  onSelectHorizon: (years: number) => void
  onManualHorizonChange: (value: string) => void
  onBack: () => void
  onClose: () => void
  onSaveGoalPlan: (targetAmount: string, horizonYears: number) => void
}) {
  return (
    <GoalPlanScreen
      dataScreen="manage-goal-plan"
      targetAmount={targetAmount}
      onTargetAmountChange={onTargetAmountChange}
      horizonYears={horizonYears}
      manualHorizon={manualHorizon}
      onSelectHorizon={onSelectHorizon}
      onManualHorizonChange={onManualHorizonChange}
      onBack={onBack}
      onClose={onClose}
      onContinue={(years) => onSaveGoalPlan(targetAmount, years)}
      continueLabel="Save changes"
    />
  )
}

export function ManageHistoryScreen({
  onBack,
  historyTab,
  goalTransactions,
  goalOrders,
  setHistoryTab,
}: {
  onBack: () => void
  historyTab: 'transactions' | 'orders'
  goalTransactions: readonly InvestmentHistoryTransaction[]
  goalOrders: readonly InvestmentHistoryOrder[]
  setHistoryTab: (tab: 'transactions' | 'orders') => void
}) {
  return (
    <InvestmentsHistoryScreen
      onBack={onBack}
      initialTab={historyTab}
      hideAllTimeDateOption
      hideCurrencyFilter
      transactionsOverride={goalTransactions}
      ordersOverride={goalOrders}
      onTabChange={setHistoryTab}
    />
  )
}

export function ManageSettingsScreen({
  basket,
  securityCatalog,
  country,
  amountsHidden,
  onOpenBasketHolding,
  basketDetailsOverlay,
  onBack,
  onClose,
  onMode,
}: {
  basket: InvestmentBasketFund | undefined
  securityCatalog: readonly InvestmentCatalogSecurity[]
  country: CountryId
  amountsHidden: boolean
  onOpenBasketHolding?: (holding: InvestmentBasketFundHolding) => void
  basketDetailsOverlay?: ReactNode
  onBack: () => void
  onClose: () => void
  onMode: (mode: ManagementMode) => void
}) {
  const [modelPortfolioOpen, setModelPortfolioOpen] = useState(false)

  if (modelPortfolioOpen && basket) {
    return (
      <InvestmentBasketFundDetailScreen
        basket={basket}
        securityCatalog={securityCatalog}
        country={country}
        amountsHidden={amountsHidden}
        onBack={() => setModelPortfolioOpen(false)}
        czRoboProductDetail
        onOpenHolding={onOpenBasketHolding}
        overlay={basketDetailsOverlay}
      />
    )
  }

  return (
    <RoboScreen
      title="Goal settings"
      description="Update how the goal is displayed and tracked. A material change may require a new suitability check."
      onBack={onBack}
      onClose={onClose}
      headerAction="none"
      dataScreen="settings"
    >
      <NavigationRow
        title="Rename goal"
        description="Change the name shown in Investments."
        trailingAccessory="chevron"
        onClick={() => onMode('rename')}
        className="!px-0"
      />
      <NavigationRow
        title="Change goal plan"
        description="Update your target amount and time horizon."
        trailingAccessory="chevron"
        onClick={() => onMode('goal-plan')}
        className="!px-0"
      />
      {basket ? (
        <NavigationRow
          title="Model Portfolio"
          description="View your selected basket and its product distribution."
          trailingAccessory="chevron"
          onClick={() => setModelPortfolioOpen(true)}
          className="!px-0"
        />
      ) : null}
    </RoboScreen>
  )
}

export function ManageCloseScreen({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  return (
    <RoboScreen
      title="Close this goal?"
      description="Closing removes the goal from your active list, but its documents and history remain available."
      onBack={onBack}
      onClose={onClose}
      dataScreen="close-goal"
      footer={
        <PrimaryButton labelSize="18" disabled>
          Close goal
        </PrimaryButton>
      }
    >
      <p className="uc-type-n4 rounded-[8px] bg-[var(--uc-surface-muted)] p-[16px] leading-[21px] text-[var(--uc-text)]">
        Withdraw all holdings and wait for the sale orders to complete before closing the goal.
      </p>
    </RoboScreen>
  )
}
