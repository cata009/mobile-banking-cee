import type { Screen } from '@/app/contexts/NavigationContext'
import type {
  CapabilityStatus,
  ComponentId,
  CountryId,
  DesignSystemId,
  FeatureId,
  FlowId,
  ProductId,
  ReleaseId,
  ScreenId,
} from '@/app/state/demoTypes'
import type { TemplateCodePreviewId } from '@/app/components/templates/templateData'

export interface ComponentMeta {
  id: ComponentId
  label: string
  products: readonly ProductId[]
  designSystems: readonly DesignSystemId[]
  status: CapabilityStatus
  componentPath: string
  usedByScreens: readonly ScreenId[]
  notes?: string
}

export type LayoutFamily =
  | 'prelogin'
  | 'co-apping'
  | 'dashboard'
  | 'analytics'
  | 'messages'
  | 'account-detail'
  | 'account-options'
  | 'payments'
  | 'payment-flow'
  | 'investments'
  | 'products'
  | 'prime'
  | 'service-menu'
  | 'contacts'
  | 'kids'
  | 'design-system'
  | 'flow-library'
  | 'tools'

export interface ScreenMeta {
  id: ScreenId
  label: string
  runtimeScreen: Screen
  products: readonly ProductId[]
  countries: readonly CountryId[]
  designSystems: readonly DesignSystemId[]
  releases?: readonly ReleaseId[]
  status: CapabilityStatus
  layoutFamily: LayoutFamily
  componentPath: string
  features: readonly FeatureId[]
  screenshots: readonly string[]
  similarTo: readonly ScreenId[]
}

export type TemplateReuseRole =
  'runtime-screen' | 'screen-state' | 'flow-step' | 'modal' | 'feedback' | 'standalone-pattern'

export type TemplateReuseContract = {
  role: TemplateReuseRole
  dataSources: readonly string[]
  assemblyRules: readonly string[]
  forbiddenPatterns: readonly string[]
}

export type TemplateRegistryItem = {
  id: string
  name: string
  sourcePath: string
  imageSrc?: string
  width: number
  height: number
  format: 'png' | 'jpg' | 'code'
  sourceKind?: 'screenshot' | 'code-only'
  products: readonly ProductId[]
  countries: readonly CountryId[]
  designSystems: readonly DesignSystemId[]
  screenFamily: LayoutFamily
  standalonePage: boolean
  runtimeScreenId?: ScreenId
  relatedScreens: readonly ScreenId[]
  flowIds: readonly FlowId[]
  relatedComponents: readonly ComponentId[]
  codePreviewId?: TemplateCodePreviewId
  implementationPath?: string
  implementationStatus?: 'source-only' | 'reconstructed-code'
  reuseNotes?: string[]
  reuseContract: TemplateReuseContract
}
