import { describe, expect, it } from 'vitest'
import { parseIsoDateOnly } from '@/app/utils/dateOnly'

describe('parseIsoDateOnly', () => {
  it('preserves an exact valid YYYY-MM-DD value in local time', () => {
    const parsed = parseIsoDateOnly('2025-01-31')

    expect(parsed.getFullYear()).toBe(2025)
    expect(parsed.getMonth()).toBe(0)
    expect(parsed.getDate()).toBe(31)
    expect(parsed.getHours()).toBe(0)
  })

  it.each([
    '2025-01-01-extra',
    '2025-01-01T00:00:00Z',
    '2025-02-29',
    '2025-13-01',
  ])('rejects malformed or rolling date-only input %s', (value) => {
    expect(() => parseIsoDateOnly(value)).toThrow(`Invalid ISO date-only value: "${value}"`)
  })

  it('accepts a real leap day without rolling it forward', () => {
    const parsed = parseIsoDateOnly('2024-02-29')

    expect(parsed.getFullYear()).toBe(2024)
    expect(parsed.getMonth()).toBe(1)
    expect(parsed.getDate()).toBe(29)
  })
})
