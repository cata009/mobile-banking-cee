// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { GoalDetail } from '@/app/screens/investments/robo/GoalDetail'
import { INITIAL_CZ_ROBO_GOALS } from '@/features/investments/robo/goalFixtures'
import { getRoboPortfolioForGoal, type RoboExistingGoal } from '@/features/investments/robo/model'

afterEach(cleanup)

const sourceGoal = INITIAL_CZ_ROBO_GOALS[0]!
const emptyGoal: RoboExistingGoal = {
  ...sourceGoal,
  currentInteger: '0',
  currentDecimals: ',00 CZK',
  returnLabel: '0 total return',
  returnTone: 'neutral',
  positions: [],
  orders: [],
  transactions: [],
}

function mount(goal: RoboExistingGoal) {
  return render(
    <GoalDetail
      goalName={goal.name}
      targetAmount="100000"
      portfolio={getRoboPortfolioForGoal(goal)!}
      country="CZ"
      amountsHidden={false}
      securityCatalog={[]}
      horizonYears={goal.horizonYears}
      existingGoal={goal}
      onBack={() => undefined}
      onClose={() => undefined}
      onAction={() => undefined}
    />,
  )
}

describe('Empty Robo goal progress', () => {
  it('shows zero target progress below the actions without implying invested holdings', () => {
    mount(emptyGoal)
    const progressHeading = screen.getByRole('heading', { name: 'Goal progress' })
    expect(screen.getByTestId('goal-detail-progress-badge')).toHaveTextContent(/^0%$/)
    const track = screen.getByTestId('goal-detail-progress-bar')
    expect(track.querySelector('[style]')).toHaveStyle({ width: '0%' })
    expect(screen.getByText('100.000,00 CZK')).toBeVisible()
    expect(screen.getByText('15 Feb 2025')).toBeVisible()
    expect(screen.getByText('15 Feb 2028')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Add money' }).compareDocumentPosition(progressHeading)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(screen.queryByRole('heading', { name: 'Portfolio allocation' })).not.toBeInTheDocument()
  })

  it.each([
    ['ready', emptyGoal, 'Your goal is ready to invest'],
    [
      'pending',
      {
        ...emptyGoal,
        orders: [{ ...sourceGoal.orders![0]!, orderType: 'BUY', status: 'PENDING' }],
      },
      'Your top-up orders are pending',
    ],
    [
      'scheduled',
      {
        ...emptyGoal,
        recurringContribution: { amount: 1000, startDate: '15 Oct 2026' },
      },
      'Your recurring top-up is scheduled',
    ],
    ['sold', { ...emptyGoal, transactions: sourceGoal.transactions }, 'Your goal is currently empty'],
  ] satisfies [string, RoboExistingGoal, string][])(
    'retains the %s explanation alongside zero progress',
    (_state, goal, explanation) => {
      mount(goal)
      expect(screen.getByText(explanation)).toBeVisible()
      expect(screen.getByTestId('goal-detail-progress-badge')).toHaveTextContent(/^0%$/)
      expect(screen.queryByRole('heading', { name: 'Portfolio allocation' })).not.toBeInTheDocument()
    },
  )

  it('preserves the funded goal progress and allocation', () => {
    mount(sourceGoal)
    expect(screen.getByTestId('goal-detail-progress-badge')).toHaveTextContent(/^100%$/)
    expect(screen.getByTestId('goal-detail-progress-bar').querySelector('[style]')).toHaveStyle({ width: '100%' })
    expect(screen.getByRole('heading', { name: 'Portfolio allocation' })).toBeVisible()
  })
})
