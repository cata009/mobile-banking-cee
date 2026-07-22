import { useEffect, useMemo, useRef, useState, type DragEvent, type MouseEvent, type PointerEvent, type UIEvent } from "react";
import AccountActionBar from "@/app/components/accounts/AccountActionBar";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import BrandLogo from "@/app/components/brand-logo/BrandLogo";
import { BottomSheet } from "@/app/components/BottomSheet";
import InvestmentBasketFundCard from "@/app/components/investments/InvestmentBasketFundCard";
import InvestmentPeriodChips from "@/app/components/investments/InvestmentPeriodChips";
import InvestmentPortfolioChart from "@/app/components/investments/InvestmentPortfolioChart";
import InvestmentDetailField from "@/app/components/investments/InvestmentDetailField";
import MessagesMailboxTabs from "@/app/components/messages/MessagesMailboxTabs";
import PageHeader from "@/app/components/PageHeader";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import LinkButton from "@/app/components/ui/LinkButton";
import { CZ_INVESTMENT_BASKETS } from "@/app/config/investmentBasketFundsConfig";
import {
  INVESTMENT_PERIODS,
  buildInvestmentChartPoints,
  type InvestmentCatalogSecurity,
  type InvestmentPeriodId,
} from "@/app/config/investmentsPortfolioConfig";
import { getCountryConfig } from "@/app/registry/countryConfig";
import type { CountryId } from "@/app/state/demoTypes";
import { maskFormattedAmount } from "@/app/utils/amountPrivacy";
import InvestmentBasketFundsScreen from "@/app/screens/investments/InvestmentBasketFundsScreen";

interface SharedProps {
  country: CountryId;
  amountsHidden: boolean;
}

interface InvestmentSecurityListScreenProps extends SharedProps {
  securities: readonly InvestmentCatalogSecurity[];
  onBack: () => void;
  onSelect: (security: InvestmentCatalogSecurity) => void;
}

interface InvestmentSecurityDetailScreenProps extends SharedProps {
  security: InvestmentCatalogSecurity;
  onBack: () => void;
  onHistoryClick?: (filterByTitle?: string) => void;
  onSellClick?: () => void;
  onBuyClick?: () => void;
}

const INVESTMENT_POSITIVE_COLOR = "var(--uc-green-olive)";

// Drag state for the basket funds carousel. Mirrors the inline drag model used
// by the Account / Card / Analytics / PFM / Products carousels so the basket
// shelf can be dragged horizontally while its vertically-scrolling parent keeps
// handling vertical pan (touch-action: pan-y).
type BasketDragState = {
  didMove: boolean;
  input: "mouse" | "pointer" | null;
  pointerId: number | null;
  startScrollLeft: number;
  startX: number;
};

// Basket carousel geometry. Matches the Account carousel's look: a 16px left
// gutter (so the first card "peeks" from the edge like a real mobile carousel),
// 16px between cards, and an explicit smooth-snap to the nearest card on drag
// end instead of a hard CSS snap-mandatory that feels clipped.
const BASKET_CARD_WIDTH = 260;
const BASKET_CARD_GAP = 16;
const BASKET_CARD_STEP = BASKET_CARD_WIDTH + BASKET_CARD_GAP;
const BASKET_CAROUSEL_EDGE_GUTTER = 16;

function formatMoney(value: number, country: CountryId, currency: string, hidden: boolean, digits = 2) {
  const formatted = new Intl.NumberFormat(getCountryConfig(country).locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Math.abs(value));
  return hidden ? `${maskFormattedAmount(formatted, true)} ${currency}` : `${formatted} ${currency}`;
}

function formatPercent(value: number) {
  return `${value > 0 ? "+" : value < 0 ? "-" : ""}${Math.abs(value).toFixed(2).replace(".", ",")}%`;
}

export function InvestmentSecurityListScreen({
  securities,
  country,
  amountsHidden,
  onBack,
  onSelect,
}: InvestmentSecurityListScreenProps) {
  const basketFundsAvailable = country === "CZ";
  const [query, setQuery] = useState("");
  const [headerProgress, setHeaderProgress] = useState(0);
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

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setHeaderProgress(Math.min(1, Math.max(0, event.currentTarget.scrollTop / 64)));
  };

  const basketCarouselRef = useRef<HTMLDivElement>(null);
  const basketDragStateRef = useRef<BasketDragState>({
    didMove: false,
    input: null,
    pointerId: null,
    startScrollLeft: 0,
    startX: 0,
  });
  const basketMouseDragCleanupRef = useRef<(() => void) | null>(null);
  const basketSuppressClickRef = useRef(false);
  const [isBasketDragging, setIsBasketDragging] = useState(false);

  const removeBasketMouseDragListeners = () => {
    basketMouseDragCleanupRef.current?.();
    basketMouseDragCleanupRef.current = null;
  };

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

  const beginBasketDrag = (
    clientX: number,
    input: BasketDragState["input"],
    pointerId: number | null = null,
  ) => {
    const carousel = basketCarouselRef.current;
    if (!carousel || basketDragStateRef.current.input) return false;

    basketDragStateRef.current = {
      didMove: false,
      input,
      pointerId,
      startScrollLeft: carousel.scrollLeft,
      startX: clientX,
    };
    return true;
  };

  const moveBasketDrag = (clientX: number) => {
    const carousel = basketCarouselRef.current;
    const dragState = basketDragStateRef.current;
    if (!carousel || !dragState.input) return false;

    const deltaX = clientX - dragState.startX;
    if (!dragState.didMove && Math.abs(deltaX) < 4) return false;

    dragState.didMove = true;
    basketSuppressClickRef.current = true;
    setIsBasketDragging(true);
    carousel.scrollLeft = dragState.startScrollLeft - deltaX;
    return true;
  };

  const resetBasketDrag = () => {
    removeBasketMouseDragListeners();
    basketDragStateRef.current = {
      didMove: false,
      input: null,
      pointerId: null,
      startScrollLeft: 0,
      startX: 0,
    };
    setIsBasketDragging(false);
  };

  const finishBasketDrag = () => {
    const didMove = basketDragStateRef.current.didMove;
    if (didMove) {
      // Smooth-snap to the nearest card (mirrors the Account carousel), so the
      // shelf settles elegantly instead of landing mid-card. A click-suppression
      // window prevents the drag from also opening a card.
      snapBasketToNearest();
      window.setTimeout(() => {
        basketSuppressClickRef.current = false;
      }, 80);
    }
    resetBasketDrag();
  };

  const handleBasketPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (beginBasketDrag(event.clientX, "pointer", event.pointerId)) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };
  const handleBasketPointerMove = (event: PointerEvent<HTMLElement>) => {
    const dragState = basketDragStateRef.current;
    if (dragState.input !== "pointer" || dragState.pointerId !== event.pointerId) return;
    if (moveBasketDrag(event.clientX)) event.preventDefault();
  };
  const handleBasketPointerUp = (event: PointerEvent<HTMLElement>) => {
    const dragState = basketDragStateRef.current;
    if (dragState.input !== "pointer" || dragState.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    finishBasketDrag();
  };
  const handleBasketPointerCancel = (event: PointerEvent<HTMLElement>) => {
    if (basketDragStateRef.current.input !== "pointer" || basketDragStateRef.current.pointerId !== event.pointerId) return;
    resetBasketDrag();
    basketSuppressClickRef.current = false;
  };

  const handleBasketMouseDown = (event: MouseEvent<HTMLElement>) => {
    if (event.button !== 0 || !beginBasketDrag(event.clientX, "mouse")) return;

    const handleMouseMove = (mouseEvent: globalThis.MouseEvent) => {
      if (basketDragStateRef.current.input !== "mouse") return;
      if (mouseEvent.buttons !== 1) {
        finishBasketDrag();
        return;
      }
      if (moveBasketDrag(mouseEvent.clientX)) mouseEvent.preventDefault();
    };
    const handleMouseUp = () => {
      if (basketDragStateRef.current.input === "mouse") finishBasketDrag();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    basketMouseDragCleanupRef.current = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  };

  const handleBasketClickCapture = (event: MouseEvent<HTMLElement>) => {
    if (!basketSuppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const handleBasketDragStart = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
  };

  useEffect(() => removeBasketMouseDragListeners, []);

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
      <PageHeader title={basketFundsAvailable ? "Buy securities" : "List of securities"} onBack={onBack} includeSafeArea compact collapsedTitleProgress={headerProgress} />
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
              onPointerDown={handleBasketPointerDown}
              onPointerMove={handleBasketPointerMove}
              onPointerUp={handleBasketPointerUp}
              onPointerCancel={handleBasketPointerCancel}
              onMouseDown={handleBasketMouseDown}
              onClickCapture={handleBasketClickCapture}
              onDragStart={handleBasketDragStart}
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
                    onPointerDown={handleBasketPointerDown}
                    onPointerMove={handleBasketPointerMove}
                    onPointerUp={handleBasketPointerUp}
                    onPointerCancel={handleBasketPointerCancel}
                    onMouseDown={handleBasketMouseDown}
                    onClickCapture={handleBasketClickCapture}
                    onDragStart={handleBasketDragStart}
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
              <span className="w-full text-[var(--uc-text)]">
                <span className="text-[20px] font-bold leading-[24px]">{formatMoney(security.value, country, security.currency, amountsHidden).replace(` ${security.currency}`, "")}</span>
                <span className="text-[14px] leading-[17px]"> {security.currency}</span>
              </span>
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
          <button type="button" onClick={() => setFiltersOpen(false)} className="mt-[8px] h-[48px] w-full rounded-[4px] bg-[var(--uc-action)] text-[18px] font-bold text-[var(--uc-static-white)]">Show products</button>
        </BottomSheet>
      ) : null}
    </div>
  );
}

export function InvestmentSecurityDetailScreen({
  security,
  country,
  amountsHidden,
  onBack,
  onHistoryClick,
  onSellClick,
  onBuyClick,
}: InvestmentSecurityDetailScreenProps) {
  const [period, setPeriod] = useState<InvestmentPeriodId>("3y");
  const [headerProgress, setHeaderProgress] = useState(0);
  const marketPrice = security.marketPrice;
  const heroValue = security.owned ? security.localValue : security.value;
  const heroCurrency = security.owned ? security.localCurrency : security.currency;
  const chartPoints = useMemo(() => buildInvestmentChartPoints(marketPrice, period), [marketPrice, period]);
  const performanceColor = security.performancePercent < 0 ? "var(--uc-status-red)" : security.performancePercent > 0 ? INVESTMENT_POSITIVE_COLOR : "var(--uc-text)";
  const canSell = security.owned && security.status === "active" && security.quantity > 0;

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setHeaderProgress(Math.min(1, Math.max(0, event.currentTarget.scrollTop / 96)));
  };

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
