import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import BottomNavigation from '@/app/components/BottomNavigation'
import { useLanguage } from '@/app/contexts/LanguageContext'
import type {
  ProductsCard,
  ProductsMenuTab,
  ProductsOffer,
  ShopSmartOfferCard,
  ShopSmartSummary,
} from '@/app/config/productsMenuConfig'
import type { NativeDemoRoute } from '@/features/demo-native/contracts'
import { getProductsMenuForCountry } from '@/app/config/productsMenuConfig'
import type { NativeProductDetailPresentation } from '@/features/demo-native/productDetailPresentation'
import type {
  NativeProductsPreview,
  NativeProductsPreviewAction,
} from '@/features/demo-native/productsPreviewContracts'

type TemplatePreviewProps = {
  route: NativeDemoRoute
  snapshot: { productsPreview: NativeProductsPreview }
  events: { onProductsPreviewAction?: (action: NativeProductsPreviewAction) => void }
}

function ProductsPreviewRegion({
  preview,
  onAction,
}: {
  preview: NativeProductsPreview
  onAction?: (action: NativeProductsPreviewAction) => void
}) {
  const props: TemplatePreviewProps = {
    route: { screen: 'products' },
    snapshot: { productsPreview: preview },
    events: { onProductsPreviewAction: onAction },
  }
  return <NativeScreenPreview {...props} onNavigate={() => true} />
}

export function TemplateProductsHeader({
  title,
  actions,
  gutterClassName,
  onContactsClick,
  onMessagesClick,
}: {
  title: string
  actions?: readonly unknown[]
  gutterClassName?: string
  onContactsClick?: () => void
  onMessagesClick?: () => void
}) {
  const gutter = Number(gutterClassName?.match(/px-\[(\d+(?:\.\d+)?)px\]/)?.[1] ?? 24)
  return (
    <ProductsPreviewRegion
      preview={{
        region: 'products-header',
        title,
        actionLayout: actions ? 'search' : 'default',
        gutter,
      }}
      onAction={(action) => {
        if (action.type !== 'header-action') return
        if (action.action === 'contacts') onContactsClick?.()
        if (action.action === 'messages') onMessagesClick?.()
      }}
    />
  )
}

export function TemplateProductsTabs({
  activeTab,
  bankingLabel,
  shopSmartLabel,
  onChange,
}: {
  activeTab: ProductsMenuTab
  bankingLabel: string
  shopSmartLabel: string
  onChange: (tab: ProductsMenuTab) => void
}) {
  return (
    <ProductsPreviewRegion
      preview={{ region: 'products-tabs', activeTab, bankingLabel, shopSmartLabel }}
      onAction={(action) => {
        if (action.type === 'tab-change') onChange(action.tab)
      }}
    />
  )
}

export function TemplateBankingContent({
  offersTitle,
  offers,
  productsTitle,
  products,
  otherSolutionsTitle,
  otherSolutions,
  onProductCardClick,
}: {
  offersTitle: string
  offers: readonly ProductsOffer[]
  productsTitle: string
  products: readonly ProductsCard[]
  otherSolutionsTitle: string
  otherSolutions: readonly ProductsCard[]
  onProductCardClick: (card: ProductsCard) => void
}) {
  const productById = new Map([...products, ...otherSolutions].map((card) => [card.id, card] as const))
  return (
    <ProductsPreviewRegion
      preview={{
        region: 'products-banking',
        offersTitle,
        offers,
        productsTitle,
        products,
        otherSolutionsTitle,
        otherSolutions,
      }}
      onAction={(action) => {
        if (action.type === 'product-card-open') {
          const card = productById.get(action.cardId)
          if (card) onProductCardClick(card)
        }
      }}
    />
  )
}

export function TemplateShopSmartContent({
  summary,
  offerCards,
}: {
  summary: ShopSmartSummary
  offerCards: readonly ShopSmartOfferCard[]
}) {
  return <ProductsPreviewRegion preview={{ region: 'products-shopsmart', summary, offerCards }} />
}

export function getTemplateProductsCardTranslationId(card: ProductsCard) {
  if (card.translationKey === null) return null
  if (card.translationKey) return card.translationKey

  const normalizedTitle = card.title.replace(/\n/g, ' ').toLowerCase()
  if (normalizedTitle === 'electronics') return 'electronics'
  if (normalizedTitle === 'travel') return 'travel'
  if (normalizedTitle === 'home and living') return 'home-living'
  if (normalizedTitle === 'fashion') return 'fashion'
  return card.id
}

export function TemplateProductsScreen({
  activeTab = 'banking',
  offersTitle,
  onProductCardClick = () => undefined,
}: {
  activeTab?: ProductsMenuTab
  offersTitle?: string
  onProductCardClick?: (card: ProductsCard) => void
}) {
  const menu = getProductsMenuForCountry('RO')
  const { t } = useLanguage()
  const localizeOffer = (offer: ProductsOffer) => ({
    ...offer,
    title: t(`runtime.productsMenu.offers.${offer.id}.title`, offer.title),
    description: t(`runtime.productsMenu.offers.${offer.id}.description`, offer.description),
  })
  const localizeCard = (card: ProductsCard) => {
    const translationId = getTemplateProductsCardTranslationId(card)
    return {
      ...card,
      title: translationId ? t(`runtime.productsMenu.cards.${translationId}`, card.title) : card.title,
    }
  }

  return (
    <div className="relative flex h-full w-full flex-col bg-[var(--uc-surface)] text-[var(--uc-text)]">
      <div className="h-[54px] flex-shrink-0 bg-[var(--uc-surface)]" />
      <TemplateProductsHeader title={t('runtime.productsMenu.title', menu.title)} />
      <TemplateProductsTabs
        activeTab={activeTab}
        bankingLabel={t('runtime.productsMenu.banking', menu.bankingTabLabel)}
        shopSmartLabel={t('runtime.productsMenu.shopSmart', menu.shopSmartTabLabel)}
        onChange={() => undefined}
      />
      <div className="relative z-0 flex-1 overflow-y-auto scrollbar-hide pb-[92px]">
        {activeTab === 'banking' ? (
          <TemplateBankingContent
            offersTitle={offersTitle ?? t('runtime.productsMenu.offersForYou', menu.offersTitle)}
            offers={menu.offers.map(localizeOffer)}
            productsTitle={menu.productsTitle ? t('runtime.productsMenu.ourProducts', menu.productsTitle) : ''}
            products={menu.products.map(localizeCard)}
            otherSolutionsTitle={t('runtime.productsMenu.otherSolutionsForYou', menu.otherSolutionsTitle)}
            otherSolutions={menu.otherSolutions.map(localizeCard)}
            onProductCardClick={onProductCardClick}
          />
        ) : (
          <TemplateShopSmartContent summary={menu.shopSmartSummary} offerCards={menu.shopSmartOfferCards} />
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center border-t border-[var(--uc-border-muted)] bg-[var(--uc-bottom-bar-bg)]">
        <BottomNavigation activeTab="products" />
      </div>
    </div>
  )
}

export function TemplateProductDetailPreview({
  onBack,
  onActionClick,
}: {
  onBack: () => void
  onActionClick?: () => void
}) {
  const presentation: NativeProductDetailPresentation = {
    title: 'Product name',
    cardId: 'account',
    optionId: 'current-account',
    actionLabel: 'Button',
    includeSafeArea: false,
  }
  const route: NativeDemoRoute = {
    screen: 'product-detail',
    params: { title: 'Product name', cardId: 'account', optionId: 'current-account' },
  }

  return (
    <NativeScreenPreview
      route={route}
      snapshot={{ productDetailPresentation: presentation }}
      events={{ onProductDetailAction: onActionClick }}
      onBack={onBack}
      onNavigate={() => true}
    />
  )
}
