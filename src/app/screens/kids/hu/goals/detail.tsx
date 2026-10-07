import { useReducer } from 'react'
import { BottomSheet } from '@/app/components/BottomSheet'
import PrimaryButton from '@/app/components/PrimaryButton'
import { AppIcon } from '@/app/components/icons'
import { formatScheduleDate, formatScheduleSummary, SCHEDULE_REPEAT_OPTIONS } from '@/app/utils/scheduleFormatting'
import { goalProgress, type SavingGoal } from '@/data/huKidsBanking'
import { HU_MASKED_INTEGER, formatHuKidsAmount, getHuKidsDecimalParts } from '@/app/screens/kids/hu/money'
import type { HuThemePreset } from '@/app/screens/kids/hu/theme'
import type { HuGoalContribution } from '@/app/screens/kids/hu/types'
import { useEffect } from 'react'
import { HuKidsGoalPageHeader } from '@/app/screens/kids/hu/goals/overview'

export function HuKidsGoalDetailPage({
  contributions,
  goal,
  onBack,
  onDeleteContribution,
  onModifyGoal,
  onOpenAddMoney,
  onRenameGoal,
  onTerminateGoal,
  showAmounts,
  theme,
}: {
  contributions: HuGoalContribution[]
  goal: SavingGoal | null
  onBack: () => void
  onDeleteContribution?: (id: string) => void
  onModifyGoal?: (targetAmount: number) => void
  onOpenAddMoney?: () => void
  onRenameGoal?: (title: string) => void
  onTerminateGoal: () => void
  showAmounts: boolean
  theme: HuThemePreset
}) {
  const [detailState, dispatchDetail] = useReducer(huGoalDetailReducer, goal, createHuGoalDetailState)
  useEffect(() => {
    dispatchDetail({ type: 'goal', goal })
  }, [goal])
  const { renameTitle, modifyTarget } = detailState
  const detailContribution =
    contributions.find((entry) => entry.id === detailState.contributionId && entry.goalId === goal?.id) ?? null
  const isSettingsSheetOpen = detailState.sheet === 'settings'
  const isRenameSheetOpen = detailState.sheet === 'rename'
  const isModifySheetOpen = detailState.sheet === 'modify'
  const setDetailContribution = (entry: HuGoalContribution | null) =>
    dispatchDetail({ type: 'contribution', contributionId: entry?.id ?? null })
  const setIsSettingsSheetOpen = (open: boolean) => dispatchDetail({ type: 'sheet', sheet: open ? 'settings' : null })
  const setIsRenameSheetOpen = (open: boolean) => dispatchDetail({ type: 'sheet', sheet: open ? 'rename' : null })
  const setIsModifySheetOpen = (open: boolean) => dispatchDetail({ type: 'sheet', sheet: open ? 'modify' : null })
  const setRenameTitle = (value: string) => dispatchDetail({ type: 'rename-title', value })
  const setModifyTarget = (value: string) => dispatchDetail({ type: 'modify-target', value })
  if (!goal) {
    return (
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
        <HuKidsGoalPageHeader onBack={onBack} theme={theme} title="Saving goal" />
        <main className="px-[24px] pt-[18px]">
          <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[18px] shadow-sm">
            <h1 className="uc-type-h2 leading-[22px] tracking-[0] text-[var(--uc-text)]">No goal selected</h1>
            <p className="mt-[6px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
              Create a goal to start saving.
            </p>
          </section>
        </main>
      </div>
    )
  }

  const progress = goalProgress(goal)

  // Split contributions into scheduled transfers (with a schedule config) and
  // regular contributors so each gets its own dedicated section.
  const { scheduledTransfers, regularContributions } = selectHuGoalContributions(contributions)

  const renderContributionRow = (contribution: HuGoalContribution, isScheduled: boolean) => {
    const amountParts = getHuKidsDecimalParts(contribution.amount)
    const RowTag = isScheduled ? 'button' : 'div'
    return (
      <RowTag
        key={contribution.id}
        {...(isScheduled ? { type: 'button' as const, onClick: () => setDetailContribution(contribution) } : {})}
        className="flex items-start gap-[12px] py-[12px] text-left first:pt-0 last:pb-0"
      >
        <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-[var(--uc-green-olive)] text-[var(--uc-static-white)]">
          <AppIcon
            name={isScheduled ? 'calendar-days' : contribution.tone === 'parent' ? 'users' : 'hu-kids-saving'}
            size={18}
          />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-[8px]">
            <p className="truncate uc-type-n4-strong leading-[20px] tracking-[0] text-[var(--uc-text)]">
              {contribution.title}
            </p>
            <p className="shrink-0 text-right tracking-[0] text-[var(--uc-green-olive)]">
              {showAmounts ? (
                <>
                  <span className="uc-type-h2 leading-[20px]">+{amountParts.integer}</span>
                  <span className="uc-type-n5 leading-[20px]">{amountParts.decimal} HUF</span>
                </>
              ) : (
                <span className="uc-type-h2 leading-[20px]">+{HU_MASKED_INTEGER}</span>
              )}
            </p>
          </div>
          <p className="mt-[4px] uc-type-n5 leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
            {contribution.schedule ? formatScheduleSummary(contribution.schedule) : contribution.subtitle}
          </p>
        </div>
      </RowTag>
    )
  }

  // Quick action rail under "Saved so far", styled after the HU Kids Card
  // Details action rail. Only Add Money is wired; Withdrawal and Settings are
  // placeholders until their flows are specified.
  const goalActions = [
    { id: 'add-money', iconName: 'add-money' as const, label: 'Add\nMoney', onClick: onOpenAddMoney },
    { id: 'withdrawal', iconName: 'account-options' as const, label: 'Withdrawal', onClick: undefined },
    {
      id: 'settings',
      iconName: 'account-options' as const,
      label: 'Settings',
      onClick: () => setIsSettingsSheetOpen(true),
    },
  ]

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
      <HuKidsGoalPageHeader onBack={onBack} theme={theme} title={goal.title} />
      <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[16px] pb-[36px] pt-[18px]">
        <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[16px] text-center shadow-sm">
          <span
            className="mx-auto grid size-[64px] place-items-center rounded-[18px] text-[32px]"
            style={{ background: 'color-mix(in srgb, var(--uc-green-success) 16%, var(--uc-surface))' }}
          >
            {goal.icon === 'Bike' ? '🛹' : goal.icon === 'Music' ? '🎧' : goal.icon === 'Trip' ? '📱' : '🎯'}
          </span>
          <p className="mt-[12px] uc-type-h1 leading-[32px] text-[var(--uc-text)]">
            {showAmounts ? new Intl.NumberFormat('de-DE').format(goal.savedAmount) : HU_MASKED_INTEGER} HUF
          </p>
          <p className="mt-[2px] text-[14px] text-[var(--uc-text-muted)]">
            din {new Intl.NumberFormat('de-DE').format(goal.targetAmount)} HUF
          </p>
          <div className="mt-[14px]">
            <div className="h-[8px] w-full overflow-hidden rounded-full bg-[var(--hu-theme-progress-bg)]">
              <div
                className="h-full rounded-full bg-[var(--hu-theme-accent-strong)] transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-[8px] text-[13px] font-bold text-[var(--hu-theme-accent-strong)]">
              {progress}% · mai ai{' '}
              {new Intl.NumberFormat('de-DE').format(Math.max(0, goal.targetAmount - goal.savedAmount))} HUF
            </p>
          </div>
        </section>

        <section className="mt-[14px]" data-hu-goal-actions="true">
          <div className="grid grid-cols-3 gap-[18px]">
            {goalActions.map((action) => (
              <button
                key={action.id}
                aria-label={action.label.replace(/\s+/g, ' ').trim()}
                className="flex min-w-0 flex-col items-center gap-[10px]"
                onClick={action.onClick}
                type="button"
              >
                <span className="grid size-[64px] place-items-center rounded-full bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-sm">
                  <AppIcon name={action.iconName} size={24} />
                </span>
                <span className="min-h-[32px] max-w-[76px] text-center uc-type-n5-strong leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">
                  {action.label.split('\n').map((word) => (
                    <span key={word} className="block h-[16px]">
                      {word}
                    </span>
                  ))}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Scheduled transfers — dedicated section, only shown when there are
            scheduled transfers for this goal. Mirrors the Contributors card. */}
        {scheduledTransfers.length > 0 ? (
          <section className="mt-[16px] rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[18px] shadow-sm">
            <h2 className="uc-type-n4-strong leading-[20px] tracking-[0] text-[var(--uc-text)]">Scheduled transfers</h2>
            <div className="mt-[14px] flex flex-col divide-y divide-[var(--uc-border-muted)]">
              {scheduledTransfers.map((contribution) => renderContributionRow(contribution, true))}
            </div>
          </section>
        ) : null}

        <section className="mt-[16px] rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[18px] shadow-sm">
          <h2 className="uc-type-n4-strong leading-[20px] tracking-[0] text-[var(--uc-text)]">Contributors</h2>
          <div className="mt-[14px] flex flex-col divide-y divide-[var(--uc-border-muted)]">
            {regularContributions.length > 0 ? (
              regularContributions.map((contribution) => renderContributionRow(contribution, false))
            ) : (
              <p className="py-[4px] uc-type-n5 leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
                Added money and parent contributions will appear here.
              </p>
            )}
          </div>
        </section>
      </main>

      {detailContribution ? (
        <div className="absolute inset-0 z-[80] flex flex-col bg-[var(--uc-app-bg)]">
          <HuKidsGoalPageHeader onBack={() => setDetailContribution(null)} theme={theme} title="Scheduled transfer" />
          <main className="scrollbar-hide flex-1 overflow-y-auto px-[24px] pt-[24px]">
            <p className="text-[32px] font-bold leading-[36px] text-[var(--uc-text)]">
              {showAmounts ? `+${formatHuKidsAmount(detailContribution.amount)}` : `+${HU_MASKED_INTEGER} HUF`}
            </p>
            <p className="mt-[4px] text-[14px] text-[var(--uc-text-muted)]">{detailContribution.title}</p>
            {detailContribution.schedule ? (
              <dl className="mt-[24px] flex flex-col gap-[16px]">
                <div className="flex items-center justify-between">
                  <dt className="text-[14px] text-[var(--uc-text-muted)]">Start date</dt>
                  <dd className="uc-type-n5-strong text-[var(--uc-text)]">
                    {formatScheduleDate(detailContribution.schedule.startDate)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[14px] text-[var(--uc-text-muted)]">Repeat</dt>
                  <dd className="uc-type-n5-strong text-[var(--uc-text)]">
                    {SCHEDULE_REPEAT_OPTIONS.find((opt) => opt.id === detailContribution.schedule?.repeat)?.label}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[14px] text-[var(--uc-text-muted)]">Ends on</dt>
                  <dd className="uc-type-n5-strong text-[var(--uc-text)]">
                    {detailContribution.schedule.endsOn.type === 'on-date'
                      ? formatScheduleDate(detailContribution.schedule.endsOn.date)
                      : 'Never'}
                  </dd>
                </div>
              </dl>
            ) : null}
          </main>
          <div className="px-[24px] pb-[24px]">
            {onDeleteContribution ? (
              <button
                type="button"
                onClick={() => {
                  onDeleteContribution(detailContribution.id)
                  setDetailContribution(null)
                }}
                className="h-[48px] w-full rounded-[12px] bg-[var(--uc-surface-muted)] uc-type-n5-strong text-[var(--uc-status-red)]"
              >
                Delete schedule
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Settings bottom sheet: Rename / Modify Goal / Close Goal. */}
      {isSettingsSheetOpen ? (
        <BottomSheet title="Settings" onClose={() => setIsSettingsSheetOpen(false)} closeLabel="Close settings">
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => {
                setIsSettingsSheetOpen(false)
                setIsRenameSheetOpen(true)
                setRenameTitle(goal.title)
              }}
              className="flex w-full items-center justify-between border-b border-[var(--uc-border-muted)] py-[14px] text-left"
            >
              <span className="text-[15px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">Rename</span>
              <AppIcon name="chevron-link" size={16} color="var(--uc-text-muted)" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSettingsSheetOpen(false)
                setIsModifySheetOpen(true)
                setModifyTarget(String(goal.targetAmount))
              }}
              className="flex w-full items-center justify-between border-b border-[var(--uc-border-muted)] py-[14px] text-left"
            >
              <span className="text-[15px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">
                Modify goal
              </span>
              <AppIcon name="chevron-link" size={16} color="var(--uc-text-muted)" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSettingsSheetOpen(false)
                onTerminateGoal()
              }}
              className="flex w-full items-center py-[14px] text-left"
            >
              <span className="text-[15px] font-bold leading-[18px] tracking-[0] text-[var(--uc-status-red)]">
                Close goal
              </span>
            </button>
          </div>
        </BottomSheet>
      ) : null}

      {/* Rename bottom sheet. */}
      {isRenameSheetOpen ? (
        <BottomSheet title="Rename goal" onClose={() => setIsRenameSheetOpen(false)} closeLabel="Close rename">
          <div className="flex flex-col gap-[16px] pb-[8px]">
            <input
              type="text"
              value={renameTitle}
              onChange={(event) => setRenameTitle(event.target.value)}
              className="h-[48px] rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] uc-type-n4-strong leading-[20px] text-[var(--uc-text)] outline-none focus:border-[var(--uc-action)]"
              placeholder="Goal name"
            />
            <PrimaryButton
              className="!h-[48px] !w-full"
              disabled={!renameTitle.trim() || renameTitle.trim() === goal.title}
              onClick={() => {
                onRenameGoal?.(renameTitle.trim())
                setIsRenameSheetOpen(false)
              }}
            >
              Save
            </PrimaryButton>
          </div>
        </BottomSheet>
      ) : null}

      {/* Modify goal bottom sheet. */}
      {isModifySheetOpen ? (
        <BottomSheet title="Modify goal" onClose={() => setIsModifySheetOpen(false)} closeLabel="Close modify">
          <div className="flex flex-col gap-[16px] pb-[8px]">
            <div className="flex h-[48px] items-center rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px]">
              <input
                value={modifyTarget}
                onChange={(event) => setModifyTarget(event.target.value.replace(/[^\d]/g, ''))}
                inputMode="numeric"
                className="min-w-0 flex-1 bg-transparent uc-type-h2 leading-[22px] text-[var(--uc-text)] outline-none"
                placeholder="Target amount"
              />
              <span className="uc-type-n5-strong leading-[18px] text-[var(--uc-text-muted)]">HUF</span>
            </div>
            <PrimaryButton
              className="!h-[48px] !w-full"
              disabled={!modifyTarget || Number(modifyTarget) === goal.targetAmount}
              onClick={() => {
                onModifyGoal?.(Number(modifyTarget))
                setIsModifySheetOpen(false)
              }}
            >
              Save
            </PrimaryButton>
          </div>
        </BottomSheet>
      ) : null}
    </div>
  )
}
import {
  createHuGoalDetailState,
  huGoalDetailReducer,
  selectHuGoalContributions,
} from '@/features/kids/hu/goals/detail'
