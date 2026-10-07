import { buildRoboCreationReviewRows } from '@/features/investments/robo/flowSelectors'
import { type RoboAdvisorCreationStep as CreationStep } from '@/features/investments/robo/legacyFlowState'
import { BottomSheet } from '@/app/components/BottomSheet'
import PrimaryButton from '@/app/components/PrimaryButton'
import ToggleButton from '@/app/components/ToggleButton'
import SectionHeadingDivider from '@/app/components/SectionHeadingDivider'
import { type RoboPortfolio } from '@/features/investments/robo/types'
import { RoboScreen } from '@/app/screens/investments/robo/RoboScreen'
import type * as React from 'react'

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
  termsSheetAccepted,
  setTermsAccepted,
  setTermsSheetAccepted,
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
  termsSheetAccepted: boolean
  setTermsAccepted: (value: boolean) => void
  setTermsSheetAccepted: React.Dispatch<React.SetStateAction<boolean>>
  termsAccepted: boolean
  setStep: (value: CreationStep) => void
}) {
  const reviewRows = buildRoboCreationReviewRows(
    goalType,
    goalName,
    targetAmount,
    selectedPortfolio.name,
    resolvedHorizon,
  )
  const goalRows = reviewRows.filter((row) => row.section === 'goal')
  const planRows = reviewRows.filter((row) => row.section === 'plan')
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
      title="Review Data"
      onBack={goBackByStep}
      onClose={requestExit}
      dataScreen="review"
      overlay={
        termsSheetOpen ? (
          <BottomSheet
            title="Investment account contract"
            onClose={() => setTermsSheetOpen(false)}
            closeLabel="Close investment account contract"
            fillHeight
            className="!p-0"
            headerClassName="mx-[16px] mt-[16px]"
            bodyClassName="min-h-0 flex-1"
            footer={
              <div className="bg-[var(--uc-surface)] px-[24px] pb-[34px] pt-[12px]">
                <PrimaryButton
                  labelSize="18"
                  disabled={!termsSheetAccepted}
                  onClick={() => {
                    setTermsAccepted(true)
                    setTermsSheetOpen(false)
                  }}
                >
                  Accept and continue
                </PrimaryButton>
              </div>
            }
          >
            <div
              className="h-full overflow-y-auto px-[24px] pb-[24px] text-[var(--uc-text)]"
              data-testid="robo-security-account-contract"
            >
              <p className="uc-type-n4-strong pt-[4px]">Opening your investment securities account</p>
              <p className="uc-type-n5 mt-[12px] leading-[21px]">
                You request that UniCredit opens an investment securities account for this goal and links it to the
                selected cash account.
              </p>
              <p className="uc-type-n5 mt-[20px] leading-[21px]">
                The account will hold the instruments included in{' '}
                {selectedPortfolio.basketFund?.title ?? selectedPortfolio.name}. Initial and additional contributions
                are submitted as individual product orders according to the basket allocation. Sales are submitted for
                individual products.
              </p>
              <p className="uc-type-n5 mt-[20px] leading-[21px]">
                Securities are held in custody for you. Orders are subject to execution, settlement and custody terms
                applicable to the account and each instrument.
              </p>
              <p className="uc-type-n5 mt-[20px] leading-[21px]">
                Investment values can rise or fall, and returns are not guaranteed. Product costs and account fees apply
                as described in the relevant product and account terms.
              </p>
              <div className="mt-[28px] flex items-center justify-between gap-[20px] border-t border-[var(--uc-border-muted)] pt-[20px]">
                <p className="uc-type-n4 flex-1">I have read and accept the investment account contract.</p>
                <ToggleButton
                  ariaLabel="Accept investment account contract"
                  checked={termsSheetAccepted}
                  onToggle={setTermsSheetAccepted}
                />
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
          onClick={() => {
            setTermsSheetAccepted(termsAccepted)
            setTermsSheetOpen(true)
          }}
        >
          <span className="uc-type-n4-strong text-[var(--uc-text)]">Terms &amp; conditions</span>
          <span className="uc-type-n4 mt-[4px] text-[var(--uc-text)]">
            Review the contract for opening your investment account.
          </span>
        </button>
        <ToggleButton ariaLabel="Accept terms and conditions" checked={termsAccepted} onToggle={setTermsAccepted} />
      </div>
    </RoboScreen>
  )
}
