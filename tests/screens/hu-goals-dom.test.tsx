// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import KidsMarketHomeApp from '@/app/screens/kids/KidsMarketHomeApp'
import { HuKidsAddMoneyPage } from '@/app/screens/kids/hu/goals'
import { HU_KIDS_INITIAL_GOALS } from '@/app/screens/kids/hu/data'
import { HU_DEFAULT_THEME } from '@/app/screens/kids/hu/theme'
import { DemoProvider } from '@/app/state/demoStore'
import { LanguageProvider } from '@/app/contexts/LanguageContext'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
function mountKids() {
  return render(
    <DemoProvider initialState={{ country: 'HU', product: 'KIDS_PI' }}>
      <LanguageProvider initialLanguage="en">
        <KidsMarketHomeApp country="HU" />
      </LanguageProvider>
    </DemoProvider>,
  )
}
function openGoal() {
  fireEvent.click(screen.getByRole('button', { name: 'Saving' }))
  fireEvent.click(screen.getByRole('button', { name: /New bike/ }))
}
describe('HU goal screen integration', () => {
  it('creates a goal, adds money, renames it and terminates it through the composition reducer', () => {
    mountKids()
    fireEvent.click(screen.getByRole('button', { name: 'Saving' }))
    fireEvent.click(screen.getByRole('button', { name: 'SEE SAVING GOALS' }))
    fireEvent.click(screen.getByRole('button', { name: 'Create saving goal' }))
    fireEvent.change(screen.getByLabelText('Goal name'), { target: { value: 'Camera' } })
    fireEvent.change(screen.getByLabelText('Target'), { target: { value: '4000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create goal' }))
    expect(screen.getAllByText('Camera').length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: 'Add Money' }))
    fireEvent.click(screen.getByRole('button', { name: '1.000 HUF' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add money' }))
    expect(screen.getByText('You added money')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
    fireEvent.click(screen.getByRole('button', { name: 'Rename' }))
    fireEvent.change(screen.getByPlaceholderText('Goal name'), { target: { value: 'Camera kit' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getAllByText('Camera kit').length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close goal' }))
    expect(screen.getByText('Saving goals')).toBeInTheDocument()
    expect(screen.queryByText('Camera kit')).not.toBeInTheDocument()
  })
  it('records a schedule without changing the saved balance, then deletes the scheduled contribution', () => {
    mountKids()
    openGoal()
    fireEvent.click(screen.getByRole('button', { name: 'Add Money' }))
    fireEvent.click(screen.getByRole('button', { name: '1.000 HUF' }))
    fireEvent.click(screen.getByRole('button', { name: 'Schedule' }))
    fireEvent.click(screen.getByRole('button', { name: 'Never' }))
    fireEvent.click(screen.getByRole('button', { name: 'Weekly' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'Schedule' }).at(-1)!)
    expect(screen.getByText('Scheduled transfer')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Scheduled transfer/ }))
    fireEvent.click(screen.getByRole('button', { name: /Delete/ }))
    expect(screen.queryByText('Scheduled transfer')).not.toBeInTheDocument()
    expect(screen.getAllByText(/14.500/).length).toBeGreaterThan(0)
  })
  it('respects account balance and preserves the scheduled submission callback', () => {
    const onSubmit = vi.fn(),
      onScheduleAdd = vi.fn()
    render(
      <HuKidsAddMoneyPage
        goal={HU_KIDS_INITIAL_GOALS[0]!}
        theme={HU_DEFAULT_THEME}
        showAmounts
        onBack={() => {}}
        onSubmit={onSubmit}
        onScheduleAdd={onScheduleAdd}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '5.000 HUF' }))
    fireEvent.click(screen.getByRole('button', { name: /Spending account/ }))
    fireEvent.click(screen.getByRole('button', { name: /Pocket money/ }))
    expect(screen.getByRole('button', { name: 'Add money' })).toBeDisabled()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(onScheduleAdd).not.toHaveBeenCalled()
  })
})
