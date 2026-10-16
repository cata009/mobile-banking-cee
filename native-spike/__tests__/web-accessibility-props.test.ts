import { nativeWebAccessibilityProps } from '../src/platform/webAccessibility';

test('maps Native checkbox, tab, disclosure and busy states without changing their visual props', () => {
  const style = { width: 24, height: 24 };
  const onPress = jest.fn();
  const actual = nativeWebAccessibilityProps({ style, onPress, accessibilityState: { checked: true, selected: false, expanded: false, busy: true, disabled: false } });
  expect(actual).toMatchObject({ 'aria-checked': true, 'aria-selected': false, 'aria-expanded': false, 'aria-busy': true, 'aria-disabled': false, disabled: false });
  expect(actual.style).toBe(style);
  expect(actual.onPress).toBe(onPress);
});

test('preserves explicit Web semantics and disabled props over derived values', () => {
  const actual = nativeWebAccessibilityProps({ 'aria-checked': false, disabled: true, accessibilityState: { checked: true, disabled: false } });
  expect(actual['aria-checked']).toBe(false);
  expect(actual.disabled).toBe(true);
});

test('preserves mixed checkbox state and zero-valued range bounds', () => {
  expect(nativeWebAccessibilityProps({ accessibilityState: { checked: 'mixed' }, accessibilityValue: { min: 0, max: 100, now: 0, text: '0 percent' } })).toMatchObject({ 'aria-checked': 'mixed', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': 0, 'aria-valuetext': '0 percent' });
});

test('hides Native inaccessible descendants and leaves unspecified props unspecified', () => {
  expect(nativeWebAccessibilityProps({ importantForAccessibility: 'no-hide-descendants' })['aria-hidden']).toBe(true);
  expect(nativeWebAccessibilityProps({})).toEqual({});
});

test('exposes Native search inputs as browser searchboxes while preserving explicit input semantics', () => {
  expect(nativeWebAccessibilityProps({ returnKeyType: 'search' })).toMatchObject({ role: 'searchbox', inputMode: 'search' });
  expect(nativeWebAccessibilityProps({ returnKeyType: 'search', role: 'combobox', inputMode: 'decimal' })).toMatchObject({ role: 'combobox', inputMode: 'decimal' });
});
