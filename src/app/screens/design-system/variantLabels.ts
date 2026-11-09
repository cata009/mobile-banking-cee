import { getCatalogCompositionSource } from '@/app/components/contracts/catalogCompositions'
import { FIGMA_LIBRARY_PAGES } from './figmaLibraryCatalog'
import { FIGMA_STATE_IMPLEMENTATION } from './figmaStateImplementationMap'

/** Variant values authored in Italian in the source library, shown in English. */
const VALUE_TRANSLATIONS: Readonly<Record<string, string>> = {
  Foto: 'Photo',
  Conti: 'Accounts',
  Carte: 'Cards',
  Altro: 'Other',
}

/** The readable qualifiers of a Figma variant name. Flags set to No are left out, flags set to Yes keep their name. */
export function figmaVariantQualifiers(name: string): string[] {
  return name
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .flatMap((part) => {
      const [key, ...rest] = part.split('=')
      const value = rest.join('=').trim()
      if (!key || !value) return [VALUE_TRANSLATIONS[part] ?? part]
      if (value === 'No') return []
      if (value === 'Yes') return [key.trim()]
      return [VALUE_TRANSLATIONS[value] ?? value]
    })
}

/** "Variant=Special, Type=Card, Panel list=No" becomes "Special · Card". */
export function describeFigmaVariant(name: string): string {
  const parts = figmaVariantQualifiers(name)
  return parts.length ? parts.join(' · ') : name
}

/** "icon-title" reads as "Icon title". */
export function humanizeVariant(id: string): string {
  const text = id.replace(/[-_]+/g, ' ').trim()
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : id
}

let figmaNames: Map<string, string> | undefined
function figmaVariantName(nodeId: string): string | undefined {
  figmaNames ??= new Map(
    FIGMA_LIBRARY_PAGES.flatMap((page) => page.families.flatMap((family) => family.variants)).map((variant) => [
      variant.nodeId,
      variant.name,
    ]),
  )
  return figmaNames.get(nodeId)
}

/**
 * The name people know an implemented variant by: its Figma state when one is mapped, the catalogue name for
 * source compositions, or the variant id made readable.
 */
export function implementedVariantLabel(componentId: string, variantId: string): string {
  const catalog = getCatalogCompositionSource(variantId)?.name
  if (catalog) return catalog
  const direct = figmaVariantName(variantId)
  if (direct) return describeFigmaVariant(direct)
  const map = FIGMA_STATE_IMPLEMENTATION[componentId]
  const nodeId = map && Object.keys(map).find((key) => map[key] === variantId)
  const mapped = nodeId ? figmaVariantName(nodeId) : undefined
  return mapped ? describeFigmaVariant(mapped) : humanizeVariant(variantId)
}
