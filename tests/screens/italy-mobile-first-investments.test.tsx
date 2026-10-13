// @vitest-environment jsdom
import { getInvestmentOverview } from '@/features/investments/mobileFirstValuation'
import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useRef, useState, type ReactNode } from 'react'
import { DemoProvider, DEFAULT_PRODUCT_COUNTS } from '@/app/state/demoStore'
import MobileFirstInvestments, {
  type MobileFirstInvestmentsHandle,
} from '@/experiences/pi/it/mobile-first/MobileFirstInvestments'
import type { InvestmentOverviewVariant } from '@/features/investments/mobileFirstInvestments'
import type { InvestmentDestination } from '@/experiences/pi/it/mobile-first/investmentsNavigation'

afterEach(cleanup)

function View({
  hidden = false,
  investmentCount = 1,
  variant,
  initialDestination,
  onBookAppointment,
}: {
  hidden?: boolean
  investmentCount?: number
  variant?: InvestmentOverviewVariant
  initialDestination?: InvestmentDestination
  onBookAppointment?: () => void
}) {
  const [detail, setDetail] = useState<ReactNode>(null)
  const ref = useRef<MobileFirstInvestmentsHandle>(null)
  return (
    <DemoProvider
      initialState={{
        country: 'IT',
        designSystem: 'mobile-first',
        amountsHidden: hidden,
        productCounts: { ...DEFAULT_PRODUCT_COUNTS, investments: investmentCount },
      }}
    >
      <button type="button" onClick={() => ref.current?.openInvestMenu()}>
        Apri menu Investi
      </button>
      <button type="button" onClick={() => ref.current?.setOverviewVariant('zero')}>
        Mostra portafoglio vuoto
      </button>
      <MobileFirstInvestments
        ref={ref}
        overviewVariant={variant}
        initialDestination={initialDestination}
        onBookAppointment={onBookAppointment}
        onOpen={(title, content) => setDetail(<aside aria-label={title}>{content}</aside>)}
      />
      {detail}
    </DemoProvider>
  )
}

it('renders the reference portfolio and all content sections without duplicating the main navigation', () => {
  render(<View />)
  expect(screen.getByRole('heading', { name: 'Portafoglio' })).toBeInTheDocument()
  expect(
    screen.getByText(Math.floor(getInvestmentOverview('full').totalCents / 100).toLocaleString('it-IT')),
  ).toBeInTheDocument()
  expect(
    screen.getByText(
      (getInvestmentOverview('full').allocations[0]!.valueCents / 100).toLocaleString('it-IT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    ),
  ).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'I nostri servizi' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Market Focus' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Cose da sapere per investire' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Investi' })).not.toBeInTheDocument()
})

it('drags investment graphs in both directions and preserves an ordinary info click', () => {
  vi.useFakeTimers()
  try {
    const { container } = render(<View />)
    const graph = container.querySelector<HTMLElement>('.mfi-graph-window')!
    fireEvent.pointerDown(graph, { clientX: 300, button: 0, pointerType: 'mouse', pointerId: 1 })
    fireEvent.pointerMove(graph, { clientX: 120, buttons: 1, pointerType: 'mouse', pointerId: 1 })
    fireEvent.pointerUp(graph, { clientX: 120, pointerType: 'mouse', pointerId: 1 })
    expect(screen.getByRole('button', { name: 'Grafico successivo' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Informazioni investimenti ESG' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    act(() => vi.advanceTimersByTime(121))
    fireEvent.pointerDown(graph, { clientX: 120, button: 0, pointerType: 'mouse', pointerId: 2 })
    fireEvent.pointerMove(graph, { clientX: 300, buttons: 1, pointerType: 'mouse', pointerId: 2 })
    fireEvent.pointerUp(graph, { clientX: 300, pointerType: 'mouse', pointerId: 2 })
    expect(screen.getByRole('button', { name: 'Grafico precedente' })).toBeDisabled()
    act(() => vi.advanceTimersByTime(121))
    const infoButton = screen.getByRole('button', { name: 'Informazioni investimenti' })
    fireEvent.pointerDown(infoButton, { clientX: 180, button: 0, pointerType: 'mouse', pointerId: 3 })
    fireEvent.pointerUp(infoButton, { clientX: 180, pointerType: 'mouse', pointerId: 3 })
    fireEvent.click(infoButton)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  } finally {
    cleanup()
    vi.useRealTimers()
  }
})

it('hides portfolio and row amounts when global amount privacy is enabled', () => {
  const { container } = render(<View hidden />)
  expect(container).not.toHaveTextContent('200.000.000')
  expect(container).not.toHaveTextContent('80.000.000')
  expect(container).not.toHaveTextContent('32.000')
  expect(screen.getAllByText('••••').length).toBeGreaterThanOrEqual(7)
})

it('opens source service experiences and preserves opportunity descriptions', async () => {
  render(<View />)
  fireEvent.click(screen.getByRole('button', { name: 'Area Consulenza' }))
  expect(await screen.findByRole('dialog', { name: 'Consulenza' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Chiudi' }))
  fireEvent.click(screen.getByRole('button', { name: /BTP Italia/ }))
  expect(screen.getByRole('dialog', { name: 'BTP Italia' })).toHaveTextContent('Scopri le possibilità')
  expect(screen.getByRole('button', { name: 'Scopri il titolo' })).toBeInTheDocument()
})

it('exposes the Investi drawer with real operations and services', () => {
  render(<View />)
  fireEvent.click(screen.getByRole('button', { name: 'Apri menu Investi' }))
  const dialog = screen.getByRole('dialog', { name: 'Investi' })
  expect(dialog).toHaveTextContent('Watchlist')
  expect(dialog).toHaveTextContent('Aste')
  expect(dialog).toHaveTextContent('Aggiornamento intervista MIFID')
  fireEvent.click(screen.getByRole('button', { name: 'Chiudi' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

it('expands the five source Market Focus publications and switches periods', () => {
  render(<View />)
  expect(screen.getAllByRole('button', { name: 'Scarica pdf' })).toHaveLength(2)
  fireEvent.click(screen.getByRole('button', { name: 'Scopri tutti' }))
  expect(screen.getAllByRole('button', { name: 'Scarica pdf' })).toHaveLength(5)
  fireEvent.click(screen.getByRole('button', { name: 'Settimanale' }))
  expect(screen.getByRole('button', { name: 'Settimanale' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getAllByRole('button', { name: 'Scarica pdf' })).toHaveLength(5)
})

it('renders the zero POG source state while retaining investment services', () => {
  render(<View investmentCount={0} />)
  expect(screen.getByText('Totale investimenti 0€')).toBeInTheDocument()
  expect(screen.queryByText('200.000.000')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Vetrina Fondi' })).toBeInTheDocument()
})

it('renders the one-instrument and small-allocation source variants', () => {
  const view = render(<View variant="single" />)
  expect(
    screen.getByText(Math.floor(getInvestmentOverview('single').totalCents / 100).toLocaleString('it-IT')),
  ).toBeInTheDocument()
  expect(screen.getByText('100%')).toBeInTheDocument()
  view.unmount()
  render(<View variant="edge" />)
  for (const item of getInvestmentOverview('edge').allocations)
    expect(screen.getAllByText(`${item.percent.toLocaleString('it-IT')}%`).length).toBeGreaterThan(0)
})

it('opens the expired-MIFID flow from its source warning', async () => {
  render(<View variant="mifid" />)
  fireEvent.click(screen.getByRole('button', { name: /Ricorda di aggiornare il Mifid/ }))
  expect(await screen.findByRole('dialog', { name: 'Intervista MIFID' })).toBeInTheDocument()
})

it('opens the searched fund directly and preserves its current navigation on rerender', async () => {
  const view = render(<View initialDestination={{ area: 'funds', view: 'fund', instrument: 'LU1275644675' }} />)
  const fundDialog = await screen.findByRole('dialog', { name: 'Posizione del tuo fondo' })
  expect(within(fundDialog).getByText('Pioneer SF - Equity Plan 60')).toBeInTheDocument()
  view.rerender(<View initialDestination={{ area: 'securities', view: 'security', instrument: 'apple' }} />)
  expect(screen.getByRole('dialog', { name: 'Posizione del tuo fondo' })).toBe(fundDialog)
  expect(within(fundDialog).getByText('Pioneer SF - Equity Plan 60')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Chiudi' }))
  view.rerender(<View initialDestination={{ area: 'funds', view: 'fund', instrument: 'pac' }} />)
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

it('routes an initial commercial deposit destination to its source information branch', () => {
  render(<View initialDestination={{ area: 'securities', view: 'deposit-info' }} />)
  expect(screen.getByRole('dialog', { name: 'Tutti gli investimenti' })).toBeInTheDocument()
})

it('closes the investment catalogue before handing an appointment to the Home experience', () => {
  const onBookAppointment = vi.fn()
  render(<View onBookAppointment={onBookAppointment} />)
  fireEvent.click(screen.getByRole('button', { name: 'I nostri prodotti' }))
  fireEvent.click(screen.getByRole('button', { name: 'Scopri tutti i nostri prodotti' }))
  fireEvent.click(screen.getByRole('button', { name: 'Investimenti e risparmio' }))
  fireEvent.click(screen.getByRole('button', { name: 'Conto Titoli come aprirlo' }))
  fireEvent.click(screen.getByRole('button', { name: 'Appuntamento' }))
  expect(onBookAppointment).toHaveBeenCalledOnce()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

it('returns to the portfolio when the control panel selects a source overview variant', () => {
  render(<View />)
  fireEvent.click(screen.getByRole('button', { name: 'Apri menu Investi' }))
  fireEvent.click(screen.getByRole('button', { name: 'Mostra portafoglio vuoto' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.getByText('Totale investimenti 0€')).toBeInTheDocument()
})
