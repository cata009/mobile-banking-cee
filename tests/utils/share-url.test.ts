// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { compactShareUrl, expandShareUrl } from '@/app/utils/shareUrl'

describe('compact share links', () => {
  it('preserves the full state, hash, and outer access token', () => {
    const original = 'https://example.com/?product=PI&country=RO&scenario=active&ds=current&release=release-current&bank=retail-single-account&theme=light&lang=en&screen=card-detail&card=card-credit-1&count_accounts=2&count_debit_cards=2&count_credit_cards=1&count_meal_cards=0&count_deposits=1&count_savings=1&count_loans=1&count_mortgages=1&count_investments=1#section'
    const compact = new URL(compactShareUrl(original))
    expect(compact.toString().length).toBeLessThan(original.length)
    compact.searchParams.set('access_token', 'signed-token')
    compact.searchParams.set('frame', '0')
    const restored = new URL(expandShareUrl(compact.toString()))
    const expected = new URL(original)
    expected.searchParams.set('access_token', 'signed-token')
    expected.searchParams.set('frame', '0')
    expect(restored.toString()).toBe(expected.toString())
  })

  it('leaves legacy and invalid links unchanged', () => {
    const legacy = 'https://example.com/?screen=homepage&country=RO'
    const malformed = 'https://example.com/?s=invalid'
    expect(expandShareUrl(legacy)).toBe(legacy)
    expect(expandShareUrl(malformed)).toBe(malformed)
  })
})
