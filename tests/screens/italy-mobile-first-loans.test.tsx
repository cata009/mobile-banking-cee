// @vitest-environment jsdom
import { buildLoanPortfolio, loanInstallments } from '@/features/credit/mobileFirstLoans'
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DemoProvider, DEFAULT_PRODUCT_COUNTS } from '@/app/state/demoStore'
import MobileFirstLoans, { MobileFirstLoansPanel } from '@/experiences/pi/it/mobile-first/MobileFirstLoans'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
beforeEach(() => localStorage.clear())

function renderLoans(
  view: 'detail' | 'list' | 'simulations' = 'detail',
  hidden = false,
  id = 'mortgage-milano',
  counts = { mortgages: 3, loans: 4 },
) {
  return render(
    <DemoProvider
      initialState={{
        product: 'PI',
        country: 'IT',
        designSystem: 'mobile-first',
        amountsHidden: hidden,
        productCounts: { ...DEFAULT_PRODUCT_COUNTS, ...counts },
      }}
    >
      <MobileFirstLoans initialView={view} initialLoanId={id} onClose={vi.fn()} />
    </DemoProvider>,
  )
}

describe('Italy Mutui e Prestiti journeys', () => {
  it('keeps the selected mortgage when navigating help to its information', () => {
    renderLoans('detail', false, 'mortgage-shop')
    fireEvent.click(screen.getByRole('button', { name: 'Info mutuo' }))
    fireEvent.click(screen.getByRole('button', { name: 'Aiuto' }))
    fireEvent.click(screen.getByRole('button', { name: 'Info Mutuo' }))
    expect(screen.getByRole('heading', { name: 'Negozio Mutuo' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Chiudi dettaglio' }))
    expect(screen.getByRole('button', { name: 'Prossima rata N°1' })).toHaveTextContent(
      loanInstallments(
        2025,
        buildLoanPortfolio({ mortgages: 3, loans: 0 }).find((loan) => loan.id === 'mortgage-shop'),
      )[0]!.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 }) + ' €',
    )
  })
  it('switches the second loan directly when exactly two personal loans are configured', () => {
    renderLoans('detail', false, 'loan-auto', { mortgages: 0, loans: 2 })
    fireEvent.click(screen.getByRole('button', { name: 'Altro prestito' }))
    expect(screen.getByRole('heading', { name: 'Prestito Dentista' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Tutti i mutui e prestiti' })).not.toBeInTheDocument()
  })
  it('opens the selected credit, installment and information without leaving its context', () => {
    renderLoans()
    expect(screen.getByRole('heading', { name: 'Mutuo Casa Milano' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Rata N°1' }))
    expect(screen.getByRole('heading', { name: 'Rata N° 1' })).toBeVisible()
    expect(screen.getByText('Quota capitale')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Chiudi dettaglio' }))
    fireEvent.click(screen.getByRole('button', { name: 'Info mutuo' }))
    expect(screen.getByText('Data di erogazione')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'MODIFICA NOME' }))
    fireEvent.change(screen.getByLabelText('Nome Mutuo'), { target: { value: 'Casa Roma' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salva modifica' }))
    expect(screen.getByRole('heading', { name: 'Casa Roma' })).toBeVisible()
  })
  it('changes years and uses the selected year in installment dates', () => {
    renderLoans()
    fireEvent.click(screen.getByRole('button', { name: '2027' }))
    fireEvent.click(screen.getByRole('button', { name: 'Rata N°25' }))
    expect(screen.getByText('15/02/2027')).toBeVisible()
  })
  it('edits favorite order and keeps the changes when the view is reopened', () => {
    renderLoans('list')
    fireEvent.click(screen.getByRole('button', { name: 'PERSONALIZZA VISTA' }))
    fireEvent.click(screen.getByRole('button', { name: 'Sposta su Prestito Auto' }))
    fireEvent.click(screen.getByRole('button', { name: 'Salva modifica' }))
    const favorites = screen.getByRole('region', { name: 'Preferiti' })
    expect(within(favorites).getAllByRole('button')[0]).toHaveTextContent('Prestito Auto')
    cleanup()
    renderLoans('list')
    expect(within(screen.getByRole('region', { name: 'Preferiti' })).getAllByRole('button')[0]).toHaveTextContent(
      'Prestito Auto',
    )
  })
  it('respects privacy on detail, installment and information pages', () => {
    const { container } = renderLoans('detail', true, 'loan-auto')
    expect(container).not.toHaveTextContent('27.579')
    expect(container).not.toHaveTextContent('7654321')
    fireEvent.click(screen.getByRole('button', { name: 'Rata N°1' }))
    expect(container).not.toHaveTextContent('280,50')
    expect(container).toHaveTextContent('••••')
  })
  it.each([
    { hidden: false, storageFailure: false },
    { hidden: true, storageFailure: false },
    { hidden: false, storageFailure: true },
  ])(
    'completes calculation/save with privacy=$hidden and storage failure=$storageFailure',
    ({ hidden, storageFailure }) => {
      renderLoans('simulations', hidden)
      fireEvent.click(screen.getByRole('button', { name: 'Nuova simulazione' }))
      fireEvent.click(screen.getByRole('button', { name: 'Calcola la rata' }))
      expect(screen.getByRole('button', { name: 'Avanti' })).toBeDisabled()
      fireEvent.click(screen.getByRole('button', { name: 'Acquisto' }))
      fireEvent.click(screen.getByRole('button', { name: 'Avanti' }))
      fireEvent.click(screen.getByRole('button', { name: 'Sì' }))
      fireEvent.click(screen.getByRole('button', { name: 'Avanti' }))
      fireEvent.change(screen.getByLabelText('Importo dell’immobile'), { target: { value: '165000' } })
      fireEvent.click(screen.getByRole('button', { name: 'Avanti' }))
      fireEvent.change(screen.getByLabelText('Importo richiesto'), { target: { value: '80000' } })
      fireEvent.click(screen.getByRole('button', { name: 'Avanti' }))
      fireEvent.change(screen.getByLabelText('Data di nascita'), { target: { value: '1998-06-28' } })
      fireEvent.click(screen.getByRole('button', { name: 'Avanti' }))
      fireEvent.change(screen.getByLabelText('Durata in anni'), { target: { value: '30' } })
      fireEvent.click(screen.getByRole('button', { name: 'Avanti' }))
      expect(screen.getByLabelText('Rata Fisso')).toHaveTextContent(hidden ? '••••' : '357,01 €')
      if (hidden) {
        expect(screen.getByLabelText('Importo richiesto')).toHaveAttribute('type', 'password')
        fireEvent.change(screen.getByLabelText('Importo richiesto'), { target: { value: '1e309' } })
        expect(screen.getByRole('button', { name: 'Salva' })).toBeDisabled()
        expect(screen.getByRole('alert')).toBeVisible()
      }
      fireEvent.change(screen.getByLabelText('Importo richiesto'), { target: { value: '' } })
      expect(screen.getByRole('button', { name: 'Salva' })).toBeDisabled()
      expect(screen.getByRole('alert')).toBeVisible()
      fireEvent.change(screen.getByLabelText('Importo richiesto'), { target: { value: '80000' } })
      fireEvent.click(screen.getByRole('button', { name: 'Salva' }))
      const save = screen.getByRole('dialog', { name: 'Salva nell’area privata' })
      fireEvent.change(within(save).getByLabelText('Nome simulazione'), { target: { value: 'La mia casa' } })
      if (storageFailure)
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
          throw new Error('Quota exceeded')
        })
      fireEvent.click(within(save).getByRole('button', { name: 'Salva' }))
      if (storageFailure) {
        expect(screen.getByText('Qualcosa è andato storto')).toBeVisible()
        fireEvent.click(screen.getByRole('button', { name: 'Riprova' }))
        vi.restoreAllMocks()
        fireEvent.click(screen.getByRole('button', { name: 'Salva' }))
        fireEvent.click(
          within(screen.getByRole('dialog', { name: 'Salva nell’area privata' })).getByRole('button', {
            name: 'Salva',
          }),
        )
      }
      expect(screen.getByText('La tua simulazione è stata salvata nella tua area personale.')).toBeVisible()
      fireEvent.click(screen.getByRole('button', { name: 'Chiudi' }))
      expect(screen.getByText('La mia casa')).toBeVisible()
      fireEvent.click(screen.getByRole('button', { name: 'Dettaglio La mia casa' }))
      expect(screen.getByText('Parametri simulazione:')).toBeVisible()
      cleanup()
      renderLoans('simulations', hidden)
      expect(screen.getByText('La mia casa')).toBeVisible()
    },
  )
  it('explains invalid form amounts instead of only disabling the next action', () => {
    renderLoans('simulations')
    fireEvent.click(screen.getByRole('button', { name: 'Nuova simulazione' }))
    fireEvent.click(screen.getByRole('button', { name: 'Calcola la rata' }))
    fireEvent.click(screen.getByRole('button', { name: 'Acquisto' }))
    fireEvent.click(screen.getByRole('button', { name: 'Avanti' }))
    fireEvent.click(screen.getByRole('button', { name: 'Sì' }))
    fireEvent.click(screen.getByRole('button', { name: 'Avanti' }))
    fireEvent.change(screen.getByLabelText('Importo dell’immobile'), { target: { value: '100000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Avanti' }))
    fireEvent.change(screen.getByLabelText('Importo richiesto'), { target: { value: '100001' } })
    expect(screen.getByRole('button', { name: 'Avanti' })).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent('non superare il valore dell’immobile')
    expect(screen.getByLabelText('Importo richiesto')).toHaveAttribute('aria-invalid', 'true')
  })
  it('renders the empty homepage product mix with a working simulation entry', () => {
    const onOpen = vi.fn()
    render(
      <DemoProvider
        initialState={{
          product: 'PI',
          country: 'IT',
          designSystem: 'mobile-first',
          productCounts: { ...DEFAULT_PRODUCT_COUNTS, mortgages: 0, loans: 0 },
        }}
      >
        <div className="mf-home">
          <MobileFirstLoansPanel onOpen={onOpen} />
        </div>
      </DemoProvider>,
    )
    expect(screen.queryByRole('button', { name: 'Apri Mutuo Casa Milano' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Simulazione mutuo' }))
    expect(onOpen).toHaveBeenCalledWith(undefined, 'simulations')
  })
})
