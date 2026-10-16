import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  createSpendingAnalyticsTimeline,
  createSpendingCategoryDetail,
  type SpendingAnalyticsSummary,
  type SpendingAnalyticsTransaction,
} from '@/data/spendingAnalytics';
import { formatMoneyNumber } from '@/app/registry/countryConfig';
import {
  getPfmCategory,
  PFM_CATEGORIES,
  type PfmCategoryName,
} from '@/data/pfmCategories';
import { getAnalyticsCategoryDisplayLabel } from '@/app/screens/analytics/analyticsCategoryLabels';
import { maskFormattedAmount } from '@/app/utils/amountPrivacy';
import { Text } from '../../../../universal/Typography';
import { Header } from '../../../../universal/Header';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { sourceColor } from '../../../../universal/sourceColor';
import { CategoryMark } from '../banking/CategoryMark';
import { createCurrentProducts } from '../context';
import { IconAction } from '../Primitives';
import { readCategoryOverrides } from '../banking/categoryOverrides';
import { analyticsTransactionRoute } from '../banking/analyticsTransaction';
import type { CurrentScreenProps } from '../contracts';
import { CashFlow, SourceBubbles, SourcePeriodIndicator } from './SourceCharts';

function tint(foreground: string, background: string) {
  const rgb = (color: string) => {
    const hex = color.replace('#', '');
    const full =
      hex.length === 3
        ? hex
            .split('')
            .map(c => c + c)
            .join('')
        : hex;
    return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16));
  };
  const f = rgb(foreground),
    b = rgb(background);
  return `rgb(${f
    .map((v, i) => Math.round(v * 0.16 + b[i] * 0.84))
    .join(',')})`;
}
function SignedAmount({
  host,
  amount,
  currency,
  hidden = false,
  transaction = false,
  pending = false,
}: {
  host: CurrentScreenProps;
  amount: number;
  currency: string;
  hidden?: boolean;
  transaction?: boolean;
  pending?: boolean;
}) {
  const full = hidden
    ? maskFormattedAmount(
        formatMoneyNumber(Math.abs(amount), host.country),
        host.amountsHidden,
      )
    : formatMoneyNumber(Math.abs(amount), host.country);
  const parts = full.match(/^(.+?)([,.])(\d{2})$/);
  return (
    <Text
      style={[
        s.amount,
        {
          color: pending
            ? host.tokens.muted
            : transaction && amount >= 0
            ? host.tokens.accent
            : host.tokens.text,
        },
      ]}
    >
      {amount < 0 ? '-' : transaction ? '+' : ''}
      {parts?.[1] ?? full}
      {transaction ? '' : parts?.[2] ?? ''}
      <Text style={s.decimals}>
        {transaction ? parts?.[2] ?? '' : ''}
        {parts?.[3] ?? ''} {currency}
      </Text>
    </Text>
  );
}
function AddTransaction({
  host,
  detail = false,
}: {
  host: CurrentScreenProps;
  detail?: boolean;
}) {
  const label = host.t(
    detail
      ? 'runtime.analytics.addTransaction'
      : 'runtime.actions.cardTransaction',
    detail ? 'Add Transaction' : 'Card Transaction',
  );
  return (
    <View style={detail ? s.detailAction : s.action}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => host.onAddTransaction?.()}
        style={s.actionItem}
      >
        <View style={s.iconSlot}>
          <SourceCustomIcon
            name="add-money"
            size={20}
            color={host.tokens.text}
          />
        </View>
        <Text style={[s.actionLabel, { color: host.tokens.text }]}>
          {detail ? label : label.replace(' ', '\n')}
        </Text>
      </Pressable>
    </View>
  );
}
function Hero({
  host,
  summary,
  year,
}: {
  host: CurrentScreenProps;
  summary: SpendingAnalyticsSummary;
  year: boolean;
}) {
  return (
    <>
      <View style={s.heroCopy}>
        <Text style={[s.dataFor, { color: host.tokens.muted }]}>
          {host.t('runtime.analytics.dataFor', 'Data For')}
        </Text>
        <View style={s.heroTitle}>
          <Text style={[s.h1, { color: host.tokens.text }]}>
            {year
              ? host.t('runtime.analytics.yearTotal', 'Year total')
              : summary.periodLabel}
          </Text>
          <Text style={[s.h1, { color: host.tokens.muted }]}>
            {summary.yearLabel}
          </Text>
        </View>
      </View>
      <CashFlow host={host} summary={summary} />
    </>
  );
}
export default function LegacyPfm(host: CurrentScreenProps) {
  const { country, release, productCounts } = host;
  const productCategories = host.bankingPresentation?.productCategories;
  const model = useMemo(
    () =>
      createCurrentProducts({
        country,
        release,
        productCounts,
        bankingPresentation: { productCategories },
      }),
    [country, release, productCounts, productCategories],
  );
  const categoryOverrides = {
    ...readCategoryOverrides(host),
    ...host.bankingPresentation?.transactionCategoryOverrides,
  };
  const timeline =
    host.bankingPresentation?.analyticsTimeline ??
    createSpendingAnalyticsTimeline(
      host.country,
      model.products,
      categoryOverrides,
    );
  const requestedCategory = host.route.params?.category;
  const requestedDirection = host.route.params?.direction;
  const initialCategory = PFM_CATEGORIES.some(
    category => category.name === requestedCategory,
  )
    ? (requestedCategory as PfmCategoryName)
    : null;
  const initialDirection =
    requestedDirection === 'out' || requestedDirection === 'in'
      ? requestedDirection
      : null;
  const requestedPeriodKey = host.route.params?.periodKey;
  const externalDetail = host.route.params?.externalDetail === 'true';
  const initialPeriodKey =
    requestedPeriodKey && timeline.summariesByPeriodKey[requestedPeriodKey]
      ? requestedPeriodKey
      : timeline.activePeriodKey;
  const [period, setPeriod] = useState(initialPeriodKey);
  const [selected, select] = useState<{
    category: PfmCategoryName;
    direction: 'out' | 'in';
  } | null>(
    initialCategory && initialDirection
      ? { category: initialCategory, direction: initialDirection }
      : null,
  );
  const [excluded, setExcluded] = useState<ReadonlySet<string>>(new Set());
  const [showTip, setShowTip] = useState(true);
  const rail = useRef<React.ComponentRef<typeof ScrollView>>(null),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backRef = useRef(() => {
    if (selected && !externalDetail) select(null);
    else host.onBack();
  });
  backRef.current = () => {
    if (selected && !externalDetail) select(null);
    else host.onBack();
  };
  const dark = host.tokens.background === '#121212';
  useEffect(() => {
    if (!host.route.params?.periodKey) setPeriod(timeline.activePeriodKey);
  }, [host.route.params?.periodKey, timeline.activePeriodKey]);
  useEffect(
    () => setExcluded(new Set()),
    [period, selected?.category, selected?.direction],
  );
  const changeNavigation = host.onPrimaryNavigationChange;
  useLayoutEffect(() => {
    changeNavigation?.(!selected);
  }, [selected, host.isActive, changeNavigation]);
  useEffect(() => {
    if (!host.isActive || !selected) return;
    if (Platform.OS === 'web') {
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !e.defaultPrevented) {
          e.preventDefault();
          backRef.current();
        }
      };
      globalThis.addEventListener('keydown', handler);
      return () => globalThis.removeEventListener('keydown', handler);
    }
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      backRef.current();
      return true;
    });
    return () => listener.remove();
  }, [host.isActive, selected]);
  useLayoutEffect(() => {
    const index = Math.max(
      0,
      timeline.periods.findIndex(p => p.key === period),
    );
    rail.current?.scrollTo({ x: index * 375, animated: false });
  }, [period, selected?.category, timeline.periods]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const summary =
    timeline.summariesByPeriodKey[period] ??
    timeline.summariesByPeriodKey[timeline.activePeriodKey];
  const periods = timeline.periods.map(p => p.key);
  const settle = (x: number) => {
    const index = Math.max(
      0,
      Math.min(periods.length - 1, Math.round(x / 375)),
    );
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      rail.current?.scrollTo({ x: index * 375, animated: true });
      setPeriod(periods[index]);
      host.onAnalyticsPeriodChange?.(periods[index]);
    }, 120);
  };
  const openTransaction = (transaction: SpendingAnalyticsTransaction) => {
    const product = model.products.find(
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
    host.onNavigate(analyticsTransactionRoute(transaction));
  };
  const periodRail = (category = false) => (
    <ScrollView
      key={category ? 'category' : 'overview'}
      ref={rail}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={375}
      decelerationRate="fast"
      scrollEventThrottle={16}
      onScroll={e => settle(e.nativeEvent.contentOffset.x)}
    >
      {timeline.periods.map(p => {
        const value = timeline.summariesByPeriodKey[p.key];
        if (!value) return null;
        const complete = selected
          ? createSpendingCategoryDetail(
              value,
              selected.category,
              selected.direction,
            )
          : null;
        const detail = selected
          ? createSpendingCategoryDetail(
              value,
              selected.category,
              selected.direction,
              excluded,
            )
          : null;
        return (
          <View
            key={p.key}
            style={s.panel}
            accessibilityElementsHidden={p.key !== period}
            aria-hidden={p.key !== period}
          >
            {category && selected && complete && detail ? (
              <>
                <View style={s.categoryHero}>
                  <Text style={[s.dataFor, { color: host.tokens.muted }]}>
                    {host.t(
                      'runtime.analytics.showingDataFor',
                      'Showing data for',
                    )}
                  </Text>
                  <Text
                    style={[
                      s.h1,
                      s.categoryPeriod,
                      { color: host.tokens.text },
                    ]}
                  >
                    {p.kind === 'year'
                      ? p.year
                      : `${p.label.charAt(0).toLocaleUpperCase()}${p.label
                          .slice(1)
                          .toLocaleLowerCase()} ${p.year}`}
                  </Text>
                  <Text
                    accessibilityLiveRegion="polite"
                    style={[s.detailTotal, { color: host.tokens.text }]}
                  >
                    {maskFormattedAmount(
                      formatMoneyNumber(detail.total, host.country),
                      host.amountsHidden,
                    )}{' '}
                    {value.currency}
                  </Text>
                </View>
                <SourceBubbles
                  host={host}
                  subcategories={complete.subcategories}
                  colorVar={getPfmCategory(selected.category).colorVar}
                  inactive={excluded}
                  onToggle={label =>
                    setExcluded(previous => {
                      const next = new Set(previous);
                      if (next.has(label)) next.delete(label);
                      else if (
                        complete.subcategories.filter(
                          sub => !next.has(sub.label),
                        ).length > 1
                      )
                        next.add(label);
                      return next;
                    })
                  }
                />
              </>
            ) : (
              <Hero host={host} summary={value} year={p.kind === 'year'} />
            )}
          </View>
        );
      })}
    </ScrollView>
  );
  if (selected) {
    const detail = createSpendingCategoryDetail(
      summary,
      selected.category,
      selected.direction,
      excluded,
    );
    const label = getAnalyticsCategoryDisplayLabel(selected.category, host.t),
      activePeriod = timeline.periods.find(p => p.key === period);
    return (
      <View style={[s.page, { backgroundColor: host.tokens.background }]}>
        <Header
          tokens={host.tokens}
          variant="current"
          title={label}
          onBack={() => backRef.current()}
          screenTopInset={host.screenTopInset}
          backIcon={
            <SourceCustomIcon
              name="back-heavy"
              size={20}
              color={host.tokens.text}
            />
          }
          trailing={<View style={s.emptyAction} />}
          largeTitleColor={sourceColor(
            `var(${getPfmCategory(selected.category).colorVar})`,
            dark,
          )}
        />
        <ScrollView style={s.page} keyboardShouldPersistTaps="handled">
          {periodRail(true)}
          <SourcePeriodIndicator
            keys={periods}
            active={period}
            accent={host.tokens.accent}
          />
          <AddTransaction host={host} detail />
          <View
            style={[
              s.transactions,
              { backgroundColor: sourceColor('var(--uc-surface)', dark) },
            ]}
          >
            <View style={s.monthDividerWrap}>
              <View style={s.monthDivider}>
                <Text style={[s.monthLabel, { color: host.tokens.muted }]}>
                  {activePeriod?.kind === 'year'
                    ? activePeriod.year
                    : activePeriod?.label ?? summary.periodLabel}
                </Text>
                <Text style={[s.monthTotal, { color: host.tokens.text }]}>
                  {maskFormattedAmount(
                    formatMoneyNumber(
                      selected.direction === 'out'
                        ? -detail.total
                        : detail.total,
                      host.country,
                    ),
                    host.amountsHidden,
                  )}{' '}
                  {summary.currency}
                </Text>
              </View>
              <View
                style={[s.monthLine, { backgroundColor: host.tokens.border }]}
              />
            </View>
            {detail.transactions.map((transaction, index) => (
              <React.Fragment
                key={`${transaction.sourceProductId}:${transaction.id}`}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={transaction.label}
                  onPress={() => openTransaction(transaction)}
                  style={s.transaction}
                >
                  <View style={s.transactionLeading}>
                    <View style={s.date}>
                      <Text style={[s.dateDay, { color: host.tokens.text }]}>
                        {transaction.day}
                      </Text>
                      <Text style={[s.dateMonth, { color: host.tokens.muted }]}>
                        {transaction.month}
                      </Text>
                    </View>
                    <CategoryMark
                      category={transaction.pfmCategory}
                      color={sourceColor(
                        `var(${
                          getPfmCategory(transaction.pfmCategory).colorVar
                        })`,
                        dark,
                      )}
                    />
                  </View>
                  <View style={s.transactionCopy}>
                    <Text
                      style={[
                        s.transactionTitle,
                        {
                          color:
                            transaction.status === `Pending`
                              ? host.tokens.muted
                              : host.tokens.text,
                        },
                      ]}
                    >
                      {transaction.label}
                    </Text>
                    <SignedAmount
                      host={host}
                      amount={transaction.amount}
                      currency={summary.currency}
                      hidden
                      transaction
                      pending={transaction.status === `Pending`}
                    />
                  </View>
                </Pressable>
                {selected.category === 'Uncategorized' &&
                  index === 0 &&
                  showTip && (
                    <View style={s.tip}>
                      <View
                        style={[
                          s.tipCard,
                          { backgroundColor: host.tokens.background },
                        ]}
                      >
                        <View style={s.tipCopy}>
                          <Text
                            style={[s.detailTotal, { color: host.tokens.text }]}
                          >
                            {host.t(
                              'runtime.analytics.uncategorizedTransaction',
                              'Uncategorized transaction',
                            )}
                          </Text>
                          <Text
                            style={[s.tipBody, { color: host.tokens.muted }]}
                          >
                            {host.t(
                              'runtime.analytics.uncategorizedTransactionDescription',
                              'Choose a category for this transaction and the app will remember it in the future.',
                            )}
                          </Text>
                        </View>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={host.t(
                            'runtime.analytics.dismissUncategorizedTip',
                            'Dismiss uncategorized transaction tip',
                          )}
                          onPress={() => setShowTip(false)}
                        >
                          <SourceCustomIcon
                            name="close-x"
                            size={20}
                            color={host.tokens.text}
                          />
                        </Pressable>
                      </View>
                    </View>
                  )}
              </React.Fragment>
            ))}
            {!detail.transactions.length && (
              <Text style={[s.noResults, { color: host.tokens.muted }]}>
                {host.t(
                  'runtime.analytics.noTransactionsForPeriod',
                  'No transactions for this period',
                )}
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }
  const section = (direction: 'out' | 'in') => {
    const categories =
        direction === 'out'
          ? summary.moneyOutCategories
          : summary.moneyInCategories,
      max = Math.max(...categories.map(c => c.total), 1);
    return (
      <View style={s.section}>
        <Text style={[s.sectionTitle, { color: host.tokens.text }]}>
          {host.t(
            direction === 'out'
              ? 'runtime.analytics.moneyOut'
              : 'runtime.analytics.moneyIn',
            direction === 'out' ? 'Money out' : 'Money in',
          )}
        </Text>
        <View style={s.categories}>
          {categories.map(category => (
            <Pressable
              key={category.category}
              accessibilityRole="button"
              accessibilityLabel={`${host.t(
                'runtime.analytics.openCategoryDetails',
                'Open category details',
              )}: ${getAnalyticsCategoryDisplayLabel(
                category.category,
                host.t,
              )}`}
              onPress={() => select({ category: category.category, direction })}
              style={s.categoryRow}
            >
              <View style={s.categoryIcon}>
                <CategoryMark
                  category={category.category}
                  size={32}
                  color={sourceColor(
                    `var(${getPfmCategory(category.category).colorVar})`,
                    dark,
                  )}
                />
              </View>
              <View style={s.categoryPillContent}>
                <View
                  style={[
                    s.categoryPill,
                    {
                      width: Math.round(
                        104 + Math.max(0.24, category.total / max) * 178,
                      ),
                      backgroundColor: tint(
                        sourceColor(`var(${category.colorVar})`, dark),
                        sourceColor('var(--uc-surface)', dark),
                      ),
                    },
                  ]}
                />
                <View style={s.categoryCopy}>
                  <Text style={[s.categoryLabel, { color: host.tokens.muted }]}>
                    {getAnalyticsCategoryDisplayLabel(
                      category.category,
                      host.t,
                    )}
                  </Text>
                  <SignedAmount
                    host={host}
                    amount={
                      direction === 'out' ? -category.total : category.total
                    }
                    currency={summary.currency}
                  />
                </View>
              </View>
            </Pressable>
          ))}
        </View>
        {!categories.length && (
          <Text style={[s.noResults, { color: host.tokens.muted }]}>
            {host.t(
              'runtime.analytics.noTransactionsForPeriod',
              'No transactions for this period',
            )}
          </Text>
        )}
      </View>
    );
  };
  return (
    <View style={[s.page, { backgroundColor: host.tokens.background }]}>
      <View style={s.header}>
        <Text
          accessibilityRole="header"
          style={[s.headerTitle, { color: host.tokens.text }]}
        >
          {host.t('runtime.analytics.title', 'My Spendings')}
        </Text>
        <View style={s.rail}>
          <IconAction
            host={host}
            name="header-profile"
            label={host.t('runtime.actions.profile', 'Profile')}
            size={20}
            slotSize={32}
          />
          <IconAction
            host={host}
            name="header-messages"
            label={host.t('runtime.actions.messages', 'Messages')}
            size={20}
            slotSize={32}
            onPress={() => host.onNavigate({ screen: 'messages' })}
          />
          <IconAction
            host={host}
            name="help-circle"
            label={host.t('runtime.actions.help', 'Help')}
            size={20}
            slotSize={32}
          />
        </View>
      </View>
      <ScrollView
        style={s.page}
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {periodRail()}
        <SourcePeriodIndicator
          keys={periods}
          active={period}
          accent={host.tokens.accent}
        />
        <AddTransaction host={host} />
        {section('out')}
        {section('in')}
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  monthDividerWrap: { paddingHorizontal: 16, paddingVertical: 8, gap: 4 },
  monthLine: { height: 1 },
  transactionLeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexShrink: 0,
  },
  date: { alignItems: 'center', gap: 2 },
  dateDay: { fontFamily: 'UniCredit-bold', fontSize: 18, lineHeight: 20 },
  dateMonth: { fontFamily: 'UniCredit-bold', fontSize: 14, lineHeight: 15 },
  page: { flex: 1 },
  header: {
    paddingTop: 54,
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontFamily: 'UniCredit-bold',
    fontSize: 28,
    lineHeight: 31,
    minHeight: 32,
    flex: 1,
  },
  rail: { flexDirection: 'row', height: 32, gap: 8 },
  scroll: { paddingBottom: 80 },
  panel: { width: 375, flexShrink: 0 },
  heroCopy: { paddingHorizontal: 24 },
  dataFor: { fontFamily: 'UniCredit-bold', fontSize: 16, lineHeight: 18 },
  heroTitle: {
    marginTop: 4,
    flexDirection: 'row',
    gap: 96,
    alignItems: 'baseline',
  },
  h1: { fontFamily: 'UniCredit-bold', fontSize: 28, lineHeight: 31 },
  action: { paddingHorizontal: 24, paddingBottom: 18, alignItems: 'flex-end' },
  detailAction: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    alignItems: 'flex-end',
  },
  actionItem: { width: 82, alignItems: 'center', gap: 4 },
  iconSlot: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 15,
    textAlign: 'center',
  },
  section: { paddingTop: 20 },
  sectionTitle: {
    paddingHorizontal: 24,
    fontFamily: 'UniCredit-bold',
    fontSize: 32,
    lineHeight: 48,
  },
  categories: { paddingHorizontal: 16, marginTop: 12, gap: 14 },
  categoryRow: { minHeight: 92, paddingLeft: 44, position: 'relative' },
  categoryIcon: { position: 'absolute', left: 0, top: 30 },
  categoryPillContent: {
    minHeight: 92,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  categoryPill: {
    height: 78,
    borderRadius: 28,
    position: 'absolute',
    right: -18,
    top: 7,
  },
  categoryCopy: {
    maxWidth: 255,
    paddingVertical: 8,
    zIndex: 1,
    alignItems: 'flex-end',
  },
  categoryLabel: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 15,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  amount: {
    fontFamily: 'UniCredit-bold',
    fontSize: 20,
    lineHeight: 22,
    textAlign: 'right',
  },
  decimals: { fontFamily: 'UniCredit-regular', fontSize: 14, lineHeight: 15 },
  categoryHero: { paddingHorizontal: 24, paddingTop: 6 },
  categoryPeriod: { marginTop: 2 },
  detailTotal: {
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
    lineHeight: 20,
    marginTop: 2,
  },
  emptyAction: { width: 40, height: 40 },
  transactions: { paddingBottom: 24 },
  monthDivider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthLabel: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    lineHeight: 18,
    textTransform: 'uppercase',
  },
  monthTotal: { fontFamily: 'UniCredit-bold', fontSize: 14, lineHeight: 15 },
  transaction: {
    height: 80,
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  transactionCopy: { flex: 1, minWidth: 0, alignItems: 'flex-end', gap: 4 },
  transactionTitle: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 18,
    textAlign: 'right',
  },
  transactionSubtitle: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 15,
    marginTop: 4,
  },
  tip: { paddingHorizontal: 16, paddingVertical: 8 },
  tipCard: { padding: 16, borderRadius: 8, flexDirection: 'row', gap: 16 },
  tipCopy: { flex: 1 },
  tipBody: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 15,
    marginTop: 4,
  },
  noResults: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 15,
  },
});
