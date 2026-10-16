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
  Notice,
  Page,
  Row,
  investmentColors,
} from '../investments/Primitives';
import { RoboHelp } from './Help';
import { ActionRail } from '../investments/ActionRail';
import { PeriodChips } from '../investments/PeriodChips';
import { SortChips } from '../investments/SortChips';
import { CzRoboSecurityRow } from '../../../current/investments/baseline/overview/CzRoboOverview';

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
  const progress = getRoboGoalProgress(goal);
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
      descriptionTop={8}
      onBack={onBack}
      onHelp={() => setHelp(true)}
      contentTop={16}
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
          ? '•••• total return'
          : formatCzkReturnLabel(goal.returnLabel)}
        {goal.returnTone !== 'neutral' ? (
          <Copy muted style={styles.meta}>
            {' '}
            total return
          </Copy>
        ) : null}
      </Copy>
      <View style={styles.chart}>
        <PerformanceChart
          points={
            historical ?? buildInvestmentChartPoints(currentValue, period)
          }
          hidden={amountsHidden}
          step={historical !== null}
          showPerformance={historical === null}
          zeroBaselineOnly={
            flags.isEmptyGoal &&
            !(historical ?? []).some(point => point.value > 0)
          }
        />
      </View>
      <PeriodChips
        items={INVESTMENT_PERIODS.filter(item => item.id !== '6m')}
        value={period}
        onChange={setPeriod}
        comfortable
      />
      <ActionRail
        items={[
          {
            id: 'add-money',
            icon: 'add-money',
            label: 'Add\nmoney',
            accessibilityLabel: 'Add money',
            onPress: () => onAction('add-money'),
          },
          {
            id: 'withdraw',
            icon: 'robo-withdraw',
            label: 'Withdraw\nMoney',
            accessibilityLabel: 'Withdraw',
            onPress: () => onAction('withdraw'),
          },
          {
            id: 'history',
            icon: 'investment-history',
            label: 'History',
            accessibilityLabel: 'History',
            onPress: () => onAction('history'),
          },
          {
            id: 'settings',
            icon: 'robo-goal-settings',
            label: 'Goal\nSettings',
            accessibilityLabel: 'Goal settings',
            onPress: () => onAction('settings'),
          },
        ]}
      />
      {flags.isEmptyGoal ? (
        <>
          <Copy strong>{emptyTitle}</Copy>
          <Notice text={emptyDescription} />
        </>
      ) : null}
      <Copy strong style={styles.heading}>
        Goal progress
      </Copy>
      <View style={styles.planLine}>
        <View>
          <Copy muted style={styles.meta}>
            Target amount
          </Copy>
          <Copy strong>
            {amountsHidden
              ? '•••• CZK'
              : formatCzkGoalAmount(goal.targetInteger, goal.targetDecimals)}
          </Copy>
        </View>
        <View style={styles.alignRight}>
          <Copy muted style={styles.meta}>
            Progress
          </Copy>
          <Copy strong>{amountsHidden ? '••%' : `${progress}%`}</Copy>
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
        <Copy muted style={styles.meta}>
          {goal.startDate}
        </Copy>
        <Copy muted style={styles.meta}>
          {goal.endDate}
        </Copy>
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
  heading: { fontSize: 20, lineHeight: 24, marginTop: 30 },
  planLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 14,
    gap: 16,
  },
  alignRight: { alignItems: 'flex-end' },
  dateLine: { flexDirection: 'row', justifyContent: 'space-between' },
  returns: { marginTop: 4, fontSize: 14, lineHeight: 15.5 },
  meta: { fontSize: 14, lineHeight: 15.5 },
  amountLine: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  amount: { fontSize: 24, lineHeight: 26 },
  decimals: { fontSize: 16, lineHeight: 26 },
  chart: { marginTop: 12 },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E5E5E5',
    borderWidth: 1,
    borderColor: '#D8D8D8',
    marginVertical: 12,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#007A91' },
});
