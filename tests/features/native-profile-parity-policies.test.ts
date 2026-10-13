import { describe, expect, it } from 'vitest'
import { canAcceptProfileDocument } from '../../src/features/profile/mobileFirstProfileSettings'
import { servicePracticeInteraction } from '../../src/features/profile/mobileFirstProfileServices'

describe('Source profile gates reused by native', () => {
  it('generic/privacy documents require viewing plus consent; certificates still require consent', () => {
    expect(canAcceptProfileDocument({ seen: false, accepted: true, certificateDocument: false })).toBe(false)
    expect(canAcceptProfileDocument({ seen: true, accepted: false, certificateDocument: false })).toBe(false)
    expect(canAcceptProfileDocument({ seen: true, accepted: true, certificateDocument: false })).toBe(true)
    expect(canAcceptProfileDocument({ seen: false, accepted: false, certificateDocument: true })).toBe(false)
    expect(canAcceptProfileDocument({ seen: false, accepted: true, certificateDocument: true })).toBe(true)
  })
  it('an incomplete overdraft cannot enter the MIFID signature journey or be completed by document upload', () => {
    expect(servicePracticeInteraction({ id: 'overdraft', status: 'Incompleta' })).toBe('overdraft-upload')
    expect(servicePracticeInteraction({ id: 'mifid', status: 'Incompleta' })).toBe('mifid-signature')
    expect(servicePracticeInteraction({ id: 'advice-practice', status: 'Incompleta' })).toBe('mifid-link')
    expect(servicePracticeInteraction({ id: 'mifid', status: 'Completata' })).toBe('readonly')
    expect(servicePracticeInteraction({ id: 'unknown', status: 'Incompleta' })).toBe('readonly')
  })
})
