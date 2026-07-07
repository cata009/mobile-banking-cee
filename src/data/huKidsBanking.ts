export type HuKidsCurrency = "HUF";

export interface SavingGoal {
  id: string;
  childId: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  currency: HuKidsCurrency;
  icon?: string;
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

export const HU_KIDS_GOALS: SavingGoal[] = [
  {
    id: "goal-bike",
    childId: "child-alexandra",
    title: "New bike",
    targetAmount: 40000,
    savedAmount: 14500,
    currency: "HUF",
    icon: "Bike",
  },
  {
    id: "goal-headphones",
    childId: "child-alexandra",
    title: "Headphones",
    targetAmount: 20000,
    savedAmount: 6400,
    currency: "HUF",
    icon: "Music",
  },
  {
    id: "goal-trip",
    childId: "child-alexandra",
    title: "School trip",
    targetAmount: 60000,
    savedAmount: 12000,
    currency: "HUF",
    icon: "Trip",
  },
];

export const HU_KIDS_LEARN_MODULES: LearnModule[] = [
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

export function goalProgress(goal: Pick<SavingGoal, "savedAmount" | "targetAmount">): number {
  if (goal.targetAmount <= 0) return 0;
  return Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
}
