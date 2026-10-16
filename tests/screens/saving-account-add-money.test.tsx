// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AccountDetailScreen from '@/app/screens/accounts/AccountDetailScreen'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'
import { asyncNativeReady, resetNativeWebRendererDiagnostics } from '../helpers/nativeWebRenderer'

vi.mock('@/app/components/demo/nativeDemoLoader', async () => {
  const { loadNativeDemoModuleForWebTest } = await import('../helpers/nativeWebRenderer')
  return { loadNativeDemoModule: loadNativeDemoModuleForWebTest }
})

afterEach(() => {
  cleanup()
  resetNativeWebRendererDiagnostics()
})

async function renderEvoSavingAccount() {
  const view = render(
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
  await asyncNativeReady(view.container)
  return view
}

describe('Evo saving-account Add money', () => {
  it('opens the saving-account add-money flow and optional standing-order schedule', async () => {
    await renderEvoSavingAccount()
    const addMoney = screen.getByRole('button', { name: 'Add money' })
    expect(addMoney).toBeVisible()
    fireEvent.click(addMoney)

    expect(await screen.findByRole('button', { name: 'Schedule recurring transfer' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'From account' })).toHaveTextContent('Everyday account')

    fireEvent.click(screen.getByRole('button', { name: 'Schedule recurring transfer' }))

    expect(await screen.findByText('Set standing order', { exact: true })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Start date' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Repeat' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'End' })).toBeInTheDocument()
  })
})
