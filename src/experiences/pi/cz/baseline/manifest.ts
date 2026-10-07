import type { ExperienceManifest } from '../../../contracts'
export const PI_CZ_BASELINE = {
  id: 'pi.cz.baseline',
  label: 'PI CZ baseline',
  owner: 'pi-cz-baseline',
  product: 'PI',
  country: 'CZ',
  designSystem: 'current',
  releases: ['release-current', 'release-v1', 'release-v2', 'release-v3', 'release-v4'],
  baseBaseline: 'baseline-current',
  status: 'reference',
  entryScreen: 'pi.home.overview',
  sourceModules: [
    'src/experiences/pi/cz/baseline/composition.ts',
    'src/app/screens/home/HomeScreen.tsx',
    'src/app/screens/payments/PaymentsScreen.tsx',
  ],
} as const satisfies ExperienceManifest
