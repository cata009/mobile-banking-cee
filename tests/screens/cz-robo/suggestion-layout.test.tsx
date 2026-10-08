// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { useState, type ComponentProps } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CreationGoalNameScreen } from '@/app/screens/investments/robo/OnboardingCreationScreens'
import { GoalPlanScreen } from '@/app/screens/investments/robo/GoalPlanScreen'
import { ManagementInputScreen } from '@/app/screens/investments/robo/ManagementInputScreen'

afterEach(cleanup)

function GoalNameHarness() {
  const [goalName, setGoalName] = useState('')
  return (
    <CreationGoalNameScreen
      goalName={goalName}
      setGoalName={setGoalName}
      goalType="General build-up wealth"
      goBackByStep={() => undefined}
      requestExit={() => undefined}
      setStep={() => undefined}
    />
  )
}

function GoalPlanHarness({
  dataScreen = 'target-and-horizon',
  onClose = () => undefined,
}: {
  dataScreen?: string
  onClose?: () => void
}) {
  const [targetAmount, setTargetAmount] = useState('')
  const [horizonYears, setHorizonYears] = useState(0)
  return (
    <GoalPlanScreen
      dataScreen={dataScreen}
      targetAmount={targetAmount}
      onTargetAmountChange={setTargetAmount}
      horizonYears={horizonYears}
      onSelectHorizon={setHorizonYears}
      manualHorizon=""
      onManualHorizonChange={() => undefined}
      onBack={() => undefined}
      onClose={onClose}
      onContinue={() => undefined}
    />
  )
}

function TopUpHarness() {
  const [amount, setAmount] = useState('')
  const [monthlyAmount, setMonthlyAmount] = useState('')
  const props: ComponentProps<typeof ManagementInputScreen> = {
    mode: 'add-money',
    onBack: () => undefined,
    onClose: () => undefined,
    recurringDatePickerOpen: false,
    setRecurringDatePickerOpen: () => undefined,
    demoClock: { referenceDay: { year: 2026, month: 3, day: 1 } },
    date: '01.03.2026',
    setDate: () => undefined,
    topUpCashAccountSheetOpen: false,
    currentAccounts: [],
    country: 'CZ',
    amountsHidden: false,
    selectedCashAccountId: '',
    setTopUpCashAccountSheetOpen: () => undefined,
    onCashAccountChange: () => undefined,
    renameName: '',
    canReviewTopUp: false,
    onRename: () => undefined,
    onMode: () => undefined,
    dispatchManagement: () => undefined,
    renderSelectedWithdrawalProducts: () => <></>,
    topUpMethod: 'combined',
    setTopUpMethod: () => undefined,
    topUpFields: { initialAmount: true, monthlyContribution: true, startDate: true, cashAccount: true },
    amount,
    setAmount,
    monthlyAmount,
    setMonthlyAmount,
    setRenameName: () => undefined,
    selectedTopUpCashAccount: null,
  }
  return <ManagementInputScreen {...props} />
}

function getReservedLabel(inputName: string) {
  const input = screen.getByRole('textbox', { name: inputName })
  const field = input.closest('[data-component="TextField"]')!
  const label = field.querySelector('label')
  expect(label).toHaveTextContent(inputName)
  expect(label).toHaveAttribute('for', input.id)
  return { input, label }
}

describe('CZ Robo suggestion fields', () => {
  it('reserves the goal-name label before selection and preserves selected suggestion behavior', () => {
    render(<GoalNameHarness />)
    const { input, label } = getReservedLabel('Enter your goal name')
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    const suggestions = screen.getByRole('group', { name: 'Suggested goal names' })
    const suggestion = suggestions.querySelector('button')!
    fireEvent.click(suggestion)
    expect(input).toHaveValue(suggestion.textContent)
    expect(suggestion).toHaveAttribute('aria-pressed', 'true')
    expect(getReservedLabel('Enter your goal name').label).toBe(label)
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
    fireEvent.change(input, { target: { value: '' } })
    expect(getReservedLabel('Enter your goal name').label).toBe(label)
  })

  it('reserves the target label and restores Close only for creation while preserving horizon validation', () => {
    const onClose = vi.fn()
    const { unmount } = render(<GoalPlanHarness onClose={onClose} />)
    const { input, label } = getReservedLabel('Target amount')
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '100.000 CZK' }))
    expect(input).toHaveValue('100000')
    expect(getReservedLabel('Target amount').label).toBe(label)
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    fireEvent.click(screen.getByRole('radio', { name: '10 years' }))
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledTimes(1)
    unmount()
    render(<GoalPlanHarness dataScreen="manage-goal-plan" />)
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
  })

  it('reserves initial and monthly labels before funding suggestions populate the fields', () => {
    render(<TopUpHarness />)
    const initial = getReservedLabel('Initial amount to add')
    const monthly = getReservedLabel('Monthly contribution')
    fireEvent.click(screen.getByRole('button', { name: '5.000 CZK' }))
    expect(initial.input).toHaveValue('5000')
    expect(getReservedLabel('Initial amount to add').label).toBe(initial.label)
    expect(getReservedLabel('Monthly contribution').label).toBe(monthly.label)
    fireEvent.click(screen.getByRole('button', { name: '1.000 CZK' }))
    expect(monthly.input).toHaveValue('1000')
    expect(getReservedLabel('Monthly contribution').label).toBe(monthly.label)
  })
})
