import { useCallback, useMemo, useRef, useState, type ReactNode, type UIEvent } from 'react';
import { AppIcon } from '@/app/components/icons';
import GhostBanner from '@/app/components/cards/GhostBanner';
import { getProductsMenuForCountry } from '@/app/config/productsMenuConfig';
import { maskAmountParts } from '@/app/utils/amountPrivacy';
import { formatAmount, type Product, type ProductCategory } from '@/data/products';
import type { CountryId } from '@/app/state/demoTypes';
import { useDragCarousel } from '@/hooks/useDragCarousel';
import savingsCactus from '@/assets/app2027/home-summary-savings-cactus.png';
import loansHouse from '@/assets/app2027/home-summary-loans-house.png';
import insuranceUmbrella from '@/assets/app2027/home-summary-insurance-umbrella.png';
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
  insurance: 'Insurance',
};

const INTEREST_CONTENT: Record<TransformationTab, { title: string; body: string; caption: string }> = {
  accounts: {
    title: 'Build your savings without thinking about it',
    body: 'Round up everyday payments and save the difference.',
    caption: 'Set your rule and adjust it at any time.',
  },
  savings: {
    title: 'Build your safety net',
    body: 'Set money aside automatically, at your own pace.',
    caption: 'Start with an amount that feels right.',
  },
  credits: {
    title: 'Planning something bigger?',
    body: 'Explore financing options for the things that matter.',
    caption: 'Subject to credit approval.',
  },
  insurance: {
    title: 'Protect the place you call home and stay safe',
    body: 'Explore cover for your home and belongings.',
    caption: 'Find the protection that fits your needs.',
  },
};

function formatMoney(amount: FormattedAmount, hidden: boolean) {
  const display = maskAmountParts(amount, hidden);
  return <><span className="text-[24px] font-bold leading-[27px] tracking-[-0.025em]">{display.integer}</span><span className="text-[16px] font-medium leading-[20px]">{display.decimals} {display.currency}</span></>;
}

function categoryProducts(categories: ProductCategory[], key: ProductCategory['key']) {
  return categories.find((category) => category.key === key)?.products ?? [];
}

const SUMMARY_ART: Partial<Record<TransformationTab, { src: string; className: string }>> = {
  savings: { src: savingsCactus, className: 'bottom-[-48px] right-[-44px] h-[220px] w-[184px]' },
  credits: { src: loansHouse, className: 'bottom-[-10px] right-[-12px] h-[170px] w-[174px]' },
  insurance: { src: insuranceUmbrella, className: 'bottom-[-24px] right-[-38px] h-[186px] w-[210px]' },
};

function SummaryBanner({ tab, amount, amountsHidden, secondaryLabel, secondaryValue, policyCount = 2 }: { tab: TransformationTab; amount?: FormattedAmount; amountsHidden: boolean; secondaryLabel: string; secondaryValue: FormattedAmount | string; policyCount?: number }) {
  const headline = tab === 'insurance' ? "You're covered" : tab === 'credits' ? 'Total owed' : tab === 'savings' ? 'Total savings' : 'Total Available';
  const featured = tab === 'insurance' ? `${policyCount} active ${policyCount === 1 ? 'policy' : 'policies'}` : amount ? formatMoney(amount, amountsHidden) : null;
  const tone = tab === 'accounts'
    ? 'bg-[color-mix(in_srgb,var(--uc-action)_18%,var(--uc-surface))]'
    : tab === 'savings'
      ? 'bg-[color-mix(in_srgb,var(--uc-brand)_12%,var(--uc-surface))]'
      : tab === 'credits'
        ? 'bg-[color-mix(in_srgb,var(--uc-danger,#b31b34)_14%,var(--uc-surface))]'
        : 'bg-[color-mix(in_srgb,var(--uc-brand)_10%,var(--uc-surface))]';
  const art = SUMMARY_ART[tab];

  return (
    <section data-home-transformation-summary={tab} className={`relative isolate min-h-[157px] overflow-hidden rounded-[8px] ${tone} px-[24px] py-[22px] text-[var(--uc-text)]`}>
      <div className="relative z-10 max-w-[calc(100%-112px)] sm:max-w-[66%]">
        <p className="text-[14px] font-bold leading-[18px]">{headline}</p>
        <div className="mt-[2px] flex items-baseline whitespace-nowrap">{featured}</div>
        <div className="my-[9px] h-px w-full bg-[color-mix(in_srgb,var(--uc-text)_35%,transparent)]" />
        <p className="text-[14px] font-bold leading-[18px]">{secondaryLabel}</p>
        <p className="mt-[1px] text-[18px] font-bold leading-[22px]">{typeof secondaryValue === 'string' ? secondaryValue : formatMoney(secondaryValue, amountsHidden)}</p>
      </div>
      {art ? <img src={art.src} alt="" aria-hidden="true" data-home-summary-art={tab} className={`pointer-events-none absolute z-0 object-contain object-right-bottom drop-shadow-[0_8px_10px_rgb(var(--uc-shadow-rgb)/0.14)] ${art.className}`} /> : null}
    </section>
  );
}

function Group({ title, children, defaultOpen = true, preview }: { title: string; children: ReactNode; defaultOpen?: boolean; preview?: ReactNode }) {
  const [isOpen, setOpen] = useState(defaultOpen);
  const id = `transformation-group-${title.toLowerCase().replace(/[^a-z]+/g, '-')}`;

  return (
    <section data-home-transformation-group={id}>
      <button type="button" aria-expanded={isOpen} aria-controls={id} onClick={() => setOpen((value) => !value)} className="flex min-h-[32px] w-full items-center justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]">
        <h2 className="text-[22px] font-bold leading-[28px] tracking-[-0.02em] text-[var(--uc-text)]">{title}</h2>
        <AppIcon name="chevron-down" size={24} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {isOpen ? <div id={id} className="mt-[12px]">{children}</div> : preview ? <div className="mt-[12px]">{preview}</div> : null}
    </section>
  );
}

function CompactProductCard({ product, amount, amountsHidden, subtitle, onClick }: { product: Product; amount: FormattedAmount; amountsHidden: boolean; subtitle?: string; onClick?: () => void }) {
  const display = maskAmountParts(amount, amountsHidden);
  return (
    <button type="button" onClick={onClick} className="flex min-h-[112px] w-full items-start gap-[12px] rounded-[8px] bg-[var(--uc-surface)] px-[16px] py-[16px] text-left shadow-[0_1px_1px_rgb(var(--uc-shadow-rgb)/0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]">
      <CurrencyBadge currency={product.currency} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">{product.name}{subtitle ? ` · ${subtitle}` : ''}</span>
        <span className="mt-[3px] block truncate text-[14px] leading-[18px] text-[var(--uc-text-muted)]">{product.accountNumber}</span>
        <span className="mt-[13px] block text-[var(--uc-text)]"><span className="text-[24px] font-bold leading-[26px]">{display.integer}</span><span className="text-[14px]">{display.decimals} {display.currency}</span></span>
      </span>
    </button>
  );
}

function EmptyProducts({ title, description, onClick }: { title: string; description: string; onClick?: () => void }) {
  return <GhostBanner className="w-full max-w-none" title={title} description={description} onClick={onClick} ariaLabel={title} />;
}

function HorizontalCarousel({ ariaLabel, count, children }: { ariaLabel: string; count: number; children: ReactNode }) {
  const railRef = useRef<HTMLDivElement>(null);
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
  const { dragHandlers, isDragging } = useDragCarousel({ carouselRef: railRef, enabled: count > 1, onSettle: settle });
  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    const rail = event.currentTarget;
    const item = rail.firstElementChild as HTMLElement | null;
    if (!item) return;
    const gap = Number.parseFloat(getComputedStyle(rail).gap || '0');
    setActiveIndex(Math.max(0, Math.min(count - 1, Math.round(rail.scrollLeft / (item.offsetWidth + gap)))));
  };

  return <>
    <div ref={railRef} data-home-carousel-rail role="region" aria-label={ariaLabel} tabIndex={0} onScroll={onScroll} onKeyDown={(event) => {
      if (event.key === 'ArrowRight') { event.preventDefault(); scrollToIndex(activeIndex + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); scrollToIndex(activeIndex - 1); }
    }} {...dragHandlers} className={`mt-[12px] flex snap-x snap-mandatory gap-[12px] overflow-x-auto overscroll-x-contain pb-[4px] scrollbar-hide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}>
      {children}
    </div>
    {count > 1 ? <div className="mt-[10px] flex justify-center gap-[6px]" aria-label={`${ariaLabel} pages`}>
      {Array.from({ length: count }, (_, index) => <button key={index} type="button" aria-label={`Show item ${index + 1} of ${count}`} aria-current={activeIndex === index ? 'true' : undefined} onClick={() => scrollToIndex(index)} className={activeIndex === index ? 'h-[6px] w-[30px] rounded-full bg-[var(--uc-action)] transition-all' : 'size-[6px] rounded-full bg-[var(--uc-border-strong)] transition-all'} />)}
    </div> : null}
  </>;
}

function InterestCarousel({ tab, onProductsClick }: { tab: TransformationTab; onProductsClick?: () => void }) {
  const content = INTEREST_CONTENT[tab];
  const cards = [content, { ...content, title: tab === 'insurance' ? 'Cover for what matters' : 'Make your next move easier' }, { ...content, title: tab === 'savings' ? 'Put every crown to work' : 'Discover what is next for you' }];
  return (
    <section data-home-interest-carousel aria-labelledby="interest-heading">
      <h2 id="interest-heading" className="text-[22px] font-bold leading-[28px] tracking-[-0.02em]">For your interest</h2>
      <HorizontalCarousel ariaLabel="For your interest" count={cards.length}>
        {cards.map((card, index) => (
          <button key={index} type="button" onClick={onProductsClick} className="w-[min(327px,calc(100vw-64px))] shrink-0 snap-start overflow-hidden rounded-[8px] bg-[var(--uc-surface)] text-left shadow-[0_1px_1px_rgb(var(--uc-shadow-rgb)/0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]">
            <div className={`h-[100px] ${index === 0 ? 'bg-[linear-gradient(135deg,#2e554f,#b8c9a4)]' : index === 1 ? 'bg-[linear-gradient(135deg,#d9d6ce,#a3b29f)]' : 'bg-[linear-gradient(135deg,#9ab1bd,#476a78)]'}`} />
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

function ShopSmart({ country, onProductsClick }: { country: CountryId; onProductsClick?: () => void }) {
  const offers = getProductsMenuForCountry(country).shopSmartOffers.slice(0, 2);
  if (!offers.length) return null;
  return (
    <section data-home-shopsmart>
      <h2 className="text-[22px] font-bold leading-[28px] tracking-[-0.02em]">Shopsmart</h2>
      <div className="mt-[12px] flex gap-[8px] overflow-x-auto scrollbar-hide"><span className="rounded-full bg-[var(--uc-action)] px-[13px] py-[10px] text-[14px] font-medium text-[var(--uc-static-white)]">Most popular</span><span className="rounded-full bg-[var(--uc-surface)] px-[13px] py-[10px] text-[14px] text-[var(--uc-text-muted)]">E-shops</span><span className="rounded-full bg-[var(--uc-surface)] px-[13px] py-[10px] text-[14px] text-[var(--uc-text-muted)]">Electronics</span></div>
      <HorizontalCarousel ariaLabel="ShopSmart offers" count={offers.length}>
        {offers.map((offer, index) => <button key={offer.id} type="button" onClick={onProductsClick} className="w-[min(327px,calc(100vw-64px))] shrink-0 overflow-hidden rounded-[8px] bg-[var(--uc-surface)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"><div className={`h-[128px] ${index ? 'bg-[linear-gradient(135deg,#789bb9,#283f62)]' : 'bg-[linear-gradient(135deg,#6f4f35,#d7ad70)]'}`} /><div className="p-[16px]"><p className="text-[14px] font-bold text-[var(--uc-action)]">Alza.cz</p><p className="mt-[5px] text-[20px] font-bold">{offer.title.replace(/\n/g, ' ')}</p><p className="mt-[8px] text-[14px] text-[var(--uc-text-muted)]">Activated offer</p></div></button>)}
      </HorizontalCarousel>
    </section>
  );
}

export default function App2027TransformationHome({ categories, country, amountsHidden, calculateTotal, calculateTotalAvailable, calculateTotalOwed, formatProductAmount, getProductDisplayNumber, onProductClick, onAccountInfoClick, onDomesticPaymentClick, onPaymentsClick, onCardDetailsClick, onCardOptionsClick, onProductsClick, onTransactionOpen }: App2027TransformationHomeProps) {
  const [activeTab, setActiveTab] = useState<TransformationTab>('accounts');
  const accounts = categoryProducts(categories, 'accounts');
  const cards = categoryProducts(categories, 'cards');
  const savings = categoryProducts(categories, 'savings_deposits').filter((product) => product.type === 'saving_account');
  const deposits = categoryProducts(categories, 'savings_deposits').filter((product) => product.type === 'term_deposit');
  const investments = categoryProducts(categories, 'investments');
  const loans = categoryProducts(categories, 'mortgages_loans');
  const creditCategories = categories.map((category) => category.key === 'cards'
    ? { ...category, products: category.products.filter((product) => product.type === 'credit_card') }
    : category,
  ).filter((category) => category.key !== 'cards' || category.products.length > 0);
  const totalSavings = useMemo(() => calculateTotal([...savings, ...deposits, ...investments]), [calculateTotal, deposits, investments, savings]);
  const savingsGrowth = useMemo(() => ({ ...totalSavings, integer: String(Math.max(0, Math.round(Number(totalSavings.integer.replace(/\s/g, '')) * 0.032)).toLocaleString('cs-CZ')), decimals: '.00' }), [totalSavings]);
  const debt = calculateTotalOwed();
  const dueThisMonth = useMemo(() => ({ ...debt, integer: String(Math.max(0, Math.round(Number(debt.integer.replace(/\s/g, '')) * 0.009)).toLocaleString('cs-CZ')), decimals: '.00' }), [debt]);

  return (
    <div data-home-transformation className="space-y-[28px]">
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
        {!cards.length ? <Group title="Cards"><EmptyProducts title="Choose a card for everyday use" description="Explore cards with benefits that fit your spending." onClick={onProductsClick} /></Group> : null}
        <App2027ProductAccordions categories={categories} amountsHidden={amountsHidden} formatProductAmount={formatProductAmount} calculateGroupTotal={calculateTotal} getProductDisplayNumber={getProductDisplayNumber} onProductClick={onProductClick} useCzRoboAccountCards onDomesticPaymentClick={onDomesticPaymentClick} onPaymentsClick={onPaymentsClick} onAccountInfoClick={onAccountInfoClick} onCardDetailsClick={onCardDetailsClick} onCardOptionsClick={onCardOptionsClick} visibleKeys={['accounts', 'cards']} initialOpenKeys={{ accounts: true, cards: true }} />
        {accounts.length ? <App2027Activity country={country} currency={calculateTotal(accounts).currency} amountsHidden={amountsHidden} compact onTransactionOpen={onTransactionOpen} onSeeMore={() => { const firstAccount = accounts[0]; if (firstAccount) onProductClick(firstAccount); }} /> : null}
        <InterestCarousel tab="accounts" onProductsClick={onProductsClick} />
        <ShopSmart country={country} onProductsClick={onProductsClick} />
      </> : null}

      {activeTab === 'savings' ? <>
        <SummaryBanner tab="savings" amount={totalSavings} amountsHidden={amountsHidden} secondaryLabel="Growth this year" secondaryValue={savingsGrowth} />
        <Group title="Saving Accounts">{savings.length ? savings.map((product) => <CompactProductCard key={product.id} product={product} amount={formatProductAmount(product)} amountsHidden={amountsHidden} subtitle="2.5% p.a." onClick={() => onProductClick(product)} />) : <EmptyProducts title="Start saving for what matters" description="Open a saving account and set money aside automatically." onClick={onProductsClick} />}</Group>
        <Group title="Deposits">
          {deposits.length ? deposits.map((product) => {
            const current = formatProductAmount(product);
            const maturity = formatAmount(product.balance * 1.065, product.currency);
            return <div key={product.id} className="rounded-[8px] bg-[var(--uc-surface)] p-[16px]">
              <button type="button" onClick={() => onProductClick(product)} className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]">
                <p className="text-[16px] font-bold">{product.name} · 6.5% p.a.</p>
                <p className="mt-[3px] flex items-baseline gap-[3px] text-[14px] text-[var(--uc-text-muted)]">Maturity amount: {formatMoney(maturity, amountsHidden)}</p>
                <p className="mt-[12px] text-[var(--uc-text)]">{formatMoney(current, amountsHidden)}</p>
              </button>
              <div className="mt-[24px] flex justify-between text-[14px]"><span>Period: <b>1 Year</b></span><span>Days to maturity: <b>290</b></span></div>
              <div className="mt-[10px] h-[12px] overflow-hidden rounded-full bg-[var(--uc-surface-muted)]"><div className="h-full w-[30%] rounded-full bg-[var(--uc-action)]" /></div>
              <div className="mt-[10px] flex justify-between text-[13px] text-[var(--uc-text-muted)]"><span>Start date: 30/05/2026</span><span>Maturity: 30/05/2027</span></div>
            </div>;
          }) : <EmptyProducts title="Explore term deposits" description="Put your money to work with a fixed return." onClick={onProductsClick} />}
        </Group>
        <Group title="Investment portfolios">{investments.length ? investments.map((product) => <CompactProductCard key={product.id} product={product} amount={formatProductAmount(product)} amountsHidden={amountsHidden} onClick={() => onProductClick(product)} />) : <EmptyProducts title="Start investing" description="Explore portfolios built around your goals." onClick={onProductsClick} />}</Group>
        <InterestCarousel tab="savings" onProductsClick={onProductsClick} />
      </> : null}

      {activeTab === 'credits' ? <>
        <SummaryBanner tab="credits" amount={debt} amountsHidden={amountsHidden} secondaryLabel="Due this month" secondaryValue={dueThisMonth} />
        <Group title="Credit Cards">{cards.filter((product) => product.type === 'credit_card').length ? <App2027ProductAccordions categories={creditCategories} amountsHidden={amountsHidden} formatProductAmount={formatProductAmount} calculateGroupTotal={calculateTotal} getProductDisplayNumber={getProductDisplayNumber} onProductClick={onProductClick} onCardDetailsClick={onCardDetailsClick} onCardOptionsClick={onCardOptionsClick} useCzRoboAccountCards visibleKeys={['cards']} initialOpenKeys={{ cards: true }} /> : <EmptyProducts title="Discover a credit card" description="Choose benefits that match your everyday spending." onClick={onProductsClick} />}</Group>
        <Group title="Loans & Mortgages">
          {loans.length ? loans.map((product) => {
            const total = Math.abs(product.balance) * 1.45;
            const repaid = total - Math.abs(product.balance);
            const remaining = formatAmount(Math.abs(product.balance), product.currency);
            const installment = formatAmount(Math.round(Math.abs(product.balance) * 0.009), product.currency);
            const totalAmount = formatAmount(total, product.currency);
            const repaidAmount = formatAmount(repaid, product.currency);
            return <div key={product.id} className="rounded-[8px] bg-[var(--uc-surface)] p-[16px]">
              <button type="button" onClick={() => onProductClick(product)} className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]">
                <p className="text-[16px] font-bold">{product.name}</p>
                <p className="mt-[4px] flex items-baseline gap-[3px] text-[14px] text-[var(--uc-text-muted)]">Next installment: {formatMoney(installment, amountsHidden)}</p>
                <p className="mt-[10px] text-[var(--uc-text)]">{formatMoney(remaining, amountsHidden)}</p>
              </button>
              <div className="mt-[24px] h-[12px] overflow-hidden rounded-full bg-[var(--uc-surface-muted)]"><div className="h-full w-[31%] rounded-full bg-[var(--uc-action)]" /></div>
              <div className="mt-[12px] flex justify-between text-[14px]"><span className="text-[var(--uc-text-muted)]">Total loan<br /><b className="flex items-baseline text-[var(--uc-text)]">{formatMoney(totalAmount, amountsHidden)}</b></span><span className="text-right text-[var(--uc-text-muted)]">Total repaid<br /><b className="flex items-baseline justify-end text-[var(--uc-text)]">{formatMoney(repaidAmount, amountsHidden)}</b></span></div>
            </div>;
          }) : <EmptyProducts title="Find financing that fits" description="Explore loans and mortgages for your next plan." onClick={onProductsClick} />}
        </Group>
        <InterestCarousel tab="credits" onProductsClick={onProductsClick} />
      </> : null}

      {activeTab === 'insurance' ? <>
        <SummaryBanner tab="insurance" amountsHidden={amountsHidden} secondaryLabel="Next renewal" secondaryValue="15 Nov 2026" />
        <Group title="Insurance" preview={<p className="rounded-[8px] bg-[var(--uc-surface)] p-[16px] text-[14px] text-[var(--uc-text-muted)]">2 active policies</p>}><div className="space-y-[8px]">{[{ title: 'Genius Protect', subtitle: 'Life insurance policy · 3431424', premium: 'Next premium: 70 CZK', payment: 'Last payment: 30/05/2027' }, { title: 'Home Protect', subtitle: 'Home insurance policy · 3431425', premium: 'Next premium: 120 CZK', payment: 'Renewal: 15/11/2026' }].map((policy) => <button key={policy.title} type="button" onClick={onProductsClick} className="w-full rounded-[8px] bg-[var(--uc-surface)] p-[16px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"><div className="flex items-start justify-between gap-[12px]"><span><span className="block text-[16px] font-bold">{policy.title}</span><span className="mt-[4px] block text-[14px] text-[var(--uc-text-muted)]">{policy.subtitle}</span></span><span className="grid h-[40px] w-[72px] place-items-center bg-[#00549f] text-[14px] font-bold text-white">Allianz</span></div><div className="mt-[24px] h-[12px] overflow-hidden rounded-full bg-[var(--uc-surface-muted)]"><div className="h-full w-[30%] rounded-full bg-[var(--uc-action)]" /></div><div className="mt-[12px] flex justify-between gap-[12px] text-[13px] text-[var(--uc-text-muted)]"><span>{policy.premium}</span><span>{policy.payment}</span></div></button>)}</div></Group>
        <InterestCarousel tab="insurance" onProductsClick={onProductsClick} />
      </> : null}
    </div>
  );
}
