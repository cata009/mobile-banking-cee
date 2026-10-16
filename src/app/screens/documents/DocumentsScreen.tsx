import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'

interface DocumentsScreenProps {
  onBack: () => void
  onHelpClick?: () => void
}

export default function DocumentsScreen({ onBack, onHelpClick }: DocumentsScreenProps) {
  return (
    <NativeScreenPreview
      route={{ screen: 'documents' }}
      onBack={onBack}
      events={onHelpClick ? { onHelpRequest: onHelpClick } : undefined}
      onNavigate={(_, action) => {
        if (action !== 'back') return false
        onBack()
        return true
      }}
    />
  )
}
