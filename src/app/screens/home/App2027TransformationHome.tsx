import { Children, cloneElement, isValidElement, useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type UIEvent } from 'react';
import { AppIcon } from '@/app/components/icons';
import AccountCarouselIndicator from '@/app/components/accounts/AccountCarouselIndicator';
import GhostBanner from '@/app/components/cards/GhostBanner';
import ShopsmartOfferCard from '@/app/components/shopsmart/ShopsmartOfferCard';
import { maskAmountParts } from '@/app/utils/amountPrivacy';
import type { Product, ProductCategory } from '@/data/products';
import { formatEvo2027Amount } from '@/app/utils/evo2027Formatting';
import { buildInvestmentSecurities, calculateInvestmentPortfolioPerformance } from '@/app/config/investmentsPortfolioConfig';
import { calculateLatestWeekSpending, createSpendingAnalyticsTimeline } from '@/data/spendingAnalytics';
import type { CountryId } from '@/app/state/demoTypes';
import { getProductsMenuForCountry, type ShopSmartOfferCategory } from '@/app/config/productsMenuConfig';
import { useDragCarousel } from '@/hooks/useDragCarousel';
import savingsCactus from '@/assets/app2027/home-summary-savings-cactus.png';
import loansHouse from '@/assets/app2027/home-summary-loans-house.png';
import insuranceUmbrella from '@/assets/app2027/home-summary-insurance-umbrella.png';
import accountsLighthouse from '@/assets/6f4a518088433560480f90c7a7448fdc1d294def.png';
import interestRoundups from '@/assets/app2027/home-interest-roundups.png';
import interestSafetyNet from '@/assets/app2027/home-interest-safety-net.png';
import interestNextStep from '@/assets/app2027/home-interest-next-step.jpeg';
import homeInsuranceCampaign from '@/assets/products/detail/img_illustration_homeinsurance_RS.png';
import travelInsuranceCampaign from '@/assets/products/detail/img_illustration_travelinsurance_RS.png';
import shopSmartValentino from '@/assets/shopsmart/shopsmart-valentino.png';
import shopSmartEnglishHome from '@/assets/shopsmart/shopsmart-english-home.png';
import App2027Activity from './App2027Activity';
import App2027ProductAccordions, { CurrencyBadge, TrendBadge } from './App2027ProductAccordions';
import { CardArrowMark } from '@/app/components/cards/Card';

type TransformationTab = 'accounts' | 'savings' | 'credits' | 'insurance';
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
  onTransactionOpen?: Parameters<typeof App2027Activity>[0]['onTransactionOpen'];
}

const TAB_LABELS: Record<TransformationTab, string> = {
  accounts: 'Accounts',
  savings: 'Savings',
  credits: 'Credits',
  insurance: 'Insurances',
};

const INTEREST_SECTION_TITLES: Record<TransformationTab, string> = {
  accounts: 'Smart ideas for everyday money',
  savings: 'Ideas to grow your savings',
  credits: 'Ideas for your next step',
  insurance: 'Protection for what matters',
};

type InterestCampaign = {
  title: string;
  body: string;
  caption: string;
  image: string;
  imagePosition: string;
  arrowTreatment?: {
    left: string;
    top: string;
    width: string;
    height: string;
    rotate: string;
    foregroundClipPath: string;
  };
};

const INTEREST_CAMPAIGNS: Record<TransformationTab, readonly InterestCampaign[]> = {
  accounts: [
    { title: 'Save a little every day', body: 'Round up everyday payments and save the difference.', caption: 'Set your rule and adjust it at any time.', image: interestRoundups, imagePosition: 'center 38%', arrowTreatment: { left: '8%', top: '8%', width: '32%', height: '52%', rotate: '-3deg', foregroundClipPath: 'polygon(0 100%, 0 72%, 35% 72%, 44% 60%, 52% 48%, 59% 34%, 100% 34%, 100% 100%)' } },
    { title: 'Stay on top of your everyday money', body: 'Useful ideas that keep everyday banking moving.', caption: 'Choose what works for you.', image: interestNextStep, imagePosition: 'center 23%' },
    { title: 'Find your next smart move', body: 'Build a safety net for the moments that matter.', caption: 'Review your options whenever you need.', image: interestSafetyNet, imagePosition: 'center 38%' },
  ],
  savings: [
    { title: 'Build a reserve for what matters', body: 'Set money aside automatically, at your own pace.', caption: 'Start with an amount that feels right.', image: interestSafetyNet, imagePosition: 'center 38%', arrowTreatment: { left: '4%', top: '10%', width: '30%', height: '50%', rotate: '-3deg', foregroundClipPath: 'polygon(0 60%, 100% 55%, 100% 100%, 0 100%)' } },
    { title: 'Make your savings work harder', body: 'Make small changes that help your savings grow.', caption: 'Choose a savings goal that suits you.', image: interestRoundups, imagePosition: 'center 38%' },
    { title: 'Set a goal and watch it grow', body: 'Set money aside for the things you are looking forward to.', caption: 'Adjust your plan whenever life changes.', image: interestNextStep, imagePosition: 'center 23%' },
  ],
  credits: [
    { title: 'Plan a loan that fits your life', body: 'Explore financing options for the things that matter.', caption: 'Find a loan that fits your plans.', image: interestNextStep, imagePosition: 'center 23%', arrowTreatment: { left: '68%', top: '8%', width: '27%', height: '48%', rotate: '4deg', foregroundClipPath: 'polygon(0 60%, 100% 56%, 100% 100%, 0 100%)' } },
    { title: 'Find a home loan for your next step', body: 'Compare options for a home that works for your next chapter.', caption: 'See what a realistic monthly payment could look like.', image: shopSmartEnglishHome, imagePosition: 'center 45%' },
    { title: 'Finance the things that matter', body: 'Finance your next priority with repayments you can plan for.', caption: 'Subject to credit approval.', image: shopSmartValentino, imagePosition: 'center 35%' },
  ],
  insurance: [
    { title: 'Protect your home with confidence', body: 'Explore cover for your home and belongings.', caption: 'Find protection that fits your needs.', image: homeInsuranceCampaign, imagePosition: '68% center', arrowTreatment: { left: '4%', top: '10%', width: '30%', height: '50%', rotate: '2deg', foregroundClipPath: 'polygon(0 60%, 100% 56%, 100% 100%, 0 100%)' } },
    { title: 'Travel covered from start to finish', body: 'Arrange travel cover before your next trip.', caption: 'Keep your plans protected from departure to return.', image: travelInsuranceCampaign, imagePosition: '58% 42%' },
    { title: 'Prepare for life’s unexpected moments', body: 'Choose protection that supports the people who matter most.', caption: 'Review your cover whenever life changes.', image: interestSafetyNet, imagePosition: 'center 38%' },
  ],
};

type ShopSmartCategory = 'popular' | ShopSmartOfferCategory;

function formatMoney(amount: FormattedAmount, hidden: boolean) {
  const display = maskAmountParts(amount, hidden);
  return <><span className="text-[24px] font-bold leading-[27px] tracking-[-0.025em]">{display.integer}</span><span className="text-[16px] font-medium leading-[20px]">{display.decimals} {display.currency}</span></>;
}

function formatSummaryMoney(amount: FormattedAmount, hidden: boolean) {
  const display = maskAmountParts(amount, hidden);
  return <><span data-home-summary-primary-amount className="text-[28px] font-bold leading-[28px] tracking-[-0.025em]">{display.integer}</span><span className="text-[16px] font-medium leading-[20px]">{display.decimals} {display.currency}</span></>;
}

function formatSupportingMoney(amount: FormattedAmount, hidden: boolean) {
  const display = maskAmountParts(amount, hidden);
  return <span data-home-supporting-amount className="inline-flex items-baseline whitespace-nowrap text-[16px]"><span className="text-[16px] font-bold leading-[20px] tracking-[-0.018em]">{display.integer}</span><span className="text-[12px] font-medium leading-[16px]">{display.decimals} {display.currency}</span></span>;
}

function formatDetailMoney(amount: FormattedAmount, hidden: boolean) {
  const display = maskAmountParts(amount, hidden);
  return <span className="inline-flex items-baseline whitespace-nowrap"><span className="text-[16px] font-bold leading-[20px] tracking-[-0.018em]">{display.integer}</span><span className="text-[14px] font-bold leading-[18px]">{display.decimals} {display.currency}</span></span>;
}

function formatMaturityMoney(amount: FormattedAmount, hidden: boolean) {
  const display = maskAmountParts(amount, hidden);
  return <span data-home-deposit-maturity-value className="inline-flex items-baseline whitespace-nowrap text-[14px] font-normal leading-[18px]"><span>{display.integer}</span><span>{display.decimals} {display.currency}</span></span>;
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
  accounts: { src: accountsLighthouse, className: 'top-[24px] right-0 h-[116px] w-[96px]' },
  savings: { src: savingsCactus, className: 'bottom-[-48px] right-[-44px] h-[220px] w-[184px]' },
  credits: { src: loansHouse, className: 'bottom-[-10px] right-[-12px] h-[170px] w-[174px]' },
  insurance: { src: insuranceUmbrella, className: 'bottom-[-24px] right-[-38px] h-[186px] w-[210px]' },
};

function SummaryBanner({ tab, amount, amountsHidden, secondaryLabel, secondaryValue, policyCount = 2 }: { tab: TransformationTab; amount?: FormattedAmount; amountsHidden: boolean; secondaryLabel?: string; secondaryValue?: FormattedAmount | string; policyCount?: number }) {
  if (tab === 'accounts' && amount && typeof secondaryValue !== 'string') {
    const displayedTotal = maskAmountParts(amount, amountsHidden);
    // A month whose last week has no spending yet leaves the row out entirely.
    const displayedSpent = secondaryValue && secondaryLabel ? maskAmountParts(secondaryValue, amountsHidden) : null;

    return (
      <section
        data-home-transformation-summary={tab}
        data-home-summary-variant="baseline"
        className="relative flex h-[145.25px] min-h-[145.25px] w-full overflow-hidden rounded-[8px] bg-[var(--uc-summary-accounts)] px-[24px] py-[15px]"
      >
        <div data-home-summary-content className="relative z-10 flex flex-1 flex-col">
            <div className="flex flex-col gap-[4px]">
              <p className="uc-type-n5-strong text-[var(--uc-text)]">Total Available</p>
              <div className="flex items-baseline gap-[2px]">
                <span data-home-summary-primary-amount className="text-[28px] font-bold leading-[28px] tracking-[-0.025em] text-[var(--uc-text)]">{displayedTotal.integer}</span>
                <span className="uc-type-n2-strong leading-[1] text-[var(--uc-text)]">{displayedTotal.decimals} {displayedTotal.currency}</span>
              </div>
            </div>

            {displayedSpent ? <>
              <div data-home-summary-divider className="my-[9px] h-px w-full bg-[color-mix(in_srgb,var(--uc-text)_35%,transparent)]" />

              <div className="flex flex-col gap-[4px]">
                <p className="uc-type-n5-strong text-[var(--uc-text)]">{secondaryLabel}</p>
                <div className="flex items-baseline">
                  <span data-home-summary-secondary-amount className="uc-type-n2-strong leading-[1] text-[var(--uc-text)]">{displayedSpent.integer}</span>
                  <span className="uc-type-n5-strong leading-[1] text-[var(--uc-text)]">{displayedSpent.decimals} {displayedSpent.currency}</span>
                </div>
              </div>
            </> : null}
        </div>

        <div data-home-summary-art-container className="absolute right-0 top-[24px] z-0 w-[96px]">
          <img src={accountsLighthouse} alt="Lighthouse" data-home-summary-art={tab} className="h-auto w-full object-cover" />
        </div>
      </section>
    );
  }

  const headline = tab === 'insurance' ? "You're covered" : tab === 'credits' ? 'Total owed' : tab === 'savings' ? 'Total savings' : 'Total Available';
  const featured = tab === 'insurance'
    ? <span data-home-insurance-policy-count className="text-[28px] font-bold leading-[32px] tracking-[-0.025em]">{policyCount} active {policyCount === 1 ? 'policy' : 'policies'}</span>
    : amount ? formatSummaryMoney(amount, amountsHidden) : null;
  const tone = tab === 'accounts'
    ? 'bg-[var(--uc-summary-accounts)]'
    : tab === 'savings'
      ? 'bg-[var(--uc-summary-savings)]'
      : tab === 'credits'
        ? 'bg-[var(--uc-summary-credits)]'
        : 'bg-[var(--uc-summary-insurance)]';
  const art = SUMMARY_ART[tab];

  return (
    <section
      data-home-transformation-summary={tab}
      className={`relative isolate h-[145.25px] min-h-[145.25px] overflow-hidden rounded-[8px] ${tone} px-[24px] py-[15px] text-[var(--uc-text)]`}
    >
      <div className="relative z-10 max-w-[calc(100%-112px)] sm:max-w-[66%]">
        <p className="text-[14px] font-bold leading-[18px]">{headline}</p>
        <div className="mt-[2px] flex items-baseline whitespace-nowrap">{featured}</div>
        {secondaryValue !== undefined ? <>
          <div
            data-home-summary-divider
            className="my-[9px] h-px w-full bg-[color-mix(in_srgb,var(--uc-text)_35%,transparent)]"
          />
          <p className="text-[14px] font-bold leading-[18px]">{secondaryLabel}</p>
          <p data-home-summary-secondary-amount className="mt-[1px] text-[18px] font-bold leading-[22px]">{typeof secondaryValue === 'string' ? secondaryValue : formatMoney(secondaryValue, amountsHidden)}</p>
        </> : null}
      </div>
      {art ? <img src={art.src} alt="" aria-hidden="true" data-home-summary-art={tab} className={`pointer-events-none absolute z-0 object-contain object-right-bottom drop-shadow-[0_8px_10px_rgb(var(--uc-shadow-rgb)/0.14)] ${art.className}`} /> : null}
    </section>
  );
}

function Group({ title, children, defaultOpen = true, preview, expandable = true }: { title: string; children: ReactNode; defaultOpen?: boolean; preview?: ReactNode; expandable?: boolean }) {
  const [isOpen, setOpen] = useState(defaultOpen);
  const id = `transformation-group-${title.toLowerCase().replace(/[^a-z]+/g, '-')}`;

  return (
    <section data-home-transformation-group={id}>
      {expandable ? <button type="button" data-home-product-group-header="compact" aria-expanded={isOpen} aria-controls={id} onClick={() => setOpen((value) => !value)} className="flex h-[48px] w-full items-center justify-between px-0 text-left transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]">
        <h2 className="uc-type-l1 text-[var(--uc-text)]">{title}</h2>
        <span className={`grid size-[32px] place-items-center transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <AppIcon name="chevron-down-wide" color="var(--uc-icon)" aria-hidden="true" />
        </span>
      </button> : <div data-home-product-group-header="static" className="flex h-[48px] w-full items-center px-0">
        <h2 className="uc-type-l1 text-[var(--uc-text)]">{title}</h2>
      </div>}
      {!expandable || isOpen ? <div id={expandable ? id : undefined} className="mt-[12px]">{children}</div> : preview ? <div className="mt-[12px]">{preview}</div> : null}
    </section>
  );
}

const INSURANCE_POLICIES = [
  { title: 'Genius Protect', subtitle: 'Life insurance policy · 3431424', premium: 'Next premium: 70 CZK', payment: 'Last payment: 30/05/2027', progress: 30 },
  { title: 'Home Protect', subtitle: 'Home insurance policy · 3431425', premium: 'Next premium: 120 CZK', payment: 'Renewal: 15/11/2026', progress: 56 },
] as const;

function ProductStackPreview() {
  return <span aria-hidden="true" data-home-product-stack-preview className="relative z-0 -mt-[6px] block h-[16px] w-full rounded-b-[8px] border-x border-b border-[color-mix(in_srgb,var(--uc-border-muted)_72%,transparent)] bg-[var(--uc-surface-raised)]" />;
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

function depositPresentation(product: Product): DepositPresentation {
  return EVO_2027_DEPOSIT_PRESENTATIONS[product.id] ?? DEFAULT_DEPOSIT_PRESENTATION;
}

function DepositList({ deposits, amountsHidden, formatProductAmount, onProductClick, collapsed = false }: { deposits: Product[]; amountsHidden: boolean; formatProductAmount: (product: Product) => FormattedAmount; onProductClick: (product: Product) => void; collapsed?: boolean }) {
  const displayedDeposits = collapsed ? deposits.slice(0, 1) : deposits;

  return <>
    <div data-home-deposit-list className={['overflow-hidden rounded-[8px] bg-[var(--uc-surface)]', collapsed ? 'relative z-10 shadow-[0_6px_12px_rgb(var(--uc-shadow-rgb)/0.08)]' : ''].join(' ')}>
      {displayedDeposits.map((product, index) => {
        const current = formatProductAmount(product);
        const presentation = depositPresentation(product);
        const maturity = formatEvo2027Amount(product.balance * (1 + presentation.annualRate * presentation.termDays / 365), product.currency);
        const elapsedDays = presentation.termDays - presentation.daysToMaturity;
        const maturityProgress = presentation.termDays > 0 ? (elapsedDays / presentation.termDays) * 100 : 0;

        return <div key={product.id} data-home-deposit-card className={['bg-[var(--uc-surface)] p-[16px]', index > 0 ? 'border-t-[0.5px] border-[var(--uc-border-muted)]' : ''].filter(Boolean).join(' ')}>
          <button type="button" onClick={() => onProductClick(product)} className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]">
            <p className="text-[16px] font-bold">{product.name} · {(presentation.annualRate * 100).toFixed(1)}% p.a.</p>
            <p data-home-deposit-maturity className="mt-[3px] flex items-baseline gap-[3px] text-[14px] font-normal leading-[18px] text-[var(--uc-text-muted)]">Maturity amount: {formatMaturityMoney(maturity, amountsHidden)}</p>
            <p className="mt-[12px] text-[var(--uc-text)]">{formatMoney(current, amountsHidden)}</p>
          </button>
          <div className="mt-[24px] flex justify-between text-[14px]"><span>Period: <b>{presentation.periodLabel}</b></span><span>Days to maturity: <b>{presentation.daysToMaturity}</b></span></div>
          <div data-home-deposit-maturity-progress role="progressbar" aria-label={`${product.name} maturity progress`} aria-valuemin={0} aria-valuemax={presentation.termDays} aria-valuenow={elapsedDays} aria-valuetext={`${elapsedDays} of ${presentation.termDays} days elapsed; ${presentation.daysToMaturity} days to maturity`} className="mt-[10px] h-[12px] overflow-hidden rounded-full bg-[var(--uc-surface-muted)]"><div className="h-full rounded-full bg-[var(--uc-action)]" style={{ width: `${maturityProgress}%` }} /></div>
          <div className="mt-[10px] flex justify-between text-[13px] text-[var(--uc-text-muted)]"><span>Start date: {presentation.startDate}</span><span>Maturity: {presentation.maturityDate}</span></div>
        </div>;
      })}
    </div>
    {collapsed && deposits.length > 1 ? <ProductStackPreview /> : null}
  </>;
}

function InsurancePolicyList({ onClick, collapsed = false }: { onClick?: () => void; collapsed?: boolean }) {
  const policies = collapsed ? INSURANCE_POLICIES.slice(0, 1) : INSURANCE_POLICIES;

  return <>
    <div data-home-insurance-policy-list className={['overflow-hidden rounded-[8px] bg-[var(--uc-surface)]', collapsed ? 'relative z-10 shadow-[0_6px_12px_rgb(var(--uc-shadow-rgb)/0.08)]' : ''].join(' ')}>
      {policies.map((policy, index) => (
        <button key={policy.title} data-home-insurance-policy-card type="button" onClick={onClick} className={`w-full p-[16px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] ${index > 0 ? 'border-t-[0.5px] border-[var(--uc-border-muted)]' : ''}`}>
          <div className="flex items-start justify-between gap-[12px]"><span><span className="block text-[16px] font-bold">{policy.title}</span><span className="mt-[4px] block text-[14px] text-[var(--uc-text-muted)]">{policy.subtitle}</span></span><span data-home-insurance-logo className="grid h-[40px] w-[72px] shrink-0 place-items-center overflow-hidden rounded-[4px] bg-[#00549f] text-[14px] font-bold text-white">Allianz</span></div>
          <div data-home-insurance-progress role="progressbar" aria-label={`${policy.title} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={policy.progress} className="mt-[16px] h-[12px] overflow-hidden rounded-full bg-[var(--uc-surface-muted)]"><div className="h-full rounded-full bg-[var(--uc-action)]" style={{ width: `${policy.progress}%` }} /></div>
          <div className="mt-[10px] flex justify-between gap-[12px] text-[13px] text-[var(--uc-text-muted)]"><span>{policy.premium}</span><span>{policy.payment}</span></div>
        </button>
      ))}
    </div>
    {collapsed ? <ProductStackPreview /> : null}
  </>;
}

function LoanList({ loans, amountsHidden, onProductClick, collapsed = false }: { loans: Product[]; amountsHidden: boolean; onProductClick: (product: Product) => void; collapsed?: boolean }) {
  const displayedLoans = collapsed ? loans.slice(0, 1) : loans;

  return <>
    <div data-home-loan-list className={['overflow-hidden rounded-[8px] bg-[var(--uc-surface)]', collapsed ? 'relative z-10 shadow-[0_6px_12px_rgb(var(--uc-shadow-rgb)/0.08)]' : ''].join(' ')}>
      {displayedLoans.map((product, index) => {
        const total = Math.abs(product.balance) * 1.45;
        const repaid = total - Math.abs(product.balance);
  const remaining = formatEvo2027Amount(Math.abs(product.balance), product.currency);
  const installment = formatEvo2027Amount(Math.round(Math.abs(product.balance) * 0.009), product.currency);
  const totalAmount = formatEvo2027Amount(total, product.currency);
  const repaidAmount = formatEvo2027Amount(repaid, product.currency);
        const repaidPercentage = total > 0 ? (repaid / total) * 100 : 0;

        return <div key={product.id} data-home-loan-card className={['bg-[var(--uc-surface)] p-[16px]', index > 0 ? 'border-t-[0.5px] border-[var(--uc-border-muted)]' : ''].filter(Boolean).join(' ')}>
          <button type="button" onClick={() => onProductClick(product)} className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]">
            <p className="text-[16px] font-bold">{product.name}</p>
            <p data-home-loan-installment className="mt-[4px] flex items-baseline gap-[3px] text-[14px] text-[var(--uc-text-muted)]">Next installment: {formatSupportingMoney(installment, amountsHidden)}</p>
            <p className="mt-[10px] text-[var(--uc-text)]">{formatMoney(remaining, amountsHidden)}</p>
          </button>
          <div data-home-loan-progress role="progressbar" aria-label={`${product.name} repaid`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(repaidPercentage)} className="mt-[16px] h-[12px] overflow-hidden rounded-full bg-[var(--uc-surface-muted)]"><div className="h-full rounded-full bg-[var(--uc-action)]" style={{ width: `${repaidPercentage}%` }} /></div>
          <div className="mt-[10px] flex justify-between gap-[12px] text-[14px]"><span className="text-[var(--uc-text-muted)]">Total repaid<br /><span data-home-loan-repaid-amount className="inline-flex items-baseline whitespace-nowrap text-[var(--uc-text)]">{formatDetailMoney(repaidAmount, amountsHidden)}</span></span><span className="text-right text-[var(--uc-text-muted)]">Total loan<br /><span data-home-loan-total-amount className="inline-flex items-baseline whitespace-nowrap text-[var(--uc-text)]">{formatDetailMoney(totalAmount, amountsHidden)}</span></span></div>
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

function HorizontalCarousel({ ariaLabel, count, children }: { ariaLabel: string; count: number; children: ReactNode }) {
  const railRef = useRef<HTMLDivElement>(null);
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

function InterestCarousel({ tab, onProductsClick }: { tab: TransformationTab; onProductsClick?: () => void }) {
  const cards = INTEREST_CAMPAIGNS[tab];
  const sectionTitle = INTEREST_SECTION_TITLES[tab];
  return (
    <section data-home-interest-carousel aria-labelledby="interest-heading">
      <h2 id="interest-heading" className="uc-type-l1 text-[var(--uc-text)]">{sectionTitle}</h2>
      <HorizontalCarousel ariaLabel={sectionTitle} count={cards.length}>
        {cards.map((card, index) => (
          <button key={index} type="button" onClick={onProductsClick} className="flex h-full w-[calc(100%-48px)] shrink-0 snap-start flex-col overflow-hidden rounded-[8px] bg-[var(--uc-surface)] text-left shadow-[0_1px_1px_rgb(var(--uc-shadow-rgb)/0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]">
            <div className="relative h-[100px] overflow-hidden bg-[var(--uc-surface-muted)] leading-none">
              <img src={card.image} alt="" aria-hidden="true" data-home-interest-media className="block size-full scale-[1.12] object-cover" style={{ objectPosition: card.imagePosition }} />
              {card.arrowTreatment ? <>
                <span
                  data-home-interest-arrow-back
                  aria-hidden="true"
                  className="pointer-events-none absolute z-10 drop-shadow-[0_2px_2px_rgb(0_0_0_/_0.24)]"
                  style={{
                    left: card.arrowTreatment.left,
                    top: card.arrowTreatment.top,
                    width: card.arrowTreatment.width,
                    height: card.arrowTreatment.height,
                    transform: `rotate(${card.arrowTreatment.rotate})`,
                  }}
                >
                  <CardArrowMark />
                </span>
                <span
                  data-home-interest-arrow-front
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
                  style={{ clipPath: card.arrowTreatment.foregroundClipPath }}
                >
                  <img src={card.image} alt="" className="block size-full scale-[1.12] object-cover" style={{ objectPosition: card.imagePosition }} />
                </span>
              </> : null}
            </div>
            <div className="flex flex-1 flex-col px-[16px] py-[12px]">
              <h3 className="min-h-[46px] text-[18px] font-bold leading-[23px]">{card.title}</h3>
              <p className="mt-[7px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">{card.body}</p>
              <p className="mt-[8px] text-[13px] leading-[17px] text-[var(--uc-text-muted)]">{card.caption}</p>
            </div>
          </button>
        ))}
      </HorizontalCarousel>
    </section>
  );
}

function ShopSmart({ country, onProductsClick }: { country: CountryId; onProductsClick?: () => void }) {
  const [activeFilter, setActiveFilter] = useState<ShopSmartCategory>('popular');
  const offers = getProductsMenuForCountry(country).shopSmartOfferCards;
  const visibleOffers = activeFilter === 'popular'
    ? offers
    : offers.filter((offer) => offer.categories.includes(activeFilter));
  const filters: ReadonlyArray<{ id: ShopSmartCategory; label: string }> = [
    { id: 'popular', label: 'Most popular' },
    { id: 'eshops', label: 'E-shops' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'travel', label: 'Travel' },
    { id: 'home', label: 'Home & living' },
  ];
  const categoriesRef = useRef<HTMLDivElement>(null);
  const { dragHandlers: categoryDragHandlers, isDragging: isCategoryDragging } = useDragCarousel({
    carouselRef: categoriesRef,
    enabled: offers.length > 0 && filters.length > 1,
  });

  if (!offers.length) return null;

  return (
    <section data-home-shopsmart data-home-shopsmart-filter={activeFilter}>
      <h2 className="uc-type-l1 text-[var(--uc-text)]">Shopsmart</h2>
      <div
        ref={categoriesRef}
        {...categoryDragHandlers}
        className={`mt-[12px] flex flex-nowrap gap-[8px] overflow-x-auto overscroll-x-contain scrollbar-hide select-none touch-pan-y ${isCategoryDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        aria-label="ShopSmart categories"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
      >
        {filters.map((filter) => {
          const active = filter.id === activeFilter;
          return <button key={filter.id} type="button" aria-pressed={active} onPointerDown={(event) => event.stopPropagation()} onClick={() => setActiveFilter(filter.id)} className={`flex h-[46px] shrink-0 items-center justify-center rounded-full border px-[12px] text-[18px] leading-[20px] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] ${active ? 'flex-col gap-[2px] border-transparent bg-[var(--uc-action-strong)] py-[8px] font-medium text-[var(--uc-static-white)]' : 'border-transparent bg-[var(--uc-surface)] font-normal text-[var(--uc-text-muted)]'}`}>
            <span>{filter.label}</span>
            {active ? <span aria-hidden="true" data-home-shopsmart-filter-dot className="size-[4px] rounded-full bg-[var(--uc-static-white)]" /> : null}
          </button>;
        })}
      </div>
      <HorizontalCarousel key={activeFilter} ariaLabel="ShopSmart offers" count={visibleOffers.length}>
        {visibleOffers.map((offer) => (
          <div key={offer.id} className="w-[min(327px,calc(100vw-64px))] shrink-0 snap-start">
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

export default function App2027TransformationHome({ categories, country, amountsHidden, calculateTotal, calculateTotalAvailable, calculateTotalOwed, formatProductAmount, getProductDisplayNumber, onProductClick, onSeeAllTransactions, onAccountInfoClick, onDomesticPaymentClick, onPaymentsClick, onCardDetailsClick, onCardOptionsClick, onProductsClick, onTransactionOpen }: App2027TransformationHomeProps) {
  const [activeTab, setActiveTab] = useState<TransformationTab>('accounts');
  const accounts = categoryProducts(categories, 'accounts');
  const cards = categoryProducts(categories, 'cards');
  const debitCards = cards.filter((product) => product.type === 'debit_card');
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
  const totalSavings = useMemo(() => calculateTotal([...savings, ...deposits, ...investments]), [calculateTotal, deposits, investments, savings]);
  const savingsGrowth = useMemo(() => formatEvo2027Amount(
    Math.max(0, Math.round(Number(totalSavings.integer.replace(/\D/g, '')) * 0.032)),
    totalSavings.currency,
  ), [totalSavings]);
  const debt = calculateTotalOwed();
  const dueThisMonth = useMemo(() => formatEvo2027Amount(
    Math.max(0, Math.round(Number(debt.integer.replace(/\D/g, '')) * 0.009)),
    debt.currency,
  ), [debt]);

  return (
    <div data-home-transformation data-home-area="transformation" className="flex min-w-0 flex-col gap-[28px]">
      <section data-home-area="product-categories" className="min-w-0">
        <div role="tablist" aria-label="Product categories" className="flex gap-[5px] overflow-x-auto overscroll-x-contain scrollbar-hide">
          {(Object.keys(TAB_LABELS) as TransformationTab[]).map((tab) => {
            const active = activeTab === tab;
            return <button key={tab} type="button" role="tab" aria-selected={active} onClick={() => setActiveTab(tab)} className={`flex h-[46px] shrink-0 items-center justify-center rounded-full border px-[12px] text-[18px] leading-[20px] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] ${active ? 'flex-col gap-[2px] border-transparent bg-[var(--uc-action-strong)] py-[8px] font-medium text-[var(--uc-static-white)]' : 'border-transparent bg-[var(--uc-surface)] font-normal text-[var(--uc-text-muted)]'}`}><span>{TAB_LABELS[tab]}</span>{active ? <span aria-hidden="true" className="size-[4px] rounded-full bg-[var(--uc-static-white)]" /> : null}</button>;
          })}
        </div>
      </section>

      {activeTab === 'accounts' ? <>
        <SummaryBanner tab="accounts" amount={calculateTotalAvailable()} amountsHidden={amountsHidden} secondaryLabel={weekSpending ? "Spent this week" : undefined} secondaryValue={weekSpending ? formatEvo2027Amount(weekSpending.total, weekSpending.currency as Product['currency']) : undefined} />
        {!accounts.length ? <Group title="Accounts"><EmptyProducts title="Open your everyday account" description="Choose an account for payments, salary and everyday banking." onClick={onProductsClick} /></Group> : null}
        {!debitCards.length ? <Group title="Cards"><EmptyProducts title="Choose a card for everyday use" description="Explore cards with benefits that fit your spending." onClick={onProductsClick} /></Group> : null}
        <App2027ProductAccordions categories={debitCardCategories} amountsHidden={amountsHidden} formatProductAmount={formatProductAmount} calculateGroupTotal={calculateTotal} getProductDisplayNumber={getProductDisplayNumber} onProductClick={onProductClick} useCzRoboAccountCards onDomesticPaymentClick={onDomesticPaymentClick} onPaymentsClick={onPaymentsClick} onAccountInfoClick={onAccountInfoClick} onCardDetailsClick={onCardDetailsClick} onCardOptionsClick={onCardOptionsClick} visibleKeys={['accounts', 'cards']} initialOpenKeys={{ accounts: true, cards: true }} />
        {accounts.length ? <App2027Activity country={country} currency={calculateTotal(accounts).currency} amountsHidden={amountsHidden} compact homeArea={false} onTransactionOpen={onTransactionOpen} onSeeMore={onSeeAllTransactions ?? (() => { const firstAccount = accounts[0]; if (firstAccount) onProductClick(firstAccount); })} /> : null}
        <InterestCarousel tab="accounts" onProductsClick={onProductsClick} />
        <ShopSmart country={country} onProductsClick={onProductsClick} />
      </> : null}

      {activeTab === 'savings' ? <>
        <SummaryBanner tab="savings" amount={totalSavings} amountsHidden={amountsHidden} secondaryLabel="Growth this year" secondaryValue={savingsGrowth} />
        <Group title="Investment portfolios" expandable={investments.length > 1}>{investments.length ? investments.map((product) => <CompactProductCard key={product.id} product={product} amount={formatProductAmount(product)} amountsHidden={amountsHidden} performance={portfolioPerformance} onClick={() => onProductClick(product)} />) : <EmptyProducts title="Start investing" description="Explore portfolios built around your goals." onClick={onProductsClick} />}</Group>
        <Group title="Saving Accounts" expandable={savings.length > 1}>{savings.length ? <div data-home-compact-product-list="saving_account" className="overflow-hidden rounded-[8px] shadow-[0_1px_1px_rgb(var(--uc-shadow-rgb)/0.04)]">{savings.map((product, index) => <CompactProductCard key={product.id} product={product} amount={formatProductAmount(product)} amountsHidden={amountsHidden} subtitle="2.5% p.a." onClick={() => onProductClick(product)} stackRole={savings.length === 1 ? 'single' : index === 0 ? 'first' : index === savings.length - 1 ? 'last' : 'middle'} />)}</div> : <EmptyProducts title="Start saving for what matters" description="Open a saving account and set money aside automatically." onClick={onProductsClick} />}</Group>
        <Group title="Deposits" defaultOpen={deposits.length <= 1} expandable={deposits.length > 1} preview={deposits.length > 1 ? <DepositList deposits={deposits} amountsHidden={amountsHidden} formatProductAmount={formatProductAmount} onProductClick={onProductClick} collapsed /> : undefined}>
          {deposits.length ? <DepositList deposits={deposits} amountsHidden={amountsHidden} formatProductAmount={formatProductAmount} onProductClick={onProductClick} /> : <EmptyProducts title="Explore term deposits" description="Put your money to work with a fixed return." onClick={onProductsClick} />}
        </Group>
        <InterestCarousel tab="savings" onProductsClick={onProductsClick} />
      </> : null}

      {activeTab === 'credits' ? <>
        <SummaryBanner tab="credits" amount={debt} amountsHidden={amountsHidden} secondaryLabel="Due this month" secondaryValue={dueThisMonth} />
        {cards.filter((product) => product.type === 'credit_card').length ? <App2027ProductAccordions categories={creditCategories} amountsHidden={amountsHidden} formatProductAmount={formatProductAmount} calculateGroupTotal={calculateTotal} getProductDisplayNumber={getProductDisplayNumber} onProductClick={onProductClick} onCardDetailsClick={onCardDetailsClick} onCardOptionsClick={onCardOptionsClick} useCzRoboAccountCards visibleKeys={['cards']} initialOpenKeys={{ cards: true }} titleOverrides={{ cards: 'Credit Cards' }} /> : <Group title="Credit Cards"><EmptyProducts title="Discover a credit card" description="Choose benefits that match your everyday spending." onClick={onProductsClick} /></Group>}
        <Group title="Loans" defaultOpen={loans.length <= 1} expandable={loans.length > 1} preview={loans.length > 1 ? <LoanList loans={loans} amountsHidden={amountsHidden} onProductClick={onProductClick} collapsed /> : undefined}>
          {loans.length ? <LoanList loans={loans} amountsHidden={amountsHidden} onProductClick={onProductClick} /> : <EmptyProducts title="Find financing that fits" description="Explore a loan for your next plan." onClick={onProductsClick} />}
        </Group>
        <Group title="Mortgages" defaultOpen={mortgages.length <= 1} expandable={mortgages.length > 1} preview={mortgages.length > 1 ? <LoanList loans={mortgages} amountsHidden={amountsHidden} onProductClick={onProductClick} collapsed /> : undefined}>
          {mortgages.length ? <LoanList loans={mortgages} amountsHidden={amountsHidden} onProductClick={onProductClick} /> : <EmptyProducts title="Plan your home" description="See what a mortgage with us would look like." onClick={onProductsClick} />}
        </Group>
        <InterestCarousel tab="credits" onProductsClick={onProductsClick} />
      </> : null}

      {activeTab === 'insurance' ? <>
        <SummaryBanner tab="insurance" amountsHidden={amountsHidden} secondaryLabel="Next renewal" secondaryValue="15 Nov 2026" />
        <Group title="Insurance" defaultOpen={false} preview={<InsurancePolicyList onClick={onProductsClick} collapsed />}>
          <InsurancePolicyList onClick={onProductsClick} />
        </Group>
        <InterestCarousel tab="insurance" onProductsClick={onProductsClick} />
      </> : null}
    </div>
  );
}
