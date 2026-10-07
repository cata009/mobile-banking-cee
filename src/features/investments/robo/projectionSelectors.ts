import { type RoboStrategy } from '@/features/investments/robo/types'

export const PROJECTION_RATES: Record<RoboStrategy['id'], readonly [number, number, number]> = {
  'sustainable-balanced': [1, 4.2, 6.5],
  'balanced-core': [0.8, 3.8, 6],
  'steady-income': [0.5, 2.6, 4.5],
}

export function calculateProjectedValue(initial: number, monthly: number, years: number, annualRate: number): number {
  const months = Math.max(1, years * 12)
  const monthlyRate = annualRate / 100 / 12
  if (monthlyRate === 0) return initial + monthly * months
  const growth = (1 + monthlyRate) ** months
  return initial * growth + monthly * ((growth - 1) / monthlyRate)
}

export function projectionPath(values: readonly number[], maxValue: number): string {
  const endValue = values.at(-1) ?? 0
  const endY = 168 - (endValue / maxValue) * 148
  const middleY = 168 - (168 - endY) * 0.38
  return `M 54 168 C 112 166, 184 ${middleY}, 244 ${endY}`
}

export function buildRoboProjection(strategy: RoboStrategy, initial = 50000, monthly = 2000, years = 10) {
  const rates = PROJECTION_RATES[strategy.id]
  const pointsByScenario = rates.map((rate) =>
    Array.from({ length: 6 }, (_, index) => calculateProjectedValue(initial, monthly, (years * index) / 5, rate)),
  )
  const values = pointsByScenario.map((points) => Math.round(points.at(-1) ?? 0))
  const maxValue = Math.max(50000, Math.ceil(Math.max(...values) / 50000) * 50000)
  const tickYears = Array.from({ length: 6 }, (_, index) => 2025 + Math.round((years * index) / 5))
  return { rates, pointsByScenario, values, maxValue, tickYears }
}
