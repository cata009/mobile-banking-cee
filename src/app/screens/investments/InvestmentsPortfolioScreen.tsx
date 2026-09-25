import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useCollapsingHeader } from "@/hooks/useCollapsingHeader";
import { BottomSheet } from "@/app/components/BottomSheet";
import InvestmentDistributionChart from "@/app/components/investments/InvestmentDistributionChart";
import InvestmentActionBar from "@/app/components/investments/InvestmentActionBar";
import InvestmentFilterChips from "@/app/components/investments/InvestmentFilterChips";
import InvestmentPeriodChips from "@/app/components/investments/InvestmentPeriodChips";
import InvestmentPortfolioChart from "@/app/components/investments/InvestmentPortfolioChart";
import InvestmentPortfolioTabs from "@/app/components/investments/InvestmentPortfolioTabs";
import InvestmentProductCard from "@/app/components/investments/InvestmentProductCard";
import InvestmentAmountDisplay, { formatInvestmentAmountParts, type InvestmentAmountParts } from "@/app/components/investments/InvestmentAmountDisplay";
import InvestmentProductsAccordion from "@/app/components/investments/InvestmentProductsAccordion";
import InvestmentFundCarousel from "@/app/components/investments/InvestmentFundCarousel";
import InvestmentsHistoryScreen from "@/app/screens/investments/InvestmentsHistoryScreen";
import OrdersToApproveScreen from "@/app/screens/investments/OrdersToApproveScreen";
import TabbedScreen from "@/app/components/TabbedScreen";
import { MY_BANKER_NAV_ITEMS, type NavItem } from "@/app/components/BottomNavigation";
import InvestmentBuyOrderFlow from "@/app/screens/investments/InvestmentBuyOrderFlow";
import InvestmentSellOrderFlow from "@/app/screens/investments/InvestmentSellOrderFlow";
import CzFutureRoboAdvisorFlow from "@/app/screens/investments/CzFutureRoboAdvisorFlow";
import CzInvestmentGoalsScreen, {
  INITIAL_CZ_ROBO_GOALS,
} from "@/app/screens/investments/CzInvestmentGoalsScreen";
import type { RoboExistingGoal } from "@/app/screens/investments/czFutureRoboAdvisorModel";
import {
  InvestmentFundCollectionScreen,
  InvestmentFundsSelectionScreen,
} from "@/app/screens/investments/InvestmentFundsWindowScreens";
import { InvestmentSecurityDetailScreen, InvestmentSecurityListScreen } from "@/app/screens/investments/InvestmentSecurityScreens";
import { AppIcon, type IconName } from "@/app/components/icons";
import PageHeader from "@/app/components/PageHeader";
import ProductCard from "@/app/components/ProductCard";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import {
  INVESTMENT_PERIODS,
  INVESTMENT_PORTFOLIO_TABS,
  INVESTMENT_SORT_OPTIONS,
  buildInvestmentDistributionItems,
  buildInvestmentChartPoints,
  buildInvestmentHistoryTransactions,
  buildInvestmentSecurities,
  buildInvestmentSecurityCatalog,
  calculateInvestmentPortfolioPerformance,
  getInvestmentDistributionGroupKey,
  getInvestmentDistributionTitle,
  getInvestmentProducts,
  sortInvestmentSecurities,
  type InvestmentDistributionItem,
  type InvestmentPortfolioTabId,
  type InvestmentPeriodId,
  type InvestmentSecurity,
  type InvestmentCatalogSecurity,
  type InvestmentSortId,
} from "@/app/config/investmentsPortfolioConfig";
import type { InvestmentFundCollectionId } from "@/app/config/investmentFundCollections";
import { getCountryConfig } from "@/app/registry/countryConfig";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useDemo } from "@/app/state/demoStore";
import { maskAmountParts } from "@/app/utils/amountPrivacy";
import { useProducts } from "@/hooks/useProducts";
import type { CurrentAccount } from "@/data/products";
import { convertCurrency, roundMoney } from "@/data/exchangeRates";
import type { CoAppingInvestmentBuyDraft } from "../../../../package/mobile-pi-coapping-chat-package/src";

export interface InvestmentBuyRequest {
  requestId: number;
  securityId: string;
  draft?: CoAppingInvestmentBuyDraft;
}

export interface InvestmentFundsRequest {
  requestId: number;
  collectionId?: InvestmentFundCollectionId;
}

interface InvestmentsPortfolioScreenProps {
  onBack: () => void;
  /** Rendered between the header and the portfolio tabs, e.g. the My Banker module. */
  headerSlot?: ReactNode;
  /** RS Future / My Banker replaces the portfolio landing page with its investment destination. */
  myBankerDestination?: boolean;
  /** Opens the existing product-detail journey for a term deposit. */
  onTermDepositClick?: () => void;
  /** Space to leave under the content when the screen sits above a tab bar. */
  bottomInset?: number;
  showBottomNavigation?: boolean;
  onBottomNavigationChange?: (tab: NavItem) => void;
  roboAdvisorEnabled?: boolean;
  initialView?: "portfolio" | "goals";
  onHistoryClick?: (filterByTitle?: string) => void;
  onOrdersToApproveClick?: () => void;
  onSelectedSecurityChange?: (security: InvestmentCatalogSecurity | null) => void;
  fundsWindowRequest?: InvestmentFundsRequest | null;
  buyRequest?: InvestmentBuyRequest | null;
  onBuyRequestConsumed?: (requestId: number) => void;
}

const TAB_TRANSLATION_KEYS: Record<InvestmentPortfolioTabId, string> = {
  performance: "performance",
  "product-type": "productType",
  currency: "currency",
  "asset-class": "assetClass",
  "account-list": "accountList",
};

const DISTRIBUTION_TITLE_TRANSLATION_KEYS: Record<Exclude<InvestmentPortfolioTabId, "performance">, string> = {
  "product-type": "productType",
  currency: "currency",
  "asset-class": "assetClass",
  "account-list": "accountList",
};

const CZ_ROBO_NAV_LABEL_OVERRIDES: Partial<Record<NavItem, string>> = {
  home: "Portfolio",
  investments: "Explore",
  payments: "Invest",
  products: "Activity",
  more: "More",
};

const CZ_ROBO_NAV_ICON_OVERRIDES: Partial<Record<NavItem, IconName>> = {
  home: "chart-donut",
  payments: "invest-action",
  products: "investment-history",
};

function PortfolioPerformanceTrendIcon({ direction }: { direction: "up" | "down" | null }) {
  if (direction === "up") {
    return (
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="13" height="10" viewBox="0 0 13 10" fill="none">
        <g clipPath="url(#portfolio-performance-up-clip)">
          <path d="M7.13534 0C7.26313 1.00262 7.83168 1.5437 8.75884 1.57239C9.28176 1.58803 9.80467 1.57499 10.3276 1.57499C10.3458 1.6441 10.3654 1.71189 10.3837 1.78099C9.40825 2.78101 8.43153 3.77972 7.45352 4.78104C7.82386 5.19305 8.15117 5.55681 8.5189 5.9649C9.57777 4.91012 10.574 3.91923 11.6903 2.80839C11.835 4.26865 11.3252 5.85929 13.3177 6.28303V0H7.13403H7.13534Z" fill="#3D7D43" />
          <path d="M0.586201 6.67738C-0.0618973 7.31102 -0.00582445 8.00725 0.594025 8.75303C1.71679 7.76475 2.84737 6.7882 3.95188 5.78166C4.2844 5.47788 4.49174 5.47527 4.79558 5.81947C5.38108 6.4818 6.01093 7.10502 6.65902 7.78039C7.09848 7.34883 7.44926 7.00463 7.77657 6.68259C6.62121 5.52481 5.51149 4.41267 4.3496 3.24707C3.11209 4.36704 1.80937 5.48179 0.586201 6.67607V6.67738Z" fill="#3D7D43" />
        </g>
        <defs>
          <clipPath id="portfolio-performance-up-clip">
            <rect width="13" height="9.53333" fill="white" />
          </clipPath>
        </defs>
      </svg>
    );
  }

  if (direction === "down") {
    return (
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="17" height="23" viewBox="0 0 17 23" fill="none">
        <path d="M3.69405 2.94426C2.33845 2.1411 1.19458 2.54851 0.212192 3.89131C2.37686 5.33196 4.52534 6.79102 6.71243 8.1928C7.37216 8.61449 7.46982 8.96147 7.02855 9.62653C6.17982 10.9077 5.41672 12.2457 4.57426 13.6379C5.49664 14.1816 6.23245 14.6158 6.92048 15.0205C8.34475 12.5595 9.71293 10.1957 11.1474 7.72026C8.70998 6.14617 6.25199 4.46025 3.69624 2.94368L3.69405 2.94426Z" fill="#E30000" />
        <path d="M13.957 8.93774C12.3309 9.60344 11.6781 10.8016 12.0471 12.3713C12.2561 13.2564 12.5133 14.1286 12.7486 15.0067C12.6407 15.0684 12.5357 15.1318 12.4279 15.1935C10.3098 14.0056 8.19335 12.8149 6.07192 11.6232C5.54673 12.4304 5.08318 13.1437 4.56338 13.9448C6.81095 15.2482 8.92308 16.4753 11.2906 17.8499C8.9037 18.7499 6.00334 18.6094 6.18832 22.1459L16.7386 19.319L13.9564 8.93555L13.957 8.93774Z" fill="#E30000" />
      </svg>
    );
  }

  return null;
}

function PortfolioSummary({
  totalValue,
  performanceAmount,
  performancePercentLabel,
  performanceAmountValue,
  performancePercentValue,
  amountsHidden,
  currency,
  czRoboAmountStyle,
}: {
  totalValue: InvestmentAmountParts;
  performanceAmount: InvestmentAmountParts;
  performancePercentLabel: string;
  performanceAmountValue: number;
  performancePercentValue: number;
  amountsHidden: boolean;
  currency: string;
  czRoboAmountStyle: boolean;
}) {
  const { t } = useLanguage();
  const performanceColor = (() => {
    const signed = performanceAmountValue !== 0 ? performanceAmountValue : performancePercentValue;
    if (signed > 0) return "var(--uc-green-olive)";
    if (signed < 0) return "var(--uc-status-red)";
    return "var(--uc-text)";
  })();
  const signedPercentLabel = amountsHidden || performancePercentValue === 0
    ? performancePercentLabel
    : `${performancePercentValue > 0 ? "+" : "-"}${performancePercentLabel}`;
  const performanceDirection = performanceAmountValue > 0 || performancePercentValue > 0
    ? "up"
    : performanceAmountValue < 0 || performancePercentValue < 0
      ? "down"
      : null;

  if (czRoboAmountStyle) {
    return (
      <div className="px-[16px] pt-[16px]">
        <div className="flex flex-col gap-0">
          <div className="flex flex-col gap-[2px]">
            <span className="text-[14px] font-bold leading-normal text-[var(--uc-text)]">
              {t("runtime.investments.totalValue", "Total value")}:
            </span>
            <InvestmentAmountDisplay parts={totalValue} scale="portfolio" />
          </div>
          <div className="flex items-center gap-[4px] whitespace-nowrap">
            <InvestmentAmountDisplay
              parts={performanceAmount}
              scale="transaction"
              className="text-[var(--uc-text)]"
            />
            <PortfolioPerformanceTrendIcon direction={performanceDirection} />
            <span className="text-[14px] font-bold leading-normal" style={{ color: performanceColor }}>
              {signedPercentLabel}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-[16px] pt-[16px]">
      <div className="flex flex-col gap-[8px]">
        <div className="flex items-baseline gap-[8px]">
          <span className="text-[14px] font-bold leading-normal text-[var(--uc-text)]">
            {t("runtime.investments.totalValue", "Total value")}:
          </span>
          <span className="text-[var(--uc-text)]">
            <span className="text-center text-[20px] font-bold leading-[24px]">{totalValue.integer}</span>
            <span className="text-[14px] font-normal leading-normal">{totalValue.decimal} {totalValue.currency || currency}</span>
          </span>
        </div>
        <div className="flex items-baseline gap-[8px]">
          <span className="text-[14px] font-bold leading-normal text-[var(--uc-text)]">
            {t("runtime.investments.performance", "Performance")}:
          </span>
          <span style={{ color: performanceColor }}>
            <span className="text-center text-[14px] font-bold leading-normal">{performanceAmount.integer}</span>
            <span className="text-center text-[14px] font-bold leading-normal">{performanceAmount.decimal} {performanceAmount.currency || currency}</span>
            <span className="text-center text-[14px] font-bold leading-normal"> / {signedPercentLabel}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function EmptyInvestmentsState() {
  const { t } = useLanguage();

  return (
    <div className="mx-[24px] mt-[24px] rounded-[8px] border border-[var(--uc-border)] p-[18px]">
      <p className="uc-type-n4-strong text-[var(--uc-text)]">
        {t("runtime.investments.emptyTitle", "No investment products yet")}
      </p>
      <p className="uc-type-n4 mt-[6px] text-[var(--uc-text-muted)]">
        {t("runtime.investments.emptyDescription", "Your portfolio value will appear here when investment products are available.")}
      </p>
    </div>
  );
}

function DistributionCategoryDetailScreen({
  item,
  tabId,
  securities,
  onBack,
  formatDistributionAmount,
}: {
  item: InvestmentDistributionItem;
  tabId: Exclude<InvestmentPortfolioTabId, "performance">;
  securities: readonly InvestmentSecurity[];
  onBack: () => void;
  formatDistributionAmount: (value: number, itemCurrency: string) => InvestmentAmountParts;
}) {
  const { progress: headerProgress, onScroll: handleScroll } = useCollapsingHeader(64);
  const matchingSecurities = securities.filter((security) => getInvestmentDistributionGroupKey(security, tabId) === item.id);
  const totalParts = formatDistributionAmount(item.value, item.currency);
  const categoryTitle = item.label.toUpperCase();


  const renderCategoryRow = (security: InvestmentSecurity) => {
    const primaryAmount = formatDistributionAmount(security.value, security.currency);
    const localAmount = formatDistributionAmount(security.localValue, security.localCurrency);
    const showLocalAmount = security.currency !== security.localCurrency;

    return (
      <button
        key={security.id}
        type="button"
        className="flex h-[80px] w-full items-center justify-between bg-[var(--uc-surface)] px-[16px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
        data-investment-category-row={security.id}
      >
        <div className="min-w-0 flex-1 py-[14px] pr-[12px]">
          <p className="truncate text-[14px] font-bold leading-[17px] text-[var(--uc-text)]">{security.title}</p>
          <p className="mt-[10px] truncate text-[var(--uc-text)]">
            <span className="text-[20px] font-bold leading-[24px]">{primaryAmount.integer}</span>
            <span className="text-[14px] font-normal leading-[17px]">{primaryAmount.decimal} {primaryAmount.currency}</span>
            {showLocalAmount ? (
              <span className="text-[14px] font-normal leading-[17px] text-[var(--uc-text-muted)]">
                {" "}({localAmount.integer}{localAmount.decimal} {localAmount.currency})
              </span>
            ) : null}
          </p>
        </div>
        <span className="grid size-[32px] shrink-0 place-items-center" aria-hidden="true">
          <AppIcon name="chevron-link" color="var(--uc-text)" size={28} />
        </span>
      </button>
    );
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--uc-surface)] text-[var(--uc-text)] scrollbar-hide" onScroll={handleScroll} data-investment-distribution-detail={item.id}>
      <PageHeader
        title=""
        onBack={onBack}
        collapsedTitleProgress={headerProgress}
        includeSafeArea
      />
      <section className="px-[16px] pt-[10px]">
        <div className="flex items-center gap-[14px]">
          <span className="size-[20px] shrink-0 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
          <h1 className="uc-type-h1 tracking-[0.2px] text-[var(--uc-text)]" data-investment-category-title="true">{categoryTitle}</h1>
        </div>
        <div className="pt-[44px]">
          <p className="text-[14px] font-bold leading-[16px] text-[var(--uc-text)]">Total value</p>
          <p className="mt-[14px] text-[var(--uc-text)]" aria-label={`${item.label} total value`}>
            <span className="text-[30px] font-bold leading-[34px]">{totalParts.integer}</span>
            <span className="text-[18px] font-normal leading-[22px]">{totalParts.decimal} {totalParts.currency}</span>
          </p>
        </div>
      </section>
      <section className="pt-[18px]">
        {matchingSecurities.map(renderCategoryRow)}
        {matchingSecurities.length === 0 ? (
          <div className="px-[16px] py-[20px]">
            <p className="text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">No securities in this category</p>
          </div>
        ) : null}
      </section>
      <div className="h-[34px]" />
    </div>
  );
}

export default function InvestmentsPortfolioScreen({
  onBack,
  headerSlot,
  myBankerDestination = false,
  onTermDepositClick,
  bottomInset = 0,
  showBottomNavigation = false,
  onBottomNavigationChange = () => undefined,
  roboAdvisorEnabled = false,
  initialView = "portfolio",
  onHistoryClick,
  onOrdersToApproveClick,
  onSelectedSecurityChange,
  fundsWindowRequest,
  buyRequest,
  onBuyRequestConsumed,
}: InvestmentsPortfolioScreenProps) {
  const { country, amountsHidden } = useDemo();
  const { categories, formatProductAmount, getProductDisplayNumber, getProductIcon } = useProducts();
  const { t } = useLanguage();
  const { progress: headerProgress, onScroll: handlePageScroll, setProgress: setHeaderProgress } = useCollapsingHeader(64);
  const [selectedTabId, setSelectedTabId] = useState<InvestmentPortfolioTabId>("performance");
  const [czRoboSection, setCzRoboSection] = useState<"portfolio" | "explore" | "invest" | "activity" | "more">("portfolio");
  const [czRoboApprovalQueueOpen, setCzRoboApprovalQueueOpen] = useState(false);
  const [czRoboSortSheetOpen, setCzRoboSortSheetOpen] = useState(false);
  const [czRoboReturnToOrders, setCzRoboReturnToOrders] = useState(false);
  const [czRoboHistoryFilterByTitle, setCzRoboHistoryFilterByTitle] = useState<string | null>(null);
  const [czRoboHistoryFilterBySecurityId, setCzRoboHistoryFilterBySecurityId] = useState<string | null>(null);
  const [selectedPeriodId, setSelectedPeriodId] = useState<InvestmentPeriodId>("max");
  const [selectedSortId, setSelectedSortId] = useState<InvestmentSortId>("max-value");
  const [selectedDistributionItem, setSelectedDistributionItem] = useState<InvestmentDistributionItem | null>(null);
  const [securityListOpen, setSecurityListOpen] = useState(false);
  const [fundsWindowOpen, setFundsWindowOpen] = useState(false);
  const [selectedFundCollectionId, setSelectedFundCollectionId] = useState<InvestmentFundCollectionId | null>(null);
  const [selectedSecurity, setSelectedSecurity] = useState<InvestmentCatalogSecurity | null>(null);
  const [buyOrderOpen, setBuyOrderOpen] = useState(false);
  const [sellOrderOpen, setSellOrderOpen] = useState(false);
  const [roboAdvisorView, setRoboAdvisorView] = useState<"closed" | "goals" | "create" | "detail">(
    roboAdvisorEnabled && initialView === "goals" ? "goals" : "closed",
  );
  const [selectedRoboGoal, setSelectedRoboGoal] = useState<RoboExistingGoal | null>(null);
  const [roboGoals, setRoboGoals] = useState<readonly RoboExistingGoal[]>(INITIAL_CZ_ROBO_GOALS);
  const [buyOrderDraft, setBuyOrderDraft] = useState<CoAppingInvestmentBuyDraft | null>(null);
  const [portfolioJourneyOpen, setPortfolioJourneyOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const consumedFundsRequestIdRef = useRef<number | null>(null);
  const consumedBuyRequestIdRef = useRef<number | null>(null);

  // Returning to portfolio home (all sub-screens closed) should always show
  // the page scrolled to top with the large header title visible, regardless
  // of where the user had scrolled before opening a sub-screen.
  const isOnPortfolioHome = !selectedDistributionItem
    && !securityListOpen
    && !fundsWindowOpen
    && !selectedFundCollectionId
    && !selectedSecurity
    && !buyOrderOpen
    && !sellOrderOpen
    && roboAdvisorView === "closed";
  useEffect(() => {
    if (!isOnPortfolioHome) return;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0 });
    }
    setHeaderProgress(0);
  }, [isOnPortfolioHome]);

  const allProducts = useMemo(() => categories.flatMap((category) => category.products), [categories]);
  const portfolioEntryProduct = useMemo(
    () => allProducts.find((product) => product.type === "investment_account") ?? null,
    [allProducts],
  );
  const currentAccounts = useMemo(
    () => allProducts.filter((product): product is CurrentAccount => product.type === "current_account"),
    [allProducts],
  );
  const investmentProducts = useMemo(() => getInvestmentProducts(allProducts), [allProducts]);
  const securities = useMemo(() => buildInvestmentSecurities(investmentProducts, country), [country, investmentProducts]);
  const securityCatalog = useMemo(
    () => buildInvestmentSecurityCatalog(securities, country, {
      includeRoboGoals: roboAdvisorEnabled,
    }),
    [country, roboAdvisorEnabled, securities],
  );
  const investmentHistoryTransactions = useMemo(
    () => buildInvestmentHistoryTransactions(securities, country, {
      includeCzRoboHistoricalTransactions: showBottomNavigation,
    }),
    [country, securities, showBottomNavigation],
  );
  const financialSecurities = useMemo(
    () => securities.filter((security) => security.status === "active" && security.localValue > 0),
    [securities],
  );
  const sortedSecurities = useMemo(() => sortInvestmentSecurities(securities, selectedSortId), [securities, selectedSortId]);
  const activeSecurities = sortedSecurities.filter((security) => security.status === "active");
  const inactiveSecurities = sortedSecurities.filter((security) => security.status === "inactive");
  const activeSortOptionLabel = INVESTMENT_SORT_OPTIONS.find((option) => option.id === selectedSortId)?.label ?? "MAX VALUE";
  const activeSortDescending = selectedSortId === "max-value" || selectedSortId === "max-percent";
  const portfolioCurrency = getCountryConfig(country).currency;
  const {
    totalValue,
    performanceAmount: totalPerformanceAmount,
    performancePercent: totalPerformancePercent,
  } = calculateInvestmentPortfolioPerformance(securities);
  const chartPoints = useMemo(() => buildInvestmentChartPoints(totalValue, selectedPeriodId), [selectedPeriodId, totalValue]);
  const distributionItems = useMemo(
    () => buildInvestmentDistributionItems(financialSecurities, selectedTabId),
    [financialSecurities, selectedTabId],
  );

  const totalValueParts = formatInvestmentAmountParts(totalValue, country, portfolioCurrency, amountsHidden);
  const performanceParts = formatInvestmentAmountParts(
    totalPerformanceAmount,
    country,
    portfolioCurrency,
    amountsHidden,
    showBottomNavigation,
  );
  const totalPerformancePercentLabel = amountsHidden
    ? "**,**%"
    : `${Math.abs(totalPerformancePercent).toFixed(2).replace(".", ",")}%`;

  useEffect(
    () => () => {
      onSelectedSecurityChange?.(null);
    },
    [onSelectedSecurityChange],
  );

  const selectSecurity = (security: InvestmentCatalogSecurity | null) => {
    setSelectedSecurity(security);
    onSelectedSecurityChange?.(security);
  };

  useEffect(() => {
    if (
      !fundsWindowRequest
      || consumedFundsRequestIdRef.current === fundsWindowRequest.requestId
    ) return;

    consumedFundsRequestIdRef.current = fundsWindowRequest.requestId;
    setSelectedDistributionItem(null);
    setSecurityListOpen(false);
    setSelectedFundCollectionId(fundsWindowRequest.collectionId ?? null);
    setSelectedSecurity(null);
    setBuyOrderOpen(false);
    setSellOrderOpen(false);
    setBuyOrderDraft(null);
    onSelectedSecurityChange?.(null);
    setFundsWindowOpen(!fundsWindowRequest.collectionId);
  }, [fundsWindowRequest, onSelectedSecurityChange]);

  useEffect(() => {
    if (!buyRequest || consumedBuyRequestIdRef.current === buyRequest.requestId) return;

    consumedBuyRequestIdRef.current = buyRequest.requestId;
    const requestedSecurity = securityCatalog.find((security) => security.id === buyRequest.securityId) ?? null;
    if (requestedSecurity) {
      setSelectedSecurity(requestedSecurity);
      onSelectedSecurityChange?.(requestedSecurity);
      setBuyOrderDraft(buyRequest.draft ?? null);
      setSellOrderOpen(false);
      setBuyOrderOpen(true);
    }
    onBuyRequestConsumed?.(buyRequest.requestId);
  }, [buyRequest, onBuyRequestConsumed, onSelectedSecurityChange, securityCatalog]);


  const renderSecurity = (security: InvestmentSecurity) => (
    <InvestmentProductCard
      key={security.id}
      security={security}
      valueParts={formatInvestmentAmountParts(security.value, country, security.currency, amountsHidden)}
      performanceParts={formatInvestmentAmountParts(
        security.performanceAmount,
        country,
        security.localCurrency,
        amountsHidden,
        showBottomNavigation,
      )}
      valueLabel={t("runtime.investments.value", "Value")}
      performanceLabel={t("runtime.investments.performance", "Performance")}
      czRoboAmountStyle={showBottomNavigation}
      amountsHidden={amountsHidden}
      currentPriceParts={showBottomNavigation
        ? formatInvestmentAmountParts(security.marketPrice, country, security.instrumentCurrency, amountsHidden)
        : undefined}
      portfolioValueParts={showBottomNavigation
        ? formatInvestmentAmountParts(security.localValue, country, security.localCurrency, amountsHidden)
        : undefined}
      onClick={() => selectSecurity(securityCatalog.find((item) => item.id === security.id) ?? null)}
    />
  );

  const formatDistributionAmount = (value: number, itemCurrency: string) =>
    formatInvestmentAmountParts(value, country, itemCurrency, amountsHidden);

  const downloadConsolidatedReport = () => {
    const rows = [
      ["Product", "Product ID", "Product type", "Asset class", "Quantity", "Market value", "Currency", "Local value", "Local currency", "Performance amount", "Performance percent"],
      ...securityCatalog.filter((security) => security.owned).map((security) => [
        security.title,
        security.productId,
        security.productType,
        security.assetClass,
        security.quantity,
        security.value,
        security.instrumentCurrency,
        security.localValue,
        security.localCurrency,
        security.performanceAmount,
        security.performancePercent,
      ]),
    ];
    const csv = `\uFEFF${rows
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\r\n")}`;
    const file = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `investment-consolidated-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
  };

  const handleBottomNavigationChange = (tab: NavItem) => {
    if (showBottomNavigation && (tab !== "products" || czRoboSection !== "activity")) {
      setCzRoboHistoryFilterByTitle(null);
      setCzRoboHistoryFilterBySecurityId(null);
    }
    if (showBottomNavigation && tab === "home") {
      setCzRoboSection("portfolio");
      setCzRoboApprovalQueueOpen(false);
      setSecurityListOpen(false);
      setFundsWindowOpen(false);
      return;
    }
    if (showBottomNavigation && tab === "payments") {
      setCzRoboSection("invest");
      setCzRoboApprovalQueueOpen(false);
      setSelectedSecurity(null);
      setSecurityListOpen(true);
      return;
    }
    if (showBottomNavigation && tab === "investments") {
      setCzRoboSection("explore");
      setCzRoboApprovalQueueOpen(false);
      setSecurityListOpen(false);
      return;
    }
    if (showBottomNavigation && tab === "products") {
      setCzRoboSection("activity");
      setCzRoboApprovalQueueOpen(false);
      setCzRoboReturnToOrders(false);
      setSecurityListOpen(false);
      return;
    }
    if (showBottomNavigation && tab === "more") {
      setCzRoboSection("more");
      setCzRoboApprovalQueueOpen(false);
      setSecurityListOpen(false);
      return;
    }
    onBottomNavigationChange(tab);
  };

  const wrapWithBottomNavigation = (activeTab: NavItem, children: ReactNode) => showBottomNavigation
    ? (
      <TabbedScreen
        active
        activeTab={activeTab}
        items={MY_BANKER_NAV_ITEMS}
        iconOverrides={CZ_ROBO_NAV_ICON_OVERRIDES}
        labelOverrides={CZ_ROBO_NAV_LABEL_OVERRIDES}
        onTabChange={handleBottomNavigationChange}
      >
        {children}
      </TabbedScreen>
    )
    : children;

  if (showBottomNavigation && czRoboSection === "activity") {
    if (czRoboApprovalQueueOpen) {
      return <OrdersToApproveScreen onBack={() => setCzRoboApprovalQueueOpen(false)} />;
    }
    return wrapWithBottomNavigation(
      "products",
      <InvestmentsHistoryScreen
        onBack={onBack}
        closeModuleButton={showBottomNavigation}
        titleOverride="Activity"
        initialTab={czRoboReturnToOrders ? "orders" : "transactions"}
        historyFilterByTitle={czRoboHistoryFilterByTitle}
        historyFilterBySecurityId={czRoboHistoryFilterBySecurityId}
        includeCzRoboHistoricalTransactions={showBottomNavigation}
        approvalCount={20}
        onToApproveClick={() => {
          setCzRoboReturnToOrders(true);
          setCzRoboApprovalQueueOpen(true);
        }}
      />,
    );
  }

  if (selectedSecurity && buyOrderOpen) {
    return (
      <InvestmentBuyOrderFlow
        security={selectedSecurity}
        accounts={currentAccounts}
        country={country}
        amountsHidden={amountsHidden}
        initialDraft={buyOrderDraft}
        onBack={() => {
          setBuyOrderOpen(false);
          setBuyOrderDraft(null);
        }}
        onComplete={() => {
          setBuyOrderOpen(false);
          setBuyOrderDraft(null);
          selectSecurity(null);
          setSecurityListOpen(false);
        }}
      />
    );
  }

  if (selectedSecurity && sellOrderOpen) {
    return (
      <InvestmentSellOrderFlow
        security={selectedSecurity}
        accounts={currentAccounts}
        country={country}
        amountsHidden={amountsHidden}
        onBack={() => setSellOrderOpen(false)}
        onComplete={() => {
          setSellOrderOpen(false);
          selectSecurity(null);
          setSecurityListOpen(false);
        }}
      />
    );
  }

  if (selectedSecurity) {
    return (
      <InvestmentSecurityDetailScreen
        security={selectedSecurity}
        transactions={investmentHistoryTransactions}
        country={country}
        amountsHidden={amountsHidden}
        czRoboProductDetail={showBottomNavigation}
        onBack={() => selectSecurity(null)}
        onHistoryClick={() => onHistoryClick?.(selectedSecurity.title)}
        onSeeMoreTransactions={() => {
          setCzRoboHistoryFilterByTitle(selectedSecurity.title);
          setCzRoboHistoryFilterBySecurityId(selectedSecurity.id);
          setCzRoboSection("activity");
          setCzRoboApprovalQueueOpen(false);
          setCzRoboReturnToOrders(false);
          setSecurityListOpen(false);
          setFundsWindowOpen(false);
          setSelectedDistributionItem(null);
          setSelectedFundCollectionId(null);
          setRoboAdvisorView("closed");
          setSelectedRoboGoal(null);
          selectSecurity(null);
        }}
        onSellClick={() => setSellOrderOpen(true)}
        onBuyClick={() => {
          setBuyOrderDraft(null);
          setBuyOrderOpen(true);
        }}
      />
    );
  }

  if (roboAdvisorView === "goals") {
    return (
      <CzInvestmentGoalsScreen
        goals={roboGoals}
        onBack={() => {
          if (initialView === "goals") onBack();
          else setRoboAdvisorView("closed");
        }}
        onCreateGoal={() => setRoboAdvisorView("create")}
        onOpenGoal={(goal) => {
          setSelectedRoboGoal(goal);
          setRoboAdvisorView("detail");
        }}
      />
    );
  }

  if (roboAdvisorView === "create" || roboAdvisorView === "detail") {
    return (
      <CzFutureRoboAdvisorFlow
        initialGoal={roboAdvisorView === "detail" ? selectedRoboGoal ?? undefined : undefined}
        onOpenSecurity={({ securityId, localValue, performancePercent }) => {
          const security = securityCatalog.find((item) => item.id === securityId);
          if (!security) {
            selectSecurity(null);
            return;
          }

          const value = roundMoney(convertCurrency(
            localValue,
            security.localCurrency,
            security.instrumentCurrency,
          ));
          selectSecurity({
            ...security,
            owned: true,
            value,
            localValue,
            performancePercent,
            performanceAmount: roundMoney((localValue * performancePercent) / 100),
            quantity: Number((value / security.marketPrice).toFixed(6)),
          });
        }}
        onGoalUpdated={(updatedGoal) => {
          setRoboGoals((goals) => goals.map((goal) => (
            goal.id === updatedGoal.id ? updatedGoal : goal
          )));
          setSelectedRoboGoal(updatedGoal);
        }}
        onBack={() => {
          setSelectedRoboGoal(null);
          setRoboAdvisorView("goals");
        }}
        onExit={() => {
          setSelectedRoboGoal(null);
          setRoboAdvisorView("goals");
        }}
      />
    );
  }

  if (securityListOpen) {
    const securityListScreen = (
      <InvestmentSecurityListScreen
        securities={securityCatalog}
        country={country}
        amountsHidden={amountsHidden}
        closeModuleButton={showBottomNavigation && czRoboSection === "invest"}
        czRoboAmountStyle={showBottomNavigation}
        onBack={() => {
          if (showBottomNavigation && czRoboSection === "invest") {
            onBack();
            return;
          }
          setSecurityListOpen(false);
        }}
        onSelect={selectSecurity}
      />
    );
    return czRoboSection === "invest"
      ? wrapWithBottomNavigation("payments", securityListScreen)
      : securityListScreen;
  }

  if (selectedFundCollectionId) {
    return (
      <InvestmentFundCollectionScreen
        collectionId={selectedFundCollectionId}
        securities={securityCatalog}
        country={country}
        amountsHidden={amountsHidden}
        onBack={() => setSelectedFundCollectionId(null)}
        onSelectSecurity={selectSecurity}
      />
    );
  }

  if (fundsWindowOpen) {
    return (
      <InvestmentFundsSelectionScreen
        onBack={() => setFundsWindowOpen(false)}
        onSearch={() => setSecurityListOpen(true)}
        onSelectCollection={setSelectedFundCollectionId}
      />
    );
  }

  if (showBottomNavigation && czRoboSection === "more") {
    return wrapWithBottomNavigation("more", (
      <div className="h-full w-full overflow-y-auto bg-[var(--uc-surface)] text-[var(--uc-text)] scrollbar-hide">
        <PageHeader
          title="More"
          onBack={onBack}
          backIconName="close-flow"
          backLabel="Close Investments"
          includeSafeArea
          showHelp
          onHelpClick={() => undefined}
        />
        <section className="px-[24px] pt-[24px]" aria-labelledby="cz-robo-reports">
          <SectionHeadingDivider title="REPORTS" />
          <button
            type="button"
            onClick={downloadConsolidatedReport}
            className="mt-[12px] flex w-full items-center gap-[12px] rounded-[8px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] p-[16px] text-left"
            aria-label="Download consolidated investment report as CSV"
          >
            <span className="grid size-[40px] shrink-0 place-items-center rounded-full bg-[var(--uc-surface-muted)]">
              <AppIcon name="investment-download-report" color="var(--uc-action)" />
            </span>
            <span className="min-w-0 flex-1">
              <span id="cz-robo-reports" className="block uc-type-n4-strong text-[var(--uc-text)]">Consolidated report</span>
              <span className="mt-[4px] block uc-type-n5 text-[var(--uc-text-muted)]">Download your current holdings and performance.</span>
            </span>
            <span className="shrink-0 text-[13px] font-bold uppercase text-[var(--uc-action)]">CSV</span>
          </button>
        </section>
      </div>
    ));
  }

  if (showBottomNavigation && czRoboSection === "explore") {
    return wrapWithBottomNavigation("investments", (
      <div className="h-full w-full overflow-y-auto bg-[var(--uc-surface)] text-[var(--uc-text)] scrollbar-hide">
        <PageHeader
          title="Explore"
          onBack={onBack}
          backIconName="close-flow"
          backLabel="Close Investments"
          includeSafeArea
          showHelp
          onHelpClick={() => undefined}
        />
        <div className="px-[24px] pt-[18px]">
          <p className="text-[16px] leading-[21px] text-[var(--uc-text)]">
            Discover investment ideas, browse funds and learn how they work.
          </p>
          <SectionHeadingDivider title="A good place to start" className="mt-[24px]" />
        </div>
        <InvestmentFundCarousel onSelectCollection={setSelectedFundCollectionId} />
      </div>
    ));
  }

  if (selectedDistributionItem && selectedTabId !== "performance") {
    return (
      <DistributionCategoryDetailScreen
        item={selectedDistributionItem}
        tabId={selectedTabId}
        securities={financialSecurities}
        onBack={() => setSelectedDistributionItem(null)}
        formatDistributionAmount={formatDistributionAmount}
      />
    );
  }

  if (myBankerDestination && !portfolioJourneyOpen) {
    const portfolioAmount = portfolioEntryProduct
      ? maskAmountParts(formatProductAmount(portfolioEntryProduct), amountsHidden)
      : null;
    const investmentOptions = [
      {
        id: "term-deposit",
        label: t("runtime.investments.destination.termDeposit", "Term deposit"),
        onClick: onTermDepositClick,
      },
      {
        id: "investment-funds",
        label: t("runtime.investments.destination.investmentFunds", "Investment funds"),
        onClick: () => setFundsWindowOpen(true),
      },
      {
        id: "stocks",
        label: t("runtime.investments.destination.stocks", "Stocks"),
        onClick: () => setSecurityListOpen(true),
      },
    ];

    return (
      <div
        className="h-full w-full overflow-y-auto overflow-x-hidden bg-[var(--uc-surface)] text-[var(--uc-text)] scrollbar-hide"
        style={bottomInset > 0 ? { paddingBottom: bottomInset } : undefined}
        data-my-banker-investments-destination="true"
      >
        <PageHeader
          title={t("runtime.investments.title", "Investment")}
          onBack={onBack}
          includeSafeArea
          showHelp
          onHelpClick={() => undefined}
        />
        {headerSlot ? <div className="px-[16px] pb-[8px]">{headerSlot}</div> : null}

        <section className="px-[16px] pt-[16px]" aria-labelledby="current-investment-portfolio">
          <h2 id="current-investment-portfolio" className="uc-type-n4-strong mb-[12px] text-[var(--uc-text)]">
            {t("runtime.investments.destination.currentPortfolio", "Your investment portfolio")}
          </h2>
          {portfolioEntryProduct && portfolioAmount ? (
            <div data-investment-portfolio-entry="true">
              <ProductCard
                icon={getProductIcon(portfolioEntryProduct)}
                title={portfolioEntryProduct.name}
                accountNumber={getProductDisplayNumber(portfolioEntryProduct)}
                amount={portfolioAmount.integer}
                decimals={portfolioAmount.decimals}
                currency={portfolioAmount.currency}
                onClick={() => setPortfolioJourneyOpen(true)}
              />
            </div>
          ) : (
            <EmptyInvestmentsState />
          )}
        </section>

        <section className="px-[16px] pt-[28px]" aria-labelledby="investment-options">
          <h2 id="investment-options" className="uc-type-n4-strong mb-[12px] text-[var(--uc-text)]">
            {t("runtime.investments.destination.options", "Investment Options")}
          </h2>
          <div className="overflow-hidden rounded-[8px] border border-[var(--uc-border-muted)]">
            {investmentOptions.map((option, index) => (
              <button
                key={option.id}
                type="button"
                aria-label={option.label}
                className={`flex min-h-[64px] w-full items-center justify-between bg-[var(--uc-surface)] px-[16px] text-left ${index > 0 ? "border-t border-[var(--uc-border-muted)]" : ""}`}
                data-investment-option={option.id}
                onClick={option.onClick}
              >
                <span className="uc-type-n4-strong text-[var(--uc-text)]">{option.label}</span>
                <AppIcon name="chevron-link" color="var(--uc-text)" />
              </button>
            ))}
          </div>
        </section>
      </div>
    );
  }

  const investmentActionBar = (
    <InvestmentActionBar
      actions={[
        {
          id: "history",
          iconName: "investment-history",
          label: t("runtime.investments.actions.history", "History"),
          onClick: () => onHistoryClick?.(),
        },
        {
          id: "to-approve",
          iconName: "investment-to-approve",
          label: t("runtime.investments.actions.toApprove", "To approve"),
          badgeCount: 20,
          onClick: onOrdersToApproveClick,
        },
        {
          id: "download-report",
          iconName: "investment-download-report",
          label: t("runtime.investments.actions.downloadReport", "Consolidated\nreport"),
        },
      ]}
      investLabel={t("runtime.investments.actions.invest", "Invest")}
      onInvestClick={() => setSecurityListOpen(true)}
    />
  );

  return wrapWithBottomNavigation("home", (
      <div
        ref={scrollContainerRef}
        className="h-full w-full overflow-y-auto overflow-x-hidden bg-[var(--uc-surface)] text-[var(--uc-text)] scrollbar-hide"
        onScroll={handlePageScroll}
        style={bottomInset > 0 ? { paddingBottom: bottomInset } : undefined}
      >
      <PageHeader
        title={showBottomNavigation ? "Portfolio details" : t("runtime.investments.title", "Investment")}
        onBack={() => {
          if (myBankerDestination && portfolioJourneyOpen) {
            setPortfolioJourneyOpen(false);
            return;
          }
          onBack();
        }}
        backIconName={showBottomNavigation ? "close-flow" : undefined}
        backLabel={showBottomNavigation ? "Close Investments" : undefined}
        collapsedTitleProgress={headerProgress}
        includeSafeArea
        showHelp
        onHelpClick={() => undefined}
      />
      {headerSlot ? <div className="px-[16px] pb-[8px]">{headerSlot}</div> : null}
      {!showBottomNavigation ? (
        <InvestmentPortfolioTabs
          tabs={INVESTMENT_PORTFOLIO_TABS.map((tab) => ({
            ...tab,
            label: t(`runtime.investments.tabs.${TAB_TRANSLATION_KEYS[tab.id]}`, tab.label),
          }))}
          selectedTabId={selectedTabId}
          onChange={setSelectedTabId}
        />
      ) : null}

      {securities.length > 0 ? (
        <>
          <PortfolioSummary
            totalValue={totalValueParts}
            performanceAmount={performanceParts}
            performancePercentLabel={totalPerformancePercentLabel}
            performanceAmountValue={totalPerformanceAmount}
            performancePercentValue={totalPerformancePercent}
            amountsHidden={amountsHidden}
            currency={portfolioCurrency}
            czRoboAmountStyle={showBottomNavigation}
          />
          {showBottomNavigation || selectedTabId === "performance" ? (
              <div className={showBottomNavigation ? "px-[16px]" : "px-[8px]"}>
              <InvestmentPortfolioChart
                points={chartPoints}
                country={country}
                currency={portfolioCurrency}
                amountsHidden={amountsHidden}
                showVerticalGridLines={!showBottomNavigation}
                edgeToEdge={showBottomNavigation}
                tightBottomPadding={showBottomNavigation}
              />
              <InvestmentPeriodChips
                periods={INVESTMENT_PERIODS}
                selectedPeriodId={selectedPeriodId}
                onChange={setSelectedPeriodId}
                softUnselected={showBottomNavigation}
                className={showBottomNavigation ? "py-[8px]" : ""}
              />
            </div>
          ) : null}
          {showBottomNavigation ? (
            <>
              <h2 className="px-[16px] pb-[8px] pt-[32px] text-[20px] font-bold leading-[24px] text-[var(--uc-text)]">
                Investments allocation by
              </h2>
              <InvestmentPortfolioTabs
                tabs={INVESTMENT_PORTFOLIO_TABS.map((tab) => ({
                  ...tab,
                  label: t(`runtime.investments.tabs.${TAB_TRANSLATION_KEYS[tab.id]}`, tab.label),
                }))}
                selectedTabId={selectedTabId}
                onChange={setSelectedTabId}
                variant="chips"
              />
            </>
          ) : null}
          {selectedTabId !== "performance" ? (
            <InvestmentDistributionChart
              title={t(
                `runtime.investments.distributionTitles.${DISTRIBUTION_TITLE_TRANSLATION_KEYS[selectedTabId]}`,
                getInvestmentDistributionTitle(selectedTabId),
              )}
              items={distributionItems}
              formatAmount={formatDistributionAmount}
              czRoboAmountStyle={showBottomNavigation}
              hideDonut={showBottomNavigation}
              totalLabel={t("runtime.investments.total", "Total")}
              onItemClick={setSelectedDistributionItem}
              headerExtra={showBottomNavigation ? undefined : investmentActionBar}
            />
          ) : null}
          {selectedTabId === "performance" ? (
            <>
              {showBottomNavigation ? null : investmentActionBar}
              {!showBottomNavigation ? (
                <SectionHeadingDivider
                  title={t("runtime.investments.allProducts", "ALL PRODUCTS")}
                  count={securities.length}
                  countAlign="end"
                  className="px-[24px] pt-[8px]"
                />
              ) : null}
              {!showBottomNavigation ? (
                <InvestmentFilterChips
                  options={INVESTMENT_SORT_OPTIONS}
                  selectedOptionId={selectedSortId}
                  onChange={setSelectedSortId}
                />
              ) : null}
              {showBottomNavigation ? (
                <section className="flex flex-col" data-cz-robo-active-securities="true">
                  <div className="flex min-h-[56px] items-center justify-between gap-[8px] px-[16px]">
                    <h2 className="uc-type-n4-strong text-[var(--uc-text)]">
                      {t("runtime.investments.activeSecurities", "ACTIVE SECURITIES")} ({activeSecurities.length})
                    </h2>
                    <button
                      type="button"
                      aria-label={`Sort securities. Current sort: ${activeSortOptionLabel}`}
                      aria-haspopup="dialog"
                      aria-expanded={czRoboSortSheetOpen}
                      onClick={() => setCzRoboSortSheetOpen(true)}
                      className="inline-flex h-[34px] shrink-0 items-center gap-[6px] text-[14px] font-bold uppercase leading-[16px] text-[#007A91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
                      data-cz-robo-security-sort-trigger="true"
                    >
                      <span>{activeSortOptionLabel}</span>
                      <svg
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        style={{ transform: activeSortDescending ? "rotate(180deg)" : undefined }}
                      >
                        <path fillRule="evenodd" clipRule="evenodd" d="M8.00016 0.666992L14.6668 6.64145C13.7451 7.46519 12.2535 7.46519 11.3335 6.64145L9.17794 4.71057V15.3337L6.8215 15.3328V4.71057L4.66683 6.64145C3.74683 7.46519 2.2535 7.46519 1.3335 6.64145L8.00016 0.666992Z" fill="#007A91" />
                      </svg>
                    </button>
                  </div>
                  <div>{activeSecurities.map(renderSecurity)}</div>
                </section>
              ) : (
                <InvestmentProductsAccordion
                  title={t("runtime.investments.activeSecurities", "ACTIVE SECURITIES")}
                  count={activeSecurities.length}
                  defaultOpen
                >
                  <div>{activeSecurities.map(renderSecurity)}</div>
                </InvestmentProductsAccordion>
              )}
              {!showBottomNavigation ? (
                <InvestmentProductsAccordion
                  title={t("runtime.investments.inactiveSecurities", "INACTIVE SECURITIES")}
                  count={inactiveSecurities.length}
                  defaultOpen={false}
                >
                  <div>{inactiveSecurities.map(renderSecurity)}</div>
                </InvestmentProductsAccordion>
              ) : null}
            </>
          ) : null}
          <div className="h-[28px]" />
        </>
      ) : (
        <EmptyInvestmentsState />
      )}
      {showBottomNavigation && czRoboSortSheetOpen ? (
        <BottomSheet title="Sort securities" onClose={() => setCzRoboSortSheetOpen(false)}>
          <div role="radiogroup" aria-label="Sort securities">
            {INVESTMENT_SORT_OPTIONS.map((option) => {
              const selected = option.id === selectedSortId;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setSelectedSortId(option.id);
                    setCzRoboSortSheetOpen(false);
                  }}
                  className="flex min-h-[56px] w-full items-center justify-between border-b border-[var(--uc-border-muted)] px-[8px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
                >
                  <span className="text-[16px] font-bold text-[var(--uc-text)]">{option.label}</span>
                  <AppIcon
                    name={selected ? "radio-selected" : "radio-unselected"}
                    color={selected ? "var(--uc-action)" : "var(--uc-text-muted)"}
                    size={24}
                  />
                </button>
              );
            })}
          </div>
        </BottomSheet>
      ) : null}
      </div>
    ));
}
