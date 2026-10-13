import { authorizeDemo } from '../test-support/cz-evo-investmentsHelpers';
import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import { SellOrder } from '../src/experiences/pi/cz/evo-2027/investments/SellOrder';
import { BuyOrder } from '../src/experiences/pi/cz/evo-2027/investments/BuyOrder';
import { createCzInvestmentSnapshot } from '../src/experiences/pi/cz/evo-2027/investments/model';
import { DEFAULT_CZECH_COUNTS } from '../src/experiences/pi/cz/evo-2027/contracts';

function control(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  )[0];
}
function press(tree: Renderer.ReactTestRenderer, label: string) {
  const node = control(tree, label)!;
  expect(node).toBeDefined();
  expect(node.props.disabled).not.toBe(true);
  act(() => {
    node.props.onPress();
  });
}
function input(tree: Renderer.ReactTestRenderer, label: string, value: string) {
  act(() =>
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === label)!
      .props.onChangeText(value),
  );
}

describe('native canonical investment orders', () => {
  const snapshot = createCzInvestmentSnapshot(DEFAULT_CZECH_COUNTS);
  const security = snapshot.catalog.find(
    item => item.owned && item.quantity > 0,
  )!;
  it('rejects overselling, requires consent and publishes the sale only on completion', async () => {
    const complete = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <SellOrder
          security={security}
          accounts={snapshot.accounts}
          onBack={jest.fn()}
          onComplete={complete}
        />,
      );
    });
    input(tree, 'Number of units', String(security.quantity + 1));
    expect(control(tree, 'Next')!.props.disabled).toBe(true);
    const quantity = Number(Math.min(security.quantity, 0.25).toFixed(6));
    input(tree, 'Number of units', String(quantity));
    press(tree, 'Next');
    expect(control(tree, 'Sell')!.props.disabled).toBe(true);
    press(tree, 'Accept terms and conditions');
    press(tree, 'Sell');
    await authorizeDemo(tree, 'Sign order');
    expect(complete).not.toHaveBeenCalled();
    press(tree, 'Back to investments');
    expect(complete).toHaveBeenCalledWith({
      quantity,
      amount: Math.round(quantity * security.marketPrice * 100) / 100,
      currency: security.instrumentCurrency,
    });
    act(() => tree.unmount());
  });
  it('preserves the CTS units-only restriction', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <SellOrder
          security={{ ...security, sellOrderMode: 'units-only' }}
          accounts={snapshot.accounts}
          onBack={jest.fn()}
          onComplete={jest.fn()}
        />,
      );
    });
    expect(control(tree, 'By amount')).toBeUndefined();
    input(tree, 'Number of units', '0.1234567');
    expect(control(tree, 'Next')!.props.disabled).toBe(true);
    act(() => tree.unmount());
  });
  it('rejects an amount above the instrument CTS limit', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <SellOrder
          security={{
            ...security,
            sellOrderMode: 'units-and-amount',
            sellAmountLimit: 1,
          }}
          accounts={snapshot.accounts}
          onBack={jest.fn()}
          onComplete={jest.fn()}
        />,
      );
    });
    press(tree, 'By amount');
    input(tree, 'Amount', '2');
    expect(control(tree, 'Next')!.props.disabled).toBe(true);
    act(() => tree.unmount());
  });
  it('blocks a purchase that exceeds the selected cash account balance', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BuyOrder
          security={security}
          accounts={[{ ...snapshot.accounts[0]!, balance: 0 }]}
          onBack={jest.fn()}
          onComplete={jest.fn()}
        />,
      );
    });
    input(tree, 'Quantity', '1');
    expect(control(tree, 'Next')!.props.disabled).toBe(true);
    act(() => tree.unmount());
  });
  it('blocks orders without a cash account', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BuyOrder
          security={security}
          accounts={[]}
          onBack={jest.fn()}
          onComplete={jest.fn()}
        />,
      );
    });
    input(tree, 'Quantity', '1');
    expect(control(tree, 'Next')!.props.disabled).toBe(true);
    act(() => tree.unmount());
  });
  it('requires fresh BUY consent when returning from signing to its recap', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BuyOrder
          security={security}
          accounts={snapshot.accounts}
          onBack={jest.fn()}
          onComplete={jest.fn()}
        />,
      );
    });
    input(tree, 'Quantity', '1');
    press(tree, 'Next');
    press(tree, 'Accept terms and conditions');
    press(tree, 'Buy');
    press(tree, 'Back');
    expect(control(tree, 'Buy')!.props.disabled).toBe(true);
    act(() => tree.unmount());
  });
});
