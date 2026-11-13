import {
  getRomanianInstallmentQuote,
  type RomanianInstallmentQuote,
} from '@/features/cards/roCardServices';
import type { AccountTransaction } from '@/data/accountDetails';

export type CardWalletProvider = 'apple-pay' | 'click-to-pay';

export interface CreatedCardInstallmentPlan extends RomanianInstallmentQuote {
  id: string;
  cardId: string;
  transactionId: string;
  merchantName: string;
  transactionDate: string;
  createdAt: number;
  currentInstallmentNumber?: number;
  currentInstallmentDate?: string;
  remainingInstallments?: number;
}

type CardServiceState = {
  walletEnrollment: Readonly<Record<string, readonly CardWalletProvider[]>>;
  installmentPlans: readonly CreatedCardInstallmentPlan[];
};

let state: CardServiceState = {
  walletEnrollment: {},
  installmentPlans: [],
};
const listeners = new Set<() => void>();

export function cardServiceSnapshot() {
  return state;
}

export function subscribeCardServices(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function publish(next: CardServiceState) {
  state = next;
  listeners.forEach(listener => listener());
}

export function isCardWalletEnrolled(
  cardId: string,
  provider: CardWalletProvider,
  defaultEnrolled = false,
) {
  return defaultEnrolled || (state.walletEnrollment[cardId]?.includes(provider) ?? false);
}

/** The RO demo starts with both services active except on its last EUR debit card. */
export function isRomanianDemoWalletEnrolled(
  cardId: string,
  provider: CardWalletProvider,
  cards: readonly { id: string; type: string; currency: string }[],
) {
  const lastEuroDebit = [...cards].reverse().find(card => card.type === 'debit_card' && card.currency === 'EUR');
  return isCardWalletEnrolled(cardId, provider, cardId !== lastEuroDebit?.id);
}

export function enrollCardWallet(cardId: string, provider: CardWalletProvider) {
  const providers = new Set(state.walletEnrollment[cardId] ?? []);
  providers.add(provider);
  publish({
    ...state,
    walletEnrollment: {
      ...state.walletEnrollment,
      [cardId]: [...providers],
    },
  });
}

export function addCardInstallmentPlan(plan: CreatedCardInstallmentPlan) {
  publish({ ...state, installmentPlans: [plan, ...state.installmentPlans] });
}

/** Seed a small, repeatable RO credit-card example alongside eligible purchases. */
export function ensureDemoRomanianCardInstallmentPlans(
  cardId: string,
  transactions: readonly AccountTransaction[],
  language: string,
) {
  if (cardId !== 'card-credit-1') return;

  const examples = [
    {
      transactionId: 'RO-300-2',
      numberOfInstallments: 24,
      currentInstallmentNumber: 7,
      remainingInstallments: 18,
    },
    {
      transactionId: 'RO-300-3',
      numberOfInstallments: 12,
      currentInstallmentNumber: 7,
      remainingInstallments: 6,
    },
    {
      transactionId: 'RO-300-5',
      numberOfInstallments: 12,
      currentInstallmentNumber: 7,
      remainingInstallments: 6,
    },
  ] as const;
  const additions = examples.flatMap(example => {
    const transaction = transactions.find(
      item => item.id === example.transactionId,
    );
    const alreadyPlanned = state.installmentPlans.some(
      plan =>
        plan.cardId === cardId && plan.transactionId === example.transactionId,
    );
    if (!transaction || alreadyPlanned) return [];

    const [year, month] = transaction.monthKey.split('-').map(Number);
    const transactionDate = new Intl.DateTimeFormat(
      language === 'ro' ? 'ro-RO' : 'en-GB',
      { day: '2-digit', month: 'long', year: 'numeric' },
    ).format(new Date(year!, month! - 1, Number(transaction.day)));
    const quote = getRomanianInstallmentQuote(
      Math.abs(transaction.amount),
      example.numberOfInstallments,
    );

    return [
      {
        ...quote,
        id: `demo-${cardId}-${transaction.id}`,
        cardId,
        transactionId: transaction.id,
        merchantName: transaction.label,
        transactionDate,
        currentInstallmentNumber: example.currentInstallmentNumber,
        currentInstallmentDate: '2026-12-07',
        remainingInstallments: example.remainingInstallments,
        createdAt: Date.UTC(2026, 10, 1),
      },
    ];
  });

  if (additions.length) {
    publish({
      ...state,
      installmentPlans: [...additions, ...state.installmentPlans],
    });
  }
}

export function getCardInstallmentPlans(cardId: string) {
  return state.installmentPlans.filter(plan => plan.cardId === cardId);
}
