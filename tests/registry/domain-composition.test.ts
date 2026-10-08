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
import { TEMPLATE_DOMAINS, TEMPLATE_REGISTRY } from '@/app/registry/templateRegistry'
import { composeRegistry, composeTemplateRegistry } from '@/app/registry/domains/composeRegistry'
import { validateRegistryContracts } from '@/app/registry/domains/validateRegistryContracts'
import { FLOW_REGISTRY } from '@/app/registry/flowRegistry'
import { FEATURE_META } from '@/app/registry/demoConfig'
import { RELEASE_BUNDLES } from '@/app/registry/releaseRegistry'
import { CUSTOM_ICON_DOMAINS, CUSTOM_ICONS } from '@/app/components/icons/customIcons'
import { LUCIDE_ICON_DOMAINS, LUCIDE_ICONS } from '@/app/components/icons/lucideIcons'
import { ICON_REGISTRY } from '@/app/components/icons/iconRegistry'
import { validateIconDefinition } from '@/app/components/icons/iconTypes'
import type { FeatureId, FlowId, ReleaseId } from '@/app/state/demoTypes'
const catalog = {
  components: COMPONENT_REGISTRY,
  screens: SCREEN_REGISTRY,
  templates: TEMPLATE_REGISTRY,
  flowIds: Object.keys(FLOW_REGISTRY) as FlowId[],
  featureIds: Object.keys(FEATURE_META) as FeatureId[],
  releaseIds: Object.keys(RELEASE_BUNDLES) as ReleaseId[],
  previewIds: TEMPLATE_REGISTRY.flatMap((template) => (template.codePreviewId ? [template.codePreviewId] : [])),
}
function firstTemplate() {
  const template = TEMPLATE_REGISTRY[0]
  if (!template) throw new Error('missing baseline template')
  return template
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
  it('retains every domain-owned template once', () => {
    const entries = TEMPLATE_DOMAINS.flat()
    expect(new Set(entries.map((entry) => entry.id)).size).toBe(entries.length)
    expect(entries.map((entry) => entry.id).sort()).toEqual(TEMPLATE_REGISTRY.map((entry) => entry.id).sort())
    for (const entry of entries) expect(TEMPLATE_REGISTRY.find((template) => template.id === entry.id)).toBe(entry)
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
  it('rejects duplicate templates and invalid template ordering', () => {
    const template = firstTemplate()
    expect(() => composeTemplateRegistry([[template], [template]], [template.id])).toThrow('duplicate id')
    expect(() => composeTemplateRegistry([[template]], [])).toThrow('missing ordered ids')
    expect(() => composeTemplateRegistry([[template]], ['unknown'])).toThrow('unknown ordered id')
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
        templates: [],
      }),
    ).toThrow('unknown similarTo')
  })
  it('rejects unresolved feature and release references', () => {
    expect(() => validateRegistryContracts({ ...catalog, featureIds: [] })).toThrow('unknown features')
    expect(() => validateRegistryContracts({ ...catalog, releaseIds: [] })).toThrow('unknown releases')
  })
  it('rejects unresolved template component, flow, preview and runtime references', () => {
    const template = firstTemplate()
    expect(() => validateRegistryContracts({ ...catalog, components: {} })).toThrow('unknown relatedComponents')
    expect(() => validateRegistryContracts({ ...catalog, flowIds: [] })).toThrow('unknown flowIds')
    expect(() => validateRegistryContracts({ ...catalog, previewIds: [] })).toThrow('unknown codePreviewId')
    const screens: Partial<typeof SCREEN_REGISTRY> = { ...SCREEN_REGISTRY }
    delete screens['kids.ro.home-concept']
    expect(() =>
      validateRegistryContracts({
        ...catalog,
        screens,
        templates: [{ ...template, runtimeScreenId: 'kids.ro.home-concept' }],
      }),
    ).toThrow('unknown runtimeScreenId')
  })
  it('rejects invalid schemas and reconstructed templates without preview contracts', () => {
    const template = firstTemplate()
    expect(() => validateRegistryContracts({ ...catalog, templates: [{ ...template, width: 0 }] })).toThrow(
      'invalid dimensions',
    )
    expect(() => validateRegistryContracts({ ...catalog, templates: [{ ...template, name: '' }] })).toThrow(
      'missing name',
    )
    expect(() =>
      validateRegistryContracts({ ...catalog, templates: [{ ...template, codePreviewId: undefined }] }),
    ).toThrow('must define codePreviewId')
    expect(() =>
      validateRegistryContracts({
        ...catalog,
        components: { 'ui.primary-button': { ...COMPONENT_REGISTRY['ui.primary-button'], label: '' } },
      }),
    ).toThrow('missing label')
    expect(() => validateRegistryContracts({ ...catalog, templates: [template, template] })).toThrow('duplicate id')
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
