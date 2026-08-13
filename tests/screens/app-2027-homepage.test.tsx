// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import App2027HomeScreen from '@/app/screens/home/App2027HomeScreen'
import { DemoProvider } from '@/app/state/demoStore'
import type { CountryId, DemoState } from '@/app/state/demoTypes'

const PRODUCT_COUNTS: DemoState['productCounts'] = {
  accounts: 2,
  debitCards: 2,
  creditCards: 1,
  mealCards: 0,
  deposits: 1,
  savingsAccounts: 1,
  loans: 1,
  mortgages: 1,
  investments: 1,
}

function renderHome(country: CountryId = 'CZ', release: DemoState['release'] = 'release-future-app-2027') {
  const onDomesticPaymentClick = vi.fn()
  const onProductsClick = vi.fn()
  const onAccountClick = vi.fn()
  const result = render(
    <DemoProvider initialState={{ product: 'PI', country, scenario: 'active', release, bankingScenario: 'retail-multi-account-card', productCounts: PRODUCT_COUNTS }}>
      <LanguageProvider initialLanguage="en">
        <App2027HomeScreen onDomesticPaymentClick={onDomesticPaymentClick} onProductsClick={onProductsClick} onAccountClick={onAccountClick} useCzRoboAccountCards={release === 'release-future-evo-2027'} />
      </LanguageProvider>
    </DemoProvider>,
  )
  return { ...result, onDomesticPaymentClick, onProductsClick, onAccountClick }
}

afterEach(cleanup)

describe('2027 Home Transformation', () => {
  it('keeps the existing header and bottom navigation while transforming content below the tabs', () => {
    const { container } = renderHome('CZ', 'release-future-evo-2027')

    expect(container.querySelector('[data-app-2027-header]')).toBeInTheDocument()
    expect(container.querySelector('[data-app-2027-bottom-navigation]')).toBeInTheDocument()
    expect(container.querySelector('[data-home-transformation]')).toBeInTheDocument()
    expect(container.querySelector('[data-home-transformation-summary="accounts"]')).toHaveTextContent('Spent this week')
    expect(container.querySelector('[data-home-product-group="accounts"]')).toBeInTheDocument()
    expect(container.querySelector('[data-home-interest-carousel] [data-home-carousel-rail]')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Show item 2 of 3' }))
    expect(screen.getByRole('button', { name: 'Show item 2 of 3' })).toHaveAttribute('aria-current', 'true')
  })

  it('makes all four tabs interactive and renders their Figma-matched product compositions', () => {
    const { container } = renderHome('CZ', 'release-future-evo-2027')
    const tabs = within(screen.getByRole('tablist', { name: 'Product categories' })).getAllByRole('tab')

    expect(tabs.map((tab) => tab.textContent)).toEqual(['Accounts', 'Savings', 'Credits', 'Insurance'])
    fireEvent.click(screen.getByRole('tab', { name: 'Savings' }))
    expect(container.querySelector('[data-home-transformation-summary="savings"]')).toHaveTextContent('Growth this year')
    expect(screen.getByText('Saving Accounts')).toBeInTheDocument()
    expect(screen.getByText(/6.5% p.a./)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Credits' }))
    expect(container.querySelector('[data-home-transformation-summary="credits"]')).toHaveTextContent('Due this month')
    expect(container.querySelector('[data-home-summary-art="credits"]')).toBeInTheDocument()
    expect(screen.getByText('Loans & Mortgages')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Block card' }).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('tab', { name: 'Insurance' }))
    expect(container.querySelector('[data-home-transformation-summary="insurance"]')).toHaveTextContent('2 active policies')
    expect(container.querySelector('[data-home-summary-art="insurance"]')).toBeInTheDocument()
    expect(screen.getByText('Genius Protect')).toBeInTheDocument()
    expect(screen.getByText('Home Protect')).toBeInTheDocument()
  })

  it('keeps currency badges and the reusable CZ Robo account actions in Accounts', () => {
    const { container, onDomesticPaymentClick } = renderHome('CZ', 'release-future-evo-2027')
    const accountsGroup = container.querySelector('[data-home-product-group="accounts"]')

    expect(accountsGroup).toBeInTheDocument()
    expect(within(accountsGroup as HTMLElement).getByRole('img', { name: 'CZK currency' })).toBeInTheDocument()
    expect(within(accountsGroup as HTMLElement).getByRole('img', { name: 'EUR currency' })).toBeInTheDocument()
    expect(within(accountsGroup as HTMLElement).getByRole('img', { name: 'USD currency' })).toBeInTheDocument()
    const newPayment = within(accountsGroup as HTMLElement).getAllByRole('button', { name: 'New payment' })[0]
    expect(newPayment).toBeDefined()
    if (!newPayment) throw new Error('Expected an account payment action')
    fireEvent.click(newPayment)
    expect(onDomesticPaymentClick).toHaveBeenCalledTimes(1)
  })

  it('uses the Baseline accordion header for Evo Accounts without its legacy balance chrome', () => {
    const { container } = renderHome('CZ', 'release-future-evo-2027')
    const accountsGroup = container.querySelector('[data-home-product-group="accounts"]') as HTMLElement

    const accountsHeader = within(accountsGroup).getByRole('button', { name: /^Accounts$/ })
    expect(accountsHeader).toHaveAttribute('aria-expanded', 'true')
    expect(within(accountsGroup).queryByText('Total available balance')).not.toBeInTheDocument()
    expect(accountsGroup.querySelector('[data-home-product-group-icon="accounts"]')).not.toBeInTheDocument()

    fireEvent.click(accountsHeader)
    expect(accountsHeader).toHaveAttribute('aria-expanded', 'false')
  })
})
