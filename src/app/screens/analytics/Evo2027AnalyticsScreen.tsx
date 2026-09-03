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
import ActionIconBubble from '@/app/components/ActionIconBubble';
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
  createSpendingRangeSummary,
  listSpendingMonthKeys,
  createSpendingCategoryDetail,
  getAnalyticsSubcategoryLabel,
  getSpendingWeekIndex,
  SPENDING_WEEK_LENGTH,
  type SpendingSubcategorySummary,
  type SpendingAnalyticsSummary,
  type SpendingAnalyticsTransaction,
} from '@/data/spendingAnalytics';
import { groupAccountTransactionsByDate } from '@/data/accountDetails';
import { getPfmCategory, type PfmCategoryName, type PfmCategorySelection } from '@/data/pfmCategories';
import { type Product } from '@/data/products';
import { maskFormattedAmount } from '@/app/utils/amountPrivacy';
import NetCashflowBlock from '@/app/components/analytics/NetCashflowBlock';
import { useDragCarousel } from '@/hooks/useDragCarousel';
import { useProducts } from '@/hooks/useProducts';
import { CurrencyBadge } from '../home/App2027ProductAccordions';
import { getEvoAnalyticsCategoryDisplayLabel } from './analyticsCategoryLabels';
import {
  createEvoAnalyticsState,
  evoAnalyticsReducer,
  type AnalyticsDirection,
  type ExpenseChartMode,
  type ExpenseSplitMode,
} from './evoAnalyticsState';
import {
  buildCustomSelection,
  buildPeriodRail,
  buildPresetSelection,
  monthKeyYear,
  monthLabel,
  SPENDING_PRESET_IDS,
  selectionBucketKind,
  stepSelection,
  type SpendingPeriodSelection,
  type SpendingPresetId,
} from './evoSpendingPeriods';

type AnalyticsScope = {
  id: string;
  label: string;
  products: Product[];
};

/** Biggest categories surfaced on the overview; the rest live one tap deeper. */
const OVERVIEW_CATEGORY_LIMIT = 3;

/**
 * Categories drawn as individual arcs; the rest share the Other arc.
 *
 * Three left roughly half the money in a single grey wedge — the largest and
 * darkest element in the chart carrying the least information. Six names most of
 * it, and what is left is genuinely a remainder.
 */
const DONUT_CATEGORY_LIMIT = 6;

/**
 * The share an arc needs before it is worth drawing on its own.
 *
 * The ring gives every arc back the 28px its round caps and its gap take, so a
 * small share draws as a stub with a marker sitting on top of its neighbours'.
 * Six categories, three of them under a percent, is how the chart ended up with
 * a pile of icons in one corner. At 8% an arc is at least 17px of drawn stroke
 * and its marker has clear air around it; anything smaller is part of the
 * remainder, where the Other marker says how many are folded in. Nothing is
 * hidden — the list underneath carries every category and its exact share.
 */
const DONUT_MIN_SHARE = 0.08;

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

/** Bucket a transaction lands in: one bar per week inside a month, per month across anything longer. */
function getExpenseBucketKey(transaction: SpendingAnalyticsTransaction, bucketKind: 'week' | 'month') {
  return bucketKind === 'month'
    ? transaction.monthKey
    : `w${getSpendingWeekIndex(Number(transaction.day)) + 1}`;
}

/**
 * The bars for the selected span.
 *
 * A single month is still sliced into weeks. Anything longer — a preset, a
 * custom range, a whole year — is one bar per month, over exactly the months the
 * selection covers rather than a fixed twelve.
 */
function buildExpenseBars(
  selection: SpendingPeriodSelection,
  summary: SpendingAnalyticsSummary,
  transactions: readonly SpendingAnalyticsTransaction[],
): ExpenseBar[] {
  const bucketKind = selectionBucketKind(selection);
  const totals = new Map<string, number>();

  transactions.forEach((transaction) => {
    const key = getExpenseBucketKey(transaction, bucketKind);
    totals.set(key, (totals.get(key) ?? 0) + Math.abs(transaction.amount));
  });

  if (bucketKind === 'month') {
    return selection.monthKeys.map((key) => {
      // Three letters, not one: J/J, M/M and A/A are three ambiguous pairs on a
      // twelve-bar axis, and the initial carried no year either.
      const short = monthLabel(key, ANALYTICS_LOCALE, 'short');
      const long = monthLabel(key, ANALYTICS_LOCALE, 'long');
      const year = monthKeyYear(key);

      return {
        key,
        label: short,
        filterTitle: long,
        filterLabel: `${long} ${year}`,
        total: totals.get(key) ?? 0,
      };
    });
  }

  const [yearPart, monthPart] = (selection.monthKeys[0] ?? summary.monthKey).split('-');
  const year = Number(yearPart);
  const monthIndex = Number(monthPart) - 1;
  // Day 0 of the next month is the last day of this one.
  const dayCount = new Date(year, monthIndex + 1, 0).getDate();
  // The trailing week is short whenever the month does not divide by seven (29-31, or 22-28 in February).
  const weekCount = Math.ceil(dayCount / SPENDING_WEEK_LENGTH);
  const monthName = monthLabel(selection.monthKeys[0] ?? summary.monthKey, ANALYTICS_LOCALE, 'long');

  return Array.from({ length: weekCount }, (_, index) => {
    const key = `w${index + 1}`;
    const firstDay = index * SPENDING_WEEK_LENGTH + 1;
    const lastDay = Math.min(dayCount, firstDay + SPENDING_WEEK_LENGTH - 1);
    const weekLabel = `Week ${index + 1}`;

    return {
      key,
      // Narrower when the bucket is shorter, so a two-day stub at the end of the
      // month stops reading as a spending cliff.
      weight: (lastDay - firstDay + 1) / SPENDING_WEEK_LENGTH,
      label: `${firstDay}–${lastDay}`,
      caption: weekLabel,
      // Outside the axis the ordinal alone is meaningless, so name the actual dates: "22-28 April 2026".
      filterTitle: `${firstDay}–${lastDay} ${monthName}`,
      filterLabel: `${firstDay}–${lastDay} ${monthName} ${year}`,
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
  const grandTotal = rows.reduce((total, row) => total + row.total, 0);
  // Rows arrive largest first, so the first one too small to draw ends the ring.
  const tooSmall = rows.findIndex((row) => grandTotal > 0 && row.total / grandTotal < DONUT_MIN_SHARE);
  const drawnCount = Math.max(1, Math.min(DONUT_CATEGORY_LIMIT, tooSmall === -1 ? rows.length : tooSmall));

  const otherTotal = rows.slice(drawnCount).reduce((total, row) => total + row.total, 0);
  const segments = rows.slice(0, drawnCount).map((row, index) => {
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
      // Quieter than a category colour, but not the pale grey an inhibited arc
      // wears — Other would otherwise look exactly like a switched-off segment.
      colorVar: '--uc-neutral-600',
      // Says how many categories are folded into it, where three dots said
      // "more options" — the app's meaning for that glyph everywhere else.
      markerLabel: `+${rows.length - drawnCount}`,
    }]
    : segments;
}

/** Travel before a press on a chart counts as a period swipe rather than a tap on a bar or an arc. */
const PERIOD_SWIPE_THRESHOLD = 40;

/** Travel before the swipe takes pointer capture, so a plain tap never does. */
const PERIOD_SWIPE_CAPTURE_PX = 4;

/** How far the incoming period starts off-centre when a swipe commits. */
const PERIOD_SWIPE_SETTLE_PX = 72;

/** How long a committed swipe keeps swallowing clicks, so it never eats a later tap. */
const PERIOD_SWIPE_CLICK_GUARD_MS = 120;

/**
 * Swiping a chart steps periods exactly as the dots do — and only ever within
 * the current granularity. A swipe used to be able to carry the customer from a
 * month to a year total and then backwards through years.
 *
 * The gesture follows the pointer. It used to be a fling detector: nothing moved
 * while you dragged, so half the drags read as a dead surface, and the ones that
 * did land replaced the chart with no sense of which way you had gone. Now the
 * chart tracks the finger, springs back when the drag is too short, and the next
 * period slides in from the side you pulled towards. Dragging past the newest or
 * oldest period pulls against a spring, because there is nothing there.
 */
function usePeriodSwipe(
  onStep: (direction: -1 | 1) => void,
  bounds?: { canPrev: boolean; canNext: boolean },
) {
  const startXRef = useRef<number | null>(null);
  const pointerIdRef = useRef<number | undefined>(undefined);
  const captureTargetRef = useRef<HTMLElement | null>(null);
  const swipedRef = useRef(false);
  const guardTimeoutRef = useRef<number | null>(null);
  const settleTimeoutRef = useRef<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [isDragging, setDragging] = useState(false);

  const canPrev = bounds?.canPrev ?? true;
  const canNext = bounds?.canNext ?? true;
  const resistance = (deltaX: number) =>
    ((deltaX < 0 && !canNext) || (deltaX > 0 && !canPrev) ? 0.25 : 1) * deltaX;

  const release = () => {
    const target = captureTargetRef.current;
    const pointerId = pointerIdRef.current;
    if (target && pointerId !== undefined && target.hasPointerCapture?.(pointerId)) {
      target.releasePointerCapture(pointerId);
    }
    captureTargetRef.current = null;
    startXRef.current = null;
    pointerIdRef.current = undefined;
  };

  const swipeHandlers = {
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      startXRef.current = event.clientX;
      pointerIdRef.current = event.pointerId;
      swipedRef.current = false;
      setDragging(true);
      /*
       * No setPointerCapture here. While an element holds the capture the browser
       * fires the following `click` at *that* element, so every tap on an arc, a
       * bar or a dot inside the chart was delivered to the chart surface instead
       * and did nothing. Capture is taken in onPointerMove, once the press has
       * proven itself a swipe.
       */
    },
    onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
      const startX = startXRef.current;
      if (startX === null || pointerIdRef.current !== event.pointerId) return;

      const deltaX = event.clientX - startX;
      // Capture keeps the gesture alive if the finger leaves the chart. It throws
      // for a pointer the browser no longer considers active, which would take the
      // whole screen down with it.
      if (!captureTargetRef.current && Math.abs(deltaX) >= PERIOD_SWIPE_CAPTURE_PX) {
        try {
          event.currentTarget.setPointerCapture?.(event.pointerId);
          captureTargetRef.current = event.currentTarget;
        } catch {
          /* the gesture still works without capture */
        }
      }
      setOffset(resistance(deltaX));
    },
    onPointerUp: (event: React.PointerEvent<HTMLElement>) => {
      const startX = startXRef.current;
      if (startX === null) return;
      const deltaX = event.clientX - startX;
      release();

      const direction: -1 | 1 = deltaX < 0 ? 1 : -1;
      const commits = Math.abs(deltaX) >= PERIOD_SWIPE_THRESHOLD
        && (direction === 1 ? canNext : canPrev);

      if (!commits) {
        setDragging(false);
        setOffset(0);
        return;
      }

      // A committed swipe swallows the click the browser sends after it, and
      // then lets go. It used to hold the flag until some later click came
      // along and was eaten in its place — a tap on a dot or an arc, minutes on.
      swipedRef.current = true;
      if (guardTimeoutRef.current !== null) window.clearTimeout(guardTimeoutRef.current);
      guardTimeoutRef.current = window.setTimeout(() => {
        swipedRef.current = false;
        guardTimeoutRef.current = null;
      }, PERIOD_SWIPE_CLICK_GUARD_MS);

      // Park the incoming period on the far side with the transition still off,
      // then let it travel to centre: the motion carries the direction you swiped.
      setOffset(direction === 1 ? PERIOD_SWIPE_SETTLE_PX : -PERIOD_SWIPE_SETTLE_PX);
      onStep(direction);
      // A frame later, not a frame handler: requestAnimationFrame is throttled
      // to a standstill in a background tab, and the chart would stay parked
      // off-centre until the tab came back.
      if (settleTimeoutRef.current !== null) window.clearTimeout(settleTimeoutRef.current);
      settleTimeoutRef.current = window.setTimeout(() => {
        settleTimeoutRef.current = null;
        setDragging(false);
        setOffset(0);
      }, 16);
    },
    onPointerCancel: () => {
      release();
      setDragging(false);
      setOffset(0);
    },
    onClickCapture: (event: React.MouseEvent<HTMLElement>) => {
      if (!swipedRef.current) return;
      swipedRef.current = false;
      event.preventDefault();
      event.stopPropagation();
    },
    onDragStart: (event: React.DragEvent<HTMLElement>) => { event.preventDefault(); },
  };

  useEffect(() => () => {
    if (guardTimeoutRef.current !== null) window.clearTimeout(guardTimeoutRef.current);
    if (settleTimeoutRef.current !== null) window.clearTimeout(settleTimeoutRef.current);
  }, []);

  // A press that never became a swipe holds no capture, so releasing it outside
  // the chart never reaches the element's own handler. Without this the chart
  // would stay parked wherever the finger left it.
  useEffect(() => {
    const endStrayPress = (event: globalThis.PointerEvent) => {
      if (startXRef.current === null || pointerIdRef.current !== event.pointerId) return;
      if (captureTargetRef.current) return;
      startXRef.current = null;
      pointerIdRef.current = undefined;
      setDragging(false);
      setOffset(0);
    };
    window.addEventListener('pointerup', endStrayPress);
    window.addEventListener('pointercancel', endStrayPress);
    return () => {
      window.removeEventListener('pointerup', endStrayPress);
      window.removeEventListener('pointercancel', endStrayPress);
    };
  }, []);

  /** Spread on the element that should move; the handlers go on the surface. */
  const swipeMotionStyle = {
    transform: `translate3d(${offset}px, 0, 0)`,
    transition: isDragging ? 'none' : 'transform 220ms cubic-bezier(0.22, 0.61, 0.36, 1)',
  };

  return { swipeHandlers, swipeMotionStyle };
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

/**
 * The L1 header, which now collapses like the pages below it.
 *
 * At full size it holds around 180px of an 812px viewport — a fifth of the
 * screen — and it used to hold it at every scroll position, while the Expenses
 * and Breakdown pages one level down handed their large title over to a compact
 * one on scroll. `collapseProgress` runs 0→1 over the same distance those pages
 * use, so the three headers behave as one.
 */
function AnalyticsHeader({
  onMessagesClick,
  collapseProgress,
}: {
  onMessagesClick?: () => void;
  collapseProgress: number;
}) {
  const { t } = useLanguage();
  const { amountsHidden, toggleAmountsHidden } = useDemo();
  const title = t('runtime.analytics.title', 'Spending');
  const collapsed = collapseProgress > 0.99;

  // 24px title gutter, `uc-type-h1` and a three-glyph rail are the L1 contract every
  // sibling destination keeps — see HomeHeader.tsx:33, PaymentsScreen.tsx:55, MoreHeader.tsx:34.
  return (
    <header className="w-full bg-[var(--uc-app-bg)]" data-evo-analytics-header-collapsed={collapsed ? 'true' : 'false'}>
      {/* Same gutter as the page body below, so the title lines up with the cards. */}
      <div className="px-[16px] pb-[20px]">
        <div className="flex min-h-[32px] items-start gap-[8px]">
          <h1
            className="uc-type-h1 min-w-0 flex-1 text-[var(--uc-text)] transition-none"
            style={{
              opacity: 1 - collapseProgress,
              // The row keeps its height for the action rail; only the title travels.
              transform: `translateY(${-8 * collapseProgress}px)`,
            }}
          >
            {title}
          </h1>
          <HeaderActionRail>
            <AmountVisibilityButton hidden={amountsHidden} onToggle={toggleAmountsHidden} />
            <HeaderActionButton icon="profile" label={t('runtime.actions.profile', 'Profile')} />
            <HeaderActionButton icon="messages" label={t('runtime.actions.messages', 'Messages')} onClick={onMessagesClick} />
          </HeaderActionRail>
        </div>
      </div>
      {/* The compact title fades in exactly as the large one fades out, so the
          destination is always named. */}
      <div
        aria-hidden={collapseProgress < 0.5}
        className="pointer-events-none absolute inset-x-0 top-[54px] flex h-[48px] items-center justify-center px-[64px]"
        style={{ opacity: collapseProgress }}
      >
        <span className="truncate text-[17px] font-bold leading-[22px] text-[var(--uc-text)]">{title}</span>
      </div>
    </header>
  );
}

/**
 * The one period control, used identically on the overview, the analysis and the
 * breakdown.
 *
 * Before this the overview had no control at all — an invisible swipe and a row
 * of 6px dots — while the pages one level down had arrows. The customer had to
 * learn the feature twice, and could not name a period, pick a range, or reach
 * anything other than a single month or a whole year.
 */
/**
 * Scope and period, on one line.
 *
 * These were three stacked rows — the account on one, a 24px centred month on
 * the next, the chart toggle on a third — so the page opened on a column of
 * controls with nothing aligned to anything. They are two filters over the same
 * data, so they read as a pair: same size, same weight, same chevron, one
 * baseline. The month also stopped being a headline because the card below it
 * already carries "APRIL 2026" as its own eyebrow.
 */
/**
 * Which accounts the page is about, and — where there is one — the chart's own
 * toggle at the other end of the same line.
 *
 * The period used to sit between them; it is a heading, not a filter, and now
 * says so at heading size under this row.
 */
function SpendingScopeRow({
  scopeLabel,
  onOpenScope,
  trailing,
  className = '',
}: {
  scopeLabel: string;
  onOpenScope: () => void;
  /** Optional control at the far end, e.g. the chart-mode toggle. */
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-label="Analytics scope"
      className={`-ml-[4px] flex min-h-[32px] items-center gap-[8px] ${className}`.trim()}
    >
      <button
        type="button"
        data-evo-analytics-scope-trigger
        aria-haspopup="dialog"
        onClick={onOpenScope}
        className="inline-flex min-h-[32px] min-w-0 shrink items-center gap-[4px] rounded-[8px] px-[4px] text-[16px] font-bold leading-[20px] text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
      >
        <span className="truncate">{scopeLabel}</span>
        <AppIcon name="chevron-down-wide" size={18} color="currentColor" aria-hidden="true" />
      </button>

      {trailing ? <span className="ml-auto shrink-0">{trailing}</span> : null}
    </section>
  );
}

/**
 * The period, at the size of the thing it names, centred over the chart.
 *
 * Two dropdowns side by side read as a filter bar, and a period is not a
 * filter — it is what the page is about. So it leaves the control row and
 * becomes the heading of the chart underneath it, at the size the original
 * stepper used, minus the pair of bare chevrons that flanked it.
 */
function SpendingPeriodHeader({
  period,
  onOpenPeriodSheet,
  titleOverride,
  className = '',
}: {
  period: SpendingPeriodSelection;
  onOpenPeriodSheet: () => void;
  /** Names the slice the customer isolated on the chart. */
  titleOverride?: string | null;
  className?: string;
}) {
  const { t } = useLanguage();

  return (
    <section
      aria-label="Analytics period"
      className={`flex min-h-[52px] items-center justify-center ${className}`.trim()}
      data-evo-expense-interval={period.kind}
      data-evo-analytics-period-key={period.id}
    >
      <button
        type="button"
        data-evo-analytics-period-trigger
        aria-haspopup="dialog"
        aria-label={t('runtime.evo.spending.changePeriod')}
        onClick={onOpenPeriodSheet}
        className="flex min-w-0 max-w-full flex-col items-center rounded-[8px] px-[8px] py-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
      >
        <span className="flex min-w-0 max-w-full items-center gap-[2px]">
          <span className="truncate text-[24px] font-bold leading-[28px] tracking-[-0.02em] text-[var(--uc-text)]">
            {titleOverride ?? period.title}
          </span>
          <AppIcon name="chevron-down-wide" size={20} color="var(--uc-icon)" aria-hidden="true" />
        </span>
        {/* Both kinds carry a subtitle, so switching granularity never changes the header height. */}
        <span className="max-w-full truncate text-[16px] font-bold leading-[20px] text-[var(--uc-text-muted)]">
          {period.subtitle}
        </span>
      </button>
    </section>
  );
}

/**
 * How a period names itself on the rail: a month carries its year, a year total
 * says it is one so it is never read as a thirteenth month.
 */
function railPeriodLabel(item: SpendingPeriodSelection, t: (key: string) => string) {
  if (item.kind === 'month') return `${item.title} ${item.subtitle}`;
  if (item.kind === 'year') return t('runtime.evo.spending.yearTotal').replace('{year}', item.title);
  return item.title;
}

/**
 * Position on the rail, and the way to move along it.
 *
 * The dots are the whole stepping affordance: a pair of bare chevrons flanking
 * the title read as chrome and said nothing about how many periods there were.
 */
function SpendingPeriodDots({
  rail,
  onSelect,
  className = '',
}: {
  rail: { items: SpendingPeriodSelection[]; activeIndex: number };
  onSelect: (selection: SpendingPeriodSelection) => void;
  className?: string;
}) {
  const { t } = useLanguage();

  if (rail.items.length <= 1) return null;

  return (
    <div className={`flex justify-center ${className}`.trim()} data-evo-analytics-period-dots>
      <AccountCarouselIndicator
        count={rail.items.length}
        activeIndex={rail.activeIndex}
        itemLabel="period"
        itemLabels={rail.items.map((item) => railPeriodLabel(item, t))}
        windowSize={6}
        withBackdropBlur={false}
        onSelect={(index: number) => {
          const next = rail.items[index];
          if (next) onSelect(next);
        }}
      />
    </div>
  );
}

const PRESET_LABEL_KEYS: Record<SpendingPresetId, string> = {
  'this-month': 'presetThisMonth',
  'last-month': 'presetLastMonth',
  'last-3-months': 'presetLast3Months',
  'last-6-months': 'presetLast6Months',
  'year-to-date': 'presetYearToDate',
  'last-year': 'presetLastYear',
};

/** Presets, plus the custom range the screen had no way to express at all. */
function SpendingPeriodSheet({
  availableMonthKeys,
  current,
  onPick,
  onClose,
}: {
  availableMonthKeys: readonly string[];
  current: SpendingPeriodSelection;
  onPick: (selection: SpendingPeriodSelection) => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [customOpen, setCustomOpen] = useState(false);
  const [fromKey, setFromKey] = useState(current.monthKeys[0] ?? availableMonthKeys[0] ?? '');
  const [toKey, setToKey] = useState(
    current.monthKeys[current.monthKeys.length - 1] ?? availableMonthKeys[availableMonthKeys.length - 1] ?? '',
  );
  const latestMonthKey = availableMonthKeys[availableMonthKeys.length - 1] ?? '';
  const presetLabels = {
    thisMonth: t('runtime.evo.spending.presetThisMonth'),
    lastMonth: t('runtime.evo.spending.presetLastMonth'),
    last3Months: t('runtime.evo.spending.presetLast3Months'),
    last6Months: t('runtime.evo.spending.presetLast6Months'),
    yearToDate: t('runtime.evo.spending.presetYearToDate'),
    lastYear: t('runtime.evo.spending.presetLastYear'),
  };

  return (
    <BottomSheet title={t('runtime.evo.spending.periodSheetTitle')} onClose={onClose}>
      <div data-evo-analytics-period-sheet className="overflow-hidden rounded-[8px] bg-[var(--uc-surface)]">
        {SPENDING_PRESET_IDS.map((preset, index) => {
          const selection = buildPresetSelection(preset, latestMonthKey, availableMonthKeys, ANALYTICS_LOCALE, presetLabels);
          const selected = !customOpen && selection.id === current.id;

          return (
            <button
              key={preset}
              type="button"
              role="option"
              aria-selected={selected}
              data-evo-analytics-period-option={preset}
              onClick={() => onPick(selection)}
              className={`flex min-h-[56px] w-full items-center gap-[12px] px-[16px] py-[10px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-action)] ${index > 0 ? 'border-t-[0.5px] border-[var(--uc-border-muted)]' : ''}`}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[16px] font-medium leading-[20px] text-[var(--uc-text)]">
                  {t(`runtime.evo.spending.${PRESET_LABEL_KEYS[preset]}`)}
                </span>
                {/* The span each preset resolves to, so the choice is made on the
                    dates rather than on the label alone. */}
                <span className="mt-[2px] block truncate text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
                  {selection.kind === 'month'
                    ? `${selection.title} ${selection.subtitle}`
                    : selection.kind === 'year'
                      ? selection.title
                      : selection.subtitle}
                </span>
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

        <button
          type="button"
          role="option"
          aria-selected={customOpen}
          aria-expanded={customOpen}
          data-evo-analytics-period-option="custom"
          onClick={() => setCustomOpen((open) => !open)}
          className="flex min-h-[56px] w-full items-center gap-[12px] border-t-[0.5px] border-[var(--uc-border-muted)] px-[16px] py-[10px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-action)]"
        >
          <span className="min-w-0 flex-1 truncate text-[16px] font-medium leading-[20px] text-[var(--uc-text)]">
            {t('runtime.evo.spending.presetCustom')}
          </span>
          <span className={`grid size-[24px] place-items-center transition-transform duration-200 ${customOpen ? 'rotate-180' : ''}`}>
            <AppIcon name="chevron-down-wide" size={18} color="var(--uc-icon)" aria-hidden="true" />
          </span>
        </button>

        {customOpen ? (
          <div data-evo-analytics-period-custom className="border-t-[0.5px] border-[var(--uc-border-muted)] px-[16px] py-[14px]">
            <div className="flex gap-[12px]">
              <label className="min-w-0 flex-1">
                <span className="mb-[4px] block text-[13px] leading-[16px] text-[var(--uc-text-muted)]">{t('runtime.evo.spending.from')}</span>
                <select
                  data-evo-analytics-period-from
                  value={fromKey}
                  onChange={(event) => setFromKey(event.target.value)}
                  className="h-[44px] w-full rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-app-bg)] px-[10px] text-[15px] text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
                >
                  {availableMonthKeys.map((key) => (
                    <option key={key} value={key}>{`${monthLabel(key, ANALYTICS_LOCALE, 'short')} ${monthKeyYear(key)}`}</option>
                  ))}
                </select>
              </label>
              <label className="min-w-0 flex-1">
                <span className="mb-[4px] block text-[13px] leading-[16px] text-[var(--uc-text-muted)]">{t('runtime.evo.spending.to')}</span>
                <select
                  data-evo-analytics-period-to
                  value={toKey}
                  onChange={(event) => setToKey(event.target.value)}
                  className="h-[44px] w-full rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-app-bg)] px-[10px] text-[15px] text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
                >
                  {availableMonthKeys.map((key) => (
                    <option key={key} value={key}>{`${monthLabel(key, ANALYTICS_LOCALE, 'short')} ${monthKeyYear(key)}`}</option>
                  ))}
                </select>
              </label>
            </div>
            <button
              type="button"
              data-evo-analytics-period-apply
              onClick={() => onPick(buildCustomSelection(fromKey, toKey, availableMonthKeys, ANALYTICS_LOCALE))}
              className="mt-[14px] flex h-[44px] w-full items-center justify-center rounded-[8px] bg-[var(--uc-action-strong)] text-[15px] font-bold uppercase tracking-[0.02em] text-[var(--uc-static-white)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2"
            >
              {t('runtime.evo.spending.apply')}
            </button>
          </div>
        ) : null}
      </div>
    </BottomSheet>
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
  onStepPeriod,
  periodRail,
  onSelectPeriod,
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
  onStepPeriod: (direction: -1 | 1) => void;
  periodRail: { items: SpendingPeriodSelection[]; activeIndex: number };
  onSelectPeriod: (selection: SpendingPeriodSelection) => void;
}) {
  const { swipeHandlers, swipeMotionStyle } = usePeriodSwipe(onStepPeriod, {
    canPrev: periodRail.activeIndex > 0,
    canNext: periodRail.activeIndex < periodRail.items.length - 1,
  });

  if (segments.length === 0) {
    return (
      <section
        aria-label={`${direction === 'income' ? 'Income' : 'Expense'} chart`}
        className="mt-[16px] touch-pan-y select-none"
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
      <div data-evo-expense-chart-motion style={swipeMotionStyle}>
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
          axisCurrency={currency}
          header={(
            <div className="min-w-0">
              <p className="truncate text-[16px] leading-[20px] text-[var(--uc-text-muted)]">{headerLabel}</p>
              <FormattedAmount amount={headerAmount} country={country} currency={currency} className="mt-[2px]" />
            </div>
          )}
        />
      )}
      </div>

      {/* The same rail the overview shows under its card: position in the current
          granularity, and a target for the swipe to aim at. It stays put while the
          chart travels — an indicator that slides with its own content says nothing. */}
      <SpendingPeriodDots rail={periodRail} onSelect={onSelectPeriod} className="mt-[4px]" />
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

        {/* Same shape as the Payments OTHER shortcuts: the 48px roundel above,
            the label under it. A shortcut looks the same wherever it appears. */}
        <button
          type="button"
          aria-label="Add transaction"
          data-evo-add-transaction
          onClick={onAddTransaction}
          className="flex w-[74px] shrink-0 cursor-pointer flex-col items-center gap-[6px] rounded-[8px] text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]"
        >
          <ActionIconBubble iconName="add-money" />
          <span className="block w-full overflow-hidden text-center text-[14px] font-normal leading-[16px]">
            Add transaction
          </span>
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
  period,
  onStepPeriod,
  onOpenPeriodSheet,
  periodRail,
  onSelectPeriod,
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
  period: SpendingPeriodSelection;
  onStepPeriod: (direction: -1 | 1) => void;
  onOpenPeriodSheet: () => void;
  periodRail: { items: SpendingPeriodSelection[]; activeIndex: number };
  onSelectPeriod: (selection: SpendingPeriodSelection) => void;
  periodTitleOverride?: string | null;
  excludedSubcategories: ReadonlySet<string>;
  onToggleSubcategory: (subcategoryLabel: string) => void;
  onTransactionClick?: (transaction: SpendingAnalyticsTransaction) => void;
}) {
  const { swipeHandlers, swipeMotionStyle } = usePeriodSwipe(onStepPeriod, {
    canPrev: periodRail.activeIndex > 0,
    canNext: periodRail.activeIndex < periodRail.items.length - 1,
  });
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
      {/* The same two rows the analysis page carries, minus the chart toggle. */}
      <SpendingScopeRow className="mt-[4px]" scopeLabel={scopeLabel} onOpenScope={onOpenScope} />
      <SpendingPeriodHeader
        className="mt-[8px]"
        period={period}
        onOpenPeriodSheet={onOpenPeriodSheet}
        titleOverride={periodTitleOverride}
      />

      {subcategories.length > 0 ? (
        // Swiping the bubbles walks periods, exactly as swiping the chart does one page up.
        <section aria-label="Subcategories" className="mt-[8px] touch-pan-y select-none pt-[8px]" {...swipeHandlers}>
          {/* The bubbles the PFM category screen uses — sized by share, tap one to drop it from the list. */}
          <div data-evo-expense-chart-motion style={swipeMotionStyle}>
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
          </div>

          <SpendingPeriodDots rail={periodRail} onSelect={onSelectPeriod} className="mt-[4px]" />
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
  /*
   * "You kept 9% of what came in" claimed the money was saved; on the 30th it may
   * simply not have left the account yet. The line states the difference instead,
   * which is what the figure above it actually is.
   */
  const netWord = `${format(summary.netTotal)} ${summary.currency}`;

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
        {/* The answer first: what the period left behind. The two bars take the
            rule's place under it, and the figures that produced them sit beneath
            the bar each one fills — money in under the green, money out under the
            black. */}
        <NetCashflowBlock
          className="mt-[8px]"
          netTotal={summary.netTotal}
          incomeTotal={summary.incomeTotal}
          formattedAbsoluteNet={netWord}
          formattedSignedNet={`${summary.netTotal >= 0 ? '+' : '−'}${format(summary.netTotal)} ${summary.currency}`}
          dataAttribute="data-evo-analytics-summary-net"
          labelDataAttribute="data-evo-analytics-summary-net-label"
        />
      </div>

      {/* The bars are a separate reading from the sentence above them; at the
          card's own 12px rhythm they read as one crowded block. */}
      <div className="mt-[8px]">
        <CashFlowBars
          incomeTotal={summary.incomeTotal}
          spendingTotal={summary.spendingTotal}
          barDataAttribute="data-evo-analytics-flow-bar"
          barsDataAttribute="data-evo-analytics-flow-bars"
        />

        <div className="mt-[12px] flex items-start justify-between gap-[12px]">
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

          <button
            type="button"
            data-evo-analytics-open-expenses
            onClick={onOpenExpenses}
            className="min-w-0 rounded-[8px] text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-surface)]"
          >
            <span className="flex items-center justify-end gap-[6px] text-[16px] font-bold leading-[20px] text-[color-mix(in_srgb,var(--uc-text)_72%,transparent)]">
              <CashFlowDot flow="out" />
              Money out
            </span>
            <span className="mt-[2px] flex items-baseline justify-end gap-[2px] whitespace-nowrap">
              <span className="text-[20px] font-bold leading-[24px] tracking-[-0.02em]">{spent.integer}</span>
              <span className="text-[14px] font-bold leading-[18px]">{spent.separator}{spent.decimals} {summary.currency}</span>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}

/**
 * The statement cards, as a rail.
 *
 * The rail is back because the peeking neighbour is what says "there is more
 * here, swipe" — a single card said nothing. What changed is what the rail
 * contains: only periods of the *current* granularity, so a swipe can no longer
 * carry the customer from April 2026 into "Total 2026" and then into "Total
 * 2025", which is what it used to do.
 */
function SpendingPeriodCarousel({
  rail,
  summaries,
  country,
  amountsHidden,
  onSelect,
  onOpenIncome,
  onOpenExpenses,
}: {
  rail: { items: SpendingPeriodSelection[]; activeIndex: number };
  summaries: readonly SpendingAnalyticsSummary[];
  country: CountryId;
  amountsHidden: boolean;
  onSelect: (selection: SpendingPeriodSelection) => void;
  onOpenIncome: () => void;
  onOpenExpenses: () => void;
}) {
  const { t } = useLanguage();
  const railRef = useRef<HTMLDivElement>(null);
  const snapTimeoutRef = useRef<number | null>(null);
  const { activeIndex, items } = rail;
  // Where the rail itself last landed, and which rail that was. Together they
  // let the sync effect below tell a selection made elsewhere — a dot, the
  // period sheet — from the customer's own swipe, which must never be yanked
  // back to where it started.
  // -1 and undefined, never the current values: the first run of the effect
  // below has to position the rail, or the overview opens on the oldest month
  // while the state says the newest.
  const railIndexRef = useRef(-1);
  const railKeyRef = useRef<string | undefined>(undefined);

  /**
   * The scroll distance from one card to the next.
   *
   * Measured off a card, never off the rail's first element child: the cards
   * sit inside `display: contents` wrappers that carry `inert`, and an element
   * that generates no box reports `offsetWidth` 0. The step was coming out as
   * the bare 12px gap, so a swipe moved a twelfth of a card and every settle
   * rounded to a month nobody had asked for.
   */
  const measureRail = useCallback(() => {
    const node = railRef.current;
    if (!node) return null;
    const cards = node.querySelectorAll<HTMLElement>('[data-evo-analytics-period-card]');
    const first = cards[0];
    if (!first) return null;

    // The distance between two cards' layout positions, never their painted
    // width: the device frame is a scaled element, so getBoundingClientRect
    // reports the card in screen pixels while scrollLeft is in layout pixels.
    // Mixing the two is what parked the rail halfway between two months.
    const second = cards[1];
    const gap = Number.parseFloat(getComputedStyle(node).gap || '0');
    const step = second ? second.offsetLeft - first.offsetLeft : first.offsetWidth + gap;
    const maxScroll = Math.max(0, node.scrollWidth - node.clientWidth);
    return step > 0 ? { node, step, maxScroll } : null;
  }, []);

  /**
   * Where a card parks.
   *
   * Every card but the last one sits flush with the content column's left edge,
   * the peek of its neighbour to the right. The last one has no neighbour, so it
   * parks against the right edge instead — level with the section below it,
   * rather than leaving a card's worth of empty rail beside it.
   */

  const offsetForIndex = useCallback((index: number, step: number, maxScroll: number) =>
    Math.min(index * step, maxScroll), []);

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const measured = measureRail();
    if (!measured) return;
    const { node, step, maxScroll } = measured;
    const clamped = Math.max(0, Math.min(index, items.length - 1));
    const left = offsetForIndex(clamped, step, maxScroll);

    railIndexRef.current = clamped;
    if (Math.abs(node.scrollLeft - left) > 1) {
      if (typeof node.scrollTo === 'function') node.scrollTo({ left, behavior });
      else node.scrollLeft = left;
    }

    const next = items[clamped];
    if (next && next.id !== items[activeIndex]?.id) onSelect(next);
  }, [activeIndex, items, measureRail, offsetForIndex, onSelect]);

  const settle = useCallback(() => {
    const measured = measureRail();
    if (!measured) return;
    scrollToIndex(Math.round(measured.node.scrollLeft / measured.step));
  }, [measureRail, scrollToIndex]);

  const clearSnapTimeout = () => {
    if (snapTimeoutRef.current === null) return;
    window.clearTimeout(snapTimeoutRef.current);
    snapTimeoutRef.current = null;
  };

  const { dragHandlers, isDragging, isPressActiveRef } = useDragCarousel({
    carouselRef: railRef,
    enabled: items.length > 1,
    onSettle: settle,
  });

  // Jump, never animate, when the selection changes from outside the rail —
  // a dot, or the period sheet. A swipe already put the rail where it belongs;
  // re-applying scrollLeft on the render it triggers is what made the gesture
  // stutter halfway through.
  useEffect(() => {
    const key = items[0]?.id;
    const railChanged = key !== railKeyRef.current;
    railKeyRef.current = key;
    if (!railChanged && railIndexRef.current === activeIndex) return;

    railIndexRef.current = activeIndex;
    const measured = measureRail();
    if (!measured) return;
    measured.node.scrollLeft = offsetForIndex(activeIndex, measured.step, measured.maxScroll);
  }, [activeIndex, items, measureRail, offsetForIndex]);

  /*
   * A card is one rail-width wide, so the scroll position that centres it is
   * only correct for the width it was measured at. The device frame animates
   * in and the panel resizes with the window, and the rail kept the old pixel
   * offset — which is why Spending opened on half of one month and half of
   * another instead of on a card.
   */
  useEffect(() => {
    const node = railRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => {
      if (isPressActiveRef.current || railIndexRef.current < 0) return;
      const measured = measureRail();
      if (!measured) return;
      measured.node.scrollLeft = offsetForIndex(railIndexRef.current, measured.step, measured.maxScroll);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [isPressActiveRef, measureRail, offsetForIndex]);

  useEffect(() => () => clearSnapTimeout(), []);

  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    if (isPressActiveRef.current) return;
    void event;
    clearSnapTimeout();
    snapTimeoutRef.current = window.setTimeout(settle, 120);
  };

  return (
    <section
      data-evo-analytics-period-carousel
      className="mt-[16px]"
      /* The granularity and the selection used to be stamped on the control row
         above the rail. The rail is now the only period control the overview
         has, so it carries them. */
      data-evo-expense-interval={items[activeIndex]?.kind}
      data-evo-analytics-period-key={items[activeIndex]?.id}
    >
      <div
        ref={railRef}
        role="region"
        aria-label="Spending periods"
        tabIndex={0}
        onScroll={onScroll}
        {...dragHandlers}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') { event.preventDefault(); scrollToIndex(activeIndex + 1); }
          if (event.key === 'ArrowLeft') { event.preventDefault(); scrollToIndex(activeIndex - 1); }
        }}
        /* Bleeds to the device edges so the neighbouring cards peek in at both
           sides; that peek is the swipe affordance. */
        /* The trailing padding is the peek width: without it the last card cannot
           scroll far enough to sit flush and always lands 28px out. */
        className={`-mx-[16px] flex items-stretch gap-[12px] overflow-x-auto overflow-y-visible overscroll-x-contain px-[16px] pb-[6px] scrollbar-hide select-none touch-pan-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
      >
        {items.map((item, index) => {
          const summary = summaries[index];
          if (!summary) return null;
          const isActive = index === activeIndex;

          return (
            <div
              key={item.id}
              className="contents"
              /* Off-screen cards leave the tab order and the accessibility tree.
                 Without this a keyboard user walked ten buttons for five periods,
                 eight of them for months they could not see. */
              {...(isActive ? {} : { inert: '' })}
              aria-hidden={isActive ? undefined : true}
            >
            <SpendingMonthCard
              summary={summary}
              country={country}
              amountsHidden={amountsHidden}
              periodLabel={railPeriodLabel(item, t)}
              onOpenIncome={onOpenIncome}
              onOpenExpenses={onOpenExpenses}
              dragHandlers={dragHandlers}
            />
            </div>
          );
        })}

      </div>
    </section>
  );
}

function SpendingScopeSheet({
  scopes,
  selectedScopeId,
  onScopeChange,
  includeOwnTransfers,
  onToggleOwnTransfers,
  onClose,
}: {
  scopes: readonly AnalyticsScope[];
  selectedScopeId: string;
  onScopeChange: (scopeId: string) => void;
  includeOwnTransfers: boolean;
  onToggleOwnTransfers: () => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();

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

      {/* Moving money between your own accounts is not spending. It was counted
         as both an expense and an income, so the same money inflated both
         totals; excluded by default, and the switch says so. */}
      <button
        type="button"
        role="switch"
        data-evo-analytics-own-transfers-toggle
        aria-checked={!includeOwnTransfers}
        onClick={onToggleOwnTransfers}
        className="mt-[12px] flex w-full items-start gap-[12px] rounded-[8px] bg-[var(--uc-surface)] px-[16px] py-[14px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-action)]"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-medium leading-[20px] text-[var(--uc-text)]">
            {t('runtime.evo.spending.excludeTransfers')}
          </span>
          <span className="mt-[2px] block text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
            {t('runtime.evo.spending.transfersExcludedNote')}
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`mt-[2px] grid h-[24px] w-[40px] shrink-0 items-center rounded-full px-[3px] transition-colors ${!includeOwnTransfers ? 'bg-[var(--uc-action)]' : 'bg-[var(--uc-surface-muted)]'}`}
        >
          <span className={`block size-[18px] rounded-full bg-[var(--uc-static-white)] shadow-sm transition-transform ${!includeOwnTransfers ? 'translate-x-[16px]' : ''}`} />
        </span>
      </button>
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
  seeAllLabel,
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
  /** Money out and Money in both ended in "See all categories" and went to different pages. */
  seeAllLabel: string;
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
          {seeAllLabel}
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
  period,
  onStepPeriod,
  onOpenPeriodSheet,
  periodRail,
  onSelectPeriod,
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
  period: SpendingPeriodSelection;
  onStepPeriod: (direction: -1 | 1) => void;
  onOpenPeriodSheet: () => void;
  periodRail: { items: SpendingPeriodSelection[]; activeIndex: number };
  onSelectPeriod: (selection: SpendingPeriodSelection) => void;
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
      {/* Scope and the chart toggle share one line; the period names the chart
          underneath it, centred, and opens the period sheet. */}
      <SpendingScopeRow
        className="mt-[4px]"
        scopeLabel={scopeLabel}
        onOpenScope={onOpenScope}
        trailing={<ExpenseChartModeToggle mode={chartMode} onModeChange={onChartModeChange} />}
      />
      <SpendingPeriodHeader
        className="mt-[8px]"
        period={period}
        onOpenPeriodSheet={onOpenPeriodSheet}
        titleOverride={periodTitleOverride}
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
        onStepPeriod={onStepPeriod}
        periodRail={periodRail}
        onSelectPeriod={onSelectPeriod}
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
  const { t } = useLanguage();
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
  /** Every month the customer has activity in, oldest first — the axis presets sit on. */
  const allMonthKeys = useMemo(
    () => listSpendingMonthKeys(country, products, transactionCategoryOverrides),
    [country, products, transactionCategoryOverrides],
  );
  const latestMonthKey = allMonthKeys[allMonthKeys.length - 1] ?? '';
  const presetLabels = useMemo(() => ({
    thisMonth: t('runtime.evo.spending.presetThisMonth'),
    lastMonth: t('runtime.evo.spending.presetLastMonth'),
    last3Months: t('runtime.evo.spending.presetLast3Months'),
    last6Months: t('runtime.evo.spending.presetLast6Months'),
    yearToDate: t('runtime.evo.spending.presetYearToDate'),
    lastYear: t('runtime.evo.spending.presetLastYear'),
  }), [t]);

  const [analyticsState, dispatchAnalytics] = useReducer(
    evoAnalyticsReducer,
    createEvoAnalyticsState(
      initialScopeId,
      initialDirection,
      buildPresetSelection('this-month', latestMonthKey, allMonthKeys, ANALYTICS_LOCALE, presetLabels),
    ),
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
    period,
    periodSheetOpen,
    includeOwnTransfers,
  } = analyticsState;
  const [contentScrollTop, setContentScrollTop] = useState(0);
  const contentRef = useRef<HTMLElement>(null);
  const [scrollSlack, setScrollSlack] = useState(0);
  const headerReleaseRef = useRef(0);
  const [openBreakdownRow, setOpenBreakdownRow] = useState<ExpenseBreakdownRow | null>(null);
  const [excludedSubcategories, setExcludedSubcategories] = useState<ReadonlySet<string>>(() => new Set());
  const activeScope = scopes.find((scope) => scope.id === selectedScopeId) ?? scopes[0];

  useEffect(() => {
    if (!scopes.some((scope) => scope.id === selectedScopeId)) {
      dispatchAnalytics({ type: 'set-field', field: 'selectedScopeId', value: 'all-accounts' });
    }
  }, [scopes, selectedScopeId]);

  /**
   * One summary, over exactly the months the selection names. The old screen
   * could only read a summary out of a fixed map of calendar months and calendar
   * years, which is why nothing between the two was reachable.
   */
  const summary = useMemo(
    () => createSpendingRangeSummary(
      country,
      activeScope?.products ?? [],
      period.monthKeys,
      {
        key: period.id,
        label: period.title,
        year: period.monthKeys[0]?.split('-')[0] ?? '',
        kind: period.kind === 'month' ? 'month' : 'year',
      },
      transactionCategoryOverrides,
      { includeOwnTransfers },
    ),
    [activeScope?.products, country, includeOwnTransfers, period, transactionCategoryOverrides],
  );

  const stepPeriod = useCallback((direction: -1 | 1) => {
    const next = stepSelection(period, direction, allMonthKeys, ANALYTICS_LOCALE, t('runtime.evo.spending.presetLastYear'));
    if (next) dispatchAnalytics({ type: 'select-period', period: next });
  }, [allMonthKeys, period, t]);

  const selectPeriod = useCallback((selection: SpendingPeriodSelection) => {
    dispatchAnalytics({ type: 'select-period', period: selection });
  }, []);

  /** Every period at this granularity, so the dots can say how many there are. */
  const periodRail = useMemo(
    () => buildPeriodRail(period, allMonthKeys, ANALYTICS_LOCALE, t('runtime.evo.spending.presetLastYear')),
    [allMonthKeys, period, t],
  );

  /** One summary per card in the rail, so the neighbours can actually peek in. */
  const railSummaries = useMemo(
    () => periodRail.items.map((item) => createSpendingRangeSummary(
      country,
      activeScope?.products ?? [],
      item.monthKeys,
      {
        key: item.id,
        label: item.title,
        year: item.monthKeys[0]?.split('-')[0] ?? '',
        kind: item.kind === 'month' ? 'month' : 'year',
      },
      transactionCategoryOverrides,
      { includeOwnTransfers },
    )),
    [activeScope?.products, country, includeOwnTransfers, periodRail.items, transactionCategoryOverrides],
  );
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
  /*
   * The arcs actually drawn, not the first N rows: the ring stops early when a
   * row is too small to carry a marker, and taking the limit instead left rows
   * that Other visibly folds in outside the filter it applied.
   */
  const primarySplitKeys = useMemo(
    () => new Set(
      donutSegments
        .filter((segment) => segment.category !== EXPENSE_OTHER_CATEGORY)
        .map((segment) => segment.category),
    ),
    [donutSegments],
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
  const bucketKind = selectionBucketKind(period);
  const expenseBars = useMemo(
    () => buildExpenseBars(period, summary, categoryFilteredExpenses),
    [categoryFilteredExpenses, period, summary],
  );
  const activeBucketKey = selectedBucketKey && expenseBars.some((bar) => bar.key === selectedBucketKey)
    ? selectedBucketKey
    : null;
  const visibleExpenses = useMemo(
    () => categoryFilteredExpenses.filter((transaction) => (
      !activeBucketKey || getExpenseBucketKey(transaction, bucketKind) === activeBucketKey
    )),
    [activeBucketKey, bucketKind, categoryFilteredExpenses],
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
  /*
   * "Other" is one arc but many categories, and counting it as one made a
   * selection of the +11 arc plus two more read as "3 categories" while the
   * figure under it covered thirteen.
   */
  const foldedOtherCount = Math.max(0, donutRows.length - primarySplitKeys.size);
  const expenseSelectionCount = Array.from(activeSplitSelection).reduce(
    (total, key) => total + (key === EXPENSE_OTHER_CATEGORY ? foldedOtherCount : 1),
    0,
  );
  // One named row keeps its own name; anything wider is counted.
  const singleSelectionLabel = expenseSelectionLabels.length === 1 && expenseSelectionCount === 1
    ? expenseSelectionLabels[0]
    : null;
  const countedSelectionLabel = expenseSelectionCount > 0
    ? `${expenseSelectionCount} ${SPLIT_MODE_NOUNS[activeSplitMode]}`
    : null;
  const expenseFilterLabel = [
    singleSelectionLabel ?? countedSelectionLabel,
    activeBucketLabel,
  ].filter(Boolean).join(' · ') || null;
  const visibleExpensesTotal = visibleExpenses.reduce((total, transaction) => total + Math.abs(transaction.amount), 0);
  const expenseHeaderAmount = activeSplitSelection.size === 0 && !activeBucketKey
    ? analysisDirection === 'income' ? summary.incomeTotal : summary.spendingTotal
    : visibleExpensesTotal;
  // The chart headline names whatever the user has narrowed to, falling back to the period total.
  const expenseSelectionLabel = singleSelectionLabel
    ?? countedSelectionLabel
    ?? (analysisDirection === 'income' ? 'Total income' : 'Total spent');
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
      && (!activeBucketKey || getExpenseBucketKey(transaction, bucketKind) === activeBucketKey)
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
  /*
   * Every view here shares one scroller, so opening a category from halfway down
   * the list used to land the new page already scrolled — its chart cut off and
   * its header collapsed. Each level starts at its own top.
   */
  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;
    element.scrollTop = 0;
    setContentScrollTop(0);
  }, [view, openBreakdownRow?.key, analysisDirection]);
  // A subcategory filter only makes sense for the category it was picked in.
  useEffect(() => {
    setExcludedSubcategories(new Set());
  }, [analysisDirection, openBreakdownRow?.key, period.id]);
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


  const openPeriodSheet = () => dispatchAnalytics({ type: 'set-field', field: 'periodSheetOpen', value: true });

  /*
   * Adding a cash movement needs a date to attach it to, so it is offered on a
   * single month and withheld on a range or a whole year — where the invitation
   * would be to add something "in 2025".
   */
  const addTransactionForPeriod = period.kind === 'month' ? onAddTransaction : undefined;

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
        <AnalyticsHeader onMessagesClick={onMessagesClick} collapseProgress={headerCollapseProgress} />
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
            period={period}
            onStepPeriod={stepPeriod}
            onOpenPeriodSheet={openPeriodSheet}
            periodRail={periodRail}
            onSelectPeriod={selectPeriod}
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
            period={period}
            onStepPeriod={stepPeriod}
            onOpenPeriodSheet={openPeriodSheet}
            periodRail={periodRail}
            onSelectPeriod={selectPeriod}
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
            onAddTransaction={addTransactionForPeriod}
          />
        ) : (
          <div
            data-evo-analytics-summary
            data-evo-analytics-scope={activeScope?.id ?? 'all-accounts'}
            className="flex min-w-0 flex-col gap-[28px]"
          >
            <div data-evo-analytics-overview-controls className="flex min-w-0 flex-col gap-[0px]">
              <SpendingScopeRow
                scopeLabel={activeScope?.label ?? 'All accounts'}
                onOpenScope={() => dispatchAnalytics({ type: 'set-field', field: 'scopeSheetOpen', value: true })}
              />

              {/* No period dropdown beside it: on the overview the rail itself is
                  the period control — swipe it, or tap a dot. */}
              <SpendingPeriodCarousel
                rail={periodRail}
                summaries={railSummaries}
                country={country}
                amountsHidden={amountsHidden}
                onSelect={selectPeriod}
                onOpenIncome={() => openAnalysis('income')}
                onOpenExpenses={() => openAnalysis('expense')}
              />

              {/* Under the card, where a carousel says how many there are and
                  which one you are on. */}
              <SpendingPeriodDots rail={periodRail} onSelect={selectPeriod} className="mt-[8px]" />
            </div>

            <SpendingTopCategories
              title={t('runtime.analytics.moneyOut', 'Money out')}
              ariaLabel={t('runtime.analytics.moneyOut', 'Money out')}
              seeAllLabel={t('runtime.evo.spending.allSpendingCategories')}
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
              title={t('runtime.analytics.moneyIn', 'Money in')}
              ariaLabel={t('runtime.analytics.moneyIn', 'Money in')}
              seeAllLabel={t('runtime.evo.spending.allIncomeCategories')}
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
          includeOwnTransfers={includeOwnTransfers}
          onToggleOwnTransfers={() => dispatchAnalytics({ type: 'toggle-own-transfers' })}
          onClose={() => dispatchAnalytics({ type: 'set-field', field: 'scopeSheetOpen', value: false })}
        />
      ) : null}

      {periodSheetOpen ? (
        <SpendingPeriodSheet
          availableMonthKeys={allMonthKeys}
          current={period}
          onPick={(selection) => dispatchAnalytics({ type: 'select-period', period: selection })}
          onClose={() => dispatchAnalytics({ type: 'set-field', field: 'periodSheetOpen', value: false })}
        />
      ) : null}
    </div>
  );
}
