import { expect, it } from 'vitest'
import { maskFormattedAmount } from '@/app/utils/amountPrivacy'

it.each([
  ['1.234,56', '****,**'],
  ['1,234.56', '****.**'],
  ['1.234,56 CZK', '****,**'],
  ['1234,56', '****,**'],
] as const)('preserves the decimal separator while masking %s', (formatted, expected) => {
  expect(maskFormattedAmount(formatted, true)).toBe(expected)
  expect(maskFormattedAmount(formatted, false)).toBe(formatted)
})
