import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import AccountScreen from '../src/experiences/pi/cz/evo-2027/accounts/AccountScreen';
import { MovementDetail } from '../src/experiences/pi/cz/evo-2027/accounts/Movements';
import { accountMovements, czechProducts } from '../src/experiences/pi/cz/evo-2027/accounts/source';
import { DEFAULT_CZECH_COUNTS, type CzechNativeScreenProps } from '../src/experiences/pi/cz/evo-2027/contracts';

test('an Evo account detail consumes the exact coordinator transaction even when it is absent from its reconstructed ledger', () => {
  const products = czechProducts(DEFAULT_CZECH_COUNTS);
  const account = products.find(p => p.type === 'current_account')!;
  const transaction = { ...accountMovements(account, products)[0]!, id: 'canonical-sidecar-only', label: 'Canonical host transfer' };
  const props: CzechNativeScreenProps = {
    scenario: 'active', productCounts: DEFAULT_CZECH_COUNTS, amountsHidden: false,
    route: { screen: 'transaction', params: { productId: account.id, transactionId: transaction.id } },
    transactionSelection: { productId: account.id, source: 'account', transaction },
    onBack: jest.fn(), onNavigate: jest.fn(), onSearch: jest.fn(), onProfile: jest.fn(), onAmountsToggle: jest.fn(), onChanged: jest.fn(),
  };
  let tree!: Renderer.ReactTestRenderer;
  act(() => { tree = Renderer.create(<AccountScreen {...props} />); });
  expect(tree.root.findAllByType(MovementDetail)).toHaveLength(1);
  expect(tree.root.findByType(MovementDetail).props.transaction).toBe(transaction);
  act(() => tree.unmount());
});
