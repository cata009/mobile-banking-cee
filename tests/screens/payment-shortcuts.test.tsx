// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'
import PaymentsScreen from '@/app/screens/payments/PaymentsScreen'
import PaymentTemplatesScreen from '@/app/screens/payments/PaymentTemplatesScreen'
import ExchangeRatesScreen from '@/app/screens/payments/ExchangeRatesScreen'

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider initialState={{ country: 'RO' }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  )
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('Payments shortcut screens', () => {
  it('filters templates and beneficiaries with one connected search', () => {
    render(
      <PaymentTemplatesScreen onBack={() => undefined} onSelect={() => undefined} />,
      { wrapper: Providers },
    )

    expect(screen.getByText('GREEN ENERGY INVOICE')).toBeInTheDocument()
    expect(screen.getAllByText('MARIA POPESCU').length).toBeGreaterThan(0)

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search' }), {
      target: { value: 'north' },
    })

    expect(screen.getByText('MONTHLY RENT')).toBeInTheDocument()
    expect(screen.queryByText('GREEN ENERGY INVOICE')).not.toBeInTheDocument()
    expect(screen.queryByText('MARIA POPESCU')).not.toBeInTheDocument()

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search' }), {
      target: { value: 'no matching saved payment' },
    })
    expect(screen.getByText('No templates or beneficiaries found')).toBeInTheDocument()
  })

  it('returns the selected template or beneficiary through the same typed action', () => {
    const onSelect = vi.fn()

    render(<PaymentTemplatesScreen onBack={() => undefined} onSelect={onSelect} />, {
      wrapper: Providers,
    })

    fireEvent.click(screen.getByRole('button', { name: /Use template GREEN ENERGY INVOICE/i }))
    expect(onSelect).toHaveBeenLastCalledWith(expect.objectContaining({
      kind: 'template',
      beneficiaryName: 'Green Energy Services',
      amount: '286,40',
    }))

    fireEvent.click(screen.getByRole('button', { name: /Use beneficiary VICTOR IONESCU/i }))
    expect(onSelect).toHaveBeenLastCalledWith(expect.objectContaining({
      kind: 'beneficiary',
      beneficiaryName: 'Victor Ionescu',
      amount: '',
    }))
  })

  it('recalculates exchange results after amount and source-currency changes', () => {
    const { container } = render(<ExchangeRatesScreen onBack={() => undefined} />, { wrapper: Providers })

    const currencySelector = screen.getByRole('button', { name: 'Choose currency, current RON' })
    expect(currencySelector).toBeInTheDocument()
    expect(currencySelector).toHaveClass('w-[96px]')
    expect(currencySelector.querySelector('.uc-type-n2')).toHaveTextContent('RON')
    expect(container.querySelector('svg[data-currency-flag="EUR"]')).toBeInTheDocument()
    expect(container.textContent).not.toContain('🇪🇺')
    fireEvent.change(screen.getByRole('textbox', { name: 'Amount' }), { target: { value: '10' } })
    expect(screen.getByLabelText('10 RON equals 1.9092 EUR')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Choose currency, current RON' }))
    const chooser = screen.getByRole('dialog', { name: 'Choose currency' })
    fireEvent.click(within(chooser).getByRole('radio', { name: 'EUR' }))
    fireEvent.click(within(chooser).getByRole('button', { name: 'OK' }))

    expect(screen.getByRole('button', { name: 'Choose currency, current EUR' })).toBeInTheDocument()
    expect(screen.getByLabelText('10 EUR equals 52.3790 RON')).toBeInTheDocument()
  })

  it('discards an unconfirmed currency choice when the sheet closes', () => {
    render(<ExchangeRatesScreen onBack={() => undefined} />, { wrapper: Providers })

    fireEvent.click(screen.getByRole('button', { name: 'Choose currency, current RON' }))
    const chooser = screen.getByRole('dialog', { name: 'Choose currency' })
    fireEvent.click(within(chooser).getByRole('radio', { name: 'USD' }))
    fireEvent.click(within(chooser).getByRole('button', { name: 'Close currency chooser' }))

    expect(screen.getByRole('button', { name: 'Choose currency, current RON' })).toBeInTheDocument()
  })

  it('opens both child views from the existing Payments shortcuts and returns to the hub', () => {
    const onTemplateSelect = vi.fn()
    render(<PaymentsScreen onTemplateSelect={onTemplateSelect} />, { wrapper: Providers })

    fireEvent.click(screen.getByRole('button', { name: 'My Templates' }))
    expect(screen.getAllByRole('heading', { name: 'Templates' }).length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: 'Use template GREEN ENERGY INVOICE for Green Energy Services' }))
    expect(onTemplateSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'green-energy' }))

    cleanup()
    render(<PaymentsScreen />, { wrapper: Providers })
    fireEvent.click(screen.getByRole('button', { name: 'Exchange Rates' }))
    expect(screen.getAllByRole('heading', { name: 'Exchange rates' }).length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('heading', { name: 'Payments' })).toBeInTheDocument()
  })
})
