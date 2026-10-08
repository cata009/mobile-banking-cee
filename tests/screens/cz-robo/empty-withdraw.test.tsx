// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ManageWithdrawScreen } from '@/app/screens/investments/robo/WithdrawalScreens'
import { buildInvestmentSecurityCatalog } from '@/app/config/investmentsPortfolioConfig'
import type { RoboWithdrawalProduct } from '@/features/investments/robo/goalModel'

afterEach(cleanup)

function mount(products: RoboWithdrawalProduct[] = []) {
  const openWithdrawalProduct = vi.fn()
  const onBack = vi.fn()
  render(
    <ManageWithdrawScreen
      withdrawableProducts={products}
      country="CZ"
      amountsHidden={false}
      onBack={onBack}
      onClose={() => undefined}
      openWithdrawalProduct={openWithdrawalProduct}
    />,
  )
  return { openWithdrawalProduct, onBack }
}

describe('Robo withdrawal empty state', () => {
  it('shows one concise empty line while preserving the header, introduction and back navigation', () => {
    const { onBack, openWithdrawalProduct } = mount()
    expect(screen.getByTestId('robo-withdraw-empty-state')).toHaveTextContent(/^No investments to withdraw\.$/)
    expect(screen.getByRole('heading', { name: 'Withdraw money' })).toBeVisible()
    expect(
      screen.getByText(
        'Select an investment to start your sale. Review the quantity, estimated proceeds and order details before signing.',
      ),
    ).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(onBack).toHaveBeenCalledOnce()
    expect(openWithdrawalProduct).not.toHaveBeenCalled()
  })

  it('still opens a funded investment from its withdrawal row', () => {
    const catalog = buildInvestmentSecurityCatalog([], 'CZ', { includeRoboGoals: true })
    const sourceSecurity = catalog.find((security) => security.id === 'robo-nano-chip-equity')!
    const product: RoboWithdrawalProduct = {
      id: 'funded-nano-chip',
      name: 'Nano-Chip Equity Fund',
      percent: 100,
      localValue: 1000,
      security: { ...sourceSecurity, owned: true, localValue: 1000, quantity: 4 },
    }
    const { openWithdrawalProduct } = mount([product])
    expect(screen.queryByTestId('robo-withdraw-empty-state')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Nano-Chip Equity Fund/ }))
    expect(openWithdrawalProduct).toHaveBeenCalledExactlyOnceWith(product)
  })

  it('retains the unavailable quote row instead of showing an empty withdrawal state', () => {
    mount([{ id: 'unquoted', name: 'Unquoted investment', percent: 100, localValue: 1000, security: null }])
    expect(screen.queryByTestId('robo-withdraw-empty-state')).not.toBeInTheDocument()
    expect(screen.getByText('Unquoted investment')).toBeVisible()
    expect(screen.getByText('Current quote unavailable')).toBeVisible()
  })
})
