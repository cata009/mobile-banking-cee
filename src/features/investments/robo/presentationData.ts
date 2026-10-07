import type { CountryId } from '@/app/state/demoTypes'
import type { CurrentAccount } from '@/data/products'
import { formatCzLocalAccountNumber } from '@/data/czechDomesticAccount'
import { ROBO_STRATEGIES } from '@/features/investments/robo/catalog'
import { type RoboFundingMethod } from '@/features/investments/robo/types'

export const defaultCashAccountLabel = 'Current ··· 4821'

export const DEFAULT_ROBO_CASH_ACCOUNT: CurrentAccount = {
  id: 'robo-default-cash',
  type: 'current_account',
  name: 'My account name',
  accountNumber: 'CZ12345678901234',
  balance: 50_000,
  currency: 'CZK',
}

export const DEFAULT_ROBO_STRATEGY = ROBO_STRATEGIES[0]!

export const ROBO_INVESTOR_PROFILE_LABELS = {
  conservative: 'Conservative - V1',
  moderate: 'Moderate - V2',
  aggressive: 'Aggressive - V3',
} as const

export const ROBO_FUNDING_OPTIONS: readonly { id: RoboFundingMethod; title: string; description: string }[] = [
  { id: 'one-off', title: 'Invest once', description: 'Make a single investment now.' },
  { id: 'regular', title: 'Invest monthly', description: 'Choose an amount to contribute each month.' },
  {
    id: 'combined',
    title: 'Invest now and monthly',
    description: 'Make an initial investment, then continue with monthly contributions.',
  },
]

export function compactRoboAccountNumber(value: string) {
  if (value.length <= 8) return value
  return `${value.slice(0, 4)} •••• ${value.slice(-4)}`
}

export function displayRoboAccountNumber(value: string, country: CountryId) {
  return country === 'CZ' ? formatCzLocalAccountNumber(value) : compactRoboAccountNumber(value)
}
