import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { useCollapsingHeader } from "@/hooks/useCollapsingHeader";
import { useDragCarousel } from "@/hooks/useDragCarousel";
import AccountBalanceCard from "@/app/components/accounts/AccountBalanceCard";
import AccountActionBar, { type AccountActionBarItem } from "@/app/components/accounts/AccountActionBar";
import AccountCarouselIndicator from "@/app/components/accounts/AccountCarouselIndicator";
import CopyToast from "@/app/components/accounts/CopyToast";
import AccountTransactionRow from "@/app/components/accounts/AccountTransactionRow";
import AccountTransactionMonthDivider from "@/app/components/accounts/AccountTransactionMonthDivider";
import { transactionGroupCardClassName } from "@/app/components/accounts/transactionGroupCard";
import AccountMonthlyReport from "@/app/components/accounts/AccountMonthlyReport";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import AccountTransactionFiltersSheet, {
  EMPTY_ACCOUNT_TRANSACTION_FILTERS,
  hasAccountTransactionFilters,
  type AccountTransactionFilterState,
} from "@/app/screens/accounts/AccountTransactionFiltersSheet";
import SavingAccountAddMoneyFlow from "@/app/screens/accounts/SavingAccountAddMoneyFlow";
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
import { getApp2027ActivityTransactions } from "@/app/screens/home/App2027Activity";
import { getCardMerchantEnrichment } from "@/app/components/merchants/merchantEnrichment";
import type { CardTransactionMerchantEnrichment } from "@/app/screens/payments/DomesticPaymentFlowScreens";

interface AccountDetailScreenProps {
  selectedProductId?: string | null;
  onBack: () => void;
  onDetailsClick: (product: Product) => void;
  onOptionsClick: () => void;
  onTransactionClick?: (
    transaction: AccountTransaction,
    product: Product,
    merchantEnrichment?: CardTransactionMerchantEnrichment,
  ) => void;
  transactionCategoryOverrides?: Readonly<Record<string, PfmCategorySelection>>;
  onTransactionCategoryChange?: (transaction: AccountTransaction, selection: PfmCategorySelection) => void;
  onHelpClick?: () => void;
  /** Optional presentation-only overrides used by Flow Library specifications. */
  transactionRowPresentation?: {
    displayLabel?: (transaction: AccountTransaction) => string | undefined;
    leadingVisual?: (transaction: AccountTransaction) => ReactNode | undefined;
    transactionFilter?: (transaction: AccountTransaction) => boolean;
  };
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
  transactionRowPresentation,
}: AccountDetailScreenProps) {
  const { country, amountsHidden, release } = useDemo();
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
  const { progress: headerProgress, onScroll: handlePageScroll } = useCollapsingHeader(64);
  const [transactionSearch, setTransactionSearch] = useState("");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [categorySheetTransaction, setCategorySheetTransaction] = useState<AccountTransaction | null>(null);
  const [isSavingAddMoneyOpen, setSavingAddMoneyOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<AccountTransactionFilterState>(EMPTY_ACCOUNT_TRANSACTION_FILTERS);
  const pageRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const activeProduct = accountProducts[activeIndex] ?? accountProducts[0];
  const isEvoCzSavingAddMoney = release === "release-future-evo-2027" && country === "CZ" && activeProduct?.type === "saving_account";
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
      return baseItems.map((item) => (
        item.id === "add-money"
          ? { ...item, hidden: !isEvoCzSavingAddMoney, onClick: () => setSavingAddMoneyOpen(true) }
          : item
      ));
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
  }, [activeProduct, isEvoCzSavingAddMoney, onDetailsClick, onOptionsClick, t]);
  const currentAccountNumber = accountProducts.find((product) => product.type === "current_account")?.accountNumber ?? "";
  const config = getCountryConfig(country);
  const activeCurrency = activeProduct?.currency ?? config.currency;
  const transactionProfileIndex = activeProduct ? getAccountTransactionProfileIndex(activeProduct, activeIndex) : 0;
  const usesApp2027CzLedger =
    release === "release-future-evo-2027"
    && country === "CZ"
    && activeProduct?.type === "current_account"
    && transactionProfileIndex === 0;
  const transactions = useMemo(() => {
    let baseTransactions = getAccountTransactions(
      country,
      transactionProfileIndex,
      config.currency,
    );

    if (usesApp2027CzLedger) {
      const activityTransactions = getApp2027ActivityTransactions();
      const activityLabels = new Set(activityTransactions.map((transaction) => transaction.label));
      baseTransactions = [
        ...activityTransactions,
        ...baseTransactions.filter(
          (transaction) => transaction.status === "Booked" && !activityLabels.has(transaction.label),
        ),
      ];
    }

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
  }, [config.currency, country, transactionCategoryOverrides, transactionProfileIndex, usesApp2027CzLedger]);
  /** Evo 2027 groups each month into the same card the home activity list uses. */
  const usesEvoGroupCards = release === "release-future-evo-2027";
  const openTransaction = (transaction: AccountTransaction) => {
    if (!activeProduct) return;
    // Every card row carries its merchant, so the detail gets the brand header
    // and the store location regardless of release or market.
    onTransactionClick?.(transaction, activeProduct, getCardMerchantEnrichment(transaction, country));
  };
  const normalizedTransactionSearch = transactionSearch.trim().toLowerCase();
  const filtersActive = hasAccountTransactionFilters(appliedFilters);
  const scopedTransactions = useMemo(
    () => transactionRowPresentation?.transactionFilter
      ? transactions.filter(transactionRowPresentation.transactionFilter)
      : transactions,
    [transactionRowPresentation, transactions],
  );
  const filteredTransactions = useMemo(() => {
    return scopedTransactions.filter((transaction) => {
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
  }, [activeProduct?.accountNumber, appliedFilters, config.currency, country, normalizedTransactionSearch, scopedTransactions]);
  const transactionGroups = useMemo(
    () => groupAccountTransactionsByMonth(filteredTransactions.filter((transaction) => transaction.status === "Booked")),
    [filteredTransactions],
  );
  const firstCurrentAccountId = accountProducts.find((product) => product.type === "current_account")?.id;
  const pendingTransactions = activeProduct?.id === firstCurrentAccountId
    ? filteredTransactions.filter((transaction) => transaction.status === "Pending")
    : [];
  const hasTransactionSearch = normalizedTransactionSearch.length > 0;
  const showCompletedMonthReports = activeProduct?.type === "current_account" && !hasTransactionSearch && !filtersActive;
  const largeTitleOpacity = 1 - headerProgress * 0.9;

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

  const { isDragging: isCarouselDragging, dragHandlers } = useDragCarousel({
    carouselRef,
    onSettle: snapCarouselToNearestAccount,
  });

  const handleAccountCardKeyDown = (event: KeyboardEvent<HTMLElement>, index: number) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    scrollToAccount(index);
  };

  useEffect(() => {
    if (!carouselRef.current) return;
    if (typeof carouselRef.current.scrollTo !== "function") return;
    carouselRef.current.scrollTo({ left: getAccountScrollLeft(activeIndex) });
  }, []);

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
          {...dragHandlers}
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
                { ...availableParts, currency: product.currency },
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
                  onKeyDown={(event) => handleAccountCardKeyDown(event, index)}
                  {...dragHandlers}
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
          <div className={usesEvoGroupCards ? "bg-[var(--uc-app-bg)]" : "bg-[var(--uc-surface)]"}>
            <div
              ref={searchContainerRef}
              className={`sticky z-20 px-[16px] pt-[24px] ${usesEvoGroupCards ? "bg-[var(--uc-app-bg)]" : "bg-[var(--uc-surface)]"}`}
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
                fieldSurface={usesEvoGroupCards ? "raised" : "muted"}
              />
            </div>

            <div className="pt-[24px]">
              {pendingTransactions.length > 0 ? (
                <section data-pending-transactions data-pending-count={pendingTransactions.length} className="pb-[8px]">
                  <AccountTransactionMonthDivider title="Pending" currency={activeCurrency} />
                  <div className={transactionGroupCardClassName(usesEvoGroupCards)}>
                    {pendingTransactions.map((transaction) => (
                      <AccountTransactionRow
                        key={transaction.id}
                        transaction={transaction}
                        formattedAmount={formatMoneyNumber(Math.abs(transaction.amount), country)}
                        currency={activeCurrency}
                        displayLabel={transactionRowPresentation?.displayLabel?.(transaction)}
                        leadingVisual={transactionRowPresentation?.leadingVisual?.(transaction)}
                        categoryIconVariant={release === "release-future-evo-2027" ? "category-circle" : "glyph"}
                        positiveAmountClassName={release === "release-future-evo-2027" ? "text-[#3D7D43]" : undefined}
                        onClick={openTransaction}
                      />
                    ))}
                  </div>
                </section>
              ) : null}
              {transactionGroups.length > 0 ? (
                transactionGroups.map((group, index) => (
                  <div key={group.monthTitle} className={index > 0 && !usesEvoGroupCards ? "pt-[16px]" : undefined}>
                    <AccountTransactionMonthDivider
                      title={group.monthTitle}
                      total={formatMoneyNumber(group.monthlyTotal, country)}
                      currency={activeCurrency}
                    />

                    {showCompletedMonthReports && index > 0 && group.transactions.every((transaction) => transaction.status === "Booked") ? (
                      <AccountMonthlyReport country={country} currency={activeCurrency} group={group} />
                    ) : null}

                    <div className={transactionGroupCardClassName(usesEvoGroupCards)}>
                        {group.transactions.map((transaction) => (
                          <AccountTransactionRow
                            key={transaction.id}
                            transaction={transaction}
                            formattedAmount={formatMoneyNumber(Math.abs(transaction.amount), country)}
                            currency={activeCurrency}
                            displayLabel={transactionRowPresentation?.displayLabel?.(transaction)}
                            leadingVisual={transactionRowPresentation?.leadingVisual?.(transaction)}
                            categoryIconVariant={release === "release-future-evo-2027" ? "category-circle" : "glyph"}
                            positiveAmountClassName={release === "release-future-evo-2027" ? "text-[#3D7D43]" : undefined}
                            onClick={openTransaction}
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
      {isSavingAddMoneyOpen && activeProduct?.type === "saving_account" ? (
        <SavingAccountAddMoneyFlow
          savingAccount={activeProduct}
          sourceAccounts={accountProducts.filter((product): product is Extract<Product, { type: "current_account" }> => product.type === "current_account" && product.currency === activeProduct.currency)}
          country={country}
          onBack={() => setSavingAddMoneyOpen(false)}
        />
      ) : null}
      <CopyToast toast={copyToast} />
    </div>
  );
}
