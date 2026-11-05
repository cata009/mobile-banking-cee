import { useState, type Dispatch, type ReactNode } from 'react'
import PageHeader from '@/app/components/PageHeader'
import FaceIdAnimation from '@/app/components/FaceIdAnimation'
import StandardSuccessScreen from '@/app/components/flow/StandardSuccessScreen'
import PrimaryButton from '@/app/components/PrimaryButton'
import NavigationRow from '@/app/components/NavigationRow'
import ToggleButton from '@/app/components/ToggleButton'
import { AppIcon } from '@/app/components/icons'
import UniCreditLogo from '@/app/components/UniCreditLogo'
import NavigationCardArt from '@/app/components/cards/NavigationCardArt'
import PendingActionCard from '@/app/components/cards/PendingActionCard'
import Card from '@/app/components/cards/Card'
import { BottomSheet } from '@/app/components/BottomSheet'
import MerchantLogo from '@/app/components/merchants/MerchantLogo'
import PfmCategoryIcon from '@/app/components/pfm/PfmCategoryIcon'
import { FRAUD_CARD_LABEL, FRAUD_CARD_REFERENCE } from '@/features/cards/fraud/cardFixture'
import { FraudFormLayout } from './FraudFormLayout'
import { FraudEvidenceFields } from './FraudEvidenceFields'
import { FraudActivityList } from './FraudActivityList'
import {
  fraudCaseStatusLabel,
  FRAUD_REASONS,
  FRAUD_TRANSACTIONS,
  isFraudActivityReviewed,
  canSubmitReport,
  fraudCaseKind,
  selectedFraudTransaction,
  type FraudAction,
  type FraudScreen,
  type FraudSession,
  type FraudTransaction,
} from '@/features/cards/fraud/model'

interface ScreenProps {
  screen: FraudScreen
  state: FraudSession
  dispatch: Dispatch<FraudAction>
  go: (screen: FraudScreen) => void
  back: () => void
  submit: () => void
}

export function CardIdentity({ state, showStatus = true }: { state: FraudSession; showStatus?: boolean }) {
  return (
    <div className="fraud-card-identity">
      <span className="fraud-card-symbol">
        <NavigationCardArt />
      </span>
      <div>
        <strong>{FRAUD_CARD_LABEL}</strong>
        <span>{FRAUD_CARD_REFERENCE.cardHolderName}</span>
        {showStatus && state.cardStatus !== 'active' ? (
          <span>{state.cardStatus === 'closed' ? 'Permanently closed' : 'Temporarily frozen'}</span>
        ) : null}
      </div>
    </div>
  )
}

function Notice({ children, urgent = false }: { children: ReactNode; urgent?: boolean }) {
  return (
    <div className={`fraud-notice${urgent ? ' fraud-notice--urgent' : ''}`}>
      <AppIcon name={urgent ? 'lock' : 'shield-check'} size={22} color="currentColor" />
      <div>{children}</div>
    </div>
  )
}

function Facts({ items }: { items: readonly (readonly [string, ReactNode])[] }) {
  return (
    <dl className="fraud-facts">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function PaymentSummary({ transaction }: { transaction: FraudTransaction }) {
  const status =
    transaction.status === 'declined' ? 'Declined' : transaction.status === 'pending' ? 'Pending' : 'Booked'
  return (
    <section aria-label="Selected transaction">
      <NavigationRow
        title={transaction.merchant}
        description={`${transaction.amount} · ${status}`}
        leadingVisual={
          transaction.channel === 'atm' ? (
            <PfmCategoryIcon category="Finance" variant="category-circle" size={32} />
          ) : (
            <MerchantLogo merchant={transaction.channel === 'pos' ? 'carrefour' : 'youtube'} size={32} />
          )
        }
        trailingAccessory="none"
        className="fraud-summary-row"
      />
    </section>
  )
}

function ClaimStatus({ state, back }: Pick<ScreenProps, 'state' | 'back'>) {
  const item = state.cases[state.selectedId]
  if (!item) return <Notice>No request has been submitted for this transaction.</Notice>
  const resolved = item.status === 'resolved' || item.status === 'declined'
  const needsInformation = item.status === 'needs-information'
  const transaction = selectedFraudTransaction(state)
  return (
    <FraudFormLayout>
      <ol className="fraud-timeline" aria-label={item.kind === 'fraud-report' ? 'Report progress' : 'Dispute progress'}>
        <li data-complete="true">
          <span>1</span>
          <div>
            <strong>{item.kind === 'fraud-report' ? 'Report received' : 'Dispute received'}</strong>
            <p>{item.submitted}</p>
          </div>
        </li>
        <li data-complete={item.status !== 'submitted'}>
          <span>2</span>
          <div>
            <strong>{needsInformation ? 'Additional information needed' : 'Bank investigation'}</strong>
            <p>
              {item.status === 'submitted'
                ? 'The bank will review your request.'
                : needsInformation
                  ? 'The bank will contact you for the details needed to continue.'
                  : 'The bank is reviewing the activity and the details you provided.'}
            </p>
          </div>
        </li>
        <li data-complete={resolved}>
          <span>3</span>
          <div>
            <strong>{resolved ? 'Decision available' : 'Decision and notification'}</strong>
            <p>{resolved ? fraudCaseStatusLabel(item) : 'We will notify you when there is a decision.'}</p>
          </div>
        </li>
      </ol>
      <p>{item.outcome ?? item.nextAction}</p>
      <Facts
        items={[
          [
            item.kind === 'fraud-report' ? 'Report status' : 'Dispute status',
            item.status === 'submitted' ? 'Submitted' : fraudCaseStatusLabel(item),
          ],
          [
            'Payment',
            `${transaction.merchant} · ${transaction.amount} · ${transaction.status === 'declined' ? 'Declined' : transaction.status === 'pending' ? 'Pending' : 'Booked'}`,
          ],
          ['Case reference', item.reference],
          ['Card used', FRAUD_CARD_LABEL],
        ]}
      />
      <Facts
        items={[
          ['Last update', item.updated],
          ...(!resolved
            ? ([
                ['Next update expected', item.nextUpdate],
                ['Estimated resolution', item.estimatedResolution],
                ['Estimated review period', '15 calendar days'],
              ] as const)
            : []),
        ]}
      />
      <PrimaryButton onClick={back}>Ok I got it</PrimaryButton>
    </FraudFormLayout>
  )
}

export function FraudScreens({ screen, state, dispatch, go, back, submit }: ScreenProps) {
  const [helpOpen, setHelpOpen] = useState(false)
  const [signing, setSigning] = useState(false)
  const isReportForm = screen === 'fraud-claim-details' || screen === 'fraud-attempt'
  const isActivityInbox = screen === 'fraud-alerts'
  const isCaseStatus = screen === 'fraud-case-status'
  const hasHelp = isReportForm || isActivityInbox || isCaseStatus
  const transaction = selectedFraudTransaction(state)
  const isDispute = fraudCaseKind(transaction.status) === 'dispute'
  const item = state.cases[state.selectedId]
  const hasUnreviewed = FRAUD_TRANSACTIONS.some((activity) => !isFraudActivityReviewed(state, activity.id))
  const continueAfterCase = () => go(hasUnreviewed ? 'fraud-alerts' : 'fraud-home')
  const closed = state.cardStatus === 'closed'
  const titles: Record<FraudScreen, string> = {
    'fraud-authenticate': 'Secure login',
    'fraud-home': 'Your Homepage',
    'fraud-cards': 'Cards',
    'fraud-card-options': 'Card options',
    'fraud-baseline-transaction': 'Transaction details',
    'fraud-push': 'Security alert',
    'fraud-alerts': 'Suspicious activity',
    'fraud-transaction': 'Transaction details',
    'fraud-dispute-intro': 'What happens next?',
    'fraud-recognised': 'Thanks for confirming',
    'fraud-attempt': 'Tell us what happened',
    'fraud-claim-details': 'Tell us what happened',
    'fraud-claim-review': isDispute ? 'Review your dispute' : 'Review your report',
    'fraud-claim-sent': item?.kind === 'fraud-report' ? 'Report submitted' : 'Dispute submitted',
    'fraud-virtual-card-offer': 'A card for your next payments',
    'fraud-virtual-card': 'Virtual card',
    'fraud-case-status': item?.kind === 'fraud-report' ? 'Your report' : 'Your dispute',
    'fraud-card-security': 'Card Limits',
    'fraud-replace-confirm': 'Card options',
    'fraud-replacement-status': 'Card options',
    'fraud-geo-settings': 'Card Limits',
  }
  const select = (id: string) => {
    dispatch({ type: 'select', transactionId: id })
    go('fraud-transaction')
  }
  const report = () => {
    dispatch({ type: 'report', transactionId: transaction.id, blockCardOnSubmit: true })
    go('fraud-dispute-intro')
  }
  if (screen === 'fraud-recognised') {
    return (
      <div className="fraud-phone" data-fraud-screen={screen}>
        <StandardSuccessScreen
          title="Thanks for confirming"
          body={
            <p>
              This activity is marked as recognised. No dispute has been opened. You can review your card limits to help
              manage future payments.
            </p>
          }
          actionLabel="Review other activity"
          onDone={() => go('fraud-alerts')}
          actions={
            <footer className="fraud-fixed-actions">
              <PrimaryButton onClick={() => go('fraud-alerts')}>Review other activity</PrimaryButton>
              <PrimaryButton variant="secondary" onClick={() => go('fraud-card-security')}>
                Protect my card
              </PrimaryButton>
            </footer>
          }
        />
      </div>
    )
  }
  if (screen === 'fraud-claim-sent' && item) {
    return (
      <div className="fraud-phone" data-fraud-screen={screen}>
        <StandardSuccessScreen
          title={titles[screen]}
          body={
            <div className="flex flex-col gap-5">
              <p>
                We’ve received your {item.kind === 'fraud-report' ? 'activity report' : 'dispute'} and will review it.{' '}
                {closed
                  ? 'Your card remains permanently closed.'
                  : state.cardStatus === 'frozen'
                    ? 'Your card is temporarily frozen, as you requested.'
                    : 'Your card remains active.'}{' '}
                You can track its progress and updates at any time.
              </p>
              <div className="fraud-virtual-offer">
                <PendingActionCard
                  title="Keep making payments"
                  description="Get a virtual card and keep paying online."
                  className="fraud-virtual-offer-button h-auto min-h-[157px]"
                  onClick={() => go('fraud-virtual-card')}
                />
                <span className="fraud-virtual-offer-art" aria-hidden="true">
                  <Card variant="mc-virtual-standard-orange" size="medium" />
                </span>
              </div>
            </div>
          }
          actionLabel={hasUnreviewed ? 'Review other activity' : 'Back to Home'}
          onDone={continueAfterCase}
          actions={
            <footer className="fraud-fixed-actions">
              <PrimaryButton onClick={continueAfterCase}>
                {hasUnreviewed ? 'Review other activity' : 'Back to Home'}
              </PrimaryButton>
              <PrimaryButton variant="secondary" onClick={() => go('fraud-case-status')}>
                {item.kind === 'fraud-report' ? 'Track this report' : 'Track this dispute'}
              </PrimaryButton>
            </footer>
          }
        />
      </div>
    )
  }
  return (
    <div className="fraud-phone relative" data-fraud-screen={screen} aria-busy={signing || undefined}>
      <PageHeader
        title={titles[screen]}
        onBack={() => {
          if (!signing) back()
        }}
        showBack={screen !== 'fraud-push'}
        showHelp={hasHelp}
        onHelpClick={() => setHelpOpen(true)}
        includeSafeArea
      />
      <main className="fraud-phone-content" key={screen} {...(signing ? { inert: '' } : {})}>
        <FraudFormLayout>
          {screen === 'fraud-push' ? (
            <>
              <div className="fraud-push-bank">
                <UniCreditLogo textColor="var(--uc-text)" />
              </div>
              <p className="fraud-eyebrow">Card protection · Bosnia and Herzegovina</p>
              <div className="fraud-push-message">
                <span className="fraud-push-shield">
                  <AppIcon name="shield-check" size={44} color="var(--uc-action)" />
                </span>
                <h2>Was this you?</h2>
                <p>We noticed unusual activity on your card ending 5601. Take a moment to check it.</p>
                <span className="fraud-badge">3 activities to review</span>
              </div>
              <PrimaryButton onClick={() => go('fraud-alerts')}>Review activity securely</PrimaryButton>
              <p className="fraud-footnote">
                Simulated push notification. Review activity inside your banking app. We will never ask for your PIN.
              </p>
            </>
          ) : null}

          {screen === 'fraud-alerts' ? (
            <>
              <CardIdentity state={state} />
              <p>Some activity looks different from your usual card use. Check each item below.</p>
              <FraudActivityList state={state} onSelect={select} />
              <PrimaryButton onClick={() => go('fraud-home')}>Back to Home</PrimaryButton>
            </>
          ) : null}

          {screen === 'fraud-transaction' ? (
            <>
              <PaymentSummary transaction={transaction} />
              <Facts
                items={[
                  ['When', transaction.date],
                  ['Card', 'Debit Mastercard · 5601'],
                  [
                    'Channel',
                    transaction.channel === 'pos'
                      ? 'In-store · POS'
                      : transaction.channel === 'atm'
                        ? 'ATM withdrawal'
                        : 'Internet',
                  ],
                ]}
              />
              {item ? (
                <>
                  <Notice>
                    <strong>{fraudCaseStatusLabel(item)}</strong>
                    <p>
                      {item.kind === 'fraud-report'
                        ? 'You have already reported this activity. Follow your case from here.'
                        : 'You have already disputed this payment. Follow your case from here.'}
                    </p>
                  </Notice>
                  <PrimaryButton onClick={() => go('fraud-case-status')}>
                    {item?.kind === 'fraud-report' ? 'View report status' : 'View dispute status'}
                  </PrimaryButton>
                </>
              ) : state.reported.includes(transaction.id) ? (
                <>
                  <Notice urgent>Your case has been submitted. Your card remains protected.</Notice>
                  <PrimaryButton onClick={() => go('fraud-claim-details')}>
                    {isDispute ? 'Continue dispute' : 'View activity report'}
                  </PrimaryButton>
                </>
              ) : state.recognised.includes(transaction.id) ? (
                <Notice>You confirmed that you recognise this activity.</Notice>
              ) : (
                <>
                  <h2 className="fraud-section-title">Do you recognise this?</h2>
                  <p>{transaction.reason}</p>
                  <PrimaryButton onClick={report}>I don't recognise this payment</PrimaryButton>
                  <PrimaryButton
                    variant="secondary"
                    onClick={() => {
                      dispatch({ type: 'recognise', transactionId: transaction.id })
                      go('fraud-recognised')
                    }}
                  >
                    I made this payment
                  </PrimaryButton>
                  <p className="fraud-block-choice-note">
                    If you continue, we’ll temporarily block your card while we review your case.
                  </p>
                </>
              )}
            </>
          ) : null}

          {screen === 'fraud-dispute-intro' ? (
            <>
              <p>
                You told us you don’t recognise the {isDispute ? 'payment' : 'activity'} below. Here’s what happens
                next.
              </p>
              <PaymentSummary transaction={transaction} />
              {transaction.status === 'booked' ? (
                <>
                  <h2 className="fraud-section-title">Payment posted</h2>
                  <p>
                    This payment has been debited from your account. You can ask the bank to review it as a dispute; a
                    refund is not guaranteed.
                  </p>
                </>
              ) : !isDispute ? (
                <p>No money was debited.</p>
              ) : null}
              <ol className="fraud-next-timeline" aria-label="Next steps">
                <li data-state="complete">
                  <span className="fraud-next-marker" aria-hidden="true">
                    <AppIcon name="prime-check" size={16} color="currentColor" />
                  </span>
                  <section className="fraud-next-content" aria-label="Card protection">
                    <h2 className="fraud-section-title">Your card is temporarily blocked</h2>
                    <p>We’ve blocked your card to help keep it safe.</p>
                    <CardIdentity state={state} showStatus={false} />
                  </section>
                </li>
                <li data-state="current" aria-current="step">
                  <span className="fraud-next-marker" aria-hidden="true">
                    2
                  </span>
                  <div className="fraud-next-content">
                    <span className="fraud-next-label">Next step</span>
                    <h2 className="fraud-section-title">{isDispute ? 'Open a dispute' : 'Report this activity'}</h2>
                    <p>
                      {isDispute
                        ? `Tell us what happened with the ${transaction.merchant} payment, then review and sign your dispute.`
                        : 'Tell us what happened, then review and sign your report.'}
                    </p>
                  </div>
                </li>
                <li data-state="upcoming">
                  <span className="fraud-next-marker" aria-hidden="true">
                    3
                  </span>
                  <div className="fraud-next-content">
                    <h2 className="fraud-section-title">
                      {isDispute ? 'We review your dispute' : 'We review your report'}
                    </h2>
                    <p>After submitting, you can follow its progress from this transaction.</p>
                  </div>
                </li>
              </ol>
              <PrimaryButton onClick={() => go('fraud-claim-details')}>
                {isDispute ? 'Open dispute' : 'Continue report'}
              </PrimaryButton>
            </>
          ) : null}

          {screen === 'fraud-claim-details' || screen === 'fraud-attempt' ? (
            <>
              {state.blockCardOnSubmit ? (
                <p className="fraud-footnote">Your card is temporarily blocked while we review your case.</p>
              ) : null}
              <FraudEvidenceFields state={state} dispatch={dispatch} />
              <PrimaryButton onClick={() => go('fraud-claim-review')}>
                {isDispute ? 'Review dispute' : 'Review report'}
              </PrimaryButton>
            </>
          ) : null}

          {screen === 'fraud-claim-review' ? (
            <>
              <Facts
                items={[
                  [
                    'Payment',
                    `${transaction.merchant} · ${transaction.amount} · ${transaction.status === 'declined' ? 'Declined' : transaction.status === 'pending' ? 'Pending' : 'Booked'}`,
                  ],
                  ['Reason', FRAUD_REASONS[state.draft.reason]],
                  [
                    'Supporting photos',
                    state.draft.attachments.length
                      ? state.draft.attachments.map((file) => file.name).join(', ')
                      : 'None attached',
                  ],
                  [
                    'Card used',
                    <>
                      {FRAUD_CARD_LABEL}
                      <br />
                      {FRAUD_CARD_REFERENCE.cardHolderName}
                    </>,
                  ],
                  ['Your statement', state.draft.note.trim() || 'Not provided'],
                ]}
              />
              <NavigationRow
                title={isDispute ? 'Confirm your dispute' : 'Confirm your report'}
                description="I did not authorise this payment and the details above are correct."
                className="fraud-security-row"
                trailing={
                  <ToggleButton
                    ariaLabel="I did not authorise this payment and the details above are correct."
                    checked={state.draft.declaration}
                    onToggle={(declaration) => dispatch({ type: 'draft', declaration })}
                  />
                }
              />
              {state.submitError ? (
                <p className="fraud-error" role="alert">
                  Your {isDispute ? 'dispute' : 'report'} was not submitted. Your statement is saved here. Please try
                  again.
                </p>
              ) : null}
              <PrimaryButton
                labelSize="18"
                disabled={!canSubmitReport(state) || signing}
                onClick={() => setSigning(true)}
              >
                {isDispute ? 'Sign dispute' : 'Sign report'}
              </PrimaryButton>
            </>
          ) : null}

          {screen === 'fraud-case-status' ? <ClaimStatus state={state} back={back} /> : null}
        </FraudFormLayout>
      </main>
      {helpOpen && hasHelp ? (
        <BottomSheet
          title={
            isActivityInbox
              ? 'About suspicious activity'
              : isCaseStatus
                ? item?.kind === 'fraud-report'
                  ? 'About your report'
                  : 'About your dispute'
                : isReportForm
                  ? isDispute
                    ? 'About your dispute'
                    : 'About your report'
                  : 'About this request'
          }
          onClose={() => setHelpOpen(false)}
          maxHeightOffsetPx={80}
          className="px-[24px] pb-[24px]"
          footer={
            <div className="pt-[16px]">
              <PrimaryButton onClick={() => setHelpOpen(false)}>OK</PrimaryButton>
            </div>
          }
        >
          <div className="uc-type-n4 flex flex-col gap-[20px] leading-[22px]">
            {isActivityInbox ? (
              <>
                <p>
                  These card payments or withdrawal attempts look different from your usual activity. This does not
                  necessarily mean fraud.
                </p>
                <section>
                  <h2 className="uc-type-n4-strong">CHECK EACH ITEM</h2>
                  <p>
                    Open an item under To review and check its amount, date and details. Declined attempts do not debit
                    money.
                  </p>
                </section>
                <section>
                  <h2 className="uc-type-n4-strong">IF YOU RECOGNISE IT</h2>
                  <p>
                    Confirm it to move the item to Reviewed. No case is opened and a declined payment is not retried.
                  </p>
                </section>
                <section>
                  <h2 className="uc-type-n4-strong">IF YOU DO NOT RECOGNISE IT</h2>
                  <p>
                    Choose “I don't recognise this payment”, add the details and sign your{' '}
                    {isDispute ? 'dispute' : 'activity report'}. Your card will be temporarily blocked while we review
                    your case. You can track it from the transaction.
                  </p>
                </section>
              </>
            ) : isCaseStatus ? (
              <>
                <p>This page shows the progress of your report or dispute and the latest update from the bank.</p>
                <section>
                  <h2 className="uc-type-n4-strong">BANK REVIEW</h2>
                  <p>
                    The bank checks the activity and the information you provided. It may contact you if more details
                    are needed.
                  </p>
                </section>
                <section>
                  <h2 className="uc-type-n4-strong">STATUS UPDATES</h2>
                  <p>
                    We will notify you when the status changes. The dates show when to expect an update and the
                    estimated end of the review.
                  </p>
                </section>
                <section>
                  <h2 className="uc-type-n4-strong">THE DECISION</h2>
                  <p>
                    Once the review is complete, the result appears here. You can return to this page from the
                    transaction at any time.
                  </p>
                </section>
              </>
            ) : (
              <>
                <p>Use this form to report card activity you do not recognise.</p>
                <section>
                  <h2 className="uc-type-n4-strong">CHOOSE A REASON</h2>
                  <p>Pick the reason that best matches your situation and tap OK.</p>
                </section>
                <section>
                  <h2 className="uc-type-n4-strong">ADD DETAILS (OPTIONAL)</h2>
                  <p>
                    Add any helpful details, up to 1000 characters. Do not include your PIN, password or full card
                    number.
                  </p>
                </section>
                <section>
                  <h2 className="uc-type-n4-strong">ADD PHOTOS (OPTIONAL)</h2>
                  <p>Attach up to 3 JPEG or PNG photos, up to 5 MB each. You can remove them before sending.</p>
                </section>
                <section>
                  <h2 className="uc-type-n4-strong">REVIEW AND SEND</h2>
                  <p>
                    Check the information, confirm the declaration and tap Sign {isDispute ? 'dispute' : 'report'}. Face
                    ID confirms your signature before sending.{' '}
                    {state.blockCardOnSubmit
                      ? 'Your card is temporarily blocked while we review your case.'
                      : 'The card remains active unless you chose to block it.'}{' '}
                    You can follow your case status from the transaction.
                  </p>
                </section>
              </>
            )}
          </div>
        </BottomSheet>
      ) : null}
      {signing ? (
        <div
          className="absolute inset-0 z-[50]"
          role="status"
          aria-label={`Face ID ${isDispute ? 'dispute' : 'report'} signature simulation`}
        >
          <FaceIdAnimation
            onComplete={() => {
              setSigning(false)
              submit()
            }}
          />
        </div>
      ) : null}
    </div>
  )
}
