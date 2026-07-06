import type { ReactNode } from "react";

export type CoAppingChatRole = "agent" | "user";

export interface CoAppingChatMessage {
  id: string;
  role: CoAppingChatRole;
  text: string;
  time: string;
  createdAt?: string;
  isStreaming?: boolean;
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
