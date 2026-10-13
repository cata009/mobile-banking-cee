import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Keyboard, TextInput } from 'react-native';
import TransferScreen from '../src/experiences/pi/it/operations/TransferScreen';
import { accounts } from '../src/banking';
import {
  getItalyFinancialSnapshot,
  resetItalyFinancialState,
} from '@/features/finance/italyFinancials';
import {
  DEFAULT_ITALY_COUNTS,
  type ItalyNativeScreenProps,
} from '../src/experiences/pi/it/contracts';

let mockOffset = 0;
let mockScrollMounts = 0;
const mockScrollTo = jest.fn(({ y }: { y: number }) => {
  mockOffset = y;
});
jest.mock('react-native', () => {
  const Native = jest.requireActual('react-native');
  const ReactRuntime = jest.requireActual('react');
  const Scroll = ReactRuntime.forwardRef(
    (props: { children: React.ReactNode }, ref: React.Ref<unknown>) => {
      ReactRuntime.useImperativeHandle(ref, () => ({ scrollTo: mockScrollTo }));
      ReactRuntime.useEffect(() => {
        mockScrollMounts++;
      }, []);
      return ReactRuntime.createElement(
        Native.View,
        { ...props, testID: 'transfer-scroll' },
        props.children,
      );
    },
  );
  return Object.defineProperty(Object.create(Native), 'ScrollView', {
    value: Scroll,
  });
});

const mounted: Renderer.ReactTestRenderer[] = [];
const field = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root
    .findAllByType(TextInput)
    .find(node => node.props.accessibilityLabel === label)!;
async function press(tree: Renderer.ReactTestRenderer, label: string) {
  await act(() =>
    tree.root
      .findAll(
        node =>
          node.props.accessibilityLabel === label &&
          typeof node.props.onPress === 'function',
      )[0]
      .props.onPress(),
  );
}
async function render() {
  const props: ItalyNativeScreenProps & { accountNumber: string } = {
    accountNumber: accounts()[0].number,
    target: { kind: 'payment', label: 'Bonifico' },
    productCounts: DEFAULT_ITALY_COUNTS,
    amountsHidden: false,
    onBack: jest.fn(),
    onChanged: jest.fn(),
    onNavigate: jest.fn(),
    onProfile: jest.fn(),
    isActive: true,
  };
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<TransferScreen {...props} />);
  });
  mounted.push(tree);
  return { tree, props };
}
const draft = {
  Beneficiario: 'Demo Recipient',
  'IBAN italiano': 'IT60X0542811101000000123456',
  'Importo (€)': '12,34',
  Causale: 'Transfer scroll regression',
};
async function fill(tree: Renderer.ReactTestRenderer) {
  for (const [label, value] of Object.entries(draft))
    await act(() => field(tree, label).props.onChangeText(value));
}
beforeEach(() => {
  resetItalyFinancialState();
  mockOffset = 0;
  mockScrollMounts = 0;
  mockScrollTo.mockClear();
  jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => {});
});
afterEach(async () => {
  await act(() => {
    mounted.splice(0).forEach(tree => tree.unmount());
  });
  jest.restoreAllMocks();
});

test('form, review, edit and success start at the top without remounting the container or losing the draft', async () => {
  const { tree, props } = await render();
  await fill(tree);
  expect(mockScrollTo).not.toHaveBeenCalled();
  mockOffset = 380;
  await press(tree, 'Continua');
  expect(mockOffset).toBe(0);
  expect(mockScrollTo).toHaveBeenLastCalledWith({
    x: 0,
    y: 0,
    animated: false,
  });
  expect(JSON.stringify(tree.toJSON())).toContain('Controlla il bonifico');
  mockOffset = 220;
  await press(tree, 'Modifica dati');
  expect(mockOffset).toBe(0);
  for (const [label, value] of Object.entries(draft))
    expect(field(tree, label).props.value).toBe(value);
  expect(field(tree, 'Beneficiario').props.returnKeyType).toBe('next');
  expect(typeof field(tree, 'IBAN italiano').props.onSubmitEditing).toBe(
    'function',
  );
  const calls = mockScrollTo.mock.calls.length;
  await act(() =>
    field(tree, 'Causale').props.onChangeText('Preserved edited note'),
  );
  expect(mockScrollTo).toHaveBeenCalledTimes(calls);
  mockOffset = 360;
  await press(tree, 'Continua');
  expect(mockOffset).toBe(0);
  mockOffset = 250;
  const confirm = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === 'Conferma simulazione' &&
      typeof node.props.onPress === 'function',
  )[0].props.onPress;
  await press(tree, 'Conferma simulazione');
  expect(mockOffset).toBe(0);
  expect(JSON.stringify(tree.toJSON())).toContain('Simulazione completata');
  expect(JSON.stringify(tree.toJSON())).not.toContain('native-demo-');
  await act(() => confirm());
  expect(props.onChanged).toHaveBeenCalledTimes(1);
  expect(mockScrollMounts).toBe(1);
});

test('header Back from review restores the filled form at the top', async () => {
  const { tree, props } = await render();
  await fill(tree);
  await press(tree, 'Continua');
  mockOffset = 280;
  await press(tree, 'Indietro');
  expect(mockOffset).toBe(0);
  for (const [label, value] of Object.entries(draft))
    expect(field(tree, label).props.value).toBe(value);
  expect(props.onBack).not.toHaveBeenCalled();
});

test('hidden navigation and restoring the same step do not scroll or dismiss the keyboard', async () => {
  const { tree, props } = await render();
  await fill(tree);
  mockOffset = 340;
  mockScrollTo.mockClear();
  (Keyboard.dismiss as jest.Mock).mockClear();
  await act(() => {
    tree.update(<TransferScreen {...props} isActive={false} />);
  });
  expect(mockOffset).toBe(340);
  expect(mockScrollTo).not.toHaveBeenCalled();
  expect(Keyboard.dismiss).not.toHaveBeenCalled();
  await act(() => {
    tree.update(<TransferScreen {...props} isActive />);
  });
  expect(mockOffset).toBe(340);
  expect(mockScrollTo).not.toHaveBeenCalled();
  for (const [label, value] of Object.entries(draft))
    expect(field(tree, label).props.value).toBe(value);
});

test('receipt shows the transfer result without exposing its internal key and retains double-submit protection', async () => {
  const { tree, props } = await render();
  await fill(tree);
  await press(tree, 'Continua');
  const confirm = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === 'Conferma simulazione' &&
      typeof node.props.onPress === 'function',
  )[0].props.onPress;
  await act(() => confirm());
  const receipt = JSON.stringify(tree.toJSON());
  expect(receipt).toContain('Simulazione completata');
  expect(receipt).toContain(draft.Beneficiario);
  expect(receipt).toContain('12,34');
  expect(receipt).not.toContain('native-demo-');
  const afterFirstSubmit = getItalyFinancialSnapshot();
  expect(
    afterFirstSubmit.completedKeys.filter(key =>
      key.startsWith('native-demo-'),
    ),
  ).toHaveLength(1);
  await act(() => confirm());
  expect(getItalyFinancialSnapshot()).toBe(afterFirstSubmit);
  expect(props.onChanged).toHaveBeenCalledTimes(1);
});
