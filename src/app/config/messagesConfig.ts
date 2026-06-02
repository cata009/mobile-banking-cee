import type { CountryId } from "@/app/state/demoTypes";

export type MessageMailbox = "inbox" | "outbox";

export type MessageListItem = {
  id: string;
  day: string;
  month: string;
  title: string;
  description: string;
  badge?: string;
};

export type MessagesConfig = {
  title: string;
  tabs: {
    inbox: string;
    outbox: string;
  };
  sectionTitle: string;
  inbox: readonly MessageListItem[];
  outbox: readonly MessageListItem[];
};

const SHARED_MESSAGES_CONFIG: MessagesConfig = {
  title: "Messages",
  tabs: {
    inbox: "Inbox",
    outbox: "Outbox",
  },
  sectionTitle: "2025",
  inbox: [
    { id: "inbox-2025-10-01", day: "1", month: "OCT", title: "CARD NOTIFICATION", description: "Your card payment was processed.", badge: "NEW" },
    { id: "inbox-2025-09-30", day: "30", month: "SEP", title: "ACCOUNT STATEMENT", description: "Your September statement is ready.", badge: "NEW" },
    { id: "inbox-2025-09-29", day: "29", month: "SEP", title: "SECURITY NOTICE", description: "Review a recent login to your account.", badge: "NEW" },
    { id: "inbox-2025-09-18", day: "18", month: "SEP", title: "PAYMENT CONFIRMATION", description: "Your scheduled payment was sent.", badge: "NEW" },
    { id: "inbox-2025-09-14", day: "14", month: "SEP", title: "PRODUCT UPDATE", description: "New benefits are available in the app.", badge: "NEW" },
    { id: "inbox-2025-09-08", day: "8", month: "SEP", title: "CARD LIMIT CHANGE", description: "Your card limit update is complete." },
    { id: "inbox-2025-08-27", day: "27", month: "AUG", title: "DIRECT DEBIT", description: "A new direct debit mandate was created." },
    { id: "inbox-2025-08-19", day: "19", month: "AUG", title: "SAVINGS GOAL", description: "Your savings goal progress was updated." },
    { id: "inbox-2025-08-05", day: "5", month: "AUG", title: "TRAVEL NOTICE", description: "Card settings for travel are available." },
    { id: "inbox-2025-07-22", day: "22", month: "JUL", title: "LOAN INFORMATION", description: "Your repayment schedule has changed." },
    { id: "inbox-2025-07-10", day: "10", month: "JUL", title: "APP UPDATE", description: "A new mobile banking version is available." },
    { id: "inbox-2025-06-28", day: "28", month: "JUN", title: "MORTGAGE MESSAGE", description: "Your mortgage document is ready." },
    { id: "inbox-2025-06-03", day: "3", month: "JUN", title: "TERM DEPOSIT", description: "Your term deposit maturity is approaching." },
    { id: "inbox-2025-05-21", day: "21", month: "MAY", title: "PROFILE UPDATE", description: "Your contact information was changed." },
    { id: "inbox-2025-04-16", day: "16", month: "APR", title: "TAX PAYMENT", description: "A tax payment reminder is available." },
    { id: "inbox-2025-03-07", day: "7", month: "MAR", title: "WELCOME MESSAGE", description: "Discover useful mobile banking features." },
  ],
  outbox: [
    { id: "outbox-2025-09-24", day: "24", month: "SEP", title: "SUPPORT REQUEST", description: "Question about a card transaction." },
    { id: "outbox-2025-08-12", day: "12", month: "AUG", title: "DOCUMENT REQUEST", description: "Request for account confirmation." },
    { id: "outbox-2025-08-02", day: "2", month: "AUG", title: "CARD LIMIT REQUEST", description: "Temporary limit change request." },
    { id: "outbox-2025-07-17", day: "17", month: "JUL", title: "ADDRESS UPDATE", description: "Submitted a new correspondence address." },
    { id: "outbox-2025-06-11", day: "11", month: "JUN", title: "PAYMENT INVESTIGATION", description: "Question about an outgoing payment." },
    { id: "outbox-2025-05-30", day: "30", month: "MAY", title: "SAVINGS REQUEST", description: "Request to adjust savings settings." },
    { id: "outbox-2025-05-12", day: "12", month: "MAY", title: "CARD REISSUE", description: "Submitted a card reissue request." },
    { id: "outbox-2025-04-23", day: "23", month: "APR", title: "PRODUCT QUESTION", description: "Question about account conditions." },
    { id: "outbox-2025-03-19", day: "19", month: "MAR", title: "BRANCH APPOINTMENT", description: "Requested a meeting with an advisor." },
    { id: "outbox-2025-02-05", day: "5", month: "FEB", title: "GENERAL MESSAGE", description: "Message sent to customer support." },
  ],
};

export const MESSAGES_CONFIG_BY_COUNTRY: Record<CountryId, MessagesConfig> = {
  RO: SHARED_MESSAGES_CONFIG,
  RS: SHARED_MESSAGES_CONFIG,
  HU: SHARED_MESSAGES_CONFIG,
  BA: SHARED_MESSAGES_CONFIG,
  BA_BL: SHARED_MESSAGES_CONFIG,
  SK: SHARED_MESSAGES_CONFIG,
  SI: SHARED_MESSAGES_CONFIG,
  CZ: SHARED_MESSAGES_CONFIG,
};

export function getMessagesConfigForCountry(country: CountryId): MessagesConfig {
  return MESSAGES_CONFIG_BY_COUNTRY[country];
}
