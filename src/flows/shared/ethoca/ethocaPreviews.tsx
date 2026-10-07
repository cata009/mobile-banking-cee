import { useState, type ReactNode } from 'react'
import AccountDetailScreen from '@/app/screens/accounts/AccountDetailScreen'
import CardDetailScreen from '@/app/screens/cards/CardDetailScreen'
import { TransactionDetailScreen } from '@/app/screens/payments/DomesticPaymentFlowScreens'
import PfmCategoryIcon from '@/app/components/pfm/PfmCategoryIcon'
import { HuMerchantLogoMark } from '@/app/screens/kids/hu/merchantLogos'
import { DemoProvider } from '@/app/state/demoStore'
import { getAccountTransactions, type AccountTransaction } from '@/data/accountDetails'
import { mockProducts, type CurrentAccount, type DebitCard } from '@/data/products'
import carrefourOfficialLogo from '@/assets/ethoca/carrefour-official.svg'
import emagOfficialLogo from '@/assets/ethoca/emag-official.svg'
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

/** Existing merchant-logo asset reused from the current Mobile PI Kids implementation. */
function ExistingMerchantLogo({ merchant, size = 32 }: { merchant: 'youtube' | 'netflix'; size?: 32 | 64 }) {
  const scale = size / 34
  return (
    <div
      className="grid shrink-0 place-items-center overflow-visible"
      data-ethoca-visual="merchant-logo"
      style={{ width: size, height: size }}
    >
      <div style={{ transform: `scale(${scale})` }}>
        <HuMerchantLogoMark merchant={merchant} />
      </div>
    </div>
  )
}

/**
 * ETHOCA uses a merchant-supplied brand asset, never a letter-based stand-in.
 * The assets are bundled with the demo rather than requested from merchant CDNs
 * at runtime, so corporate firewalls cannot blank the transaction presentation.
 */
function EthocaMerchantLogo({
  merchant,
  transaction,
  size = 32,
}: {
  merchant: EthocaMerchantId
  transaction: AccountTransaction
  size?: 32 | 64
}) {
  const [imageFailed, setImageFailed] = useState(false)
  const [imageReady, setImageReady] = useState(false)
  if (merchant === 'youtube') return <ExistingMerchantLogo merchant="youtube" size={size} />
  if (imageFailed) return <ExistingPfmFallback transaction={transaction} />

  const config =
    merchant === 'carrefour'
      ? {
          label: 'Carrefour',
          source: 'bundled-official-carrefour',
          src: carrefourOfficialLogo,
        }
      : {
          label: 'eMAG',
          source: 'bundled-official-emag',
          src: emagOfficialLogo,
        }

  return (
    <span
      aria-label={`${config.label} merchant logo`}
      className="relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--uc-static-white)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--uc-static-black)_12%,transparent)]"
      data-ethoca-visual="merchant-logo"
      data-ethoca-logo-source={config.source}
      data-testid={`merchant-logo-${merchant}`}
      role="img"
      style={{ width: size, height: size }}
    >
      {!imageReady ? (
        <span className="grid h-full w-full place-items-center rounded-full bg-[#F5F5F5]" aria-hidden="true">
          <PfmCategoryIcon category={transaction.pfmCategory} size={32} variant="category-circle" />
        </span>
      ) : null}
      <img
        alt=""
        className={`absolute h-full w-full object-contain p-[12%] ${imageReady ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setImageReady(true)}
        onError={() => setImageFailed(true)}
        src={config.src}
      />
    </span>
  )
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

function ExistingPfmFallback({ transaction }: { transaction: AccountTransaction }) {
  return (
    <span
      className="grid size-[32px] shrink-0 place-items-center"
      aria-label="PFM category fallback"
      data-ethoca-visual="pfm-fallback"
    >
      <PfmCategoryIcon category={transaction.pfmCategory} size={32} variant="category-circle" />
    </span>
  )
}

function merchantLogoFor(transaction: AccountTransaction) {
  if (transaction.label === 'YouTube Premium')
    return <EthocaMerchantLogo merchant="youtube" transaction={transaction} />
  if (transaction.label === 'Carrefour') return <EthocaMerchantLogo merchant="carrefour" transaction={transaction} />
  if (transaction.label === 'eMAG') return <EthocaMerchantLogo merchant="emag" transaction={transaction} />
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
          leadingVisual: (transaction) => {
            if (state === 'fallback') return <ExistingPfmFallback transaction={transaction} />
            return merchantLogoFor(transaction) ?? <ExistingPfmFallback transaction={transaction} />
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
          leadingVisual: (transaction) =>
            transaction.source === 'card' ? (
              (merchantLogoFor(transaction) ?? <ExistingPfmFallback transaction={transaction} />)
            ) : (
              <ExistingPfmFallback transaction={transaction} />
            ),
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
          merchantLogo: <EthocaMerchantLogo merchant="carrefour" transaction={transaction} size={64} />,
          location: {
            label: 'Merchant location',
            address: 'Carrefour Băneasa · Șos. București-Ploiești 42D, Bucharest',
          },
          mcc: '5411 · Grocery stores, supermarkets',
        }
      : mode === 'online'
        ? {
            cleanMerchantName: 'YouTube Premium',
            merchantLogo: <EthocaMerchantLogo merchant="youtube" transaction={transaction} size={64} />,
            mcc: '4899 · Cable, satellite and other pay television',
          }
        : mode === 'pending'
          ? {
              cleanMerchantName: 'eMAG',
              merchantLogo: <EthocaMerchantLogo merchant="emag" transaction={transaction} size={64} />,
            }
          : mode === 'partial-data'
            ? {
                cleanMerchantName: 'Piata Obor',
                mcc: '5411 · Grocery stores, supermarkets',
              }
            : undefined

  return (
    <TransactionDetailScreen
      country="RO"
      product={ETHOCA_DEBIT_CARD}
      transaction={transaction}
      merchantEnrichment={enrichment}
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
