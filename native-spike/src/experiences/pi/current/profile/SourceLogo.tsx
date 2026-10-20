import React from 'react';
import { BaselineUniCreditLogo } from '../../../../universal/BaselineUniCreditLogo';

/** Compatibility API consumed by existing screens; one canonical DS renderer. */
export function SourceLogo({
  ariaLabel,
  color = '#ffffff',
  width = 174,
  height = 24,
}: {
  /** Omit when the surrounding content already identifies the bank. */
  ariaLabel?: string;
  color?: string;
  width?: number;
  height?: number;
}) {
  return (
    <BaselineUniCreditLogo
      ariaLabel={ariaLabel}
      textColor={color}
      width={width}
      height={height}
    />
  );
}
