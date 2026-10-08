import { useReducer } from 'react'
import PrimaryButton from '@/app/components/PrimaryButton'
import type { HuThemePreset } from '@/app/screens/kids/hu/theme'
import { HuKidsGoalPageHeader } from '@/app/screens/kids/hu/goals/overview'
import { createHuGoalDraft, huGoalDraftReducer, selectHuGoalDraft } from '@/features/kids/hu/goals/createGoal'

export function HuKidsCreateGoalPage({
  onBack,
  onCreateGoal,
  theme,
}: {
  onBack: () => void
  onCreateGoal: (title: string, targetAmount: number) => void
  theme: HuThemePreset
}) {
  const [draft, dispatchDraft] = useReducer(huGoalDraftReducer, undefined, createHuGoalDraft)
  const { title, target } = draft
  const { amount, canCreate } = selectHuGoalDraft(draft)
  const setTitle = (value: string) => dispatchDraft({ type: 'title', value })
  const setTarget = (value: string) => dispatchDraft({ type: 'target', value })
  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
      <HuKidsGoalPageHeader onBack={onBack} theme={theme} title="Create goal" />
      <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[24px] pb-[36px] pt-[18px]">
        <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[18px] shadow-sm">
          <label
            htmlFor="hu-create-goal-name"
            className="block text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-text-muted)]"
          >
            Goal name
          </label>
          <input
            id="hu-create-goal-name"
            className="mt-[8px] h-[48px] w-full rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] uc-type-n4-strong leading-[20px] tracking-[0] text-[var(--uc-text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What are you saving for?"
            value={title}
          />

          <label
            htmlFor="hu-create-goal-target"
            className="mt-[18px] block text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-text-muted)]"
          >
            Target
          </label>
          <div className="mt-[8px] flex h-[58px] items-center rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] focus-within:ring-2 focus-within:ring-[var(--uc-action)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--uc-app-bg)]">
            <input
              id="hu-create-goal-target"
              className="min-w-0 flex-1 bg-transparent uc-type-h1 leading-[32px] tracking-[0] text-[var(--uc-text)] outline-none"
              inputMode="numeric"
              onChange={(event) => setTarget(event.target.value.replace(/[^\d]/g, ''))}
              value={target}
            />
            <span className="uc-type-n4-strong leading-[20px] tracking-[0] text-[var(--uc-text-muted)]">HUF</span>
          </div>

          <PrimaryButton
            className="mt-[18px] !w-full"
            disabled={!canCreate}
            onClick={() => onCreateGoal(title, amount)}
          >
            Create goal
          </PrimaryButton>
        </section>
      </main>
    </div>
  )
}
