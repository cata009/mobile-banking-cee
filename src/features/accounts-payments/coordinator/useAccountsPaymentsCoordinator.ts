import { useCallback, useEffect, useMemo, useState } from 'react'
import { getUnavailableProductRouteFallback } from '@/app/navigation/productRouteAvailability'
import { useCreditLimitOverrides } from '@/features/cards/credit-limit/useCreditLimitOverrides'
import { type CardTransactionMerchantEnrichment } from '@/app/screens/payments/DomesticPaymentFlowScreens'
import { isCreditCardProduct } from '@/app/chat/czChatOrchestration'
import type { AccountTransaction } from '@/data/accountDetails'
import type { FrequentBeneficiary } from '@/data/paymentsHub'
import { usePaymentFlow } from '@/hooks/usePaymentFlow'
import { useTransactionCategoryOverrides } from '@/hooks/useTransactionCategoryOverrides'
import type { CreditCard, Product } from '@/data/products'
import type { CoordinatorInput } from '@/app/coordinators/contracts'
export function useAccountsPaymentsCoordinator({
  demoState,
  navigation,
  categories,
  parsedDeepLink,
}: CoordinatorInput) {
  const { product, country, bankingScenario } = demoState
  const { currentRoute, navigateTo, navigateToAndReset } = navigation
  const [rememberedAccountId, setSelectedAccountId] = useState<string | null>(parsedDeepLink?.accountId ?? null)
  const [rememberedCardId, setSelectedCardId] = useState<string | null>(parsedDeepLink?.cardId ?? null)
  const [selectedTransaction, setSelectedTransaction] = useState<AccountTransaction | null>(null)
  const [selectedPaymentBeneficiary, setSelectedPaymentBeneficiary] = useState<FrequentBeneficiary | null>(null)
  const [selectedMerchantEnrichment, setSelectedMerchantEnrichment] = useState<
    CardTransactionMerchantEnrichment | undefined
  >()
  const { transactionCategoryOverrides, handleTransactionCategoryChange } = useTransactionCategoryOverrides({
    setSelectedTransaction,
  })
  const { creditLimitOverrides, creditLimitScopeKey, setCreditLimitOverride } = useCreditLimitOverrides({
    product,
    country,
    bankingScenario,
  })
  const [pendingCreditOffer, setPendingCreditOffer] = useState<{ cardId: string; scopeKey: string } | null>(null)
  const creditLimitOfferFlowCardId =
    pendingCreditOffer?.scopeKey === creditLimitScopeKey ? pendingCreditOffer.cardId : null
  const setCreditLimitOfferFlowCardId = useCallback(
    (cardId: string | null) => {
      setPendingCreditOffer(cardId ? { cardId, scopeKey: creditLimitScopeKey } : null)
    },
    [creditLimitScopeKey],
  )
  useEffect(() => {
    setPendingCreditOffer(null)
  }, [creditLimitScopeKey])
  const selectedAccountId =
    currentRoute.screen === 'transaction-detail' && currentRoute.source === 'card' && currentRoute.cardId
      ? currentRoute.cardId
      : 'accountId' in currentRoute && currentRoute.accountId
        ? currentRoute.accountId
        : rememberedAccountId
  const selectedCardId = 'cardId' in currentRoute && currentRoute.cardId ? currentRoute.cardId : rememberedCardId
  useEffect(() => {
    if ('cardId' in currentRoute && currentRoute.cardId) setSelectedCardId(currentRoute.cardId)
    if ('accountId' in currentRoute && currentRoute.accountId) setSelectedAccountId(currentRoute.accountId)
  }, [currentRoute])
  const accountProducts = useMemo(() => categories.flatMap((category) => category.products), [categories])

  useEffect(() => {
    const fallback = getUnavailableProductRouteFallback(
      currentRoute,
      new Set(accountProducts.map(({ id }) => id)),
      accountProducts.some(({ type }) => type === 'investment_account'),
    )
    if (!fallback) return
    setSelectedAccountId(null)
    setSelectedCardId(null)
    navigateToAndReset(fallback)
  }, [accountProducts, currentRoute, navigateToAndReset])
  const selectedAccountProduct =
    accountProducts.find((accountProduct) => accountProduct.id === selectedAccountId) ?? accountProducts[0] ?? null
  const {
    paymentDraft,
    paymentEntryId,
    paymentInitialStep,
    handleRedoPaymentClick,
    handleDomesticPaymentClick,
    handleBeneficiaryPaymentClick,
    handlePaymentTemplateSelect,
    handleDomesticPaymentNext,
    handlePaymentDraftChange,
    handlePaymentDone,
  } = usePaymentFlow({
    country,
    selectedAccountProduct,
    selectedTransaction,
    setSelectedTransaction,
  })
  const selectedCardProduct =
    accountProducts.find((cardProduct) => cardProduct.id === selectedCardId) ??
    accountProducts.find((cardProduct) => cardProduct.type === 'credit_card') ??
    null
  const selectedCreditCardForOpportunity = isCreditCardProduct(selectedCardProduct)
    ? selectedCardProduct
    : (accountProducts.find(isCreditCardProduct) ?? null)
  const creditCardForOpportunity =
    selectedCreditCardForOpportunity && creditLimitOverrides[selectedCreditCardForOpportunity.id] == null
      ? selectedCreditCardForOpportunity
      : null
  const hasMatchingCreditOfferTarget =
    currentRoute.screen === 'card-detail' && (currentRoute.cardId ?? selectedCardId) === creditLimitOfferFlowCardId
  const creditLimitOfferFlowCard = hasMatchingCreditOfferTarget
    ? accountProducts.find(
        (product): product is CreditCard => product.id === creditLimitOfferFlowCardId && isCreditCardProduct(product),
      )
    : undefined
  useEffect(() => {
    if (pendingCreditOffer && !creditLimitOfferFlowCard) setPendingCreditOffer(null)
  }, [pendingCreditOffer, creditLimitOfferFlowCard])

  const handleAccountClick = (product: Product) => {
    if (product.type === 'debit_card' || product.type === 'credit_card') {
      setSelectedCardId(product.id)
      navigateTo({ screen: 'card-detail', cardId: product.id })
      return
    }
    setSelectedAccountId(product.id)
    navigateTo({ screen: 'account-detail', accountId: product.id })
  }

  const handleAccountDetailsClick = (product: Product) => {
    setSelectedAccountId(product.id)
    navigateTo({ screen: 'account-details-info', accountId: product.id })
  }

  const handleAccountOptionsClick = () => {
    navigateTo({ screen: 'account-options', accountId: selectedAccountId })
  }

  const handleCardDetailsClick = (product: Product) => {
    if (product.type !== 'debit_card' && product.type !== 'credit_card') return
    setSelectedCardId(product.id)
    navigateTo({ screen: 'card-details-info', cardId: product.id })
  }

  const handleCardOptionsClick = (product: Product) => {
    if (product.type !== 'debit_card' && product.type !== 'credit_card') return
    setSelectedCardId(product.id)
    navigateTo({ screen: 'card-options', cardId: product.id })
  }

  const handleTransactionClick = (
    transaction: AccountTransaction,
    productForTransaction: Product,
    merchantEnrichment?: CardTransactionMerchantEnrichment,
  ) => {
    setSelectedAccountId(productForTransaction.id)
    setSelectedTransaction(transaction)
    setSelectedMerchantEnrichment(merchantEnrichment)
    const isCard = productForTransaction.type === 'credit_card' || productForTransaction.type === 'debit_card'
    navigateTo(
      isCard
        ? { screen: 'transaction-detail', source: 'card', cardId: productForTransaction.id }
        : { screen: 'transaction-detail', source: 'account', accountId: productForTransaction.id },
    )
  }

  const handleBeneficiaryTransactionClick = (transaction: AccountTransaction) => {
    const payerAccount = accountProducts.find(
      (productItem) => productItem.type === 'current_account' && productItem.currency === transaction.currency,
    )
    if (payerAccount) handleTransactionClick(transaction, payerAccount)
  }

  const handleApp2027TransactionClick = (
    transaction: AccountTransaction,
    productForTransaction: Product,
    merchantEnrichment?: CardTransactionMerchantEnrichment,
  ) => {
    setSelectedAccountId(productForTransaction.id)
    setSelectedTransaction(transaction)
    setSelectedMerchantEnrichment(merchantEnrichment)
    const isCard = productForTransaction.type === 'credit_card' || productForTransaction.type === 'debit_card'
    navigateTo(
      isCard
        ? { screen: 'transaction-detail', source: 'card', cardId: productForTransaction.id }
        : { screen: 'transaction-detail', source: 'account', accountId: productForTransaction.id },
    )
  }

  const selectBeneficiary = (beneficiary: FrequentBeneficiary | null) => setSelectedPaymentBeneficiary(beneficiary)
  const cancelCreditOffer = () => setCreditLimitOfferFlowCardId(null)
  const completeCreditOffer = (cardId: string, newLimit: number) => {
    setCreditLimitOverride(cardId, newLimit)
    setPendingCreditOffer((current) =>
      current?.scopeKey === creditLimitScopeKey && current.cardId === cardId ? null : current,
    )
  }
  const openCreditOffer = (cardId: string) => {
    if (!accountProducts.some((p) => p.id === cardId && isCreditCardProduct(p))) return
    setSelectedCardId(cardId)
    setCreditLimitOfferFlowCardId(cardId)
    navigateTo({ screen: 'card-detail', cardId })
  }
  const openOpportunityCard = (cardId?: string) => {
    if (cardId) setSelectedCardId(cardId)
    navigateTo(cardId ? { screen: 'card-detail', cardId } : 'card-detail')
  }
  return {
    view: {
      selectedAccountId,
      selectedCardId,
      selectedTransaction,
      selectedPaymentBeneficiary,
      selectedMerchantEnrichment,
      transactionCategoryOverrides,
      accountProducts,
      selectedAccountProduct,
      selectedCardProduct,
      creditCardForOpportunity,
      creditLimitOfferFlowCard,
      creditLimitOverrides,
      paymentDraft,
      paymentEntryId,
      paymentInitialStep,
    },
    actions: {
      handleAccountClick,
      handleAccountDetailsClick,
      handleAccountOptionsClick,
      handleCardDetailsClick,
      handleCardOptionsClick,
      handleTransactionClick,
      handleBeneficiaryTransactionClick,
      handleApp2027TransactionClick,
      handleTransactionCategoryChange,
      handleRedoPaymentClick,
      handleDomesticPaymentClick,
      handleBeneficiaryPaymentClick,
      handlePaymentTemplateSelect,
      handleDomesticPaymentNext,
      handlePaymentDraftChange,
      handlePaymentDone,
      selectBeneficiary,
      cancelCreditOffer,
      completeCreditOffer,
      openCreditOffer,
      openOpportunityCard,
    },
  }
}
