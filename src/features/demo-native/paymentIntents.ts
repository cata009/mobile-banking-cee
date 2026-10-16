import type { DomesticPaymentDraft } from '@/data/paymentFlow'

export type NativePaymentStep = 'create' | 'review' | 'sign' | 'success'

export interface NativePaymentFlow {
  draft: DomesticPaymentDraft
  step: NativePaymentStep
  entryId?: number
  initialStep?: 'recipient' | 'amount'
}

export type NativePaymentIntent =
  | { type: 'enter'; draft: DomesticPaymentDraft; step: NativePaymentStep }
  | { type: 'edit'; draft: DomesticPaymentDraft }
  | { type: 'review' }
  | { type: 'sign' }
  | { type: 'success' }
  | { type: 'back' }
  | { type: 'reset' }

const sourcePaymentSteps: Readonly<Record<string, NativePaymentStep>> = {
  'domestic-payment': 'create',
  'payment-review': 'review',
  'payment-sign': 'sign',
  'payment-success': 'success',
}

/** Map a Source payment route to the native flow without manufacturing draft data. */
export function nativePaymentIntentFromSource(
  screen: string,
  draft: DomesticPaymentDraft | null | undefined,
): NativePaymentIntent | null {
  const step = sourcePaymentSteps[screen]
  if (!step || !draft) return null
  return { type: 'enter', draft, step }
}

/** Update only payment-flow state; draft creation, validation, and formatting stay canonical. */
export function reduceNativePaymentIntent(
  flow: NativePaymentFlow | null,
  intent: NativePaymentIntent,
): NativePaymentFlow | null {
  if (intent.type === 'enter') return { draft: intent.draft, step: intent.step }
  if (intent.type === 'reset') return null
  if (!flow) return null

  switch (intent.type) {
    case 'edit':
      return { ...flow, draft: intent.draft }
    case 'review':
      return flow.step === 'create' ? { ...flow, step: 'review' } : flow
    case 'sign':
      return flow.step === 'review' ? { ...flow, step: 'sign' } : flow
    case 'success':
      return flow.step === 'sign' ? { ...flow, step: 'success' } : flow
    case 'back':
      if (flow.step === 'create') return null
      return {
        ...flow,
        step: flow.step === 'success' ? 'sign' : flow.step === 'sign' ? 'review' : 'create',
      }
    default:
      return flow
  }
}
