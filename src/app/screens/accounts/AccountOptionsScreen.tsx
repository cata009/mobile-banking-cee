import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'

interface AccountOptionsScreenProps {
  onBack: () => void
}

export default function AccountOptionsScreen({ onBack }: AccountOptionsScreenProps) {
  return (
    <NativeScreenPreview
      route={{ screen: 'account-options' }}
      onBack={onBack}
      onNavigate={(_route, action) => action === 'push'}
    />
  )
}
