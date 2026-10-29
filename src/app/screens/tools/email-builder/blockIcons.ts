import type { IconName } from '@/app/components/icons'
import type { BlockKind } from '@/features/marketing-email/model'

export const BLOCK_ICONS: Record<BlockKind, IconName> = {
  header: 'book-open',
  hero: 'camera',
  icon: 'grid-2x2',
  heading: 'edit-pencil',
  text: 'receipt-text',
  list: 'clipboard-check',
  cta: 'arrow-right',
  offer: 'grid-2x2',
  benefits: 'shield-check',
  divider: 'sliders-horizontal',
  spacer: 'sliders-horizontal',
  contact: 'contact-phone',
  footer: 'book-open',
}
