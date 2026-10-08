// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CreationSuccessScreen } from '@/app/screens/investments/robo/CreationSuccessScreen'

afterEach(cleanup)

describe('Robo goal creation success', () => {
  it('invites the first investment towards the selected goal with flexible contribution options', () => {
    render(
      <CreationSuccessScreen
        goalName="A home of my own"
        targetAmount="1,500,000 CZK"
        basketName="Balanced"
        onAddMoney={() => undefined}
        onOpenGoal={() => undefined}
      />,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Your goal is ready' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Give your goal a head start' })).toBeVisible()
    expect(screen.getByText('A home of my own')).toBeVisible()
    expect(screen.getByText(/one-off contribution or a monthly plan/i)).toBeVisible()
    expect(screen.getByText(/review.*before confirming/i)).toBeVisible()
  })

  it('opens first funding only when Add money is chosen', () => {
    const onAddMoney = vi.fn()
    const onOpenGoal = vi.fn()
    render(
      <CreationSuccessScreen
        goalName="My future"
        targetAmount="500,000 CZK"
        basketName="Dynamic"
        onAddMoney={onAddMoney}
        onOpenGoal={onOpenGoal}
      />,
    )

    expect(onAddMoney).not.toHaveBeenCalled()
    expect(onOpenGoal).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Add money' }))
    expect(onAddMoney).toHaveBeenCalledTimes(1)
    expect(onOpenGoal).not.toHaveBeenCalled()
  })

  it('lets the customer view their goal without beginning a contribution', () => {
    const onAddMoney = vi.fn()
    const onOpenGoal = vi.fn()
    render(
      <CreationSuccessScreen
        goalName="My future"
        targetAmount="500,000 CZK"
        basketName="Dynamic"
        onAddMoney={onAddMoney}
        onOpenGoal={onOpenGoal}
      />,
    )

    const addMoney = screen.getByRole('button', { name: 'Add money' })
    const viewGoal = screen.getByRole('button', { name: 'View goal' })
    expect(viewGoal.parentElement).toBe(addMoney.parentElement)
    expect(addMoney.nextElementSibling).toBe(viewGoal)
    fireEvent.click(viewGoal)
    expect(onOpenGoal).toHaveBeenCalledTimes(1)
    expect(onAddMoney).not.toHaveBeenCalled()
  })
})
