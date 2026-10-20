import { describe, expect, it } from 'vitest'
import {
  COMPONENT_DOMAINS,
  COMPONENT_REGISTRY,
  getComponentMeta,
  getComponentsForScreen,
} from '@/app/registry/componentRegistry'
import {
  SCREEN_DOMAINS,
  SCREEN_REGISTRY,
  getScreenMeta,
  getScreensForRuntimeScreen,
} from '@/app/registry/screenRegistry'
import { composeRegistry } from '@/app/registry/domains/composeRegistry'
import { validateRegistryContracts } from '@/app/registry/domains/validateRegistryContracts'
import { FEATURE_META } from '@/app/registry/demoConfig'
import { RELEASE_BUNDLES } from '@/app/registry/releaseRegistry'
import { CUSTOM_ICON_DOMAINS, CUSTOM_ICONS } from '@/app/components/icons/customIcons'
import { LUCIDE_ICON_DOMAINS, LUCIDE_ICONS } from '@/app/components/icons/lucideIcons'
import { ICON_REGISTRY } from '@/app/components/icons/iconRegistry'
import { validateIconDefinition } from '@/app/components/icons/iconTypes'
import type { FeatureId, ReleaseId } from '@/app/state/demoTypes'
const catalog = {
  components: COMPONENT_REGISTRY,
  screens: SCREEN_REGISTRY,
  featureIds: Object.keys(FEATURE_META) as FeatureId[],
  releaseIds: Object.keys(RELEASE_BUNDLES) as ReleaseId[],
}
describe('domain composition contracts', () => {
  it.each([
    ['components', COMPONENT_DOMAINS, COMPONENT_REGISTRY],
    ['screens', SCREEN_DOMAINS, SCREEN_REGISTRY],
    ['custom icons', CUSTOM_ICON_DOMAINS, CUSTOM_ICONS],
    ['Lucide icons', LUCIDE_ICON_DOMAINS, LUCIDE_ICONS],
  ] as const)('composes %s once and retains each owned entry object', (label, domains, registry) => {
    const keys = domains.flatMap((domain) => Object.keys(domain))
    expect(new Set(keys).size, label).toBe(keys.length)
    expect(keys.sort()).toEqual(Object.keys(registry).sort())
    for (const domain of domains)
      for (const [id, value] of Object.entries(domain))
        expect(Object.entries(registry).find(([key]) => key === id)?.[1]).toBe(value)
  })
  it('preserves compatibility selectors and shared runtime aliases', () => {
    expect(getComponentMeta('accounts.transaction-row')).toBe(COMPONENT_REGISTRY['accounts.transaction-row'])
    expect(getComponentsForScreen('pi.account.detail')).toEqual(
      Object.values(COMPONENT_REGISTRY).filter((component) => component.usedByScreens.includes('pi.account.detail')),
    )
    expect(getScreenMeta('kids.ro.home-concept')).toBe(SCREEN_REGISTRY['kids.ro.home-concept'])
    expect(getScreensForRuntimeScreen('homepage')).toEqual(
      Object.values(SCREEN_REGISTRY).filter((screen) => screen.runtimeScreen === 'homepage'),
    )
  })
  it('rejects collisions rather than overwriting a domain entry', () => {
    expect(() =>
      composeRegistry('fixture', [{ shared: { id: 'shared' } }, { shared: { id: 'shared' } }] as const, ['shared']),
    ).toThrow('duplicate id "shared"')
  })
  it('rejects keys that disagree with the entry ID', () => {
    expect(() => composeRegistry('fixture', [{ entry: { id: 'other' } }] as const, ['entry'])).toThrow(
      'does not match entry id',
    )
  })
  it('rejects missing, repeated and unknown ordering references', () => {
    expect(() => composeRegistry('fixture', [{ first: {} }] as const, [])).toThrow('missing ordered ids first')
    expect(() => composeRegistry('fixture', [{ first: {} }] as const, ['first', 'first'])).toThrow(
      'unknown ordered id "first"',
    )
  })
  it('validates all resolved references and required metadata', () => {
    expect(() => validateRegistryContracts(catalog)).not.toThrow()
    for (const [name, definition] of Object.entries(ICON_REGISTRY))
      expect(() => validateIconDefinition(name, definition)).not.toThrow()
  })
  it('rejects invalid component and screen references', () => {
    expect(() => validateRegistryContracts({ ...catalog, screens: {} })).toThrow('unknown usedByScreens')
    expect(() =>
      validateRegistryContracts({
        ...catalog,
        components: {},
        screens: { 'pi.account.detail': SCREEN_REGISTRY['pi.account.detail'] },
      }),
    ).toThrow('unknown similarTo')
  })
  it('rejects unresolved feature and release references', () => {
    expect(() => validateRegistryContracts({ ...catalog, featureIds: [] })).toThrow('unknown features')
    expect(() => validateRegistryContracts({ ...catalog, releaseIds: [] })).toThrow('unknown releases')
  })
  it('rejects invalid component metadata', () => {
    expect(() =>
      validateRegistryContracts({
        ...catalog,
        components: { 'ui.primary-button': { ...COMPONENT_REGISTRY['ui.primary-button'], label: '' } },
      }),
    ).toThrow('missing label')
  })
  it('rejects invalid icon metadata', () => {
    const custom = CUSTOM_ICONS['help-circle']
    expect(() => validateIconDefinition('fixture', { ...custom, label: '' })).toThrow('missing label')
    expect(() => validateIconDefinition('fixture', { ...custom, width: 0 })).toThrow('invalid dimensions')
    expect(() => validateIconDefinition('fixture', { ...custom, usage: [] })).toThrow('missing usage')
    expect(() => validateIconDefinition('fixture', { ...custom, viewBox: '0 0 0 NaN' })).toThrow('invalid viewBox')
    expect(() => validateIconDefinition('fixture', { ...LUCIDE_ICONS.check, strokeWidth: 0 })).toThrow(
      'invalid strokeWidth',
    )
  })
})
