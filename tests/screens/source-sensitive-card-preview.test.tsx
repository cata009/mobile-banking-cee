// @vitest-environment jsdom

import type { PropsWithChildren } from 'react'
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DemoProvider } from '@/app/state/demoStore'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { mockProducts, type CreditCard, type DebitCard } from '@/data/products'
import CardSensitiveDetailsScreen from '@/app/screens/cards/CardSensitiveDetailsScreen'

const preview = vi.hoisted(() => ({ component: vi.fn((..._args: unknown[]) => null) }))

vi.mock('@/app/components/demo/NativeScreenPreview', () => ({
  NativeScreenPreview: preview.component,
}))

function AppProviders({ children }: PropsWithChildren) {
  return (
    <DemoProvider initialState={{ country: 'RO', product: 'PI' }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  )
}

const card = mockProducts.find(
  (product): product is DebitCard | CreditCard => product.type === 'debit_card' || product.type === 'credit_card',
)!

afterEach(() => {
  cleanup()
  preview.component.mockClear()
})

describe('Source sensitive-card preview contract', () => {
  it('passes the authorized card object to the existing Native card screen with the default title', () => {
    const onBack = vi.fn()
    render(<CardSensitiveDetailsScreen card={card} onBack={onBack} />, { wrapper: AppProviders })

    expect(preview.component).toHaveBeenCalledTimes(1)
    const call = preview.component.mock.calls[0]
    expect(call).toBeDefined()
    if (!call) return
    const props = call[0] as {
      route: { screen: string }
      snapshot?: { bankingPresentation?: { sensitiveCard?: unknown; sensitiveTitle?: string } }
      onBack?: () => void
    }
    expect(props.route).toEqual({ screen: 'card' })
    expect(props.snapshot?.bankingPresentation?.sensitiveCard).toBe(card)
    expect(props.snapshot?.bankingPresentation?.sensitiveTitle).toBe('Card details')
    expect(props.onBack).toBe(onBack)
  })

  it('preserves the caller-provided Source title in the Native card presentation', () => {
    const onBack = vi.fn()
    render(<CardSensitiveDetailsScreen card={card} onBack={onBack} title="Reveal card details" />, {
      wrapper: AppProviders,
    })

    expect(preview.component).toHaveBeenCalledTimes(1)
    const call = preview.component.mock.calls[0]
    expect(call).toBeDefined()
    if (!call) return
    const props = call[0] as {
      snapshot?: { bankingPresentation?: { sensitiveCard?: unknown; sensitiveTitle?: string } }
    }
    expect(props.snapshot?.bankingPresentation).toEqual({
      sensitiveCard: card,
      sensitiveTitle: 'Reveal card details',
    })
    expect(props.snapshot?.bankingPresentation?.sensitiveCard).toBe(card)
  })
})
