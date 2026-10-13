import {
  getItalyFinancialSnapshot,
  resetItalyFinancialState,
  selectAccountBalance,
} from '../../src/features/finance/italyFinancials';
import {
  accounts,
  movements,
  parseEuroCents,
  validateTransfer,
  submitDemoTransfer,
} from '../src/banking';

beforeEach(resetItalyFinancialState);
const valid = {
  recipient: 'Mario Rossi',
  iban: 'IT60X0542811101000000123456',
  amount: '12,50',
  note: 'Cena',
};

test('native accounts and movements use the canonical Italy ledger', () => {
  const state = getItalyFinancialSnapshot();
  const account = accounts()[0]!;
  expect(account.availableCents).toBe(
    selectAccountBalance(state, account.number).availableCents,
  );
  expect(movements(account.number).length).toBeGreaterThan(0);
});
test.each(['1e3', '-5', '12,345', '1.2.3', '', '999999999999999999999'])(
  'rejects ambiguous or unsafe money input %s',
  amount => {
    expect(parseEuroCents(amount)).toBeNull();
  },
);
test('accepts native decimal keyboard separators without floating point rounding', () => {
  expect(parseEuroCents('12,50')).toBe(1250);
  expect(parseEuroCents('0.01')).toBe(1);
});
test('requires checksum-valid Italian IBAN, recipient and sufficient funds', () => {
  const account = accounts()[0]!;
  expect(validateTransfer(valid, account)).toEqual({});
  expect(
    validateTransfer(
      {
        ...valid,
        recipient: ' ',
        iban: 'IT00X0542811101000000123456',
        amount: '9999999',
      },
      account,
    ),
  ).toEqual(
    expect.objectContaining({
      recipient: expect.any(String),
      iban: expect.any(String),
      amount: expect.any(String),
    }),
  );
});
test('demo submission debits once via shared policies and rejects stale balance', () => {
  const account = accounts()[0]!;
  const original = account.availableCents;
  expect(submitDemoTransfer(valid, account.number, 'native-test')).toEqual({
    ok: true,
    transactionId: 'native-test',
  });
  expect(submitDemoTransfer(valid, account.number, 'native-test').ok).toBe(
    true,
  );
  expect(accounts()[0]!.availableCents).toBe(original - 1250);
  expect(
    submitDemoTransfer({ ...valid, amount: '9999999' }, account.number, 'other')
      .ok,
  ).toBe(false);
});
test('a completed balance-consuming transfer stays successful on retry', () => {
  const account = accounts()[0]!;
  const draft = { ...valid, amount: String(account.availableCents / 100) };
  expect(submitDemoTransfer(draft, account.number, 'native-all-funds').ok).toBe(
    true,
  );
  expect(submitDemoTransfer(draft, account.number, 'native-all-funds').ok).toBe(
    true,
  );
  expect(accounts()[0]!.availableCents).toBe(0);
});
