/**
 * RO Teens (14–18) domain types.
 *
 * The Romanian teens app is payments-first: teens pay a curated, parent-approved
 * list of payees, and anything above their instant limit routes to a parent for
 * approval. These types model that flow end-to-end (payee → decision → approval).
 */
import type { IconName } from "@/app/components/icons";

/** Bottom-nav destinations. Payments sits in the centre — it is the hero. */
export type RoTeenNavId = "home" | "payments" | "goals" | "card" | "profile";

/** Overlay screens layered above the active tab. */
export type RoTeenView =
  | "home"
  | "payments"
  | "goals"
  | "card"
  | "profile"
  | "pay"
  | "request"
  | "send"
  | "goal-detail"
  | "create-goal"
  | "card-settings"
  | "approvals"
  | "insights"
  | "transaction-detail"
  | "theme";

export type RoTeenReturnView = Exclude<RoTeenView, "transaction-detail" | "pay">;

/* ----------------------------------------------------------------------- */
/* Payees + payment decision engine                                        */
/* ----------------------------------------------------------------------- */

export type RoPayeeCategory = "family" | "friend" | "merchant" | "subscription";

export type RoPayee = {
  id: string;
  name: string;
  /** @handle, masked phone, or short descriptor shown under the name. */
  handle: string;
  category: RoPayeeCategory;
  icon: IconName;
  /** Token-based avatar background. */
  accent: string;
  initials?: string;
  /** Max value allowed in a single payment to this payee. */
  perPaymentLimit: number;
  /** When true, every payment to this payee needs a parent OK, regardless of amount. */
  alwaysNeedsApproval: boolean;
  /** Trusted payees can settle instantly when the amount is within the instant threshold. */
  trusted: boolean;
  /** Short reassurance line, e.g. "Prieten aprobat de Mama". */
  note?: string;
};

export type PaymentDecisionStatus = "instant" | "needs-approval" | "blocked";

export type PaymentDecision = {
  status: PaymentDecisionStatus;
  /** Human-readable Romanian explanation shown on the review step. */
  reason: string;
};

/* ----------------------------------------------------------------------- */
/* Approvals inbox (the parent-approval loop)                              */
/* ----------------------------------------------------------------------- */

export type RoApprovalKind = "payment" | "request" | "topup" | "task";
export type RoApprovalStatus = "pending" | "approved" | "declined" | "completed";

export type RoApproval = {
  id: string;
  kind: RoApprovalKind;
  title: string;
  /** Who the money goes to / comes from. */
  counterparty: string;
  amount: number;
  note?: string;
  status: RoApprovalStatus;
  createdAt: string;
  icon: IconName;
  accent: string;
};

/* ----------------------------------------------------------------------- */
/* Money movements                                                          */
/* ----------------------------------------------------------------------- */

export type RoSpendCategory =
  | "Venituri"
  | "Mâncare"
  | "Distracție"
  | "Abonamente"
  | "Shopping"
  | "Transport"
  | "Prieteni";

export type RoTransaction = {
  id: string;
  merchant: string;
  subtitle: string;
  /** Negative = spend, positive = income. */
  amount: number;
  category: RoSpendCategory;
  icon: IconName;
  accent: string;
  /** Display label for the day header, e.g. "Azi", "Ieri", "12 iul". */
  dayLabel: string;
  /** Sortable key, e.g. "2026-07-23". */
  dateKey: string;
  time: string;
  status: "Efectuată" | "În așteptare";
};

export type RoTransactionDayGroup = {
  key: string;
  title: string;
  transactions: RoTransaction[];
  total: number;
};

/* ----------------------------------------------------------------------- */
/* Goals + tasks                                                            */
/* ----------------------------------------------------------------------- */

export type RoGoal = {
  id: string;
  title: string;
  emoji: string;
  targetAmount: number;
  savedAmount: number;
  accent: string;
  helper: string;
};

export type RoGoalContribution = {
  id: string;
  goalId: string;
  title: string;
  subtitle: string;
  amount: number;
  tone: "self" | "parent";
};

export type RoTaskStatus = "todo" | "waiting-parent" | "approved";

export type RoTask = {
  id: string;
  title: string;
  recurrence: string;
  reward: number;
  icon: IconName;
  status: RoTaskStatus;
  parentNote?: string;
};
