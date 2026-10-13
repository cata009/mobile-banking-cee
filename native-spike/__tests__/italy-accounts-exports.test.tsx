import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { unzipSync, strFromU8 } from 'fflate';
import { shareDemoFile, copyDemoText } from '../src/platform/nativeFiles';
import {
  shareAccountMovements,
  shareAccountContract,
} from '../src/experiences/pi/it/accounts/accountExports';
import { shareCardMovements } from '../src/experiences/pi/it/cards/cardExports';
import Settings from '../src/experiences/pi/it/accounts/Settings';
import { getAccountLedgerMovements } from '@/features/accounts-payments/mobileFirstAccounts';
jest.mock('../src/platform/nativeFiles', () => ({
  shareDemoFile: jest.fn().mockResolvedValue(undefined),
  copyDemoText: jest.fn().mockResolvedValue(undefined),
}));
const share = jest.mocked(shareDemoFile),
  copy = jest.mocked(copyDemoText);
beforeEach(() => jest.clearAllMocks());
test('native account exports share canonical PDF and XLSX file bytes', async () => {
  const rows = getAccountLedgerMovements('000012345');
  await shareAccountMovements(rows, 'pdf', false);
  expect(share).toHaveBeenLastCalledWith(
    'movimenti.pdf',
    'application/pdf',
    expect.any(Uint8Array),
  );
  expect(strFromU8(share.mock.calls[0][2]).startsWith('%PDF-1.4')).toBe(true);
  await shareAccountMovements(rows, 'xlsx', false);
  const sheet = strFromU8(
    unzipSync(share.mock.calls[1][2])['xl/worksheets/sheet1.xml'],
  );
  expect(sheet).toContain(rows[0].name);
  expect(sheet).toContain(`<v>${rows[0].amount}</v>`);
  await expect(shareAccountMovements(rows, 'pdf', true)).rejects.toThrow(
    'Mostra gli importi',
  );
  expect(share).toHaveBeenCalledTimes(2);
});
test('source contract shares actual PDF bytes and correct contract lines', async () => {
  await shareAccountContract();
  expect(share.mock.calls[0][0]).toBe('integrazione-contrattuale.pdf');
  const pdf = strFromU8(share.mock.calls[0][2]);
  expect(pdf).toContain('%PDF-1.4');
  expect(pdf).toContain('FACSIMILE');
  expect(pdf).toContain('Ricordati di rinnovare il consenso alla scadenza.');
});
test('card export generator masks hidden amounts in both PDF and XLSX', async () => {
  const rows = [
    {
      id: 'demo',
      name: 'Merchant',
      category: 'Shopping',
      date: '2026-02-27',
      amount: -987.65,
      status: 'settled' as const,
    },
  ];
  await shareCardMovements(rows, 'pdf', true);
  const pdf = strFromU8(share.mock.calls[0][2]);
  expect(pdf).toContain('****');
  expect(pdf).not.toContain('987.65');
  await shareCardMovements(rows, 'xlsx', true);
  const sheet = strFromU8(
    unzipSync(share.mock.calls[1][2])['xl/worksheets/sheet1.xml'],
  );
  expect(sheet).toContain('****');
  expect(sheet).not.toContain('987.65');
});
test('IBAN copy calls native clipboard only on user action and respects privacy', async () => {
  let tree!: Renderer.ReactTestRenderer;
  const props = {
    account: {
      name: 'Andrea',
      number: '000012345',
      balance: 120,
      iban: 'IT123456',
    },
    initialView: 'info',
    hidden: false,
    onBack: jest.fn(),
    onProfile: jest.fn(),
    onChanged: jest.fn(),
    onFavorites: jest.fn(),
  };
  await act(() => {
    tree = Renderer.create(<Settings {...props} />);
  });
  const button = () =>
    tree.root.findAll(
      node =>
        node.props.accessibilityLabel === 'Copia IBAN' &&
        typeof node.props.onPress === 'function',
    )[0];
  expect(copy).not.toHaveBeenCalled();
  await act(async () => {
    button().props.onPress();
  });
  expect(copy).toHaveBeenCalledWith('IT123456');
  await act(() => tree.update(<Settings {...props} hidden />));
  expect(button().props.disabled).toBe(true);
  await act(() => tree.unmount());
});
