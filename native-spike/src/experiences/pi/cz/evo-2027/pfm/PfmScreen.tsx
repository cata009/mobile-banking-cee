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
} from '@/data/spendingAnalytics';
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
  buildPeriodRail,
  buildPresetSelection,
  stepSelection,
} from '@/app/screens/analytics/evoSpendingPeriods';
import { createEvoTranslations } from '@/translations/evo';
import type { Currency } from '@/data/products';
import type { CzechNativeScreenProps } from '../contracts';
import { createHomeProducts } from '../home/model';
import { Glyph, IconAction, Money, textStyles as t } from '../home/Primitives';
import { evoTokens as tokens } from '../home/tokens';
import { Bars, Donut } from './Charts';
import { CategoryMark } from './CategoryMark';
import { CurrencyMark } from '../home/CurrencyMark';
import MovementAvatar from '../accounts/MovementAvatar';
import { PeriodSheet, getPresetLabels } from './PeriodSheet';

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
  const { products } = useMemo(
    () => createHomeProducts(host.productCounts),
    [host.productCounts],
  );
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
    () => listSpendingMonthKeys('CZ', products),
    [products],
  );
  const direction =
    host.route.params?.direction === 'income' ||
    host.route.params?.direction === 'expense'
      ? host.route.params.direction
      : undefined;
  const [state, dispatch] = useReducer(
    evoAnalyticsReducer,
    createEvoAnalyticsState(
      host.route.params?.scopeId,
      direction,
      buildPresetSelection(
        'this-month',
        months[months.length - 1] ?? '',
        months,
        'en-US',
        presetLabels,
      ),
    ),
  );
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
        {},
        { includeOwnTransfers: state.includeOwnTransfers },
      ),
    [scope.products, state.period, state.includeOwnTransfers],
  );
  const view = selectEvoAnalyticsView(state, summary, products, scope);
  const currency = summary.currency as Currency;
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [state.view, state.analysisDirection, state.openBreakdownRow?.key]);
  const back = () => {
    if (state.view === 'breakdown') dispatch({ type: 'close-breakdown' });
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
        if (state.view === 'breakdown') dispatch({ type: 'close-breakdown' });
        else dispatch({ type: 'back-overview' });
      } else return false;
      return true;
    });
    return () => listener.remove();
  }, [host.isActive, state.view, state.periodSheetOpen, state.scopeSheetOpen]);
  const step = (delta: -1 | 1) => {
    const period = stepSelection(
      state.period,
      delta,
      months,
      'en-US',
      presetLabels.lastYear,
    );
    if (period) dispatch({ type: 'select-period', period });
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
      : state.openBreakdownRow?.label ?? directionTitle;
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
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
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
          style={s.scope}
        >
          <Text style={[t.body, t.strong, sourceStyles.fontSize16]}>
            {scope.label}
          </Text>
          <Glyph name="forward" size={16} />
        </Pressable>
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
        {state.view === 'overview' ? (
          <>
            <View style={s.overview}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Analyse money in"
                onPress={() =>
                  dispatch({ type: 'open-analysis', direction: 'income' })
                }
                style={s.cashflow}
              >
                <Text style={t.body}>Money in</Text>
                <Money
                  testID="cz-pfm-income"
                  amount={summary.incomeTotal}
                  currency={currency}
                  hidden={hidden}
                  role="hero"
                />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Analyse money out"
                onPress={() =>
                  dispatch({ type: 'open-analysis', direction: 'expense' })
                }
                style={s.cashflow}
              >
                <Text style={t.body}>Money out</Text>
                <Money
                  testID="cz-pfm-expense"
                  amount={summary.spendingTotal}
                  currency={currency}
                  hidden={hidden}
                  role="hero"
                />
              </Pressable>
              <View style={s.net}>
                <Text style={[t.body, t.strong]}>
                  {copy.spending.netCashflow}
                </Text>
                <Money
                  amount={summary.netTotal}
                  testID="cz-pfm-net"
                  signed
                  currency={currency}
                  hidden={hidden}
                  role="support"
                />
              </View>
            </View>
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
              <Text style={[t.body, t.muted]}>{view.expenseHeaderLabel}</Text>
              <Money
                amount={view.expenseHeaderAmount}
                currency={currency}
                hidden={hidden}
                role="hero"
              />
              <Tabs
                tokens={tokens}
                label="Chart type"
                value={state.expenseChartMode}
                items={[
                  { value: 'donut', label: 'Donut' },
                  { value: 'bars', label: 'Bars' },
                ]}
                onChange={value =>
                  dispatch({
                    type: 'set-field',
                    field: 'expenseChartMode',
                    value,
                  })
                }
              />
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
              {transactions.map(transaction => (
                <Pressable
                  key={`${transaction.sourceProductId}:${transaction.id}`}
                  testID="cz-pfm-transaction"
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${transaction.label} transaction`}
                  onPress={() =>
                    onNavigate({
                      screen: 'transaction',
                      params: {
                        productId: transaction.sourceProductId,
                        transactionId: transaction.id,
                      },
                    })
                  }
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
          onPick={period => dispatch({ type: 'select-period', period })}
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
  scope: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    padding: 12,
    gap: 12,
  },
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
  cashflow: { gap: 4, minHeight: 72 },
  net: {
    borderTopWidth: 1,
    borderColor: tokens.border,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rows: {
    backgroundColor: tokens.surface,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 12,
  },
  link: { minHeight: 48, padding: 16, alignItems: 'center' },
  analysis: {
    backgroundColor: tokens.surface,
    padding: 16,
    borderRadius: 8,
    gap: 12,
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
