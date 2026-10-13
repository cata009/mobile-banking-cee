import { describe, expect, it } from 'vitest'
import { isValidInvestmentHouseholdSize } from '@/features/investments/mobileFirstInvestmentServices'

describe('source investment household policy', () => {
  it.each(['', ' ', '0', '-1', '0.5', '1.5', '2,0', 'Infinity', 'NaN', 'abc'])(
    'rejects source invalid value %j',
    (value) => {
      expect(isValidInvestmentHouseholdSize(value)).toBe(false)
    },
  )
  it.each(['1', '5', '999', '1.0', ' 2 ', '1e2', '0x10', '0b10'])(
    'preserves source Number conversion for %j',
    (value) => {
      expect(isValidInvestmentHouseholdSize(value)).toBe(true)
    },
  )
  it('is differential against the original gate for boundary and legacy conversions', () => {
    const values = [-3, -1, 0, 0.5, 1, 2, 10, 1e6].flatMap((value) => [String(value), ` ${value} `, `${value}.0`])
    for (const value of values)
      expect(isValidInvestmentHouseholdSize(value)).toBe(Number.isInteger(Number(value)) && Number(value) >= 1)
  })
})
