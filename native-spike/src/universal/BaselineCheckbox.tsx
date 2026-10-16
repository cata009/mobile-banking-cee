import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { SvgXml } from 'react-native-svg';
import {
  resolveCheckbox,
  type CheckboxCheckedState,
} from '@/app/components/contracts/checkbox';
import { sourceCustomIconXml } from './SourceCustomIcon';
import { sourceColor } from './sourceColor';

/** Isolated Radix-style DS checkbox. Native form/reset integration is not implied. */
export function BaselineCheckbox({
  checked,
  defaultChecked = false,
  disabled = false,
  onCheckedChange,
  ariaLabel,
  dark = false,
}: {
  checked?: CheckboxCheckedState;
  defaultChecked?: CheckboxCheckedState;
  disabled?: boolean;
  onCheckedChange?: (value: CheckboxCheckedState) => void;
  ariaLabel?: string;
  dark?: boolean;
}) {
  const [internal, setInternal] = useState(defaultChecked);
  const state = resolveCheckbox({ checked: checked ?? internal, disabled });
  const active = state.checked === true;
  const background = sourceColor(
    active
      ? dark
        ? 'var(--uc-text)'
        : 'var(--uc-primary-k1)'
      : dark
        ? 'var(--uc-surface-muted)'
        : 'var(--uc-neutral-100)',
    dark,
  );
  const glyphColor = sourceColor(
    active
      ? dark
        ? 'var(--uc-text-inverse)'
        : 'var(--uc-neutral-white)'
      : 'var(--uc-text)',
    dark,
  );
  // Shared Source path is the same Lucide check; preserve Radix CheckIcon's stroke2,
  // while the wider AppIcon check metadata independently uses stroke3.
  const xml = sourceCustomIconXml('check', glyphColor)?.replace(
    'stroke-width="3"',
    'stroke-width="2"',
  );
  const trackPaint =
    dark && !active && /^#[0-9a-f]{6}$/i.test(background)
      ? `rgba(${parseInt(background.slice(1, 3), 16)},${parseInt(background.slice(3, 5), 16)},${parseInt(background.slice(5, 7), 16)},0.3)`
      : background;
  const style = {
    width: state.size,
    height: state.size,
    borderWidth: state.borderWidth,
    borderRadius: state.radius,
    borderColor: sourceColor(
      active ? 'var(--uc-primary-k1)' : 'var(--uc-border)',
      dark,
    ),
    backgroundColor: trackPaint,
    opacity: state.opacity,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={ariaLabel}
      accessibilityState={{ checked: state.ariaChecked, disabled }}
      aria-checked={state.ariaChecked}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={() => {
        if (disabled) return;
        if (checked === undefined) setInternal(state.nextChecked);
        onCheckedChange?.(state.nextChecked);
      }}
      style={style}
    >
      {state.showIndicator && xml ? (
        <SvgXml xml={xml} width={state.iconSize} height={state.iconSize} />
      ) : null}
    </Pressable>
  );
}
