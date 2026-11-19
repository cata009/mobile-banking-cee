import { describe, expect, it } from 'vitest'
import { ROBO_PORTFOLIOS } from '@/features/investments/robo/catalog'
import { DEFAULT_ROBO_DEMO_CLOCK } from '@/features/investments/robo/demoClock'
import { INITIAL_CZ_ROBO_GOALS } from '@/features/investments/robo/goalFixtures'
import {
  buildRoboTopUpProjection,
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

describe('CZ Add Money projection and immediate debit', () => {
  it('compares cumulative cash and estimated gains at the same exact anniversaries', () => {
    const forecast = buildRoboTopUpProjection(goal, ROBO_PORTFOLIOS[0]!, draft, clock)
    expect(forecast.periods).toHaveLength(6)
    expect(forecast.periods[0]!.proposed).toEqual({ value: 255_000, contributions: 75_000, gain: 0 })
    expect(forecast.periods[2]!.current.contributions).toBe(12_000)
    expect(forecast.periods[5]!.proposed.contributions).toBe(135_000)
    const final = forecast.periods[5]!.proposed
    expect(final.value).toBe(forecast.opening + final.contributions + final.gain)
    expect(forecast.targetDelta).toBe(final.value - forecast.target)
  })

  it('starts a new goal at zero and distinguishes the replacement monthly plan', () => {
    const empty = { ...goal, positions: [], recurringContribution: undefined }
    const forecast = buildRoboTopUpProjection(empty, ROBO_PORTFOLIOS[0]!, { ...draft, method: 'regular' }, clock)
    expect(forecast.opening).toBe(0)
    expect(forecast.periods.every((period) => period.current.value === 0)).toBe(true)
    expect(forecast.periods.at(-1)!.proposed.contributions).toBe(60_000)
    const reduced = buildRoboTopUpProjection(
      goal,
      ROBO_PORTFOLIOS[0]!,
      { ...draft, method: 'regular', monthly: 250 },
      clock,
    )
    expect(reduced.periods.at(-1)!.proposed.value).toBeLessThan(reduced.periods.at(-1)!.current.value)
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
