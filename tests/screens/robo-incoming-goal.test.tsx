// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import CzFutureRoboAdvisorFlow from '@/app/screens/investments/CzFutureRoboAdvisorFlow'
import { buildInvestmentSecurityCatalog } from '@/app/config/investmentsPortfolioConfig'
import { INITIAL_CZ_ROBO_GOALS } from '@/features/investments/robo/goalFixtures'
import { getRoboPortfolioForGoal, type RoboExistingGoal } from '@/features/investments/robo/model'
import { buildInitialRoboGoal } from '@/features/investments/robo/goalModel'
import { hydrateRoboGoal } from '@/features/investments/robo/goalHydration'

afterEach(cleanup)

const catalog = buildInvestmentSecurityCatalog([], 'CZ', { includeRoboGoals: true })
const firstPortfolio = getRoboPortfolioForGoal(INITIAL_CZ_ROBO_GOALS[0]!)!
const nextPortfolio = getRoboPortfolioForGoal(INITIAL_CZ_ROBO_GOALS[1]!)!
function readyGoal(name: string, amount: number, portfolio = firstPortfolio): RoboExistingGoal {
  return buildInitialRoboGoal(
    portfolio,
    { ...INITIAL_CZ_ROBO_GOALS[0]!, name, returnLabel: '0 total return' },
    amount,
    'CZ',
    catalog,
    { date: '2026-10-07T12:00:00Z', tradeId: `opening-${amount}` },
  )
}

function mount(goal: RoboExistingGoal, onGoalUpdated = vi.fn()) {
  const props = { securityCatalog: catalog, onBack: () => undefined, onExit: () => undefined, onGoalUpdated }
  const view = render(<CzFutureRoboAdvisorFlow {...props} initialGoal={goal} />)
  return {
    ...view,
    onGoalUpdated,
    update: (next: RoboExistingGoal) => view.rerender(<CzFutureRoboAdvisorFlow {...props} initialGoal={next} />),
  }
}

describe('Robo incoming versus working goal ownership', () => {
  it.each([firstPortfolio, nextPortfolio])(
    'opens the saved model portfolio without selecting or changing it ($id)',
    (portfolio) => {
      const view = mount(readyGoal('My selected goal', 10000, portfolio))
      fireEvent.click(screen.getByRole('button', { name: 'Goal settings' }))
      fireEvent.click(screen.getByRole('button', { name: 'Model Portfolio' }))

      expect(screen.getAllByRole('heading', { name: portfolio.basketFund!.title })).not.toHaveLength(0)
      expect(screen.getByText('Basket fund description')).toBeVisible()
      expect(screen.queryByRole('button', { name: 'Select' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Buy' })).not.toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Back' }))
      expect(screen.getByRole('button', { name: 'Model Portfolio' })).toBeVisible()
      fireEvent.click(screen.getByRole('button', { name: 'Back' }))
      expect(screen.getByRole('heading', { name: 'My selected goal' })).toBeVisible()
      expect(view.onGoalUpdated).not.toHaveBeenCalled()
    },
  )

  it('reflects same-ID incoming name, value, holdings and basket updates without remounting detail', () => {
    const initial = readyGoal('Initial goal', 10000)
    const incoming = readyGoal('Incoming goal', 20000, nextPortfolio)
    expect(hydrateRoboGoal(initial, firstPortfolio.basketFund!, 'CZ', catalog)).toBe(initial)
    expect(hydrateRoboGoal(incoming, nextPortfolio.basketFund!, 'CZ', catalog)).toBe(incoming)
    const view = mount(initial)
    fireEvent.click(screen.getByRole('button', { name: '1 M' }))
    view.update(incoming)
    expect(screen.getByRole('heading', { name: 'Incoming goal' })).toBeInTheDocument()
    expect(screen.getByTestId('robo-goal-detail')).toHaveTextContent('20.000,00 CZK')
    const holding = incoming.positions![0]!
    expect(screen.getByRole('button', { name: new RegExp(`${holding.title} product`) })).toHaveTextContent(
      `${holding.quantity.toFixed(3).replace('.', ',')} PCS`,
    )
    expect(screen.getByRole('button', { name: '1 M' })).toHaveAttribute('aria-pressed', 'true')
    expect(view.onGoalUpdated).not.toHaveBeenCalled()
  })

  it('reflects incoming pending and executed updates to an empty ready goal', () => {
    const initial = readyGoal('Empty goal', 0)
    const view = mount(initial)
    view.update({
      ...initial,
      orders: [
        {
          id: 'incoming-order',
          title: 'Basket purchase',
          amount: 10000,
          date: '2026-10-07T12:00:00Z',
          currency: 'CZK',
          orderType: 'BUY',
          status: 'PENDING',
          tone: 'neutral',
        },
      ],
    })
    expect(screen.getByText('Your investment is being processed')).toBeInTheDocument()
    view.update(readyGoal('Executed goal', 10000))
    expect(screen.getByRole('heading', { name: 'Executed goal' })).toBeInTheDocument()
    expect(screen.getByTestId('robo-goal-detail')).toHaveTextContent('10.000,00 CZK')
    expect(screen.queryByTestId('robo-empty-goal-state')).not.toBeInTheDocument()
    expect(view.onGoalUpdated).not.toHaveBeenCalled()
  })

  it('keeps management stage and amount draft when an externally owned goal changes', () => {
    const view = mount(readyGoal('Initial goal', 10000))
    fireEvent.click(screen.getByRole('button', { name: 'Add money' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Amount to add' }), { target: { value: '7777' } })
    view.update(readyGoal('Incoming goal', 20000))
    expect(screen.getByRole('textbox', { name: 'Amount to add' })).toHaveValue('7777')
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('heading', { name: 'Incoming goal' })).toBeInTheDocument()
    expect(screen.getByTestId('robo-goal-detail')).toHaveTextContent('20.000,00 CZK')
  })

  it('keeps a locally renamed working goal ahead of later incoming props', () => {
    const initial = readyGoal('Initial goal', 10000)
    const view = mount(initial)
    fireEvent.click(screen.getByRole('button', { name: 'Goal settings' }))
    fireEvent.click(screen.getByText('Rename goal'))
    fireEvent.change(screen.getByRole('textbox', { name: 'Goal name' }), { target: { value: 'Local name' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save name' }))
    view.update(readyGoal('Incoming name', 20000, nextPortfolio))
    expect(screen.getByRole('heading', { name: 'Local name' })).toBeInTheDocument()
    expect(screen.getByTestId('robo-goal-detail')).toHaveTextContent('10.000,00 CZK')
    expect(screen.getByText(initial.positions![0]!.title)).toBeInTheDocument()
    expect(view.onGoalUpdated).toHaveBeenCalledTimes(1)
  })

  it('keeps a goal hydrated locally on mount ahead of later incoming props', () => {
    const initial = { ...INITIAL_CZ_ROBO_GOALS[1]!, name: 'Hydrated goal' }
    const view = mount(initial)
    expect(view.onGoalUpdated).toHaveBeenCalledTimes(1)
    view.update({ ...readyGoal('Incoming name', 20000), id: initial.id })
    expect(screen.getByRole('heading', { name: 'Hydrated goal' })).toBeInTheDocument()
    expect(screen.getByTestId('robo-goal-detail')).toHaveTextContent('51.241,33 CZK')
    expect(view.onGoalUpdated).toHaveBeenCalledTimes(1)
  })
})
