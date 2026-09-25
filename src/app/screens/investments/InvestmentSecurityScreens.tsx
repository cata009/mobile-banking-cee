import { useMemo, useRef, useState } from "react";
import { useCollapsingHeader } from "@/hooks/useCollapsingHeader";
import { useDragCarousel } from "@/hooks/useDragCarousel";
import AccountActionBar from "@/app/components/accounts/AccountActionBar";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import BrandLogo from "@/app/components/brand-logo/BrandLogo";
import { AppIcon } from "@/app/components/icons";
import { BottomSheet } from "@/app/components/BottomSheet";
import InvestmentBasketFundCard from "@/app/components/investments/InvestmentBasketFundCard";
import InvestmentPeriodChips from "@/app/components/investments/InvestmentPeriodChips";
import InvestmentPortfolioChart from "@/app/components/investments/InvestmentPortfolioChart";
import InvestmentDetailField from "@/app/components/investments/InvestmentDetailField";
import InvestmentAmountDisplay, { formatInvestmentAmountParts } from "@/app/components/investments/InvestmentAmountDisplay";
import MessagesMailboxTabs from "@/app/components/messages/MessagesMailboxTabs";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import LinkButton from "@/app/components/ui/LinkButton";
import { CZ_INVESTMENT_BASKETS } from "@/app/config/investmentBasketFundsConfig";
import {
  INVESTMENT_PERIODS,
  buildInvestmentChartPoints,
  type InvestmentCatalogSecurity,
  type InvestmentHistoryTransaction,
  type InvestmentPeriodId,
} from "@/app/config/investmentsPortfolioConfig";
import { getCountryConfig } from "@/app/registry/countryConfig";
import type { CountryId } from "@/app/state/demoTypes";
import { formatInvestmentMoney } from "@/app/utils/investmentAmountFormatting";
import InvestmentBasketFundsScreen from "@/app/screens/investments/InvestmentBasketFundsScreen";

interface SharedProps {
  country: CountryId;
  amountsHidden: boolean;
}

interface InvestmentSecurityListScreenProps extends SharedProps {
  securities: readonly InvestmentCatalogSecurity[];
  onBack: () => void;
  closeModuleButton?: boolean;
  czRoboAmountStyle?: boolean;
  onSelect: (security: InvestmentCatalogSecurity) => void;
}

interface InvestmentSecurityDetailScreenProps extends SharedProps {
  security: InvestmentCatalogSecurity;
  transactions?: readonly InvestmentHistoryTransaction[];
  onBack: () => void;
  czRoboProductDetail?: boolean;
  onHistoryClick?: (filterByTitle?: string) => void;
  onSeeMoreTransactions?: () => void;
  onSellClick?: () => void;
  onBuyClick?: () => void;
}

const INVESTMENT_POSITIVE_COLOR = "var(--uc-green-olive)";

// Basket carousel geometry. Matches the Account carousel's look: a 16px left
// gutter (so the first card "peeks" from the edge like a real mobile carousel),
// 16px between cards, and an explicit smooth-snap to the nearest card on drag
// end instead of a hard CSS snap-mandatory that feels clipped.
const BASKET_CARD_WIDTH = 260;
const BASKET_CARD_GAP = 16;
const BASKET_CARD_STEP = BASKET_CARD_WIDTH + BASKET_CARD_GAP;
const BASKET_CAROUSEL_EDGE_GUTTER = 16;

function formatMoney(value: number, country: CountryId, currency: string, hidden: boolean, digits = 2) {
  return formatInvestmentMoney(value, country, currency, hidden, digits, digits);
}

function formatPercent(value: number) {
  return `${value > 0 ? "+" : value < 0 ? "-" : ""}${Math.abs(value).toFixed(2).replace(".", ",")}%`;
}

function formatTransactionDate(value: string, country: CountryId) {
  return new Intl.DateTimeFormat(getCountryConfig(country).locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function ProductTransactionRow({
  transaction,
  country,
  amountsHidden,
}: {
  transaction: InvestmentHistoryTransaction;
  country: CountryId;
  amountsHidden: boolean;
}) {
  const dateLabel = formatTransactionDate(transaction.date, country);
  const isPositive = transaction.amount > 0;
  const iconName = transaction.type === "BUY" || transaction.type === "COUPON" ? "trade-buy" : "trade-sell";
  const amountSign = isPositive ? "+" : transaction.amount < 0 ? "−" : "";
  const amountParts = formatInvestmentAmountParts(Math.abs(transaction.amount), country, transaction.currency, amountsHidden);

  return (
    <div
      role="group"
      className="flex min-h-[72px] items-center gap-[12px] border-b border-[var(--uc-border-muted)] px-[24px] py-[10px]"
      aria-label={`${transaction.type}, ${dateLabel}`}
      data-product-transaction={transaction.id}
    >
      <AppIcon name={iconName} color={isPositive ? "var(--uc-green-olive)" : "var(--uc-status-red)"} size={26} />
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-bold leading-[18px] text-[var(--uc-text)]">{transaction.type}</p>
        <p className="mt-[2px] text-[13px] leading-[17px] text-[var(--uc-text-muted)]">{dateLabel}</p>
      </div>
      <p className={`shrink-0 text-[14px] font-bold ${isPositive ? "text-[var(--uc-green-olive)]" : "text-[var(--uc-status-red)]"}`}>
        {amountSign}<InvestmentAmountDisplay parts={amountParts} scale="transaction" />
      </p>
    </div>
  );
}

function ProductKidDocumentRow({ security }: { security: InvestmentCatalogSecurity }) {
  return (
    <div className="px-[24px] py-[12px]" data-investment-kid-document={security.productId}>
      <div className="flex min-h-[68px] items-center gap-[12px] rounded-[4px] border border-[var(--uc-border-muted)] px-[12px] py-[10px]">
        <span className="grid size-[36px] shrink-0 place-items-center rounded-full bg-[var(--uc-surface-muted)]">
          <AppIcon name="account-option-statement" color="var(--uc-action)" size={22} />
        </span>
        <div className="min-w-0">
          <p className="text-[14px] font-bold leading-[18px] text-[var(--uc-text)]">Key Information Document (KID)</p>
          <p className="mt-[2px] truncate text-[13px] leading-[17px] text-[var(--uc-text-muted)]">{security.title}</p>
        </div>
      </div>
    </div>
  );
}

export function InvestmentSecurityListScreen({
  securities,
  country,
  amountsHidden,
  onBack,
  closeModuleButton = false,
  czRoboAmountStyle = false,
  onSelect,
}: InvestmentSecurityListScreenProps) {
  const basketFundsAvailable = country === "CZ";
  const [query, setQuery] = useState("");
  const { progress: headerProgress, onScroll: handleScroll } = useCollapsingHeader(64);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [currency, setCurrency] = useState<string | null>(null);
  const [catalogueTab, setCatalogueTab] = useState<"all" | "regular">("all");
  const [basketFundsOpen, setBasketFundsOpen] = useState(false);
  const currencies = useMemo(() => [...new Set(securities.map((item) => item.instrumentCurrency))], [securities]);
  const filtersActive = ownedOnly || currency !== null;
  const visibleSecurities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return securities.filter((security) => {
      if (basketFundsAvailable && catalogueTab === "regular" && security.contributionType !== "RECURRENT") return false;
      if (ownedOnly && !security.owned) return false;
      if (currency && security.instrumentCurrency !== currency) return false;
      return !normalizedQuery || `${security.title} ${security.productId}`.toLowerCase().includes(normalizedQuery);
    });
  }, [basketFundsAvailable, catalogueTab, currency, ownedOnly, query, securities]);
  const visibleBaskets = useMemo(() => {
    if (!basketFundsAvailable) return [];
    const normalizedQuery = query.trim().toLowerCase();
    return CZ_INVESTMENT_BASKETS.filter((basket) => {
      if (catalogueTab === "regular" && basket.contributionType !== "RECURRENT") return false;
      return !normalizedQuery || `${basket.title} ${basket.description}`.toLowerCase().includes(normalizedQuery);
    });
  }, [basketFundsAvailable, catalogueTab, query]);

  const clearFilters = () => {
    setOwnedOnly(false);
    setCurrency(null);
  };


  const basketCarouselRef = useRef<HTMLDivElement>(null);

  const clampBasketScrollLeft = (scrollLeft: number) => {
    const carousel = basketCarouselRef.current;
    if (!carousel) return scrollLeft;
    const maxScrollLeft = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
    return Math.max(0, Math.min(maxScrollLeft, scrollLeft));
  };

  const getBasketScrollLeft = (index: number) => {
    const carousel = basketCarouselRef.current;
    if (!carousel || index <= 0) return 0;
    // Each card sits at edgeGutter + index * step. Align the card's left edge to
    // the left gutter so it lands exactly where the first card started.
    return clampBasketScrollLeft(index * BASKET_CARD_STEP);
  };

  const getNearestBasketIndex = (scrollLeft: number) => {
    const count = visibleBaskets.length;
    if (count <= 1) return 0;
    let nearestIndex = 0;
    let nearestDistance = Math.abs(scrollLeft - getBasketScrollLeft(0));
    for (let index = 1; index < count; index += 1) {
      const distance = Math.abs(scrollLeft - getBasketScrollLeft(index));
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    }
    return nearestIndex;
  };

  const snapBasketToNearest = () => {
    const carousel = basketCarouselRef.current;
    if (!carousel || visibleBaskets.length <= 1) return;
    const nearestIndex = getNearestBasketIndex(carousel.scrollLeft);
    carousel.scrollTo({ left: getBasketScrollLeft(nearestIndex), behavior: "smooth" });
  };

  const { isDragging: isBasketDragging, dragHandlers: basketDragHandlers } = useDragCarousel({
    carouselRef: basketCarouselRef,
    onSettle: snapBasketToNearest,
  });

  if (basketFundsAvailable && basketFundsOpen) {
    return (
      <InvestmentBasketFundsScreen
        baskets={CZ_INVESTMENT_BASKETS}
        onBack={() => setBasketFundsOpen(false)}
      />
    );
  }

  return (
    <div className="relative h-full w-full overflow-y-auto overflow-x-hidden bg-[var(--uc-surface)] text-[var(--uc-text)] scrollbar-hide" onScroll={handleScroll} data-investment-security-list="true">
      <PageHeader
        title={basketFundsAvailable ? "Buy securities" : "List of securities"}
        onBack={onBack}
        backIconName={closeModuleButton ? "close-flow" : undefined}
        backLabel={closeModuleButton ? "Close Investments" : undefined}
        includeSafeArea
        compact
        collapsedTitleProgress={headerProgress}
      />
      {basketFundsAvailable ? (
        <MessagesMailboxTabs
          tabs={[
            { id: "all", label: "All products" },
            { id: "regular", label: "Regular Plan" },
          ]}
          activeTabId={catalogueTab}
          onChange={(tabId) => setCatalogueTab(tabId === "regular" ? "regular" : "all")}
          ariaLabel="Investment catalogue type"
          withTopMargin
        />
      ) : null}
      <div className="px-[16px] py-[16px]">
        <AccountSearchBar
          value={query}
          onValueChange={setQuery}
          onFilterClick={() => setFiltersOpen(true)}
          onRemoveFilters={clearFilters}
          filtersActive={filtersActive}
          placeholder="Search"
        />
      </div>

      {basketFundsAvailable ? (
        <section className="pt-[16px]" aria-label="Basket funds">
          <SectionHeadingDivider
            title="BASKET FUNDS"
            count={CZ_INVESTMENT_BASKETS.length}
            countAlign="end"
            className="px-[24px] pt-[8px]"
          />
          {visibleBaskets.length > 0 ? (
            <div
              ref={basketCarouselRef}
              {...basketDragHandlers}
              className={`overflow-x-auto overflow-y-visible py-[24px] scrollbar-hide select-none ${
                isBasketDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
              role="region"
              aria-label="Basket funds carousel"
              data-investment-basket-carousel="true"
              style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
            >
              <div className="flex gap-[16px]" style={{ paddingLeft: BASKET_CAROUSEL_EDGE_GUTTER, paddingRight: BASKET_CAROUSEL_EDGE_GUTTER }}>
                {visibleBaskets.map((basket) => (
                  <InvestmentBasketFundCard
                    key={basket.id}
                    basket={basket}
                    onSelect={() => setBasketFundsOpen(true)}
                    {...basketDragHandlers}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="px-[24px] py-[24px] text-[14px] text-[var(--uc-text-muted)]">No basket funds found.</p>
          )}
          <div className="flex justify-center pb-[24px]">
            <LinkButton aria-label="See all basket funds" onClick={() => setBasketFundsOpen(true)}>
              See all basket funds
            </LinkButton>
          </div>
          <SectionHeadingDivider
            title="ALL SECURITIES"
            className="px-[24px] pt-[8px]"
          />
        </section>
      ) : null}
      <div>
        {visibleSecurities.map((security) => (
          <button
            key={security.id}
            type="button"
            onClick={() => onSelect(security)}
            className="flex min-h-[105px] w-full items-center gap-[8px] bg-[var(--uc-surface)] p-[16px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-focus-ring)]"
            data-investment-security-row={security.id}
          >
            <BrandLogo logoId={security.logoId ?? "unicredit"} size={32} />
            <span className="flex min-w-0 flex-1 flex-col items-end gap-[2px] text-right">
              <span className="w-full truncate text-[14px] font-bold leading-[17px]">{security.title}</span>
              <span className="w-full truncate text-[14px] leading-[17px] text-[var(--uc-text-muted)]">{security.productId}</span>
              {czRoboAmountStyle ? (
                <span className="w-full text-[var(--uc-text)]">
                  <InvestmentAmountDisplay
                    parts={formatInvestmentAmountParts(security.value, country, security.currency, amountsHidden)}
                    scale="list"
                  />
                </span>
              ) : (
                <span className="w-full text-[var(--uc-text)]">
                  <span className="text-[20px] font-bold leading-[24px]">{formatMoney(security.value, country, security.currency, amountsHidden).replace(` ${security.currency}`, "")}</span>
                  <span className="text-[14px] leading-[17px]"> {security.currency}</span>
                </span>
              )}
              <span className="text-[14px] font-bold leading-[17px] text-[var(--uc-green-olive)]">{formatPercent(security.performancePercent)} <span className="text-[var(--uc-text)]">(1Y)</span></span>
            </span>
          </button>
        ))}
        {visibleSecurities.length === 0 ? (
          <div className="px-[24px] py-[32px] text-center">
            <p className="text-[18px] font-bold">No securities found</p>
            <p className="mt-[6px] text-[14px] text-[var(--uc-text-muted)]">Try another keyword or remove filters.</p>
          </div>
        ) : null}
      </div>

      {filtersOpen ? (
        <BottomSheet title="Filters" onClose={() => setFiltersOpen(false)}>
          <label className="flex min-h-[56px] items-center gap-[12px] border-b border-[var(--uc-border)] py-[12px] text-[16px] font-bold">
            <input type="checkbox" checked={ownedOnly} onChange={(event) => setOwnedOnly(event.target.checked)} className="size-[20px] accent-[var(--uc-action)]" />
            Products I own
          </label>
          <p className="pb-[8px] pt-[18px] text-[14px] font-bold text-[var(--uc-text-muted)]">CURRENCY</p>
          {currencies.map((itemCurrency) => (
            <label key={itemCurrency} className="flex min-h-[48px] items-center gap-[12px] py-[8px] text-[16px]">
              <input type="radio" name="investment-currency" checked={currency === itemCurrency} onChange={() => setCurrency(itemCurrency)} className="size-[20px] accent-[var(--uc-action)]" />
              {itemCurrency}
            </label>
          ))}
          <button type="button" onClick={() => { clearFilters(); setFiltersOpen(false); }} className="mt-[16px] h-[48px] w-full rounded-[4px] border border-[var(--uc-action)] text-[16px] font-bold text-[var(--uc-action)]">Remove filters</button>
          <button type="button" onClick={() => setFiltersOpen(false)} className="mt-[8px] h-[48px] w-full rounded-[4px] bg-[var(--uc-action-strong)] text-[18px] font-bold text-[var(--uc-static-white)]">Show products</button>
        </BottomSheet>
      ) : null}
    </div>
  );
}

export function InvestmentSecurityDetailScreen({
  security,
  transactions = [],
  country,
  amountsHidden,
  onBack,
  czRoboProductDetail = false,
  onHistoryClick,
  onSeeMoreTransactions,
  onSellClick,
  onBuyClick,
}: InvestmentSecurityDetailScreenProps) {
  const [period, setPeriod] = useState<InvestmentPeriodId>("3y");
  const { progress: headerProgress, onScroll: handleScroll } = useCollapsingHeader(96);
  const marketPrice = security.marketPrice;
  const heroValue = security.owned ? security.localValue : security.value;
  const heroCurrency = security.owned ? security.localCurrency : security.currency;
  const hasPortfolioPosition = security.owned && security.quantity > 0;
  const marketPriceParts = formatInvestmentAmountParts(marketPrice, country, security.currency, amountsHidden);
  const portfolioValueParts = formatInvestmentAmountParts(security.localValue, country, security.localCurrency, amountsHidden);
  const productTransactions = useMemo(
    () => transactions
      .filter((transaction) => transaction.securityId === security.id)
      .sort((first, second) => new Date(second.date).getTime() - new Date(first.date).getTime()),
    [security.id, transactions],
  );
  const chartPoints = useMemo(() => buildInvestmentChartPoints(marketPrice, period), [marketPrice, period]);
  const performanceColor = security.performancePercent < 0 ? "var(--uc-status-red)" : security.performancePercent > 0 ? INVESTMENT_POSITIVE_COLOR : "var(--uc-text)";
  const canSell = hasPortfolioPosition && security.status === "active";

  if (czRoboProductDetail) {
    const canBuy = security.status === "active";
    return (
      <div
        className="flex h-full w-full flex-col bg-[var(--uc-surface)] text-[var(--uc-text)]"
        data-investment-product-detail={hasPortfolioPosition ? "owned" : "not-owned"}
        data-cz-robo-product-detail="true"
      >
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide" onScroll={handleScroll}>
        <PageHeader
          title={security.title}
          onBack={onBack}
          includeSafeArea
          showHelp={false}
          compact
          renderLargeTitle={false}
          collapsedTitleProgress={headerProgress}
        />
        <section className="bg-[var(--uc-surface)] pb-[28px]">
          <div className="px-[24px] pt-[8px]">
            <div className="flex items-start gap-[10px]">
              <h1 className="min-w-0 flex-1 text-[28px] font-bold leading-[31px] text-[var(--uc-text)]">{security.title}</h1>
              <BrandLogo logoId={security.logoId ?? "unicredit"} size={32} label={`${security.title} product`} />
            </div>
            <div className="mt-[8px]">
              <p className="text-[14px] leading-[16px] text-[var(--uc-text)]">Actual market price</p>
              <p className="mt-[2px] leading-none">
                <InvestmentAmountDisplay parts={marketPriceParts} scale="hero" />
              </p>
              <p className="mt-[4px] flex flex-wrap items-baseline gap-x-[4px] text-[14px] leading-[18px]">
                <span>Performance:</span>
                <span className="font-bold" style={{ color: performanceColor }}>{formatPercent(security.performancePercent)}</span>
                <span className="text-[var(--uc-text-muted)]">· from {security.lastUpdate}</span>
              </p>
            </div>
          </div>
          <div className="mt-[8px] px-[16px]">
            <InvestmentPortfolioChart
              points={chartPoints}
              country={country}
              currency={security.currency}
              amountsHidden={amountsHidden}
              compact
              showVerticalGridLines={false}
            />
            <InvestmentPeriodChips
              periods={INVESTMENT_PERIODS.filter((item) => item.id !== "6m")}
              selectedPeriodId={period}
              onChange={setPeriod}
              softUnselected={czRoboProductDetail}
            />
          </div>
        </section>

        <div className="bg-[var(--uc-surface)]">
          {hasPortfolioPosition ? (
            <section>
              <SectionHeadingDivider title="MY SECURITY" className="px-[24px]" />
              <InvestmentDetailField
                label="Total value in portfolio / client currency"
                value={<InvestmentAmountDisplay parts={portfolioValueParts} scale="field" />}
                variant="product-detail"
              />
              <InvestmentDetailField
                label="Quantity"
                value={`${amountsHidden ? "*,***" : security.quantity.toFixed(3).replace(".", ",")} PCS`}
                variant="product-detail"
              />
            </section>
          ) : null}

          <section>
            <SectionHeadingDivider title="MARKET INFO" className="px-[24px]" />
            <InvestmentDetailField label="Product ID" value={security.productId} variant="product-detail" />
            <InvestmentDetailField label="Fund type" value={security.productType === "Fund" ? "Funds" : security.productType} variant="product-detail" />
            <InvestmentDetailField label="Security description" value={security.description} multiline variant="product-detail" />
            <ProductKidDocumentRow security={security} />
            <InvestmentDetailField label="Last update" value={security.lastUpdate} variant="product-detail" />
            <InvestmentDetailField
              label="Purchase options"
              value={security.contributionType === "RECURRENT" ? "One off and recurrent order" : "One off order"}
              variant="product-detail"
            />
          </section>
          {productTransactions.length > 0 ? (
            <section data-investment-product-transactions={security.id}>
              <SectionHeadingDivider title="TRANSACTIONS" className="px-[24px]" />
              {productTransactions.slice(0, 2).map((transaction) => (
                <ProductTransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  country={country}
                  amountsHidden={amountsHidden}
                />
              ))}
              {onSeeMoreTransactions ? (
                <div className="flex justify-center px-[24px] py-[14px]">
                  <LinkButton
                    aria-label={`See all transactions for ${security.title}`}
                    onClick={onSeeMoreTransactions}
                  >
                    See more
                  </LinkButton>
                </div>
              ) : null}
            </section>
          ) : null}
          <div className="h-[34px]" />
        </div>
        </div>
        {canSell || canBuy ? (
          <div className="flex shrink-0 items-center gap-[12px] border-t border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[24px] pb-[34px] pt-[12px]" data-cz-robo-product-detail-actions="true">
            {canSell ? (
              <PrimaryButton
                labelSize="18"
                variant="surface"
                className="!w-0 !flex-1 !border !border-[var(--uc-border)]"
                onClick={onSellClick}
              >
                Sell
              </PrimaryButton>
            ) : null}
            {canBuy ? (
              <PrimaryButton
                labelSize="18"
                className={canSell ? "!w-0 !flex-1" : ""}
                onClick={onBuyClick}
              >
                Buy
              </PrimaryButton>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--uc-surface)] text-[var(--uc-text)] scrollbar-hide" onScroll={handleScroll} data-investment-product-detail={security.owned ? "owned" : "not-owned"}>
      <PageHeader
        title={security.title}
        onBack={onBack}
        variant="gray"
        includeSafeArea
        showHelp={false}
        compact
        renderLargeTitle={false}
        collapsedTitleProgress={headerProgress}
      />
      <div className="bg-[var(--uc-app-bg)] pb-[24px]">
        <section className="flex flex-col items-center px-[24px] text-center" style={{ opacity: 1 - headerProgress * 0.35 }}>
          <BrandLogo logoId={security.logoId ?? "unicredit"} size={40} />
          <div
            className="w-full overflow-hidden"
            style={{ maxHeight: `${64 * (1 - headerProgress)}px`, opacity: 1 - headerProgress }}
          >
            <h1 className="mt-[8px] text-[28px] font-bold leading-[31px]">{security.title}</h1>
          </div>
          <p className="mt-[16px] leading-none">
            <span className="text-[30px] font-bold tracking-[0.2px]">{formatMoney(heroValue, country, heroCurrency, amountsHidden).replace(` ${heroCurrency}`, "")}</span>
            <span className="text-[20px]"> {heroCurrency}</span>
          </p>
          <p className="mt-[8px] text-[14px] font-bold">PERFORMANCE <span style={{ color: performanceColor }}>{formatPercent(security.performancePercent)}</span></p>
          <p className="mt-[8px] text-[14px]">(last update {security.lastUpdate})</p>
        </section>
      </div>

      <AccountActionBar
        items={[
          { id: "history", iconName: "investment-history", label: "History", onClick: () => onHistoryClick?.(security.title) },
          { id: "documents", iconName: "account-option-statement", label: "Documents" },
          { id: "sell", iconName: "trade-sell", label: "Sell", hidden: !canSell, iconColor: "var(--uc-text)", onClick: onSellClick },
          { id: "buy", iconName: "trade-buy", label: "Buy", hidden: security.status !== "active", iconColor: "var(--uc-action)", onClick: onBuyClick },
        ]}
      />
      <div className="h-[24px]" aria-hidden="true" />

      {security.owned ? (
        <section>
          <SectionHeadingDivider title="MY SECURITY" className="px-[24px]" />
          <InvestmentDetailField label="Total value in portfolio / client currency" value={formatMoney(security.localValue, country, security.localCurrency, amountsHidden)} />
          <InvestmentDetailField label="Quantity" value={`${amountsHidden ? "*,***" : security.quantity.toFixed(3).replace(".", ",")} PCS`} />
        </section>
      ) : null}

      <section>
        <SectionHeadingDivider title="MARKET INFO" className="px-[24px]" />
        <InvestmentDetailField label="Actual market price" value={formatMoney(marketPrice, country, security.currency, amountsHidden)} />
        <div className="px-[8px]">
          <InvestmentPortfolioChart points={chartPoints} country={country} currency={security.currency} amountsHidden={amountsHidden} />
          <InvestmentPeriodChips periods={INVESTMENT_PERIODS.filter((item) => item.id !== "6m")} selectedPeriodId={period} onChange={setPeriod} />
        </div>
        <InvestmentDetailField label="Product ID" value={security.productId} />
        <InvestmentDetailField label="Fund type" value={security.productType === "Fund" ? "Funds" : security.productType} />
        <InvestmentDetailField label="Security description" value={security.description} multiline />
        <InvestmentDetailField label="Last update" value={security.lastUpdate} />
        <InvestmentDetailField label="Purchase options" value={security.contributionType === "RECURRENT" ? "One off and recurrent order" : "One off order"} />
      </section>
      <div className="h-[34px]" />
    </div>
  );
}
