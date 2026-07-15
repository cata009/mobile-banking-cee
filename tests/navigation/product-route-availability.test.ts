import { describe, expect, it } from 'vitest'
import { getUnavailableProductRouteFallback } from '@/app/navigation/productRouteAvailability'

describe('product route availability', () => {
  it('keeps routes whose selected product still exists', () => {
    expect(getUnavailableProductRouteFallback(
      { screen: 'card-detail', cardId: 'card-a' },
      new Set(['card-a']),
      true,
    )).toBeNull()
  })

  it.each([
    [{ screen: 'account-detail', accountId: 'account-gone' }, false],
    [{ screen: 'card-options', cardId: 'card-gone' }, false],
    [{ screen: 'investments' }, false],
    [{ screen: 'investments-history' }, false],
  ] as const)('returns home when the route product disappears', (route, hasInvestments) => {
    expect(getUnavailableProductRouteFallback(route, new Set(), hasInvestments)).toBe('homepage')
  })
})
