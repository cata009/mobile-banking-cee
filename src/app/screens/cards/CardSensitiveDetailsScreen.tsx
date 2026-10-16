import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import type { CreditCard, DebitCard } from '@/data/products'

interface CardSensitiveDetailsScreenProps {
  card: DebitCard | CreditCard
  onBack: () => void
  title?: string
}

export default function CardSensitiveDetailsScreen({
  card,
  onBack,
  title = 'Card details',
}: CardSensitiveDetailsScreenProps) {
  return (
    <NativeScreenPreview
      route={{ screen: 'card' }}
      snapshot={{
        bankingPresentation: {
          sensitiveCard: card,
          sensitiveTitle: title,
        },
      }}
      onBack={onBack}
    />
  )
}
