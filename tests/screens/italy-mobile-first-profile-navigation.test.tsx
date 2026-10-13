// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { DemoProvider } from '@/app/state/demoStore'
import MobileFirstHome from '@/experiences/pi/it/mobile-first/MobileFirstHome'

afterEach(cleanup)

function renderHome() {
  return render(
    <DemoProvider initialState={{ product: 'PI', country: 'IT', designSystem: 'mobile-first' }}>
      <MobileFirstHome />
    </DemoProvider>,
  )
}

describe('Italy shared profile navigation', () => {
  it('opens the homepage profile hub from an account avatar and preserves the originating detail', () => {
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: 'Apri conto Andrea Rossini' }))
    const original = screen.getByRole('main', { name: 'Dettaglio conto' })
    fireEvent.click(screen.getByRole('button', { name: 'Profilo' }))
    expect(screen.getByRole('main', { name: 'Profilo' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Impostazioni' })).toBeVisible()
    expect(original).not.toBeVisible()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.getByRole('main', { name: 'Dettaglio conto' })).toBe(original)
    expect(original).toBeVisible()
  })

  it.each([
    ['Carte', 'Apri carta UniCredit Flexia Classic', 'Dettaglio carta'],
    ['Mutui e Prestiti', 'Apri Mutuo Casa Milano', 'Mutui e Prestiti'],
    ['Polizze assicurative', 'Apri polizza My Care Famiglia', 'Polizza assicurativa'],
  ])('opens the same profile from %s and keeps its detail mounted', (category, openLabel, detailLabel) => {
    renderHome()
    fireEvent.click(screen.getByRole('tab', { name: category }))
    fireEvent.click(screen.getByRole('button', { name: openLabel }))
    const original = screen.getByRole('main', { name: detailLabel })
    fireEvent.click(screen.getByRole('button', { name: 'Profilo' }))
    expect(screen.getByRole('main', { name: 'Profilo' })).toBeVisible()
    expect(original).not.toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Chiudi profilo' }))
    expect(screen.getByRole('main', { name: detailLabel })).toBe(original)
  })

  it('keeps the homepage instance and investment selection when closing its profile', () => {
    renderHome()
    fireEvent.click(screen.getByRole('tab', { name: 'Investimenti' }))
    const original = screen.getByRole('region', { name: 'Homepage Mobile First' })
    fireEvent.click(screen.getByRole('button', { name: 'Profilo' }))
    expect(screen.getByRole('main', { name: 'Profilo' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Chiudi profilo' }))
    expect(screen.getByRole('region', { name: 'Homepage Mobile First' })).toBe(original)
    expect(screen.getByRole('tab', { name: 'Investimenti' })).toHaveAttribute('aria-selected', 'true')
  })

  it('opens the same hub from PFM and returns to the same report instance', () => {
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: 'Bilancio' }))
    const original = screen.getByRole('main')
    fireEvent.click(screen.getByRole('button', { name: 'Profilo' }))
    expect(screen.getByRole('main', { name: 'Profilo' })).toBeVisible()
    expect(original).not.toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Chiudi profilo' }))
    expect(screen.getByRole('main')).toBe(original)
  })

  it('returns from profile to a search-opened policy before returning to the saved search', () => {
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: 'Cerca' }))
    fireEvent.change(screen.getByRole('searchbox', { name: 'Come posso aiutarti?' }), {
      target: { value: 'my care famiglia' },
    })
    fireEvent.click(screen.getByRole('button', { name: /My Care Famiglia.*Polizza 20/ }))
    const original = screen.getByRole('main', { name: 'Polizza assicurativa' })
    fireEvent.click(screen.getByRole('button', { name: 'Profilo' }))
    fireEvent.click(screen.getByRole('button', { name: 'Chiudi profilo' }))
    expect(screen.getByRole('main', { name: 'Polizza assicurativa' })).toBe(original)
    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
    expect(screen.getByRole('searchbox', { name: 'Come posso aiutarti?' })).toHaveValue('my care famiglia')
  })

  it('dismisses the insurance help modal before opening profile support', () => {
    const { container } = renderHome()
    fireEvent.click(screen.getByRole('tab', { name: 'Polizze assicurative' }))
    fireEvent.click(screen.getByRole('button', { name: 'Apri polizza My Care Famiglia' }))
    fireEvent.click(screen.getByRole('button', { name: 'Aiuto' }))
    fireEvent.click(screen.getByRole('button', { name: 'Avvia Chat' }))
    expect(container.querySelector('[hidden] [role="dialog"][aria-modal="true"]')).toBeNull()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.getByRole('main', { name: 'Profilo' })).toBeVisible()
  })
})
