// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { useState } from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'
import { Evo2027DomesticPaymentCreateScreen, Evo2027PaymentReviewScreen } from '@/app/screens/payments/Evo2027DomesticPaymentFlow'
import { createEmptyDomesticPaymentDraft } from '@/data/paymentFlow'

function ReviewHarness() {
  const [draft, setDraft] = useState({
    ...createEmptyDomesticPaymentDraft('CZ'),
    beneficiaryName: 'Maria Popescu',
    accountNumber: '2000144101',
    bankCode: '2700',
    amount: '500',
    instantPayment: false,
    dueDate: '2026-09-30',
  })
  return (
    <>
      <output data-testid="review-instant-payment">{String(draft.instantPayment)}</output>
      <Evo2027PaymentReviewScreen
        draft={draft}
        onDraftChange={setDraft}
        onBack={() => undefined}
        onSign={() => undefined}
      />
    </>
  )
}

afterEach(cleanup)

describe('Evo payment review details', () => {
  it('changes instant payment in the create-step Payment date sheet', () => {
    render(
      <DemoProvider initialState={{ country: 'CZ', release: 'release-future-evo-2027' }}>
        <LanguageProvider initialLanguage="en">
          <Evo2027DomesticPaymentCreateScreen
            draft={{ ...createEmptyDomesticPaymentDraft('CZ'), beneficiaryName: 'Maria Popescu', accountNumber: '2000144101', bankCode: '2700', amount: '500' }}
            onBack={() => undefined}
            onNext={() => undefined}
          />
        </LanguageProvider>
      </DemoProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Payment date: Instant payment' }))
    const sheet = screen.getByRole('dialog', { name: 'Payment date' })
    const instant = within(sheet).getByRole('switch', { name: 'Instant payment' })
    expect(instant).toBeChecked()
    fireEvent.click(instant)
    expect(instant).not.toBeChecked()
    expect(within(sheet).getByLabelText('Payment date')).toHaveAttribute('type', 'date')
    fireEvent.click(within(sheet).getByRole('button', { name: 'Done' }))
    expect(screen.queryByRole('button', { name: 'Payment date: Instant payment' })).not.toBeInTheDocument()
  })

  it('preserves the selected payment date and instant setting while editing a private note', () => {
    render(
      <DemoProvider initialState={{ country: 'CZ' }}>
        <LanguageProvider initialLanguage="en">
          <ReviewHarness />
        </LanguageProvider>
      </DemoProvider>,
    )

    expect(screen.queryByRole('checkbox', { name: 'Instant payment' })).not.toBeInTheDocument()
    expect(screen.getByText('Payment date').closest('section')).toHaveTextContent('Sep 30, 2026')
    expect(screen.getByTestId('review-instant-payment')).toHaveTextContent('false')

    fireEvent.click(screen.getByRole('button', { name: 'Note for me Add a private note' }))
    const editor = screen.getByRole('dialog', { name: 'Note for me' })
    fireEvent.change(within(editor).getByRole('textbox', { name: 'Note for me (optional)' }), {
      target: { value: 'Chirie septembrie' },
    })
    fireEvent.click(within(editor).getByRole('button', { name: 'Save' }))

    expect(screen.getByRole('button', { name: 'Note for me Chirie septembrie' })).toBeInTheDocument()
    expect(screen.getByTestId('review-instant-payment')).toHaveTextContent('false')
    expect(screen.getByText('Payment date').closest('section')).toHaveTextContent('Sep 30, 2026')
  })
})
