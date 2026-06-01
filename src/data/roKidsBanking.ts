export type RonCurrency = "RON";

export type KidsMode = "kids" | "teen";

export type MoneyReason = "Food" | "Transport" | "School" | "Fun" | "Other";

export type RequestStatus = "draft" | "pending" | "approved" | "declined";

export type ChoreStatus = "todo" | "waitingApproval" | "completed" | "paid";

export type ApprovalStatus = "pending" | "approved" | "declined";

export type ApprovalType = "moneyRequest" | "sendMoney" | "bigTicket" | "chore";

export type TransactionCategory =
  | "Food"
  | "Games"
  | "Transport"
  | "Family"
  | "School"
  | "Other";

export type CardTheme =
  | "classicRed"
  | "neon"
  | "soft"
  | "sport"
  | "minimal"
  | "nature"
  | "dark";

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  mode: KidsMode;
  balance: number;
  currency: RonCurrency;
  avatar?: string;
  cardTheme?: CardTheme;
}

export interface ParentProfile {
  id: string;
  name: string;
  phone: string;
}

export interface MoneyRequest {
  id: string;
  childId: string;
  amount: number;
  currency: RonCurrency;
  reason: MoneyReason;
  note?: string;
  status: RequestStatus;
  createdAt: string;
  parentNote?: string;
}

export interface SendMoneyRequest {
  id: string;
  childId: string;
  contactName: string;
  amount: number;
  currency: RonCurrency;
  note?: string;
  status: RequestStatus;
  createdAt: string;
}

export interface SavingGoal {
  id: string;
  childId: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  currency: RonCurrency;
  icon?: string;
}

export interface Chore {
  id: string;
  childId: string;
  title: string;
  rewardAmount: number;
  currency: RonCurrency;
  dueDate?: string;
  status: ChoreStatus;
  approvalRequired: boolean;
}

export interface Approval {
  id: string;
  childId: string;
  type: ApprovalType;
  title: string;
  description: string;
  amount?: number;
  currency?: RonCurrency;
  status: ApprovalStatus;
  reason?: string;
  note?: string;
  requestId?: string;
  transferId?: string;
  choreId?: string;
  parentNote?: string;
}

export interface Allowance {
  childId: string;
  amount: number;
  currency: RonCurrency;
  frequency: "weekly" | "monthly";
  nextDate: string;
  isActive: boolean;
  dayLabel: string;
  sourceAccount: string;
}

export interface Transaction {
  id: string;
  childId: string;
  title: string;
  amount: number;
  currency: RonCurrency;
  category: TransactionCategory;
  date: string;
}

export interface LearnModule {
  id: string;
  title: string;
  description: string;
  progress: number;
  badge: string;
  question: string;
  answer: string;
  isCompleted: boolean;
}

export interface CardSettings {
  isFrozen: boolean;
  walletEnabled: boolean;
  theme: CardTheme;
  pattern: string;
  avatar: string;
  nameOnCard: string;
}

export interface ParentControls {
  dailySafeLimit: number;
  approvalThreshold: number;
  spendingLimit: number;
  onlinePaymentsEnabled: boolean;
  cardFrozen: boolean;
  suspiciousApprovalEnabled: boolean;
  newBeneficiaryApprovalEnabled: boolean;
}

export const RO_KIDS_APPROVAL_THRESHOLD = 50;

export const RO_KIDS_PARENT: ParentProfile = {
  id: "parent-mom",
  name: "Mom",
  phone: "+40 712 345 678",
};

export const RO_KIDS_CHILD: ChildProfile = {
  id: "child-mia",
  name: "Mia",
  age: 12,
  mode: "kids",
  balance: 86,
  currency: "RON",
  avatar: "M",
  cardTheme: "classicRed",
};

export const RO_KIDS_ALLOWANCE: Allowance = {
  childId: "child-mia",
  amount: 50,
  currency: "RON",
  frequency: "weekly",
  nextDate: "2026-06-05",
  isActive: true,
  dayLabel: "Friday",
  sourceAccount: "RO12 UNCR 0000 0000 2481",
};

export const RO_KIDS_GOALS: SavingGoal[] = [
  {
    id: "goal-bike",
    childId: "child-mia",
    title: "New bike",
    targetAmount: 400,
    savedAmount: 145,
    currency: "RON",
    icon: "Bike",
  },
  {
    id: "goal-headphones",
    childId: "child-mia",
    title: "Headphones",
    targetAmount: 200,
    savedAmount: 64,
    currency: "RON",
    icon: "Music",
  },
  {
    id: "goal-trip",
    childId: "child-mia",
    title: "School trip",
    targetAmount: 600,
    savedAmount: 120,
    currency: "RON",
    icon: "Trip",
  },
];

export const RO_KIDS_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-mom-20",
    childId: "child-mia",
    title: "From Mom",
    amount: 20,
    currency: "RON",
    category: "Family",
    date: "Today",
  },
  {
    id: "tx-snack",
    childId: "child-mia",
    title: "Snack shop",
    amount: -8,
    currency: "RON",
    category: "Food",
    date: "Today",
  },
  {
    id: "tx-game",
    childId: "child-mia",
    title: "Game store",
    amount: -12,
    currency: "RON",
    category: "Games",
    date: "Yesterday",
  },
  {
    id: "tx-transport",
    childId: "child-mia",
    title: "Transport",
    amount: -5,
    currency: "RON",
    category: "Transport",
    date: "Yesterday",
  },
];

export const RO_KIDS_MONEY_REQUESTS: MoneyRequest[] = [
  {
    id: "request-lunch",
    childId: "child-mia",
    amount: 30,
    currency: "RON",
    reason: "Food",
    note: "Need lunch after practice",
    status: "pending",
    createdAt: "Today",
  },
];

export const RO_KIDS_SEND_REQUESTS: SendMoneyRequest[] = [
  {
    id: "send-ana",
    childId: "child-mia",
    contactName: "Ana",
    amount: 80,
    currency: "RON",
    note: "Class project tickets",
    status: "pending",
    createdAt: "Today",
  },
];

export const RO_KIDS_CHORES: Chore[] = [
  {
    id: "chore-room",
    childId: "child-mia",
    title: "Clean your room",
    rewardAmount: 10,
    currency: "RON",
    dueDate: "Today",
    status: "waitingApproval",
    approvalRequired: true,
  },
  {
    id: "chore-groceries",
    childId: "child-mia",
    title: "Help with groceries",
    rewardAmount: 15,
    currency: "RON",
    dueDate: "Tomorrow",
    status: "todo",
    approvalRequired: true,
  },
  {
    id: "chore-homework",
    childId: "child-mia",
    title: "Finish homework plan",
    rewardAmount: 5,
    currency: "RON",
    dueDate: "Friday",
    status: "todo",
    approvalRequired: true,
  },
];

export const RO_KIDS_APPROVALS: Approval[] = [
  {
    id: "approval-request-lunch",
    childId: "child-mia",
    type: "moneyRequest",
    title: "Mia requested 30 RON for Food",
    description: "Money request from Mia",
    amount: 30,
    currency: "RON",
    status: "pending",
    reason: "Food",
    note: "Need lunch after practice",
    requestId: "request-lunch",
  },
  {
    id: "approval-send-ana",
    childId: "child-mia",
    type: "sendMoney",
    title: "Mia wants to send 80 RON to Ana",
    description: "Above your 50 RON approval threshold",
    amount: 80,
    currency: "RON",
    status: "pending",
    reason: "Above threshold",
    note: "Class project tickets",
    transferId: "send-ana",
  },
  {
    id: "approval-chore-room",
    childId: "child-mia",
    type: "chore",
    title: "Mia completed chore: Clean your room",
    description: "Reward is ready after parent approval",
    amount: 10,
    currency: "RON",
    status: "pending",
    choreId: "chore-room",
  },
];

export const RO_KIDS_LEARN_MODULES: LearnModule[] = [
  {
    id: "learn-balance",
    title: "What is balance?",
    description: "The money you can use now, after card payments and transfers.",
    progress: 40,
    badge: "Balance basics",
    question: "Is balance money you can use now?",
    answer: "Yes",
    isCompleted: false,
  },
  {
    id: "learn-goals",
    title: "How saving goals work",
    description: "Small steps add up when you save toward something specific.",
    progress: 65,
    badge: "Goal builder",
    question: "Does every goal need a target amount?",
    answer: "Yes",
    isCompleted: false,
  },
  {
    id: "learn-scam",
    title: "How to spot a scam",
    description: "Pause before links, strange prizes, or urgent messages.",
    progress: 20,
    badge: "Safety spotter",
    question: "Should you share your PIN in a message?",
    answer: "No",
    isCompleted: false,
  },
  {
    id: "learn-request",
    title: "What happens when you ask for money?",
    description: "Your parent sees the amount and reason, then approves or declines.",
    progress: 80,
    badge: "Request ready",
    question: "Can you see the request status?",
    answer: "Yes",
    isCompleted: false,
  },
  {
    id: "learn-card",
    title: "Card safety basics",
    description: "Freeze your card if something feels wrong.",
    progress: 10,
    badge: "Card safety",
    question: "Can freezing a card help protect it?",
    answer: "Yes",
    isCompleted: false,
  },
];

export const RO_KIDS_CARD_THEMES: Array<{
  id: CardTheme;
  label: string;
  description: string;
}> = [
  { id: "classicRed", label: "Classic Red", description: "UniCredit red with a clean card face." },
  { id: "neon", label: "Neon", description: "Bright teal accents on a calm surface." },
  { id: "soft", label: "Soft", description: "Light, simple and quiet." },
  { id: "sport", label: "Sport", description: "Energetic line pattern." },
  { id: "minimal", label: "Minimal", description: "Almost plain, very tidy." },
  { id: "nature", label: "Nature", description: "Fresh green accent." },
  { id: "dark", label: "Dark", description: "Dark card with high contrast." },
];

export const RO_KIDS_CARD_SETTINGS: CardSettings = {
  isFrozen: false,
  walletEnabled: true,
  theme: "classicRed",
  pattern: "wave",
  avatar: "M",
  nameOnCard: "MIA POPESCU",
};

export const RO_KIDS_CONTROLS: ParentControls = {
  dailySafeLimit: 12,
  approvalThreshold: RO_KIDS_APPROVAL_THRESHOLD,
  spendingLimit: 100,
  onlinePaymentsEnabled: true,
  cardFrozen: false,
  suspiciousApprovalEnabled: true,
  newBeneficiaryApprovalEnabled: true,
};

export function formatRon(amount: number): string {
  return `${Math.abs(amount).toLocaleString("ro-RO", {
    maximumFractionDigits: 0,
  })} RON`;
}

export function formatSignedRon(amount: number): string {
  const prefix = amount > 0 ? "+" : amount < 0 ? "-" : "";
  return `${prefix}${formatRon(amount)}`;
}

export function goalProgress(goal: Pick<SavingGoal, "savedAmount" | "targetAmount">): number {
  if (goal.targetAmount <= 0) return 0;
  return Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
}
