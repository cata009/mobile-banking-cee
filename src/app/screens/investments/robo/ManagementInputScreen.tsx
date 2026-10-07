import { BottomSheet } from '@/app/components/BottomSheet'
import PrimaryButton from '@/app/components/PrimaryButton'
import TextField from '@/app/components/TextField'
import InvestmentAccountSelectionSheet from '@/app/components/investments/InvestmentAccountSelectionSheet'
import { AppIcon } from '@/app/components/icons'
import { Calendar } from '@/app/components/ui/calendar'
import { getRoboReferenceDate, parseRoboFundingDate, type RoboDemoClock } from '@/features/investments/robo/demoClock'
import { cn } from '@/app/components/ui/utils'
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting'
import type { CountryId } from '@/app/state/demoTypes'
import type { CurrentAccount } from '@/data/products'
import { type RoboFundingMethod } from '@/features/investments/robo/types'
import { type RoboAdvisorManagementMode as ManagementMode } from '@/app/screens/investments/roboAdvisorFlowState'
import { formatRoboCalendarDate } from '@/features/investments/robo/goalPositions'
import { FundingAmountSuggestion } from '@/app/screens/investments/robo/GoalPlanScreen'
import {
  displayRoboAccountNumber,
  ROBO_FUNDING_OPTIONS,
  defaultCashAccountLabel,
} from '@/features/investments/robo/presentationData'
import { RoboScreen } from '@/app/screens/investments/robo/RoboScreen'
import type * as React from 'react'
import type { RoboManagementEvent } from '@/features/investments/robo/managementState'
import type { RoboFundingFieldVisibility } from '@/features/investments/robo/types'

export function ManagementInputScreen({
  mode,
  onBack,
  onClose,
  recurringDatePickerOpen,
  setRecurringDatePickerOpen,
  demoClock,
  date,
  setDate,
  topUpCashAccountSheetOpen,
  currentAccounts,
  country,
  amountsHidden,
  selectedCashAccountId,
  setTopUpCashAccountSheetOpen,
  onCashAccountChange,
  renameName,
  canReviewTopUp,
  onRename,
  onMode,
  dispatchManagement,
  renderSelectedWithdrawalProducts,
  topUpMethod,
  setTopUpMethod,
  topUpFields,
  amount,
  setAmount,
  monthlyAmount,
  setMonthlyAmount,
  setRenameName,
  selectedTopUpCashAccount,
}: {
  mode: 'menu' | 'add-money' | 'monthly' | 'partial-withdrawal' | 'rename'
  onBack: () => void
  onClose: () => void
  recurringDatePickerOpen: boolean
  setRecurringDatePickerOpen: (open: boolean) => void
  demoClock: RoboDemoClock
  date: string
  setDate: (value: string) => void
  topUpCashAccountSheetOpen: boolean
  currentAccounts: readonly CurrentAccount[]
  country: CountryId
  amountsHidden: boolean
  selectedCashAccountId: string
  setTopUpCashAccountSheetOpen: (open: boolean) => void
  onCashAccountChange: (accountId: string) => void
  renameName: string
  canReviewTopUp: boolean
  onRename: (name: string) => void
  onMode: (mode: ManagementMode) => void
  dispatchManagement: React.Dispatch<RoboManagementEvent>
  renderSelectedWithdrawalProducts: () => React.JSX.Element
  topUpMethod: RoboFundingMethod
  setTopUpMethod: (method: RoboFundingMethod) => void
  topUpFields: RoboFundingFieldVisibility
  amount: string
  setAmount: (value: string) => void
  monthlyAmount: string
  setMonthlyAmount: (value: string) => void
  setRenameName: (value: string) => void
  selectedTopUpCashAccount: CurrentAccount | null
}) {
  const config = {
    'add-money': {
      title: 'Add money to your goal',
      description: 'Choose a one-off or monthly investment in your linked basket.',
      label: 'Amount to add',
      action: 'Review investment',
    },
    monthly: {
      title: 'Manage monthly investment',
      description:
        'Change the amount or next date. Stopping monthly investments will not close your goal or sell existing holdings.',
      label: 'Monthly amount',
      action: 'Review changes',
    },
    'partial-withdrawal': {
      title: 'Choose withdrawal amount',
      description:
        'Enter the amount to withdraw. Final proceeds depend on the sale price when the orders are executed.',
      label: 'Amount to withdraw',
      action: 'Review sale orders',
    },
    rename: {
      title: 'Rename goal',
      description: 'Choose a name that will help you recognize this goal.',
      label: 'Goal name',
      action: 'Save name',
    },
  }[
    mode as Exclude<
      ManagementMode,
      'menu' | 'withdraw' | 'full-withdrawal' | 'history' | 'settings' | 'close' | 'goal-plan' | 'add-money-basket'
    >
  ]
  return (
    <RoboScreen
      title={config.title}
      description={
        mode === 'partial-withdrawal'
          ? 'Review the products you selected and choose how much to withdraw.'
          : config.description
      }
      onBack={onBack}
      onClose={onClose}
      headerAction={mode === 'rename' || mode === 'add-money' ? 'none' : 'close'}
      contentTopClassName={mode === 'add-money' ? 'pt-[16px]' : undefined}
      dataScreen={mode}
      overlay={
        mode === 'add-money' ? (
          <>
            {recurringDatePickerOpen ? (
              <BottomSheet
                title="Select start date"
                onClose={() => setRecurringDatePickerOpen(false)}
                closeLabel="Close calendar"
              >
                <div className="w-full pb-[8px]">
                  <Calendar
                    className="w-full"
                    mode="single"
                    disabled={{ before: getRoboReferenceDate(demoClock) }}
                    today={getRoboReferenceDate(demoClock)}
                    defaultMonth={parseRoboFundingDate(date) ?? getRoboReferenceDate(demoClock)}
                    selected={parseRoboFundingDate(date)}
                    onSelect={(selectedDate) => {
                      if (!selectedDate) return
                      setDate(formatRoboCalendarDate(selectedDate))
                      setRecurringDatePickerOpen(false)
                    }}
                  />
                </div>
              </BottomSheet>
            ) : null}
            {topUpCashAccountSheetOpen ? (
              <InvestmentAccountSelectionSheet
                title="Select cash account"
                options={currentAccounts.map((account) => ({
                  id: account.id,
                  name: account.name,
                  detail: displayRoboAccountNumber(account.accountNumber, country),
                  balance: formatInvestmentMoney(account.balance, country, account.currency, amountsHidden),
                }))}
                selectedId={selectedCashAccountId}
                onClose={() => setTopUpCashAccountSheetOpen(false)}
                onConfirm={(accountId) => {
                  onCashAccountChange(accountId)
                  setTopUpCashAccountSheetOpen(false)
                }}
              />
            ) : null}
          </>
        ) : undefined
      }
      footer={
        <PrimaryButton
          labelSize="18"
          disabled={(mode === 'rename' && renameName.trim().length === 0) || (mode === 'add-money' && !canReviewTopUp)}
          onClick={() => {
            if (mode === 'rename') {
              onRename(renameName.trim())
              onMode('menu')
              return
            }
            if (mode === 'add-money') {
              dispatchManagement({ type: 'top-up-reviewed', valid: canReviewTopUp })
              return
            }
            onBack()
          }}
        >
          {config.action}
        </PrimaryButton>
      }
    >
      {mode === 'partial-withdrawal' ? renderSelectedWithdrawalProducts() : null}
      {mode === 'add-money' ? (
        <div className="space-y-[20px]">
          <div role="radiogroup" aria-label="Top-up contribution type" className="space-y-[8px]">
            {ROBO_FUNDING_OPTIONS.map((option) => {
              const selected = topUpMethod === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={`${option.title}. ${option.description}`}
                  onClick={() => setTopUpMethod(option.id)}
                  className="flex min-h-[48px] w-full items-center gap-[10px] py-[6px] text-left"
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

          {topUpFields.initialAmount ? (
            <div>
              <TextField
                label={topUpMethod === 'combined' ? 'Initial amount to add' : 'Amount to add'}
                value={amount}
                onChange={setAmount}
                inputMode="numeric"
                suffix="CZK"
              />
              <div className="mt-[16px] grid grid-cols-3 gap-[8px]">
                {['5000', '10000', '100000'].map((suggestedAmount) => (
                  <FundingAmountSuggestion
                    key={suggestedAmount}
                    amount={suggestedAmount}
                    value={amount}
                    onSelect={setAmount}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {topUpFields.monthlyContribution ? (
            <div className={topUpFields.initialAmount ? 'pt-[8px]' : undefined}>
              <TextField
                label="Monthly contribution"
                value={monthlyAmount}
                onChange={setMonthlyAmount}
                inputMode="numeric"
                suffix="CZK"
              />
              <div className="mt-[16px] grid grid-cols-3 gap-[8px]">
                {['500', '1000', '2000'].map((suggestedAmount) => (
                  <FundingAmountSuggestion
                    key={suggestedAmount}
                    amount={suggestedAmount}
                    value={monthlyAmount}
                    onSelect={setMonthlyAmount}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {topUpFields.startDate ? (
            <TextField
              label="Monthly contribution starts"
              value={date}
              onChange={setDate}
              readOnly
              onActivate={() => setRecurringDatePickerOpen(true)}
              trailingIconName="insurance-calendar"
              trailingIconAction={{
                ariaLabel: 'Select recurring start date',
                onClick: () => setRecurringDatePickerOpen(true),
              }}
            />
          ) : null}
        </div>
      ) : (
        <TextField
          label={config.label}
          value={mode === 'rename' ? renameName : amount}
          onChange={mode === 'rename' ? setRenameName : setAmount}
          inputMode={mode === 'rename' ? 'text' : 'numeric'}
          suffix={mode === 'rename' ? undefined : 'CZK'}
        />
      )}
      {mode === 'monthly' ? (
        <div className="mt-[28px]">
          <TextField label="Next investment date" value={date} onChange={setDate} trailingIconName="calendar-days" />
          <button type="button" className="uc-type-n4-strong mt-[28px] text-[var(--uc-status-red)]">
            Stop monthly investment
          </button>
        </div>
      ) : null}
      {mode === 'add-money' && selectedTopUpCashAccount ? (
        <div className="mt-[28px]">
          <TextField
            label="Cash account"
            ariaLabel={`Cash account, ${selectedTopUpCashAccount.name}`}
            value={displayRoboAccountNumber(selectedTopUpCashAccount.accountNumber, country)}
            onChange={() => undefined}
            readOnly
            trailingIconName="chevron-down"
            helperText={selectedTopUpCashAccount.name}
            helperText2={`Available balance ${formatInvestmentMoney(selectedTopUpCashAccount.balance, country, selectedTopUpCashAccount.currency, amountsHidden)}`}
            onActivate={() => setTopUpCashAccountSheetOpen(true)}
          />
        </div>
      ) : mode === 'add-money' ? (
        <p className="mt-[28px] text-[14px] leading-[18px] text-[var(--uc-status-red)]">
          No current account is available.
        </p>
      ) : mode === 'partial-withdrawal' ? (
        <div className="mt-[28px] rounded-[8px] bg-[var(--uc-surface-muted)] p-[14px]">
          <p className="uc-type-n5 text-[var(--uc-text-muted)]">Cash account</p>
          <p className="uc-type-n4-strong mt-[4px] text-[var(--uc-text)]">{defaultCashAccountLabel}</p>
        </div>
      ) : null}
    </RoboScreen>
  )
}
