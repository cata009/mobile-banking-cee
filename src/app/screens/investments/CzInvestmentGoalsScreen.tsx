import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import { AppIcon } from "@/app/components/icons";
import type { RoboExistingGoal, RoboGoalStatus } from "./czFutureRoboAdvisorModel";

interface CzInvestmentGoalsScreenProps {
  goals: readonly RoboExistingGoal[];
  onBack: () => void;
  onCreateGoal: () => void;
  onOpenGoal: (goal: RoboExistingGoal) => void;
}

export const INITIAL_CZ_ROBO_GOALS: readonly RoboExistingGoal[] = [
  {
    id: "goal-4-strategic",
    name: "Build long-term wealth",
    purpose: "Strategic approach",
    status: "ACTIVE",
    currentInteger: "100 000",
    currentDecimals: ",00 CZK",
    returnLabel: "+1 100,00 CZK (+1,36%)",
    returnTone: "positive",
    targetInteger: "100 000",
    targetDecimals: ",00 CZK",
    progress: 100,
    startDate: "15 Feb 2025",
    endDate: "15 Feb 2027",
    portfolioId: "sustainable-balanced-portfolio",
  },
  {
    id: "goal-2-purchase",
    name: "My future home",
    purpose: "Saving for a major purchase",
    status: "ACTIVE",
    currentInteger: "51 241",
    currentDecimals: ",33 CZK",
    returnLabel: "+241,33 CZK (+0,47%)",
    returnTone: "positive",
    targetInteger: "250 000",
    targetDecimals: ",00 CZK",
    progress: 20,
    startDate: "15 Feb 2025",
    endDate: "15 Feb 2035",
    portfolioId: "balanced-core-portfolio",
  },
  {
    id: "goal-3-strategic",
    name: "Financial freedom",
    purpose: "Strategic approach",
    status: "INACTIVE",
    currentInteger: "5 000",
    currentDecimals: ",00 CZK",
    returnLabel: "0 total return",
    returnTone: "neutral",
    targetInteger: "100 000",
    targetDecimals: ",00 CZK",
    progress: 1,
    endDate: "31 Dec 2027",
    timeLeft: "1Y 5M 23D left",
    portfolioId: "steady-income-portfolio",
  },
  {
    id: "goal-4-inflation",
    name: "Protect my savings",
    purpose: "Protection for inflation",
    status: "ACTIVE",
    currentInteger: "100 000",
    currentDecimals: ",00 CZK",
    returnLabel: "-1 100,00 CZK (-1,36%)",
    returnTone: "negative",
    targetInteger: "100 000",
    targetDecimals: ",00 CZK",
    progress: 100,
    startDate: "15 Feb 2025",
    endDate: "15 Feb 2027",
    portfolioId: "balanced-core-portfolio",
  },
  {
    id: "goal-5-inflation",
    name: "Keep pace with inflation",
    purpose: "Protection for inflation",
    status: "ACTIVE",
    currentInteger: "88 900",
    currentDecimals: ",00 CZK",
    returnLabel: "-11 100,00 CZK (-1,36%)",
    returnTone: "negative",
    targetInteger: "100 000",
    targetDecimals: ",00 CZK",
    progress: 89,
    startDate: "15 Feb 2025",
    endDate: "15 Feb 2027",
    portfolioId: "sustainable-balanced-portfolio",
  },
] as const;

function GoalStatus({ status }: { status: RoboGoalStatus }) {
  return (
    <span
      className={`shrink-0 rounded-[4px] px-[8px] py-[4px] text-[12px] font-bold leading-[14px] text-white ${
        status === "ACTIVE" ? "bg-[var(--uc-green-olive)]" : "bg-[var(--uc-neutral-700)]"
      }`}
      data-testid="investment-goal-status"
    >
      {status}
    </span>
  );
}

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
        <div className="flex w-full items-start justify-between gap-[12px]">
          <div className="min-w-0">
            <h3 className="text-[18px] font-bold leading-[24px]">{goal.name}</h3>
            <p className="text-[14px] leading-[17px]">{goal.purpose}</p>
          </div>
          <GoalStatus status={goal.status} />
        </div>

        <div className="w-full">
          <p className="text-[14px] leading-[17px] text-[var(--uc-text-muted)]">Current value</p>
          <div className="flex items-baseline">
            <span className="text-[24px] font-bold leading-[26px]">{goal.currentInteger}</span>
            <span className="text-[16px] leading-[18px]">{goal.currentDecimals}</span>
          </div>
          <p className={`mt-[2px] text-[14px] leading-[18px] ${returnClass}`}>
            <span className={goal.returnTone === "neutral" ? "" : "font-bold"}>{goal.returnLabel}</span>
            {goal.returnTone === "neutral" ? null : (
              <span className="font-normal text-[var(--uc-text-muted)]"> total return</span>
            )}
          </p>
        </div>

        <div className="w-full border-t border-[var(--uc-border-muted)] pt-[16px]">
          <p className="text-[14px] leading-[17px] text-[var(--uc-text-muted)]">Target</p>
          <div className="flex items-baseline">
            <span className="text-[16px] font-bold leading-[18px]">{goal.targetInteger}</span>
            <span className="text-[14px] leading-[17px]">{goal.targetDecimals}</span>
          </div>
          <div className="relative mt-[10px] pt-[6px]">
            <div className="h-[10px] overflow-hidden rounded-full border border-[var(--uc-border)] bg-[var(--uc-neutral-200)]">
              <div
                className="h-full rounded-full bg-[var(--uc-action)]"
                style={{ width: `${Math.max(2, goal.progress)}%` }}
              />
            </div>
            <span
              className="absolute top-0 -translate-x-full rounded-full bg-[var(--uc-action)] px-[5px] py-[3px] text-[12px] font-bold leading-[14px] text-white"
              style={{ left: `${Math.max(12, goal.progress)}%` }}
            >
              {goal.progress}%
            </span>
          </div>
          <div className="mt-[8px] flex items-center justify-between text-[14px] leading-[17px]">
            <span className="flex items-center gap-[4px]">
              {goal.startDate ? null : <AppIcon name="calendar-days" size={16} />}
              {goal.startDate ?? goal.endDate}
            </span>
            <span className="flex items-center gap-[4px]">
              {goal.timeLeft ? <AppIcon name="contact-time" size={16} /> : null}
              {goal.timeLeft ?? goal.endDate}
            </span>
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
  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden bg-[var(--uc-app-bg)] text-[var(--uc-text)]"
      data-investment-goals-screen
    >
      <PageHeader
        title=""
        onBack={onBack}
        onHelpClick={() => undefined}
        variant="gray"
        includeSafeArea
        renderLargeTitle={false}
      />

      <main className="min-h-0 flex-1 overflow-y-auto px-[16px] pb-[24px] scrollbar-hide">
        <section className="flex flex-col items-center pb-[64px] pt-[26px] text-center">
          <p className="text-[18px] leading-[20px]">Total goals value</p>
          <div className="mt-[4px] flex items-baseline justify-center">
            <span className="text-[48px] font-bold leading-[52px]">151.241</span>
            <span className="text-[32px] leading-[34px]">,33 CZK</span>
          </div>
        </section>

        <div className="mb-[16px] flex items-center justify-between border-b border-[var(--uc-border-muted)] pb-[8px]">
          <h2 className="text-[18px] font-bold leading-[22px]">YOUR GOAL LIST</h2>
          <span className="text-[18px] font-bold leading-[22px]" data-goal-count>
            {goals.length}
          </span>
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
