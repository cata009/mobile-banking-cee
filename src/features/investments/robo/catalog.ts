import { getRecommendedInvestmentBaskets } from '@/app/config/investmentBasketFundsConfig'
import {
  type RoboPortfolio,
  type RoboStrategy,
  RoboPortfolioPresentation,
  RoboDocument,
} from '@/features/investments/robo/types'

export const ROBO_GOAL_TYPES = [
  {
    id: 'build-wealth',
    title: 'General build-up wealth',
    description: 'Grow your wealth to support long-term goals.',
  },
  {
    id: 'unforeseen-circumstances',
    title: 'Saving for unforeseen circumstances',
    description: 'Build a reserve for unexpected expenses.',
  },
  {
    id: 'major-purchase',
    title: 'Saving for a major purchase',
    description: 'Save for a future purchase, like a home or car.',
  },
  {
    id: 'retirement',
    title: 'Retirement',
    description: 'Build long-term savings for retirement.',
  },
] as const

export const ROBO_GOAL_NAME_SUGGESTIONS: Readonly<Record<string, readonly string[]>> = {
  'General build-up wealth': ['Bright future', 'Make money work', 'My next opportunity'],
  'Saving for unforeseen circumstances': ['Peace of mind', 'My safety net', 'Ready for surprises'],
  'Saving for a major purchase': ['My dream home', 'My next car', 'Big purchase'],
  Retirement: ['Retire on my terms', 'Brighter retirement', 'Future freedom'],
}

export function getRoboGoalNameSuggestions(goalType: string): readonly string[] {
  return ROBO_GOAL_NAME_SUGGESTIONS[goalType] ?? ['Bright future', 'Make money work', 'My next opportunity']
}

export const ROBO_STRATEGIES: readonly RoboStrategy[] = [
  {
    id: 'sustainable-balanced',
    name: 'Sustainable Balanced',
    description: 'A balanced strategy that considers sustainability preferences alongside growth and risk.',
    allocation: [
      { label: 'Cash', percent: 5 },
      { label: 'Bonds', percent: 35 },
      { label: 'Equities', percent: 60 },
    ],
    illustrativeReturn: '4.2% p.a.',
    scenarioValues: [48200, 88700, 102200],
  },
  {
    id: 'balanced-core',
    name: 'Balanced Core',
    description: 'A diversified mix designed for steady long-term growth, balancing stability and opportunity.',
    allocation: [
      { label: 'Cash', percent: 10 },
      { label: 'Bonds', percent: 50 },
      { label: 'Equities', percent: 40 },
    ],
    illustrativeReturn: '3.8% p.a.',
    scenarioValues: [50100, 84200, 97300],
  },
  {
    id: 'steady-income',
    name: 'Steady Income',
    description: 'A more defensive mix focused on stability, with lower expected growth and smaller swings.',
    allocation: [
      { label: 'Cash', percent: 15 },
      { label: 'Bonds', percent: 60 },
      { label: 'Equities', percent: 25 },
    ],
    illustrativeReturn: '2.6% p.a.',
    scenarioValues: [56300, 76800, 86100],
  },
] as const

export const ROBO_PORTFOLIOS: readonly RoboPortfolio[] = [
  {
    id: 'sustainable-balanced-portfolio',
    strategyId: 'sustainable-balanced',
    name: 'Sustainable Balanced',
    description: 'A diversified portfolio aligned with the selected sustainable strategy.',
    minimumLabel: 'From 25.000,00 CZK',
    suitabilitySummary: 'Matches the Moderate profile and selected 10-year horizon.',
    holdings: [
      { name: 'Amundi Responsible Global Equity', type: 'Equity fund', percent: 42, currency: 'CZK' },
      { name: 'Amundi Responsible Euro Bond', type: 'Bond fund', percent: 33, currency: 'EUR' },
      { name: 'Global Sustainable Leaders', type: 'Equity fund', percent: 20, currency: 'USD' },
      { name: 'Cash reserve', type: 'Cash', percent: 5, currency: 'CZK' },
    ],
  },
  {
    id: 'balanced-core-portfolio',
    strategyId: 'balanced-core',
    name: 'Core',
    description: 'A broad multi-asset portfolio focused on diversification and long-term balance.',
    minimumLabel: 'From 35.000,00 CZK',
    suitabilitySummary: 'Matches the Moderate profile and selected 10-year horizon.',
    holdings: [
      { name: 'Amundi Global Equity', type: 'Equity fund', percent: 40, currency: 'USD' },
      { name: 'European Aggregate Bond', type: 'Bond fund', percent: 36, currency: 'EUR' },
      { name: 'Czech Government Bond', type: 'Bond fund', percent: 14, currency: 'CZK' },
      { name: 'Cash reserve', type: 'Cash', percent: 10, currency: 'CZK' },
    ],
  },
  {
    id: 'steady-income-portfolio',
    strategyId: 'steady-income',
    name: 'Steady Income',
    description: 'A defensive portfolio with a larger bond allocation and smaller expected fluctuations.',
    minimumLabel: 'From 20.000,00 CZK',
    suitabilitySummary: 'Matches the Moderate profile and selected 10-year horizon.',
    holdings: [
      { name: 'Czech Short Duration Bond', type: 'Bond fund', percent: 35, currency: 'CZK' },
      { name: 'European Aggregate Bond', type: 'Bond fund', percent: 25, currency: 'EUR' },
      { name: 'Global Defensive Equity', type: 'Equity fund', percent: 25, currency: 'USD' },
      { name: 'Cash reserve', type: 'Cash', percent: 15, currency: 'CZK' },
    ],
  },
  ...ROBO_STRATEGIES.flatMap((strategy) =>
    getRecommendedInvestmentBaskets('moderate-v2').map((basket) => ({
      id: `basket-${strategy.id}-${basket.id}`,
      strategyId: strategy.id,
      name: basket.title,
      description: basket.description,
      suitabilitySummary: `Recommended for the Moderate - V2 profile and this goal’s ${basket.contributionType === 'ONE OFF' ? 'one-off' : 'regular investment'} plan.`,
      holdings: [],
      basketFund: basket,
    })),
  ),
] as const

export const ROBO_PORTFOLIO_PRESENTATIONS: Record<RoboStrategy['id'], RoboPortfolioPresentation> = {
  'sustainable-balanced': {
    shortName: 'Sustainable',
    assetGroups: [
      {
        label: 'Stocks',
        percent: 70,
        initiallyVisible: 2,
        products: [
          { name: 'Apple', currency: 'USD', percent: 30, logo: 'apple', securityId: 'robo-apple' },
          { name: 'Tesla', currency: 'USD', percent: 20, logo: 'tesla', securityId: 'robo-tesla' },
          { name: 'Microsoft', currency: 'USD', percent: 20, logo: 'microsoft', securityId: 'robo-microsoft' },
        ],
      },
      {
        label: 'Funds',
        percent: 18,
        initiallyVisible: 1,
        products: [
          {
            name: 'Amundi Funds Global Opportunity',
            currency: 'USD',
            percent: 18,
            logo: 'amundi',
            securityId: 'robo-amundi-global-opportunity',
          },
        ],
      },
      {
        label: 'Bonds',
        percent: 12,
        initiallyVisible: 3,
        products: [
          {
            name: 'Sustainability Bond 2032',
            currency: 'EUR',
            percent: 4,
            logo: 'unicredit',
            securityId: 'robo-sustainability-bond-2032',
          },
          {
            name: 'Green Bond Europe 2030',
            currency: 'EUR',
            percent: 2,
            logo: 'unicredit',
            securityId: 'robo-green-bond-europe-2030',
          },
          {
            name: 'Climate Transition Bond 2031',
            currency: 'EUR',
            percent: 6,
            logo: 'unicredit',
            securityId: 'robo-climate-transition-bond-2031',
          },
        ],
      },
    ],
  },
  'balanced-core': {
    shortName: 'Core',
    assetGroups: [
      {
        label: 'Stocks',
        percent: 40,
        initiallyVisible: 2,
        products: [
          { name: 'Apple', currency: 'USD', percent: 15, logo: 'apple', securityId: 'robo-apple' },
          { name: 'Microsoft', currency: 'USD', percent: 15, logo: 'microsoft', securityId: 'robo-microsoft' },
          { name: 'Tesla', currency: 'USD', percent: 10, logo: 'tesla', securityId: 'robo-tesla' },
        ],
      },
      {
        label: 'Funds',
        percent: 36,
        initiallyVisible: 1,
        products: [
          {
            name: 'Amundi Global Multi-Asset',
            currency: 'EUR',
            percent: 36,
            logo: 'amundi',
            securityId: 'robo-amundi-global-multi-asset',
          },
        ],
      },
      {
        label: 'Bonds and cash',
        percent: 24,
        initiallyVisible: 2,
        products: [
          {
            name: 'European Aggregate Bond',
            currency: 'EUR',
            percent: 14,
            logo: 'unicredit',
            securityId: 'robo-european-aggregate-bond',
          },
          { name: 'Cash reserve', currency: 'CZK', percent: 10, logo: 'unicredit', securityId: 'robo-cash-reserve' },
        ],
      },
    ],
  },
  'steady-income': {
    shortName: 'Income',
    assetGroups: [
      {
        label: 'Stocks',
        percent: 25,
        initiallyVisible: 2,
        products: [
          { name: 'Apple', currency: 'USD', percent: 15, logo: 'apple', securityId: 'robo-apple' },
          { name: 'Microsoft', currency: 'USD', percent: 10, logo: 'microsoft', securityId: 'robo-microsoft' },
        ],
      },
      {
        label: 'Funds',
        percent: 15,
        initiallyVisible: 1,
        products: [
          {
            name: 'Amundi Defensive Allocation',
            currency: 'EUR',
            percent: 15,
            logo: 'amundi',
            securityId: 'robo-amundi-defensive-allocation',
          },
        ],
      },
      {
        label: 'Bonds and cash',
        percent: 60,
        initiallyVisible: 3,
        products: [
          {
            name: 'Czech Short Duration Bond',
            currency: 'CZK',
            percent: 25,
            logo: 'unicredit',
            securityId: 'robo-czech-short-duration-bond',
          },
          {
            name: 'European Aggregate Bond',
            currency: 'EUR',
            percent: 20,
            logo: 'unicredit',
            securityId: 'robo-european-aggregate-bond',
          },
          { name: 'Cash reserve', currency: 'CZK', percent: 15, logo: 'unicredit', securityId: 'robo-cash-reserve' },
        ],
      },
    ],
  },
}

export const ROBO_DOCUMENTS: readonly RoboDocument[] = [
  {
    id: 'suitability',
    title: 'Suitability statement',
    description: 'Why the selected portfolio is considered suitable for this goal.',
  },
  {
    id: 'kid',
    title: 'Key Information Document (KID)',
    description: 'Key features, risk indicator, possible outcomes and product costs.',
  },
  {
    id: 'account-terms',
    title: 'Investment account terms',
    description: 'Terms for the account used for this investment goal.',
  },
] as const
