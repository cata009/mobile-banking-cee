// @vitest-environment jsdom
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import FutureGainTermDepositScreen from '@/app/screens/investments/FutureGainTermDepositScreen'
import { renderBankingScreen } from '../helpers/coverageProviders'

beforeEach(() => {
  localStorage.clear()
})
afterEach(() => {
  cleanup()
  localStorage.clear()
})

function exampleValue(label: string) {
  return screen.getByText(label, { selector: 'dt' }).parentElement!.querySelector('dd')!
}
async function confirmPicker(action: RegExp, option: string) {
  fireEvent.click(screen.getByRole('button', { name: action }))
  const sheet = screen.getByRole('dialog')
  fireEvent.click(within(sheet).getByRole('radio', { name: option }))
  fireEvent.click(within(sheet).getByRole('button', { name: 'OK' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
}

describe('Retained Future Gain term deposit simulator', () => {
  it('clears the current-account amount for external funding and offers a fixed fourth preset', () => {
    renderBankingScreen(<FutureGainTermDepositScreen onBack={vi.fn()} />, { country: 'RS' })
    const amount = screen.getByRole('textbox', { name: 'Amount to deposit in EUR' })
    expect(screen.getByRole('button', { name: 'ALL AVAILABLE' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('radio', { name: /External bank account/ }))

    expect(amount).toHaveValue('')
    expect(screen.queryByRole('button', { name: 'ALL AVAILABLE' })).not.toBeInTheDocument()
    const fourthPreset = screen.getByRole('button', { name: '100.000' })
    fireEvent.click(fourthPreset)
    expect(amount).toHaveValue('100.000,00')
  })

  it('keeps an external amount empty when the currency changes and offers the currency-specific fixed maximum', async () => {
    renderBankingScreen(<FutureGainTermDepositScreen onBack={vi.fn()} />, { country: 'RS' })
    fireEvent.click(screen.getByRole('radio', { name: /External bank account/ }))
    await confirmPicker(/Change currency, currently EUR/, 'RSD')

    const amount = screen.getByRole('textbox', { name: 'Amount to deposit in RSD' })
    expect(amount).toHaveValue('')
    expect(screen.queryByRole('button', { name: 'ALL AVAILABLE' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '1.000.000' }))
    expect(amount).toHaveValue('1.000.000,00')
  })

  it('keeps the decimal separator attached to the whole opportunity amount', () => {
    renderBankingScreen(<FutureGainTermDepositScreen onBack={vi.fn()} />, { country: 'RS' })
    const decimalAndCurrency = screen.getByText('Average funds').parentElement?.querySelector('p > span:nth-child(2)')

    expect(decimalAndCurrency).not.toHaveClass('ml-[2px]')
  })

  it('updates the representative estimate for entered money, funding, currency and tenor', async () => {
    renderBankingScreen(<FutureGainTermDepositScreen onBack={vi.fn()} />, { country: 'RS' })
    fireEvent.change(screen.getByRole('textbox', { name: 'Amount to deposit in EUR' }), {
      target: { value: '1.000,00' },
    })
    expect(exampleValue('Total deposit amount and gross interest at maturity')).toHaveTextContent('1.023,32 EUR')
    expect(exampleValue('Tax')).toHaveTextContent('3,50 EUR')
    expect(exampleValue('Net deposit amount and interest at maturity')).toHaveTextContent('1.019,82 EUR')
    fireEvent.blur(screen.getByRole('textbox', { name: 'Amount to deposit in EUR' }))
    expect(screen.getByRole('textbox', { name: 'Amount to deposit in EUR' })).toHaveValue('1.000,00')
    fireEvent.click(screen.getByRole('radio', { name: /External bank account/ }))
    expect(screen.getByRole('radio', { name: /External bank account/ })).toHaveAttribute('aria-checked', 'true')
    expect(exampleValue('Fixed NKS (Nominal interest rate)')).toHaveTextContent('3,2%')
    await confirmPicker(/Change currency, currently EUR/, 'RSD')
    expect(screen.getByText('Select the preferred tenor')).toBeInTheDocument()
    const tenorOptions = screen.getByRole('radiogroup', { name: 'Select the preferred tenor' })
    const tenorRadios = within(tenorOptions).getAllByRole('radio')
    expect(tenorRadios.map((radio) => radio.getAttribute('value'))).toEqual(['12', '6', '3'])
    for (const radio of tenorRadios) {
      expect(radio).toHaveClass('absolute', 'opacity-0', 'size-[24px]')
      expect(radio).not.toHaveClass('sr-only')
    }
    expect(within(tenorOptions).getByRole('radio', { name: '12 months' })).toBeChecked()
    expect(screen.queryByRole('button', { name: /Change tenor/ })).not.toBeInTheDocument()
    fireEvent.click(within(tenorOptions).getByRole('radio', { name: '3 months' }))
    expect(within(tenorOptions).getByRole('radio', { name: '3 months' })).toBeChecked()
    fireEvent.change(screen.getByRole('textbox', { name: 'Amount to deposit in RSD' }), { target: { value: '1000' } })
    expect(exampleValue('Tenor')).toHaveTextContent('3 months')
    expect(exampleValue('Total deposit amount and gross interest at maturity')).toHaveTextContent('1.011,25 RSD')
    expect(exampleValue('Tax')).toHaveTextContent('0 RSD')
    expect(exampleValue('Net deposit amount and interest at maturity')).toHaveTextContent('1.011,25 RSD')
    fireEvent.click(screen.getByRole('button', { name: '1.000.000' }))
    expect(screen.getByRole('textbox', { name: 'Amount to deposit in RSD' })).toHaveValue('1.000.000,00')
    await confirmPicker(/Change currency, currently RSD/, 'USD')
    fireEvent.click(within(tenorOptions).getByRole('radio', { name: '6 months' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Amount to deposit in USD' }), { target: { value: '1000' } })
    expect(exampleValue('Net deposit amount and interest at maturity')).toHaveTextContent('1.017,24 USD')
  })

  it('blocks zero and invalid input, keeps positive manual amounts unconstrained, and cancels a pending selection', async () => {
    renderBankingScreen(<FutureGainTermDepositScreen onBack={vi.fn()} />, { country: 'RS' })
    const amount = screen.getByRole('textbox', { name: 'Amount to deposit in EUR' })
    for (const input of ['0', '-1', 'not an amount']) {
      fireEvent.change(amount, { target: { value: input } })
      expect(screen.getByText('Enter an amount to continue.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Request offer' })).toBeDisabled()
      expect(exampleValue('Amount')).toHaveTextContent('—')
    }
    fireEvent.click(screen.getByRole('button', { name: /Change currency/ }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('radio', { name: 'USD' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close select currency' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByRole('textbox', { name: 'Amount to deposit in EUR' })).toHaveValue('not an amount')
    await confirmPicker(/Change currency, currently EUR/, 'USD')
    expect(screen.getByRole('textbox', { name: 'Amount to deposit in USD' })).not.toHaveValue('not an amount')
    fireEvent.click(screen.getByRole('radio', { name: /External bank account/ }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Amount to deposit in USD' }), { target: { value: '100001' } })
    // External-bank presets stop at 100,000 USD; manual positive simulations remain permitted.
    expect(screen.getByRole('button', { name: 'Request offer' })).toBeEnabled()
    expect(exampleValue('Amount')).toHaveTextContent('100.001,00 USD')
    fireEvent.click(screen.getByRole('radio', { name: /Current bank account/ }))
    expect(screen.getByRole('textbox', { name: 'Amount to deposit in USD' })).toHaveValue('100001')
  })

  it('explains the rate and opportunity estimates and respects hidden opportunity amounts', async () => {
    renderBankingScreen(<FutureGainTermDepositScreen onBack={vi.fn()} />, {
      country: 'RS',
      state: { amountsHidden: true },
    })
    expect(screen.getAllByText('••••••')).toHaveLength(2)
    for (const [action, title, body] of [
      [
        'About the missed investment opportunity estimate',
        'Missed investment opportunity',
        /not an actual loss or a guaranteed return/,
      ],
      ['What is NKS?', 'NKS - Nominal Interest Rate', /before considering taxes/],
      ['What is EKS?', 'EKS - Effective Interest Rate', /including the applicable calculation method/],
    ] as const) {
      fireEvent.click(screen.getByRole('button', { name: action }))
      const sheet = screen.getByRole('dialog', { name: title })
      expect(within(sheet).getByText(body)).toBeInTheDocument()
      fireEvent.click(within(sheet).getByRole('button', { name: 'OK' }))
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    }
    fireEvent.click(screen.getByRole('button', { name: 'Help' }))
    const help = screen.getByRole('dialog', { name: 'About the Term Deposit Simulator' })
    expect(within(help).getByText('REQUEST AN OFFER')).toBeInTheDocument()
    expect(within(help).getByText(/simulation itself does not open a deposit/)).toBeInTheDocument()
    fireEvent.click(within(help).getByRole('button', { name: 'Close simulator information' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('returns to the same simulation from contact, retains callback notes and delivers the completion callback', () => {
    const onBack = vi.fn()
    renderBankingScreen(<FutureGainTermDepositScreen onBack={onBack} />, { country: 'RS' })
    fireEvent.change(screen.getByRole('textbox', { name: 'Amount to deposit in EUR' }), { target: { value: '1234' } })
    fireEvent.click(screen.getByRole('button', { name: 'Request offer' }))
    expect(screen.getByRole('heading', { name: 'Let’s talk about your request' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Back to term deposit' }))
    expect(screen.getByRole('textbox', { name: 'Amount to deposit in EUR' })).toHaveValue('1234')
    fireEvent.click(screen.getByRole('button', { name: 'Request offer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Request a callback' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Additional notes' }), {
      target: { value: 'Please call tomorrow.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    fireEvent.click(screen.getByRole('button', { name: 'Request a callback' }))
    expect(screen.getByRole('textbox', { name: 'Additional notes' })).toHaveValue('Please call tomorrow.')
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.getByRole('heading', { name: 'Request received' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Ok, got it' }))
    expect(onBack).toHaveBeenCalledOnce()
  })
})
