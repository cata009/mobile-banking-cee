import { buildRoboCreationReviewRows } from '@/features/investments/robo/flowSelectors'
import { type RoboAdvisorCreationStep as CreationStep } from '@/features/investments/robo/legacyFlowState'
import { BottomSheet } from '@/app/components/BottomSheet'
import PrimaryButton from '@/app/components/PrimaryButton'
import LinkActionButton from '@/app/components/LinkActionButton'
import ToggleButton from '@/app/components/ToggleButton'
import SectionHeadingDivider from '@/app/components/SectionHeadingDivider'
import { type RoboPortfolio } from '@/features/investments/robo/types'
import { RoboScreen } from '@/app/screens/investments/robo/RoboScreen'
import type * as React from 'react'
import { useState } from 'react'

export function CreationReviewScreen({
  goalType,
  goalName,
  targetAmount,
  selectedPortfolio,
  resolvedHorizon,
  goBackByStep,
  requestExit,
  termsSheetOpen,
  setTermsSheetOpen,
  setTermsAccepted,
  termsAccepted,
  setStep,
}: {
  goalType: string
  goalName: string
  targetAmount: string
  selectedPortfolio: RoboPortfolio
  resolvedHorizon: number
  goBackByStep: () => void
  requestExit: () => void
  termsSheetOpen: boolean
  setTermsSheetOpen: React.Dispatch<React.SetStateAction<boolean>>
  setTermsAccepted: (value: boolean) => void
  termsAccepted: boolean
  setStep: (value: CreationStep) => void
}) {
  const [contractRead, setContractRead] = useState(false)
  const reviewRows = buildRoboCreationReviewRows(
    goalType,
    goalName,
    targetAmount,
    selectedPortfolio.name,
    resolvedHorizon,
  )
  const goalRows = reviewRows.filter((row) => row.section === 'goal')
  const planRows = reviewRows.filter((row) => row.section === 'plan')
  const openTermsSheet = () => {
    setContractRead(false)
    setTermsSheetOpen(true)
  }
  const closeTermsSheet = () => {
    setContractRead(false)
    setTermsSheetOpen(false)
  }
  const renderRows = (rows: typeof reviewRows) => (
    <div className="space-y-[24px] pt-[18px]">
      {rows.map((row) => (
        <div key={row.label}>
          <p className="uc-type-n5 text-[var(--uc-text-muted)]">{row.label}</p>
          <p className="uc-type-n4-strong mt-[3px] text-[var(--uc-text)]">{row.value}</p>
        </div>
      ))}
    </div>
  )
  return (
    <RoboScreen
      title="Review goal details"
      onBack={goBackByStep}
      onClose={requestExit}
      dataScreen="review"
      overlay={
        termsSheetOpen ? (
          <BottomSheet
            title="Investment account contract"
            onClose={closeTermsSheet}
            closeLabel="Close investment account contract"
            fillHeight
            titleClassName="!text-[24px] !leading-[30px]"
            className="px-[24px] pb-[24px] pt-[20px]"
            bodyClassName="overflow-hidden"
            footer={
              <div className="pt-[16px]">
                <div className="flex justify-center pb-[16px]">
                  <LinkActionButton
                    label="Download document"
                    ariaLabel="Download document"
                    className="!min-h-0 !px-0"
                  />
                </div>
                <PrimaryButton
                  className="!w-full"
                  disabled={!contractRead}
                  onClick={() => {
                    setTermsAccepted(true)
                    setTermsSheetOpen(false)
                  }}
                >
                  I have read this
                </PrimaryButton>
              </div>
            }
          >
            <div className="flex h-full min-h-0 w-full flex-col" data-testid="robo-security-account-contract">
              <div
                data-testid="robo-contract-reader"
                role="region"
                aria-label="Investment account contract document"
                /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Scrollable contract content needs keyboard focus. */
                tabIndex={0}
                onScroll={(event) => {
                  const reader = event.currentTarget
                  if (reader.scrollTop + reader.clientHeight >= reader.scrollHeight - 1) {
                    setContractRead(true)
                  }
                }}
                className="min-h-0 flex-1 overflow-y-auto rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] focus-visible:outline-2 focus-visible:outline-[var(--uc-action)]"
              >
                <article className="flex min-h-[960px] flex-col gap-[20px] bg-[var(--uc-surface)] p-[24px] text-[var(--uc-text)]">
                  <div className="text-center">
                    <h2 className="uc-type-h2 uppercase">Investment account terms</h2>
                    <p className="uc-type-n4-strong mt-[20px]">Demonstration document</p>
                    <p className="uc-type-n5 mt-[8px] text-[var(--uc-text-muted)]">
                      Demo reference INV-DEMO-0001 | Version 1.0
                    </p>
                  </div>
                  <p className="uc-type-n4 leading-[22px]">
                    Sample terms for the investment goal prototype. Names, terms and amounts are fictional. This
                    document does not open an account, place an order or provide legal or investment advice.
                  </p>
                  <section className="space-y-[8px]">
                    <h3 className="uc-type-n4-strong">1. Parties and purpose</h3>
                    <p className="uc-type-n4 leading-[22px]">
                      This sample agreement describes how a demonstration investment account may be used to support a
                      goal. The client and service provider details shown in this preview are fictional.
                    </p>
                  </section>
                  <section className="space-y-[8px]">
                    <h3 className="uc-type-n4-strong">2. Account use</h3>
                    <p className="uc-type-n4 leading-[22px]">
                      The account is intended to hold eligible investment products selected for the goal. Account
                      information, available services and product eligibility would be confirmed by the bank before
                      opening a real account.
                    </p>
                  </section>
                  <section className="space-y-[8px]">
                    <h3 className="uc-type-n4-strong">3. Orders and settlement</h3>
                    <p className="uc-type-n4 leading-[22px]">
                      Each investment order would be reviewed and authorized separately. Execution timing, settlement
                      and any cancellation rights depend on the applicable product terms and market conditions.
                    </p>
                  </section>
                  <section className="space-y-[8px]">
                    <h3 className="uc-type-n4-strong">4. Costs and statements</h3>
                    <p className="uc-type-n4 leading-[22px]">
                      Applicable charges and product costs would be provided before an order is placed. Account
                      statements and service notices would be sent to the contact details confirmed by the client.
                    </p>
                  </section>
                  <section className="space-y-[8px]">
                    <h3 className="uc-type-n4-strong">5. Investment risk</h3>
                    <p className="uc-type-n4 leading-[22px]">
                      Investments can rise or fall in value. Returns are not guaranteed and the client may receive back
                      less than the amount invested. Product information and suitability should be reviewed before any
                      real order is made.
                    </p>
                  </section>
                  <section className="space-y-[8px]">
                    <h3 className="uc-type-n4-strong">6. Demonstration notice</h3>
                    <p className="uc-type-n4 leading-[22px]">
                      This demonstration text is illustrative only. It is not a contract, does not create a banking
                      relationship and must not be used as the terms for a real investment account.
                    </p>
                  </section>
                </article>
              </div>
            </div>
          </BottomSheet>
        ) : undefined
      }
      footer={
        <PrimaryButton labelSize="18" disabled={!termsAccepted} onClick={() => setStep('sign')}>
          Continue to sign
        </PrimaryButton>
      }
    >
      <SectionHeadingDivider title="Review your goal" />
      {renderRows(goalRows)}
      <SectionHeadingDivider title="Your investment plan" className="mt-[30px]" />
      {renderRows(planRows)}
      <div className="mt-[28px] flex min-h-[80px] items-center gap-[12px]">
        <button
          type="button"
          className="flex min-w-0 flex-1 flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2"
          aria-label="Review terms and conditions"
          onClick={openTermsSheet}
        >
          <span className="uc-type-n4-strong text-[var(--uc-text)]">Terms &amp; conditions</span>
          <span className="uc-type-n4 mt-[4px] text-[var(--uc-text)]">
            Review the contract for opening your investment account.
          </span>
        </button>
        <ToggleButton
          ariaLabel="Accept terms and conditions"
          checked={termsAccepted}
          onToggle={(checked) => {
            if (checked) openTermsSheet()
            else setTermsAccepted(false)
          }}
        />
      </div>
    </RoboScreen>
  )
}
