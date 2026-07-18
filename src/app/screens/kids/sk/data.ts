/**
 * SK Kids (Bulbank concept) seed content.
 *
 * Extracted verbatim from KidsMarketHomeApp.tsx (kids-split Phase 2) so the SK
 * fork owns its own mock data instead of sharing the monolith.
 */

export const SK_TASKS = [
  { title: "Clean your room", status: "TO DO", reward: 5, icon: "nav-home", tone: "green" },
  { title: "Do your homework", status: "TO DO", reward: 12, icon: "book-open", tone: "teal" },
  { title: "Fruit per day", status: "Rejected by parent", reward: 8, icon: "gift", tone: "orange" },
] as const;

export const SK_LESSONS = [
  { title: "ESG", icon: "piggy-bank", tone: "green" },
  { title: "Skills for transition", icon: "send", tone: "orange" },
  { title: "Saving habits", icon: "gift", tone: "teal" },
  { title: "What is a budget?", icon: "receipt-text", tone: "blue" },
] as const;

export const SK_MORE_ITEMS = [
  { title: "Analytics", icon: "receipt-text", tone: "teal" },
  { title: "My profile", icon: "user-round", tone: "orange" },
  { title: "Settings", icon: "shield-check", tone: "green" },
  { title: "Contacts and info", icon: "header-messages", tone: "blue" },
  { title: "My family", icon: "users", tone: "orange" },
] as const;
