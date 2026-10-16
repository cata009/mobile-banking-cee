// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/app/App'
import {
  asyncNativeReady,
  resetNativeWebRendererDiagnostics,
} from '../helpers/nativeWebRenderer'

vi.mock('@/app/components/demo/nativeDemoLoader', async () => {
  const renderer = await import('../helpers/nativeWebRenderer')
  return { loadNativeDemoModule: renderer.loadNativeDemoModuleForWebTest }
})

const FUTURE_CZ_HOME_WITH_INVESTMENTS_URL =
  '/?product=PI&country=CZ&scenario=active&ds=current&release=release-future-cz-robo' +
  '&bank=retail-single-account&theme=light&lang=en&screen=homepage' +
  '&count_accounts=0&count_debit_cards=0&count_credit_cards=0&count_meal_cards=0' +
  '&count_deposits=0&count_savings=0&count_loans=0&count_mortgages=0&count_investments=1'

beforeEach(() => {
  resetNativeWebRendererDiagnostics()
  window.history.replaceState({}, '', FUTURE_CZ_HOME_WITH_INVESTMENTS_URL)
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false })),
  )
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
  resetNativeWebRendererDiagnostics()
  vi.unstubAllGlobals()
  window.history.replaceState({}, '', '/')
})

async function renderNativeApp() {
  const view = render(<App />)
  await asyncNativeReady(view.container)
  return view
}

function containsText(value: string) {
  return (_content: string, element: Element | null) =>
    element?.textContent?.replace(/\s+/g, ' ').includes(value) ?? false
}

async function expectText(value: string) {
  expect((await screen.findAllByText(containsText(value))).length).toBeGreaterThan(0)
}

describe('Future CZ Homepage Investment goals routing', () => {
  async function openGoalsOverview() {
    fireEvent.click(await screen.findByRole('button', { name: 'Investment' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Investment goals' }))
  }

  async function openExistingGoal() {
    await openGoalsOverview()
    fireEvent.click(await screen.findByRole('button', { name: 'Open Build long-term wealth: General build-up wealth' }))
  }

  async function openGoalCreationContactStep() {
    fireEvent.click(await screen.findByRole('button', { name: 'Create New Goal' }))
    await expectText('Invest towards what matters')
    fireEvent.click(screen.getByRole('button', { name: 'Create Goal' }))
    await expectText('First of all')
  }

  it('opens the complete goals container and starts the existing creation flow from its CTA', async () => {
    await renderNativeApp()

    await openGoalsOverview()

    await expectText('Total goals value')
    expect((await screen.findAllByText(containsText('256.241'))).length).toBeGreaterThan(0)
    expect((await screen.findAllByText(containsText(',33 CZK'))).length).toBeGreaterThan(0)
    await expectText('Your goals')
    expect(screen.getAllByRole('button', { name: /^Open .+: / })).toHaveLength(5)
    expect(screen.queryByText(/My Robo Goal name/i)).not.toBeInTheDocument()
    await expectText('Build long-term wealth')
    await expectText('My future home')
    await expectText('Financial freedom')
    await expectText('Protect my savings')
    expect(
      screen.getByRole('button', { name: 'Open Build long-term wealth: General build-up wealth' }),
    ).toHaveTextContent('100.000,00 CZK')

    await openGoalCreationContactStep()
    await expectText('+420 777 123 456')
    await expectText('email.address@gmail.com')
    fireEvent.click(screen.getByRole('button', { name: 'I confirm these data' }))
    await expectText('Your risk profile')
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(await screen.findByRole('button', { name: 'I confirm these data' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(await screen.findByRole('button', { name: 'Create Goal' })).toBeInTheDocument()
  }, 30_000)

  it('keeps the Source Edit data affordance on the Native contact step', async () => {
    await renderNativeApp()
    await openGoalsOverview()
    await openGoalCreationContactStep()

    expect(screen.getByRole('button', { name: 'Edit data' })).toBeInTheDocument()
  }, 30_000)

  it.each([
    ['Build long-term wealth', 'General build-up wealth'],
    ['My future home', 'Saving for a major purchase'],
    ['Financial freedom', 'Retirement'],
    ['Protect my savings', 'Saving for unforeseen circumstances'],
  ])('opens %s / %s in the existing goal-detail experience', async (goalName, purpose) => {
    await renderNativeApp()

    await openGoalsOverview()

    fireEvent.click(await screen.findByRole('button', { name: `Open ${goalName}: ${purpose}` }))

    await expectText(goalName)
    await expectText(purpose)
    if (goalName === 'Build long-term wealth') {
      expect((await screen.findAllByText(containsText('92.312,77'))).length).toBeGreaterThan(0)
      expect((await screen.findAllByText(containsText('CZK'))).length).toBeGreaterThan(0)
    }

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))

    await expectText('Total goals value')
    expect(screen.getAllByRole('button', { name: /^Open .+: / })).toHaveLength(5)
  })

  it('keeps goal-card surfaces visually static on pointer hover', async () => {
    await renderNativeApp()

    await openGoalsOverview()

    const goalCard = await screen.findByRole('button', {
      name: 'Open Build long-term wealth: General build-up wealth',
    })
    const backgroundBeforeHover = getComputedStyle(goalCard).backgroundColor
    fireEvent.mouseEnter(goalCard)
    expect(getComputedStyle(goalCard).backgroundColor).toBe(backgroundBeforeHover)
    fireEvent.mouseLeave(goalCard)
    expect(getComputedStyle(goalCard).backgroundColor).toBe(backgroundBeforeHover)
  })

  it('shows one goal card for each saved goal', async () => {
    await renderNativeApp()

    await openGoalsOverview()

    expect(await screen.findAllByRole('button', { name: /^Open .+: / })).toHaveLength(5)
  })

  it('shows the goal progress percentage separately from the detail progress bar', async () => {
    await renderNativeApp()

    await openExistingGoal()

    await expectText('Goal progress')
    await expectText('92%')
  })

  it('uses Help instead of the creation Close action on an existing goal detail', async () => {
    await renderNativeApp()

    await openExistingGoal()

    await expectText('Build long-term wealth')
    expect(screen.getByRole('button', { name: 'Help' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
    await expectText('General build-up wealth')
  })

  it('uses the supplied Withdraw and Goal settings icons on existing goal detail', async () => {
    await renderNativeApp()

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

  it('opens a basket product detail from a goal holding and returns to the same goal', async () => {
    await renderNativeApp()

    await openExistingGoal()
    const nanoChipHolding = await screen.findByRole('button', { name: /Nano-Chip Equity Fund/ })
    expect(nanoChipHolding).toHaveTextContent('11,660 PCS')
    expect(nanoChipHolding).toHaveTextContent('31.010,57')
    expect(nanoChipHolding).toHaveTextContent('CZK')

    fireEvent.click(nanoChipHolding)

    await expectText('My security')
    await expectText('Nano-Chip Equity Fund')
    await expectText('31.010,57')
    await expectText('2.659,62')
    expect(screen.getAllByText('CZK').length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: 'Buy' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sell' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))

    await expectText('Build long-term wealth')
    expect(screen.getByRole('button', { name: /Nano-Chip Equity Fund/ })).toBeInTheDocument()
  })

  it('renames the selected goal, returns to its detail and keeps the new name in the overview', async () => {
    await renderNativeApp()

    await openExistingGoal()
    fireEvent.click(screen.getByRole('button', { name: 'Goal settings' }))
    fireEvent.click(await screen.findByText('Rename goal'))

    const nameInput = await screen.findByRole('textbox', { name: 'Goal name' })
    expect(nameInput).toHaveValue('Build long-term wealth')

    fireEvent.change(nameInput, { target: { value: '   ' } })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save name' })).toBeDisabled())

    fireEvent.change(nameInput, { target: { value: 'A secure future' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save name' }))

    await expectText('A secure future')

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(
      await screen.findByRole('button', { name: 'Open A secure future: General build-up wealth' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Open Build long-term wealth: General build-up wealth' }),
    ).not.toBeInTheDocument()
  })
})
