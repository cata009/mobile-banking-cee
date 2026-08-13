// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/app/App'

const APP_2027_CZ_HOME_URL =
  '/?product=PI&country=CZ&scenario=active&ds=current&release=release-future-app-2027' +
  '&bank=retail-single-account&theme=light&lang=en&screen=homepage' +
  '&count_accounts=2&count_debit_cards=2&count_credit_cards=1&count_meal_cards=0' +
  '&count_deposits=1&count_savings=1&count_loans=1&count_mortgages=1&count_investments=1'

const EVO_2027_CZ_HOME_URL = APP_2027_CZ_HOME_URL.replace(
  'release-future-app-2027',
  'release-future-evo-2027',
)

beforeEach(() => {
  window.history.replaceState({}, '', APP_2027_CZ_HOME_URL)
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

describe('App 2027 Homepage routing', () => {
  it('boots the isolated App 2027 Homepage from a shared deep link', async () => {
    render(<App />)

    expect(await screen.findByText('Total Available')).toBeInTheDocument()
    expect(screen.getByText('App 2027')).toBeInTheDocument()
    expect(document.querySelector('[data-app-2027-home]')).toBeInTheDocument()
  })

  it('retains the current Czech App 2027 homepage composition', async () => {
    render(<App />)

    await screen.findByText('Total Available')
    expect(screen.getByRole('tablist', { name: 'Product categories' })).toBeInTheDocument()
    expect(document.querySelector('[data-app-2027-home]')).toBeInTheDocument()
  })

  it('boots the Evo 2027 Homepage from a CZ deep link with the same initial content', async () => {
    window.history.replaceState({}, '', EVO_2027_CZ_HOME_URL)
    render(<App />)

    expect(await screen.findByText('Total Available')).toBeInTheDocument()
    expect(screen.getByText('Evo 2027')).toBeInTheDocument()
    expect(document.querySelector('[data-app-2027-home]')).toBeInTheDocument()
    expect(screen.getByRole('tablist', { name: 'Product categories' })).toBeInTheDocument()
  })
})
