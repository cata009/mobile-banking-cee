import { useState } from 'react';
import type { Product, ProductCategory } from '@/data/products';
import { AppIcon } from '@/app/components/icons';
import ProductCard from '@/app/components/ProductCard';
import NavigationCardArt from '@/app/components/cards/NavigationCardArt';
import type { CardVariant } from '@/app/components/cards/Card';
import { buildFutureCzAccountCardActions } from '@/app/components/productCardFixtures';
import { maskAmountParts } from '@/app/utils/amountPrivacy';

type FormattedAmount = {
  integer: string;
  decimals: string;
  currency: string;
};

export interface App2027ProductAccordionsProps {
  categories: ProductCategory[];
  amountsHidden: boolean;
  formatProductAmount: (product: Product) => FormattedAmount;
  calculateGroupTotal: (products: Product[]) => FormattedAmount;
  getProductDisplayNumber: (product: Product) => string;
  onProductClick: (product: Product) => void;
  useCzRoboAccountCards?: boolean;
  onDomesticPaymentClick?: () => void;
  onPaymentsClick?: () => void;
  onAccountInfoClick?: (product: Product) => void;
  onCardDetailsClick?: (product: Product) => void;
  onCardOptionsClick?: (product: Product) => void;
  visibleKeys?: SupportedCategoryKey[];
  initialOpenKeys?: Partial<Record<SupportedCategoryKey, boolean>>;
  className?: string;
}

type SupportedCategoryKey = 'accounts' | 'cards' | 'savings_deposits' | 'mortgages_loans';

const GROUP_ORDER: Array<{
  key: SupportedCategoryKey;
  title: string;
  icon: 'accounts' | 'cards' | 'savings' | 'loans';
}> = [
  { key: 'accounts', title: 'Accounts', icon: 'accounts' },
  { key: 'cards', title: 'Cards', icon: 'cards' },
  { key: 'savings_deposits', title: 'Savings', icon: 'savings' },
  { key: 'mortgages_loans', title: 'Loans', icon: 'loans' },
];

const GROUP_ICON_BACKGROUNDS = {
  accounts: '#005ca9',
  cards: '#5c5c5c',
  savings: '#008779',
  loans: '#e90057',
} as const;

type GroupIconName = keyof typeof GROUP_ICON_BACKGROUNDS;

function GroupIcon({ name }: { name: GroupIconName }) {
  return (
    <span
      aria-hidden="true"
      data-home-product-group-icon={name}
      className="grid size-[32px] shrink-0 place-items-center rounded-full"
      style={{ backgroundColor: GROUP_ICON_BACKGROUNDS[name] }}
    >
      <svg className="size-[16px]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        {name === 'accounts' ? (
          <path d="M15.3224 9.88993C15.3305 9.92597 15.3338 9.96296 15.3322 9.99991C15.3338 10.0368 15.3305 10.0738 15.3224 10.1099C15.3015 10.2896 15.2377 10.4613 15.1366 10.6099C15.0587 10.7599 14.9523 10.8925 14.8238 11C14.2469 11.57 13.2008 12 11.9102 12C10.6196 12 9.5734 11.57 8.99659 10.9999C8.86804 10.8924 8.76168 10.7598 8.68371 10.6099C8.5826 10.4613 8.5188 10.2896 8.49794 10.1098C8.48985 10.0738 8.48655 10.0368 8.48815 9.99982C8.48657 9.96293 8.48986 9.926 8.49794 9.89001C8.53917 9.932 8.58511 9.96886 8.6348 9.99982C8.77345 10.1138 8.92437 10.2112 9.08462 10.2901C9.24695 10.3907 9.41696 10.4776 9.59298 10.5501C10.33 10.8507 11.1167 11.0035 11.9102 11.0003C12.7036 11.0035 13.4903 10.8507 14.2274 10.5501C14.4034 10.4776 14.5734 10.3907 14.7358 10.2901C14.896 10.2112 15.0469 10.1138 15.1855 9.99982C15.2352 9.96884 15.2812 9.93195 15.3224 9.88993ZM11.9102 6.00001C13.9243 6.00001 15.3322 7.05 15.3323 7.9999C15.3339 8.03684 15.3306 8.07383 15.3225 8.10988C15.3016 8.28961 15.2378 8.46132 15.1367 8.60988C15.0588 8.75981 14.9524 8.89238 14.8238 8.99986C14.645 9.17577 14.4445 9.3271 14.2274 9.45005C14.0086 9.56815 13.7795 9.66523 13.5431 9.74002C13.0159 9.91511 12.4647 10.0029 11.9103 10C11.356 10.0029 10.8048 9.91511 10.2776 9.74002C10.0411 9.66525 9.81191 9.56817 9.59298 9.45005C9.37591 9.3271 9.17541 9.17576 8.99655 8.99986C8.86803 8.89241 8.76168 8.75989 8.68371 8.61C8.58262 8.46145 8.51882 8.28973 8.49794 8.11C8.48985 8.07396 8.48655 8.03697 8.48815 8.00002C8.48815 7.05 9.89607 6.00001 11.9102 6.00001ZM7.50064 9.88984C7.50873 9.92588 7.51203 9.96288 7.51043 9.99982C7.51043 10.95 6.10255 12 4.08844 12C2.07434 12 0.666416 10.95 0.666416 9.99982C0.664832 9.96293 0.668125 9.926 0.676206 9.89001C1.47795 10.57 2.70985 11 4.08844 11C5.467 10.9998 6.6989 10.5698 7.50064 9.88984ZM7.50068 7.88991C7.50878 7.92596 7.51207 7.96295 7.51047 7.9999C7.51207 8.03684 7.50878 8.07383 7.50068 8.10988C7.4798 8.28961 7.416 8.46132 7.31491 8.60988C7.23695 8.75986 7.13059 8.89247 7.00203 8.99998C6.42518 9.57 5.37905 9.99999 4.08844 9.99999C2.79784 9.99999 1.75167 9.57 1.17486 8.99986C1.04631 8.89238 0.939948 8.75981 0.861976 8.60988C0.7609 8.46136 0.697102 8.28969 0.676206 8.11C0.668092 8.07389 0.664798 8.03682 0.666416 7.99981C0.664832 7.96292 0.668125 7.92599 0.676206 7.89C0.717436 7.93199 0.763374 7.96885 0.813066 7.99981C0.951713 8.11378 1.10263 8.21118 1.26289 8.29012C1.42522 8.39065 1.59522 8.47761 1.77125 8.55013C2.50831 8.85066 3.29498 9.0035 4.08844 9.00032C4.88191 9.0035 5.66858 8.85066 6.40564 8.55013C6.58168 8.47761 6.7517 8.39066 6.91404 8.29012C7.07427 8.21117 7.22516 8.11377 7.36378 7.99981C7.41349 7.96883 7.45944 7.93194 7.50068 7.88991ZM4.08844 4C6.10255 4 7.51043 5.04999 7.51055 5.99988C7.51215 6.03683 7.50886 6.07382 7.50076 6.10986C7.47988 6.2896 7.41609 6.46131 7.31499 6.60987C7.23702 6.7598 7.13066 6.89237 7.00211 6.99985C6.82324 7.17576 6.62272 7.32709 6.40564 7.45004C6.18682 7.56814 5.95775 7.66522 5.72138 7.74001C5.19414 7.91509 4.64293 8.00287 4.08861 8.00002C3.53428 8.00287 2.98307 7.9151 2.45583 7.74001C2.21935 7.66524 1.99017 7.56816 1.77125 7.45004C1.55418 7.32709 1.35368 7.17575 1.17482 6.99985C1.04629 6.8924 0.939948 6.75988 0.861976 6.60999C0.760881 6.46144 0.697082 6.28972 0.676206 6.10999C0.66811 6.07395 0.664817 6.03695 0.666416 6.00001C0.666416 5.04999 2.07434 4 4.08844 4Z" fill="white" />
        ) : name === 'cards' ? (
          <path fillRule="evenodd" clipRule="evenodd" d="M13.1412 2.74685L13.2975 2.42133C13.331 2.33168 13.32 2.2926 13.2581 2.25857C12.9955 2.11282 12.643 2.00616 12.296 2.00616C11.9211 2.00616 11.6255 2.0903 11.3954 2.26961C11.1163 2.49398 10.9811 2.78041 10.9311 3.24616H10.5901C10.4393 3.24616 10.4393 3.29122 10.4393 3.45352V3.56065C10.4393 3.71743 10.4393 3.75697 10.5901 3.75697H10.9091V3.76249V4.09904H10.5901C10.4393 4.09904 10.4393 4.14364 10.4393 4.30685V4.40203C10.4393 4.55881 10.4393 4.59835 10.5901 4.59835H10.9375C10.9875 4.97444 11.0934 5.23238 11.2785 5.41215C11.5132 5.64801 11.8432 5.73766 12.3634 5.73766C12.6201 5.73766 12.9785 5.67008 13.2022 5.56939C13.2805 5.53537 13.2805 5.48479 13.2581 5.3841L13.1971 5.11467C13.1742 5.0195 13.1522 4.98594 13.0683 5.0195C12.8781 5.09766 12.6375 5.15375 12.4083 5.15375C12.1003 5.15375 11.9321 5.08111 11.8207 4.9464C11.7534 4.86778 11.703 4.75559 11.6755 4.59835H12.6485C12.7993 4.59835 12.7993 4.55881 12.7993 4.40203V4.30685C12.7993 4.14364 12.7993 4.09904 12.6485 4.09904H11.6255V3.75697H12.6485C12.7993 3.75697 12.7993 3.71743 12.7993 3.56065V3.45352C12.7993 3.29122 12.7993 3.24616 12.6485 3.24616H11.653C11.6814 3.01628 11.7314 2.85903 11.8372 2.75237C11.955 2.63467 12.0953 2.58961 12.2791 2.58961C12.5532 2.58961 12.8162 2.68524 12.9955 2.79145C13.0624 2.83099 13.1073 2.82501 13.1412 2.74685ZM8.91583 3.89858C8.91583 2.1211 10.3522 0.680176 12.1242 0.680176C13.8965 0.680176 15.3325 2.1211 15.3325 3.89858C15.3325 5.67606 13.8965 7.11698 12.1242 7.11698C10.3522 7.11698 8.91583 5.67606 8.91583 3.89858ZM13.9577 12.1744H11.666V10.7951H13.9577V12.1744ZM10.7493 12.1744H8.45768V10.7951H10.7493V12.1744ZM7.54102 12.1744H5.24935V10.7951H7.54102V12.1744ZM2.04102 8.2374C2.04102 8.53947 2.28439 8.78361 2.58506 8.78361H5.08389C5.38456 8.78361 5.62793 8.53947 5.62793 8.2374V6.74314C5.62793 6.44199 5.38456 6.19739 5.08389 6.19739H2.58506C2.28439 6.19739 2.04102 6.44199 2.04102 6.74314V8.2374ZM4.33268 12.1744H2.04102V10.7951H4.33268V12.1744ZM7.99935 3.89853C7.99935 6.18406 9.84597 8.03648 12.1243 8.03648C13.421 8.03648 14.5764 7.4351 15.3327 6.4967V12.6342C15.3327 13.3928 14.7139 14.0135 13.9577 14.0135H2.04102C1.28477 14.0135 0.666016 13.3928 0.666016 12.6342V5.27785C0.666016 4.51922 1.28477 3.89853 2.04102 3.89853H7.99935Z" fill="white" />
        ) : (
          <>
            <path fillRule="evenodd" clipRule="evenodd" d="M8.7327 5.23891C8.7327 3.36905 10.2103 1.85303 12.0327 1.85303C13.8553 1.85303 15.3327 3.36905 15.3327 5.23891C15.3327 7.10895 13.8553 8.62478 12.0327 8.62478C10.2103 8.62478 8.7327 7.10895 8.7327 5.23891ZM11.1307 5.44946H12.4458V2.92361C12.0333 2.92361 11.827 3.1877 11.827 3.51338V4.81463H10.5557C10.5557 5.23786 10.8131 5.44946 11.1307 5.44946Z" fill="white" />
            <path fillRule="evenodd" clipRule="evenodd" d="M7.63266 5.23912C7.63266 7.70725 9.56307 9.71282 11.9593 9.75299L11.9591 13.853H9.70045C9.70045 13.2148 9.1949 12.6974 8.57116 12.6974H4.05393C3.43018 12.6974 2.92463 13.2148 2.92463 13.853H0.666016V6.83801C0.666016 5.91454 1.39562 5.16597 2.29564 5.16597H7.63323C7.63287 5.1903 7.63266 5.21467 7.63266 5.23912ZM3.26615 10.5062H2.90267C2.47742 10.5062 2.13268 10.1693 2.13268 9.75378H3.26615C3.39952 9.52981 3.64506 9.37758 3.92934 9.37758C4.35459 9.37758 4.69934 9.71441 4.69934 10.13C4.69934 10.5455 4.35459 10.8824 3.92934 10.8824C3.64506 10.8824 3.39952 10.7301 3.26615 10.5062Z" fill="white" />
          </>
        )}
      </svg>
    </span>
  );
}

function Amount({ amount, hidden, size = 'row' }: { amount: FormattedAmount; hidden: boolean; size?: 'header' | 'row' }) {
  const displayAmount = hidden
    ? {
        ...amount,
        integer: '****',
        decimals: `${amount.decimals.startsWith(',') ? ',' : '.'}**`,
      }
    : amount;

  return (
    <span className="whitespace-nowrap tabular-nums text-[var(--uc-text)]">
      <span className={`${size === 'row' ? 'text-[24px] leading-[26px]' : 'text-[18px] leading-[24px]'} font-bold tracking-[-0.025em]`}>
        {displayAmount.integer}
      </span>
      <span className={`${size === 'row' ? 'text-[16px] leading-[18px]' : 'text-[14px] leading-[18px]'} ml-[1px] font-medium`}>
        {displayAmount.decimals} {displayAmount.currency}
      </span>
    </span>
  );
}

export function CurrencyBadge({ currency }: { currency: Product['currency'] }) {
  const clipId = `currency-roundel-${currency.toLowerCase()}`;
  return (
    <span
      aria-label={`${currency} currency`}
      role="img"
      className="relative grid size-[40px] shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--uc-surface-raised)] shadow-[0_3px_9px_rgb(0_0_0/0.12)]"
    >
      <svg aria-hidden="true" className="size-full" viewBox="0 0 40 40">
        <defs><clipPath id={clipId}><circle cx="20" cy="20" r="19" /></clipPath></defs>
        <g clipPath={`url(#${clipId})`}>
          {currency === 'CZK' ? <>
            <rect width="40" height="20" fill="#fff" />
            <rect y="20" width="40" height="20" fill="#d7141a" />
            <path d="M0 0 25 20 0 40Z" fill="#11457e" />
          </> : null}
          {currency === 'EUR' ? <>
            <rect width="40" height="40" fill="#003399" />
            {Array.from({ length: 12 }, (_, index) => {
              const angle = (index * Math.PI) / 6 - Math.PI / 2;
              const x = 20 + Math.cos(angle) * 11;
              const y = 20 + Math.sin(angle) * 11;
              return <circle key={index} cx={x} cy={y} r="1.35" fill="#ffcc00" />;
            })}
          </> : null}
          {currency === 'USD' ? <>
            <rect width="40" height="40" fill="#fff" />
            {Array.from({ length: 7 }, (_, index) => <rect key={index} y={index * 6} width="40" height="3.08" fill="#b22234" />)}
            <rect width="19" height="21" fill="#3c3b6e" />
            {Array.from({ length: 20 }, (_, index) => <circle key={index} cx={2.7 + (index % 5) * 3.45} cy={3 + Math.floor(index / 5) * 4.4} r="0.72" fill="#fff" />)}
          </> : null}
          {!['CZK', 'EUR', 'USD'].includes(currency) ? <circle cx="20" cy="20" r="20" fill="var(--uc-action-soft-strong)" /> : null}
        </g>
        <circle cx="20" cy="20" r="19" fill="none" stroke="color-mix(in srgb, var(--uc-text) 18%, transparent)" strokeWidth="1" />
      </svg>
    </span>
  );
}

function CzRoboAccountCard({
  product,
  amountsHidden,
  formatProductAmount,
  getProductDisplayNumber,
  onProductClick,
  onDomesticPaymentClick,
  onPaymentsClick,
  onAccountInfoClick,
  stackRole,
}: {
  product: Product;
  amountsHidden: boolean;
  formatProductAmount: (product: Product) => FormattedAmount;
  getProductDisplayNumber: (product: Product) => string;
  onProductClick: (product: Product) => void;
  onDomesticPaymentClick?: () => void;
  onPaymentsClick?: () => void;
  onAccountInfoClick?: (product: Product) => void;
  stackRole: 'single' | 'first' | 'middle' | 'last';
}) {
  const amount = maskAmountParts(formatProductAmount(product), amountsHidden);

  return (
    <ProductCard
      icon={<CurrencyBadge currency={product.currency} />}
      title={product.name}
      accountNumber={getProductDisplayNumber(product)}
      amount={amount.integer}
      decimals={amount.decimals}
      currency={amount.currency}
      variant="evolution"
      productStyle="pi"
      stackRole={stackRole}
      actions={buildFutureCzAccountCardActions({
        onNewPayment: onDomesticPaymentClick,
        onScanQrCode: onPaymentsClick,
        onCreateQrCode: onPaymentsClick,
        onAccountInfo: () => onAccountInfoClick?.(product),
      })}
      onClick={() => onProductClick(product)}
    />
  );
}

function CzRoboCard({
  product,
  amountsHidden,
  formatProductAmount,
  getProductDisplayNumber,
  onProductClick,
  onCardDetailsClick,
  onCardOptionsClick,
}: {
  product: Product;
  amountsHidden: boolean;
  formatProductAmount: (product: Product) => FormattedAmount;
  getProductDisplayNumber: (product: Product) => string;
  onProductClick: (product: Product) => void;
  onCardDetailsClick?: (product: Product) => void;
  onCardOptionsClick?: (product: Product) => void;
}) {
  const amount = maskAmountParts(formatProductAmount(product), amountsHidden);
  const cardVariant: CardVariant = product.type === 'credit_card'
    ? 'mc-credit-premium-gold'
    : product.type === 'meal_card'
      ? 'mc-virtual-standard-orange'
      : 'mc-debit-standard';
  const openCardJourney = () => onProductClick(product);
  const openCardDetails = () => (onCardDetailsClick ?? onProductClick)(product);
  const openCardOptions = () => (onCardOptionsClick ?? onProductClick)(product);

  return (
    <ProductCard
      icon={<NavigationCardArt variant={cardVariant} />}
      title={product.name}
      accountNumber={getProductDisplayNumber(product)}
      amount={amount.integer}
      decimals={amount.decimals}
      currency={amount.currency}
      variant="evolution"
      productStyle="pi"
      actions={[
        { id: 'card-details', label: 'Card\nDetails', ariaLabel: 'Card details', icon: <AppIcon name="account-info" size={24} />, onClick: openCardDetails },
        { id: 'card-options', label: 'Card\nOptions', ariaLabel: 'Card options', icon: <AppIcon name="account-options" size={24} />, onClick: openCardOptions },
        { id: 'block-card', label: 'Block\nCard', ariaLabel: 'Block card', icon: <AppIcon name="block-card" size={24} />, onClick: openCardOptions },
        { id: 'view-pin', label: 'View\nPIN', ariaLabel: 'View PIN', icon: <AppIcon name="view-pin" size={24} />, onClick: openCardOptions },
      ]}
      onClick={openCardJourney}
    />
  );
}

function ProductRow({
  product,
  amountsHidden,
  formatProductAmount,
  getProductDisplayNumber,
  onProductClick,
}: Omit<App2027ProductAccordionsProps, 'categories' | 'className' | 'calculateGroupTotal'> & { product: Product }) {
  const amount = formatProductAmount(product);
  const isCard = product.type === 'debit_card' || product.type === 'credit_card' || product.type === 'meal_card';
  const cardVariant: CardVariant = product.type === 'credit_card'
    ? 'mc-credit-premium-gold'
    : product.type === 'meal_card'
      ? 'mc-virtual-standard-orange'
      : 'mc-debit-standard';

  return (
    <button
      type="button"
      onClick={() => onProductClick(product)}
      className="group flex min-h-[112px] w-full flex-col px-[14px] py-[14px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-action)]"
    >
      <span className="flex w-full items-center gap-[10px]">
        {isCard ? <NavigationCardArt variant={cardVariant} /> : <CurrencyBadge currency={product.currency} />}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[16px] font-bold leading-[20px] tracking-[-0.012em] text-[var(--uc-text)]">
            {product.name}
          </span>
          <span className="mt-[3px] block truncate text-[14px] leading-[20px] text-[var(--uc-text-muted)]">
            {getProductDisplayNumber(product)}
          </span>
        </span>
      </span>
      <span className="mt-[8px] block w-full text-right">
        <Amount amount={amount} hidden={amountsHidden} />
      </span>
    </button>
  );
}

export default function App2027ProductAccordions({
  categories,
  amountsHidden,
  formatProductAmount,
  calculateGroupTotal,
  getProductDisplayNumber,
  onProductClick,
  useCzRoboAccountCards = false,
  onDomesticPaymentClick,
  onPaymentsClick,
  onAccountInfoClick,
  onCardDetailsClick,
  onCardOptionsClick,
  visibleKeys,
  initialOpenKeys,
  className,
}: App2027ProductAccordionsProps) {
  const [openGroups, setOpenGroups] = useState<Record<SupportedCategoryKey, boolean>>({
    accounts: true,
    cards: false,
    savings_deposits: false,
    mortgages_loans: false,
    ...initialOpenKeys,
  });

  const visibleGroups = GROUP_ORDER.map((definition) => ({
    ...definition,
    category: categories.find((category) => category.key === definition.key),
  })).filter((group): group is (typeof GROUP_ORDER)[number] & { category: ProductCategory } => Boolean(group.category) && (!visibleKeys || visibleKeys.includes(group.key)));

  return (
    <section
      aria-label="Your banking products"
      className={['space-y-[12px]', className].filter(Boolean).join(' ')}
    >
      {visibleGroups.map(({ key, title, icon, category }) => {
        const isOpen = openGroups[key];
        const total = category.products.length ? calculateGroupTotal(category.products) : null;
        const panelId = `app-2027-products-${key}`;
        const useBaselineHeader = useCzRoboAccountCards && key === 'accounts';

        return (
          <div
            key={key}
            data-home-product-group={key}
            className={useBaselineHeader
              ? 'flex flex-col'
              : 'overflow-hidden rounded-[16px] border border-transparent bg-[var(--uc-surface)] shadow-none dark:border-[var(--uc-border-muted)]'}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenGroups((current) => ({ ...current, [key]: !current[key] }))}
              className={useBaselineHeader
                ? 'flex h-[48px] w-full items-center justify-between px-0 text-left transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]'
                : 'flex min-h-[74px] w-full items-center gap-[10px] px-[14px] py-[12px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-action)]'}
            >
              {useBaselineHeader ? (
                <>
                  <h2 className="uc-type-l1 text-[var(--uc-text)]">{title}</h2>
                  <span className={`grid size-[32px] place-items-center transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <AppIcon name="chevron-down-wide" color="var(--uc-icon)" aria-hidden="true" />
                  </span>
                </>
              ) : (
                <>
                  <span className="grid size-[32px] shrink-0 place-items-center">
                    <GroupIcon name={icon} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[18px] font-bold leading-[24px] tracking-[-0.018em] text-[var(--uc-text)]">{title}</span>
                    {key === 'accounts' ? (
                      <span className="block text-[14px] leading-[18px] text-[var(--uc-text-muted)]">Total available balance</span>
                    ) : null}
                  </span>
                  {total ? (
                    <span className="shrink-0 text-right">
                      <Amount amount={total} hidden={amountsHidden} size="header" />
                    </span>
                  ) : null}
                  <span className="grid size-[36px] shrink-0 place-items-center rounded-full bg-[var(--uc-surface-raised)] text-[var(--uc-text)] shadow-[0_2px_8px_rgb(0_0_0/0.08)]">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className={`size-[18px] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </>
              )}
            </button>

            {isOpen ? (
              <div id={panelId} className={useBaselineHeader ? 'pt-[8px]' : 'divide-y divide-[var(--uc-border-muted)] border-t border-[var(--uc-border-muted)]'}>
                {category.products.map((product, productIndex) => {
                  if (key === 'accounts' && useCzRoboAccountCards) {
                    const stackRole = category.products.length === 1
                      ? 'single'
                      : productIndex === 0
                        ? 'first'
                        : productIndex === category.products.length - 1
                          ? 'last'
                          : 'middle';

                    return (
                      <CzRoboAccountCard
                        key={product.id}
                        product={product}
                        amountsHidden={amountsHidden}
                        formatProductAmount={formatProductAmount}
                        getProductDisplayNumber={getProductDisplayNumber}
                        onProductClick={onProductClick}
                        onDomesticPaymentClick={onDomesticPaymentClick}
                        onPaymentsClick={onPaymentsClick}
                        onAccountInfoClick={onAccountInfoClick}
                        stackRole={stackRole}
                      />
                    );
                  }

                  if (key === 'cards' && useCzRoboAccountCards) {
                    return (
                      <CzRoboCard
                        key={product.id}
                        product={product}
                        amountsHidden={amountsHidden}
                        formatProductAmount={formatProductAmount}
                        getProductDisplayNumber={getProductDisplayNumber}
                        onProductClick={onProductClick}
                        onCardDetailsClick={onCardDetailsClick}
                        onCardOptionsClick={onCardOptionsClick}
                      />
                    );
                  }

                  return (
                    <ProductRow
                      key={product.id}
                      product={product}
                      amountsHidden={amountsHidden}
                      formatProductAmount={formatProductAmount}
                      getProductDisplayNumber={getProductDisplayNumber}
                      onProductClick={onProductClick}
                    />
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
