import type { ComponentId } from '@/app/state/demoTypes'
import type { ComponentMeta } from '../contracts'

export const IDENTITY_COMPONENTS = {
  'prelogin.inactive': {
    id: 'prelogin.inactive',
    label: 'Pre-login inactive composition',
    products: ['PI'],
    designSystems: ['current'],
    status: 'partial',
    componentPath: 'src/app/components/PreLoginScreen.tsx',
    usedByScreens: ['pi.prelogin.inactive'],
  },
  'prelogin.active': {
    id: 'prelogin.active',
    label: 'Pre-login active composition',
    products: ['PI'],
    designSystems: ['current'],
    status: 'partial',
    componentPath: 'src/app/components/PreLoginActiveScreen.tsx',
    usedByScreens: ['pi.prelogin.active'],
  },
  'prelogin.language-selector': {
    id: 'prelogin.language-selector',
    label: 'Language selector',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/LanguageSelector.tsx',
    usedByScreens: ['pi.prelogin.inactive', 'pi.prelogin.active'],
    notes: 'Country-aware local/English language selector used by pre-login templates.',
  },
  'prelogin.other-panel': {
    id: 'prelogin.other-panel',
    label: 'Other panel menu',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/PanelWithTranslations.tsx',
    usedByScreens: ['pi.prelogin.inactive', 'pi.prelogin.active'],
    notes:
      'Translated pre-login panel pattern for Smart Banking, exchange rates, ATM/branches, and Co-Apping entry rows.',
  },
  'prelogin.other-panel-basic': {
    id: 'prelogin.other-panel-basic',
    label: 'Other panel menu (no Co-Apping)',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/PanelWithoutCoAppingTranslations.tsx',
    usedByScreens: ['pi.prelogin.inactive'],
    notes:
      'Pre-login panel variant for countries where Co-Apping is unavailable: Smart Banking, exchange rates, and ATM/branches rows only, without the Co-Apping entry row.',
  },
  'co-apping.floating-button': {
    id: 'co-apping.floating-button',
    label: 'Co-Apping floating button',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/FloatingCoAppingButton.tsx',
    usedByScreens: ['pi.home.overview', 'pi.more.overview', 'pi.contacts.overview'],
  },
  'co-apping.session-entry': {
    id: 'co-apping.session-entry',
    label: 'Co-Apping session entry',
    products: ['PI'],
    designSystems: ['current'],
    status: 'partial',
    componentPath: 'src/app/components/CoAppingSessionScreen.tsx',
    usedByScreens: ['pi.co-apping.session'],
  },
} satisfies Partial<Record<ComponentId, ComponentMeta>>
