import { useReducer } from 'react'
import { BottomSheet } from '@/app/components/BottomSheet'
import PrimaryButton from '@/app/components/PrimaryButton'
import { AppIcon } from '@/app/components/icons'
import { formatScheduleSummary } from '@/app/utils/scheduleFormatting'
import { HU_KIDS_ACCOUNTS, type HuKidsAccount, type SavingGoal } from '@/data/huKidsBanking'
import { formatHuKidsAmount, formatHuKidsGoalAmount } from '@/app/screens/kids/hu/money'
import type { HuThemePreset } from '@/app/screens/kids/hu/theme'
import type { ScheduleConfig } from '@/app/screens/kids/hu/types'
import { HuKidsGoalPageHeader } from '@/app/screens/kids/hu/goals/overview'
import { ScheduleSheet } from '@/app/screens/kids/hu/goals/schedule'

export const KEYPAD_PRESETS = [1000, 2500, 5000]

export function HuKidsAddMoneyPage({
  goal,
  onBack,
  onSubmit,
  onScheduleAdd,
  theme,
  showAmounts,
}: {
  goal: SavingGoal | null
  onBack: () => void
  onSubmit: (amount: number) => void
  onScheduleAdd?: (amount: number, schedule: ScheduleConfig) => void
  theme: HuThemePreset
  showAmounts: boolean
}) {
  const [addMoneyState, dispatchAddMoney] = useReducer(huAddMoneyReducer, undefined, createHuAddMoneyState)
  const { schedule } = addMoneyState
  const {
    selectedAccount,
    hasOperator,
    evaluated,
    amount,
    exceedsBalance,
    canSubmit,
    hasAmount,
    isComplete,
    expressionDisplay,
    amountFontSize,
  } = selectHuAddMoney(addMoneyState)
  const isAccountSheetOpen = addMoneyState.sheet === 'account'
  const isScheduleSheetOpen = addMoneyState.sheet === 'schedule'
  const appendToken = (token: string) => dispatchAddMoney({ type: 'token', token })
  const backspace = () => dispatchAddMoney({ type: 'backspace' })
  const setIsAccountSheetOpen = (open: boolean) => dispatchAddMoney({ type: 'sheet', sheet: open ? 'account' : null })
  const setIsScheduleSheetOpen = (open: boolean) => dispatchAddMoney({ type: 'sheet', sheet: open ? 'schedule' : null })
  const setSelectedAccount = (account: HuKidsAccount) => dispatchAddMoney({ type: 'account', accountId: account.id })
  const setSchedule = (schedule: ScheduleConfig | null) => dispatchAddMoney({ type: 'schedule', schedule })
  const keyButton =
    'flex h-[56px] items-center justify-center rounded-[12px] text-[28px] font-semibold leading-[30px] text-[var(--uc-text)] transition-colors active:bg-[var(--uc-surface-muted)]'

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
      <HuKidsGoalPageHeader
        onBack={onBack}
        theme={theme}
        title="Add money"
        subtitle={goal ? `${goal.title} · ${formatHuKidsGoalAmount(goal.savedAmount, showAmounts)}` : undefined}
      />
      <main className="scrollbar-hide flex min-h-0 flex-1 flex-col px-[24px] pb-[20px]">
        {/* Amount display — visually centered between the header and the CTA.
            The top padding balances against the bottom keypad stack so the
            amount reads as the focal point of the screen. */}
        <div className="flex flex-row items-baseline justify-center gap-[6px] pt-[72px] text-center">
          {hasOperator && isComplete ? (
            <p
              className="font-bold tracking-[0] whitespace-nowrap"
              style={{ fontSize: `${amountFontSize}px`, lineHeight: `${amountFontSize + 4}px` }}
            >
              <span className="text-[var(--uc-text-muted)]">{expressionDisplay}=</span>{' '}
              <span className="text-[var(--uc-text)]">{evaluated}</span>
            </p>
          ) : (
            <p
              className={`font-bold tracking-[0] whitespace-nowrap ${
                hasAmount ? 'text-[var(--uc-text)]' : 'text-[var(--uc-text-muted)]'
              }`}
              style={{ fontSize: `${amountFontSize}px`, lineHeight: `${amountFontSize + 4}px` }}
            >
              {hasAmount ? expressionDisplay : '0'}
            </p>
          )}
          <span className="text-[16px] font-medium leading-[20px] tracking-[0] text-[var(--uc-text-muted)]">HUF</span>
        </div>

        {/* Source-account selector — pill matching the presets/operators
            containers. Turns a soft red when the entered amount exceeds the
            account balance, signalling insufficient funds. */}
        <div className="mt-[16px] flex justify-center">
          <button
            type="button"
            onClick={() => setIsAccountSheetOpen(true)}
            className={
              exceedsBalance
                ? 'flex items-center gap-[6px] rounded-full border border-[color-mix(in_srgb,var(--uc-status-red)_40%,transparent)] bg-[color-mix(in_srgb,var(--uc-status-red)_10%,var(--uc-surface))] px-[14px] py-[8px] text-left'
                : 'flex items-center gap-[6px] rounded-full border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] py-[8px] text-left'
            }
          >
            <span className="truncate text-[13px] font-bold leading-[16px] tracking-[0] text-[var(--uc-text)]">
              {selectedAccount.name}
            </span>
            <span className="text-[13px] font-normal leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">
              · {formatHuKidsAmount(selectedAccount.balance)}
            </span>
            <AppIcon name="chevron-down" size={14} color="var(--uc-text-muted)" />
          </button>
        </div>

        <div className="flex-1" />

        {/* Schedule confirmation text (shown above CTA when a schedule is set). */}
        {schedule ? (
          <p className="mb-[12px] text-center text-[13px] leading-[16px] text-[var(--uc-text-muted)]">
            <span>Scheduled: </span>
            <span className="font-bold text-[var(--uc-text)]">{formatScheduleSummary(schedule)}</span>
          </p>
        ) : null}

        {/* CTA row: calendar opens the schedule sheet; primary button submits. */}
        <div className="flex items-center gap-[8px]">
          <button
            type="button"
            aria-label="Schedule"
            onClick={() => setIsScheduleSheetOpen(true)}
            className={
              schedule
                ? 'grid size-[48px] shrink-0 place-items-center rounded-[12px] border border-transparent bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]'
                : 'grid size-[48px] shrink-0 place-items-center rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] text-[var(--uc-text)]'
            }
          >
            <AppIcon name="calendar-days" size={22} color="currentColor" />
          </button>
          <PrimaryButton
            className="!h-[48px] !flex-1"
            disabled={!canSubmit}
            onClick={() => {
              if (schedule && onScheduleAdd) {
                onScheduleAdd(amount, schedule)
              } else {
                onSubmit(amount)
              }
            }}
          >
            {schedule ? 'Schedule' : 'Add money'}
          </PrimaryButton>
        </div>

        {/* Operators strip — shows above the keypad once the user has typed a
            digit. Five equal buttons: + − × ÷ =. The "=" evaluates the current
            expression; it's disabled until an operator is present. */}
        {hasAmount ? (
          <div className="mt-[12px] grid grid-cols-5 gap-[12px]">
            {(
              [
                ['+', '+'],
                ['−', '-'],
                ['×', '*'],
                ['÷', '/'],
              ] as const
            ).map(([display, token]) => (
              <button
                key={display}
                type="button"
                onClick={() => appendToken(token)}
                className="flex h-[44px] items-center justify-center rounded-full border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] uc-type-n2-strong leading-[22px] text-[var(--uc-text)] transition-colors active:bg-[var(--uc-surface-muted)]"
              >
                {display}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                dispatchAddMoney({ type: 'evaluate' })
              }}
              disabled={!hasOperator}
              className="flex h-[44px] items-center justify-center rounded-full border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] uc-type-n2-strong leading-[22px] text-[var(--uc-text)] transition-colors active:bg-[var(--uc-surface-muted)] disabled:opacity-40"
            >
              =
            </button>
          </div>
        ) : (
          <div className="mt-[12px] grid grid-cols-3 gap-[12px]">
            {KEYPAD_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => appendToken(String(preset))}
                className="h-[44px] rounded-full border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] text-[15px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)] transition-colors active:bg-[var(--uc-surface-muted)]"
              >
                {formatHuKidsAmount(preset)}
              </button>
            ))}
          </div>
        )}

        {/* Numeric keypad — clean 3-column digit grid (no operators inline).
            The backspace only renders once the user has typed something; the
            slot stays empty by default so there's nothing to delete. */}
        <div className="mt-[12px] grid grid-cols-3 gap-[8px]">
          {(
            [
              ['1', '1'],
              ['2', '2'],
              ['3', '3'],
              ['4', '4'],
              ['5', '5'],
              ['6', '6'],
              ['7', '7'],
              ['8', '8'],
              ['9', '9'],
              ['.', '.'],
              ['0', '0'],
            ] as const
          ).map(([display, token]) => (
            <button key={display} type="button" onClick={() => appendToken(token)} className={keyButton}>
              {display}
            </button>
          ))}
          {hasAmount ? (
            <button
              type="button"
              aria-label="Delete"
              onClick={backspace}
              className="flex h-[56px] items-center justify-center rounded-[12px] text-[var(--uc-text)] transition-colors active:bg-[var(--uc-surface-muted)]"
            >
              <AppIcon name="keypad-backspace" size={28} color="var(--uc-text)" />
            </button>
          ) : (
            <div aria-hidden="true" className="h-[56px]" />
          )}
        </div>
      </main>

      {isAccountSheetOpen ? (
        <BottomSheet
          title="From account"
          onClose={() => setIsAccountSheetOpen(false)}
          closeLabel="Close account picker"
        >
          <div className="flex flex-col gap-[4px]">
            {HU_KIDS_ACCOUNTS.map((account) => {
              const isSelected = account.id === selectedAccount.id
              return (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => {
                    setSelectedAccount(account)
                    setIsAccountSheetOpen(false)
                  }}
                  className="flex items-center justify-between rounded-[10px] px-[12px] py-[14px] text-left hover:bg-[var(--uc-surface-muted)]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">
                      {account.name}
                    </p>
                    <p className="mt-[2px] text-[13px] font-normal leading-[16px] text-[var(--uc-text-muted)]">
                      {formatHuKidsAmount(account.balance)}
                    </p>
                  </div>
                  <AppIcon
                    name={isSelected ? 'radio-selected' : 'radio-unselected'}
                    size={24}
                    color="var(--uc-action)"
                  />
                </button>
              )
            })}
          </div>
        </BottomSheet>
      ) : null}

      {isScheduleSheetOpen ? (
        <ScheduleSheet
          initialSchedule={schedule}
          onClose={() => setIsScheduleSheetOpen(false)}
          onConfirm={(config) => setSchedule(config)}
          onReset={() => setSchedule(null)}
        />
      ) : null}
    </div>
  )
}
import { createHuAddMoneyState, huAddMoneyReducer, selectHuAddMoney } from '@/features/kids/hu/goals/addMoney'
