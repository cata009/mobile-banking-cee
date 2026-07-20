import { useEffect, useMemo, useRef, useState, type UIEvent } from "react";
import InvestmentDistributionChart from "@/app/components/investments/InvestmentDistributionChart";
import InvestmentActionBar from "@/app/components/investments/InvestmentActionBar";
import InvestmentFilterChips from "@/app/components/investments/InvestmentFilterChips";
import InvestmentPeriodChips from "@/app/components/investments/InvestmentPeriodChips";
import InvestmentPortfolioChart from "@/app/components/investments/InvestmentPortfolioChart";
import InvestmentPortfolioTabs from "@/app/components/investments/InvestmentPortfolioTabs";
import InvestmentProductCard, { type InvestmentAmountParts } from "@/app/components/investments/InvestmentProductCard";
import InvestmentProductsAccordion from "@/app/components/investments/InvestmentProductsAccordion";
import InvestmentsFundBanner from "@/app/components/investments/InvestmentsFundBanner";
import InvestmentBuyOrderFlow from "@/app/screens/investments/InvestmentBuyOrderFlow";
import { InvestmentSecurityDetailScreen, InvestmentSecurityListScreen } from "@/app/screens/investments/InvestmentSecurityScreens";
import { AppIcon } from "@/app/components/icons";
import PageHeader from "@/app/components/PageHeader";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import {
  INVESTMENT_PERIODS,
  INVESTMENT_PORTFOLIO_TABS,
  INVESTMENT_SORT_OPTIONS,
  buildInvestmentDistributionItems,
  buildInvestmentChartPoints,
  buildInvestmentSecurities,
  buildInvestmentSecurityCatalog,
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
import { getCountryConfig } from "@/app/registry/countryConfig";
import { useLanguage } from "@/app/contexts/LanguageContext";
import type { CountryId } from "@/app/state/demoTypes";
import { useDemo } from "@/app/state/demoStore";
import { maskAmountParts } from "@/app/utils/amountPrivacy";
import { useProducts } from "@/hooks/useProducts";
import type { CurrentAccount } from "@/data/products";

interface InvestmentsPortfolioScreenProps {
  onBack: () => void;
  onHistoryClick?: (filterByTitle?: string) => void;
  onSelectedSecurityChange?: (security: InvestmentCatalogSecurity | null) => void;
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

function formatAmountParts(amount: number, country: CountryId, currency: string): InvestmentAmountParts {
  const config = getCountryConfig(country);
  const absoluteAmount = Math.abs(amount);
  const formatter = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const parts = formatter.formatToParts(absoluteAmount);
  const integer = parts
    .filter((part) => part.type === "integer" || part.type === "group")
    .map((part) => part.value)
    .join("");
  const decimalSeparator = parts.find((part) => part.type === "decimal")?.value ?? ",";
  const fraction = parts.find((part) => part.type === "fraction")?.value ?? "00";

  return {
    integer: `${integer || "0"}`,
    decimal: `${decimalSeparator}${fraction}`,
    currency,
  };
}

function maskInvestmentAmount(parts: InvestmentAmountParts, hidden: boolean): InvestmentAmountParts {
  const masked = maskAmountParts(
    {
      integer: parts.integer,
      decimals: parts.decimal,
      currency: parts.currency,
    },
    hidden,
  );

  return {
    integer: masked.integer,
    decimal: masked.decimals,
    currency: masked.currency,
  };
}

function PortfolioSummary({
  totalValue,
  performanceAmount,
  performancePercentLabel,
  performanceAmountValue,
  performancePercentValue,
  amountsHidden,
  currency,
}: {
  totalValue: InvestmentAmountParts;
  performanceAmount: InvestmentAmountParts;
  performancePercentLabel: string;
  performanceAmountValue: number;
  performancePercentValue: number;
  amountsHidden: boolean;
  currency: string;
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
  const [headerProgress, setHeaderProgress] = useState(0);
  const matchingSecurities = securities.filter((security) => getInvestmentDistributionGroupKey(security, tabId) === item.id);
  const totalParts = formatDistributionAmount(item.value, item.currency);
  const categoryTitle = item.label.toUpperCase();

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setHeaderProgress(Math.min(1, Math.max(0, event.currentTarget.scrollTop / 64)));
  };

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
  onHistoryClick,
  onSelectedSecurityChange,
}: InvestmentsPortfolioScreenProps) {
  const { country, amountsHidden } = useDemo();
  const { categories } = useProducts();
  const { t } = useLanguage();
  const [headerProgress, setHeaderProgress] = useState(0);
  const [selectedTabId, setSelectedTabId] = useState<InvestmentPortfolioTabId>("performance");
  const [selectedPeriodId, setSelectedPeriodId] = useState<InvestmentPeriodId>("max");
  const [selectedSortId, setSelectedSortId] = useState<InvestmentSortId>("max-value");
  const [selectedDistributionItem, setSelectedDistributionItem] = useState<InvestmentDistributionItem | null>(null);
  const [securityListOpen, setSecurityListOpen] = useState(false);
  const [selectedSecurity, setSelectedSecurity] = useState<InvestmentCatalogSecurity | null>(null);
  const [buyOrderOpen, setBuyOrderOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Returning to portfolio home (all sub-screens closed) should always show
  // the page scrolled to top with the large header title visible, regardless
  // of where the user had scrolled before opening a sub-screen.
  const isOnPortfolioHome = !selectedDistributionItem && !securityListOpen && !selectedSecurity && !buyOrderOpen;
  useEffect(() => {
    if (!isOnPortfolioHome) return;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0 });
    }
    setHeaderProgress(0);
  }, [isOnPortfolioHome]);

  const allProducts = useMemo(() => categories.flatMap((category) => category.products), [categories]);
  const currentAccounts = useMemo(
    () => allProducts.filter((product): product is CurrentAccount => product.type === "current_account"),
    [allProducts],
  );
  const investmentProducts = useMemo(() => getInvestmentProducts(allProducts), [allProducts]);
  const securities = useMemo(() => buildInvestmentSecurities(investmentProducts, country), [country, investmentProducts]);
  const securityCatalog = useMemo(() => buildInvestmentSecurityCatalog(securities, country), [country, securities]);
  const financialSecurities = useMemo(
    () => securities.filter((security) => security.status === "active" && security.localValue > 0),
    [securities],
  );
  const sortedSecurities = useMemo(() => sortInvestmentSecurities(securities, selectedSortId), [securities, selectedSortId]);
  const activeSecurities = sortedSecurities.filter((security) => security.status === "active");
  const inactiveSecurities = sortedSecurities.filter((security) => security.status === "inactive");
  const portfolioCurrency = getCountryConfig(country).currency;
  const totalValue = financialSecurities.reduce((sum, security) => sum + security.localValue, 0);
  const totalPerformanceAmount = financialSecurities.reduce((sum, security) => sum + security.performanceAmount, 0);
  const totalPerformancePercent = totalValue > 0 ? (totalPerformanceAmount / totalValue) * 100 : 0;
  const chartPoints = useMemo(() => buildInvestmentChartPoints(totalValue, selectedPeriodId), [selectedPeriodId, totalValue]);
  const distributionItems = useMemo(
    () => buildInvestmentDistributionItems(financialSecurities, selectedTabId),
    [financialSecurities, selectedTabId],
  );

  const totalValueParts = maskInvestmentAmount(formatAmountParts(totalValue, country, portfolioCurrency), amountsHidden);
  const performanceParts = maskInvestmentAmount(formatAmountParts(totalPerformanceAmount, country, portfolioCurrency), amountsHidden);
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

  const handlePageScroll = (event: UIEvent<HTMLDivElement>) => {
    const progress = Math.min(1, Math.max(0, event.currentTarget.scrollTop / 64));
    setHeaderProgress(progress);
  };

  const renderSecurity = (security: InvestmentSecurity) => (
    <InvestmentProductCard
      key={security.id}
      security={security}
      valueParts={maskInvestmentAmount(formatAmountParts(security.value, country, security.currency), amountsHidden)}
      performanceParts={maskInvestmentAmount(formatAmountParts(security.performanceAmount, country, security.localCurrency), amountsHidden)}
      valueLabel={t("runtime.investments.value", "Value")}
      performanceLabel={t("runtime.investments.performance", "Performance")}
      onClick={() => selectSecurity(securityCatalog.find((item) => item.id === security.id) ?? null)}
    />
  );

  const formatDistributionAmount = (value: number, itemCurrency: string) =>
    maskInvestmentAmount(formatAmountParts(value, country, itemCurrency), amountsHidden);

  if (selectedSecurity && buyOrderOpen) {
    return (
      <InvestmentBuyOrderFlow
        security={selectedSecurity}
        accounts={currentAccounts}
        country={country}
        amountsHidden={amountsHidden}
        onBack={() => setBuyOrderOpen(false)}
        onComplete={() => {
          setBuyOrderOpen(false);
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
        country={country}
        amountsHidden={amountsHidden}
        onBack={() => selectSecurity(null)}
        onHistoryClick={() => onHistoryClick?.(selectedSecurity.title)}
        onBuyClick={() => setBuyOrderOpen(true)}
      />
    );
  }

  if (securityListOpen) {
    return (
      <InvestmentSecurityListScreen
        securities={securityCatalog}
        country={country}
        amountsHidden={amountsHidden}
        onBack={() => setSecurityListOpen(false)}
        onSelect={selectSecurity}
      />
    );
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

  const investmentActionBar = (
    <InvestmentActionBar
      actions={[
        {
          id: "history",
          iconName: "investment-history",
          label: t("runtime.investments.actions.history", "History"),
          onClick: onHistoryClick,
        },
        {
          id: "to-approve",
          iconName: "investment-to-approve",
          label: t("runtime.investments.actions.toApprove", "To approve"),
          badgeCount: 20,
        },
        {
          id: "download-report",
          iconName: "investment-download-report",
          label: t("runtime.investments.actions.downloadReport", "Download\nReport"),
        },
      ]}
      investLabel={t("runtime.investments.actions.invest", "Invest")}
      onInvestClick={() => setSecurityListOpen(true)}
    />
  );

  return (
    <div
      ref={scrollContainerRef}
      className="h-full w-full overflow-y-auto bg-[var(--uc-surface)] text-[var(--uc-text)] scrollbar-hide"
      onScroll={handlePageScroll}
    >
      <PageHeader
        title={t("runtime.investments.title", "Investment")}
        onBack={onBack}
        collapsedTitleProgress={headerProgress}
        includeSafeArea
        showHelp
        onHelpClick={() => undefined}
      />
      <InvestmentPortfolioTabs
        tabs={INVESTMENT_PORTFOLIO_TABS.map((tab) => ({
          ...tab,
          label: t(`runtime.investments.tabs.${TAB_TRANSLATION_KEYS[tab.id]}`, tab.label),
        }))}
        selectedTabId={selectedTabId}
        onChange={setSelectedTabId}
      />

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
          />
          {selectedTabId === "performance" ? (
            <div className="px-[8px]">
              <InvestmentPortfolioChart
                points={chartPoints}
                country={country}
                currency={portfolioCurrency}
                amountsHidden={amountsHidden}
              />
              <InvestmentPeriodChips
                periods={INVESTMENT_PERIODS}
                selectedPeriodId={selectedPeriodId}
                onChange={setSelectedPeriodId}
              />
            </div>
          ) : (
            <InvestmentDistributionChart
              title={t(
                `runtime.investments.distributionTitles.${DISTRIBUTION_TITLE_TRANSLATION_KEYS[selectedTabId]}`,
                getInvestmentDistributionTitle(selectedTabId),
              )}
              items={distributionItems}
              formatAmount={formatDistributionAmount}
              totalLabel={t("runtime.investments.total", "Total")}
              onItemClick={setSelectedDistributionItem}
              headerExtra={investmentActionBar}
            />
          )}
          {selectedTabId === "performance" ? (
            <>
              {investmentActionBar}
              <SectionHeadingDivider
                title={t("runtime.investments.allProducts", "ALL PRODUCTS")}
                count={securities.length}
                countAlign="end"
                className="px-[24px] pt-[8px]"
              />
              <InvestmentFilterChips
                options={INVESTMENT_SORT_OPTIONS}
                selectedOptionId={selectedSortId}
                onChange={setSelectedSortId}
              />
              <InvestmentProductsAccordion
                title={t("runtime.investments.activeSecurities", "ACTIVE SECURITIES")}
                count={activeSecurities.length}
                defaultOpen
              >
                <div>{activeSecurities.map(renderSecurity)}</div>
              </InvestmentProductsAccordion>
              <InvestmentProductsAccordion
                title={t("runtime.investments.inactiveSecurities", "INACTIVE SECURITIES")}
                count={inactiveSecurities.length}
                defaultOpen={false}
              >
                <div>{inactiveSecurities.map(renderSecurity)}</div>
              </InvestmentProductsAccordion>
              <InvestmentsFundBanner
                title={t("runtime.investments.fundBanner.title", "Find out the best fund for you")}
                description={t("runtime.investments.fundBanner.description", "Discover our suggestions")}
                actionLabel={t("runtime.investments.fundBanner.action", "GO TO FUNDS WINDOW")}
              />
            </>
          ) : null}
          <div className="h-[28px]" />
        </>
      ) : (
        <EmptyInvestmentsState />
      )}
    </div>
  );
}
