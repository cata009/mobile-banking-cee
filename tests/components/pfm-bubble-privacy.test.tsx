// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import PfmCategoryBubbleChart from '@/app/components/pfm/PfmCategoryBubbleChart'

afterEach(cleanup)
const props = {
  subcategories: [{ label: 'Food', total: 1234.56, transactionCount: 1 }],
  colorVar: '--uc-action',
  country: 'CZ' as const,
  currency: 'CZK',
  ariaLabel: 'Subcategories',
  excludeAriaLabel: 'Exclude',
  showTotals: true,
}

it('masks subcategory totals in labels, tooltip and diagnostic attributes', () => {
  render(<PfmCategoryBubbleChart {...props} amountsHidden />)
  const bubble = screen.getByRole('button', { name: 'Exclude: Food' })
  expect(bubble).not.toHaveTextContent('1.234,56')
  expect(bubble.title).not.toContain('1.234,56')
  expect(bubble).not.toHaveAttribute('data-pfm-subcategory-total')
  expect(bubble).toHaveTextContent('****,** CZK')
})

it('preserves the existing visible total and tooltip when masking is off', () => {
  render(<PfmCategoryBubbleChart {...props} />)
  const bubble = screen.getByRole('button', { name: 'Exclude: Food' })
  expect(bubble).toHaveTextContent('1.234,56 CZK')
  expect(bubble.title).toBe('Food: 1.234,56 CZK')
})
