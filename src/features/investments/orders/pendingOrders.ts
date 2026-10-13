import type { InvestmentCatalogSecurity } from '@/app/config/investmentsPortfolioConfig'

export type PendingOrder = {
  id: string
  type: 'BUY' | 'SELL' | 'REGULAR INVESTMENT'
  amount: number
  positive?: boolean
  security: InvestmentCatalogSecurity
}

export function buildPendingInvestmentOrders(catalog: readonly InvestmentCatalogSecurity[]) {
  const usable = catalog.length ? catalog : []

  const pick = (index: number) => usable[index % usable.length]
  const advisory = usable.length
    ? [
        { id: 'advisory-buy', type: 'BUY' as const, amount: 5000, positive: true, security: pick(0)! },
        { id: 'advisory-sell', type: 'SELL' as const, amount: -5000, security: pick(1)! },
        {
          id: 'advisory-regular',
          type: 'REGULAR INVESTMENT' as const,
          amount: 5000,
          positive: true,
          security: pick(2)!,
        },
      ]
    : []
  const nonAdvisory = usable.length
    ? [
        { id: 'non-advisory-buy', type: 'BUY' as const, amount: 3500, positive: true, security: pick(3)! },
        { id: 'non-advisory-sell', type: 'SELL' as const, amount: -1550, security: pick(4)! },
      ]
    : []
  return { advisory, nonAdvisory }
}
export function getPendingOrderQuantity(order: PendingOrder): number {
  return Math.max(1, Math.round(Math.abs(order.amount) / order.security.marketPrice))
}
