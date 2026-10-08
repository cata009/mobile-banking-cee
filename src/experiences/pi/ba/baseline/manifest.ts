import type { ExperienceManifest } from '../../../contracts'
export const PI_BA_BASELINE = {
  id: 'pi.ba.baseline',
  label: 'PI BA baseline',
  owner: 'pi-ba-baseline',
  product: 'PI',
  country: 'BA',
  designSystem: 'current',
  releases: ['release-current', 'release-v1', 'release-v2', 'release-v3', 'release-v4'],
  baseBaseline: 'baseline-current',
  status: 'reference',
  entryScreen: 'pi.home.overview',
  sourceModules: [
    'src/experiences/pi/ba/baseline/composition.ts',
    'src/app/screens/home/HomeScreen.tsx',
    'src/app/screens/payments/PaymentsScreen.tsx',
  ],
} as const satisfies ExperienceManifest
