import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import {
  getProductsMenuForCountry,
  type ProductsCard,
} from '@/app/config/productsMenuConfig';
import { getDocumentsConfigForCountry } from '@/app/config/documentsConfig';
import type {
  CurrentRoute,
  CurrentScreenProps,
} from '../src/experiences/pi/current/contracts';
import { CURRENT_HOME_ADAPTER } from '../src/experiences/pi/current/adapter';
import ProductSheet from '../src/experiences/pi/current/baseline/offers/ProductSheet';
import { AccountSelectionSheet } from '../src/experiences/pi/current/baseline/AccountSelectionSheet';
import { SourceBottomSheet } from '../src/universal/SourceBottomSheet';
import { SourceCustomIcon } from '../src/universal/SourceCustomIcon';
import { mobileFirstTokens } from '../src/universal/tokens';
import {
  completeGeniusProtectRequest,
  getGeniusProtectSnapshot,
  resetGeniusProtect,
  startGeniusProtectRequest,
} from '@/features/insurance/geniusProtect';

function createHost(
  route: CurrentRoute,
  overrides: Partial<CurrentScreenProps> = {},
): CurrentScreenProps {
  return {
    country: 'RO',
    release: 'release-current',
    scenario: 'active',
    language: 'ro',
    tokens: mobileFirstTokens,
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
    route,
    amountsHidden: false,
    screenTopInset: 0,
    isActive: true,
    t: (_key, fallback) => fallback ?? _key,
    onNavigate: jest.fn(),
    onBack: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    onLanguageChange: jest.fn(),
    mode: 'light',
    onModeChange: jest.fn(),
    ...overrides,
  };
}

function press(tree: Renderer.ReactTestRenderer, label: string) {
  const button = tree.root
    .findAll(
      node =>
        node.props.accessibilityLabel === label &&
        typeof node.props.onPress === 'function',
    )
    .at(-1);
  if (!button) {
    const available = tree.root
      .findAll(node => typeof node.props.onPress === 'function')
      .map(
        node =>
          `${
            node.props.accessibilityLabel ??
            node.props.accessible ??
            'unlabeled'
          }${node.props.disabled ? ' (disabled)' : ''}`,
      );
    throw new Error(
      `Missing pressable control: ${label}. Available: ${available.join(', ')}`,
    );
  }
  act(() => button.props.onPress());
}

function type(tree: Renderer.ReactTestRenderer, label: string, value: string) {
  const input = tree.root
    .findAllByType(TextInput)
    .find(node => node.props.accessibilityLabel === label);
  if (!input) throw new Error(`Missing text input: ${label}`);
  act(() => input.props.onChangeText(value));
}

function renderProductDetail(
  route: CurrentRoute,
  overrides: Partial<CurrentScreenProps> = {},
) {
  const Screen = CURRENT_HOME_ADAPTER.screens['product-detail']!;
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<Screen {...createHost(route, overrides)} />);
  });
  return tree;
}

function geniusProtectCard(): ProductsCard {
  const card = getProductsMenuForCountry('RO').products.find(
    item => item.id === 'insurance',
  );
  if (!card) throw new Error('Romanian Insurance product card is missing');
  return card;
}

describe('Genius Protect', () => {
  beforeEach(() => resetGeniusProtect());

  it('routes the existing Insurance sheet row to the Genius Protect product detail', () => {
    const host = createHost({ screen: 'products' });
    const onClose = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <ProductSheet
          host={host}
          card={geniusProtectCard()}
          onClose={onClose}
        />,
      );
    });
    try {
      press(tree, 'Genius Protect');
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(host.onNavigate).toHaveBeenCalledWith({
        screen: 'product-detail',
        params: {
          title: 'Genius Protect',
          cardId: 'insurance',
          optionId: 'genius-protect',
        },
      });
    } finally {
      act(() => tree.unmount());
    }
  });

  it('renders the Figma product detail from the existing product-detail route', () => {
    const tree = renderProductDetail({
      screen: 'product-detail',
      params: {
        title: 'Genius Protect',
        cardId: 'insurance',
        optionId: 'genius-protect',
      },
    });
    try {
      const copy = JSON.stringify(tree.toJSON());
      expect(copy).toContain('Genius Protect');
      expect(copy).toContain('7 LEI / LUNĂ');
      expect(copy).toContain('40.000 LEI');
    } finally {
      act(() => tree.unmount());
    }
  });

  it('adds Genius Protect policy documents to the Romanian Documents source only', () => {
    const roItems = getDocumentsConfigForCountry('RO').groups.flatMap(
      group => group.items,
    );
    const czItems = getDocumentsConfigForCountry('CZ').groups.flatMap(
      group => group.items,
    );
    const policyDocumentIds = [
      'genius-protect-policy-certificate',
      'genius-protect-policy-contract',
    ];

    expect(roItems.map(item => item.id)).toEqual(
      expect.arrayContaining(policyDocumentIds),
    );
    expect(czItems.map(item => item.id)).not.toEqual(
      expect.arrayContaining(policyDocumentIds),
    );
  });

  it('collects notices before personal data and disables Continue until every needs declaration is complete', () => {
    const tree = renderProductDetail({
      screen: 'product-detail',
      params: {
        title: 'Genius Protect',
        cardId: 'insurance',
        optionId: 'genius-protect',
      },
    });
    try {
      press(tree, 'Continuă');
      press(tree, 'Sunt de acord cu condițiile de asigurare Genius Protect');
      press(tree, 'Sunt interesat');
      let copy = JSON.stringify(tree.toJSON());
      expect(copy).toContain('Acorduri și note de informare');
      expect(copy).not.toContain('Datele tale');
      expect(copy).not.toContain('Închide fluxul');
      expect(copy).not.toContain('Leave the flow');

      press(tree, 'Nota de informare UniCredit Bank');
      press(tree, 'Nota de informare Allianz-Țiriac');
      press(tree, 'Nota de informare Trans Sped');
      press(tree, 'Continuă');
      press(tree, 'Confirm datele personale');
      press(tree, 'Continuă');
      copy = JSON.stringify(tree.toJSON());
      expect(copy).toContain('Analiza nevoilor și cerințelor');
      const continueButton = tree.root
        .findAll(
          node =>
            node.props.accessibilityLabel === 'Continuă' &&
            typeof node.props.onPress === 'function',
        )
        .at(-1);
      expect(continueButton?.props.disabled).toBe(true);
    } finally {
      act(() => tree.unmount());
    }
  });

  it('opens policy details and routes Documents to the shared document list', () => {
    startGeniusProtectRequest();
    completeGeniusProtectRequest();
    const onNavigate = jest.fn();
    const tree = renderProductDetail(
      {
        screen: 'product-detail',
        params: {
          title: 'Genius Protect',
          cardId: 'insurance',
          optionId: 'genius-protect-policy',
        },
      },
      { language: 'en', onNavigate },
    );
    try {
      let copy = JSON.stringify(tree.toJSON());
      expect(copy).toContain('Insurances');
      expect(copy).toContain('3431424');
      expect(copy).toContain('7 RON');
      expect(copy).toContain('WHAT’S INSURED');
      expect(copy).toContain('NOTIFY A CLAIM');
      press(tree, 'DEATH DUE TO ILLNESS');
      expect(JSON.stringify(tree.toJSON())).toContain(
        'Financial protection for your family in case of death caused by illness.',
      );
      press(tree, 'Close');
      press(tree, 'Details');
      copy = JSON.stringify(tree.toJSON());
      expect(copy).toContain('Insurance details');
      expect(copy).toContain('Insurance type');
      expect(copy).toContain('Status');
      expect(copy).toContain('Payment account');
      expect(copy).toContain('1234567890123456');
      press(tree, 'Back');
      expect(JSON.stringify(tree.toJSON())).toContain('WHAT’S INSURED');

      const coverageChevrons = tree.root
        .findAllByType(SourceCustomIcon)
        .filter(icon => icon.props.name === 'chevron-link');
      expect(coverageChevrons).toHaveLength(4);
      expect(coverageChevrons.every(icon => icon.props.size === 32)).toBe(true);

      press(tree, 'Documents');
      expect(onNavigate).toHaveBeenCalledWith({ screen: 'documents' });
    } finally {
      act(() => tree.unmount());
    }
  });

  it('completes the Figma journey from product details through notices, eligibility, payment and OTP', async () => {
    jest.useFakeTimers();
    const host = createHost({
      screen: 'product-detail',
      params: {
        title: 'Genius Protect',
        cardId: 'insurance',
        optionId: 'genius-protect',
      },
    });
    const Screen = CURRENT_HOME_ADAPTER.screens['product-detail']!;
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(<Screen {...host} />);
    });
    try {
      press(tree, 'Continuă');
      press(tree, 'Sunt de acord cu condițiile de asigurare Genius Protect');
      press(tree, 'Sunt interesat');
      press(tree, 'Nota de informare UniCredit Bank');
      press(tree, 'Nota de informare Allianz-Țiriac');
      press(tree, 'Nota de informare Trans Sped');
      press(tree, 'Continuă');
      const personalDataChevrons = tree.root.findAllByProps({
        testID: 'genius-protect-row-chevron',
      });
      expect(personalDataChevrons.length).toBeGreaterThanOrEqual(4);
      expect(
        personalDataChevrons.every(icon => icon.props.style.width === 32),
      ).toBe(true);
      press(tree, 'Confirm datele personale');
      press(tree, 'Continuă');
      press(
        tree,
        'Declar că NU sunt înregistrat/ă la CNAS ca persoană cu handicap',
      );
      press(
        tree,
        'Consider că eu sau familia mea avem nevoie de protecție financiară',
      );
      press(
        tree,
        'Sunt de acord că pentru acest produs nu voi primi consultanță',
      );
      press(tree, 'Continuă');
      press(tree, 'Open Cont de plată');
      expect(tree.root.findByType(AccountSelectionSheet)).toBeDefined();
      press(tree, 'Cont curent salariu, RO57BACX0000007913551234');
      press(tree, 'Select');
      expect(JSON.stringify(tree.toJSON())).toContain('Cont curent salariu');
      const paymentChevrons = tree.root.findAllByProps({
        testID: 'genius-protect-row-chevron',
      });
      expect(paymentChevrons.length).toBeGreaterThanOrEqual(1);
      expect(paymentChevrons.every(icon => icon.props.style.width === 32)).toBe(
        true,
      );
      press(tree, 'Mandat pentru debitarea automată');
      expect(
        tree.root.findByType(SourceBottomSheet).props.showFooterDivider,
      ).toBe(false);
      press(tree, 'Am citit și sunt de acord');
      press(tree, 'Continuă');
      const preContractChevrons = tree.root.findAllByProps({
        testID: 'genius-protect-row-chevron',
      });
      expect(preContractChevrons.length).toBeGreaterThanOrEqual(2);
      expect(
        preContractChevrons.every(icon => icon.props.style.width === 32),
      ).toBe(true);
      press(tree, 'Oferta de asigurare Genius Protect');
      press(tree, 'Acceptă oferta de asigurare');
      press(tree, 'Documentație Trans Sped');
      press(tree, 'Am citit și sunt de acord');
      press(tree, 'Acord informare prealabilă');
      press(tree, 'Continuă');
      const contractChevrons = tree.root.findAllByProps({
        testID: 'genius-protect-row-chevron',
      });
      expect(contractChevrons.length).toBeGreaterThanOrEqual(3);
      expect(
        contractChevrons.every(icon => icon.props.style.width === 32),
      ).toBe(true);
      press(tree, 'Contract Genius Protect');
      press(tree, 'Am citit și sunt de acord');
      press(tree, 'Mandat de debitare automată');
      press(tree, 'Am citit și sunt de acord');
      press(tree, 'Cerere certificat Trans Sped');
      press(tree, 'Am citit și sunt de acord');
      press(tree, 'Confirm că am citit și accept documentele contractuale');
      press(tree, 'Continuă');
      const otpPhone = tree.root.findByProps({
        testID: 'genius-protect-otp-phone',
      });
      expect(otpPhone.props.children).toBe('+40721234567');
      expect(otpPhone.props.style.fontFamily).toBe('UniCredit-bold');
      type(tree, 'Cod OTP', '123456');
      press(tree, 'Semnează');
      expect(JSON.stringify(tree.toJSON())).toContain('Finalizăm semnarea');
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
      expect(JSON.stringify(tree.toJSON())).toContain(
        'Felicitări. Asigurarea a fost emisă cu succes!',
      );
      expect(getGeniusProtectSnapshot()).toMatchObject({
        draft: null,
        hasActivePolicy: true,
        policy: {
          number: '3431424',
          nextPremiumCents: 700,
          lastPaymentDate: '15.03.2026',
        },
      });
      press(tree, 'Continuă');
      expect(host.onNavigate).toHaveBeenCalledWith({ screen: 'home' });
    } finally {
      act(() => tree.unmount());
      jest.useRealTimers();
    }
  });
});
