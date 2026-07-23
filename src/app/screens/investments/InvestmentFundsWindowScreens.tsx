import { useCollapsingHeader } from "@/hooks/useCollapsingHeader";
import { AppIcon } from "@/app/components/icons";
import InvestmentsFundBanner, {
  INVESTMENTS_FUND_BANNER_VARIANTS,
} from "@/app/components/investments/InvestmentsFundBanner";
import PageHeader from "@/app/components/PageHeader";
import {
  INVESTMENT_FUND_COLLECTIONS,
  getInvestmentFundCollection,
  getInvestmentFundCollectionSecurities,
  type InvestmentFundCollectionId,
} from "@/app/config/investmentFundCollections";
import type { InvestmentCatalogSecurity } from "@/app/config/investmentsPortfolioConfig";
import { getCountryConfig } from "@/app/registry/countryConfig";
import type { CountryId } from "@/app/state/demoTypes";
import { maskFormattedAmount } from "@/app/utils/amountPrivacy";
import amundiLogo from "@/assets/investments/funds/fund-amundi-logo.png";

interface InvestmentFundsSelectionScreenProps {
  onBack: () => void;
  onSearch: () => void;
  onSelectCollection: (collectionId: InvestmentFundCollectionId) => void;
}

interface InvestmentFundCollectionScreenProps {
  collectionId: InvestmentFundCollectionId;
  securities: readonly InvestmentCatalogSecurity[];
  country: CountryId;
  amountsHidden: boolean;
  onBack: () => void;
  onSelectSecurity: (security: InvestmentCatalogSecurity) => void;
}

function formatFundMoney(value: number, country: CountryId, hidden: boolean) {
  const formatted = new Intl.NumberFormat(getCountryConfig(country).locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));
  return hidden ? maskFormattedAmount(formatted, true) : formatted;
}

function formatFundPercent(value: number) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${Math.abs(value).toFixed(2).replace(".", ",")}%`;
}

function FundCollectionRow({
  security,
  country,
  amountsHidden,
  onSelect,
}: {
  security: InvestmentCatalogSecurity;
  country: CountryId;
  amountsHidden: boolean;
  onSelect: () => void;
}) {
  const percentColor = security.performancePercent < 0
    ? "var(--uc-status-red)"
    : "var(--uc-green-olive)";

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex min-h-[92px] w-full items-center gap-[12px] bg-[var(--uc-surface)] px-[16px] py-[14px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-focus-ring)]"
      aria-label={`${security.title}, ${security.productId}`}
      data-investment-fund-row={security.id}
    >
      <img
        src={amundiLogo}
        alt="Amundi Asset Management"
        className="size-[40px] shrink-0 object-cover"
        draggable={false}
      />
      <span className="flex min-w-0 flex-1 flex-col items-end text-right">
        <span className="w-full truncate text-[12px] font-bold uppercase leading-[15px] text-[var(--uc-text)]">
          {security.title}
        </span>
        <span className="mt-[2px] w-full truncate text-[12px] leading-[15px] text-[var(--uc-text-muted)]">
          {security.productId}
        </span>
        <span className="mt-[3px] w-full text-[var(--uc-text)]">
          <span className="text-[20px] font-bold leading-[24px]">
            {formatFundMoney(security.marketPrice, country, amountsHidden)}
          </span>
          <span className="text-[12px] leading-[15px]"> {security.instrumentCurrency}</span>
          <span className="ml-[4px] text-[12px] font-bold leading-[15px]" style={{ color: percentColor }}>
            {formatFundPercent(security.performancePercent)}
          </span>
          <span className="text-[12px] font-bold leading-[15px]"> (1Y)</span>
        </span>
      </span>
    </button>
  );
}

function FundCollectionGroup({
  title,
  securities,
  country,
  amountsHidden,
  onSelectSecurity,
}: {
  title: string;
  securities: readonly InvestmentCatalogSecurity[];
  country: CountryId;
  amountsHidden: boolean;
  onSelectSecurity: (security: InvestmentCatalogSecurity) => void;
}) {
  return (
    <section role="region" aria-label={title} className="mt-[18px]">
      <div className="mx-[16px] flex h-[32px] items-center justify-between border-b border-[var(--uc-border)] px-[4px]">
        <h2 className="text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">{title}</h2>
        <span className="text-[14px] font-bold leading-[18px] text-[var(--uc-text)]">{securities.length}</span>
      </div>
      <div>
        {securities.map((security) => (
          <FundCollectionRow
            key={security.id}
            security={security}
            country={country}
            amountsHidden={amountsHidden}
            onSelect={() => onSelectSecurity(security)}
          />
        ))}
      </div>
    </section>
  );
}

export function InvestmentFundsSelectionScreen({
  onBack,
  onSearch,
  onSelectCollection,
}: InvestmentFundsSelectionScreenProps) {
  const { progress: headerProgress, onScroll: handleScroll } = useCollapsingHeader(96);

  return (
    <div
      className="h-full w-full overflow-y-auto bg-[var(--uc-surface)] text-[var(--uc-text)] scrollbar-hide"
      onScroll={handleScroll}
      data-investment-funds-selection="true"
      data-testid="investment-funds-selection"
    >
      <PageHeader
        title="Our funds selection"
        onBack={onBack}
        includeSafeArea
        collapsedTitleProgress={headerProgress}
      />
      <div className="px-[16px] pt-[16px]">
        <button
          type="button"
          onClick={onSearch}
          className="flex h-[48px] w-full items-center justify-center gap-[6px] rounded-[4px] bg-[var(--uc-surface)] text-[16px] font-bold leading-[20px] text-[var(--uc-text)] shadow-[0_4px_20px_color-mix(in_srgb,var(--uc-text)_20%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
        >
          <AppIcon name="search" size={24} color="var(--uc-text)" />
          Search funds
        </button>
      </div>
      <div className="flex flex-col gap-[16px] px-[16px] pb-[34px] pt-[24px]">
        {INVESTMENT_FUND_COLLECTIONS.map((collection) => (
          <InvestmentsFundBanner
            key={collection.id}
            title={collection.title}
            description={collection.subtitle}
            actionLabel="FIND OUT MORE"
            variant={collection.bannerVariant}
            onClick={() => onSelectCollection(collection.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function InvestmentFundCollectionScreen({
  collectionId,
  securities,
  country,
  amountsHidden,
  onBack,
  onSelectSecurity,
}: InvestmentFundCollectionScreenProps) {
  const collection = getInvestmentFundCollection(collectionId);
  const visibleSecurities = getInvestmentFundCollectionSecurities(collectionId, securities);
  const oneOffSecurities = visibleSecurities.filter((security) => security.contributionType === "ONE OFF");
  const regularSecurities = visibleSecurities.filter((security) => security.contributionType === "RECURRENT");
  const bannerStyle = INVESTMENTS_FUND_BANNER_VARIANTS[collection.bannerVariant];
  const heroImage = bannerStyle.imageSrc;

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden bg-[var(--uc-surface)] text-[var(--uc-text)]"
      data-investment-fund-collection={collection.id}
      data-testid={`investment-fund-collection-${collection.id}`}
    >
      <div
        className="shrink-0"
        style={{ backgroundColor: collection.headerBackgroundColor }}
        data-investment-funds-fixed-header="collection"
      >
        <PageHeader title="" onBack={onBack} includeSafeArea renderLargeTitle={false} variant="transparent" />
        <section className="relative h-[132px] overflow-hidden">
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden="true"
            draggable={false}
          />
          <div className="relative z-10">
            <div className="max-w-[270px] px-[16px] py-[14px]">
              <h1 className="line-clamp-1 text-[22px] font-bold leading-[26px] text-[var(--uc-text)]">{collection.title}</h1>
              <p className="mt-[4px] line-clamp-3 text-[16px] leading-[19px] text-[var(--uc-text)]">{collection.heroSubtitle}</p>
            </div>
          </div>
        </section>
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto scrollbar-hide"
        data-investment-funds-scroll-region="collection"
      >
        <p className="px-[16px] py-[24px] text-[16px] leading-[20px] text-[var(--uc-text)]">
          {collection.introduction}
        </p>

        <FundCollectionGroup
          title="One-off investment"
          securities={oneOffSecurities}
          country={country}
          amountsHidden={amountsHidden}
          onSelectSecurity={onSelectSecurity}
        />
        <FundCollectionGroup
          title="Regular investment"
          securities={regularSecurities}
          country={country}
          amountsHidden={amountsHidden}
          onSelectSecurity={onSelectSecurity}
        />

        <p className="px-[16px] pb-[34px] pt-[28px] text-center text-[12px] leading-[15px] text-[var(--uc-text)]">
          Investment always involves the risk of value fluctuations, and the return of the originally invested funds is not guaranteed. This information is for informational purposes only, does not represent a prospectus or statement, personal investment advice, or investment recommendations that would take into account the individual situation of the investor.
        </p>
      </div>
    </div>
  );
}
