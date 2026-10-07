import { defineTemplate } from '../templateDefaults'
import type { TemplateRegistryItem } from '../contracts'
export const HOME_TEMPLATES: readonly TemplateRegistryItem[] = [
  defineTemplate({
    id: 'template-home-dashboard-code',
    name: 'Home dashboard',
    sourcePath: 'src/app/components/templates/TemplateCodePreviews.tsx::home-dashboard',
    width: 377,
    height: 814,
    format: 'code',
    sourceKind: 'code-only',
    screenFamily: 'dashboard',
    runtimeScreenId: 'pi.home.overview',
    relatedScreens: ['pi.home.overview', 'platform.design-system'],
    flowIds: ['pi.prelogin-to-home.active'],
    relatedComponents: [
      'home.account-summary',
      'accounts.transaction-search',
      'accounts.transaction-row',
      'shell.bottom-navigation',
      'icons.app-icon',
      'templates.reconstructed-code',
    ],
    codePreviewId: 'home-dashboard',
    implementationPath: 'src/app/components/templates/TemplateCodePreviews.tsx',
    implementationStatus: 'reconstructed-code',
    reuseNotes: [
      'Code-only template derived from the active Home/account summary family, so it can seed future dashboard flows without a PNG source.',
      'Reuses the top header action rail, account balance card, shortcut pattern, transaction rows, product cards, and bottom navigation primitives.',
    ],
  }),
]
