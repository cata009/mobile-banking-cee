import type { ExperienceManifest } from '../../../contracts'
export const PI_RS_FUTURE_GAIN = {
  id: 'pi.rs.future-gain',
  label: 'PI RS future-gain',
  owner: 'pi-rs-future',
  product: 'PI',
  country: 'RS',
  designSystem: 'current',
  releases: ['release-future-rs-future-gain'],
  baseBaseline: 'baseline-current',
  status: 'preview',
  entryScreen: 'pi.home.overview',
  sourceModules: [
    'src/experiences/pi/rs/future-gain/composition.ts',
    'src/app/screens/investments/FutureGainTermDepositScreen.tsx',
    'src/app/screens/investments/FutureGainInvestmentSimulatorScreen.tsx',
  ],
} as const satisfies ExperienceManifest
