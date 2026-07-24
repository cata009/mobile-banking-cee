/**
 * RO Teens seed data: the teen profile, balances & limits, the transaction
 * ledger, savings goals, chores/rewards, and the starting approvals inbox.
 *
 * All amounts are in RON. Copy is Romanian, tuned for a 14–18 audience (more
 * autonomy and grown-up tone than the younger HU Kids concept).
 */
import type { RoApproval, RoGoal, RoTask, RoTransaction } from "./types";

export const RO_TEEN_PROFILE = {
  name: "Andrei",
  fullName: "Andrei Popescu",
  age: 16,
  initials: "AP",
  city: "București",
  parentName: "Mama",
  parentFullName: "Elena Popescu",
} as const;

/** Money available to spend right now. */
export const RO_AVAILABLE_BALANCE = 428.5;

/** Total across the current account + savings goals. */
export const RO_TOTAL_SAVED = 1710;

/** Weekly allowance and when the next drop lands. */
export const RO_WEEKLY_ALLOWANCE = 60;
export const RO_ALLOWANCE_NEXT = "luni, 3 zile";

/** Weekly spending already used (drives the ring + remaining limit). */
export const RO_WEEKLY_SPENT = 132;

export const RO_INITIAL_GOALS: RoGoal[] = [
  {
    id: "goal-iphone",
    title: "iPhone nou",
    emoji: "📱",
    targetAmount: 4500,
    savedAmount: 1200,
    accent: "var(--uc-product-blue)",
    helper: "Economisești 120 RON pe săptămână",
  },
  {
    id: "goal-festival",
    title: "Bilet Untold",
    emoji: "🎧",
    targetAmount: 350,
    savedAmount: 210,
    accent: "var(--uc-product-pink)",
    helper: "Aproape acolo — mai ai 140 RON",
  },
  {
    id: "goal-skate",
    title: "Skateboard",
    emoji: "🛹",
    targetAmount: 600,
    savedAmount: 150,
    accent: "var(--uc-green-success)",
    helper: "Rotunjirile sunt pornite",
  },
];

export const RO_INITIAL_TASKS: RoTask[] = [
  { id: "task-dishes", title: "Strânge masa după cină", recurrence: "Zilnic", reward: 8, icon: "check", status: "todo" },
  { id: "task-homework", title: "Termină tema la mate", recurrence: "Săptămânal", reward: 25, icon: "book-open", status: "todo" },
  { id: "task-dog", title: "Plimbă câinele", recurrence: "Zilnic", reward: 10, icon: "check", status: "waiting-parent", parentNote: "Așteaptă confirmarea Mamei" },
  { id: "task-room", title: "Fă curat în cameră", recurrence: "Săptămânal", reward: 20, icon: "check", status: "approved", parentNote: "Bravo!" },
  { id: "task-recycle", title: "Du gunoiul la reciclare", recurrence: "Săptămânal", reward: 12, icon: "check", status: "todo" },
];

export const RO_INITIAL_APPROVALS: RoApproval[] = [
  {
    id: "approval-emag",
    kind: "payment",
    title: "Plată eMAG",
    counterparty: "eMAG",
    amount: 189,
    note: "Căști gaming",
    status: "pending",
    createdAt: "Azi, 14:20",
    icon: "shopping-bag",
    accent: "var(--uc-product-blue)",
  },
  {
    id: "approval-request-trip",
    kind: "request",
    title: "Cerere către Mama",
    counterparty: "Mama",
    amount: 80,
    note: "Excursie cu clasa",
    status: "pending",
    createdAt: "Azi, 12:05",
    icon: "circle-dollar-sign",
    accent: "var(--uc-green-success)",
  },
  {
    id: "approval-task-room",
    kind: "task",
    title: "Recompensă temă",
    counterparty: "Tata",
    amount: 20,
    note: "Cameră curată — aprobat",
    status: "approved",
    createdAt: "Ieri",
    icon: "clipboard-check",
    accent: "var(--uc-magenta-main)",
  },
];

export const RO_TRANSACTIONS: RoTransaction[] = [
  {
    id: "tx-mama-topup",
    merchant: "De la Mama",
    subtitle: "Alocație săptămânală",
    amount: 60,
    category: "Venituri",
    icon: "circle-dollar-sign",
    accent: "var(--uc-green-success)",
    dayLabel: "Azi",
    dateKey: "2026-07-23",
    time: "09:10",
    status: "Efectuată",
  },
  {
    id: "tx-glovo",
    merchant: "Glovo",
    subtitle: "Prânz cu prietenii",
    amount: -38.9,
    category: "Mâncare",
    icon: "shopping-bag",
    accent: "var(--uc-yellow-gold)",
    dayLabel: "Azi",
    dateKey: "2026-07-23",
    time: "13:24",
    status: "Efectuată",
  },
  {
    id: "tx-spotify",
    merchant: "Spotify",
    subtitle: "Abonament lunar",
    amount: -27.99,
    category: "Abonamente",
    icon: "receipt-text",
    accent: "var(--uc-green-success)",
    dayLabel: "Azi",
    dateKey: "2026-07-23",
    time: "08:00",
    status: "În așteptare",
  },
  {
    id: "tx-vlad",
    merchant: "Către Vlad",
    subtitle: "Partea la cadou",
    amount: -25,
    category: "Prieteni",
    icon: "users",
    accent: "var(--uc-product-blue-deep)",
    dayLabel: "Ieri",
    dateKey: "2026-07-22",
    time: "18:42",
    status: "Efectuată",
  },
  {
    id: "tx-kaufland",
    merchant: "Kaufland",
    subtitle: "Snacks & suc",
    amount: -19.5,
    category: "Shopping",
    icon: "shopping-bag",
    accent: "var(--uc-red-main)",
    dayLabel: "Ieri",
    dateKey: "2026-07-22",
    time: "16:05",
    status: "Efectuată",
  },
  {
    id: "tx-netflix",
    merchant: "Netflix",
    subtitle: "Plan partajat",
    amount: -34.99,
    category: "Abonamente",
    icon: "receipt-text",
    accent: "var(--uc-red-main)",
    dayLabel: "Ieri",
    dateKey: "2026-07-22",
    time: "07:15",
    status: "Efectuată",
  },
  {
    id: "tx-metrou",
    merchant: "Metrorex",
    subtitle: "Abonament metrou",
    amount: -15,
    category: "Transport",
    icon: "arrow-right",
    accent: "var(--uc-product-blue)",
    dayLabel: "22 iul",
    dateKey: "2026-07-21",
    time: "07:48",
    status: "Efectuată",
  },
  {
    id: "tx-steam",
    merchant: "Steam",
    subtitle: "Joc nou",
    amount: -59.99,
    category: "Distracție",
    icon: "receipt-text",
    accent: "var(--uc-product-blue-deep)",
    dayLabel: "21 iul",
    dateKey: "2026-07-20",
    time: "20:30",
    status: "Efectuată",
  },
  {
    id: "tx-bunici",
    merchant: "De la Bunici",
    subtitle: "Cadou surpriză",
    amount: 100,
    category: "Venituri",
    icon: "circle-dollar-sign",
    accent: "var(--uc-green-success)",
    dayLabel: "20 iul",
    dateKey: "2026-07-19",
    time: "11:00",
    status: "Efectuată",
  },
  {
    id: "tx-mcd",
    merchant: "McDonald's",
    subtitle: "După școală",
    amount: -21.4,
    category: "Mâncare",
    icon: "shopping-bag",
    accent: "var(--uc-yellow-gold)",
    dayLabel: "20 iul",
    dateKey: "2026-07-19",
    time: "15:20",
    status: "Efectuată",
  },
];
