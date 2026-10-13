import { investmentFunds } from '@/features/investments/mobileFirstFunds'
import { allocateValues } from '@/features/investments/mobileFirstValuation'
export { investmentFunds, type InvestmentFund } from '@/features/investments/mobileFirstFunds'
export { fundsCatalogSections } from '@/features/investments/mobileFirstFunds'
export const fundsAllocation = allocateValues(
  Array.from(new Set(investmentFunds.map((fund) => fund.type)), (name) => ({
    name,
    id: investmentFunds.find((fund) => fund.type === name)!.id,
    valueCents: investmentFunds
      .filter((fund) => fund.type === name)
      .reduce((sum, fund) => sum + Math.round(fund.value * 100), 0),
  })),
).map((item) => ({ ...item, value: item.valueCents / 100 }))
export interface FundOrder {
  id: string
  fund: string
  action: string
  amount: number
  shares: number
  date: string
  status: 'Caricato' | 'Inviato' | 'Eseguito' | 'Annullato'
  targetFund?: string
  feeCents?: number
  targetShares?: number
}
export const initialFundOrders: [FundOrder, ...FundOrder[]] = [
  {
    id: '91198960',
    fund: 'Pioneer SF - Equity Plan 60',
    action: 'Rimborso',
    amount: Math.round(3 * 569.37 * 100) / 100,
    shares: 3,
    date: '2025-01-10',
    status: 'Caricato',
  },
  {
    id: '91198961',
    fund: 'Pioneer SF - Equity Plan 60',
    action: 'Sottoscrizione',
    amount: 1200,
    shares: 1200 / 569.37,
    date: '2025-02-12',
    status: 'Eseguito',
  },
]
