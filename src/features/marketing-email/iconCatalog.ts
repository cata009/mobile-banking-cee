import {
  CANONICAL_ICONS,
  resolveCanonicalIcon,
  type CanonicalIconSource,
} from '@/app/components/contracts/canonicalIcons'
import { PFM_CATEGORIES, type PfmCategoryName } from '@/data/pfmCategories'
import { APP_ICON_METADATA, type AppIconMetadata } from './appIconMetadata'
import type { EmailBlock } from './model'

export type EmailIconKind = 'canonical' | 'app' | 'pfm'
export interface EmailIconSource {
  variantId: string
  familyKey: string
  kind: EmailIconKind
  icon: string
  group: string
  theme: string
  state: string
  width: number
  height: number
  sourceLabel: string
  sourcePath: string
  previewTheme?: 'light' | 'dark'
  searchTerms: readonly string[]
  appName?: AppIconMetadata['name']
  pfmCategory?: PfmCategoryName
  pfmVariant?: 'glyph' | 'category-circle'
}
const allCanonical = CANONICAL_ICONS.filter(
  (source) => source.usage === 'canonical' && ['Categories', 'Icons', 'Service icons'].includes(source.group),
)
const canonical = allCanonical.filter((source) => !source.icon.includes('compatibility'))
const mappedAppNames = new Set(canonical.flatMap((source) => (source.existing ? [source.existing.name] : [])))
const canonicalLabels: Record<string, string> = {
  ic_list_numbers: 'Numbered list',
  ic_navigation_restyle_FAQ: 'FAQ',
  ic_navigation_restyle_info: 'Information',
  ic_system_loading: 'Loading',
  ic_actionbar_add_funds_white: 'Add funds',
  'ic_actionbar_add funds_white': 'Add funds',
  ic_payments_ip_gallery: 'Payment gallery',
}
const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

function canonicalMetadata(source: CanonicalIconSource): EmailIconSource {
  return {
    variantId: source.variantId,
    familyKey: `canonical:${source.group}:${source.icon}`,
    kind: 'canonical' as const,
    icon: canonicalLabels[source.icon] ?? source.icon,
    group: source.group,
    theme: source.theme,
    state: source.state,
    width: source.width,
    height: source.height,
    sourceLabel: 'Canonical Figma',
    sourcePath: 'src/app/components/contracts/canonicalIcons.ts',
    searchTerms: [
      source.familyName,
      source.sourceName,
      source.icon,
      ...(source.existing
        ? [
            source.existing.name,
            ...APP_ICON_METADATA.filter((icon) => icon.name === source.existing!.name).flatMap((icon) => [
              icon.label,
              ...icon.usage,
            ]),
          ]
        : []),
    ],
    previewTheme:
      source.theme === 'dark' || source.existing?.color.toLowerCase() === '#ffffff' || source.icon.includes('_white')
        ? ('dark' as const)
        : ('light' as const),
  }
}
/** Source identities, not copied UI. Application metadata is generated from the same registry used by DS Inventory. */
export const EMAIL_ICON_OPTIONS: readonly EmailIconSource[] = [
  ...canonical.map(canonicalMetadata),
  ...APP_ICON_METADATA.filter((source) => !mappedAppNames.has(source.name)).map((source) => ({
    variantId: `app:${source.name}`,
    familyKey: `app:${source.name}`,
    kind: 'app' as const,
    icon: source.label,
    group: source.category,
    theme: 'source',
    state: 'Default',
    width: source.width,
    height: source.height,
    sourceLabel: source.source === 'custom' ? 'Application SVG' : 'Registered Lucide',
    sourcePath: 'src/app/components/icons/AppIcon.tsx',
    searchTerms: [source.name, ...source.usage],
    appName: source.name,
  })),
  ...PFM_CATEGORIES.flatMap((category) =>
    (['glyph', 'category-circle'] as const).map((variant) => ({
      variantId: `pfm:${slug(category.name)}:${variant}`,
      familyKey: `pfm:${slug(category.name)}`,
      kind: 'pfm' as const,
      icon: category.name,
      group: 'PFM categories',
      theme: 'source',
      state: variant === 'glyph' ? 'Glyph' : 'Category circle',
      width: 32,
      height: 32,
      sourceLabel: 'PFM category',
      sourcePath: 'src/app/components/pfm/PfmCategoryIcon.tsx',
      searchTerms: [category.name, 'spending', 'budget', 'category', variant],
      pfmCategory: category.name,
      pfmVariant: variant,
    })),
  ),
]
const legacyAliases = allCanonical.filter((source) => source.icon.includes('compatibility')).map(canonicalMetadata)
const resolvableIcons = [...EMAIL_ICON_OPTIONS, ...legacyAliases]
const byId = new Map(resolvableIcons.map((source) => [source.variantId, source]))
export function resolveEmailIcon(variantId: string) {
  return byId.get(variantId)
}
export interface EmailIconFilter {
  query?: string
  theme?: string
  group?: string
  source?: EmailIconKind | 'all'
}
export function getEmailIconFamilies({
  query = '',
  theme = 'all',
  group = 'all',
  source = 'all',
}: EmailIconFilter = {}): EmailIconSource[] {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  const visible = EMAIL_ICON_OPTIONS.filter(
    (icon) =>
      (theme === 'all' || icon.theme === 'source' || icon.theme === theme) &&
      (group === 'all' || icon.group === group) &&
      (source === 'all' || icon.kind === source) &&
      terms.every((term) =>
        `${icon.icon} ${icon.group} ${icon.sourceLabel} ${icon.state} ${icon.searchTerms.join(' ')}`
          .toLowerCase()
          .includes(term),
      ),
  )
  const families = new Map<string, EmailIconSource>()
  for (const icon of visible) {
    const previous = families.get(icon.familyKey)
    if (!previous || (!['Active', 'Glyph'].includes(previous.state) && ['Active', 'Glyph'].includes(icon.state)))
      families.set(icon.familyKey, icon)
  }
  return [...families.values()]
}
export function getEmailIconVariants(source: EmailIconSource): readonly EmailIconSource[] {
  return resolvableIcons.filter(
    (candidate) => candidate.familyKey === source.familyKey && candidate.theme === source.theme,
  )
}
export function selectEmailIcon(block: EmailBlock, variantId: string, size: number): void {
  const source = resolveEmailIcon(variantId)
  if (!source || !Number.isInteger(size) || size < 12 || size > 128)
    throw new Error('Choose an available DS icon and a size between 12 and 128 px.')
  if (block.icon?.variantId !== variantId) {
    block.content.imageUrl = ''
    block.content.darkImageUrl = ''
    block.content.alt = source.icon
  }
  block.icon = { variantId, size }
  block.content.width = size
  block.content.height = Math.max(1, Math.round((size * source.height) / source.width))
}
export function iconSourceReference(variantId: string): string | undefined {
  const source = resolveCanonicalIcon(variantId)
  return source
    ? `https://www.figma.com/design/FKbbStgBIP9bFAMl3DPKHF?node-id=${encodeURIComponent(source.variantId)}`
    : undefined
}
