import { deriveProductCategories } from '@/features/products/selectors';
import { createProductFormatters } from '@/features/products/formatters';
import { isReleaseFeatureActive } from '@/app/state/featureResolver';
import type { FeatureId } from '@/app/state/demoTypes';
import { getTranslations } from '@/translations';
import type { AppLanguage } from '@/app/registry/languageByCountry';
import type { CurrentContext } from './contracts';
import type { ControlTokens } from '../../../universal/tokens';
import { sourceColor } from '../../../universal/sourceColor';
import type { NativeBankingPresentation } from '@/features/demo-native/bankingPresentation';

export function createCurrentProducts(
  context: Pick<CurrentContext, 'country' | 'release' | 'productCounts'> &
    Pick<CurrentContext, 'virtualCards'> & {
      bankingPresentation?: NativeBankingPresentation;
    },
) {
  const categories =
    context.bankingPresentation?.productCategories?.map(category => ({
      ...category,
      products: [...category.products],
    })) ??
    deriveProductCategories({
      country: context.country,
      release: context.release,
      resolvedProductCounts: context.productCounts,
    });
  if (
    context.country === 'RO' &&
    context.release === 'release-current' &&
    context.virtualCards?.length
  ) {
    const cards = categories.find(category => category.key === 'cards');
    if (cards) cards.products.push(...context.virtualCards);
    else
      categories.push({
        key: 'cards',
        title: 'Cards',
        products: [...context.virtualCards],
      });
  }
  return {
    categories,
    products: categories.flatMap(category => category.products),
    ...createProductFormatters(categories, context.country, context.release),
  };
}
function lookup(record: unknown, key: string): string | undefined {
  const value = key
    .split('.')
    .reduce<unknown>(
      (current, segment) =>
        current && typeof current === 'object'
          ? (current as Record<string, unknown>)[segment]
          : undefined,
      record,
    );
  return typeof value === 'string' ? value : undefined;
}
export function createCurrentTranslator(
  country: CurrentContext['country'],
  language: AppLanguage,
) {
  const local = getTranslations(country, language);
  return (key: string, fallback?: string) =>
    lookup(local, key) ?? fallback ?? key;
}
export function currentFeature(
  context: Pick<
    CurrentContext,
    'country' | 'release' | 'scenario' | 'activeFeatures'
  >,
  feature: FeatureId,
) {
  if (context.activeFeatures !== undefined)
    return context.activeFeatures.includes(feature);
  return isReleaseFeatureActive(
    { ...context, product: 'PI', designSystem: 'current' },
    feature,
  );
}
export function currentTokens(dark = false): ControlTokens {
  return {
    accent: sourceColor('var(--uc-action)', dark),
    text: sourceColor('var(--uc-text)', dark),
    muted: sourceColor('var(--uc-text-muted)', dark),
    background: sourceColor('var(--uc-app-bg)', dark),
    surface: sourceColor('var(--uc-surface-raised)', dark),
    border: sourceColor('var(--uc-border)', dark),
    inverse: sourceColor('var(--uc-static-white)', dark),
    font: 'UniCredit-regular',
    strongFont: 'UniCredit-bold',
    radius: 8,
    controlHeight: 48,
    rowHeight: 80,
    rowPaddingHorizontal: 24,
    rowPaddingVertical: 16,
    rowGap: 16,
    rowSubtitleSize: 16,
    searchRadius: 0,
    searchBorderWidth: 0,
    searchBackground: dark ? '#262d31' : '#ffffff',
    searchGap: 16,
  };
}
