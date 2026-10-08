import type { ExperienceManifest } from '../../../contracts'
export const KIDS_RO_BASELINE = {
  id: 'kids-pi.ro.baseline',
  label: 'Kids RO baseline',
  owner: 'kids-ro',
  product: 'KIDS_PI',
  country: 'RO',
  designSystem: 'current',
  releases: ['release-current'],
  baseBaseline: 'baseline-current',
  status: 'reference',
  entryScreen: 'kids.ro.home-concept',
  sourceModules: ['src/experiences/kids-pi/ro/baseline/composition.tsx'],
} as const satisfies ExperienceManifest
