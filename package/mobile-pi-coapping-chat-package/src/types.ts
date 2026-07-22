import type { ReactNode } from "react";

export type CoAppingChatRole = "agent" | "user";

export type CoAppingChatActionTarget =
  | "investments"
  | "investment-funds"
  | "investment-buy"
  | "investments-history"
  | "analytics"
  | "card-detail"
  | "credit-limit-review"
  | "product-detail"
  | "products"
  | "payments"
  | "documents"
  | "messages"
  | "settings"
  | "contacts"
  | "prime"
  | "account-detail";

export interface CoAppingInvestmentBuyDraft {
  quantity: number;
  accountId: string;
  frequency: "one-off";
  executionTiming: "today" | "next-business-day";
}

export type CoAppingInvestmentFundCollectionId =
  | "onemarket"
  | "selection-plus"
  | "featured"
  | "equity"
  | "balanced"
  | "conservative";

export interface CoAppingChatAction {
  id: string;
  label: string;
  type: "send-message" | "navigate";
  prompt?: string;
  target?: CoAppingChatActionTarget;
  securityId?: string;
  investmentBuyDraft?: CoAppingInvestmentBuyDraft;
  investmentFundCollectionId?: CoAppingInvestmentFundCollectionId;
}

export interface CoAppingFollowUpSuggestion {
  id: string;
  label: string;
  prompt?: string;
  action?: CoAppingChatAction;
}

export interface CoAppingRichMetric {
  label: string;
  value: string;
  helper?: string;
  icon?: string;
}

export type CoAppingInvestmentChartPeriod = "1m" | "3m" | "1y" | "3y" | "max";

export interface CoAppingInvestmentChartPoint {
  label: string;
  dateLabel: string;
  yearLabel: string;
  value: number;
  showDot?: boolean;
}

export interface CoAppingInvestmentChart {
  currency: string;
  defaultPeriod: CoAppingInvestmentChartPeriod;
  series: Readonly<Record<CoAppingInvestmentChartPeriod, readonly CoAppingInvestmentChartPoint[]>>;
}

export interface CoAppingRichAllocationItem {
  label: string;
  value: number;
  helper?: string;
}

export interface CoAppingRichProjectionScenario {
  label: string;
  value: string;
  detail: string;
  emphasis?: boolean;
}

export interface CoAppingRichProductCard {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  tone?: "blue" | "dark" | "neutral";
  icon?: string;
  action?: CoAppingChatAction;
}

export type CoAppingRichBlock =
  | {
      type: "investment-summary";
      eyebrow?: string;
      logoId?: string;
      title: string;
      body: string;
      metrics: CoAppingRichMetric[];
      metricLayout?: "grid" | "stack";
      action?: CoAppingChatAction;
      chart?: CoAppingInvestmentChart;
    }
  | {
      type: "investment-allocation";
      title: string;
      body: string;
      items: CoAppingRichAllocationItem[];
      action?: CoAppingChatAction;
    }
  | {
      type: "investment-projection";
      title: string;
      body: string;
      scenarios: CoAppingRichProjectionScenario[];
      action?: CoAppingChatAction;
    }
  | {
      type: "product-cards";
      title: string;
      body: string;
      products: CoAppingRichProductCard[];
      variant?: "compact";
      footer?: string;
      interactive?: boolean;
    }
  | {
      type: "credit-limit-offer";
      title: string;
      body: string;
      cardName: string;
      cardDescription: string;
      currentLimitLabel?: string;
      currentLimit: string;
      newLimitLabel?: string;
      newLimit: string;
      action?: CoAppingChatAction;
    }
  | {
      type: "spending-insight";
      title: string;
      body: string;
      metrics: CoAppingRichMetric[];
      metricLayout?: "grid" | "calculation";
      action?: CoAppingChatAction;
    };

export interface CoAppingChatMessage {
  id: string;
  role: CoAppingChatRole;
  text: string;
  time: string;
  createdAt?: string;
  isStreaming?: boolean;
  richBlocks?: CoAppingRichBlock[];
  richBlocksPosition?: "before-text" | "after-text";
  followUps?: CoAppingFollowUpSuggestion[];
}

export interface CoAppingSuggestedTopic {
  id: string;
  label: string;
  prompt?: string;
}

export interface CoAppingOpportunityMetric {
  label: string;
  value: string;
  helper?: string;
}

export interface CoAppingOpportunityRelatedItem {
  title: string;
  description: string;
  visualKind?: "credit-card";
  visual?: ReactNode;
  action?: CoAppingChatAction;
}

export interface CoAppingOpportunity {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  reason: string;
  priority?: "primary" | "secondary";
  tone?: "credit" | "savings" | "investment" | "support" | "neutral";
  relatedItem?: CoAppingOpportunityRelatedItem;
  metrics?: CoAppingOpportunityMetric[];
  action?: CoAppingChatAction;
}

export interface CoAppingChatContext {
  id: string;
  title: string;
  suggestedTopics?: CoAppingSuggestedTopic[];
}

export interface CoAppingChatLabels {
  assistantName: string;
  onlineLabel: string;
  backLabel: string;
  addAttachmentLabel: string;
  recordVoiceLabel: string;
  sendLabel: string;
  inputPlaceholder: string;
  suggestedTopicsLabel: string;
}

export interface CoAppingPanelLabels {
  aboutSmartBanking: string;
  exchangeRates: string;
  findAtmBranches: string;
  startCoAppingSession: string;
}

export interface CoAppingSessionLabels {
  title: string;
  description: string;
  instruction: string;
  codeLabel: string;
  privacyText: string;
  continueLabel: string;
  backLabel: string;
}

export interface CoAppingTerminateLabels {
  title: string;
  body: string;
  cancel: string;
  confirm: string;
}

export type CoAppingReplyResult =
  | string
  | Pick<CoAppingChatMessage, "text" | "richBlocks" | "richBlocksPosition" | "followUps">;

export type CoAppingReplyResolver = (
  input: string,
  history: CoAppingChatMessage[],
) => CoAppingReplyResult | Promise<CoAppingReplyResult>;

export interface CoAppingMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
}
