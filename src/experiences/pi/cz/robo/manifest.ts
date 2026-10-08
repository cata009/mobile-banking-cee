import type { ExperienceManifest } from '../../../contracts'
export const PI_CZ_ROBO = {
  id: 'pi.cz.robo',
  label: 'PI CZ robo',
  owner: 'pi-cz-future',
  product: 'PI',
  country: 'CZ',
  designSystem: 'current',
  releases: ['release-future-cz-robo'],
  baseBaseline: 'baseline-current',
  status: 'preview',
  entryScreen: 'pi.home.overview',
  sourceModules: [
    'src/experiences/pi/cz/robo/composition.ts',
    'src/app/screens/investments/CzFutureRoboAdvisorFlow.tsx',
  ],
} as const satisfies ExperienceManifest
