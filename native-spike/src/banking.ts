import {
  getItalyFinancialSnapshot,
  selectAccountBalance,
  getAccountFinanceMovements,
  postAccountFinancialMovement,
} from '../../src/features/finance/italyFinancials';
import { isValidIban } from '../../src/data/paymentRecipientRules';
import { selectPfmSummary } from '../../src/features/analytics/mobileFirstPfm';

export const accounts = () => {
  const state = getItalyFinancialSnapshot();
  return state.accounts
    .filter(account => !account.imported)
    .slice(0, 2)
    .map(account => ({
      ...account,
      ...selectAccountBalance(state, account.number),
    }));
};
export type Account = ReturnType<typeof accounts>[number];
export const movements = (number: string) =>
  getAccountFinanceMovements(getItalyFinancialSnapshot(), number);
export const monthlySpend = () => {
  const state = getItalyFinancialSnapshot();
  return selectPfmSummary(state, {
    accountNumbers: accounts().map(account => account.number),
    cardIds: [
      ...state.cards.filter(card => card.kind === 'debit').slice(0, 2),
      ...state.cards.filter(card => card.kind === 'credit').slice(0, 1),
    ].map(card => card.id),
    wealth: [],
  }).spendCents;
};
export const formatMoney = (cents: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(
    cents / 100,
  );
export type Transfer = {
  recipient: string;
  iban: string;
  amount: string;
  note: string;
};
export type TransferErrors = Partial<Record<keyof Transfer, string>>;
export const emptyTransfer: Transfer = {
  recipient: '',
  iban: '',
  amount: '',
  note: '',
};

// Native decimal keyboards emit either separator. Reject grouping/exponents instead of guessing.
export function parseEuroCents(raw: string): number | null {
  const value = raw.trim();
  if (!/^\d{1,12}(?:[.,]\d{1,2})?$/.test(value)) return null;
  const [euros, decimals = ''] = value.split(/[.,]/);
  const cents = Number(euros) * 100 + Number(decimals.padEnd(2, '0'));
  return Number.isSafeInteger(cents) ? cents : null;
}
export function validateTransfer(
  draft: Transfer,
  account: Account,
): TransferErrors {
  const errors: TransferErrors = {};
  if (!draft.recipient.trim()) errors.recipient = 'Inserisci il beneficiario';
  if (!isValidIban(draft.iban, 'IT'))
    errors.iban = 'Inserisci un IBAN italiano valido';
  const cents = parseEuroCents(draft.amount);
  if (cents === null || cents <= 0)
    errors.amount = 'Inserisci un importo valido';
  else if (cents > account.availableCents)
    errors.amount = 'Disponibilità insufficiente';
  if (!draft.note.trim()) errors.note = 'Inserisci la causale';
  return errors;
}
export function submitDemoTransfer(
  draft: Transfer,
  number: string,
  key: string,
) {
  if (getItalyFinancialSnapshot().completedKeys.includes(key))
    return { ok: true as const, transactionId: key };
  const account = accounts().find(item => item.number === number);
  if (!account || Object.keys(validateTransfer(draft, account)).length)
    return { ok: false as const, error: 'Controlla i dati del bonifico' };
  return postAccountFinancialMovement({
    accountNumber: number,
    amountCents: -parseEuroCents(draft.amount)!,
    name: draft.recipient.trim(),
    kind: 'transfer',
    category: 'Bonifici',
    key,
  });
}
