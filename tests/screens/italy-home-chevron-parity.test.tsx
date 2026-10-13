// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DemoProvider } from '@/app/state/demoStore'
import MobileFirstHome from '@/experiences/pi/it/mobile-first/MobileFirstHome'
import MobileFirstCategoryPanel from '@/experiences/pi/it/mobile-first/MobileFirstCategoryPanel'
import accountChevron from '@/assets/mobile-first/it/account-chevron.svg'

beforeEach(() => localStorage.clear())
afterEach(cleanup)
const wrapper = (children: React.ReactNode) => (
  <DemoProvider initialState={{ product: 'PI', country: 'IT', designSystem: 'mobile-first' }}>{children}</DemoProvider>
)

describe('Home product navigation uses the original Conti chevron', () => {
  it.each(['Mutui e Prestiti', 'Polizze assicurative'])(
    'keeps canonical artwork and explicit 12x22 geometry for actual %s cards',
    (category) => {
      const { container } = render(wrapper(<MobileFirstHome />))
      expect(container.querySelector('.mf-account-chevron img')).toHaveAttribute('src', accountChevron)
      fireEvent.click(screen.getByRole('tab', { name: category }))
      const selector = category === 'Mutui e Prestiti' ? '.mf-product-credit-card' : '.mf-product-policy-card'
      const cards = container.querySelectorAll(selector)
      expect(cards.length).toBeGreaterThan(0)
      for (const card of cards) {
        const glyph = card.querySelector('.mf-product-chevron img')
        expect(glyph).toHaveAttribute('src', accountChevron)
        expect(glyph).toHaveAttribute('width', '12')
        expect(glyph).toHaveAttribute('height', '22')
        expect(glyph?.parentElement).toHaveAttribute('aria-hidden', 'true')
      }
    },
  )

  it('fallback credit cards preserve destination identity while reusing Conti artwork', () => {
    const open = vi.fn()
    const { container } = render(
      wrapper(<MobileFirstCategoryPanel category="Mutui e Prestiti" onOpen={vi.fn()} onOpenLoans={open} />),
    )
    const card = screen.getByRole('button', { name: 'Apri Mutuo Casa Milano' })
    expect(card.querySelector('.mf-product-chevron img')).toHaveAttribute('src', accountChevron)
    fireEvent.click(card)
    expect(open).toHaveBeenCalledWith('mortgage-milano', 'detail')
    expect(container.querySelectorAll('.mf-product-chevron')).toHaveLength(2)
  })
})
