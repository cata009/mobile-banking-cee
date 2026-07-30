export type RoboInvestorProfileStatus = "valid" | "expired" | "missing";
export type RoboFundingMethod = "one-off" | "regular" | "combined";

export interface RoboFundingFieldVisibility {
  initialAmount: boolean;
  monthlyContribution: boolean;
  startDate: boolean;
  cashAccount: true;
}

export interface RoboAllocation {
  label: string;
  percent: number;
}

export interface RoboStrategy {
  id: "sustainable-balanced" | "balanced-core" | "steady-income";
  name: string;
  description: string;
  allocation: readonly RoboAllocation[];
  illustrativeReturn: string;
  scenarioValues: readonly [number, number, number];
}

export interface RoboHolding {
  name: string;
  type: string;
  percent: number;
  currency: string;
}

export type RoboProductLogo = "apple" | "tesla" | "microsoft" | "amundi" | "unicredit";

export interface RoboPortfolioProduct {
  name: string;
  currency: string;
  percent: number;
  logo: RoboProductLogo;
  securityId: string;
}

export interface RoboPortfolioAssetGroup {
  label: string;
  percent: number;
  products: readonly RoboPortfolioProduct[];
  initiallyVisible: number;
}

export interface RoboPortfolioPresentation {
  shortName: "Sustainable" | "Core" | "Income";
  assetGroups: readonly RoboPortfolioAssetGroup[];
}

export interface RoboPortfolio {
  id: string;
  strategyId: RoboStrategy["id"];
  name: string;
  description: string;
  minimumLabel: string;
  suitabilitySummary: string;
  holdings: readonly RoboHolding[];
}

export type RoboGoalStatus = "ACTIVE" | "INACTIVE";

export interface RoboExistingGoal {
  id: string;
  name: string;
  purpose: string;
  status: RoboGoalStatus;
  currentInteger: string;
  currentDecimals: string;
  returnLabel: string;
  returnTone: "positive" | "negative" | "neutral";
  targetInteger: string;
  targetDecimals: string;
  progress: number;
  startDate?: string;
  endDate: string;
  timeLeft?: string;
  portfolioId: RoboPortfolio["id"];
}

export interface RoboDraft {
  goalType: string;
  goalName: string;
  targetAmount: string;
  horizonYears: number;
  fundingMethod: RoboFundingMethod;
  initialAmount: string;
  monthlyContribution: string;
  startDate: string;
  cashAccountLabel: string;
  investorProfileLabel: string;
  portfolioName: string;
}

export interface RoboReviewRow {
  label: string;
  value: string;
  section: "goal" | "plan";
}

export interface RoboDocument {
  id: string;
  title: string;
  description: string;
}

export const ROBO_GOAL_TYPES = [
  {
    id: "build-wealth",
    title: "General build-up wealth",
  },
  {
    id: "protect-from-inflation",
    title: "Protection for inflation",
  },
  {
    id: "unforeseen-circumstances",
    title: "Saving for unforeseen circumstances",
  },
  {
    id: "major-purchase",
    title: "Saving for a major purchase",
  },
  {
    id: "retirement",
    title: "Retirement",
  },
] as const;

export const ROBO_STRATEGIES: readonly RoboStrategy[] = [
  {
    id: "sustainable-balanced",
    name: "Sustainable Balanced",
    description: "A balanced strategy that considers sustainability preferences alongside growth and risk.",
    allocation: [
      { label: "Cash", percent: 5 },
      { label: "Bonds", percent: 35 },
      { label: "Equities", percent: 60 },
    ],
    illustrativeReturn: "4.2% p.a.",
    scenarioValues: [48200, 88700, 102200],
  },
  {
    id: "balanced-core",
    name: "Balanced Core",
    description: "A diversified mix designed for steady long-term growth, balancing stability and opportunity.",
    allocation: [
      { label: "Cash", percent: 10 },
      { label: "Bonds", percent: 50 },
      { label: "Equities", percent: 40 },
    ],
    illustrativeReturn: "3.8% p.a.",
    scenarioValues: [50100, 84200, 97300],
  },
  {
    id: "steady-income",
    name: "Steady Income",
    description: "A more defensive mix focused on stability, with lower expected growth and smaller swings.",
    allocation: [
      { label: "Cash", percent: 15 },
      { label: "Bonds", percent: 60 },
      { label: "Equities", percent: 25 },
    ],
    illustrativeReturn: "2.6% p.a.",
    scenarioValues: [56300, 76800, 86100],
  },
] as const;

export const ROBO_PORTFOLIOS: readonly RoboPortfolio[] = [
  {
    id: "sustainable-balanced-portfolio",
    strategyId: "sustainable-balanced",
    name: "Sustainable Balanced",
    description: "A diversified portfolio aligned with the selected sustainable strategy.",
    minimumLabel: "From 25 000 CZK",
    suitabilitySummary: "Matches the Moderate profile and selected 10-year horizon.",
    holdings: [
      { name: "Amundi Responsible Global Equity", type: "Equity fund", percent: 42, currency: "CZK" },
      { name: "Amundi Responsible Euro Bond", type: "Bond fund", percent: 33, currency: "EUR" },
      { name: "Global Sustainable Leaders", type: "Equity fund", percent: 20, currency: "USD" },
      { name: "Cash reserve", type: "Cash", percent: 5, currency: "CZK" },
    ],
  },
  {
    id: "balanced-core-portfolio",
    strategyId: "balanced-core",
    name: "Core",
    description: "A broad multi-asset portfolio focused on diversification and long-term balance.",
    minimumLabel: "From 35 000 CZK",
    suitabilitySummary: "Matches the Moderate profile and selected 10-year horizon.",
    holdings: [
      { name: "Amundi Global Equity", type: "Equity fund", percent: 40, currency: "USD" },
      { name: "European Aggregate Bond", type: "Bond fund", percent: 36, currency: "EUR" },
      { name: "Czech Government Bond", type: "Bond fund", percent: 14, currency: "CZK" },
      { name: "Cash reserve", type: "Cash", percent: 10, currency: "CZK" },
    ],
  },
  {
    id: "steady-income-portfolio",
    strategyId: "steady-income",
    name: "Steady Income",
    description: "A defensive portfolio with a larger bond allocation and smaller expected fluctuations.",
    minimumLabel: "From 20 000 CZK",
    suitabilitySummary: "Matches the Moderate profile and selected 10-year horizon.",
    holdings: [
      { name: "Czech Short Duration Bond", type: "Bond fund", percent: 35, currency: "CZK" },
      { name: "European Aggregate Bond", type: "Bond fund", percent: 25, currency: "EUR" },
      { name: "Global Defensive Equity", type: "Equity fund", percent: 25, currency: "USD" },
      { name: "Cash reserve", type: "Cash", percent: 15, currency: "CZK" },
    ],
  },
] as const;

export const ROBO_PORTFOLIO_PRESENTATIONS: Record<RoboStrategy["id"], RoboPortfolioPresentation> = {
  "sustainable-balanced": {
    shortName: "Sustainable",
    assetGroups: [
      {
        label: "Stocks",
        percent: 70,
        initiallyVisible: 2,
        products: [
          { name: "Apple", currency: "USD", percent: 30, logo: "apple", securityId: "robo-apple" },
          { name: "Tesla", currency: "USD", percent: 20, logo: "tesla", securityId: "robo-tesla" },
          { name: "Microsoft", currency: "USD", percent: 20, logo: "microsoft", securityId: "robo-microsoft" },
        ],
      },
      {
        label: "Funds",
        percent: 18,
        initiallyVisible: 1,
        products: [
          { name: "Amundi Funds Global Opportunity", currency: "USD", percent: 18, logo: "amundi", securityId: "robo-amundi-global-opportunity" },
        ],
      },
      {
        label: "Bonds",
        percent: 12,
        initiallyVisible: 3,
        products: [
          { name: "Sustainability Bond 2032", currency: "EUR", percent: 4, logo: "unicredit", securityId: "robo-sustainability-bond-2032" },
          { name: "Green Bond Europe 2030", currency: "EUR", percent: 2, logo: "unicredit", securityId: "robo-green-bond-europe-2030" },
          { name: "Climate Transition Bond 2031", currency: "EUR", percent: 6, logo: "unicredit", securityId: "robo-climate-transition-bond-2031" },
        ],
      },
    ],
  },
  "balanced-core": {
    shortName: "Core",
    assetGroups: [
      {
        label: "Stocks",
        percent: 40,
        initiallyVisible: 2,
        products: [
          { name: "Apple", currency: "USD", percent: 15, logo: "apple", securityId: "robo-apple" },
          { name: "Microsoft", currency: "USD", percent: 15, logo: "microsoft", securityId: "robo-microsoft" },
          { name: "Tesla", currency: "USD", percent: 10, logo: "tesla", securityId: "robo-tesla" },
        ],
      },
      {
        label: "Funds",
        percent: 36,
        initiallyVisible: 1,
        products: [
          { name: "Amundi Global Multi-Asset", currency: "EUR", percent: 36, logo: "amundi", securityId: "robo-amundi-global-multi-asset" },
        ],
      },
      {
        label: "Bonds and cash",
        percent: 24,
        initiallyVisible: 2,
        products: [
          { name: "European Aggregate Bond", currency: "EUR", percent: 14, logo: "unicredit", securityId: "robo-european-aggregate-bond" },
          { name: "Cash reserve", currency: "CZK", percent: 10, logo: "unicredit", securityId: "robo-cash-reserve" },
        ],
      },
    ],
  },
  "steady-income": {
    shortName: "Income",
    assetGroups: [
      {
        label: "Stocks",
        percent: 25,
        initiallyVisible: 2,
        products: [
          { name: "Apple", currency: "USD", percent: 15, logo: "apple", securityId: "robo-apple" },
          { name: "Microsoft", currency: "USD", percent: 10, logo: "microsoft", securityId: "robo-microsoft" },
        ],
      },
      {
        label: "Funds",
        percent: 15,
        initiallyVisible: 1,
        products: [
          { name: "Amundi Defensive Allocation", currency: "EUR", percent: 15, logo: "amundi", securityId: "robo-amundi-defensive-allocation" },
        ],
      },
      {
        label: "Bonds and cash",
        percent: 60,
        initiallyVisible: 3,
        products: [
          { name: "Czech Short Duration Bond", currency: "CZK", percent: 25, logo: "unicredit", securityId: "robo-czech-short-duration-bond" },
          { name: "European Aggregate Bond", currency: "EUR", percent: 20, logo: "unicredit", securityId: "robo-european-aggregate-bond" },
          { name: "Cash reserve", currency: "CZK", percent: 15, logo: "unicredit", securityId: "robo-cash-reserve" },
        ],
      },
    ],
  },
};

export const ROBO_DOCUMENTS: readonly RoboDocument[] = [
  {
    id: "suitability",
    title: "Suitability statement",
    description: "Why the selected portfolio is considered suitable for this goal.",
  },
  {
    id: "kid",
    title: "Key Information Document (KID)",
    description: "Key features, risk indicator, possible outcomes and product costs.",
  },
  {
    id: "account-terms",
    title: "Investment account terms",
    description: "Terms for the account used for this investment goal.",
  },
] as const;

export function isInvestorProfileBlocking(status: RoboInvestorProfileStatus): boolean {
  return status !== "valid";
}

export function getFundingFieldVisibility(method: RoboFundingMethod): RoboFundingFieldVisibility {
  return {
    initialAmount: method !== "regular",
    monthlyContribution: method !== "one-off",
    startDate: method !== "one-off",
    cashAccount: true,
  };
}

export function formatCzkInput(value: string): string {
  const numberValue = Number(value.replace(/[^\d]/g, ""));
  if (!Number.isFinite(numberValue) || numberValue <= 0) return "0 CZK";
  return `${new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(numberValue)} CZK`;
}

export function buildRoboReviewRows(draft: RoboDraft): RoboReviewRow[] {
  const rows: RoboReviewRow[] = [
    { label: "Goal type", value: draft.goalType, section: "goal" },
    { label: "Goal name", value: draft.goalName, section: "goal" },
    { label: "Target amount", value: formatCzkInput(draft.targetAmount), section: "goal" },
    { label: "Portfolio", value: draft.portfolioName, section: "goal" },
  ];

  if (draft.fundingMethod !== "regular") {
    rows.push({ label: "Invest now", value: formatCzkInput(draft.initialAmount), section: "plan" });
  }
  if (draft.fundingMethod !== "one-off") {
    rows.push({ label: "Invest monthly", value: formatCzkInput(draft.monthlyContribution), section: "plan" });
    rows.push({ label: "Monthly contribution starts", value: draft.startDate, section: "plan" });
  }

  rows.push(
    { label: "Time horizon", value: `${draft.horizonYears} years`, section: "plan" },
    { label: "Cash account", value: draft.cashAccountLabel, section: "plan" },
    { label: "Investor profile", value: draft.investorProfileLabel, section: "plan" },
  );

  return rows;
}

export function getPortfoliosForStrategy(strategyId: RoboStrategy["id"]): readonly RoboPortfolio[] {
  return ROBO_PORTFOLIOS.filter((portfolio) => portfolio.strategyId === strategyId);
}
