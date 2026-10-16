import { convertCurrency, roundMoney } from '@/data/exchangeRates'
export const FUTURE_GAIN_REFERENCE_DATE = '03.01.2026'
export function calculateFutureGainInvestmentIllustration({
  amount,
  availableBalance,
  option,
}: {
  amount: number
  availableBalance: number
  option: InvestmentOption
}) {
  const isAmountValid = amount > 0 && amount <= availableBalance
  const annualReturnRate = option.estimateRate
  const potentialReturn = isAmountValid ? roundMoney((amount * annualReturnRate) / 100) : 0
  return {
    isAmountValid,
    annualReturnRate,
    potentialReturn,
    accumulatedAmount: roundMoney(amount + potentialReturn),
    amountError:
      amount <= 0
        ? 'Enter an amount to continue.'
        : amount > availableBalance
          ? 'Amount exceeds your available balance.'
          : '',
  }
}
export function calculateFutureGainDepositQuote({
  amount,
  currency,
  fundingSource,
  tenor,
}: {
  amount: number
  currency: DepositCurrency
  fundingSource: FundingSource
  tenor: TenorMonths
}) {
  const rates = RATES[fundingSource][currency]
  const isAmountValid = amount > 0
  const annualizedDayFactor = fundingSource === 'external' && currency === 'RSD' ? 1 : 365 / 360
  const grossInterest = isAmountValid
    ? roundMoney(amount * (rates.nominal / 100) * (tenor / 12) * annualizedDayFactor)
    : 0
  const grossMaturity = roundMoney(amount + grossInterest)
  const tax = roundMoney(grossInterest * (rates.tax / 100))
  const averageUninvestedFunds = roundMoney(convertCurrency(AVERAGE_UNINVESTED_FUNDS_RSD, 'RSD', currency))
  return {
    isAmountValid,
    rates,
    grossInterest,
    grossMaturity,
    tax,
    netMaturity: roundMoney(grossMaturity - tax),
    averageUninvestedFunds,
    potentialYield: roundMoney(averageUninvestedFunds * (RATES.current[currency].nominal / 100) * (365 / 360)),
  }
}
/** Canonical RS FutureGain data and calculations extracted from the retained Source simulators. */
export type SimulatorKind = 'fund' | 'stock'
export type SimulatorCurrency = 'EUR' | 'RSD' | 'USD'
export type SimulatorView = 'calculator' | 'fund-detail' | 'buy-order'

export interface FutureGainFundSimulatorState {
  securityId: string
  amountInput: string
  currency: SimulatorCurrency
}

export interface InvestmentOption {
  id: string
  name: string
  selectionRate: number
  estimateRate: number
  currency?: SimulatorCurrency
}

export const FUND_OPTIONS: readonly InvestmentOption[] = [
  {
    id: 'balanced-income',
    name: 'UniCredit Balanced Income Fund',
    selectionRate: 1.8,
    estimateRate: 1.8,
    currency: 'EUR',
  },
  {
    id: 'climate-focus',
    name: 'onemarkets Climate Focus Fund',
    selectionRate: 2.21,
    estimateRate: 2.21,
    currency: 'EUR',
  },
  {
    id: 'sustainable-future',
    name: 'Sustainable Future Mixed Fund',
    selectionRate: 3.75,
    estimateRate: 3.75,
    currency: 'USD',
  },
  { id: 'global-dividend', name: 'Global Dividend Fund', selectionRate: 1.14, estimateRate: 1.14, currency: 'EUR' },
  { id: 'global-growth', name: 'Global Growth Portfolio', selectionRate: 0.72, estimateRate: 0.72, currency: 'EUR' },
]

export const STOCK_OPTIONS: readonly InvestmentOption[] = [
  { id: 'stoxx-600', name: 'STOXX 600', selectionRate: 3.2, estimateRate: 2.31 },
  { id: 'stoxx-700', name: 'STOXX 700', selectionRate: 3.1, estimateRate: 2.31 },
  { id: 'stoxx-800', name: 'STOXX 800', selectionRate: 3.1, estimateRate: 2.31 },
  { id: 'stoxx-900', name: 'STOXX 900', selectionRate: 3.1, estimateRate: 2.31 },
  { id: 'stoxx-310', name: 'STOXX 310', selectionRate: 3.1, estimateRate: 2.31 },
]

export const INVESTMENT_CURRENCIES: readonly SimulatorCurrency[] = ['EUR', 'RSD', 'USD']
export const INVESTMENT_DISCLAIMERS: Record<SimulatorKind, string> = {
  fund: "The information provided is for informational purposes only and does not constitute investment advice or a personal recommendation within the meaning of the Capital Market Law. The data presented is based on aggregated statistical data and does not take into account your investment objectives, financial situation, or experience. The rates of return and calculated returns shown are indicative and provided solely for informational purposes. Investing in investment funds involves the risk of loss of capital, and past performance is not a reliable indicator of future results. Investment funds are not a banking product and do not provide guaranteed returns. These investments are not covered by the Deposit Insurance Scheme, which applies to deposits in the Republic of Serbia. Before making an investment decision, consider the investment fund's objectives, risks, fees, and costs, as well as your own investment goals and financial circumstances.",
  stock:
    'The information presented is for informational purposes only and does not constitute investment advice or a personal recommendation within the meaning of the Capital Market Law. The information displayed is based on aggregated statistical data and does not take into account your investment objectives, financial situation, or investment experience. The returns presented are historical performance indicators and are provided solely for informational purposes. Past performance is not a reliable indicator of future results. The value of investments may rise or fall, and investments in shares may result in the partial or total loss of the invested capital.',
}

export const INVESTMENT_INFO_STEPS: Record<SimulatorKind, readonly { title: string; description: string }[]> = {
  fund: [
    {
      title: 'CHOOSE A FUND',
      description: 'Explore the available funds and select the one you would like to simulate.',
    },
    {
      title: 'SET YOUR INVESTMENT',
      description: 'Enter an amount or choose one of the suggested values based on your available balance.',
    },
    {
      title: 'SEE THE ILLUSTRATION',
      description: 'View the potential return, accumulated amount and the key information for the selected fund.',
    },
    {
      title: 'EXPLORE THE FUND',
      description:
        'If you are interested, continue to learn more about the fund, its objectives, risks, costs and conditions before making an investment decision.',
    },
  ],
  stock: [
    {
      title: 'CHOOSE A STOCK',
      description: 'Explore the available stocks and select one to include in your illustration.',
    },
    {
      title: 'SET YOUR INVESTMENT',
      description: 'Enter an amount or choose one of the suggested values based on your available balance.',
    },
    {
      title: 'SEE THE ILLUSTRATION',
      description: 'Review the potential return and accumulated amount for the selected stock.',
    },
    {
      title: 'EXPLORE THE STOCK',
      description: 'If you are interested, request a callback to discuss the stock, its risks and conditions.',
    },
  ],
}

export function parseFutureGainAmount(value: string): number {
  const normalized = value.trim().replace(/\s/g, '')
  const decimalNormalized = normalized.includes(',') ? normalized.replace(/\./g, '').replace(',', '.') : normalized
  const amount = Number(decimalNormalized)
  return Number.isFinite(amount) ? Math.max(0, amount) : 0
}

export function getFutureGainInvestmentSuggestions(available: number, currency: SimulatorCurrency): number[] {
  const step = currency === 'RSD' ? 1_000 : 100
  const suggestions = [0.25, 0.5, 0.75].map((ratio) =>
    Math.min(available, Math.floor((available * ratio) / step) * step),
  )
  suggestions.push(roundMoney(available))
  return [...new Set(suggestions.filter((amount) => amount > 0))]
}

export type DepositCurrency = 'EUR' | 'RSD' | 'USD'
export type FundingSource = 'current' | 'external'
export type TenorMonths = 3 | 6 | 12

export const DEPOSIT_CURRENCIES: readonly DepositCurrency[] = ['EUR', 'RSD', 'USD']
export const TENOR_OPTIONS: readonly TenorMonths[] = [12, 6, 3]
export const EXTERNAL_LIMITS: Record<DepositCurrency, number> = {
  EUR: 100_000,
  RSD: 1_000_000,
  USD: 100_000,
}

// Illustrative RS average of funds left uninvested after monthly expenses; this is not the customer's current account balance.
export const AVERAGE_UNINVESTED_FUNDS_RSD = 1_500_000

export const RATES: Record<
  FundingSource,
  Record<DepositCurrency, { nominal: number; effective: number; tax: number }>
> = {
  current: {
    EUR: { nominal: 2.3, effective: 1.98, tax: 15 },
    RSD: { nominal: 3.6, effective: 3.65, tax: 0 },
    USD: { nominal: 2.3, effective: 1.98, tax: 15 },
  },
  external: {
    EUR: { nominal: 3.2, effective: 2.72, tax: 15 },
    RSD: { nominal: 4.5, effective: 4.5, tax: 0 },
    USD: { nominal: 4, effective: 4, tax: 15 },
  },
}

export const TERM_DEPOSIT_DISCLAIMER =
  'The information presented is for informational purposes and does not take into account your individual financial needs, circumstances, or investment experience. The displayed interest rates and expected returns are indicative in nature and do not constitute a binding offer. The final terms and conditions of a term deposit, as well as the applicable interest rates, shall be defined in the agreement concluded between the Bank and the client. The Bank reserves the right to amend the terms and conditions in accordance with its business policy and prevailing market conditions. The Bank participates in the mandatory deposit insurance scheme established in the Republic of Serbia.'

export const SIMULATOR_STEPS = [
  {
    title: 'CHOOSE YOUR FUNDS',
    description: 'Select whether you want to use money from your UniCredit account or funds from another bank.',
  },
  {
    title: 'ADJUST YOUR DEPOSIT',
    description: 'Change the amount, currency and term to compare different scenarios.',
  },
  {
    title: 'SEE YOUR ESTIMATE',
    description: 'The calculation updates automatically to show the applicable interest rate and estimated return.',
  },
  {
    title: 'REQUEST AN OFFER',
    description:
      'If you find an option that suits you, you can submit a request to the bank. The simulation itself does not open a deposit.',
  },
] as const

export function getFutureGainDepositSuggestions(
  maximum: number,
  currency: DepositCurrency,
  source: FundingSource,
): number[] {
  const ratios = source === 'current' ? [0.25, 0.5, 0.75, 1] : [0.2, 0.5, 0.7, 1]
  const roundingStep = currency === 'RSD' ? 1_000 : 100
  const suggestions = ratios.map((ratio) => {
    if (ratio === 1) return roundMoney(maximum)
    return Math.min(maximum, Math.floor((maximum * ratio) / roundingStep) * roundingStep)
  })
  return [...new Set(suggestions.filter((amount) => amount > 0))]
}

export type SmartInvestmentCurrency = 'EUR' | 'RSD' | 'USD'

export const SMART_INVESTMENT_CURRENCIES: readonly SmartInvestmentCurrency[] = ['EUR', 'RSD', 'USD']

export const SMART_INVESTMENT_DISCLAIMER =
  'The information provided is for informational purposes only and does not constitute investment advice or a personal recommendation within the meaning of the Capital Market Law. It is based on aggregated statistical data and does not take into account your investment objectives, financial situation, or experience. Investing involves the risk of loss of capital, and past performance is not a guarantee of future results.'

export const SMART_INVESTMENT_STEPS = [
  {
    title: 'CHOOSE YOUR FUNDS',
    description: 'Select whether you want to use money from your UniCredit account or funds from another bank.',
  },
  {
    title: 'ADJUST YOUR DEPOSIT',
    description: 'Change the amount, currency and term to compare different scenarios.',
  },
  {
    title: 'SEE YOUR ESTIMATE',
    description: 'The calculation updates automatically to show the applicable interest rate and estimated return.',
  },
  {
    title: 'REQUEST AN OFFER',
    description:
      'If you find an option that suits you, you can submit a request to the bank. The simulation itself does not open a deposit.',
  },
] as const
