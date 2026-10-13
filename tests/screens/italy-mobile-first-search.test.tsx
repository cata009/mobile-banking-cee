// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DemoProvider } from '@/app/state/demoStore'
import MobileFirstSearch from '@/experiences/pi/it/mobile-first/MobileFirstSearch'
import type { SearchEntry } from '@/features/search/mobileFirstSearch'
import { useState } from 'react'

afterEach(cleanup)

const entries: readonly SearchEntry[] = [
  {
    id: 'account',
    category: 'accounts',
    title: 'Conto UniCredit',
    subtitle: 'Andrea · 000012345',
    target: { kind: 'account', accountNumber: '000012345' },
  },
  {
    id: 'card',
    category: 'cards',
    title: 'Carta UniCredit',
    subtitle: 'Flexia · •••• 1234',
    target: { kind: 'card', cardId: 'flexia' },
  },
  {
    id: 'payment',
    category: 'payments',
    title: 'Bonifico UniCredit',
    subtitle: 'Invia denaro',
    target: { kind: 'payment', label: 'Bonifico' },
  },
  ...['Supermercato', 'Ristorante', 'Abbonamento', 'Libreria'].map<SearchEntry>((title, index) => ({
    id: `movement-${index}`,
    category: 'movements',
    title,
    subtitle: 'Conto UniCredit · 12 ottobre',
    amount: -25.5,
    currency: 'EUR',
    target: { kind: 'account', accountNumber: '000012345', movementId: `m${index}` },
  })),
]

function renderSearch(
  options: {
    hidden?: boolean
    initialQuery?: string
    onSelect?: (entry: (typeof entries)[number]) => void
    onQueryChange?: (query: string) => void
  } = {},
) {
  return render(
    <DemoProvider
      initialState={{
        product: 'PI',
        country: 'IT',
        designSystem: 'mobile-first',
        amountsHidden: options.hidden ?? false,
      }}
    >
      <MobileFirstSearch
        onClose={() => undefined}
        entries={entries}
        initialQuery={options.initialQuery}
        onSelect={options.onSelect}
        onQueryChange={options.onQueryChange}
      />
    </DemoProvider>,
  )
}

describe('Italy Mobile First global search results', () => {
  it('keeps products searchable and navigable after removing the initial product recommendations', () => {
    const product: SearchEntry = {
      id: 'product-conti',
      category: 'products',
      title: 'Conti',
      subtitle: 'Prodotti e servizi',
      target: { kind: 'category', category: 'Conti' },
    }
    const selected = vi.fn()
    render(
      <DemoProvider initialState={{ product: 'PI', country: 'IT', designSystem: 'mobile-first' }}>
        <MobileFirstSearch entries={[product]} onClose={() => undefined} onSelect={selected} />
      </DemoProvider>,
    )
    expect(screen.queryByText('Prodotti per te')).not.toBeInTheDocument()
    expect(screen.queryByText('Prodotti e servizi')).not.toBeInTheDocument()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'conti' } })
    fireEvent.click(screen.getByRole('button', { name: 'Conti Prodotti e servizi' }))
    expect(selected).toHaveBeenCalledWith(product)
  })
  it('smoothly centers the selected category without moving input focus', () => {
    renderSearch({ initialQuery: 'unicredit' })
    const rail = screen.getByRole('tablist', { name: 'Categorie di ricerca' })
    const target = screen.getByRole('tab', { name: 'Movimenti 4' })
    const scrollTo = vi.fn()
    Object.defineProperties(rail, {
      clientWidth: { configurable: true, value: 300 },
      scrollWidth: { configurable: true, value: 950 },
      scrollTo: { configurable: true, value: scrollTo },
    })
    Object.defineProperties(target, {
      offsetLeft: { configurable: true, value: 300 },
      offsetWidth: { configurable: true, value: 80 },
    })
    fireEvent.pointerDown(target)
    fireEvent.click(target)
    expect(scrollTo).toHaveBeenCalledWith({ left: 190, behavior: 'smooth' })
    expect(screen.getByRole('searchbox')).toHaveFocus()
    expect(screen.getByRole('region', { name: 'Tastiera italiana' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('tab', { name: 'Tutto 7' }))
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: 'smooth' })
  })

  it('releases a physical key animation after the parent saves the query', async () => {
    function Host() {
      const [query, setQuery] = useState('')
      return <MobileFirstSearch onClose={() => undefined} initialQuery={query} onQueryChange={setQuery} />
    }
    render(<Host />)
    const input = screen.getByRole('searchbox')
    fireEvent.keyDown(input, { key: 'a' })
    fireEvent.change(input, { target: { value: 'a' } })
    expect(screen.getByRole('button', { name: 'Tasto a' })).toHaveAttribute('data-pressed', 'true')
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Tasto a' })).not.toHaveAttribute('data-pressed', 'true'),
    )
  })

  it('keeps submitted suggestions dismissed when the parent saves the search query', () => {
    function SavedSearch() {
      const [savedQuery, setSavedQuery] = useState('')
      return (
        <DemoProvider initialState={{ product: 'PI', country: 'IT', designSystem: 'mobile-first' }}>
          <MobileFirstSearch
            entries={entries}
            onClose={() => undefined}
            initialQuery={savedQuery}
            onQueryChange={setSavedQuery}
          />
        </DemoProvider>
      )
    }
    render(<SavedSearch />)
    fireEvent.click(screen.getByRole('button', { name: 'Bonifico' }))
    expect(screen.getByRole('searchbox')).not.toHaveFocus()
    expect(screen.queryByRole('region', { name: 'Tastiera italiana' })).not.toBeInTheDocument()
  })
  it('reports native, software, clear and suggested query changes for return navigation', () => {
    const changes: string[] = []
    renderSearch({ onQueryChange: (query) => changes.push(query) })
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'bo' } })
    fireEvent.click(screen.getByRole('button', { name: 'Tasto n' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancella ricerca' }))
    fireEvent.click(screen.getByRole('button', { name: 'Bonifico' }))
    expect(changes).toEqual(['bo', 'bon', '', 'Bonifico'])
  })
  it('searches while typing and groups matches with live category counts', () => {
    renderSearch()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'unicredit' } })
    expect(screen.getByRole('status')).toHaveTextContent('7 risultati')
    expect(screen.getByRole('tab', { name: 'Movimenti 4' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Conti' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Pagamenti' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Conto UniCredit Andrea/ })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Tastiera italiana' })).toBeInTheDocument()
  })

  it('filters a category without taking focus from the search input', () => {
    renderSearch({ initialQuery: 'unicredit' })
    const input = screen.getByRole('searchbox')
    const filter = screen.getByRole('tab', { name: 'Movimenti 4' })
    expect(fireEvent.pointerDown(filter)).toBe(false)
    fireEvent.click(filter)
    expect(input).toHaveFocus()
    expect(filter).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('4 risultati')
    expect(screen.queryByRole('heading', { name: 'Conti' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Libreria/ })).toBeInTheDocument()
  })

  it('limits grouped results and reveals the complete category with Vedi tutti', () => {
    renderSearch({ initialQuery: 'unicredit' })
    const movements = screen.getByRole('region', { name: 'Movimenti' })
    expect(within(movements).getAllByRole('listitem')).toHaveLength(3)
    expect(screen.queryByRole('button', { name: /Libreria/ })).not.toBeInTheDocument()
    fireEvent.click(within(movements).getByRole('button', { name: 'Vedi tutti i movimenti' }))
    expect(screen.getByRole('button', { name: /Libreria/ })).toBeInTheDocument()
  })

  it('submits the query, dismisses the keyboard and reopens it on focus', () => {
    renderSearch({ initialQuery: 'unicredit' })
    const input = screen.getByRole('searchbox')
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.queryByRole('region', { name: 'Tastiera italiana' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Movimenti' })).toBeInTheDocument()
    fireEvent.focus(input)
    expect(screen.getByRole('region', { name: 'Tastiera italiana' })).toBeInTheDocument()
  })

  it('passes the selected result and its destination to the navigation owner', () => {
    const selected: unknown[] = []
    renderSearch({ initialQuery: 'bonifico', onSelect: (entry) => selected.push(entry) })
    fireEvent.click(screen.getByRole('button', { name: /Bonifico UniCredit Invia/ }))
    expect(selected).toEqual([entries[2]])
  })

  it('disables result actions when no destination handler is available', () => {
    renderSearch({ initialQuery: 'bonifico' })
    expect(screen.getByRole('button', { name: /Bonifico UniCredit Invia/ })).toBeDisabled()
  })

  it('masks result amounts while preserving safe account identifiers', () => {
    renderSearch({ hidden: true, initialQuery: 'unicredit' })
    expect(screen.getByText('Andrea · 000012345')).toBeInTheDocument()
    expect(screen.queryByText(/25,50/)).not.toBeInTheDocument()
    expect(screen.getAllByText('**,** €')).toHaveLength(3)
  })

  it('shows the real amount when privacy is off', () => {
    renderSearch({ initialQuery: 'supermercato' })
    expect(screen.getByText('-25,50 €')).toBeInTheDocument()
  })

  it('uses suggested topics as actual queries and resets filters when cleared', () => {
    renderSearch()
    fireEvent.click(screen.getByRole('button', { name: 'Bonifico' }))
    expect(screen.getByRole('searchbox')).toHaveValue('Bonifico')
    expect(screen.getByRole('heading', { name: 'Pagamenti' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('tab', { name: 'Pagamenti 1' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancella ricerca' }))
    expect(screen.getByRole('searchbox')).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Movimenti' })).toBeInTheDocument()
    expect(screen.queryByText(/Stai interagendo con un sistema di Intelligenza Artificiale/)).not.toBeInTheDocument()
    expect(document.querySelector('.mf-search-disclaimer')).toBeNull()
    expect(screen.queryByText('Cerca nell’app')).not.toBeInTheDocument()
    expect(screen.queryByText('Trova movimenti, prodotti e servizi.')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Argomenti suggeriti' })).not.toBeInTheDocument()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'unicredit' } })
    expect(screen.getByRole('tab', { name: 'Tutto 7' })).toHaveAttribute('aria-selected', 'true')
  })

  it('explains empty results and offers a working recovery query', () => {
    renderSearch({ initialQuery: 'nonexistent' })
    expect(screen.getByRole('status')).toHaveTextContent('0 risultati')
    expect(screen.getByRole('heading', { name: 'Nessun risultato' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Bonifico' }))
    expect(screen.getByRole('button', { name: /Bonifico UniCredit Invia/ })).toBeInTheDocument()
  })
})
