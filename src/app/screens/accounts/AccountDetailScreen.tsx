import { useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent, KeyboardEvent, MouseEvent, PointerEvent, UIEvent } from "react";
import AccountBalanceCard from "@/app/components/accounts/AccountBalanceCard";
import AccountActionBar, { type AccountActionBarItem } from "@/app/components/accounts/AccountActionBar";
import AccountCarouselIndicator from "@/app/components/accounts/AccountCarouselIndicator";
import CopyToast from "@/app/components/accounts/CopyToast";
import AccountTransactionRow from "@/app/components/accounts/AccountTransactionRow";
import AccountTransactionMonthDivider from "@/app/components/accounts/AccountTransactionMonthDivider";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import AccountTransactionFiltersSheet, {
  EMPTY_ACCOUNT_TRANSACTION_FILTERS,
  hasAccountTransactionFilters,
  type AccountTransactionFilterState,
} from "@/app/screens/accounts/AccountTransactionFiltersSheet";
import { AppIcon } from "@/app/components/icons";
import PfmCategoryChangeSheet from "@/app/components/pfm/PfmCategoryChangeSheet";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useDemo } from "@/app/state/demoStore";
import { getCountryConfig, formatMoneyNumber } from "@/app/registry/countryConfig";
import { maskAmountParts, maskFormattedAmount } from "@/app/utils/amountPrivacy";
import { useCopyToClipboard } from "@/app/utils/useCopyToClipboard";
import { useProducts } from "@/hooks/useProducts";
import { getAccountTransactionProfileIndex, getAccountTransactions, groupAccountTransactionsByMonth } from "@/data/accountDetails";
import type { AccountTransaction } from "@/data/accountDetails";
import { getPfmCategorySelection, type PfmCategorySelection } from "@/data/pfmCategories";
import { getLoanDetails, getTermDepositDetails } from "@/data/accountProductDetails";
import { isAccountDetailProduct } from "@/data/products";
import type { Product } from "@/data/products";

interface AccountDetailScreenProps {
  selectedProductId?: string | null;
  onBack: () => void;
  onDetailsClick: (product: Product) => void;
  onOptionsClick: () => void;
  onTransactionClick?: (transaction: AccountTransaction, product: Product) => void;
  transactionCategoryOverrides?: Readonly<Record<string, PfmCategorySelection>>;
  onTransactionCategoryChange?: (transaction: AccountTransaction, selection: PfmCategorySelection) => void;
  onHelpClick?: () => void;
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
    integer: match?.[1] ?? value,
    decimals: match?.[2] ?? ",00",
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
  onHelpClick,
}: {
  title: string;
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
          {title}
        </h1>
        {onHelpClick ? (
          <button
            onClick={onHelpClick}
            className="flex h-[40px] w-[40px] items-center justify-center"
            aria-label="Help"
          >
            <AppIcon name="help-circle" color="var(--uc-text)" />
          </button>
        ) : (
          <div className="h-[40px] w-[40px]" />
        )}
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
  transactionCategoryOverrides = {},
  onTransactionCategoryChange,
  onHelpClick,
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
  const { toast: copyToast, copy: copyToClipboard } = useCopyToClipboard();
  const [activeIndex, setActiveIndex] = useState(selectedIndex === -1 ? 0 : selectedIndex);
  const [headerProgress, setHeaderProgress] = useState(0);
  const [transactionSearch, setTransactionSearch] = useState("");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [categorySheetTransaction, setCategorySheetTransaction] = useState<AccountTransaction | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<AccountTransactionFilterState>(EMPTY_ACCOUNT_TRANSACTION_FILTERS);
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
  const accountActionItems = useMemo<AccountActionBarItem[]>(() => {
    if (!activeProduct) return [];
    const productType = activeProduct?.type;
    const baseItems: AccountActionBarItem[] = [
      { id: "details", iconName: "account-details", label: t("runtime.accounts.actions.details", "Details"), onClick: () => onDetailsClick(activeProduct) },
      { id: "options", iconName: "account-options", label: t("runtime.accounts.actions.options", "Options"), onClick: onOptionsClick },
      { id: "add-money", iconName: "add-money", label: t("runtime.accounts.actions.addMoney", "Add money") },
      { id: "mcash", iconName: "mcash", label: t("runtime.accounts.actions.internalTransfer", "Internal transfer") },
    ];

    if (productType === "saving_account") {
      // Add money is hidden on saving accounts; no empty slot remains.
      return baseItems.map((item) => (item.id === "add-money" ? { ...item, hidden: true } : item));
    }

    if (productType === "term_deposit") {
      // Options hidden; Add money -> Open term deposit; mCash -> Close term deposit.
      return baseItems.map((item) => {
        if (item.id === "options") return { ...item, hidden: true };
        if (item.id === "add-money") return { ...item, label: t("runtime.accounts.actions.openTermDeposit", "Open term deposit") };
        if (item.id === "mcash") return { ...item, label: t("runtime.accounts.actions.closeTermDeposit", "Close term deposit") };
        return item;
      });
    }

    if (productType === "loan" || productType === "mortgage") {
      // Options + Add money hidden; mCash -> Reimbursement.
      return baseItems.map((item) => {
        if (item.id === "options" || item.id === "add-money") return { ...item, hidden: true };
        if (item.id === "mcash") return { ...item, label: t("runtime.accounts.actions.reimbursement", "Reimbursement") };
        return item;
      });
    }

    return baseItems;
  }, [activeProduct, onDetailsClick, onOptionsClick, t]);
  const currentAccountNumber = accountProducts.find((product) => product.type === "current_account")?.accountNumber ?? "";
  const config = getCountryConfig(country);
  const transactionProfileIndex = activeProduct ? getAccountTransactionProfileIndex(activeProduct, activeIndex) : 0;
  const transactions = useMemo(() => {
    const baseTransactions = getAccountTransactions(
      country,
      transactionProfileIndex,
      config.currency,
    );

    return baseTransactions.map((transaction) => {
      const override = transactionCategoryOverrides[transaction.id];
      return override
        ? {
            ...transaction,
            category: override.groupLabel,
            pfmCategory: override.category,
            pfmSubcategory: override.subcategory,
          }
        : transaction;
    });
  }, [config.currency, country, transactionCategoryOverrides, transactionProfileIndex]);
  const normalizedTransactionSearch = transactionSearch.trim().toLowerCase();
  const filtersActive = hasAccountTransactionFilters(appliedFilters);
  const filteredTransactions = useMemo(() => {
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

      const searchMatches = normalizedTransactionSearch ? searchableText.includes(normalizedTransactionSearch) : true;
      const keywordMatches = appliedFilters.keyword.trim()
        ? searchableText.includes(appliedFilters.keyword.trim().toLowerCase())
        : true;
      const accountMatches = appliedFilters.accountNumber.trim()
        ? activeProduct?.accountNumber.toLowerCase().includes(appliedFilters.accountNumber.trim().toLowerCase())
        : true;
      const variableMatches = appliedFilters.variableCode.trim()
        ? transaction.id.toLowerCase().includes(appliedFilters.variableCode.trim().toLowerCase())
        : true;
      const amountFrom = Number.parseFloat(appliedFilters.amountFrom.replace(",", "."));
      const amountTo = Number.parseFloat(appliedFilters.amountTo.replace(",", "."));
      const absoluteAmount = Math.abs(transaction.amount);
      const amountFromMatches = Number.isFinite(amountFrom) ? absoluteAmount >= amountFrom : true;
      const amountToMatches = Number.isFinite(amountTo) ? absoluteAmount <= amountTo : true;
      const statusMatches = appliedFilters.status === "All transactions" ? true : transaction.status === appliedFilters.status;
      const typeMatches =
        appliedFilters.transactionType === "All transactions"
          ? true
          : appliedFilters.transactionType === "Incoming"
            ? transaction.type === "credit"
            : transaction.type === "debit";
      const categoryMatches = appliedFilters.category === "All categories" ? true : transaction.category === appliedFilters.category;

      return (
        searchMatches &&
        keywordMatches &&
        accountMatches &&
        variableMatches &&
        amountFromMatches &&
        amountToMatches &&
        statusMatches &&
        typeMatches &&
        categoryMatches
      );
    });
  }, [activeProduct?.accountNumber, appliedFilters, config.currency, country, normalizedTransactionSearch, transactions]);
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
        <CollapsingAccountHeader title={t("runtime.accounts.myProductsTitle", "My Products")} progress={1} onBack={onBack} onHelpClick={onHelpClick} />
      </div>
    );
  }

  const handleApplyFilters = (filters: AccountTransactionFilterState) => {
    setAppliedFilters(filters);
    setFilterSheetOpen(false);
    activateTransactionSearch();
  };

  const handleRemoveFilters = () => {
    setAppliedFilters(EMPTY_ACCOUNT_TRANSACTION_FILTERS);
    activateTransactionSearch();
  };

  return (
    <div className="relative h-full w-full bg-[var(--uc-surface)]">
      <div
        ref={pageRef}
        className="h-full w-full overflow-y-auto overflow-x-hidden bg-[var(--uc-surface)] pb-[32px] scrollbar-hide"
        onScroll={handlePageScroll}
      >
        <CollapsingAccountHeader title={t("runtime.accounts.myProductsTitle", "My Products")} progress={headerProgress} onBack={onBack} onHelpClick={onHelpClick} />

        <div className="bg-[var(--uc-app-bg)]">
        <div
          className="flex w-[375px] items-center px-[16px] py-[8px]"
          style={{ opacity: largeTitleOpacity }}
        >
          <h1 className="uc-type-h1 text-[var(--uc-text)]">
            {t("runtime.accounts.myProductsTitle", "My Products")}
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
              const termDepositDetails = product.type === "term_deposit"
                ? getTermDepositDetails(product, currentAccountNumber)
                : null;
              const loanDetails = product.type === "loan" || product.type === "mortgage"
                ? getLoanDetails(product)
                : null;
              const primaryBalance = loanDetails?.ownedAmount ?? product.balance;
              const availableParts = splitFormattedNumber(formatMoneyNumber(primaryBalance, country));
              const secondaryBalance = termDepositDetails?.maturityAmount
                ?? loanDetails?.nextInstallment
                ?? product.balance * 0.92;
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
                  data-account-product-id={product.id}
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
                      account={termDepositDetails ? {
                        ...getProductAccountIdentity(product),
                        accountNumber: `Maturity date ${termDepositDetails.maturityDate}`,
                      } : getProductAccountIdentity(product)}
                      availableInteger={displayedAvailable.integer}
                      availableDecimals={displayedAvailable.decimals}
                      currency={displayedAvailable.currency}
                      currentBalance={maskFormattedAmount(formatMoneyNumber(secondaryBalance, country), amountsHidden)}
                      active={isActiveCard}
                      showSubAccount={false}
                      productType={product.type}
                      progress={termDepositDetails?.progress ?? loanDetails?.progress}
                      progressLabel={
                        product.type === "term_deposit"
                          ? "Term deposit maturity progress"
                          : product.type === "loan"
                            ? "Personal loan repayment progress"
                            : product.type === "mortgage"
                              ? "Mortgage repayment progress"
                              : undefined
                      }
                      showCopy={product.type !== "term_deposit"}
                      onCopy={() => copyToClipboard(product.accountNumber, "Account number")}
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

        <AccountActionBar items={accountActionItems} />
      </div>

        {activeProduct?.type !== "term_deposit" ? (
          <div className="bg-[var(--uc-surface)]">
            <div
              ref={searchContainerRef}
              className="sticky z-20 bg-[var(--uc-surface)] px-[16px] pt-[24px]"
              style={{ top: `${ACCOUNT_DETAIL_HEADER_HEIGHT}px` }}
            >
              <AccountSearchBar
                value={transactionSearch}
                onClick={activateTransactionSearch}
                onFilterClick={() => setFilterSheetOpen(true)}
                onRemoveFilters={handleRemoveFilters}
                onValueChange={handleTransactionSearchChange}
                onFocus={activateTransactionSearch}
                filtersActive={filtersActive}
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
                           onCategoryClick={onTransactionCategoryChange ? setCategorySheetTransaction : undefined}
                         />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="uc-type-n4-strong px-[16px] py-[32px] text-center text-[var(--uc-text-muted)]">
                  {hasTransactionSearch || filtersActive ? t("runtime.accounts.noTransactionsFound", "No transactions found") : null}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {filterSheetOpen ? (
        <AccountTransactionFiltersSheet
          currency={config.currency}
          filters={appliedFilters}
          onApply={handleApplyFilters}
          onClose={() => setFilterSheetOpen(false)}
        />
      ) : null}
      {categorySheetTransaction ? (
        <PfmCategoryChangeSheet
          currentSelection={getPfmCategorySelection(
            categorySheetTransaction.pfmCategory,
            categorySheetTransaction.pfmSubcategory,
          )}
          onClose={() => setCategorySheetTransaction(null)}
          onConfirm={(selection) => {
            onTransactionCategoryChange?.(categorySheetTransaction, selection);
            setCategorySheetTransaction(null);
          }}
        />
      ) : null}
      <CopyToast toast={copyToast} />
    </div>
  );
}
