import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { BaselinePillSorting } from './BaselinePill';

export interface BaselineInvestmentFilterChipsProps<T extends string = string> {
  options: readonly { id: T; label: string }[];
  selectedOptionId: T;
  onChange: (optionId: T) => void;
  ariaLabel?: string;
  dark?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Legacy investment API adapter; all sorting ink and interaction live in BaselinePillSorting. */
export function BaselineInvestmentFilterChips<T extends string>({
  options,
  selectedOptionId,
  onChange,
  ariaLabel = 'Investment sorting',
  dark = false,
  style,
}: BaselineInvestmentFilterChipsProps<T>) {
  return (
    <BaselinePillSorting
      options={options.map(({ id, label }) => ({ value: id, label }))}
      value={selectedOptionId}
      onChange={onChange}
      dark={dark}
      ariaLabel={ariaLabel}
      presentation="filter"
      style={style}
    />
  );
}
