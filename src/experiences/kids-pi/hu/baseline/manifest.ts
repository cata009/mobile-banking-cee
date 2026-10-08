import type { ExperienceManifest } from '../../../contracts'
export const KIDS_HU_BASELINE = {
  id: 'kids-pi.hu.baseline',
  label: 'Kids HU baseline',
  owner: 'kids-hu',
  product: 'KIDS_PI',
  country: 'HU',
  designSystem: 'current',
  releases: ['release-current'],
  baseBaseline: 'baseline-current',
  status: 'reference',
  entryScreen: 'kids.hu.home-concept',
  sourceModules: ['src/experiences/kids-pi/hu/baseline/composition.tsx'],
} as const satisfies ExperienceManifest
