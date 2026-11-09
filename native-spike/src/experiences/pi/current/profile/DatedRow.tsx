import React from 'react';
import { BaselineDatedRow } from '../../../../universal/BaselineDatedRow';
import { useCurrentTokens } from './Primitives';

/** Adapter over the library dated list row; the profile call sites and props are unchanged. */
export function DatedRow({
  item,
  actions,
  actionsExpanded,
  label,
  uppercase = false,
}: {
  item: {
    day: string;
    month: string;
    title: string;
    description: string;
    badge?: string;
  };
  actions?: () => void;
  actionsExpanded?: boolean;
  label: string;
  uppercase?: boolean;
}) {
  const tokens = useCurrentTokens();
  return (
    <BaselineDatedRow
      item={item}
      dark={tokens.text.toLowerCase() !== '#262626'}
      document={uppercase}
      label={label}
      actionsExpanded={actionsExpanded}
      onActions={actions}
    />
  );
}
