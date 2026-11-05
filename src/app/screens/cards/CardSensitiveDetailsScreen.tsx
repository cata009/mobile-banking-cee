import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import type { CreditCard, DebitCard } from '@/data/products'

interface CardSensitiveDetailsScreenProps {
  card: DebitCard | CreditCard
  onBack: () => void
  title?: string
  showHelp?: boolean
}

export default function CardSensitiveDetailsScreen({
  card,
  onBack,
  title = 'Card details',
  showHelp = true,
}: CardSensitiveDetailsScreenProps) {
  return (
    <NativeScreenPreview
      route={showHelp ? { screen: 'card' } : { screen: 'card', params: { hideSensitiveCardHelp: 'true' } }}
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
