import { useEffect, useState } from 'react'
import { type ProductsShelfFocusRequest } from '@/app/chat/czChatOrchestration'
import type { ProductDetailSelection } from '@/app/components/products/ProductCardBottomSheet'
import { buildShelfProductSelection } from '@/app/config/productsShelfConfig'
import type { CoordinatorInput } from '@/app/coordinators/contracts'
export function useProductsCoordinator({ navigation }: Pick<CoordinatorInput, 'navigation'>) {
  const { currentRoute, navigateTo } = navigation
  const [productsShelfFocusRequest, setProductsShelfFocusRequest] = useState<ProductsShelfFocusRequest | null>(null)
  const [productsShelfHeroCollapsed, setProductsShelfHeroCollapsed] = useState(false)
  const [selectedProductDetail, setSelectedProductDetail] = useState<ProductDetailSelection | null>(null)

  useEffect(() => {
    if (currentRoute.screen === 'product-detail' && currentRoute.selection !== undefined)
      setSelectedProductDetail(currentRoute.selection)
  }, [currentRoute])
  const handleProductsClick = () => navigateTo('products')
  const handleProductDetailOpen = (selection: ProductDetailSelection) => {
    setSelectedProductDetail(selection)
    navigateTo({ screen: 'product-detail', selection })
  }

  /**
   * A Home campaign opening the product it advertises.
   *
   * Every campaign card and every ShopSmart offer used to call
   * `handleProductsClick` and drop the customer at the top of the Offers shelf,
   * where they had to re-find what they had just tapped. Falls back to the shelf
   * only when the id does not resolve.
   */
  const handleOfferOpen = (shelfItemId: string) => {
    const selection = buildShelfProductSelection(shelfItemId)
    if (!selection) {
      handleProductsClick()
      return
    }
    handleProductDetailOpen(selection)
  }

  const focusShelf = (cardId: ProductsShelfFocusRequest['cardId']) => {
    setProductsShelfFocusRequest({ requestId: Date.now(), cardId })
    navigateTo('products')
  }
  const focusHandled = () => setProductsShelfFocusRequest(null)
  const heroCollapsedChanged = (collapsed: boolean) => setProductsShelfHeroCollapsed(collapsed)
  return {
    view: {
      productsShelfFocusRequest,
      productsShelfHeroCollapsed,
      selectedProductDetail:
        currentRoute.screen === 'product-detail' && currentRoute.selection !== undefined
          ? currentRoute.selection
          : selectedProductDetail,
    },
    actions: {
      handleProductsClick,
      handleProductDetailOpen,
      handleOfferOpen,
      focusShelf,
      focusHandled,
      heroCollapsedChanged,
    },
  }
}
