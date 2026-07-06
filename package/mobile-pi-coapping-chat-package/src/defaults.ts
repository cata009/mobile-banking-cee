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
  { id: "savings", label: "Help me plan my savings" },
  { id: "documents", label: "Find my confirmation documents" },
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
    return "### Payment route\nStart from **Payments** and keep the flow clear:\n1. Choose the transfer type.\n2. Add recipient and amount.\n3. Review fees, limits, and execution date.\n4. Sign before submission.\nI can also guide the user through each step as a focused assistant flow.";
  }

  if (normalized.includes("product") || normalized.includes("offer")) {
    return "### Product discovery\nThe Products area groups accounts, cards, loans, protection, investments, and contextual offers.\n- Use cards for clear next-best actions.\n- Keep offer eligibility visible.\n- Let the user continue without leaving the banking flow.";
  }

  if (
    normalized.includes("card") ||
    normalized.includes("secure") ||
    normalized.includes("security")
  ) {
    return "### Card and security checks\nThe assistant can explain the safe route:\n1. Review card details and recent transactions.\n2. Check limits, online payments, and contactless settings.\n3. Use support access for suspicious activity.\nSensitive actions still require strong authentication.";
  }

  if (
    normalized.includes("account") ||
    normalized.includes("balance") ||
    normalized.includes("iban") ||
    normalized.includes("transaction")
  ) {
    return "### Account help\nI can help narrow the account task before you continue.\n1. Check whether you need **balance**, **details**, or **transactions**.\n2. Use search or filters when the transaction list is long.\n3. Open account details for IBAN, account number, and sharing information.\nSensitive account actions should stay inside the authenticated banking flow.";
  }

  if (
    normalized.includes("spending") ||
    normalized.includes("insight") ||
    normalized.includes("budget")
  ) {
    return "### Spending insight summary\nSpending insights should explain what changed, not just show numbers.\n- categories\n- recent movements\n- recurring patterns\n- unusual card payments\nThis helps the customer understand where money goes before choosing the next action.";
  }

  if (
    normalized.includes("saving") ||
    normalized.includes("savings") ||
    normalized.includes("invest")
  ) {
    return "### Savings planning\nStart with the goal and the time horizon before choosing a product.\n1. Keep short-term money in lower-volatility options.\n2. Separate emergency reserve from planned investing.\n3. Review fees, currency, and product risk before committing.\nA recurring amount can help build the habit without forcing a perfect entry day.";
  }

  if (
    normalized.includes("document") ||
    normalized.includes("confirmation") ||
    normalized.includes("statement")
  ) {
    return "### Document search\nI can help narrow the search before opening Documents.\n- confirmations\n- statements\n- product documents\n- legal notices\nUse the newest date first, then filter by account or product if the list is long.";
  }

  return "### I can help with\n- Accounts and balance explanations\n- Payments and confirmations\n- Products, offers, and investments\n- Cards, limits, and security\nPick a topic below or ask a specific question.";
}
