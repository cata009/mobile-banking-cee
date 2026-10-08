import type { ComponentId } from '@/app/state/demoTypes'
import type { ComponentMeta } from '../contracts'

export const KIDS_COMPONENTS = {
  'kids.market-home-concepts': {
    id: 'kids.market-home-concepts',
    label: 'Kids market homepage concepts',
    products: ['KIDS_PI'],
    designSystems: ['current'],
    status: 'mock-driven',
    componentPath: 'src/app/screens/kids/KidsMarketHomeApp.tsx',
    usedByScreens: ['kids.sk.home-concept', 'kids.hu.home-concept'],
    notes:
      'Country-contained Kids homepage and bottom-navigation concepts for Slovakia and Hungary. The same module uses market-specific mock data and intentionally different UI directions: SK Bulbank document-inspired Products/Education/Tasks/More and HU CEE Light Restyle/theme personalization.',
  },
} satisfies Partial<Record<ComponentId, ComponentMeta>>
