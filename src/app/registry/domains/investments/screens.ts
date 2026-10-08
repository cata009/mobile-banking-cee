import type { ScreenId } from '@/app/state/demoTypes'
import type { ScreenMeta } from '../contracts'
import { ALL_COUNTRIES } from '../countries'

export const INVESTMENTS_SCREENS = {
  'pi.investments.portfolio': {
    id: 'pi.investments.portfolio',
    label: 'PI Investments portfolio',
    runtimeScreen: 'investments',
    products: ['PI'],
    countries: ALL_COUNTRIES,
    designSystems: ['current'],
    status: 'mock-driven',
    layoutFamily: 'investments',
    componentPath: 'src/app/screens/investments/InvestmentsPortfolioScreen.tsx',
    features: [],
    screenshots: [],
    similarTo: ['pi.account.detail', 'pi.products.overview'],
  },
  'pi.investments.smart-investment': {
    id: 'pi.investments.smart-investment',
    label: 'PI Smart investment',
    runtimeScreen: 'smart-investment',
    products: ['PI'],
    countries: ['RS'],
    designSystems: ['current'],
    releases: ['release-future-rs-future-gain'],
    status: 'mock-driven',
    layoutFamily: 'investments',
    componentPath: 'src/app/screens/investments/SmartInvestmentScreen.tsx',
    features: [],
    screenshots: [],
    similarTo: ['pi.investments.portfolio', 'pi.products.detail'],
  },
  'pi.investments.history': {
    id: 'pi.investments.history',
    label: 'PI Investments history',
    runtimeScreen: 'investments-history',
    products: ['PI'],
    countries: ALL_COUNTRIES,
    designSystems: ['current'],
    status: 'mock-driven',
    layoutFamily: 'investments',
    componentPath: 'src/app/screens/investments/InvestmentsHistoryScreen.tsx',
    features: [],
    screenshots: [],
    similarTo: ['pi.investments.portfolio'],
  },
} satisfies Partial<Record<ScreenId, ScreenMeta>>
