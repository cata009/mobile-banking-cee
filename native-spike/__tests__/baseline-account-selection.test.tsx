import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { AccountSelectionSheet } from '../src/experiences/pi/current/baseline/AccountSelectionSheet';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import RoBaselinePaymentCreateScreen from '../src/experiences/pi/current/baseline/payments/domestic/RoBaselinePaymentCreateScreen';
import { BaselineTextField } from '../src/universal/BaselineTextField';
import { bankingProducts } from '../src/experiences/pi/current/banking/model';
import { formatCzLocalAccountNumber } from '@/data/czechDomesticAccount';
import { InternalTransfer } from '../src/experiences/pi/current/banking/InternalTransfer';
import { InvestmentAccountSheet } from '../src/experiences/pi/current/investments/baseline/flows/BuyOrder';
import { RoBaselineTransactionsScreen } from '../src/experiences/pi/current/baseline/TransactionsScreen';

const host = {
  country: 'CZ',
  release: 'release-current',
  scenario: 'active',
  language: 'en',
  productCounts: {
    accounts: 2,
    debitCards: 0,
    creditCards: 0,
    mealCards: 0,
    deposits: 0,
    savingsAccounts: 0,
    loans: 0,
    mortgages: 0,
    investments: 0,
  },
  route: { screen: 'home' },
  tokens: currentTokens(),
  t: createCurrentTranslator('CZ', 'en'),
  amountsHidden: false,
  screenTopInset: 54,
  isActive: true,
  onNavigate: jest.fn(),
  onBack: jest.fn(),
  onProfile: jest.fn(),
  onSearch: jest.fn(),
  onAmountsToggle: jest.fn(),
  onChanged: jest.fn(),
  onLanguageChange: jest.fn(),
  mode: 'light',
  onModeChange: jest.fn(),
} as CurrentScreenProps;
const options = [
  {
    id: 'one',
    name: 'Primary Account 1',
    detail: '123/2700',
    balance: 1200,
    currency: 'CZK',
  },
  {
    id: 'two',
    name: 'Primary Account 2',
    detail: '456/2700',
    balance: 2500,
    currency: 'CZK',
  },
];
const control = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root.findAll(
    node => node.props.accessibilityLabel === label && node.props.onPress,
  )[0]!;
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

it('shows account identity and balance, commits only on Select, and respects amount privacy', async () => {
  const confirm = jest.fn(),
    close = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <AccountSelectionSheet
        host={host}
        title="Choose account"
        options={options}
        selectedId="one"
        onClose={close}
        onConfirm={confirm}
      />,
    );
  });
  expect(JSON.stringify(tree.toJSON())).toContain('1 200,00 CZK');
  await act(() => control(tree, 'Primary Account 2, 456/2700').props.onPress());
  expect(confirm).not.toHaveBeenCalled();
  await act(() => control(tree, 'Select').props.onPress());
  expect(confirm).toHaveBeenCalledWith('two');
  await act(() =>
    tree.update(
      <AccountSelectionSheet
        host={{ ...host, amountsHidden: true }}
        title="Choose account"
        options={options}
        selectedId="one"
        onClose={close}
        onConfirm={confirm}
      />,
    ),
  );
  expect(JSON.stringify(tree.toJSON())).not.toContain('1 200,00');
  expect(JSON.stringify(tree.toJSON())).toContain('****');
  await act(() =>
    tree.update(
      <AccountSelectionSheet
        host={{ ...host, amountsHidden: true }}
        title="Choose account"
        options={[
          { id: 'one', name: 'Primary Account 1', balanceText: '1 200,00 CZK' },
        ]}
        selectedId="one"
        onClose={close}
        onConfirm={confirm}
      />,
    ),
  );
  expect(JSON.stringify(tree.toJSON())).not.toContain('1 200,00');
  await act(() => tree.unmount());
});

it.each(['RO', 'CZ', 'SK', 'HU', 'RS', 'SI', 'BA', 'BA_BL'] as const)(
  'opens the shared payer selector in %s and commits the selected account',
  async country => {
    const props = {
      ...host,
      country,
      t: createCurrentTranslator(country, 'en'),
      route: { screen: 'payment-create' as const },
    };
    const account = bankingProducts(props).currentAccounts[1]!;
    const detail =
      country === 'CZ'
        ? formatCzLocalAccountNumber(account.accountNumber)
        : account.accountNumber;
    let tree!: Renderer.ReactTestRenderer;
    await act(() => {
      tree = Renderer.create(<RoBaselinePaymentCreateScreen {...props} />);
    });
    const payer = () =>
      tree.root
        .findAllByType(BaselineTextField)
        .find(field => field.props.label === 'Account number')!;
    const initialNumber = payer().props.value;
    const initialBalance = payer().props.helperText2;
    const initialAccount = bankingProducts(props).currentAccounts[0]!;
    await act(() => payer().props.selectionControl.onPress());
    expect(
      control(tree, `${initialAccount.name}, ${initialNumber}`).props
        .accessibilityValue.text,
    ).toBe(initialBalance);
    await act(() => control(tree, 'Select').props.onPress());
    expect(payer().props.value).toBe(initialNumber);
    await act(() => payer().props.selectionControl.onPress());
    await act(() =>
      control(tree, `${account.name}, ${detail}`).props.onPress(),
    );
    await act(() => control(tree, 'Select').props.onPress());
    expect(payer().props.value).toBe(detail);
    expect(payer().props.helperText).toBe(account.name);
    await act(() => tree.unmount());
  },
);

it('keeps transfer selection pending until confirmation and excludes the opposite account', async () => {
  const props = {
    ...host,
    productCounts: { ...host.productCounts, savingsAccounts: 1 },
  };
  const back = jest.fn();
  const accounts = bankingProducts(props).accounts;
  const saving = accounts.find(item => item.type === 'saving_account')!;
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<InternalTransfer host={props} onBack={back} />);
  });
  const source = tree.root.findAll(
    node =>
      typeof node.props.onPress === 'function' &&
      String(node.props.accessibilityLabel).startsWith('From account '),
  )[0]!;
  await act(() => source.props.onPress({ stopPropagation: () => {} }));
  expect(
    control(
      tree,
      `${saving.name}, ${formatCzLocalAccountNumber(saving.accountNumber)}`,
    ),
  ).toBeDefined();
  expect(
    tree.root.findAllByProps({
      accessibilityLabel: `${accounts[1]!.name}, ${formatCzLocalAccountNumber(accounts[1]!.accountNumber)}`,
    }),
  ).toHaveLength(0);
  await act(() =>
    control(
      tree,
      `${saving.name}, ${formatCzLocalAccountNumber(saving.accountNumber)}`,
    ).props.onPress(),
  );
  await act(() => control(tree, 'Select').props.onPress());
  await act(() => control(tree, 'Back').props.onPress());
  expect(back).toHaveBeenCalledWith(
    expect.objectContaining({ sourceAccountId: saving.id }),
  );
  await act(() => tree.unmount());
});

it('keeps the destination distinct and does not replace the Italian experience', async () => {
  const props = {
    ...host,
    productCounts: { ...host.productCounts, savingsAccounts: 1 },
  };
  const accounts = bankingProducts(props).accounts;
  const saving = accounts.find(item => item.type === 'saving_account')!;
  const back = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<InternalTransfer host={props} onBack={back} />);
  });
  const destination = tree.root.findAll(
    node =>
      typeof node.props.onPress === 'function' &&
      String(node.props.accessibilityLabel).startsWith('To account '),
  )[0]!;
  await act(() => destination.props.onPress({ stopPropagation: () => {} }));
  await act(() =>
    control(
      tree,
      `${saving.name}, ${formatCzLocalAccountNumber(saving.accountNumber)}`,
    ).props.onPress(),
  );
  await act(() => control(tree, 'Select').props.onPress());
  await act(() => control(tree, 'Back').props.onPress());
  expect(back).toHaveBeenCalledWith(
    expect.objectContaining({
      destinationAccountId: saving.id,
      sourceAccountId: accounts[0]!.id,
    }),
  );
  await act(() => tree.unmount());
  const italian = {
    ...host,
    country: 'IT' as const,
    route: { screen: 'payment-create' as const },
  };
  await act(() => {
    tree = Renderer.create(<RoBaselinePaymentCreateScreen {...italian} />);
  });
  const payer = tree.root
    .findAllByType(BaselineTextField)
    .find(field => field.props.label === 'Account number')!;
  expect(payer.props.selectionControl).toBeUndefined();
  await act(() => tree.unmount());
});

it('uses the same confirmed radio sheet for baseline investment accounts', async () => {
  const confirm = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <InvestmentAccountSheet
        host={host}
        title="Select cash account"
        options={[
          {
            id: 'one',
            name: 'Primary Account 1',
            detail: '123/2700',
            balance: '1 200,00 CZK',
          },
          {
            id: 'two',
            name: 'Primary Account 2',
            detail: '456/2700',
            balance: '2 500,00 CZK',
          },
        ]}
        selectedId="one"
        onClose={jest.fn()}
        onConfirm={confirm}
      />,
    );
  });
  await act(() => control(tree, 'Primary Account 2, 456/2700').props.onPress());
  expect(confirm).not.toHaveBeenCalled();
  await act(() => control(tree, 'Select').props.onPress());
  expect(confirm).toHaveBeenCalledWith('two');
  await act(() => tree.unmount());
});

it('keeps the All accounts choice when selecting a transaction account', async () => {
  const account = bankingProducts(host).currentAccounts[1]!;
  const detail = formatCzLocalAccountNumber(account.accountNumber);
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<RoBaselineTransactionsScreen {...host} />);
  });
  await act(() => control(tree, 'Show transactions for').props.onPress());
  expect(control(tree, 'All accounts').props.accessibilityState.checked).toBe(
    true,
  );
  await act(() => control(tree, `${account.name}, ${detail}`).props.onPress());
  await act(() => control(tree, 'Select').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain(account.name);
  await act(() => tree.unmount());
});
