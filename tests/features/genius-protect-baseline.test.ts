import { describe, expect, it } from 'vitest'
import { getGeniusProtectSnapshot, resolveGeniusProtectEntry } from '@/features/insurance/geniusProtect'

describe('Genius Protect active baseline fixture', () => {
  it('starts with the Figma active policy for the Romanian baseline demo', () => {
    expect(getGeniusProtectSnapshot()).toMatchObject({
      draft: null,
      hasActivePolicy: true,
      policy: {
        number: '3431424',
        status: 'active',
        nextPremiumCents: 700,
        lastPaymentDate: '15.03.2026',
      },
    })
    expect(resolveGeniusProtectEntry(true)).toBe('active-policy')
  })
})
