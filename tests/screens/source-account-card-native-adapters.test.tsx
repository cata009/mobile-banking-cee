// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render } from '@testing-library/react'
import React, { type PropsWithChildren } from 'react'
import { afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest'
import { DemoProvider } from '@/app/state/demoStore'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { getAccountTransactions, getCardTransactions } from '@/data/accountDetails'
import type { AccountTransaction } from '@/data/accountDetails'
import { getCardMerchantEnrichment } from '@/app/components/merchants/merchantEnrichment'
import { deriveProductCategories } from '@/features/products/selectors'
import type { PfmCategorySelection } from '@/data/pfmCategories'
import type { NativeTransactionPayload } from '@/features/demo-native/transactionIntents'
import type { NativeScreenPreviewProps } from '@/app/components/demo/NativeScreenPreview'
import AccountDetailScreen from '@/app/screens/accounts/AccountDetailScreen'
import TransactionsScreen from '@/app/screens/accounts/TransactionsScreen'
import CardDetailScreen from '@/app/screens/cards/CardDetailScreen'

const preview = vi.hoisted(() => ({ calls: [] as unknown[] }))

vi.mock('@/app/components/demo/NativeScreenPreview', () => ({
  NativeScreenPreview: (props: unknown) => {
    preview.calls.push(props)
    return null
  },
}))

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

function EthocaMerchantLogo(_props: {
  merchant: 'youtube' | 'carrefour' | 'emag'
  transaction: AccountTransaction
  size: 32
}) {
  return null
}

function ExistingPfmFallback(_props: { transaction: AccountTransaction }) {
  return null
}

function SourceContext({
  children,
  country = 'RO',
  release = 'release-current',
}: PropsWithChildren<{
  country?: 'RO' | 'CZ'
  release?: 'release-current' | 'release-future-evo-2027'
}>) {
  return (
    <DemoProvider
      initialState={{
        product: 'PI',
        country,
        release,
        scenario: 'active',
        bankingScenario: 'retail-multi-account-card',
        productCounts,
      }}
    >
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  )
}

function latestPreview(): NativeScreenPreviewProps {
  const call = preview.calls.at(-1)
  if (!call) throw new Error('The Source screen did not mount NativeScreenPreview')
  return call as NativeScreenPreviewProps
}

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
  })
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  })
  vi.stubGlobal(
    'ResizeObserver',
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

beforeEach(() => {
  preview.calls = []
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

it('routes Source account details through NativeScreenPreview with the selected Source product', () => {
  const onBack = vi.fn()
  const onDetailsClick = vi.fn()
  const onOptionsClick = vi.fn()
  render(
    <SourceContext>
      <AccountDetailScreen
        selectedProductId="acc-1"
        onBack={onBack}
        onDetailsClick={onDetailsClick}
        onOptionsClick={onOptionsClick}
      />
    </SourceContext>,
  )

  expect(preview.calls).toHaveLength(1)
  expect(latestPreview()).toMatchObject({
    route: {
      screen: 'account',
      params: { productId: 'acc-1', accountId: 'acc-1' },
    },
    onBack,
  })

  const adapter = latestPreview()
  expect(
    adapter.onNavigate?.(
      { screen: 'account-info', params: { productId: 'acc-2' } },
      'push',
    ),
  ).toBe(true)
  expect(onDetailsClick).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'acc-2', type: 'current_account' }),
  )
  expect(
    adapter.onNavigate?.(
      { screen: 'account-options', params: { productId: 'acc-1' } },
      'push',
    ),
  ).toBe(true)
  expect(onOptionsClick).toHaveBeenCalledOnce()
})

it('routes the Source transactions page through NativeScreenPreview', () => {
  const onBack = vi.fn()
  const transaction = getAccountTransactions('RO', 0, 'RON')[0]!
  const override: PfmCategorySelection = {
    groupId: 'source-category',
    groupLabel: 'Source category',
    category: 'Shopping',
    subcategory: 'Source subcategory',
  }
  render(
    <SourceContext>
      <TransactionsScreen
        onBack={onBack}
        transactionCategoryOverrides={{ [transaction.id]: override }}
      />
    </SourceContext>,
  )

  expect(preview.calls).toHaveLength(1)
  expect(latestPreview()).toMatchObject({
    route: { screen: 'transactions' },
    onBack,
  })
  const rows = latestPreview().snapshot?.bankingPresentation?.rows ?? []
  expect(rows.find(row => row.transaction.id === `acc-1-${transaction.id}`)).toMatchObject({
    transaction: {
      category: 'Source category',
      pfmCategory: 'Shopping',
      pfmSubcategory: 'Source subcategory',
    },
  })
  expect(rows.some(row => row.transaction.id.startsWith('acc-2-'))).toBe(true)
  expect(
    latestPreview().snapshot?.bankingPresentation?.transactionCategoryOverrides,
  ).toEqual({ [transaction.id]: override })
})

it('routes Source card details through NativeScreenPreview with the selected Source card', () => {
  const onBack = vi.fn()
  const onCardDetailsClick = vi.fn()
  const onCardOptionsClick = vi.fn()
  render(
    <SourceContext>
      <CardDetailScreen
        selectedCardId="card-debit-1"
        onBack={onBack}
        onCardDetailsClick={onCardDetailsClick}
        onCardOptionsClick={onCardOptionsClick}
      />
    </SourceContext>,
  )

  expect(preview.calls).toHaveLength(1)
  expect(latestPreview()).toMatchObject({
    route: {
      screen: 'card',
      params: { productId: 'card-debit-1', cardId: 'card-debit-1' },
    },
    onBack,
  })

  const adapter = latestPreview()
  expect(
    adapter.onNavigate?.(
      { screen: 'card-info', params: { cardId: 'card-debit-2' } },
      'push',
    ),
  ).toBe(true)
  expect(onCardDetailsClick).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'card-debit-2', type: 'debit_card' }),
  )
  expect(
    adapter.onNavigate?.(
      { screen: 'card-options', params: { productId: 'card-debit-1' } },
      'push',
    ),
  ).toBe(true)
  expect(onCardOptionsClick).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'card-debit-1', type: 'debit_card' }),
  )
})

it('forwards a Native card transaction with its Source product and merchant enrichment', () => {
  const product = { id: 'card-debit-1', type: 'debit_card' } as const
  const transaction = getAccountTransactions('RO', 0, 'RON').find(
    row => row.source === 'card' && row.merchantId === 'carrefour',
  )!
  const onTransactionClick = vi.fn()
  render(
    <SourceContext>
      <CardDetailScreen
        selectedCardId={product.id}
        onBack={vi.fn()}
        onTransactionClick={onTransactionClick}
      />
    </SourceContext>,
  )

  const selection: NativeTransactionPayload = {
    productId: product.id,
    source: 'card',
    transaction,
  }
  latestPreview().events?.onTransactionSelected?.(selection)

  expect(onTransactionClick).toHaveBeenCalledTimes(1)
  expect(onTransactionClick).toHaveBeenCalledWith(
    transaction,
    expect.objectContaining(product),
    getCardMerchantEnrichment(transaction, 'RO'),
  )
})

it('serializes ETHOCA card-row filters and visuals as product-scoped plain data', () => {
  const transaction = getAccountTransactions('RO', 0, 'RON').find(
    row => row.label === 'Carrefour' && row.source === 'card',
  )!
  render(
    <SourceContext>
      <CardDetailScreen
        selectedCardId="card-debit-1"
        onBack={vi.fn()}
        transactionRowPresentation={{
          transactionFilter: row => row.id === transaction.id,
          displayLabel: row => `Clean ${row.label}`,
          leadingVisual: row =>
            React.createElement(EthocaMerchantLogo, {
              merchant: 'carrefour',
              transaction: row,
              size: 32,
            }),
        }}
      />
    </SourceContext>,
  )

  const presentation = latestPreview().snapshot?.bankingPresentation
  expect(presentation).toEqual({
    productCategories: deriveProductCategories({ country: 'RO', release: 'release-current', resolvedProductCounts: productCounts }),
    productId: 'card-debit-1',
    rows: [
      {
        transaction: expect.objectContaining({ id: transaction.id }),
        displayLabel: 'Clean Carrefour',
        leadingVisual: {
          kind: 'merchant-logo',
          merchant: 'carrefour',
          size: 32,
        },
      },
    ],
  })
  expect(JSON.stringify(presentation)).not.toContain('EthocaMerchantLogo')
})

it('builds the same plain transaction DTO for a CZ Evo Source card route', () => {
  const sourceProducts = deriveProductCategories({
    country: 'CZ',
    release: 'release-future-evo-2027',
    resolvedProductCounts: productCounts,
  }).flatMap(category => category.products)
  const card = sourceProducts.find(
    (product): product is Extract<typeof product, { type: 'debit_card' }> =>
      product.id === 'card-debit-1' && product.type === 'debit_card',
  )!
  const transaction = getCardTransactions('CZ', card, 'CZK', 0).find(
    row => row.status === 'Booked',
  )!
  render(
    <SourceContext country="CZ" release="release-future-evo-2027">
      <CardDetailScreen
        selectedCardId={card.id}
        onBack={vi.fn()}
        transactionRowPresentation={{
          transactionFilter: row => row.id === transaction.id,
          displayLabel: row => `CZ source: ${row.label}`,
          leadingVisual: row =>
            React.createElement(ExistingPfmFallback, { transaction: row }),
        }}
      />
    </SourceContext>,
  )

  expect(latestPreview().route).toEqual({
    screen: 'card',
    params: { productId: card.id, cardId: card.id },
  })
  expect(latestPreview().snapshot?.bankingPresentation).toEqual({
    productCategories: deriveProductCategories({ country: 'CZ', release: 'release-future-evo-2027', resolvedProductCounts: productCounts }),
    productId: card.id,
    rows: [
      {
        transaction: expect.objectContaining({ id: transaction.id }),
        displayLabel: `CZ source: ${transaction.label}`,
        leadingVisual: {
          kind: 'pfm',
          category: transaction.pfmCategory,
          variant: 'category-circle',
          size: 32,
        },
      },
    ],
  })
})

it('keeps an empty Source transaction filter as an empty Native row list', () => {
  const onBack = vi.fn()
  const onTransactionCategoryChange = vi.fn()
  const transaction = getAccountTransactions('RO', 0, 'RON')[0]!
  const selection: PfmCategorySelection = {
    groupId: 'source-category',
    groupLabel: 'Source category',
    category: 'Shopping',
    subcategory: 'Source subcategory',
  }
  render(
    <SourceContext>
      <AccountDetailScreen
        selectedProductId="acc-1"
        onBack={onBack}
        onDetailsClick={vi.fn()}
        onOptionsClick={vi.fn()}
        onTransactionCategoryChange={onTransactionCategoryChange}
        transactionRowPresentation={{
          transactionFilter: () => false,
          leadingVisual: transaction =>
            React.createElement(ExistingPfmFallback, { transaction }),
        }}
      />
    </SourceContext>,
  )

  const adapter = latestPreview()
  expect(adapter.snapshot?.bankingPresentation).toMatchObject({
    productId: 'acc-1',
    rows: [],
  })
  adapter.events?.onTransactionCategoryChange?.(transaction, selection)
  expect(onTransactionCategoryChange).toHaveBeenCalledWith(
    transaction,
    selection,
  )
})

it('maps Native card lifecycle and help events back to Source Product callbacks', () => {
  const callbacks = {
    active: vi.fn(),
    detailsRequest: vi.fn(),
    details: vi.fn(),
    help: vi.fn(),
    opportunity: vi.fn(),
  }
  render(
    <SourceContext>
      <CardDetailScreen
        selectedCardId="card-debit-1"
        onBack={vi.fn()}
        onActiveCardChange={callbacks.active}
        onShowCardDetailsRequest={callbacks.detailsRequest}
        onShowCardDetailsClick={callbacks.details}
        onHelpClick={callbacks.help}
        onAiOpportunityClick={callbacks.opportunity}
        aiOpportunityNudge={{
          title: 'Review your card',
          body: 'There is a useful card insight.',
          ctaLabel: 'Review',
        }}
      />
    </SourceContext>,
  )

  const adapter = latestPreview()
  expect(adapter.snapshot?.bankingPresentation?.aiOpportunityNudge).toEqual({
    title: 'Review your card',
    body: 'There is a useful card insight.',
    ctaLabel: 'Review',
  })
  adapter.events?.onActiveCardChange?.('card-debit-2')
  adapter.events?.onShowCardDetailsRequest?.('card-debit-1')
  adapter.events?.onShowCardDetails?.('card-debit-1')
  adapter.events?.onHelpRequest?.()
  adapter.events?.onAiOpportunityClick?.()

  expect(callbacks.active).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'card-debit-2', type: 'debit_card' }),
  )
  expect(callbacks.detailsRequest).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'card-debit-1', type: 'debit_card' }),
  )
  expect(callbacks.details).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'card-debit-1', type: 'debit_card' }),
  )
  expect(callbacks.help).toHaveBeenCalledOnce()
  expect(callbacks.opportunity).toHaveBeenCalledOnce()
})
