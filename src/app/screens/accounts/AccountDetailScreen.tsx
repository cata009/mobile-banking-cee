import { useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent, KeyboardEvent, MouseEvent, PointerEvent, UIEvent } from "react";
import AccountBalanceCard from "@/app/components/accounts/AccountBalanceCard";
import AccountActionBar from "@/app/components/accounts/AccountActionBar";
import AccountCarouselIndicator from "@/app/components/accounts/AccountCarouselIndicator";
import AccountTransactionRow from "@/app/components/accounts/AccountTransactionRow";
import AccountTransactionMonthDivider from "@/app/components/accounts/AccountTransactionMonthDivider";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import { AppIcon } from "@/app/components/icons";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useDemo } from "@/app/state/demoStore";
import { getCountryConfig, formatMoneyNumber } from "@/app/registry/countryConfig";
import { maskAmountParts, maskFormattedAmount } from "@/app/utils/amountPrivacy";
import { useProducts } from "@/hooks/useProducts";
import { getAccountTransactionProfileIndex, getAccountTransactions, groupAccountTransactionsByMonth } from "@/data/accountDetails";
import type { AccountTransaction } from "@/data/accountDetails";
import { isAccountDetailProduct } from "@/data/products";
import type { Product } from "@/data/products";

interface AccountDetailScreenProps {
  selectedProductId?: string | null;
  onBack: () => void;
  onDetailsClick: (product: Product) => void;
  onOptionsClick: () => void;
  onTransactionClick?: (transaction: AccountTransaction, product: Product) => void;
}

const ACCOUNT_CARD_WIDTH = 311;
const ACCOUNT_CARD_HEIGHT = 197;
const ACCOUNT_CARD_GAP = 16;
const ACCOUNT_CARD_STEP = ACCOUNT_CARD_WIDTH + ACCOUNT_CARD_GAP;
const ACCOUNT_CAROUSEL_EDGE_GUTTER = 16;
const ACCOUNT_CARD_INACTIVE_VERTICAL_INSET = 16;
const ACCOUNT_CARD_INACTIVE_SCALE_Y = (
  ACCOUNT_CARD_HEIGHT - ACCOUNT_CARD_INACTIVE_VERTICAL_INSET * 2
) / ACCOUNT_CARD_HEIGHT;
const ACCOUNT_DETAIL_HEADER_HEIGHT = 102;

type CarouselDragState = {
  didMove: boolean;
  input: "mouse" | "pointer" | null;
  pointerId: number | null;
  startScrollLeft: number;
  startX: number;
};

function splitFormattedNumber(value: string) {
  const match = value.match(/^(.+?)([,.]\d{2})$/);
  return {
    integer: match ? match[1] : value,
    decimals: match ? match[2] : ",00",
  };
}

function getProductAccountIdentity(product: Product) {
  return {
    accountName: product.name,
    accountNumber: product.accountNumber,
    subAccount: "",
  };
}

function CollapsingAccountHeader({
  title,
  progress,
  onBack,
}: {
  title: string;
  progress: number;
  onBack: () => void;
}) {
  return (
    <div className="sticky top-0 z-30 bg-[var(--uc-app-bg)] pt-[54px]">
      <div className="grid h-[48px] grid-cols-[40px_1fr_40px] items-center px-[8px] pt-[8px]">
        <button
          onClick={onBack}
          className="flex h-[40px] w-[40px] items-center justify-center"
          aria-label="Back"
        >
          <AppIcon name="back-heavy" color="var(--uc-text)" />
        </button>
        <h1
          className="pointer-events-none truncate text-center font-['UniCredit',sans-serif] text-[16px] font-bold leading-normal text-[var(--uc-text)]"
          style={{
            opacity: progress,
            transform: `translateY(${(1 - progress) * 6}px)`,
          }}
        >
          {title}
        </h1>
        <div className="h-[40px] w-[40px]" />
      </div>
    </div>
  );
}

export default function AccountDetailScreen({
  selectedProductId,
  onBack,
  onDetailsClick,
  onOptionsClick,
  onTransactionClick,
}: AccountDetailScreenProps) {
  const { country, amountsHidden } = useDemo();
  const { t } = useLanguage();
  const { categories } = useProducts();
  const accountProducts = useMemo(() => {
    const products = categories.flatMap((category) => category.products);
    return products.filter(isAccountDetailProduct);
  }, [categories]);

  const selectedIndex = Math.max(
    0,
    accountProducts.findIndex((product) => product.id === selectedProductId),
  );
  const [activeIndex, setActiveIndex] = useState(selectedIndex === -1 ? 0 : selectedIndex);
  const [headerProgress, setHeaderProgress] = useState(0);
  const [transactionSearch, setTransactionSearch] = useState("");
  const pageRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<CarouselDragState>({
    didMove: false,
    input: null,
    pointerId: null,
    startScrollLeft: 0,
    startX: 0,
  });
  const mouseDragCleanupRef = useRef<(() => void) | null>(null);
  const suppressClickRef = useRef(false);
  const [isCarouselDragging, setIsCarouselDragging] = useState(false);
  const activeProduct = accountProducts[activeIndex] ?? accountProducts[0];
  const config = getCountryConfig(country);
  const transactionProfileIndex = activeProduct ? getAccountTransactionProfileIndex(activeProduct, activeIndex) : 0;
  const transactions = useMemo(
    () => getAccountTransactions(
      country,
      transactionProfileIndex,
      config.currency,
    ),
    [config.currency, country, transactionProfileIndex],
  );
  const normalizedTransactionSearch = transactionSearch.trim().toLowerCase();
  const filteredTransactions = useMemo(() => {
    if (!normalizedTransactionSearch) return transactions;

    return transactions.filter((transaction) => {
      const formattedAmount = `${transaction.amount < 0 ? "-" : "+"} ${formatMoneyNumber(
        Math.abs(transaction.amount),
        country,
      )} ${config.currency}`;
      const searchableText = [
        transaction.label,
        transaction.details,
        transaction.category,
        transaction.status,
        transaction.day,
        transaction.month,
        transaction.monthTitle,
        formattedAmount,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedTransactionSearch);
    });
  }, [config.currency, country, normalizedTransactionSearch, transactions]);
  const transactionGroups = useMemo(
    () => groupAccountTransactionsByMonth(filteredTransactions),
    [filteredTransactions],
  );
  const hasTransactionSearch = normalizedTransactionSearch.length > 0;
  const headerThreshold = 64;
  const largeTitleOpacity = 1 - headerProgress * 0.9;

  const handlePageScroll = (event: UIEvent<HTMLDivElement>) => {
    const progress = Math.min(1, Math.max(0, event.currentTarget.scrollTop / headerThreshold));
    setHeaderProgress(progress);
  };

  const activateTransactionSearch = () => {
    const page = pageRef.current;
    const searchContainer = searchContainerRef.current;
    if (!page || !searchContainer) return;

    page.scrollTo({
      top: Math.max(0, searchContainer.offsetTop - ACCOUNT_DETAIL_HEADER_HEIGHT),
      behavior: "smooth",
    });
  };

  const handleTransactionSearchChange = (nextValue: string) => {
    setTransactionSearch(nextValue);
    activateTransactionSearch();
  };

  const clampAccountIndex = (index: number) => (
    Math.max(0, Math.min(accountProducts.length - 1, index))
  );

  const clampCarouselScrollLeft = (scrollLeft: number) => {
    const carousel = carouselRef.current;
    if (!carousel) return scrollLeft;

    const maxScrollLeft = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
    return Math.max(0, Math.min(maxScrollLeft, scrollLeft));
  };

  const getAccountScrollLeft = (index: number) => {
    const carousel = carouselRef.current;
    const nextIndex = clampAccountIndex(index);
    const cardOffsetLeft = ACCOUNT_CAROUSEL_EDGE_GUTTER + nextIndex * ACCOUNT_CARD_STEP;

    if (!carousel || nextIndex === 0) {
      return 0;
    }

    if (nextIndex === accountProducts.length - 1) {
      return clampCarouselScrollLeft(
        cardOffsetLeft + ACCOUNT_CARD_WIDTH + ACCOUNT_CAROUSEL_EDGE_GUTTER - carousel.clientWidth,
      );
    }

    return clampCarouselScrollLeft(
      cardOffsetLeft - (carousel.clientWidth - ACCOUNT_CARD_WIDTH) / 2,
    );
  };

  const getNearestAccountIndex = (scrollLeft: number) => {
    if (accountProducts.length <= 1) return 0;

    return accountProducts.reduce((nearestIndex, _product, index) => {
      const nearestDistance = Math.abs(scrollLeft - getAccountScrollLeft(nearestIndex));
      const nextDistance = Math.abs(scrollLeft - getAccountScrollLeft(index));
      return nextDistance < nearestDistance ? index : nearestIndex;
    }, 0);
  };

  const scrollToAccount = (index: number, behavior: ScrollBehavior = "smooth") => {
    const nextIndex = clampAccountIndex(index);
    setActiveIndex(nextIndex);
    carouselRef.current?.scrollTo({
      left: getAccountScrollLeft(nextIndex),
      behavior,
    });
  };

  const handleCarouselScroll = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    setActiveIndex(getNearestAccountIndex(carousel.scrollLeft));
  };

  const snapCarouselToNearestAccount = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    scrollToAccount(getNearestAccountIndex(carousel.scrollLeft));
  };

  const removeMouseDragListeners = () => {
    mouseDragCleanupRef.current?.();
    mouseDragCleanupRef.current = null;
  };

  const beginCarouselDrag = (
    clientX: number,
    input: CarouselDragState["input"],
    pointerId: number | null = null,
  ) => {
    const carousel = carouselRef.current;
    if (!carousel || dragStateRef.current.input) return false;

    dragStateRef.current = {
      didMove: false,
      input,
      pointerId,
      startScrollLeft: carousel.scrollLeft,
      startX: clientX,
    };

    return true;
  };

  const moveCarouselDrag = (clientX: number) => {
    const carousel = carouselRef.current;
    const dragState = dragStateRef.current;
    if (!carousel || !dragState.input) return false;

    const deltaX = clientX - dragState.startX;
    if (!dragState.didMove && Math.abs(deltaX) < 4) return false;

    dragState.didMove = true;
    suppressClickRef.current = true;
    setIsCarouselDragging(true);
    carousel.scrollLeft = dragState.startScrollLeft - deltaX;
    return true;
  };

  const finishCarouselDrag = () => {
    const didMove = dragStateRef.current.didMove;

    if (didMove) {
      snapCarouselToNearestAccount();
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 80);
    }

    resetCarouselDrag();
  };

  const resetCarouselDrag = () => {
    removeMouseDragListeners();
    dragStateRef.current = {
      didMove: false,
      input: null,
      pointerId: null,
      startScrollLeft: 0,
      startX: 0,
    };
    setIsCarouselDragging(false);
  };

  const handleCarouselPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    if (beginCarouselDrag(event.clientX, "pointer", event.pointerId)) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const handleCarouselPointerMove = (event: PointerEvent<HTMLElement>) => {
    const dragState = dragStateRef.current;
    if (dragState.input !== "pointer" || dragState.pointerId !== event.pointerId) return;

    if (moveCarouselDrag(event.clientX)) {
      event.preventDefault();
    }
  };

  const handleCarouselPointerUp = (event: PointerEvent<HTMLElement>) => {
    const dragState = dragStateRef.current;
    if (dragState.input !== "pointer" || dragState.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    finishCarouselDrag();
  };

  const handleCarouselPointerCancel = (event: PointerEvent<HTMLElement>) => {
    if (dragStateRef.current.input !== "pointer" || dragStateRef.current.pointerId !== event.pointerId) return;
    resetCarouselDrag();
    suppressClickRef.current = false;
  };

  const handleCarouselMouseDown = (event: MouseEvent<HTMLElement>) => {
    if (event.button !== 0 || !beginCarouselDrag(event.clientX, "mouse")) return;

    const handleMouseMove = (mouseEvent: globalThis.MouseEvent) => {
      if (dragStateRef.current.input !== "mouse") return;

      if (mouseEvent.buttons !== 1) {
        finishCarouselDrag();
        return;
      }

      if (moveCarouselDrag(mouseEvent.clientX)) {
        mouseEvent.preventDefault();
      }
    };

    const handleMouseUp = () => {
      if (dragStateRef.current.input === "mouse") {
        finishCarouselDrag();
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    mouseDragCleanupRef.current = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  };

  const handleCarouselClickCapture = (event: MouseEvent<HTMLElement>) => {
    if (!suppressClickRef.current) return;

    event.preventDefault();
    event.stopPropagation();
  };

  const handleCarouselDragStart = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
  };

  const handleAccountCardKeyDown = (event: KeyboardEvent<HTMLElement>, index: number) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    scrollToAccount(index);
  };

  useEffect(() => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollTo({ left: getAccountScrollLeft(activeIndex) });
  }, []);

  useEffect(() => removeMouseDragListeners, []);

  if (!activeProduct) {
    return (
      <div className="h-full w-full bg-[var(--uc-surface)]">
        <CollapsingAccountHeader title={t("runtime.accounts.title", "Accounts")} progress={1} onBack={onBack} />
      </div>
    );
  }

  return (
    <div
      ref={pageRef}
      className="h-full w-full overflow-y-auto overflow-x-hidden bg-[var(--uc-surface)] pb-[32px] scrollbar-hide"
      onScroll={handlePageScroll}
    >
      <CollapsingAccountHeader title={t("runtime.accounts.title", "Accounts")} progress={headerProgress} onBack={onBack} />

      <div className="bg-[var(--uc-app-bg)]">
        <div
          className="flex w-[375px] items-center px-[16px] py-[8px]"
          style={{ opacity: largeTitleOpacity }}
        >
          <h1 className="font-['UniCredit',sans-serif] text-[28px] font-bold leading-normal text-[var(--uc-text)]">
            {t("runtime.accounts.title", "Accounts")}
          </h1>
        </div>

        <div
          ref={carouselRef}
          onScroll={handleCarouselScroll}
          onPointerDown={handleCarouselPointerDown}
          onPointerMove={handleCarouselPointerMove}
          onPointerUp={handleCarouselPointerUp}
          onPointerCancel={handleCarouselPointerCancel}
          onMouseDown={handleCarouselMouseDown}
          onClickCapture={handleCarouselClickCapture}
          className={`overflow-x-auto overflow-y-visible pt-[16px] pb-[34px] scrollbar-hide select-none ${
            isCarouselDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
          }}
        >
          <div
            className="flex gap-[16px]"
            style={{
              paddingLeft: `${ACCOUNT_CAROUSEL_EDGE_GUTTER}px`,
              paddingRight: 0,
            }}
          >
            {accountProducts.map((product, index) => {
              const availableParts = splitFormattedNumber(formatMoneyNumber(product.balance, country));
              const displayedAvailable = maskAmountParts(
                { ...availableParts, currency: config.currency },
                amountsHidden,
              );
              const isActiveCard = index === activeIndex;

              return (
                <div
                  key={product.id}
                  className="flex w-[311px] shrink-0 cursor-pointer items-center justify-center"
                  role="button"
                  tabIndex={0}
                  onClick={() => scrollToAccount(index)}
                  onClickCapture={handleCarouselClickCapture}
                  onDragStart={handleCarouselDragStart}
                  onKeyDown={(event) => handleAccountCardKeyDown(event, index)}
                  onMouseDown={handleCarouselMouseDown}
                  onPointerCancel={handleCarouselPointerCancel}
                  onPointerDown={handleCarouselPointerDown}
                  onPointerMove={handleCarouselPointerMove}
                  onPointerUp={handleCarouselPointerUp}
                  aria-pressed={isActiveCard}
                  data-account-carousel-card-state={isActiveCard ? "active" : "inactive"}
                  data-account-carousel-visual-height={
                    isActiveCard
                      ? ACCOUNT_CARD_HEIGHT
                      : ACCOUNT_CARD_HEIGHT - ACCOUNT_CARD_INACTIVE_VERTICAL_INSET * 2
                  }
                  style={{ height: ACCOUNT_CARD_HEIGHT }}
                >
                  <div
                    className="pointer-events-none w-[311px] transition-[transform,opacity,filter] duration-300 ease-out will-change-transform"
                    style={{
                      filter: isActiveCard ? "none" : "saturate(0.96) brightness(0.99)",
                      opacity: isActiveCard ? 1 : 0.86,
                      transform: isActiveCard ? "scaleY(1)" : `scaleY(${ACCOUNT_CARD_INACTIVE_SCALE_Y})`,
                      transformOrigin: "center",
                    }}
                  >
                    <AccountBalanceCard
                      account={getProductAccountIdentity(product)}
                      availableInteger={displayedAvailable.integer}
                      availableDecimals={displayedAvailable.decimals}
                      currency={displayedAvailable.currency}
                      currentBalance={maskFormattedAmount(formatMoneyNumber(product.balance * 0.92, country), amountsHidden)}
                      active={isActiveCard}
                      showSubAccount={false}
                    />
                  </div>
                </div>
              );
            })}
            <div aria-hidden="true" className="w-[16px] shrink-0" />
          </div>
        </div>

        <div className="-mt-[16px]">
          <AccountCarouselIndicator
            count={accountProducts.length}
            activeIndex={activeIndex}
            onSelect={scrollToAccount}
          />
        </div>

        <AccountActionBar onDetailsClick={() => onDetailsClick(activeProduct)} onOptionsClick={onOptionsClick} />
      </div>

      <div className="bg-[var(--uc-surface)]">
        <div
          ref={searchContainerRef}
          className="sticky z-20 bg-[var(--uc-surface)] px-[16px] pt-[24px]"
          style={{ top: `${ACCOUNT_DETAIL_HEADER_HEIGHT}px` }}
        >
          <AccountSearchBar
            value={transactionSearch}
            onClick={activateTransactionSearch}
            onValueChange={handleTransactionSearchChange}
            onFocus={activateTransactionSearch}
          />
        </div>

        <div className="pt-[24px]">
          {transactionGroups.length > 0 ? (
            transactionGroups.map((group, index) => (
              <div key={group.monthTitle} className={index > 0 ? "pt-[16px]" : undefined}>
                <AccountTransactionMonthDivider
                  title={group.monthTitle}
                  total={formatMoneyNumber(group.monthlyTotal, country)}
                  currency={config.currency}
                />

                <div className="pt-[16px]">
                  {group.transactions.map((transaction) => (
                    <AccountTransactionRow
                      key={transaction.id}
                      transaction={transaction}
                      formattedAmount={formatMoneyNumber(Math.abs(transaction.amount), country)}
                      currency={config.currency}
                      onClick={(selectedTransaction) => onTransactionClick?.(selectedTransaction, activeProduct)}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="px-[16px] py-[32px] text-center font-['UniCredit',sans-serif] text-[16px] font-bold leading-normal text-[var(--uc-text-muted)]">
              {hasTransactionSearch ? t("runtime.accounts.noTransactionsFound", "No transactions found") : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
