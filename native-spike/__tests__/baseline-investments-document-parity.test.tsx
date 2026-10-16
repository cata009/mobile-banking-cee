import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Platform, StyleSheet, Text, View } from 'react-native';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import { createCurrentInvestmentSnapshot } from '../src/experiences/pi/current/investments/model';
import { BaselineInvestmentDocuments } from '../src/experiences/pi/current/investments/baseline/flows/Documents';
import { SourceCustomIcon } from '../src/universal/SourceCustomIcon';
import Svg, { Path } from 'react-native-svg';

function host(): CurrentScreenProps {
  const country = 'RO';
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
    route: { screen: 'investments' },
    tokens: currentTokens(),
    t: createCurrentTranslator(country, 'en'),
    amountsHidden: false,
    screenTopInset: 54,
    isActive: true,
    onBack: jest.fn(),
  } as unknown as CurrentScreenProps;
}

test('investment disclosures match Source line boxes and Ex-Ante legend geometry', async () => {
  const screen = host();
  const snapshot = createCurrentInvestmentSnapshot(screen);
  let tree!: Renderer.ReactTestRenderer;

  await act(() => {
    tree = Renderer.create(
      <BaselineInvestmentDocuments
        host={screen}
        security={snapshot.catalog.find(item => item.status === 'active')!}
      />,
    );
  });

  const exAnte = tree.root.find(
    node =>
      node.props.accessibilityLabel === 'Ex-Ante cost information' &&
      typeof node.props.onPress === 'function',
  );
  await act(() => exAnte.props.onPress());

  const textStyle = (content: string) =>
    StyleSheet.flatten(
      tree.root
        .findAllByType(Text)
        .find(node => node.props.children === content)!.props.style,
    );
  const textContent = (content: unknown): string => {
    if (Array.isArray(content)) return content.map(textContent).join('');
    if (typeof content === 'string' || typeof content === 'number')
      return String(content);
    return '';
  };
  const copies = () =>
    tree.root
      .findAllByType(Text)
      .map(node => textContent(node.props.children))
      .filter(Boolean);
  expect(textStyle('ON-GOING').lineHeight).toBe(17);
  expect(textStyle('TRANSACTION FEE').lineHeight).toBe(15);
  expect(textStyle('11.3K EUR').lineHeight).toBe(15);
  const negativeStyle = textStyle('NEGATIVE');
  expect(negativeStyle.width).toBe(56);
  expect(negativeStyle.marginHorizontal ?? 0).toBe(0);
  const negativeText = tree.root
    .findAllByType(Text)
    .find(node => node.props.children === 'NEGATIVE')!;
  if (Platform.OS !== 'web') {
    expect(negativeText.props.numberOfLines).toBe(1);
    expect(negativeText.props.ellipsizeMode).toBe('clip');
  }
  expect(copies()).toEqual(
    expect.arrayContaining([
      'ON-GOING',
      'TRANSACTION FEE',
      'BANK FEE',
      'ENTRY',
      'TOTAL',
      '1 000,00 EUR',
      '500,00 EUR',
      '4,15%',
      '11.3K EUR',
      '5.6K EUR',
      '0 EUR',
      '-5.6K EUR',
      'NEGATIVE',
      'NEUTRAL',
      'POSITIVE',
      '0Y',
      '1Y',
      '3Y',
      '5Y',
      '7Y',
      '10Y',
      'Stress scenario',
      'Unfavourable',
      'Moderate',
      'Favourable',
      'Optimistic',
    ]),
  );

  const legend = tree.root.findAllByType(View).find(node => {
    const style = StyleSheet.flatten(node.props.style) ?? {};
    return style.flexWrap === 'wrap' && style.marginTop === 32;
  })!;
  const legendStyle = StyleSheet.flatten(legend.props.style);
  expect(legendStyle.columnGap).toBe(16);
  expect(legendStyle.rowGap).toBe(10);

  const legendItems = tree.root.findAllByType(View).filter(node => {
    const style = StyleSheet.flatten(node.props.style) ?? {};
    return style.width === '47%' || style.width === '47.5%';
  });
  expect(legendItems).toHaveLength(5);
  expect(
    legendItems.map(node => StyleSheet.flatten(node.props.style).width),
  ).toEqual(Array(5).fill('47.5%'));

  const important = tree.root.find(
    node =>
      node.props.accessibilityLabel === 'Important information' &&
      typeof node.props.onPress === 'function',
  );
  await act(() => important.props.onPress());
  expect(textStyle('Suitability').lineHeight).toBe(20);
  expect(textStyle('Product is suitable').lineHeight).toBe(17);
  expect(textStyle('Characteristics').lineHeight).toBe(15);
  expect(textStyle('Alternatives').lineHeight).toBe(17);
  expect(textStyle('14,47%').lineHeight).toBe(17);
  const checkIcons = tree.root
    .findAllByType(SourceCustomIcon)
    .filter(icon => icon.props.name === 'check');
  expect(checkIcons).toHaveLength(3);
  expect(checkIcons.map(icon => icon.props.size)).toEqual([20, 20, 20]);
  const evaluationBulletPath =
    'M20 16C20 18.2088 18.2084 20 16 20C13.7908 20 12 18.2088 12 16C12 13.7912 13.7908 12 16 12Z';
  const evaluationBullets = tree.root
    .findAllByType(Path)
    .filter(path => path.props.d === evaluationBulletPath);
  expect(evaluationBullets).toHaveLength(3);
  const evaluationFrames = evaluationBullets.map(path => {
    let frame = path.parent;
    while (frame && frame.type !== Svg) frame = frame.parent;
    return frame;
  });
  expect(
    evaluationFrames.map(frame =>
      frame
        ? {
            type: frame.type,
            width: frame.props.width,
            height: frame.props.height,
            viewBox: frame.props.viewBox,
          }
        : null,
    ),
  ).toEqual(
    Array.from({ length: 3 }, () => ({
      type: Svg,
      width: 32,
      height: 32,
      viewBox: '0 0 32 32',
    })),
  );
  expect(copies()).toEqual(
    expect.arrayContaining([
      'The Bank hereby informs the client, that the financial instrument that is subject matter of the order is suitable for him.',
      'Characteristics',
      'Result',
      'Limit utilisation',
      'Alternatives',
      '14,47%',
      'Total portfolio risk',
      '58,87%',
      'Concentration risk',
      '0,47%',
      'Appropriateness Evaluation',
      'The bank hereby informs the client, that the financial instrument concerned resp, the providing of such investment service is appropriate for him',
      'Target Market',
      "Product is in the client's Target Market",
      'The Bank has determined a target market for the financial instrument that is subject matter of the order, and, has determined the financial instrument compatibility with the needs, characteristics and goals of its clients. Following to an assessment of information provided by you the Bank hereby informs that the financial instrument that is the subject matter of the order has been assessed as compatible with your needs, characteristics and goals and, as such, it matches your needs, characteristics and goals.',
    ]),
  );

  const productDocuments = tree.root.find(
    node =>
      node.props.accessibilityLabel === 'Product documents' &&
      typeof node.props.onPress === 'function',
  );
  await act(() => productDocuments.props.onPress());
  expect(copies()).toEqual(
    expect.arrayContaining([
      'Key Information Document (KID)',
      'Standardised risks, costs and performance profile',
      'Prospectus',
      'Official fund objectives, terms and conditions',
      'Investment Advisory Report',
      'Personalised recommendation and rationale',
    ]),
  );

  const disclaimer = tree.root.find(
    node =>
      node.props.accessibilityLabel === 'Investment disclaimer' &&
      typeof node.props.onPress === 'function',
  );
  await act(() => disclaimer.props.onPress());
  expect(copies()).toContain(
    'Investments can rise or fall in value. Consider the available product information and your individual circumstances before making an investment decision.',
  );

  const originalPlatformOS = Object.getOwnPropertyDescriptor(Platform, 'OS')!;
  Object.defineProperty(Platform, 'OS', {
    ...originalPlatformOS,
    value: 'web',
  });
  try {
    const exAnteWeb = tree.root.find(
      node =>
        node.props.accessibilityLabel === 'Ex-Ante cost information' &&
        typeof node.props.onPress === 'function',
    );
    await act(() => exAnteWeb.props.onPress());
    const negativeWebText = tree.root
      .findAllByType(Text)
      .find(node => node.props.children === 'NEGATIVE')!;
    const negativeWebStyle = StyleSheet.flatten(negativeWebText.props.style);
    expect(negativeWebText.props.numberOfLines).toBeUndefined();
    expect(negativeWebStyle.whiteSpace).toBe('nowrap');
    expect(negativeWebStyle.overflowWrap).toBe('normal');
    expect(negativeWebStyle.overflow).toBe('visible');
    expect(negativeWebStyle.width).toBe(56);
    expect(negativeWebStyle.marginHorizontal ?? 0).toBe(0);
  } finally {
    Object.defineProperty(Platform, 'OS', originalPlatformOS);
  }

  await act(() => tree.unmount());
});
