import { describe, expect, it } from 'vitest'
import { formatEvo2027Amount, formatEvo2027Number, formatEvo2027SignedNumber } from '@/app/utils/evo2027Formatting'

describe('Evo 2027 amount formatting', () => {
  it('uses dots for grouping and a comma for decimals without whitespace grouping', () => {
    expect(formatEvo2027Amount(22850.5, 'CZK')).toEqual({
      integer: '22.850',
      decimals: ',50',
      currency: 'CZK',
    })
    expect(formatEvo2027Number(81960.58)).toBe('81.960,58')
  })

  it('keeps the sign outside the normalized number', () => {
    expect(formatEvo2027SignedNumber(-3163.97)).toBe('-3.163,97')
    expect(formatEvo2027SignedNumber(7647.45)).toBe('+7.647,45')
  })
})
