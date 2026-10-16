import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Platform, StyleSheet } from 'react-native';
import { BaselineTextField } from '../src/universal/BaselineTextField';
import { BaselineSearchBar } from '../src/universal/BaselineSearchBar';
import { BaselineAmountField } from '../src/universal/BaselineAmountField';
import { BaselineAmountSuggestionChip } from '../src/universal/BaselineAmountSuggestionChip';

describe('isolated forms contract renderers', () => {
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
            n => StyleSheet.flatten(n.props.style)?.borderBottomWidth === 0.5,
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
