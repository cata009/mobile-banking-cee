// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import CzInvestmentGoalsScreen, { INITIAL_CZ_ROBO_GOALS } from '@/app/screens/investments/CzInvestmentGoalsScreen'

afterEach(cleanup)

describe('CZ investment goals help', () => {
  it('names the list and presents the live total alongside the goal cards', () => {
    const goals = [
      { ...INITIAL_CZ_ROBO_GOALS[0]!, currentInteger: '1 200', currentDecimals: ',25 CZK' },
      { ...INITIAL_CZ_ROBO_GOALS[1]!, currentInteger: '300', currentDecimals: ',75 CZK' },
    ]
    const props = { onBack: () => undefined, onCreateGoal: () => undefined, onOpenGoal: () => undefined }
    const { rerender } = render(<CzInvestmentGoalsScreen goals={goals} {...props} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Your goals list' })).toBeInTheDocument()
    expect(screen.getByText('Track your plans, one step at a time')).toBeInTheDocument()
    const summary = screen.getByRole('region', { name: 'Total goals value' })
    expect(summary).toHaveTextContent('1.501,00 CZK')
    expect(screen.getAllByTestId('investment-goal-card')).toHaveLength(2)
    rerender(<CzInvestmentGoalsScreen goals={[]} {...props} />)
    expect(screen.getByRole('region', { name: 'Total goals value' })).toHaveTextContent('0,00 CZK')
    expect(screen.queryAllByTestId('investment-goal-card')).toHaveLength(0)
  })

  it('opens useful help and returns to unchanged goal cards without leaving the list', () => {
    const onBack = vi.fn()
    const onCreateGoal = vi.fn()
    const onOpenGoal = vi.fn()
    render(
      <CzInvestmentGoalsScreen
        goals={INITIAL_CZ_ROBO_GOALS}
        onBack={onBack}
        onCreateGoal={onCreateGoal}
        onOpenGoal={onOpenGoal}
      />,
    )
    const originalCards = screen.getAllByTestId('investment-goal-card').map((card) => card.outerHTML)
    const originalTotal = screen.getByRole('region', { name: 'Total goals value' }).textContent

    fireEvent.scroll(screen.getByRole('main'), { target: { scrollTop: 100 } })

    fireEvent.click(screen.getByRole('button', { name: 'Help' }))

    expect(screen.getByRole('heading', { name: 'Investment goals', level: 1 })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Your goals' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Set your goal' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Your model portfolio' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Make your first investment' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Value and progress' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Add money' })).toBeInTheDocument()
    expect(screen.getByText(/Your investment profile/)).toHaveClass('text-[16px]')
    expect(screen.getByText(/Both value and progress can fall/)).toHaveClass('text-[16px]')
    expect(screen.getByText(/Orders stay pending until they are executed/)).toHaveClass('text-[16px]')
    expect(screen.queryByRole('button', { name: 'Help' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(screen.getByRole('heading', { name: 'Your goals' })).toBeInTheDocument()
    expect(screen.getAllByTestId('investment-goal-card').map((card) => card.outerHTML)).toEqual(originalCards)
    expect(screen.getByRole('region', { name: 'Total goals value' }).textContent).toBe(originalTotal)
    expect(screen.getByRole('heading', { level: 1, name: 'Your goals list' })).toBeInTheDocument()
    expect(onBack).not.toHaveBeenCalled()
    expect(onCreateGoal).not.toHaveBeenCalled()
    expect(onOpenGoal).not.toHaveBeenCalled()

    fireEvent.click(
      screen.getByRole('button', {
        name: `Open ${INITIAL_CZ_ROBO_GOALS[0]!.name}: ${INITIAL_CZ_ROBO_GOALS[0]!.purpose}`,
      }),
    )
    expect(onOpenGoal).toHaveBeenCalledWith(INITIAL_CZ_ROBO_GOALS[0])
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('enters the creation intro through the existing callback and preserves the goal cards', () => {
    const onBack = vi.fn()
    const onCreateGoal = vi.fn()
    render(
      <CzInvestmentGoalsScreen
        goals={INITIAL_CZ_ROBO_GOALS}
        onBack={onBack}
        onCreateGoal={onCreateGoal}
        onOpenGoal={() => undefined}
      />,
    )
    const originalCards = screen.getAllByTestId('investment-goal-card').map((card) => card.outerHTML)

    fireEvent.click(screen.getByRole('button', { name: 'Create New Goal' }))
    expect(screen.getAllByTestId('investment-goal-card').map((card) => card.outerHTML)).toEqual(originalCards)
    expect(onBack).not.toHaveBeenCalled()
    expect(onCreateGoal).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('heading', { name: 'Your goals' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'I confirm these data' })).not.toBeInTheDocument()
  })

  it('makes help available when the goal list is empty', () => {
    render(
      <CzInvestmentGoalsScreen
        goals={[]}
        onBack={() => undefined}
        onCreateGoal={() => undefined}
        onOpenGoal={() => undefined}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Help' }))
    expect(screen.getByRole('heading', { name: 'Set your goal' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.queryAllByTestId('investment-goal-card')).toHaveLength(0)
    expect(screen.getByRole('button', { name: 'Create New Goal' })).toBeInTheDocument()
  })
})
