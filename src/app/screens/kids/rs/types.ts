/**
 * RS Teens (12–18) domain types — Serbian Latin script.
 *
 * Two balanced signature features modelled here:
 *  1. Payments with approval (curated payee list → live decision → result)
 *  2. The "Uči" educational coach (modules → lessons → quizzes → rewards)
 *
 * Improvements over the RO Teens types:
 *  - Goals carry an `IconName` (real iconography) instead of an emoji string.
 *  - Day/time helpers are derived from `new Date()` at creation time, not
 *    hardcoded date strings that rot the demo after day one.
 *  - The Learn module is first-class (RO had no Learn concept at all).
 */
import type { IconName } from "@/app/components/icons";

/* ----------------------------------------------------------------------- */
/* Navigation + views                                                       */
/* ----------------------------------------------------------------------- */

/** Bottom-nav destinations. "Plaćanja" sits in the centre — payments is a hero. */
export type RsTeenNavId = "home" | "payments" | "learn" | "card" | "profile";

/** Overlay screens layered above the active tab. */
export type RsTeenView =
  | "home"
  | "payments"
  | "learn"
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
  | "learn-topic"
  | "learn-lesson"
  | "theme";

export type RsTeenReturnView = Exclude<RsTeenView, "transaction-detail" | "pay" | "learn-lesson">;

/* ----------------------------------------------------------------------- */
/* Payees + payment decision engine                                        */
/* ----------------------------------------------------------------------- */

export type RsPayeeCategory = "family" | "friend" | "merchant" | "subscription";

export type RsPayee = {
  id: string;
  name: string;
  /** @handle, masked phone, or short descriptor shown under the name. */
  handle: string;
  category: RsPayeeCategory;
  icon: IconName;
  /** Token-based avatar background. */
  accent: string;
  /** Optional merchant brand-mark id rendered as an inline SVG. */
  merchantLogo?: RsMerchantLogoId;
  initials?: string;
  /** Max value allowed in a single payment to this payee. */
  perPaymentLimit: number;
  /** When true, every payment to this payee needs a parent OK, regardless of amount. */
  alwaysNeedsApproval: boolean;
  /** Trusted payees can settle instantly when the amount is within the instant threshold. */
  trusted: boolean;
  /** Short reassurance line, e.g. "Porodica — transfer instant". */
  note?: string;
};

/** Serbian merchant brand marks rendered as crisp inline SVGs (not emoji). */
export type RsMerchantLogoId =
  | "maxi"
  | "gomex"
  | "yuh"
  | "netflix"
  | "spotify"
  | "dm"
  | "milos-kafica"
  | "gsp";

export type PaymentDecisionStatus = "instant" | "needs-approval" | "blocked";

export type PaymentDecision = {
  status: PaymentDecisionStatus;
  /** Human-readable Serbian (Latin) explanation shown on the review step. */
  reason: string;
};

/* ----------------------------------------------------------------------- */
/* Approvals inbox (the parent-approval loop)                              */
/* ----------------------------------------------------------------------- */

export type RsApprovalKind = "payment" | "request" | "topup" | "task" | "learn-reward";
export type RsApprovalStatus = "pending" | "approved" | "declined" | "completed";

export type RsApproval = {
  id: string;
  kind: RsApprovalKind;
  title: string;
  /** Who the money goes to / comes from. */
  counterparty: string;
  amount: number;
  note?: string;
  status: RsApprovalStatus;
  createdAt: string;
  icon: IconName;
  accent: string;
};

/* ----------------------------------------------------------------------- */
/* Money movements                                                          */
/* ----------------------------------------------------------------------- */

export type RsSpendCategory =
  | "Prihod"
  | "Hrana"
  | "Zabava"
  | "Pretplate"
  | "Kupovina"
  | "Prevoz"
  | "Prijatelji";

export type RsTransaction = {
  id: string;
  merchant: string;
  subtitle: string;
  /** Negative = spend, positive = income. */
  amount: number;
  category: RsSpendCategory;
  icon: IconName;
  accent: string;
  /** Optional merchant brand-mark for richer transaction rows. */
  merchantLogo?: RsMerchantLogoId;
  /** Display label for the day header, e.g. "Danas", "Juče", "12 jul". */
  dayLabel: string;
  /** Sortable key, e.g. "2026-07-24". */
  dateKey: string;
  time: string;
  status: "Izvršeno" | "Na čekanju";
};

export type RsTransactionDayGroup = {
  key: string;
  title: string;
  transactions: RsTransaction[];
  total: number;
};

/* ----------------------------------------------------------------------- */
/* Goals + tasks                                                            */
/* ----------------------------------------------------------------------- */

export type RsGoal = {
  id: string;
  title: string;
  /** Real AppIcon name — never an emoji. */
  icon: IconName;
  /** Accent token for the goal card. */
  accent: string;
  targetAmount: number;
  savedAmount: number;
  helper: string;
  /** Auto-save rule descriptor, e.g. "Štediš 200 RSD nedeljno". */
  autoSave?: string;
};

export type RsGoalContribution = {
  id: string;
  goalId: string;
  title: string;
  subtitle: string;
  amount: number;
  tone: "self" | "parent";
};

export type RsTaskStatus = "todo" | "waiting-parent" | "approved";

export type RsTask = {
  id: string;
  title: string;
  recurrence: string;
  reward: number;
  icon: IconName;
  status: RsTaskStatus;
  parentNote?: string;
};

/* ----------------------------------------------------------------------- */
/* "Uči" — the educational coach (signature feature #2)                    */
/* ----------------------------------------------------------------------- */

export type RsLearnLessonContentBlock =
  | { kind: "text"; text: string }
  | { kind: "tip"; text: string }
  | { kind: "example"; text: string };

export type RsLearnQuizOption = {
  id: string;
  text: string;
  correct: boolean;
};

export type RsLearnQuiz = {
  question: string;
  options: RsLearnQuizOption[];
  /** Shown after the user answers. */
  explanation: string;
};

export type RsLearnLesson = {
  id: string;
  title: string;
  summary: string;
  /** Ordered teaching blocks shown before the quiz. */
  content: RsLearnLessonContentBlock[];
  quiz: RsLearnQuiz;
  /** Reward credited to the balance on completion (and tracked in approvals). */
  reward: number;
};

export type RsLearnModule = {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  accent: string;
  lessons: readonly [RsLearnLesson, ...RsLearnLesson[]];
};

export type RsLearnProgress = {
  /** lessonId → completed */
  completed: Record<string, boolean>;
};
