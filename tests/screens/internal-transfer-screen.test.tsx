// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import type { ComponentProps } from 'react'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'
import type { DemoState } from '@/app/state/demoTypes'
import InternalTransferScreen from '@/app/screens/payments/InternalTransferScreen'
import PaymentsScreen from '@/app/screens/payments/PaymentsScreen'
import { asyncNativeReady, resetNativeWebRendererDiagnostics } from '../helpers/nativeWebRenderer'

vi.mock('@/app/components/demo/nativeDemoLoader', async () => {
  const { loadNativeDemoModuleForWebTest } = await import('../helpers/nativeWebRenderer')
  return { loadNativeDemoModule: loadNativeDemoModuleForWebTest }
})

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
  resetNativeWebRendererDiagnostics()
})

async function renderNativeTransfer(
  props: ComponentProps<typeof InternalTransferScreen>,
) {
  const view = render(<InternalTransferScreen {...props} />, { wrapper: Providers })
  await asyncNativeReady(view.container)
  return view
}

async function pressNativeButton(name: string | RegExp) {
  const button = await screen.findByRole('button', { name })
  await act(async () => {
    fireEvent.click(button)
  })
}

async function enterAmountDigits(digits: string) {
  for (const digit of digits) {
    const amountInput = (await screen.findByRole('textbox', {
      name: /Amount in/,
    })) as HTMLInputElement
    const previousValue = amountInput.value
    await pressNativeButton(digit)
    await waitFor(() => {
      expect(
        screen.getByRole('textbox', { name: /Amount in/ }),
      ).not.toHaveValue(previousValue)
    })
  }
  return screen.findByRole('textbox', { name: /Amount in/ })
}

async function clearAmount() {
  while (true) {
    const amountInput = (await screen.findByRole('textbox', {
      name: /Amount in/,
    })) as HTMLInputElement
    const previousValue = amountInput.value
    if (previousValue.length === 0) return
    await pressNativeButton('Delete amount')
    await waitFor(() => {
      expect(
        screen.getByRole('textbox', { name: /Amount in/ }),
      ).not.toHaveValue(previousValue)
    })
  }
}

describe('Evo 2027 internal transfer', () => {
  it('quotes FX live and keeps the active amount side while reversing direction', async () => {
    await renderNativeTransfer({ onBack: () => undefined })

    expect(screen.getAllByRole('heading', { name: 'Move between accounts' }).length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: 'Help' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /From account Everyday account/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /To account Euro account/i })).toBeInTheDocument()
    const defaultDestinationAmount = screen.getByRole('button', { name: 'Enter amount in EUR' })
    expect(defaultDestinationAmount).not.toHaveTextContent('+0.00')
    expect(defaultDestinationAmount).toHaveTextContent('EUR')
    const rateSubtitle = screen.getByText('1 CZK = 0.0412 EUR')
    expect(rateSubtitle).toBeInTheDocument()
    expect(screen.queryByText('Live exchange rate')).not.toBeInTheDocument()

    await enterAmountDigits('100')

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Enter amount in EUR' }),
      ).toHaveTextContent(/\+4\.12\s*EUR/)
    })
    expect(screen.queryByText('They receive')).not.toBeInTheDocument()
    expect(screen.getByText('1 CZK = 0.0412 EUR')).toBeInTheDocument()

    await pressNativeButton('Swap accounts')

    await waitFor(() => {
      const orderedAccountButtons = screen.getAllByRole('button', { name: /^(From|To) account/i })
      expect(orderedAccountButtons[0]).toHaveAccessibleName(/To account Everyday account/i)
      expect(orderedAccountButtons[1]).toHaveAccessibleName(/From account Euro account/i)
    })
    expect(await screen.findByRole('textbox', { name: 'Amount in CZK' })).toHaveValue('100')
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Enter amount in EUR' }),
      ).toHaveTextContent(/−4\.12\s*EUR/)
    })
    expect(screen.getAllByRole('button', { name: /^To account/i })).toHaveLength(1)
  })

  it('selects another account, validates the balance, and completes the transfer', async () => {
    const onComplete = vi.fn()
    await renderNativeTransfer({ onBack: () => undefined, onComplete })

    await pressNativeButton(/To account Euro account/i)
    expect(await screen.findByRole('heading', { name: 'Choose destination account' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /Savings Account/i })).toBeInTheDocument()
    const currencyOptions = screen
      .getAllByRole('button')
      .map(button => ({ button, label: button.getAttribute('aria-label') ?? '' }))
      .filter(
        ({ label }) =>
          label.includes(', ') && !/^(From|To) account/.test(label),
      )
    for (const currency of ['EUR', 'USD']) {
      const option = currencyOptions.find(({ label }) => label.endsWith(` ${currency}`))
      expect(option, `Native picker should expose a ${currency} account`).toBeDefined()
      expect(option?.button.querySelector('svg')).toHaveAttribute('viewBox', '0 0 36 36')
    }
    await pressNativeButton(/Savings Account/i)

    expect(screen.queryByText('Same currency')).not.toBeInTheDocument()
    expect(screen.queryByText('No conversion needed')).not.toBeInTheDocument()

    await enterAmountDigits('30000')
    expect(await screen.findByRole('button', { name: /From account Everyday account.*insufficient balance/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Move money' })).toBeDisabled()

    await clearAmount()
    await enterAmountDigits('250')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Move money' })).toBeEnabled())
    await pressNativeButton('Move money')

    await waitFor(() => {
      expect(document.body).toHaveTextContent('Money moved')
      expect(document.body).toHaveTextContent(/250\.00\s*CZK/)
      expect(onComplete).toHaveBeenCalledTimes(1)
    })
    expect(onComplete.mock.calls[0]?.[0]).toMatchObject({
      sourceAccountName: 'Everyday account',
      destinationAccountName: 'Savings Account',
      amount: 250,
      currency: 'CZK',
      note: '',
      schedule: null,
    })
  })

  it('returns the current draft from Done when the caller has no done handler', async () => {
    const onBack = vi.fn()
    await renderNativeTransfer({ onBack })

    await enterAmountDigits('25')
    await pressNativeButton('Move money')
    expect(await screen.findByText('Money moved')).toBeInTheDocument()
    await pressNativeButton('Done')

    expect(onBack).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceAccountId: expect.any(String),
        destinationAccountId: expect.any(String),
        amountText: '25',
        note: '',
      }),
    )
  })

  it('keeps schedule editing inside Native when the caller has no edit callback', async () => {
    await renderNativeTransfer({
      onBack: () => undefined,
      initialSchedule: {
        startDate: '2026-10-16',
        repeat: 'monthly',
        endsOn: { type: 'never' },
      },
    })

    await pressNativeButton('Edit transfer schedule')

    expect(await screen.findByText('Start date')).toBeInTheDocument()
  })

  it('shows presets before amount entry and calculator operations after entry', async () => {
    await renderNativeTransfer({ onBack: () => undefined })

    const amountInput = await screen.findByRole('textbox', { name: 'Amount in CZK' })
    expect(await screen.findByRole('button', { name: /1\s*000 CZK/ })).toBeInTheDocument()
    await enterAmountDigits('125')

    await waitFor(() => expect(amountInput).toHaveValue('125'))
    expect(screen.queryByRole('button', { name: /1\s*000 CZK/ })).not.toBeInTheDocument()
    for (const label of ['Add', 'Subtract', 'Multiply', 'Divide', 'Equals'])
      expect(await screen.findByRole('button', { name: label })).toBeInTheDocument()
    await pressNativeButton('Add')
    await waitFor(() => expect(amountInput).toHaveValue('125+'))
    await enterAmountDigits('25')
    await waitFor(() => expect(amountInput).toHaveValue('125+25=150'))
    await pressNativeButton('Equals')
    await waitFor(() => expect(amountInput).toHaveValue('150'))

    await pressNativeButton('Schedule transfer')
    expect(await screen.findByText('Start date')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Repeat' })).toBeInTheDocument()
    await pressNativeButton('Repeat')
    await pressNativeButton('Monthly')
    await pressNativeButton('Ends on')
    await pressNativeButton('Never')
    await pressNativeButton('Confirm')
    const returnedAmount = await screen.findByRole('textbox', { name: 'Amount in CZK' })
    await waitFor(() => expect(returnedAmount).toHaveValue('150'))
  })

  it('lets either account amount activate the same neutral keypad experience', async () => {
    await renderNativeTransfer({ onBack: () => undefined })

    const sourceAmount = await screen.findByRole('textbox', { name: 'Amount in CZK' })
    const destinationAmount = await screen.findByRole('button', { name: 'Enter amount in EUR' })
    expect(sourceAmount).toBeInTheDocument()
    expect(destinationAmount).toBeInTheDocument()

    await pressNativeButton('Enter amount in EUR')

    expect(await screen.findByRole('textbox', { name: 'Amount in EUR' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /1\s*000 EUR/ })).toBeInTheDocument()
    await waitFor(() => {
      const orderedAccountButtons = screen.getAllByRole('button', { name: /^(From|To) account/i })
      expect(orderedAccountButtons[0]).toHaveAccessibleName(/From account Everyday account/i)
      expect(orderedAccountButtons[1]).toHaveAccessibleName(/To account Euro account/i)
    })
  })

  it('collapses a complete calculator expression when the user clicks away', async () => {
    await renderNativeTransfer({ onBack: () => undefined })

    const amountInput = await screen.findByRole('textbox', { name: 'Amount in CZK' })
    await enterAmountDigits('5')
    await pressNativeButton('Multiply')
    await waitFor(() => expect(amountInput).toHaveValue('5×'))
    await enterAmountDigits('5')
    await waitFor(() => expect(amountInput).toHaveValue('5×5=25'))

    const noteInput = await screen.findByRole('textbox', { name: 'Note (optional)' })
    await act(async () => {
      fireEvent.focus(noteInput)
    })

    await waitFor(() => expect(amountInput).toHaveValue('25'))
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Multiply' })).not.toBeInTheDocument())
  })

  it('opens from the Evo payments hero and returns to Payments', async () => {
    const view = render(<PaymentsScreen />, { wrapper: Providers })
    await asyncNativeReady(view.container)
    const preview = view.container.querySelector('[data-native-screen-preview]')
    expect(preview).toHaveClass('h-full')

    // The Evo hub replaced the hero cards with one grid; this is its tile.
    await pressNativeButton('Move money')
    expect(await screen.findByRole('textbox', { name: 'Amount in CZK' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: 'Between my accounts' })).not.toBeInTheDocument()

    await pressNativeButton('Back')
    expect(await screen.findByRole('heading', { name: 'Payments' })).toBeInTheDocument()
  })
})
