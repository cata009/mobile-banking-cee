import { useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import { BottomSheet } from "@/app/components/BottomSheet";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import TextField from "@/app/components/TextField";
import ToggleButton from "@/app/components/ToggleButton";
import NavigationRow from "@/app/components/NavigationRow";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import AccountActionBar from "@/app/components/accounts/AccountActionBar";
import InfoBanner from "@/app/components/cards/InfoBanner";
import InvestmentAccountSelectionSheet from "@/app/components/investments/InvestmentAccountSelectionSheet";
import BrandLogo from "@/app/components/brand-logo/BrandLogo";
import StandardSignScreen from "@/app/components/flow/StandardSignScreen";
import StandardSuccessScreen from "@/app/components/flow/StandardSuccessScreen";
import InvestmentProductCard from "@/app/components/investments/InvestmentProductCard";
import InvestmentBasketFundDetailScreen from "@/app/screens/investments/InvestmentBasketFundDetailScreen";
import InvestmentHistoryRows, { InvestmentHistoryTabs } from "@/app/screens/investments/InvestmentHistoryRows";
import { InvestmentSecurityDetailScreen } from "@/app/screens/investments/InvestmentSecurityScreens";
import { AppIcon, type IconName } from "@/app/components/icons";
import InvestmentFilterChips from "@/app/components/investments/InvestmentFilterChips";
import InvestmentPeriodChips from "@/app/components/investments/InvestmentPeriodChips";
import InvestmentPortfolioChart from "@/app/components/investments/InvestmentPortfolioChart";
import { Calendar } from "@/app/components/ui/calendar";
import LinkButton from "@/app/components/ui/LinkButton";
import { cn } from "@/app/components/ui/utils";
import { formatInvestmentAmountParts, formatInvestmentMoney, formatInvestmentNumber } from "@/app/utils/investmentAmountFormatting";
import type { CountryId } from "@/app/state/demoTypes";
import type { CurrentAccount } from "@/data/products";
import { formatCzLocalAccountNumber } from "@/data/czechDomesticAccount";
import { convertCurrency, getCountryCurrency, roundMoney } from "@/data/exchangeRates";
import {
  INVESTMENT_PERIODS,
  INVESTMENT_SORT_OPTIONS,
  buildInvestmentHistoryOrders,
  buildInvestmentHistoryTransactions,
  buildInvestmentChartPoints,
  type InvestmentPeriodId,
  type InvestmentSortId,
  type InvestmentCatalogSecurity,
} from "@/app/config/investmentsPortfolioConfig";
import { formatInvestmentBasketPerformance, type InvestmentBasketFund, type InvestmentBasketFundHolding } from "@/app/config/investmentBasketFundsConfig";
import introImage from "@/assets/investments/robo-advisor-intro.png";
import amundiLogo from "@/assets/investments/funds/fund-amundi-logo.png";
import { useCollapsingHeader } from "@/hooks/useCollapsingHeader";
import { useDragCarousel, type DragCarouselHandlers } from "@/hooks/useDragCarousel";
import {
  ROBO_DOCUMENTS,
  ROBO_GOAL_TYPES,
  ROBO_PORTFOLIO_PRESENTATIONS,
  ROBO_STRATEGIES,
  calculateRoboGoalProgress,
  buildRoboReviewRows,
  formatCzkInput,
  getRoboGoalNameSuggestions,
  getRoboGoalProgress,
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
  currentAccounts?: readonly CurrentAccount[];
  securityCatalog?: readonly InvestmentCatalogSecurity[];
  country?: CountryId;
  amountsHidden?: boolean;
  onBack: () => void;
  onExit: () => void;
  onOpenSecurity?: (selection: {
    securityId: string;
    productId?: string;
    localValue: number;
    performancePercent: number;
    hideBuyAction?: boolean;
  }) => void;
  initialGoal?: RoboExistingGoal;
  onGoalUpdated?: (goal: RoboExistingGoal) => void;
  profileStatus?: RoboInvestorProfileStatus;
  requiresContactValidation?: boolean;
  availableStrategyCount?: 1 | 2 | 3;
}

interface SelectedBasketHolding {
  basketTitle: string;
  holding: InvestmentBasketFundHolding;
  security: InvestmentCatalogSecurity | null;
}

interface RoboScreenProps {
  title: string;
  description?: string;
  onBack: () => void;
  onClose: () => void;
  headerAction?: "close" | "help" | "none";
  children: ReactNode;
  footer?: ReactNode;
  overlay?: ReactNode;
  dataScreen: string;
  titleClassName?: string;
  descriptionTopClassName?: string;
  contentTopClassName?: string;
}

const defaultCashAccountLabel = "Current ··· 4821";
const DEFAULT_ROBO_CASH_ACCOUNT: CurrentAccount = {
  id: "robo-default-cash",
  type: "current_account",
  name: "My account name",
  accountNumber: "CZ12345678901234",
  balance: 50_000,
  currency: "CZK",
};
const DEFAULT_ROBO_STRATEGY = ROBO_STRATEGIES[0]!;
const ROBO_INVESTOR_PROFILE_LABELS = {
  conservative: "Conservative - V1",
  moderate: "Moderate - V2",
  aggressive: "Aggressive - V3",
} as const;
const ROBO_FUNDING_OPTIONS: readonly { id: RoboFundingMethod; title: string; description: string }[] = [
  { id: "one-off", title: "Invest once", description: "Make a single investment now." },
  { id: "regular", title: "Invest monthly", description: "Choose an amount to contribute each month." },
  { id: "combined", title: "Invest now and monthly", description: "Make an initial investment, then continue with monthly contributions." },
];

function compactRoboAccountNumber(value: string) {
  if (value.length <= 8) return value;
  return `${value.slice(0, 4)} •••• ${value.slice(-4)}`;
}

function displayRoboAccountNumber(value: string, country: CountryId) {
  return country === "CZ" ? formatCzLocalAccountNumber(value) : compactRoboAccountNumber(value);
}

function FundingAmountSuggestion({
  amount,
  value,
  onSelect,
}: {
  amount: string;
  value: string;
  onSelect: (amount: string) => void;
}) {
  const selected = value === amount;
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(amount)}
      className={cn(
        "h-[34px] rounded-[4px] uc-type-n5-strong transition-colors",
        selected
          ? "border border-[var(--uc-action)] bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]"
          : "bg-[var(--uc-neutral-100)] text-[var(--uc-text)]",
      )}
    >
      {formatCzkInput(amount)}
    </button>
  );
}

function RoboScreen({
  title,
  description,
  onBack,
  onClose,
  headerAction = "close",
  children,
  footer,
  overlay,
  dataScreen,
  titleClassName,
  descriptionTopClassName = "mt-[16px]",
  contentTopClassName = "pt-[32px]",
}: RoboScreenProps) {
  const { progress: headerProgress, onScroll: handleScroll } = useCollapsingHeader(64);

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--uc-surface)] text-[var(--uc-text)]"
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
            className={descriptionTopClassName}
            data-testid={dataScreen === "goal-detail" ? "robo-goal-detail-meta" : undefined}
          >
            <p className="text-[16px] leading-[21px] text-[var(--uc-text)]">{description}</p>
          </div>
        ) : null}
        <div className={contentTopClassName}>{children}</div>
      </main>
      {footer ? <footer className="shrink-0 px-[24px] pb-[34px] pt-[12px]">{footer}</footer> : null}
      {overlay}
    </div>
  );
}

interface GoalPlanFieldsProps {
  targetAmount: string;
  onTargetAmountChange: (value: string) => void;
  horizonYears: number;
  manualHorizon: string;
  onSelectHorizon: (years: number) => void;
  onManualHorizonChange: (value: string) => void;
}

function isValidRoboHorizon(value: string): boolean {
  const years = Number(value);
  return Number.isInteger(years) && years >= 3 && years <= 15;
}

function GoalPlanFields({
  targetAmount,
  onTargetAmountChange,
  horizonYears,
  manualHorizon,
  onSelectHorizon,
  onManualHorizonChange,
}: GoalPlanFieldsProps) {
  return (
    <>
      <TextField
        label="Target amount"
        value={targetAmount}
        onChange={onTargetAmountChange}
        inputMode="numeric"
        suffix="CZK"
        suffixOutsideDivider
        suffixClassName="!font-bold"
      />
      <div className="mt-[12px] grid grid-cols-3 gap-[8px]" role="group" aria-label="Suggested target amounts">
        {["100000", "250000", "500000"].map((amount) => (
          <button
            key={amount}
            type="button"
            aria-pressed={targetAmount === amount}
            onClick={() => onTargetAmountChange(amount)}
            className={cn(
              "h-[34px] rounded-[4px] uc-type-n5-strong transition-colors",
              targetAmount === amount
                ? "border border-[var(--uc-action)] bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]"
                : "bg-[var(--uc-neutral-100)] text-[var(--uc-text)]",
            )}
          >
            {formatCzkInput(amount)}
          </button>
        ))}
      </div>
      <section className="mt-[20px]" aria-label="Time horizon">
        <h2 className="text-[20px] font-bold leading-[24px] text-[var(--uc-text)]">Choose your time horizon</h2>
        <p className="mt-[10px] text-[16px] leading-[21px] text-[var(--uc-text)]">
          Choose a period that fits your goal. It guides the recommendation, but your goal will not close automatically.
        </p>
        <div role="radiogroup" aria-label="Time horizon" className="mt-[10px] grid grid-cols-2 gap-x-[12px] gap-y-[4px]">
          {[3, 5, 7, 10].map((years) => {
            const selected = horizonYears === years && !manualHorizon;
            return (
              <button
                key={years}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={`${years} years`}
                onClick={() => onSelectHorizon(years)}
                className="flex min-h-[48px] w-full items-center gap-[12px] text-left"
              >
                <AppIcon name={selected ? "radio-selected" : "radio-unselected"} size={24} />
                <span className="text-[14px] font-bold leading-[18px]">{years} YEARS</span>
              </button>
            );
          })}
          <button
            type="button"
            role="radio"
            aria-checked={manualHorizon.length > 0}
            aria-label="Other time horizon"
            onClick={() => onManualHorizonChange(manualHorizon || "3")}
            className="col-span-2 flex min-h-[48px] w-full items-center gap-[12px] text-left"
          >
            <AppIcon name={manualHorizon.length > 0 ? "radio-selected" : "radio-unselected"} size={24} />
            <span className="text-[14px] font-bold leading-[18px]">OTHER TIME HORIZON</span>
          </button>
        </div>
        {manualHorizon.length > 0 ? (
          <div className="mt-[12px]">
            <TextField
              label="Other time horizon (years)"
              value={manualHorizon}
              onChange={(value) => onManualHorizonChange(value.replace(/\D/g, "").slice(0, 2))}
              inputMode="numeric"
              helperText="Select between 3 and 15 years"
              errorText={manualHorizon.length > 0 && !isValidRoboHorizon(manualHorizon)
                ? "Enter a whole number from 3 to 15 years."
                : undefined}
            />
          </div>
        ) : null}
      </section>
    </>
  );
}

function GoalPlanScreen({
  dataScreen,
  targetAmount,
  onTargetAmountChange,
  horizonYears,
  manualHorizon,
  onSelectHorizon,
  onManualHorizonChange,
  onBack,
  onClose,
  onContinue,
  continueLabel = "Continue",
}: GoalPlanFieldsProps & {
  dataScreen: string;
  onBack: () => void;
  onClose: () => void;
  onContinue: (years: number) => void;
  continueLabel?: string;
}) {
  const hasHorizonSelection = horizonYears > 0 || isValidRoboHorizon(manualHorizon);
  const selectedHorizon = horizonYears || Number(manualHorizon) || 10;

  return (
    <RoboScreen
      title="Set your goal plan"
      description="Choose a target amount and time horizon to shape your investment recommendation."
      onBack={onBack}
      onClose={onClose}
      headerAction="none"
      dataScreen={dataScreen}
      contentTopClassName="pt-[20px]"
      footer={(
        <PrimaryButton
          labelSize="18"
          disabled={!Number(targetAmount) || !hasHorizonSelection}
          onClick={() => onContinue(selectedHorizon)}
        >
          {continueLabel}
        </PrimaryButton>
      )}
    >
      <GoalPlanFields
        targetAmount={targetAmount}
        onTargetAmountChange={onTargetAmountChange}
        horizonYears={horizonYears}
        manualHorizon={manualHorizon}
        onSelectHorizon={onSelectHorizon}
        onManualHorizonChange={onManualHorizonChange}
      />
    </RoboScreen>
  );
}

function formatRoboCalendarDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function parseRoboCalendarDate(value: string): Date {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date();
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function formatRoboGoalDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function getRoboGoalEndDate(goal: RoboExistingGoal, horizonYears: number): string {
  const date = parseRoboCalendarDate(goal.startDate ?? goal.endDate);
  date.setFullYear(date.getFullYear() + (goal.startDate ? horizonYears : horizonYears - goal.horizonYears));
  return formatRoboGoalDate(date);
}

function getRoboGoalEndDateFromStart(startDate: string, horizonYears: number): string {
  const date = parseRoboCalendarDate(startDate);
  date.setFullYear(date.getFullYear() + horizonYears);
  return formatRoboGoalDate(date);
}

interface RoboWithdrawalProduct {
  id: string;
  name: string;
  percent: number;
  localValue: number;
  security: InvestmentCatalogSecurity | null;
}

function getRoboWithdrawalProducts(
  portfolio: RoboPortfolio,
  currentValue: number,
  country: CountryId,
  securityCatalog: readonly InvestmentCatalogSecurity[],
): RoboWithdrawalProduct[] {
  const basketHoldings = portfolio.basketFund?.holdings ?? [];
  const basketProducts = basketHoldings.map((holding, index) => ({
      id: holding.productId ?? `${portfolio.id}-holding-${index}`,
      name: holding.title,
      percent: holding.percent ?? 100 / basketHoldings.length,
  }));

  const presentationProducts = ROBO_PORTFOLIO_PRESENTATIONS[portfolio.strategyId].assetGroups.flatMap((group) =>
    group.products.map((product) => ({
      id: product.securityId,
      name: product.name,
      percent: product.percent,
    })),
  );
  const products = basketProducts.length > 0 ? basketProducts : presentationProducts.length > 0
    ? presentationProducts
    : portfolio.holdings.map((holding, index) => ({
    id: `${portfolio.id}-holding-${index}`,
    name: holding.name,
    percent: holding.percent,
  }));
  const localCurrency = getCountryCurrency(country) as InvestmentCatalogSecurity["localCurrency"];

  return products.map((product) => {
    const sourceSecurity = securityCatalog.find((security) => (
      security.id === product.id
      || security.productId === product.id
      || security.title.trim().toLocaleLowerCase() === product.name.trim().toLocaleLowerCase()
    )) ?? null;
    const localValue = roundMoney((currentValue * product.percent) / 100);
    const value = sourceSecurity
      ? roundMoney(convertCurrency(localValue, localCurrency, sourceSecurity.instrumentCurrency))
      : localValue;
    const security: InvestmentCatalogSecurity | null = sourceSecurity ? {
      ...sourceSecurity,
      title: product.name,
      value,
      currency: sourceSecurity.instrumentCurrency,
      localValue,
      localCurrency,
      quantity: Number((value / sourceSecurity.marketPrice).toFixed(6)),
      performanceAmount: roundMoney((localValue * sourceSecurity.performancePercent) / 100),
    } : null;

    return { ...product, localValue, security };
  });
}

function getRoboGoalCurrentValue(goal?: RoboExistingGoal): number {
  return goal
    ? Number(goal.currentInteger.replace(/\s/g, ""))
      + Number(goal.currentDecimals.replace(/[^\d]/g, "")) / 100
    : 79800;
}

const GOAL_ICONS: Record<(typeof ROBO_GOAL_TYPES)[number]["id"], IconName> = {
  "build-wealth": "robo-goal-wealth",
  "unforeseen-circumstances": "robo-goal-unforeseen",
  "major-purchase": "robo-goal-purchase",
  retirement: "robo-goal-retirement",
};

function GoalSelectionCard({
  id,
  title,
  description,
  selected,
  onSelect,
}: {
  id: (typeof ROBO_GOAL_TYPES)[number]["id"];
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={`${title}. ${description}`}
      onClick={onSelect}
      className="flex w-full items-center gap-[12px] rounded-[5px] border border-[var(--uc-text)] px-[16px] py-[12px] text-left"
    >
      <span className="grid size-[24px] shrink-0 place-items-center text-[var(--uc-text)]">
        <AppIcon name={GOAL_ICONS[id]} size={24} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">{title}</span>
        <span className="mt-[4px] block text-[14px] leading-[18px] text-[var(--uc-text)]">{description}</span>
      </span>
      <span className="grid size-[24px] shrink-0 place-items-center">
        <AppIcon name={selected ? "radio-selected" : "radio-unselected"} size={24} color="var(--uc-text)" />
      </span>
    </button>
  );
}

function IntroScreen({ onCreate, onExit }: { onCreate: () => void; onExit: () => void }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[var(--uc-surface)]" data-robo-screen="intro">
      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        <div className="pointer-events-none sticky top-[calc(var(--uc-phone-top-reserve,54px)+4px)] z-20 -mb-[40px] flex h-[40px] justify-end px-[8px]">
          <button
            type="button"
            aria-label="Close"
            onClick={onExit}
            className="pointer-events-auto grid size-[40px] place-items-center"
          >
            <AppIcon name="close-flow" color="var(--uc-text)" size={20} />
          </button>
        </div>
        <div className="relative h-[400px] shrink-0 overflow-hidden bg-[var(--uc-app-bg)]">
          <img src={introImage} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="px-[24px] pb-[24px] pt-[20px]">
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
        </div>
      </main>
      <footer className="shrink-0 px-[24px] pb-[34px] pt-[12px]">
        <PrimaryButton labelSize="18" onClick={onCreate}>Create Goal</PrimaryButton>
      </footer>
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
          : `Your answers indicate a ${ROBO_INVESTOR_PROFILE_LABELS.moderate} investor profile. We’ll use it together with your goal and time horizon when checking suitable portfolios.`
      }
      onBack={onBack}
      onClose={onExit}
      dataScreen="profile"
      footer={!blocking ? <PrimaryButton labelSize="18" onClick={onContinue}>Continue</PrimaryButton> : undefined}
    >
      <div className="rounded-[4px] bg-[var(--uc-surface-muted)] py-[16px] pl-[24px] pr-[12px]">
        <p className="text-[20px] font-bold leading-[24px] text-[var(--uc-text)]">
          {blocking ? "Profile update needed" : ROBO_INVESTOR_PROFILE_LABELS.moderate}
        </p>
        <p className="mt-[12px] text-[16px] leading-[21px] text-[var(--uc-text)]">
          {blocking
            ? "Please review your MiFID answers so we can check which portfolios remain suitable for you."
            : "As a moderate risk investor you are willing to accept periods of market volatility in exchange for the possibility of receiving returns that will outpace inflation by a significant margin in the long run."}
        </p>
      </div>
      {blocking ? (
        <div className="mt-[24px]">
          <button type="button" className="uc-type-p1 text-left font-bold text-[var(--uc-action)]">
            Update investor profile
          </button>
        </div>
      ) : (
        <InfoBanner
          title="Update your investor profile"
          description="Review the MiFID questions so your recommendation reflects your current situation."
          actionLabel="UPDATE NOW"
          actionIconName="chevron-link"
          actionIconSize={24}
          className="mt-[24px] w-full rounded-[4px]"
        />
      )}
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

function getCarouselGeometry(carousel: HTMLElement) {
  const firstCard = carousel.firstElementChild as HTMLElement | null;
  const secondCard = firstCard?.nextElementSibling as HTMLElement | null;
  const cardWidth = firstCard?.offsetWidth || 299;
  const measuredStep = firstCard && secondCard ? secondCard.offsetLeft - firstCard.offsetLeft : 0;
  const step = measuredStep > 0 ? measuredStep : cardWidth + 16;
  const centerInset = Math.max(0, (carousel.clientWidth - cardWidth) / 2);
  return { step, centerInset };
}

function getCarouselSelectedIndex(carousel: HTMLElement, itemCount: number) {
  if (itemCount <= 1) return 0;
  const { step, centerInset } = getCarouselGeometry(carousel);
  return Math.max(0, Math.min(itemCount - 1, Math.round((carousel.scrollLeft + centerInset) / step)));
}

function getCarouselScrollLeft(carousel: HTMLElement, index: number, itemCount: number) {
  const { step, centerInset } = getCarouselGeometry(carousel);
  const safeIndex = Math.max(0, Math.min(Math.max(0, itemCount - 1), index));
  const maxScrollLeft = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
  return Math.max(0, Math.min(maxScrollLeft, safeIndex * step - centerInset));
}

function BasketPortfolioCard({
  portfolio,
  selected,
  onSelect,
  onDetails,
  dragHandlers,
}: {
  portfolio: RoboPortfolio;
  selected: boolean;
  onSelect: () => void;
  onDetails: () => void;
  dragHandlers: DragCarouselHandlers;
}) {
  const basket = portfolio.basketFund!;
  const performancePercent = basket.performancePercent;

  return (
    <article
      {...dragHandlers}
      className={cn(
        "w-[299px] shrink-0 snap-center rounded-[8px] border bg-[var(--uc-surface)] p-[15px]",
        selected ? "border-[2px] border-[var(--uc-action)]" : "border-[var(--uc-border-muted)]",
      )}
    >
      <button
        {...dragHandlers}
        type="button"
        role="radio"
        aria-checked={selected}
        aria-label={`Choose ${basket.title}${performancePercent !== undefined ? `, 1-year performance ${formatInvestmentBasketPerformance(performancePercent)}` : ""}`}
        onClick={onSelect}
        className="w-full text-left"
      >
        <div className="flex items-center gap-[10px]">
          <BrandLogo logoId={basket.logoId} size={32} />
          <h2 className={cn("min-w-0 flex-1 uc-type-h2 line-clamp-2 min-h-[48px] whitespace-pre-line", selected ? "text-[var(--uc-action)]" : "text-[var(--uc-text)]")}>
            {basket.roboCarouselTitle ?? basket.title}
          </h2>
        </div>
        {performancePercent !== undefined ? (
          <div className="mt-[8px]">
            <span className="block text-[26px] font-bold leading-[30px] tabular-nums text-[var(--uc-text)]">
              {formatInvestmentBasketPerformance(performancePercent)}
            </span>
            <span className="mt-[2px] block text-[12px] leading-[16px] text-[var(--uc-text-muted)]">
              Performance · 1 year
            </span>
          </div>
        ) : null}
        <p className="uc-type-n5 mt-[6px] line-clamp-2 min-h-[34px] leading-[17px] text-[var(--uc-text)]">{basket.description}</p>
      </button>
      <LinkButton
        aria-label={`Details for ${basket.title}`}
        onClick={onDetails}
        className="mx-auto mt-0 min-h-[32px]"
      >
        Details
      </LinkButton>
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
  onHoldingClick,
}: {
  portfolio: RoboPortfolio;
  onHoldingClick: (holding: InvestmentBasketFundHolding) => void;
}) {
  const basket = portfolio.basketFund;
  if (!basket) return null;
  const hasDistribution = basket.holdings?.some((holding) => holding.percent !== undefined) ?? false;

  return (
    <section className="pb-[8px]" aria-label="Basket contents" data-robo-basket-details={basket.id}>
      <SectionHeadingDivider
        title={hasDistribution ? "PRODUCTS DISTRIBUTION" : "BASKET CONTENTS"}
        variant="medium-title"
        className="-mx-[24px]"
      />
      {basket.holdings?.length ? (
        <div className="mt-[6px]">
          {basket.holdings.map((holding, index) => (
            <button
              key={holding.productId ?? `${basket.id}-${index}`}
              type="button"
              aria-label={`Open product details for ${holding.title}`}
              data-basket-holding={holding.productId ?? holding.title}
              onClick={() => onHoldingClick(holding)}
              className="flex min-h-[58px] w-full items-center gap-[10px] py-[8px] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--uc-action)]"
            >
              <BrandLogo logoId={basket.logoId} size={32} />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold leading-[18px] text-[var(--uc-text)]">{holding.title}</p>
                {holding.productId ? <p className="mt-[2px] text-[13px] leading-[16px] text-[var(--uc-text-muted)]">{holding.productId}</p> : null}
              </div>
              {holding.percent !== undefined ? <span className="text-[15px] font-bold text-[var(--uc-text)]">{holding.percent}%</span> : null}
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-[10px] text-[16px] leading-[21px] text-[var(--uc-text)]">
          {basket.contentsSummary ?? basket.description}
        </p>
      )}
    </section>
  );
}

function BasketAllocation({
  basket,
  currentValue,
  country,
  amountsHidden,
  securityCatalog,
  onOpenSecurity,
}: {
  basket: InvestmentBasketFund;
  currentValue: number;
  country: CountryId;
  amountsHidden: boolean;
  securityCatalog: readonly InvestmentCatalogSecurity[];
  onOpenSecurity?: (selection: {
    securityId: string;
    productId?: string;
    localValue: number;
    performancePercent: number;
    hideBuyAction?: boolean;
  }) => void;
}) {
  const localCurrency = getCountryCurrency(country) as InvestmentCatalogSecurity["localCurrency"];
  const holdings = basket.holdings ?? [];

  return (
    <section aria-label="Basket positions">
      {holdings.length ? (
        <div>
          {holdings.map((holding, index) => {
            const security = securityCatalog.find((candidate) => (
              (holding.productId && (candidate.id === holding.productId || candidate.productId === holding.productId))
              || candidate.title.trim().toLocaleLowerCase() === holding.title.trim().toLocaleLowerCase()
            ));
            if (!security) {
              return (
                <div key={holding.productId ?? `${basket.id}-${index}`} className="flex min-h-[80px] items-center gap-[12px] px-[16px] py-[16px]">
                  <BrandLogo logoId={basket.logoId} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-bold leading-[18px] text-[var(--uc-text)]">{holding.title}</p>
                    <p className="mt-[4px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">Position data unavailable</p>
                  </div>
                </div>
              );
            }

            const percent = holding.percent ?? 100 / Math.max(holdings.length, 1);
            const localValue = roundMoney((currentValue * percent) / 100);
            const value = roundMoney(convertCurrency(localValue, localCurrency, security.instrumentCurrency));
            const position: InvestmentCatalogSecurity = {
              ...security,
              title: holding.title,
              productId: holding.productId ?? security.productId,
              value,
              currency: security.instrumentCurrency,
              localValue,
              localCurrency,
              quantity: Number((value / security.marketPrice).toFixed(6)),
              performanceAmount: roundMoney((localValue * security.performancePercent) / 100),
            };

            return (
              <InvestmentProductCard
                key={holding.productId ?? `${basket.id}-${security.id}-${index}`}
                security={position}
                valueParts={formatInvestmentAmountParts(value, country, position.currency, amountsHidden)}
                performanceParts={formatInvestmentAmountParts(
                  position.performanceAmount,
                  country,
                  localCurrency,
                  amountsHidden,
                  true,
                )}
                valueLabel="Value"
                performanceLabel="Performance"
                czRoboAmountStyle
                amountsHidden={amountsHidden}
                currentPriceParts={formatInvestmentAmountParts(
                  position.marketPrice,
                  country,
                  position.instrumentCurrency,
                  amountsHidden,
                )}
                portfolioValueParts={formatInvestmentAmountParts(
                  localValue,
                  country,
                  localCurrency,
                  amountsHidden,
                )}
                onClick={() => onOpenSecurity?.({
                  securityId: security.id,
                  productId: holding.productId,
                  localValue,
                  performancePercent: position.performancePercent,
                  hideBuyAction: true,
                })}
              />
            );
          })}
        </div>
      ) : (
        <p className="px-[16px] py-[16px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
          {basket.contentsSummary ?? basket.description}
        </p>
      )}
    </section>
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
  country,
  amountsHidden,
  securityCatalog,
  horizonYears,
  existingGoal,
  onBack,
  onClose,
  onAction,
  onOpenSecurity,
}: {
  goalName: string;
  targetAmount: string;
  portfolio: RoboPortfolio;
  country: CountryId;
  amountsHidden: boolean;
  securityCatalog: readonly InvestmentCatalogSecurity[];
  horizonYears: number;
  existingGoal?: RoboExistingGoal;
  onBack: () => void;
  onClose: () => void;
  onAction: (mode: ManagementMode) => void;
  onOpenSecurity?: (selection: {
    securityId: string;
    productId?: string;
    localValue: number;
    performancePercent: number;
    hideBuyAction?: boolean;
  }) => void;
}) {
  const currentValue = getRoboGoalCurrentValue(existingGoal);
  const resolvedGoalName = existingGoal?.name ?? (goalName || "My investment goal");
  const resolvedPurpose = existingGoal?.purpose ?? "General build-up wealth";
  const resolvedTarget = existingGoal
    ? `${existingGoal.targetInteger}${existingGoal.targetDecimals}`
    : formatCzkInput(targetAmount);
  const draftTarget = Number(targetAmount);
  const resolvedProgress = existingGoal
    ? getRoboGoalProgress(existingGoal)
    : draftTarget > 0 ? calculateRoboGoalProgress(currentValue, draftTarget) : 80;
  const resolvedStartDate = existingGoal ? existingGoal.startDate : "15 Feb 2025";
  const resolvedEndDate = existingGoal?.endDate
    ?? getRoboGoalEndDateFromStart(resolvedStartDate ?? "15 Feb 2025", horizonYears);
  const resolvedReturnTone = existingGoal?.returnTone ?? "negative";
  const resolvedReturnLabel = existingGoal?.returnLabel ?? "-1 100,00 CZK (-1,36%)";
  const [selectedPeriodId, setSelectedPeriodId] = useState<InvestmentPeriodId>("3y");
  const [selectedSortId, setSelectedSortId] = useState<InvestmentSortId>("max-value");
  const chartPoints = useMemo(
    () => buildInvestmentChartPoints(currentValue, selectedPeriodId),
    [selectedPeriodId],
  );
  const basket = portfolio.basketFund;
  const presentation = basket ? null : ROBO_PORTFOLIO_PRESENTATIONS[portfolio.strategyId];
  const productRows = useMemo(() => {
    const rows = (presentation?.assetGroups ?? []).flatMap((group) =>
      group.products.map((product, index) => {
        const value = Math.round((currentValue * product.percent) / 100);
        const sourceSecurity = securityCatalog.find((security) => (
          security.id === product.securityId || security.productId === product.securityId
        ));
        const performance = sourceSecurity?.performancePercent
          ?? (index === 0 && group === presentation?.assetGroups[0] ? -1.8 : 1.8);
        const scale = sourceSecurity && sourceSecurity.localValue > 0
          ? value / sourceSecurity.localValue
          : 0;
        const security = sourceSecurity && scale > 0 ? {
          ...sourceSecurity,
          title: product.name,
          value: Math.round(sourceSecurity.value * scale * 100) / 100,
          localValue: value,
          quantity: Number(((sourceSecurity.value * scale) / sourceSecurity.marketPrice).toFixed(6)),
          performancePercent: performance,
          performanceAmount: Math.round((value * performance) / 100 * 100) / 100,
        } : undefined;

        return {
          product,
          productType: getGoalProductType(group.label),
          value,
          performance,
          security,
        };
      }),
    );
    return [...rows].sort((left, right) => {
      if (selectedSortId === "min-value") return left.value - right.value;
      if (selectedSortId === "max-percent") return right.product.percent - left.product.percent;
      if (selectedSortId === "min-percent") return left.product.percent - right.product.percent;
      return right.value - left.value;
    });
  }, [currentValue, presentation, securityCatalog, selectedSortId]);
  return (
    <RoboScreen
      title={resolvedGoalName}
      description={resolvedPurpose}
      onBack={onBack}
      onClose={onClose}
      headerAction="help"
      dataScreen="goal-detail"
      descriptionTopClassName="mt-[8px]"
      contentTopClassName="pt-[16px]"
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
          czRoboPresentation
          showVerticalGridLines={false}
        />
        <InvestmentPeriodChips
          periods={GOAL_DETAIL_PERIODS}
          comfortableTouchTargets
          className="-mt-[8px]"
          selectedPeriodId={selectedPeriodId}
          onChange={setSelectedPeriodId}
        />
      </div>

      <AccountActionBar
        className="-mx-[8px] mt-[18px] !px-0 !py-[8px]"
        items={[
          { id: "add-money", iconName: "add-money", label: "Add\nmoney", ariaLabel: "Add money", onClick: () => onAction("add-money-basket") },
          { id: "withdraw", iconName: "robo-withdraw", label: "Withdraw\nMoney", ariaLabel: "Withdraw", onClick: () => onAction("withdraw") },
          { id: "history", iconName: "investment-history", label: "History", onClick: () => onAction("history") },
          { id: "settings", iconName: "robo-goal-settings", label: "Goal\nSettings", ariaLabel: "Goal settings", onClick: () => onAction("settings") },
        ]}
      />

      <h2 className="mt-[30px] text-[20px] font-bold leading-[24px] text-[var(--uc-text)]">
        Goal progress
      </h2>
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
              style={{ width: `${Math.min(100, Math.max(2, resolvedProgress))}%` }}
            />
          </div>
          <span
            className="absolute top-0 -translate-x-full rounded-full bg-[var(--uc-action)] px-[5px] py-[3px] text-[12px] font-bold leading-[14px] text-white"
            data-testid="goal-detail-progress-badge"
            style={{ left: `${Math.min(100, Math.max(12, resolvedProgress))}%` }}
          >
            {resolvedProgress}%
          </span>
        </div>
        <div className="mt-[8px] flex justify-between uc-type-n5 text-[var(--uc-text-muted)]">
          {resolvedStartDate ? (
            <>
              <span>{resolvedStartDate}</span>
              <span>{resolvedEndDate}</span>
            </>
          ) : (
            <span>{resolvedEndDate}</span>
          )}
        </div>
      </div>

      <h2 className="mt-[30px] text-[20px] font-bold leading-[24px] text-[var(--uc-text)]">
        Portfolio allocation
      </h2>
      <div className="-mx-[24px] mt-[16px]">
        <InvestmentFilterChips
          options={INVESTMENT_SORT_OPTIONS}
          selectedOptionId={selectedSortId}
          onChange={setSelectedSortId}
          className="py-[16px]"
        />

        {basket ? (
          <BasketAllocation
            basket={basket}
            currentValue={currentValue}
            country={country}
            amountsHidden={amountsHidden}
            securityCatalog={securityCatalog}
            onOpenSecurity={onOpenSecurity}
          />
        ) : (
          <div>
            {productRows.map(({ product, productType, value, performance, security }) => security ? (
              <InvestmentProductCard
                key={product.securityId}
                security={security}
                valueParts={formatInvestmentAmountParts(security.value, country, security.currency, amountsHidden)}
                performanceParts={formatInvestmentAmountParts(
                  security.performanceAmount,
                  country,
                  security.localCurrency,
                  amountsHidden,
                  true,
                )}
                valueLabel="Value"
                performanceLabel="Performance"
                czRoboAmountStyle
                amountsHidden={amountsHidden}
                currentPriceParts={formatInvestmentAmountParts(
                  security.marketPrice,
                  country,
                  security.instrumentCurrency,
                  amountsHidden,
                )}
                portfolioValueParts={formatInvestmentAmountParts(
                  security.localValue,
                  country,
                  security.localCurrency,
                  amountsHidden,
                )}
                onClick={() => onOpenSecurity?.({
                  securityId: product.securityId,
                  localValue: security.localValue,
                  performancePercent: security.performancePercent,
                  hideBuyAction: true,
                })}
              />
            ) : (
              <button
                key={product.securityId}
                type="button"
                aria-label={`Open ${product.name} product details`}
                onClick={() => onOpenSecurity?.({
                  securityId: product.securityId,
                  localValue: value,
                  performancePercent: performance,
                  hideBuyAction: true,
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
                    {formatInvestmentNumber(value, country, 0, 0)}<span className="text-[14px] font-normal">,00 CZK</span>
                  </p>
                  <p className={cn(
                    "mt-[3px] text-[14px] font-bold leading-[17px]",
                    performance < 0 ? "text-[var(--uc-status-red)]" : "text-[var(--uc-green-olive)]",
                  )}>
                    {performance > 0 ? "+" : ""}{formatInvestmentNumber(performance, country, 0, 3)}%
                  </p>
                </div>
              </button>
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
  portfolio,
  currentValue,
  country,
  amountsHidden,
  securityCatalog,
  basketDetailsOverlay,
  onOpenBasketHolding,
  targetAmount,
  onTargetAmountChange,
  horizonYears,
  manualHorizon,
  onSelectHorizon,
  onManualHorizonChange,
  onBack,
  onClose,
  onMode,
  onRename,
  onSaveGoalPlan,
}: {
  mode: ManagementMode;
  goalName: string;
  portfolio: RoboPortfolio;
  currentValue: number;
  country: CountryId;
  amountsHidden: boolean;
  securityCatalog: readonly InvestmentCatalogSecurity[];
  basketDetailsOverlay?: ReactNode;
  onOpenBasketHolding?: (holding: InvestmentBasketFundHolding) => void;
  targetAmount: string;
  onTargetAmountChange: (value: string) => void;
  horizonYears: number;
  manualHorizon: string;
  onSelectHorizon: (years: number) => void;
  onManualHorizonChange: (value: string) => void;
  onBack: () => void;
  onClose: () => void;
  onMode: (mode: ManagementMode) => void;
  onRename: (name: string) => void;
  onSaveGoalPlan: (targetAmount: string, horizonYears: number) => void;
}) {
  const [amount, setAmount] = useState(mode === "monthly" ? "2000" : "10000");
  const [date, setDate] = useState("1 March 2026");
  const [renameName, setRenameName] = useState(goalName);
  const [selectedWithdrawalProductId, setSelectedWithdrawalProductId] = useState<string | null>(null);
  const [historyTab, setHistoryTab] = useState<"transactions" | "orders">("transactions");
  const withdrawalProducts = useMemo(
    () => getRoboWithdrawalProducts(portfolio, currentValue, country, securityCatalog),
    [country, currentValue, portfolio, securityCatalog],
  );
  const goalHistorySecurities = useMemo(
    () => withdrawalProducts.flatMap((product) => {
      if (!product.security || product.localValue <= 0) return [];
      return [{
        ...product.security,
        id: `goal-${product.id}-${product.security.id}`,
        productId: product.id,
        status: "active" as const,
        localValue: product.localValue,
      }];
    }),
    [withdrawalProducts],
  );
  const goalTransactions = useMemo(
    () => buildInvestmentHistoryTransactions(goalHistorySecurities, country, { minimumRecordsPerSecurity: 2 }),
    [country, goalHistorySecurities],
  );
  const goalOrders = useMemo(
    () => buildInvestmentHistoryOrders(goalHistorySecurities, country, { minimumRecordsPerSecurity: 2 }),
    [country, goalHistorySecurities],
  );
  const selectedWithdrawalProducts = withdrawalProducts.filter((product) => product.id === selectedWithdrawalProductId);
  const selectedWithdrawalValue = selectedWithdrawalProducts.reduce(
    (total, product) => total + product.localValue,
    0,
  );
  const selectWithdrawalProduct = (productId: string) => setSelectedWithdrawalProductId(productId);

  const openWithdrawalReview = () => {
    if (selectedWithdrawalProducts.length === 0) return;
    setAmount(String(Math.round(selectedWithdrawalValue)));
    onMode("partial-withdrawal");
  };

  const renderSelectedWithdrawalProducts = () => (
    <div className="mt-[20px]">
      {selectedWithdrawalProducts.map((product) => {
        if (!product.security) return null;
        const security = product.security;
        return <InvestmentProductCard
          key={product.id}
          security={security}
          valueParts={formatInvestmentAmountParts(security.value, country, security.currency, amountsHidden)}
          performanceParts={formatInvestmentAmountParts(
            security.performanceAmount,
            country,
            security.localCurrency,
            amountsHidden,
            true,
          )}
          valueLabel="Value"
          performanceLabel="Performance"
          czRoboAmountStyle
          amountsHidden={amountsHidden}
          currentPriceParts={formatInvestmentAmountParts(security.marketPrice, country, security.instrumentCurrency, amountsHidden)}
          portfolioValueParts={formatInvestmentAmountParts(security.localValue, country, security.localCurrency, amountsHidden)}
        />;
      })}
    </div>
  );

  if (mode === "add-money-basket") {
    const basket = portfolio.basketFund;
    if (!basket) {
      return (
        <RoboScreen
          title="Add money"
          description="Add a one-off investment to this goal."
          onBack={onBack}
          onClose={onClose}
          headerAction="none"
          dataScreen="add-money-basket-unavailable"
          footer={<PrimaryButton labelSize="18" onClick={() => onMode("add-money")}>Buy</PrimaryButton>}
        >
          <p className="uc-type-n5 text-[var(--uc-text-muted)]">Basket details are unavailable for this goal.</p>
        </RoboScreen>
      );
    }

    return (
      <InvestmentBasketFundDetailScreen
        basket={basket}
        country={country}
        amountsHidden={amountsHidden}
        onBack={onBack}
        czRoboProductDetail
        onOpenHolding={onOpenBasketHolding}
        overlay={basketDetailsOverlay}
        footerActionLabel="Buy"
        onFooterAction={() => onMode("add-money")}
      />
    );
  }

  if (mode === "goal-plan") {
    return (
      <GoalPlanScreen
        dataScreen="manage-goal-plan"
        targetAmount={targetAmount}
        onTargetAmountChange={onTargetAmountChange}
        horizonYears={horizonYears}
        manualHorizon={manualHorizon}
        onSelectHorizon={onSelectHorizon}
        onManualHorizonChange={onManualHorizonChange}
        onBack={onBack}
        onClose={onClose}
        onContinue={(years) => onSaveGoalPlan(targetAmount, years)}
        continueLabel="Save changes"
      />
    );
  }

  if (mode === "history") {
    return (
      <RoboScreen
        title="History"
        onBack={onBack}
        onClose={onClose}
        headerAction="none"
        dataScreen="history"
        contentTopClassName="pt-[8px]"
      >
        <div className="-mx-[24px]" data-investment-history-screen="goal">
          <InvestmentHistoryTabs activeTab={historyTab} onChange={setHistoryTab} />
          <InvestmentHistoryRows
            tab={historyTab}
            transactions={goalTransactions}
            orders={goalOrders}
            country={country}
            amountsHidden={amountsHidden}
          />
          <div className="h-[34px]" />
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
        headerAction="none"
        dataScreen="settings"
      >
        <NavigationRow title="Rename goal" description="Change the name shown in Investments." trailingAccessory="chevron" onClick={() => onMode("rename")} className="!px-0" />
        <NavigationRow title="Change goal plan" description="Update your target amount and time horizon." trailingAccessory="chevron" onClick={() => onMode("goal-plan")} className="!px-0" />
      </RoboScreen>
    );
  }

  if (mode === "withdraw") {
    return (
      <RoboScreen
        title="Withdraw money"
        description="Choose one product to sell."
        onBack={onBack}
        onClose={onClose}
        headerAction="none"
        dataScreen="withdraw"
        footer={(
          <PrimaryButton labelSize="18" disabled={selectedWithdrawalProducts.length === 0} onClick={openWithdrawalReview}>
            Continue
          </PrimaryButton>
        )}
      >
        <div
          className="mt-[8px]"
          role="radiogroup"
          aria-label="Choose a product to sell"
        >
          {withdrawalProducts.map((product) => {
            const selected = selectedWithdrawalProductId === product.id;
            const security = product.security;
            if (!security) {
              return (
                <button
                  key={product.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={`Choose ${product.name} to sell`}
                  onClick={() => selectWithdrawalProduct(product.id)}
                  className={cn(
                    "flex min-h-[72px] w-full items-center gap-[12px] px-[16px] py-[12px] text-left",
                    selected ? "bg-[color-mix(in_srgb,var(--uc-action)_5%,var(--uc-surface))]" : "",
                  )}
                >
                  <AppIcon name={selected ? "radio-selected" : "radio-unselected"} size={24} color="var(--uc-action)" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate uc-type-n5-strong text-[var(--uc-text)]">{product.name}</span>
                    <span className="mt-[3px] block uc-type-n6 text-[var(--uc-text-muted)]">Current quote unavailable</span>
                  </span>
                </button>
              );
            }

            return (
              <InvestmentProductCard
                key={product.id}
                security={security}
                valueParts={formatInvestmentAmountParts(security.value, country, security.currency, amountsHidden)}
                performanceParts={formatInvestmentAmountParts(
                  security.performanceAmount,
                  country,
                  security.localCurrency,
                  amountsHidden,
                  true,
                )}
                valueLabel="Value"
                performanceLabel="Performance"
                czRoboAmountStyle
                amountsHidden={amountsHidden}
                currentPriceParts={formatInvestmentAmountParts(security.marketPrice, country, security.instrumentCurrency, amountsHidden)}
                portfolioValueParts={formatInvestmentAmountParts(security.localValue, country, security.localCurrency, amountsHidden)}
                selection={{
                  selected,
                  ariaLabel: `Choose ${product.name} to sell`,
                  onSelect: () => selectWithdrawalProduct(product.id),
                }}
              />
            );
          })}
        </div>
      </RoboScreen>
    );
  }

  if (mode === "full-withdrawal") {
    return (
      <RoboScreen
        title="Review sale orders"
        description="The selected products will be sold. The final amount may be lower than today’s value."
        onBack={onBack}
        onClose={onClose}
        dataScreen="full-withdrawal"
        footer={<PrimaryButton labelSize="18" onClick={onBack}>Review sale orders</PrimaryButton>}
      >
        <div className="rounded-[8px] bg-[var(--uc-surface-muted)] p-[16px]">
          <p className="uc-type-n5 text-[var(--uc-text-muted)]">Estimated selected value</p>
          <p className="uc-type-h2 mt-[5px] text-[var(--uc-text)]">{formatInvestmentMoney(selectedWithdrawalValue, "CZ", "CZK")}</p>
          <p className="uc-type-n5 mt-[8px] leading-[17px] text-[var(--uc-text-muted)]">This is not a guaranteed withdrawal amount.</p>
        </div>
        {renderSelectedWithdrawalProducts()}
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
  }[mode as Exclude<ManagementMode, "menu" | "withdraw" | "full-withdrawal" | "history" | "settings" | "close" | "goal-plan" | "add-money-basket">];

  return (
    <RoboScreen
      title={config.title}
      description={mode === "partial-withdrawal"
        ? "Review the products you selected and choose how much to withdraw."
        : config.description}
      onBack={onBack}
      onClose={onClose}
      headerAction={mode === "rename" || mode === "add-money" ? "none" : "close"}
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
      {mode === "partial-withdrawal" ? renderSelectedWithdrawalProducts() : null}
      <TextField
        label={config.label}
        value={mode === "rename" ? renameName : amount}
        onChange={mode === "rename" ? setRenameName : setAmount}
        inputMode={mode === "rename" ? "text" : "numeric"}
        suffix={mode === "rename" ? undefined : "CZK"}
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
          <p className="uc-type-n4-strong mt-[4px] text-[var(--uc-text)]">{defaultCashAccountLabel}</p>
        </div>
      ) : null}
    </RoboScreen>
  );
}

export default function CzFutureRoboAdvisorFlow({
  currentAccounts = [DEFAULT_ROBO_CASH_ACCOUNT],
  securityCatalog = [],
  country = "CZ",
  amountsHidden = false,
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
  const [basketDetailsToOpen, setBasketDetailsToOpen] = useState<InvestmentBasketFund | null>(null);
  const [selectedBasketHolding, setSelectedBasketHolding] = useState<SelectedBasketHolding | null>(null);
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [cashAccountSheetOpen, setCashAccountSheetOpen] = useState(false);
  const [selectedCashAccountId, setSelectedCashAccountId] = useState(currentAccounts[0]?.id ?? "");
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
  const selectHorizon = (years: number) => dispatchFlow({ type: "select-horizon", years });
  const setManualHorizonValue = (value: string) => dispatchFlow({ type: "set-manual-horizon", value });
  const setFundingMethod = (value: RoboFundingMethod | null) => dispatchFlow({ type: "set-field", field: "fundingMethod", value });
  const setInitialAmount = (value: string) => dispatchFlow({ type: "set-field", field: "initialAmount", value });
  const setMonthlyContribution = (value: string) => dispatchFlow({ type: "set-field", field: "monthlyContribution", value });
  const setStartDate = (value: string) => dispatchFlow({ type: "set-field", field: "startDate", value });
  const setSelectedStrategyId = (value: RoboStrategy["id"]) => dispatchFlow({ type: "set-field", field: "selectedStrategyId", value });
  const setSelectedPortfolio = (value: RoboPortfolio | null) => dispatchFlow({ type: "set-field", field: "selectedPortfolio", value });
  const setTermsAccepted = (value: boolean) => dispatchFlow({ type: "set-field", field: "termsAccepted", value });
  const setManagementMode = (value: ManagementMode) => dispatchFlow({ type: "set-field", field: "managementMode", value });
  const saveGoalPlan = (nextTargetAmount: string, nextHorizonYears: number) => {
    const targetDigits = nextTargetAmount.replace(/\D/g, "");
    if (!targetDigits || !isValidRoboHorizon(String(nextHorizonYears))) return;

    setTargetAmount(targetDigits);
    if ([3, 5, 7, 10].includes(nextHorizonYears)) selectHorizon(nextHorizonYears);
    else setManualHorizonValue(String(nextHorizonYears));

    if (initialGoal) {
      const targetInteger = formatCzkInput(targetDigits).replace(/\s*CZK$/, "");
      onGoalUpdated?.({
        ...initialGoal,
        targetInteger,
        targetDecimals: ",00 CZK",
        horizonYears: nextHorizonYears,
        endDate: getRoboGoalEndDate(initialGoal, nextHorizonYears),
      });
    }
    setManagementMode("menu");
  };
  const selectedCashAccount = currentAccounts.find((account) => account.id === selectedCashAccountId) ?? null;
  const openBasketHolding = (basket: InvestmentBasketFund, holding: InvestmentBasketFundHolding) => {
    const normalizedTitle = holding.title.trim().toLowerCase();
    const security = securityCatalog.find((candidate) => (
      (holding.productId && (candidate.productId === holding.productId || candidate.id === holding.productId))
      || candidate.title.trim().toLowerCase() === normalizedTitle
    )) ?? null;
    setSelectedBasketHolding({ basketTitle: basket.title, holding, security });
  };
  const strategyCarouselRef = useRef<HTMLDivElement>(null);
  const portfolioCarouselRef = useRef<HTMLDivElement>(null);

  const strategies = useMemo(() => ROBO_STRATEGIES.slice(0, availableStrategyCount), [availableStrategyCount]);
  const selectedStrategy: RoboStrategy =
    strategies.find((strategy) => strategy.id === selectedStrategyId)
    ?? strategies[0]
    ?? DEFAULT_ROBO_STRATEGY;
  const portfolios = getPortfoliosForStrategy(selectedStrategy.id, "moderate-v2");
  const basketPortfolios = portfolios.filter((candidate) => candidate.basketFund);
  const selectedBasketPortfolio = basketPortfolios.find((candidate) => candidate.id === selectedPortfolio?.id)
    ?? basketPortfolios[0]
    ?? null;
  const fundingFields = fundingMethod ? getFundingFieldVisibility(fundingMethod) : null;
  const resolvedHorizon = horizonYears || Number(manualHorizon) || 10;

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
  const snapPortfolioCarousel = () => {
    const carousel = portfolioCarouselRef.current;
    if (!carousel || basketPortfolios.length <= 1) return;
    const index = getCarouselSelectedIndex(carousel, basketPortfolios.length);
    const left = getCarouselScrollLeft(carousel, index, basketPortfolios.length);
    if (typeof carousel.scrollTo === "function") carousel.scrollTo({ left, behavior: "smooth" });
    else carousel.scrollLeft = left;
    setSelectedPortfolio(basketPortfolios[index]!);
  };
  const { isDragging: isPortfolioDragging, dragHandlers: portfolioDragHandlers } = useDragCarousel({
    carouselRef: portfolioCarouselRef,
    enabled: basketPortfolios.length > 1,
    onSettle: snapPortfolioCarousel,
  });

  useEffect(() => {
    if (step !== "portfolio") return;
    const carousel = portfolioCarouselRef.current;
    if (!carousel) return;
    const selectedIndex = basketPortfolios.findIndex((candidate) => candidate.id === selectedBasketPortfolio?.id);
    carousel.scrollLeft = getCarouselScrollLeft(carousel, Math.max(0, selectedIndex), basketPortfolios.length);
  }, [step, selectedStrategy.id]);

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

  const selectedBasketHoldingOverlay = selectedBasketHolding ? (
    <BottomSheet
      title="Product details"
      onClose={() => setSelectedBasketHolding(null)}
      closeLabel="Close product details"
      fillHeight
      className="!p-0"
      headerClassName="mx-[16px] mt-[16px]"
      bodyClassName="min-h-0 flex-1"
    >
      <InvestmentSecurityDetailScreen
        security={selectedBasketHolding.security ?? undefined}
        basketHoldingDetail={selectedBasketHolding.security ? undefined : {
          title: selectedBasketHolding.holding.title,
          productId: selectedBasketHolding.holding.productId,
          basketTitle: selectedBasketHolding.basketTitle,
          allocationPercent: selectedBasketHolding.holding.percent,
        }}
        country={country}
        amountsHidden={amountsHidden}
        onBack={() => setSelectedBasketHolding(null)}
        czRoboProductDetail
        inBottomSheet
        hideOrderActions
      />
    </BottomSheet>
  ) : undefined;

  if (basketDetailsToOpen) {
    return (
      <InvestmentBasketFundDetailScreen
        basket={basketDetailsToOpen}
        country="CZ"
        amountsHidden={false}
        czRoboProductDetail
        onOpenHolding={(holding) => openBasketHolding(basketDetailsToOpen, holding)}
        overlay={selectedBasketHoldingOverlay}
        onBack={() => setBasketDetailsToOpen(null)}
      />
    );
  }

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
        contentTopClassName="pt-[16px]"
        footer={<PrimaryButton labelSize="18" disabled={!goalType} onClick={() => setStep("goal-name")}>Continue</PrimaryButton>}
      >
        <div className="space-y-[12px]">
          {ROBO_GOAL_TYPES.map((type) => (
            <GoalSelectionCard
              key={type.id}
              id={type.id}
              title={type.title}
              description={type.description}
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
        <div className="mt-[22px] flex flex-wrap gap-[8px]" role="group" aria-label="Suggested goal names">
          {getRoboGoalNameSuggestions(goalType).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              aria-pressed={goalName === suggestion}
              onClick={() => setGoalName(suggestion)}
              className={cn(
                "min-h-[36px] w-fit whitespace-nowrap rounded-[4px] px-[12px] py-[8px] text-left text-[13px] font-bold leading-[17px] transition-colors",
                goalName === suggestion
                  ? "border border-[var(--uc-action)] bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]"
                  : "bg-[var(--uc-neutral-100)] text-[var(--uc-text)]",
              )}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </RoboScreen>
    );
  }

  if (step === "target") {
    return (
      <GoalPlanScreen
        dataScreen="target-and-horizon"
        targetAmount={targetAmount}
        onTargetAmountChange={setTargetAmount}
        horizonYears={horizonYears}
        manualHorizon={manualHorizon}
        onSelectHorizon={selectHorizon}
        onManualHorizonChange={setManualHorizonValue}
        onBack={goBackByStep}
        onClose={onExit}
        onContinue={() => setStep("funding-setup")}
      />
    );
  }

  if (step === "funding-setup") {
    const canContinue = Boolean(
      fundingMethod
      && fundingFields
      && selectedCashAccount
      && (!fundingFields.initialAmount || Number(initialAmount) > 0)
      && (!fundingFields.monthlyContribution || Number(monthlyContribution) > 0)
      && (!fundingFields.startDate || startDate.trim().length > 0),
    );
    const description = !fundingMethod
      ? "Choose a contribution plan. The matching details will appear below."
      : fundingMethod === "one-off"
        ? "Choose how much to invest now and which cash account to use."
        : fundingMethod === "regular"
          ? "Set your monthly contribution, start date and cash account."
          : "Set an initial investment and monthly contributions from one cash account.";
    const cashAccountDescription = fundingMethod === "one-off"
      ? "We’ll use this account for your one-time investment."
      : fundingMethod === "regular"
        ? "We’ll use this account for your monthly contributions."
        : "We’ll use this account for your initial and monthly contributions.";

    return (
      <RoboScreen
        title="Set up your investment"
        description={description}
        onBack={goBackByStep}
        onClose={onExit}
        dataScreen={`funding-setup${fundingMethod ? `-${fundingMethod}` : ""}`}
        contentTopClassName="pt-[16px]"
        overlay={(
          <>
            {startDatePickerOpen ? (
              <BottomSheet
                title="Select start date"
                onClose={() => setStartDatePickerOpen(false)}
                closeLabel="Close calendar"
              >
                <div className="w-full pb-[8px]">
                  <Calendar
                    className="w-full"
                    mode="single"
                    disabled={{ before: new Date() }}
                    selected={parseRoboCalendarDate(startDate)}
                    onSelect={(date) => {
                      if (!date) return;
                      setStartDate(formatRoboCalendarDate(date));
                      setStartDatePickerOpen(false);
                    }}
                  />
                </div>
              </BottomSheet>
            ) : null}
            {cashAccountSheetOpen ? (
              <InvestmentAccountSelectionSheet
                title="Select cash account"
                options={currentAccounts.map((account) => ({
                  id: account.id,
                  name: account.name,
                  detail: displayRoboAccountNumber(account.accountNumber, country),
                  balance: formatInvestmentMoney(account.balance, country, account.currency, amountsHidden),
                }))}
                selectedId={selectedCashAccountId}
                onClose={() => setCashAccountSheetOpen(false)}
                onConfirm={(id) => {
                  setSelectedCashAccountId(id);
                  setCashAccountSheetOpen(false);
                }}
              />
            ) : null}
          </>
        )}
        footer={(
          <PrimaryButton
            labelSize="18"
            disabled={!canContinue}
            onClick={() => dispatchFlow({ type: "open-portfolio", from: "funding-setup" })}
          >
            Continue
          </PrimaryButton>
        )}
      >
        <div
          role="radiogroup"
          aria-label="Contribution plan"
          className="space-y-[8px]"
        >
          {ROBO_FUNDING_OPTIONS.map((option) => {
            const selected = fundingMethod === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={`${option.title}. ${option.description}`}
                onClick={() => setFundingMethod(option.id)}
                className={cn(
                  "flex min-h-[48px] w-full items-center gap-[10px] py-[6px] text-left transition-colors",
                )}
              >
                <span className="grid size-[24px] shrink-0 place-items-center">
                  <AppIcon name={selected ? "radio-selected" : "radio-unselected"} size={24} color={selected ? "var(--uc-action)" : "var(--uc-text)"} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-[15px] font-bold leading-[18px]", selected ? "text-[var(--uc-action)]" : "text-[var(--uc-text)]")}>{option.title}</span>
                  <span className="mt-[2px] block text-[13px] leading-[16px] text-[var(--uc-text-muted)]">{option.description}</span>
                </span>
              </button>
            );
          })}
        </div>

        {fundingFields ? (
          <>
            <div className="mt-[24px] space-y-[24px]">
              {fundingFields.initialAmount ? (
                <div>
                  <TextField label="Amount to invest now" value={initialAmount} onChange={setInitialAmount} inputMode="numeric" suffix="CZK" suffixOutsideDivider suffixClassName="!font-bold" />
                  <div className="mt-[16px] grid grid-cols-3 gap-[8px]">
                    {["5000", "10000", "100000"].map((amount) => (
                      <FundingAmountSuggestion
                        key={amount}
                        amount={amount}
                        value={initialAmount}
                        onSelect={setInitialAmount}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
              {fundingFields.monthlyContribution ? (
                <div className={fundingFields.initialAmount ? "pt-[8px]" : undefined}>
                  <TextField label="Monthly contribution" value={monthlyContribution} onChange={setMonthlyContribution} inputMode="numeric" suffix="CZK" suffixOutsideDivider suffixClassName="!font-bold" />
                  <div className="mt-[16px] grid grid-cols-3 gap-[8px]">
                    {["500", "1000", "2000"].map((amount) => (
                      <FundingAmountSuggestion
                        key={amount}
                        amount={amount}
                        value={monthlyContribution}
                        onSelect={setMonthlyContribution}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
              {fundingFields.startDate ? (
                <TextField
                  label="Start date"
                  value={startDate}
                  onChange={setStartDate}
                  readOnly
                  onActivate={() => setStartDatePickerOpen(true)}
                  trailingIconName="calendar-days"
                  trailingIconAction={{
                    ariaLabel: "Select start date",
                    onClick: () => setStartDatePickerOpen(true),
                  }}
                />
              ) : null}
            </div>

            <div className="mt-[28px]">
              <h2 className="text-[20px] font-bold leading-[24px] text-[var(--uc-text)]">Choose the account to use</h2>
              <p className="mt-[10px] text-[16px] leading-[21px] text-[var(--uc-text)]">{cashAccountDescription}</p>
              <div className="mt-[18px]">
                {selectedCashAccount ? (
                  <TextField
                    label="Cash account"
                    ariaLabel={`Cash account, ${selectedCashAccount.name}`}
                    value={displayRoboAccountNumber(selectedCashAccount.accountNumber, country)}
                    onChange={() => undefined}
                    readOnly
                    trailingIconName="chevron-down"
                    helperText={selectedCashAccount.name}
                    helperText2={`Available balance ${formatInvestmentMoney(selectedCashAccount.balance, country, selectedCashAccount.currency, amountsHidden)}`}
                    onActivate={() => setCashAccountSheetOpen(true)}
                  />
                ) : (
                  <p className="text-[14px] leading-[18px] text-[var(--uc-status-red)]">No current account is available.</p>
                )}
              </div>
            </div>

          </>
        ) : null}
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
    return (
      <RoboScreen
        title="Available portfolios"
        description={`Based on your ${ROBO_INVESTOR_PROFILE_LABELS.moderate} investor profile, these baskets are a suitable match. Choose one to review their contents.`}
        onBack={goBackByStep}
        onClose={onExit}
        dataScreen="portfolio"
        overlay={selectedBasketHoldingOverlay}
        footer={(
          <PrimaryButton
            labelSize="18"
            onClick={() => {
              if (!selectedBasketPortfolio) return;
              setSelectedPortfolio(selectedBasketPortfolio);
              setStep("review");
            }}
          >
            Continue
          </PrimaryButton>
        )}
      >
        <div
          ref={portfolioCarouselRef}
          role="radiogroup"
          aria-label="Recommended basket funds"
          data-testid="robo-basket-portfolio-carousel"
          {...portfolioDragHandlers}
          onScroll={(event) => {
            const index = getCarouselSelectedIndex(event.currentTarget, basketPortfolios.length);
            const nearest = basketPortfolios[index];
            if (nearest && nearest.id !== selectedBasketPortfolio?.id) setSelectedPortfolio(nearest);
          }}
          className={cn(
            "-mr-[24px] flex touch-pan-y snap-x snap-mandatory gap-[16px] overflow-x-auto pb-[8px] pr-[24px] scrollbar-hide",
            isPortfolioDragging ? "cursor-grabbing select-none snap-none" : "cursor-grab",
          )}
        >
          {basketPortfolios.map((candidate) => (
            <BasketPortfolioCard
              key={candidate.id}
              portfolio={candidate}
              selected={candidate.id === selectedBasketPortfolio?.id}
              onSelect={() => {
                setSelectedPortfolio(candidate);
                const carousel = portfolioCarouselRef.current;
                if (!carousel) return;
                const index = basketPortfolios.findIndex((basket) => basket.id === candidate.id);
                const left = getCarouselScrollLeft(carousel, index, basketPortfolios.length);
                if (typeof carousel.scrollTo === "function") carousel.scrollTo({ left, behavior: "smooth" });
                else carousel.scrollLeft = left;
              }}
              onDetails={() => {
                if (candidate.basketFund) setBasketDetailsToOpen(candidate.basketFund);
              }}
              dragHandlers={portfolioDragHandlers}
            />
          ))}
        </div>
        {basketPortfolios.length > 1 ? (
          <div className="mt-[14px] flex justify-center gap-[6px]" aria-label="Basket fund selection position">
            {basketPortfolios.map((candidate) => (
              <span
                key={candidate.id}
                className={cn(
                  "h-[6px] rounded-full transition-all",
                  candidate.id === selectedBasketPortfolio?.id ? "w-[30px] bg-[var(--uc-action)]" : "w-[6px] bg-[var(--uc-text-subtle)]",
                )}
              />
            ))}
          </div>
        ) : null}
        {selectedBasketPortfolio ? (
          <div className="mt-[24px]">
            <PortfolioDetails
              key={selectedBasketPortfolio.id}
              portfolio={selectedBasketPortfolio}
              onHoldingClick={(holding) => openBasketHolding(selectedBasketPortfolio.basketFund!, holding)}
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
      cashAccountLabel: selectedCashAccount
        ? `${selectedCashAccount.name} · ${displayRoboAccountNumber(selectedCashAccount.accountNumber, country)}`
        : defaultCashAccountLabel,
      investorProfileLabel: ROBO_INVESTOR_PROFILE_LABELS.moderate,
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
          portfolio={selectedPortfolio}
          currentValue={getRoboGoalCurrentValue(initialGoal)}
          country={country}
          amountsHidden={amountsHidden}
          securityCatalog={securityCatalog}
          basketDetailsOverlay={selectedBasketHoldingOverlay}
          onOpenBasketHolding={(holding) => {
            const basket = selectedPortfolio.basketFund;
            if (basket) openBasketHolding(basket, holding);
          }}
          targetAmount={targetAmount}
          onTargetAmountChange={setTargetAmount}
          horizonYears={horizonYears}
          manualHorizon={manualHorizon}
          onSelectHorizon={selectHorizon}
          onManualHorizonChange={setManualHorizonValue}
          onBack={() => {
            setManagementMode(getPreviousManagementMode(managementMode));
          }}
          onClose={onExit}
          onMode={setManagementMode}
          onRename={(name) => {
            setGoalName(name);
            if (initialGoal) onGoalUpdated?.({ ...initialGoal, name });
          }}
          onSaveGoalPlan={saveGoalPlan}
        />
      );
    }
    return (
      <GoalDetail
        goalName={goalName}
        targetAmount={targetAmount}
        portfolio={selectedPortfolio}
        country={country}
        amountsHidden={amountsHidden}
        securityCatalog={securityCatalog}
        horizonYears={resolvedHorizon}
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
