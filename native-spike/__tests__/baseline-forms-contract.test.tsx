import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Platform, StyleSheet } from 'react-native';
import { BaselineTextField } from '../src/universal/BaselineTextField';
import { BaselineSearchBar } from '../src/universal/BaselineSearchBar';
import { BaselineAmountField } from '../src/universal/BaselineAmountField';
import { BaselineAmountSuggestionChip } from '../src/universal/BaselineAmountSuggestionChip';
import { SourceCustomIcon } from '../src/universal/SourceCustomIcon';

describe('isolated forms contract renderers', () => {
  it('keeps the original chevron outside the line without stretching the input row', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineTextField
          label="Title"
          value="Textfield"
          onChange={jest.fn()}
          trailingIconName="chevron-down-wide"
        />,
      );
    });
    const icon = tree.root.findByType(SourceCustomIcon);
    expect(
      tree.root.find(
        n =>
          StyleSheet.flatten(n.props.style)?.position === 'absolute' &&
          StyleSheet.flatten(n.props.style)?.right === 0,
      ),
    ).toBeDefined();
    expect(icon.props.size).toBe(20);
    const boundary = tree.root.find(
      n => StyleSheet.flatten(n.props.style)?.borderBottomWidth === 0.5,
    );
    expect(StyleSheet.flatten(boundary.props.style)).toMatchObject({
      paddingBottom: 4,
    });
    act(() => tree.unmount());
  });
  it.each([
    ['Beneficiary', '', 'disabled-empty'],
    ['Beneficiary', 'Ana Popescu', 'disabled-filled'],
    ['Phone number', '', 'disabled-empty'],
    ['Phone number', '712345678', 'disabled-filled'],
  ] as const)(
    'matches approved Figma disabled %s %s',
    (label, value, visualState) => {
      const change = jest.fn(),
        activate = jest.fn(),
        choose = jest.fn();
      let tree!: Renderer.ReactTestRenderer;
      act(() => {
        tree = Renderer.create(
          <BaselineTextField
            label={label}
            value={value}
            visualState={visualState}
            onChange={change}
            onActivate={activate}
            helperText="Select an account first"
            trailingIconName="chevron-down-wide"
            trailingIconAction={{ ariaLabel: 'Choose value', onClick: choose }}
          />,
        );
      });
      const input = tree.root.find(
        n =>
          typeof n.props.onChangeText === 'function' && n.props.value === value,
      );
      expect(StyleSheet.flatten(input.props.style)).toMatchObject({
        color: '#666666',
        fontSize: 18,
        fontFamily: 'UniCredit-regular',
      });
      expect(input.props.placeholderTextColor).toBe('#666666');
      expect(input.props.accessibilityState).toEqual({ disabled: true });
      expect(tree.root.findByType(SourceCustomIcon).props.color).toBe(
        '#999999',
      );
      const boundary = tree.root.find(
        n => StyleSheet.flatten(n.props.style)?.borderBottomWidth === 0.5,
      );
      expect(StyleSheet.flatten(boundary.props.style).borderBottomColor).toBe(
        '#999999',
      );
      const accessory = tree.root.find(
        n =>
          n.props.accessibilityLabel === 'Choose value' &&
          typeof n.props.onPress === 'function',
      );
      expect(accessory.props.disabled).toBe(true);
      expect(accessory.props.accessibilityState).toEqual({ disabled: true });
      act(() => {
        input.props.onChangeText('changed');
        input.props.onSubmitEditing?.();
        input.props.onKeyPress?.({ nativeEvent: { key: ' ' } });
        accessory.props.onPress({ stopPropagation: jest.fn() });
        tree.root
          .find(
            n =>
              typeof n.props.onPress === 'function' &&
              StyleSheet.flatten(n.props.style)?.width === '100%',
          )
          .props.onPress();
      });
      expect(change).not.toHaveBeenCalled();
      expect(activate).not.toHaveBeenCalled();
      expect(choose).not.toHaveBeenCalled();
      act(() => tree.unmount());
    },
  );
  it.each(['disabled-empty', 'disabled-filled'] as const)(
    'matches approved Figma currency %s',
    visualState => {
      const choose = jest.fn();
      let tree!: Renderer.ReactTestRenderer;
      act(() => {
        tree = Renderer.create(
          <BaselineAmountField
            label="Amount"
            value={visualState === 'disabled-filled' ? '1250' : ''}
            visualState={visualState}
            onChange={jest.fn()}
            currency="RON"
            onCurrencyClick={choose}
          />,
        );
      });
      const currency = tree.root.find(
        n =>
          n.props.accessibilityLabel === 'Currency: RON' &&
          typeof n.props.disabled === 'boolean',
      );
      expect(currency.props.disabled).toBe(true);
      const value = currency.find(
        n => n.props.children === 'RON' && !!n.props.style,
      );
      expect(StyleSheet.flatten(value.props.style)).toMatchObject({
        color: '#666666',
        fontFamily: 'UniCredit-regular',
        fontSize: 18,
        marginTop: 0,
      });
      expect(tree.root.findByType(SourceCustomIcon).props.color).toBe(
        '#999999',
      );
      act(() => currency.props.onPress?.());
      expect(choose).not.toHaveBeenCalled();
      act(() => tree.unmount());
    },
  );
  it('keeps presentation focus proxies out of web Tab order and real accessory actions reachable', () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    const activate = jest.fn(),
      choose = jest.fn();
    let tree: Renderer.ReactTestRenderer | undefined;
    try {
      act(() => {
        tree = Renderer.create(
          <BaselineTextField
            label="Beneficiary"
            value="Jane"
            onChange={jest.fn()}
            onActivate={activate}
            trailingIconName="chevron-down-wide"
            trailingIconAction={{
              ariaLabel: 'Choose beneficiary',
              onClick: choose,
            }}
          />,
        );
      });
      const wrappers = [
        tree!.root.find(
          n =>
            typeof n.props.onPress === 'function' &&
            StyleSheet.flatten(n.props.style)?.width === '100%',
        ),
        tree!.root.find(
          n =>
            typeof n.props.onPress === 'function' &&
            StyleSheet.flatten(n.props.style)?.borderBottomWidth === 0.5,
        ),
      ];
      for (const wrapper of wrappers) {
        expect(wrapper.props.tabIndex).toBe(-1);
        expect(wrapper.props.role).toBe('presentation');
      }
      act(() => wrappers[0].props.onPress());
      expect(activate).toHaveBeenCalledTimes(1);
      const accessory = tree!.root.find(
        n =>
          typeof n.props.onPress === 'function' &&
          n.props.accessibilityLabel === 'Choose beneficiary',
      );
      expect(accessory.props.tabIndex).not.toBe(-1);
      act(() => accessory.props.onPress({ stopPropagation: jest.fn() }));
      expect(choose).toHaveBeenCalledTimes(1);
    } finally {
      if (tree) act(() => tree!.unmount());
      Object.defineProperty(Platform, 'OS', {
        configurable: true,
        value: originalOS,
      });
    }
  });
  it.each(['web', 'android'] as const)(
    'uses the Source divider for focus without a second browser outline on %s',
    platform => {
      const originalOS = Platform.OS;
      Object.defineProperty(Platform, 'OS', {
        configurable: true,
        value: platform,
      });
      let tree: Renderer.ReactTestRenderer | undefined;
      try {
        act(() => {
          tree = Renderer.create(
            <BaselineTextField
              label="Beneficiary"
              value="Jane"
              onChange={jest.fn()}
            />,
          );
        });
        const input = tree!.root.find(
          n =>
            typeof n.props.onChangeText === 'function' &&
            n.props.value === 'Jane',
        );
        act(() => input.props.onFocus());
        const style = StyleSheet.flatten(input.props.style);
        expect(style.outlineWidth).toBe(platform === 'web' ? 0 : undefined);
        expect(style.outlineStyle).toBe(
          platform === 'web' ? 'none' : undefined,
        );
        expect(input.props.editable).toBe(true);
        expect(
          tree!.root.findAll(
            n => StyleSheet.flatten(n.props.style)?.borderBottomWidth === 1,
          ).length,
        ).toBeGreaterThan(0);
      } finally {
        if (tree) act(() => tree!.unmount());
        Object.defineProperty(Platform, 'OS', {
          configurable: true,
          value: originalOS,
        });
      }
    },
  );
  it('retains explicit text-state precedence, controlled changes and invalid semantics', () => {
    const onChange = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineTextField
          label="Amount"
          value="20"
          disabled
          visualState="filled"
          ariaInvalid
          onChange={onChange}
        />,
      );
    });
    const input = tree.root.find(
      n => typeof n.props.onChangeText === 'function' && n.props.value === '20',
    );
    expect(input.props.editable).toBe(true);
    expect(input.props['aria-invalid']).toBe(true);
    act(() => input.props.onChangeText('30'));
    expect(onChange).toHaveBeenCalledWith('30');
    expect(input.props.value).toBe('20');
    act(() => tree.unmount());
  });
  it('keeps clear-query priority and owner-controlled reset without requiring filter action', () => {
    const onValueChange = jest.fn(),
      onFilterClick = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineSearchBar
          value="query"
          showTrailingAction={false}
          onValueChange={onValueChange}
          onFilterClick={onFilterClick}
        />,
      );
    });
    const clear = tree.root.find(
      n =>
        n.props.accessibilityLabel === 'Clear search results' &&
        typeof n.props.onPress === 'function',
    );
    expect(
      tree.root.find(
        n =>
          n.props.accessibilityLabel === 'Search' &&
          typeof n.props.onChangeText === 'function',
      ).props.role,
    ).toBe('searchbox');
    act(() => clear.props.onPress());
    expect(onValueChange).toHaveBeenCalledWith('');
    expect(onFilterClick).not.toHaveBeenCalled();
    act(() => tree.unmount());
  });
  it('retains independently disabled currency and explicit pressed chip state', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineAmountField
          label="Amount"
          value="20"
          onChange={() => {}}
          disabled
          visualState="filled"
          currency="RON"
        />,
      );
    });
    expect(
      tree.root.find(
        n =>
          n.props.accessibilityLabel === 'Currency: RON' &&
          typeof n.props.disabled === 'boolean',
      ).props.disabled,
    ).toBe(true);
    act(() =>
      tree.update(
        <BaselineAmountSuggestionChip
          label="100 RON"
          selected
          onSelect={() => {}}
        />,
      ),
    );
    expect(
      tree.root.find(
        n =>
          n.props.accessibilityRole === 'button' &&
          n.props['aria-pressed'] === true,
      ),
    ).toBeDefined();
    act(() => tree.unmount());
  });
});
