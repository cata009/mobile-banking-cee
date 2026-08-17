import { Children, cloneElement, isValidElement, useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type UIEvent } from 'react';
import { AppIcon } from '@/app/components/icons';
import AccountCarouselIndicator from '@/app/components/accounts/AccountCarouselIndicator';
import GhostBanner from '@/app/components/cards/GhostBanner';
import { maskAmountParts } from '@/app/utils/amountPrivacy';
import { formatAmount, type Product, type ProductCategory } from '@/data/products';
import type { CountryId } from '@/app/state/demoTypes';
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
import shopSmartDining from '@/assets/app2027/home-shopsmart-dining.png';
import shopSmartValentino from '@/assets/shopsmart/shopsmart-valentino.png';
import shopSmartLentiamo from '@/assets/shopsmart/shopsmart-lentiamo.png';
import shopSmartEnglishHome from '@/assets/shopsmart/shopsmart-english-home.png';
import shopSmartOffersOne from '@/assets/shopsmart/shopsmart-ds-offers-1.png';
import shopSmartOffersTwo from '@/assets/shopsmart/shopsmart-ds-offers-2.png';
import App2027Activity from './App2027Activity';
import App2027ProductAccordions, { CurrencyBadge } from './App2027ProductAccordions';

type TransformationTab = 'accounts' | 'savings' | 'credits' | 'insurance';
type FormattedAmount = { integer: string; decimals: string; currency: string };

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

type InterestCampaign = {
  title: string;
  body: string;
  caption: string;
  image: string;
  imagePosition: string;
};

const INTEREST_CAMPAIGNS: Record<TransformationTab, readonly InterestCampaign[]> = {
  accounts: [
    { title: 'Build your savings without thinking about it', body: 'Round up everyday payments and save the difference.', caption: 'Set your rule and adjust it at any time.', image: interestRoundups, imagePosition: 'center 38%' },
    { title: 'Discover what is next for you', body: 'Useful ideas that keep everyday banking moving.', caption: 'Choose what works for you.', image: interestNextStep, imagePosition: 'center 23%' },
    { title: 'A little extra peace of mind', body: 'Build a safety net for the moments that matter.', caption: 'Review your options whenever you need.', image: interestSafetyNet, imagePosition: 'center 38%' },
  ],
  savings: [
    { title: 'Build your safety net', body: 'Set money aside automatically, at your own pace.', caption: 'Start with an amount that feels right.', image: interestSafetyNet, imagePosition: 'center 38%' },
    { title: 'Put every crown to work', body: 'Make small changes that help your savings grow.', caption: 'Choose a savings goal that suits you.', image: interestRoundups, imagePosition: 'center 38%' },
    { title: 'Make room for your next plan', body: 'Set money aside for the things you are looking forward to.', caption: 'Adjust your plan whenever life changes.', image: interestNextStep, imagePosition: 'center 23%' },
  ],
  credits: [
    { title: 'Plan your next move with confidence', body: 'Explore financing options for the things that matter.', caption: 'Find a loan that fits your plans.', image: interestNextStep, imagePosition: 'center 23%' },
    { title: 'A mortgage shaped around you', body: 'Compare options for a home that works for your next chapter.', caption: 'See what a realistic monthly payment could look like.', image: shopSmartEnglishHome, imagePosition: 'center 45%' },
    { title: 'Make room for what matters now', body: 'Finance your next priority with repayments you can plan for.', caption: 'Subject to credit approval.', image: shopSmartValentino, imagePosition: 'center 35%' },
  ],
  insurance: [
    { title: 'Protect the place you call home', body: 'Explore cover for your home and belongings.', caption: 'Find protection that fits your needs.', image: homeInsuranceCampaign, imagePosition: '68% center' },
    { title: 'Travel with confidence', body: 'Arrange travel cover before your next trip.', caption: 'Keep your plans protected from departure to return.', image: travelInsuranceCampaign, imagePosition: '58% 42%' },
    { title: 'Cover for life’s unexpected turns', body: 'Choose protection that supports the people who matter most.', caption: 'Review your cover whenever life changes.', image: interestSafetyNet, imagePosition: 'center 38%' },
  ],
};

type ShopSmartCategory = 'popular' | 'eshops' | 'electronics' | 'travel' | 'home';

type ShopSmartHomeOffer = {
  id: string;
  category: Exclude<ShopSmartCategory, 'popular'>;
  merchant: string;
  title: string;
  description: string;
  image: string;
};

const SHOPSMART_HOME_OFFERS: readonly ShopSmartHomeOffer[] = [
  { id: 'alza-weekend', category: 'eshops', merchant: 'Alza.cz', title: 'A better weekend starts at home', description: 'Activate a 10% cashback offer on selected home and lifestyle picks.', image: shopSmartDining },
  { id: 'mall-everyday', category: 'eshops', merchant: 'Mall.cz', title: 'Everyday picks, extra value', description: 'Save on the items that make the week run more smoothly.', image: shopSmartEnglishHome },
  { id: 'datart-connected', category: 'electronics', merchant: 'Datart', title: 'Stay connected for less', description: 'Enjoy a special price on headphones, wearables, and smart devices.', image: shopSmartLentiamo },
  { id: 'czc-tech', category: 'electronics', merchant: 'CZC.cz', title: 'Smart tech for every plan', description: 'Unlock card-linked offers on your next tech upgrade.', image: shopSmartOffersOne },
  { id: 'booking-city-break', category: 'travel', merchant: 'Booking.com', title: 'City breaks made easier', description: 'Get more from every stay with travel offers selected for you.', image: shopSmartValentino },
  { id: 'regiojet-escape', category: 'travel', merchant: 'RegioJet', title: 'More room for your next escape', description: 'Enjoy a little extra back when your next journey begins.', image: interestNextStep },
  { id: 'ikea-living', category: 'home', merchant: 'IKEA', title: 'Make your home work harder', description: 'Refresh your space with an activated offer for your home.', image: shopSmartOffersTwo },
  { id: 'bonami-upgrades', category: 'home', merchant: 'Bonami', title: 'Small upgrades, better everyday', description: 'Find more value in the details that make a home feel yours.', image: interestSafetyNet },
];

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

function categoryProducts(categories: ProductCategory[], key: ProductCategory['key']) {
  return categories.find((category) => category.key === key)?.products ?? [];
}

const SUMMARY_ART: Partial<Record<TransformationTab, { src: string; className: string }>> = {
  accounts: { src: accountsLighthouse, className: 'top-[24px] right-0 h-[116px] w-[96px]' },
  savings: { src: savingsCactus, className: 'bottom-[-48px] right-[-44px] h-[220px] w-[184px]' },
  credits: { src: loansHouse, className: 'bottom-[-10px] right-[-12px] h-[170px] w-[174px]' },
  insurance: { src: insuranceUmbrella, className: 'bottom-[-24px] right-[-38px] h-[186px] w-[210px]' },
};

function SummaryBanner({ tab, amount, amountsHidden, secondaryLabel, secondaryValue, policyCount = 2 }: { tab: TransformationTab; amount?: FormattedAmount; amountsHidden: boolean; secondaryLabel: string; secondaryValue: FormattedAmount | string; policyCount?: number }) {
  if (tab === 'accounts' && amount && typeof secondaryValue !== 'string') {
    const displayedTotal = maskAmountParts(amount, amountsHidden);
    const displayedSpent = maskAmountParts(secondaryValue, amountsHidden);

    return (
      <section
        data-home-transformation-summary={tab}
        data-home-summary-variant="baseline"
        className="relative flex h-[145.25px] w-full overflow-hidden rounded-[8px] bg-[#94B1BA]"
      >
        <div data-home-summary-content className="flex flex-1 flex-col gap-[4px] p-[24px]">
            <div className="flex flex-col gap-[4px]">
              <p className="uc-type-n5-strong text-[var(--uc-text)]">Total Available</p>
              <div className="flex items-baseline gap-[2px]">
                <span data-home-summary-primary-amount className="text-[28px] font-bold leading-[28px] tracking-[-0.025em] text-[var(--uc-text)]">{displayedTotal.integer}</span>
                <span className="uc-type-n2-strong leading-[1] text-[var(--uc-text)]">{displayedTotal.decimals} {displayedTotal.currency}</span>
              </div>
            </div>

            <div data-home-summary-divider className="h-[0.25px] w-[205px] bg-[var(--uc-text)]" />

            <div className="flex flex-col gap-[4px]">
              <p className="uc-type-n5-strong text-[var(--uc-text)]">{secondaryLabel}</p>
              <div className="flex items-baseline">
                <span data-home-summary-secondary-amount className="uc-type-n2-strong leading-[1] text-[var(--uc-text)]">{displayedSpent.integer}</span>
                <span className="uc-type-n5-strong leading-[1] text-[var(--uc-text)]">{displayedSpent.decimals} {displayedSpent.currency}</span>
              </div>
            </div>
        </div>

        <div data-home-summary-art-container className="absolute right-0 top-[24px] w-[96px]">
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
    ? 'bg-[#94B1BA]'
    : tab === 'savings'
      ? 'bg-[#DBE0D1]'
      : tab === 'credits'
        ? 'bg-[#D9B4AE]'
        : 'bg-[#DED7EA]';
  const art = SUMMARY_ART[tab];

  return (
    <section
      data-home-transformation-summary={tab}
      className={`relative isolate h-[145.25px] min-h-[145.25px] overflow-hidden rounded-[8px] ${tone} px-[24px] py-[15px] text-[var(--uc-text)]`}
    >
      <div className="relative z-10 max-w-[calc(100%-112px)] sm:max-w-[66%]">
        <p className="text-[14px] font-bold leading-[18px]">{headline}</p>
        <div className="mt-[2px] flex items-baseline whitespace-nowrap">{featured}</div>
        <div
          data-home-summary-divider
          className="my-[9px] h-px w-full bg-[color-mix(in_srgb,var(--uc-text)_35%,transparent)]"
        />
        <p className="text-[14px] font-bold leading-[18px]">{secondaryLabel}</p>
        <p data-home-summary-secondary-amount className="mt-[1px] text-[18px] font-bold leading-[22px]">{typeof secondaryValue === 'string' ? secondaryValue : formatMoney(secondaryValue, amountsHidden)}</p>
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

const EVO_2027_DEPOSIT_PRESENTATIONS: Record<string, DepositPresentation> = {
  'term-1': {
    annualRate: 0.065,
    periodLabel: '1 Year',
    termDays: 365,
    daysToMaturity: 290,
    startDate: '30/05/2026',
    maturityDate: '30/05/2027',
  },
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

const DEFAULT_DEPOSIT_PRESENTATION: DepositPresentation = EVO_2027_DEPOSIT_PRESENTATIONS['term-1'];

function depositPresentation(product: Product): DepositPresentation {
  return EVO_2027_DEPOSIT_PRESENTATIONS[product.id] ?? DEFAULT_DEPOSIT_PRESENTATION;
}

function DepositList({ deposits, amountsHidden, formatProductAmount, onProductClick, collapsed = false }: { deposits: Product[]; amountsHidden: boolean; formatProductAmount: (product: Product) => FormattedAmount; onProductClick: (product: Product) => void; collapsed?: boolean }) {
  const displayedDeposits = collapsed ? deposits.slice(0, 1) : deposits;

  return <>
    <div data-home-deposit-list className={['overflow-hidden rounded-[8px] bg-[var(--uc-surface)]', collapsed ? 'relative z-10 shadow-[0_6px_12px_rgb(var(--uc-shadow-rgb)/0.08)]' : 'shadow-[0_10px_24px_rgb(var(--uc-shadow-rgb)/0.05)]'].join(' ')}>
      {displayedDeposits.map((product, index) => {
        const current = formatProductAmount(product);
        const presentation = depositPresentation(product);
        const maturity = formatAmount(product.balance * (1 + presentation.annualRate * presentation.termDays / 365), product.currency);
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
    <div data-home-insurance-policy-list className={['overflow-hidden rounded-[8px] bg-[var(--uc-surface)]', collapsed ? 'relative z-10 shadow-[0_6px_12px_rgb(var(--uc-shadow-rgb)/0.08)]' : 'shadow-[0_10px_24px_rgb(var(--uc-shadow-rgb)/0.05)]'].join(' ')}>
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
    <div data-home-loan-list className={['overflow-hidden rounded-[8px] bg-[var(--uc-surface)]', collapsed ? 'relative z-10 shadow-[0_6px_12px_rgb(var(--uc-shadow-rgb)/0.08)]' : 'shadow-[0_10px_24px_rgb(var(--uc-shadow-rgb)/0.05)]'].join(' ')}>
      {displayedLoans.map((product, index) => {
        const total = Math.abs(product.balance) * 1.45;
        const repaid = total - Math.abs(product.balance);
        const remaining = formatAmount(Math.abs(product.balance), product.currency);
        const installment = formatAmount(Math.round(Math.abs(product.balance) * 0.009), product.currency);
        const totalAmount = formatAmount(total, product.currency);
        const repaidAmount = formatAmount(repaid, product.currency);
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

function CompactProductCard({ product, amount, amountsHidden, subtitle, onClick, stackRole = 'single' }: { product: Product; amount: FormattedAmount; amountsHidden: boolean; subtitle?: string; onClick?: () => void; stackRole?: 'single' | 'first' | 'middle' | 'last' }) {
  const display = maskAmountParts(amount, amountsHidden);
  const radiusClass = stackRole === 'first' ? 'rounded-t-[8px]' : stackRole === 'last' ? 'rounded-b-[8px]' : stackRole === 'middle' ? 'rounded-none' : 'rounded-[8px]';
  const hasSeparator = stackRole === 'middle' || stackRole === 'last';

  return (
    <button type="button" data-home-compact-product-card={product.type} onClick={onClick} className={`relative flex min-h-[112px] w-full items-start bg-[var(--uc-surface)] px-[16px] py-[16px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] ${radiusClass} ${hasSeparator ? 'border-t-[0.5px] border-[var(--uc-border-muted)]' : ''}`}>
      <span className="min-w-0 flex-1 pr-[52px]">
        <span className="block truncate text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">{product.name}{subtitle ? <><span aria-hidden="true"> · </span>{subtitle}</> : null}</span>
        <span className="mt-[3px] block truncate text-[14px] leading-[18px] text-[var(--uc-text-muted)]">{product.accountNumber}</span>
        <span className="mt-[13px] block text-[var(--uc-text)]"><span className="text-[24px] font-bold leading-[26px]">{display.integer}</span><span className="text-[14px]">{display.decimals} {display.currency}</span></span>
      </span>
      <span className="absolute right-[16px] top-[16px]"><CurrencyBadge currency={product.currency} /></span>
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
    }} {...dragHandlers} className={`mt-[12px] flex gap-[12px] overflow-x-auto overscroll-x-contain pb-[4px] scrollbar-hide select-none touch-pan-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`} style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
      {draggableChildren}
    </div>
    {count > 1 ? <div className="mt-[4px] flex justify-center" aria-label={`${ariaLabel} pages`}>
      <AccountCarouselIndicator count={count} activeIndex={activeIndex} onSelect={scrollToIndex} />
    </div> : null}
  </>;
}

function InterestCarousel({ tab, onProductsClick }: { tab: TransformationTab; onProductsClick?: () => void }) {
  const cards = INTEREST_CAMPAIGNS[tab];
  return (
    <section data-home-interest-carousel aria-labelledby="interest-heading">
      <h2 id="interest-heading" className="text-[22px] font-bold leading-[28px] tracking-[-0.02em]">For your interest</h2>
      <HorizontalCarousel ariaLabel="For your interest" count={cards.length}>
        {cards.map((card, index) => (
          <button key={index} type="button" onClick={onProductsClick} className="w-[calc(100%-48px)] shrink-0 snap-start overflow-hidden rounded-[8px] bg-[var(--uc-surface)] text-left shadow-[0_1px_1px_rgb(var(--uc-shadow-rgb)/0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]">
            <div className="h-[100px] overflow-hidden bg-[var(--uc-surface-muted)]">
              <img src={card.image} alt="" aria-hidden="true" data-home-interest-media className="size-full object-cover" style={{ objectPosition: card.imagePosition }} />
            </div>
            <div className="px-[16px] py-[12px]">
              <h3 className="text-[18px] font-bold leading-[23px]">{card.title}</h3>
              <p className="mt-[7px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">{card.body}</p>
              <p className="mt-[8px] text-[13px] leading-[17px] text-[var(--uc-text-muted)]">{card.caption}</p>
            </div>
          </button>
        ))}
      </HorizontalCarousel>
    </section>
  );
}

function ShopSmart({ onProductsClick }: { onProductsClick?: () => void }) {
  const [activeFilter, setActiveFilter] = useState<ShopSmartCategory>('popular');
  const offers = SHOPSMART_HOME_OFFERS;
  if (!offers.length) return null;
  const visibleOffers = activeFilter === 'popular'
    ? offers
    : offers.filter((offer) => offer.category === activeFilter);
  const filters: ReadonlyArray<{ id: typeof activeFilter; label: string }> = [
    { id: 'popular', label: 'Most popular' },
    { id: 'eshops', label: 'E-shops' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'travel', label: 'Travel' },
    { id: 'home', label: 'Home & living' },
  ];
  const categoriesRef = useRef<HTMLDivElement>(null);
  const { dragHandlers: categoryDragHandlers, isDragging: isCategoryDragging } = useDragCarousel({
    carouselRef: categoriesRef,
    enabled: filters.length > 1,
  });

  return (
    <section data-home-shopsmart data-home-shopsmart-filter={activeFilter}>
      <h2 className="text-[22px] font-bold leading-[28px] tracking-[-0.02em]">Shopsmart</h2>
      <div
        ref={categoriesRef}
        {...categoryDragHandlers}
        className={`mt-[12px] flex flex-nowrap gap-[8px] overflow-x-auto overscroll-x-contain scrollbar-hide select-none touch-pan-y ${isCategoryDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        aria-label="ShopSmart categories"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
      >
        {filters.map((filter) => {
          const active = filter.id === activeFilter;
          return <button key={filter.id} type="button" aria-pressed={active} onClick={() => setActiveFilter(filter.id)} className={`flex h-[46px] shrink-0 items-center justify-center rounded-full border px-[12px] text-[18px] leading-[20px] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] ${active ? 'flex-col gap-[2px] border-transparent bg-[var(--uc-action)] py-[8px] font-medium text-[var(--uc-static-white)]' : 'border-transparent bg-[var(--uc-surface)] font-normal text-[var(--uc-text-muted)]'}`}>
            <span>{filter.label}</span>
            {active ? <span aria-hidden="true" data-home-shopsmart-filter-dot className="size-[4px] rounded-full bg-[var(--uc-static-white)]" /> : null}
          </button>;
        })}
      </div>
      <HorizontalCarousel key={activeFilter} ariaLabel="ShopSmart offers" count={visibleOffers.length}>
        {visibleOffers.map((offer) => {
          return <button key={offer.id} type="button" onClick={onProductsClick} className="w-[min(327px,calc(100vw-64px))] shrink-0 snap-start overflow-hidden rounded-[8px] bg-[var(--uc-surface)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"><div className="h-[128px] overflow-hidden bg-[var(--uc-surface-muted)]"><img src={offer.image} alt="" aria-hidden="true" data-home-shopsmart-media className="size-full object-cover object-center" /></div><div className="p-[16px]"><p className="text-[14px] font-bold text-[var(--uc-action)]">{offer.merchant}</p><p className="mt-[5px] text-[20px] font-bold">{offer.title}</p><p className="mt-[8px] text-[14px] text-[var(--uc-text-muted)]">{offer.description}</p></div></button>;
        })}
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
  const investments = categoryProducts(categories, 'investments');
  const loans = categoryProducts(categories, 'mortgages_loans');
  const creditCategories = categories.map((category) => category.key === 'cards'
    ? { ...category, products: category.products.filter((product) => product.type === 'credit_card') }
    : category,
  ).filter((category) => category.key !== 'cards' || category.products.length > 0);
  const debitCardCategories = categories.map((category) => category.key === 'cards'
    ? { ...category, products: category.products.filter((product) => product.type === 'debit_card') }
    : category,
  ).filter((category) => category.key !== 'cards' || category.products.length > 0);
  const totalSavings = useMemo(() => calculateTotal([...savings, ...deposits, ...investments]), [calculateTotal, deposits, investments, savings]);
  const savingsGrowth = useMemo(() => ({ ...totalSavings, integer: String(Math.max(0, Math.round(Number(totalSavings.integer.replace(/\s/g, '')) * 0.032)).toLocaleString('cs-CZ')), decimals: '.00' }), [totalSavings]);
  const debt = calculateTotalOwed();
  const dueThisMonth = useMemo(() => ({ ...debt, integer: String(Math.max(0, Math.round(Number(debt.integer.replace(/\s/g, '')) * 0.009)).toLocaleString('cs-CZ')), decimals: '.00' }), [debt]);

  return (
    <div data-home-transformation data-home-area="transformation" className="flex min-w-0 flex-col gap-[28px]">
      <section data-home-area="product-categories" className="min-w-0">
        <div role="tablist" aria-label="Product categories" className="flex gap-[5px] overflow-x-auto overscroll-x-contain scrollbar-hide">
          {(Object.keys(TAB_LABELS) as TransformationTab[]).map((tab) => {
            const active = activeTab === tab;
            return <button key={tab} type="button" role="tab" aria-selected={active} onClick={() => setActiveTab(tab)} className={`flex h-[46px] shrink-0 items-center justify-center rounded-full border px-[12px] text-[18px] leading-[20px] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] ${active ? 'flex-col gap-[2px] border-transparent bg-[var(--uc-action)] py-[8px] font-medium text-[var(--uc-static-white)]' : 'border-transparent bg-[var(--uc-surface)] font-normal text-[var(--uc-text-muted)]'}`}><span>{TAB_LABELS[tab]}</span>{active ? <span aria-hidden="true" className="size-[4px] rounded-full bg-[var(--uc-static-white)]" /> : null}</button>;
          })}
        </div>
      </section>

      {activeTab === 'accounts' ? <>
        <SummaryBanner tab="accounts" amount={calculateTotalAvailable()} amountsHidden={amountsHidden} secondaryLabel="Spent this week" secondaryValue={{ ...calculateTotalAvailable(), integer: String(Math.max(0, Math.round(Number(calculateTotalAvailable().integer.replace(/\s/g, '')) * 0.005)).toLocaleString('cs-CZ')), decimals: '.00' }} />
        {!accounts.length ? <Group title="Accounts"><EmptyProducts title="Open your everyday account" description="Choose an account for payments, salary and everyday banking." onClick={onProductsClick} /></Group> : null}
        {!debitCards.length ? <Group title="Cards"><EmptyProducts title="Choose a card for everyday use" description="Explore cards with benefits that fit your spending." onClick={onProductsClick} /></Group> : null}
        <App2027ProductAccordions categories={debitCardCategories} amountsHidden={amountsHidden} formatProductAmount={formatProductAmount} calculateGroupTotal={calculateTotal} getProductDisplayNumber={getProductDisplayNumber} onProductClick={onProductClick} useCzRoboAccountCards onDomesticPaymentClick={onDomesticPaymentClick} onPaymentsClick={onPaymentsClick} onAccountInfoClick={onAccountInfoClick} onCardDetailsClick={onCardDetailsClick} onCardOptionsClick={onCardOptionsClick} visibleKeys={['accounts', 'cards']} initialOpenKeys={{ accounts: true, cards: true }} />
        {accounts.length ? <App2027Activity country={country} currency={calculateTotal(accounts).currency} amountsHidden={amountsHidden} compact homeArea={false} onTransactionOpen={onTransactionOpen} onSeeMore={onSeeAllTransactions ?? (() => { const firstAccount = accounts[0]; if (firstAccount) onProductClick(firstAccount); })} /> : null}
        <InterestCarousel tab="accounts" onProductsClick={onProductsClick} />
        <ShopSmart onProductsClick={onProductsClick} />
      </> : null}

      {activeTab === 'savings' ? <>
        <SummaryBanner tab="savings" amount={totalSavings} amountsHidden={amountsHidden} secondaryLabel="Growth this year" secondaryValue={savingsGrowth} />
        <Group title="Investment portfolios" expandable={investments.length > 1}>{investments.length ? investments.map((product) => <CompactProductCard key={product.id} product={product} amount={formatProductAmount(product)} amountsHidden={amountsHidden} onClick={() => onProductClick(product)} />) : <EmptyProducts title="Start investing" description="Explore portfolios built around your goals." onClick={onProductsClick} />}</Group>
        <Group title="Saving Accounts" expandable={savings.length > 1}>{savings.length ? <div data-home-compact-product-list="saving_account" className="overflow-hidden rounded-[8px] shadow-[0_1px_1px_rgb(var(--uc-shadow-rgb)/0.04)]">{savings.map((product, index) => <CompactProductCard key={product.id} product={product} amount={formatProductAmount(product)} amountsHidden={amountsHidden} subtitle="2.5% p.a." onClick={() => onProductClick(product)} stackRole={savings.length === 1 ? 'single' : index === 0 ? 'first' : index === savings.length - 1 ? 'last' : 'middle'} />)}</div> : <EmptyProducts title="Start saving for what matters" description="Open a saving account and set money aside automatically." onClick={onProductsClick} />}</Group>
        <Group title="Deposits" defaultOpen={deposits.length <= 1} expandable={deposits.length > 1} preview={deposits.length > 1 ? <DepositList deposits={deposits} amountsHidden={amountsHidden} formatProductAmount={formatProductAmount} onProductClick={onProductClick} collapsed /> : undefined}>
          {deposits.length ? <DepositList deposits={deposits} amountsHidden={amountsHidden} formatProductAmount={formatProductAmount} onProductClick={onProductClick} /> : <EmptyProducts title="Explore term deposits" description="Put your money to work with a fixed return." onClick={onProductsClick} />}
        </Group>
        <InterestCarousel tab="savings" onProductsClick={onProductsClick} />
      </> : null}

      {activeTab === 'credits' ? <>
        <SummaryBanner tab="credits" amount={debt} amountsHidden={amountsHidden} secondaryLabel="Due this month" secondaryValue={dueThisMonth} />
        {cards.filter((product) => product.type === 'credit_card').length ? <App2027ProductAccordions categories={creditCategories} amountsHidden={amountsHidden} formatProductAmount={formatProductAmount} calculateGroupTotal={calculateTotal} getProductDisplayNumber={getProductDisplayNumber} onProductClick={onProductClick} onCardDetailsClick={onCardDetailsClick} onCardOptionsClick={onCardOptionsClick} useCzRoboAccountCards visibleKeys={['cards']} initialOpenKeys={{ cards: true }} titleOverrides={{ cards: 'Credit Cards' }} /> : <Group title="Credit Cards"><EmptyProducts title="Discover a credit card" description="Choose benefits that match your everyday spending." onClick={onProductsClick} /></Group>}
        <Group title="Loans & Mortgages" defaultOpen={loans.length <= 1} expandable={loans.length > 1} preview={loans.length > 1 ? <LoanList loans={loans} amountsHidden={amountsHidden} onProductClick={onProductClick} collapsed /> : undefined}>
          {loans.length ? <LoanList loans={loans} amountsHidden={amountsHidden} onProductClick={onProductClick} /> : <EmptyProducts title="Find financing that fits" description="Explore loans and mortgages for your next plan." onClick={onProductsClick} />}
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
