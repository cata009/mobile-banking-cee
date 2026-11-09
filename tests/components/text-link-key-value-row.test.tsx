// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import KeyValueRow from '@/app/components/KeyValueRow'
import TextLink from '@/app/components/TextLink'
import { resolveKeyValueRow } from '@/app/components/contracts/keyValueRow'
import { resolveTextLink } from '@/app/components/contracts/textLink'

afterEach(cleanup)

describe('TextLink', () => {
  it('is a 14 Bold action-colored link with a 44px target and no chevron', () => {
    const onClick = vi.fn()
    render(<TextLink onClick={onClick}>Edit</TextLink>)
    const link = screen.getByRole('button', { name: 'Edit' })
    expect(link).toHaveAttribute('data-ds-label', 'TextLink')
    expect(link).toHaveClass('uc-type-n5-strong', 'min-h-[44px]', 'text-[var(--uc-action)]')
    expect(link.querySelector('svg')).toBeNull()
    fireEvent.click(link)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not fire when disabled and keeps a glyph decorative', () => {
    const onClick = vi.fn()
    render(
      <TextLink disabled onClick={onClick} leadingIcon={<img alt="" src="/x.svg" />}>
        Cancel
      </TextLink>,
    )
    const link = screen.getByRole('button', { name: 'Cancel' })
    expect(link).toBeDisabled()
    fireEvent.click(link)
    expect(onClick).not.toHaveBeenCalled()
    expect(link.querySelector('[aria-hidden="true"]')).not.toBeNull()
  })

  it('shares one definition with the React Native link', () => {
    expect(resolveTextLink()).toMatchObject({ fontSize: 14, lineHeight: 16, minHeight: 44, colorToken: '--uc-action' })
    expect(resolveTextLink({ disabled: true }).disabled).toBe(true)
  })
})

describe('KeyValueRow', () => {
  it('lays an inline row out with a muted label, a bold value and a rule', () => {
    const { container } = render(<KeyValueRow label="Street" value="Main 1" size="compact" />)
    const row = container.querySelector('[data-ds-label="KeyValueRow"]')!
    expect(row).toHaveClass('flex', 'justify-between', 'border-b')
    expect(screen.getByText('Street')).toHaveClass('uc-type-n5', 'text-[var(--uc-text-muted)]')
    expect(screen.getByText('Main 1')).toHaveClass('font-bold', 'text-[var(--uc-text)]')
  })

  it('stacks an uppercase bold label above a muted value', () => {
    render(<KeyValueRow label="City" value="Belgrade" layout="stacked" />)
    expect(screen.getByText('City')).toHaveClass('uppercase', 'font-bold', 'text-[var(--uc-text)]')
    expect(screen.getByText('Belgrade')).toHaveClass('uc-type-n4', 'text-[var(--uc-text-muted)]')
  })

  it('renders a definition pair inside a dl', () => {
    const { container } = render(
      <dl>
        <KeyValueRow definition label="Driver" value="Ion" />
      </dl>,
    )
    expect(container.querySelector('dt')).toHaveTextContent('Driver')
    expect(container.querySelector('dd')).toHaveTextContent('Ion')
  })

  it('scales with the size and emphasis options through the shared contract', () => {
    expect(resolveKeyValueRow({ size: 'regular', emphasis: true })).toMatchObject({ valueSize: 24, valueBold: true })
    expect(resolveKeyValueRow({ size: 'compact', plainValue: true })).toMatchObject({ valueSize: 14, valueBold: false })
    expect(resolveKeyValueRow({ layout: 'stacked' })).toMatchObject({ labelUppercase: true, showDivider: false })
  })
})
