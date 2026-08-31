import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { useCollapsingHeader } from "@/hooks/useCollapsingHeader";
import { useDragCarousel } from "@/hooks/useDragCarousel";
import AccountCarouselIndicator from "@/app/components/accounts/AccountCarouselIndicator";
import AccountActionBar from "@/app/components/accounts/AccountActionBar";
import AccountTransactionRow from "@/app/components/accounts/AccountTransactionRow";
import AccountTransactionMonthDivider from "@/app/components/accounts/AccountTransactionMonthDivider";
import { transactionGroupCardClassName } from "@/app/components/accounts/transactionGroupCard";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import { AppIcon } from "@/app/components/icons";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useDemo } from "@/app/state/demoStore";
import { getCountryConfig } from "@/app/registry/countryConfig";
import { formatEvo2027Number, formatEvo2027SignedNumber } from "@/app/utils/evo2027Formatting";
import { maskFormattedAmount } from "@/app/utils/amountPrivacy";
import { formatMaskedCardNumber } from "@/app/utils/cardNumber";
import { useProducts } from "@/hooks/useProducts";
import { getCardTransactions, groupAccountTransactionsByDate, groupAccountTransactionsByMonth } from "@/data/accountDetails";
import type { AccountTransaction } from "@/data/accountDetails";
import type { CreditCard, DebitCard, Product } from "@/data/products";
import { getCardMerchantEnrichment } from "@/app/components/merchants/merchantEnrichment";
import type { CardTransactionMerchantEnrichment } from "@/app/screens/payments/DomesticPaymentFlowScreens";
import Card, { type CardVariant } from "@/app/components/cards/Card";
import UserEventCard from "@/app/components/cards/UserEventCard";
import FaceIdAnimation from "@/app/components/FaceIdAnimation";
import CardSensitiveDetailsScreen from "@/app/screens/cards/CardSensitiveDetailsScreen";

interface CardDetailScreenProps {
  selectedCardId?: string | null;
  creditLimitOverrides?: Readonly<Record<string, number>>;
  onBack: () => void;
  onCardDetailsClick?: (card: Product) => void;
  onShowCardDetailsClick?: (card: Product) => void;
  onCardOptionsClick?: (card: Product) => void;
  onTransactionClick?: (
    transaction: AccountTransaction,
    product: Product,
    merchantEnrichment?: CardTransactionMerchantEnrichment,
  ) => void;
  onHelpClick?: () => void;
  aiOpportunityNudge?: {
    title: string;
    body: string;
    ctaLabel: string;
  } | null;
  onAiOpportunityClick?: () => void;
  /** Optional presentation-only overrides used by Flow Library specifications. */
  transactionRowPresentation?: {
    displayLabel?: (transaction: AccountTransaction) => string | undefined;
    leadingVisual?: (transaction: AccountTransaction) => ReactNode | undefined;
    transactionFilter?: (transaction: AccountTransaction) => boolean;
  };
}

const CARD_WIDTH = 219;
const CARD_HEIGHT = 138;
const CARD_GAP = 24;
const CARD_STEP = CARD_WIDTH + CARD_GAP;
const CAROUSEL_EDGE_GUTTER = 24;
const CARD_INACTIVE_VERTICAL_INSET = 12;
const CARD_INACTIVE_SCALE_Y = (CARD_HEIGHT - CARD_INACTIVE_VERTICAL_INSET * 2) / CARD_HEIGHT;
const CARD_DETAIL_HEADER_HEIGHT = 102;

function isCardProduct(product: Product): product is DebitCard | CreditCard {
  return product.type === "debit_card" || product.type === "credit_card";
}

function getCardVariant(product: Product, isEvo2027: boolean): CardVariant {
  if (product.type === "credit_card") {
    return "mc-credit-partner-standard";
  }

  if (isEvo2027 && product.type === "debit_card" && product.currency === "EUR") {
    return "mc-virtual-standard-violet";
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
  creditLimitOverrides = {},
  onBack,
  onCardDetailsClick,
  onShowCardDetailsClick,
  onCardOptionsClick,
  onTransactionClick,
  onHelpClick,
  aiOpportunityNudge = null,
  onAiOpportunityClick,
  transactionRowPresentation,
}: CardDetailScreenProps) {
  const { country, amountsHidden, release } = useDemo();
  const { t } = useLanguage();
  const { categories } = useProducts();

  const cardProducts = useMemo(
    () => categories
      .flatMap((cat) => cat.products)
      .filter(isCardProduct)
      .map((card) => {
        if (card.type !== "credit_card") return card;
        const overriddenLimit = creditLimitOverrides[card.id];
        if (overriddenLimit == null || overriddenLimit === card.creditLimit) return card;
        return {
          ...card,
          creditLimit: overriddenLimit,
          availableCredit: card.availableCredit + (overriddenLimit - card.creditLimit),
        };
      }),
    [categories, creditLimitOverrides],
  );

  const selectedIndex = Math.max(
    0,
    cardProducts.findIndex((p) => p.id === selectedCardId),
  );
  const [activeIndex, setActiveIndex] = useState(selectedIndex === -1 ? 0 : selectedIndex);
  const { progress: headerProgress, onScroll: handlePageScroll } = useCollapsingHeader(64);
  const [transactionSearch, setTransactionSearch] = useState("");
  const pageRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [isAiOpportunityDismissed, setIsAiOpportunityDismissed] = useState(false);
  const [isCardDetailsFaceIdVisible, setIsCardDetailsFaceIdVisible] = useState(false);
  const [isSensitiveCardDetailsVisible, setIsSensitiveCardDetailsVisible] = useState(false);

  const activeCard = cardProducts[activeIndex] ?? cardProducts[0];
  const config = getCountryConfig(country);
  /** Evo 2027 groups each month into the same card the home activity list uses. */
  const usesEvoGroupCards = release === "release-future-evo-2027";
  const categoryIconVariant = release === "release-future-evo-2027" ? "category-circle" : "glyph";
  const currentAccounts = useMemo(
    () => categories.flatMap((category) => category.products).filter((product) => product.type === "current_account"),
    [categories],
  );
  const firstDebitCard = cardProducts.find((card) => card.type === "debit_card");
  const firstCurrentAccountId = currentAccounts[0]?.id;
  const linkedAccountIndex = activeCard?.type === "debit_card"
    ? Math.max(0, currentAccounts.findIndex((account) => account.id === activeCard.linkedAccountId))
    : 0;

  const transactions = useMemo(
    () => activeCard ? getCardTransactions(country, activeCard, config.currency, linkedAccountIndex) : [],
    [activeCard, config.currency, country, linkedAccountIndex],
  );

  const normalizedSearch = transactionSearch.trim().toLowerCase();
  const scopedTransactions = useMemo(
    () => transactionRowPresentation?.transactionFilter
      ? transactions.filter(transactionRowPresentation.transactionFilter)
      : transactions,
    [transactionRowPresentation, transactions],
  );
  const filteredTransactions = useMemo(() => {
    if (!normalizedSearch) return scopedTransactions;
    return scopedTransactions.filter((tx) => {
      const formattedAmount = `${tx.amount < 0 ? "-" : "+"} ${formatEvo2027Number(Math.abs(tx.amount))} ${config.currency}`;
      return [tx.label, tx.details, tx.category, tx.status, tx.day, tx.month, tx.monthTitle, formattedAmount]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [config.currency, country, normalizedSearch, scopedTransactions]);

  const transactionGroups = useMemo(
    () => groupAccountTransactionsByMonth(filteredTransactions.filter((transaction) => transaction.status === "Booked")),
    [filteredTransactions],
  );
  const pendingTransactions = activeCard?.type === "debit_card"
    && activeCard.id === firstDebitCard?.id
    && activeCard.linkedAccountId === firstCurrentAccountId
    ? filteredTransactions.filter((transaction) => transaction.status === "Pending")
    : [];

  const hasSearch = normalizedSearch.length > 0;
  const largeTitleOpacity = 1 - headerProgress * 0.9;
  const showAiOpportunityNudge = Boolean(aiOpportunityNudge) && !isAiOpportunityDismissed;

  // ── Free to Spend amount ─────────────────────────────────────────
  // For credit cards use availableCredit; for debit use balance (treat as positive display)
  const freeToSpendAmount = useMemo(() => {
    if (!activeCard) return "0";
    if (activeCard.type === "credit_card" && "availableCredit" in activeCard) {
      return formatEvo2027Number((activeCard as import("@/data/products").CreditCard).availableCredit);
    }
    return formatEvo2027Number(Math.abs(activeCard.balance));
  }, [activeCard, country]);

  const maskedFreeToSpend = maskFormattedAmount(freeToSpendAmount, amountsHidden);

  const handleShowCardDetails = () => {
    setIsCardDetailsFaceIdVisible(true);
  };

  const completeCardDetailsFaceId = () => {
    setIsCardDetailsFaceIdVisible(false);
    if (!activeCard) return;
    setIsSensitiveCardDetailsVisible(true);
    onShowCardDetailsClick?.(activeCard);
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

  const { isDragging: isCarouselDragging, dragHandlers } = useDragCarousel({
    carouselRef,
    onSettle: snapToNearest,
  });

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>, index: number) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    scrollToCard(index);
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || typeof carousel.scrollTo !== "function") return;
    carousel.scrollTo({ left: getCardScrollLeft(activeIndex) });
  }, []);

  useEffect(() => {
    setIsAiOpportunityDismissed(false);
  }, [activeCard?.id, aiOpportunityNudge?.title]);

  if (!activeCard) {
    return (
      <div className="h-full w-full bg-[var(--uc-surface)]">
        <CollapsingCardHeader progress={1} onBack={onBack} onHelpClick={onHelpClick} />
      </div>
    );
  }

  if (isSensitiveCardDetailsVisible) {
    return (
      <CardSensitiveDetailsScreen
        card={activeCard}
        onBack={() => setIsSensitiveCardDetailsVisible(false)}
      />
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
      className="relative h-full w-full overflow-y-auto overflow-x-hidden bg-[var(--uc-surface)] pb-[32px] scrollbar-hide"
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
            {activeCard.cardHolderName ?? getCardHolderName()}
          </span>
          <span className="text-[16px] font-bold leading-none text-[var(--uc-text)]" style={{ fontFamily: "UniCredit, sans-serif" }}>
            {formatMaskedCardNumber(activeCard.accountNumber)}
          </span>
        </div>

        {/* Card carousel — wrapper scrolls on X, inner container holds cards + shadow without clipping */}
        <div
          ref={carouselRef}
          onScroll={handleCarouselScroll}
          {...dragHandlers}
          data-card-carousel
          className={`relative z-10 -mb-[20px] overflow-x-auto pb-[20px] scrollbar-hide select-none ${
            isCarouselDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
        >
          <div
            className="flex gap-[24px] pt-[8px] pb-[8px]"
            style={{ paddingLeft: `${CAROUSEL_EDGE_GUTTER}px` }}
          >
            {cardProducts.map((card, index) => {
              const isActive = index === activeIndex;
              return (
                <div
                  key={card.id}
                  className="flex shrink-0 cursor-pointer items-center justify-center"
                  role="button"
                  tabIndex={0}
                  onClick={() => scrollToCard(index)}
                  onKeyDown={(e) => handleCardKeyDown(e, index)}
                  {...dragHandlers}
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
                        variant={getCardVariant(card, release === "release-future-evo-2027")}
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

        {/* Free to Spend + Show Card Details */}
        <div className="flex flex-col items-center gap-[16px] px-[24px] pt-[16px] pb-[4px]">
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
            onClick={handleShowCardDetails}
            className="uc-type-n5-strong py-[8px] text-[var(--uc-action)] tracking-[0.08em] uppercase"
          >
            {t("runtime.cards.showCardDetails", "Show Card Details")}
          </button>

          {/* Carousel indicator */}
          <div>
            <AccountCarouselIndicator
              count={cardProducts.length}
              activeIndex={activeIndex}
              onSelect={scrollToCard}
            />
          </div>
        </div>

        {/* Quick actions */}
        <AccountActionBar items={cardQuickActions} align="between" iconTreatment="bubble" />
      </div>

      {/* ── Transactions section ─────────────────────────────────── */}
      <div className={usesEvoGroupCards ? "bg-[var(--uc-app-bg)]" : "bg-[var(--uc-surface)]"}>
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
          className={`sticky z-20 px-[16px] pt-[24px] ${usesEvoGroupCards ? "bg-[var(--uc-app-bg)]" : "bg-[var(--uc-surface)]"}`}
          style={{ top: `${CARD_DETAIL_HEADER_HEIGHT}px` }}
        >
          <AccountSearchBar
            value={transactionSearch}
            onClick={activateSearch}
            onValueChange={handleSearchChange}
            onFocus={activateSearch}
            fieldSurface={usesEvoGroupCards ? "raised" : "muted"}
            fieldPadding={usesEvoGroupCards ? "8" : "none"}
          />
        </div>

        <div className="pt-[24px]">
          {pendingTransactions.length > 0 ? (
            <section data-pending-transactions data-pending-count={pendingTransactions.length} className="pb-[8px]">
              <AccountTransactionMonthDivider title="Pending" currency={config.currency} />
              <div className={transactionGroupCardClassName(usesEvoGroupCards)}>
                    {pendingTransactions.map((transaction) => (
                      <AccountTransactionRow
                        key={transaction.id}
                        transaction={transaction}
                        formattedAmount={formatEvo2027Number(Math.abs(transaction.amount))}
                        currency={config.currency}
                        displayLabel={transactionRowPresentation?.displayLabel?.(transaction)}
                        leadingVisual={transactionRowPresentation?.leadingVisual?.(transaction)}
                        categoryIconVariant={categoryIconVariant}
                        positiveAmountClassName={release === "release-future-evo-2027" ? "text-[var(--uc-green-olive)]" : undefined}
                        evo2027={usesEvoGroupCards}
                        showDate={!usesEvoGroupCards}
                        onClick={(selectedTransaction) => onTransactionClick?.(selectedTransaction, activeCard, getCardMerchantEnrichment(selectedTransaction, country))}
                      />
                    ))}
              </div>
            </section>
          ) : null}
          {transactionGroups.length > 0 ? (
            transactionGroups.map((group, index) => (
              <div key={group.monthTitle} className={index > 0 && !usesEvoGroupCards ? "pt-[16px]" : undefined}>
                {usesEvoGroupCards ? null : (
                  <AccountTransactionMonthDivider
                    title={group.monthTitle}
                    currency={config.currency}
                  />
                )}
                {usesEvoGroupCards ? groupAccountTransactionsByDate(group.transactions).map((dateGroup) => (
                  <div key={dateGroup.dateKey} data-transaction-date-group={dateGroup.dateKey}>
                    <AccountTransactionMonthDivider
                      title={dateGroup.dateTitle}
                      total={dateGroup.transactions.length > 1 ? formatEvo2027SignedNumber(dateGroup.dailyTotal) : undefined}
                      currency={config.currency}
                      dateSeparator
                    />
                    <div className={transactionGroupCardClassName(true)}>
                      {dateGroup.transactions.map((tx) => (
                        <AccountTransactionRow
                          key={tx.id}
                          transaction={tx}
                          formattedAmount={formatEvo2027Number(Math.abs(tx.amount))}
                          currency={config.currency}
                          displayLabel={transactionRowPresentation?.displayLabel?.(tx)}
                          leadingVisual={transactionRowPresentation?.leadingVisual?.(tx)}
                          categoryIconVariant={categoryIconVariant}
                          positiveAmountClassName="text-[var(--uc-green-olive)]"
                          evo2027
                          showDate={false}
                          compact={dateGroup.transactions.length === 1}
                          onClick={(selectedTx) => onTransactionClick?.(selectedTx, activeCard, getCardMerchantEnrichment(selectedTx, country))}
                        />
                      ))}
                    </div>
                  </div>
                )) : (
                  <div className={transactionGroupCardClassName(false)}>
                    {group.transactions.map((tx) => (
                    <AccountTransactionRow
                      key={tx.id}
                      transaction={tx}
                      formattedAmount={formatEvo2027Number(Math.abs(tx.amount))}
                      currency={config.currency}
                      displayLabel={transactionRowPresentation?.displayLabel?.(tx)}
                      leadingVisual={transactionRowPresentation?.leadingVisual?.(tx)}
                      categoryIconVariant={categoryIconVariant}
                      onClick={(selectedTx) => onTransactionClick?.(selectedTx, activeCard, getCardMerchantEnrichment(selectedTx, country))}
                    />
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="uc-type-n4-strong px-[16px] py-[32px] text-center text-[var(--uc-text-muted)]">
              {hasSearch ? t("runtime.accounts.noTransactionsFound", "No transactions found") : null}
            </div>
          )}
        </div>
      </div>
      {isCardDetailsFaceIdVisible ? <FaceIdAnimation onComplete={completeCardDetailsFaceId} /> : null}
    </div>
  );
}
