import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import {
  BaselineInvestmentBuyOrder,
  InvestmentOrderFooter,
} from '../src/experiences/pi/current/investments/baseline/flows/BuyOrder';
import { BaselineInvestmentSuccess } from '../src/experiences/pi/current/investments/baseline/flows/Signing';
import { BaselineInvestmentSellOrder } from '../src/experiences/pi/current/investments/baseline/flows/SellOrder';
import { BaselineTextField } from '../src/universal/BaselineTextField';
import { PrimaryButton } from '../src/universal/PrimaryButton';
import { ToggleButton } from '../src/universal/ToggleButton';
import { BaselineInvestmentFrame } from '../src/experiences/pi/current/investments/baseline/Frame';
import { BaselineInvestmentDocuments } from '../src/experiences/pi/current/investments/baseline/flows/Documents';
import { BaselineInvestmentField } from '../src/experiences/pi/current/investments/baseline/Frame';
import { FaceIdOverlay } from '../src/experiences/pi/current/baseline/FaceIdOverlay';
import { SourceCustomIcon } from '../src/universal/SourceCustomIcon';
import { sourceColor } from '../src/universal/sourceColor';
import { createCurrentInvestmentSnapshot } from '../src/experiences/pi/current/investments/model';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
function host(
  country: CurrentScreenProps['country'] = 'RO',
): CurrentScreenProps {
  return {
    country,
    release: 'release-current',
    scenario: 'active',
    language: 'en',
    productCounts: {
      accounts: 2,
      debitCards: 2,
      creditCards: 1,
      mealCards: 0,
      deposits: 1,
      savingsAccounts: 1,
      loans: 1,
      mortgages: 1,
      investments: 1,
    },
    route: { screen: 'investments' },
    tokens: currentTokens(),
    t: createCurrentTranslator(country, 'en'),
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
  };
}
const field = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root
    .findAllByType(BaselineTextField)
    .find(n => n.props.label === label)!;
const button = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root.findAllByType(PrimaryButton).find(n => n.props.label === label)!;
test.each(['RO', 'HU', 'RS', 'SI', 'CZ', 'SK', 'BA', 'BA_BL'] as const)(
  'buy %s starts at1 Sourceunit and review Back resets acceptance without clearing draft',
  async country => {
    const p = host(country),
      snapshot = createCurrentInvestmentSnapshot(p),
      security = snapshot.catalog.find(s => s.status === 'active')!;
    let tree!: Renderer.ReactTestRenderer;
    await act(() => {
      tree = Renderer.create(
        <BaselineInvestmentBuyOrder
          host={p}
          security={security}
          accounts={snapshot.accounts}
          onBack={p.onBack}
          onComplete={jest.fn()}
        />,
      );
    });
    expect(field(tree, 'Quantity').props.value).toBe('1');
    await act(() => field(tree, 'Quantity').props.onChange('0'));
    expect(button(tree, 'Next').props.disabled).toBe(true);
    expect(field(tree, 'Quantity').props.errorText).toBe(
      'Enter a positive whole number.',
    );
    await act(() => field(tree, 'Quantity').props.onChange('1'));
    if (button(tree, 'Next').props.disabled)
      throw new Error('Canonical fixture must fund a single unit');
    await act(() => button(tree, 'Next').props.onPress());
    expect(button(tree, 'Buy').props.disabled).toBe(true);
    await act(() => tree.root.findByType(ToggleButton).props.onToggle(true));
    expect(button(tree, 'Buy').props.disabled).toBe(false);
    await act(() =>
      tree.root.findByType(BaselineInvestmentFrame).props.onBack(),
    );
    expect(field(tree, 'Quantity').props.value).toBe('1');
    await act(() => button(tree, 'Next').props.onPress());
    expect(button(tree, 'Buy').props.disabled).toBe(true);
    await act(() => tree.unmount());
  },
);
test('sell canonical validation and terms survive review Back, completion remains deferred', async () => {
  const p = host('CZ'),
    snapshot = createCurrentInvestmentSnapshot(p),
    security = snapshot.catalog.find(
      s => s.owned && s.status === 'active' && s.quantity > 1,
    )!;
  const complete = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <BaselineInvestmentSellOrder
        host={p}
        security={security}
        accounts={snapshot.accounts}
        onBack={p.onBack}
        onComplete={complete}
      />,
    );
  });
  await act(() =>
    field(tree, 'Number of units you want to sell').props.onChange(
      String(security.quantity + 1),
    ),
  );
  expect(button(tree, 'Next').props.disabled).toBe(true);
  await act(() =>
    field(tree, 'Number of units you want to sell').props.onChange('1'),
  );
  await act(() => button(tree, 'Next').props.onPress());
  await act(() =>
    tree.root
      .findAllByType(ToggleButton)
      .find(t => t.props.ariaLabel === 'Accept terms and conditions')!
      .props.onToggle(true),
  );
  expect(button(tree, 'Sell').props.disabled).toBe(false);
  expect(tree.root.findByType(InvestmentOrderFooter).props.paddingTop).toBe(8);
  await act(() => tree.root.findByType(BaselineInvestmentFrame).props.onBack());
  await act(() => button(tree, 'Next').props.onPress());
  expect(button(tree, 'Sell').props.disabled).toBe(false);
  expect(complete).not.toHaveBeenCalled();
  await act(() => tree.unmount());
});
test('order local Back handler declines at initial root and consumes review without invoking the parent', async () => {
  const p = host();
  p.onBackHandlerChange = jest.fn();
  const data = createCurrentInvestmentSnapshot(p);
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <BaselineInvestmentBuyOrder
        host={p}
        security={data.catalog.find(s => s.status === 'active')!}
        accounts={data.accounts}
        onBack={p.onBack}
        onComplete={jest.fn()}
      />,
    );
  });
  const current = () =>
    (p.onBackHandlerChange as jest.Mock).mock.calls.at(-1)[0] as () => boolean;
  expect(current()()).toBe(false);
  expect(p.onBack).not.toHaveBeenCalled();
  await act(() => button(tree, 'Next').props.onPress());
  let consumed = false;
  await act(() => {
    consumed = current()();
  });
  expect(consumed).toBe(true);
  expect(field(tree, 'Quantity').props.value).toBe('1');
  await act(() => tree.unmount());
});
test('baseline document presentation uses Source closed sections and dark text color', async () => {
  const p = host();
  p.tokens = currentTokens(true);
  const data = createCurrentInvestmentSnapshot(p);
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <BaselineInvestmentDocuments host={p} security={data.catalog[0]!} />,
    );
  });
  const headings = tree.root.findAll(
    n =>
      n.props.accessibilityState?.expanded === false &&
      typeof n.props.onPress === 'function',
  );
  expect(headings.map(n => n.props.accessibilityLabel)).toEqual([
    'Ex-Ante cost information',
    'Product documents',
    'Important information',
    'Investment disclaimer',
  ]);
  const title = tree.root
    .findAll(n => n.props.children === 'Product documents' && n.props.style)
    .at(-1)!;
  expect(StyleSheet.flatten(title.props.style).color).toBe(p.tokens.text);
  await act(() => tree.unmount());
});
test('valid buy intent enters exact review, signing gates completion and success retains Source copy', async () => {
  const p = host('HU'),
    data = createCurrentInvestmentSnapshot(p),
    security = data.catalog.find(s => s.status === 'active')!,
    complete = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <BaselineInvestmentBuyOrder
        host={p}
        security={security}
        accounts={data.accounts}
        initialDraft={{
          quantity: 1,
          accountId: data.accounts[0]!.id,
          frequency: 'one-off',
          executionTiming: 'next-business-day',
        }}
        onBack={p.onBack}
        onComplete={complete}
      />,
    );
  });
  expect(
    tree.root
      .findAllByType(BaselineInvestmentField)
      .find(f => f.props.label === 'Execution')!.props.value,
  ).toBe('Next business day');
  await act(() => tree.root.findByType(ToggleButton).props.onToggle(true));
  await act(() => button(tree, 'Buy').props.onPress());
  expect(field(tree, 'Enter PIN to sign the order').props.value).toBe('******');
  await act(() => button(tree, 'Sign order').props.onPress());
  expect(button(tree, 'Sign order').props.disabled).toBe(true);
  expect(complete).not.toHaveBeenCalled();
  await act(() => tree.root.findByType(FaceIdOverlay).props.onComplete());
  expect(JSON.stringify(tree.toJSON())).toContain(
    `Your order to buy ${security.title} has been accepted.`,
  );
  expect(complete).not.toHaveBeenCalled();
  await act(() => button(tree, 'Back to investments').props.onPress());
  expect(complete).toHaveBeenCalledTimes(1);
  await act(() => tree.unmount());
});
test('buy snapshot date is yesterday and invalid draft falls back to Source default data', async () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-10-15T12:00:00Z'));
  const p = host(),
    data = createCurrentInvestmentSnapshot(p);
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <BaselineInvestmentBuyOrder
        host={p}
        security={data.catalog.find(s => s.status === 'active')!}
        accounts={data.accounts}
        initialDraft={{
          quantity: 0,
          accountId: 'unknown',
          frequency: 'one-off',
          executionTiming: 'today',
        }}
        onBack={p.onBack}
        onComplete={jest.fn()}
      />,
    );
  });
  expect(field(tree, 'Quantity').props.value).toBe('1');
  expect(
    tree.root
      .findAllByType(BaselineInvestmentField)
      .find(f => f.props.label === 'Price updated at')!.props.value,
  ).toBe('14.10.2026');
  await act(() => tree.unmount());
  jest.useRealTimers();
});
test('investment success uses actual Source normal n4 line box', async () => {
  const p = host();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <BaselineInvestmentSuccess
        host={p}
        body="Source normal body"
        onDone={jest.fn()}
      />,
    );
  });
  const body = tree.root
    .findAll(n => n.props.children === 'Source normal body' && n.props.style)
    .at(-1)!;
  expect(StyleSheet.flatten(body.props.style).lineHeight).toBe(22);
  await act(() => tree.unmount());
});
test('expanded Source investment documents use semantic dark costs, suitability checks and scenario controls', async () => {
  const p = host();
  p.tokens = currentTokens(true);
  const data = createCurrentInvestmentSnapshot(p);
  let tree!: Renderer.ReactTestRenderer;
  const press = (label: string) =>
    tree.root.findAll(
      n =>
        n.props.accessibilityLabel === label &&
        typeof n.props.onPress === 'function',
    )[0]!;
  await act(() => {
    tree = Renderer.create(
      <BaselineInvestmentDocuments host={p} security={data.catalog[0]!} />,
    );
  });
  await act(() => press('Important information').props.onPress());
  expect(
    tree.root
      .findAllByType(SourceCustomIcon)
      .filter(n => n.props.name === 'check')
      .every(n => n.props.color === sourceColor('var(--uc-green-olive)', true)),
  ).toBe(true);
  const borders = tree.root.findAll(
    n =>
      n.props.style &&
      StyleSheet.flatten(n.props.style).borderBottomWidth === 1,
  );
  expect(borders.length).toBeGreaterThan(0);
  expect(
    borders.every(
      n =>
        StyleSheet.flatten(n.props.style).borderBottomColor ===
        sourceColor('var(--uc-border)', true),
    ),
  ).toBe(true);
  await act(() => press('Ex-Ante cost information').props.onPress());
  const percent = tree.root
    .findAll(n => n.props.children === '9,30%' && n.props.style)
    .at(-1)!;
  expect(StyleSheet.flatten(percent.props.style).color).toBe(
    sourceColor('var(--uc-green-olive)', true),
  );
  expect(StyleSheet.flatten(press('10Y').props.style).backgroundColor).toBe(
    sourceColor('var(--uc-action-strong)', true),
  );
  expect(StyleSheet.flatten(press('value').props.style).borderBottomColor).toBe(
    p.tokens.text,
  );
  await act(() => tree.unmount());
});
