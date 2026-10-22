import React from 'react';
import { BaselineUniCreditLogo } from '../../universal/BaselineUniCreditLogo';

/** Shared catalog dispatches here; artwork has exactly one RN renderer. */
export function ImagesDesignSystemPreview({
  componentId,
  variantId,
  dark,
}: {
  componentId: string;
  variantId?: string;
  dark: boolean;
}): React.ReactElement | null {
  if (componentId !== 'brand.unicredit-logo') return null;
  let textColor: string;
  switch (variantId) {
    case undefined:
    case 'default':
      textColor = 'var(--uc-text)';
      break;
    case 'black':
      textColor = '#000000';
      break;
    case 'white':
      textColor = '#ffffff';
      break;
    default:
      return null;
  }
  return (
    <BaselineUniCreditLogo
      textColor={textColor}
      width={174}
      height={24}
      dark={dark}
      ariaLabel="UniCredit Bank"
    />
  );
}
