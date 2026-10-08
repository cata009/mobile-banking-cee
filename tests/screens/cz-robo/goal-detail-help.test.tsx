// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { GoalDetail } from '@/app/screens/investments/robo/GoalDetail'
import { INITIAL_CZ_ROBO_GOALS } from '@/features/investments/robo/goalFixtures'
import { getRoboPortfolioForGoal } from '@/features/investments/robo/model'

afterEach(cleanup)

it('opens goal detail help and returns to the same goal and selected chart period', () => {
  const goal = INITIAL_CZ_ROBO_GOALS[1]!
  const onBack = vi.fn()
  const onAction = vi.fn()
  render(
    <GoalDetail
      existingGoal={goal}
      goalName={goal.name}
      targetAmount="250000"
      portfolio={getRoboPortfolioForGoal(goal)!}
      country="CZ"
      amountsHidden={false}
      securityCatalog={[]}
      horizonYears={goal.horizonYears}
      onBack={onBack}
      onClose={vi.fn()}
      onAction={onAction}
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: '1 Y' }))
  const originalValue = screen.getByTestId('robo-goal-detail').textContent
  fireEvent.click(screen.getByRole('button', { name: 'Help' }))
  expect(screen.getByRole('heading', { name: 'Understanding your goal', level: 1 })).toBeInTheDocument()
  expect(screen.getByText(/A goal emptied through sales/)).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Add or withdraw money' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Help' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Back' }))
  expect(screen.getByRole('heading', { name: goal.name, level: 1 })).toBeInTheDocument()
  expect(screen.getByTestId('robo-goal-detail').textContent).toBe(originalValue)
  expect(screen.getByRole('button', { name: '1 Y' })).toHaveAttribute('aria-pressed', 'true')
  expect(onBack).not.toHaveBeenCalled()
  expect(onAction).not.toHaveBeenCalled()
})
