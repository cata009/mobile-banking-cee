// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import CzFutureRoboAdvisorFlow from '@/app/screens/investments/CzFutureRoboAdvisorFlow'

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
  })
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  })
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

afterAll(() => {
  Reflect.deleteProperty(HTMLElement.prototype, 'scrollTo')
  vi.unstubAllGlobals()
})

function startFlow(
  profileStatus: 'valid' | 'expired' = 'valid',
  onExit: () => void = () => undefined,
) {
  return render(
    <CzFutureRoboAdvisorFlow
      profileStatus={profileStatus}
      onBack={() => undefined}
      onExit={onExit}
    />,
  )
}

function reachHorizon() {
  fireEvent.click(screen.getByRole('button', { name: 'Create Goal' }))
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  fireEvent.click(screen.getByRole('radio', { name: 'General build-up wealth' }))
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Enter your goal name' }), { target: { value: 'New car' } })
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Target amount' }), { target: { value: '100000' } })
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
}

function reachFundingMethod() {
  reachHorizon()
  fireEvent.click(screen.getByRole('radio', { name: '10 years' }))
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
}

function reachGoalDetail() {
  reachFundingMethod()
  fireEvent.click(screen.getByRole('radio', { name: /One-off investment/i }))
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  fireEvent.click(screen.getByRole('button', { name: /^10\D000 CZK$/ }))
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  fireEvent.click(screen.getByRole('button', { name: 'Continue with Sustainable Balanced' }))
  fireEvent.click(screen.getByRole('button', { name: 'Choose Sustainable' }))
  fireEvent.click(screen.getByRole('switch', { name: 'Accept terms and conditions' }))
  fireEvent.click(screen.getByRole('button', { name: 'Continue to sign' }))
  fireEvent.click(screen.getByRole('button', { name: 'Sign goal' }))
  act(() => vi.advanceTimersByTime(840))
  act(() => vi.advanceTimersByTime(900))
  fireEvent.click(screen.getByRole('button', { name: 'Open goal' }))
}

function reachProjection() {
  reachFundingMethod()
  fireEvent.click(screen.getByRole('radio', { name: /One-off investment/i }))
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  fireEvent.click(screen.getByRole('button', { name: /^10\D000 CZK$/ }))
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  fireEvent.click(screen.getByRole('button', { name: 'See projection for Sustainable Balanced' }))
}

describe('CZ Future Robo Advisor flow', () => {
  it('uses 16px subtitles and goal option titles throughout goal creation', () => {
    startFlow()

    expect(screen.getByText('Create a goal and invest with a portfolio selected for your needs.')).toHaveClass('text-[16px]')
    fireEvent.click(screen.getByRole('button', { name: 'Create Goal' }))

    expect(screen.getByText(/Your answers indicate a Moderate investor profile/)).toHaveClass('text-[16px]')
    expect(screen.getByText(/As a moderate risk investor/)).toHaveClass('text-[16px]')
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByText('What would you like this investment to help you achieve?')).toHaveClass('text-[16px]')
    expect(screen.getByText('General build-up wealth')).toHaveClass('text-[16px]')
  })

  it('uses the supplied close action throughout the Robo flow and exits from it', () => {
    const onExit = vi.fn()
    startFlow('valid', onExit)

    const introClose = screen.getByRole('button', { name: 'Close' })
    expect(introClose.querySelector('path')).toHaveAttribute(
      'd',
      'M18.1431 0L10 8.14313L1.85625 0L0 1.85687L8.14313 10L0 18.1431L1.85625 20L10 11.8569L18.1431 20L20 18.1431L11.8569 10L20 1.85687L18.1431 0Z',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Create Goal' }))

    const flowClose = screen.getByRole('button', { name: 'Close' })
    expect(screen.queryByRole('button', { name: 'Help' })).not.toBeInTheDocument()
    expect(flowClose.querySelector('path')).toHaveAttribute(
      'd',
      'M18.1431 0L10 8.14313L1.85625 0L0 1.85687L8.14313 10L0 18.1431L1.85625 20L10 11.8569L18.1431 20L20 18.1431L11.8569 10L20 1.85687L18.1431 0Z',
    )
    fireEvent.click(flowClose)
    expect(onExit).toHaveBeenCalledTimes(1)
  })

  it('keeps the five Figma goal choices', () => {
    startFlow()

    fireEvent.click(screen.getByRole('button', { name: 'Create Goal' }))

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getAllByRole('radio')).toHaveLength(5)
    expect(screen.getByRole('radio', { name: 'General build-up wealth' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Protection for inflation' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Saving for unforeseen circumstances' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Saving for a major purchase' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Retirement' })).toBeInTheDocument()
  })

  it('collapses each Robo page title into the centered header while scrolling', () => {
    startFlow()
    fireEvent.click(screen.getByRole('button', { name: 'Create Goal' }))

    const scrollContainer = document.querySelector('[data-robo-scroll-container]')
    expect(scrollContainer).toBeInTheDocument()
    Object.defineProperty(scrollContainer!, 'scrollTop', { configurable: true, value: 64 })
    fireEvent.scroll(scrollContainer!)

    const titles = screen.getAllByRole('heading', { name: 'Your risk profile' })
    const compactTitle = titles.find((title) => title.classList.contains('text-center'))
    expect(compactTitle).toHaveStyle({ opacity: '1' })
  })

  it('blocks goal creation until an expired MiFID profile is updated', () => {
    startFlow('expired')

    fireEvent.click(screen.getByRole('button', { name: 'Create Goal' }))
    expect(screen.getByRole('heading', { name: 'Your risk profile' })).toBeInTheDocument()
    expect(screen.getByText(/needs an update/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Update investor profile' })).toBeInTheDocument()
  })

  it('prefills and visibly selects a quick target amount', () => {
    startFlow()

    fireEvent.click(screen.getByRole('button', { name: 'Create Goal' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    fireEvent.click(screen.getByRole('radio', { name: 'General build-up wealth' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Enter your goal name' }), { target: { value: 'New car' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    const quickAmount = screen.getByRole('button', { name: /250.*000 CZK/ })
    fireEvent.click(quickAmount)

    expect(screen.getByRole('textbox', { name: 'Target amount' })).toHaveValue('250000')
    expect(quickAmount).toHaveAttribute('aria-pressed', 'true')

    fireEvent.change(screen.getByRole('textbox', { name: 'Target amount' }), { target: { value: '275000' } })
    expect(quickAmount).toHaveAttribute('aria-pressed', 'false')
  })

  it('uses one funding screen for the combined branch and reaches strategy projection', () => {
    startFlow()

    reachFundingMethod()
    fireEvent.click(screen.getByRole('radio', { name: /One-off and regular/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByRole('heading', { name: 'Set up your investment' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Amount to invest now' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Monthly contribution' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Start date' })).toBeInTheDocument()
    expect(screen.getByText('Choose the account to use')).toBeInTheDocument()

    fireEvent.change(screen.getByRole('textbox', { name: 'Amount to invest now' }), { target: { value: '50000' } })
    fireEvent.change(screen.getByRole('textbox', { name: 'Monthly contribution' }), { target: { value: '2000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByRole('heading', { name: 'Choose a strategy' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'See projection for Sustainable Balanced' }))
    expect(screen.getByRole('heading', { name: 'Projection for Sustainable Balanced' })).toBeInTheDocument()
    expect(screen.getByText(/projections are estimates/i)).toBeInTheDocument()
    const investNowSlider = screen.getByRole('slider', { name: 'Invest now' })
    const chart = screen.getByRole('img', { name: /Projected values after/ })
    const initialProjection = chart.getAttribute('aria-label')
    expect(investNowSlider).toHaveValue('50000')
    expect(screen.getByRole('slider', { name: 'Invest monthly' })).toHaveValue('2000')
    expect(screen.getByRole('button', { name: 'See suitable portfolios' })).toBeInTheDocument()

    fireEvent.change(investNowSlider, { target: { value: '100000' } })
    expect(screen.getByText(/100.*000 CZK/)).toBeInTheDocument()
    expect(chart.getAttribute('aria-label')).not.toBe(initialProjection)

    fireEvent.click(screen.getByRole('button', { name: 'See suitable portfolios' }))
    expect(screen.getByRole('heading', { name: 'Available portfolios' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('heading', { name: 'Projection for Sustainable Balanced' })).toBeInTheDocument()
  })

  it('reviews client-facing documents and sends the goal to secure signing', () => {
    vi.useFakeTimers()
    startFlow()

    reachFundingMethod()
    fireEvent.click(screen.getByRole('radio', { name: /One-off investment/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Amount to invest now' }), { target: { value: '50000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue with Sustainable Balanced' }))
    fireEvent.click(screen.getByRole('button', { name: 'Choose Sustainable' }))

    expect(screen.getByRole('heading', { name: 'Review Data' })).toBeInTheDocument()
    expect(screen.getByText('Documents and account terms')).toBeInTheDocument()
    expect(screen.queryByText(/document names shown in this preview are provisional/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Orders created/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue to sign' })).toBeDisabled()

    fireEvent.click(screen.getByRole('switch', { name: 'Accept terms and conditions' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue to sign' }))
    expect(screen.getAllByRole('heading', { name: 'Sign goal' }).length).toBeGreaterThan(0)
  })

  it('requires a horizon choice and uses the 16px bold separator-free Figma rows', () => {
    startFlow()
    reachHorizon()

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    const fiveYears = screen.getByRole('radio', { name: '5 years' })
    expect(fiveYears).not.toHaveClass('border-b')
    expect(screen.getByText('5 YEARS')).toHaveClass('text-[16px]', 'font-bold')

    fireEvent.click(fiveYears)
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })

  it('uses explicit radio selection before continuing from the funding method screen', () => {
    startFlow()
    reachFundingMethod()

    expect(screen.getAllByRole('radio')).toHaveLength(3)
    const continueButton = screen.getByRole('button', { name: 'Continue' })
    expect(continueButton).toBeDisabled()

    fireEvent.click(screen.getByRole('radio', { name: /Regular investment/i }))
    expect(screen.getByRole('heading', { name: 'Choose how to invest' })).toBeInTheDocument()
    expect(continueButton).toBeEnabled()

    fireEvent.click(continueButton)
    expect(screen.getByRole('heading', { name: 'Set up your investment' })).toBeInTheDocument()
  })

  it('offers quick monthly contribution suggestions with a visible selected state', () => {
    startFlow()
    reachFundingMethod()
    fireEvent.click(screen.getByRole('radio', { name: /Regular investment/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    const suggestion = screen.getByRole('button', { name: /1.*000 CZK/ })
    fireEvent.click(suggestion)

    expect(screen.getByRole('textbox', { name: 'Monthly contribution' })).toHaveValue('1000')
    expect(suggestion).toHaveAttribute('aria-pressed', 'true')
  })

  it('supports drag interaction on the strategy carousel', () => {
    startFlow()
    reachFundingMethod()
    fireEvent.click(screen.getByRole('radio', { name: /One-off investment/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    fireEvent.click(screen.getByRole('button', { name: /^10\D000 CZK$/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    const carousel = screen.getByTestId('robo-strategy-carousel')
    expect(carousel).not.toHaveClass('-mx-[24px]')
    expect(carousel).toHaveClass('-mr-[24px]', 'pr-[24px]')
    Object.defineProperty(carousel, 'scrollLeft', { value: 0, writable: true })
    fireEvent.mouseDown(carousel, { button: 0, clientX: 280 })
    fireEvent.mouseMove(document, { buttons: 1, clientX: 80 })
    fireEvent.mouseUp(document)

    expect(carousel.scrollLeft).toBeGreaterThan(0)
  })

  it('keeps the projection action clickable while the card participates in drag gestures', () => {
    startFlow()
    reachFundingMethod()
    fireEvent.click(screen.getByRole('radio', { name: /One-off investment/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    fireEvent.click(screen.getByRole('button', { name: /^10\D000 CZK$/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    const carousel = screen.getByTestId('robo-strategy-carousel')
    const projectionButton = screen.getByRole('button', { name: 'See projection for Sustainable Balanced' })
    const captureOnButton = vi.fn()
    Object.assign(carousel, { setPointerCapture: vi.fn(), hasPointerCapture: () => false })
    Object.assign(projectionButton, {
      setPointerCapture: captureOnButton,
      hasPointerCapture: () => true,
      releasePointerCapture: vi.fn(),
    })

    fireEvent.pointerDown(projectionButton, { pointerId: 7, pointerType: 'touch', clientX: 160 })
    expect(captureOnButton).toHaveBeenCalledTimes(1)
    fireEvent.pointerUp(projectionButton, { pointerId: 7, pointerType: 'touch', clientX: 160 })
    fireEvent.click(projectionButton)

    expect(screen.getByRole('heading', { name: 'Projection for Sustainable Balanced' })).toBeInTheDocument()
  })

  it('keeps both investment controls available and connected to the projection chart', () => {
    startFlow()
    reachProjection()

    const chart = screen.getByRole('img', { name: /Projected values after/ })
    const initialProjection = chart.getAttribute('aria-label')
    const monthlySlider = screen.getByRole('slider', { name: 'Invest monthly' })
    expect(screen.getByRole('slider', { name: 'Invest now' })).toBeInTheDocument()

    fireEvent.change(monthlySlider, { target: { value: '3000' } })
    expect(chart.getAttribute('aria-label')).not.toBe(initialProjection)
  })

  it('shows annual returns before the projection and uses 8px amount radii', () => {
    startFlow()
    reachProjection()

    const annualReturnHeading = screen.getByText('Estimated annual return')
    const projectionHeading = screen.getByText('Projection summary')
    expect(
      annualReturnHeading.compareDocumentPosition(projectionHeading)
      & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()

    document.querySelectorAll('output').forEach((output) => {
      expect(output).toHaveClass('rounded-[8px]')
    })

    const projectionChart = screen.getByRole('img', { name: /Projected values after/ })
    projectionChart.querySelectorAll('rect').forEach((valueLabel) => {
      expect(valueLabel).toHaveAttribute('rx', '8')
    })
  })

  it('shows selectable portfolio variants, allocation groups, logos and expandable products', () => {
    startFlow()
    reachFundingMethod()
    fireEvent.click(screen.getByRole('radio', { name: /One-off investment/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    fireEvent.click(screen.getByRole('button', { name: /^10\D000 CZK$/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue with Sustainable Balanced' }))

    expect(screen.getByRole('button', { name: 'Sustainable' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Core' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Income' })).toBeInTheDocument()
    expect(screen.getByText('Stocks')).toBeInTheDocument()
    expect(screen.getByText('70%')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Apple' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Tesla' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Amundi Asset Management' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'See more stocks products' }))
    expect(screen.getByRole('button', { name: 'See less stocks products' })).toBeInTheDocument()
    expect(screen.getByText('Microsoft')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Core' }))
    expect(screen.getByRole('button', { name: 'Core' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Choose Core' })).toBeInTheDocument()
  })

  it('reuses the Investments performance surface and Figma allocation pattern on goal detail', () => {
    vi.useFakeTimers()
    startFlow()
    reachGoalDetail()

    expect(screen.queryByText('Projection summary')).not.toBeInTheDocument()
    expect(screen.queryByText('Estimated annual return')).not.toBeInTheDocument()
    expect(document.querySelector('[data-ds-label="Investments portfolio chart"]')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1 M' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3 M' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1 Y' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3 Y' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'MAX' })).toBeInTheDocument()

    const addMoney = screen.getByRole('button', { name: 'Add money' })
    expect(addMoney).toHaveAttribute('data-ds-label', 'Account action Add money')
    expect(addMoney).not.toHaveClass('bg-[var(--uc-surface-muted)]', 'rounded-[6px]')

    expect(screen.getByRole('heading', { name: 'Portfolio allocation' })).toHaveClass('text-[20px]')
    expect(screen.getByRole('tab', { name: 'PRODUCTS' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'ASSET CLASS' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'CURRENCY' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'MAX VALUE' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('img', { name: 'Apple' })).toBeInTheDocument()
    expect(screen.getByText('30% · Stock · USD')).toBeInTheDocument()
  })
})
