// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps, ComponentType, PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import AccountSummary from '@/app/screens/home/AccountSummary'
import { DemoProvider } from '@/app/state/demoStore'
import type { DemoState } from '@/app/state/demoTypes'

const CZ_PRODUCT_COUNTS: DemoState['productCounts'] = {
  accounts: 2,
  debitCards: 0,
  creditCards: 0,
  mealCards: 0,
  deposits: 0,
  savingsAccounts: 0,
  loans: 0,
  mortgages: 0,
  investments: 0,
}

type AccountSummaryFutureProps = ComponentProps<typeof AccountSummary> & {
  onDomesticPaymentClick?: () => void
  onAccountInfoClick?: (product: { id: string }) => void
  onInvestmentGoalsClick?: () => void
}

const FutureAccountSummary = AccountSummary as ComponentType<AccountSummaryFutureProps>

function TestProviders({
  children,
  release,
  productCounts = CZ_PRODUCT_COUNTS,
}: PropsWithChildren<{
  release: DemoState['release']
  productCounts?: DemoState['productCounts']
}>) {
  return (
    <DemoProvider
      initialState={{
        product: 'PI',
        country: 'CZ',
        scenario: 'active',
        release,
        bankingScenario: 'retail-single-account',
        productCounts,
      }}
    >
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  )
}

afterEach(cleanup)

describe('Future CZ Homepage account cards', () => {
  it('renders the Figma evolution cards with account quick actions and keeps action clicks out of card navigation', () => {
    const onAccountClick = vi.fn()
    const onDomesticPaymentClick = vi.fn()
    const onAccountInfoClick = vi.fn()
    const { container } = render(
      <TestProviders release="release-future-cz-robo">
        <FutureAccountSummary
          onAccountClick={onAccountClick}
          onDomesticPaymentClick={onDomesticPaymentClick}
          onAccountInfoClick={onAccountInfoClick}
        />
      </TestProviders>,
    )

    const accountCards = container.querySelectorAll('[data-product-card-evolution]')
    expect(accountCards).toHaveLength(2)
    expect(accountCards[0]).toHaveClass('w-full', 'max-w-full')
    expect(accountCards[0]).not.toHaveClass('w-[327px]')
    const amountRow = accountCards[0]?.querySelector('[data-product-card-amount]')
    expect(amountRow).toHaveClass('justify-start')
    expect(amountRow).not.toHaveClass('justify-end')
    expect(container.querySelectorAll('[data-product-card-actions]')).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: 'New payment', hidden: true })).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: 'Scan QR code', hidden: true })).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: 'Create QR code', hidden: true })).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: 'Account info', hidden: true })).toHaveLength(2)
    expect(screen.queryByRole('button', { name: 'Share IBAN', hidden: true })).not.toBeInTheDocument()
    const visibleNewPayment = screen.getByRole('button', { name: 'New payment' })
    const visibleScanQr = screen.getByRole('button', { name: 'Scan QR code' })
    const visibleAccountInfo = screen.getByRole('button', { name: 'Account info' })
    const newPaymentIcon = visibleNewPayment.querySelector('svg')
    const scanQrIcon = visibleScanQr.querySelector('svg')
    const accountInfoIcon = visibleAccountInfo.querySelector('svg')

    expect(newPaymentIcon).toHaveAttribute('viewBox', '0 0 24 24')
    expect(newPaymentIcon).toHaveAttribute('width', '24')
    expect(newPaymentIcon).toHaveAttribute('height', '24')
    expect(newPaymentIcon?.querySelectorAll('path')).toHaveLength(4)
    expect(newPaymentIcon?.querySelector('path')).toHaveAttribute(
      'd',
      'M10.9248 5.125C10.9248 6.85062 9.58194 8.25 7.92473 8.25C6.26812 8.25 4.92471 6.85062 4.92471 5.125C4.92471 3.39875 6.26812 2 7.92473 2C9.58194 2 10.9248 3.39875 10.9248 5.125Z',
    )
    expect(scanQrIcon).toHaveAttribute('viewBox', '0 0 24 24')
    expect(scanQrIcon).toHaveAttribute('width', '24')
    expect(scanQrIcon).toHaveAttribute('height', '24')
    expect(scanQrIcon?.querySelectorAll('path')).toHaveLength(9)
    expect(scanQrIcon?.querySelector('path')).toHaveAttribute(
      'd',
      'M5.92339 7.48387H7.85887V5.54839H5.92339V7.48387Z',
    )
    expect(accountInfoIcon).toHaveAttribute('viewBox', '0 0 24 24')
    expect(accountInfoIcon).toHaveAttribute('width', '24')
    expect(accountInfoIcon).toHaveAttribute('height', '24')
    expect(accountInfoIcon?.querySelector('path')).toHaveAttribute(
      'd',
      'M11.8747 8.55461C12.9131 8.55461 13.7547 7.71307 13.7547 6.67461C13.7547 5.63692 12.9131 4.79461 11.8747 4.79461C10.8362 4.79461 9.99469 5.63692 9.99469 6.67461C9.99469 7.71307 10.8362 8.55461 11.8747 8.55461ZM10.3258 16.2177C10.3258 17.7846 10.8381 19.2061 13.4027 19.2061V10.8623H10.3258V16.2177ZM11.875 2C17.3981 2 21.875 6.47769 21.875 12C21.875 17.5231 17.3981 22 11.875 22C6.35192 22 1.875 17.5231 1.875 12C1.875 6.47769 6.35192 2 11.875 2Z',
    )

    fireEvent.click(visibleNewPayment)
    expect(onDomesticPaymentClick).toHaveBeenCalledTimes(1)
    expect(onAccountClick).not.toHaveBeenCalled()

    fireEvent.click(visibleAccountInfo)
    expect(onAccountInfoClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'acc-1' }))
    expect(onAccountClick).not.toHaveBeenCalled()
  })

  it('keeps the baseline Homepage on the legacy product-card presentation', () => {
    const { container } = render(
      <TestProviders release="release-current">
        <AccountSummary />
      </TestProviders>,
    )

    expect(container.querySelector('[data-product-card-evolution]')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'New payment' })).not.toBeInTheDocument()
  })

  it('adds the Figma Investment goals card and 20px section headings only to Future CZ Robo', () => {
    const onInvestmentGoalsClick = vi.fn()
    const productCounts = {
      ...CZ_PRODUCT_COUNTS,
      accounts: 0,
      investments: 1,
    }
    render(
      <TestProviders release="release-future-cz-robo" productCounts={productCounts}>
        <FutureAccountSummary onInvestmentGoalsClick={onInvestmentGoalsClick} />
      </TestProviders>,
    )

    expect(screen.getByRole('heading', { name: 'Investment' })).toHaveClass('text-[20px]')
    fireEvent.click(screen.getByRole('button', { name: 'Investment' }))

    expect(screen.getByText('Security Portfolio')).toBeInTheDocument()
    const goalsCard = screen.getByText('Investment goals').closest('[data-product-card-evolution]')
    expect(goalsCard).toBeInTheDocument()
    expect(goalsCard).toHaveTextContent('151 241')
    expect(goalsCard).toHaveTextContent('.33 CZK')
    expect(screen.getByText('Total investments')).toBeInTheDocument()
    expect(screen.getByText('193 741')).toBeInTheDocument()

    const goalsIcon = goalsCard?.querySelector('svg')
    expect(goalsIcon).toHaveAttribute('width', '32')
    expect(goalsIcon).toHaveAttribute('height', '32')
    expect(goalsIcon).toHaveAttribute('viewBox', '0 0 32 32')
    expect(goalsIcon?.querySelectorAll('path')).toHaveLength(3)
    expect(goalsIcon?.querySelector('path')).toHaveAttribute(
      'd',
      'M7.83871 22.2308V9.76923C7.83871 8.23992 6.56768 7 5 7V22.2308C5 23.7601 6.27103 25 7.83871 25H27C27 23.4707 25.729 22.2308 24.1613 22.2308H7.83871Z',
    )

    fireEvent.click(goalsCard!)
    expect(onInvestmentGoalsClick).toHaveBeenCalledTimes(1)

    cleanup()
    render(
      <TestProviders release="release-current" productCounts={productCounts}>
        <AccountSummary />
      </TestProviders>,
    )
    expect(screen.getByRole('heading', { name: 'Investment' })).not.toHaveClass('text-[20px]')
    expect(screen.queryByText('Investment goals')).not.toBeInTheDocument()
  })
})
