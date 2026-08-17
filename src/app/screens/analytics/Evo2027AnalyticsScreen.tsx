import { useCallback, useEffect, useMemo, useRef, useState, type UIEvent } from 'react';
import ExpenseBarChart, { type ExpenseBar } from '@/app/components/analytics/ExpenseBarChart';
import ExpenseDonutChart, {
  EXPENSE_OTHER_CATEGORY,
  type ExpenseDonutCategory,
} from '@/app/components/analytics/ExpenseDonutChart';
import AccountCarouselIndicator from '@/app/components/accounts/AccountCarouselIndicator';
import AmountVisibilityButton from '@/app/components/AmountVisibilityButton';
import { BottomSheet } from '@/app/components/BottomSheet';
import PageHeader from '@/app/components/PageHeader';
import { HeaderActionButton, HeaderActionRail } from '@/app/components/HeaderActionIcons';
import { AppIcon } from '@/app/components/icons';
import App2027PrimaryNavigation, {
  type App2027PrimaryNavigationItem,
} from '@/app/components/navigation/App2027PrimaryNavigation';
import TransactionAvatar from '@/app/components/transactions/TransactionAvatar';
import PfmCategoryIcon from '@/app/components/pfm/PfmCategoryIcon';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { formatMoneyNumber, getCountryConfig } from '@/app/registry/countryConfig';
import { useCountry, useDemo } from '@/app/state/demoStore';
import type { CountryId } from '@/app/state/demoTypes';
import {
  createSpendingAnalytics,
  createSpendingAnalyticsTimeline,
  createSpendingCategoryDetail,
  type SpendingCategorySummary,
  type SpendingSubcategorySummary,
  type SpendingAnalyticsPeriod,
  type SpendingAnalyticsSummary,
  type SpendingAnalyticsTransaction,
} from '@/data/spendingAnalytics';
import { type PfmCategoryName, type PfmCategorySelection } from '@/data/pfmCategories';
import { type Product } from '@/data/products';
import { maskFormattedAmount } from '@/app/utils/amountPrivacy';
import { useDragCarousel } from '@/hooks/useDragCarousel';
import { useProducts } from '@/hooks/useProducts';
import { CurrencyBadge } from '../home/App2027ProductAccordions';
import { getEvoAnalyticsCategoryDisplayLabel } from './analyticsCategoryLabels';

type AnalyticsScope = {
  id: string;
  label: string;
  products: Product[];
};

/** Biggest categories surfaced on the overview; the rest live one tap deeper. */
const OVERVIEW_CATEGORY_LIMIT = 3;

/** Categories drawn as individual arcs; all remaining categories share the Other arc. */
const DONUT_CATEGORY_LIMIT = 3;

type ExpensePeriodKind = 'month' | 'year';
type ExpenseChartMode = 'donut' | 'bars';
type AnalyticsDirection = 'expense' | 'income';

const EXPENSE_PERIOD_KINDS: ReadonlyArray<{ kind: ExpensePeriodKind; label: string }> = [
  { kind: 'month', label: 'Monthly interval' },
  { kind: 'year', label: 'Yearly interval' },
];

const EXPENSE_CHART_MODES: ReadonlyArray<{ mode: ExpenseChartMode; icon: 'analytics-donut-toggle' | 'analytics-bars-toggle'; label: string }> = [
  { mode: 'donut', icon: 'analytics-donut-toggle', label: 'Show categories as a donut' },
  { mode: 'bars', icon: 'analytics-bars-toggle', label: 'Show spending over time' },
];

type ExpenseSplitMode = 'categories' | 'merchants' | 'currencies';

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

function IntervalArrowButton({
  direction,
  intervalLabel = 'monthly',
  disabled,
  onClick,
}: {
  direction: 'previous' | 'next';
  intervalLabel?: string;
  disabled: boolean;
  onClick: () => void;
}) {
  const isPrevious = direction === 'previous';

  return (
    <button
      type="button"
      aria-label={`Show ${direction} ${intervalLabel} interval`}
      disabled={disabled}
      onClick={onClick}
      className="grid size-[32px] shrink-0 place-items-center rounded-full border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] text-[var(--uc-text)] transition-opacity disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
    >
      <AppIcon
        name="chevron-left"
        size={18}
        className={isPrevious ? undefined : 'rotate-180'}
        aria-hidden="true"
      />
    </button>
  );
}

function capitalise(value: string, locale: string) {
  return `${value.slice(0, 1).toLocaleUpperCase(locale)}${value.slice(1)}`;
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

/** Bucket a transaction lands in on the bar chart: one bar per day in a month, per month in a year. */
function getExpenseBucketKey(transaction: SpendingAnalyticsTransaction, periodKind: 'month' | 'year') {
  return periodKind === 'year' ? transaction.monthKey : transaction.day.padStart(2, '0');
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

      return {
        key,
        label: new Date(year, index, 1).toLocaleDateString(locale, { month: 'short' }),
        total: totals.get(key) ?? 0,
      };
    });
  }

  const [yearPart, monthPart] = summary.monthKey.split('-');
  const year = Number(yearPart);
  const monthIndex = Number(monthPart) - 1;
  // Day 0 of the next month is the last day of this one.
  const dayCount = new Date(year, monthIndex + 1, 0).getDate();

  return Array.from({ length: dayCount }, (_, index) => {
    const key = String(index + 1).padStart(2, '0');

    // Some locales return lowercase weekday abbreviations (cs: "po"); the axis reads better capitalised.
    const weekday = new Date(year, monthIndex, index + 1).toLocaleDateString(locale, { weekday: 'short' });

    return {
      key,
      label: key,
      caption: `${weekday.slice(0, 1).toLocaleUpperCase(locale)}${weekday.slice(1)}`,
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

function formatPeriodLabel(label: string) {
  return `${label.slice(0, 1)}${label.slice(1).toLocaleLowerCase()}`;
}

function FormattedAmount({
  amount,
  country,
  currency,
  className = '',
  amountsHidden = false,
  compact = false,
}: {
  amount: number;
  country: CountryId;
  currency: string;
  className?: string;
  amountsHidden?: boolean;
  compact?: boolean;
}) {
  // Mask the formatted string, then split it — `splitAmount` and `maskAmountParts` have
  // incompatible shapes, and combining them the other way prints "**** , ,**".
  const value = splitAmount(maskFormattedAmount(formatMoneyNumber(Math.abs(amount), country), amountsHidden));

  return (
    <p className={`inline-flex items-baseline whitespace-nowrap text-[var(--uc-text)] ${className}`.trim()}>
      <span className={compact ? 'text-[18px] font-bold leading-[22px] tracking-[-0.02em]' : 'text-[24px] font-bold leading-[26px] tracking-[-0.025em]'}>{value.integer}</span>
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
      <div className="px-[24px] pb-[20px]">
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

function ExpensePeriodNavigator({
  periods,
  selectedPeriodKey,
  onPeriodChange,
  periodKind,
  onPeriodKindChange,
}: {
  periods: readonly SpendingAnalyticsPeriod[];
  selectedPeriodKey: string;
  onPeriodChange: (periodKey: string) => void;
  periodKind: ExpensePeriodKind;
  onPeriodKindChange: (kind: ExpensePeriodKind) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const activeIndex = Math.max(periods.findIndex((period) => period.key === selectedPeriodKey), 0);
  const activePeriod = periods[activeIndex] ?? periods[0];
  const previousPeriod = periods[activeIndex - 1];
  const nextPeriod = periods[activeIndex + 1];
  const activeKindLabel = EXPENSE_PERIOD_KINDS.find((entry) => entry.kind === periodKind)?.label ?? '';

  if (!activePeriod) return null;

  return (
    <section aria-label="Interval" className="mt-[20px]" data-evo-expense-interval={periodKind}>
      <div className="relative z-10 flex justify-center">
        <button
          type="button"
          aria-label="Select interval type"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className="inline-flex min-h-[32px] items-center gap-[6px] rounded-full px-[10px] text-[16px] font-bold leading-[20px] text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
          onClick={() => setIsOpen((open) => !open)}
        >
          {activeKindLabel}
          <AppIcon name="chevron-down-wide" size={18} color="currentColor" aria-hidden="true" />
        </button>

        {isOpen ? (
          <div
            role="listbox"
            aria-label="Interval type"
            className="absolute top-[38px] w-[min(100%,240px)] overflow-hidden rounded-[8px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] p-[4px] shadow-[0_10px_24px_rgb(var(--uc-shadow-rgb)/0.18)]"
          >
            {EXPENSE_PERIOD_KINDS.map((entry) => (
              <button
                key={entry.kind}
                type="button"
                role="option"
                aria-selected={entry.kind === periodKind}
                className={`flex min-h-[44px] w-full items-center rounded-[8px] px-[12px] text-left text-[16px] leading-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)] ${
                  entry.kind === periodKind
                    ? 'bg-[var(--uc-action-soft)] font-bold text-[var(--uc-text)]'
                    : 'text-[var(--uc-text)] hover:bg-[var(--uc-surface-subtle)]'
                }`}
                onClick={() => {
                  onPeriodKindChange(entry.kind);
                  setIsOpen(false);
                }}
              >
                {entry.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-[4px] flex items-center gap-[8px]">
        <IntervalArrowButton
          direction="previous"
          intervalLabel={periodKind === 'year' ? 'yearly' : 'monthly'}
          disabled={!previousPeriod}
          onClick={() => previousPeriod && onPeriodChange(previousPeriod.key)}
        />

        <div className="min-w-0 flex-1 text-center">
          <h2 className="truncate text-[24px] font-bold leading-[28px] tracking-[-0.02em] text-[var(--uc-text)]">
            {periodKind === 'year' ? activePeriod.label : formatPeriodLabel(activePeriod.label)}
          </h2>
          {periodKind === 'month' ? (
            <p className="text-[16px] font-bold leading-[20px] text-[var(--uc-text-muted)]">{activePeriod.year}</p>
          ) : null}
        </div>

        {nextPeriod ? (
          <IntervalArrowButton
            direction="next"
            intervalLabel={periodKind === 'year' ? 'yearly' : 'monthly'}
            disabled={false}
            onClick={() => onPeriodChange(nextPeriod.key)}
          />
        ) : (
          <span aria-hidden="true" className="size-[32px] shrink-0" />
        )}
      </div>
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
              ? 'bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-[0_1px_2px_rgb(var(--uc-shadow-rgb)/0.16)]'
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

function ExpenseChartPanel({
  direction,
  categories,
  selectedCategories,
  onToggleCategory,
  bars,
  selectedBucketKey,
  onToggleBucket,
  mode,
  onModeChange,
  headerLabel,
  headerAmount,
  country,
  currency,
}: {
  direction: AnalyticsDirection;
  categories: readonly SpendingCategorySummary[];
  selectedCategories: ReadonlySet<ExpenseDonutCategory>;
  onToggleCategory: (category: ExpenseDonutCategory) => void;
  bars: readonly ExpenseBar[];
  selectedBucketKey: string | null;
  onToggleBucket: (key: string) => void;
  mode: ExpenseChartMode;
  onModeChange: (mode: ExpenseChartMode) => void;
  headerLabel: string;
  headerAmount: number;
  country: CountryId;
  currency: string;
}) {
  const primaryCategories = categories.slice(0, DONUT_CATEGORY_LIMIT);
  const otherCategories = categories.slice(DONUT_CATEGORY_LIMIT);
  const otherTotal = otherCategories.reduce((total, category) => total + category.total, 0);
  const segments = [
    ...primaryCategories.map((category) => ({
      category: category.category,
      label: getEvoAnalyticsCategoryDisplayLabel(category.category),
      total: category.total,
      colorVar: category.colorVar,
      iconCategory: category.category,
    })),
    ...(otherTotal > 0 ? [{
      category: EXPENSE_OTHER_CATEGORY,
      label: EXPENSE_OTHER_CATEGORY,
      total: otherTotal,
      colorVar: '--uc-pfm-finance',
    }] : []),
  ];

  if (segments.length === 0) {
    return (
      <section aria-label={`${direction === 'income' ? 'Income' : 'Expense'} chart`} className="mt-[24px]">
        <p className="py-[28px] text-[16px] leading-[22px] text-[var(--uc-text-muted)]">
          No {direction === 'income' ? 'income' : 'expense'} data for this period.
        </p>
      </section>
    );
  }

  return (
    <section aria-label={`${direction === 'income' ? 'Income' : 'Expense'} chart`} className="mt-[16px]" data-evo-expense-chart>
      <div className="flex items-start justify-between gap-[12px]">
        {mode === 'bars' ? (
          <div className="min-w-0">
            <p className="truncate text-[16px] leading-[20px] text-[var(--uc-text-muted)]">{headerLabel}</p>
            <FormattedAmount amount={headerAmount} country={country} currency={currency} className="mt-[2px]" />
          </div>
        ) : (
          <span />
        )}
        <ExpenseChartModeToggle mode={mode} onModeChange={onModeChange} />
      </div>

      <div className="mt-[8px]">
        {mode === 'donut' ? (
          <ExpenseDonutChart
            segments={segments}
            selected={selectedCategories}
            onToggle={onToggleCategory}
            centerLabel={headerLabel}
            centerValue={<FormattedAmount amount={headerAmount} country={country} currency={currency} />}
          />
        ) : (
          <ExpenseBarChart
            bars={bars}
            selectedKey={selectedBucketKey}
            onToggle={onToggleBucket}
          />
        )}
      </div>
    </section>
  );
}


function ExpenseTransactionList({
  transactions,
  summary,
  country,
  scopeLabel,
  onTransactionClick,
}: {
  transactions: readonly SpendingAnalyticsTransaction[];
  summary: SpendingAnalyticsSummary;
  country: CountryId;
  scopeLabel: string;
  onTransactionClick?: (transaction: SpendingAnalyticsTransaction) => void;
}) {
  const visibleTransactions = transactions;

  return (
    <section aria-label="Expense transactions" className="mt-[32px] pb-[20px]">
      <div className="flex items-end justify-between gap-[16px]">
        <div>
          <h3 className="text-[24px] font-bold leading-[26px] tracking-[-0.02em] text-[var(--uc-text)]">Transactions</h3>
          <p className="mt-[4px] text-[16px] leading-[20px] text-[var(--uc-text-muted)]">{scopeLabel}</p>
        </div>
        <span className="text-[14px] leading-[18px] text-[var(--uc-text-muted)]">{visibleTransactions.length} shown</span>
      </div>

      <div className="mt-[12px] overflow-hidden rounded-[8px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)]">
        {visibleTransactions.length > 0 ? visibleTransactions.map((transaction, index) => (
          <button
            key={transaction.id}
            type="button"
            data-testid="evo-expense-transaction"
            data-evo-expense-transaction-category={transaction.pfmCategory}
            className={`flex min-h-[72px] w-full items-center gap-[12px] px-[16px] py-[12px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-focus-ring)] ${
              index > 0 ? 'border-t border-[var(--uc-border-muted)]' : ''
            }`}
            onClick={() => onTransactionClick?.(transaction)}
          >
            <PfmCategoryIcon category={transaction.pfmCategory} size={32} variant="category-circle" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[16px] font-medium leading-[20px] text-[var(--uc-text)]">{transaction.label}</span>
              <span className="mt-[2px] block text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
                {transaction.day} {transaction.month} · {transaction.sourceProductName}
              </span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block text-[18px] font-bold leading-[20px] text-[var(--uc-text)]">- {formatMoneyNumber(Math.abs(transaction.amount), country)}</span>
              <span className="mt-[2px] block text-[14px] leading-[18px] text-[var(--uc-text-muted)]">{summary.currency}</span>
            </span>
          </button>
        )) : (
          <p className="px-[16px] py-[24px] text-[16px] leading-[22px] text-[var(--uc-text-muted)]">No transactions match this category.</p>
        )}
      </div>
    </section>
  );
}

function ExpenseSplitSelector({
  mode,
  availableModes,
  onModeChange,
}: {
  mode: ExpenseSplitMode;
  availableModes: readonly ExpenseSplitMode[];
  onModeChange: (mode: ExpenseSplitMode) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const activeLabel = EXPENSE_SPLIT_MODES.find((entry) => entry.mode === mode)?.label ?? '';

  return (
    <div className="relative z-10" data-evo-expense-split={mode}>
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
        <AppIcon name="chevron-down-wide" size={18} color="currentColor" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div
          role="listbox"
          aria-label="Transaction split"
          className="absolute left-0 top-[70px] w-[min(100%,240px)] overflow-hidden rounded-[8px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] p-[4px] shadow-[0_10px_24px_rgb(var(--uc-shadow-rgb)/0.18)]"
        >
          {EXPENSE_SPLIT_MODES.filter((entry) => availableModes.includes(entry.mode)).map((entry) => (
            <button
              key={entry.mode}
              type="button"
              role="option"
              aria-selected={entry.mode === mode}
              className={`flex min-h-[44px] w-full items-center rounded-[8px] px-[12px] text-left text-[16px] leading-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)] ${
                entry.mode === mode
                  ? 'bg-[var(--uc-action-soft)] font-bold text-[var(--uc-text)]'
                  : 'text-[var(--uc-text)] hover:bg-[var(--uc-surface-subtle)]'
              }`}
              onClick={() => {
                onModeChange(entry.mode);
                setIsOpen(false);
              }}
            >
              {entry.label}
            </button>
          ))}
        </div>
      ) : null}
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
}: {
  mode: ExpenseSplitMode;
  availableModes: readonly ExpenseSplitMode[];
  onModeChange: (mode: ExpenseSplitMode) => void;
  rows: readonly ExpenseBreakdownRow[];
  total: number;
  country: CountryId;
  currency: string;
  onOpenRow: (row: ExpenseBreakdownRow) => void;
}) {
  return (
    <section aria-label="Expense breakdown" className="mt-[28px] pb-[20px]">
      <ExpenseSplitSelector mode={mode} availableModes={availableModes} onModeChange={onModeChange} />

      <div className="mt-[12px] overflow-hidden rounded-[8px] bg-[var(--uc-surface)] shadow-[0_1px_1px_rgb(var(--uc-shadow-rgb)/0.04)]">
        <div className="divide-y divide-[var(--uc-border-muted)] border-t border-[var(--uc-border-muted)]">
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
  periodLabel,
  onTransactionClick,
}: {
  direction: AnalyticsDirection;
  row: ExpenseBreakdownRow;
  subcategories: readonly SpendingSubcategorySummary[];
  transactions: readonly SpendingAnalyticsTransaction[];
  summary: SpendingAnalyticsSummary;
  country: CountryId;
  periodLabel: string;
  onTransactionClick?: (transaction: SpendingAnalyticsTransaction) => void;
}) {
  const total = transactions.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

  return (
    <div data-evo-analytics-breakdown={row.key}>
      <div className="mt-[4px] flex items-center gap-[12px]">
        <ExpenseBreakdownRowIcon row={row} />
        <div className="min-w-0">
          <FormattedAmount amount={total} country={country} currency={summary.currency} />
          <p className="mt-[2px] text-[16px] leading-[20px] text-[var(--uc-text-muted)]">
            {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'} · {periodLabel}
          </p>
        </div>
      </div>

      {subcategories.length > 0 ? (
        <section aria-label="Subcategories" className="mt-[28px]">
          <h3 className="text-[18px] font-bold leading-[24px] text-[var(--uc-text)]">Subcategories</h3>
          <div className="mt-[8px] divide-y divide-[var(--uc-border-muted)] border-t border-[var(--uc-border-muted)]">
            {subcategories.map((subcategory) => (
              <div
                key={subcategory.label}
                data-evo-expense-subcategory={subcategory.label}
                className="flex min-h-[64px] items-center gap-[12px] py-[12px]"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[16px] font-medium leading-[20px] text-[var(--uc-text)]">
                    {subcategory.label}
                  </span>
                  <span className="mt-[2px] block text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
                    {subcategory.transactionCount} {subcategory.transactionCount === 1 ? 'transaction' : 'transactions'}
                  </span>
                </span>
                <FormattedAmount amount={subcategory.total} country={country} currency={summary.currency} className="shrink-0" />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <ExpenseTransactionList
        transactions={transactions}
        summary={summary}
        country={country}
        scopeLabel={`${row.label} ${direction === 'income' ? 'income' : 'expenses'}`}
        onTransactionClick={onTransactionClick}
      />
    </div>
  );
}
/**
 * Home's product-category rail, reused verbatim (App2027TransformationHome.tsx:525-532).
 * It replaces both the centred scope lozenge and the two-arrow stepper, and unlike a stepper
 * it shows which periods actually hold data — the fixture has no January 2026.
 */
function SpendingMonthBars({ bars }: { bars: readonly ExpenseBar[] }) {
  const peak = Math.max(...bars.map((bar) => bar.total), 0);

  if (bars.length === 0 || peak <= 0) {
    return <div className="h-[68px]" aria-hidden="true" />;
  }

  const lastIndex = bars.length - 1;
  const midIndex = Math.floor(lastIndex / 2);

  return (
    <div data-evo-analytics-month-bars>
      <div className="flex h-[46px] items-end gap-[2px]" role="img" aria-label="Daily money out across the period">
        {bars.map((bar) => (
          <span
            key={bar.key}
            className="flex-1 rounded-t-[3px]"
            style={{
              height: `${bar.total > 0 ? Math.max((bar.total / peak) * 100, 5) : 2}%`,
              // The destination's own accent, tonal against the card ground. Every day is drawn
              // the same way — the bars encode magnitude and nothing else.
              backgroundColor: bar.total > 0
                ? 'color-mix(in srgb, var(--uc-action) 58%, transparent)'
                : 'color-mix(in srgb, var(--uc-text) 9%, transparent)',
            }}
          />
        ))}
      </div>
      {/* Baseline, so the bars read as a chart rather than floating strokes. */}
      <div className="h-px w-full bg-[color-mix(in_srgb,var(--uc-text)_16%,transparent)]" />
      <div className="mt-[7px] flex text-[11px] leading-[14px] text-[color-mix(in_srgb,var(--uc-text)_55%,transparent)]">
        <span className="flex-1 text-left">{bars[0]?.label}</span>
        <span className="flex-1 text-center">{bars[midIndex]?.label}</span>
        <span className="flex-1 text-right">{bars[lastIndex]?.label}</span>
      </div>
    </div>
  );
}

/**
 * Tinted roundel in the PFM-icon idiom, so the three money figures carry a little colour and
 * the card reads at a glance: out, in, and what is left.
 */
function MoneyFlowIcon({
  icon,
  colorVar,
}: {
  icon: 'trade-sell' | 'trade-buy' | 'accounts-coins';
  colorVar: string;
}) {
  return (
    <span
      aria-hidden="true"
      data-evo-analytics-flow-icon
      className="grid size-[24px] shrink-0 place-items-center rounded-full"
      style={{ backgroundColor: `var(${colorVar})` }}
    >
      <AppIcon name={icon} size={16} color="var(--uc-static-white)" aria-hidden="true" />
    </span>
  );
}

/** One statement card per period. Swiping the rail *is* how the user changes month. */
function SpendingMonthCard({
  summary,
  bars,
  country,
  amountsHidden,
  periodLabel,
  onOpenIncome,
  dragHandlers,
}: {
  summary: SpendingAnalyticsSummary;
  bars: readonly ExpenseBar[];
  country: CountryId;
  amountsHidden: boolean;
  periodLabel: string;
  onOpenIncome: () => void;
  dragHandlers?: ReturnType<typeof useDragCarousel>['dragHandlers'];
}) {
  const format = (value: number) => maskFormattedAmount(formatMoneyNumber(Math.abs(value), country), amountsHidden);
  const spent = splitAmount(format(summary.spendingTotal));
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
      className="flex w-[calc(100%-44px)] shrink-0 flex-col gap-[18px] overflow-hidden rounded-[8px] bg-[var(--uc-surface)] p-[20px] text-[var(--uc-text)] shadow-[0_4px_16px_rgb(var(--uc-shadow-rgb)/0.07)]"
    >
      <div>
        <p className="text-[12px] font-bold uppercase leading-[16px] tracking-[0.1em] text-[color-mix(in_srgb,var(--uc-text)_62%,transparent)]">
          {periodLabel}
        </p>
        <p className="mt-[12px] flex items-center gap-[8px] text-[14px] leading-[18px] text-[color-mix(in_srgb,var(--uc-text)_72%,transparent)]">
          <MoneyFlowIcon icon="trade-sell" colorVar="--uc-pfm-exclude-budget" />
          Money out
        </p>
        <p className="mt-[2px] flex items-baseline gap-[2px] whitespace-nowrap">
          <span className="text-[28px] font-bold leading-[30px] tracking-[-0.025em]">{spent.integer}</span>
          <span className="text-[18px] font-bold leading-[22px]">{spent.separator}{spent.decimals} {summary.currency}</span>
        </p>
        <p className="mt-[4px] text-[14px] leading-[18px] text-[color-mix(in_srgb,var(--uc-text)_72%,transparent)]">
          {keptShare !== null
            ? `You kept ${keptShare}% of what came in`
            : overspent
              ? 'More went out than came in'
              : 'No income recorded in this period'}
        </p>
      </div>

      <div className="rounded-[6px] bg-[color-mix(in_srgb,var(--uc-text)_4%,transparent)] px-[12px] pb-[10px] pt-[12px]">
        <SpendingMonthBars bars={bars} />
      </div>

      <div className="grid grid-cols-2 gap-[12px] border-t border-[color-mix(in_srgb,var(--uc-text)_16%,transparent)] pt-[16px]">
        <button
          type="button"
          data-evo-analytics-open-income
          onClick={onOpenIncome}
          className="min-w-0 rounded-[4px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-surface)]"
        >
          <span className="flex items-center gap-[6px] text-[14px] leading-[18px] text-[color-mix(in_srgb,var(--uc-text)_72%,transparent)]">
            <MoneyFlowIcon icon="trade-buy" colorVar="--uc-pfm-transfers" />
            Money in
            <AppIcon name="chevron-link" size={18} color="currentColor" aria-hidden="true" />
          </span>
          <span className="mt-[1px] block truncate text-[18px] font-bold leading-[22px]">
            {format(summary.incomeTotal)} {summary.currency}
          </span>
        </button>

        <div className="min-w-0">
          <p className="flex items-center gap-[6px] text-[14px] leading-[18px] text-[color-mix(in_srgb,var(--uc-text)_72%,transparent)]">
            <MoneyFlowIcon icon="accounts-coins" colorVar="--uc-pfm-utilities" />
            Net cashflow
          </p>
          <p className="mt-[1px] truncate text-[18px] font-bold leading-[22px]">
            {summary.netTotal >= 0 ? '+' : '−'}{format(summary.netTotal)} {summary.currency}
          </p>
        </div>
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
  barsByPeriodKey,
  selectedPeriodKey,
  onPeriodChange,
  country,
  amountsHidden,
  onOpenIncome,
}: {
  periods: readonly SpendingAnalyticsPeriod[];
  summariesByPeriodKey: Record<string, SpendingAnalyticsSummary>;
  barsByPeriodKey: Record<string, ExpenseBar[]>;
  selectedPeriodKey: string;
  onPeriodChange: (periodKey: string) => void;
  country: CountryId;
  amountsHidden: boolean;
  onOpenIncome: () => void;
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
        className={`-mx-[16px] flex gap-[12px] overflow-x-auto overscroll-x-contain px-[16px] py-[4px] scrollbar-hide select-none touch-pan-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
      >
        {periods.map((period) => {
          const periodSummary = summariesByPeriodKey[period.key];
          if (!periodSummary) return null;

          return (
            <SpendingMonthCard
              key={period.key}
              summary={periodSummary}
              bars={barsByPeriodKey[period.key] ?? []}
              country={country}
              amountsHidden={amountsHidden}
              periodLabel={period.kind === 'year'
                ? `Total ${period.label}`
                : `${formatPeriodLabel(period.label)} ${period.year}`}
              onOpenIncome={onOpenIncome}
              dragHandlers={dragHandlers}
            />
          );
        })}
        {/* Lets the last card settle on the 16px page inset instead of the rail's right edge. */}
        <div aria-hidden="true" className="w-[44px] shrink-0" />
      </div>

      {periods.length > 1 ? (
        <div className="mt-[8px] flex justify-center" aria-label="Monthly interval pages">
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
  if (rows.length === 0) return null;

  return (
    <section aria-label={ariaLabel} {...{ [sectionDataAttribute]: true }}>
      <div>
        <h2 className="text-[22px] font-bold leading-[28px] tracking-[-0.02em] text-[var(--uc-text)]">{title}</h2>
      </div>

      <div className="mt-[12px] overflow-hidden rounded-[8px] bg-[var(--uc-surface)] pb-[8px] shadow-[0_1px_1px_rgb(var(--uc-shadow-rgb)/0.04)]">
        {rows.map((row, index) => {
          const share = total > 0 ? Math.round((row.total / total) * 100) : 0;
          const amount = splitAmount(maskFormattedAmount(formatMoneyNumber(row.total, country), amountsHidden));

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
  categories,
  scopeLabel,
  onOpenScope,
  periods,
  selectedPeriodKey,
  onPeriodChange,
  periodKind,
  onPeriodKindChange,
  summary,
  country,
  selectedCategories,
  onToggleCategory,
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
}: {
  direction: AnalyticsDirection;
  categories: readonly SpendingCategorySummary[];
  scopeLabel: string;
  onOpenScope: () => void;
  periods: readonly SpendingAnalyticsPeriod[];
  selectedPeriodKey: string;
  onPeriodChange: (periodKey: string) => void;
  periodKind: ExpensePeriodKind;
  onPeriodKindChange: (kind: ExpensePeriodKind) => void;
  summary: SpendingAnalyticsSummary;
  country: CountryId;
  selectedCategories: ReadonlySet<ExpenseDonutCategory>;
  onToggleCategory: (category: ExpenseDonutCategory) => void;
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
}) {
  return (
    <div data-evo-analytics-expenses data-evo-analytics-direction={direction}>
      <button
        type="button"
        data-evo-analytics-scope-trigger
        aria-haspopup="dialog"
        onClick={onOpenScope}
        className="-ml-[4px] mt-[4px] inline-flex min-h-[32px] max-w-full items-center gap-[6px] rounded-[4px] px-[4px] text-left text-[14px] leading-[18px] text-[var(--uc-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
      >
        <span className="truncate">{scopeLabel}</span>
        <AppIcon name="chevron-down-wide" size={18} color="currentColor" aria-hidden="true" />
      </button>
      <ExpensePeriodNavigator
        periods={periods}
        selectedPeriodKey={selectedPeriodKey}
        onPeriodChange={onPeriodChange}
        periodKind={periodKind}
        onPeriodKindChange={onPeriodKindChange}
      />

      <ExpenseChartPanel
        direction={direction}
        categories={categories}
        selectedCategories={selectedCategories}
        onToggleCategory={onToggleCategory}
        bars={bars}
        selectedBucketKey={selectedBucketKey}
        onToggleBucket={onToggleBucket}
        mode={chartMode}
        onModeChange={onChartModeChange}
        headerLabel={headerLabel}
        headerAmount={headerAmount}
        country={country}
        currency={summary.currency}
      />

      {filterLabel ? (
        <div className="mt-[16px] flex items-center justify-between gap-[8px] rounded-[8px] bg-[var(--uc-action-soft)] px-[12px] py-[10px]">
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
  const [selectedScopeId, setSelectedScopeId] = useState('all-accounts');
  const [view, setView] = useState<'overview' | 'analysis' | 'breakdown'>('overview');
  const [analysisDirection, setAnalysisDirection] = useState<AnalyticsDirection>('expense');
  const [breakdownOrigin, setBreakdownOrigin] = useState<'overview' | 'analysis'>('analysis');
  const [scopeSheetOpen, setScopeSheetOpen] = useState(false);
  const [contentScrollTop, setContentScrollTop] = useState(0);
  const [expenseSplitMode, setExpenseSplitMode] = useState<ExpenseSplitMode>('categories');
  const [openBreakdownRow, setOpenBreakdownRow] = useState<ExpenseBreakdownRow | null>(null);
  /** Empty means "all categories". Order is irrelevant — it is used as a set. */
  const [selectedExpenseCategories, setSelectedExpenseCategories] = useState<ExpenseDonutCategory[]>([]);
  const [expenseChartMode, setExpenseChartMode] = useState<ExpenseChartMode>('donut');
  const [expensePeriodKind, setExpensePeriodKind] = useState<ExpensePeriodKind>('month');
  const [selectedBucketKey, setSelectedBucketKey] = useState<string | null>(null);
  const activeScope = scopes.find((scope) => scope.id === selectedScopeId) ?? scopes[0];
  const timeline = useMemo(
    () => createSpendingAnalyticsTimeline(country, activeScope?.products ?? [], transactionCategoryOverrides),
    [activeScope?.products, country, transactionCategoryOverrides],
  );
  const monthlyPeriods = useMemo(
    () => timeline.periods.filter((period) => period.kind === 'month'),
    [timeline.periods],
  );
  const [selectedPeriodKey, setSelectedPeriodKey] = useState(timeline.activePeriodKey);

  useEffect(() => {
    if (!scopes.some((scope) => scope.id === selectedScopeId)) {
      setSelectedScopeId('all-accounts');
    }
  }, [scopes, selectedScopeId]);

  useEffect(() => {
    setSelectedPeriodKey(timeline.activePeriodKey);
  }, [timeline.activePeriodKey]);

  const firstPeriod = monthlyPeriods[0];
  const summary =
    timeline.summariesByPeriodKey[selectedPeriodKey] ??
    timeline.summariesByPeriodKey[timeline.activePeriodKey] ??
    (firstPeriod ? timeline.summariesByPeriodKey[firstPeriod.key] : undefined) ??
    createSpendingAnalytics(country, activeScope?.products ?? [], undefined, transactionCategoryOverrides);
  const analysisCategories = analysisDirection === 'income' ? summary.moneyInCategories : summary.moneyOutCategories;
  const primaryExpenseCategoryKeys = useMemo(
    () => new Set(analysisCategories.slice(0, DONUT_CATEGORY_LIMIT).map((category) => category.category)),
    [analysisCategories],
  );
  const activeExpenseCategories = useMemo(() => {
    const available = new Set(analysisCategories.map((category) => category.category));
    const hasOther = analysisCategories.length > DONUT_CATEGORY_LIMIT;
    return new Set(selectedExpenseCategories.filter((category) => (
      category === EXPENSE_OTHER_CATEGORY ? hasOther : available.has(category)
    )));
  }, [analysisCategories, selectedExpenseCategories]);
  const expensePeriods = useMemo(
    () => timeline.periods
      .filter((period) => period.kind === expensePeriodKind)
      .sort((a, b) => a.key.localeCompare(b.key)),
    [expensePeriodKind, timeline.periods],
  );
  const categoryFilteredExpenses = useMemo(
    () => summary.sourceTransactions.filter((transaction) => (
      (analysisDirection === 'income' ? transaction.amount > 0 : transaction.amount < 0)
      && (
        activeExpenseCategories.size === 0
        || activeExpenseCategories.has(transaction.pfmCategory)
        || (activeExpenseCategories.has(EXPENSE_OTHER_CATEGORY) && !primaryExpenseCategoryKeys.has(transaction.pfmCategory))
      )
    )),
    [activeExpenseCategories, analysisDirection, primaryExpenseCategoryKeys, summary.sourceTransactions],
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
  const expenseSelectionLabels = Array.from(activeExpenseCategories)
    .map((category) => category === EXPENSE_OTHER_CATEGORY
      ? EXPENSE_OTHER_CATEGORY
      : getEvoAnalyticsCategoryDisplayLabel(category));
  const activeBucketLabel = activeBucketKey
    ? (() => {
      const bar = expenseBars.find((entry) => entry.key === activeBucketKey);
      return bar ? [bar.caption, bar.label].filter(Boolean).join(' ') : null;
    })()
    : null;
  const expenseFilterLabel = [
    expenseSelectionLabels.length === 1
      ? expenseSelectionLabels[0]
      : expenseSelectionLabels.length > 1 ? `${expenseSelectionLabels.length} categories` : null,
    activeBucketLabel,
  ].filter(Boolean).join(' · ') || null;
  const visibleExpensesTotal = visibleExpenses.reduce((total, transaction) => total + Math.abs(transaction.amount), 0);
  const expenseHeaderAmount = activeExpenseCategories.size === 0 && !activeBucketKey
    ? analysisDirection === 'income' ? summary.incomeTotal : summary.spendingTotal
    : visibleExpensesTotal;
  // The chart headline names whatever the user has narrowed to, falling back to the period total.
  const expenseSelectionLabel = expenseSelectionLabels.length > 1
    ? `${expenseSelectionLabels.length} categories`
    : expenseSelectionLabels[0] ?? (analysisDirection === 'income' ? 'Total income' : 'Total spent');
  const expenseHeaderLabel = activeBucketLabel
    ? `${expenseSelectionLabel} · ${activeBucketLabel}`
    : expenseSelectionLabel;

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
  const breakdownRows = useMemo(
    () => buildExpenseBreakdown(activeSplitMode, visibleExpenses, currencyByProductId, summary.currency, getCountryConfig(country).locale),
    [activeSplitMode, country, currencyByProductId, summary.currency, visibleExpenses],
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

    return { transactions, subcategories };
  }, [activeBucketKey, activeSplitMode, analysisDirection, currencyByProductId, openBreakdownRow, summary]);

  // Months oldest-to-newest, then the two year totals. The carousel rests on the most recent
  // month: swiping back walks earlier months, swiping forward reaches this year then last year.
  const overviewCarouselPeriods = useMemo(() => {
    const years = timeline.periods
      .filter((period) => period.kind === 'year')
      .sort((a, b) => Number(b.year) - Number(a.year))
      .slice(0, 2);

    return [...monthlyPeriods, ...years];
  }, [monthlyPeriods, timeline.periods]);
  // Every card in the period carousel draws its own month, so the bars are built per period.
  const overviewBarsByPeriodKey = useMemo(
    () => overviewCarouselPeriods.reduce<Record<string, ExpenseBar[]>>((accumulator, period) => {
      const periodSummary = timeline.summariesByPeriodKey[period.key];

      if (periodSummary) {
        accumulator[period.key] = buildExpenseBars(
          periodSummary,
          periodSummary.sourceTransactions.filter((transaction) => transaction.amount < 0),
        );
      }

      return accumulator;
    }, {}),
    [overviewCarouselPeriods, timeline.summariesByPeriodKey],
  );
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
  const handleOpenBreakdownRow = (row: ExpenseBreakdownRow, direction: AnalyticsDirection = 'expense') => {
    setContentScrollTop(0);
    // Remember where the drill-in started, or Back would land the user on an analysis
    // page they never opened when they came straight from an overview category row.
    setBreakdownOrigin(view === 'overview' ? 'overview' : 'analysis');
    if (view === 'overview') {
      setAnalysisDirection(direction);
      setSelectedBucketKey(null);
    }
    setOpenBreakdownRow(row);
    setView('breakdown');
  };
  const handleBackFromBreakdown = () => {
    setContentScrollTop(0);
    setOpenBreakdownRow(null);
    setView(breakdownOrigin);
  };

  const openAnalysis = (direction: AnalyticsDirection) => {
    setContentScrollTop(0);
    setAnalysisDirection(direction);
    setSelectedExpenseCategories([]);
    setSelectedBucketKey(null);
    setExpenseSplitMode('categories');
    setExpenseChartMode('donut');
    setOpenBreakdownRow(null);
    setView('analysis');
  };

  const toggleExpenseCategory = (category: ExpenseDonutCategory) => {
    setSelectedExpenseCategories((current) => (
      current.includes(category)
        ? current.filter((entry) => entry !== category)
        : [...current, category]
    ));
  };
  const clearExpenseSelection = () => {
    setSelectedExpenseCategories([]);
    setSelectedBucketKey(null);
  };
  const toggleExpenseBucket = (key: string) => {
    setSelectedBucketKey((current) => (current === key ? null : key));
  };
  const handleExpensePeriodKindChange = (kind: ExpensePeriodKind) => {
    setExpensePeriodKind(kind);
    setSelectedBucketKey(null);

    const nextPeriods = timeline.periods
      .filter((period) => period.kind === kind)
      .sort((a, b) => a.key.localeCompare(b.key));
    const latest = nextPeriods[nextPeriods.length - 1];

    if (latest) setSelectedPeriodKey(latest.key);
  };
  const handleBackToOverview = () => {
    setContentScrollTop(0);
    setView('overview');
    setSelectedBucketKey(null);
    setOpenBreakdownRow(null);

    // The overview only navigates months, so never leave it holding a yearly period key.
    if (expensePeriodKind !== 'month') {
      setExpensePeriodKind('month');
      setSelectedPeriodKey(timeline.activePeriodKey);
    }
  };


  const handleTabChange = (tab: App2027PrimaryNavigationItem) => {
    if (tab === 'home') onHomeClick?.();
    if (tab === 'payments') onPaymentsClick?.();
    if (tab === 'products') onProductsClick?.();
    if (tab === 'more') onMoreClick?.();
  };
  const headerCollapseProgress = Math.min(1, contentScrollTop / 56);

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
            periodLabel={activeBucketLabel ?? summary.periodLabel}
            onTransactionClick={onTransactionClick}
          />
        ) : view === 'analysis' ? (
          <ExpensesDetail
            direction={analysisDirection}
            categories={analysisCategories}
            scopeLabel={activeScope?.label ?? 'All accounts'}
            onOpenScope={() => setScopeSheetOpen(true)}
            periods={expensePeriods}
            selectedPeriodKey={selectedPeriodKey}
            onPeriodChange={(periodKey) => {
              setSelectedPeriodKey(periodKey);
              setSelectedBucketKey(null);
            }}
            periodKind={expensePeriodKind}
            onPeriodKindChange={handleExpensePeriodKindChange}
            summary={summary}
            country={country}
            selectedCategories={activeExpenseCategories}
            onToggleCategory={toggleExpenseCategory}
            onClearSelection={clearExpenseSelection}
            chartMode={expenseChartMode}
            onChartModeChange={setExpenseChartMode}
            bars={expenseBars}
            selectedBucketKey={activeBucketKey}
            onToggleBucket={toggleExpenseBucket}
            filterLabel={expenseFilterLabel}
            headerLabel={expenseHeaderLabel}
            headerAmount={expenseHeaderAmount}
            splitMode={activeSplitMode}
            availableSplitModes={availableSplitModes}
            onSplitModeChange={setExpenseSplitMode}
            breakdownRows={breakdownRows}
            breakdownTotal={breakdownTotal}
            onOpenBreakdownRow={handleOpenBreakdownRow}
          />
        ) : (
          <div
            data-evo-analytics-summary
            data-evo-analytics-scope={activeScope?.id ?? 'all-accounts'}
            className="flex min-w-0 flex-col gap-[28px]"
          >
            <div className="flex min-w-0 flex-col gap-[10px]">
              <button
                type="button"
                data-evo-analytics-scope-trigger
                aria-haspopup="dialog"
                onClick={() => setScopeSheetOpen(true)}
                className="-ml-[4px] inline-flex min-h-[32px] max-w-full items-center gap-[6px] self-start rounded-[4px] px-[4px] text-left text-[16px] font-bold leading-[20px] text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
              >
                <span className="truncate">{activeScope?.label ?? 'All accounts'}</span>
                <AppIcon name="chevron-down-wide" size={18} color="currentColor" aria-hidden="true" />
              </button>

              <SpendingMonthCarousel
                periods={overviewCarouselPeriods}
                summariesByPeriodKey={timeline.summariesByPeriodKey}
                barsByPeriodKey={overviewBarsByPeriodKey}
                selectedPeriodKey={selectedPeriodKey}
                onPeriodChange={(periodKey) => {
                  setSelectedPeriodKey(periodKey);
                  setExpensePeriodKind(periodKey.startsWith('year-') ? 'year' : 'month');
                }}
                country={country}
                amountsHidden={amountsHidden}
                onOpenIncome={() => openAnalysis('income')}
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
      </main>

      <div
        data-evo-analytics-primary-navigation
        className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex h-[76px] items-end justify-center bg-transparent pb-[8px]"
      >
        <div className="pointer-events-auto w-full">
          <App2027PrimaryNavigation activeTab="analytics" onTabChange={handleTabChange} selectionMotion />
        </div>
      </div>

      {scopeSheetOpen ? (
        <SpendingScopeSheet
          scopes={scopes}
          selectedScopeId={activeScope?.id ?? 'all-accounts'}
          onScopeChange={setSelectedScopeId}
          onClose={() => setScopeSheetOpen(false)}
        />
      ) : null}
    </div>
  );
}
