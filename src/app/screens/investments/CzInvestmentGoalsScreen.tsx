import { useState } from "react";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import { AppIcon } from "@/app/components/icons";
import { useCollapsingHeader } from "@/hooks/useCollapsingHeader";
import { InvestmentGoalsHelpScreen } from "./robo/InvestmentGoalsHelpScreen";
import goalsSummaryIllustration from "@/assets/investments/goals-summary-illustration.png";
import {
  formatCzkInteger,
  formatCzkReturnLabel,
  getRoboGoalProgress,
  type RoboExistingGoal,
} from "./czFutureRoboAdvisorModel";

interface CzInvestmentGoalsScreenProps {
  goals: readonly RoboExistingGoal[];
  onBack: () => void;
  onCreateGoal: () => void;
  onOpenGoal: (goal: RoboExistingGoal) => void;
}

export { INITIAL_CZ_ROBO_GOALS } from "@/features/investments/robo/goalFixtures";

function GoalCard({
  goal,
  onOpen,
}: {
  goal: RoboExistingGoal;
  onOpen: (goal: RoboExistingGoal) => void;
}) {
  const returnClass =
    goal.returnTone === "positive"
      ? "text-[var(--uc-green-olive)]"
      : goal.returnTone === "negative"
        ? "text-[var(--uc-status-red)]"
        : "text-[var(--uc-text)]";
  const progress = getRoboGoalProgress(goal);

  return (
    <article
      className="rounded-[8px] bg-[var(--uc-surface-raised)] text-[var(--uc-text)]"
      data-testid="investment-goal-card"
      data-goal-id={goal.id}
    >
      <button
        type="button"
        className="flex w-full flex-col gap-[18px] rounded-[8px] p-[16px] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-action)]"
        aria-label={`Open ${goal.name}: ${goal.purpose}`}
        onClick={() => onOpen(goal)}
      >
        <div className="flex w-full items-start">
          <div className="min-w-0">
            <h3 className="text-[18px] font-bold leading-[24px]">{goal.name}</h3>
            <p className="text-[14px] leading-[17px]">{goal.purpose}</p>
          </div>
        </div>

        <div className="w-full">
          <p className="text-[14px] leading-[17px] text-[var(--uc-text-muted)]">Current value</p>
          <div className="flex items-baseline">
            <span className="text-[24px] font-bold leading-[26px]">{formatCzkInteger(goal.currentInteger)}</span>
            <span className="text-[16px] leading-[18px]">{goal.currentDecimals}</span>
          </div>
          <p className={`mt-[2px] text-[14px] leading-[18px] ${returnClass}`}>
            <span className={goal.returnTone === "neutral" ? "" : "font-bold"}>{formatCzkReturnLabel(goal.returnLabel)}</span>
            {goal.returnTone === "neutral" ? null : (
              <span className="font-normal text-[var(--uc-text-muted)]"> total return</span>
            )}
          </p>
        </div>

        <div className="w-full border-t border-[var(--uc-border-muted)] pt-[16px]">
          <div className="flex items-end justify-between gap-[16px]">
            <div>
              <p className="text-[14px] leading-[17px] text-[var(--uc-text-muted)]">Target</p>
              <div className="flex items-baseline">
                <span className="text-[16px] font-bold leading-[18px]">{formatCzkInteger(goal.targetInteger)}</span>
                <span className="text-[14px] leading-[17px]">{goal.targetDecimals}</span>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[14px] leading-[17px] text-[var(--uc-text-muted)]">Progress</p>
              <p className="text-[16px] font-bold leading-[18px]">{progress}%</p>
            </div>
          </div>
          <div className="mt-[12px]">
            <div className="h-[10px] overflow-hidden rounded-full border border-[var(--uc-border)] bg-[var(--uc-neutral-200)]">
              <div
                className="h-full rounded-full bg-[var(--uc-action)]"
                style={{ width: `${Math.min(100, Math.max(2, progress))}%` }}
              />
            </div>
          </div>
          <div className="mt-[12px] flex items-center justify-between text-[14px] leading-[17px]">
            {goal.startDate ? (
              <>
                <span>{goal.startDate}</span>
                <span>{goal.endDate}</span>
              </>
            ) : (
              <span className="flex items-center gap-[4px]">
                <AppIcon name="calendar-days" size={16} />
                {goal.endDate}
              </span>
            )}
          </div>
        </div>
      </button>
    </article>
  );
}

export default function CzInvestmentGoalsScreen({
  goals,
  onBack,
  onCreateGoal,
  onOpenGoal,
}: CzInvestmentGoalsScreenProps) {
  const [page, setPage] = useState<"list" | "help">("list");
  const { progress: headerProgress, onScroll: handleScroll, setProgress: setHeaderProgress } = useCollapsingHeader(64);
  const totalGoalsValue = goals.reduce((total, goal) => {
    const integer = goal.currentInteger.replace(/\D/g, "");
    const decimals = goal.currentDecimals.replace(/[^\d,.-]/g, "").replace(",", ".");
    return total + Number(`${integer}${decimals}`);
  }, 0);
  const [totalInteger, totalDecimals = "00"] = new Intl.NumberFormat("cs-CZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalGoalsValue).split(",");

  if (page === "help") {
    return (
      <InvestmentGoalsHelpScreen
        onBack={() => {
          setHeaderProgress(0);
          setPage("list");
        }}
      />
    );
  }

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden bg-[var(--uc-app-bg)] text-[var(--uc-text)]"
      data-investment-goals-screen
    >
      <PageHeader
        title="Your goals list"
        onBack={onBack}
        onHelpClick={() => setPage("help")}
        variant="gray"
        includeSafeArea
        renderLargeTitle={false}
        collapsedTitleProgress={headerProgress}
        hideCollapsedTitleWhenHidden
      />

      <main
        className="min-h-0 flex-1 overflow-y-auto px-[16px] pb-[24px] scrollbar-hide"
        onScroll={handleScroll}
      >
        <h1 className="uc-type-h1 pt-[8px]">Your goals list</h1>
        <p className="mb-[24px] mt-[6px] text-[16px] leading-[21px] text-[var(--uc-text-muted)]">
          Track your plans, one step at a time
        </p>

        <section
          aria-label="Total goals value"
          className="relative isolate mb-[24px] flex min-h-[110px] items-center overflow-hidden rounded-[8px] px-[20px] py-[16px] text-left [container-type:inline-size]"
          style={{
            backgroundColor: "color-mix(in srgb, var(--uc-text) 7%, var(--uc-surface-raised))",
            backgroundImage: "linear-gradient(110deg, transparent 35%, color-mix(in srgb, var(--uc-action) 12%, transparent) 100%)",
          }}
        >
          <div className="relative z-10 min-w-0 pr-[76px]">
            <p className="text-[16px] font-bold leading-[21px]">Total goals value</p>
            <div className="mt-[2px] flex flex-wrap items-baseline gap-y-[2px]">
              <span className="min-w-0 max-w-full break-words text-[clamp(30px,11cqw,36px)] font-bold leading-[1.1] [overflow-wrap:anywhere]">
                {formatCzkInteger(totalInteger ?? "0")}
              </span>
              <span className="shrink-0 whitespace-nowrap text-[18px] leading-[22px]">,{totalDecimals} CZK</span>
            </div>
          </div>
          <img
            src={goalsSummaryIllustration}
            alt=""
            aria-hidden="true"
            width={144}
            height={172}
            className="pointer-events-none absolute right-[-18px] top-[6px] h-[172px] w-[144px] rotate-[12deg] object-contain"
          />
        </section>

        <div className="mb-[16px] flex items-center justify-between border-b border-[var(--uc-border-muted)] pb-[8px]">
          <h2 className="text-[18px] font-bold leading-[22px]">Your goals</h2>
          <span className="text-[18px] font-bold leading-[22px]" data-goal-count>{goals.length}</span>
        </div>

        <div className="flex flex-col gap-[16px]">
          {goals.map((goal) => <GoalCard key={goal.id} goal={goal} onOpen={onOpenGoal} />)}
        </div>
      </main>

      <footer className="shrink-0 bg-[var(--uc-app-bg)] px-[24px] pb-[24px] pt-[8px]">
        <PrimaryButton onClick={onCreateGoal} labelSize="18">
          Create New Goal
        </PrimaryButton>
      </footer>
    </div>
  );
}
