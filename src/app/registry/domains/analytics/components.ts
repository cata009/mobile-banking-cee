import type { ComponentId } from '@/app/state/demoTypes'
import type { ComponentMeta } from '../contracts'

export const ANALYTICS_COMPONENTS = {
  'analytics.spendings': {
    id: 'analytics.spendings',
    label: 'Analytics spendings overview',
    products: ['PI'],
    designSystems: ['current'],
    status: 'mock-driven',
    componentPath: 'src/app/screens/analytics/AnalyticsScreen.tsx',
    usedByScreens: ['pi.analytics.overview'],
    notes:
      'Screenshot-inspired My Spendings screen with transaction-derived inflow/outflow bars, cash transaction banner, interactive PFM-category Money Out / Money In summaries, and session recategorization reflected in its aggregates.',
  },
  'analytics.category-details': {
    id: 'analytics.category-details',
    label: 'PFM spending category details',
    products: ['PI'],
    designSystems: ['current'],
    status: 'mock-driven',
    componentPath: 'src/app/screens/analytics/PfmCategoryDetailScreen.tsx',
    usedByScreens: ['pi.analytics.overview', 'pi.transaction.detail'],
    notes:
      'Production-reference-derived Money Out/Money In category drill-down with connected period totals, proportional subcategory bubbles, Add Transaction action, matching transaction rows, and the dismissible Uncategorized helper. Data is session-local and mock-driven.',
  },
  'pfm.category-icon': {
    id: 'pfm.category-icon',
    label: 'PFM category icon',
    products: ['PI'],
    designSystems: ['current'],
    status: 'mock-driven',
    componentPath: 'src/app/components/pfm/PfmCategoryIcon.tsx',
    usedByScreens: ['pi.account.detail', 'pi.analytics.overview'],
    notes:
      'Token-driven PFM category icon mapped from screenshots/PFM-icons.svg; Taxes and Penalties, Income, Home, Utilities, Transportation, Children, Healthcare, Shopping, Lifestyle, Education, Leisure time, Investments, Uncategorized, Groceries, Exclude from budget, Insurance, Finance, Wallet, and Transfers render real 20x20 SVG glyphs inside a 32x32 container, while remaining categories still fall back to initials.',
  },
  'pfm.category-change-sheet': {
    id: 'pfm.category-change-sheet',
    label: 'PFM category change sheet',
    products: ['PI'],
    designSystems: ['current'],
    status: 'mock-driven',
    componentPath: 'src/app/components/pfm/PfmCategoryChangeSheet.tsx',
    usedByScreens: ['pi.account.detail', 'pi.transaction.detail'],
    notes:
      'Production-screenshot-derived recategorization sheet with 18 initially collapsed expense groups, 103 mapped subcategories, search, single radio selection, and a guarded confirmation action. It updates deterministic demo-session transaction presentation only; no backend persistence is implied.',
  },
} satisfies Partial<Record<ComponentId, ComponentMeta>>
