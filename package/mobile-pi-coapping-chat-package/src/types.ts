import type { ReactNode } from "react";

export type CoAppingChatRole = "agent" | "user";

export type CoAppingChatActionTarget =
  | "investments"
  | "investments-history"
  | "analytics"
  | "card-detail"
  | "products";

export interface CoAppingChatAction {
  id: string;
  label: string;
  type: "send-message" | "navigate";
  prompt?: string;
  target?: CoAppingChatActionTarget;
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
  action?: CoAppingChatAction;
}

export type CoAppingRichBlock =
  | {
      type: "investment-summary";
      eyebrow: string;
      title: string;
      body: string;
      metrics: CoAppingRichMetric[];
      action?: CoAppingChatAction;
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
    }
  | {
      type: "spending-insight";
      title: string;
      body: string;
      metrics: CoAppingRichMetric[];
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
  followUps?: CoAppingFollowUpSuggestion[];
}

export interface CoAppingSuggestedTopic {
  id: string;
  label: string;
  prompt?: string;
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

export type CoAppingReplyResolver = (
  input: string,
  history: CoAppingChatMessage[],
) => string | Promise<string>;

export interface CoAppingMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
}
