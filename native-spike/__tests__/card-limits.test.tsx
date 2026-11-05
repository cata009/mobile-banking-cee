import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import CardLimitsSheet from '../src/experiences/pi/current/baseline/CardLimitsSheet';
import { BaselineNavigationRow } from '../src/universal/BaselineNavigationRow';
import { BaselineTextField } from '../src/universal/BaselineTextField';
import { PrimaryButton } from '../src/universal/PrimaryButton';
jest.mock('../src/universal/ModalPortal', () => ({
  ModalPortal: ({ children }: { children: React.ReactNode }) => children,
}));
test('edits a local-currency limit and retains it for the same card', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <CardLimitsSheet
        country="HU"
        cardId="test-hu"
        dark={false}
        onClose={() => {}}
      />,
    );
  });
  const row = () =>
    tree.root
      .findAllByType(BaselineNavigationRow)
      .find(x => x.props.ariaLabel === 'ATM amount limit')!;
  expect(row().props.description).toContain('HUF');
  act(() => row().props.onPress());
  const field = tree.root.findByType(BaselineTextField);
  act(() => field.props.onChange('500000'));
  expect(tree.root.findByType(PrimaryButton).props.disabled).toBe(false);
  act(() => tree.root.findByType(PrimaryButton).props.onPress());
  expect(row().props.description).toContain('500,000.00 HUF');
  act(() => tree.unmount());
  act(() => {
    tree = Renderer.create(
      <CardLimitsSheet
        country="HU"
        cardId="test-hu"
        dark={false}
        onClose={() => {}}
      />,
    );
  });
  expect(row().props.description).toContain('500,000.00 HUF');
  act(() => tree.unmount());
});
