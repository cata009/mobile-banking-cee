// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import InvestmentPeriodChips from '@/app/components/investments/InvestmentPeriodChips'
import InvestmentFilterChips from '@/app/components/investments/InvestmentFilterChips'

afterEach(cleanup)

describe('investment selection group accessibility', () => {
  it('names period choices independently of the data and keeps selection controlled', () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <InvestmentPeriodChips
        periods={[{ id: '1m', label: '1 M' }, { id: '1y', label: '1 Y' }]}
        selectedPeriodId="1m"
        onChange={onChange}
      />,
    )
    const group = screen.getByRole('group', { name: 'Investment period' })
    expect(within(group).getByRole('button', { name: '1 M' })).toHaveAttribute('aria-pressed', 'true')
    const year = within(group).getByRole('button', { name: '1 Y' })
    fireEvent.click(year)
    expect(onChange).toHaveBeenCalledExactlyOnceWith('1y')
    expect(year).toHaveAttribute('aria-pressed', 'false')

    rerender(
      <InvestmentPeriodChips
        periods={[{ id: '1y', label: '1 Y' }]}
        selectedPeriodId="1y"
        onChange={onChange}
        ariaLabel="Perioada de performanță"
        comfortableTouchTargets
      />,
    )
    expect(screen.getByRole('group', { name: 'Perioada de performanță' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1 Y' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('names sorting choices and preserves their labels, values and selected state', () => {
    const onChange = vi.fn()
    const options = [{ id: 'max-value' as const, label: 'MAX VALUE' }, { id: 'min-value' as const, label: 'MIN VALUE' }]
    const { rerender } = render(
      <InvestmentFilterChips options={options} selectedOptionId="max-value" onChange={onChange} />,
    )
    const group = screen.getByRole('group', { name: 'Investment sorting' })
    expect(within(group).getByRole('button', { name: 'MAX VALUE' })).toHaveAttribute('aria-pressed', 'true')
    const minimum = within(group).getByRole('button', { name: 'MIN VALUE' })
    fireEvent.click(minimum)
    expect(onChange).toHaveBeenCalledExactlyOnceWith('min-value')
    expect(minimum).toHaveAttribute('aria-pressed', 'false')
    rerender(
      <InvestmentFilterChips
        options={options}
        selectedOptionId="min-value"
        onChange={onChange}
        ariaLabel="Sortarea investițiilor"
      />,
    )
    expect(screen.getByRole('group', { name: 'Sortarea investițiilor' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'MIN VALUE' })).toHaveAttribute('aria-pressed', 'true')
  })
})
