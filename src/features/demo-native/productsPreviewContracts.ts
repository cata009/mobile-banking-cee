import type {
  ProductsCard,
  ProductsCardId,
  ProductsMenuTab,
  ProductsOffer,
  ShopSmartOfferCard,
  ShopSmartOfferCategory,
  ShopSmartSummary,
} from '@/app/config/productsMenuConfig'

/** Plain input data for Native rendering of an individual Source products region. */
export type NativeProductsPreview =
  | {
      region: 'products-header'
      title: string
      actionLayout?: 'default' | 'search'
      gutter?: number
    }
  | {
      region: 'products-tabs'
      activeTab: ProductsMenuTab
      bankingLabel: string
      shopSmartLabel: string
    }
  | {
      region: 'products-banking'
      offersTitle: string
      offers: readonly ProductsOffer[]
      showOffersDots?: boolean
      productsTitle: string
      products: readonly ProductsCard[]
      offersHeadingVariant?: 'section' | 'none'
      otherSolutionsTitle: string
      otherSolutions: readonly ProductsCard[]
    }
  | {
      region: 'products-shopsmart'
      summary: ShopSmartSummary
      offerCards: readonly ShopSmartOfferCard[]
      stickySearchTop?: string
      searchSurface?: boolean
      showSummary?: boolean
    }

/** Serializable actions emitted by Native products region controls. */
export type NativeProductsPreviewAction =
  | { type: 'header-action'; action: 'contacts' | 'messages' | 'search' }
  | { type: 'tab-change'; tab: ProductsMenuTab }
  | { type: 'offer-open'; offerId: string }
  | { type: 'product-card-open'; cardId: ProductsCardId }
  | {
      type: 'product-detail-open'
      cardId: ProductsCardId
      optionId: string
      title: string
    }
  | { type: 'search-change'; query: string }
  | { type: 'category-change'; category: 'popular' | ShopSmartOfferCategory }
  | { type: 'focus-handled'; requestId: number }
  | { type: 'back' }
