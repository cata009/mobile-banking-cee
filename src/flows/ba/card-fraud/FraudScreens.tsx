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
  canSubmitReport,
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

export function CardIdentity({ state }: { state: FraudSession }) {
  return (
    <div className="fraud-card-identity">
      <span className="fraud-card-symbol">
        <NavigationCardArt />
      </span>
      <div>
        <strong>{FRAUD_CARD_LABEL}</strong>
        <span>{FRAUD_CARD_REFERENCE.cardHolderName}</span>
        {state.cardStatus !== 'active' ? (
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
  return (
    <section aria-label="Selected transaction">
      <NavigationRow
        title={transaction.merchant}
        description={`${transaction.amount} · ${transaction.status === 'declined' ? 'Declined' : transaction.status === 'pending' ? 'Pending' : 'Booked'}`}
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

function ReplacementConfirmation({ state, dispatch, go }: Pick<ScreenProps, 'state' | 'dispatch' | 'go'>) {
  const [consent, setConsent] = useState(false)
  return (
    <FraudFormLayout>
      <CardIdentity state={state} />
      <p>
        The old card will be permanently closed and the replacement will have new card details. Any open report or
        dispute will continue separately. The bank will confirm fees, delivery and activation. Update recurring payments
        and wallets when the new card is ready.
      </p>
      <NavigationRow
        title="I understand"
        description="My old card will be permanently closed and I am requesting a replacement."
        className="fraud-security-row"
        trailing={
          <ToggleButton
            ariaLabel="I understand that my old card will be permanently closed and I am requesting a replacement."
            checked={consent}
            onToggle={setConsent}
          />
        }
      />
      <PrimaryButton
        disabled={!consent}
        onClick={() => {
          dispatch({ type: 'replace', confirmed: consent })
          go('fraud-replacement-status')
        }}
      >
        Close card and request replacement
      </PrimaryButton>
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
  const item = state.cases[state.selectedId]
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
    'fraud-recognised': 'Thanks for confirming',
    'fraud-attempt': 'Tell us what happened',
    'fraud-claim-details': 'Tell us what happened',
    'fraud-claim-review': transaction.status === 'booked' ? 'Review your dispute' : 'Review your report',
    'fraud-claim-sent': item?.kind === 'fraud-report' ? 'Report submitted' : 'Dispute submitted',
    'fraud-case-status': item?.kind === 'fraud-report' ? 'Your report' : 'Your dispute',
    'fraud-card-security': 'Card security',
    'fraud-replace-confirm': 'Replace your card',
    'fraud-replacement-status': 'Replacement requested',
    'fraud-geo-settings': 'Card security',
  }
  const select = (id: string) => {
    dispatch({ type: 'select', transactionId: id })
    go('fraud-transaction')
  }
  const report = () => {
    dispatch({ type: 'report', transactionId: transaction.id })
    go('fraud-claim-details')
  }
  const permission = (channel: 'atm' | 'internet' | 'pos', title: string, description: string) => (
    <NavigationRow
      key={channel}
      title={title}
      description={description}
      className="fraud-security-row"
      trailing={
        <ToggleButton
          ariaLabel={`Allow ${title}`}
          checked={state.channels[channel]}
          disabled={closed}
          onToggle={(enabled) => dispatch({ type: 'channel', channel, enabled })}
        />
      }
    />
  )
  if (screen === 'fraud-recognised') {
    return (
      <div className="fraud-phone" data-fraud-screen={screen}>
        <StandardSuccessScreen
          title="Thanks for confirming"
          body={<p>This activity is marked as recognised. No dispute has been opened.</p>}
          actionLabel="Review other activity"
          onDone={() => go('fraud-alerts')}
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
            <p>
              We’ve received your request and will review it.{' '}
              {closed ? 'Your card remains permanently closed.' : 'Your card is temporarily frozen.'} You can track its
              progress and updates at any time.
            </p>
          }
          actionLabel={item.kind === 'fraud-report' ? 'Track this report' : 'Track this dispute'}
          onDone={() => go('fraud-case-status')}
          actions={
            <footer className="fraud-fixed-actions">
              <PrimaryButton onClick={() => go('fraud-case-status')}>
                {item.kind === 'fraud-report' ? 'Track this report' : 'Track this dispute'}
              </PrimaryButton>
              <PrimaryButton variant="secondary" onClick={() => go('fraud-card-security')}>
                Protect my card
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
              <p className="fraud-eyebrow">Card security · Bosnia and Herzegovina</p>
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
                    <p>You have already disputed this payment. Follow your case from here.</p>
                  </Notice>
                  <PrimaryButton onClick={() => go('fraud-case-status')}>
                    {item?.kind === 'fraud-report' ? 'View report status' : 'View dispute status'}
                  </PrimaryButton>
                </>
              ) : state.reported.includes(transaction.id) ? (
                <>
                  <Notice urgent>This activity has been reported. Your card remains protected.</Notice>
                  <PrimaryButton onClick={() => go('fraud-claim-details')}>
                    {transaction.status === 'booked' ? 'Continue dispute' : 'View activity report'}
                  </PrimaryButton>
                </>
              ) : state.recognised.includes(transaction.id) ? (
                <Notice>You confirmed that you recognise this activity.</Notice>
              ) : (
                <>
                  <h2 className="fraud-section-title">Do you recognise this?</h2>
                  <p>{transaction.reason}</p>
                  <PrimaryButton onClick={report}>Report unrecognised payment</PrimaryButton>
                  <PrimaryButton
                    variant="secondary"
                    onClick={() => {
                      dispatch({ type: 'recognise', transactionId: transaction.id })
                      go('fraud-recognised')
                    }}
                  >
                    I recognise this payment
                  </PrimaryButton>
                  <p className="fraud-footnote">
                    Your card will be temporarily frozen after you successfully submit the report.
                  </p>
                </>
              )}
            </>
          ) : null}

          {screen === 'fraud-claim-details' || screen === 'fraud-attempt' ? (
            <>
              <FraudEvidenceFields state={state} dispatch={dispatch} />
              <PrimaryButton onClick={() => go('fraud-claim-review')}>
                {transaction.status === 'booked' ? 'Review dispute' : 'Review report'}
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
                title={transaction.status === 'booked' ? 'Confirm your dispute' : 'Confirm your report'}
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
                  Your {transaction.status === 'booked' ? 'dispute' : 'report'} was not submitted. Your statement is
                  saved here. Please try again.
                </p>
              ) : null}
              <PrimaryButton
                labelSize="18"
                disabled={!canSubmitReport(state) || signing}
                onClick={() => setSigning(true)}
              >
                {transaction.status === 'booked' ? 'Sign dispute' : 'Sign report'}
              </PrimaryButton>
            </>
          ) : null}

          {screen === 'fraud-case-status' ? <ClaimStatus state={state} back={back} /> : null}

          {screen === 'fraud-card-security' || screen === 'fraud-geo-settings' ? (
            <>
              <div className="fraud-permissions">
                {permission('atm', 'ATM withdrawals', 'Cash withdrawals at an ATM')}
                {permission('internet', 'Internet payments', 'Online card purchases')}
                {permission('pos', 'In-store payments', 'Physical card at a POS terminal')}
              </div>
            </>
          ) : null}

          {screen === 'fraud-replace-confirm' ? (
            <ReplacementConfirmation state={state} dispatch={dispatch} go={go} />
          ) : null}

          {screen === 'fraud-replacement-status' ? (
            <>
              <p>
                Your replacement request has been received and will be processed. The bank will confirm the next steps.
              </p>
              <Facts
                items={[
                  ['Old card', 'Permanently closed'],
                  ['Replacement', 'Requested'],
                  ['Delivery and fees', 'Awaiting bank confirmation'],
                  ['Activation', 'Available after the new card is issued'],
                ]}
              />
              <p>
                We will notify you when your replacement is available. Its permissions can be managed after activation.
              </p>
              <PrimaryButton onClick={() => go('fraud-card-security')}>Ok I got it</PrimaryButton>
            </>
          ) : null}

          {screen === 'fraud-card-security' || screen === 'fraud-geo-settings' ? (
            <>
              <h2 className="fraud-section-title">Country protection</h2>
              <div role="group" aria-label="Country protection">
                <NavigationRow
                  title="Limit physical payments to my country"
                  className="fraud-security-row"
                  description="Applies to ATM and in-store POS only"
                  trailing={
                    <ToggleButton
                      ariaLabel="Limit physical payments to my country"
                      checked={state.geoEnabled}
                      disabled={closed || (state.location !== 'fresh' && !state.geoEnabled)}
                      onToggle={(enabled) => dispatch({ type: 'geo', enabled })}
                    />
                  }
                />
              </div>
              <p>
                When enabled, ATM withdrawals and in-store payments are limited to the country reported by your phone’s
                latest location signal. Internet payments are not affected.
                {state.location !== 'fresh'
                  ? state.geoEnabled
                    ? ' Restrictions remain on until the location signal is refreshed.'
                    : ' A fresh location signal is needed to enable this feature.'
                  : null}
              </p>
            </>
          ) : null}
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
                : 'About this report'
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
                    Open an item under To review and check its amount, date and details. Pending payments and declined
                    attempts can also appear here.
                  </p>
                </section>
                <section>
                  <h2 className="uc-type-n4-strong">IF YOU RECOGNISE IT</h2>
                  <p>
                    Confirm it to move the item to Reviewed. No report is sent and a declined payment is not retried.
                  </p>
                </section>
                <section>
                  <h2 className="uc-type-n4-strong">IF YOU DO NOT RECOGNISE IT</h2>
                  <p>
                    Choose Report unrecognised payment, add the details and sign your report. Your card is temporarily
                    frozen after successful submission. You can track the case from the transaction.
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
                    Check the information, confirm the declaration and tap Sign report. Face ID confirms your signature
                    before sending. Your card is temporarily frozen after successful submission. You can follow your
                    case status from the transaction.
                  </p>
                </section>
              </>
            )}
          </div>
        </BottomSheet>
      ) : null}
      {signing ? (
        <div className="absolute inset-0 z-[50]" role="status" aria-label="Face ID report signature simulation">
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
