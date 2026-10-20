import { buildUniversalCatalog } from '@/universal/catalog';
import { COUNTRIES, COUNTRY_META, SCENARIOS } from '@/app/registry/demoConfig';
import {
  PRODUCT_ORDER,
  PRODUCTS,
  DESIGN_SYSTEM_ORDER,
  DESIGN_SYSTEMS,
} from '@/app/registry/projectModel';
import { RELEASE_ORDER, RELEASE_BUNDLES } from '@/app/registry/releaseRegistry';
import type {
  CountryId,
  ProductId,
  DesignSystemId,
  ReleaseId,
  Scenario,
} from '@/app/state/demoTypes';

/** Source metadata is consumed directly; importing this module never imports a UI implementation. */
export const GLOBAL_NATIVE_CATALOG = buildUniversalCatalog();
export {
  COUNTRIES,
  COUNTRY_META,
  SCENARIOS,
  PRODUCT_ORDER,
  PRODUCTS,
  DESIGN_SYSTEM_ORDER,
  DESIGN_SYSTEMS,
  RELEASE_ORDER,
  RELEASE_BUNDLES,
};
export interface NativeDemoSelection {
  product: ProductId;
  country: CountryId;
  designSystem: DesignSystemId;
  release: ReleaseId;
  scenario: Scenario;
}
export const DEFAULT_NATIVE_SELECTION: NativeDemoSelection = {
  product: 'PI',
  country: 'RO',
  designSystem: 'current',
  release: 'release-current',
  scenario: 'active',
};
/** One entry per actual Source experience; release/scenario remain separate axes. */
export const NATIVE_DEMO_CHOICES = GLOBAL_NATIVE_CATALOG.experiences.map(
  experience => ({
    id:
      experience.id === 'pi.it.mobile-first'
        ? 'italy'
        : experience.id === 'pi.cz.evo-2027'
          ? 'cz-evo'
          : experience.id,
    experienceId: experience.id,
    name: `${experience.product === 'KIDS_PI' ? 'Kids · ' : ''}${experience.country === 'CZ' ? 'Cehia' : COUNTRY_META[experience.country].name}`,
    version:
      experience.id === 'pi.it.mobile-first'
        ? 'Mobile First'
        : experience.id === 'pi.cz.evo-2027'
          ? 'Evo 2027'
          : experience.releases[0] === 'release-current'
            ? 'Versiunea curentă'
            : RELEASE_BUNDLES[experience.releases[0]].label,
    releases: experience.releases,
    selection: {
      product: experience.product,
      country: experience.country,
      designSystem: experience.designSystem,
      release: experience.releases[0],
      scenario: 'active' as const,
    },
  }),
);
export function selectionKey(selection: NativeDemoSelection): string {
  return [
    selection.product,
    selection.country,
    selection.designSystem,
    selection.release,
    selection.scenario,
  ].join(':');
}
export function resolveNativeDemo(selection: NativeDemoSelection): {
  implementation: 'italy' | 'cz-evo' | 'current' | 'kids' | null;
  status: 'native-preview' | 'in-migration' | 'unavailable';
  reason: string;
} {
  const context = GLOBAL_NATIVE_CATALOG.contexts.find(
    item =>
      item.product === selection.product &&
      item.country === selection.country &&
      item.designSystem === selection.designSystem &&
      item.release === selection.release,
  );
  if (!context)
    return {
      implementation: null,
      status: 'unavailable',
      reason:
        'Această combinație nu are o experiență Source catalogată și o implementare nativă.',
    };
  if (context.experienceId === 'pi.it.mobile-first')
    return {
      implementation: 'italy',
      status:
        selection.scenario === 'active' ? 'native-preview' : 'in-migration',
      reason: 'PI Italy · implementare React Native existentă.',
    };
  if (context.experienceId === 'pi.cz.evo-2027')
    return {
      implementation: 'cz-evo',
      status: 'in-migration',
      reason:
        'CZ Evo 2027 · migrare în curs. Sunt accesibile numai ariile native implementate.',
    };
  if (
    selection.product === 'PI' &&
    (context.experienceId.endsWith('.baseline') ||
      context.experienceId === 'pi.cz.coapping' ||
      context.experienceId === 'pi.cz.robo' ||
      context.experienceId === 'pi.rs.future-gain')
  )
    return {
      implementation: 'current',
      status: 'in-migration',
      reason:
        'Compoziție React Native current cu modele și configurații canonice pentru piața selectată; acceptarea vizuală și pe dispozitiv este în curs.',
    };
  if (
    selection.product === 'KIDS_PI' &&
    selection.scenario === 'active' &&
    ['RO', 'HU', 'SK'].includes(selection.country)
  )
    return {
      implementation: 'kids',
      status: 'in-migration',
      reason:
        'Compoziție Kids nativă specifică pieței; acceptarea vizuală și pe dispozitiv este în curs.',
    };
  return {
    implementation: null,
    status: 'unavailable',
    reason:
      'Demo Source existent; conversia React Native pentru această selecție nu este încă disponibilă.',
  };
}
