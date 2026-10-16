import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { serializeNativeTransactionVisual } from '@/app/components/demo/serializeNativeTransactionVisual'
import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import type { NativeScreenPreviewProps } from '@/app/components/demo/NativeScreenPreview'
import { getCardMerchantEnrichment } from '@/app/components/merchants/merchantEnrichment'
import { getCountryConfig } from '@/app/registry/countryConfig'
import { useDemo } from '@/app/state/demoStore'
import {
  getCardTransactions,
  type AccountTransaction,
} from '@/data/accountDetails'
import type { NativeDemoRoute } from '@/features/demo-native/contracts'
import type {
  NativeBankingPresentation,
  NativeTransactionLeadingVisual,
} from '@/features/demo-native/bankingPresentation'
import { useProducts } from '@/hooks/useProducts'
import type { CreditCard, DebitCard, Product } from '@/data/products'
import type { CardTransactionMerchantEnrichment } from '@/app/screens/payments/DomesticPaymentFlowScreens'

interface CardDetailScreenProps {
  selectedCardId?: string | null
  creditLimitOverrides?: Readonly<Record<string, number>>
  onBack: () => void
  onCardDetailsClick?: (card: Product) => void
  /** Flow previews can intercept the action while baseline app behavior stays Face ID gated. */
  onShowCardDetailsRequest?: (card: Product) => void
  onShowCardDetailsClick?: (card: Product) => void
  /** Reports the selected carousel card to a host that routes to another preview screen. */
  onActiveCardChange?: (card: Product) => void
  onCardOptionsClick?: (card: Product) => void
  onTransactionClick?: (
    transaction: AccountTransaction,
    product: Product,
    merchantEnrichment?: CardTransactionMerchantEnrichment,
  ) => void
  onHelpClick?: () => void
  aiOpportunityNudge?: {
    title: string
    body: string
    ctaLabel: string
  } | null
  onAiOpportunityClick?: () => void
  /** Optional presentation-only overrides used by Flow Library specifications. */
  transactionRowPresentation?: {
    displayLabel?: (transaction: AccountTransaction) => string | undefined
    leadingVisual?: (transaction: AccountTransaction) => ReactNode | undefined
    nativeLeadingVisual?: (transaction: AccountTransaction) => NativeTransactionLeadingVisual | undefined
    transactionFilter?: (transaction: AccountTransaction) => boolean
  }
}
export function CollapsingCardHeader({
  progress,
  onBack,
  onHelpClick,
}: {
  progress: number
  onBack: () => void
  onHelpClick?: () => void
}) {
  return (
    <NativeScreenPreview
      route={{ screen: 'card' }}
      snapshot={{
        componentPreview: {
          kind: 'detail-header',
          variant: 'card',
          title: 'Cards',
          progress,
        },
      }}
      events={onHelpClick ? { onHelpRequest: onHelpClick } : undefined}
      onNavigate={(_route, action) => action === 'push'}
      onBack={onBack}
    />
  )
}
function isCardProduct(product: Product): product is DebitCard | CreditCard {
  return product.type === 'debit_card' || product.type === 'credit_card'
}

type CardTransactionRowPresentation =
  NonNullable<CardDetailScreenProps['transactionRowPresentation']>
function createNativeRows(
  transactions: readonly AccountTransaction[],
  presentation: CardTransactionRowPresentation,
): NonNullable<NativeBankingPresentation['rows']> {
  const visible = presentation.transactionFilter
    ? transactions.filter(presentation.transactionFilter)
    : transactions
  return visible.map(transaction => {
    const displayLabel = presentation.displayLabel?.(transaction)
    const leadingVisual =
      presentation.nativeLeadingVisual?.(transaction) ??
      serializeNativeTransactionVisual(presentation.leadingVisual?.(transaction), transaction)
    return {
      transaction,
      ...(displayLabel === undefined ? {} : { displayLabel }),
      ...(leadingVisual === undefined ? {} : { leadingVisual }),
    }
  })
}

export default function CardDetailScreen(props: CardDetailScreenProps) {
  const {
    selectedCardId,
    creditLimitOverrides = {},
    onBack,
    onCardDetailsClick,
    onShowCardDetailsRequest,
    onShowCardDetailsClick,
    onActiveCardChange,
    onCardOptionsClick,
    onTransactionClick,
    onHelpClick,
    aiOpportunityNudge,
    onAiOpportunityClick,
    transactionRowPresentation,
  } = props
  const { country } = useDemo()
  const { categories } = useProducts()
  const products = useMemo(
    () => categories.flatMap(category => category.products),
    [categories],
  )
  const cards = useMemo(
    () => products.filter(isCardProduct),
    [products],
  )
  const productById = useMemo(
    () => new Map(products.map(product => [product.id, product] as const)),
    [products],
  )
  const [activeCardId, setActiveCardId] = useState(selectedCardId)
  useEffect(() => setActiveCardId(selectedCardId), [selectedCardId])
  const activeCard =
    cards.find(card => card.id === activeCardId) ?? cards[0]
  const currentAccounts = products.filter(
    (product): product is Extract<Product, { type: 'current_account' }> =>
      product.type === 'current_account',
  )
  const linkedAccountIndex =
    activeCard?.type === 'debit_card'
      ? Math.max(
          0,
          currentAccounts.findIndex(
            account => account.id === activeCard.linkedAccountId,
          ),
        )
      : 0
  const sourceTransactions = useMemo(
    () =>
      activeCard
        ? getCardTransactions(
            country,
            activeCard,
            getCountryConfig(country).currency,
            linkedAccountIndex,
          )
        : [],
    [activeCard, country, linkedAccountIndex],
  )
  const sourceRows = useMemo(
    () =>
      transactionRowPresentation && activeCard
        ? createNativeRows(sourceTransactions, transactionRowPresentation)
        : undefined,
    [activeCard, sourceTransactions, transactionRowPresentation],
  )
  const bankingPresentation = useMemo<NativeBankingPresentation>(
    () => ({
      productCategories: categories,
      ...(activeCard ? { productId: activeCard.id } : {}),
      ...(sourceRows === undefined ? {} : { rows: sourceRows }),
      ...(aiOpportunityNudge === undefined ? {} : { aiOpportunityNudge }),
    }),
    [categories, activeCard, aiOpportunityNudge, sourceRows],
  )
  const events = useMemo<NativeScreenPreviewProps['events']>(() => {
    const next: NonNullable<NativeScreenPreviewProps['events']> = {}
    next.onActiveCardChange = productId => {
      setActiveCardId(productId)
      const product = productById.get(productId)
      if (product && isCardProduct(product)) onActiveCardChange?.(product)
    }
    if (onTransactionClick) {
      next.onTransactionSelected = selection => {
        const product = productById.get(selection.productId)
        if (!product || !isCardProduct(product)) return
        onTransactionClick(
          selection.transaction,
          product,
          getCardMerchantEnrichment(selection.transaction, country),
        )
      }
    }
    if (onShowCardDetailsRequest) {
      next.onShowCardDetailsRequest = productId => {
        const product = productById.get(productId)
        if (product && isCardProduct(product))
          onShowCardDetailsRequest(product)
      }
    }
    if (onShowCardDetailsClick) {
      next.onShowCardDetails = productId => {
        const product = productById.get(productId)
        if (product && isCardProduct(product))
          onShowCardDetailsClick(product)
      }
    }
    if (onAiOpportunityClick)
      next.onAiOpportunityClick = onAiOpportunityClick
    if (onHelpClick) next.onHelpRequest = onHelpClick
    return next
  }, [
    country,
    onActiveCardChange,
    onAiOpportunityClick,
    onHelpClick,
    onShowCardDetailsClick,
    onShowCardDetailsRequest,
    onTransactionClick,
    productById,
  ])
  const onNavigate = (route: NativeDemoRoute, action: 'push' | 'back') => {
    if (action !== 'push') return false
    const productId = route.params?.productId ?? route.params?.cardId
    const product = productId ? productById.get(productId) : undefined
    if (!product || !isCardProduct(product)) return false
    if (route.screen === 'card-info' && onCardDetailsClick) {
      onCardDetailsClick(product)
      return true
    }
    if (route.screen === 'card-options' && onCardOptionsClick) {
      onCardOptionsClick(product)
      return true
    }
    return false
  }

  return (
    <NativeScreenPreview
      route={{
        screen: 'card',
        params: selectedCardId
          ? { productId: selectedCardId, cardId: selectedCardId }
          : undefined,
      }}
      snapshot={{ creditLimitOverrides, bankingPresentation }}
      events={events}
      onNavigate={onNavigate}
      onBack={onBack}
    />
  )
}

