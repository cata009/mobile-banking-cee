// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PrimaryButton from '@/app/components/PrimaryButton'
import WhitePrimaryButton from '@/app/components/ui/PrimaryButton'
import FrozenPrimaryButton from '../fixtures/primary-button-before'

afterEach(cleanup)

describe('PrimaryButton', () => {
  it('keeps Language Save keyboard focus visible and does not submit its host form', () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault())
    const onClick = vi.fn()
    render(<form onSubmit={onSubmit}><PrimaryButton variant="language-save" onClick={onClick}>Save language</PrimaryButton></form>)
    const button = screen.getByRole('button', { name: 'Save language' })
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onSubmit).not.toHaveBeenCalled()
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-[var(--uc-action)]')
  })
  it('makes the new disabled Language Save preset agree with its contract', () => {
    const onClick = vi.fn()
    render(
      <PrimaryButton variant="language-save" disabled onClick={onClick}>
        Save
      </PrimaryButton>,
    )
    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toHaveClass('opacity-30', 'cursor-not-allowed')
    expect(button).not.toHaveClass('hover:opacity-90')
    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })
  it.each([
    ['action', '16', false],
    ['action', '18', false],
    ['action', '16', true],
    ['action', '18', true],
    ['surface', '16', false],
    ['surface', '18', false],
    ['surface', '16', true],
    ['surface', '18', true],
  ] as const)('retains the frozen DOM/class contract: %s %s disabled=%s', (variant, labelSize, disabled) => {
    const props = { variant, labelSize, disabled, className: '!h-[32px] !px-[10px] !py-0' }
    const { container, rerender } = render(<FrozenPrimaryButton {...props}>Continue</FrozenPrimaryButton>)
    const before = container.innerHTML.replace(/\s+/g, ' ')
    rerender(<PrimaryButton {...props}>Continue</PrimaryButton>)
    expect(container.innerHTML.replace(/\s+/g, ' ')).toBe(before)
  })
  it('keeps disabled callbacks inert and enabled callbacks active', () => {
    const onClick = vi.fn()
    const { rerender } = render(
      <PrimaryButton onClick={onClick} disabled>
        Continue
      </PrimaryButton>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(onClick).not.toHaveBeenCalled()
    rerender(<PrimaryButton onClick={onClick}>Continue</PrimaryButton>)
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('preserves consumer overrides and the existing white prelogin adapter', () => {
    const { rerender } = render(<PrimaryButton className="!h-[32px] !px-[10px] !py-0">Approve</PrimaryButton>)
    expect(screen.getByRole('button')).toHaveClass('!h-[32px]', '!px-[10px]', '!py-0')
    rerender(<WhitePrimaryButton text="Login" />)
    expect(screen.getByRole('button')).toHaveClass(
      '!bg-[var(--uc-static-white)]',
      '!text-[var(--uc-static-black)]',
      'uc-type-n4-strong',
    )
  })

  it('matches the design-system Primary disabled state', () => {
    render(<PrimaryButton disabled>Move money</PrimaryButton>)

    expect(screen.getByRole('button', { name: 'Move money' })).toHaveClass(
      'h-[48px]',
      'w-full',
      'rounded',
      'bg-[var(--uc-action-strong)]',
      'text-[var(--uc-static-white)]',
      'opacity-30',
      'uc-type-h2',
    )
  })
})
