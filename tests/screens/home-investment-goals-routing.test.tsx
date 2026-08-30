// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/app/App'

const FUTURE_CZ_HOME_WITH_INVESTMENTS_URL =
  '/?product=PI&country=CZ&scenario=active&ds=current&release=release-future-cz-robo' +
  '&bank=retail-single-account&theme=light&lang=en&screen=homepage' +
  '&count_accounts=0&count_debit_cards=0&count_credit_cards=0&count_meal_cards=0' +
  '&count_deposits=0&count_savings=0&count_loans=0&count_mortgages=0&count_investments=1'

beforeEach(() => {
  window.history.replaceState({}, '', FUTURE_CZ_HOME_WITH_INVESTMENTS_URL)
  vi.stubGlobal(
    'ResizeObserver',
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
  })
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  window.history.replaceState({}, '', '/')
})

describe('Future CZ Homepage Investment goals routing', () => {
  async function openGoalsOverview() {
    fireEvent.click(await screen.findByRole('button', { name: 'Investment' }))
    fireEvent.click(screen.getByText('Investment goals').closest('[data-product-card-evolution]')!)
  }

  async function openExistingGoal() {
    await openGoalsOverview()
    fireEvent.click(
      await screen.findByRole('button', { name: 'Open Build long-term wealth: Strategic approach' }),
    )
  }

  it('opens the complete goals container and starts the existing creation flow from its CTA', async () => {
    render(<App />)

    await openGoalsOverview()

    expect(await screen.findByText('Total goals value')).toBeInTheDocument()
    expect(screen.getByText('151.241')).toBeInTheDocument()
    expect(screen.getAllByText(',33 CZK')).not.toHaveLength(0)
    expect(screen.getByText('YOUR GOAL LIST')).toBeInTheDocument()
    expect(screen.getByText('5', { selector: '[data-goal-count]' })).toBeInTheDocument()
    expect(screen.getAllByTestId('investment-goal-card')).toHaveLength(5)
    expect(screen.getAllByText('ACTIVE')).not.toHaveLength(0)
    expect(screen.getByText('INACTIVE')).toBeInTheDocument()
    expect(screen.queryByText(/My Robo Goal name/i)).not.toBeInTheDocument()
    expect(screen.getByText('Build long-term wealth')).toBeInTheDocument()
    expect(screen.getByText('My future home')).toBeInTheDocument()
    expect(screen.getByText('Financial freedom')).toBeInTheDocument()
    expect(screen.getByText('Protect my savings')).toBeInTheDocument()
    expect(screen.getByText('Keep pace with inflation')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Create New Goal' }))

    expect(await screen.findByRole('heading', { name: 'Invest towards what matters' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Goal' })).toBeInTheDocument()
  }, 30_000)

  it.each([
    ['Build long-term wealth', 'Strategic approach'],
    ['My future home', 'Saving for a major purchase'],
    ['Financial freedom', 'Strategic approach'],
    ['Protect my savings', 'Protection for inflation'],
    ['Keep pace with inflation', 'Protection for inflation'],
  ])('opens %s / %s in the existing goal-detail experience', async (goalName, purpose) => {
    render(<App />)

    await openGoalsOverview()

    fireEvent.click(
      await screen.findByRole('button', { name: `Open ${goalName}: ${purpose}` }),
    )

    expect(await screen.findByTestId('robo-goal-detail')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: goalName })).toBeInTheDocument()
    expect(screen.getByText(purpose)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(await screen.findByText('Total goals value')).toBeInTheDocument()
    expect(screen.getAllByTestId('investment-goal-card')).toHaveLength(5)
  })

  it('keeps goal-card surfaces visually static on pointer hover', async () => {
    render(<App />)

    await openGoalsOverview()

    const goalCard = await screen.findByRole('button', {
      name: 'Open Build long-term wealth: Strategic approach',
    })
    expect(goalCard.className).not.toContain('hover:bg-')
    expect(goalCard.className).not.toContain('transition-colors')
  })

  it('shows a status badge instead of a decorative icon on every goal card', async () => {
    render(<App />)

    await openGoalsOverview()

    expect(await screen.findAllByTestId('investment-goal-status')).toHaveLength(5)
  })

  it('places the goal progress percentage on the detail progress bar', async () => {
    render(<App />)

    await openExistingGoal()

    const progressBar = await screen.findByTestId('goal-detail-progress-bar')
    const progressBadge = screen.getByTestId('goal-detail-progress-badge')

    expect(progressBar).toContainElement(progressBadge)
    expect(progressBadge).toHaveTextContent('100%')
  })

  it('uses Help instead of the creation Close action on an existing goal detail', async () => {
    render(<App />)

    await openExistingGoal()

    expect(await screen.findByTestId('robo-goal-detail')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Help' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
    expect(screen.getByTestId('robo-goal-detail-meta')).toHaveClass('mt-[8px]')
  })

  it('uses the supplied Withdraw and Goal settings icons on existing goal detail', async () => {
    render(<App />)

    await openExistingGoal()

    const withdrawIcon = (await screen.findByRole('button', { name: 'Withdraw' })).querySelector('svg')
    expect(withdrawIcon).toHaveAttribute('viewBox', '0 0 20 20')
    expect(withdrawIcon?.querySelector('path')).toHaveAttribute(
      'd',
      'M19.1424 12.2233C17.9595 11.15 16.0395 11.15 14.8567 12.2233L12.0864 14.7378L12.0864 0.00111154L9.05665 5.6575e-07L9.05666 14.7378L6.28523 12.2233C5.10237 11.15 3.18466 11.15 1.99951 12.2233L10.5709 20L19.1424 12.2233Z',
    )

    const settingsIcon = screen.getByRole('button', { name: 'Goal settings' }).querySelector('svg')
    expect(settingsIcon).toHaveAttribute('viewBox', '0 0 32 32')
    expect(settingsIcon?.querySelector('path')).toHaveAttribute(
      'd',
      'M17.0212 18.5281C15.6247 19.0923 14.0369 18.4188 13.4712 17.0222C12.9071 15.6255 13.5821 14.036 14.9786 13.4719C16.3752 12.9077 17.963 13.5828 18.527 14.9794C19.0911 16.3761 18.4162 17.964 17.0212 18.5281ZM24.9875 21.1543L25.9807 18.7805L23.7196 16.8052V15.2527L26 13.2887L25.0229 10.9084L22.0161 11.1109L20.9297 10.0228L21.1531 7.01093L18.7794 6.01929L16.7947 8.29187H15.2616L13.2881 6L10.908 6.97718L11.1105 9.98264L10.0241 11.0707L7.01085 10.8457L6.01768 13.2195L8.28043 15.1948V16.749L6 18.7113L6.9771 21.0932L9.95982 20.8907L11.0687 21.9997L10.8453 24.9891L13.2206 25.9823L15.1828 23.7322H16.7577L18.7119 26L21.0904 25.0244L20.8895 22.0399L21.9984 20.9325L24.9875 21.1543Z',
    )
  })

  it('opens the existing investment product detail from a goal holding and returns to the same goal', async () => {
    render(<App />)

    await openExistingGoal()
    const appleHolding = await screen.findByRole('button', { name: 'Open Apple product details' })
    expect(appleHolding).toHaveTextContent('30%')
    expect(appleHolding).toHaveTextContent('30 000')

    fireEvent.click(appleHolding)

    expect(await screen.findByText('MY SECURITY')).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: 'Apple' })).not.toHaveLength(0)
    const productDetail = document.querySelector('[data-investment-product-detail]')
    expect(productDetail).toHaveAttribute('data-investment-product-detail', 'owned')
    expect(productDetail).toHaveTextContent('30 000')
    expect(productDetail).toHaveTextContent('-1,80%')
    expect(screen.getByRole('button', { name: 'Buy' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sell' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(await screen.findByTestId('robo-goal-detail')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Build long-term wealth' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open Apple product details' })).toBeInTheDocument()
  })

  it('renames the selected goal, returns to its detail and keeps the new name in the overview', async () => {
    render(<App />)

    await openExistingGoal()
    fireEvent.click(screen.getByRole('button', { name: 'Goal settings' }))
    fireEvent.click(await screen.findByText('Rename goal'))

    const nameInput = await screen.findByRole('textbox', { name: 'Goal name' })
    expect(nameInput).toHaveValue('Build long-term wealth')

    fireEvent.change(nameInput, { target: { value: '   ' } })
    expect(screen.getByRole('button', { name: 'Save name' })).toBeDisabled()

    fireEvent.change(nameInput, { target: { value: 'A secure future' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save name' }))

    expect(await screen.findByTestId('robo-goal-detail')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'A secure future' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(
      await screen.findByRole('button', { name: 'Open A secure future: Strategic approach' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Open Build long-term wealth: Strategic approach' }),
    ).not.toBeInTheDocument()
  })
})
