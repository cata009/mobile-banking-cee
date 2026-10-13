import { securities, readSecuritiesFinancialState } from './mobileFirstSecurities'
import { availableInvestmentFunds, type InvestmentFund } from './mobileFirstFunds'
import { readFundsState, type FundsStoredOrder } from './mobileFirstFundsState'
import type { InvestmentOverviewVariant } from './mobileFirstInvestments'
import { getItalyFinancialSnapshot } from '../finance/italyFinancials'

/** Reference date for the static demo quotes and positions, never a live market timestamp. */
export function formatInvestmentReferenceDate(date = getItalyFinancialSnapshot().asOf): string {
  return date.split('-').reverse().join('/')
}

/** Quotes and NAVs retain their precision; only the resulting monetary value is rounded. */
export function valuePosition(quantity: number, quote: number): number {
  return Number.isFinite(quantity) && Number.isFinite(quote) ? Math.round(quantity * quote * 100) : 0
}
export function allocateValues<T extends { name: string; valueCents: number }>(
  items: readonly T[],
): Array<T & { percent: number }> {
  const total = items.reduce((sum, item) => sum + item.valueCents, 0)
  if (!total) return items.map((item) => ({ ...item, percent: 0 }))
  const shares = items.map((item) => (item.valueCents / total) * 10000)
  const rounded = shares.map(Math.floor)
  const ranked = shares
    .map((share, index) => ({ index, remainder: share - rounded[index]! }))
    .sort((a, b) => b.remainder - a.remainder)
  for (let rest = 10000 - rounded.reduce((sum, n) => sum + n, 0), index = 0; rest > 0; rest--, index++)
    rounded[ranked[index % ranked.length]!.index]!++
  return items.map((item, index) => ({ ...item, percent: rounded[index]! / 100 }))
}
export const readInvestmentSecuritiesState = readSecuritiesFinancialState
export function getSecurityPositions(state = readInvestmentSecuritiesState()) {
  return securities.map((security) => {
    let quantity = security.quantity
    let costCents: number | undefined =
      security.costCents ??
      (security.averageCost === undefined
        ? quantity === 0
          ? 0
          : undefined
        : valuePosition(quantity, security.averageCost))
    const executed = state.orders
      .filter((order) => order.securityId === security.id && order.status === 'Eseguito' && order.id.startsWith('MF'))
      .slice()
      .reverse()
    for (const order of executed) {
      const units = order.action === 'Sottoscrizione' ? order.quantity / 100 : order.quantity
      if (order.action === 'Vendita' || order.action === 'Aumento di capitale') {
        const removed = Math.min(units, quantity)
        if (costCents !== undefined) costCents -= quantity ? Math.round((costCents * removed) / quantity) : 0
        else if (removed === quantity) costCents = 0
        quantity -= removed
      } else {
        quantity += units
        if (costCents !== undefined) costCents += valuePosition(order.quantity, order.price)
      }
    }
    const valueCents = valuePosition(quantity, security.price)
    return {
      ...security,
      quantity,
      costCents,
      valueCents,
      profitCents: costCents === undefined ? undefined : valueCents - costCents,
      averageCost: costCents === undefined ? undefined : quantity ? costCents / 100 / quantity : 0,
    }
  })
}
export function getFundPositions(
  orders: readonly FundsStoredOrder[] = readFundsState()?.orders ?? [],
): InvestmentFund[] {
  const positions = availableInvestmentFunds.map((fund) => ({
    ...fund,
    costCents: valuePosition(fund.shares, fund.pmc),
  }))
  for (const order of orders
    .filter((item) => item.status === 'Eseguito' && item.id.startsWith('MF'))
    .slice()
    .reverse()) {
    const source = positions.find((fund) => fund.id === order.fund || fund.name === order.fund)
    if (!source || order.shares <= 0) continue
    if (/Rimborso|Switch fondo/.test(order.action)) {
      const removed = Math.min(source.shares, order.shares)
      source.costCents -= source.shares ? Math.round((source.costCents * removed) / source.shares) : 0
      source.shares -= removed
    } else {
      source.shares += order.shares
      source.costCents += Math.round(order.amount * 100)
    }
    const target = positions.find((fund) => fund.id === order.targetFund)
    if (target && order.targetShares) {
      target.shares += order.targetShares
      target.costCents += Math.round(order.amount * 100)
    }
  }
  return positions.map(({ costCents, ...fund }) => {
    const value = valuePosition(fund.shares, fund.nav) / 100
    const profit = (Math.round(value * 100) - costCents) / 100
    return {
      ...fund,
      value,
      pmc: fund.shares ? costCents / 100 / fund.shares : 0,
      profit,
      percent: costCents
        ? `${profit >= 0 ? '+' : ''} ${((profit * 10000) / costCents).toFixed(2).replace('.', ',')}%`
        : 'N.D.',
    }
  })
}
export const insuranceLines = [
  {
    id: 'separate',
    name: 'UniCredit Multigest (gestione separata)',
    contributedCents: 2750000,
    shares: 125,
    quote: 217.2,
  },
  { id: 'stars', name: 'CreditRasF Inflazione Stars', contributedCents: 2750000, shares: 125, quote: 215.48688 },
] as const
export const investmentServicePositions = [
  { id: 'certificate-1', label: 'MoneyBoxCd', category: 'savings', valueCents: 500000 },
  { id: 'certificate-2', label: 'MoneyBoxCd', category: 'savings', valueCents: 500000 },
  { id: 'flexy-1', label: 'MoneyPlus', category: 'savings', valueCents: 56000000 },
  { id: 'flexy-2', label: 'MoneyPlus', category: 'savings', valueCents: 56000000 },
  {
    id: 'insurance',
    label: 'Prodotti assicurativi',
    category: 'insurance',
    valueCents: insuranceLines.reduce((sum, line) => sum + valuePosition(line.shares, line.quote), 0),
  },
  { id: 'managed', label: 'Gestione di portafogli', category: 'managed', valueCents: 400000000 },
  { id: 'pension', label: 'Fondi pensione', category: 'pension', valueCents: 600000000 },
] as const
const labels = {
  securities: 'Titoli',
  funds: 'Fondi',
  savings: 'Prodotti di risparmio',
  insurance: 'Prodotti assicurativi',
  managed: 'Gestione di portafogli',
  pension: 'Fondi pensione',
} as const
export function getItalyInvestmentWealth(): readonly {
  id: string
  label: string
  category: string
  valueCents: number
}[] {
  const servicePositions = [...investmentServicePositions, ...readSavingsSubscriptions()]
  return Object.entries(labels).map(([category, label]) => ({
    id: category,
    label,
    category,
    valueCents:
      category === 'securities'
        ? getSecurityPositions().reduce((sum, p) => sum + p.valueCents, 0)
        : category === 'funds'
          ? getFundPositions().reduce((sum, p) => sum + Math.round(p.value * 100), 0)
          : servicePositions.filter((p) => p.category === category).reduce((sum, p) => sum + p.valueCents, 0),
  }))
}
export function getInvestmentOverview(variant: InvestmentOverviewVariant) {
  const wealth = ['zero', 'no-deposit', 'loading'].includes(variant)
    ? []
    : getItalyInvestmentWealth().slice(0, variant === 'single' ? 1 : variant === 'edge' ? 4 : undefined)
  const allocations = allocateValues(wealth.map((p) => ({ ...p, name: p.label })))
  const totalCents = allocations.reduce((sum, p) => sum + p.valueCents, 0)
  const esgCents =
    variant === 'no-esg'
      ? 0
      : getSecurityPositions()
          .filter((p) => p.esg)
          .reduce((sum, p) => sum + p.valueCents, 0)
  const esgAllocations = allocateValues(
    allocations.map((p) => ({ ...p, valueCents: p.category === 'securities' ? Math.min(p.valueCents, esgCents) : 0 })),
  )
  return { allocations, totalCents, esgCents: esgAllocations.reduce((sum, p) => sum + p.valueCents, 0), esgAllocations }
}
type SavingsSubscription = { id: string; label: string; category: string; valueCents: number }
let savingsSession: SavingsSubscription[] | undefined
export function readSavingsSubscriptions(): SavingsSubscription[] {
  if (savingsSession) return savingsSession
  try {
    const saved: unknown = JSON.parse(
      typeof localStorage === 'undefined' ? '[]' : (localStorage.getItem('mf-it-savings-positions-v1') ?? '[]'),
    )
    return Array.isArray(saved) && saved.length
      ? saved.filter(
          (p): p is SavingsSubscription =>
            !!p &&
            typeof p.id === 'string' &&
            p.category === 'savings' &&
            Number.isSafeInteger(p.valueCents) &&
            p.valueCents > 0,
        )
      : (savingsSession ?? [])
  } catch {
    return savingsSession ?? []
  }
}
export function saveSavingsSubscriptions(positions: SavingsSubscription[]) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mf-it-savings-positions-v1', JSON.stringify(positions))
      savingsSession = undefined
      return
    }
  } catch {
    /* Preserve funded positions during the current session. */
  }
  savingsSession = positions
}
