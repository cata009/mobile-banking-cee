import React, { useEffect, useMemo, useReducer, useRef } from 'react';
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { Text } from '../../../../../universal/Typography';
import {
  Header,
  ModalPanel,
  NavigationRow,
  Tabs,
} from '../../../../../universal/controls';
import {
  createSpendingRangeSummary,
  listSpendingMonthKeys,
  type SpendingAnalyticsTransaction,
} from '@/data/spendingAnalytics';
import {
  PFM_CATEGORIES,
  type PfmCategoryName,
  type PfmCategorySelection,
} from '@/data/pfmCategories';
import {
  createEvoAnalyticsState,
  evoAnalyticsReducer,
  type AnalyticsDirection,
} from '@/features/analytics/evo/state';
import {
  selectEvoAnalyticsView,
  type AnalyticsScope,
  type ExpenseBreakdownRow,
} from '@/features/analytics/evo/selectors';
import {
  buildCustomSelection,
  buildPeriodRail,
  buildPresetSelection,
  buildYearSelection,
  stepSelection,
  type SpendingPeriodSelection,
} from '@/app/screens/analytics/evoSpendingPeriods';
import { getEvoAnalyticsCategoryDisplayLabel } from '@/app/screens/analytics/analyticsCategoryLabels';
import { createEvoTranslations } from '@/translations/evo';
import type { Currency } from '@/data/products';
import type { CzechNativeScreenProps } from '../contracts';
import { czechProducts } from '../accounts/source';
import { Glyph, IconAction, Money, textStyles as t } from '../home/Primitives';
import { evoTokens as tokens } from '../home/tokens';
import { Bars, Donut } from './Charts';
import { CategoryMark } from './CategoryMark';
import { CurrencyMark } from '../home/CurrencyMark';
import MovementAvatar from '../accounts/MovementAvatar';
import { PeriodSheet, getPresetLabels } from './PeriodSheet';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { BaselineCarouselIndicator } from '../../../../../universal/BaselineCarouselIndicator';
import { SpendingPeriodCarousel } from './SpendingPeriodCarousel';
import { formatEvo2027Number } from '@/app/utils/evo2027Formatting';
import { maskFormattedAmount } from '@/app/utils/amountPrivacy';

const EMPTY_CATEGORY_OVERRIDES: Readonly<Record<string, PfmCategorySelection>> =
  Object.freeze({});

function periodFromRoute(
  periodKey: string | undefined,
  months: readonly string[],
  presetLabels: ReturnType<typeof getPresetLabels>,
) {
  const latestMonth = months[months.length - 1] ?? '';
  const fallback = buildPresetSelection(
    'this-month',
    latestMonth,
    months,
    'en-US',
    presetLabels,
  );
  if (!periodKey) return fallback;

  const monthKey = periodKey.match(/^(?:month:)?(\d{4}-\d{2})$/)?.[1];
  if (monthKey && months.includes(monthKey)) {
    return buildPresetSelection(
      'this-month',
      monthKey,
      months,
      'en-US',
      presetLabels,
    );
  }

  const year = periodKey.match(/^year[:-](\d{4})$/)?.[1];
  if (year) {
    return buildYearSelection(year, months, presetLabels.lastYear, 'en-US');
  }

  const range = periodKey.match(/^range:(\d{4}-\d{2})\.\.(\d{4}-\d{2})$/);
  if (range?.[1] && range[2]) {
    return {
      ...buildCustomSelection(range[1], range[2], months, 'en-US'),
      id: periodKey,
    };
  }

  const yearToDate = periodKey.match(/^range:ytd-(\d{4})$/)?.[1];
  if (yearToDate) {
    const yearMonths = months.filter(month =>
      month.startsWith(`${yearToDate}-`),
    );
    const endMonth = yearMonths[yearMonths.length - 1] ?? latestMonth;
    return {
      ...buildPresetSelection(
        'year-to-date',
        endMonth,
        months,
        'en-US',
        presetLabels,
      ),
      id: periodKey,
    };
  }

  return fallback;
}

function categoryFromRoute(value: string | undefined): PfmCategoryName | null {
  return PFM_CATEGORIES.find(category => category.name === value)?.name ?? null;
}

function AddTransaction({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      testID="cz-pfm-add-transaction"
      accessibilityRole="button"
      accessibilityLabel="Add transaction"
      onPress={onPress}
      style={s.link}
    >
      <Text style={[t.body, t.strong, { color: tokens.accent }]}>
        Add transaction
      </Text>
    </Pressable>
  );
}

export default function PfmScreen(host: CzechNativeScreenProps) {
  const copy = createEvoTranslations(host.language ?? 'en');
  const presetLabels = getPresetLabels(host.language ?? 'en');
  const {
    amountsHidden: hidden,
    onNavigate,
    onBack,
    onProfile,
    screenTopInset = 0,
  } = host;
  const products = useMemo(
    () => czechProducts(host.productCounts, host.bankingPresentation),
    [host.productCounts, host.bankingPresentation],
  );
  const categoryOverrides =
    host.bankingPresentation?.transactionCategoryOverrides ??
    EMPTY_CATEGORY_OVERRIDES;
  const scopes = useMemo<AnalyticsScope[]>(() => {
    const accounts = products.filter(p => p.type === 'current_account');
    return [
      {
        id: 'all-accounts',
        label: 'All accounts',
        products: accounts.length ? accounts : products,
      },
      ...accounts.map(p => ({ id: p.id, label: p.name, products: [p] })),
    ];
  }, [products]);
  const months = useMemo(
    () => listSpendingMonthKeys('CZ', products, categoryOverrides),
    [categoryOverrides, products],
  );
  const direction =
    host.route.params?.direction === 'income' ||
    host.route.params?.direction === 'expense'
      ? host.route.params.direction
      : host.route.params?.direction === 'in'
        ? 'income'
        : host.route.params?.direction === 'out'
          ? 'expense'
          : undefined;
  const initialCategory = categoryFromRoute(host.route.params?.category);
  const externalDetail = host.route.params?.externalDetail === 'true';
  const [state, dispatch] = useReducer(evoAnalyticsReducer, undefined, () => {
    const initial = createEvoAnalyticsState(
      host.route.params?.scopeId,
      direction,
      periodFromRoute(host.route.params?.periodKey, months, presetLabels),
    );
    if (initialCategory) {
      initial.view = 'breakdown';
      initial.analysisDirection = direction ?? 'expense';
      initial.openBreakdownRow = {
        key: initialCategory,
        label: getEvoAnalyticsCategoryDisplayLabel(initialCategory),
        total: 0,
        transactionCount: 0,
        category: initialCategory,
      };
    }
    return initial;
  });
  const scope = scopes.find(s => s.id === state.selectedScopeId) ?? scopes[0];
  useEffect(() => {
    if (!scopes.some(s => s.id === state.selectedScopeId))
      dispatch({
        type: 'set-field',
        field: 'selectedScopeId',
        value: 'all-accounts',
      });
  }, [scopes, state.selectedScopeId]);
  const summary = useMemo(
    () =>
      createSpendingRangeSummary(
        'CZ',
        scope.products,
        state.period.monthKeys,
        {
          key: state.period.id,
          label: state.period.title,
          year: state.period.monthKeys[0]?.split('-')[0] ?? '',
          kind: state.period.kind === 'month' ? 'month' : 'year',
        },
        categoryOverrides,
        { includeOwnTransfers: state.includeOwnTransfers },
      ),
    [
      categoryOverrides,
      scope.products,
      state.period,
      state.includeOwnTransfers,
    ],
  );
  const view = selectEvoAnalyticsView(state, summary, products, scope);
  const currency = summary.currency as Currency;
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [state.view, state.analysisDirection, state.openBreakdownRow?.key]);
  const back = () => {
    if (state.view === 'breakdown' && externalDetail) onBack();
    else if (state.view === 'breakdown') dispatch({ type: 'close-breakdown' });
    else if (state.view === 'analysis') dispatch({ type: 'back-overview' });
    else onBack();
  };
  useEffect(() => {
    if (host.isActive === false) return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      if (state.periodSheetOpen)
        dispatch({ type: 'set-field', field: 'periodSheetOpen', value: false });
      else if (state.scopeSheetOpen)
        dispatch({ type: 'set-field', field: 'scopeSheetOpen', value: false });
      else if (state.view !== 'overview') {
        if (state.view === 'breakdown' && externalDetail) onBack();
        else if (state.view === 'breakdown')
          dispatch({ type: 'close-breakdown' });
        else dispatch({ type: 'back-overview' });
      } else return false;
      return true;
    });
    return () => listener.remove();
  }, [
    externalDetail,
    host.isActive,
    onBack,
    state.view,
    state.periodSheetOpen,
    state.scopeSheetOpen,
  ]);
  const selectPeriod = (period: SpendingPeriodSelection) => {
    dispatch({ type: 'select-period', period });
    host.onAnalyticsPeriodChange?.(period.id);
  };
  const step = (delta: -1 | 1) => {
    const period = stepSelection(
      state.period,
      delta,
      months,
      'en-US',
      presetLabels.lastYear,
    );
    if (period) selectPeriod(period);
  };
  const addTransaction = () => {
    if (host.onAddTransaction) host.onAddTransaction();
    else onNavigate({ screen: 'pfm', params: { intent: 'add-transaction' } });
  };
  const openTransaction = (transaction: SpendingAnalyticsTransaction) => {
    const product = products.find(
      item => item.id === transaction.sourceProductId,
    );
    if (host.onTransactionSelected && product) {
      const source =
        product.type === 'credit_card' || product.type === 'debit_card'
          ? 'card'
          : 'account';
      host.onTransactionSelected({
        transaction,
        productId: product.id,
        source,
      });
      return;
    }
    onNavigate({
      screen: 'transaction',
      params: {
        productId: transaction.sourceProductId,
        accountId: transaction.sourceProductId,
        transactionId: transaction.id,
        analyticsTransaction: JSON.stringify(transaction),
      },
    });
  };
  const openBreakdown = (
    row?: ExpenseBreakdownRow,
    fromDirection: AnalyticsDirection = state.analysisDirection,
  ) =>
    dispatch({
      type: 'open-breakdown',
      from: state.view === 'overview' ? 'overview' : 'analysis',
      direction: fromDirection,
      row,
    });
  const categoryRow = (
    row: ExpenseBreakdownRow,
    fromDirection: AnalyticsDirection,
  ) => (
    <NavigationRow
      key={row.key}
      tokens={tokens}
      title={row.label}
      subtitle={`${row.transactionCount} ${
        row.transactionCount === 1 ? 'transaction' : 'transactions'
      }`}
      payload={row}
      onSelect={value => openBreakdown(value, fromDirection)}
      icon={
        row.currency ? (
          <CurrencyMark currency={row.currency} size={32} />
        ) : row.category ? (
          <CategoryMark category={row.category} />
        ) : (
          <Glyph name="transfer" />
        )
      }
      trailing={
        <Money
          amount={row.total}
          currency={currency}
          hidden={hidden}
          role="support"
        />
      }
    />
  );
  const directionTitle =
    state.analysisDirection === 'income' ? 'Money in' : 'Money out';
  const title =
    state.view === 'overview'
      ? 'Spending'
      : state.view === 'analysis'
        ? directionTitle
        : (state.openBreakdownRow?.label ?? directionTitle);
  const periodRail = buildPeriodRail(
    state.period,
    months,
    'en-US',
    presetLabels.lastYear,
  );
  const transactions =
    view.breakdownDetail?.transactions ?? view.visibleExpenses;
  return (
    <View style={[s.root, { paddingTop: screenTopInset }]}>
      <Header
        tokens={tokens}
        variant="current"
        title={title}
        onBack={back}
        backIcon={<Glyph name="back" size={16} />}
        trailing={
          <View style={s.actions}>
            <IconAction
              label={hidden ? 'Show amounts' : 'Hide amounts'}
              name={hidden ? 'show' : 'hide'}
              onPress={host.onAmountsToggle}
            />
            <IconAction label="Profile" name="profile" onPress={onProfile} />
          </View>
        }
      />
      <ScrollView
        ref={scroll}
        contentContainerStyle={[
          s.content,
          state.view === 'analysis' && s.analysisContent,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.scopeRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choose accounts"
            onPress={() =>
              dispatch({
                type: 'set-field',
                field: 'scopeSheetOpen',
                value: true,
              })
            }
            style={s.analysisScope}
          >
            <Text style={[t.body, t.strong, sourceStyles.fontSize16]}>
              {scope.label}
            </Text>
            <SourceCustomIcon
              name="chevron-down-wide"
              size={18}
              color={tokens.text}
            />
          </Pressable>
          {state.view === 'analysis' && (
            <View
              style={s.chartMode}
              accessibilityRole="tablist"
              accessibilityLabel="Chart type"
            >
              {(['donut', 'bars'] as const).map(mode => (
                <Pressable
                  key={mode}
                  accessibilityRole="tab"
                  accessibilityLabel={mode === 'donut' ? 'Donut' : 'Bars'}
                  accessibilityState={{
                    selected: state.expenseChartMode === mode,
                  }}
                  onPress={() =>
                    dispatch({
                      type: 'set-field',
                      field: 'expenseChartMode',
                      value: mode,
                    })
                  }
                  style={[
                    s.chartModeButton,
                    state.expenseChartMode === mode && s.chartModeSelected,
                  ]}
                >
                  <SourceCustomIcon
                    name={
                      mode === 'donut'
                        ? 'analytics-donut-toggle'
                        : 'analytics-bars-toggle'
                    }
                    size={16}
                    color={
                      state.expenseChartMode === mode
                        ? tokens.inverse
                        : tokens.muted
                    }
                  />
                </Pressable>
              ))}
            </View>
          )}
        </View>
        {state.view !== 'overview' && (
          <View style={s.period}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.spending.previousPeriod}
              disabled={periodRail.activeIndex <= 0}
              onPress={() => step(-1)}
              style={s.arrow}
            >
              <Glyph name="back" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.spending.changePeriod}
              onPress={() =>
                dispatch({
                  type: 'set-field',
                  field: 'periodSheetOpen',
                  value: true,
                })
              }
              style={s.periodLabel}
            >
              <Text style={t.title}>
                {view.activeBucketTitle ?? state.period.title}
              </Text>
              <Text style={[t.body, t.muted]}>{state.period.subtitle}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.spending.nextPeriod}
              disabled={periodRail.activeIndex >= periodRail.items.length - 1}
              onPress={() => step(1)}
              style={s.arrow}
            >
              <Glyph name="forward" size={18} />
            </Pressable>
          </View>
        )}
        {state.view === 'overview' ? (
          <>
            <SpendingPeriodCarousel
              count={periodRail.items.length}
              activeIndex={periodRail.activeIndex}
              onSelect={index => {
                const period = periodRail.items[index];
                if (period && index !== periodRail.activeIndex)
                  selectPeriod(period);
              }}
              renderItem={index => {
                const item = periodRail.items[index];
                if (!item) return null;
                const cardSummary =
                  index === periodRail.activeIndex
                    ? summary
                    : createSpendingRangeSummary(
                        'CZ',
                        scope.products,
                        item.monthKeys,
                        {
                          key: item.id,
                          label: item.title,
                          year: item.monthKeys[0]?.split('-')[0] ?? '',
                          kind: item.kind === 'month' ? 'month' : 'year',
                        },
                        categoryOverrides,
                        { includeOwnTransfers: state.includeOwnTransfers },
                      );
                return (
                  <View
                    testID={
                      index === periodRail.activeIndex
                        ? 'cz-pfm-summary-card'
                        : undefined
                    }
                    style={s.overview}
                  >
                    <View style={s.summaryPeriod}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={copy.spending.previousPeriod}
                        disabled={periodRail.activeIndex <= 0}
                        onPress={() => step(-1)}
                        style={s.summaryArrow}
                      >
                        <Glyph name="back" size={16} />
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={copy.spending.changePeriod}
                        onPress={() =>
                          dispatch({
                            type: 'set-field',
                            field: 'periodSheetOpen',
                            value: true,
                          })
                        }
                        style={s.summaryPeriodLabel}
                      >
                        <Text style={s.summaryPeriodText}>
                          {item.title} {item.subtitle}
                        </Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={copy.spending.nextPeriod}
                        disabled={
                          periodRail.activeIndex >= periodRail.items.length - 1
                        }
                        onPress={() => step(1)}
                        style={s.summaryArrow}
                      >
                        <Glyph name="forward" size={16} />
                      </Pressable>
                    </View>
                    <View style={s.net}>
                      <Text style={[t.body, t.strong, { color: tokens.muted }]}>
                        {copy.spending.netCashflow}
                      </Text>
                      <Money
                        amount={cardSummary.netTotal}
                        testID={index === periodRail.activeIndex ? 'cz-pfm-net' : undefined}
                        signed
                        currency={currency}
                        hidden={hidden}
                        role="product"
                      />
                      <Text style={[t.body, t.muted]}>
                        {cardSummary.incomeTotal > 0 &&
                        cardSummary.netTotal !== 0
                          ? `${maskFormattedAmount(formatEvo2027Number(Math.abs(cardSummary.netTotal)), hidden)} ${currency} ${cardSummary.netTotal > 0 ? copy.spending.netPositive : copy.spending.netNegative}`
                          : copy.spending.noIncome}
                      </Text>
                    </View>
                    <View
                      accessibilityElementsHidden
                      importantForAccessibility="no-hide-descendants"
                      style={s.flowBars}
                    >
                      {[cardSummary.incomeTotal, cardSummary.spendingTotal].map(
                        (value, index) => (
                          <View
                            key={index}
                            testID="cz-pfm-flow-bar"
                            style={s.flowTrack}
                          >
                            <View
                              style={[
                                s.flowFill,
                                {
                                  width: `${Math.max((value / Math.max(cardSummary.incomeTotal, cardSummary.spendingTotal, 1)) * 100, value > 0 ? 2 : 0)}%`,
                                  backgroundColor:
                                    index === 0 ? '#00866e' : tokens.text,
                                },
                              ]}
                            />
                          </View>
                        ),
                      )}
                    </View>
                    <View style={s.flowAmounts}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Analyse money in"
                        onPress={() =>
                          dispatch({
                            type: 'open-analysis',
                            direction: 'income',
                          })
                        }
                        style={s.cashflow}
                      >
                        <Text
                          style={[t.body, t.strong, { color: tokens.muted }]}
                        >
                          <Text style={{ color: '#00866e' }}>●</Text> Money in
                        </Text>
                        <Money
                          testID={index === periodRail.activeIndex ? 'cz-pfm-income' : undefined}
                          amount={cardSummary.incomeTotal}
                          currency={currency}
                          hidden={hidden}
                          role="product"
                        />
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Analyse money out"
                        onPress={() =>
                          dispatch({
                            type: 'open-analysis',
                            direction: 'expense',
                          })
                        }
                        style={s.cashflow}
                      >
                        <Text
                          style={[t.body, t.strong, { color: tokens.muted }]}
                        >
                          <Text style={{ color: tokens.text }}>●</Text> Money
                          out
                        </Text>
                        <Money
                          testID={index === periodRail.activeIndex ? 'cz-pfm-expense' : undefined}
                          amount={cardSummary.spendingTotal}
                          currency={currency}
                          hidden={hidden}
                          role="product"
                        />
                      </Pressable>
                    </View>
                  </View>
                );
              }}
            />
            <View>
              <Text style={t.section}>Top spending categories</Text>
              <View style={s.rows}>
                {view.overviewTopCategories.map(row =>
                  categoryRow(row, 'expense'),
                )}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={copy.spending.allSpendingCategories}
                  onPress={() =>
                    dispatch({ type: 'open-analysis', direction: 'expense' })
                  }
                  style={s.link}
                >
                  <Text style={[t.body, t.strong, { color: tokens.accent }]}>
                    {copy.spending.allSpendingCategories}
                  </Text>
                </Pressable>
              </View>
            </View>
            <View>
              <Text style={t.section}>Top income categories</Text>
              <View style={s.rows}>
                {view.overviewTopIncomeCategories.map(row =>
                  categoryRow(row, 'income'),
                )}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={copy.spending.allIncomeCategories}
                  onPress={() =>
                    dispatch({ type: 'open-analysis', direction: 'income' })
                  }
                  style={s.link}
                >
                  <Text style={[t.body, t.strong, { color: tokens.accent }]}>
                    {copy.spending.allIncomeCategories}
                  </Text>
                </Pressable>
              </View>
            </View>
          </>
        ) : state.view === 'analysis' ? (
          <>
            <View style={s.analysis}>
              {(state.expenseChartMode === 'bars' ||
                (hidden && !view.directionTransactions.length)) && (
                <>
                  <Text style={[t.body, t.muted]}>
                    {view.expenseHeaderLabel}
                  </Text>
                  <Money
                    amount={view.expenseHeaderAmount}
                    currency={currency}
                    hidden={hidden}
                    role="product"
                  />
                </>
              )}
              {view.directionTransactions.length ? (
                state.expenseChartMode === 'donut' ? (
                  <Donut
                    segments={view.donutSegments}
                    selected={view.activeSplitSelection}
                    onToggle={key => dispatch({ type: 'toggle-segment', key })}
                    amount={view.expenseHeaderAmount}
                    label={view.expenseHeaderLabel}
                    currency={currency}
                    hidden={hidden}
                    markers={Object.fromEntries(
                      view.donutRows
                        .filter(row => row.currency || row.sample)
                        .map(row => [
                          row.key,
                          row.currency ? (
                            <CurrencyMark currency={row.currency} size={32} />
                          ) : row.sample ? (
                            <MovementAvatar
                              transaction={row.sample}
                              size={32}
                            />
                          ) : null,
                        ]),
                    )}
                  />
                ) : (
                  <Bars
                    bars={view.expenseBars}
                    selected={view.activeBucketKey}
                    onToggle={key => dispatch({ type: 'toggle-bucket', key })}
                    currency={currency}
                    hidden={hidden}
                  />
                )
              ) : (
                <Text style={[t.body, t.muted]}>
                  No {state.analysisDirection} data for this period.
                </Text>
              )}
              {periodRail.items.length > 1 && (
                <BaselineCarouselIndicator
                  count={periodRail.items.length}
                  activeIndex={periodRail.activeIndex}
                  windowSize={6}
                  itemLabel="period"
                  itemLabels={periodRail.items.map(item =>
                    `${item.title} ${item.subtitle}`.trim(),
                  )}
                  withBackdropBlur={false}
                  onSelect={index => {
                    const period = periodRail.items[index];
                    if (period) selectPeriod(period);
                  }}
                />
              )}
              {view.expenseFilterLabel && (
                <View style={s.filter}>
                  <Text style={t.body}>{view.expenseFilterLabel}</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Clear selection"
                    onPress={() => dispatch({ type: 'clear-selection' })}
                  >
                    <Text style={[t.body, t.strong, { color: tokens.accent }]}>
                      Clear
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
            <Tabs
              tokens={tokens}
              label="Split by"
              value={view.activeSplitMode}
              items={view.availableSplitModes.map(value => ({
                value,
                label:
                  value === 'categories'
                    ? 'Categories'
                    : value === 'merchants'
                      ? 'Merchants'
                      : 'Currencies',
              }))}
              onChange={mode => dispatch({ type: 'change-split-mode', mode })}
            />
            <View style={s.rows}>
              {view.breakdownRows.map(row =>
                categoryRow(row, state.analysisDirection),
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="See all transactions"
                onPress={() => openBreakdown()}
                style={s.link}
              >
                <Text style={[t.body, t.strong, { color: tokens.accent }]}>
                  See all transactions
                </Text>
              </Pressable>
              <AddTransaction onPress={addTransaction} />
            </View>
          </>
        ) : (
          <>
            <Money
              amount={transactions.reduce(
                (sum, transaction) => sum + Math.abs(transaction.amount),
                0,
              )}
              currency={currency}
              hidden={hidden}
              role="hero"
            />
            {view.breakdownDetail?.subcategories.length ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.subcategories}
              >
                {view.breakdownDetail.subcategories.map(sub => (
                  <Pressable
                    key={sub.label}
                    accessibilityRole="checkbox"
                    accessibilityLabel={`Include ${sub.label}`}
                    accessibilityState={{
                      checked: !state.excludedSubcategories.has(sub.label),
                    }}
                    onPress={() =>
                      dispatch({ type: 'toggle-subcategory', label: sub.label })
                    }
                    style={[
                      s.subcategory,
                      state.excludedSubcategories.has(sub.label) &&
                        sourceStyles.opacity045,
                    ]}
                  >
                    <CategoryMark
                      category={
                        state.openBreakdownRow?.category ?? 'Uncategorized'
                      }
                    />
                    <Text style={t.body}>{sub.label}</Text>
                    <Money
                      amount={sub.total}
                      currency={currency}
                      hidden={hidden}
                      role="support"
                    />
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}
            <View style={s.rows}>
              <AddTransaction onPress={addTransaction} />
              {transactions.map(transaction => (
                <Pressable
                  key={`${transaction.sourceProductId}:${transaction.id}`}
                  testID="cz-pfm-transaction"
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${transaction.label} transaction`}
                  onPress={() => openTransaction(transaction)}
                  style={s.transaction}
                >
                  <CategoryMark category={transaction.pfmCategory} />
                  <View style={sourceStyles.flex1gap4}>
                    <Text style={[t.body, t.strong, sourceStyles.fontSize16]}>
                      {transaction.label}
                    </Text>
                    <Text style={[t.body, t.muted]}>
                      {transaction.day} {transaction.month} ·{' '}
                      {transaction.sourceProductName}
                    </Text>
                  </View>
                  <Money
                    amount={transaction.amount}
                    currency={currency}
                    hidden={hidden}
                    role="support"
                    signed
                  />
                </Pressable>
              ))}
              {!transactions.length && (
                <Text style={[t.body, t.muted, sourceStyles.padding16]}>
                  No transactions for this selection.
                </Text>
              )}
            </View>
          </>
        )}
        <View style={s.transfers}>
          <View style={sourceStyles.flex1gap4}>
            <Text style={t.body}>{copy.spending.excludeTransfers}</Text>
            <Text style={[t.body, t.muted]}>
              {state.includeOwnTransfers
                ? 'Transfers between your own accounts are counted.'
                : copy.spending.transfersExcludedNote}
            </Text>
          </View>
          <Switch
            accessibilityLabel={copy.spending.excludeTransfers}
            value={!state.includeOwnTransfers}
            onValueChange={() => dispatch({ type: 'toggle-own-transfers' })}
            trackColor={{ true: tokens.accent }}
          />
        </View>
      </ScrollView>
      {state.periodSheetOpen && (
        <PeriodSheet
          language={host.language}
          months={months}
          current={state.period}
          onPick={selectPeriod}
          onClose={() =>
            dispatch({
              type: 'set-field',
              field: 'periodSheetOpen',
              value: false,
            })
          }
        />
      )}
      <ModalPanel
        tokens={tokens}
        title="Choose accounts"
        visible={state.scopeSheetOpen}
        onClose={() =>
          dispatch({ type: 'set-field', field: 'scopeSheetOpen', value: false })
        }
      >
        {state.scopeSheetOpen && (
          <ScrollView>
            {scopes.map(item => (
              <Pressable
                key={item.id}
                accessibilityRole="radio"
                accessibilityLabel={item.label}
                accessibilityState={{
                  checked: item.id === state.selectedScopeId,
                }}
                onPress={() => {
                  dispatch({
                    type: 'set-field',
                    field: 'selectedScopeId',
                    value: item.id,
                  });
                  dispatch({
                    type: 'set-field',
                    field: 'scopeSheetOpen',
                    value: false,
                  });
                }}
                style={s.scope}
              >
                <Text style={t.body}>{item.label}</Text>
                {item.products.length === 1 && (
                  <CurrencyMark
                    currency={item.products[0].currency}
                    size={32}
                  />
                )}
              </Pressable>
            ))}
          </ScrollView>
        )}
      </ModalPanel>
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.background },
  actions: { flexDirection: 'row', gap: 8 },
  content: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    padding: 16,
    paddingBottom: 24,
    gap: 24,
  },
  analysisContent: { gap: 8 },
  scope: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    padding: 12,
    gap: 12,
  },
  scopeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  analysisScope: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 32,
    flexShrink: 1,
  },
  chartMode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 18,
    backgroundColor: '#e5e5e5',
  },
  chartModeButton: {
    width: 40,
    height: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartModeSelected: { backgroundColor: tokens.accent },
  period: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  periodLabel: { flex: 1, alignItems: 'center', gap: 4 },
  arrow: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overview: {
    backgroundColor: tokens.surface,
    borderRadius: 8,
    padding: 16,
    gap: 16,
  },
  summaryPeriod: { flexDirection: 'row', alignItems: 'center' },
  summaryPeriodLabel: { flex: 1, minHeight: 44, justifyContent: 'center' },
  summaryPeriodText: {
    color: tokens.accent,
    fontFamily: tokens.strongFont,
    fontSize: 18,
    textTransform: 'uppercase',
  },
  summaryArrow: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  net: { gap: 4 },
  flowBars: { gap: 8 },
  flowTrack: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: tokens.border,
  },
  flowFill: { height: 12, borderRadius: 6 },
  flowAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cashflow: { gap: 4, minHeight: 48, flexShrink: 1 },
  rows: {
    backgroundColor: tokens.surface,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 12,
  },
  link: { minHeight: 48, padding: 16, alignItems: 'center' },
  analysis: {
    gap: 4,
  },
  filter: {
    backgroundColor: '#e5e5e5',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subcategories: { gap: 12 },
  subcategory: {
    minWidth: 120,
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: tokens.surface,
    borderRadius: 8,
  },
  transaction: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderColor: tokens.border,
  },
  transfers: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 12,
  },
});

const sourceStyles = StyleSheet.create({
  fontSize16: { fontSize: 16 },
  opacity045: { opacity: 0.45 },
  flex1gap4: { flex: 1, gap: 4 },
  padding16: { padding: 16 },
});
