// @vitest-environment jsdom
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import RequestCallScreen from '@/app/screens/appointments/RequestCallScreen'
import { useDemo } from '@/app/state/demoStore'
import { renderBankingScreen } from '../helpers/coverageProviders'
import { asyncNativeReady, resetNativeWebRendererDiagnostics } from '../helpers/nativeWebRenderer'

vi.mock('@/app/components/demo/nativeDemoLoader', () => ({
  loadNativeDemoModule: async () => (await import('../helpers/nativeWebRenderer')).loadNativeDemoModuleForWebTest(),
}))

async function renderNativeBankingScreen(...args: Parameters<typeof renderBankingScreen>) {
  const rendered = renderBankingScreen(...args)
  await asyncNativeReady(rendered.container)
  return rendered
}

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 7, 9))
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  localStorage.clear()
  resetNativeWebRendererDiagnostics()
})

async function choose(field: string, option: RegExp | string) {
  fireEvent.click(await screen.findByRole('button', { name: `Open ${field}` }))
  const sheet = await screen.findByRole('dialog')
  const checkbox = await within(sheet).findByRole('checkbox', { name: option })
  fireEvent.click(checkbox)
  await waitFor(() => expect(checkbox).toHaveAttribute('aria-checked', 'true'))
  fireEvent.click(await within(sheet).findByRole('button', { name: 'Select' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
}
async function completeContactReason() {
  await choose('What do you want to talk about?', /I want to invest/)
  await choose('Give us more details about your request', 'Savings')
  await choose('Contact me during', '09:00 - 11:00')
}

function CountryCallFlow() {
  const { country, setCountry } = useDemo()
  return (
    <>
      <button onClick={() => setCountry('RO')}>Switch to Romania</button>
      <RequestCallScreen country={country} onBack={vi.fn()} />
    </>
  )
}

describe('Request call current interaction contract', () => {
  it('requires reason, details, interval and a valid phone, reviews edited notes and confirms', async () => {
    const onBack = vi.fn()
    await renderNativeBankingScreen(<RequestCallScreen country="CZ" onBack={onBack} />)
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    expect(
      screen.queryByRole('button', { name: 'Open Give us more details about your request' }),
    ).not.toBeInTheDocument()
    await completeContactReason()
    const phone = screen.getByRole('textbox', { name: 'Mobile number' })
    expect(phone).toHaveValue('602123456')
    fireEvent.change(phone, { target: { value: '123' } })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled())
    fireEvent.change(phone, { target: { value: '602 999 888' } })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    const notes = await screen.findByRole('textbox', { name: 'Additional notes' })
    fireEvent.change(notes, {
      target: { value: '  Please discuss savings  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByText('+420 602 999 888')
    await screen.findByText('Please discuss savings')
    await screen.findByText('09:00 - 11:00')
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(await screen.findByRole('textbox', { name: 'Additional notes' })).toHaveValue('  Please discuss savings  ')
    fireEvent.click(await screen.findByRole('button', { name: 'Continue without any notes' }))
    await waitFor(() => expect(screen.queryByText('Please discuss savings')).not.toBeInTheDocument())
    fireEvent.click(await screen.findByRole('button', { name: 'Confirm' }))
    await screen.findByText('Request a call successfully confirmed')
    fireEvent.click(screen.getByRole('button', { name: 'Ok, got it' }))
    await waitFor(() => expect(onBack).toHaveBeenCalledOnce())
  })

  it('applies calendar selection, preserves cancelled choices, and clears dependent details when reason changes', async () => {
    const onBack = vi.fn()
    await renderNativeBankingScreen(<RequestCallScreen country="RO" onBack={onBack} />, { country: 'RO' })
    await completeContactReason()
    fireEvent.click(screen.getByRole('button', { name: 'Open Preferred callback date' }))
    const calendar = await screen.findByRole('dialog')
    expect(within(calendar).getByRole('button', { name: /Tuesday, 6 October 2026/ })).toBeDisabled()
    expect(within(calendar).getByRole('button', { name: /Saturday, 10 October 2026/ })).toBeDisabled()
    fireEvent.click(within(calendar).getByRole('button', { name: /Friday, 9 October 2026/ }))
    expect(await screen.findByDisplayValue('Friday, 09 October')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Open Contact me during' }))
    const intervals = await screen.findByRole('dialog')
    const otherInterval = within(intervals).getByRole('checkbox', { name: '11:00 - 13:00' })
    fireEvent.click(otherInterval)
    await waitFor(() => expect(otherInterval).toHaveAttribute('aria-checked', 'true'))
    fireEvent.click(within(intervals).getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByDisplayValue('09:00 - 11:00')).toBeInTheDocument()
    await choose('What do you want to talk about?', /Other issues/)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled())
    await choose('Give us more details about your request', 'Loans')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByRole('textbox', { name: 'Additional notes' })
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(await screen.findByRole('textbox', { name: 'Mobile number' })).toHaveValue('721234567')
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    await waitFor(() => expect(onBack).toHaveBeenCalledOnce())
  })

  it('resets a callback draft and default phone when the provider country changes', async () => {
    await renderNativeBankingScreen(<CountryCallFlow />)
    await completeContactReason()
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    fireEvent.change(await screen.findByRole('textbox', { name: 'Additional notes' }), {
      target: { value: 'Czech request draft' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Switch to Romania' }))
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Mobile number' })).toHaveValue('721234567'))
    expect(screen.getByText('+40')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Open Give us more details about your request' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    await completeContactReason()
    fireEvent.change(screen.getByRole('textbox', { name: 'Mobile number' }), { target: { value: '1234567890123456' } })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled())
    fireEvent.change(screen.getByRole('textbox', { name: 'Mobile number' }), { target: { value: '123456789012345' } })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(await screen.findByRole('textbox', { name: 'Additional notes' })).toHaveValue('')
  })

  it.each([
    ['SK', '+421', '901234567'],
    ['RS', '+381', '641234567'],
    ['HU', '+36', '301234567'],
    ['BA', '+387', '61123456'],
    ['BA_BL', '+387', '61123456'],
    ['SI', '+386', '401234567'],
  ] as const)(
    'loads the %s contact number and preserves it in the reviewed callback request',
    async (country, code, number) => {
      await renderNativeBankingScreen(<RequestCallScreen country={country} onBack={vi.fn()} />, { country })
      expect(screen.getByText(code)).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: 'Mobile number' })).toHaveValue(number)
      await completeContactReason()
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
      await screen.findByRole('textbox', { name: 'Additional notes' })
      fireEvent.click(await screen.findByRole('button', { name: 'Continue without any notes' }))
      await screen.findByText(`${code} ${number}`)
    },
  )
})
