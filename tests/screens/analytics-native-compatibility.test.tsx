// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { DemoProvider, DEFAULT_PRODUCT_COUNTS } from '@/app/state/demoStore'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import AnalyticsScreen, { AnalyticsHeader } from '@/app/screens/analytics/AnalyticsScreen'
import Evo2027AnalyticsScreen from '@/app/screens/analytics/Evo2027AnalyticsScreen'
import PfmCategoryDetailScreen from '@/app/screens/analytics/PfmCategoryDetailScreen'
import type { NativeDemoRoute, NativeDemoSnapshot } from '@/features/demo-native/contracts'
import type { NativeScreenPreviewProps } from '@/app/components/demo/NativeScreenPreview'
import type { SpendingAnalyticsTimeline, SpendingAnalyticsTransaction } from '@/data/spendingAnalytics'
import type { PfmCategoryName } from '@/data/pfmCategories'

const preview = vi.hoisted(() => ({ calls: [] as unknown[] }))

vi.mock('@/app/components/demo/NativeScreenPreview', () => ({
  NativeScreenPreview: (props: unknown) => {
    preview.calls.push(props)
    return null
  },
}))

function SourceContext({
  release = 'release-current',
  children,
}: PropsWithChildren<{ release?: 'release-current' | 'release-future-evo-2027' }>) {
  return (
    <DemoProvider
      initialState={{
        product: 'PI',
        country: 'CZ',
        release,
        scenario: 'active',
        bankingScenario: 'retail-single-account',
        productCounts: { ...DEFAULT_PRODUCT_COUNTS, accounts: 2 },
      }}
    >
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  )
}

function latestPreview(): NativeScreenPreviewProps {
  return preview.calls.at(-1) as NativeScreenPreviewProps
}

beforeEach(() => {
  preview.calls = []
})

afterEach(cleanup)

it('renders the named analytics header region through Native and forwards Messages', () => {
  const onMessagesClick = vi.fn()
  render(
    <SourceContext>
      <AnalyticsHeader onMessagesClick={onMessagesClick} />
    </SourceContext>,
  )

  const adapter = latestPreview()
  expect(adapter.route).toEqual({ screen: 'pfm' })
  expect(adapter.snapshot).toMatchObject({
    componentPreview: { kind: 'analytics-header' },
    screenTopInset: 0,
  })
  expect(adapter.onNavigate?.({ screen: 'messages' }, 'push')).toBe(true)
  expect(onMessagesClick).toHaveBeenCalledOnce()
})

it('mounts current PFM Native UI and carries category overrides and callbacks', () => {
  const onHomeClick = vi.fn()
  const onProductsClick = vi.fn()
  const onTransactionClick = vi.fn()
  const transactionCategoryOverrides = {
    'transaction-1': {
      groupId: 'groceries',
      groupLabel: 'Groceries',
      category: 'Groceries' as PfmCategoryName,
      subcategory: 'Supermarket',
    },
  }

  render(
    <SourceContext>
      <AnalyticsScreen
        onHomeClick={onHomeClick}
        onProductsClick={onProductsClick}
        onTransactionClick={onTransactionClick}
        transactionCategoryOverrides={transactionCategoryOverrides}
      />
    </SourceContext>,
  )

  const adapter = latestPreview()
  expect(adapter.route).toEqual({ screen: 'pfm' })
  expect(adapter.snapshot?.bankingPresentation?.transactionCategoryOverrides).toEqual(transactionCategoryOverrides)
  expect(adapter.onNavigate?.({ screen: 'home' }, 'push')).toBe(true)
  expect(onHomeClick).toHaveBeenCalledOnce()
  expect(adapter.onNavigate?.({ screen: 'products' }, 'push')).toBe(true)
  expect(onProductsClick).toHaveBeenCalledOnce()

  const transaction = {
    id: 'transaction-1',
    sourceProductId: 'account-2',
    sourceProductName: 'Current account',
  } as Parameters<NonNullable<typeof onTransactionClick>>[0]
  adapter.events?.onTransactionSelected?.({
    transaction,
    productId: 'account-2',
    source: 'account',
  })
  expect(onTransactionClick).toHaveBeenCalledWith(transaction)
  const routedTransaction = {
    ...transaction,
    id: 'routed-transaction',
    sourceProductId: 'account-2',
    amount: -12,
    month: '2026-09',
    label: 'Coffee shop',
    status: 'Booked',
  } as SpendingAnalyticsTransaction
  expect(
    adapter.onNavigate?.(
      {
        screen: 'transaction',
        params: {
          productId: 'account-2',
          transactionId: routedTransaction.id,
          analyticsTransaction: JSON.stringify(routedTransaction),
        },
      },
      'push',
    ),
  ).toBe(true)
  expect(onTransactionClick).toHaveBeenLastCalledWith(routedTransaction)
})

it('forwards Evo scope and direction as Native route data', () => {
  const onAddTransaction = vi.fn()
  render(
    <SourceContext release="release-future-evo-2027">
      <Evo2027AnalyticsScreen initialScopeId="acc-2" initialDirection="income" onAddTransaction={onAddTransaction} />
    </SourceContext>,
  )

  const adapter = latestPreview()
  expect(adapter.route).toEqual({
    screen: 'pfm',
    params: { scopeId: 'acc-2', direction: 'income' },
  })
  const addIntent: NativeDemoRoute = {
    screen: 'pfm',
    params: { intent: 'add-transaction' },
  }
  expect(adapter.onNavigate?.(addIntent, 'push')).toBe(true)
  expect(onAddTransaction).toHaveBeenCalledOnce()
})

it('opens Native PFM from the compatibility category-detail export', () => {
  const timeline = {
    periods: [{ key: '2026-09', kind: 'month', label: 'September', year: '2026' }],
    activePeriodKey: '2026-09',
    summariesByPeriodKey: {
      '2026-09': { sourceTransactions: [] },
    },
  } as unknown as SpendingAnalyticsTimeline
  const onBack = vi.fn()
  const onPeriodChange = vi.fn()

  render(
    <SourceContext>
      <PfmCategoryDetailScreen
        category="Shopping"
        direction="out"
        timeline={timeline}
        activePeriodKey="2026-09"
        onPeriodChange={onPeriodChange}
        onBack={onBack}
      />
    </SourceContext>,
  )

  const adapter = latestPreview()
  expect(adapter.route).toEqual({
    screen: 'pfm',
    params: {
      category: 'Shopping',
      direction: 'out',
      periodKey: '2026-09',
      externalDetail: 'true',
    },
  })
  expect(adapter.onBack).toBe(onBack)
  expect(adapter.snapshot).toMatchObject({
    bankingPresentation: {
      transactionCategoryOverrides: {},
    },
  } as Partial<NativeDemoSnapshot>)
  const periodIntent: NativeDemoRoute = {
    screen: 'pfm',
    params: { intent: 'period-change', periodKey: '2026-08' },
  }
  expect(adapter.onNavigate?.(periodIntent, 'push')).toBe(true)
  expect(onPeriodChange).toHaveBeenCalledWith('2026-08')
})
