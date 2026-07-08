/**
 * Mocked brand-logo database.
 *
 * This is the single source of truth for brand logos that can be reused across
 * products (investment products, product detail pages, cards, etc.). It is a
 * front-end mock: logos are stored as raw SVG markup keyed by a stable id and
 * rendered through {@link BrandLogo}.
 *
 * Add new logos by appending an entry to {@link BRAND_LOGOS}. Each entry should
 * describe the brand so callers can pick a logo by id without embedding SVG.
 */

export type BrandLogoId = "unicredit";

export interface BrandLogoEntry {
  /** Stable identifier referenced from product/securitity config. */
  id: BrandLogoId;
  /** Human-readable brand name, for docs/debugging only. */
  name: string;
  /**
   * Raw SVG markup authored at a logical 40x40 box. Rendered verbatim inside a
   * 40x40 container so callers never need to know the artwork.
   */
  svg: string;
}

export const BRAND_LOGOS: Record<BrandLogoId, BrandLogoEntry> = {
  unicredit: {
    id: "unicredit",
    name: "UniCredit",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
  <path d="M20.4716 10.6812C20.4716 10.6812 20.4716 10.5722 20.8 10.1362C21.1285 9.70026 21.019 9.37328 20.8 9.1553C20.6906 9.04631 17.5158 7.19345 17.5158 7.19345C17.2969 7.08446 17.1874 6.75748 17.1874 6.5395C17.1874 6.10353 17.5158 5.77656 18.0632 5.55858C20.0337 5.01362 27.1495 4.68664 29.558 4.68664C30.3243 4.68664 31.638 4.68664 32.8422 4.68664C32.9517 4.68664 32.9517 4.68664 32.9517 4.68664C29.4485 1.74387 24.9601 0 20.0337 0C8.97686 0 0 8.93732 0 19.9455C0 24.7411 1.75158 29.2098 4.59791 32.6975C7.11581 28.9918 13.3558 20.2725 14.6695 18.4196C16.3116 16.0218 20.4716 10.6812 20.4716 10.6812Z" fill="#E2001A"/>
  <path d="M38.4254 11.9891C39.4107 11.0082 40.0675 10.1362 39.9581 9.3733C39.8486 7.30246 37.3307 5.66759 37.3307 5.66759C37.3307 5.66759 37.3307 5.66759 37.2212 5.55859C37.3307 5.66759 37.4402 5.77658 37.5496 5.99456C38.2065 7.52044 37.1117 8.50137 36.4549 9.15532C36.1265 9.48229 30.9812 14.2779 24.9601 19.5095C19.7054 24.0872 13.7938 28.7738 10.2906 31.3896C5.47376 34.9863 4.48849 35.5313 4.48849 35.5313C4.37902 35.6403 4.16007 35.6403 3.94112 35.6403C3.6127 35.6403 3.39375 35.4223 3.1748 35.2043C3.1748 35.3133 3.1748 35.6403 3.6127 36.1853L3.83165 36.4032C4.16007 36.7302 4.59797 37.2752 5.25481 37.7111C6.24008 38.5831 6.67797 38.1471 8.75798 36.6212C11.9327 38.6921 15.7643 40 19.9243 40C30.9812 40 39.9581 31.0626 39.9581 20.0545C40.177 17.1117 39.5202 14.3869 38.4254 11.9891Z" fill="#E2001A"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M20.8002 10.1361C21.1286 9.70014 21.0192 9.37317 20.8002 9.15518C20.6907 9.04619 17.516 7.19333 17.516 7.19333C17.297 7.08434 17.1876 6.75737 17.1876 6.53938C17.1876 6.10342 17.516 5.77644 18.0634 5.55846C20.0339 5.0135 27.1497 4.68652 29.5581 4.68652C30.6529 4.68652 32.9518 4.68652 34.375 4.79552C36.0171 4.90451 37.3308 5.23148 37.5497 5.99442C38.2066 7.52031 37.1118 8.50123 36.455 9.15518C36.1266 9.48216 30.9813 14.2778 24.9602 19.5094C19.7055 24.087 13.7939 28.7737 10.2907 31.3895C5.47386 34.9862 4.48859 35.5312 4.48859 35.5312C4.37912 35.6402 4.16017 35.6402 3.94122 35.6402C3.39385 35.6402 3.06543 35.3132 3.06543 34.7682C3.06543 34.5502 3.1749 34.4413 3.1749 34.2233C3.1749 34.2233 12.6991 20.5993 14.3412 18.3105C16.0928 16.0217 20.2528 10.6811 20.2528 10.6811C20.2528 10.6811 20.4718 10.5721 20.8002 10.1361Z" fill="white"/>
</svg>`,
  },
};

/**
 * Returns the brand-logo entry for a given id, or null when no logo is mapped.
 * Callers should treat a null result as "no logo available" and skip rendering.
 */
export function getBrandLogo(id: BrandLogoId | string | undefined): BrandLogoEntry | null {
  if (!id) return null;
  return (BRAND_LOGOS as Record<string, BrandLogoEntry>)[id] ?? null;
}
