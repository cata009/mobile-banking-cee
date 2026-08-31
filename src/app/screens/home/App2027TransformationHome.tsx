import { Children, cloneElement, isValidElement, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type UIEvent } from 'react';
import { AppIcon } from '@/app/components/icons';
import AccountCarouselIndicator from '@/app/components/accounts/AccountCarouselIndicator';
import GhostBanner from '@/app/components/cards/GhostBanner';
import TotalRow from '@/app/components/TotalRow';
import ShopsmartOfferCard from '@/app/components/shopsmart/ShopsmartOfferCard';
import { maskAmountParts } from '@/app/utils/amountPrivacy';
import type { Product, ProductCategory } from '@/data/products';
import { formatEvo2027Amount } from '@/app/utils/evo2027Formatting';
import { buildInvestmentSecurities, calculateInvestmentPortfolioPerformance } from '@/app/config/investmentsPortfolioConfig';
import { calculateLatestWeekSpending, createSpendingAnalyticsTimeline } from '@/data/spendingAnalytics';
import type { CountryId } from '@/app/state/demoTypes';
import { getProductsMenuForCountry, type ShopSmartOfferCategory } from '@/app/config/productsMenuConfig';
import {
  EVO_CREDIT_CARD_MINIMUM_RATE,
  EVO_SAVING_ACCOUNT_ANNUAL_RATE,
  getEvoCreditTerms,
} from '@/app/config/evoCreditTerms';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useDragCarousel } from '@/hooks/useDragCarousel';
import savingsCactus from '@/assets/app2027/home-summary-savings-cactus.png';
import loansHouse from '@/assets/app2027/home-summary-loans-house.png';
import insuranceUmbrella from '@/assets/app2027/home-summary-insurance-umbrella.png';
import accountsLighthouse from '@/assets/6f4a518088433560480f90c7a7448fdc1d294def.png';
// UniCredit's own Prime campaign photography, outpainted to a panoramic frame.
// The red double-chevron is composited into each shot by the brand's art
// direction — it passes behind the subject and in front of the background,
// which is the depth our own overlay could only fake with a clip path. The
// source frames are 600x500; extending them sideways means the card's own
// 2.3:1 band crops almost nothing, so the mark never falls outside it.
import ucArrowGolf from '@/assets/app2027/uc-prime/premiovy-ucet-wide-v2.png';
import ucArrowClimber from '@/assets/app2027/uc-prime/pojisteni-karty-wide-v2.png';
import ucArrowPhone from '@/assets/app2027/uc-prime/digitalni-reseni-wide-v2.png';
import ucArrowSailing from '@/assets/app2027/uc-prime/Prime-Sailing-banner-wide-v2.png';
import ucArrowJet from '@/assets/app2027/uc-prime/exkluzivni-vyhody-prime-wide-v2.png';
import ucArrowOffice from '@/assets/app2027/uc-prime/Prime-Office-banner-wide-v2.png';
import ShopsmartCategoryChips from '@/app/components/shopsmart/ShopsmartCategoryChips';
import App2027Activity from './App2027Activity';
import App2027ProductAccordions, { CurrencyBadge, TrendBadge } from './App2027ProductAccordions';

export type TransformationTab = 'accounts' | 'savings' | 'credits' | 'insurance';
type FormattedAmount = { integer: string; decimals: string; currency: string };
type ProductPerformance = { label: string; color: string; direction: 'up' | 'down' };

export interface App2027TransformationHomeProps {
  categories: ProductCategory[];
  country: CountryId;
  amountsHidden: boolean;
  calculateTotal: (products: Product[]) => FormattedAmount;
  calculateTotalAvailable: () => FormattedAmount;
  calculateTotalOwed: () => FormattedAmount;
  formatProductAmount: (product: Product) => FormattedAmount;
  getProductDisplayNumber: (product: Product) => string;
  onProductClick: (product: Product) => void;
  onSeeAllTransactions?: () => void;
  onAccountInfoClick?: (product: Product) => void;
  onDomesticPaymentClick?: () => void;
  onPaymentsClick?: () => void;
  onCardDetailsClick?: (product: Product) => void;
  onCardOptionsClick?: (product: Product) => void;
  onProductsClick?: () => void;
  /** Opens one specific catalogue product, so a campaign lands on what it advertised. */
  onOfferOpen?: (shelfItemId: string) => void;
  /** Opens Spending, optionally on a named period. */
  onSpendingClick?: (periodPresetId?: string) => void;
  onTransactionOpen?: Parameters<typeof App2027Activity>[0]['onTransactionOpen'];
}

const TAB_ORDER: readonly TransformationTab[] = ['accounts', 'savings', 'credits', 'insurance'];

type InterestCampaign = {
  /** Key into `runtime.evo.interest.cards`, so the copy is the market's. */
  copyKey: string;
  /**
   * The catalogue product this campaign advertises. Every campaign used to hand
   * the customer to the top of the Offers shelf and leave them to re-find what
   * they had just tapped; each now opens its own product.
   */
  target: string;
  image: string;
  imagePosition: string;

};

/* Panoramic frames, so every card is centred and nothing has to be nudged. */
const INTEREST_CAMPAIGNS: Record<TransformationTab, readonly InterestCampaign[]> = {
  accounts: [
    { copyKey: 'roundups', target: 'saving-account', image: ucArrowPhone, imagePosition: 'center center' },
    { copyKey: 'nextStep', target: 'current-account', image: ucArrowOffice, imagePosition: 'center center' },
    { copyKey: 'safetyNetAccounts', target: 'term-deposit', image: ucArrowGolf, imagePosition: 'center center' },
  ],
  savings: [
    { copyKey: 'safetyNet', target: 'saving-account', image: ucArrowClimber, imagePosition: 'center center' },
    { copyKey: 'growSavings', target: 'term-deposit', image: ucArrowSailing, imagePosition: 'center center' },
    { copyKey: 'nextPlan', target: 'mutual-funds', image: ucArrowJet, imagePosition: 'center center' },
  ],
  credits: [
    { copyKey: 'financing', target: 'personal-loan', image: ucArrowOffice, imagePosition: 'center center' },
    { copyKey: 'mortgage', target: 'mortgage-loan', image: ucArrowGolf, imagePosition: 'center center' },
    { copyKey: 'consumerLoan', target: 'credit-card', image: ucArrowPhone, imagePosition: 'center center' },
  ],
  insurance: [
    { copyKey: 'homeCover', target: 'home-insurance', image: ucArrowClimber, imagePosition: 'center center' },
    { copyKey: 'travelCover', target: 'travel-insurance', image: ucArrowJet, imagePosition: 'center center' },
    { copyKey: 'lifeCover', target: 'life-insurance', image: ucArrowSailing, imagePosition: 'center center' },
  ],
};

type ShopSmartCategory = 'popular' | ShopSmartOfferCategory;

/**
 * Money typography, in three roles instead of five.
 *
 * Home used to carry five different integer/decimal pairings — 24/16, 28/16,
 * 16/12, 16/14 and 14/14 — with the decimals bold in some and normal in
 * others. Amounts are the app's signature, so they follow one rule: the
 * integer is bold and sets the role's size, the decimals and currency are a
 * step down and always `font-medium`.
 *
 *  hero      28/16  the one figure a tab is about
 *  product   24/14  a product's own balance
 *  support   16/12  anything that qualifies a figure above it
 */
type MoneyRole = 'hero' | 'product' | 'support';

const MONEY_ROLE_CLASSES: Record<MoneyRole, { integer: string; decimals: string }> = {
  hero: {
    integer: 'text-[28px] font-bold leading-[28px] tracking-[-0.025em]',
    decimals: 'text-[16px] font-medium leading-[20px]',
  },
  product: {
    integer: 'text-[24px] font-bold leading-[27px] tracking-[-0.025em]',
    decimals: 'text-[14px] font-medium leading-[18px]',
  },
  support: {
    integer: 'text-[16px] font-bold leading-[20px] tracking-[-0.018em]',
    decimals: 'text-[12px] font-medium leading-[16px]',
  },
};

function Money({
  amount,
  hidden,
  role = 'product',
  className = '',
  ...rest
}: { amount: FormattedAmount; hidden: boolean; role?: MoneyRole; className?: string } & Record<string, unknown>) {
  const display = maskAmountParts(amount, hidden);
  const classes = MONEY_ROLE_CLASSES[role];

  return (
    <span
      {...rest}
      data-home-money={role}
      className={`inline-flex items-baseline whitespace-nowrap ${className}`.trim()}
    >
      <span className={classes.integer}>{display.integer}</span>
      <span className={classes.decimals}>{display.decimals} {display.currency}</span>
    </span>
  );
}

/**
 * The portfolio's gain rendered the way the portfolio screen renders it: signed amount, signed
 * percent, green when up and red when down. Returns undefined when there is nothing invested —
 * a flat card is better than a 0,00 that looks like a loss.
 */
function buildPortfolioPerformance(investments: Product[], country: CountryId, amountsHidden: boolean): ProductPerformance | undefined {
  const first = investments[0];
  if (!first) return undefined;

  const { performanceAmount, performancePercent } = calculateInvestmentPortfolioPerformance(
    buildInvestmentSecurities(investments, country),
  );
  if (performanceAmount === 0) return undefined;

  const up = performanceAmount > 0;
  const sign = up ? '+' : '-';
  const amount = formatEvo2027Amount(performanceAmount, first.currency);
  // The percent borrows the amount's decimal mark so both halves follow the Evo 2027 number
  // contract.
  const separator = amount.decimals.charAt(0) || '.';
  const percent = `${Math.abs(performancePercent).toFixed(2).replace('.', separator)}%`;
  const label = amountsHidden
    ? `${sign}**,** ${amount.currency} (${sign}**,**%)`
    : `${sign}${amount.integer}${amount.decimals} ${amount.currency} (${sign}${percent})`;

  return { label, color: up ? 'var(--uc-green-olive)' : 'var(--uc-status-red)', direction: up ? 'up' : 'down' };
}

function categoryProducts(categories: ProductCategory[], key: ProductCategory['key']) {
  return categories.find((category) => category.key === key)?.products ?? [];
}

const SUMMARY_ART: Partial<Record<TransformationTab, { src: string; className: string }>> = {
  accounts: { src: accountsLighthouse, className: 'top-[24px] right-0 h-auto w-[96px] !object-cover' },
  savings: { src: savingsCactus, className: 'bottom-[-48px] right-[-44px] h-[220px] w-[184px]' },
  credits: { src: loansHouse, className: 'bottom-[-10px] right-[-12px] h-[170px] w-[174px]' },
  insurance: { src: insuranceUmbrella, className: 'bottom-[-24px] right-[-38px] h-[186px] w-[210px]' },
};

/**
 * A tab's headline figure.
 *
 * Three things changed here. The banner is now a button: it was the largest,
 * most colourful element on the screen and it did nothing, while "Spent this
 * week" is the obvious door into Spending. Its second slot can hold two
 * figures side by side, because a savings pool that mixes guaranteed products
 * with market-risk ones cannot honestly report one blended "growth" number.
 * And every string comes from the market's dictionary.
 */
function SummaryBanner({
  tab,
  amount,
  amountsHidden,
  secondaryLabel,
  secondaryValue,
  secondarySlots,
  policyCount = 2,
  onOpen,
  openLabel,
}: {
  tab: TransformationTab;
  amount?: FormattedAmount;
  amountsHidden: boolean;
  secondaryLabel?: string;
  secondaryValue?: FormattedAmount | string;
  /** Two labelled figures in the lower half, when one number would misrepresent the pool. */
  secondarySlots?: ReadonlyArray<{ label: string; value: ReactNode }>;
  policyCount?: number;
  onOpen?: () => void;
  /** What tapping the banner does, for the accessible name. */
  openLabel?: string;
}) {
  const { t } = useLanguage();

  const headline = tab === 'insurance'
    ? t('runtime.evo.summary.covered')
    : tab === 'credits'
      ? t('runtime.evo.summary.totalOwed')
      : tab === 'savings'
        ? t('runtime.evo.summary.totalSavings')
        : t('runtime.evo.summary.totalAvailable');

  const featured = tab === 'insurance'
    ? (
      <span data-home-insurance-policy-count className="text-[28px] font-bold leading-[32px] tracking-[-0.025em]">
        {policyCount} {policyCount === 1 ? t('runtime.evo.summary.activePolicy') : t('runtime.evo.summary.activePolicies')}
      </span>
    )
    : amount
      ? <Money data-home-summary-primary-amount amount={amount} hidden={amountsHidden} role="hero" />
      : null;

  const tone = tab === 'accounts'
    ? 'bg-[var(--uc-summary-accounts)]'
    : tab === 'savings'
      ? 'bg-[var(--uc-summary-savings)]'
      : tab === 'credits'
        ? 'bg-[var(--uc-summary-credits)]'
        : 'bg-[var(--uc-summary-insurance)]';
  const art = SUMMARY_ART[tab];

  // Two slots share the width; one keeps the full column so a long label wraps
  // rather than truncating after translation.
  const slots = secondarySlots
    ?? (secondaryValue !== undefined && secondaryLabel
      ? [{
        label: secondaryLabel,
        value: typeof secondaryValue === 'string'
          ? <span className="text-[18px] font-bold leading-[22px]">{secondaryValue}</span>
          : <Money data-home-summary-secondary-amount amount={secondaryValue} hidden={amountsHidden} role="support" />,
      }]
      : []);

  const body = (
    <>
      <div className={`relative z-10 ${slots.length > 1 ? 'w-full pr-[72px]' : 'max-w-[calc(100%-112px)] sm:max-w-[66%]'}`}>
        <p className="text-[14px] font-bold leading-[18px]">{headline}</p>
        <div className="mt-[2px] flex items-baseline whitespace-nowrap">{featured}</div>
        {slots.length ? (
          <>
            <div
              data-home-summary-divider
              className="my-[9px] h-px w-full bg-[color-mix(in_srgb,var(--uc-text)_35%,transparent)]"
            />
            <div className={slots.length > 1 ? 'grid grid-cols-2 gap-[12px]' : ''}>
              {slots.map((slot, index) => (
                <div key={slot.label} data-home-summary-slot className="min-w-0">
                  <p className="flex items-center gap-[4px] text-[14px] font-bold leading-[18px]">
                    {slot.label}
                    {/* Marks the one figure whose detail lives on another screen,
                        rather than a corner chevron sitting on the illustration. */}
                    {onOpen && index === slots.length - 1 ? (
                      <AppIcon name="chevron-right" size={14} color="var(--uc-text)" aria-hidden="true" />
                    ) : null}
                  </p>
                  <p className="mt-[1px]">{slot.value}</p>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
      {art ? (
        <img
          src={art.src}
          alt=""
          aria-hidden="true"
          data-home-summary-art={tab}
          className={`pointer-events-none absolute z-0 object-contain object-right-bottom drop-shadow-[0_8px_10px_rgb(var(--uc-shadow-rgb)/0.14)] ${art.className}`}
        />
      ) : null}
    </>
  );

  // min-h rather than a fixed height: a translated label is allowed to make the
  // banner taller instead of clipping.
  const shell = `relative isolate min-h-[145.25px] overflow-hidden rounded-[8px] ${tone} px-[24px] py-[15px] text-left text-[var(--uc-text)]`;

  if (!onOpen) {
    return <section data-home-transformation-summary={tab} className={shell}>{body}</section>;
  }

  return (
    <button
      type="button"
      data-home-transformation-summary={tab}
      data-home-summary-interactive="true"
      aria-label={openLabel}
      onClick={onOpen}
      className={`${shell} block w-full transition-[transform,filter] duration-200 active:scale-[0.995] hover:brightness-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)] motion-reduce:transition-none`}
    >
      {body}
    </button>
  );
}

/**
 * How many products a closed group is holding back.
 *
 * Shared rather than re-assembled per screen: the Evo groups and the account
 * accordions both hide products behind a chevron, and a count that reads one way
 * on one and another way on the next is exactly the drift this pass exists to stop.
 */
export function formatGroupCount(count: number | undefined, t: (key: string, fallback?: string) => string) {
  if (count === undefined || count <= 0) return null;
  return count === 1
    ? t('runtime.evo.groups.oneProduct')
    : `${count} ${t('runtime.evo.groups.manyProducts')}`;
}

/**
 * A collapsible product group.
 *
 * A closed group used to show only a 16px sliver of the card behind it, which
 * meant the tab's headline total counted money the screen never accounted for —
 * "Total savings 768 914" over three visible products worth 263 914. A closed
 * group now states its count and its subtotal, so the banner above it can
 * always be reconciled against what is on screen.
 */
function Group({
  title,
  children,
  defaultOpen = true,
  preview,
  expandable = true,
  itemCount,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  preview?: ReactNode;
  expandable?: boolean;
  /** Items inside, shown while closed so the group never hides its own size. */
  itemCount?: number;
}) {
  const { t } = useLanguage();
  const [isOpen, setOpen] = useState(defaultOpen);
  const id = `transformation-group-${title.toLowerCase().replace(/[^a-z]+/g, '-')}`;
  const showSummary = expandable && !isOpen && itemCount !== undefined && itemCount > 0;
  const countLabel = formatGroupCount(itemCount, t);

  return (
    <section data-home-transformation-group={id}>
      {expandable ? (
        <button
          type="button"
          data-home-product-group-header="compact"
          aria-expanded={isOpen}
          aria-controls={id}
          onClick={() => setOpen((value) => !value)}
          className="flex min-h-[48px] w-full items-center justify-between gap-[12px] px-0 py-[4px] text-left transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
        >
          <h2 className="uc-type-l1 min-w-0 flex-1 text-[var(--uc-text)]">{title}</h2>
          {showSummary ? (
            <span data-home-group-count className="shrink-0 text-[13px] leading-[16px] text-[var(--uc-text-muted)]">
              {countLabel}
            </span>
          ) : null}
          <span className={`grid size-[32px] shrink-0 place-items-center transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            <AppIcon name="chevron-down-wide" color="var(--uc-icon)" aria-hidden="true" />
          </span>
        </button>
      ) : (
        <div data-home-product-group-header="static" className="flex min-h-[48px] w-full items-center px-0 py-[4px]">
          <h2 className="uc-type-l1 text-[var(--uc-text)]">{title}</h2>
        </div>
      )}
      {!expandable || isOpen ? <div id={expandable ? id : undefined} className="mt-[12px]">{children}</div> : preview ? <div className="mt-[12px]">{preview}</div> : null}
    </section>
  );
}

const INSURANCE_POLICIES = [
  {
    title: 'Genius Protect',
    subtitle: 'Life insurance policy · 3431424',
    premium: 70,
    /*
     * What the policy is actually worth to the customer — the figure a loan card
     * gives to the outstanding balance. Without it the card led with a 70 CZK
     * premium and a progress bar nobody could source.
     */
     coverAmount: 500000,
    // Was "Last payment: 30/05/2027" — a past-tense fact dated in the future.
    startDate: '30/05/2025',
    renewalDate: '30/05/2027',
    progress: 30,
    target: 'life-insurance',
  },
  {
    title: 'Home Protect',
    subtitle: 'Home insurance policy · 3431425',
    premium: 120,
    coverAmount: 2400000,
    startDate: '15/11/2025',
    renewalDate: '15/11/2026',
    progress: 56,
    target: 'home-insurance',
  },
] as const;

function ProductStackPreview() {
  return <span aria-hidden="true" data-home-product-stack-preview className="relative z-0 -mt-[6px] block h-[16px] w-full rounded-b-[8px] border-x border-b border-[color-mix(in_srgb,var(--uc-border-muted)_72%,transparent)] bg-[var(--uc-surface-raised)]" />;
}

/**
 * A progress bar that names what it measures — to assistive tech, not on screen.
 *
 * The same 12px bar meant three different things across Home: time to maturity,
 * share repaid, and an unexplained percentage on a policy. A visible caption on
 * each one fixed the ambiguity and cost a line of chrome on every card, three
 * times a screen, next to figures that already said the same thing. The meaning
 * lives in `aria-label` instead, where it is needed and costs nothing.
 */
function LabelledProgress({
  label,
  valueNow,
  valueMax = 100,
  valueText,
  dataAttribute,
}: {
  label: string;
  valueNow: number;
  valueMax?: number;
  valueText?: string;
  dataAttribute: string;
}) {
  const percent = valueMax === 100
    ? Math.max(0, Math.min(100, valueNow))
    : valueMax > 0 ? Math.max(0, Math.min(100, (valueNow / valueMax) * 100)) : 0;

  return (
    <div
      {...{ [dataAttribute]: true }}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={valueMax}
      aria-valuenow={Math.round(valueNow)}
      aria-valuetext={valueText}
      className="mt-[16px] h-[12px] overflow-hidden rounded-full bg-[var(--uc-surface-muted)]"
    >
      <div className="h-full rounded-full bg-[var(--uc-action)]" style={{ width: `${percent}%` }} />
    </div>
  );
}

type DepositPresentation = {
  annualRate: number;
  periodLabel: string;
  termDays: number;
  daysToMaturity: number;
  startDate: string;
  maturityDate: string;
};

const DEFAULT_DEPOSIT_PRESENTATION: DepositPresentation = {
  annualRate: 0.065,
  periodLabel: '1 Year',
  termDays: 365,
  daysToMaturity: 290,
  startDate: '30/05/2026',
  maturityDate: '30/05/2027',
};

const EVO_2027_DEPOSIT_PRESENTATIONS: Record<string, DepositPresentation> = {
  'term-1': DEFAULT_DEPOSIT_PRESENTATION,
  'term-2': {
    annualRate: 0.052,
    periodLabel: '6 Months',
    termDays: 184,
    daysToMaturity: 72,
    startDate: '12/03/2026',
    maturityDate: '12/09/2026',
  },
  'term-3': {
    annualRate: 0.071,
    periodLabel: '2 Years',
    termDays: 730,
    daysToMaturity: 481,
    startDate: '09/01/2026',
    maturityDate: '09/01/2028',
  },
};

export function depositPresentation(product: Product): DepositPresentation {
  return EVO_2027_DEPOSIT_PRESENTATIONS[product.id] ?? DEFAULT_DEPOSIT_PRESENTATION;
}

function DepositList({ deposits, amountsHidden, formatProductAmount, onProductClick, collapsed = false, total }: { deposits: Product[]; amountsHidden: boolean; formatProductAmount: (product: Product) => FormattedAmount; onProductClick: (product: Product) => void; collapsed?: boolean; total?: FormattedAmount }) {
  const { t } = useLanguage();
  const displayedDeposits = collapsed ? deposits.slice(0, 1) : deposits;
  const displayedTotal = total ? maskAmountParts(total, amountsHidden) : null;

  return <>
    <div data-home-deposit-list className={['overflow-hidden rounded-[8px] bg-[var(--uc-surface)]', collapsed ? 'relative z-10 shadow-[0_6px_12px_rgb(var(--uc-shadow-rgb)/0.08)]' : ''].join(' ')}>
      {displayedDeposits.map((product, index) => {
        const current = formatProductAmount(product);
        const presentation = depositPresentation(product);
        const maturity = formatEvo2027Amount(product.balance * (1 + presentation.annualRate * presentation.termDays / 365), product.currency);
        const elapsedDays = presentation.termDays - presentation.daysToMaturity;

        return <div key={product.id} data-home-deposit-card className={['bg-[var(--uc-surface)] p-[16px]', index > 0 ? 'border-t-[0.5px] border-[var(--uc-border-muted)]' : ''].filter(Boolean).join(' ')}>
          <button type="button" onClick={() => onProductClick(product)} className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]">
            <p className="text-[16px] font-bold">{product.name} · {(presentation.annualRate * 100).toFixed(1)}% {t('runtime.evo.labels.interestRate')}</p>
            <p data-home-deposit-maturity className="mt-[3px] flex flex-wrap items-baseline gap-[3px] text-[14px] font-normal leading-[18px] text-[var(--uc-text-muted)]">
              {t('runtime.evo.labels.maturityAmount')}: <Money data-home-deposit-maturity-value amount={maturity} hidden={amountsHidden} role="support" />
            </p>
            <p className="mt-[12px] text-[var(--uc-text)]"><Money amount={current} hidden={amountsHidden} role="product" /></p>
          </button>
          <div className="mt-[20px] flex flex-wrap justify-between gap-x-[12px] gap-y-[4px] text-[14px]">
            <span>{t('runtime.evo.labels.period')}: <b>{presentation.periodLabel}</b></span>
            <span>{t('runtime.evo.labels.daysToMaturity')}: <b>{presentation.daysToMaturity}</b></span>
          </div>
          <LabelledProgress
            dataAttribute="data-home-deposit-maturity-progress"
            label={t('runtime.evo.labels.maturityProgress')}
            valueNow={elapsedDays}
            valueMax={presentation.termDays}
            valueText={`${elapsedDays}/${presentation.termDays}`}
          />
          <div className="mt-[10px] flex flex-wrap justify-between gap-x-[12px] gap-y-[4px] text-[13px] text-[var(--uc-text-muted)]">
            <span>{t('runtime.evo.labels.startDate')}: {presentation.startDate}</span>
            <span>{t('runtime.evo.labels.maturityDate')}: {presentation.maturityDate}</span>
          </div>
        </div>;
      })}
      {displayedTotal ? (
        <TotalRow
          className="w-full border-t border-[var(--uc-border-muted)]"
          variant="evolution"
          productStyle="pi"
          integer={displayedTotal.integer}
          decimals={displayedTotal.decimals}
          currency={displayedTotal.currency}
        />
      ) : null}
    </div>
    {collapsed && deposits.length > 1 ? <ProductStackPreview /> : null}
  </>;
}

function InsurancePolicyList({ onClick, amountsHidden, collapsed = false }: { onClick?: (shelfItemId: string) => void; amountsHidden: boolean; collapsed?: boolean }) {
  const { t } = useLanguage();
  const policies = collapsed ? INSURANCE_POLICIES.slice(0, 1) : INSURANCE_POLICIES;

  return <>
    <div data-home-insurance-policy-list className={['overflow-hidden rounded-[8px] bg-[var(--uc-surface)]', collapsed ? 'relative z-10 shadow-[0_6px_12px_rgb(var(--uc-shadow-rgb)/0.08)]' : ''].join(' ')}>
      {policies.map((policy, index) => (
        <button
          key={policy.title}
          data-home-insurance-policy-card
          type="button"
          onClick={() => onClick?.(policy.target)}
          className={`w-full p-[16px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] ${index > 0 ? 'border-t-[0.5px] border-[var(--uc-border-muted)]' : ''}`}
        >
          <div className="flex items-start justify-between gap-[12px]">
            <span className="min-w-0">
              <span className="block text-[16px] font-bold">{policy.title}</span>
              <span className="mt-[4px] block text-[14px] text-[var(--uc-text-muted)]">{policy.subtitle}</span>
            </span>
            <span data-home-insurance-logo className="grid h-[40px] w-[72px] shrink-0 place-items-center overflow-hidden rounded-[4px] bg-[#00549f] text-[14px] font-bold text-white">Allianz</span>
          </div>
          {/* The figure is what the customer pays next, captioned underneath —
              the shape a loan card uses. The sum insured belongs in the policy
              detail: it is the one number nobody acts on from Home. */}
          <p className="mt-[10px] text-[var(--uc-text)]">
            <Money data-home-insurance-premium amount={formatEvo2027Amount(policy.premium, 'CZK')} hidden={amountsHidden} role="product" />
          </p>
          <p className="mt-[2px] text-[13px] leading-[16px] text-[var(--uc-text-muted)]">{t('runtime.evo.labels.nextPremium')}</p>
          <LabelledProgress
            dataAttribute="data-home-insurance-progress"
            label={t('runtime.evo.labels.policyProgress')}
            valueNow={policy.progress}
          />
          {/* Two dates around the bar, exactly as a deposit carries start and
              maturity: without them the percentage had nothing to be read from. */}
          <div className="mt-[10px] flex flex-wrap justify-between gap-x-[12px] gap-y-[4px] text-[13px] text-[var(--uc-text-muted)]">
            <span>{t('runtime.evo.labels.coverStarted')}: {policy.startDate}</span>
            <span>{t('runtime.evo.labels.renewal')}: {policy.renewalDate}</span>
          </div>
        </button>
      ))}
    </div>
    {collapsed ? <ProductStackPreview /> : null}
  </>;
}

function LoanList({ loans, amountsHidden, onProductClick, collapsed = false }: { loans: Product[]; amountsHidden: boolean; onProductClick: (product: Product) => void; collapsed?: boolean }) {
  const { t } = useLanguage();
  const displayedLoans = collapsed ? loans.slice(0, 1) : loans;

  return <>
    <div data-home-loan-list className={['overflow-hidden rounded-[8px] bg-[var(--uc-surface)]', collapsed ? 'relative z-10 shadow-[0_6px_12px_rgb(var(--uc-shadow-rgb)/0.08)]' : ''].join(' ')}>
      {displayedLoans.map((product, index) => {
        const terms = getEvoCreditTerms(product);
        const total = Math.abs(product.balance) * 1.45;
        const repaid = total - Math.abs(product.balance);
        const remaining = formatEvo2027Amount(Math.abs(product.balance), product.currency);
        const installment = formatEvo2027Amount(Math.round(Math.abs(product.balance) * terms.installmentRate), product.currency);
        const totalAmount = formatEvo2027Amount(total, product.currency);
        const repaidAmount = formatEvo2027Amount(repaid, product.currency);
        const repaidPercentage = total > 0 ? (repaid / total) * 100 : 0;

        return <div key={product.id} data-home-loan-card className={['bg-[var(--uc-surface)] p-[16px]', index > 0 ? 'border-t-[0.5px] border-[var(--uc-border-muted)]' : ''].filter(Boolean).join(' ')}>
          <button type="button" onClick={() => onProductClick(product)} className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]">
            <p className="text-[16px] font-bold">{product.name}</p>
            <p data-home-loan-installment className="mt-[4px] flex flex-wrap items-baseline gap-[3px] text-[14px] text-[var(--uc-text-muted)]">
              {t('runtime.evo.labels.nextInstallment')}: <Money data-home-supporting-amount amount={installment} hidden={amountsHidden} role="support" />
            </p>
            <p className="mt-[10px] text-[var(--uc-text)]"><Money amount={remaining} hidden={amountsHidden} role="product" /></p>
          </button>
          <LabelledProgress
            dataAttribute="data-home-loan-progress"
            label={t('runtime.evo.labels.repaidProgress')}
            valueNow={repaidPercentage}
          />
          <div className="mt-[10px] flex justify-between gap-[12px] text-[14px]">
            <span className="text-[var(--uc-text-muted)]">
              {t('runtime.evo.labels.totalRepaid')}<br />
              <Money data-home-loan-repaid-amount amount={repaidAmount} hidden={amountsHidden} role="support" className="text-[var(--uc-text)]" />
            </span>
            <span className="text-right text-[var(--uc-text-muted)]">
              {t('runtime.evo.labels.totalLoan')}<br />
              <Money data-home-loan-total-amount amount={totalAmount} hidden={amountsHidden} role="support" className="text-[var(--uc-text)]" />
            </span>
          </div>
        </div>;
      })}
    </div>
    {collapsed && loans.length > 1 ? <ProductStackPreview /> : null}
  </>;
}

/**
 * A product's value in one line, plus — where the product has one — what that value did.
 * `performance` swaps the currency flag for a trend arrow and adds the gain line under the
 * amount: on a portfolio the direction is the headline, not the currency.
 */
function CompactProductCard({ product, amount, amountsHidden, subtitle, performance, onClick, stackRole = 'single' }: { product: Product; amount: FormattedAmount; amountsHidden: boolean; subtitle?: string; performance?: ProductPerformance; onClick?: () => void; stackRole?: 'single' | 'first' | 'middle' | 'last' }) {
  const display = maskAmountParts(amount, amountsHidden);
  const radiusClass = stackRole === 'first' ? 'rounded-t-[8px]' : stackRole === 'last' ? 'rounded-b-[8px]' : stackRole === 'middle' ? 'rounded-none' : 'rounded-[8px]';
  const hasSeparator = stackRole === 'middle' || stackRole === 'last';

  return (
    <button type="button" data-home-compact-product-card={product.type} onClick={onClick} className={`relative flex min-h-[112px] w-full items-start bg-[var(--uc-surface)] px-[16px] py-[16px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] ${radiusClass} ${hasSeparator ? 'border-t-[0.5px] border-[var(--uc-border-muted)]' : ''}`}>
      <span className="min-w-0 flex-1 pr-[52px]">
        <span className="block truncate text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">{product.name}{subtitle ? <><span aria-hidden="true"> · </span>{subtitle}</> : null}</span>
        <span className="mt-[3px] block truncate text-[14px] leading-[18px] text-[var(--uc-text-muted)]">{product.accountNumber}</span>
        <span className="mt-[13px] block text-[var(--uc-text)]"><span className="text-[24px] font-bold leading-[26px]">{display.integer}</span><span className="text-[14px]">{display.decimals} {display.currency}</span></span>
        {performance ? <span data-home-compact-product-performance className="mt-[6px] block text-[16px] font-bold leading-[20px]" style={{ color: performance.color }}>{performance.label}</span> : null}
      </span>
      <span className="absolute right-[16px] top-[16px]">{performance ? <TrendBadge direction={performance.direction} /> : <CurrencyBadge currency={product.currency} />}</span>
    </button>
  );
}

function EmptyProducts({ title, description, onClick }: { title: string; description: string; onClick?: () => void }) {
  return <GhostBanner className="w-full max-w-none" title={title} description={description} onClick={onClick} ariaLabel={title} />;
}

/**
 * Makes the same row line up across every card in a rail.
 *
 * A carousel where one card's title wraps to two lines and its neighbour's does
 * not leaves every row beneath them out of step. Reserving a fixed height for
 * the worst case wastes a line on every other card and still breaks the first
 * time a translation runs longer, so each row measures the tallest of its peers
 * and they all take that height. Mark the rows with `data-equalize="<name>"`.
 */
function useEqualizedRows(railRef: React.RefObject<HTMLDivElement | null>, resetKey: unknown) {
  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const measure = () => {
      const rows = Array.from(rail.querySelectorAll<HTMLElement>('[data-equalize]'));
      if (!rows.length) return;

      // Release last pass's reservation before measuring, or the heights ratchet.
      rows.forEach((row) => { row.style.minHeight = ''; });

      const groups = new Map<string, HTMLElement[]>();
      rows.forEach((row) => {
        const key = row.dataset.equalize ?? '';
        const group = groups.get(key);
        if (group) group.push(row);
        else groups.set(key, [row]);
      });

      groups.forEach((group) => {
        const tallest = group.reduce((max, row) => Math.max(max, row.offsetHeight), 0);
        if (tallest > 0) group.forEach((row) => { row.style.minHeight = `${tallest}px`; });
      });
    };

    measure();

    if (typeof ResizeObserver === 'undefined') return;
    // Re-measure when the rail is resized — a rotation, a foldable, a font swap.
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [railRef, resetKey]);
}

function HorizontalCarousel({ ariaLabel, count, children }: { ariaLabel: string; count: number; children: ReactNode }) {
  const railRef = useRef<HTMLDivElement>(null);
  useEqualizedRows(railRef, count);
  const scrollSnapTimeoutRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollToIndex = useCallback((index: number) => {
    const rail = railRef.current;
    const item = rail?.firstElementChild as HTMLElement | null;
    if (!rail || !item) return;
    const gap = Number.parseFloat(getComputedStyle(rail).gap || '0');
    const nextIndex = Math.max(0, Math.min(index, count - 1));
    const left = nextIndex * (item.offsetWidth + gap);
    if (typeof rail.scrollTo === 'function') rail.scrollTo({ left, behavior: 'smooth' });
    else rail.scrollLeft = left;
    setActiveIndex(nextIndex);
  }, [count]);
  const settle = useCallback(() => {
    const rail = railRef.current;
    const item = rail?.firstElementChild as HTMLElement | null;
    if (!rail || !item) return;
    const gap = Number.parseFloat(getComputedStyle(rail).gap || '0');
    scrollToIndex(Math.round(rail.scrollLeft / (item.offsetWidth + gap)));
  }, [scrollToIndex]);
  const clearScrollSnapTimeout = () => {
    if (scrollSnapTimeoutRef.current === null) return;
    window.clearTimeout(scrollSnapTimeoutRef.current);
    scrollSnapTimeoutRef.current = null;
  };
  const { dragHandlers, isDragging, isPressActiveRef } = useDragCarousel({ carouselRef: railRef, enabled: count > 1, onSettle: settle });
  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    const rail = event.currentTarget;
    const item = rail.firstElementChild as HTMLElement | null;
    if (!item) return;
    const gap = Number.parseFloat(getComputedStyle(rail).gap || '0');
    setActiveIndex(Math.max(0, Math.min(count - 1, Math.round(rail.scrollLeft / (item.offsetWidth + gap)))));
    if (isPressActiveRef.current) return;
    clearScrollSnapTimeout();
    scrollSnapTimeoutRef.current = window.setTimeout(settle, 120);
  };

  useEffect(() => () => {
    clearScrollSnapTimeout();
  }, []);

  // Match the Products rail: the drag source is each visible card as well as
  // the rail itself. This keeps mouse drags stable when they begin over a
  // button, image, or card copy instead of an empty part of the rail.
  const draggableChildren = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    return cloneElement(child, { ...dragHandlers } as never);
  });

  return <>
    <div ref={railRef} data-home-carousel-rail role="region" aria-label={ariaLabel} tabIndex={0} onScroll={onScroll} onKeyDown={(event) => {
      if (event.key === 'ArrowRight') { event.preventDefault(); scrollToIndex(activeIndex + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); scrollToIndex(activeIndex - 1); }
    }} {...dragHandlers} className={`mt-[12px] flex items-stretch gap-[12px] overflow-x-auto overscroll-x-contain pb-[4px] scrollbar-hide select-none touch-pan-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`} style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
      {draggableChildren}
    </div>
    {count > 1 ? <div className="mt-[4px] flex justify-center" aria-label={`${ariaLabel} pages`}>
      <AccountCarouselIndicator count={count} activeIndex={activeIndex} onSelect={scrollToIndex} />
    </div> : null}
  </>;
}

function InterestCarousel({ tab, onOfferOpen }: { tab: TransformationTab; onOfferOpen?: (shelfItemId: string) => void }) {
  const { t } = useLanguage();
  const cards = INTEREST_CAMPAIGNS[tab];
  const sectionTitle = t(`runtime.evo.interest.sectionTitles.${tab}`);
  const headingId = `interest-heading-${tab}`;

  return (
    <section data-home-interest-carousel aria-labelledby={headingId}>
      <h2 id={headingId} className="uc-type-l1 text-[var(--uc-text)]">{sectionTitle}</h2>
      <HorizontalCarousel ariaLabel={sectionTitle} count={cards.length}>
        {cards.map((card) => {
          const title = t(`runtime.evo.interest.cards.${card.copyKey}.title`);
          const body = t(`runtime.evo.interest.cards.${card.copyKey}.body`);
          const caption = t(`runtime.evo.interest.cards.${card.copyKey}.caption`);

          return (
            <button
              key={card.copyKey}
              type="button"
              data-home-interest-card={card.copyKey}
              data-home-interest-target={card.target}
              onClick={() => onOfferOpen?.(card.target)}
              className="flex h-full w-[calc(100%-48px)] shrink-0 snap-start flex-col overflow-hidden rounded-[8px] bg-[var(--uc-surface)] text-left shadow-[0_1px_1px_rgb(var(--uc-shadow-rgb)/0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
            >
              {/* Taller than the 100px band it replaces: the chevron is a third of
                  the source frame, and a shallower crop left no room around it. */}
              <div className="relative h-[130px] overflow-hidden bg-[var(--uc-surface-muted)] leading-none">
                <img src={card.image} alt="" aria-hidden="true" data-home-interest-media className="block size-full object-cover" style={{ objectPosition: card.imagePosition }} />
              </div>
              {/* Each row takes the height of the tallest across the rail, so the
                  bodies and captions stay on one line whatever the titles do. */}
              <div className="flex flex-1 flex-col px-[16px] py-[12px]">
                <h3 data-equalize="interest-title" className="text-[18px] font-bold leading-[23px]">{title}</h3>
                <p data-equalize="interest-body" className="mt-[7px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">{body}</p>
                <p data-equalize="interest-caption" className="mt-[8px] text-[13px] leading-[17px] text-[var(--uc-text-muted)]">{caption}</p>
              </div>
            </button>
          );
        })}
      </HorizontalCarousel>
    </section>
  );
}

function ShopSmart({ country, onProductsClick }: { country: CountryId; onProductsClick?: () => void }) {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<ShopSmartCategory>('popular');
  const offers = getProductsMenuForCountry(country).shopSmartOfferCards;
  const visibleOffers = activeFilter === 'popular'
    ? offers
    : offers.filter((offer) => offer.categories.includes(activeFilter));
  const filters: ReadonlyArray<{ id: ShopSmartCategory; labelKey: string }> = [
    { id: 'popular', labelKey: 'popular' },
    { id: 'eshops', labelKey: 'eshops' },
    { id: 'electronics', labelKey: 'electronics' },
    { id: 'travel', labelKey: 'travel' },
    { id: 'home', labelKey: 'home' },
  ];

  if (!offers.length) return null;

  return (
    <section data-home-shopsmart data-home-shopsmart-filter={activeFilter}>
      <h2 className="uc-type-l1 text-[var(--uc-text)]">{t('runtime.evo.shopsmart.heading')}</h2>
      {/* The very chip the Offers page filters partner offers with. Two rails
          were filtering the same catalogue with corners, type sizes and outline
          colours that had drifted apart. */}
      <ShopsmartCategoryChips
        categories={filters.map((filter) => ({
          id: filter.id,
          label: t(`runtime.evo.shopsmart.filters.${filter.labelKey}`),
        }))}
        activeId={activeFilter}
        onSelect={(id) => setActiveFilter(id as ShopSmartCategory)}
        ariaLabel={t('runtime.evo.shopsmart.categoriesLabel')}
        className="mt-[12px]"
        chipDataAttribute="data-home-shopsmart-chip"
      />
      <HorizontalCarousel key={activeFilter} ariaLabel={t('runtime.evo.shopsmart.offersLabel')} count={visibleOffers.length}>
        {visibleOffers.map((offer) => (
          <div key={offer.id} className="w-[calc(100%-48px)] shrink-0 snap-start">
            <ShopsmartOfferCard
              merchant={offer.merchant}
              title={offer.title}
              statusText={offer.statusText}
              imageSrc={offer.imageSrc}
              imageHeight={130}
              pillLabel={offer.pillLabel}
              pillTone={offer.pillTone}
              tagLabel={offer.tagLabel}
              distance={offer.distance}
              trailingIcon={offer.trailingIcon}
              onClick={onProductsClick}
            />
          </div>
        ))}
      </HorizontalCarousel>
    </section>
  );
}

export default function App2027TransformationHome({
  categories,
  country,
  amountsHidden,
  calculateTotal,
  calculateTotalOwed,
  formatProductAmount,
  getProductDisplayNumber,
  onProductClick,
  onSeeAllTransactions,
  onAccountInfoClick,
  onDomesticPaymentClick,
  onPaymentsClick,
  onCardDetailsClick,
  onCardOptionsClick,
  onProductsClick,
  onOfferOpen,
  onSpendingClick,
  onTransactionOpen,
  activeTab: controlledTab,
  onActiveTabChange,
}: App2027TransformationHomeProps & {
  /** Lifted so the tab survives a trip to another L1 and back. */
  activeTab?: TransformationTab;
  onActiveTabChange?: (tab: TransformationTab) => void;
}) {
  const { t } = useLanguage();
  const [uncontrolledTab, setUncontrolledTab] = useState<TransformationTab>('accounts');
  const activeTab = controlledTab ?? uncontrolledTab;
  const tabRefs = useRef<Partial<Record<TransformationTab, HTMLButtonElement | null>>>({});

  const selectTab = useCallback((tab: TransformationTab) => {
    setUncontrolledTab(tab);
    onActiveTabChange?.(tab);
  }, [onActiveTabChange]);

  // The WAI-ARIA tab pattern: arrows move between tabs, Home/End jump to the ends.
  const onTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const index = TAB_ORDER.indexOf(activeTab);
    let next: TransformationTab | undefined;
    if (event.key === 'ArrowRight') next = TAB_ORDER[(index + 1) % TAB_ORDER.length];
    if (event.key === 'ArrowLeft') next = TAB_ORDER[(index - 1 + TAB_ORDER.length) % TAB_ORDER.length];
    if (event.key === 'Home') next = TAB_ORDER[0];
    if (event.key === 'End') next = TAB_ORDER[TAB_ORDER.length - 1];
    if (!next) return;

    event.preventDefault();
    selectTab(next);
    tabRefs.current[next]?.focus();
  };

  const accounts = categoryProducts(categories, 'accounts');
  const cards = categoryProducts(categories, 'cards');
  const debitCards = cards.filter((product) => product.type === 'debit_card');
  const creditCards = cards.filter((product) => product.type === 'credit_card');
  const savings = categoryProducts(categories, 'savings_deposits').filter((product) => product.type === 'saving_account');
  const deposits = categoryProducts(categories, 'savings_deposits').filter((product) => product.type === 'term_deposit');

  // The banner quotes the last bar of the Expenses chart, not an estimate: same timeline, same
  // week slices. When that week has no spending the row drops rather than printing a 0,00 that
  // reads like a data error.
  const weekSpending = useMemo(() => {
    const products = categories.flatMap((category) => category.products);
    if (!products.length) return null;

    const timeline = createSpendingAnalyticsTimeline(country, products);
    const summary = timeline.summariesByPeriodKey[timeline.activePeriodKey];
    if (!summary) return null;

    const total = calculateLatestWeekSpending(summary);
    if (total === null || total <= 0) return null;

    return { total, currency: summary.currency };
  }, [categories, country]);

  const investments = categoryProducts(categories, 'investments');
  // Same figures the portfolio screen prints under its chart, so opening the card confirms
  // what the card already said.
  const portfolioPerformance = useMemo(
    () => buildPortfolioPerformance(investments, country, amountsHidden),
    [amountsHidden, country, investments],
  );
  // One shelf category, two products the customer thinks of separately: a consumer loan and a
  // mortgage answer different questions, and every other group here is a single product type.
  const creditProducts = categoryProducts(categories, 'mortgages_loans');
  const loans = creditProducts.filter((product) => product.type !== 'mortgage');
  const mortgages = creditProducts.filter((product) => product.type === 'mortgage');
  const creditCategories = categories.map((category) => category.key === 'cards'
    ? { ...category, products: category.products.filter((product) => product.type === 'credit_card') }
    : category,
  ).filter((category) => category.key !== 'cards' || category.products.length > 0);
  const debitCardCategories = categories.map((category) => category.key === 'cards'
    ? { ...category, products: category.products.filter((product) => product.type === 'debit_card') }
    : category,
  ).filter((category) => category.key !== 'cards' || category.products.length > 0);

  /*
   * Accounts owns current accounts; Savings owns savings. The shared
   * `calculateTotalAvailable()` counts saving accounts as available, so the same
   * money appeared inside "Total available" on one tab and inside "Total savings"
   * on the next, with nothing saying so. Each tab now totals exactly what it lists.
   */
  const availableTotal = useMemo(() => calculateTotal(accounts), [accounts, calculateTotal]);
  const savingsProducts = useMemo(() => [...savings, ...deposits, ...investments], [deposits, investments, savings]);
  const totalSavings = useMemo(() => calculateTotal(savingsProducts), [calculateTotal, savingsProducts]);
  const depositsSubtotal = useMemo(() => calculateTotal(deposits), [calculateTotal, deposits]);

  /*
   * "Growth this year" was a flat 3.2% of a pool that mixes guaranteed products
   * with market-risk ones — an unexplained absolute figure that reads as a
   * promised return. The pool is split instead: interest is derived from the
   * rates the cards below already print, and market performance is the same
   * signed figure the portfolio row shows.
   */
  const interestEarned = useMemo(() => {
    const currency = totalSavings.currency as Product['currency'];
    const fromSavings = savings.reduce(
      (sum, product) => sum + product.balance * EVO_SAVING_ACCOUNT_ANNUAL_RATE,
      0,
    );
    const fromDeposits = deposits.reduce((sum, product) => {
      const presentation = depositPresentation(product);
      const elapsedDays = presentation.termDays - presentation.daysToMaturity;
      return sum + product.balance * presentation.annualRate * (elapsedDays / 365);
    }, 0);

    return formatEvo2027Amount(Math.round(fromSavings + fromDeposits), currency);
  }, [deposits, savings, totalSavings.currency]);

  const debt = calculateTotalOwed();
  /*
   * The instalments the cards below print, plus the card's minimum payment —
   * rather than a flat 0.9% of the balance that quietly left revolving credit out.
   */
  const dueThisMonth = useMemo(() => {
    const fromLoans = [...loans, ...mortgages].reduce((sum, product) => {
      const terms = getEvoCreditTerms(product);
      return sum + Math.round(Math.abs(product.balance) * terms.installmentRate);
    }, 0);
    const fromCards = creditCards.reduce((sum, product) => {
      const drawn = 'creditLimit' in product && 'availableCredit' in product
        ? Math.max(0, (product.creditLimit as number) - (product.availableCredit as number))
        : 0;
      return sum + Math.round(drawn * EVO_CREDIT_CARD_MINIMUM_RATE);
    }, 0);

    return formatEvo2027Amount(fromLoans + fromCards, debt.currency as Product['currency']);
  }, [creditCards, debt.currency, loans, mortgages]);

  const activePolicyCount = INSURANCE_POLICIES.length;
  const nextRenewal = INSURANCE_POLICIES
    .map((policy) => policy.renewalDate)
    .sort((a, b) => {
      const [ad, am, ay] = a.split('/');
      const [bd, bm, by] = b.split('/');
      return `${ay}${am}${ad}`.localeCompare(`${by}${bm}${bd}`);
    })[0] ?? '';

  const panelId = `transformation-panel-${activeTab}`;

  return (
    <div data-home-transformation data-home-area="transformation" className="flex min-w-0 flex-col gap-[28px]">
      <section data-home-area="product-categories" className="relative min-w-0">
        {/*
          The row overflowed its container at 375px even in English, with
          `scrollbar-hide` and no fade — so the fourth tab was cut off and nothing
          said it existed. It wraps now, which is also what a 40%-longer
          translation needs.
        */}
        <div
          role="tablist"
          aria-label={t('runtime.evo.tabs.ariaLabel')}
          className="flex flex-wrap gap-[5px]"
        >
          {TAB_ORDER.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                ref={(node) => { tabRefs.current[tab] = node; }}
                type="button"
                role="tab"
                id={`transformation-tab-${tab}`}
                aria-selected={active}
                aria-controls={panelId}
                tabIndex={active ? 0 : -1}
                onKeyDown={onTabKeyDown}
                onClick={() => selectTab(tab)}
                /* Unselected takes the same outline the category chips wear: a
                   black stroke and black text. A borderless muted pill and an
                   outlined chip were two answers to "not selected". */
                className={`flex min-h-[44px] shrink-0 items-center justify-center rounded-full border px-[13px] py-[7px] text-[16px] leading-[19px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] ${active
                  ? 'flex-col gap-[2px] border-transparent bg-[var(--uc-action-strong)] font-medium text-[var(--uc-static-white)]'
                  : 'border-[var(--uc-text)] bg-[var(--uc-surface)] font-normal text-[var(--uc-text)]'}`}
              >
                <span>{t(`runtime.evo.tabs.${tab === 'insurance' ? 'insurances' : tab}`)}</span>
                {active ? <span aria-hidden="true" className="size-[4px] rounded-full bg-[var(--uc-static-white)]" /> : null}
              </button>
            );
          })}
        </div>
      </section>

      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={`transformation-tab-${activeTab}`}
        tabIndex={-1}
        className="flex min-w-0 flex-col gap-[28px] focus-visible:outline-none"
      >
      {activeTab === 'accounts' ? <>
        <SummaryBanner
          tab="accounts"
          amount={availableTotal}
          amountsHidden={amountsHidden}
          secondaryLabel={weekSpending ? t('runtime.evo.summary.spentThisWeek') : undefined}
          secondaryValue={weekSpending ? formatEvo2027Amount(weekSpending.total, weekSpending.currency as Product['currency']) : undefined}
          onOpen={weekSpending && onSpendingClick ? () => onSpendingClick() : undefined}
          openLabel={t('runtime.evo.summary.openSpending')}
        />
        {!accounts.length ? <Group title={t('runtime.evo.groups.accounts')} expandable={false}><EmptyProducts title={t('runtime.evo.empty.accountTitle')} description={t('runtime.evo.empty.accountBody')} onClick={onProductsClick} /></Group> : null}
        {!debitCards.length ? <Group title={t('runtime.evo.groups.cards')} expandable={false}><EmptyProducts title={t('runtime.evo.empty.cardsTitle')} description={t('runtime.evo.empty.cardsBody')} onClick={onProductsClick} /></Group> : null}
        <App2027ProductAccordions categories={debitCardCategories} amountsHidden={amountsHidden} formatProductAmount={formatProductAmount} calculateGroupTotal={calculateTotal} getProductDisplayNumber={getProductDisplayNumber} onProductClick={onProductClick} useCzRoboAccountCards onDomesticPaymentClick={onDomesticPaymentClick} onPaymentsClick={onPaymentsClick} onAccountInfoClick={onAccountInfoClick} onCardDetailsClick={onCardDetailsClick} onCardOptionsClick={onCardOptionsClick} visibleKeys={['accounts', 'cards']} initialOpenKeys={{ accounts: true, cards: true }} />
        {accounts.length ? <App2027Activity country={country} currency={calculateTotal(accounts).currency} amountsHidden={amountsHidden} compact homeArea={false} onTransactionOpen={onTransactionOpen} onSeeMore={onSeeAllTransactions ?? (() => { const firstAccount = accounts[0]; if (firstAccount) onProductClick(firstAccount); })} /> : null}
        <InterestCarousel tab="accounts" onOfferOpen={onOfferOpen} />
        <ShopSmart country={country} onProductsClick={onProductsClick} />
      </> : null}

      {activeTab === 'savings' ? <>
        <SummaryBanner
          tab="savings"
          amount={totalSavings}
          amountsHidden={amountsHidden}
          /* One supporting figure, like every other tab's banner: market
             performance lives on the portfolio card that earns it. */
          secondaryLabel={t('runtime.evo.summary.interestEarned')}
          secondaryValue={interestEarned}
        />
        <Group title={t('runtime.evo.groups.investmentPortfolios')} expandable={investments.length > 1} itemCount={investments.length}>{investments.length ? investments.map((product) => <CompactProductCard key={product.id} product={product} amount={formatProductAmount(product)} amountsHidden={amountsHidden} performance={portfolioPerformance} onClick={() => onProductClick(product)} />) : <EmptyProducts title={t('runtime.evo.empty.investTitle')} description={t('runtime.evo.empty.investBody')} onClick={onProductsClick} />}</Group>
        <Group title={t('runtime.evo.groups.savingAccounts')} expandable={savings.length > 1} itemCount={savings.length}>{savings.length ? <div data-home-compact-product-list="saving_account" className="overflow-hidden rounded-[8px] shadow-[0_1px_1px_rgb(var(--uc-shadow-rgb)/0.04)]">{savings.map((product, index) => <CompactProductCard key={product.id} product={product} amount={formatProductAmount(product)} amountsHidden={amountsHidden} subtitle={`${(EVO_SAVING_ACCOUNT_ANNUAL_RATE * 100).toFixed(1)}% ${t('runtime.evo.labels.interestRate')}`} onClick={() => onProductClick(product)} stackRole={savings.length === 1 ? 'single' : index === 0 ? 'first' : index === savings.length - 1 ? 'last' : 'middle'} />)}</div> : <EmptyProducts title={t('runtime.evo.empty.savingsTitle')} description={t('runtime.evo.empty.savingsBody')} onClick={onProductsClick} />}</Group>
        <Group title={t('runtime.evo.groups.deposits')} defaultOpen={deposits.length <= 1} expandable={deposits.length > 1} itemCount={deposits.length} preview={deposits.length > 1 ? <DepositList deposits={deposits} amountsHidden={amountsHidden} formatProductAmount={formatProductAmount} onProductClick={onProductClick} collapsed /> : undefined}>
          {deposits.length ? <DepositList deposits={deposits} amountsHidden={amountsHidden} formatProductAmount={formatProductAmount} onProductClick={onProductClick} total={deposits.length > 1 ? depositsSubtotal : undefined} /> : <EmptyProducts title={t('runtime.evo.empty.depositsTitle')} description={t('runtime.evo.empty.depositsBody')} onClick={onProductsClick} />}
        </Group>
        <InterestCarousel tab="savings" onOfferOpen={onOfferOpen} />
      </> : null}

      {activeTab === 'credits' ? <>
        <SummaryBanner
          tab="credits"
          amount={debt}
          amountsHidden={amountsHidden}
          secondaryLabel={t('runtime.evo.summary.dueThisMonth')}
          secondaryValue={dueThisMonth}
        />
        {creditCards.length ? <App2027ProductAccordions categories={creditCategories} amountsHidden={amountsHidden} formatProductAmount={formatProductAmount} calculateGroupTotal={calculateTotal} getProductDisplayNumber={getProductDisplayNumber} onProductClick={onProductClick} onCardDetailsClick={onCardDetailsClick} onCardOptionsClick={onCardOptionsClick} useCzRoboAccountCards visibleKeys={['cards']} initialOpenKeys={{ cards: true }} titleOverrides={{ cards: t('runtime.evo.groups.creditCards') }} /> : <Group title={t('runtime.evo.groups.creditCards')} expandable={false}><EmptyProducts title={t('runtime.evo.empty.creditCardTitle')} description={t('runtime.evo.empty.creditCardBody')} onClick={onProductsClick} /></Group>}
        <Group title={t('runtime.evo.groups.loans')} defaultOpen={loans.length <= 1} expandable={loans.length > 1} itemCount={loans.length} preview={loans.length > 1 ? <LoanList loans={loans} amountsHidden={amountsHidden} onProductClick={onProductClick} collapsed /> : undefined}>
          {loans.length ? <LoanList loans={loans} amountsHidden={amountsHidden} onProductClick={onProductClick} /> : <EmptyProducts title={t('runtime.evo.empty.loanTitle')} description={t('runtime.evo.empty.loanBody')} onClick={onProductsClick} />}
        </Group>
        <Group title={t('runtime.evo.groups.mortgages')} defaultOpen={mortgages.length <= 1} expandable={mortgages.length > 1} itemCount={mortgages.length} preview={mortgages.length > 1 ? <LoanList loans={mortgages} amountsHidden={amountsHidden} onProductClick={onProductClick} collapsed /> : undefined}>
          {mortgages.length ? <LoanList loans={mortgages} amountsHidden={amountsHidden} onProductClick={onProductClick} /> : <EmptyProducts title={t('runtime.evo.empty.mortgageTitle')} description={t('runtime.evo.empty.mortgageBody')} onClick={onProductsClick} />}
        </Group>
        <InterestCarousel tab="credits" onOfferOpen={onOfferOpen} />
      </> : null}

      {activeTab === 'insurance' ? <>
        <SummaryBanner
          tab="insurance"
          amountsHidden={amountsHidden}
          policyCount={activePolicyCount}
          secondaryLabel={t('runtime.evo.summary.nextRenewal')}
          secondaryValue={nextRenewal}
        />
        {/* The stacked model the accounts, deposits and loans groups use: one
            policy on top of the rest, and the header says how many are under it. */}
        <Group
          title={t('runtime.evo.groups.insurance')}
          defaultOpen={activePolicyCount <= 1}
          expandable={activePolicyCount > 1}
          itemCount={activePolicyCount}
          preview={activePolicyCount > 1
            ? <InsurancePolicyList onClick={onOfferOpen} amountsHidden={amountsHidden} collapsed />
            : undefined}
        >
          <InsurancePolicyList onClick={onOfferOpen} amountsHidden={amountsHidden} />
        </Group>
        <InterestCarousel tab="insurance" onOfferOpen={onOfferOpen} />
      </> : null}
      </div>
    </div>
  );
}
