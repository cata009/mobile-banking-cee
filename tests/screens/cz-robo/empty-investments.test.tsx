// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import InvestmentsPortfolioScreen from '@/app/screens/investments/InvestmentsPortfolioScreen'
import { renderBankingScreen } from '../../helpers/coverageProviders'

afterEach(cleanup)

function mountEmptyPortfolio(amountsHidden = false) {
  return renderBankingScreen(<InvestmentsPortfolioScreen onBack={() => undefined} />, {
    country: 'RS',
    state: {
      amountsHidden,
      productCounts: {
        accounts: 1,
        debitCards: 0,
        creditCards: 0,
        mealCards: 0,
        deposits: 0,
        savingsAccounts: 0,
        loans: 0,
        mortgages: 0,
        investments: 0,
      },
    },
  })
}

describe('Baseline empty investments portfolio', () => {
  it('explains the empty portfolio and opens the existing investment catalogue', () => {
    mountEmptyPortfolio()
    expect(screen.getByRole('heading', { name: 'Your portfolio is still empty' })).toBeVisible()
    expect(screen.getByText('Total value:').parentElement).toHaveTextContent('0,00 RSD')
    expect(screen.getByText('Performance:').parentElement).toHaveTextContent('0,00 RSD / 0,00%')
    expect(screen.getByRole('button', { name: 'Invest' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Invest' }))
    expect(document.querySelector('[data-investment-security-list="true"]')).toBeInTheDocument()
    expect(document.querySelectorAll('[data-investment-security-row]').length).toBeGreaterThan(0)
  })

  it('retains amount privacy while allowing the empty portfolio investment entry', () => {
    mountEmptyPortfolio(true)
    expect(screen.getByText('Total value:').parentElement).not.toHaveTextContent('0,00')
    fireEvent.click(screen.getByRole('button', { name: 'Invest' }))
    expect(document.querySelector('[data-investment-security-list="true"]')).toBeInTheDocument()
  })
})
