import type { ExperienceManifest } from '../../../contracts'
export const PI_BA_BL_BASELINE = {
  id: 'pi.ba-bl.baseline',
  label: 'PI BA_BL baseline',
  owner: 'pi-ba-bl-baseline',
  product: 'PI',
  country: 'BA_BL',
  designSystem: 'current',
  releases: ['release-current', 'release-v1', 'release-v2', 'release-v3', 'release-v4'],
  baseBaseline: 'baseline-current',
  status: 'reference',
  entryScreen: 'pi.home.overview',
  sourceModules: [
    'src/experiences/pi/ba-bl/baseline/composition.ts',
    'src/app/screens/home/HomeScreen.tsx',
    'src/app/screens/payments/PaymentsScreen.tsx',
  ],
} as const satisfies ExperienceManifest
