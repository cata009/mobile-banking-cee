import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import { DemoProvider } from '@/app/state/demoStore'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import PrimaryButton from '@/app/components/PrimaryButton'
import { useProducts } from '@/hooks/useProducts'
import type { NativeDemoRoute } from '@/features/demo-native/contracts'
import { fraudLedgerTransaction } from '@/features/cards/fraud/transactions'
import { FRAUD_CARD_REFERENCE } from '@/features/cards/fraud/cardFixture'
import type { DebitCard } from '@/data/products'
import type { Dispatch } from 'react'
import {
  FRAUD_TRANSACTIONS,
  selectedFraudTransaction,
  isFraudActivityReviewed,
  type FraudAction,
  type FraudScreen,
  type FraudSession,
} from '@/features/cards/fraud/model'

function BaselineContent({
  screen,
  state,
  go,
  select,
  dispatch,
}: {
  screen: FraudScreen
  state: FraudSession
  go: (screen: FraudScreen) => void
  select: (id: string) => void
  dispatch: Dispatch<FraudAction>
}) {
  const ledger = (id: string) => fraudLedgerTransaction(id, state.ledgerOverrides[id])
  const { categories } = useProducts()
  const baselineCard = categories
    .flatMap((category) => category.products)
    .find((product): product is DebitCard => product.type === 'debit_card')
  const card = baselineCard ? { ...baselineCard, cardHolderName: FRAUD_CARD_REFERENCE.cardHolderName } : undefined
  const transaction = selectedFraudTransaction(state)
  const scopedCategories = categories.map((category) => ({
    ...category,
    products: category.products
      .filter((product) => (product.type !== 'debit_card' && product.type !== 'credit_card') || product.id === card?.id)
      .map((product) => (card && product.id === card.id ? card : product)),
  }))
  const route: NativeDemoRoute =
    screen === 'fraud-home'
      ? { screen: 'home' }
      : screen === 'fraud-card-options'
        ? { screen: 'card-options', params: { productId: card?.id ?? '' } }
        : screen === 'fraud-baseline-transaction' || screen === 'fraud-transaction'
          ? {
              screen: 'transaction',
              params: { productId: card?.id ?? '', source: 'card', transactionId: state.selectedId },
            }
          : { screen: 'card', params: { productId: card?.id ?? '' } }
  const item = state.cases[state.selectedId]
  const unreviewedCount = FRAUD_TRANSACTIONS.filter((payment) => !isFraudActivityReviewed(state, payment.id)).length
  const rows = FRAUD_TRANSACTIONS.filter((payment) => payment.status !== 'declined').map((payment) => ({
    transaction: ledger(payment.id),
    displayLabel: payment.merchant,
  }))
  const back = () =>
    go(screen === 'fraud-transaction' ? 'fraud-alerts' : screen === 'fraud-cards' ? 'fraud-home' : 'fraud-cards')
  return (
    <div className="fraud-baseline-shell">
      <div className="fraud-baseline-native">
        <NativeScreenPreview
          route={route}
          snapshot={{
            country: 'BA',
            release: 'release-current',
            scenario: 'active',
            activeFeatures: [],
            language: 'en',
            primaryNavigationVisible: screen === 'fraud-home',
            bankingPresentation: {
              rows,
              productId: card?.id,
              productCategories: scopedCategories,
              homeSecurityNotice:
                unreviewedCount > 0
                  ? {
                      title: 'Suspicious activity',
                      description: `Review ${unreviewedCount} unusual card ${unreviewedCount === 1 ? 'activity' : 'activities'}.`,
                      tagLabel: 'Review activity',
                    }
                  : undefined,
              cardSecurityRoutes: {
                block: { screen: 'card-options', params: { fraudAction: 'protect-card' } },
                replacement: { screen: 'card-options', params: { fraudAction: 'replace-card' } },
              },
            },
            transactionSelection: card
              ? { productId: card.id, source: 'card', transaction: ledger(state.selectedId) }
              : undefined,
            transactionPresentation: card
              ? {
                  product: card,
                  showActions: false,
                  showSpendingInsights: false,
                  showExpandableDetails: false,
                  cardIdentityMode: 'holder',
                  cardDetailsRoute: { screen: 'card', params: { productId: card.id } },
                  caseNotice: item
                    ? {
                        title:
                          item.status === 'resolved' || item.status === 'declined'
                            ? item.kind === 'fraud-report'
                              ? 'Report decision available'
                              : 'Dispute decision available'
                            : item.kind === 'fraud-report'
                              ? 'You have an open report'
                              : 'You have an open dispute',
                        description: 'Tap to view its status and updates.',
                        accessibilityLabel: item.kind === 'fraud-report' ? 'View report status' : 'View dispute status',
                        route: { screen: 'transaction', params: { fraudAction: 'view-case' } },
                      }
                    : undefined,
                  postingTime: transaction.date.split(' · ')[1],
                  activityStatus: transaction.status === 'declined' ? 'declined' : undefined,
                  merchantEnrichment: {
                    cleanMerchantName: transaction.merchant,
                    categoryLabel: 'Merchant Category',
                    ...(transaction.id === 'berlin'
                      ? {
                          leadingVisual: {
                            kind: 'merchant-logo' as const,
                            merchant: 'carrefour' as const,
                            size: 64 as const,
                          },
                          location: { label: 'Merchant location', address: transaction.location },
                          mcc: '5411 · Grocery stores, supermarkets',
                        }
                      : transaction.id === 'vienna'
                        ? {
                            leadingVisual: {
                              kind: 'pfm' as const,
                              category: 'Finance' as const,
                              variant: 'category-circle' as const,
                              size: 64 as const,
                            },
                            location: { label: 'ATM location', address: transaction.location },
                            mcc: '6011 · Cash withdrawals',
                          }
                        : transaction.id === 'online'
                          ? {
                              leadingVisual: {
                                kind: 'merchant-logo' as const,
                                merchant: 'youtube' as const,
                                size: 64 as const,
                              },
                              mcc: '4899 · Digital subscriptions',
                            }
                          : {}),
                  },
                }
              : undefined,
          }}
          onBack={back}
          onNavigate={(target, action) => {
            if (target.params?.fraudAction === 'view-case') {
              go('fraud-case-status')
              return true
            }
            if (target.params?.fraudAction === 'protect-card') {
              go('fraud-card-security')
              return true
            }
            if (target.params?.fraudAction === 'replace-card') {
              go('fraud-replace-confirm')
              return true
            }
            if (target.params?.fraudAction === 'review-alerts') {
              go('fraud-alerts')
              return true
            }
            if (action === 'back') {
              back()
              return true
            }
            if (target.screen === 'home') go('fraud-home')
            else if (target.screen === 'card' || target.screen === 'cards') go('fraud-cards')
            else if (target.screen === 'card-options') go('fraud-card-options')
            else if (target.screen === 'transaction') {
              const id = target.params?.transactionId
              if (!id || !FRAUD_TRANSACTIONS.some((payment) => payment.id === id)) return false
              select(id)
              go('fraud-baseline-transaction')
            }
            return true
          }}
        />
      </div>
      {!item && screen !== 'fraud-home' && screen !== 'fraud-cards' && screen !== 'fraud-card-options' ? (
        <div className="fraud-baseline-actions">
          {screen === 'fraud-transaction' ? (
            state.recognised.includes(transaction.id) ? (
              <p>You confirmed that you recognise this activity.</p>
            ) : state.reported.includes(transaction.id) ? (
              <PrimaryButton onClick={() => go('fraud-claim-details')}>
                {transaction.status === 'booked' ? 'Continue dispute' : 'Continue report'}
              </PrimaryButton>
            ) : (
              <>
                <p>Your card will be temporarily frozen after you successfully submit the report.</p>
                <PrimaryButton
                  onClick={() => {
                    dispatch({ type: 'report', transactionId: transaction.id })
                    go('fraud-claim-details')
                  }}
                >
                  Report unrecognised payment
                </PrimaryButton>
                <PrimaryButton
                  variant="secondary"
                  onClick={() => {
                    dispatch({ type: 'recognise', transactionId: transaction.id })
                    go('fraud-recognised')
                  }}
                >
                  I recognise this payment
                </PrimaryButton>
              </>
            )
          ) : (
            <>
              <p>Security alert · Do you recognise this payment?</p>
              <PrimaryButton onClick={() => go('fraud-transaction')}>Review this activity</PrimaryButton>
              <PrimaryButton variant="secondary" onClick={() => go('fraud-cards')}>
                Back to cards
              </PrimaryButton>
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}

/** Mounts the existing application screens unchanged; the demo adds a separate security action area. */
export function FraudBaselineScreen(props: {
  screen: FraudScreen
  state: FraudSession
  go: (screen: FraudScreen) => void
  select: (id: string) => void
  dispatch: Dispatch<FraudAction>
}) {
  return (
    <DemoProvider
      initialState={{
        product: 'PI',
        country: 'BA',
        scenario: 'active',
        release: 'release-current',
        bankingScenario: 'retail-multi-account-card',
      }}
    >
      <LanguageProvider initialLanguage="en">
        <BaselineContent {...props} />
      </LanguageProvider>
    </DemoProvider>
  )
}
