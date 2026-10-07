import type { ScreenId } from '@/app/state/demoTypes'
import type { ScreenMeta } from '../contracts'
import { ALL_COUNTRIES } from '../countries'

export const ANALYTICS_SCREENS = {
  'pi.analytics.overview': {
    id: 'pi.analytics.overview',
    label: 'PI Analytics spendings',
    runtimeScreen: 'analytics',
    products: ['PI'],
    countries: ALL_COUNTRIES,
    designSystems: ['current'],
    status: 'mock-driven',
    layoutFamily: 'analytics',
    componentPath: 'src/app/screens/analytics/AnalyticsScreen.tsx',
    features: ['fx_enhancedAnalytics'],
    screenshots: ['screenshots/Analytics.jpg'],
    similarTo: ['pi.home.overview'],
  },
} satisfies Partial<Record<ScreenId, ScreenMeta>>
