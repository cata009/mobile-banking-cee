// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import CzFutureRoboAdvisorFlow from '@/app/screens/investments/CzFutureRoboAdvisorFlow'
import { GoalDetail } from '@/app/screens/investments/robo/GoalDetail'
import InvestmentPortfolioChart from '@/app/components/investments/InvestmentPortfolioChart'
import { INITIAL_CZ_ROBO_GOALS } from '@/features/investments/robo/goalFixtures'
import { hydrateRoboGoal } from '@/features/investments/robo/goalHydration'
import { getRoboGoalCurrentValue } from '@/features/investments/robo/goalModel'
import { getRoboPortfolioForGoal } from '@/features/investments/robo/model'
import { buildInvestmentSecurityCatalog } from '@/app/config/investmentsPortfolioConfig'
import { renderBankingScreen } from '../../helpers/coverageProviders'

afterEach(cleanup)

describe('Fully sold active default Robo goal', () => {
  it('keeps the fifth goal empty after hydration with executed purchases and complete sales intact', () => {
    expect(INITIAL_CZ_ROBO_GOALS).toHaveLength(5)
    const goal = INITIAL_CZ_ROBO_GOALS[4]!
    expect(goal.id).toBe('goal-5-sold')
    const catalog = buildInvestmentSecurityCatalog([], 'CZ', { includeRoboGoals: true })
    const hydrated = hydrateRoboGoal(goal, getRoboPortfolioForGoal(goal)!.basketFund!, 'CZ', catalog)
    expect(getRoboGoalCurrentValue(hydrated)).toBe(0)
    expect(hydrated.positions).toEqual([])
    expect(hydrated.transactions).toHaveLength(4)
    expect(hydrated.orders).toHaveLength(4)
    expect(hydrated.orders?.every((order) => order.status === 'EXECUTED')).toBe(true)
    for (const id of ['robo-nano-chip-equity', 'robo-quantum-computing-alpha']) {
      const trades = hydrated.transactions!.filter((transaction) => transaction.securityId === id)
      expect(trades.map((trade) => trade.type)).toEqual(['BUY', 'SELL'])
      expect(trades[0]!.quantity).toBe(trades[1]!.quantity)
    }
  })

  it('opens the active zero-value goal and exposes its executed transactions and orders in History', () => {
    const goal = INITIAL_CZ_ROBO_GOALS[4]!
    renderBankingScreen(
      <CzFutureRoboAdvisorFlow initialGoal={goal} onBack={() => undefined} onExit={() => undefined} />,
    )
    expect(screen.getByRole('heading', { name: 'My next chapter' })).toBeVisible()
    expect(screen.getByTestId('robo-goal-detail')).toHaveTextContent('0,00 CZK')
    expect(screen.getByTestId('goal-detail-progress-badge')).toHaveTextContent(/^0%$/)
    expect(screen.queryByRole('heading', { name: 'Portfolio allocation' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'History' }))
    expect(document.querySelectorAll('[data-investment-history-row="transaction"]')).toHaveLength(4)
    expect(screen.getAllByText('SELL')).toHaveLength(2)
    fireEvent.click(screen.getByRole('tab', { name: /orders/i }))
    expect(document.querySelectorAll('[data-investment-history-row="order"]')).toHaveLength(4)
    expect(screen.getAllByText('EXECUTED')).toHaveLength(4)
  })

  it.each([
    ['fully sold', false, '20.000,00 CZK'],
    ['newly created', true, '0,00 CZK'],
  ])('shows the %s chart value when inspecting its past, with finite chart geometry', (_state, fresh, pastValue) => {
    const source = INITIAL_CZ_ROBO_GOALS[4]!
    const goal = fresh ? { ...source, transactions: [], orders: [] } : source
    const { container } = renderBankingScreen(
      <GoalDetail
        existingGoal={goal}
        goalName={goal.name}
        targetAmount="100000"
        portfolio={getRoboPortfolioForGoal(goal)!}
        country="CZ"
        amountsHidden={false}
        securityCatalog={[]}
        horizonYears={3}
        chartReferenceDate={new Date('2026-10-08T12:00:00Z')}
        onBack={() => undefined}
        onClose={() => undefined}
        onAction={() => undefined}
      />,
    )
    const chart = container.querySelector('[data-ds-label="Investments portfolio chart"]')!
    fireEvent.touchStart(chart, { touches: [{ clientX: 0, clientY: 0 }] })
    expect(container.querySelector('[data-ds-label="Investments chart point tooltip"]')).toHaveTextContent(
      String(pastValue),
    )
    if (!fresh) {
      expect(container.querySelector('[data-ds-label="Investments chart point tooltip"]')).not.toHaveTextContent('%')
      const dots = chart.querySelectorAll('.recharts-area-dots > g')
      for (const [index, value] of [
        [1, '12.000,00 CZK'],
        [2, '0,00 CZK'],
      ] as const) {
        fireEvent.pointerDown(dots[index]!)
        const tooltip = container.querySelector('[data-ds-label="Investments chart point tooltip"]')!
        expect(tooltip).toHaveTextContent(value)
        expect(tooltip).not.toHaveTextContent('%')
      }
      fireEvent.click(screen.getByRole('button', { name: '1 M' }))
      fireEvent.touchStart(chart, { touches: [{ clientX: 0, clientY: 0 }] })
      expect(container.querySelector('[data-ds-label="Investments chart point tooltip"]')).toHaveTextContent(
        '08 Sep 2026',
      )
      expect(container.querySelector('[data-ds-label="Investments chart point tooltip"]')).not.toHaveTextContent('%')
    }
    for (const element of chart.querySelectorAll('svg *')) {
      for (const attribute of element.attributes) expect(attribute.value).not.toMatch(/NaN|Infinity/)
    }
  })

  it('keeps the default funded chart performance readout', () => {
    const { container } = renderBankingScreen(
      <InvestmentPortfolioChart
        points={[
          { label: '01 Jan 2026', dateLabel: '01 Jan', yearLabel: '2026', value: 100 },
          { label: '02 Jan 2026', dateLabel: '02 Jan', yearLabel: '2026', value: 120 },
        ]}
        country="CZ"
        currency="CZK"
        amountsHidden={false}
      />,
    )
    fireEvent.touchStart(container.querySelector('[data-ds-label="Investments portfolio chart"]')!, {
      touches: [{ clientX: 0, clientY: 0 }],
    })
    const tooltip = container.querySelector('[data-ds-label="Investments chart point tooltip"]')!
    expect(tooltip).toHaveTextContent('120,00 CZK')
    expect(tooltip).toHaveTextContent('+20,00%')
  })

  it('holds the rendered investment cost level until the sale date, then drops at that same date', () => {
    const goal = INITIAL_CZ_ROBO_GOALS[4]!
    const { container } = renderBankingScreen(
      <GoalDetail
        existingGoal={goal}
        goalName={goal.name}
        targetAmount="100000"
        portfolio={getRoboPortfolioForGoal(goal)!}
        country="CZ"
        amountsHidden={false}
        securityCatalog={[]}
        horizonYears={3}
        chartReferenceDate={new Date('2026-10-08T12:00:00Z')}
        onBack={() => undefined}
        onClose={() => undefined}
        onAction={() => undefined}
      />,
    )
    const curve = container.querySelector('.recharts-area-curve')!.getAttribute('d')!
    const commands = curve.match(/[MLC][^MLCZ]*/g)!
    const coordinates = commands.slice(0, 3).map((command) => command.slice(1).split(',').map(Number))
    expect(commands[1]![0]).toBe('L')
    expect(commands[2]![0]).toBe('L')
    expect(coordinates[1]![1]).toBe(coordinates[0]![1])
    expect(coordinates[1]![0]).toBeGreaterThan(coordinates[0]![0]!)
    expect(coordinates[2]![0]).toBe(coordinates[1]![0])
    expect(coordinates[2]![1]).toBeGreaterThan(coordinates[1]![1]!)
  })
})
