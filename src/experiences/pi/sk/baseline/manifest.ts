import type { ExperienceManifest } from '../../../contracts'
export const PI_SK_BASELINE = {
  id: 'pi.sk.baseline',
  label: 'PI SK baseline',
  owner: 'pi-sk-baseline',
  product: 'PI',
  country: 'SK',
  designSystem: 'current',
  releases: ['release-current', 'release-v1', 'release-v2', 'release-v3', 'release-v4'],
  baseBaseline: 'baseline-current',
  status: 'reference',
  entryScreen: 'pi.home.overview',
  sourceModules: [
    'src/experiences/pi/sk/baseline/composition.ts',
    'src/app/screens/home/HomeScreen.tsx',
    'src/app/screens/payments/PaymentsScreen.tsx',
  ],
} as const satisfies ExperienceManifest
