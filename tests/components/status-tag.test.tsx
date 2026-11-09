// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import StatusTag from '@/app/components/StatusTag'
import { resolveStatusTag } from '@/app/components/contracts/statusTag'

afterEach(cleanup)

describe('StatusTag', () => {
  it('shows a dot and tints the fill from the tone colour into the surface', () => {
    const { container } = render(<StatusTag tone="positive">Active</StatusTag>)
    const tag = screen.getByText('Active')
    expect(tag).toHaveAttribute('data-ds-label', 'StatusTag')
    expect(tag).toHaveStyle({ color: 'var(--uc-green-status)' })
    expect(tag.getAttribute('style')).toContain('color-mix(in srgb, var(--uc-green-status) 12%, var(--uc-surface))')
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull()
  })

  it('uses the muted surface for neutral and can hide the dot', () => {
    const { container } = render(
      <StatusTag tone="neutral" dot={false}>
        Not verified
      </StatusTag>,
    )
    expect(screen.getByText('Not verified').getAttribute('style')).toContain('var(--uc-surface-muted)')
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull()
  })

  it('shares one definition with the React Native tag', () => {
    expect(resolveStatusTag({ tone: 'negative' })).toMatchObject({
      textToken: '--uc-status-red',
      tintPercent: 10,
      fontSize: 12,
    })
    expect(resolveStatusTag({ tone: 'warning' }).textToken).toBe('--uc-orange-deep')
  })
})
