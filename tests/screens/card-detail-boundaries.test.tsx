// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import CardDetailScreen from '@/app/screens/cards/CardDetailScreen'
import CardDetailsInfoScreen from '@/app/screens/cards/CardDetailsInfoScreen'
import { DemoProvider } from '@/app/state/demoStore'
import { mockProducts, type Product } from '@/data/products'

const mockedProductState = vi.hoisted(() => ({
  categories: [] as Array<{ key: string; title: string; products: Product[] }>,
}))

vi.mock('@/hooks/useProducts', () => ({
  useProducts: () => mockedProductState,
}))

function AppProviders({ children }: PropsWithChildren) {
  return (
    <DemoProvider initialState={{ country: 'CZ', product: 'PI' }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  )
}

const creditCard = mockProducts.find((product) => product.type === 'credit_card')
if (!creditCard || creditCard.type !== 'credit_card') throw new Error('Expected credit-card fixture')

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
  })
})

afterEach(() => {
  vi.useRealTimers()
  cleanup()
  mockedProductState.categories = []
})

describe('card-detail action boundaries', () => {
  it('opens Card Details directly but keeps Show Card Details behind Face ID', () => {
    vi.useFakeTimers()
    mockedProductState.categories = [{ key: 'cards', title: 'Cards', products: [creditCard] }]
    const onCardDetailsClick = vi.fn()
    const onShowCardDetailsClick = vi.fn()

    render(
      <CardDetailScreen
        selectedCardId={creditCard.id}
        onBack={() => undefined}
        onCardDetailsClick={onCardDetailsClick}
        onShowCardDetailsClick={onShowCardDetailsClick}
      />,
      { wrapper: AppProviders },
    )

    fireEvent.click(screen.getByRole('button', { name: 'Card Details' }))
    expect(onCardDetailsClick).toHaveBeenCalledWith(creditCard)
    expect(onShowCardDetailsClick).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Show Card Details' }))
    expect(onShowCardDetailsClick).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(840))
    expect(onShowCardDetailsClick).toHaveBeenCalledWith(creditCard)
  })

  it('reserves an unclipped overlay lane for the card shadow', () => {
    mockedProductState.categories = [{ key: 'cards', title: 'Cards', products: [creditCard] }]

    const { container } = render(
      <CardDetailScreen selectedCardId={creditCard.id} onBack={() => undefined} />,
      { wrapper: AppProviders },
    )

    const carousel = container.querySelector('[data-card-carousel]')
    expect(carousel).toHaveClass('relative', 'z-10', 'pb-[20px]', '-mb-[20px]')
  })

  it('keeps the direct Card Details page informational and non-sensitive', () => {
    mockedProductState.categories = [{ key: 'cards', title: 'Cards', products: [creditCard] }]

    render(
      <CardDetailsInfoScreen selectedCardId={creditCard.id} onBack={() => undefined} />,
      { wrapper: AppProviders },
    )

    expect(screen.getByText('Card product')).toBeInTheDocument()
    expect(screen.getByText('Card status')).toBeInTheDocument()
    expect(screen.getByText('Credit limit')).toBeInTheDocument()
    expect(screen.queryByText(creditCard.cardNumber)).not.toBeInTheDocument()
    expect(screen.queryByText(creditCard.securityCode ?? '')).not.toBeInTheDocument()
  })
})
