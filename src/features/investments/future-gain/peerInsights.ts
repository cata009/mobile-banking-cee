export type FutureGainPeerGoalId = 'home-living' | 'buy-a-car' | 'personal-goals' | 'saving'

import {
  MY_BANKER_RETAIL_CATALOGUE,
  type MyBankerCatalogueProduct,
  type MyBankerCurrency,
  type MyBankerProductKey,
} from '@/data/myBankerCore'

export type FutureGainPeerUsage = 'more-than-65' | 'less-than-50' | null
export type FutureGainPeerSimulatorKind = Exclude<MyBankerProductKey, 'overdraft'>

export interface FutureGainPeerProduct {
  id: string
  title: string
  usage: FutureGainPeerUsage
  icon:
    | 'housing-loan'
    | 'real-estate-abroad'
    | 'energy-efficiency'
    | 'credit-card'
    | 'car-loan'
    | 'cash-loan'
    | 'personal-loan'
    | 'term-deposit'
    | 'investment-fund'
  simulator: FutureGainPeerSimulatorKind
}

export interface FutureGainPeerGoal {
  id: FutureGainPeerGoalId
  title: string
  icon: 'home' | 'car' | 'personal-goals' | 'saving'
  sectionTitle: string
  products: readonly FutureGainPeerProduct[]
}

export const FUTURE_GAIN_PEER_PROFILE = {
  age: '36 - 45',
  monthlyIncome: '2001 - 3000 €',
} as const

export interface FutureGainPeerSimulationInput {
  kind: FutureGainPeerSimulatorKind
  amount: number
  currency: MyBankerCurrency
  termMonths: number
  rateMode?: 'combined' | 'variable'
}

export interface FutureGainPeerSimulationResult {
  ratePercent: number
  variableRatePercent: number | null
  monthlyPayment: number | null
  monthlyPaymentAfterFixedPeriod: number | null
  monthlyInterest: number | null
  estimatedReturn: number | null
  totalAmount: number | null
}

const SIMULATOR_PRESETS: Record<FutureGainPeerSimulatorKind, { amount: number; termMonths: number }> = {
  'term-deposit': { amount: 5_000, termMonths: 12 },
  'cash-loan': { amount: 8_000, termMonths: 48 },
  mortgage: { amount: 70_000, termMonths: 120 },
  'credit-card': { amount: 1_300, termMonths: 0 },
  'investment-fund': { amount: 3_000, termMonths: 60 },
}

export function getFutureGainPeerSimulatorPreset(kind: FutureGainPeerSimulatorKind) {
  return SIMULATOR_PRESETS[kind]
}

function getSimulatorModel(kind: FutureGainPeerSimulatorKind): MyBankerCatalogueProduct {
  return MY_BANKER_RETAIL_CATALOGUE.find((product) => product.key === kind) ?? MY_BANKER_RETAIL_CATALOGUE[0]!
}

function resolvePeerSimulatorRate(
  model: MyBankerCatalogueProduct,
  amount: number,
  currency: MyBankerCurrency,
  termMonths: number,
): number | null {
  const term = model.termMonths ? termMonths : 0
  const rateRow = model.rateCard.find(
    (candidate) =>
      candidate.currency === currency &&
      amount >= candidate.minAmount &&
      amount <= candidate.maxAmount &&
      term >= candidate.minTermMonths &&
      term <= candidate.maxTermMonths,
  )

  if (rateRow) return rateRow.ratePercent
  if (model.key !== 'mortgage' || currency !== 'EUR' || amount > 500_000) return null

  // The supplied mortgage Figma includes a €500,000 quick amount while the
  // local demo rate card tops out at €200,000. Carry its highest EUR band
  // forward for that illustrative amount so the visible chip remains usable.
  return (
    model.rateCard
      .filter(
        (candidate) =>
          candidate.currency === currency && term >= candidate.minTermMonths && term <= candidate.maxTermMonths,
      )
      .sort((left, right) => right.maxAmount - left.maxAmount)[0]?.ratePercent ?? null
  )
}

function monthlyAnnuity(principal: number, annualRatePercent: number, termMonths: number): number {
  if (termMonths <= 0) return 0
  const monthlyRate = annualRatePercent / 100 / 12
  if (monthlyRate === 0) return principal / termMonths
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths))
}

export function calculateFutureGainPeerSimulation(
  input: FutureGainPeerSimulationInput,
): FutureGainPeerSimulationResult | null {
  if (input.amount <= 0 || !Number.isFinite(input.amount)) return null

  const model = getSimulatorModel(input.kind)
  const ratePercent = resolvePeerSimulatorRate(model, input.amount, input.currency, input.termMonths)
  if (ratePercent === null) return null

  if (model.simulation === 'installment') {
    const fixedMonths = Math.min(60, input.termMonths)
    const variableRatePercent = Math.max(
      ratePercent,
      ...model.rateCard
        .filter((rate) => rate.currency === input.currency && rate.ratePercent > ratePercent)
        .map((rate) => rate.ratePercent),
    )
    const initialRatePercent = input.rateMode === 'variable' ? variableRatePercent : ratePercent
    const monthlyPayment = monthlyAnnuity(input.amount, initialRatePercent, input.termMonths)
    const balanceAfterFixedPeriod =
      fixedMonths === 0
        ? input.amount
        : Math.max(
            0,
            input.amount * Math.pow(1 + initialRatePercent / 100 / 12, fixedMonths) -
              monthlyPayment *
                ((Math.pow(1 + initialRatePercent / 100 / 12, fixedMonths) - 1) / (initialRatePercent / 100 / 12)),
          )
    const remainingMonths = Math.max(0, input.termMonths - fixedMonths)
    const monthlyPaymentAfterFixedPeriod =
      remainingMonths > 0 && variableRatePercent !== initialRatePercent
        ? monthlyAnnuity(balanceAfterFixedPeriod, variableRatePercent, remainingMonths)
        : remainingMonths > 0
          ? monthlyPayment
          : null
    const totalAmount = fixedMonths * monthlyPayment + (monthlyPaymentAfterFixedPeriod ?? 0) * remainingMonths

    return {
      ratePercent: initialRatePercent,
      variableRatePercent: variableRatePercent === initialRatePercent ? null : variableRatePercent,
      monthlyPayment,
      monthlyPaymentAfterFixedPeriod,
      monthlyInterest: null,
      estimatedReturn: null,
      totalAmount,
    }
  }

  if (model.simulation === 'revolving') {
    return {
      ratePercent,
      variableRatePercent: null,
      monthlyPayment: null,
      monthlyPaymentAfterFixedPeriod: null,
      monthlyInterest: (input.amount * ratePercent) / 100 / 12,
      estimatedReturn: null,
      totalAmount: null,
    }
  }

  const grossReturn = input.amount * (Math.pow(1 + ratePercent / 100, input.termMonths / 12) - 1)
  return {
    ratePercent,
    variableRatePercent: null,
    monthlyPayment: null,
    monthlyPaymentAfterFixedPeriod: null,
    monthlyInterest: null,
    estimatedReturn: grossReturn,
    totalAmount: input.amount + grossReturn,
  }
}

/** Peer-share labels are included only where they are present in the supplied Figma frame. */
export const FUTURE_GAIN_PEER_GOALS: readonly FutureGainPeerGoal[] = [
  {
    id: 'home-living',
    title: 'Home & Living',
    icon: 'home',
    sectionTitle: 'Financing options for your home',
    products: [
      { id: 'housing-loan', title: 'Housing loan', usage: 'more-than-65', icon: 'housing-loan', simulator: 'mortgage' },
      {
        id: 'real-estate-abroad',
        title: 'Loan for purchasing real estate abroad',
        usage: 'less-than-50',
        icon: 'real-estate-abroad',
        simulator: 'mortgage',
      },
      {
        id: 'energy-efficiency-loan',
        title: 'Energy efficiency loan',
        usage: 'less-than-50',
        icon: 'energy-efficiency',
        simulator: 'cash-loan',
      },
      {
        id: 'credit-cards',
        title: 'Credit cards',
        usage: 'less-than-50',
        icon: 'credit-card',
        simulator: 'credit-card',
      },
    ],
  },
  {
    id: 'buy-a-car',
    title: 'Buy a car',
    icon: 'car',
    sectionTitle: 'Financing options for your car',
    products: [
      { id: 'car-loan', title: 'Car loan', usage: null, icon: 'car-loan', simulator: 'cash-loan' },
      { id: 'cash-loan', title: 'Cash loan', usage: null, icon: 'cash-loan', simulator: 'cash-loan' },
    ],
  },
  {
    id: 'personal-goals',
    title: 'Personal Goals',
    icon: 'personal-goals',
    sectionTitle: 'Financing options for your goals',
    products: [
      { id: 'personal-loan', title: 'Personal loan', usage: null, icon: 'personal-loan', simulator: 'cash-loan' },
      {
        id: 'credit-cards-personal',
        title: 'Credit cards',
        usage: null,
        icon: 'credit-card',
        simulator: 'credit-card',
      },
    ],
  },
  {
    id: 'saving',
    title: 'Saving',
    icon: 'saving',
    sectionTitle: 'Savings options for your future',
    products: [
      { id: 'term-deposit', title: 'Term deposit', usage: null, icon: 'term-deposit', simulator: 'term-deposit' },
      {
        id: 'investment-funds',
        title: 'Investment funds',
        usage: null,
        icon: 'investment-fund',
        simulator: 'investment-fund',
      },
    ],
  },
]
