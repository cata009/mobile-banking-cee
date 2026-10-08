import type { CountryId, ProductId, DesignSystemId, ScreenId, FlowId } from '@/app/state/demoTypes'
import type { TemplateRegistryItem, TemplateReuseContract } from './contracts'

export const screenshotUrl = (fileName: string) => new URL(`../../../../screenshots/${fileName}`, import.meta.url).href

const ALL_COUNTRIES: readonly CountryId[] = ['RO', 'CZ', 'SK', 'HU', 'RS', 'BA', 'BA_BL', 'SI'] as const
const DEFAULT_PRODUCTS: readonly ProductId[] = ['PI'] as const
const DEFAULT_DESIGN_SYSTEMS: readonly DesignSystemId[] = ['current'] as const

const DEFAULT_ASSEMBLY_RULES = [
  'Treat this template as a standalone phone-frame screen or state pattern that can be composed into future flows.',
  'Use registered components, config data, icons, and color tokens before introducing any new local UI shape.',
  'Keep source screenshots as visual evidence only; code previews and runtime components are the implementation surface.',
] as const

const DEFAULT_FORBIDDEN_PATTERNS = [
  'Do not embed the source PNG/JPG as the UI implementation.',
  'Do not import lucide/raw SVG directly when an AppIcon registry entry exists.',
  'Do not invent a new component for a shape already represented in the component registry.',
] as const

type TemplateRegistrySeed = Omit<
  TemplateRegistryItem,
  'products' | 'countries' | 'designSystems' | 'standalonePage' | 'relatedScreens' | 'flowIds' | 'reuseContract'
> & {
  products?: readonly ProductId[]
  countries?: readonly CountryId[]
  designSystems?: readonly DesignSystemId[]
  standalonePage?: boolean
  relatedScreens?: readonly ScreenId[]
  flowIds?: readonly FlowId[]
  reuseContract?: Partial<TemplateReuseContract>
}

export function defineTemplate(seed: TemplateRegistrySeed): TemplateRegistryItem {
  const reuseContract = seed.reuseContract ?? {}

  return {
    products: DEFAULT_PRODUCTS,
    countries: ALL_COUNTRIES,
    designSystems: DEFAULT_DESIGN_SYSTEMS,
    standalonePage: true,
    relatedScreens: ['platform.design-system'],
    flowIds: [],
    ...seed,
    reuseContract: {
      role: reuseContract.role ?? 'standalone-pattern',
      dataSources: reuseContract.dataSources ?? [],
      assemblyRules: [...DEFAULT_ASSEMBLY_RULES, ...(reuseContract.assemblyRules ?? [])],
      forbiddenPatterns: [...DEFAULT_FORBIDDEN_PATTERNS, ...(reuseContract.forbiddenPatterns ?? [])],
    },
  }
}
