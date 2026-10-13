// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useState } from 'react'
import { getItalyFinancialSnapshot, resetItalyFinancialState } from '@/features/finance/italyFinancials'
import { resetPfmBudget } from '@/features/analytics/mobileFirstPfmState'
import { getItalyPfmFinancialInput } from '@/experiences/pi/it/mobile-first/pfmFinancialContent'
import { selectPfmSummary } from '@/features/analytics/mobileFirstPfm'
import { DEFAULT_PRODUCT_COUNTS, DemoProvider } from '@/app/state/demoStore'
import MobileFirstPfm from '@/experiences/pi/it/mobile-first/MobileFirstPfm'

afterEach(cleanup)
beforeEach(() => {
  resetItalyFinancialState()
  resetPfmBudget()
})
function Preview({ hidden = false }: { hidden?: boolean }) {
  const [open, setOpen] = useState(true)
  return (
    <DemoProvider initialState={{ product: 'PI', country: 'IT', designSystem: 'mobile-first', amountsHidden: hidden }}>
      {open ? <MobileFirstPfm onClose={() => setOpen(false)} /> : <h1>Home</h1>}
    </DemoProvider>
  )
}
describe('Italy Mobile First PFM', () => {
  it('switches income and expense views and returns to Home', () => {
    render(<Preview />)
    expect(screen.getByRole('img', { name: /Spese totali/ })).toBeVisible()
    fireEvent.click(screen.getByRole('tab', { name: 'Entrate' }))
    expect(screen.getByRole('heading', { name: 'Entrate' })).toBeVisible()
    expect(screen.getAllByText('Accredito stipendio')[0]).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
    expect(screen.getByRole('heading', { name: 'Home' })).toBeVisible()
  })
  it('opens category details and preserves the selected period on return', () => {
    render(<Preview />)
    fireEvent.click(screen.getByRole('button', { name: '3M' }))
    fireEvent.click(screen.getByRole('button', { name: /^Utenze/ }))
    expect(screen.getByRole('heading', { name: 'Utenze' })).toBeVisible()
    expect(screen.getAllByText('Edison energia')[0]).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Chiudi' }))
    expect(screen.getByRole('button', { name: '3M' })).toHaveAttribute('aria-pressed', 'true')
  })
  it('filters movements and shows an empty result when nothing matches', () => {
    render(<Preview />)
    fireEvent.click(screen.getByRole('button', { name: 'Cerca' }))
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Spotify' } })
    fireEvent.click(screen.getByRole('button', { name: 'Applica' }))
    // Three separate purchases exist: account/debit, Etica credit and Genius prepaid.
    expect(screen.getAllByRole('button', { name: /^Spotify/ })).toHaveLength(3)
    expect(screen.getAllByRole('button', { name: /^Spotify/ })[0]).toBeVisible()
    expect(screen.queryByText('Edison energia')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Chiudi' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cerca' }))
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'missing merchant' } })
    fireEvent.click(screen.getByRole('button', { name: 'Applica' }))
    expect(screen.getByText(/Non ci sono risultati/)).toBeVisible()
  })
  it('saves the edited budget and rejects invalid amounts', () => {
    render(<Preview />)
    fireEvent.click(screen.getByRole('tab', { name: /^Budget$/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Modifica il budget' }))
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Budget totale' }), { target: { value: '-1' } })
    expect(screen.getByRole('button', { name: 'Salva' })).toBeDisabled()
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Budget totale' }), { target: { value: '1000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salva' }))
    const snapshot = getItalyFinancialSnapshot()
    const summary = selectPfmSummary(snapshot, getItalyPfmFinancialInput(snapshot, DEFAULT_PRODUCT_COUNTS))
    expect(screen.getByRole('img', { name: /Budget rimanente/ })).toHaveAccessibleName(
      `Budget rimanente: ${1000 - summary.spendCents / 100} €`,
    )
  })
  it('requires a selected relationship and updates the overview after confirmation', () => {
    render(<Preview />)
    fireEvent.click(screen.getByRole('button', { name: 'Impostazioni' }))
    const settings = screen.getByRole('main', { name: 'Impostazioni generali' })
    const boxes = within(settings).getAllByRole('checkbox')
    for (const box of boxes) if ((box as HTMLInputElement).checked) fireEvent.click(box)
    expect(screen.getByRole('button', { name: 'Conferma' })).toBeDisabled()
    fireEvent.click(boxes[boxes.length - 1]!)
    fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
    expect(screen.getByText('1 Carta')).toBeVisible()
  })
  it('opens Report and Patrimonio without losing the PFM navigation', () => {
    render(<Preview />)
    fireEvent.click(screen.getByRole('button', { name: 'Report' }))
    expect(screen.getByRole('heading', { name: /^Report$/ })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Chiudi' }))
    fireEvent.click(screen.getByRole('tab', { name: 'Patrimonio' }))
    expect(screen.getByRole('tab', { name: 'Risorse finanziarie' })).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(screen.getByRole('tab', { name: 'Impegni finanziari' }))
    expect(screen.getByText('Mutuo e prestito')).toBeVisible()
  })
  it('hides monetary values on every PFM surface when privacy is enabled', () => {
    const { container } = render(<Preview hidden />)
    expect(container).not.toHaveTextContent('380,00')
    fireEvent.click(screen.getByRole('tab', { name: 'Entrate' }))
    expect(container).not.toHaveTextContent('900,00')
    expect(container).toHaveTextContent('••••')
  })
  it('adds a category budget and preserves its saved amount', () => {
    render(<Preview />)
    fireEvent.click(screen.getByRole('tab', { name: /^Budget$/ }))
    fireEvent.click(screen.getByRole('button', { name: 'AGGIUNGI BUDGET CATEGORIA' }))
    fireEvent.click(screen.getByRole('button', { name: 'Trasporti' }))
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Seleziona importo massimo' }), {
      target: { value: '200' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Salva' }))
    expect(screen.getByRole('heading', { name: 'Trasporti' })).toBeVisible()
    const category = screen.getByRole('heading', { name: 'Trasporti' }).parentElement!
    expect(within(category).getByText('Budget').parentElement).toHaveTextContent('200')
  })
  it('adds a financial commitment through the validated form', () => {
    render(<Preview />)
    fireEvent.click(screen.getByRole('tab', { name: 'Patrimonio' }))
    fireEvent.click(screen.getByRole('button', { name: 'Aggiungi risorsa/impegno' }))
    fireEvent.click(screen.getByRole('radio', { name: 'Impegno' }))
    fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
    expect(screen.getByRole('button', { name: 'Salva' })).toBeDisabled()
    fireEvent.change(screen.getByRole('textbox', { name: 'Titolo/Modello*' }), { target: { value: 'Auto' } })
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Valore*' }), { target: { value: '25000' } })
    fireEvent.change(screen.getByLabelText('Data di riferimento*'), { target: { value: '2025-03-14' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salva' }))
    expect(screen.getByRole('tab', { name: 'Impegni finanziari' })).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(screen.getByRole('button', { name: /^Mezzi di trasporto/ }))
    expect(screen.getByText('Auto')).toBeVisible()
    expect(screen.getByText('14/03/2025')).toBeVisible()
  })
  it('shows the selected budget month after applying the calendar', () => {
    render(<Preview />)
    fireEvent.click(screen.getByRole('tab', { name: /^Budget$/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Seleziona mese' }))
    fireEvent.change(screen.getByLabelText('Mese e anno'), { target: { value: '2025-10' } })
    fireEvent.click(screen.getByRole('button', { name: 'Applica' }))
    expect(screen.getByText('Ottobre 2025')).toBeVisible()
  })
  it('saves a changed subcategory and displays it on the movement', () => {
    render(<Preview />)
    fireEvent.click(screen.getByRole('button', { name: /^Utenze/ }))
    fireEvent.click(screen.getAllByRole('button', { name: /^Edison energia/ })[0]!)
    fireEvent.change(screen.getByRole('combobox', { name: 'Sottocategoria' }), { target: { value: 'Altro' } })
    expect(screen.getByRole('button', { name: 'Salva' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Salva' }))
    expect(screen.getAllByRole('button', { name: /^Edison energia/ })[0]).toHaveTextContent('Altro')
  })
  it('updates live categories, budget and exclusions when account annotations change', () => {
    render(<Preview />)
    const original = getItalyFinancialSnapshot()
    const spotify = original.events.find(
      (event) => event.name === 'Spotify' && event.accountNumbers.includes('000012345'),
    )!
    fireEvent.click(screen.getByRole('button', { name: /^Tempo libero e viaggi/ }))
    fireEvent.click(screen.getAllByRole('button', { name: /^Spotify/ })[0]!)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Escludi da bilancio, budget e report' }))
    fireEvent.click(screen.getByRole('button', { name: 'Salva' }))
    expect(getItalyFinancialSnapshot().events.find((event) => event.id === spotify.id)?.excluded).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Chiudi' }))
    fireEvent.click(screen.getByRole('button', { name: 'Impostazioni' }))
    fireEvent.click(screen.getByRole('tab', { name: 'Movimenti esclusi' }))
    expect(screen.getByText('Spotify')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Includi' }))
    expect(getItalyFinancialSnapshot().events.find((event) => event.id === spotify.id)?.excluded).toBe(false)
    expect(screen.getByText('Nessun movimento escluso.')).toBeVisible()
  })
  it('filters actual report rows and charts when a date period changes', () => {
    render(<Preview />)
    fireEvent.click(screen.getByRole('button', { name: 'Report' }))
    fireEvent.click(screen.getByRole('button', { name: 'Seleziona periodo' }))
    fireEvent.change(screen.getByLabelText('Da'), { target: { value: '2024-01-01' } })
    fireEvent.change(screen.getByLabelText('A'), { target: { value: '2024-12-31' } })
    fireEvent.click(screen.getByRole('button', { name: 'Applica' }))
    expect(screen.getByRole('img', { name: 'Spese totali: 0,00 €' })).toBeVisible()
    expect(screen.queryByText('Edison energia')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Mese' }))
    expect(screen.getByRole('img', { name: /Spese totali:/ })).not.toHaveAccessibleName('Spese totali: 0,00 €')
  })
  it('shows zero actual spending for an empty selected budget month', () => {
    render(<Preview />)
    fireEvent.click(screen.getByRole('tab', { name: /^Budget$/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Seleziona mese' }))
    fireEvent.change(screen.getByLabelText('Mese e anno'), { target: { value: '2024-01' } })
    fireEvent.click(screen.getByRole('button', { name: 'Applica' }))
    expect(screen.getByRole('img', { name: /Budget rimanente/ })).toHaveAccessibleName('Budget rimanente: 760 €')
  })
})
