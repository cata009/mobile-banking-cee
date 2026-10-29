import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Platform } from 'react-native';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import VirtualCardFlow from '../src/experiences/pi/current/baseline/virtual-card/VirtualCardFlow';
import Detail from '../src/experiences/pi/current/baseline/offers/Detail';
import { SourceCustomIcon } from '../src/universal/SourceCustomIcon';
import { BaselinePageHeader } from '../src/universal/BaselinePageHeader';
import { BaselineDropdownField } from '../src/universal/BaselineDropdownField';
import { RoBaselinePaymentSign } from '../src/experiences/pi/current/baseline/payments/confirmation/RoBaselinePaymentConfirmation';
import { FaceIdOverlay } from '../src/experiences/pi/current/baseline/FaceIdOverlay';
import { Text } from '../src/universal/Typography';
import { AssetGlyph } from '../src/universal/AssetGlyph';
import { BaselineDialog } from '../src/universal/BaselineDialog';
import { bankingProducts } from '../src/experiences/pi/current/banking/model';
import { productTransactions } from '../src/experiences/pi/current/banking/model';
import {
  issueVirtualCard,
  readVirtualCards,
} from '@/features/cards/virtual-card/model';

// The real web button uses the host's React 18; this Native renderer uses React 19.
jest.mock('@/app/components/ui/WalletButton', () => ({
  __esModule: true,
  default: (props: { kind: string; onClick: () => void }) =>
    require('react').createElement('WalletButton', {
      'data-wallet-button': props.kind,
      onClick: props.onClick,
    }),
}));

const counts = {
  accounts: 2,
  debitCards: 2,
  creditCards: 1,
  mealCards: 0,
  deposits: 1,
  savingsAccounts: 1,
  loans: 1,
  mortgages: 1,
  investments: 1,
};
const host: CurrentScreenProps = {
  country: 'RO',
  release: 'release-current',
  scenario: 'active',
  language: 'en',
  productCounts: counts,
  route: { screen: 'product-detail' },
  tokens: currentTokens(),
  t: createCurrentTranslator('RO', 'en'),
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
const button = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root.findAll(
    n =>
      n.props.accessibilityLabel === label &&
      typeof n.props.onPress === 'function',
  )[0]!;
const finishTerms = async (tree: Renderer.ReactTestRenderer) => {
  const document = tree.root.findByProps({
    testID: 'ro-virtual-card-terms-scroll',
  });
  await act(() =>
    document.props.onScroll({
      nativeEvent: {
        contentOffset: { y: 900 },
        layoutMeasurement: { height: 400 },
        contentSize: { height: 1300 },
      },
    }),
  );
  await act(() => button(tree, 'I have read it').props.onPress());
};
const acceptTerms = async (tree: Renderer.ReactTestRenderer) => {
  await act(() => button(tree, 'Accept terms and conditions').props.onPress());
  await finishTerms(tree);
};

test('RO virtual card offer opens the selector directly and Back exits the flow', async () => {
  const onBack = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <Detail
        {...host}
        onBack={onBack}
        productDetailPresentation={{
          title: 'Virtual card',
          cardId: 'cards',
          optionId: 'virtual-card',
        }}
        route={{
          screen: 'product-detail',
          params: {
            optionId: 'virtual-card',
            cardId: 'cards',
            title: 'Virtual card',
          },
        }}
      />,
    );
  });
  expect(
    tree.root.findAllByProps({ testID: 'ro-virtual-card-flow' }),
  ).not.toHaveLength(0);
  expect(
    tree.root.findAllByProps({ testID: 'ro-product-detail' }),
  ).toHaveLength(0);
  await act(() => button(tree, 'Back').props.onPress());
  expect(onBack).toHaveBeenCalledTimes(1);
  await act(() => tree.unmount());
});
test('Back from the initial virtual-card screen releases its handler before the parent navigates', async () => {
  let activeHandler: (() => boolean) | null = null;
  const popRoute = jest.fn();
  const integratedHost: CurrentScreenProps = {
    ...host,
    route: {
      screen: 'product-detail',
      params: {
        optionId: 'virtual-card',
        cardId: 'cards',
        title: 'Virtual card',
      },
    },
    onBackHandlerChange: handler => {
      activeHandler = handler;
    },
    onBack: () => {
      if (!activeHandler?.()) popRoute();
    },
  };
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<Detail {...integratedHost} />);
  });
  await act(() => button(tree, 'Back').props.onPress());
  expect(popRoute).toHaveBeenCalledTimes(1);
  await act(() => tree.unmount());
});

test('selection and setup collapse their title into the standard header when scrolled', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <VirtualCardFlow
        host={host}
        mode="issue"
        onDone={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
  });
  const scroll = () =>
    tree.root.findByProps({ testID: 'virtual-card-content-scroll' });
  await act(() =>
    scroll().props.onScroll({ nativeEvent: { contentOffset: { y: 64 } } }),
  );
  expect(
    tree.root.findByType(BaselinePageHeader).props.collapsedTitleProgress,
  ).toBe(1);
  await act(() => button(tree, 'Select Clean Green').props.onPress());
  const note = tree.root
    .findAllByType(Text)
    .find(
      node =>
        typeof node.props.children === 'string' &&
        node.props.children.startsWith('The Virtual Card can be attached'),
    );
  expect(note).toBeDefined();
  expect(note?.props.numberOfLines).toBeUndefined();
  expect(
    tree.root.findByType(BaselinePageHeader).props.collapsedTitleProgress,
  ).toBe(0);
  await act(() =>
    scroll().props.onScroll({ nativeEvent: { contentOffset: { y: 32 } } }),
  );
  expect(
    tree.root.findByType(BaselinePageHeader).props.collapsedTitleProgress,
  ).toBe(0.5);
  await act(() => tree.unmount());
});
test('setup uses the photographed copy, full-width account field and terms page', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <VirtualCardFlow
        host={host}
        mode="issue"
        onDone={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
  });
  await act(() => button(tree, 'Select Clean Green').props.onPress());
  expect(tree.root.findByType(BaselineDropdownField).props.fillWidth).toBe(
    true,
  );
  expect(JSON.stringify(tree.toJSON())).toContain('15-day review period');
  expect(JSON.stringify(tree.toJSON())).toContain('LEI/EUR/USD');
  expect(button(tree, 'Debit cards more info')).toBeDefined();
  expect(button(tree, 'Request card')).toBeDefined();
  await act(() => button(tree, 'Debit cards more info').props.onPress());
  expect(tree.root.findByProps({ testID: 'ro-tutorial-detail' })).toBeDefined();
  await act(() => button(tree, 'NEXT').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('Virtual card');
  await act(() => button(tree, 'Close tutorial').props.onPress());
  expect(button(tree, 'Request card')).toBeDefined();
  await act(() => button(tree, 'View terms and conditions').props.onPress());
  expect(
    tree.root.findByProps({ testID: 'ro-virtual-card-terms-scroll' }),
  ).toBeDefined();
  expect(button(tree, 'Download document')).toBeDefined();
  await finishTerms(tree);
  expect(button(tree, 'Request card')).toBeDefined();
  await act(() => tree.unmount());
});
test('opening the terms by toggle does not accept until the document is read and confirmed', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <VirtualCardFlow
        host={host}
        mode="issue"
        onDone={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
  });
  await act(() => button(tree, 'Select Clean Green').props.onPress());
  await act(() => button(tree, 'Accept terms and conditions').props.onPress());
  expect(
    tree.root.findByProps({ testID: 'ro-virtual-card-terms-scroll' }),
  ).toBeDefined();
  expect(button(tree, 'Request card').props.accessibilityState.disabled).toBe(
    true,
  );
  await act(() => button(tree, 'Close terms and conditions').props.onPress());
  expect(button(tree, 'Request card').props.accessibilityState.disabled).toBe(
    true,
  );
  await acceptTerms(tree);
  expect(button(tree, 'Request card').props.accessibilityState.disabled).toBe(
    false,
  );
  await act(() => tree.unmount());
});
test('a fully visible terms document can be confirmed without requiring impossible scrolling', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <VirtualCardFlow
        host={host}
        mode="issue"
        onDone={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
  });
  await act(() => button(tree, 'Select Clean Green').props.onPress());
  await act(() => button(tree, 'Accept terms and conditions').props.onPress());
  const document = tree.root.findByProps({
    testID: 'ro-virtual-card-terms-scroll',
  });
  await act(() => {
    document.props.onLayout({ nativeEvent: { layout: { height: 800 } } });
    document.props.onContentSizeChange(400, 700);
  });
  expect(button(tree, 'I have read it')).toBeDefined();
  await act(() => tree.unmount());
});

test('Ferrari carousel includes additional selectable examples', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <VirtualCardFlow
        host={host}
        mode="issue"
        onDone={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
  });
  expect(button(tree, 'Select Ferrari Evening example 2')).toBeDefined();
  await act(() =>
    button(tree, 'Select Ferrari Evening example 2').props.onPress(),
  );
  expect(button(tree, 'Request card')).toBeDefined();
  await act(() => tree.unmount());
});

test('issued card success uses the source illustration and wallet button in the web demo', async () => {
  const originalOS = Platform.OS;
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
  let tree!: Renderer.ReactTestRenderer;
  try {
    await act(() => {
      tree = Renderer.create(
        <VirtualCardFlow
          host={{ ...host, onIssueVirtualCard: () => 'virtual-card-1' }}
          mode="issue"
          onDone={jest.fn()}
          onCancel={jest.fn()}
        />,
      );
    });
    await act(() => button(tree, 'Select Clean Green').props.onPress());
    await acceptTerms(tree);
    await act(() => button(tree, 'Request card').props.onPress());
    await act(() => button(tree, 'Sign').props.onPress());
    await act(() => tree.root.findByType(FaceIdOverlay).props.onComplete());
    expect(tree.root.findByType(AssetGlyph).props.width).toBe(343);
    const wallet = tree.root.findByProps({
      'data-wallet-button': 'apple-wallet',
    });
    await act(() => wallet.props.onClick());
    expect(tree.root.findByType(BaselineDialog).props.body).toContain(
      'not available in this demo',
    );
    await act(() => tree.unmount());
  } finally {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: originalOS,
    });
  }
});

test('issuance uses the standard signing flow before returning the created card', async () => {
  const issue = jest.fn(() => 'virtual-card-1'),
    done = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <VirtualCardFlow
        host={{ ...host, onIssueVirtualCard: issue }}
        mode="issue"
        onDone={done}
        onCancel={jest.fn()}
      />,
    );
  });
  await act(() => button(tree, 'Select Clean Green').props.onPress());
  expect(button(tree, 'Request card').props.accessibilityState.disabled).toBe(
    true,
  );
  await acceptTerms(tree);
  await act(() => button(tree, 'Request card').props.onPress());
  expect(issue).not.toHaveBeenCalled();
  expect(tree.root.findByType(RoBaselinePaymentSign)).toBeDefined();
  await act(() => button(tree, 'Sign').props.onPress());
  expect(issue).not.toHaveBeenCalled();
  await act(() => tree.root.findByType(FaceIdOverlay).props.onComplete());
  expect(issue).toHaveBeenCalledWith(
    bankingProducts(host).currentAccounts[0],
    'clean-green',
    'Standard',
  );
  await act(() => button(tree, 'Ok, I got it').props.onPress());
  expect(done).toHaveBeenCalledWith('virtual-card-1');
  await act(() => tree.unmount());
});

test('Gold tab exposes themed choices and carries the selected tier into issuance', async () => {
  const issue = jest.fn(() => 'virtual-card-1');
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <VirtualCardFlow
        host={{ ...host, onIssueVirtualCard: issue }}
        mode="issue"
        onDone={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
  });
  expect(
    button(tree, 'Mastercard Standard').props.accessibilityState.selected,
  ).toBe(true);
  await act(() => button(tree, 'Mastercard Gold').props.onPress());
  expect(
    button(tree, 'Mastercard Gold').props.accessibilityState.selected,
  ).toBe(true);
  expect(
    tree.root.findAllByProps({ accessibilityLabel: 'Select Ferrari Evening' }),
  ).toHaveLength(0);
  expect(button(tree, 'Select Cat')).toBeDefined();
  await act(() => button(tree, 'Select Cat').props.onPress());
  await acceptTerms(tree);
  await act(() => button(tree, 'Request card').props.onPress());
  await act(() => button(tree, 'Sign').props.onPress());
  await act(() => tree.root.findByType(FaceIdOverlay).props.onComplete());
  expect(issue).toHaveBeenCalledWith(
    bankingProducts(host).currentAccounts[0],
    'cat',
    'Gold',
  );
  await act(() => tree.unmount());
});

test('picture changes commit only after signing and target the selected card', async () => {
  const change = jest.fn(() => true),
    done = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <VirtualCardFlow
        host={{ ...host, onChangeVirtualCardPicture: change }}
        mode="change"
        cardId="virtual-card-2"
        onDone={done}
        onCancel={jest.fn()}
      />,
    );
  });
  await act(() => button(tree, 'Select Blue').props.onPress());
  await act(() => button(tree, 'Update picture').props.onPress());
  expect(change).not.toHaveBeenCalled();
  await act(() => button(tree, 'Sign').props.onPress());
  expect(change).not.toHaveBeenCalled();
  await act(() => tree.root.findByType(FaceIdOverlay).props.onComplete());
  expect(change).toHaveBeenCalledWith('virtual-card-2', 'blue');
  await act(() => button(tree, 'Ok, I got it').props.onPress());
  expect(done).toHaveBeenCalledWith('virtual-card-2');
  await act(() => tree.unmount());
});

test('uses the standard account selector and issues against the chosen account', async () => {
  const issue = jest.fn(() => 'virtual-card-1');
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <VirtualCardFlow
        host={{ ...host, onIssueVirtualCard: issue }}
        mode="issue"
        onDone={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
  });
  await act(() => button(tree, 'Select Clean Green').props.onPress());
  expect(
    tree.root
      .findAllByType(SourceCustomIcon)
      .find(icon => icon.props.name === 'chevron-down-wide')?.props.size,
  ).toBe(20);
  await act(() =>
    button(
      tree,
      'Open Select the account you want to attach to the card',
    ).props.onPress(),
  );
  const chosen = bankingProducts(host).currentAccounts[1]!;
  const chosenLabel = `${chosen.name}, ${chosen.accountNumber}`;
  await act(() => button(tree, chosenLabel).props.onPress());
  expect(button(tree, chosenLabel).props.accessibilityState.checked).toBe(true);
  await act(() => button(tree, 'Close').props.onPress());
  await act(() =>
    button(
      tree,
      'Open Select the account you want to attach to the card',
    ).props.onPress(),
  );
  const original = bankingProducts(host).currentAccounts[0]!;
  expect(
    button(tree, `${original.name}, ${original.accountNumber}`).props
      .accessibilityState.checked,
  ).toBe(true);
  await act(() => button(tree, chosenLabel).props.onPress());
  await act(() => button(tree, 'Select').props.onPress());
  await acceptTerms(tree);
  await act(() => button(tree, 'Request card').props.onPress());
  await act(() => button(tree, 'Sign').props.onPress());
  await act(() => tree.root.findByType(FaceIdOverlay).props.onComplete());
  expect(issue).toHaveBeenCalledWith(chosen, 'clean-green', 'Standard');
  await act(() => tree.unmount());
});

test('issued cards join RO products without inheriting fictional card transactions', () => {
  const account = bankingProducts(host).currentAccounts[0]!;
  const scope = {
    country: 'RO' as const,
    bankingScenario: 'retail-single-account' as const,
  };
  const cards = readVirtualCards(
    issueVirtualCard({}, scope, {
      account,
      design: 'blue',
      termsAccepted: true,
    }),
    scope,
  );
  const enriched = { ...host, virtualCards: cards };
  expect(
    bankingProducts(enriched).cards.some(card => card.id === cards[0]!.id),
  ).toBe(true);
  expect(productTransactions(enriched, cards[0]!)).toEqual([]);
  expect(
    bankingProducts({ ...enriched, country: 'CZ' }).cards.some(
      card => card.id === cards[0]!.id,
    ),
  ).toBe(false);
});
