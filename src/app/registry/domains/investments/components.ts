import type { ComponentId } from '@/app/state/demoTypes'
import type { ComponentMeta } from '../contracts'

export const INVESTMENTS_COMPONENTS = {
  'investments.portfolio-tabs': {
    id: 'investments.portfolio-tabs',
    label: 'Investments portfolio tabs',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/investments/InvestmentPortfolioTabs.tsx',
    usedByScreens: ['pi.investments.portfolio'],
    notes:
      'Controlled Investments wrapper around the shared MessagesMailboxTabs Design System component, using its horizontally scrollable layout for Performance, Product type, Currency, Asset class, and Account list.',
  },
  'investments.portfolio-chart': {
    id: 'investments.portfolio-chart',
    label: 'Investments portfolio chart',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/investments/InvestmentPortfolioChart.tsx',
    usedByScreens: ['pi.investments.portfolio'],
    notes:
      'Reusable Recharts line/area chart driven by portfolio value and selected period points rather than a static screenshot or hand-drawn chart.',
  },
  'investments.distribution-chart': {
    id: 'investments.distribution-chart',
    label: 'Investments distribution chart',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/investments/InvestmentDistributionChart.tsx',
    usedByScreens: ['pi.investments.portfolio'],
    notes:
      'Reusable donut/list distribution view for Product type, Currency, Asset class, and Account list tabs. Distribution values are grouped from the same portfolio securities and sum back to the owned investment total in local currency.',
  },
  'investments.period-chips': {
    id: 'investments.period-chips',
    label: 'Investments period chips',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/investments/InvestmentPeriodChips.tsx',
    usedByScreens: ['pi.investments.portfolio'],
    notes: 'Controlled period selector for 1M, 3M, 6M, 1Y, 3Y, and ALL chart views.',
  },
  'investments.action-bar': {
    id: 'investments.action-bar',
    label: 'Investments action bar',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/investments/InvestmentActionBar.tsx',
    usedByScreens: ['pi.investments.portfolio'],
    notes:
      'Investments-specific 3-small-actions plus compact Invest CTA variation of the max-four action-button pattern. The Invest CTA is a 56x56 teal circle with a 32x32 growth/investment glyph and lowercase 11px `invest` label, matching the supplied Figma JSON.',
  },
  'investments.filter-chips': {
    id: 'investments.filter-chips',
    label: 'Investments filter chips',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/investments/InvestmentFilterChips.tsx',
    usedByScreens: ['pi.investments.portfolio'],
    notes:
      'Controlled sorting chips for Max value, Min value, Max %, and Min %, wired to sort displayed investment instruments.',
  },
  'investments.products-accordion': {
    id: 'investments.products-accordion',
    label: 'Investments products accordion',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/investments/InvestmentProductsAccordion.tsx',
    usedByScreens: ['pi.investments.portfolio'],
    notes: 'Collapsible Active securities and Inactive securities list sections with inline item counts.',
  },
  'investments.product-card': {
    id: 'investments.product-card',
    label: 'Investment product card',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/investments/InvestmentProductCard.tsx',
    usedByScreens: ['pi.investments.portfolio'],
    notes:
      'Reusable investment instrument row/card with source product, value, performance amount, contribution type, and percentage movement.',
  },
  'investments.fund-banner': {
    id: 'investments.fund-banner',
    label: 'Investments fund suggestion banner',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/investments/InvestmentsFundBanner.tsx',
    usedByScreens: ['pi.investments.portfolio', 'platform.design-system'],
    notes:
      'Reusable fund CTA with one portfolio discovery variant and six selectable Figma-backed collection variants for Onemarket, Selection+, featured, equity, balanced, and conservative funds. Collection banners use a 126px minimum height and hug multiline title/subtitle content instead of clipping it into a fixed-height card.',
  },
} satisfies Partial<Record<ComponentId, ComponentMeta>>
