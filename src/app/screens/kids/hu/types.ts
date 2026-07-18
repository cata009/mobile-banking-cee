/**
 * HU Kids domain types.
 *
 * Extracted verbatim from KidsMarketHomeApp.tsx (kids-split Phase 3) so data,
 * money, and screen modules can share one type source without importing the
 * monolith.
 */
import type { IconName } from "@/app/components/icons";
import type { CountryId } from "@/app/state/demoTypes";
import type { AccountTransaction } from "@/data/accountDetails";
import type { LearnModule } from "@/data/huKidsBanking";

export type HuLightNavId = "home" | "analytics" | "payments" | "products" | "more";

export type HuLightView =
  | "home"
  | "theme"
  | "request-money"
  | "send-money"
  | "card-details"
  | "card-settings"
  | "messages"
  | "contacts"
  | "settings"
  | "transaction-detail"
  | "goals"
  | "goal-detail"
  | "create-goal"
  | "learn"
  | "learn-topic"
  | "learn-lesson"
  | "tasks";

export type HuMoneyReason = "Food" | "School" | "Transport" | "Fun" | "Other";

export type HuSendContact = "Anna" | "David" | "More contacts";

type HuPendingActionFlow = "request-money" | "send-money";

export type HuPendingActionTone = "green" | "blue" | "pink" | "amber";

type HuPendingActionStatus = "pending" | "approved";

export type HuMerchantLogoId =
  | "mcdonalds"
  | "youtube"
  | "apple"
  | "spotify"
  | "netflix"
  | "steam"
  | "amazon"
  | "roblox"
  | "tesco"
  | "ikea"
  | "nintendo"
  | "playstation";

export type HuTransactionReturnView = Exclude<HuLightView, "transaction-detail">;

export type HuPendingAction = {
  id: string;
  title: string;
  person: string;
  description: string;
  amountLabel: string;
  status: HuPendingActionStatus;
  tone: HuPendingActionTone;
  icon: IconName;
  flow: HuPendingActionFlow;
  createdAt: string;
};

type HuTaskStatus = "todo" | "waiting-parent" | "approved";

export type HuKidsTask = {
  id: string;
  title: string;
  recurrence: string;
  reward: number;
  status: HuTaskStatus;
  parentNote?: string;
};

export type HuGoalContribution = {
  id: string;
  goalId: string;
  title: string;
  subtitle: string;
  amount: number;
  createdAt: string;
  tone: "self" | "parent";
};

export type HuSendMoneyTransfer = {
  id: string;
  contactName: HuSendContact;
  amount: number;
  amountLabel: string;
  note?: string;
  status: HuPendingActionStatus;
  createdAt: string;
};

export type HuKidsTransaction = AccountTransaction & {
  merchantLogo?: HuMerchantLogoId;
  subtitle?: string;
  time?: string;
};

export type HuKidsCardDetailAction = {
  id: string;
  iconName: IconName;
  label: string;
  onClick?: () => void;
  hidden?: boolean;
};

export type HuKidsTransactionDayGroup = {
  key: string;
  title: string;
  transactions: HuKidsTransaction[];
  total: number;
};

export type HuLearnVisual = "balance" | "goals" | "safety" | "request" | "card";

export type HuLearnArtVariant = "topic-card" | "topic-featured" | "topic-hero" | "lesson-row" | "lesson-hero";

export type HuLearnArtworkKey =
  | "topic-money-basics"
  | "topic-saving-goals"
  | "topic-online-safety"
  | "topic-request-money"
  | "topic-card-confidence"
  | "balance"
  | "spend-today"
  | "money-check"
  | "target"
  | "boost"
  | "ask-help"
  | "pause"
  | "private-codes"
  | "report-safety"
  | "request-reason"
  | "request-amount"
  | "request-wait"
  | "card-pay"
  | "card-freeze"
  | "card-private";

export type HuLearnLesson = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  body: string[];
  visual: HuLearnVisual;
  slides: {
    title: string;
    text: string;
    points?: string[];
  }[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
};

export type HuLearnTopic = {
  id: string;
  moduleId: LearnModule["id"];
  title: string;
  subtitle: string;
  helper: string;
  visual: HuLearnVisual;
  lessons: HuLearnLesson[];
};

export type HuKidsMenuShapeCountry = Extract<CountryId, "BA">;

export type HuKidsRuntimeCountry = Extract<CountryId, "HU">;
