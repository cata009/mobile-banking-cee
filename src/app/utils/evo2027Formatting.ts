import type { Currency } from '@/data/products'

export interface Evo2027FormattedAmount {
  integer: string
  decimals: string
  currency: string
}

/** Evo 2027 display contract: dot grouping, comma decimals, never whitespace grouping. */
export function formatEvo2027Number(amount: number): string {
  const safeAmount = Number.isFinite(amount) ? Math.abs(amount) : 0
  const [integerPart, decimalPart] = safeAmount.toFixed(2).split('.')
  const groupedInteger = integerPart!.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return `${groupedInteger},${decimalPart ?? '00'}`
}

export function formatEvo2027SignedNumber(amount: number): string {
  const sign = amount < 0 ? '-' : amount > 0 ? '+' : ''
  return `${sign}${formatEvo2027Number(amount)}`
}

export function formatEvo2027Amount(amount: number, currency: Currency | string): Evo2027FormattedAmount {
  const formatted = formatEvo2027Number(amount)
  const separatorIndex = formatted.indexOf(',')

  return {
    integer: formatted.slice(0, separatorIndex),
    decimals: formatted.slice(separatorIndex),
    currency,
  }
}
