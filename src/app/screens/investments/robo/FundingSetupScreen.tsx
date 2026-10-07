import { BottomSheet } from '@/app/components/BottomSheet'
import PrimaryButton from '@/app/components/PrimaryButton'
import TextField from '@/app/components/TextField'
import InvestmentAccountSelectionSheet from '@/app/components/investments/InvestmentAccountSelectionSheet'
import { AppIcon } from '@/app/components/icons'
import { Calendar } from '@/app/components/ui/calendar'
import {
  getRoboReferenceDate,
  isRoboFundingDateAllowed,
  parseRoboFundingDate,
  type RoboDemoClock,
} from '@/features/investments/robo/demoClock'
import { cn } from '@/app/components/ui/utils'
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting'
import type { CountryId } from '@/app/state/demoTypes'
import type { CurrentAccount } from '@/data/products'
import { type RoboFundingMethod } from '@/features/investments/robo/types'
import { displayRoboAccountNumber, ROBO_FUNDING_OPTIONS } from '@/features/investments/robo/presentationData'
import { formatRoboCalendarDate } from '@/features/investments/robo/goalPositions'
import { RoboScreen } from '@/app/screens/investments/robo/RoboScreen'
import { FundingAmountSuggestion } from '@/app/screens/investments/robo/GoalPlanScreen'
import type * as React from 'react'
import type { RoboEvent } from '@/features/investments/robo/flowState'
import type { RoboFundingFieldVisibility } from '@/features/investments/robo/types'

export function CreationFundingSetupScreen({
  fundingMethod,
  fundingFields,
  selectedCashAccount,
  initialAmount,
  monthlyContribution,
  startDate,
  demoClock,
  goBackByStep,
  requestExit,
  startDatePickerOpen,
  setStartDatePickerOpen,
  setStartDate,
  cashAccountSheetOpen,
  currentAccounts,
  country,
  amountsHidden,
  selectedCashAccountId,
  setCashAccountSheetOpen,
  setSelectedCashAccountId,
  dispatchFlow,
  setFundingMethod,
  setInitialAmount,
  setMonthlyContribution,
}: {
  fundingMethod: RoboFundingMethod | null
  fundingFields: RoboFundingFieldVisibility | null
  selectedCashAccount: CurrentAccount | null
  initialAmount: string
  monthlyContribution: string
  startDate: string
  demoClock: RoboDemoClock
  goBackByStep: () => void
  requestExit: () => void
  startDatePickerOpen: boolean
  setStartDatePickerOpen: React.Dispatch<React.SetStateAction<boolean>>
  setStartDate: (value: string) => void
  cashAccountSheetOpen: boolean
  currentAccounts: readonly CurrentAccount[]
  country: CountryId
  amountsHidden: boolean
  selectedCashAccountId: string
  setCashAccountSheetOpen: React.Dispatch<React.SetStateAction<boolean>>
  setSelectedCashAccountId: React.Dispatch<React.SetStateAction<string>>
  dispatchFlow: React.Dispatch<RoboEvent>
  setFundingMethod: (value: RoboFundingMethod | null) => void
  setInitialAmount: (value: string) => void
  setMonthlyContribution: (value: string) => void
}) {
  const canContinue = Boolean(
    fundingMethod &&
    fundingFields &&
    selectedCashAccount &&
    (!fundingFields.initialAmount || Number(initialAmount) > 0) &&
    (!fundingFields.monthlyContribution || Number(monthlyContribution) > 0) &&
    (!fundingFields.startDate || isRoboFundingDateAllowed(startDate, demoClock)),
  )
  const description = !fundingMethod
    ? 'Choose a contribution plan. The matching details will appear below.'
    : fundingMethod === 'one-off'
      ? 'Choose how much to invest now and which cash account to use.'
      : fundingMethod === 'regular'
        ? 'Set your monthly contribution, start date and cash account.'
        : 'Set an initial investment and monthly contributions from one cash account.'
  const cashAccountDescription =
    fundingMethod === 'one-off'
      ? 'We’ll use this account for your one-time investment.'
      : fundingMethod === 'regular'
        ? 'We’ll use this account for your monthly contributions.'
        : 'We’ll use this account for your initial and monthly contributions.'

  return (
    <RoboScreen
      title="Set up your investment"
      description={description}
      onBack={goBackByStep}
      onClose={requestExit}
      dataScreen={`funding-setup${fundingMethod ? `-${fundingMethod}` : ''}`}
      contentTopClassName="pt-[16px]"
      overlay={
        <>
          {startDatePickerOpen ? (
            <BottomSheet
              title="Select start date"
              onClose={() => setStartDatePickerOpen(false)}
              closeLabel="Close calendar"
            >
              <div className="w-full pb-[8px]">
                <Calendar
                  className="w-full"
                  mode="single"
                  disabled={{ before: getRoboReferenceDate(demoClock) }}
                  today={getRoboReferenceDate(demoClock)}
                  defaultMonth={parseRoboFundingDate(startDate) ?? getRoboReferenceDate(demoClock)}
                  selected={parseRoboFundingDate(startDate)}
                  onSelect={(date) => {
                    if (!date) return
                    setStartDate(formatRoboCalendarDate(date))
                    setStartDatePickerOpen(false)
                  }}
                />
              </div>
            </BottomSheet>
          ) : null}
          {cashAccountSheetOpen ? (
            <InvestmentAccountSelectionSheet
              title="Select cash account"
              options={currentAccounts.map((account) => ({
                id: account.id,
                name: account.name,
                detail: displayRoboAccountNumber(account.accountNumber, country),
                balance: formatInvestmentMoney(account.balance, country, account.currency, amountsHidden),
              }))}
              selectedId={selectedCashAccountId}
              onClose={() => setCashAccountSheetOpen(false)}
              onConfirm={(id) => {
                setSelectedCashAccountId(id)
                setCashAccountSheetOpen(false)
              }}
            />
          ) : null}
        </>
      }
      footer={
        <PrimaryButton
          labelSize="18"
          disabled={!canContinue}
          onClick={() => dispatchFlow({ type: 'open-portfolio', from: 'funding-setup' })}
        >
          Continue
        </PrimaryButton>
      }
    >
      <div role="radiogroup" aria-label="Contribution plan" className="space-y-[8px]">
        {ROBO_FUNDING_OPTIONS.map((option) => {
          const selected = fundingMethod === option.id
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${option.title}. ${option.description}`}
              onClick={() => setFundingMethod(option.id)}
              className={cn('flex min-h-[48px] w-full items-center gap-[10px] py-[6px] text-left transition-colors')}
            >
              <span className="grid size-[24px] shrink-0 place-items-center">
                <AppIcon
                  name={selected ? 'radio-selected' : 'radio-unselected'}
                  size={24}
                  color={selected ? 'var(--uc-action)' : 'var(--uc-text)'}
                />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    'block text-[15px] font-bold leading-[18px]',
                    selected ? 'text-[var(--uc-action)]' : 'text-[var(--uc-text)]',
                  )}
                >
                  {option.title}
                </span>
                <span className="mt-[2px] block text-[13px] leading-[16px] text-[var(--uc-text-muted)]">
                  {option.description}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {fundingFields ? (
        <>
          <div className="mt-[24px] space-y-[24px]">
            {fundingFields.initialAmount ? (
              <div>
                <TextField
                  label="Amount to invest now"
                  value={initialAmount}
                  onChange={setInitialAmount}
                  inputMode="numeric"
                  suffix="CZK"
                  suffixOutsideDivider
                  suffixClassName="!font-bold"
                />
                <div className="mt-[16px] grid grid-cols-3 gap-[8px]">
                  {['5000', '10000', '100000'].map((amount) => (
                    <FundingAmountSuggestion
                      key={amount}
                      amount={amount}
                      value={initialAmount}
                      onSelect={setInitialAmount}
                    />
                  ))}
                </div>
              </div>
            ) : null}
            {fundingFields.monthlyContribution ? (
              <div className={fundingFields.initialAmount ? 'pt-[8px]' : undefined}>
                <TextField
                  label="Monthly contribution"
                  value={monthlyContribution}
                  onChange={setMonthlyContribution}
                  inputMode="numeric"
                  suffix="CZK"
                  suffixOutsideDivider
                  suffixClassName="!font-bold"
                />
                <div className="mt-[16px] grid grid-cols-3 gap-[8px]">
                  {['500', '1000', '2000'].map((amount) => (
                    <FundingAmountSuggestion
                      key={amount}
                      amount={amount}
                      value={monthlyContribution}
                      onSelect={setMonthlyContribution}
                    />
                  ))}
                </div>
              </div>
            ) : null}
            {fundingFields.startDate ? (
              <TextField
                label="Start date"
                value={startDate}
                onChange={setStartDate}
                readOnly
                onActivate={() => setStartDatePickerOpen(true)}
                trailingIconName="insurance-calendar"
                trailingIconAction={{
                  ariaLabel: 'Select start date',
                  onClick: () => setStartDatePickerOpen(true),
                }}
              />
            ) : null}
          </div>

          <div className="mt-[28px]">
            <h2 className="text-[20px] font-bold leading-[24px] text-[var(--uc-text)]">Choose the account to use</h2>
            <p className="mt-[10px] text-[16px] leading-[21px] text-[var(--uc-text)]">{cashAccountDescription}</p>
            <div className="mt-[18px]">
              {selectedCashAccount ? (
                <TextField
                  label="Cash account"
                  ariaLabel={`Cash account, ${selectedCashAccount.name}`}
                  value={displayRoboAccountNumber(selectedCashAccount.accountNumber, country)}
                  onChange={() => undefined}
                  readOnly
                  trailingIconName="chevron-down"
                  helperText={selectedCashAccount.name}
                  helperText2={`Available balance ${formatInvestmentMoney(selectedCashAccount.balance, country, selectedCashAccount.currency, amountsHidden)}`}
                  onActivate={() => setCashAccountSheetOpen(true)}
                />
              ) : (
                <p className="text-[14px] leading-[18px] text-[var(--uc-status-red)]">
                  No current account is available.
                </p>
              )}
            </div>
          </div>
        </>
      ) : null}
    </RoboScreen>
  )
}
