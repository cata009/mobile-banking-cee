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
test('default matches Source Romania baseline and remains explicitly in migration', () => {
  expect(DEFAULT_NATIVE_SELECTION.designSystem).toBe('current');
  expect(resolveNativeDemo(DEFAULT_NATIVE_SELECTION)).toMatchObject({
    implementation: 'current',
    status: 'in-migration',
  });
  expect(selectionKey(DEFAULT_NATIVE_SELECTION)).toBe(
    'PI:RO:current:release-current:active',
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
test('prepared packs remain unavailable while real baseline countries are source-scoped native migrations', () => {
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
  ).toBe('in-migration');
  expect(
    resolveNativeDemo({ ...DEFAULT_NATIVE_SELECTION, scenario: 'inactive' })
      .implementation,
  ).toBe('current');
  expect(
    resolveNativeDemo({
      ...DEFAULT_NATIVE_SELECTION,
      country: 'IT',
      designSystem: 'mobile-first',
      release: 'release-current',
      scenario: 'inactive',
    }).status,
  ).toBe('in-migration');
});
test('every baseline release resolves its exact current family while Kids keeps separate active-only composition', () => {
  for (const context of GLOBAL_NATIVE_CATALOG.contexts.filter(
    catalogContext =>
      catalogContext.experienceId.startsWith('pi.') &&
      catalogContext.experienceId.endsWith('.baseline'),
  )) {
    for (const scenario of ['active', 'inactive'] as const)
      expect(resolveNativeDemo({ ...context, scenario }).implementation).toBe(
        'current',
      );
  }
  for (const country of ['RO', 'SK', 'HU'] as const) {
    const selection = {
      product: 'KIDS_PI' as const,
      country,
      designSystem: 'current' as const,
      release: 'release-current' as const,
      scenario: 'active' as const,
    };
    expect(resolveNativeDemo(selection).implementation).toBe('kids');
    expect(
      resolveNativeDemo({ ...selection, scenario: 'inactive' }).implementation,
    ).toBeNull();
  }
});
