import type { CountryId } from "@/app/state/demoTypes";

export type KidsHomeCountry = Extract<CountryId, "SK" | "HU">;

export type KidsHomeStyle =
  | "sk-guided-flow"
  | "sk-bulbank-kids"
  | "hu-smart-fintech";

export type KidsBottomNavId =
  | "home"
  | "activity"
  | "goals"
  | "card"
  | "learn"
  | "education"
  | "tasks"
  | "more"
  | "pockets"
  | "insights"
  | "requests"
  | "family"
  | "plan"
  | "profile";

export interface KidsHomeMetric {
  label: string;
  value: string;
  hint: string;
}

export interface KidsHomeAction {
  label: string;
  detail: string;
  icon: string;
  tone: "red" | "teal" | "blue" | "green" | "yellow" | "orange" | "neutral";
}

export interface KidsHomePocket {
  title: string;
  savedAmount: number;
  targetAmount: number;
  emojiLabel: string;
  helper: string;
}

export interface KidsHomeFeedItem {
  title: string;
  amount: number;
  category: string;
  time: string;
}

export interface KidsHomeCoachItem {
  title: string;
  body: string;
  value: string;
}

export interface KidsBottomNavItem {
  id: KidsBottomNavId;
  label: string;
  icon: string;
}

export interface KidsMarketHomeConcept {
  country: KidsHomeCountry;
  style: KidsHomeStyle;
  conceptLabel: string;
  childName: string;
  childAge: number;
  avatar: string;
  greeting: string;
  heroTitle: string;
  heroSubtitle: string;
  balance: number;
  safeToday: number;
  parentName: string;
  allowanceLabel: string;
  allowanceAmount: number;
  allowanceNext: string;
  approvalCopy: string;
  cardStatus: string;
  metrics: KidsHomeMetric[];
  actions: KidsHomeAction[];
  pockets: [KidsHomePocket, ...KidsHomePocket[]];
  feed: KidsHomeFeedItem[];
  coach: KidsHomeCoachItem[];
  nav: KidsBottomNavItem[];
}

export const KIDS_HOME_COUNTRIES: readonly KidsHomeCountry[] = ["SK", "HU"] as const;

export const KIDS_MARKET_HOME_CONCEPTS: Record<KidsHomeCountry, KidsMarketHomeConcept> = {
  SK: {
    country: "SK",
    style: "sk-bulbank-kids",
    conceptLabel: "SK Kids mode",
    childName: "Maria",
    childAge: 12,
    avatar: "MA",
    greeting: "Ahoj, Maria",
    heroTitle: "Products",
    heroSubtitle: "Bulbank-inspired Kids home with accounts, tasks, education, and request money.",
    balance: 2000,
    safeToday: 18,
    parentName: "Dad",
    allowanceLabel: "Kids account 1",
    allowanceAmount: 20,
    allowanceNext: "Friday, 5 Jun",
    approvalCopy: "Request money and finished tasks go to Dad for approval before money moves.",
    cardStatus: "Mastercard Debit active",
    metrics: [
      { label: "Education", value: "4/12", hint: "money lessons learned" },
      { label: "Tasks", value: "2 todo", hint: "17 EUR available" },
      { label: "Requests", value: "1 pending", hint: "waiting for Dad" },
    ],
    actions: [
      { label: "Your tasks", detail: "2 waiting", icon: "clipboard-check", tone: "orange" },
      { label: "Request money", detail: "Ask Dad", icon: "circle-dollar-sign", tone: "orange" },
    ],
    pockets: [
      { title: "Get a savings goal", savedAmount: 45, targetAmount: 120, emojiLabel: "SAVE", helper: "Offer banner style from the Bulbank concept" },
      { title: "Bike repair", savedAmount: 16, targetAmount: 45, emojiLabel: "FIX", helper: "Almost halfway there" },
    ],
    feed: [
      { title: "Request money", amount: 20, category: "Family", time: "Pending" },
      { title: "Clean your room", amount: 5, category: "Task", time: "To do" },
      { title: "School buffet", amount: -4, category: "Food", time: "Today" },
    ],
    coach: [
      { title: "Keep up with the good work Maria!", body: "You have learned 4 of 12 money lessons.", value: "4/12" },
      { title: "Parent link", body: "Dad can approve request money and completed tasks from My family.", value: "Clear" },
    ],
    nav: [
      { id: "home", label: "Home", icon: "nav-home" },
      { id: "education", label: "Education", icon: "book-open" },
      { id: "tasks", label: "Tasks", icon: "clipboard-check" },
      { id: "more", label: "More", icon: "nav-more" },
    ],
  },
  HU: {
    country: "HU",
    style: "hu-smart-fintech",
    conceptLabel: "HU Kids CEE light restyle",
    childName: "Alexandra",
    childAge: 13,
    avatar: "AL",
    greeting: "Welcome back Alexandra",
    heroTitle: "are available for you to spend",
    heroSubtitle: "CEE light restyle homepage for money, cards, tasks, and goals.",
    balance: 35628.34,
    safeToday: 50000,
    parentName: "Grandpa Andrei",
    allowanceLabel: "Weekly limit",
    allowanceAmount: 75000,
    allowanceNext: "2 days left",
    approvalCopy: "Request money, tasks, and card actions are staged for the next interactive polish pass.",
    cardStatus: "Mastercard Standard active",
    metrics: [
      { label: "Spend radar", value: "74%", hint: "under weekly plan" },
      { label: "Pockets", value: "3 live", hint: "auto-save enabled" },
      { label: "Challenge", value: "1 ready", hint: "reward awaiting OK" },
    ],
    actions: [
      { label: "Ask", detail: "Clean request", icon: "circle-dollar-sign", tone: "red" },
      { label: "Send", detail: "Smart approval", icon: "send", tone: "teal" },
      { label: "Pocket", detail: "Auto-save", icon: "piggy-bank", tone: "blue" },
      { label: "Freeze", detail: "Card safety", icon: "shield-check", tone: "neutral" },
    ],
    pockets: [
      { title: "Festival pass", savedAmount: 12600, targetAmount: 38000, emojiLabel: "PASS", helper: "Auto-save 700 Ft weekly" },
      { title: "Sneakers", savedAmount: 8900, targetAmount: 24000, emojiLabel: "DROP", helper: "Round-ups are on" },
      { title: "Gaming chair", savedAmount: 4200, targetAmount: 52000, emojiLabel: "PLAY", helper: "Challenge reward can boost it" },
    ],
    feed: [
      { title: "Top-up from Mum", amount: 8000, category: "Family", time: "Today" },
      { title: "Cinema Budapest", amount: -2100, category: "Fun", time: "Today" },
      { title: "Corner shop", amount: -780, category: "Food", time: "Yesterday" },
    ],
    coach: [
      { title: "Smart prediction", body: "You can spend 2,800 Ft today and still hit Festival pass by August.", value: "On track" },
      { title: "Instant insight", body: "Food is lower than last week. Fun is higher, but still inside the plan.", value: "Good mix" },
      { title: "Challenge reward", body: "Homework plan is waiting for parent approval.", value: "+1,500" },
    ],
    nav: [
      { id: "home", label: "Home", icon: "nav-home" },
      { id: "pockets", label: "Pockets", icon: "piggy-bank" },
      { id: "card", label: "Card", icon: "credit-card" },
      { id: "insights", label: "Insights", icon: "receipt-text" },
      { id: "more", label: "Profile", icon: "user-round" },
    ],
  },
};

export function isKidsHomeCountry(country: CountryId): country is KidsHomeCountry {
  return KIDS_HOME_COUNTRIES.includes(country as KidsHomeCountry);
}

export function getKidsHomeConcept(country: KidsHomeCountry): KidsMarketHomeConcept {
  return KIDS_MARKET_HOME_CONCEPTS[country];
}

export function getPocketProgress(pocket: KidsHomePocket): number {
  if (pocket.targetAmount <= 0) return 0;
  return Math.min(100, Math.round((pocket.savedAmount / pocket.targetAmount) * 100));
}
