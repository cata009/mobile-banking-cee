export type InvestmentBasketContributionType = "ONE OFF" | "RECURRENT";
export type InvestmentBasketInvestorProfile = "conservative-v1" | "moderate-v2" | "aggressive-v3";

export interface InvestmentBasketFundHolding {
  title: string;
  productId?: string;
  percent?: number;
  currency?: string;
}

export interface InvestmentBasketFund {
  id: string;
  title: string;
  description: string;
  contributionType: InvestmentBasketContributionType;
  logoId: string;
  recommendedFor?: readonly InvestmentBasketInvestorProfile[];
  roboCarouselTitle?: string;
  detailDescription?: string;
  contentsSummary?: string;
  holdings?: readonly InvestmentBasketFundHolding[];
}

const FIGMA_GLOBAL_GROWTH_DESCRIPTION =
  "Unlock expert diversification with one click. The Global Growth Basket combines a selection of premium funds, managed by top-tier professionals. This strategy is built for investors seeking a balanced approach to international markets, ensuring your capital is spread across various fund management styles and geographic areas for optimized stability and performance.";

export const CZ_INVESTMENT_BASKETS: readonly InvestmentBasketFund[] = [
  {
    id: "jp-morgan-global-growth",
    title: "onemarkets J.P. Morgan Global growth Basket",
    description: "Explore global opportunities with five curated equity funds in one basket.",
    contributionType: "ONE OFF",
    logoId: "unicredit",
    recommendedFor: ["moderate-v2"],
    roboCarouselTitle: "onemarkets J.P. Morgan\nGlobal growth Basket",
    detailDescription: FIGMA_GLOBAL_GROWTH_DESCRIPTION,
    contentsSummary: "A mix of 5 high-yield equity funds.",
    holdings: [
      { title: "Nano-Chip Equity Fund", productId: "XY987654321", percent: 35 },
      { title: "Quantum Computing Alpha", productId: "XY987654322", percent: 15 },
      { title: "AI Ethical Solutions", productId: "XY987654323", percent: 20 },
      { title: "Diszruptìv Vegyes Alap 2004/F", productId: "XY987654324", percent: 15 },
      { title: "Diszruptìv Vegyes Alap 2004/F", productId: "XY987654325", percent: 5 },
    ],
  },
  {
    id: "blackrock-credit-opportunities",
    title: "BlackRock Credit Opportunities",
    description: "Discover four ESG-focused equity funds selected for a more conscious portfolio.",
    contributionType: "ONE OFF",
    logoId: "unicredit",
    recommendedFor: ["moderate-v2"],
    roboCarouselTitle: "BlackRock Credit\nOpportunities",
    contentsSummary: "4 equity ESG funds.",
    holdings: [
      { title: "Sustainable Future Mixed Fund", productId: "CZSUSTAINAB3" },
      { title: "onemarkets Climate Focus Fund", productId: "CZCLIMATEFO2" },
      { title: "Global Dividend Fund", productId: "CZGLOBALDIV4" },
      { title: "Europe Equity Opportunities", productId: "CZEUROPEEQU7" },
    ],
  },
  {
    id: "onemarkets-eur-collection",
    title: "onemarkets EUR collection",
    description: "Explore emerging themes through the Pictet Thematic Intelligence Fund.",
    contributionType: "ONE OFF",
    logoId: "unicredit",
    recommendedFor: ["moderate-v2"],
    roboCarouselTitle: "onemarkets EUR\ncollection",
    contentsSummary: "Pictet Thematic Intelligence Fund",
    holdings: [{ title: "Pictet Thematic Intelligence Fund" }],
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
    roboCarouselTitle: "onemarkets Chase\nRegular EUR",
    description: "Build your investment steadily with monthly contributions to five curated equity funds.",
    contentsSummary: "A mix of 5 high-yield equity funds.",
    holdings: [
      { title: "Amundi Funds Global Opportunity", productId: "CZROBOAMUND14" },
      { title: "onemarkets Climate Focus Fund", productId: "CZCLIMATEFO2" },
      { title: "Global Dividend Fund", productId: "CZGLOBALDIV4" },
      { title: "Global Tech Leaders", productId: "CZGLOBALTEC8" },
      { title: "Europe Equity Opportunities", productId: "CZEUROPEEQU7" },
    ],
  },
  {
    id: "jp-morgan-credit-regular",
    title: "onemarkets J.P. Morgan Credit Opportunities",
    description: "Invest monthly across eight high-yield equity funds in one convenient basket.",
    contributionType: "RECURRENT",
    logoId: "unicredit",
    recommendedFor: ["moderate-v2"],
    roboCarouselTitle: "onemarkets J.P. Morgan\nCredit Opportunities",
    contentsSummary: "A mix of 8 high-yield equity funds.",
    holdings: [
      { title: "Amundi Funds Global Opportunity", productId: "CZROBOAMUND14" },
      { title: "onemarkets Climate Focus Fund", productId: "CZCLIMATEFO2" },
      { title: "Global Dividend Fund", productId: "CZGLOBALDIV4" },
      { title: "Global Tech Leaders", productId: "CZGLOBALTEC8" },
      { title: "Europe Equity Opportunities", productId: "CZEUROPEEQU7" },
      { title: "Sustainable Future Mixed Fund", productId: "CZSUSTAINAB3" },
      { title: "Global Growth Portfolio", productId: "CZGLOBALGRO9" },
      { title: "Nano-Chip Equity Fund", productId: "XY987654321" },
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
] as const satisfies readonly InvestmentBasketFund[];

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
