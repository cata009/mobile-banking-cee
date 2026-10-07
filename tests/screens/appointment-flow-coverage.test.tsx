// @vitest-environment jsdom
import { cleanup, fireEvent, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AppointmentScreen from '@/app/screens/appointments/AppointmentScreen'
import { loadAppointments, saveAppointments } from '@/app/screens/appointments/appointmentModel'
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

function choose(field: string, option: string | RegExp) {
  fireEvent.click(screen.getByRole('button', { name: `Open ${field}` }))
  const sheet = screen.getByRole('dialog')
  fireEvent.click(within(sheet).getByRole('checkbox', { name: option }))
  fireEvent.click(within(sheet).getByRole('button', { name: 'Select' }))
}
function enterBooking(type: 'branch' | 'online') {
  choose('What do you want to talk about?', /I want to invest/)
  fireEvent.click(screen.getByRole('radio', { name: type === 'branch' ? /Branch meeting/ : /Online meeting/ }))
}

function CountryAppointmentFlow() {
  const { country, setCountry } = useDemo()
  return (
    <>
      <button onClick={() => setCountry('RO')}>Switch to Romania</button>
      <AppointmentScreen country={country} onBack={vi.fn()} />
    </>
  )
}

describe('Appointment booking and saved meeting lifecycle', () => {
  it('books a branch appointment with a selected slot, validates email, and deletes only after confirmation', () => {
    saveAppointments('CZ', [])
    const onBack = vi.fn()
    renderBankingScreen(<AppointmentScreen country="CZ" onBack={onBack} />)
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    enterBooking('branch')
    choose('Give us more details about your request', 'Savings')
    fireEvent.click(screen.getByRole('button', { name: 'See location on the map' }))
    expect(screen.getByLabelText('Map preview')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Take me there' }))
    expect(screen.getByRole('radio', { name: /Branch meeting/ })).toHaveAttribute('aria-checked', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'See more slots' }))
    fireEvent.click(screen.getByRole('button', { name: '16:30' }))
    expect(screen.getByRole('button', { name: '16:30' })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Additional notes' }), {
      target: { value: '  Discuss a monthly savings plan  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.getByText('Discuss a monthly savings plan')).toBeInTheDocument()
    expect(screen.getByText(/Thursday, 08 October - 16:30/)).toBeInTheDocument()
    const email = screen.getByRole('textbox', { name: 'Your email address' })
    fireEvent.change(email, { target: { value: 'invalid' } })
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled()
    fireEvent.change(email, { target: { value: 'client@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'See location on the map' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close map' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(screen.getByRole('heading', { name: 'Appointment request was successfully sent' })).toBeInTheDocument()
    expect(loadAppointments('CZ')).toEqual([
      expect.objectContaining({
        meetingType: 'branch',
        appointmentDate: '2026-10-08',
        selectedTime: '16:30',
        reasons: ['I want to invest'],
        details: ['Savings'],
        email: 'client@example.com',
        notes: 'Discuss a monthly savings plan',
        status: 'pending',
      }),
    ])
    fireEvent.click(screen.getByRole('button', { name: 'Ok, got it' }))
    fireEvent.click(screen.getByRole('button', { name: /Branch Meeting - 16:30/ }))
    expect(screen.getByText('WAITING FOR CONFIRMATION - BRANCH MEETING')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'See location on the map' }))
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByText('Meeting details')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Delete meeting' }))
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }))
    expect(loadAppointments('CZ')).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: 'Delete meeting' }))
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'OK' }))
    expect(screen.getByText('You have no meetings')).toBeInTheDocument()
    expect(loadAppointments('CZ')).toEqual([])
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('offers the next available day when the chosen Tuesday is full and preserves an online draft through back navigation', () => {
    saveAppointments('CZ', [])
    renderBankingScreen(<AppointmentScreen country="CZ" onBack={vi.fn()} />)
    enterBooking('online')
    fireEvent.click(screen.getByRole('button', { name: 'Open Appointment date' }))
    const calendar = screen.getByRole('dialog')
    expect(within(calendar).getByRole('button', { name: /Tuesday, 6 October 2026/ })).toBeDisabled()
    expect(within(calendar).getByRole('button', { name: /Saturday, 10 October 2026/ })).toBeDisabled()
    fireEvent.click(within(calendar).getByRole('button', { name: 'Next month' }))
    fireEvent.click(within(calendar).getByRole('button', { name: /Tuesday, 3 November 2026/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.getByText(/No available time slots for Tuesday, 03 November/)).toBeInTheDocument()
    expect(screen.getByText('Available slots (04 November)')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', expect.stringMatching(/^tel:\+/))
    fireEvent.click(screen.getByRole('button', { name: '10:00' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next day' }))
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Previous day' }))
    fireEvent.click(screen.getByRole('button', { name: '10:30' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('button', { name: '10:30' })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue without any notes' }))
    expect(screen.getByText('Microsoft Teams')).toBeInTheDocument()
    expect(screen.getByText(/Wednesday, 04 November - 10:30/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('textbox', { name: 'Additional notes' })).toHaveValue('')
    fireEvent.click(screen.getByRole('button', { name: 'Continue without any notes' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ok, got it' }))
    fireEvent.click(screen.getByRole('button', { name: /Online Meeting - 10:30/ }))
    expect(screen.getByText('Microsoft Teams')).toBeInTheDocument()
    expect(screen.queryByText('Branch address')).not.toBeInTheDocument()
  })

  it('requires a meeting issue for low feedback and persists the detailed response on the past meeting', () => {
    renderBankingScreen(<AppointmentScreen country="CZ" onBack={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Past meetings' }))
    fireEvent.click(screen.getByRole('button', { name: /Branch Meeting - 10:30 Product related info/ }))
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()
    fireEvent.click(screen.getByRole('radio', { name: '2 stars' }))
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()
    fireEvent.click(screen.getByRole('radio', { name: 'There was a problem related with the organized meeting' }))
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()
    fireEvent.click(screen.getByRole('radio', { name: 'Too much bureaucracy' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Your comment on the experience.' }), {
      target: { value: '  Please simplify the forms.  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
    expect(screen.getByRole('heading', { name: 'Your feedback was successfully sent' })).toBeInTheDocument()
    expect(
      loadAppointments('CZ').find(({ id }) => id === 'demo-appointment-past-branch-feedback-pending')?.feedback,
    ).toEqual({
      rating: 2,
      comment: 'Please simplify the forms.',
      reason: 'organizedMeeting',
      reasonDetail: 'bureaucracy',
    })
    fireEvent.click(screen.getByRole('button', { name: 'Ok, got it' }))
    fireEvent.click(screen.getByRole('button', { name: /Branch Meeting - 10:30 Product related info/ }))
    expect(screen.getByText('★★☆☆☆')).toBeInTheDocument()
    expect(screen.getByText('Too much bureaucracy')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete meeting' })).not.toBeInTheDocument()
  })

  it('clears low-rating reasons when the user changes to a positive rating and reads country-isolated storage', () => {
    const onBack = vi.fn()
    renderBankingScreen(<AppointmentScreen country="CZ" onBack={onBack} />)
    fireEvent.click(screen.getByRole('button', { name: 'Past meetings' }))
    fireEvent.click(screen.getByRole('button', { name: /Online Meeting - 15:00 Product related info/ }))
    fireEvent.click(screen.getByRole('radio', { name: '1 stars' }))
    fireEvent.click(screen.getByRole('radio', { name: 'Other reason' }))
    fireEvent.click(screen.getByRole('radio', { name: '5 stars' }))
    expect(screen.queryByText('What went wrong today?')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
    expect(
      loadAppointments('CZ').find(({ id }) => id === 'demo-appointment-past-online-feedback-pending')?.feedback,
    ).toEqual({ rating: 5, comment: '' })
    expect(localStorage.getItem('uc-demo-appointments-v2:RO')).toBeNull()
    cleanup()
    saveAppointments('RO', [])
    renderBankingScreen(<AppointmentScreen country="RO" onBack={onBack} />, { country: 'RO' })
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('resets an unsubmitted booking when the country changes and keeps the original country records intact', () => {
    saveAppointments('RO', [])
    const czechRecords = loadAppointments('CZ')
    renderBankingScreen(<CountryAppointmentFlow />)
    fireEvent.click(screen.getByRole('button', { name: 'Book an appointment' }))
    enterBooking('branch')
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Switch to Romania' }))
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    expect(screen.getByRole('textbox', { name: 'What do you want to talk about?' })).toHaveValue('')
    expect(screen.getByRole('radio', { name: /Branch meeting/ })).toHaveAttribute('aria-checked', 'false')
    expect(loadAppointments('CZ')).toEqual(czechRecords)
    expect(loadAppointments('RO')).toEqual([])
  })

  it('renders the native Czech calendar and selects Today without permitting past days', () => {
    saveAppointments('CZ', [])
    renderBankingScreen(<AppointmentScreen country="CZ" onBack={vi.fn()} />, { language: 'cs' })
    fireEvent.click(screen.getByRole('button', { name: 'Open Appointment date' }))
    const calendar = screen.getByRole('dialog')
    expect(within(calendar).getByRole('button', { name: /úterý 6. října 2026/ })).toBeDisabled()
    expect(within(calendar).getByRole('button', { name: /sobota 10. října 2026/ })).toBeDisabled()
    fireEvent.click(within(calendar).getByRole('button', { name: 'Today' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByDisplayValue('středa 07. října')).toBeInTheDocument()
  })
})
