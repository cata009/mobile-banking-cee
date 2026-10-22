import type { Screen } from '@/app/navigation/screenTypes'
import type {
  CapabilityStatus,
  ComponentId,
  CountryId,
  DesignSystemId,
  FeatureId,
  ProductId,
  ReleaseId,
  ScreenId,
} from '@/app/state/demoTypes'

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
