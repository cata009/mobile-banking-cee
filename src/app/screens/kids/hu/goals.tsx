/**
 * HU Kids saving-goal surfaces: the Home/Saving goals section, goal list, goal
 * detail with contributions, and the create-goal form.
 *
 * Extracted verbatim from KidsMarketHomeApp.tsx (kids-split Phase 3).
 */
import { useState } from "react";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import { AppIcon, type IconName } from "@/app/components/icons";
import LinkButton from "@/app/components/ui/LinkButton";
import { goalProgress, type SavingGoal } from "@/data/huKidsBanking";
import {
  HU_MASKED_INTEGER,
  formatHuKidsAmount,
  formatHuKidsGoalAmount,
  getHuKidsDecimalParts,
} from "./money";
import type { HuThemePreset } from "./theme";
import type { HuGoalContribution } from "./types";

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
    <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] px-[18px] py-[18px] shadow-sm">
      <div className="flex items-center justify-between gap-[12px]">
        <div>
          <h2 className="text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">Saving goals</h2>
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
        className="mx-auto mt-[16px] h-[24px] text-[var(--hu-theme-accent-strong)]"
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
  const iconName = getHuKidsGoalIcon(goal);

  return (
    <button
      className="w-full rounded-[16px] bg-[var(--uc-surface)] p-[16px] text-left transition-transform active:scale-[0.99]"
      onClick={onClick}
      type="button"
    >
      <div className="flex items-start gap-[12px]">
        <span className="grid size-[42px] shrink-0 place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)]">
          <AppIcon name={iconName} size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-[8px]">
            <h3 className="min-w-0 flex-1 text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">
              {goal.title}
            </h3>
            <span className="shrink-0 rounded-full bg-[var(--hu-theme-control-bg)] px-[8px] py-[3px] text-[12px] font-bold leading-[14px] tracking-[0] text-[var(--hu-theme-accent-strong)]">
              {progress}%
            </span>
          </div>
          <p className="mt-[5px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
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

function getHuKidsGoalIcon(goal: SavingGoal): IconName {
  const title = goal.title.toLowerCase();

  if (title.includes("bike")) return "bike";
  if (title.includes("headphone")) return "gift";
  if (title.includes("school")) return "book-open";
  return "trophy";
}

export function HuKidsGoalPageHeader({
  onBack,
  theme,
  title,
}: {
  onBack: () => void;
  theme: HuThemePreset;
  title: string;
}) {
  const headerVariant = theme.id === "nordlys" || theme.id === "blue-lines" ? "dark" : "transparent";

  return (
    <PageHeader
      collapsedTitleProgress={1}
      compact
      includeSafeArea
      onBack={onBack}
      showHelp={false}
      title={title}
      variant={headerVariant}
    />
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
              <h1 className="text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">Save for what matters</h1>
              <p className="mt-[6px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
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
  onAddMoney,
  onAskParent,
  onBack,
  onCompleteGoal,
  onTerminateGoal,
  showAmounts,
  theme,
}: {
  contributions: HuGoalContribution[];
  goal: SavingGoal | null;
  onAddMoney: (amount: number) => void;
  onAskParent: () => void;
  onBack: () => void;
  onCompleteGoal: () => void;
  onTerminateGoal: () => void;
  showAmounts: boolean;
  theme: HuThemePreset;
}) {
  const [customAmount, setCustomAmount] = useState("1000");
  const parsedCustomAmount = Number(customAmount.replace(/[^\d]/g, ""));
  const canAddCustomAmount = parsedCustomAmount > 0;

  if (!goal) {
    return (
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
        <HuKidsGoalPageHeader onBack={onBack} theme={theme} title="Saving goal" />
        <main className="px-[24px] pt-[18px]">
          <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[18px] shadow-sm">
            <h1 className="text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">No goal selected</h1>
            <p className="mt-[6px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">Create a goal to start saving.</p>
          </section>
        </main>
      </div>
    );
  }

  const progress = goalProgress(goal);
  const isGoalComplete = progress >= 100;

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
      <HuKidsGoalPageHeader onBack={onBack} theme={theme} title={goal.title} />
      <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[16px] pb-[36px] pt-[18px]">
        <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[18px] shadow-sm">
          <div className="flex items-center gap-[14px]">
            <span className="grid size-[54px] shrink-0 place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)]">
              <AppIcon name="trophy" size={28} />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">Saved so far</p>
              <h1 className="mt-[4px] text-[30px] font-bold leading-[34px] tracking-[0] text-[var(--uc-text)]">
                {formatHuKidsGoalAmount(goal.savedAmount, showAmounts)}
              </h1>
              <p className="mt-[2px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
                Target {formatHuKidsGoalAmount(goal.targetAmount, showAmounts)}
              </p>
            </div>
          </div>

          <div className="mt-[18px] h-[10px] overflow-hidden rounded-full bg-[var(--hu-theme-progress-bg)]">
            <div className="h-full rounded-full bg-[var(--hu-theme-accent-strong)]" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-[10px] text-[13px] font-bold leading-[16px] tracking-[0] text-[var(--hu-theme-accent-strong)]">
            {progress}% complete
          </p>
        </section>

        <section className="mt-[14px] rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[18px] shadow-sm">
          <h2 className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">Add money</h2>
          <div className="mt-[14px] grid grid-cols-3 gap-[8px]">
            {[1000, 2500, 5000].map((amount) => (
              <button
                key={amount}
                className="h-[40px] rounded-[12px] bg-[var(--hu-theme-control-bg)] text-[13px] font-bold leading-[16px] tracking-[0] text-[var(--hu-theme-accent-strong)]"
                onClick={() => setCustomAmount(String(amount))}
                type="button"
              >
                +{formatHuKidsAmount(amount)}
              </button>
            ))}
          </div>
          <div className="mt-[12px] flex h-[48px] items-center rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] focus-within:ring-2 focus-within:ring-[var(--uc-action)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--uc-app-bg)]">
            <input
              aria-label="Custom saving amount"
              className="min-w-0 flex-1 bg-transparent text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)] outline-none"
              inputMode="numeric"
              onChange={(event) => setCustomAmount(event.target.value.replace(/[^\d]/g, ""))}
              value={customAmount}
            />
            <span className="text-[14px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">HUF</span>
          </div>
          <div className="mt-[12px] grid grid-cols-2 gap-[8px]">
            <button
              className="h-[44px] rounded-[12px] bg-[var(--hu-theme-accent-strong)] text-[14px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text-inverse)] disabled:opacity-45"
              disabled={!canAddCustomAmount}
              onClick={() => onAddMoney(parsedCustomAmount)}
              type="button"
            >
              Add amount
            </button>
            <button
              className="h-[44px] rounded-[12px] bg-[var(--hu-theme-control-bg)] text-[14px] font-bold leading-[18px] tracking-[0] text-[var(--hu-theme-accent-strong)]"
              onClick={onAskParent}
              type="button"
            >
              Ask parent
            </button>
          </div>
        </section>

        <section className="mt-[16px] rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[18px] shadow-sm">
          <h2 className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">Goal actions</h2>
          <div className="mt-[12px] flex flex-col gap-[10px]">
            <button
              className="flex min-h-[48px] w-full items-center gap-[12px] rounded-[12px] bg-[var(--hu-theme-control-bg)] px-[14px] text-left text-[var(--hu-theme-accent-strong)] disabled:opacity-45"
              disabled={isGoalComplete}
              onClick={onCompleteGoal}
              type="button"
            >
              <AppIcon name="prime-check" size={18} />
              <span className="min-w-0 flex-1 text-[14px] font-bold leading-[18px] tracking-[0]">
                {isGoalComplete ? "Goal completed" : "Complete goal now"}
              </span>
            </button>
            <button
              className="flex min-h-[48px] w-full items-center gap-[12px] rounded-[12px] bg-[color-mix(in_srgb,var(--uc-status-red)_8%,var(--uc-surface))] px-[14px] text-left text-[var(--uc-status-red)]"
              onClick={onTerminateGoal}
              type="button"
            >
              <AppIcon name="close-x" size={18} />
              <span className="min-w-0 flex-1 text-[14px] font-bold leading-[18px] tracking-[0]">
                Stop saving for this goal
              </span>
            </button>
          </div>
        </section>

        <section className="mt-[16px] rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[18px] shadow-sm">
          <div className="flex items-center gap-[12px]">
            <span className="grid size-[42px] shrink-0 place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)]">
              <AppIcon name="gift" size={22} />
            </span>
            <h2 className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">Contributors</h2>
          </div>
          <div className="mt-[14px] flex flex-col divide-y divide-[var(--uc-border-muted)]">
            {contributions.length > 0 ? (
              contributions.map((contribution) => {
                const amountParts = getHuKidsDecimalParts(contribution.amount);
                return (
                  <div key={contribution.id} className="flex items-start gap-[12px] py-[12px] first:pt-0 last:pb-0">
                    <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-[var(--uc-green-olive)] text-[var(--uc-static-white)]">
                      <AppIcon name={contribution.tone === "parent" ? "users" : "hu-kids-saving"} size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-[8px]">
                        <p className="truncate text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">
                          {contribution.title}
                        </p>
                        <p className="shrink-0 text-right tracking-[0] text-[var(--uc-green-olive)]">
                          {showAmounts ? (
                            <>
                              <span className="text-[18px] font-bold leading-[20px]">+{amountParts.integer}</span>
                              <span className="text-[14px] font-normal leading-[20px]">{amountParts.decimal} HUF</span>
                            </>
                          ) : (
                            <span className="text-[18px] font-bold leading-[20px]">+{HU_MASKED_INTEGER}</span>
                          )}
                        </p>
                      </div>
                      <p className="mt-[4px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
                        {contribution.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="py-[4px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
                Added money and parent contributions will appear here.
              </p>
            )}
          </div>
        </section>
      </main>
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
            className="mt-[8px] h-[48px] w-full rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What are you saving for?"
            value={title}
          />

          <label className="mt-[18px] block text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-text-muted)]">
            Target
          </label>
          <div className="mt-[8px] flex h-[58px] items-center rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] focus-within:ring-2 focus-within:ring-[var(--uc-action)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--uc-app-bg)]">
            <input
              className="min-w-0 flex-1 bg-transparent text-[28px] font-bold leading-[32px] tracking-[0] text-[var(--uc-text)] outline-none"
              inputMode="numeric"
              onChange={(event) => setTarget(event.target.value.replace(/[^\d]/g, ""))}
              value={target}
            />
            <span className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text-muted)]">HUF</span>
          </div>

          <PrimaryButton className="mt-[18px] !w-full" disabled={!canCreate} onClick={() => onCreateGoal(title, amount)}>
            Create goal
          </PrimaryButton>
        </section>
      </main>
    </div>
  );
}
