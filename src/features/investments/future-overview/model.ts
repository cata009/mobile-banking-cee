import {
  buildInvestmentChartPoints,
  type InvestmentCatalogSecurity,
  type InvestmentSecurity,
} from '@/app/config/investmentsPortfolioConfig'

export const FUTURE_PERIODS = ['1m', '3m', '1y', '3y', 'max'] as const
export type FuturePeriod = (typeof FUTURE_PERIODS)[number]
export const DEMO_AS_OF = '2026-11-05'
const DAY = 86_400_000
const money = (n: number) => Math.round(n * 100) / 100
export interface PortfolioPoint {
  date: string
  value: number
  netInvested: number
  /** External contribution at the end of this day; internal trades are not flows. */
  externalFlow: number
}

/** Synthetic daily history reconciled with every eligible holding, once per security ID. */
export function buildFutureHistory(securities: readonly InvestmentSecurity[]): PortfolioPoint[] {
  const holdings = [
    ...new Map(securities.filter((s) => s.status === 'active' && s.localValue > 0).map((s) => [s.id, s])).values(),
  ]
  const value = holdings.reduce((sum, s) => sum + s.localValue, 0)
  const gain = holdings.reduce((sum, s) => sum + s.performanceAmount, 0)
  if (!value) return []
  const net = value - gain
  const start = Date.UTC(2021, 5, 4),
    end = Date.parse(DEMO_AS_OF)
  const count = Math.round((end - start) / DAY)
  const anchors = buildInvestmentChartPoints(value, 'max').map((p) => p.value)
  const initial = anchors[0]!
  const events = Array.from({ length: count + 1 }, (_, i) =>
    i === 0 ? 0 : i % 240 === 0 ? -0.4 : i % 30 === 0 ? 1 : 0,
  )
  const weight = events.reduce<number>((sum, v) => sum + v, 0)
  let invested = initial
  return events.map((event, i) => {
    const flow = i === 0 ? invested : ((net - initial) * event) / weight
    if (i) invested += flow
    const t = i / count
    const location = t * (anchors.length - 1)
    const before = Math.min(anchors.length - 2, Math.floor(location))
    const fraction = location - before
    const smooth = fraction * fraction * (3 - 2 * fraction)
    const referenceValue = anchors[before]! + (anchors[before + 1]! - anchors[before]!) * smooth
    const pnl = referenceValue - (initial + (net - initial) * t)
    return {
      date: new Date(start + i * DAY).toISOString().slice(0, 10),
      value: money(invested + pnl),
      netInvested: money(invested),
      externalFlow: money(flow),
    }
  })
}

export function selectFuturePeriod(points: readonly PortfolioPoint[], period: FuturePeriod): PortfolioPoint[] {
  const last = points.at(-1)
  if (!last || period === 'max') return [...points]
  const date = new Date(last.date)
  const months = { '1m': 1, '3m': 3, '1y': 12, '3y': 36 }[period]
  date.setUTCMonth(date.getUTCMonth() - months)
  const index = points.findIndex((p) => Date.parse(p.date) >= date.getTime())
  return points.slice(Math.max(0, index))
}

/** Daily time-weighted return: end-of-day external flows are removed before compounding. */
export function futurePerformance(points: readonly PortfolioPoint[]) {
  if (!points.length) return { amount: 0, percent: null as number | null }
  const first = points[0]!,
    last = points.at(-1)!
  const amount = money(last.value - first.value - (last.netInvested - first.netInvested))
  let factor = 1,
    valid = true
  for (let i = 1; i < points.length; i++) {
    const previous = points[i - 1]!,
      current = points[i]!
    if (previous.value <= 0) {
      valid = false
      break
    }
    // Use the reconciled change in net invested, avoiding rounded-flow drift.
    factor *= (current.value - (current.netInvested - previous.netInvested)) / previous.value
  }
  return { amount, percent: valid && first.value > 0 ? (factor - 1) * 100 : null }
}

export interface FutureInvestmentProfile {
  version: number
  validUntil: string
  risk: 1 | 2 | 3
  horizon: number
  understandsLoss: boolean
  productTypes: readonly InvestmentSecurity['productType'][]
}
export const DEFAULT_FUTURE_PROFILE: FutureInvestmentProfile = {
  version: 1,
  validUntil: '2027-11-05',
  risk: 2,
  horizon: 5,
  understandsLoss: true,
  productTypes: ['Fund', 'Bond'],
}
export function profileIsValid(profile: FutureInvestmentProfile, asOf = DEMO_AS_OF) {
  return profile.validUntil >= asOf && profile.horizon >= 1
}
export function futureRecommendations(
  catalog: readonly InvestmentCatalogSecurity[],
  profile: FutureInvestmentProfile,
  asOf = DEMO_AS_OF,
) {
  if (!profileIsValid(profile, asOf) || !profile.understandsLoss) return []
  const levels = { Low: 1, Medium: 2, High: 3 }
  return catalog
    .filter(
      (s) =>
        s.status === 'active' &&
        !!s.riskLevel &&
        levels[s.riskLevel] <= profile.risk &&
        profile.productTypes.includes(s.productType) &&
        profile.horizon >= (s.riskLevel === 'High' ? 5 : s.riskLevel === 'Medium' ? 3 : 1),
    )
    .sort((a, b) => levels[b.riskLevel!] - levels[a.riskLevel!] || a.id.localeCompare(b.id))
    .slice(0, 3)
}

export function isFutureInvestmentRelease(country: string, release: string) {
  return (
    country === 'CZ' &&
    ['release-future-evo-2027', 'release-future-cz-robo', 'release-future-cz-coapping'].includes(release)
  )
}
