import type { ReactNode } from 'react'
import AccountDetailScreen from '@/app/screens/accounts/AccountDetailScreen'
import CardDetailScreen from '@/app/screens/cards/CardDetailScreen'
import { TransactionDetailScreen } from '@/app/screens/payments/DomesticPaymentFlowScreens'
import { DemoProvider } from '@/app/state/demoStore'
import { getAccountTransactions, type AccountTransaction } from '@/data/accountDetails'
import { mockProducts, type CurrentAccount, type DebitCard } from '@/data/products'
import type { NativeTransactionLeadingVisual } from '@/features/demo-native/bankingPresentation'
import type { EthocaScreenKind } from '@/app/screens/flow-library/flows/types'
import { noop } from '@/flows/shared/previewPrimitives'
const ETHOCA_DEBIT_CARD = mockProducts.find((product): product is DebitCard => product.type === 'debit_card')!
const ETHOCA_CURRENT_ACCOUNT = mockProducts.find(
  (product): product is CurrentAccount => product.type === 'current_account',
)!
const ETHOCA_RO_TRANSACTIONS = getAccountTransactions('RO', 0, 'RON')

function demoTransaction(label: string, status?: AccountTransaction['status']): AccountTransaction {
  const transaction = ETHOCA_RO_TRANSACTIONS.find(
    (candidate) => candidate.label === label && candidate.source === 'card' && (!status || candidate.status === status),
  )
  if (!transaction) throw new Error(`ETHOCA Flow fixture is missing the ${label} card transaction.`)
  return transaction
}

type EthocaMerchantId = 'youtube' | 'carrefour' | 'emag'

function merchantVisual(merchant: EthocaMerchantId, size: 32 | 64 = 32): NativeTransactionLeadingVisual {
  return { kind: 'merchant-logo', merchant, size }
}

function pfmVisual(transaction: AccountTransaction): NativeTransactionLeadingVisual {
  return {
    kind: 'pfm',
    category: transaction.pfmCategory,
    variant: 'category-circle',
    size: 32,
  }
}

/**
 * Flow Library screens are fixed RO fixtures.  They must not inherit the
 * product/country selected in the host demo URL (for example Kids HU), because
 * the fixture's merchant filters and its ledger data are intentionally RO.
 */
function EthocaRoFixture({ children }: { children: ReactNode }) {
  return (
    <DemoProvider
      initialState={{
        product: 'PI',
        country: 'RO',
        bankingScenario: 'retail-single-account',
      }}
    >
      {children}
    </DemoProvider>
  )
}

function merchantVisualFor(transaction: AccountTransaction): NativeTransactionLeadingVisual | undefined {
  if (transaction.label === 'YouTube Premium') return merchantVisual('youtube')
  if (transaction.label === 'Carrefour') return merchantVisual('carrefour')
  if (transaction.label === 'eMAG') return merchantVisual('emag')
  return undefined
}

function EthocaListPreview({ state }: { state: 'available' | 'pending' | 'fallback' }) {
  const transactionFilter = (transaction: AccountTransaction) => {
    if (state === 'pending') return transaction.status === 'Pending'
    if (state === 'fallback') return transaction.status === 'Booked' && transaction.label === 'Piata Obor'
    return transaction.status === 'Booked' && ['Carrefour', 'YouTube Premium'].includes(transaction.label)
  }

  return (
    <EthocaRoFixture>
      <CardDetailScreen
        selectedCardId="card-debit-1"
        onBack={noop}
        onCardDetailsClick={noop}
        onShowCardDetailsClick={noop}
        onCardOptionsClick={noop}
        onTransactionClick={noop}
        transactionRowPresentation={{
          displayLabel: (transaction) => transaction.label,
          transactionFilter,
          nativeLeadingVisual: (transaction) => {
            if (state === 'fallback') return pfmVisual(transaction)
            return merchantVisualFor(transaction) ?? pfmVisual(transaction)
          },
        }}
      />
    </EthocaRoFixture>
  )
}

function EthocaAccountListPreview({ state }: { state: 'available' | 'pending' }) {
  const transactionFilter = (transaction: AccountTransaction) => {
    if (state === 'pending') return transaction.status === 'Pending'
    return (
      transaction.status === 'Booked' && ['Carrefour', 'YouTube Premium', 'Enel Energie'].includes(transaction.label)
    )
  }

  return (
    <EthocaRoFixture>
      <AccountDetailScreen
        selectedProductId={ETHOCA_CURRENT_ACCOUNT.id}
        onBack={noop}
        onDetailsClick={noop}
        onOptionsClick={noop}
        onTransactionClick={noop}
        transactionRowPresentation={{
          displayLabel: (transaction) => transaction.label,
          transactionFilter,
          nativeLeadingVisual: (transaction) =>
            transaction.source === 'card'
              ? (merchantVisualFor(transaction) ?? pfmVisual(transaction))
              : pfmVisual(transaction),
        }}
      />
    </EthocaRoFixture>
  )
}

function EthocaTransactionDetailPreview({
  mode,
}: {
  mode: 'in-store' | 'online' | 'pending' | 'partial-data' | 'no-logo'
}) {
  const transaction =
    mode === 'in-store'
      ? demoTransaction('Carrefour')
      : mode === 'online'
        ? demoTransaction('YouTube Premium')
        : mode === 'pending'
          ? demoTransaction('eMAG', 'Pending')
          : demoTransaction('Piata Obor')
  const enrichment =
    mode === 'in-store'
      ? {
          cleanMerchantName: 'Carrefour',
          location: {
            label: 'Merchant location',
            address: 'Carrefour Băneasa · Șos. București-Ploiești 42D, Bucharest',
          },
          mcc: '5411 · Grocery stores, supermarkets',
        }
      : mode === 'online'
        ? {
            cleanMerchantName: 'YouTube Premium',
            mcc: '4899 · Cable, satellite and other pay television',
          }
        : mode === 'pending'
          ? {
              cleanMerchantName: 'eMAG',
            }
          : mode === 'partial-data'
            ? {
                cleanMerchantName: 'Piata Obor',
                mcc: '5411 · Grocery stores, supermarkets',
              }
            : undefined
  const nativeMerchantVisual =
    mode === 'in-store'
      ? merchantVisual('carrefour', 64)
      : mode === 'online'
        ? merchantVisual('youtube', 64)
        : mode === 'pending'
          ? merchantVisual('emag', 64)
          : undefined

  return (
    <TransactionDetailScreen
      country="RO"
      product={ETHOCA_DEBIT_CARD}
      transaction={transaction}
      merchantEnrichment={enrichment}
      nativeMerchantVisual={nativeMerchantVisual}
      onBack={noop}
      onRedoPayment={noop}
      onCategoryChange={noop}
    />
  )
}

// ----------------------------------------------------------------- dispatcher

export function renderEthocaPreview(kind: EthocaScreenKind): ReactNode {
  switch (kind) {
    case 'ethoca-list-merchant-logo':
      return <EthocaListPreview state="available" />
    case 'ethoca-account-list-merchant-logo':
      return <EthocaAccountListPreview state="available" />
    case 'ethoca-list-pending-merchant-logo':
      return <EthocaListPreview state="pending" />
    case 'ethoca-account-list-pending-merchant-logo':
      return <EthocaAccountListPreview state="pending" />
    case 'ethoca-detail-pending-merchant-logo':
      return <EthocaTransactionDetailPreview mode="pending" />
    case 'ethoca-list-pfm-fallback':
      return <EthocaListPreview state="fallback" />
    case 'ethoca-detail-partial-data':
      return <EthocaTransactionDetailPreview mode="partial-data" />
    case 'ethoca-detail-in-store':
      return <EthocaTransactionDetailPreview mode="in-store" />
    case 'ethoca-detail-online':
      return <EthocaTransactionDetailPreview mode="online" />
    case 'ethoca-detail-logo-unavailable':
      return <EthocaTransactionDetailPreview mode="no-logo" />
    default:
      return null
  }
}
