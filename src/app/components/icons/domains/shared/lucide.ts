import { WalletCards, ArrowRight, Lock, AlertTriangle } from 'lucide-react'
import type { LucideIconDefinition } from '../../iconTypes'

export const SHARED_LUCIDE_ICONS = {
  'wallet-cards': {
    source: 'lucide',
    label: 'Wallet cards',
    category: 'External Lucide',
    width: 32,
    height: 32,
    component: WalletCards,
    usage: ['Payments wallet illustration', 'AccountOptionsScreen', 'KidsMarketHomeApp'],
  },
  'arrow-right': {
    source: 'lucide',
    label: 'Arrow right',
    category: 'External Lucide',
    width: 32,
    height: 32,
    component: ArrowRight,
    usage: ['ProductMenuCard', 'QuickActions'],
  },
  lock: {
    source: 'lucide',
    label: 'Lock',
    category: 'External Lucide',
    width: 24,
    height: 24,
    component: Lock,
    usage: ['InactiveState'],
  },
  'alert-triangle': {
    source: 'lucide',
    label: 'Alert triangle',
    category: 'External Lucide',
    width: 20,
    height: 20,
    component: AlertTriangle,
    usage: ['UnplannedBanner'],
  },
} satisfies Record<string, LucideIconDefinition>
