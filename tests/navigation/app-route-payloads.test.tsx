// @vitest-environment jsdom
import React from 'react'
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DemoProvider } from '@/app/state/demoStore'
import { NavigationProvider, useNavigationContext, type NavigationRoute } from '@/app/contexts/NavigationContext'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { useAppCoordinators } from '@/app/coordinators/useAppCoordinators'
import type { ProductDetailSelection } from '@/app/components/products/ProductCardBottomSheet'
function Wrapper({ children }: React.PropsWithChildren) {
  return (
    <DemoProvider initialState={{ country: 'CZ', release: 'release-future-evo-2027' }}>
      <NavigationProvider initialScreen="homepage">
        <LanguageProvider>{children}</LanguageProvider>
      </NavigationProvider>
    </DemoProvider>
  )
}
function setup() {
  return renderHook(
    () => ({ ...useAppCoordinators({ parsedDeepLink: null, deviceMode: false }), navigation: useNavigationContext() }),
    { wrapper: Wrapper },
  )
}
beforeEach(() => window.history.replaceState({}, '', '/'))
afterEach(cleanup)
describe('persistent feature route payloads', () => {
  it('restores analytics scope and direction after a different entry', () => {
    const { result } = setup()
    act(() => result.current.context.navigateTo({ screen: 'analytics', scopeId: 'acc-1', direction: 'expense' }))
    expect(result.current.analytics.view.analyticsInitialScopeId).toBe('acc-1')
    act(() => result.current.context.navigateTo({ screen: 'analytics', scopeId: 'acc-2', direction: 'income' }))
    act(() => result.current.context.goBack())
    expect(result.current.analytics.view).toEqual({
      analyticsInitialScopeId: 'acc-1',
      analyticsInitialDirection: 'expense',
    })
  })
  it('restores investment goals and filtered history while legacy chat entries keep their last selections', () => {
    const { result } = setup()
    act(() => result.current.investments.actions.handleInvestmentGoalsClick())
    expect(result.current.investments.view.investmentsInitialView).toBe('goals')
    act(() => result.current.investments.actions.handleInvestmentsClick())
    act(() => result.current.context.goBack())
    expect(result.current.investments.view.investmentsInitialView).toBe('goals')
    act(() => result.current.investments.actions.handleInvestmentsHistoryClick('Balanced fund'))
    act(() => result.current.investments.actions.handleInvestmentsHistoryClick('Other fund'))
    act(() => result.current.context.goBack())
    expect(result.current.investments.view.historyFilterByTitle).toBe('Balanced fund')
    act(() =>
      result.current.chat.actions.handleCzChatAction({
        id: 'history',
        label: 'History',
        type: 'navigate',
        target: 'investments-history',
      }),
    )
    expect(result.current.investments.view.historyFilterByTitle).toBe('Balanced fund')
    act(() =>
      result.current.chat.actions.handleCzChatAction({
        id: 'investments',
        label: 'Investments',
        type: 'navigate',
        target: 'investments',
      }),
    )
    expect(result.current.investments.view.investmentsInitialView).toBe('goals')
  })
  it('restores a product selection instead of retaining the most recently opened product', () => {
    const { result } = setup()
    const first = {
      title: 'First product',
      cardId: 'investments-savings',
      categoryTitle: 'Investments',
      optionId: 'first',
    } satisfies ProductDetailSelection
    const second = {
      title: 'Second product',
      cardId: 'investments-savings',
      categoryTitle: 'Investments',
      optionId: 'second',
    } satisfies ProductDetailSelection
    act(() => result.current.products.actions.handleProductDetailOpen(first))
    act(() => result.current.products.actions.handleProductDetailOpen(second))
    act(() => result.current.context.goBack())
    expect(result.current.products.view.selectedProductDetail).toEqual(first)
    act(() => result.current.context.navigateTo('product-detail'))
    expect(result.current.products.view.selectedProductDetail).toEqual(first)
  })
  it('persists flow changes without adding unrelated navigation history', () => {
    const { result } = setup()
    act(() => result.current.context.navigateTo('flow-library'))
    const historyLength = result.current.navigation.history.length
    act(() => result.current.flowLibrary.actions.selectFlow('ro-round-up'))
    expect(result.current.context.currentRoute).toEqual({
      screen: 'flow-library',
      flowId: 'ro-round-up',
      view: 'detail',
    })
    expect(result.current.navigation.history.length).toBe(historyLength)
    act(() => result.current.flowLibrary.actions.changeView('index'))
    expect(result.current.flowLibrary.view.flowLibraryEntryView).toBe('index')
    act(() => result.current.context.navigateTo('homepage'))
    act(() => result.current.context.goBack())
    expect(result.current.flowLibrary.view.flowLibraryEntryView).toBe('index')
  })
})

it.each([
  { screen: 'analytics', scopeId: 'acc-2', direction: 'income' },
  { screen: 'investments', initialView: 'goals' },
  {
    screen: 'product-detail',
    selection: {
      title: 'Restored product',
      cardId: 'investments-savings',
      categoryTitle: 'Investments',
      optionId: 'restored',
    },
  },
  { screen: 'account-detail', accountId: 'acc-2' },
] satisfies NavigationRoute[])('uses restored route payload on the first screen render: $screen', (route) => {
  const seen: unknown[] = []
  function RouteWrapper({ children }: React.PropsWithChildren) {
    return (
      <DemoProvider initialState={{ country: 'CZ', release: 'release-future-evo-2027' }}>
        <NavigationProvider initialRoute={route}>
          <LanguageProvider>{children}</LanguageProvider>
        </NavigationProvider>
      </DemoProvider>
    )
  }
  renderHook(
    () => {
      const c = useAppCoordinators({ parsedDeepLink: null, deviceMode: false })
      seen.push(
        route.screen === 'analytics'
          ? c.analytics.view.analyticsInitialScopeId
          : route.screen === 'investments'
            ? c.investments.view.investmentsInitialView
            : route.screen === 'product-detail'
              ? c.products.view.selectedProductDetail
              : c.accounts.view.selectedAccountId,
      )
      return c
    },
    { wrapper: RouteWrapper },
  )
  expect(seen[0]).toEqual(
    route.screen === 'analytics'
      ? route.scopeId
      : route.screen === 'investments'
        ? route.initialView
        : route.screen === 'product-detail'
          ? route.selection
          : route.screen === 'account-detail'
            ? route.accountId
            : undefined,
  )
})

it('preserves a newly selected flow when the screen reports selection and view in the same event', () => {
  const { result } = setup()
  act(() => result.current.context.navigateTo('flow-library'))
  act(() => {
    result.current.flowLibrary.actions.selectFlow('ro-card-pin')
    result.current.flowLibrary.actions.changeView('detail')
  })
  expect(result.current.flowLibrary.view.selectedFlowPreviewId).toBe('ro-card-pin')
  expect(result.current.context.currentRoute).toEqual({ screen: 'flow-library', flowId: 'ro-card-pin', view: 'detail' })
})
// Window events originate in global controls. They update library selection,
// including off-screen memory, without taking the operator away from a screen.
it('keeps external flow events on their current screen and restores library memory on entry', () => {
  const { result } = setup()
  act(() => window.dispatchEvent(new CustomEvent('flow-preview-select', { detail: 'ro-card-pin' })))
  expect(result.current.context.currentScreen).toBe('homepage')
  expect(result.current.navigation.history).toHaveLength(1)
  act(() => result.current.context.navigateTo('flow-library'))
  expect(result.current.flowLibrary.view).toEqual({
    selectedFlowPreviewId: 'ro-card-pin',
    flowLibraryEntryView: 'detail',
  })
  act(() => window.dispatchEvent(new Event('flow-library-open-index')))
  expect(result.current.context.currentScreen).toBe('flow-library')
  expect(result.current.flowLibrary.view.flowLibraryEntryView).toBe('index')
  expect(result.current.navigation.history).toHaveLength(2)
})
it('keeps analytics scope and assistant visibility for plain chat navigation', () => {
  const { result } = setup()
  act(() => result.current.context.navigateTo({ screen: 'analytics', scopeId: 'acc-2', direction: 'income' }))
  act(() => result.current.chat.actions.openCzChatForYou())
  act(() =>
    result.current.chat.actions.handleCzChatAction({
      id: 'analytics',
      label: 'Analytics',
      type: 'navigate',
      target: 'analytics',
    }),
  )
  expect(result.current.analytics.view).toEqual({
    analyticsInitialScopeId: 'acc-2',
    analyticsInitialDirection: 'income',
  })
  expect(result.current.chat.view.czChatOpen).toBe(true)
  act(() => result.current.analytics.actions.handleAnalyticsClick())
  expect(result.current.analytics.view).toEqual({ analyticsInitialScopeId: null, analyticsInitialDirection: null })
})
it('keeps independent Future Gain request IDs and clears resumed simulator state when returning home', () => {
  const { result } = setup()
  const simulator = { securityId: 'balanced-income', amountInput: '250', currency: 'EUR' } as const
  act(() => result.current.investments.actions.handleFutureGainInvestmentFundsClick(simulator))
  expect(result.current.investments.view.investmentSecurityDetailRequest).toEqual({
    requestId: 1,
    securityId: 'balanced-income',
    futureGainSimulatorState: simulator,
  })
  act(() => result.current.investments.actions.requestFunds('balanced'))
  expect(result.current.investments.view.investmentFundsRequest?.requestId).toBe(1)
  act(() => result.current.investments.actions.handleFutureGainInvestmentFundsClick(simulator))
  expect(result.current.investments.view.investmentSecurityDetailRequest?.requestId).toBe(2)
  act(() => result.current.investments.actions.handleReturnToFutureGainSimulator(simulator))
  expect(result.current.context.currentScreen).toBe('smart-investment')
  expect(result.current.investments.view.futureGainFundSimulatorResumeState).toEqual(simulator)
  act(() => result.current.investments.actions.handleSmartInvestmentBack())
  expect(result.current.context.currentScreen).toBe('homepage')
  expect(result.current.investments.view.futureGainFundSimulatorResumeState).toBeNull()
  expect(result.current.navigation.history).toEqual([{ screen: 'homepage' }])
})
