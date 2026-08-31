// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'
import type { DemoState } from '@/app/state/demoTypes'
import InternalTransferScreen from '@/app/screens/payments/InternalTransferScreen'
import PaymentsScreen from '@/app/screens/payments/PaymentsScreen'

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

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider
      initialState={{
        product: 'PI',
        country: 'CZ',
        scenario: 'active',
        release: 'release-future-evo-2027',
        bankingScenario: 'retail-multi-account-card',
        productCounts: PRODUCT_COUNTS,
      }}
    >
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  )
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('Evo 2027 internal transfer', () => {
  it('quotes FX live and keeps the active amount side while reversing direction', async () => {
    render(<InternalTransferScreen onBack={() => undefined} />, { wrapper: Providers })

    expect(screen.getAllByRole('heading', { name: 'Move between accounts' }).length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: 'Help' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /From account Everyday account/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /To account Euro account/i })).toBeInTheDocument()
    const defaultDestinationAmount = screen.getByRole('button', { name: 'Enter amount in EUR' })
    expect(defaultDestinationAmount).not.toHaveTextContent('+0.00')
    expect(defaultDestinationAmount).toHaveTextContent('0EUR')
    const exchangeRateLabel = screen.getByText('Exchange rate')
    expect(exchangeRateLabel).toBeInTheDocument()
    expect(exchangeRateLabel.parentElement).toHaveClass('border', 'border-[var(--uc-border-muted)]')
    expect(screen.queryByText('Live exchange rate')).not.toBeInTheDocument()

    fireEvent.change(screen.getByRole('textbox', { name: 'Amount in CZK' }), {
      target: { value: '100' },
    })

    expect(screen.getByText('+4.12 EUR')).toBeInTheDocument()
    expect(screen.queryByText('They receive')).not.toBeInTheDocument()
    expect(screen.getByText('1 CZK = 0.0412 EUR')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Swap accounts' }))

    const orderedAccountButtons = screen.getAllByRole('button', { name: /^(From|To) account/i })
    expect(orderedAccountButtons[0]).toHaveAccessibleName(/To account Everyday account/i)
    expect(orderedAccountButtons[1]).toHaveAccessibleName(/From account Euro account/i)
    expect(screen.getByRole('textbox', { name: 'Amount in CZK' })).toHaveValue('100')
    expect(screen.getByText('−4.12 EUR')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /^To account/i })).toHaveLength(1)
  })

  it('selects another account, validates the balance, and completes the transfer', () => {
    render(<InternalTransferScreen onBack={() => undefined} />, { wrapper: Providers })

    fireEvent.click(screen.getByRole('button', { name: /To account Euro account/i }))
    const accountPicker = screen.getByRole('dialog', { name: 'Choose destination account' })
    expect(within(accountPicker).queryByRole('button', { name: /Everyday account/i })).not.toBeInTheDocument()
    expect(accountPicker.querySelector('svg[data-currency-flag="EUR"]')).toHaveAttribute('viewBox', '0 0 36 36')
    expect(accountPicker.querySelector('svg[data-currency-flag="USD"]')).toHaveAttribute('viewBox', '0 0 36 36')
    fireEvent.click(within(accountPicker).getByRole('button', { name: /Savings Account/i }))

    expect(screen.queryByText('Same currency')).not.toBeInTheDocument()
    expect(screen.queryByText('No conversion needed')).not.toBeInTheDocument()

    fireEvent.change(screen.getByRole('textbox', { name: 'Amount in CZK' }), {
      target: { value: '30000' },
    })
    expect(screen.getByText('Amount exceeds your available balance.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Move money' })).toBeDisabled()

    fireEvent.change(screen.getByRole('textbox', { name: 'Amount in CZK' }), {
      target: { value: '250' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Move money' }))

    expect(screen.getByRole('heading', { name: 'Money moved' })).toBeInTheDocument()
    expect(screen.getByText('250.00 CZK')).toBeInTheDocument()
  })

  it('opens the in-app amount keypad on focus without suggested amount chips', () => {
    render(<InternalTransferScreen onBack={() => undefined} />, { wrapper: Providers })

    const amountInput = screen.getByRole('textbox', { name: 'Amount in CZK' })
    fireEvent.focus(amountInput)

    const keypad = screen.getByRole('group', { name: 'Amount keypad' })
    const digits = within(keypad).getByRole('group', { name: 'Amount digits' })
    expect(within(keypad).getByRole('button', { name: '1\u00a0000,00 CZK' })).toBeInTheDocument()
    fireEvent.click(within(digits).getByRole('button', { name: '1' }))
    fireEvent.click(within(digits).getByRole('button', { name: '2' }))
    fireEvent.click(within(digits).getByRole('button', { name: '5' }))

    expect(amountInput).toHaveValue('125')
    const operations = within(keypad).getByRole('group', { name: 'Calculator operations' })
    expect(within(keypad).queryByRole('button', { name: '1\u00a0000,00 CZK' })).not.toBeInTheDocument()
    expect(
      within(operations)
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual(['+', '−', '×', '÷', '='])
    fireEvent.click(within(operations).getByRole('button', { name: 'Add' }))
    fireEvent.click(within(digits).getByRole('button', { name: '2' }))
    fireEvent.click(within(digits).getByRole('button', { name: '5' }))
    expect(amountInput).toHaveValue('125+25=150')
    fireEvent.click(within(operations).getByRole('button', { name: 'Equals' }))
    expect(amountInput).toHaveValue('150')

    fireEvent.click(screen.getByRole('button', { name: 'Schedule recurring transfer' }))
    expect(screen.getByRole('dialog', { name: 'Schedule transfer' })).toBeInTheDocument()
  })

  it('lets either account amount activate the same neutral keypad experience', () => {
    render(<InternalTransferScreen onBack={() => undefined} />, { wrapper: Providers })

    const sourceAmount = screen.getByRole('textbox', { name: 'Amount in CZK' })
    expect(sourceAmount).toHaveClass('text-[36px]', 'text-[var(--uc-text-muted)]')
    expect(sourceAmount).toHaveStyle({ width: '1ch' })
    const destinationAmount = screen.getByRole('button', { name: 'Enter amount in EUR' })
    expect(destinationAmount).toHaveClass('text-[36px]', 'text-[var(--uc-text-muted)]')

    fireEvent.click(destinationAmount)

    expect(screen.getByRole('group', { name: 'Amount keypad' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Amount in EUR' })).toBeInTheDocument()
    const orderedAccountButtons = screen.getAllByRole('button', { name: /^(From|To) account/i })
    expect(orderedAccountButtons[0]).toHaveAccessibleName(/From account Everyday account/i)
    expect(orderedAccountButtons[1]).toHaveAccessibleName(/To account Euro account/i)
  })

  it('collapses a complete calculator expression when the user clicks away', () => {
    render(<InternalTransferScreen onBack={() => undefined} />, { wrapper: Providers })

    const amountInput = screen.getByRole('textbox', { name: 'Amount in CZK' })
    fireEvent.focus(amountInput)
    const keypad = screen.getByRole('group', { name: 'Amount keypad' })
    const digits = within(keypad).getByRole('group', { name: 'Amount digits' })
    fireEvent.click(within(digits).getByRole('button', { name: '5' }))
    const operations = within(keypad).getByRole('group', { name: 'Calculator operations' })
    fireEvent.click(within(operations).getByRole('button', { name: 'Multiply' }))
    fireEvent.click(within(digits).getByRole('button', { name: '5' }))
    expect(amountInput).toHaveValue('5×5=25')

    fireEvent.pointerDown(screen.getByRole('main'))

    expect(amountInput).toHaveValue('25')
    expect(screen.queryByRole('group', { name: 'Amount keypad' })).not.toBeInTheDocument()
  })

  it('opens from the Evo payments hero and returns to Payments', () => {
    render(<PaymentsScreen />, { wrapper: Providers })

    fireEvent.click(screen.getByRole('button', { name: /Between my accounts/i }))
    expect(screen.getAllByRole('heading', { name: 'Move between accounts' }).length).toBeGreaterThan(0)
    expect(screen.queryByRole('dialog', { name: 'Between my accounts' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('heading', { name: 'Payments' })).toBeInTheDocument()
  })
})
