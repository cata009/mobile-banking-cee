import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import { TextInput } from '../src/universal/Typography';
import { BaselineMailboxTabs } from '../src/universal/BaselineMailboxTabs';
import { BaselineCarouselIndicator } from '../src/universal/BaselineCarouselIndicator';
import { BaselineCodeField } from '../src/universal/BaselineCodeField';
import { BaselineCheckbox } from '../src/universal/BaselineCheckbox';
describe('isolated selection controls', () => {
  it.each(['', '1234'])(
    'matches approved Figma disabled Code cells for %s',
    value => {
      let tree!: Renderer.ReactTestRenderer;
      act(() => {
        tree = Renderer.create(<BaselineCodeField value={value} disabled />);
      });
      const slots = tree.root.findAllByType(TextInput);
      expect(slots).toHaveLength(4);
      for (const slot of slots) {
        expect(StyleSheet.flatten(slot.props.style)).toMatchObject({
          color: '#666666',
          borderColor: '#999999',
          backgroundColor: '#FFFFFF',
          width: 44,
          height: 64,
          fontSize: 30,
          fontFamily: 'UniCredit-bold',
          opacity: 1,
        });
        expect(slot.props.accessibilityState).toEqual({ disabled: true });
      }
      act(() => tree.unmount());
    },
  );
  it('uses the original single Code border for keyboard focus', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(<BaselineCodeField value="1" />);
    });
    act(() => tree.root.findAllByType(TextInput)[0].props.onFocus?.({}));
    expect(
      StyleSheet.flatten(tree.root.findAllByType(TextInput)[0].props.style),
    ).toMatchObject({ borderColor: '#007A91', borderWidth: 1 });
    act(() => tree.unmount());
  });
  it('resolves overlapping dot presses from actual layout measurements with logical fallback', () => {
    const onSelect = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineCarouselIndicator
          count={3}
          activeIndex={0}
          onSelect={onSelect}
        />,
      );
    });
    const controls = tree.root.findAll(
      n =>
        n.props.accessibilityRole === 'button' &&
        typeof n.props.onLayout === 'function' &&
        typeof n.props.onPress === 'function',
    );
    act(() => {
      controls[0]!.props.onLayout({
        nativeEvent: { layout: { x: 0, width: 30 } },
      });
      controls[1]!.props.onLayout({
        nativeEvent: { layout: { x: 36, width: 6 } },
      });
      controls[2]!.props.onLayout({
        nativeEvent: { layout: { x: 48, width: 6 } },
      });
    });
    act(() => controls[2]!.props.onPress({ nativeEvent: { locationX: -9 } }));
    expect(onSelect).toHaveBeenLastCalledWith(1);
    act(() => controls[2]!.props.onPress());
    expect(onSelect).toHaveBeenLastCalledWith(2);
    act(() => tree.unmount());
  });
  it('keeps controlled tab selection and explicit selected state', () => {
    const onChange = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineMailboxTabs
          tabs={[
            { id: 'inbox', label: 'Inbox' },
            { id: 'sent', label: 'Sent' },
          ]}
          activeTabId="inbox"
          onChange={onChange}
        />,
      );
    });
    const tab = tree.root.find(
      n =>
        n.props.accessibilityLabel === 'Sent' &&
        typeof n.props.onPress === 'function',
    );
    act(() => tab.props.onPress());
    expect(onChange).toHaveBeenCalledWith('sent');
    expect(tab.props['aria-selected']).toBe(false);
    act(() => tree.unmount());
  });
  it('keeps account dot labels/current while analytics remains decorative', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineCarouselIndicator count={3} activeIndex={1} />,
      );
    });
    expect(
      tree.root.find(
        n =>
          n.props.accessibilityLabel === 'Go to account 2' &&
          n.props.accessibilityRole === 'button',
      ).props['aria-current'],
    ).toBe('true');
    act(() =>
      tree.update(
        <BaselineCarouselIndicator
          count={3}
          activeIndex={1}
          analyticsKeys={['A', 'B', 'C']}
          activePeriodKey="B"
        />,
      ),
    );
    expect(
      tree.root.findAll(n => n.props.accessibilityRole === 'button'),
    ).toHaveLength(0);
    act(() => tree.unmount());
  });
  it('normalizes bulk OTP input, stays controlled and marks disabled fields', () => {
    const onChange = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineCodeField value="" onChange={onChange} />,
      );
    });
    const input = tree.root.find(
      n =>
        n.props.accessibilityLabel === 'Verification code digit 1 of 4' &&
        typeof n.props.onChangeText === 'function',
    );
    act(() => input.props.onChangeText('12A34'));
    expect(onChange).toHaveBeenCalledWith('1234');
    expect(input.props.value).toBe('');
    act(() => tree.update(<BaselineCodeField value="1234" disabled />));
    expect(
      tree.root.find(
        n =>
          n.props.accessibilityLabel === 'Verification code digit 1 of 4' &&
          typeof n.props.editable === 'boolean',
      ).props.editable,
    ).toBe(false);
    act(() => tree.unmount());
  });
  it('preserves indeterminate->true and disabled activation', () => {
    const onChange = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineCheckbox checked="indeterminate" onCheckedChange={onChange} />,
      );
    });
    const checkbox = tree.root.find(
      n =>
        n.props.accessibilityRole === 'checkbox' &&
        typeof n.props.onPress === 'function',
    );
    expect(checkbox.props['aria-checked']).toBe('mixed');
    act(() => checkbox.props.onPress());
    expect(onChange).toHaveBeenCalledWith(true);
    act(() =>
      tree.update(
        <BaselineCheckbox checked disabled onCheckedChange={onChange} />,
      ),
    );
    act(() =>
      tree.root
        .find(
          n =>
            n.props.accessibilityRole === 'checkbox' &&
            typeof n.props.onPress === 'function',
        )
        .props.onPress(),
    );
    expect(onChange).toHaveBeenCalledTimes(1);
    act(() => tree.unmount());
  });
});
