import React from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { BaselineTag } from '../src/universal/BaselineTag';
import { Select } from '../src/universal/Select';
import { mobileFirstTokens } from '../src/universal/tokens';
import { BaselineDropdownField } from '../src/universal/BaselineDropdownField';
import { BaselineCheckbox } from '../src/universal/BaselineCheckbox';
import { TextInput } from '../src/universal/Typography';
import { BaselineTextField } from '../src/universal/BaselineTextField';
import { sourceColor } from '../src/universal/sourceColor';
import { CatalogDesignSystemPreview } from '../src/app/designSystemPreviews/catalog';
import { BaselineAmountField } from '../src/universal/BaselineAmountField';
import { BaselineNavigationLink } from '../src/universal/BaselineNavigationLink';
import {
  BaselinePrimeAdvisory,
  BaselineCardType14,
} from '../src/universal/BaselineCatalogCompositions';

describe('approved design-system implementation gaps', () => {
  it('passes authored gradient offsets to the native SVG parser without invalid number warnings', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    let tree: TestRenderer.ReactTestRenderer | undefined;
    try {
      act(() => {
        tree = TestRenderer.create(
          <>
            <BaselinePrimeAdvisory />
            <BaselineCardType14 />
          </>,
        );
      });
      expect(warn).not.toHaveBeenCalled();
    } finally {
      act(() => tree?.unmount());
      warn.mockRestore();
    }
  });
  it.each([undefined, ['one']] as const)(
    'retains derived errors while an option dialog is expanded (multiple=%s)',
    multipleValues => {
      let tree!: TestRenderer.ReactTestRenderer;
      act(() => {
        tree = TestRenderer.create(
          <BaselineDropdownField
            label="Account"
            value="one"
            options={[{ value: 'one', label: 'Main account' }]}
            onChange={jest.fn()}
            multipleValues={multipleValues}
            onMultipleChange={multipleValues ? jest.fn() : undefined}
            errorText="Review your selection"
          />,
        );
      });
      const trigger = () =>
        tree.root.findAll(
          node =>
            node.props.accessibilityLabel === 'Account: Main account' &&
            typeof node.props.onPress === 'function',
        )[0]!;
      expect(trigger().props['aria-invalid']).toBe(true);
      act(() => trigger().props.onPress());
      expect(trigger().props['aria-invalid']).toBe(true);
      act(() => tree.unmount());
    },
  );
  it.each(['disabled-filled', 'error-filled'] as const)(
    'preserves %s semantics when multiple values are selected',
    visualState => {
      let tree!: TestRenderer.ReactTestRenderer;
      act(() => {
        tree = TestRenderer.create(
          <BaselineDropdownField
            label="Account"
            value=""
            options={[{ value: 'one', label: 'Main account' }]}
            onChange={jest.fn()}
            multipleValues={['one']}
            onMultipleChange={jest.fn()}
            visualState={visualState}
            errorText={
              visualState === 'error-filled'
                ? 'Review your selection'
                : undefined
            }
          />,
        );
      });
      const trigger = tree.root.findAll(
        node =>
          node.props.accessibilityLabel === 'Account: Main account' &&
          typeof node.props.onPress === 'function',
      )[0]!;
      if (visualState === 'disabled-filled')
        expect(trigger.props.accessibilityState.disabled).toBe(true);
      else expect(trigger.props['aria-invalid']).toBe(true);
      act(() => tree.unmount());
    },
  );
  it('toggles multiple-selection checkboxes with Web Space exactly once and ignores key repeat', () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    const changed = jest.fn();
    let tree: TestRenderer.ReactTestRenderer | undefined;
    try {
      act(() => {
        tree = TestRenderer.create(
          <Select
            tokens={mobileFirstTokens}
            label="Accounts"
            value="one"
            items={[{ value: 'one', label: 'Main account' }]}
            onChange={jest.fn()}
            multiple={{ values: ['one'], onChange: changed }}
          />,
        );
      });
      const trigger = tree!.root.findAll(
        node =>
          node.props.accessibilityLabel === 'Accounts' &&
          typeof node.props.onPress === 'function',
      )[0]!;
      act(() => trigger.props.onPress());
      const option = tree!.root.findAll(
        node =>
          node.props.accessibilityRole === 'checkbox' &&
          typeof node.props.onPress === 'function',
      )[0]!;
      const preventDefault = jest.fn();
      act(() =>
        option.props.onKeyDown({ key: ' ', repeat: false, preventDefault }),
      );
      expect(changed).toHaveBeenCalledTimes(1);
      expect(changed).toHaveBeenCalledWith([]);
      expect(preventDefault).toHaveBeenCalledTimes(1);
      act(() =>
        option.props.onKeyDown({ key: ' ', repeat: true, preventDefault }),
      );
      expect(changed).toHaveBeenCalledTimes(1);
    } finally {
      act(() => tree?.unmount());
      Object.defineProperty(Platform, 'OS', {
        configurable: true,
        value: originalOS,
      });
    }
  });
  it('keeps multiple selection operable in the shared Select controller', () => {
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <CatalogDesignSystemPreview
          componentId="ui.dropdown-field"
          variantId="multiple-filled"
          dark={false}
        />,
      );
    });
    expect(tree.root.findAllByType(TextInput)).toHaveLength(0);
    const trigger = tree.root.findAll(
      node =>
        node.props.accessibilityLabel ===
          'Account: Main account; Savings account' &&
        typeof node.props.onPress === 'function',
    )[0]!;
    act(() => trigger.props.onPress());
    const selected = () =>
      tree.root.findAll(
        node =>
          node.props.accessibilityRole === 'checkbox' &&
          node.props.accessibilityLabel === 'Savings account' &&
          typeof node.props.onPress === 'function',
      )[0]!;
    expect(selected().props.accessibilityState.checked).toBe(true);
    act(() => selected().props.onPress());
    expect(selected().props.accessibilityState.checked).toBe(false);
    expect(tree.root.findByType(Select).props.multiple.values).toEqual([
      'main',
    ]);
    act(() => tree.unmount());
  });
  it('uses the existing Amount field with a genuine currency selection and independent CTA', () => {
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <CatalogDesignSystemPreview
          componentId="ui.dropdown-field"
          variantId="amount-filled-with-cta"
          dark={false}
        />,
      );
    });
    expect(tree.root.findByType(BaselineAmountField).props).toMatchObject({
      value: '500.00',
      currency: 'EUR',
      currencyIconSize: 32,
    });
    const currency = tree.root.findAll(
      node =>
        node.props.accessibilityLabel === 'Currency: EUR' &&
        typeof node.props.onPress === 'function',
    )[0]!;
    act(() => currency.props.onPress());
    const czk = tree.root.findAll(
      node =>
        node.props.accessibilityLabel === 'CZK' &&
        typeof node.props.onPress === 'function',
    )[0]!;
    act(() => czk.props.onPress());
    expect(tree.root.findByType(BaselineAmountField).props.currency).toBe(
      'CZK',
    );
    expect(tree.root.findByType(BaselineAmountField).props.value).toBe(
      '500.00',
    );
    const cta = tree.root
      .findByType(BaselineNavigationLink)
      .findAll(
        node =>
          node.props.accessibilityRole === 'button' &&
          typeof node.props.onPress === 'function',
      )[0]!;
    act(() => cta.props.onPress());
    expect(tree.root.findByType(BaselineAmountField).props.value).toBe(
      '1250.00',
    );
    act(() => tree.unmount());
  });
  it('keeps keyboard focus visible on the selection trigger and associates field errors with their description', () => {
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <BaselineTextField
          label="Account"
          value=""
          onChange={() => {}}
          helperText="Choose your account"
          selectionControl={{ expanded: false, onPress: jest.fn() }}
        />,
      );
    });
    const trigger = () =>
      tree.root.findAll(
        node =>
          node.props.accessibilityRole === 'button' &&
          typeof node.props.onFocus === 'function',
      )[0]!;
    const descriptionId = trigger().props['aria-describedby'];
    expect(descriptionId).toEqual(expect.any(String));
    expect(
      tree.root.findAll(node => node.props.nativeID === descriptionId).length,
    ).toBeGreaterThan(0);
    act(() => trigger().props.onFocus());
    expect(
      tree.root.findAll(
        node =>
          StyleSheet.flatten(node.props.style)?.borderBottomColor ===
          sourceColor('var(--uc-action)'),
      ).length,
    ).toBeGreaterThan(0);
    act(() => {
      trigger().props.onBlur();
      tree.update(
        <BaselineTextField
          label="Account"
          value=""
          onChange={() => {}}
          errorText="Choose an available account"
        />,
      );
    });
    const input = tree.root.findByType(TextInput);
    expect(input.props['aria-invalid']).toBe(true);
    expect(
      tree.root.findAll(
        node => node.props.nativeID === input.props['aria-describedby'],
      ).length,
    ).toBeGreaterThan(0);
    expect(
      tree.root.findAll(node => node.props.accessibilityLiveRegion === 'polite')
        .length,
    ).toBeGreaterThan(0);
    act(() => tree.unmount());
  });
  it('opens and selects through the actual Dropdown without exposing an editable TextInput', () => {
    const changed = jest.fn();
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <BaselineDropdownField
          label="Account"
          value=""
          options={[
            { value: 'one', label: 'Main account' },
            { value: 'two', label: 'Savings account' },
          ]}
          onChange={changed}
        />,
      );
    });
    expect(tree.root.findAllByType(TextInput)).toHaveLength(0);
    const trigger = tree.root.findAll(
      node =>
        node.props.accessibilityLabel === 'Account: Choose an option' &&
        typeof node.props.onPress === 'function',
    )[0]!;
    act(() => trigger.props.onPress());
    const option = tree.root.findAll(
      node =>
        node.props.accessibilityLabel === 'Savings account' &&
        typeof node.props.onPress === 'function',
    )[0]!;
    act(() => option.props.onPress());
    expect(changed).toHaveBeenCalledWith('two');
    act(() => tree.unmount());
  });

  it('keeps canonical checkbox selection in the existing checkbox controller', () => {
    const changed = jest.fn();
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <BaselineCheckbox
          presentation="canonical"
          ariaLabel="Include item"
          onCheckedChange={changed}
        />,
      );
    });
    const checkbox = tree.root.findAll(
      node =>
        node.props.accessibilityRole === 'checkbox' &&
        typeof node.props.onPress === 'function',
    )[0]!;
    expect(checkbox.props.accessibilityState.checked).toBe(false);
    act(() => checkbox.props.onPress());
    expect(changed).toHaveBeenCalledWith(true);
    expect(
      tree.root.findAll(
        node =>
          node.props.accessibilityRole === 'checkbox' &&
          typeof node.props.onPress === 'function',
      )[0]!.props.accessibilityState.checked,
    ).toBe(true);
    act(() => tree.unmount());
  });
  it('renders live approved status and counter text with source geometry', () => {
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(<BaselineTag kind="notification" label="3" />);
    });
    expect(JSON.stringify(tree.toJSON())).toContain('"3"');
    expect(JSON.stringify(tree.toJSON())).toContain('"lineHeight":16');
    act(() => {
      tree.update(<BaselineTag kind="successful" label="Paid" />);
    });
    expect(JSON.stringify(tree.toJSON())).toContain('Paid');
    expect(JSON.stringify(tree.toJSON())).toContain('#3d7d43');
  });

  it('reuses Select choice state through a source-field trigger instead of copying selection logic', () => {
    const changed = jest.fn();
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <Select
          tokens={mobileFirstTokens}
          label="Account"
          value="one"
          items={[
            { value: 'one', label: 'First account' },
            { value: 'two', label: 'Second account' },
          ]}
          onChange={changed}
          renderTrigger={({ open }) => (
            <Pressable
              accessibilityRole="combobox"
              accessibilityLabel="Account"
              onPress={open}
            />
          )}
        />,
      );
    });
    const trigger = tree.root.findAll(
      node =>
        node.props.accessibilityRole === 'combobox' &&
        typeof node.props.onPress === 'function',
    )[0]!;
    act(() => trigger.props.onPress());
    const option = tree.root.findAll(
      node =>
        node.props.accessibilityLabel === 'Second account' &&
        typeof node.props.onPress === 'function',
    )[0]!;
    act(() => option.props.onPress());
    expect(changed).toHaveBeenCalledWith('two');
  });
});
