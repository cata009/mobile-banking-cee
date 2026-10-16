// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import InvestmentsPortfolioScreen from '@/app/screens/investments/InvestmentsPortfolioScreen'
import { renderBankingScreen } from '../helpers/coverageProviders'
import { asyncNativeReady, resetNativeWebRendererDiagnostics } from '../helpers/nativeWebRenderer'

vi.mock('@/app/components/demo/nativeDemoLoader', async () => {
  const { loadNativeDemoModuleForWebTest } = await import('../helpers/nativeWebRenderer')
  return { loadNativeDemoModule: loadNativeDemoModuleForWebTest }
})
afterEach(() => { cleanup(); resetNativeWebRendererDiagnostics() })

async function openEmptyPortfolio(amountsHidden = false) {
  const view = renderBankingScreen(<InvestmentsPortfolioScreen onBack={() => undefined} />, {
    country: 'RS',
    state: { amountsHidden, productCounts: { accounts: 1, debitCards: 0, creditCards: 0, mealCards: 0, deposits: 0, savingsAccounts: 0, loans: 0, mortgages: 0, investments: 0 } },
  })
  await asyncNativeReady(view.container)
  await screen.findByText('Your portfolio is still empty')
  return view
}

it('keeps the real Native empty portfolio on its route and opens the existing catalogue', async () => {
  await openEmptyPortfolio()
  expect(screen.getByText('Total value:').parentElement).toHaveTextContent('0,00 RSD')
  expect(screen.getByText('Performance:').parentElement).toHaveTextContent('0,00 RSD / 0,00%')
  fireEvent.click(screen.getByRole('button', { name: 'Invest' }))
  await waitFor(() => expect(screen.getAllByTestId(/^baseline-investment-catalog-row-/).length).toBeGreaterThan(0))
})

it('preserves amount privacy while opening the catalogue from the real empty Native portfolio', async () => {
  await openEmptyPortfolio(true)
  expect(screen.getByText('Total value:').parentElement).not.toHaveTextContent('0,00')
  fireEvent.click(screen.getByRole('button', { name: 'Invest' }))
  await waitFor(() => expect(screen.getAllByTestId(/^baseline-investment-catalog-row-/).length).toBeGreaterThan(0))
})
