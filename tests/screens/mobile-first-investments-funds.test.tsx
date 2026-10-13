// @vitest-environment jsdom
import { resetItalyFinancialState } from '@/features/finance/italyFinancials'
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { DemoProvider } from '@/app/state/demoStore'
import MobileFirstInvestmentFunds from '@/experiences/pi/it/mobile-first/MobileFirstInvestmentFunds'
import { readFundsState, resetFundsState } from '@/features/investments/mobileFirstFundsState'

beforeEach(() => resetItalyFinancialState())
afterEach(() => {
  cleanup()
  resetFundsState()
})
function show(view = 'portfolio', instrument = 'pic', hidden = false) {
  return render(
    <DemoProvider initialState={{ country: 'IT', designSystem: 'mobile-first', amountsHidden: hidden }}>
      <MobileFirstInvestmentFunds
        view={view}
        instrument={instrument}
        embedded={view === 'portfolio'}
        onNavigate={vi.fn()}
        onClose={vi.fn()}
      />
    </DemoProvider>,
  )
}
it('shows funds portfolio and masks all card amounts with global privacy', () => {
  const { container } = show('portfolio', 'pic', true)
  expect(screen.getByRole('heading', { name: 'I tuoi fondi' })).toBeInTheDocument()
  expect(container).not.toHaveTextContent('21.647')
  expect(container).not.toHaveTextContent('2.705')
})
it('retains entered reimbursement on back, requires document consent and validates Mobile Code', () => {
  show('fund')
  fireEvent.click(screen.getByRole('button', { name: 'Operazioni' }))
  fireEvent.click(screen.getByRole('button', { name: 'Rimborso fondo' }))
  fireEvent.change(screen.getByLabelText('Quote'), { target: { value: '35' } })
  fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
  expect(screen.getByRole('alert')).toHaveTextContent('quote disponibili')
  fireEvent.change(screen.getByLabelText('Quote'), { target: { value: '3' } })
  fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
  fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
  expect(screen.getByLabelText('Quote')).toHaveValue(3)
  fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
  fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
  expect(screen.getByRole('button', { name: 'Prosegui' })).toBeDisabled()
  screen.getAllByRole('checkbox').forEach((input) => fireEvent.click(input))
  fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
  fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '123' } })
  fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
  expect(screen.getByRole('alert')).toHaveTextContent('6 cifre')
  fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '123456' } })
  fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
  expect(screen.getByRole('heading', { name: 'Operazione completata', level: 2 })).toBeInTheDocument()
})
it('filters fund orders and cancels only pending orders', () => {
  show('orders')
  fireEvent.click(screen.getByRole('button', { name: /Pioneer SF.*Rimborso/ }))
  fireEvent.click(screen.getByRole('button', { name: 'Annulla ordine' }))
  fireEvent.click(screen.getByRole('button', { name: 'Conferma annullamento' }))
  expect(screen.getByRole('heading', { name: 'Ordine annullato', level: 2 })).toBeInTheDocument()
})

function signOperation() {
  for (let index = 0; index < 12 && !screen.queryByLabelText('Mobile Code'); index++) {
    screen.queryAllByRole('checkbox').forEach((input) => {
      if (!(input as HTMLInputElement).checked) fireEvent.click(input)
    })
    fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
  }
  fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '123456' } })
  fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
}

it('activates, modifies, suspends, resumes and revokes the savings service after signing', () => {
  const initial = show('savings-plan')
  fireEvent.click(screen.getAllByRole('button', { name: 'Aderisci' })[0]!)
  signOperation()
  expect(screen.getByText('Attivo')).toBeInTheDocument()
  initial.unmount()
  show('savings-plan', 'allianz')
  fireEvent.click(screen.getByRole('tab', { name: 'Servizio attivo' }))
  for (const [action, status] of [
    ['Modifica', 'Attivo'],
    ['Sospensione', 'Sospeso'],
    ['Riattivazione', 'Attivo'],
    ['Revoca', 'Revocato'],
  ]) {
    fireEvent.click(screen.getByRole('button', { name: action }))
    signOperation()
    expect(screen.getByText(status!)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Torna al servizio' }))
  }
})

it('keeps document consent separate and requires a new acceptance at the signature step', () => {
  show('fund')
  fireEvent.click(screen.getByRole('button', { name: 'Operazioni' }))
  fireEvent.click(screen.getByRole('button', { name: 'Sottoscrizione fondi' }))
  for (let index = 0; index < 4; index++) fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
  fireEvent.click(screen.getByRole('button', { name: 'Key information document (KID)' }))
  fireEvent.click(screen.getByRole('button', { name: 'Ho preso visione' }))
  expect(screen.getAllByRole('checkbox').filter((item) => (item as HTMLInputElement).checked)).toHaveLength(1)
  expect(screen.getByRole('button', { name: 'Prosegui' })).toBeDisabled()
  screen.getAllByRole('checkbox').forEach((input) => {
    if (!(input as HTMLInputElement).checked) fireEvent.click(input)
  })
  fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
  fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
  expect(screen.getByRole('button', { name: 'Prosegui' })).toBeDisabled()
})

it('opens all fund sheet tabs and preserves navigation back to search results', () => {
  show('search')
  fireEvent.change(screen.getByLabelText('Ricerca fondi per nome o ISIN'), { target: { value: 'Pictet' } })
  fireEvent.click(screen.getByRole('button', { name: /PICTET GLOBAL FUNDS/ }))
  fireEvent.click(screen.getByRole('tab', { name: 'Performance' }))
  expect(screen.getByRole('heading', { name: 'Grafico performance' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('tab', { name: 'Composizione' }))
  fireEvent.click(screen.getByRole('button', { name: 'Scopri ripartizione' }))
  expect(screen.getByText('Azioni')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('tab', { name: 'Commissioni' }))
  expect(screen.getByText('3,15 %')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('tab', { name: 'Documenti' }))
  expect(screen.getByRole('heading', { name: 'Documentazione fondo' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
  expect(screen.getByLabelText('Ricerca fondi per nome o ISIN')).toHaveValue('Pictet')
})

it('routes advisory subscription to the exact proposed fund and normalizes reimbursement aliases', () => {
  const initial = render(
    <DemoProvider initialState={{ country: 'IT', designSystem: 'mobile-first' }}>
      <MobileFirstInvestmentFunds
        view="operation"
        instrument="IT0005418741"
        action="subscribe"
        onNavigate={vi.fn()}
        onClose={vi.fn()}
      />
    </DemoProvider>,
  )
  for (let index = 0; index < 4; index++) fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
  expect(screen.getByText('Amundi Elite Multi Asset Flexible-Dis.Cl.A EUR/EUR')).toBeInTheDocument()
  expect(screen.getByText('IT0005418741')).toBeInTheDocument()
  initial.unmount()
  render(
    <DemoProvider initialState={{ country: 'IT', designSystem: 'mobile-first' }}>
      <MobileFirstInvestmentFunds
        view="operation"
        instrument="pac"
        action="refund"
        onNavigate={vi.fn()}
        onClose={vi.fn()}
      />
    </DemoProvider>,
  )
  expect(screen.getByLabelText('Quote')).toBeInTheDocument()
})

it('shows source zero portfolio and empty order list', () => {
  const initial = render(
    <DemoProvider
      initialState={{
        country: 'IT',
        designSystem: 'mobile-first',
        productCounts: {
          accounts: 1,
          debitCards: 1,
          creditCards: 0,
          mealCards: 0,
          deposits: 0,
          savingsAccounts: 0,
          investments: 0,
          loans: 0,
          mortgages: 0,
        },
      }}
    >
      <MobileFirstInvestmentFunds view="portfolio" embedded onNavigate={vi.fn()} onClose={vi.fn()} />
    </DemoProvider>,
  )
  expect(screen.getByText('Non hai ancora fondi nel tuo portafoglio.')).toBeInTheDocument()
  expect(screen.queryByText('Pioneer SF - Equity Plan 60')).not.toBeInTheDocument()
  initial.unmount()
  render(
    <DemoProvider
      initialState={{
        country: 'IT',
        designSystem: 'mobile-first',
        productCounts: {
          accounts: 1,
          debitCards: 1,
          creditCards: 0,
          mealCards: 0,
          deposits: 0,
          savingsAccounts: 0,
          investments: 0,
          loans: 0,
          mortgages: 0,
        },
      }}
    >
      <MobileFirstInvestmentFunds view="orders" onNavigate={vi.fn()} onClose={vi.fn()} />
    </DemoProvider>,
  )
  expect(screen.getByText('Nessun ordine corrisponde ai filtri selezionati.')).toBeInTheDocument()
})

it('persists PAC suspension and resumption and blocks invalid plan edits', () => {
  const initial = show('fund', 'pac')
  fireEvent.click(screen.getByRole('button', { name: 'Operazioni' }))
  fireEvent.click(screen.getByRole('button', { name: 'Modifica PAC' }))
  fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
  fireEvent.change(screen.getByLabelText('Numero rate'), { target: { value: '1' } })
  fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
  expect(screen.getByRole('alert')).toHaveTextContent('72 e 192')
  initial.unmount()
  const suspend = show('fund', 'pac')
  fireEvent.click(screen.getByRole('button', { name: 'Operazioni' }))
  fireEvent.click(screen.getByRole('button', { name: 'Sospensione PAC' }))
  signOperation()
  expect(readFundsState()?.pacStatus).toBe('suspended')
  suspend.unmount()
  show('fund', 'pac')
  fireEvent.click(screen.getByRole('button', { name: 'Operazioni' }))
  fireEvent.click(screen.getByRole('button', { name: 'Riattivazione PAC' }))
  signOperation()
  expect(readFundsState()?.pacStatus).toBe('active')
})

it('opens source catalogue offers and filters advanced search to eligible funds', () => {
  show('catalog')
  fireEvent.click(screen.getByRole('button', { name: /Nuovi fondi disponibili/ }))
  expect(screen.getByText('Cedola annuale per 3 anni')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
  fireEvent.click(screen.getByRole('button', { name: 'Ricerca fondi' }))
  fireEvent.click(screen.getByRole('button', { name: 'Ricerca avanzata' }))
  fireEvent.change(screen.getByLabelText('Asset manager'), { target: { value: 'Allianz' } })
  fireEvent.change(screen.getByLabelText('Modalità di sottoscrizione'), { target: { value: 'PAC' } })
  expect(screen.getByText('Nessun fondo trovato. Modifica i filtri di ricerca.')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Rimuovi filtri' }))
  expect(screen.getByRole('button', { name: /PICTET GLOBAL FUNDS/ })).toBeInTheDocument()
})

it('requires a positive advance amount and shows the source balance warning', () => {
  const initial = render(
    <DemoProvider initialState={{ country: 'IT', designSystem: 'mobile-first' }}>
      <MobileFirstInvestmentFunds
        view="operation"
        instrument="pac"
        action="advance"
        onNavigate={vi.fn()}
        onClose={vi.fn()}
      />
    </DemoProvider>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
  fireEvent.change(screen.getByLabelText('Importo rata'), { target: { value: '0' } })
  fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
  expect(screen.getByRole('alert')).toHaveTextContent('maggiore di zero')
  initial.unmount()
  render(
    <DemoProvider initialState={{ country: 'IT', designSystem: 'mobile-first' }}>
      <MobileFirstInvestmentFunds
        view="operation"
        instrument="pic"
        action="subscribe"
        onNavigate={vi.fn()}
        onClose={vi.fn()}
      />
    </DemoProvider>,
  )
  for (let index = 0; index < 2; index++) fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
  fireEvent.change(screen.getByLabelText('Inserisci l’importo'), { target: { value: '5000' } })
  fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
  expect(screen.getByRole('alert')).toHaveTextContent('non risulta disponibile')
  fireEvent.click(screen.getByRole('button', { name: 'Annulla' }))
  expect(screen.getByLabelText('Inserisci l’importo')).toHaveValue(5000)
})

it('rejects an incorrect six-digit Mobile Code before persisting a PAC lifecycle change', () => {
  show('fund', 'pac')
  fireEvent.click(screen.getByRole('button', { name: 'Operazioni' }))
  fireEvent.click(screen.getByRole('button', { name: 'Sospensione PAC' }))
  for (let index = 0; index < 12 && !screen.queryByLabelText('Mobile Code'); index++) {
    screen.queryAllByRole('checkbox').forEach((input) => fireEvent.click(input))
    fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
  }
  fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '999999' } })
  fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
  expect(screen.getByRole('alert')).toHaveTextContent('non corretto')
  expect(readFundsState()).toBeUndefined()
  fireEvent.change(screen.getByLabelText('Mobile Code'), { target: { value: '123456' } })
  fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
  expect(readFundsState()?.pacStatus).toBe('suspended')
})

it('masks chart scale and min/max NAV values with global amount privacy', () => {
  const { container } = show('sheet', 'pic', true)
  for (const amount of ['6.843,35$', '5.265,00$', '4.126,30$', '4.080,00$', '5,89 $', '6,03 $', '4,75'])
    expect(container).not.toHaveTextContent(amount)
  expect(screen.getAllByText('••••').length).toBeGreaterThanOrEqual(7)
})
it('applies the distribution filter instead of retaining distributing offers in Accumulo results', () => {
  show('search')
  expect(screen.getByRole('button', { name: /Amundi Elite Multi Asset Flexible-Dis/ })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Ricerca avanzata' }))
  fireEvent.change(screen.getByLabelText('Distribuzione proventi'), { target: { value: 'Accumulo' } })
  expect(screen.queryByRole('button', { name: /Amundi Elite Multi Asset Flexible-Dis/ })).not.toBeInTheDocument()
  fireEvent.change(screen.getByLabelText('Distribuzione proventi'), { target: { value: 'Distribuzione' } })
  expect(screen.getByRole('button', { name: /Amundi Elite Multi Asset Flexible-Dis/ })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /PICTET GLOBAL FUNDS/ })).not.toBeInTheDocument()
})

it('stores savings parameters and service statuses independently for two eligible funds', () => {
  const first = show('savings-plan', 'allianz')
  fireEvent.click(screen.getAllByRole('button', { name: 'Aderisci' })[0]!)
  fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
  fireEvent.change(screen.getByLabelText('Giacenza media'), { target: { value: '5000' } })
  fireEvent.change(screen.getByLabelText('Soglia di investimento'), { target: { value: '6500' } })
  expect(screen.getByLabelText('Giacenza media')).toHaveValue(5000)
  signOperation()
  expect(readFundsState()?.contracts?.allianz?.savings.average).toBe(5000)
  first.unmount()
  const second = show('savings-plan', 'aggregate')
  expect(screen.queryByRole('tab', { name: 'Servizio attivo' })).not.toBeInTheDocument()
  fireEvent.click(screen.getAllByRole('button', { name: 'Aderisci' })[1]!)
  signOperation()
  fireEvent.click(screen.getByRole('button', { name: 'Torna al servizio' }))
  fireEvent.click(screen.getByRole('button', { name: 'Sospensione' }))
  signOperation()
  second.unmount()
  show('savings-plan', 'allianz')
  fireEvent.click(screen.getByRole('tab', { name: 'Servizio attivo' }))
  expect(screen.getByText('Attivo')).toBeInTheDocument()
  expect(readFundsState()?.contracts?.allianz?.savings.average).toBe(5000)
  expect(readFundsState()?.contracts?.allianz?.savingsStatus).toBe('active')
  expect(readFundsState()?.contracts?.aggregate?.savings.average).toBe(4000)
  expect(readFundsState()?.contracts?.aggregate?.savingsStatus).toBe('suspended')
})

it('clears document acknowledgements when editing an operation after going back', () => {
  show('fund')
  fireEvent.click(screen.getByRole('button', { name: 'Operazioni' }))
  fireEvent.click(screen.getByRole('button', { name: 'Rimborso fondo' }))
  fireEvent.change(screen.getByLabelText('Quote'), { target: { value: '3' } })
  for (let index = 0; index < 2; index++) fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
  screen.getAllByRole('checkbox').forEach((input) => fireEvent.click(input))
  expect(screen.getByRole('button', { name: 'Prosegui' })).not.toBeDisabled()
  for (let index = 0; index < 2; index++) fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
  fireEvent.change(screen.getByLabelText('Quote'), { target: { value: '4' } })
  for (let index = 0; index < 2; index++) fireEvent.click(screen.getByRole('button', { name: 'Prosegui' }))
  expect(screen.getByRole('button', { name: 'Prosegui' })).toBeDisabled()
  expect(screen.getAllByRole('checkbox').every((item) => !(item as HTMLInputElement).checked)).toBe(true)
})
