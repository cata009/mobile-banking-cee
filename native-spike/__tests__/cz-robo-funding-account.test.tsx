import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { INITIAL_CZ_ROBO_GOALS } from '@/features/investments/robo/goalFixtures';
import { ROBO_PORTFOLIOS } from '@/features/investments/robo/catalog';
import { DEFAULT_ROBO_DEMO_CLOCK } from '@/features/investments/robo/demoClock';
import type { CurrentAccount } from '@/data/products';
import { Management } from '../src/experiences/pi/cz/evo-2027/robo/Management';
import {
  Page,
  Row,
  Choice,
} from '../src/experiences/pi/cz/evo-2027/investments/Primitives';
import { BaselineAmountField } from '../src/universal/BaselineAmountField';
import { BaselinePill } from '../src/universal/BaselinePill';
import { CalendarPanel } from '../src/universal/DateField';
import { PrimaryButton } from '../src/universal/PrimaryButton';
import { AssetGlyph } from '../src/universal/AssetGlyph';
import { BaselineTextField } from '../src/universal/BaselineTextField';
import { BaselineBottomSheet } from '../src/universal/BaselineBottomSheet';
import { ModalPortal } from '../src/universal/ModalPortal';
import { DemoViewport } from '../src/universal/DemoViewport';

const accounts: readonly CurrentAccount[] = [
  {
    id: 'cash-1',
    type: 'current_account',
    name: 'Primary Account 1',
    accountNumber: '890123401/2700',
    balance: 22850.5,
    currency: 'CZK',
  },
  {
    id: 'cash-2',
    type: 'current_account',
    name: 'Primary Account 2',
    accountNumber: '890123402/2700',
    balance: 5800,
    currency: 'CZK',
  },
];

function render(
  overrides: Partial<React.ComponentProps<typeof Management>> = {},
) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <DemoViewport>
        <Management
          goal={INITIAL_CZ_ROBO_GOALS[0]!}
          portfolio={ROBO_PORTFOLIOS[0]!}
          mode="add-money"
          onMode={jest.fn()}
          onBack={jest.fn()}
          onExit={jest.fn()}
          onGoalUpdated={jest.fn()}
          currentAccounts={accounts}
          securityCatalog={[]}
          clock={DEFAULT_ROBO_DEMO_CLOCK}
          amountsHidden={false}
          {...overrides}
        />
      </DemoViewport>,
    );
  });
  return tree;
}

function control(tree: Renderer.ReactTestRenderer, label: string) {
  const result = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  )[0];
  expect(result).toBeDefined();
  return result!;
}

function press(tree: Renderer.ReactTestRenderer, label: string) {
  const button = control(tree, label);
  expect(button.props.disabled).not.toBe(true);
  act(() => button.props.onPress());
}

function cashField(tree: Renderer.ReactTestRenderer) {
  return tree.root
    .findAllByType(BaselineTextField)
    .find(node => node.props.label === 'Cash Account');
}

test('keeps the selected cash account number, name and balance on separate field lines', () => {
  const tree = render();
  try {
    const field = cashField(tree);
    expect(field).toBeDefined();
    expect(field!.props).toMatchObject({
      value: '890123401/2700',
      helperText: 'Primary Account 1',
      helperText2: 'Available balance 22.850,50 CZK',
      trailingIconSize: 32,
      selectionControl: { expanded: false },
    });
    expect(field!.props.trailingIcon.type).toBe(AssetGlyph);
    expect(field!.props.trailingIcon.props.size).toBe(32);
    expect(
      control(tree, 'Cash account, Primary Account 1').props.accessibilityRole,
    ).toBe('button');
  } finally {
    act(() => tree.unmount());
  }
});

test('presents account choices above the page in a sheet sized to the demo viewport', () => {
  const tree = render();
  try {
    const viewport = tree.root.findByType(DemoViewport).findAllByType(View)[0]!;
    act(() =>
      viewport.props.onLayout({
        nativeEvent: { layout: { width: 375, height: 650 } },
      }),
    );
    press(tree, 'Cash account, Primary Account 1');
    const sheet = tree.root.findByType(BaselineBottomSheet);
    expect(sheet.props).toMatchObject({
      width: 375,
      height: 650,
      title: 'Select cash account',
    });
    expect(
      tree.root.findByType(Page).findAllByType(BaselineBottomSheet),
    ).toHaveLength(0);
    expect(tree.root.findByType(ModalPortal).props.visible).toBe(true);
    expect(sheet.findAllByType(ScrollView)).toHaveLength(1);
    const choices = sheet.findAll(
      node =>
        node.props.accessibilityRole === 'radio' &&
        typeof node.props.onPress === 'function',
    );
    expect(choices.map(node => node.props.accessibilityLabel)).toEqual([
      'Primary Account 1, 890123401/2700, 22.850,50 CZK',
      'Primary Account 2, 890123402/2700, 5.800,00 CZK',
    ]);
    expect(choices.map(node => node.props.accessibilityState.checked)).toEqual([
      true,
      false,
    ]);
    expect(
      control(tree, 'Cash account, Primary Account 1').props.accessibilityState
        .expanded,
    ).toBe(true);
  } finally {
    act(() => tree.unmount());
  }
});

test('confirms the draft account before using it in the funding review', () => {
  const tree = render();
  try {
    press(tree, 'Cash account, Primary Account 1');
    press(tree, 'Primary Account 2, 890123402/2700, 5.800,00 CZK');
    expect(cashField(tree)!.props.helperText).toBe('Primary Account 1');
    press(tree, 'Select');
    expect(tree.root.findAllByType(BaselineBottomSheet)).toHaveLength(0);
    expect(cashField(tree)!.props).toMatchObject({
      value: '890123402/2700',
      helperText: 'Primary Account 2',
      helperText2: 'Available balance 5.800,00 CZK',
      selectionControl: { expanded: false },
    });
    press(tree, 'Review investment');
    const recap = tree.root
      .findAllByType(Row)
      .find(node => node.props.title === 'Cash account');
    expect(recap!.props.subtitle).toBe('Primary Account 2');
  } finally {
    act(() => tree.unmount());
  }
});

test('dismisses account selection without changing the committed account and resets the next draft', () => {
  const tree = render();
  try {
    press(tree, 'Cash account, Primary Account 1');
    press(tree, 'Primary Account 2, 890123402/2700, 5.800,00 CZK');
    act(() => tree.root.findByType(ModalPortal).props.onRequestClose());
    expect(tree.root.findAllByType(BaselineBottomSheet)).toHaveLength(0);
    expect(cashField(tree)!.props.helperText).toBe('Primary Account 1');
    press(tree, 'Cash account, Primary Account 1');
    expect(
      control(tree, 'Primary Account 1, 890123401/2700, 22.850,50 CZK').props
        .accessibilityState.checked,
    ).toBe(true);
    press(tree, 'Close cash accounts');
    expect(tree.root.findAllByType(BaselineBottomSheet)).toHaveLength(0);
  } finally {
    act(() => tree.unmount());
  }
});

test('masks balances in the selected field and all account options', () => {
  const tree = render({ amountsHidden: true });
  try {
    expect(cashField(tree)!.props.helperText2).toBe(
      'Available balance ****,** CZK',
    );
    press(tree, 'Cash account, Primary Account 1');
    expect(
      control(tree, 'Primary Account 2, 890123402/2700, ****,** CZK'),
    ).toBeDefined();
    const output = JSON.stringify(tree.toJSON());
    expect(output).not.toContain('22.850,50');
    expect(output).not.toContain('5.800,00');
  } finally {
    act(() => tree.unmount());
  }
});

test('retains funding validation when accounts are unavailable or an amount is empty', () => {
  const unavailable = render({ currentAccounts: [] });
  try {
    expect(control(unavailable, 'Review investment').props.disabled).toBe(true);
    expect(unavailable.root.findAllByType(BaselineBottomSheet)).toHaveLength(0);
    expect(JSON.stringify(unavailable.toJSON())).toContain(
      'No cash account is available.',
    );
  } finally {
    act(() => unavailable.unmount());
  }
  const tree = render();
  try {
    act(() =>
      tree.root
        .findAllByType(TextInput)
        .find(node => node.props.accessibilityLabel === 'Amount to invest now')!
        .props.onChangeText(''),
    );
    expect(control(tree, 'Review investment').props.disabled).toBe(true);
    press(tree, 'Cash account, Primary Account 1');
    press(tree, 'Primary Account 2, 890123402/2700, 5.800,00 CZK');
    press(tree, 'Select');
    expect(control(tree, 'Review investment').props.disabled).toBe(true);
  } finally {
    act(() => tree.unmount());
  }
});

test('uses the source radio list and amount presets while preserving the initial one-off draft', () => {
  const tree = render();
  try {
    const page = tree.root.findByType(Page);
    expect(page.props).toMatchObject({
      title: 'Add money to your goal',
      description:
        'Choose one option. You can invest once, monthly, or combine both.',
      contentTop: 32,
    });
    expect(StyleSheet.flatten(page.props.descriptionStyle)).toMatchObject({
      fontSize: 18,
      lineHeight: 24,
    });
    const choices = page.findAllByType(Choice);
    expect(choices).toHaveLength(3);
    expect(choices.map(node => node.props.selected)).toEqual([
      true,
      false,
      false,
    ]);
    for (const choice of choices) {
      expect(choice.props).toMatchObject({ variant: 'radio', radioSize: 32 });
      expect(StyleSheet.flatten(choice.props.style)).toMatchObject({
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 0,
      });
      expect(StyleSheet.flatten(choice.props.titleStyle)).toMatchObject({
        fontSize: 16,
        lineHeight: 18,
      });
      expect(StyleSheet.flatten(choice.props.descriptionStyle)).toMatchObject({
        fontSize: 16,
        lineHeight: 18,
      });
    }
    expect(tree.root.findByType(BaselineAmountField).props).toMatchObject({
      label: 'Amount to invest now',
      value: '10000',
      currency: 'CZK',
      currencyPresentation: 'suffix',
    });
    expect(
      tree.root.findAllByType(BaselinePill).map(node => node.props.label),
    ).toEqual(['25.000 CZK', '35.000 CZK', '50.000 CZK']);
    expect(
      tree.root
        .findAllByType(PrimaryButton)
        .find(node => node.props.label === 'Review investment'),
    ).toBeDefined();
    expect(JSON.stringify(tree.toJSON())).toContain(
      'Choose the account to use',
    );
    expect(JSON.stringify(tree.toJSON())).toContain(
      'We’ll use this account for your first and future investments.',
    );
    press(tree, '35.000 CZK');
    expect(tree.root.findByType(BaselineAmountField).props.value).toBe('35000');
    expect(control(tree, '35.000 CZK').props.accessibilityState.selected).toBe(
      true,
    );
    press(tree, 'Review investment');
    expect(
      tree.root
        .findAllByType(Row)
        .find(node => node.props.title === 'Amount to add')!.props.value,
    ).toBe('35.000,00 CZK');
  } finally {
    act(() => tree.unmount());
  }
});

test('uses monthly presets and the live date clock through the source date field and calendar', () => {
  const tree = render();
  try {
    press(tree, 'Invest monthly. Choose an amount to contribute each month.');
    expect(tree.root.findByType(Page).props.title).toBe('Choose how to invest');
    expect(tree.root.findByType(BaselineAmountField).props).toMatchObject({
      label: 'Monthly contribution',
      value: '2000',
    });
    expect(
      tree.root.findAllByType(BaselinePill).map(node => node.props.label),
    ).toEqual(['500 CZK', '1.000 CZK', '2.000 CZK']);
    press(tree, '1.000 CZK');
    expect(tree.root.findByType(BaselineAmountField).props.value).toBe('1000');
    const dateField = tree.root
      .findAllByType(BaselineTextField)
      .find(node => node.props.label === 'Start date');
    expect(dateField!.props).toMatchObject({
      value: '01/03/2026',
      trailingIconName: 'prime-book-appointment',
      trailingIconSize: 24,
      trailingIconLayout: 'compact',
      selectionControl: { expanded: false },
    });
    press(tree, 'Select start date');
    const calendar = tree.root.findByType(CalendarPanel);
    expect(calendar.props).toMatchObject({
      compact: true,
      value: '2026-03-01',
      min: '2026-03-01',
      locale: 'en-GB',
    });
    act(() => calendar.props.onSelect('2026-02-28'));
    expect(tree.root.findByType(CalendarPanel)).toBeDefined();
    act(() => calendar.props.onSelect('2026-03-12'));
    expect(tree.root.findAllByType(CalendarPanel)).toHaveLength(0);
    expect(
      tree.root
        .findAllByType(BaselineTextField)
        .find(node => node.props.label === 'Start date')!.props.value,
    ).toBe('12/03/2026');
    press(tree, 'Review investment');
    expect(
      tree.root
        .findAllByType(Row)
        .find(node => node.props.title === 'Monthly contribution starts')!.props
        .value,
    ).toBe('12 March 2026');
  } finally {
    act(() => tree.unmount());
  }
});

test('keeps both combined amounts and the source hidden date valid when a recurring goal has a past date', () => {
  const tree = render({
    goal: {
      ...INITIAL_CZ_ROBO_GOALS[0]!,
      recurringContribution: {
        amount: 2000,
        startDate: '10 November 2025',
        cashAccountId: 'cash-1',
      },
    },
  });
  try {
    expect(tree.root.findByType(Page).props.title).toBe('Choose how to invest');
    expect(
      tree.root
        .findAllByType(BaselineAmountField)
        .map(node => node.props.label),
    ).toEqual(['Amount to invest now', 'Monthly contribution']);
    expect(
      tree.root.findAllByType(BaselinePill).map(node => node.props.label),
    ).toEqual([
      '25.000 CZK',
      '35.000 CZK',
      '50.000 CZK',
      '500 CZK',
      '1.000 CZK',
      '2.000 CZK',
    ]);
    expect(
      tree.root
        .findAllByType(BaselineTextField)
        .filter(node => node.props.label === 'Start date'),
    ).toHaveLength(0);
    expect(control(tree, 'Review investment').props.disabled).toBe(false);
    press(tree, 'Review investment');
    expect(
      tree.root
        .findAllByType(Row)
        .find(node => node.props.title === 'Monthly contribution starts')!.props
        .value,
    ).toBe('1 March 2026');
  } finally {
    act(() => tree.unmount());
  }
});
