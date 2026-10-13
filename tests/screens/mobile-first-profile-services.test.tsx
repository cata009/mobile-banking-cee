// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { StrictMode } from 'react'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MobileFirstProfileServices from '../../src/experiences/pi/it/mobile-first/MobileFirstProfileServices'
import { profileServicesStore } from '../../src/features/profile/mobileFirstProfileServices'
import { profileSettingsStore } from '../../src/features/profile/mobileFirstProfileSettings'

afterEach(cleanup)
beforeEach(() => {
  profileServicesStore.reset()
  profileSettingsStore.reset()
})

describe('Mobile First profile services', () => {
  it('books, views and cancels a local appointment', () => {
    render(<MobileFirstProfileServices entry="appointments" onBack={vi.fn()} onClose={vi.fn()} />)
    fireEvent.change(screen.getByLabelText('Seleziona la filiale'), { target: { value: 'Milano Garibaldi' } })
    fireEvent.change(screen.getByLabelText('Seleziona la categoria dell’appuntamento'), {
      target: { value: 'Conto, Carte e Servizi digitali' },
    })
    fireEvent.change(screen.getByLabelText('Seleziona lo scopo dell’appuntamento'), {
      target: { value: 'Informazioni / apertura' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Seleziona il giorno e l’orario' }))
    fireEvent.click(screen.getByRole('button', { name: 'GIO 6/03' }))
    fireEvent.click(screen.getByRole('button', { name: '12:00' }))
    fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continua' }))
    expect(screen.getByRole('heading', { name: 'L’appuntamento è stato confermato' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Vedi appuntamenti' }))
    fireEvent.click(screen.getByRole('button', { name: /Informazioni \/ apertura/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Modifica o cancella' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancella appuntamento' }))
    fireEvent.click(screen.getByRole('button', { name: 'Conferma cancellazione' }))
    expect(screen.getByText('Cancellato')).toBeInTheDocument()
  })
  it('requires reading the interview before local signature', () => {
    render(
      <MobileFirstProfileServices entry="communications" communicationTab={2} onBack={vi.fn()} onClose={vi.fn()} />,
    )
    fireEvent.click(screen.getByRole('button', { name: /Intervista MIFID/ }))
    expect(screen.getByRole('button', { name: 'Prosegui alla firma' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: /Intervista di adeguatezza/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Continua' }))
    fireEvent.click(screen.getByRole('button', { name: 'Prosegui alla firma' }))
    fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '12345678' } })
    fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
    expect(screen.getByRole('heading', { name: 'Aggiornamento intervista completato' })).toBeInTheDocument()
  })
  it('reads a document and archives it with an accessible result', () => {
    render(<MobileFirstProfileServices entry="documents" onBack={vi.fn()} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Estratto conto/ }))
    expect(screen.getByText('FACSIMILE')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Archivia' }))
    expect(screen.getByRole('status')).toHaveTextContent('Documento archiviato')
    fireEvent.click(screen.getByRole('button', { name: 'Archivio' }))
    expect(screen.getByRole('button', { name: /Estratto conto/ })).toBeInTheDocument()
  })
  it('searches support, reads an article and routes contextual actions', () => {
    const navigate = vi.fn()
    render(<MobileFirstProfileServices entry="support" onNavigate={navigate} onBack={vi.fn()} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Vedi altro ›' }))
    fireEvent.change(screen.getByLabelText('Cerca argomenti'), { target: { value: 'nonexistent article' } })
    expect(screen.getByText('Nessun risultato trovato')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Cerca argomenti'), { target: { value: 'Gestione del conto' } })
    fireEvent.click(screen.getByRole('button', { name: 'Approfondisci ›' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'Leggi articolo ›' })[0]!)
    expect(
      screen.getByRole('heading', { name: 'Info sulla gestione in self del mio conto corrente' }),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Gestione conto' }))
    expect(navigate).toHaveBeenCalledWith('account', undefined)
    fireEvent.click(screen.getByRole('button', { name: 'Chiama' }))
    fireEvent.click(screen.getByRole('button', { name: /800 575 757/ }))
    expect(screen.getByRole('status')).toHaveTextContent('Numero da contattare')
  })
  it('requires notes for other appointment categories and preserves edits', () => {
    render(<MobileFirstProfileServices entry="appointments" onBack={vi.fn()} onClose={vi.fn()} />)
    fireEvent.change(screen.getByLabelText('Seleziona la filiale'), { target: { value: 'Zanè' } })
    fireEvent.change(screen.getByLabelText('Seleziona la categoria dell’appuntamento'), {
      target: { value: 'Altre operazioni' },
    })
    fireEvent.change(screen.getByLabelText('Seleziona lo scopo dell’appuntamento'), { target: { value: 'Altro' } })
    fireEvent.click(screen.getByRole('button', { name: 'Seleziona il giorno e l’orario' }))
    fireEvent.click(screen.getByRole('button', { name: 'GIO 6/03' }))
    fireEvent.click(screen.getByRole('button', { name: '12:00' }))
    fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continua' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Note è obbligatorio')
    fireEvent.change(screen.getByLabelText('Note'), { target: { value: 'Imposta di bollo su prodotti finanziari' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continua' }))
    expect(profileServicesStore.getSnapshot().appointments[0]?.notes).toBe('Imposta di bollo su prodotti finanziari')
  })
  it('creates an ISEE facsimile for selected accounts and year', () => {
    render(<MobileFirstProfileServices entry="documents" onBack={vi.fn()} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Attestazione ISEE RICHIEDI/ }))
    fireEvent.click(screen.getByLabelText('Seleziona tutti'))
    fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
    fireEvent.click(screen.getByLabelText('Giacenza media'))
    fireEvent.click(screen.getByRole('tab', { name: '2023' }))
    fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '67')
    fireEvent.click(screen.getByRole('button', { name: 'Visualizza documento' }))
    expect(screen.getByText('2023 · Giacenza media')).toBeInTheDocument()
    expect(screen.getByText('FACSIMILE')).toBeInTheDocument()
  })
  it('validates ranges, filters and deletes only locally uploaded documents', () => {
    render(<MobileFirstProfileServices entry="documents" onBack={vi.fn()} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Filtri documenti' }))
    fireEvent.change(screen.getByLabelText('Seleziona categoria'), { target: { value: 'Investimenti e trading' } })
    fireEvent.change(screen.getByLabelText('Data di inizio'), { target: { value: '2025-01-01' } })
    fireEvent.change(screen.getByLabelText('Data di fine'), { target: { value: '2025-04-01' } })
    fireEvent.click(screen.getByRole('button', { name: 'Applica' }))
    expect(screen.getByRole('alert')).toHaveTextContent('1 mese')
    fireEvent.click(screen.getByRole('button', { name: 'Rimuovi Filtri' }))
    fireEvent.change(screen.getByLabelText('Seleziona categoria'), { target: { value: 'Caricati da te' } })
    fireEvent.click(screen.getByRole('button', { name: 'Applica' }))
    expect(screen.getByRole('button', { name: 'Elimina Patente' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Elimina Patente' }))
    fireEvent.click(screen.getByRole('button', { name: 'Annulla' }))
    expect(profileServicesStore.getSnapshot().documents.find((item) => item.id === 'licence')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Elimina Patente' }))
    fireEvent.click(screen.getByRole('button', { name: 'Conferma eliminazione' }))
    expect(profileServicesStore.getSnapshot().documents.find((item) => item.id === 'licence')).toBeUndefined()
  })
  it('changes delivery with canonical Mobile Code authorization', () => {
    render(<MobileFirstProfileServices entry="documents" onBack={vi.fn()} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Impostazioni documenti' }))
    fireEvent.click(screen.getAllByLabelText('Cartaceo')[0]!)
    fireEvent.click(screen.getByRole('button', { name: 'Avanti' }))
    fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '111111' } })
    fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Mobile Code non è corretto')
    fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '12345678' } })
    fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
    expect(screen.getByRole('heading', { name: 'Scelta effettuata correttamente' })).toBeInTheDocument()
  })
  it('uploads practice evidence without changing its incomplete state and cancels with confirmation', () => {
    render(
      <MobileFirstProfileServices
        entry="communications"
        communicationTab={2}
        initialDetail="overdraft"
        onBack={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    fireEvent.change(screen.getByLabelText('Carica Busta paga'), {
      target: { files: [new File(['demo'], 'busta.pdf', { type: 'application/pdf' })] },
    })
    expect(screen.getByRole('status')).toHaveTextContent('La pratica rimane incompleta')
    fireEvent.click(screen.getByRole('button', { name: 'Annulla la pratica' }))
    fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
    expect(profileServicesStore.getSnapshot().practices.find((item) => item.id === 'overdraft')?.status).toBe(
      'Annullata',
    )
  })
  it('routes notices by semantic source ID and marks messages read through selection', () => {
    const navigate = vi.fn()
    render(
      <MobileFirstProfileServices entry="communications" onNavigate={navigate} onBack={vi.fn()} onClose={vi.fn()} />,
    )
    fireEvent.click(screen.getByRole('button', { name: /Notifica pagamento/ }))
    expect(navigate).toHaveBeenCalledWith('notification', 'debit-info')
    expect(profileServicesStore.getSnapshot().notices[0]?.read).toBe(true)
    fireEvent.click(screen.getByRole('tab', { name: 'Messaggi' }))
    fireEvent.click(screen.getByRole('button', { name: 'Segna come letti' }))
    fireEvent.click(screen.getByLabelText('Seleziona tutti'))
    fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
    expect(profileServicesStore.getSnapshot().messages.every((item) => item.read)).toBe(true)
  })
  it('shows the private banker, branch details and saved email drafts', () => {
    render(<MobileFirstProfileServices entry="bank" advisorKind="private" onBack={vi.fn()} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Mario Bianchi Private Banker/ }))
    expect(screen.getByText('Private Banker')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Scrivi una email' }))
    fireEvent.change(screen.getByLabelText('Oggetto'), { target: { value: 'Consulenza' } })
    fireEvent.change(screen.getByLabelText('Messaggio'), { target: { value: 'Vorrei fissare una consulenza.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salva bozza' }))
    expect(screen.getByRole('status')).toHaveTextContent('Bozza salvata.')
    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
    fireEvent.click(screen.getByRole('button', { name: /Milano Garibaldi/ }))
    expect(screen.getByRole('heading', { name: 'Orari filiale' })).toBeInTheDocument()
    expect(within(screen.getByRole('main')).getAllByText('Mario Bianchi').length).toBeGreaterThan(0)
  })
  it.each([
    ['Investimenti e trading', '1 mese'],
    ['Consulenze', '1 mese'],
    ['In primo piano', '6 mesi'],
  ])('validates inherited %s filter constraints when the draft category is blank', (category, message) => {
    render(<MobileFirstProfileServices entry="documents" onBack={vi.fn()} onClose={vi.fn()} />)
    if (category !== 'In primo piano') {
      fireEvent.click(screen.getByRole('tab', { name: 'Altro' }))
      fireEvent.click(screen.getByRole('button', { name: category }))
    }
    fireEvent.click(screen.getByRole('button', { name: 'Filtri documenti' }))
    expect(screen.getByLabelText('Seleziona categoria')).toHaveValue('')
    fireEvent.change(screen.getByLabelText('Data di inizio'), { target: { value: '2024-01-01' } })
    fireEvent.change(screen.getByLabelText('Data di fine'), { target: { value: '2025-01-31' } })
    fireEvent.click(screen.getByRole('button', { name: 'Applica' }))
    expect(screen.getByRole('alert')).toHaveTextContent(message)
  })
  it.each([
    [1, 'message-btp', 'messages'],
    [2, 'mifid', 'practices'],
  ] as const)('marks initial detail %s/%s read without repeated snapshot mutations', (tab, id, collection) => {
    const props = {
      entry: 'communications' as const,
      communicationTab: tab,
      initialItemId: id,
      onBack: vi.fn(),
      onClose: vi.fn(),
    }
    const { rerender } = render(<MobileFirstProfileServices {...props} />)
    expect(profileServicesStore.getSnapshot()[collection].find((item) => item.id === id)?.read).toBe(true)
    const readSnapshot = profileServicesStore.getSnapshot()
    rerender(<MobileFirstProfileServices {...props} />)
    expect(profileServicesStore.getSnapshot()).toBe(readSnapshot)
  })
  it('keeps cards context after searching across support categories', () => {
    const onNavigate = vi.fn()
    render(<MobileFirstProfileServices entry="support" onNavigate={onNavigate} onBack={vi.fn()} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Vedi altro ›' }))
    fireEvent.change(screen.getByLabelText('Cerca argomenti'), { target: { value: 'Problemi con la carta' } })
    fireEvent.click(screen.getByRole('button', { name: 'Approfondisci ›' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'Leggi articolo ›' })[0]!)
    expect(
      screen.queryByText(
        'Con l’app Mobile Banking puoi gestire il tuo conto in completa autonomia, senza dover andare in filiale. Puoi visualizzare il saldo aggiornato, controllare i movimenti in tempo reale e accedere a tutte le funzionalità legate a BANCOMAT Pay®.',
      ),
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Problemi con la carta' }))
    expect(onNavigate).toHaveBeenCalledWith('cards', undefined)
  })
  it('keeps the Mobile Code lock after returning to document delivery settings', () => {
    render(<MobileFirstProfileServices entry="documents" onBack={vi.fn()} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Impostazioni documenti' }))
    fireEvent.click(screen.getByRole('button', { name: 'Avanti' }))
    fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '111111' } })
    for (let attempt = 0; attempt < 3; attempt++) fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
    fireEvent.click(screen.getByRole('button', { name: 'Avanti' }))
    fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '12345678' } })
    fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
    expect(screen.getByRole('alert')).toHaveTextContent('bloccata')
    expect(profileServicesStore.getSnapshot().delivery).toBeUndefined()
  })
  it('keeps the Mobile Code lock after returning to the MIFID interview', () => {
    render(
      <MobileFirstProfileServices
        entry="communications"
        communicationTab={2}
        initialDetail="mifid"
        onBack={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /Intervista di adeguatezza/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Continua' }))
    fireEvent.click(screen.getByRole('button', { name: 'Prosegui alla firma' }))
    fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '111111' } })
    for (let attempt = 0; attempt < 3; attempt++) fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
    fireEvent.click(screen.getByRole('button', { name: 'Prosegui alla firma' }))
    fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '12345678' } })
    fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
    expect(screen.getByRole('alert')).toHaveTextContent('bloccata')
    expect(profileServicesStore.getSnapshot().practices.find((item) => item.id === 'mifid')?.status).toBe('Incompleta')
  })
  it.each(['Sospesa', 'Revocata', 'Non attiva'] as const)(
    'blocks MIFID signing with a %s certificate and offers certificate management',
    (status) => {
      profileSettingsStore.update({ signature: status })
      const onNavigate = vi.fn()
      render(
        <MobileFirstProfileServices
          entry="communications"
          communicationTab={2}
          initialDetail="mifid"
          onNavigate={onNavigate}
          onBack={vi.fn()}
          onClose={vi.fn()}
        />,
      )
      fireEvent.click(screen.getByRole('button', { name: /Intervista di adeguatezza/ }))
      fireEvent.click(screen.getByRole('button', { name: 'Continua' }))
      expect(screen.getByRole('button', { name: 'Prosegui alla firma' })).toBeDisabled()
      fireEvent.click(screen.getByRole('button', { name: 'Gestisci firma digitale' }))
      expect(onNavigate).toHaveBeenCalledWith('settings', 'digital-signature')
      expect(profileServicesStore.getSnapshot().practices.find((item) => item.id === 'mifid')?.status).toBe(
        'Incompleta',
      )
    },
  )
  it('rechecks certificate state while the MIFID authorization screen is open', () => {
    render(
      <MobileFirstProfileServices
        entry="communications"
        communicationTab={2}
        initialDetail="mifid"
        onBack={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /Intervista di adeguatezza/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Continua' }))
    fireEvent.click(screen.getByRole('button', { name: 'Prosegui alla firma' }))
    fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '12345678' } })
    act(() => profileSettingsStore.update({ signature: 'Revocata' }))
    expect(screen.getByRole('button', { name: 'Conferma' })).toBeDisabled()
    expect(profileServicesStore.getSnapshot().practices.find((item) => item.id === 'mifid')?.status).toBe('Incompleta')
  })
  it('marks a strict-mode direct message entry once and leaves invalid IDs untouched', () => {
    const listener = vi.fn()
    const unsubscribe = profileServicesStore.subscribe(listener)
    const { unmount } = render(
      <StrictMode>
        <MobileFirstProfileServices
          entry="communications"
          communicationTab={1}
          initialDetail="message-btp"
          onBack={vi.fn()}
          onClose={vi.fn()}
        />
      </StrictMode>,
    )
    expect(listener).toHaveBeenCalledTimes(1)
    unmount()
    const readSnapshot = profileServicesStore.getSnapshot()
    render(
      <MobileFirstProfileServices
        entry="communications"
        communicationTab={1}
        initialDetail="missing-message"
        onBack={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    expect(profileServicesStore.getSnapshot()).toBe(readSnapshot)
    unsubscribe()
  })
  it('treats an expired suspended certificate as revoked in the MIFID flow', () => {
    profileSettingsStore.update({
      signature: 'Sospesa',
      signatureSuspendedAt: new Date(Date.now() - 91 * 86400000).toISOString(),
    })
    render(
      <MobileFirstProfileServices
        entry="communications"
        communicationTab={2}
        initialDetail="mifid"
        onBack={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('non è attiva')
    expect(screen.getByRole('button', { name: 'Prosegui alla firma' })).toBeDisabled()
  })
  it('allows document delivery authorization when the signing certificate is revoked', () => {
    profileSettingsStore.update({ signature: 'Revocata' })
    render(<MobileFirstProfileServices entry="documents" onBack={vi.fn()} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Impostazioni documenti' }))
    fireEvent.click(screen.getByRole('button', { name: 'Avanti' }))
    fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '12345678' } })
    fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
    expect(screen.getByRole('heading', { name: 'Scelta effettuata correttamente' })).toBeInTheDocument()
  })
})
