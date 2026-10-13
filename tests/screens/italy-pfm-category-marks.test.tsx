// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { PfmMark } from '@/experiences/pi/it/mobile-first/MobileFirstPfmPrimitives'
import { pfmCategory } from '@/experiences/pi/it/mobile-first/pfmFinancialContent'
import { PFM_BUDGET_CATEGORIES } from '@/experiences/pi/it/mobile-first/pfmContent'

afterEach(cleanup)

describe('Italian PFM category marks', () => {
  it.each([
    ['Assicurazioni', 'Insurance'],
    ['Istruzione', 'Education'],
    ['Altre spese', 'Finance'],
    ['Categoria personale', 'Finance'],
  ])('renders %s using the existing %s SVG instead of a question mark', (name, glyph) => {
    render(<PfmMark category={pfmCategory({ name, amountCents: 100 })} />)
    const icon = screen.getByLabelText(`${glyph} PFM category`)
    expect(icon.querySelector('svg path')).not.toBeNull()
    expect(icon).toHaveAttribute('data-pfm-icon-rendering', 'svg')
    expect(screen.queryByText('?')).not.toBeInTheDocument()
  })

  it('also gives the unchanged budget selector a real mark for its generic expense category', () => {
    render(<PfmMark category={PFM_BUDGET_CATEGORIES.find((category) => category.name === 'Altre spese')!} />)
    expect(screen.getByLabelText('Finance PFM category').querySelector('svg path')).not.toBeNull()
  })
})
