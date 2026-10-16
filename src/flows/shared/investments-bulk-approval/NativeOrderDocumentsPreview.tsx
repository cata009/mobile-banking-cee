import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import type { NativeComponentPreview } from '@/features/demo-native/componentPreview'

type InvestmentDocumentsPreview = Extract<NativeComponentPreview, { kind: 'investment-documents' }>

export interface NativeOrderDocumentsPreviewProps {
  currency: string
  initialOpenSection: Exclude<InvestmentDocumentsPreview['initialOpenSection'], undefined>
}

export function NativeOrderDocumentsPreview({ currency, initialOpenSection }: NativeOrderDocumentsPreviewProps) {
  return (
    <NativeScreenPreview
      route={{ screen: 'investments' }}
      snapshot={{
        componentPreview: {
          kind: 'investment-documents',
          currency,
          initialOpenSection,
        },
      }}
    />
  )
}
