import { createContext } from 'react';
import type { AccessibilityState, AccessibilityValue } from 'react-native';

/** Enabled only by the in-scope PI application; excluded experiences retain their renderer. */
export const PiWebAccessibilityContext = createContext(false);

interface NativeAccessibilityProps {
  accessibilityState?: AccessibilityState;
  accessibilityValue?: AccessibilityValue;
  accessibilityElementsHidden?: boolean;
  importantForAccessibility?: string;
  disabled?: boolean;
  returnKeyType?: string;
}

/** RN Web 0.21 accepts flat ARIA props rather than RN's compound state/value props. */
export function nativeWebAccessibilityProps<T extends NativeAccessibilityProps>(props: T): T & Record<string, unknown> {
  const derived: Record<string, unknown> = {};
  const set = (name: string, value: unknown) => {
    if (value !== undefined && Reflect.get(props, name) === undefined) derived[name] = value;
  };
  const state = props.accessibilityState;
  if (state) {
    for (const key of ['busy', 'checked', 'disabled', 'expanded', 'selected'] as const) set(`aria-${key}`, state[key]);
    if (props.disabled === undefined && state.disabled !== undefined) derived.disabled = state.disabled;
  }
  const value = props.accessibilityValue;
  if (value) {
    for (const key of ['min', 'max', 'now', 'text'] as const) set(`aria-value${key}`, value[key]);
  }
  if (props.accessibilityElementsHidden !== undefined) set('aria-hidden', props.accessibilityElementsHidden);
  if (props.importantForAccessibility === 'no-hide-descendants') set('aria-hidden', true);
  if (props.returnKeyType === 'search') {
    set('role', 'searchbox');
    set('inputMode', 'search');
  }
  return Object.assign({}, props, derived);
}
