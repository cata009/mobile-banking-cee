// @vitest-environment jsdom
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import FutureGainInvestmentSimulatorScreen from '@/app/screens/investments/FutureGainInvestmentSimulatorScreen'
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
async function selectOption(action: string | RegExp, option: string | RegExp) {
  fireEvent.click(screen.getByRole('button', { name: action }))
  const sheet = screen.getByRole('dialog')
  fireEvent.click(within(sheet).getByRole('radio', { name: option }))
  fireEvent.click(within(sheet).getByRole('button', { name: 'OK' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
}

describe('Retained Future Gain investment simulator workflows', () => {
  it('restores a fund draft, updates estimates, and hands the exact selection to fund exploration', async () => {
    const onExploreFunds = vi.fn()
    const onBack = vi.fn()
    renderBankingScreen(
      <FutureGainInvestmentSimulatorScreen
        kind="fund"
        onBack={onBack}
        onExploreFunds={onExploreFunds}
        initialState={{ securityId: 'climate-focus', amountInput: '1000', currency: 'EUR' }}
      />,
      { country: 'RS' },
    )
    expect(screen.getByRole('textbox', { name: 'Selected fund: onemarkets Climate Focus Fund' })).toHaveValue(
      'onemarkets Climate Focus Fund',
    )
    expect(exampleValue('Potential annual return')).toHaveTextContent('22,10 EUR')
    expect(exampleValue('Accumulated amount')).toHaveTextContent('1.022,10 EUR')
    fireEvent.click(screen.getByRole('button', { name: 'Explore more' }))
    expect(onExploreFunds).toHaveBeenLastCalledWith({
      securityId: 'climate-focus',
      amountInput: '1000',
      currency: 'EUR',
    })
    await selectOption('Change fund', /Sustainable Future Mixed Fund/)
    expect(screen.getByRole('textbox', { name: 'Investment amount in USD' })).toBeInTheDocument()
    expect(exampleValue('Return rate')).toHaveTextContent('3,75%')
    fireEvent.change(screen.getByRole('textbox', { name: 'Investment amount in USD' }), {
      target: { value: '1.000,00' },
    })
    fireEvent.blur(screen.getByRole('textbox', { name: 'Investment amount in USD' }))
    expect(exampleValue('Potential annual return')).toHaveTextContent('37,50 USD')
    expect(exampleValue('Accumulated amount')).toHaveTextContent('1.037,50 USD')
    fireEvent.click(screen.getByRole('button', { name: 'Explore more' }))
    expect(onExploreFunds).toHaveBeenLastCalledWith({
      securityId: 'sustainable-future',
      amountInput: '1.000,00',
      currency: 'USD',
    })
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('blocks invalid and excessive amounts, accepts balance presets, and commits currency only after confirmation', async () => {
    renderBankingScreen(
      <FutureGainInvestmentSimulatorScreen
        kind="fund"
        onBack={vi.fn()}
        onExploreFunds={vi.fn()}
        initialState={{ securityId: 'no-longer-listed', amountInput: '0', currency: 'EUR' }}
      />,
      { country: 'RS' },
    )
    expect(screen.getByRole('textbox', { name: 'Selected fund: UniCredit Balanced Income Fund' })).toBeInTheDocument()
    const amount = screen.getByRole('textbox', { name: 'Investment amount in EUR' })
    for (const value of ['0', '-10', 'invalid']) {
      fireEvent.change(amount, { target: { value } })
      expect(screen.getByText('Enter an amount to continue.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Explore more' })).toBeDisabled()
      expect(exampleValue('Potential annual return')).toHaveTextContent('—')
    }
    fireEvent.change(amount, { target: { value: '999999999' } })
    expect(screen.getByText('Amount exceeds your available balance.')).toBeInTheDocument()
    expect(screen.getByText(/^Available balance:/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Explore more' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: /Use all available/ }))
    expect(screen.getByRole('button', { name: 'Explore more' })).toBeEnabled()
    const allAvailable = (amount as HTMLInputElement).value
    fireEvent.click(screen.getByRole('button', { name: 'Change currency, currently EUR' }))
    const picker = screen.getByRole('dialog')
    fireEvent.click(within(picker).getByRole('radio', { name: 'RSD' }))
    fireEvent.click(within(picker).getByRole('button', { name: 'Close select currency' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(amount).toHaveValue(allAvailable)
    await selectOption('Change currency, currently EUR', 'RSD')
    expect(screen.getByRole('textbox', { name: 'Investment amount in RSD' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Explore more' })).toBeEnabled()
    fireEvent.click(screen.getAllByRole('button', { name: /^Use / })[0]!)
    expect(screen.getByRole('textbox', { name: 'Investment amount in RSD' })).not.toHaveValue(allAvailable)
    fireEvent.change(screen.getByRole('textbox', { name: 'Investment amount in RSD' }), { target: { value: '' } })
    await selectOption('Change currency, currently RSD', 'USD')
    expect(screen.getByRole('button', { name: 'Explore more' })).toBeEnabled()
  })

  it.each(['fund', 'stock'] as const)('explains the %s illustration and closes its information sheet', async (kind) => {
    renderBankingScreen(<FutureGainInvestmentSimulatorScreen kind={kind} onBack={vi.fn()} onExploreFunds={vi.fn()} />, {
      country: 'RS',
    })
    fireEvent.click(screen.getByRole('button', { name: 'Help' }))
    const title = kind === 'fund' ? 'About Investment Funds' : 'About Stocks'
    const help = screen.getByRole('dialog', { name: title })
    expect(within(help).getByText(kind === 'fund' ? 'CHOOSE A FUND' : 'CHOOSE A STOCK')).toBeInTheDocument()
    expect(within(help).getByText('Important to know')).toBeInTheDocument()
    expect(
      within(help).getByText(/do not constitute investment advice or a personal recommendation/),
    ).toBeInTheDocument()
    fireEvent.click(within(help).getByRole('button', { name: `Close ${title}` }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('uses the stock estimate, opens support call confirmation, and returns from callback completion to the same draft', async () => {
    const onExploreFunds = vi.fn()
    const onBack = vi.fn()
    renderBankingScreen(
      <FutureGainInvestmentSimulatorScreen kind="stock" onBack={onBack} onExploreFunds={onExploreFunds} />,
      { country: 'RS' },
    )
    await selectOption('Change stock', /STOXX 700/)
    fireEvent.change(screen.getByRole('textbox', { name: 'Investment amount in EUR' }), { target: { value: '1000' } })
    expect(exampleValue('Potential annual return')).toHaveTextContent('23,10 EUR')
    expect(exampleValue('Return rate')).toHaveTextContent('2,31%')
    expect(screen.queryByText('Entry fee')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Explore more' }))
    expect(onExploreFunds).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Call us' }))
    const confirmation = screen.getByRole('dialog', { name: 'Call UniCredit Support?' })
    expect(within(confirmation).getByText('Call +381 11 3777 888 using your phone?')).toBeInTheDocument()
    fireEvent.click(within(confirmation).getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Call us' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Call' }))
    const call = screen.getByRole('dialog', { name: 'UniCredit Support' })
    expect(within(call).getByText('Calling…')).toBeInTheDocument()
    fireEvent.click(within(call).getByRole('button', { name: 'End call' }))
    fireEvent.click(screen.getByRole('button', { name: 'Back to stocks' }))
    expect(screen.getByRole('textbox', { name: 'Investment amount in EUR' })).toHaveValue('1000')
    expect(screen.getByRole('textbox', { name: 'Selected stock: STOXX 700' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Explore more' }))
    fireEvent.click(screen.getByRole('button', { name: 'Request a callback' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Additional notes' }), {
      target: { value: 'Please explain stock risks.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    fireEvent.click(screen.getByRole('button', { name: 'Request a callback' }))
    expect(screen.getByRole('textbox', { name: 'Additional notes' })).toHaveValue('Please explain stock risks.')
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.getByRole('heading', { name: 'Request received' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Ok, got it' }))
    expect(screen.getByRole('textbox', { name: 'Investment amount in EUR' })).toHaveValue('1000')
    expect(onBack).not.toHaveBeenCalled()
  })
})
