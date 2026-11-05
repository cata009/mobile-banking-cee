import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import { DemoProvider } from '@/app/state/demoStore'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import PrimaryButton from '@/app/components/PrimaryButton'
import { useProducts } from '@/hooks/useProducts'
import type { NativeDemoRoute } from '@/features/demo-native/contracts'
import { FRAUD_CARD_HISTORY, fraudLedgerTransaction } from '@/features/cards/fraud/transactions'
import { FRAUD_CARD_REFERENCE } from '@/features/cards/fraud/cardFixture'
import type { DebitCard } from '@/data/products'
import { useState, type Dispatch } from 'react'
import {
  FRAUD_TRANSACTIONS,
  selectedFraudTransaction,
  isFraudActivityReviewed,
  fraudCaseKind,
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
  onBackScreen,
}: {
  screen: FraudScreen
  state: FraudSession
  go: (screen: FraudScreen) => void
  select: (id: string) => void
  dispatch: Dispatch<FraudAction>
  onBackScreen?: FraudScreen
}) {
  const [historyId, setHistoryId] = useState<string | null>(null)
  const historical = FRAUD_CARD_HISTORY.find((entry) => entry.id === historyId)
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
    historical && screen === 'fraud-cards'
      ? { screen: 'transaction', params: { productId: card?.id ?? '', source: 'card', transactionId: historical.id } }
      : screen === 'fraud-home'
        ? { screen: 'home' }
        : screen === 'fraud-card-options'
          ? { screen: 'card-options', params: { productId: card?.id ?? '' } }
          : screen === 'fraud-card-security' || screen === 'fraud-geo-settings'
            ? { screen: 'card-options', params: { productId: card?.id ?? '', cardLimitsPage: 'true' } }
            : screen === 'fraud-virtual-card'
              ? {
                  screen: 'product-detail',
                  params: {
                    title: 'Virtual card',
                    optionId: 'virtual-card',
                    cardGuardVirtualCardIssue: 'true',
                  },
                }
              : screen === 'fraud-baseline-transaction' || screen === 'fraud-transaction'
                ? {
                    screen: 'transaction',
                    params: { productId: card?.id ?? '', source: 'card', transactionId: state.selectedId },
                  }
                : { screen: 'card', params: { productId: card?.id ?? '', cardGuardVirtualCardIssue: 'true' } }
  const item = state.cases[state.selectedId]
  const unreviewedCount = FRAUD_TRANSACTIONS.filter((payment) => !isFraudActivityReviewed(state, payment.id)).length
  const rows = [
    ...FRAUD_TRANSACTIONS.filter((payment) => payment.status !== 'declined').map((payment) => ({
      transaction: ledger(payment.id),
      displayLabel: payment.merchant,
    })),
    ...FRAUD_CARD_HISTORY.map((entry) => ({ transaction: entry, displayLabel: entry.label })),
  ]
  const back = () => {
    if (historical && screen === 'fraud-cards') {
      setHistoryId(null)
      return
    }
    if (screen === 'fraud-card-security' || screen === 'fraud-geo-settings') {
      go(onBackScreen ?? 'fraud-cards')
      return
    }
    if (screen === 'fraud-virtual-card') {
      go('fraud-claim-sent')
      return
    }
    go(screen === 'fraud-transaction' ? 'fraud-alerts' : screen === 'fraud-cards' ? 'fraud-home' : 'fraud-cards')
  }
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
            ...(screen === 'fraud-virtual-card'
              ? {
                  productDetailPresentation: {
                    title: 'Virtual card',
                    optionId: 'virtual-card',
                    intro: 'Choose whether to issue a virtual card for eligible card payments.',
                  },
                }
              : {}),
            bankingPresentation: {
              rows,
              productId: card?.id,
              cardStatus: state.cardStatus,
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
                block: { screen: 'card-options', params: { productId: card?.id ?? '', cardLimitsPage: 'true' } },
              },
            },
            transactionSelection: card
              ? { productId: card.id, source: 'card', transaction: historical ?? ledger(state.selectedId) }
              : undefined,
            transactionPresentation:
              card && historical
                ? {
                    product: card,
                    showActions: false,
                    showSpendingInsights: false,
                    showExpandableDetails: false,
                    cardIdentityMode: 'holder',
                  }
                : card
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
                                  ? 'Your report decision is ready'
                                  : 'Your dispute decision is ready'
                                : item.kind === 'fraud-report'
                                  ? 'Track your report'
                                  : 'Track your dispute',
                            description:
                              item.status === 'resolved' || item.status === 'declined'
                                ? 'See the decision and what happens next.'
                                : 'See the latest progress and next steps.',
                            accessibilityLabel:
                              item.kind === 'fraud-report' ? 'View report status' : 'View dispute status',
                            route: { screen: 'transaction', params: { fraudAction: 'view-case' } },
                          }
                        : undefined,
                      postingTime: transaction.date.split(' · ')[1],
                      activityStatus: transaction.status === 'declined' ? 'declined' : undefined,
                      ...(transaction.status === 'pending'
                        ? {
                            pendingStatusLabel: 'Pending',
                          }
                        : {}),
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
            if (target.params?.cardLimitsPage === 'true') {
              go('fraud-card-security')
              return true
            }
            if (target.params?.fraudAction === 'view-case') {
              go('fraud-case-status')
              return true
            }
            if (target.params?.fraudAction === 'protect-card') {
              go('fraud-card-security')
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
              if (id && FRAUD_CARD_HISTORY.some((entry) => entry.id === id)) {
                setHistoryId(id)
                return true
              }
              if (!id || !FRAUD_TRANSACTIONS.some((payment) => payment.id === id)) return false
              select(id)
              go('fraud-baseline-transaction')
            }
            return true
          }}
        />
      </div>
      {!item &&
      ![
        'fraud-home',
        'fraud-cards',
        'fraud-card-options',
        'fraud-card-security',
        'fraud-geo-settings',
        'fraud-virtual-card',
      ].includes(screen) ? (
        <div className="fraud-baseline-actions">
          {screen === 'fraud-transaction' ? (
            state.recognised.includes(transaction.id) ? (
              <p>You confirmed that you recognise this activity.</p>
            ) : state.reported.includes(transaction.id) ? (
              <PrimaryButton onClick={() => go('fraud-claim-details')}>
                {fraudCaseKind(transaction.status) === 'dispute' ? 'Continue dispute' : 'Continue report'}
              </PrimaryButton>
            ) : (
              <>
                <p className="fraud-block-choice-note">
                  If you continue, we’ll temporarily block your card while we review your case.
                </p>
                <PrimaryButton
                  onClick={() => {
                    dispatch({ type: 'report', transactionId: transaction.id, blockCardOnSubmit: true })
                    go('fraud-dispute-intro')
                  }}
                >
                  I don't recognise this payment
                </PrimaryButton>
                <PrimaryButton
                  variant="secondary"
                  onClick={() => {
                    dispatch({ type: 'recognise', transactionId: transaction.id })
                    go('fraud-recognised')
                  }}
                >
                  I made this payment
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
  onBackScreen?: FraudScreen
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
