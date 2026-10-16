import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { serializeNativeTransactionVisual } from '@/app/components/demo/serializeNativeTransactionVisual'
import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import type { NativeScreenPreviewProps } from '@/app/components/demo/NativeScreenPreview'
import { getCardMerchantEnrichment } from '@/app/components/merchants/merchantEnrichment'
import { getCountryConfig } from '@/app/registry/countryConfig'
import { useDemo } from '@/app/state/demoStore'
import {
  getAccountTransactionProfileIndex,
  getAccountTransactions,
  type AccountTransaction,
} from '@/data/accountDetails'
import type { PfmCategorySelection } from '@/data/pfmCategories'
import type { NativeDemoRoute } from '@/features/demo-native/contracts'
import type {
  NativeBankingPresentation,
  NativeTransactionLeadingVisual,
} from '@/features/demo-native/bankingPresentation'
import { getApp2027ActivityTransactions } from '@/features/products/evoAccountActivity'
import { useProducts } from '@/hooks/useProducts'
import { isAccountDetailProduct, type Product } from '@/data/products'
import type { CardTransactionMerchantEnrichment } from '@/app/screens/payments/DomesticPaymentFlowScreens'

interface AccountDetailScreenProps {
  selectedProductId?: string | null;
  onBack: () => void;
  onDetailsClick: (product: Product) => void;
  onOptionsClick: () => void;
  onTransactionClick?: (
    transaction: AccountTransaction,
    product: Product,
    merchantEnrichment?: CardTransactionMerchantEnrichment,
  ) => void;
  transactionCategoryOverrides?: Readonly<Record<string, PfmCategorySelection>>;
  onTransactionCategoryChange?: (transaction: AccountTransaction, selection: PfmCategorySelection) => void;
  onOpenSpending?: () => void;
  onOpenIncome?: () => void;
  onOpenExpenses?: () => void;
  onHelpClick?: () => void;
  /** Optional presentation-only overrides used by Flow Library specifications. */
  transactionRowPresentation?: {
    displayLabel?: (transaction: AccountTransaction) => string | undefined;
    leadingVisual?: (transaction: AccountTransaction) => ReactNode | undefined;
    nativeLeadingVisual?: (transaction: AccountTransaction) => NativeTransactionLeadingVisual | undefined;
    transactionFilter?: (transaction: AccountTransaction) => boolean;
  };
}
export function CollapsingAccountHeader({
  title,
  progress,
  onBack,
  onHelpClick,
}: {
  title: string
  progress: number
  onBack: () => void
  onHelpClick?: () => void
}) {
  return (
    <NativeScreenPreview
      route={{ screen: 'account' }}
      snapshot={{
        componentPreview: {
          kind: 'detail-header',
          variant: 'account',
          title,
          progress,
        },
      }}
      events={onHelpClick ? { onHelpRequest: onHelpClick } : undefined}
      onNavigate={(_route, action) => action === 'push'}
      onBack={onBack}
    />
  )
}
type AccountTransactionRowPresentation =
  NonNullable<AccountDetailScreenProps['transactionRowPresentation']>
function createNativeRows(
  transactions: readonly AccountTransaction[],
  presentation: AccountTransactionRowPresentation,
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

export default function AccountDetailScreen({
  selectedProductId,
  onBack,
  onDetailsClick,
  onOptionsClick,
  onTransactionClick,
  transactionCategoryOverrides = {},
  onTransactionCategoryChange,
  onOpenSpending,
  onOpenIncome,
  onOpenExpenses,
  onHelpClick,
  transactionRowPresentation,
}: AccountDetailScreenProps) {
  const { country, release } = useDemo()
  const { categories } = useProducts()
  const products = useMemo(
    () => categories.flatMap(category => category.products),
    [categories],
  )
  const accountProducts = useMemo(
    () => products.filter(isAccountDetailProduct),
    [products],
  )
  const productById = useMemo(
    () => new Map(products.map(product => [product.id, product] as const)),
    [products],
  )
  const selectedIndex = Math.max(
    0,
    accountProducts.findIndex(product => product.id === selectedProductId),
  )
  const activeProduct = accountProducts[selectedIndex]
  const transactionProfileIndex = activeProduct
    ? getAccountTransactionProfileIndex(activeProduct, selectedIndex)
    : 0
  const sourceTransactions = useMemo(() => {
    if (!activeProduct) return []
    let transactions = getAccountTransactions(
      country,
      transactionProfileIndex,
      getCountryConfig(country).currency,
    )
    const usesApp2027CzLedger =
      release === 'release-future-evo-2027' &&
      country === 'CZ' &&
      activeProduct.type === 'current_account' &&
      transactionProfileIndex === 0
    if (usesApp2027CzLedger) {
      const activityTransactions = getApp2027ActivityTransactions(country)
      const activityLabels = new Set(activityTransactions.map(transaction => transaction.label))
      transactions = [
        ...activityTransactions,
        ...transactions.filter(
          transaction => transaction.status === 'Booked' && !activityLabels.has(transaction.label),
        ),
      ]
    }
    return transactions.map(transaction => {
      const override = transactionCategoryOverrides[transaction.id]
      return override
        ? {
            ...transaction,
            category: override.groupLabel,
            pfmCategory: override.category,
            pfmSubcategory: override.subcategory,
          }
        : transaction
    })
  }, [
    activeProduct,
    country,
    release,
    transactionCategoryOverrides,
    transactionProfileIndex,
  ])
  const sourceRows = useMemo(
    () =>
      transactionRowPresentation
        ? createNativeRows(sourceTransactions, transactionRowPresentation)
        : undefined,
    [sourceTransactions, transactionRowPresentation],
  )
  const bankingPresentation = useMemo<NativeBankingPresentation>(
    () => ({
      productCategories: categories,
      ...(activeProduct ? { productId: activeProduct.id } : {}),
      ...(sourceRows === undefined ? {} : { rows: sourceRows }),
      transactionCategoryOverrides,
    }),
    [categories, activeProduct, sourceRows, transactionCategoryOverrides],
  )
  const events = useMemo<NativeScreenPreviewProps['events']>(() => {
    const next: NonNullable<NativeScreenPreviewProps['events']> = {}
    if (onTransactionClick) {
      next.onTransactionSelected = selection => {
        const product = productById.get(selection.productId)
        if (!product) return
        onTransactionClick(
          selection.transaction,
          product,
          getCardMerchantEnrichment(selection.transaction, country),
        )
      }
    }
    if (onTransactionCategoryChange)
      next.onTransactionCategoryChange = onTransactionCategoryChange
    if (onHelpClick) next.onHelpRequest = onHelpClick
    return Object.keys(next).length ? next : undefined
  }, [
    country,
    onHelpClick,
    onTransactionCategoryChange,
    onTransactionClick,
    productById,
  ])
  const onNavigate = (route: NativeDemoRoute, action: 'push' | 'back') => {
    if (action !== 'push') return false
    const productId = route.params?.productId ?? route.params?.accountId ?? route.params?.scopeId
    const product = productId ? productById.get(productId) : undefined
    if (!product || !isAccountDetailProduct(product)) return false
    if (route.screen === 'account-info') {
      onDetailsClick(product)
      return true
    }
    if (route.screen === 'account-options') {
      onOptionsClick()
      return true
    }
    if (route.screen === 'pfm') {
      const direction = route.params?.direction
      if (direction === 'income' && onOpenIncome) {
        onOpenIncome()
        return true
      }
      if (direction === 'expense' && onOpenExpenses) {
        onOpenExpenses()
        return true
      }
      if (!direction && onOpenSpending) {
        onOpenSpending()
        return true
      }
    }
    return false
  }

  return (
    <NativeScreenPreview
      route={{
        screen: 'account',
        params: selectedProductId
          ? { productId: selectedProductId, accountId: selectedProductId }
          : undefined,
      }}
      snapshot={{ bankingPresentation }}
      events={events}
      onNavigate={onNavigate}
      onBack={onBack}
    />
  )
}

