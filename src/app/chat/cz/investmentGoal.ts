import type {
  CoAppingChatMessage,
  CoAppingInvestmentFundCollectionId,
  CoAppingRichBlock,
} from "../../../../package/mobile-pi-coapping-chat-package/src";
import { parseMoneyAmount } from "../nlu";

export type InvestmentGoalPurpose = "grow-savings" | "future-purchase" | "long-term-reserve";
export type InvestmentGoalHorizon = "3-5" | "5-10" | "undecided";
export type InvestmentGoalRiskComfort = "calm" | "balanced" | "growth";

export type InvestmentGoalDraft = {
  purpose: InvestmentGoalPurpose | null;
  horizon: InvestmentGoalHorizon | null;
  // Widened from the chip-only unions (5000|10000 / 0|500|1000) so the flow can
  // also accept a free-typed amount ("10k", "7 500 Kč") parsed by the NLU.
  startingAmount: number | null;
  startingAmountUndecided: boolean;
  monthlyContribution: number | null;
  riskComfort: InvestmentGoalRiskComfort | null;
};

/** Free-text ways of declining/deferring a step, per open step. */
function isGoalSkipAnswer(prompt: string, step: "starting-amount" | "monthly-contribution"): boolean {
  const undecided = /\b(not sure|unsure|dunno|later|decide later|skip|nevim|nevím|pozdeji|později|preskocit|přeskočit)\b/.test(prompt);
  if (step === "starting-amount") return undecided;
  return undecided || /\b(not now|none|no monthly|zero|zadny|žádný|ted ne|teď ne|nyni ne)\b/.test(prompt);
}

export type InvestmentGoalStep =
  | "purpose"
  | "horizon"
  | "starting-amount"
  | "monthly-contribution"
  | "risk-comfort"
  | "summary";

const EMPTY_INVESTMENT_GOAL_DRAFT: InvestmentGoalDraft = {
  purpose: null,
  horizon: null,
  startingAmount: null,
  startingAmountUndecided: false,
  monthlyContribution: null,
  riskComfort: null,
};

function normalizeGoalPrompt(value: string) {
  return value.toLowerCase().replace(/[.,]$/g, "").replace(/\s+/g, " ").trim();
}

export function extractInvestmentGoalDraft(messages: readonly CoAppingChatMessage[]): InvestmentGoalDraft {
  const draft = { ...EMPTY_INVESTMENT_GOAL_DRAFT };

  messages.forEach((message) => {
    if (message.role !== "user") return;
    const prompt = normalizeGoalPrompt(message.text);
    // The step that was open when the user sent this message, used to scope
    // free-typed amount parsing so a stray number can never fill the wrong slot.
    const stepBefore = getInvestmentGoalNextStep(draft);

    if (prompt === "set investment goal purpose to grow savings") draft.purpose = "grow-savings";
    if (prompt === "set investment goal purpose to future purchase") draft.purpose = "future-purchase";
    if (prompt === "set investment goal purpose to long-term reserve") draft.purpose = "long-term-reserve";

    if (prompt === "set investment goal horizon to 3-5 years") draft.horizon = "3-5";
    if (prompt === "set investment goal horizon to 5-10 years") draft.horizon = "5-10";
    if (prompt === "set investment goal horizon to not sure yet") draft.horizon = "undecided";

    if (prompt === "set investment goal starting amount to 5,000 czk") {
      draft.startingAmount = 5000;
      draft.startingAmountUndecided = false;
    }
    if (prompt === "set investment goal starting amount to 10,000 czk") {
      draft.startingAmount = 10000;
      draft.startingAmountUndecided = false;
    }
    if (prompt === "set investment goal starting amount to not sure yet") {
      draft.startingAmount = null;
      draft.startingAmountUndecided = true;
    }

    if (prompt === "set investment goal monthly contribution to 500 czk") draft.monthlyContribution = 500;
    if (prompt === "set investment goal monthly contribution to 1,000 czk") draft.monthlyContribution = 1000;
    if (prompt === "set investment goal monthly contribution to not now") draft.monthlyContribution = 0;

    if (prompt === "set investment goal risk comfort to prefer less movement") draft.riskComfort = "calm";
    if (prompt === "set investment goal risk comfort to balanced") draft.riskComfort = "balanced";
    if (prompt === "set investment goal risk comfort to accept more movement") draft.riskComfort = "growth";

    // Free-typed amounts (e.g. "10k", "7 500 Kč"), only for the step this
    // message answered and only if an exact chip above did not already set it.
    if (stepBefore === "starting-amount" && draft.startingAmount === null && !draft.startingAmountUndecided) {
      const amount = parseMoneyAmount(message.text);
      if (amount !== null) draft.startingAmount = amount;
      else if (isGoalSkipAnswer(prompt, "starting-amount")) draft.startingAmountUndecided = true;
    } else if (stepBefore === "monthly-contribution" && draft.monthlyContribution === null) {
      const amount = parseMoneyAmount(message.text);
      if (amount !== null) draft.monthlyContribution = amount;
      else if (isGoalSkipAnswer(prompt, "monthly-contribution")) draft.monthlyContribution = 0;
    }
  });

  return draft;
}

export function getInvestmentGoalNextStep(draft: InvestmentGoalDraft): InvestmentGoalStep {
  if (!draft.purpose) return "purpose";
  if (!draft.horizon) return "horizon";
  if (!draft.startingAmount && !draft.startingAmountUndecided) return "starting-amount";
  if (draft.monthlyContribution === null) return "monthly-contribution";
  if (!draft.riskComfort) return "risk-comfort";
  return "summary";
}

export function formatInvestmentGoalPurpose(purpose: InvestmentGoalPurpose | null) {
  if (purpose === "future-purchase") return "Future purchase";
  if (purpose === "long-term-reserve") return "Long-term reserve";
  return purpose === "grow-savings" ? "Grow my savings" : "Not decided yet";
}

export function formatInvestmentGoalHorizon(horizon: InvestmentGoalHorizon | null) {
  if (horizon === "3-5") return "3-5 years";
  if (horizon === "5-10") return "5-10 years";
  return "Not decided yet";
}

export function formatInvestmentGoalRisk(riskComfort: InvestmentGoalRiskComfort | null) {
  if (riskComfort === "calm") return "Prefer less movement";
  if (riskComfort === "growth") return "Accept more movement";
  return riskComfort === "balanced" ? "Balanced" : "Not decided yet";
}

export function getInvestmentGoalFundCollectionId(
  riskComfort: InvestmentGoalRiskComfort | null,
): CoAppingInvestmentFundCollectionId {
  if (riskComfort === "calm") return "conservative";
  if (riskComfort === "growth") return "equity";
  return "balanced";
}

function formatCzk(value: number) {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(value))} CZK`;
}

function calculateFutureValue(
  startingAmount: number,
  monthlyContribution: number,
  years: number,
  annualRate: number,
) {
  const monthlyRate = annualRate / 12;
  const months = years * 12;
  const startingValue = startingAmount * Math.pow(1 + monthlyRate, months);
  const contributionValue = monthlyRate === 0
    ? monthlyContribution * months
    : monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  return Math.max(0, startingValue + contributionValue);
}

export function buildInvestmentGoalProjectionBlock(draft: InvestmentGoalDraft): CoAppingRichBlock {
  const startingAmount = draft.startingAmount ?? 0;
  const monthlyContribution = draft.monthlyContribution ?? 0;
  const amountSummary = draft.startingAmountUndecided
    ? `Starting amount to decide later plus ${formatCzk(monthlyContribution)} monthly`
    : `${formatCzk(startingAmount)} now plus ${formatCzk(monthlyContribution)} monthly`;

  if (draft.horizon === "undecided" || draft.startingAmountUndecided) {
    return {
      type: "investment-projection",
      title: "Goal simulation",
      body: `${amountSummary}. Choose the remaining input in Investments before relying on a numeric range. Illustrative only, not a guarantee.`,
      scenarios: [
        { label: "Lower", value: "Complete later", detail: "Needs a confirmed horizon and starting amount" },
        { label: "Expected", value: "Complete later", detail: "No invented projection", emphasis: true },
        { label: "Higher", value: "Complete later", detail: "Review when the goal is clearer" },
      ],
    };
  }

  const years = draft.horizon === "3-5" ? 4 : 7;
  const rates: readonly [number, number, number] = draft.riskComfort === "calm"
    ? [0.01, 0.025, 0.04]
    : draft.riskComfort === "growth"
      ? [-0.01, 0.05, 0.09]
      : [0, 0.04, 0.07];
  const lower = calculateFutureValue(startingAmount, monthlyContribution, years, rates[0]);
  const expected = calculateFutureValue(startingAmount, monthlyContribution, years, rates[1]);
  const higher = calculateFutureValue(startingAmount, monthlyContribution, years, rates[2]);

  return {
    type: "investment-projection",
    title: "Goal simulation",
    body: `${amountSummary} over ${years} years. Illustrative only, not a guarantee.`,
    scenarios: [
      { label: "Lower", value: formatCzk(lower), detail: "More cautious market path" },
      { label: "Expected", value: formatCzk(expected), detail: "Middle scenario", emphasis: true },
      { label: "Higher", value: formatCzk(higher), detail: "Stronger market path" },
    ],
  };
}
