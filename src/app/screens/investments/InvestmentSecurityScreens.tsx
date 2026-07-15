import { useMemo, useState, type UIEvent } from "react";
import AccountActionBar from "@/app/components/accounts/AccountActionBar";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import BrandLogo from "@/app/components/brand-logo/BrandLogo";
import { BottomSheet } from "@/app/components/BottomSheet";
import InvestmentPeriodChips from "@/app/components/investments/InvestmentPeriodChips";
import InvestmentPortfolioChart from "@/app/components/investments/InvestmentPortfolioChart";
import PageHeader from "@/app/components/PageHeader";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import {
  INVESTMENT_PERIODS,
  buildInvestmentChartPoints,
  type InvestmentCatalogSecurity,
  type InvestmentPeriodId,
} from "@/app/config/investmentsPortfolioConfig";
import { getCountryConfig } from "@/app/registry/countryConfig";
import type { CountryId } from "@/app/state/demoTypes";
import { maskFormattedAmount } from "@/app/utils/amountPrivacy";

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
  onHistoryClick?: () => void;
}

const INVESTMENT_POSITIVE_COLOR = "var(--uc-green-olive)";

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

function FieldRow({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className={`flex w-full flex-col gap-[4px] px-[24px] py-[16px] ${multiline ? "min-h-[132px]" : "min-h-[80px] justify-center"}`}>
      <p className="text-[14px] font-normal leading-[16px] text-[var(--uc-text-muted)]">{label}</p>
      <p className="text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">{value}</p>
    </div>
  );
}

export function InvestmentSecurityListScreen({
  securities,
  country,
  amountsHidden,
  onBack,
  onSelect,
}: InvestmentSecurityListScreenProps) {
  const [query, setQuery] = useState("");
  const [headerProgress, setHeaderProgress] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [currency, setCurrency] = useState<string | null>(null);
  const currencies = useMemo(() => [...new Set(securities.map((item) => item.instrumentCurrency))], [securities]);
  const filtersActive = ownedOnly || currency !== null;
  const visibleSecurities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return securities.filter((security) => {
      if (ownedOnly && !security.owned) return false;
      if (currency && security.instrumentCurrency !== currency) return false;
      return !normalizedQuery || `${security.title} ${security.productId}`.toLowerCase().includes(normalizedQuery);
    });
  }, [currency, ownedOnly, query, securities]);

  const clearFilters = () => {
    setOwnedOnly(false);
    setCurrency(null);
  };

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setHeaderProgress(Math.min(1, Math.max(0, event.currentTarget.scrollTop / 64)));
  };

  return (
    <div className="relative h-full w-full overflow-y-auto bg-[var(--uc-surface)] text-[var(--uc-text)] scrollbar-hide" onScroll={handleScroll} data-investment-security-list="true">
      <PageHeader title="List of securities" onBack={onBack} includeSafeArea compact collapsedTitleProgress={headerProgress} />
      <div className="px-[16px] py-[8px]">
        <AccountSearchBar
          value={query}
          onValueChange={setQuery}
          onFilterClick={() => setFiltersOpen(true)}
          onRemoveFilters={clearFilters}
          filtersActive={filtersActive}
          placeholder="Search"
        />
      </div>
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
}: InvestmentSecurityDetailScreenProps) {
  const [period, setPeriod] = useState<InvestmentPeriodId>("3y");
  const [headerProgress, setHeaderProgress] = useState(0);
  const marketPrice = security.marketPrice;
  const heroValue = security.owned ? security.localValue : security.value;
  const heroCurrency = security.owned ? security.localCurrency : security.currency;
  const chartPoints = useMemo(() => buildInvestmentChartPoints(marketPrice, period), [marketPrice, period]);
  const performanceColor = security.performancePercent < 0 ? "var(--uc-status-red)" : security.performancePercent > 0 ? INVESTMENT_POSITIVE_COLOR : "var(--uc-text)";

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
          { id: "history", iconName: "investment-history", label: "History", onClick: onHistoryClick },
          { id: "documents", iconName: "account-option-statement", label: "Documents" },
          { id: "sell", iconName: "trade-sell", label: "Sell", hidden: !security.owned, iconColor: "var(--uc-text)" },
          { id: "buy", iconName: "trade-buy", label: "Buy", iconColor: "var(--uc-action)" },
        ]}
      />
      <div className="h-[24px]" aria-hidden="true" />

      {security.owned ? (
        <section>
          <SectionHeadingDivider title="MY SECURITY" className="px-[24px]" />
          <FieldRow label="Total value in portfolio / client currency" value={formatMoney(security.localValue, country, security.localCurrency, amountsHidden)} />
          <FieldRow label="Quantity" value={`${amountsHidden ? "*,***" : security.quantity.toFixed(3).replace(".", ",")} PCS`} />
        </section>
      ) : null}

      <section>
        <SectionHeadingDivider title="MARKET INFO" className="px-[24px]" />
        <FieldRow label="Actual market price" value={formatMoney(marketPrice, country, security.currency, amountsHidden)} />
        <div className="px-[8px]">
          <InvestmentPortfolioChart points={chartPoints} country={country} currency={security.currency} amountsHidden={amountsHidden} />
          <InvestmentPeriodChips periods={INVESTMENT_PERIODS.filter((item) => item.id !== "6m")} selectedPeriodId={period} onChange={setPeriod} />
        </div>
        <FieldRow label="Product ID" value={security.productId} />
        <FieldRow label="Fund type" value={security.productType === "Fund" ? "Funds" : security.productType} />
        <FieldRow label="Security description" value={security.description} multiline />
        <FieldRow label="Last update" value={security.lastUpdate} />
        <FieldRow label="Purchase options" value={security.contributionType === "RECURRENT" ? "One off and recurrent order" : "One off order"} />
      </section>
      <div className="h-[34px]" />
    </div>
  );
}
