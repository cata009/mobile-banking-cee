import type { ExperienceManifest } from '../../../contracts'

export const PI_CZ_EVO = {
  id: 'pi.cz.evo-2027',
  label: 'PI Czech Evo 2027',
  owner: 'pi-cz-future',
  product: 'PI',
  country: 'CZ',
  designSystem: 'current',
  releases: ['release-future-evo-2027'],
  baseBaseline: 'baseline-current',
  status: 'preview',
  entryScreen: 'pi.home.overview',
  sourceModules: [
    'src/experiences/pi/cz/evo-2027/composition.ts',
    'src/app/screens/home/App2027TransformationHome.tsx',
    'src/app/screens/analytics/Evo2027AnalyticsScreen.tsx',
    'src/app/screens/investments/CzFutureRoboAdvisorFlow.tsx',
  ],
} as const satisfies ExperienceManifest
