// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest'
import { DemoProvider } from '@/app/state/demoStore'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import type { NativeDemoRoute, NativeInvestmentHistoryOverrides } from '@/features/demo-native/contracts'
import InvestmentsPortfolioScreen from '@/app/screens/investments/InvestmentsPortfolioScreen'
import InvestmentsHistoryScreen from '@/app/screens/investments/InvestmentsHistoryScreen'
import OrdersToApproveScreen from '@/app/screens/investments/OrdersToApproveScreen'
import SmartInvestmentScreen from '@/app/screens/investments/SmartInvestmentScreen'
import FutureGainPeerInsightsScreen from '@/app/screens/investments/FutureGainPeerInsightsScreen'
import type { NativeScreenPreviewProps } from '@/app/components/demo/NativeScreenPreview'

const preview = vi.hoisted(() => ({ calls: [] as unknown[] }))

vi.mock('@/app/components/demo/NativeScreenPreview', () => ({
  NativeScreenPreview: (props: unknown) => {
    preview.calls.push(props)
    return null
  },
}))

const counts = {
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

function SourceContext({ children }: PropsWithChildren) {
  return (
    <DemoProvider
      initialState={{
        product: 'PI',
        country: 'CZ',
        release: 'release-future-evo-2027',
        scenario: 'active',
        bankingScenario: 'retail-single-account',
        productCounts: counts,
      }}
    >
      <LanguageProvider initialLanguage="cs">{children}</LanguageProvider>
    </DemoProvider>
  )
}

function latestPreview(): NativeScreenPreviewProps {
  return preview.calls.at(-1) as NativeScreenPreviewProps
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

it('adapts the Source portfolio route and forwards investment request DTOs and events', () => {
  const onBack = vi.fn()
  const onBuyRequestConsumed = vi.fn()
  const onSelectedSecurityChange = vi.fn()
  const onReturnToFutureGainSimulator = vi.fn()
  const onHistoryClick = vi.fn()
  const onOrdersToApproveClick = vi.fn()
  const buyRequest = {
    requestId: 31,
    securityId: 'balanced-income',
    draft: {
      quantity: 2,
      accountId: 'acc-2',
      frequency: 'one-off' as const,
      executionTiming: 'next-business-day' as const,
    },
  }
  const fundsWindowRequest = {
    requestId: 32,
    collectionId: 'balanced' as const,
  }
  const securityDetailRequest = {
    requestId: 33,
    securityId: 'sustainable-future',
    futureGainSimulatorState: {
      securityId: 'sustainable-future',
      amountInput: '1.000,50',
      currency: 'RSD' as const,
    },
  }

  render(
    <SourceContext>
      <InvestmentsPortfolioScreen
        onBack={onBack}
        initialView="goals"
        fundsWindowRequest={fundsWindowRequest}
        securityDetailRequest={securityDetailRequest}
        buyRequest={buyRequest}
        onBuyRequestConsumed={onBuyRequestConsumed}
        onSelectedSecurityChange={onSelectedSecurityChange}
        onReturnToFutureGainSimulator={onReturnToFutureGainSimulator}
        onHistoryClick={onHistoryClick}
        onOrdersToApproveClick={onOrdersToApproveClick}
        bottomInset={24}
      />
    </SourceContext>,
  )

  const adapter = latestPreview()
  expect(adapter.route).toEqual({
    screen: 'investments',
    params: { entry: 'portfolio', view: 'goals' },
  })
  expect(adapter.snapshot?.bottomInset).toBe(24)
  expect(adapter.snapshot?.investmentPresentation).toBeUndefined()
  expect(adapter.snapshot?.primaryNavigationVisible).toBe(false)
  expect(adapter.snapshot?.investmentRequests).toEqual({
    buy: buyRequest,
    funds: fundsWindowRequest,
    detail: securityDetailRequest,
  })
  expect(adapter.events?.onInvestmentBuyRequestConsumed).toBe(onBuyRequestConsumed)
  expect(adapter.events?.onInvestmentSecuritySelected).toBe(onSelectedSecurityChange)
  expect(adapter.events?.onInvestmentReturnToSimulator).toBe(onReturnToFutureGainSimulator)
  expect(adapter.onBack).toBe(onBack)

  const historyRoute: NativeDemoRoute = {
    screen: 'investments',
    params: { entry: 'history', filterByTitle: 'Balanced Income' },
  }
  expect(adapter.onNavigate?.(historyRoute, 'push')).toBe(true)
  expect(onHistoryClick).toHaveBeenCalledWith('Balanced Income')
  expect(adapter.onNavigate?.({ screen: 'investments', params: { entry: 'approvals' } }, 'push')).toBe(true)
  expect(onOrdersToApproveClick).toHaveBeenCalledOnce()
})

it('keeps CZ Robo footer routes inside the Native preview', () => {
  const onBack = vi.fn()
  const onHistoryClick = vi.fn()
  const onOrdersToApproveClick = vi.fn()

  render(
    <SourceContext>
      <InvestmentsPortfolioScreen
        onBack={onBack}
        onHistoryClick={onHistoryClick}
        onOrdersToApproveClick={onOrdersToApproveClick}
        showBottomNavigation
        roboAdvisorEnabled
      />
    </SourceContext>,
  )

  const adapter = latestPreview()
  expect(adapter.snapshot?.investmentPresentation).toEqual({
    roboAdvisorEnabled: true,
    showBottomNavigation: true,
  })
  expect(adapter.onNavigate?.({ screen: 'investments', params: { entry: 'history' } }, 'push')).toBe(false)
  expect(adapter.onNavigate?.({ screen: 'investments', params: { entry: 'approvals' } }, 'push')).toBe(false)
  expect(onHistoryClick).not.toHaveBeenCalled()
  expect(onOrdersToApproveClick).not.toHaveBeenCalled()
})

it('keeps explicit Source-disabled Robo presentation flags', () => {
  const onBack = vi.fn()

  render(
    <SourceContext>
      <InvestmentsPortfolioScreen onBack={onBack} roboAdvisorEnabled={false} showBottomNavigation={false} />
    </SourceContext>,
  )

  expect(latestPreview().snapshot?.investmentPresentation).toEqual({
    roboAdvisorEnabled: false,
    showBottomNavigation: false,
  })
})

it('adapts history DTO overrides and tab callbacks without Source UI rendering', () => {
  const onBack = vi.fn()
  const onTabChange = vi.fn()
  const onToApproveClick = vi.fn()
  const overrides: NativeInvestmentHistoryOverrides = {
    transactions: [],
    orders: [],
    initialTab: 'orders',
    hideAllTimeDateOption: true,
    hideCurrencyFilter: true,
    allDatesByDefault: true,
    historyFilterByTitle: 'Balanced Income',
    historyFilterBySecurityId: 'balanced-income',
    approvalCount: 3,
    titleOverride: 'Goal activity',
    closeModuleButton: true,
    includeCzRoboHistoricalTransactions: true,
  }

  render(
    <SourceContext>
      <InvestmentsHistoryScreen
        onBack={onBack}
        initialTab="orders"
        allDatesByDefault
        hideAllTimeDateOption
        hideCurrencyFilter
        historyFilterByTitle="Balanced Income"
        historyFilterBySecurityId="balanced-income"
        approvalCount={3}
        titleOverride="Goal activity"
        closeModuleButton
        includeCzRoboHistoricalTransactions
        transactionsOverride={overrides.transactions}
        ordersOverride={overrides.orders}
        onTabChange={onTabChange}
        onToApproveClick={onToApproveClick}
      />
    </SourceContext>,
  )

  const adapter = latestPreview()
  expect(adapter.route).toEqual({
    screen: 'investments',
    params: {
      entry: 'history',
      tab: 'orders',
      filterByTitle: 'Balanced Income',
      filterBySecurityId: 'balanced-income',
      allDatesByDefault: 'true',
      titleOverride: 'Goal activity',
      closeModuleButton: 'true',
    },
  })
  expect(adapter.snapshot?.investmentHistoryOverrides).toEqual(overrides)
  expect(adapter.snapshot?.investmentHistoryOverrides?.approvalCount).toBe(3)
  expect(adapter.snapshot?.investmentHistoryOverrides?.titleOverride).toBe('Goal activity')
  expect(adapter.snapshot?.investmentHistoryOverrides?.closeModuleButton).toBe(true)
  expect(adapter.snapshot?.investmentHistoryOverrides?.includeCzRoboHistoricalTransactions).toBe(true)
  expect(adapter.events?.onInvestmentHistoryTabChange).toBe(onTabChange)
  expect(adapter.events?.onInvestmentHistoryToApprove).toBe(onToApproveClick)
  expect(adapter.snapshot?.primaryNavigationVisible).toBe(false)
  expect(adapter.onBack).toBe(onBack)
  expect(adapter.onNavigate?.({ screen: 'investments', params: { entry: 'approvals' } }, 'push')).toBe(true)
  expect(onToApproveClick).toHaveBeenCalledOnce()
})

it('adapts orders-to-approve to the Native approvals entry', () => {
  const onBack = vi.fn()
  render(
    <SourceContext>
      <OrdersToApproveScreen onBack={onBack} />
    </SourceContext>,
  )

  expect(latestPreview().route).toEqual({
    screen: 'investments',
    params: { entry: 'approvals' },
  })
  expect(latestPreview().onBack).toBe(onBack)
  expect(latestPreview().snapshot?.primaryNavigationVisible).toBe(false)
})

it('adapts the Smart Investment route and its simulator callbacks', () => {
  const onBack = vi.fn()
  const onExploreInvestmentFunds = vi.fn()
  const initialFundSimulatorState = {
    securityId: 'sustainable-future',
    amountInput: '1.000,50',
    currency: 'RSD' as const,
  }

  render(
    <SourceContext>
      <SmartInvestmentScreen
        onBack={onBack}
        onExploreInvestmentFunds={onExploreInvestmentFunds}
        initialFundSimulatorState={initialFundSimulatorState}
      />
    </SourceContext>,
  )

  expect(latestPreview().route).toEqual({ screen: 'smart-investment' })
  expect(latestPreview().snapshot?.futureGainSimulatorResumeState).toEqual(initialFundSimulatorState)
  expect(latestPreview().snapshot?.primaryNavigationVisible).toBe(false)
  expect(latestPreview().events?.onFutureGainInvestmentFunds).toBe(onExploreInvestmentFunds)
  expect(latestPreview().events?.onSmartInvestmentBack).toBe(onBack)
  expect(latestPreview().onBack).toBe(onBack)
})

it('adapts Future Gain Peer Insights to the Native peer-insights route', () => {
  const onBack = vi.fn()
  render(
    <SourceContext>
      <FutureGainPeerInsightsScreen onBack={onBack} />
    </SourceContext>,
  )

  expect(latestPreview().route).toEqual({ screen: 'peer-insights' })
  expect(latestPreview().snapshot?.primaryNavigationVisible).toBe(false)
  expect(latestPreview().onBack).toBe(onBack)
})
