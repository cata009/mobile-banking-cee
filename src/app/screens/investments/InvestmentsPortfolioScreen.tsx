import { useMemo, useState, type UIEvent } from "react";
import InvestmentDistributionChart from "@/app/components/investments/InvestmentDistributionChart";
import InvestmentActionBar from "@/app/components/investments/InvestmentActionBar";
import InvestmentFilterChips from "@/app/components/investments/InvestmentFilterChips";
import InvestmentPeriodChips from "@/app/components/investments/InvestmentPeriodChips";
import InvestmentPortfolioChart from "@/app/components/investments/InvestmentPortfolioChart";
import InvestmentPortfolioTabs from "@/app/components/investments/InvestmentPortfolioTabs";
import InvestmentProductCard, { type InvestmentAmountParts } from "@/app/components/investments/InvestmentProductCard";
import InvestmentProductsAccordion from "@/app/components/investments/InvestmentProductsAccordion";
import InvestmentsFundBanner from "@/app/components/investments/InvestmentsFundBanner";
import PageHeader from "@/app/components/PageHeader";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import {
  INVESTMENT_PERIODS,
  INVESTMENT_PORTFOLIO_TABS,
  INVESTMENT_SORT_OPTIONS,
  buildInvestmentDistributionItems,
  buildInvestmentChartPoints,
  buildInvestmentSecurities,
  calculateInvestmentProductsTotalValue,
  getInvestmentDistributionTitle,
  getInvestmentProducts,
  sortInvestmentSecurities,
  type InvestmentPortfolioTabId,
  type InvestmentPeriodId,
  type InvestmentSecurity,
  type InvestmentSortId,
} from "@/app/config/investmentsPortfolioConfig";
import { getCountryConfig } from "@/app/registry/countryConfig";
import { useLanguage } from "@/app/contexts/LanguageContext";
import type { CountryId } from "@/app/state/demoTypes";
import { useDemo } from "@/app/state/demoStore";
import { maskAmountParts } from "@/app/utils/amountPrivacy";
import { useProducts } from "@/hooks/useProducts";

interface InvestmentsPortfolioScreenProps {
  onBack: () => void;
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

function formatAmountParts(amount: number, country: CountryId, currency: string, signed = false): InvestmentAmountParts {
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
  const sign = signed && amount > 0 ? "+" : signed && amount < 0 ? "-" : "";

  return {
    integer: `${sign}${integer || "0"}`,
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
  currency,
}: {
  totalValue: InvestmentAmountParts;
  performanceAmount: InvestmentAmountParts;
  performancePercentLabel: string;
  currency: string;
}) {
  const { t } = useLanguage();
  const performanceColor = performanceAmount.integer.startsWith("-") ? "text-[var(--uc-danger)]" : "text-[var(--uc-green-success)]";

  return (
    <div className="px-[16px] pt-[16px]">
      <div className="flex flex-col gap-[8px]">
        <div className="flex items-baseline gap-[8px]">
          <span className="uc-type-n4 text-[var(--uc-text)]">
            {t("runtime.investments.totalValue", "Total value")}:
          </span>
          <span className="text-[var(--uc-text)]">
            <span className="uc-type-n4-strong">{totalValue.integer}</span>
            <span className="uc-type-n5">{totalValue.decimal} {totalValue.currency || currency}</span>
          </span>
        </div>
        <div className="flex items-baseline gap-[8px]">
          <span className="uc-type-n4 text-[var(--uc-text)]">
            {t("runtime.investments.performance", "Performance")}:
          </span>
          <span className={performanceColor}>
            <span className="uc-type-n4-strong">{performanceAmount.integer}</span>
            <span className="uc-type-n5">{performanceAmount.decimal} {performanceAmount.currency || currency}</span>
            <span className="uc-type-n5-strong"> / {performancePercentLabel}</span>
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

export default function InvestmentsPortfolioScreen({ onBack }: InvestmentsPortfolioScreenProps) {
  const { country, amountsHidden } = useDemo();
  const { categories } = useProducts();
  const { t } = useLanguage();
  const [headerProgress, setHeaderProgress] = useState(0);
  const [selectedTabId, setSelectedTabId] = useState<InvestmentPortfolioTabId>("performance");
  const [selectedPeriodId, setSelectedPeriodId] = useState<InvestmentPeriodId>("max");
  const [selectedSortId, setSelectedSortId] = useState<InvestmentSortId>("max-value");

  const allProducts = useMemo(() => categories.flatMap((category) => category.products), [categories]);
  const investmentProducts = useMemo(() => getInvestmentProducts(allProducts), [allProducts]);
  const totalValue = useMemo(() => calculateInvestmentProductsTotalValue(investmentProducts), [investmentProducts]);
  const securities = useMemo(() => buildInvestmentSecurities(investmentProducts, country), [country, investmentProducts]);
  const sortedSecurities = useMemo(() => sortInvestmentSecurities(securities, selectedSortId), [securities, selectedSortId]);
  const activeSecurities = sortedSecurities.filter((security) => security.status === "active");
  const inactiveSecurities = sortedSecurities.filter((security) => security.status === "inactive");
  const currency = securities[0]?.currency ?? investmentProducts[0]?.currency ?? getCountryConfig(country).currency;
  const totalPerformanceAmount = securities.reduce((sum, security) => sum + security.performanceAmount, 0);
  const totalPerformancePercent = totalValue > 0 ? (totalPerformanceAmount / totalValue) * 100 : 0;
  const chartPoints = useMemo(() => buildInvestmentChartPoints(totalValue, selectedPeriodId), [selectedPeriodId, totalValue]);
  const distributionItems = useMemo(
    () => buildInvestmentDistributionItems(securities, selectedTabId),
    [securities, selectedTabId],
  );

  const totalValueParts = maskInvestmentAmount(formatAmountParts(totalValue, country, currency), amountsHidden);
  const performanceParts = maskInvestmentAmount(formatAmountParts(totalPerformanceAmount, country, currency, true), amountsHidden);
  const totalPerformancePercentLabel = amountsHidden
    ? "**,**%"
    : `${totalPerformancePercent > 0 ? "+" : ""}${totalPerformancePercent.toFixed(2).replace(".", ",")}%`;

  const handlePageScroll = (event: UIEvent<HTMLDivElement>) => {
    const progress = Math.min(1, Math.max(0, event.currentTarget.scrollTop / 64));
    setHeaderProgress(progress);
  };

  const renderSecurity = (security: InvestmentSecurity) => (
    <InvestmentProductCard
      key={security.id}
      security={security}
      valueParts={maskInvestmentAmount(formatAmountParts(security.value, country, security.currency), amountsHidden)}
      performanceParts={maskInvestmentAmount(formatAmountParts(security.performanceAmount, country, security.localCurrency, true), amountsHidden)}
      valueLabel={t("runtime.investments.value", "Value")}
      performanceLabel={t("runtime.investments.performance", "Performance")}
    />
  );

  const formatDistributionAmount = (value: number, itemCurrency: string) =>
    maskInvestmentAmount(formatAmountParts(value, country, itemCurrency), amountsHidden);

  return (
    <div
      className="h-full w-full overflow-y-auto bg-[var(--uc-surface)] text-[var(--uc-text)] scrollbar-hide"
      onScroll={handlePageScroll}
    >
      <PageHeader
        title={t("runtime.investments.title", "Investment")}
        onBack={onBack}
        collapsedTitleProgress={headerProgress}
        includeSafeArea
        showHelp={false}
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
            currency={currency}
          />
          {selectedTabId === "performance" ? (
            <div className="px-[8px]">
              <InvestmentPortfolioChart points={chartPoints} />
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
            />
          )}
          <InvestmentActionBar
            actions={[
              {
                id: "history",
                iconName: "user-event-refresh",
                label: t("runtime.investments.actions.history", "History"),
              },
              {
                id: "to-approve",
                iconName: "clipboard-check",
                label: t("runtime.investments.actions.toApprove", "To approve"),
                badgeCount: 20,
              },
              {
                id: "download-report",
                iconName: "account-option-statement",
                label: t("runtime.investments.actions.downloadReport", "Download\nReport"),
              },
            ]}
            investLabel={t("runtime.investments.actions.invest", "Invest")}
          />
          <SectionHeadingDivider
            title={t("runtime.investments.allProducts", "ALL PRODUCTS")}
            count={securities.length}
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
          <div className="h-[28px]" />
        </>
      ) : (
        <EmptyInvestmentsState />
      )}
    </div>
  );
}
