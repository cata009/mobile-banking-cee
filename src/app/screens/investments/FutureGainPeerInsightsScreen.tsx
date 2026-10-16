import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'

interface FutureGainPeerInsightsScreenProps {
  onBack: () => void
}

export default function FutureGainPeerInsightsScreen({ onBack }: FutureGainPeerInsightsScreenProps) {
  return (
    <NativeScreenPreview
      route={{ screen: 'peer-insights' }}
      snapshot={{ primaryNavigationVisible: false }}
      onBack={onBack}
    />
  )
}
