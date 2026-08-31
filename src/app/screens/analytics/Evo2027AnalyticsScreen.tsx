import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode, type UIEvent } from 'react';
import ExpenseBarChart, { type ExpenseBar } from '@/app/components/analytics/ExpenseBarChart';
import ExpenseDonutChart, {
  EXPENSE_OTHER_CATEGORY,
  type ExpenseDonutCategory,
  type ExpenseDonutSegment,
} from '@/app/components/analytics/ExpenseDonutChart';
import CashFlowBars, { CashFlowDot } from '@/app/components/analytics/CashFlowBars';
import AccountCarouselIndicator from '@/app/components/accounts/AccountCarouselIndicator';
import { CAROUSEL_CARD_SHADOW } from '@/app/components/accounts/AccountBalanceCard';
import AccountTransactionMonthDivider from '@/app/components/accounts/AccountTransactionMonthDivider';
import AccountTransactionRow from '@/app/components/accounts/AccountTransactionRow';
import { transactionGroupCardClassName } from '@/app/components/accounts/transactionGroupCard';
import AmountVisibilityButton from '@/app/components/AmountVisibilityButton';
import { BottomSheet } from '@/app/components/BottomSheet';
import PageHeader from '@/app/components/PageHeader';
import { HeaderActionButton, HeaderActionRail } from '@/app/components/HeaderActionIcons';
import { AppIcon } from '@/app/components/icons';
import App2027PrimaryNavigation, {
  type App2027PrimaryNavigationItem,
} from '@/app/components/navigation/App2027PrimaryNavigation';
import TransactionAvatar from '@/app/components/transactions/TransactionAvatar';
import PfmCategoryBubbleChart from '@/app/components/pfm/PfmCategoryBubbleChart';
import PfmCategoryIcon from '@/app/components/pfm/PfmCategoryIcon';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { formatEvo2027Number, formatEvo2027SignedNumber } from '@/app/utils/evo2027Formatting';
import { useCountry, useDemo } from '@/app/state/demoStore';
import type { CountryId } from '@/app/state/demoTypes';
import {
  createSpendingAnalytics,
  createSpendingAnalyticsTimeline,
  createSpendingCategoryDetail,
  getAnalyticsSubcategoryLabel,
  getSpendingWeekIndex,
  SPENDING_WEEK_LENGTH,
  type SpendingSubcategorySummary,
  type SpendingAnalyticsPeriod,
  type SpendingAnalyticsSummary,
  type SpendingAnalyticsTransaction,
} from '@/data/spendingAnalytics';
import { groupAccountTransactionsByDate } from '@/data/accountDetails';
import { getPfmCategory, type PfmCategoryName, type PfmCategorySelection } from '@/data/pfmCategories';
import { type Product } from '@/data/products';
import { maskFormattedAmount } from '@/app/utils/amountPrivacy';
import { useDragCarousel } from '@/hooks/useDragCarousel';
import { useProducts } from '@/hooks/useProducts';
import { CurrencyBadge, TrendBadge } from '../home/App2027ProductAccordions';
import { getEvoAnalyticsCategoryDisplayLabel } from './analyticsCategoryLabels';
import {
  createEvoAnalyticsState,
  evoAnalyticsReducer,
  type AnalyticsDirection,
  type ExpenseChartMode,
  type ExpenseSplitMode,
} from './evoAnalyticsState';

type AnalyticsScope = {
  id: string;
  label: string;
  products: Product[];
};

/** Biggest categories surfaced on the overview; the rest live one tap deeper. */
const OVERVIEW_CATEGORY_LIMIT = 3;

/** Categories drawn as individual arcs; all remaining categories share the Other arc. */
const DONUT_CATEGORY_LIMIT = 3;

const EXPENSE_CHART_MODES: ReadonlyArray<{ mode: ExpenseChartMode; icon: 'analytics-donut-toggle' | 'analytics-bars-toggle'; label: string }> = [
  { mode: 'donut', icon: 'analytics-donut-toggle', label: 'Show categories as a donut' },
  { mode: 'bars', icon: 'analytics-bars-toggle', label: 'Show spending over time' },
];

const EXPENSE_SPLIT_MODES: ReadonlyArray<{ mode: ExpenseSplitMode; label: string }> = [
  { mode: 'categories', label: 'Categories' },
  { mode: 'merchants', label: 'Merchants' },
  { mode: 'currencies', label: 'Currency' },
];

interface ExpenseBreakdownRow {
  key: string;
  label: string;
  total: number;
  transactionCount: number;
  /** Set for category rows so the list can reuse the PFM icon. */
  category?: PfmCategoryName;
  /** Currency rows reuse the same roundel shown on the Evo account cards. */
  currency?: Product['currency'];
  /**
   * A transaction from the group, so a merchant row can lead with the same
   * visual the statement uses — the brand mark, the counterparty initials, or
   * the account pair — instead of a second, weaker icon language.
   */
  sample?: SpendingAnalyticsTransaction;
}

function capitalise(value: string, locale: string) {
  return `${value.slice(0, 1).toLocaleUpperCase(locale)}${value.slice(1)}`;
}

/** What a transaction is grouped under for the active split — the one rule all three views share. */
function getExpenseSplitKey(
  transaction: SpendingAnalyticsTransaction,
  mode: ExpenseSplitMode,
  currencyByProductId: ReadonlyMap<string, string>,
  reportingCurrency: string,
) {
  if (mode === 'categories') return transaction.pfmCategory as string;
  if (mode === 'merchants') return transaction.label;
  return currencyByProductId.get(transaction.sourceProductId) ?? reportingCurrency;
}

function buildExpenseBreakdown(
  mode: ExpenseSplitMode,
  transactions: readonly SpendingAnalyticsTransaction[],
  currencyByProductId: ReadonlyMap<string, string>,
  reportingCurrency: string,
  locale: string,
): ExpenseBreakdownRow[] {
  const groups = new Map<string, ExpenseBreakdownRow>();
  // Currency rows carry the code as their badge, so the label spells the currency out instead of repeating it.
  const currencyNames = mode === 'currencies' ? new Intl.DisplayNames([locale], { type: 'currency' }) : null;

  transactions.forEach((transaction) => {
    const key = mode === 'categories'
      ? transaction.pfmCategory
      : mode === 'merchants'
        ? transaction.label
        : currencyByProductId.get(transaction.sourceProductId) ?? reportingCurrency;
    const existing = groups.get(key);

    if (existing) {
      existing.total += Math.abs(transaction.amount);
      existing.transactionCount += 1;
      return;
    }

    groups.set(key, {
      key,
      label: mode === 'categories'
        ? getEvoAnalyticsCategoryDisplayLabel(transaction.pfmCategory)
        : capitalise(currencyNames?.of(key) ?? key, locale),
      total: Math.abs(transaction.amount),
      transactionCount: 1,
      category: mode === 'categories' ? transaction.pfmCategory : undefined,
      currency: mode === 'currencies' ? key as Product['currency'] : undefined,
      // Merchant rows reuse the statement's own identity rules.
      sample: mode === 'merchants' ? transaction : undefined,
    });
  });

  return Array.from(groups.values()).sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
}

/** Bucket a transaction lands in on the bar chart: one bar per week in a month, per month in a year. */
function getExpenseBucketKey(transaction: SpendingAnalyticsTransaction, periodKind: 'month' | 'year') {
  return periodKind === 'year'
    ? transaction.monthKey
    : `w${getSpendingWeekIndex(Number(transaction.day)) + 1}`;
}

function buildExpenseBars(
  summary: SpendingAnalyticsSummary,
  transactions: readonly SpendingAnalyticsTransaction[],
): ExpenseBar[] {
  const locale = 'en-US';
  const totals = new Map<string, number>();

  transactions.forEach((transaction) => {
    const key = getExpenseBucketKey(transaction, summary.periodKind);
    totals.set(key, (totals.get(key) ?? 0) + Math.abs(transaction.amount));
  });

  if (summary.periodKind === 'year') {
    const year = Number(summary.yearLabel);

    return Array.from({ length: 12 }, (_, index) => {
      const key = `${summary.yearLabel}-${String(index + 1).padStart(2, '0')}`;
      const month = new Date(year, index, 1);

      return {
        key,
        // A single initial keeps all twelve months on the axis; abbreviations would have to be thinned out.
        label: month.toLocaleDateString(locale, { month: 'narrow' }),
        filterTitle: month.toLocaleDateString(locale, { month: 'long' }),
        filterLabel: `${month.toLocaleDateString(locale, { month: 'long' })} ${summary.yearLabel}`,
        total: totals.get(key) ?? 0,
      };
    });
  }

  const [yearPart, monthPart] = summary.monthKey.split('-');
  const year = Number(yearPart);
  const monthIndex = Number(monthPart) - 1;
  // Day 0 of the next month is the last day of this one.
  const dayCount = new Date(year, monthIndex + 1, 0).getDate();
  // The trailing week is short whenever the month does not divide by seven (29-31, or 22-28 in February).
  const weekCount = Math.ceil(dayCount / SPENDING_WEEK_LENGTH);

  return Array.from({ length: weekCount }, (_, index) => {
    const key = `w${index + 1}`;
    const firstDay = index * SPENDING_WEEK_LENGTH + 1;
    const lastDay = Math.min(dayCount, firstDay + SPENDING_WEEK_LENGTH - 1);
    const weekLabel = `Week ${index + 1}`;

    return {
      key,
      label: `${firstDay}–${lastDay}`,
      caption: weekLabel,
      // Outside the axis the ordinal alone is meaningless, so name the actual dates: "22-28 April 2026".
      filterTitle: `${firstDay}–${lastDay} ${formatPeriodLabel(summary.periodLabel)}`,
      filterLabel: `${firstDay}–${lastDay} ${formatPeriodLabel(summary.periodLabel)} ${summary.yearLabel}`,
      total: totals.get(key) ?? 0,
    };
  });
}

export interface Evo2027AnalyticsScreenProps {
  onHomeClick?: () => void;
  onMessagesClick?: () => void;
  onPaymentsClick?: () => void;
  onProductsClick?: () => void;
  onMoreClick?: () => void;
  transactionCategoryOverrides?: Readonly<Record<string, PfmCategorySelection>>;
  onTransactionClick?: (transaction: SpendingAnalyticsTransaction) => void;
  onAddTransaction?: () => void;
  initialScopeId?: string;
  initialDirection?: AnalyticsDirection;
}

function splitAmount(value: string) {
  const match = value.match(/^(.+?)([,.])([0-9]{2})$/);

  if (!match) {
    return { integer: value, separator: '', decimals: '' };
  }

  return {
    integer: match[1],
    separator: match[2],
    decimals: match[3],
  };
}

/** The analytics copy is English throughout, so its month and currency names are formatted that way. */
const ANALYTICS_LOCALE = 'en-US';

/**
 * Merchants and currencies have no palette of their own, and borrowing the PFM one turns the ring
 * into a colour lottery — two merchants in the same category come out identical, and the colours
 * claim a meaning they do not have. They get a stepped brand ramp instead: neutral, and every step
 * clears 3:1 against the page.
 */
const DONUT_NEUTRAL_COLOR_VARS = ['--uc-teal-900', '--uc-teal-bright', '--uc-text', '--uc-neutral-600'];

const SPLIT_MODE_NOUNS: Record<ExpenseSplitMode, string> = {
  categories: 'categories',
  merchants: 'merchants',
  currencies: 'currencies',
};

/**
 * The ring shows whatever the list is split by: the three biggest rows plus an Other slice.
 * A merchant borrows the colour and icon of the category it spends into; a currency has no
 * category at all, so it takes a colour from the neutral rotation.
 */
function buildDonutSegments(rows: readonly ExpenseBreakdownRow[]): ExpenseDonutSegment[] {
  const otherTotal = rows.slice(DONUT_CATEGORY_LIMIT).reduce((total, row) => total + row.total, 0);
  const segments = rows.slice(0, DONUT_CATEGORY_LIMIT).map((row, index) => {
    // Only a split by category wears the PFM palette and its icons. A merchant or a currency arc
    // carries the same mark its row does — the brand roundel, the flag — so the ring reads as the
    // list it sits above rather than as a set of categories.
    const isCategoryRow = Boolean(row.category);

    return {
      category: row.key,
      label: row.label,
      total: row.total,
      colorVar: row.category
        ? getPfmCategory(row.category).colorVar
        : DONUT_NEUTRAL_COLOR_VARS[index % DONUT_NEUTRAL_COLOR_VARS.length]!,
      iconCategory: isCategoryRow ? row.category : undefined,
      icon: isCategoryRow ? undefined : <ExpenseBreakdownRowIcon row={row} />,
    };
  });

  return otherTotal > 0
    ? [...segments, {
      category: EXPENSE_OTHER_CATEGORY,
      label: EXPENSE_OTHER_CATEGORY,
      total: otherTotal,
      colorVar: '--uc-pfm-finance',
    }]
    : segments;
}

/** Travel before a press on a chart counts as a period swipe rather than a tap on a bar or an arc. */
const PERIOD_SWIPE_THRESHOLD = 40;

/**
 * Swiping a chart steps periods exactly as the arrows do. The charts are made of buttons, so the
 * gesture also has to swallow the click it ends on — otherwise a swipe off a bar isolates it too.
 */
function usePeriodSwipe(
  periods: readonly SpendingAnalyticsPeriod[],
  selectedPeriodKey: string,
  onPeriodChange: (periodKey: string) => void,
) {
  const startXRef = useRef<number | null>(null);
  const swipedRef = useRef(false);
  const activeIndex = Math.max(periods.findIndex((period) => period.key === selectedPeriodKey), 0);

  const swipeHandlers = {
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      startXRef.current = event.clientX;
      swipedRef.current = false;
    },
    onPointerUp: (event: React.PointerEvent<HTMLElement>) => {
      const startX = startXRef.current;
      startXRef.current = null;
      if (startX === null) return;

      const deltaX = event.clientX - startX;
      if (Math.abs(deltaX) < PERIOD_SWIPE_THRESHOLD) return;

      swipedRef.current = true;
      const nextPeriod = periods[activeIndex + (deltaX < 0 ? 1 : -1)];
      if (nextPeriod) onPeriodChange(nextPeriod.key);
    },
    onPointerCancel: () => { startXRef.current = null; },
    onClickCapture: (event: React.MouseEvent<HTMLElement>) => {
      if (!swipedRef.current) return;
      swipedRef.current = false;
      event.preventDefault();
      event.stopPropagation();
    },
  };

  return { activeIndex, swipeHandlers };
}

/** Scroll it takes for the large title to hand over to the small one in the sticky header. */
const HEADER_COLLAPSE_DISTANCE = 56;

/**
 * Slack kept past the handover point. Landing exactly on it is a knife edge: the collapse removes
 * the large title, and any pixel the browser then gives back re-expands it, which is the flicker.
 */
const HEADER_COLLAPSE_MARGIN = 24;

/** "APRIL" → "April", "RENT" → "Rent": ledger labels arrive shouty and read badly in a sentence. */
function toSentenceCase(value: string) {
  return `${value.slice(0, 1)}${value.slice(1).toLocaleLowerCase()}`;
}

function formatPeriodLabel(label: string) {
  return toSentenceCase(label);
}

function FormattedAmount({
  amount,
  country,
  currency,
  className = '',
  amountsHidden = false,
  compact = false,
  prefix = '',
}: {
  amount: number;
  country: CountryId;
  currency: string;
  className?: string;
  amountsHidden?: boolean;
  compact?: boolean;
  /** Sign printed with the integer part, e.g. the minus on a statement row. */
  prefix?: string;
}) {
  void country;
  // Mask the formatted string, then split it — `splitAmount` and `maskAmountParts` have
  // incompatible shapes, and combining them the other way prints "**** , ,**".
  const value = splitAmount(maskFormattedAmount(formatEvo2027Number(Math.abs(amount)), amountsHidden));

  return (
    <p className={`inline-flex items-baseline whitespace-nowrap text-[var(--uc-text)] ${className}`.trim()}>
      <span className={compact ? 'text-[18px] font-bold leading-[22px] tracking-[-0.02em]' : 'text-[24px] font-bold leading-[26px] tracking-[-0.025em]'}>{prefix}{value.integer}</span>
      {value.decimals ? (
        <span className={compact ? 'text-[14px] font-normal leading-[18px]' : 'text-[16px] font-normal leading-[20px]'}>{value.separator}{value.decimals} {currency}</span>
      ) : null}
    </p>
  );
}

function AnalyticsHeader({ onMessagesClick }: { onMessagesClick?: () => void }) {
  const { t } = useLanguage();
  const { amountsHidden, toggleAmountsHidden } = useDemo();

  // 24px title gutter, `uc-type-h1` and a three-glyph rail are the L1 contract every
  // sibling destination keeps — see HomeHeader.tsx:33, PaymentsScreen.tsx:55, MoreHeader.tsx:34.
  return (
    <header className="w-full bg-[var(--uc-app-bg)]">
      {/* Same gutter as the page body below, so the title lines up with the cards. */}
      <div className="px-[16px] pb-[20px]">
        <div className="flex min-h-[32px] items-start gap-[8px]">
          <h1 className="uc-type-h1 min-w-0 flex-1 text-[var(--uc-text)]">
            {t('runtime.analytics.title', 'My Spendings')}
          </h1>
          <HeaderActionRail>
            <AmountVisibilityButton hidden={amountsHidden} onToggle={toggleAmountsHidden} />
            <HeaderActionButton icon="profile" label={t('runtime.actions.profile', 'Profile')} />
            <HeaderActionButton icon="messages" label={t('runtime.actions.messages', 'Messages')} onClick={onMessagesClick} />
          </HeaderActionRail>
        </div>
      </div>
    </header>
  );
}

/** The month/year stepper on its own, so every analytics page changes period the same way. */
function ExpensePeriodStepper({
  periods,
  selectedPeriodKey,
  onPeriodChange,
  titleOverride,
  className = '',
}: {
  periods: readonly SpendingAnalyticsPeriod[];
  selectedPeriodKey: string;
  onPeriodChange: (periodKey: string) => void;
  /** Names the slice the user isolated on the chart; the year keeps its place underneath. */
  titleOverride?: string | null;
  className?: string;
}) {
  const activeIndex = Math.max(periods.findIndex((period) => period.key === selectedPeriodKey), 0);
  const activePeriod = periods[activeIndex] ?? periods[0];
  const previousPeriod = periods[activeIndex - 1];
  const nextPeriod = periods[activeIndex + 1];

  if (!activePeriod) return null;

  return (
    <div
      className={`flex items-center gap-[8px] ${className}`.trim()}
      data-evo-expense-interval={activePeriod.kind}
      data-evo-analytics-period-key={activePeriod.key}
    >
      <button
        type="button"
        aria-label="Show previous analytics period"
        disabled={!previousPeriod}
        onClick={() => previousPeriod && onPeriodChange(previousPeriod.key)}
        className="grid size-[32px] shrink-0 place-items-center rounded-full text-[var(--uc-text)] transition-opacity disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
      >
        <AppIcon name="chevron-left" size={18} aria-hidden="true" />
      </button>

      <div className="min-w-0 flex-1 text-center">
        <h2 className="truncate text-[24px] font-bold leading-[28px] tracking-[-0.02em] text-[var(--uc-text)]">
          {titleOverride ?? (activePeriod.kind === 'year' ? activePeriod.label : formatPeriodLabel(activePeriod.label))}
        </h2>
        {/* Both kinds carry a subtitle, so stepping from a month to a year never changes the header height. */}
        <p className="text-[16px] font-bold leading-[20px] text-[var(--uc-text-muted)]">
          {titleOverride || activePeriod.kind === 'month' ? activePeriod.year : 'Full year'}
        </p>
      </div>

      {nextPeriod ? (
        <button
          type="button"
          aria-label="Show next analytics period"
          onClick={() => onPeriodChange(nextPeriod.key)}
          className="grid size-[32px] shrink-0 place-items-center rounded-full text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
        >
          <AppIcon name="chevron-left" size={18} className="rotate-180" aria-hidden="true" />
        </button>
      ) : (
        <span aria-hidden="true" className="size-[32px] shrink-0" />
      )}
    </div>
  );
}

function ExpensePeriodNavigator({
  scopeLabel,
  onOpenScope,
  periods,
  selectedPeriodKey,
  onPeriodChange,
  titleOverride,
  trailing,
}: {
  scopeLabel: string;
  onOpenScope: () => void;
  periods: readonly SpendingAnalyticsPeriod[];
  selectedPeriodKey: string;
  onPeriodChange: (periodKey: string) => void;
  titleOverride?: string | null;
  /** Optional control parked on the scope row, e.g. the chart-mode toggle. */
  trailing?: ReactNode;
}) {
  return (
    <section aria-label="Analytics period" className="mt-[4px]">
      <div className="flex items-center justify-between gap-[12px]">
        <button
          type="button"
          data-evo-analytics-scope-trigger
          aria-haspopup="dialog"
          onClick={onOpenScope}
          className="-ml-[4px] inline-flex min-h-[32px] min-w-0 max-w-full items-center gap-[6px] rounded-[8px] px-[4px] text-left text-[16px] font-bold leading-[20px] text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
        >
          <span className="truncate">{scopeLabel}</span>
          <AppIcon name="chevron-down-wide" size={18} color="currentColor" aria-hidden="true" />
        </button>

        {trailing}
      </div>

      {/* Matches the breathing room between the page title and the scope row above. */}
      <ExpensePeriodStepper
        className="mt-[12px]"
        periods={periods}
        selectedPeriodKey={selectedPeriodKey}
        onPeriodChange={onPeriodChange}
        titleOverride={titleOverride}
      />
    </section>
  );
}

function ExpenseChartPanel({
  direction,
  segments,
  selectedKeys,
  onToggleSegment,
  bars,
  selectedBucketKey,
  onToggleBucket,
  mode,
  headerLabel,
  headerAmount,
  country,
  currency,
  periods,
  selectedPeriodKey,
  onPeriodChange,
}: {
  direction: AnalyticsDirection;
  segments: readonly ExpenseDonutSegment[];
  selectedKeys: ReadonlySet<ExpenseDonutCategory>;
  onToggleSegment: (key: ExpenseDonutCategory) => void;
  bars: readonly ExpenseBar[];
  selectedBucketKey: string | null;
  onToggleBucket: (key: string) => void;
  mode: ExpenseChartMode;
  headerLabel: string;
  headerAmount: number;
  country: CountryId;
  currency: string;
  periods: readonly SpendingAnalyticsPeriod[];
  selectedPeriodKey: string;
  onPeriodChange: (periodKey: string) => void;
}) {
  const { activeIndex, swipeHandlers } = usePeriodSwipe(periods, selectedPeriodKey, onPeriodChange);

  if (segments.length === 0) {
    return (
      <section
        aria-label={`${direction === 'income' ? 'Income' : 'Expense'} chart`}
        className="mt-[24px] touch-pan-y select-none"
        data-evo-expense-chart
        data-evo-expense-chart-surface
        {...swipeHandlers}
      >
        <p className="py-[28px] text-[16px] leading-[22px] text-[var(--uc-text-muted)]">
          No {direction === 'income' ? 'income' : 'expense'} data for this period.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label={`${direction === 'income' ? 'Income' : 'Expense'} chart`}
      className="mt-[16px] touch-pan-y select-none"
      data-evo-expense-chart
      data-evo-expense-chart-surface
      {...swipeHandlers}
    >
      {mode === 'donut' ? (
        <ExpenseDonutChart
          segments={segments}
          selected={selectedKeys}
          onToggle={onToggleSegment}
          centerLabel={headerLabel}
          centerValue={<FormattedAmount amount={headerAmount} country={country} currency={currency} />}
        />
      ) : (
        <ExpenseBarChart
          bars={bars}
          selectedKey={selectedBucketKey}
          onToggle={onToggleBucket}
          header={(
            <div className="min-w-0">
              <p className="truncate text-[16px] leading-[20px] text-[var(--uc-text-muted)]">{headerLabel}</p>
              <FormattedAmount amount={headerAmount} country={country} currency={currency} className="mt-[2px]" />
            </div>
          )}
        />
      )}

      {/* The dots say the chart is a rail of periods, and give the swipe a target to aim at. */}
      <AccountCarouselIndicator
        count={periods.length}
        activeIndex={activeIndex}
        itemLabel="period"
        withBackdropBlur={false}
        onSelect={(index) => {
          const period = periods[index];
          if (period) onPeriodChange(period.key);
        }}
      />
    </section>
  );
}

function ExpenseChartModeToggle({
  mode,
  onModeChange,
}: {
  mode: ExpenseChartMode;
  onModeChange: (mode: ExpenseChartMode) => void;
}) {
  return (
    <div
      className="flex shrink-0 items-center gap-[2px] rounded-full bg-[var(--uc-neutral-200)] px-[4px] py-[2px]"
      role="group"
      aria-label="Chart type"
      data-evo-expense-chart-mode={mode}
    >
      {EXPENSE_CHART_MODES.map((entry) => (
        <button
          key={entry.mode}
          type="button"
          aria-label={entry.label}
          aria-pressed={entry.mode === mode}
          className={`grid h-[24px] w-[40px] place-items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)] ${
            entry.mode === mode
              ? 'bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]'
              : 'text-[var(--uc-text-subtle)]'
          }`}
          onClick={() => onModeChange(entry.mode)}
        >
          <AppIcon name={entry.icon} size={16} color="currentColor" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

function ExpenseTransactionList({
  transactions,
  summary,
  country,
  scopeLabel,
  total,
  onTransactionClick,
}: {
  transactions: readonly SpendingAnalyticsTransaction[];
  summary: SpendingAnalyticsSummary;
  country: CountryId;
  scopeLabel: string;
  /** Sum of what is listed below — set where the list is a filtered slice worth totalling. */
  total?: number;
  onTransactionClick?: (transaction: SpendingAnalyticsTransaction) => void;
}) {
  const visibleTransactions = transactions;
  // Statements group by day, so an analytics drill-in has to as well — same divider, same card.
  const dateGroups = groupAccountTransactionsByDate([...visibleTransactions]);

  return (
    <section aria-label="Expense transactions" className="mt-[32px] pb-[20px]">
      <div className="flex items-end justify-between gap-[16px]">
        <div className="min-w-0">
          <h3 className="uc-type-l1 text-[var(--uc-text)]">Transactions</h3>
          <p className="mt-[4px] text-[16px] leading-[20px] text-[var(--uc-text-muted)]">{scopeLabel}</p>
        </div>
        {/* The figures belong beside what they add up: this list, under this filter. */}
        <div className="shrink-0 text-right">
          {total !== undefined ? (
            <FormattedAmount amount={total} country={country} currency={summary.currency} compact className="justify-end" />
          ) : null}
          <span className="mt-[2px] block text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
            {visibleTransactions.length} shown
          </span>
        </div>
      </div>

      {visibleTransactions.length > 0 ? (
        // The group cards carry the screen gutter themselves, so this cancels the page padding.
        <div className="-mx-[16px] mt-[8px]">
          {dateGroups.map((dateGroup) => (
            <div key={dateGroup.dateKey} data-transaction-date-group={dateGroup.dateKey}>
              <AccountTransactionMonthDivider
                title={dateGroup.dateTitle}
                total={dateGroup.transactions.length > 1 ? formatEvo2027SignedNumber(dateGroup.dailyTotal) : undefined}
                currency={summary.currency}
                dateSeparator
              />
              <div className={transactionGroupCardClassName(true)}>
                {(dateGroup.transactions as SpendingAnalyticsTransaction[]).map((transaction) => (
                  <div
                    key={transaction.id}
                    data-testid="evo-expense-transaction"
                    data-evo-expense-transaction-category={transaction.pfmCategory}
                  >
                    <AccountTransactionRow
                      transaction={transaction}
                      formattedAmount={formatEvo2027Number(Math.abs(transaction.amount))}
                      currency={summary.currency}
                      // Across a multi-account scope the source account is what tells two identical rows apart.
                      detailsLabel={transaction.sourceProductName}
                      categoryIconVariant="category-circle"
                      positiveAmountClassName="text-[var(--uc-green-olive)]"
                      evo2027
                      showDate={false}
                      compact={dateGroup.transactions.length === 1}
                      onClick={() => onTransactionClick?.(transaction)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-[12px] overflow-hidden rounded-[8px] bg-[var(--uc-surface)]">
          <p className="px-[16px] py-[24px] text-[16px] leading-[22px] text-[var(--uc-text-muted)]">No transactions match this category.</p>
        </div>
      )}
    </section>
  );
}

function ExpenseSplitSelector({
  mode,
  availableModes,
  onModeChange,
  onAddTransaction,
}: {
  mode: ExpenseSplitMode;
  availableModes: readonly ExpenseSplitMode[];
  onModeChange: (mode: ExpenseSplitMode) => void;
  onAddTransaction?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const activeLabel = EXPENSE_SPLIT_MODES.find((entry) => entry.mode === mode)?.label ?? '';

  return (
    <div
      className="relative z-10"
      data-evo-expense-split={mode}
      onKeyDown={(event) => { if (event.key === 'Escape') setIsOpen(false); }}
    >
      {/* Tapping anywhere else dismisses the menu, the way the sheets in this app do. */}
      {isOpen ? <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} /> : null}

      <div className="flex items-center justify-between gap-[12px]">
        <div className="relative">
          <p className="text-[16px] leading-[20px] text-[var(--uc-text-muted)]">Transactions split by</p>
          <button
            type="button"
            aria-label="Select how transactions are split"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            className="-ml-[4px] mt-[2px] inline-flex min-h-[32px] items-center gap-[6px] rounded-full px-[4px] text-[18px] font-bold leading-[24px] text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
            onClick={() => setIsOpen((open) => !open)}
          >
            {activeLabel}
            <AppIcon
              name="chevron-down-wide"
              size={18}
              color="currentColor"
              className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          {isOpen ? (
            <div
              role="listbox"
              aria-label="Transaction split"
              className="absolute left-0 top-[calc(100%+6px)] z-20 w-[220px] max-w-[calc(100vw-32px)] overflow-hidden rounded-[8px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] shadow-[0_8px_20px_rgb(var(--uc-shadow-rgb)/0.16)]"
            >
              {EXPENSE_SPLIT_MODES.filter((entry) => availableModes.includes(entry.mode)).map((entry, index) => {
                const selected = entry.mode === mode;

                return (
                  <button
                    key={entry.mode}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`flex min-h-[48px] w-full items-center gap-[12px] px-[12px] text-left text-[16px] leading-[20px] text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-focus-ring)] ${
                      index > 0 ? 'border-t-[0.5px] border-[var(--uc-border-muted)]' : ''
                    } ${selected ? 'font-bold' : ''}`}
                    onClick={() => {
                      onModeChange(entry.mode);
                      setIsOpen(false);
                    }}
                  >
                    <span className="min-w-0 flex-1 truncate">{entry.label}</span>
                    {/* Same radio affordance the scope sheet uses, so selection reads the same everywhere. */}
                    <AppIcon
                      name={selected ? 'radio-selected' : 'radio-unselected'}
                      size={20}
                      color={selected ? 'var(--uc-action)' : 'var(--uc-icon-muted)'}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          aria-label="Add transaction"
          data-evo-add-transaction
          onClick={onAddTransaction}
          className="inline-flex min-h-[32px] shrink-0 items-center gap-[6px] rounded-full px-[8px] text-[14px] font-bold leading-[18px] text-[var(--uc-action)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
        >
          <AppIcon name="add-money" size={18} color="currentColor" aria-hidden="true" />
          <span>Add transaction</span>
        </button>
      </div>
    </div>
  );
}

function ExpenseBreakdownRowIcon({ row }: { row: ExpenseBreakdownRow }) {
  if (row.category) {
    return <PfmCategoryIcon category={row.category} size={32} variant="category-circle" />;
  }

  if (row.currency) {
    return <CurrencyBadge currency={row.currency} size={32} />;
  }

  // A merchant row leads exactly as the statement does: the brand mark for a
  // card purchase, the counterparty initials for a payment, the account pair
  // for an own transfer, and the category icon only when there is no party.
  if (row.sample) {
    return <TransactionAvatar transaction={row.sample} size={32} />;
  }

  return <PfmCategoryIcon category="Uncategorized" size={32} variant="category-circle" />;
}

function ExpenseBreakdownList({
  mode,
  availableModes,
  onModeChange,
  rows,
  total,
  country,
  currency,
  onOpenRow,
  onAddTransaction,
}: {
  mode: ExpenseSplitMode;
  availableModes: readonly ExpenseSplitMode[];
  onModeChange: (mode: ExpenseSplitMode) => void;
  rows: readonly ExpenseBreakdownRow[];
  total: number;
  country: CountryId;
  currency: string;
  onOpenRow: (row: ExpenseBreakdownRow) => void;
  onAddTransaction?: () => void;
}) {
  return (
    <section aria-label="Expense breakdown" className="mt-[28px] pb-[20px]">
      <ExpenseSplitSelector mode={mode} availableModes={availableModes} onModeChange={onModeChange} onAddTransaction={onAddTransaction} />

      <div className="mt-[12px] overflow-hidden rounded-[8px] bg-[var(--uc-surface)] shadow-[0_1px_1px_rgb(var(--uc-shadow-rgb)/0.04)]">
        <div className="divide-y divide-[var(--uc-border-muted)]">
          {rows.length > 0 ? rows.map((row) => {
            const percentage = total > 0 ? Math.round((row.total / total) * 100) : 0;

            return (
              <button
                key={row.key}
                type="button"
                aria-label={`Open ${row.label} transactions`}
                data-evo-expense-breakdown-row={row.key}
                className="flex min-h-[80px] w-full items-center gap-[12px] px-[16px] py-[16px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
                onClick={() => onOpenRow(row)}
              >
                <ExpenseBreakdownRowIcon row={row} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[18px] font-bold leading-[22px] text-[var(--uc-text)]">{row.label}</span>
                  <span className="mt-[2px] block text-[16px] leading-[18px] text-[var(--uc-text-muted)]">
                    {row.transactionCount} {row.transactionCount === 1 ? 'transaction' : 'transactions'}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <FormattedAmount amount={row.total} country={country} currency={currency} compact className="justify-end" />
                  <span className="mt-[2px] block text-[16px] leading-[18px] text-[var(--uc-text-muted)]">{percentage}%</span>
                </span>
              </button>
            );
          }) : (
            <p className="px-[16px] py-[24px] text-[16px] leading-[22px] text-[var(--uc-text-muted)]">Nothing to break down for this period.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function ExpenseBreakdownDetail({
  direction,
  row,
  subcategories,
  transactions,
  summary,
  country,
  scopeLabel,
  onOpenScope,
  periods,
  selectedPeriodKey,
  onPeriodChange,
  periodTitleOverride,
  excludedSubcategories,
  onToggleSubcategory,
  onTransactionClick,
}: {
  direction: AnalyticsDirection;
  row: ExpenseBreakdownRow;
  subcategories: readonly SpendingSubcategorySummary[];
  transactions: readonly SpendingAnalyticsTransaction[];
  summary: SpendingAnalyticsSummary;
  country: CountryId;
  scopeLabel: string;
  onOpenScope: () => void;
  periods: readonly SpendingAnalyticsPeriod[];
  selectedPeriodKey: string;
  onPeriodChange: (periodKey: string) => void;
  periodTitleOverride?: string | null;
  excludedSubcategories: ReadonlySet<string>;
  onToggleSubcategory: (subcategoryLabel: string) => void;
  onTransactionClick?: (transaction: SpendingAnalyticsTransaction) => void;
}) {
  const { activeIndex, swipeHandlers } = usePeriodSwipe(periods, selectedPeriodKey, onPeriodChange);
  const total = transactions.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  const flowWord = direction === 'income' ? 'income' : 'expenses';
  const activeSubcategories = subcategories.filter((subcategory) => !excludedSubcategories.has(subcategory.label));
  // The list caption names exactly what the bubbles left switched on.
  const listLabel = activeSubcategories.length === subcategories.length
    ? `All ${row.label} ${flowWord}`
    : activeSubcategories.length === 1
      ? `${toSentenceCase(activeSubcategories[0]!.label)} ${flowWord}`
      : `${activeSubcategories.length} of ${subcategories.length} subcategories`;

  return (
    <div data-evo-analytics-breakdown={row.key}>
      {/* The same scope and period controls the analysis page carries, minus the chart toggle. */}
      <ExpensePeriodNavigator
        scopeLabel={scopeLabel}
        onOpenScope={onOpenScope}
        periods={periods}
        selectedPeriodKey={selectedPeriodKey}
        onPeriodChange={onPeriodChange}
        titleOverride={periodTitleOverride}
      />

      {subcategories.length > 0 ? (
        // Swiping the bubbles walks periods, exactly as swiping the chart does one page up.
        <section aria-label="Subcategories" className="mt-[8px] touch-pan-y select-none pt-[8px]" {...swipeHandlers}>
          {/* The bubbles the PFM category screen uses — sized by share, tap one to drop it from the list. */}
          <PfmCategoryBubbleChart
            subcategories={subcategories}
            colorVar={getPfmCategory(row.category).colorVar}
            country={country}
            currency={summary.currency}
            ariaLabel="Subcategory breakdown"
            excludeAriaLabel="Filter out subcategory"
            includeAriaLabel="Include subcategory"
            inactiveSubcategories={excludedSubcategories}
            onToggle={onToggleSubcategory}
            showTotals
            // Every bubble may be switched off here: the list simply comes back empty.
            minActive={0}
            // No carousel panel to fill, so the rows of bubbles set the height themselves.
            height="auto"
          />

          <AccountCarouselIndicator
            count={periods.length}
            activeIndex={activeIndex}
            itemLabel="period"
            withBackdropBlur={false}
            onSelect={(index) => {
              const period = periods[index];
              if (period) onPeriodChange(period.key);
            }}
          />
        </section>
      ) : null}

      <ExpenseTransactionList
        transactions={transactions}
        summary={summary}
        country={country}
        scopeLabel={listLabel}
        total={total}
        onTransactionClick={onTransactionClick}
      />
    </div>
  );
}
/** One statement card per period. Swiping the rail *is* how the user changes month. */
function SpendingMonthCard({
  summary,
  country,
  amountsHidden,
  periodLabel,
  onOpenIncome,
  onOpenExpenses,
  dragHandlers,
}: {
  summary: SpendingAnalyticsSummary;
  country: CountryId;
  amountsHidden: boolean;
  periodLabel: string;
  onOpenIncome: () => void;
  onOpenExpenses: () => void;
  dragHandlers?: ReturnType<typeof useDragCarousel>['dragHandlers'];
}) {
  void country;
  const format = (value: number) => maskFormattedAmount(formatEvo2027Number(Math.abs(value)), amountsHidden);
  const spent = splitAmount(format(summary.spendingTotal));
  const earned = splitAmount(format(summary.incomeTotal));
  const keptShare = summary.incomeTotal > 0 && summary.netTotal > 0
    ? Math.round((summary.netTotal / summary.incomeTotal) * 100)
    : null;
  const overspent = summary.incomeTotal > 0 && summary.netTotal < 0;

  return (
    <section
      {...dragHandlers}
      data-evo-analytics-summary-hero
      data-evo-analytics-period-card={summary.periodKey}
      // Narrower than the rail so the neighbouring months peek in at both edges — that peek is
      // the swipe affordance. Plain surface: colour belongs to the data, not the chrome.
      className="flex w-[calc(100%-44px)] shrink-0 flex-col gap-[12px] overflow-hidden rounded-[8px] bg-[var(--uc-surface)] p-[16px] text-[var(--uc-text)]"
      style={{ boxShadow: CAROUSEL_CARD_SHADOW }}
    >
      <div>
        <p className="text-[18px] font-bold uppercase leading-[22px] tracking-[0.05em] text-[var(--uc-action)]">
          {periodLabel}
        </p>
        {/* Both flows sit above the rule: the pair is the story, neither figure tells it alone. */}
        <div className="mt-[8px] grid grid-cols-2 gap-[12px]">
          <button
            type="button"
            data-evo-analytics-open-expenses
            onClick={onOpenExpenses}
            className="min-w-0 rounded-[8px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-surface)]"
          >
            <span className="flex items-center gap-[6px] text-[16px] font-bold leading-[20px] text-[color-mix(in_srgb,var(--uc-text)_72%,transparent)]">
              <CashFlowDot flow="out" />
              Money out
            </span>
            <span className="mt-[2px] flex items-baseline gap-[2px] whitespace-nowrap">
              <span className="text-[20px] font-bold leading-[24px] tracking-[-0.02em]">{spent.integer}</span>
              <span className="text-[14px] font-bold leading-[18px]">{spent.separator}{spent.decimals} {summary.currency}</span>
            </span>
          </button>

          <button
            type="button"
            data-evo-analytics-open-income
            onClick={onOpenIncome}
            className="min-w-0 rounded-[8px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-surface)]"
          >
            <span className="flex items-center gap-[6px] text-[16px] font-bold leading-[20px] text-[color-mix(in_srgb,var(--uc-text)_72%,transparent)]">
              <CashFlowDot flow="in" />
              Money in
            </span>
            <span className="mt-[2px] flex items-baseline gap-[2px] whitespace-nowrap">
              <span className="text-[20px] font-bold leading-[24px] tracking-[-0.02em]">{earned.integer}</span>
              <span className="text-[14px] font-bold leading-[18px]">{earned.separator}{earned.decimals} {summary.currency}</span>
            </span>
          </button>
        </div>
      </div>

      <div className="border-t border-[color-mix(in_srgb,var(--uc-text)_16%,transparent)] pt-[10px]">
        <div
          data-evo-analytics-summary-net
          className="flex items-start gap-[8px]"
        >
          <TrendBadge direction={summary.netTotal >= 0 ? 'up' : 'down'} size={16} compact />
          <div className="min-w-0 flex-1">
            <p data-evo-analytics-summary-net-label className="text-[16px] font-bold leading-[20px] text-[color-mix(in_srgb,var(--uc-text)_72%,transparent)]">
              Net cashflow
            </p>
            <p className="mt-[2px] truncate text-[20px] font-bold leading-[24px]">
              {summary.netTotal >= 0 ? '+' : '−'}{format(summary.netTotal)} {summary.currency}
            </p>
            <p className="mt-[4px] text-[14px] leading-[18px] text-[color-mix(in_srgb,var(--uc-text)_72%,transparent)]">
              {keptShare !== null
                ? `You kept ${keptShare}% of what came in`
                : overspent
                  ? 'More went out than came in'
                  : 'No income recorded in this period'}
            </p>
          </div>
        </div>

        <CashFlowBars
          className="mt-[12px]"
          incomeTotal={summary.incomeTotal}
          spendingTotal={summary.spendingTotal}
          barDataAttribute="data-evo-analytics-flow-bar"
          barsDataAttribute="data-evo-analytics-flow-bars"
        />
      </div>
    </section>
  );
}

/**
 * Period navigation is the carousel itself — the same rail + dot indicator the baseline uses
 * to swipe between accounts (AccountDetailScreen.tsx:575, App2027TransformationHome.tsx:439).
 * Swiping right walks back through the months the timeline holds: this year and last.
 */
function SpendingMonthCarousel({
  periods,
  summariesByPeriodKey,
  selectedPeriodKey,
  onPeriodChange,
  country,
  amountsHidden,
  onOpenIncome,
  onOpenExpenses,
}: {
  periods: readonly SpendingAnalyticsPeriod[];
  summariesByPeriodKey: Record<string, SpendingAnalyticsSummary>;
  selectedPeriodKey: string;
  onPeriodChange: (periodKey: string) => void;
  country: CountryId;
  amountsHidden: boolean;
  onOpenIncome: () => void;
  onOpenExpenses: () => void;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const snapTimeoutRef = useRef<number | null>(null);
  const activeIndex = Math.max(periods.findIndex((period) => period.key === selectedPeriodKey), 0);

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const rail = railRef.current;
    const item = rail?.firstElementChild as HTMLElement | null;
    if (!rail || !item) return;

    const gap = Number.parseFloat(getComputedStyle(rail).gap || '0');
    const nextIndex = Math.max(0, Math.min(index, periods.length - 1));
    const left = nextIndex * (item.offsetWidth + gap);

    if (typeof rail.scrollTo === 'function') rail.scrollTo({ left, behavior });
    else rail.scrollLeft = left;

    const nextPeriod = periods[nextIndex];
    if (nextPeriod && nextPeriod.key !== selectedPeriodKey) onPeriodChange(nextPeriod.key);
  }, [onPeriodChange, periods, selectedPeriodKey]);

  const settle = useCallback(() => {
    const rail = railRef.current;
    const item = rail?.firstElementChild as HTMLElement | null;
    if (!rail || !item) return;

    const gap = Number.parseFloat(getComputedStyle(rail).gap || '0');
    scrollToIndex(Math.round(rail.scrollLeft / (item.offsetWidth + gap)));
  }, [scrollToIndex]);

  const clearSnapTimeout = () => {
    if (snapTimeoutRef.current === null) return;
    window.clearTimeout(snapTimeoutRef.current);
    snapTimeoutRef.current = null;
  };

  const { dragHandlers, isDragging, isPressActiveRef } = useDragCarousel({
    carouselRef: railRef,
    enabled: periods.length > 1,
    onSettle: settle,
  });

  // Jump, never animate, when the set of periods changes under us.
  useEffect(() => {
    const rail = railRef.current;
    const item = rail?.firstElementChild as HTMLElement | null;
    if (!rail || !item) return;

    const gap = Number.parseFloat(getComputedStyle(rail).gap || '0');
    rail.scrollLeft = activeIndex * (item.offsetWidth + gap);
    // Only when the set of periods changes — not on every swipe.
  }, [periods.length]);

  useEffect(() => () => clearSnapTimeout(), []);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const rail = event.currentTarget;
    const item = rail.firstElementChild as HTMLElement | null;
    if (!item) return;

    if (isPressActiveRef.current) return;
    clearSnapTimeout();
    snapTimeoutRef.current = window.setTimeout(settle, 120);
  };

  if (periods.length === 0) return null;

  return (
    <section aria-label="Monthly interval" data-evo-analytics-period-carousel>
      <div
        ref={railRef}
        role="region"
        aria-label="Monthly interval"
        tabIndex={0}
        onScroll={handleScroll}
        {...dragHandlers}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') { event.preventDefault(); scrollToIndex(activeIndex + 1); }
          if (event.key === 'ArrowLeft') { event.preventDefault(); scrollToIndex(activeIndex - 1); }
        }}
        // Bleeds to the device edges so the peeking neighbours are visible, while the first card
        // still starts on the page's 16px inset.
        className={`-mx-[16px] flex gap-[12px] overflow-x-auto overflow-y-visible overscroll-x-contain px-[16px] pt-[16px] pb-[34px] scrollbar-hide select-none touch-pan-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
      >
        {periods.map((period) => {
          const periodSummary = summariesByPeriodKey[period.key];
          if (!periodSummary) return null;

          return (
            <SpendingMonthCard
              key={period.key}
              summary={periodSummary}
              country={country}
              amountsHidden={amountsHidden}
              periodLabel={period.kind === 'year'
                ? `Total ${period.label}`
                : `${formatPeriodLabel(period.label)} ${period.year}`}
              onOpenIncome={onOpenIncome}
              onOpenExpenses={onOpenExpenses}
              dragHandlers={dragHandlers}
            />
          );
        })}
      </div>

      {periods.length > 1 ? (
        <div className="-mt-[16px] flex justify-center" aria-label="Monthly interval pages">
          <AccountCarouselIndicator count={periods.length} activeIndex={activeIndex} onSelect={scrollToIndex} itemLabel="month" />
        </div>
      ) : null}
    </section>
  );
}

function SpendingScopeSheet({
  scopes,
  selectedScopeId,
  onScopeChange,
  onClose,
}: {
  scopes: readonly AnalyticsScope[];
  selectedScopeId: string;
  onScopeChange: (scopeId: string) => void;
  onClose: () => void;
}) {
  return (
    <BottomSheet title="Show data for" onClose={onClose}>
      <div data-evo-analytics-scope-sheet className="overflow-hidden rounded-[8px] bg-[var(--uc-surface)]">
        {scopes.map((scope, index) => {
          const selected = scope.id === selectedScopeId;

          return (
            <button
              key={scope.id}
              type="button"
              role="option"
              aria-selected={selected}
              data-evo-analytics-scope-option={scope.id}
              onClick={() => {
                onScopeChange(scope.id);
                onClose();
              }}
              className={`flex min-h-[64px] w-full items-center gap-[12px] px-[16px] py-[12px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-action)] ${
                index > 0 ? 'border-t-[0.5px] border-[var(--uc-border-muted)]' : ''
              }`}
            >
              <span className="min-w-0 flex-1 truncate text-[16px] font-medium leading-[20px] text-[var(--uc-text)]">
                {scope.label}
              </span>
              <AppIcon
                name={selected ? 'radio-selected' : 'radio-unselected'}
                size={24}
                color={selected ? 'var(--uc-action)' : 'var(--uc-icon-muted)'}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}

/**
 * The block that fills the void and is the answer rather than the door: the three biggest
 * categories with their share, one tap from their transactions.
 */
function SpendingTopCategories({
  title,
  ariaLabel,
  sectionDataAttribute,
  rowDataAttribute = 'data-evo-analytics-top-category',
  seeAllDataAttribute = 'data-evo-analytics-see-all',
  rows,
  total,
  country,
  currency,
  amountsHidden,
  onOpenRow,
  onSeeAll,
}: {
  title: string;
  ariaLabel: string;
  sectionDataAttribute: string;
  rowDataAttribute?: string;
  seeAllDataAttribute?: string;
  rows: readonly ExpenseBreakdownRow[];
  total: number;
  country: CountryId;
  currency: string;
  amountsHidden: boolean;
  onOpenRow: (row: ExpenseBreakdownRow) => void;
  onSeeAll: () => void;
}) {
  void country;
  if (rows.length === 0) return null;

  return (
    <section aria-label={ariaLabel} {...{ [sectionDataAttribute]: true }}>
      <div>
        <h2 className="uc-type-l1 text-[var(--uc-text)]">{title}</h2>
      </div>

      <div className="mt-[12px] overflow-hidden rounded-[8px] bg-[var(--uc-surface)] pb-[8px] shadow-[0_1px_1px_rgb(var(--uc-shadow-rgb)/0.04)]">
        {rows.map((row, index) => {
          const share = total > 0 ? Math.round((row.total / total) * 100) : 0;
          const amount = splitAmount(maskFormattedAmount(formatEvo2027Number(row.total), amountsHidden));

          return (
            <button
              key={row.key}
              type="button"
              aria-label={`Open ${row.label} transactions`}
              {...{ [rowDataAttribute]: row.key }}
              onClick={() => onOpenRow(row)}
              className={`flex min-h-[80px] w-full items-center gap-[12px] px-[16px] py-[16px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-action)] ${
                index > 0 ? 'border-t-[0.5px] border-[var(--uc-border-muted)]' : ''
              }`}
            >
              <ExpenseBreakdownRowIcon row={row} />

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[18px] font-bold leading-[22px] text-[var(--uc-text)]">{row.label}</span>
                <span className="mt-[2px] block text-[16px] leading-[18px] text-[var(--uc-text-muted)]">
                  {row.transactionCount} {row.transactionCount === 1 ? 'transaction' : 'transactions'}
                </span>
              </span>

              <span className="shrink-0 text-right">
                <p className="inline-flex items-baseline justify-end whitespace-nowrap text-[var(--uc-text)]">
                  <span className="text-[18px] font-bold leading-[22px] tracking-[-0.02em]">{amount.integer}</span>
                  <span className="text-[14px] font-normal leading-[18px]">{amount.separator}{amount.decimals} {currency}</span>
                </p>
                <span className="mt-[2px] block text-[16px] leading-[18px] text-[var(--uc-text-muted)]">{share}%</span>
              </span>

            </button>
          );
        })}

        <button
          type="button"
          {...{ [seeAllDataAttribute]: true }}
          onClick={onSeeAll}
          className="group relative z-10 mx-auto mt-[3px] flex min-h-[44px] w-fit items-center justify-center gap-[4px] rounded-full px-[14px] text-[14px] font-bold uppercase leading-[16px] tracking-[0] text-[var(--uc-action)] transition-[background-color,transform] duration-200 active:scale-[0.98] active:bg-[color-mix(in_srgb,var(--uc-action)_10%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] motion-reduce:transition-none"
        >
          See all categories
          <svg
            aria-hidden="true"
            className="shrink-0 transition-transform duration-200 motion-reduce:transition-none"
            data-evo-analytics-see-all-chevron
            fill="none"
            height="16"
            viewBox="0 0 16 16"
            width="16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clipRule="evenodd"
              d="M4.77635 0.675781C3.74642 1.65524 3.74642 3.24474 4.77635 4.22511L8.50577 8.00911L4.77635 11.7931C3.74642 12.7735 3.74643 14.3621 4.77635 15.3424L12.0039 8.00911L4.77635 0.675781Z"
              fill="#007A91"
              fillRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}

function ExpensesDetail({
  direction,
  segments,
  scopeLabel,
  onOpenScope,
  periods,
  selectedPeriodKey,
  onPeriodChange,
  periodTitleOverride,
  summary,
  country,
  selectedKeys,
  onToggleSegment,
  onClearSelection,
  chartMode,
  onChartModeChange,
  bars,
  selectedBucketKey,
  onToggleBucket,
  filterLabel,
  headerLabel,
  headerAmount,
  splitMode,
  availableSplitModes,
  onSplitModeChange,
  breakdownRows,
  breakdownTotal,
  onOpenBreakdownRow,
  onAddTransaction,
}: {
  direction: AnalyticsDirection;
  segments: readonly ExpenseDonutSegment[];
  scopeLabel: string;
  onOpenScope: () => void;
  periods: readonly SpendingAnalyticsPeriod[];
  selectedPeriodKey: string;
  onPeriodChange: (periodKey: string) => void;
  periodTitleOverride?: string | null;
  summary: SpendingAnalyticsSummary;
  country: CountryId;
  selectedKeys: ReadonlySet<ExpenseDonutCategory>;
  onToggleSegment: (key: ExpenseDonutCategory) => void;
  onClearSelection: () => void;
  chartMode: ExpenseChartMode;
  onChartModeChange: (mode: ExpenseChartMode) => void;
  bars: readonly ExpenseBar[];
  selectedBucketKey: string | null;
  onToggleBucket: (key: string) => void;
  filterLabel: string | null;
  headerLabel: string;
  headerAmount: number;
  splitMode: ExpenseSplitMode;
  availableSplitModes: readonly ExpenseSplitMode[];
  onSplitModeChange: (mode: ExpenseSplitMode) => void;
  breakdownRows: readonly ExpenseBreakdownRow[];
  breakdownTotal: number;
  onOpenBreakdownRow: (row: ExpenseBreakdownRow) => void;
  onAddTransaction?: () => void;
}) {
  return (
    <div data-evo-analytics-expenses data-evo-analytics-direction={direction}>
      <ExpensePeriodNavigator
        scopeLabel={scopeLabel}
        onOpenScope={onOpenScope}
        periods={periods}
        selectedPeriodKey={selectedPeriodKey}
        onPeriodChange={onPeriodChange}
        titleOverride={periodTitleOverride}
        trailing={<ExpenseChartModeToggle mode={chartMode} onModeChange={onChartModeChange} />}
      />

      <ExpenseChartPanel
        direction={direction}
        segments={segments}
        selectedKeys={selectedKeys}
        onToggleSegment={onToggleSegment}
        bars={bars}
        selectedBucketKey={selectedBucketKey}
        onToggleBucket={onToggleBucket}
        mode={chartMode}
        headerLabel={headerLabel}
        headerAmount={headerAmount}
        country={country}
        currency={summary.currency}
        periods={periods}
        selectedPeriodKey={selectedPeriodKey}
        onPeriodChange={onPeriodChange}
      />

      {filterLabel ? (
        <div className="mt-[16px] flex items-center justify-between gap-[8px] rounded-[8px] bg-[var(--uc-neutral-200)] px-[12px] py-[10px]">
          <p className="min-w-0 truncate text-[16px] leading-[20px] text-[var(--uc-text)]">Filtered by <strong className="font-bold">{filterLabel}</strong></p>
          <button
            type="button"
            aria-label={`Clear ${direction} filters`}
            className="shrink-0 rounded-full px-[6px] py-[2px] text-[14px] font-bold leading-[18px] text-[var(--uc-action)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
            onClick={onClearSelection}
          >
            Clear
          </button>
        </div>
      ) : null}

      <ExpenseBreakdownList
        mode={splitMode}
        availableModes={availableSplitModes}
        onModeChange={onSplitModeChange}
        rows={breakdownRows}
        total={breakdownTotal}
        country={country}
        currency={summary.currency}
        onOpenRow={onOpenBreakdownRow}
        onAddTransaction={onAddTransaction}
      />
    </div>
  );
}

export default function Evo2027AnalyticsScreen({
  onHomeClick,
  onMessagesClick,
  onPaymentsClick,
  onProductsClick,
  onMoreClick,
  transactionCategoryOverrides = {},
  onTransactionClick,
  onAddTransaction,
  initialScopeId,
  initialDirection,
}: Evo2027AnalyticsScreenProps) {
  const country = useCountry();
  const { amountsHidden } = useDemo();
  const { categories } = useProducts();
  const products = useMemo(() => categories.flatMap((category) => category.products), [categories]);
  const currentAccounts = useMemo(
    () => products.filter((product) => product.type === 'current_account'),
    [products],
  );
  const scopes = useMemo<AnalyticsScope[]>(() => {
    const selectableProducts = currentAccounts.length > 0 ? currentAccounts : products;
    return [
      { id: 'all-accounts', label: 'All accounts', products: selectableProducts },
      ...currentAccounts.map((account) => ({ id: account.id, label: account.name, products: [account] })),
    ];
  }, [currentAccounts, products]);
  const initialScope = scopes.find((scope) => scope.id === (initialScopeId ?? 'all-accounts')) ?? scopes[0];
  const initialPeriodKey = useMemo(
    () => createSpendingAnalyticsTimeline(
      country,
      initialScope?.products ?? [],
      transactionCategoryOverrides,
    ).activePeriodKey,
    [country, initialScope?.products, transactionCategoryOverrides],
  );
  const [analyticsState, dispatchAnalytics] = useReducer(
    evoAnalyticsReducer,
    createEvoAnalyticsState(initialScopeId, initialDirection, initialPeriodKey),
  );
  const {
    selectedScopeId,
    view,
    analysisDirection,
    scopeSheetOpen,
    expenseSplitMode,
    selectedSplitKeys,
    expenseChartMode,
    selectedBucketKey,
    selectedPeriodKey,
  } = analyticsState;
  const [contentScrollTop, setContentScrollTop] = useState(0);
  const contentRef = useRef<HTMLElement>(null);
  const [scrollSlack, setScrollSlack] = useState(0);
  const headerReleaseRef = useRef(0);
  const [openBreakdownRow, setOpenBreakdownRow] = useState<ExpenseBreakdownRow | null>(null);
  const [excludedSubcategories, setExcludedSubcategories] = useState<ReadonlySet<string>>(() => new Set());
  const activeScope = scopes.find((scope) => scope.id === selectedScopeId) ?? scopes[0];
  const timeline = useMemo(
    () => createSpendingAnalyticsTimeline(country, activeScope?.products ?? [], transactionCategoryOverrides),
    [activeScope?.products, country, transactionCategoryOverrides],
  );
  const monthlyPeriods = useMemo(
    () => timeline.periods.filter((period) => period.kind === 'month'),
    [timeline.periods],
  );
  useEffect(() => {
    if (!scopes.some((scope) => scope.id === selectedScopeId)) {
      dispatchAnalytics({ type: 'set-field', field: 'selectedScopeId', value: 'all-accounts' });
    }
  }, [scopes, selectedScopeId]);

  useEffect(() => {
    dispatchAnalytics({ type: 'set-field', field: 'selectedPeriodKey', value: timeline.activePeriodKey });
  }, [timeline.activePeriodKey]);

  const firstPeriod = monthlyPeriods[0];
  const summary =
    timeline.summariesByPeriodKey[selectedPeriodKey] ??
    timeline.summariesByPeriodKey[timeline.activePeriodKey] ??
    (firstPeriod ? timeline.summariesByPeriodKey[firstPeriod.key] : undefined) ??
    createSpendingAnalytics(country, activeScope?.products ?? [], undefined, transactionCategoryOverrides);
  const currencyByProductId = useMemo(
    () => new Map(products.map((product) => [product.id, product.currency])),
    [products],
  );
  const scopeCurrencies = useMemo(
    () => new Set((activeScope?.products ?? []).map((product) => product.currency)),
    [activeScope?.products],
  );
  // Splitting by currency only tells the user something when the scope actually mixes currencies —
  // on a single account the currency is implicit.
  const availableSplitModes = useMemo<ExpenseSplitMode[]>(
    () => (selectedScopeId === 'all-accounts' && scopeCurrencies.size > 1
      ? ['categories', 'merchants', 'currencies']
      : ['categories', 'merchants']),
    [scopeCurrencies.size, selectedScopeId],
  );
  const activeSplitMode = availableSplitModes.includes(expenseSplitMode) ? expenseSplitMode : 'categories';
  const directionTransactions = useMemo(
    () => summary.sourceTransactions.filter((transaction) => (
      analysisDirection === 'income' ? transaction.amount > 0 : transaction.amount < 0
    )),
    [analysisDirection, summary.sourceTransactions],
  );
  // The ring is built on the whole period, so isolating one slice never makes the others vanish.
  const donutRows = useMemo(
    () => buildExpenseBreakdown(activeSplitMode, directionTransactions, currencyByProductId, summary.currency, ANALYTICS_LOCALE),
    [activeSplitMode, currencyByProductId, directionTransactions, summary.currency],
  );
  const donutSegments = useMemo(() => buildDonutSegments(donutRows), [donutRows]);
  const primarySplitKeys = useMemo(
    () => new Set(donutRows.slice(0, DONUT_CATEGORY_LIMIT).map((row) => row.key)),
    [donutRows],
  );
  const activeSplitSelection = useMemo(() => {
    const available = new Set(donutRows.map((row) => row.key));
    const hasOther = donutRows.length > DONUT_CATEGORY_LIMIT;
    return new Set(selectedSplitKeys.filter((key) => (
      key === EXPENSE_OTHER_CATEGORY ? hasOther : available.has(key)
    )));
  }, [donutRows, selectedSplitKeys]);
  const categoryFilteredExpenses = useMemo(
    () => directionTransactions.filter((transaction) => {
      if (activeSplitSelection.size === 0) return true;

      const key = getExpenseSplitKey(transaction, activeSplitMode, currencyByProductId, summary.currency);
      return activeSplitSelection.has(key)
        || (activeSplitSelection.has(EXPENSE_OTHER_CATEGORY) && !primarySplitKeys.has(key));
    }),
    [activeSplitMode, activeSplitSelection, currencyByProductId, directionTransactions, primarySplitKeys, summary.currency],
  );
  const expenseBars = useMemo(
    () => buildExpenseBars(summary, categoryFilteredExpenses),
    [categoryFilteredExpenses, summary],
  );
  const activeBucketKey = selectedBucketKey && expenseBars.some((bar) => bar.key === selectedBucketKey)
    ? selectedBucketKey
    : null;
  const visibleExpenses = useMemo(
    () => categoryFilteredExpenses.filter((transaction) => (
      !activeBucketKey || getExpenseBucketKey(transaction, summary.periodKind) === activeBucketKey
    )),
    [activeBucketKey, categoryFilteredExpenses, summary.periodKind],
  );
  const expenseSelectionLabels = Array.from(activeSplitSelection).map((key) => (
    key === EXPENSE_OTHER_CATEGORY ? EXPENSE_OTHER_CATEGORY : donutRows.find((row) => row.key === key)?.label ?? key
  ));
  const activeBucket = activeBucketKey
    ? expenseBars.find((entry) => entry.key === activeBucketKey) ?? null
    : null;
  const activeBucketLabel = activeBucket
    ? activeBucket.filterLabel ?? [activeBucket.caption, activeBucket.label].filter(Boolean).join(' ')
    : null;
  // The stepper is where the period is named, so an isolated slice renames it there.
  const activeBucketTitle = activeBucket?.filterTitle ?? activeBucketLabel;
  const expenseFilterLabel = [
    expenseSelectionLabels.length === 1
      ? expenseSelectionLabels[0]
      : expenseSelectionLabels.length > 1 ? `${expenseSelectionLabels.length} ${SPLIT_MODE_NOUNS[activeSplitMode]}` : null,
    activeBucketLabel,
  ].filter(Boolean).join(' · ') || null;
  const visibleExpensesTotal = visibleExpenses.reduce((total, transaction) => total + Math.abs(transaction.amount), 0);
  const expenseHeaderAmount = activeSplitSelection.size === 0 && !activeBucketKey
    ? analysisDirection === 'income' ? summary.incomeTotal : summary.spendingTotal
    : visibleExpensesTotal;
  // The chart headline names whatever the user has narrowed to, falling back to the period total.
  const expenseSelectionLabel = expenseSelectionLabels.length > 1
    ? `${expenseSelectionLabels.length} ${SPLIT_MODE_NOUNS[activeSplitMode]}`
    : expenseSelectionLabels[0] ?? (analysisDirection === 'income' ? 'Total income' : 'Total spent');
  const expenseHeaderLabel = expenseSelectionLabel;

  const breakdownRows = useMemo(
    () => buildExpenseBreakdown(activeSplitMode, visibleExpenses, currencyByProductId, summary.currency, ANALYTICS_LOCALE),
    [activeSplitMode, currencyByProductId, summary.currency, visibleExpenses],
  );
  const breakdownTotal = breakdownRows.reduce((total, row) => total + row.total, 0);
  const breakdownDetail = useMemo(() => {
    if (!openBreakdownRow) return null;

    const periodExpenses = summary.sourceTransactions.filter((transaction) => (
      (analysisDirection === 'income' ? transaction.amount > 0 : transaction.amount < 0)
      && (!activeBucketKey || getExpenseBucketKey(transaction, summary.periodKind) === activeBucketKey)
    ));
    const transactions = periodExpenses.filter((transaction) => {
      if (openBreakdownRow.category) return transaction.pfmCategory === openBreakdownRow.category;
      if (activeSplitMode === 'merchants') return transaction.label === openBreakdownRow.key;
      return (currencyByProductId.get(transaction.sourceProductId) ?? summary.currency) === openBreakdownRow.key;
    });
    const subcategories = openBreakdownRow.category
      ? createSpendingCategoryDetail(summary, openBreakdownRow.category, analysisDirection === 'income' ? 'in' : 'out').subcategories
      : [];

    return {
      // The bubbles always show every subcategory; switching one off only takes it out of the list.
      transactions: transactions.filter((transaction) => (
        !excludedSubcategories.has(getAnalyticsSubcategoryLabel(transaction))
      )),
      subcategories,
    };
  }, [activeBucketKey, activeSplitMode, analysisDirection, currencyByProductId, excludedSubcategories, openBreakdownRow, summary]);

  // Months oldest-to-newest, then the two year totals. The carousel rests on the most recent
  // month: swiping back walks earlier months, swiping forward reaches this year then last year.
  const overviewCarouselPeriods = useMemo(() => {
    const years = timeline.periods
      .filter((period) => period.kind === 'year')
      .sort((a, b) => Number(b.year) - Number(a.year))
      .slice(0, 2);

    return [...monthlyPeriods, ...years];
  }, [monthlyPeriods, timeline.periods]);
  const overviewTopCategories = useMemo<ExpenseBreakdownRow[]>(
    () => summary.moneyOutCategories.slice(0, OVERVIEW_CATEGORY_LIMIT).map((category) => ({
      key: category.category,
      label: getEvoAnalyticsCategoryDisplayLabel(category.category),
      total: category.total,
      transactionCount: category.transactionCount,
      category: category.category,
    })),
    [summary.moneyOutCategories],
  );
  const overviewTopIncomeCategories = useMemo<ExpenseBreakdownRow[]>(
    () => summary.moneyInCategories.slice(0, OVERVIEW_CATEGORY_LIMIT).map((category) => ({
      key: category.category,
      label: getEvoAnalyticsCategoryDisplayLabel(category.category),
      total: category.total,
      transactionCount: category.transactionCount,
      category: category.category,
    })),
    [summary.moneyInCategories],
  );
  // A page with less scroll than the collapse distance strands the title half-faded, which reads as
  // flicker. Pad the bottom until the title can always finish its trip into the header.
  useEffect(() => {
    const element = contentRef.current;
    const content = element?.firstElementChild;
    if (!element || !content) return;

    // Collapsing unmounts the large title, which takes its height out of the scroll. Without room
    // for both, the collapse undoes the very scroll that triggered it and the title flickers — so
    // the reservation is kept once measured, including while the title is away.
    headerReleaseRef.current = 0;

    const measure = () => {
      const largeTitle = view === 'overview' ? null : element.previousElementSibling;
      if (largeTitle?.querySelector('h1.uc-type-h1')) {
        headerReleaseRef.current = (largeTitle as HTMLElement).offsetHeight;
      }

      setScrollSlack((current) => {
        const naturalOverflow = element.scrollHeight - element.clientHeight - current;
        // A page that does not scroll at all keeps its large title and never flickers; only the
        // pages caught between the two states need the extra room.
        const target = HEADER_COLLAPSE_DISTANCE + HEADER_COLLAPSE_MARGIN + headerReleaseRef.current;
        const needed = naturalOverflow > 0 ? Math.max(0, target - naturalOverflow) : 0;
        return Math.abs(needed - current) < 1 ? current : needed;
      });
    };

    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, [view, openBreakdownRow?.key]);
  // A subcategory filter only makes sense for the category it was picked in.
  useEffect(() => {
    setExcludedSubcategories(new Set());
  }, [analysisDirection, openBreakdownRow?.key, selectedPeriodKey]);
  const handleToggleSubcategory = (subcategoryLabel: string) => {
    setExcludedSubcategories((current) => {
      const next = new Set(current);
      if (next.has(subcategoryLabel)) next.delete(subcategoryLabel);
      else next.add(subcategoryLabel);
      return next;
    });
  };
  const handleOpenBreakdownRow = (row: ExpenseBreakdownRow, direction: AnalyticsDirection = 'expense') => {
    setContentScrollTop(0);
    setOpenBreakdownRow(row);
    dispatchAnalytics({
      type: 'open-breakdown',
      from: view === 'overview' ? 'overview' : 'analysis',
      direction,
    });
  };
  const handleBackFromBreakdown = () => {
    setContentScrollTop(0);
    setOpenBreakdownRow(null);
    dispatchAnalytics({ type: 'close-breakdown' });
  };

  const openAnalysis = (direction: AnalyticsDirection) => {
    setContentScrollTop(0);
    setOpenBreakdownRow(null);
    dispatchAnalytics({ type: 'open-analysis', direction });
  };

  const toggleExpenseSegment = (key: ExpenseDonutCategory) => {
    dispatchAnalytics({ type: 'toggle-segment', key });
  };
  const clearExpenseSelection = () => {
    dispatchAnalytics({ type: 'clear-selection' });
  };
  // Slices selected under one split mean nothing under the next, so switching modes starts clean.
  const changeSplitMode = (mode: ExpenseSplitMode) => {
    dispatchAnalytics({ type: 'change-split-mode', mode });
  };
  const toggleExpenseBucket = (key: string) => {
    dispatchAnalytics({ type: 'toggle-bucket', key });
  };
  const handleBackToOverview = () => {
    setContentScrollTop(0);
    dispatchAnalytics({ type: 'back-overview' });
    setOpenBreakdownRow(null);

    // The overview and detail use the same period rail, so the current selection remains intact.
  };


  const handleTabChange = (tab: App2027PrimaryNavigationItem) => {
    if (tab === 'home') onHomeClick?.();
    if (tab === 'payments') onPaymentsClick?.();
    if (tab === 'products') onProductsClick?.();
    if (tab === 'more') onMoreClick?.();
  };
  const headerCollapseProgress = Math.min(1, contentScrollTop / HEADER_COLLAPSE_DISTANCE);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--uc-app-bg)] text-[var(--uc-text)]" data-evo-2027-analytics>
      <div className="h-[54px] shrink-0 bg-[var(--uc-app-bg)]" />
      {view === 'breakdown' && openBreakdownRow ? (
        <PageHeader
          title={openBreakdownRow.label}
          onBack={handleBackFromBreakdown}
          variant="gray"
          showHelp={false}
          compact
          collapsedTitleProgress={headerCollapseProgress}
          hideCollapsedTitleWhenHidden
          leadingVisual={<ExpenseBreakdownRowIcon row={openBreakdownRow} />}
        />
      ) : view === 'analysis' ? (
        <PageHeader
          title={analysisDirection === 'income' ? 'Income' : 'Expenses'}
          onBack={handleBackToOverview}
          variant="gray"
          showHelp={false}
          compact
          collapsedTitleProgress={headerCollapseProgress}
          hideCollapsedTitleWhenHidden
        />
      ) : (
        <AnalyticsHeader onMessagesClick={onMessagesClick} />
      )}

      <main
        ref={contentRef}
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-[16px] pb-[96px] scrollbar-hide"
        onScroll={(event) => setContentScrollTop(event.currentTarget.scrollTop)}
      >
        {view === 'breakdown' && openBreakdownRow && breakdownDetail ? (
          <ExpenseBreakdownDetail
            direction={analysisDirection}
            row={openBreakdownRow}
            subcategories={breakdownDetail.subcategories}
            transactions={breakdownDetail.transactions}
            summary={summary}
            country={country}
            scopeLabel={activeScope?.label ?? 'All accounts'}
            onOpenScope={() => dispatchAnalytics({ type: 'set-field', field: 'scopeSheetOpen', value: true })}
            periods={overviewCarouselPeriods}
            selectedPeriodKey={selectedPeriodKey}
            onPeriodChange={(periodKey) => {
              dispatchAnalytics({ type: 'select-period', periodKey });
            }}
            periodTitleOverride={activeBucketTitle}
            excludedSubcategories={excludedSubcategories}
            onToggleSubcategory={handleToggleSubcategory}
            onTransactionClick={onTransactionClick}
          />
        ) : view === 'analysis' ? (
          <ExpensesDetail
            direction={analysisDirection}
            segments={donutSegments}
            scopeLabel={activeScope?.label ?? 'All accounts'}
            onOpenScope={() => dispatchAnalytics({ type: 'set-field', field: 'scopeSheetOpen', value: true })}
            periods={overviewCarouselPeriods}
            selectedPeriodKey={selectedPeriodKey}
            onPeriodChange={(periodKey) => {
              dispatchAnalytics({ type: 'select-period', periodKey });
            }}
            periodTitleOverride={activeBucketTitle}
            summary={summary}
            country={country}
            selectedKeys={activeSplitSelection}
            onToggleSegment={toggleExpenseSegment}
            onClearSelection={clearExpenseSelection}
            chartMode={expenseChartMode}
            onChartModeChange={(value) => dispatchAnalytics({ type: 'set-field', field: 'expenseChartMode', value })}
            bars={expenseBars}
            selectedBucketKey={activeBucketKey}
            onToggleBucket={toggleExpenseBucket}
            filterLabel={expenseFilterLabel}
            headerLabel={expenseHeaderLabel}
            headerAmount={expenseHeaderAmount}
            splitMode={activeSplitMode}
            availableSplitModes={availableSplitModes}
            onSplitModeChange={changeSplitMode}
            breakdownRows={breakdownRows}
            breakdownTotal={breakdownTotal}
            onOpenBreakdownRow={handleOpenBreakdownRow}
            onAddTransaction={onAddTransaction}
          />
        ) : (
          <div
            data-evo-analytics-summary
            data-evo-analytics-scope={activeScope?.id ?? 'all-accounts'}
            className="flex min-w-0 flex-col gap-[28px]"
          >
            <div data-evo-analytics-overview-controls className="flex min-w-0 flex-col gap-[0px]">
              <button
                type="button"
                data-evo-analytics-scope-trigger
                aria-haspopup="dialog"
                onClick={() => dispatchAnalytics({ type: 'set-field', field: 'scopeSheetOpen', value: true })}
                className="-ml-[4px] inline-flex min-h-[32px] max-w-full items-center gap-[6px] self-start rounded-[8px] px-[4px] text-left text-[16px] font-bold leading-[20px] text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
              >
                <span className="truncate">{activeScope?.label ?? 'All accounts'}</span>
                <AppIcon name="chevron-down-wide" size={18} color="currentColor" aria-hidden="true" />
              </button>

              <SpendingMonthCarousel
                periods={overviewCarouselPeriods}
                summariesByPeriodKey={timeline.summariesByPeriodKey}
                selectedPeriodKey={selectedPeriodKey}
                onPeriodChange={(periodKey) => {
                  dispatchAnalytics({ type: 'select-period', periodKey });
                }}
                country={country}
                amountsHidden={amountsHidden}
                onOpenIncome={() => openAnalysis('income')}
                onOpenExpenses={() => openAnalysis('expense')}
              />
            </div>

            <SpendingTopCategories
              title="Money out"
              ariaLabel="Money out"
              sectionDataAttribute="data-evo-analytics-top-categories"
              rows={overviewTopCategories}
              total={summary.spendingTotal}
              country={country}
              currency={summary.currency}
              amountsHidden={amountsHidden}
              onOpenRow={handleOpenBreakdownRow}
              onSeeAll={() => openAnalysis('expense')}
            />

            <SpendingTopCategories
              title="Money in"
              ariaLabel="Money in categories"
              sectionDataAttribute="data-evo-analytics-money-in-categories"
              rowDataAttribute="data-evo-analytics-money-in-category"
              seeAllDataAttribute="data-evo-analytics-money-in-see-all"
              rows={overviewTopIncomeCategories}
              total={summary.incomeTotal}
              country={country}
              currency={summary.currency}
              amountsHidden={amountsHidden}
              onOpenRow={(row) => handleOpenBreakdownRow(row, 'income')}
              onSeeAll={() => openAnalysis('income')}
            />

          </div>
        )}

        <div aria-hidden="true" style={{ height: `${scrollSlack}px` }} data-evo-analytics-scroll-slack />
      </main>

      {/*
        Same dock as home, attribute included: the shared stylesheet adds 8px of padding to any
        wrapper holding the nav that is not marked as the dock, which parked this bar 8px higher
        than every other tab and made it jump on the way in.
      */}
      <div
        data-evo-analytics-primary-navigation
        data-app-2027-navigation-dock
        className="absolute inset-x-0 bottom-[8px] z-30 flex justify-center bg-transparent"
      >
        <App2027PrimaryNavigation activeTab="analytics" onTabChange={handleTabChange} selectionMotion />
      </div>

      {scopeSheetOpen ? (
        <SpendingScopeSheet
          scopes={scopes}
          selectedScopeId={activeScope?.id ?? 'all-accounts'}
          onScopeChange={(value) => dispatchAnalytics({ type: 'set-field', field: 'selectedScopeId', value })}
          onClose={() => dispatchAnalytics({ type: 'set-field', field: 'scopeSheetOpen', value: false })}
        />
      ) : null}
    </div>
  );
}
