import type { NativeInternalTransferPreview } from './internalTransferPreview'
import type { PrimeReferenceScreen, PrimeCustomerSegment } from '@/features/prime/reference'

/** Plain component regions rendered by the same Native primitives as complete screens. */
export type NativeMoreCardType =
  | 'contacts'
  | 'documents'
  | 'settings'
  | 'gdpr-consent'
  | 'third-party-consent'
  | 'digital-activities'
  | 'my-requests'
  | 'tutorial'

export type NativeContactsNavigationIcon =
  'prime' | 'location' | 'time' | 'phone' | 'block' | 'email' | 'website' | 'youtube' | 'x'

export type NativeComponentPreview =
  | NativeInternalTransferPreview
  | {
      kind: 'prime-reference'
      screen: PrimeReferenceScreen
      segment: PrimeCustomerSegment
      serviceActive: boolean
      playCallAudio?: boolean
    }
  | { kind: 'detail-header'; variant: 'account' | 'card'; title: string; progress: number }
  | { kind: 'analytics-header' }
  | { kind: 'home-header'; title?: string; showActions?: boolean; showTitle?: boolean }
  | { kind: 'more-header'; actionVariant?: 'default' | 'country'; messageCount?: number }
  | { kind: 'more-card'; card: NativeMoreCardType; title: string; width: number; badgeCount?: number }
  | {
      kind: 'investment-documents'
      currency: string
      initialOpenSection?: 'ex-ante' | 'documents' | 'important-information' | 'disclaimer' | null
    }
  | {
      kind: 'contacts-navigation-card'
      icon: NativeContactsNavigationIcon
      title: string
      value?: string
      subtitle?: string
      hasChevron?: boolean
    }

/** Generic component samples size to content; this flow owns the full phone viewport. */
export function isNativeComponentPreviewFitContent(preview: NativeComponentPreview | undefined): boolean {
  return preview !== undefined && preview.kind !== 'internal-transfer' && preview.kind !== 'prime-reference'
}
