import React from 'react';
import { BaselineSearchBar } from '../../../../../universal/BaselineSearchBar';
/** The padded account field consumes the shared PI search contract and renderer. */
export default function LedgerSearch({
  value,
  onChange,
  onFilters,
  label = 'Search transactions',
}: {
  value: string;
  onChange: (value: string) => void;
  onFilters?: () => void;
  label?: string;
}) {
  return (
    <BaselineSearchBar
      value={value}
      onValueChange={onChange}
      onFilterClick={onFilters}
      placeholder="Search"
      accessibilityLabel={label}
      trailingLabel="Transaction filters"
      fieldSurface="raised"
      fieldSize="compact"
      fieldPadding="8"
    />
  );
}
