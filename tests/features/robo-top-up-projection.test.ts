import { describe, expect, it } from 'vitest'
import { DEFAULT_ROBO_DEMO_CLOCK } from '@/features/investments/robo/demoClock'
import { INITIAL_CZ_ROBO_GOALS } from '@/features/investments/robo/goalFixtures'
import {
  buildRoboTopUpProjection,
  canStartRoboTopUpProjection,
  getRoboTopUpBalanceCheck,
  validateRoboTopUpAmount,
} from '@/features/investments/robo/topUpProjection'

const clock = DEFAULT_ROBO_DEMO_CLOCK
const draft = { method: 'combined', initial: 75_000, monthly: 1_000, date: '1 April 2026' } as const
const account = { id: 'A', balance: 75_000, currency: 'CZK' }
const goal = {
  ...INITIAL_CZ_ROBO_GOALS[0]!,
  positions: undefined,
  currentInteger: '180000',
  currentDecimals: '00',
  horizonYears: 5,
  endDate: '1 March 2031',
  recurringContribution: { amount: 500, startDate: '1 April 2026' },
}
const unfunded = { ...goal, positions: [], recurringContribution: undefined, orders: [], transactions: [] }

describe('CZ Add Money projection and immediate debit', () => {
  it('compares cumulative cash and estimated gains at the same exact anniversaries', () => {
    const forecast = buildRoboTopUpProjection(goal, draft, clock)
    expect(forecast.periods).toHaveLength(6)
    expect(forecast.periods[0]).toMatchObject({
      capital: 255_000,
      positive: 255_000,
      neutral: 255_000,
      negative: 255_000,
    })
    const final = forecast.periods[5]!
    expect(final.capital).toBe(315_000)
    expect(final.positive).toBeGreaterThan(final.neutral)
    expect(final.neutral).toBeGreaterThan(final.capital)
    expect(final.negative).toBeLessThan(final.capital)
    expect(forecast.curve.at(-1)).toMatchObject({
      positive: final.positive,
      neutral: final.neutral,
      negative: final.negative,
    })
  })

  it('starts a new goal at zero and distinguishes the replacement monthly plan', () => {
    const forecast = buildRoboTopUpProjection(unfunded, { ...draft, method: 'regular' }, clock)
    expect(forecast.opening).toBe(0)
    expect(forecast.periods[0]).toMatchObject({ capital: 0, positive: 0, neutral: 0, negative: 0 })
    expect(forecast.periods.at(-1)!.capital).toBe(60_000)
    const reduced = buildRoboTopUpProjection(unfunded, { ...draft, method: 'regular', monthly: 250 }, clock)
    expect(reduced.periods.at(-1)!.neutral).toBeLessThan(forecast.periods.at(-1)!.neutral)
  })

  it('uses the effective monthly rate and includes the payment due at the selected month', () => {
    const forecast = buildRoboTopUpProjection(unfunded, { ...draft, initial: 100_000, monthly: 10_000 }, clock)
    // The workbook's 5.55% annual effective rate and end-of-month payments.
    expect(forecast.periods[1]).toMatchObject({ capital: 220_000, neutral: 228_573 })
    expect(forecast.curve[0]).toMatchObject({ month: 0, capital: 100_000, neutral: 100_000 })
    expect(forecast.curve[12]).toMatchObject({ month: 12, capital: 220_000, neutral: 228_573 })
  })

  it('caps the displayed chart at ten years while keeping the actual goal horizon', () => {
    const forecast = buildRoboTopUpProjection({ ...goal, horizonYears: 15, endDate: '1 March 2041' }, draft, clock)
    expect(forecast.goalYears).toBe(15)
    expect(forecast.periods.at(-1)).toMatchObject({ year: 10, month: 120 })
    expect(forecast.curve.at(-1)).toMatchObject({ month: 120, capital: 375_000 })
  })

  it('keeps scheduled payments due before a new monthly amount takes effect', () => {
    const forecast = buildRoboTopUpProjection(goal, { ...draft, method: 'regular', date: '1 July 2026' }, clock)
    expect(forecast.periods[1]!.capital).toBe(190_500)
  })

  it('offers the preview only for an unfunded goal on its first Add Money visit', () => {
    expect(canStartRoboTopUpProjection(unfunded)).toBe(true)
    expect(canStartRoboTopUpProjection({ ...unfunded, addMoneyVisited: true })).toBe(false)
    expect(canStartRoboTopUpProjection({ ...unfunded, recurringContribution: goal.recurringContribution })).toBe(false)
    expect(canStartRoboTopUpProjection(INITIAL_CZ_ROBO_GOALS.find((item) => item.id === 'goal-5-sold')!)).toBe(false)
  })

  it('blocks insufficient immediate funds, accepts equality, and checks each due debit', () => {
    expect(getRoboTopUpBalanceCheck(draft, account, clock)).toEqual({ kind: 'ready', amountDue: 75_000 })
    expect(getRoboTopUpBalanceCheck({ ...draft, date: '1 March 2026' }, account, clock)).toEqual({
      kind: 'insufficient',
      amountDue: 76_000,
    })
    expect(getRoboTopUpBalanceCheck({ ...draft, method: 'regular' }, { ...account, balance: 0 }, clock)).toEqual({
      kind: 'ready',
      amountDue: 0,
    })
    expect(getRoboTopUpBalanceCheck(draft, { ...account, balance: Number.NaN }, clock).kind).toBe('balance-unavailable')
    expect(getRoboTopUpBalanceCheck(draft, { ...account, currency: 'EUR' }, clock).kind).toBe('account-unavailable')
    expect(validateRoboTopUpAmount(499, 'monthly')).toBe(false)
    expect(validateRoboTopUpAmount(10_000_000, 'initial')).toBe(true)
    expect(validateRoboTopUpAmount(Number.POSITIVE_INFINITY, 'initial')).toBe(false)
  })
})
