import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  buildInvestmentChartPoints,
  INVESTMENT_PERIODS,
  type InvestmentCatalogSecurity,
  type InvestmentPeriodId,
  type InvestmentSortId,
} from '@/app/config/investmentsPortfolioConfig';
import { getRoboDetailFlags } from '@/features/investments/robo/flowSelectors';
import { buildRoboGoalChartHistory } from '@/features/investments/robo/goalChartHistory';
import {
  getRoboGoalCurrentValue,
  getRoboWithdrawalProducts,
} from '@/features/investments/robo/goalModel';
import {
  getRoboGoalProgress,
  formatCzkGoalAmount,
  formatCzkReturnLabel,
  formatCzkInteger,
} from '@/features/investments/robo/model';
import type { RoboAdvisorManagementMode } from '@/features/investments/robo/legacyFlowState';
import type {
  RoboExistingGoal,
  RoboPortfolio,
} from '@/features/investments/robo/types';
import type { RoboDemoClock } from '@/features/investments/robo/demoClock';
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting';
import { PerformanceChart } from '../investments/Charts';
import {
  Copy,
  czInvestmentTokens,
  Page,
  Row,
  investmentColors,
} from '../investments/Primitives';
import { RoboHelp } from './Help';
import { InvestmentGlyph } from '../investments/Glyph';
import { SortChips } from '../investments/SortChips';
import { CzRoboSecurityRow } from '../../../current/investments/baseline/overview/CzRoboOverview';
import { BaselineAccountActionBar } from '../../../../../universal/BaselineAccountActionBar';
import { BaselineBanner } from '../../../../../universal/BaselineBanner';
import { BaselineInvestmentPeriodChips } from '../../../../../universal/BaselineInvestmentPeriodChips';

// Source goal detail C1 (14842:83238): six periods, preserving their feature IDs.
const goalPeriods = INVESTMENT_PERIODS.map(item => ({
  ...item,
  label: item.id === 'max' ? 'MAX' : item.id === '6m' ? '6M' : item.label,
}));

export function GoalDetail({
  goal,
  portfolio,
  onBack,
  onAction,
  securityCatalog,
  clock,
  amountsHidden,
  onOpenSecurity,
}: {
  goal: RoboExistingGoal;
  portfolio: RoboPortfolio;
  onBack: () => void;
  onExit: () => void;
  onAction: (mode: RoboAdvisorManagementMode) => void;
  securityCatalog: readonly InvestmentCatalogSecurity[];
  clock: RoboDemoClock;
  amountsHidden: boolean;
  onOpenSecurity?: (security: InvestmentCatalogSecurity) => void;
}) {
  const [period, setPeriod] = useState<InvestmentPeriodId>('3y');
  const [help, setHelp] = useState(false);
  const [sort, setSort] = useState<InvestmentSortId>('max-value');
  const currentValue = getRoboGoalCurrentValue(goal),
    flags = getRoboDetailFlags(currentValue, goal);
  const historical = buildRoboGoalChartHistory(
    goal,
    period,
    new Date(
      Date.UTC(
        clock.referenceDay.year,
        clock.referenceDay.month - 1,
        clock.referenceDay.day,
      ),
    ),
  );
  const products = getRoboWithdrawalProducts(
    portfolio,
    currentValue,
    'CZ',
    securityCatalog,
    goal.positions,
  );
  const chartPoints =
    historical ?? buildInvestmentChartPoints(currentValue, period);
  const zeroBaseline =
    flags.isEmptyGoal && chartPoints.every(point => point.value === 0);
  const displayedPoints = zeroBaseline
    ? chartPoints.map(point => ({ ...point, showDot: false }))
    : chartPoints;
  const progress = getRoboGoalProgress(goal);
  const targetInteger = formatCzkInteger(goal.targetInteger);
  const targetDecimals = formatCzkGoalAmount(
    goal.targetInteger,
    goal.targetDecimals,
  ).slice(targetInteger.length);
  const emptyTitle = flags.hasPendingBuyOrders
    ? 'Your investment is being processed'
    : flags.hasRecurringPlan
    ? 'Your recurring top-up is scheduled'
    : flags.hasSellHistory
    ? 'Your goal is currently empty'
    : 'Your goal is ready to invest';
  const emptyDescription = flags.hasPendingBuyOrders
    ? 'Your goal will show positions and value after your investment is executed. Follow its status in History.'
    : flags.hasRecurringPlan
    ? `Your monthly contribution is set to start on ${goal.recurringContribution?.startDate}. Positions appear after the first basket order is executed.`
    : flags.hasSellHistory
    ? 'Your previous sales remain in History. Add money whenever you’re ready to invest again.'
    : 'Your model portfolio is ready. Select Add money to make your first investment towards this goal.';
  if (help) return <RoboHelp kind="detail" onBack={() => setHelp(false)} />;
  return (
    <Page
      kind="goal-detail"
      title={goal.name}
      description={goal.purpose}
      gutter={16}
      descriptionTop={4}
      descriptionStyle={styles.meta}
      onBack={onBack}
      onHelp={() => setHelp(true)}
      contentTop={30}
    >
      <Copy muted style={styles.meta}>
        Current value
      </Copy>
      <View style={styles.amountLine}>
        <Copy strong style={styles.amount}>
          {amountsHidden ? '••••' : formatCzkInteger(goal.currentInteger)}
        </Copy>
        <Copy style={styles.decimals}>
          {amountsHidden ? ',•• CZK' : goal.currentDecimals}
        </Copy>
      </View>
      <Copy
        strong
        style={[
          styles.returns,
          {
            color:
              goal.returnTone === 'positive'
                ? investmentColors.positive
                : goal.returnTone === 'negative'
                ? investmentColors.negative
                : '#262626',
          },
        ]}
      >
        {amountsHidden
          ? '••••'
          : formatCzkReturnLabel(goal.returnLabel).replace(
              /\s*total return$/,
              '',
            )}
        <Copy muted style={styles.meta}>
          {' '}
          total return
        </Copy>
      </Copy>
      <View style={styles.chart}>
        <PerformanceChart
          points={displayedPoints}
          hidden={amountsHidden}
          step={historical !== null}
          showPerformance={historical === null}
          zeroBaselineOnly={zeroBaseline}
        />
      </View>
      <BaselineInvestmentPeriodChips
        periods={goalPeriods}
        selectedPeriodId={period}
        onChange={setPeriod}
        comfortableTouchTargets
        wrapInk
        style={styles.periods}
        inkStyle={styles.periodInk}
        labelStyle={styles.periodLabel}
      />
      <BaselineAccountActionBar
        style={styles.actions}
        presentation={{ paddingVertical: 0 }}
        items={[
          {
            id: 'add-money',
            icon: <InvestmentGlyph name="add-money" size={20} />,
            label: 'Add\nmoney',
            ariaLabel: 'Add money',
            onPress: () => onAction('add-money'),
          },
          {
            id: 'withdraw',
            icon: <InvestmentGlyph name="robo-withdraw" size={20} />,
            label: 'Withdraw\nMoney',
            ariaLabel: 'Withdraw',
            onPress: () => onAction('withdraw'),
          },
          {
            id: 'history',
            icon: <InvestmentGlyph name="investment-history" size={32} />,
            label: 'History',
            ariaLabel: 'History',
            onPress: () => onAction('history'),
          },
          {
            id: 'settings',
            icon: <InvestmentGlyph name="robo-goal-settings" size={32} />,
            label: 'Goal\nSettings',
            ariaLabel: 'Goal settings',
            onPress: () => onAction('settings'),
          },
        ]}
      />
      {flags.isEmptyGoal ? (
        <View style={styles.emptyState}>
          <BaselineBanner
            variant="info"
            title={emptyTitle}
            description={emptyDescription}
            presentation={{ width: '100%', bodyLineHeight: 22 }}
          />
        </View>
      ) : null}
      <Copy strong style={styles.heading}>
        Goal progress
      </Copy>
      <View style={styles.planLine}>
        <View>
          <Copy muted style={styles.meta}>
            Target
          </Copy>
          <Copy strong style={styles.targetAmount}>
            {amountsHidden ? '••••' : targetInteger}
            <Copy style={styles.targetDecimals}>
              {amountsHidden ? ',•• CZK' : targetDecimals}
            </Copy>
          </Copy>
        </View>
        <View style={styles.alignRight}>
          <Copy muted style={styles.meta}>
            Progress
          </Copy>
          <Copy strong style={styles.targetAmount}>
            {amountsHidden ? '••%' : `${progress}%`}
          </Copy>
        </View>
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.min(100, Math.max(0, progress))}%` },
          ]}
        />
      </View>
      <View style={styles.dateLine}>
        <Copy style={styles.meta}>{goal.startDate}</Copy>
        <Copy style={styles.meta}>{goal.endDate}</Copy>
      </View>
      {!flags.isEmptyGoal ? (
        <>
          <Copy strong style={styles.heading}>
            Portfolio allocation
          </Copy>
          <SortChips value={sort} onChange={setSort} />
          {[...products]
            .sort((left, right) =>
              sort === 'min-value'
                ? left.localValue - right.localValue
                : sort === 'max-percent'
                ? right.percent - left.percent
                : sort === 'min-percent'
                ? left.percent - right.percent
                : right.localValue - left.localValue,
            )
            .map(product =>
              product.security && onOpenSecurity ? (
                <CzRoboSecurityRow
                  key={product.id}
                  host={{
                    country: 'CZ',
                    tokens: czInvestmentTokens,
                    amountsHidden,
                  }}
                  security={product.security}
                  onPress={() => onOpenSecurity(product.security!)}
                />
              ) : (
                <Row
                  key={product.id}
                  title={product.name}
                  subtitle={`${product.percent}%`}
                  value={
                    flags.isEmptyGoal
                      ? undefined
                      : formatInvestmentMoney(
                          product.localValue,
                          'CZ',
                          'CZK',
                          amountsHidden,
                        )
                  }
                  onPress={
                    product.security && onOpenSecurity
                      ? () => onOpenSecurity(product.security!)
                      : undefined
                  }
                />
              ),
            )}
        </>
      ) : null}
    </Page>
  );
}
const styles = StyleSheet.create({
  heading: { fontSize: 20, lineHeight: 24, marginTop: 40 },
  planLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 16,
    gap: 16,
  },
  alignRight: { alignItems: 'flex-end' },
  dateLine: { flexDirection: 'row', justifyContent: 'space-between' },
  returns: { marginTop: 2, fontSize: 14, lineHeight: 20 },
  meta: { fontSize: 14, lineHeight: 15.5 },
  amountLine: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
  amount: { fontSize: 24, lineHeight: 26 },
  decimals: { fontSize: 16, lineHeight: 18 },
  chart: {
    marginTop: 16,
    paddingHorizontal: 8,
    width: '100%',
    maxWidth: 343,
    alignSelf: 'center',
  },
  periods: { marginTop: 16, gap: 16, paddingHorizontal: 0 },
  periodInk: { width: 40, minWidth: 40, height: 24, paddingHorizontal: 0 },
  periodLabel: { letterSpacing: 0.2 },
  actions: { marginTop: 16, marginHorizontal: -16, minHeight: 68 },
  emptyState: { marginTop: 24 },
  targetAmount: { fontSize: 16, lineHeight: 18 },
  targetDecimals: { fontSize: 14, lineHeight: 16 },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E5E5E5',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#007A91' },
});
