import { describe, expect, it } from 'vitest'
import { applyCreditLimitOverride, getCreditLimitProposal } from '@/features/cards/credit-limit/model'

describe('credit limit offer policy', () => {
  it('proposes a 5000 increase without applying it before completion', () => {
    const card = { creditLimit: 10_000, availableCredit: 6_500 }

    expect(getCreditLimitProposal(card)).toEqual({
      currentLimit: 10_000,
      newLimit: 15_000,
      increase: 5_000,
    })
    expect(card).toEqual({ creditLimit: 10_000, availableCredit: 6_500 })
  })

  it('applies a completed override by changing only the credit card limit and available credit', () => {
    const card = {
      id: 'card-1',
      creditLimit: 10_000,
      availableCredit: 6_500,
      name: 'Everyday credit card',
    }

    expect(applyCreditLimitOverride(card, 15_000)).toEqual({
      ...card,
      creditLimit: 15_000,
      availableCredit: 11_500,
    })
    expect(applyCreditLimitOverride(card, undefined)).toBe(card)
    expect(applyCreditLimitOverride(card, Number.NaN)).toBe(card)
  })
})
