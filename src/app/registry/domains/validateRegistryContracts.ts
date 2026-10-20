import type { ComponentId, ScreenId, FeatureId, ReleaseId } from '@/app/state/demoTypes'
import type { ComponentMeta, ScreenMeta } from './contracts'

type RegistryCatalog = {
  components: Readonly<Partial<Record<ComponentId, ComponentMeta>>>
  screens: Readonly<Partial<Record<ScreenId, ScreenMeta>>>
  featureIds: readonly FeatureId[]
  releaseIds: readonly ReleaseId[]
}
function requireText(id: string, field: string, value: string) {
  if (!value.trim()) throw new Error(`${id}: missing ${field}`)
}
function requireValues(id: string, field: string, values: readonly string[]) {
  if (!values.length) throw new Error(`${id}: missing ${field}`)
  for (const value of values) requireText(id, field, value)
}
function requireReferences(id: string, field: string, values: readonly string[], known: ReadonlySet<string>) {
  for (const value of values) if (!known.has(value)) throw new Error(`${id}: unknown ${field} "${value}"`)
}
/** Validate resolved declarations without loading any renderer or feature policy. */
export function validateRegistryContracts(catalog: RegistryCatalog): void {
  const screenIds = new Set(Object.keys(catalog.screens))
  const featureIds = new Set<string>(catalog.featureIds)
  const releaseIds = new Set<string>(catalog.releaseIds)
  for (const component of Object.values(catalog.components)) {
    requireText(component.id, 'label', component.label)
    requireText(component.id, 'componentPath', component.componentPath)
    requireValues(component.id, 'products', component.products)
    requireValues(component.id, 'designSystems', component.designSystems)
    requireReferences(component.id, 'usedByScreens', component.usedByScreens, screenIds)
  }
  for (const screen of Object.values(catalog.screens)) {
    requireText(screen.id, 'label', screen.label)
    requireText(screen.id, 'runtimeScreen', screen.runtimeScreen)
    requireText(screen.id, 'layoutFamily', screen.layoutFamily)
    requireText(screen.id, 'componentPath', screen.componentPath)
    requireValues(screen.id, 'products', screen.products)
    requireValues(screen.id, 'countries', screen.countries)
    requireValues(screen.id, 'designSystems', screen.designSystems)
    requireReferences(screen.id, 'similarTo', screen.similarTo, screenIds)
    requireReferences(screen.id, 'features', screen.features, featureIds)
    requireReferences(screen.id, 'releases', screen.releases ?? [], releaseIds)
  }
}
