import type { ExperienceManifest } from '../../../contracts'
export const PI_CZ_COAPPING = {
  id: 'pi.cz.coapping',
  label: 'PI CZ coapping',
  owner: 'pi-cz-future',
  product: 'PI',
  country: 'CZ',
  designSystem: 'current',
  releases: ['release-future-cz-coapping'],
  baseBaseline: 'baseline-current',
  status: 'preview',
  entryScreen: 'pi.home.overview',
  sourceModules: ['src/experiences/pi/cz/coapping/composition.ts', 'src/app/chat/czChatOrchestration.ts'],
} as const satisfies ExperienceManifest
