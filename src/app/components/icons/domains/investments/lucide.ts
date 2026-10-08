import { Check } from 'lucide-react'
import type { LucideIconDefinition } from '../../iconTypes'

export const INVESTMENTS_LUCIDE_ICONS = {
  check: {
    source: 'lucide',
    label: 'Check',
    category: 'Actions',
    width: 20,
    height: 20,
    component: Check,
    strokeWidth: 3,
    usage: ['InvestmentBuyOrderFlow suitability table'],
  },
} satisfies Record<string, LucideIconDefinition>
