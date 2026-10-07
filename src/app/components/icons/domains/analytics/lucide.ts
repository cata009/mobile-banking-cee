import { PieChart, BarChart3 } from 'lucide-react'
import type { LucideIconDefinition } from '../../iconTypes'

export const ANALYTICS_LUCIDE_ICONS = {
  'chart-donut': {
    source: 'lucide',
    label: 'Donut chart',
    category: 'External Lucide',
    width: 24,
    height: 24,
    component: PieChart,
    usage: ['Evo2027AnalyticsScreen expense chart mode toggle'],
  },
  'chart-bars': {
    source: 'lucide',
    label: 'Bar chart',
    category: 'External Lucide',
    width: 24,
    height: 24,
    component: BarChart3,
    usage: ['Evo2027AnalyticsScreen expense chart mode toggle'],
  },
} satisfies Record<string, LucideIconDefinition>
