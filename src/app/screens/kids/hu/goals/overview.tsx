import PageHeader from '@/app/components/PageHeader'
import PrimaryButton from '@/app/components/PrimaryButton'
import { AppIcon } from '@/app/components/icons'
import LinkButton from '@/app/components/ui/LinkButton'
import { goalProgress, type SavingGoal } from '@/data/huKidsBanking'
import { formatHuKidsGoalAmount } from '@/app/screens/kids/hu/money'
import type { HuThemePreset } from '@/app/screens/kids/hu/theme'

export function HuKidsGoalsSection({
  goals,
  onCreateGoal,
  onOpenGoals,
  onSelectGoal,
  showAmounts,
}: {
  goals: SavingGoal[]
  onCreateGoal: () => void
  onOpenGoals: () => void
  onSelectGoal: (goalId: string) => void
  showAmounts: boolean
}) {
  return (
    <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] py-[18px] shadow-sm">
      <div className="flex items-center justify-between gap-[12px] px-[18px]">
        <div>
          <h2 className="uc-type-h2 leading-[22px] tracking-[0] text-[var(--uc-text)]">Saving goals</h2>
          <p className="mt-[4px] text-[13px] font-normal leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">
            Goals from Kids RO, adapted for Alexandra.
          </p>
        </div>
        <button
          className="grid size-[36px] shrink-0 place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)]"
          onClick={onCreateGoal}
          type="button"
        >
          <AppIcon name="add-circle" size={20} />
        </button>
      </div>

      <div className="mt-[16px] flex flex-col gap-[10px]">
        {goals.slice(0, 3).map((goal) => (
          <HuKidsGoalCard key={goal.id} goal={goal} onClick={() => onSelectGoal(goal.id)} showAmounts={showAmounts} />
        ))}
      </div>

      <LinkButton
        className="mx-auto mt-[16px] h-[24px] px-[18px] text-[var(--hu-theme-accent-strong)]"
        iconSize={24}
        onClick={onOpenGoals}
      >
        SEE SAVING GOALS
      </LinkButton>
    </section>
  )
}

export function HuKidsGoalCard({
  goal,
  onClick,
  showAmounts,
}: {
  goal: SavingGoal
  onClick: () => void
  showAmounts: boolean
}) {
  const progress = goalProgress(goal)

  return (
    <button
      className="w-full rounded-[16px] bg-[var(--uc-surface)] p-[16px] text-left transition-transform active:scale-[0.99]"
      onClick={onClick}
      type="button"
    >
      <div className="flex items-start gap-[12px]">
        <span
          className="grid size-[42px] shrink-0 place-items-center rounded-[14px] text-[22px]"
          style={{ background: 'color-mix(in srgb, var(--uc-green-success) 16%, var(--uc-surface))' }}
        >
          {goal.icon === 'Bike' ? '🛹' : goal.icon === 'Music' ? '🎧' : goal.icon === 'Trip' ? '📱' : '🎯'}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-[8px]">
            <h3 className="min-w-0 flex-1 uc-type-n4-strong leading-[20px] tracking-[0] text-[var(--uc-text)]">
              {goal.title}
            </h3>
            <span className="shrink-0 rounded-full bg-[var(--hu-theme-control-bg)] px-[8px] py-[3px] text-[12px] font-bold leading-[14px] tracking-[0] text-[var(--hu-theme-accent-strong)]">
              {progress}%
            </span>
          </div>
          <p className="mt-[5px] uc-type-n5 leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
            {formatHuKidsGoalAmount(goal.savedAmount, showAmounts)} /{' '}
            {formatHuKidsGoalAmount(goal.targetAmount, showAmounts)}
          </p>
          <div className="mt-[10px] h-[10px] overflow-hidden rounded-full bg-[var(--hu-theme-progress-bg)]">
            <div className="h-full rounded-full bg-[var(--hu-theme-accent-strong)]" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </button>
  )
}

export function HuKidsGoalPageHeader({
  onBack,
  theme,
  title,
  subtitle,
}: {
  onBack: () => void
  theme: HuThemePreset
  title: string
  subtitle?: string
}) {
  const headerVariant = theme.id === 'nordlys' || theme.id === 'blue-lines' ? 'dark' : 'transparent'

  return (
    <div className="sticky top-0 z-10 bg-transparent">
      <PageHeader
        collapsedTitleProgress={1}
        compact
        includeSafeArea
        onBack={onBack}
        showHelp={false}
        title={title}
        variant={headerVariant}
      />
      {subtitle ? (
        <p className="px-[24px] pb-[6px] text-center text-[13px] font-normal leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}

export function HuKidsGoalsPage({
  goals,
  onBack,
  onCreateGoal,
  onSelectGoal,
  showAmounts,
  theme,
}: {
  goals: SavingGoal[]
  onBack: () => void
  onCreateGoal: () => void
  onSelectGoal: (goalId: string) => void
  showAmounts: boolean
  theme: HuThemePreset
}) {
  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
      <HuKidsGoalPageHeader onBack={onBack} theme={theme} title="Saving goals" />
      <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[16px] pb-[36px] pt-[18px]">
        <div className="rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[18px] shadow-sm">
          <div className="flex items-start gap-[12px]">
            <span className="grid size-[46px] shrink-0 place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)]">
              <AppIcon name="hu-kids-saving" size={25} />
            </span>
            <div className="min-w-0">
              <h1 className="uc-type-h2 leading-[22px] tracking-[0] text-[var(--uc-text)]">Save for what matters</h1>
              <p className="mt-[6px] uc-type-n5 leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
                The HU Kids goals model is available in the Saving area.
              </p>
            </div>
          </div>
          <PrimaryButton className="mt-[18px] !w-full" onClick={onCreateGoal}>
            Create saving goal
          </PrimaryButton>
        </div>

        <div className="mt-[14px] flex flex-col gap-[10px]">
          {goals.map((goal) => (
            <HuKidsGoalCard key={goal.id} goal={goal} onClick={() => onSelectGoal(goal.id)} showAmounts={showAmounts} />
          ))}
        </div>
      </main>
    </div>
  )
}
