/**
 * HU Kids saving-goal surfaces: the Home/Saving goals section, goal list, goal
 * detail with contributions, and the create-goal form.
 *
 * Extracted verbatim from KidsMarketHomeApp.tsx (kids-split Phase 3).
 */
import { useState } from "react";
import { BottomSheet } from "@/app/components/BottomSheet";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import { AppIcon, type IconName } from "@/app/components/icons";
import LinkButton from "@/app/components/ui/LinkButton";
import { HU_KIDS_ACCOUNTS, type HuKidsAccount, goalProgress, type SavingGoal } from "@/data/huKidsBanking";
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
  onBack,
  onCompleteGoal,
  onOpenAddMoney,
  onTerminateGoal,
  showAmounts,
  theme,
}: {
  contributions: HuGoalContribution[];
  goal: SavingGoal | null;
  onBack: () => void;
  onCompleteGoal: () => void;
  onOpenAddMoney?: () => void;
  onTerminateGoal: () => void;
  showAmounts: boolean;
  theme: HuThemePreset;
}) {
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

  // Quick action rail under "Saved so far", styled after the HU Kids Card
  // Details action rail. Only Add Money is wired; Withdrawal and Settings are
  // placeholders until their flows are specified.
  const goalActions = [
    { id: "add-money", iconName: "add-money" as const, label: "Add\nMoney", onClick: onOpenAddMoney },
    { id: "withdrawal", iconName: "account-options" as const, label: "Withdrawal", onClick: undefined },
    { id: "settings", iconName: "account-options" as const, label: "Settings", onClick: undefined },
  ];

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
                <span className="min-h-[32px] max-w-[76px] text-center text-[14px] font-medium leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">
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
  theme,
  showAmounts,
}: {
  goal: SavingGoal | null;
  onBack: () => void;
  onSubmit: (amount: number) => void;
  theme: HuThemePreset;
  showAmounts: boolean;
}) {
  const [expression, setExpression] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<HuKidsAccount>(HU_KIDS_ACCOUNTS[0]);
  const [isAccountSheetOpen, setIsAccountSheetOpen] = useState(false);

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

        {/* CTA row: calendar (no-op placeholder) + Add button. Sits above the
            operators/presets strip and the keypad, per the Revolut reference. */}
        <div className="flex items-center gap-[8px]">
          <button
            type="button"
            aria-label="Schedule"
            onClick={() => {}}
            className="grid size-[48px] shrink-0 place-items-center rounded-[12px] bg-[var(--uc-surface-muted)] text-[var(--uc-text)]"
          >
            <AppIcon name="calendar-days" size={22} color="var(--uc-text)" />
          </button>
          <PrimaryButton
            className="!h-[48px] !flex-1"
            disabled={!canSubmit}
            onClick={() => {
              onSubmit(amount);
            }}
          >
            Add money
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
                className="flex h-[44px] items-center justify-center rounded-full border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] text-[20px] font-bold leading-[22px] text-[var(--uc-text)] transition-colors active:bg-[var(--uc-surface-muted)]"
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
              className="flex h-[44px] items-center justify-center rounded-full border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] text-[20px] font-bold leading-[22px] text-[var(--uc-text)] transition-colors active:bg-[var(--uc-surface-muted)] disabled:opacity-40"
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
    </div>
  );
}
