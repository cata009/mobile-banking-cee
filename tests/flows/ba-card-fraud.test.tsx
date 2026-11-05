// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FraudJourney, fraudScreenFixture } from '@/flows/ba/card-fraud/FraudJourney'
import { BA_CARD_FRAUD_FLOW } from '@/flows/ba/card-fraud/definition'
import { FraudPresentationDialog } from '@/flows/ba/card-fraud/FraudPresentationDialog'
import { asyncNativeReady, resetNativeWebRendererDiagnostics } from '../helpers/nativeWebRenderer'
import { useState } from 'react'
import { FlowNavProvider } from '@/app/screens/flow-library/components/prototypeNav'
import { renderFraudPreview } from '@/flows/ba/card-fraud/preview'
import type { FraudScreen } from '@/features/cards/fraud/model'

function PrototypeHarness() {
  const [current, setCurrent] = useState<FraudScreen>('fraud-push')
  return (
    <FlowNavProvider
      value={{
        active: true,
        canClose: false,
        go: (next) => setCurrent(next as FraudScreen),
        primary: () => undefined,
        secondary: () => undefined,
        back: () => undefined,
        close: () => undefined,
      }}
    >
      <output data-testid="prototype-screen">{current}</output>
      {renderFraudPreview(current, { ledger: 'booked' })}
    </FlowNavProvider>
  )
}

vi.mock('@/app/components/demo/nativeDemoLoader', async () => ({
  loadNativeDemoModule: (await import('../helpers/nativeWebRenderer')).loadNativeDemoModuleForWebTest,
}))

afterEach(() => {
  cleanup()
  resetNativeWebRendererDiagnostics()
})

async function openUnrecognisedPayment() {
  fireEvent.click(screen.getByRole('button', { name: 'Open m-ba fraud alert' }))
  expect(screen.getByRole('status', { name: 'Face ID login simulation' })).toBeTruthy()
  fireEvent.click(await screen.findByRole('button', { name: /Review Carrefour/ }))
  fireEvent.click(screen.getByRole('button', { name: "I don't recognise this payment" }))
  if (screen.queryByRole('button', { name: 'Open dispute' }))
    fireEvent.click(screen.getByRole('button', { name: 'Open dispute' }))
}

function completeClaim() {
  fireEvent.change(screen.getByRole('textbox', { name: 'What happened? (optional)' }), {
    target: { value: 'I have my card and did not make this payment.' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Review dispute' }))
  fireEvent.click(screen.getByRole('switch', { name: /details above are correct/ }))
  fireEvent.click(screen.getByRole('button', { name: 'Sign dispute' }))
}

describe('Bosnia complete fraud flow', () => {
  it('restores the normal Home summary after every activity has been reviewed', async () => {
    render(<FraudJourney initialScreen="fraud-alerts" />)
    for (const merchant of ['Carrefour', 'ATM cash withdrawal', 'YouTube Premium']) {
      fireEvent.click(screen.getByRole('button', { name: `Review ${merchant}` }))
      fireEvent.click(screen.getByRole('button', { name: 'I made this payment' }))
      fireEvent.click(screen.getByRole('button', { name: 'Review other activity' }))
    }
    fireEvent.click(screen.getByRole('button', { name: 'Back to Home' }))
    await asyncNativeReady(document.body)
    expect(screen.queryByText('Suspicious activity')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Show security alert' })).toBeNull()
    expect(screen.getByText('Total available')).toBeTruthy()
  })
  it('restarts the prototype with all three activities unreviewed and the card active', () => {
    const view = render(<FraudJourney initialScreen="fraud-claim-sent" controlledScreen="fraud-claim-sent" />)
    expect(screen.getByRole('button', { name: 'Track this dispute' })).toBeTruthy()
    view.rerender(<FraudJourney initialScreen="fraud-claim-sent" controlledScreen="fraud-push" />)
    expect(screen.getByRole('button', { name: 'Open m-ba fraud alert' })).toBeTruthy()
    view.rerender(<FraudJourney initialScreen="fraud-claim-sent" controlledScreen="fraud-alerts" />)
    expect(screen.getAllByRole('button', { name: /^Review / })).toHaveLength(3)
    expect(screen.queryByRole('heading', { name: 'REVIEWED' })).toBeNull()
    expect(screen.queryByText('Temporarily frozen')).toBeNull()
  })
  it('keeps the reason, photo and review steps for a pending dispute', async () => {
    render(<FraudJourney initialScreen="fraud-alerts" />)
    expect(screen.getByText('Iacob Mihai')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Review Carrefour' }))
    fireEvent.click(screen.getByRole('button', { name: "I don't recognise this payment" }))
    fireEvent.click(screen.getByRole('button', { name: 'Open dispute' }))
    expect(screen.getByRole('textbox', { name: 'What happened? (optional)' })).toBeTruthy()
    expect(screen.queryByRole('checkbox', { name: /physical card/ })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Choose dispute reason' }))
    expect(screen.getByRole('heading', { name: 'Reason for dispute' })).toBeTruthy()
    fireEvent.click(screen.getByText('My card details may be compromised'))
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(screen.getByRole('button', { name: 'Take or attach a supporting photo' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Review dispute' }))
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByText('Not provided')).toBeTruthy()
    fireEvent.click(screen.getByRole('switch', { name: /details above are correct/ }))
    const signReport = screen.getByRole('button', { name: 'Sign dispute' })
    fireEvent.click(signReport)
    expect(screen.getByRole('status', { name: 'Face ID dispute signature simulation' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Dispute submitted' })).toBeNull()
    expect(screen.queryByText('Your card is temporarily frozen')).toBeNull()
    expect(signReport.hasAttribute('disabled')).toBe(true)
    expect(await screen.findByRole('heading', { name: 'Dispute submitted' })).toBeTruthy()
    expect(screen.getByText(/Your card is temporarily frozen/)).toBeTruthy()
    expect(screen.getByText(/You can track its progress and updates at any time/)).toBeTruthy()
    expect(screen.queryByText(/^Case BA-/)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Track this dispute' }))
    expect(screen.getByText('Dispute status')).toBeTruthy()
    expect(screen.getByText('Submitted')).toBeTruthy()
    expect(screen.getByText('Case reference')).toBeTruthy()
    expect(screen.getByText('BA-2026-10482')).toBeTruthy()
    expect(document.querySelector('.fraud-notice')).toBeNull()
  })
  it('shows Pending and explains the immediate block before opening a dispute', async () => {
    render(<FraudJourney initialScreen="fraud-transaction" />)
    await asyncNativeReady(document.body)
    expect(screen.getByText('Pending')).toBeTruthy()
    expect(screen.queryByText(/The amount is reserved/)).toBeNull()
    expect(screen.getByText(/If you continue, we’ll temporarily block your card/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: "I don't recognise this payment" }))
    expect(screen.getByText('Your card is temporarily blocked')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Open dispute' }))
    expect(screen.getByRole('button', { name: 'Review dispute' })).toBeTruthy()
  })
  it('keeps the card blocked when the customer backs out after choosing to block it', async () => {
    render(<FraudJourney initialScreen="fraud-transaction" />)
    await asyncNativeReady(document.body)
    fireEvent.click(screen.getByRole('button', { name: "I don't recognise this payment" }))
    expect(screen.getByText('Your card is temporarily blocked')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    await asyncNativeReady(document.body)
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(screen.getByText('Temporarily frozen')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /View report status/ })).toBeNull()
    expect(screen.getByRole('button', { name: /Review Carrefour/ })).toBeTruthy()
  })
  it('offers Open dispute for an already booked payment', async () => {
    render(<FraudJourney initialScreen="fraud-transaction" parameters={{ ledger: 'booked' }} />)
    await asyncNativeReady(document.body)
    fireEvent.click(screen.getByRole('button', { name: "I don't recognise this payment" }))
    expect(screen.getByText('Payment posted')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Open dispute' }))
    expect(screen.getByRole('button', { name: 'Review dispute' })).toBeTruthy()
  })
  it.each(['berlin', 'vienna', 'online'])('keeps the %s case linked when opening a scenario step directly', (id) => {
    const state = fraudScreenFixture('fraud-case-status', { transaction: id })
    expect(state.cases[id]?.transactionId).toBe(id)
    expect(state.cases[id]?.kind).toBe(id === 'vienna' ? 'fraud-report' : 'dispute')
    expect(Object.keys(state.cases)).toEqual([id])
  })
  it('refreshes a Journey preview when another step is selected', () => {
    const view = render(renderFraudPreview('fraud-alerts'))
    expect(screen.getByRole('button', { name: 'Review Carrefour' })).toBeTruthy()
    view.rerender(renderFraudPreview('fraud-claim-details'))
    expect(screen.getByRole('textbox', { name: 'What happened? (optional)' })).toBeTruthy()
  })
  it('applies late scenario parameters on the same controlled step', () => {
    const view = render(<FraudJourney initialScreen="fraud-claim-details" controlledScreen="fraud-claim-details" />)
    expect(screen.getByRole('button', { name: 'Review dispute' })).toBeTruthy()
    view.rerender(
      <FraudJourney
        initialScreen="fraud-claim-details"
        controlledScreen="fraud-claim-details"
        parameters={{ transaction: 'vienna' }}
      />,
    )
    expect(screen.getByRole('button', { name: 'Review report' })).toBeTruthy()
  })
  it('updates a directly selected lifecycle fixture on the same case screen', () => {
    const view = render(<FraudJourney initialScreen="fraud-case-status" controlledScreen="fraud-case-status" />)
    view.rerender(
      <FraudJourney
        initialScreen="fraud-case-status"
        controlledScreen="fraud-case-status"
        parameters={{ transaction: 'vienna', caseStatus: 'needs-information' }}
      />,
    )
    expect(screen.getByText('ATM cash withdrawal · 300.00 BAM · Declined')).toBeTruthy()
    expect(screen.getByText('Information needed')).toBeTruthy()
  })
  it('uses the actual baseline merchant detail and Card used, hiding spending and payment shortcuts', async () => {
    render(<FraudJourney initialScreen="fraud-transaction" />)
    await asyncNativeReady(document.body)
    expect(screen.getByText('Transaction details')).toBeTruthy()
    expect(screen.queryByText('Spending Insight')).toBeNull()
    expect(screen.queryByRole('button', { name: /Change.*category/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /Send.*payment/ })).toBeNull()
    expect(screen.getByText(/^Card used$/i)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Debit Mastercard · 5601 Iacob Mihai' }))
    await asyncNativeReady(document.body)
    expect((await screen.findAllByText('Cards')).length).toBeGreaterThan(0)
    expect(screen.getByText('5173 **** **** 5601')).toBeTruthy()
    expect(screen.getByText('Iacob Mihai')).toBeTruthy()
    expect(screen.queryByText('PETER JAGODIĆ')).toBeNull()
  })
  it('keeps the host prototype screen in sync while using the phone controls', async () => {
    render(<PrototypeHarness />)
    fireEvent.click(screen.getByRole('button', { name: 'Open m-ba fraud alert' }))
    await screen.findByRole('button', { name: 'Review Carrefour' })
    expect(screen.getByTestId('prototype-screen').textContent).toBe('fraud-alerts')
    fireEvent.click(screen.getByRole('button', { name: 'Review Carrefour' }))
    expect(screen.getByTestId('prototype-screen').textContent).toBe('fraud-transaction')
    fireEvent.click(screen.getByRole('button', { name: "I don't recognise this payment" }))
    expect(screen.getByTestId('prototype-screen').textContent).toBe('fraud-dispute-intro')
    fireEvent.click(screen.getByRole('button', { name: 'Open dispute' }))
    expect(screen.getByTestId('prototype-screen').textContent).toBe('fraud-claim-details')
  })
  it('mounts the actual baseline Home, Cards and Card options through the same journey', async () => {
    render(<FraudJourney initialScreen="fraud-home" />)
    await asyncNativeReady(document.body)
    expect((await screen.findAllByText('Your Homepage')).length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: 'Go to my cards' })).toBeNull()
    const totalDot = screen.getByRole('button', { name: 'Show total available' })
    fireEvent.click(totalDot)
    await waitFor(() => expect(totalDot.getAttribute('aria-current')).toBe('true'))
    fireEvent.click(screen.getByRole('button', { name: 'Show security alert' }))
    fireEvent.click(screen.getByText(/^Debit Card/))
    await asyncNativeReady(document.body)
    expect((await screen.findAllByText('Cards')).length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: 'Block Card' }))
    await asyncNativeReady(document.body)
    expect(screen.getAllByRole('heading', { name: 'Card security' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('switch', { name: 'Allow Internet payments' })).toBeTruthy()
    fireEvent.click(screen.getByRole('switch', { name: 'Allow Internet payments' }))
    await asyncNativeReady(document.body)
    expect(screen.getByRole('switch', { name: 'Allow Internet payments' }).getAttribute('aria-checked')).toBe('false')
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    await asyncNativeReady(document.body)
    expect(screen.getByRole('button', { name: 'Options' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Options' }))
    await asyncNativeReady(document.body)
    expect(screen.getByText('CARD LIMITS')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'CARD SECURITY' })).toBeNull()
    expect(screen.queryAllByRole('switch')).toHaveLength(0)
    expect(screen.queryByRole('group', { name: 'Country protection' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Replace compromised card' })).toBeNull()
    expect(screen.queryByRole('button', { name: /View report status/ })).toBeNull()
    expect(screen.getByRole('button', { name: 'REISSUE CARD' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'REISSUE CARD' }))
    expect(screen.getAllByRole('heading', { name: 'Replace your card' }).length).toBeGreaterThan(0)
    expect(screen.queryByRole('dialog', { name: 'Replace your card' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    await asyncNativeReady(document.body)
    expect((await screen.findAllByText('Card options')).length).toBeGreaterThan(0)
  })

  it('keeps removed market/baseline controls out of the modal and protects nested reason selection', () => {
    const close = vi.fn()
    render(<FraudPresentationDialog open onClose={close} presentationUrl="http://localhost/?flow=ba-card-fraud" />)
    expect(screen.queryByText('Explore current baseline')).toBeNull()
    expect(screen.queryByLabelText('Demo market')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '2 Respond' }))
    expect(screen.queryByLabelText('Submission scenario')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Choose dispute reason' }))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(close).not.toHaveBeenCalled()
  })

  it('moves a recognised item under Reviewed and omits PFM icons and redundant footer buttons', () => {
    render(<FraudJourney initialScreen="fraud-alerts" />)
    expect(screen.queryByRole('heading', { name: 'REVIEWED' })).toBeNull()
    expect(screen.queryByText('No activity reviewed yet.')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Go to my cards' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Review Carrefour/ }))
    fireEvent.click(screen.getByRole('button', { name: 'I made this payment' }))
    fireEvent.click(screen.getByRole('button', { name: 'Review other activity' }))
    expect(screen.queryByText('Confirmed by you')).toBeNull()
    expect(screen.getByText('REVIEWED')).toBeTruthy()
  })
  it('registers both Bosnia markets with contracts for every scenario and transition', () => {
    expect(BA_CARD_FRAUD_FLOW.countryScope).toEqual(['BA', 'BA_BL'])
    for (const scenario of BA_CARD_FRAUD_FLOW.scenarios) {
      for (const step of scenario.steps)
        expect(BA_CARD_FRAUD_FLOW.screenSpecs[step.screen]?.acceptance?.length).toBeGreaterThan(0)
    }
    for (const node of Object.values(BA_CARD_FRAUD_FLOW.prototype!.nodes)) {
      for (const target of [
        node?.primary?.to,
        node?.secondary?.to,
        node?.back,
        ...(node?.extra ?? []).map((item) => item.to),
      ].filter(Boolean)) {
        expect(BA_CARD_FRAUD_FLOW.screenSpecs[target!]).toBeDefined()
      }
    }
  })

  it('files a dispute, opens the linked status from its transaction and avoids a second claim', async () => {
    render(<FraudJourney parameters={{ ledger: 'booked' }} />)
    await openUnrecognisedPayment()
    expect(screen.queryByText('Your card is temporarily frozen')).toBeNull()
    expect(screen.getByRole('button', { name: 'Review dispute' }).hasAttribute('disabled')).toBe(false)
    completeClaim()
    expect(await screen.findByRole('heading', { name: 'Dispute submitted' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Track this dispute' }))
    expect(screen.getByText('6 Nov 2026')).toBeTruthy()
    expect(screen.queryByText(/Illustrative demo dates/)).toBeNull()
    expect(screen.queryByRole('button', { name: 'Ask about this case' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Protect my card' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Help' }))
    expect(screen.getByRole('dialog', { name: 'About your dispute' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ok I got it' }))
    await asyncNativeReady(document.body)
    const caseCard = screen.getByRole('button', { name: 'View dispute status' })
    expect(within(caseCard).getByText('You have an open dispute')).toBeTruthy()
    expect(document.querySelector('.fraud-baseline-actions')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Back to cards' })).toBeNull()
    expect(screen.queryByText('Dispute submitted')).toBeNull()
    expect(screen.queryByRole('button', { name: "I don't recognise this payment" })).toBeNull()
    fireEvent.click(caseCard)
    expect(screen.getByText('6 Nov 2026')).toBeTruthy()
  })

  it('offers a virtual card on the receipt and keeps case tracking available', () => {
    render(<FraudJourney initialScreen="fraud-claim-sent" />)
    expect(screen.getByRole('button', { name: 'Keep making payments' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Track this dispute' }))
    expect(screen.getByText('Dispute status')).toBeTruthy()
    expect(screen.getByText('Submitted')).toBeTruthy()
  })

  it('opens the existing Native virtual-card issue flow from the receipt banner', async () => {
    render(<FraudJourney initialScreen="fraud-claim-sent" />)
    fireEvent.click(screen.getByRole('button', { name: 'Keep making payments' }))
    await asyncNativeReady(document.body)
    expect(await screen.findByRole('heading', { name: 'Select your preferred card' })).toBeTruthy()
  })

  it('recognises a booked payment without a dispute', () => {
    render(<FraudJourney initialScreen="fraud-transaction" />)
    fireEvent.click(screen.getByRole('button', { name: 'I made this payment' }))
    expect(screen.getAllByRole('heading', { name: 'Thanks for confirming' }).length).toBeGreaterThan(0)
    expect(screen.getByText(/No dispute has been opened/)).toBeTruthy()
  })

  it('reports a declined ATM attempt without pretending money was debited', () => {
    render(<FraudJourney initialScreen="fraud-alerts" />)
    fireEvent.click(screen.getByRole('button', { name: /Review ATM cash withdrawal/ }))
    fireEvent.click(screen.getByRole('button', { name: "I don't recognise this payment" }))
    expect(screen.getByText('Attempt declined')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Open dispute' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Continue report' }))
    expect(screen.getByRole('textbox', { name: 'What happened? (optional)' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Sign dispute' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Open dispute' })).toBeNull()
  })

  it('retains the review after a submission failure and succeeds on retry', async () => {
    render(<FraudJourney failFirstSubmission parameters={{ ledger: 'booked' }} />)
    await openUnrecognisedPayment()
    completeClaim()
    expect((await screen.findByRole('alert')).textContent).toContain('not submitted')
    expect(screen.queryByRole('status', { name: 'Face ID dispute signature simulation' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Sign dispute' }))
    expect(screen.getByRole('status', { name: 'Face ID dispute signature simulation' })).toBeTruthy()
    expect(await screen.findByRole('heading', { name: 'Dispute submitted' })).toBeTruthy()
  })

  it('requires replacement consent and closes channel editing on the old card', async () => {
    render(<FraudJourney initialScreen="fraud-replace-confirm" />)
    const confirm = screen.getByRole('button', { name: 'Close card and request replacement' })
    expect(confirm.hasAttribute('disabled')).toBe(true)
    fireEvent.click(screen.getByRole('switch', { name: /permanently closed/ }))
    fireEvent.click(confirm)
    expect(screen.getAllByRole('heading', { name: 'Replacement requested' }).length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: /View report status|View dispute status/ })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Ok I got it' }))
    await asyncNativeReady(document.body)
    for (const control of screen.getAllByRole('switch')) expect(control.getAttribute('aria-disabled')).toBe('true')
  })

  it('keeps settings accessible and identifies the phone as the country signal', async () => {
    render(<FraudJourney initialScreen="fraud-card-security" />)
    await asyncNativeReady(document.body)
    expect(screen.getByText(/country reported by your phone’s latest location signal/)).toBeTruthy()
    const control = screen.getByRole('switch', { name: 'Limit physical payments to my country' })
    fireEvent.click(control)
    await asyncNativeReady(document.body)
    expect(
      screen.getByRole('switch', { name: 'Limit physical payments to my country' }).getAttribute('aria-checked'),
    ).toBe('true')
    expect(screen.getByText(/Internet payments are not affected/)).toBeTruthy()
  })
})
