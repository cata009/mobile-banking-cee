import fundBannerPlant from '@/assets/investments/fund-banner-plant-unsplash.jpg'
import fundOnemarket from '@/assets/investments/funds/fund-onemarket.png'
import fundSelectionPlus from '@/assets/investments/funds/fund-selection-plus.png'
import fundFeatured from '@/assets/investments/funds/fund-featured.png'
import fundEquity from '@/assets/investments/funds/fund-equity.png'
import fundBalanced from '@/assets/investments/funds/fund-balanced.png'
import fundConservative from '@/assets/investments/funds/fund-conservative.png'

export type InvestmentsFundBannerVariantId =
  'discovery' | 'onemarket' | 'selection-plus' | 'featured' | 'equity' | 'balanced' | 'conservative'

interface InvestmentsFundBannerVariantStyle {
  imageSrc: string
  collection: boolean
}

export const INVESTMENTS_FUND_BANNER_VARIANTS: Record<
  InvestmentsFundBannerVariantId,
  InvestmentsFundBannerVariantStyle
> = {
  discovery: { imageSrc: fundBannerPlant, collection: false },
  onemarket: { imageSrc: fundOnemarket, collection: true },
  'selection-plus': { imageSrc: fundSelectionPlus, collection: true },
  featured: { imageSrc: fundFeatured, collection: true },
  equity: { imageSrc: fundEquity, collection: true },
  balanced: { imageSrc: fundBalanced, collection: true },
  conservative: { imageSrc: fundConservative, collection: true },
}
