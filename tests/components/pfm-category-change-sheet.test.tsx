// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'
import PfmCategoryChangeSheet from '@/app/components/pfm/PfmCategoryChangeSheet'
import type { PfmCategorySelection } from '@/data/pfmCategories'

const CURRENT_SELECTION: PfmCategorySelection = {
  groupId: 'taxes-fines',
  groupLabel: 'TAXES & FINES',
  category: 'Taxes and Penalties',
  subcategory: 'TAX PAYMENT',
}

function renderSheet(overrides?: Partial<React.ComponentProps<typeof PfmCategoryChangeSheet>>) {
  const onClose = vi.fn()
  const onConfirm = vi.fn()

  render(
    <DemoProvider initialState={{ country: 'RO' }}>
      <LanguageProvider initialLanguage="en">
        <PfmCategoryChangeSheet
          currentSelection={CURRENT_SELECTION}
          onClose={onClose}
          onConfirm={onConfirm}
          {...overrides}
        />
      </LanguageProvider>
    </DemoProvider>,
  )

  return { onClose, onConfirm }
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('PfmCategoryChangeSheet', () => {
  it('opens with all 18 production category groups collapsed and the unchanged action disabled', () => {
    renderSheet()

    expect(screen.getByRole('dialog', { name: 'Change category' })).toBeInTheDocument()
    expect(screen.getByText('Tax payment')).toBeInTheDocument()
    const groupButtons = screen.getAllByRole('button').filter((button) => button.hasAttribute('aria-expanded'))
    expect(groupButtons).toHaveLength(18)
    expect(groupButtons.every((button) => button.getAttribute('aria-expanded') === 'false')).toBe(true)
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'CHANGE CATEGORY' })).toBeDisabled()
  })

  it('keeps multiple groups expandable and renders their exact subcategory options', () => {
    renderSheet()

    fireEvent.click(screen.getByRole('button', { name: 'HOUSEHOLD 11 categories' }))
    fireEvent.click(screen.getByRole('button', { name: 'UTILITIES 5 categories' }))

    expect(screen.getByRole('radio', { name: 'HOME SERVICES' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'HOME (OTHER)' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'TV, PHONE & INTERNET' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'HOUSEHOLD 11 categories' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'UTILITIES 5 categories' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('searches across subcategories and confirms one connected category selection', () => {
    const { onClose, onConfirm } = renderSheet()

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search' }), { target: { value: 'mortgage' } })

    expect(screen.getByRole('button', { name: 'FINANCIAL 7 categories' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('radio', { name: 'MORTGAGE' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'HOUSEHOLD 11 categories' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('radio', { name: 'MORTGAGE' }))
    expect(screen.getByRole('button', { name: 'CHANGE CATEGORY' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'CHANGE CATEGORY' }))

    expect(onConfirm).toHaveBeenCalledWith({
      groupId: 'financial',
      groupLabel: 'FINANCIAL',
      category: 'Finance',
      subcategory: 'MORTGAGE',
    })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('discards draft selection when the sheet closes', () => {
    const { onClose, onConfirm } = renderSheet()

    fireEvent.click(screen.getByRole('button', { name: 'Close category sheet' }))

    expect(onClose).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
