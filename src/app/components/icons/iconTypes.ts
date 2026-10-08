/**
 * Shape of an entry in the app icon registry.
 *
 * Extracted from AppIcon.tsx so the icon data modules and the component can
 * share one definition without importing each other.
 */
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export type IconCategory =
  'Header' | 'Navigation' | 'Payments' | 'Accounts' | 'Contacts' | 'Prime' | 'Actions' | 'System' | 'External Lucide'

export type BaseIconDefinition = {
  label: string
  category: IconCategory
  usage: string[]
  notes?: string
}

export type CustomIconDefinition = BaseIconDefinition & {
  source: 'custom'
  viewBox: string
  width: number
  height: number
  render: () => ReactNode
}

export type LucideIconDefinition = BaseIconDefinition & {
  source: 'lucide'
  component: LucideIcon
  width: number
  height: number
  strokeWidth?: number
}

export type IconDefinition = CustomIconDefinition | LucideIconDefinition

/** Fail fast on invalid glyph metadata before inventory/export consumers render it. */
export function validateIconDefinition(name: string, definition: IconDefinition): void {
  if (!definition.label.trim()) throw new Error(`${name}: missing label`)
  if (!definition.usage.length || definition.usage.some((usage) => !usage.trim()))
    throw new Error(`${name}: missing usage`)
  if (
    !Number.isFinite(definition.width) ||
    definition.width <= 0 ||
    !Number.isFinite(definition.height) ||
    definition.height <= 0
  )
    throw new Error(`${name}: invalid dimensions`)
  if (definition.source === 'custom') {
    const bounds = definition.viewBox.trim().split(/\s+/).map(Number)
    if (
      bounds.length !== 4 ||
      bounds.some((value) => !Number.isFinite(value)) ||
      (bounds[2] ?? 0) <= 0 ||
      (bounds[3] ?? 0) <= 0
    )
      throw new Error(`${name}: invalid viewBox`)
    if (typeof definition.render !== 'function') throw new Error(`${name}: missing render`)
  } else if (
    definition.strokeWidth !== undefined &&
    (!Number.isFinite(definition.strokeWidth) || definition.strokeWidth <= 0)
  ) {
    throw new Error(`${name}: invalid strokeWidth`)
  }
}
