import { Camera, Figma, Download } from 'lucide-react'
import type { LucideIconDefinition } from '../../iconTypes'

export const PLATFORM_LUCIDE_ICONS = {
  camera: {
    source: 'lucide',
    label: 'Camera',
    category: 'External Lucide',
    width: 24,
    height: 24,
    component: Camera,
    usage: ['DomesticPaymentFlowScreens', 'DemoTopBar', 'ToolsScreen', 'PreloginPictureTesterTool'],
  },
  figma: {
    source: 'lucide',
    label: 'Figma',
    category: 'External Lucide',
    width: 20,
    height: 20,
    component: Figma,
    usage: ['FlowLibraryScreen source action'],
  },
  download: {
    source: 'lucide',
    label: 'Download',
    category: 'Actions',
    width: 20,
    height: 20,
    component: Download,
    usage: ['DesignSystemPage Icons inventory'],
  },
} satisfies Record<string, LucideIconDefinition>
