export type InvestmentBasketContributionType = "ONE OFF" | "RECURRENT";

export interface InvestmentBasketFund {
  id: string;
  title: string;
  description: string;
  contributionType: InvestmentBasketContributionType;
  logoId: string;
}

export const CZ_INVESTMENT_BASKETS = [
  {
    id: "jp-morgan-global-growth",
    title: "onemarkets J.P. Morgan Global growth Basket",
    description: "A mix of 5 high-yield equity funds.",
    contributionType: "ONE OFF",
    logoId: "unicredit",
  },
  {
    id: "blackrock-credit-opportunities",
    title: "BlackRock Credit Opportunities",
    description: "4 equity ESG funds.",
    contributionType: "ONE OFF",
    logoId: "unicredit",
  },
  {
    id: "onemarkets-eur-collection",
    title: "onemarkets EUR collection",
    description: "Pictet Thematic Intelligence Fund",
    contributionType: "ONE OFF",
    logoId: "unicredit",
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
    description: "A mix of 5 high-yield equity funds this is a secondary line of description",
    contributionType: "RECURRENT",
    logoId: "unicredit",
  },
  {
    id: "jp-morgan-credit-regular",
    title: "onemarkets J.P. Morgan Credit Opportunities",
    description: "A mix of 8 high-yield equity funds.",
    contributionType: "RECURRENT",
    logoId: "unicredit",
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
