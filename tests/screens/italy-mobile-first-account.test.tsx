// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { useState } from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  resetItalyFinancialState,
  getItalyFinancialSnapshot,
  selectAccountBalance,
} from '@/features/finance/italyFinancials'
import { DemoProvider, DEFAULT_DEMO_STATE } from '@/app/state/demoStore'
import MobileFirstAccount from '@/experiences/pi/it/mobile-first/MobileFirstAccount'

afterEach(cleanup)
beforeEach(resetItalyFinancialState)
const formattedBalance = (number: string, field: 'balance' | 'bookBalance' = 'balance') =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })
    .format(selectAccountBalance(getItalyFinancialSnapshot(), number)[field])
    .replace(/\u00a0/g, ' ')

const account = { name: 'Andrea Rossini e Flavia Bianchini', number: '000067890', balance: 53550.27 }

function Harness() {
  const [open, setOpen] = useState(true)
  return open ? <MobileFirstAccount account={account} onClose={() => setOpen(false)} /> : <p>Homepage italiana</p>
}

function renderAccount(amountsHidden = false) {
  return render(
    <DemoProvider
      initialState={{
        product: 'PI',
        country: 'IT',
        designSystem: 'mobile-first',
        amountsHidden,
        productCounts: { ...DEFAULT_DEMO_STATE.productCounts, accounts: 3 },
      }}
    >
      <Harness />
    </DemoProvider>,
  )
}

describe('Italy Mobile First account detail', () => {
  it('preserves the selected account identity and cents on its native account page', () => {
    renderAccount()
    const page = screen.getByRole('main', { name: 'Dettaglio conto' })
    expect(within(page).getByRole('heading', { name: 'Andrea Rossini e Flavia Bianchini' })).toBeVisible()
    expect(within(page).getByText('000067890 - UniCredit')).toBeVisible()
    expect(within(page).getByLabelText('Saldo disponibile')).toHaveTextContent(formattedBalance(account.number))
    expect(within(page).getByLabelText('Saldo contabile')).toHaveTextContent(
      formattedBalance(account.number, 'bookBalance'),
    )
    expect(within(page).getByText('+2.000')).toBeVisible()
    expect(within(page).queryByText('Spotify')).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('allows switching the selected account from Tutti i conti and returning to Conto', () => {
    renderAccount()
    fireEvent.click(screen.getByRole('tab', { name: 'Tutti i conti' }))
    const selector = screen.getByRole('dialog', { name: 'Tutti i conti' })
    fireEvent.click(within(selector).getByRole('button', { name: 'Andrea Rossini 000012345' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Andrea Rossini' })).toBeVisible()
    expect(screen.getByLabelText('Saldo disponibile')).toHaveTextContent(formattedBalance('000012345'))
    expect(screen.getByRole('tab', { name: 'Tutti i conti' })).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(screen.getByRole('tab', { name: 'Conto' }))
    expect(screen.getByRole('heading', { name: 'Andrea Rossini e Flavia Bianchini' })).toBeVisible()
    expect(screen.getByRole('tab', { name: 'Conto' })).toHaveAttribute('aria-selected', 'true')
  })

  it('filters real account transactions and restores them when the search is cleared', () => {
    renderAccount()
    fireEvent.click(screen.getByRole('button', { name: 'Cerca movimenti' }))
    const search = screen.getByRole('searchbox', { name: 'Cerca movimenti' })
    fireEvent.change(search, { target: { value: 'imposta' } })
    expect(screen.getAllByText('Imposta di bollo')).toHaveLength(1)
    expect(screen.queryByText('Premio assicurativo')).not.toBeInTheDocument()
    fireEvent.change(search, { target: { value: '' } })
    expect(screen.getByText('Premio assicurativo')).toBeVisible()
  })

  it('masks amounts with the Figma grouping while keeping account identifiers visible', () => {
    renderAccount(true)
    expect(screen.queryByText('53.550')).not.toBeInTheDocument()
    expect(screen.getByText('000067890 - UniCredit')).toBeVisible()
    expect(screen.getByLabelText('Saldo disponibile')).toHaveTextContent('**.***,** €')
    expect(screen.getByLabelText('Saldo contabile')).toHaveTextContent('**.***,** €')
    expect(screen.queryByText('-120')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Profilo' }))
    const profile = screen.getByRole('dialog', { name: 'Profilo' })
    fireEvent.click(within(profile).getByRole('button', { name: 'Mostra importi' }))
    fireEvent.click(within(profile).getByRole('button', { name: 'Chiudi' }))
    expect(screen.getByLabelText('Saldo disponibile')).toHaveTextContent(formattedBalance(account.number))
    expect(screen.getByText('-120')).toBeVisible()
    expect(screen.getByText('000067890 - UniCredit')).toBeVisible()
  })

  it('opens the account operations independently of the scroll surface and dismisses the sheet', () => {
    const { container } = renderAccount()
    const operations = screen.getByRole('button', { name: 'Operazioni' })
    expect(container.querySelector('[data-mobile-first-account-scroll]')).not.toContainElement(operations)
    fireEvent.click(operations)
    const sheet = screen.getByRole('dialog', { name: 'Operazioni' })
    expect(within(sheet).getByRole('button', { name: 'Bonifico' })).toBeVisible()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('main', { name: 'Dettaglio conto' })).toBeVisible()
  })

  it('returns to the homepage from the account back control', () => {
    renderAccount()
    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
    expect(screen.getByText('Homepage italiana')).toBeVisible()
    expect(screen.queryByRole('main', { name: 'Dettaglio conto' })).not.toBeInTheDocument()
  })

  it('opens the supplied Italy operations screen when the composition provides it', () => {
    function OperationsHarness() {
      const [operations, setOperations] = useState(false)
      return operations ? (
        <p>Operazioni italiane</p>
      ) : (
        <MobileFirstAccount account={account} onClose={() => {}} onOperations={() => setOperations(true)} />
      )
    }
    render(
      <DemoProvider initialState={{ product: 'PI', country: 'IT', designSystem: 'mobile-first' }}>
        <OperationsHarness />
      </DemoProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Operazioni' }))
    expect(screen.getByText('Operazioni italiane')).toBeVisible()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('keeps account identity and transaction search available in the compact scrolled header', () => {
    renderAccount()
    fireEvent.scroll(screen.getByRole('region', { name: 'Conto e movimenti' }), { target: { scrollTop: 410 } })
    const summary = screen.getByRole('region', { name: 'Riepilogo conto' })
    expect(within(summary).getByText('Andrea Rossini e Flavia Bianchini')).toBeVisible()
    expect(summary).toHaveTextContent(formattedBalance(account.number))
    fireEvent.click(within(summary).getByRole('button', { name: 'Cerca movimenti' }))
    const input = within(summary).getByRole('searchbox', { name: 'Cerca movimenti' })
    fireEvent.change(input, { target: { value: 'imposta' } })
    fireEvent.scroll(screen.getByRole('region', { name: 'Conto e movimenti' }), { target: { scrollTop: 0 } })
    expect(screen.getByRole('region', { name: 'Riepilogo conto' })).toBeVisible()
    expect(screen.queryByText('Netflix')).not.toBeInTheDocument()
    expect(screen.getByText('Imposta di bollo')).toBeVisible()
  })
})
