// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { PropsWithChildren, ReactElement } from 'react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import InvestmentsHistoryScreen from '@/app/screens/investments/InvestmentsHistoryScreen'
import { DemoProvider, useDemo } from '@/app/state/demoStore'
import { asyncNativeReady, resetNativeWebRendererDiagnostics } from '../helpers/nativeWebRenderer'

vi.mock('@/app/components/demo/nativeDemoLoader', async () => {
  const renderer = await import('../helpers/nativeWebRenderer')
  return { loadNativeDemoModule: renderer.loadNativeDemoModuleForWebTest }
})

function AppProviders({ children }: PropsWithChildren) {
  return (
    <DemoProvider initialState={{ country: 'RO' }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  )
}

function CountryControl() {
  const { country, setCountry } = useDemo()

  return (
    <button type="button" onClick={() => setCountry(country === 'RO' ? 'CZ' : 'RO')}>
      Switch country
    </button>
  )
}

async function renderNative(ui: ReactElement) {
  const view = render(ui, { wrapper: AppProviders })
  await asyncNativeReady(view.container)
  return view
}

async function renderHistory() {
  return renderNative(
    <>
      <InvestmentsHistoryScreen onBack={() => undefined} />
      <CountryControl />
    </>,
  )
}

function getHistoryRows(container: HTMLElement, kind: 'transaction' | 'order') {
  const activeTab = container
    .querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
    ?.getAttribute('aria-label')
  if (activeTab !== (kind === 'transaction' ? 'TRANSACTIONS' : 'ORDERS')) return []
  return Array.from(
    container.querySelectorAll<HTMLButtonElement>('[data-testid^="baseline-history-row-"]'),
  )
}

function exactText(expected: string) {
  return (_content: string, element: Element | null) =>
    element?.textContent?.replace(/\s+/g, ' ').trim() === expected
}

async function openOrdersTab() {
  fireEvent.click(screen.getByRole('tab', { name: 'ORDERS' }))
  await waitFor(() =>
    expect(screen.getByRole('tab', { name: 'ORDERS' })).toHaveAttribute('aria-selected', 'true'),
  )
}

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
  })
})

beforeEach(() => resetNativeWebRendererDiagnostics())

afterEach(() => {
  cleanup()
  resetNativeWebRendererDiagnostics()
})

describe('InvestmentsHistoryScreen details', () => {
  it('omits All time for goal history and starts with an available date preset', async () => {
    await renderNative(<InvestmentsHistoryScreen onBack={() => undefined} hideAllTimeDateOption allDatesByDefault />)
    fireEvent.click(screen.getByRole('button', { name: 'Filters' }))
    expect(await screen.findByRole('button', { name: 'Last year' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.queryByRole('button', { name: 'All time' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Define' })).toBeInTheDocument()
  })

  it('ignores an invalid incoming title filter instead of crashing the history list', async () => {
    const invalidClickPayload = { type: 'click' }

    await renderNative(
      <InvestmentsHistoryScreen
        onBack={() => undefined}
        historyFilterByTitle={invalidClickPayload as unknown as string}
      />,
    )

    expect(screen.getByRole('tab', { name: 'TRANSACTIONS' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('')
  })

  it('keeps a transaction detail signed and transaction-specific', async () => {
    const { container } = await renderHistory()
    const transaction = getHistoryRows(container, 'transaction')[0]
    if (!transaction) throw new Error('The seeded portfolio must expose a transaction')

    expect(transaction).toHaveTextContent('COUPON')
    expect(transaction.textContent).toMatch(/\+\d/)
    fireEvent.click(transaction)

    expect((await screen.findAllByText(exactText('Transaction details'))).length).toBeGreaterThan(0)
    expect(screen.getByText('COUPON')).toBeInTheDocument()
    expect(container.textContent).toMatch(/\+\d/)
    expect(container.textContent).not.toMatch(/EXECUTED|PENDING|REJECTED/)
    expect(screen.queryByText(/More\s+details/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Ex-Ante\s+cost/)).not.toBeInTheDocument()
    expect(screen.queryByText('Documents')).not.toBeInTheDocument()
  })

  it('keeps BUY and SELL order details signed with seeded status and order-only actions', async () => {
    const { container } = await renderHistory()
    await openOrdersTab()
    const orders = getHistoryRows(container, 'order')
    const buyOrder = orders[0]
    const sellOrder = orders[2]
    if (!buyOrder || !sellOrder) throw new Error('The seeded portfolio must expose BUY and SELL orders')

    expect(buyOrder).toHaveTextContent('EXECUTED')
    expect(buyOrder.textContent).toMatch(/\+\d/)
    fireEvent.click(buyOrder)

    expect((await screen.findAllByText(exactText('Order details'))).length).toBeGreaterThan(0)
    expect((await screen.findAllByText(exactText('BUY'))).length).toBeGreaterThan(0)
    expect((await screen.findAllByText(exactText('EXECUTED'))).length).toBeGreaterThan(0)
    expect(container.textContent).toMatch(/\+\d/)
    expect(screen.getAllByText(/More\s+details/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Ex-Ante\s+cost/).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Documents').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    await waitFor(() => expect(getHistoryRows(container, 'order').length).toBeGreaterThan(2))
    const refreshedSellOrder = getHistoryRows(container, 'order')[2]
    if (!refreshedSellOrder) throw new Error('The seeded portfolio must retain its SELL order')
    fireEvent.click(refreshedSellOrder)

    expect((await screen.findAllByText(exactText('Order details'))).length).toBeGreaterThan(0)
    expect((await screen.findAllByText(exactText('SELL'))).length).toBeGreaterThan(0)
    expect((await screen.findAllByText(exactText('EXECUTED'))).length).toBeGreaterThan(0)
    expect(container.textContent).toMatch(/\u2212\d/)
    expect(screen.getAllByText(/More\s+details/).length).toBeGreaterThan(0)
  })
})

describe('InvestmentsHistoryScreen country and tab state', () => {
  it('keeps Orders active while a country change clears search, filters, and an open detail', async () => {
    const { container } = await renderHistory()
    await openOrdersTab()

    fireEvent.click(screen.getByRole('button', { name: 'Filters' }))
    fireEvent.click(await screen.findByRole('button', { name: /By status/ }))
    fireEvent.click(await screen.findByRole('button', { name: 'CLEAR' }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'PENDING' })).toHaveAttribute('aria-selected', 'false'),
    )
    fireEvent.click(screen.getByRole('button', { name: 'PENDING' }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'PENDING' })).toHaveAttribute('aria-selected', 'true'),
    )
    fireEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    expect(await screen.findByRole('button', { name: 'Remove PENDING filter' })).toBeInTheDocument()

    const search = screen.getByRole('searchbox', { name: 'Search' })
    fireEvent.change(search, { target: { value: 'Climate' } })
    expect(search).toHaveValue('Climate')
    const pendingOrder = getHistoryRows(container, 'order')[0]
    if (!pendingOrder) throw new Error('The seeded PENDING filter must expose an order')
    fireEvent.click(pendingOrder)
    expect((await screen.findAllByText(exactText('Order details'))).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: 'Switch country' }))
    await waitFor(() => {
      expect(screen.queryAllByText(exactText('Order details'))).toHaveLength(0)
      expect(screen.getByRole('tab', { name: 'ORDERS' })).toHaveAttribute('aria-selected', 'true')
    })
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('')
    expect(screen.queryByRole('button', { name: /Remove .* filter/ })).not.toBeInTheDocument()
  })

  it.each([
    ['filter', 'Apply filters', () => fireEvent.click(screen.getByRole('button', { name: 'Filters' }))],
    ['info', 'Status of orders', () => fireEvent.click(screen.getByRole('button', { name: 'Help' }))],
  ] as const)('closes a transient %s view after a country change', async (_mode, heading, openTransient) => {
    await renderHistory()
    await openOrdersTab()
    openTransient()
    expect(await screen.findAllByText(heading)).not.toHaveLength(0)

    fireEvent.click(screen.getByRole('button', { name: 'Switch country' }))
    await waitFor(() => {
      expect(screen.queryAllByText(exactText('Apply filters'))).toHaveLength(0)
      expect(screen.queryAllByText(heading)).toHaveLength(0)
    })
  })

  it('does not treat a tab-only change as a country reset', async () => {
    await renderHistory()
    const search = screen.getByRole('searchbox', { name: 'Search' })
    fireEvent.change(search, { target: { value: 'Climate' } })

    await openOrdersTab()

    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('Climate')
  })
})

describe('InvestmentsHistoryScreen custom date range', () => {
  it('parses and confirms the valid seeded YYYY-MM-DD range without rollover', async () => {
    await renderHistory()
    fireEvent.click(screen.getByRole('button', { name: 'Filters' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Define' }))

    expect(await screen.findByText('01.09.2025')).toBeInTheDocument()
    expect(screen.getByText('30.06.2026')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Apply' }))

    expect(
      await screen.findByRole('button', {
        name: 'Remove 01.09.2025 - 30.06.2026 filter',
      }),
    ).toBeInTheDocument()
  })
})
