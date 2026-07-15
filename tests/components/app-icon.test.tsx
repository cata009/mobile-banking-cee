// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { AppIcon, ICON_INVENTORY, ICON_REGISTRY } from '@/app/components/icons/AppIcon'

afterEach(cleanup)

describe('AppIcon registry', () => {
  it('keeps inventory entries in one-to-one correspondence with non-radio registry entries', () => {
    const inventoryNames = ICON_INVENTORY.map(({ name }) => name).sort()
    const expectedNames = Object.keys(ICON_REGISTRY)
      .filter((name) => name !== 'radio-selected' && name !== 'radio-unselected')
      .sort()

    expect(inventoryNames).toEqual(expectedNames)
    for (const item of ICON_INVENTORY) {
      expect(item.label).not.toBe('')
      expect(item.usage.length).toBeGreaterThan(0)
      expect(item.previewWidth).toBeGreaterThan(0)
      expect(item.previewHeight).toBeGreaterThan(0)
      expect(item.viewBox).not.toBe('')
    }
  })

  it('renders the custom branch with an accessible title and explicit dimensions', () => {
    render(<AppIcon name="close-x" title="Close artwork" width={31} height={29} />)

    const icon = screen.getByRole('img', { name: 'Close artwork' })
    expect(icon).toHaveAttribute('width', '31')
    expect(icon).toHaveAttribute('height', '29')
    expect(icon.querySelector('title')).toHaveTextContent('Close artwork')
  })

  it('renders the Lucide branch with an accessible title, dimensions, and stroke width', () => {
    render(<AppIcon name="wallet-cards" title="Wallet artwork" width={27} height={25} strokeWidth={1.75} />)

    const icon = screen.getByRole('img', { name: 'Wallet artwork' })
    expect(icon).toHaveAttribute('width', '27')
    expect(icon).toHaveAttribute('height', '25')
    expect(icon).toHaveAttribute('stroke-width', '1.75')
    expect(icon.querySelector('title')).toHaveTextContent('Wallet artwork')
  })

  it.each(['header-profile', 'header-messages'] as const)('renders the semantic %s icon contract', (name) => {
    expect(ICON_REGISTRY[name]).toBeDefined()

    render(<AppIcon name={name} title={name} />)

    expect(screen.getByRole('img', { name })).toBeInTheDocument()
  })
})
