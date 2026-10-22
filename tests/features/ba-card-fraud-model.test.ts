import { describe, expect, it } from 'vitest'
import {
  canSubmitClaim,
  canSubmitReport,
  countryProtectionDecision,
  createFraudSession,
  fraudReducer,
} from '@/features/cards/fraud/model'

describe('Bosnia fraud protection policies', () => {
  it('allows an optional statement while retaining declaration and maximum-length validation', () => {
    let state = fraudReducer(createFraudSession(), { type: 'report', transactionId: 'berlin' })
    expect(canSubmitReport(state)).toBe(false)
    state = fraudReducer(state, { type: 'draft', declaration: true })
    for (const note of ['', '  ', 'No']) {
      const draft = fraudReducer(state, { type: 'draft', note })
      expect(canSubmitReport(draft)).toBe(true)
      expect(fraudReducer(draft, { type: 'submit' }).cases.berlin?.note).toBe(note.trim())
    }
    expect(canSubmitReport(fraudReducer(state, { type: 'draft', note: 'a'.repeat(1001) }))).toBe(false)
  })
  it('does not attach a late photo read to another transaction', () => {
    const state = fraudReducer(createFraudSession('booked'), { type: 'select', transactionId: 'online' })
    expect(
      fraudReducer(state, {
        type: 'attach',
        transactionId: 'berlin',
        attachment: { name: 'late.png', size: 10, type: 'image/png', dataUrl: 'data:image/png;base64,dGVzdA==' },
      }).draft.attachments,
    ).toHaveLength(0)
  })
  it('retains the selected reason and validated photo evidence on the submitted case', () => {
    let state = fraudReducer(createFraudSession('booked'), { type: 'report', transactionId: 'berlin' })
    state = fraudReducer(state, {
      type: 'draft',
      reason: 'compromised',
      note: 'My card details may have been compromised.',
      declaration: true,
    })
    state = fraudReducer(state, {
      type: 'attach',
      attachment: { name: 'evidence.jpg', size: 1200, type: 'image/jpeg', dataUrl: 'data:image/jpeg;base64,dGVzdA==' },
    })
    state = fraudReducer(state, {
      type: 'attach',
      attachment: { name: 'malware.exe', size: 100, type: 'application/octet-stream', dataUrl: '' },
    })
    expect(state.draft.attachments).toHaveLength(1)
    state = fraudReducer(state, { type: 'submit' })
    expect(state.cases.berlin?.reason).toBe('compromised')
    expect(state.cases.berlin?.attachments[0]?.name).toBe('evidence.jpg')
  })
  it('recognises only the selected alert without opening a case or freezing the card', () => {
    const state = fraudReducer(createFraudSession('booked'), { type: 'recognise', transactionId: 'berlin' })
    expect(state.recognised).toEqual(['berlin'])
    expect(state.cases).toEqual({})
    expect(state.cardStatus).toBe('active')
  })

  it('freezes only after successful submission and retains an active card on failure', () => {
    let state = fraudReducer(createFraudSession('booked'), { type: 'report', transactionId: 'berlin' })
    expect(state.cardStatus).toBe('active')
    expect(state.reported).toEqual([])
    expect(canSubmitClaim(state)).toBe(false)
    state = fraudReducer(state, {
      type: 'draft',
      note: 'I still have my card and did not make this payment.',
      declaration: true,
    })
    expect(canSubmitClaim(state)).toBe(true)
    state = fraudReducer(state, { type: 'submit', fail: true })
    expect(Object.keys(state.cases)).toHaveLength(0)
    expect(state.submitError).toBe(true)
    expect(state.cardStatus).toBe('active')
    state = fraudReducer(state, { type: 'submit' })
    expect(state.cases.berlin?.status).toBe('submitted')
    expect(state.cardStatus).toBe('frozen')
    expect(state.reported).toEqual(['berlin'])
    expect(fraudReducer(state, { type: 'submit' }).cases).toEqual(state.cases)
  })

  it('lets the customer change their mind before sending without freezing or reporting the activity', () => {
    const draft = fraudReducer(createFraudSession(), { type: 'report', transactionId: 'vienna' })
    const recognised = fraudReducer(draft, { type: 'recognise', transactionId: 'vienna' })
    expect(recognised.recognised).toEqual(['vienna'])
    expect(recognised.reported).toEqual([])
    expect(recognised.cases).toEqual({})
    expect(recognised.cardStatus).toBe('active')
  })

  it('keeps an already submitted freeze when navigating to another preview screen', () => {
    const submitted = createFraudSession('report')
    const next = fraudReducer(submitted, { type: 'preview-fixture', state: createFraudSession() })
    expect(next.cardStatus).toBe('frozen')
    expect(next.cases.berlin).toBeTruthy()
  })

  it.each(['vienna', 'online', 'berlin'])(
    'reports %s without filing a chargeback for an unbooked item',
    (transactionId) => {
      let state = fraudReducer(createFraudSession(), { type: 'report', transactionId })
      state = fraudReducer(state, {
        type: 'draft',
        note: 'I did not authorise this attempted transaction.',
        declaration: true,
      })
      expect(canSubmitClaim(state)).toBe(false)
      state = fraudReducer(state, { type: 'submit' })
      expect(state.cases[transactionId]?.kind).toBe('fraud-report')
      expect(state.cardStatus).toBe('frozen')
      expect(state.reported).toContain(transactionId)
    },
  )

  it('keeps separate cases per transaction and does not fabricate a case for an invalid id', () => {
    const initial = createFraudSession('booked')
    expect(fraudReducer(initial, { type: 'report', transactionId: 'missing' })).toEqual(initial)
    let state = fraudReducer(initial, { type: 'report', transactionId: 'berlin' })
    state = fraudReducer(state, { type: 'draft', note: 'I did not authorise this card payment.', declaration: true })
    state = fraudReducer(state, { type: 'submit' })
    state = fraudReducer(state, { type: 'report', transactionId: 'online' })
    expect(state.draft.declaration).toBe(false)
    expect(state.cases.berlin?.transactionId).toBe('berlin')
    expect(fraudReducer(state, { type: 'recognise', transactionId: 'berlin' }).cases.berlin?.status).toBe('submitted')
  })

  it('requires explicit confirmation for replacement and never closes the dispute with the card', () => {
    let state = createFraudSession('case')
    expect(fraudReducer(state, { type: 'replace', confirmed: false })).toEqual(state)
    state = fraudReducer(state, { type: 'replace', confirmed: true })
    expect(state.cardStatus).toBe('closed')
    expect(state.replacement).toBe('requested')
    expect(state.cases.berlin?.status).toBe('submitted')
    expect(fraudReducer(state, { type: 'channel', channel: 'pos', enabled: true }).channels.pos).toBe(false)
    expect(fraudReducer(state, { type: 'preview-fixture', state: createFraudSession('booked') }).cardStatus).toBe(
      'closed',
    )
    state = fraudReducer(state, { type: 'report', transactionId: 'online' })
    state = fraudReducer(state, { type: 'draft', note: 'I did not authorise this online payment.', declaration: true })
    state = fraudReducer(state, { type: 'submit' })
    expect(state.cardStatus).toBe('closed')
    expect(state.cases.online?.status).toBe('submitted')
  })

  it('supports information requests and explained outcomes without altering replacement status', () => {
    let state = createFraudSession('case')
    state = fraudReducer(state, { type: 'case-fixture', status: 'needs-information' })
    expect(state.cases.berlin?.nextAction).toContain('information')
    state = fraudReducer(state, { type: 'case-fixture', status: 'resolved' })
    expect(state.cases.berlin?.outcome).toBeTruthy()
    expect(state.replacement).toBe('none')
  })

  it('applies a fresh phone-country rule to physical channels only, and fails closed when unavailable', () => {
    expect(
      countryProtectionDecision({
        enabled: false,
        location: 'unavailable',
        phoneCountry: 'BA',
        transactionCountry: 'DE',
        channel: 'pos',
      }),
    ).toBe('not-applied')
    expect(
      countryProtectionDecision({
        enabled: true,
        location: 'fresh',
        phoneCountry: 'BA',
        transactionCountry: 'DE',
        channel: 'internet',
      }),
    ).toBe('not-applied')
    expect(
      countryProtectionDecision({
        enabled: true,
        location: 'fresh',
        phoneCountry: 'BA',
        transactionCountry: 'DE',
        channel: 'atm',
      }),
    ).toBe('blocked')
    expect(
      countryProtectionDecision({
        enabled: true,
        location: 'fresh',
        phoneCountry: 'BA',
        transactionCountry: 'BA',
        channel: 'pos',
      }),
    ).toBe('allowed')
    expect(
      countryProtectionDecision({
        enabled: true,
        location: 'stale',
        phoneCountry: 'BA',
        transactionCountry: 'BA',
        channel: 'pos',
      }),
    ).toBe('location-required')
    let state = fraudReducer(createFraudSession('booked'), { type: 'location', location: 'unavailable' })
    state = fraudReducer(state, { type: 'geo', enabled: true })
    expect(state.geoEnabled).toBe(false)
  })
})
