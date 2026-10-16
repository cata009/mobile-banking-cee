import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import type { NativeDemoRoute } from '@/features/demo-native/contracts'

interface MoreScreenProps {
  onHomeClick?: () => void
  onAnalyticsClick?: () => void
  onMessagesClick?: () => void
  onPaymentsClick?: () => void
  onProductsClick?: () => void
  onInvestmentsClick?: () => void
  onContactsClick?: () => void
  onDocumentsClick?: () => void
  onSettingsClick?: () => void
  onLogoutConfirm?: () => void
}

export default function MoreScreen(props: MoreScreenProps) {
  const callbacks: Partial<Record<NativeDemoRoute['screen'], (() => void) | undefined>> = {
    home: props.onHomeClick,
    pfm: props.onAnalyticsClick,
    messages: props.onMessagesClick,
    payments: props.onPaymentsClick,
    products: props.onProductsClick,
    investments: props.onInvestmentsClick,
    contacts: props.onContactsClick,
    documents: props.onDocumentsClick,
    settings: props.onSettingsClick,
    login: props.onLogoutConfirm,
  }

  return (
    <NativeScreenPreview
      route={{ screen: 'profile' }}
      onNavigate={(route) => {
        if (!Object.prototype.hasOwnProperty.call(callbacks, route.screen)) return false
        callbacks[route.screen]?.()
        // Source keeps unavailable More actions inert instead of opening a Native route.
        return true
      }}
    />
  )
}
