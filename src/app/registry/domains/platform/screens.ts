import type { ScreenId } from '@/app/state/demoTypes'
import type { ScreenMeta } from '../contracts'
import { ALL_COUNTRIES } from '../countries'

export const PLATFORM_SCREENS = {
  'platform.design-system': {
    id: 'platform.design-system',
    label: 'Design system inventory',
    runtimeScreen: 'design-system',
    products: ['PI'],
    countries: ALL_COUNTRIES,
    designSystems: ['current'],
    status: 'partial',
    layoutFamily: 'design-system',
    componentPath: 'src/app/screens/design-system/DesignSystemPage.tsx',
    features: [],
    screenshots: [],
    similarTo: [],
  },
  'platform.flow-library': {
    id: 'platform.flow-library',
    label: 'Future flow library',
    runtimeScreen: 'flow-library',
    products: ['PI'],
    countries: ['RO'],
    designSystems: ['current'],
    status: 'mock-driven',
    layoutFamily: 'flow-library',
    componentPath: 'src/app/screens/flow-library/FlowLibraryScreen.tsx',
    features: [],
    screenshots: [],
    similarTo: ['pi.products.overview', 'pi.account.detail', 'platform.design-system'],
  },
  'platform.tools': {
    id: 'platform.tools',
    label: 'Stakeholder tools',
    runtimeScreen: 'tools',
    products: ['PI'],
    countries: ALL_COUNTRIES,
    designSystems: ['current'],
    status: 'implemented',
    layoutFamily: 'tools',
    componentPath: 'src/app/screens/tools/ToolsScreen.tsx',
    features: [],
    screenshots: [],
    similarTo: ['platform.design-system', 'platform.flow-library'],
  },
} satisfies Partial<Record<ScreenId, ScreenMeta>>
