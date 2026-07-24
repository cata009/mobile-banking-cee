/**
 * RS Teens seed data — Nikola, 14, Beograd. Serbian Latin script, RSD.
 *
 * Key data-quality improvement over RO Teens: dates are derived from `new Date()`
 * at module load, so "Danas" / "Juče" / "12 jul" stay honest relative to the day
 * the demo runs. RO hardcoded "2026-07-23" / "Azi", which rotted immediately.
 * New transactions created at runtime also derive their labels from now().
 */
import type {
  RsApproval,
  RsGoal,
  RsTask,
  RsTransaction,
  RsTransactionDayGroup,
} from "./types";

/* ----------------------------------------------------------------------- */
/* Persona + balance model                                                  */
/* ----------------------------------------------------------------------- */

export const RS_TEEN_PROFILE = {
  name: "Nikola",
  age: 14,
  city: "Beograd",
  avatar: "NP",
  accent: "var(--uc-product-blue)",
  greeting: "Dobar dan",
  parentName: "Tata Milan",
  parentHandle: "Milan Petrović",
  parentAvatar: "MP",
  parentAccent: "var(--uc-product-blue-deep)",
};

/** Available balance shown on the hero. */
export const RS_TEEN_BALANCE = 12850;
/** Total across balance + goals (for the "all money" breakdown). */
export const RS_TEEN_TOTAL_MONEY = 21300;
/** Weekly spending capacity. Money authorised this week counts toward it. */
export const RS_TEEN_WEEKLY_LIMIT = 3000;
/** How much of the weekly limit has been spent so far this week. */
export const RS_TEEN_WEEKLY_SPENT = 1150;
/** Days remaining in the current spending week. */
export const RS_TEEN_DAYS_LEFT = 4;

export function getRsTeenSpendModel() {
  const weeklyRemaining = Math.max(RS_TEEN_WEEKLY_LIMIT - RS_TEEN_WEEKLY_SPENT, 0);
  const spentProgress = Math.min(
    100,
    Math.round((RS_TEEN_WEEKLY_SPENT / RS_TEEN_WEEKLY_LIMIT) * 100),
  );
  return {
    weeklyLimit: RS_TEEN_WEEKLY_LIMIT,
    weeklySpent: RS_TEEN_WEEKLY_SPENT,
    weeklyRemaining,
    spentProgress,
    daysLeft: RS_TEEN_DAYS_LEFT,
  };
}

/* ----------------------------------------------------------------------- */
/* Date helpers (derived, never hardcoded)                                  */
/* ----------------------------------------------------------------------- */

const SR_MONTHS_SHORT = [
  "jan",
  "feb",
  "mar",
  "apr",
  "maj",
  "jun",
  "jul",
  "avg",
  "sep",
  "okt",
  "nov",
  "dec",
];

export type RsDateStamp = { dateKey: string; dayLabel: string; time: string };

/** Build an ISO date key (YYYY-MM-DD) for `daysAgo` days before today. */
export function rsDateKey(daysAgo: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Human Serbian day label for `daysAgo` days before today. */
export function rsDayLabel(daysAgo: number): string {
  if (daysAgo === 0) return "Danas";
  if (daysAgo === 1) return "Juče";
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return `${d.getDate()} ${SR_MONTHS_SHORT[d.getMonth()]}`;
}

/** A stamp pair for the current moment — used by runtime-created transactions. */
export function rsNowStamp(): RsDateStamp {
  return { dateKey: rsDateKey(0), dayLabel: "Danas", time: "sada" };
}

/* ----------------------------------------------------------------------- */
/* Transactions (derived dates)                                            */
/* ----------------------------------------------------------------------- */

export const RS_TEEN_TRANSACTIONS: RsTransaction[] = [
  {
    id: "tx-1",
    merchant: "Maxi",
    subtitle: "Market — grickalice",
    amount: -435,
    category: "Hrana",
    icon: "shopping-bag",
    accent: "var(--uc-product-blue)",
    merchantLogo: "maxi",
    dayLabel: rsDayLabel(0),
    dateKey: rsDateKey(0),
    time: "14:20",
    status: "Izvršeno",
  },
  {
    id: "tx-2",
    merchant: "Gomex",
    subtitle: "Sladoled",
    amount: -260,
    category: "Hrana",
    icon: "shopping-bag",
    accent: "var(--uc-product-pink)",
    merchantLogo: "gomex",
    dayLabel: rsDayLabel(0),
    dateKey: rsDateKey(0),
    time: "12:05",
    status: "Izvršeno",
  },
  {
    id: "tx-3",
    merchant: "GSP",
    subtitle: "Dnevna karta",
    amount: -150,
    category: "Prevoz",
    icon: "wallet-cards",
    accent: "var(--uc-product-blue-deep)",
    merchantLogo: "gsp",
    dayLabel: rsDayLabel(1),
    dateKey: rsDateKey(1),
    time: "08:10",
    status: "Izvršeno",
  },
  {
    id: "tx-4",
    merchant: "Tata",
    subtitle: "Džeparac",
    amount: 1500,
    category: "Prihod",
    icon: "circle-dollar-sign",
    accent: "var(--uc-product-blue)",
    dayLabel: rsDayLabel(1),
    dateKey: rsDateKey(1),
    time: "09:00",
    status: "Izvršeno",
  },
  {
    id: "tx-5",
    merchant: "Spotify",
    subtitle: "Mesečna pretplata",
    amount: -599,
    category: "Pretplate",
    icon: "receipt-text",
    accent: "var(--uc-product-mauve)",
    merchantLogo: "spotify",
    dayLabel: rsDayLabel(2),
    dateKey: rsDateKey(2),
    time: "00:01",
    status: "Izvršeno",
  },
  {
    id: "tx-6",
    merchant: "Luka",
    subtitle: "Piknik povratak",
    amount: -305,
    category: "Prijatelji",
    icon: "send",
    accent: "var(--uc-product-blue-deep)",
    dayLabel: rsDayLabel(2),
    dateKey: rsDateKey(2),
    time: "17:40",
    status: "Izvršeno",
  },
  {
    id: "tx-7",
    merchant: "Miloš Kafić",
    subtitle: "Kafa sa Anom",
    amount: -420,
    category: "Zabava",
    icon: "receipt-text",
    accent: "var(--uc-product-brown)",
    merchantLogo: "milos-kafica",
    dayLabel: rsDayLabel(3),
    dateKey: rsDateKey(3),
    time: "16:30",
    status: "Izvršeno",
  },
  {
    id: "tx-8",
    merchant: "dm",
    subtitle: "Šampon i gel",
    amount: -680,
    category: "Kupovina",
    icon: "shopping-bag",
    accent: "var(--uc-product-blue)",
    merchantLogo: "dm",
    dayLabel: rsDayLabel(4),
    dateKey: rsDateKey(4),
    time: "11:15",
    status: "Izvršeno",
  },
  {
    id: "tx-9",
    merchant: "Netflix",
    subtitle: "Mesečna pretplata",
    amount: -790,
    category: "Pretplate",
    icon: "receipt-text",
    accent: "var(--uc-product-slate)",
    merchantLogo: "netflix",
    dayLabel: rsDayLabel(5),
    dateKey: rsDateKey(5),
    time: "00:01",
    status: "Izvršeno",
  },
  {
    id: "tx-10",
    merchant: "Yuh",
    subtitle: "Online — patike",
    amount: -2100,
    category: "Kupovina",
    icon: "shopping-bag",
    accent: "var(--uc-product-blue-deep)",
    merchantLogo: "yuh",
    dayLabel: rsDayLabel(6),
    dateKey: rsDateKey(6),
    time: "19:50",
    status: "Na čekanju",
  },
];

/** Group transactions by day, newest first, with a per-day signed total. */
export function groupRsTransactionsByDay(
  transactions: RsTransaction[],
): RsTransactionDayGroup[] {
  const byKey = new Map<string, RsTransactionDayGroup>();
  for (const tx of transactions) {
    const existing = byKey.get(tx.dateKey);
    if (existing) {
      existing.transactions.push(tx);
      existing.total += tx.amount;
    } else {
      byKey.set(tx.dateKey, {
        key: tx.dateKey,
        title: tx.dayLabel,
        transactions: [tx],
        total: tx.amount,
      });
    }
  }
  return [...byKey.values()].sort((a, b) => b.key.localeCompare(a.key));
}

/* ----------------------------------------------------------------------- */
/* Goals (real IconName, not emoji)                                        */
/* ----------------------------------------------------------------------- */

export const RS_TEEN_GOALS: RsGoal[] = [
  {
    id: "goal-iphone",
    title: "Novi telefon",
    icon: "wallet-cards",
    accent: "var(--uc-product-blue)",
    targetAmount: 60000,
    savedAmount: 42000,
    helper: "Štediš 1.500 RSD nedeljno",
    autoSave: "1.500 RSD nedeljno",
  },
  {
    id: "goal-festival",
    title: "Exit karta",
    icon: "trophy",
    accent: "var(--uc-product-pink)",
    targetAmount: 9000,
    savedAmount: 3000,
    helper: "Izađi na FIFA prvenstvo",
    autoSave: "500 RSD nedeljno",
  },
  {
    id: "goal-bike",
    title: "Bicikl",
    icon: "bike",
    accent: "var(--uc-green-main)",
    targetAmount: 28000,
    savedAmount: 9600,
    helper: "Za prolećnu vožnju",
    autoSave: "800 RSD nedeljno",
  },
];

/* ----------------------------------------------------------------------- */
/* Tasks (chores → reward loop)                                            */
/* ----------------------------------------------------------------------- */

export const RS_TEEN_TASKS: RsTask[] = [
  {
    id: "task-1",
    title: "Iznesi smeće",
    recurrence: "Svakog dana",
    reward: 50,
    icon: "check",
    status: "todo",
  },
  {
    id: "task-2",
    title: "Složi sobu",
    recurrence: "Subotom",
    reward: 150,
    icon: "check",
    status: "todo",
  },
  {
    id: "task-3",
    title: "Pročitaj 20 strana",
    recurrence: "Svakog dana",
    reward: 100,
    icon: "book-open",
    status: "todo",
  },
  {
    id: "task-4",
    title: "Pomozi sa večerom",
    recurrence: "Nedeljom",
    reward: 120,
    icon: "check",
    status: "waiting-parent",
    parentNote: "Čeka potvrdu Tate",
  },
  {
    id: "task-5",
    title: "Prošetaj psa",
    recurrence: "Svakog dana",
    reward: 80,
    icon: "check",
    status: "todo",
  },
];

/* ----------------------------------------------------------------------- */
/* Approvals inbox seed                                                    */
/* ----------------------------------------------------------------------- */

export const RS_TEEN_APPROVALS: RsApproval[] = [
  {
    id: "ap-1",
    kind: "payment",
    title: "Plaćanje ka Yuh",
    counterparty: "Yuh — patike",
    amount: 2100,
    note: "Veća kupovina",
    status: "pending",
    createdAt: rsDayLabel(0),
    icon: "shopping-bag",
    accent: "var(--uc-product-blue-deep)",
  },
  {
    id: "ap-2",
    kind: "topup",
    title: "Dopuna od Tate",
    counterparty: "Tata Milan",
    amount: 1500,
    note: "Džeparac",
    status: "approved",
    createdAt: rsDayLabel(1),
    icon: "add-money",
    accent: "var(--uc-product-blue)",
  },
  {
    id: "ap-3",
    kind: "request",
    title: "Tražio 800 RSD",
    counterparty: "Za Exit kartu",
    amount: 800,
    status: "declined",
    createdAt: rsDayLabel(2),
    icon: "circle-dollar-sign",
    accent: "var(--uc-product-pink)",
    note: "Tata: štedi iz džeparca",
  },
];
