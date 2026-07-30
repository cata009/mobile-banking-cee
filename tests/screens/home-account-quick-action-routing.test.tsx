// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/app/App'

const FUTURE_CZ_HOME_URL =
  '/?product=PI&country=CZ&scenario=active&ds=current&release=release-future-cz-robo' +
  '&bank=retail-single-account&theme=light&lang=en&screen=homepage' +
  '&count_accounts=2&count_debit_cards=0&count_credit_cards=0&count_meal_cards=0' +
  '&count_deposits=0&count_savings=0&count_loans=0&count_mortgages=0&count_investments=0'

beforeEach(() => {
  window.history.replaceState({}, '', FUTURE_CZ_HOME_URL)
  vi.stubGlobal(
    'ResizeObserver',
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
  })
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  window.history.replaceState({}, '', '/')
})

describe('Future CZ Homepage account quick-action routing', () => {
  it('opens the empty Domestic payment form directly from New payment', async () => {
    render(<App />)

    fireEvent.click(await screen.findByRole('button', { name: 'New payment' }))

    expect(await screen.findAllByRole('heading', { name: 'Domestic payment' })).toHaveLength(2)
    expect(screen.queryByRole('heading', { name: 'Payments' })).not.toBeInTheDocument()
  })

  it('opens Account Details for the selected account directly from Account info', async () => {
    render(<App />)

    fireEvent.click(await screen.findByRole('button', { name: 'Account info' }))

    expect(await screen.findAllByRole('heading', { name: 'Account Details' })).not.toHaveLength(0)
    expect(screen.getByText('CZ43BACX1234567890123401')).toBeInTheDocument()
  })
})
