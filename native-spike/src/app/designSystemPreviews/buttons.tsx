import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type {
  PillSortingValue,
  PillVariant,
} from '@/app/components/contracts/pill';
import { PrimaryButton } from '../../universal/PrimaryButton';
import { SourceCustomIcon } from '../../universal/SourceCustomIcon';
import { sourceColor } from '../../universal/sourceColor';
import { BaselineNavigationLink } from '../../universal/BaselineNavigationLink';
import {
  BaselinePill,
  BaselinePillSorting,
} from '../../universal/BaselinePill';

function resolvePillVariant(value: string): PillVariant | undefined {
  switch (value) {
    case 'primary':
    case 'secondary':
    case 'active-counter':
    case 'loading-counter':
    case 'activated':
      return value;
    default:
      return undefined;
  }
}

function SortingPreview({
  dark,
  selected,
}: {
  dark: boolean;
  selected: boolean;
}) {
  const [value, setValue] = useState<PillSortingValue | null>(
    selected ? 'max-percent' : null,
  );
  return (
    <BaselinePillSorting
      selectedValue={value}
      onChange={setValue}
      dark={dark}
      ariaLabel="Sort options"
    />
  );
}

/** Registry IDs explicitly backed by canonical RN renderers; no fallback lookalikes. */
export function ButtonsDesignSystemPreview({
  componentId,
  variantId,
  dark,
}: {
  componentId: string;
  variantId?: string;
  dark: boolean;
}): React.ReactElement | null {
  if (componentId === 'ui.primary-button') {
    const variant = variantId ?? 'action';
    if (variant === 'secondary-prelogin')
      return (
        <View
          style={{
            padding: 16,
            backgroundColor: '#262626',
            alignItems: 'flex-start',
          }}
        >
          <BaselineNavigationLink text="CONTACTS" />
        </View>
      );
    if (['double-action', 'sticky-single', 'sticky-double'].includes(variant)) {
      const sticky = variant.startsWith('sticky');
      return (
        <View
          style={{
            width: sticky ? 375 : 327,
            padding: sticky ? 24 : 0,
            gap: 8,
            backgroundColor: sourceColor('var(--uc-surface)', dark),
          }}
        >
          <PrimaryButton label="Continue" dark={dark} labelSize="18" />
          {variant !== 'sticky-single' ? (
            <PrimaryButton
              label="Cancel"
              variant="secondary"
              dark={dark}
              labelSize="18"
            />
          ) : null}
        </View>
      );
    }
    if (
      [
        'secondary',
        'secondary-disabled',
        'secondary-long',
        'secondary-long-disabled',
      ].includes(variant)
    )
      return (
        <View style={styles.primaryHost}>
          <PrimaryButton
            label={
              variant.includes('long')
                ? 'Review all available payment options'
                : 'Button'
            }
            variant="secondary"
            labelSize={variant.includes('long') ? '14' : '18'}
            disabled={variant.endsWith('disabled')}
            dark={dark}
          />
        </View>
      );
    if (
      ![
        'action',
        'surface',
        'disabled',
        'large-label',
        'label-16',
        'with-icon',
      ].includes(variant)
    )
      return null;
    return (
      <View style={styles.primaryHost}>
        <PrimaryButton
          label={variant === 'with-icon' ? 'Button' : 'Continue'}
          variant={variant === 'surface' ? 'surface' : 'action'}
          disabled={variant === 'disabled'}
          labelSize={variant === 'label-16' ? '16' : '18'}
          dark={dark}
          leadingIcon={
            variant === 'with-icon' ? (
              <SourceCustomIcon
                name="button-chat"
                size={24}
                color={sourceColor('var(--uc-static-white)', dark)}
              />
            ) : undefined
          }
        />
      </View>
    );
  }
  if (componentId === 'ui.pill') {
    const variant = resolvePillVariant(variantId ?? 'primary');
    return variant ? <BaselinePill variant={variant} dark={dark} /> : null;
  }
  if (componentId === 'ui.pill-sorting') {
    const variant = variantId ?? 'selected';
    if (variant !== 'selected' && variant !== 'none') return null;
    return (
      <SortingPreview
        key={variant}
        selected={variant === 'selected'}
        dark={dark}
      />
    );
  }
  return null;
}

const styles = StyleSheet.create({ primaryHost: { width: 327 } });
