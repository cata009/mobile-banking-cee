import type { ComponentId } from '@/app/state/demoTypes'
import type { ComponentMeta } from '../contracts'

export const HOME_COMPONENTS = {
  'home.amount-visibility-toggle': {
    id: 'home.amount-visibility-toggle',
    label: 'Amount visibility toggle',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/AmountVisibilityButton.tsx',
    usedByScreens: ['pi.home.overview'],
    notes: 'Toggles account/card/product amount masking across navigation while leaving transaction amounts visible.',
  },
  'home.account-summary': {
    id: 'home.account-summary',
    label: 'Home account summary',
    products: ['PI'],
    designSystems: ['current'],
    status: 'mock-driven',
    componentPath: 'src/app/screens/home/AccountSummary.tsx',
    usedByScreens: ['pi.home.overview'],
  },
  'home.account-balance-card': {
    id: 'home.account-balance-card',
    label: 'Account balance card',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/accounts/AccountBalanceCard.tsx',
    usedByScreens: ['pi.account.detail'],
  },
  'home.unplanned-banner': {
    id: 'home.unplanned-banner',
    label: 'Unplanned banner',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/screens/home/UnplannedBanner.tsx',
    usedByScreens: ['pi.home.overview'],
  },
} satisfies Partial<Record<ComponentId, ComponentMeta>>
