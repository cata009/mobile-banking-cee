// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createFraudSession } from '@/features/cards/fraud/model'
import { FraudScreens } from '@/flows/ba/card-fraud/FraudScreens'

afterEach(cleanup)

describe('fraud dispute receipt', () => {
  it('opens virtual card selection from the banner and returns to unreviewed activity', () => {
    const go = vi.fn()
    render(
      <FraudScreens
        screen="fraud-claim-sent"
        state={createFraudSession('report')}
        dispatch={vi.fn()}
        go={go}
        back={vi.fn()}
        submit={vi.fn()}
      />,
    )
    const banner = screen.getByRole('button', { name: 'Keep making payments' })
    expect(banner.getAttribute('data-component')).toBe('PendingActionCard')
    expect(banner.parentElement?.querySelector('[data-card-variant="mc-virtual-standard-orange"]')).toBeTruthy()
    fireEvent.click(banner)
    expect(go).toHaveBeenLastCalledWith('fraud-virtual-card')
    fireEvent.click(screen.getByRole('button', { name: 'Review other activity' }))
    expect(go).toHaveBeenLastCalledWith('fraud-alerts')
  })

  it('returns home after every activity has been reviewed', () => {
    const go = vi.fn()
    const state = createFraudSession('report')
    state.recognised = ['vienna', 'online']
    render(
      <FraudScreens
        screen="fraud-claim-sent"
        state={state}
        dispatch={vi.fn()}
        go={go}
        back={vi.fn()}
        submit={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Back to Home' }))
    expect(go).toHaveBeenCalledWith('fraud-home')
  })
})
