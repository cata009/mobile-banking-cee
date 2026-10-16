import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'

interface AccountDetailsInfoScreenProps {
  selectedProductId?: string | null
  onBack: () => void
}

export default function AccountDetailsInfoScreen({ selectedProductId, onBack }: AccountDetailsInfoScreenProps) {
  return (
    <NativeScreenPreview
      route={{
        screen: 'account-info',
        params: selectedProductId ? { productId: selectedProductId, accountId: selectedProductId } : undefined,
      }}
      onBack={onBack}
      onNavigate={(_route, action) => action === 'push'}
    />
  )
}
