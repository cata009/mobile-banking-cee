import type { ExperienceManifest } from '../../../contracts'
export const PI_SI_BASELINE = {
  id: 'pi.si.baseline',
  label: 'PI SI baseline',
  owner: 'pi-si-baseline',
  product: 'PI',
  country: 'SI',
  designSystem: 'current',
  releases: ['release-current', 'release-v1', 'release-v2', 'release-v3', 'release-v4'],
  baseBaseline: 'baseline-current',
  status: 'reference',
  entryScreen: 'pi.home.overview',
  sourceModules: [
    'src/experiences/pi/si/baseline/composition.ts',
    'src/app/screens/home/HomeScreen.tsx',
    'src/app/screens/payments/PaymentsScreen.tsx',
  ],
} as const satisfies ExperienceManifest
