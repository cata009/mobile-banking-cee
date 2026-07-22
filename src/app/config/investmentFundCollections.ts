import type { InvestmentsFundBannerVariantId } from "@/app/components/investments/InvestmentsFundBanner";
import type { InvestmentCatalogSecurity } from "@/app/config/investmentsPortfolioConfig";

export type InvestmentFundCollectionId = Exclude<InvestmentsFundBannerVariantId, "discovery">;

export interface InvestmentFundCollection {
  id: InvestmentFundCollectionId;
  title: string;
  subtitle: string;
  heroSubtitle: string;
  introduction: string;
  bannerVariant: InvestmentFundCollectionId;
  headerBackgroundColor: string;
}

export const INVESTMENT_FUND_COLLECTIONS: readonly InvestmentFundCollection[] = [
  {
    id: "onemarket",
    title: "Our Onemarket funds",
    subtitle: "New investment opportunities within reach",
    heroSubtitle:
      "Choose from a range of model portfolios, from conservative strategies to dynamic investment solutions",
    introduction:
      "Model portfolios combine various asset classes, primarily equity, fixed income, and balanced funds, enabling diversification with a single portfolio.",
    bannerVariant: "onemarket",
    headerBackgroundColor: "#DBE0D1",
  },
  {
    id: "selection-plus",
    title: "Selection+ portfolios",
    subtitle: "Tailored to your product investment style",
    heroSubtitle: "Tailored to your product investment style",
    introduction:
      "Explore diversified portfolios that combine complementary strategies for different investment styles and time horizons.",
    bannerVariant: "selection-plus",
    headerBackgroundColor: "#E5D9C7",
  },
  {
    id: "featured",
    title: "Featured this month",
    subtitle: "Tailored to your product investment style",
    heroSubtitle: "Tailored to your product investment style",
    introduction:
      "Discover a focused selection of funds highlighted for this month, with different return drivers, currencies, and risk profiles.",
    bannerVariant: "featured",
    headerBackgroundColor: "#DAE3E6",
  },
  {
    id: "equity",
    title: "Equity funds",
    subtitle: "onemarkets funds & Generali",
    heroSubtitle: "onemarkets funds & Generali",
    introduction:
      "Equity funds provide access to companies and markets through a diversified fund structure. Their value can fluctuate significantly.",
    bannerVariant: "equity",
    headerBackgroundColor: "#F6EBD4",
  },
  {
    id: "balanced",
    title: "Balanced funds",
    subtitle: "onemarkets funds & Generali",
    heroSubtitle: "onemarkets funds & Generali",
    introduction:
      "Balanced funds combine growth assets and fixed income in one portfolio to spread risk across more than one asset class.",
    bannerVariant: "balanced",
    headerBackgroundColor: "#DAE9F0",
  },
  {
    id: "conservative",
    title: "Conservative funds",
    subtitle: "onemarkets funds & Generali",
    heroSubtitle: "onemarkets funds & Generali",
    introduction:
      "Conservative funds focus on lower-volatility strategies while still carrying market, credit, currency, and capital-loss risk.",
    bannerVariant: "conservative",
    headerBackgroundColor: "#F4F4F4",
  },
] as const;

export function getInvestmentFundCollection(id: InvestmentFundCollectionId): InvestmentFundCollection {
  return INVESTMENT_FUND_COLLECTIONS.find((collection) => collection.id === id) ?? INVESTMENT_FUND_COLLECTIONS[0]!;
}

function uniqueActiveSecurities(securities: readonly InvestmentCatalogSecurity[]) {
  const titles = new Set<string>();
  return securities.filter((security) => {
    if (security.status !== "active" || titles.has(security.title)) return false;
    titles.add(security.title);
    return true;
  });
}

function preferredOrder(
  securities: readonly InvestmentCatalogSecurity[],
  predicate: (security: InvestmentCatalogSecurity) => boolean,
) {
  return [...securities.filter(predicate), ...securities.filter((security) => !predicate(security))];
}

export function getInvestmentFundCollectionSecurities(
  id: InvestmentFundCollectionId,
  securities: readonly InvestmentCatalogSecurity[],
): InvestmentCatalogSecurity[] {
  const available = uniqueActiveSecurities(securities);
  let ordered: InvestmentCatalogSecurity[];

  if (id === "featured") {
    ordered = [...available].sort((left, right) => right.performancePercent - left.performancePercent);
  } else if (id === "equity") {
    ordered = preferredOrder(available, (security) => security.assetClass === "Equity");
  } else if (id === "balanced" || id === "selection-plus") {
    ordered = preferredOrder(
      available,
      (security) => security.assetClass === "Balanced" || security.assetClass === "Fixed income",
    );
  } else if (id === "conservative") {
    ordered = preferredOrder(
      available,
      (security) => security.assetClass === "Fixed income" || security.assetClass === "Liquidity",
    );
  } else {
    ordered = preferredOrder(available, (security) => security.productType === "Fund");
  }

  return ordered.slice(0, 7);
}
