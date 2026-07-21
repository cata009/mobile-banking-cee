// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import InvestmentsHistoryScreen from '@/app/screens/investments/InvestmentsHistoryScreen'
import { DemoProvider, useDemo } from '@/app/state/demoStore'

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

function renderHistory() {
  return render(
    <>
      <InvestmentsHistoryScreen onBack={() => undefined} />
      <CountryControl />
    </>,
    { wrapper: AppProviders },
  )
}

function getHistoryRows(container: HTMLElement, kind: 'transaction' | 'order') {
  return Array.from(container.querySelectorAll<HTMLButtonElement>(`[data-investment-history-row="${kind}"]`))
}

function openOrdersTab() {
  fireEvent.click(screen.getByRole('tab', { name: 'ORDERS' }))
  expect(screen.getByRole('tab', { name: 'ORDERS' })).toHaveAttribute('aria-selected', 'true')
}

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
  })
})

afterEach(cleanup)

describe('InvestmentsHistoryScreen details', () => {
  it('ignores an invalid incoming title filter instead of crashing the history list', () => {
    const invalidClickPayload = { type: 'click' }

    render(
      <InvestmentsHistoryScreen
        onBack={() => undefined}
        historyFilterByTitle={invalidClickPayload as unknown as string}
      />,
      { wrapper: AppProviders },
    )

    expect(screen.getByRole('tab', { name: 'TRANSACTIONS' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('')
  })

  it('keeps a transaction detail signed and transaction-specific', () => {
    const { container } = renderHistory()
    const transaction = getHistoryRows(container, 'transaction')[0]
    if (!transaction) throw new Error('The seeded portfolio must expose a transaction')

    expect(transaction).toHaveTextContent('COUPON')
    expect(transaction.textContent).toMatch(/\+\d/)
    fireEvent.click(transaction)

    const detail = container.querySelector<HTMLElement>('[data-investment-history-detail="transaction"]')
    if (!detail) throw new Error('Transaction detail did not open')
    expect(detail).toHaveTextContent('Transaction details')
    expect(detail).toHaveTextContent('COUPON')
    expect(detail.textContent).toMatch(/\+\d/)
    expect(detail).not.toHaveTextContent(/EXECUTED|PENDING|REJECTED/)
    expect(within(detail).queryByText(/More\s+details/)).not.toBeInTheDocument()
    expect(within(detail).queryByText(/Ex-Ante\s+cost/)).not.toBeInTheDocument()
    expect(within(detail).queryByText('Documents')).not.toBeInTheDocument()
  })

  it('keeps BUY and SELL order details signed with seeded status and order-only actions', () => {
    const { container } = renderHistory()
    openOrdersTab()
    const orders = getHistoryRows(container, 'order')
    const buyOrder = orders[0]
    const sellOrder = orders[2]
    if (!buyOrder || !sellOrder) throw new Error('The seeded portfolio must expose BUY and SELL orders')

    expect(buyOrder).toHaveTextContent('EXECUTED')
    expect(buyOrder.textContent).toMatch(/\+\d/)
    fireEvent.click(buyOrder)

    const buyDetail = container.querySelector<HTMLElement>('[data-investment-history-detail="order"]')
    if (!buyDetail) throw new Error('BUY order detail did not open')
    expect(buyDetail).toHaveTextContent('Order details')
    expect(buyDetail).toHaveTextContent('BUY')
    expect(buyDetail).toHaveTextContent('EXECUTED')
    expect(buyDetail.textContent).toMatch(/\+\d/)
    expect(within(buyDetail).getByText(/More\s+details/)).toBeInTheDocument()
    expect(within(buyDetail).getByText(/Ex-Ante\s+cost/)).toBeInTheDocument()
    expect(within(buyDetail).getByText('Documents')).toBeInTheDocument()

    fireEvent.click(within(buyDetail).getByRole('button', { name: 'Back' }))
    const refreshedSellOrder = getHistoryRows(container, 'order')[2]
    if (!refreshedSellOrder) throw new Error('The seeded portfolio must retain its SELL order')
    fireEvent.click(refreshedSellOrder)

    const sellDetail = container.querySelector<HTMLElement>('[data-investment-history-detail="order"]')
    if (!sellDetail) throw new Error('SELL order detail did not open')
    expect(sellDetail).toHaveTextContent('SELL')
    expect(sellDetail).toHaveTextContent('EXECUTED')
    expect(sellDetail.textContent).toMatch(/-\d/)
    expect(within(sellDetail).getByText(/More\s+details/)).toBeInTheDocument()
  })
})

describe('InvestmentsHistoryScreen country and tab state', () => {
  it('keeps Orders active while a country change clears search, filters, and an open detail', () => {
    const { container } = renderHistory()
    openOrdersTab()

    fireEvent.click(screen.getByRole('button', { name: 'Filters' }))
    fireEvent.click(screen.getByText('By status').closest('button') ?? screen.getByText('By status'))
    fireEvent.click(screen.getByRole('button', { name: 'CLEAR' }))
    fireEvent.click(screen.getByRole('button', { name: 'PENDING' }))
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(container.querySelector('[data-investment-history-filter-summary="true"]')).toBeInTheDocument()

    const search = screen.getByRole('searchbox', { name: 'Search' })
    fireEvent.change(search, { target: { value: 'Climate' } })
    expect(search).toHaveValue('Climate')
    const pendingOrder = getHistoryRows(container, 'order')[0]
    if (!pendingOrder) throw new Error('The seeded PENDING filter must expose an order')
    fireEvent.click(pendingOrder)
    expect(container.querySelector('[data-investment-history-detail="order"]')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Switch country' }))

    expect(container.querySelector('[data-investment-history-detail]')).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'ORDERS' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('')
    expect(container.querySelector('[data-investment-history-filter-summary="true"]')).not.toBeInTheDocument()
  })

  it.each([
    ['filter', 'Apply filters', () => fireEvent.click(screen.getByRole('button', { name: 'Filters' }))],
    ['info', 'Status of orders', () => fireEvent.click(screen.getByRole('button', { name: 'Help' }))],
  ] as const)('closes a transient %s view after a country change', (_mode, heading, openTransient) => {
    const { container } = renderHistory()
    openOrdersTab()
    openTransient()
    expect(screen.getAllByText(heading).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: 'Switch country' }))

    expect(screen.getByRole('tab', { name: 'ORDERS' })).toHaveAttribute('aria-selected', 'true')
    expect(container.querySelector('[data-investment-filter-screen]')).not.toBeInTheDocument()
    expect(screen.queryAllByText(heading)).toHaveLength(0)
  })

  it('does not treat a tab-only change as a country reset', () => {
    renderHistory()
    const search = screen.getByRole('searchbox', { name: 'Search' })
    fireEvent.change(search, { target: { value: 'Climate' } })

    openOrdersTab()

    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('Climate')
  })
})

describe('InvestmentsHistoryScreen custom date range', () => {
  it('parses and confirms the valid seeded YYYY-MM-DD range without rollover', () => {
    const { container } = renderHistory()
    fireEvent.click(screen.getByRole('button', { name: 'Filters' }))
    fireEvent.click(screen.getByRole('button', { name: 'Define' }))

    expect(screen.getByText('01.09.2025')).toBeInTheDocument()
    expect(screen.getByText('30.06.2026')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(container.querySelector('[data-investment-history-filter-summary="true"]')).toHaveTextContent(
      '01.09.2025 - 30.06.2026',
    )
  })
})
