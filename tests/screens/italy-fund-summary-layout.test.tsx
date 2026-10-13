// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { DemoProvider } from '@/app/state/demoStore'
import MobileFirstInvestmentFunds from '@/experiences/pi/it/mobile-first/MobileFirstInvestmentFunds'
import { getFundPositions } from '@/features/investments/mobileFirstValuation'
import { resetFundsState } from '@/features/investments/mobileFirstFundsState'
import { resetItalyFinancialState } from '@/features/finance/italyFinancials'

beforeEach(() => {
  resetFundsState()
  resetItalyFinancialState()
})
afterEach(() => {
  cleanup()
  resetFundsState()
  resetItalyFinancialState()
})
function show(hidden = false) {
  return render(
    <DemoProvider initialState={{ country: 'IT', designSystem: 'mobile-first', amountsHidden: hidden }}>
      <MobileFirstInvestmentFunds view="portfolio" instrument="pic" embedded onNavigate={vi.fn()} onClose={vi.fn()} />
    </DemoProvider>,
  )
}
it('keeps full canonical deposit value and P&L while providing independent amount and percentage rows', () => {
  const { container } = show()
  const summary = container.querySelector('.mfif-deposit-values')!
  const positions = getFundPositions()
  const value = positions.reduce((sum, fund) => sum + Math.round(fund.value * 100), 0) / 100
  const profit = positions.reduce((sum, fund) => sum + Math.round(fund.profit * 100), 0) / 100
  const formatter = new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const amounts = summary.querySelectorAll('.mfix-amount')
  expect(amounts[0]).toHaveTextContent(formatter.format(value))
  expect(amounts[1]).toHaveTextContent(formatter.format(profit))
  const pnl = summary.querySelector('.mfif-deposit-pnl')!
  expect(pnl.firstElementChild).toBe(amounts[1])
  expect(pnl.lastElementChild).toHaveTextContent(`${((profit / (value - profit)) * 100).toFixed(2).replace('.', ',')}%`)
  expect(within(summary as HTMLElement).getByText('Controvalore di mercato')).toBeInTheDocument()
})
it('preserves privacy masking without displaying monetary fractions or currency', () => {
  const { container } = show(true)
  const amounts = container.querySelector('.mfif-deposit-values')!.querySelectorAll('.mfix-amount')
  expect(amounts).toHaveLength(2)
  for (const amount of amounts) {
    expect(amount).toHaveTextContent(/^••••$/)
    expect(amount.querySelector('span')).toBeNull()
  }
})
