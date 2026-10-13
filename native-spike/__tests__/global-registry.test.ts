import { buildUniversalCatalog } from '@/universal/catalog';
import { PROJECT_PACKS } from '@/app/registry/projectPackRegistry';
import {
  GLOBAL_NATIVE_CATALOG,
  DEFAULT_NATIVE_SELECTION,
  resolveNativeDemo,
  selectionKey,
} from '../src/app/registry';

test('every Source experience/release retains its exact axes and native acceptance facts', () => {
  const source = buildUniversalCatalog();
  expect(GLOBAL_NATIVE_CATALOG.contexts).toEqual(source.contexts);
  expect(GLOBAL_NATIVE_CATALOG.preparedPacks).toEqual(source.preparedPacks);
  expect(
    GLOBAL_NATIVE_CATALOG.contexts.every(
      context => context.nativeAccepted === false,
    ),
  ).toBe(true);
  expect(GLOBAL_NATIVE_CATALOG.inventoryComplete).toBe(false);
});
test('CZ Evo stays current and is explicitly in migration', () => {
  expect(DEFAULT_NATIVE_SELECTION.designSystem).toBe('current');
  expect(resolveNativeDemo(DEFAULT_NATIVE_SELECTION)).toMatchObject({
    implementation: 'cz-evo',
    status: 'in-migration',
  });
  expect(selectionKey(DEFAULT_NATIVE_SELECTION)).toBe(
    'PI:CZ:current:release-future-evo-2027:active',
  );
});
test('Italy remains reachable only on its actual implemented axes', () => {
  expect(
    resolveNativeDemo({
      product: 'PI',
      country: 'IT',
      designSystem: 'mobile-first',
      release: 'release-current',
      scenario: 'active',
    }).implementation,
  ).toBe('italy');
  expect(
    resolveNativeDemo({
      product: 'PI',
      country: 'IT',
      designSystem: 'current',
      release: 'release-current',
      scenario: 'active',
    }).implementation,
  ).toBeNull();
});
test('all prepared and unmigrated packs are honestly unavailable', () => {
  for (const pack of PROJECT_PACKS.filter(
    item => item.integrationReadiness === 'prepared',
  )) {
    expect(
      resolveNativeDemo({
        product: pack.product,
        country: pack.country,
        designSystem: 'current',
        release: 'release-current',
        scenario: 'active',
      }).status,
    ).toBe('unavailable');
  }
  expect(
    resolveNativeDemo({
      ...DEFAULT_NATIVE_SELECTION,
      country: 'RO',
      release: 'release-current',
    }).status,
  ).toBe('unavailable');
  expect(
    resolveNativeDemo({ ...DEFAULT_NATIVE_SELECTION, scenario: 'inactive' })
      .status,
  ).toBe('unavailable');
  expect(
    resolveNativeDemo({
      ...DEFAULT_NATIVE_SELECTION,
      country: 'IT',
      designSystem: 'mobile-first',
      release: 'release-current',
      scenario: 'inactive',
    }).status,
  ).toBe('unavailable');
});
