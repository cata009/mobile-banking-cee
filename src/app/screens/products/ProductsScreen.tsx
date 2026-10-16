import { useRef, type ComponentProps } from 'react'
import { NativeScreenPreview, type NativeScreenPreviewProps } from '@/app/components/demo/NativeScreenPreview'
import { ProductsHeader as SourceProductsHeader } from '@/app/screens/products/ProductsHeader'
import { useDemo } from '@/app/state/demoStore'
import { getProductCardSheetConfig, getProductsMenuForCountry } from '@/app/config/productsMenuConfig'
import type { NativeDemoRoute } from '@/features/demo-native/contracts'
import type {
  NativeProductsPreview,
  NativeProductsPreviewAction,
} from '@/features/demo-native/productsPreviewContracts'
import SmeProductsScreen, {
  BankingContent as SmeBankingContent,
  getProductsCardTranslationId,
  OffersRail,
  ProductsTabs as SmeProductsTabs,
  SectionHeading,
  ShopSmartContent as SmeShopSmartContent,
} from './SmeProductsScreen'
import type { ProductDetailSelection } from './SmeProductsScreen'

export type { ProductDetailSelection }
export type { ProductsShelfFocusRequest } from '@/features/products/shelfFocus'
export type ProductsScreenProps = ComponentProps<typeof SmeProductsScreen>
export { SectionHeading, OffersRail, getProductsCardTranslationId }

type PreviewProps = Pick<NativeScreenPreviewProps, 'route' | 'snapshot' | 'events'>

function ProductsPreviewRegion({
  preview,
  onAction,
}: {
  preview: NativeProductsPreview
  onAction?: (action: NativeProductsPreviewAction) => void
}) {
  const props: PreviewProps = {
    route: { screen: 'products' },
    snapshot: { productsPreview: preview },
    events: { onProductsPreviewAction: onAction },
  }
  return <NativeScreenPreview {...props} onNavigate={() => true} />
}

type ProductsHeaderProps = ComponentProps<typeof SourceProductsHeader>

export function ProductsHeader(props: ProductsHeaderProps) {
  const { product } = useDemo()
  if (product === 'SME') return <SourceProductsHeader {...props} />

  const gutter = Number(props.gutterClassName?.match(/px-\[(\d+(?:\.\d+)?)px\]/)?.[1] ?? 24)
  const preview: NativeProductsPreview = {
    region: 'products-header',
    title: props.title,
    actionLayout: props.actions ? 'search' : 'default',
    gutter,
  }
  return (
    <ProductsPreviewRegion
      preview={preview}
      onAction={(action) => {
        if (action.type !== 'header-action') return
        if (action.action === 'contacts') props.onContactsClick?.()
        if (action.action === 'messages') props.onMessagesClick?.()
      }}
    />
  )
}

type ProductsTabsProps = ComponentProps<typeof SmeProductsTabs>

export function ProductsTabs(props: ProductsTabsProps) {
  const { product } = useDemo()
  if (product === 'SME') return <SmeProductsTabs {...props} />

  return (
    <ProductsPreviewRegion
      preview={{
        region: 'products-tabs',
        activeTab: props.activeTab,
        bankingLabel: props.bankingLabel,
        shopSmartLabel: props.shopSmartLabel,
      }}
      onAction={(action) => {
        if (action.type === 'tab-change') props.onChange(action.tab)
      }}
    />
  )
}

type BankingContentProps = ComponentProps<typeof SmeBankingContent>

export function BankingContent(props: BankingContentProps) {
  const { product } = useDemo()
  if (product === 'SME') return <SmeBankingContent {...props} />

  const products = [...props.products, ...props.otherSolutions]
  const productById = new Map(products.map((card) => [card.id, card] as const))
  const preview: NativeProductsPreview = {
    region: 'products-banking',
    offersTitle: props.offersTitle,
    offers: props.offers,
    showOffersDots: props.showOffersDots,
    productsTitle: props.productsTitle,
    products: props.products,
    offersHeadingVariant: props.offersHeadingVariant,
    otherSolutionsTitle: props.otherSolutionsTitle,
    otherSolutions: props.otherSolutions,
  }
  return (
    <ProductsPreviewRegion
      preview={preview}
      onAction={(action) => {
        if (action.type === 'offer-open') {
          const offer = props.offers.find((item) => item.id === action.offerId)
          if (offer) props.onOfferClick?.(offer)
        } else if (action.type === 'product-card-open') {
          const card = productById.get(action.cardId)
          if (card) props.onProductCardClick(card)
        }
      }}
    />
  )
}

type ShopSmartContentProps = ComponentProps<typeof SmeShopSmartContent>

export function ShopSmartContent(props: ShopSmartContentProps) {
  const { product } = useDemo()
  if (product === 'SME') return <SmeShopSmartContent {...props} />

  const preview: NativeProductsPreview = {
    region: 'products-shopsmart',
    summary: props.summary,
    offerCards: props.offerCards,
    stickySearchTop: props.stickySearchTop,
    searchSurface: props.searchSurface,
    showSummary: props.showSummary,
  }
  return <ProductsPreviewRegion preview={preview} />
}

function readProductDetailSelection(
  route: NativeDemoRoute,
  country: ReturnType<typeof useDemo>['country'],
): ProductDetailSelection | null {
  const cardId = route.params?.cardId
  const optionId = route.params?.optionId
  const title = route.params?.title
  if (!cardId || !optionId || !title) return null

  const menu = getProductsMenuForCountry(country)
  const card = [...menu.products, ...menu.otherSolutions].find((item) => item.id === cardId)
  if (!card) return null

  const sheet = getProductCardSheetConfig(card.id, country)
  return {
    cardId: card.id,
    categoryTitle: sheet.title ?? card.title.replace(/\n/g, ' '),
    optionId,
    title,
    ...(route.params?.heroImage ? { heroImage: route.params.heroImage } : {}),
    ...(route.params?.heroImagePosition ? { heroImagePosition: route.params.heroImagePosition } : {}),
    ...(route.params?.headline ? { headline: route.params.headline } : {}),
    ...(route.params?.intro ? { intro: route.params.intro } : {}),
  }
}

export default function ProductsScreen(props: ProductsScreenProps) {
  const demo = useDemo()
  const focusRequestRef = useRef({
    request: props.productsShelfFocusRequest,
    onHandled: props.onProductsShelfFocusHandled,
  })
  if (focusRequestRef.current.request?.requestId !== props.productsShelfFocusRequest?.requestId) {
    focusRequestRef.current = {
      request: props.productsShelfFocusRequest,
      onHandled: props.onProductsShelfFocusHandled,
    }
  }
  if (demo.product === 'SME') return <SmeProductsScreen {...props} />

  const { request, onHandled } = focusRequestRef.current
  const route: NativeDemoRoute = {
    screen: 'products',
    ...(request?.cardId ? { params: { focus: request.cardId, focusRequestId: String(request.requestId) } } : {}),
  }
  const onNavigate = (nextRoute: NativeDemoRoute, action: 'push' | 'back') => {
    if (action === 'back') return true

    switch (nextRoute.screen) {
      case 'home':
        props.onHomeClick?.()
        break
      case 'pfm':
        props.onAnalyticsClick?.()
        break
      case 'contacts':
        props.onContactsClick?.()
        break
      case 'messages':
        props.onMessagesClick?.()
        break
      case 'payments':
        props.onPaymentsClick?.()
        break
      case 'investments':
        props.onInvestmentsClick?.()
        break
      case 'smart-investment':
        props.onSmartInvestmentOpen?.()
        break
      case 'peer-insights':
        props.onFutureGainPeerInsightsOpen?.()
        break
      case 'profile':
        props.onMoreClick?.()
        break
      case 'product-detail': {
        const selection = readProductDetailSelection(nextRoute, demo.country)
        if (selection) props.onProductDetailOpen?.(selection)
        break
      }
      default:
        break
    }

    return true
  }

  return (
    <div className="relative h-full w-full bg-[var(--uc-app-bg)] text-[var(--uc-text)]">
      <NativeScreenPreview
        route={route}
        snapshot={{ productsShelfFocusRequest: request }}
        onNavigate={onNavigate}
        events={{
          onProductsShelfFocusHandled: onHandled,
          onProductsShelfHeroCollapsedChange: props.onShelfHeroCollapsedChange,
        }}
      />
    </div>
  )
}
