import type { BaselineId, CountryId, DesignSystemId, ProductId, ReleaseId, ScreenId } from '@/app/state/demoTypes'

/** Composition metadata; feature policies and executable UI keep their existing owners. */
export interface ExperienceManifest {
  id: string
  label: string
  owner: string
  product: ProductId
  country: CountryId
  designSystem: DesignSystemId
  releases: readonly ReleaseId[]
  baseBaseline: BaselineId
  status: 'reference' | 'preview'
  entryScreen: ScreenId
  sourceModules: readonly string[]
}

/** Renderer selection only. Feature availability remains owned by feature policies. */
export interface ExperienceComposition {
  manifest: ExperienceManifest
  product: 'PI' | 'KIDS_PI'
  country: CountryId
  home: 'pi-baseline' | 'pi-evo-2027' | 'kids-sk' | 'kids-hu' | 'kids-ro'
  payments: 'baseline' | 'evo-2027'
  products: 'baseline' | 'evo-2027'
  roboAdvisor: boolean
  smartAssistant: boolean
  futureGain: boolean
}

export interface ExperienceCompositionAdapter {
  manifest: ExperienceManifest
  compose: (state: import('@/app/state/demoTypes').DemoState) => ExperienceComposition
}
