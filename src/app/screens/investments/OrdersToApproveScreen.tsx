import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'

interface OrdersToApproveScreenProps {
  onBack: () => void
}

export default function OrdersToApproveScreen({ onBack }: OrdersToApproveScreenProps) {
  return (
    <NativeScreenPreview
      route={{ screen: 'investments', params: { entry: 'approvals' } }}
      snapshot={{ primaryNavigationVisible: false }}
      onBack={onBack}
    />
  )
}
