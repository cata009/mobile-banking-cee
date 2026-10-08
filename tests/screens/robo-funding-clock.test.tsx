// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import CzFutureRoboAdvisorFlow from '@/app/screens/investments/CzFutureRoboAdvisorFlow'
import { INITIAL_CZ_ROBO_GOALS } from '@/app/screens/investments/CzInvestmentGoalsScreen'

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false })),
  )
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function reachMonthlyFunding() {
  fireEvent.click(screen.getByRole('button', { name: 'Add money' }))
  fireEvent.click(screen.getByRole('radio', { name: /Invest monthly/i }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Monthly contribution' }), { target: { value: '1000' } })
}

describe('Robo funding reference clock', () => {
  it('captures the current civil day on mount and retains it after the host day changes', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2045-06-12T12:00:00Z'))
    const view = render(
      <CzFutureRoboAdvisorFlow
        initialGoal={INITIAL_CZ_ROBO_GOALS[1]}
        onBack={() => undefined}
        onExit={() => undefined}
      />,
    )
    reachMonthlyFunding()
    expect(screen.getByRole('textbox', { name: 'Monthly contribution starts' })).toHaveValue('12 June 2045')
    vi.setSystemTime(new Date('2045-06-13T12:00:00Z'))
    view.rerender(
      <CzFutureRoboAdvisorFlow
        initialGoal={INITIAL_CZ_ROBO_GOALS[1]}
        onBack={() => undefined}
        onExit={() => undefined}
      />,
    )
    expect(screen.getByRole('textbox', { name: 'Monthly contribution starts' })).toHaveValue('12 June 2045')
  })
  it('rejects invalid and earlier dates while retaining the valid seed on a later host clock', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2045-12-31T23:59:59Z'))
    render(
      <CzFutureRoboAdvisorFlow
        initialGoal={INITIAL_CZ_ROBO_GOALS[1]}
        demoClock={{ referenceDay: { year: 2026, month: 3, day: 1 } }}
        onBack={() => undefined}
        onExit={() => undefined}
      />,
    )
    reachMonthlyFunding()
    const date = screen.getByRole('textbox', { name: 'Monthly contribution starts' })
    expect(date).toHaveValue('1 March 2026')
    expect(screen.getByRole('button', { name: 'Review investment' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Select recurring start date' }))
    expect(screen.getByRole('gridcell', { selected: true })).toBeEnabled()
    expect(screen.getByRole('gridcell', { selected: true })).toHaveTextContent('1')
    fireEvent.click(screen.getByRole('button', { name: 'Close calendar' }))
    for (const value of ['invalid', '31 February 2026', '28 February 2026', '']) {
      fireEvent.change(date, { target: { value } })
      expect(screen.getByRole('button', { name: 'Review investment' }), value).toBeDisabled()
    }
  })

  it('uses the injected leap day for initialization and the calendar boundary', () => {
    render(
      <CzFutureRoboAdvisorFlow
        initialGoal={INITIAL_CZ_ROBO_GOALS[1]}
        onBack={() => undefined}
        onExit={() => undefined}
        demoClock={{ referenceDay: { year: 2028, month: 2, day: 29 } }}
      />,
    )
    reachMonthlyFunding()
    expect(screen.getByRole('textbox', { name: 'Monthly contribution starts' })).toHaveValue('29 February 2028')
    fireEvent.click(screen.getByRole('textbox', { name: 'Monthly contribution starts' }))
    expect(screen.getByRole('gridcell', { name: '29' })).toBeEnabled()
    expect(screen.getByRole('gridcell', { name: '28' })).toBeDisabled()
    fireEvent.click(screen.getByRole('gridcell', { name: '29' }))
    expect(screen.getByRole('textbox', { name: 'Monthly contribution starts' })).toHaveValue('29 February 2028')
    expect(screen.getByRole('button', { name: 'Review investment' })).toBeEnabled()
    fireEvent.change(screen.getByRole('textbox', { name: 'Monthly contribution starts' }), {
      target: { value: '28 February 2028' },
    })
    expect(screen.getByRole('button', { name: 'Review investment' })).toBeDisabled()
  })
})
