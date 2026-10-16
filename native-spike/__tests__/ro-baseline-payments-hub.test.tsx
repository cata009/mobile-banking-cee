import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { RoBaselinePaymentsScreen } from '../src/experiences/pi/current/baseline/payments/hub/Payments';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import {
  getPaymentTemplates,
  getSavedBeneficiaries,
} from '@/data/paymentTemplates';
import { EXCHANGE_CURRENCIES, getExchangeRateRows } from '@/data/exchangeRates';
import { BaselinePaymentHero } from '../src/universal/BaselinePaymentHero';
import { BaselineSearchBar } from '../src/universal/BaselineSearchBar';

function host(view = 'overview'): CurrentScreenProps {
  return {
    country: 'RO',
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
    route: { screen: 'payments', params: { view } },
    tokens: currentTokens(),
    t: createCurrentTranslator('RO', 'en'),
    amountsHidden: false,
    screenTopInset: 12,
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
    onPrimaryNavigationChange: jest.fn(),
  };
}
function button(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root
    .findAll(n => typeof n.props.onPress === 'function')
    .find(n => n.props.accessibilityLabel === label)!;
}
function mount(h: CurrentScreenProps) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<RoBaselinePaymentsScreen {...h} />);
  });
  return tree;
}
it('retains Source baseline template metadata and passes the complete selection identity to the domestic route', () => {
  const h = host('templates'),
    tree = mount(h);
  try {
    const selection = getPaymentTemplates('RO')[0];
    const label = `Use template ${selection.title} for ${selection.beneficiaryName}`;
    expect(button(tree, label)).toBeDefined();
    act(() => button(tree, label).props.onPress());
    expect(h.onNavigate).toHaveBeenCalledWith({
      screen: 'payment-create',
      params: { selectionId: selection.id, selectionKind: selection.kind },
    });
    expect(JSON.stringify(tree.toJSON())).toContain(selection.accountNumber);
    const recipient = getSavedBeneficiaries('RO', false)[0];
    expect(
      button(
        tree,
        `Use beneficiary ${recipient.title} for ${recipient.beneficiaryName}`,
      ),
    ).toBeDefined();
  } finally {
    act(() => tree.unmount());
  }
});
it('changes the rate base only after confirmation and resets the pending currency on cancellation', () => {
  const h = host('exchange-rates'),
    tree = mount(h);
  try {
    expect(button(tree, 'Choose currency, current RON')).toBeDefined();
    act(() => button(tree, 'Choose currency, current RON').props.onPress());
    const usd = button(tree, 'USD');
    act(() => usd.props.onPress());
    expect(button(tree, 'Choose currency, current RON')).toBeDefined();
    act(() => button(tree, 'Close currency chooser').props.onPress());
    act(() => button(tree, 'Choose currency, current RON').props.onPress());
    const ron = button(tree, 'RON');
    expect(ron.props.accessibilityState.checked).toBe(true);
    expect(
      new Set(
        tree.root
          .findAll(n => n.props.accessibilityRole === 'radio')
          .map(n => n.props.accessibilityLabel),
      ),
    ).toHaveProperty('size', EXCHANGE_CURRENCIES.length);
    act(() => button(tree, 'USD').props.onPress());
    act(() => button(tree, 'OK').props.onPress());
    expect(button(tree, 'Choose currency, current USD')).toBeDefined();
    const row = getExchangeRateRows(1, 'USD')[0];
    const result = row.convertedAmount.toLocaleString('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
      useGrouping: false,
    });
    act(() =>
      button(tree, `1 USD equals ${result} ${row.currency}`).props.onPress(),
    );
    expect(
      button(tree, `Choose currency, current ${row.currency}`),
    ).toBeDefined();
  } finally {
    act(() => tree.unmount());
  }
});
it('preserves all four generic hero sheets and the baseline controls that intentionally have no destination', () => {
  const h = host(),
    tree = mount(h);
  try {
    expect(
      tree.root.findAllByType(BaselinePaymentHero).map(n => n.props.item.title),
    ).toEqual([
      'Payment to account',
      'RoPay',
      'Currency exchange',
      'Bills & Direct Debit',
    ]);
    act(() => button(tree, 'Recurrent Payments').props.onPress());
    act(() => button(tree, 'Foreign Payments').props.onPress());
    expect(
      tree.root.findAll(n => n.props.accessibilityLabel === 'Profile')[0].props
        .onPress,
    ).toBeUndefined();
    expect(
      tree.root.findAll(n => n.props.accessibilityLabel === 'Help')[0].props
        .onPress,
    ).toBeUndefined();
    expect(h.onNavigate).not.toHaveBeenCalled();
    for (const index of [0, 1, 2, 3]) {
      act(() =>
        tree.root.findAllByType(BaselinePaymentHero)[index].props.onSelect(),
      );
      const controls = tree.root.findAll(
        n => typeof n.props.onPress === 'function',
      );
      const foreign = controls.find(n =>
        n.props.accessibilityLabel?.startsWith('FOREIGN PAYMENT'),
      )!;
      const templates = controls.find(n =>
        n.props.accessibilityLabel?.startsWith('TEMPLATES AND BENEFICIARIES'),
      )!;
      act(() => foreign.props.onPress());
      act(() => templates.props.onPress());
      expect(h.onNavigate).not.toHaveBeenCalled();
      act(() => button(tree, 'Close').props.onPress());
    }
    act(() => tree.root.findAllByType(BaselinePaymentHero)[0].props.onSelect());
    act(() =>
      tree.root
        .findAll(n => typeof n.props.onPress === 'function')
        .find(n => n.props.accessibilityLabel?.startsWith('DOMESTIC PAYMENT'))!
        .props.onPress(),
    );
    expect(h.onNavigate).toHaveBeenCalledWith({ screen: 'payment-create' });
  } finally {
    act(() => tree.unmount());
  }
});
it('searches beneficiary names and account numbers case-insensitively and restores the complete list', () => {
  const h = host('templates'),
    tree = mount(h);
  try {
    const selection = getPaymentTemplates('RO')[0];
    act(() =>
      tree.root
        .findByType(BaselineSearchBar)
        .props.onValueChange(`  ${selection.beneficiaryName.toLowerCase()}  `),
    );
    expect(JSON.stringify(tree.toJSON())).toContain(selection.title);
    expect(JSON.stringify(tree.toJSON())).not.toContain(
      getPaymentTemplates('RO')[1].title,
    );
    act(() =>
      tree.root
        .findByType(BaselineSearchBar)
        .props.onValueChange('no-match-xyz'),
    );
    expect(JSON.stringify(tree.toJSON())).toContain(
      'No templates or beneficiaries found',
    );
    act(() => tree.root.findByType(BaselineSearchBar).props.onValueChange(''));
    expect(JSON.stringify(tree.toJSON())).toContain(
      getSavedBeneficiaries('RO', false)[0].accountNumber,
    );
    expect(h.onPrimaryNavigationChange).toHaveBeenCalledWith(false);
    act(() => button(tree, 'Back').props.onPress());
    expect(h.onPrimaryNavigationChange).toHaveBeenLastCalledWith(true);
  } finally {
    act(() => tree.unmount());
  }
});
it('handles physical Back through the active sheet or child view before allowing the host route to exit', () => {
  const h = host('templates');
  let handler: (() => boolean) | null = null;
  h.onBackHandlerChange = next => {
    handler = next;
  };
  const tree = mount(h);
  try {
    act(() => {
      expect(handler!()).toBe(true);
    });
    expect(tree.root.findAllByType(BaselinePaymentHero)).toHaveLength(4);
    expect(handler!()).toBe(false);
    act(() => tree.root.findAllByType(BaselinePaymentHero)[0].props.onSelect());
    act(() => {
      expect(handler!()).toBe(true);
    });
    expect(
      tree.root.findAll(n => n.props.accessibilityLabel === 'Close'),
    ).toHaveLength(0);
    expect(handler!()).toBe(false);
    act(() => button(tree, 'Exchange Rates').props.onPress());
    act(() => button(tree, 'Choose currency, current RON').props.onPress());
    act(() => button(tree, 'USD').props.onPress());
    act(() => {
      expect(handler!()).toBe(true);
    });
    expect(button(tree, 'Choose currency, current RON')).toBeDefined();
    act(() => button(tree, 'Choose currency, current RON').props.onPress());
    expect(button(tree, 'RON').props.accessibilityState.checked).toBe(true);
    act(() => {
      expect(handler!()).toBe(true);
    });
    act(() => {
      expect(handler!()).toBe(true);
    });
    expect(tree.root.findAllByType(BaselinePaymentHero)).toHaveLength(4);
    expect(handler!()).toBe(false);
  } finally {
    act(() => tree.unmount());
  }
});
