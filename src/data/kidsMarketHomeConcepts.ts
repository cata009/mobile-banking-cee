import type { CountryId } from "@/app/state/demoTypes";

export type KidsHomeCountry = Extract<CountryId, "CZ" | "SK" | "HU" | "BA" | "BA_BL" | "SI">;

export type KidsHomeStyle =
  | "cz-pocket-plan"
  | "sk-guided-flow"
  | "sk-bulbank-kids"
  | "hu-smart-fintech"
  | "ba-family-hub"
  | "ba-bl-card-first"
  | "si-goal-coach";

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
  pockets: KidsHomePocket[];
  feed: KidsHomeFeedItem[];
  coach: KidsHomeCoachItem[];
  nav: KidsBottomNavItem[];
}

export const KIDS_HOME_COUNTRIES: readonly KidsHomeCountry[] = ["CZ", "SK", "HU", "BA", "BA_BL", "SI"] as const;

export const KIDS_MARKET_HOME_CONCEPTS: Record<KidsHomeCountry, KidsMarketHomeConcept> = {
  CZ: {
    country: "CZ",
    style: "cz-pocket-plan",
    conceptLabel: "CZ Kids Lab",
    childName: "Ela",
    childAge: 14,
    avatar: "EL",
    greeting: "Ahoj, Ela",
    heroTitle: "Your money plan",
    heroSubtitle: "Spend, save, and ask with one calm view.",
    balance: 1240,
    safeToday: 210,
    parentName: "Mum",
    allowanceLabel: "Weekly allowance",
    allowanceAmount: 350,
    allowanceNext: "Friday, 5 Jun",
    approvalCopy: "Bigger transfers go to Mum first.",
    cardStatus: "Card active",
    metrics: [
      { label: "Lunch + tram", value: "140 left", hint: "planned for today" },
      { label: "Parent OK", value: "1 pending", hint: "school trip top-up" },
      { label: "Round-ups", value: "18 saved", hint: "this week" },
    ],
    actions: [
      { label: "Ask", detail: "Money request", icon: "circle-dollar-sign", tone: "red" },
      { label: "Card", detail: "Limits & wallet", icon: "credit-card", tone: "teal" },
      { label: "Save", detail: "Move to goal", icon: "piggy-bank", tone: "green" },
      { label: "Check", detail: "What parent sees", icon: "shield-check", tone: "neutral" },
    ],
    pockets: [
      { title: "Skateboard", savedAmount: 820, targetAmount: 1600, emojiLabel: "SK8", helper: "Best next step: save 80 CZK" },
      { title: "School trip", savedAmount: 430, targetAmount: 1200, emojiLabel: "TRIP", helper: "Mum can help from approval" },
    ],
    feed: [
      { title: "From Mum", amount: 150, category: "Family", time: "Today" },
      { title: "Kantyna Praha", amount: -89, category: "Food", time: "Today" },
      { title: "Tram ticket", amount: -30, category: "Transport", time: "Yesterday" },
    ],
    coach: [
      { title: "Tiny win", body: "You kept lunch under plan two days in a row.", value: "+2 streak" },
      { title: "Safe share", body: "Mum can see payments and limits, not your app theme.", value: "Clear" },
    ],
    nav: [
      { id: "home", label: "Home", icon: "nav-home" },
      { id: "activity", label: "Activity", icon: "receipt-text" },
      { id: "goals", label: "Goals", icon: "piggy-bank" },
      { id: "card", label: "Card", icon: "credit-card" },
      { id: "more", label: "More", icon: "nav-more" },
    ],
  },
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
    conceptLabel: "HU Smart Kids",
    childName: "Bence",
    childAge: 15,
    avatar: "BE",
    greeting: "Szia, Bence",
    heroTitle: "Money cockpit",
    heroSubtitle: "Fast balance, smart pockets, and spend insight in one swipeable home.",
    balance: 25400,
    safeToday: 2800,
    parentName: "Mum",
    allowanceLabel: "Next auto top-up",
    allowanceAmount: 8000,
    allowanceNext: "Friday, 5 Jun",
    approvalCopy: "Large sends become one-tap approvals for Mum.",
    cardStatus: "Virtual + physical card active",
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
  BA: {
    country: "BA",
    style: "ba-family-hub",
    conceptLabel: "BA Family Kids",
    childName: "Amina",
    childAge: 13,
    avatar: "AM",
    greeting: "Zdravo, Amina",
    heroTitle: "Family money hub",
    heroSubtitle: "Ask, save, and see what needs parent approval without stress.",
    balance: 128,
    safeToday: 18,
    parentName: "Mama",
    allowanceLabel: "Family allowance",
    allowanceAmount: 25,
    allowanceNext: "Friday, 5 Jun",
    approvalCopy: "Mama sees payment requests and safety limits, not your personal notes.",
    cardStatus: "Card active with online payments watched",
    metrics: [
      { label: "Family requests", value: "2 live", hint: "one top-up, one chore" },
      { label: "Safe card", value: "18 today", hint: "inside the family plan" },
      { label: "Goal boost", value: "35 saved", hint: "camp money" },
    ],
    actions: [
      { label: "Ask", detail: "Request from family", icon: "circle-dollar-sign", tone: "red" },
      { label: "Family OK", detail: "What needs approval", icon: "users", tone: "teal" },
      { label: "Save", detail: "Move to a goal", icon: "piggy-bank", tone: "green" },
      { label: "Card", detail: "Safety and limits", icon: "credit-card", tone: "neutral" },
    ],
    pockets: [
      { title: "School camp", savedAmount: 96, targetAmount: 320, emojiLabel: "CAMP", helper: "Ask family to add 20 BAM" },
      { title: "New sneakers", savedAmount: 44, targetAmount: 180, emojiLabel: "STEP", helper: "Round-ups can help this week" },
    ],
    feed: [
      { title: "From Mama", amount: 25, category: "Family", time: "Today" },
      { title: "Bakery Sarajevo", amount: -4, category: "Food", time: "Today" },
      { title: "Bus card", amount: -3, category: "Transport", time: "Yesterday" },
    ],
    coach: [
      { title: "Family clarity", body: "Approvals are grouped so parents see the right moment, not every tap.", value: "Calm" },
      { title: "Privacy note", body: "Your goal names stay yours unless you ask family to help.", value: "Clear" },
      { title: "Next step", body: "Save 8 BAM after Friday and camp stays on track.", value: "On plan" },
    ],
    nav: [
      { id: "home", label: "Home", icon: "nav-home" },
      { id: "requests", label: "Ask", icon: "circle-dollar-sign" },
      { id: "goals", label: "Goals", icon: "piggy-bank" },
      { id: "card", label: "Card", icon: "credit-card" },
      { id: "family", label: "Family", icon: "users" },
    ],
  },
  BA_BL: {
    country: "BA_BL",
    style: "ba-bl-card-first",
    conceptLabel: "BA BL Card First",
    childName: "Luka",
    childAge: 14,
    avatar: "LU",
    greeting: "Zdravo, Luka",
    heroTitle: "Card first, parent close",
    heroSubtitle: "A faster home centered on card status, quick sends, and approval confidence.",
    balance: 156,
    safeToday: 22,
    parentName: "Tata",
    allowanceLabel: "Friday pocket money",
    allowanceAmount: 30,
    allowanceNext: "Friday, 5 Jun",
    approvalCopy: "Tata approves new people and larger sends before money leaves.",
    cardStatus: "Physical card active, wallet check ready",
    metrics: [
      { label: "Card lane", value: "Active", hint: "wallet check ready" },
      { label: "Approval queue", value: "1 item", hint: "new person send" },
      { label: "Goal jump", value: "+12", hint: "from chores" },
    ],
    actions: [
      { label: "Card", detail: "Freeze or check limits", icon: "credit-card", tone: "red" },
      { label: "Ask", detail: "Need a top-up", icon: "circle-dollar-sign", tone: "teal" },
      { label: "Send", detail: "Parent-safe transfer", icon: "send", tone: "blue" },
      { label: "Reward", detail: "Chore waiting", icon: "gift", tone: "yellow" },
    ],
    pockets: [
      { title: "Weekend bike", savedAmount: 72, targetAmount: 260, emojiLabel: "RIDE", helper: "Chore reward can add 12 BAM" },
      { title: "Gaming headset", savedAmount: 58, targetAmount: 210, emojiLabel: "PLAY", helper: "Try 10 BAM after allowance" },
      { title: "Training shoes", savedAmount: 24, targetAmount: 190, emojiLabel: "TEAM", helper: "Early goal, keep it light" },
    ],
    feed: [
      { title: "Tata top-up", amount: 30, category: "Family", time: "Today" },
      { title: "Sports shop", amount: -11, category: "Sport", time: "Today" },
      { title: "Cafe Banja Luka", amount: -5, category: "Food", time: "Yesterday" },
    ],
    coach: [
      { title: "Card-first flow", body: "Your card controls are always one tap away before spending.", value: "Ready" },
      { title: "Approval reason", body: "Sending to a new person creates a parent card, not a hard block.", value: "Smart" },
      { title: "Small win", body: "You are spending less on snacks than last week.", value: "Good" },
    ],
    nav: [
      { id: "home", label: "Home", icon: "nav-home" },
      { id: "requests", label: "Ask", icon: "circle-dollar-sign" },
      { id: "card", label: "Card", icon: "credit-card" },
      { id: "activity", label: "Activity", icon: "receipt-text" },
      { id: "more", label: "More", icon: "nav-more" },
    ],
  },
  SI: {
    country: "SI",
    style: "si-goal-coach",
    conceptLabel: "SI Goal Coach",
    childName: "Nika",
    childAge: 15,
    avatar: "NI",
    greeting: "Zivjo, Nika",
    heroTitle: "Plan the week",
    heroSubtitle: "A calmer teen home for weekly planning, goals, and transparent parent support.",
    balance: 118,
    safeToday: 16,
    parentName: "Mum",
    allowanceLabel: "Monthly allowance",
    allowanceAmount: 30,
    allowanceNext: "Monday, 8 Jun",
    approvalCopy: "Mum helps with high-value transfers and new people only.",
    cardStatus: "Card active, online approval on",
    metrics: [
      { label: "Week runway", value: "4 days", hint: "until allowance" },
      { label: "Goal path", value: "62%", hint: "Ljubljana trip" },
      { label: "Parent see", value: "Clear", hint: "shared items listed" },
    ],
    actions: [
      { label: "Plan", detail: "See the week", icon: "calendar-days", tone: "teal" },
      { label: "Ask", detail: "Send a request", icon: "circle-dollar-sign", tone: "red" },
      { label: "Save", detail: "Goal transfer", icon: "piggy-bank", tone: "green" },
      { label: "Learn", detail: "Short safety tip", icon: "book-open", tone: "neutral" },
    ],
    pockets: [
      { title: "Ljubljana trip", savedAmount: 75, targetAmount: 140, emojiLabel: "TRIP", helper: "Save 6 EUR this week" },
      { title: "Headphones", savedAmount: 38, targetAmount: 120, emojiLabel: "SOUND", helper: "Round-ups are working" },
      { title: "Climbing class", savedAmount: 24, targetAmount: 90, emojiLabel: "CLIMB", helper: "Ask Mum to match 10 EUR" },
    ],
    feed: [
      { title: "Allowance", amount: 30, category: "Family", time: "Today" },
      { title: "Bookshop Ljubljana", amount: -9, category: "School", time: "Today" },
      { title: "Bus ticket", amount: -2, category: "Transport", time: "Yesterday" },
    ],
    coach: [
      { title: "Weekly coach", body: "Keep 16 EUR flexible and the trip goal still lands on time.", value: "Balanced" },
      { title: "Autonomy signal", body: "Small transfers go through; higher-risk moves ask Mum first.", value: "Trusted" },
      { title: "Transparency", body: "You can always open the shared-with-parent list.", value: "Open" },
    ],
    nav: [
      { id: "home", label: "Home", icon: "nav-home" },
      { id: "plan", label: "Plan", icon: "calendar-days" },
      { id: "goals", label: "Goals", icon: "piggy-bank" },
      { id: "learn", label: "Learn", icon: "book-open" },
      { id: "profile", label: "Profile", icon: "user-round" },
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
