// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { DemoProvider } from '@/app/state/demoStore'
import MobileFirstCategoryPanel from '@/experiences/pi/it/mobile-first/MobileFirstCategoryPanel'
import type { ItalyCard } from '@/experiences/pi/it/mobile-first/cardsContent'

afterEach(cleanup)

function renderCategory(
  category: string,
  amountsHidden = false,
  bridges: {
    onOpenCard?: (cardId: string, view: 'hub' | 'detail' | 'pin') => void
    onOpenLoans?: (loanId?: string, view?: 'detail' | 'list' | 'simulations') => void
    loansPanel?: ReactNode
    homepageCards?: readonly ItalyCard[]
  } = {},
) {
  const onOpen = vi.fn()
  const view = render(
    <DemoProvider initialState={{ product: 'PI', country: 'IT', designSystem: 'mobile-first', amountsHidden }}>
      <div className="mf-home">
        <MobileFirstCategoryPanel category={category} onOpen={onOpen} {...bridges} />
      </div>
    </DemoProvider>,
  )
  return { ...view, onOpen }
}

describe('Italian Mobile First product tabs', () => {
  const selectedCards: readonly ItalyCard[] = [
    {
      id: 'debit-custom',
      name: 'Carta quotidiana',
      holder: 'Giulia Rossi',
      nickname: 'Spese di casa',
      lastFour: '2468',
      kind: 'debit',
      status: 'active',
      spending: 1234.56,
      available: 2000,
      limit: 3000,
      favorite: false,
      owner: 'mine',
      expiry: '04/2029',
    },
    {
      id: 'credit-custom',
      name: 'Carta viaggi',
      holder: 'Luca Rossi',
      lastFour: '1357',
      kind: 'credit',
      status: 'blocked',
      spending: 987,
      available: 2000,
      limit: 3000,
      favorite: false,
      owner: 'mine',
      expiry: '05/2029',
    },
  ]

  it('renders the supplied card selection in order with snapshot labels and spending', () => {
    const { container } = renderCategory('Carte', false, { homepageCards: selectedCards })
    const tiles = screen.getAllByRole('article')
    expect(tiles).toHaveLength(2)
    expect(tiles[0]).toHaveAccessibleName('Carta quotidiana')
    expect(tiles[1]).toHaveAccessibleName('Carta viaggi')
    expect(within(tiles[0]!).getByText('Spese di casa')).toBeInTheDocument()
    expect(within(tiles[0]!).getByText('**** 2468')).toBeInTheDocument()
    expect(within(tiles[0]!).getByText('1.234')).toBeInTheDocument()
    expect(within(tiles[0]!).getByText(',56 €')).toBeInTheDocument()
    expect(tiles[0]).toHaveClass('mf-product-payment-card-debit')
    expect(within(tiles[1]!).getByText('Luca Rossi')).toBeInTheDocument()
    expect(within(tiles[1]!).getByText('987')).toBeInTheDocument()
    expect(within(tiles[1]!).getByText(',00 €')).toBeInTheDocument()
    expect(tiles[1]).not.toHaveClass('mf-product-payment-card-debit')
    expect(container).not.toHaveTextContent('6.534')
  })

  it.each([
    ['Apri carta Carta quotidiana', 'debit-custom', 'detail'],
    ['PIN Carta quotidiana', 'debit-custom', 'pin'],
    ['Apri carta Carta viaggi', 'credit-custom', 'detail'],
    ['PIN Carta viaggi', 'credit-custom', 'pin'],
    ['TUTTE LE CARTE', 'debit-custom', 'hub'],
  ])('uses the supplied record ID when opening %s', (button, cardId, view) => {
    const onOpenCard = vi.fn()
    const { onOpen } = renderCategory('Carte', false, { homepageCards: selectedCards, onOpenCard })
    fireEvent.click(screen.getByRole('button', { name: button }))
    expect(onOpenCard).toHaveBeenCalledExactlyOnceWith(cardId, view)
    expect(onOpen).not.toHaveBeenCalled()
  })

  it('keeps the legal holder in the supplied card detail fallback', () => {
    const { onOpen } = renderCategory('Carte', false, { homepageCards: selectedCards })
    fireEvent.click(screen.getByRole('button', { name: 'Apri carta Carta quotidiana' }))
    expect(onOpen).toHaveBeenCalledExactlyOnceWith('Carta quotidiana', expect.anything())
    render(<>{onOpen.mock.calls[0]![1]}</>)
    expect(screen.getByText('Giulia Rossi')).toBeInTheDocument()
    expect(screen.getAllByText('**** 2468')).toHaveLength(2)
    expect(screen.getAllByText(',56 €')).toHaveLength(2)
  })

  it('renders no owned cards for an empty selection while retaining marketing and hub navigation', () => {
    const onOpenCard = vi.fn()
    const { onOpen } = renderCategory('Carte', false, { homepageCards: [], onOpenCard })
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Le nostre carte' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'UniCreditCard Flexia Classic' }))
    expect(onOpen).toHaveBeenCalledExactlyOnceWith(
      'UniCreditCard Flexia Classic',
      'Per i piccoli e grandi acquisti di tutti i giorni',
    )
    fireEvent.click(screen.getByRole('button', { name: 'TUTTE LE CARTE' }))
    expect(onOpenCard).toHaveBeenCalledExactlyOnceWith('flexia', 'hub')
  })

  it('masks card spending with Figma asterisks while retaining its decimal and currency fields', () => {
    renderCategory('Carte', true, { homepageCards: selectedCards })
    for (const tile of screen.getAllByRole('article')) {
      expect(within(tile).getByText('**.***')).toBeInTheDocument()
      expect(within(tile).getByText(',** €')).toBeInTheDocument()
      expect(tile).not.toHaveTextContent('1.234')
      expect(tile).not.toHaveTextContent('987')
      expect(tile).not.toHaveTextContent('2468')
    }
  })

  it('renders the two original cards and their category-specific commercial products', () => {
    renderCategory('Carte')
    expect(screen.getByRole('button', { name: 'Apri carta UniCredit Flexia Classic' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Apri carta UniCredit My One' })).toBeInTheDocument()
    expect(screen.getAllByText('6.534')).toHaveLength(2)
    expect(screen.getAllByText('**** 5678')).toHaveLength(2)
    expect(screen.getByRole('heading', { name: 'Le nostre carte' })).toBeInTheDocument()
    expect(screen.getByText('La carta amica dell’ambiente')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'TUTTE LE CARTE' })).toBeInTheDocument()
    expect(screen.queryByText('Scopri i prodotti UniCredit per te.')).not.toBeInTheDocument()
  })

  it('renders the mortgage and loan with the original outstanding capital date', () => {
    renderCategory('Mutui e Prestiti')
    expect(screen.getByRole('button', { name: 'Apri Mutuo Casa Milano' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Apri Prestito Auto' })).toBeInTheDocument()
    expect(screen.getAllByText('27.579')).toHaveLength(2)
    expect(screen.getAllByText('Capitale residuo al 31/01/2026')).toHaveLength(2)
    expect(screen.getByRole('heading', { name: 'I nostri mutui e prestiti' })).toBeInTheDocument()
    expect(screen.getByText('Mutuo UniCredit Sostenibilità Energetica')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'TUTTI I MUTUI E PRESTITI' })).toBeInTheDocument()
  })

  it('renders both insurance policies, preserving the first policy status', () => {
    renderCategory('Polizze assicurative')
    expect(screen.getByRole('button', { name: 'Apri polizza UniCredit My Care Famiglia' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Apri polizza UniCredit My Care Salute' })).toBeInTheDocument()
    expect(screen.getAllByText('Numero polizza 10')).toHaveLength(2)
    expect(screen.getAllByText('Attiva dal 23/05/2024')).toHaveLength(2)
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Le nostre polizze' })).toBeInTheDocument()
    expect(screen.getByText('Vivi la tua famiglia al sicuro')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'TUTTE LE POLIZZE' })).toBeInTheDocument()
  })

  it.each(['Carte', 'Mutui e Prestiti', 'Polizze assicurative'])('respects the privacy setting for %s', (category) => {
    const { container } = renderCategory(category, true)
    expect(container).not.toHaveTextContent('6.534')
    expect(container).not.toHaveTextContent('27.579')
    expect(container).not.toHaveTextContent('5678')
    expect(container).not.toHaveTextContent('Numero polizza 10')
    expect(container).toHaveTextContent('••••')
  })

  it.each([
    ['Carte', 'Apri carta UniCredit Flexia Classic', 'UniCredit Flexia Classic'],
    ['Mutui e Prestiti', 'Apri Mutuo Casa Milano', 'Mutuo Casa Milano'],
    ['Polizze assicurative', 'Apri polizza UniCredit My Care Famiglia', 'UniCredit My Care Famiglia'],
  ])('opens the selected %s product within the provided sheet handler', (category, button, title) => {
    const { onOpen } = renderCategory(category)
    fireEvent.click(screen.getByRole('button', { name: button }))
    expect(onOpen).toHaveBeenCalledWith(title, expect.anything())
  })

  it('opens the card PIN affordance and the original promotional product', () => {
    const { onOpen } = renderCategory('Carte')
    fireEvent.click(screen.getByRole('button', { name: 'PIN UniCredit My One' }))
    expect(onOpen).toHaveBeenLastCalledWith('PIN · UniCredit My One', expect.anything())
    fireEvent.click(screen.getByRole('button', { name: 'UniCreditCard Flexia Classic' }))
    expect(onOpen).toHaveBeenLastCalledWith(
      'UniCreditCard Flexia Classic',
      'Per i piccoli e grandi acquisti di tutti i giorni',
    )
  })

  it.each([
    ['Apri carta UniCredit Flexia Classic', 'flexia', 'detail'],
    ['Apri carta UniCredit My One', 'my-one', 'detail'],
    ['PIN UniCredit Flexia Classic', 'flexia', 'pin'],
    ['PIN UniCredit My One', 'my-one', 'pin'],
    ['TUTTE LE CARTE', 'flexia', 'hub'],
  ])('opens %s through the card navigation bridge', (button, cardId, view) => {
    const onOpenCard = vi.fn()
    const { onOpen } = renderCategory('Carte', false, { onOpenCard })
    fireEvent.click(screen.getByRole('button', { name: button }))
    expect(onOpenCard).toHaveBeenCalledExactlyOnceWith(cardId, view)
    expect(onOpen).not.toHaveBeenCalled()
  })

  it('keeps card marketing products on the sheet handler when the card bridge is provided', () => {
    const onOpenCard = vi.fn()
    const { onOpen } = renderCategory('Carte', false, { onOpenCard })
    fireEvent.click(screen.getByRole('button', { name: 'UniCreditCard Flexia Classic' }))
    expect(onOpen).toHaveBeenCalledExactlyOnceWith(
      'UniCreditCard Flexia Classic',
      'Per i piccoli e grandi acquisti di tutti i giorni',
    )
    expect(onOpenCard).not.toHaveBeenCalled()
  })

  it.each([
    ['Apri Mutuo Casa Milano', 'mortgage-milano', 'detail'],
    ['Apri Prestito Auto', 'loan-auto', 'detail'],
    ['TUTTI I MUTUI E PRESTITI', undefined, 'list'],
  ])('opens %s through the loan navigation bridge', (button, loanId, view) => {
    const onOpenLoans = vi.fn()
    const { onOpen } = renderCategory('Mutui e Prestiti', false, { onOpenLoans })
    fireEvent.click(screen.getByRole('button', { name: button }))
    expect(onOpenLoans).toHaveBeenCalledExactlyOnceWith(loanId, view)
    expect(onOpen).not.toHaveBeenCalled()
  })

  it.each([
    ['Carte', 'TUTTE LE CARTE'],
    ['Mutui e Prestiti', 'TUTTI I MUTUI E PRESTITI'],
  ])('preserves the aggregate %s sheet fallback without a navigation bridge', (category, button) => {
    const { onOpen } = renderCategory(category)
    fireEvent.click(screen.getByRole('button', { name: button }))
    expect(onOpen).toHaveBeenCalledExactlyOnceWith(button, expect.anything())
  })

  it('uses the supplied loan panel as the whole loan category body', () => {
    renderCategory('Mutui e Prestiti', false, {
      loansPanel: <section aria-label="Scenario loans">No loans yet</section>,
    })
    expect(screen.getByRole('region', { name: 'Scenario loans' })).toHaveTextContent('No loans yet')
    expect(screen.queryByRole('button', { name: 'Apri Mutuo Casa Milano' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'TUTTI I MUTUI E PRESTITI' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'I nostri mutui e prestiti' })).not.toBeInTheDocument()
  })

  it.each([
    ['Carte', 'Apri carta UniCredit Flexia Classic'],
    ['Polizze assicurative', 'Apri polizza UniCredit My Care Famiglia'],
  ])('ignores the supplied loan panel for %s', (category, button) => {
    renderCategory(category, false, { loansPanel: <section aria-label="Scenario loans">No loans yet</section> })
    expect(screen.queryByRole('region', { name: 'Scenario loans' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: button })).toBeInTheDocument()
  })
})
