// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import PfmCategoryIcon from '@/app/components/pfm/PfmCategoryIcon'

afterEach(cleanup)

describe('PfmCategoryIcon category circle variant', () => {
  it('renders the saved 32px coloured-circle option with a white centred glyph', () => {
    render(<PfmCategoryIcon category="Wallet" variant="category-circle" />)

    const icon = screen.getByLabelText('Wallet PFM category')
    expect(icon).toHaveAttribute('data-pfm-icon-variant', 'category-circle')
    expect(icon).toHaveStyle({ width: '32px', height: '32px', backgroundColor: 'var(--uc-pfm-wallet)' })
    expect(icon.querySelector('svg')).toHaveAttribute('width', '20')
    expect(icon.querySelector('path')).toHaveAttribute('fill', 'var(--uc-static-white)')
  })

  it('keeps the existing glyph-only rendering as the default option', () => {
    render(<PfmCategoryIcon category="Wallet" />)

    expect(screen.getByLabelText('Wallet PFM category')).not.toHaveAttribute('data-pfm-icon-variant', 'category-circle')
  })
})
