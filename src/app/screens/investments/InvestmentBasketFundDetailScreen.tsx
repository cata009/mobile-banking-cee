import AccountActionBar from "@/app/components/accounts/AccountActionBar";
import BrandLogo from "@/app/components/brand-logo/BrandLogo";
import InvestmentAmountDisplay, { formatInvestmentAmountParts } from "@/app/components/investments/InvestmentAmountDisplay";
import InvestmentDetailField from "@/app/components/investments/InvestmentDetailField";
import PageHeader from "@/app/components/PageHeader";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import type { InvestmentBasketFund } from "@/app/config/investmentBasketFundsConfig";
import type { CountryId } from "@/app/state/demoTypes";
import { useCollapsingHeader } from "@/hooks/useCollapsingHeader";

interface InvestmentBasketFundDetailScreenProps {
  basket: InvestmentBasketFund;
  country: CountryId;
  amountsHidden: boolean;
  onBack: () => void;
  onHistoryClick?: (filterByTitle?: string) => void;
  czRoboProductDetail?: boolean;
}

function formatPerformance(value: number) {
  return `${value > 0 ? "+" : value < 0 ? "−" : "+"}${Math.abs(value).toFixed(0)}%`;
}

function FundDistributionRow({
  title,
  productId,
  percent,
}: {
  title: string;
  productId?: string;
  percent?: number;
}) {
  return (
    <div className="flex w-full items-center gap-[8px] px-[16px] py-[24px]" data-basket-fund-holding={productId}>
      <BrandLogo logoId="unicredit" size={32} />
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-[14px] font-bold leading-[17px] text-[var(--uc-text)]">{title}</p>
        {productId ? <p className="text-[14px] leading-[17px] text-[var(--uc-text-muted)]">{productId}</p> : null}
      </div>
      {percent !== undefined ? (
        <p className="shrink-0 text-[20px] font-bold leading-[24px] tracking-[0.2px] text-[var(--uc-text)]">{percent}%</p>
      ) : null}
    </div>
  );
}

export default function InvestmentBasketFundDetailScreen({
  basket,
  country,
  amountsHidden,
  onBack,
  onHistoryClick,
  czRoboProductDetail = false,
}: InvestmentBasketFundDetailScreenProps) {
  const hasFigmaSampleDetails = basket.id === "jp-morgan-global-growth";
  const heroParts = formatInvestmentAmountParts(1500, country, "EUR", amountsHidden);
  const marketPriceParts = formatInvestmentAmountParts(535.44, country, "EUR", amountsHidden);
  const description = basket.detailDescription ?? basket.description;
  const hasDistributionPercentages = basket.holdings?.some((holding) => holding.percent !== undefined) ?? false;
  const { progress: headerProgress, onScroll: handleScroll } = useCollapsingHeader(96);

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden bg-[var(--uc-surface)] text-[var(--uc-text)]"
      data-investment-basket-detail={basket.id}
    >
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide" onScroll={czRoboProductDetail ? handleScroll : undefined}>
        <div className="bg-[var(--uc-app-bg)]">
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
          {czRoboProductDetail ? (
            <section className="bg-[var(--uc-surface)] pb-[28px]">
              <div className="px-[24px] pt-[8px]">
                <div className="flex items-start gap-[10px]">
                  <h1 className="min-w-0 flex-1 text-[28px] font-bold leading-[31px] text-[var(--uc-text)]">{basket.title}</h1>
                  <BrandLogo logoId={basket.logoId} size={32} label={`${basket.title} product`} />
                </div>
                {hasFigmaSampleDetails ? (
                  <div className="mt-[8px]">
                    <p className="text-[14px] leading-[16px] text-[var(--uc-text)]">Actual market price</p>
                    <p className="mt-[2px] leading-none">
                      <InvestmentAmountDisplay parts={heroParts} scale="hero" />
                    </p>
                    <p className="mt-[4px] flex flex-wrap items-baseline gap-x-[4px] text-[14px] leading-[18px]">
                      <span>Performance:</span>
                      <span className="font-bold text-[var(--uc-green-olive)]">{formatPerformance(0)}</span>
                      <span className="text-[var(--uc-text-muted)]">· from 19.07.2022</span>
                    </p>
                  </div>
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

        <AccountActionBar
          items={[
            { id: "history", iconName: "investment-history", label: "History", onClick: () => onHistoryClick?.(basket.title) },
            { id: "documents", iconName: "account-option-statement", label: "Documents" },
            { id: "sell", iconName: "trade-sell", label: "Sell", hidden: true },
            { id: "buy", iconName: "trade-buy", label: "Buy", iconColor: "var(--uc-action)" },
          ]}
        />

        <div className="pt-[18px]">
          <InvestmentDetailField
            label="Basket fund description"
            value={description}
            multiline
            variant="product-detail"
          />
          {hasFigmaSampleDetails ? (
            <InvestmentDetailField label="Basket ID" value="3333343141" variant="product-detail" />
          ) : null}

          <section aria-label={hasDistributionPercentages ? "Funds distribution" : "Basket contents"} data-basket-fund-distribution>
            <SectionHeadingDivider
              title={hasDistributionPercentages ? "FUNDS DISTRIBUTION" : "BASKET CONTENTS"}
              variant="medium-title"
            />
            <div className="pt-[8px]">
              {basket.holdings?.length ? basket.holdings.map((holding, index) => (
                  <FundDistributionRow key={holding.productId ?? `${basket.id}-${index}`} {...holding} />
              )) : (
                <p className="px-[24px] py-[16px] text-[16px] leading-[21px] text-[var(--uc-text)]">
                  {basket.contentsSummary ?? basket.description}
                </p>
              )}
            </div>
          </section>

          {hasFigmaSampleDetails ? (
            <section className="mt-[24px]" aria-label="Market info">
              <SectionHeadingDivider title="MARKET INFO" variant="medium-title" />
              <InvestmentDetailField
                label="Actual market price"
                value={<InvestmentAmountDisplay parts={marketPriceParts} scale="field" />}
                variant="product-detail"
              />
              <InvestmentDetailField label="Product ID" value="RS34343143143" variant="product-detail" />
              <InvestmentDetailField label="Last update" value="03.01.2026" variant="product-detail" />
            </section>
          ) : null}
        </div>
        <div className="h-[34px]" aria-hidden="true" />
      </div>
    </div>
  );
}
