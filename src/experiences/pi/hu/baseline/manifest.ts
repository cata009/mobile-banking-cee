import type { ExperienceManifest } from '../../../contracts'
export const PI_HU_BASELINE = {
  id: 'pi.hu.baseline',
  label: 'PI HU baseline',
  owner: 'pi-hu-baseline',
  product: 'PI',
  country: 'HU',
  designSystem: 'current',
  releases: ['release-current', 'release-v1', 'release-v2', 'release-v3', 'release-v4'],
  baseBaseline: 'baseline-current',
  status: 'reference',
  entryScreen: 'pi.home.overview',
  sourceModules: [
    'src/experiences/pi/hu/baseline/composition.ts',
    'src/app/screens/home/HomeScreen.tsx',
    'src/app/screens/payments/PaymentsScreen.tsx',
  ],
} as const satisfies ExperienceManifest
