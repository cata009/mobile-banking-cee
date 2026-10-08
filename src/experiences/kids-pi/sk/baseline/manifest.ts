import type { ExperienceManifest } from '../../../contracts'
export const KIDS_SK_BASELINE = {
  id: 'kids-pi.sk.baseline',
  label: 'Kids SK baseline',
  owner: 'kids-sk',
  product: 'KIDS_PI',
  country: 'SK',
  designSystem: 'current',
  releases: ['release-current'],
  baseBaseline: 'baseline-current',
  status: 'reference',
  entryScreen: 'kids.sk.home-concept',
  sourceModules: ['src/experiences/kids-pi/sk/baseline/composition.tsx'],
} as const satisfies ExperienceManifest
