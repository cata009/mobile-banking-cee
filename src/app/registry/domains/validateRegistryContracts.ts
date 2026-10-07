import type { ComponentId, ScreenId, FlowId, FeatureId, ReleaseId } from '@/app/state/demoTypes'
import type { ComponentMeta, ScreenMeta, TemplateRegistryItem } from './contracts'

type RegistryCatalog = {
  components: Readonly<Partial<Record<ComponentId, ComponentMeta>>>
  screens: Readonly<Partial<Record<ScreenId, ScreenMeta>>>
  templates: readonly TemplateRegistryItem[]
  flowIds: readonly FlowId[]
  featureIds: readonly FeatureId[]
  releaseIds: readonly ReleaseId[]
  previewIds: readonly string[]
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
function requireDimensions(id: string, width: number, height: number) {
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0)
    throw new Error(`${id}: invalid dimensions`)
}
/** Validate resolved declarations without loading any renderer or feature policy. */
export function validateRegistryContracts(catalog: RegistryCatalog): void {
  const screenIds = new Set(Object.keys(catalog.screens))
  const componentIds = new Set(Object.keys(catalog.components))
  const flowIds = new Set<string>(catalog.flowIds)
  const featureIds = new Set<string>(catalog.featureIds)
  const releaseIds = new Set<string>(catalog.releaseIds)
  const previewIds = new Set(catalog.previewIds)
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
  const templateIds = new Set<string>()
  for (const template of catalog.templates) {
    if (templateIds.has(template.id)) throw new Error(`TEMPLATE_REGISTRY: duplicate id "${template.id}"`)
    templateIds.add(template.id)
    requireText(template.id, 'id', template.id)
    requireText(template.id, 'name', template.name)
    requireText(template.id, 'sourcePath', template.sourcePath)
    requireValues(template.id, 'products', template.products)
    requireValues(template.id, 'countries', template.countries)
    requireValues(template.id, 'designSystems', template.designSystems)
    requireValues(template.id, 'relatedScreens', template.relatedScreens)
    requireValues(template.id, 'relatedComponents', template.relatedComponents)
    requireDimensions(template.id, template.width, template.height)
    requireReferences(template.id, 'relatedScreens', template.relatedScreens, screenIds)
    requireReferences(template.id, 'relatedComponents', template.relatedComponents, componentIds)
    requireReferences(template.id, 'flowIds', template.flowIds, flowIds)
    requireReferences(
      template.id,
      'runtimeScreenId',
      template.runtimeScreenId ? [template.runtimeScreenId] : [],
      screenIds,
    )
    requireReferences(template.id, 'codePreviewId', template.codePreviewId ? [template.codePreviewId] : [], previewIds)
    if (template.implementationStatus === 'reconstructed-code' && !template.codePreviewId)
      throw new Error(`${template.id}: reconstructed-code template must define codePreviewId`)
    requireValues(template.id, 'assemblyRules', template.reuseContract.assemblyRules)
    requireValues(template.id, 'forbiddenPatterns', template.reuseContract.forbiddenPatterns)
  }
}
