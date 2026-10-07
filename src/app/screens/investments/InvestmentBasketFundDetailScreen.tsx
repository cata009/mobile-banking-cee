import type { ReactNode } from "react";
import AccountActionBar from "@/app/components/accounts/AccountActionBar";
import BrandLogo from "@/app/components/brand-logo/BrandLogo";
import InvestmentAmountDisplay, { formatInvestmentAmountParts } from "@/app/components/investments/InvestmentAmountDisplay";
import InvestmentDetailField from "@/app/components/investments/InvestmentDetailField";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import { formatInvestmentBasketPerformance, type InvestmentBasketFund, type InvestmentBasketFundHolding } from "@/app/config/investmentBasketFundsConfig";
import type { InvestmentCatalogSecurity } from "@/app/config/investmentsPortfolioConfig";
import type { CountryId } from "@/app/state/demoTypes";
import { useCollapsingHeader } from "@/hooks/useCollapsingHeader";

interface InvestmentBasketFundDetailScreenProps {
  basket: InvestmentBasketFund;
  securityCatalog?: readonly InvestmentCatalogSecurity[];
  country: CountryId;
  amountsHidden: boolean;
  onBack: () => void;
  onHistoryClick?: (filterByTitle?: string) => void;
  czRoboProductDetail?: boolean;
  onOpenHolding?: (holding: InvestmentBasketFundHolding) => void;
  footerActionLabel?: string;
  onFooterAction?: () => void;
  overlay?: ReactNode;
}

function formatPerformance(value: number) {
  return formatInvestmentBasketPerformance(value);
}

function FundDistributionRow({
  title,
  productId,
  percent,
  onClick,
}: {
  title: string;
  productId?: string;
  percent?: number;
  onClick?: () => void;
}) {
  const content = (
    <>
      <BrandLogo logoId="unicredit" size={32} />
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-[14px] font-bold leading-[17px] text-[var(--uc-text)]">{title}</p>
        {productId ? <p className="text-[14px] leading-[17px] text-[var(--uc-text-muted)]">{productId}</p> : null}
      </div>
      {percent !== undefined ? (
        <p className="shrink-0 text-[20px] font-bold leading-[24px] tracking-[0.2px] text-[var(--uc-text)]">{percent}%</p>
      ) : null}
    </>
  );

  const className = "flex w-full items-center gap-[8px] px-[16px] py-[24px] text-left";
  return onClick ? (
    <button
      type="button"
      className={className}
      data-basket-fund-holding={productId}
      aria-label={`Open product details for ${title}`}
      onClick={onClick}
    >
      {content}
    </button>
  ) : (
    <div className={className} data-basket-fund-holding={productId}>{content}</div>
  );
}

export default function InvestmentBasketFundDetailScreen({
  basket,
  securityCatalog = [],
  country,
  amountsHidden,
  onBack,
  onHistoryClick,
  czRoboProductDetail = false,
  onOpenHolding,
  footerActionLabel = "Buy",
  onFooterAction,
  overlay,
}: InvestmentBasketFundDetailScreenProps) {
  const hasFigmaSampleDetails = basket.id === "jp-morgan-global-growth";
  const heroParts = formatInvestmentAmountParts(1500, country, "EUR", amountsHidden);
  const marketPriceParts = formatInvestmentAmountParts(535.44, country, "EUR", amountsHidden);
  const description = basket.detailDescription ?? basket.description;
  const hasDistributionPercentages = basket.holdings?.some((holding) => holding.percent !== undefined) ?? false;
  const performancePercent = basket.performancePercent ?? 0;
  const performanceColor = performancePercent < 0 ? "var(--uc-status-red)" : "var(--uc-green-olive)";
  const basketId = basket.marketInfo?.basketId ?? basket.id;
  const basketIsin = basket.marketInfo?.basketIsin ?? null;
  const basketLastUpdate = basket.marketInfo?.lastUpdate ?? (basket.holdings ?? [])
    .map((holding) => securityCatalog.find((security) => (
      (holding.productId && (security.productId === holding.productId || security.id === holding.productId))
      || security.title.trim().toLocaleLowerCase() === holding.title.trim().toLocaleLowerCase()
    ))?.lastUpdate)
    .find((lastUpdate): lastUpdate is string => Boolean(lastUpdate));
  const { progress: headerProgress, onScroll: handleScroll } = useCollapsingHeader(96);

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--uc-surface)] text-[var(--uc-text)]"
      data-investment-basket-detail={basket.id}
    >
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide" onScroll={czRoboProductDetail ? handleScroll : undefined}>
        <PageHeader
          title={czRoboProductDetail ? basket.title : ""}
          onBack={onBack}
          variant={czRoboProductDetail ? "light" : "gray"}
          includeSafeArea
          showHelp={false}
          compact={!czRoboProductDetail}
          renderLargeTitle={false}
          collapsedTitleProgress={czRoboProductDetail ? headerProgress : undefined}
        />
        <div className="bg-[var(--uc-app-bg)]">
          {czRoboProductDetail ? (
            <section className="bg-[var(--uc-surface)] pb-[4px]">
              <div className="px-[24px] pt-[8px]">
                <div className="flex items-start gap-[10px]">
                  <h1 className="min-w-0 flex-1 text-[28px] font-bold leading-[31px] text-[var(--uc-text)]">{basket.title}</h1>
                  <BrandLogo logoId={basket.logoId} size={32} label={`${basket.title} product`} />
                </div>
                {czRoboProductDetail && basket.performancePercent !== undefined ? (
                  <p className="mt-[8px] flex flex-wrap items-baseline gap-x-[4px] text-[14px] leading-[18px]">
                    <span>Performance:</span>
                    <span className="font-bold" style={{ color: performanceColor }}>{formatPerformance(basket.performancePercent)}</span>
                    <span className="text-[var(--uc-text-muted)]">· 1Y</span>
                  </p>
                ) : hasFigmaSampleDetails ? (
                  <div className="mt-[8px]">
                    <p className="text-[14px] leading-[16px] text-[var(--uc-text)]">Actual market price</p>
                    <p className="mt-[2px] leading-none">
                      <InvestmentAmountDisplay parts={heroParts} scale="hero" />
                    </p>
                    <p className="mt-[4px] flex flex-wrap items-baseline gap-x-[4px] text-[14px] leading-[18px]">
                      <span>Performance:</span>
                      <span className="font-bold" style={{ color: performanceColor }}>{formatPerformance(performancePercent)}</span>
                      <span className="text-[var(--uc-text-muted)]">· from 19.07.2022</span>
                    </p>
                  </div>
                ) : basket.performancePercent !== undefined ? (
                  <p className="mt-[8px] flex flex-wrap items-baseline gap-x-[4px] text-[14px] leading-[18px]">
                    <span>Performance:</span>
                    <span className="font-bold" style={{ color: performanceColor }}>{formatPerformance(basket.performancePercent)}</span>
                    <span className="text-[var(--uc-text-muted)]">· 1Y</span>
                  </p>
                ) : null}
              </div>
            </section>
          ) : (
            <section className="flex flex-col items-center px-[24px] pb-[24px] text-center">
              <BrandLogo logoId={basket.logoId} size={40} label={`${basket.title} product`} />
              <h1 className="mt-[8px] text-[28px] font-bold leading-[31px] text-[var(--uc-text)]">{basket.title}</h1>
              {hasFigmaSampleDetails ? (
                <>
                  <p className="mt-[16px] flex items-baseline justify-center leading-none tracking-[0.2px]">
                    <InvestmentAmountDisplay parts={heroParts} scale="hero" />
                  </p>
                  <p className="mt-[8px] text-[14px] font-bold leading-[17px] text-[var(--uc-text)]">
                    PERFORMANCE {formatPerformance(0)}
                  </p>
                  <p className="mt-[8px] text-[14px] leading-[17px] text-[var(--uc-text)]">(from 19.07.2022)</p>
                </>
              ) : null}
            </section>
          )}
        </div>

        {!czRoboProductDetail ? (
          <AccountActionBar
            items={[
              { id: "history", iconName: "investment-history", label: "History", onClick: () => onHistoryClick?.(basket.title) },
              { id: "documents", iconName: "account-option-statement", label: "Documents" },
              { id: "sell", iconName: "trade-sell", label: "Sell", hidden: true },
              { id: "buy", iconName: "trade-buy", label: "Buy", iconColor: "var(--uc-action)" },
            ]}
          />
        ) : null}

        <div className={czRoboProductDetail ? "pt-0" : "pt-[18px]"}>
          <InvestmentDetailField
            label="Basket fund description"
            value={description}
            multiline
            variant="product-detail"
          />
          <section aria-label={hasDistributionPercentages ? (czRoboProductDetail ? "Products distribution" : "Funds distribution") : "Basket contents"} data-basket-fund-distribution>
            <SectionHeadingDivider
              title={hasDistributionPercentages ? (czRoboProductDetail ? "PRODUCTS DISTRIBUTION" : "FUNDS DISTRIBUTION") : "BASKET CONTENTS"}
              variant="medium-title"
            />
            <div className="pt-[8px]">
              {basket.holdings?.length ? basket.holdings.map((holding, index) => (
                  <FundDistributionRow
                    key={holding.productId ?? `${basket.id}-${index}`}
                    {...holding}
                    onClick={czRoboProductDetail && onOpenHolding ? () => onOpenHolding(holding) : undefined}
                  />
              )) : (
                <p className="px-[24px] py-[16px] text-[16px] leading-[21px] text-[var(--uc-text)]">
                  {basket.contentsSummary ?? basket.description}
                </p>
              )}
            </div>
          </section>

          {czRoboProductDetail ? (
            <section className="mt-[24px]" aria-label="Market info" data-basket-fund-market-info>
              <SectionHeadingDivider title="MARKET INFO" variant="medium-title" />
              <InvestmentDetailField
                label="Basket ID"
                value={basketId}
                variant="product-detail"
              />
              <InvestmentDetailField label="Basket ISIN" value={basketIsin ?? "Not available"} variant="product-detail" />
              <InvestmentDetailField label="Last update" value={basketLastUpdate ?? "Not available"} variant="product-detail" />
            </section>
          ) : null}

          {!czRoboProductDetail ? (
            <section className="mt-[24px]" aria-label="Market info" data-basket-fund-market-info>
              <SectionHeadingDivider title="MARKET INFO" variant="medium-title" />
              {hasFigmaSampleDetails ? (
                <InvestmentDetailField
                  label="Actual market price"
                  value={<InvestmentAmountDisplay parts={marketPriceParts} scale="field" />}
                  variant="product-detail"
                />
              ) : null}
              <InvestmentDetailField label="Basket ID" value={basketId} variant="product-detail" />
              <InvestmentDetailField label="Basket ISIN" value={basketIsin ?? "Not available"} variant="product-detail" />
              <InvestmentDetailField label="Last update" value={basketLastUpdate ?? "Not available"} variant="product-detail" />
            </section>
          ) : null}
        </div>
        <div className="h-[34px]" aria-hidden="true" />
      </div>
      {onFooterAction ? (
        <footer className="shrink-0 bg-[var(--uc-surface)] px-[24px] pb-[34px] pt-[12px]" data-testid="basket-fund-footer-action">
          <PrimaryButton labelSize="18" onClick={onFooterAction}>
            {footerActionLabel}
          </PrimaryButton>
        </footer>
      ) : null}
      {overlay}
    </div>
  );
}
