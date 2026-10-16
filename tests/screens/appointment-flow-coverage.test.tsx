// @vitest-environment jsdom
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AppointmentScreen from '@/app/screens/appointments/AppointmentScreen'
import { loadAppointments, saveAppointments } from '@/app/screens/appointments/appointmentModel'
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

async function choose(field: string, option: string | RegExp) {
  fireEvent.click(await screen.findByRole('button', { name: `Open ${field}` }))
  const sheet = await screen.findByRole('dialog')
  const checkbox = await within(sheet).findByRole('checkbox', { name: option })
  fireEvent.click(checkbox)
  await waitFor(() => expect(checkbox).toHaveAttribute('aria-checked', 'true'))
  fireEvent.click(await within(sheet).findByRole('button', { name: 'Select' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
}
async function enterBooking(type: 'branch' | 'online') {
  await choose('What do you want to talk about?', /I want to invest/)
  const meeting = await screen.findByRole('radio', { name: type === 'branch' ? /Branch meeting/ : /Online meeting/ })
  fireEvent.click(meeting)
  await waitFor(() => expect(meeting).toHaveAttribute('aria-checked', 'true'))
}
async function openMeetingByTime(time: string) {
  let row: HTMLElement | undefined
  await waitFor(() => {
    const rows = screen.getAllByRole('button', { name: /Open appointment/i })
    row = rows.find(candidate => within(candidate).queryByText(new RegExp(time)) !== null)
    expect(row).toBeDefined()
  })
  if (!row) throw new Error(`No Native appointment row found for ${time}`)
  fireEvent.click(row)
}
async function selectPastMeetings() {
  fireEvent.click(await screen.findByRole('button', { name: 'Past meetings' }))
  await waitFor(() => expect(screen.getByRole('button', { name: 'Past meetings' })).toHaveAttribute('aria-selected', 'true'))
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
  it('books a branch appointment with a selected slot, validates email, and deletes only after confirmation', async () => {
    saveAppointments('CZ', [])
    const onBack = vi.fn()
    await renderNativeBankingScreen(<AppointmentScreen country="CZ" onBack={onBack} />)
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    await enterBooking('branch')
    await choose('Give us more details about your request', 'Savings')
    fireEvent.click(screen.getByRole('button', { name: 'See location on the map' }))
    await screen.findByLabelText('Map preview')
    fireEvent.click(screen.getByRole('button', { name: 'Take me there' }))
    await waitFor(() => {
      expect(screen.queryByLabelText('Map preview')).not.toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /Branch meeting/ })).toHaveAttribute('aria-checked', 'true')
    })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled())
    fireEvent.click(screen.getByRole('button', { name: 'See more slots' }))
    const lateSlot = await screen.findByRole('button', { name: '16:30' })
    fireEvent.click(lateSlot)
    await waitFor(() => expect(screen.getByRole('button', { name: '16:30' })).toHaveAttribute('aria-selected', 'true'))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    const notes = await screen.findByRole('textbox', { name: 'Additional notes' })
    fireEvent.change(notes, {
      target: { value: '  Discuss a monthly savings plan  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByText('Discuss a monthly savings plan')
    await screen.findByText(/Thursday, 08 October - 16:30/)
    const email = await screen.findByRole('textbox', { name: 'Your email address' })
    fireEvent.change(email, { target: { value: 'invalid' } })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled())
    fireEvent.change(email, { target: { value: 'client@example.com' } })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Confirm' })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'See location on the map' }))
    await screen.findByLabelText('Map preview')
    fireEvent.click(screen.getByRole('button', { name: 'Close map' }))
    await waitFor(() => expect(screen.queryByLabelText('Map preview')).not.toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    await screen.findByText('Appointment request was successfully sent')
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
    await openMeetingByTime('16:30')
    await screen.findByText('Meeting details')
    fireEvent.click(screen.getByRole('button', { name: 'See location on the map' }))
    await screen.findByLabelText('Map preview')
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    await waitFor(() => expect(screen.queryByLabelText('Map preview')).not.toBeInTheDocument())
    await screen.findByText('Meeting details')
    fireEvent.click(screen.getByRole('button', { name: 'Delete meeting' }))
    const cancelDialog = await screen.findByRole('alertdialog')
    fireEvent.click(within(cancelDialog).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
    expect(loadAppointments('CZ')).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: 'Delete meeting' }))
    const confirmDialog = await screen.findByRole('alertdialog')
    fireEvent.click(within(confirmDialog).getByRole('button', { name: 'OK' }))
    await screen.findByText('You have no meetings')
    expect(loadAppointments('CZ')).toEqual([])
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('offers the next available day when the chosen Tuesday is full and preserves an online draft through back navigation', async () => {
    saveAppointments('CZ', [])
    await renderNativeBankingScreen(<AppointmentScreen country="CZ" onBack={vi.fn()} />)
    await enterBooking('online')
    fireEvent.click(screen.getByRole('button', { name: 'Open Appointment date' }))
    const calendar = await screen.findByRole('dialog')
    expect(within(calendar).getByRole('button', { name: /Tuesday, 6 October 2026/ })).toBeDisabled()
    expect(within(calendar).getByRole('button', { name: /Saturday, 10 October 2026/ })).toBeDisabled()
    fireEvent.click(within(calendar).getByRole('button', { name: 'Next month' }))
    fireEvent.click(await within(calendar).findByRole('button', { name: /Tuesday, 3 November 2026/ }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByText(/No available time slots for Tuesday, 03 November/)
    await screen.findByText('Available slots (04 November)')
    expect(screen.getByRole('link')).toHaveAttribute('href', expect.stringMatching(/^tel:\+/))
    const firstSlot = await screen.findByRole('button', { name: '10:00' })
    fireEvent.click(firstSlot)
    await waitFor(() => expect(screen.getByRole('button', { name: '10:00' })).toHaveAttribute('aria-selected', 'true'))
    fireEvent.click(screen.getByRole('button', { name: 'Next day' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled())
    fireEvent.click(screen.getByRole('button', { name: 'Previous day' }))
    const secondSlot = await screen.findByRole('button', { name: '10:30' })
    fireEvent.click(secondSlot)
    await waitFor(() => expect(screen.getByRole('button', { name: '10:30' })).toHaveAttribute('aria-selected', 'true'))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByRole('textbox', { name: 'Additional notes' })
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    await waitFor(() => expect(screen.getByRole('button', { name: '10:30' })).toHaveAttribute('aria-selected', 'true'))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByRole('textbox', { name: 'Additional notes' })
    fireEvent.click(await screen.findByRole('button', { name: 'Continue without any notes' }))
    await screen.findByText('Microsoft Teams')
    await screen.findByText(/Wednesday, 04 November - 10:30/)
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(await screen.findByRole('textbox', { name: 'Additional notes' })).toHaveValue('')
    fireEvent.click(await screen.findByRole('button', { name: 'Continue without any notes' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Confirm' }))
    await screen.findByText('Appointment request was successfully sent')
    fireEvent.click(screen.getByRole('button', { name: 'Ok, got it' }))
    await openMeetingByTime('10:30')
    await screen.findByText('Microsoft Teams')
    expect(screen.queryByText('Branch address')).not.toBeInTheDocument()
  })

  it('requires a meeting issue for low feedback and persists the detailed response on the past meeting', async () => {
    await renderNativeBankingScreen(<AppointmentScreen country="CZ" onBack={vi.fn()} />)
    await selectPastMeetings()
    await openMeetingByTime('10:30')
    await screen.findByRole('button', { name: 'Submit' })
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()
    const twoStars = screen.getByRole('radio', { name: '2 stars' })
    fireEvent.click(twoStars)
    await waitFor(() => expect(twoStars).toHaveAttribute('aria-checked', 'true'))
    const meetingIssue = screen.getByRole('radio', { name: 'There was a problem related with the organized meeting' })
    fireEvent.click(meetingIssue)
    await waitFor(() => expect(meetingIssue).toHaveAttribute('aria-checked', 'true'))
    const bureaucracyDetail = await screen.findByRole('radio', { name: 'Too much bureaucracy' })
    fireEvent.click(bureaucracyDetail)
    await waitFor(() => expect(bureaucracyDetail).toHaveAttribute('aria-checked', 'true'))
    const feedbackComment = await screen.findByRole('textbox', { name: 'Your comment on the experience.' })
    fireEvent.change(feedbackComment, {
      target: { value: '  Please simplify the forms.  ' },
    })
    await waitFor(() => expect(feedbackComment).toHaveValue('  Please simplify the forms.  '))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
    await screen.findByRole('heading', { name: 'Your feedback was successfully sent' })
    expect(
      loadAppointments('CZ').find(({ id }) => id === 'demo-appointment-past-branch-feedback-pending')?.feedback,
    ).toEqual({
      rating: 2,
      comment: 'Please simplify the forms.',
      reason: 'organizedMeeting',
      reasonDetail: 'bureaucracy',
    })
    fireEvent.click(screen.getByRole('button', { name: 'Ok, got it' }))
    await openMeetingByTime('10:30')
    expect(screen.getByText('★★☆☆☆')).toBeInTheDocument()
    expect(screen.getByText('Too much bureaucracy')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete meeting' })).not.toBeInTheDocument()
  })

  it('clears low-rating reasons when the user changes to a positive rating and reads country-isolated storage', async () => {
    const onBack = vi.fn()
    await renderNativeBankingScreen(<AppointmentScreen country="CZ" onBack={onBack} />)
    await selectPastMeetings()
    await openMeetingByTime('15:00')
    await screen.findByRole('button', { name: 'Submit' })
    const oneStar = screen.getByRole('radio', { name: '1 stars' })
    fireEvent.click(oneStar)
    await waitFor(() => expect(oneStar).toHaveAttribute('aria-checked', 'true'))
    const otherReason = await screen.findByRole('radio', { name: 'Other reason' })
    fireEvent.click(otherReason)
    await waitFor(() => expect(otherReason).toHaveAttribute('aria-checked', 'true'))
    const fiveStars = screen.getByRole('radio', { name: '5 stars' })
    fireEvent.click(fiveStars)
    await waitFor(() => expect(fiveStars).toHaveAttribute('aria-checked', 'true'))
    await waitFor(() => expect(screen.queryByText('What went wrong today?')).not.toBeInTheDocument())
    await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
    await screen.findByRole('heading', { name: 'Your feedback was successfully sent' })
    await waitFor(() => expect(loadAppointments('CZ').find(({ id }) => id === 'demo-appointment-past-online-feedback-pending')?.feedback).toEqual({ rating: 5, comment: '' }))
    expect(localStorage.getItem('uc-demo-appointments-v2:RO')).toBeNull()
    cleanup()
    saveAppointments('RO', [])
    await renderNativeBankingScreen(<AppointmentScreen country="RO" onBack={onBack} />, { country: 'RO' })
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    await waitFor(() => expect(onBack).toHaveBeenCalledOnce())
  })

  it('resets an unsubmitted booking when the country changes and keeps the original country records intact', async () => {
    saveAppointments('RO', [])
    const czechRecords = loadAppointments('CZ')
    await renderNativeBankingScreen(<CountryAppointmentFlow />)
    fireEvent.click(screen.getByRole('button', { name: 'Book an appointment' }))
    await enterBooking('branch')
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Switch to Romania' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
      expect(screen.getByRole('textbox', { name: 'What do you want to talk about?' })).toHaveValue('')
      expect(screen.getByRole('radio', { name: /Branch meeting/ })).toHaveAttribute('aria-checked', 'false')
    })
    expect(loadAppointments('CZ')).toEqual(czechRecords)
    expect(loadAppointments('RO')).toEqual([])
  })

  it('renders the native Czech calendar and selects Today without permitting past days', async () => {
    saveAppointments('CZ', [])
    await renderNativeBankingScreen(<AppointmentScreen country="CZ" onBack={vi.fn()} />, { language: 'cs' })
    fireEvent.click(screen.getByRole('button', { name: 'Open Appointment date' }))
    const calendar = await screen.findByRole('dialog')
    expect(within(calendar).getByRole('button', { name: /úterý 6. října 2026/ })).toBeDisabled()
    expect(within(calendar).getByRole('button', { name: /sobota 10. října 2026/ })).toBeDisabled()
    fireEvent.click(within(calendar).getByRole('button', { name: 'Today' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(await screen.findByDisplayValue('středa 07. října')).toBeInTheDocument()
  })
})
