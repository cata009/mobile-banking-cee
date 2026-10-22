import React, { useState } from 'react';
import type { SectionHeadingDividerVariant } from '@/app/components/contracts/sectionDivider';
import { BaselineSectionDivider } from '../../universal/BaselineSectionDivider';

type Variant = Exclude<SectionHeadingDividerVariant, 'section'>;
type Sample = { title: string; secondaryText?: string; count?: number };

/** Existing thirteen catalogue/Figma specimens; rendering belongs entirely to the canonical RN leaf. */
const samples: Record<Variant, Sample> = {
  'small-title-data': {
    title: 'UPCOMING PAYMENTS',
    secondaryText: '30,000.00 RSD',
  },
  'small-two-line-title-data': {
    title: 'UPCOMING PAYMENTS\nON TWO LINES',
    secondaryText: '30,000.00 RSD',
  },
  'medium-title': { title: 'TITLE' },
  'with-counter': { title: 'TITLE', count: 18 },
  'medium-two-line-title': {
    title: 'TITLE HERE IS SO LONG THAT\nCAN BE USED ON TWO LINES',
  },
  'large-title': { title: 'November' },
  'large-two-line-title': {
    title: 'Your monthly Report',
    secondaryText: 'for October 2018',
  },
  'action-date': { title: 'SELECT ALL', secondaryText: ' DD/MM/YY - DD/MM/YY' },
  'name-action': { title: 'PAYMENT DETAILS 2', secondaryText: 'REMOVE' },
  'action-date-checkbox': {
    title: 'SELECT ALL',
    secondaryText: ' DD/MM/YY - DD/MM/YY',
  },
  'light-title': { title: 'ALL PRODUCTS', secondaryText: 'N' },
  'light-date': { title: '15 JULY 2022' },
  'light-small-title-data': {
    title: 'TRANSACTION FEE',
    secondaryText: '500,00 CZK',
  },
};

function isVariant(value: string): value is Variant {
  return Object.prototype.hasOwnProperty.call(samples, value);
}

function DividerSample({ variant, dark }: { variant: Variant; dark: boolean }) {
  const [checked, setChecked] = useState(false);
  return (
    <BaselineSectionDivider
      {...samples[variant]}
      variant={variant}
      dark={dark}
      checked={checked}
      onCheckedChange={setChecked}
    />
  );
}

export function DividerDesignSystemPreview({
  componentId,
  variantId,
  dark,
}: {
  componentId: string;
  variantId?: string;
  dark: boolean;
}): React.ReactElement | null {
  if (componentId !== 'ui.section-heading-divider') return null;
  const variant = variantId ?? 'small-title-data';
  if (!isVariant(variant)) return null;
  return <DividerSample key={variant} variant={variant} dark={dark} />;
}
