// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, within, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DemoProvider, DEFAULT_DEMO_STATE } from '@/app/state/demoStore'
import MobileFirstHome from '@/experiences/pi/it/mobile-first/MobileFirstHome'
import { postAccountFinancialMovement, resetItalyFinancialState } from '@/features/finance/italyFinancials'
import { resetPfmBudget } from '@/features/analytics/mobileFirstPfmState'

beforeEach(() => {
  resetItalyFinancialState()
  resetPfmBudget()
})
afterEach(() => {
  cleanup()
  resetItalyFinancialState()
  resetPfmBudget()
})

function renderHome(accounts = 2) {
  return render(
    <DemoProvider
      initialState={{
        product: 'PI',
        country: 'IT',
        designSystem: 'mobile-first',
        productCounts: { ...DEFAULT_DEMO_STATE.productCounts, accounts },
      }}
    >
      <MobileFirstHome />
    </DemoProvider>,
  )
}

describe('Italy Mobile First homepage', () => {
  it('renders a real three-card summary rail and synchronizes native scrolling with its controls', () => {
    const { container } = renderHome()
    const rail = screen.getByRole('region', { name: 'Riepiloghi' })
    const slides = container.querySelectorAll<HTMLElement>('.mf-widget')
    expect(slides).toHaveLength(3)
    Object.defineProperty(slides[0], 'offsetWidth', { value: 346 })
    fireEvent.scroll(rail, { target: { scrollLeft: 358 } })
    expect(screen.getByRole('button', { name: 'Riepilogo 2' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('button', { name: 'VAI AL PATRIMONIO' })).toBeInTheDocument()
    fireEvent.scroll(rail, { target: { scrollLeft: 716 } })
    expect(screen.getByRole('button', { name: 'Riepilogo successivo' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'VAI AL BUDGET' })).toBeInTheDocument()
  })

  it('drags the summary with a mouse, settles on the nearest card and suppresses its release click', () => {
    vi.useFakeTimers()
    try {
      renderHome()
      const rail = screen.getByRole('region', { name: 'Riepiloghi' })
      Object.defineProperties(rail, { clientWidth: { value: 375 }, scrollWidth: { value: 1091 } })
      fireEvent.mouseDown(rail, { clientX: 400, button: 0 })
      fireEvent.mouseMove(document, { clientX: 100, buttons: 1 })
      expect(rail.scrollLeft).toBe(300)
      fireEvent.mouseUp(document)
      expect(rail.scrollLeft).toBe(358)
      expect(screen.getByRole('button', { name: 'Riepilogo 2' })).toHaveAttribute('aria-current', 'true')
      fireEvent.click(screen.getByRole('button', { name: 'VAI AL PATRIMONIO' }))
      expect(screen.getByRole('region', { name: 'Riepiloghi' })).toBeInTheDocument()
      act(() => vi.advanceTimersByTime(81))
      fireEvent.click(screen.getByRole('button', { name: 'VAI AL PATRIMONIO' }))
      expect(screen.queryByRole('region', { name: 'Riepiloghi' })).not.toBeInTheDocument()
    } finally {
      cleanup()
      vi.useRealTimers()
    }
  })

  it('preserves an ordinary summary action click without dragging', () => {
    renderHome()
    const action = screen.getByRole('button', { name: 'VAI AL BILANCIO' })
    fireEvent.mouseDown(action, { clientX: 140, button: 0 })
    fireEvent.mouseUp(document)
    fireEvent.click(action)
    expect(screen.queryByRole('region', { name: 'Riepiloghi' })).not.toBeInTheDocument()
  })

  it('drags commercial products with a mouse without opening a product on release', () => {
    vi.useFakeTimers()
    try {
      renderHome()
      const rail = screen.getAllByRole('region', { name: 'I nostri prodotti' }).find((node) => node.tagName === 'DIV')!
      Object.defineProperties(rail, { clientWidth: { value: 375 }, scrollWidth: { value: 800 } })
      const firstProduct = within(rail).getByRole('button', { name: /Scegli il conto/ })
      fireEvent.mouseDown(firstProduct, { clientX: 400, button: 0 })
      fireEvent.mouseMove(document, { clientX: 100, buttons: 1 })
      expect(rail.scrollLeft).toBe(300)
      fireEvent.mouseUp(document)
      expect(rail.scrollLeft).toBe(425)
      expect(screen.getByRole('button', { name: 'Prodotti successivo' })).toBeDisabled()
      fireEvent.click(firstProduct)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      act(() => vi.advanceTimersByTime(81))
      fireEvent.click(firstProduct)
      expect(screen.getByRole('dialog', { name: /Scegli il conto/ })).toBeInTheDocument()
    } finally {
      cleanup()
      vi.useRealTimers()
    }
  })

  it('uses the CZ bounded chip placement and supports keyboard tab navigation', () => {
    renderHome()
    const rail = screen.getByRole('tablist', { name: 'Categorie prodotti' })
    const selected = within(rail).getByRole('tab', { name: 'Polizze assicurative' })
    Object.defineProperties(rail, { clientWidth: { value: 377 }, scrollWidth: { value: 900 } })
    Object.defineProperties(selected, { offsetLeft: { value: 540 }, offsetWidth: { value: 180 } })
    const scroll = vi.fn()
    Object.defineProperty(rail, 'scrollTo', { configurable: true, value: scroll })
    fireEvent.click(selected)
    expect(scroll).toHaveBeenLastCalledWith({ left: 441.5, behavior: 'smooth' })
    fireEvent.keyDown(rail, { key: 'ArrowLeft' })
    expect(within(rail).getByRole('tab', { name: 'Mutui e Prestiti' })).toHaveAttribute('aria-selected', 'true')
    expect(within(rail).getByRole('tab', { name: 'Mutui e Prestiti' })).toHaveFocus()
  })
  it('keeps the first and last chips at the rail edges without empty centering space', () => {
    renderHome()
    const rail = screen.getByRole('tablist', { name: 'Categorie prodotti' })
    const first = within(rail).getByRole('tab', { name: 'Conti' })
    const last = within(rail).getByRole('tab', { name: 'Polizze assicurative' })
    Object.defineProperties(rail, { clientWidth: { value: 377 }, scrollWidth: { value: 500 } })
    Object.defineProperties(first, { offsetLeft: { value: 0 }, offsetWidth: { value: 60 } })
    Object.defineProperties(last, { offsetLeft: { value: 310 }, offsetWidth: { value: 190 } })
    fireEvent.click(last)
    expect(rail.scrollLeft).toBe(123)
    fireEvent.click(first)
    expect(rail.scrollLeft).toBe(0)
    expect(first.querySelector('span')).toHaveTextContent('Conti')
  })

  it('supports dragging chips without selecting a category on the release click, like CZ Shopsmart', () => {
    vi.useFakeTimers()
    try {
      renderHome()
      const rail = screen.getByRole('tablist', { name: 'Categorie prodotti' })
      fireEvent.mouseDown(rail, { clientX: 200, button: 0 })
      fireEvent.mouseMove(document, { clientX: 120, buttons: 1 })
      expect(rail.scrollLeft).toBe(80)
      fireEvent.mouseUp(document)
      fireEvent.click(screen.getByRole('tab', { name: 'Carte' }))
      expect(screen.getByRole('tab', { name: 'Conti' })).toHaveAttribute('aria-selected', 'true')
      act(() => vi.advanceTimersByTime(81))
      fireEvent.click(screen.getByRole('tab', { name: 'Carte' }))
      expect(screen.getByRole('tab', { name: 'Carte' })).toHaveAttribute('aria-selected', 'true')
    } finally {
      cleanup()
      vi.useRealTimers()
    }
  })

  it('uses the Figma default Flexia then My One order on the homepage', () => {
    renderHome()
    fireEvent.click(screen.getByRole('tab', { name: 'Carte' }))
    expect(
      screen
        .getAllByRole('article')
        .slice(0, 2)
        .map((tile) => tile.getAttribute('aria-label')),
    ).toEqual(['UniCredit Flexia Classic', 'UniCredit My One'])
  })
  it.each([600, 848, 1200])('keeps the Budget summary selectable and accessible at %i pixels', (width) => {
    renderHome()
    const rail = screen.getByRole('region', { name: 'Riepiloghi' })
    Object.defineProperties(rail, { clientWidth: { value: width }, scrollWidth: { value: 1109 } })
    fireEvent.click(screen.getByRole('button', { name: 'Riepilogo 3' }))
    fireEvent.scroll(rail)
    expect(screen.getByRole('button', { name: 'Riepilogo 3' })).toHaveAttribute('aria-current', 'true')
    expect(rail.scrollLeft).toBe(Math.max(0, 1109 - width))
    expect(screen.getByRole('button', { name: 'VAI AL BUDGET' })).toHaveAttribute('tabindex', '0')
  })
  it('keeps the selected category visible and centered when a device changes width', () => {
    let resize = () => {}
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          resize = callback
        }
        observe() {}
        disconnect() {}
      },
    )
    try {
      renderHome()
      const rail = screen.getByRole('tablist', { name: 'Categorie prodotti' })
      const card = within(rail).getByRole('tab', { name: 'Carte' })
      let width = 377
      let offset = 440
      Object.defineProperties(rail, { clientWidth: { get: () => width }, scrollWidth: { value: 1000 } })
      Object.defineProperties(card, { offsetLeft: { get: () => offset }, offsetWidth: { value: 64 } })
      fireEvent.click(card)
      width = 600
      resize()
      expect(rail.scrollLeft).toBe(172)
      width = 832
      offset = 64
      resize()
      expect(rail.scrollLeft).toBe(0)
    } finally {
      cleanup()
      vi.unstubAllGlobals()
    }
  })
  it('keeps Home, account availability and PFM totals aligned after a real ledger posting', () => {
    const { container } = renderHome()
    const compact = (selector: string) => container.querySelector(selector)?.textContent?.replace(/[.\s]/g, '')
    expect(compact('.mf-widget .mf-amount')).toBe('1341,00€')
    act(() => {
      postAccountFinancialMovement({
        accountNumber: '000012345',
        amountCents: -1234,
        name: 'Spesa test',
        kind: 'purchase',
        category: 'Casa',
        key: 'home-pfm-test',
      })
    })
    expect(compact('.mf-widget .mf-amount')).toBe('1353,34€')
    fireEvent.click(screen.getByRole('button', { name: 'Apri conto Andrea Rossini' }))
    expect(compact('[aria-label="Saldo disponibile"]')).toBe('53537,93€')
    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
    fireEvent.click(screen.getByRole('button', { name: 'Bilancio' }))
    expect(compact('.mf-pfm-donut .mf-pfm-amount')).toBe('1353,34€')
  })

  it('opens a developed insurance policy from global search and returns to its saved query', () => {
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: 'Cerca' }))
    fireEvent.change(screen.getByRole('searchbox', { name: 'Come posso aiutarti?' }), {
      target: { value: 'my care famiglia' },
    })
    fireEvent.click(screen.getByRole('button', { name: /My Care Famiglia.*Polizza 20/ }))
    expect(screen.getByRole('heading', { name: 'My Care Famiglia' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
    expect(screen.getByRole('searchbox', { name: 'Come posso aiutarti?' })).toHaveValue('my care famiglia')
  })
  it('uses the same local client logout when Profile is opened through PFM', async () => {
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: 'Bilancio' }))
    fireEvent.click(screen.getByRole('button', { name: 'Profilo' }))
    await waitFor(() => expect(screen.getAllByRole('button', { name: 'Logout' })).not.toHaveLength(0))
    fireEvent.click(screen.getAllByRole('button', { name: 'Logout' })[0]!)
    fireEvent.click(screen.getByRole('button', { name: 'Esci' }))
    expect(screen.getByRole('main', { name: 'Accesso Mobile First' })).toBeInTheDocument()
  })

  it('logs out to the Italy client login screen without leaving Mobile First', () => {
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: 'Profilo' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'Logout' })[0]!)
    fireEvent.click(screen.getByRole('button', { name: 'Esci' }))
    expect(screen.getByRole('main', { name: 'Accesso Mobile First' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Accedi' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Operazioni' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Accedi' }))
    fireEvent.change(screen.getByLabelText('PIN'), { target: { value: '87263915' } })
    fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
    expect(screen.getByRole('heading', { name: 'I tuoi prodotti' })).toBeInTheDocument()
  })

  it('finds the existing imported accounts and opens the selected Fineco account', () => {
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: 'Cerca' }))
    fireEvent.change(screen.getByRole('searchbox', { name: 'Come posso aiutarti?' }), {
      target: { value: '000011223' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Conto importato.*000011223/ }))
    expect(screen.getByRole('main', { name: 'Dettaglio conto' })).toHaveTextContent('000011223')
  })

  it('opens an exact account movement from global search and restores the query on return', () => {
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: 'Cerca' }))
    const input = screen.getByRole('searchbox', { name: 'Come posso aiutarti?' })
    fireEvent.change(input, { target: { value: 'Spotify conto' } })
    fireEvent.click(screen.getByRole('button', { name: /Spotify.*000012345/ }))
    const movement = screen.getByRole('dialog', { name: 'Altro' })
    expect(within(movement).getByText('Insegna').parentElement).toHaveTextContent('Spotify')
    fireEvent.click(within(movement).getByRole('button', { name: 'Chiudi' }))
    expect(screen.getByRole('main', { name: 'Dettaglio conto' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
    expect(screen.getByRole('searchbox', { name: 'Come posso aiutarti?' })).toHaveValue('Spotify conto')
    expect(screen.getByRole('heading', { name: 'Movimenti' })).toBeInTheDocument()
  })

  it('finds a payment type and opens its existing account selection', () => {
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: 'Cerca' }))
    fireEvent.change(screen.getByRole('searchbox', { name: 'Come posso aiutarti?' }), { target: { value: 'F24' } })
    fireEvent.click(screen.getByRole('button', { name: /F24.*Pagamenti verso Enti e Tributi/ }))
    expect(screen.getByRole('dialog', { name: 'F24' })).toBeInTheDocument()
    expect(screen.getByText('Seleziona un conto')).toBeInTheDocument()
  })

  it('uses the updated card snapshot in Home and retains the Figma privacy mask', () => {
    renderHome()
    fireEvent.click(screen.getByRole('tab', { name: 'Carte' }))
    fireEvent.click(screen.getByRole('button', { name: 'Apri carta UniCredit Flexia Classic' }))
    fireEvent.click(screen.getByRole('button', { name: 'Gestione Carta' }))
    fireEvent.click(screen.getByRole('button', { name: 'Modifica nome carta' }))
    fireEvent.change(screen.getByLabelText('Nome carta'), { target: { value: 'Viaggi' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salva' }))
    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
    expect(screen.getByText('Viaggi')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Nascondi importi' }))
    expect(screen.queryByText('6.534')).not.toBeInTheDocument()
    expect(screen.getAllByText(',** €')).toHaveLength(5)
    fireEvent.click(screen.getByRole('button', { name: 'Apri carta UniCredit Flexia Classic' }))
    expect(screen.getByRole('heading', { name: 'Viaggi' })).toBeInTheDocument()
  })

  it('honors the account count when selecting accounts from Home', () => {
    renderHome(1)
    expect(screen.getByText('Andrea Rossini')).toBeInTheDocument()
    expect(screen.queryByText('Andrea Rossini e Flavia Bianchini')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Operazioni' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ricarica cellulare' }))
    expect(screen.getByRole('button', { name: 'Andrea Rossini' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Andrea Rossini e Flavia Bianchini' })).not.toBeInTheDocument()
  })

  it('uses the newly selected account after returning from an operation account chooser', () => {
    renderHome(3)
    fireEvent.click(screen.getByRole('button', { name: 'Apri conto Andrea Rossini' }))
    fireEvent.click(screen.getByRole('tab', { name: 'Tutti i conti' }))
    fireEvent.click(screen.getByRole('button', { name: /Andrea Rossini e Flavia Bianchini/ }))
    expect(screen.getByRole('main', { name: 'Dettaglio conto' })).toHaveTextContent('000067890')
    fireEvent.click(screen.getByRole('button', { name: 'Operazioni' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ricarica cellulare' }))
    fireEvent.click(screen.getByRole('button', { name: 'Andrea Rossini' }))
    expect(screen.getByRole('main', { name: 'Dettaglio conto' })).toHaveTextContent('000012345')
    expect(screen.getByRole('main', { name: 'Dettaglio conto' })).not.toHaveTextContent('000067890')
  })

  it('changes the main investment tab and floating action together and returns Home', () => {
    renderHome()
    fireEvent.click(screen.getByRole('tab', { name: 'Investimenti' }))
    expect(screen.getByRole('heading', { name: 'Portafoglio' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Investi' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Operazioni' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('tab', { name: 'Home' }))
    expect(screen.getByRole('heading', { name: 'I tuoi prodotti' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Operazioni' })).toBeInTheDocument()
  })

  it('dismisses the account operations overlay back to the open account', async () => {
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: 'Apri conto Andrea Rossini' }))
    fireEvent.click(screen.getByRole('button', { name: 'Operazioni' }))
    expect(screen.getByRole('dialog', { name: 'Operazioni' })).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByRole('main', { name: 'Dettaglio conto' })).toBeInTheDocument()
  })

  it('opens the Figma search page from the supplied header icon and returns home', () => {
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: 'Cerca' }))
    expect(screen.getByRole('main', { name: 'Cerca' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Operazioni' })).not.toBeInTheDocument()
    const searchInput = screen.getByRole('searchbox', { name: 'Come posso aiutarti?' })
    expect(searchInput).toHaveAttribute('placeholder', 'Come posso aiutarti?...')
    expect(searchInput).toHaveFocus()
    expect(screen.queryByRole('button', { name: 'Indietro' })).not.toBeInTheDocument()
    expect(screen.queryByText(/Stai interagendo con un sistema di Intelligenza Artificiale/)).not.toBeInTheDocument()
    fireEvent.change(searchInput, { target: { value: 'bonifico' } })
    expect(searchInput).toHaveValue('bonifico')
    fireEvent.click(screen.getByRole('button', { name: 'Cancella ricerca' }))
    expect(searchInput).toHaveValue('')
    expect(searchInput).toHaveFocus()
    fireEvent.click(screen.getByRole('button', { name: 'Chiudi ricerca' }))
    expect(screen.getByRole('heading', { name: 'I tuoi prodotti' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cerca' }))
    fireEvent.click(screen.getByRole('button', { name: 'Chiudi ricerca' }))
    expect(screen.getByRole('button', { name: 'Operazioni' })).toBeInTheDocument()
  })

  it('types with the phone keyboard and animates physical keyboard presses', () => {
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: 'Cerca' }))
    const input = screen.getByRole('searchbox', { name: 'Come posso aiutarti?' })
    const keyboard = screen.getByRole('region', { name: 'Tastiera italiana' })
    expect(keyboard).toBeVisible()
    fireEvent.click(within(keyboard).getByRole('button', { name: 'Tasto b' }))
    fireEvent.click(within(keyboard).getByRole('button', { name: 'Tasto o' }))
    expect(input).toHaveValue('bo')
    expect(input).toHaveFocus()
    fireEvent.keyDown(input, { key: 'a' })
    expect(within(keyboard).getByRole('button', { name: 'Tasto a' })).toHaveAttribute('data-pressed', 'true')
    fireEvent.keyUp(input, { key: 'a' })
    fireEvent.click(within(keyboard).getByRole('button', { name: 'Elimina' }))
    expect(input).toHaveValue('b')
  })

  it('renders the Italian Figma homepage with two accounts and the three commercial sections', () => {
    renderHome()
    expect(screen.getByRole('heading', { name: 'I tuoi prodotti' })).toBeInTheDocument()
    expect(screen.getByText('Andrea Rossini')).toBeInTheDocument()
    expect(screen.getByText('Andrea Rossini e Flavia Bianchini')).toBeInTheDocument()
    for (const name of ['I nostri prodotti', 'Offerte per te', 'In evidenza']) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument()
    }
  })

  it('keeps Operazioni outside the scrolling content and opens a dismissible operations sheet', async () => {
    const { container } = renderHome()
    const floatingButton = screen.getByRole('button', { name: 'Operazioni' })
    expect(container.querySelector('[data-mobile-first-scroll]')).not.toContainElement(floatingButton)
    fireEvent.click(floatingButton)
    const dialog = screen.getByRole('dialog', { name: 'Operazioni' })
    expect(
      within(dialog).getByRole('button', { name: 'Bonifico, Giroconto, Agevolazioni fiscali, Estero' }),
    ).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Chiudi' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('masks amounts with Figma asterisks, preserving currency and account labels', () => {
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: 'Nascondi importi' }))
    expect(screen.queryByText('53.550')).not.toBeInTheDocument()
    expect(screen.queryByText('890')).not.toBeInTheDocument()
    expect(screen.getByText('000012345 - UniCredit')).toBeInTheDocument()
    expect(screen.getAllByText('**.***')).toHaveLength(2)
    expect(screen.getAllByText('*.***.***')).toHaveLength(3)
    expect(screen.getAllByText(',** €')).toHaveLength(5)
    fireEvent.click(screen.getByRole('button', { name: 'Mostra importi' }))
    expect(screen.getByText('53.550')).toBeInTheDocument()
    expect(screen.getByText('18.050')).toBeInTheDocument()
  })

  it('changes product categories without navigating into another design system', () => {
    renderHome()
    fireEvent.click(screen.getByRole('tab', { name: 'Carte' }))
    expect(screen.getByRole('tab', { name: 'Carte' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.queryByText('Andrea Rossini e Flavia Bianchini')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('tab', { name: 'Conti' }))
    expect(screen.getByText('Andrea Rossini e Flavia Bianchini')).toBeInTheDocument()
  })

  it('changes the widget carousel and opens account information within the homepage', () => {
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: 'Riepilogo successivo' }))
    expect(screen.getByText('Ecco il valore del tuo patrimonio netto:')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Apri conto Andrea Rossini' }))
    expect(screen.getByRole('main', { name: 'Dettaglio conto' })).toHaveTextContent('000012345')
    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
    expect(screen.getByRole('heading', { name: 'I tuoi prodotti' })).toBeInTheDocument()
  })
})
