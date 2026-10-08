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
      title="Review goal details"
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
            titleClassName="!text-[24px] !leading-[30px]"
            className="px-[24px] pb-[24px] pt-[20px]"
            footer={
              <div className="pt-[16px]">
                <div className="flex justify-center pb-[16px]">
                  <LinkActionButton
                    label="Download PDF"
                    ariaLabel="Download PDF: Investment account contract"
                    className="!min-h-0 !px-0"
                  />
                </div>
                <PrimaryButton
                  className="!w-full"
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
            <div className="flex h-full min-h-0 w-full flex-col">
              <div
                className="flex min-h-0 flex-1 flex-col items-center justify-center gap-[10px] rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] p-[24px]"
                data-testid="robo-security-account-contract"
              >
                <svg
                  aria-hidden="true"
                  className="size-[32px] text-[var(--uc-text-muted)]"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    clipRule="evenodd"
                    d="M16.9132 0H3V20.25C3 22.3211 4.67893 24 6.75 24H21.75V4.8375L16.9132 0ZM6.75 15.75H18V14.25H6.75V15.75ZM18 19.5H6.75V18H18V19.5ZM6.75 12H12.75V10.5H6.75V12ZM15.75 1.5V6H20.25L15.75 1.5Z"
                    fill="currentColor"
                    fillRule="evenodd"
                  />
                </svg>
                <p className="text-center uc-type-n5-strong leading-[20px] text-[var(--uc-text-muted)]">PDF document</p>
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
          onClick={() => setTermsSheetOpen(true)}
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
            if (checked) setTermsSheetOpen(true)
            else setTermsAccepted(false)
          }}
        />
      </div>
    </RoboScreen>
  )
}
