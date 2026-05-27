"use client"

import { useState } from "react"

// Base path for PFM icons - local assets folder
const ASSETS_BASE = "/assets/mobile-banking"

// Category colors mapping - UniCredit brand colors
export const CATEGORY_COLORS: Record<string, string> = {
  "Taxes and Penalties": "#7757A4",
  Income: "#3D7D43",
  Utilities: "#546100",
  "Exclude from budget": "#535453",
  Shopping: "#AA4B22",
  Insurance: "#359F42",
  Groceries: "#A33694",
  Home: "#899E00",
  Education: "#5E3D32",
  Lifestyle: "#DD1860",
  Transportation: "#0D5870",
  "Leisure time": "#004F95",
  Healthcare: "#E30000",
  Cash: "#7E5B01",
  Investments: "#004C3D",
  Children: "#004F95",
  Wallet: "#AA4B22",
  Transfers: "#0D5870",
  Finance: "#004C3D",
  Uncategorized: "#01315C",
  ATM: "#388BCA",
  FX: "#244858",
  Internal: "#0D5870",
}

// ============================================================================
// CATEGORY TO FILENAME MAPPING
// ============================================================================

/**
 * Maps category names (as used in transaction data) to exact PFM icon filenames.
 *
 * File naming convention: PFM-{Category}.svg where spaces are PRESERVED (not underscores)
 * Example: "Leisure time" -> "PFM-Leisure time.svg"
 */
const CATEGORY_TO_FILENAME: Record<string, string> = {
  // Categories with spaces - keep spaces as-is (files have spaces in names)
  "Taxes and Penalties": "Taxes and Penalties",
  "Leisure time": "Leisure time",
  "Exclude from budget": "Exclude from budget",

  // Single-word categories - direct mapping
  Income: "Income",
  Utilities: "Utilities",
  Shopping: "Shopping",
  Insurance: "Insurance",
  Groceries: "Groceries",
  Home: "Home",
  Education: "Education",
  Lifestyle: "Lifestyle",
  Transportation: "Transportation",
  Healthcare: "Healthcare",
  Cash: "Cash",
  Investments: "Investments",
  Children: "Children",
  Wallet: "Wallet",
  Transfers: "Transfers",
  Finance: "Finance",
  Uncategorized: "Uncategorized",
  ATM: "ATM",
  FX: "FX",
  Internal: "Internal",

  // Common variant mappings (if data uses different names)
  Leisure: "Leisure time",
  Taxes: "Taxes and Penalties",
  Tax: "Taxes and Penalties",
  Exclude: "Exclude from budget",
  Excluded: "Exclude from budget",
}

/**
 * Resolves a category name to the exact local PFM icon URL.
 * Uses explicit mapping first, then uses category name directly.
 */
export function getPfmIconUrl(category: string): string {
  const c = (category || "Uncategorized").trim()

  // Try exact mapping first
  const mapped = CATEGORY_TO_FILENAME[c]
  if (mapped) {
    return `${ASSETS_BASE}/PFM-${mapped}.svg`
  }

  // Fallback: use category name directly (no underscore conversion)
  return `${ASSETS_BASE}/PFM-${c}.svg`
}

/**
 * Get the Uncategorized fallback icon URL
 */
export function getUncategorizedIconUrl(): string {
  return `${ASSETS_BASE}/PFM-Uncategorized.svg`
}

/**
 * Get the color for a PFM category
 */
export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS["Uncategorized"]
}

// ============================================================================
// PFM ICON COMPONENT
// ============================================================================

interface PfmIconProps {
  /** The PFM category name */
  category: string
  /** Fallback initial letter to show if icon fails to load */
  fallbackInitial: string
  /** Size in pixels (default: 28) */
  size?: number
}

type FallbackStage = "category" | "uncategorized" | "initials"

/**
 * PFM Category Icon Component
 *
 * Renders a PFM category icon with robust fallback:
 * 1. Try exact category icon: PFM-{Category}.svg
 * 2. If 404 -> try PFM-Uncategorized.svg
 * 3. If still fails -> show initials circle
 */
export function PfmIcon({ category, fallbackInitial, size = 28 }: PfmIconProps) {
  const [stage, setStage] = useState<FallbackStage>("category")

  const categoryUrl = getPfmIconUrl(category)
  const uncategorizedUrl = getUncategorizedIconUrl()

  // Show initials as final fallback
  if (stage === "initials") {
    return (
      <span
        style={{
          color: "#FFFFFF",
          fontSize: `${Math.floor(size * 0.5)}px`,
          fontWeight: 700,
          width: `${size}px`,
          height: `${size}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {fallbackInitial}
      </span>
    )
  }

  const currentUrl = stage === "category" ? categoryUrl : uncategorizedUrl

  const handleError = () => {
    if (stage === "category") {
      setStage("uncategorized")
    } else {
      setStage("initials")
    }
  }

  return (
    <img
      src={currentUrl || "/placeholder.svg"}
      alt={category}
      width={size}
      height={size}
      style={{
        display: "block",
        width: `${size}px`,
        height: `${size}px`,
        objectFit: "contain",
      }}
      onError={handleError}
    />
  )
}

// ============================================================================
// PFM ICON WITH BACKGROUND CIRCLE
// ============================================================================

interface PfmIconWithBackgroundProps extends PfmIconProps {
  /** Override the background color (default: uses category color) */
  backgroundColor?: string
  /** Circle size in pixels (default: 32) */
  circleSize?: number
}

/**
 * PFM Icon wrapped in a colored circle background.
 * This is the typical rendering for transaction lists.
 */
export function PfmIconWithBackground({
  category,
  fallbackInitial,
  size = 28,
  circleSize = 32,
  backgroundColor,
}: PfmIconWithBackgroundProps) {
  const bgColor = backgroundColor || CATEGORY_COLORS[category] || CATEGORY_COLORS["Uncategorized"]

  return (
    <div
      className="flex justify-center items-center flex-shrink-0"
      style={{
        width: `${circleSize}px`,
        height: `${circleSize}px`,
        borderRadius: "120px",
        backgroundColor: bgColor,
      }}
    >
      <PfmIcon category={category} fallbackInitial={fallbackInitial} size={size} />
    </div>
  )
}
