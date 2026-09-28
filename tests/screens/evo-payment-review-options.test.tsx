// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { useState } from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'
import { Evo2027PaymentReviewScreen } from '@/app/screens/payments/Evo2027DomesticPaymentFlow'
import { createEmptyDomesticPaymentDraft } from '@/data/paymentFlow'

function ReviewHarness() {
  const [draft, setDraft] = useState({
    ...createEmptyDomesticPaymentDraft('CZ'),
    beneficiaryName: 'Maria Popescu',
    accountNumber: '2000144101',
    bankCode: '2700',
    amount: '500',
  })
  return (
    <Evo2027PaymentReviewScreen
      draft={draft}
      onDraftChange={setDraft}
      onBack={() => undefined}
      onSign={() => undefined}
    />
  )
}

afterEach(cleanup)

describe('Evo payment review details', () => {
  it('lets the user change instant payment and add a private note in review', () => {
    render(
      <DemoProvider initialState={{ country: 'CZ' }}>
        <LanguageProvider initialLanguage="en">
          <ReviewHarness />
        </LanguageProvider>
      </DemoProvider>,
    )

    const instantPayment = screen.getByRole('checkbox', { name: 'Instant payment' })
    expect(instantPayment).toBeChecked()
    fireEvent.click(instantPayment)
    expect(instantPayment).not.toBeChecked()

    fireEvent.click(screen.getByRole('button', { name: 'Note for me Add a private note' }))
    const editor = screen.getByRole('dialog', { name: 'Note for me' })
    fireEvent.change(within(editor).getByRole('textbox', { name: 'Note for me (optional)' }), {
      target: { value: 'Chirie septembrie' },
    })
    fireEvent.click(within(editor).getByRole('button', { name: 'Save' }))

    expect(screen.getByRole('button', { name: 'Note for me Chirie septembrie' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Instant payment' })).not.toBeChecked()
  })
})
