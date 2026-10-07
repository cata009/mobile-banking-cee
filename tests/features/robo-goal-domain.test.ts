import { describe, expect, it } from 'vitest'
import { buildInvestmentSecurityCatalog } from '@/app/config/investmentsPortfolioConfig'
import { INITIAL_CZ_ROBO_GOALS } from '@/features/investments/robo/goalFixtures'
import { buildInitialRoboGoal, getRoboGoalCurrentValue } from '@/features/investments/robo/goalModel'
import { hydrateRoboGoal } from '@/features/investments/robo/goalHydration'
import { applyRoboTopUp, applyRoboSale } from '@/features/investments/robo/goalActions'
import { getRoboPortfolioForGoal, ROBO_STRATEGIES } from '@/features/investments/robo/model'
import {
  buildRoboProjection,
  calculateProjectedValue,
  projectionPath,
} from '@/features/investments/robo/projectionSelectors'
import {
  buildRoboCreationReviewRows,
  canReviewRoboTopUp,
  getRoboDetailFlags,
} from '@/features/investments/robo/flowSelectors'
import { isValidRoboHorizon } from '@/features/investments/robo/validation'

const seed = INITIAL_CZ_ROBO_GOALS[0]!
const portfolio = getRoboPortfolioForGoal(seed)!
const basket = portfolio.basketFund!
const catalog = buildInvestmentSecurityCatalog([], 'CZ', { includeRoboGoals: true })
const operation = { id: 'test-trade', date: '2026-10-07T12:00:00.000Z' }

describe('Robo goal policies and extraction fixtures', () => {
  it('creates an empty basket goal and retains zero units without opening activity', () => {
    const goal = buildInitialRoboGoal(portfolio, seed, 0, 'CZ', catalog, { date: operation.date })
    expect(getRoboGoalCurrentValue(goal)).toBe(0)
    expect(goal.positions).toEqual([])
    expect(goal.orders).toEqual([])
    expect(goal.transactions).toEqual([])
    expect(hydrateRoboGoal(goal, basket, 'CZ', catalog)).toBe(goal)
  })

  it('reconciles opening purchases and executed historical sales once', () => {
    const goal = hydrateRoboGoal(seed, basket, 'CZ', catalog)
    expect(goal.positions!.find((position) => position.title === 'Nano-Chip Equity Fund')!.quantity).toBe(11.659775)
    expect(getRoboGoalCurrentValue(goal)).toBe(92312.77)
    expect(goal.orders!.filter((order) => order.orderType === 'SELL')).toHaveLength(2)
    expect(goal.orders!.filter((order) => order.orderType === 'BUY' && order.status === 'EXECUTED')).toHaveLength(
      goal.positions!.length,
    )
    expect(hydrateRoboGoal(goal, basket, 'CZ', catalog)).toBe(goal)
  })

  it('submits pending buy orders without increasing holdings or goal value', () => {
    const goal = hydrateRoboGoal(seed, basket, 'CZ', catalog)
    const next = applyRoboTopUp(
      goal,
      portfolio,
      {
        method: 'combined',
        initialAmount: 10000,
        monthlyAmount: 2000,
        startDate: '1 November 2026',
        cashAccountId: 'cash-cz',
      },
      'CZ',
      catalog,
      operation,
    )
    expect(next.positions).toEqual(goal.positions)
    expect(next.currentInteger).toBe(goal.currentInteger)
    expect(next.currentDecimals).toBe(goal.currentDecimals)
    expect(next.transactions).toEqual(goal.transactions)
    const pending = next.orders!.filter((order) => order.status === 'PENDING')
    expect(pending.reduce((total, order) => total + order.amount, 0)).toBe(10000)
    expect(
      pending.every(
        (order) => order.orderType === 'BUY' && order.cashAccountId === 'cash-cz' && order.date === operation.date,
      ),
    ).toBe(true)
    expect(next.recurringContribution).toEqual({ amount: 2000, startDate: '1 November 2026', cashAccountId: 'cash-cz' })
    const once = applyRoboTopUp(
      next,
      portfolio,
      { method: 'one-off', initialAmount: 5000, monthlyAmount: 0, startDate: '', cashAccountId: 'cash-cz' },
      'CZ',
      catalog,
      { ...operation, id: 'once' },
    )
    expect(once.recurringContribution).toBe(next.recurringContribution)
  })

  it('caps executed sales to held units and records both transaction and executed order', () => {
    const goal = hydrateRoboGoal(seed, basket, 'CZ', catalog)
    const position = goal.positions![0]!
    const next = applyRoboSale(
      goal,
      portfolio,
      getRoboGoalCurrentValue(goal),
      'CZ',
      catalog,
      position.id,
      { quantity: position.quantity + 100, amount: position.localValue },
      operation,
    )
    const remaining = next.positions![0]!
    expect(remaining.quantity).toBe(0)
    expect(remaining.localValue).toBe(0)
    expect(remaining.investedValue).toBe(0)
    expect(next.transactions!.at(-1)).toMatchObject({ type: 'SELL', quantity: position.quantity, date: operation.date })
    expect(next.orders!.at(-1)).toMatchObject({ orderType: 'SELL', status: 'EXECUTED', quantity: position.quantity })
    expect(
      applyRoboSale(
        goal,
        portfolio,
        getRoboGoalCurrentValue(goal),
        'CZ',
        catalog,
        'stale',
        { quantity: 2, amount: 10 },
        operation,
      ),
    ).toBe(goal)
  })

  it('preserves projection scenarios, zero-year minimum month and path geometry', () => {
    expect(calculateProjectedValue(50000, 2000, 0, 0)).toBe(52000)
    const projection = buildRoboProjection(ROBO_STRATEGIES[0]!)
    expect(projection.values).toEqual([307556, 373669, 432415])
    expect(projection.tickYears).toEqual([2025, 2027, 2029, 2031, 2033, 2035])
    expect(projectionPath([0, 50000], 100000)).toBe('M 54 168 C 112 166, 184 139.88, 244 94')
  })

  it('validates top-up method requirements against the captured civil clock', () => {
    const clock = { referenceDay: { year: 2028, month: 2, day: 29 } }
    expect(canReviewRoboTopUp('regular', 0, 1000, '29 February 2028', true, clock)).toBe(true)
    expect(canReviewRoboTopUp('regular', 0, 1000, '28 February 2028', true, clock)).toBe(false)
    expect(canReviewRoboTopUp('combined', 0, 1000, '29 February 2028', true, clock)).toBe(false)
    expect(canReviewRoboTopUp('one-off', 1000, 0, '', false, clock)).toBe(false)
    expect(canReviewRoboTopUp('one-off', 1000, 0, '', true, clock)).toBe(true)
    for (const invalid of ['', '2', '16', '3.5', 'NaN']) expect(isValidRoboHorizon(invalid)).toBe(false)
    for (const valid of ['3', '10', '15']) expect(isValidRoboHorizon(valid)).toBe(true)
    expect(buildRoboCreationReviewRows('Wealth', 'Home', '250000', 'Basket', 10).map((row) => row.label)).toEqual([
      'Goal type',
      'Goal name',
      'Target amount',
      'Portfolio',
      'Time horizon',
      'Investor profile',
    ])
    expect(getRoboDetailFlags(0, { ...seed, positions: [], orders: [], transactions: [] })).toEqual({
      isEmptyGoal: true,
      hasPendingBuyOrders: false,
      hasRecurringPlan: false,
      hasSellHistory: false,
    })
  })
})
