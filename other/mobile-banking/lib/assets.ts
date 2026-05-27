/**
 * Local Asset Paths - Mobile Banking Demo
 * 
 * All external GitHub URLs have been migrated to local /assets/ paths.
 * This ensures the app works on corporate networks that block raw.githubusercontent.com
 * 
 * IMPORTANT: Never use external URLs for assets in this app.
 * Always use the helper functions exported from this file.
 */

// Base path prefix (for Netlify/Vercel subpath deployments)
const BASE_PREFIX = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

// Base path for all mobile banking assets (served from /public/assets/mobile-banking/)
export const ASSETS_BASE = `${BASE_PREFIX}/assets/mobile-banking`

// Stable alias for mf-icons (same folder)
export const MF_ICONS_BASE = ASSETS_BASE

// ============================================================================
// GENERIC HELPER FUNCTIONS
// ============================================================================

/**
 * Get the local path for any icon by name.
 * @param name - The icon filename (with or without extension)
 * @returns Local path to the icon
 */
export function getIconPath(name: string): string {
  // Add .svg extension if not present
  const filename = name.includes(".") ? name : `${name}.svg`
  return `${ASSETS_BASE}/${filename}`
}

/**
 * Get the local path for any image by name.
 * @param name - The image filename (with extension)
 * @returns Local path to the image
 */
export function getImagePath(name: string): string {
  return `${ASSETS_BASE}/${name}`
}

// ============================================================================
// STATIC ICON PATHS - Direct file references
// ============================================================================

export const ICONS = {
  // App icons - using real JPG images
  APP_ICON: `${MF_ICONS_BASE}/ro-app-icon.jpg`,
  
  // Bank/Brand
  UNICREDIT_BANK: `${MF_ICONS_BASE}/UnicreditBank.svg`,
  
  // UI Icons (K10 series)
  BACK: `${MF_ICONS_BASE}/Back_K10.svg`,
  CLOSE: `${MF_ICONS_BASE}/Close_K10.svg`,
  COPY: `${MF_ICONS_BASE}/Copy_K10.svg`,
  FAQ: `${MF_ICONS_BASE}/FAQ_K10.svg`,
  FILTER: `${MF_ICONS_BASE}/Filter_K10.svg`,
  HIDE: `${MF_ICONS_BASE}/Hide_K10.svg`,
  PAYMENTS: `${MF_ICONS_BASE}/Payments_K10.svg`,
  PAYMENTS_WHITE: `${MF_ICONS_BASE}/Payments_White.svg`,
  PFM: `${MF_ICONS_BASE}/PFM_K10.svg`,
  SEARCH: `${MF_ICONS_BASE}/Search_K10.svg`,
  SETTINGS: `${MF_ICONS_BASE}/Settings_K10.svg`,
  SHOW: `${MF_ICONS_BASE}/Show_K10.svg`,
  BANK: `${MF_ICONS_BASE}/Bank_K10.svg`,
  EXCLUDED_TRANSACTIONS: `${MF_ICONS_BASE}/Excluded_transactions_K10.svg`,
  QUICK_MENU: `${MF_ICONS_BASE}/Quick_menu_K10.svg`,
  
  // FAB drawer icons
  NEW_PAYMENT: `${MF_ICONS_BASE}/New_Payment.svg`,
  ACCOUNT: `${MF_ICONS_BASE}/Account.svg`,
  MOVE_MONEY: `${MF_ICONS_BASE}/Move_Money.svg`,
  MORE_OPTIONS: `${MF_ICONS_BASE}/More_Options.svg`,
  
  // Misc
  DOWN: `${MF_ICONS_BASE}/down.svg`,
  PROFILE: `${MF_ICONS_BASE}/Profile.jpg`,
  LOGO_A: `${MF_ICONS_BASE}/logo-a.svg`,
} as const

// ============================================================================
// PRODUCT IMAGES
// ============================================================================

export const PRODUCT_IMAGES = {
  IMAGE_0: `${MF_ICONS_BASE}/image-0.jpg`,
  IMAGE_1: `${MF_ICONS_BASE}/image-1.jpg`,
  IMAGE_2: `${MF_ICONS_BASE}/image-2.jpg`,
  IMAGE_3: `${MF_ICONS_BASE}/image-3.jpg`,
  IMAGE_4: `${MF_ICONS_BASE}/image-4.jpg`,
} as const

// ============================================================================
// SHOPSMART IMAGES
// ============================================================================

export function getShopsmartImage(filename: string): string {
  return `${MF_ICONS_BASE}/${filename}`
}

// ============================================================================
// PFM CATEGORY ICONS (Dynamic)
// ============================================================================

/**
 * Get local path for a PFM category icon.
 * Handles spaces by converting to underscores for local file names.
 * 
 * @param category - The PFM category name (e.g., "Leisure time", "Uncategorized")
 * @returns Local path to the SVG icon
 */
export function getPfmIconPath(category: string): string {
  const c = (category || "Uncategorized").trim()
  // Convert spaces to underscores for local file naming
  const normalized = c.replace(/ /g, "_")
  return `${MF_ICONS_BASE}/PFM-${normalized}.svg`
}

// ============================================================================
// ASSET MIGRATION MAP (for reference)
// ============================================================================

/**
 * Complete mapping of old GitHub URLs to new local paths:
 * 
 * OLD (GitHub): https://raw.githubusercontent.com/cata009/mf-icons/main/[filename]
 * NEW (Local): /assets/mobile-banking/[filename]
 * 
 * Note: Files with spaces in names have been renamed:
 * - "Excluded%20transactions_K10.svg" -> "Excluded_transactions_K10.svg"
 * - "Quick%20menu_K10.svg" -> "Quick_menu_K10.svg"
 * - "New%20Payment.svg" -> "New_Payment.svg"
 * - "Move%20Money.svg" -> "Move_Money.svg"
 * - "More%20Options.svg" -> "More_Options.svg"
 * - "Leisure%20time" -> "Leisure_time" (in PFM icons)
 * - etc.
 */

// ============================================================================
// DEV-ONLY: EXTERNAL URL CHECK
// ============================================================================

/**
 * Dev-only utility to check if an asset URL is external.
 * Call this in useEffect or component mount to detect external URLs.
 * Only logs warnings in development mode.
 * 
 * @param url - The URL to check
 * @param context - Optional context string for the warning message
 */
export function warnIfExternalUrl(url: string, context?: string): void {
  if (process.env.NODE_ENV === "development") {
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      console.warn(
        `[Mobile Banking] External asset URL detected${context ? ` in ${context}` : ""}:`,
        url,
        "\nAll assets should use local paths (/assets/mobile-banking/...)"
      )
    }
  }
}

/**
 * Check multiple URLs for external references (dev-only).
 * @param urls - Array of URLs to check
 * @param context - Optional context string
 */
export function warnIfAnyExternalUrls(urls: string[], context?: string): void {
  if (process.env.NODE_ENV === "development") {
    urls.forEach((url) => warnIfExternalUrl(url, context))
  }
}
