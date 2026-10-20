import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { CzRoboFlow } from '../src/experiences/pi/cz/evo-2027/robo';
import type { CzRoboFlowProps } from '../src/experiences/pi/cz/evo-2027/robo';
import { Header } from '../src/universal/Header';
import { SourceCustomIcon } from '../src/universal/SourceCustomIcon';
import { SourceBottomSheet } from '../src/universal/SourceBottomSheet';
import { Choice } from '../src/experiences/pi/cz/evo-2027/investments/Primitives';
import { ProductLogo } from '../src/experiences/pi/cz/evo-2027/investments/ProductRow';
import { InvestmentGlyph } from '../src/experiences/pi/cz/evo-2027/investments/Glyph';
import { createCzInvestmentSnapshot } from '../src/experiences/pi/cz/evo-2027/investments/model';
import { DEFAULT_CZECH_COUNTS } from '../src/experiences/pi/cz/evo-2027/contracts';
import { BaselineNavigationLink } from '../src/universal/BaselineNavigationLink';
import { ModalPortal } from '../src/universal/ModalPortal';
import { FaceIdOverlay } from '../src/experiences/pi/current/baseline/FaceIdOverlay';

function renderFlow(props: Partial<CzRoboFlowProps> = {}) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <CzRoboFlow onBack={jest.fn()} onExit={jest.fn()} {...props} />,
    );
  });
  return tree;
}

function press(tree: TestRenderer.ReactTestRenderer, label: string) {
  const control = tree.root.findAll(
    node =>
      (node.props.accessibilityLabel === label ||
        node.props.text?.toLowerCase() === label.toLowerCase()) &&
      typeof node.props.onPress === 'function',
  )[0];
  expect(control).toBeDefined();
  expect(control!.props.disabled).not.toBe(true);
  act(() => control!.props.onPress());
}

function pressMatching(tree: TestRenderer.ReactTestRenderer, pattern: RegExp) {
  const control = tree.root.findAll(
    node =>
      typeof node.props.accessibilityLabel === 'string' &&
      pattern.test(node.props.accessibilityLabel) &&
      typeof node.props.onPress === 'function',
  )[0];
  expect(control).toBeDefined();
  act(() => control!.props.onPress());
}

function input(
  tree: TestRenderer.ReactTestRenderer,
  label: string,
  value: string,
) {
  act(() =>
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === label)!
      .props.onChangeText(value),
  );
}

function toContact(tree: TestRenderer.ReactTestRenderer) {
  press(tree, 'Create Goal');
}

function toTarget(tree: TestRenderer.ReactTestRenderer) {
  toContact(tree);
  press(tree, 'I confirm these data');
  press(tree, 'Continue');
  pressMatching(tree, /^General build-up wealth\./);
  press(tree, 'Continue');
  input(tree, 'Enter your goal name', 'Future freedom');
  press(tree, 'Continue');
}

function toReview(tree: TestRenderer.ReactTestRenderer) {
  toTarget(tree);
  input(tree, 'Target amount', '100000');
  press(tree, '10 years');
  press(tree, 'Continue');
  press(tree, 'Continue');
}

function acceptContract(tree: TestRenderer.ReactTestRenderer) {
  press(tree, 'Accept investment account terms');
  act(() =>
    tree.root
      .findByProps({ testID: 'cz-investment-contract-scroll' })
      .props.onScroll({
        nativeEvent: {
          contentOffset: { y: 400 },
          layoutMeasurement: { height: 300 },
          contentSize: { height: 700 },
        },
      }),
  );
  press(tree, 'I have read it');
}

async function signWithFaceId(tree: TestRenderer.ReactTestRenderer) {
  await act(async () => Promise.resolve());
  await act(async () => {
    await tree.root
      .findAll(
        node =>
          node.props.accessibilityLabel === 'Sign' &&
          typeof node.props.onPress === 'function',
      )[0]!
      .props.onPress();
  });
  expect(
    tree.root.findByProps({ testID: 'source-face-id-animation' }),
  ).toBeDefined();
  expect(
    tree.root.findByType(ModalPortal).findByType(FaceIdOverlay).props.glyph,
  ).toBeDefined();
  expect(JSON.stringify(tree.toJSON())).not.toContain('Demo authorization');
  await act(async () => {
    jest.advanceTimersByTime(840);
    await Promise.resolve();
  });
}

describe('CZ Robo goal creation follows the Figma flow', () => {
  it('places the close control in the intro hero', () => {
    const tree = renderFlow();
    const close = tree.root.findByProps({ testID: 'cz-intro-close' });
    expect(close).toBeDefined();
    expect(StyleSheet.flatten(close.props.style)).toMatchObject({
      top: 24,
      right: 16,
      width: 32,
      height: 32,
    });
    expect(
      StyleSheet.flatten(close.props.style).backgroundColor,
    ).toBeUndefined();
    expect(close.findByType(InvestmentGlyph).props).toMatchObject({
      name: 'close-flow',
      color: '#262626',
      size: 24,
    });
    act(() => tree.unmount());
  });

  it('keeps the intro close control fixed while the hero content scrolls', () => {
    const tree = renderFlow();
    const intro = tree.root.findByProps({ testID: 'cz-intro' });
    const scroll = intro.findByType(ScrollView);

    expect(scroll.findAllByProps({ testID: 'cz-intro-close' })).toHaveLength(0);
    expect(intro.findByProps({ testID: 'cz-intro-close' })).toBeDefined();
    act(() => tree.unmount());
  });

  it('extends the intro image to the system bar and insets the primary action', () => {
    const tree = renderFlow({ screenTopInset: 54 });
    const intro = tree.root.findByProps({ testID: 'cz-intro' });
    const footer = tree.root.findByProps({ testID: 'cz-intro-footer' });

    expect(StyleSheet.flatten(intro.props.style).marginTop).toBe(-54);
    expect(StyleSheet.flatten(footer.props.style).paddingHorizontal).toBe(24);
    expect(
      StyleSheet.flatten(
        tree.root.findByProps({ testID: 'cz-intro-close' }).props.style,
      ).top,
    ).toBe(38);
    act(() => tree.unmount());
  });

  it('matches the Figma surface color across the safe area and contact page', () => {
    const tree = renderFlow({ screenTopInset: 54 });
    const surface = () => tree.root.findByProps({ testID: 'cz-robo-surface' });

    expect(StyleSheet.flatten(surface().props.style)).toMatchObject({
      marginTop: -54,
      paddingTop: 54,
      backgroundColor: '#FFFFFF',
    });
    toContact(tree);
    expect(StyleSheet.flatten(surface().props.style).backgroundColor).toBe(
      '#F5F5F5',
    );
    expect(
      StyleSheet.flatten(
        tree.root.findByProps({ testID: 'cz-personal-data-confirmation' }).props
          .style,
      ).backgroundColor,
    ).toBe('#F5F5F5');
    press(tree, 'I confirm these data');
    expect(StyleSheet.flatten(surface().props.style).backgroundColor).toBe(
      '#FFFFFF',
    );
    act(() => tree.unmount());
  });

  it('matches the Figma contact layout, information icons, and help action', () => {
    const tree = renderFlow();
    toContact(tree);

    const phoneRow = tree.root.findByProps({ testID: 'cz-contact-phone' });
    const emailRow = tree.root.findByProps({ testID: 'cz-contact-email' });
    expect(StyleSheet.flatten(phoneRow.props.style)).toMatchObject({
      minHeight: 48,
    });
    expect(
      StyleSheet.flatten(phoneRow.props.style).borderBottomWidth,
    ).toBeUndefined();
    expect(StyleSheet.flatten(emailRow.props.style)).toMatchObject({
      minHeight: 88,
      paddingTop: 40,
    });
    expect(
      tree.root
        .findAllByType(SourceCustomIcon)
        .map(icon => icon.props.name)
        .filter(name => name === 'info-circle'),
    ).toEqual(['info-circle', 'info-circle']);
    expect(
      tree.root
        .findAllByType(SourceCustomIcon)
        .some(icon => icon.props.name === 'help-circle'),
    ).toBe(true);
    expect(tree.root.findByProps({ accessibilityLabel: 'Help' })).toBeDefined();
    expect(
      tree.root.findAllByProps({ accessibilityLabel: 'Close' }),
    ).toHaveLength(0);

    const label = tree.root.findAll(node =>
      node.children.includes('PHONE NUMBER'),
    )[0]!;
    expect(StyleSheet.flatten(label.props.style)).toMatchObject({
      fontSize: 14,
      lineHeight: 20,
    });
    const phone = tree.root.findAll(node =>
      node.children.includes('+420 777 123 456'),
    )[0]!;
    expect(StyleSheet.flatten(phone.props.style)).toMatchObject({
      fontSize: 18,
      lineHeight: 24,
    });
    act(() => tree.unmount());
  });

  it('sends Edit data to the host profile route', () => {
    const onProfile = jest.fn();
    const tree = renderFlow({ onProfile });
    toContact(tree);
    press(tree, 'Edit data');
    expect(onProfile).toHaveBeenCalledTimes(1);
    act(() => tree.unmount());
  });

  it('resets the page scroll and collapsed title when advancing between steps', () => {
    const tree = renderFlow();
    toContact(tree);
    const scroll = tree.root
      .findAllByType(ScrollView)
      .find(node => typeof node.props.onScroll === 'function')!;
    act(() =>
      scroll.props.onScroll({
        nativeEvent: { contentOffset: { x: 0, y: 64 } },
      }),
    );
    expect(tree.root.findByType(Header).props.collapsedTitleProgress).toBe(1);

    press(tree, 'I confirm these data');

    expect(tree.root.findByType(Header).props.collapsedTitleProgress).toBe(0);
    expect(tree.root.findByType(Header).props.title).toBe('');
    act(() => tree.unmount());
  });

  it('keeps Edit data usable in the standalone Native preview', () => {
    const tree = renderFlow();
    toContact(tree);
    press(tree, 'Edit data');
    expect(
      tree.root
        .findAllByType(TextInput)
        .some(node => node.props.accessibilityLabel === 'Phone number'),
    ).toBe(true);
    input(tree, 'Phone number', '+420 777 000 111');
    input(tree, 'Email address', 'new.address@example.com');
    press(tree, 'Save data');
    expect(
      tree.root.findAll(node =>
        String(node.props.children).includes('new.address@example.com'),
      ).length,
    ).toBeGreaterThan(0);
    act(() => tree.unmount());
  });

  it('shows the Moderate - V2 profile and wires Update now to Profile', () => {
    const onProfile = jest.fn();
    const tree = renderFlow({ onProfile });
    toContact(tree);
    press(tree, 'I confirm these data');
    expect(tree.root.findByProps({ testID: 'cz-profile-card' })).toBeDefined();
    press(tree, 'Update now');
    expect(onProfile).toHaveBeenCalledTimes(1);
    act(() => tree.unmount());
  });

  it('matches Figma risk-profile copy and the outlined update card', () => {
    const tree = renderFlow();
    toContact(tree);
    press(tree, 'I confirm these data');

    const text = (value: string) =>
      tree.root.findAll(node => node.children.includes(value)).length;
    expect(
      text('Here you can see your current investor profile and its status.'),
    ).toBeGreaterThan(0);
    expect(
      text(
        'As a moderate risk investor you are willing to accept periods of market volatility in exchange for the possibility of receiving returns that will outpace inflation by a significant margin in the long run.',
      ),
    ).toBeGreaterThan(0);

    const profileCard = tree.root.findByProps({ testID: 'cz-profile-card' });
    expect(StyleSheet.flatten(profileCard.props.style)).toMatchObject({
      backgroundColor: '#F5F5F5',
      borderRadius: 4,
      paddingLeft: 24,
      paddingRight: 12,
    });
    const updateCard = tree.root.findByProps({ testID: 'cz-profile-update' });
    expect(StyleSheet.flatten(updateCard.props.style)).toMatchObject({
      backgroundColor: '#FFFFFF',
      borderColor: '#262626',
      borderRadius: 4,
    });
    const updateAction = tree.root.findByProps({
      testID: 'cz-profile-update-action',
    });
    const link = updateAction.findByType(BaselineNavigationLink);
    expect(link.props.text).toBe('UPDATE NOW');
    expect(link.props.presentation).toBe('primary');
    act(() => tree.unmount());
  });

  it.each(['expired', 'missing'] as const)(
    'keeps Continue visible but disabled for a %s profile',
    status => {
      const tree = renderFlow({ profileStatus: status });
      toContact(tree);
      press(tree, 'I confirm these data');
      const continueButton = tree.root.findAll(
        node =>
          node.props.accessibilityLabel === 'Continue' &&
          typeof node.props.onPress === 'function',
      )[0];
      expect(continueButton).toBeDefined();
      expect(continueButton!.props.disabled).toBe(true);
      const updateButton = tree.root.findAll(
        node =>
          node.props.text === 'UPDATE NOW' &&
          typeof node.props.onPress === 'function',
      )[0];
      expect(updateButton).toBeDefined();
      expect(updateButton!.props.disabled).not.toBe(true);
      expect(
        tree.root.findByProps({ testID: `cz-profile-${status}` }),
      ).toBeDefined();
      press(tree, 'Update now');
      expect(
        tree.root.findAll(node =>
          String(node.props.children).includes(
            'Update your MiFID answers in Profile, then return here to continue.',
          ),
        ).length,
      ).toBeGreaterThan(0);
      press(tree, 'I understand');
      act(() => tree.unmount());
    },
  );

  it('offers the five goal purposes from Figma, including inflation protection', () => {
    const tree = renderFlow();
    toContact(tree);
    press(tree, 'I confirm these data');
    press(tree, 'Continue');
    const purposes = [
      ...new Set(
        tree.root
          .findAll(
            node =>
              node.props.accessibilityRole === 'radio' &&
              typeof node.props.accessibilityLabel === 'string',
          )
          .map(node => node.props.accessibilityLabel),
      ),
    ];
    expect(purposes).toHaveLength(5);
    expect(purposes).toEqual([
      'General build-up wealth. Grow your wealth to support long-term goals.',
      'Protection for inflation. Save for a future purchase, like a home or car.',
      'Saving for a major purchase. Build a reserve for unexpected expenses.',
      'Saving for unforeseen circumstances. Save for a future purchase, like a home or car.',
      'Retirement. Build long-term savings for retirement.',
    ]);
    act(() => tree.unmount());
  });

  it('wraps goal name suggestions as in Figma', () => {
    const tree = renderFlow();
    toContact(tree);
    press(tree, 'I confirm these data');
    press(tree, 'Continue');
    pressMatching(tree, /^General build-up wealth\./);
    press(tree, 'Continue');

    const suggestions = tree.root.findByProps({
      testID: 'cz-goal-name-suggestions',
    });
    const suggestionLayout = suggestions.findByType(View);
    expect(StyleSheet.flatten(suggestionLayout.props.style)).toMatchObject({
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    });
    expect([
      ...new Set(
        suggestions
          .findAll(node => node.props.accessibilityRole === 'button')
          .map(node => node.props.accessibilityLabel),
      ),
    ]).toEqual(['Bright future', 'Make money work', 'My next opportunity']);
    act(() => tree.unmount());
  });

  it('selects a goal with a thicker border and teal title without tinting its description', () => {
    const tree = renderFlow();
    toContact(tree);
    press(tree, 'I confirm these data');
    press(tree, 'Continue');
    pressMatching(tree, /^Protection for inflation\./);
    const choice = tree.root
      .findAllByType(Choice)
      .find(node => node.props.title === 'Protection for inflation')!;
    const control = choice.findAll(
      node => node.props.accessibilityRole === 'radio',
    )[0]!;
    expect(StyleSheet.flatten(control.props.style)).toMatchObject({
      borderWidth: 2,
      borderColor: '#007A91',
    });
    const title = choice.findAll(node =>
      node.children.includes('Protection for inflation'),
    )[0]!;
    expect(StyleSheet.flatten(title.props.style).color).toBe('#007A91');
    expect(
      StyleSheet.flatten(control.props.style).backgroundColor,
    ).toBeUndefined();
    act(() => tree.unmount());
  });

  it('uses Figma target presets and reveals the custom horizon only after selection', () => {
    const tree = renderFlow();
    toTarget(tree);
    expect(
      tree.root.findAll(node =>
        node.children.includes('Set your target amount'),
      ),
    ).toHaveLength(1);
    expect(
      tree.root
        .findAllByType(Choice)
        .filter(node => node.props.variant === 'radio')
        .map(node => node.props.title),
    ).toEqual([
      '3 YEARS',
      '5 YEARS',
      '7 YEARS',
      '10 YEARS',
      'OTHER TIME HORIZON',
    ]);
    const amountField = tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Target amount')!;
    expect(amountField.props.value).toBe('0');
    expect(
      tree.root.findAll(node => node.children.includes('CZK')).length,
    ).toBeGreaterThan(0);
    input(tree, 'Target amount', '25000');
    const targetPresets = tree.root
      .findAll(
        node =>
          typeof node.props.accessibilityLabel === 'string' &&
          /^(25\.000|50\.000|100\.000) CZK$/.test(
            node.props.accessibilityLabel,
          ),
      )
      .map(node => node.props.accessibilityLabel);
    expect(new Set(targetPresets).size).toBe(3);
    expect(
      tree.root
        .findAllByType(TextInput)
        .find(node => node.props.accessibilityLabel === 'Target amount')!.props
        .value,
    ).toBe('25000');
    expect(
      tree.root
        .findAllByType(TextInput)
        .some(
          node =>
            node.props.accessibilityLabel === 'Other time horizon (3–15 years)',
        ),
    ).toBe(false);
    press(tree, 'Other time horizon');
    expect(
      tree.root
        .findAllByType(TextInput)
        .some(
          node =>
            node.props.accessibilityLabel === 'Other time horizon (3–15 years)',
        ),
    ).toBe(true);
    input(tree, 'Other time horizon (3–15 years)', '12');
    expect(
      tree.root.findAll(
        node =>
          node.props.accessibilityLabel === 'Continue' &&
          typeof node.props.onPress === 'function',
      )[0]!.props.disabled,
    ).toBe(false);
    act(() => tree.unmount());
  });

  it('matches the Figma available-portfolios card and product distribution', () => {
    const tree = renderFlow();
    toTarget(tree);
    input(tree, 'Target amount', '100000');
    press(tree, '10 years');
    press(tree, 'Continue');

    expect(
      tree.root.findAll(node =>
        node.children.includes(
          'Based on your Moderate - V2 investor profile, these baskets are a suitable match. Choose one to review their contents.',
        ),
      ),
    ).toHaveLength(1);
    const portfolioName = tree.root.findAll(node =>
      node.children.includes('onemarkets J.P. Morgan\nGlobal growth Basket'),
    )[0]!;
    expect(StyleSheet.flatten(portfolioName.props.style).color).toBe('#007A91');
    expect(StyleSheet.flatten(portfolioName.props.style).fontFamily).toBe(
      'UniCredit-bold',
    );
    expect(
      tree.root
        .findAllByType(BaselineNavigationLink)
        .filter(node => node.props.text === 'DETAILS'),
    ).toHaveLength(5);
    expect(tree.root.findAllByType(ProductLogo)).toHaveLength(10);
    expect(
      new Set(
        tree.root
          .findAll(node =>
            String(node.props.testID ?? '').startsWith('cz-portfolio-holding-'),
          )
          .map(node => node.props.testID),
      ),
    ).toHaveProperty('size', 5);
    expect(
      tree.root.findAll(node =>
        node.children.includes('PRODUCTS DISTRIBUTION'),
      ),
    ).toHaveLength(1);
    act(() => tree.unmount());
  });

  it('opens basket details as a page and selects the basket back into the carousel', () => {
    const tree = renderFlow();
    toTarget(tree);
    input(tree, 'Target amount', '100000');
    press(tree, '10 years');
    press(tree, 'Continue');
    const portfolioDots = tree.root.findAll(
      node =>
        typeof node.props.accessibilityLabel === 'string' &&
        /^Portfolio \d+ of \d+$/.test(node.props.accessibilityLabel) &&
        typeof node.props.onPress === 'function',
    );
    expect(portfolioDots.length).toBeGreaterThan(1);
    act(() => portfolioDots[1]!.props.onPress());
    expect(
      tree.root.findAll(
        node =>
          node.props.accessibilityLabel ===
            portfolioDots[1]!.props.accessibilityLabel &&
          node.props.accessibilityState?.selected === true &&
          typeof node.props.onPress === 'function',
      ),
    ).toHaveLength(1);
    const detailsButtons = () =>
      tree.root
        .findAllByType(BaselineNavigationLink)
        .filter(node => node.props.text === 'DETAILS');
    act(() => detailsButtons()[1]!.props.onPress());
    expect(
      tree.root.findByProps({ testID: 'cz-basket-details' }),
    ).toBeDefined();
    press(tree, 'Back');
    expect(tree.root.findByProps({ testID: 'cz-portfolio' })).toBeDefined();
    expect(
      tree.root.findByProps({ testID: 'cz-portfolio-carousel' }).props
        .contentOffset,
    ).toEqual({ x: 315, y: 0 });
    act(() => detailsButtons()[1]!.props.onPress());
    expect(
      tree.root.findByProps({ testID: 'cz-basket-details' }),
    ).toBeDefined();
    press(tree, 'Select');
    expect(tree.root.findByProps({ testID: 'cz-portfolio' })).toBeDefined();
    expect(
      tree.root.findByProps({ testID: 'cz-portfolio-carousel' }).props
        .contentOffset,
    ).toEqual({ x: 315, y: 0 });
    expect(
      tree.root.findAll(
        node =>
          node.props.accessibilityRole === 'radio' &&
          node.props.accessibilityState?.checked === true,
      ).length,
    ).toBeGreaterThan(0);
    act(() => tree.unmount());
  });

  it('uses the Figma basket detail layout, five product rows, and market section', () => {
    const tree = renderFlow();
    toTarget(tree);
    input(tree, 'Target amount', '100000');
    press(tree, '10 years');
    press(tree, 'Continue');
    const details = tree.root
      .findAllByType(BaselineNavigationLink)
      .find(node => node.props.text === 'DETAILS')!;
    act(() => details.props.onPress());

    const basketRows = new Set(
      tree.root
        .findAll(
          node =>
            typeof node.props.testID === 'string' &&
            /^cz-basket-holding-\d+$/.test(node.props.testID),
        )
        .map(node => node.props.testID),
    );
    expect(
      tree.root.findByProps({ testID: 'cz-basket-title-logo' }),
    ).toBeDefined();
    expect(
      tree.root.findByProps({ testID: 'cz-basket-description' }),
    ).toBeDefined();
    expect(
      tree.root.findByProps({ testID: 'cz-basket-products-section' }),
    ).toBeDefined();
    expect(basketRows.size).toBe(5);
    expect(
      tree.root.findByProps({ testID: 'cz-basket-market-info' }),
    ).toBeDefined();
    expect(
      tree.root.findAll(node =>
        node.children.includes('PRODUCTS DISTRIBUTION'),
      ),
    ).toHaveLength(1);
    act(() => tree.unmount());
  });

  it('opens product details in the anchored Figma bottom sheet', () => {
    const securityCatalog =
      createCzInvestmentSnapshot(DEFAULT_CZECH_COUNTS).catalog;
    const tree = renderFlow({ securityCatalog, screenTopInset: 54 });
    toTarget(tree);
    input(tree, 'Target amount', '100000');
    press(tree, '10 years');
    press(tree, 'Continue');
    expect(tree.root.findAllByType(SourceBottomSheet)).toHaveLength(0);
    press(tree, 'Open Nano-Chip Equity Fund product details');

    const sheet = tree.root.findByType(SourceBottomSheet);
    expect(sheet.props.maxHeightOffsetPx).toBeGreaterThanOrEqual(70);
    expect(
      sheet
        .findAllByType(ScrollView)
        .some(node => node.props.showsVerticalScrollIndicator === false),
    ).toBe(true);
    expect(
      tree.root.findAll(
        node =>
          node.props.accessibilityLabel === '3 Y' &&
          node.props.accessibilityState?.selected === true,
      ).length,
    ).toBeGreaterThan(0);
    expect(
      tree.root.findAll(node => node.children.includes('Performance:')),
    ).toHaveLength(1);
    expect(
      tree.root.findAll(node => node.children.includes('+2,27%')),
    ).toHaveLength(1);
    expect(
      tree.root.findAll(node => node.children.includes('Purchase options')),
    ).toHaveLength(0);
    act(() => tree.unmount());
  });

  it('groups review details and gates signing with an accessible terms switch', () => {
    const tree = renderFlow();
    toReview(tree);
    expect(
      tree.root.findByProps({ testID: 'cz-review-goal-section' }),
    ).toBeDefined();
    expect(
      tree.root.findByProps({ testID: 'cz-review-plan-section' }),
    ).toBeDefined();
    const termsSwitch = tree.root.findAll(
      node =>
        node.props.accessibilityRole === 'switch' &&
        node.props.accessibilityLabel === 'Accept investment account terms',
    )[0];
    expect(termsSwitch).toBeDefined();
    expect(
      tree.root.findAll(
        node => node.props.accessibilityLabel === 'Continue to sign',
      )[0]!.props.disabled,
    ).toBe(true);
    act(() => termsSwitch!.props.onPress());
    expect(
      tree.root.findByProps({ testID: 'cz-investment-contract-scroll' }),
    ).toBeDefined();
    expect(
      tree.root.findAll(
        node => node.props.accessibilityLabel === 'Continue to sign',
      )[0]!.props.disabled,
    ).toBe(true);
    expect(
      tree.root.findAll(
        node => node.props.accessibilityLabel === 'I have read it',
      ),
    ).toHaveLength(0);
    act(() =>
      tree.root
        .findByProps({ testID: 'cz-investment-contract-scroll' })
        .props.onScroll({
          nativeEvent: {
            contentOffset: { y: 400 },
            layoutMeasurement: { height: 300 },
            contentSize: { height: 700 },
          },
        }),
    );
    press(tree, 'I have read it');
    expect(
      tree.root.findAll(
        node => node.props.accessibilityLabel === 'Continue to sign',
      )[0]!.props.disabled,
    ).toBe(false);
    act(() => tree.unmount());
  });

  it('stacks review labels over Figma values and keeps terms in one row', () => {
    const tree = renderFlow();
    toReview(tree);

    const goalType = tree.root.findByProps({
      testID: 'cz-review-field-goal-type',
    });
    expect(StyleSheet.flatten(goalType.props.style)).toMatchObject({
      paddingVertical: 16,
      gap: 4,
    });
    expect(
      tree.root.findAll(node => node.children.includes('100.000 CZK')),
    ).toHaveLength(1);
    expect(
      tree.root.findAll(node => node.children.includes('100.000,00 CZK')),
    ).toHaveLength(0);
    expect(
      tree.root.findByProps({ testID: 'cz-review-terms-row' }),
    ).toBeDefined();
    expect(
      tree.root.findAll(node =>
        node.children.includes(
          'I have read and accept the investment account contract',
        ),
      ),
    ).toHaveLength(0);
    act(() => tree.unmount());
  });

  it('closing the unread contract preserves the disabled terms switch', () => {
    const tree = renderFlow();
    toReview(tree);
    press(tree, 'Accept investment account terms');
    press(tree, 'Close investment account contract');
    expect(
      tree.root.findAll(
        node =>
          node.props.accessibilityLabel === 'Accept investment account terms',
      )[0]!.props.accessibilityState.checked,
    ).toBe(false);
    expect(
      tree.root.findAll(
        node => node.props.accessibilityLabel === 'Continue to sign',
      )[0]!.props.disabled,
    ).toBe(true);
    act(() => tree.unmount());
  });

  it('uses the Figma goal signing labels, helper copy, and field spacing', async () => {
    const tree = renderFlow();
    toReview(tree);
    acceptContract(tree);
    press(tree, 'Continue to sign');
    await act(async () => Promise.resolve());
    expect(
      tree.root
        .findAllByType(TextInput)
        .some(node => node.props.accessibilityLabel === 'Enter pin code'),
    ).toBe(true);
    expect(tree.root.findByProps({ accessibilityLabel: 'Sign' })).toBeDefined();
    expect(
      StyleSheet.flatten(
        tree.root.findByProps({ testID: 'authorization-pin-field' }).props
          .style,
      ).paddingTop,
    ).toBe(132);
    const pinInput = tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Enter pin code')!;
    expect(StyleSheet.flatten(pinInput.props.style)).toMatchObject({
      height: 24,
      minHeight: 24,
      paddingVertical: 0,
      fontSize: 20,
      borderColor: '#007a91',
    });
    const pinLabel = tree.root.findAll(node =>
      node.children.includes('Enter pin code'),
    )[0]!;
    expect(StyleSheet.flatten(pinLabel.props.style)).toMatchObject({
      color: '#007a91',
      fontSize: 14,
      lineHeight: 16,
    });
    expect(
      tree.root.findAll(node =>
        node.children.includes('Be sure that nobody is watching you'),
      ),
    ).toHaveLength(1);
    act(() => tree.unmount());
  });

  it('shows a recoverable failure screen and retains the review draft', async () => {
    jest.useFakeTimers();
    const onCreateGoal = jest.fn().mockRejectedValue(new Error('Save failed'));
    const tree = renderFlow({ onCreateGoal });
    toReview(tree);
    acceptContract(tree);
    press(tree, 'Continue to sign');
    await signWithFaceId(tree);
    await act(async () => {
      jest.advanceTimersByTime(900);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(
      tree.root.findByProps({ testID: 'cz-creation-failed' }),
    ).toBeDefined();
    press(tree, 'Review and try again');
    expect(tree.root.findByProps({ testID: 'cz-review' })).toBeDefined();
    expect(
      tree.root.findAll(node =>
        String(node.props.children).includes('Future freedom'),
      ).length,
    ).toBeGreaterThan(0);
    expect(
      tree.root.findAll(node => String(node.props.children).includes('100.000'))
        .length,
    ).toBeGreaterThan(0);
    expect(onCreateGoal).toHaveBeenCalledTimes(1);
    act(() => tree.unmount());
    jest.useRealTimers();
  });

  it('cancelling the demo Face ID animation returns to review without creating a goal', async () => {
    jest.useFakeTimers();
    const onCreateGoal = jest.fn();
    const tree = renderFlow({ onCreateGoal });
    try {
      toReview(tree);
      acceptContract(tree);
      press(tree, 'Continue to sign');
      await act(async () => Promise.resolve());
      await act(async () => {
        await tree.root
          .findAll(
            node =>
              node.props.accessibilityLabel === 'Sign' &&
              typeof node.props.onPress === 'function',
          )[0]!
          .props.onPress();
      });
      expect(
        tree.root.findByProps({ testID: 'source-face-id-animation' }),
      ).toBeDefined();
      press(tree, 'Back');
      await act(async () => {
        jest.advanceTimersByTime(2000);
        await Promise.resolve();
      });
      expect(tree.root.findByProps({ testID: 'cz-review' })).toBeDefined();
      expect(onCreateGoal).not.toHaveBeenCalled();
    } finally {
      act(() => tree.unmount());
      jest.useRealTimers();
    }
  });

  it('shows the Figma confirmation screen without a back affordance', async () => {
    jest.useFakeTimers();
    const tree = renderFlow({ onCreateGoal: jest.fn() });
    toReview(tree);
    acceptContract(tree);
    press(tree, 'Continue to sign');
    await act(async () => Promise.resolve());
    await signWithFaceId(tree);
    await act(async () => {
      jest.advanceTimersByTime(900);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(tree.root.findByProps({ testID: 'cz-success' })).toBeDefined();
    expect(
      tree.root.findAll(node => node.props.accessibilityLabel === 'Back'),
    ).toHaveLength(0);
    act(() => tree.unmount());
    jest.useRealTimers();
  });
});
