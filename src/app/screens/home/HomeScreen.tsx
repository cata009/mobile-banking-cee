import { useMemo } from 'react'
import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import { useDemo, useProductData } from '@/app/state/demoStore'
import { deriveProductCategories } from '@/features/products/selectors'
import type { NativeDemoRoute } from '@/features/demo-native/contracts'
import type { NativeTransactionPayload } from '@/features/demo-native/transactionIntents'
import SmeHomeScreen from './SmeHomeScreen'
import type { HomeScreenProps } from './SmeHomeScreen'

export type { HomeScreenProps } from './SmeHomeScreen'

export default function HomeScreen(props: HomeScreenProps) {
  const { product } = useDemo()
  const productData = useProductData()
  const productsById = useMemo(() => {
    const categories = deriveProductCategories({
      country: productData.country,
      release: productData.release,
      resolvedProductCounts: productData.resolvedProductCounts,
    })
    return new Map(categories.flatMap((category) => category.products.map((item) => [item.id, item] as const)))
  }, [productData])

  if (product === 'SME') return <SmeHomeScreen {...props} />

  const onNavigate = (route: NativeDemoRoute, action: 'push' | 'back') => {
    if (action === 'back') return true

    const productId = route.params?.productId ?? route.params?.accountId ?? route.params?.cardId
    const selectedProduct = productId ? productsById.get(productId) : undefined

    switch (route.screen) {
      case 'prime':
        props.onPrimeClick?.()
        break
      case 'pfm':
        props.onAnalyticsClick?.()
        break
      case 'transactions':
        props.onSeeAllTransactionsClick?.()
        break
      case 'messages':
        props.onMessagesClick?.()
        break
      case 'payments':
        props.onPaymentsClick?.()
        break
      case 'payment-create':
        props.onDomesticPaymentClick?.()
        break
      case 'products':
        props.onProductsClick?.()
        break
      case 'profile':
        props.onMoreClick?.()
        break
      case 'account':
        if (selectedProduct) props.onAccountClick?.(selectedProduct)
        break
      case 'account-info':
        if (selectedProduct) props.onAccountInfoClick?.(selectedProduct)
        break
      case 'card':
      case 'card-info':
        if (selectedProduct) props.onCardDetailsClick?.(selectedProduct)
        break
      case 'card-options':
        if (selectedProduct) props.onCardOptionsClick?.(selectedProduct)
        break
      case 'investments':
        if (route.params?.entry === 'goals' || route.params?.view === 'goals') props.onInvestmentGoalsClick?.()
        else props.onInvestmentsClick?.()
        break
      case 'smart-investment':
        props.onSmartInvestmentOpen?.()
        break
      case 'product-detail':
        if (route.params?.itemId) props.onOfferOpen?.(route.params.itemId)
        break
      default:
        break
    }

    // Source-owned callbacks that were not supplied are intentionally inert.
    // Never let this adapter fall back to Native's local route stack.
    return true
  }

  const onTransactionSelected = (selection: NativeTransactionPayload) => {
    const selectedProduct = productsById.get(selection.productId)
    if (selectedProduct) props.onTransactionClick?.(selection.transaction, selectedProduct)
  }

  return (
    <NativeScreenPreview
      route={{ screen: 'home' }}
      onNavigate={onNavigate}
      events={{
        onPaymentEntryRequest: (route) => {
          if (route.screen === 'payment-create') props.onDomesticPaymentClick?.()
        },
        onTransactionSelected,
      }}
    />
  )
}
