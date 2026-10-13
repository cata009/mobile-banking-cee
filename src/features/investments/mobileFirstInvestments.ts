/** Portfolio holdings determine whether the source's POG chart is available. */
export function hasMobileFirstInvestmentHoldings(investmentCount: number): boolean {
  return Number.isFinite(investmentCount) && investmentCount > 0
}

export type InvestmentOverviewVariant =
  'full' | 'single' | 'edge' | 'zero' | 'no-esg' | 'no-deposit' | 'mifid' | 'consultation' | 'loading'

export function resolveInvestmentOverviewVariant(
  count: number,
  requested?: InvestmentOverviewVariant,
): InvestmentOverviewVariant {
  return requested ?? (hasMobileFirstInvestmentHoldings(count) ? 'full' : 'zero')
}
