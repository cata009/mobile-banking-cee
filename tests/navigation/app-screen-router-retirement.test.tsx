// @vitest-environment jsdom
import { Suspense } from 'react'
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppScreenRouter } from '@/app/AppScreenRouter'
import type { AppCoordinators } from '@/app/coordinators/useAppCoordinators'
import type { AppShellActions } from '@/app/AppShell'

vi.mock('@/app/screens/home/HomeScreen', () => ({
  default: () => <div data-testid="legacy-pi-home">Legacy Source PI home</div>,
}))
vi.mock('@/app/navigation/nativePlatformRouter', () => ({
  default: () => <div data-testid="platform-router">Platform route</div>,
}))
vi.mock('@/app/navigation/legacyExcludedRouter', () => ({
  default: () => <div data-testid="legacy-excluded-router">Excluded route</div>,
}))

afterEach(() => {
  cleanup()
  window.history.replaceState({}, '', '/')
})

function fixture(contextOverrides: Record<string, unknown> = {}) {
  const noop = () => undefined
  const empty = new Proxy({}, { get: () => undefined })
  const actions = new Proxy({}, { get: () => noop })
  const coordinators = {
    context: {
      currentScreen: 'homepage',
      product: 'PI',
      country: 'RO',
      scenario: 'active',
      designSystem: 'current',
      release: 'release-current',
      coAppingAvailable: false,
      isCzCoAppingChatbotPreviewActive: false,
      isCzRoboAdvisorPreviewActive: false,
      myBankerAvailable: false,
      futureGainSmartInvestmentAvailable: false,
      isKidsRuntimeContext: false,
      isSupportedRuntimeContext: true,
      investmentsPortfolioAvailable: true,
      parsedDeepLink: null,
      ...contextOverrides,
    },
    accounts: { view: empty, actions },
    investments: { view: empty, actions },
    analytics: { view: empty, actions },
    products: { view: empty, actions },
    flowLibrary: { view: empty, actions },
    chat: { view: empty, actions },
  } as unknown as AppCoordinators
  const shell = new Proxy({}, { get: () => noop }) as AppShellActions
  return { coordinators, shell }
}

describe('normal AppScreenRouter retirement boundary', () => {
  it('does not render the PI Source customer route tree on the default route', async () => {
    const { coordinators, shell } = fixture()
    render(<Suspense fallback={<div>Loading router</div>}><AppScreenRouter coordinators={coordinators} shell={shell} /></Suspense>)
    expect(await screen.findByTestId('native-required')).toBeInTheDocument()
    expect(screen.queryByTestId('legacy-pi-home')).not.toBeInTheDocument()
  })

  it('does not restore the PI Source route through an in-app reference query', async () => {
    window.history.replaceState({}, '', '/?renderer=reference&product=PI&country=RO&release=release-current')
    const { coordinators, shell } = fixture()
    render(<Suspense fallback={<div>Loading router</div>}><AppScreenRouter coordinators={coordinators} shell={shell} /></Suspense>)
    expect(await screen.findByTestId('native-required')).toBeInTheDocument()
    expect(screen.queryByTestId('legacy-pi-home')).not.toBeInTheDocument()
  })

  it('delegates platform routes to the retained platform router', () => {
    const { coordinators, shell } = fixture({ currentScreen: 'tools' })
    render(<AppScreenRouter coordinators={coordinators} shell={shell} />)
    expect(screen.getByTestId('platform-router')).toBeInTheDocument()
  })

  it('delegates excluded customer contexts to their retained router', () => {
    const { coordinators, shell } = fixture({
      product: 'KIDS_PI',
      isKidsRuntimeContext: true,
    })
    render(<AppScreenRouter coordinators={coordinators} shell={shell} />)
    expect(screen.getByTestId('legacy-excluded-router')).toBeInTheDocument()
  })
})




