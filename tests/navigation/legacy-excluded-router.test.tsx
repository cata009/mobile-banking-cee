// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import LegacyExcludedRouter from '@/app/navigation/legacyExcludedRouter'
import type { AppCoordinators } from '@/app/coordinators/useAppCoordinators'

vi.mock('@/app/screens/kids/KidsMarketHomeApp', () => ({
  default: ({ country }: { country: string }) => <div data-testid="kids-home">{country} Kids home</div>,
}))
vi.mock('@/experiences/pi/it/mobile-first/MobileFirstHome', () => ({
  default: ({ onPhoneChromeChange }: { onPhoneChromeChange: (variant: 'light' | 'dark') => void }) => (
    <button data-testid="italy-home" onClick={() => onPhoneChromeChange('dark')}>Italy Mobile First</button>
  ),
}))
vi.mock('@/app/components/UnsupportedContextScreen', () => ({
  default: ({ product, designSystem }: { product: string; designSystem: string }) => (
    <div data-testid="unsupported-context">{product} / {designSystem}</div>
  ),
}))

function coordinators(values: Record<string, unknown>): AppCoordinators {
  return { context: values } as unknown as AppCoordinators
}

describe('LegacyExcludedRouter', () => {
  it('keeps the Kids market route on its separate Source app', () => {
    render(<LegacyExcludedRouter coordinators={coordinators({
      product: 'KIDS_PI', country: 'HU', designSystem: 'current', currentScreen: 'homepage',
      isKidsRuntimeContext: true, isSupportedRuntimeContext: true,
    })} />)
    expect(screen.getByTestId('kids-home')).toHaveTextContent('HU Kids home')
  })

  it('keeps the PI Italy Mobile First home and its status-bar callback', () => {
    const onChrome = vi.fn()
    render(<LegacyExcludedRouter onMobileFirstPhoneChromeChange={onChrome} coordinators={coordinators({
      product: 'PI', country: 'IT', designSystem: 'mobile-first', currentScreen: 'homepage',
      isKidsRuntimeContext: false, isSupportedRuntimeContext: true,
    })} />)
    fireEvent.click(screen.getByTestId('italy-home'))
    expect(onChrome).toHaveBeenCalledWith('dark')
  })

  it('keeps SME on the controlled unsupported screen', () => {
    render(<LegacyExcludedRouter coordinators={coordinators({
      product: 'SME', country: 'RO', designSystem: 'current', currentScreen: 'homepage',
      isKidsRuntimeContext: false, isSupportedRuntimeContext: true,
    })} />)
    expect(screen.getByTestId('unsupported-context')).toHaveTextContent('SME / current')
  })

  it('does not render old PI customer screens for baseline contexts', () => {
    const { container } = render(<LegacyExcludedRouter coordinators={coordinators({
      product: 'PI', country: 'RO', designSystem: 'current', currentScreen: 'homepage',
      isKidsRuntimeContext: false, isSupportedRuntimeContext: true,
    })} />)
    expect(container).toBeEmptyDOMElement()
  })
})


