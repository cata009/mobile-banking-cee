import { describe, expect, it } from 'vitest'
import {
  appendPaymentToken,
  evaluatePaymentExpression,
  paymentAmountPresets,
} from '@/app/utils/paymentAmountCalculator'

describe('payment amount keypad', () => {
  it('evaluates operators with the same precedence as the Kids amount calculator', () => {
    expect(evaluatePaymentExpression('100+25*2')).toBe(150)
    expect(evaluatePaymentExpression('10/0')).toBeNaN()
    expect(evaluatePaymentExpression('12+')).toBeNaN()
  })

  it('handles decimal comma and limits each operand to two fractional digits', () => {
    expect(evaluatePaymentExpression('1,5+2,25')).toBe(3.75)
    expect(appendPaymentToken('1,23', '4')).toBe('1,23')
    expect(appendPaymentToken('1+', ',')).toBe('1+0,')
  })

  it('offers currency-scaled presets', () => {
    expect(paymentAmountPresets('CZK')).toEqual([100, 500, 1000])
    expect(paymentAmountPresets('EUR')).toEqual([10, 25, 50])
  })
})
