// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { useState } from 'react'
import { ITALY_CARDS, type ItalyCardsSnapshot } from '@/experiences/pi/it/mobile-first/cardsContent'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  resetItalyFinancialState,
  getItalyFinancialSnapshot,
  selectAccountBalance,
  selectCardBalance,
} from '@/features/finance/italyFinancials'
import { DemoProvider } from '@/app/state/demoStore'
import MobileFirstCards from '@/experiences/pi/it/mobile-first/MobileFirstCards'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})
beforeEach(resetItalyFinancialState)
function show(view: 'hub' | 'detail' | 'pin' = 'detail', amountsHidden = false, initialCardId = 'flexia') {
  return render(
    <DemoProvider initialState={{ product: 'PI', country: 'IT', designSystem: 'mobile-first', amountsHidden }}>
      <MobileFirstCards initialView={view} initialCardId={initialCardId} onClose={() => undefined} />
    </DemoProvider>,
  )
}
function click(name: string) {
  fireEvent.click(screen.getByRole('button', { name }))
}
describe('PI Italy cards journey', () => {
  it('opens a card from the hub and returns to the same hub', () => {
    show('hub')
    fireEvent.click(
      within(screen.getByRole('region', { name: 'Preferite' })).getByRole('button', {
        name: 'Apri carta UniCredit Flexia Classic',
      }),
    )
    expect(screen.getByRole('heading', { name: 'Movimenti' })).toBeInTheDocument()
    click('Indietro')
    expect(screen.getByRole('heading', { name: 'Carte' })).toBeInTheDocument()
  })
  it('requires Mobile Code before revealing the PIN and hides it after timeout', () => {
    vi.useFakeTimers()
    show('pin')
    expect(screen.queryByText('12345')).not.toBeInTheDocument()
    click('Mostra PIN')
    fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '12345' } })
    click('Conferma')
    expect(screen.getByText('12345')).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(15000))
    expect(screen.queryByText('12345')).not.toBeInTheDocument()
  })
  it('edits the card name and preserves it when returning to details', () => {
    show()
    click('Gestione Carta')
    click('Modifica nome carta')
    fireEvent.change(screen.getByLabelText('Nome carta'), { target: { value: 'Viaggi' } })
    click('Salva')
    expect(screen.getByText('Viaggi')).toBeInTheDocument()
    click('Indietro')
    expect(screen.getByRole('heading', { name: 'Viaggi' })).toBeInTheDocument()
  })
  it('suspends and resumes the selected card without affecting another card', () => {
    show()
    click('Problemi Carta')
    fireEvent.click(screen.getByLabelText('Voglio sospendere temporaneamente la carta'))
    click('Conferma')
    click('Sospendi carta')
    expect(screen.getByText('Carta sospesa')).toBeInTheDocument()
    click('Torna alla carta')
    click('Riattiva carta')
    click('Conferma riattivazione')
    expect(screen.queryByText('Carta sospesa')).not.toBeInTheDocument()
  })
  it('applies movement filters and can remove them', () => {
    show()
    click('Cerca movimenti')
    click('Filtri di ricerca')
    fireEvent.change(screen.getByLabelText('Ricerca per Tag'), { target: { value: 'Netflix' } })
    click('Applica')
    expect(screen.queryByText('Edison energia')).not.toBeInTheDocument()
    expect(screen.getAllByText('Netflix')).toHaveLength(2)
    click('Rimuovi filtri')
    expect(screen.getAllByText('Edison energia').length).toBeGreaterThan(0)
  })
  it('saves notes and exclusion on a settled movement', () => {
    show()
    click('Movimento PayPal 27 Febbraio')
    click('Modifica note')
    fireEvent.change(screen.getByRole('textbox', { name: 'Note' }), { target: { value: 'Vacanza' } })
    click('Salva')
    expect(screen.getByText('Vacanza')).toBeInTheDocument()
    click('Escludi movimento')
    click('Conferma esclusione')
    expect(screen.getByText('Movimento escluso dal bilancio familiare')).toBeInTheDocument()
  })
  it('keeps PIN and CVV out of ordinary details and masks all amounts in privacy mode', () => {
    const { container } = show('detail', true)
    expect(container).not.toHaveTextContent('6.534')
    expect(container).not.toHaveTextContent('10.000')
    expect(container).not.toHaveTextContent('5678')
    expect(container).not.toHaveTextContent('12345')
  })
  it('enforces installment minimum and confirms a selected plan', () => {
    show()
    click('Paga a rate')
    click('Continua')
    expect(screen.getByRole('button', { name: 'Continua' })).toBeDisabled()
    screen.getAllByRole('checkbox').forEach((checkbox) => fireEvent.click(checkbox))
    click('Continua')
    expect(screen.getByRole('heading', { name: 'Il tuo piano rateale' })).toBeInTheDocument()
    click('Continua')
    fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '12345' } })
    click('Conferma')
    expect(screen.getByText('Piano rateale attivato')).toBeInTheDocument()
  })
  it('shows debit actions without credit-only installments or plafond', () => {
    show('detail', false, 'my-one')
    expect(screen.queryByRole('button', { name: 'Paga a rate' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Modifica Plafond' })).not.toBeInTheDocument()
  })
  it('does not reveal card number until authorization succeeds', () => {
    show()
    click('Gestione Carta')
    click('Visualizza numero carta e CVV')
    click('Prosegui')
    fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '12' } })
    expect(screen.getByRole('button', { name: 'Conferma' })).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '12345' } })
    click('Conferma')
    expect(screen.getByText('1234 5678 9012 5678')).toBeInTheDocument()
    click('Chiudi dati carta')
    expect(screen.queryByText('1234 5678 9012 5678')).not.toBeInTheDocument()
  })
  it('reorders favorite cards and retains the selected order after save', () => {
    show('hub')
    click('Personalizza')
    click('Sposta UniCredit Flexia Classic in alto')
    click('Salva modifica')
    const favorites = screen.getByRole('region', { name: 'Preferite' })
    expect(within(favorites).getAllByRole('button', { name: /Apri carta/ })[0]).toHaveAccessibleName(
      'Apri carta UniCredit Flexia Classic',
    )
  })
  it('retains geographic settings when reopening the editor', () => {
    show()
    click('Gestione Carta')
    click('MODIFICA Aree geografiche')
    fireEvent.click(screen.getByLabelText('Europa'))
    click('Conferma')
    click('Torna alla carta')
    click('Gestione Carta')
    click('MODIFICA Aree geografiche')
    expect(screen.getByLabelText('Europa')).toBeChecked()
  })
  it('does not reuse repayment settings on another credit card', () => {
    show()
    click('Gestione Carta')
    click('CAMBIA Modalità di rimborso')
    fireEvent.click(screen.getByLabelText('A revolving'))
    click('Conferma')
    fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '12345' } })
    click('Conferma')
    click('Torna alla carta')
    click('TUTTE LE CARTE')
    fireEvent.click(
      within(screen.getByRole('region', { name: 'Operative' })).getByRole('button', {
        name: 'Apri carta UniCredit Flexia Etica',
      }),
    )
    click('Gestione Carta')
    expect(screen.getByText('A saldo')).toBeInTheDocument()
  })
  it('does not expose credit installments for a debit movement', () => {
    show('detail', false, 'my-one')
    click('Movimento PayPal 27 Febbraio')
    expect(screen.queryByRole('button', { name: 'Paga a rate' })).not.toBeInTheDocument()
  })
  it('shows an authorized new limit in card information', () => {
    show()
    click('Modifica Plafond')
    fireEvent.change(screen.getByLabelText('Limite utilizzo mensile'), { target: { value: '4000' } })
    click('Prosegui')
    click('Firma')
    fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '12345' } })
    click('Conferma')
    click('Torna alla carta')
    click('Gestione Carta')
    click('VISUALIZZA Info carta')
    expect(screen.getByText('4.000')).toBeInTheDocument()
  })
  it('restores the card state after returning to Home and reopening cards', () => {
    function Host() {
      const [open, setOpen] = useState(true)
      const [snapshot, setSnapshot] = useState<ItalyCardsSnapshot>()
      return open ? (
        <MobileFirstCards
          initialView="detail"
          initialCardId="flexia"
          initialSnapshot={snapshot}
          onSnapshot={setSnapshot}
          onClose={() => setOpen(false)}
        />
      ) : (
        <button onClick={() => setOpen(true)}>Apri Carte</button>
      )
    }
    render(
      <DemoProvider initialState={{ product: 'PI', country: 'IT', designSystem: 'mobile-first' }}>
        <Host />
      </DemoProvider>,
    )
    click('Gestione Carta')
    click('Modifica nome carta')
    fireEvent.change(screen.getByLabelText('Nome carta'), { target: { value: 'Viaggi' } })
    click('Salva')
    click('Indietro')
    click('Indietro')
    click('Apri Carte')
    expect(screen.getByRole('heading', { name: 'Viaggi' })).toBeInTheDocument()
  })
  it('returns to the selection step when Escape is pressed during installments', () => {
    show()
    click('Paga a rate')
    click('Continua')
    screen.getAllByRole('checkbox').forEach((checkbox) => fireEvent.click(checkbox))
    click('Continua')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.getByRole('heading', { name: 'Scegli i movimenti da rateizzare' })).toBeInTheDocument()
  })
  it('supports the existing demo biometric authentication animation before disclosure', async () => {
    vi.useFakeTimers()
    show('pin')
    click('Mostra PIN')
    click('Face ID')
    expect(screen.queryByText('12345')).not.toBeInTheDocument()
    await act(async () => vi.advanceTimersByTimeAsync(2000))
    expect(screen.getByText('12345')).toBeInTheDocument()
  })
  it('opens the shared operations directly and keeps details mounted while its overlay is open', () => {
    function Host() {
      const [open, setOpen] = useState(false)
      const [closed, setClosed] = useState(false)
      return (
        <>
          {closed ? (
            <p>Home</p>
          ) : (
            <MobileFirstCards
              initialView="detail"
              onClose={() => setClosed(true)}
              onOperations={() => setOpen(true)}
              externalOverlayOpen={open}
            />
          )}{' '}
          {open && (
            <section role="dialog" aria-label="Operazioni comuni">
              <button onClick={() => setOpen(false)}>Chiudi operazioni</button>
            </section>
          )}
        </>
      )
    }
    render(
      <DemoProvider initialState={{ product: 'PI', country: 'IT', designSystem: 'mobile-first' }}>
        <Host />
      </DemoProvider>,
    )
    click('Operazioni')
    expect(screen.getByRole('dialog', { name: 'Operazioni comuni' })).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    click('Chiudi operazioni')
    expect(screen.getByRole('heading', { name: 'Movimenti' })).toBeInTheDocument()
    expect(screen.queryByText('Home')).not.toBeInTheDocument()
  })
  it('preserves the legal holder identity when the card nickname changes', () => {
    show()
    click('Gestione Carta')
    click('Modifica nome carta')
    fireEvent.change(screen.getByLabelText('Nome carta'), { target: { value: 'Viaggi' } })
    click('Salva')
    click('VISUALIZZA Info carta')
    expect(screen.getByText('Intestato a').textContent).toContain('Andrea Rossini')
    expect(screen.getByText('Nome carta').textContent).toContain('Viaggi')
  })
  it('does not offer suspension for a permanently blocked card', () => {
    show('detail', false, 'blocked')
    click('Problemi Carta')
    expect(screen.queryByLabelText('Voglio sospendere temporaneamente la carta')).not.toBeInTheDocument()
  })
  it('retains both categories of a split movement', () => {
    show()
    click('Movimento PayPal 27 Febbraio')
    click('Suddividi movimento')
    fireEvent.change(screen.getByLabelText('Categoria'), { target: { value: 'Shopping' } })
    fireEvent.change(screen.getByLabelText('Categoria 2'), { target: { value: 'Viaggi' } })
    fireEvent.change(screen.getByLabelText('Importo categoria 1'), { target: { value: '30' } })
    click('Salva')
    expect(screen.getByText('Viaggi')).toBeInTheDocument()
    expect(screen.getAllByText('Shopping').length).toBeGreaterThan(0)
  })
  it('updates the prepaid available balance after a recharge', () => {
    const before = getItalyFinancialSnapshot()
    const accountBefore = selectAccountBalance(before, '000012345').availableCents
    const cardBefore = selectCardBalance(before, 'genius').availableCents
    show('detail', false, 'genius')
    click('Ricarica Carta')
    fireEvent.change(screen.getByLabelText('Importo ricarica'), { target: { value: '100' } })
    click('Conferma')
    fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '12345' } })
    click('Conferma')
    click('Torna alla carta')
    const after = getItalyFinancialSnapshot()
    expect(selectAccountBalance(after, '000012345').availableCents).toBe(accountBefore - 10000)
    expect(selectCardBalance(after, 'genius').availableCents).toBe(cardBefore + 10000)
    expect(
      screen.getByText(
        new Intl.NumberFormat('it-IT', { useGrouping: 'always' }).format((cardBefore + 10000) / 100).split(',')[0]!,
      ),
    ).toBeInTheDocument()
  })
  it('repays the same debt displayed throughout the journey and retains cents after remount', () => {
    const before = getItalyFinancialSnapshot()
    const debtBefore = selectCardBalance(before, 'flexia').debtCents
    const accountBefore = selectAccountBalance(before, '000012345').availableCents
    show()
    click('Gestione Carta')
    click('RIMBORSA Debito residuo')
    const debtText = new Intl.NumberFormat('it-IT', { useGrouping: 'always', minimumFractionDigits: 2 }).format(
      debtBefore / 100,
    )
    expect(screen.getByText('Debito residuo totale').closest('.mfc-row')).toHaveTextContent(`${debtText} €`)
    fireEvent.change(screen.getByLabelText('Importo rimborso'), { target: { value: '123.45' } })
    click('Conferma')
    fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '12345' } })
    click('Conferma')
    expect(selectCardBalance(getItalyFinancialSnapshot(), 'flexia').debtCents).toBe(debtBefore - 12345)
    expect(selectAccountBalance(getItalyFinancialSnapshot(), '000012345').availableCents).toBe(accountBefore - 12345)
    cleanup()
    show()
    click('Gestione Carta')
    click('RIMBORSA Debito residuo')
    const remaining = new Intl.NumberFormat('it-IT', { useGrouping: 'always', minimumFractionDigits: 2 }).format(
      (debtBefore - 12345) / 100,
    )
    expect(screen.getByText('Debito residuo totale').closest('.mfc-row')).toHaveTextContent(`${remaining} €`)
  })
  it('replaces stale snapshot amounts and transaction fixtures with current ledger values', () => {
    const snapshot: ItalyCardsSnapshot = {
      cards: ITALY_CARDS.map((card) => ({ ...card, spending: 9999, limit: 9999, available: 9999, debt: 9999 })),
      movements: {
        flexia: [
          {
            id: 'salary',
            name: 'Duplicated salary',
            category: 'Entrate',
            amount: 9999,
            date: '2025-02-28',
            day: 'Oggi',
            icon: 'income',
            status: 'settled',
          },
        ],
      },
    }
    render(
      <DemoProvider initialState={{ product: 'PI', country: 'IT', designSystem: 'mobile-first' }}>
        <MobileFirstCards
          initialView="detail"
          initialCardId="flexia"
          initialSnapshot={snapshot}
          onClose={() => undefined}
        />
      </DemoProvider>,
    )
    expect(screen.queryByText('Duplicated salary')).not.toBeInTheDocument()
    expect(screen.queryByText('9.999')).not.toBeInTheDocument()
    expect(screen.getAllByText('PayPal')).toHaveLength(2)
  })
  it('allows clearing all geographic preferences', () => {
    show()
    click('Gestione Carta')
    click('MODIFICA Aree geografiche')
    fireEvent.click(screen.getByLabelText('Europa'))
    click('Conferma')
    click('Torna alla carta')
    click('Gestione Carta')
    click('MODIFICA Aree geografiche')
    fireEvent.click(screen.getByLabelText('Europa'))
    expect(screen.getByRole('button', { name: 'Conferma' })).toBeEnabled()
  })
  it('shows the saved repayment installment amount in management', () => {
    show()
    click('Gestione Carta')
    click('MODIFICA Importo rata')
    fireEvent.click(screen.getByLabelText('100,00 €'))
    click('Conferma')
    click('Torna alla carta')
    click('Gestione Carta')
    expect(screen.getByText('Importo rata').textContent).toContain('100,00 €')
  })
  it('restores the second split category before further edits', () => {
    show()
    click('Movimento PayPal 27 Febbraio')
    click('Suddividi movimento')
    fireEvent.change(screen.getByLabelText('Categoria 2'), { target: { value: 'Viaggi' } })
    fireEvent.change(screen.getByLabelText('Importo categoria 1'), { target: { value: '30' } })
    click('Salva')
    click('Indietro')
    click('Movimento PayPal 27 Febbraio')
    click('Suddividi movimento')
    expect(screen.getByLabelText('Categoria 2')).toHaveValue('Viaggi')
    expect(screen.getByLabelText('Importo categoria 1')).toHaveValue(30)
  })
})
