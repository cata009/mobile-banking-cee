import type { ScreenId } from '@/app/state/demoTypes'
import type { ScreenMeta } from '../contracts'
import { ALL_COUNTRIES } from '../countries'

export const CARDS_SCREENS = {
  'pi.card.detail': {
    id: 'pi.card.detail',
    label: 'PI Card detail',
    runtimeScreen: 'card-detail',
    products: ['PI'],
    countries: ALL_COUNTRIES,
    designSystems: ['current'],
    status: 'partial',
    layoutFamily: 'account-detail',
    componentPath: 'src/app/screens/cards/CardDetailScreen.tsx',
    features: [],
    screenshots: [],
    similarTo: ['pi.card.details-info', 'pi.card.options'],
  },
  'pi.card.details-info': {
    id: 'pi.card.details-info',
    label: 'PI Card details info',
    runtimeScreen: 'card-details-info',
    products: ['PI'],
    countries: ALL_COUNTRIES,
    designSystems: ['current'],
    status: 'partial',
    layoutFamily: 'account-detail',
    componentPath: 'src/app/screens/cards/CardDetailsInfoScreen.tsx',
    features: [],
    screenshots: [],
    similarTo: ['pi.card.detail', 'pi.card.options'],
  },
  'pi.card.options': {
    id: 'pi.card.options',
    label: 'PI Card options',
    runtimeScreen: 'card-options',
    products: ['PI'],
    countries: ALL_COUNTRIES,
    designSystems: ['current'],
    status: 'partial',
    layoutFamily: 'account-options',
    componentPath: 'src/app/screens/cards/CardOptionsScreen.tsx',
    features: [],
    screenshots: [],
    similarTo: ['pi.card.detail', 'pi.card.details-info'],
  },
} satisfies Partial<Record<ScreenId, ScreenMeta>>
