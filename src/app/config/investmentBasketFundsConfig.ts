export type InvestmentBasketContributionType = "ONE OFF" | "RECURRENT";
export type InvestmentBasketInvestorProfile = "conservative-v1" | "moderate-v2" | "aggressive-v3";

export interface InvestmentBasketFundHolding {
  title: string;
  productId?: string;
  percent?: number;
  currency?: string;
}

export interface InvestmentBasketMarketInfo {
  /** Source Basket ID, or the stable config key when no source ID was supplied. */
  basketId: string;
  /** One basket-level ISIN; local demo values are generated when source data is missing. */
  basketIsin: string;
  /** Null when the source catalog has not provided an update date. */
  lastUpdate: string | null;
}

export interface InvestmentBasketFund {
  id: string;
  title: string;
  description: string;
  contributionType: InvestmentBasketContributionType;
  logoId: string;
  marketInfo: InvestmentBasketMarketInfo;
  recommendedFor?: readonly InvestmentBasketInvestorProfile[];
  roboCarouselTitle?: string;
  detailDescription?: string;
  contentsSummary?: string;
  holdings: readonly InvestmentBasketFundHolding[];
  /** Illustrative one-year basket return shown in the CZ Robo demo. */
  performancePercent?: number;
}

type InvestmentBasketDefinition = Omit<InvestmentBasketFund, "marketInfo" | "holdings"> & {
  marketInfo?: Partial<InvestmentBasketMarketInfo>;
  holdings?: readonly InvestmentBasketFundHolding[];
};

export function formatInvestmentBasketPerformance(value: number) {
  const amount = Number(Math.abs(value).toFixed(2)).toString().replace(".", ",");
  return `${value < 0 ? "−" : "+"}${amount}%`;
}

const FIGMA_GLOBAL_GROWTH_DESCRIPTION =
  "Unlock expert diversification with one click. The Global Growth Basket combines a selection of premium funds, managed by top-tier professionals. This strategy is built for investors seeking a balanced approach to international markets, ensuring your capital is spread across various fund management styles and geographic areas for optimized stability and performance.";

const BASKET_DEFINITIONS: readonly InvestmentBasketDefinition[] = [
  {
    id: "jp-morgan-global-growth",
    title: "onemarkets J.P. Morgan Global growth Basket",
    description: "Explore global opportunities with five curated equity funds in one basket.",
    contributionType: "ONE OFF",
    logoId: "unicredit",
    marketInfo: {
      basketId: "3333343141",
      basketIsin: "RS34343143143",
      lastUpdate: "03.01.2026",
    },
    recommendedFor: ["moderate-v2"],
    performancePercent: 3.27,
    roboCarouselTitle: "onemarkets J.P. Morgan\nGlobal growth Basket",
    detailDescription: FIGMA_GLOBAL_GROWTH_DESCRIPTION,
    contentsSummary: "A mix of 5 high-yield equity funds.",
    holdings: [
      { title: "Nano-Chip Equity Fund", productId: "XY987654321", percent: 35 },
      { title: "Quantum Computing Alpha", productId: "XY987654322", percent: 15 },
      { title: "AI Ethical Solutions", productId: "XY987654323", percent: 20 },
      { title: "Diszruptìv Vegyes Alap 2004/F", productId: "XY987654324", percent: 15 },
      { title: "Diszruptìv Vegyes Alap 2004/F", productId: "XY987654325", percent: 15 },
    ],
  },
  {
    id: "blackrock-credit-opportunities",
    title: "BlackRock Credit Opportunities",
    description: "Discover four ESG-focused equity funds selected for a more conscious portfolio.",
    contributionType: "ONE OFF",
    logoId: "unicredit",
    recommendedFor: ["moderate-v2"],
    performancePercent: 2.43,
    roboCarouselTitle: "BlackRock Credit\nOpportunities",
    contentsSummary: "4 equity ESG funds.",
    holdings: [
      { title: "Sustainable Future Mixed Fund", productId: "CZSUSTAINAB3", percent: 25 },
      { title: "onemarkets Climate Focus Fund", productId: "CZCLIMATEFO2", percent: 25 },
      { title: "Global Dividend Fund", productId: "CZGLOBALDIV4", percent: 25 },
      { title: "Europe Equity Opportunities", productId: "CZEUROPEEQU7", percent: 25 },
    ],
  },
  {
    id: "onemarkets-eur-collection",
    title: "onemarkets EUR collection",
    description: "Discover global themes through a curated mix of five investment funds.",
    contributionType: "ONE OFF",
    logoId: "unicredit",
    recommendedFor: ["moderate-v2"],
    performancePercent: 1.81,
    roboCarouselTitle: "onemarkets EUR\ncollection",
    contentsSummary: "Five thematic funds selected for a diversified portfolio.",
    holdings: [
      { title: "Pictet Thematic Intelligence Fund", percent: 20 },
      { title: "onemarkets Climate Focus Fund", productId: "CZCLIMATEFO2", percent: 20 },
      { title: "Global Dividend Fund", productId: "CZGLOBALDIV4", percent: 20 },
      { title: "Global Tech Leaders", productId: "CZGLOBALTEC8", percent: 20 },
      { title: "Europe Equity Opportunities", productId: "CZEUROPEEQU7", percent: 20 },
    ],
  },
  {
    id: "jp-morgan-credit-opportunities",
    title: "onemarkets J.P. Morgan Credit Opportunities",
    description: "Pictet Thematic Intelligence Fund",
    contributionType: "ONE OFF",
    logoId: "unicredit",
  },
  {
    id: "amundi-income-basket",
    title: "onemarkets Amundi Income Basket",
    description: "A diversified income-oriented fund mix.",
    contributionType: "ONE OFF",
    logoId: "unicredit",
  },
  {
    id: "sustainable-leaders-basket",
    title: "onemarkets Sustainable Leaders Basket",
    description: "A selection of sustainability-focused funds.",
    contributionType: "ONE OFF",
    logoId: "unicredit",
  },
  {
    id: "chase-regular-eur",
    title: "onemarkets Chase Regular EUR",
    contributionType: "RECURRENT",
    logoId: "unicredit",
    recommendedFor: ["moderate-v2"],
    performancePercent: 1.42,
    roboCarouselTitle: "onemarkets Chase\nRegular EUR",
    description: "Build your investment steadily with monthly contributions to five curated equity funds.",
    contentsSummary: "A mix of 5 high-yield equity funds.",
    holdings: [
      { title: "Amundi Funds Global Opportunity", productId: "CZROBOAMUND14", percent: 20 },
      { title: "onemarkets Climate Focus Fund", productId: "CZCLIMATEFO2", percent: 20 },
      { title: "Global Dividend Fund", productId: "CZGLOBALDIV4", percent: 20 },
      { title: "Global Tech Leaders", productId: "CZGLOBALTEC8", percent: 20 },
      { title: "Europe Equity Opportunities", productId: "CZEUROPEEQU7", percent: 20 },
    ],
  },
  {
    id: "jp-morgan-credit-regular",
    title: "onemarkets J.P. Morgan Credit Opportunities",
    description: "Invest monthly across eight high-yield equity funds in one convenient basket.",
    contributionType: "RECURRENT",
    logoId: "unicredit",
    recommendedFor: ["moderate-v2"],
    performancePercent: 1.65,
    roboCarouselTitle: "onemarkets J.P. Morgan\nCredit Opportunities",
    contentsSummary: "A mix of 8 high-yield equity funds.",
    holdings: [
      { title: "Amundi Funds Global Opportunity", productId: "CZROBOAMUND14", percent: 12.5 },
      { title: "onemarkets Climate Focus Fund", productId: "CZCLIMATEFO2", percent: 12.5 },
      { title: "Global Dividend Fund", productId: "CZGLOBALDIV4", percent: 12.5 },
      { title: "Global Tech Leaders", productId: "CZGLOBALTEC8", percent: 12.5 },
      { title: "Europe Equity Opportunities", productId: "CZEUROPEEQU7", percent: 12.5 },
      { title: "Sustainable Future Mixed Fund", productId: "CZSUSTAINAB3", percent: 12.5 },
      { title: "Global Growth Portfolio", productId: "CZGLOBALGRO9", percent: 12.5 },
      { title: "Nano-Chip Equity Fund", productId: "XY987654321", percent: 12.5 },
    ],
  },
  {
    id: "amundi-eur-collection-regular",
    title: "onemarkets Amundi EUR collection",
    description: "Pictet Thematic Intelligence Fund",
    contributionType: "RECURRENT",
    logoId: "unicredit",
  },
  {
    id: "balanced-regular-czk",
    title: "onemarkets Balanced Regular CZK",
    description: "A balanced mix for regular investing.",
    contributionType: "RECURRENT",
    logoId: "unicredit",
  },
  {
    id: "sustainable-regular-plan",
    title: "onemarkets Sustainable Regular Plan",
    description: "Funds selected around sustainable themes.",
    contributionType: "RECURRENT",
    logoId: "unicredit",
  },
  {
    id: "global-growth-regular",
    title: "onemarkets Global Growth Regular",
    description: "Global equity funds for recurring investments.",
    contributionType: "RECURRENT",
    logoId: "unicredit",
  },
  {
    id: "income-regular-eur",
    title: "onemarkets Income Regular EUR",
    description: "A recurring portfolio focused on income funds.",
    contributionType: "RECURRENT",
    logoId: "unicredit",
  },
  {
    id: "future-trends-regular",
    title: "onemarkets Future Trends Regular",
    description: "A mix of thematic investment funds.",
    contributionType: "RECURRENT",
    logoId: "unicredit",
  },
  {
    id: "dividend-regular",
    title: "onemarkets Dividend Regular",
    description: "Dividend-oriented funds in one portfolio.",
    contributionType: "RECURRENT",
    logoId: "unicredit",
  },
  {
    id: "climate-regular",
    title: "onemarkets Climate Regular",
    description: "Climate-focused funds for recurring investments.",
    contributionType: "RECURRENT",
    logoId: "unicredit",
  },
  {
    id: "defensive-regular",
    title: "onemarkets Defensive Regular",
    description: "A more defensive recurring fund mix.",
    contributionType: "RECURRENT",
    logoId: "unicredit",
  },
  {
    id: "dynamic-regular",
    title: "onemarkets Dynamic Regular",
    description: "A dynamic mix across markets and themes.",
    contributionType: "RECURRENT",
    logoId: "unicredit",
  },
  {
    id: "multi-asset-regular",
    title: "onemarkets Multi-Asset Regular",
    description: "A recurring multi-asset fund selection.",
    contributionType: "RECURRENT",
    logoId: "unicredit",
  },
  {
    id: "central-europe-regular",
    title: "onemarkets Central Europe Regular",
    description: "Funds with a Central European focus.",
    contributionType: "RECURRENT",
    logoId: "unicredit",
  },
];

/** Normalize market fields for every basket; never substitute a constituent ISIN for a basket ISIN. */
export const CZ_INVESTMENT_BASKETS: readonly InvestmentBasketFund[] = BASKET_DEFINITIONS.map((basket, index) => ({
  ...basket,
  marketInfo: {
    basketId: basket.marketInfo?.basketId ?? basket.id,
    basketIsin: basket.marketInfo?.basketIsin ?? `CZROBO${String(index + 1).padStart(6, "0")}`,
    lastUpdate: basket.marketInfo?.lastUpdate ?? null,
  },
  holdings: basket.holdings ?? [],
}));

export function getInvestmentBaskets(contributionType?: InvestmentBasketContributionType) {
  return contributionType
    ? CZ_INVESTMENT_BASKETS.filter((basket) => basket.contributionType === contributionType)
    : [...CZ_INVESTMENT_BASKETS];
}

export function getRecommendedInvestmentBaskets(profile: InvestmentBasketInvestorProfile = "moderate-v2") {
  const eligible = CZ_INVESTMENT_BASKETS.filter((basket) => basket.recommendedFor?.includes(profile));
  const oneOff = eligible.filter((basket) => basket.contributionType === "ONE OFF").slice(0, 3);
  const regular = eligible.filter((basket) => basket.contributionType === "RECURRENT").slice(0, 2);
  return [...oneOff, ...regular];
}
