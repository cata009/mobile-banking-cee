import type { InvestmentSecurity } from '@/app/config/investmentsPortfolioConfig'

export interface InvestmentSecurityAccountOption {
  id: string
  name: string
  currency: string
}

/** Baseline portfolio choice projection, preserving Source active-account order and last values. */
export function buildInvestmentSecurityAccountOptions(
  securities: readonly InvestmentSecurity[],
): InvestmentSecurityAccountOption[] {
  const options = new Map<string, InvestmentSecurityAccountOption>()
  for (const security of securities) {
    if (security.status !== 'active') continue
    options.set(security.securityAccountId, {
      id: security.securityAccountId,
      name: security.securityAccountName,
      currency: security.securityAccountCurrency,
    })
  }
  return [...options.values()]
}
