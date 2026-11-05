import { describe, expect, it } from 'vitest'
import { mockProducts } from '@/data/products'
import { buildInvestmentSecurities, buildInvestmentSecurityCatalog } from '@/app/config/investmentsPortfolioConfig'
import {
  buildFutureHistory,
  DEFAULT_FUTURE_PROFILE,
  futurePerformance,
  futureRecommendations,
  isFutureInvestmentRelease,
  selectFuturePeriod,
} from '@/features/investments/future-overview/model'
import {
  readFutureProfile,
  saveFutureProfile,
  subscribeFutureProfile,
} from '@/features/investments/future-overview/session'

describe('Future Investments financial invariants', () => {
  const securities = buildInvestmentSecurities(
    mockProducts.filter((p) => p.type === 'investment_account'),
    'CZ',
  )
  const history = buildFutureHistory(securities)
  it('reconciles the selected portfolio without counting recurring holdings twice', () => {
    expect(buildFutureHistory([...securities, ...securities])).toEqual(history)
    expect(history.at(-1)!.value).toBeCloseTo(
      securities.reduce((sum, s) => sum + s.localValue, 0),
      2,
    )
    expect(futurePerformance(history).amount).toBeCloseTo(
      securities.reduce((sum, s) => sum + s.performanceAmount, 0),
      2,
    )
    expect(history.some((p) => p.externalFlow < 0)).toBe(true)
    expect(buildFutureHistory([])).toEqual([])
  })
  it('changes the window without resetting the opening invested balance', () => {
    for (const period of ['1m', '3m', '1y', '3y', 'max'] as const) {
      const selected = selectFuturePeriod(history, period)
      expect(selected.at(-1)).toEqual(history.at(-1))
      expect(selected[0]!.netInvested).toBeGreaterThan(0)
      expect(Number.isFinite(futurePerformance(selected).percent)).toBe(true)
    }
    expect(selectFuturePeriod([], '1m')).toEqual([])
  })
  it('reports losses and keeps zero-capital percentages undefined', () => {
    expect(
      futurePerformance([
        { date: '2026-01-01', value: 100, netInvested: 100, externalFlow: 100 },
        { date: '2026-01-02', value: 90, netInvested: 100, externalFlow: 0 },
      ]).amount,
    ).toBe(-10)
    expect(
      futurePerformance([
        { date: '2026-01-01', value: 0, netInvested: 0, externalFlow: 0 },
        { date: '2026-01-02', value: 100, netInvested: 100, externalFlow: 100 },
      ]).percent,
    ).toBeNull()
    expect(futurePerformance([])).toEqual({ amount: 0, percent: null })
  })
  it('excludes expired profiles, unknown risk, incompatible target markets and short horizons', () => {
    const catalog = buildInvestmentSecurityCatalog(securities, 'CZ')
    const compatible = futureRecommendations(catalog, DEFAULT_FUTURE_PROFILE)
    expect(compatible.length).toBeGreaterThan(0)
    expect(compatible.every((p) => p.riskLevel !== 'High' && p.productType !== 'Stock')).toBe(true)
    expect(futureRecommendations(catalog, { ...DEFAULT_FUTURE_PROFILE, validUntil: '2020-01-01' })).toEqual([])
    expect(futureRecommendations(catalog, { ...DEFAULT_FUTURE_PROFILE, understandsLoss: false })).toEqual([])
    expect(futureRecommendations(catalog, { ...DEFAULT_FUTURE_PROFILE, horizon: 0 })).toEqual([])
    expect(
      futureRecommendations(
        catalog.map((p) => ({ ...p, riskLevel: undefined })),
        DEFAULT_FUTURE_PROFILE,
      ),
    ).toEqual([])
    expect(futureRecommendations(catalog, { ...DEFAULT_FUTURE_PROFILE, productTypes: [] })).toEqual([])
  })
  it('invalidates subscribers when the profile changes', () => {
    let changes = 0
    const before = readFutureProfile()
    const unsubscribe = subscribeFutureProfile(() => {
      changes++
    })
    saveFutureProfile({ ...before, risk: 1 })
    expect(readFutureProfile().version).toBe(before.version + 1)
    expect(changes).toBe(1)
    unsubscribe()
    saveFutureProfile(before)
    expect(changes).toBe(1)
  })
  it('limits the experience to all three Czech Future releases', () => {
    for (const release of ['release-future-evo-2027', 'release-future-cz-robo', 'release-future-cz-coapping'])
      expect(isFutureInvestmentRelease('CZ', release)).toBe(true)
    expect(isFutureInvestmentRelease('CZ', 'release-current')).toBe(false)
    expect(isFutureInvestmentRelease('SK', 'release-future-evo-2027')).toBe(false)
  })
})
