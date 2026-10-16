// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'

const fixture = vi.hoisted(() => ({
  state: {
    product: 'PI',
    country: 'RO',
    designSystem: 'current',
    baseline: 'baseline-current',
    release: 'release-current',
    scenario: 'active',
    bankingScenario: 'retail-single-account',
    themeMode: 'light',
    amountsHidden: false,
    flagsByContext: {},
  } as Record<string, unknown>,
  route: { screen: 'homepage' },
  nativeProps: {} as Record<string, unknown>,
}))
vi.mock('@/app/coordinators/useAppCoordinators', () => ({
  useAppCoordinators: () => ({
    context: {
      ...fixture.state,
      demoState: fixture.state,
      currentScreen: fixture.route.screen,
      currentRoute: fixture.route,
      currentRoutePolicy: { surface: 'app' },
      isCoAppingActive: true,
      coAppingAvailable: true,
      isSupportedRuntimeContext: true,
      isKidsRuntimeContext: false,
      navigateTo: vi.fn(),
      goBack: vi.fn(),
      setCoAppingActive: vi.fn(),
    },
    products: { view: {}, actions: { focusHandled: vi.fn(), heroCollapsedChanged: vi.fn() } },
    chat: {
      view: { czChatOpen: false, czChatContext: null, czChatInitialMode: 'chat', czChatOpportunities: [] },
      actions: {},
    },
    accounts: {
      view: { selectedTransaction: null, selectedAccountProduct: null, paymentDraft: null, accountProducts: [] },
      actions: {},
    },
    investments: { view: {}, actions: {} },
  }),
}))
vi.mock('@/app/components/demo/NativeDemoSurface', () => ({
  NativeDemoSurface: (props: Record<string, unknown>) => {
    fixture.nativeProps = props
    return <p>Canonical Native UI</p>
  },
  rememberedNativeRoute: () => null,
}))
vi.mock('@/app/AppScreenRouter', () => ({
  AppScreenRouter: () => <p>Legacy customer UI</p>,
  FloatingCoAppingButton: () => <p>Legacy co-app overlay</p>,
  TerminateSessionPopup: () => null,
}))
vi.mock('@/app/components/demo/DemoNavigationSync', () => ({ DemoNavigationSync: () => null }))
vi.mock('@/app/components/MobileFrame', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))
vi.mock('@/app/components/FramelessDeviceFrame', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))
import { AppShell } from '@/app/AppShell'

afterEach(() => {
  cleanup()
  window.history.replaceState({}, '', '/')
})
describe('Native-only customer UI ownership in the real shell', () => {
  it.each(['', '?renderer=reference'])('cannot switch PI back to legacy with an absent module or query %s', (query) => {
    window.history.replaceState({}, '', `/${query}`)
    render(<AppShell parsedDeepLink={null} deviceMode app2027Theme="standard" />)
    expect(screen.getByText('Canonical Native UI')).toBeInTheDocument()
    expect(screen.queryByText('Legacy customer UI')).not.toBeInTheDocument()
    expect(screen.queryByText('Legacy co-app overlay')).not.toBeInTheDocument()
    expect(fixture.nativeProps).not.toHaveProperty('fallback')
  })
})
