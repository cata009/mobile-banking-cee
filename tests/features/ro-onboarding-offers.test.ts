import { expect, it } from 'vitest'
import { changeOnboardingOffer, offerHasSelectedAccount } from '@/features/ro-onboarding/offers'
it('removes unavailable accounts and invalidates annex consent when the offer changes', () => {
  const next = changeOnboardingOffer('optim', {
    lei: false,
    eur: false,
    usd: true,
    additionalLei: true,
    terms: true,
    physical: true,
  })
  expect(next.usd).toBe(false)
  expect(next.additionalLei).toBe(false)
  expect(next.terms).toBe(false)
  expect(next.physical).toBe(true)
  expect(offerHasSelectedAccount('optim', next)).toBe(false)
})
it('accepts the additional LEI account only in the Prime offer', () => {
  expect(offerHasSelectedAccount('prime', { additionalLei: true })).toBe(true)
  expect(offerHasSelectedAccount('star', { additionalLei: true })).toBe(false)
})
