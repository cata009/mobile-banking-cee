import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { BaselineAccountActionBar } from '../src/universal/BaselineAccountActionBar';
import { BaselineTransactionRow } from '../src/universal/BaselineTransactionRow';
import { BaselineTransactionAvatar } from '../src/universal/BaselineTransactionAvatar';
import { BaselineProfileAvatar } from '../src/universal/BaselineProfileAvatar';
import { BaselineAmountVisibility } from '../src/universal/BaselineAmountVisibility';
import { resolveTransactionAvatarIdentity } from '@/features/accounts-payments/transactionAvatarIdentity';
import { PROFILE_AVATAR_AI_PATHS } from '@/app/components/contracts/profileAvatar';
import { PARTY_DIRECTION_PATHS } from '@/app/components/contracts/transactionAvatar';
import type { AccountTransaction } from '@/data/accountDetails';
const transaction: AccountTransaction = {
  id: 't',
  day: '13',
  month: 'OCT',
  monthKey: '2026-10',
  monthTitle: 'October',
  label: 'Maria Ionescu',
  amount: -12,
  type: 'debit',
  category: 'Transfers',
  pfmCategory: 'Transfers',
  pfmSubcategory: 'Transfer',
  status: 'Booked',
  source: 'account',
  currency: 'RON',
  details: 'Payment details',
};
describe('isolated Native banking identity leaves', () => {
  it('uses exact feature identity descriptor and original outgoing SVG', () => {
    let tree!: Renderer.ReactTestRenderer;
    const identity = resolveTransactionAvatarIdentity(transaction);
    act(() => {
      tree = Renderer.create(
        <BaselineTransactionAvatar identity={identity} size={42} />,
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Maria Ionescu, outgoing payment');
    expect(json).toContain(PARTY_DIRECTION_PATHS.outgoingArrow);
    expect(json).toContain('MI');
    act(() => tree.unmount());
  });
  it.each([false, true])(
    'delegates exact transaction/category callbacks evo=%s',
    evo2027 => {
      const onPress = jest.fn(),
        onCategoryPress = jest.fn();
      let tree!: Renderer.ReactTestRenderer;
      act(() => {
        tree = Renderer.create(
          <BaselineTransactionRow
            transaction={transaction}
            formattedAmount="1.234,56"
            currency="RON"
            evo2027={evo2027}
            onPress={onPress}
            onCategoryPress={onCategoryPress}
          />,
        );
      });
      const category = tree.root.find(
        node =>
          node.props?.accessibilityLabel ===
            'Change category for Maria Ionescu' &&
          typeof node.props.onPress === 'function',
      );
      act(() => category.props.onPress());
      expect(onCategoryPress).toHaveBeenCalledWith(transaction);
      expect(onPress).not.toHaveBeenCalled();
      const open = tree.root.find(
        node =>
          node.props?.accessibilityLabel === 'Open transaction Maria Ionescu' &&
          typeof node.props.onPress === 'function',
      );
      act(() => open.props.onPress());
      expect(onPress).toHaveBeenCalledWith(transaction);
      expect(JSON.stringify(tree.toJSON())).toContain('1.234');
      act(() => tree.unmount());
    },
  );
  it('keeps hidden action slots disabled and capped without calling owners', () => {
    const onPress = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineAccountActionBar
          iconTreatment="bubble"
          items={Array.from({ length: 5 }, (_, i) => ({
            id: String(i),
            label: String(i),
            hidden: i === 0,
            onPress,
            iconName: 'account-details',
          }))}
        />,
      );
    });
    const hidden = tree.root.find(
      node =>
        node.props?.accessibilityLabel === '0' &&
        typeof node.props.onPress === 'function',
    );
    act(() => hidden.props.onPress());
    expect(onPress).not.toHaveBeenCalled();
    expect(hidden.props.disabled).toBe(true);
    expect(
      tree.root.findAll(node => node.props?.accessibilityLabel === '4'),
    ).toHaveLength(0);
    act(() => tree.unmount());
  });
  it('preserves Profile AI original paths and photo-to-initials fallback', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineProfileAvatar variant="ai" showNotification />,
      );
    });
    for (const path of PROFILE_AVATAR_AI_PATHS)
      expect(JSON.stringify(tree.toJSON())).toContain(path);
    act(() =>
      tree.update(
        <BaselineProfileAvatar variant="photo" initials=" m r " size={34} />,
      ),
    );
    expect(JSON.stringify(tree.toJSON())).toContain('MR');
    act(() => tree.unmount());
  });
  it('keeps amount visibility controlled', () => {
    const onToggle = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineAmountVisibility hidden onToggle={onToggle} />,
      );
    });
    const button = tree.root.find(
      node =>
        node.props?.accessibilityRole === 'button' &&
        typeof node.props.onPress === 'function',
    );
    expect(button.props['aria-pressed']).toBe(true);
    act(() => button.props.onPress());
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(button.props['aria-pressed']).toBe(true);
    act(() => tree.unmount());
  });
});
