// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import RadioButton from '@/app/components/common/RadioButton'
import FrozenRadioButton, { FrozenDateFilterRow } from '../fixtures/radio-button-before'
import AccountTransactionFiltersSheet from '@/app/screens/accounts/AccountTransactionFiltersSheet'
import { EMPTY_ACCOUNT_TRANSACTION_FILTERS } from '@/features/accounts-payments/evoTransactionFilters'

afterEach(cleanup)

describe('radio pilot preservation', () => {
  it.each([true, false])('preserves the frozen date row DOM checked=%s', (selected) => {
    const props = { selected, label: 'LAST WEEK', onClick: vi.fn() }
    const { container, rerender } = render(<FrozenDateFilterRow {...props} />)
    const before = container.innerHTML.replace(/\s+/g, ' ')
    rerender(<RadioButton {...props} variant="date-filter" />)
    expect(container.innerHTML.replace(/\s+/g, ' ')).toBe(before)
  })
  it.each([true, false])('preserves the frozen standard DOM checked=%s', (selected) => {
    const props = { selected, label: 'Română', onClick: vi.fn(), className: 'bg-[var(--uc-surface)]' }
    const { container, rerender } = render(<FrozenRadioButton {...props} />)
    const before = container.innerHTML.replace(/\s+/g, ' ')
    rerender(<RadioButton {...props} />)
    expect(container.innerHTML.replace(/\s+/g, ' ')).toBe(before)
  })

  it('is controlled: activation calls the owner without mutating selection', () => {
    const onClick = vi.fn()
    render(<RadioButton selected label="English" onClick={onClick} />)
    const radio = screen.getByRole('radio', { name: 'English' })
    fireEvent.click(radio)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(radio).toHaveAttribute('aria-checked', 'true')
  })

  it('keeps date presets draft-only, allows deselection and applies the exact payload', () => {
    const onApply = vi.fn()
    const onClose = vi.fn()
    render(
      <AccountTransactionFiltersSheet
        currency="RON"
        filters={EMPTY_ACCOUNT_TRANSACTION_FILTERS}
        onApply={onApply}
        onClose={onClose}
      />,
    )
    const week = screen.getByRole('radio', { name: 'LAST WEEK' })
    fireEvent.click(week)
    expect(week).toHaveAttribute('aria-checked', 'true')
    expect(week).not.toHaveAttribute('aria-label')
    expect(week).toHaveClass('h-[80px]', 'px-[16px]')
    expect(onApply).not.toHaveBeenCalled()
    fireEvent.click(week)
    expect(week).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()
    fireEvent.click(screen.getByRole('radio', { name: 'LAST MONTH' }))
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(onApply).toHaveBeenCalledExactlyOnceWith({ ...EMPTY_ACCOUNT_TRANSACTION_FILTERS, datePreset: 'last-month' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closing discards the pending selection and calls only onClose', () => {
    const onApply = vi.fn()
    const onClose = vi.fn()
    render(
      <AccountTransactionFiltersSheet
        currency="RON"
        filters={EMPTY_ACCOUNT_TRANSACTION_FILTERS}
        onApply={onApply}
        onClose={onClose}
      />,
    )
    fireEvent.click(screen.getByRole('radio', { name: 'SELECT CUSTOM PERIOD' }))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onApply).not.toHaveBeenCalled()
  })
})
