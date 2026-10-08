import { describe, expect, it } from 'vitest'
import { buildRoboGoalChartHistory } from '@/features/investments/robo/goalChartHistory'
import { INITIAL_CZ_ROBO_GOALS } from '@/features/investments/robo/goalFixtures'

const reference = new Date('2026-10-08T12:00:00Z')
const soldGoal = INITIAL_CZ_ROBO_GOALS[4]!

describe('Executed Robo goal chart history', () => {
  it('shows the complete purchase ledger and fully executed sales ending at current zero', () => {
    const points = buildRoboGoalChartHistory(soldGoal, 'max', reference)!
    expect(points.map((point) => point.value)).toEqual([20000, 12000, 0, 0])
    expect(points.map((point) => point.label)).toEqual(['12 Jun 2026', '18 Sep 2026', '25 Sep 2026', '08 Oct 2026'])
    expect(points.every((point) => Number.isFinite(point.value))).toBe(true)
  })

  it('carries the actual opening ledger balance into the selected month without old labels', () => {
    const points = buildRoboGoalChartHistory(soldGoal, '1m', reference)!
    expect(points.map((point) => point.value)).toEqual([20000, 12000, 0, 0])
    expect(points[0]!.label).toBe('08 Sep 2026')
    expect(points.at(-1)!.label).toBe('08 Oct 2026')
    expect(points.some((point) => point.label.includes('Jun'))).toBe(false)
  })

  it('stays flat when the selected period begins after all sales', () => {
    const points = buildRoboGoalChartHistory(soldGoal, '1m', new Date('2026-12-08T12:00:00Z'))!
    expect(points.map((point) => point.value)).toEqual([0, 0])
    expect(points[0]!.label).toBe('08 Nov 2026')
  })

  it('does not infer holdings from pending orders or fabricate history for fresh zero goals', () => {
    const fresh = { ...soldGoal, transactions: [], orders: [] }
    expect(buildRoboGoalChartHistory(fresh, '3y', reference)).toBeNull()
    expect(
      buildRoboGoalChartHistory(
        {
          ...fresh,
          orders: soldGoal.orders!.map((order) => ({ ...order, status: 'PENDING' as const })),
        },
        '3y',
        reference,
      ),
    ).toBeNull()
    expect(buildRoboGoalChartHistory(undefined, '3y', reference)).toBeNull()
    expect(buildRoboGoalChartHistory(INITIAL_CZ_ROBO_GOALS[0], '3y', reference)).toBeNull()
  })

  it('rejects incomplete or invalid trade evidence instead of inventing a positive past', () => {
    for (const transactions of [
      soldGoal.transactions!.filter((trade) => trade.type === 'SELL'),
      soldGoal.transactions!.map((trade) => ({ ...trade, quantity: undefined })),
      soldGoal.transactions!.map((trade) => ({ ...trade, amount: Number.NaN })),
      soldGoal.transactions!.map((trade) => ({ ...trade, date: 'invalid' })),
    ]) {
      expect(buildRoboGoalChartHistory({ ...soldGoal, transactions }, 'max', reference)).toBeNull()
    }
  })

  it('uses sold units to remove historical investment cost even if proceeds differ', () => {
    const transactions = soldGoal.transactions!.map((trade) =>
      trade.type === 'SELL' ? { ...trade, amount: trade.amount * 1.1 } : trade,
    )
    expect(
      buildRoboGoalChartHistory({ ...soldGoal, transactions }, 'max', reference)!.map((point) => point.value),
    ).toEqual([20000, 12000, 0, 0])
  })

  it('clamps month-end period boundaries and rejects future or unmatched execution evidence', () => {
    expect(buildRoboGoalChartHistory(soldGoal, '1m', new Date('2026-10-31T12:00:00Z'))![0]!.label).toBe('30 Sep 2026')
    expect(buildRoboGoalChartHistory(soldGoal, 'max', new Date('2026-05-08T12:00:00Z'))).toBeNull()
    expect(buildRoboGoalChartHistory(soldGoal, 'max', new Date('invalid'))).toBeNull()
    const transactions = soldGoal.transactions!.map((trade) =>
      trade.type === 'SELL' ? { ...trade, quantity: trade.quantity! + 1 } : trade,
    )
    expect(buildRoboGoalChartHistory({ ...soldGoal, transactions }, 'max', reference)).toBeNull()
  })
})
