import React from 'react';
import { BaselineCarouselIndicator } from '../../../../../universal/BaselineCarouselIndicator';
import type { tokens } from './Primitives';

/** The shared design-system indicator is used in account and card details. */
export default function Indicator({ ids, selectedId, onSelect, label = 'account' }: {
  ids: readonly string[];
  selectedId: string;
  onSelect: (id: string) => void;
  label?: string;
  controlTokens?: Pick<typeof tokens, 'accent' | 'muted'>;
}) {
  return <BaselineCarouselIndicator count={ids.length} activeIndex={Math.max(0, ids.indexOf(selectedId))} itemLabel={label} withBackdropBlur={false} onSelect={index => { const id = ids[index]; if (id) onSelect(id); }} />;
}
