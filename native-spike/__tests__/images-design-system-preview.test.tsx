import React from 'react';
import { ImagesDesignSystemPreview } from '../src/app/designSystemPreviews/images';
import { BaselineUniCreditLogo } from '../src/universal/BaselineUniCreditLogo';

it.each([false, true])(
  'uses the canonical logo with theme text color in dark=%s',
  dark => {
    const element = ImagesDesignSystemPreview({
      componentId: 'brand.unicredit-logo',
      dark,
    });
    expect(React.isValidElement(element)).toBe(true);
    expect(element?.type).toBe(BaselineUniCreditLogo);
    expect(element?.props).toMatchObject({
      textColor: 'var(--uc-text)',
      width: 174,
      height: 24,
      dark,
    });
  },
);

it.each([
  ['black', '#000000'],
  ['white', '#ffffff'],
])('maps the supported %s wordmark variant', (variantId, textColor) => {
  const element = ImagesDesignSystemPreview({
    componentId: 'brand.unicredit-logo',
    variantId,
    dark: false,
  });
  expect(element?.type).toBe(BaselineUniCreditLogo);
  expect(element?.props).toMatchObject({
    textColor,
    ariaLabel: 'UniCredit Bank',
  });
});

it('returns null for unsupported components and variants', () => {
  expect(
    ImagesDesignSystemPreview({ componentId: 'unknown', dark: false }),
  ).toBeNull();
  expect(
    ImagesDesignSystemPreview({
      componentId: 'brand.unicredit-logo',
      variantId: 'logo-only',
      dark: false,
    }),
  ).toBeNull();
});
