import { Landmark, Repeat2 } from 'lucide-react'
import type { LucideIconDefinition } from '../../iconTypes'

export const ACCOUNTS_LUCIDE_ICONS = {
  landmark: {
    source: 'lucide',
    label: 'Landmark',
    category: 'External Lucide',
    width: 25,
    height: 25,
    component: Landmark,
    usage: ['TransactionDetailScreen'],
  },
  repeat: {
    source: 'lucide',
    label: 'Repeat',
    category: 'External Lucide',
    width: 26,
    height: 26,
    component: Repeat2,
    usage: ['TransactionDetailScreen'],
  },
} satisfies Record<string, LucideIconDefinition>
