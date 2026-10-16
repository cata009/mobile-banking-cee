import { useMemo } from 'react'
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
import type { NativeBankingPresentation } from '@/features/demo-native/bankingPresentation'
import type { NativeTransactionPayload } from '@/features/demo-native/transactionIntents'
import { useProducts } from '@/hooks/useProducts'
import type { CurrentAccount, Product } from '@/data/products'
import type { CardTransactionMerchantEnrichment } from '@/app/screens/payments/DomesticPaymentFlowScreens'

interface TransactionsScreenProps {
  onBack: () => void;
  onTransactionClick?: (
    transaction: AccountTransaction,
    product: Product,
    merchantEnrichment?: CardTransactionMerchantEnrichment,
  ) => void;
  transactionCategoryOverrides?: Readonly<Record<string, PfmCategorySelection>>;
}
export default function TransactionsScreen({
  onBack,
  onTransactionClick,
  transactionCategoryOverrides = {},
}: TransactionsScreenProps) {
  const { country } = useDemo()
  const { categories } = useProducts()
  const products = useMemo(
    () => categories.flatMap(category => category.products),
    [categories],
  )
  const currentAccounts = useMemo(
    () =>
      products.filter(
        (product): product is CurrentAccount =>
          product.type === 'current_account',
      ),
    [products],
  )
  const productById = useMemo(
    () => new Map(products.map(product => [product.id, product] as const)),
    [products],
  )
  const bankingPresentation = useMemo<NativeBankingPresentation>(() => {
    const rows: NonNullable<NativeBankingPresentation['rows']>[number][] = []
    const currency = getCountryConfig(country).currency
    currentAccounts.forEach((account, accountIndex) => {
      const profileIndex = getAccountTransactionProfileIndex(account, accountIndex)
      for (const transaction of getAccountTransactions(
        country,
        profileIndex,
        currency,
      )) {
        const override = transactionCategoryOverrides[transaction.id]
        const resolved = override
          ? {
              ...transaction,
              category: override.groupLabel,
              pfmCategory: override.category,
              pfmSubcategory: override.subcategory,
            }
          : transaction
        rows.push({
          transaction: {
            ...resolved,
            id: account.id + '-' + resolved.id,
          },
        })
      }
    })
    return { productCategories: categories, rows, transactionCategoryOverrides }
  }, [categories, country, currentAccounts, transactionCategoryOverrides])
  const events = useMemo<NativeScreenPreviewProps['events']>(() => {
    if (!onTransactionClick) return undefined
    return {
      onTransactionSelected: (selection: NativeTransactionPayload) => {
        const product = productById.get(selection.productId)
        if (!product) return
        onTransactionClick(
          selection.transaction,
          product,
          getCardMerchantEnrichment(selection.transaction, country),
        )
      },
    }
  }, [country, onTransactionClick, productById])

  return (
    <NativeScreenPreview
      route={{ screen: 'transactions' }}
      snapshot={{ bankingPresentation }}
      events={events}
      onBack={onBack}
    />
  )
}

