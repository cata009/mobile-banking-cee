import { ShoppingBag } from 'lucide-react'
import type { LucideIconDefinition } from '../../iconTypes'

export const PRODUCTS_LUCIDE_ICONS = {
  'shopping-bag': {
    source: 'lucide',
    label: 'Shopping bag',
    category: 'External Lucide',
    width: 32,
    height: 32,
    component: ShoppingBag,
    usage: ['ProductMenuCard', 'KidsMarketHomeApp'],
  },
} satisfies Record<string, LucideIconDefinition>
