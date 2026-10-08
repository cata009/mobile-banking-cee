import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRoboAdvisorFlowState } from '@/app/screens/investments/roboAdvisorFlowState'
import {
  getRoboReferenceDate,
  isRoboFundingDateAllowed,
  parseRoboFundingDate,
} from '@/features/investments/robo/demoClock'

afterEach(() => vi.useRealTimers())

describe('Robo reference clock', () => {
  it.each([
    '',
    'invalid',
    '31 February 2026',
    '29 February 2026',
    '1 April 2026 junk',
    '2026-03-01T00:00:00Z',
    '28 February 2026',
  ])('rejects invalid or before-reference funding input %j', (value) => {
    expect(isRoboFundingDateAllowed(value)).toBe(false)
  })

  it('compares calendar days across year rollover without UTC conversion', () => {
    const clock = { referenceDay: { year: 2026, month: 12, day: 31 } }
    const reference = getRoboReferenceDate(clock)
    expect([reference.getFullYear(), reference.getMonth(), reference.getDate(), reference.getHours()]).toEqual([
      2026, 11, 31, 0,
    ])
    expect(isRoboFundingDateAllowed('30 December 2026', clock)).toBe(false)
    expect(isRoboFundingDateAllowed('31 December 2026', clock)).toBe(true)
    expect(isRoboFundingDateAllowed('1 January 2027', clock)).toBe(true)
    expect(parseRoboFundingDate('29 February 2028')?.getDate()).toBe(29)
  })

  it('initializes from an injected calendar day instead of machine time', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2045-12-31T23:59:59Z'))
    // An explicit calendar day avoids UTC/local midnight conversion.
    const clock = { referenceDay: { year: 2028, month: 2, day: 29 } }
    expect(createRoboAdvisorFlowState(undefined, clock).startDate).toBe('29 February 2028')
    expect(createRoboAdvisorFlowState().startDate).toBe('1 March 2026')
  })
})
