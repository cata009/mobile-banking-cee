// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DemoProvider, useDemo } from '@/app/state/demoStore'
import AppointmentScreen from '@/app/screens/appointments/AppointmentScreen'
import { saveAppointments } from '@/app/screens/appointments/appointmentModel'
import ProductsScreen from '@/app/screens/products/ProductsScreen'
import DocumentsScreen from '@/app/screens/documents/DocumentsScreen'
import MessagesScreen from '@/app/screens/messages/MessagesScreen'
import { getProductsMenuForCountry } from '@/app/config/productsMenuConfig'

const translation = vi.hoisted(() => ({ t: (_key: string, fallback?: string) => fallback ?? _key }))
vi.mock('@/app/contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: translation.t, language: 'en' }),
}))
vi.mock('@/app/components/products/ProductCardBottomSheet', () => ({
  default: ({ card }: { card: { title: string } }) => <div role="dialog" aria-label="Selected product">{card.title}</div>,
}))

function Providers({ children }: PropsWithChildren) {
  return <DemoProvider initialState={{ country: 'CZ', release: 'release-current' }}>{children}</DemoProvider>
}
function CountryControl() {
  const { country, setCountry } = useDemo()
  return <button type="button" onClick={() => setCountry(country === 'CZ' ? 'RO' : 'CZ')}>Switch country</button>
}

beforeEach(() => {
  localStorage.clear()
  translation.t = (key, fallback) => fallback ?? key
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 9, 7, 9))
})
afterEach(() => { cleanup(); vi.useRealTimers(); localStorage.clear() })

describe('Effects preserve their intended lifetime', () => {
  it('keeps an appointment selection through translation changes and resets on country changes', () => {
    saveAppointments('CZ', [])
    saveAppointments('RO', [])
    const onBack = vi.fn()
    const rendered = render(<AppointmentScreen country="CZ" onBack={onBack} />, { wrapper: Providers })
    fireEvent.click(screen.getByRole('button', { name: 'Open What do you want to talk about?' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('checkbox', { name: /I want to invest/ }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Select' }))
    fireEvent.click(screen.getByRole('radio', { name: /Branch meeting/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    fireEvent.click(screen.getByRole('button', { name: '10:00' }))
    translation.t = (key, fallback) => key === 'prime.advisor.branch' ? 'Translated branch' : fallback ?? key
    rendered.rerender(<AppointmentScreen country="CZ" onBack={onBack} />)
    expect(screen.getByRole('button', { name: '10:00' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
    rendered.rerender(<AppointmentScreen country="RO" onBack={onBack} />)
    expect(screen.queryByRole('button', { name: '10:00' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    expect(screen.getByText('Translated branch')).toBeInTheDocument()
  })

  it('handles a shelf request once at 100ms using its original card, locale and callback', () => {
    const firstHandled = vi.fn()
    const secondHandled = vi.fn()
    const accountTitle = getProductsMenuForCountry('CZ').products.find(({ id }) => id === 'account')!.title
    const rendered = render(<ProductsScreen productsShelfFocusRequest={{ requestId: 1, cardId: 'account' }} onProductsShelfFocusHandled={firstHandled} />, { wrapper: Providers })
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
    const rendered = render(<ProductsScreen productsShelfFocusRequest={{ requestId: 1 }} onProductsShelfFocusHandled={onHandled} />, { wrapper: Providers })
    act(() => vi.advanceTimersByTime(50))
    rendered.unmount()
    act(() => vi.advanceTimersByTime(100))
    expect(onHandled).not.toHaveBeenCalled()
  })

  it('keeps deleted documents country scoped and cancel keeps the document', () => {
    render(<><CountryControl /><DocumentsScreen onBack={vi.fn()} /></>, { wrapper: Providers })
    const id = 'documents-2026-06-03'
    fireEvent.click(screen.getByRole('button', { name: `Document actions ${id}` }))
    fireEvent.click(screen.getByRole('button', { name: `Delete document ${id}` }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('button', { name: `Document actions ${id}` })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: `Document actions ${id}` }))
    fireEvent.click(screen.getByRole('button', { name: `Delete document ${id}` }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.queryByRole('button', { name: `Document actions ${id}` })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Switch country' }))
    expect(screen.getByRole('button', { name: `Document actions ${id}` })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Switch country' }))
    expect(screen.queryByRole('button', { name: `Document actions ${id}` })).not.toBeInTheDocument()
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
