import { useEffect, useMemo, useRef, useState, type ReactNode, type UIEvent } from 'react';
import { AppIcon, type IconName } from '@/app/components/icons';
import { getCountryCurrency } from '@/data/exchangeRates';
import { formatAmount, type Product, type ProductCategory } from '@/data/products';
import { useDemo } from '@/app/state/demoStore';
import { maskAmountParts } from '@/app/utils/amountPrivacy';
import { useProducts } from '@/hooks/useProducts';
import { useDragCarousel } from '@/hooks/useDragCarousel';
import App2027Activity from './App2027Activity';
import App2027Portfolio from './App2027Portfolio';
import App2027ProductAccordions from './App2027ProductAccordions';
import App2027TransformationHome from './App2027TransformationHome';
import { getStoredApp2027Theme, type HomeTheme } from './App2027ThemePicker';
import HomeHeader from './HomeHeader';
import App2027PrimaryNavigation, { type App2027PrimaryNavigationItem } from '@/app/components/navigation/App2027PrimaryNavigation';
import type { AccountTransaction } from '@/data/accountDetails';
import type { CardTransactionMerchantEnrichment } from '@/app/screens/payments/DomesticPaymentFlowScreens';

interface App2027HomeScreenProps {
  onPrimeClick?: () => void;
  onAnalyticsClick?: () => void;
  onSeeAllTransactionsClick?: () => void;
  onMessagesClick?: () => void;
  onPaymentsClick?: () => void;
  onDomesticPaymentClick?: () => void;
  onProductsClick?: () => void;
  onMoreClick?: () => void;
  onAccountClick?: (product: Product) => void;
  onAccountInfoClick?: (product: Product) => void;
  onCardDetailsClick?: (product: Product) => void;
  onCardOptionsClick?: (product: Product) => void;
  onInvestmentsClick?: () => void;
  onInvestmentGoalsClick?: () => void;
  onTransactionClick?: (
    transaction: AccountTransaction,
    product: Product,
    merchantEnrichment?: CardTransactionMerchantEnrichment,
  ) => void;
  useCzRoboAccountCards?: boolean;
}

type NavItem = App2027PrimaryNavigationItem;
type HomeSheetId = 'personalise' | 'products';
type FavouriteId = 'new-payment' | 'scan-pay' | 'transfer' | 'save';
type StoryId = 'payment-due' | 'recommendation' | 'spending' | 'savings-goal';
type StoryTone = 'urgent' | 'commercial' | 'insight' | 'progress';

interface HomeStory {
  id: StoryId;
  eyebrow: string;
  title: string;
  body: string;
  icon: ReactNode;
  tone: StoryTone;
  dismissible: boolean;
  onClick?: () => void;
}

const FAVOURITE_META: Record<FavouriteId, { label: string; icon: IconName }> = {
  'new-payment': { label: 'New payment', icon: 'nav-payments' },
  'scan-pay': { label: 'Scan & pay', icon: 'payment-scan-qr' },
  transfer: { label: 'Move money', icon: 'transaction-transfer' },
  save: { label: 'More options', icon: 'hu-kids-more-options' },
};

const PRODUCT_CATEGORY_TABS: ReadonlyArray<{ key: ProductCategory['key']; label: string; requiresProducts?: boolean }> = [
  { key: 'accounts', label: 'Accounts' },
  { key: 'cards', label: 'Cards' },
  { key: 'savings_deposits', label: 'Savings' },
  { key: 'mortgages_loans', label: 'Loans' },
  { key: 'investments', label: 'Investments', requiresProducts: true },
];

function amountText(parts: ReturnType<typeof maskAmountParts>, currency: string) {
  return `${parts.integer}${parts.decimals} ${currency}`;
}

function compactAmountText(parts: ReturnType<typeof maskAmountParts>, currency: string) {
  if (parts.integer === '****') return `${parts.integer}${parts.decimals} ${currency}`;
  return `${parts.integer} ${currency}`;
}

function productAmountText(product: Product, parts: { integer: string; decimals: string; currency: string }) {
  return `${product.balance < 0 ? '\u2212' : ''}${parts.integer}${parts.decimals} ${parts.currency}`;
}

function compactProductNumber(displayNumber: string) {
  const digits = displayNumber.replace(/\D/g, '');
  return digits.length >= 4 ? `\u2022\u2022\u2022\u2022 ${digits.slice(-4)}` : displayNumber;
}

function QuickAction({ label, icon, onClick }: { label: string; icon: IconName; onClick?: () => void }) {
  return (
    <button
      type="button"
      data-home-quick-action
      aria-label={label}
      onClick={onClick}
      className="group flex min-w-0 flex-col items-center gap-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]"
    >
      <span className="grid size-[64px] place-items-center rounded-full border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] text-[#262626] shadow-none">
        <AppIcon name={icon} size={24} aria-hidden="true" />
      </span>
      <span className="min-h-[32px] max-w-[76px] text-center text-[14px] font-medium leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">
        {(label === 'Scan & pay' ? ['Scan &', 'pay'] : label.includes(' ') ? label.split(' ') : [label]).map((line) => (
          <span key={line} className="block h-[16px] whitespace-nowrap">{line}</span>
        ))}
      </span>
    </button>
  );
}

function ProductCategoryTabs({ categories }: { categories: ProductCategory[] }) {
  const tabs = PRODUCT_CATEGORY_TABS.filter((tab) => {
    if (!tab.requiresProducts) return true;
    return Boolean(categories.find((category) => category.key === tab.key)?.products.length);
  });

  return (
    <section data-home-area="product-categories" className="min-w-0">
      <div
        role="tablist"
        aria-label="Product categories"
        className="flex gap-[6px] overflow-x-auto overscroll-x-contain scrollbar-hide"
      >
        {tabs.map((tab) => {
          const isActive = tab.key === 'accounts';

          return (
            <span
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              data-home-product-category-tab={tab.key}
              className={`flex h-[46px] shrink-0 items-center justify-center rounded-full border px-[12px] text-center text-[18px] leading-[20px] whitespace-nowrap ${isActive
                ? 'flex-col gap-[2px] border-transparent bg-[var(--uc-action)] py-[8px] font-medium text-[var(--uc-static-white)]'
                : 'border-transparent bg-[var(--uc-surface)] font-normal text-[var(--uc-text-muted)]'}`}
            >
              <span>{tab.label}</span>
              {isActive ? <span aria-hidden="true" className="size-[4px] shrink-0 rounded-full bg-[var(--uc-static-white)]" /> : null}
            </span>
          );
        })}
      </div>
    </section>
  );
}

function StorySignal({ story }: { story: HomeStory }) {
  if (story.id === 'spending') {
    return (
      <div className="flex items-end gap-[8px]" aria-label="Spending decreased by 8 percent">
        <span className="text-[24px] font-bold leading-[28px] tracking-[-0.03em] text-[var(--uc-action)]">−8%</span>
        <span className="flex h-[28px] items-end gap-[3px]" aria-hidden="true">
          {[12, 20, 16, 24, 10].map((height, index) => (
            <span key={index} className="w-[4px] rounded-full bg-[var(--uc-action)] opacity-80" style={{ height }} />
          ))}
        </span>
      </div>
    );
  }

  if (story.id === 'savings-goal') {
    return (
      <div className="relative grid size-[58px] place-items-center rounded-full bg-[conic-gradient(var(--uc-action)_0_64%,color-mix(in_srgb,var(--uc-text)_12%,transparent)_64%_100%)]" aria-label="Savings goal 64 percent complete">
        <span className="grid size-[44px] place-items-center rounded-full bg-[var(--uc-surface-raised)] text-[14px] font-bold text-[var(--uc-text)]">64%</span>
      </div>
    );
  }

  if (story.id === 'recommendation') {
    return (
      <div className="flex items-end gap-[4px]" aria-label="Flexible savings">
        {[30, 40, 52].map((height, index) => (
          <span key={height} className="w-[15px] rounded-t-[8px] border border-[color-mix(in_srgb,var(--uc-action)_36%,transparent)] bg-[color-mix(in_srgb,var(--uc-action)_16%,var(--uc-surface-raised))]" style={{ height, opacity: 0.68 + index * 0.14 }} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-[7px] rounded-full bg-[color-mix(in_srgb,var(--uc-surface-raised)_82%,transparent)] px-[10px] py-[7px] text-[14px] font-bold text-[var(--uc-text)] shadow-[inset_0_1px_0_rgb(var(--uc-static-white-rgb)/0.18)]" aria-label="Everyday balance covers this payment">
      <span className="grid size-[20px] place-items-center rounded-full bg-[var(--uc-action)] text-[var(--uc-static-black)]"><AppIcon name="check" size={13} aria-hidden="true" /></span>
      Covered
    </div>
  );
}

function StoryCard({ story, onDismiss }: { story: HomeStory; onDismiss: () => void }) {
  return (
    <article key={story.id} data-home-story={story.id} data-story-tone={story.tone} data-story-direct-action="true" className="relative flex min-h-[104px] w-full shrink-0 snap-start snap-always flex-col overflow-hidden rounded-[16px] p-[12px]" style={{ borderRadius: 16 }}>
      <div aria-hidden="true" data-story-orbit />
      <button type="button" data-home-story-action aria-label={`${story.eyebrow}: ${story.title}`} onClick={story.onClick} className="absolute inset-0 z-0 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-action)]" />
      <div className="relative z-10 flex items-start justify-between gap-[12px]">
        <div className="flex min-w-0 items-center gap-[10px]">
          <span data-story-icon className="grid size-[44px] shrink-0 place-items-center rounded-[14px] [&>svg]:size-[24px]">{story.icon}</span>
          <div>
            <div className="text-[14px] font-bold uppercase leading-[18px] tracking-[0.07em] text-[var(--uc-text-muted)]">{story.eyebrow}</div>
          </div>
        </div>
        {story.dismissible ? (
          <button
            type="button"
            aria-label={`Dismiss ${story.eyebrow}`}
            onClick={(event) => {
              event.stopPropagation();
              onDismiss();
            }}
            onPointerDown={(event) => event.stopPropagation()}
            className="grid size-[44px] shrink-0 place-items-center rounded-full border border-[color-mix(in_srgb,var(--uc-text)_12%,transparent)] bg-[color-mix(in_srgb,var(--uc-surface-raised)_86%,transparent)] text-[var(--uc-text)] shadow-[inset_0_1px_0_rgb(var(--uc-static-white-rgb)/0.18),0_8px_20px_rgb(var(--uc-shadow-rgb)/0.14)] backdrop-blur-[14px] transition-transform active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
          >
            <AppIcon name="close-x" size={19} aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <div className="relative z-10 mt-[14px] max-w-[86%]">
        <h3 className="text-[20px] font-bold leading-[24px] tracking-[-0.018em] text-[var(--uc-text)]">{story.title}</h3>
        <p className="mt-[5px] text-[14px] leading-[20px] text-[var(--uc-text-muted)]">{story.body}</p>
      </div>
      <div className="relative z-10 mt-auto flex min-h-[48px] items-end justify-between gap-[12px] pt-[8px]">
        <StorySignal story={story} />
      </div>
    </article>
  );
}

function ProductRow({ product, icon, amount, displayNumber, onClick }: { product: Product; icon: ReactNode; amount: string; displayNumber: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="group flex min-h-[72px] w-full items-center gap-[12px] border-b border-[var(--uc-border-muted)] py-[10px] text-left last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-brand)]">
      <span className="grid size-[44px] shrink-0 place-items-center rounded-[13px] bg-[var(--uc-surface-muted)] text-[var(--uc-text)] [&>svg]:size-[28px]">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-bold leading-[18px] text-[var(--uc-text)]">{product.name}</span>
        <span className="mt-[2px] block truncate text-[14px] leading-[18px] text-[var(--uc-text-muted)]">{displayNumber}</span>
      </span>
      <span className="max-w-[116px] truncate text-right text-[14px] font-bold leading-[18px] tabular-nums text-[var(--uc-text)]">{amount}</span>
      <AppIcon name="chevron-link" size={18} aria-hidden="true" className="shrink-0 text-[var(--uc-text-subtle)]" />
    </button>
  );
}

function HomeSheet({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-[rgb(var(--uc-static-black-rgb)/0.34)] px-[8px] pt-[72px]" data-home-sheet onClick={onClose}>
      <section role="dialog" aria-modal="true" aria-label={title} className="max-h-full w-full max-w-[560px] overflow-y-auto rounded-t-[28px] bg-[var(--uc-surface)] px-[20px] pb-[24px] shadow-[0_-18px_52px_rgb(var(--uc-shadow-rgb)/0.18)]" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto mb-[8px] mt-[8px] h-[4px] w-[40px] rounded-full bg-[var(--uc-border)]" />
        <div className="flex min-h-[64px] items-center justify-between gap-[16px]">
          <div className="min-w-0">
            <h2 className="text-[21px] font-bold leading-[25px] tracking-[-0.018em] text-[var(--uc-text)]">{title}</h2>
            {subtitle ? <p className="mt-[3px] text-[14px] leading-[20px] text-[var(--uc-text-muted)]">{subtitle}</p> : null}
          </div>
          <button type="button" aria-label={`Close ${title}`} onClick={onClose} className="grid size-[44px] shrink-0 place-items-center rounded-full bg-[var(--uc-surface-muted)] text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-brand)]">
            <AppIcon name="close-x" size={18} aria-hidden="true" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export default function App2027HomeScreen({
  onPrimeClick,
  onAnalyticsClick,
  onSeeAllTransactionsClick,
  onMessagesClick,
  onPaymentsClick,
  onDomesticPaymentClick,
  onProductsClick,
  onMoreClick,
  onAccountClick,
  onAccountInfoClick,
  onCardDetailsClick,
  onCardOptionsClick,
  onInvestmentsClick,
  onInvestmentGoalsClick,
  onTransactionClick,
  useCzRoboAccountCards = false,
}: App2027HomeScreenProps) {
  const demo = useDemo();
  const { categories, calculateTotal, calculateTotalAvailable, calculateTotalOwed, formatProductAmount, getProductDisplayNumber, getProductIcon } = useProducts();
  const [activeSheet, setActiveSheet] = useState<HomeSheetId | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [favouriteOrder, setFavouriteOrder] = useState<FavouriteId[]>(['new-payment', 'scan-pay', 'transfer', 'save']);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const storyRailRef = useRef<HTMLDivElement | null>(null);
  const storySnapTimeoutRef = useRef<number | null>(null);
  const [dismissedStories, setDismissedStories] = useState<StoryId[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = JSON.parse(window.sessionStorage.getItem('app2027-dismissed-today-stories') ?? '[]');
      return Array.isArray(stored) ? stored.filter((id): id is StoryId => ['payment-due', 'recommendation', 'spending', 'savings-goal'].includes(id)) : [];
    } catch {
      return [];
    }
  });
  const [homeTheme] = useState<HomeTheme>(getStoredApp2027Theme);

  const currency = getCountryCurrency(demo.country);
  const products = useMemo(() => categories.flatMap((category) => category.products), [categories]);
  const activityAccount = products.find((product) => product.type === 'current_account');
  const activityDebitCard = products.find((product) => product.type === 'debit_card');
  const availableParts = maskAmountParts(calculateTotalAvailable(), demo.amountsHidden);
  const debtParts = maskAmountParts(calculateTotalOwed(), demo.amountsHidden);
  const mortgagePaymentParts = maskAmountParts(formatAmount(3500, currency), demo.amountsHidden);
  const mortgageProduct = products.find((product) => product.type === 'mortgage');
  const savingsProduct = products.find((product) => product.type === 'saving_account' || product.type === 'term_deposit');
  const showHomeTransformation = demo.release === 'release-future-evo-2027';

  const openActivityTransaction = (
    transaction: AccountTransaction,
    merchantEnrichment?: CardTransactionMerchantEnrichment,
  ) => {
    const sourceProduct = transaction.source === 'card'
      ? activityDebitCard ?? activityAccount
      : activityAccount;
    if (sourceProduct) onTransactionClick?.(transaction, sourceProduct, merchantEnrichment);
  };

  const favouriteActions: Record<FavouriteId, (() => void) | undefined> = {
    'new-payment': onDomesticPaymentClick,
    'scan-pay': onPaymentsClick,
    transfer: onDomesticPaymentClick,
    save: onMoreClick,
  };

  const allStories: HomeStory[] = [
    ...(mortgageProduct ? [{
      id: 'payment-due' as const,
      eyebrow: 'Payment due tomorrow',
      title: `${compactAmountText(mortgagePaymentParts, currency)} mortgage payment`,
      body: 'Your everyday balance comfortably covers it.',
      icon: getProductIcon(mortgageProduct),
      tone: 'urgent' as const,
      dismissible: true,
      onClick: () => onAccountClick?.(mortgageProduct),
    }] : []),
    {
      id: 'recommendation',
      eyebrow: 'Selected for you',
      title: 'Make more of the money you keep aside',
      body: 'Compare flexible savings options without moving your everyday money.',
      icon: <AppIcon name="add-money" size={24} aria-hidden="true" />,
      tone: 'commercial',
      dismissible: true,
      onClick: onProductsClick,
    },
    {
      id: 'spending',
      eyebrow: 'Spending insight',
      title: 'You spent 8% less than last month',
      body: 'Groceries improved most. See what changed across categories.',
      icon: <AppIcon name="nav-analytics" size={24} aria-hidden="true" />,
      tone: 'insight',
      dismissible: true,
      onClick: onAnalyticsClick,
    },
    ...(savingsProduct ? [{
      id: 'savings-goal' as const,
      eyebrow: 'Savings goal',
      title: 'Holiday fund is 64% complete',
      body: 'At this pace you can reach it two weeks earlier.',
      icon: getProductIcon(savingsProduct),
      tone: 'progress' as const,
      dismissible: true,
      onClick: () => onAccountClick?.(savingsProduct),
    }] : []),
  ];
  const stories = allStories.filter((story) => !dismissedStories.includes(story.id));
  const storyIndex = stories.length === 0 ? 0 : Math.min(activeStoryIndex, stories.length - 1);

  const scrollToStory = (index: number, behavior: ScrollBehavior = 'smooth') => {
    const rail = storyRailRef.current;
    const cards = rail?.querySelectorAll<HTMLElement>('[data-home-story]');
    const card = cards?.[index];
    if (!rail || !card) return;
    rail.scrollTo({ left: Math.max(0, card.offsetLeft - rail.offsetLeft), behavior });
    setActiveStoryIndex(index);
  };

  const updateActiveStory = () => {
    const rail = storyRailRef.current;
    const cards = rail?.querySelectorAll<HTMLElement>('[data-home-story]');
    if (!rail || !cards?.length) return;
    const viewportCenter = rail.scrollLeft + rail.clientWidth / 2;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - viewportCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });
    setActiveStoryIndex(nearestIndex);
  };

  const snapStoryToNearest = () => {
    const rail = storyRailRef.current;
    const cards = rail?.querySelectorAll<HTMLElement>('[data-home-story]');
    if (!rail || !cards?.length) return;
    const viewportCenter = rail.scrollLeft + rail.clientWidth / 2;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - viewportCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });
    scrollToStory(nearestIndex);
  };

  const clearStorySnapTimeout = () => {
    if (storySnapTimeoutRef.current === null) return;
    window.clearTimeout(storySnapTimeoutRef.current);
    storySnapTimeoutRef.current = null;
  };

  const { isDragging: isStoryDragging, isPressActiveRef: isStoryPressActiveRef, dragHandlers: storyDragHandlers } = useDragCarousel({
    carouselRef: storyRailRef,
    onSettle: snapStoryToNearest,
    enabled: stories.length > 1,
  });

  const handleStoryRailScroll = (_event: UIEvent<HTMLDivElement>) => {
    updateActiveStory();
    if (isStoryPressActiveRef.current) return;
    clearStorySnapTimeout();
    storySnapTimeoutRef.current = window.setTimeout(snapStoryToNearest, 120);
  };

  useEffect(() => () => clearStorySnapTimeout(), []);

  const dismissStory = (storyId: StoryId) => {
    const nextDismissedStories = [...new Set([...dismissedStories, storyId])];
    setDismissedStories(nextDismissedStories);
    try {
      window.sessionStorage.setItem('app2027-dismissed-today-stories', JSON.stringify(nextDismissedStories));
    } catch {
      // Dismiss remains available in memory when session storage is unavailable.
    }
    const nextIndex = Math.max(0, Math.min(storyIndex, stories.length - 2));
    setActiveStoryIndex(nextIndex);
    window.requestAnimationFrame(() => scrollToStory(nextIndex, 'auto'));
  };

  const moveFavourite = (id: FavouriteId, direction: -1 | 1) => {
    setFavouriteOrder((current) => {
      const index = current.indexOf(id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  };

  const openCategory = (category: ProductCategory) => {
    setSelectedCategory(category);
    setActiveSheet('products');
  };

  const handleTabChange = (tab: NavItem) => {
    if (tab === 'analytics') onAnalyticsClick?.();
    if (tab === 'payments') onPaymentsClick?.();
    if (tab === 'products') onProductsClick?.();
    if (tab === 'more') onMoreClick?.();
  };

  return (
    <div data-app-2027-home data-home-theme={homeTheme} className="@container/home relative flex h-full w-full min-w-0 flex-col overflow-hidden bg-[var(--uc-app-bg)] text-[var(--uc-text)]" style={{ containerName: 'home', containerType: 'size' }}>
      <div className="h-[var(--uc-phone-top-reserve,54px)] shrink-0" />

      <header data-app-2027-header className="z-20 shrink-0 bg-[var(--uc-app-bg)]">
        <HomeHeader onPrimeClick={onPrimeClick} onMessagesClick={onMessagesClick} showTitle={false} />
      </header>

      <main data-app-2027-scroll className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-[clamp(16px,4vw,24px)] pb-[16px] pt-[18px] scrollbar-hide">
        <div data-app-2027-layout className="mx-auto grid w-full max-w-[1080px] grid-cols-1 items-start gap-[28px]">
          {showHomeTransformation ? (
            <App2027TransformationHome
              onSeeAllTransactions={onSeeAllTransactionsClick}
              categories={categories}
              country={demo.country}
              amountsHidden={demo.amountsHidden}
              calculateTotal={calculateTotal}
              calculateTotalAvailable={calculateTotalAvailable}
              calculateTotalOwed={calculateTotalOwed}
              formatProductAmount={formatProductAmount}
              getProductDisplayNumber={getProductDisplayNumber}
              onProductClick={(product) => {
                if (product.type === 'investment_account') onInvestmentsClick?.();
                else onAccountClick?.(product);
              }}
              onAccountInfoClick={onAccountInfoClick}
              onDomesticPaymentClick={onDomesticPaymentClick}
              onPaymentsClick={onPaymentsClick}
              onCardDetailsClick={onCardDetailsClick}
              onCardOptionsClick={onCardOptionsClick}
              onProductsClick={onProductsClick}
              onTransactionOpen={openActivityTransaction}
            />
          ) : (
            <>
          <ProductCategoryTabs categories={categories} />

          <section data-home-area="overview" className="relative flex min-h-[174px] flex-col items-center justify-center pb-[42px] pt-[28px] text-center">
            <div className="flex items-center gap-[8px]">
              <h1 className="text-[18px] font-bold leading-[24px] tracking-[-0.01em] text-[var(--uc-text)]">Total available</h1>
              <button type="button" aria-label={demo.amountsHidden ? 'Show amounts' : 'Hide amounts'} aria-pressed={demo.amountsHidden} onClick={demo.toggleAmountsHidden} className="grid size-[44px] place-items-center rounded-full text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]">
                <AppIcon name={demo.amountsHidden ? 'amount-show' : 'amount-hide'} size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="mt-[8px] flex h-[52px] items-baseline justify-center whitespace-nowrap text-[var(--uc-text)]">
              <span className="text-[48px] font-bold leading-[52px] tracking-[-0.04em] tabular-nums">{availableParts.integer}</span>
              <span className="text-[32px] font-normal leading-[34px] tabular-nums">{availableParts.decimals} {currency}</span>
            </div>
            <div className="mt-[8px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">Total owed: {amountText(debtParts, currency)}</div>
          </section>

          <section data-home-area="favourites">
            <div className="grid grid-cols-4 gap-[18px]">
              {favouriteOrder.map((id) => (
                <QuickAction key={id} label={FAVOURITE_META[id].label} icon={FAVOURITE_META[id].icon} onClick={favouriteActions[id]} />
              ))}
            </div>
          </section>

          <section data-home-area="priorities">
            {stories.length ? (
              <>
                <div
                  ref={storyRailRef}
                  data-home-story-rail
                  className={`touch-pan-y snap-x snap-mandatory scroll-px-0 select-none overflow-x-auto overscroll-x-contain pr-[2px] scrollbar-hide ${isStoryDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                  onScroll={handleStoryRailScroll}
                  {...storyDragHandlers}
                  style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
                >
                  <div data-home-story-track className="flex" role="list">
                    {stories.map((story) => (
                      <StoryCard key={story.id} story={story} onDismiss={() => dismissStory(story.id)} />
                    ))}
                  </div>
                </div>
                {stories.length > 1 ? (
                  <div aria-label="Contextual item pagination" className="mt-[10px] flex items-center justify-center" data-home-story-pagination role="tablist">
                    {stories.map((story, index) => {
                      const isActive = index === storyIndex;

                      return (
                        <button
                          key={story.id}
                          type="button"
                          aria-current={isActive ? 'true' : undefined}
                          aria-label={`Show contextual item ${index + 1} of ${stories.length}`}
                          aria-selected={isActive}
                          data-home-story-page={index}
                          onClick={() => scrollToStory(index)}
                          role="tab"
                          className="grid size-[24px] place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
                        >
                          <span className={`block h-[6px] rounded-full transition-[width,background-color] duration-200 motion-reduce:transition-none ${isActive ? 'w-[22px] bg-[var(--uc-action)]' : 'w-[6px] bg-[var(--uc-border-strong)]'}`} />
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="flex min-h-[112px] items-center gap-[14px] rounded-[22px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[18px] py-[16px]" aria-live="polite">
                <span className="grid size-[44px] shrink-0 place-items-center rounded-full bg-[var(--uc-action-soft)] text-[var(--uc-action)]"><AppIcon name="check" size={20} aria-hidden="true" /></span>
                <div>
                  <h3 className="text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">You are all caught up</h3>
                  <p className="mt-[3px] text-[14px] leading-[19px] text-[var(--uc-text-muted)]">New payments, insights and relevant offers will appear here.</p>
                </div>
              </div>
            )}
          </section>

          <div data-home-area="product-groups">
            <App2027ProductAccordions
              categories={categories}
              amountsHidden={demo.amountsHidden}
            formatProductAmount={formatProductAmount}
            calculateGroupTotal={calculateTotal}
            getProductDisplayNumber={getProductDisplayNumber}
            onProductClick={(product) => {
                if (product.type === 'investment_account') onInvestmentsClick?.();
                else onAccountClick?.(product);
              }}
            useCzRoboAccountCards={useCzRoboAccountCards}
            onDomesticPaymentClick={onDomesticPaymentClick}
            onAccountInfoClick={onAccountInfoClick}
          />
          </div>

          <App2027Activity
            country={demo.country}
            currency={currency}
            amountsHidden={demo.amountsHidden}
            onTransactionOpen={openActivityTransaction}
            onSeeMore={onSeeAllTransactionsClick ?? onAnalyticsClick}
          />

          <App2027Portfolio
            categories={categories}
            currency={currency}
            amountsHidden={demo.amountsHidden}
            getProductIcon={getProductIcon}
            onCategoryClick={openCategory}
          />

          <section data-home-area="customise">
            <button
              type="button"
              onClick={() => setActiveSheet('personalise')}
              className="group flex min-h-[68px] w-full items-center gap-[14px] rounded-[22px] border border-[var(--uc-border-muted)] bg-[color-mix(in_srgb,var(--uc-surface-raised)_84%,transparent)] px-[16px] py-[10px] text-left shadow-[inset_0_1px_0_rgb(255_255_255_/_0.28),0_10px_28px_rgb(0_0_0_/_0.09)] backdrop-blur-[14px] transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)] motion-reduce:transform-none"
            >
              <span className="grid size-[48px] shrink-0 place-items-center rounded-full bg-[var(--uc-action-soft)] text-[var(--uc-action)]">
                <AppIcon name="account-options" size={22} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">Customise</span>
                <span className="mt-[2px] block text-[14px] leading-[19px] text-[var(--uc-text-muted)]">Choose your shortcuts and their order</span>
              </span>
              <AppIcon className="shrink-0 text-[var(--uc-action)]" name="chevron-link" size={20} aria-hidden="true" />
            </button>
          </section>
            </>
          )}
        </div>
      </main>

      <div data-app-2027-navigation-dock className="absolute inset-x-0 bottom-[8px] z-30 flex justify-center bg-transparent">
        <App2027PrimaryNavigation activeTab="home" onTabChange={handleTabChange} selectionMotion />
      </div>

      {activeSheet === 'personalise' ? (
        <HomeSheet title="Quick actions" subtitle="Choose their order on Home." onClose={() => setActiveSheet(null)}>
          <div className="mt-[18px] overflow-hidden rounded-[18px] border border-[var(--uc-border-muted)]">
            {favouriteOrder.map((id, index) => (
              <div key={id} className="flex min-h-[64px] items-center gap-[12px] border-b border-[var(--uc-border-muted)] px-[12px] last:border-b-0">
                <span className="grid size-[40px] place-items-center rounded-[12px] bg-[var(--uc-action-soft)] text-[var(--uc-action)]"><AppIcon name={FAVOURITE_META[id].icon} size={19} aria-hidden="true" /></span>
                <span className="min-w-0 flex-1 text-[14px] font-bold text-[var(--uc-text)]">{FAVOURITE_META[id].label}</span>
                <button type="button" disabled={index === 0} onClick={() => moveFavourite(id, -1)} aria-label={`Move ${FAVOURITE_META[id].label} left`} className="grid size-[44px] place-items-center rounded-full text-[var(--uc-text-muted)] disabled:opacity-25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-brand)]"><AppIcon name="chevron-left" size={18} aria-hidden="true" /></button>
                <button type="button" disabled={index === favouriteOrder.length - 1} onClick={() => moveFavourite(id, 1)} aria-label={`Move ${FAVOURITE_META[id].label} right`} className="grid size-[44px] place-items-center rounded-full text-[var(--uc-text-muted)] disabled:opacity-25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-brand)]"><AppIcon name="chevron-link" size={18} aria-hidden="true" /></button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setActiveSheet(null)} className="mt-[20px] min-h-[50px] w-full rounded-[14px] bg-[var(--uc-action)] text-[14px] font-bold text-[var(--uc-static-black)]">Done</button>
        </HomeSheet>
      ) : null}

      {activeSheet === 'products' && selectedCategory ? (
        <HomeSheet title={selectedCategory.title} subtitle={`${selectedCategory.products.length} ${selectedCategory.products.length === 1 ? 'product' : 'products'} in this group`} onClose={() => setActiveSheet(null)}>
          <div className="mt-[18px] rounded-[18px] border border-[var(--uc-border-muted)] px-[14px]">
            {selectedCategory.products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                icon={getProductIcon(product)}
                amount={demo.amountsHidden ? `****.** ${product.currency}` : productAmountText(product, formatProductAmount(product))}
                displayNumber={compactProductNumber(getProductDisplayNumber(product))}
                onClick={() => {
                  setActiveSheet(null);
                  if (product.type === 'investment_account') onInvestmentsClick?.();
                  else onAccountClick?.(product);
                }}
              />
            ))}
          </div>
          {selectedCategory.key === 'investments' && demo.country === 'CZ' ? (
            <button type="button" onClick={() => { setActiveSheet(null); onInvestmentGoalsClick?.(); }} className="mt-[14px] flex min-h-[64px] w-full items-center gap-[12px] rounded-[18px] bg-[color-mix(in_srgb,var(--uc-brand)_7%,var(--uc-surface))] px-[14px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-brand)]">
              <span className="grid size-[42px] place-items-center rounded-[13px] bg-[var(--uc-surface)] text-[var(--uc-brand)]"><AppIcon name="investment-goals-product" size={21} aria-hidden="true" /></span>
              <span className="min-w-0 flex-1"><span className="block text-[14px] font-bold">Investment goals</span><span className="mt-[2px] block text-[14px] leading-[18px] text-[var(--uc-text-muted)]">Continue your Robo plan</span></span>
              <AppIcon name="chevron-link" size={18} aria-hidden="true" />
            </button>
          ) : null}
        </HomeSheet>
      ) : null}
    </div>
  );
}
