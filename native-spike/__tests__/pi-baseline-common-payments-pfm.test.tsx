import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Image, Platform, ScrollView, StyleSheet } from 'react-native';
import {
  getPaymentsMenuForCountry,
  getHeroSheetForRelease,
} from '@/app/config/paymentsMenuConfig';
import { getCountryCurrency, roundMoney } from '@/data/exchangeRates';
import {
  createSpendingAnalyticsTimeline,
  createSpendingCategoryDetail,
} from '@/data/spendingAnalytics';
import {
  getPaymentTemplates,
  getSavedBeneficiaries,
} from '@/data/paymentTemplates';
import { getCzechPaymentBankName } from '@/data/czechDomesticAccount';
import {
  createEmptyDomesticPaymentDraft,
  createTemplateDomesticPaymentDraft,
} from '@/data/paymentFlow';
import {
  createCurrentProducts,
  createCurrentTranslator,
  currentTokens,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { RoBaselinePaymentsScreen } from '../src/experiences/pi/current/baseline/payments/hub/Payments';
import { RoBaselinePaymentTemplates } from '../src/experiences/pi/current/baseline/payments/hub/Templates';
import RoBaselinePaymentCreateScreen from '../src/experiences/pi/current/baseline/payments/domestic/RoBaselinePaymentCreateScreen';
import { BaselineLocalAccountFields } from '../src/experiences/pi/current/baseline/payments/domestic/LocalAccountFields';
import RoBaselinePfmScreen from '../src/experiences/pi/current/baseline/spending/PfmScreen';
import { RoBaselinePfmOverview } from '../src/experiences/pi/current/baseline/spending/Overview';
import { RoBaselinePfmCategoryDetail } from '../src/experiences/pi/current/baseline/spending/details';
import { BaselinePaymentHero } from '../src/universal/BaselinePaymentHero';
import { BaselinePaymentImage } from '../src/universal/BaselinePaymentImage';
import { BaselineBanner } from '../src/universal/BaselineBanner';
import { BaselineTextField } from '../src/universal/BaselineTextField';
import { BaselineSectionDivider } from '../src/universal/BaselineSectionDivider';
import { BaselineDialog } from '../src/universal/BaselineDialog';
import { DeleteActionReveal } from '../src/universal/DeleteActionReveal';
import { SourceCustomIcon } from '../src/universal/SourceCustomIcon';
import { BaselineAmountField } from '../src/universal/BaselineAmountField';
import { BaselineTransactionRow } from '../src/universal/BaselineTransactionRow';
import { PrimaryButton } from '../src/universal/PrimaryButton';
import { BaselineHeaderActionButton } from '../src/universal/BaselineHeaderActions';
import { Text } from '../src/universal/Typography';
import {
  RoBaselinePaymentSign,
  RoBaselinePaymentSuccess,
} from '../src/experiences/pi/current/baseline/payments/confirmation/RoBaselinePaymentConfirmation';

const countries = ['RO', 'HU', 'RS', 'SI', 'CZ', 'SK', 'BA', 'BA_BL'] as const;

it('CZ external template entry preserves Source coordinator account text; local conversion belongs to the in-form picker', () => {
  const h = host('CZ'),
    selection = getPaymentTemplates('CZ')[0]!;
  h.route = {
    screen: 'payment-create',
    params: { selectionId: selection.id, selectionKind: selection.kind },
  };
  const expected = createTemplateDomesticPaymentDraft(
    selection,
    'CZ',
    createCurrentProducts(h).products[0],
  );
  const tree = mount(<RoBaselinePaymentCreateScreen {...h} />);
  try {
    expect(field(tree, 'Prefix').props.value).toBe(expected.prefix);
    expect(field(tree, 'Account number').props.value).toBe(
      expected.accountNumber,
    );
    expect(field(tree, 'Bank code').props.value).toBe(expected.bankCode);
    expect(tree.root.findByType(BaselineAmountField).props.value).toBe(
      expected.amount,
    );
    expect(tree.root.findByType(PrimaryButton).props.disabled).toBe(true);
  } finally {
    act(() => tree.unmount());
  }
});
function host(country: CurrentScreenProps['country']): CurrentScreenProps {
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
    route: { screen: 'payments' },
    tokens: currentTokens(),
    t: createCurrentTranslator(country, 'en'),
    amountsHidden: false,
    screenTopInset: 0,
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
    onBackHandlerChange: jest.fn(),
  };
}
function mount(element: React.ReactElement) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(element);
  });
  return tree;
}
function button(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(
    node =>
      typeof node.props.onPress === 'function' &&
      node.props.accessibilityLabel === label,
  )[0]!;
}
function field(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root
    .findAllByType(BaselineTextField)
    .filter(node => node.props.label === label)
    .at(-1)!;
}

it.each(countries)(
  '%s shares PFM composition with country reporting currency, reconciled sums and canonical category drilldown',
  country => {
    const h = host(country),
      onTransactionClick = jest.fn();
    const tree = mount(
      <RoBaselinePfmScreen {...h} onTransactionClick={onTransactionClick} />,
    );
    try {
      const expected = createSpendingAnalyticsTimeline(
        country,
        createCurrentProducts(h).products,
      );
      const summary = expected.summariesByPeriodKey[expected.activePeriodKey]!;
      const overview = tree.root.findByType(RoBaselinePfmOverview);
      expect(overview.props.summary).toEqual(summary);
      expect(summary.currency).toBe(getCountryCurrency(country));
      expect(summary.sourceTransactions.length).toBeGreaterThan(0);
      expect(
        roundMoney(
          summary.sourceTransactions
            .filter(row => row.amount < 0)
            .reduce((sum, row) => sum - row.amount, 0),
        ),
      ).toBe(summary.spendingTotal);
      expect(
        roundMoney(
          summary.moneyOutCategories.reduce((sum, row) => sum + row.total, 0),
        ),
      ).toBe(summary.spendingTotal);
      expect(
        roundMoney(
          summary.moneyInCategories.reduce((sum, row) => sum + row.total, 0),
        ),
      ).toBe(summary.incomeTotal);
      expect(summary.netTotal).toBe(
        roundMoney(summary.incomeTotal - summary.spendingTotal),
      );
      expect(summary.moneyOutCategories.map(row => row.category)).not.toContain(
        'Investments',
      );
      const category = summary.moneyOutCategories[0]!.category;
      act(() => overview.props.onCategoryClick(category, 'out'));
      const detail = tree.root.findByType(RoBaselinePfmCategoryDetail);
      expect(detail.props.category).toBe(category);
      const expectedDetail = createSpendingCategoryDetail(
        summary,
        category,
        'out',
      );
      const rows = tree.root.findAllByType(BaselineTransactionRow);
      expect(rows.map(row => row.props.transaction)).toEqual(
        expectedDetail.transactions,
      );
      expect(rows.every(row => row.props.currency === summary.currency)).toBe(
        true,
      );
      act(() => rows[0]!.props.onPress());
      expect(onTransactionClick).toHaveBeenCalledWith(
        expectedDetail.transactions[0],
      );
    } finally {
      act(() => tree.unmount());
    }
  },
);

it('CZ uses the Source clipboard parser when browser access is available and handles denial', async () => {
  const platform = jest.replaceProperty(Platform, 'OS', 'web');
  const previousNavigator = Object.getOwnPropertyDescriptor(
    globalThis,
    'navigator',
  );
  const readText = jest.fn().mockResolvedValue('19-2000145399 / 2700');
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { clipboard: { readText } },
  });
  const onChange = jest.fn();
  const tree = mount(
    <BaselineLocalAccountFields
      host={host('CZ')}
      draft={createEmptyDomesticPaymentDraft('CZ')}
      onChange={onChange}
      dark={false}
    />,
  );
  try {
    await act(async () => {
      await field(tree, 'Account number').props.onFocus();
    });
    act(() =>
      button(
        tree,
        'Use account from clipboard: 19-2000145399 / 2700',
      ).props.onPress(),
    );
    expect(onChange).toHaveBeenLastCalledWith({
      prefix: '19',
      accountNumber: '2000145399',
      bankCode: '2700',
      bankName: getCzechPaymentBankName('2700'),
    });
    readText.mockRejectedValue(new Error('Clipboard denied'));
    await act(async () => {
      await field(tree, 'Account number').props.onFocus();
    });
    expect(
      tree.root.findAll(node =>
        String(node.props.accessibilityLabel).startsWith(
          'Use account from clipboard:',
        ),
      ),
    ).toHaveLength(0);
  } finally {
    act(() => tree.unmount());
    platform.restore();
    if (previousNavigator)
      Object.defineProperty(globalThis, 'navigator', previousNavigator);
    else Reflect.deleteProperty(globalThis, 'navigator');
  }
});

it.each(countries)(
  '%s uses its actual menu/actions and only routes Source implemented domestic payments',
  country => {
    const h = host(country),
      tree = mount(<RoBaselinePaymentsScreen {...h} />);
    try {
      const menu = getPaymentsMenuForCountry(country);
      const heroes = tree.root.findAllByType(BaselinePaymentHero);
      expect(heroes.map(node => node.props.item.id)).toEqual(
        menu.primaryItems.map(item => item.id),
      );
      for (const hero of heroes.filter(node =>
        ['payments-4', 'payments-5'].includes(node.props.imageVariant),
      )) {
        const width = hero.props.imageVariant === 'payments-4' ? 110 : 66;
        const canonicalImage = hero.findByType(BaselinePaymentImage);
        const imageStyle = StyleSheet.flatten(
          canonicalImage.findByType(Image).props.style,
        );
        expect(imageStyle.width).toBe((width * 104) / 120);
        expect(imageStyle.height).toBe(104);
        expect(imageStyle.right).toBe(
          hero.props.imageVariant === 'payments-5' ? 8 : 0,
        );
      }
      act(() => heroes[0]!.props.onSelect());
      const sheet = getHeroSheetForRelease(
        menu,
        country,
        menu.primaryItems[0]!.id,
        { baseline: true },
      );
      for (const action of country === 'RO' ? [] : sheet.actions) {
        const nodes = tree.root.findAll(
          node =>
            typeof node.props.onPress === 'function' &&
            String(node.props.accessibilityLabel).startsWith(action.title),
        );
        expect(nodes.length).toBeGreaterThan(0);
        if (action.id !== 'domestic-payment')
          act(() => nodes[0]!.props.onPress());
      }
      expect(h.onNavigate).not.toHaveBeenCalled();
      const domestic = tree.root.findAll(
        node =>
          typeof node.props.onPress === 'function' &&
          String(node.props.accessibilityLabel).startsWith(
            country === 'RO'
              ? 'PAYMENT TO NEW BENEFICIARY'
              : 'DOMESTIC PAYMENT',
          ),
      )[0]!;
      act(() => domestic.props.onPress());
      expect(h.onNavigate).toHaveBeenCalledWith({ screen: 'payment-create' });
    } finally {
      act(() => tree.unmount());
    }
  },
);

it.each(countries)(
  '%s preserves template/beneficiary identity and the canonical new-payment currency',
  country => {
    const h = host(country),
      tree = mount(<RoBaselinePaymentCreateScreen {...h} />);
    try {
      const expected = createEmptyDomesticPaymentDraft(
        country,
        createCurrentProducts(h).products[0],
      );
      expect(tree.root.findByType(BaselineAmountField).props.currency).toBe(
        expected.currency,
      );
      expect(expected.currency).toBe(getCountryCurrency(country));
      expect(tree.root.findByType(PrimaryButton).props.disabled).toBe(true);
    } finally {
      act(() => tree.unmount());
    }
    const templates = mount(
      <RoBaselinePaymentTemplates
        host={h}
        onBack={h.onBack}
        onSelect={selection =>
          h.onNavigate({
            screen: 'payment-create',
            params: {
              selectionId: selection.id,
              selectionKind: selection.kind,
            },
          })
        }
      />,
    );
    try {
      const selections = [
        ...getPaymentTemplates(country),
        ...getSavedBeneficiaries(country, false),
      ];
      expect(selections.length).toBeGreaterThan(0);
      for (const selection of selections) {
        const prefix =
          selection.kind === 'template' ? 'Use template' : 'Use beneficiary';
        act(() =>
          button(
            templates,
            `${prefix} ${selection.title} for ${selection.beneficiaryName}`,
          ).props.onPress(),
        );
        expect(h.onNavigate).toHaveBeenLastCalledWith({
          screen: 'payment-create',
          params: { selectionId: selection.id, selectionKind: selection.kind },
        });
      }
    } finally {
      act(() => templates.unmount());
    }
  },
);

it.each(countries)(
  '%s pins template search and renders beneficiary profile glyphs at template size',
  country => {
    const h = host(country),
      tree = mount(
        <RoBaselinePaymentTemplates
          host={h}
          onBack={h.onBack}
          onSelect={jest.fn()}
        />,
      );
    try {
      expect(tree.root.findByType(ScrollView).props.stickyHeaderIndices).toEqual([
        1,
      ]);
      const icons = tree.root
        .findAllByType(SourceCustomIcon)
        .filter(icon => icon.props.name === 'header-profile');
      const template = tree.root
        .findAllByType(SourceCustomIcon)
        .find(icon => icon.props.name === 'payment-templates');
      expect(icons).toHaveLength(getSavedBeneficiaries(country, false).length);
      expect(template).toBeDefined();
      expect(template!.props.width).toBe(20);
      expect(template!.props.height).toBe(20);
      expect(
        icons.every(
          icon =>
            icon.props.width === template!.props.width &&
            icon.props.height === template!.props.height,
        ),
      ).toBe(true);
    } finally {
      act(() => tree.unmount());
    }
  },
);

it('opens and confirms Delete from the template and beneficiary three-dot actions', () => {
  const h = host('RO'),
    template = getPaymentTemplates('RO')[0]!,
    beneficiary = getSavedBeneficiaries('RO', false)[0]!;
  const tree = mount(
    <RoBaselinePaymentTemplates
      host={h}
      onBack={h.onBack}
      onSelect={jest.fn()}
    />,
  );
  try {
    for (const item of [template, beneficiary]) {
      const kind = item.kind === 'template' ? 'Template' : 'Beneficiary';
      const actionsLabel = `${kind} actions ${item.title}`;
      act(() => button(tree, actionsLabel).props.onPress());
      const reveal = tree.root
        .findAllByType(DeleteActionReveal)
        .find(row => row.props.actionsOpen);
      expect(reveal).toBeDefined();
      const deleteLabel = `Delete ${kind.toLowerCase()} ${item.title}`;
      act(() => button(tree, deleteLabel).props.onPress());
      const dialog = tree.root.findByType(BaselineDialog);
      expect(dialog.props.body).toContain(
        item.kind === 'template' ? item.title : item.beneficiaryName,
      );
      act(() => dialog.props.onConfirm());
      expect(
        tree.root.findAllByType(Text).some(node => node.props.children === item.title),
      ).toBe(false);
    }
  } finally {
    act(() => tree.unmount());
  }
});

it.each(countries)(
  '%s uses the shared domestic payment entry layout and grouped account scan affordance',
  country => {
    const h = host(country),
      tree = mount(<RoBaselinePaymentCreateScreen {...h} />);
    try {
      expect(
        tree.root.findAllByType(Text).some(node => node.props.children === 'New beneficiary'),
      ).toBe(true);
      expect(tree.root.findAllByType(BaselineSectionDivider)).toHaveLength(0);
      const beneficiary = field(tree, 'Beneficiary');
      expect(beneficiary.props.trailingIconAction).toBeDefined();
      if (country === 'CZ') {
        for (const label of ['Prefix', 'Account number', 'Bank code'])
          expect(field(tree, label)).toBeDefined();
        expect(
          tree.root
            .findAllByType(SourceCustomIcon)
            .filter(node => node.props.name === 'payment-photo-camera'),
        ).toHaveLength(1);
      } else {
        expect(field(tree, 'IBAN')).toBeDefined();
        expect(
          tree.root.findAllByType(BaselineTextField).some(node =>
            ['Prefix', 'Bank code', 'Account number (mandatory)'].includes(
              node.props.label,
            ),
          ),
        ).toBe(false);
        expect(
          tree.root
            .findAllByType(SourceCustomIcon)
            .filter(node => node.props.name === 'payment-photo-camera'),
        ).toHaveLength(0);
      }
      expect(
        tree.root
          .findAllByType(BaselineTextField)
          .filter(node => node.props.trailingIconName === 'camera'),
      ).toHaveLength(0);
      act(() => beneficiary.props.trailingIconAction.onClick());
      expect(
        tree.root.findByType(RoBaselinePaymentTemplates).props.host.country,
      ).toBe(country);
    } finally {
      act(() => tree.unmount());
    }
  },
);

it.each(countries.filter(country => country !== 'CZ'))(
  '%s keeps the beneficiary IBAN intact when opening a saved beneficiary',
  country => {
    const selection = getSavedBeneficiaries(country, false)[0]!;
    const draft = createTemplateDomesticPaymentDraft(selection, country);
    expect(draft.recipientAccountMode).toBe('iban');
    expect(draft.accountNumber).toBe(selection.accountNumber);
    expect(draft.prefix).toBe('');
    expect(draft.bankCode).toBe('');
  },
);

it.each(['scan-pay', 'between-accounts'] as const)(
  'CZ %s preserves its specific sheet actions and literal banner fallback',
  heroId => {
    const h = host('CZ'),
      tree = mount(<RoBaselinePaymentsScreen {...h} />);
    try {
      const hero = tree.root
        .findAllByType(BaselinePaymentHero)
        .find(node => node.props.item.id === heroId)!;
      act(() => hero.props.onSelect());
      const sheet = getPaymentsMenuForCountry('CZ').heroSheets[heroId];
      expect(sheet.actions).toHaveLength(2);
      const banner = tree.root.findByType(BaselineBanner);
      expect(banner.props.title).toBe(sheet.infoBanner.title);
      expect(banner.props.description).toBe(sheet.infoBanner.description);
      for (const action of sheet.actions)
        act(() =>
          button(tree, `${action.title} ${action.description}`).props.onPress(),
        );
      expect(h.onNavigate).not.toHaveBeenCalled();
    } finally {
      act(() => tree.unmount());
    }
  },
);

it('CZ domestic form applies Source local-account constraints, bank lookup and optional-prefix eligibility', () => {
  const h = host('CZ'),
    tree = mount(<RoBaselinePaymentCreateScreen {...h} />);
  try {
    expect(field(tree, 'Prefix').props.maxLength).toBe(6);
    expect(field(tree, 'Account number').props.maxLength).toBe(10);
    expect(field(tree, 'Bank code').props.maxLength).toBe(4);
    act(() => field(tree, 'Beneficiary').props.onChange('Ada'));
    act(() => field(tree, 'Account number').props.onChange('19a2000145399'));
    expect(field(tree, 'Account number').props.value).toBe('1920001453');
    act(() => field(tree, 'Account number').props.onChange('2000145399'));
    act(() => field(tree, 'Bank code').props.onChange('2x7005'));
    expect(field(tree, 'Bank code').props.value).toBe('2700');
    expect(JSON.stringify(tree.toJSON())).toContain(
      getCzechPaymentBankName('2700'),
    );
    act(() =>
      tree.root.findByType(BaselineAmountField).props.onChange('12,50'),
    );
    expect(field(tree, 'Prefix').props.value).toBe('');
    expect(tree.root.findByType(PrimaryButton).props.disabled).toBe(false);
    act(() => field(tree, 'Account number').props.onChange('12'));
    act(() => field(tree, 'Account number').props.onBlur());
    expect(field(tree, 'Account number').props.ariaInvalid).toBe(true);
    expect(tree.root.findByType(PrimaryButton).props.disabled).toBe(true);
  } finally {
    act(() => tree.unmount());
  }
});

it.each(['BA', 'BA_BL'] as const)(
  '%s keeps Source contact-phone/messages header actions',
  country => {
    const h = host(country),
      tree = mount(<RoBaselinePaymentsScreen {...h} />);
    try {
      const actions = tree.root.findAllByType(BaselineHeaderActionButton);
      expect(actions.map(node => node.props.icon)).toEqual([
        'contact-phone',
        'messages',
      ]);
      act(() => actions[0]!.props.onPress());
      expect(h.onNavigate).toHaveBeenLastCalledWith({ screen: 'contacts' });
    } finally {
      act(() => tree.unmount());
    }
  },
);

it('CZ preserves expanded Domestic payment heading and touched validation through recipient selection', () => {
  const h = host('CZ'),
    tree = mount(<RoBaselinePaymentCreateScreen {...h} />);
  try {
    const headers = tree.root
      .findAllByType(Text)
      .filter(
        node =>
          node.props.accessibilityRole === 'header' &&
          node.props.children === 'Domestic payment',
      );
    expect(headers).toHaveLength(2);
    act(() => field(tree, 'Account number').props.onChange('12'));
    act(() => field(tree, 'Account number').props.onBlur());
    expect(field(tree, 'Account number').props.ariaInvalid).toBe(true);
    act(() => field(tree, 'Beneficiary').props.trailingIconAction.onClick());
    act(() =>
      tree.root
        .findByType(RoBaselinePaymentTemplates)
        .props.onSelect(getPaymentTemplates('CZ')[0]!),
    );
    expect(field(tree, 'Account number').props.ariaInvalid).toBe(true);
  } finally {
    act(() => tree.unmount());
  }
});

it('CZ recipient picker returns to the existing draft with Source local template account parts', () => {
  const h = host('CZ'),
    tree = mount(<RoBaselinePaymentCreateScreen {...h} />);
  try {
    act(() => field(tree, 'Beneficiary').props.trailingIconAction.onClick());
    const picker = tree.root.findByType(RoBaselinePaymentTemplates);
    const selection = getPaymentTemplates('CZ')[0]!;
    act(() => picker.props.onSelect(selection));
    expect(field(tree, 'Beneficiary').props.value).toBe(
      selection.beneficiaryName,
    );
    const parts = selection.accountNumber.match(/^CZ\d{2}BACX(\d{6})(\d{6})$/)!;
    expect(field(tree, 'Prefix').props.value).toBe(parts[1]);
    expect(field(tree, 'Account number').props.value).toBe(parts[2]);
    expect(field(tree, 'Bank code').props.value).toBe(selection.bankCode);
    expect(tree.root.findByType(BaselineAmountField).props.value).toBe(
      selection.amount,
    );
    expect(h.onNavigate).not.toHaveBeenCalled();
  } finally {
    act(() => tree.unmount());
  }
});

it.each(countries)(
  '%s completes the existing payment review/sign/success flow without losing country currency',
  country => {
    jest.useFakeTimers();
    const h = host(country),
      tree = mount(<RoBaselinePaymentCreateScreen {...h} />);
    try {
      act(() => field(tree, 'Beneficiary').props.onChange('Ada'));
      if (country === 'CZ') {
        act(() => field(tree, 'Account number').props.onChange('2000145399'));
        act(() => field(tree, 'Bank code').props.onChange('2700'));
      } else {
        act(() =>
          field(tree, 'IBAN').props.onChange(
            `${country}49BACX000009310001`,
          ),
        );
      }
      act(() =>
        tree.root.findByType(BaselineAmountField).props.onChange('12,50'),
      );
      expect(tree.root.findByType(PrimaryButton).props.disabled).toBe(false);
      act(() => tree.root.findByType(PrimaryButton).props.onPress());
      expect(JSON.stringify(tree.toJSON())).toContain(
        `12,50 ${getCountryCurrency(country)}`,
      );
      act(() => tree.root.findByType(PrimaryButton).props.onPress());
      expect(
        tree.root.findByType(RoBaselinePaymentSign).props.host.country,
      ).toBe(country);
      act(() => tree.root.findByType(PrimaryButton).props.onPress());
      act(() => jest.advanceTimersByTime(840));
      expect(
        tree.root.findByType(RoBaselinePaymentSuccess).props.host.country,
      ).toBe(country);
      act(() => tree.root.findByType(PrimaryButton).props.onPress());
      expect(h.onNavigate).toHaveBeenLastCalledWith({ screen: 'payments' });
    } finally {
      act(() => tree.unmount());
      jest.useRealTimers();
    }
  },
);
