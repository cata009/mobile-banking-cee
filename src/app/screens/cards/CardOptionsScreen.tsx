import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'

interface CardOptionsScreenProps {
  selectedCardId?: string | null
  onBack: () => void
}

export default function CardOptionsScreen({ selectedCardId, onBack }: CardOptionsScreenProps) {
  return (
    <NativeScreenPreview
      route={{
        screen: 'card-options',
        params: selectedCardId ? { productId: selectedCardId, cardId: selectedCardId } : undefined,
      }}
      onBack={onBack}
      onNavigate={(_route, action) => action === 'push'}
    />
  )
}
