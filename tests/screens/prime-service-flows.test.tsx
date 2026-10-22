// @vitest-environment jsdom
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { PrimePreview } from '@/flows/shared/prime/preview'
import { createDemoAppointments } from '@/app/screens/appointments/appointmentModel'
import { renderBankingScreen } from '../helpers/coverageProviders'
import { asyncNativeReady, resetNativeWebRendererDiagnostics } from '../helpers/nativeWebRenderer'

vi.mock('@/app/components/demo/nativeDemoLoader', () => ({
  loadNativeDemoModule: async () => (await import('../helpers/nativeWebRenderer')).loadNativeDemoModuleForWebTest(),
}))

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

function SwitchablePrimeCustomer() {
  const [segment, setSegment] = useState<'prime' | 'private'>('prime')
  return (
    <>
      <button type="button" onClick={() => setSegment('prime')}>
        Switch to Prime customer
      </button>
      <button type="button" onClick={() => setSegment('private')}>
        Switch to Private customer
      </button>
      <PrimePreview screen="prime-advisor" parameters={{ segment }} />
    </>
  )
}

async function renderPrime(country: 'RO' | 'CZ', switchableCustomer = false) {
  const rendered = renderBankingScreen(
    switchableCustomer ? (
      <SwitchablePrimeCustomer />
    ) : (
      <PrimePreview screen="prime-advisor" parameters={{ segment: 'prime' }} />
    ),
    { country },
  )
  await asyncNativeReady(rendered.container)
  await screen.findByRole('button', { name: 'Book an appointment' })
  return rendered
}

async function choose(field: string, option: string | RegExp) {
  fireEvent.click(await screen.findByRole('button', { name: `Open ${field}` }))
  const sheet = await screen.findByRole('dialog')
  const checkbox = await within(sheet).findByRole('checkbox', { name: option })
  fireEvent.click(checkbox)
  await waitFor(() => expect(checkbox).toHaveAttribute('aria-checked', 'true'))
  fireEvent.click(within(sheet).getByRole('button', { name: 'Select' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
}

async function expectAdvisorPortrait(name: string, assetName: string) {
  const portrait = await screen.findByRole('img', { name })
  const source =
    portrait.getAttribute('src') ?? portrait.querySelector('img')?.getAttribute('src') ?? portrait.style.backgroundImage
  expect(source).toContain(assetName)
}

async function enterMultilineNotes(finalValue: string) {
  const notes = await screen.findByRole('textbox', { name: 'Additional notes' })
  expect(notes.tagName).toBe('TEXTAREA')
  expect(notes).toHaveAttribute('rows', '1')
  expect(notes).not.toHaveAttribute('type', 'number')
  // jsdom has no layout engine: provide content measurements, retaining the real
  // Source textarea, computed border styles and input/change/layout lifecycle.
  let contentHeight = 96
  Object.defineProperty(notes, 'scrollHeight', { configurable: true, get: () => contentHeight })
  fireEvent.change(notes, { target: { value: 'First line\nSecond line\nThird line\nFourth line' } })
  await waitFor(() => expect(notes).toHaveStyle({ height: '97px', overflowY: 'hidden' }))
  expect(getComputedStyle(notes).borderBottomWidth).toBe('1px')
  contentHeight = 24
  fireEvent.change(notes, { target: { value: finalValue } })
  await waitFor(() => expect(notes).toHaveStyle({ height: '25px', overflowY: 'hidden' }))
}

async function expectScrollingTitle(title: string) {
  const scroll = screen.getByTestId('appointment-page-scroll')
  const footer = screen.getByRole('button', { name: 'Continue' })
  expect(scroll).not.toContainElement(footer)
  const largeTitle = screen.getByRole('heading', { name: title })
  expect(largeTitle).toBeVisible()
  // RN Web's injected atomic font-size rule wins incorrectly over this inline
  // declaration in jsdom. Assert the actual Source geometry and title handoff.
  expect(largeTitle.style.fontSize).toBe('28px')
  fireEvent.scroll(scroll, { target: { scrollTop: 96 } })
  await waitFor(() => expect(largeTitle.closest('[aria-hidden="true"]')).not.toBeNull())
  const compactTitle = screen.getByRole('heading', { name: title })
  expect(compactTitle).not.toBe(largeTitle)
  expect(compactTitle).toBeVisible()
  expect(compactTitle.style.fontSize).toBe('16px')
  fireEvent.scroll(scroll, { target: { scrollTop: 0 } })
  await waitFor(() => expect(screen.getByRole('heading', { name: title })).toBe(largeTitle))
}

describe('PRIME playable service flows', () => {
  it('books a Czech branch meeting while isolating Prime, Private and saved Demo meetings', async () => {
    const savedDemoMeetings = JSON.stringify(createDemoAppointments())
    localStorage.setItem('uc-demo-appointments-v2:CZ', savedDemoMeetings)
    await renderPrime('CZ', true)
    fireEvent.click(screen.getByRole('button', { name: 'Book an appointment' }))
    await screen.findByRole('button', { name: 'Open What do you want to talk about?' })
    await expectScrollingTitle('Select the location and date of the appointment')
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: /Open appointment/ })).not.toBeInTheDocument()
    await choose('What do you want to talk about?', /I want to invest/)
    await choose('Give us more details about your request', 'Savings')
    const branch = screen.getByRole('radio', { name: /Branch meeting/ })
    fireEvent.click(branch)
    await waitFor(() => expect(branch).toHaveAttribute('aria-checked', 'true'))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled())
    await expectAdvisorPortrait('Iacob Mihai', 'standard-advisor')
    fireEvent.click(await screen.findByRole('button', { name: 'See more slots' }))
    const slot = await screen.findByRole('button', { name: '16:30' })
    fireEvent.click(slot)
    await waitFor(() => expect(slot).toHaveAttribute('aria-selected', 'true'))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await enterMultilineNotes('Discuss my Prime savings options')
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByText('Discuss my Prime savings options')
    const email = screen.getByRole('textbox', { name: 'Your email address' })
    expect(email).toHaveValue('marco.rossi@example.com')
    fireEvent.change(email, { target: { value: 'invalid' } })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled())
    fireEvent.change(email, { target: { value: 'teodora@example.com' } })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Confirm' })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    await screen.findByText('Appointment request was successfully sent')
    expect(localStorage.getItem('uc-demo-appointments-v2:CZ')).toBe(savedDemoMeetings)
    fireEvent.click(screen.getByRole('button', { name: 'Ok, got it' }))
    fireEvent.click(await screen.findByRole('button', { name: /Open appointment/ }))
    await screen.findByText('Meeting details')
    await expectAdvisorPortrait('Iacob Mihai', 'standard-advisor')
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    await screen.findByRole('button', { name: /Open appointment/ })
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    await screen.findByRole('button', { name: 'Call now' })
    fireEvent.click(screen.getByRole('button', { name: 'Book an appointment' }))
    await screen.findByRole('button', { name: /Open appointment/ })
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    await screen.findByRole('button', { name: 'Book an appointment' })
    fireEvent.click(screen.getByRole('button', { name: 'Switch to Private customer' }))
    await screen.findByText('Anna Dvořáková')
    fireEvent.click(screen.getByRole('button', { name: 'Book an appointment' }))
    await screen.findByRole('button', { name: 'Open What do you want to talk about?' })
    expect(screen.queryByRole('button', { name: /Open appointment/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    await choose('What do you want to talk about?', /I want to invest/)
    fireEvent.click(screen.getByRole('radio', { name: /Branch meeting/ }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    fireEvent.click(await screen.findByRole('button', { name: 'Continue' }))
    await expectAdvisorPortrait('Anna Dvořáková', 'private-advisor')
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    await screen.findByRole('button', { name: 'Open What do you want to talk about?' })
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    await screen.findByText('Anna Dvořáková')
    fireEvent.click(screen.getByRole('button', { name: 'Switch to Prime customer' }))
    await screen.findByText('Iacob Mihai')
    fireEvent.click(screen.getByRole('button', { name: 'Book an appointment' }))
    await screen.findByRole('button', { name: /Open appointment/ })
    await screen.findByText(/16:30/)
    expect(localStorage.getItem('uc-demo-appointments-v2:CZ')).toBe(savedDemoMeetings)
  })

  it('validates a Romanian callback, preserves edited notes and returns to the advisor after confirmation', async () => {
    await renderPrime('RO')
    fireEvent.click(screen.getByRole('button', { name: 'Request a call' }))
    await screen.findByRole('textbox', { name: 'Mobile number' })
    await expectScrollingTitle('Request a call')
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    await choose('What do you want to talk about?', /I want to invest/)
    await choose('Give us more details about your request', 'Savings')
    await choose('Contact me during', '09:00 - 11:00')
    const phone = screen.getByRole('textbox', { name: 'Mobile number' })
    expect(phone).toHaveValue('721234567')
    fireEvent.change(phone, { target: { value: '123' } })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled())
    fireEvent.change(phone, { target: { value: '721 999 888' } })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await enterMultilineNotes('Please explain the Prime service')
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByText('+40 721 999 888')
    await screen.findByText('Please explain the Prime service')
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(await screen.findByRole('textbox', { name: 'Additional notes' })).toHaveValue(
      'Please explain the Prime service',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Confirm' }))
    await screen.findByText('Request a call successfully confirmed')
    fireEvent.click(screen.getByRole('button', { name: 'Ok, got it' }))
    await screen.findByRole('button', { name: 'Call now' })
    await screen.findByText('Iacob Mihai')
  })

  it('returns from either fresh service form to the PRIME advisor without entering another app route', async () => {
    await renderPrime('CZ')
    fireEvent.click(screen.getByRole('button', { name: 'Book an appointment' }))
    await screen.findByRole('button', { name: 'Open What do you want to talk about?' })
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    await screen.findByRole('button', { name: 'Request a call' })
    fireEvent.click(screen.getByRole('button', { name: 'Request a call' }))
    await screen.findByRole('textbox', { name: 'Mobile number' })
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    await screen.findByRole('button', { name: 'Book an appointment' })
    expect(screen.queryByText(/reference stops at this handoff/)).not.toBeInTheDocument()
  })
})
