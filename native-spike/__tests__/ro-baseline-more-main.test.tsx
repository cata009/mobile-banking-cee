import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Image, Platform, StyleSheet } from 'react-native';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import { BaselineDialog } from '../src/universal/BaselineDialog';
import More, {
  RoMoreCard,
} from '../src/experiences/pi/current/baseline/more/More';
import Tutorials from '../src/experiences/pi/current/baseline/more/Tutorials';
import { moreAssets } from '../src/experiences/pi/current/profile/assets';
import { resolveMoreCard } from '@/app/components/contracts/moreCard';
import {
  DuoContentViewport,
  DuoPreviewProvider,
} from '../src/universal/DuoPreview';

function host(language: 'en' | 'ro' = 'en'): CurrentScreenProps {
  return {
    country: 'RO',
    release: 'release-current',
    scenario: 'active',
    language,
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
    route: { screen: 'profile' },
    tokens: currentTokens(),
    t: createCurrentTranslator('RO', language),
    amountsHidden: false,
    screenTopInset: 12,
    isActive: true,
    mode: 'light',
    onNavigate: jest.fn(),
    onBack: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    onLanguageChange: jest.fn(),
    onModeChange: jest.fn(),
    onPrimaryNavigationChange: jest.fn(),
    onBackHandlerChange: jest.fn(),
  };
}
function button(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(node => node.props.accessibilityLabel === label)[0]!;
}
function mount(props = host()) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<More {...props} />);
  });
  return tree;
}

it.each([
  'contacts',
  'documents',
  'settings',
  'tutorial',
  'digital-activities',
  'my-requests',
  'third-party-consent',
] as const)(
  'keeps the %s illustration proportionate and anchored on the wide Duo card',
  variant => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    let tree!: Renderer.ReactTestRenderer;
    try {
      act(() => {
        tree = Renderer.create(
          <DuoPreviewProvider
            value={{
              width: 951,
              height: 669,
              rightInset: 84,
              referenceWidth: 375,
            }}
          >
            <DuoContentViewport screen="profile">
              <RoMoreCard
                card={variant}
                title={variant}
                width={256.5}
                dark={false}
                onPress={jest.fn()}
              />
            </DuoContentViewport>
          </DuoPreviewProvider>,
        );
      });
      const frame = StyleSheet.flatten(
        tree.root.findByProps({ testID: `ro-more-art-${variant}` }).props.style,
      );
      const source = resolveMoreCard({ variant }).image;
      expect(frame.right).toBeCloseTo((parseFloat(source.right) / 100) * 155.5);
      expect(frame.bottom).toBeCloseTo((parseFloat(source.bottom) / 100) * 120);
      expect(frame.width).toBeCloseTo(
        (1 - (parseFloat(source.left) + parseFloat(source.right)) / 100) *
          155.5,
      );
      expect(frame.height).toBeCloseTo(
        (1 - (parseFloat(source.top) + parseFloat(source.bottom)) / 100) * 120,
      );
      const image = tree.root.findAllByType('img' as never)[0]!;
      expect(image.props.style).toMatchObject({
        objectFit: 'contain',
        objectPosition: 'right bottom',
      });
    } finally {
      if (tree) act(() => tree.unmount());
      Object.defineProperty(Platform, 'OS', {
        configurable: true,
        value: originalOS,
      });
    }
  },
);

it('anchors the GDPR repeating artwork to the original right and bottom offsets on wide Duo', () => {
  const originalOS = Platform.OS;
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
  let tree!: Renderer.ReactTestRenderer;
  try {
    act(() => {
      tree = Renderer.create(
        <DuoPreviewProvider
          value={{
            width: 951,
            height: 669,
            rightInset: 84,
            referenceWidth: 375,
          }}
        >
          <DuoContentViewport screen="profile">
            <RoMoreCard
              card="gdpr-consent"
              title="GDPR"
              width={256.5}
              dark={false}
              onPress={jest.fn()}
            />
          </DuoContentViewport>
        </DuoPreviewProvider>,
      );
    });
    const frame = tree.root.findByProps({
      'data-testid': 'ro-more-art-gdpr-consent',
    }).props.style;
    const source = resolveMoreCard({ variant: 'gdpr-consent' }).image;
    expect(frame.right).toBeCloseTo((parseFloat(source.right) / 100) * 155.5);
    expect(frame.bottom).toBeCloseTo((parseFloat(source.bottom) / 100) * 120);
    expect(frame.backgroundSize).toBe(
      '61.60000091791153px 62.90000093728304px',
    );
  } finally {
    if (tree) act(() => tree.unmount());
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: originalOS,
    });
  }
});

it('keeps the five Romanian cards ordered, preserves the document badge and routes only implemented actions', () => {
  const h = host(),
    tree = mount(h);
  try {
    const cards = tree.root.findAllByType(RoMoreCard);
    expect(cards.map(node => node.props.card)).toEqual([
      'contacts',
      'documents',
      'settings',
      'gdpr-consent',
      'tutorial',
    ]);
    expect(
      tree.root.findByProps({ testID: 'ro-more-documents-badge' }).props
        .children,
    ).toBe(8);
    expect(
      StyleSheet.flatten(
        tree.root.findByProps({ testID: 'ro-more-top-reserve' }).props.style,
      ).height,
    ).toBe(54);
    act(() => button(tree, 'Profile').props.onPress?.());
    act(() => cards[3].props.onPress());
    expect(h.onNavigate).not.toHaveBeenCalled();
    for (const card of cards.slice(0, 3)) act(() => card.props.onPress());
    act(() => button(tree, 'Messages').props.onPress());
    expect(h.onNavigate).toHaveBeenNthCalledWith(1, { screen: 'contacts' });
    expect(h.onNavigate).toHaveBeenNthCalledWith(2, { screen: 'documents' });
    expect(h.onNavigate).toHaveBeenNthCalledWith(3, { screen: 'settings' });
    expect(h.onNavigate).toHaveBeenNthCalledWith(4, { screen: 'messages' });
  } finally {
    act(() => tree.unmount());
  }
});

it('announces the resolved document count and opens Documents from that button', () => {
  const h = host(),
    tree = mount(h);
  try {
    const badge = tree.root.findByProps({ testID: 'ro-more-documents-badge' });
    const documents = button(tree, `Documents ${badge.props.children}`);
    expect(documents).toBeDefined();
    act(() => documents.props.onPress());
    expect(h.onNavigate).toHaveBeenCalledTimes(1);
    expect(h.onNavigate).toHaveBeenCalledWith({ screen: 'documents' });
    expect(button(tree, 'Contacts')).toBeDefined();
  } finally {
    act(() => tree.unmount());
  }
});

it('cancels logout locally and confirms to active prelogin after restoring navigation', () => {
  const h = host(),
    tree = mount(h);
  try {
    act(() => button(tree, 'Logout').props.onPress());
    expect(h.onPrimaryNavigationChange).toHaveBeenLastCalledWith(false);
    act(() => tree.root.findByType(BaselineDialog).props.onCancel());
    expect(tree.root.findAllByType(BaselineDialog)).toHaveLength(0);
    expect(h.onNavigate).not.toHaveBeenCalled();
    expect(h.onPrimaryNavigationChange).toHaveBeenLastCalledWith(true);
    act(() => button(tree, 'Logout').props.onPress());
    act(() => button(tree, 'Ok, got it').props.onPress());
    expect(tree.root.findAllByType(BaselineDialog)).toHaveLength(0);
    expect(h.onNavigate).toHaveBeenCalledWith({ screen: 'prelogin' });
  } finally {
    act(() => tree.unmount());
  }
});

it('opens all Romanian tutorial topics and resets the selected tutorial after Done', () => {
  const h = host(),
    tree = mount(h);
  try {
    act(() => button(tree, 'Tutorials').props.onPress());
    expect(h.onPrimaryNavigationChange).toHaveBeenLastCalledWith(true);
    expect(
      new Set(
        tree.root
          .findAll(node =>
            node.props.accessibilityLabel?.startsWith('Open tutorial:'),
          )
          .map(node => node.props.accessibilityLabel),
      ).size,
    ).toBe(8);
    act(() =>
      button(
        tree,
        'Open tutorial: HOW TO EXCHANGE CURRENCY AT THE BNR RATE VIA MOBILE BANKING',
      ).props.onPress(),
    );
    expect(button(tree, 'Previous tutorial step').props.disabled).toBe(true);
    expect(
      StyleSheet.flatten(
        tree.root.findAll(
          node =>
            node.props.role === 'dialog' &&
            node.props.accessibilityLabel === 'BNR rate exchange tutorial',
        )[0].props.style,
      ).top,
    ).toBe(12);
    expect(
      tree.root
        .findByProps({ testID: 'ro-tutorial-step' })
        .props.children.join(''),
    ).toBe('Step 1 of 5');
    act(() => button(tree, 'NEXT').props.onPress());
    expect(
      tree.root
        .findByProps({ testID: 'ro-tutorial-step' })
        .props.children.join(''),
    ).toBe('Step 2 of 5');
    act(() => button(tree, 'Previous tutorial step').props.onPress());
    expect(
      tree.root
        .findByProps({ testID: 'ro-tutorial-step' })
        .props.children.join(''),
    ).toBe('Step 1 of 5');
    act(() => button(tree, 'Go to step 5').props.onPress());
    act(() => button(tree, 'DONE').props.onPress());
    expect(tree.root.findAllByType(Tutorials)).toHaveLength(0);
    expect(h.onPrimaryNavigationChange).toHaveBeenLastCalledWith(true);
    act(() => button(tree, 'Tutorials').props.onPress());
    expect(
      button(tree, 'Open tutorial: HOW TO ENROLL CARDS IN APPLE PAY'),
    ).toBeDefined();
    expect(
      tree.root.findAllByProps({ testID: 'ro-tutorial-step' }),
    ).toHaveLength(0);
    expect(h.onNavigate).not.toHaveBeenCalled();
  } finally {
    act(() => tree.unmount());
  }
});

it('consumes host Back to dismiss tutorials and restores navigation on unmount', () => {
  const h = host('ro'),
    tree = mount(h);
  act(() =>
    tree.root
      .findAllByType(RoMoreCard)
      .find(node => node.props.card === 'tutorial')!
      .props.onPress(),
  );
  const back = (h.onBackHandlerChange as jest.Mock).mock.calls.at(-1)![0];
  act(() => {
    expect(back()).toBe(true);
  });
  expect(tree.root.findAllByType(Tutorials)).toHaveLength(0);
  expect(h.onBack).not.toHaveBeenCalled();
  act(() => tree.unmount());
  expect(h.onPrimaryNavigationChange).toHaveBeenLastCalledWith(true);
  expect(h.onBackHandlerChange).toHaveBeenLastCalledWith(null);
});

it.each(['web', 'android'] as const)(
  'keeps the original contact artwork and Source crop on %s',
  platform => {
    const previousPlatform = Platform.OS;
    Platform.OS = platform;
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <RoMoreCard
          card="contacts"
          title="Contacts"
          width={164}
          dark={false}
          onPress={() => {}}
        />,
      );
    });
    try {
      if (platform === 'web') {
        const image = tree.root.findByType('img');
        expect(image.props.src).toBe(
          Image.resolveAssetSource(moreAssets.contacts)?.uri,
        );
        expect(image.props.style).toEqual(
          expect.objectContaining({ width: '100%', height: '100%' }),
        );
      } else {
        const image = tree.root.findByType(Image);
        expect(image.props.source).toBe(moreAssets.contacts);
        expect(image.props.resizeMode).toBe('stretch');
      }
    } finally {
      act(() => tree.unmount());
      Platform.OS = previousPlatform;
    }
  },
);
