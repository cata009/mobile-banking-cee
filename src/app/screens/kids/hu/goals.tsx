/**
 * HU Kids saving-goal surfaces: the Home/Saving goals section, goal list, goal
 * detail with contributions, and the create-goal form.
 *
 * Extracted verbatim from KidsMarketHomeApp.tsx (kids-split Phase 3).
 */
import { useReducer, useState } from "react";
import { BottomSheet } from "@/app/components/BottomSheet";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import { AppIcon } from "@/app/components/icons";
import { Calendar } from "@/app/components/ui/calendar";
import LinkButton from "@/app/components/ui/LinkButton";
import { HU_KIDS_ACCOUNTS, type HuKidsAccount, goalProgress, type SavingGoal } from "@/data/huKidsBanking";
import {
  HU_MASKED_INTEGER,
  formatHuKidsAmount,
  formatHuKidsGoalAmount,
  getHuKidsDecimalParts,
} from "./money";
import type { HuThemePreset } from "./theme";
import type { HuGoalContribution, ScheduleConfig, ScheduleEnd, ScheduleRepeat } from "./types";
import { createHuScheduleState, huScheduleReducer } from "./huScheduleState";

export function HuKidsGoalsSection({
  goals,
  onCreateGoal,
  onOpenGoals,
  onSelectGoal,
  showAmounts,
}: {
  goals: SavingGoal[];
  onCreateGoal: () => void;
  onOpenGoals: () => void;
  onSelectGoal: (goalId: string) => void;
  showAmounts: boolean;
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
          <HuKidsGoalCard
            key={goal.id}
            goal={goal}
            onClick={() => onSelectGoal(goal.id)}
            showAmounts={showAmounts}
          />
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
  );
}

function HuKidsGoalCard({
  goal,
  onClick,
  showAmounts,
}: {
  goal: SavingGoal;
  onClick: () => void;
  showAmounts: boolean;
}) {
  const progress = goalProgress(goal);

  return (
    <button
      className="w-full rounded-[16px] bg-[var(--uc-surface)] p-[16px] text-left transition-transform active:scale-[0.99]"
      onClick={onClick}
      type="button"
    >
      <div className="flex items-start gap-[12px]">
        <span
          className="grid size-[42px] shrink-0 place-items-center rounded-[14px] text-[22px]"
          style={{ background: "color-mix(in srgb, var(--uc-green-success) 16%, var(--uc-surface))" }}
        >
          {goal.icon === "Bike" ? "🛹" : goal.icon === "Music" ? "🎧" : goal.icon === "Trip" ? "📱" : "🎯"}
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
            {formatHuKidsGoalAmount(goal.savedAmount, showAmounts)} / {formatHuKidsGoalAmount(goal.targetAmount, showAmounts)}
          </p>
          <div className="mt-[10px] h-[10px] overflow-hidden rounded-full bg-[var(--hu-theme-progress-bg)]">
            <div className="h-full rounded-full bg-[var(--hu-theme-accent-strong)]" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </button>
  );
}

export function HuKidsGoalPageHeader({
  onBack,
  theme,
  title,
  subtitle,
}: {
  onBack: () => void;
  theme: HuThemePreset;
  title: string;
  subtitle?: string;
}) {
  const headerVariant = theme.id === "nordlys" || theme.id === "blue-lines" ? "dark" : "transparent";

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
  );
}

export function HuKidsGoalsPage({
  goals,
  onBack,
  onCreateGoal,
  onSelectGoal,
  showAmounts,
  theme,
}: {
  goals: SavingGoal[];
  onBack: () => void;
  onCreateGoal: () => void;
  onSelectGoal: (goalId: string) => void;
  showAmounts: boolean;
  theme: HuThemePreset;
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
            <HuKidsGoalCard
              key={goal.id}
              goal={goal}
              onClick={() => onSelectGoal(goal.id)}
              showAmounts={showAmounts}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

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
  contributions: HuGoalContribution[];
  goal: SavingGoal | null;
  onBack: () => void;
  onDeleteContribution?: (id: string) => void;
  onModifyGoal?: (targetAmount: number) => void;
  onOpenAddMoney?: () => void;
  onRenameGoal?: (title: string) => void;
  onTerminateGoal: () => void;
  showAmounts: boolean;
  theme: HuThemePreset;
}) {
  const [detailContribution, setDetailContribution] = useState<HuGoalContribution | null>(null);
  const [isSettingsSheetOpen, setIsSettingsSheetOpen] = useState(false);
  const [isRenameSheetOpen, setIsRenameSheetOpen] = useState(false);
  const [isModifySheetOpen, setIsModifySheetOpen] = useState(false);
  const [renameTitle, setRenameTitle] = useState(goal?.title ?? "");
  const [modifyTarget, setModifyTarget] = useState(String(goal?.targetAmount ?? ""));
  if (!goal) {
    return (
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
        <HuKidsGoalPageHeader onBack={onBack} theme={theme} title="Saving goal" />
        <main className="px-[24px] pt-[18px]">
          <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[18px] shadow-sm">
            <h1 className="uc-type-h2 leading-[22px] tracking-[0] text-[var(--uc-text)]">No goal selected</h1>
            <p className="mt-[6px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">Create a goal to start saving.</p>
          </section>
        </main>
      </div>
    );
  }

  const progress = goalProgress(goal);

  // Split contributions into scheduled transfers (with a schedule config) and
  // regular contributors so each gets its own dedicated section.
  const scheduledTransfers = contributions.filter((c) => Boolean(c.schedule));
  const regularContributions = contributions.filter((c) => !c.schedule);

  const renderContributionRow = (contribution: HuGoalContribution, isScheduled: boolean) => {
    const amountParts = getHuKidsDecimalParts(contribution.amount);
    const RowTag = isScheduled ? "button" : "div";
    return (
      <RowTag
        key={contribution.id}
        {...(isScheduled ? { type: "button" as const, onClick: () => setDetailContribution(contribution) } : {})}
        className="flex items-start gap-[12px] py-[12px] text-left first:pt-0 last:pb-0"
      >
        <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-[var(--uc-green-olive)] text-[var(--uc-static-white)]">
          <AppIcon
            name={isScheduled ? "calendar-days" : contribution.tone === "parent" ? "users" : "hu-kids-saving"}
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
    );
  };

  // Quick action rail under "Saved so far", styled after the HU Kids Card
  // Details action rail. Only Add Money is wired; Withdrawal and Settings are
  // placeholders until their flows are specified.
  const goalActions = [
    { id: "add-money", iconName: "add-money" as const, label: "Add\nMoney", onClick: onOpenAddMoney },
    { id: "withdrawal", iconName: "account-options" as const, label: "Withdrawal", onClick: undefined },
    { id: "settings", iconName: "account-options" as const, label: "Settings", onClick: () => setIsSettingsSheetOpen(true) },
  ];

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
      <HuKidsGoalPageHeader onBack={onBack} theme={theme} title={goal.title} />
      <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[16px] pb-[36px] pt-[18px]">
        <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[16px] text-center shadow-sm">
          <span
            className="mx-auto grid size-[64px] place-items-center rounded-[18px] text-[32px]"
            style={{ background: "color-mix(in srgb, var(--uc-green-success) 16%, var(--uc-surface))" }}
          >
            {goal.icon === "Bike" ? "🛹" : goal.icon === "Music" ? "🎧" : goal.icon === "Trip" ? "📱" : "🎯"}
          </span>
          <p className="mt-[12px] uc-type-h1 leading-[32px] text-[var(--uc-text)]">
            {showAmounts ? new Intl.NumberFormat("de-DE").format(goal.savedAmount) : HU_MASKED_INTEGER} HUF
          </p>
          <p className="mt-[2px] text-[14px] text-[var(--uc-text-muted)]">
            din {new Intl.NumberFormat("de-DE").format(goal.targetAmount)} HUF
          </p>
          <div className="mt-[14px]">
            <div className="h-[8px] w-full overflow-hidden rounded-full bg-[var(--hu-theme-progress-bg)]">
              <div
                className="h-full rounded-full bg-[var(--hu-theme-accent-strong)] transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-[8px] text-[13px] font-bold text-[var(--hu-theme-accent-strong)]">
              {progress}% · mai ai {new Intl.NumberFormat("de-DE").format(Math.max(0, goal.targetAmount - goal.savedAmount))} HUF
            </p>
          </div>
        </section>

        <section className="mt-[14px]" data-hu-goal-actions="true">
          <div className="grid grid-cols-3 gap-[18px]">
            {goalActions.map((action) => (
              <button
                key={action.id}
                aria-label={action.label.replace(/\s+/g, " ").trim()}
                className="flex min-w-0 flex-col items-center gap-[10px]"
                onClick={action.onClick}
                type="button"
              >
                <span className="grid size-[64px] place-items-center rounded-full bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-sm">
                  <AppIcon name={action.iconName} size={24} />
                </span>
                <span className="min-h-[32px] max-w-[76px] text-center uc-type-n5-strong leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">
                  {action.label.split("\n").map((word) => (
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
          <HuKidsGoalPageHeader
            onBack={() => setDetailContribution(null)}
            theme={theme}
            title="Scheduled transfer"
          />
          <main className="scrollbar-hide flex-1 overflow-y-auto px-[24px] pt-[24px]">
            <p className="text-[32px] font-bold leading-[36px] text-[var(--uc-text)]">
              {showAmounts
                ? `+${formatHuKidsAmount(detailContribution.amount)}`
                : `+${HU_MASKED_INTEGER} HUF`}
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
                    {REPEAT_OPTIONS.find((opt) => opt.id === detailContribution.schedule?.repeat)?.label}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[14px] text-[var(--uc-text-muted)]">Ends on</dt>
                  <dd className="uc-type-n5-strong text-[var(--uc-text)]">
                    {detailContribution.schedule.endsOn.type === "on-date"
                      ? formatScheduleDate(detailContribution.schedule.endsOn.date)
                      : "Never"}
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
                  onDeleteContribution(detailContribution.id);
                  setDetailContribution(null);
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
                setIsSettingsSheetOpen(false);
                setIsRenameSheetOpen(true);
                setRenameTitle(goal.title);
              }}
              className="flex w-full items-center justify-between border-b border-[var(--uc-border-muted)] py-[14px] text-left"
            >
              <span className="text-[15px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">Rename</span>
              <AppIcon name="chevron-link" size={16} color="var(--uc-text-muted)" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSettingsSheetOpen(false);
                setIsModifySheetOpen(true);
                setModifyTarget(String(goal.targetAmount));
              }}
              className="flex w-full items-center justify-between border-b border-[var(--uc-border-muted)] py-[14px] text-left"
            >
              <span className="text-[15px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">Modify goal</span>
              <AppIcon name="chevron-link" size={16} color="var(--uc-text-muted)" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSettingsSheetOpen(false);
                onTerminateGoal();
              }}
              className="flex w-full items-center py-[14px] text-left"
            >
              <span className="text-[15px] font-bold leading-[18px] tracking-[0] text-[var(--uc-status-red)]">Close goal</span>
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
                onRenameGoal?.(renameTitle.trim());
                setIsRenameSheetOpen(false);
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
                onChange={(event) => setModifyTarget(event.target.value.replace(/[^\d]/g, ""))}
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
                onModifyGoal?.(Number(modifyTarget));
                setIsModifySheetOpen(false);
              }}
            >
              Save
            </PrimaryButton>
          </div>
        </BottomSheet>
      ) : null}
    </div>
  );
}

export function HuKidsCreateGoalPage({
  onBack,
  onCreateGoal,
  theme,
}: {
  onBack: () => void;
  onCreateGoal: (title: string, targetAmount: number) => void;
  theme: HuThemePreset;
}) {
  const [title, setTitle] = useState("Skate lessons");
  const [target, setTarget] = useState("30000");
  const amount = Number(target.replace(/[^\d]/g, ""));
  const canCreate = title.trim().length > 0 && amount > 0;

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
      <HuKidsGoalPageHeader onBack={onBack} theme={theme} title="Create goal" />
      <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[24px] pb-[36px] pt-[18px]">
        <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[18px] shadow-sm">
          <label className="block text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-text-muted)]">
            Goal name
          </label>
          <input
            className="mt-[8px] h-[48px] w-full rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] uc-type-n4-strong leading-[20px] tracking-[0] text-[var(--uc-text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What are you saving for?"
            value={title}
          />

          <label className="mt-[18px] block text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-text-muted)]">
            Target
          </label>
          <div className="mt-[8px] flex h-[58px] items-center rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] focus-within:ring-2 focus-within:ring-[var(--uc-action)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--uc-app-bg)]">
            <input
              className="min-w-0 flex-1 bg-transparent uc-type-h1 leading-[32px] tracking-[0] text-[var(--uc-text)] outline-none"
              inputMode="numeric"
              onChange={(event) => setTarget(event.target.value.replace(/[^\d]/g, ""))}
              value={target}
            />
            <span className="uc-type-n4-strong leading-[20px] tracking-[0] text-[var(--uc-text-muted)]">HUF</span>
          </div>

          <PrimaryButton className="mt-[18px] !w-full" disabled={!canCreate} onClick={() => onCreateGoal(title, amount)}>
            Create goal
          </PrimaryButton>
        </section>
      </main>
    </div>
  );
}

/**
 * Evaluate a simple arithmetic expression built from digits, decimal points
 * and the four operators. Returns NaN if the expression is malformed or ends
 * with a dangling operator. Kept deliberately tiny — no parentheses, no
 * exponent — since the keypad only emits these tokens.
 */
function evaluateExpression(expression: string): number {
  const tokens = expression.match(/\d+(?:\.\d+)?|[+\-*/]/g);
  if (!tokens || tokens.length === 0) return NaN;
  if (TRAILING_OPERATOR_RE.test(expression.trim())) return NaN;

  // First pass: resolve multiplication and division left to right.
  const pass1: Array<number | string> = [];
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token === undefined) return NaN;
    if (token === "*" || token === "/") {
      const left = Number(pass1[pass1.length - 1]);
      const right = Number(tokens[i + 1]);
      if (Number.isNaN(left) || Number.isNaN(right)) return NaN;
      pass1[pass1.length - 1] = token === "*" ? left * right : right === 0 ? NaN : left / right;
      i += 1;
    } else {
      pass1.push(token);
    }
  }

  // Second pass: resolve addition and subtraction left to right.
  let result = Number(pass1[0]);
  if (Number.isNaN(result)) return NaN;
  for (let i = 1; i < pass1.length; i += 2) {
    const op = pass1[i];
    const right = Number(pass1[i + 1]);
    if (typeof op !== "string" || Number.isNaN(right)) return NaN;
    result = op === "+" ? result + right : result - right;
  }
  return result;
}

const KEYPAD_PRESETS = [1000, 2500, 5000];
// Operator-char regexes are module constants (not inline in TSX) because the
// parser mis-reads them inside JSX expression position.
const OPERATOR_RE = /[+\-*/]/;
const TRAILING_OPERATOR_RE = /[+\-*/]$/;
const DIGIT_RE = /^\d$/;

/** Format a Date to an ISO date-only string (YYYY-MM-DD). */
function toIsoDateOnly(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Format an ISO date string to a readable label (e.g. "Today", "24.07.2026"). */
function formatScheduleDate(isoDate: string): string {
  const today = toIsoDateOnly(new Date());
  if (isoDate === today) return "today";
  const date = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

const REPEAT_OPTIONS: ReadonlyArray<{ id: ScheduleRepeat; label: string }> = [
  { id: "never", label: "Never" },
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "biweekly", label: "Every 2 weeks" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
];

/** Human-readable summary of a schedule's selection (without the "Scheduled:" prefix). */
export function formatScheduleSummary(schedule: ScheduleConfig): string {
  const repeatLabel = REPEAT_OPTIONS.find((opt) => opt.id === schedule.repeat)?.label ?? schedule.repeat;
  let summary = `${repeatLabel}, starting ${formatScheduleDate(schedule.startDate)}`;
  if (schedule.endsOn.type === "on-date") {
    summary += `, until ${formatScheduleDate(schedule.endsOn.date)}`;
  }
  return summary;
}

/**
 * Bottom sheet for configuring a recurring schedule: start date, repeat
 * cadence, and optional end condition. Date pickers use the shared Calendar
 * component in single-date mode, shown as an overlay panel inside the sheet.
 */
function ScheduleSheet({
  initialSchedule,
  onClose,
  onConfirm,
  onReset,
}: {
  initialSchedule?: ScheduleConfig | null;
  onClose: () => void;
  onConfirm: (config: ScheduleConfig) => void;
  onReset?: () => void;
}) {
  const todayIso = toIsoDateOnly(new Date());
  const [scheduleState, dispatchSchedule] = useReducer(
    huScheduleReducer,
    createHuScheduleState(todayIso, initialSchedule),
  );
  const { startDate, repeat, endsOn, datePickerTarget, repeatPickerOpen, endsPickerOpen } = scheduleState;
  const setRepeat = (value: ScheduleRepeat) => dispatchSchedule({ type: "set-field", field: "repeat", value });
  const setEndsOn = (value: ScheduleEnd) => dispatchSchedule({ type: "set-field", field: "endsOn", value });
  const setDatePickerTarget = (value: null | "start" | "end") => dispatchSchedule({ type: "set-field", field: "datePickerTarget", value });
  const setRepeatPickerOpen = (value: boolean) => dispatchSchedule({ type: "set-field", field: "repeatPickerOpen", value });
  const setEndsPickerOpen = (value: boolean) => dispatchSchedule({ type: "set-field", field: "endsPickerOpen", value });

  const handleConfirm = () => {
    onConfirm({ startDate, repeat, endsOn });
    onClose();
  };

  const repeatLabel = REPEAT_OPTIONS.find((opt) => opt.id === repeat)?.label ?? "Never";

  return (
    <>
      <BottomSheet title="Schedule" onClose={onClose} closeLabel="Close schedule" fillHeight>
        <div className="flex h-full flex-col gap-[16px] pb-[24px]">
          {/* Start date */}
          <div>
            <p className="mb-[6px] text-[13px] font-bold leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">
              Start date
            </p>
            <button
              type="button"
              onClick={() => setDatePickerTarget("start")}
              className="flex h-[48px] w-full items-center justify-between rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px]"
            >
              <span className="text-[15px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">
                {formatScheduleDate(startDate)}
              </span>
              <AppIcon name="chevron-down" size={18} color="var(--uc-text-muted)" />
            </button>
          </div>

          {/* Repeat */}
          <div>
            <p className="mb-[6px] text-[13px] font-bold leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">
              Repeat
            </p>
            <button
              type="button"
              onClick={() => setRepeatPickerOpen(true)}
              className="flex h-[48px] w-full items-center justify-between rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px]"
            >
              <span className="text-[15px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">
                {repeatLabel}
              </span>
              <AppIcon name="chevron-down" size={18} color="var(--uc-text-muted)" />
            </button>
          </div>

        {/* Ends on — only relevant when repeating */}
        {repeat !== "never" ? (
          <div>
            <p className="mb-[6px] text-[13px] font-bold leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">
              Ends on
            </p>
            <button
              type="button"
              onClick={() => setEndsPickerOpen(true)}
              className="flex h-[48px] w-full items-center justify-between rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px]"
            >
              <span className="text-[15px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">
                {endsOn.type === "on-date" ? formatScheduleDate(endsOn.date) : "Never"}
              </span>
              <AppIcon name="chevron-down" size={18} color="var(--uc-text-muted)" />
            </button>
          </div>
        ) : null}

          {/* Reset (only when a schedule is already set) + Confirm, anchored
              to the bottom of the sheet via mt-auto. */}
          <div className="mt-auto flex flex-col gap-[8px] pt-[16px]">
            {initialSchedule && onReset ? (
              <button
                type="button"
                onClick={() => {
                  onReset();
                  onClose();
                }}
                className="h-[44px] w-full rounded-[12px] bg-transparent uc-type-n5-strong leading-[18px] text-[var(--uc-status-red)]"
              >
                Reset schedule
              </button>
            ) : null}
            <PrimaryButton className="!h-[48px] !w-full" onClick={handleConfirm}>
              Confirm
            </PrimaryButton>
          </div>
        </div>
      </BottomSheet>

      {/* Calendar as a mini bottom sheet layered over the schedule sheet.
          Rendered as a sibling (not a child) so its overlay anchors to the
          phone frame, not to the schedule sheet body. */}
      {datePickerTarget ? (
        <BottomSheet
          title={datePickerTarget === "start" ? "Select start date" : "Select end date"}
          onClose={() => setDatePickerTarget(null)}
          closeLabel="Close calendar"
        >
          <div className="w-full pb-[8px]">
            <Calendar
              className="w-full"
              mode="single"
              disabled={{ before: new Date() }}
              selected={new Date(`${datePickerTarget === "start" ? startDate : endsOn.type === "on-date" ? endsOn.date : todayIso}T00:00:00`)}
              onSelect={(date) => {
                if (!date) return;
                const iso = toIsoDateOnly(date);
                dispatchSchedule({ type: "select-date", date: iso });
              }}
            />
          </div>
        </BottomSheet>
      ) : null}

      {/* Repeat picker as a mini bottom sheet layered over the schedule sheet. */}
      {repeatPickerOpen ? (
        <BottomSheet title="Repeat" onClose={() => setRepeatPickerOpen(false)} closeLabel="Close repeat picker">
          <div className="flex flex-col">
            {REPEAT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setRepeat(opt.id);
                  setRepeatPickerOpen(false);
                }}
                className="flex w-full items-center justify-between border-b border-[var(--uc-border-muted)] py-[14px] text-left last:border-b-0"
              >
                <span className="text-[15px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">
                  {opt.label}
                </span>
                {repeat === opt.id ? (
                  <AppIcon name="radio-selected" size={20} color="var(--uc-action)" />
                ) : null}
              </button>
            ))}
          </div>
        </BottomSheet>
      ) : null}

      {/* Ends-on picker as a mini bottom sheet. "On a date" opens the calendar. */}
      {endsPickerOpen ? (
        <BottomSheet title="Ends on" onClose={() => setEndsPickerOpen(false)} closeLabel="Close ends-on picker">
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => {
                setEndsOn({ type: "never" });
                setEndsPickerOpen(false);
              }}
              className="flex w-full items-center justify-between border-b border-[var(--uc-border-muted)] py-[14px] text-left"
            >
              <span className="text-[15px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">Never</span>
              {endsOn.type === "never" ? (
                <AppIcon name="radio-selected" size={20} color="var(--uc-action)" />
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => {
                dispatchSchedule({ type: "open-end-date", fallbackDate: todayIso });
              }}
              className="flex w-full items-center justify-between py-[14px] text-left"
            >
              <span className="text-[15px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">
                {endsOn.type === "on-date" ? formatScheduleDate(endsOn.date) : "On a date"}
              </span>
              {endsOn.type === "on-date" ? (
                <AppIcon name="radio-selected" size={20} color="var(--uc-action)" />
              ) : null}
            </button>
          </div>
        </BottomSheet>
      ) : null}
    </>
  );
}

/**
 * Revolut-style full-screen Add-money surface for a savings goal. Top: goal
 * context + amount display. Middle: source-account picker (opens a bottom
 * sheet). Bottom: a custom numeric keypad with arithmetic operators, preset
 * amounts, evaluate (=), and a submit button that appears once the
 * evaluated amount is greater than zero.
 */
export function HuKidsAddMoneyPage({
  goal,
  onBack,
  onSubmit,
  onScheduleAdd,
  theme,
  showAmounts,
}: {
  goal: SavingGoal | null;
  onBack: () => void;
  onSubmit: (amount: number) => void;
  onScheduleAdd?: (amount: number, schedule: ScheduleConfig) => void;
  theme: HuThemePreset;
  showAmounts: boolean;
}) {
  const [expression, setExpression] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<HuKidsAccount>(HU_KIDS_ACCOUNTS[0]);
  const [isAccountSheetOpen, setIsAccountSheetOpen] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleConfig | null>(null);
  const [isScheduleSheetOpen, setIsScheduleSheetOpen] = useState(false);

  const appendToken = (token: string) => {
    setExpression((current) => {
      const last = current.slice(-1);
      // Collapse consecutive operators so "5++" cannot form.
      if (OPERATOR_RE.test(token) && OPERATOR_RE.test(last)) {
        return current.slice(0, -1) + token;
      }
      // Avoid leading with an operator (negative amounts not supported here).
      if (OPERATOR_RE.test(token) && current.length === 0) return current;
      // Cap the number of digit characters at 10 (≈ billions) so the amount
      // stays within a sane range and the display never overflows.
      const digitCount = (current.match(/\d/g) ?? []).length;
      if (DIGIT_RE.test(token) && digitCount >= 10) return current;
      return current + token;
    });
  };

  const backspace = () => setExpression((current) => current.slice(0, -1));

  const hasOperator = OPERATOR_RE.test(expression);
  const rawEvaluated = evaluateExpression(expression);
  // Clamp negative results to 0 — "Add money" never accepts a negative amount.
  const evaluated = Number.isFinite(rawEvaluated) ? Math.max(0, Math.floor(rawEvaluated)) : rawEvaluated;
  const amount = hasOperator ? evaluated : Math.max(0, Math.floor(Number(expression) || 0));
  // Insufficient funds: entered amount exceeds the selected account balance.
  const exceedsBalance = amount > selectedAccount.balance;
  const canSubmit = amount > 0 && !exceedsBalance;
  // Whether the user has typed any digit yet — drives the presets↔operators
  // strip swap above the keypad.
  const hasAmount = expression.length > 0;
  // Whether the expression is complete enough to show a live result
  // (operator present, not trailing, evaluates to a finite number).
  const isComplete =
    hasOperator && !TRAILING_OPERATOR_RE.test(expression) && Number.isFinite(evaluated);

  // Pretty-print the raw expression tokens: * → ×, / → ÷, - → −.
  const expressionDisplay = expression.replace(/\*/g, "×").replace(/\//g, "÷").replace(/-/g, "−");

  // The amount display always stays on one line. Start at 48px and shrink
  // step-by-step as the displayed text grows, so long numbers never overflow.
  const displayText = hasOperator && isComplete ? `${expressionDisplay}=${evaluated}` : (hasAmount ? expressionDisplay : "0");
  const amountFontSize =
    displayText.length <= 6 ? 48
    : displayText.length <= 8 ? 40
    : displayText.length <= 10 ? 34
    : displayText.length <= 12 ? 28
    : 24;

  const keyButton =
    "flex h-[56px] items-center justify-center rounded-[12px] text-[28px] font-semibold leading-[30px] text-[var(--uc-text)] transition-colors active:bg-[var(--uc-surface-muted)]";

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
              <span className="text-[var(--uc-text-muted)]">{expressionDisplay}=</span>{" "}
              <span className="text-[var(--uc-text)]">{evaluated}</span>
            </p>
          ) : (
            <p
              className={`font-bold tracking-[0] whitespace-nowrap ${
                hasAmount ? "text-[var(--uc-text)]" : "text-[var(--uc-text-muted)]"
              }`}
              style={{ fontSize: `${amountFontSize}px`, lineHeight: `${amountFontSize + 4}px` }}
            >
              {hasAmount ? expressionDisplay : "0"}
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
                ? "flex items-center gap-[6px] rounded-full border border-[color-mix(in_srgb,var(--uc-status-red)_40%,transparent)] bg-[color-mix(in_srgb,var(--uc-status-red)_10%,var(--uc-surface))] px-[14px] py-[8px] text-left"
                : "flex items-center gap-[6px] rounded-full border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] py-[8px] text-left"
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
                ? "grid size-[48px] shrink-0 place-items-center rounded-[12px] border border-transparent bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]"
                : "grid size-[48px] shrink-0 place-items-center rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] text-[var(--uc-text)]"
            }
          >
            <AppIcon name="calendar-days" size={22} color="currentColor" />
          </button>
          <PrimaryButton
            className="!h-[48px] !flex-1"
            disabled={!canSubmit}
            onClick={() => {
              if (schedule && onScheduleAdd) {
                onScheduleAdd(amount, schedule);
              } else {
                onSubmit(amount);
              }
            }}
          >
            {schedule ? "Schedule" : "Add money"}
          </PrimaryButton>
        </div>

        {/* Operators strip — shows above the keypad once the user has typed a
            digit. Five equal buttons: + − × ÷ =. The "=" evaluates the current
            expression; it's disabled until an operator is present. */}
        {hasAmount ? (
          <div className="mt-[12px] grid grid-cols-5 gap-[12px]">
            {(
              [
                ["+", "+"], ["−", "-"], ["×", "*"], ["÷", "/"],
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
                if (Number.isFinite(evaluated)) setExpression(String(Math.floor(evaluated)));
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
              ["1", "1"], ["2", "2"], ["3", "3"],
              ["4", "4"], ["5", "5"], ["6", "6"],
              ["7", "7"], ["8", "8"], ["9", "9"],
              [".", "."], ["0", "0"],
            ] as const
          ).map(([display, token]) => (
            <button
              key={display}
              type="button"
              onClick={() => appendToken(token)}
              className={keyButton}
            >
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
              const isSelected = account.id === selectedAccount.id;
              return (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => {
                    setSelectedAccount(account);
                    setIsAccountSheetOpen(false);
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
                    name={isSelected ? "radio-selected" : "radio-unselected"}
                    size={24}
                    color="var(--uc-action)"
                  />
                </button>
              );
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
  );
}
