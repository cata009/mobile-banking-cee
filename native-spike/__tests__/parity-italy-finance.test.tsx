import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { ScrollView, StyleSheet } from 'react-native';
import InvestmentsScreen from '../src/experiences/pi/it/investments/InvestmentsScreen';
import { AssetGlyph } from '../src/universal/AssetGlyph';
import { DEFAULT_ITALY_COUNTS } from '../src/experiences/pi/it/contracts';
import Funds from '../src/experiences/pi/it/investments/Funds';
import Securities from '../src/experiences/pi/it/investments/Securities';
import { readSecuritiesFinancialState } from '@/features/investments/mobileFirstSecurities';
import { getSecurityPositions } from '@/features/investments/mobileFirstValuation';
import { MainHeader } from '../src/experiences/pi/it/MainHeader';
import { InvestmentMenu } from '../src/experiences/pi/it/investments/OverviewExtras';
import SecuritiesSearch from '../src/experiences/pi/it/investments/SecuritiesSearch';
import FormSelect from '../src/experiences/pi/it/investments/FormSelect';
import { FormField } from '../src/universal/FormField';
import SecuritiesQuote from '../src/experiences/pi/it/investments/SecuritiesQuote';

test('Source investment overview retains its original owner chevron and blue floating action', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <InvestmentsScreen
        target={{ kind: 'investments' }}
        productCounts={DEFAULT_ITALY_COUNTS}
        amountsHidden={false}
        onBack={jest.fn()}
        onNavigate={jest.fn()}
        onProfile={jest.fn()}
        onChanged={jest.fn()}
      />,
    );
  });
  try {
    const button = (label: string) =>
      tree.root.findAll(
        node =>
          node.props.accessibilityLabel === label &&
          typeof node.props.onPress === 'function',
      )[0];
    const invest = button('Investi');
    expect(StyleSheet.flatten(invest.props.style)).toMatchObject({
      height: 66,
      backgroundColor: '#01315c',
    });
    expect(StyleSheet.flatten(invest.parent!.props.style)).toMatchObject({
      width: 172,
      height: 72,
      right: 16,
      bottom: 34,
    });
    const owner = button('Intestatario');
    expect(owner.findAllByType(AssetGlyph)).toHaveLength(1);
    expect(owner.findByType(AssetGlyph).props.size).toBe(16);
    await act(() => owner.props.onPress());
    expect(button('Intestatario').props.accessibilityState.expanded).toBe(
      false,
    );
    const scroll = tree.root
      .findAllByType(ScrollView)
      .find(node => typeof node.props.onScroll === 'function')!;
    await act(() =>
      scroll.props.onScroll({ nativeEvent: { contentOffset: { y: 20 } } }),
    );
    expect(tree.root.findByType(MainHeader).props.tabsGap).toBe(0);
    await act(() =>
      tree.root.findByType(MainHeader).props.onMainTab('investments'),
    );
    expect(tree.root.findByType(MainHeader).props.tabsGap).toBe(16);
    expect(button('Intestatario').props.accessibilityState.expanded).toBe(true);
  } finally {
    await act(() => tree.unmount());
  }
});

test('investment menu uses Source help/close toolbar and original quick-action assets', async () => {
  let tree!: Renderer.ReactTestRenderer;
  const close = jest.fn();
  await act(() => {
    tree = Renderer.create(
      <InvestmentMenu
        visible
        onClose={close}
        navigate={jest.fn()}
        props={{
          target: { kind: 'investments' },
          productCounts: DEFAULT_ITALY_COUNTS,
          amountsHidden: false,
          onBack: jest.fn(),
          onNavigate: jest.fn(),
          onProfile: jest.fn(),
          onChanged: jest.fn(),
        }}
      />,
    );
  });
  try {
    const button = (label: string) =>
      tree.root.findAll(
        node =>
          node.props.accessibilityLabel === label &&
          typeof node.props.onPress === 'function',
      )[0];
    expect(button('Aiuto')).toBeDefined();
    expect(button('Chiudi')).toBeDefined();
    expect(button('Ricerca').findAllByType(AssetGlyph)).toHaveLength(1);
    expect(button('Overview').findAllByType(AssetGlyph)).toHaveLength(1);
    await act(() => button('Aiuto').props.onPress());
    expect(JSON.stringify(tree.toJSON())).toContain(
      'Controlla i dati dell’operazione prima di confermare.',
    );
    await act(() => button('Chiudi').props.onPress());
    expect(close).toHaveBeenCalledTimes(1);
  } finally {
    await act(() => tree.unmount());
  }
});

test('standalone investment destinations expose Source Back/help/close controls', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <InvestmentsScreen
        target={{
          kind: 'investments',
          destination: { area: 'funds', view: 'fund', instrument: 'allianz' },
        }}
        productCounts={DEFAULT_ITALY_COUNTS}
        amountsHidden={false}
        onBack={jest.fn()}
        onNavigate={jest.fn()}
        onProfile={jest.fn()}
        onChanged={jest.fn()}
      />,
    );
  });
  try {
    const button = (label: string) =>
      tree.root.findAll(
        node =>
          node.props.accessibilityLabel === label &&
          typeof node.props.onPress === 'function',
      )[0];
    expect(button('Indietro')).toBeDefined();
    expect(button('Aiuto')).toBeDefined();
    expect(button('Chiudi')).toBeDefined();
    expect(button('Profilo')).toBeUndefined();
    await act(() => button('Aiuto').props.onPress());
    expect(JSON.stringify(tree.toJSON())).toContain(
      'Controlla i dati dell’operazione prima di confermare.',
    );
  } finally {
    await act(() => tree.unmount());
  }
});

test('security search uses original field borders, spacing and theme actions', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <SecuritiesSearch
        state={readSecuritiesFinancialState()}
        onState={jest.fn()}
        onChanged={jest.fn()}
        onSecurity={jest.fn()}
        onFunds={jest.fn()}
        registerBack={jest.fn()}
        hidden={false}
      />,
    );
  });
  try {
    expect(
      tree.root
        .findAllByType(FormSelect)
        .every(node => node.props.variant === 'securities'),
    ).toBe(true);
    const field = tree.root.findByType(FormField);
    expect(StyleSheet.flatten(field.props.containerStyle).marginBottom).toBe(0);
    expect(StyleSheet.flatten(field.props.inputProps.style)).toMatchObject({
      borderRadius: 12,
      borderColor: '#666',
    });
    expect(JSON.stringify(tree.toJSON())).toContain('Apri ›');
  } finally {
    await act(() => tree.unmount());
  }
});

test('search results retain the same Source quote renderer and date as portfolio positions', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <SecuritiesSearch
        state={readSecuritiesFinancialState()}
        onState={jest.fn()}
        onChanged={jest.fn()}
        onSecurity={jest.fn()}
        onFunds={jest.fn()}
        registerBack={jest.fn()}
        hidden={false}
        initialKind="Azioni"
      />,
    );
  });
  try {
    expect(tree.root.findAllByType(SecuritiesQuote).length).toBeGreaterThan(0);
    expect(JSON.stringify(tree.toJSON())).toContain('Aggiornato al');
  } finally {
    await act(() => tree.unmount());
  }
});

test('securities portfolio selects named deposits through the Source inline dialog', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <Securities
        destination={{ area: 'securities', view: 'portfolio' }}
        navigate={jest.fn()}
        registerBack={jest.fn()}
        onMarketChange={jest.fn()}
        onState={jest.fn()}
        state={readSecuritiesFinancialState()}
        embedded
        props={{
          target: { kind: 'investments' },
          productCounts: DEFAULT_ITALY_COUNTS,
          amountsHidden: false,
          onBack: jest.fn(),
          onNavigate: jest.fn(),
          onProfile: jest.fn(),
          onChanged: jest.fn(),
        }}
      />,
    );
  });
  try {
    const select = tree.root.findAll(
      node =>
        node.props.accessibilityLabel === 'Deposito' &&
        typeof node.props.onPress === 'function',
    )[0];
    expect(select).toBeDefined();
    await act(() => select.props.onPress());
    expect(JSON.stringify(tree.toJSON())).toContain(
      'Seleziona deposito e sottodeposito',
    );
    const joint = tree.root.findAll(
      node =>
        node.props.accessibilityLabel ===
          'Andrea Rossini Bianchi e Laura Bianchi' &&
        typeof node.props.onPress === 'function',
    )[0];
    await act(() => joint.props.onPress());
    expect(JSON.stringify(tree.toJSON())).toContain('03020 - 00000040194379');
    const category = tree.root.findAll(
      node =>
        node.props.accessibilityLabel === 'Azioni' &&
        typeof node.props.onPress === 'function',
    )[0];
    await act(() => category.props.onPress());
    const other = getSecurityPositions(readSecuritiesFinancialState()).find(
      item => item.kind !== 'Azioni' && item.quantity > 0,
    )!;
    expect(JSON.stringify(tree.toJSON())).not.toContain(other.name);
    const advanced = tree.root.findAll(
      node =>
        node.props.accessibilityLabel === 'Vista avanzata' &&
        typeof node.props.onPress === 'function',
    )[0];
    expect(advanced).toBeDefined();
    await act(() => advanced.props.onPress());
    expect(JSON.stringify(tree.toJSON())).toContain('Prezzo medio di carico');
  } finally {
    await act(() => tree.unmount());
  }
});

test('fund portfolio includes Source deposit, P&L, allocation and four-decimal prices', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <Funds
        destination={{ area: 'funds', view: 'portfolio' }}
        navigate={jest.fn()}
        registerBack={jest.fn()}
        embedded
        props={{
          target: { kind: 'investments' },
          productCounts: DEFAULT_ITALY_COUNTS,
          amountsHidden: false,
          onBack: jest.fn(),
          onNavigate: jest.fn(),
          onProfile: jest.fn(),
          onChanged: jest.fn(),
        }}
      />,
    );
  });
  try {
    const content = JSON.stringify(tree.toJSON());
    expect(content).toContain('17010 - 0000017838112');
    expect(content).toContain('P&L €/%');
    expect(content).toContain('I tuoi fondi');
    const flatten = (node: unknown): string =>
      typeof node === 'string'
        ? node
        : Array.isArray(node)
        ? node.map(flatten).join('')
        : node && typeof node === 'object' && 'children' in node
        ? flatten(node.children)
        : '';
    expect(flatten(tree.toJSON())).toContain('6747,82%');
    expect(content).toContain(',2900 €');
    expect(content).toContain(',3700 €');
  } finally {
    await act(() => tree.unmount());
  }
});
