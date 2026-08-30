import { useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import TextField from "@/app/components/TextField";
import ToggleButton from "@/app/components/ToggleButton";
import NavigationRow from "@/app/components/NavigationRow";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import AccountActionBar from "@/app/components/accounts/AccountActionBar";
import BrandLogo from "@/app/components/brand-logo/BrandLogo";
import StandardSignScreen from "@/app/components/flow/StandardSignScreen";
import StandardSuccessScreen from "@/app/components/flow/StandardSuccessScreen";
import { AppIcon, type IconName } from "@/app/components/icons";
import InvestmentFilterChips from "@/app/components/investments/InvestmentFilterChips";
import InvestmentPeriodChips from "@/app/components/investments/InvestmentPeriodChips";
import InvestmentPortfolioChart from "@/app/components/investments/InvestmentPortfolioChart";
import InvestmentPortfolioTabs from "@/app/components/investments/InvestmentPortfolioTabs";
import { cn } from "@/app/components/ui/utils";
import {
  INVESTMENT_PERIODS,
  INVESTMENT_SORT_OPTIONS,
  buildInvestmentChartPoints,
  type InvestmentPeriodId,
  type InvestmentPortfolioTabId,
  type InvestmentPortfolioTabOption,
  type InvestmentSortId,
} from "@/app/config/investmentsPortfolioConfig";
import introImage from "@/assets/investments/robo-advisor-intro.png";
import amundiLogo from "@/assets/investments/funds/fund-amundi-logo.png";
import { useCollapsingHeader } from "@/hooks/useCollapsingHeader";
import { useDragCarousel, type DragCarouselHandlers } from "@/hooks/useDragCarousel";
import {
  ROBO_DOCUMENTS,
  ROBO_GOAL_TYPES,
  ROBO_PORTFOLIO_PRESENTATIONS,
  ROBO_STRATEGIES,
  buildRoboReviewRows,
  formatCzkInput,
  getFundingFieldVisibility,
  getPortfoliosForStrategy,
  isInvestorProfileBlocking,
  type RoboFundingMethod,
  type RoboExistingGoal,
  type RoboInvestorProfileStatus,
  type RoboPortfolio,
  type RoboPortfolioProduct,
  type RoboStrategy,
} from "./czFutureRoboAdvisorModel";
import {
  createRoboAdvisorFlowState,
  getPreviousManagementMode,
  getRoboAdvisorBackStep,
  roboAdvisorFlowReducer,
  type RoboAdvisorCreationStep as CreationStep,
  type RoboAdvisorManagementMode as ManagementMode,
} from "./roboAdvisorFlowState";

interface CzFutureRoboAdvisorFlowProps {
  onBack: () => void;
  onExit: () => void;
  onOpenSecurity?: (selection: {
    securityId: string;
    localValue: number;
    performancePercent: number;
  }) => void;
  initialGoal?: RoboExistingGoal;
  onGoalUpdated?: (goal: RoboExistingGoal) => void;
  profileStatus?: RoboInvestorProfileStatus;
  requiresContactValidation?: boolean;
  availableStrategyCount?: 1 | 2 | 3;
}

interface RoboScreenProps {
  title: string;
  description?: string;
  onBack: () => void;
  onClose: () => void;
  headerAction?: "close" | "help";
  children: ReactNode;
  footer?: ReactNode;
  dataScreen: string;
  titleClassName?: string;
  descriptionTrailing?: ReactNode;
  descriptionTopClassName?: string;
}

const cashAccountLabel = "Current ··· 4821";
const DEFAULT_ROBO_STRATEGY = ROBO_STRATEGIES[0]!;

function RoboScreen({
  title,
  description,
  onBack,
  onClose,
  headerAction = "close",
  children,
  footer,
  dataScreen,
  titleClassName,
  descriptionTrailing,
  descriptionTopClassName = "mt-[16px]",
}: RoboScreenProps) {
  const { progress: headerProgress, onScroll: handleScroll } = useCollapsingHeader(64);

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden bg-[var(--uc-surface)] text-[var(--uc-text)]"
      data-robo-screen={dataScreen}
    >
      <PageHeader
        title={title}
        onBack={onBack}
        includeSafeArea
        compact
        renderLargeTitle={false}
        collapsedTitleProgress={headerProgress}
        showHelp={headerAction === "help"}
        onHelpClick={() => undefined}
        rightActionIcon={headerAction === "close"
          ? <AppIcon name="close-flow" color="var(--uc-text)" size={20} />
          : undefined}
        rightActionLabel="Close"
        onRightActionClick={onClose}
        hideCollapsedTitleWhenHidden
      />
      <main
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-[24px] pb-[24px] scrollbar-hide"
        data-robo-scroll-container
        onScroll={handleScroll}
      >
        <h1 className={cn("uc-type-h1 pt-[8px] text-[var(--uc-text)]", titleClassName)}>{title}</h1>
        {description ? (
          <div
            className={cn(descriptionTopClassName, "flex items-center justify-between gap-[16px]")}
            data-testid={dataScreen === "goal-detail" ? "robo-goal-detail-meta" : undefined}
          >
            <p className="text-[16px] leading-[21px] text-[var(--uc-text)]">{description}</p>
            {descriptionTrailing}
          </div>
        ) : null}
        <div className="pt-[32px]">{children}</div>
      </main>
      {footer ? <footer className="shrink-0 px-[24px] pb-[34px] pt-[12px]">{footer}</footer> : null}
    </div>
  );
}

function OptionCard({
  title,
  description,
  selected,
  onClick,
}: {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "w-full rounded-[8px] border px-[16px] py-[15px] text-left transition-colors",
        selected
          ? "border-[2px] border-[var(--uc-action)] bg-[color-mix(in_srgb,var(--uc-action)_5%,var(--uc-surface))]"
          : "border-[var(--uc-border)] bg-[var(--uc-surface)]",
      )}
    >
      <span className={cn("uc-type-n4-strong block", selected ? "text-[var(--uc-action)]" : "text-[var(--uc-text)]")}>
        {title}
      </span>
      <span className="uc-type-n5 mt-[5px] block leading-[17px] text-[var(--uc-text-muted)]">{description}</span>
    </button>
  );
}

const GOAL_ICONS: Record<(typeof ROBO_GOAL_TYPES)[number]["id"], IconName> = {
  "build-wealth": "robo-goal-wealth",
  "protect-from-inflation": "robo-goal-inflation",
  "unforeseen-circumstances": "robo-goal-unforeseen",
  "major-purchase": "robo-goal-purchase",
  retirement: "robo-goal-retirement",
};

function GoalSelectionCard({
  id,
  title,
  selected,
  onSelect,
}: {
  id: (typeof ROBO_GOAL_TYPES)[number]["id"];
  title: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={title}
      onClick={onSelect}
      className="flex min-h-[64px] w-full items-center gap-[16px] rounded-[5px] border border-[var(--uc-text)] px-[20px] py-[15px] text-left"
    >
      <span className="grid size-[24px] shrink-0 place-items-center text-[var(--uc-text)]">
        <AppIcon name={GOAL_ICONS[id]} size={24} />
      </span>
      <span className="flex-1 text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">{title}</span>
      <span className="grid size-[24px] shrink-0 place-items-center">
        <AppIcon name={selected ? "radio-selected" : "radio-unselected"} size={24} color="var(--uc-text)" />
      </span>
    </button>
  );
}

function IntroScreen({ onCreate, onExit }: { onCreate: () => void; onExit: () => void }) {
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-[var(--uc-surface)] scrollbar-hide" data-robo-screen="intro">
      <div className="relative h-[400px] shrink-0 overflow-hidden bg-[var(--uc-app-bg)]">
        <img src={introImage} alt="" className="h-full w-full object-cover" />
        <button
          type="button"
          aria-label="Close"
          onClick={onExit}
          className="absolute right-[8px] top-[calc(var(--uc-phone-top-reserve,54px)+4px)] grid size-[40px] place-items-center"
        >
          <AppIcon name="close-flow" color="var(--uc-text)" size={20} />
        </button>
      </div>
      <div className="flex flex-1 flex-col px-[24px] pb-[34px] pt-[20px]">
        <h1 className="uc-type-h1 text-[var(--uc-text)]">Invest towards what matters</h1>
        <p className="mt-[16px] text-[16px] leading-[21px] text-[var(--uc-text)]">
          Create a goal and invest with a portfolio selected for your needs.
        </p>
        <div className="mt-[22px] rounded-[8px] bg-[var(--uc-surface-muted)]">
          {[
            ["A recommendation built around you", "We use your goal, time horizon and investor profile to check suitable portfolios."],
            ["A clear plan you can track", "Explore possible outcomes, compare portfolios and follow your goal over time."],
            ["You decide before anything is invested", "Review the recommendation, risks and documents before you sign."],
          ].map(([title, body], index) => (
            <div
              key={title}
              className={cn("flex gap-[12px] px-[16px] py-[14px]", index > 0 ? "border-t border-[var(--uc-border)]" : null)}
            >
              <span className="mt-[2px] grid size-[24px] shrink-0 place-items-center text-[var(--uc-text)]">
                <AppIcon name={index === 2 ? "investment-important-info" : "invest-action"} size={22} />
              </span>
              <div>
                <p className="uc-type-n5-strong uppercase text-[var(--uc-text)]">{title}</p>
                <p className="uc-type-n5 mt-[3px] leading-[16px] text-[var(--uc-text)]">{body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-[22px]">
          <p className="uc-type-n4-strong text-[var(--uc-text)]">Your capital is at risk. Returns are not guaranteed.</p>
          <p className="uc-type-n4 mt-[8px] leading-[21px] text-[var(--uc-text)]">
            Investments may rise or fall in value, and you could get back less than you invest. We only show a
            portfolio after checking what is suitable for you.
          </p>
        </div>
        <p className="uc-type-n5 mt-[18px] border-t border-[var(--uc-border)] pt-[10px] text-[var(--uc-text-muted)]">
          An investment account is required. Account terms and required documents are shown before signing.
        </p>
        <div className="mt-auto pt-[22px]">
          <PrimaryButton labelSize="18" onClick={onCreate}>Create Goal</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function ContactScreen({ onBack, onContinue, onExit }: { onBack: () => void; onContinue: () => void; onExit: () => void }) {
  return (
    <RoboScreen
      title="Check your contact details"
      description="Check where we should send important investment documents and updates."
      onBack={onBack}
      onClose={onExit}
      dataScreen="contact"
      footer={<PrimaryButton labelSize="18" onClick={onContinue}>Details are correct</PrimaryButton>}
    >
      <div className="space-y-[28px]">
        <TextField label="Email" value="teodora.novak@example.com" onChange={() => undefined} readOnly />
        <TextField label="Mobile number" value="+420 602 123 456" onChange={() => undefined} readOnly />
        <button type="button" className="uc-type-n4-strong text-[var(--uc-action)]">
          Update contact details
        </button>
      </div>
      <p className="uc-type-n5 mt-[28px] rounded-[6px] bg-[var(--uc-surface-muted)] p-[12px] leading-[17px] text-[var(--uc-text-muted)]">
        Keeping these details up to date helps us deliver important investment documents without delay.
      </p>
    </RoboScreen>
  );
}

function InvestorProfileScreen({
  status,
  onBack,
  onContinue,
  onExit,
}: {
  status: RoboInvestorProfileStatus;
  onBack: () => void;
  onContinue: () => void;
  onExit: () => void;
}) {
  const blocking = isInvestorProfileBlocking(status);
  return (
    <RoboScreen
      title="Your risk profile"
      description={
        blocking
          ? "Your investor profile needs an update before we can check which portfolios are suitable for you."
          : "Your answers indicate a Moderate investor profile. We’ll use it together with your goal and time horizon when checking suitable portfolios."
      }
      onBack={onBack}
      onClose={onExit}
      dataScreen="profile"
      footer={!blocking ? <PrimaryButton labelSize="18" onClick={onContinue}>Continue</PrimaryButton> : undefined}
    >
      <div className="rounded-[4px] bg-[var(--uc-surface-muted)] py-[16px] pl-[24px] pr-[12px]">
        <div className="flex gap-[5px]" aria-label="Moderate risk: level 3 of 5">
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              key={level}
              className={cn(
                "h-[6px] w-[30px] rounded-full",
                level < 3 ? "bg-[var(--uc-text)]" : "bg-[var(--uc-border)]",
              )}
            />
          ))}
        </div>
        <p className="mt-[16px] text-[20px] font-bold leading-[24px] text-[var(--uc-text)]">
          {blocking ? "Profile update needed" : "Moderate"}
        </p>
        <p className="mt-[12px] text-[16px] leading-[21px] text-[var(--uc-text)]">
          {blocking
            ? "Please review your MiFID answers so we can check which portfolios remain suitable for you."
            : "As a moderate risk investor, you are willing to accept periods of market volatility in exchange for the possibility of returns that can outpace inflation over the long term."}
        </p>
      </div>
      {blocking ? (
        <div className="mt-[24px]">
          <button type="button" className="uc-type-p1 text-left font-bold text-[var(--uc-action)]">
            Update investor profile
          </button>
        </div>
      ) : null}
    </RoboScreen>
  );
}

function AllocationBars({ allocation }: { allocation: RoboStrategy["allocation"] }) {
  return (
    <div className="space-y-[14px]">
      {allocation.map((item) => (
        <div key={item.label}>
          <div className="mb-[6px] flex justify-between">
            <span className="uc-type-n4 text-[var(--uc-text)]">{item.label}</span>
            <span className="uc-type-n5-strong text-[var(--uc-text)]">{item.percent}%</span>
          </div>
          <div className="h-[10px] overflow-hidden rounded-full border border-[var(--uc-text-subtle)] bg-[var(--uc-surface-muted)]">
            <div className="h-full rounded-full bg-[var(--uc-action)]" style={{ width: `${item.percent}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function StrategyCard({
  strategy,
  selected,
  onSelect,
  onProjection,
  dragHandlers,
}: {
  strategy: RoboStrategy;
  selected: boolean;
  onSelect: () => void;
  onProjection: () => void;
  dragHandlers: DragCarouselHandlers;
}) {
  return (
    <article
      {...dragHandlers}
      className={cn(
        "w-[299px] shrink-0 snap-start rounded-[8px] border bg-[var(--uc-surface)] p-[15px]",
        selected ? "border-[2px] border-[var(--uc-action)]" : "border-[var(--uc-text)]",
      )}
    >
      <button {...dragHandlers} type="button" onClick={onSelect} className="w-full text-left" aria-label={`Choose ${strategy.name}`}>
        <h2 className={cn("uc-type-h2", selected ? "text-[var(--uc-action)]" : "text-[var(--uc-text)]")}>{strategy.name}</h2>
        <p className="uc-type-n5 mt-[7px] min-h-[51px] leading-[17px] text-[var(--uc-text)]">{strategy.description}</p>
        <div className="mt-[18px]">
          <AllocationBars allocation={strategy.allocation} />
        </div>
      </button>
      <button
        {...dragHandlers}
        type="button"
        aria-label={`See projection for ${strategy.name}`}
        onClick={onProjection}
        className="mt-[22px] w-full py-[8px] text-center uc-type-n4-strong uppercase text-[var(--uc-action)]"
      >
        See projection
      </button>
    </article>
  );
}

const PROJECTION_RATES: Record<RoboStrategy["id"], readonly [number, number, number]> = {
  "sustainable-balanced": [1, 4.2, 6.5],
  "balanced-core": [0.8, 3.8, 6],
  "steady-income": [0.5, 2.6, 4.5],
};

function calculateProjectedValue(initial: number, monthly: number, years: number, annualRate: number): number {
  const months = Math.max(1, years * 12);
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return initial + monthly * months;
  const growth = (1 + monthlyRate) ** months;
  return initial * growth + monthly * ((growth - 1) / monthlyRate);
}

function projectionPath(values: readonly number[], maxValue: number): string {
  const endValue = values.at(-1) ?? 0;
  const endY = 168 - (endValue / maxValue) * 148;
  const middleY = 168 - (168 - endY) * 0.38;
  return `M 54 168 C 112 166, 184 ${middleY}, 244 ${endY}`;
}

function ProjectionChart({
  strategy,
  initial = 50000,
  monthly = 2000,
  years = 10,
}: {
  strategy: RoboStrategy;
  initial?: number;
  monthly?: number;
  years?: number;
}) {
  const rates = PROJECTION_RATES[strategy.id];
  const pointsByScenario = rates.map((rate) =>
    Array.from({ length: 6 }, (_, index) =>
      calculateProjectedValue(initial, monthly, (years * index) / 5, rate),
    ),
  );
  const values = pointsByScenario.map((points) => Math.round(points.at(-1) ?? 0));
  const maxValue = Math.max(50000, Math.ceil(Math.max(...values) / 50000) * 50000);
  const tickYears = Array.from({ length: 6 }, (_, index) => 2025 + Math.round((years * index) / 5));
  const scenarios = [
    { label: "Lower", color: "var(--uc-robo-scenario-lower)", fill: "var(--uc-robo-scenario-lower-fill)", value: values[0]!, points: pointsByScenario[0]! },
    { label: "Estimated", color: "var(--uc-robo-scenario-estimated)", fill: "var(--uc-robo-scenario-estimated-fill)", value: values[1]!, points: pointsByScenario[1]! },
    { label: "Higher", color: "var(--uc-robo-scenario-higher)", fill: "var(--uc-robo-scenario-higher-fill)", value: values[2]!, points: pointsByScenario[2]! },
  ] as const;

  return (
    <div>
      <p className="uc-type-n4-strong uppercase text-[var(--uc-text)]">Estimated annual return</p>
      <div className="mt-[14px] space-y-[14px] rounded-[8px] border border-[var(--uc-text-subtle)] p-[14px]">
        {[...scenarios].reverse().map((scenario, index) => (
          <div key={scenario.label} className="flex items-center gap-[10px]">
            <span className="size-[12px] rounded-[4px]" style={{ backgroundColor: scenario.color }} />
            <span className="uc-type-n4 flex-1 text-[var(--uc-text)]">{scenario.label} scenario</span>
            <span className="uc-type-n4-strong text-[var(--uc-text)]">{[rates[2], rates[1], rates[0]][index]}% p.a.</span>
          </div>
        ))}
      </div>
      <p className="uc-type-n4-strong mt-[28px] uppercase text-[var(--uc-text)]">Projection summary</p>
      <svg
        aria-label={`Projected values after ${years} years: lower ${formatCzkInput(String(values[0]))}, estimated ${formatCzkInput(String(values[1]))}, higher ${formatCzkInput(String(values[2]))}`}
        role="img"
        className="mt-[14px] h-[220px] w-full overflow-visible"
        viewBox="0 0 327 220"
      >
        {[0, 1, 2, 3, 4, 5].map((tick) => {
          const y = 168 - tick * 29.6;
          const tickValue = Math.round((maxValue * tick) / 5);
          return (
            <g key={tick}>
              <line x1="54" x2="244" y1={y} y2={y} stroke="var(--uc-border-muted)" strokeDasharray="4 4" />
              <text x="0" y={y + 4} fontSize="11" fill="var(--uc-text-muted)">
                {tickValue === 0 ? "0" : `${Math.round(tickValue / 1000)}K CZK`}
              </text>
            </g>
          );
        })}
        <path
          d={`${projectionPath(pointsByScenario[2]!, maxValue)} L 244 168 L 54 168 Z`}
          fill="var(--uc-robo-scenario-higher-fill)"
          opacity="0.8"
        />
        <path
          d={`${projectionPath(pointsByScenario[1]!, maxValue)} L 244 168 L 54 168 Z`}
          fill="var(--uc-robo-scenario-estimated-fill)"
          opacity="0.9"
        />
        <path
          d={`${projectionPath(pointsByScenario[0]!, maxValue)} L 244 168 L 54 168 Z`}
          fill="var(--uc-robo-scenario-lower-fill)"
          opacity="0.95"
        />
        {scenarios.map((scenario) => {
          const endY = 168 - (scenario.value / maxValue) * 148;
          return (
            <g key={scenario.label}>
              <path d={projectionPath(scenario.points, maxValue)} fill="none" stroke={scenario.color} strokeWidth="2" />
              <circle cx="244" cy={endY} r="4" fill={scenario.color} />
              <rect x="252" y={endY - 11} width="74" height="22" rx="8" fill={scenario.fill} stroke={scenario.color} strokeWidth="0.5" />
              <text x="258" y={endY + 4} fontSize="10.5" fontWeight="700" fill={scenario.color}>
                {`${Math.round(scenario.value / 100) / 10}K CZK`}
              </text>
            </g>
          );
        })}
        {tickYears.map((year, index) => (
          <text key={`${year}-${index}`} x={54 + index * 38} y="202" textAnchor="middle" fontSize="11" fill="var(--uc-text-muted)">
            {year}
          </text>
        ))}
      </svg>
    </div>
  );
}

function ProjectionAmountControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: string) => void;
}) {
  const progress = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-center justify-between gap-[16px]">
        <label htmlFor={`projection-${label}`} className="uc-type-n4-strong uppercase text-[var(--uc-text)]">{label}</label>
        <output className="min-w-[111px] rounded-[8px] border border-[var(--uc-text-subtle)] px-[10px] py-[5px] text-right text-[18px] font-bold leading-[24px] text-[var(--uc-text)]">
          {formatCzkInput(String(value))}
        </output>
      </div>
      <input
        id={`projection-${label}`}
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-[12px] h-[20px] w-full cursor-pointer accent-[var(--uc-action)]"
        style={{
          background: `linear-gradient(to right, var(--uc-action) 0%, var(--uc-action) ${progress}%, var(--uc-surface-muted) ${progress}%, var(--uc-surface-muted) 100%)`,
        }}
      />
      <div className="mt-[4px] flex justify-between text-[11px] leading-[14px] text-[var(--uc-text-muted)]">
        <span>{formatCzkInput(String(min))}</span>
        <span>{formatCzkInput(String(max))}</span>
      </div>
    </div>
  );
}

function PortfolioProductLogo({ product }: { product: RoboPortfolioProduct }) {
  if (product.logo === "amundi") {
    return <img src={amundiLogo} alt="Amundi Asset Management" className="size-[32px] shrink-0 object-cover" draggable={false} />;
  }
  if (product.logo === "unicredit") {
    return <BrandLogo logoId="unicredit" label={product.name} size={32} />;
  }
  if (product.logo === "apple") {
    return (
      <span role="img" aria-label="Apple" className="grid size-[32px] shrink-0 place-items-center text-[var(--uc-static-black)]">
        <svg aria-hidden="true" className="size-[25px]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.15 6.9c-.95 0-2.42-1.08-3.96-1.04-2.04.03-3.91 1.18-4.96 3.01-2.12 3.68-.55 9.1 1.52 12.09 1.01 1.45 2.21 3.09 3.79 3.04 1.52-.07 2.09-.99 3.94-.99 1.83 0 2.35.99 3.96.95 1.64-.03 2.68-1.48 3.68-2.95 1.16-1.69 1.64-3.33 1.66-3.42-.04-.01-3.18-1.22-3.22-4.86-.03-3.04 2.48-4.49 2.6-4.56-1.43-2.09-3.62-2.32-4.39-2.38-2-.15-3.68 1.09-4.61 1.09Zm3.38-3.07c.84-1.01 1.4-2.43 1.25-3.83-1.21.05-2.66.8-3.53 1.82-.78.9-1.45 2.34-1.27 3.71 1.34.11 2.72-.68 3.55-1.7Z" />
        </svg>
      </span>
    );
  }
  if (product.logo === "tesla") {
    return (
      <span
        role="img"
        aria-label="Tesla"
        className="grid size-[32px] shrink-0 place-items-center text-[var(--uc-brand-tesla)]"
      >
        <svg aria-hidden="true" className="h-[25px] w-[27px]" viewBox="0 0 32 32" fill="currentColor">
          <path d="M16 29 13.8 12.2c-2.1 0-4.2.4-6.1 1.2 1.8-2.6 4.7-4.3 8.3-4.3s6.5 1.7 8.3 4.3c-1.9-.8-4-1.2-6.1-1.2L16 29ZM5.2 10.3C8.3 6.9 12 5.4 16 5.4s7.7 1.5 10.8 4.9c.5-.8.9-1.7 1.2-2.6C24.6 4.8 20.5 3 16 3S7.4 4.8 4 7.7c.3.9.7 1.8 1.2 2.6Z" />
        </svg>
      </span>
    );
  }
  return (
    <span role="img" aria-label="Microsoft" className="grid size-[32px] shrink-0 grid-cols-2 gap-[1px] p-[4px]">
      <span className="bg-[var(--uc-brand-microsoft-red)]" />
      <span className="bg-[var(--uc-brand-microsoft-green)]" />
      <span className="bg-[var(--uc-brand-microsoft-blue)]" />
      <span className="bg-[var(--uc-brand-microsoft-yellow)]" />
    </span>
  );
}

function PortfolioDetails({
  portfolio,
  strategy,
  horizonYears,
  onSelect,
}: {
  portfolio: RoboPortfolio;
  strategy: RoboStrategy;
  horizonYears: number;
  onSelect: () => void;
}) {
  const presentation = ROBO_PORTFOLIO_PRESENTATIONS[strategy.id];
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  return (
    <article className="pb-[8px]">
      <h2 className="text-[22px] font-bold leading-[28px] text-[var(--uc-text)]">{presentation.shortName}</h2>
      <p className="mt-[8px] text-[16px] leading-[21px] text-[var(--uc-text)]">
        Matches your Moderate profile · {horizonYears}+ year horizon · Illustrative return: {strategy.illustrativeReturn}
      </p>
      <span className="mt-[12px] inline-flex rounded-full bg-[var(--uc-green-olive)] px-[12px] py-[5px] text-[14px] font-bold leading-[18px] text-[var(--uc-text-inverse)]">
        {portfolio.minimumLabel}
      </span>
      <p className="mt-[28px] text-[16px] font-bold uppercase leading-[20px] text-[var(--uc-text)]">Portfolio holdings</p>

      <div className="mt-[18px] space-y-[26px]">
        {presentation.assetGroups.map((group) => {
          const isExpanded = expandedGroup === group.label;
          const visibleProducts = isExpanded ? group.products : group.products.slice(0, group.initiallyVisible);
          const canExpand = group.products.length > group.initiallyVisible;
          return (
            <section key={group.label} aria-label={`${group.label} ${group.percent}%`}>
              <div className="flex items-center justify-between text-[16px] leading-[20px]">
                <h3 className="font-bold text-[var(--uc-text)]">{group.label}</h3>
                <span className="text-[var(--uc-text)]">{group.percent}%</span>
              </div>
              <div className="mt-[8px] h-[9px] overflow-hidden rounded-full border border-[var(--uc-text-subtle)] bg-[var(--uc-surface-muted)]">
                <div className="h-full rounded-full bg-[var(--uc-action)]" style={{ width: `${group.percent}%` }} />
              </div>
              <div className="mt-[10px]">
                {visibleProducts.map((product) => (
                  <div key={product.name} className="flex min-h-[54px] items-center gap-[12px] py-[7px]">
                    <PortfolioProductLogo product={product} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-bold leading-[18px] text-[var(--uc-text)]">{product.name}</p>
                      <p className="mt-[2px] text-[13px] leading-[16px] text-[var(--uc-text-muted)]">{product.currency}</p>
                    </div>
                    <span className="shrink-0 text-[14px] leading-[18px] text-[var(--uc-text)]">{product.percent}%</span>
                  </div>
                ))}
              </div>
              {canExpand ? (
                <button
                  type="button"
                  aria-label={`${isExpanded ? "See less" : "See more"} ${group.label.toLowerCase()} products`}
                  aria-expanded={isExpanded}
                  onClick={() => setExpandedGroup(isExpanded ? null : group.label)}
                  className="mx-auto mt-[5px] flex items-center gap-[4px] py-[7px] text-[14px] font-bold uppercase leading-[18px] text-[var(--uc-action)]"
                >
                  {isExpanded ? "See less" : "See more"}
                  <span className={cn("transition-transform", isExpanded ? "rotate-180" : null)}>
                    <AppIcon name="chevron-down" size={15} color="var(--uc-action)" />
                  </span>
                </button>
              ) : null}
            </section>
          );
        })}
      </div>
      <div className="mt-[30px]">
        <PrimaryButton labelSize="18" className="!w-full" onClick={onSelect}>Choose {presentation.shortName}</PrimaryButton>
      </div>
    </article>
  );
}

function ReviewDocuments() {
  const [open, setOpen] = useState(true);
  return (
    <section className="mt-[28px]">
      <SectionHeadingDivider title="Documents and account terms" />
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="mt-[8px] flex h-[64px] w-full items-center gap-[14px] text-left"
      >
        <AppIcon name="investment-documents" color={open ? "var(--uc-action)" : "var(--uc-text)"} />
        <span className={cn("uc-type-n4-strong flex-1 uppercase", open ? "text-[var(--uc-action)]" : "text-[var(--uc-text)]")}>Documents</span>
        <span className={cn("transition-transform", open ? "rotate-180" : null)}>
          <AppIcon name="chevron-down" size={16} />
        </span>
      </button>
      {open ? (
        <div>
          {ROBO_DOCUMENTS.map((document) => (
            <NavigationRow
              key={document.id}
              title={document.title}
              description={document.description}
              trailingAccessory="chevron"
              rowHeight={80}
              className="!px-0"
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

const GOAL_DETAIL_PERIODS = INVESTMENT_PERIODS
  .filter((period) => period.id !== "6m")
  .map((period) => period.id === "max" ? { ...period, label: "MAX" } : period);

const GOAL_ALLOCATION_TABS: readonly InvestmentPortfolioTabOption[] = [
  { id: "product-type", label: "PRODUCTS" },
  { id: "asset-class", label: "ASSET CLASS" },
  { id: "currency", label: "CURRENCY" },
];

function getGoalProductType(groupLabel: string): string {
  if (groupLabel === "Stocks") return "Stock";
  if (groupLabel === "Funds") return "Fund";
  if (groupLabel === "Bonds") return "Bond";
  return groupLabel;
}

function GoalDetail({
  goalName,
  targetAmount,
  portfolio,
  existingGoal,
  onBack,
  onClose,
  onAction,
  onOpenSecurity,
}: {
  goalName: string;
  targetAmount: string;
  portfolio: RoboPortfolio;
  existingGoal?: RoboExistingGoal;
  onBack: () => void;
  onClose: () => void;
  onAction: (mode: ManagementMode) => void;
  onOpenSecurity?: (selection: {
    securityId: string;
    localValue: number;
    performancePercent: number;
  }) => void;
}) {
  const currentValue = existingGoal
    ? Number(existingGoal.currentInteger.replace(/\s/g, ""))
      + Number(existingGoal.currentDecimals.replace(/[^\d]/g, "")) / 100
    : 79800;
  const resolvedGoalName = existingGoal?.name ?? (goalName || "My investment goal");
  const resolvedPurpose = existingGoal?.purpose ?? "General build-up wealth";
  const resolvedStatus = existingGoal ? existingGoal.status : "ACTIVE";
  const resolvedTarget = existingGoal
    ? `${existingGoal.targetInteger}${existingGoal.targetDecimals}`
    : formatCzkInput(targetAmount);
  const resolvedProgress = existingGoal?.progress ?? 80;
  const resolvedStartDate = existingGoal?.startDate ?? existingGoal?.endDate ?? "15 Feb 2025";
  const resolvedEndDate = existingGoal?.timeLeft ?? existingGoal?.endDate ?? "15 Feb 2035";
  const resolvedReturnTone = existingGoal?.returnTone ?? "negative";
  const resolvedReturnLabel = existingGoal?.returnLabel ?? "-1 100,00 CZK (-1,36%)";
  const [selectedPeriodId, setSelectedPeriodId] = useState<InvestmentPeriodId>("3y");
  const [selectedAllocationTab, setSelectedAllocationTab] = useState<InvestmentPortfolioTabId>("product-type");
  const [selectedSortId, setSelectedSortId] = useState<InvestmentSortId>("max-value");
  const chartPoints = useMemo(
    () => buildInvestmentChartPoints(currentValue, selectedPeriodId),
    [selectedPeriodId],
  );
  const presentation = ROBO_PORTFOLIO_PRESENTATIONS[portfolio.strategyId];
  const productRows = useMemo(() => {
    const rows = presentation.assetGroups.flatMap((group) =>
      group.products.map((product, index) => ({
        product,
        productType: getGoalProductType(group.label),
        value: Math.round((currentValue * product.percent) / 100),
        performance: index === 0 && group === presentation.assetGroups[0] ? -1.8 : 1.8,
      })),
    );
    return [...rows].sort((left, right) => {
      if (selectedSortId === "min-value") return left.value - right.value;
      if (selectedSortId === "max-percent") return right.product.percent - left.product.percent;
      if (selectedSortId === "min-percent") return left.product.percent - right.product.percent;
      return right.value - left.value;
    });
  }, [presentation, selectedSortId]);
  const currencyRows = useMemo(() => {
    const totals = new Map<string, number>();
    productRows.forEach(({ product }) => totals.set(product.currency, (totals.get(product.currency) ?? 0) + product.percent));
    return [...totals.entries()].sort((left, right) => right[1] - left[1]);
  }, [productRows]);

  return (
    <RoboScreen
      title={resolvedGoalName}
      description={resolvedPurpose}
      descriptionTrailing={resolvedStatus ? (
        <span className={cn(
          "shrink-0 rounded-[8px] px-[8px] py-[4px] text-[12px] font-bold leading-[15px] text-[var(--uc-static-white)]",
          resolvedStatus === "ACTIVE"
            ? "bg-[var(--uc-green-olive)]"
            : "bg-[var(--uc-neutral-700)]",
        )}>
          {resolvedStatus}
        </span>
      ) : undefined}
      onBack={onBack}
      onClose={onClose}
      headerAction="help"
      dataScreen="goal-detail"
      descriptionTopClassName="mt-[8px]"
    >
      <div data-testid="robo-goal-detail">
        <p className="uc-type-n5 text-[var(--uc-text-muted)]">Current value</p>
        <p className="mt-[4px] text-[24px] font-bold leading-[26px] text-[var(--uc-text)]">
          {existingGoal?.currentInteger ?? "79 800"}
          <span className="text-[16px] font-normal">{existingGoal?.currentDecimals ?? ",00 CZK"}</span>
        </p>
        <p className={cn(
          "uc-type-n5-strong mt-[4px]",
          resolvedReturnTone === "positive"
            ? "text-[var(--uc-green-olive)]"
            : resolvedReturnTone === "negative"
              ? "text-[var(--uc-status-red)]"
              : "text-[var(--uc-text)]",
        )}>
          {resolvedReturnLabel}
          {resolvedReturnTone === "neutral" ? null : (
            <span className="font-normal text-[var(--uc-text-muted)]"> total return</span>
          )}
        </p>
      </div>

      <div className="mt-[12px]">
        <InvestmentPortfolioChart
          points={chartPoints}
          country="CZ"
          currency="CZK"
          amountsHidden={false}
          compact
        />
        <InvestmentPeriodChips
          periods={GOAL_DETAIL_PERIODS}
          selectedPeriodId={selectedPeriodId}
          onChange={setSelectedPeriodId}
        />
      </div>

      <AccountActionBar
        className="-mx-[8px] mt-[18px] !px-0 !py-[8px]"
        items={[
          { id: "add-money", iconName: "add-money", label: "Add\nmoney", ariaLabel: "Add money", onClick: () => onAction("add-money") },
          { id: "withdraw", iconName: "robo-withdraw", label: "Withdraw\nMoney", ariaLabel: "Withdraw", onClick: () => onAction("withdraw") },
          { id: "history", iconName: "investment-history", label: "History", onClick: () => onAction("history") },
          { id: "settings", iconName: "robo-goal-settings", label: "Goal\nSettings", ariaLabel: "Goal settings", onClick: () => onAction("settings") },
        ]}
      />

      <SectionHeadingDivider title="Goal progress" className="mt-[26px]" />
      <div className="mt-[14px]">
        <div>
          <p className="uc-type-n5 text-[var(--uc-text-muted)]">Target amount</p>
          <p className="uc-type-n4-strong text-[var(--uc-text)]">{resolvedTarget}</p>
        </div>
        <div
          className="relative mt-[10px] pt-[6px]"
          data-testid="goal-detail-progress-bar"
        >
          <div className="h-[10px] overflow-hidden rounded-full border border-[var(--uc-border)] bg-[var(--uc-neutral-200)]">
            <div
              className="h-full rounded-full bg-[var(--uc-action)]"
              style={{ width: `${Math.max(2, resolvedProgress)}%` }}
            />
          </div>
          <span
            className="absolute top-0 -translate-x-full rounded-full bg-[var(--uc-action)] px-[5px] py-[3px] text-[12px] font-bold leading-[14px] text-white"
            data-testid="goal-detail-progress-badge"
            style={{ left: `${Math.max(12, resolvedProgress)}%` }}
          >
            {resolvedProgress}%
          </span>
        </div>
        <div className="mt-[8px] flex justify-between uc-type-n5 text-[var(--uc-text-muted)]">
          <span>{resolvedStartDate}</span><span>{resolvedEndDate}</span>
        </div>
      </div>

      <h2 className="mt-[30px] text-[20px] font-bold leading-[24px] text-[var(--uc-text)]">
        Portfolio allocation
      </h2>
      <div className="-mx-[24px] mt-[18px]">
        <InvestmentPortfolioTabs
          tabs={GOAL_ALLOCATION_TABS}
          selectedTabId={selectedAllocationTab}
          onChange={setSelectedAllocationTab}
        />
        <InvestmentFilterChips
          options={INVESTMENT_SORT_OPTIONS}
          selectedOptionId={selectedSortId}
          onChange={setSelectedSortId}
        />

        {selectedAllocationTab === "product-type" ? (
          <div>
            {productRows.map(({ product, productType, value, performance }) => (
              <button
                key={product.name}
                type="button"
                aria-label={`Open ${product.name} product details`}
                onClick={() => onOpenSecurity?.({
                  securityId: product.securityId,
                  localValue: value,
                  performancePercent: performance,
                })}
                className="flex min-h-[80px] w-full items-start gap-[8px] px-[24px] py-[14px] text-left"
              >
                <PortfolioProductLogo product={product} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-bold leading-[18px] text-[var(--uc-text)]">{product.name}</p>
                  <p className="mt-[3px] text-[14px] leading-[18px] text-[var(--uc-text)]">
                    {product.percent}% · {productType} · {product.currency}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="whitespace-nowrap text-[20px] font-bold leading-[22px] text-[var(--uc-text)]">
                    {value.toLocaleString("cs-CZ")}<span className="text-[14px] font-normal">,00 CZK</span>
                  </p>
                  <p className={cn(
                    "mt-[3px] text-[14px] font-bold leading-[17px]",
                    performance < 0 ? "text-[var(--uc-status-red)]" : "text-[var(--uc-green-olive)]",
                  )}>
                    {performance > 0 ? "+" : ""}{performance.toLocaleString("cs-CZ")}%
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : selectedAllocationTab === "asset-class" ? (
          <div>
            {presentation.assetGroups.map((group) => (
              <div key={group.label} className="flex min-h-[72px] items-center justify-between px-[24px] py-[14px]">
                <div>
                  <p className="text-[14px] font-bold text-[var(--uc-text)]">{group.label}</p>
                  <p className="mt-[3px] text-[14px] text-[var(--uc-text-muted)]">{group.percent}% of portfolio</p>
                </div>
                <p className="text-[20px] font-bold text-[var(--uc-text)]">
                  {Math.round((currentValue * group.percent) / 100).toLocaleString("cs-CZ")}
                  <span className="text-[14px] font-normal">,00 CZK</span>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {currencyRows.map(([currency, percent]) => (
              <div key={currency} className="flex min-h-[72px] items-center justify-between px-[24px] py-[14px]">
                <div>
                  <p className="text-[14px] font-bold text-[var(--uc-text)]">{currency}</p>
                  <p className="mt-[3px] text-[14px] text-[var(--uc-text-muted)]">{percent}% of portfolio</p>
                </div>
                <p className="text-[20px] font-bold text-[var(--uc-text)]">
                  {Math.round((currentValue * percent) / 100).toLocaleString("cs-CZ")}
                  <span className="text-[14px] font-normal">,00 CZK</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </RoboScreen>
  );
}

function ManagementScreen({
  mode,
  goalName,
  onBack,
  onClose,
  onMode,
  onRename,
}: {
  mode: ManagementMode;
  goalName: string;
  onBack: () => void;
  onClose: () => void;
  onMode: (mode: ManagementMode) => void;
  onRename: (name: string) => void;
}) {
  const [amount, setAmount] = useState(mode === "monthly" ? "2000" : "10000");
  const [date, setDate] = useState("1 March 2026");
  const [renameName, setRenameName] = useState(goalName);

  if (mode === "history") {
    return (
      <RoboScreen title="Goal history" description="Transactions and portfolio orders for this goal." onBack={onBack} onClose={onClose} dataScreen="history">
        <div className="grid grid-cols-2 border-b border-[var(--uc-border)]">
          <button className="border-b-[2px] border-[var(--uc-action)] py-[11px] uc-type-n4-strong text-[var(--uc-action)]">Transactions</button>
          <button className="py-[11px] uc-type-n4-strong text-[var(--uc-text-muted)]">Orders</button>
        </div>
        <div className="mt-[10px]">
          <NavigationRow title="Initial investment" description="Completed · 50 000 CZK · 15 Feb 2025" trailingAccessory="chevron" className="!px-0" />
          <NavigationRow title="Monthly investment" description="Completed · 2 000 CZK · 1 Mar 2026" trailingAccessory="chevron" className="!px-0" />
          <NavigationRow title="Portfolio rebalancing" description="Completed · 4 orders · 12 Apr 2026" trailingAccessory="chevron" className="!px-0" />
        </div>
      </RoboScreen>
    );
  }

  if (mode === "settings") {
    return (
      <RoboScreen
        title="Goal settings"
        description="Update how the goal is displayed and tracked. A material change may require a new suitability check."
        onBack={onBack}
        onClose={onClose}
        dataScreen="settings"
      >
        <NavigationRow title="Rename goal" description="Change the name shown in Investments." trailingAccessory="chevron" onClick={() => onMode("rename")} className="!px-0" />
        <NavigationRow title="Change target" description="Update the amount you want to reach." trailingAccessory="chevron" onClick={() => onMode("target")} className="!px-0" />
        <NavigationRow title="Change time horizon" description="Update how long you plan to invest." trailingAccessory="chevron" onClick={() => onMode("horizon")} className="!px-0" />
        <NavigationRow title="Manage monthly investment" description="Change or stop your monthly contribution." trailingAccessory="chevron" onClick={() => onMode("monthly")} className="!px-0" />
        <NavigationRow title="Close goal" description="Available after all holdings are withdrawn." trailingAccessory="chevron" onClick={() => onMode("close")} className="!px-0" />
      </RoboScreen>
    );
  }

  if (mode === "withdraw") {
    return (
      <RoboScreen title="Withdraw money" description="You can withdraw part or all of the goal. The goal remains available until you choose to close it." onBack={onBack} onClose={onClose} dataScreen="withdraw">
        <div className="space-y-[12px]">
          <OptionCard title="Withdraw part" description="Choose an amount of holdings to sell." selected={false} onClick={() => onMode("partial-withdrawal")} />
          <OptionCard title="Withdraw all" description="Sell all holdings in this goal." selected={false} onClick={() => onMode("full-withdrawal")} />
        </div>
        <p className="uc-type-n5 mt-[24px] leading-[17px] text-[var(--uc-text-muted)]">
          Final proceeds depend on execution prices. The value can be lower than the amount shown today.
        </p>
      </RoboScreen>
    );
  }

  if (mode === "full-withdrawal") {
    return (
      <RoboScreen
        title="Withdraw all investments?"
        description="All holdings in this goal will be sold. The final amount may be lower than today’s value."
        onBack={onBack}
        onClose={onClose}
        dataScreen="full-withdrawal"
        footer={<PrimaryButton labelSize="18" onClick={onBack}>Review sale orders</PrimaryButton>}
      >
        <div className="rounded-[8px] bg-[var(--uc-surface-muted)] p-[16px]">
          <p className="uc-type-n5 text-[var(--uc-text-muted)]">Estimated current value</p>
          <p className="uc-type-h2 mt-[5px] text-[var(--uc-text)]">79 800,00 CZK</p>
          <p className="uc-type-n5 mt-[8px] leading-[17px] text-[var(--uc-text-muted)]">This is not a guaranteed withdrawal amount.</p>
        </div>
      </RoboScreen>
    );
  }

  if (mode === "close") {
    return (
      <RoboScreen
        title="Close this goal?"
        description="Closing removes the goal from your active list, but its documents and history remain available."
        onBack={onBack}
        onClose={onClose}
        dataScreen="close-goal"
        footer={<PrimaryButton labelSize="18" disabled>Close goal</PrimaryButton>}
      >
        <p className="uc-type-n4 rounded-[8px] bg-[var(--uc-surface-muted)] p-[16px] leading-[21px] text-[var(--uc-text)]">
          Withdraw all holdings and wait for the sale orders to complete before closing the goal.
        </p>
      </RoboScreen>
    );
  }

  const config = {
    "add-money": {
      title: "Add a one-off investment",
      description: "Choose an amount to add from your linked cash account. We’ll show the portfolio orders before you confirm.",
      label: "Amount to add",
      action: "Review investment",
    },
    monthly: {
      title: "Manage monthly investment",
      description: "Change the amount or next date. Stopping monthly investments will not close your goal or sell existing holdings.",
      label: "Monthly amount",
      action: "Review changes",
    },
    "partial-withdrawal": {
      title: "Choose withdrawal amount",
      description: "Enter the amount to withdraw. Final proceeds depend on the sale price when the orders are executed.",
      label: "Amount to withdraw",
      action: "Review sale orders",
    },
    rename: {
      title: "Rename goal",
      description: "Choose a name that will help you recognize this goal.",
      label: "Goal name",
      action: "Save name",
    },
    target: {
      title: "Change target amount",
      description: "Update the amount you want this goal to reach.",
      label: "Target amount",
      action: "Review change",
    },
    horizon: {
      title: "Change time horizon",
      description: "A material change may require a new suitability check.",
      label: "Time horizon",
      action: "Review change",
    },
  }[mode as Exclude<ManagementMode, "menu" | "withdraw" | "full-withdrawal" | "history" | "settings" | "close">];

  return (
    <RoboScreen
      title={config.title}
      description={config.description}
      onBack={onBack}
      onClose={onClose}
      dataScreen={mode}
      footer={(
        <PrimaryButton
          labelSize="18"
          disabled={mode === "rename" && renameName.trim().length === 0}
          onClick={() => {
            if (mode === "rename") {
              onRename(renameName.trim());
              onMode("menu");
              return;
            }
            onBack();
          }}
        >
          {config.action}
        </PrimaryButton>
      )}
    >
      <TextField
        label={config.label}
        value={mode === "rename" ? renameName : mode === "horizon" ? "10 years" : amount}
        onChange={mode === "rename" ? setRenameName : mode === "horizon" ? () => undefined : setAmount}
        inputMode={mode === "rename" || mode === "horizon" ? "text" : "numeric"}
        suffix={mode === "rename" || mode === "horizon" ? undefined : "CZK"}
      />
      {mode === "monthly" ? (
        <div className="mt-[28px]">
          <TextField label="Next investment date" value={date} onChange={setDate} trailingIconName="calendar-days" />
          <button type="button" className="uc-type-n4-strong mt-[28px] text-[var(--uc-status-red)]">Stop monthly investment</button>
        </div>
      ) : null}
      {mode === "add-money" || mode === "partial-withdrawal" ? (
        <div className="mt-[28px] rounded-[8px] bg-[var(--uc-surface-muted)] p-[14px]">
          <p className="uc-type-n5 text-[var(--uc-text-muted)]">Cash account</p>
          <p className="uc-type-n4-strong mt-[4px] text-[var(--uc-text)]">{cashAccountLabel}</p>
        </div>
      ) : null}
    </RoboScreen>
  );
}

export default function CzFutureRoboAdvisorFlow({
  onBack,
  onExit,
  onOpenSecurity,
  initialGoal,
  onGoalUpdated,
  profileStatus = "valid",
  requiresContactValidation = false,
  availableStrategyCount = 3,
}: CzFutureRoboAdvisorFlowProps) {
  const [flowState, dispatchFlow] = useReducer(
    roboAdvisorFlowReducer,
    initialGoal,
    createRoboAdvisorFlowState,
  );
  const {
    step,
    goalType,
    goalName,
    targetAmount,
    horizonYears,
    manualHorizon,
    fundingMethod,
    initialAmount,
    monthlyContribution,
    startDate,
    selectedStrategyId,
    selectedPortfolio,
    termsAccepted,
    managementMode,
  } = flowState;
  const setStep = (value: CreationStep) => dispatchFlow({ type: "set-field", field: "step", value });
  const setGoalType = (value: string) => dispatchFlow({ type: "set-field", field: "goalType", value });
  const setGoalName = (value: string) => dispatchFlow({ type: "set-field", field: "goalName", value });
  const setTargetAmount = (value: string) => dispatchFlow({ type: "set-field", field: "targetAmount", value });
  const setFundingMethod = (value: RoboFundingMethod | null) => dispatchFlow({ type: "set-field", field: "fundingMethod", value });
  const setInitialAmount = (value: string) => dispatchFlow({ type: "set-field", field: "initialAmount", value });
  const setMonthlyContribution = (value: string) => dispatchFlow({ type: "set-field", field: "monthlyContribution", value });
  const setStartDate = (value: string) => dispatchFlow({ type: "set-field", field: "startDate", value });
  const setSelectedStrategyId = (value: RoboStrategy["id"]) => dispatchFlow({ type: "set-field", field: "selectedStrategyId", value });
  const setSelectedPortfolio = (value: RoboPortfolio | null) => dispatchFlow({ type: "set-field", field: "selectedPortfolio", value });
  const setTermsAccepted = (value: boolean) => dispatchFlow({ type: "set-field", field: "termsAccepted", value });
  const setManagementMode = (value: ManagementMode) => dispatchFlow({ type: "set-field", field: "managementMode", value });
  const strategyCarouselRef = useRef<HTMLDivElement>(null);

  const strategies = useMemo(() => ROBO_STRATEGIES.slice(0, availableStrategyCount), [availableStrategyCount]);
  const selectedStrategy: RoboStrategy =
    strategies.find((strategy) => strategy.id === selectedStrategyId)
    ?? strategies[0]
    ?? DEFAULT_ROBO_STRATEGY;
  const portfolios = getPortfoliosForStrategy(selectedStrategy.id);
  const fundingFields = fundingMethod ? getFundingFieldVisibility(fundingMethod) : null;
  const resolvedHorizon = horizonYears || Number(manualHorizon) || 10;
  const hasHorizonSelection = horizonYears > 0 || Number(manualHorizon) > 0;

  const snapStrategyCarousel = () => {
    const carousel = strategyCarouselRef.current;
    if (!carousel || strategies.length <= 1) return;
    const index = Math.max(0, Math.min(strategies.length - 1, Math.round(carousel.scrollLeft / 315)));
    const left = index * 315;
    if (typeof carousel.scrollTo === "function") carousel.scrollTo({ left, behavior: "smooth" });
    else carousel.scrollLeft = left;
    setSelectedStrategyId(strategies[index]!.id);
  };
  const { isDragging: isStrategyDragging, dragHandlers: strategyDragHandlers } = useDragCarousel({
    carouselRef: strategyCarouselRef,
    enabled: strategies.length > 1,
    onSettle: snapStrategyCarousel,
  });

  useEffect(() => {
    if (step !== "processing") return;
    const timeout = window.setTimeout(() => setStep("success"), 900);
    return () => window.clearTimeout(timeout);
  }, [step]);

  const goBackByStep = () => {
    const destination = getRoboAdvisorBackStep(flowState, requiresContactValidation);
    if (destination) setStep(destination);
    else onBack();
  };

  if (step === "intro") {
    return (
      <IntroScreen
        onExit={onExit}
        onCreate={() => setStep(requiresContactValidation ? "contact" : "profile")}
      />
    );
  }

  if (step === "contact") {
    return <ContactScreen onBack={goBackByStep} onContinue={() => setStep("profile")} onExit={onExit} />;
  }

  if (step === "profile") {
    return (
      <InvestorProfileScreen
        status={profileStatus}
        onBack={goBackByStep}
        onExit={onExit}
        onContinue={() => setStep("goal-type")}
      />
    );
  }

  if (step === "goal-type") {
    return (
      <RoboScreen
        title="Choose your goal"
        description="What would you like this investment to help you achieve?"
        onBack={goBackByStep}
        onClose={onExit}
        dataScreen="goal-type"
        footer={<PrimaryButton labelSize="18" disabled={!goalType} onClick={() => setStep("goal-name")}>Continue</PrimaryButton>}
      >
        <div className="space-y-[12px]">
          {ROBO_GOAL_TYPES.map((type) => (
            <GoalSelectionCard
              key={type.id}
              id={type.id}
              title={type.title}
              selected={goalType === type.title}
              onSelect={() => setGoalType(type.title)}
            />
          ))}
        </div>
      </RoboScreen>
    );
  }

  if (step === "goal-name") {
    return (
      <RoboScreen
        title="Name your goal"
        description="Give your goal a name so you can easily recognize it later."
        onBack={goBackByStep}
        onClose={onExit}
        dataScreen="goal-name"
        footer={<PrimaryButton labelSize="18" disabled={!goalName.trim()} onClick={() => setStep("target")}>Continue</PrimaryButton>}
      >
        <TextField label="Enter your goal name" value={goalName} onChange={setGoalName} helperText="You can change this name later" />
      </RoboScreen>
    );
  }

  if (step === "target") {
    return (
      <RoboScreen
        title="Set your target amount"
        description="Choose the amount you want this goal to reach. Progress can go above 100%, and the target is not a guaranteed outcome."
        onBack={goBackByStep}
        onClose={onExit}
        dataScreen="target"
        footer={<PrimaryButton labelSize="18" disabled={!Number(targetAmount)} onClick={() => setStep("horizon")}>Continue</PrimaryButton>}
      >
        <TextField label="Target amount" value={targetAmount} onChange={setTargetAmount} inputMode="numeric" suffix="CZK" />
        <div className="mt-[20px] grid grid-cols-3 gap-[8px]">
          {["100000", "250000", "500000"].map((amount) => (
            <button
              key={amount}
              type="button"
              aria-pressed={targetAmount === amount}
              onClick={() => setTargetAmount(amount)}
              className={cn(
                "h-[34px] rounded-[4px] border uc-type-n5-strong transition-colors",
                targetAmount === amount
                  ? "border-[var(--uc-action)] bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]"
                  : "border-[var(--uc-text)] bg-[var(--uc-surface)] text-[var(--uc-text)]",
              )}
            >
              {formatCzkInput(amount)}
            </button>
          ))}
        </div>
      </RoboScreen>
    );
  }

  if (step === "horizon") {
    return (
      <RoboScreen
        title="Choose your time horizon"
        description="Choose a period that fits your goal. It guides the recommendation, but your goal will not close automatically."
        onBack={goBackByStep}
        onClose={onExit}
        dataScreen="horizon"
        footer={<PrimaryButton labelSize="18" disabled={!hasHorizonSelection} onClick={() => setStep("funding-method")}>Continue</PrimaryButton>}
      >
        <div role="radiogroup" aria-label="Time horizon" className="space-y-[4px]">
          {[3, 5, 7, 10].map((years) => (
            <button
              key={years}
              type="button"
              role="radio"
              aria-checked={horizonYears === years && !manualHorizon}
              aria-label={`${years} years`}
              onClick={() => {
                dispatchFlow({ type: "select-horizon", years });
              }}
              className="flex h-[56px] w-full items-center gap-[16px] text-left"
            >
              <AppIcon name={horizonYears === years && !manualHorizon ? "radio-selected" : "radio-unselected"} size={24} />
              <span className="text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">{years} YEARS</span>
            </button>
          ))}
          <button
            type="button"
            role="radio"
            aria-checked={manualHorizon.length > 0}
            aria-label="Other time horizon"
            onClick={() => {
              dispatchFlow({ type: "set-manual-horizon", value: manualHorizon || "1" });
            }}
            className="flex h-[56px] w-full items-center gap-[16px] text-left"
          >
            <AppIcon name={manualHorizon.length > 0 ? "radio-selected" : "radio-unselected"} size={24} />
            <span className="text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">OTHER TIME HORIZON</span>
          </button>
        </div>
        {manualHorizon.length > 0 ? <div className="mt-[28px]">
          <TextField
            label="Other horizon"
            value={manualHorizon}
            onChange={(value) => {
              dispatchFlow({ type: "set-manual-horizon", value });
            }}
            inputMode="numeric"
            suffix="years"
          />
        </div> : null}
      </RoboScreen>
    );
  }

  if (step === "funding-method") {
    const options: Array<{ id: RoboFundingMethod; title: string; description: string }> = [
      { id: "one-off", title: "One-off investment", description: "Invest a single amount now." },
      { id: "regular", title: "Regular investment", description: "Build your goal with a monthly amount." },
      { id: "combined", title: "One-off and regular", description: "Start now and continue each month." },
    ];
    return (
      <RoboScreen
        title="Choose how to invest"
        description="Choose one option. You can invest once, monthly, or combine both."
        onBack={goBackByStep}
        onClose={onExit}
        dataScreen="funding-method"
        footer={<PrimaryButton labelSize="18" disabled={!fundingMethod} onClick={() => setStep("funding-setup")}>Continue</PrimaryButton>}
      >
        <div role="radiogroup" aria-label="Investment frequency" className="space-y-[16px]">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={fundingMethod === option.id}
              onClick={() => setFundingMethod(option.id)}
              className="flex min-h-[56px] w-full items-center gap-[16px] py-[8px] text-left"
            >
              <span className="grid size-[32px] shrink-0 place-items-center">
                <AppIcon name={fundingMethod === option.id ? "radio-selected" : "radio-unselected"} size={24} color="var(--uc-text)" />
              </span>
              <span className="min-w-0 flex-1 text-[16px] font-bold uppercase leading-[20px] text-[var(--uc-text)]">
                <span>{option.title}</span>
                <span className="block">{option.description}</span>
              </span>
            </button>
          ))}
        </div>
      </RoboScreen>
    );
  }

  if (step === "funding-setup" && fundingMethod && fundingFields) {
    const canContinue =
      (!fundingFields.initialAmount || Number(initialAmount) > 0)
      && (!fundingFields.monthlyContribution || Number(monthlyContribution) > 0)
      && (!fundingFields.startDate || startDate.trim().length > 0);
    const description = fundingMethod === "one-off"
      ? "Choose how much to invest now and the cash account to use."
      : fundingMethod === "regular"
        ? "Set up your monthly contribution and choose the cash account to use."
        : "Set up an initial investment and a monthly contribution from one cash account.";

    return (
      <RoboScreen
        title="Set up your investment"
        description={description}
        onBack={goBackByStep}
        onClose={onExit}
        dataScreen={`funding-${fundingMethod}`}
        footer={<PrimaryButton labelSize="18" disabled={!canContinue} onClick={() => setStep("strategy")}>Continue</PrimaryButton>}
      >
        <div className="space-y-[28px]">
          {fundingFields.initialAmount ? (
            <div>
              <TextField label="Amount to invest now" value={initialAmount} onChange={setInitialAmount} inputMode="numeric" suffix="CZK" />
              <div className="mt-[16px] grid grid-cols-3 gap-[8px]">
                {["5000", "10000", "100000"].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setInitialAmount(amount)}
                    className={cn(
                      "h-[34px] rounded-[4px] border uc-type-n5-strong",
                      initialAmount === amount
                        ? "border-[var(--uc-action)] bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]"
                        : "border-[var(--uc-text)] text-[var(--uc-text)]",
                    )}
                  >
                    {formatCzkInput(amount)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {fundingFields.monthlyContribution ? (
            <div>
              <TextField label="Monthly contribution" value={monthlyContribution} onChange={setMonthlyContribution} inputMode="numeric" suffix="CZK" />
              <div className="mt-[16px] grid grid-cols-3 gap-[8px]">
                {["500", "1000", "2000"].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    aria-pressed={monthlyContribution === amount}
                    onClick={() => setMonthlyContribution(amount)}
                    className={cn(
                      "h-[34px] rounded-[4px] border text-[14px] font-bold",
                      monthlyContribution === amount
                        ? "border-[var(--uc-action)] bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]"
                        : "border-[var(--uc-text)] bg-[var(--uc-surface)] text-[var(--uc-text)]",
                    )}
                  >
                    {formatCzkInput(amount)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {fundingFields.startDate ? (
            <TextField label="Start date" value={startDate} onChange={setStartDate} trailingIconName="calendar-days" />
          ) : null}
        </div>
        <h2 className="mt-[34px] text-[20px] font-bold leading-[24px] text-[var(--uc-text)]">Choose the account to use</h2>
        <p className="mt-[14px] text-[16px] leading-[21px] text-[var(--uc-text)]">
          We’ll use this account for your first and future investments.
        </p>
        <div className="mt-[18px]">
          <TextField
            label="Cash account"
            value="CZ12345678901234"
            onChange={() => undefined}
            readOnly
            trailingIconName="chevron-down"
            helperText="My account name"
            helperText2="Available balance 50 000,00 CZK"
          />
        </div>
      </RoboScreen>
    );
  }

  if (step === "strategy") {
    return (
      <RoboScreen
        title="Choose a strategy"
        description={`We found ${strategies.length === 1 ? "one strategy" : `${strategies.length} strategies`} that fit your Moderate profile, goal and time horizon. Explore the possible outcomes before you choose.`}
        onBack={goBackByStep}
        onClose={onExit}
        dataScreen="strategy"
        footer={(
          <PrimaryButton
            labelSize="18"
            onClick={() => {
              dispatchFlow({ type: "open-portfolio", from: "strategy" });
            }}
          >
            Continue with {selectedStrategy.name}
          </PrimaryButton>
        )}
      >
        <div
          ref={strategyCarouselRef}
          data-testid="robo-strategy-carousel"
          {...strategyDragHandlers}
          onScroll={(event) => {
            const index = Math.max(0, Math.min(strategies.length - 1, Math.round(event.currentTarget.scrollLeft / 315)));
            setSelectedStrategyId(strategies[index]!.id);
          }}
          className={cn(
            "-mr-[24px] flex touch-pan-y snap-x snap-mandatory gap-[16px] overflow-x-auto pb-[8px] pr-[24px] scrollbar-hide",
            isStrategyDragging ? "cursor-grabbing select-none snap-none" : "cursor-grab",
          )}
        >
          {strategies.map((strategy) => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              selected={selectedStrategy.id === strategy.id}
              onSelect={() => setSelectedStrategyId(strategy.id)}
              onProjection={() => {
                dispatchFlow({ type: "open-projection", strategyId: strategy.id });
              }}
              dragHandlers={strategyDragHandlers}
            />
          ))}
        </div>
        {strategies.length > 1 ? (
          <div className="mt-[14px] flex justify-center gap-[6px]">
            {strategies.map((strategy) => (
              <span key={strategy.id} className={cn("h-[6px] rounded-full", strategy.id === selectedStrategy.id ? "w-[30px] bg-[var(--uc-action)]" : "w-[6px] bg-[var(--uc-text-subtle)]")} />
            ))}
          </div>
        ) : null}
      </RoboScreen>
    );
  }

  if (step === "projection") {
    const projectionInitial = Number(initialAmount) || 50000;
    const projectionMonthly = Number(monthlyContribution) || 2000;
    return (
      <RoboScreen
        title={`Projection for ${selectedStrategy.name}`}
        titleClassName="text-[28px] leading-[32px]"
        description={`Adjust the amount invested now and the monthly contribution to see how your ${selectedStrategy.name} strategy could develop over ${resolvedHorizon} years.`}
        onBack={goBackByStep}
        onClose={onExit}
        dataScreen="projection"
      >
        <ProjectionChart
          strategy={selectedStrategy}
          initial={projectionInitial}
          monthly={projectionMonthly}
          years={resolvedHorizon}
        />
        <div className="mt-[30px] space-y-[30px]">
          <ProjectionAmountControl
            label="Invest now"
            value={projectionInitial}
            min={10000}
            max={1000000}
            step={10000}
            onChange={setInitialAmount}
          />
          <ProjectionAmountControl
            label="Invest monthly"
            value={projectionMonthly}
            min={0}
            max={20000}
            step={500}
            onChange={setMonthlyContribution}
          />
        </div>
        <p className="uc-type-n5 mt-[26px] leading-[17px] text-[var(--uc-text)]">
          These projections are estimates, not a promise of future performance. Actual results and the amount you get back may be lower.
        </p>
        <div className="mt-[30px]">
          <PrimaryButton
            labelSize="18"
            onClick={() => {
              dispatchFlow({ type: "open-portfolio", from: "projection" });
            }}
          >
            See suitable portfolios
          </PrimaryButton>
        </div>
      </RoboScreen>
    );
  }

  if (step === "portfolio") {
    const portfolio = portfolios[0];
    return (
      <RoboScreen
        title="Available portfolios"
        description={`Based on your Moderate investor profile and selected ${resolvedHorizon}-year horizon, these portfolios are suitable for your goal.`}
        onBack={goBackByStep}
        onClose={onExit}
        dataScreen="portfolio"
      >
        <div className="-mx-[24px] flex gap-[8px] overflow-x-auto px-[24px] pb-[4px] scrollbar-hide" aria-label="Portfolio variants">
          {strategies.map((strategy) => {
            const label = ROBO_PORTFOLIO_PRESENTATIONS[strategy.id].shortName;
            const selected = strategy.id === selectedStrategy.id;
            return (
              <button
                key={strategy.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setSelectedStrategyId(strategy.id)}
                className={cn(
                  "h-[36px] shrink-0 rounded-[4px] border-2 px-[18px] text-[14px] font-bold uppercase",
                  selected
                    ? "border-[var(--uc-action)] bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]"
                    : "border-[var(--uc-text)] bg-[var(--uc-surface)] text-[var(--uc-text)]",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
        {portfolio ? (
          <div className="mt-[28px]">
            <PortfolioDetails
              key={portfolio.id}
              portfolio={portfolio}
              strategy={selectedStrategy}
              horizonYears={resolvedHorizon}
              onSelect={() => {
                setSelectedPortfolio(portfolio);
                setStep("review");
              }}
            />
          </div>
        ) : null}
      </RoboScreen>
    );
  }

  if (step === "review" && selectedPortfolio && fundingMethod) {
    const reviewRows = buildRoboReviewRows({
      goalType,
      goalName,
      targetAmount,
      horizonYears: resolvedHorizon,
      fundingMethod,
      initialAmount,
      monthlyContribution,
      startDate,
      cashAccountLabel,
      investorProfileLabel: "Moderate",
      portfolioName: selectedPortfolio.name,
    });
    const goalRows = reviewRows.filter((row) => row.section === "goal");
    const planRows = reviewRows.filter((row) => row.section === "plan");
    const renderRows = (rows: typeof reviewRows) => (
      <div className="space-y-[24px] pt-[18px]">
        {rows.map((row) => (
          <div key={row.label}>
            <p className="uc-type-n5 text-[var(--uc-text-muted)]">{row.label}</p>
            <p className="uc-type-n4-strong mt-[3px] text-[var(--uc-text)]">{row.value}</p>
          </div>
        ))}
      </div>
    );
    return (
      <RoboScreen
        title="Review Data"
        onBack={goBackByStep}
        onClose={onExit}
        dataScreen="review"
        footer={
          <PrimaryButton labelSize="18" disabled={!termsAccepted} onClick={() => setStep("sign")}>
            Continue to sign
          </PrimaryButton>
        }
      >
        <SectionHeadingDivider title="Review your goal" />
        {renderRows(goalRows)}
        <SectionHeadingDivider title="Your investment plan" className="mt-[30px]" />
        {renderRows(planRows)}
        <ReviewDocuments />
        <div className="mt-[26px] flex gap-[10px] rounded-[8px] bg-[var(--uc-surface-muted)] p-[14px]">
          <AppIcon name="investment-disclaimer" size={22} />
          <p className="uc-type-n5 leading-[17px] text-[var(--uc-text)]">
            Investments can fall in value. You may get back less than you invest, and projected outcomes are not guaranteed.
          </p>
        </div>
        <div className="mt-[26px] flex items-center justify-between gap-[16px]">
          <div>
            <p className="uc-type-n4-strong uppercase text-[var(--uc-text)]">Terms & conditions</p>
            <p className="uc-type-n5 mt-[3px] text-[var(--uc-text-muted)]">I have reviewed the goal information and documents.</p>
          </div>
          <ToggleButton ariaLabel="Accept terms and conditions" checked={termsAccepted} onToggle={setTermsAccepted} />
        </div>
      </RoboScreen>
    );
  }

  if (step === "sign") {
    return (
      <StandardSignScreen
        title="Sign goal"
        pinLabel="Security code"
        pinHelper="Confirm securely to create the goal and submit its investment orders."
        actionLabel="Sign goal"
        onBack={goBackByStep}
        onSign={() => setStep("processing")}
      />
    );
  }

  if (step === "processing") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-[var(--uc-surface)] px-[34px] text-center" data-robo-screen="processing">
        <div className="size-[72px] animate-spin rounded-full border-[5px] border-[var(--uc-border)] border-t-[var(--uc-action)]" />
        <h1 className="uc-type-h1 mt-[34px] text-[var(--uc-text)]">We’re setting up your goal</h1>
        <p className="uc-type-n4 mt-[14px] leading-[21px] text-[var(--uc-text)]">
          We’re opening the investment account and sending your portfolio orders. Please keep the app open.
        </p>
      </div>
    );
  }

  if (step === "success") {
    return (
      <StandardSuccessScreen
        title="Your goal is ready"
        body="Your goal has been created and the investment orders were sent. You can track progress and order status from Investments."
        actionLabel="Open goal"
        onDone={() => setStep("goal-detail")}
      />
    );
  }

  if (step === "goal-detail" && selectedPortfolio) {
    if (managementMode !== "menu") {
      return (
        <ManagementScreen
          mode={managementMode}
          goalName={goalName}
          onBack={() => {
            setManagementMode(getPreviousManagementMode(managementMode));
          }}
          onClose={onExit}
          onMode={setManagementMode}
          onRename={(name) => {
            setGoalName(name);
            if (initialGoal) onGoalUpdated?.({ ...initialGoal, name });
          }}
        />
      );
    }
    return (
      <GoalDetail
        goalName={goalName}
        targetAmount={targetAmount}
        portfolio={selectedPortfolio}
        existingGoal={initialGoal}
        onBack={onExit}
        onClose={onExit}
        onAction={setManagementMode}
        onOpenSecurity={onOpenSecurity}
      />
    );
  }

  return null;
}
