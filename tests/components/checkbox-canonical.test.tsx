// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Checkbox from '@/app/components/Checkbox'
import { resolveCanonicalCheckbox } from '@/app/components/contracts/checkbox'

afterEach(cleanup)

describe('canonical Checkbox', () => {
  it('is a 32 px slot holding a 22 px box, and shows a 14 px tick only when checked', () => {
    const { rerender } = render(<Checkbox checked={false} label="Order 1" />)
    const box = screen.getByRole('checkbox', { name: 'Order 1' })
    expect(box).toHaveClass('size-[32px]')
    expect(box).toHaveAttribute('aria-checked', 'false')
    expect(box.querySelector('span')).toHaveClass('size-[22px]', 'border-[var(--uc-text)]', 'bg-[var(--uc-surface)]')
    expect(screen.queryByTestId('checkbox-mark')).toBeNull()
    rerender(<Checkbox checked label="Order 1" />)
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByTestId('checkbox-mark')).toHaveAttribute('width', '14')
  })

  it('reports the next value when pressed', () => {
    const onChange = vi.fn()
    render(<Checkbox checked={false} onCheckedChange={onChange} label="Order 1" />)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('dims when disabled, but a read-only (fixed) selection stays full strength; both are inert', () => {
    const onChange = vi.fn()
    const { rerender } = render(<Checkbox checked disabled onCheckedChange={onChange} label="Order 1" />)
    expect(screen.getByRole('checkbox')).toBeDisabled()
    expect(screen.getByRole('checkbox')).toHaveStyle({ opacity: '0.5' })
    rerender(<Checkbox checked readOnly onCheckedChange={onChange} label="Order 1" />)
    const box = screen.getByRole('checkbox')
    expect(box).toBeDisabled()
    expect(box).toHaveStyle({ opacity: '1' })
    fireEvent.click(box)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shares one definition with the React Native canonical checkbox', () => {
    expect(resolveCanonicalCheckbox({ checked: true })).toMatchObject({
      slot: 32,
      box: 22,
      markSize: 14,
      borderToken: '--uc-text',
      fillToken: '--uc-surface',
    })
  })
})
