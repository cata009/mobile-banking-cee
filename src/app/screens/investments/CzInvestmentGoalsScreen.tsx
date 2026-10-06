import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import { AppIcon } from "@/app/components/icons";
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

export const INITIAL_CZ_ROBO_GOALS: readonly RoboExistingGoal[] = [
  {
    id: "goal-4-strategic",
    name: "Build long-term wealth",
    purpose: "General build-up wealth",
    currentInteger: "100 000",
    currentDecimals: ",00 CZK",
    returnLabel: "+1 100,00 CZK (+1,36%)",
    returnTone: "positive",
    targetInteger: "100 000",
    targetDecimals: ",00 CZK",
    horizonYears: 3,
    startDate: "15 Feb 2025",
    endDate: "15 Feb 2028",
    portfolioId: "basket-sustainable-balanced-jp-morgan-global-growth",
  },
  {
    id: "goal-2-purchase",
    name: "My future home",
    purpose: "Saving for a major purchase",
    currentInteger: "51 241",
    currentDecimals: ",33 CZK",
    returnLabel: "+241,33 CZK (+0,47%)",
    returnTone: "positive",
    targetInteger: "250 000",
    targetDecimals: ",00 CZK",
    horizonYears: 10,
    startDate: "15 Feb 2025",
    endDate: "15 Feb 2035",
    portfolioId: "basket-balanced-core-blackrock-credit-opportunities",
  },
  {
    id: "goal-3-strategic",
    name: "Financial freedom",
    purpose: "Retirement",
    currentInteger: "5 000",
    currentDecimals: ",00 CZK",
    returnLabel: "0 total return",
    returnTone: "neutral",
    targetInteger: "100 000",
    targetDecimals: ",00 CZK",
    horizonYears: 3,
    startDate: "15 Feb 2025",
    endDate: "15 Feb 2028",
    portfolioId: "basket-steady-income-chase-regular-eur",
  },
  {
    id: "goal-4-inflation",
    name: "Protect my savings",
    purpose: "Saving for unforeseen circumstances",
    currentInteger: "100 000",
    currentDecimals: ",00 CZK",
    returnLabel: "-1 100,00 CZK (-1,36%)",
    returnTone: "negative",
    targetInteger: "100 000",
    targetDecimals: ",00 CZK",
    horizonYears: 3,
    startDate: "15 Feb 2025",
    endDate: "15 Feb 2028",
    portfolioId: "basket-balanced-core-onemarkets-eur-collection",
  },
] as const;

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
          <p className="text-[14px] leading-[17px] text-[var(--uc-text-muted)]">Target</p>
          <div className="flex items-baseline">
            <span className="text-[16px] font-bold leading-[18px]">{formatCzkInteger(goal.targetInteger)}</span>
            <span className="text-[14px] leading-[17px]">{goal.targetDecimals}</span>
          </div>
          <div className="relative mt-[10px] pt-[6px]">
            <div className="h-[10px] overflow-hidden rounded-full border border-[var(--uc-border)] bg-[var(--uc-neutral-200)]">
              <div
                className="h-full rounded-full bg-[var(--uc-action)]"
                style={{ width: `${Math.min(100, Math.max(2, progress))}%` }}
              />
            </div>
            <span
              className="absolute top-0 -translate-x-full rounded-full bg-[var(--uc-action)] px-[5px] py-[3px] text-[12px] font-bold leading-[14px] text-white"
              style={{ left: `${Math.min(100, Math.max(12, progress))}%` }}
            >
              {progress}%
            </span>
          </div>
          <div className="mt-[8px] flex items-center justify-between text-[14px] leading-[17px]">
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
  const totalGoalsValue = goals.reduce((total, goal) => {
    const integer = goal.currentInteger.replace(/\D/g, "");
    const decimals = goal.currentDecimals.replace(/[^\d,.-]/g, "").replace(",", ".");
    return total + Number(`${integer}${decimals}`);
  }, 0);
  const [totalInteger, totalDecimals = "00"] = new Intl.NumberFormat("cs-CZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalGoalsValue).split(",");

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
            <span className="text-[48px] font-bold leading-[52px]">{formatCzkInteger(totalInteger ?? "0")}</span>
            <span className="text-[32px] leading-[34px]">,{totalDecimals} CZK</span>
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
