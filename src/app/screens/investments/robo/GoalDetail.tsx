import { getRoboDetailFlags } from '@/features/investments/robo/flowSelectors'
import { buildRoboGoalChartHistory } from '@/features/investments/robo/goalChartHistory'
import { useMemo, useState } from 'react'
import AccountActionBar from '@/app/components/accounts/AccountActionBar'
import InfoBanner from '@/app/components/cards/InfoBanner'
import InvestmentProductCard from '@/app/components/investments/InvestmentProductCard'
import InvestmentFilterChips from '@/app/components/investments/InvestmentFilterChips'
import InvestmentPeriodChips from '@/app/components/investments/InvestmentPeriodChips'
import InvestmentPortfolioChart from '@/app/components/investments/InvestmentPortfolioChart'
import { cn } from '@/app/components/ui/utils'
import { formatInvestmentAmountParts, formatInvestmentNumber } from '@/app/utils/investmentAmountFormatting'
import type { CountryId } from '@/app/state/demoTypes'
import {
  INVESTMENT_SORT_OPTIONS,
  buildInvestmentChartPoints,
  type InvestmentPeriodId,
  type InvestmentSortId,
  type InvestmentCatalogSecurity,
} from '@/app/config/investmentsPortfolioConfig'
import { ROBO_PORTFOLIO_PRESENTATIONS } from '@/features/investments/robo/catalog'
import {
  calculateRoboGoalProgress,
  formatCzkInput,
  formatCzkGoalAmount,
  formatCzkInteger,
  formatCzkReturnLabel,
  getRoboGoalProgress,
} from '@/features/investments/robo/model'
import { type RoboExistingGoal, type RoboPortfolio } from '@/features/investments/robo/types'
import { type RoboAdvisorManagementMode as ManagementMode } from '@/app/screens/investments/roboAdvisorFlowState'
import { getRoboGoalCurrentValue } from '@/features/investments/robo/goalModel'
import { getRoboGoalEndDateFromStart } from '@/features/investments/robo/goalPositions'
import {
  getGoalProductType,
  GOAL_DETAIL_PERIODS,
  BasketAllocation,
  PortfolioProductLogo,
} from '@/app/screens/investments/robo/PortfolioScreens'
import { RoboScreen } from '@/app/screens/investments/robo/RoboScreen'
import { GoalDetailHelpScreen } from '@/app/screens/investments/robo/GoalDetailHelpScreen'

export function GoalDetail({
  goalName,
  targetAmount,
  portfolio,
  country,
  amountsHidden,
  securityCatalog,
  horizonYears,
  chartReferenceDate,
  existingGoal,
  onBack,
  onClose,
  onAction,
  onOpenSecurity,
}: {
  goalName: string
  targetAmount: string
  portfolio: RoboPortfolio
  country: CountryId
  amountsHidden: boolean
  securityCatalog: readonly InvestmentCatalogSecurity[]
  horizonYears: number
  chartReferenceDate?: Date
  existingGoal?: RoboExistingGoal
  onBack: () => void
  onClose: () => void
  onAction: (mode: ManagementMode) => void
  onOpenSecurity?: (selection: {
    securityId: string
    productId?: string
    localValue: number
    performancePercent: number
    hideBuyAction?: boolean
    securityOverride?: InvestmentCatalogSecurity
  }) => void
}) {
  const currentValue = getRoboGoalCurrentValue(existingGoal)
  const { isEmptyGoal, hasPendingBuyOrders, hasRecurringPlan, hasSellHistory } = getRoboDetailFlags(
    currentValue,
    existingGoal,
  )
  const resolvedGoalName = existingGoal?.name ?? (goalName || 'My investment goal')
  const resolvedPurpose = existingGoal?.purpose ?? 'General build-up wealth'
  const resolvedTarget = existingGoal
    ? formatCzkGoalAmount(existingGoal.targetInteger, existingGoal.targetDecimals)
    : formatCzkInput(targetAmount)
  const draftTarget = Number(targetAmount)
  const resolvedProgress = existingGoal
    ? getRoboGoalProgress(existingGoal)
    : draftTarget > 0
      ? calculateRoboGoalProgress(currentValue, draftTarget)
      : 80
  const resolvedStartDate = existingGoal ? existingGoal.startDate : '15 Feb 2025'
  const resolvedEndDate =
    existingGoal?.endDate ?? getRoboGoalEndDateFromStart(resolvedStartDate ?? '15 Feb 2025', horizonYears)
  const resolvedReturnTone = existingGoal?.returnTone ?? 'negative'
  const resolvedReturnLabel = formatCzkReturnLabel(existingGoal?.returnLabel ?? '-1 100,00 CZK (-1,36%)')
  const [selectedPeriodId, setSelectedPeriodId] = useState<InvestmentPeriodId>('3y')
  const [helpOpen, setHelpOpen] = useState(false)
  const [selectedSortId, setSelectedSortId] = useState<InvestmentSortId>('max-value')
  const [capturedChartReferenceDate] = useState(() => new Date())
  const resolvedChartReferenceDate = chartReferenceDate ?? capturedChartReferenceDate
  const historicalChartPoints = useMemo(
    () => buildRoboGoalChartHistory(existingGoal, selectedPeriodId, resolvedChartReferenceDate),
    [existingGoal, selectedPeriodId, resolvedChartReferenceDate],
  )
  const chartPoints = useMemo(
    () => historicalChartPoints ?? buildInvestmentChartPoints(currentValue, selectedPeriodId),
    [currentValue, selectedPeriodId, historicalChartPoints],
  )
  const basket = portfolio.basketFund
  const presentation = basket ? null : ROBO_PORTFOLIO_PRESENTATIONS[portfolio.strategyId]
  const productRows = useMemo(() => {
    const rows = (presentation?.assetGroups ?? []).flatMap((group) =>
      group.products.map((product, index) => {
        const value = Math.round((currentValue * product.percent) / 100)
        const sourceSecurity = securityCatalog.find(
          (security) => security.id === product.securityId || security.productId === product.securityId,
        )
        const performance =
          sourceSecurity?.performancePercent ?? (index === 0 && group === presentation?.assetGroups[0] ? -1.8 : 1.8)
        const scale = sourceSecurity && sourceSecurity.localValue > 0 ? value / sourceSecurity.localValue : 0
        const security =
          sourceSecurity && scale > 0
            ? {
                ...sourceSecurity,
                title: product.name,
                value: Math.round(sourceSecurity.value * scale * 100) / 100,
                localValue: value,
                quantity: Number(((sourceSecurity.value * scale) / sourceSecurity.marketPrice).toFixed(6)),
                performancePercent: performance,
                performanceAmount: Math.round(((value * performance) / 100) * 100) / 100,
              }
            : undefined

        return {
          product,
          productType: getGoalProductType(group.label),
          value,
          performance,
          security,
        }
      }),
    )
    return [...rows].sort((left, right) => {
      if (selectedSortId === 'min-value') return left.value - right.value
      if (selectedSortId === 'max-percent') return right.product.percent - left.product.percent
      if (selectedSortId === 'min-percent') return left.product.percent - right.product.percent
      return right.value - left.value
    })
  }, [currentValue, presentation, securityCatalog, selectedSortId])
  if (helpOpen) {
    return <GoalDetailHelpScreen onBack={() => setHelpOpen(false)} />
  }
  return (
    <RoboScreen
      title={resolvedGoalName}
      description={resolvedPurpose}
      onBack={onBack}
      onClose={onClose}
      headerAction="help"
      onHelp={() => setHelpOpen(true)}
      dataScreen="goal-detail"
      descriptionTopClassName="mt-[8px]"
      contentTopClassName="pt-[16px]"
    >
      <div data-testid="robo-goal-detail">
        <p className="uc-type-n5 text-[var(--uc-text-muted)]">Current value</p>
        <p className="mt-[4px] text-[24px] font-bold leading-[26px] text-[var(--uc-text)]">
          {formatCzkInteger(existingGoal?.currentInteger ?? '79 800')}
          <span className="text-[16px] font-normal">{existingGoal?.currentDecimals ?? ',00 CZK'}</span>
        </p>
        <p
          className={cn(
            'uc-type-n5-strong mt-[4px]',
            resolvedReturnTone === 'positive'
              ? 'text-[var(--uc-green-olive)]'
              : resolvedReturnTone === 'negative'
                ? 'text-[var(--uc-status-red)]'
                : 'text-[var(--uc-text)]',
          )}
        >
          {resolvedReturnLabel}
          {resolvedReturnTone === 'neutral' ? null : (
            <span className="font-normal text-[var(--uc-text-muted)]"> total return</span>
          )}
        </p>
      </div>

      <div className="mt-[12px]">
        <InvestmentPortfolioChart
          points={chartPoints}
          country="CZ"
          currency="CZK"
          amountsHidden={false}
          compact
          czRoboPresentation
          showVerticalGridLines={false}
          zeroBaselineOnly={isEmptyGoal && !chartPoints.some((point) => point.value > 0)}
          showTooltipPerformance={historicalChartPoints === null}
          curveType={historicalChartPoints === null ? 'monotone' : 'stepAfter'}
        />
        <InvestmentPeriodChips
          periods={GOAL_DETAIL_PERIODS}
          comfortableTouchTargets
          className="mt-[12px]"
          selectedPeriodId={selectedPeriodId}
          onChange={setSelectedPeriodId}
        />
      </div>

      <AccountActionBar
        className="-mx-[8px] mt-[18px] !px-0 !py-[8px]"
        items={[
          {
            id: 'add-money',
            iconName: 'add-money',
            label: 'Add\nmoney',
            ariaLabel: 'Add money',
            onClick: () => onAction('add-money'),
          },
          {
            id: 'withdraw',
            iconName: 'robo-withdraw',
            label: 'Withdraw\nMoney',
            ariaLabel: 'Withdraw',
            onClick: () => onAction('withdraw'),
          },
          { id: 'history', iconName: 'investment-history', label: 'History', onClick: () => onAction('history') },
          {
            id: 'settings',
            iconName: 'robo-goal-settings',
            label: 'Goal\nSettings',
            ariaLabel: 'Goal settings',
            onClick: () => onAction('settings'),
          },
        ]}
      />

      {isEmptyGoal ? (
        <section className="mt-[16px]" data-testid="robo-empty-goal-state">
          <InfoBanner
            className="!w-full [&_.line-clamp-2]:line-clamp-none [&_.line-clamp-4]:line-clamp-none [&_.uc-type-n4]:leading-[22px]"
            title={
              hasPendingBuyOrders
                ? 'Your investment is being processed'
                : hasRecurringPlan
                  ? 'Your recurring top-up is scheduled'
                  : hasSellHistory
                    ? 'Your goal is currently empty'
                    : 'Your goal is ready to invest'
            }
            description={
              hasPendingBuyOrders
                ? 'Your goal will show positions and value after your investment is executed. Follow its status in History.'
                : hasRecurringPlan
                  ? `Your monthly contribution is set to start on ${existingGoal?.recurringContribution?.startDate}. Positions appear after the first basket order is executed.`
                  : hasSellHistory
                    ? 'Your previous sales remain in History. Add money whenever you’re ready to invest again.'
                    : 'Your model portfolio is ready. Select Add money to make your first investment towards this goal.'
            }
          />
        </section>
      ) : null}

      <>
        <h2 className="mt-[30px] text-[20px] font-bold leading-[24px] text-[var(--uc-text)]">Goal progress</h2>
        <div className="mt-[14px]">
          <div className="flex items-end justify-between gap-[16px]">
            <div>
              <p className="uc-type-n5 text-[var(--uc-text-muted)]">Target amount</p>
              <p className="uc-type-n4-strong text-[var(--uc-text)]">{resolvedTarget}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="uc-type-n5 text-[var(--uc-text-muted)]">Progress</p>
              <p className="uc-type-n4-strong text-[var(--uc-text)]" data-testid="goal-detail-progress-badge">
                {resolvedProgress}%
              </p>
            </div>
          </div>
          <div className="mt-[12px]" data-testid="goal-detail-progress-bar">
            <div className="h-[10px] overflow-hidden rounded-full border border-[var(--uc-border)] bg-[var(--uc-neutral-200)]">
              <div
                className="h-full rounded-full bg-[var(--uc-action)]"
                style={{ width: `${Math.min(100, Math.max(0, resolvedProgress))}%` }}
              />
            </div>
          </div>
          <div className="mt-[12px] flex justify-between uc-type-n5 text-[var(--uc-text-muted)]">
            {resolvedStartDate ? <span>{resolvedStartDate}</span> : null}
            <span>{resolvedEndDate}</span>
          </div>
        </div>
      </>

      {!isEmptyGoal ? (
        <>
          <h2 className="mt-[30px] text-[20px] font-bold leading-[24px] text-[var(--uc-text)]">Portfolio allocation</h2>
          <div className="-mx-[24px] mt-[8px]">
            <InvestmentFilterChips
              options={INVESTMENT_SORT_OPTIONS}
              selectedOptionId={selectedSortId}
              onChange={setSelectedSortId}
              className="pt-[8px] pb-[16px]"
            />

            <div className="px-[8px]">
              {basket ? (
                <BasketAllocation
                  basket={basket}
                  currentValue={currentValue}
                  country={country}
                  amountsHidden={amountsHidden}
                  securityCatalog={securityCatalog}
                  selectedSortId={selectedSortId}
                  goalPositions={existingGoal?.positions}
                  onOpenSecurity={onOpenSecurity}
                />
              ) : (
                <div>
                  {productRows.map(({ product, productType, value, performance, security }) =>
                    security ? (
                      <InvestmentProductCard
                        key={product.securityId}
                        security={security}
                        valueParts={formatInvestmentAmountParts(
                          security.value,
                          country,
                          security.currency,
                          amountsHidden,
                        )}
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
                        onClick={() =>
                          onOpenSecurity?.({
                            securityId: product.securityId,
                            localValue: security.localValue,
                            performancePercent: security.performancePercent,
                            hideBuyAction: true,
                          })
                        }
                      />
                    ) : (
                      <button
                        key={product.securityId}
                        type="button"
                        aria-label={`Open ${product.name} product details`}
                        onClick={() =>
                          onOpenSecurity?.({
                            securityId: product.securityId,
                            localValue: value,
                            performancePercent: performance,
                            hideBuyAction: true,
                          })
                        }
                        className="flex min-h-[80px] w-full items-start gap-[8px] px-[16px] py-[14px] text-left"
                      >
                        <PortfolioProductLogo product={product} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-bold leading-[18px] text-[var(--uc-text)]">
                            {product.name}
                          </p>
                          <p className="mt-[3px] text-[14px] leading-[18px] text-[var(--uc-text)]">
                            {product.percent}% · {productType} · {product.currency}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="whitespace-nowrap text-[20px] font-bold leading-[22px] text-[var(--uc-text)]">
                            {formatInvestmentNumber(value, country, 0, 0)}
                            <span className="text-[14px] font-normal">,00 CZK</span>
                          </p>
                          <p
                            className={cn(
                              'mt-[3px] text-[14px] font-bold leading-[17px]',
                              performance < 0 ? 'text-[var(--uc-status-red)]' : 'text-[var(--uc-green-olive)]',
                            )}
                          >
                            {performance > 0 ? '+' : ''}
                            {formatInvestmentNumber(performance, country, 0, 3)}%
                          </p>
                        </div>
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </RoboScreen>
  )
}
