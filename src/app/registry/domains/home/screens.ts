import type { ScreenId } from '@/app/state/demoTypes'
import type { ScreenMeta } from '../contracts'
import { ALL_COUNTRIES } from '../countries'

export const HOME_SCREENS = {
  'pi.home.overview': {
    id: 'pi.home.overview',
    label: 'PI Home overview',
    runtimeScreen: 'homepage',
    products: ['PI'],
    countries: ALL_COUNTRIES,
    designSystems: ['current'],
    status: 'partial',
    layoutFamily: 'dashboard',
    componentPath: 'src/app/screens/home/HomeScreen.tsx',
    features: [
      'fx_cardsRedesign',
      'fx_unplannedBanner',
      'fx_newPaymentsHub',
      'fx_quickActionsRedesign',
      'fx_transactionsFilters',
      'fx_enhancedAnalytics',
    ],
    screenshots: ['screenshots/homepage.png'],
    similarTo: [],
  },
} satisfies Partial<Record<ScreenId, ScreenMeta>>
