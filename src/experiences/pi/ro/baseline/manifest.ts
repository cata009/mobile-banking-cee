import type { ExperienceManifest } from '../../../contracts'

export const PI_RO_BASELINE = {
  id: 'pi.ro.baseline',
  label: 'PI Romania baseline',
  owner: 'pi-ro-baseline',
  product: 'PI',
  country: 'RO',
  designSystem: 'current',
  releases: ['release-current', 'release-v1', 'release-v2', 'release-v3', 'release-v4'],
  baseBaseline: 'baseline-current',
  status: 'reference',
  entryScreen: 'pi.home.overview',
  sourceModules: [
    'src/experiences/pi/ro/baseline/composition.ts',
    'src/app/screens/home/HomeScreen.tsx',
    'src/app/screens/payments/PaymentsScreen.tsx',
  ],
} as const satisfies ExperienceManifest
