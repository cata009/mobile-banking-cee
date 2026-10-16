import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'

interface CardDetailsInfoScreenProps {
  selectedCardId?: string | null
  onBack: () => void
}

export default function CardDetailsInfoScreen({ selectedCardId, onBack }: CardDetailsInfoScreenProps) {
  return (
    <NativeScreenPreview
      route={{
        screen: 'card-info',
        params: selectedCardId ? { productId: selectedCardId, cardId: selectedCardId } : undefined,
      }}
      onBack={onBack}
      onNavigate={(_route, action) => action === 'push'}
    />
  )
}
