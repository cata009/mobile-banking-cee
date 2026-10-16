import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import type { CountryId } from '@/app/state/demoTypes'

interface RequestCallScreenProps {
  country: CountryId
  onBack: () => void
}

export default function RequestCallScreen({ country, onBack }: RequestCallScreenProps) {
  return (
    <NativeScreenPreview
      route={{ screen: 'call-request' }}
      snapshot={{ country }}
      onBack={onBack}
      onNavigate={(_, action) => {
        if (action !== 'back') return false
        onBack()
        return true
      }}
    />
  )
}
