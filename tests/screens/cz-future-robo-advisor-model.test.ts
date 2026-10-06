import { describe, expect, it } from 'vitest'
import {
  ROBO_PORTFOLIO_PRESENTATIONS,
  ROBO_STRATEGIES,
  buildRoboReviewRows,
  formatCzkGoalAmount,
  formatCzkInteger,
  formatCzkInput,
  formatCzkReturnLabel,
  getFundingFieldVisibility,
  isInvestorProfileBlocking,
} from '@/app/screens/investments/czFutureRoboAdvisorModel'
import { buildInvestmentSecurityCatalog } from '@/app/config/investmentsPortfolioConfig'

describe('CZ Future Robo Advisor model', () => {
  it('formats goal currency amounts with dot grouping and two decimals', () => {
    expect(formatCzkInput('100000')).toBe('100.000,00 CZK')
    expect(formatCzkInput('1234567')).toBe('1.234.567,00 CZK')
    expect(formatCzkGoalAmount('51 241', ',33 CZK')).toBe('51.241,33 CZK')
    expect(formatCzkInteger('100 000')).toBe('100.000')
    expect(formatCzkReturnLabel('+1 100,00 CZK (+1,36%)')).toBe('+1.100,00 CZK (+1,36%)')
  })

  it('blocks only missing or expired investor profiles', () => {
    expect(isInvestorProfileBlocking('valid')).toBe(false)
    expect(isInvestorProfileBlocking('expired')).toBe(true)
    expect(isInvestorProfileBlocking('missing')).toBe(true)
  })

  it.each([
    ['one-off', true, false, false],
    ['regular', false, true, true],
    ['combined', true, true, true],
  ] as const)('maps %s to the unified funding fields', (method, initial, monthly, startDate) => {
    expect(getFundingFieldVisibility(method)).toEqual({
      initialAmount: initial,
      monthlyContribution: monthly,
      startDate,
      cashAccount: true,
    })
  })

  it('keeps distinct Sustainable, Core and defensive strategies', () => {
    expect(ROBO_STRATEGIES).toHaveLength(3)
    expect(ROBO_STRATEGIES.map((strategy) => strategy.id)).toEqual([
      'sustainable-balanced',
      'balanced-core',
      'steady-income',
    ])
    expect(new Set(ROBO_STRATEGIES.map((strategy) => strategy.description)).size).toBe(3)
  })

  it('resolves every Robo holding through the shared investment security catalogue', () => {
    const securityCatalog = buildInvestmentSecurityCatalog([], 'CZ', { includeRoboGoals: true })
    const securitiesById = new Map(securityCatalog.map((security) => [security.id, security]))
    const products = Object.values(ROBO_PORTFOLIO_PRESENTATIONS)
      .flatMap((presentation) => presentation.assetGroups)
      .flatMap((group) => group.products)

    expect(products.length).toBeGreaterThan(0)
    for (const product of products) {
      expect(product.securityId).toBeTruthy()
      expect(securitiesById.get(product.securityId)).toEqual(
        expect.objectContaining({
          id: product.securityId,
          title: product.name,
          owned: false,
        }),
      )
    }
  })

  it('keeps Robo demo holdings out of other investment catalogues by default', () => {
    expect(buildInvestmentSecurityCatalog([], 'CZ').some((security) => security.id.startsWith('robo-'))).toBe(false)
  })

  it('builds conditional review rows without invented order or cost data', () => {
    const regularRows = buildRoboReviewRows({
      goalType: 'Build wealth',
      goalName: 'New car',
      targetAmount: '100000',
      horizonYears: 10,
      fundingMethod: 'regular',
      initialAmount: '',
      monthlyContribution: '2000',
      startDate: '1 March 2026',
      cashAccountLabel: 'Current ··· 4821',
      investorProfileLabel: 'Moderate',
      portfolioName: 'Sustainable Balanced',
    })

    expect(regularRows.map((row) => row.label)).toEqual([
      'Goal type',
      'Goal name',
      'Target amount',
      'Portfolio',
      'Invest monthly',
      'Monthly contribution starts',
      'Time horizon',
      'Cash account',
      'Investor profile',
    ])
    expect(regularRows.some((row) => /orders created/i.test(row.label))).toBe(false)
    expect(regularRows.some((row) => /cost/i.test(row.label))).toBe(false)
  })
})
