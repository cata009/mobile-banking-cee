import { describe, expect, it } from 'vitest'
import {
  initialProfileHubState,
  profileHubReducer,
  profileUnreadCount,
  filterProfileBranches,
  nextProfileToken,
} from '@/features/profile/mobileFirstProfile'

describe('Profile hub policies', () => {
  it('marks a notification read exactly once and preserves other read states', () => {
    const initial = initialProfileHubState()
    const next = profileHubReducer(initial, { type: 'read', id: 'debit-info' })
    expect(profileUnreadCount(initial, ['debit-info', 'secondary-device', 'access-error', 'bank-access'])).toBe(3)
    expect(profileUnreadCount(next, ['debit-info', 'secondary-device', 'access-error', 'bank-access'])).toBe(2)
    expect(profileHubReducer(next, { type: 'read', id: 'debit-info' })).toBe(next)
  })
  it('filters by every selected branch service rather than matching just one', () => {
    const rows = [
      { id: 'a', name: 'Milano Certosa', address: 'V.le Certosa,125', type: 'Filiale', services: ['ATM', 'Eventi'] },
      { id: 'b', name: 'Milano Centro', address: 'Via Roma,1', type: 'Filiale', services: ['ATM'] },
    ]
    expect(filterProfileBranches(rows, 'Milano', 'Filiale', ['ATM', 'Eventi']).map((x) => x.id)).toEqual(['a'])
    expect(filterProfileBranches(rows, 'Crotone', 'Filiale', [])).toEqual([])
  })
  it('generates a fresh eight-digit token and preserves leading digits', () => {
    expect(nextProfileToken(0)).toBe('12345678')
    expect(nextProfileToken(1)).toHaveLength(8)
    expect(nextProfileToken(1)).not.toBe(nextProfileToken(0))
  })
  it('records independent request outcomes without overwriting read markers', () => {
    const state = profileHubReducer(initialProfileHubState(), { type: 'decision', id: 'login', decision: 'approved' })
    expect(state.decisions.login).toBe('approved')
    expect(state.readIds).toContain('login')
    expect(state.readIds).toContain('bank-access')
  })
})
