/**
 * RO Teens savings goals: the list surface, a goal detail with add-money +
 * ask-parent, and the create-goal form.
 */
import { useState } from "react";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import { AppIcon } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";
import { formatRon, formatRonGuarded, toProgress } from "../money";
import { RoAmountField, RoCard } from "../ui";
import type { RoGoal, RoGoalContribution } from "../types";

function GoalProgressBar({ saved, target }: { saved: number; target: number }) {
  const progress = toProgress(saved, target);
  return (
    <div className="h-[8px] w-full overflow-hidden rounded-full bg-[var(--hu-theme-progress-bg)]">
      <div
        className="h-full rounded-full bg-[var(--hu-theme-accent-strong)] transition-[width]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function RoGoalsScreen({
  goals,
  showAmounts,
  onCreateGoal,
  onSelectGoal,
}: {
  goals: RoGoal[];
  showAmounts: boolean;
  onCreateGoal: () => void;
  onSelectGoal: (goalId: string) => void;
}) {
  const totalSaved = goals.reduce((sum, goal) => sum + goal.savedAmount, 0);

  return (
    <main className="mt-[8px] px-[20px] pb-[8px]">
      <RoCard className="flex items-center justify-between">
        <div>
          <p className="text-[13px] leading-[17px] text-[var(--uc-text-muted)]">Total în obiective</p>
          <p className="mt-[2px] text-[26px] font-bold leading-[30px] text-[var(--uc-text)]">
            {formatRonGuarded(totalSaved, showAmounts)}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-[40px] items-center gap-[6px] rounded-full bg-[var(--hu-theme-accent-strong)] px-[14px] text-[14px] font-bold text-[var(--uc-text-inverse)] active:scale-95"
          onClick={onCreateGoal}
        >
          <AppIcon name="piggy-bank" size={16} />
          Nou
        </button>
      </RoCard>

      <div className="mt-[16px] space-y-[12px]">
        {goals.map((goal) => (
          <button
            key={goal.id}
            type="button"
            className="w-full rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[16px] text-left shadow-sm transition active:scale-[0.99]"
            onClick={() => onSelectGoal(goal.id)}
          >
            <div className="flex items-center gap-[12px]">
              <span
                className="grid size-[46px] shrink-0 place-items-center rounded-[14px] text-[24px]"
                style={{ background: `color-mix(in srgb, ${goal.accent} 16%, var(--uc-surface))` }}
              >
                {goal.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">{goal.title}</p>
                <p className="truncate text-[13px] leading-[17px] text-[var(--uc-text-muted)]">{goal.helper}</p>
              </div>
              <span className="shrink-0 text-[13px] font-bold text-[var(--hu-theme-accent-strong)]">
                {toProgress(goal.savedAmount, goal.targetAmount)}%
              </span>
            </div>
            <div className="mt-[14px]">
              <GoalProgressBar saved={goal.savedAmount} target={goal.targetAmount} />
              <div className="mt-[8px] flex items-center justify-between text-[13px]">
                <span className="font-bold text-[var(--uc-text)]">
                  {formatRonGuarded(goal.savedAmount, showAmounts)}
                </span>
                <span className="text-[var(--uc-text-muted)]">din {formatRon(goal.targetAmount)}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}

export function RoGoalDetailScreen({
  goal,
  contributions,
  showAmounts,
  onBack,
  onAddMoney,
  onAskParent,
  onComplete,
}: {
  goal: RoGoal | null;
  contributions: RoGoalContribution[];
  showAmounts: boolean;
  onBack: () => void;
  onAddMoney: (amount: number) => void;
  onAskParent: () => void;
  onComplete: () => void;
}) {
  const [addValue, setAddValue] = useState("20");

  if (!goal) {
    return (
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
        <PageHeader compact includeSafeArea showHelp={false} variant="transparent" title="Obiectiv" onBack={onBack} />
        <main className="grid flex-1 place-items-center px-[24px] text-center text-[var(--uc-text-muted)]">
          Obiectivul nu mai există.
        </main>
      </div>
    );
  }

  const progress = toProgress(goal.savedAmount, goal.targetAmount);
  const remaining = Math.max(goal.targetAmount - goal.savedAmount, 0);
  const done = remaining <= 0;
  const parsedAdd = Number(addValue || 0);

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
      <PageHeader
        compact
        includeSafeArea
        collapsedTitleProgress={1}
        showHelp={false}
        variant="transparent"
        title={goal.title}
        onBack={onBack}
      />
      <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[20px] pb-[36px] pt-[10px]">
        <RoCard className="text-center">
          <span
            className="mx-auto grid size-[64px] place-items-center rounded-[18px] text-[32px]"
            style={{ background: `color-mix(in srgb, ${goal.accent} 16%, var(--uc-surface))` }}
          >
            {goal.emoji}
          </span>
          <p className="mt-[12px] text-[28px] font-bold leading-[32px] text-[var(--uc-text)]">
            {formatRonGuarded(goal.savedAmount, showAmounts)}
          </p>
          <p className="mt-[2px] text-[14px] text-[var(--uc-text-muted)]">din {formatRon(goal.targetAmount)}</p>
          <div className="mt-[14px]">
            <GoalProgressBar saved={goal.savedAmount} target={goal.targetAmount} />
            <p className="mt-[8px] text-[13px] font-bold text-[var(--hu-theme-accent-strong)]">
              {done ? "Obiectiv atins! 🎉" : `${progress}% · mai ai ${formatRon(remaining)}`}
            </p>
          </div>
        </RoCard>

        {!done ? (
          <RoCard className="mt-[16px] space-y-[14px]">
            <p className="text-[15px] font-bold leading-[19px] text-[var(--uc-text)]">Adaugă la obiectiv</p>
            <RoAmountField value={addValue} onChange={setAddValue} chips={[10, 20, 50]} />
            <div className="flex gap-[10px]">
              <button
                type="button"
                className="h-[48px] flex-1 rounded-[12px] bg-[var(--hu-theme-control-bg)] text-[14px] font-bold text-[var(--uc-text)] active:scale-[0.98]"
                onClick={onAskParent}
              >
                Cere-i Mamei
              </button>
              <PrimaryButton
                className="!h-[48px] flex-1"
                disabled={parsedAdd <= 0}
                onClick={() => {
                  if (parsedAdd > 0) onAddMoney(parsedAdd);
                  setAddValue("20");
                }}
              >
                Adaugă
              </PrimaryButton>
            </div>
          </RoCard>
        ) : (
          <PrimaryButton className="mt-[16px] !w-full" onClick={onComplete}>
            Marchează ca finalizat
          </PrimaryButton>
        )}

        {contributions.length > 0 ? (
          <section className="mt-[20px]">
            <h2 className="mb-[10px] text-[15px] font-bold leading-[19px] text-[var(--uc-text)]">Contribuții</h2>
            <RoCard padded={false} className="px-[16px]">
              {contributions.map((contribution, index) => (
                <div
                  key={contribution.id}
                  className={cn(
                    "flex items-center gap-[12px] py-[12px]",
                    index > 0 ? "border-t border-[var(--uc-border-muted)]" : undefined,
                  )}
                >
                  <span
                    className="grid size-[38px] shrink-0 place-items-center rounded-full"
                    style={{
                      background:
                        contribution.tone === "parent"
                          ? "color-mix(in srgb, var(--uc-product-pink) 16%, var(--uc-surface))"
                          : "color-mix(in srgb, var(--hu-theme-accent-strong) 14%, var(--uc-surface))",
                      color:
                        contribution.tone === "parent"
                          ? "var(--uc-product-pink)"
                          : "var(--hu-theme-accent-strong)",
                    }}
                  >
                    <AppIcon name={contribution.tone === "parent" ? "user-round" : "piggy-bank"} size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-bold leading-[18px] text-[var(--uc-text)]">
                      {contribution.title}
                    </p>
                    <p className="truncate text-[12px] leading-[16px] text-[var(--uc-text-muted)]">
                      {contribution.subtitle}
                    </p>
                  </div>
                  {contribution.amount > 0 ? (
                    <span className="shrink-0 text-[14px] font-bold text-[var(--uc-green-success)]">
                      +{formatRon(contribution.amount)}
                    </span>
                  ) : null}
                </div>
              ))}
            </RoCard>
          </section>
        ) : null}
      </main>
    </div>
  );
}

const EMOJI_CHOICES = ["📱", "🎧", "🛹", "👟", "🎮", "✈️", "📷", "🚲"];

export function RoCreateGoalScreen({
  onBack,
  onCreate,
}: {
  onBack: () => void;
  onCreate: (title: string, target: number, emoji: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("300");
  const [emoji, setEmoji] = useState(EMOJI_CHOICES[0]);
  const parsedTarget = Number(target || 0);
  const canCreate = title.trim().length > 0 && parsedTarget > 0;

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
      <PageHeader
        compact
        includeSafeArea
        collapsedTitleProgress={1}
        showHelp={false}
        variant="transparent"
        title="Obiectiv nou"
        onBack={onBack}
      />
      <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[20px] pb-[36px] pt-[10px]">
        <RoCard className="space-y-[18px]">
          <div>
            <label className="mb-[8px] block text-[12px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">
              Pentru ce economisești?
            </label>
            <input
              className="h-[52px] w-full rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] text-[17px] font-bold text-[var(--uc-text)] outline-none placeholder:text-[var(--uc-text-muted)] focus:ring-2 focus:ring-[var(--hu-theme-accent-strong)]"
              placeholder="Ex: Căști noi"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div>
            <p className="mb-[10px] text-[12px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">
              Alege un simbol
            </p>
            <div className="flex flex-wrap gap-[8px]">
              {EMOJI_CHOICES.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-label={`Simbol ${item}`}
                  aria-pressed={item === emoji}
                  className={cn(
                    "grid size-[46px] place-items-center rounded-[14px] text-[24px] transition",
                    item === emoji
                      ? "bg-[color-mix(in_srgb,var(--hu-theme-accent-strong)_18%,var(--uc-surface))] ring-2 ring-[var(--hu-theme-accent-strong)]"
                      : "bg-[var(--hu-theme-control-bg)]",
                  )}
                  onClick={() => setEmoji(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-[8px] block text-[12px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">
              Țintă
            </label>
            <RoAmountField value={target} onChange={setTarget} chips={[100, 300, 500]} />
          </div>

          <PrimaryButton
            className="!w-full"
            disabled={!canCreate}
            onClick={() => {
              if (canCreate) onCreate(title.trim(), parsedTarget, emoji ?? "🎯");
            }}
          >
            Creează obiectivul
          </PrimaryButton>
        </RoCard>
      </main>
    </div>
  );
}
