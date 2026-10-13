// @vitest-environment jsdom
import { resetItalyFinancialState } from '@/features/finance/italyFinancials'
import { getItalyFinancialSnapshot, selectAccountBalance } from '@/features/finance/italyFinancials'
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { DemoProvider, DEFAULT_DEMO_STATE } from '@/app/state/demoStore'
import MobileFirstInvestmentSecurities from '@/experiences/pi/it/mobile-first/MobileFirstInvestmentSecurities'
import {
  addWatchlistInstrument,
  getSecurity,
  initialSecuritiesState,
  securitiesStorageKey,
  validateSecurityTrade,
  submitSecurityOrder,
  type TradeDraft,
} from '@/features/investments/mobileFirstSecurities'

beforeEach(() => {
  localStorage.clear()
  resetItalyFinancialState()
})
afterEach(cleanup)
it('opening securities does not reserve expired reference orders or invent acquisition P&L', () => {
  const before = selectAccountBalance(getItalyFinancialSnapshot(), '000012345')
  const result = show('portfolio')
  expect(selectAccountBalance(getItalyFinancialSnapshot(), '000012345')).toEqual(before)
  expect(result.container.querySelector('.mfis-deposit-profit')).toHaveTextContent('N.D.')
  fireEvent.click(screen.getByRole('button', { name: 'Espandi elenco titoli' }))
  fireEvent.click(screen.getByRole('tab', { name: 'Vista avanzata' }))
  const apple = screen.getByRole('button', { name: /Apple NASDAQ CTV Mercato/ })
  expect(apple).toHaveTextContent('Prezzo medio di caricoN.D.')
  expect(apple).toHaveTextContent('Valore di caricoN.D.')
  result.unmount()
  show('orders')
  fireEvent.click(screen.getByRole('button', { name: /Buzzi Scaduto/ }))
  expect(screen.queryByRole('button', { name: 'Annulla ordine' })).not.toBeInTheDocument()
})
it('keeps newly submitted orders in every preset while rolling windows filter earlier records', () => {
  const state = initialSecuritiesState()
  const result = submitSecurityOrder(state, {
    ...state.orders[0]!,
    id: 'MF-window-current',
    securityId: 'apple',
    quantity: 1,
    price: 204.75,
    status: 'Inviato',
    date: getItalyFinancialSnapshot().asOf,
    validUntil: '2025-03-30',
  })
  expect(result.error).toBeNull()
  show('orders')
  for (const period of ['1M', '3M', '6M', '12M']) {
    fireEvent.click(screen.getByRole('button', { name: 'Filtri di ricerca' }))
    fireEvent.click(screen.getByRole('tab', { name: period }))
    fireEvent.click(screen.getByRole('button', { name: 'Applica' }))
    expect(screen.getByRole('button', { name: /Apple Inviato Acquisto/ })).toBeInTheDocument()
    if (period === '1M') expect(screen.queryByRole('button', { name: /Buzzi Scaduto/ })).not.toBeInTheDocument()
    else expect(screen.getByRole('button', { name: /Buzzi Scaduto/ })).toBeInTheDocument()
  }
})
it('masks chart price axes and minimum/maximum values without replacing the graph asset', () => {
  const { container } = show('security', { instrument: 'apple', hidden: true })
  for (const label of ['202,60', '201,00', '199,55', '197,99', '198,99', '204,87'])
    expect(container).not.toHaveTextContent(label)
  expect(screen.getByRole('img', { name: 'Andamento del prezzo, periodo 1G' })).toBeInTheDocument()
})
it('values a held position using its quantity while a market quote retains its unit price', () => {
  const first = show('portfolio')
  fireEvent.click(screen.getByRole('button', { name: 'Espandi elenco titoli' }))
  expect(screen.getByRole('button', { name: /Apple NASDAQ CTV Mercato/ })).toHaveTextContent('25.389')
  first.unmount()
  show('security', { instrument: 'apple' })
  expect(screen.getByText('Ultimo prezzo').parentElement).toHaveTextContent('204,75 €')
})
it.each(['Quantità', 'Prezzo', 'Deposito titoli'])(
  'requires fresh document acknowledgement when %s changes after review',
  (field) => {
    show('security', { instrument: 'apple', action: 'buy' })
    fill('Quantità', '2')
    fireEvent.click(screen.getByRole('button', { name: 'Acquista' }))
    for (const checkbox of screen.getAllByRole('checkbox')) fireEvent.click(checkbox)
    fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
    fill(field, field === 'Quantità' ? '3' : field === 'Prezzo' ? '200' : 'joint')
    if (field === 'Deposito titoli') fill('Sottodeposito', '01')
    fireEvent.click(screen.getByRole('button', { name: 'Acquista' }))
    expect(screen.getByRole('button', { name: 'Conferma' })).toBeDisabled()
    expect(screen.getAllByRole('checkbox').every((input) => !(input as HTMLInputElement).checked)).toBe(true)
  },
)
it('blocks a registered security on a joint subdeposit and accepts it after an eligible subdeposit is selected', () => {
  show('security', { instrument: 'apple', action: 'buy' })
  fill('Quantità', '2')
  fill('Deposito titoli', 'joint')
  fireEvent.click(screen.getByRole('button', { name: 'Acquista' }))
  expect(screen.getByRole('alertdialog', { name: 'Attenzione' })).toHaveTextContent('cambia il sottodeposito')
  expect(screen.queryByRole('heading', { name: 'Conferma acquisto', level: 2 })).not.toBeInTheDocument()
  expect(JSON.parse(localStorage.getItem(securitiesStorageKey)!).orders).toHaveLength(3)
  fireEvent.click(
    within(screen.getByRole('alertdialog', { name: 'Attenzione' })).getByRole('button', { name: 'Chiudi' }),
  )
  fill('Sottodeposito', '01')
  fireEvent.click(screen.getByRole('button', { name: 'Acquista' }))
  expect(screen.getByRole('heading', { name: 'Conferma acquisto', level: 2 })).toBeInTheDocument()
  finishTrade()
  expect(JSON.parse(localStorage.getItem(securitiesStorageKey)!).orders[0]).toMatchObject({
    securityId: 'apple',
    depositId: 'joint',
    subdepositId: '01',
  })
})
it('restores a valid demo when persisted data has stale or corrupt nested shapes', () => {
  localStorage.setItem(
    securitiesStorageKey,
    JSON.stringify({ orders: null, watchlists: 'bad', virtualPortfolios: [], searchHistory: [], assemblyTickets: {} }),
  )
  show('orders')
  expect(screen.getByRole('button', { name: /Buzzi Scaduto/ })).toBeInTheDocument()
})
it('shows zero holding and no deposit states without presenting fixture balances', () => {
  const { onNavigate } = show('portfolio', { zero: true })
  expect(screen.getByText('Non sono presenti titoli nel tuo portafoglio.')).toBeInTheDocument()
  expect(screen.queryByText('21.647')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Scopri il deposito titoli' }))
  expect(onNavigate).toHaveBeenCalledWith({ area: 'services', view: 'advisory' })
})
it('shows empty orders and restores an unavailable index chart on retry', () => {
  const first = show('orders', { action: 'empty' })
  expect(screen.getByText(/Non sono presenti ordini/)).toBeInTheDocument()
  first.unmount()
  show('markets', { action: 'chart-unavailable' })
  expect(screen.getByRole('status')).toHaveTextContent('Il grafico non è al momento disponibile')
  fireEvent.click(screen.getByRole('button', { name: 'Riprova' }))
  expect(screen.getByRole('img', { name: 'Andamento dell’indice' })).toBeInTheDocument()
})
it('uses bond-specific detail and statistics tabs and preserves the source advisory Enel instrument', () => {
  show('security', { instrument: 'btp' })
  expect(screen.queryByRole('tab', { name: 'Valutazioni' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('tab', { name: 'Dettagli' }))
  expect(screen.getByText('Ritenuta fiscale')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('tab', { name: 'Dati statistici' }))
  expect(screen.getByText('Duration MAC')).toBeInTheDocument()
  expect(getSecurity('IT0003153852').name).toBe('Enel AZ Ord Raggruppate')
})
function show(
  view = 'portfolio',
  options: { instrument?: string; action?: string; hidden?: boolean; zero?: boolean } = {},
) {
  const onNavigate = vi.fn(),
    onClose = vi.fn()
  const result = render(
    <DemoProvider
      initialState={{
        country: 'IT',
        designSystem: 'mobile-first',
        amountsHidden: options.hidden ?? false,
        productCounts: { ...DEFAULT_DEMO_STATE.productCounts, investments: options.zero ? 0 : 3 },
      }}
    >
      <MobileFirstInvestmentSecurities
        view={view}
        instrument={options.instrument}
        action={options.action}
        embedded={view === 'portfolio'}
        onNavigate={onNavigate}
        onClose={onClose}
      />
    </DemoProvider>,
  )
  return { ...result, onNavigate, onClose }
}
function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label, { selector: 'input,select' }), { target: { value } })
}
function finishTrade() {
  for (const checkbox of screen.getAllByRole('checkbox')) fireEvent.click(checkbox)
  fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
  expect(screen.getByRole('heading', { name: /Riepilogo/, level: 2 })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
  fill('Mobile Code', '123456')
  fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
}

it('expands position categories, switches advanced view and opens a position with buy and sell actions', () => {
  show()
  fireEvent.click(screen.getByRole('button', { name: 'Espandi elenco titoli' }))
  fireEvent.click(screen.getByRole('tab', { name: 'Vista avanzata' }))
  expect(screen.getAllByText('Prezzo medio di carico').length).toBeGreaterThan(1)
  fireEvent.click(screen.getByRole('button', { name: /Amazon Nasdaq/i }))
  expect(screen.getByRole('heading', { name: 'Posizione titolo', level: 2 })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Vendi' })).toBeInTheDocument()
})

it('keeps the deposit selection and masks all displayed amounts using the global privacy setting', () => {
  const { container } = show('portfolio', { hidden: true })
  expect(container).not.toHaveTextContent('21.647')
  expect(container).not.toHaveTextContent('636,39')
  fireEvent.click(screen.getByRole('button', { name: 'Deposito⌄' }))
  fireEvent.click(screen.getByRole('button', { name: /Andrea Rossini Bianchi e Laura Bianchi/ }))
  expect(screen.getAllByText('Andrea Rossini Bianchi e Laura Bianchi').length).toBe(2)
})

it('validates an order, gates warnings and signing, then records the new order in history', () => {
  show('security', { instrument: 'apple', action: 'buy' })
  fireEvent.click(screen.getByRole('button', { name: 'Acquista' }))
  expect(screen.getByRole('alert')).toHaveTextContent('quantità intera')
  fill('Quantità', '100000')
  fireEvent.click(screen.getByRole('button', { name: 'Acquista' }))
  expect(screen.getByRole('alert')).toHaveTextContent('Liquidità disponibile insufficiente')
  fill('Quantità', '2')
  fireEvent.click(screen.getByRole('button', { name: 'Acquista' }))
  expect(screen.getByRole('button', { name: 'Conferma' })).toBeDisabled()
  finishTrade()
  expect(screen.getByRole('status')).toHaveTextContent('Ordine di acquisto inviato')
  fireEvent.click(screen.getByRole('button', { name: 'Vai a ordini e movimenti' }))
  expect(screen.getByRole('button', { name: /Apple Inviato Acquisto/ })).toBeInTheDocument()
  const state = JSON.parse(localStorage.getItem(securitiesStorageKey)!)
  expect(state.orders[0]).toMatchObject({ securityId: 'apple', quantity: 2, status: 'Inviato' })
})

it('requires confirmation to cancel a pending order and shows it in movements', () => {
  const state = initialSecuritiesState()
  state.orders[0]!.validUntil = '2025-03-30'
  localStorage.setItem(securitiesStorageKey, JSON.stringify(state))
  show('orders')
  fireEvent.click(screen.getByRole('button', { name: /Buzzi Ineseguito/ }))
  fireEvent.click(screen.getByRole('button', { name: 'Annulla ordine' }))
  fireEvent.click(screen.getByRole('button', { name: 'No, chiudi' }))
  expect(screen.getAllByText('Ineseguito').length).toBeGreaterThan(0)
  fireEvent.click(screen.getByRole('button', { name: 'Annulla ordine' }))
  fireEvent.click(screen.getByRole('button', { name: 'Sì, annulla ordine' }))
  expect(screen.getByRole('status')).toHaveTextContent('Ordine annullato')
  fireEvent.click(screen.getByRole('tab', { name: 'Movimenti' }))
  expect(screen.getByRole('button', { name: /Buzzi Annullato/ })).toBeInTheDocument()
})

it('creates, renames and deletes a watchlist and prevents duplicate instruments', () => {
  show('watchlist')
  fireEvent.click(screen.getByRole('button', { name: /Nuova lista Aggiungi strumenti/ }))
  fill('Nome lista', 'Mia lista')
  fireEvent.click(screen.getByRole('button', { name: 'Salva' }))
  fireEvent.click(screen.getByRole('button', { name: 'Aggiungi strumenti' }))
  fill('Cerca strumenti', 'Apple')
  fireEvent.click(screen.getByRole('button', { name: 'Aggiungi Apple' }))
  fireEvent.click(screen.getByRole('button', { name: 'Aggiungi Apple' }))
  expect(screen.getByRole('alert')).toHaveTextContent('già presente')
  fireEvent.click(screen.getByRole('button', { name: 'Gestisci lista' }))
  fireEvent.click(screen.getByRole('button', { name: 'Rinomina' }))
  fill('Nome lista', 'Nuovo nome')
  fireEvent.click(screen.getByRole('button', { name: 'Salva' }))
  expect(screen.getByRole('heading', { name: 'Nuovo nome', level: 2 })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Elimina lista' }))
  fireEvent.click(screen.getByRole('button', { name: 'Sì, elimina' }))
  expect(screen.queryByRole('heading', { name: 'Nuovo nome' })).not.toBeInTheDocument()
})

it('enforces maximum list and instrument limits from persisted state', () => {
  const state = initialSecuritiesState()
  state.watchlists = Array.from({ length: 10 }, (_, i) => ({ id: String(i), name: `Lista ${i}`, instruments: [] }))
  localStorage.setItem(securitiesStorageKey, JSON.stringify(state))
  show('watchlist')
  expect(screen.getByRole('button', { name: /Nuova lista Aggiungi strumenti/ })).toBeDisabled()
  expect(
    addWatchlistInstrument(
      { id: 'full', name: 'Piena', instruments: Array.from({ length: 20 }, (_, i) => String(i)) },
      'apple',
    ).error,
  ).toContain('20 strumenti')
})

it('searches by ISIN, retains and deletes history, filters empty result sets and hands funds to the parent', () => {
  const { onNavigate } = show('search')
  fill('Cerca per', 'ISIN')
  fill('Cerca strumenti', 'US0378331005')
  fireEvent.click(screen.getByRole('button', { name: 'Cerca' }))
  expect(screen.getByRole('heading', { name: 'Risultati (1)' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Elimina US0378331005' }))
  expect(screen.queryByRole('heading', { name: 'Ricerche recenti' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Ricerca avanzata' }))
  fill('Tipologia strumento', 'Obbligazioni')
  fireEvent.click(screen.getByRole('button', { name: 'Filtra risultati' }))
  expect(screen.getByText(/Nessuno strumento trovato/)).toBeInTheDocument()
  fireEvent.click(screen.getByRole('tab', { name: 'Fondi' }))
  expect(onNavigate).toHaveBeenCalledWith({ area: 'funds', view: 'search' })
})

it('writes virtual trades to the selected portfolio without submitting a real order', () => {
  show('virtual')
  const tile = screen.getByText('Test 2').closest('article')!
  fireEvent.click(within(tile).getByRole('button', { name: 'Apri portafoglio' }))
  fireEvent.click(screen.getByRole('button', { name: 'Aggiungi strumento' }))
  fill('Cerca strumenti', 'Apple')
  fireEvent.click(screen.getByRole('button', { name: 'Aggiungi Apple' }))
  expect(screen.getByLabelText('Portafoglio virtuale')).toHaveValue('test2')
  fill('Quantità', '3')
  fireEvent.click(screen.getByRole('button', { name: 'Acquista virtuale' }))
  expect(screen.getByRole('status')).toHaveTextContent('Operazione virtuale completata')
  const state = JSON.parse(localStorage.getItem(securitiesStorageKey)!)
  expect(
    state.virtualPortfolios[1].positions.find((p: { securityId: string }) => p.securityId === 'apple').quantity,
  ).toBe(53)
  expect(state.orders).toHaveLength(3)
})

it('validates capital increase rights and auction nominal minimums before confirmation', () => {
  show('security', { instrument: 'saipem', action: 'aucap' })
  expect(screen.getByRole('button', { name: 'Conferma' })).toBeDisabled()
  fireEvent.click(screen.getByRole('checkbox'))
  fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
  fill('Numero di diritti di opzione di cui si richiede l’esercizio', '13')
  fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
  expect(screen.getByRole('alert')).toHaveTextContent('multiplo di 12')
  const draft: TradeDraft = {
    action: 'auction',
    depositId: 'main',
    subdepositId: '00',
    quantity: '500',
    price: '100',
    priceType: 'Al limite',
    market: 'MOT',
    quantityCondition: 'Senza condizione',
    validUntil: '2025-03-30',
    conditional: false,
    triggerPrice: '',
  }
  expect(validateSecurityTrade(draft, getSecurity('bot'))).toContain('almeno 1.000')
  expect(validateSecurityTrade({ ...draft, quantity: '1000' }, getSecurity('bot'))).toBeNull()
})

it('limits assembly ticket shares and signs a successful request', () => {
  show('assembly')
  fireEvent.click(screen.getByRole('button', { name: 'Richiedi biglietto A2A SPA' }))
  fill('Quantità di azioni richieste', '3')
  fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
  expect(screen.getByRole('alert')).toHaveTextContent('tra 1 e 2')
  fill('Quantità di azioni richieste', '2')
  fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
  fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
  fill('Mobile Code', '000000')
  fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
  expect(screen.getByRole('alert')).toHaveTextContent('Mobile Code non corretto')
  fill('Mobile Code', '123456')
  fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
  expect(screen.getByRole('status')).toHaveTextContent('La tua richiesta è stata inviata')
  expect(JSON.parse(localStorage.getItem(securitiesStorageKey)!).assemblyTickets['A2A SPA']).toBe(1)
})

it.each(['0', '1.5', '3'])(
  'preserves assembly form and rejects invalid shares %s without booking financial changes',
  (quantity) => {
    const before = getItalyFinancialSnapshot()
    show('assembly')
    fireEvent.click(screen.getByRole('button', { name: 'Richiedi biglietto A2A SPA' }))
    fill('Quantità di azioni richieste', quantity)
    fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Inserisci una quantità intera tra 1 e 2.')
    expect(screen.getByLabelText('Quantità di azioni richieste')).toHaveValue(Number(quantity))
    expect(getItalyFinancialSnapshot().events).toEqual(before.events)
    expect(getItalyFinancialSnapshot().reservations).toEqual(before.reservations)
    expect(JSON.parse(localStorage.getItem(securitiesStorageKey)!).assemblyTickets['A2A SPA']).toBeUndefined()
  },
)

it('preserves assembly quantity and convocation through code and back while each valid request adds one ticket', () => {
  show('assembly')
  fireEvent.click(screen.getByRole('button', { name: 'Richiedi biglietto A2A SPA' }))
  fill('Quantità di azioni richieste', '2')
  fill('Convocazione', 'Seconda Convocazione')
  fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
  fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
  fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
  fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
  expect(screen.getByLabelText('Quantità di azioni richieste')).toHaveValue(2)
  expect(screen.getByLabelText('Convocazione')).toHaveValue('Seconda Convocazione')
  fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
  fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
  fill('Mobile Code', '123456 ')
  fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
  expect(screen.getByRole('alert')).toHaveTextContent('Mobile Code non corretto. Riprova.')
  fill('Mobile Code', '123456')
  fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
  expect(JSON.parse(localStorage.getItem(securitiesStorageKey)!).assemblyTickets['A2A SPA']).toBe(1)
})

it('opens markets, carousel indices, composition and security tabs with native interactions', () => {
  show('markets')
  fireEvent.click(screen.getByRole('button', { name: 'Indice successivo' }))
  expect(screen.getByRole('heading', { name: 'Mid Cap' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Composizione titoli' }))
  fireEvent.click(screen.getByRole('button', { name: /Apple NASDAQ/ }))
  fireEvent.click(screen.getByRole('tab', { name: 'Book e altre borse' }))
  expect(screen.getByRole('heading', { name: 'Book 5 livelli' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('tab', { name: 'Profilo societario' }))
  expect(screen.getByText('Ragione sociale')).toBeInTheDocument()
})
