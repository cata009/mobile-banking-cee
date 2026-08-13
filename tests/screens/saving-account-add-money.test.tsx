// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import AccountDetailScreen from '@/app/screens/accounts/AccountDetailScreen'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'

afterEach(cleanup)

function renderEvoSavingAccount() {
  return render(
    <DemoProvider initialState={{
      product: 'PI',
      country: 'CZ',
      scenario: 'active',
      release: 'release-future-evo-2027',
      bankingScenario: 'retail-single-account',
      productCounts: { accounts: 2, debitCards: 2, creditCards: 1, mealCards: 0, deposits: 1, savingsAccounts: 1, loans: 1, mortgages: 1, investments: 1 },
    }}>
      <LanguageProvider initialLanguage="en">
        <AccountDetailScreen selectedProductId="sav-1" onBack={() => undefined} onDetailsClick={() => undefined} onOptionsClick={() => undefined} />
      </LanguageProvider>
    </DemoProvider>,
  )
}

describe('Evo saving-account Add money', () => {
  it('opens the Kids-inspired amount and optional standing-order flow from the third saving-account action', () => {
    const { container } = renderEvoSavingAccount()
    const actionBar = container.querySelector('[data-ds-label="AccountActionBar"]') as HTMLElement

    expect(within(actionBar).getByRole('button', { name: 'Add money' })).toBeVisible()

    fireEvent.click(within(actionBar).getByRole('button', { name: 'Add money' }))

    const addMoneyFlow = container.querySelector('[data-saving-account-add-money]') as HTMLElement
    expect(addMoneyFlow).toBeInTheDocument()
    expect(within(addMoneyFlow).getAllByRole('heading', { name: 'Add money' })).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Schedule recurring transfer' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'From account' })).toHaveTextContent('Everyday account')

    fireEvent.click(screen.getByRole('button', { name: 'Schedule recurring transfer' }))

    expect(screen.getByRole('dialog', { name: 'Schedule recurring transfer' })).toHaveTextContent('Start date')
    expect(screen.getByRole('dialog', { name: 'Schedule recurring transfer' })).toHaveTextContent('Repeat')
    expect(screen.getByRole('dialog', { name: 'Schedule recurring transfer' })).toHaveTextContent('End')
  })
})
