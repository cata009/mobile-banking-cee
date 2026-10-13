// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DemoProvider, DEFAULT_DEMO_STATE } from '@/app/state/demoStore'
import MobileFirstAccount from '@/experiences/pi/it/mobile-first/MobileFirstAccount'
import MobileFirstAccountMovement from '@/experiences/pi/it/mobile-first/MobileFirstAccountMovement'

afterEach(cleanup)
const account = { name: 'Andrea Rossini', number: '000012345', balance: 53550.27 }
function setup(hidden = false, accounts = 3) {
  return render(
    <DemoProvider
      initialState={{
        product: 'PI',
        country: 'IT',
        designSystem: 'mobile-first',
        amountsHidden: hidden,
        productCounts: { ...DEFAULT_DEMO_STATE.productCounts, accounts },
      }}
    >
      <MobileFirstAccount account={account} onClose={() => {}} />
    </DemoProvider>,
  )
}

describe('Italy Conti reference flows', () => {
  it('defaults an odd-cent movement split to two allocations that preserve its amount', () => {
    const save = vi.fn()
    render(
      <DemoProvider initialState={{ product: 'PI', country: 'IT', designSystem: 'mobile-first' }}>
        <MobileFirstAccountMovement
          movement={{
            id: 'odd',
            name: 'Acquisto',
            category: 'Altre spese',
            amount: -10.01,
            date: '2025-02-28',
            icon: 'expenses',
          }}
          changes={{}}
          onSave={save}
          onClose={() => undefined}
        />
      </DemoProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Categoria Modifica' }))
    fireEvent.click(screen.getByRole('button', { name: 'Suddividi' }))
    expect(screen.getByLabelText('Importo 1')).toHaveValue(5)
    expect(screen.getByLabelText('Importo 2')).toHaveValue(5.01)
    fireEvent.click(screen.getByRole('button', { name: 'Salva' }))
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        splits: [
          { category: 'Altre spese', amount: '5.00' },
          { category: 'Casa', amount: '5.01' },
        ],
      }),
    )
  })
  it('labels the account selector balance consistently as available', () => {
    setup()
    fireEvent.click(screen.getByRole('tab', { name: 'Tutti i conti' }))
    const dialog = screen.getByRole('dialog', { name: 'Tutti i conti' })
    expect(within(dialog).getAllByText('Saldo disponibile').length).toBeGreaterThan(0)
    expect(within(dialog).queryByText('Saldo contabile')).not.toBeInTheDocument()
  })
  it('opens actual account settings and saves a name without changing its bank identifiers', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'Gestione conto' }))
    let dialog = screen.getByRole('dialog', { name: 'Gestione Conto' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Nome Conto Modifica' }))
    dialog = screen.getByRole('dialog', { name: 'Modifica nome del conto' })
    fireEvent.change(within(dialog).getByRole('textbox', { name: 'Nome Conto' }), {
      target: { value: 'Conto Famiglia' },
    })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salva modifica' }))
    dialog = screen.getByRole('dialog', { name: 'Gestione Conto' })
    expect(dialog).toHaveTextContent('Conto Famiglia')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Info Conto Visualizza' }))
    dialog = screen.getByRole('dialog', { name: 'Info conto' })
    expect(dialog).toHaveTextContent('IT02Q0200814703400103035954')
    expect(dialog).toHaveTextContent('Conto Famiglia')
    cleanup()
    setup()
    expect(screen.getByRole('heading', { name: 'Conto Famiglia' })).toBeVisible()
  })

  it('searches by tag and amount, and clears the applied filters', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'Cerca movimenti' }))
    fireEvent.click(screen.getByRole('button', { name: 'Filtri di ricerca' }))
    let dialog = screen.getByRole('dialog', { name: 'Filtri di ricerca' })
    fireEvent.change(within(dialog).getByRole('searchbox', { name: 'Ricerca per Tag' }), {
      target: { value: 'Tempo libero e viaggi' },
    })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Seleziona importo' }))
    fireEvent.change(within(dialog).getByRole('spinbutton', { name: 'Importo massimo' }), { target: { value: '10' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Applica' }))
    dialog = screen.getByRole('dialog', { name: 'Risultati di ricerca' })
    expect(within(dialog).getByText('Spotify')).toBeVisible()
    expect(within(dialog).queryByText('PayPal')).not.toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Filtri di ricerca' }))
    fireEvent.click(screen.getByRole('button', { name: 'Rimuovi Filtri' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('Accredito stipendio')).toBeVisible()
  })

  it('stores notes per movement and keeps the account ledger intact when excluding a movement', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: /Spotify Tempo libero e viaggi/ }))
    let dialog = screen.getByRole('dialog', { name: 'Altro' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Note Modifica' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Note' }), { target: { value: 'Abbonamento mensile' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salva' }))
    dialog = screen.getByRole('dialog', { name: 'Altro' })
    expect(dialog).toHaveTextContent('Abbonamento mensile')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Escludi movimento nel bilancio familiare Escludi' }))
    fireEvent.click(
      within(screen.getByRole('dialog', { name: 'Escludi Movimento' })).getByRole('button', { name: 'Escludi' }),
    )
    expect(screen.getByRole('dialog', { name: 'Altro' })).toHaveTextContent('Includi movimento nel bilancio familiare')
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Altro' })).getByRole('button', { name: 'Chiudi' }))
    expect(screen.getByRole('button', { name: /Spotify Tempo libero e viaggi/ })).toBeVisible()
  })

  it('shows the two-account alternative and three-account list according to holdings', () => {
    setup(false, 2)
    expect(screen.getByRole('tab', { name: 'Altro conto' })).toBeVisible()
    fireEvent.click(screen.getByRole('tab', { name: 'Altro conto' }))
    expect(screen.getByRole('heading', { name: 'Andrea Rossini e Flavia Bianchini' })).toBeVisible()
    cleanup()
    setup(false, 3)
    fireEvent.click(screen.getByRole('tab', { name: 'Tutti i conti' }))
    const dialog = screen.getByRole('dialog', { name: 'Tutti i conti' })
    expect(within(dialog).getByRole('heading', { name: 'Preferiti' })).toBeVisible()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Personalizza vista' }))
    fireEvent.click(screen.getByRole('button', { name: 'Sposta in alto Andrea Rossini e Flavia Bianchini' }))
    fireEvent.click(screen.getByRole('button', { name: 'Salva modifica' }))
    expect(within(screen.getByRole('region', { name: 'Preferiti' })).getAllByRole('button')[0]).toHaveAccessibleName(
      /Andrea Rossini e Flavia Bianchini/,
    )
  })

  it('masks sensitive values throughout account information and prevents copying hidden identifiers', () => {
    setup(true)
    fireEvent.click(screen.getByRole('button', { name: 'Condividi IBAN' }))
    const dialog = screen.getByRole('dialog', { name: 'Info conto' })
    expect(dialog).not.toHaveTextContent('IT02Q0200814703400103035954')
    expect(within(dialog).getByRole('button', { name: 'Copia IBAN' })).toBeDisabled()
    expect(within(dialog).getByRole('button', { name: 'Condividi info' })).toBeDisabled()
  })

  it('preserves a saved movement note when the account is closed and reopened', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: /Imposta di bollo Tasse e sanzioni/ }))
    fireEvent.click(
      within(screen.getByRole('dialog', { name: 'Altro' })).getByRole('button', { name: 'Note Modifica' }),
    )
    fireEvent.change(screen.getByRole('textbox', { name: 'Note' }), { target: { value: 'Nota salvata sul conto' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salva' }))
    cleanup()
    setup()
    fireEvent.click(screen.getByRole('button', { name: /Imposta di bollo Tasse e sanzioni/ }))
    expect(screen.getByRole('dialog', { name: 'Altro' })).toHaveTextContent('Nota salvata sul conto')
  })
  it('returns from a movement to the same search results and filters', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'Cerca movimenti' }))
    fireEvent.click(screen.getByRole('button', { name: 'Filtri di ricerca' }))
    fireEvent.change(screen.getByRole('searchbox', { name: 'Ricerca per Tag' }), { target: { value: 'Spotify' } })
    fireEvent.click(screen.getByRole('button', { name: 'Applica' }))
    fireEvent.click(
      within(screen.getByRole('dialog', { name: 'Risultati di ricerca' })).getByRole('button', { name: /Spotify/ }),
    )
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Altro' })).getByRole('button', { name: 'Chiudi' }))
    expect(screen.getByRole('dialog', { name: 'Risultati di ricerca' })).toHaveTextContent('Tag Spotify')
  })
  it('does not reactivate BANCOMAT Pay when choosing the preferred account', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'Gestione conto' }))
    fireEvent.click(screen.getByRole('button', { name: 'BANCOMAT® Pay Gestisci' }))
    fireEvent.click(screen.getByRole('button', { name: 'Sospendi Gestisci' }))
    fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
    fireEvent.click(screen.getByRole('button', { name: 'Seleziona come conto preferito Gestisci' }))
    fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
    expect(screen.getByRole('button', { name: 'Riattiva Gestisci' })).toBeVisible()
  })
  it('keeps ISEE requests independent of Opzione TOP', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'Gestione conto' }))
    fireEvent.click(screen.getByRole('button', { name: 'Attestazione ISEE Richiedi' }))
    fireEvent.click(screen.getByRole('button', { name: 'Richiedi attestazione' }))
    fireEvent.click(
      within(screen.getByRole('dialog', { name: 'Attestazione ISEE' })).getByRole('button', { name: 'Chiudi' }),
    )
    expect(screen.getByRole('button', { name: 'Opzione TOP Visualizza' })).toHaveTextContent('Attiva')
  })
  it('rejects invalid BANCOMAT limits and discards unsaved edits', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'Gestione conto' }))
    fireEvent.click(screen.getByRole('button', { name: 'BANCOMAT® Pay Gestisci' }))
    fireEvent.click(screen.getByRole('button', { name: 'Limiti di utilizzo invia denaro Gestisci' }))
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Limite giornaliero' }), { target: { value: '-1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salva' }))
    expect(screen.getByRole('alert')).toBeVisible()
    fireEvent.click(
      within(screen.getByRole('dialog', { name: 'Limiti di utilizzo invia denaro' })).getByRole('button', {
        name: 'Chiudi',
      }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Limiti di utilizzo invia denaro Gestisci' }))
    expect(screen.getByRole('spinbutton', { name: 'Limite giornaliero' })).toHaveValue(500)
  })
  it('keeps hidden movement amounts out of split inputs', () => {
    setup(true)
    fireEvent.click(screen.getByRole('button', { name: /Imposta di bollo Tasse e sanzioni/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Categoria Modifica' }))
    fireEvent.click(screen.getByRole('button', { name: 'Suddividi' }))
    const dialog = screen.getByRole('dialog', { name: 'Suddividi movimento' })
    expect(within(dialog).getByRole('textbox', { name: 'Importo 1' })).toHaveValue('')
    expect(within(dialog).getByRole('textbox', { name: 'Importo 2' })).toHaveValue('')
    expect(within(dialog).getByRole('button', { name: 'Salva' })).toBeDisabled()
  })
  it('requires explicit consent when importing an account', () => {
    setup()
    fireEvent.click(screen.getByRole('tab', { name: 'Tutti i conti' }))
    fireEvent.click(screen.getByRole('button', { name: 'Importa conto' }))
    fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
    fireEvent.click(screen.getByRole('button', { name: 'Visualizza il documento in PDF' }))
    const document = screen.queryByRole('dialog', { name: 'Integrazione contrattuale' })
    if (document) fireEvent.click(within(document).getByRole('button', { name: 'Chiudi' }))
    fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
    expect(screen.getByRole('button', { name: 'Firma' })).toBeDisabled()
    fireEvent.click(screen.getByRole('checkbox'))
    expect(screen.getByRole('button', { name: 'Firma' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Firma' }))
    expect(screen.getByRole('dialog', { name: 'Fatto! Operazione completata con successo' })).toBeVisible()
  })
})
