import { useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent, KeyboardEvent, MouseEvent, PointerEvent, UIEvent } from "react";
import AccountCarouselIndicator from "@/app/components/accounts/AccountCarouselIndicator";
import AccountActionBar from "@/app/components/accounts/AccountActionBar";
import AccountTransactionRow from "@/app/components/accounts/AccountTransactionRow";
import AccountTransactionMonthDivider from "@/app/components/accounts/AccountTransactionMonthDivider";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import { AppIcon } from "@/app/components/icons";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useDemo } from "@/app/state/demoStore";
import { getCountryConfig, formatMoneyNumber } from "@/app/registry/countryConfig";
import { maskFormattedAmount } from "@/app/utils/amountPrivacy";
import { formatMaskedCardNumber } from "@/app/utils/cardNumber";
import { useProducts } from "@/hooks/useProducts";
import { getAccountTransactions, groupAccountTransactionsByMonth } from "@/data/accountDetails";
import type { AccountTransaction } from "@/data/accountDetails";
import type { Product } from "@/data/products";
import Card, { type CardVariant } from "@/app/components/cards/Card";
import UserEventCard from "@/app/components/cards/UserEventCard";

interface CardDetailScreenProps {
  selectedCardId?: string | null;
  onBack: () => void;
  onCardDetailsClick?: (card: Product) => void;
  onCardOptionsClick?: (card: Product) => void;
  onTransactionClick?: (transaction: AccountTransaction, product: Product) => void;
  onHelpClick?: () => void;
  aiOpportunityNudge?: {
    title: string;
    body: string;
    ctaLabel: string;
  } | null;
  onAiOpportunityClick?: () => void;
}

const CARD_WIDTH = 219;
const CARD_HEIGHT = 138;
const CARD_GAP = 24;
const CARD_STEP = CARD_WIDTH + CARD_GAP;
const CAROUSEL_EDGE_GUTTER = 24;
const CARD_INACTIVE_VERTICAL_INSET = 12;
const CARD_INACTIVE_SCALE_Y = (CARD_HEIGHT - CARD_INACTIVE_VERTICAL_INSET * 2) / CARD_HEIGHT;
const CARD_DETAIL_HEADER_HEIGHT = 102;

type CarouselDragState = {
  didMove: boolean;
  input: "mouse" | "pointer" | null;
  pointerId: number | null;
  startScrollLeft: number;
  startX: number;
};

function isCardProduct(product: Product): boolean {
  return product.type === "debit_card" || product.type === "credit_card";
}

function getCardVariant(product: Product): CardVariant {
  if (product.type === "credit_card") {
    return "mc-credit-partner-standard";
  }

  if (product.type === "debit_card" && (product.id.endsWith("-2") || product.id === "card-3")) {
    return "mc-debit-standard";
  }

  return "mc-debit-gold";
}

function getCardHolderName(): string {
  return "PETER JAGODIĆ";
}

function AiOpportunityGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <path
        d="M36 0C40.1009 27.3466 44.6534 31.8991 72 36C44.6534 40.1009 40.1009 44.6534 36 72C31.8991 44.6534 27.3466 40.1009 0 36C27.3466 31.8991 31.8991 27.3466 36 0Z"
        fill="currentColor"
      />
      <path
        d="M62.1468 4.5459C63.0102 10.3031 63.9686 11.2615 69.7258 12.1248C63.9686 12.9882 63.0102 13.9466 62.1468 19.7038C61.2835 13.9466 60.3251 12.9882 54.5679 12.1248C60.3251 11.2615 61.2835 10.3031 62.1468 4.5459Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CollapsingCardHeader({
  progress,
  onBack,
  onHelpClick,
}: {
  progress: number;
  onBack: () => void;
  onHelpClick?: () => void;
}) {
  return (
    <div className="sticky top-0 z-30 bg-[var(--uc-app-bg)] pt-[var(--uc-phone-top-reserve,54px)]">
      <div className="grid h-[48px] grid-cols-[40px_1fr_40px] items-center px-[8px] pt-[8px]">
        <button
          onClick={onBack}
          className="flex h-[40px] w-[40px] items-center justify-center"
          aria-label="Back"
        >
          <AppIcon name="back-heavy" color="var(--uc-text)" />
        </button>
        <h1
          className="uc-type-n4-strong pointer-events-none truncate text-center text-[var(--uc-text)]"
          style={{
            opacity: progress,
            transform: `translateY(${(1 - progress) * 6}px)`,
          }}
        >
          Cards
        </h1>
        <button
          onClick={onHelpClick}
          className="flex h-[40px] w-[40px] items-center justify-center"
          aria-label="Help"
        >
          <AppIcon name="help-circle" color="var(--uc-text)" />
        </button>
      </div>
    </div>
  );
}

export default function CardDetailScreen({
  selectedCardId,
  onBack,
  onCardDetailsClick,
  onCardOptionsClick,
  onTransactionClick,
  onHelpClick,
  aiOpportunityNudge = null,
  onAiOpportunityClick,
}: CardDetailScreenProps) {
  const { country, amountsHidden } = useDemo();
  const { t } = useLanguage();
  const { categories } = useProducts();

  const cardProducts = useMemo(
    () => categories.flatMap((cat) => cat.products).filter(isCardProduct),
    [categories],
  );

  const selectedIndex = Math.max(
    0,
    cardProducts.findIndex((p) => p.id === selectedCardId),
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
  const [isAiOpportunityDismissed, setIsAiOpportunityDismissed] = useState(false);

  const activeCard = cardProducts[activeIndex] ?? cardProducts[0];
  const config = getCountryConfig(country);

  // Use transaction profile 0 for all cards (card transactions)
  const transactions = useMemo(
    () => getAccountTransactions(country, 0, config.currency),
    [config.currency, country],
  );

  const normalizedSearch = transactionSearch.trim().toLowerCase();
  const filteredTransactions = useMemo(() => {
    if (!normalizedSearch) return transactions;
    return transactions.filter((tx) => {
      const formattedAmount = `${tx.amount < 0 ? "-" : "+"} ${formatMoneyNumber(Math.abs(tx.amount), country)} ${config.currency}`;
      return [tx.label, tx.details, tx.category, tx.status, tx.day, tx.month, tx.monthTitle, formattedAmount]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [config.currency, country, normalizedSearch, transactions]);

  const transactionGroups = useMemo(
    () => groupAccountTransactionsByMonth(filteredTransactions),
    [filteredTransactions],
  );

  const hasSearch = normalizedSearch.length > 0;
  const headerThreshold = 64;
  const largeTitleOpacity = 1 - headerProgress * 0.9;
  const showAiOpportunityNudge = Boolean(aiOpportunityNudge) && !isAiOpportunityDismissed;

  // ── Free to Spend amount ─────────────────────────────────────────
  // For credit cards use availableCredit; for debit use balance (treat as positive display)
  const freeToSpendAmount = useMemo(() => {
    if (!activeCard) return "0";
    if (activeCard.type === "credit_card" && "availableCredit" in activeCard) {
      return formatMoneyNumber((activeCard as import("@/data/products").CreditCard).availableCredit, country);
    }
    return formatMoneyNumber(Math.abs(activeCard.balance), country);
  }, [activeCard, country]);

  const maskedFreeToSpend = maskFormattedAmount(freeToSpendAmount, amountsHidden);

  // ── Scroll handlers ──────────────────────────────────────────────
  const handlePageScroll = (event: UIEvent<HTMLDivElement>) => {
    const progress = Math.min(1, Math.max(0, event.currentTarget.scrollTop / headerThreshold));
    setHeaderProgress(progress);
  };

  const activateSearch = () => {
    const page = pageRef.current;
    const searchContainer = searchContainerRef.current;
    if (!page || !searchContainer) return;
    page.scrollTo({ top: Math.max(0, searchContainer.offsetTop - CARD_DETAIL_HEADER_HEIGHT), behavior: "smooth" });
  };

  const handleSearchChange = (nextValue: string) => {
    setTransactionSearch(nextValue);
    activateSearch();
  };

  // ── Carousel helpers ─────────────────────────────────────────────
  const clampIndex = (index: number) => Math.max(0, Math.min(cardProducts.length - 1, index));

  const clampScrollLeft = (scrollLeft: number) => {
    const carousel = carouselRef.current;
    if (!carousel) return scrollLeft;
    const maxScrollLeft = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
    return Math.max(0, Math.min(maxScrollLeft, scrollLeft));
  };

  const getCardScrollLeft = (index: number) => {
    const carousel = carouselRef.current;
    const nextIndex = clampIndex(index);
    const cardOffsetLeft = CAROUSEL_EDGE_GUTTER + nextIndex * CARD_STEP;

    if (!carousel || nextIndex === 0) return 0;

    if (nextIndex === cardProducts.length - 1) {
      return clampScrollLeft(cardOffsetLeft + CARD_WIDTH + CAROUSEL_EDGE_GUTTER - carousel.clientWidth);
    }

    return clampScrollLeft(cardOffsetLeft - (carousel.clientWidth - CARD_WIDTH) / 2);
  };

  const getNearestIndex = (scrollLeft: number) => {
    if (cardProducts.length <= 1) return 0;
    return cardProducts.reduce((nearestIdx, _p, idx) => {
      const nearestDist = Math.abs(scrollLeft - getCardScrollLeft(nearestIdx));
      const nextDist = Math.abs(scrollLeft - getCardScrollLeft(idx));
      return nextDist < nearestDist ? idx : nearestIdx;
    }, 0);
  };

  const scrollToCard = (index: number, behavior: ScrollBehavior = "smooth") => {
    const nextIndex = clampIndex(index);
    setActiveIndex(nextIndex);
    carouselRef.current?.scrollTo({ left: getCardScrollLeft(nextIndex), behavior });
  };

  const handleCarouselScroll = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    setActiveIndex(getNearestIndex(carousel.scrollLeft));
  };

  const snapToNearest = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    scrollToCard(getNearestIndex(carousel.scrollLeft));
  };

  const removeMouseListeners = () => {
    mouseDragCleanupRef.current?.();
    mouseDragCleanupRef.current = null;
  };

  const beginDrag = (clientX: number, input: CarouselDragState["input"], pointerId: number | null = null) => {
    const carousel = carouselRef.current;
    if (!carousel || dragStateRef.current.input) return false;
    dragStateRef.current = { didMove: false, input, pointerId, startScrollLeft: carousel.scrollLeft, startX: clientX };
    return true;
  };

  const moveDrag = (clientX: number) => {
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

  const finishDrag = () => {
    if (dragStateRef.current.didMove) {
      snapToNearest();
      window.setTimeout(() => { suppressClickRef.current = false; }, 80);
    }
    resetDrag();
  };

  const resetDrag = () => {
    removeMouseListeners();
    dragStateRef.current = { didMove: false, input: null, pointerId: null, startScrollLeft: 0, startX: 0 };
    setIsCarouselDragging(false);
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (beginDrag(event.clientX, "pointer", event.pointerId)) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const ds = dragStateRef.current;
    if (ds.input !== "pointer" || ds.pointerId !== event.pointerId) return;
    if (moveDrag(event.clientX)) event.preventDefault();
  };

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    const ds = dragStateRef.current;
    if (ds.input !== "pointer" || ds.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    finishDrag();
  };

  const handlePointerCancel = (event: PointerEvent<HTMLElement>) => {
    if (dragStateRef.current.input !== "pointer" || dragStateRef.current.pointerId !== event.pointerId) return;
    resetDrag();
    suppressClickRef.current = false;
  };

  const handleMouseDown = (event: MouseEvent<HTMLElement>) => {
    if (event.button !== 0 || !beginDrag(event.clientX, "mouse")) return;

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (dragStateRef.current.input !== "mouse") return;
      if (e.buttons !== 1) { finishDrag(); return; }
      if (moveDrag(e.clientX)) e.preventDefault();
    };

    const handleMouseUp = () => {
      if (dragStateRef.current.input === "mouse") finishDrag();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    mouseDragCleanupRef.current = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  };

  const handleClickCapture = (event: MouseEvent<HTMLElement>) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragStart = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>, index: number) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    scrollToCard(index);
  };

  useEffect(() => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollTo({ left: getCardScrollLeft(activeIndex) });
  }, []);

  useEffect(() => {
    setIsAiOpportunityDismissed(false);
  }, [activeCard?.id, aiOpportunityNudge?.title]);

  useEffect(() => removeMouseListeners, []);

  if (!activeCard) {
    return (
      <div className="h-full w-full bg-[var(--uc-surface)]">
        <CollapsingCardHeader progress={1} onBack={onBack} onHelpClick={onHelpClick} />
      </div>
    );
  }

  const cardQuickActions = [
    { id: "card-details", iconName: "account-details" as const, label: t("runtime.cards.actions.details", "Card Details"), onClick: () => onCardDetailsClick?.(activeCard) },
    { id: "options", iconName: "account-options" as const, label: t("runtime.cards.actions.options", "Options"), onClick: () => onCardOptionsClick?.(activeCard) },
    { id: "block-card", iconName: "block-card" as const, label: t("runtime.cards.actions.blockCard", "Block Card") },
    { id: "view-pin", iconName: "view-pin" as const, label: t("runtime.cards.actions.viewPin", "View PIN") },
  ];

  return (
    <div
      ref={pageRef}
      className="h-full w-full overflow-y-auto overflow-x-hidden bg-[var(--uc-surface)] pb-[32px] scrollbar-hide"
      onScroll={handlePageScroll}
    >
      <CollapsingCardHeader progress={headerProgress} onBack={onBack} onHelpClick={onHelpClick} />

      {/* ── Top section: app-bg color ───────────────────────────── */}
      <div className="bg-[var(--uc-app-bg)]">
        {/* Large title */}
        <div
          className="flex w-[375px] items-center px-[16px] py-[8px]"
          style={{ opacity: largeTitleOpacity }}
        >
          <h1 className="uc-type-h1 text-[var(--uc-text)]">Cards</h1>
        </div>

        {/* Card holder name + masked number */}
        <div className="flex flex-col gap-[2px] px-[24px] pt-[4px] pb-[8px]">
          <span className="text-[14px] font-bold leading-none text-[var(--uc-text)]" style={{ fontFamily: "UniCredit, sans-serif" }}>
            {getCardHolderName()}
          </span>
          <span className="text-[18px] font-bold leading-none text-[var(--uc-text)]" style={{ fontFamily: "UniCredit, sans-serif" }}>
            {formatMaskedCardNumber(activeCard.accountNumber)}
          </span>
        </div>

        {/* Card carousel */}
        <div
          ref={carouselRef}
          onScroll={handleCarouselScroll}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onMouseDown={handleMouseDown}
          onClickCapture={handleClickCapture}
          className={`overflow-x-auto overflow-y-visible pt-[8px] pb-[24px] scrollbar-hide select-none ${
            isCarouselDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
        >
          <div className="flex gap-[24px]" style={{ paddingLeft: `${CAROUSEL_EDGE_GUTTER}px` }}>
            {cardProducts.map((card, index) => {
              const isActive = index === activeIndex;
              return (
                <div
                  key={card.id}
                  className="flex shrink-0 cursor-pointer items-center justify-center"
                  role="button"
                  tabIndex={0}
                  onClick={() => scrollToCard(index)}
                  onClickCapture={handleClickCapture}
                  onDragStart={handleDragStart}
                  onKeyDown={(e) => handleCardKeyDown(e, index)}
                  onMouseDown={handleMouseDown}
                  onPointerCancel={handlePointerCancel}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  aria-pressed={isActive}
                  style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
                >
                  <div
                    className="pointer-events-none transition-[transform,opacity,filter] duration-300 ease-out will-change-transform"
                    style={{
                      width: CARD_WIDTH,
                      height: CARD_HEIGHT,
                      filter: isActive ? "none" : "saturate(0.7) brightness(0.92)",
                      opacity: isActive ? 1 : 0.72,
                      transform: isActive ? "scaleY(1)" : `scaleY(${CARD_INACTIVE_SCALE_Y})`,
                      transformOrigin: "center",
                    }}
                  >
                    <div
                      className="overflow-hidden"
                      style={{
                        width: CARD_WIDTH,
                        height: CARD_HEIGHT,
                        borderRadius: 5.67,
                        boxShadow: "0 11.265px 11.265px rgba(0,0,0,0.2)",
                      }}
                    >
                      <Card
                        ariaLabel={card.type === "debit_card" ? "Debit card" : "Credit card"}
                        size="large"
                        variant={getCardVariant(card)}
                        style={{
                          width: CARD_WIDTH,
                          height: CARD_HEIGHT,
                          borderRadius: 5.67,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            <div aria-hidden="true" className="shrink-0" style={{ width: CAROUSEL_EDGE_GUTTER }} />
          </div>
        </div>

        {/* Carousel indicator */}
        <div className="-mt-[8px]">
          <AccountCarouselIndicator
            count={cardProducts.length}
            activeIndex={activeIndex}
            onSelect={scrollToCard}
          />
        </div>

        {/* Free to Spend + Show Card Details */}
        <div className="flex flex-col items-center gap-[16px] px-[24px] pt-[16px] pb-[16px]">
          <div className="flex w-full flex-col items-start gap-[2px]">
            <span className="uc-type-n5-strong text-[var(--uc-text-muted)]">
              {t("runtime.cards.freeToSpend", "Free To Spend")}
            </span>
            <span className="uc-type-n1 text-[var(--uc-text)] leading-none">
              {maskedFreeToSpend}{" "}
              <span className="uc-type-n2">{config.currency}</span>
            </span>
          </div>

          <button
            type="button"
            className="uc-type-n5-strong py-[24px] text-[var(--uc-action)] tracking-[0.08em] uppercase"
          >
            {t("runtime.cards.showCardDetails", "Show Card Details")}
          </button>
        </div>

        {/* Quick actions */}
        <AccountActionBar items={cardQuickActions} align="between" />
      </div>

      {/* ── Transactions section ─────────────────────────────────── */}
      <div className="bg-[var(--uc-surface)]">
        {showAiOpportunityNudge && aiOpportunityNudge ? (
          <div className="bg-gradient-to-b from-[var(--uc-app-bg)] to-[var(--uc-surface)] px-[16px] pt-[18px] pb-[18px]">
            <UserEventCard
              title={aiOpportunityNudge.title}
              description={aiOpportunityNudge.body}
              actionLabel={aiOpportunityNudge.ctaLabel}
              onActionClick={onAiOpportunityClick}
              showOptions
              onOptionsClick={() => setIsAiOpportunityDismissed(true)}
              optionsAriaLabel="Dismiss AI suggestion"
              optionsIconName="close-x"
              optionsIconColor="var(--uc-text-muted)"
              className="shadow-[0_8px_22px_rgba(0,0,0,0.12)]"
              iconNode={
                <span className="text-[var(--uc-static-white)]">
                  <AiOpportunityGlyph />
                </span>
              }
            />
          </div>
        ) : null}

        <div
          ref={searchContainerRef}
          className="sticky z-20 bg-[var(--uc-surface)] px-[16px] pt-[24px]"
          style={{ top: `${CARD_DETAIL_HEADER_HEIGHT}px` }}
        >
          <AccountSearchBar
            value={transactionSearch}
            onClick={activateSearch}
            onValueChange={handleSearchChange}
            onFocus={activateSearch}
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
                  {group.transactions.map((tx) => (
                    <AccountTransactionRow
                      key={tx.id}
                      transaction={tx}
                      formattedAmount={formatMoneyNumber(Math.abs(tx.amount), country)}
                      currency={config.currency}
                      onClick={(selectedTx) => onTransactionClick?.(selectedTx, activeCard)}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="uc-type-n4-strong px-[16px] py-[32px] text-center text-[var(--uc-text-muted)]">
              {hasSearch ? t("runtime.accounts.noTransactionsFound", "No transactions found") : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
