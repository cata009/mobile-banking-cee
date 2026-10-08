// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import CzFutureRoboAdvisorFlow from '@/app/screens/investments/CzFutureRoboAdvisorFlow'
import { INITIAL_CZ_ROBO_GOALS } from '@/app/screens/investments/CzInvestmentGoalsScreen'

beforeAll(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false })),
  )
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
  })
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
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
  onGoalUpdated?: (goal: import('@/features/investments/robo/types').RoboExistingGoal) => void,
) {
  return render(
    <CzFutureRoboAdvisorFlow
      profileStatus={profileStatus}
      onBack={() => undefined}
      onExit={onExit}
      onGoalUpdated={onGoalUpdated}
    />,
  )
}

function reachHorizon() {
  fireEvent.click(screen.getByRole('button', { name: 'Create Goal' }))
  fireEvent.click(screen.getByRole('button', { name: 'I confirm these data' }))
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  fireEvent.click(screen.getByRole('radio', { name: /General build-up wealth/ }))
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Enter your goal name' }), { target: { value: 'New car' } })
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Target amount' }), { target: { value: '100000' } })
}

function reachFundingMethod() {
  reachHorizon()
  fireEvent.click(screen.getByRole('radio', { name: '10 years' }))
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
}

function reachGoalDetail(nextAction: 'View goal' | 'Add money' = 'View goal') {
  reachFundingMethod()
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  fireEvent.click(screen.getByRole('switch', { name: 'Accept terms and conditions' }))
  fireEvent.click(screen.getByRole('button', { name: 'I have read this' }))
  fireEvent.click(screen.getByRole('button', { name: 'Continue to sign' }))
  fireEvent.click(screen.getByRole('button', { name: 'Sign goal' }))
  act(() => vi.advanceTimersByTime(840))
  act(() => vi.advanceTimersByTime(900))
  fireEvent.click(screen.getByRole('button', { name: nextAction }))
}

function startTopUp() {
  render(
    <CzFutureRoboAdvisorFlow
      initialGoal={INITIAL_CZ_ROBO_GOALS[1]}
      demoClock={{ referenceDay: { year: 2026, month: 3, day: 1 } }}
      onBack={() => undefined}
      onExit={() => undefined}
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Add money' }))
}

describe('CZ Future Robo Advisor flow', () => {
  it('starts the first contribution from goal success without placing investment orders', () => {
    vi.useFakeTimers()
    const updates = vi.fn()
    startFlow('valid', () => undefined, updates)
    reachGoalDetail('Add money')

    expect(screen.getByRole('heading', { name: 'Add money to your goal' })).toBeInTheDocument()
    expect(updates).toHaveBeenCalledTimes(1)
    expect(updates.mock.calls[0]![0].currentInteger).toBe('0')
    expect(updates.mock.calls[0]![0].orders).toEqual([])
  })

  it('resumes the exact draft after quit confirmation including the manual horizon', () => {
    const onExit = vi.fn()
    startFlow('valid', onExit)
    reachHorizon()
    fireEvent.click(screen.getByRole('radio', { name: 'Other time horizon' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Other time horizon (years)' }), { target: { value: '12' } })
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(onExit).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox', { name: 'Enter your goal name' })).toHaveValue('New car')
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.getByRole('textbox', { name: 'Target amount' })).toHaveValue('100000')
    expect(screen.getByRole('textbox', { name: 'Other time horizon (years)' })).toHaveValue('12')
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('textbox', { name: 'Enter your goal name' })).toHaveValue('New car')
  })

  it('publishes exactly one empty goal after signing with no buy orders or initial holdings', () => {
    vi.useFakeTimers()
    const updates = vi.fn()
    startFlow('valid', () => undefined, updates)
    reachGoalDetail()
    expect(updates).toHaveBeenCalledTimes(1)
    expect(updates.mock.calls[0]![0]).toMatchObject({
      currentInteger: '0',
      positions: [],
      transactions: [],
      orders: [],
    })
    expect(screen.getByText('Your goal is ready to invest')).toBeInTheDocument()
  })

  it('submits pending top-up orders while keeping the existing goal value and units', () => {
    vi.useFakeTimers()
    const updates = vi.fn()
    render(
      <CzFutureRoboAdvisorFlow
        initialGoal={INITIAL_CZ_ROBO_GOALS[1]}
        onBack={() => undefined}
        onExit={() => undefined}
        onGoalUpdated={updates}
      />,
    )
    const hydrated = updates.mock.calls.at(-1)![0]
    fireEvent.click(screen.getByRole('button', { name: 'Add money' }))
    fireEvent.click(screen.getByRole('button', { name: 'Review investment' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Accept terms and conditions' }))
    fireEvent.click(screen.getByRole('button', { name: 'Buy' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm investment' }))
    act(() => vi.advanceTimersByTime(840))
    const updated = updates.mock.calls.at(-1)![0]
    expect(updated.positions).toEqual(hydrated.positions)
    expect(updated.currentInteger).toBe(hydrated.currentInteger)
    expect(updated.currentDecimals).toBe(hydrated.currentDecimals)
    expect(updated.orders.filter((order: { status: string }) => order.status === 'PENDING').length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: 'Add money request submitted' })).toBeInTheDocument()
  })
  it('uses 16px subtitles and goal option titles throughout goal creation', () => {
    startFlow()

    expect(screen.getByText('Turn your plans into an investment goal. Choose a suitable portfolio, then decide when and how much to invest.')).toHaveClass(
      'text-[16px]',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Create Goal' }))
    fireEvent.click(screen.getByRole('button', { name: 'I confirm these data' }))

    expect(screen.getByText(/Your answers indicate a Moderate - V2 investor profile/)).toHaveClass('text-[16px]')
    expect(screen.getByText(/As a moderate risk investor/)).toHaveClass('text-[16px]')
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByText('What would you like this investment to help you achieve?')).toHaveClass('text-[16px]')
    expect(screen.getByText('General build-up wealth')).toHaveClass('text-[16px]')
  })

  it('keeps personal data back-only and uses the supplied close action on other Robo steps', () => {
    const onExit = vi.fn()
    startFlow('valid', onExit)

    const introClose = screen.getByRole('button', { name: 'Close' })
    expect(introClose.querySelector('path')).toHaveAttribute(
      'd',
      'M18.1431 0L10 8.14313L1.85625 0L0 1.85687L8.14313 10L0 18.1431L1.85625 20L10 11.8569L18.1431 20L20 18.1431L11.8569 10L20 1.85687L18.1431 0Z',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Create Goal' }))
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit data' })).not.toHaveClass('uppercase')
    fireEvent.click(screen.getByRole('button', { name: 'I confirm these data' }))

    const flowClose = screen.getByRole('button', { name: 'Close' })
    expect(screen.queryByRole('button', { name: 'Help' })).not.toBeInTheDocument()
    expect(flowClose.querySelector('path')).toHaveAttribute(
      'd',
      'M18.1431 0L10 8.14313L1.85625 0L0 1.85687L8.14313 10L0 18.1431L1.85625 20L10 11.8569L18.1431 20L20 18.1431L11.8569 10L20 1.85687L18.1431 0Z',
    )
    fireEvent.click(flowClose)
    expect(onExit).not.toHaveBeenCalled()
    expect(screen.getByRole('heading', { name: 'Are you sure you want to quit?' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Close the flow' }))
    expect(onExit).toHaveBeenCalledTimes(1)
  })

  it('keeps the four Figma goal choices', () => {
    startFlow()

    fireEvent.click(screen.getByRole('button', { name: 'Create Goal' }))
    fireEvent.click(screen.getByRole('button', { name: 'I confirm these data' }))

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getAllByRole('radio')).toHaveLength(4)
    expect(screen.getByRole('radio', { name: /General build-up wealth/ })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Saving for unforeseen circumstances/ })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Saving for a major purchase/ })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Retirement/ })).toBeInTheDocument()
  })

  it('collapses each Robo page title into the centered header while scrolling', () => {
    startFlow()
    fireEvent.click(screen.getByRole('button', { name: 'Create Goal' }))
    fireEvent.click(screen.getByRole('button', { name: 'I confirm these data' }))

    const scrollContainer = document.querySelector('[data-robo-scroll-container]')
    expect(scrollContainer).toBeInTheDocument()
    Object.defineProperty(scrollContainer!, 'scrollTop', { configurable: true, value: 64 })
    fireEvent.scroll(scrollContainer!)

    const titles = screen.getAllByRole('heading', { name: 'Your risk profile' })
    const compactTitle = titles.find((title) => title.parentElement?.classList.contains('text-center'))
    expect(compactTitle?.parentElement).toHaveStyle({ opacity: '1' })
  })

  it('blocks goal creation until an expired MiFID profile is updated', () => {
    startFlow('expired')

    fireEvent.click(screen.getByRole('button', { name: 'Create Goal' }))
    fireEvent.click(screen.getByRole('button', { name: 'I confirm these data' }))
    expect(screen.getByRole('heading', { name: 'Your risk profile' })).toBeInTheDocument()
    expect(screen.getByText(/needs an update/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Update investor profile' })).toBeInTheDocument()
  })

  it('prefills and visibly selects a quick target amount', () => {
    startFlow()

    fireEvent.click(screen.getByRole('button', { name: 'Create Goal' }))
    fireEvent.click(screen.getByRole('button', { name: 'I confirm these data' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    fireEvent.click(screen.getByRole('radio', { name: /General build-up wealth/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Enter your goal name' }), { target: { value: 'New car' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    const quickAmount = screen.getByRole('button', { name: /250\.000 CZK/ })
    fireEvent.click(quickAmount)

    expect(screen.getByRole('textbox', { name: 'Target amount' })).toHaveValue('250000')
    expect(quickAmount).toHaveAttribute('aria-pressed', 'true')

    fireEvent.change(screen.getByRole('textbox', { name: 'Target amount' }), { target: { value: '275000' } })
    expect(quickAmount).toHaveAttribute('aria-pressed', 'false')
  })

  it('uses a single top-up screen to review a combined contribution', () => {
    startTopUp()
    fireEvent.click(screen.getByRole('radio', { name: /Invest now and monthly/i }))

    expect(screen.getByRole('heading', { name: 'Add money to your goal' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Initial amount to add' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Monthly contribution' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Monthly contribution starts' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Cash account/ })).toBeInTheDocument()

    fireEvent.change(screen.getByRole('textbox', { name: 'Initial amount to add' }), { target: { value: '50000' } })
    fireEvent.change(screen.getByRole('textbox', { name: 'Monthly contribution' }), { target: { value: '2000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Review investment' }))
    expect(screen.getAllByRole('heading', { name: 'Review Data' }).length).toBeGreaterThan(0)
    expect(screen.getByText('Monthly contribution')).toBeInTheDocument()
  })

  it('reviews client-facing documents and sends the goal to secure signing', () => {
    vi.useFakeTimers()
    startFlow()

    reachFundingMethod()
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getAllByRole('heading', { name: 'Review goal details' }).length).toBeGreaterThan(0)
    expect(screen.getByText('Terms & conditions')).toBeInTheDocument()
    expect(screen.queryByText(/document names shown in this preview are provisional/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Orders created/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue to sign' })).toBeDisabled()

    fireEvent.click(screen.getByRole('switch', { name: 'Accept terms and conditions' }))
    expect(screen.getByRole('dialog', { name: 'Investment account contract' })).toBeVisible()
    expect(screen.getByRole('switch', { name: 'Accept terms and conditions' })).not.toBeChecked()
    fireEvent.click(screen.getByRole('button', { name: 'Close investment account contract' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue to sign' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Review terms and conditions' }))
    fireEvent.click(screen.getByRole('button', { name: 'I have read this' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'Accept terms and conditions' })).toBeChecked()
    fireEvent.click(screen.getByRole('switch', { name: 'Accept terms and conditions' }))
    expect(screen.getByRole('button', { name: 'Continue to sign' })).toBeDisabled()
    fireEvent.click(screen.getByRole('switch', { name: 'Accept terms and conditions' }))
    fireEvent.click(screen.getByRole('button', { name: 'I have read this' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue to sign' }))
    expect(screen.getAllByRole('heading', { name: 'Sign goal' }).length).toBeGreaterThan(0)
  })

  it('requires a horizon choice and uses the 16px bold separator-free Figma rows', () => {
    startFlow()
    reachHorizon()

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    const fiveYears = screen.getByRole('radio', { name: '5 years' })
    expect(fiveYears).not.toHaveClass('border-b')
    expect(screen.getByText('5 YEARS')).toHaveClass('text-[14px]', 'font-bold')

    fireEvent.click(fiveYears)
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })

  it('shows relevant top-up fields inline and validates before order review', () => {
    startTopUp()

    expect(screen.getAllByRole('radio')).toHaveLength(3)
    const continueButton = screen.getByRole('button', { name: 'Review investment' })
    expect(continueButton).toBeEnabled()

    fireEvent.click(screen.getByRole('radio', { name: /Invest monthly/i }))
    expect(screen.getByRole('heading', { name: 'Add money to your goal' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Monthly contribution' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Monthly contribution starts' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Amount' })).not.toBeInTheDocument()
    fireEvent.change(screen.getByRole('textbox', { name: 'Monthly contribution' }), { target: { value: '' } })
    expect(continueButton).toBeDisabled()

    fireEvent.change(screen.getByRole('textbox', { name: 'Monthly contribution' }), { target: { value: '1000' } })
    expect(continueButton).toBeEnabled()
    fireEvent.click(continueButton)
    expect(screen.getAllByRole('heading', { name: 'Review Data' }).length).toBeGreaterThan(0)
  })

  it('offers quick monthly contribution suggestions with a visible selected state', () => {
    startTopUp()
    fireEvent.click(screen.getByRole('radio', { name: /Invest monthly/i }))

    const suggestion = screen.getByRole('button', { name: /1\.000 CZK/ })
    fireEvent.click(suggestion)

    expect(screen.getByRole('textbox', { name: 'Monthly contribution' })).toHaveValue('1000')
    expect(suggestion).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows five basket recommendations in a carousel and updates the selected basket contents', () => {
    startFlow()
    reachFundingMethod()

    const carousel = screen.getByTestId('robo-basket-portfolio-carousel')
    expect(carousel.querySelectorAll('[role="radio"]')).toHaveLength(5)
    expect(
      screen.getByRole('radio', { name: /^Choose onemarkets J\.P\. Morgan Global growth Basket/ }),
    ).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('heading', { name: 'PRODUCTS DISTRIBUTION' })).toBeInTheDocument()
    expect(screen.getByText('Nano-Chip Equity Fund')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('radio', { name: /^Choose BlackRock Credit Opportunities/ }))
    expect(screen.getByRole('radio', { name: /^Choose BlackRock Credit Opportunities/ })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(screen.getByRole('heading', { name: 'PRODUCTS DISTRIBUTION' })).toBeInTheDocument()
    expect(screen.getByText('Sustainable Future Mixed Fund')).toBeInTheDocument()
    expect(screen.getByText('Europe Equity Opportunities')).toBeInTheDocument()
    expect(screen.queryByText('4 equity ESG funds.')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('radio', { name: /^Choose onemarkets Chase Regular EUR/ }))
    expect(screen.getByText('Amundi Funds Global Opportunity')).toBeInTheDocument()
    expect(screen.getByText('CZROBOAMUND14')).toBeInTheDocument()
    expect(screen.getByText('Europe Equity Opportunities')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Details for onemarkets Chase Regular EUR' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('radio', { name: /^Choose onemarkets J\.P\. Morgan Credit Opportunities/ }))
    expect(screen.getByText('Nano-Chip Equity Fund')).toBeInTheDocument()
    expect(screen.getByText('CZGLOBALGRO9')).toBeInTheDocument()
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

    expect(screen.getByText('Your goal is ready to invest')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'MAX VALUE' })).not.toBeInTheDocument()
    expect(screen.queryByText('Nano-Chip Equity Fund')).not.toBeInTheDocument()
  })
})
