import { CreditCard } from 'lucide-react'
import type { LucideIconDefinition } from '../../iconTypes'

export const CARDS_LUCIDE_ICONS = {
  'credit-card': {
    source: 'lucide',
    label: 'Credit card',
    category: 'External Lucide',
    width: 20,
    height: 20,
    component: CreditCard,
    usage: ['QuickActions'],
  },
} satisfies Record<string, LucideIconDefinition>
