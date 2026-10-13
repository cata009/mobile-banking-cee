import type { ReactNode } from 'react'
import type { PfmCategoryName } from '@/data/pfmCategories'

export type ExpenseDonutCategory = string

export interface ExpenseDonutSegment {
  category: ExpenseDonutCategory
  label: string
  total: number
  colorVar: string
  iconCategory?: PfmCategoryName
  /** Overrides the arc's marker where the split has its own mark, e.g. a currency roundel. */
  icon?: ReactNode
  /**
   * Text drawn in the marker instead of an icon — used by the Other arc, whose
   * three-dot glyph read as "more options" everywhere else in the app rather
   * than "the categories not drawn here".
   */
  markerLabel?: string
}

export interface ExpenseBar {
  key: string
  /** Primary axis label, e.g. the day number or the month short name. */
  label: string
  /** Optional secondary line above the label, e.g. the week ordinal. */
  caption?: string
  /** Names the bucket outside the chart (header, filter chip) when the axis pair reads too long there. */
  filterLabel?: string
  /** The same name without its year, for the period stepper that already prints the year below. */
  filterTitle?: string
  total: number
  /**
   * How much of a full bucket this bar covers, 0–1. Defaults to a whole one.
   *
   * A month's last "week" is two or three days, and drawn at full width beside
   * four seven-day bars it read as a collapse in spending rather than a shorter
   * period. The height still carries the amount — the width now carries the span.
   */
  weight?: number
}
