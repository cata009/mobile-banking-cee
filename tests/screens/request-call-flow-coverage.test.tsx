// @vitest-environment jsdom
import { cleanup, fireEvent, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import RequestCallScreen from '@/app/screens/appointments/RequestCallScreen'
import { useDemo } from '@/app/state/demoStore'
import { renderBankingScreen } from '../helpers/coverageProviders'

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 7, 9))
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  localStorage.clear()
})

function choose(field: string, option: RegExp | string) {
  fireEvent.click(screen.getByRole('button', { name: `Open ${field}` }))
  const sheet = screen.getByRole('dialog')
  fireEvent.click(within(sheet).getByRole('checkbox', { name: option }))
  fireEvent.click(within(sheet).getByRole('button', { name: 'Select' }))
}
function completeContactReason() {
  choose('What do you want to talk about?', /I want to invest/)
  choose('Give us more details about your request', 'Savings')
  choose('Contact me during', '09:00 - 11:00')
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
  it('requires reason, details, interval and a valid phone, reviews edited notes and confirms', () => {
    const onBack = vi.fn()
    renderBankingScreen(<RequestCallScreen country="CZ" onBack={onBack} />)
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    expect(
      screen.queryByRole('button', { name: 'Open Give us more details about your request' }),
    ).not.toBeInTheDocument()
    completeContactReason()
    const phone = screen.getByRole('textbox', { name: 'Mobile number' })
    expect(phone).toHaveValue('602123456')
    fireEvent.change(phone, { target: { value: '123' } })
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    fireEvent.change(phone, { target: { value: '602 999 888' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    fireEvent.change(screen.getByRole('textbox', { name: 'Additional notes' }), {
      target: { value: '  Please discuss savings  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.getByText('+420 602 999 888')).toBeInTheDocument()
    expect(screen.getByText('Please discuss savings')).toBeInTheDocument()
    expect(screen.getByText('09:00 - 11:00')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('textbox', { name: 'Additional notes' })).toHaveValue('  Please discuss savings  ')
    fireEvent.click(screen.getByRole('button', { name: 'Continue without any notes' }))
    expect(screen.queryByText('Please discuss savings')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(screen.getByRole('heading', { name: 'Request a call successfully confirmed' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Ok, got it' }))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('applies calendar selection, preserves cancelled choices, and clears dependent details when reason changes', () => {
    const onBack = vi.fn()
    renderBankingScreen(<RequestCallScreen country="RO" onBack={onBack} />, { country: 'RO' })
    completeContactReason()
    fireEvent.click(screen.getByRole('button', { name: 'Open Preferred callback date' }))
    const calendar = screen.getByRole('dialog')
    expect(within(calendar).getByRole('button', { name: /Tuesday, 6 October 2026/ })).toBeDisabled()
    expect(within(calendar).getByRole('button', { name: /Saturday, 10 October 2026/ })).toBeDisabled()
    fireEvent.click(within(calendar).getByRole('button', { name: /Friday, 9 October 2026/ }))
    expect(screen.getByDisplayValue('Friday, 09 October')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Open Contact me during' }))
    const intervals = screen.getByRole('dialog')
    fireEvent.click(within(intervals).getByRole('checkbox', { name: '11:00 - 13:00' }))
    fireEvent.click(within(intervals).getByRole('button', { name: 'Close' }))
    expect(screen.getByDisplayValue('09:00 - 11:00')).toBeInTheDocument()
    choose('What do you want to talk about?', /Other issues/)
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    choose('Give us more details about your request', 'Loans')
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('textbox', { name: 'Mobile number' })).toHaveValue('721234567')
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('resets a callback draft and default phone when the provider country changes', () => {
    renderBankingScreen(<CountryCallFlow />)
    completeContactReason()
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Additional notes' }), {
      target: { value: 'Czech request draft' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Switch to Romania' }))
    expect(screen.getByRole('textbox', { name: 'Mobile number' })).toHaveValue('721234567')
    expect(screen.getByText('+40')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Open Give us more details about your request' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    completeContactReason()
    fireEvent.change(screen.getByRole('textbox', { name: 'Mobile number' }), { target: { value: '1234567890123456' } })
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    fireEvent.change(screen.getByRole('textbox', { name: 'Mobile number' }), { target: { value: '123456789012345' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.getByRole('textbox', { name: 'Additional notes' })).toHaveValue('')
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
    (country, code, number) => {
      renderBankingScreen(<RequestCallScreen country={country} onBack={vi.fn()} />, { country })
      expect(screen.getByText(code)).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: 'Mobile number' })).toHaveValue(number)
      completeContactReason()
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
      fireEvent.click(screen.getByRole('button', { name: 'Continue without any notes' }))
      expect(screen.getByText(`${code} ${number}`)).toBeInTheDocument()
    },
  )
})
