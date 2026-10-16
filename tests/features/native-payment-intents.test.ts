import { describe, expect, it } from 'vitest'
import { createEmptyDomesticPaymentDraft } from '@/data/paymentFlow'
import {
  nativePaymentIntentFromSource,
  reduceNativePaymentIntent,
  type NativePaymentFlow,
} from '@/features/demo-native/paymentIntents'

const draft = createEmptyDomesticPaymentDraft('RO')

describe('native payment intents', () => {
  it.each([
    ['domestic-payment', 'create'],
    ['payment-review', 'review'],
    ['payment-sign', 'sign'],
    ['payment-success', 'success'],
  ] as const)('enters Source %s with its canonical draft at %s', (screen, step) => {
    expect(nativePaymentIntentFromSource(screen, draft)).toEqual({
      type: 'enter',
      step,
      draft,
    })
  })

  it('does not create a native payment intent when Source has no draft', () => {
    for (const screen of ['domestic-payment', 'payment-review', 'payment-sign', 'payment-success']) {
      expect(nativePaymentIntentFromSource(screen, null)).toBeNull()
    }
    expect(nativePaymentIntentFromSource('payments', draft)).toBeNull()
  })

  it('keeps an edit verbatim and on the current step', () => {
    const current: NativePaymentFlow = { draft, step: 'review' }
    const edited = { ...draft, beneficiaryName: 'Edited beneficiary' }

    expect(reduceNativePaymentIntent(current, { type: 'edit', draft: edited })).toEqual({
      draft: edited,
      step: 'review',
    })
  })

  it('advances create, review, and sign without changing the canonical draft', () => {
    const entered = nativePaymentIntentFromSource('domestic-payment', draft)!
    const created = reduceNativePaymentIntent(null, entered)
    const reviewed = reduceNativePaymentIntent(created, { type: 'review' })
    const signed = reduceNativePaymentIntent(reviewed, { type: 'sign' })
    const succeeded = reduceNativePaymentIntent(signed, { type: 'success' })

    expect(reviewed).toEqual({ draft, step: 'review' })
    expect(signed).toEqual({ draft, step: 'sign' })
    expect(succeeded).toEqual({ draft, step: 'success' })
  })

  it('backs through success, sign, review, then exits from create', () => {
    const success: NativePaymentFlow = { draft, step: 'success' }
    const signed = reduceNativePaymentIntent(success, { type: 'back' })
    const reviewed = reduceNativePaymentIntent(signed, { type: 'back' })
    const created = reduceNativePaymentIntent(reviewed, { type: 'back' })

    expect(signed).toEqual({ draft, step: 'sign' })
    expect(reviewed).toEqual({ draft, step: 'review' })
    expect(created).toEqual({ draft, step: 'create' })
    expect(reduceNativePaymentIntent(created, { type: 'back' })).toBeNull()
  })

  it('ignores out-of-order steps and resets an entered flow', () => {
    const entered = nativePaymentIntentFromSource('domestic-payment', draft)!
    const created = reduceNativePaymentIntent(null, entered)

    expect(reduceNativePaymentIntent(created, { type: 'sign' })).toEqual(created)
    expect(reduceNativePaymentIntent(created, { type: 'success' })).toEqual(created)
    expect(reduceNativePaymentIntent(created, { type: 'reset' })).toBeNull()
    expect(reduceNativePaymentIntent(null, { type: 'edit', draft })).toBeNull()
  })
})
