// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render } from '@testing-library/react'
import React, { type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DemoProvider } from '@/app/state/demoStore'
import AccountDetailScreen from '@/app/screens/accounts/AccountDetailScreen'
import CardDetailScreen from '@/app/screens/cards/CardDetailScreen'
import { TransactionDetailScreen } from '@/app/screens/payments/DomesticPaymentFlowScreens'
import { getAccountTransactions, getCardTransactions } from '@/data/accountDetails'
import type { CurrentAccount, DebitCard } from '@/data/products'
import { deriveProductCategories } from '@/features/products/selectors'
import type { NativeScreenPreviewProps } from '@/app/components/demo/NativeScreenPreview'
import type {
  NativeBankingPresentation,
  NativeTransactionLeadingVisual,
} from '@/features/demo-native/bankingPresentation'
import type { EthocaScreenKind } from '@/app/screens/flow-library/flows/types'
import { renderEthocaPreview } from '@/flows/shared/ethoca/ethocaPreviews'

const captured = vi.hoisted(() => ({ props: [] as unknown[] }))

vi.mock('@/app/components/demo/NativeScreenPreview', () => ({
  NativeScreenPreview: (props: unknown) => {
    captured.props.push(props)
    return null
  },
}))

vi.mock('@/app/screens/kids/hu/merchantLogos', () => {
  throw new Error('The Ethoca flow preview must not import Kids Hungary merchant UI')
})

const productCounts = {
  accounts: 2,
  debitCards: 2,
  creditCards: 1,
  mealCards: 0,
  deposits: 1,
  savingsAccounts: 1,
  loans: 1,
  mortgages: 1,
  investments: 1,
}
const sourceProducts = deriveProductCategories({
  country: 'RO',
  release: 'release-current',
  resolvedProductCounts: productCounts,
}).flatMap(category => category.products)
const currentAccount = sourceProducts.find(
  (product): product is CurrentAccount => product.type === 'current_account',
)!
const debitCard = sourceProducts.find(
  (product): product is DebitCard => product.id === 'card-debit-1' && product.type === 'debit_card',
)!
const carrefourTransaction = getAccountTransactions('RO', 0, 'RON').find(
  transaction => transaction.merchantId === 'carrefour' && transaction.source === 'card',
)!
const carrefourVisual: NativeTransactionLeadingVisual = {
  kind: 'merchant-logo',
  merchant: 'carrefour',
  size: 32,
}

function sourceContext(children: ReactNode) {
  return (
    <DemoProvider
      initialState={{
        product: 'PI',
        country: 'RO',
        release: 'release-current',
        designSystem: 'current',
        bankingScenario: 'retail-multi-account-card',
        productCounts,
      }}
    >
      {children}
    </DemoProvider>
  )
}

function previews(): NativeScreenPreviewProps[] {
  return captured.props as NativeScreenPreviewProps[]
}

function bankingRows(): NonNullable<NativeBankingPresentation['rows']> {
  const presentation = previews().find(preview => preview.snapshot?.bankingPresentation)?.snapshot
    ?.bankingPresentation
  if (!presentation?.rows) throw new Error('Expected a Native banking presentation with rows')
  return presentation.rows
}

function renderFlowPreview(kind: EthocaScreenKind) {
  return render(sourceContext(renderEthocaPreview(kind)))
}

beforeEach(() => {
  captured.props.length = 0
})

afterEach(cleanup)

describe('Ethoca Native visual boundary', () => {
  it('prefers a plain Native visual for Account rows before serializing a legacy ReactNode', () => {
    const legacyVisual = vi.fn(() => React.createElement('img', { alt: 'legacy source visual' }))
    render(
      sourceContext(
        <AccountDetailScreen
          selectedProductId={currentAccount.id}
          onBack={vi.fn()}
          onDetailsClick={vi.fn()}
          onOptionsClick={vi.fn()}
          transactionRowPresentation={{
            transactionFilter: transaction => transaction.id === carrefourTransaction.id,
            nativeLeadingVisual: () => carrefourVisual,
            leadingVisual: legacyVisual,
          }}
        />,
      ),
    )

    expect(legacyVisual).not.toHaveBeenCalled()
    expect(bankingRows()).toEqual([
      expect.objectContaining({
        transaction: expect.objectContaining({ id: carrefourTransaction.id }),
        leadingVisual: carrefourVisual,
      }),
    ])
  })

  it('prefers a plain Native visual for Card rows before serializing a legacy ReactNode', () => {
    const cardTransaction = getCardTransactions('RO', debitCard, 'RON', 0).find(
      transaction => transaction.merchantId === 'carrefour',
    )!
    const legacyVisual = vi.fn(() => React.createElement('img', { alt: 'legacy source visual' }))
    render(
      sourceContext(
        <CardDetailScreen
          selectedCardId={debitCard.id}
          onBack={vi.fn()}
          transactionRowPresentation={{
            transactionFilter: transaction => transaction.id === cardTransaction.id,
            nativeLeadingVisual: () => carrefourVisual,
            leadingVisual: legacyVisual,
          }}
        />,
      ),
    )

    expect(legacyVisual).not.toHaveBeenCalled()
    expect(bankingRows()).toEqual([
      expect.objectContaining({
        transaction: expect.objectContaining({ id: cardTransaction.id }),
        leadingVisual: carrefourVisual,
      }),
    ])
  })

  it('prefers the plain Native merchant visual for transaction detail enrichment', () => {
    const legacyVisual = React.createElement('img', { alt: 'legacy merchant visual' })
    const nativeVisual: NativeTransactionLeadingVisual = { ...carrefourVisual, size: 64 }
    render(
      sourceContext(
        <TransactionDetailScreen
          country="RO"
          product={debitCard}
          transaction={carrefourTransaction}
          merchantEnrichment={{ cleanMerchantName: 'Carrefour', merchantLogo: legacyVisual }}
          nativeMerchantVisual={nativeVisual}
          onBack={vi.fn()}
          onRedoPayment={vi.fn()}
        />,
      ),
    )

    const detail = previews().find(preview => preview.snapshot?.transactionPresentation)?.snapshot
      ?.transactionPresentation
    expect(detail?.merchantEnrichment?.leadingVisual).toEqual(nativeVisual)
  })

  it.each([
    ['ethoca-list-merchant-logo', 'Carrefour', carrefourVisual],
    ['ethoca-account-list-merchant-logo', 'Carrefour', carrefourVisual],
    [
      'ethoca-list-pfm-fallback',
      'Piata Obor',
      {
        kind: 'pfm',
        category: getAccountTransactions('RO', 0, 'RON').find(transaction => transaction.label === 'Piata Obor')!
          .pfmCategory,
        variant: 'category-circle',
        size: 32,
      },
    ],
  ] as const)('passes the %s flow visual for %s through Native banking data', (kind, label, visual) => {
    renderFlowPreview(kind)
    const row = bankingRows().find(candidate => candidate.transaction.label === label)
    expect(row?.leadingVisual).toEqual(visual)
  })

  it('passes the flow detail merchant as a plain Native descriptor', () => {
    renderFlowPreview('ethoca-detail-in-store')
    const detail = previews().find(preview => preview.snapshot?.transactionPresentation)?.snapshot
      ?.transactionPresentation
    expect(detail?.merchantEnrichment?.leadingVisual).toEqual({
      kind: 'merchant-logo',
      merchant: 'carrefour',
      size: 64,
    })
  })
})
