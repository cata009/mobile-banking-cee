// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { useState } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'
import { Evo2027DomesticPaymentCreateScreen, Evo2027PaymentReviewScreen } from '@/app/screens/payments/Evo2027DomesticPaymentFlow'
import { createEmptyDomesticPaymentDraft } from '@/data/paymentFlow'
import { asyncNativeReady, resetNativeWebRendererDiagnostics } from '../helpers/nativeWebRenderer'

vi.mock('@/app/components/demo/nativeDemoLoader', async () => {
  const { loadNativeDemoModuleForWebTest } = await import('../helpers/nativeWebRenderer')
  return { loadNativeDemoModule: loadNativeDemoModuleForWebTest }
})

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

afterEach(() => {
  cleanup()
  resetNativeWebRendererDiagnostics()
})

describe('Evo payment review details', () => {
  it('changes instant payment in the create-step Payment date sheet', async () => {
    const view = render(
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
    await asyncNativeReady(view.container)
    fireEvent.click(screen.getByRole('button', { name: 'Payment date: Instant payment' }))
    const instant = await screen.findByRole('switch', { name: 'Instant payment' })
    expect(instant).toBeChecked()
    fireEvent.click(instant)
    await waitFor(() => expect(instant).not.toBeChecked())
    expect(await screen.findByRole('textbox', { name: 'Payment date' })).toBeInTheDocument()
    fireEvent.click(await screen.findByRole('button', { name: 'Done' }))
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Payment date: Instant payment' })).not.toBeInTheDocument())
  })

  it('preserves the selected payment date and instant setting while editing a private note', async () => {
    const view = render(
      <DemoProvider initialState={{ country: 'CZ', product: 'PI', release: 'release-future-evo-2027' }}>
        <LanguageProvider initialLanguage="en">
          <ReviewHarness />
        </LanguageProvider>
      </DemoProvider>,
    )
    await asyncNativeReady(view.container)

    expect(screen.queryByRole('checkbox', { name: 'Instant payment' })).not.toBeInTheDocument()
    expect(await screen.findByText('Payment date', { exact: true })).toBeInTheDocument()
    expect(await screen.findByText('Sep 30, 2026')).toBeInTheDocument()
    expect(screen.getByTestId('review-instant-payment')).toHaveTextContent('false')

    fireEvent.click(screen.getByRole('button', { name: 'Note for me Add a private note' }))
    expect(await screen.findByText('Note for me', { exact: true })).toBeInTheDocument()
    fireEvent.change(await screen.findByRole('textbox', { name: 'Note for me (optional)' }), {
      target: { value: 'Chirie septembrie' },
    })
    fireEvent.click(await screen.findByRole('button', { name: 'Save' }))

    expect(await screen.findByRole('button', { name: 'Note for me Chirie septembrie' })).toBeInTheDocument()
    expect(screen.getByTestId('review-instant-payment')).toHaveTextContent('false')
    expect(screen.getByText('Payment date', { exact: true })).toBeInTheDocument()
    expect(screen.getByText('Sep 30, 2026')).toBeInTheDocument()
  })
})
