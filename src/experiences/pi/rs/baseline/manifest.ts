import type { ExperienceManifest } from '../../../contracts'
export const PI_RS_BASELINE = {
  id: 'pi.rs.baseline',
  label: 'PI RS baseline',
  owner: 'pi-rs-baseline',
  product: 'PI',
  country: 'RS',
  designSystem: 'current',
  releases: ['release-current', 'release-v1', 'release-v2', 'release-v3', 'release-v4'],
  baseBaseline: 'baseline-current',
  status: 'reference',
  entryScreen: 'pi.home.overview',
  sourceModules: [
    'src/experiences/pi/rs/baseline/composition.ts',
    'src/app/screens/home/HomeScreen.tsx',
    'src/app/screens/payments/PaymentsScreen.tsx',
  ],
} as const satisfies ExperienceManifest
