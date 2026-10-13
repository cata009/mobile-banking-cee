import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import { ITALY_CARDS } from '@/experiences/pi/it/mobile-first/cardsContent';
import { getItalyFinancialSnapshot } from '@/features/finance/italyFinancials';
import CardArt from '../src/experiences/pi/it/cards/CardArt';
import CardPersonalization from '../src/experiences/pi/it/cards/CardPersonalization';
import CardJourney from '../src/experiences/pi/it/cards/CardJourney';
import { Select } from '../src/universal/Select';

function exposedText(tree: Renderer.ReactTestRenderer) {
  const textChildren = (children: React.ReactNode): string =>
    typeof children === 'string' || typeof children === 'number'
      ? String(children)
      : Array.isArray(children)
      ? children.map(textChildren).join(' ')
      : React.isValidElement<{ children?: React.ReactNode }>(children)
      ? textChildren(children.props.children)
      : '';
  return (
    tree.root
      .findAllByType(Text)
      .map(node => textChildren(node.props.children))
      .join(' ') +
    ' ' +
    tree.root
      .findAll(
        node =>
          typeof node.props.accessibilityLabel === 'string' ||
          node.props.accessibilityValue?.text,
      )
      .map(
        node =>
          `${node.props.accessibilityLabel ?? ''} ${
            node.props.accessibilityValue?.text ?? ''
          }`,
      )
      .join(' ')
  );
}
const press = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root.findAll(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  )[0];
test('hidden card artwork masks spoken suffix while opening its original destination', async () => {
  const card = ITALY_CARDS.find(row => row.id === 'minor')!,
    open = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<CardArt card={card} hidden onOpen={open} />);
  });
  expect(exposedText(tree)).not.toContain(card.lastFour);
  await act(() =>
    press(tree, `Apri carta ${card.name} •••• ••••`).props.onPress(),
  );
  expect(open).toHaveBeenCalledTimes(1);
  expect(tree.root.findByProps({ testID: 'card-art-minor' })).toBeTruthy();
  await act(() =>
    tree.update(<CardArt card={card} hidden={false} onOpen={open} />),
  );
  expect(exposedText(tree)).toContain(card.lastFour);
  await act(() => tree.unmount());
});
test('hidden personalization masks visible and spoken card suffixes without changing IDs', async () => {
  let tree!: Renderer.ReactTestRenderer;
  const changed = jest.fn();
  await act(() => {
    tree = Renderer.create(
      <CardPersonalization
        cards={ITALY_CARDS}
        hidden
        onBack={jest.fn()}
        onProfile={jest.fn()}
        onChanged={changed}
      />,
    );
  });
  const visible = exposedText(tree);
  for (const card of ITALY_CARDS) expect(visible).not.toContain(card.lastFour);
  for (const label of [
    'Modifica nome UniCredit Flexia Classic •••• ••••',
    'Rimuovi UniCredit Flexia Classic •••• •••• dai preferiti',
    'Sposta UniCredit Flexia Classic •••• •••• in alto',
    'Sposta UniCredit Flexia Classic •••• •••• in basso',
  ])
    expect(press(tree, label)).toBeTruthy();
  expect(
    tree.root.findByProps({ testID: 'personalize-card-flexia' }),
  ).toBeTruthy();
  expect(changed).not.toHaveBeenCalled();
  await act(() => tree.unmount());
});
test.each(['recharge', 'reimburse'])(
  'hidden %s funding choices mask account numbers but retain exact selection values',
  async view => {
    const financial = getItalyFinancialSnapshot(),
      card = ITALY_CARDS.find(
        row => row.id === (view === 'recharge' ? 'genius' : 'flexia'),
      )!;
    let tree!: Renderer.ReactTestRenderer;
    await act(async () => {
      tree = Renderer.create(
        <CardJourney
          card={card}
          cards={ITALY_CARDS}
          movements={[]}
          financial={financial}
          view={view}
          hidden
          onBack={jest.fn()}
          onProfile={jest.fn()}
          onChanged={jest.fn()}
          onGo={jest.fn()}
        />,
      );
    });
    const select = tree.root.findByType(Select);
    const accounts = financial.accounts.filter(row => !row.imported);
    for (const account of accounts) {
      expect(
        select.props.items.find(
          (item: { value: string }) => item.value === account.number,
        ),
      ).toMatchObject({
        value: account.number,
        label: `${account.name} •••••••••`,
      });
      expect(exposedText(tree)).not.toContain(account.number);
    }
    await act(() => press(tree, 'Conto di addebito').props.onPress());
    for (const account of accounts)
      expect(exposedText(tree)).not.toContain(account.number);
    const next = accounts.find(row => row.number !== select.props.value)!;
    await act(() => press(tree, `${next.name} •••••••••`).props.onPress());
    expect(tree.root.findByType(Select).props.value).toBe(next.number);
    expect(exposedText(tree)).not.toContain(next.number);
    await act(() => tree.unmount());
  },
);
