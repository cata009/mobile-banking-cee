import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { PendingOrders } from '../src/experiences/pi/cz/evo-2027/investments/PendingOrders';
import { InvestmentBulkApprovalPreview } from '../src/experiences/pi/cz/evo-2027/investments/BulkApproval';
import { createCzInvestmentSnapshot } from '../src/experiences/pi/cz/evo-2027/investments/model';
import { DEFAULT_CZECH_COUNTS } from '../src/experiences/pi/cz/evo-2027/contracts';
import { BULK_DRAFTS } from '@/features/investments/bulk-approval/model';
import { authorizeDemo } from '../test-support/cz-evo-investmentsHelpers';
function control(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  )[0]!;
}
function press(tree: Renderer.ReactTestRenderer, label: string) {
  const node = control(tree, label);
  expect(node).toBeDefined();
  expect(node.props.disabled).not.toBe(true);
  act(() => {
    node.props.onPress();
  });
}
describe('native investment approvals', () => {
  it('renders canonical ordinary drafts and preserves their Source no-op approval actions', () => {
    const model = createCzInvestmentSnapshot(DEFAULT_CZECH_COUNTS);
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <PendingOrders
          catalog={model.catalog}
          account={model.accounts[0]}
          onBack={jest.fn()}
        />,
      );
    });
    press(tree, 'Open BUY order for ' + model.catalog[0]!.title);
    press(tree, 'Sign order');
    expect(
      tree.root.findAll(node => node.props.testID === 'cz-pending-order-detail')
        .length,
    ).toBeGreaterThan(0);
    press(tree, 'Reject');
    expect(
      tree.root.findAll(node => node.props.testID === 'cz-pending-order-detail')
        .length,
    ).toBeGreaterThan(0);
    act(() => tree.unmount());
  });
  it('blocks summary until all marked drafts are presented and final terms are accepted', async () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <InvestmentBulkApprovalPreview onBack={jest.fn()} />,
      );
    });
    press(tree, 'BULK SIGNING');
    press(tree, 'Select ' + BULK_DRAFTS[0]!.name);
    press(tree, 'Select ' + BULK_DRAFTS[1]!.name);
    press(tree, 'Review marked orders');
    press(tree, 'Summary');
    expect(control(tree, 'Sign marked orders').props.disabled).toBe(true);
    press(tree, 'Back');
    press(tree, 'Next order');
    press(tree, 'Accept terms and conditions');
    press(tree, 'Summary');
    expect(control(tree, 'Sign marked orders').props.disabled).toBe(false);
    press(tree, 'Sign marked orders');
    await authorizeDemo(tree, 'Sign marked orders');
    expect(
      tree.root.findAll(
        node => node.props.testID === 'cz-investments-bulk-confirmation',
      ).length,
    ).toBeGreaterThan(0);
    act(() => tree.unmount());
  });
});
