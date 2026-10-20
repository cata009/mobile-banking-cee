// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import NavigationRow from '@/app/components/NavigationRow'
import ToggleButton from '@/app/components/ToggleButton'
import { resolveNavigationRow } from '@/app/components/contracts/navigationRow'

afterEach(cleanup)

describe('Navigation page 2 Figma geometry', () => {
  // Source 1515:2088 / 1515:2093 / 1515:2081 / 1566:321: 24px start, 16px end.
  it.each([false, true])('reserves the original toggle row insets with leading=%s', hasLeading => {
    expect(resolveNavigationRow({ trailingAccessory: 'toggle', hasLeading })).toMatchObject({
      rowHeight: 80, paddingLeft: 24, paddingRight: 16,
    })
  })

  it('renders the corrected toggle inset without changing callback ownership', () => {
    const onToggle = vi.fn(), onClick = vi.fn()
    const { container } = render(
      <NavigationRow title="Notifications" trailingAccessory="toggle" toggleChecked onToggle={onToggle} onClick={onClick} />,
    )
    expect(container.firstElementChild).toHaveClass('pl-[24px]', 'pr-[16px]', 'h-[80px]')
    expect(container.firstElementChild?.tagName).toBe('DIV')
    fireEvent.click(screen.getByRole('switch', { name: 'Notifications' }))
    expect(onToggle).toHaveBeenCalledExactlyOnceWith(false)
    expect(onClick).not.toHaveBeenCalled()
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })

  // Source 1515:2005 / 1515:2008: centered 64px row, UniCredit Bold 14px.
  it.each(['default', 'action'] as const)('uses compact special-row typography for tone=%s', titleTone => {
    expect(resolveNavigationRow({ rowHeight: 64, centerContent: true, titleTone })).toMatchObject({
      titleFontSize: 14, paddingLeft: 24, paddingRight: 24,
    })
    render(<NavigationRow title="Show more" rowHeight={64} centerContent titleTone={titleTone} />)
    expect(screen.getByText('Show more')).toHaveClass('uc-type-n5-strong', 'line-clamp-1')
  })

  it('keeps standard icons, compact payment toggles and custom accessories distinct', () => {
    expect(resolveNavigationRow({ hasLeading: true, trailingAccessory: 'chevron' })).toMatchObject({
      paddingLeft: 16, paddingRight: 12, titleFontSize: 16,
    })
    expect(resolveNavigationRow({ trailingAccessory: 'toggle', hasTrailing: true })).toMatchObject({
      paddingLeft: 24, paddingRight: 12,
    })
    expect(resolveNavigationRow({ rowHeight: 64, centerContent: true, hasLeading: true }).titleFontSize).toBe(16)
  })

  it('retains the measured Payment type content position when removing its original 4px overflow', () => {
    expect(resolveNavigationRow({ rowHeight: 64, trailingAccessory: 'toggle', hasLeading: true })).toMatchObject({
      paddingLeft: 14, paddingRight: 16, titleFontSize: 16,
    })
    const { container } = render(<NavigationRow title="Payment type" rowHeight={64} leadingIconName="chevron-link" trailingAccessory="toggle" />)
    expect(container.firstElementChild).toHaveClass('pl-[14px]', 'pr-[16px]')
  })

  it.each([false, true])('preserves the original 60×30 switch and controlled state checked=%s', checked => {
    const onToggle = vi.fn()
    const { container, rerender } = render(<ToggleButton ariaLabel="Setting" checked={checked} onToggle={onToggle} />)
    const control = screen.getByRole('switch', { name: 'Setting' })
    expect(control).toHaveAttribute('aria-checked', String(checked))
    expect(container.querySelector('[data-component="ToggleButton"]')).toHaveClass('w-[60px]', 'h-[30px]')
    expect(container.querySelector('span.absolute')).toHaveClass(checked ? 'left-[34px]' : 'left-[4px]')
    fireEvent.click(control)
    expect(onToggle).toHaveBeenCalledExactlyOnceWith(!checked)
    rerender(<ToggleButton ariaLabel="Setting" checked={checked} onToggle={onToggle} disabled />)
    fireEvent.click(screen.getByRole('switch'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })
})
