import type {
  CoAppingChatLabels,
  CoAppingChatMessage,
  CoAppingPanelLabels,
  CoAppingSessionLabels,
  CoAppingSuggestedTopic,
  CoAppingTerminateLabels,
} from "./types";

export const defaultChatLabels: CoAppingChatLabels = {
  assistantName: "Smart Assistant",
  onlineLabel: "Online now",
  backLabel: "Back to previous screen",
  addAttachmentLabel: "Add attachment",
  recordVoiceLabel: "Record voice message",
  sendLabel: "Send message",
  inputPlaceholder: "Ask me anything",
  suggestedTopicsLabel: "Suggested topics",
};

export const defaultInitialMessages: CoAppingChatMessage[] = [];

export const defaultSuggestedTopics: CoAppingSuggestedTopic[] = [
  { id: "payments", label: "How do payments work?" },
  { id: "products", label: "Show me product offers" },
  { id: "cards", label: "Is my card secure?" },
  { id: "insights", label: "Explain spending insights" },
];

export const defaultPanelLabels: CoAppingPanelLabels = {
  aboutSmartBanking: "ABOUT SMART BANKING",
  exchangeRates: "EXCHANGE RATES",
  findAtmBranches: "FIND ATM & BRANCHES",
  startCoAppingSession: "START CO-APPING SESSION",
};

export const defaultSessionLabels: CoAppingSessionLabels = {
  title: "Co-apping session",
  description:
    "You are about to have a co-apping session with your banker, where you will share your mobile screen for assistance in completing your banking needs.",
  instruction:
    "To start the process, enter the code provided by your banker over the phone and tap continue.",
  codeLabel: "Enter the code from banker",
  privacyText:
    "Your essential data will be protected and will not be shared with the banker.",
  continueLabel: "Continue",
  backLabel: "Back",
};

export const defaultTerminateLabels: CoAppingTerminateLabels = {
  title: "End co-apping session?",
  body: "Your screen sharing session will stop immediately.",
  cancel: "No",
  confirm: "Yes",
};

export function defaultReplyResolver(input: string) {
  const normalized = input.toLowerCase();

  if (normalized.includes("payment") || normalized.includes("transfer")) {
    return "In the demo you can start from Payments, choose a domestic transfer, review the recipient and amount, then sign the payment. I can also guide you through each step.";
  }

  if (normalized.includes("product") || normalized.includes("offer")) {
    return "The Products area groups accounts, cards, loans, protection, investments, and contextual offers. Each card is meant to explain the next best action without leaving the banking flow.";
  }

  if (
    normalized.includes("card") ||
    normalized.includes("secure") ||
    normalized.includes("security")
  ) {
    return "For cards and security, the demo highlights card details, transaction review, consent, messages, and support access. In a real app, sensitive actions would require strong authentication.";
  }

  if (
    normalized.includes("spending") ||
    normalized.includes("insight") ||
    normalized.includes("budget")
  ) {
    return "Spending insights summarize categories, recent movements, and patterns so the customer can understand where money goes before choosing a product or payment action.";
  }

  return "I can help with accounts, payments, products, cards, security, and how this simulation is structured. Pick a topic below or ask a specific question.";
}
