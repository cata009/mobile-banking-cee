import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { futureCopy } from '@/features/investments/future-overview/copy';
import { currentTokens } from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { FutureInvestmentExplore } from '../src/experiences/pi/cz/evo-2027/investments/FutureInvestmentExplore';
import { FutureList } from '../src/experiences/pi/cz/evo-2027/investments/FutureSection';

const host = {
  tokens: currentTokens(false),
  language: 'en',
} as unknown as CurrentScreenProps;
const copy = futureCopy('en');
const render = (element: React.ReactElement) => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(element);
  });
  return tree;
};
const buttons = (tree: Renderer.ReactTestRenderer) =>
  tree.root
    .findAllByProps({ accessibilityRole: 'button' })
    .filter(node => typeof node.props.onPress === 'function');
const recommendation = {
  id: 'f1',
  title: 'Balanced Income Fund',
  assetClass: 'Balanced',
  instrumentCurrency: 'EUR',
} as never;

test('Explore never repeats the page title and opens a recommendation', () => {
  const onOpenSecurity = jest.fn();
  const tree = render(
    <FutureInvestmentExplore
      host={host}
      copy={copy}
      recommendations={[recommendation]}
      onOpenSecurity={onOpenSecurity}
      onOpenProfile={jest.fn()}
      onEducation={jest.fn()}
      onOpenCatalog={jest.fn()}
    />,
  );
  const headings = tree.root
    .findAllByProps({ accessibilityRole: 'header' })
    .map(node => node.props.children);
  expect(headings).toContain(copy.recommended);
  expect(headings).toContain(copy.education);
  expect(headings).not.toContain(copy.explore);
  const card = buttons(tree).find(
    node => node.props.accessibilityLabel === 'Balanced Income Fund',
  )!;
  act(() => card.props.onPress());
  expect(onOpenSecurity).toHaveBeenCalledWith('f1');
});

test('Explore routes the guide rows to education and the catalogue', () => {
  const onEducation = jest.fn();
  const onOpenCatalog = jest.fn();
  const tree = render(
    <FutureInvestmentExplore
      host={host}
      copy={copy}
      recommendations={[]}
      onOpenSecurity={jest.fn()}
      onOpenProfile={jest.fn()}
      onEducation={onEducation}
      onOpenCatalog={onOpenCatalog}
    />,
  );
  const press = (label: string) =>
    act(() =>
      buttons(tree)
        .find(node => node.props.accessibilityLabel === label)!
        .props.onPress(),
    );
  press(copy.learnRisk);
  press(copy.readyToInvest);
  expect(onEducation).toHaveBeenCalledWith('risk');
  expect(onOpenCatalog).toHaveBeenCalledTimes(1);
});

test('a grouped list keeps one row height and presses through', () => {
  const onPress = jest.fn();
  const tree = render(
    <FutureList
      host={host}
      items={[
        { id: 'a', title: 'A', icon: 'help-circle', onPress },
        {
          id: 'b',
          title: 'B',
          description: 'About B',
          icon: 'help-circle',
          onPress,
        },
      ]}
    />,
  );
  const rows = buttons(tree);
  expect(rows.map(node => node.props.accessibilityLabel)).toEqual(['A', 'B']);
  act(() => rows[0].props.onPress());
  expect(onPress).toHaveBeenCalledTimes(1);
});
