// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/app/App'
import { storeApp2027Theme } from '@/app/screens/home/App2027ThemePicker'

const EVO_2027_CZ_HOME_URL =
  '/?product=PI&country=CZ&scenario=active&ds=current&release=release-future-evo-2027' +
  '&bank=retail-single-account&theme=light&lang=en&screen=homepage' +
  '&count_accounts=2&count_debit_cards=2&count_credit_cards=1&count_meal_cards=0' +
  '&count_deposits=1&count_savings=1&count_loans=1&count_mortgages=1&count_investments=1'

beforeEach(() => {
  window.history.replaceState({}, '', EVO_2027_CZ_HOME_URL)
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
  window.localStorage.removeItem('app-2027-home-theme')
  window.history.replaceState({}, '', '/')
})

describe('Evo 2027 Homepage routing', () => {
  it('boots Evo 2027 from a shared deep link', async () => {
    render(<App />)

    expect(await screen.findByText('Total Available')).toBeInTheDocument()
    expect(screen.getByText('Evo 2027')).toBeInTheDocument()
    expect(document.querySelector('[data-app-2027-home]')).toBeInTheDocument()
    expect(document.querySelector('[data-home-transformation]')).toBeInTheDocument()
  })

  it('retains the current Czech Evo 2027 homepage composition', async () => {
    render(<App />)

    await screen.findByText('Total Available')
    expect(screen.getByRole('tablist', { name: 'Product categories' })).toBeInTheDocument()
    expect(document.querySelector('[data-app-2027-home]')).toBeInTheDocument()
  })

  it('propagates an applied Evo visual theme across the app surface', async () => {
    render(<App />)

    await screen.findByText('Total Available')
    const appSurface = document.querySelector('[data-app-2027-theme-scope]') as HTMLElement
    expect(appSurface).toHaveAttribute('data-home-theme', 'standard')

    act(() => {
      storeApp2027Theme('aurora')
    })

    expect(appSurface).toHaveAttribute('data-home-theme', 'aurora')
  })

})
