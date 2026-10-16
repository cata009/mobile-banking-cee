// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DemoProvider, useDemo } from '@/app/state/demoStore'
import AppointmentScreen from '@/app/screens/appointments/AppointmentScreen'
import { saveAppointments } from '@/app/screens/appointments/appointmentModel'
import ProductsScreen from '@/app/screens/products/ProductsScreen'
import DocumentsScreen from '@/app/screens/documents/DocumentsScreen'
import MessagesScreen from '@/app/screens/messages/MessagesScreen'
import { getProductsMenuForCountry } from '@/app/config/productsMenuConfig'
import { asyncNativeReady, nativeWebRendererDiagnostics, resetNativeWebRendererDiagnostics } from '../helpers/nativeWebRenderer'

const translation = vi.hoisted(() => ({ language: 'en', t: (_key: string, fallback?: string) => fallback ?? _key }))
vi.mock('@/app/components/demo/nativeDemoLoader', () => ({
  loadNativeDemoModule: async () => (await import('../helpers/nativeWebRenderer')).loadNativeDemoModuleForWebTest(),
}))
vi.mock('@/app/contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: translation.t, language: translation.language }),
}))
vi.mock('@/app/components/products/ProductCardBottomSheet', () => ({
  default: ({ card }: { card: { title: string } }) => <div role="dialog" aria-label="Selected product">{card.title}</div>,
}))

function Providers({ children }: PropsWithChildren) {
  return <DemoProvider initialState={{ country: 'CZ', release: 'release-current' }}>{children}</DemoProvider>
}
function SmeProviders({ children }: PropsWithChildren) {
  return <DemoProvider initialState={{ product: 'SME', country: 'CZ', release: 'release-current' }}>{children}</DemoProvider>
}
function CountryControl() {
  const { country, setCountry } = useDemo()
  return <button type="button" onClick={() => setCountry(country === 'CZ' ? 'RO' : 'CZ')}>Switch country</button>
}
function CountryAppointmentEntry({ onBack }: { onBack: () => void }) {
  const { country } = useDemo()
  return <AppointmentScreen country={country} onBack={onBack} />
}
beforeEach(() => {
  localStorage.clear()
  translation.language = 'en'
  translation.t = (key, fallback) => fallback ?? key
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 9, 7, 9))
})
afterEach(() => { cleanup(); vi.useRealTimers(); localStorage.clear(); resetNativeWebRendererDiagnostics() })

function useDateOnlyTimersForNativeHost() {
  vi.useRealTimers()
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 7, 9))
}

describe('Effects preserve their intended lifetime', () => {
  it('keeps an appointment selection through language changes and resets on country changes in Native', async () => {
    useDateOnlyTimersForNativeHost()
    saveAppointments('CZ', [])
    saveAppointments('RO', [])
    const onBack = vi.fn()
    const rendered = render(<><CountryControl /><CountryAppointmentEntry onBack={onBack} /></>, { wrapper: Providers })
    await asyncNativeReady(rendered.container)
    expect(nativeWebRendererDiagnostics.snapshots.at(-1)).toMatchObject({ country: 'CZ', route: { screen: 'appointments' } })
    fireEvent.click(screen.getByRole('button', { name: 'Open What do you want to talk about?' }))
    const reasonSheet = await screen.findByRole('dialog')
    const investmentReason = within(reasonSheet).getByRole('checkbox', { name: /I want to invest/ })
    fireEvent.click(investmentReason)
    await waitFor(() => expect(investmentReason).toHaveAttribute('aria-checked', 'true'))
    fireEvent.click(within(reasonSheet).getByRole('button', { name: 'Select' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    const branchMeeting = await screen.findByRole('radio', { name: /Branch meeting/ })
    fireEvent.click(branchMeeting)
    await waitFor(() => expect(branchMeeting).toHaveAttribute('aria-checked', 'true'))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    const morningSlot = await screen.findByRole('button', { name: '10:00' })
    fireEvent.click(morningSlot)
    await waitFor(() => expect(screen.getByRole('button', { name: '10:00' })).toHaveAttribute('aria-selected', 'true'))
    translation.language = 'cs'
    translation.t = (key, fallback) => key === 'prime.advisor.branch' ? 'Translated branch' : fallback ?? key
    rendered.rerender(<><CountryControl /><CountryAppointmentEntry onBack={onBack} /></>)
    await waitFor(() => expect(screen.getByRole('button', { name: '10:00' })).toHaveAttribute('aria-selected', 'true'))
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
    await waitFor(() => expect(nativeWebRendererDiagnostics.snapshots.at(-1)?.language).toBe('cs'))
    fireEvent.click(screen.getByRole('button', { name: 'Switch country' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
      expect(screen.getByRole('textbox', { name: 'What do you want to talk about?' })).toHaveValue('')
      expect(screen.getByRole('radio', { name: /Branch meeting/ })).toHaveAttribute('aria-checked', 'false')
      expect(nativeWebRendererDiagnostics.snapshots.at(-1)?.country).toBe('RO')
    })
    expect(screen.queryByRole('button', { name: '10:00' })).not.toBeInTheDocument()
  })

  it('preserves the SME Source shelf request lifetime, original card, locale and callback', () => {
    const firstHandled = vi.fn()
    const secondHandled = vi.fn()
    const accountTitle = getProductsMenuForCountry('CZ').products.find(({ id }) => id === 'account')!.title
    const rendered = render(<ProductsScreen productsShelfFocusRequest={{ requestId: 1, cardId: 'account' }} onProductsShelfFocusHandled={firstHandled} />, { wrapper: SmeProviders })
    act(() => vi.advanceTimersByTime(50))
    translation.t = (key, fallback) => key.startsWith('runtime.productsMenu.cards.') ? 'Translated card' : fallback ?? key
    rendered.rerender(<ProductsScreen productsShelfFocusRequest={{ requestId: 1, cardId: 'cards' }} onProductsShelfFocusHandled={secondHandled} />)
    act(() => vi.advanceTimersByTime(49))
    expect(firstHandled).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1))
    expect(firstHandled).toHaveBeenCalledOnce()
    expect(secondHandled).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog', { name: 'Selected product' })).toHaveTextContent(accountTitle)
    rendered.rerender(<ProductsScreen productsShelfFocusRequest={{ requestId: 1, cardId: 'cards' }} onProductsShelfFocusHandled={secondHandled} />)
    act(() => vi.advanceTimersByTime(100))
    expect(secondHandled).not.toHaveBeenCalled()
    rendered.rerender(<ProductsScreen productsShelfFocusRequest={{ requestId: 2, cardId: 'cards' }} onProductsShelfFocusHandled={secondHandled} />)
    act(() => vi.advanceTimersByTime(100))
    expect(secondHandled).toHaveBeenCalledOnce()
    expect(screen.getByRole('dialog', { name: 'Selected product' })).toHaveTextContent('Translated card')
  })

  it('cancels a pending shelf request on unmount', () => {
    const onHandled = vi.fn()
    const rendered = render(<ProductsScreen productsShelfFocusRequest={{ requestId: 1 }} onProductsShelfFocusHandled={onHandled} />, { wrapper: SmeProviders })
    act(() => vi.advanceTimersByTime(50))
    rendered.unmount()
    act(() => vi.advanceTimersByTime(100))
    expect(onHandled).not.toHaveBeenCalled()
  })

  it('keeps Native document deletion cancelable and country scoped through the Source entry', async () => {
    useDateOnlyTimersForNativeHost()
    const onBack = vi.fn()
    const onHelpClick = vi.fn()
    const rendered = render(<><CountryControl /><DocumentsScreen onBack={onBack} onHelpClick={onHelpClick} /></>, { wrapper: Providers })
    const surface = await asyncNativeReady(rendered.container)
    expect(nativeWebRendererDiagnostics.snapshots.at(-1)).toMatchObject({ country: 'CZ', route: { screen: 'documents' } })
    const id = 'documents-2026-06-03'
    fireEvent.click(screen.getByRole('button', { name: `Document actions ${id}` }))
    fireEvent.click(await screen.findByRole('button', { name: `Delete document ${id}` }))
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: `Delete document ${id}` })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: `Document actions ${id}` }))
    fireEvent.click(await screen.findByRole('button', { name: `Delete document ${id}` }))
    fireEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(screen.queryByRole('button', { name: `Document actions ${id}` })).not.toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: 'Switch country' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: `Document actions ${id}` })).toBeInTheDocument()
      expect(nativeWebRendererDiagnostics.snapshots.at(-1)?.country).toBe('RO')
    })
    fireEvent.click(screen.getByRole('button', { name: 'Switch country' }))
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: `Document actions ${id}` })).not.toBeInTheDocument()
      expect(nativeWebRendererDiagnostics.snapshots.at(-1)?.country).toBe('CZ')
    })
    expect(surface.querySelector('[data-native-current-host="true"]')?.textContent).toContain('Documents')
  })

  it('re-filters messages using new translations without clearing the search', () => {
    const rendered = render(<MessagesScreen onBack={vi.fn()} />, { wrapper: Providers })
    const search = screen.getByRole('searchbox')
    fireEvent.change(search, { target: { value: 'Localized message' } })
    expect(screen.queryByText('Localized message')).not.toBeInTheDocument()
    translation.t = (key, fallback) => key.startsWith('runtime.messages.rows.') && key.endsWith('.title') ? 'Localized message' : fallback ?? key
    rendered.rerender(<MessagesScreen onBack={vi.fn()} />)
    expect(search).toHaveValue('Localized message')
    expect(screen.getAllByText('Localized message').length).toBeGreaterThan(0)
  })
})
