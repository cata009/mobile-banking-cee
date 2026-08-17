// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DomesticPaymentCreateScreen } from '@/app/screens/payments/DomesticPaymentFlowScreens'
import { DemoProvider } from '@/app/state/demoStore'
import { createEmptyDomesticPaymentDraft } from '@/data/paymentFlow'

afterEach(cleanup)

describe('Domestic payment footer', () => {
  it('uses the full footer width for the Next action', () => {
    const { container } = render(
      <DemoProvider initialState={{ country: 'CZ', product: 'PI', release: 'release-future-evo-2027' }}>
        <LanguageProvider initialLanguage="en">
          <DomesticPaymentCreateScreen draft={createEmptyDomesticPaymentDraft('CZ')} onBack={vi.fn()} onNext={vi.fn()} />
        </LanguageProvider>
      </DemoProvider>,
    )

    const footer = container.querySelector('[data-domestic-payment-footer]')
    expect(footer).toHaveClass('w-full')
    expect(screen.getByRole('button', { name: 'Next' })).toHaveClass('!w-full')
  })
})
