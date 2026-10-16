import { useEffect, useRef, useState } from 'react'
import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import type { NativeDemoEvents, NativeDemoRoute } from '@/features/demo-native/contracts'
import type { NativePaymentFlow } from '@/features/demo-native/paymentIntents'
import type { DomesticPaymentDraft } from '@/data/paymentFlow'

function usePaymentFlowSnapshot(initialFlow: NativePaymentFlow | null) {
  const key = JSON.stringify(initialFlow)
  const [flow, setFlow] = useState(initialFlow)
  const previousKey = useRef(key)

  useEffect(() => {
    if (previousKey.current === key) return
    previousKey.current = key
    setFlow(initialFlow)
  }, [initialFlow, key])

  return [flow, setFlow] as const
}

function PaymentFlowPreview({
  route,
  initialFlow,
  onBack,
  onFlowChange,
}: {
  route: NativeDemoRoute
  initialFlow: NativePaymentFlow | null
  onBack: () => void
  onFlowChange: NonNullable<NativeDemoEvents['onPaymentFlowChange']>
}) {
  const [paymentFlow, setPaymentFlow] = usePaymentFlowSnapshot(initialFlow)
  return (
    <NativeScreenPreview
      route={route}
      snapshot={{ paymentFlow }}
      events={{
        onPaymentFlowChange: (nextFlow) => {
          setPaymentFlow(nextFlow)
          onFlowChange(nextFlow)
        },
      }}
      onBack={onBack}
      onNavigate={(_route, action) => action === 'push'}
    />
  )
}

export interface Evo2027DomesticPaymentCreateScreenProps {
  draft: DomesticPaymentDraft
  initialStep?: 'recipient' | 'amount'
  paymentFlow?: NativePaymentFlow | null
  onDraftChange?: (draft: DomesticPaymentDraft) => void
  onPaymentFlowChange?: NativeDemoEvents['onPaymentFlowChange']
  onBack: () => void
  onNext: (draft: DomesticPaymentDraft) => void
}

export function Evo2027DomesticPaymentCreateScreen({
  draft,
  initialStep = 'recipient',
  paymentFlow,
  onDraftChange,
  onPaymentFlowChange,
  onBack,
  onNext,
}: Evo2027DomesticPaymentCreateScreenProps) {
  const initialFlow = paymentFlow ?? { draft, step: 'create' as const, initialStep }

  return (
    <PaymentFlowPreview
      route={{ screen: 'payment-create' }}
      initialFlow={initialFlow}
      onBack={onBack}
      onFlowChange={(nextFlow) => {
        if (!nextFlow) {
          onBack()
          return
        }
        if (nextFlow.step === 'review') {
          onNext(nextFlow.draft)
          return
        }
        if (nextFlow.step === 'create') {
          onDraftChange?.(nextFlow.draft)
          onPaymentFlowChange?.(nextFlow)
          return
        }
        onPaymentFlowChange?.(nextFlow)
      }}
    />
  )
}

export interface Evo2027PaymentReviewScreenProps {
  draft: DomesticPaymentDraft
  paymentFlow?: NativePaymentFlow | null
  onPaymentFlowChange?: NativeDemoEvents['onPaymentFlowChange']
  onDraftChange: (nextDraft: DomesticPaymentDraft) => void
  onBack: () => void
  onSign: () => void
}

export function Evo2027PaymentReviewScreen({
  draft,
  paymentFlow,
  onPaymentFlowChange,
  onDraftChange,
  onBack,
  onSign,
}: Evo2027PaymentReviewScreenProps) {
  const initialFlow = paymentFlow ?? { draft, step: 'review' as const }

  return (
    <PaymentFlowPreview
      route={{ screen: 'payment-create' }}
      initialFlow={initialFlow}
      onBack={onBack}
      onFlowChange={(nextFlow) => {
        if (!nextFlow) {
          onBack()
          return
        }
        if (nextFlow.step === 'review') {
          onDraftChange(nextFlow.draft)
          onPaymentFlowChange?.(nextFlow)
          return
        }
        if (nextFlow.step === 'create') {
          onDraftChange(nextFlow.draft)
          onBack()
          return
        }
        if (nextFlow.step === 'sign') {
          onDraftChange(nextFlow.draft)
          onSign()
          return
        }
        onPaymentFlowChange?.(nextFlow)
      }}
    />
  )
}
