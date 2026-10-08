// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import CzInvestmentGoalsScreen, { INITIAL_CZ_ROBO_GOALS } from '@/app/screens/investments/CzInvestmentGoalsScreen'

afterEach(cleanup)

describe('CZ investment goals help', () => {
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
    const originalTotal = screen.getByText('Total goals value').parentElement?.textContent

    fireEvent.click(screen.getByRole('button', { name: 'Help' }))

    expect(screen.getByRole('heading', { name: 'Investment goals', level: 1 })).toBeInTheDocument()
    expect(screen.queryByText('YOUR GOAL LIST')).not.toBeInTheDocument()
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

    expect(screen.getByText('YOUR GOAL LIST')).toBeInTheDocument()
    expect(screen.getAllByTestId('investment-goal-card').map((card) => card.outerHTML)).toEqual(originalCards)
    expect(screen.getByText('Total goals value').parentElement?.textContent).toBe(originalTotal)
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
    expect(screen.getByText('YOUR GOAL LIST')).toBeInTheDocument()
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
